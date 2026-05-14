// ============== Screen 4 — Risk Register Browser ==============

function RisksScreen({ navigate, jump, consumeJump }) {
  const [categoryFilter, setCategoryFilter] = React.useState(new Set(['low','limited','high','unacceptable']));
  const [statusFilter, setStatusFilter] = React.useState(new Set(['open','in_progress','closed']));
  const [ownerFilter, setOwnerFilter] = React.useState(new Set(ADMINS.map(a => a.id)));
  const [search, setSearch] = React.useState('');
  const [selectedRisk, setSelectedRisk] = React.useState(null);
  const [newOpen, setNewOpen] = React.useState(false);

  React.useEffect(() => {
    const j = consumeJump?.();
    if (j?.type === 'openRisk') setSelectedRisk(j.id);
    else if (j?.type === 'newRisk') setNewOpen(true);
  }, [jump]);

  const filtered = RISKS.filter(r =>
    categoryFilter.has(r.category) &&
    statusFilter.has(r.status) &&
    ownerFilter.has(r.owner) &&
    (search === '' || r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()) || r.articles.join(' ').toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSet = (set, key) => {
    const n = new Set(set);
    if (n.has(key)) n.delete(key); else n.add(key);
    return n;
  };

  const catCounts = ['low','limited','high','unacceptable'].reduce((a, c) => ({...a, [c]: RISKS.filter(r => r.category === c).length}), {});
  const statusCounts = ['open','in_progress','closed'].reduce((a, c) => ({...a, [c]: RISKS.filter(r => r.status === c).length}), {});

  const current = RISKS.find(r => r.id === selectedRisk);

  return (
    <div className="page" data-screen-label="Risk Register" style={{maxWidth: 'none'}}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Risk Register</h1>
          <p className="page-sub">
            {RISKS.length} risks tracked across <span className="art-chip">AI Act Title III</span> categorisation · regulatory due-diligence
          </p>
        </div>
        <div className="page-actions">
          <input className="input" placeholder="Search by name, ID, or article…" style={{width: 280}}
                 value={search} onChange={e => setSearch(e.target.value)}/>
          <button className="btn primary" onClick={() => setNewOpen(true)}><I.Plus size={13}/> New risk</button>
        </div>
      </div>

      <div className="risk-layout">
        {/* Filter sidebar */}
        <div className="risk-filters">
          <h4>Category</h4>
          {[
            {k:'unacceptable', l:'Unacceptable risk', c:'var(--risk-unacceptable)'},
            {k:'high',         l:'High risk',          c:'var(--risk-high)'},
            {k:'limited',      l:'Limited risk',       c:'var(--risk-limited)'},
            {k:'low',          l:'Low risk',           c:'var(--risk-low)'},
          ].map(({k, l, c}) => (
            <label key={k} className="filter-check">
              <input type="checkbox" checked={categoryFilter.has(k)}
                     onChange={() => setCategoryFilter(toggleSet(categoryFilter, k))}/>
              <span style={{width: 8, height: 8, borderRadius: 50, background: c}}/>
              <span>{l}</span>
              <span className="count">{catCounts[k]}</span>
            </label>
          ))}

          <h4>Status</h4>
          {['open','in_progress','closed'].map(s => (
            <label key={s} className="filter-check">
              <input type="checkbox" checked={statusFilter.has(s)}
                     onChange={() => setStatusFilter(toggleSet(statusFilter, s))}/>
              <span>{s.replace('_',' ')}</span>
              <span className="count">{statusCounts[s]}</span>
            </label>
          ))}

          <h4>Owner</h4>
          {ADMINS.map(a => (
            <label key={a.id} className="filter-check">
              <input type="checkbox" checked={ownerFilter.has(a.id)}
                     onChange={() => setOwnerFilter(toggleSet(ownerFilter, a.id))}/>
              <div className="avatar xs" style={{background:`linear-gradient(135deg, ${a.color}, #4338ca)`}}>{a.initials}</div>
              <span>{a.name.split(' ')[0]}</span>
              <span className="count">{RISKS.filter(r => r.owner === a.id).length}</span>
            </label>
          ))}

          <button className="btn ghost sm" style={{width:'100%', marginTop: 12}}
                  onClick={() => {
                    setCategoryFilter(new Set(['low','limited','high','unacceptable']));
                    setStatusFilter(new Set(['open','in_progress','closed']));
                    setOwnerFilter(new Set(ADMINS.map(a => a.id)));
                    setSearch('');
                  }}>Clear filters</button>
        </div>

        {/* Card grid */}
        <div>
          {filtered.length === 0 ? (
            <div className="card" style={{padding: 0}}>
              <EmptyState art="Shield" title="No risks match filters" body="Adjust the filters in the left sidebar or add a new risk."
                          cta={{label:'Add a risk', onClick:() => setNewOpen(true)}} ctaIcon={<I.Plus size={13}/>}/>
            </div>
          ) : (
            <div className="risk-grid">
              {filtered.map(r => (
                <RiskCard key={r.id} risk={r} onClick={() => setSelectedRisk(r.id)}/>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Risk detail drawer */}
      <Drawer open={!!current} onClose={() => setSelectedRisk(null)}
              title={current ? <>Risk · <span className="mono" style={{fontSize:12, color:'var(--text-secondary)'}}>{current.id}</span></> : ''}>
        {current && <RiskDetail risk={current}/>}
      </Drawer>

      {/* New risk modal */}
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="New risk"
             sub="Inventory a newly identified AI risk · audit trail entry created"
             footer={<>
               <button className="btn" onClick={() => setNewOpen(false)}>Cancel</button>
               <button className="btn primary" onClick={() => setNewOpen(false)}><I.Check size={13}/> Create risk</button>
             </>}>
        <div style={{display:'flex', flexDirection:'column', gap: 12}}>
          <div>
            <label style={{fontSize: 11, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600}}>Name</label>
            <input className="input" placeholder="e.g. Insufficient data minimization for chat embeddings" style={{marginTop: 4}}/>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12}}>
            <div>
              <label style={{fontSize: 11, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600}}>Category</label>
              <select className="select" style={{marginTop: 4}}>
                <option>Unacceptable</option><option>High</option><option selected>Limited</option><option>Low</option>
              </select>
            </div>
            <div>
              <label style={{fontSize: 11, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600}}>Owner</label>
              <select className="select" style={{marginTop: 4}}>
                {ADMINS.map(a => <option key={a.id} value={a.id}>{a.name} · {a.role}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{fontSize: 11, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600}}>AI Act articles</label>
            <input className="input" placeholder="Art. 9, Art. 10(3), Annex IV…" style={{marginTop: 4}}/>
          </div>
          <div>
            <label style={{fontSize: 11, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600}}>Description</label>
            <textarea className="input" rows={4} placeholder="Describe the risk, its impact, and current state…" style={{marginTop: 4, resize:'vertical'}}/>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function RiskCard({ risk, onClick }) {
  const owner = ADMINS.find(a => a.id === risk.owner);
  const statusBadge = risk.status === 'open' ? 'failed' : risk.status === 'in_progress' ? 'running' : 'success';
  return (
    <div className={`risk-card cat-${risk.category}`} onClick={onClick}>
      <div className="risk-card-head">
        <span className={`badge risk-${risk.category}`}><span className="dot"/>{risk.category}</span>
        <span style={{flex: 1}}/>
        <span className={`badge ${statusBadge}`} style={{fontSize: 10}}><span className="dot"/>{risk.status === 'in_progress' ? 'mitigating' : risk.status}</span>
      </div>
      <h3>{risk.name}</h3>
      <p>{risk.description}</p>
      <div className="arts">
        {risk.articles.slice(0, 3).map((a, i) => (
          <span key={i} className={`art-chip ${a.startsWith('GDPR') ? 'gdpr' : ''}`}>{a}</span>
        ))}
        {risk.articles.length > 3 && <span className="art-chip">+{risk.articles.length - 3}</span>}
      </div>
      <div className="risk-card-foot">
        <div className="avatar xs" style={{background:`linear-gradient(135deg, ${owner.color}, #4338ca)`}}>{owner.initials}</div>
        <span style={{fontFamily:'var(--font-mono)', fontSize: 10.5}}>{owner.name.split(' ').map(p => p[0]).join('.')}</span>
        <div className="spacer"/>
        {risk.linkedIncidents > 0 && <span title="Linked incidents" style={{color:'var(--status-failed)'}}><IC.AlertOctagon size={11} style={{verticalAlign:'middle'}}/> {risk.linkedIncidents}</span>}
        <span className="mono" style={{fontSize: 10.5}}>{fmtRelativeFromNow(risk.lastReview)} ago</span>
      </div>
    </div>
  );
}

function RiskDetail({ risk }) {
  const owner = ADMINS.find(a => a.id === risk.owner);
  const toast = useToast();
  return (
    <div style={{padding: 18}}>
      {/* Header strip */}
      <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 12}}>
        <span className={`badge lg risk-${risk.category}`}><span className="dot"/>{risk.category} risk</span>
        <span className={`badge lg ${risk.status === 'open' ? 'failed' : risk.status === 'in_progress' ? 'running' : 'success'}`}><span className="dot"/>{risk.status === 'in_progress' ? 'mitigating' : risk.status}</span>
        <div style={{flex:1}}/>
        <button className="btn sm"><IC.Edit size={12}/> Edit</button>
      </div>
      <h2 style={{fontSize: 18, fontWeight: 600, margin:'0 0 8px', letterSpacing:'-0.02em', lineHeight: 1.3}}>{risk.name}</h2>
      <p style={{fontSize: 13, color:'var(--text-secondary)', lineHeight: 1.6, margin:'0 0 16px'}}>{risk.description}</p>

      <div className="section-title">Regulatory references</div>
      <div style={{display:'flex', gap: 6, flexWrap:'wrap', marginBottom: 16}}>
        {risk.articles.map((a, i) => (
          <span key={i} className={`art-chip ${a.startsWith('GDPR') ? 'gdpr' : ''}`} style={{padding:'3px 8px', fontSize: 11}}>{a} <I.External size={9} style={{verticalAlign:'middle', opacity: 0.6}}/></span>
        ))}
      </div>

      <div className="section-title">Metadata</div>
      <dl className="kv compact" style={{marginBottom: 16}}>
        <dt>ID</dt><dd>{risk.id}</dd>
        <dt>Owner</dt><dd>
          <div style={{display:'inline-flex', alignItems:'center', gap: 6, fontFamily:'var(--font-sans)'}}>
            <div className="avatar xs" style={{background:`linear-gradient(135deg, ${owner.color}, #4338ca)`}}>{owner.initials}</div>
            {owner.name} <span style={{color:'var(--text-tertiary)'}}>· {owner.role}</span>
          </div>
        </dd>
        <dt>Created</dt><dd>{fmtDateTime(risk.lastReview - 60 * DAY).slice(0, 10)}</dd>
        <dt>Last review</dt><dd>{fmtDateTime(risk.lastReview).slice(0, 16)}</dd>
        <dt>Mitigations</dt><dd>{risk.mitigations}</dd>
        <dt>Linked incidents</dt><dd>{risk.linkedIncidents > 0 ? <span style={{color:'var(--status-failed)'}}>{risk.linkedIncidents}</span> : '0'}</dd>
      </dl>

      <div className="section-title">Mitigation history</div>
      <div className="audit-list" style={{border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', marginBottom: 16}}>
        {risk.mitigations > 0 ? Array(risk.mitigations).fill(0).map((_, i) => (
          <div key={i} className="audit-item">
            <IC.CheckCircle className="audit-icon" size={13} style={{color:'var(--status-success)'}}/>
            <div className="audit-event">
              <b>Mitigation #{risk.mitigations - i}</b>
              <small>{['Enabled cohort parity threshold alerts', 'Added human-in-the-loop review for high-impact actions', 'Documented in technical file (Annex IV)', 'Rotated OAuth credentials + updated retention policy'][i % 4]}</small>
            </div>
            <time>{fmtDateTime(risk.lastReview - (i + 1) * 8 * DAY).slice(0, 10)}</time>
          </div>
        )) : <div className="empty" style={{padding: 16}}>No mitigations recorded yet</div>}
      </div>

      <div className="section-title">Reviewer signatures (immutable)</div>
      <div style={{display:'flex', flexDirection:'column', gap: 6, marginBottom: 18}}>
        <SignatureLine admin={ADMINS[0]} ts={risk.lastReview}/>
        <SignatureLine admin={owner} ts={risk.lastReview - 14 * DAY}/>
      </div>

      <div style={{display:'flex', gap: 8}}>
        <button className="btn" style={{flex:1}} onClick={() => toast.push({title:'Ownership transfer initiated'})}><IC.UserCheck size={12}/> Transfer ownership</button>
        <button className="btn primary" style={{flex:1}} onClick={() => toast.push({title:'Marked mitigated'})}><I.Check size={12}/> Mark mitigated</button>
      </div>
    </div>
  );
}

function SignatureLine({ admin, ts }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap: 10, padding:'8px 12px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', background:'var(--bg-subtle)'}}>
      <div className="avatar xs" style={{background:`linear-gradient(135deg, ${admin.color}, #4338ca)`}}>{admin.initials}</div>
      <div style={{flex: 1}}>
        <b style={{fontSize: 12, fontWeight: 500}}>{admin.name}</b>
        <span style={{color:'var(--text-tertiary)', fontSize: 11, marginLeft: 6}}>{admin.role}</span>
      </div>
      <IC.CheckCircle size={13} style={{color:'var(--status-success)'}}/>
      <span className="mono" style={{fontSize: 10.5, color:'var(--text-tertiary)'}}>{fmtDateTime(ts).slice(0, 10)}</span>
    </div>
  );
}

Object.assign(window, { RisksScreen });
