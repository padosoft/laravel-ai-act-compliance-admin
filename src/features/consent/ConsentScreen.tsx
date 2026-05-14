import { useState } from 'react';

import { I } from '../../components/Icons';
import { Sparkline } from '../../components/Primitives';
import { CONSENT_FEATURES, CONSENT_RATE, SUBJECTS } from '../../lib/mock-data';

type Tab = 'features' | 'users';

export function ConsentScreen() {
    const [tab, setTab] = useState<Tab>('features');
    const [search, setSearch] = useState('');

    return (
        <div className="page" data-testid="consent-screen" data-state="ready">
            <div className="page-head">
                <div>
                    <h1 className="page-title">Consent Overview</h1>
                    <p className="page-sub">
                        GDPR Art. 7 explicit consent · {CONSENT_FEATURES.length} configurable features · {SUBJECTS.length} active subjects
                    </p>
                </div>
                <div className="page-actions">
                    <button type="button" className="btn"><I.Download size={13} /> Export consent ledger</button>
                </div>
            </div>

            <nav className="tabs" role="tablist" aria-label="Consent sections">
                <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'features'}
                    className={`tab ${tab === 'features' ? 'active' : ''}`}
                    onClick={() => setTab('features')}
                    data-testid="consent-tab-features"
                >
                    Per feature
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'users'}
                    className={`tab ${tab === 'users' ? 'active' : ''}`}
                    onClick={() => setTab('users')}
                    data-testid="consent-tab-users"
                >
                    Per user
                </button>
            </nav>

            {tab === 'features' && (
                <div className="grid-fit-360" data-testid="consent-feature-grid">
                    {CONSENT_FEATURES.map((feature) => {
                        const rate = CONSENT_RATE[feature.id];
                        if (!rate) return null;
                        const tone = rate.granted >= 90 ? 'ok' : rate.granted >= 70 ? 'warn' : 'alert';
                        return (
                            <article
                                key={feature.id}
                                className="card consent-card"
                                data-testid={`consent-feature-${feature.id}`}
                                data-tone={tone}
                            >
                                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{feature.name}</h3>
                                        {feature.required ? (
                                            <span className="badge primary mt-4">Required</span>
                                        ) : (
                                            <span className="badge outline mt-4">Optional</span>
                                        )}
                                    </div>
                                    <div className="kpi-icon"><I.ShieldCheck size={14} /></div>
                                </header>
                                <div className="kpi-value" style={{ marginTop: 8 }}>
                                    {rate.granted.toFixed(1)}%
                                </div>
                                <div className="consent-bar">
                                    <div className="seg granted" style={{ width: `${rate.granted}%` }} />
                                    <div className="seg revoked" style={{ width: `${rate.revoked}%` }} />
                                    <div className="seg never" style={{ width: `${rate.never}%` }} />
                                </div>
                                <div className="consent-legend">
                                    <span><span className="dot granted" /> Granted {rate.granted.toFixed(1)}%</span>
                                    <span><span className="dot revoked" /> Revoked {rate.revoked.toFixed(1)}%</span>
                                    <span><span className="dot never" /> Never {rate.never.toFixed(1)}%</span>
                                </div>
                                <div className="kpi-spark">
                                    <Sparkline data={rate.trend} color="var(--accent)" />
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {tab === 'users' && (
                <div className="card">
                    <div className="filter-bar">
                        <div className="filter-group grow">
                            <label className="filter-label">Search subject</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Name or email"
                                data-testid="consent-user-search"
                            />
                        </div>
                    </div>
                    <table className="data-table" data-testid="consent-user-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                {CONSENT_FEATURES.map((feature) => (
                                    <th key={feature.id} title={feature.name}>
                                        <span className="mono" style={{ fontSize: 10 }}>{feature.id}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {SUBJECTS
                                .filter((subject) => {
                                    const lower = search.trim().toLowerCase();
                                    if (!lower) return true;
                                    return `${subject.name} ${subject.email}`.toLowerCase().includes(lower);
                                })
                                .map((subject) => (
                                    <tr key={subject.id}>
                                        <td>
                                            <b>{subject.name}</b>
                                            <small style={{ color: 'var(--text-tertiary)' }}>
                                                {subject.email}
                                            </small>
                                        </td>
                                        {CONSENT_FEATURES.map((feature) => {
                                            // deterministic mock: hash subject.id + feature.id
                                            const hash =
                                                (subject.id.charCodeAt(2) + feature.id.charCodeAt(0)) % 5;
                                            const state =
                                                feature.required || hash >= 3
                                                    ? 'granted'
                                                    : hash === 0
                                                        ? 'revoked'
                                                        : 'never';
                                            const symbol = state === 'granted' ? '✓' : state === 'revoked' ? '⌫' : '—';
                                            return (
                                                <td key={feature.id} className={`consent-cell ${state}`} title={state}>
                                                    {symbol}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
