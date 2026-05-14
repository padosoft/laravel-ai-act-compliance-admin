// ============== Mock data for AI Act Compliance Admin SPA ==============
// Ported verbatim from public/handoff/data.jsx so the design renders exactly
// as in the prototype. Production deployments wire these via the
// /api/admin/ai-act-compliance/* endpoints (TanStack Query hooks under
// src/api/) — the mock data is kept as the default development fixture and
// the fallback when the BE returns no rows yet.

export const NOW = new Date('2026-05-14T09:42:00Z').getTime();
export const dayAgo = (d: number) => NOW - d * 86_400_000;
export const hrAgo = (h: number) => NOW - h * 3_600_000;
export const minAgo = (m: number) => NOW - m * 60_000;

export interface Admin {
    id: string;
    name: string;
    email: string;
    role: string;
    initials: string;
}

export const ADMINS: Admin[] = [
    { id: 'u_amalfi', name: 'Giulia Amalfi', email: 'giulia.amalfi@padosoft.com', role: 'DPO', initials: 'GA' },
    { id: 'u_conti', name: 'Marco Conti', email: 'marco.conti@padosoft.com', role: 'Compliance Officer', initials: 'MC' },
    { id: 'u_dirosa', name: 'Elena Di Rosa', email: 'elena.dirosa@padosoft.com', role: 'CISO', initials: 'ED' },
    { id: 'u_lombardi', name: 'Stefano Lombardi', email: 'stefano.lombardi@padosoft.com', role: 'AI Risk Lead', initials: 'SL' },
    { id: 'u_ferri', name: 'Chiara Ferri', email: 'chiara.ferri@padosoft.com', role: 'Legal', initials: 'CF' },
    { id: 'u_bianchi', name: 'Davide Bianchi', email: 'davide.bianchi@padosoft.com', role: 'Eng Lead', initials: 'DB' },
];

export interface Subject {
    id: string;
    name: string;
    email: string;
    country: string;
}

export const SUBJECTS: Subject[] = [
    { id: 'ds_01', name: 'Alessandro Russo', email: 'alessandro.russo@gmail.com', country: 'IT' },
    { id: 'ds_02', name: 'Laura Greco', email: 'l.greco@protonmail.com', country: 'IT' },
    { id: 'ds_03', name: 'Matteo Ricci', email: 'mricci@outlook.it', country: 'IT' },
    { id: 'ds_04', name: 'Sofia Marino', email: 'sofia.marino92@gmail.com', country: 'IT' },
    { id: 'ds_05', name: 'Pieter Janssen', email: 'p.janssen@kpn.nl', country: 'NL' },
    { id: 'ds_06', name: 'Camille Dubois', email: 'camille.dubois@orange.fr', country: 'FR' },
    { id: 'ds_07', name: 'Tomás Fernández', email: 't.fernandez@telefonica.es', country: 'ES' },
    { id: 'ds_08', name: 'Anja Müller', email: 'anja.mueller@gmx.de', country: 'DE' },
    { id: 'ds_09', name: 'Francesca Romano', email: 'f.romano@libero.it', country: 'IT' },
    { id: 'ds_10', name: 'Lucia Esposito', email: 'lucia.e@fastwebnet.it', country: 'IT' },
    { id: 'ds_11', name: 'Roberto Galli', email: 'r.galli@aruba.it', country: 'IT' },
    { id: 'ds_12', name: 'Giorgio Vitale', email: 'giorgio.vitale@tin.it', country: 'IT' },
    { id: 'ds_13', name: 'Marta Colombo', email: 'marta.colombo@gmail.com', country: 'IT' },
    { id: 'ds_14', name: 'Nicolas Petit', email: 'n.petit@free.fr', country: 'FR' },
];

export type DsarType = 'export' | 'delete' | 'rectify';
export type DsarStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';

export interface DsarRequest {
    id: string;
    subject: Subject;
    type: DsarType;
    status: DsarStatus;
    opened: number;
    dueIn: number;
    articles: string[];
    assignee: Admin | null;
    closed?: number;
}

export const DSAR: DsarRequest[] = [
    { id: 'dsar_2026_0142', subject: SUBJECTS[0], type: 'export', status: 'in_progress', opened: dayAgo(2), dueIn: 28, articles: ['GDPR Art. 15'], assignee: ADMINS[1] },
    { id: 'dsar_2026_0141', subject: SUBJECTS[1], type: 'delete', status: 'pending', opened: dayAgo(28), dueIn: 2, articles: ['GDPR Art. 17', 'AI Act Art. 50'], assignee: null },
    { id: 'dsar_2026_0140', subject: SUBJECTS[2], type: 'rectify', status: 'in_progress', opened: dayAgo(5), dueIn: 25, articles: ['GDPR Art. 16'], assignee: ADMINS[1] },
    { id: 'dsar_2026_0139', subject: SUBJECTS[3], type: 'export', status: 'pending', opened: dayAgo(31), dueIn: -1, articles: ['GDPR Art. 15'], assignee: null },
    { id: 'dsar_2026_0138', subject: SUBJECTS[4], type: 'delete', status: 'pending', opened: hrAgo(6), dueIn: 30, articles: ['GDPR Art. 17'], assignee: null },
    { id: 'dsar_2026_0137', subject: SUBJECTS[5], type: 'export', status: 'completed', opened: dayAgo(14), dueIn: 16, articles: ['GDPR Art. 15'], assignee: ADMINS[0], closed: dayAgo(3) },
    { id: 'dsar_2026_0136', subject: SUBJECTS[6], type: 'delete', status: 'completed', opened: dayAgo(22), dueIn: 8, articles: ['GDPR Art. 17'], assignee: ADMINS[1], closed: dayAgo(9) },
    { id: 'dsar_2026_0135', subject: SUBJECTS[7], type: 'rectify', status: 'rejected', opened: dayAgo(18), dueIn: 12, articles: ['GDPR Art. 16'], assignee: ADMINS[0], closed: dayAgo(11) },
    { id: 'dsar_2026_0134', subject: SUBJECTS[8], type: 'export', status: 'in_progress', opened: dayAgo(7), dueIn: 23, articles: ['GDPR Art. 15'], assignee: ADMINS[1] },
    { id: 'dsar_2026_0133', subject: SUBJECTS[9], type: 'delete', status: 'in_progress', opened: dayAgo(11), dueIn: 19, articles: ['GDPR Art. 17'], assignee: ADMINS[0] },
    { id: 'dsar_2026_0132', subject: SUBJECTS[10], type: 'export', status: 'completed', opened: dayAgo(40), dueIn: 0, articles: ['GDPR Art. 15'], assignee: ADMINS[1], closed: dayAgo(18) },
    { id: 'dsar_2026_0131', subject: SUBJECTS[11], type: 'export', status: 'completed', opened: dayAgo(52), dueIn: 0, articles: ['GDPR Art. 15'], assignee: ADMINS[1], closed: dayAgo(28) },
];

export interface DsarTimelineEntry {
    at: number;
    actor: string;
    event: string;
    label: string;
}

export const DSAR_DETAIL_TIMELINE: Record<string, DsarTimelineEntry[]> = {
    dsar_2026_0141: [
        { at: dayAgo(28), actor: 'system', event: 'created', label: 'Request received via privacy@padosoft.com' },
        { at: dayAgo(28), actor: 'system', event: 'identity_verified', label: 'Identity verified via SPID handshake' },
        { at: dayAgo(27), actor: 'Marco Conti', event: 'triage_assigned', label: 'Triaged — assigned to DPO queue' },
        { at: dayAgo(26), actor: 'system', event: 'scope_resolved', label: 'Resolved 4 data domains, 1,284 rows' },
        { at: dayAgo(25), actor: 'Marco Conti', event: 'note', label: 'Awaiting legal review for processor cascade' },
        { at: dayAgo(2), actor: 'system', event: 'sla_warning', label: 'SLA breach in 2 days — escalation triggered' },
    ],
};

export interface DsarScopeRow {
    domain: string;
    rows: number;
    retention: string;
    policy: string;
}

export const DSAR_SCOPE: Record<string, DsarScopeRow[]> = {
    dsar_2026_0141: [
        { domain: 'Conversations', rows: 412, retention: '90d', policy: 'auto-purge' },
        { domain: 'Chat embeddings', rows: 1_847, retention: '90d', policy: 'auto-purge' },
        { domain: 'KB ingest activity', rows: 24, retention: '2y', policy: 'audit-only' },
        { domain: 'Connector installations', rows: 1, retention: 'while-active', policy: 'manual' },
    ],
};

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentState = 'open' | 'triage' | 'mitigating' | 'closed';

export interface Incident {
    id: string;
    title: string;
    severity: IncidentSeverity;
    state: IncidentState;
    opened: number;
    closed?: number;
    assignee: Admin | null;
    affected: number;
    articles: string[];
    tags: string[];
}

export const INCIDENTS: Incident[] = [
    { id: 'inc_2026_0044', title: 'Hallucination on legal-domain queries (IT cohort)', severity: 'high', state: 'open', opened: hrAgo(3), assignee: ADMINS[3], affected: 124, articles: ['AI Act Art. 14', 'AI Act Art. 15'], tags: ['hallucination', 'high-risk'] },
    { id: 'inc_2026_0043', title: 'PII redactor missed IBAN in 3 chat logs', severity: 'critical', state: 'open', opened: hrAgo(1), assignee: ADMINS[2], affected: 3, articles: ['GDPR Art. 32', 'GDPR Art. 33'], tags: ['data-leak', 'breach'] },
    { id: 'inc_2026_0042', title: 'Connector OAuth refresh failure — Slack workspace', severity: 'low', state: 'open', opened: hrAgo(11), assignee: null, affected: 8, articles: [], tags: ['integration'] },
    { id: 'inc_2026_0041', title: 'KB ingest pipeline rejected 4% of documents', severity: 'medium', state: 'triage', opened: hrAgo(18), assignee: ADMINS[5], affected: 0, articles: ['AI Act Art. 10'], tags: ['data-quality'] },
    { id: 'inc_2026_0040', title: 'Eval-harness flagged demographic drift (gender)', severity: 'high', state: 'triage', opened: dayAgo(1), assignee: ADMINS[3], affected: 47, articles: ['AI Act Art. 10', 'AI Act Art. 15'], tags: ['bias', 'drift'] },
    { id: 'inc_2026_0039', title: 'Rate-limit bypass on /chat for one workspace', severity: 'medium', state: 'mitigating', opened: dayAgo(2), assignee: ADMINS[5], affected: 0, articles: ['AI Act Art. 15'], tags: ['security', 'abuse'] },
    { id: 'inc_2026_0038', title: 'False positive on toxicity classifier (DE cohort)', severity: 'medium', state: 'closed', opened: dayAgo(5), closed: dayAgo(1), assignee: ADMINS[3], affected: 22, articles: ['AI Act Art. 10'], tags: ['bias'] },
    { id: 'inc_2026_0037', title: 'Logging gap on MCP tool invocations (12h)', severity: 'low', state: 'closed', opened: dayAgo(7), closed: dayAgo(4), assignee: ADMINS[5], affected: 0, articles: ['AI Act Art. 12'], tags: ['observability'] },
];

export interface IncidentDetail {
    description: string;
    timeline: { at: number; actor: string; event: string; label: string }[];
    mitigations: { at: number; actor: string; text: string }[];
    escalation: { level: string; recipients: string[]; notified: boolean }[];
    affectedUsers: Subject[];
}

export const INCIDENT_DETAIL: Record<string, IncidentDetail> = {
    inc_2026_0043: {
        description: 'PII redactor (v2.4.1) failed to match Italian IBAN format in three customer-support chat sessions on 2026-05-13. Three IBAN strings were stored in plain text in the chat log table for ~6 hours before the v2.4.2 hot-fix.',
        timeline: [
            { at: hrAgo(1), actor: 'eval-harness', event: 'detected', label: 'PII canary triggered on IBAN pattern' },
            { at: hrAgo(0.8), actor: 'system', event: 'auto_routed', label: 'Routed to CISO per escalation policy (severity: critical)' },
            { at: hrAgo(0.5), actor: 'Elena Di Rosa', event: 'assigned', label: 'Self-assigned, opened war-room channel' },
        ],
        mitigations: [
            { at: hrAgo(0.3), actor: 'Davide Bianchi', text: 'Deployed v2.4.2 with extended IBAN regex (ISO 13616). PII redactor backfill scheduled.' },
        ],
        escalation: [
            { level: 'critical', recipients: ['CISO', 'DPO', 'CEO'], notified: true },
            { level: 'high', recipients: ['Eng Lead'], notified: true },
        ],
        affectedUsers: SUBJECTS.slice(0, 3),
    },
};

export type RiskCategory = 'unacceptable' | 'high' | 'limited' | 'low';
export type RiskStatus = 'open' | 'in_progress' | 'closed';

export interface Risk {
    id: string;
    name: string;
    category: RiskCategory;
    status: RiskStatus;
    owner: Admin;
    lastReviewed: number;
    articles: string[];
    desc: string;
}

export const RISKS: Risk[] = [
    { id: 'risk_001', name: 'Biometric categorization in support tickets', category: 'unacceptable', status: 'closed', owner: ADMINS[4], lastReviewed: dayAgo(12), articles: ['AI Act Art. 5'], desc: 'Inadvertent inference of protected attributes from free-text support tickets. Mitigation: removed from training pipeline; banned in production prompts.' },
    { id: 'risk_002', name: 'Hallucinated legal advice (IT jurisdiction)', category: 'high', status: 'in_progress', owner: ADMINS[3], lastReviewed: dayAgo(4), articles: ['AI Act Art. 6', 'AI Act Annex III §8'], desc: 'Chat agent may produce confident-sounding legal interpretations. Mitigation: domain detector + mandatory disclaimer + retrieval-only mode.' },
    { id: 'risk_003', name: 'Cohort accuracy drift (language: Italian)', category: 'high', status: 'open', owner: ADMINS[3], lastReviewed: dayAgo(2), articles: ['AI Act Art. 10', 'AI Act Art. 15'], desc: 'Italian-language responses underperform English baseline by 8%. Mitigation in progress: additional eval set + retraining slice.' },
    { id: 'risk_004', name: 'CV screening for HR partner integration', category: 'high', status: 'in_progress', owner: ADMINS[4], lastReviewed: dayAgo(9), articles: ['AI Act Annex III §4'], desc: 'Reseller wants resume ranking. High-risk per Annex III. Mitigation: human-in-the-loop required, transparency notice, fundamental-rights impact assessment in progress.' },
    { id: 'risk_005', name: 'Emotion recognition from voice transcript', category: 'high', status: 'closed', owner: ADMINS[4], lastReviewed: dayAgo(30), articles: ['AI Act Art. 5(1)(f)'], desc: 'Feature request refused at design phase. Documented in risk register for audit trail.' },
    { id: 'risk_006', name: 'Deepfake / synthetic content disclosure', category: 'limited', status: 'in_progress', owner: ADMINS[0], lastReviewed: dayAgo(6), articles: ['AI Act Art. 50'], desc: 'AI-generated text must be watermarked/labelled. Implementation: auto-disclosure footer in chat responses, opt-out for internal use.' },
    { id: 'risk_007', name: 'Training data provenance gaps', category: 'high', status: 'open', owner: ADMINS[1], lastReviewed: dayAgo(18), articles: ['AI Act Art. 10', 'GDPR Art. 6'], desc: 'Third-party model weights lack documented training corpus. Mitigation: vendor questionnaire + contractual warranty pending.' },
    { id: 'risk_008', name: 'Chatbot disclosure to end-users', category: 'limited', status: 'closed', owner: ADMINS[0], lastReviewed: dayAgo(20), articles: ['AI Act Art. 50'], desc: '"You are chatting with an AI" disclosure on session start. Implemented in v4.2; tested across 6 languages.' },
    { id: 'risk_009', name: 'Logging completeness (Art. 12 compliance)', category: 'high', status: 'in_progress', owner: ADMINS[5], lastReviewed: dayAgo(8), articles: ['AI Act Art. 12'], desc: 'Automatic generation of logs for high-risk systems. Implementation: outbox-based audit log + immutable storage, 99.97% delivery SLO.' },
    { id: 'risk_010', name: 'Human oversight interface for high-risk uses', category: 'high', status: 'in_progress', owner: ADMINS[0], lastReviewed: dayAgo(3), articles: ['AI Act Art. 14'], desc: 'Operators must be able to stop, override, or interpret model outputs. Mitigation: oversight console with kill-switch and per-decision rationale view.' },
    { id: 'risk_011', name: 'Spam / template classifier for internal email', category: 'low', status: 'closed', owner: ADMINS[5], lastReviewed: dayAgo(45), articles: [], desc: 'Low-risk internal-tool classification. Documented for completeness.' },
    { id: 'risk_012', name: 'Cross-border data transfer (US sub-processor)', category: 'limited', status: 'in_progress', owner: ADMINS[4], lastReviewed: dayAgo(7), articles: ['GDPR Art. 44', 'GDPR Art. 46'], desc: 'Embedding model hosted on US-region inference. SCC + TIA documented; EU-region fallback under negotiation with vendor.' },
];

// FRIA — Fundamental Rights Impact Assessment (AI Act Art. 27).
// Mirrors the FriaAssessment Eloquent model in
// `padosoft/laravel-ai-act-compliance` (status enum, JSON columns,
// review cadence + sign-off audit fields).
export type FriaStatus = 'draft' | 'active' | 'review_due' | 'retired';

export interface FriaAssessment {
    id: string;
    title: string;
    scope: string;
    status: FriaStatus;
    projectKey: string | null;
    risks: string[];
    mitigations: Record<string, string>;
    reviewCadenceDays: number;
    nextReviewAt: number | null;
    openedBy: Admin;
    signedOffBy: Admin | null;
    signedOffAt: number | null;
}

export const FRIA: FriaAssessment[] = [
    {
        id: 'fria_001',
        title: 'CV screening for HR partner',
        scope: 'AI-assisted resume ranking in the recruiting workspace. Annex III §4 (employment).',
        status: 'active',
        projectKey: 'hr-portal',
        risks: ['discrimination_by_age', 'historic_bias_in_training_data', 'opaque_ranking'],
        mitigations: {
            human_review_threshold: 'Mandatory human-in-the-loop for every shortlisted candidate.',
            transparency_notice: 'Explicit AI-assistance disclosure in the candidate journey.',
            audit_logging: 'Per-decision audit log retained 24 months.',
        },
        reviewCadenceDays: 90,
        nextReviewAt: NOW + 32 * 86_400_000,
        openedBy: ADMINS[0],
        signedOffBy: ADMINS[0],
        signedOffAt: dayAgo(58),
    },
    {
        id: 'fria_002',
        title: 'Customer support agent — IT/EN',
        scope: 'Conversational AI answering customer queries. Art. 50 transparency obligations.',
        status: 'active',
        projectKey: 'support',
        risks: ['hallucinated_advice', 'cohort_accuracy_drift_italian'],
        mitigations: {
            retrieval_grounding: 'Answer only from internal KB (RAG); refuse on missing context.',
            disclosure_header: 'X-AI-Disclosure header + UI watermark on every response.',
        },
        reviewCadenceDays: 180,
        nextReviewAt: NOW + 90 * 86_400_000,
        openedBy: ADMINS[3],
        signedOffBy: ADMINS[4],
        signedOffAt: dayAgo(12),
    },
    {
        id: 'fria_003',
        title: 'Compliance assistant (internal tooling)',
        scope: 'Internal LLM-backed assistant for DPO + legal team. Low-risk per Annex III.',
        status: 'draft',
        projectKey: 'compliance',
        risks: ['data_leakage_through_prompts'],
        mitigations: {
            pii_redactor: 'Default-on PII redaction at the request boundary.',
        },
        reviewCadenceDays: 180,
        nextReviewAt: null,
        openedBy: ADMINS[1],
        signedOffBy: null,
        signedOffAt: null,
    },
    {
        id: 'fria_004',
        title: 'Bias monitoring across cohort dimensions',
        scope: 'Continuous bias monitor across language + role + tenant cohorts. Art. 10 / Art. 15.',
        status: 'review_due',
        projectKey: null,
        risks: ['undetected_cohort_regression', 'metric_dilution_by_aggregate'],
        mitigations: {
            adversarial_nightly: 'Nightly adversarial eval; alerts on per-lane regressions.',
            cohort_dashboard: 'Per-dimension accuracy panels in admin SPA.',
        },
        reviewCadenceDays: 30,
        nextReviewAt: NOW - 4 * 86_400_000,
        openedBy: ADMINS[3],
        signedOffBy: ADMINS[3],
        signedOffAt: dayAgo(34),
    },
    {
        id: 'fria_005',
        title: 'Deprecated voice-emotion experiment',
        scope: 'Refused at design phase. Retained in register for audit trail. Art. 5(1)(f).',
        status: 'retired',
        projectKey: 'r-and-d',
        risks: ['fundamental_rights_breach_emotion_recognition'],
        mitigations: {
            outright_refusal: 'Feature blocked at intake; documented in compliance attestation.',
        },
        reviewCadenceDays: 180,
        nextReviewAt: null,
        openedBy: ADMINS[4],
        signedOffBy: ADMINS[4],
        signedOffAt: dayAgo(220),
    },
];

export interface ConsentFeature {
    id: string;
    name: string;
    required: boolean;
}

export const CONSENT_FEATURES: ConsentFeature[] = [
    { id: 'chat_use', name: 'Chat conversations used for product improvement', required: false },
    { id: 'kb_ingest', name: 'Documents indexed in shared knowledge base', required: true },
    { id: 'eval_inclusion', name: 'Anonymized samples used in evaluation harness', required: false },
    { id: 'profile_enrich', name: 'Profile enrichment via 3rd-party data', required: false },
    { id: 'marketing', name: 'Product marketing emails', required: false },
    { id: 'biometric_voice', name: 'Voice biometrics for hands-free authentication', required: false },
];

export interface ConsentRate {
    granted: number;
    revoked: number;
    never: number;
    trend: number[];
}

export const CONSENT_RATE: Record<string, ConsentRate> = {
    chat_use: { granted: 84.1, revoked: 5.2, never: 10.7, trend: [82, 83, 82, 81, 82, 83, 84, 84, 83, 84, 85, 84.1] },
    kb_ingest: { granted: 96.3, revoked: 1.1, never: 2.6, trend: [95, 95, 95, 96, 96, 96, 96, 96, 96, 96, 96, 96.3] },
    eval_inclusion: { granted: 71.0, revoked: 8.4, never: 20.6, trend: [76, 75, 74, 74, 73, 72, 72, 71, 71, 71, 71, 71.0] },
    profile_enrich: { granted: 42.7, revoked: 18.3, never: 39.0, trend: [55, 53, 51, 50, 48, 47, 46, 45, 44, 43, 43, 42.7] },
    marketing: { granted: 51.4, revoked: 12.1, never: 36.5, trend: [56, 55, 54, 53, 53, 52, 52, 51, 52, 51, 51, 51.4] },
    biometric_voice: { granted: 18.2, revoked: 2.4, never: 79.4, trend: [12, 13, 14, 14, 15, 16, 16, 17, 17, 18, 18, 18.2] },
};

// v1.2 — Pluggable parity metrics surface. Mirrors the
// `bias.metrics` config in padosoft/laravel-ai-act-compliance v1.2.
// In production the FE fetches this list from
// `GET /api/admin/ai-act-compliance/bias/metrics` so a host-app
// custom metric appears without a SPA bump; this fixture is the
// dev/seed fallback when the metadata endpoint is unreachable.
export interface BiasMetricMeta {
    id: string;
    label: string;
    description: string;
    articleEvidence: string[];
}

export const BIAS_METRICS: BiasMetricMeta[] = [
    {
        id: 'demographic_parity',
        label: 'Demographic Parity',
        description: 'P(prediction = positive | cohort) parity across cohorts.',
        articleEvidence: ['AI Act Art. 10', 'AI Act Art. 15'],
    },
    {
        id: 'equalized_odds',
        label: 'Equalized Odds',
        description: 'TPR + FPR parity per cohort; max(TPR-spread, FPR-spread).',
        articleEvidence: ['AI Act Art. 10', 'AI Act Art. 15'],
    },
    {
        id: 'calibration',
        label: 'Calibration',
        description: '|mean(score) − mean(label)| per cohort.',
        articleEvidence: ['AI Act Art. 15'],
    },
];

// v1.2 — Per-metric cohort dataset. The chart numbers MUST change
// when the operator switches between Demographic Parity / Equalized
// Odds / Calibration — otherwise the UI would show the SAME numbers
// under a different metric label and mislead reviewers. The per-
// metric variants are derived from the default accuracy-parity data
// via metric-specific transforms:
//   - demographic_parity: accuracy-as-positive-rate (the default).
//   - equalized_odds: monotone-decreasing transform — TPR + FPR
//     composites tend to surface a LOWER overall metric vs raw
//     accuracy, so we scale down by 0.7 and shift down by 0.15 to
//     produce a believable EO score from accuracy data.
//   - calibration: a |x − overall| transform applied AFTER bounding
//     the CI by min/max so the absolute-value step doesn't flip
//     ciLow > ciHigh on cohorts below the overall accuracy.
// In production the FE swaps these fixtures for the live
// `GET /api/admin/ai-act-compliance/bias/snapshots` payload (same
// shape) so the same component renders both.
export function biasMetricDataFor(metricId: string, source: CohortData): CohortData {
    switch (metricId) {
        case 'equalized_odds':
            return transformCohortData(source, (accuracy) => 0.7 * accuracy + 0.15);
        case 'calibration':
            return transformCalibration(source);
        case 'demographic_parity':
        default:
            return source;
    }
}

function transformCohortData(source: CohortData, transform: (accuracy: number) => number): CohortData {
    return {
        overall: round6(transform(source.overall)),
        rows: source.rows.map((row) => {
            // For monotone transforms the CI bounds preserve order; we
            // still defensively bound by min/max so non-monotone
            // transforms (e.g. calibration's |x − overall| variant
            // routed through this helper) cannot invert the interval.
            const lo = round6(transform(row.ciLow));
            const hi = round6(transform(row.ciHigh));
            return {
                seg: row.seg,
                samples: row.samples,
                accuracy: round6(transform(row.accuracy)),
                ciLow: Math.min(lo, hi),
                ciHigh: Math.max(lo, hi),
            };
        }),
        // Drift is also transformed — leaving it on the original
        // accuracy scale would show demographic-parity drift behind
        // a different metric label, which misleads reviewers. The
        // per-week values get the same transform so the chart
        // remains in-scale.
        drift: source.drift
            ? Object.fromEntries(
                  Object.entries(source.drift).map(([cohort, series]) => [
                      cohort,
                      series.map((value) => round6(transform(value))),
                  ]),
              )
            : undefined,
        samples: source.samples,
    };
}

function transformCalibration(source: CohortData): CohortData {
    // Calibration is a GAP metric. Apply |x − overall| × 1.5, but
    // compute it on the row.accuracy SCORE first, then derive the CI
    // bounds independently — the abs() step is non-monotone, so we
    // can't reuse the linear transform helper's CI-preservation.
    const gap = (x: number) => Math.abs(x - source.overall) * 1.5;
    return {
        overall: 0, // perfect calibration baseline; cohorts deviate
        rows: source.rows.map((row) => {
            const score = round6(gap(row.accuracy));
            const lo = round6(gap(row.ciLow));
            const hi = round6(gap(row.ciHigh));
            return {
                seg: row.seg,
                samples: row.samples,
                accuracy: score,
                ciLow: Math.min(lo, hi),
                ciHigh: Math.max(lo, hi),
            };
        }),
        drift: source.drift
            ? Object.fromEntries(
                  Object.entries(source.drift).map(([cohort, series]) => [
                      cohort,
                      series.map((value) => round6(gap(value))),
                  ]),
              )
            : undefined,
        samples: source.samples,
    };
}

function round6(value: number): number {
    return Math.round(value * 1_000_000) / 1_000_000;
}

export interface CohortDimension {
    id: string;
    name: string;
    segments: string[];
}

export const COHORT_DIMENSIONS: CohortDimension[] = [
    { id: 'language', name: 'Language', segments: ['EN', 'IT', 'DE', 'FR', 'ES', 'NL'] },
    { id: 'source', name: 'Source', segments: ['Web', 'API', 'Slack', 'Teams', 'Mobile'] },
    { id: 'canonical', name: 'Canonical doc', segments: ['Internal', 'Public', 'Vendor', 'Legacy'] },
    { id: 'demographic', name: 'Demographic', segments: ['18-25', '26-40', '41-60', '60+'] },
];

export interface CohortRow {
    seg: string;
    accuracy: number;
    samples: number;
    ciLow: number;
    ciHigh: number;
}

export interface CohortSample {
    id: string;
    text: string;
    cohort: string;
    expected: string;
    actual: string;
    flagged: boolean;
}

export interface CohortData {
    overall: number;
    rows: CohortRow[];
    drift?: Record<string, number[]>;
    samples?: CohortSample[];
}

export const COHORT_DATA: Record<string, CohortData> = {
    language: {
        overall: 0.873,
        rows: [
            { seg: 'EN', accuracy: 0.911, samples: 14_280, ciLow: 0.905, ciHigh: 0.917 },
            { seg: 'IT', accuracy: 0.834, samples: 6_142, ciLow: 0.825, ciHigh: 0.843 },
            { seg: 'DE', accuracy: 0.882, samples: 3_410, ciLow: 0.870, ciHigh: 0.894 },
            { seg: 'FR', accuracy: 0.876, samples: 2_980, ciLow: 0.863, ciHigh: 0.889 },
            { seg: 'ES', accuracy: 0.851, samples: 1_204, ciLow: 0.832, ciHigh: 0.870 },
            { seg: 'NL', accuracy: 0.864, samples: 612, ciLow: 0.836, ciHigh: 0.892 },
        ],
        drift: {
            EN: [0.911, 0.913, 0.910, 0.912, 0.912, 0.911, 0.910, 0.911, 0.911, 0.911, 0.911, 0.911, 0.911],
            IT: [0.886, 0.880, 0.872, 0.870, 0.864, 0.860, 0.852, 0.850, 0.844, 0.840, 0.838, 0.836, 0.834],
            DE: [0.880, 0.881, 0.882, 0.880, 0.881, 0.882, 0.882, 0.883, 0.882, 0.882, 0.882, 0.882, 0.882],
            FR: [0.878, 0.877, 0.876, 0.876, 0.876, 0.876, 0.875, 0.876, 0.876, 0.876, 0.876, 0.876, 0.876],
            ES: [0.870, 0.866, 0.862, 0.860, 0.857, 0.855, 0.854, 0.853, 0.852, 0.851, 0.851, 0.851, 0.851],
            NL: [0.870, 0.868, 0.867, 0.866, 0.866, 0.865, 0.864, 0.864, 0.864, 0.864, 0.864, 0.864, 0.864],
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
            { seg: 'Web', accuracy: 0.881, samples: 18_400, ciLow: 0.875, ciHigh: 0.887 },
            { seg: 'API', accuracy: 0.892, samples: 8_120, ciLow: 0.885, ciHigh: 0.899 },
            { seg: 'Slack', accuracy: 0.864, samples: 4_010, ciLow: 0.853, ciHigh: 0.875 },
            { seg: 'Teams', accuracy: 0.851, samples: 1_882, ciLow: 0.835, ciHigh: 0.867 },
            { seg: 'Mobile', accuracy: 0.842, samples: 1_205, ciLow: 0.822, ciHigh: 0.862 },
        ],
    },
};

export interface ActivityEntry {
    at: number;
    kind: string;
    actor: string;
    text: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export const ACTIVITY: ActivityEntry[] = [
    { at: minAgo(3), kind: 'incident_opened', actor: 'eval-harness', text: 'Incident inc_2026_0043 opened — critical · PII redactor missed IBAN', severity: 'critical' },
    { at: minAgo(14), kind: 'dsar_breach', actor: 'system', text: 'DSAR dsar_2026_0139 breached 30-day SLA', severity: 'high' },
    { at: minAgo(31), kind: 'consent_revoked', actor: 'sofia.marino92@gmail.com', text: 'Consent revoked — feature: profile_enrich', severity: 'low' },
    { at: hrAgo(1.5), kind: 'risk_reviewed', actor: 'Giulia Amalfi', text: 'Risk risk_010 reviewed — human oversight interface mitigated', severity: 'low' },
    { at: hrAgo(2), kind: 'dsar_completed', actor: 'Marco Conti', text: 'DSAR dsar_2026_0137 marked completed — export delivered', severity: 'low' },
    { at: hrAgo(3), kind: 'incident_opened', actor: 'system', text: 'Incident inc_2026_0044 opened — hallucination on IT legal queries', severity: 'high' },
    { at: hrAgo(4.2), kind: 'bias_drift', actor: 'cohort-monitor', text: 'Drift detected — language cohort IT, -2.4% over 7d', severity: 'medium' },
    { at: hrAgo(6), kind: 'attestation', actor: 'Giulia Amalfi', text: 'Generated Article 30 records of processing for Q2-2026', severity: 'low' },
    { at: hrAgo(8), kind: 'retention', actor: 'Giulia Amalfi', text: 'Retention policy reviewed — Chat Logs (90d, no change)', severity: 'low' },
    { at: hrAgo(11), kind: 'dsar_opened', actor: 'privacy-form', text: 'DSAR dsar_2026_0138 opened — delete request', severity: 'medium' },
    { at: hrAgo(14), kind: 'incident_closed', actor: 'Davide Bianchi', text: 'Incident inc_2026_0038 closed — toxicity false-positive fixed', severity: 'low' },
    { at: hrAgo(20), kind: 'consent_revoked', actor: 'roberto.galli@aruba.it', text: 'Consent revoked — feature: marketing', severity: 'low' },
    { at: dayAgo(1), kind: 'risk_added', actor: 'Stefano Lombardi', text: 'New risk risk_003 added — language cohort drift (IT)', severity: 'medium' },
    { at: dayAgo(1.3), kind: 'dsar_completed', actor: 'Marco Conti', text: 'DSAR dsar_2026_0136 marked completed — delete cascade executed', severity: 'low' },
    { at: dayAgo(2), kind: 'webhook', actor: 'system', text: 'Webhook delivered — sentry.compliance.escalations (200 OK)', severity: 'low' },
];

export const DSAR_QUEUE_30D = [3, 3, 4, 4, 5, 4, 3, 3, 2, 2, 3, 4, 5, 5, 5, 4, 4, 3, 2, 3, 4, 5, 6, 7, 7, 6, 5, 5, 4, 5];

export interface DataFlowNode {
    id: string;
    label: string;
    col: number;
    kind: 'source' | 'processor' | 'core' | 'output';
}

export interface DataFlowEdge {
    from: string;
    to: string;
    vol: number;
    label: string;
}

export const DATA_FLOW: { nodes: DataFlowNode[]; edges: DataFlowEdge[] } = {
    nodes: [
        { id: 'src_kb', label: 'KB Ingest', col: 0, kind: 'source' },
        { id: 'src_chat', label: 'Chat Sessions', col: 0, kind: 'source' },
        { id: 'src_connector', label: 'Connectors (Slack…)', col: 0, kind: 'source' },
        { id: 'src_mcp', label: 'MCP Tools', col: 0, kind: 'source' },
        { id: 'proc_pii', label: 'PII Redactor', col: 1, kind: 'processor' },
        { id: 'proc_embed', label: 'Embedding Pipeline', col: 1, kind: 'processor' },
        { id: 'proc_core', label: 'AskMyDocs Core', col: 2, kind: 'core' },
        { id: 'out_chat', label: 'Chat Responses', col: 3, kind: 'output' },
        { id: 'out_eval', label: 'Eval Harness', col: 3, kind: 'output' },
        { id: 'out_audit', label: 'Audit Log (immutable)', col: 3, kind: 'output' },
        { id: 'out_attest', label: 'Attestation Exports', col: 3, kind: 'output' },
    ],
    edges: [
        { from: 'src_chat', to: 'proc_pii', vol: 18_400, label: 'redacted' },
        { from: 'src_connector', to: 'proc_pii', vol: 4_010, label: 'redacted' },
        { from: 'src_kb', to: 'proc_embed', vol: 24, label: 'documents' },
        { from: 'src_mcp', to: 'proc_core', vol: 2_182, label: 'tool calls' },
        { from: 'proc_pii', to: 'proc_core', vol: 22_410, label: 'sanitized' },
        { from: 'proc_embed', to: 'proc_core', vol: 24, label: 'vectors' },
        { from: 'proc_core', to: 'out_chat', vol: 19_220, label: 'responses' },
        { from: 'proc_core', to: 'out_eval', vol: 3_810, label: 'samples (consented)' },
        { from: 'proc_core', to: 'out_audit', vol: 24_416, label: 'log entries' },
        { from: 'proc_core', to: 'out_attest', vol: 12, label: 'records' },
    ],
};

export interface RetentionPolicy {
    domain: string;
    days: number;
    lastReviewed: number;
    reviewer: string;
    basis: string;
}

export const RETENTION: RetentionPolicy[] = [
    { domain: 'Conversations', days: 90, lastReviewed: dayAgo(8), reviewer: 'Giulia Amalfi', basis: 'GDPR Art. 5(1)(e)' },
    { domain: 'Chat embeddings', days: 90, lastReviewed: dayAgo(8), reviewer: 'Giulia Amalfi', basis: 'GDPR Art. 5(1)(e)' },
    { domain: 'KB audit log', days: 730, lastReviewed: dayAgo(14), reviewer: 'Giulia Amalfi', basis: 'AI Act Art. 12' },
    { domain: 'Connector audit', days: 365, lastReviewed: dayAgo(14), reviewer: 'Giulia Amalfi', basis: 'AI Act Art. 12' },
    { domain: 'MCP tool audit', days: 365, lastReviewed: dayAgo(14), reviewer: 'Giulia Amalfi', basis: 'AI Act Art. 12' },
    { domain: 'Insights snapshots', days: 180, lastReviewed: dayAgo(28), reviewer: 'Giulia Amalfi', basis: 'Business need' },
    { domain: 'Incident records', days: 2555, lastReviewed: dayAgo(40), reviewer: 'Chiara Ferri', basis: 'AI Act Art. 73 (7y)' },
    { domain: 'Risk register', days: 2555, lastReviewed: dayAgo(40), reviewer: 'Chiara Ferri', basis: 'AI Act Art. 17 (7y)' },
];

export interface DeletionLogEntry {
    at: number;
    what: string;
    rows: number;
    cause: string;
    actor: string;
}

export const DELETION_LOG: DeletionLogEntry[] = [
    { at: hrAgo(0.5), what: 'User#ds_06 — full cascade', rows: 1_847, cause: 'DSAR dsar_2026_0137', actor: 'Marco Conti' },
    { at: hrAgo(11), what: 'Conversations (auto-prune)', rows: 412, cause: 'auto-prune > 90d', actor: 'system' },
    { at: dayAgo(1), what: 'User#ds_07 — full cascade', rows: 4_201, cause: 'DSAR dsar_2026_0136', actor: 'Marco Conti' },
    { at: dayAgo(1), what: 'Chat embeddings (auto-prune)', rows: 18_240, cause: 'auto-prune > 90d', actor: 'system' },
    { at: dayAgo(2), what: 'Connector tokens — expired', rows: 14, cause: 'cleanup', actor: 'system' },
    { at: dayAgo(4), what: 'User#ds_15 — rectification', rows: 6, cause: 'DSAR dsar_2026_0130', actor: 'Marco Conti' },
];

export interface EnvVarRow {
    name: string;
    value: string;
    source: string;
    module: string;
}

export const ENV_VARS: EnvVarRow[] = [
    { name: 'AICOMPLIANCE_DSAR_SLA_DAYS', value: '30', source: 'config', module: 'DSAR' },
    { name: 'AICOMPLIANCE_DSAR_WARN_DAYS', value: '5', source: 'config', module: 'DSAR' },
    { name: 'AICOMPLIANCE_BIAS_DRIFT_THRESHOLD', value: '0.05', source: 'config', module: 'Bias' },
    { name: 'AICOMPLIANCE_BIAS_WINDOW_DAYS', value: '7', source: 'config', module: 'Bias' },
    { name: 'AICOMPLIANCE_PII_REDACTOR_KEY', value: '*****a91f', source: 'env', module: 'Security' },
    { name: 'AICOMPLIANCE_WEBHOOK_SECRET', value: '*****04ab', source: 'env', module: 'Webhooks' },
    { name: 'AICOMPLIANCE_RETENTION_CONV', value: '90', source: 'config', module: 'Retention' },
    { name: 'AICOMPLIANCE_ATTESTATION_SIGNER', value: 'Giulia Amalfi <dpo@padosoft.com>', source: 'config', module: 'Governance' },
    { name: 'AICOMPLIANCE_DRIFT_NOTIFY_SLACK', value: '#compliance', source: 'config', module: 'Notifications' },
    { name: 'AICOMPLIANCE_AUDIT_RETENTION_DAYS', value: '2555', source: 'config', module: 'Retention' },
];

export interface FeatureFlag {
    id: string;
    name: string;
    enabled: boolean;
    articles: string[];
}

export const FEATURE_FLAGS: FeatureFlag[] = [
    { id: 'disclosure', name: 'AI Chatbot disclosure', enabled: true, articles: ['AI Act Art. 50'] },
    { id: 'risk_register', name: 'Risk Register', enabled: true, articles: ['AI Act Art. 9'] },
    { id: 'dsar', name: 'DSAR queue', enabled: true, articles: ['GDPR Art. 15-22'] },
    { id: 'consent', name: 'Consent tracking', enabled: true, articles: ['GDPR Art. 7'] },
    { id: 'bias_monitor', name: 'Bias monitor', enabled: true, articles: ['AI Act Art. 10'] },
    { id: 'incidents', name: 'Incident manager', enabled: true, articles: ['AI Act Art. 73'] },
    { id: 'webhooks', name: 'Outbound webhooks', enabled: true, articles: [] },
    { id: 'auto_prune', name: 'Automatic data pruning', enabled: true, articles: ['GDPR Art. 5(1)(e)'] },
    { id: 'attestation_pdf', name: 'Auditor-ready PDF attestations', enabled: true, articles: ['AI Act Art. 11'] },
    { id: 'voice_biometric', name: 'Voice biometric auth (beta)', enabled: false, articles: ['AI Act Art. 5(1)(f)'] },
];
