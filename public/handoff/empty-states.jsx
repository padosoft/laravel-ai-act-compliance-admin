// ============== Linear-style empty state illustrations ==============
// Single-color line-art, opacity 0.45 baseline. Use one of these inside <EmptyState>.

const ESArt = {
  Inbox: () => (
    <svg viewBox="0 0 120 96" width="120" height="96" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.5}}>
      <rect x="14" y="20" width="92" height="60" rx="6"/>
      <path d="M14 56 L40 56 L46 64 L74 64 L80 56 L106 56"/>
      <path d="M30 32 L60 32 M30 40 L70 40"/>
      <circle cx="92" cy="14" r="3" fill="currentColor" opacity="0.7"/>
      <path d="M88 8 L96 14" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 120 96" width="120" height="96" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.5}}>
      <path d="M60 12 L34 22 L34 50 C34 64 44 78 60 84 C76 78 86 64 86 50 L86 22 Z"/>
      <path d="M48 50 L56 58 L72 42"/>
      <path d="M16 30 L24 30 M16 60 L24 60 M96 30 L104 30 M96 60 L104 60"/>
    </svg>
  ),
  Chart: () => (
    <svg viewBox="0 0 120 96" width="120" height="96" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.5}}>
      <rect x="12" y="14" width="96" height="68" rx="4"/>
      <path d="M22 64 L40 50 L54 58 L72 36 L92 46"/>
      <circle cx="40" cy="50" r="2.5" fill="currentColor"/>
      <circle cx="54" cy="58" r="2.5" fill="currentColor"/>
      <circle cx="72" cy="36" r="2.5" fill="currentColor"/>
      <circle cx="92" cy="46" r="2.5" fill="currentColor"/>
      <path d="M22 76 L98 76" strokeOpacity="0.4"/>
    </svg>
  ),
  Kanban: () => (
    <svg viewBox="0 0 120 96" width="120" height="96" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.5}}>
      <rect x="10" y="14" width="30" height="68" rx="3"/>
      <rect x="45" y="14" width="30" height="68" rx="3"/>
      <rect x="80" y="14" width="30" height="68" rx="3"/>
      <rect x="14" y="22" width="22" height="10" rx="2"/>
      <rect x="14" y="36" width="22" height="10" rx="2"/>
      <rect x="49" y="22" width="22" height="10" rx="2"/>
      <rect x="84" y="22" width="22" height="10" rx="2"/>
    </svg>
  ),
  Folder: () => (
    <svg viewBox="0 0 120 96" width="120" height="96" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.5}}>
      <path d="M14 30 L14 76 C14 79 16 81 19 81 L101 81 C104 81 106 79 106 76 L106 36 C106 33 104 31 101 31 L60 31 L52 23 L19 23 C16 23 14 25 14 28 Z"/>
      <path d="M28 50 L92 50 M28 60 L72 60"/>
    </svg>
  ),
  Scale: () => (
    <svg viewBox="0 0 120 96" width="120" height="96" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.5}}>
      <path d="M60 14 V80"/>
      <path d="M40 80 L80 80"/>
      <path d="M30 30 L60 22 L90 30"/>
      <path d="M22 50 C22 56 26 62 30 62 C34 62 38 56 38 50 L30 30 Z"/>
      <path d="M82 50 C82 56 86 62 90 62 C94 62 98 56 98 50 L90 30 Z"/>
    </svg>
  ),
  Sparkles: () => (
    <svg viewBox="0 0 120 96" width="120" height="96" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.5}}>
      <path d="M40 20 L43 32 L55 35 L43 38 L40 50 L37 38 L25 35 L37 32 Z"/>
      <path d="M82 50 L85 60 L95 63 L85 66 L82 76 L79 66 L69 63 L79 60 Z"/>
      <path d="M28 70 L30 74 L34 76 L30 78 L28 82 L26 78 L22 76 L26 74 Z"/>
    </svg>
  ),
};

function EmptyState({ art = 'Inbox', title, body, cta, ctaIcon }) {
  const Art = ESArt[art] || ESArt.Inbox;
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      padding: '40px 24px',
      textAlign: 'center',
      color: 'var(--text-tertiary)',
    }}>
      <div style={{color:'var(--text-tertiary)'}}><Art/></div>
      <div style={{maxWidth: 360, display:'flex', flexDirection:'column', gap: 4}}>
        <b style={{fontSize: 14, color: 'var(--text)', fontWeight: 600}}>{title}</b>
        {body && <small style={{fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5}}>{body}</small>}
      </div>
      {cta && (
        <button className="btn primary" onClick={cta.onClick} style={{marginTop: 6}}>
          {ctaIcon} {cta.label}
        </button>
      )}
    </div>
  );
}

Object.assign(window, { EmptyState, ESArt });
