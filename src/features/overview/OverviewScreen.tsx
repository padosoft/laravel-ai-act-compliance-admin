import { useMemo, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { I } from '../../components/Icons';
import { ArticleRef, Sparkline, Tooltip } from '../../components/Primitives';
import { fmtDateLong, fmtRelativeFrom } from '../../lib/helpers';
import {
    ACTIVITY,
    CONSENT_FEATURES,
    CONSENT_RATE,
    COHORT_DATA,
    DSAR,
    DSAR_QUEUE_30D,
    INCIDENTS,
    NOW,
} from '../../lib/mock-data';

type Tone = 'ok' | 'warn' | 'alert';

interface Kpi {
    key: string;
    label: string;
    icon: ReactNode;
    value: string | number;
    sub: ReactNode;
    tone: Tone;
    onClick: () => void;
    spark?: number[];
}

export function OverviewScreen() {
    const navigate = useNavigate();
    const goto = (path: string) => navigate(path);

    const lastRefreshed = NOW;
    const dsarOpen = useMemo(
        () => DSAR.filter((d) => d.status !== 'completed' && d.status !== 'rejected'),
        [],
    );
    const dsarBreached = dsarOpen.filter((d) => d.dueIn < 0).length;
    const dsarSoon = dsarOpen.filter((d) => d.dueIn >= 0 && d.dueIn < 5).length;

    const openIncidents = useMemo(() => INCIDENTS.filter((i) => i.state !== 'closed'), []);
    const critical = openIncidents.filter((i) => i.severity === 'critical').length;
    const high = openIncidents.filter((i) => i.severity === 'high').length;
    const medium = openIncidents.filter((i) => i.severity === 'medium').length;
    const low = openIncidents.filter((i) => i.severity === 'low').length;

    const consentAvg =
        Object.values(CONSENT_RATE).reduce((sum, rate) => sum + rate.granted, 0) /
        Object.keys(CONSENT_RATE).length;

    const worstCohort = COHORT_DATA.language.rows.reduce(
        (acc, row) => (row.accuracy < acc.accuracy ? row : acc),
        COHORT_DATA.language.rows[0],
    );
    const biasDelta = worstCohort.accuracy - COHORT_DATA.language.overall;

    const kpis: Kpi[] = [
        {
            key: 'dsar',
            label: 'DSAR Queue',
            icon: <I.Inbox size={15} />,
            value: dsarOpen.length,
            sub: (
                <span>
                    {dsarBreached > 0 ? (
                        <>
                            <b style={{ color: 'var(--sev-critical)' }}>{dsarBreached}</b> breached
                        </>
                    ) : (
                        <>0 breached</>
                    )}{' '}
                    · <span className="muted">{dsarSoon} due ≤ 5d</span>
                </span>
            ),
            tone: dsarBreached > 0 ? 'alert' : dsarSoon > 0 ? 'warn' : 'ok',
            onClick: () => goto('/dsar'),
        },
        {
            key: 'incidents',
            label: 'Open Incidents',
            icon: <I.Flag size={15} />,
            value: openIncidents.length,
            sub: (
                <div className="kpi-mini-bars">
                    <Tooltip label={`${critical} critical`}>
                        <div className="mb" style={{ background: 'var(--sev-critical)', height: critical * 4 + 4 }} />
                    </Tooltip>
                    <Tooltip label={`${high} high`}>
                        <div className="mb" style={{ background: 'var(--sev-high)', height: high * 4 + 4 }} />
                    </Tooltip>
                    <Tooltip label={`${medium} medium`}>
                        <div className="mb" style={{ background: 'var(--sev-medium)', height: medium * 4 + 4 }} />
                    </Tooltip>
                    <Tooltip label={`${low} low`}>
                        <div className="mb" style={{ background: 'var(--sev-low)', height: low * 4 + 4 }} />
                    </Tooltip>
                </div>
            ),
            tone: critical > 0 ? 'alert' : openIncidents.length > 0 ? 'warn' : 'ok',
            onClick: () => goto('/incidents'),
        },
        {
            key: 'consent',
            label: 'Consent Rate',
            icon: <I.ShieldCheck size={15} />,
            value: `${consentAvg.toFixed(1)}%`,
            sub: <span className="muted">avg across {CONSENT_FEATURES.length} features (30d)</span>,
            tone: consentAvg < 70 ? 'alert' : consentAvg < 90 ? 'warn' : 'ok',
            onClick: () => goto('/consent'),
            spark: Object.values(CONSENT_RATE).flatMap((c) => c.trend).slice(0, 12),
        },
        {
            key: 'bias',
            label: 'Bias Monitor',
            icon: <I.Scale size={15} />,
            value: `${worstCohort.seg} ${(biasDelta * 100).toFixed(1)}%`,
            sub: (
                <span className="traffic" style={{ marginTop: 4 }}>
                    <span className={`light ${biasDelta < -0.05 ? 'red on' : ''}`} />
                    <span className={`light ${biasDelta > -0.05 && biasDelta < -0.02 ? 'amber on' : ''}`} />
                    <span className={`light ${biasDelta >= -0.02 ? 'green on' : ''}`} />
                    <span style={{ marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>
                        vs. overall {(COHORT_DATA.language.overall * 100).toFixed(1)}%
                    </span>
                </span>
            ),
            tone: biasDelta < -0.05 ? 'alert' : biasDelta < -0.02 ? 'warn' : 'ok',
            onClick: () => goto('/bias'),
        },
    ];

    const FEED_ICONS: Record<string, ReactNode> = {
        incident_opened: <I.Flag size={12} />,
        incident_closed: <I.CheckCircle size={12} />,
        dsar_opened: <I.Inbox size={12} />,
        dsar_completed: <I.CheckCircle size={12} />,
        dsar_breach: <I.AlertTriangle size={12} />,
        consent_revoked: <I.UserMinus size={12} />,
        risk_added: <I.ShieldAlert size={12} />,
        risk_reviewed: <I.ShieldCheck size={12} />,
        bias_drift: <I.TrendingDown size={12} />,
        attestation: <I.Award size={12} />,
        retention: <I.Clock size={12} />,
        webhook: <I.Webhook size={12} />,
    };

    const alertBanner =
        critical > 0
            ? { kind: 'critical' as const, text: `${critical} critical incident${critical > 1 ? 's' : ''} require immediate attention`, route: '/incidents' }
            : dsarBreached > 0
                ? { kind: 'warn' as const, text: `${dsarBreached} DSAR breached GDPR Art. 15 / 17 30-day SLA`, route: '/dsar' }
                : null;

    return (
        <div className="page" data-testid="overview-screen" data-state="ready">
            <div className="page-head">
                <div>
                    <h1 className="page-title">Compliance Overview</h1>
                    <p className="page-sub">
                        Single-pane view of your AI Act &amp; GDPR posture — last refreshed{' '}
                        <span className="mono">{fmtRelativeFrom(lastRefreshed - 18_000)}</span>
                    </p>
                </div>
                <div className="page-actions">
                    <button type="button" className="btn"><I.Download size={13} /> Export snapshot</button>
                    <button type="button" className="btn primary" onClick={() => goto('/dpo')}>
                        <I.Award size={13} /> Generate attestation
                    </button>
                </div>
            </div>

            {alertBanner && (
                <div className={`alert-banner ${alertBanner.kind === 'warn' ? 'warn' : ''}`} role="alert">
                    <I.AlertTriangle size={16} className="icon" />
                    <div className="grow">
                        <b>{alertBanner.kind === 'critical' ? 'Critical alert' : 'SLA warning'}</b> · {alertBanner.text}
                    </div>
                    <button type="button" className="btn sm" onClick={() => navigate(alertBanner.route)}>
                        View details <I.ChevronRight size={11} />
                    </button>
                </div>
            )}

            <div className="kpi-grid" data-testid="kpi-grid">
                {kpis.map((kpi) => (
                    <button
                        type="button"
                        key={kpi.key}
                        data-testid={`kpi-${kpi.key}`}
                        className={`kpi clickable ${kpi.tone === 'alert' ? 'alert' : kpi.tone === 'warn' ? 'warn' : ''}`}
                        onClick={kpi.onClick}
                    >
                        <div className="kpi-head">
                            <div className="kpi-label">{kpi.label}</div>
                            <div className="kpi-icon">{kpi.icon}</div>
                        </div>
                        <div className="kpi-value">{kpi.value}</div>
                        <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--text-secondary)' }}>{kpi.sub}</div>
                        {kpi.spark && (
                            <div className="kpi-spark">
                                <Sparkline
                                    data={kpi.spark}
                                    color={
                                        kpi.tone === 'alert'
                                            ? 'var(--sev-critical)'
                                            : kpi.tone === 'warn'
                                                ? 'var(--sev-medium)'
                                                : 'var(--accent)'
                                    }
                                />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="grid-2-1-2">
                <div className="card" data-testid="activity-feed">
                    <div className="card-head">
                        <div>
                            <h3 className="card-title">Recent activity</h3>
                            <p className="card-sub">Last 30 compliance events across all surfaces</p>
                        </div>
                        <button type="button" className="btn sm ghost">
                            View all <I.ChevronRight size={11} />
                        </button>
                    </div>
                    <div className="card-body flush">
                        <div className="feed">
                            {ACTIVITY.slice(0, 10).map((entry) => (
                                <button
                                    type="button"
                                    className="feed-row"
                                    key={entry.text + entry.at}
                                    onClick={() => {
                                        if (entry.kind.startsWith('incident')) goto('/incidents');
                                        else if (entry.kind.startsWith('dsar')) goto('/dsar');
                                        else if (entry.kind.startsWith('consent')) goto('/consent');
                                        else if (entry.kind.startsWith('risk')) goto('/risks');
                                        else if (entry.kind.startsWith('bias')) goto('/bias');
                                        else if (entry.kind === 'attestation' || entry.kind === 'retention')
                                            goto('/dpo');
                                        else if (entry.kind === 'webhook') goto('/settings');
                                    }}
                                >
                                    <span className={`feed-icon ${entry.severity}`}>
                                        {FEED_ICONS[entry.kind] ?? <I.Activity size={12} />}
                                    </span>
                                    <div className="feed-body">
                                        <b>{entry.text}</b>
                                        <small>by {entry.actor}</small>
                                    </div>
                                    <time className="feed-time">{fmtRelativeFrom(entry.at)}</time>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <DsarDepthChart data={DSAR_QUEUE_30D} />
            </div>

            <div className="card mt-16" data-testid="attestation-card">
                <div className="attest-card">
                    <div className="seal">
                        <I.Award size={26} />
                    </div>
                    <div>
                        <h4>Article 30 — Records of processing</h4>
                        <p>
                            Last DPO review:{' '}
                            <b style={{ color: 'var(--text)' }}>{fmtDateLong(NOW - 23 * 86_400_000)}</b> ·{' '}
                            <span className="badge success" style={{ marginLeft: 4 }}>
                                <span className="dot" />Current
                            </span>{' '}
                            · Auditor-ready PDF · ISO 42001 + GDPR Art. 30 + AI Act Art. 11
                        </p>
                        <div className="center gap-6" style={{ marginTop: 8 }}>
                            <ArticleRef>AI Act Art. 11</ArticleRef>
                            <ArticleRef>GDPR Art. 30</ArticleRef>
                            <ArticleRef>ISO 42001 §6.2</ArticleRef>
                        </div>
                    </div>
                    <button type="button" className="btn primary" onClick={() => goto('/dpo')}>
                        Generate next attestation <I.ArrowRight size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
}

interface DsarDepthChartProps {
    data: number[];
}

function DsarDepthChart({ data }: DsarDepthChartProps) {
    const [hover, setHover] = useState<{ index: number; value: number } | null>(null);
    const W = 480;
    const H = 220;
    const PAD = { t: 20, r: 20, b: 28, l: 32 };
    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;
    const max = Math.max(...data, 8);
    const sla = 8;

    const xAt = (i: number) => PAD.l + (i / Math.max(1, data.length - 1)) * innerW;
    const yAt = (v: number) => PAD.t + innerH - (v / max) * innerH;

    const path = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(v)}`).join(' ');
    const area = `${path} L ${xAt(data.length - 1)} ${PAD.t + innerH} L ${xAt(0)} ${PAD.t + innerH} Z`;

    return (
        <div className="card" data-testid="dsar-depth-chart">
            <div className="card-head">
                <div>
                    <h3 className="card-title">DSAR queue depth · 30 days</h3>
                    <p className="card-sub">Open DSAR by day · 30-day SLA target band shaded</p>
                </div>
                <span className="badge outline mono">{data[data.length - 1]} open</span>
            </div>
            <div className="card-body" style={{ paddingTop: 8 }}>
                <svg
                    viewBox={`0 0 ${W} ${H}`}
                    style={{ width: '100%', height: 240 }}
                    onMouseLeave={() => setHover(null)}
                    role="img"
                    aria-label={`DSAR queue depth over 30 days. Latest value ${data[data.length - 1]}.`}
                >
                    <defs>
                        <linearGradient id="dsarGrad" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.30" />
                            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    <rect
                        x={PAD.l}
                        y={yAt(sla)}
                        width={innerW}
                        height={PAD.t + innerH - yAt(sla)}
                        fill="var(--sev-medium)"
                        fillOpacity="0.06"
                    />
                    <line
                        x1={PAD.l}
                        x2={PAD.l + innerW}
                        y1={yAt(sla)}
                        y2={yAt(sla)}
                        stroke="var(--sev-medium)"
                        strokeOpacity="0.4"
                        strokeDasharray="3 3"
                    />
                    <text
                        x={PAD.l + innerW - 4}
                        y={yAt(sla) - 4}
                        textAnchor="end"
                        style={{ fontSize: 9, fill: 'var(--sev-medium)', fontFamily: 'var(--font-mono)' }}
                    >
                        SLA target
                    </text>

                    {[0, max / 2, max].map((v) => (
                        <g key={v}>
                            <line
                                x1={PAD.l}
                                x2={PAD.l + innerW}
                                y1={yAt(v)}
                                y2={yAt(v)}
                                stroke="var(--border)"
                                strokeDasharray="2 3"
                            />
                            <text
                                x={PAD.l - 6}
                                y={yAt(v) + 3}
                                textAnchor="end"
                                style={{ fontSize: 9, fill: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}
                            >
                                {Math.round(v)}
                            </text>
                        </g>
                    ))}

                    <path d={area} fill="url(#dsarGrad)" />
                    <path d={path} fill="none" stroke="var(--accent)" strokeWidth="1.75" />

                    {[0, 7, 14, 21, 29].map((i) => (
                        <g key={i}>
                            <line x1={xAt(i)} x2={xAt(i)} y1={PAD.t + innerH} y2={PAD.t + innerH + 3} stroke="var(--border-strong)" />
                            <text
                                x={xAt(i)}
                                y={PAD.t + innerH + 14}
                                textAnchor="middle"
                                style={{ fontSize: 9, fill: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}
                            >
                                d-{29 - i}
                            </text>
                        </g>
                    ))}

                    {data.map((v, i) => (
                        <rect
                            key={`hover-${i}`}
                            x={xAt(i) - innerW / data.length / 2}
                            y={PAD.t}
                            width={innerW / data.length}
                            height={innerH}
                            fill="transparent"
                            style={{ cursor: 'crosshair' }}
                            onMouseEnter={() => setHover({ index: i, value: v })}
                        />
                    ))}

                    {hover && (
                        <g pointerEvents="none">
                            <line
                                x1={xAt(hover.index)}
                                x2={xAt(hover.index)}
                                y1={PAD.t}
                                y2={PAD.t + innerH}
                                stroke="var(--text)"
                                strokeOpacity="0.2"
                            />
                            <circle
                                cx={xAt(hover.index)}
                                cy={yAt(hover.value)}
                                r="3.5"
                                fill="var(--accent)"
                                stroke="var(--bg-elevated)"
                                strokeWidth="2"
                            />
                            <g transform={`translate(${xAt(hover.index)}, ${yAt(hover.value) - 14})`}>
                                <rect x="-32" y="-18" width="64" height="22" rx="3" fill="var(--text)" />
                                <text
                                    x="0"
                                    y="-3"
                                    textAnchor="middle"
                                    style={{ fontSize: 10, fill: 'var(--bg-elevated)', fontFamily: 'var(--font-mono)' }}
                                >
                                    d-{29 - hover.index} · {hover.value}
                                </text>
                            </g>
                        </g>
                    )}
                </svg>
            </div>
        </div>
    );
}
