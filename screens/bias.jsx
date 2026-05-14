// ============== Screen 6 — Bias Monitor ==============

function BiasScreen({ navigate }) {
  const [cohort, setCohort] = React.useState('language');
  const [segment, setSegment] = React.useState('it');
  const [alertOpen, setAlertOpen] = React.useState(false);

  const dim = COHORT_DIMENSIONS.find(c => c.key === cohort);
  const baseline = dim.segments.find(s => s.baseline);
  const segments = dim.segments;
  const driftData = BIAS_DRIFT_90D(cohort, segment);

  const driftedSegments = segments.filter(s => !s.baseline && s.accuracy < baseline.accuracy - 0.04);

  return (
    <div className="page" data-screen-label="Bias Monitor" style={{maxWidth: 'none'}}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Bias Monitor</h1>
          <p className="page-sub">
            Cohort parity, drift, and sample inspector · <span className="art-chip">AI Act Art. 10</span> <span className="art-chip">Art. 15</span> dataset quality &amp; bias requirements
          </p>
        </div>
        <div className="page-actions">
          <button className="btn"><IC.Download size={13}/> Export cohort report</button>
          <button className="btn primary" onClick={() => setAlertOpen(o => !o)}>
            <IC.Sliders size={13}/> {alertOpen ? 'Hide' : 'Configure'} alerts
          </button>
        </div>
      </div>

      {driftedSegments.length > 0 && (
        <div className="alert-banner warning">
          <IC.AlertOctagon size={16} className="alert-icon" style={{color:'var(--sev-medium)'}}/>
          <div>
            <b>Drift detected in {driftedSegments.length} segment{driftedSegments.length > 1 ? 's' : ''} of "{dim.label}" cohort</b>
            <small style={{display:'block', color:'var(--text-secondary)', marginTop:2}}>
              {driftedSegments.map(s => `${s.label} (-${((baseline.accuracy - s.accuracy)*100).toFixed(1)}%)`).join(', ')} · 95% CI does not overlap baseline
            </small>
          </div>
          <div className="spacer"/>
          <button className="btn sm" onClick={() => setSegment(driftedSegments[0].key)}>Investigate <I.ArrowRight size={12}/></button>
        </div>
      )}

      {/* Cohort selector */}
      <div className="bias-cohort-tabs">
        {COHORT_DIMENSIONS.map(d => {
          const Ic = IC[d.icon] || IC.Activity2;
          return (
            <button key={d.key} className={`cohort-tab ${cohort === d.key ? 'active' : ''}`}
                    onClick={() => { setCohort(d.key); setSegment(d.segments.find(s => !s.baseline)?.key || d.segments[0].key); }}>
              <Ic size={14}/>
              <span>{d.label}</span>
              <span className="seg-count">{d.segments.length} seg</span>
            </button>
          );
        })}
      </div>

      {/* Chart row */}
      <div style={{display:'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: 14, marginBottom: 14, alignItems:'start'}}>
        {/* Parity bars */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3 className="card-title">Accuracy parity</h3>
              <p className="card-sub">{dim.label} · baseline: {baseline.label} ({(baseline.accuracy*100).toFixed(1)}%)</p>
            </div>
          </div>
          <div className="card-body" style={{padding: 12}}>
            <ParityBars dim={dim} selected={segment} onSelect={setSegment}/>
          </div>
        </div>

        {/* Drift line chart */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3 className="card-title">Drift · 90 days</h3>
              <p className="card-sub">
                {dim.label} = <b style={{color:'var(--brand)'}}>{segments.find(s => s.key === segment)?.label || segment}</b> · daily accuracy
              </p>
            </div>
            <span className="mono" style={{fontSize: 11, color: driftedSegments.find(s => s.key === segment) ? 'var(--status-failed)' : 'var(--status-success)'}}>
              {((driftData[driftData.length-1].value - driftData[driftData.length-31].value)*100).toFixed(1)}% / 30d
            </span>
          </div>
          <div className="card-body">
            <LineChartCmp data={driftData.map(d => ({ ...d, value: d.value * 100 }))} xKey="day" yKey="value"
                          height={220}
                          accentColor={driftedSegments.find(s => s.key === segment) ? 'var(--status-failed)' : 'var(--brand)'}/>
          </div>
        </div>

        {/* Sample inspector */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3 className="card-title">Sample inspector</h3>
              <p className="card-sub">Misclassified samples · {segment.toUpperCase()}</p>
            </div>
            <button className="btn sm ghost"><IC.Eye size={12}/></button>
          </div>
          <div className="card-body flush" style={{maxHeight: 280, overflowY: 'auto'}}>
            {(BIAS_SAMPLES[segment] || []).length === 0 ? (
              <EmptyState art="Sparkles" title="No flagged samples" body={`All "${segment.toUpperCase()}" samples within tolerance.`}/>
            ) : BIAS_SAMPLES[segment].map(s => (
              <div key={s.id} className="sample-row">
                <div className="sample-row-text">{s.text}</div>
                <div className="sample-row-meta">
                  <span>{s.cohort.toUpperCase()}</span>
                  <span>·</span>
                  <span>expected <b style={{color:'var(--status-success)'}}>{s.expected}</b></span>
                  <span>·</span>
                  <span>got <b style={{color:'var(--status-failed)'}}>{s.actual}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cohort detail table */}
      <div className="card">
        <div className="card-head">
          <h3 className="card-title">Cohort breakdown</h3>
          <span className="badge outline">{segments.length} segments</span>
        </div>
        <div className="card-body flush">
          <table className="tbl">
            <thead>
              <tr>
                <th>Segment</th>
                <th className="num">Samples</th>
                <th className="num">Accuracy</th>
                <th className="num">Δ baseline</th>
                <th className="num">95% CI</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {segments.map(s => {
                const delta = s.accuracy - baseline.accuracy;
                const ciHalf = 1.96 * Math.sqrt(s.accuracy * (1 - s.accuracy) / s.samples);
                const ciLo = s.accuracy - ciHalf;
                const ciHi = s.accuracy + ciHalf;
                const overlapsBaseline = baseline.accuracy >= ciLo && baseline.accuracy <= ciHi;
                return (
                  <tr key={s.key} onClick={() => setSegment(s.key)}
                      style={{background: segment === s.key ? 'var(--bg-active)' : 'transparent'}}>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap: 6}}>
                        {s.baseline && <span className="art-chip" style={{fontSize: 9}}>baseline</span>}
                        <b>{s.label}</b>
                      </div>
                    </td>
                    <td className="num">{s.samples.toLocaleString()}</td>
                    <td className="num">{(s.accuracy*100).toFixed(1)}%</td>
                    <td className="num" style={{color: delta < -0.04 ? 'var(--status-failed)' : delta < -0.02 ? 'var(--status-paused)' : 'var(--text-secondary)'}}>
                      {s.baseline ? '—' : `${delta > 0 ? '+' : ''}${(delta*100).toFixed(1)}%`}
                    </td>
                    <td className="num" style={{fontSize: 11}}>[{(ciLo*100).toFixed(1)}, {(ciHi*100).toFixed(1)}]</td>
                    <td>
                      {s.baseline ? <span className="badge outline">baseline</span> :
                       s.severity === 'severe' ? <span className="badge failed"><span className="dot"/>severe</span> :
                       s.severity === 'warn' ? <span className="badge paused"><span className="dot"/>warn</span> :
                       <span className="badge success"><span className="dot"/>in tolerance</span>}
                    </td>
                    <td>
                      {!s.baseline && !overlapsBaseline && <span title="95% CI does not overlap baseline — statistically significant" style={{color:'var(--status-failed)'}}>⚠</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert config (expandable) */}
      {alertOpen && (
        <div className="card" style={{marginTop: 14}}>
          <div className="card-head">
            <h3 className="card-title">Alert thresholds</h3>
            <p className="card-sub">When breached, fires <code className="mono" style={{fontSize: 11}}>Log::alert</code> + optional notifications</p>
          </div>
          <div className="card-body">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Cohort</th>
                  <th>Trigger when</th>
                  <th>For</th>
                  <th>Action</th>
                  <th>Last fired</th>
                </tr>
              </thead>
              <tbody>
                {COHORT_DIMENSIONS.map(d => (
                  <tr key={d.key}>
                    <td><b>{d.label}</b></td>
                    <td className="mono" style={{fontSize: 12}}>
                      Δ accuracy &gt; <input className="input" defaultValue="5" style={{width: 48, padding: '2px 6px', display:'inline-block', fontSize: 11, textAlign:'center'}}/>%
                    </td>
                    <td className="mono" style={{fontSize: 12}}>
                      <input className="input" defaultValue="7" style={{width: 48, padding: '2px 6px', display:'inline-block', fontSize: 11, textAlign:'center'}}/> days
                    </td>
                    <td>
                      <select className="select" style={{fontSize: 12, padding:'3px 8px'}}>
                        <option>Log::alert</option>
                        <option>Email DPO</option>
                        <option selected={d.key === 'language'}>Create incident</option>
                      </select>
                    </td>
                    <td className="muted" style={{fontSize: 11, fontFamily:'var(--font-mono)'}}>
                      {d.key === 'language' ? '2h ago' : d.key === 'source' ? '8d ago' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ParityBars({ dim, selected, onSelect }) {
  const baseline = dim.segments.find(s => s.baseline);
  const maxA = Math.max(...dim.segments.map(s => s.accuracy)) + 0.02;
  const minA = Math.min(...dim.segments.map(s => s.accuracy)) - 0.04;
  const range = maxA - minA;
  const baselinePct = (baseline.accuracy - minA) / range;

  return (
    <div style={{position:'relative'}}>
      <div className="parity-bars">
        {dim.segments.map(s => {
          const h = ((s.accuracy - minA) / range) * 100;
          const severity = s.baseline ? '' : s.severity === 'severe' ? 'severe' : s.severity === 'warn' ? 'warn' : '';
          const ciHalf = 1.96 * Math.sqrt(s.accuracy * (1 - s.accuracy) / s.samples) * 100;
          return (
            <div key={s.key} className="parity-bar-col">
              <div className="parity-bar-wrap">
                <div className={`parity-bar ${severity}`}
                     onClick={() => onSelect(s.key)}
                     style={{
                       height: `${h}%`,
                       opacity: selected === s.key ? 1 : 0.85,
                       boxShadow: selected === s.key ? '0 0 0 2px var(--brand)' : 'none',
                     }}>
                  <span className="parity-bar-value">{(s.accuracy*100).toFixed(1)}</span>
                  {/* CI whiskers */}
                  <span style={{
                    position:'absolute', left:'50%', transform:'translateX(-50%)',
                    top: -ciHalf * 0.55, bottom: -ciHalf * 0.55,
                    width: 1, background:'var(--text)', opacity: 0.4
                  }}/>
                </div>
              </div>
              <div className="parity-bar-label">
                {s.label}
                {!s.baseline && s.severity === 'severe' && <span className="sig-mark">⚠</span>}
              </div>
              <div style={{fontSize: 10, color:'var(--text-tertiary)', fontFamily:'var(--font-mono)'}}>
                n={s.samples > 1000 ? `${(s.samples/1000).toFixed(1)}k` : s.samples}
              </div>
            </div>
          );
        })}
      </div>
      {/* Baseline dashed line */}
      <div style={{
        position:'absolute',
        left: 12, right: 8,
        bottom: 60 + (32 * baselinePct) + (180 * baselinePct),  // anchor near baseline accuracy
        height: 0,
        borderTop: '1.5px dashed var(--text)',
        opacity: 0.4,
        pointerEvents: 'none',
      }}/>
    </div>
  );
}

Object.assign(window, { BiasScreen });
