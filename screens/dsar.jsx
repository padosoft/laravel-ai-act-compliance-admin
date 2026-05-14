// ============== Screen 2 — DSAR Queue ==============

function DsarScreen({ navigate, jump, consumeJump }) {
  const [statusFilter, setStatusFilter] = React.useState(new Set(['pending','in_progress','completed','rejected']));
  const [typeFilter, setTypeFilter] = React.useState(new Set(['export','delete','rectify']));
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(DSAR_QUEUE[0].id);
  const [activeTab, setActiveTab] = React.useState('timeline');
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);
  const [confirmEmail, setConfirmEmail] = React.useState('');
  const toast = useToast();

  // Handle command palette jump
  React.useEffect(() => {
    const j = consumeJump?.();
    if (j?.type === 'openDsar') setSelected(j.id);
  }, [jump]);

  const filtered = DSAR_QUEUE.filter(d =>
    statusFilter.has(d.status) &&
    typeFilter.has(d.type) &&
    (search === '' || d.user.email.toLowerCase().includes(search.toLowerCase()) || d.user.name.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase()))
  );

  const current = DSAR_QUEUE.find(d => d.id === selected) || DSAR_QUEUE[0];

  const toggleSet = (set, key) => {
    const n = new Set(set);
    if (n.has(key)) n.delete(key); else n.add(key);
    return n;
  };

  return (
    <div className="page" data-screen-label="DSAR Queue" style={{maxWidth: 'none', padding: '20px 24px'}}>
      <div className="page-head">
        <div>
          <h1 className="page-title">DSAR Queue</h1>
          <p className="page-sub">
            Data Subject Access Requests · <span className="art-chip gdpr">GDPR Art. 12</span> <span className="art-chip gdpr">Art. 15</span> <span className="art-chip gdpr">Art. 16</span> <span className="art-chip gdpr">Art. 17</span> 30-day response window
          </p>
        </div>
        <div className="page-actions">
          <button className="btn"><IC.Download size={13}/> Export queue</button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar" style={{marginBottom: 14}}>
        <input className="input" placeholder="Search by email, name, or DSAR ID…" style={{width: 280}}
               value={search} onChange={e => setSearch(e.target.value)}/>
        <span style={{fontSize:11, color:'var(--text-tertiary)', marginLeft: 8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Status</span>
        {['pending','in_progress','completed','rejected'].map(s => (
          <button key={s} className={`chip ${statusFilter.has(s) ? 'active' : ''}`} onClick={() => setStatusFilter(toggleSet(statusFilter, s))}>
            {s.replace('_', ' ')}
            <span className="count">{DSAR_QUEUE.filter(d => d.status === s).length}</span>
          </button>
        ))}
        <span style={{fontSize:11, color:'var(--text-tertiary)', marginLeft: 12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Type</span>
        {['export','delete','rectify'].map(t => (
          <button key={t} className={`chip ${typeFilter.has(t) ? 'active' : ''}`} onClick={() => setTypeFilter(toggleSet(typeFilter, t))}>
            {t}
          </button>
        ))}
        <div style={{flex:1}}/>
        <span style={{fontSize:11, color:'var(--text-tertiary)', fontFamily:'var(--font-mono)'}}>
          {filtered.length} of {DSAR_QUEUE.length}
        </span>
      </div>

      {/* Split pane */}
      <div className="split-pane">
        {/* LEFT: list */}
        <div className="split-list">
          <div style={{
            padding: '10px 14px', fontSize: 10.5, textTransform: 'uppercase',
            letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600,
            display: 'grid', gridTemplateColumns: '1.4fr 80px 1fr 80px 80px', gap: 8,
            borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)'
          }}>
            <span>User · DSAR ID</span><span>Type</span><span>SLA</span><span>Age</span><span>Status</span>
          </div>
          <div className="split-list-scroll">
            {filtered.length === 0 ? (
              <EmptyState art="Inbox" title="No DSAR requests match filters"
                          body="Adjust your filters or wait for new requests to come in via the public DSAR portal."/>
            ) : filtered.map(d => (
              <DsarRow key={d.id} d={d} selected={d.id === selected} onClick={() => setSelected(d.id)}/>
            ))}
          </div>
          <div className="pagination" style={{flexShrink: 0}}>
            <span>Showing 1–{filtered.length} of {filtered.length}</span>
            <div className="pagination-controls">
              <button className="btn sm ghost" disabled><I.ChevronLeft size={12}/></button>
              <span style={{padding:'0 8px', fontFamily:'var(--font-mono)', fontSize:11}}>1 / 1</span>
              <button className="btn sm ghost" disabled><I.ChevronRight size={12}/></button>
            </div>
          </div>
        </div>

        <div className="split-handle"/>

        {/* RIGHT: detail */}
        <div className="split-detail">
          <DsarDetail d={current} activeTab={activeTab} setActiveTab={setActiveTab}
                      onDeleteAction={() => setDeleteConfirm(true)}
                      onActionToast={(msg) => toast.push(msg)}/>
        </div>
      </div>

      {/* Confirm delete modal */}
      <Modal open={deleteConfirm} onClose={() => { setDeleteConfirm(false); setConfirmEmail(''); }}
             title="Confirm cascade delete"
             sub={`This will permanently delete data for ${current.user.email} · GDPR Art. 17 — immediate, atomic, irreversible`}
             footer={<>
               <button className="btn" onClick={() => { setDeleteConfirm(false); setConfirmEmail(''); }}>Cancel</button>
               <button className="btn danger" disabled={confirmEmail !== current.user.email}
                       onClick={() => {
                         setDeleteConfirm(false);
                         setConfirmEmail('');
                         toast.push({title: 'Cascade delete dispatched', body: `${current.user.email} — audit trail entry created`});
                       }}>
                 <IC.Trash size={13}/> Confirm delete
               </button>
             </>}>
        <p style={{margin:'0 0 14px', fontSize: 12.5}}>
          The following rows will be permanently deleted:
        </p>
        {current.cascade && (
          <div style={{border:'1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: 14, maxHeight: 220, overflow: 'auto'}}>
            {current.cascade.map((c, i) => (
              <div key={i} className={`tree-row depth-${c.depth}`}>
                <span>{c.depth > 0 && '└─ '}<b>{c.label}</b></span>
                <span className="num">{c.count.toLocaleString()} rows</span>
              </div>
            ))}
          </div>
        )}
        <p style={{margin:'0 0 8px', fontSize: 12.5}}>
          To confirm, type the user's email <code style={{background:'var(--bg-subtle)', padding:'2px 6px', borderRadius: 4, fontFamily:'var(--font-mono)', fontSize: 11.5}}>{current.user.email}</code> below:
        </p>
        <input className="input" placeholder={current.user.email}
               value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)}/>
      </Modal>
    </div>
  );
}

// =============== DSAR list row ===============
function DsarRow({ d, selected, onClick }) {
  const slaDaysLeft = d.slaDays - Math.floor((NOW - d.createdAt) / DAY);
  const slaPct = Math.min(100, (Math.floor((NOW - d.createdAt) / DAY) / d.slaDays) * 100);
  const slaClass = slaDaysLeft < 0 ? 'red' : slaDaysLeft < 5 ? 'amber' : 'green';
  const isCompleted = d.status === 'completed' || d.status === 'rejected';

  return (
    <div className={`dsar-row ${selected ? 'selected' : ''} ${d.breach && !isCompleted ? 'breached' : ''}`} onClick={onClick}>
      <div className="user-row">
        <div className="avatar xs" style={{background:`linear-gradient(135deg, hsl(${d.user.name.length*47%360}, 60%, 50%), hsl(${d.user.email.length*23%360}, 60%, 40%))`}}>
          {initials(d.user.name)}
        </div>
        <div className="nm" style={{minWidth: 0}}>
          <b>{d.user.name}</b>
          <small>{d.id}</small>
        </div>
      </div>
      <div>
        <span className={`badge ${d.type === 'delete' ? 'failed' : d.type === 'export' ? 'running' : 'compensated'}`}>
          {d.type === 'delete' && <IC.Trash size={9}/>}
          {d.type === 'export' && <IC.Download size={9}/>}
          {d.type === 'rectify' && <IC.Edit size={9}/>}
          {d.type}
        </span>
      </div>
      <div className="sla-bar">
        <div className="sla-bar-track">
          <div className={`sla-bar-fill ${slaClass}`} style={{width: `${slaPct}%`}}/>
        </div>
        <span className={`sla-bar-label ${slaClass}`}>
          {isCompleted ? '—' : (slaDaysLeft < 0 ? `${Math.abs(slaDaysLeft)}d over` : `${slaDaysLeft}d left`)}
        </span>
      </div>
      <div className="mono" style={{fontSize: 11, color: 'var(--text-tertiary)'}}>{d.age}</div>
      <div>
        <StatusBadge status={d.status === 'pending' ? 'pending' : d.status === 'in_progress' ? 'running' : d.status === 'completed' ? 'success' : 'failed'}/>
      </div>
    </div>
  );
}

// =============== DSAR detail ===============
function DsarDetail({ d, activeTab, setActiveTab, onDeleteAction, onActionToast }) {
  const isCompleted = d.status === 'completed' || d.status === 'rejected';
  const slaDaysElapsed = Math.floor((NOW - d.createdAt) / DAY);
  const slaPct = Math.min(100, (slaDaysElapsed / d.slaDays) * 100);
  const slaClass = slaDaysElapsed > d.slaDays ? 'red' : slaDaysElapsed > d.slaDays - 5 ? 'amber' : 'green';
  const slaColor = slaClass === 'red' ? 'var(--status-failed)' : slaClass === 'amber' ? 'var(--status-paused)' : 'var(--status-success)';

  // Build timeline events based on status
  const events = [];
  events.push({ status:'done', title:'Request received', meta: `from ${d.user.email}`, ts: d.createdAt });
  if (d.triagedBy) events.push({ status:'done', title:'Triaged', meta: `assigned to ${d.assignedTo?.name || 'unassigned'}`, ts: d.createdAt + 3 * HR });
  if (d.status === 'in_progress' || isCompleted) {
    events.push({ status: isCompleted ? 'done' : 'running', title: `${d.type === 'delete' ? 'Deletion' : d.type === 'export' ? 'Export' : 'Rectification'} job ${isCompleted ? 'completed' : 'in progress'}`,
                  meta: d.exportEta || (isCompleted ? 'all rows processed' : '—'), ts: d.createdAt + 1.5 * DAY });
  }
  if (isCompleted) {
    events.push({ status:'done', title: d.status === 'completed' ? 'User notified · request completed' : 'Request rejected',
                  meta: d.rejectReason || `closed by ${d.assignedTo?.name}`, ts: d.completedAt || NOW });
  } else {
    events.push({ status:'future', title:'Notify user · close', meta:'pending completion', ts: null });
  }

  return (
    <>
      {/* Header */}
      <div style={{padding: '16px 18px', borderBottom: '1px solid var(--border)'}}>
        <div style={{display:'flex', alignItems:'center', gap: 14}}>
          <div className="avatar" style={{width: 40, height: 40, fontSize: 13, background:`linear-gradient(135deg, hsl(${d.user.name.length*47%360}, 60%, 50%), hsl(${d.user.email.length*23%360}, 60%, 40%))`}}>
            {initials(d.user.name)}
          </div>
          <div style={{flex: 1}}>
            <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 2}}>
              <b style={{fontSize: 15, fontWeight: 600}}>{d.user.name}</b>
              <span className="mono" style={{fontSize: 11, color:'var(--text-tertiary)'}}>{d.id}</span>
            </div>
            <div style={{fontSize: 12, color:'var(--text-secondary)'}}>
              {d.user.email} · <span className="mono">{d.user.tenant}</span>
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap: 6}}>
            <span className={`badge lg ${d.type === 'delete' ? 'failed' : d.type === 'export' ? 'running' : 'compensated'}`}>
              {d.type === 'delete' && <IC.Trash size={10}/>}
              {d.type === 'export' && <IC.Download size={10}/>}
              {d.type === 'rectify' && <IC.Edit size={10}/>}
              {d.type}
            </span>
            <StatusBadge status={d.status === 'pending' ? 'pending' : d.status === 'in_progress' ? 'running' : d.status === 'completed' ? 'success' : 'failed'}/>
          </div>
        </div>

        {/* SLA progress bar */}
        <div className="sla-progress">
          <div className="sla-progress-head">
            <span>GDPR Art. 12(3) SLA · 30-day target</span>
            <span style={{color: slaColor, fontFamily:'var(--font-mono)'}}>
              {slaDaysElapsed}/{d.slaDays} days · {slaPct.toFixed(0)}%
            </span>
          </div>
          <div className="sla-progress-bar">
            <div className="sla-progress-fill" style={{width: `${slaPct}%`, background: slaColor}}/>
          </div>
          <div className="sla-progress-foot">
            <span>{d.legalBasis}</span>
            <span>{isCompleted ? `Closed ${fmtRelativeFromNow(d.completedAt || NOW)} ago` : (slaDaysElapsed > d.slaDays ? <b style={{color:'var(--status-failed)'}}>SLA breached · escalate to DPO</b> : `${d.slaDays - slaDaysElapsed} days remaining`)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        {['timeline','scope', d.type === 'delete' ? 'cascade' : 'export', 'comments', 'audit'].map(t => (
          <div key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'timeline' && <I.Clock size={11}/>}
            {t === 'scope' && <IC.Folder size={11}/>}
            {t === 'export' && <IC.Download size={11}/>}
            {t === 'cascade' && <IC.Trash size={11}/>}
            {t === 'comments' && <IC.MessageSquare size={11}/>}
            {t === 'audit' && <I.Activity size={11}/>}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      <div className="detail-content split-detail-scroll">
        {activeTab === 'timeline' && (
          <div className="dsar-timeline">
            {events.map((e, i) => (
              <div key={i} className={`dsar-event ${e.status}`}>
                <div className="ev-title">{e.title}</div>
                <div className="ev-meta">
                  {e.ts ? fmtDateTime(e.ts) : 'pending'}
                  {e.meta && <> · {e.meta}</>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'scope' && (
          <div>
            <div className="section-title">Requested data scope</div>
            <div style={{display:'flex', flexDirection:'column', gap: 4, marginBottom: 16}}>
              {(d.scope || ['No scope data available']).map((s, i) => (
                <div key={i} style={{padding:'9px 12px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize: 12.5, fontFamily:'var(--font-mono)', display:'flex', alignItems:'center', gap: 8}}>
                  <IC.Database size={13} style={{color:'var(--text-tertiary)'}}/> {s}
                </div>
              ))}
            </div>
            <div className="section-title">Retention before deletion</div>
            <dl className="kv compact">
              <dt>Chat logs</dt><dd>90 days</dd>
              <dt>Conversations</dt><dd>365 days</dd>
              <dt>Connector audit</dt><dd>1,095 days (3y)</dd>
              <dt>Consent records</dt><dd>2,555 days (7y)</dd>
            </dl>
          </div>
        )}

        {activeTab === 'export' && (
          <div>
            <div className="section-title">Export job</div>
            {d.exportJobProgress != null ? (
              <div style={{padding:'14px 16px', background:'var(--bg-subtle)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom: 8}}>
                  <b style={{fontSize: 13}}>Generating ZIP archive…</b>
                  <span className="mono" style={{fontSize: 11.5, color:'var(--text-secondary)'}}>{d.exportEta}</span>
                </div>
                <div style={{height: 6, background:'var(--bg-active)', borderRadius: 3, overflow:'hidden'}}>
                  <div style={{height:'100%', width: `${d.exportJobProgress * 100}%`, background:'var(--brand)', transition:'width 240ms'}}/>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', marginTop: 8, fontSize: 11, color:'var(--text-tertiary)'}}>
                  <span className="mono">{(d.exportJobProgress * 100).toFixed(0)}% complete</span>
                  <span>ExportUserDataJob #4821</span>
                </div>
              </div>
            ) : (
              <div style={{padding:'18px 16px', background:'var(--bg-subtle)', border:'1px dashed var(--border-strong)', borderRadius:'var(--radius-sm)', textAlign:'center'}}>
                <button className="btn primary" onClick={() => onActionToast({title:'Export job dispatched', body:'ExportUserDataJob enqueued · ETA ~15 minutes'})}>
                  <IC.Download size={13}/> Generate export
                </button>
                <div style={{fontSize: 11.5, color:'var(--text-tertiary)', marginTop: 8}}>
                  Will produce <code className="mono" style={{fontSize: 11}}>dsar-export-{d.user.email.split('@')[0]}-{new Date(NOW).toISOString().slice(0,10)}.zip</code>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cascade' && d.cascade && (
          <div>
            <div className="alert-banner warning" style={{marginBottom: 14}}>
              <IC.AlertOctagon size={14} className="alert-icon" style={{color:'var(--sev-medium)'}}/>
              <div>
                <b>Cascade preview · atomic destructive action</b>
                <small style={{display:'block', color:'var(--text-secondary)', marginTop: 2}}>
                  Per R21 invariant: deletion fires in a single transaction. Total: <b style={{color:'var(--text)'}}>{d.cascade.reduce((a,c) => a + c.count, 0).toLocaleString()}</b> rows across {d.cascade.length} tables.
                </small>
              </div>
            </div>
            <div style={{border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', overflow:'hidden'}}>
              {d.cascade.map((c, i) => (
                <div key={i} className={`tree-row depth-${c.depth}`}>
                  <span>{c.depth > 0 ? '└─ ' : ''}<b>{c.label}</b></span>
                  <span className="num">{c.count.toLocaleString()} rows</span>
                </div>
              ))}
            </div>
            <button className="btn danger" style={{marginTop: 16, width:'100%'}} onClick={onDeleteAction}>
              <IC.Trash size={13}/> Confirm cascade delete
            </button>
            <p style={{margin: '8px 0 0', fontSize: 11.5, color:'var(--text-tertiary)', textAlign:'center'}}>
              Type confirmation required · audit trail entry will be created
            </p>
          </div>
        )}

        {activeTab === 'comments' && (
          <div>
            <div className="section-title">Internal notes</div>
            <div style={{display:'flex', flexDirection:'column', gap: 10, marginBottom: 16}}>
              <CommentBlock author={ADMINS[0]} text="Verified identity via signed email match against tenant directory. Proceed to triage." ts={d.createdAt + 3 * HR}/>
              {d.status === 'in_progress' && (
                <CommentBlock author={d.assignedTo} text="Started cascade dry-run. Confirmed 1,847 conversations under scope. Will execute Monday 09:00 UTC after change-window approval." ts={d.createdAt + 6 * HR}/>
              )}
            </div>
            <textarea className="input" rows={3} placeholder="Add a comment (internal — not visible to data subject)…" style={{resize:'vertical', minHeight: 60}}/>
            <div style={{display:'flex', justifyContent:'flex-end', marginTop: 8, gap: 8}}>
              <button className="btn primary"><IC.MessageSquare size={12}/> Post comment</button>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div>
            <div className="section-title">Audit trail (immutable)</div>
            <div className="audit-list" style={{border:'1px solid var(--border)', borderRadius:'var(--radius-sm)'}}>
              {[
                { icon:'Inbox', title:'Request created', actor:'public-form', ts: d.createdAt },
                { icon:'CheckCircle', title:'Identity verified', actor: 'system', ts: d.createdAt + 1 * HR },
                d.triagedBy && { icon:'UserCheck', title:`Assigned to ${d.assignedTo?.name}`, actor: d.triagedBy.name, ts: d.createdAt + 3 * HR },
                d.exportJobProgress && { icon:'Download', title:'ExportUserDataJob dispatched', actor:'system', ts: d.createdAt + 12 * HR },
                d.status === 'completed' && { icon:'CheckCircle', title:'Request completed · user notified', actor: d.assignedTo?.name || 'system', ts: d.completedAt },
                d.status === 'rejected' && { icon:'AlertOctagon', title:`Rejected: ${d.rejectReason}`, actor: d.assignedTo?.name, ts: d.completedAt || NOW },
              ].filter(Boolean).reverse().map((a, i) => {
                const Ic = IC[a.icon] || I[a.icon];
                return (
                  <div key={i} className="audit-item">
                    <Ic className="audit-icon" size={14}/>
                    <div className="audit-event">
                      <b>{a.title}</b>
                      <small>{a.actor}</small>
                    </div>
                    <time>{fmtDateTime(a.ts)}</time>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action row */}
      {!isCompleted && (
        <div style={{padding: '12px 18px', borderTop: '1px solid var(--border)', display:'flex', gap: 8, justifyContent:'flex-end', background:'var(--bg-subtle)'}}>
          <button className="btn" onClick={() => onActionToast({title:'DSAR rejected', kind:'warn'})}><I.X size={12}/> Reject</button>
          {d.status === 'pending' && <button className="btn" onClick={() => onActionToast({title:'Marked in progress'})}><IC.Workflow size={12}/> Triage</button>}
          {d.type === 'delete' && <button className="btn danger" onClick={onDeleteAction}><IC.Trash size={12}/> Execute delete</button>}
          {d.type === 'export' && <button className="btn primary" onClick={() => onActionToast({title:'Marked completed', body:'User notified · ZIP delivered'})}><I.Check size={12}/> Mark completed</button>}
          {d.type === 'rectify' && <button className="btn primary" onClick={() => onActionToast({title:'Rectification applied'})}><IC.Edit size={12}/> Apply rectification</button>}
        </div>
      )}
    </>
  );
}

function CommentBlock({ author, text, ts }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'24px 1fr', gap: 10, padding:'10px 12px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)'}}>
      <div className="avatar xs" style={{background:`linear-gradient(135deg, ${author.color}, #4338ca)`}}>{author.initials}</div>
      <div>
        <div style={{display:'flex', alignItems:'baseline', gap: 8, marginBottom: 4}}>
          <b style={{fontSize: 12.5}}>{author.name}</b>
          <span style={{fontSize: 10.5, color:'var(--text-tertiary)', fontFamily:'var(--font-mono)'}}>{fmtRelativeFromNow(ts)} ago</span>
        </div>
        <div style={{fontSize: 12.5, color:'var(--text-secondary)', lineHeight: 1.5}}>{text}</div>
      </div>
    </div>
  );
}

Object.assign(window, { DsarScreen });
