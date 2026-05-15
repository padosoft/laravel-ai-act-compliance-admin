import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Shell } from './components/Shell';
import { OverviewScreen } from './features/overview/OverviewScreen';
import { AlertsScreen } from './features/alerts/AlertsScreen';
import { DsarScreen } from './features/dsar/DsarScreen';
import { ConsentScreen } from './features/consent/ConsentScreen';
import { RisksScreen } from './features/risks/RisksScreen';
import { FriaScreen } from './features/fria/FriaScreen';
import { IncidentsScreen } from './features/incidents/IncidentsScreen';
import { BiasScreen } from './features/bias/BiasScreen';
import { DpoScreen } from './features/dpo/DpoScreen';
import { RegulatoryScreen } from './features/regulatory/RegulatoryScreen';
import { TenantsScreen } from './features/tenants/TenantsScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';

import './styles-base.css';
import './styles-compliance.css';
import './styles-overrides.css';

function resolveBasename(): string {
    const fromEnv = import.meta.env.VITE_ADMIN_BASENAME;
    if (typeof fromEnv === 'string' && fromEnv.length > 0) {
        return fromEnv;
    }
    return import.meta.env.PROD ? '/admin/ai-act-compliance' : '/';
}

export function App() {
    return (
        <BrowserRouter basename={resolveBasename()}>
            <Routes>
                <Route element={<Shell />}>
                    <Route index element={<OverviewScreen />} />
                    <Route path="alerts" element={<AlertsScreen />} />
                    <Route path="dsar" element={<DsarScreen />} />
                    <Route path="consent" element={<ConsentScreen />} />
                    <Route path="risks" element={<RisksScreen />} />
                    <Route path="fria" element={<FriaScreen />} />
                    <Route path="incidents" element={<IncidentsScreen />} />
                    <Route path="bias" element={<BiasScreen />} />
                    <Route path="dpo" element={<DpoScreen />} />
                    <Route path="regulatory" element={<RegulatoryScreen />} />
                    <Route path="tenants" element={<TenantsScreen />} />
                    <Route path="settings" element={<SettingsScreen />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
