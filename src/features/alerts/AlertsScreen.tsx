import { useMemo, useState } from 'react';

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

export function AlertsScreen() {
    const [channel, setChannel] = useState<ChannelFilter>('all');
    const [severity, setSeverity] = useState<SeverityFilter>('all');
    const [status, setStatus] = useState<StatusFilter>('all');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        return ALERT_DISPATCHES.filter((row) => {
            if (channel !== 'all' && row.channel !== channel) return false;
            if (severity !== 'all' && row.severity !== severity) return false;
            if (status !== 'all' && row.status !== status) return false;
            return true;
        });
    }, [channel, severity, status]);

    const selected = useMemo(
        () => (selectedId ? ALERT_DISPATCHES.find((r) => r.id === selectedId) ?? null : null),
        [selectedId],
    );

    const transientFailures = ALERT_DISPATCHES.filter((r) => r.status === 'transient_failure').length;
    const permanentFailures = ALERT_DISPATCHES.filter((r) => r.status === 'permanent_failure').length;

    return (
        <div className="page" data-testid="alerts-screen" data-state="ready">
            <div className="page-head">
                <div>
                    <h1 className="page-title">Alerts</h1>
                    <p className="page-sub">
                        Real-time alert dispatch trail · {ALERT_DISPATCHES.length} entries ·{' '}
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
                <table className="table">
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
                                data-testid={`alerts-row-${row.id}`}
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
                                    {row.status !== 'ok' && (
                                        <button
                                            type="button"
                                            className="btn sm"
                                            data-testid={`alerts-row-${row.id}-retry`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Retry handled BE-side; this is a no-op
                                                // placeholder that surfaces the button in
                                                // tests.
                                            }}
                                        >
                                            Retry
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
