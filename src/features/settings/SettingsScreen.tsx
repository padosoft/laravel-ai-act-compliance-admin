import { useState } from 'react';

import { I } from '../../components/Icons';
import { ArticleRef } from '../../components/Primitives';
import { ENV_VARS, FEATURE_FLAGS } from '../../lib/mock-data';

export function SettingsScreen() {
    const [flags, setFlags] = useState(FEATURE_FLAGS);
    const [showSecrets, setShowSecrets] = useState(false);

    function toggleFlag(id: string) {
        setFlags((prev) => prev.map((flag) => (flag.id === id ? { ...flag, enabled: !flag.enabled } : flag)));
    }

    return (
        <div className="page" data-testid="settings-screen" data-state="ready">
            <div className="page-head">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-sub">
                        Feature flags · environment variables · DSAR SLA · bias drift thresholds · webhook destinations
                    </p>
                </div>
                <div className="page-actions">
                    <button type="button" className="btn"><I.Download size={13} /> Export settings</button>
                </div>
            </div>

            <div className="card mt-16" data-testid="settings-flags">
                <div className="card-head">
                    <div>
                        <h3 className="card-title">Feature flags</h3>
                        <p className="card-sub">Toggle compliance modules · changes are audit-logged</p>
                    </div>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Module</th>
                            <th>Articles</th>
                            <th style={{ textAlign: 'right' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flags.map((flag) => (
                            <tr key={flag.id} data-testid={`settings-flag-${flag.id}`}>
                                <td>
                                    <b>{flag.name}</b>
                                    <small className="mono" style={{ color: 'var(--text-tertiary)' }}>{flag.id}</small>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {flag.articles.length === 0 ? (
                                            <span className="muted">—</span>
                                        ) : (
                                            flag.articles.map((article) => <ArticleRef key={article}>{article}</ArticleRef>)
                                        )}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={flag.enabled}
                                        className={`switch ${flag.enabled ? 'on' : ''}`}
                                        onClick={() => toggleFlag(flag.id)}
                                        data-testid={`settings-flag-toggle-${flag.id}`}
                                    >
                                        <span className="thumb" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card mt-16" data-testid="settings-env">
                <div className="card-head">
                    <div>
                        <h3 className="card-title">Environment</h3>
                        <p className="card-sub">Module config · sourced from config files and environment</p>
                    </div>
                    <button
                        type="button"
                        className="btn sm"
                        onClick={() => setShowSecrets((current) => !current)}
                        data-testid="settings-show-secrets"
                        aria-pressed={showSecrets}
                    >
                        {showSecrets ? <I.EyeOff size={12} /> : <I.Eye size={12} />}{' '}
                        {showSecrets ? 'Hide secrets' : 'Show secrets'}
                    </button>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Variable</th>
                            <th>Value</th>
                            <th>Source</th>
                            <th>Module</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ENV_VARS.map((row) => {
                            const masked = row.value.startsWith('****') && !showSecrets;
                            return (
                                <tr key={row.name}>
                                    <td className="mono">{row.name}</td>
                                    <td className="mono">{masked ? '••••••••' : row.value}</td>
                                    <td>
                                        <span className="badge outline">{row.source}</span>
                                    </td>
                                    <td>{row.module}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="card mt-16" data-testid="settings-webhooks">
                <div className="card-head">
                    <div>
                        <h3 className="card-title">Webhook destinations</h3>
                        <p className="card-sub">Outbound notifications for incidents, DSAR breaches, drift alerts</p>
                    </div>
                    <button type="button" className="btn primary sm">
                        <I.Plus size={12} /> Add destination
                    </button>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Channel</th>
                            <th>URL</th>
                            <th>Events</th>
                            <th>Last delivered</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><I.Webhook size={12} /> Slack #compliance</td>
                            <td className="mono">https://hooks.slack.com/services/T0xxx/B0xxx/****</td>
                            <td>incident.opened · dsar.breach · bias.drift</td>
                            <td>2h ago</td>
                            <td><span className="badge success">healthy</span></td>
                        </tr>
                        <tr>
                            <td><I.Webhook size={12} /> Sentry compliance</td>
                            <td className="mono">https://sentry.io/api/0/hooks/****</td>
                            <td>incident.opened · risk.review_overdue</td>
                            <td>1d ago</td>
                            <td><span className="badge success">healthy</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
