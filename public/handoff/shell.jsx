// ============== Shell: Sidebar + Topbar + Command Palette ==============
// Routes for AI Act Compliance Admin (8 screens per spec).

const ROUTES = [
  { key: 'overview',  label: 'Compliance Overview', icon: I.Home,        section: 'Operations' },
  { key: 'dsar',      label: 'DSAR Queue',          icon: I.Inbox,       section: 'Operations' },
  { key: 'consent',   label: 'Consent Overview',    icon: I.ShieldCheck, section: 'Operations' },
  { key: 'risks',     label: 'Risk Register',       icon: I.ShieldAlert, section: 'Risk Management' },
  { key: 'incidents', label: 'Incident Manager',    icon: I.Flag,        section: 'Risk Management' },
  { key: 'bias',      label: 'Bias Monitor',        icon: I.Scale,       section: 'Risk Management' },
  { key: 'dpo',       label: 'DPO Console',         icon: I.Briefcase,   section: 'Governance' },
  { key: 'settings',  label: 'Settings',            icon: I.Settings,    section: 'Governance' },
];

const NAV_SECTIONS = ['Operations', 'Risk Management', 'Governance'];

function Sidebar({ route, onNavigate, counts = {} }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark compliance">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        </div>
        <div className="brand-text">
          <span>AI Act Compliance</span>
          <small>Padosoft · v6.0</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_SECTIONS.map(sec => (
          <div className="nav-section" key={sec}>
            <div className="nav-label">{sec}</div>
            {ROUTES.filter(r => r.section === sec).map(r => {
              const Ic = r.icon;
              const badge = counts[r.key];
              const isActive = route === r.key;
              return (
                <div key={r.key}
                     className={`nav-item ${isActive ? 'active' : ''}`}
                     onClick={() => onNavigate(r.key)}>
                  <Ic size={15} />
                  <span>{r.label}</span>
                  {badge != null && <span className="badge">{badge}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <Avatar name="Giulia Amalfi" initials="GA" size={26} />
          <div className="user-info">
            <b>Giulia Amalfi</b>
            <small>DPO · Padosoft</small>
          </div>
        </div>
        <button className="iconbtn" title="Account">
          <I.ChevronDown size={14} />
        </button>
      </div>
    </aside>
  );
}

function Topbar({ route, theme, onTheme, onOpenPalette, lastTick, alertCount }) {
  const meta = ROUTES.find(r => r.key === route) || ROUTES[0];

  return (
    <header className="topbar">
      <div className="crumbs">
        <span className="muted">Padosoft</span>
        <span className="sep"><I.ChevronRight size={11}/></span>
        <span className="muted">Compliance</span>
        <span className="sep"><I.ChevronRight size={11}/></span>
        <b>{meta.label}</b>
      </div>

      <div className="topbar-spacer" />

      <span className={`live-pill ${alertCount > 0 ? 'amber' : ''}`} title="Real-time monitoring">
        <span className="pulse" />
        <span>Live</span>
        <span style={{opacity:0.7, marginLeft:4}}>· {fmtTime(lastTick)}</span>
      </span>

      <button className="search-trigger" onClick={onOpenPalette}>
        <I.Search size={13}/>
        <span>Search DSAR, risks, incidents…</span>
        <span className="kbd">⌘K</span>
      </button>

      <button className="iconbtn" title="Notifications" style={{position:'relative'}}>
        <I.Bell size={14}/>
        {alertCount > 0 && (
          <span style={{
            position:'absolute', top:2, right:2,
            width:6, height:6, borderRadius:'50%',
            background:'var(--sev-critical)',
            boxShadow:'0 0 0 2px var(--bg-elevated)',
          }}/>
        )}
      </button>

      <button className="iconbtn"
              onClick={() => onTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Toggle theme">
        {theme === 'dark' ? <I.Sun size={14}/> : <I.Moon size={14}/>}
      </button>
    </header>
  );
}

// ============== Command palette ==============

function CommandPalette({ open, onClose, onNavigate }) {
  const [q, setQ] = React.useState('');
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (open) {
      setQ(''); setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const navItems = ROUTES.map(r => ({
    kind: 'nav',
    label: r.label,
    icon: <r.icon size={14}/>,
    meta: r.section,
    action: () => onNavigate(r.key),
  }));

  const actionItems = [
    { kind: 'action', label: 'Generate Article 30 attestation', icon: <I.Award size={14}/>,    action: () => onNavigate('dpo') },
    { kind: 'action', label: 'Open new DSAR',                   icon: <I.Plus size={14}/>,     action: () => onNavigate('dsar') },
    { kind: 'action', label: 'Open new incident',               icon: <I.Flag size={14}/>,     action: () => onNavigate('incidents') },
    { kind: 'action', label: 'Add risk to register',            icon: <I.ShieldAlert size={14}/>, action: () => onNavigate('risks') },
    { kind: 'action', label: 'Inspect bias cohort',             icon: <I.Scale size={14}/>,    action: () => onNavigate('bias') },
    { kind: 'action', label: 'Review retention policies',       icon: <I.Clock size={14}/>,    action: () => onNavigate('dpo') },
  ];

  const recordItems = [
    ...DSAR.slice(0, 6).map(d => ({ kind: 'record', label: `DSAR · ${d.subject.name}`, icon: <I.Inbox size={14}/>, meta: d.id, action: () => onNavigate('dsar') })),
    ...INCIDENTS.slice(0, 4).map(i => ({ kind: 'record', label: `Incident · ${i.title}`, icon: <I.Flag size={14}/>, meta: i.id, action: () => onNavigate('incidents') })),
    ...RISKS.slice(0, 5).map(r => ({ kind: 'record', label: `Risk · ${r.name}`, icon: <I.ShieldAlert size={14}/>, meta: r.id, action: () => onNavigate('risks') })),
  ];

  const results = React.useMemo(() => {
    const ql = q.toLowerCase().trim();
    if (!ql) {
      return [
        { section: 'Navigate', items: navItems },
        { section: 'Quick actions', items: actionItems.slice(0, 4) },
      ];
    }
    const match = (items) => items.filter(i =>
      i.label.toLowerCase().includes(ql) ||
      (i.meta || '').toLowerCase().includes(ql)
    );
    const sections = [];
    const n = match(navItems);    if (n.length) sections.push({ section: 'Navigate', items: n });
    const a = match(actionItems); if (a.length) sections.push({ section: 'Actions',  items: a });
    const r = match(recordItems); if (r.length) sections.push({ section: 'Records',  items: r.slice(0, 10) });
    return sections;
  }, [q]);

  const flat = results.flatMap(s => s.items);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(flat.length - 1, a + 1)); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
      else if (e.key === 'Enter')     { e.preventDefault(); const it = flat[active]; if (it) { it.action(); onClose(); } }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, flat, active, onClose]);

  if (!open) return null;

  let runningIdx = 0;
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="palette">
        <input ref={inputRef} className="palette-input"
               placeholder="Search records, navigate to a screen, run a command…"
               value={q} onChange={e => { setQ(e.target.value); setActive(0); }} />
        <div className="palette-list">
          {results.length === 0 && (
            <div className="empty" style={{padding: '32px 16px'}}>No results for "{q}"</div>
          )}
          {results.map((sec, si) => (
            <div key={si}>
              <div className="palette-section">{sec.section}</div>
              {sec.items.map((it, ii) => {
                const idx = runningIdx++;
                return (
                  <div key={ii}
                       className={`palette-item ${idx === active ? 'active' : ''}`}
                       onMouseEnter={() => setActive(idx)}
                       onClick={() => { it.action(); onClose(); }}>
                    <span className="icon">{it.icon}</span>
                    <span>{it.label}</span>
                    {it.meta && <span className="meta">{it.meta}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="palette-foot">
          <span><span className="kbd">↑↓</span> Navigate</span>
          <span><span className="kbd">↵</span> Open</span>
          <span><span className="kbd">esc</span> Close</span>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { ROUTES, Sidebar, Topbar, CommandPalette });
