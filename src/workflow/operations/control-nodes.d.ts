import type { DataArtifact, DefinitionRef, NativeNode, NativeWorkflowMode, NodeAddress, OperationDescription, OperationDescriptor, OperationResult, PortState, ReportedUsage, Result, WorkflowPhase } from '../types';
import type { JsonValue } from './json-data';

export type ControlOperationId = 'condition' | 'branch' | 'confidence-gate' | 'join' | 'collect' | 'for-each';
export interface JoinSlot { id: string; label: string; required: boolean; }
export interface IterationRequestOptions { messages: { role: string; content: string }[]; maxTokens: number; binding?: unknown; childAddress?: NodeAddress; }
export type IterationRequest = (options: IterationRequestOptions) => Promise<Result<{ text: string; finish?: string; usage?: ReportedUsage }>>;
/** item/state are detached bounded JSON; the adapter resolves the exact pinned helper. */
export interface IterationInvocation {
    readonly helper: DefinitionRef; readonly item: JsonValue; readonly index: number;
    readonly projectedState?: JsonValue; readonly phase: WorkflowPhase; readonly rootMode: NativeWorkflowMode;
    readonly address?: NodeAddress;
}
export type IterationResult = { ok: true; artifact: DataArtifact; projectedState?: JsonValue } | { ok: false; error: import('../types').WorkflowError };
/** Request must use this per-iteration capability; it also enters the shared root recorder/bound. */
export type IterateHelper = (invocation: IterationInvocation, ports: { request: IterationRequest; signal?: AbortSignal }) => Promise<IterationResult> | IterationResult;
export interface ControlExecution {
    phase?: WorkflowPhase; rootMode?: NativeWorkflowMode; address?: NodeAddress; signal?: AbortSignal;
    inputStates?: Readonly<Record<string, PortState>>; iterateHelper?: IterateHelper; request?: IterationRequest;
}
export const CONTROL_OPERATIONS: Record<ControlOperationId, OperationDescriptor>;
export function describeControl(node: NativeNode | Record<string, unknown>, options?: { phase?: WorkflowPhase }): Result<OperationDescription>;
export function executeControl(node: NativeNode | Record<string, unknown>, inputs: Record<string, unknown>, local?: ControlExecution): Promise<OperationResult>;
