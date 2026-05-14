// ============== Screen 5: Incident Manager — Kanban with DnD ==============

const INC_STATES = [
  { key: 'open',       label: 'Open',        accent: 'open' },
  { key: 'triage',     label: 'Triage',      accent: 'triage' },
  { key: 'mitigating', label: 'Mitigating',  accent: 'mitigating' },
  { key: 'closed',     label: 'Closed',      accent: 'closed' },
];

const VALID_TRANSITIONS = {
  open:       new Set(['triage', 'closed']),
  triage:     new Set(['mitigating', 'closed', 'open']),
  mitigating: new Set(['closed', 'triage']),
  closed:     new Set(['triage']),  // reopen with reason
};

function PageIncidents({ onNavigate }) {
  const [items, setItems] = React.useState(INCIDENTS);
  const [draggingId, setDraggingId] = React.useState(null);
  const [hoverCol, setHoverCol] = React.useState(null);
  const [open, setOpen] = React.useState(null);
  const toast = useToast();

  const onDragStart = (id, e) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', id); } catch {}
  };
  const onDragEnd = () => {
    setDraggingId(null);
    setHoverCol(null);
  };
  const onDragOverCol = (colKey, e) => {
    e.preventDefault();
    setHoverCol(colKey);
  };
  const onDropCol = (colKey, e) => {
    e.preventDefault();
    const id = draggingId;
    if (!id) return;
    const inc = items.find(i => i.id === id);
    if (!inc) return;
    if (inc.state === colKey) { setDraggingId(null); setHoverCol(null); return; }
    if (!VALID_TRANSITIONS[inc.state].has(colKey)) {
      toast.push({
        title: 'Invalid transition',
        body: `Cannot move from ${inc.state} → ${colKey}. ${
          colKey === 'open' && inc.state === 'closed'
            ? 'Reopen requires a reason — use the detail view.'
            : 'Check state machine.'
        }`,
        kind: 'error',
      });
      setDraggingId(null); setHoverCol(null);
      return;
    }
    setItems(prev => prev.map(i => i.id === id ? {
      ...i,
      state: colKey,
      ...(colKey === 'closed' ? { closed: window.NOW } : {}),
    } : i));
    toast.push({
      title: `Moved to ${colKey}`,
      body: `${inc.id} · ${inc.title.slice(0, 48)}…`,
    });
    setDraggingId(null); setHoverCol(null);
  };

  const grouped = INC_STATES.reduce((a, s) => {
    a[s.key] = items.filter(i => i.state === s.key);
    return a;
  }, {});

  const critical = items.filter(i => i.state !== 'closed' && i.severity === 'critical');

  return (
    <div className="page wide" data-screen-label="Incident Manager"
         style={{height:'calc(100vh - var(--topbar-h))', paddingBottom:24, maxWidth:'none'}}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Incident Manager</h1>
          <p className="page-sub">
            State-machine enforced lifecycle · drag-and-drop transitions · post-mortem capture per AI Act Art. 73
          </p>
        </div>
        <div className="page-actions">
          <button className="btn"><I.Filter size={13}/> Filter</button>
          <button className="btn primary"><I.Plus size={13}/> New incident</button>
        </div>
      </div>

      {critical.length > 0 && (
        <div className="alert-banner">
          <I.AlertTriangle size={16} className="icon"/>
          <div className="grow">
            <b>{critical.length} critical incident{critical.length > 1 ? 's' : ''}</b> require immediate attention ·{' '}
            <span className="muted">SLA notify: CISO, DPO, CEO via escalation tree</span>
          </div>
          <button className="btn sm" onClick={() => setOpen(critical[0])}>View now <I.ChevronRight size={11}/></button>
        </div>
      )}

      <div className="kanban">
        {INC_STATES.map(state => {
          const list = grouped[state.key];
          const valid = draggingId
            ? items.find(i => i.id === draggingId)?.state === state.key ||
              VALID_TRANSITIONS[items.find(i => i.id === draggingId)?.state]?.has(state.key)
            : true;
          const isHover = hoverCol === state.key && draggingId;
          return (
            <div className="kanban-col" key={state.key}>
              <div className="kanban-col-head">
                <div className="name">
                  <span className={`kanban-state-dot ${state.accent}`}/>
                  {state.label}
                </div>
                <span className="count">{list.length}</span>
              </div>
              <div className={`kanban-list ${isHover ? (valid ? 'drag-over' : 'drag-invalid') : ''}`}
                   onDragOver={(e) => onDragOverCol(state.key, e)}
                   onDragLeave={() => setHoverCol(null)}
                   onDrop={(e) => onDropCol(state.key, e)}>
                {list.length === 0 && state.key !== 'closed' && !draggingId && (
                  <div style={{padding:'24px 12px', textAlign:'center', color:'var(--text-tertiary)', fontSize:11.5}}>
                    {state.key === 'open' && 'All clear in this lane'}
                    {state.key === 'triage' && 'Nothing in triage'}
                    {state.key === 'mitigating' && 'No active mitigations'}
                  </div>
                )}
                {list.map(inc => (
                  <KanbanCard key={inc.id} inc={inc}
                              dragging={draggingId === inc.id}
                              onDragStart={(e) => onDragStart(inc.id, e)}
                              onDragEnd={onDragEnd}
                              onClick={() => setOpen(inc)}/>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <IncidentSheet inc={open} onClose={() => setOpen(null)}/>
    </div>
  );
}

function KanbanCard({ inc, dragging, onDragStart, onDragEnd, onClick }) {
  return (
    <div className={`kanban-card ${inc.severity} ${dragging ? 'dragging' : ''}`}
         draggable
         onDragStart={onDragStart} onDragEnd={onDragEnd}
         onClick={onClick}>
      <div className="kc-id">
        <span>{inc.id.replace('inc_', '')}</span>
        <SevBadge level={inc.severity}/>
      </div>
      <div className="kc-title">{inc.title}</div>
      {inc.articles.length > 0 && (
        <div className="center gap-6 mb-8" style={{flexWrap:'wrap'}}>
          {inc.articles.slice(0, 2).map(a => <ArticleRef key={a}>{a}</ArticleRef>)}
        </div>
      )}
      <div className="kc-meta">
        {inc.assignee
          ? <Avatar name={inc.assignee.name} size={18}/>
          : <span style={{width:18, height:18, borderRadius:'50%', border:'1px dashed var(--border-strong)'}}/>}
        {inc.affected > 0 && <span><I.Users size={11} style={{verticalAlign:-2}}/> {inc.affected}</span>}
        <span className="grow"/>
        <span className="mono">{fmtRelativeFrom(inc.opened)}</span>
      </div>
    </div>
  );
}

function IncidentSheet({ inc, onClose }) {
  const [tab, setTab] = React.useState('overview');
  if (!inc) return null;
  const detail = INCIDENT_DETAIL[inc.id] || {
    description: 'No additional description recorded. Add context via the mitigation log.',
    timeline: [
      { at: inc.opened, actor: 'system', event: 'created', label: 'Incident created' },
      ...(inc.assignee ? [{ at: inc.opened + 3600_000, actor: inc.assignee.name, event: 'assigned', label: 'Self-assigned' }] : []),
    ],
    mitigations: [],
    escalation: [
      { level: inc.severity, recipients: inc.severity === 'critical' ? ['CISO','DPO','CEO'] : inc.severity === 'high' ? ['CISO','DPO'] : ['Eng Lead'], notified: !!inc.assignee },
    ],
    affectedUsers: SUBJECTS.slice(0, Math.min(inc.affected, 4)),
  };

  const tabs = [
    { key:'overview',    label:'Overview',    icon: <I.FileText size={12}/> },
    { key:'timeline',    label:'Timeline',    icon: <I.Activity size={12}/> },
    { key:'escalation',  label:'Escalation',  icon: <I.Network size={12}/> },
    { key:'mitigations', label:'Mitigations', icon: <I.Wand size={12}/> },
    { key:'affected',    label:`Affected · ${inc.affected}`, icon: <I.Users size={12}/> },
  ];
  if (inc.state === 'closed') {
    tabs.push({ key:'postmortem', label:'Post-mortem', icon: <I.Award size={12}/> });
  }

  return (
    <Drawer open onClose={onClose}
            title={
              <div className="center gap-8">
                <span className="mono" style={{fontSize:11, color:'var(--text-tertiary)'}}>{inc.id}</span>
                <SevBadge level={inc.severity}/>
              </div>
            }>
      <div style={{padding:'18px 22px 0'}}>
        <h2 style={{margin:'0 0 6px', fontSize:17, fontWeight:600, letterSpacing:'-0.01em', lineHeight:1.3}}>{inc.title}</h2>
        <div className="center gap-6 mb-12" style={{flexWrap:'wrap'}}>
          <span className={`badge ${inc.state === 'closed' ? 'success' : 'running'}`}>
            <span className="dot"/>{inc.state}
          </span>
          {inc.assignee && (
            <span className="badge outline" style={{fontSize:11}}>
              <Avatar name={inc.assignee.name} size={14}/> {inc.assignee.name}
            </span>
          )}
          {inc.tags.map(t => (
            <span key={t} className="badge outline" style={{fontSize:10.5}}>
              <I.Tag size={9}/> {t}
            </span>
          ))}
          {inc.articles.map(a => <ArticleRef key={a}>{a}</ArticleRef>)}
        </div>
      </div>

      <div className="tabs" style={{padding: '0 22px'}}>
        {tabs.map(t => (
          <div key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.icon}{t.label}
          </div>
        ))}
      </div>

      <div style={{padding:'18px 22px'}}>
        {tab === 'overview' && (
          <div>
            <p style={{fontSize:13, lineHeight:1.6, color:'var(--text-secondary)', margin:'0 0 18px'}}>{detail.description}</p>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, padding:14, background:'var(--bg-subtle)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)'}}>
              <Field label="Severity"><SevBadge level={inc.severity}/></Field>
              <Field label="Opened"><b className="mono" style={{fontSize:12}}>{fmtDateTime(inc.opened)}</b></Field>
              <Field label="Assignee">
                {inc.assignee ? <span className="center gap-6"><Avatar name={inc.assignee.name} size={18}/> {inc.assignee.name}</span> : <i style={{color:'var(--text-tertiary)'}}>unassigned</i>}
              </Field>
              <Field label="Reporter">
                <span className="mono" style={{fontSize:12}}>eval-harness</span>
              </Field>
              <Field label="Affected users"><b className="mono">{inc.affected.toLocaleString()}</b></Field>
              <Field label="Tags">
                <div className="center gap-6" style={{flexWrap:'wrap'}}>
                  {inc.tags.map(t => <span key={t} className="badge outline" style={{fontSize:10}}>{t}</span>)}
                </div>
              </Field>
            </div>
          </div>
        )}

        {tab === 'timeline' && (
          <div className="vtimeline">
            {detail.timeline.map((e, i) => (
              <div key={i} className="vt-item">
                <div className={`vt-dot ${i === 0 ? 'alert' : 'done'}`}/>
                <div className="vt-body">
                  <b>{e.label}</b>
                  <small>{fmtDateTime(e.at)} · by {e.actor}</small>
                </div>
              </div>
            ))}
            {inc.state === 'closed' && (
              <div className="vt-item">
                <div className="vt-dot done"/>
                <div className="vt-body">
                  <b>Closed</b>
                  <small>{fmtDateTime(inc.closed || inc.opened + 86400_000)}</small>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'escalation' && (
          <div>
            <p style={{fontSize:12, color:'var(--text-tertiary)', margin:'0 0 14px'}}>
              Escalation routing tree applied automatically based on severity. Configurable per tenant in Settings.
            </p>
            <EscalationTree inc={inc}/>
          </div>
        )}

        {tab === 'mitigations' && (
          <div>
            <div className="vtimeline mb-12">
              {detail.mitigations.length === 0 ? (
                <p style={{fontSize:12, color:'var(--text-tertiary)'}}>No mitigations recorded yet. Add the first action below.</p>
              ) : detail.mitigations.map((m, i) => (
                <div key={i} className="vt-item">
                  <div className="vt-dot done"/>
                  <div className="vt-body">
                    <b style={{fontWeight:500}}>{m.text}</b>
                    <small>{fmtDateTime(m.at)} · {m.actor}</small>
                  </div>
                </div>
              ))}
            </div>
            <textarea placeholder="Describe the mitigation action taken…"
                      style={{width:'100%', minHeight:80, padding:10, background:'var(--bg-subtle)',
                              border:'1px solid var(--border)', borderRadius:'var(--radius-sm)',
                              fontFamily:'var(--font-sans)', fontSize:12.5, resize:'vertical', outline:'none'}}/>
            <button className="btn sm primary mt-8"><I.Send size={11}/> Append entry</button>
          </div>
        )}

        {tab === 'affected' && (
          <div>
            <p style={{fontSize:12, color:'var(--text-tertiary)', margin:'0 0 12px'}}>
              {inc.affected.toLocaleString()} data subjects identified. Click to open their DSAR profile.
            </p>
            <div className="card">
              {detail.affectedUsers.map((u, i) => (
                <div key={u.id} className="approval-card" style={{borderBottom: i < detail.affectedUsers.length - 1 ? '1px solid var(--border)' : 0}}>
                  <div className="center gap-10">
                    <Avatar name={u.name} size={26}/>
                    <div className="approval-info">
                      <b>{u.name}</b>
                      <small className="mono">{u.email} · {u.country}</small>
                    </div>
                  </div>
                  <button className="btn sm ghost"><I.External size={11}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'postmortem' && (
          <Postmortem inc={inc}/>
        )}
      </div>
    </Drawer>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <small style={{fontSize:10, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-tertiary)', fontWeight:600, display:'block', marginBottom:4}}>
        {label}
      </small>
      <div style={{fontSize:12.5}}>{children}</div>
    </div>
  );
}

function EscalationTree({ inc }) {
  const TREE = [
    { level: 'low',      recipients: ['Eng Lead'] },
    { level: 'medium',   recipients: ['Eng Lead', 'AI Risk Lead'] },
    { level: 'high',     recipients: ['AI Risk Lead', 'CISO', 'DPO'] },
    { level: 'critical', recipients: ['CISO', 'DPO', 'CEO'] },
  ];
  return (
    <div className="card">
      {TREE.map((t, i) => {
        const active = inc.severity === t.level;
        return (
          <div key={t.level} className="approval-card" style={{
            borderLeft: active ? `3px solid var(--sev-${t.level})` : '3px solid transparent',
            background: active ? `var(--sev-${t.level}-bg)` : 'transparent',
            borderBottom: i < TREE.length - 1 ? '1px solid var(--border)' : 0,
          }}>
            <div className="center gap-10">
              <SevBadge level={t.level}/>
              <div className="approval-info">
                <b style={{fontSize:12.5}}>{t.recipients.join(' → ')}</b>
                <small>
                  {active ? 'Active route — notifications dispatched' : 'Auto-routed when severity matches'}
                </small>
              </div>
            </div>
            {active && <span className="badge success" style={{fontSize:10}}><span className="dot"/>notified</span>}
          </div>
        );
      })}
    </div>
  );
}

function Postmortem({ inc }) {
  return (
    <div>
      <div className="between mb-12">
        <h4 style={{margin:0, fontSize:13, fontWeight:600}}>Post-mortem · {inc.id}</h4>
        <button className="btn sm"><I.Download size={11}/> Export PDF</button>
      </div>
      <div style={{padding:18, background:'var(--bg-subtle)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', fontSize:12.5, lineHeight:1.6}}>
        <h5 style={{margin:'0 0 4px', fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-tertiary)'}}>What happened</h5>
        <p style={{margin:'0 0 12px', color:'var(--text-secondary)'}}>
          {inc.title}. Detected by eval-harness on {fmtDateLong(inc.opened)} and triaged within 1 hour.
        </p>
        <h5 style={{margin:'0 0 4px', fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-tertiary)'}}>Impact</h5>
        <p style={{margin:'0 0 12px', color:'var(--text-secondary)'}}>
          {inc.affected} data subjects affected. {inc.articles.length > 0 && `Regulatory impact under ${inc.articles.join(', ')}.`}
        </p>
        <h5 style={{margin:'0 0 4px', fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-tertiary)'}}>Root cause</h5>
        <p style={{margin:'0 0 12px', color:'var(--text-secondary)'}}>
          To be filled by the assignee. Use 5-whys analysis.
        </p>
        <h5 style={{margin:'0 0 4px', fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-tertiary)'}}>Lessons learned</h5>
        <p style={{margin:'0', color:'var(--text-secondary)'}}>
          To be filled by the assignee.
        </p>
      </div>
    </div>
  );
}

window.PageIncidents = PageIncidents;
