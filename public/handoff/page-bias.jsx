// ============== Screen 6: Bias Monitor — Parity + Drift + Sample inspector ==============

function PageBias({ onNavigate }) {
  const [cohortKey, setCohortKey] = React.useState('language');
  const [selectedSeg, setSelectedSeg] = React.useState(null);
  const [hidden, setHidden] = React.useState(new Set());
  const [alertsOpen, setAlertsOpen] = React.useState(false);

  const cohort = COHORT_DIMENSIONS.find(d => d.id === cohortKey);
  const data = COHORT_DATA[cohortKey] || COHORT_DATA.language;
  const tolerance = 0.02;
  const severe = 0.05;

  return (
    <div className="page wide" data-screen-label="Bias Monitor">
      <div className="page-head">
        <div>
          <h1 className="page-title">Bias Monitor</h1>
          <p className="page-sub">
            Cohort parity monitoring per AI Act Art. 10 · drift detection · alerting · forensic sample inspector
          </p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => setAlertsOpen(o => !o)}>
            <I.Bell size={13}/> Alert thresholds
          </button>
          <button className="btn"><I.Download size={13}/> Export report</button>
        </div>
      </div>

      {/* Cohort selector */}
      <div className="card mb-16">
        <div className="card-body" style={{padding:14}}>
          <div className="center" style={{gap:6, flexWrap:'wrap'}}>
            <span style={{fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-tertiary)', fontWeight:600, marginRight:8}}>
              Cohort dimension
            </span>
            {COHORT_DIMENSIONS.map(d => (
              <button key={d.id}
                      className={`chip ${cohortKey === d.id ? 'active' : ''}`}
                      onClick={() => { setCohortKey(d.id); setSelectedSeg(null); setHidden(new Set()); }}>
                {d.name}
                <span className="count">{d.segments.length}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {alertsOpen && <AlertConfigPanel data={data} segments={cohort.segments} onClose={() => setAlertsOpen(false)}/>}

      {/* 3-panel charts */}
      <div style={{display:'grid', gridTemplateColumns:'1.1fr 1.4fr 1fr', gap:16, marginBottom:16}}>
        <ParityChart data={data} tolerance={tolerance} severe={severe}
                     onSelectSeg={setSelectedSeg} selectedSeg={selectedSeg}/>
        <DriftChart data={data} hidden={hidden} onToggle={(seg) => {
          setHidden(prev => {
            const next = new Set(prev);
            if (next.has(seg)) next.delete(seg); else next.add(seg);
            return next;
          });
        }} severe={severe}/>
        <SampleInspector samples={data.samples || []} selectedSeg={selectedSeg}/>
      </div>

      {/* Insights row */}
      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Statistical significance · 95% CI</h3>
            <span className="badge outline">{data.rows.length} segments</span>
          </div>
          <div className="card-body" style={{paddingTop:6}}>
            <p style={{fontSize:11.5, color:'var(--text-tertiary)', margin:'0 0 8px'}}>
              Segments whose 95% confidence interval does <b>not</b> overlap the overall mean ({(data.overall * 100).toFixed(1)}%) are flagged.
            </p>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Segment</th>
                  <th className="num">N</th>
                  <th>95% CI</th>
                  <th>Δ vs mean</th>
                  <th>Significance</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map(r => {
                  const delta = (r.accuracy - data.overall) * 100;
                  const sig = r.ciHigh < data.overall || r.ciLow > data.overall;
                  return (
                    <tr key={r.seg} style={{cursor:'pointer'}} onClick={() => setSelectedSeg(r.seg)}>
                      <td className="mono"><b style={{fontWeight:600}}>{r.seg}</b></td>
                      <td className="num">{r.samples.toLocaleString()}</td>
                      <td className="mono" style={{fontSize:11.5}}>
                        [{(r.ciLow * 100).toFixed(1)} – {(r.ciHigh * 100).toFixed(1)}]
                      </td>
                      <td className="mono" style={{
                        color: delta < -severe * 100 ? 'var(--sev-critical)' : delta < -tolerance * 100 ? 'var(--sev-medium)' : 'var(--sev-low)',
                      }}>
                        {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
                      </td>
                      <td>{sig
                        ? <span className="sev critical"><I.AlertTriangle size={10}/> significant</span>
                        : <span className="text-tertiary text-xs">overlaps mean</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Active findings</h3>
            <span className="badge outline">AI Act Art. 10 + 15</span>
          </div>
          <div className="card-body" style={{paddingTop:8}}>
            <Finding tone="critical"
                     title={`${cohort.name} cohort drift detected`}
                     body={`${data.rows.find(r => r.accuracy === Math.min(...data.rows.map(x => x.accuracy))).seg} segment trailing overall mean by 4%+ over a 90-day window. Mitigation recommended.`}/>
            <Finding tone="medium"
                     title="Sample volume imbalance"
                     body={`${data.rows[data.rows.length - 1].seg} has < 1k samples — confidence interval is wide. Consider over-sampling for next eval cycle.`}/>
            <Finding tone="low"
                     title="No demographic-attribute leakage detected"
                     body="Protected-attribute inference checks passed in last 30 days · Art. 5(1)(b) compliance."/>
          </div>
        </div>
      </div>
    </div>
  );
}

function Finding({ tone, title, body }) {
  return (
    <div style={{
      padding:'11px 12px', borderRadius:'var(--radius-sm)',
      background: `var(--sev-${tone}-bg)`,
      border: `1px solid var(--sev-${tone})`,
      marginBottom: 10,
    }}>
      <div className="center gap-8 mb-8">
        <SevBadge level={tone}/>
        <b style={{fontSize:12.5, fontWeight:600}}>{title}</b>
      </div>
      <div style={{fontSize:12, color:'var(--text-secondary)', lineHeight:1.5}}>{body}</div>
    </div>
  );
}

// ---- Parity chart (animated bars) ----
function ParityChart({ data, tolerance, severe, onSelectSeg, selectedSeg }) {
  const max = Math.max(...data.rows.map(r => r.accuracy), data.overall) + 0.02;
  const overallPct = (data.overall / max) * 100;

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3 className="card-title">Accuracy parity</h3>
          <p className="card-sub">Per-segment accuracy vs. overall mean (dashed)</p>
        </div>
        <span className="badge outline mono">μ = {(data.overall * 100).toFixed(1)}%</span>
      </div>
      <div className="card-body parity-chart" style={{paddingTop:14}}>
        {data.rows.map((r, i) => {
          const delta = r.accuracy - data.overall;
          const tone = delta < -severe ? 'alert' : delta < -tolerance ? 'high' : 'ok';
          const widthPct = (r.accuracy / max) * 100;
          const ciLowPct = (r.ciLow / max) * 100;
          const ciHighPct = (r.ciHigh / max) * 100;
          const sig = r.ciHigh < data.overall || r.ciLow > data.overall;
          const isSelected = selectedSeg === r.seg;

          return (
            <div key={r.seg} className="parity-row" onClick={() => onSelectSeg(r.seg)}
                 style={{cursor:'pointer', background: isSelected ? 'var(--bg-hover)' : 'transparent', borderRadius:3, padding:'6px 4px'}}>
              <span className="seg">{r.seg}</span>
              <div className="bar-track">
                <div className={`bar-fill ${tone}`} style={{
                  width: `${widthPct}%`,
                  transitionDelay: `${i * 40}ms`,
                }}/>
                {/* CI markers */}
                <div className="ci-marker" style={{left:`${ciLowPct}%`}}/>
                <div className="ci-marker" style={{left:`${ciHighPct}%`}}/>
                {/* Overall mean dashed line */}
                <div className="overall-marker" style={{left:`${overallPct}%`}}/>
              </div>
              <span className="val">
                {sig && <span className="sig" title="Statistically significant"><I.AlertTriangle size={10}/></span>}
                {(r.accuracy * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
        <div style={{display:'flex', justifyContent:'space-between', fontSize:9.5, color:'var(--text-tertiary)', marginTop:10, fontFamily:'var(--font-mono)'}}>
          <span>0</span>
          <span>{(max * 50).toFixed(0)}</span>
          <span>{(max * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

// ---- Drift chart (multi-line, 90d) ----
function DriftChart({ data, hidden, onToggle, severe }) {
  const W = 540, H = 220, PAD = { t: 14, r: 14, b: 22, l: 36 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;

  const segs = data.rows.map(r => r.seg);
  const drift = data.drift || {};
  const all = segs.flatMap(s => drift[s] || []);
  if (all.length === 0) return null;

  const min = Math.min(...all) - 0.005;
  const max = Math.max(...all) + 0.005;
  const xAt = (i) => PAD.l + (i / ((drift[segs[0]]?.length || 1) - 1)) * iW;
  const yAt = (v) => PAD.t + (1 - (v - min) / (max - min)) * iH;

  const COLORS = ['#3b82f6','#ef4444','#f59e0b','#10b981','#a78bfa','#ec4899'];
  const [hover, setHover] = React.useState(null);

  const threshTop = yAt(data.overall - severe);

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3 className="card-title">Drift over time · 90 days</h3>
          <p className="card-sub">Weekly accuracy per segment · shaded zone = drift threshold</p>
        </div>
      </div>
      <div className="card-body" style={{paddingTop:6}}>
        <svg className="drift-svg" viewBox={`0 0 ${W} ${H}`}
             onMouseLeave={() => setHover(null)}>
          {/* threshold band (below overall - severe) */}
          <rect x={PAD.l} y={threshTop} width={iW} height={PAD.t + iH - threshTop}
                className="drift-thresh"/>

          {/* gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const v = min + (max - min) * (1 - p);
            return (
              <g key={i}>
                <line x1={PAD.l} x2={PAD.l + iW} y1={yAt(v)} y2={yAt(v)} stroke="var(--border)" strokeDasharray="2 3"/>
                <text x={PAD.l - 6} y={yAt(v) + 3} textAnchor="end"
                      style={{fontSize:9, fill:'var(--text-tertiary)', fontFamily:'var(--font-mono)'}}>
                  {(v * 100).toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* overall mean dashed */}
          <line x1={PAD.l} x2={PAD.l + iW} y1={yAt(data.overall)} y2={yAt(data.overall)}
                stroke="var(--text)" strokeOpacity="0.4" strokeDasharray="4 3"/>

          {/* Lines */}
          {segs.map((seg, i) => {
            if (hidden.has(seg)) return null;
            const points = (drift[seg] || []).map((v, idx) => `${xAt(idx)},${yAt(v)}`).join(' ');
            return (
              <polyline key={seg}
                        className="drift-line"
                        points={points}
                        stroke={COLORS[i % COLORS.length]}/>
            );
          })}

          {/* Hover guide */}
          {(drift[segs[0]] || []).map((_, idx) => (
            <rect key={idx} x={xAt(idx) - iW / drift[segs[0]].length / 2} y={PAD.t}
                  width={iW / drift[segs[0]].length} height={iH}
                  fill="transparent" style={{cursor:'crosshair'}}
                  onMouseEnter={() => setHover(idx)}/>
          ))}
          {hover != null && (
            <line x1={xAt(hover)} x2={xAt(hover)} y1={PAD.t} y2={PAD.t + iH}
                  stroke="var(--text)" strokeOpacity="0.2" pointerEvents="none"/>
          )}
          {hover != null && segs.map((seg, i) => {
            if (hidden.has(seg)) return null;
            const v = (drift[seg] || [])[hover];
            if (v == null) return null;
            return (
              <circle key={seg} cx={xAt(hover)} cy={yAt(v)} r="3.5"
                      fill={COLORS[i % COLORS.length]} stroke="var(--bg-elevated)" strokeWidth="2"
                      pointerEvents="none"/>
            );
          })}

          <text x={PAD.l} y={H - 4} style={{fontSize:9, fill:'var(--text-tertiary)', fontFamily:'var(--font-mono)'}}>w-12</text>
          <text x={PAD.l + iW} y={H - 4} textAnchor="end" style={{fontSize:9, fill:'var(--text-tertiary)', fontFamily:'var(--font-mono)'}}>now</text>
        </svg>

        <div className="drift-legend">
          {segs.map((seg, i) => (
            <div key={seg} className={`item ${hidden.has(seg) ? 'dim' : ''}`} onClick={() => onToggle(seg)}>
              <span className="swatch" style={{background: COLORS[i % COLORS.length]}}/>
              <span className="mono">{seg}</span>
              {hover != null && drift[seg] && !hidden.has(seg) && (
                <span className="mono" style={{color:'var(--text-tertiary)', fontSize:10.5}}>
                  {(drift[seg][hover] * 100).toFixed(1)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Sample inspector ----
function SampleInspector({ samples, selectedSeg }) {
  const filtered = selectedSeg ? samples.filter(s => s.cohort === selectedSeg) : samples;

  return (
    <div className="card" style={{display:'flex', flexDirection:'column', overflow:'hidden'}}>
      <div className="card-head">
        <div>
          <h3 className="card-title">Sample inspector</h3>
          <p className="card-sub">
            {selectedSeg
              ? <>Filtered to <b className="mono">{selectedSeg}</b> · {filtered.length} samples</>
              : <>Flagged samples · click a segment to filter</>}
          </p>
        </div>
        <span className="badge failed" style={{fontSize:10}}>
          <span className="dot"/>{filtered.length} flagged
        </span>
      </div>
      <div style={{overflow:'auto', flex:1}}>
        {filtered.length === 0 ? (
          <EmptyState title="No flagged samples" body="All samples in this cohort passed the eval thresholds."/>
        ) : filtered.map(s => (
          <div className="sample-row" key={s.id}>
            <div className="top">
              <span className="mono">{s.id}</span>
              <span className="badge outline" style={{fontSize:10}}>{s.cohort}</span>
            </div>
            <div className="text">"{s.text}"</div>
            <div className="verdict">
              <span><b className="text-tertiary">expected:</b> <span className="exp">{s.expected}</span></span>
              <span><b className="text-tertiary">actual:</b> <span className="act">{s.actual}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Alert configuration panel ----
function AlertConfigPanel({ data, segments, onClose }) {
  const [threshold, setThreshold] = React.useState(5);
  const [windowDays, setWindowDays] = React.useState(7);
  const [trigger, setTrigger] = React.useState('incident');

  return (
    <div className="card mb-16" style={{border:'1px solid var(--accent-border)', background:'var(--accent-bg)'}}>
      <div className="card-head" style={{background:'transparent'}}>
        <div>
          <h3 className="card-title">Alert thresholds · {data === COHORT_DATA.language ? 'Language' : 'Cohort'}</h3>
          <p className="card-sub">Trigger an incident when a segment deviates from overall mean for N days</p>
        </div>
        <button className="iconbtn" onClick={onClose}><I.X size={14}/></button>
      </div>
      <div className="card-body" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:14, alignItems:'end'}}>
        <div>
          <label style={{fontSize:11, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600}}>
            Accuracy delta threshold
          </label>
          <div className="center gap-8 mt-8">
            <input type="range" min="1" max="15" step="0.5" value={threshold}
                   onChange={e => setThreshold(parseFloat(e.target.value))}
                   style={{flex:1}}/>
            <b className="mono" style={{minWidth:48, textAlign:'right'}}>{threshold}%</b>
          </div>
        </div>
        <div>
          <label style={{fontSize:11, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600}}>
            Sustained window
          </label>
          <div className="center gap-8 mt-8">
            <input type="range" min="1" max="30" step="1" value={windowDays}
                   onChange={e => setWindowDays(parseFloat(e.target.value))}
                   style={{flex:1}}/>
            <b className="mono" style={{minWidth:48, textAlign:'right'}}>{windowDays}d</b>
          </div>
        </div>
        <div>
          <label style={{fontSize:11, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600}}>
            Trigger action
          </label>
          <select className="select mt-8" value={trigger} onChange={e => setTrigger(e.target.value)}>
            <option value="incident">Create incident (severity: high)</option>
            <option value="email">Email DPO</option>
            <option value="alert">Log::alert + Slack notify</option>
          </select>
        </div>
        <button className="btn primary"><I.Check size={12}/> Save thresholds</button>
      </div>
    </div>
  );
}

window.PageBias = PageBias;
