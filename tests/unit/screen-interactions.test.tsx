import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { api } from '../../src/api/client';
import type { BiasMetricMeta } from '../../src/lib/mock-data';

// v1.2 — BiasScreen fires a best-effort fetch via the shared axios
// client to /bias/metrics on mount. Stub `api.get` to reject by
// default so the screen falls back to the fixture; restore in
// afterEach (R16 — global mocks are restored after every test).
beforeEach(() => {
    vi.spyOn(api, 'get').mockRejectedValue(new Error('test: endpoint unreachable'));
});
afterEach(() => {
    vi.restoreAllMocks();
});

import { AlertsScreen } from '../../src/features/alerts/AlertsScreen';
import { DsarScreen } from '../../src/features/dsar/DsarScreen';
import { ConsentScreen } from '../../src/features/consent/ConsentScreen';
import { RisksScreen } from '../../src/features/risks/RisksScreen';
import { FriaScreen } from '../../src/features/fria/FriaScreen';
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
        const beforeRows = screen.queryAllByTestId(/^dsar-row-/).length;
        fireEvent.change(select, { target: { value: 'pending' } });
        const afterRows = screen.queryAllByTestId(/^dsar-row-/);
        // Filter must narrow (or keep equal — if everything was already pending)
        expect(afterRows.length).toBeLessThanOrEqual(beforeRows);
        // Every remaining row must be pending, not completed/rejected
        afterRows.forEach((row) => {
            expect(row.textContent).not.toMatch(/Completed|Rejected/);
        });
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

describe('Alerts screen interactions', () => {
    it('renders dispatch rows from the fixture by default', () => {
        withRouter(<AlertsScreen />);
        // Anchored selector — un-anchored `^alerts-table-row-` would
        // also match nested retry/open buttons whose testid shares the
        // same prefix. Copilot iter-2 on PR #6.
        const rows = screen.getAllByTestId(/^alerts-table-row-[a-z]+_[0-9]+$/);
        expect(rows.length).toBeGreaterThanOrEqual(4);
    });

    it('filters rows by channel when the channel select changes', () => {
        withRouter(<AlertsScreen />);
        const before = screen.queryAllByTestId(/^alerts-table-row-[a-z]+_[0-9]+$/).length;
        const select = screen.getByTestId('alerts-filter-channel') as HTMLSelectElement;
        fireEvent.change(select, { target: { value: 'slack' } });
        const after = screen.queryAllByTestId(/^alerts-table-row-[a-z]+_[0-9]+$/);
        expect(after.length).toBeLessThanOrEqual(before);
        after.forEach((row) => {
            expect(row.textContent).toContain('slack');
        });
    });

    it('filters by status (transient_failure surfaces retry buttons)', () => {
        withRouter(<AlertsScreen />);
        fireEvent.change(screen.getByTestId('alerts-filter-status'), {
            target: { value: 'transient_failure' },
        });
        const retryButtons = screen.queryAllByTestId(/^alerts-retry-[a-z]+_[0-9]+$/);
        expect(retryButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('clicking a row opens the inline detail card', () => {
        withRouter(<AlertsScreen />);
        const firstRow = screen.getAllByTestId(/^alerts-table-row-[a-z]+_[0-9]+$/)[0];
        fireEvent.click(firstRow);
        const detail = screen.getAllByTestId(/^alerts-detail-/)[0];
        expect(detail).toBeInTheDocument();
    });

    it('all 3 filter selects expose accessible labels (R15)', () => {
        withRouter(<AlertsScreen />);
        expect(screen.getByLabelText(/channel/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/severity/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    });

    it('uses an empty successful API response as the source of truth', async () => {
        vi.spyOn(api, 'get').mockResolvedValueOnce({ data: [] });
        withRouter(<AlertsScreen />);
        await waitFor(() => {
            expect(screen.getByTestId('alerts-empty')).toBeInTheDocument();
        });
        expect(screen.queryAllByTestId(/^alerts-table-row-/)).toHaveLength(0);
        expect(screen.queryByTestId('alerts-fetch-error')).not.toBeInTheDocument();
    });

    it('shows an explicit load error on server failures instead of fixture fallback', async () => {
        vi.spyOn(api, 'get').mockRejectedValueOnce({
            isAxiosError: true,
            response: { status: 500 },
        });
        withRouter(<AlertsScreen />);
        await waitFor(() => {
            expect(screen.getByTestId('alerts-fetch-error')).toHaveTextContent('HTTP 500');
        });
        expect(screen.queryAllByTestId(/^alerts-table-row-/)).toHaveLength(0);
    });

    it('retry button calls the API and shows success feedback', async () => {
        const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({ data: {} });
        withRouter(<AlertsScreen />);
        const retryButton = screen.getByTestId('alerts-retry-ad_003');
        fireEvent.click(retryButton);
        expect(postSpy).toHaveBeenCalledWith('/alerts/dispatches/ad_003/retry');
        await waitFor(() => {
            expect(screen.getByTestId('alerts-retry-feedback')).toHaveTextContent('Retry requested.');
        });
    });

    it('retry button shows loading state and failure feedback', async () => {
        const deferred: { reject?: (error: Error) => void } = {};
        vi.spyOn(api, 'post').mockImplementationOnce(
            () =>
                new Promise((_, reject) => {
                    deferred.reject = reject as (error: Error) => void;
                }),
        );
        withRouter(<AlertsScreen />);
        const retryButton = screen.getByTestId('alerts-retry-ad_003');
        fireEvent.click(retryButton);
        expect(retryButton).toBeDisabled();
        expect(retryButton).toHaveTextContent('Retrying…');
        expect(deferred.reject).toBeDefined();
        deferred.reject?.(new Error('boom'));
        await waitFor(() => {
            expect(screen.getByTestId('alerts-retry-feedback')).toHaveTextContent('Retry failed: boom');
        });
    });

    it('pressing Enter on Retry does not also open the row details', async () => {
        withRouter(<AlertsScreen />);
        expect(screen.queryByTestId('alerts-detail-ad_003')).not.toBeInTheDocument();
        const retryButton = screen.getByTestId('alerts-retry-ad_003');
        fireEvent.keyDown(retryButton, { key: 'Enter' });
        await waitFor(() => {
            expect(screen.queryByTestId('alerts-detail-ad_003')).not.toBeInTheDocument();
        });
    });
});

describe('FRIA screen interactions', () => {
    it('renders all assessment rows from the fixture by default', () => {
        withRouter(<FriaScreen />);
        const rows = screen.getAllByTestId(/^fria-row-/);
        expect(rows.length).toBeGreaterThanOrEqual(3);
    });

    it('opens the drawer when a row is clicked', () => {
        withRouter(<FriaScreen />);
        const firstRow = screen.getAllByTestId(/^fria-row-/)[0];
        fireEvent.click(firstRow);
        const detail = screen.getAllByTestId(/^fria-detail-/)[0];
        expect(detail).toBeInTheDocument();
    });

    it('filters table by status when the status select changes', () => {
        withRouter(<FriaScreen />);
        const select = screen.getByTestId('fria-filter-status') as HTMLSelectElement;
        const before = screen.queryAllByTestId(/^fria-row-/).length;
        fireEvent.change(select, { target: { value: 'review_due' } });
        const after = screen.queryAllByTestId(/^fria-row-/);
        expect(after.length).toBeLessThanOrEqual(before);
        after.forEach((row) => {
            expect(row.textContent).toMatch(/Review due/);
        });
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

    // v1.2 — Pluggable parity metrics
    it('renders the parity-metric selector with the 3 reference metrics', () => {
        withRouter(<BiasScreen />);
        const select = screen.getByTestId('bias-metric-name') as HTMLSelectElement;
        expect(select.options.length).toBeGreaterThanOrEqual(3);
        const labels = Array.from(select.options).map((opt) => opt.textContent ?? '');
        expect(labels).toContain('Demographic Parity');
        expect(labels).toContain('Equalized Odds');
        expect(labels).toContain('Calibration');
    });

    it('parity-metric label appears in the page sub when the selection changes', () => {
        withRouter(<BiasScreen />);
        expect(screen.getByTestId('bias-page-sub').textContent).toContain('Demographic Parity');

        const select = screen.getByTestId('bias-metric-name') as HTMLSelectElement;
        fireEvent.change(select, { target: { value: 'equalized_odds' } });

        expect(screen.getByTestId('bias-page-sub').textContent).toContain('Equalized Odds');
    });

    it('article-evidence row renders ArticleRef chips for the active metric', () => {
        withRouter(<BiasScreen />);
        const evidence = screen.getByTestId('bias-article-evidence');
        // Demographic Parity surfaces Art. 10 + Art. 15
        expect(evidence.textContent).toContain('AI Act Art. 10');
        expect(evidence.textContent).toContain('AI Act Art. 15');

        // Calibration surfaces ONLY Art. 15
        const select = screen.getByTestId('bias-metric-name') as HTMLSelectElement;
        fireEvent.change(select, { target: { value: 'calibration' } });
        const evidenceAfter = screen.getByTestId('bias-article-evidence');
        expect(evidenceAfter.textContent).toContain('AI Act Art. 15');
        expect(evidenceAfter.textContent).not.toContain('AI Act Art. 10');
    });

    it('parity-metric select has an accessible name via the <label htmlFor> binding (R15)', () => {
        withRouter(<BiasScreen />);
        const select = screen.getByLabelText(/parity metric/i);
        expect(select).toBeInTheDocument();
        expect(select.getAttribute('data-testid')).toBe('bias-metric-name');
    });

    it('switching parity metric ACTUALLY recomputes the overall accuracy badge', () => {
        // Copilot review on PR #5 caught a stale-data bug where
        // switching metric only updated the label/article evidence
        // while the chart kept the demographic-parity numbers. The
        // overall accuracy badge MUST reflect the per-metric
        // transform now.
        withRouter(<BiasScreen />);
        const beforeText = screen.getByTestId('bias-overall').textContent ?? '';
        const select = screen.getByTestId('bias-metric-name') as HTMLSelectElement;
        fireEvent.change(select, { target: { value: 'calibration' } });
        const afterText = screen.getByTestId('bias-overall').textContent ?? '';
        expect(afterText).not.toBe(beforeText);
    });

    it('live /bias/metrics 200 response populates the dropdown from the registry payload', async () => {
        // Copilot review iter-3 on PR #5 (commit 5169694) flagged
        // that the live-fetch 200 path had no test — a regression
        // that ignored or mis-parsed the BE payload would pass. This
        // test mocks the shared axios client's GET and verifies the
        // registry-supplied custom metric appears in the dropdown
        // after the async useEffect has resolved.
        const apiSpy = vi.spyOn(api, 'get').mockResolvedValueOnce({
            data: [
                {
                    id: 'host_custom_fairness',
                    label: 'Host Custom Fairness',
                    description: 'Host-supplied custom metric for v1.2 test.',
                    articleEvidence: ['AI Act Art. 10'],
                },
            ],
        } as unknown as { data: BiasMetricMeta[] });

        withRouter(<BiasScreen />);

        // waitFor() retries until the registry-supplied option lands
        // in the DOM, giving the async useEffect time to resolve.
        await waitFor(() => {
            const dropdown = screen.getByTestId('bias-metric-name') as HTMLSelectElement;
            const labels = Array.from(dropdown.options).map((opt) => opt.textContent ?? '');
            expect(labels).toContain('Host Custom Fairness');
        });

        apiSpy.mockRestore();
    });
});

describe('Settings screen interactions', () => {
    it('toggles a feature flag when the switch is clicked', () => {
        withRouter(<SettingsScreen />);
        const toggle = screen.getByTestId('settings-flag-toggle-disclosure');
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
