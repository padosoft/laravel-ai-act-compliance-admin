import { ReactElement, ReactNode, useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { I, IconProps } from './Icons';
import { Avatar, Kbd } from './Primitives';
import { fmtTime } from '../lib/helpers';
import { DSAR, INCIDENTS, RISKS, type DsarRequest, type Incident, type Risk } from '../lib/mock-data';

type IconComponent = (props: IconProps) => ReactElement;

interface RouteEntry {
    key: string;
    path: string;
    label: string;
    icon: IconComponent;
    section: 'Operations' | 'Risk Management' | 'Governance';
}

export const ROUTES: RouteEntry[] = [
    { key: 'overview', path: '/', label: 'Compliance Overview', icon: I.Home, section: 'Operations' },
    { key: 'alerts', path: '/alerts', label: 'Alerts', icon: I.Bell, section: 'Operations' },
    { key: 'dsar', path: '/dsar', label: 'DSAR Queue', icon: I.Inbox, section: 'Operations' },
    { key: 'consent', path: '/consent', label: 'Consent Overview', icon: I.ShieldCheck, section: 'Operations' },
    { key: 'risks', path: '/risks', label: 'Risk Register', icon: I.ShieldAlert, section: 'Risk Management' },
    { key: 'fria', path: '/fria', label: 'FRIA Assessments', icon: I.FileText, section: 'Risk Management' },
    { key: 'incidents', path: '/incidents', label: 'Incident Manager', icon: I.Flag, section: 'Risk Management' },
    { key: 'human-review', path: '/human-review', label: 'Human Oversight', icon: I.UserCheck, section: 'Risk Management' },
    { key: 'bias', path: '/bias', label: 'Bias Monitor', icon: I.Scale, section: 'Risk Management' },
    { key: 'dpo', path: '/dpo', label: 'DPO Console', icon: I.Briefcase, section: 'Governance' },
    { key: 'regulatory', path: '/regulatory', label: 'Regulatory Feed', icon: I.FileText, section: 'Governance' },
    { key: 'tenants', path: '/tenants', label: 'Tenants', icon: I.Briefcase, section: 'Governance' },
    { key: 'settings', path: '/settings', label: 'Settings', icon: I.Settings, section: 'Governance' },
];

const NAV_SECTIONS: RouteEntry['section'][] = ['Operations', 'Risk Management', 'Governance'];

interface ShellProps {
    children?: ReactNode;
}

export function Shell({ children }: ShellProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const currentKey = useMemo(() => {
        const match = ROUTES.find((route) => route.path === location.pathname) ?? ROUTES[0];
        return match.key;
    }, [location.pathname]);

    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof document !== 'undefined') {
            return (document.documentElement.dataset.theme as 'light' | 'dark') ?? 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.dataset.theme = theme;
        }
    }, [theme]);

    const [paletteOpen, setPaletteOpen] = useState(false);
    const [lastTick, setLastTick] = useState(Date.now());

    useEffect(() => {
        const id = setInterval(() => setLastTick(Date.now()), 30_000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setPaletteOpen((open) => !open);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const counts = useMemo(() => {
        const dsarOpen = DSAR.filter((d) => d.status !== 'completed' && d.status !== 'rejected').length;
        const incOpen = INCIDENTS.filter((i) => i.state !== 'closed').length;
        const risksOpen = RISKS.filter((r) => r.status !== 'closed').length;
        return { dsar: dsarOpen, incidents: incOpen, risks: risksOpen };
    }, []);

    const alertCount =
        INCIDENTS.filter(
            (i) => i.state !== 'closed' && (i.severity === 'critical' || i.severity === 'high'),
        ).length +
        DSAR.filter(
            (d) => d.dueIn < 0 && d.status !== 'completed' && d.status !== 'rejected',
        ).length;

    const goToKey = useCallback(
        (key: string) => {
            const route = ROUTES.find((entry) => entry.key === key);
            if (route) navigate(route.path);
        },
        [navigate],
    );

    return (
        <div className="app" data-testid="ai-act-compliance-app" data-route={currentKey}>
            <Sidebar currentKey={currentKey} counts={counts} />
            <div className="main">
                <Topbar
                    currentKey={currentKey}
                    theme={theme}
                    onTheme={(next) => setTheme(next)}
                    onOpenPalette={() => setPaletteOpen(true)}
                    lastTick={lastTick}
                    alertCount={alertCount}
                />
                <div className="content">{children ?? <Outlet />}</div>
            </div>

            <CommandPalette
                open={paletteOpen}
                onClose={() => setPaletteOpen(false)}
                onNavigate={goToKey}
            />
        </div>
    );
}

interface SidebarProps {
    currentKey: string;
    counts: { dsar: number; incidents: number; risks: number };
}

function Sidebar({ currentKey, counts }: SidebarProps) {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-mark compliance">
                    <svg
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                    </svg>
                </div>
                <div className="brand-text">
                    <span>AI Act Compliance</span>
                    <small>Padosoft · v6.0</small>
                </div>
            </div>

            <nav className="sidebar-nav" aria-label="Compliance sections">
                {NAV_SECTIONS.map((section) => (
                    <div className="nav-section" key={section}>
                        <div className="nav-label">{section}</div>
                        {ROUTES.filter((route) => route.section === section).map((route) => {
                            const Ic = route.icon;
                            const badge =
                                route.key === 'dsar'
                                    ? counts.dsar
                                    : route.key === 'incidents'
                                        ? counts.incidents
                                        : route.key === 'risks'
                                            ? counts.risks
                                            : undefined;
                            return (
                                <NavLink
                                    key={route.key}
                                    to={route.path}
                                    end={route.path === '/'}
                                    className={({ isActive }) =>
                                        `nav-item ${isActive || currentKey === route.key ? 'active' : ''}`
                                    }
                                    data-testid={`ai-act-nav-${route.key}`}
                                >
                                    <Ic size={15} />
                                    <span>{route.label}</span>
                                    {badge != null && <span className="badge">{badge}</span>}
                                </NavLink>
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
                <button type="button" className="iconbtn" aria-label="Account menu" title="Account">
                    <I.ChevronDown size={14} />
                </button>
            </div>
        </aside>
    );
}

interface TopbarProps {
    currentKey: string;
    theme: 'light' | 'dark';
    onTheme: (theme: 'light' | 'dark') => void;
    onOpenPalette: () => void;
    lastTick: number;
    alertCount: number;
}

function Topbar({ currentKey, theme, onTheme, onOpenPalette, lastTick, alertCount }: TopbarProps) {
    const meta = ROUTES.find((route) => route.key === currentKey) ?? ROUTES[0];
    return (
        <header className="topbar">
            <div className="crumbs">
                <span className="muted">Padosoft</span>
                <span className="sep"><I.ChevronRight size={11} /></span>
                <span className="muted">Compliance</span>
                <span className="sep"><I.ChevronRight size={11} /></span>
                <b data-testid="topbar-page-title">{meta.label}</b>
            </div>

            <div className="topbar-spacer" />

            <span
                className={`live-pill ${alertCount > 0 ? 'amber' : ''}`}
                title="Real-time monitoring"
                data-testid="topbar-live"
            >
                <span className="pulse" />
                <span>Live</span>
                <span style={{ opacity: 0.7, marginLeft: 4 }}>· {fmtTime(lastTick)}</span>
            </span>

            <button
                type="button"
                className="search-trigger"
                onClick={onOpenPalette}
                aria-label="Open command palette"
                data-testid="topbar-palette-open"
            >
                <I.Search size={13} />
                <span>Search DSAR, risks, incidents…</span>
                <span className="kbd">⌘K</span>
            </button>

            <button
                type="button"
                className="iconbtn"
                aria-label="Notifications"
                title="Notifications"
                style={{ position: 'relative' }}
            >
                <I.Bell size={14} />
                {alertCount > 0 && (
                    <span
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--sev-critical)',
                            boxShadow: '0 0 0 2px var(--bg-elevated)',
                        }}
                    />
                )}
            </button>

            <button
                type="button"
                className="iconbtn"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                title="Toggle theme"
                onClick={() => onTheme(theme === 'dark' ? 'light' : 'dark')}
            >
                {theme === 'dark' ? <I.Sun size={14} /> : <I.Moon size={14} />}
            </button>
        </header>
    );
}

interface PaletteItem {
    kind: 'nav' | 'action' | 'record';
    label: string;
    icon: ReactElement;
    meta?: string;
    action: () => void;
}

interface CommandPaletteProps {
    open: boolean;
    onClose: () => void;
    onNavigate: (key: string) => void;
}

function CommandPalette({ open, onClose, onNavigate }: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) return;
        setQuery('');
        setActive(0);
        const id = setTimeout(() => inputRef.current?.focus(), 30);
        return () => clearTimeout(id);
    }, [open]);

    const navItems: PaletteItem[] = ROUTES.map((route) => ({
        kind: 'nav',
        label: route.label,
        icon: <route.icon size={14} />,
        meta: route.section,
        action: () => onNavigate(route.key),
    }));

    const actionItems: PaletteItem[] = [
        { kind: 'action', label: 'Generate Article 30 attestation', icon: <I.Award size={14} />, action: () => onNavigate('dpo') },
        { kind: 'action', label: 'Open new DSAR', icon: <I.Plus size={14} />, action: () => onNavigate('dsar') },
        { kind: 'action', label: 'Open new incident', icon: <I.Flag size={14} />, action: () => onNavigate('incidents') },
        { kind: 'action', label: 'Add risk to register', icon: <I.ShieldAlert size={14} />, action: () => onNavigate('risks') },
        { kind: 'action', label: 'Inspect bias cohort', icon: <I.Scale size={14} />, action: () => onNavigate('bias') },
        { kind: 'action', label: 'Review retention policies', icon: <I.Clock size={14} />, action: () => onNavigate('dpo') },
    ];

    const recordItems: PaletteItem[] = [
        ...DSAR.slice(0, 6).map(
            (request: DsarRequest): PaletteItem => ({
                kind: 'record',
                label: `DSAR · ${request.subject.name}`,
                icon: <I.Inbox size={14} />,
                meta: request.id,
                action: () => onNavigate('dsar'),
            }),
        ),
        ...INCIDENTS.slice(0, 4).map(
            (incident: Incident): PaletteItem => ({
                kind: 'record',
                label: `Incident · ${incident.title}`,
                icon: <I.Flag size={14} />,
                meta: incident.id,
                action: () => onNavigate('incidents'),
            }),
        ),
        ...RISKS.slice(0, 5).map(
            (risk: Risk): PaletteItem => ({
                kind: 'record',
                label: `Risk · ${risk.name}`,
                icon: <I.ShieldAlert size={14} />,
                meta: risk.id,
                action: () => onNavigate('risks'),
            }),
        ),
    ];

    const results = useMemo(() => {
        const queryLower = query.toLowerCase().trim();
        if (!queryLower) {
            return [
                { section: 'Navigate', items: navItems },
                { section: 'Quick actions', items: actionItems.slice(0, 4) },
            ];
        }
        const match = (items: PaletteItem[]) =>
            items.filter(
                (item) =>
                    item.label.toLowerCase().includes(queryLower) ||
                    (item.meta || '').toLowerCase().includes(queryLower),
            );
        const sections: { section: string; items: PaletteItem[] }[] = [];
        const navMatches = match(navItems);
        if (navMatches.length) sections.push({ section: 'Navigate', items: navMatches });
        const actionMatches = match(actionItems);
        if (actionMatches.length) sections.push({ section: 'Actions', items: actionMatches });
        const recordMatches = match(recordItems);
        if (recordMatches.length) sections.push({ section: 'Records', items: recordMatches.slice(0, 10) });
        return sections;
    }, [query, navItems, actionItems, recordItems]);

    const flat = useMemo(() => results.flatMap((section) => section.items), [results]);

    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
                return;
            }
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActive((value) => Math.min(flat.length - 1, value + 1));
                return;
            }
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActive((value) => Math.max(0, value - 1));
                return;
            }
            if (event.key === 'Enter') {
                event.preventDefault();
                const item = flat[active];
                if (item) {
                    item.action();
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, flat, active, onClose]);

    if (!open) return null;

    let runningIndex = 0;
    return (
        <>
            <div className="overlay" onClick={onClose} />
            <div className="palette" role="dialog" aria-label="Command palette">
                <input
                    ref={inputRef}
                    className="palette-input"
                    placeholder="Search records, navigate to a screen, run a command…"
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setActive(0);
                    }}
                />
                <div className="palette-list">
                    {results.length === 0 && (
                        <div className="empty" style={{ padding: '32px 16px' }}>
                            No results for &quot;{query}&quot;
                        </div>
                    )}
                    {results.map((section) => (
                        <div key={section.section}>
                            <div className="palette-section">{section.section}</div>
                            {section.items.map((item) => {
                                const index = runningIndex++;
                                return (
                                    <button
                                        type="button"
                                        key={`${section.section}-${item.label}`}
                                        className={`palette-item ${index === active ? 'active' : ''}`}
                                        onMouseEnter={() => setActive(index)}
                                        onClick={() => {
                                            item.action();
                                            onClose();
                                        }}
                                    >
                                        <span className="icon">{item.icon}</span>
                                        <span>{item.label}</span>
                                        {item.meta && <span className="meta">{item.meta}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="palette-foot">
                    <span><Kbd>↑↓</Kbd> Navigate</span>
                    <span><Kbd>↵</Kbd> Open</span>
                    <span><Kbd>esc</Kbd> Close</span>
                </div>
            </div>
        </>
    );
}
