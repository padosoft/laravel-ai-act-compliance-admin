import { NOW } from './mock-data';

export function fmtRelativeFrom(ts: number): string {
    const diff = (NOW - ts) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86_400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86_400)}d ago`;
}

export function fmtTime(ts: number): string {
    const d = new Date(ts);
    return d.toISOString().slice(11, 19) + 'Z';
}

export function fmtDateLong(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function fmtDateTime(ts: number): string {
    const d = new Date(ts);
    return d.toISOString().slice(0, 19).replace('T', ' ') + 'Z';
}

export function fmtNumber(value: number): string {
    return value.toLocaleString('en-US');
}
