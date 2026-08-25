import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { Shell } from '../../src/components/Shell';
import { OverviewScreen } from '../../src/features/overview/OverviewScreen';
import { DsarScreen } from '../../src/features/dsar/DsarScreen';
import { RisksScreen } from '../../src/features/risks/RisksScreen';

function renderShell(initialRoute = '/') {
    return render(
        <MemoryRouter initialEntries={[initialRoute]}>
            <Routes>
                <Route element={<Shell />}>
                    <Route index element={<OverviewScreen />} />
                    <Route path="dsar" element={<DsarScreen />} />
                    <Route path="risks" element={<RisksScreen />} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );
}

describe('Shell — sidebar + topbar', () => {
    it('renders the brand mark, the navigation entries, and the user chip', () => {
        renderShell();
        expect(screen.getByText('AI Act Compliance')).toBeInTheDocument();
        // Two grouped sections of nav items + 1 user chip name
        for (const key of ['overview', 'dsar', 'consent', 'risks', 'incidents', 'human-review', 'bias', 'dpo', 'settings']) {
            expect(screen.getByTestId(`ai-act-nav-${key}`)).toBeInTheDocument();
        }
        expect(screen.getByText('Giulia Amalfi')).toBeInTheDocument();
    });

    it('shows the live pulse with current timestamp in the topbar', () => {
        renderShell();
        expect(screen.getByTestId('topbar-live')).toBeInTheDocument();
    });

    it('marks the current route as active in the sidebar', () => {
        renderShell('/dsar');
        const dsarLink = screen.getByTestId('ai-act-nav-dsar');
        expect(dsarLink.className).toMatch(/active/);
    });

    it('shows the topbar page title for the current route', () => {
        renderShell('/risks');
        expect(screen.getByTestId('topbar-page-title')).toHaveTextContent(/risk register/i);
    });

    it('the palette trigger opens the command palette', () => {
        renderShell();
        fireEvent.click(screen.getByTestId('topbar-palette-open'));
        expect(screen.getByPlaceholderText(/search records/i)).toBeInTheDocument();
    });

    it('the brand sub-line shows the package version', () => {
        renderShell();
        expect(screen.getByText(/Padosoft · v6\.0/i)).toBeInTheDocument();
    });

    it('the route data attribute on the app reflects the current url', () => {
        renderShell('/dsar');
        const app = screen.getByTestId('ai-act-compliance-app');
        expect(app).toHaveAttribute('data-route', 'dsar');
    });
});
