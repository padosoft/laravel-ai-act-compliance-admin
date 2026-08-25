/**
 * The AI-runtime listeners in `laravel-ai-act-compliance` write their evidence as
 * prose, because `HumanReview` and `Incident` are generic records shared with
 * every other oversight source and neither has a column for "tool call".
 *
 * Prose is right for the audit trail — an auditor reads it — and wrong for a
 * table, where an operator needs to sort by run and tell a refusal from a crash
 * at a glance. So the panel reads the same sentences back into fields.
 *
 * The patterns below mirror, line for line, what the listeners emit:
 *
 *   RecordToolApprovalOversight → Agent "App\Agents\X" asked to run tool "refund".
 *                                 Run: inv_01J8….
 *                                 Conversation: conv_1.
 *                                 Reason given: ….
 *                                 Arguments: {…}
 *   ResolveToolApprovalOversight → Denied by the user; the tool did not run.
 *                                  Resolved on run inv_01J8….
 *   RecordRunFailureIncident     → Run: inv_01J8…, tool invocation: tc_2.
 *                                  Ran for 9.2s before failing.
 *                                  Exception: RuntimeException.
 *
 * A miss is never fatal: every field is optional and the raw notes stay on
 * screen underneath, so a listener whose wording changes degrades to "we could
 * not parse this", not to a blank record.
 */

export interface ToolCallRef {
    /** The agent class the run belongs to, as written (fully qualified). */
    agent: string | null;
    /** The tool the agent asked to run, by its resolved name. */
    tool: string | null;
    /** `invocationId` — the same id FinOps keys its Agent Runs page on. */
    runId: string | null;
    /** Set only on incidents: the individual tool call inside the run. */
    toolInvocationId: string | null;
    conversationId: string | null;
    /** The model's own justification for asking. Untrusted text. */
    reason: string | null;
    /** Seconds a tool ran before throwing — a timeout looks nothing like a refusal. */
    ranForSeconds: number | null;
    exception: string | null;
}

const EMPTY: ToolCallRef = {
    agent: null,
    tool: null,
    runId: null,
    toolInvocationId: null,
    conversationId: null,
    reason: null,
    ranForSeconds: null,
    exception: null,
};

function match(text: string, pattern: RegExp): string | null {
    const found = text.match(pattern);

    return found?.[1]?.trim() || null;
}

export function parseToolCallRef(text: string | null | undefined): ToolCallRef {
    if (!text) return { ...EMPTY };

    // "Run: X." and "Resolved on run X." both name the invocation; the first
    // wins because a resolved record carries both and they are the same run.
    const runId =
        match(text, /\bRun:\s*([^\s,.]+)/) ?? match(text, /\bResolved on run\s+([^\s,.]+)/);

    const seconds = match(text, /\bRan for\s+([\d.]+)s\b/);

    return {
        agent: match(text, /\bagent\s+"([^"]+)"/i),
        tool: match(text, /\btool\s+"([^"]+)"/i),
        runId,
        toolInvocationId: match(text, /\btool invocation:\s*([^\s,.]+)/),
        conversationId: match(text, /\bConversation:\s*([^\s,.]+)/),
        reason: match(text, /\bReason given:\s*(.+?)\.?\s*$/m),
        ranForSeconds: seconds === null ? null : Number.parseFloat(seconds),
        exception: match(text, /\bException:\s*([^\s,.]+)/),
    };
}

export type ApprovalOutcome = 'denied' | 'ran' | 'awaiting' | 'unknown';

/**
 * The distinction this whole screen exists for: a human said no, or the machine
 * broke. `state` alone cannot tell them apart — `rejected` is also what a stale
 * record looks like — so the resolver's own sentence is the authority, and the
 * state is the fallback.
 */
export function approvalOutcome(state: string, notes: string | null | undefined): ApprovalOutcome {
    const text = notes ?? '';

    if (/\bDenied by the user\b/.test(text)) return 'denied';
    if (/\bApproved by the user\b/.test(text)) return 'ran';
    if (state === 'pending') return 'awaiting';
    if (state === 'rejected') return 'denied';
    if (state === 'approved') return 'ran';

    return 'unknown';
}

export const OUTCOME_LABEL: Record<ApprovalOutcome, string> = {
    denied: 'Denied — tool did not run',
    ran: 'Approved — tool ran',
    awaiting: 'Awaiting decision',
    unknown: '—',
};

/**
 * Agent classes arrive fully qualified. The namespace is worth keeping — two
 * apps can both have a `SupportCopilot` — but not worth spending a table cell
 * on, so the short name shows and the full one stays in the `title`.
 */
export function shortClass(value: string | null | undefined): string {
    if (!value) return '—';
    const parts = value.split('\\');

    return parts[parts.length - 1] || value;
}
