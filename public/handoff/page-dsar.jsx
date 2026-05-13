// ============== Screen 2: DSAR Queue ==============
// Split-pane: left = list, right = detail (timeline / scope / export / delete / comments)

function PageDSAR({ onNavigate }) {
  const [selectedId, setSelectedId] = React.useState(DSAR[1].id); // breached one, demoes SLA
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [typeFilter,   setTypeFilter]   = React.useState('all');
  const [query, setQuery] = React.useState('');

  const filtered = DSAR.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (typeFilter !== 'all' && d.type !== typeFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!d.subject.name.toLowerCase().includes(q) &&
          !d.subject.email.toLowerCase().includes(q) &&
          !d.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const selected = DSAR.find(d => d.id === selectedId);

  return (
    <div className="page split" data-screen-label="DSAR Queue">
      {/* --- LEFT: list --- */}
      <div className="pane">
        <div className="pane-head" style={{flexDirection:'column', alignItems:'stretch', gap:10, padding:'10px 12px 12px'}}>
          <div className="between">
            <div className="center gap-8">
              <h2 style={{margin:0, fontSize:13, fontWeight:600}}>DSAR Queue</h2>
              <span className="badge outline mono">{filtered.length}</span>
            </div>
            <button className="btn sm primary"><I.Plus size={12}/> New DSAR</button>
          </div>

          <div className="center gap-6" style={{flexWrap:'wrap'}}>
            <div style={{position:'relative', flex:'1 1 160px', minWidth:140}}>
              <I.Search size={12} style={{position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', color:'var(--text-tertiary)'}}/>
              <input className="input" placeholder="Search subject, ID…"
                     value={query} onChange={e => setQuery(e.target.value)}
                     style={{paddingLeft:26, fontSize:12, height:28}}/>
            </div>
          </div>

          <div className="center gap-6" style={{flexWrap:'wrap'}}>
            {['all','pending','in_progress','completed','rejected'].map(s => (
              <button key={s} className={`chip ${statusFilter === s ? 'active' : ''}`}
                      onClick={() => setStatusFilter(s)}>
                {s === 'all' ? 'All' : s.replace('_',' ').replace(/\b\w/g, c => c.toUpperCase())}
                <span className="count">{s === 'all' ? DSAR.length : DSAR.filter(d => d.status === s).length}</span>
              </button>
            ))}
          </div>

          <div className="center gap-6" style={{flexWrap:'wrap'}}>
            {['all','export','delete','rectify'].map(t => (
              <button key={t} className={`chip ${typeFilter === t ? 'active' : ''}`}
                      onClick={() => setTypeFilter(t)}
                      style={{fontSize:11}}>
                {t === 'all' ? 'All types' : t.replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        <div className="pane-body">
          {filtered.length === 0 && (
            <EmptyState
              title="No DSAR matches"
              body="Adjust filters or clear the search to see more requests."
            />
          )}
          <div>
            {filtered.map(d => <DSARRow key={d.id} d={d} active={d.id === selectedId} onClick={() => setSelectedId(d.id)}/>)}
          </div>
        </div>
      </div>

      {/* --- RIGHT: detail --- */}
      <div className="pane">
        {selected ? <DSARDetail dsar={selected}/> : (
          <EmptyState title="Select a request" body="Click a row on the left to inspect its full audit trail, requested scope, and SLA status."/>
        )}
      </div>
    </div>
  );
}

// ---- LEFT row ----
function DSARRow({ d, active, onClick }) {
  const breached = d.dueIn < 0 && d.status !== 'completed' && d.status !== 'rejected';
  const urgent = d.dueIn >= 0 && d.dueIn < 5 && d.status !== 'completed' && d.status !== 'rejected';
  const STATUS_MAP = {
    pending:     { tone: 'pending', label: 'Pending' },
    in_progress: { tone: 'running', label: 'In progress' },
    completed:   { tone: 'success', label: 'Completed' },
    rejected:    { tone: 'failed',  label: 'Rejected' },
  };
  const TYPE_ICONS = {
    export:  <I.Download size={11}/>,
    delete:  <I.Trash size={11}/>,
    rectify: <I.Edit size={11}/>,
  };
  const st = STATUS_MAP[d.status];

  return (
    <div onClick={onClick} style={{
      padding: '11px 14px',
      borderBottom: '1px solid var(--border)',
      background: active ? 'var(--bg-active)' : 'transparent',
      cursor: 'pointer',
      borderLeft: active ? '2px solid var(--text)' : '2px solid transparent',
    }}>
      <div className="between mb-8">
        <div className="center gap-8">
          <Avatar name={d.subject.name} size={24}/>
          <div style={{minWidth:0}}>
            <div style={{fontSize:12.5, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:180}}>
              {d.subject.name}
            </div>
            <div className="mono" style={{fontSize:10.5, color:'var(--text-tertiary)'}}>{d.subject.email}</div>
          </div>
        </div>
        <span className={`badge ${st.tone}`} style={{flexShrink:0}}>
          <span className="dot"/>{st.label}
        </span>
      </div>

      <div className="between" style={{fontSize:11}}>
        <div className="center gap-6">
          <span className="badge outline">
            {TYPE_ICONS[d.type]} {d.type}
          </span>
          <span className="mono" style={{color:'var(--text-tertiary)', fontSize:10.5}}>{d.id.replace('dsar_', '')}</span>
        </div>
        <span className="mono" style={{
          color: breached ? 'var(--sev-critical)' : urgent ? 'var(--sev-medium)' : 'var(--text-tertiary)',
          fontSize: 10.5, fontWeight: breached ? 600 : 400,
        }}>
          {d.status === 'completed' || d.status === 'rejected'
            ? `closed ${fmtRelativeFrom(d.closed || d.opened)}`
            : breached
              ? `SLA breached ${Math.abs(d.dueIn)}d`
              : `due in ${d.dueIn}d`}
        </span>
      </div>

      {d.status !== 'completed' && d.status !== 'rejected' && (
        <div className="sla-bar-wrap" style={{marginTop:8}}>
          <div className={`sla-bar ${breached ? 'breached' : ''}`}>
            <div className="sla-bar-fill" style={{
              width: breached ? '100%' : `${Math.min(100, ((30 - d.dueIn) / 30) * 100)}%`,
            }}/>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- RIGHT detail ----
function DSARDetail({ dsar }) {
  const [tab, setTab] = React.useState('timeline');
  const breached = dsar.dueIn < 0 && dsar.status !== 'completed' && dsar.status !== 'rejected';

  const timeline = DSAR_DETAIL_TIMELINE[dsar.id] || [
    { at: dsar.opened, actor: 'system', event: 'created', label: 'Request received' },
    { at: dsar.opened + 3600_000, actor: 'system', event: 'identity_verified', label: 'Identity verified via SPID' },
  ];
  const scope = DSAR_SCOPE[dsar.id] || [
    { domain: 'Conversations', rows: 412, retention: '90d', policy: 'auto-purge' },
    { domain: 'Chat embeddings', rows: 1_847, retention: '90d', policy: 'auto-purge' },
  ];

  const tabs = [
    { key: 'timeline', label: 'Timeline',     icon: <I.Activity size={12}/> },
    { key: 'scope',    label: 'Data scope',   icon: <I.Database size={12}/> },
    { key: 'action',   label: dsar.type === 'delete' ? 'Delete preview' : dsar.type === 'export' ? 'Export' : 'Rectify', icon: dsar.type === 'delete' ? <I.Trash size={12}/> : dsar.type === 'export' ? <I.Download size={12}/> : <I.Edit size={12}/> },
    { key: 'comments', label: 'Comments',     icon: <I.FileText size={12}/> },
  ];

  return (
    <>
      <div className="pane-head" style={{flexDirection:'column', alignItems:'stretch', gap:0, padding: 0}}>
        {/* Header */}
        <div style={{padding:'14px 18px 12px'}}>
          {breached && (
            <div className="alert-banner" style={{marginBottom:12, padding:'8px 12px'}}>
              <I.AlertTriangle size={14} className="icon"/>
              <div className="grow" style={{fontSize:12}}>
                <b>SLA breached.</b> Escalate to DPO — GDPR Art. 12(3) requires response within 30 days.
              </div>
              <button className="btn sm">Escalate</button>
            </div>
          )}
          <div className="between" style={{marginBottom:10}}>
            <div className="center gap-12">
              <Avatar name={dsar.subject.name} size={36}/>
              <div>
                <div style={{fontSize:15, fontWeight:600, letterSpacing:'-0.005em'}}>{dsar.subject.name}</div>
                <div className="mono" style={{fontSize:11.5, color:'var(--text-tertiary)'}}>
                  {dsar.subject.email} · {dsar.subject.country} · <span style={{color:'var(--text-secondary)'}}>{dsar.id}</span>
                </div>
              </div>
            </div>
            <div className="center gap-6">
              <span className="badge outline" style={{fontSize:11}}>
                {dsar.type === 'export' ? <I.Download size={11}/> : dsar.type === 'delete' ? <I.Trash size={11}/> : <I.Edit size={11}/>}
                {' '}{dsar.type}
              </span>
              <StatusBadge status={dsar.status === 'in_progress' ? 'running' : dsar.status === 'completed' ? 'success' : dsar.status === 'rejected' ? 'failed' : 'pending'}/>
            </div>
          </div>

          {/* SLA progress */}
          {dsar.status !== 'completed' && dsar.status !== 'rejected' && (
            <div>
              <div className="between" style={{fontSize:11, color:'var(--text-tertiary)', marginBottom:4}}>
                <span>SLA progress · 30-day target per GDPR Art. 12(3)</span>
                <span className="mono" style={{
                  color: breached ? 'var(--sev-critical)' : 'var(--text-secondary)',
                  fontWeight: 600,
                }}>
                  {breached ? `+${Math.abs(dsar.dueIn)}d overdue` : `${dsar.dueIn} days remaining`}
                </span>
              </div>
              <div className={`sla-bar ${breached ? 'breached' : ''}`} style={{height:10}}>
                <div className="sla-bar-fill" style={{
                  width: breached ? '100%' : `${Math.min(100, ((30 - dsar.dueIn) / 30) * 100)}%`,
                }}/>
              </div>
            </div>
          )}

          <div className="center gap-6" style={{marginTop:12, flexWrap:'wrap'}}>
            {dsar.articles.map(a => <ArticleRef key={a}>{a}</ArticleRef>)}
            {dsar.assignee && (
              <span className="badge outline" style={{fontSize:11}}>
                <Avatar name={dsar.assignee.name} size={14}/> {dsar.assignee.name}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{paddingLeft:14}}>
          {tabs.map(t => (
            <div key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              {t.icon}{t.label}
            </div>
          ))}
        </div>
      </div>

      <div className="pane-body" style={{padding: '14px 18px'}}>
        {tab === 'timeline' && <DSARTimeline events={timeline} status={dsar.status} breached={breached}/>}
        {tab === 'scope'    && <DSARScope scope={scope}/>}
        {tab === 'action'   && <DSARAction dsar={dsar}/>}
        {tab === 'comments' && <DSARComments/>}
      </div>

      {/* Actions footer */}
      <div style={{
        padding:'12px 18px', borderTop:'1px solid var(--border)',
        background:'var(--bg-subtle)', display:'flex', gap:8, justifyContent:'flex-end',
      }}>
        {dsar.status === 'pending' && <>
          <button className="btn danger sm"><I.XCircle size={12}/> Reject</button>
          <button className="btn sm"><I.User size={12}/> Assign to me</button>
          <button className="btn primary sm"><I.ArrowRight size={12}/> Start triage</button>
        </>}
        {dsar.status === 'in_progress' && <>
          <button className="btn sm"><I.User size={12}/> Reassign</button>
          <button className="btn primary sm"><I.CheckCircle size={12}/> Mark completed</button>
        </>}
        {(dsar.status === 'completed' || dsar.status === 'rejected') && (
          <button className="btn sm"><I.Replay size={12}/> Reopen</button>
        )}
      </div>
    </>
  );
}

function DSARTimeline({ events, status, breached }) {
  return (
    <div className="vtimeline">
      {events.map((e, i) => {
        const isLast = i === events.length - 1;
        const isBreach = e.event === 'sla_warning';
        return (
          <div className="vt-item" key={i}>
            <div className={`vt-dot ${isBreach ? 'alert' : isLast && status === 'in_progress' ? 'current' : 'done'}`}/>
            <div className="vt-body">
              <b>{e.label}</b>
              <small>{fmtDateTime(e.at)} · by {e.actor}</small>
            </div>
          </div>
        );
      })}
      {status === 'in_progress' && !breached && (
        <div className="vt-item">
          <div className="vt-dot"/>
          <div className="vt-body">
            <b style={{color:'var(--text-tertiary)'}}>Awaiting export job dispatch</b>
            <small>Will fire automatically on triage completion</small>
          </div>
        </div>
      )}
    </div>
  );
}

function DSARScope({ scope }) {
  const total = scope.reduce((a, b) => a + b.rows, 0);
  return (
    <div>
      <div className="between mb-12">
        <div>
          <h4 style={{margin:0, fontSize:13, fontWeight:600}}>Requested data scope</h4>
          <p style={{margin:'2px 0 0', fontSize:11.5, color:'var(--text-tertiary)'}}>
            <b className="mono" style={{color:'var(--text-secondary)'}}>{total.toLocaleString()}</b> rows across <b>{scope.length}</b> data domains
          </p>
        </div>
        <button className="btn sm"><I.Eye size={12}/> Preview export</button>
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th>Domain</th>
            <th className="num">Rows</th>
            <th>Retention</th>
            <th>Policy</th>
          </tr>
        </thead>
        <tbody>
          {scope.map((s, i) => (
            <tr key={i} style={{cursor:'default'}}>
              <td><b style={{fontWeight:500}}>{s.domain}</b></td>
              <td className="num mono">{s.rows.toLocaleString()}</td>
              <td className="muted mono" style={{fontSize:11.5}}>{s.retention}</td>
              <td className="muted">{s.policy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DSARAction({ dsar }) {
  const [confirm, setConfirm] = React.useState('');
  if (dsar.type === 'delete') {
    return (
      <div>
        <h4 style={{margin:'0 0 4px', fontSize:13, fontWeight:600}}>Delete cascade preview</h4>
        <p style={{margin:'0 0 14px', fontSize:11.5, color:'var(--text-tertiary)'}}>
          Atomic destructive operation. All listed rows will be hard-deleted (no soft-delete fallback).
          Requires typing the subject's email below to confirm.
        </p>
        <pre className="code-block" style={{fontSize:11.5, marginBottom:14}}>{`-- Cascade plan generated 2026-05-14
DELETE FROM conversations      WHERE user_id = '${dsar.subject.id}';            -- 412 rows
DELETE FROM chat_embeddings    WHERE user_id = '${dsar.subject.id}';            -- 1,847 rows
DELETE FROM kb_audit_log       WHERE actor   = '${dsar.subject.email}';        -- 24 rows
DELETE FROM connector_installs WHERE user_id = '${dsar.subject.id}';            -- 1 row
-- Total: 2,284 rows`}</pre>
        <label style={{fontSize:11, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600}}>
          Type "{dsar.subject.email}" to confirm
        </label>
        <input className="input mt-8" placeholder={dsar.subject.email}
               value={confirm} onChange={e => setConfirm(e.target.value)}
               style={{fontFamily:'var(--font-mono)', fontSize:12}}/>
        <button className="btn danger mt-12" disabled={confirm !== dsar.subject.email}>
          <I.Trash size={12}/> Execute cascade — 2,284 rows
        </button>
      </div>
    );
  }
  if (dsar.type === 'export') {
    return (
      <div>
        <h4 style={{margin:'0 0 4px', fontSize:13, fontWeight:600}}>Generate data export</h4>
        <p style={{margin:'0 0 14px', fontSize:11.5, color:'var(--text-tertiary)'}}>
          Produces a portable ZIP containing all subject data per GDPR Art. 20.
          File name: <span className="mono" style={{color:'var(--text-secondary)'}}>{`${dsar.id}-export-${fmtDate(window.NOW)}.zip`}</span>
        </p>
        <div style={{padding:14, background:'var(--bg-subtle)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)'}}>
          <div className="between mb-8">
            <span style={{fontSize:12, fontWeight:500}}>ExportUserDataJob</span>
            <StatusBadge status={dsar.status === 'in_progress' ? 'running' : 'pending'}/>
          </div>
          <div className="sla-bar" style={{height:6}}>
            <div className="sla-bar-fill" style={{width: dsar.status === 'in_progress' ? '62%' : '0%', background:'var(--status-running)'}}/>
          </div>
          <small className="mono" style={{fontSize:10.5, color:'var(--text-tertiary)', marginTop:6, display:'block'}}>
            {dsar.status === 'in_progress' ? 'Worker queue.default · 62% · ETA 2m 18s' : 'Not started'}
          </small>
        </div>
        <button className="btn primary mt-12" disabled={dsar.status !== 'pending'}>
          <I.Send size={12}/> Dispatch export job
        </button>
      </div>
    );
  }
  return (
    <div>
      <h4 style={{margin:'0 0 4px', fontSize:13, fontWeight:600}}>Rectification</h4>
      <p style={{margin:0, fontSize:11.5, color:'var(--text-tertiary)'}}>
        Subject requested correction of inaccurate personal data — review fields and apply patch.
      </p>
    </div>
  );
}

function DSARComments() {
  const [text, setText] = React.useState('');
  const comments = [
    { id: 1, actor: ADMINS[1], text: 'Awaiting legal review for processor cascade — connector tokens for Slack workspace need separate revocation.', at: window.NOW - 2 * 86400_000 },
    { id: 2, actor: ADMINS[4], text: 'Approved — proceed with standard cascade. No additional processor obligations.', at: window.NOW - 1 * 86400_000 },
  ];
  return (
    <div>
      {comments.map(c => (
        <div key={c.id} style={{paddingBottom:14, marginBottom:14, borderBottom:'1px solid var(--border)'}}>
          <div className="center gap-8 mb-8">
            <Avatar name={c.actor.name} size={22}/>
            <div>
              <b style={{fontSize:12, fontWeight:500}}>{c.actor.name}</b>
              <small style={{display:'block', fontSize:10.5, color:'var(--text-tertiary)', fontFamily:'var(--font-mono)'}}>
                {c.actor.role} · {fmtRelativeFrom(c.at)}
              </small>
            </div>
          </div>
          <div style={{fontSize:12.5, lineHeight:1.55, color:'var(--text-secondary)'}}>{c.text}</div>
        </div>
      ))}
      <textarea placeholder="Add an internal note (not visible to data subject)…"
                value={text} onChange={e => setText(e.target.value)}
                style={{width:'100%', minHeight:80, padding:10, background:'var(--bg-subtle)',
                        border:'1px solid var(--border)', borderRadius:'var(--radius-sm)',
                        fontFamily:'var(--font-sans)', fontSize:12.5, resize:'vertical', outline:'none'}}/>
      <button className="btn sm primary mt-8" disabled={!text.trim()}>
        <I.Send size={12}/> Post note
      </button>
    </div>
  );
}

window.PageDSAR = PageDSAR;
