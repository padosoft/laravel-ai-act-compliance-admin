import { useState } from 'react';

import { I } from '../../components/Icons';
import { ArticleRef, Modal } from '../../components/Primitives';
import { fmtRelativeFrom } from '../../lib/helpers';
import { DATA_FLOW, DELETION_LOG, RETENTION } from '../../lib/mock-data';

export function DpoScreen() {
    const [attestOpen, setAttestOpen] = useState(false);

    return (
        <div className="page" data-testid="dpo-screen" data-state="ready">
            <div className="page-head">
                <div>
                    <h1 className="page-title">DPO Console</h1>
                    <p className="page-sub">
                        Retention policies · deletion log · attestation generator · data flow map
                    </p>
                </div>
                <div className="page-actions">
                    <button type="button" className="btn"><I.Download size={13} /> Export evidence pack</button>
                    <button
                        type="button"
                        className="btn primary"
                        onClick={() => setAttestOpen(true)}
                        data-testid="dpo-generate-attestation"
                    >
                        <I.Award size={13} /> Generate Article 30 attestation
                    </button>
                </div>
            </div>

            <div className="card" data-testid="dpo-data-flow">
                <div className="card-head">
                    <div>
                        <h3 className="card-title">Data flow map</h3>
                        <p className="card-sub">Visual processor topology · article reference per surface</p>
                    </div>
                </div>
                <div className="card-body">
                    <DataFlowDiagram />
                </div>
            </div>

            <div className="grid-2-equal mt-16">
                <div className="card" data-testid="dpo-retention">
                    <div className="card-head">
                        <div>
                            <h3 className="card-title">Retention policies</h3>
                            <p className="card-sub">Per-domain retention with reviewer + legal basis</p>
                        </div>
                    </div>
                    <table className="data-table compact">
                        <thead>
                            <tr>
                                <th>Domain</th>
                                <th>Days</th>
                                <th>Last reviewed</th>
                                <th>Basis</th>
                            </tr>
                        </thead>
                        <tbody>
                            {RETENTION.map((row) => (
                                <tr key={row.domain}>
                                    <td>{row.domain}</td>
                                    <td className="mono">{row.days}</td>
                                    <td>{fmtRelativeFrom(row.lastReviewed)}</td>
                                    <td><ArticleRef>{row.basis}</ArticleRef></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card" data-testid="dpo-deletion">
                    <div className="card-head">
                        <div>
                            <h3 className="card-title">Deletion log</h3>
                            <p className="card-sub">Last 60 days of cascading deletions and auto-prunes</p>
                        </div>
                    </div>
                    <table className="data-table compact">
                        <thead>
                            <tr>
                                <th>When</th>
                                <th>What</th>
                                <th>Rows</th>
                                <th>Cause</th>
                                <th>Actor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DELETION_LOG.map((row, index) => (
                                <tr key={`${row.at}-${index}`}>
                                    <td><time>{fmtRelativeFrom(row.at)}</time></td>
                                    <td>{row.what}</td>
                                    <td className="mono">{row.rows.toLocaleString()}</td>
                                    <td>{row.cause}</td>
                                    <td>{row.actor}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                open={attestOpen}
                onClose={() => setAttestOpen(false)}
                title="Generate Article 30 attestation"
                sub="Auditor-ready PDF · ISO 42001 + GDPR Art. 30 + AI Act Art. 11"
                footer={
                    <>
                        <button type="button" className="btn" onClick={() => setAttestOpen(false)}>Cancel</button>
                        <button type="button" className="btn primary">
                            <I.Download size={12} /> Generate PDF
                        </button>
                    </>
                }
            >
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    The attestation snapshot will include current retention policies, deletion log totals,
                    incident counts (last 90 days), DSAR throughput, and the compliance signer.
                </p>
                <ul style={{ fontSize: 13, color: 'var(--text-secondary)', paddingLeft: 18 }}>
                    <li>Records of processing per AI Act Art. 11 and GDPR Art. 30</li>
                    <li>Risk register snapshot (state at generation timestamp)</li>
                    <li>Bias drift summary per cohort dimension</li>
                    <li>Signed by the configured DPO identity</li>
                </ul>
            </Modal>
        </div>
    );
}

function DataFlowDiagram() {
    const W = 760;
    const H = 280;
    const COL_X = [60, 250, 440, 660];
    const ROW_H = 38;
    const sources = DATA_FLOW.nodes.filter((n) => n.col === 0);
    const processors = DATA_FLOW.nodes.filter((n) => n.col === 1);
    const core = DATA_FLOW.nodes.find((n) => n.col === 2);
    const outputs = DATA_FLOW.nodes.filter((n) => n.col === 3);

    function posOf(nodeId: string) {
        const node = DATA_FLOW.nodes.find((n) => n.id === nodeId);
        if (!node) return { x: 0, y: 0 };
        const col = COL_X[node.col];
        const peers = DATA_FLOW.nodes.filter((n) => n.col === node.col);
        const idx = peers.findIndex((n) => n.id === nodeId);
        const yStart = (H - peers.length * ROW_H) / 2;
        return { x: col, y: yStart + idx * ROW_H + ROW_H / 2 };
    }

    return (
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Data flow diagram" style={{ width: '100%', height: 320 }}>
            {DATA_FLOW.edges.map((edge, index) => {
                const from = posOf(edge.from);
                const to = posOf(edge.to);
                const dx = (to.x - from.x) * 0.4;
                const path = `M ${from.x + 30} ${from.y} C ${from.x + dx + 30} ${from.y} ${to.x - dx - 30} ${to.y} ${to.x - 30} ${to.y}`;
                const strokeWidth = Math.max(1, Math.log10(edge.vol) - 1.2);
                return (
                    <g key={`edge-${index}`} className="data-flow-edge">
                        <path d={path} stroke="var(--accent)" strokeOpacity="0.45" strokeWidth={strokeWidth} fill="none" />
                        <text
                            x={(from.x + to.x) / 2}
                            y={(from.y + to.y) / 2 - 4}
                            textAnchor="middle"
                            style={{ fontSize: 9, fill: 'var(--text-tertiary)' }}
                        >
                            {edge.label} · {edge.vol.toLocaleString()}
                        </text>
                    </g>
                );
            })}

            {DATA_FLOW.nodes.map((node) => {
                const { x, y } = posOf(node.id);
                return (
                    <g key={node.id} className={`data-flow-node ${node.kind}`}>
                        <rect x={x - 60} y={y - 14} width={120} height={28} rx="6" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
                        <text x={x} y={y + 4} textAnchor="middle" style={{ fontSize: 10.5, fill: 'var(--text)' }}>
                            {node.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}
