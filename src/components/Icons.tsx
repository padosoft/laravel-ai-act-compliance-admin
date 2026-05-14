/* Icons — ported from public/handoff/ui.jsx + icons-compliance.jsx */
import type { ReactNode, SVGProps } from 'react';

interface IconBaseProps extends SVGProps<SVGSVGElement> {
    size?: number;
    children?: ReactNode;
}

function IconBase({ size = 16, fill = 'none', children, ...rest }: IconBaseProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill={fill}
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...rest}
        >
            {children}
        </svg>
    );
}

export type IconProps = Omit<IconBaseProps, 'children'>;

export const I = {
    Logo: (p: IconProps) => <IconBase {...p}><path d="M5 5h10l4 4v10H5z"/><path d="M9 13l2 2 4-4"/></IconBase>,
    Home: (p: IconProps) => <IconBase {...p}><path d="M3 12l9-8 9 8"/><path d="M5 10v10h14V10"/></IconBase>,
    Inbox: (p: IconProps) => <IconBase {...p}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></IconBase>,
    ShieldCheck: (p: IconProps) => <IconBase {...p}><path d="M12 2 4 5v7c0 5 3.5 8 8 10 4.5-2 8-5 8-10V5z"/><path d="m9 12 2 2 4-4"/></IconBase>,
    ShieldAlert: (p: IconProps) => <IconBase {...p}><path d="M12 2 4 5v7c0 5 3.5 8 8 10 4.5-2 8-5 8-10V5z"/><path d="M12 8v4M12 16h.01"/></IconBase>,
    Flag: (p: IconProps) => <IconBase {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></IconBase>,
    Scale: (p: IconProps) => <IconBase {...p}><path d="M16 16 9 7M21 12c0 5-3 8-9 8s-9-3-9-8"/><path d="M9 21h6"/><path d="M12 3v13"/></IconBase>,
    Briefcase: (p: IconProps) => <IconBase {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></IconBase>,
    Settings: (p: IconProps) => <IconBase {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.36.16.68.4.92.7"/></IconBase>,
    Search: (p: IconProps) => <IconBase {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></IconBase>,
    Bell: (p: IconProps) => <IconBase {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></IconBase>,
    Sun: (p: IconProps) => <IconBase {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></IconBase>,
    Moon: (p: IconProps) => <IconBase {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></IconBase>,
    ChevronRight: (p: IconProps) => <IconBase {...p}><path d="m9 18 6-6-6-6"/></IconBase>,
    ChevronDown: (p: IconProps) => <IconBase {...p}><path d="m6 9 6 6 6-6"/></IconBase>,
    ChevronLeft: (p: IconProps) => <IconBase {...p}><path d="m15 18-6-6 6-6"/></IconBase>,
    Plus: (p: IconProps) => <IconBase {...p}><path d="M12 5v14M5 12h14"/></IconBase>,
    X: (p: IconProps) => <IconBase {...p}><path d="M18 6 6 18M6 6l12 12"/></IconBase>,
    Check: (p: IconProps) => <IconBase {...p}><path d="M20 6 9 17l-5-5"/></IconBase>,
    CheckCircle: (p: IconProps) => <IconBase {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></IconBase>,
    AlertTriangle: (p: IconProps) => <IconBase {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></IconBase>,
    Clock: (p: IconProps) => <IconBase {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></IconBase>,
    Activity: (p: IconProps) => <IconBase {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></IconBase>,
    Download: (p: IconProps) => <IconBase {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></IconBase>,
    Award: (p: IconProps) => <IconBase {...p}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></IconBase>,
    Filter: (p: IconProps) => <IconBase {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></IconBase>,
    ArrowRight: (p: IconProps) => <IconBase {...p}><path d="M5 12h14M12 5l7 7-7 7"/></IconBase>,
    ArrowUp: (p: IconProps) => <IconBase {...p}><path d="M12 19V5M5 12l7-7 7 7"/></IconBase>,
    ArrowDown: (p: IconProps) => <IconBase {...p}><path d="M12 5v14M19 12l-7 7-7-7"/></IconBase>,
    Trash: (p: IconProps) => <IconBase {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></IconBase>,
    Eye: (p: IconProps) => <IconBase {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></IconBase>,
    EyeOff: (p: IconProps) => <IconBase {...p}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></IconBase>,
    Mail: (p: IconProps) => <IconBase {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></IconBase>,
    UserCheck: (p: IconProps) => <IconBase {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></IconBase>,
    UserMinus: (p: IconProps) => <IconBase {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></IconBase>,
    Webhook: (p: IconProps) => <IconBase {...p}><path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2"/><path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06"/><path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8"/></IconBase>,
    TrendingUp: (p: IconProps) => <IconBase {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></IconBase>,
    TrendingDown: (p: IconProps) => <IconBase {...p}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></IconBase>,
    Calendar: (p: IconProps) => <IconBase {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></IconBase>,
    FileText: (p: IconProps) => <IconBase {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6M9 9h2"/></IconBase>,
    FileDown: (p: IconProps) => <IconBase {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 12v6M9 15l3 3 3-3"/></IconBase>,
    Refresh: (p: IconProps) => <IconBase {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></IconBase>,
    Lock: (p: IconProps) => <IconBase {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></IconBase>,
    Database: (p: IconProps) => <IconBase {...p}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></IconBase>,
    Layers: (p: IconProps) => <IconBase {...p}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></IconBase>,
};

export type IconKey = keyof typeof I;
