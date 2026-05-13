// ============== Screen 3 — Consent Overview ==============

function ConsentScreen({ navigate }) {
  const [tab, setTab] = React.useState('per_user');
  return (
    <div className="page" data-screen-label="Consent Overview">
      <div className="page-head">
        <div>
          <h1 className="page-title">Consent Overview</h1>
          <p className="page-sub">
            Per-user and per-feature consent state · audit-grade provenance for <span className="art-chip gdpr">GDPR Art. 7</span> <span className="art-chip">AI Act Art. 50</span>
          </p>
        </div>
        <div className="page-actions">
          <button className="btn"><IC.Download size={13}/> Export consent records</button>
        </div>
      </div>

      <div className="tabs" style={{marginBottom: 16}}>
        <div className={`tab ${tab === 'per_user' ? 'active' : ''}`} onClick={() => setTab('per_user')}>
          <IC.Users size={13}/> Per User
          <span className="badge outline" style={{marginLeft: 4}}>{CONSENT_USERS.length}</span>
        </div>
        <div className={`tab ${tab === 'per_feature' ? 'active' : ''}`} onClick={() => setTab('per_feature')}>
          <IC.Sliders size={13}/> Per Feature
          <span className="badge outline" style={{marginLeft: 4}}>{CONSENT_FEATURES.length}</span>
        </div>
      </div>

      {tab === 'per_user' ? <PerUserView/> : <PerFeatureView/>}
    </div>
  );
}

function PerUserView() {
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [selectedId, setSelectedId] = React.useState(CONSENT_USERS[0].email);
  const toast = useToast();

  const filtered = CONSENT_USERS.filter(u => {
    if (search && !u.email.toLowerCase().includes(search.toLowerCase()) && !u.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'any_revoked' && !u.states.includes('revoked')) return false;
    if (filter === 'missing_required') {
      const missing = CONSENT_FEATURES.some((f, i) => f.required && u.states[i] !== 'granted');
      if (!missing) return false;
    }
    return true;
  });

  const current = CONSENT_USERS.find(u => u.email === selectedId) || CONSENT_USERS[0];

  return (
    <div style={{display:'grid', gridTemplateColumns:'320px 1fr', gap: 16, alignItems:'start'}}>
      {/* List */}
      <div className="card" style={{position:'sticky', top: 0}}>
        <div className="card-head">
          <input className="input" placeholder="Search users…" value={search}
                 onChange={e => setSearch(e.target.value)} style={{fontSize: 12}}/>
        </div>
        <div className="card-body flush" style={{padding: 6}}>
          <div style={{display:'flex', gap: 4, padding: '4px 6px 8px'}}>
            {['all','any_revoked','missing_required'].map(f => (
              <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{fontSize: 11}}>
                {f === 'all' ? 'All' : f === 'any_revoked' ? 'Any revoked' : 'Missing required'}
              </button>
            ))}
          </div>
          <div style={{maxHeight: 480, overflowY: 'auto'}}>
            {filtered.length === 0 ? (
              <EmptyState art="Folder" title="No users match" body="Try a different filter or search term."/>
            ) : filtered.map(u => {
              const granted = u.states.filter(s => s === 'granted').length;
              return (
                <div key={u.email} onClick={() => setSelectedId(u.email)}
                     style={{
                       display:'grid', gridTemplateColumns:'24px 1fr auto', gap: 10,
                       padding: '8px 10px', borderRadius: 'var(--radius-sm)', cursor:'pointer',
                       background: selectedId === u.email ? 'var(--bg-active)' : 'transparent',
                       alignItems:'center',
                     }}>
                  <div className="avatar xs" style={{background:`linear-gradient(135deg, hsl(${u.name.length*47%360}, 60%, 50%), hsl(${u.email.length*23%360}, 60%, 40%))`}}>
                    {initials(u.name)}
                  </div>
                  <div style={{minWidth: 0}}>
                    <b style={{fontSize: 12.5, display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{u.name}</b>
                    <small style={{fontSize: 10.5, color:'var(--text-tertiary)', fontFamily:'var(--font-mono)'}}>{granted}/{u.states.length} consents</small>
                  </div>
                  {u.states.includes('revoked') && <span style={{width: 6, height: 6, borderRadius: 50, background:'var(--status-failed)'}}/>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail */}
      <div className="card">
        <div className="card-head">
          <div style={{display:'flex', alignItems:'center', gap: 12}}>
            <div className="avatar" style={{width: 32, height: 32, fontSize: 11.5, background:`linear-gradient(135deg, hsl(${current.name.length*47%360}, 60%, 50%), hsl(${current.email.length*23%360}, 60%, 40%))`}}>
              {initials(current.name)}
            </div>
            <div>
              <h3 className="card-title">{current.name}</h3>
              <p className="card-sub">{current.email} · last activity {fmtRelativeFromNow(current.lastChange)} ago</p>
            </div>
          </div>
          <div style={{display:'flex', gap: 6}}>
            <button className="btn" onClick={() => toast.push({title:'Consent record PDF exported', body:`for ${current.email}`})}>
              <IC.FileDown size={13}/> Export PDF
            </button>
            <button className="btn danger" onClick={() => toast.push({title:'Multi-step revocation initiated', kind:'warn'})}>
              <IC.UserMinus size={13}/> Revoke all
            </button>
          </div>
        </div>
        <div className="card-body" style={{padding: 0}}>
          <div className="consent-matrix">
            <div className="row head">
              <div>Feature</div>
              <div>Current state</div>
              <div>Last updated</div>
              <div>Source</div>
              <div></div>
            </div>
            {CONSENT_FEATURES.map((f, i) => {
              const state = current.states[i];
              return <ConsentMatrixRow key={f.key} feature={f} state={state} ts={current.lastChange - i * 3 * DAY}/>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsentMatrixRow({ feature, state, ts }) {
  const [open, setOpen] = React.useState(false);
  const sources = ['signup form', 'settings panel', 'API call', 'mobile app'];
  const src = sources[feature.key.length % sources.length];

  return (
    <>
      <div className="row">
        <div className="consent-cell-feature">
          <b>{feature.label}{feature.required && <span style={{color:'var(--status-failed)', marginLeft: 4}} title="Required by service">*</span>}</b>
          <small>{feature.description}</small>
        </div>
        <div>
          <span className={`badge ${state === 'granted' ? 'success' : state === 'revoked' ? 'failed' : 'pending'}`}>
            <span className="dot"/>{state}
          </span>
        </div>
        <div className="mono" style={{fontSize: 11.5, color:'var(--text-secondary)'}}>
          {state === 'never' ? '—' : fmtDateTime(ts).slice(0, 16)}
        </div>
        <div className="mono" style={{fontSize: 11.5, color:'var(--text-tertiary)'}}>
          {state === 'never' ? '—' : src}
        </div>
        <div>
          <button className="btn sm ghost" onClick={() => setOpen(o => !o)}>
            {open ? <I.ChevronDown size={12}/> : <I.ChevronRight size={12}/>}
          </button>
        </div>
      </div>
      {open && (
        <div className="row history" style={{gridTemplateColumns: '1fr', padding: '12px 18px'}}>
          <div style={{fontSize: 10.5, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight: 600, marginBottom: 8}}>State change history (immutable)</div>
          <div className="audit-list" style={{borderTop: '1px solid var(--border)', borderRadius: 0}}>
            <div className="audit-item">
              <IC.UserCheck className="audit-icon" size={13}/>
              <div className="audit-event">
                <b>{state} (current)</b>
                <small>via {src}</small>
              </div>
              <time>{fmtDateTime(ts).slice(0, 16)}</time>
            </div>
            {state !== 'never' && (
              <div className="audit-item">
                <IC.UserCheck className="audit-icon" size={13}/>
                <div className="audit-event">
                  <b>{state === 'granted' ? 'granted' : 'previously granted'}</b>
                  <small>via signup form · ip 87.21.xxx.xx</small>
                </div>
                <time>{fmtDateTime(ts - 30 * DAY).slice(0, 16)}</time>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function PerFeatureView() {
  const [selected, setSelected] = React.useState(CONSENT_FEATURES[1].key);
  const f = CONSENT_FEATURES.find(x => x.key === selected);
  const trend = CONSENT_PER_FEATURE_TREND[f.key];
  const last = trend[trend.length - 1].value;
  const prev30 = trend[trend.length - 31].value;
  const delta = last - prev30;

  // Per-feature counts simulated
  const grantedCount = Math.floor(CONSENT_USERS.length * (last / 100));
  const revokedCount = CONSENT_USERS.filter(u => u.states[CONSENT_FEATURES.indexOf(f)] === 'revoked').length;
  const neverCount = CONSENT_USERS.filter(u => u.states[CONSENT_FEATURES.indexOf(f)] === 'never').length;

  return (
    <div>
      <div className="filter-bar">
        <span style={{fontSize:11, color:'var(--text-tertiary)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginRight: 4}}>Feature</span>
        {CONSENT_FEATURES.map(feature => (
          <button key={feature.key} className={`chip ${selected === feature.key ? 'active' : ''}`} onClick={() => setSelected(feature.key)}>
            {feature.label}
            {feature.required && <span className="mono" style={{fontSize: 9, opacity: 0.6}}>req</span>}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="kpi-grid" style={{marginTop: 16, gridTemplateColumns: '1.4fr 1fr 1fr 1fr'}}>
        <div className="kpi">
          <div className="kpi-label">Feature</div>
          <div style={{fontSize: 17, fontWeight: 600, lineHeight: 1.2, marginBottom: 4}}>{f.label}</div>
          <small style={{fontSize: 11.5, color:'var(--text-secondary)', display:'block'}}>{f.description}</small>
          {f.required && <span className="badge failed" style={{marginTop: 8}}><span className="dot"/>Required</span>}
        </div>
        <div className="kpi">
          <div className="kpi-label">Acceptance rate · 30d</div>
          <Gauge value={last}/>
        </div>
        <div className="kpi">
          <div className="kpi-label">Trend · last 30d</div>
          <div className="kpi-value" style={{color: delta < 0 ? 'var(--status-failed)' : 'var(--status-success)', fontSize: 22}}>
            {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
          </div>
          <div className="kpi-delta" style={{color: delta < 0 ? 'var(--status-failed)' : 'var(--status-success)'}}>
            {delta < 0 ? <I.ArrowDown size={11}/> : <I.ArrowUp size={11}/>} vs {prev30.toFixed(1)}% baseline
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">User states</div>
          <div style={{display:'flex', flexDirection:'column', gap: 4, fontSize: 12, fontFamily:'var(--font-mono)', marginTop: 4}}>
            <span><span className="dot" style={{display:'inline-block', width: 6, height: 6, borderRadius: 50, background:'var(--status-success)', marginRight: 6}}/>{grantedCount} granted</span>
            <span><span className="dot" style={{display:'inline-block', width: 6, height: 6, borderRadius: 50, background:'var(--status-failed)', marginRight: 6}}/>{revokedCount} revoked</span>
            <span><span className="dot" style={{display:'inline-block', width: 6, height: 6, borderRadius: 50, background:'var(--text-tertiary)', marginRight: 6}}/>{neverCount} never</span>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div style={{display:'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 16}}>
        <div className="card">
          <div className="card-head">
            <div>
              <h3 className="card-title">Acceptance rate · 90 days</h3>
              <p className="card-sub">Daily % of users granting "{f.label}"</p>
            </div>
          </div>
          <div className="card-body">
            <LineChartCmp data={trend} xKey="day" yKey="value" height={220} accentColor="var(--status-success)"/>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h3 className="card-title">Revocation reasons</h3>
              <p className="card-sub">When captured · last 90d</p>
            </div>
          </div>
          <div className="card-body">
            <RevocationPie data={CONSENT_REVOKE_REASONS}/>
          </div>
        </div>
      </div>

      {/* Opt-out users */}
      <div className="card" style={{marginTop: 16}}>
        <div className="card-head">
          <h3 className="card-title">Recent revocations</h3>
          <span className="badge outline">{revokedCount + 2}</span>
        </div>
        <div className="card-body flush">
          <table className="tbl">
            <thead>
              <tr>
                <th>User</th>
                <th>Tenant</th>
                <th>Reason</th>
                <th className="num">Revoked</th>
              </tr>
            </thead>
            <tbody>
              {CONSENT_USERS.filter(u => u.states[CONSENT_FEATURES.indexOf(f)] === 'revoked').map((u, i) => (
                <tr key={u.email}>
                  <td>
                    <div className="user-row">
                      <div className="avatar xs" style={{background:`linear-gradient(135deg, hsl(${u.name.length*47%360}, 60%, 50%), hsl(${u.email.length*23%360}, 60%, 40%))`}}>{initials(u.name)}</div>
                      <div className="nm"><b>{u.name}</b><small>{u.email}</small></div>
                    </div>
                  </td>
                  <td className="muted">{u.tenant}</td>
                  <td className="muted" style={{fontSize: 12}}>{CONSENT_REVOKE_REASONS[i % CONSENT_REVOKE_REASONS.length].label}</td>
                  <td className="num muted">{fmtRelativeFromNow(u.lastChange - i * 4 * HR)} ago</td>
                </tr>
              ))}
              {revokedCount === 0 && (
                <tr><td colSpan={4}><EmptyState art="UserMinus" title="No revocations for this feature" body="Users have not opted out."/></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =============== Gauge (radial) ===============
function Gauge({ value, max = 100 }) {
  const r = 36;
  const c = Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const dash = c * pct;
  const color = value > 90 ? 'var(--status-success)' : value > 70 ? 'var(--status-paused)' : 'var(--status-failed)';
  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 100 60" width="100%" height="100%">
        <path d="M 12 52 A 38 38 0 0 1 88 52" fill="none" stroke="var(--bg-active)" strokeWidth="6" strokeLinecap="round"/>
        <path d="M 12 52 A 38 38 0 0 1 88 52" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${dash} ${c}`}/>
      </svg>
      <div className="gauge-value">{value.toFixed(1)}<small>%</small></div>
    </div>
  );
}

function RevocationPie({ data }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  let start = 0;
  return (
    <div style={{display:'grid', gridTemplateColumns: '120px 1fr', gap: 16, alignItems:'center'}}>
      <svg viewBox="0 0 100 100" width="100" height="100">
        {data.map((d, i) => {
          const pct = d.value / total;
          const end = start + pct * 360;
          const large = pct > 0.5 ? 1 : 0;
          const x1 = 50 + 42 * Math.cos((start - 90) * Math.PI / 180);
          const y1 = 50 + 42 * Math.sin((start - 90) * Math.PI / 180);
          const x2 = 50 + 42 * Math.cos((end - 90) * Math.PI / 180);
          const y2 = 50 + 42 * Math.sin((end - 90) * Math.PI / 180);
          const path = `M 50 50 L ${x1} ${y1} A 42 42 0 ${large} 1 ${x2} ${y2} Z`;
          start = end;
          return <path key={i} d={path} fill={d.color}/>;
        })}
        <circle cx="50" cy="50" r="24" fill="var(--bg-elevated)"/>
        <text x="50" y="48" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--text)">{total}</text>
        <text x="50" y="60" textAnchor="middle" fontSize="8" fill="var(--text-tertiary)">total · 90d</text>
      </svg>
      <div style={{display:'flex', flexDirection:'column', gap: 5}}>
        {data.map((d, i) => (
          <div key={i} style={{display:'flex', alignItems:'center', gap: 8, fontSize: 11.5}}>
            <span style={{width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0}}/>
            <span style={{flex: 1, color: 'var(--text-secondary)'}}>{d.label}</span>
            <span className="mono" style={{color:'var(--text-tertiary)'}}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ConsentScreen, Gauge, RevocationPie });
