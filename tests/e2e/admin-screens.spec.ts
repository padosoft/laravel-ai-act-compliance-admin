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

test.describe('Admin Alerts — dispatches', () => {
    // The admin SPA's `/api/admin/ai-act-compliance/*` calls reach the
    // companion Laravel backend in production. When running the SPA
    // standalone in CI (no Laravel served), the fetch 404s and the
    // iter-3 hardening clears the table + surfaces an error banner.
    // For these UI-shape tests we stub the live endpoint via
    // `page.route()` — allowed by R13 because the API is external to
    // THIS admin-SPA repo.
    const FIXTURE_DISPATCHES = [
        {
            id: 'ad_e2e_1',
            channel: 'slack',
            severity: 'critical',
            status: 'ok',
            title: 'Bias drift on demographic_parity',
            tenantId: 'tenant-a',
            metricName: 'demographic_parity',
            cohort: 'language=it',
            httpStatus: 200,
            sentAt: new Date(Date.now() - 60_000).toISOString(),
            errorMessage: null,
        },
        {
            id: 'ad_e2e_2',
            channel: 'discord',
            severity: 'high',
            status: 'transient_failure',
            title: 'Bias drift on equalized_odds',
            tenantId: 'tenant-b',
            metricName: 'equalized_odds',
            cohort: 'gender=f',
            httpStatus: 503,
            sentAt: new Date(Date.now() - 120_000).toISOString(),
            errorMessage: 'Discord webhook returned 503',
        },
    ];

    async function stubDispatches(page: import('@playwright/test').Page) {
        await page.route('**/alerts/dispatches', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(FIXTURE_DISPATCHES),
            });
        });
    }

    test('renders the dispatch table and filter bar', async ({ page }) => {
        await stubDispatches(page);
        await page.goto('/alerts');
        await expect(page.getByTestId('alerts-screen')).toBeVisible();
        await expect(page.getByTestId('alerts-table')).toBeVisible();
        await expect(page.getByTestId('alerts-filter-bar')).toBeVisible();
        // Row-only selector: anchor on `tr` to avoid matching nested
        // retry/open buttons that share the `alerts-table-row-` prefix.
        // Copilot iter-2 on PR #6.
        const rows = page.locator('tr[data-testid^="alerts-table-row-"]');
        expect(await rows.count()).toBeGreaterThan(0);
    });

    test('clicking a row opens the inline detail card', async ({ page }) => {
        await stubDispatches(page);
        await page.goto('/alerts');
        const row = page.locator('tr[data-testid^="alerts-table-row-"]').first();
        await row.click();
        await expect(page.locator('[data-testid^="alerts-detail-"]')).toBeVisible();
    });

    test('filtering by severity narrows the table', async ({ page }) => {
        await stubDispatches(page);
        await page.goto('/alerts');
        await page.getByTestId('alerts-filter-severity').selectOption('critical');
        const rows = page.locator('tr[data-testid^="alerts-table-row-"]');
        const count = await rows.count();
        for (let i = 0; i < count; i++) {
            await expect(rows.nth(i)).toContainText(/critical/i);
        }
    });
});

test.describe('Admin FRIA — assessments', () => {
    test('renders the assessment table', async ({ page }) => {
        await page.goto('/fria');
        await expect(page.getByTestId('fria-screen')).toBeVisible();
        await expect(page.getByTestId('fria-table')).toBeVisible();
        const rows = page.locator('[data-testid^="fria-row-"]');
        expect(await rows.count()).toBeGreaterThan(0);
    });

    test('opens the drawer when a FRIA row is clicked', async ({ page }) => {
        await page.goto('/fria');
        const firstRow = page.locator('[data-testid^="fria-row-"]').first();
        await firstRow.click();
        await expect(page.locator('[data-testid^="fria-detail-"]')).toBeVisible();
        await expect(page.getByTestId('fria-sign-off-button')).toBeVisible();
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

    // v1.2 — Pluggable parity metrics
    test('switching parity metric refreshes article evidence + page sub', async ({ page }) => {
        await page.goto('/bias');

        await expect(page.getByTestId('bias-metric-name')).toBeVisible();
        await expect(page.getByTestId('bias-page-sub')).toContainText('Demographic Parity');
        await expect(page.getByTestId('bias-article-evidence')).toContainText('AI Act Art. 10');

        // Switch to Calibration — surfaces ONLY Art. 15
        await page.getByTestId('bias-metric-name').selectOption('calibration');
        await expect(page.getByTestId('bias-page-sub')).toContainText('Calibration');
        await expect(page.getByTestId('bias-article-evidence')).toContainText('AI Act Art. 15');
        await expect(page.getByTestId('bias-article-evidence')).not.toContainText('AI Act Art. 10');
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

test.describe('Admin Regulatory feed — amendments', () => {
    // Stub /regulatory-amendments and /regulatory-amendments/poll so
    // the standalone vite preview run renders live-style data
    // without a Laravel backend. R13-OK because the API is external
    // to this admin-SPA repo.
    const FIXTURE = [
        {
            id: 101,
            tenantId: null,
            sourceDriver: 'eu-ai-act-rss',
            externalId: 'e2e-art-5',
            sourceUrl: 'https://example.test/art5',
            title: 'Amendment to Art. 5 — e2e fixture',
            summary: null,
            impactedClauses: ['AI Act Art. 5'],
            status: 'pending',
            severity: 'critical',
            publishedAt: Date.now() - 3_600_000,
            ingestedAt: Date.now() - 3_500_000,
            triagedAt: null,
            triagedBy: null,
            triageNotes: null,
        },
        {
            id: 102,
            tenantId: null,
            sourceDriver: 'eu-ai-act-rss',
            externalId: 'e2e-art-27',
            sourceUrl: 'https://example.test/art27',
            title: 'FRIA template — e2e fixture',
            summary: null,
            impactedClauses: ['AI Act Art. 27'],
            status: 'triaged',
            severity: 'high',
            publishedAt: Date.now() - 7_200_000,
            ingestedAt: Date.now() - 7_100_000,
            triagedAt: Date.now() - 3_000_000,
            triagedBy: 'dpo@example.test',
            triageNotes: null,
        },
    ];

    async function stubRegulatory(page: import('@playwright/test').Page) {
        await page.route('**/regulatory-amendments', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(FIXTURE),
            });
        });
        await page.route('**/regulatory-amendments/poll', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: { ingested: 1, skipped: 0, failures: {} } }),
            });
        });
    }

    test('renders the amendments table and filter bar', async ({ page }) => {
        await stubRegulatory(page);
        await page.goto('/regulatory');
        await expect(page.getByTestId('regulatory-screen')).toBeVisible();
        await expect(page.getByTestId('regulatory-table')).toBeVisible();
        await expect(page.getByTestId('regulatory-filter-bar')).toBeVisible();
        const rows = page.locator('tr[data-testid^="regulatory-table-row-"]');
        expect(await rows.count()).toBeGreaterThan(0);
    });

    test('clicking Poll now surfaces the ingest summary', async ({ page }) => {
        await stubRegulatory(page);
        await page.goto('/regulatory');
        await page.getByTestId('regulatory-poll-now').click();
        await expect(page.getByTestId('regulatory-poll-feedback')).toContainText(
            /ingested 1/i,
        );
    });

    test('filtering by status narrows the table', async ({ page }) => {
        await stubRegulatory(page);
        await page.goto('/regulatory');
        await page.getByTestId('regulatory-filter-status').selectOption('triaged');
        const rows = page.locator('tr[data-testid^="regulatory-table-row-"]');
        const count = await rows.count();
        for (let i = 0; i < count; i++) {
            await expect(rows.nth(i)).toContainText(/Triaged/i);
        }
    });
});

test.describe('Admin Tenants — DPO console', () => {
    const FIXTURE = {
        tenants: [
            {
                id: 1,
                slug: 'acme',
                name: 'Acme Inc.',
                subscription_tier: 'enterprise',
                status: 'active',
                dpo_email: 'dpo@acme.example',
                contact_email: 'compliance@acme.example',
                kpis: {
                    alert_routes: 3,
                    alert_dispatches: 47,
                    regulatory_amendments: 12,
                    pending_amendments: 2,
                },
            },
            {
                id: 2,
                slug: 'frozen',
                name: 'Frozen Co',
                subscription_tier: 'team',
                status: 'suspended',
                dpo_email: null,
                contact_email: null,
                kpis: {
                    alert_routes: 0,
                    alert_dispatches: 0,
                    regulatory_amendments: 0,
                    pending_amendments: 0,
                },
            },
        ],
        totals: {
            tenants_total: 2,
            tenants_active: 1,
            tenants_suspended: 1,
            alert_dispatches_total: 47,
            regulatory_amendments_total: 12,
            fria_assessments_total: 4,
            incidents_total: 6,
        },
    };

    async function stubTenants(page: import('@playwright/test').Page) {
        await page.route('**/tenants', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: FIXTURE }),
            });
        });
        await page.route('**/tenants/**', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: {} }),
            });
        });
    }

    test('renders KPI grid + tenant table', async ({ page }) => {
        await stubTenants(page);
        await page.goto('/tenants');
        await expect(page.getByTestId('tenants-screen')).toBeVisible();
        await expect(page.getByTestId('tenants-platform-kpi-grid')).toBeVisible();
        await expect(page.getByTestId('tenants-table')).toBeVisible();
        const rows = page.locator('tr[data-testid^="tenants-table-row-"]');
        expect(await rows.count()).toBeGreaterThan(0);
    });

    test('clicking a row opens the inline detail card with KV grid', async ({ page }) => {
        await stubTenants(page);
        await page.goto('/tenants');
        const row = page.locator('tr[data-testid^="tenants-table-row-"]').first();
        await row.click();
        await expect(page.locator('[data-testid^="tenants-detail-"]')).toBeVisible();
    });

    test('filtering by status narrows the table', async ({ page }) => {
        await stubTenants(page);
        await page.goto('/tenants');
        await page.getByTestId('tenants-filter-status').selectOption('suspended');
        const rows = page.locator('tr[data-testid^="tenants-table-row-"]');
        const count = await rows.count();
        for (let i = 0; i < count; i++) {
            await expect(rows.nth(i)).toContainText(/Suspended/i);
        }
    });
});
