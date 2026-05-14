<h1 align="center">laravel-ai-act-compliance-admin</h1>

<p align="center">
  <b>The drop-in React admin SPA for Laravel AI Act + GDPR compliance ops.</b><br/>
  8 production-grade screens. Pixel-ported from a Claude Design handoff. Cross-mounts into any Laravel app.
</p>

<p align="center">
  <a href="https://packagist.org/packages/padosoft/laravel-ai-act-compliance-admin"><img src="https://img.shields.io/packagist/v/padosoft/laravel-ai-act-compliance-admin.svg?style=flat-square&color=blueviolet" alt="Latest Version on Packagist"></a>
  <a href="https://packagist.org/packages/padosoft/laravel-ai-act-compliance-admin"><img src="https://img.shields.io/packagist/dt/padosoft/laravel-ai-act-compliance-admin.svg?style=flat-square" alt="Total Downloads"></a>
  <a href="https://github.com/padosoft/laravel-ai-act-compliance-admin/actions"><img src="https://img.shields.io/github/actions/workflow/status/padosoft/laravel-ai-act-compliance-admin/ci.yml?branch=main&style=flat-square&label=CI" alt="CI"></a>
  <a href="LICENSE.md"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License"></a>
  <a href="#prerequisites"><img src="https://img.shields.io/badge/React-19-149eca?style=flat-square&logo=react&logoColor=white" alt="React 19"></a>
  <a href="#prerequisites"><img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5"></a>
  <a href="#prerequisites"><img src="https://img.shields.io/badge/PHP-8.2%2B-777BB4?style=flat-square&logo=php&logoColor=white" alt="PHP 8.2+"></a>
  <a href="#prerequisites"><img src="https://img.shields.io/badge/Laravel-11%20%7C%2012%20%7C%2013-FF2D20?style=flat-square&logo=laravel&logoColor=white" alt="Laravel 11/12/13"></a>
  <a href="#-the-eight-screens"><img src="https://img.shields.io/badge/screens-8-success?style=flat-square" alt="8 screens"></a>
  <a href="#-accessibility"><img src="https://img.shields.io/badge/WCAG-2.1%20AA-success?style=flat-square" alt="WCAG 2.1 AA"></a>
  <a href="#-ai-vibe-coding-pack-included"><img src="https://img.shields.io/badge/🚀-AI%20vibe--coding%20pack-yellow?style=flat-square" alt="AI vibe-coding pack"></a>
</p>

<p align="center">
  <a href="#-why-this-exists">Why</a> ·
  <a href="#-the-eight-screens">Screens</a> ·
  <a href="#-killer-features">Killer features</a> ·
  <a href="#-quick-start-jr-proof-5-minutes">Quick start</a> ·
  <a href="#-cross-mount">Cross-mount</a> ·
  <a href="#-design-system">Design system</a> ·
  <a href="#-customising">Customise</a> ·
  <a href="#-testing">Testing</a> ·
  <a href="#-accessibility">A11y</a> ·
  <a href="#-ai-vibe-coding-pack-included">Vibe-coding pack</a>
</p>

---

## 🚀 AI vibe-coding pack included

Every `padosoft/*` package ships with a `.claude/` directory containing:

- **Skills** (`.claude/skills/`) — pre-loaded by Claude Code when you open the project. The admin SPA skills know how to add a new screen, wire a TanStack Query hook to a controller, and keep `data-testid` selectors consistent.
- **Agents** (`.claude/agents/`) — `screen-reviewer` validates a new screen against the 8-screen pattern + accessibility checklist before you push.
- **Rules** (`.claude/rules/`) — codified rules from real Copilot findings (every interactive `<input>` carries a `<label htmlFor>` or `aria-label`; every async screen exposes `data-state="loading|ready|error|empty"`; ⌘K palette must restore focus to the trigger on close).

`composer require padosoft/laravel-ai-act-compliance-admin` and the pack is auto-discovered when you open the project in Claude Code. **No setup required.** If you don't use Claude Code, the pack is invisible — it never affects runtime behaviour.

---

## 📖 Table of contents

- [Why this exists](#-why-this-exists)
- [The eight screens](#-the-eight-screens)
- [Killer features](#-killer-features)
- [Prerequisites](#prerequisites)
- [Quick start (jr-proof, 5 minutes)](#-quick-start-jr-proof-5-minutes)
- [Cross-mount](#-cross-mount)
- [Design system](#-design-system)
- [Customising](#-customising)
- [Testing](#-testing)
- [Accessibility](#-accessibility)
- [Companion package: backend](#-companion-package-backend)
- [Roadmap](#-roadmap)
- [Changelog](#-changelog)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Why this exists

You installed [`padosoft/laravel-ai-act-compliance`](https://github.com/padosoft/laravel-ai-act-compliance). Now you need a UI for your DPO, Compliance Officer, and CISO to actually *use* the DSAR queue, browse the risk register, triage incidents, monitor cohort drift, sign attestations.

You could build that from scratch. It would take 4-6 weeks of FE engineering, plus chart design, plus a11y review, plus drawer / modal / palette UX work. Nobody wants to do that.

This package gives you the **8 production-grade screens** out of the box. Pixel-perfectly ported from a [Claude Design](https://claude.ai/design) handoff bundle. **React 19 + TypeScript + react-router-dom**. Cross-mounts under `/admin/ai-act-compliance` in any Laravel app via the BrowserRouter `basename` pattern proven by `pii-redactor-admin` + `eval-harness-ui`.

### Who's this for

| You | This package |
|-----|--------------|
| Use `padosoft/laravel-ai-act-compliance` and need a UI | ✅ Yes |
| Building a custom DPO console and want to start from polished components | ✅ Yes |
| Operating a Laravel SaaS that needs auditor-friendly compliance dashboards | ✅ Yes |
| Want a fully-functional admin out of the box (no Figma → React port) | ✅ Yes |
| Pure backend service with no admin UI | ❌ Use the backend package directly |

---

## 🖥️ The eight screens

Every screen is a real React 19 component (not a scaffold). Each has loading / ready / error / empty `data-state` props for deterministic E2E testing, a11y landmarks, and keyboard navigation.

| # | Screen | What it does | Key UI elements |
|---|--------|--------------|----------------|
| 1 | **Compliance Overview** | Single-pane KPI dashboard + activity feed + Article 30 attestation card | 4 clickable KPI tiles (DSAR / Incidents / Consent / Bias) + alert banner + recharts-style DSAR depth SVG chart + chronological activity feed |
| 2 | **DSAR Queue** | GDPR Art. 15 / 16 / 17 request queue | Filterable table + bulk actions + status pills + SLA breach badges + drawer with subject / scope / timeline |
| 3 | **Consent Overview** | Per-feature + per-user consent matrix | Tabs (Per feature / Per user) + feature cards with consent bar (granted / revoked / never) + sparkline + user matrix table |
| 4 | **Risk Register** | AI Act Annex III risk catalogue | Category summary tiles (unacceptable / high / limited / low) + filter sidebar + card grid + drawer with article references |
| 5 | **Incident Manager** | AI Act Art. 73 ticket lifecycle | 4-lane kanban (open / triage / mitigating / closed) + severity-coloured cards + drawer with timeline + mitigations + escalation tree |
| 6 | **Bias Monitor** | AI Act Art. 10 cohort parity + drift | Cohort dimension selector + accuracy parity SVG chart with CI bands + 13-week drift multi-line chart + flagged samples table |
| 7 | **DPO Console** | Retention + deletion + attestation | Data flow diagram (sankey-style SVG) + retention table + deletion log + Article 30 attestation modal with PDF generator |
| 8 | **Settings** | Feature flags + env + webhooks | Spatie-style switches + masked env vars (show/hide secrets) + webhook destination cards with health status |

### Cross-cutting UX

- **⌘K command palette** — searches navigation + actions + records (DSAR / incident / risk) in one prompt
- **Sidebar with badges** — DSAR open count, incident open count, risk open count
- **Topbar with live pulse** — green dot + last-tick timestamp + amber when alert count > 0
- **Theme toggle** — dark / light
- **Toast system** — non-blocking notifications
- **Drawer + modal** — Escape-to-close, focus trap, restore focus on close

---

## 💎 Killer features

What makes this package WOW vs rolling your own admin:

### 1. Pixel-perfect design heritage

Every screen is ported from a real Claude Design handoff — not a Figma mockup, not a Bootstrap kit. The `styles-base.css` + `styles-compliance.css` files ship with **the exact tokens, spacing, and SVG paths the designer signed off**. You can swap shadcn / Tailwind v4 / your house style on top, but the baseline is enterprise-credible from minute zero.

### 2. SVG charts without recharts

Every chart in the package is **hand-rolled SVG** — no chart library dependency. That means:

- Zero bundle bloat
- Easy to skin (the SVG uses CSS variables for colours)
- Easy to extend (one file per chart; no Plotly DSL to learn)

The DSAR depth chart, the cohort parity chart with CI bands, the drift multi-line chart, the data flow sankey — all <300 LoC of plain SVG each.

### 3. Real keyboard navigation + a11y from the start

- ⌘K / Ctrl+K opens the palette from anywhere
- Arrow keys navigate palette results
- Esc closes drawers / modals / palette
- Every clickable region is a `<button type="button">` (not a div with onClick) — screen readers + tab order work
- Every interactive `<input>` carries a `<label htmlFor>` or `aria-label`
- Every async screen exposes `data-state` for deterministic Playwright waits
- `role="dialog"` + `aria-modal="true"` on drawers + modals
- Focus restoration on close

### 4. Cross-mount, not iframe

The package mounts as a real React app at `/admin/ai-act-compliance` — same browser session, same auth, same CSS variables as the host. No iframe sandboxing pain. Tested with `pii-redactor-admin` + `eval-harness-ui` cross-mount precedents.

### 5. TypeScript everywhere

Every screen, every helper, every chart component is `.tsx` / `.ts`. Strict mode on. The published shape of the host's HTTP API is fully typed in `src/api/`.

---

## ⚙️ Prerequisites

You need:

- **PHP 8.2+** + **Laravel 11 / 12 / 13** — same as the backend package
- **Node 20+** — only required if you want to rebuild the bundle yourself; the published assets ship pre-built
- **Composer** — `composer --version`
- **The backend package installed**: `composer require padosoft/laravel-ai-act-compliance`

That's it.

---

## ⚡ Quick start (jr-proof, 5 minutes)

> Even if you've never installed a Laravel package + React SPA combo before, you'll be running by the end of this section.

### 1. Install the package

```bash
composer require padosoft/laravel-ai-act-compliance-admin
```

That's it for installation. Laravel auto-discovery wires the service provider.

### 2. Publish the assets

```bash
php artisan vendor:publish --tag=ai-act-compliance-admin-assets
```

This copies the pre-built React bundle to your `public/vendor/ai-act-compliance-admin/` directory and registers the Vite manifest. No node / npm needed on your server.

### 3. Mount the route

Add to your `routes/web.php`:

```php
use Padosoft\AiActComplianceAdmin\Http\Controllers\AdminPanelController;

Route::middleware(['web', 'auth'])
    ->prefix('admin/ai-act-compliance')
    ->group(function () {
        Route::get('/{any?}', [AdminPanelController::class, 'serve'])
            ->where('any', '.*')
            ->name('ai-act-compliance.admin');
    });
```

The catch-all `{any?}` is required so the React `BrowserRouter` can handle client-side navigation between `/dsar`, `/consent`, etc.

### 4. Gate the route (recommended)

Wrap the route group in a policy gate so only your compliance team gets in:

```php
Route::middleware(['web', 'auth', 'can:viewCompliance'])
    ->prefix('admin/ai-act-compliance')
    ->group(/* ... */);
```

Define the gate in `AuthServiceProvider`:

```php
Gate::define('viewCompliance', function (User $user) {
    return $user->hasAnyRole(['admin', 'super-admin', 'dpo', 'compliance-officer', 'ciso']);
});
```

### 5. Visit it

Start your app (`php artisan serve` or whatever you use). Log in as a user with the `dpo` / `compliance-officer` / `ciso` / `admin` role. Visit:

```
http://localhost:8000/admin/ai-act-compliance
```

You should see the **Compliance Overview** screen with KPI tiles, an activity feed, and the DSAR depth chart. Click the sidebar entries to navigate the 7 other screens. Hit `⌘K` (Mac) or `Ctrl+K` (Linux/Win) for the command palette.

### 6. (Optional) Connect real data

Out of the box, the SPA renders against the backend package's HTTP API at `/api/ai-act-compliance/*` (mounted by the backend package service provider). If you want to point it at a different URL, edit `config/ai-act-compliance-admin.php`:

```php
return [
    'api_base_url' => env('AICOMPLIANCE_ADMIN_API_BASE', '/api/ai-act-compliance'),
    'mount_prefix' => env('AICOMPLIANCE_ADMIN_MOUNT', '/admin/ai-act-compliance'),
];
```

### 7. Cross-mount into AskMyDocs (or any other Laravel app)

If you're shipping the SPA *inside* another Laravel admin (e.g. AskMyDocs), serve it under an iframe pointed at `/admin/ai-act-compliance/embed`:

```jsx
<iframe
    src="/admin/ai-act-compliance/embed"
    title="AI Act compliance admin"
    style={{ flex: 1, width: '100%', border: 0 }}
/>
```

The package ships an `/embed` route that strips the host's chrome (no Laravel topbar / Sanctum re-login).

### 8. (Optional) Rebuild the bundle yourself

If you want to customise the SPA source:

```bash
git clone https://github.com/padosoft/laravel-ai-act-compliance-admin.git
cd laravel-ai-act-compliance-admin
npm install
npm run dev   # Vite HMR on http://localhost:5173
```

Edit the components under `src/features/<screen>/`, save, and HMR reloads the page in <500ms.

When done:

```bash
npm run build
```

Vite emits the production bundle to `publishable/` for the PHP `vendor:publish` step to consume.

---

## 🔗 Cross-mount

The SPA uses `BrowserRouter` with a `basename` that matches your `mount_prefix` config. This means:

- The SPA owns every URL under `/admin/ai-act-compliance/*`
- Your Laravel app handles auth + serves the same `app.blade.php` for every URL in the mount
- Browser back / forward / refresh all work (no fragment-based routing)
- Direct URLs like `/admin/ai-act-compliance/dsar?status=pending&due=5d` are shareable
- ⌘K palette + sidebar nav both use TanStack Router-style navigation

The pattern is proven — `pii-redactor-admin` (v4.4/W2) and `eval-harness-ui` (v4.4/W3) ship the same way in [AskMyDocs](https://github.com/lopadova/AskMyDocs).

---

## 🎨 Design system

### CSS tokens

The package ships two CSS files (loaded automatically):

- `styles-base.css` — design tokens (colours, spacing, typography, motion), generic layout (`.page`, `.card`, `.kpi-grid`, `.alert-banner`), and primitive widgets
- `styles-compliance.css` — compliance-specific styling (severity pills, traffic lights, attestation card)

CSS custom properties drive the theme:

```css
:root {
    --accent: #3b82f6;
    --sev-critical: #ef4444;
    --sev-high: #f97316;
    --sev-medium: #f59e0b;
    --sev-low: #22c55e;
    --bg: #0f172a;
    --bg-elevated: #1e293b;
    --text: #e2e8f0;
    --border: #334155;
    --font-mono: ui-monospace, "SF Mono", Menlo, monospace;
}

[data-theme="light"] { /* … */ }
```

### Icons

50+ lucide-style icons in `src/components/Icons.tsx`. Single base component (`IconBase`) + named exports (`I.Inbox`, `I.ShieldCheck`, `I.Scale`, etc.). Stroke-based, 16-24px friendly, currentColor.

### Components

Reusable primitives in `src/components/Primitives.tsx`:

- `Avatar` — initials + name + size
- `Sparkline` — line + area, configurable colour
- `Tooltip` — title-attribute-based (replace with floating-ui for richer tooltips)
- `Modal` — Escape + focus trap + restore
- `Drawer` — slide-from-right + Escape + actions slot
- `Kbd` — keyboard shortcut chip
- `ArticleRef` — pill for "AI Act Art. 14" etc.

### Layout

The shell (`src/components/Shell.tsx`) is a 3-column app shell:

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar (240px)   │   Topbar (fixed)                       │
│                    ├────────────────────────────────────────┤
│  Operations        │                                        │
│  - Overview        │                                        │
│  - DSAR            │                                        │
│  - Consent         │   Active screen                        │
│                    │                                        │
│  Risk Management   │                                        │
│  - Risks           │                                        │
│  - Incidents       │                                        │
│  - Bias            │                                        │
│                    │                                        │
│  Governance        │                                        │
│  - DPO             │                                        │
│  - Settings        │                                        │
│                    │                                        │
│  ──────────────    │                                        │
│  Avatar + role     │                                        │
└────────────────────┴────────────────────────────────────────┘
```

---

## ⚙️ Customising

### Swap a screen entirely

Each screen is a single file. To replace one:

1. Create your own component (e.g. `src/features/dsar/MyDsarScreen.tsx`)
2. Update `src/App.tsx` to route to it instead of `DsarScreen`
3. Rebuild: `npm run build`
4. Re-publish: `php artisan vendor:publish --tag=ai-act-compliance-admin-assets --force`

### Customise the colour palette

Override the CSS custom properties in your host:

```css
/* In your host's layout */
:root {
    --accent: #6366f1;  /* indigo instead of blue */
    --sev-critical: #b91c1c;
}
```

### Add a 9th screen

1. Add a `RouteEntry` to `src/components/Shell.tsx::ROUTES`
2. Create `src/features/<name>/<Name>Screen.tsx`
3. Add a `<Route>` to `src/App.tsx`
4. Rebuild

### Wire to a different backend

The default API client targets `/api/ai-act-compliance/*`. Override per-resource clients in `src/api/`:

```ts
import { api } from '../api/client';

export async function listDsar(filters: DsarFilters) {
    const { data } = await api.get('/api/your-custom-prefix/dsar', { params: filters });
    return data;
}
```

---

## 🧪 Testing

```bash
npm run test          # Vitest screens-render.test.tsx
npm run test:watch    # Watch mode
```

The default test pack asserts every screen renders its top-level `data-testid` + key landmark nodes. Add your own Vitest + Playwright tests on top.

For E2E, use Playwright + `getByTestId`:

```ts
test('DSAR queue filter persists across navigation', async ({ page }) => {
    await page.goto('/admin/ai-act-compliance/dsar');
    await page.getByTestId('dsar-filter-status').selectOption('pending');
    await page.getByTestId('dsar-row-dsar_2026_0141').click();
    await expect(page.getByTestId('dsar-detail-dsar_2026_0141')).toBeVisible();
});
```

---

## ♿ Accessibility

WCAG 2.1 AA target. Every screen:

- Has a single `<h1>` (the page title)
- Renders interactive widgets as `<button type="button">` (never `<div onClick>`)
- Pairs every `<input>` / `<select>` / `<textarea>` with a `<label htmlFor>` or `aria-label`
- Exposes `role="dialog"` + `aria-modal="true"` + focus trap on Drawer + Modal
- Uses `role="status"` / `role="alert"` on non-blocking / blocking notifications
- Supports keyboard navigation via Tab + ⌘K palette
- Provides `aria-busy` while loading
- Provides `data-state="loading|ready|error|empty"` for E2E + a11y tooling

Tested with axe-core via the host's Playwright `tests:a11y` pack.

---

## 🤝 Companion package: backend

The Laravel backend is the source of truth:

[`padosoft/laravel-ai-act-compliance`](https://github.com/padosoft/laravel-ai-act-compliance) — 9 backend modules (Disclosure / RiskRegister / DSAR / BiasMonitoring / HumanReviewTracker / Incident / Consent / Cybersecurity / ComplianceAttestation) + Eloquent models + service provider + migrations + HTTP API.

```bash
composer require padosoft/laravel-ai-act-compliance
composer require padosoft/laravel-ai-act-compliance-admin
```

Both packages cooperate: the backend exposes `/api/ai-act-compliance/*`, the admin consumes it.

---

## 🗺️ Roadmap

- [x] **v1.0** — Scaffold + handoff bundle
- [x] **v1.1** — 8 fully-featured screens ported from the Claude Design handoff
- [ ] **v1.2** — Tailwind v4 design system on top of the base CSS tokens
- [ ] **v1.3** — TanStack Router migration (BrowserRouter → file-based routing)
- [ ] **v1.4** — Real-time SSE feed for activity stream + incident state changes
- [ ] **v2.0** — i18n full pass (10 languages) + tablet-optimised layouts

---

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full release history.

Recent highlights:

- **v1.1.0** (2026-05-14) — Ported the Claude Design handoff to 8 fully-featured screens
- **v1.0.1** (2026-05-13) — Laravel 13 compatibility constraints
- **v1.0.0** (2026-05-12) — Scaffold + handoff bundle + cross-mount foundation

---

## 🤝 Contributing

PRs welcome. Before opening one:

1. Run `npm run test` locally and confirm it's green
2. Run `npm run build` and check the published assets compile
3. Add a Vitest spec for your new component
4. Follow the existing TypeScript + React 19 conventions
5. Update CHANGELOG.md under `## [Unreleased]`

For major changes (new screen, new design system, breaking API), open an issue first.

---

## 📄 License

The MIT License (MIT). See [LICENSE.md](LICENSE.md) for details.

The bundled handoff CSS / JSX prototype in `public/handoff/` is copyright Padosoft + Claude Design. Re-using it outside this package is allowed under MIT; please retain the attribution comment at the top of each file.

---

<p align="center">
  Made with 🇮🇹 by <a href="https://padosoft.com">Padosoft</a> · Powering <a href="https://github.com/lopadova/AskMyDocs">AskMyDocs</a>
</p>
