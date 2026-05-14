import { ReactNode, useEffect } from 'react';
import { I } from './Icons';

interface AvatarProps {
    name: string;
    initials?: string;
    size?: number;
}

export function Avatar({ name, initials, size = 28 }: AvatarProps) {
    const text = initials ?? name.slice(0, 2).toUpperCase();
    return (
        <span
            aria-label={name}
            title={name}
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: 'var(--avatar-bg, #3b82f6)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: size * 0.42,
                userSelect: 'none',
                flex: '0 0 auto',
            }}
        >
            {text}
        </span>
    );
}

interface SparklineProps {
    data: number[];
    color?: string;
    width?: number;
    height?: number;
}

export function Sparkline({ data, color = 'var(--accent)', width = 96, height = 32 }: SparklineProps) {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const stepX = width / Math.max(1, data.length - 1);
    const points = data
        .map((v, i) => `${i * stepX},${height - ((v - min) / range) * (height - 4) - 2}`)
        .join(' ');
    const areaPoints = `0,${height} ${points} ${width},${height}`;
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <polygon points={areaPoints} fill={color} opacity="0.12" />
            <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
        </svg>
    );
}

interface TooltipProps {
    label: string;
    children: ReactNode;
}

export function Tooltip({ label, children }: TooltipProps) {
    return (
        <span title={label} style={{ display: 'inline-flex' }}>
            {children}
        </span>
    );
}

export function ArticleRef({ children }: { children: ReactNode }) {
    return (
        <span
            style={{
                fontFamily: 'var(--font-mono, ui-monospace)',
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated, #1c2030)',
                color: 'var(--text-secondary)',
            }}
        >
            {children}
        </span>
    );
}

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    sub?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    width?: number | string;
}

export function Modal({ open, onClose, title, sub, children, footer, width }: ModalProps) {
    useEffect(() => {
        if (!open) return undefined;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;
    return (
        <>
            <div className="overlay" onClick={onClose} />
            <div className="modal" style={width ? { width } : undefined}>
                {title && (
                    <div className="modal-head">
                        <div className="modal-title">{title}</div>
                        {sub && <div className="modal-sub">{sub}</div>}
                    </div>
                )}
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-foot">{footer}</div>}
            </div>
        </>
    );
}

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    children: ReactNode;
    actions?: ReactNode;
}

export function Drawer({ open, onClose, title, children, actions }: DrawerProps) {
    useEffect(() => {
        if (!open) return undefined;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);
    if (!open) return null;
    return (
        <>
            <div className="overlay" onClick={onClose} />
            <div className="drawer">
                <div className="drawer-head">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <strong style={{ fontSize: 13 }}>{title}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {actions}
                        <button type="button" className="iconbtn" onClick={onClose} aria-label="Close drawer">
                            <I.X size={16} />
                        </button>
                    </div>
                </div>
                <div className="drawer-body">{children}</div>
            </div>
        </>
    );
}

export function Kbd({ children }: { children: ReactNode }) {
    return (
        <span
            style={{
                fontFamily: 'var(--font-mono, ui-monospace)',
                fontSize: 10,
                padding: '1px 5px',
                border: '1px solid var(--border)',
                borderRadius: 3,
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
            }}
        >
            {children}
        </span>
    );
}
