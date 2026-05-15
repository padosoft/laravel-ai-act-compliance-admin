import { useEffect, useMemo, useState } from 'react';

import { api } from '../../api/client';
import { I } from '../../components/Icons';
import { fmtRelativeFrom } from '../../lib/helpers';
import {
    ALERT_DISPATCHES,
    type AlertChannel,
    type AlertDispatchRow,
    type AlertSeverity,
    type AlertStatus,
} from '../../lib/mock-data';

type ChannelFilter = 'all' | AlertChannel;
type SeverityFilter = 'all' | AlertSeverity;
type StatusFilter = 'all' | AlertStatus;

const SEVERITY_COLOR: Record<AlertSeverity, string> = {
    critical: 'var(--sev-critical)',
    high: 'var(--sev-high)',
    medium: 'var(--sev-medium)',
    low: 'var(--sev-low)',
};

const STATUS_LABEL: Record<AlertStatus, string> = {
    ok: 'Delivered',
    transient_failure: 'Transient fail',
    permanent_failure: 'Permanent fail',
};

const STATUS_COLOR: Record<AlertStatus, string> = {
    ok: 'var(--sev-low)',
    transient_failure: 'var(--sev-medium)',
    permanent_failure: 'var(--sev-critical)',
};

type FetchOutcome =
    | { kind: 'ok'; rows: AlertDispatchRow[] }
    | { kind: 'unauthorized' }
    | { kind: 'server-error'; status?: number }
    | { kind: 'network-error' };

async function fetchAlertDispatches(signal: AbortSignal): Promise<FetchOutcome> {
    try {
        const response = await api.get<{ data?: AlertDispatchRow[] } | AlertDispatchRow[]>(
            '/alerts/dispatches',
            { signal },
        );
        const payload = response.data;
        if (Array.isArray(payload)) {
            return { kind: 'ok', rows: payload };
        }
        if (payload && Array.isArray(payload.data)) {
            return { kind: 'ok', rows: payload.data };
        }
        return { kind: 'server-error' };
    } catch (error: unknown) {
        // axios populates `error.response.status` on HTTP errors; if
        // there's no response object the request never reached the API
        // (offline, DNS failure, CORS) and we treat it as a network
        // error. Authorization failures and 5xx must NOT silently fall
        // back to the bundled fixture — that would mask fake "delivered"
        // audit rows over a real outage. Copilot iter-2 on PR #6.
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

export function AlertsScreen() {
    const [dispatches, setDispatches] = useState<AlertDispatchRow[]>(ALERT_DISPATCHES);
    const [fetchState, setFetchState] = useState<FetchState>({ kind: 'fixture' });
    const [channel, setChannel] = useState<ChannelFilter>('all');
    const [severity, setSeverity] = useState<SeverityFilter>('all');
    const [status, setStatus] = useState<StatusFilter>('all');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [retryingById, setRetryingById] = useState<Record<string, boolean>>({});
    const [retryFeedback, setRetryFeedback] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        void fetchAlertDispatches(controller.signal).then((outcome) => {
            // 200 with an empty list IS meaningful — replace the
            // bundled fixture with the empty state so the audit log
            // reflects reality. Errors keep the fixture but surface
            // a banner so the operator knows the live data is stale.
            // Copilot iter-2 on PR #6.
            if (outcome.kind === 'ok') {
                setDispatches(outcome.rows);
                setFetchState({ kind: 'live' });
                return;
            }
            if (outcome.kind === 'unauthorized') {
                setFetchState({
                    kind: 'error',
                    message: 'Cannot load alert dispatches — not authorized.',
                });
                return;
            }
            if (outcome.kind === 'server-error') {
                const suffix = outcome.status ? ` (HTTP ${outcome.status})` : '';
                setFetchState({
                    kind: 'error',
                    message: `Cannot load alert dispatches — server error${suffix}.`,
                });
                return;
            }
            setFetchState({
                kind: 'error',
                message: 'Cannot load alert dispatches — network unreachable.',
            });
        });
        return () => controller.abort();
    }, []);

    const retryDispatch = async (id: string) => {
        setRetryFeedback(null);
        setRetryingById((current) => ({ ...current, [id]: true }));
        try {
            await api.post(`/alerts/dispatches/${id}/retry`);
            setRetryFeedback('Retry requested.');
        } catch (error) {
            const reason = error instanceof Error ? error.message : 'Please try again.';
            setRetryFeedback(`Retry failed: ${reason}`);
        } finally {
            setRetryingById((current) => ({ ...current, [id]: false }));
        }
    };

    const filtered = useMemo(() => {
        return dispatches.filter((row) => {
            if (channel !== 'all' && row.channel !== channel) return false;
            if (severity !== 'all' && row.severity !== severity) return false;
            if (status !== 'all' && row.status !== status) return false;
            return true;
        });
    }, [channel, dispatches, severity, status]);

    const selected = useMemo(
        () => (selectedId ? dispatches.find((r) => r.id === selectedId) ?? null : null),
        [dispatches, selectedId],
    );

    const transientFailures = dispatches.filter((r) => r.status === 'transient_failure').length;
    const permanentFailures = dispatches.filter((r) => r.status === 'permanent_failure').length;

    return (
        <div className="page" data-testid="alerts-screen" data-state="ready">
            <div className="page-head">
                <div>
                    <h1 className="page-title">Alerts</h1>
                    <p className="page-sub">
                        Real-time alert dispatch trail · {dispatches.length} entries ·{' '}
                        {transientFailures} transient / {permanentFailures} permanent failures
                    </p>
                </div>
                <div className="page-actions">
                    <span
                        className="live-pill"
                        data-testid="alerts-live-pill"
                        title="Real-time monitoring"
                    >
                        <span className="pulse" />
                        Live
                    </span>
                </div>
            </div>

            {fetchState.kind === 'error' && (
                <div
                    className="card mt-16"
                    role="alert"
                    data-testid="alerts-fetch-error"
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

            <div className="filter-bar" data-testid="alerts-filter-bar">
                <div className="filter-group">
                    <label className="filter-label" htmlFor="alerts-filter-channel">Channel</label>
                    <select
                        id="alerts-filter-channel"
                        value={channel}
                        onChange={(e) => setChannel(e.target.value as ChannelFilter)}
                        data-testid="alerts-filter-channel"
                    >
                        <option value="all">All</option>
                        <option value="slack">Slack</option>
                        <option value="discord">Discord</option>
                        <option value="email">Email</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label" htmlFor="alerts-filter-severity">Severity</label>
                    <select
                        id="alerts-filter-severity"
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value as SeverityFilter)}
                        data-testid="alerts-filter-severity"
                    >
                        <option value="all">All</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label" htmlFor="alerts-filter-status">Status</label>
                    <select
                        id="alerts-filter-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as StatusFilter)}
                        data-testid="alerts-filter-status"
                    >
                        <option value="all">All</option>
                        <option value="ok">Delivered</option>
                        <option value="transient_failure">Transient fail</option>
                        <option value="permanent_failure">Permanent fail</option>
                    </select>
                </div>
            </div>

            <div className="card" data-testid="alerts-table">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>When</th>
                            <th>Channel</th>
                            <th>Severity</th>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Tenant</th>
                            <th aria-label="actions" />
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((row: AlertDispatchRow) => (
                            <tr
                                key={row.id}
                                onClick={() => setSelectedId(row.id)}
<<<<<<< HEAD
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
=======
                                onKeyDown={(e) => {
                                    // Ignore Enter/Space that bubbled from
                                    // a nested action button — the action
                                    // already handled its own activation,
                                    // and double-firing would open the
                                    // drawer at the same time as the
                                    // retry/open click. Copilot iter-2 PR #6.
                                    if (e.target !== e.currentTarget) {
                                        return;
                                    }
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
>>>>>>> ce79bd1 (fix(v1.3/iter-2): close Copilot review findings on PR #6)
                                        setSelectedId(row.id);
                                    }
                                }}
                                tabIndex={0}
<<<<<<< HEAD
=======
                                role="button"
                                aria-label={`Open dispatch ${row.id}`}
>>>>>>> ce79bd1 (fix(v1.3/iter-2): close Copilot review findings on PR #6)
                                data-testid={`alerts-table-row-${row.id}`}
                                style={{ cursor: 'pointer' }}
                            >
                                <td><small>{fmtRelativeFrom(row.sentAt)}</small></td>
                                <td>
                                    <span className="badge">{row.channel}</span>
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
                                <td><b style={{ color: 'var(--text)' }}>{row.title}</b></td>
                                <td>
                                    <span
                                        className="badge"
                                        style={{
                                            background: `${STATUS_COLOR[row.status]}24`,
                                            color: STATUS_COLOR[row.status],
                                        }}
                                        data-testid={`alerts-status-${row.id}`}
                                    >
                                        {STATUS_LABEL[row.status]}
                                    </span>
                                </td>
                                <td><small>{row.tenantId ?? '—'}</small></td>
                                <td style={{ textAlign: 'right' }}>
                                    <button
                                        type="button"
                                        className="iconbtn"
                                        aria-label={`Open ${row.id}`}
                                        data-testid={`alerts-open-${row.id}`}
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
                                    {row.status === 'transient_failure' && (
                                        <button
                                            type="button"
                                            className="btn sm"
                                            data-testid={`alerts-retry-${row.id}`}
                                            disabled={Boolean(retryingById[row.id])}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                void retryDispatch(row.id);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.stopPropagation();
                                                }
                                            }}
                                        >
                                            {retryingById[row.id] ? 'Retrying…' : 'Retry'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7}>
                                    <div className="empty" data-testid="alerts-empty">
                                        No dispatches match the current filters.
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {retryFeedback && (
                    <div className="mt-16" role="status" data-testid="alerts-retry-feedback">
                        {retryFeedback}
                    </div>
                )}
            </div>

            {selected && (
                <div className="card mt-16" data-testid={`alerts-detail-${selected.id}`}>
                    <div className="card-head">
                        <div>
                            <h3 className="card-title">Dispatch detail · {selected.id}</h3>
                            <p className="card-sub">{selected.title}</p>
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
                            <div className="kv"><span>Channel</span><b>{selected.channel}</b></div>
                            <div className="kv"><span>Severity</span><b>{selected.severity}</b></div>
                            <div className="kv"><span>Status</span><b>{STATUS_LABEL[selected.status]}</b></div>
                            <div className="kv"><span>Tenant</span><b>{selected.tenantId ?? '—'}</b></div>
                            <div className="kv"><span>Metric</span><b>{selected.metricName ?? '—'}</b></div>
                            <div className="kv"><span>Cohort</span><b>{selected.cohort ?? '—'}</b></div>
                            <div className="kv"><span>HTTP status</span><b>{selected.httpStatus ?? '—'}</b></div>
                            <div className="kv"><span>Sent</span><b>{fmtRelativeFrom(selected.sentAt)}</b></div>
                        </div>
                        {selected.errorMessage && (
                            <pre
                                style={{
                                    marginTop: 12,
                                    padding: 10,
                                    background: 'var(--bg-2)',
                                    border: '1px solid var(--border-1)',
                                    borderRadius: 8,
                                    fontSize: 12,
                                    color: 'var(--sev-critical)',
                                    whiteSpace: 'pre-wrap',
                                }}
                            >
                                {selected.errorMessage}
                            </pre>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
