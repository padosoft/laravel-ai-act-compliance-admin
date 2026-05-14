import { useMemo, useState } from 'react';

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
    closed: 'Closed',
};

export function RisksScreen() {
    const [category, setCategory] = useState<CategoryFilter>('all');
    const [status, setStatus] = useState<StatusFilter>('all');
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const lower = search.trim().toLowerCase();
        return RISKS.filter((risk) => {
            if (category !== 'all' && risk.category !== category) return false;
            if (status !== 'all' && risk.status !== status) return false;
            if (lower && !`${risk.name} ${risk.desc}`.toLowerCase().includes(lower)) return false;
            return true;
        });
    }, [category, status, search]);

    const selected = useMemo(
        () => (selectedId ? RISKS.find((risk) => risk.id === selectedId) ?? null : null),
        [selectedId],
    );

    const categoryCounts = useMemo(() => {
        const acc: Record<RiskCategory, number> = { unacceptable: 0, high: 0, limited: 0, low: 0 };
        for (const risk of RISKS) acc[risk.category]++;
        return acc;
    }, []);

    return (
        <div className="page" data-testid="risks-screen" data-state="ready">
            <div className="page-head">
                <div>
                    <h1 className="page-title">Risk Register</h1>
                    <p className="page-sub">
                        AI Act Annex III categories · {RISKS.length} entries · {RISKS.filter((r) => r.status !== 'closed').length} open
                    </p>
                </div>
                <div className="page-actions">
                    <button type="button" className="btn"><I.Download size={13} /> Export register</button>
                    <button type="button" className="btn primary"><I.Plus size={13} /> Add risk</button>
                </div>
            </div>

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
                            <span className="status-pill">{STATUS_LABEL[risk.status]}</span>
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
                            <b>{STATUS_LABEL[selected.status]}</b>
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
