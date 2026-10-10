import type { Failure, Result } from '../introspection/contracts.js';
import type { ProgressionState, ProgressionValue, ProgressionReceipt, AppliedProgressionReceipt, TimeDecayReceipt } from '../progression.js';
import type { StoryClock } from '../story-time.js';

export type ProgressionStateMode = 'progression' | 'time-decay';
export type ProgressionVisibility = { kind: 'public' | 'hidden' } | { kind: 'actor-private'; actorId: string };
export interface ProgressionStatePort {
    id: string; label: string; kind: 'data'; direction: 'input' | 'output'; required: boolean; cardinality: 'one';
}
export interface ProposedProgressionState {
    values: ProgressionValue[];
    visibility: ProgressionVisibility;
    /** Required for progression; elapsed-time recovery also accepts state with no event ledger. */
    ledger?: (AppliedProgressionReceipt & { visibility: ProgressionVisibility })[];
    budgets?: ProgressionState['budgets']; cooldowns?: ProgressionState['cooldowns'];
    repetitions?: ProgressionState['repetitions']; decayTimes?: ProgressionState['decayTimes'];
    [field: string]: unknown;
}
export interface StateProjectionReceipt {
    schemaVersion: 1; recordType: 'progression-receipt'; mode: ProgressionStateMode;
    status: 'proposed'; acceptance: 'pending'; visibility: ProgressionVisibility;
    receipts: ((ProgressionReceipt | TimeDecayReceipt) & { visibility: ProgressionVisibility; acceptance: 'pending' })[];
    /** Checked effective clock supplied explicitly to Time Decay; no ambient clock is read. */
    clock?: StoryClock;
}
export interface StateProjectionArtifact<T> {
    kind: 'data'; value: T; visibility: ProgressionVisibility; status: 'proposed'; acceptance: 'pending';
}
export type ProgressionStateOperationResult = {
    ok: true;
    artifact: StateProjectionArtifact<ProposedProgressionState>;
    outputs: {
        out: StateProjectionArtifact<ProposedProgressionState>;
        receipt: StateProjectionArtifact<StateProjectionReceipt>;
    };
    reports: { code: string; operation: 'state'; mode: ProgressionStateMode; actualCalls: 0; status: 'proposed'; receiptCount: number; visibility: ProgressionVisibility }[];
} | Failure;
export const PROGRESSION_STATE_MODES: readonly ProgressionStateMode[];
/** Dynamic descriptions for additional modes of the existing State operation. */
export function describeProgressionState(settings: unknown): Result<{
    mode: ProgressionStateMode; requestBound: 0; modelRole: null; ports: ProgressionStatePort[];
}>;
/** Confirmed events/authored rules or exact explicit time project detached pending state without service calls. */
export function executeProgressionState(settings: unknown, namedInputs: unknown, ports?: unknown): ProgressionStateOperationResult;