// ============== Screen 3: Consent Overview ==============

function PageConsent({ onNavigate }) {
  const [tab, setTab] = React.useState('user');
  const [selectedUserId, setSelectedUserId] = React.useState(SUBJECTS[0].id);
  const [selectedFeature, setSelectedFeature] = React.useState(CONSENT_FEATURES[0].id);
  const [query, setQuery] = React.useState('');

  const user = SUBJECTS.find(u => u.id === selectedUserId);
  const feature = CONSENT_FEATURES.find(f => f.id === selectedFeature);

  // synthesize per-user state deterministically from index
  const userConsents = CONSENT_FEATURES.map((f, i) => {
    const subjIdx = SUBJECTS.indexOf(user);
    const seed = (subjIdx * 13 + i * 7) % 10;
    const state = seed < 6 ? 'granted' : seed < 8 ? 'revoked' : 'never';
    return {
      feature: f,
      state,
      updated: window.NOW - (seed * 2 + i) * 86400_000,
      source: ['signup form','settings panel','API call','consent banner'][seed % 4],
    };
  });

  return (
    <div className="page" data-screen-label="Consent Overview">
      <div className="page-head">
        <div>
          <h1 className="page-title">Consent Overview</h1>
          <p className="page-sub">Per-user &amp; per-feature consent state · GDPR Art. 7 · auditable provenance</p>
        </div>
        <div className="page-actions">
          <button className="btn"><I.Download size={13}/> Export consent record</button>
        </div>
      </div>

      <div className="tabs mb-16">
        <div className={`tab ${tab === 'user' ? 'active' : ''}`} onClick={() => setTab('user')}>
          <I.Users size={12}/> Per user
        </div>
        <div className={`tab ${tab === 'feature' ? 'active' : ''}`} onClick={() => setTab('feature')}>
          <I.Tag size={12}/> Per feature
        </div>
      </div>

      {tab === 'user' ? (
        <div style={{display:'grid', gridTemplateColumns:'minmax(260px, 0.55fr) minmax(0, 1.45fr)', gap:16, height:'calc(100vh - 240px)', minHeight:520}}>
          {/* user list */}
          <div className="card" style={{display:'flex', flexDirection:'column', overflow:'hidden'}}>
            <div className="card-head" style={{flexDirection:'column', alignItems:'stretch', gap:10, padding:'12px 14px'}}>
              <h3 className="card-title">Data subjects · {SUBJECTS.length}</h3>
              <div style={{position:'relative'}}>
                <I.Search size={12} style={{position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', color:'var(--text-tertiary)'}}/>
                <input className="input" placeholder="Search by name or email…"
                       value={query} onChange={e => setQuery(e.target.value)}
                       style={{paddingLeft:26, fontSize:12, height:28}}/>
              </div>
            </div>
            <div style={{flex:1, overflow:'auto'}}>
              {SUBJECTS.filter(u =>
                !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())
              ).map(u => {
                const active = u.id === selectedUserId;
                const seed = (SUBJECTS.indexOf(u) * 13) % 10;
                const granted = CONSENT_FEATURES.length - (seed % 3);
                return (
                  <div key={u.id} onClick={() => setSelectedUserId(u.id)}
                       style={{
                         padding:'10px 14px', borderBottom:'1px solid var(--border)', cursor:'pointer',
                         background: active ? 'var(--bg-active)' : 'transparent',
                         borderLeft: active ? '2px solid var(--text)' : '2px solid transparent',
                       }}>
                    <div className="center gap-10">
                      <Avatar name={u.name} size={28}/>
                      <div style={{minWidth:0, flex:1}}>
                        <div className="between">
                          <b style={{fontSize:12.5, fontWeight:500}}>{u.name}</b>
                          <span className="mono" style={{fontSize:10, color:'var(--text-tertiary)'}}>{granted}/{CONSENT_FEATURES.length}</span>
                        </div>
                        <div className="mono" style={{fontSize:10.5, color:'var(--text-tertiary)'}}>{u.email} · {u.country}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* matrix */}
          <div className="card" style={{display:'flex', flexDirection:'column', overflow:'hidden'}}>
            <div className="card-head">
              <div>
                <h3 className="card-title">Consent matrix · {user.name}</h3>
                <p className="card-sub">{user.email} · last activity {fmtRelativeFrom(window.NOW - 3 * 3600_000)}</p>
              </div>
              <div className="center gap-6">
                <button className="btn sm"><I.Download size={12}/> Export PDF</button>
                <button className="btn sm danger"><I.UserMinus size={12}/> Revoke all</button>
              </div>
            </div>
            <div style={{flex:1, overflow:'auto'}}>
              <table className="consent-matrix">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>State</th>
                    <th>Last updated</th>
                    <th>Source</th>
                    <th>Articles</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {userConsents.map((c, i) => (
                    <tr key={i}>
                      <td>
                        <b style={{fontWeight:500}}>{c.feature.name}</b>
                        {c.feature.required && <span className="badge outline" style={{marginLeft:6, fontSize:9, padding:'0 4px'}}>REQUIRED</span>}
                      </td>
                      <td><span className={`consent-pill ${c.state}`}>
                        {c.state === 'granted' ? <I.Check size={10}/> : c.state === 'revoked' ? <I.X size={10}/> : <I.X size={10}/>}
                        {c.state}
                      </span></td>
                      <td className="muted mono" style={{fontSize:11.5}}>{fmtDate(c.updated)}</td>
                      <td className="muted">{c.source}</td>
                      <td>
                        <div className="center gap-6" style={{flexWrap:'wrap'}}>
                          <ArticleRef>GDPR Art. 7</ArticleRef>
                          {c.feature.id === 'biometric_voice' && <ArticleRef>AI Act Art. 5</ArticleRef>}
                        </div>
                      </td>
                      <td><button className="btn sm ghost"><I.Clock size={11}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{padding:'14px 16px', borderTop:'1px solid var(--border)'}}>
                <h5 style={{margin:'0 0 8px', fontSize:10.5, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-tertiary)', fontWeight:600}}>
                  Audit history · last 5 state changes
                </h5>
                <div className="vtimeline">
                  {[
                    { at: window.NOW - 86400_000 * 3,  label: 'Revoked: profile_enrich',       actor: user.email,                kind: 'warn' },
                    { at: window.NOW - 86400_000 * 8,  label: 'Granted: kb_ingest',            actor: 'signup form',            kind: 'done' },
                    { at: window.NOW - 86400_000 * 18, label: 'Granted: chat_use, marketing',  actor: user.email,               kind: 'done' },
                    { at: window.NOW - 86400_000 * 42, label: 'Account created',               actor: 'signup form',            kind: 'done' },
                  ].map((e, i) => (
                    <div key={i} className="vt-item">
                      <div className={`vt-dot ${e.kind}`}/>
                      <div className="vt-body">
                        <b>{e.label}</b>
                        <small>{fmtDateTime(e.at)} · {e.actor}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Per feature
        <div>
          {/* feature picker */}
          <div className="card mb-16">
            <div className="card-body" style={{padding:14}}>
              <div className="center gap-8" style={{flexWrap:'wrap'}}>
                {CONSENT_FEATURES.map(f => (
                  <button key={f.id} className={`chip ${selectedFeature === f.id ? 'active' : ''}`}
                          onClick={() => setSelectedFeature(f.id)}>
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid-2-1-2">
            <div className="card">
              <div className="card-head">
                <div>
                  <h3 className="card-title">{feature.name}</h3>
                  <p className="card-sub">Acceptance posture · 30-day window</p>
                </div>
                {feature.required && <span className="badge outline">REQUIRED</span>}
              </div>
              <div className="card-body" style={{display:'flex', alignItems:'center', gap:24, padding:'20px 24px'}}>
                <Gauge value={CONSENT_RATE[feature.id].granted}/>
                <div style={{flex:1}}>
                  <div className="mb-12">
                    <div className="between" style={{fontSize:11, marginBottom:4}}>
                      <span style={{color:'var(--sev-low)'}}>Granted</span>
                      <span className="mono">{CONSENT_RATE[feature.id].granted}%</span>
                    </div>
                    <div className="between" style={{fontSize:11, marginBottom:4}}>
                      <span style={{color:'var(--sev-critical)'}}>Revoked</span>
                      <span className="mono">{CONSENT_RATE[feature.id].revoked}%</span>
                    </div>
                    <div className="between" style={{fontSize:11}}>
                      <span style={{color:'var(--text-tertiary)'}}>Never granted</span>
                      <span className="mono">{CONSENT_RATE[feature.id].never}%</span>
                    </div>
                  </div>
                  <div className="consent-stack" style={{height:10}}>
                    <div className="g" style={{flex: CONSENT_RATE[feature.id].granted}}/>
                    <div className="r" style={{flex: CONSENT_RATE[feature.id].revoked}}/>
                    <div className="n" style={{flex: CONSENT_RATE[feature.id].never}}/>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <div>
                  <h3 className="card-title">Acceptance trend · 90 days</h3>
                  <p className="card-sub">Weekly granted rate</p>
                </div>
              </div>
              <div className="card-body" style={{paddingTop:0}}>
                <TrendLine data={CONSENT_RATE[feature.id].trend}/>
              </div>
            </div>
          </div>

          <div className="card mt-16">
            <div className="card-head">
              <div>
                <h3 className="card-title">All features · acceptance comparison</h3>
                <p className="card-sub">Granted vs. Revoked vs. Never-granted</p>
              </div>
              <span className="badge outline">{CONSENT_FEATURES.length} features</span>
            </div>
            <div className="card-body" style={{padding:18}}>
              <div className="row-gap-12">
                {CONSENT_FEATURES.map(f => {
                  const c = CONSENT_RATE[f.id];
                  return (
                    <div key={f.id}>
                      <div className="between" style={{fontSize:12, marginBottom:5}}>
                        <span style={{fontWeight:500}}>{f.name}</span>
                        <span className="mono" style={{color:'var(--text-tertiary)', fontSize:11}}>
                          <span style={{color:'var(--sev-low)'}}>{c.granted}%</span> ·
                          {' '}<span style={{color:'var(--sev-critical)'}}>{c.revoked}%</span> ·
                          {' '}<span style={{color:'var(--text-tertiary)'}}>{c.never}%</span>
                        </span>
                      </div>
                      <div className="consent-stack">
                        <div className="g" style={{flex: c.granted}}/>
                        <div className="r" style={{flex: c.revoked}}/>
                        <div className="n" style={{flex: c.never}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Donut gauge
function Gauge({ value }) {
  const r = 46, c = 2 * Math.PI * r;
  const off = c * (1 - value / 100);
  const color = value >= 90 ? 'var(--sev-low)' : value >= 70 ? 'var(--sev-medium)' : 'var(--sev-critical)';
  return (
    <svg className="consent-gauge" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--bg-subtle)" strokeWidth="10"/>
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
              strokeDasharray={c} strokeDashoffset={off}
              strokeLinecap="round" transform="rotate(-90 60 60)"
              style={{transition: 'stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1)'}}/>
      <text x="60" y="58" textAnchor="middle"
            style={{fontSize:22, fontWeight:600, fill:'var(--text)', fontFamily:'var(--font-sans)', letterSpacing:'-0.02em'}}>
        {value.toFixed(0)}<tspan style={{fontSize:13}}>%</tspan>
      </text>
      <text x="60" y="76" textAnchor="middle"
            style={{fontSize:9, fill:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600}}>
        Granted
      </text>
    </svg>
  );
}

function TrendLine({ data }) {
  const W = 480, H = 160, P = 16;
  const max = Math.max(...data), min = Math.min(...data);
  const range = Math.max(max - min, 5);
  const xAt = (i) => P + (i / (data.length - 1)) * (W - P * 2);
  const yAt = (v) => P + (1 - (v - min + 2) / (range + 4)) * (H - P * 2);
  const path = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', height:160}}>
      <defs>
        <linearGradient id="trendGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${path} L ${xAt(data.length-1)} ${H-P} L ${xAt(0)} ${H-P} Z`} fill="url(#trendGrad)"/>
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="1.75"/>
      {data.map((v, i) => (
        <circle key={i} cx={xAt(i)} cy={yAt(v)} r="2" fill="var(--accent)"/>
      ))}
      <text x={P} y={H - 2} style={{fontSize:9, fill:'var(--text-tertiary)', fontFamily:'var(--font-mono)'}}>90d ago</text>
      <text x={W - P} y={H - 2} textAnchor="end" style={{fontSize:9, fill:'var(--text-tertiary)', fontFamily:'var(--font-mono)'}}>now</text>
    </svg>
  );
}

window.PageConsent = PageConsent;
