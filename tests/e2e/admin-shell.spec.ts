import { expect, test } from '@playwright/test';

/*
 * Playwright happy-path coverage for the admin SPA shell + navigation
 * between the 8 screens. Runs against the Vite dev server (port 5173)
 * by default; override via `AICOMPLIANCE_ADMIN_E2E_BASE` for CI runs
 * against a deployed cross-mount.
 */

test.describe('Admin shell + navigation', () => {
    test('lands on Overview and shows the KPI tiles', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByTestId('overview-screen')).toBeVisible();
        await expect(page.getByTestId('kpi-grid')).toBeVisible();
        await expect(page.getByTestId('kpi-dsar')).toBeVisible();
        await expect(page.getByTestId('kpi-incidents')).toBeVisible();
        await expect(page.getByTestId('kpi-consent')).toBeVisible();
        await expect(page.getByTestId('kpi-bias')).toBeVisible();
    });

    test('clicks each sidebar entry and lands on the right screen', async ({ page }) => {
        await page.goto('/');

        const pairs: { key: string; screenTestid: string }[] = [
            { key: 'alerts', screenTestid: 'alerts-screen' },
            { key: 'dsar', screenTestid: 'dsar-screen' },
            { key: 'consent', screenTestid: 'consent-screen' },
            { key: 'risks', screenTestid: 'risks-screen' },
            { key: 'fria', screenTestid: 'fria-screen' },
            { key: 'incidents', screenTestid: 'incidents-screen' },
            { key: 'human-review', screenTestid: 'human-review-screen' },
            { key: 'bias', screenTestid: 'bias-screen' },
            { key: 'dpo', screenTestid: 'dpo-screen' },
            { key: 'regulatory', screenTestid: 'regulatory-screen' },
            { key: 'tenants', screenTestid: 'tenants-screen' },
            { key: 'settings', screenTestid: 'settings-screen' },
            { key: 'overview', screenTestid: 'overview-screen' },
        ];

        for (const { key, screenTestid } of pairs) {
            await page.getByTestId(`ai-act-nav-${key}`).click();
            await expect(page.getByTestId(screenTestid)).toBeVisible();
            await expect(page.getByTestId(screenTestid)).toHaveAttribute('data-state', 'ready');
        }
    });

    test('command palette opens via topbar trigger and filters results', async ({ page }) => {
        await page.goto('/');
        // We click the topbar trigger rather than firing Control+K because
        // Chromium under Playwright sometimes routes Ctrl+K to the browser
        // chrome (URL bar search) before the page-level keydown listener
        // sees it. The trigger button is the same code path the keyboard
        // shortcut hits — both call setPaletteOpen(true).
        await page.getByTestId('topbar-palette-open').click();
        await expect(page.getByPlaceholder(/search records/i)).toBeVisible();

        await page.getByPlaceholder(/search records/i).fill('incident');
        // At least one Navigate match (Incident Manager) should remain
        await expect(page.locator('.palette-section', { hasText: /Navigate/i })).toBeVisible();
    });

    test('theme toggle flips data-theme on the html root', async ({ page }) => {
        await page.goto('/');
        const initialTheme = await page.locator('html').getAttribute('data-theme');
        await page.getByTitle('Toggle theme').click();
        const newTheme = await page.locator('html').getAttribute('data-theme');
        expect(newTheme).not.toBe(initialTheme);
    });
});
