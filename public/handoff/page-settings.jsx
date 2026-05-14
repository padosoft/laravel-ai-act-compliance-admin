// ============== Screen 8: Settings ==============

function PageSettings({ onNavigate }) {
  const [tab, setTab] = React.useState('env');
  const tabs = [
    { key: 'env',          label: 'Env vars',          icon: <I.Lock size={12}/>,    sub: 'Read-only' },
    { key: 'flags',        label: 'Feature flags',     icon: <I.Layers size={12}/>,   sub: 'Per tenant' },
    { key: 'roles',        label: 'Admin roles',       icon: <I.Users size={12}/>,    sub: 'Spatie' },
    { key: 'bias',         label: 'Bias thresholds',   icon: <I.Scale size={12}/>,    sub: 'Per cohort' },
    { key: 'sla',          label: 'DSAR SLA',          icon: <I.Clock size={12}/>,    sub: 'GDPR Art. 12(3)' },
    { key: 'webhooks',     label: 'Webhook config',    icon: <I.Webhook size={12}/>,  sub: 'Outbound events' },
    { key: 'notifications',label: 'Notifications',     icon: <I.Bell size={12}/>,     sub: 'Email · Slack · Teams' },
  ];

  return (
    <div className="page wide" data-screen-label="Settings">
      <div className="page-head">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Admin configuration · feature flags · roles · webhooks · notifications</p>
        </div>
      </div>

      <div className="vtabs">
        <div className="vtab-list">
          {tabs.map(t => (
            <div key={t.key} className={`vtab ${tab === t.key ? 'active' : ''}`}
                 onClick={() => setTab(t.key)}>
              {t.icon}
              <div style={{minWidth:0}}>
                <div>{t.label}</div>
                <small style={{fontSize:10.5, color:'var(--text-tertiary)'}}>{t.sub}</small>
              </div>
            </div>
          ))}
        </div>

        <div>
          {tab === 'env'           && <SettingsEnv/>}
          {tab === 'flags'         && <SettingsFlags/>}
          {tab === 'roles'         && <SettingsRoles/>}
          {tab === 'bias'          && <SettingsBias/>}
          {tab === 'sla'           && <SettingsSLA/>}
          {tab === 'webhooks'      && <SettingsWebhooks/>}
          {tab === 'notifications' && <SettingsNotifications/>}
        </div>
      </div>
    </div>
  );
}

function SettingsEnv() {
  const [query, setQuery] = React.useState('');
  const filtered = ENV_VARS.filter(v => !query || v.name.toLowerCase().includes(query.toLowerCase()) || v.module.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3 className="card-title">Environment variables</h3>
          <p className="card-sub">Read-only · sourced from env file or config · sensitive values masked</p>
        </div>
        <div style={{position:'relative'}}>
          <I.Search size={12} style={{position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', color:'var(--text-tertiary)'}}/>
          <input className="input" placeholder="Filter…" value={query} onChange={e => setQuery(e.target.value)}
                 style={{paddingLeft:26, width:220, height:28, fontSize:12}}/>
        </div>
      </div>
      <div className="card-body flush">
        <table className="tbl">
          <thead>
            <tr><th>Name</th><th>Value</th><th>Source</th><th>Module</th></tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.name} style={{cursor:'default'}}>
                <td className="mono text-sm">{v.name}</td>
                <td className="mono text-sm">
                  {v.value.startsWith('*****') ? (
                    <span style={{color:'var(--text-tertiary)'}}>
                      <I.Lock size={10} style={{verticalAlign:-1, marginRight:4}}/>{v.value}
                    </span>
                  ) : <b style={{fontWeight:500, color:'var(--text)'}}>{v.value}</b>}
                </td>
                <td className="muted text-xs">{v.source}</td>
                <td><span className="badge outline" style={{fontSize:10}}>{v.module}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsFlags() {
  const [flags, setFlags] = React.useState(FEATURE_FLAGS);
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3 className="card-title">Feature flags</h3>
          <p className="card-sub">Toggle compliance modules per tenant · changes write audit-trail entry</p>
        </div>
        <div className="center gap-6">
          <button className="btn sm" onClick={() => setFlags(f => f.map(x => ({ ...x, enabled: true })))}>Enable all</button>
          <button className="btn sm" onClick={() => setFlags(f => f.map(x => ({ ...x, enabled: false })))}>Disable all</button>
        </div>
      </div>
      <div className="card-body flush">
        {flags.map((f, i) => (
          <div key={f.id} className="approval-card" style={{borderBottom: i < flags.length - 1 ? '1px solid var(--border)' : 0}}>
            <div className="approval-info">
              <b style={{fontSize:13, fontWeight:500}}>{f.name}</b>
              <div className="center gap-6" style={{marginTop:4, flexWrap:'wrap'}}>
                <span className="mono text-xs text-tertiary">{f.id}</span>
                {f.articles.map(a => <ArticleRef key={a}>{a}</ArticleRef>)}
              </div>
            </div>
            <div className="approval-actions">
              <Switch on={f.enabled} onClick={() => setFlags(prev => prev.map(x => x.id === f.id ? { ...x, enabled: !x.enabled } : x))}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsRoles() {
  const roles = ['DPO','Compliance Officer','Admin','Auditor'];
  const perms = [
    'view_dsar', 'approve_dsar', 'delete_dsar',
    'view_risks', 'edit_risks',
    'view_incidents', 'edit_incidents',
    'view_bias', 'configure_thresholds',
    'generate_attestation', 'export_audit',
  ];
  const MATRIX = {
    DPO:                  ['view_dsar','approve_dsar','delete_dsar','view_risks','edit_risks','view_incidents','edit_incidents','view_bias','configure_thresholds','generate_attestation','export_audit'],
    'Compliance Officer': ['view_dsar','approve_dsar','view_risks','edit_risks','view_incidents','edit_incidents','view_bias','configure_thresholds','generate_attestation'],
    Admin:                ['view_dsar','view_risks','view_incidents','view_bias'],
    Auditor:              ['view_dsar','view_risks','view_incidents','view_bias','export_audit'],
  };
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3 className="card-title">Admin roles · permission matrix</h3>
          <p className="card-sub">Spatie/permission backed · super-admin only edits · audit trail on change</p>
        </div>
      </div>
      <div className="card-body flush">
        <div style={{overflow:'auto'}}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Permission</th>
                {roles.map(r => <th key={r} className="num">{r}</th>)}
              </tr>
            </thead>
            <tbody>
              {perms.map(p => (
                <tr key={p} style={{cursor:'default'}}>
                  <td className="mono text-sm">{p}</td>
                  {roles.map(r => (
                    <td key={r} style={{textAlign:'center'}}>
                      {MATRIX[r].includes(p)
                        ? <I.Check size={14} style={{color:'var(--sev-low)'}}/>
                        : <I.X size={12} style={{color:'var(--text-tertiary)', opacity:0.4}}/>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SettingsBias() {
  const cohorts = [
    { name: 'Language',  threshold: 5, window: 7 },
    { name: 'Source',    threshold: 5, window: 7 },
    { name: 'Canonical', threshold: 3, window: 14 },
    { name: 'Demographic', threshold: 3, window: 14 },
  ];
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3 className="card-title">Bias thresholds</h3>
          <p className="card-sub">Per-cohort alert configuration · backs Bias Monitor screen</p>
        </div>
        <button className="btn sm"><I.Refresh size={11}/> Reset to defaults</button>
      </div>
      <div className="card-body flush">
        <table className="tbl">
          <thead>
            <tr>
              <th>Cohort dimension</th>
              <th className="num">Δ threshold</th>
              <th className="num">Window (d)</th>
              <th>Action</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cohorts.map(c => (
              <tr key={c.name} style={{cursor:'default'}}>
                <td><b style={{fontWeight:500}}>{c.name}</b></td>
                <td className="num mono">{c.threshold}%</td>
                <td className="num mono">{c.window}d</td>
                <td><span className="badge outline">Create incident</span></td>
                <td><button className="btn sm ghost"><I.Edit size={11}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsSLA() {
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3 className="card-title">DSAR Service Level Agreement</h3>
          <p className="card-sub">GDPR Art. 12(3) default · 30 days from receipt</p>
        </div>
      </div>
      <div className="card-body" style={{padding:18}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <div>
            <label style={{fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-tertiary)', fontWeight:600}}>SLA target</label>
            <div className="center gap-8 mt-8">
              <input type="number" defaultValue={30} className="input" style={{width:80, textAlign:'center'}}/>
              <span style={{fontSize:12.5, color:'var(--text-secondary)'}}>days from receipt</span>
            </div>
            <small style={{display:'block', marginTop:6, fontSize:11, color:'var(--text-tertiary)'}}>
              GDPR Art. 12(3) — extendable by 60 days for complex cases
            </small>
          </div>
          <div>
            <label style={{fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-tertiary)', fontWeight:600}}>Warning threshold</label>
            <div className="center gap-8 mt-8">
              <input type="number" defaultValue={5} className="input" style={{width:80, textAlign:'center'}}/>
              <span style={{fontSize:12.5, color:'var(--text-secondary)'}}>days before breach</span>
            </div>
            <small style={{display:'block', marginTop:6, fontSize:11, color:'var(--text-tertiary)'}}>
              Triggers escalation email to DPO + on-call rotation
            </small>
          </div>
        </div>

        <h5 style={{fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-tertiary)', fontWeight:600, marginTop:18, marginBottom:8}}>
          Breach alert recipients
        </h5>
        <div className="center gap-6" style={{flexWrap:'wrap'}}>
          {ADMINS.slice(0, 3).map(a => (
            <span key={a.id} className="badge outline" style={{fontSize:11, padding:'4px 8px'}}>
              <Avatar name={a.name} size={16}/>
              {a.name}
              <I.X size={10} style={{marginLeft:4, opacity:0.6, cursor:'pointer'}}/>
            </span>
          ))}
          <button className="btn sm ghost"><I.Plus size={11}/> Add</button>
        </div>

        <button className="btn primary mt-16"><I.Check size={12}/> Save changes</button>
      </div>
    </div>
  );
}

function SettingsWebhooks() {
  const hooks = [
    { id: 'wh_001', url: 'https://hooks.padosoft.com/sentry/compliance', events: ['dsar.opened','dsar.breach','incident.escalated'], lastDelivery: window.NOW - 2 * 3600_000, ok: true },
    { id: 'wh_002', url: 'https://workspace.slack.com/api/services/T0/B0/xyz', events: ['bias.drift_detected','incident.critical'], lastDelivery: window.NOW - 11 * 3600_000, ok: true },
    { id: 'wh_003', url: 'https://api.partner.example.com/webhooks/compliance', events: ['attestation.generated'], lastDelivery: window.NOW - 4 * 86400_000, ok: false },
  ];
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3 className="card-title">Outbound webhooks</h3>
          <p className="card-sub">Event-based delivery with retry policy</p>
        </div>
        <button className="btn sm primary"><I.Plus size={11}/> New webhook</button>
      </div>
      <div className="card-body flush">
        {hooks.map((h, i) => (
          <div key={h.id} className="approval-card" style={{borderBottom: i < hooks.length - 1 ? '1px solid var(--border)' : 0}}>
            <div className="approval-info" style={{minWidth:0}}>
              <b className="mono" style={{fontSize:12, fontWeight:500, display:'block', overflow:'hidden', textOverflow:'ellipsis'}}>{h.url}</b>
              <div className="center gap-6 mt-8" style={{flexWrap:'wrap'}}>
                {h.events.map(e => <span key={e} className="badge outline" style={{fontSize:10}}>{e}</span>)}
              </div>
            </div>
            <div className="approval-actions">
              <span className={`badge ${h.ok ? 'success' : 'failed'}`} style={{fontSize:10}}>
                <span className="dot"/>{h.ok ? `OK · ${fmtRelativeFrom(h.lastDelivery)}` : `Failed · ${fmtRelativeFrom(h.lastDelivery)}`}
              </span>
              <button className="btn sm"><I.Send size={11}/> Test</button>
              <button className="btn sm ghost"><I.Edit size={11}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsNotifications() {
  return (
    <div className="row-gap-12">
      <div className="card">
        <div className="card-head">
          <h3 className="card-title">Email</h3>
        </div>
        <div className="card-body" style={{padding:18}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <div>
              <label style={{fontSize:11, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600}}>From address</label>
              <input className="input mt-8" defaultValue="compliance@padosoft.com"/>
            </div>
            <div>
              <label style={{fontSize:11, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600}}>Reply-to</label>
              <input className="input mt-8" defaultValue="dpo@padosoft.com"/>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="card-title">Slack integration</h3>
          <span className="badge success" style={{fontSize:10}}><span className="dot"/>Connected</span>
        </div>
        <div className="card-body" style={{padding:18}}>
          <div className="center gap-12">
            <div style={{width:36, height:36, borderRadius:6, background:'#4A154B', display:'grid', placeItems:'center', color:'white', fontWeight:700}}>
              S
            </div>
            <div className="flex-1">
              <b style={{fontSize:13, fontWeight:500}}>padosoft.slack.com</b>
              <small style={{display:'block', fontSize:11, color:'var(--text-tertiary)'}}>
                Default channel: <span className="mono">#compliance</span> · bot installed by Giulia Amalfi
              </small>
            </div>
            <button className="btn sm">Configure</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="card-title">Microsoft Teams</h3>
          <span className="badge pending" style={{fontSize:10}}><span className="dot"/>Not configured</span>
        </div>
        <div className="card-body" style={{padding:18}}>
          <p style={{fontSize:12.5, color:'var(--text-secondary)', margin:'0 0 12px'}}>
            Receive compliance events in your Teams channels. Requires admin install of the Padosoft Compliance bot.
          </p>
          <button className="btn primary sm"><I.Plus size={11}/> Connect Teams</button>
        </div>
      </div>
    </div>
  );
}

window.PageSettings = PageSettings;
