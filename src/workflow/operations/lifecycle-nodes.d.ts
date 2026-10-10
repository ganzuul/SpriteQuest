import type { NativeNode, OperationDescription, OperationDescriptor, OperationResult, Result, WorkflowPhase } from '../types';
export type LifecycleOperationId = 'player-event-source' | 'on-send' | 'generate-reply' | 'review-publish';
export const LIFECYCLE_OPERATIONS: Record<LifecycleOperationId, OperationDescriptor>;
export function describeLifecycleNode(node: NativeNode | Record<string, unknown>, options?: { phase?: WorkflowPhase }): Result<OperationDescription>;
/** Host adapters own On Send and native generation; Review only checks a Draft and produces a Candidate. */
export function executeLifecycleNode(node: NativeNode | Record<string, unknown>, inputs: Record<string, unknown>, execution?: { phase?: WorkflowPhase; root?: boolean; rootMode?: string; signal?: AbortSignal }): Promise<OperationResult>;
