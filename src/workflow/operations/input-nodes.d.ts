import type { ControlDescriptor, OperationDescription, OperationDescriptor, Result, TextArtifact, WorkflowError, WorkflowPhase } from '../types.js';

export type InputId = 'text' | 'file-input' | 'prompt-source';
export type PromptSource = 'system' | 'prompt-entry';
export type PromptForm = 'raw' | 'resolved';
export type InputControlDescriptor = ControlDescriptor & {
    maxLength?: number;
    multiline?: boolean;
    hidden?: boolean;
    visibleWhen?: { key: string; value: string | number | boolean };
};
export interface InputDescriptor extends OperationDescriptor {
    id: InputId;
    family: 'Input';
    phase: WorkflowPhase | 'both';
    operationVersion: 1;
    minimumSchema: 3;
    minimumRuntime: 2;
    input: null;
    output: 'text';
    controlDescriptors: Record<string, InputControlDescriptor>;
    requestBound: 0;
    modelRole: null;
    terminal: false;
    dynamicPorts: true;
}
interface NodeEnvelope {
    type?: 'workflow';
    operationVersion?: 1;
    phase?: WorkflowPhase;
    /** Shared graph/document metadata remains unread by the source operation. */
    [key: string]: unknown;
}
export type InputNode =
    | (NodeEnvelope & { operation: 'text'; text?: string })
    | (NodeEnvelope & { operation: 'file-input'; fileName?: string; content?: string; loaded?: boolean })
    | (NodeEnvelope & { operation: 'prompt-source'; source?: PromptSource; promptId?: string; form?: PromptForm });
export interface InputOptions { phase?: WorkflowPhase; }
export type InputExecutionResult =
    | { ok: true; artifact: TextArtifact; reports: [] }
    | { ok: false; error: WorkflowError };

/** Catalog-ready static metadata; describeInput resolves a concrete containing phase. */
export const INPUT_OPERATIONS: Record<InputId, InputDescriptor>;
/** Nodes require a concrete pre/post phase and own bounded plain controls. */
export function describeInput(node: unknown, options?: InputOptions): Result<OperationDescription>;
/** Deterministic saved Text/File snapshot output; Prompt Source returns HOST_SOURCE_REQUIRED. */
export function executeInput(node: unknown, options?: InputOptions): InputExecutionResult;
