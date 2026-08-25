import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { api } from '../../src/api/client';
import {
    approvalOutcome,
    parseToolCallRef,
    shortClass,
} from '../../src/lib/ai-runtime';
import { HumanReviewScreen } from '../../src/features/human-review/HumanReviewScreen';

// The screen fetches /human-reviews on mount; reject so it keeps the fixtures,
// which are the rows these tests assert on.
beforeEach(() => {
    vi.spyOn(api, 'get').mockRejectedValue(new Error('test: endpoint unreachable'));
});
afterEach(() => {
    vi.restoreAllMocks();
});

const APPROVAL_NOTES =
    'Agent "App\\Agents\\SupportCopilot" asked to run tool "issue_refund".\n' +
    'Run: inv_01J9RUN0001.\n' +
    'Conversation: conv_01J9CNV0001.\n' +
    'Reason given: The customer reports the order never arrived.\n' +
    'Arguments: {"order":"ORD-8841"}\n' +
    'Denied by the user; the tool did not run. Resolved on run inv_01J9RUN0001.';

const TOOL_FAILURE_NOTES =
    'A tool invoked by agent "App\\Agents\\SupportCopilot" threw.\n' +
    'Run: inv_01J9RUN0009, tool invocation: tc_2.\n' +
    'Ran for 9.2s before failing.\n' +
    'Exception: RuntimeException.\n' +
    'Message: upstream timed out';

describe('parseToolCallRef', () => {
    it('reads the agent, tool, run and conversation out of an approval record', () => {
        const ref = parseToolCallRef(APPROVAL_NOTES);
        expect(ref.agent).toBe('App\\Agents\\SupportCopilot');
        expect(ref.tool).toBe('issue_refund');
        expect(ref.runId).toBe('inv_01J9RUN0001');
        expect(ref.conversationId).toBe('conv_01J9CNV0001');
        expect(ref.reason).toBe('The customer reports the order never arrived');
    });

    it('reads the tool invocation and the seconds burned before a throw', () => {
        const ref = parseToolCallRef(TOOL_FAILURE_NOTES);
        expect(ref.runId).toBe('inv_01J9RUN0009');
        expect(ref.toolInvocationId).toBe('tc_2');
        // The number that separates a timeout from a rejection.
        expect(ref.ranForSeconds).toBe(9.2);
        expect(ref.exception).toBe('RuntimeException');
    });

    it('returns every field null rather than throwing on prose it cannot read', () => {
        const ref = parseToolCallRef('High-impact recommendation flagged by the bias monitor.');
        expect(ref.runId).toBeNull();
        expect(ref.tool).toBeNull();
        expect(ref.ranForSeconds).toBeNull();
        expect(parseToolCallRef(null).runId).toBeNull();
    });
});

describe('approvalOutcome', () => {
    it('trusts the resolver sentence over the state', () => {
        expect(approvalOutcome('rejected', APPROVAL_NOTES)).toBe('denied');
        expect(approvalOutcome('approved', 'Approved by the user; the tool ran.')).toBe('ran');
    });

    it('falls back to the state when no sentence was written', () => {
        expect(approvalOutcome('pending', null)).toBe('awaiting');
        expect(approvalOutcome('rejected', 'something else entirely')).toBe('denied');
        expect(approvalOutcome('escalated', null)).toBe('unknown');
    });
});

describe('shortClass', () => {
    it('keeps the class name and drops the namespace', () => {
        expect(shortClass('App\\Agents\\SupportCopilot')).toBe('SupportCopilot');
        expect(shortClass('SupportCopilot')).toBe('SupportCopilot');
        expect(shortClass(null)).toBe('—');
    });
});

describe('Human Oversight — tool approvals', () => {
    function renderScreen() {
        return render(
            <MemoryRouter>
                <HumanReviewScreen />
            </MemoryRouter>,
        );
    }

    it('says which of the two happened: the human refused, or the tool ran', () => {
        renderScreen();
        // Fixture 5 is denied, fixture 4 is still open.
        expect(screen.getByTestId('human-review-outcome-5').textContent).toContain('Denied');
        expect(screen.getByTestId('human-review-outcome-4').textContent).toContain('Awaiting');
        // A delegation grant has no per-action outcome to report.
        expect(screen.getByTestId('human-review-outcome-3').textContent).toBe('—');
    });

    it('pivots to a single run without opening the record', () => {
        renderScreen();
        fireEvent.click(screen.getByTestId('human-review-run-5'));
        expect(screen.getByTestId('human-review-run-filter').textContent).toContain('inv_01J9RUN0001');
        expect(screen.queryByTestId('human-review-row-3')).toBeNull();
        expect(screen.getByTestId('human-review-row-5')).toBeTruthy();
        // The click must not have opened the drawer as well.
        expect(screen.queryByTestId('human-review-chain')).toBeNull();

        fireEvent.click(screen.getByTestId('human-review-run-filter'));
        expect(screen.getByTestId('human-review-row-3')).toBeTruthy();
    });

    it('names the agent, tool and run behind the decision in the drawer', () => {
        renderScreen();
        fireEvent.click(screen.getByTestId('human-review-row-5'));
        const chain = screen.getByTestId('human-review-chain');
        expect(chain.textContent).toContain('SupportCopilot');
        expect(chain.textContent).toContain('issue_refund');
        expect(chain.textContent).toContain('inv_01J9RUN0001');
        expect(chain.textContent).toContain('call_01J9TOOL0001');
    });

    it('marks the model reason as a claim rather than as evidence', () => {
        renderScreen();
        fireEvent.click(screen.getByTestId('human-review-row-5'));
        expect(screen.getByText(/read it as a claim, not as evidence/i)).toBeTruthy();
    });
});
