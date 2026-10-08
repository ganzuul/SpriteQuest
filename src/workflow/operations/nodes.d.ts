import type { ComposeSection } from './compose.js';
import type { JsonValue, OperationError, SchemaFinding } from './json-data.js';
import type { FieldSelection } from './select-fields.js';
import type { DraftRulePatches, RuleDraft, TextRule, TextRuleFinding, TextRuleWorker } from './text-rules.js';

export type PrimitiveId = 'compose' | 'text-rules' | 'json-decode' | 'select-fields';
export type PrimitivePhase = 'pre' | 'post';
export type PrimitiveKind = 'text' | 'data' | 'guidance' | 'draft' | 'patches';
export type PrimitiveControl =
    | { key: string; label: string; type: 'enum'; options: string[] }
    | { key: string; label: string; type: 'text' | 'json' };
export interface PrimitiveDescriptor {
    id: PrimitiveId;
    title: string;
    family: 'Shaping' | 'Surface' | 'Derive';
    phase: PrimitivePhase | 'both';
    input: PrimitiveKind | null;
    output: PrimitiveKind;
    controls: string[];
    controlDescriptors: PrimitiveControl[];
    defaults: Record<string, unknown>;
    requestBound: 0;
    modelRole: null;
    terminal: false;
    dynamicPorts: true;
}
export interface PrimitivePort {
    id: string;
    label: string;
    direction: 'input' | 'output';
    kind: PrimitiveKind;
    required: boolean;
    cardinality: 'one';
}
interface NodeEnvelope {
    phase?: PrimitivePhase;
    /** Other shared graph/document metadata is validated by the core and stays unread here. */
    [key: string]: unknown;
}
export type PrimitiveNode =
    | (NodeEnvelope & { operation: 'compose'; mode?: 'join' | 'template'; outputKind?: 'text' | 'guidance'; template?: string; sections?: ComposeSection[]; separator?: string })
    | (NodeEnvelope & { operation: 'text-rules'; inputKind?: 'text' | 'draft'; mode?: 'replace' | 'extract'; rules?: TextRule[]; separator?: string })
    | (NodeEnvelope & { operation: 'json-decode'; mode?: 'parse' | 'check'; /** Raw JSON text; empty means no schema. */ schema?: string })
    | (NodeEnvelope & { operation: 'select-fields'; fields?: FieldSelection[] });
export interface PrimitiveExecution {
    phase?: PrimitivePhase;
    signal?: AbortSignal;
    /** Public adapter option, mapped internally to the Text Rules engine's workerFactory. */
    createWorker?: () => TextRuleWorker;
    /** Integer milliseconds from 100 through 2000; engine default is 1000. */
    timeoutMs?: number;
}
export type TextArtifact = { kind: 'text'; text: string };
export type DataArtifact = { kind: 'data'; value: JsonValue };
export type GuidanceArtifact = { kind: 'guidance'; text: string };
export type PrimitiveInputArtifact = TextArtifact | DataArtifact | RuleDraft;
export type PrimitiveArtifact = TextArtifact | DataArtifact | GuidanceArtifact | DraftRulePatches;
export type PrimitiveReport = TextRuleFinding | SchemaFinding | Record<string, unknown>;
export type PrimitiveFailure = { ok: false; error: OperationError };
export type PrimitiveDescription =
    | { ok: true; data: { descriptor: PrimitiveDescriptor & { phase: PrimitivePhase }; ports: PrimitivePort[] } }
    | PrimitiveFailure;
export type PrimitiveExecutionResult =
    | { ok: true; artifact: PrimitiveArtifact; reports: PrimitiveReport[] }
    | PrimitiveFailure;

export const PRIMITIVE_OPERATIONS: Record<PrimitiveId, PrimitiveDescriptor>;
/** Text/Data nodes need an explicit effective phase. Guidance resolves pre; Draft rules resolve post. */
export function describePrimitive(node: unknown, options?: { phase?: PrimitivePhase }): PrimitiveDescription;
/** Required input is in; Compose optionally accepts data and stable section.NAME overrides. */
export function executePrimitive(node: unknown, namedInputs: unknown, execution?: PrimitiveExecution): Promise<PrimitiveExecutionResult>;
