import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { api } from '../../src/api/client';

// v1.2 — BiasScreen fires a best-effort fetch via the shared axios
// client on mount; stub it to reject so the rendered tree falls back
// to the fixture. Restore in afterEach.
beforeEach(() => {
    vi.spyOn(api, 'get').mockRejectedValue(new Error('test: endpoint unreachable'));
});
afterEach(() => {
    vi.restoreAllMocks();
});

import { OverviewScreen } from '../../src/features/overview/OverviewScreen';
import { AlertsScreen } from '../../src/features/alerts/AlertsScreen';
import { DsarScreen } from '../../src/features/dsar/DsarScreen';
import { ConsentScreen } from '../../src/features/consent/ConsentScreen';
import { RisksScreen } from '../../src/features/risks/RisksScreen';
import { HumanReviewScreen } from '../../src/features/human-review/HumanReviewScreen';
import { FriaScreen } from '../../src/features/fria/FriaScreen';
import { IncidentsScreen } from '../../src/features/incidents/IncidentsScreen';
import { BiasScreen } from '../../src/features/bias/BiasScreen';
import { DpoScreen } from '../../src/features/dpo/DpoScreen';
import { RegulatoryScreen } from '../../src/features/regulatory/RegulatoryScreen';
import { TenantsScreen } from '../../src/features/tenants/TenantsScreen';
import { SettingsScreen } from '../../src/features/settings/SettingsScreen';

function renderWithRouter(node: React.ReactNode) {
    return render(<MemoryRouter>{node}</MemoryRouter>);
}

describe('Compliance admin screens render', () => {
    it('OverviewScreen renders kpi tiles and feed', () => {
        const { getByTestId } = renderWithRouter(<OverviewScreen />);
        expect(getByTestId('overview-screen')).toBeTruthy();
        expect(getByTestId('kpi-grid')).toBeTruthy();
        expect(getByTestId('kpi-dsar')).toBeTruthy();
        expect(getByTestId('activity-feed')).toBeTruthy();
        expect(getByTestId('dsar-depth-chart')).toBeTruthy();
        expect(getByTestId('attestation-card')).toBeTruthy();
    });

    it('AlertsScreen renders filter bar, table, and live pill', () => {
        const { getByTestId } = renderWithRouter(<AlertsScreen />);
        expect(getByTestId('alerts-screen')).toBeTruthy();
        expect(getByTestId('alerts-filter-bar')).toBeTruthy();
        expect(getByTestId('alerts-table')).toBeTruthy();
        expect(getByTestId('alerts-live-pill')).toBeTruthy();
    });

    it('DsarScreen renders the table and filter bar', () => {
        const { getByTestId } = renderWithRouter(<DsarScreen />);
        expect(getByTestId('dsar-screen')).toBeTruthy();
        expect(getByTestId('dsar-table')).toBeTruthy();
        expect(getByTestId('dsar-filter-bar')).toBeTruthy();
    });

    it('ConsentScreen renders feature grid', () => {
        const { getByTestId } = renderWithRouter(<ConsentScreen />);
        expect(getByTestId('consent-screen')).toBeTruthy();
        expect(getByTestId('consent-feature-grid')).toBeTruthy();
    });

    it('RisksScreen renders summary tiles and grid', () => {
        const { getByTestId } = renderWithRouter(<RisksScreen />);
        expect(getByTestId('risks-screen')).toBeTruthy();
        expect(getByTestId('risk-summary')).toBeTruthy();
        expect(getByTestId('risk-grid')).toBeTruthy();
    });

    it('HumanReviewScreen renders the oversight table with delegation-grant rows', () => {
        const { getByTestId, getAllByText, getByText } = render(
            <MemoryRouter><HumanReviewScreen /></MemoryRouter>,
        );
        expect(getByTestId('human-review-screen')).toBeInTheDocument();
        expect(getByTestId('human-review-filter-bar')).toBeInTheDocument();
        // Fixture rows: the IAM bridge subject type gets a first-class label.
        expect(getAllByText('Delegation grant').length).toBeGreaterThan(0);
        expect(getByText('dgr_01J9DEMO0001')).toBeInTheDocument();
    });

    it('FriaScreen renders filter bar and assessment table', () => {
        const { getByTestId } = renderWithRouter(<FriaScreen />);
        expect(getByTestId('fria-screen')).toBeTruthy();
        expect(getByTestId('fria-filter-bar')).toBeTruthy();
        expect(getByTestId('fria-table')).toBeTruthy();
    });

    it('IncidentsScreen renders kanban with 4 lanes', () => {
        const { getByTestId } = renderWithRouter(<IncidentsScreen />);
        expect(getByTestId('incidents-screen')).toBeTruthy();
        expect(getByTestId('incident-kanban')).toBeTruthy();
        expect(getByTestId('incident-lane-open')).toBeTruthy();
        expect(getByTestId('incident-lane-triage')).toBeTruthy();
        expect(getByTestId('incident-lane-mitigating')).toBeTruthy();
        expect(getByTestId('incident-lane-closed')).toBeTruthy();
    });

    it('BiasScreen renders cohort panels and overall accuracy', () => {
        const { getByTestId } = renderWithRouter(<BiasScreen />);
        expect(getByTestId('bias-screen')).toBeTruthy();
        expect(getByTestId('bias-panels')).toBeTruthy();
        expect(getByTestId('bias-overall')).toBeTruthy();
    });

    it('DpoScreen renders data flow, retention, deletion log', () => {
        const { getByTestId } = renderWithRouter(<DpoScreen />);
        expect(getByTestId('dpo-screen')).toBeTruthy();
        expect(getByTestId('dpo-data-flow')).toBeTruthy();
        expect(getByTestId('dpo-retention')).toBeTruthy();
        expect(getByTestId('dpo-deletion')).toBeTruthy();
    });

    it('RegulatoryScreen renders amendments table + filter bar + poll button', () => {
        const { getByTestId } = renderWithRouter(<RegulatoryScreen />);
        expect(getByTestId('regulatory-screen')).toBeTruthy();
        expect(getByTestId('regulatory-filter-bar')).toBeTruthy();
        expect(getByTestId('regulatory-table')).toBeTruthy();
        expect(getByTestId('regulatory-poll-now')).toBeTruthy();
    });

    it('TenantsScreen renders platform KPI grid + filter bar + table', () => {
        const { getByTestId } = renderWithRouter(<TenantsScreen />);
        expect(getByTestId('tenants-screen')).toBeTruthy();
        expect(getByTestId('tenants-platform-kpi-grid')).toBeTruthy();
        expect(getByTestId('tenants-filter-bar')).toBeTruthy();
        expect(getByTestId('tenants-table')).toBeTruthy();
    });

    it('SettingsScreen renders flags, env vars, webhooks', () => {
        const { getByTestId } = renderWithRouter(<SettingsScreen />);
        expect(getByTestId('settings-screen')).toBeTruthy();
        expect(getByTestId('settings-flags')).toBeTruthy();
        expect(getByTestId('settings-env')).toBeTruthy();
        expect(getByTestId('settings-webhooks')).toBeTruthy();
    });
});
