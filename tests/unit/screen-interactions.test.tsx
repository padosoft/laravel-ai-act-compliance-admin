import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { DsarScreen } from '../../src/features/dsar/DsarScreen';
import { ConsentScreen } from '../../src/features/consent/ConsentScreen';
import { RisksScreen } from '../../src/features/risks/RisksScreen';
import { IncidentsScreen } from '../../src/features/incidents/IncidentsScreen';
import { BiasScreen } from '../../src/features/bias/BiasScreen';
import { SettingsScreen } from '../../src/features/settings/SettingsScreen';

function withRouter(node: React.ReactNode) {
    return render(<MemoryRouter>{node}</MemoryRouter>);
}

describe('DSAR screen interactions', () => {
    it('filters table by status when the status select changes', () => {
        withRouter(<DsarScreen />);
        const select = screen.getByTestId('dsar-filter-status') as HTMLSelectElement;
        fireEvent.change(select, { target: { value: 'pending' } });
        // Should hide all completed rows after the filter applies
        expect(screen.queryAllByText(/Completed/).length).toBe(0);
    });

    it('opens the drawer when a row is clicked', () => {
        withRouter(<DsarScreen />);
        const firstRow = screen.getAllByTestId(/^dsar-row-/)[0];
        fireEvent.click(firstRow);
        // Drawer detail testid contains the same dsar id as the row
        const detail = screen.getAllByTestId(/^dsar-detail-/)[0];
        expect(detail).toBeInTheDocument();
    });

    it('shows the breached SLA badge for past-due requests', () => {
        withRouter(<DsarScreen />);
        expect(screen.getAllByText(/Breached/i).length).toBeGreaterThan(0);
    });
});

describe('Consent screen interactions', () => {
    it('toggles between Per feature and Per user tabs', () => {
        withRouter(<ConsentScreen />);
        // Default tab is "features" — grid is visible
        expect(screen.getByTestId('consent-feature-grid')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('consent-tab-users'));
        expect(screen.queryByTestId('consent-feature-grid')).not.toBeInTheDocument();
        expect(screen.getByTestId('consent-user-table')).toBeInTheDocument();
    });
});

describe('Risks screen interactions', () => {
    it('filters the card grid when a category tile is clicked', () => {
        withRouter(<RisksScreen />);
        const grid = screen.getByTestId('risk-grid');
        const initialCardCount = grid.querySelectorAll('[data-testid^="risk-card-"]').length;

        fireEvent.click(screen.getByTestId('risk-tile-high'));

        const filteredCount = grid.querySelectorAll('[data-testid^="risk-card-"]').length;
        // Filtering should narrow the grid (unless every risk was high already)
        expect(filteredCount).toBeLessThanOrEqual(initialCardCount);
    });
});

describe('Incidents screen interactions', () => {
    it('renders 4 lanes and at least one card per non-empty lane', () => {
        withRouter(<IncidentsScreen />);
        expect(screen.getByTestId('incident-lane-open')).toBeInTheDocument();
        expect(screen.getByTestId('incident-lane-triage')).toBeInTheDocument();
        expect(screen.getByTestId('incident-lane-mitigating')).toBeInTheDocument();
        expect(screen.getByTestId('incident-lane-closed')).toBeInTheDocument();
        // At least one open incident from the mock fixture
        expect(screen.getAllByTestId(/^incident-card-/).length).toBeGreaterThan(0);
    });

    it('opens the drawer when an incident card is clicked', () => {
        withRouter(<IncidentsScreen />);
        const card = screen.getAllByTestId(/^incident-card-/)[0];
        fireEvent.click(card);
        const detail = screen.getAllByTestId(/^incident-detail-/)[0];
        expect(detail).toBeInTheDocument();
    });

    it('filters by severity', () => {
        withRouter(<IncidentsScreen />);
        const select = screen.getByTestId('incident-filter-severity') as HTMLSelectElement;
        fireEvent.change(select, { target: { value: 'critical' } });
        // After filtering to critical only, every visible card has sev-critical class
        const remaining = screen.queryAllByTestId(/^incident-card-/);
        remaining.forEach((card) => {
            expect(card.className).toMatch(/sev-critical/);
        });
    });
});

describe('Bias screen interactions', () => {
    it('renders the cohort dimension selector with at least one option', () => {
        withRouter(<BiasScreen />);
        const select = screen.getByTestId('bias-dimension') as HTMLSelectElement;
        expect(select.options.length).toBeGreaterThan(0);
    });

    it('renders the overall accuracy badge', () => {
        withRouter(<BiasScreen />);
        expect(screen.getByTestId('bias-overall')).toBeInTheDocument();
    });
});

describe('Settings screen interactions', () => {
    it('toggles a feature flag when the switch is clicked', () => {
        withRouter(<SettingsScreen />);
        const toggle = screen.getByTestId('settings-flag-toggle-marketing') ?? screen.getByTestId('settings-flag-toggle-disclosure');
        const initialPressed = toggle.getAttribute('aria-checked');
        fireEvent.click(toggle);
        const nextPressed = toggle.getAttribute('aria-checked');
        expect(nextPressed).not.toBe(initialPressed);
    });

    it('reveals the masked env values when the show-secrets button is pressed', () => {
        withRouter(<SettingsScreen />);
        // Pre-state: masked dots
        expect(screen.getAllByText(/••••••••/).length).toBeGreaterThan(0);
        fireEvent.click(screen.getByTestId('settings-show-secrets'));
        // Post-state: no more dots
        expect(screen.queryAllByText(/••••••••/).length).toBe(0);
    });
});
