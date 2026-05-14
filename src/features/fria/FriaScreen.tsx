import { useMemo, useState } from 'react';

import { I } from '../../components/Icons';
import { Drawer } from '../../components/Primitives';
import { fmtRelativeFrom } from '../../lib/helpers';
import {
    FRIA,
    type FriaAssessment,
    type FriaStatus,
} from '../../lib/mock-data';

type StatusFilter = 'all' | FriaStatus;

const STATUS_LABEL: Record<FriaStatus, string> = {
    draft: 'Draft',
    active: 'Active',
    review_due: 'Review due',
    retired: 'Retired',
};

const STATUS_COLOR: Record<FriaStatus, string> = {
    draft: 'var(--sev-medium)',
    active: 'var(--sev-low)',
    review_due: 'var(--sev-high)',
    retired: 'var(--text-tertiary)',
};

function formatFutureReview(timestamp: number | null): string {
    if (timestamp === null) {
        return 'Not scheduled';
    }
    const now = Date.now();
    const diff = timestamp - now;
    const days = Math.round(diff / 86_400_000);
    if (days < 0) {
        return `Overdue · ${Math.abs(days)}d ago`;
    }
    if (days === 0) {
        return 'Today';
    }
    return `In ${days}d`;
}

export function FriaScreen() {
    const [status, setStatus] = useState<StatusFilter>('all');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        if (status === 'all') {
            return FRIA;
        }
        return FRIA.filter((entry) => entry.status === status);
    }, [status]);

    const selected = useMemo(
        () => (selectedId ? FRIA.find((entry) => entry.id === selectedId) ?? null : null),
        [selectedId],
    );

    const counts = useMemo(() => {
        const acc: Record<FriaStatus, number> = { draft: 0, active: 0, review_due: 0, retired: 0 };
        for (const entry of FRIA) acc[entry.status]++;
        return acc;
    }, []);

    return (
        <div className="page" data-testid="fria-screen" data-state="ready">
            <div className="page-head">
                <div>
                    <h1 className="page-title">Fundamental Rights Impact Assessments</h1>
                    <p className="page-sub">
                        AI Act Art. 27 · {FRIA.length} assessments · {counts.review_due} overdue · {counts.active} active
                    </p>
                </div>
                <div className="page-actions">
                    <button type="button" className="btn"><I.Download size={13} /> Export FRIAs</button>
                    <button type="button" className="btn primary" data-testid="fria-open-new">
                        <I.Plus size={13} /> Open assessment
                    </button>
                </div>
            </div>

            <div className="filter-bar" data-testid="fria-filter-bar">
                <div className="filter-group">
                    <label className="filter-label" htmlFor="fria-filter-status">Status</label>
                    <select
                        id="fria-filter-status"
                        value={status}
                        onChange={(event) => setStatus(event.target.value as StatusFilter)}
                        data-testid="fria-filter-status"
                    >
                        <option value="all">All ({FRIA.length})</option>
                        {(Object.keys(STATUS_LABEL) as FriaStatus[]).map((value) => (
                            <option key={value} value={value}>
                                {STATUS_LABEL[value]} ({counts[value]})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="card" data-testid="fria-table">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Assessment</th>
                            <th>Status</th>
                            <th>Project</th>
                            <th>Next review</th>
                            <th>Signed off</th>
                            <th aria-label="Actions" />
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((entry: FriaAssessment) => (
                            <tr
                                key={entry.id}
                                onClick={() => setSelectedId(entry.id)}
                                data-testid={`fria-row-${entry.id}`}
                                style={{ cursor: 'pointer' }}
                            >
                                <td>
                                    <b style={{ color: 'var(--text)' }}>{entry.title}</b>
                                    <small style={{ display: 'block', color: 'var(--text-tertiary)' }}>
                                        {entry.scope.slice(0, 80)}
                                        {entry.scope.length > 80 ? '…' : ''}
                                    </small>
                                </td>
                                <td>
                                    <span
                                        className="badge"
                                        style={{
                                            background: `${STATUS_COLOR[entry.status]}24`,
                                            color: STATUS_COLOR[entry.status],
                                        }}
                                        data-testid={`fria-status-${entry.id}`}
                                    >
                                        {STATUS_LABEL[entry.status]}
                                    </span>
                                </td>
                                <td>
                                    <small>{entry.projectKey ?? '—'}</small>
                                </td>
                                <td>
                                    <small>{formatFutureReview(entry.nextReviewAt)}</small>
                                </td>
                                <td>
                                    <small>
                                        {entry.signedOffBy
                                            ? `${entry.signedOffBy.initials} · ${fmtRelativeFrom(entry.signedOffAt ?? 0)}`
                                            : '—'}
                                    </small>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <I.ChevronRight size={14} />
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6}>
                                    <div className="empty" data-testid="fria-empty">
                                        No FRIA assessments match the current filter.
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
                title={selected ? selected.title : undefined}
                actions={
                    selected ? (
                        <>
                            <button type="button" className="btn sm" data-testid={`fria-schedule-${selected.id}`}>
                                Schedule review
                            </button>
                            <button type="button" className="btn sm primary" data-testid="fria-sign-off-button">
                                Sign off
                            </button>
                        </>
                    ) : null
                }
            >
                {selected && (
                    <div className="risk-detail" data-testid={`fria-detail-${selected.id}`}>
                        <div className="kv">
                            <span>Status</span>
                            <b style={{ color: STATUS_COLOR[selected.status] }}>{STATUS_LABEL[selected.status]}</b>
                        </div>
                        <div className="kv">
                            <span>Scope</span>
                            <span>{selected.scope}</span>
                        </div>
                        <div className="kv">
                            <span>Project</span>
                            <b>{selected.projectKey ?? '—'}</b>
                        </div>
                        <div className="kv">
                            <span>Opened by</span>
                            <b>{selected.openedBy.name}</b>
                            <small>{selected.openedBy.role}</small>
                        </div>
                        <div className="kv">
                            <span>Cadence</span>
                            <span>{selected.reviewCadenceDays}d</span>
                        </div>
                        <div className="kv">
                            <span>Next review</span>
                            <span>{formatFutureReview(selected.nextReviewAt)}</span>
                        </div>
                        <div className="kv">
                            <span>Signed off</span>
                            {selected.signedOffBy ? (
                                <span>
                                    <b>{selected.signedOffBy.name}</b>{' '}
                                    <small>· {fmtRelativeFrom(selected.signedOffAt ?? 0)}</small>
                                </span>
                            ) : (
                                <span>—</span>
                            )}
                        </div>

                        <h4>Risks</h4>
                        <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                            {selected.risks.map((risk) => (
                                <li key={risk}>{risk}</li>
                            ))}
                        </ul>

                        <h4>Mitigations</h4>
                        <div style={{ display: 'grid', gap: 8 }}>
                            {Object.entries(selected.mitigations).map(([key, value]) => (
                                <div key={key} className="kv">
                                    <span>{key}</span>
                                    <span>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
}
