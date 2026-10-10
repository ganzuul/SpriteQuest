import type { NativeNode, OperationDescription, OperationDescriptor, OperationResult, Result, WorkflowPhase } from '../types';
import type { DecisionExecution } from '../decision';
export type DecisionOperationId = 'decision';
export type DecisionOperationDescriptor = OperationDescriptor & { requestCapability: 'text-completion' };
export const DECISION_OPERATIONS: Record<DecisionOperationId, DecisionOperationDescriptor>;
export function describeDecision(node: NativeNode | Record<string,unknown>, options?: { phase?: WorkflowPhase }): Result<OperationDescription>;
export function executeDecision(node: NativeNode | Record<string,unknown>, inputs: Record<string,unknown>, local?: DecisionExecution & { phase?: WorkflowPhase; getRequestCount?: () => number }): Promise<OperationResult>;
