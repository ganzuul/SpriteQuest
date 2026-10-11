import type { NodeAddress, WorkflowArtifact, OperationResult, ScopedOutputRetention } from './types';
type Failure = { ok: false; error: { code: string; message: string } };
type Authorization = { ok: true } | Failure;
export interface NativeGuidanceRetention extends Omit<ScopedOutputRetention, 'address' | 'rawResult'> {
    address?: NodeAddress; rawResult?: OperationResult;
}
/** This service is private to one native run; no artifact field carries its proofs. */
export function createNativeGuidanceComposition(): {
    retain(payload: NativeGuidanceRetention): { ok: true; data: { retained: true } } | Failure;
    authorize(artifact: WorkflowArtifact, authorizeOriginal: (original: WorkflowArtifact) => Authorization): Authorization;
    clear(): void;
};
