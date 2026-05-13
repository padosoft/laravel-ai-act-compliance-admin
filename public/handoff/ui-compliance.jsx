// ============== Extra icons + helpers for AI Act Compliance Admin ==============
// Extends I, StatusBadge etc. defined in ui.jsx.

Object.assign(I, {
  // Compliance domain
  Shield:        (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon>,
  ShieldCheck:   (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></Icon>,
  ShieldAlert:   (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4M12 16h.01"/></Icon>,
  Gavel:         (p) => <Icon {...p}><path d="m14 13-7.5 7.5a2.12 2.12 0 0 1-3-3L11 10"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/></Icon>,
  Users:         (p) => <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>,
  UserMinus:     (p) => <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></Icon>,
  ListChecks:    (p) => <Icon {...p}><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></Icon>,
  Inbox:         (p) => <Icon {...p}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/></Icon>,
  Briefcase:     (p) => <Icon {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></Icon>,
  Scale:         (p) => <Icon {...p}><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></Icon>,
  Activity2:     (p) => <Icon {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Icon>,
  TrendingDown:  (p) => <Icon {...p}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></Icon>,
  TrendingUp:    (p) => <Icon {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></Icon>,
  FileText:      (p) => <Icon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></Icon>,
  Award:         (p) => <Icon {...p}><circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/></Icon>,
  Eye:           (p) => <Icon {...p}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></Icon>,
  EyeOff:        (p) => <Icon {...p}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></Icon>,
  Lock:          (p) => <Icon {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Icon>,
  Database:      (p) => <Icon {...p}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></Icon>,
  Download:      (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Icon>,
  Upload:        (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></Icon>,
  Filter:        (p) => <Icon {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></Icon>,
  GripVertical:  (p) => <Icon {...p}><circle cx="9" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="15" cy="18" r="1.2"/></Icon>,
  Calendar:      (p) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Icon>,
  Globe:         (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Icon>,
  Mail:          (p) => <Icon {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></Icon>,
  Workflow:      (p) => <Icon {...p}><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M6 9v4a2 2 0 0 0 2 2h7"/></Icon>,
  Boxes:         (p) => <Icon {...p}><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 1.03 1.71l3 1.71a2 2 0 0 0 1.94 0L12 18.92"/><path d="m7 16.5-5-3"/><path d="m7 16.5 5-3"/><path d="M7 16.5v-5"/><path d="M12 18.92V14"/></Icon>,
  Tag:           (p) => <Icon {...p}><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></Icon>,
  Edit:          (p) => <Icon {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Icon>,
  Trash:         (p) => <Icon {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></Icon>,
  Info:          (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></Icon>,
  CheckCircle:   (p) => <Icon {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Icon>,
  XCircle:       (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></Icon>,
  Flag:          (p) => <Icon {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></Icon>,
  Wand:          (p) => <Icon {...p}><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></Icon>,
  Bot:           (p) => <Icon {...p}><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></Icon>,
  Network:       (p) => <Icon {...p}><rect x="9" y="3" width="6" height="4" rx="1"/><rect x="2" y="17" width="6" height="4" rx="1"/><rect x="16" y="17" width="6" height="4" rx="1"/><path d="M5 17v-3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M12 7v5"/></Icon>,
  Webhook:       (p) => <Icon {...p}><path d="M18 16.98h-5.99c-1.66 0-2.99-1.34-2.99-3s1.34-3 2.99-3h5.99"/><path d="M18 16.98c-.62.62-1.46 1-2.39 1"/><path d="m12.5 15-1.6 2.74A2.85 2.85 0 0 1 6 18a2.85 2.85 0 0 1 5.06-3.27"/></Icon>,
  Layers:        (p) => <Icon {...p}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></Icon>,
  Sparkles:      (p) => <Icon {...p}><path d="M9.94 2.06 12 7l4.94 2.06L12 11.12 9.94 16l-2.06-4.88L3 9.06l4.88-2.06Z"/></Icon>,
  Send:          (p) => <Icon {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></Icon>,
});

// ============== Severity badge ==============
function SevBadge({ level, label }) {
  const norm = (level || 'neutral').toLowerCase();
  const fallback = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low', info: 'Info', neutral: '—' };
  return (
    <span className={`sev ${norm}`}>
      <span className="dot" />
      {label || fallback[norm] || level}
    </span>
  );
}

// ============== Article reference pill ==============
function ArticleRef({ children, onClick }) {
  return (
    <span className="art-ref" onClick={onClick} title="Open reference">
      <I.FileText size={10}/>
      {children}
    </span>
  );
}

// ============== Avatar / Tag ==============
function Avatar({ name, initials, size = 22, tone }) {
  const ini = initials || (name ? name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase() : '?');
  const style = { width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.42)) };
  return (
    <div className="avatar" style={style} title={name}>{ini}</div>
  );
}

// ============== Empty-state illustration ==============
function PanelEmptyState({ icon, title, body, action }) {
  return (
    <div className="empty-illu">
      {icon || (
        <svg viewBox="0 0 120 90" fill="none" stroke="currentColor" strokeWidth="1.25">
          <rect x="10" y="20" width="100" height="60" rx="6"/>
          <line x1="10" y1="34" x2="110" y2="34"/>
          <circle cx="20" cy="27" r="1.2" fill="currentColor"/>
          <circle cx="25" cy="27" r="1.2" fill="currentColor"/>
          <line x1="22" y1="48" x2="80" y2="48"/>
          <line x1="22" y1="56" x2="60" y2="56"/>
          <line x1="22" y1="64" x2="92" y2="64"/>
          <line x1="22" y1="72" x2="72" y2="72"/>
        </svg>
      )}
      <h4>{title}</h4>
      {body && <p>{body}</p>}
      {action}
    </div>
  );
}

// ============== Tooltip wrapper ==============
function Tooltip({ label, children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <span className="tt-wrap"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}>
      {children}
      {open && label && <span className="tt">{label}</span>}
    </span>
  );
}

// ============== Format helpers extended ==============
function fmtRelativeFrom(ts, refMs) {
  const ref = refMs || (window.NOW || Date.now());
  const diff = Math.max(0, (ref - ts) / 1000);
  if (diff < 60)   return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  const d = Math.floor(diff/86400);
  return d === 1 ? 'yesterday' : `${d}d ago`;
}
function fmtDate(ts) {
  return new Date(ts).toISOString().slice(0, 10);
}
function fmtDateLong(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ============== Section header ==============
function SectionHeader({ title, sub, actions }) {
  return (
    <div className="between mb-12">
      <div>
        <h2 style={{margin:0, fontSize:14, fontWeight:600, letterSpacing:'-0.01em'}}>{title}</h2>
        {sub && <p style={{margin:'2px 0 0', fontSize:12, color:'var(--text-tertiary)'}}>{sub}</p>}
      </div>
      <div className="center gap-6">{actions}</div>
    </div>
  );
}

// ============== Switch ==============
function Switch({ on, onClick }) {
  return <button type="button" className={`switch ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on}/>;
}

Object.assign(window, {
  SevBadge, ArticleRef, Avatar, PanelEmptyState, Tooltip,
  fmtRelativeFrom, fmtDate, fmtDateLong,
  SectionHeader, Switch,
});
