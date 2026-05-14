import { useMemo, useState } from 'react';

import { I } from '../../components/Icons';
import { ArticleRef, Avatar, Drawer } from '../../components/Primitives';
import { fmtDateLong, fmtRelativeFrom } from '../../lib/helpers';
import {
    DSAR,
    DSAR_DETAIL_TIMELINE,
    DSAR_SCOPE,
    type DsarRequest,
    type DsarStatus,
    type DsarType,
} from '../../lib/mock-data';

type StatusFilter = 'all' | DsarStatus;
type TypeFilter = 'all' | DsarType;

const STATUS_LABELS: Record<DsarStatus, string> = {
    pending: 'Pending',
    in_progress: 'In progress',
    completed: 'Completed',
    rejected: 'Rejected',
};

const STATUS_COLOR: Record<DsarStatus, string> = {
    pending: 'var(--sev-medium)',
    in_progress: 'var(--accent)',
    completed: 'var(--sev-low)',
    rejected: 'var(--sev-high)',
};

const TYPE_LABELS: Record<DsarType, string> = {
    export: 'Export · Art. 15',
    delete: 'Delete · Art. 17',
    rectify: 'Rectify · Art. 16',
};

export function DsarScreen() {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [bulkChecked, setBulkChecked] = useState<Set<string>>(new Set());

    const filtered = useMemo(() => {
        const lower = search.trim().toLowerCase();
        return DSAR.filter((request) => {
            if (statusFilter !== 'all' && request.status !== statusFilter) return false;
            if (typeFilter !== 'all' && request.type !== typeFilter) return false;
            if (lower) {
                const hay = `${request.id} ${request.subject.name} ${request.subject.email}`.toLowerCase();
                if (!hay.includes(lower)) return false;
            }
            return true;
        });
    }, [statusFilter, typeFilter, search]);

    const selected = useMemo(
        () => (selectedId ? DSAR.find((request) => request.id === selectedId) ?? null : null),
        [selectedId],
    );

    function toggleBulk(id: string) {
        setBulkChecked((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function clearBulk() {
        setBulkChecked(new Set());
    }

    return (
        <div className="page" data-testid="dsar-screen" data-state="ready">
            <div className="page-head">
                <div>
                    <h1 className="page-title">DSAR Queue</h1>
                    <p className="page-sub">
                        GDPR Articles 15 / 16 / 17 · 30-day SLA tracking · {DSAR.length} requests over the last 60 days
                    </p>
                </div>
                <div className="page-actions">
                    <button type="button" className="btn"><I.Download size={13} /> Export CSV</button>
                    <button type="button" className="btn primary"><I.Plus size={13} /> Open new DSAR</button>
                </div>
            </div>

            <div className="filter-bar" data-testid="dsar-filter-bar">
                <div className="filter-group">
                    <label className="filter-label">Status</label>
                    <select
                        data-testid="dsar-filter-status"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                    >
                        <option value="all">All</option>
                        {(Object.keys(STATUS_LABELS) as DsarStatus[]).map((status) => (
                            <option key={status} value={status}>
                                {STATUS_LABELS[status]}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">Type</label>
                    <select
                        data-testid="dsar-filter-type"
                        value={typeFilter}
                        onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
                    >
                        <option value="all">All</option>
                        {(Object.keys(TYPE_LABELS) as DsarType[]).map((type) => (
                            <option key={type} value={type}>
                                {TYPE_LABELS[type]}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group grow">
                    <label className="filter-label">Search</label>
                    <input
                        type="text"
                        data-testid="dsar-filter-search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Subject name, email, dsar id…"
                    />
                </div>
                {bulkChecked.size > 0 && (
                    <div className="bulk-actions" data-testid="dsar-bulk-actions">
                        <span>{bulkChecked.size} selected</span>
                        <button type="button" className="btn sm">Mark in progress</button>
                        <button type="button" className="btn sm">Approve</button>
                        <button type="button" className="btn sm warn">Reject</button>
                        <button type="button" className="btn sm ghost" onClick={clearBulk}>Clear</button>
                    </div>
                )}
            </div>

            <div className="card">
                <table className="data-table" data-testid="dsar-table">
                    <thead>
                        <tr>
                            <th style={{ width: 38 }}>
                                <input
                                    type="checkbox"
                                    aria-label="Select all"
                                    onChange={(event) =>
                                        event.target.checked
                                            ? setBulkChecked(new Set(filtered.map((d) => d.id)))
                                            : clearBulk()
                                    }
                                    checked={filtered.length > 0 && bulkChecked.size === filtered.length}
                                />
                            </th>
                            <th>Request</th>
                            <th>Type</th>
                            <th>Subject</th>
                            <th>Status</th>
                            <th>SLA</th>
                            <th>Assignee</th>
                            <th>Opened</th>
                            <th aria-label="row actions" />
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((request) => {
                            const breached = request.dueIn < 0;
                            const dueSoon = request.dueIn >= 0 && request.dueIn < 5;
                            return (
                                <tr
                                    key={request.id}
                                    data-testid={`dsar-row-${request.id}`}
                                    onClick={() => setSelectedId(request.id)}
                                    className={selectedId === request.id ? 'active' : ''}
                                >
                                    <td onClick={(event) => event.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={bulkChecked.has(request.id)}
                                            onChange={() => toggleBulk(request.id)}
                                            aria-label={`Select ${request.id}`}
                                        />
                                    </td>
                                    <td>
                                        <span className="mono">{request.id}</span>
                                        <div>
                                            {request.articles.map((article) => (
                                                <ArticleRef key={article}>{article}</ArticleRef>
                                            ))}
                                        </div>
                                    </td>
                                    <td>{TYPE_LABELS[request.type]}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Avatar
                                                name={request.subject.name}
                                                initials={request.subject.name
                                                    .split(' ')
                                                    .map((p) => p[0])
                                                    .join('')
                                                    .slice(0, 2)}
                                                size={22}
                                            />
                                            <div>
                                                <b>{request.subject.name}</b>
                                                <small style={{ color: 'var(--text-tertiary)' }}>
                                                    {request.subject.email}
                                                </small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            className="status-pill"
                                            style={{ background: `${STATUS_COLOR[request.status]}20`, color: STATUS_COLOR[request.status] }}
                                        >
                                            {STATUS_LABELS[request.status]}
                                        </span>
                                    </td>
                                    <td>
                                        {request.status === 'completed' || request.status === 'rejected' ? (
                                            <span className="muted">—</span>
                                        ) : breached ? (
                                            <span style={{ color: 'var(--sev-critical)', fontWeight: 600 }}>
                                                Breached
                                            </span>
                                        ) : dueSoon ? (
                                            <span style={{ color: 'var(--sev-medium)', fontWeight: 600 }}>
                                                Due in {request.dueIn}d
                                            </span>
                                        ) : (
                                            <span className="muted">{request.dueIn}d left</span>
                                        )}
                                    </td>
                                    <td>{request.assignee ? request.assignee.name : <span className="muted">Unassigned</span>}</td>
                                    <td>
                                        <time>{fmtRelativeFrom(request.opened)}</time>
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="iconbtn"
                                            aria-label={`Open ${request.id}`}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setSelectedId(request.id);
                                            }}
                                        >
                                            <I.ChevronRight size={14} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={9}>
                                    <div className="empty" data-testid="dsar-empty">
                                        No DSAR requests match the current filters.
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
                title={selected ? `${selected.id} · ${TYPE_LABELS[selected.type]}` : undefined}
                actions={
                    selected ? (
                        <>
                            <button type="button" className="btn sm">Approve</button>
                            <button type="button" className="btn sm warn">Reject</button>
                        </>
                    ) : null
                }
            >
                {selected && <DsarDetail request={selected} />}
            </Drawer>
        </div>
    );
}

interface DsarDetailProps {
    request: DsarRequest;
}

function DsarDetail({ request }: DsarDetailProps) {
    const timeline = DSAR_DETAIL_TIMELINE[request.id] ?? [];
    const scope = DSAR_SCOPE[request.id] ?? [];
    return (
        <div className="dsar-detail" data-testid={`dsar-detail-${request.id}`}>
            <div className="detail-section">
                <h4>Subject</h4>
                <div className="kv">
                    <span>Name</span>
                    <b>{request.subject.name}</b>
                </div>
                <div className="kv">
                    <span>Email</span>
                    <code>{request.subject.email}</code>
                </div>
                <div className="kv">
                    <span>Country</span>
                    <span>{request.subject.country}</span>
                </div>
                <div className="kv">
                    <span>Opened</span>
                    <time>{fmtDateLong(request.opened)}</time>
                </div>
                <div className="kv">
                    <span>Status</span>
                    <span style={{ color: STATUS_COLOR[request.status] }}>{STATUS_LABELS[request.status]}</span>
                </div>
                <div className="kv">
                    <span>Assignee</span>
                    <span>{request.assignee?.name ?? 'Unassigned'}</span>
                </div>
            </div>

            {scope.length > 0 && (
                <div className="detail-section">
                    <h4>Data scope</h4>
                    <table className="data-table compact">
                        <thead>
                            <tr>
                                <th>Domain</th>
                                <th>Rows</th>
                                <th>Retention</th>
                                <th>Policy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scope.map((row) => (
                                <tr key={row.domain}>
                                    <td>{row.domain}</td>
                                    <td className="mono">{row.rows.toLocaleString()}</td>
                                    <td>{row.retention}</td>
                                    <td>{row.policy}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {timeline.length > 0 && (
                <div className="detail-section">
                    <h4>Timeline</h4>
                    <ol className="timeline">
                        {timeline.map((entry, index) => (
                            <li key={`${entry.event}-${index}`}>
                                <div className="timeline-marker" />
                                <div>
                                    <b>{entry.label}</b>
                                    <small>
                                        {entry.actor} · {fmtRelativeFrom(entry.at)}
                                    </small>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}
