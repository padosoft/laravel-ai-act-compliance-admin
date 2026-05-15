import { useEffect, useMemo, useState } from 'react';

import { api } from '../../api/client';
import { I } from '../../components/Icons';
import {
    TENANTS,
    TENANT_PLATFORM_TOTALS,
    type SubscriptionTier,
    type TenantPlatformTotals,
    type TenantRow,
    type TenantStatus,
} from '../../lib/mock-data';

type StatusFilter = 'all' | TenantStatus;
type TierFilter = 'all' | SubscriptionTier;

const STATUS_LABEL: Record<TenantStatus, string> = {
    active: 'Active',
    suspended: 'Suspended',
    archived: 'Archived',
};

const STATUS_COLOR: Record<TenantStatus, string> = {
    active: 'var(--sev-low)',
    suspended: 'var(--sev-high)',
    archived: 'var(--muted)',
};

const TIER_COLOR: Record<SubscriptionTier, string> = {
    free: 'var(--muted)',
    team: 'var(--sev-medium)',
    enterprise: 'var(--sev-low)',
};

type FetchOutcome =
    | {
          kind: 'ok';
          tenants: TenantRow[];
          totals: TenantPlatformTotals;
      }
    | { kind: 'unauthorized' }
    | { kind: 'server-error'; status?: number }
    | { kind: 'network-error' };

interface ApiTenantPayload {
    id: number;
    slug: string;
    name: string;
    subscription_tier: SubscriptionTier;
    status: TenantStatus;
    dpo_email: string | null;
    contact_email: string | null;
    kpis: TenantRow['kpis'];
}

function mapTenant(row: ApiTenantPayload): TenantRow {
    return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        subscriptionTier: row.subscription_tier,
        status: row.status,
        dpoEmail: row.dpo_email,
        contactEmail: row.contact_email,
        kpis: row.kpis,
    };
}

async function fetchTenants(signal: AbortSignal): Promise<FetchOutcome> {
    try {
        const response = await api.get<{
            data?: {
                tenants?: ApiTenantPayload[];
                totals?: TenantPlatformTotals;
            };
        }>('/tenants', { signal });
        const payload = response.data?.data;
        if (
            payload &&
            Array.isArray(payload.tenants) &&
            payload.totals &&
            typeof payload.totals === 'object'
        ) {
            return {
                kind: 'ok',
                tenants: payload.tenants.map(mapTenant),
                totals: payload.totals,
            };
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

const EMPTY_TOTALS: TenantPlatformTotals = {
    tenants_total: 0,
    tenants_active: 0,
    tenants_suspended: 0,
    alert_dispatches_total: 0,
    regulatory_amendments_total: 0,
    fria_assessments_total: 0,
    incidents_total: 0,
};

/**
 * Roll the per-tenant status delta into the platform totals so the
 * KPI grid stays consistent with the table immediately after a
 * Suspend / Activate / Archive PATCH. Copilot iter-1 on PR #8.
 */
function applyStatusDeltaToTotals(
    prev: TenantPlatformTotals,
    fromStatus: TenantStatus,
    toStatus: TenantStatus,
): TenantPlatformTotals {
    if (fromStatus === toStatus) return prev;
    const next: TenantPlatformTotals = { ...prev };
    if (fromStatus === 'active') next.tenants_active = Math.max(0, next.tenants_active - 1);
    if (fromStatus === 'suspended') next.tenants_suspended = Math.max(0, next.tenants_suspended - 1);
    if (toStatus === 'active') next.tenants_active = next.tenants_active + 1;
    if (toStatus === 'suspended') next.tenants_suspended = next.tenants_suspended + 1;

    return next;
}

export function TenantsScreen() {
    const [tenants, setTenants] = useState<TenantRow[]>(TENANTS);
    const [totals, setTotals] = useState<TenantPlatformTotals>(TENANT_PLATFORM_TOTALS);
    const [fetchState, setFetchState] = useState<FetchState>({ kind: 'fixture' });
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [tierFilter, setTierFilter] = useState<TierFilter>('all');
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        void fetchTenants(controller.signal).then((outcome) => {
            if (controller.signal.aborted) return;
            if (outcome.kind === 'ok') {
                setTenants(outcome.tenants);
                setTotals(outcome.totals);
                setFetchState({ kind: 'live' });

                return;
            }
            if (outcome.kind === 'unauthorized') {
                setTenants([]);
                // Reset the totals too: leaving the fixture KPIs in
                // place over an unauthorized response would surface
                // a populated dashboard next to a "not authorized"
                // banner. Copilot iter-1 on PR #8.
                setTotals(EMPTY_TOTALS);
                setSelectedSlug(null);
                setFetchState({
                    kind: 'error',
                    message: 'Cannot load tenants — not authorized.',
                });

                return;
            }
            if (outcome.kind === 'server-error') {
                const suffix = outcome.status ? ` (HTTP ${outcome.status})` : '';
                setTenants([]);
                setTotals(EMPTY_TOTALS);
                setSelectedSlug(null);
                setFetchState({
                    kind: 'error',
                    message: `Cannot load tenants — server error${suffix}.`,
                });

                return;
            }
            setFetchState({
                kind: 'error',
                message: 'Cannot load tenants — network unreachable.',
            });
        });

        return () => controller.abort();
    }, []);

    const filtered = useMemo(() => {
        return tenants.filter((row) => {
            if (statusFilter !== 'all' && row.status !== statusFilter) return false;
            if (tierFilter !== 'all' && row.subscriptionTier !== tierFilter) return false;

            return true;
        });
    }, [tenants, statusFilter, tierFilter]);

    const selected = useMemo(
        () => (selectedSlug !== null ? tenants.find((r) => r.slug === selectedSlug) ?? null : null),
        [tenants, selectedSlug],
    );

    const updateTenantStatus = async (slug: string, nextStatus: TenantStatus) => {
        // Capture the current status BEFORE the PATCH so we can
        // roll the delta into the platform totals symmetrically.
        const prevStatus = tenants.find((r) => r.slug === slug)?.status;
        try {
            await api.patch(`/tenants/${slug}`, { status: nextStatus });
            setActionError(null);
        } catch (error: unknown) {
            const err = error as { response?: { status?: number } } | undefined;
            const statusCode = err?.response?.status;
            setActionError(
                statusCode
                    ? `Failed to update ${slug} (HTTP ${statusCode}).`
                    : `Failed to update ${slug} — network unreachable.`,
            );

            return;
        }
        setTenants((current) =>
            current.map((row) =>
                row.slug === slug
                    ? {
                          ...row,
                          status: nextStatus,
                      }
                    : row,
            ),
        );
        if (prevStatus && prevStatus !== nextStatus) {
            setTotals((current) =>
                applyStatusDeltaToTotals(current, prevStatus, nextStatus),
            );
        }
    };

    return (
        <div className="page" data-testid="tenants-screen" data-state="ready">
            <div className="page-head">
                <div>
                    <h1 className="page-title">Tenants · DPO console</h1>
                    <p className="page-sub">
                        {totals.tenants_total} tenants · {totals.tenants_active} active ·{' '}
                        {totals.tenants_suspended} suspended
                    </p>
                </div>
            </div>

            {fetchState.kind === 'error' && (
                <div
                    className="card mt-16"
                    role="alert"
                    data-testid="tenants-fetch-error"
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

            {actionError && (
                <div
                    className="card mt-16"
                    role="alert"
                    data-testid="tenants-action-error"
                    style={{
                        background: 'var(--bg-2)',
                        border: '1px solid var(--sev-critical)',
                        color: 'var(--sev-critical)',
                        padding: 12,
                    }}
                >
                    {actionError}
                </div>
            )}

            <div className="kpi-grid mt-16" data-testid="tenants-platform-kpi-grid">
                <div className="kpi" data-testid="tenants-kpi-total">
                    <span>Tenants total</span>
                    <b>{totals.tenants_total}</b>
                </div>
                <div className="kpi" data-testid="tenants-kpi-alerts">
                    <span>Alert dispatches</span>
                    <b>{totals.alert_dispatches_total}</b>
                </div>
                <div className="kpi" data-testid="tenants-kpi-amendments">
                    <span>Regulatory amendments</span>
                    <b>{totals.regulatory_amendments_total}</b>
                </div>
                <div className="kpi" data-testid="tenants-kpi-fria">
                    <span>FRIA assessments</span>
                    <b>{totals.fria_assessments_total}</b>
                </div>
                <div className="kpi" data-testid="tenants-kpi-incidents">
                    <span>Incidents</span>
                    <b>{totals.incidents_total}</b>
                </div>
            </div>

            <div className="filter-bar mt-16" data-testid="tenants-filter-bar">
                <div className="filter-group">
                    <label className="filter-label" htmlFor="tenants-filter-status">
                        Status
                    </label>
                    <select
                        id="tenants-filter-status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                        data-testid="tenants-filter-status"
                    >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label" htmlFor="tenants-filter-tier">
                        Tier
                    </label>
                    <select
                        id="tenants-filter-tier"
                        value={tierFilter}
                        onChange={(e) => setTierFilter(e.target.value as TierFilter)}
                        data-testid="tenants-filter-tier"
                    >
                        <option value="all">All</option>
                        <option value="free">Free</option>
                        <option value="team">Team</option>
                        <option value="enterprise">Enterprise</option>
                    </select>
                </div>
            </div>

            <div className="card" data-testid="tenants-table">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Slug</th>
                            <th>Name</th>
                            <th>Tier</th>
                            <th>Status</th>
                            <th>DPO email</th>
                            <th>Alerts</th>
                            <th>Amendments (pending)</th>
                            <th aria-label="actions" />
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((row) => (
                            <tr
                                key={row.slug}
                                onClick={() => setSelectedSlug(row.slug)}
                                onKeyDown={(e) => {
                                    if (e.target !== e.currentTarget) return;
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setSelectedSlug(row.slug);
                                    }
                                }}
                                tabIndex={0}
                                aria-label={`Open tenant ${row.slug}`}
                                data-testid={`tenants-table-row-${row.slug}`}
                                style={{ cursor: 'pointer' }}
                            >
                                <td>
                                    <code>{row.slug}</code>
                                </td>
                                <td>
                                    <b style={{ color: 'var(--text)' }}>{row.name}</b>
                                </td>
                                <td>
                                    <span
                                        className="badge"
                                        style={{
                                            background: `${TIER_COLOR[row.subscriptionTier]}24`,
                                            color: TIER_COLOR[row.subscriptionTier],
                                        }}
                                    >
                                        {row.subscriptionTier}
                                    </span>
                                </td>
                                <td>
                                    <span
                                        className="badge"
                                        style={{
                                            background: `${STATUS_COLOR[row.status]}24`,
                                            color: STATUS_COLOR[row.status],
                                        }}
                                        data-testid={`tenants-status-${row.slug}`}
                                    >
                                        {STATUS_LABEL[row.status]}
                                    </span>
                                </td>
                                <td>
                                    <small>{row.dpoEmail ?? '—'}</small>
                                </td>
                                <td>{row.kpis.alert_dispatches}</td>
                                <td>
                                    {row.kpis.regulatory_amendments} (
                                    <b>{row.kpis.pending_amendments}</b>)
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button
                                        type="button"
                                        className="iconbtn"
                                        aria-label={`Open ${row.slug}`}
                                        data-testid={`tenants-open-${row.slug}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedSlug(row.slug);
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
                                <td colSpan={8}>
                                    <div className="empty" data-testid="tenants-empty">
                                        No tenants match the current filters.
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
                    data-testid={`tenants-detail-${selected.slug}`}
                >
                    <div className="card-head">
                        <div>
                            <h3 className="card-title">{selected.name}</h3>
                            <p className="card-sub">{selected.slug}</p>
                        </div>
                        <button
                            type="button"
                            className="iconbtn"
                            onClick={() => setSelectedSlug(null)}
                            aria-label="Close"
                        >
                            <I.X size={14} />
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="kv-grid">
                            <div className="kv">
                                <span>Tier</span>
                                <b>{selected.subscriptionTier}</b>
                            </div>
                            <div className="kv">
                                <span>Status</span>
                                <b>{STATUS_LABEL[selected.status]}</b>
                            </div>
                            <div className="kv">
                                <span>DPO email</span>
                                <b>{selected.dpoEmail ?? '—'}</b>
                            </div>
                            <div className="kv">
                                <span>Contact email</span>
                                <b>{selected.contactEmail ?? '—'}</b>
                            </div>
                            <div className="kv">
                                <span>Alert routes</span>
                                <b>{selected.kpis.alert_routes}</b>
                            </div>
                            <div className="kv">
                                <span>Alert dispatches</span>
                                <b>{selected.kpis.alert_dispatches}</b>
                            </div>
                            <div className="kv">
                                <span>Regulatory amendments</span>
                                <b>
                                    {selected.kpis.regulatory_amendments} (
                                    {selected.kpis.pending_amendments} pending)
                                </b>
                            </div>
                        </div>
                        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                            {selected.status !== 'suspended' && (
                                <button
                                    type="button"
                                    className="btn sm"
                                    data-testid={`tenants-suspend-${selected.slug}`}
                                    onClick={() =>
                                        void updateTenantStatus(selected.slug, 'suspended')
                                    }
                                >
                                    Suspend
                                </button>
                            )}
                            {selected.status !== 'active' && (
                                <button
                                    type="button"
                                    className="btn sm"
                                    data-testid={`tenants-activate-${selected.slug}`}
                                    onClick={() =>
                                        void updateTenantStatus(selected.slug, 'active')
                                    }
                                >
                                    Activate
                                </button>
                            )}
                            {selected.status !== 'archived' && (
                                <button
                                    type="button"
                                    className="btn sm"
                                    data-testid={`tenants-archive-${selected.slug}`}
                                    onClick={() =>
                                        void updateTenantStatus(selected.slug, 'archived')
                                    }
                                >
                                    Archive
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
