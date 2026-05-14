// ============== Realistic demo data for AI Act Compliance Admin ==============
// Italian organization, EU-resident data subjects, plausible AI Act scenarios.
// Reference time is fixed so timestamps are deterministic across renders.

const NOW = new Date('2026-05-14T09:42:00Z').getTime();
const dayAgo = (d) => NOW - d * 86400_000;
const hrAgo = (h) => NOW - h * 3600_000;
const minAgo = (m) => NOW - m * 60_000;

// ---------- People ----------
const ADMINS = [
  { id: 'u_amalfi',  name: 'Giulia Amalfi',   email: 'giulia.amalfi@padosoft.com',   role: 'DPO',                 initials: 'GA' },
  { id: 'u_conti',   name: 'Marco Conti',     email: 'marco.conti@padosoft.com',     role: 'Compliance Officer',  initials: 'MC' },
  { id: 'u_dirosa',  name: 'Elena Di Rosa',   email: 'elena.dirosa@padosoft.com',    role: 'CISO',                initials: 'ED' },
  { id: 'u_lombardi',name: 'Stefano Lombardi',email: 'stefano.lombardi@padosoft.com',role: 'AI Risk Lead',        initials: 'SL' },
  { id: 'u_ferri',   name: 'Chiara Ferri',    email: 'chiara.ferri@padosoft.com',    role: 'Legal',               initials: 'CF' },
  { id: 'u_bianchi', name: 'Davide Bianchi',  email: 'davide.bianchi@padosoft.com',  role: 'Eng Lead',            initials: 'DB' },
];

const SUBJECTS = [
  { id: 'ds_01', name: 'Alessandro Russo',     email: 'alessandro.russo@gmail.com',     country: 'IT' },
  { id: 'ds_02', name: 'Laura Greco',          email: 'l.greco@protonmail.com',         country: 'IT' },
  { id: 'ds_03', name: 'Matteo Ricci',         email: 'mricci@outlook.it',              country: 'IT' },
  { id: 'ds_04', name: 'Sofia Marino',         email: 'sofia.marino92@gmail.com',       country: 'IT' },
  { id: 'ds_05', name: 'Pieter Janssen',       email: 'p.janssen@kpn.nl',               country: 'NL' },
  { id: 'ds_06', name: 'Camille Dubois',       email: 'camille.dubois@orange.fr',       country: 'FR' },
  { id: 'ds_07', name: 'Tomás Fernández',      email: 't.fernandez@telefonica.es',      country: 'ES' },
  { id: 'ds_08', name: 'Anja Müller',          email: 'anja.mueller@gmx.de',            country: 'DE' },
  { id: 'ds_09', name: 'Francesca Romano',     email: 'f.romano@libero.it',             country: 'IT' },
  { id: 'ds_10', name: 'Lucia Esposito',       email: 'lucia.e@fastwebnet.it',          country: 'IT' },
  { id: 'ds_11', name: 'Roberto Galli',        email: 'r.galli@aruba.it',               country: 'IT' },
  { id: 'ds_12', name: 'Giorgio Vitale',       email: 'giorgio.vitale@tin.it',          country: 'IT' },
  { id: 'ds_13', name: 'Marta Colombo',        email: 'marta.colombo@gmail.com',        country: 'IT' },
  { id: 'ds_14', name: 'Nicolas Petit',        email: 'n.petit@free.fr',                country: 'FR' },
];

// ---------- DSAR (GDPR Art. 15 / 17 / 16) ----------
const DSAR = [
  { id: 'dsar_2026_0142', subject: SUBJECTS[0], type: 'export',   status: 'in_progress', opened: dayAgo(2),  dueIn: 28, articles: ['GDPR Art. 15'],         assignee: ADMINS[1] },
  { id: 'dsar_2026_0141', subject: SUBJECTS[1], type: 'delete',   status: 'pending',     opened: dayAgo(28), dueIn: 2,  articles: ['GDPR Art. 17', 'AI Act Art. 50'], assignee: null },
  { id: 'dsar_2026_0140', subject: SUBJECTS[2], type: 'rectify',  status: 'in_progress', opened: dayAgo(5),  dueIn: 25, articles: ['GDPR Art. 16'],         assignee: ADMINS[1] },
  { id: 'dsar_2026_0139', subject: SUBJECTS[3], type: 'export',   status: 'pending',     opened: dayAgo(31), dueIn: -1, articles: ['GDPR Art. 15'],         assignee: null },
  { id: 'dsar_2026_0138', subject: SUBJECTS[4], type: 'delete',   status: 'pending',     opened: hrAgo(6),   dueIn: 30, articles: ['GDPR Art. 17'],         assignee: null },
  { id: 'dsar_2026_0137', subject: SUBJECTS[5], type: 'export',   status: 'completed',   opened: dayAgo(14), dueIn: 16, articles: ['GDPR Art. 15'],         assignee: ADMINS[0], closed: dayAgo(3) },
  { id: 'dsar_2026_0136', subject: SUBJECTS[6], type: 'delete',   status: 'completed',   opened: dayAgo(22), dueIn: 8,  articles: ['GDPR Art. 17'],         assignee: ADMINS[1], closed: dayAgo(9) },
  { id: 'dsar_2026_0135', subject: SUBJECTS[7], type: 'rectify',  status: 'rejected',    opened: dayAgo(18), dueIn: 12, articles: ['GDPR Art. 16'],         assignee: ADMINS[0], closed: dayAgo(11) },
  { id: 'dsar_2026_0134', subject: SUBJECTS[8], type: 'export',   status: 'in_progress', opened: dayAgo(7),  dueIn: 23, articles: ['GDPR Art. 15'],         assignee: ADMINS[1] },
  { id: 'dsar_2026_0133', subject: SUBJECTS[9], type: 'delete',   status: 'in_progress', opened: dayAgo(11), dueIn: 19, articles: ['GDPR Art. 17'],         assignee: ADMINS[0] },
  { id: 'dsar_2026_0132', subject: SUBJECTS[10],type: 'export',   status: 'completed',   opened: dayAgo(40), dueIn: 0,  articles: ['GDPR Art. 15'],         assignee: ADMINS[1], closed: dayAgo(18) },
  { id: 'dsar_2026_0131', subject: SUBJECTS[11],type: 'export',   status: 'completed',   opened: dayAgo(52), dueIn: 0,  articles: ['GDPR Art. 15'],         assignee: ADMINS[1], closed: dayAgo(28) },
];

const DSAR_DETAIL_TIMELINE = {
  'dsar_2026_0141': [
    { at: dayAgo(28), actor: 'system',          event: 'created',          label: 'Request received via privacy@padosoft.com' },
    { at: dayAgo(28), actor: 'system',          event: 'identity_verified',label: 'Identity verified via SPID handshake' },
    { at: dayAgo(27), actor: 'Marco Conti',     event: 'triage_assigned',  label: 'Triaged — assigned to DPO queue' },
    { at: dayAgo(26), actor: 'system',          event: 'scope_resolved',   label: 'Resolved 4 data domains, 1,284 rows' },
    { at: dayAgo(25), actor: 'Marco Conti',     event: 'note',             label: 'Awaiting legal review for processor cascade' },
    { at: dayAgo(2),  actor: 'system',          event: 'sla_warning',      label: 'SLA breach in 2 days — escalation triggered' },
  ],
};

const DSAR_SCOPE = {
  'dsar_2026_0141': [
    { domain: 'Conversations',          rows: 412,  retention: '90d',   policy: 'auto-purge' },
    { domain: 'Chat embeddings',        rows: 1_847,retention: '90d',   policy: 'auto-purge' },
    { domain: 'KB ingest activity',     rows: 24,   retention: '2y',    policy: 'audit-only' },
    { domain: 'Connector installations',rows: 1,    retention: 'while-active', policy: 'manual' },
  ],
};

// ---------- Incidents ----------
const INCIDENTS = [
  // OPEN
  { id: 'inc_2026_0044', title: 'Hallucination on legal-domain queries (IT cohort)', severity: 'high',     state: 'open',       opened: hrAgo(3), assignee: ADMINS[3], affected: 124, articles: ['AI Act Art. 14','AI Act Art. 15'], tags: ['hallucination','high-risk'] },
  { id: 'inc_2026_0043', title: 'PII redactor missed IBAN in 3 chat logs',            severity: 'critical', state: 'open',       opened: hrAgo(1), assignee: ADMINS[2], affected: 3,   articles: ['GDPR Art. 32','GDPR Art. 33'], tags: ['data-leak','breach'] },
  { id: 'inc_2026_0042', title: 'Connector OAuth refresh failure — Slack workspace',  severity: 'low',      state: 'open',       opened: hrAgo(11),assignee: null,      affected: 8,   articles: [], tags: ['integration'] },
  // TRIAGE
  { id: 'inc_2026_0041', title: 'KB ingest pipeline rejected 4% of documents',         severity: 'medium',   state: 'triage',     opened: hrAgo(18),assignee: ADMINS[5], affected: 0,   articles: ['AI Act Art. 10'], tags: ['data-quality'] },
  { id: 'inc_2026_0040', title: 'Eval-harness flagged demographic drift (gender)',     severity: 'high',     state: 'triage',     opened: dayAgo(1),assignee: ADMINS[3], affected: 47,  articles: ['AI Act Art. 10','AI Act Art. 15'], tags: ['bias','drift'] },
  // MITIGATING
  { id: 'inc_2026_0039', title: 'Rate-limit bypass on /chat for one workspace',        severity: 'medium',   state: 'mitigating', opened: dayAgo(2),assignee: ADMINS[5], affected: 0,   articles: ['AI Act Art. 15'], tags: ['security','abuse'] },
  // CLOSED (recent)
  { id: 'inc_2026_0038', title: 'False positive on toxicity classifier (DE cohort)',   severity: 'medium',   state: 'closed',     opened: dayAgo(5),closed: dayAgo(1),  assignee: ADMINS[3], affected: 22, articles: ['AI Act Art. 10'], tags: ['bias'] },
  { id: 'inc_2026_0037', title: 'Logging gap on MCP tool invocations (12h)',           severity: 'low',      state: 'closed',     opened: dayAgo(7),closed: dayAgo(4),  assignee: ADMINS[5], affected: 0,  articles: ['AI Act Art. 12'], tags: ['observability'] },
];

const INCIDENT_DETAIL = {
  'inc_2026_0043': {
    description: 'PII redactor (v2.4.1) failed to match Italian IBAN format in three customer-support chat sessions on 2026-05-13. Three IBAN strings were stored in plain text in the chat log table for ~6 hours before the v2.4.2 hot-fix.',
    timeline: [
      { at: hrAgo(1),    actor: 'eval-harness',  event: 'detected',    label: 'PII canary triggered on IBAN pattern' },
      { at: hrAgo(0.8),  actor: 'system',        event: 'auto_routed', label: 'Routed to CISO per escalation policy (severity: critical)' },
      { at: hrAgo(0.5),  actor: 'Elena Di Rosa', event: 'assigned',    label: 'Self-assigned, opened war-room channel' },
    ],
    mitigations: [
      { at: hrAgo(0.3), actor: 'Davide Bianchi', text: 'Deployed v2.4.2 with extended IBAN regex (ISO 13616). PII redactor backfill scheduled.' },
    ],
    escalation: [
      { level: 'critical', recipients: ['CISO', 'DPO', 'CEO'], notified: true },
      { level: 'high',     recipients: ['Eng Lead'],           notified: true },
    ],
    affectedUsers: SUBJECTS.slice(0, 3),
  },
};

// ---------- Risks (Risk Register — AI Act Annex III categories) ----------
const RISKS = [
  { id: 'risk_001', name: 'Biometric categorization in support tickets',  category: 'unacceptable', status: 'closed',      owner: ADMINS[4], lastReviewed: dayAgo(12), articles: ['AI Act Art. 5'],          desc: 'Inadvertent inference of protected attributes from free-text support tickets. Mitigation: removed from training pipeline; banned in production prompts.' },
  { id: 'risk_002', name: 'Hallucinated legal advice (IT jurisdiction)',  category: 'high',         status: 'in_progress', owner: ADMINS[3], lastReviewed: dayAgo(4),  articles: ['AI Act Art. 6','AI Act Annex III §8'], desc: 'Chat agent may produce confident-sounding legal interpretations. Mitigation: domain detector + mandatory disclaimer + retrieval-only mode.' },
  { id: 'risk_003', name: 'Cohort accuracy drift (language: Italian)',    category: 'high',         status: 'open',        owner: ADMINS[3], lastReviewed: dayAgo(2),  articles: ['AI Act Art. 10','AI Act Art. 15'], desc: 'Italian-language responses underperform English baseline by 8%. Mitigation in progress: additional eval set + retraining slice.' },
  { id: 'risk_004', name: 'CV screening for HR partner integration',      category: 'high',         status: 'in_progress', owner: ADMINS[4], lastReviewed: dayAgo(9),  articles: ['AI Act Annex III §4'],    desc: 'Reseller wants resume ranking. High-risk per Annex III. Mitigation: human-in-the-loop required, transparency notice, fundamental-rights impact assessment in progress.' },
  { id: 'risk_005', name: 'Emotion recognition from voice transcript',    category: 'high',         status: 'closed',      owner: ADMINS[4], lastReviewed: dayAgo(30), articles: ['AI Act Art. 5(1)(f)'],    desc: 'Feature request refused at design phase. Documented in risk register for audit trail.' },
  { id: 'risk_006', name: 'Deepfake / synthetic content disclosure',      category: 'limited',      status: 'in_progress', owner: ADMINS[0], lastReviewed: dayAgo(6),  articles: ['AI Act Art. 50'],         desc: 'AI-generated text must be watermarked/labelled. Implementation: auto-disclosure footer in chat responses, opt-out for internal use.' },
  { id: 'risk_007', name: 'Training data provenance gaps',                category: 'high',         status: 'open',        owner: ADMINS[1], lastReviewed: dayAgo(18), articles: ['AI Act Art. 10','GDPR Art. 6'], desc: 'Third-party model weights lack documented training corpus. Mitigation: vendor questionnaire + contractual warranty pending.' },
  { id: 'risk_008', name: 'Chatbot disclosure to end-users',              category: 'limited',      status: 'closed',      owner: ADMINS[0], lastReviewed: dayAgo(20), articles: ['AI Act Art. 50'],         desc: '"You are chatting with an AI" disclosure on session start. Implemented in v4.2; tested across 6 languages.' },
  { id: 'risk_009', name: 'Logging completeness (Art. 12 compliance)',    category: 'high',         status: 'in_progress', owner: ADMINS[5], lastReviewed: dayAgo(8),  articles: ['AI Act Art. 12'],         desc: 'Automatic generation of logs for high-risk systems. Implementation: outbox-based audit log + immutable storage, 99.97% delivery SLO.' },
  { id: 'risk_010', name: 'Human oversight interface for high-risk uses', category: 'high',         status: 'in_progress', owner: ADMINS[0], lastReviewed: dayAgo(3),  articles: ['AI Act Art. 14'],         desc: 'Operators must be able to stop, override, or interpret model outputs. Mitigation: oversight console with kill-switch and per-decision rationale view.' },
  { id: 'risk_011', name: 'Spam / template classifier for internal email',category: 'low',          status: 'closed',      owner: ADMINS[5], lastReviewed: dayAgo(45), articles: [],                          desc: 'Low-risk internal-tool classification. Documented for completeness.' },
  { id: 'risk_012', name: 'Cross-border data transfer (US sub-processor)',category: 'limited',      status: 'in_progress', owner: ADMINS[4], lastReviewed: dayAgo(7),  articles: ['GDPR Art. 44','GDPR Art. 46'], desc: 'Embedding model hosted on US-region inference. SCC + TIA documented; EU-region fallback under negotiation with vendor.' },
];

// ---------- Consent ----------
const CONSENT_FEATURES = [
  { id: 'chat_use',       name: 'Chat conversations used for product improvement', required: false },
  { id: 'kb_ingest',      name: 'Documents indexed in shared knowledge base',       required: true  },
  { id: 'eval_inclusion', name: 'Anonymized samples used in evaluation harness',    required: false },
  { id: 'profile_enrich', name: 'Profile enrichment via 3rd-party data',            required: false },
  { id: 'marketing',      name: 'Product marketing emails',                          required: false },
  { id: 'biometric_voice',name: 'Voice biometrics for hands-free authentication',   required: false },
];

const CONSENT_RATE = {
  chat_use:        { granted: 84.1, revoked: 5.2, never: 10.7, trend: [82,83,82,81,82,83,84,84,83,84,85,84.1] },
  kb_ingest:       { granted: 96.3, revoked: 1.1, never: 2.6,  trend: [95,95,95,96,96,96,96,96,96,96,96,96.3] },
  eval_inclusion:  { granted: 71.0, revoked: 8.4, never: 20.6, trend: [76,75,74,74,73,72,72,71,71,71,71,71.0] },
  profile_enrich:  { granted: 42.7, revoked: 18.3,never: 39.0, trend: [55,53,51,50,48,47,46,45,44,43,43,42.7] },
  marketing:       { granted: 51.4, revoked: 12.1,never: 36.5, trend: [56,55,54,53,53,52,52,51,52,51,51,51.4] },
  biometric_voice: { granted: 18.2, revoked: 2.4, never: 79.4, trend: [12,13,14,14,15,16,16,17,17,18,18,18.2] },
};

// ---------- Bias / cohort parity ----------
const COHORT_DIMENSIONS = [
  { id: 'language',    name: 'Language',     segments: ['EN','IT','DE','FR','ES','NL'] },
  { id: 'source',      name: 'Source',       segments: ['Web','API','Slack','Teams','Mobile'] },
  { id: 'canonical',   name: 'Canonical doc',segments: ['Internal','Public','Vendor','Legacy'] },
  { id: 'demographic', name: 'Demographic',  segments: ['18-25','26-40','41-60','60+'] },
];

const COHORT_DATA = {
  language: {
    overall: 0.873,
    rows: [
      { seg: 'EN', accuracy: 0.911, samples: 14_280, ciLow: 0.905, ciHigh: 0.917 },
      { seg: 'IT', accuracy: 0.834, samples:  6_142, ciLow: 0.825, ciHigh: 0.843 },
      { seg: 'DE', accuracy: 0.882, samples:  3_410, ciLow: 0.870, ciHigh: 0.894 },
      { seg: 'FR', accuracy: 0.876, samples:  2_980, ciLow: 0.863, ciHigh: 0.889 },
      { seg: 'ES', accuracy: 0.851, samples:  1_204, ciLow: 0.832, ciHigh: 0.870 },
      { seg: 'NL', accuracy: 0.864, samples:    612, ciLow: 0.836, ciHigh: 0.892 },
    ],
    drift: { // 90d, 1 value/week
      EN: [0.911,0.913,0.910,0.912,0.912,0.911,0.910,0.911,0.911,0.911,0.911,0.911,0.911],
      IT: [0.886,0.880,0.872,0.870,0.864,0.860,0.852,0.850,0.844,0.840,0.838,0.836,0.834],
      DE: [0.880,0.881,0.882,0.880,0.881,0.882,0.882,0.883,0.882,0.882,0.882,0.882,0.882],
      FR: [0.878,0.877,0.876,0.876,0.876,0.876,0.875,0.876,0.876,0.876,0.876,0.876,0.876],
      ES: [0.870,0.866,0.862,0.860,0.857,0.855,0.854,0.853,0.852,0.851,0.851,0.851,0.851],
      NL: [0.870,0.868,0.867,0.866,0.866,0.865,0.864,0.864,0.864,0.864,0.864,0.864,0.864],
    },
    samples: [
      { id: 's_a91', text: 'Come posso recedere dal contratto entro i termini di legge?', cohort: 'IT', expected: 'legal_advice_refusal', actual: 'free_advice', flagged: true },
      { id: 's_a92', text: 'Quali sono i diritti dei lavoratori in caso di licenziamento collettivo?', cohort: 'IT', expected: 'legal_advice_refusal', actual: 'partial_advice', flagged: true },
      { id: 's_a93', text: 'Devo dichiarare al fisco i compensi da consulenza?', cohort: 'IT', expected: 'tax_disclaimer', actual: 'direct_answer', flagged: true },
      { id: 's_a94', text: 'Quanto tempo ho per impugnare una multa?', cohort: 'IT', expected: 'legal_advice_refusal', actual: 'specific_advice', flagged: true },
    ],
  },
  source: {
    overall: 0.873,
    rows: [
      { seg: 'Web',    accuracy: 0.881, samples: 18_400, ciLow: 0.875, ciHigh: 0.887 },
      { seg: 'API',    accuracy: 0.892, samples:  8_120, ciLow: 0.885, ciHigh: 0.899 },
      { seg: 'Slack',  accuracy: 0.864, samples:  4_010, ciLow: 0.853, ciHigh: 0.875 },
      { seg: 'Teams',  accuracy: 0.851, samples:  1_882, ciLow: 0.835, ciHigh: 0.867 },
      { seg: 'Mobile', accuracy: 0.842, samples:  1_205, ciLow: 0.822, ciHigh: 0.862 },
    ],
  },
};

// ---------- Activity feed ----------
const ACTIVITY = [
  { at: minAgo(3),   kind: 'incident_opened',  actor: 'eval-harness',  text: 'Incident inc_2026_0043 opened — critical · PII redactor missed IBAN',  severity: 'critical' },
  { at: minAgo(14),  kind: 'dsar_breach',      actor: 'system',        text: 'DSAR dsar_2026_0139 breached 30-day SLA',                                severity: 'high' },
  { at: minAgo(31),  kind: 'consent_revoked',  actor: 'sofia.marino92@gmail.com', text: 'Consent revoked — feature: profile_enrich',                   severity: 'low' },
  { at: hrAgo(1.5),  kind: 'risk_reviewed',    actor: 'Giulia Amalfi', text: 'Risk risk_010 reviewed — human oversight interface mitigated',           severity: 'low' },
  { at: hrAgo(2),    kind: 'dsar_completed',   actor: 'Marco Conti',   text: 'DSAR dsar_2026_0137 marked completed — export delivered',                severity: 'low' },
  { at: hrAgo(3),    kind: 'incident_opened',  actor: 'system',        text: 'Incident inc_2026_0044 opened — hallucination on IT legal queries',     severity: 'high' },
  { at: hrAgo(4.2),  kind: 'bias_drift',       actor: 'cohort-monitor',text: 'Drift detected — language cohort IT, -2.4% over 7d',                     severity: 'medium' },
  { at: hrAgo(6),    kind: 'attestation',      actor: 'Giulia Amalfi', text: 'Generated Article 30 records of processing for Q2-2026',                severity: 'low' },
  { at: hrAgo(8),    kind: 'retention',        actor: 'Giulia Amalfi', text: 'Retention policy reviewed — Chat Logs (90d, no change)',                severity: 'low' },
  { at: hrAgo(11),   kind: 'dsar_opened',      actor: 'privacy-form',  text: 'DSAR dsar_2026_0138 opened — delete request',                            severity: 'medium' },
  { at: hrAgo(14),   kind: 'incident_closed',  actor: 'Davide Bianchi',text: 'Incident inc_2026_0038 closed — toxicity false-positive fixed',         severity: 'low' },
  { at: hrAgo(20),   kind: 'consent_revoked',  actor: 'roberto.galli@aruba.it', text: 'Consent revoked — feature: marketing',                         severity: 'low' },
  { at: dayAgo(1),   kind: 'risk_added',       actor: 'Stefano Lombardi', text: 'New risk risk_003 added — language cohort drift (IT)',               severity: 'medium' },
  { at: dayAgo(1.3), kind: 'dsar_completed',   actor: 'Marco Conti',   text: 'DSAR dsar_2026_0136 marked completed — delete cascade executed',         severity: 'low' },
  { at: dayAgo(2),   kind: 'webhook',          actor: 'system',        text: 'Webhook delivered — sentry.compliance.escalations (200 OK)',            severity: 'low' },
];

// ---------- DSAR queue depth chart (30d) ----------
const DSAR_QUEUE_30D = [3,3,4,4,5,4,3,3,2,2,3,4,5,5,5,4,4,3,2,3,4,5,6,7,7,6,5,5,4,5];

// ---------- Data flow (Sankey) for DPO Console ----------
const DATA_FLOW = {
  nodes: [
    // sources (left col)
    { id: 'src_kb',        label: 'KB Ingest',           col: 0, kind: 'source' },
    { id: 'src_chat',      label: 'Chat Sessions',       col: 0, kind: 'source' },
    { id: 'src_connector', label: 'Connectors (Slack…)', col: 0, kind: 'source' },
    { id: 'src_mcp',       label: 'MCP Tools',           col: 0, kind: 'source' },
    // processors (middle)
    { id: 'proc_pii',      label: 'PII Redactor',        col: 1, kind: 'processor' },
    { id: 'proc_embed',    label: 'Embedding Pipeline',  col: 1, kind: 'processor' },
    { id: 'proc_core',     label: 'AskMyDocs Core',      col: 2, kind: 'core' },
    // outputs (right col)
    { id: 'out_chat',      label: 'Chat Responses',      col: 3, kind: 'output' },
    { id: 'out_eval',      label: 'Eval Harness',        col: 3, kind: 'output' },
    { id: 'out_audit',     label: 'Audit Log (immutable)', col: 3, kind: 'output' },
    { id: 'out_attest',    label: 'Attestation Exports', col: 3, kind: 'output' },
  ],
  edges: [
    { from: 'src_chat',      to: 'proc_pii',   vol: 18_400, label: 'redacted' },
    { from: 'src_connector', to: 'proc_pii',   vol:  4_010, label: 'redacted' },
    { from: 'src_kb',        to: 'proc_embed', vol: 24,     label: 'documents' },
    { from: 'src_mcp',       to: 'proc_core',  vol:  2_182, label: 'tool calls' },
    { from: 'proc_pii',      to: 'proc_core',  vol: 22_410, label: 'sanitized' },
    { from: 'proc_embed',    to: 'proc_core',  vol: 24,     label: 'vectors' },
    { from: 'proc_core',     to: 'out_chat',   vol: 19_220, label: 'responses' },
    { from: 'proc_core',     to: 'out_eval',   vol:  3_810, label: 'samples (consented)' },
    { from: 'proc_core',     to: 'out_audit',  vol: 24_416, label: 'log entries' },
    { from: 'proc_core',     to: 'out_attest', vol:     12, label: 'records' },
  ],
};

// ---------- Retention policies ----------
const RETENTION = [
  { domain: 'Conversations',         days: 90,  lastReviewed: dayAgo(8),   reviewer: 'Giulia Amalfi', basis: 'GDPR Art. 5(1)(e)' },
  { domain: 'Chat embeddings',       days: 90,  lastReviewed: dayAgo(8),   reviewer: 'Giulia Amalfi', basis: 'GDPR Art. 5(1)(e)' },
  { domain: 'KB audit log',          days: 730, lastReviewed: dayAgo(14),  reviewer: 'Giulia Amalfi', basis: 'AI Act Art. 12' },
  { domain: 'Connector audit',       days: 365, lastReviewed: dayAgo(14),  reviewer: 'Giulia Amalfi', basis: 'AI Act Art. 12' },
  { domain: 'MCP tool audit',        days: 365, lastReviewed: dayAgo(14),  reviewer: 'Giulia Amalfi', basis: 'AI Act Art. 12' },
  { domain: 'Insights snapshots',    days: 180, lastReviewed: dayAgo(28),  reviewer: 'Giulia Amalfi', basis: 'Business need' },
  { domain: 'Incident records',      days: 2555,lastReviewed: dayAgo(40),  reviewer: 'Chiara Ferri',  basis: 'AI Act Art. 73 (7y)' },
  { domain: 'Risk register',         days: 2555,lastReviewed: dayAgo(40),  reviewer: 'Chiara Ferri',  basis: 'AI Act Art. 17 (7y)' },
];

// ---------- Deletion log ----------
const DELETION_LOG = [
  { at: hrAgo(0.5),  what: 'User#ds_06 — full cascade', rows: 1_847, cause: 'DSAR dsar_2026_0137', actor: 'Marco Conti' },
  { at: hrAgo(11),   what: 'Conversations (auto-prune)', rows: 412,  cause: 'auto-prune > 90d',     actor: 'system' },
  { at: dayAgo(1),   what: 'User#ds_07 — full cascade', rows: 4_201, cause: 'DSAR dsar_2026_0136', actor: 'Marco Conti' },
  { at: dayAgo(1),   what: 'Chat embeddings (auto-prune)', rows: 18_240, cause: 'auto-prune > 90d', actor: 'system' },
  { at: dayAgo(2),   what: 'Connector tokens — expired',   rows: 14,   cause: 'cleanup',           actor: 'system' },
  { at: dayAgo(4),   what: 'User#ds_15 — rectification',   rows: 6,    cause: 'DSAR dsar_2026_0130',actor: 'Marco Conti' },
];

// ---------- Settings sample ----------
const ENV_VARS = [
  { name: 'AICOMPLIANCE_DSAR_SLA_DAYS',       value: '30',         source: 'config',  module: 'DSAR' },
  { name: 'AICOMPLIANCE_DSAR_WARN_DAYS',      value: '5',          source: 'config',  module: 'DSAR' },
  { name: 'AICOMPLIANCE_BIAS_DRIFT_THRESHOLD',value: '0.05',       source: 'config',  module: 'Bias' },
  { name: 'AICOMPLIANCE_BIAS_WINDOW_DAYS',    value: '7',          source: 'config',  module: 'Bias' },
  { name: 'AICOMPLIANCE_PII_REDACTOR_KEY',    value: '*****a91f',  source: 'env',     module: 'Security' },
  { name: 'AICOMPLIANCE_WEBHOOK_SECRET',      value: '*****04ab',  source: 'env',     module: 'Webhooks' },
  { name: 'AICOMPLIANCE_RETENTION_CONV',      value: '90',         source: 'config',  module: 'Retention' },
  { name: 'AICOMPLIANCE_ATTESTATION_SIGNER',  value: 'Giulia Amalfi <dpo@padosoft.com>', source: 'config', module: 'Governance' },
  { name: 'AICOMPLIANCE_DRIFT_NOTIFY_SLACK',  value: '#compliance', source: 'config', module: 'Notifications' },
  { name: 'AICOMPLIANCE_AUDIT_RETENTION_DAYS',value: '2555',       source: 'config',  module: 'Retention' },
];

const FEATURE_FLAGS = [
  { id: 'disclosure',      name: 'AI Chatbot disclosure',          enabled: true,  articles: ['AI Act Art. 50'] },
  { id: 'risk_register',   name: 'Risk Register',                  enabled: true,  articles: ['AI Act Art. 9'] },
  { id: 'dsar',            name: 'DSAR queue',                     enabled: true,  articles: ['GDPR Art. 15-22'] },
  { id: 'consent',         name: 'Consent tracking',               enabled: true,  articles: ['GDPR Art. 7'] },
  { id: 'bias_monitor',    name: 'Bias monitor',                   enabled: true,  articles: ['AI Act Art. 10'] },
  { id: 'incidents',       name: 'Incident manager',               enabled: true,  articles: ['AI Act Art. 73'] },
  { id: 'webhooks',        name: 'Outbound webhooks',              enabled: true,  articles: [] },
  { id: 'auto_prune',      name: 'Automatic data pruning',         enabled: true,  articles: ['GDPR Art. 5(1)(e)'] },
  { id: 'attestation_pdf', name: 'Auditor-ready PDF attestations', enabled: true,  articles: ['AI Act Art. 11'] },
  { id: 'voice_biometric', name: 'Voice biometric auth (beta)',    enabled: false, articles: ['AI Act Art. 5(1)(f)'] },
];

Object.assign(window, {
  NOW, ADMINS, SUBJECTS,
  DSAR, DSAR_DETAIL_TIMELINE, DSAR_SCOPE, DSAR_QUEUE_30D,
  INCIDENTS, INCIDENT_DETAIL,
  RISKS,
  CONSENT_FEATURES, CONSENT_RATE,
  COHORT_DIMENSIONS, COHORT_DATA,
  ACTIVITY,
  DATA_FLOW, RETENTION, DELETION_LOG,
  ENV_VARS, FEATURE_FLAGS,
});
