// ============== Screen 4: Risk Register Browser ==============

function PageRisks({ onNavigate }) {
  const [filters, setFilters] = React.useState({
    category: new Set(),
    status: new Set(),
    owner: new Set(),
  });
  const [query, setQuery] = React.useState('');
  const [openRisk, setOpenRisk] = React.useState(null);

  const toggle = (key, val) => {
    setFilters(f => {
      const next = new Set(f[key]);
      if (next.has(val)) next.delete(val); else next.add(val);
      return { ...f, [key]: next };
    });
  };

  const filtered = RISKS.filter(r => {
    if (filters.category.size > 0 && !filters.category.has(r.category)) return false;
    if (filters.status.size > 0 && !filters.status.has(r.status)) return false;
    if (filters.owner.size > 0 && !filters.owner.has(r.owner.id)) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!r.name.toLowerCase().includes(q) &&
          !r.desc.toLowerCase().includes(q) &&
          !r.articles.join(' ').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const catCount = (c) => RISKS.filter(r => r.category === c).length;
  const stCount  = (s) => RISKS.filter(r => r.status === s).length;
  const ownCount = (id) => RISKS.filter(r => r.owner.id === id).length;
  const owners = [...new Set(RISKS.map(r => r.owner.id))].map(id => RISKS.find(r => r.owner.id === id).owner);

  const cats = [
    { key: 'unacceptable', label: 'Unacceptable', ref: 'Art. 5' },
    { key: 'high',         label: 'High-risk',    ref: 'Art. 6 + Annex III' },
    { key: 'limited',      label: 'Limited',      ref: 'Art. 50' },
    { key: 'low',          label: 'Low / minimal',ref: 'Art. 95' },
  ];

  const sts = [
    { key: 'open',        label: 'Open' },
    { key: 'in_progress', label: 'In progress' },
    { key: 'closed',      label: 'Closed' },
  ];

  const anyFilter = filters.category.size > 0 || filters.status.size > 0 || filters.owner.size > 0 || query;

  return (
    <div className="page wide" data-screen-label="Risk Register">
      <div className="page-head">
        <div>
          <h1 className="page-title">Risk Register</h1>
          <p className="page-sub">
            AI Act risk categorisation per Articles 5, 6, 50 &amp; Annex III · {RISKS.length} risks tracked
          </p>
        </div>
        <div className="page-actions">
          <button className="btn"><I.Download size={13}/> Export CSV</button>
          <button className="btn primary"><I.Plus size={13}/> New risk</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns: '230px 1fr', gap: 16}}>
        {/* Sidebar filter */}
        <div className="risk-filter-side">
          <div style={{position:'relative', marginBottom:14}}>
            <I.Search size={12} style={{position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', color:'var(--text-tertiary)'}}/>
            <input className="input" placeholder="Search risks…" value={query}
                   onChange={e => setQuery(e.target.value)}
                   style={{paddingLeft:26, fontSize:12, height:28}}/>
          </div>

          <h5>Risk category · AI Act</h5>
          {cats.map(c => (
            <label key={c.key}>
              <input type="checkbox" checked={filters.category.has(c.key)}
                     onChange={() => toggle('category', c.key)}/>
              <span className={`risk-cat ${c.key}`} style={{fontSize:9, padding:'0 4px'}}>{c.label}</span>
              <span className="ct">{catCount(c.key)}</span>
            </label>
          ))}

          <h5>Status</h5>
          {sts.map(s => (
            <label key={s.key}>
              <input type="checkbox" checked={filters.status.has(s.key)} onChange={() => toggle('status', s.key)}/>
              <span>{s.label}</span>
              <span className="ct">{stCount(s.key)}</span>
            </label>
          ))}

          <h5>Owner</h5>
          {owners.map(o => (
            <label key={o.id}>
              <input type="checkbox" checked={filters.owner.has(o.id)} onChange={() => toggle('owner', o.id)}/>
              <Avatar name={o.name} size={18}/>
              <span style={{fontSize:11.5}}>{o.name}</span>
              <span className="ct">{ownCount(o.id)}</span>
            </label>
          ))}

          {anyFilter && (
            <button className="btn sm mt-12" style={{width:'100%'}} onClick={() => {
              setFilters({ category: new Set(), status: new Set(), owner: new Set() });
              setQuery('');
            }}>
              <I.X size={11}/> Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        <div>
          <div className="between mb-12">
            <div className="center gap-8" style={{fontSize:12, color:'var(--text-tertiary)'}}>
              <span><b className="mono" style={{color:'var(--text)'}}>{filtered.length}</b> / {RISKS.length} risks</span>
              {anyFilter && <span>· filtered</span>}
            </div>
            <div className="center gap-6">
              <button className="btn sm ghost"><I.ListChecks size={12}/> Grid</button>
              <button className="btn sm ghost"><I.FileText size={12}/> Table</button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={
                <svg viewBox="0 0 120 90" fill="none" stroke="currentColor" strokeWidth="1.25">
                  <path d="M60 14L30 26V46c0 12 12 22 30 28 18-6 30-16 30-28V26L60 14z"/>
                  <path d="m50 38 8 8 12-12"/>
                </svg>
              }
              title="No risks match"
              body="Try clearing filters or refining your search query."
            />
          ) : (
            <div className="risk-grid">
              {filtered.map(r => <RiskCard key={r.id} risk={r} onClick={() => setOpenRisk(r)}/>)}
            </div>
          )}
        </div>
      </div>

      <RiskDrawer risk={openRisk} onClose={() => setOpenRisk(null)}/>
    </div>
  );
}

function RiskCard({ risk, onClick }) {
  const STATUS_TONE = {
    open: 'failed', in_progress: 'running', closed: 'success',
  };
  const STATUS_LABEL = {
    open: 'Open', in_progress: 'In progress', closed: 'Closed',
  };
  return (
    <div className={`risk-card cat-${risk.category}`} onClick={onClick}>
      <div className="rc-head">
        <span className={`risk-cat ${risk.category}`}>{risk.category}</span>
        <span className={`badge ${STATUS_TONE[risk.status]}`}><span className="dot"/>{STATUS_LABEL[risk.status]}</span>
      </div>
      <div className="rc-name">{risk.name}</div>
      <div className="rc-desc">{risk.desc}</div>
      <div className="rc-arts">
        {risk.articles.slice(0, 3).map(a => <ArticleRef key={a}>{a}</ArticleRef>)}
        {risk.articles.length > 3 && <span style={{fontSize:10.5, color:'var(--text-tertiary)'}}>+{risk.articles.length - 3}</span>}
      </div>
      <div className="rc-foot">
        <Avatar name={risk.owner.name} size={20}/>
        <span style={{fontSize:11}}>{risk.owner.name.split(' ')[0]}</span>
        <span className="grow"/>
        <span className="mono" title={fmtDate(risk.lastReviewed)}>{fmtRelativeFrom(risk.lastReviewed)}</span>
      </div>
    </div>
  );
}

function RiskDrawer({ risk, onClose }) {
  if (!risk) return null;
  const STATUS_LABEL = { open: 'Open', in_progress: 'In progress', closed: 'Closed' };

  const reviewers = [
    { actor: risk.owner.name, at: risk.lastReviewed, action: 'Reviewed mitigations + signed off' },
    { actor: 'Giulia Amalfi', at: risk.lastReviewed - 7 * 86400_000, action: 'DPO co-review (no change)' },
    { actor: 'Chiara Ferri',  at: risk.lastReviewed - 30 * 86400_000, action: 'Initial legal review' },
  ];

  const mitigations = [
    risk.status !== 'open' && { at: risk.lastReviewed,                   actor: risk.owner.name, text: 'Mitigation deployed in v4.5 — coverage at 94% on rolling 7d eval set.' },
    { at: risk.lastReviewed - 14 * 86400_000, actor: 'Stefano Lombardi', text: 'Initial mitigation strategy: human-in-the-loop on flagged outputs + retrieval-only mode.' },
  ].filter(Boolean);

  return (
    <Drawer open onClose={onClose}
            title={
              <div className="center gap-8">
                <span className={`risk-cat ${risk.category}`} style={{fontSize:9}}>{risk.category}</span>
                <span className="mono" style={{fontSize:11, color:'var(--text-tertiary)'}}>{risk.id}</span>
              </div>
            }>
      <div style={{padding:20}}>
        <h2 style={{margin:'0 0 6px', fontSize:18, fontWeight:600, letterSpacing:'-0.015em'}}>{risk.name}</h2>
        <div className="center gap-6 mb-16" style={{flexWrap:'wrap'}}>
          <span className={`badge ${risk.status === 'closed' ? 'success' : risk.status === 'in_progress' ? 'running' : 'failed'}`}>
            <span className="dot"/>{STATUS_LABEL[risk.status]}
          </span>
          {risk.articles.map(a => <ArticleRef key={a}>{a}</ArticleRef>)}
        </div>

        <p style={{fontSize:13, lineHeight:1.6, color:'var(--text-secondary)', margin:'0 0 18px'}}>
          {risk.desc}
        </p>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18,
                     padding:14, background:'var(--bg-subtle)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)'}}>
          <div>
            <small style={{fontSize:10, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-tertiary)', fontWeight:600}}>Owner</small>
            <div className="center gap-8" style={{marginTop:4}}>
              <Avatar name={risk.owner.name} size={24}/>
              <div>
                <b style={{fontSize:12.5, fontWeight:500}}>{risk.owner.name}</b>
                <small style={{display:'block', fontSize:11, color:'var(--text-tertiary)'}}>{risk.owner.role}</small>
              </div>
            </div>
          </div>
          <div>
            <small style={{fontSize:10, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-tertiary)', fontWeight:600}}>Last reviewed</small>
            <div style={{marginTop:4}}>
              <b className="mono" style={{fontSize:12.5}}>{fmtDate(risk.lastReviewed)}</b>
              <small style={{display:'block', fontSize:11, color:'var(--text-tertiary)'}}>{fmtRelativeFrom(risk.lastReviewed)}</small>
            </div>
          </div>
        </div>

        <h4 style={{margin:'0 0 8px', fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-tertiary)', fontWeight:600}}>
          Mitigation history
        </h4>
        <div className="vtimeline mb-16">
          {mitigations.map((m, i) => (
            <div key={i} className="vt-item">
              <div className={`vt-dot ${i === 0 ? 'done' : ''}`}/>
              <div className="vt-body">
                <b style={{fontWeight:500}}>{m.text}</b>
                <small>{fmtDateTime(m.at)} · {m.actor}</small>
              </div>
            </div>
          ))}
        </div>

        <h4 style={{margin:'0 0 8px', fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-tertiary)', fontWeight:600}}>
          Reviewer signatures · append-only
        </h4>
        <div className="card mb-16">
          {reviewers.map((r, i) => (
            <div key={i} className="approval-card">
              <div className="center gap-10">
                <Avatar name={r.actor} size={26}/>
                <div className="approval-info">
                  <b>{r.actor}</b>
                  <small>{r.action} · {fmtDateLong(r.at)}</small>
                </div>
              </div>
              <span className="badge success" style={{fontSize:10}}><span className="dot"/>Signed</span>
            </div>
          ))}
        </div>

        <h4 style={{margin:'0 0 8px', fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-tertiary)', fontWeight:600}}>
          Linked incidents
        </h4>
        <div className="card mb-16">
          {INCIDENTS.filter(i => i.tags.some(t => risk.name.toLowerCase().includes(t)) || (risk.category === 'high' && i.severity === 'high'))
            .slice(0, 2).map((inc, i) => (
            <div key={i} className="approval-card" style={{borderBottom: i < 1 ? '1px solid var(--border)' : 0}}>
              <div className="approval-info">
                <b style={{fontSize:12.5}}>{inc.title}</b>
                <small className="mono">{inc.id} · {fmtRelativeFrom(inc.opened)}</small>
              </div>
              <SevBadge level={inc.severity}/>
            </div>
          ))}
        </div>

        <div className="center gap-6" style={{flexWrap:'wrap'}}>
          <button className="btn sm"><I.Edit size={11}/> Edit</button>
          <button className="btn sm"><I.User size={11}/> Transfer ownership</button>
          {risk.status !== 'closed' && <button className="btn sm primary"><I.CheckCircle size={11}/> Mark mitigated</button>}
        </div>
      </div>
    </Drawer>
  );
}

window.PageRisks = PageRisks;
