// ============== Screen 1 — Compliance Overview ==============

function OverviewScreen({ navigate }) {
  const now = NOW;
  const dsarOpen = DSAR_QUEUE.filter(d => d.status === 'pending' || d.status === 'in_progress').length;
  const dsarBreached = DSAR_QUEUE.filter(d => d.breach).length;
  const incidentsOpen = INCIDENTS.filter(i => i.status !== 'closed');
  const sevCounts = {
    critical: incidentsOpen.filter(i => i.severity === 'critical').length,
    high: incidentsOpen.filter(i => i.severity === 'high').length,
    medium: incidentsOpen.filter(i => i.severity === 'medium').length,
    low: incidentsOpen.filter(i => i.severity === 'low').length,
  };
  const consentAvg = 87.3; // 30d
  const biasWorst = COHORT_DIMENSIONS[0].segments.filter(s => !s.baseline)
    .reduce((acc, s) => s.accuracy < acc.accuracy ? s : acc, { accuracy: 1 });

  const dsarStatus = dsarBreached > 0 ? 'red' : dsarOpen > 0 ? 'amber' : 'green';
  const incStatus  = sevCounts.critical > 0 ? 'red' : (sevCounts.high + sevCounts.medium > 0) ? 'amber' : 'green';
  const consentStatus = consentAvg > 90 ? 'green' : consentAvg > 70 ? 'amber' : 'red';
  const biasStatus = biasWorst.accuracy < 0.80 ? 'red' : biasWorst.accuracy < 0.85 ? 'amber' : 'green';

  const lastAttestation = ATTESTATIONS[0];
  const daysSinceAtt = Math.floor((now - lastAttestation.signedAt) / DAY);
  const attStatus = daysSinceAtt < 90 ? 'green' : daysSinceAtt < 180 ? 'amber' : 'red';

  return (
    <div className="page" data-screen-label="Overview">
      <div className="page-head">
        <div>
          <h1 className="page-title">Compliance Overview</h1>
          <p className="page-sub">Last refreshed {fmtRelative(now - 18 * 1000)} · auto-refresh every 30s · scoped to <b style={{color:'var(--text-secondary)'}}>workspace · padosoft</b></p>
        </div>
        <div className="page-actions">
          <button className="btn"><IC.Download size={13}/> Export CSV</button>
          <button className="btn primary" onClick={() => navigate('dpo')}>
            <IC.Stamp size={13}/> Generate attestation
          </button>
        </div>
      </div>

      {dsarBreached > 0 && (
        <div className="alert-banner critical">
          <IC.AlertOctagon size={16} className="alert-icon" style={{color:'var(--sev-critical)'}}/>
          <div>
            <b>{dsarBreached} DSAR request has breached the 30-day GDPR SLA</b>
            <small style={{display:'block', color:'var(--text-secondary)', marginTop:2}}>Article 12(3) GDPR requires response within 1 month. Escalation to DPO recommended.</small>
          </div>
          <div className="spacer"/>
          <button className="btn sm" onClick={() => navigate('dsar')}>View DSAR Queue <I.ArrowRight size={12}/></button>
        </div>
      )}

      {/* KPI tiles */}
      <div className="kpi-grid">
        <KpiTile label="DSAR Queue" value={dsarOpen} status={dsarStatus} onClick={() => navigate('dsar')}>
          <div style={{fontSize:11, color:'var(--text-secondary)', marginTop:4, fontFamily:'var(--font-mono)'}}>
            {dsarBreached > 0 ? <><span style={{color:'var(--status-failed)'}}>{dsarBreached} breached</span> · 30d SLA</> : <>0 breached · 30d SLA</>}
          </div>
          <div className="kpi-trafficlight">
            <span className={`light green on`}/>
            <span className={`light amber ${dsarStatus !== 'green' ? 'on' : ''}`}/>
            <span className={`light red ${dsarStatus === 'red' ? 'on' : ''}`}/>
          </div>
          <div className="kpi-spark">
            <Sparkline data={DSAR_DEPTH_30D.map(d => d.depth)}
                       color={dsarStatus === 'red' ? 'var(--status-failed)' : dsarStatus === 'amber' ? 'var(--status-paused)' : 'var(--status-success)'}/>
          </div>
        </KpiTile>

        <KpiTile label="Open Incidents" value={incidentsOpen.length} status={incStatus} onClick={() => navigate('incidents')}>
          <div style={{fontSize:11, color:'var(--text-secondary)', marginTop:4}}>
            {sevCounts.critical > 0 && <span style={{color:'var(--sev-critical)', fontWeight:600}}>{sevCounts.critical} critical · </span>}
            {sevCounts.high} high · {sevCounts.medium} medium
          </div>
          <div className="kpi-minibars">
            {Array(sevCounts.critical).fill(0).map((_,i) => <span key={'c'+i} className="minibar critical" style={{height: 14}}/>)}
            {Array(sevCounts.high).fill(0).map((_,i) => <span key={'h'+i} className="minibar high" style={{height: 11}}/>)}
            {Array(sevCounts.medium).fill(0).map((_,i) => <span key={'m'+i} className="minibar medium" style={{height: 8}}/>)}
            {Array(sevCounts.low).fill(0).map((_,i) => <span key={'l'+i} className="minibar low" style={{height: 5}}/>)}
          </div>
        </KpiTile>

        <KpiTile label="Consent rate" value={`${consentAvg.toFixed(1)}%`} status={consentStatus} onClick={() => navigate('consent')}>
          <div style={{fontSize:11, color:'var(--text-secondary)', marginTop:4}}>
            30d average · 8 features
          </div>
          <div className="kpi-heatmap">
            {CONSENT_FEATURES.slice(0, 8).map((f, i) => {
              const trend = CONSENT_PER_FEATURE_TREND[f.key];
              const last = trend[trend.length - 1].value;
              const color = last > 90 ? 'var(--status-success)' : last > 70 ? 'var(--status-paused)' : 'var(--status-failed)';
              return <span key={i} className="cell" style={{background: color, opacity: 0.3 + (last/100)*0.7}} title={`${f.label}: ${last.toFixed(0)}%`}/>;
            })}
          </div>
        </KpiTile>

        <KpiTile label="Bias Monitor" value={`${(biasWorst.accuracy*100).toFixed(1)}%`}
                 status={biasStatus} onClick={() => navigate('bias')}>
          <div style={{fontSize:11, color:'var(--text-secondary)', marginTop:4}}>
            Worst cohort: <b style={{color: 'var(--text)'}}>language={biasWorst.key.toUpperCase()}</b>
          </div>
          <div className="kpi-trafficlight">
            <span className={`light green ${biasStatus === 'green' ? 'on' : ''}`}/>
            <span className={`light amber ${biasStatus === 'amber' ? 'on' : ''}`}/>
            <span className={`light red ${biasStatus === 'red' ? 'on' : ''}`}/>
            <span style={{marginLeft: 6, fontSize: 11, color:'var(--status-failed)', fontFamily:'var(--font-mono)', fontWeight: 500}}>
              -{((COHORT_DIMENSIONS[0].segments[0].accuracy - biasWorst.accuracy)*100).toFixed(1)}%
            </span>
          </div>
        </KpiTile>
      </div>

      {/* Activity + Chart */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1.2fr', gap: 16, marginBottom: 16}}>
        <div className="card">
          <div className="card-head">
            <div>
              <h3 className="card-title">Recent activity</h3>
              <p className="card-sub">Compliance events · last 24 hours</p>
            </div>
            <button className="btn sm ghost">View all <I.ArrowRight size={11}/></button>
          </div>
          <div className="card-body flush" style={{maxHeight: 360, overflowY: 'auto'}}>
            <div className="activity-list">
              {ACTIVITY.map(ev => {
                const IconComp = IC[ev.icon] || I[ev.icon] || IC.Activity2;
                return (
                  <div key={ev.id} className="activity-item" onClick={() => {
                    if (ev.type === 'dsar') navigate('dsar');
                    else if (ev.type === 'incident') navigate('incidents');
                    else if (ev.type === 'consent') navigate('consent');
                    else if (ev.type === 'risk') navigate('risks');
                    else if (ev.type === 'bias') navigate('bias');
                    else if (ev.type === 'attest' || ev.type === 'retention') navigate('dpo');
                  }}>
                    <div className={`activity-icon ${ev.kind}`}>
                      <IconComp size={13}/>
                    </div>
                    <div className="activity-text">
                      <b>{ev.title}</b>
                      <small>by {ev.actor === 'system' ? <span className="mono">system</span> : ev.actor}</small>
                    </div>
                    <span className="activity-time">{fmtRelativeFromNow(ev.time)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h3 className="card-title">DSAR Queue depth · 30d</h3>
              <p className="card-sub">Open requests per day · SLA threshold shaded</p>
            </div>
            <div style={{display:'flex', gap: 14, fontSize: 11, color:'var(--text-tertiary)', fontFamily:'var(--font-mono)'}}>
              <span><span style={{display:'inline-block', width: 8, height: 2, background: 'var(--brand)', marginRight: 4, verticalAlign: 'middle'}}/>queue depth</span>
              <span><span style={{display:'inline-block', width: 8, height: 8, background: 'var(--sev-medium)', opacity: 0.25, marginRight: 4, verticalAlign: 'middle'}}/>SLA band</span>
            </div>
          </div>
          <div className="card-body">
            <LineChartCmp data={DSAR_DEPTH_30D} xKey="day" yKey="depth"
                          height={220} thresholdLine={5} accentColor="var(--brand)"/>
          </div>
        </div>
      </div>

      {/* Compliance attestation card */}
      <div className="card">
        <div style={{display:'grid', gridTemplateColumns:'auto 1fr auto', gap: 24, padding: '18px 22px', alignItems:'center'}}>
          <div style={{
            width: 48, height: 48,
            borderRadius: 12,
            background: 'linear-gradient(135deg, var(--brand), #4338ca)',
            display: 'grid', placeItems: 'center', color: 'white'
          }}>
            <IC.Stamp size={22}/>
          </div>
          <div>
            <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 4}}>
              <h3 style={{margin:0, fontSize: 15, fontWeight: 600}}>Compliance attestation</h3>
              <span className={`badge ${attStatus === 'green' ? 'success' : attStatus === 'amber' ? 'paused' : 'failed'}`}>
                <span className="dot"/>{attStatus === 'green' ? 'Current' : attStatus === 'amber' ? 'Due soon' : 'Overdue'}
              </span>
            </div>
            <p style={{margin: 0, color: 'var(--text-secondary)', fontSize: 12.5}}>
              Last DPO review: <b style={{color:'var(--text)'}}>{daysSinceAtt} days ago</b> · {lastAttestation.id} · <span className="mono" style={{fontSize: 11.5}}>signed by {ADMINS.find(a=>a.id===lastAttestation.signedBy)?.name}</span>
            </p>
            <div style={{display:'flex', gap: 6, marginTop: 8}}>
              <span className="art-chip">AI Act Art. 11</span>
              <span className="art-chip">AI Act Annex IV</span>
              <span className="art-chip gdpr">GDPR Art. 30</span>
            </div>
          </div>
          <button className="btn primary" onClick={() => navigate('dpo')}>
            <IC.Stamp size={13}/> Generate next attestation <I.ArrowRight size={12}/>
          </button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 12, marginTop: 16}}>
        <ShortcutCard icon="ShieldAlert" title={`${RISKS.length} risks tracked`}
                      sub={`${RISKS.filter(r=>r.status==='open').length} open · ${RISKS.filter(r=>r.status==='in_progress').length} mitigating`}
                      onClick={() => navigate('risks')}/>
        <ShortcutCard icon="UserCheck" title={`${CONSENT_USERS.length} consenting users`}
                      sub="8 features · per-feature trend in detail"
                      onClick={() => navigate('consent')}/>
        <ShortcutCard icon="Workflow" title="Data flow map"
                      sub={`Art. 30 RoPA · ${RETENTION_POLICY.length} retention windows`}
                      onClick={() => navigate('dpo')}/>
      </div>
    </div>
  );
}

function KpiTile({ label, value, status, children, onClick }) {
  return (
    <div className={`kpi clickable`} onClick={onClick} style={{borderColor: status === 'red' ? 'var(--status-failed)' : status === 'amber' ? 'var(--status-paused)' : 'var(--border)'}}>
      <div className="kpi-label">
        {label}
        {status === 'red' && <IC.AlertOctagon size={12} style={{color:'var(--status-failed)'}}/>}
      </div>
      <div className="kpi-value">{value}</div>
      {children}
    </div>
  );
}

function ShortcutCard({ icon, title, sub, onClick }) {
  const IconComp = IC[icon] || I[icon] || IC.Activity2;
  return (
    <div className="card clickable" style={{cursor:'pointer'}} onClick={onClick}>
      <div style={{display:'flex', gap: 12, padding: '14px 16px', alignItems:'center'}}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'var(--brand-bg)', color: 'var(--brand)',
          display: 'grid', placeItems: 'center'
        }}>
          <IconComp size={16}/>
        </div>
        <div style={{flex: 1, minWidth: 0}}>
          <b style={{fontSize: 13, fontWeight: 600, display: 'block'}}>{title}</b>
          <small style={{fontSize: 11.5, color: 'var(--text-tertiary)'}}>{sub}</small>
        </div>
        <I.ArrowRight size={14} style={{color:'var(--text-tertiary)'}}/>
      </div>
    </div>
  );
}

// Custom line chart with hover tooltip
function LineChartCmp({ data, xKey, yKey, height = 220, thresholdLine, accentColor = 'var(--brand)' }) {
  const ref = React.useRef(null);
  const [hover, setHover] = React.useState(null);
  const [w, setW] = React.useState(800);
  React.useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setW(e.contentRect.width);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const pad = { l: 30, r: 12, t: 16, b: 22 };
  const innerW = Math.max(60, w - pad.l - pad.r);
  const innerH = height - pad.t - pad.b;
  const maxY = Math.max(...data.map(d => d[yKey]), thresholdLine || 0) * 1.25;
  const minY = 0;
  const xStep = innerW / Math.max(1, data.length - 1);
  const px = (i) => pad.l + i * xStep;
  const py = (v) => pad.t + innerH - ((v - minY) / (maxY - minY)) * innerH;

  const linePts = data.map((d, i) => `${px(i)},${py(d[yKey])}`).join(' ');
  const areaPts = `${pad.l},${pad.t + innerH} ${linePts} ${px(data.length - 1)},${pad.t + innerH}`;

  const onMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const i = Math.round((x - pad.l) / xStep);
    if (i >= 0 && i < data.length) setHover({ i, x: px(i), y: py(data[i][yKey]) });
    else setHover(null);
  };
  const onLeave = () => setHover(null);

  return (
    <div className="linechart" ref={ref} style={{height}}>
      <svg viewBox={`0 0 ${w} ${height}`} onMouseMove={onMove} onMouseLeave={onLeave}>
        {/* threshold band (SLA target) */}
        {thresholdLine != null && (
          <>
            <rect x={pad.l} y={py(thresholdLine + 2)} width={innerW} height={py(thresholdLine - 2) - py(thresholdLine + 2)} fill="var(--sev-medium)" opacity="0.08"/>
            <line x1={pad.l} y1={py(thresholdLine)} x2={pad.l + innerW} y2={py(thresholdLine)} stroke="var(--sev-medium)" strokeDasharray="3 3" strokeWidth="1" opacity="0.5"/>
          </>
        )}
        {/* grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <line key={i} x1={pad.l} x2={pad.l + innerW}
                y1={pad.t + innerH * (1 - p)} y2={pad.t + innerH * (1 - p)}
                stroke="var(--border)" strokeWidth="0.5"/>
        ))}
        {/* y labels */}
        {[0, 0.5, 1].map((p, i) => (
          <text key={i} x={pad.l - 6} y={pad.t + innerH * (1 - p) + 3} textAnchor="end"
                fontSize="9" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">
            {Math.round(maxY * p)}
          </text>
        ))}
        {/* area + line */}
        <polygon points={areaPts} fill={accentColor} opacity="0.10"/>
        <polyline points={linePts} fill="none" stroke={accentColor} strokeWidth="1.75"/>
        {/* points */}
        {data.map((d, i) => (
          <circle key={i} cx={px(i)} cy={py(d[yKey])} r={hover?.i === i ? 4 : 2.5}
                  fill={accentColor} stroke="var(--bg-elevated)" strokeWidth="1.5"/>
        ))}
        {/* x axis labels every 5 days */}
        {data.map((d, i) => i % 5 === 0 ? (
          <text key={i} x={px(i)} y={height - 6} textAnchor="middle"
                fontSize="9" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">
            d{d[xKey]}
          </text>
        ) : null)}
        {/* hover vertical line */}
        {hover && (
          <line x1={hover.x} x2={hover.x} y1={pad.t} y2={pad.t + innerH}
                stroke="var(--text-tertiary)" strokeWidth="0.75" strokeDasharray="2 2"/>
        )}
      </svg>
      {hover && (
        <div className="linechart-tooltip" style={{
          left: Math.min(w - 130, hover.x + 8),
          top: Math.max(0, hover.y - 32)
        }}>
          <b className="mono">day {data[hover.i][xKey]}</b>
          <span style={{color:'var(--text-secondary)', marginLeft: 8}} className="mono">{data[hover.i][yKey]} open</span>
        </div>
      )}
    </div>
  );
}

function fmtRelativeFromNow(ts) {
  const diff = (NOW - ts) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff/60)}m`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h`;
  return `${Math.floor(diff/86400)}d`;
}

Object.assign(window, { OverviewScreen, LineChartCmp, KpiTile, fmtRelativeFromNow });
