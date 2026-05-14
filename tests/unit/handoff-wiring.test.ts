import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = path.resolve(__dirname, '..', '..');
const handoffDir = path.join(repoRoot, 'public', 'handoff');
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const handoffApp = fs.readFileSync(path.join(handoffDir, 'app.jsx'), 'utf8');

const expectedStylesheets = [
  '/handoff/styles.css',
  '/handoff/styles-compliance.css',
];

const expectedScripts = [
  '/handoff/data.jsx',
  '/handoff/ui.jsx',
  '/handoff/ui-compliance.jsx',
  '/handoff/icons-compliance.jsx',
  '/handoff/tweaks-panel.jsx',
  '/handoff/shell.jsx',
  '/handoff/empty-states.jsx',
  '/handoff/page-overview.jsx',
  '/handoff/page-dsar.jsx',
  '/handoff/page-consent.jsx',
  '/handoff/page-risks.jsx',
  '/handoff/page-incidents.jsx',
  '/handoff/page-bias.jsx',
  '/handoff/page-dpo.jsx',
  '/handoff/page-settings.jsx',
  '/handoff/app.jsx',
];

function collectAssetRefs(tag: 'link' | 'script', attr: 'href' | 'src') {
  const pattern = new RegExp(`<${tag}[^>]+${attr}="([^"]+)"`, 'g');
  return [...indexHtml.matchAll(pattern)].map((match) => match[1]);
}

describe('handoff asset wiring', () => {
  it('uses production React UMD builds for the handoff shell', () => {
    expect(indexHtml).toContain('react.production.min.js');
    expect(indexHtml).toContain('react-dom.production.min.js');
    expect(indexHtml).not.toContain('react.development.js');
    expect(indexHtml).not.toContain('react-dom.development.js');
  });

  it('loads the expected handoff styles and scripts in dependency order', () => {
    const stylesheetRefs = collectAssetRefs('link', 'href').filter((ref) => ref.startsWith('/handoff/'));
    const scriptRefs = collectAssetRefs('script', 'src').filter((ref) => ref.startsWith('/handoff/'));

    expect(stylesheetRefs).toEqual(expectedStylesheets);
    expect(scriptRefs).toEqual(expectedScripts);
  });

  it('references handoff assets that exist on disk', () => {
    const assetRefs = [...expectedStylesheets, ...expectedScripts];

    for (const assetRef of assetRefs) {
      const relativePath = assetRef.replace(/^\/handoff\//, '');
      expect(fs.existsSync(path.join(handoffDir, relativePath)), `${assetRef} should exist`).toBe(true);
    }
  });

  it('keeps a single EmptyState global provider with the art/cta signature', () => {
    const uiCompliance = fs.readFileSync(path.join(handoffDir, 'ui-compliance.jsx'), 'utf8');
    const emptyStates = fs.readFileSync(path.join(handoffDir, 'empty-states.jsx'), 'utf8');

    expect(uiCompliance).toContain('function PanelEmptyState');
    expect(uiCompliance).not.toContain('Object.assign(window, {\r\n  SevBadge, ArticleRef, Avatar, EmptyState, Tooltip,');
    expect(emptyStates).toContain('function EmptyState({ art = \'Inbox\', title, body, cta, ctaIcon })');
    expect(emptyStates).toContain('Object.assign(window, { EmptyState, ESArt });');
  });

  it('uses the tweaks section label prop expected by the shared handoff panel', () => {
    expect(handoffApp).toContain('<TweakSection label="Appearance">');
    expect(handoffApp).not.toContain('<TweakSection title="Appearance">');
  });
});
