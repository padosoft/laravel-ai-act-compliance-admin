// ============== Screen 7: DPO Console ==============
// Retention review · Deletion log · Consent revocation audit · Data flow map (Sankey) · Attestation generator

function PageDPO({ onNavigate }) {
  return (
    <div className="page wide" data-screen-label="DPO Console">
      <div className="page-head">
        <div>
          <h1 className="page-title">DPO Console</h1>
          <p className="page-sub">
            Data Protection Officer workspace · retention · deletion · data flow · attestation generator
          </p>
        </div>
        <div className="page-actions">
          <div className="center gap-6" style={{flexWrap:'wrap'}}>
            <ArticleRef>GDPR Art. 30</ArticleRef>
            <ArticleRef>AI Act Art. 11</ArticleRef>
            <ArticleRef>ISO 42001 §6.2</ArticleRef>
          </div>
        </div>
      </div>

      {/* Row 1: Retention + Deletion log */}
      <div className="grid-2 mt-16" style={{marginTop:0}}>
        <RetentionCard/>
        <DeletionLogCard/>
      </div>

      {/* Row 2: Consent revocation + Data Flow */}
      <div className="grid-2-1-2">
        <RevocationAuditCard/>
        <DataFlowCard/>
      </div>

      {/* Row 3: Attestation generator (full width) */}
      <div className="card mt-16">
        <div className="card-head">
          <div>
            <h3 className="card-title">Compliance Attestation Generator</h3>
            <p className="card-sub">Auditor-ready PDF · signed &amp; dated · scoped to selected period</p>
          </div>
          <span className="badge success" style={{fontSize:11}}>
            <span className="dot"/>Last generated {fmtRelativeFrom(window.NOW - 23 * 86400_000)}
          </span>
        </div>
        <div className="card-body">
          <AttestationGenerator/>
        </div>
      </div>
    </div>
  );
}

// ---------- Retention review card ----------
function RetentionCard() {
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3 className="card-title">Retention policy review</h3>
          <p className="card-sub">Per data domain · GDPR Art. 5(1)(e) storage limitation</p>
        </div>
        <button className="btn sm"><I.Check size={11}/> Mark all reviewed</button>
      </div>
      <div className="card-body flush">
        <table className="tbl">
          <thead>
            <tr>
              <th>Domain</th>
              <th className="num">Retention</th>
              <th>Basis</th>
              <th>Reviewed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {RETENTION.map(r => (
              <tr key={r.domain} style={{cursor:'default'}}>
                <td><b style={{fontWeight:500}}>{r.domain}</b></td>
                <td className="num mono">{r.days < 365 ? `${r.days}d` : `${Math.round(r.days/365 * 10) / 10}y`}</td>
                <td className="muted text-xs">{r.basis}</td>
                <td className="mono muted text-xs">{fmtRelativeFrom(r.lastReviewed)}</td>
                <td>
                  <div className="center gap-6">
                    <button className="btn sm ghost"><I.Edit size={11}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Deletion log ----------
function DeletionLogCard() {
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3 className="card-title">Deletion log</h3>
          <p className="card-sub">All hard deletes · DSAR-driven + auto-prune</p>
        </div>
        <button className="btn sm"><I.Download size={11}/> Export CSV</button>
      </div>
      <div className="card-body flush">
        <table className="tbl">
          <thead>
            <tr>
              <th>When</th>
              <th>What</th>
              <th className="num">Rows</th>
              <th>Cause</th>
              <th>Actor</th>
            </tr>
          </thead>
          <tbody>
            {DELETION_LOG.map((d, i) => (
              <tr key={i} style={{cursor:'default'}}>
                <td className="mono text-xs">{fmtRelativeFrom(d.at)}</td>
                <td><b style={{fontWeight:500, fontSize:12}}>{d.what}</b></td>
                <td className="num mono">{d.rows.toLocaleString()}</td>
                <td className="muted text-xs">
                  {d.cause.startsWith('DSAR')
                    ? <span className="mono">{d.cause}</span>
                    : d.cause}
                </td>
                <td className="muted text-xs">{d.actor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Consent revocation audit ----------
function RevocationAuditCard() {
  // Synthesize per-cause percentages
  const causes = [
    { label: 'Vague privacy notice', pct: 38, color: 'var(--sev-critical)' },
    { label: 'Unexpected use',        pct: 24, color: 'var(--sev-high)' },
    { label: 'Marketing fatigue',     pct: 18, color: 'var(--sev-medium)' },
    { label: 'Account cleanup',       pct: 12, color: 'var(--sev-info)' },
    { label: 'Other',                 pct:  8, color: 'var(--text-tertiary)' },
  ];
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3 className="card-title">Consent revocation audit</h3>
          <p className="card-sub">Per-period revocation rates &amp; cause analysis</p>
        </div>
      </div>
      <div className="card-body">
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8, marginBottom:18}}>
          {[
            { label: '7d',  val: 18,  delta: '+12%' },
            { label: '30d', val: 74,  delta: '+8%' },
            { label: '90d', val: 211, delta: '-3%' },
            { label: 'all', val: 1284,delta: 'lifetime' },
          ].map(s => (
            <div key={s.label} style={{padding:'10px 12px', background:'var(--bg-subtle)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)'}}>
              <div style={{fontSize:10, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-tertiary)', fontWeight:600}}>{s.label}</div>
              <div style={{fontSize:18, fontWeight:600, fontFamily:'var(--font-sans)', letterSpacing:'-0.02em', marginTop:4}}>
                {s.val.toLocaleString()}
              </div>
              <div style={{fontSize:10.5, color:'var(--text-tertiary)', fontFamily:'var(--font-mono)'}}>{s.delta}</div>
            </div>
          ))}
        </div>

        <h5 style={{fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-tertiary)', fontWeight:600, marginBottom:8}}>
          Cause analysis · last 90 days
        </h5>
        <div className="row-gap-12">
          {causes.map(c => (
            <div key={c.label}>
              <div className="between" style={{fontSize:12, marginBottom:4}}>
                <span>{c.label}</span>
                <span className="mono" style={{color:'var(--text-tertiary)'}}>{c.pct}%</span>
              </div>
              <div style={{height:6, background:'var(--bg-subtle)', borderRadius:3, overflow:'hidden'}}>
                <div style={{
                  width: `${c.pct}%`,
                  height: '100%',
                  background: c.color,
                  borderRadius: 3,
                  transition: 'width 600ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Data Flow Map (custom Sankey) ----------
function DataFlowCard() {
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3 className="card-title">Data flow map · Article 30 records of processing</h3>
          <p className="card-sub">Hover edges for volume · click nodes for processor detail</p>
        </div>
        <button className="btn sm"><I.Download size={11}/> Export PNG</button>
      </div>
      <div className="card-body" style={{paddingTop:6}}>
        <SankeyChart data={DATA_FLOW}/>
      </div>
    </div>
  );
}

// Simple custom Sankey
function SankeyChart({ data }) {
  const W = 720, H = 360, PAD = 12;
  const COLS = 4;
  const colW = (W - PAD * 2) / COLS;
  const [hover, setHover] = React.useState(null);

  // Compute node volumes (max in/out) for height
  const nodeVol = {};
  data.nodes.forEach(n => {
    const out = data.edges.filter(e => e.from === n.id).reduce((a, e) => a + e.vol, 0);
    const inv = data.edges.filter(e => e.to   === n.id).reduce((a, e) => a + e.vol, 0);
    nodeVol[n.id] = Math.max(out, inv, 1);
  });

  // Layout per column
  const cols = {};
  data.nodes.forEach(n => {
    cols[n.col] = cols[n.col] || [];
    cols[n.col].push(n);
  });
  const layout = {};
  Object.keys(cols).forEach(col => {
    const ns = cols[col];
    const totalVol = ns.reduce((a, n) => a + nodeVol[n.id], 0);
    const gap = 14;
    const availH = H - PAD * 2 - gap * (ns.length - 1);
    let y = PAD;
    ns.forEach(n => {
      const h = Math.max(28, (nodeVol[n.id] / totalVol) * availH);
      const x = PAD + Number(col) * colW + 4;
      layout[n.id] = { x, y, w: 130, h };
      y += h + gap;
    });
  });

  // For each node, compute outgoing edge y-offsets & incoming
  const outPos = {};  // edgeKey -> { y0, h }
  const inPos  = {};
  data.nodes.forEach(n => {
    const outEdges = data.edges.filter(e => e.from === n.id);
    const totalOut = outEdges.reduce((a, e) => a + e.vol, 0);
    let yc = layout[n.id].y;
    outEdges.forEach(e => {
      const h = (e.vol / Math.max(totalOut, 1)) * layout[n.id].h;
      outPos[`${e.from}>${e.to}`] = { y: yc, h };
      yc += h;
    });
    const inEdges = data.edges.filter(e => e.to === n.id);
    const totalIn = inEdges.reduce((a, e) => a + e.vol, 0);
    let yi = layout[n.id].y;
    inEdges.forEach(e => {
      const h = (e.vol / Math.max(totalIn, 1)) * layout[n.id].h;
      inPos[`${e.from}>${e.to}`] = { y: yi, h };
      yi += h;
    });
  });

  return (
    <svg className="sankey-svg" viewBox={`0 0 ${W} ${H}`}>
      {/* Edges as bezier ribbons */}
      {data.edges.map(e => {
        const a = layout[e.from], b = layout[e.to];
        if (!a || !b) return null;
        const op = outPos[`${e.from}>${e.to}`];
        const ip = inPos[`${e.from}>${e.to}`];
        const x0 = a.x + a.w, x1 = b.x;
        const y0 = op.y, y1 = ip.y;
        const h0 = op.h,  h1 = ip.h;
        const cx0 = x0 + (x1 - x0) * 0.5;
        const cx1 = cx0;
        const d = `M ${x0} ${y0} C ${cx0} ${y0} ${cx1} ${y1} ${x1} ${y1} L ${x1} ${y1 + h1} C ${cx1} ${y1 + h1} ${cx0} ${y0 + h0} ${x0} ${y0 + h0} Z`;
        const key = `${e.from}>${e.to}`;
        const fromNode = data.nodes.find(n => n.id === e.from);
        const isHovered = hover === key;
        const isDim = hover && hover !== key;
        return (
          <g key={key}>
            <path d={d}
                  className={`sankey-edge ${fromNode.kind} ${isDim ? 'dim' : ''}`}
                  onMouseEnter={() => setHover(key)}
                  onMouseLeave={() => setHover(null)}
                  style={isHovered ? { fillOpacity: 0.5 } : null}/>
          </g>
        );
      })}
      {/* Nodes */}
      {data.nodes.map(n => {
        const p = layout[n.id];
        const COLOR = {
          source: '#2563eb', processor: '#d97706', core: 'var(--accent)', output: '#7c3aed',
        }[n.kind] || 'var(--text)';
        return (
          <g key={n.id} className="sankey-node">
            <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={3}
                  fill={COLOR} fillOpacity="0.85"/>
            <text x={p.x + p.w + 6} y={p.y + p.h / 2 + 3}
                  style={{fontSize:11, fill:'var(--text)', fontWeight:500, fontFamily:'var(--font-sans)'}}
                  textAnchor={n.col === 3 ? 'end' : 'start'}>
              {n.col === 3
                ? null /* drawn on left of node for last col below */
                : n.label}
            </text>
            {n.col === 3 && (
              <text x={p.x - 6} y={p.y + p.h / 2 + 3}
                    style={{fontSize:11, fill:'var(--text)', fontWeight:500, fontFamily:'var(--font-sans)'}}
                    textAnchor="end">
                {n.label}
              </text>
            )}
            <text x={p.x + p.w + 6} y={p.y + p.h / 2 + 16}
                  style={{fontSize:9.5, fill:'var(--text-tertiary)', fontFamily:'var(--font-mono)'}}
                  textAnchor={n.col === 3 ? 'end' : 'start'}>
              {n.col === 3 ? null : nodeVol[n.id].toLocaleString()}
            </text>
            {n.col === 3 && (
              <text x={p.x - 6} y={p.y + p.h / 2 + 16}
                    style={{fontSize:9.5, fill:'var(--text-tertiary)', fontFamily:'var(--font-mono)'}}
                    textAnchor="end">
                {nodeVol[n.id].toLocaleString()}
              </text>
            )}
          </g>
        );
      })}
      {/* Hover label */}
      {hover && (() => {
        const e = data.edges.find(x => `${x.from}>${x.to}` === hover);
        if (!e) return null;
        const a = layout[e.from], b = layout[e.to];
        const x = (a.x + a.w + b.x) / 2;
        const op = outPos[hover], ip = inPos[hover];
        const y = (op.y + op.h/2 + ip.y + ip.h/2) / 2;
        return (
          <g pointerEvents="none">
            <rect x={x - 50} y={y - 22} width={100} height={32} rx={4} fill="var(--text)"/>
            <text x={x} y={y - 8} textAnchor="middle"
                  style={{fontSize:10.5, fill:'var(--bg-elevated)', fontFamily:'var(--font-sans)', fontWeight:500}}>
              {e.label}
            </text>
            <text x={x} y={y + 4} textAnchor="middle"
                  style={{fontSize:10, fill:'var(--bg-elevated)', fontFamily:'var(--font-mono)', opacity:0.85}}>
              {e.vol.toLocaleString()}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

// ---------- Attestation generator ----------
function AttestationGenerator() {
  const [type, setType] = React.useState('art30');
  const [start, setStart] = React.useState('2026-01-01');
  const [end, setEnd] = React.useState('2026-05-14');
  const [sections, setSections] = React.useState({
    risks: true, incidents: true, dsar: true, consent: true, bias: true, audit: true,
  });
  const [generating, setGenerating] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const toast = useToast();

  const types = {
    art30:  { name: 'GDPR Art. 30 · Records of processing', code: 'GDPR-Art30' },
    aiact:  { name: 'AI Act Art. 11 · Technical documentation', code: 'AIAct-Art11' },
    iso42:  { name: 'ISO/IEC 42001 · AI management system',     code: 'ISO42001' },
    soc2:   { name: 'SOC 2 Type II · Trust services criteria',   code: 'SOC2-TypeII' },
    custom: { name: 'Custom · select sections only',             code: 'CUSTOM' },
  };
  const t = types[type];

  const generate = () => {
    setGenerating(true);
    setDone(false);
    setTimeout(() => {
      setGenerating(false);
      setDone(true);
      toast.push({ title: 'Attestation generated', body: `${t.name} · ${start} → ${end}` });
    }, 1400);
  };

  return (
    <div className="attest-grid">
      <div className="attest-form">
        <div>
          <label>Attestation type</label>
          <select className="select" value={type} onChange={e => { setType(e.target.value); setDone(false); }}>
            {Object.entries(types).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
        </div>
        <div className="row">
          <div>
            <label>Period start</label>
            <input type="date" className="input" value={start} onChange={e => setStart(e.target.value)}/>
          </div>
          <div>
            <label>Period end</label>
            <input type="date" className="input" value={end} onChange={e => setEnd(e.target.value)}/>
          </div>
        </div>
        <div>
          <label>Sections to include</label>
          <div className="row-gap-12" style={{paddingTop:4}}>
            {[
              { k: 'risks',     l: 'Risk register snapshot',   c: RISKS.length + ' risks' },
              { k: 'incidents', l: 'Incident history',         c: INCIDENTS.length + ' incidents' },
              { k: 'dsar',      l: 'DSAR activity',            c: DSAR.length + ' requests' },
              { k: 'consent',   l: 'Consent activity',         c: '1,284 events' },
              { k: 'bias',      l: 'Bias monitor results',     c: COHORT_DIMENSIONS.length + ' cohorts' },
              { k: 'audit',     l: 'Audit log (period)',       c: '24,416 entries' },
            ].map(s => (
              <label key={s.k} className="between" style={{fontSize:12.5, cursor:'pointer'}}>
                <span className="center gap-8">
                  <input type="checkbox" checked={sections[s.k]}
                         onChange={() => setSections(prev => ({ ...prev, [s.k]: !prev[s.k] }))}
                         style={{accentColor:'var(--text)', width:14, height:14}}/>
                  {s.l}
                </span>
                <span className="text-tertiary mono text-xs">{s.c}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="between mt-12">
          {done ? (
            <>
              <span className="badge success"><span className="dot"/>PDF ready</span>
              <div className="center gap-6">
                <button className="btn sm"><I.Eye size={11}/> Preview</button>
                <button className="btn primary sm"><I.Download size={11}/> Download PDF</button>
              </div>
            </>
          ) : (
            <>
              <span className="text-tertiary text-xs">Output: {t.code}-{start.replace(/-/g,'')}.pdf</span>
              <button className="btn primary" onClick={generate} disabled={generating}>
                {generating ? <><I.Refresh size={13} style={{animation:'spin 0.8s linear infinite'}}/> Generating…</> : <><I.Award size={13}/> Generate PDF</>}
              </button>
            </>
          )}
        </div>
      </div>

      {/* PDF preview */}
      <div className="attest-preview">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:14}}>
          <div>
            <small style={{fontSize:9.5, textTransform:'uppercase', letterSpacing:'0.08em', color:'#71717a', fontWeight:600}}>
              {t.code}
            </small>
            <h2>{t.name.split(' · ')[1] || t.name}</h2>
            <div className="ap-sub">{start} — {end} · Padosoft S.r.l.</div>
          </div>
          <div style={{
            width:44, height:44, borderRadius:'50%',
            background:'#fff', border:'2px solid #0e9f6e',
            display:'grid', placeItems:'center', color:'#0e9f6e',
          }}>
            <I.ShieldCheck size={20}/>
          </div>
        </div>

        <h3>1 · Scope</h3>
        <div className="ap-line"><span>Controller</span><span><b>Padosoft S.r.l.</b> · VAT IT-04...</span></div>
        <div className="ap-line"><span>DPO</span><span>Giulia Amalfi · dpo@padosoft.com</span></div>
        <div className="ap-line"><span>System</span><span>AskMyDocs v4.5 (AI Act high-risk per Annex III §8)</span></div>

        {sections.risks && <>
          <h3>2 · Risk register</h3>
          <div className="ap-line"><span>Total risks tracked</span><span><b>{RISKS.length}</b> ({RISKS.filter(r => r.status === 'closed').length} closed)</span></div>
          <div className="ap-line"><span>High-risk in mitigation</span><span><b>{RISKS.filter(r => r.category === 'high' && r.status !== 'closed').length}</b></span></div>
        </>}

        {sections.incidents && <>
          <h3>3 · Incidents</h3>
          <div className="ap-line"><span>Incidents in period</span><span><b>{INCIDENTS.length}</b> ({INCIDENTS.filter(i => i.state === 'closed').length} closed)</span></div>
          <div className="ap-line"><span>Critical · open</span><span><b>{INCIDENTS.filter(i => i.severity === 'critical' && i.state !== 'closed').length}</b></span></div>
        </>}

        {sections.dsar && <>
          <h3>4 · Data subject requests</h3>
          <div className="ap-line"><span>Requests received</span><span><b>{DSAR.length}</b></span></div>
          <div className="ap-line"><span>SLA met</span><span><b>{Math.round((DSAR.filter(d => d.dueIn >= 0 || d.status === 'completed').length / DSAR.length) * 100)}%</b> · GDPR Art. 12(3)</span></div>
        </>}

        <div className="ap-sig">
          <div>
            <div className="sig-line"/>
            <small>DPO signature</small>
            <div style={{fontSize:11, marginTop:6}}>Giulia Amalfi</div>
          </div>
          <div>
            <div className="sig-line"/>
            <small>Date</small>
            <div style={{fontSize:11, marginTop:6, fontFamily:'var(--font-mono)'}}>{fmtDate(window.NOW)}</div>
          </div>
        </div>

        <div className="attest-watermark">PADOSOFT · AI ACT COMPLIANCE · v6.0 · {t.code}-{fmtDate(window.NOW).replace(/-/g,'')}</div>
      </div>
    </div>
  );
}

// Add spin animation
if (!document.getElementById('compliance-anims')) {
  const s = document.createElement('style');
  s.id = 'compliance-anims';
  s.textContent = `@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`;
  document.head.appendChild(s);
}

window.PageDPO = PageDPO;
