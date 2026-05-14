import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * The admin SPA has two layers:
 *  - `index.html` + `src/main.tsx`: the vite-native production entry that
 *    boots the real React 19 + react-router-dom app. This is what ships
 *    in `dist/` and gets cross-mounted into the host Laravel app.
 *  - `public/handoff/*.jsx`: a reference handoff bundle from Claude
 *    Design — Babel-standalone in-browser JSX, kept ONLY as a visual
 *    spec for designers / pixel-port comparisons. Not loaded in prod.
 *
 * This file pins the structural invariants of BOTH layers so the
 * production entry can't silently regress into "1 module transformed"
 * again and the design handoff stays accessible for the next port
 * iteration.
 */

const repoRoot = path.resolve(__dirname, '..', '..');
const handoffDir = path.join(repoRoot, 'public', 'handoff');
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

describe('production entry wiring', () => {
    it('loads src/main.tsx as the vite-native module entry', () => {
        expect(indexHtml).toMatch(/<script\s+type="module"\s+src="\/src\/main\.tsx"/);
    });

    it('does not load the Babel-standalone in-browser runtime in the prod entry', () => {
        expect(indexHtml).not.toContain('babel.min.js');
        expect(indexHtml).not.toContain('react.production.min.js');
    });

    it('mounts on a #root div', () => {
        expect(indexHtml).toMatch(/<div\s+id="root"/);
    });
});

describe('design handoff reference bundle (public/handoff)', () => {
    it('keeps the handoff app entry file alongside the page modules', () => {
        const handoffApp = path.join(handoffDir, 'app.jsx');
        expect(fs.existsSync(handoffApp), 'public/handoff/app.jsx should remain as a reference').toBe(true);
    });

    it('keeps a single EmptyState global provider with the art/cta signature', () => {
        const emptyStates = fs.readFileSync(path.join(handoffDir, 'empty-states.jsx'), 'utf8');
        expect(emptyStates).toContain("function EmptyState({ art = 'Inbox', title, body, cta, ctaIcon })");
        expect(emptyStates).toContain('Object.assign(window, { EmptyState, ESArt });');
    });
});
