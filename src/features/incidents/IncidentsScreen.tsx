import { useMemo, useState } from 'react';

import { I } from '../../components/Icons';
import { Avatar, Drawer, ArticleRef } from '../../components/Primitives';
import { fmtRelativeFrom } from '../../lib/helpers';
import {
    INCIDENTS,
    INCIDENT_DETAIL,
    type Incident,
    type IncidentSeverity,
    type IncidentState,
} from '../../lib/mock-data';

const LANES: { id: IncidentState; label: string }[] = [
    { id: 'open', label: 'Open' },
    { id: 'triage', label: 'Triage' },
    { id: 'mitigating', label: 'Mitigating' },
    { id: 'closed', label: 'Closed' },
];

const SEVERITY_COLOR: Record<IncidentSeverity, string> = {
    critical: 'var(--sev-critical)',
    high: 'var(--sev-high)',
    medium: 'var(--sev-medium)',
    low: 'var(--sev-low)',
};

export function IncidentsScreen() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [severityFilter, setSeverityFilter] = useState<'all' | IncidentSeverity>('all');

    const filtered = useMemo(
        () => INCIDENTS.filter((incident) => severityFilter === 'all' || incident.severity === severityFilter),
        [severityFilter],
    );

    const lanes = useMemo(() => {
        return LANES.map((lane) => ({
            ...lane,
            incidents: filtered.filter((incident) => incident.state === lane.id),
        }));
    }, [filtered]);

    const selected = useMemo(
        () => (selectedId ? INCIDENTS.find((incident) => incident.id === selectedId) ?? null : null),
        [selectedId],
    );
    const selectedDetail = selected ? INCIDENT_DETAIL[selected.id] : undefined;

    return (
        <div className="page" data-testid="incidents-screen" data-state="ready">
            <div className="page-head">
                <div>
                    <h1 className="page-title">Incident Manager</h1>
                    <p className="page-sub">
                        AI Act Art. 73 serious incident notification · {INCIDENTS.filter((i) => i.state !== 'closed').length} open / {INCIDENTS.length} total
                    </p>
                </div>
                <div className="page-actions">
                    <button type="button" className="btn"><I.Download size={13} /> Export incidents</button>
                    <button type="button" className="btn primary"><I.Plus size={13} /> Open new incident</button>
                </div>
            </div>

            <div className="filter-bar">
                <div className="filter-group">
                    <label className="filter-label">Severity</label>
                    <select
                        value={severityFilter}
                        onChange={(event) => setSeverityFilter(event.target.value as 'all' | IncidentSeverity)}
                        data-testid="incident-filter-severity"
                    >
                        <option value="all">All</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            <div className="kanban" data-testid="incident-kanban">
                {lanes.map((lane) => (
                    <div className="kanban-lane" key={lane.id} data-testid={`incident-lane-${lane.id}`}>
                        <header className="kanban-lane-head">
                            <span>{lane.label}</span>
                            <span className="badge outline">{lane.incidents.length}</span>
                        </header>
                        <div className="kanban-cards">
                            {lane.incidents.map((incident) => (
                                <button
                                    type="button"
                                    key={incident.id}
                                    className={`incident-card sev-${incident.severity}`}
                                    onClick={() => setSelectedId(incident.id)}
                                    data-testid={`incident-card-${incident.id}`}
                                >
                                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <span
                                            className="severity-pill"
                                            style={{ background: `${SEVERITY_COLOR[incident.severity]}24`, color: SEVERITY_COLOR[incident.severity] }}
                                        >
                                            {incident.severity}
                                        </span>
                                        <span className="muted mono" style={{ fontSize: 10.5 }}>
                                            {incident.id.slice(-8)}
                                        </span>
                                    </header>
                                    <p style={{ margin: '8px 0', fontSize: 13, color: 'var(--text)' }}>
                                        {incident.title}
                                    </p>
                                    <footer style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                                        {incident.assignee ? (
                                            <Avatar
                                                name={incident.assignee.name}
                                                initials={incident.assignee.initials}
                                                size={20}
                                            />
                                        ) : (
                                            <span className="muted">Unassigned</span>
                                        )}
                                        <span className="muted">· {incident.affected} affected</span>
                                        <span style={{ marginLeft: 'auto' }}>{fmtRelativeFrom(incident.opened)}</span>
                                    </footer>
                                </button>
                            ))}
                            {lane.incidents.length === 0 && (
                                <div className="empty" style={{ fontSize: 11 }}>
                                    No incidents in this lane.
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Drawer
                open={selected != null}
                onClose={() => setSelectedId(null)}
                title={selected ? selected.title : undefined}
                actions={
                    selected ? (
                        <>
                            <button type="button" className="btn sm">Reassign</button>
                            <button type="button" className="btn sm warn">Close incident</button>
                        </>
                    ) : null
                }
            >
                {selected && (
                    <IncidentDetail incident={selected} detail={selectedDetail} />
                )}
            </Drawer>
        </div>
    );
}

interface IncidentDetailProps {
    incident: Incident;
    detail?: (typeof INCIDENT_DETAIL)[string];
}

function IncidentDetail({ incident, detail }: IncidentDetailProps) {
    return (
        <div className="incident-detail" data-testid={`incident-detail-${incident.id}`}>
            <div className="kv">
                <span>Severity</span>
                <b style={{ color: SEVERITY_COLOR[incident.severity] }}>{incident.severity.toUpperCase()}</b>
            </div>
            <div className="kv">
                <span>State</span>
                <b>{incident.state}</b>
            </div>
            <div className="kv">
                <span>Assignee</span>
                <span>{incident.assignee?.name ?? 'Unassigned'}</span>
            </div>
            <div className="kv">
                <span>Affected users</span>
                <span>{incident.affected}</span>
            </div>
            <div className="kv">
                <span>Opened</span>
                <span>{fmtRelativeFrom(incident.opened)}</span>
            </div>
            <div className="kv">
                <span>Articles</span>
                <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {incident.articles.map((article) => (
                        <ArticleRef key={article}>{article}</ArticleRef>
                    ))}
                </span>
            </div>

            {detail && (
                <>
                    <h4>Description</h4>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{detail.description}</p>

                    <h4>Timeline</h4>
                    <ol className="timeline">
                        {detail.timeline.map((entry, index) => (
                            <li key={`${entry.event}-${index}`}>
                                <div className="timeline-marker" />
                                <div>
                                    <b>{entry.label}</b>
                                    <small>{entry.actor} · {fmtRelativeFrom(entry.at)}</small>
                                </div>
                            </li>
                        ))}
                    </ol>

                    {detail.mitigations.length > 0 && (
                        <>
                            <h4>Mitigations</h4>
                            <ul className="mitigations">
                                {detail.mitigations.map((mitigation, index) => (
                                    <li key={index}>
                                        <b>{mitigation.actor}</b> — {mitigation.text}
                                        <small> ({fmtRelativeFrom(mitigation.at)})</small>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    <h4>Escalation</h4>
                    <ul className="escalation">
                        {detail.escalation.map((entry) => (
                            <li key={entry.level}>
                                <b>{entry.level.toUpperCase()}</b>
                                <span style={{ marginLeft: 6 }}>→ {entry.recipients.join(', ')}</span>
                                <span style={{ marginLeft: 6, color: entry.notified ? 'var(--sev-low)' : 'var(--sev-high)' }}>
                                    {entry.notified ? '· notified' : '· pending'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
