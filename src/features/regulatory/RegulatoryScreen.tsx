import { useEffect, useMemo, useState } from 'react';

import { api } from '../../api/client';
import { I } from '../../components/Icons';
import { fmtRelativeFrom } from '../../lib/helpers';
import {
    REGULATORY_AMENDMENTS,
    type AmendmentSeverity,
    type AmendmentStatus,
    type RegulatoryAmendmentRow,
} from '../../lib/mock-data';

type StatusFilter = 'all' | AmendmentStatus;
type SeverityFilter = 'all' | AmendmentSeverity;

const SEVERITY_COLOR: Record<AmendmentSeverity, string> = {
    critical: 'var(--sev-critical)',
    high: 'var(--sev-high)',
    medium: 'var(--sev-medium)',
    low: 'var(--sev-low)',
};

const STATUS_LABEL: Record<AmendmentStatus, string> = {
    pending: 'Pending triage',
    triaged: 'Triaged',
    resolved: 'Resolved',
    ignored: 'Ignored',
};

const STATUS_COLOR: Record<AmendmentStatus, string> = {
    pending: 'var(--sev-high)',
    triaged: 'var(--sev-medium)',
    resolved: 'var(--sev-low)',
    ignored: 'var(--muted)',
};

type FetchOutcome =
    | { kind: 'ok'; rows: RegulatoryAmendmentRow[] }
    | { kind: 'unauthorized' }
    | { kind: 'server-error'; status?: number }
    | { kind: 'network-error' };

async function fetchAmendments(signal: AbortSignal): Promise<FetchOutcome> {
    try {
        const response = await api.get<
            | { data?: { data?: RegulatoryAmendmentRow[] } }
            | { data?: RegulatoryAmendmentRow[] }
            | RegulatoryAmendmentRow[]
        >('/regulatory-amendments', { signal });
        const payload = response.data as unknown;
        if (Array.isArray(payload)) {
            return { kind: 'ok', rows: payload };
        }
        if (payload && typeof payload === 'object' && 'data' in payload) {
            const inner = (payload as { data: unknown }).data;
            if (Array.isArray(inner)) {
                return { kind: 'ok', rows: inner as RegulatoryAmendmentRow[] };
            }
            if (
                inner &&
                typeof inner === 'object' &&
                'data' in (inner as object) &&
                Array.isArray((inner as { data: unknown }).data)
            ) {
                return {
                    kind: 'ok',
                    rows: (inner as { data: RegulatoryAmendmentRow[] }).data,
                };
            }
        }

        return { kind: 'server-error' };
    } catch (error: unknown) {
        const err = error as { response?: { status?: number } } | undefined;
        const httpStatus = err?.response?.status;
        if (httpStatus === 401 || httpStatus === 403) {
            return { kind: 'unauthorized' };
        }
        if (typeof httpStatus === 'number') {
            return { kind: 'server-error', status: httpStatus };
        }

        return { kind: 'network-error' };
    }
}

type FetchState =
    | { kind: 'fixture' }
    | { kind: 'live' }
    | { kind: 'error'; message: string };

export function RegulatoryScreen() {
    const [amendments, setAmendments] = useState<RegulatoryAmendmentRow[]>(REGULATORY_AMENDMENTS);
    const [fetchState, setFetchState] = useState<FetchState>({ kind: 'fixture' });
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [pollState, setPollState] = useState<{
        loading: boolean;
        message: string | null;
    }>({ loading: false, message: null });
    const [triageError, setTriageError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        void fetchAmendments(controller.signal).then((outcome) => {
            // If the effect was torn down (navigation / fast remount)
            // before the fetch resolved, skip every setState — the
            // component is unmounted and applying state would flash
            // the network-error banner on the NEXT mount. Copilot
            // iter-1 review on PR #7.
            if (controller.signal.aborted) {
                return;
            }
            if (outcome.kind === 'ok') {
                setAmendments(outcome.rows);
                setFetchState({ kind: 'live' });

                return;
            }
            if (outcome.kind === 'unauthorized') {
                setAmendments([]);
                setSelectedId(null);
                setFetchState({
                    kind: 'error',
                    message: 'Cannot load regulatory amendments — not authorized.',
                });

                return;
            }
            if (outcome.kind === 'server-error') {
                const suffix = outcome.status ? ` (HTTP ${outcome.status})` : '';
                setAmendments([]);
                setSelectedId(null);
                setFetchState({
                    kind: 'error',
                    message: `Cannot load regulatory amendments — server error${suffix}.`,
                });

                return;
            }
            setFetchState({
                kind: 'error',
                message: 'Cannot load regulatory amendments — network unreachable.',
            });
        });

        return () => controller.abort();
    }, []);

    const filtered = useMemo(() => {
        return amendments.filter((row) => {
            if (statusFilter !== 'all' && row.status !== statusFilter) return false;
            if (severityFilter !== 'all' && row.severity !== severityFilter) return false;

            return true;
        });
    }, [amendments, statusFilter, severityFilter]);

    const selected = useMemo(
        () => (selectedId !== null ? amendments.find((r) => r.id === selectedId) ?? null : null),
        [amendments, selectedId],
    );

    const pendingCount = amendments.filter((r) => r.status === 'pending').length;
    const criticalCount = amendments.filter((r) => r.severity === 'critical').length;

    const triggerPoll = async () => {
        setPollState({ loading: true, message: null });
        try {
            const response = await api.post<{
                data?: { ingested: number; skipped: number; failures: Record<string, string> };
            }>('/regulatory-amendments/poll');
            const result = response.data?.data;
            if (result) {
                const failureCount = Object.keys(result.failures ?? {}).length;
                setPollState({
                    loading: false,
                    message: `Poll complete — ingested ${result.ingested}, skipped ${result.skipped}${
                        failureCount > 0 ? `, ${failureCount} driver failure(s)` : ''
                    }.`,
                });
            } else {
                setPollState({ loading: false, message: 'Poll complete.' });
            }
        } catch (error: unknown) {
            const err = error as { response?: { status?: number; data?: { error?: string } } };
            if (err.response?.status === 409) {
                setPollState({
                    loading: false,
                    message: 'Polling disabled — set AI_ACT_REGULATORY_FEED_ENABLED=true on the host.',
                });

                return;
            }
            setPollState({ loading: false, message: 'Poll failed. Try again.' });
        }
    };

    const updateStatus = async (id: number, nextStatus: AmendmentStatus) => {
        try {
            await api.patch(`/regulatory-amendments/${id}`, { status: nextStatus });
            // Optimistic update accepted by the server — clear any
            // prior triage error.
            setTriageError(null);
        } catch (error: unknown) {
            // The repo has no toast system; surface the error inline
            // via `triageError` state so the operator notices the
            // PATCH did not stick. Copilot iter-1 review on PR #7.
            const err = error as { response?: { status?: number } } | undefined;
            const statusCode = err?.response?.status;
            setTriageError(
                statusCode
                    ? `Failed to update amendment ${id} (HTTP ${statusCode}).`
                    : `Failed to update amendment ${id} — network unreachable.`,
            );

            return;
        }
        setAmendments((current) =>
            current.map((row) =>
                row.id === id
                    ? {
                          ...row,
                          status: nextStatus,
                          triagedAt: row.triagedAt ?? Date.now(),
                      }
                    : row,
            ),
        );
    };

    return (
        <div className="page" data-testid="regulatory-screen" data-state="ready">
            <div className="page-head">
                <div>
                    <h1 className="page-title">Regulatory amendments</h1>
                    <p className="page-sub">
                        EU AI Act feed · {amendments.length} entries · {pendingCount} pending /{' '}
                        {criticalCount} critical
                    </p>
                </div>
                <div className="page-actions">
                    <button
                        type="button"
                        className="btn"
                        data-testid="regulatory-poll-now"
                        onClick={() => void triggerPoll()}
                        disabled={pollState.loading}
                    >
                        {pollState.loading ? 'Polling…' : 'Poll now'}
                    </button>
                </div>
            </div>

            {fetchState.kind === 'error' && (
                <div
                    className="card mt-16"
                    role="alert"
                    data-testid="regulatory-fetch-error"
                    style={{
                        background: 'var(--bg-2)',
                        border: '1px solid var(--sev-critical)',
                        color: 'var(--sev-critical)',
                        padding: 12,
                    }}
                >
                    {fetchState.message}
                </div>
            )}

            {pollState.message && (
                <div
                    className="card mt-16"
                    role="status"
                    data-testid="regulatory-poll-feedback"
                    style={{ padding: 12 }}
                >
                    {pollState.message}
                </div>
            )}

            {triageError && (
                <div
                    className="card mt-16"
                    role="alert"
                    data-testid="regulatory-triage-error"
                    style={{
                        background: 'var(--bg-2)',
                        border: '1px solid var(--sev-critical)',
                        color: 'var(--sev-critical)',
                        padding: 12,
                    }}
                >
                    {triageError}
                </div>
            )}

            <div className="filter-bar" data-testid="regulatory-filter-bar">
                <div className="filter-group">
                    <label className="filter-label" htmlFor="regulatory-filter-status">
                        Status
                    </label>
                    <select
                        id="regulatory-filter-status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                        data-testid="regulatory-filter-status"
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="triaged">Triaged</option>
                        <option value="resolved">Resolved</option>
                        <option value="ignored">Ignored</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label" htmlFor="regulatory-filter-severity">
                        Severity
                    </label>
                    <select
                        id="regulatory-filter-severity"
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}
                        data-testid="regulatory-filter-severity"
                    >
                        <option value="all">All</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            <div className="card" data-testid="regulatory-table">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Published</th>
                            <th>Title</th>
                            <th>Clauses</th>
                            <th>Severity</th>
                            <th>Status</th>
                            <th aria-label="actions" />
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((row) => (
                            <tr
                                key={row.id}
                                onClick={() => setSelectedId(row.id)}
                                onKeyDown={(e) => {
                                    if (e.target !== e.currentTarget) return;
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setSelectedId(row.id);
                                    }
                                }}
                                tabIndex={0}
                                aria-label={`Open amendment ${row.title}`}
                                data-testid={`regulatory-table-row-${row.id}`}
                                style={{ cursor: 'pointer' }}
                            >
                                <td>
                                    <small>
                                        {row.publishedAt
                                            ? fmtRelativeFrom(row.publishedAt)
                                            : '—'}
                                    </small>
                                </td>
                                <td>
                                    <b style={{ color: 'var(--text)' }}>{row.title}</b>
                                </td>
                                <td>
                                    {row.impactedClauses.map((c) => (
                                        <span
                                            key={c}
                                            className="badge"
                                            style={{ marginRight: 4 }}
                                        >
                                            {c}
                                        </span>
                                    ))}
                                </td>
                                <td>
                                    <span
                                        className="badge"
                                        style={{
                                            background: `${SEVERITY_COLOR[row.severity]}24`,
                                            color: SEVERITY_COLOR[row.severity],
                                        }}
                                    >
                                        {row.severity}
                                    </span>
                                </td>
                                <td>
                                    <span
                                        className="badge"
                                        style={{
                                            background: `${STATUS_COLOR[row.status]}24`,
                                            color: STATUS_COLOR[row.status],
                                        }}
                                        data-testid={`regulatory-status-${row.id}`}
                                    >
                                        {STATUS_LABEL[row.status]}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button
                                        type="button"
                                        className="iconbtn"
                                        aria-label={`Open ${row.id}`}
                                        data-testid={`regulatory-open-${row.id}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedId(row.id);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.stopPropagation();
                                            }
                                        }}
                                    >
                                        <I.ChevronRight size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6}>
                                    <div className="empty" data-testid="regulatory-empty">
                                        No amendments match the current filters.
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selected && (
                <div
                    className="card mt-16"
                    data-testid={`regulatory-detail-${selected.id}`}
                >
                    <div className="card-head">
                        <div>
                            <h3 className="card-title">{selected.title}</h3>
                            <p className="card-sub">{selected.externalId}</p>
                        </div>
                        <button
                            type="button"
                            className="iconbtn"
                            onClick={() => setSelectedId(null)}
                            aria-label="Close"
                        >
                            <I.X size={14} />
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="kv-grid">
                            <div className="kv">
                                <span>Severity</span>
                                <b>{selected.severity}</b>
                            </div>
                            <div className="kv">
                                <span>Status</span>
                                <b>{STATUS_LABEL[selected.status]}</b>
                            </div>
                            <div className="kv">
                                <span>Source</span>
                                <b>
                                    <a
                                        href={selected.sourceUrl}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                    >
                                        {selected.sourceDriver}
                                    </a>
                                </b>
                            </div>
                            <div className="kv">
                                <span>Published</span>
                                <b>
                                    {selected.publishedAt
                                        ? fmtRelativeFrom(selected.publishedAt)
                                        : '—'}
                                </b>
                            </div>
                            <div className="kv">
                                <span>Ingested</span>
                                <b>{fmtRelativeFrom(selected.ingestedAt)}</b>
                            </div>
                            {selected.triagedAt && (
                                <div className="kv">
                                    <span>Triaged</span>
                                    <b>
                                        {fmtRelativeFrom(selected.triagedAt)}
                                        {selected.triagedBy ? ` · ${selected.triagedBy}` : ''}
                                    </b>
                                </div>
                            )}
                        </div>
                        {selected.summary && (
                            <p style={{ marginTop: 12 }}>{selected.summary}</p>
                        )}
                        {selected.triageNotes && (
                            <p style={{ marginTop: 12, fontStyle: 'italic' }}>
                                {selected.triageNotes}
                            </p>
                        )}
                        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                            {selected.status !== 'triaged' && (
                                <button
                                    type="button"
                                    className="btn sm"
                                    data-testid={`regulatory-triage-${selected.id}`}
                                    onClick={() => void updateStatus(selected.id, 'triaged')}
                                >
                                    Mark triaged
                                </button>
                            )}
                            {selected.status !== 'resolved' && (
                                <button
                                    type="button"
                                    className="btn sm"
                                    data-testid={`regulatory-resolve-${selected.id}`}
                                    onClick={() => void updateStatus(selected.id, 'resolved')}
                                >
                                    Mark resolved
                                </button>
                            )}
                            {selected.status !== 'ignored' && (
                                <button
                                    type="button"
                                    className="btn sm"
                                    data-testid={`regulatory-ignore-${selected.id}`}
                                    onClick={() => void updateStatus(selected.id, 'ignored')}
                                >
                                    Ignore
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
