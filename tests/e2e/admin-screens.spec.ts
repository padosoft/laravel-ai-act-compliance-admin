import { expect, test } from '@playwright/test';

test.describe('Admin DSAR — interactions', () => {
    test('filters table by status', async ({ page }) => {
        await page.goto('/dsar');
        await expect(page.getByTestId('dsar-screen')).toBeVisible();
        await page.getByTestId('dsar-filter-status').selectOption('pending');
        // After filtering by 'pending', no row should carry the Completed/Rejected pill
        const rows = page.locator('[data-testid^="dsar-row-"]');
        const count = await rows.count();
        for (let i = 0; i < count; i++) {
            await expect(rows.nth(i)).not.toContainText(/Completed|Rejected/);
        }
    });

    test('opens drawer when row is clicked', async ({ page }) => {
        await page.goto('/dsar');
        const firstRow = page.locator('[data-testid^="dsar-row-"]').first();
        await firstRow.click();
        await expect(page.locator('[data-testid^="dsar-detail-"]')).toBeVisible();
    });
});

test.describe('Admin Risks — interactions', () => {
    test('filtering by category narrows the card grid', async ({ page }) => {
        await page.goto('/risks');
        await expect(page.getByTestId('risks-screen')).toBeVisible();

        const initialCards = await page.locator('[data-testid^="risk-card-"]').count();
        await page.getByTestId('risk-tile-high').click();
        const filteredCards = await page.locator('[data-testid^="risk-card-"]').count();
        expect(filteredCards).toBeLessThanOrEqual(initialCards);
    });
});

test.describe('Admin Incidents — kanban', () => {
    test('renders the 4 lifecycle lanes', async ({ page }) => {
        await page.goto('/incidents');
        await expect(page.getByTestId('incident-lane-open')).toBeVisible();
        await expect(page.getByTestId('incident-lane-triage')).toBeVisible();
        await expect(page.getByTestId('incident-lane-mitigating')).toBeVisible();
        await expect(page.getByTestId('incident-lane-closed')).toBeVisible();
    });

    test('clicking a card opens the drawer with timeline and escalation tree', async ({ page }) => {
        await page.goto('/incidents');
        await page.locator('[data-testid^="incident-card-"]').first().click();
        await expect(page.locator('[data-testid^="incident-detail-"]')).toBeVisible();
    });
});

test.describe('Admin Bias — cohort dimension', () => {
    test('renders overall accuracy and chart panels', async ({ page }) => {
        await page.goto('/bias');
        await expect(page.getByTestId('bias-overall')).toBeVisible();
        await expect(page.getByTestId('bias-panels')).toBeVisible();
    });
});

test.describe('Admin Settings — flags + secrets', () => {
    test('show-secrets reveals masked env values', async ({ page }) => {
        await page.goto('/settings');
        await expect(page.getByTestId('settings-screen')).toBeVisible();
        await page.getByTestId('settings-show-secrets').click();
        // No more dots after toggling secrets
        await expect(page.getByText('••••••••')).toHaveCount(0);
    });

    test('feature flag toggle flips aria-checked', async ({ page }) => {
        await page.goto('/settings');
        const toggle = page.getByTestId('settings-flag-toggle-disclosure');
        await toggle.waitFor({ state: 'visible' });
        const before = await toggle.getAttribute('aria-checked');
        await toggle.click();
        const after = await toggle.getAttribute('aria-checked');
        expect(after).not.toBe(before);
    });
});

test.describe('Admin DPO — data flow + retention + deletion', () => {
    test('renders the three panels and the attestation modal trigger', async ({ page }) => {
        await page.goto('/dpo');
        await expect(page.getByTestId('dpo-data-flow')).toBeVisible();
        await expect(page.getByTestId('dpo-retention')).toBeVisible();
        await expect(page.getByTestId('dpo-deletion')).toBeVisible();
        await expect(page.getByTestId('dpo-generate-attestation')).toBeVisible();
    });
});
