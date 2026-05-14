// ============== App root — AI Act Compliance Admin ==============

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark"
}/*EDITMODE-END*/;

const VALID_ROUTES = ROUTES.map(r => r.key);

function App() {
  // ---- tweaks (light/dark) ----
  const fallback = React.useState(TWEAK_DEFAULTS);
  const fallbackSetter = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' ? keyOrEdits : { [keyOrEdits]: val };
    fallback[1](prev => ({ ...prev, ...edits }));
  }, []);
  const [tweaks, setTweak] = window.useTweaks
    ? window.useTweaks(TWEAK_DEFAULTS)
    : [fallback[0], fallbackSetter];

  React.useEffect(() => {
    document.documentElement.dataset.theme = tweaks.theme;
  }, [tweaks.theme]);

  // ---- hash-based routing ----
  const parseHash = () => {
    const h = (location.hash || '').replace(/^#\/?/, '').split('/')[0];
    return VALID_ROUTES.includes(h) ? h : 'overview';
  };
  const [route, setRoute] = React.useState(parseHash());

  React.useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = React.useCallback((key) => {
    if (key === route) return;
    if (VALID_ROUTES.includes(key)) {
      location.hash = `#/${key}`;
    }
  }, [route]);

  // ---- live tick + palette ----
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [lastTick, setLastTick] = React.useState(window.NOW);
  React.useEffect(() => {
    const id = setInterval(() => setLastTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(o => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ---- sidebar counts ----
  const counts = React.useMemo(() => {
    const dsarOpen = DSAR.filter(d => d.status !== 'completed' && d.status !== 'rejected').length;
    const incOpen  = INCIDENTS.filter(i => i.state !== 'closed').length;
    const risksOpen = RISKS.filter(r => r.status !== 'closed').length;
    return { dsar: dsarOpen, incidents: incOpen, risks: risksOpen };
  }, []);

  const alertCount = INCIDENTS.filter(i => i.state !== 'closed' && (i.severity === 'critical' || i.severity === 'high')).length
                   + DSAR.filter(d => d.dueIn < 0 && d.status !== 'completed' && d.status !== 'rejected').length;

  // ---- render the active page ----
  const Page = {
    overview:  PageOverview,
    dsar:      PageDSAR,
    consent:   PageConsent,
    risks:     PageRisks,
    incidents: PageIncidents,
    bias:      PageBias,
    dpo:       PageDPO,
    settings:  PageSettings,
  }[route] || PageOverview;

  return (
    <ToastProvider>
      <div className="app">
        <Sidebar route={route} onNavigate={navigate} counts={counts}/>
        <div className="main">
          <Topbar route={route} theme={tweaks.theme}
                  onTheme={(th) => setTweak('theme', th)}
                  onOpenPalette={() => setPaletteOpen(true)}
                  lastTick={lastTick}
                  alertCount={alertCount}/>
          <div className="content">
            <Page onNavigate={navigate}/>
          </div>
        </div>

        <CommandPalette open={paletteOpen}
                        onClose={() => setPaletteOpen(false)}
                        onNavigate={navigate}/>
      </div>

      <ComplianceTweaks tweaks={tweaks} setTweak={setTweak}/>
    </ToastProvider>
  );
}

function ComplianceTweaks({ tweaks, setTweak }) {
  if (!window.TweaksPanel) return null;
  const TweaksPanel = window.TweaksPanel;
  const TweakSection = window.TweakSection;
  const TweakRadio = window.TweakRadio;
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Appearance">
        <TweakRadio label="Theme" value={tweaks.theme}
                    options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
                    onChange={v => setTweak('theme', v)}/>
      </TweakSection>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
