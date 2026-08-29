import { useEffect, useMemo, useState } from 'react';

import { api } from '../../api/client';
import { Drawer } from '../../components/Primitives';
import {
    approvalOutcome,
    OUTCOME_LABEL,
    parseToolCallRef,
    shortClass,
    type ApprovalOutcome,
} from '../../lib/ai-runtime';
import { fmtRelativeFrom } from '../../lib/helpers';
import { HUMAN_REVIEWS, type HumanReviewRow } from '../../lib/mock-data';

type StateFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'escalated';
type SubjectFilter = 'all' | string;

const STATE_LABEL: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    escalated: 'Escalated',
};

const STATE_COLOR: Record<string, string> = {
    pending: 'var(--sev-high)',
    approved: 'var(--sev-low)',
    rejected: 'var(--sev-critical)',
    escalated: 'var(--sev-medium)',
};

// Known subject types get a first-class label; unknown ones are humanized so a
// future backend feed never renders a blank cell (the failure mode the risk
// screen had with unmapped statuses).
const SUBJECT_TYPE_LABEL: Record<string, string> = {
    ai_tool_approval: 'Tool approval',
    iam_delegation_grant: 'Delegation grant',
    // Only `routine_run` is mapped: humanize() already turns `routine_mandate` into
    // "Routine mandate", and a map entry that reproduces the fallback is dead configuration.
    // This one earns its place — the record is about the PAUSE, not about the run.
    routine_run: 'Routine pause',
    model_output: 'Model output',
};

// A grant records what an agent *may* do; a tool approval records what it was
// *about to* do. Only the second has an outcome worth a column of its own.
const OUTCOME_COLOR: Record<ApprovalOutcome, string> = {
    denied: 'var(--sev-critical)',
    ran: 'var(--sev-low)',
    awaiting: 'var(--sev-high)',
    unknown: 'var(--muted)',
};

function humanize(value: string): string {
    return value.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

export function subjectLabel(subjectType: string | null): string {
    if (!subjectType) return '—';
    return SUBJECT_TYPE_LABEL[subjectType] ?? humanize(subjectType);
}

export function stateLabel(state: string): string {
    return STATE_LABEL[state] ?? humanize(state);
}

type FetchOutcome =
    | { kind: 'ok'; rows: HumanReviewRow[] }
    | { kind: 'unauthorized' }
    | { kind: 'server-error'; status?: number }
    | { kind: 'network-error' };

async function fetchHumanReviews(signal: AbortSignal): Promise<FetchOutcome> {
    try {
        const response = await api.get<
            | { data?: { data?: HumanReviewRow[] } }
            | { data?: HumanReviewRow[] }
            | HumanReviewRow[]
        >('/human-reviews', { signal });
        const payload = response.data as unknown;
        if (Array.isArray(payload)) {
            return { kind: 'ok', rows: payload };
        }
        if (payload && typeof payload === 'object' && 'data' in payload) {
            const inner = (payload as { data: unknown }).data;
            if (Array.isArray(inner)) {
                return { kind: 'ok', rows: inner as HumanReviewRow[] };
            }
            if (
                inner &&
                typeof inner === 'object' &&
                'data' in (inner as object) &&
                Array.isArray((inner as { data: unknown }).data)
            ) {
                return { kind: 'ok', rows: (inner as { data: HumanReviewRow[] }).data };
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

export function HumanReviewScreen() {
    const [reviews, setReviews] = useState<HumanReviewRow[]>(HUMAN_REVIEWS);
    const [fetchState, setFetchState] = useState<FetchState>({ kind: 'fixture' });
    const [stateFilter, setStateFilter] = useState<StateFilter>('all');
    const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all');
    const [runFilter, setRunFilter] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        void fetchHumanReviews(controller.signal).then((outcome) => {
            // Torn-down effect (navigation / fast remount): skip every setState.
            if (controller.signal.aborted) {
                return;
            }
            if (outcome.kind === 'ok') {
                setReviews(outcome.rows);
                setFetchState({ kind: 'live' });

                return;
            }
            if (outcome.kind === 'unauthorized') {
                setReviews([]);
                setSelectedId(null);
                setFetchState({
                    kind: 'error',
                    message: 'Cannot load human reviews — not authorized.',
                });

                return;
            }
            if (outcome.kind === 'server-error') {
                const suffix = outcome.status ? ` (HTTP ${outcome.status})` : '';
                setReviews([]);
                setSelectedId(null);
                setFetchState({
                    kind: 'error',
                    message: `Cannot load human reviews — server error${suffix}.`,
                });

                return;
            }
            setFetchState({
                kind: 'error',
                message: 'Cannot load human reviews — network unreachable.',
            });
        });

        return () => controller.abort();
    }, []);

    const subjectTypes = useMemo(() => {
        const set = new Set<string>();
        for (const row of reviews) if (row.subject_type) set.add(row.subject_type);
        return Array.from(set).sort();
    }, [reviews]);

    // The listeners write their evidence as prose, so the fields a table needs
    // are read back once here rather than re-parsed in every cell.
    const rows = useMemo(
        () =>
            reviews.map((row) => ({
                row,
                ref: parseToolCallRef(row.review_notes),
                outcome: approvalOutcome(row.state, row.review_notes),
            })),
        [reviews],
    );

    // A run filter set from a row that a later fetch dropped would silently empty
    // the table with no way back except reload, so it clears itself.
    useEffect(() => {
        if (runFilter !== null && !rows.some(({ ref }) => ref.runId === runFilter)) {
            setRunFilter(null);
        }
    }, [rows, runFilter]);

    const filtered = useMemo(() => {
        return rows.filter(({ row, ref }) => {
            if (stateFilter !== 'all' && row.state !== stateFilter) return false;
            if (subjectFilter !== 'all' && row.subject_type !== subjectFilter) return false;
            if (runFilter !== null && ref.runId !== runFilter) return false;

            return true;
        });
    }, [rows, stateFilter, subjectFilter, runFilter]);

    const selected = useMemo(
        () => (selectedId !== null ? rows.find((r) => r.row.id === selectedId) ?? null : null),
        [rows, selectedId],
    );

    const pendingCount = reviews.filter((r) => r.state === 'pending').length;
    const delegationCount = reviews.filter((r) => r.subject_type === 'iam_delegation_grant').length;
    const approvalCount = reviews.filter((r) => r.subject_type === 'ai_tool_approval').length;
    // A routine pause left pending is the one oversight item that rots invisibly: the routine is
    // behaving as designed (it does not act without permission), so nothing else anywhere reports
    // it. Counting it separately is what makes the silence visible.
    const stalledRoutineCount = reviews.filter(
        (r) => r.subject_type === 'routine_run' && r.state === 'pending',
    ).length;

    return (
        <div className="page" data-testid="human-review-screen" data-state="ready">
            <div className="page-head">
                <div>
                    <h1 className="page-title">Human Oversight</h1>
                    <p className="page-sub">
                        AI Act Art. 14 review trail · {reviews.length} records · {pendingCount} pending ·{' '}
                        {delegationCount} from delegated AI agents · {approvalCount} per-action tool approvals
                        {stalledRoutineCount > 0 && (
                            <>
                                {' · '}
                                <strong style={{ color: 'var(--sev-high)' }}>
                                    {stalledRoutineCount} routine{stalledRoutineCount === 1 ? '' : 's'} waiting for an
                                    answer
                                </strong>
                            </>
                        )}
                    </p>
                </div>
            </div>

            {fetchState.kind === 'error' && (
                <div
                    className="card mt-16"
                    role="alert"
                    data-testid="human-review-fetch-error"
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

            <div className="filter-bar" data-testid="human-review-filter-bar">
                <div className="filter-group">
                    <label className="filter-label" htmlFor="human-review-filter-state">State</label>
                    <select
                        id="human-review-filter-state"
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value as StateFilter)}
                        data-testid="human-review-filter-state"
                    >
                        <option value="all">All</option>
                        {Object.keys(STATE_LABEL).map((value) => (
                            <option key={value} value={value}>{STATE_LABEL[value]}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label" htmlFor="human-review-filter-subject">Subject</label>
                    <select
                        id="human-review-filter-subject"
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        data-testid="human-review-filter-subject"
                    >
                        <option value="all">All</option>
                        {subjectTypes.map((value) => (
                            <option key={value} value={value}>{subjectLabel(value)}</option>
                        ))}
                    </select>
                </div>
                {runFilter !== null && (
                    <div className="filter-group">
                        <span className="filter-label">Run</span>
                        <button
                            type="button"
                            className="badge"
                            onClick={() => setRunFilter(null)}
                            data-testid="human-review-run-filter"
                            title="Show every review again"
                            style={{
                                fontFamily: 'var(--mono, monospace)',
                                cursor: 'pointer',
                                background: 'var(--bg-2)',
                                border: '1px solid var(--border)',
                            }}
                        >
                            {runFilter} ✕
                        </button>
                    </div>
                )}
            </div>

            <div className="card" data-testid="human-review-table">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Reference</th>
                            <th>Run</th>
                            <th>State</th>
                            <th>Outcome</th>
                            <th>Reviewer</th>
                            <th>Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(({ row, ref, outcome }) => (
                            <tr
                                key={row.id}
                                onClick={() => setSelectedId(row.id)}
                                style={{ cursor: 'pointer' }}
                                data-testid={`human-review-row-${row.id}`}
                            >
                                <td>{subjectLabel(row.subject_type)}</td>
                                <td style={{ fontFamily: 'var(--mono, monospace)', fontSize: 12 }}>
                                    {row.subject_id ?? '—'}
                                </td>
                                <td>
                                    {ref.runId ? (
                                        <button
                                            type="button"
                                            // Stops the row click: pivoting to a run and opening
                                            // one record are different intents.
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setRunFilter(ref.runId);
                                            }}
                                            data-testid={`human-review-run-${row.id}`}
                                            title="Show every review from this run"
                                            style={{
                                                fontFamily: 'var(--mono, monospace)',
                                                fontSize: 12,
                                                background: 'none',
                                                border: 'none',
                                                padding: 0,
                                                color: 'var(--accent, inherit)',
                                                cursor: 'pointer',
                                                textDecoration: 'underline',
                                            }}
                                        >
                                            {ref.runId}
                                        </button>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                <td>
                                    <span
                                        className="badge"
                                        style={{
                                            background: `${STATE_COLOR[row.state] ?? 'var(--muted)'}24`,
                                            color: STATE_COLOR[row.state] ?? 'var(--muted)',
                                        }}
                                    >
                                        {stateLabel(row.state)}
                                    </span>
                                </td>
                                <td
                                    data-testid={`human-review-outcome-${row.id}`}
                                    style={{ color: OUTCOME_COLOR[outcome], fontSize: 12 }}
                                >
                                    {row.subject_type === 'ai_tool_approval' ? OUTCOME_LABEL[outcome] : '—'}
                                </td>
                                <td>{row.reviewer_id ?? '—'}</td>
                                <td>{row.updated_at ? fmtRelativeFrom(new Date(row.updated_at).getTime()) : '—'}</td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7}>
                                    <div className="empty" data-testid="human-review-empty">
                                        No reviews match the current filters.
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Drawer
                open={selected != null}
                onClose={() => setSelectedId(null)}
                title={
                    selected
                        ? `${subjectLabel(selected.row.subject_type)} · ${selected.row.subject_id ?? ''}`
                        : undefined
                }
            >
                {selected && (
                    <div className="risk-detail">
                        <div className="kv">
                            <span>State</span>
                            <b style={{ color: STATE_COLOR[selected.row.state] ?? 'var(--muted)' }}>
                                {stateLabel(selected.row.state)}
                            </b>
                        </div>
                        {selected.row.subject_type === 'ai_tool_approval' && (
                            <div className="kv">
                                <span>Outcome</span>
                                <b style={{ color: OUTCOME_COLOR[selected.outcome] }}>
                                    {OUTCOME_LABEL[selected.outcome]}
                                </b>
                            </div>
                        )}
                        <div className="kv">
                            <span>Reviewer</span>
                            <b>{selected.row.reviewer_id ?? '—'}</b>
                        </div>
                        <div className="kv">
                            <span>Updated</span>
                            <span>
                                {selected.row.updated_at
                                    ? fmtRelativeFrom(new Date(selected.row.updated_at).getTime())
                                    : '—'}
                            </span>
                        </div>

                        {(selected.ref.runId || selected.ref.tool) && (
                            <div data-testid="human-review-chain">
                                <h4>The call this decision was about</h4>
                                <div className="kv">
                                    <span>Agent</span>
                                    <b title={selected.ref.agent ?? undefined}>
                                        {shortClass(selected.ref.agent)}
                                    </b>
                                </div>
                                <div className="kv">
                                    <span>Tool</span>
                                    <b style={{ fontFamily: 'var(--mono, monospace)' }}>
                                        {selected.ref.tool ?? '—'}
                                    </b>
                                </div>
                                <div className="kv">
                                    <span>Tool call</span>
                                    <span style={{ fontFamily: 'var(--mono, monospace)', fontSize: 12 }}>
                                        {selected.row.subject_id ?? '—'}
                                    </span>
                                </div>
                                <div className="kv">
                                    <span>Run</span>
                                    <span style={{ fontFamily: 'var(--mono, monospace)', fontSize: 12 }}>
                                        {selected.ref.runId ?? '—'}
                                    </span>
                                </div>
                                {selected.ref.conversationId && (
                                    <div className="kv">
                                        <span>Conversation</span>
                                        <span style={{ fontFamily: 'var(--mono, monospace)', fontSize: 12 }}>
                                            {selected.ref.conversationId}
                                        </span>
                                    </div>
                                )}
                                {selected.ref.runId && (
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                                        The run id is the same <code>invocation_id</code> the FinOps panel keys its
                                        Agent Runs page on — paste it there for the steps, tools and spend of this
                                        same run.
                                    </p>
                                )}
                            </div>
                        )}

                        {selected.ref.reason && (
                            <>
                                <h4>Reason the model gave</h4>
                                <p
                                    style={{
                                        fontSize: 13,
                                        color: 'var(--text-secondary)',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {selected.ref.reason}
                                </p>
                                <p style={{ fontSize: 11, color: 'var(--muted)' }}>
                                    Written by the model, not by a person — read it as a claim, not as evidence.
                                </p>
                            </>
                        )}

                        <h4>Review notes</h4>
                        <p
                            style={{
                                fontSize: 13,
                                color: 'var(--text-secondary)',
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            {selected.row.review_notes ?? '—'}
                        </p>
                    </div>
                )}
            </Drawer>
        </div>
    );
}
