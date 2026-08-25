import { useEffect, useMemo, useState } from 'react';

import { api } from '../../api/client';
import { I } from '../../components/Icons';
import { ArticleRef, Drawer } from '../../components/Primitives';
import { fmtRelativeFrom } from '../../lib/helpers';
import {
    RISKS,
    type Risk,
    type RiskCategory,
    type RiskStatus,
} from '../../lib/mock-data';

type CategoryFilter = 'all' | RiskCategory;
type StatusFilter = 'all' | RiskStatus;

const CATEGORY_COLOR: Record<RiskCategory, string> = {
    unacceptable: 'var(--sev-critical)',
    high: 'var(--sev-high)',
    limited: 'var(--sev-medium)',
    low: 'var(--sev-low)',
};

const CATEGORY_LABEL: Record<RiskCategory, string> = {
    unacceptable: 'Unacceptable',
    high: 'High risk',
    limited: 'Limited risk',
    low: 'Low risk',
};

const STATUS_LABEL: Record<RiskStatus, string> = {
    open: 'Open',
    in_progress: 'Mitigating',
    mitigating: 'Mitigating',
    closed: 'Closed',
};

const STATUS_COLOR: Record<RiskStatus, string> = {
    open: 'var(--sev-high)',
    in_progress: 'var(--sev-medium)',
    mitigating: 'var(--sev-medium)',
    closed: 'var(--sev-low)',
};

// The backend `status` column is a free string (the IamDelegation bridge writes
// open/mitigating/closed): unknown values must render humanized, never blank.
function statusLabel(status: string): string {
    return STATUS_LABEL[status as RiskStatus] ?? status.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

function statusColor(status: string): string {
    return STATUS_COLOR[status as RiskStatus] ?? 'var(--muted)';
}

// Backend row (laravel-ai-act-compliance `risk_register_entries`) → fixture shape.
interface RiskRegisterRow {
    id: number | string;
    name?: string | null;
    category?: string | null;
    status?: string | null;
    description?: string | null;
    owner_id?: string | null;
    article_refs?: string[] | null;
    updated_at?: string | null;
}

function toRisk(row: RiskRegisterRow): Risk {
    const category = (['unacceptable', 'high', 'limited', 'low'] as RiskCategory[]).includes(
        row.category as RiskCategory,
    )
        ? (row.category as RiskCategory)
        : 'limited';

    return {
        id: String(row.id),
        name: row.name ?? '—',
        category,
        status: (row.status ?? 'open') as RiskStatus,
        owner: {
            id: row.owner_id ?? '—',
            name: row.owner_id ?? '—',
            email: '',
            role: 'Owner',
            initials: (row.owner_id ?? '—').slice(0, 2).toUpperCase(),
        },
        desc: row.description ?? '',
        articles: Array.isArray(row.article_refs) ? row.article_refs : [],
        lastReviewed: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
    };
}

type FetchOutcome =
    | { kind: 'ok'; rows: RiskRegisterRow[] }
    | { kind: 'unauthorized' }
    | { kind: 'server-error'; status?: number }
    | { kind: 'network-error' };

async function fetchRisks(signal: AbortSignal): Promise<FetchOutcome> {
    try {
        const response = await api.get<
            | { data?: { data?: RiskRegisterRow[] } }
            | { data?: RiskRegisterRow[] }
            | RiskRegisterRow[]
        >('/risks', { signal });
        const payload = response.data as unknown;
        if (Array.isArray(payload)) {
            return { kind: 'ok', rows: payload };
        }
        if (payload && typeof payload === 'object' && 'data' in payload) {
            const inner = (payload as { data: unknown }).data;
            if (Array.isArray(inner)) {
                return { kind: 'ok', rows: inner as RiskRegisterRow[] };
            }
            if (
                inner &&
                typeof inner === 'object' &&
                'data' in (inner as object) &&
                Array.isArray((inner as { data: unknown }).data)
            ) {
                return { kind: 'ok', rows: (inner as { data: RiskRegisterRow[] }).data };
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

export function RisksScreen() {
    const [risks, setRisks] = useState<Risk[]>(RISKS);
    const [fetchState, setFetchState] = useState<FetchState>({ kind: 'fixture' });
    const [category, setCategory] = useState<CategoryFilter>('all');
    const [status, setStatus] = useState<StatusFilter>('all');
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        void fetchRisks(controller.signal).then((outcome) => {
            // Torn-down effect: skip every setState (same guard as Regulatory).
            if (controller.signal.aborted) {
                return;
            }
            if (outcome.kind === 'ok') {
                setRisks(outcome.rows.map(toRisk));
                setFetchState({ kind: 'live' });

                return;
            }
            if (outcome.kind === 'unauthorized') {
                setRisks([]);
                setSelectedId(null);
                setFetchState({ kind: 'error', message: 'Cannot load the risk register — not authorized.' });

                return;
            }
            if (outcome.kind === 'server-error') {
                const suffix = outcome.status ? ` (HTTP ${outcome.status})` : '';
                setRisks([]);
                setSelectedId(null);
                setFetchState({
                    kind: 'error',
                    message: `Cannot load the risk register — server error${suffix}.`,
                });

                return;
            }
            setFetchState({ kind: 'error', message: 'Cannot load the risk register — network unreachable.' });
        });

        return () => controller.abort();
    }, []);

    const filtered = useMemo(() => {
        const lower = search.trim().toLowerCase();
        return risks.filter((risk) => {
            if (category !== 'all' && risk.category !== category) return false;
            if (status !== 'all' && risk.status !== status) return false;
            if (lower && !`${risk.name} ${risk.desc} ${risk.id}`.toLowerCase().includes(lower)) return false;
            return true;
        });
    }, [risks, category, status, search]);

    const selected = useMemo(
        () => (selectedId ? risks.find((risk) => risk.id === selectedId) ?? null : null),
        [risks, selectedId],
    );

    const categoryCounts = useMemo(() => {
        const acc: Record<RiskCategory, number> = { unacceptable: 0, high: 0, limited: 0, low: 0 };
        for (const risk of risks) acc[risk.category]++;
        return acc;
    }, [risks]);

    return (
        <div className="page" data-testid="risks-screen" data-state="ready">
            <div className="page-head">
                <div>
                    <h1 className="page-title">Risk Register</h1>
                    <p className="page-sub">
                        AI Act Annex III categories · {risks.length} entries · {risks.filter((r) => r.status !== 'closed').length} open
                    </p>
                </div>
                <div className="page-actions">
                    <button type="button" className="btn"><I.Download size={13} /> Export register</button>
                    <button type="button" className="btn primary"><I.Plus size={13} /> Add risk</button>
                </div>
            </div>

            {fetchState.kind === 'error' && (
                <div
                    className="card mt-16"
                    role="alert"
                    data-testid="risks-fetch-error"
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

            <div className="risk-summary" data-testid="risk-summary">
                {(Object.keys(CATEGORY_LABEL) as RiskCategory[]).map((cat) => (
                    <button
                        type="button"
                        key={cat}
                        className={`risk-tile ${cat} ${category === cat ? 'active' : ''}`}
                        onClick={() => setCategory((current) => (current === cat ? 'all' : cat))}
                        data-testid={`risk-tile-${cat}`}
                    >
                        <span className="risk-tile-count">{categoryCounts[cat]}</span>
                        <span className="risk-tile-label">{CATEGORY_LABEL[cat]}</span>
                    </button>
                ))}
            </div>

            <div className="filter-bar">
                <div className="filter-group">
                    <label className="filter-label">Status</label>
                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value as StatusFilter)}
                        data-testid="risk-filter-status"
                    >
                        <option value="all">All</option>
                        {(Object.keys(STATUS_LABEL) as RiskStatus[]).map((value) => (
                            <option key={value} value={value}>
                                {STATUS_LABEL[value]}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group grow">
                    <label className="filter-label">Search</label>
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Risk name, description, article"
                        data-testid="risk-filter-search"
                    />
                </div>
            </div>

            <div className="grid-fit-360" data-testid="risk-grid">
                {filtered.map((risk) => (
                    <button
                        type="button"
                        key={risk.id}
                        className={`card risk-card ${risk.category}`}
                        onClick={() => setSelectedId(risk.id)}
                        data-testid={`risk-card-${risk.id}`}
                    >
                        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span
                                className="badge"
                                style={{
                                    background: `${CATEGORY_COLOR[risk.category]}24`,
                                    color: CATEGORY_COLOR[risk.category],
                                }}
                            >
                                {CATEGORY_LABEL[risk.category]}
                            </span>
                            <span className="status-pill" style={{ background: `${statusColor(risk.status)}24`, color: statusColor(risk.status) }}>{statusLabel(risk.status)}</span>
                        </header>
                        <h3 style={{ margin: '8px 0', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                            {risk.name}
                        </h3>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                            {risk.desc.slice(0, 140)}
                            {risk.desc.length > 140 ? '…' : ''}
                        </p>
                        <footer style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 11 }}>
                            {risk.articles.map((article) => (
                                <ArticleRef key={article}>{article}</ArticleRef>
                            ))}
                        </footer>
                        <small style={{ marginTop: 8, color: 'var(--text-tertiary)' }}>
                            Owner: {risk.owner.name} · Reviewed {fmtRelativeFrom(risk.lastReviewed)}
                        </small>
                    </button>
                ))}
                {filtered.length === 0 && (
                    <div className="empty" data-testid="risk-empty">
                        No risks match the current filters.
                    </div>
                )}
            </div>

            <Drawer
                open={selected != null}
                onClose={() => setSelectedId(null)}
                title={selected ? selected.name : undefined}
                actions={
                    selected ? (
                        <>
                            <button type="button" className="btn sm">Edit</button>
                            <button type="button" className="btn sm warn">Close risk</button>
                        </>
                    ) : null
                }
            >
                {selected && (
                    <div className="risk-detail">
                        <div className="kv">
                            <span>Category</span>
                            <b style={{ color: CATEGORY_COLOR[selected.category] }}>
                                {CATEGORY_LABEL[selected.category]}
                            </b>
                        </div>
                        <div className="kv">
                            <span>Status</span>
                            <b style={{ color: statusColor(selected.status) }}>{statusLabel(selected.status)}</b>
                        </div>
                        <div className="kv">
                            <span>Owner</span>
                            <b>{selected.owner.name}</b>
                            <small>{selected.owner.role}</small>
                        </div>
                        <div className="kv">
                            <span>Last reviewed</span>
                            <span>{fmtRelativeFrom(selected.lastReviewed)}</span>
                        </div>
                        <h4>Description</h4>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selected.desc}</p>
                        <h4>Regulatory references</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {selected.articles.map((article) => (
                                <ArticleRef key={article}>{article}</ArticleRef>
                            ))}
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
}
