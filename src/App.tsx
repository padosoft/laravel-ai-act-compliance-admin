import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { OverviewScreen } from './features/overview/OverviewScreen';
import { DsarScreen } from './features/dsar/DsarScreen';
import { ConsentScreen } from './features/consent/ConsentScreen';
import { RisksScreen } from './features/risks/RisksScreen';
import { IncidentsScreen } from './features/incidents/IncidentsScreen';
import { BiasScreen } from './features/bias/BiasScreen';
import { DpoScreen } from './features/dpo/DpoScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';

const links = [
  ['/', 'Overview'],
  ['/dsar', 'DSAR'],
  ['/consent', 'Consent'],
  ['/risks', 'Risks'],
  ['/incidents', 'Incidents'],
  ['/bias', 'Bias'],
  ['/dpo', 'DPO'],
  ['/settings', 'Settings'],
] as const;

export function App() {
  return (
    <BrowserRouter basename="/admin/ai-act-compliance">
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: 'Geist, system-ui, sans-serif' }}>
        <aside style={{ borderRight: '1px solid #e2e8f0', padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>AI Act Admin</h2>
          <nav style={{ display: 'grid', gap: 8 }}>
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} style={({ isActive }) => ({ textDecoration: 'none', color: isActive ? '#1d4ed8' : '#334155' })} end={to === '/'}>
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main style={{ padding: 24 }}>
          <Routes>
            <Route path="/" element={<OverviewScreen />} />
            <Route path="/dsar" element={<DsarScreen />} />
            <Route path="/consent" element={<ConsentScreen />} />
            <Route path="/risks" element={<RisksScreen />} />
            <Route path="/incidents" element={<IncidentsScreen />} />
            <Route path="/bias" element={<BiasScreen />} />
            <Route path="/dpo" element={<DpoScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
