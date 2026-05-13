// ============== Screen 5 — Incident Manager (Kanban + DnD) ==============

const COLS = [
  { key: 'open',       label: 'OPEN' },
  { key: 'triage',     label: 'TRIAGE' },
  { key: 'mitigating', label: 'MITIGATING' },
  { key: 'closed',     label: 'CLOSED' },
];

// state machine — valid transitions
const VALID_TRANSITIONS = {
  open:       ['triage', 'closed'],
  triage:     ['open', 'mitigating', 'closed'],
  mitigating: ['triage', 'closed'],
  closed:     ['mitigating'], // reopen with reason
};

function IncidentsScreen({ navigate, jump, consumeJump }) {
  const [incidents, setIncidents] = React.useState(INCIDENTS);
  const [selected, setSelected] = React.useState(null);
  const [dragging, setDragging] = React.useState(null);
  const [hoverCol, setHoverCol] = React.useState(null);
  const [tab, setTab] = React.useState('overview');
  const toast = useToast();

  React.useEffect(() => {
    const j = consumeJump?.();
    if (j?.type === 'openIncident') {
      const i = INCIDENTS.find(x => x.id === j.id);
      if (i) { setSelected(i); setTab('overview'); }
    }
  }, [jump]);

  const criticalOpen = incidents.filter(i => i.severity === 'critical' && i.status !== 'closed');

  const onDragStart = (incidentId) => setDragging(incidentId);
  const onDragEnd = () => { setDragging(null); setHoverCol(null); };

  const onDrop = (toStatus) => {
    if (!dragging) return;
    const inc = incidents.find(i => i.id === dragging);
    if (!inc) return;
    if (!VALID_TRANSITIONS[inc.status]?.includes(toStatus) && inc.status !== toStatus) {
      toast.push({
        title: 'Invalid state transition',
        body: `Cannot move incident from ${inc.status.toUpperCase()} to ${toStatus.toUpperCase()}. Allowed: ${VALID_TRANSITIONS[inc.status]?.join(', ') || 'none'}`,
        kind: 'error'
      });
      setDragging(null); setHoverCol(null);
      return;
    }
    if (inc.status === toStatus) { setDragging(null); setHoverCol(null); return; }
    setIncidents(prev => prev.map(i => i.id === dragging ? {...i, status: toStatus, updatedAt: NOW} : i));
    toast.push({title: `Moved to ${toStatus}`, body: inc.title});
    setDragging(null); setHoverCol(null);
  };

  return (
    <div className="page" data-screen-label="Incident Manager" style={{maxWidth: 'none'}}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Incident Manager</h1>
          <p className="page-sub">
            State-machine enforced workflow · <span className="art-chip">AI Act Art. 72</span> <span className="art-chip">Art. 73</span> 15-day reporting window
          </p>
        </div>
        <div className="page-actions">
          <button className="btn"><IC.Webhook size={13}/> Escalation routing</button>
          <button className="btn primary" onClick={() => toast.push({title:'New incident form opened'})}>
            <I.Plus size={13}/> New incident
          </button>
        </div>
      </div>

      {criticalOpen.length > 0 && (
        <div className="alert-banner critical">
          <IC.AlertOctagon size={16} className="alert-icon" style={{color:'var(--sev-critical)'}}/>
          <div>
            <b>{criticalOpen.length} critical incident{criticalOpen.length > 1 ? 's' : ''} open</b>
            <small style={{display:'block', color:'var(--text-secondary)', marginTop:2}}>
              {criticalOpen[0].title}
            </small>
          </div>
          <div className="spacer"/>
          <button className="btn sm" onClick={() => setSelected(criticalOpen[0])}>
            View now <I.ArrowRight size={12}/>
          </button>
        </div>
      )}

      {/* Kanban */}
      <div className="kanban">
        {COLS.map(col => {
          const colIncidents = incidents.filter(i => i.status === col.key);
          const isHover = hoverCol === col.key;
          const draggingInc = incidents.find(i => i.id === dragging);
          const isInvalid = draggingInc && !VALID_TRANSITIONS[draggingInc.status]?.includes(col.key) && draggingInc.status !== col.key;
          return (
            <div key={col.key} className={`kanban-col ${isHover && !isInvalid ? 'drop-target' : ''} ${isHover && isInvalid ? 'drop-invalid' : ''}`}
                 data-col={col.key}
                 onDragOver={(e) => { e.preventDefault(); setHoverCol(col.key); }}
                 onDragLeave={() => setHoverCol(h => h === col.key ? null : h)}
                 onDrop={() => onDrop(col.key)}>
              <div className="kanban-col-head">
                <span className="col-dot"/>
                <span className="kanban-col-title">{col.label}</span>
                <span className="kanban-col-count">{colIncidents.length}</span>
                <span style={{flex:1}}/>
                <button className="iconbtn"><IC.MoreHorizontal size={14}/></button>
              </div>
              <div className="kanban-col-list">
                {colIncidents.length === 0 && (
                  <div style={{padding:'24px 8px', textAlign:'center', color:'var(--text-tertiary)', fontSize: 12}}>
                    No incidents
                  </div>
                )}
                {colIncidents.map(inc => (
                  <IncCard key={inc.id} inc={inc}
                           onClick={() => { setSelected(inc); setTab('overview'); }}
                           dragging={dragging === inc.id}
                           onDragStart={() => onDragStart(inc.id)}
                           onDragEnd={onDragEnd}/>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Drawer open={!!selected} onClose={() => setSelected(null)}
              title={selected ? <>Incident · <span className="mono" style={{fontSize:12, color:'var(--text-secondary)'}}>{selected.id}</span></> : ''}>
        {selected && <IncidentDetail inc={selected} tab={tab} setTab={setTab}/>}
      </Drawer>
    </div>
  );
}

// =============== Incident card ===============
function IncCard({ inc, onClick, dragging, onDragStart, onDragEnd }) {
  const assignee = ADMINS.find(a => a.id === inc.assignee);
  return (
    <div className={`inc-card sev-${inc.severity} ${dragging ? 'dragging' : ''}`}
         draggable onDragStart={onDragStart} onDragEnd={onDragEnd}
         onClick={onClick}>
      <div className="inc-card-id">{inc.id}</div>
      <div className="inc-card-title">{inc.title}</div>
      <div className="inc-card-meta">
        <span className={`badge sev-${inc.severity}`} style={{padding:'1px 6px', fontSize: 10}}>
          {inc.severity === 'critical' && <IC.AlertOctagon size={9}/>}
          {inc.severity}
        </span>
        <span className="spacer"/>
        {inc.affectedUsers > 0 && (
          <span className="users" title="Affected users">
            <IC.Users size={10}/> {inc.affectedUsers.toLocaleString()}
          </span>
        )}
        {inc.linkedDsar && <IC.Inbox size={10} title={`linked: ${inc.linkedDsar}`}/>}
        {assignee && (
          <div className="avatar xs" style={{background:`linear-gradient(135deg, ${assignee.color}, #4338ca)`}} title={assignee.name}>
            {assignee.initials}
          </div>
        )}
      </div>
      <div style={{marginTop: 6, fontSize: 10.5, color:'var(--text-tertiary)', fontFamily:'var(--font-mono)'}}>
        {fmtRelativeFromNow(inc.updatedAt)} ago
      </div>
    </div>
  );
}

// =============== Incident detail (drawer) ===============
function IncidentDetail({ inc, tab, setTab }) {
  const assignee = ADMINS.find(a => a.id === inc.assignee);
  const toast = useToast();

  return (
    <div>
      {/* Header */}
      <div style={{padding: '14px 18px', borderBottom: '1px solid var(--border)'}}>
        <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 8}}>
          <span className={`badge lg sev-${inc.severity}`}>
            {inc.severity === 'critical' && <IC.AlertOctagon size={11}/>}
            {inc.severity} severity
          </span>
          <span className={`badge ${inc.status === 'closed' ? 'success' : inc.status === 'mitigating' ? 'running' : inc.status === 'triage' ? 'paused' : 'failed'}`}>
            <span className="dot"/>{inc.status}
          </span>
        </div>
        <h2 style={{fontSize: 15, fontWeight: 600, margin:'0 0 8px', letterSpacing:'-0.01em', lineHeight: 1.35}}>{inc.title}</h2>
        <div style={{display:'flex', alignItems:'center', gap: 14, fontSize: 12, color:'var(--text-secondary)'}}>
          <span><IC.Users size={11} style={{verticalAlign:'middle', marginRight: 3}}/> {inc.affectedUsers.toLocaleString()} affected</span>
          <span><IC.Clock size={11} style={{verticalAlign:'middle', marginRight: 3}}/> {fmtRelativeFromNow(inc.createdAt)} ago</span>
          {inc.linkedRisks?.length > 0 && <span><IC.Link size={11} style={{verticalAlign:'middle', marginRight: 3}}/> {inc.linkedRisks.length} risk</span>}
        </div>
      </div>

      <div className="detail-tabs" style={{padding:'0 12px'}}>
        {['overview','timeline','escalation','affected','mitigation','postmortem','related'].map(t => (
          <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{padding:'8px 10px', fontSize: 11.5}}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      <div style={{padding: 18}}>
        {tab === 'overview' && <OverviewTab inc={inc} assignee={assignee}/>}
        {tab === 'timeline' && <TimelineTab inc={inc}/>}
        {tab === 'escalation' && <EscalationTab inc={inc}/>}
        {tab === 'affected' && <AffectedTab inc={inc}/>}
        {tab === 'mitigation' && <MitigationTab inc={inc}/>}
        {tab === 'postmortem' && <PostmortemTab inc={inc}/>}
        {tab === 'related' && <RelatedTab inc={inc}/>}
      </div>

      {/* Action footer */}
      <div style={{padding: '12px 18px', borderTop: '1px solid var(--border)', display:'flex', gap: 8, background:'var(--bg-subtle)'}}>
        {inc.status !== 'closed' && (
          <>
            <button className="btn" onClick={() => toast.push({title:'Assignment dialog opened'})}><IC.UserCheck size={12}/> Reassign</button>
            <button className="btn" onClick={() => toast.push({title:'Escalated to DPO', kind:'warn'})}><IC.Flag size={12}/> Escalate</button>
          </>
        )}
        <div style={{flex:1}}/>
        {inc.status === 'open' && <button className="btn primary" onClick={() => toast.push({title:'Moved to triage'})}><IC.CornerDownRight size={12}/> Move to triage</button>}
        {inc.status === 'triage' && <button className="btn primary" onClick={() => toast.push({title:'Mitigation started'})}><IC.Zap size={12}/> Start mitigation</button>}
        {inc.status === 'mitigating' && <button className="btn primary" onClick={() => toast.push({title:'Incident closed'})}><I.Check size={12}/> Close incident</button>}
        {inc.status === 'closed' && <button className="btn" onClick={() => toast.push({title:'Reopen requires reason'})}><IC.RotateCcw size={12}/> Reopen</button>}
      </div>
    </div>
  );
}

function OverviewTab({ inc, assignee }) {
  const reporter = inc.reporter === 'system' ? { name: 'system', email: 'system@askmydocs', color: '#94a3b8', initials: 'SY' } : ADMINS.find(a => a.email === inc.reporter) || { name: inc.reporter, email: inc.reporter, color: '#94a3b8', initials: inc.reporter.slice(0, 2).toUpperCase() };
  return (
    <div>
      <p style={{fontSize: 13, color:'var(--text-secondary)', lineHeight: 1.6, margin:'0 0 16px'}}>{inc.description}</p>

      <div className="section-title">Metadata</div>
      <dl className="kv compact" style={{marginBottom: 16}}>
        <dt>Incident ID</dt><dd>{inc.id}</dd>
        <dt>Assignee</dt><dd>
          <div style={{display:'inline-flex', alignItems:'center', gap: 6, fontFamily:'var(--font-sans)'}}>
            <div className="avatar xs" style={{background:`linear-gradient(135deg, ${assignee.color}, #4338ca)`}}>{assignee.initials}</div>
            {assignee.name} · <span style={{color:'var(--text-tertiary)'}}>{assignee.role}</span>
          </div>
        </dd>
        <dt>Reporter</dt><dd>
          <div style={{display:'inline-flex', alignItems:'center', gap: 6, fontFamily:'var(--font-sans)'}}>
            <div className="avatar xs" style={{background:`linear-gradient(135deg, ${reporter.color || '#64748b'}, #4338ca)`}}>{reporter.initials}</div>
            {reporter.name}
          </div>
        </dd>
        <dt>Created</dt><dd>{fmtDateTime(inc.createdAt).slice(0, 16)}</dd>
        <dt>Updated</dt><dd>{fmtDateTime(inc.updatedAt).slice(0, 16)} <span style={{color:'var(--text-tertiary)', fontFamily:'var(--font-sans)'}}>({fmtRelativeFromNow(inc.updatedAt)} ago)</span></dd>
        <dt>Affected users</dt><dd>{inc.affectedUsers.toLocaleString()}</dd>
        {inc.linkedDsar && <><dt>Linked DSAR</dt><dd>{inc.linkedDsar}</dd></>}
      </dl>

      <div className="section-title">Tags</div>
      <div style={{display:'flex', gap: 4, flexWrap:'wrap'}}>
        {inc.tags.map((t, i) => (
          <span key={i} className={`art-chip ${t.startsWith('art-') ? '' : 'gdpr'}`} style={{cursor:'default'}}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function TimelineTab({ inc }) {
  const evs = [
    { kind:'done', title:'Reported', meta: inc.reporter === 'system' ? 'auto-detected by eval-harness' : `by ${inc.reporter}`, ts: inc.createdAt },
    { kind:'done', title:'Triaged', meta: `severity assessed: ${inc.severity}`, ts: inc.createdAt + 8 * 60_000 },
    inc.status !== 'open' && { kind:'done', title:'Assigned', meta: `to ${ADMINS.find(a => a.id === inc.assignee)?.name}`, ts: inc.createdAt + 22 * 60_000 },
    (inc.status === 'mitigating' || inc.status === 'closed') && { kind:'done', title:'Mitigation started', meta: 'first action logged', ts: inc.createdAt + 1.4 * HR },
    inc.status === 'mitigating' && { kind:'running', title:'Mitigation in progress', meta: '2 actions taken · awaiting verification', ts: inc.updatedAt },
    inc.status === 'closed' && { kind:'done', title:'Closed', meta: 'post-mortem signed', ts: inc.updatedAt },
    inc.status !== 'closed' && { kind:'future', title:'Close incident', meta: 'pending mitigation verification', ts: null },
  ].filter(Boolean);

  return (
    <div className="dsar-timeline">
      {evs.map((e, i) => (
        <div key={i} className={`dsar-event ${e.kind}`}>
          <div className="ev-title">{e.title}</div>
          <div className="ev-meta">{e.ts ? fmtDateTime(e.ts) : 'pending'}{e.meta && <> · {e.meta}</>}</div>
        </div>
      ))}
    </div>
  );
}

function EscalationTab({ inc }) {
  return (
    <div>
      <div className="section-title">Escalation routing</div>
      <p style={{fontSize: 12, color:'var(--text-secondary)', margin:'0 0 12px'}}>
        Notification fanout based on severity. Configurable in Settings → Notifications.
      </p>
      <EscalationTree severity={inc.severity}/>
    </div>
  );
}

function EscalationTree({ severity }) {
  const levels = [
    { sev:'critical', label:'Critical', actors: ['DPO', 'CISO', 'On-call', 'Tenant admin'], reach: 'PagerDuty + SMS + Email' },
    { sev:'high',     label:'High',     actors: ['DPO', 'On-call', 'Tenant admin'],         reach: 'Email + Slack' },
    { sev:'medium',   label:'Medium',   actors: ['On-call', 'Tenant admin'],                reach: 'Email' },
    { sev:'low',      label:'Low',      actors: ['On-call'],                                reach: 'Slack channel' },
  ];
  return (
    <div style={{display:'flex', flexDirection:'column', gap: 8}}>
      {levels.map(l => (
        <div key={l.sev} style={{
          padding:'10px 14px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)',
          background: l.sev === severity ? 'var(--brand-bg)' : 'var(--bg-elevated)',
          borderColor: l.sev === severity ? 'var(--brand)' : 'var(--border)',
        }}>
          <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 4}}>
            <span className={`badge sev-${l.sev}`}><span className="dot"/>{l.label}</span>
            {l.sev === severity && <span style={{fontSize: 10.5, color:'var(--brand)', fontWeight: 600}}>← current</span>}
            <span style={{flex: 1}}/>
            <span className="mono" style={{fontSize: 10.5, color:'var(--text-tertiary)'}}>{l.reach}</span>
          </div>
          <div style={{display:'flex', gap: 4, flexWrap:'wrap'}}>
            {l.actors.map((a, i) => <span key={i} className="badge outline" style={{fontSize: 10.5}}>{a}</span>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function AffectedTab({ inc }) {
  if (inc.affectedUsers === 0) {
    return <EmptyState art="Folder" title="No users affected" body="This incident had no end-user impact."/>;
  }
  // Synthesise a sample list
  const sample = DSAR_USERS.slice(0, Math.min(6, inc.affectedUsers));
  return (
    <div>
      <div className="section-title">Sample of affected users (first 6 of {inc.affectedUsers.toLocaleString()})</div>
      <div style={{border:'1px solid var(--border)', borderRadius:'var(--radius-sm)'}}>
        {sample.map((u, i) => (
          <div key={i} style={{
            display:'grid', gridTemplateColumns:'24px 1fr auto', gap: 10, padding:'9px 12px',
            borderBottom: i < sample.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 12.5, alignItems:'center'
          }}>
            <div className="avatar xs" style={{background:`linear-gradient(135deg, hsl(${u.name.length*47%360}, 60%, 50%), hsl(${u.email.length*23%360}, 60%, 40%))`}}>{initials(u.name)}</div>
            <div>
              <b style={{fontWeight: 500}}>{u.name}</b>
              <span style={{color:'var(--text-tertiary)', marginLeft: 8, fontFamily:'var(--font-mono)', fontSize: 11}}>{u.email}</span>
            </div>
            <button className="btn sm ghost"><IC.Inbox size={11}/> DSAR</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MitigationTab({ inc }) {
  const entries = inc.status === 'closed' ? [
    { ts: inc.updatedAt, actor: 'u-dpo', text: 'Post-mortem signed. Closing.', outcome: 'effective' },
    { ts: inc.createdAt + 4 * HR, actor: inc.assignee, text: 'Variant rolled back; affected users emailed with corrected disclosure.', outcome: 'effective' },
    { ts: inc.createdAt + 2 * HR, actor: inc.assignee, text: 'Identified root cause: A/B test flag suppressing disclosure banner.', outcome: 'in_progress' },
  ] : (inc.status === 'mitigating' ? [
    { ts: inc.updatedAt, actor: inc.assignee, text: 'Quarantined affected dataset; began re-redaction pass.', outcome: 'in_progress' },
  ] : []);

  return (
    <div>
      <div className="section-title">Mitigation log (append-only)</div>
      <div style={{display:'flex', flexDirection:'column', gap: 8, marginBottom: 14}}>
        {entries.length === 0 ? (
          <div className="empty" style={{padding: 16}}>No mitigation entries yet</div>
        ) : entries.map((e, i) => {
          const actor = ADMINS.find(a => a.id === e.actor);
          return (
            <div key={i} style={{padding:'10px 12px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)'}}>
              <div style={{display:'flex', alignItems:'baseline', gap: 8, marginBottom: 6}}>
                <b style={{fontSize: 12}}>{actor?.name || e.actor}</b>
                <span className={`badge ${e.outcome === 'effective' ? 'success' : 'paused'}`} style={{fontSize: 10}}>
                  <span className="dot"/>{e.outcome}
                </span>
                <span style={{flex: 1}}/>
                <span className="mono" style={{fontSize: 11, color:'var(--text-tertiary)'}}>{fmtDateTime(e.ts).slice(0, 16)}</span>
              </div>
              <p style={{margin: 0, fontSize: 12.5, color:'var(--text-secondary)', lineHeight: 1.5}}>{e.text}</p>
            </div>
          );
        })}
      </div>
      {inc.status !== 'closed' && (
        <>
          <textarea className="input" rows={2} placeholder="Add a mitigation entry…" style={{resize:'vertical'}}/>
          <div style={{display:'flex', gap: 8, marginTop: 8, justifyContent:'flex-end'}}>
            <button className="btn primary"><I.Plus size={12}/> Add entry</button>
          </div>
        </>
      )}
    </div>
  );
}

function PostmortemTab({ inc }) {
  if (inc.status !== 'closed') {
    return (
      <EmptyState art="FileText" title="Post-mortem unlocks at closure"
                  body={`Once the incident moves to CLOSED, a templated post-mortem (What happened / Impact / Root cause / Mitigation / Lessons learned) will be available for completion.`}/>
    );
  }
  return (
    <div>
      <div className="section-title">Post-mortem</div>
      <div style={{background:'var(--bg-subtle)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'14px 16px', fontSize: 12.5, lineHeight: 1.6, fontFamily:'var(--font-mono)'}}>
        <b style={{fontFamily: 'var(--font-sans)', fontSize: 13}}>Post-mortem · {inc.id}</b>
        <div style={{marginTop: 10, color:'var(--text-secondary)'}}>
          <p style={{margin:'8px 0 4px', fontFamily:'var(--font-sans)', fontWeight: 500, color:'var(--text)'}}># What happened</p>
          <p style={{margin:'0 0 8px'}}>{inc.description}</p>

          <p style={{margin:'8px 0 4px', fontFamily:'var(--font-sans)', fontWeight: 500, color:'var(--text)'}}># Impact</p>
          <p style={{margin:'0 0 8px'}}>{inc.affectedUsers.toLocaleString()} users affected. {inc.linkedRisks?.length ? `Linked to risks: ${inc.linkedRisks.join(', ')}.` : 'No regulatory reporting required.'}</p>

          <p style={{margin:'8px 0 4px', fontFamily:'var(--font-sans)', fontWeight: 500, color:'var(--text)'}}># Root cause</p>
          <p style={{margin:'0 0 8px'}}>Identified through audit log analysis. Fix verified in staging before production rollback.</p>

          <p style={{margin:'8px 0 4px', fontFamily:'var(--font-sans)', fontWeight: 500, color:'var(--text)'}}># Mitigation</p>
          <p style={{margin:'0 0 8px'}}>Variant rolled back. Affected users notified. Audit log preserved for 1095 days per retention policy.</p>

          <p style={{margin:'8px 0 4px', fontFamily:'var(--font-sans)', fontWeight: 500, color:'var(--text)'}}># Lessons learned</p>
          <p style={{margin:'0 0 4px'}}>1. A/B test framework needs disclosure-affecting variants gated by DPO sign-off.</p>
          <p style={{margin:'0 0 8px'}}>2. Add regression test to assert disclosure banner presence in CI.</p>
        </div>
      </div>
      <div style={{display:'flex', gap: 8, marginTop: 12, justifyContent:'flex-end'}}>
        <button className="btn"><IC.FileDown size={12}/> Export PDF</button>
        <button className="btn primary"><IC.Stamp size={12}/> Sign off</button>
      </div>
    </div>
  );
}

function RelatedTab({ inc }) {
  const linked = (inc.linkedRisks || []).map(rId => RISKS.find(r => r.id === rId)).filter(Boolean);
  return (
    <div>
      <div className="section-title">Linked risks</div>
      {linked.length === 0 ? (
        <EmptyState art="Shield" title="No linked risks" body="Link this incident to risks in the Risk Register for traceability."/>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap: 8}}>
          {linked.map(r => (
            <div key={r.id} style={{padding:'10px 12px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)'}}>
              <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 4}}>
                <span className={`badge risk-${r.category}`}><span className="dot"/>{r.category}</span>
                <b style={{fontSize: 12.5}}>{r.id}</b>
                <span style={{flex:1}}/>
                <button className="btn sm ghost">View <I.ArrowRight size={11}/></button>
              </div>
              <div style={{fontSize: 12.5, color:'var(--text-secondary)'}}>{r.name}</div>
            </div>
          ))}
        </div>
      )}

      <div className="section-title" style={{marginTop: 16}}>Suggested links</div>
      <div style={{padding: '10px 12px', border:'1px dashed var(--border-strong)', borderRadius:'var(--radius-sm)', fontSize: 12.5, color:'var(--text-tertiary)', textAlign:'center'}}>
        AI-suggested links based on tag overlap · 0 suggestions matching {inc.tags.length} tags
      </div>
    </div>
  );
}

Object.assign(window, { IncidentsScreen });
