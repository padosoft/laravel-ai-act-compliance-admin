import { useMemo, useState } from 'react';

import { I } from '../../components/Icons';
import { ArticleRef } from '../../components/Primitives';
import { COHORT_DATA, COHORT_DIMENSIONS } from '../../lib/mock-data';

export function BiasScreen() {
    const [dimension, setDimension] = useState<string>('language');
    const data = COHORT_DATA[dimension] ?? COHORT_DATA.language;
    const dimensionMeta = COHORT_DIMENSIONS.find((d) => d.id === dimension);

    const worstRow = useMemo(
        () => data.rows.reduce((acc, row) => (row.accuracy < acc.accuracy ? row : acc), data.rows[0]),
        [data],
    );

    return (
        <div className="page" data-testid="bias-screen" data-state="ready">
            <div className="page-head">
                <div>
                    <h1 className="page-title">Bias Monitor</h1>
                    <p className="page-sub">
                        Cohort parity tracking · AI Act Art. 10 (training data) + Art. 15 (accuracy + robustness) ·{' '}
                        {COHORT_DIMENSIONS.length} dimensions
                    </p>
                </div>
                <div className="page-actions">
                    <button type="button" className="btn"><I.Download size={13} /> Export cohort report</button>
                </div>
            </div>

            <div className="filter-bar">
                <div className="filter-group">
                    <label className="filter-label">Cohort dimension</label>
                    <select
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
                    <label className="filter-label">Overall accuracy</label>
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
                            <h3 className="card-title">Accuracy parity per segment</h3>
                            <p className="card-sub">95% CI band, sample size weighted</p>
                        </div>
                    </div>
                    <div className="card-body">
                        <CohortParityChart rows={data.rows} overall={data.overall} />
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
