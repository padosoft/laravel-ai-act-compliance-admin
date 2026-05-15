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

async function fetchAlertDispatches(signal: AbortSignal): Promise<AlertDispatchRow[] | null> {
    try {
        const response = await api.get<{ data?: AlertDispatchRow[] } | AlertDispatchRow[]>(
            '/alerts/dispatches',
            { signal },
        );
        const payload = response.data;
        if (Array.isArray(payload)) {
            return payload;
        }
        if (payload && Array.isArray(payload.data)) {
            return payload.data;
        }
        return null;
    } catch {
        return null;
    }
}

export function AlertsScreen() {
    const [dispatches, setDispatches] = useState<AlertDispatchRow[]>(ALERT_DISPATCHES);
    const [channel, setChannel] = useState<ChannelFilter>('all');
    const [severity, setSeverity] = useState<SeverityFilter>('all');
    const [status, setStatus] = useState<StatusFilter>('all');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [retryingById, setRetryingById] = useState<Record<string, boolean>>({});
    const [retryFeedback, setRetryFeedback] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        void fetchAlertDispatches(controller.signal).then((result) => {
            if (result && result.length > 0) {
                setDispatches(result);
            }
        });
        return () => controller.abort();
    }, []);

    const retryDispatch = async (id: string) => {
        setRetryFeedback(null);
        setRetryingById((current) => ({ ...current, [id]: true }));
        try {
            await api.post(`/alerts/dispatches/${id}/retry`);
            setDispatches((current) =>
                current.map((row) =>
                    row.id === id
                        ? {
                            ...row,
                            status: 'ok',
                            httpStatus: row.httpStatus ?? 202,
                            errorMessage: null,
                        }
                        : row,
                ),
            );
            setRetryFeedback(`Retry queued for ${id}.`);
        } catch {
            setRetryFeedback(`Retry failed for ${id}.`);
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
