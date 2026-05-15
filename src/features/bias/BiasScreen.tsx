import { useEffect, useMemo, useState } from 'react';

import { api } from '../../api/client';
import { I } from '../../components/Icons';
import { ArticleRef } from '../../components/Primitives';
import {
    BIAS_METRICS,
    COHORT_DATA,
    COHORT_DIMENSIONS,
    biasMetricDataFor,
    type BiasMetricMeta,
} from '../../lib/mock-data';

/**
 * Fetch the live bias-metrics list from the BE via the shared admin
 * API client. Production hosts expose
 * `GET /api/admin/ai-act-compliance/bias/metrics` (planned in
 * laravel-ai-act-compliance v1.2.1 — the BE endpoint follows the
 * service-layer v1.2 in PR #2). Falls back to the bundled fixture
 * when the endpoint is unreachable (dev, network failure, or v1.2
 * BE without the metadata endpoint yet) so host-app custom metrics
 * surface as soon as the endpoint ships without an SPA bump.
 *
 * R18 (derive-from-DB-not-literal) — the dropdown contents are
 * derived from the live registry whenever it answers, fixture is
 * the dev/seed fallback. R14 (surface-failures-loudly) — fetch
 * failures are logged via `console.warn` (the operator sees the
 * fallback path was taken in the browser console); we deliberately
 * do NOT surface a page-level error because the fixture is a valid
 * degraded mode.
 */
async function fetchBiasMetrics(signal: AbortSignal): Promise<BiasMetricMeta[] | null> {
    try {
        const response = await api.get<{ data?: BiasMetricMeta[] } | BiasMetricMeta[]>(
            '/bias/metrics',
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
    } catch (error) {
        // Per the docblock: surface the fallback decision so an
        // operator inspecting the browser console can tell the
        // fixture is in play.
        if (typeof console !== 'undefined' && typeof console.warn === 'function') {
            console.warn('[BiasScreen] /bias/metrics unreachable; falling back to bundled fixture.', error);
        }
        return null;
    }
}

export function BiasScreen() {
    const [dimension, setDimension] = useState<string>('language');
    // v1.2 — Pluggable parity metrics. The dropdown lets a DPO switch
    // between Demographic Parity, Equalized Odds, and Calibration (or
    // any host-app custom metric returned by the bias-metrics
    // metadata endpoint in production).
    const [metricId, setMetricId] = useState<string>('demographic_parity');
    // Live registry list — falls back to the bundled fixture when the
    // BE endpoint is unreachable (see fetchBiasMetrics docblock).
    const [liveMetrics, setLiveMetrics] = useState<BiasMetricMeta[] | null>(null);
    useEffect(() => {
        const controller = new AbortController();
        void fetchBiasMetrics(controller.signal).then((result) => {
            if (result && result.length > 0) {
                setLiveMetrics(result);
            }
        });
        return () => controller.abort();
    }, []);
    const availableMetrics = liveMetrics ?? BIAS_METRICS;
    const metricMeta = availableMetrics.find((m) => m.id === metricId) ?? availableMetrics[0];
    // The per-metric transform on the cohort dataset ensures switching
    // metric ACTUALLY recomputes the chart numbers + worst-cohort +
    // overall accuracy — Copilot review on PR #5 caught a stale-data
    // bug where only the label/article-evidence updated. Memoised so
    // the transform doesn't re-run on every render.
    const baseData = COHORT_DATA[dimension] ?? COHORT_DATA.language;
    const transformedData = useMemo(
        () => biasMetricDataFor(metricId, baseData),
        [metricId, baseData],
    );
    // Host-app custom metrics surfaced by the live registry may not
    // have a SPA-side transform — the fixture-only screen renders an
    // empty state in that case instead of misattributing demographic-
    // parity numbers to the custom metric (Copilot review PR #5).
    const data = transformedData ?? baseData;
    const isUnknownMetric = transformedData === null;
    const dimensionMeta = COHORT_DIMENSIONS.find((d) => d.id === dimension);

    // \"Worst cohort\" semantics depend on the metric:
    //  - For accuracy / Demographic Parity / Equalized Odds the LOWEST
    //    score is worst (lower accuracy / lower positive-rate / lower
    //    compound rate means the cohort under-performs the population).
    //  - For Calibration the HIGHEST score is worst (calibration is a
    //    GAP metric — bigger gap = more miscalibrated).
    // Without this branch a Calibration view would highlight the
    // BEST-calibrated cohort as the worst, which Copilot review on
    // PR #5 (commit 5169694) caught.
    const worstRow = useMemo(() => {
        const isGapMetric = metricId === 'calibration';
        return data.rows.reduce(
            (acc, row) => {
                if (isGapMetric) {
                    return row.accuracy > acc.accuracy ? row : acc;
                }
                return row.accuracy < acc.accuracy ? row : acc;
            },
            data.rows[0],
        );
    }, [data, metricId]);

    return (
        <div className="page" data-testid="bias-screen" data-state="ready">
            <div className="page-head">
                <div>
                    <h1 className="page-title">Bias Monitor</h1>
                    <p className="page-sub" data-testid="bias-page-sub">
                        Cohort parity tracking · {metricMeta.label} · {COHORT_DIMENSIONS.length} dimensions
                    </p>
                    <div
                        style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}
                        data-testid="bias-article-evidence"
                    >
                        {metricMeta.articleEvidence.map((article) => (
                            <ArticleRef key={article}>{article}</ArticleRef>
                        ))}
                    </div>
                </div>
                <div className="page-actions">
                    <button type="button" className="btn"><I.Download size={13} /> Export cohort report</button>
                </div>
            </div>

            <div className="filter-bar">
                <div className="filter-group">
                    <label className="filter-label" htmlFor="bias-metric-name">Parity metric</label>
                    <select
                        id="bias-metric-name"
                        value={metricId}
                        onChange={(event) => setMetricId(event.target.value)}
                        data-testid="bias-metric-name"
                    >
                        {availableMetrics.map((metric) => (
                            <option key={metric.id} value={metric.id}>
                                {metric.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label" htmlFor="bias-dimension">Cohort dimension</label>
                    <select
                        id="bias-dimension"
                        value={dimension}
                        onChange={(event) => setDimension(event.target.value)}
                        data-testid="bias-dimension"
                    >
                        {COHORT_DIMENSIONS.map((dim) => (
                            <option key={dim.id} value={dim.id} disabled={!COHORT_DATA[dim.id]}>
                                {dim.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    {/*
                     * Label tracks the active metric — calling a
                     * Calibration GAP score "Overall accuracy" would
                     * mislead reviewers. Demographic Parity surfaces
                     * the positive-rate; Equalized Odds + Calibration
                     * surface their respective per-cohort statistic.
                     */}
                    <label className="filter-label" data-testid="bias-overall-label">
                        {metricId === 'demographic_parity'
                            ? 'Overall accuracy'
                            : metricId === 'calibration'
                            ? 'Calibration gap'
                            : metricMeta.label}
                    </label>
                    <span className="mono large" data-testid="bias-overall">
                        {(data.overall * 100).toFixed(1)}%
                    </span>
                </div>
                {worstRow && (
                    <div className="filter-group">
                        <label className="filter-label">Worst cohort</label>
                        <span className="mono large" style={{ color: 'var(--sev-high)' }}>
                            {worstRow.seg} · {((worstRow.accuracy - data.overall) * 100).toFixed(1)}%
                        </span>
                    </div>
                )}
            </div>

            <div className="grid-2-equal" data-testid="bias-panels">
                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3 className="card-title">{metricMeta.label} per segment</h3>
                            <p className="card-sub">95% CI band, sample size weighted</p>
                        </div>
                    </div>
                    <div className="card-body">
                        {isUnknownMetric ? (
                            <div className="empty" data-testid="bias-unknown-metric-empty">
                                No SPA-side fixture data for the host-app custom metric
                                <b> {metricMeta.label}</b>. Hosts that ship the BE
                                metadata endpoint should also supply a matching dataset
                                payload via <code>/bias/snapshots</code>.
                            </div>
                        ) : (
                            <CohortParityChart rows={data.rows} overall={data.overall} />
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3 className="card-title">Drift · 13 weeks</h3>
                            <p className="card-sub">
                                Drift detected when a cohort moves &gt; 0.05 below overall accuracy
                            </p>
                        </div>
                    </div>
                    <div className="card-body">
                        {data.drift ? (
                            <CohortDriftChart drift={data.drift} dimensionMeta={dimensionMeta} />
                        ) : (
                            <div className="empty">Drift series not available for this dimension yet.</div>
                        )}
                    </div>
                </div>
            </div>

            {data.samples && data.samples.length > 0 && (
                <div className="card mt-16">
                    <div className="card-head">
                        <div>
                            <h3 className="card-title">Flagged samples</h3>
                            <p className="card-sub">Samples where expected vs actual diverged on the lagging cohort</p>
                        </div>
                    </div>
                    <table className="data-table" data-testid="bias-sample-table">
                        <thead>
                            <tr>
                                <th>Sample</th>
                                <th>Cohort</th>
                                <th>Expected</th>
                                <th>Actual</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {data.samples.map((sample) => (
                                <tr key={sample.id} className={sample.flagged ? 'row-flagged' : ''}>
                                    <td>{sample.text}</td>
                                    <td><ArticleRef>{sample.cohort}</ArticleRef></td>
                                    <td><code>{sample.expected}</code></td>
                                    <td><code style={{ color: 'var(--sev-high)' }}>{sample.actual}</code></td>
                                    <td>
                                        <button type="button" className="btn sm ghost">
                                            Inspect <I.ChevronRight size={11} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

interface CohortParityChartProps {
    rows: typeof COHORT_DATA['language']['rows'];
    overall: number;
}

function CohortParityChart({ rows, overall }: CohortParityChartProps) {
    const W = 480;
    const H = 220;
    const PAD = { t: 20, r: 20, b: 30, l: 40 };
    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;
    const barWidth = innerW / rows.length / 1.4;
    const minAcc = Math.min(...rows.map((row) => row.ciLow), 0.75);
    const maxAcc = 1.0;
    const yAt = (v: number) => PAD.t + innerH - ((v - minAcc) / (maxAcc - minAcc)) * innerH;
    const xCenter = (i: number) => PAD.l + (i + 0.5) * (innerW / rows.length);

    return (
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cohort parity chart" style={{ width: '100%', height: 240 }}>
            <line
                x1={PAD.l}
                x2={PAD.l + innerW}
                y1={yAt(overall)}
                y2={yAt(overall)}
                stroke="var(--accent)"
                strokeDasharray="3 3"
                strokeOpacity="0.7"
            />
            <text x={PAD.l + innerW - 4} y={yAt(overall) - 4} textAnchor="end" style={{ fontSize: 10, fill: 'var(--accent)' }}>
                overall {(overall * 100).toFixed(1)}%
            </text>

            {rows.map((row, index) => {
                const cx = xCenter(index);
                const x = cx - barWidth / 2;
                const y = yAt(row.accuracy);
                const ciHeight = yAt(row.ciLow) - yAt(row.ciHigh);
                const ciY = yAt(row.ciHigh);
                const tone = row.accuracy < overall - 0.05
                    ? 'var(--sev-critical)'
                    : row.accuracy < overall - 0.02
                        ? 'var(--sev-medium)'
                        : 'var(--sev-low)';
                return (
                    <g key={row.seg}>
                        <rect x={cx - 1} y={ciY} width={2} height={ciHeight} fill={tone} fillOpacity="0.3" />
                        <rect x={x} y={y} width={barWidth} height={PAD.t + innerH - y} fill={tone} rx="2" />
                        <text x={cx} y={PAD.t + innerH + 14} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--text-secondary)' }}>
                            {row.seg}
                        </text>
                        <text x={cx} y={y - 4} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                            {(row.accuracy * 100).toFixed(1)}%
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

interface CohortDriftChartProps {
    drift: Record<string, number[]>;
    dimensionMeta: typeof COHORT_DIMENSIONS[number] | undefined;
}

function CohortDriftChart({ drift, dimensionMeta }: CohortDriftChartProps) {
    const W = 480;
    const H = 220;
    const PAD = { t: 20, r: 30, b: 26, l: 36 };
    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;
    const lengths = Object.values(drift)[0]?.length ?? 0;
    const allValues = Object.values(drift).flat();
    const min = Math.min(...allValues, 0.8);
    const max = Math.max(...allValues, 1.0);
    const yAt = (v: number) => PAD.t + innerH - ((v - min) / (max - min || 1)) * innerH;
    const xAt = (i: number) => PAD.l + (i / Math.max(1, lengths - 1)) * innerW;

    const colors = ['#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#fb923c'];

    return (
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cohort drift chart" style={{ width: '100%', height: 240 }}>
            {Object.entries(drift).map(([seg, series], idx) => {
                const path = series.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(v)}`).join(' ');
                return (
                    <g key={seg}>
                        <path d={path} fill="none" stroke={colors[idx % colors.length]} strokeWidth="1.5" />
                        <text x={xAt(lengths - 1) + 4} y={yAt(series[series.length - 1]) + 3} style={{ fontSize: 10, fill: colors[idx % colors.length] }}>
                            {seg}
                        </text>
                    </g>
                );
            })}

            {[0, Math.floor(lengths / 2), lengths - 1].map((i) => (
                <g key={`x-${i}`}>
                    <text x={xAt(i)} y={PAD.t + innerH + 14} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--text-tertiary)' }}>
                        w-{lengths - 1 - i}
                    </text>
                </g>
            ))}
            {dimensionMeta && (
                <text x={PAD.l} y={PAD.t - 6} style={{ fontSize: 10, fill: 'var(--text-secondary)' }}>
                    {dimensionMeta.name} cohorts · {Object.keys(drift).length} segments
                </text>
            )}
        </svg>
    );
}
