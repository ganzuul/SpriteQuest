import type { TextArtifact, WorkflowPhase } from '../types.js';
import type { ReferencePatches, ReferenceScope } from './reference-draft.js';
import type { ReferenceMaterial, ReferenceTransferContext, ReferenceTransferError, ReferenceTransferMode, ReferenceTransferPorts, ReferenceTransferReport } from './reference-transfer.js';
import type { TerminologyMapSettings, TerminologyReport } from './terminology-map.js';

export type TransposeId = 'style-transfer' | 'format-transfer' | 'terminology-map';
export type TransposeKind = 'draft' | 'text' | 'data' | 'context' | 'patches';
export interface TransposeCommonDefaults {
    /** Explicit Text mode; static/API defaults preserve legacy Draft mode. */
    inputKind: 'draft' | 'text';
    scope: ReferenceScope;
    protectedLiterals: readonly string[];
}
export interface TransposeTransferDefaults extends TransposeCommonDefaults {
    referenceKind: 'text' | 'data';
    strength: 'light' | 'balanced';
    instructions: string;
    maxTokens: number;
}
export interface TransposeStyleDefaults extends TransposeTransferDefaults { mode: ReferenceTransferMode }
export interface TransposeTerminologyDefaults extends TransposeCommonDefaults { caseSensitive: boolean; match: 'word' | 'phrase' }
export type TransposeDefaults = TransposeStyleDefaults | TransposeTransferDefaults | TransposeTerminologyDefaults;
export type TransposeControl =
    | { readonly key: string; readonly label: string; readonly type: 'enum'; readonly options: readonly (string | boolean)[] }
    | { readonly key: string; readonly label: string; readonly type: 'string'; readonly maxLength: number }
    | { readonly key: string; readonly label: string; readonly type: 'integer'; readonly minimum: number; readonly maximum: number }
    | { readonly key: string; readonly label: string; readonly type: 'array'; readonly maxItems: number; readonly items: { readonly type: 'string'; readonly minLength: 1; readonly maxLength: number; readonly nonblank: true } };
export interface TransposeDescriptor<Defaults extends TransposeDefaults = TransposeDefaults> {
    readonly id: TransposeId;
    readonly title: string;
    readonly family: 'Transpose';
    readonly phase: WorkflowPhase;
    readonly operationVersion: 1;
    readonly input: 'draft' | 'text';
    readonly output: 'patches' | 'text';
    readonly defaults: Readonly<Defaults>;
    readonly controls: readonly string[];
    readonly controlDescriptors: readonly TransposeControl[];
    readonly requestBound: 0 | 1;
    readonly modelRole: 'Prose' | null;
    readonly terminal: false;
    readonly dynamicPorts: true;
}
export interface TransposePort {
    id: 'in' | 'reference' | 'context' | 'out';
    label: string;
    direction: 'input' | 'output';
    kind: TransposeKind;
    required: boolean;
    cardinality: 'one';
}
interface TransposeEnvelope {
    operationVersion?: 1;
    phase?: WorkflowPhase;
    /** Omitted retains post-only Draft -> Patches; Text supports either phase. */
    inputKind?: 'draft' | 'text';
    /** Other document metadata remains unread. Declared fields require own data properties. */
    [key: string]: unknown;
}
export type TransposeNode = TransposeEnvelope & (
    | ({ operation: 'style-transfer' } & Partial<TransposeStyleDefaults>)
    | ({ operation: 'format-transfer' } & Partial<TransposeTransferDefaults>)
    | ({ operation: 'terminology-map' } & TerminologyMapSettings)
);
/** Opaque binding is passed by identity; Terminology never reads these model authorities. */
export interface TransposeExecution extends Omit<ReferenceTransferPorts, 'context'> { phase?: WorkflowPhase }
export interface TransposeNamedInputs {
    in: unknown;
    reference: ReferenceMaterial;
    context?: ReferenceTransferContext;
}
export type TransposeFailure = { ok: false; error: ReferenceTransferError };
export type TransposeDescription = { ok: true; data: { descriptor: TransposeDescriptor; ports: TransposePort[] } } | TransposeFailure;
export type TransposeReport = Record<string, unknown> | ReferenceTransferReport | TerminologyReport;
export type TransposeExecutionResult = { ok: true; artifact: ReferencePatches | TextArtifact; reports: TransposeReport[] } | TransposeFailure;
export const TRANSPOSE_OPERATIONS: Readonly<{
    'style-transfer': TransposeDescriptor<TransposeStyleDefaults>;
    'format-transfer': TransposeDescriptor<TransposeTransferDefaults>;
    'terminology-map': TransposeDescriptor<TransposeTerminologyDefaults>;
}>;
/** Pure descriptor/port validation; defaults explicitly narrow scope to narration. */
export function describeTranspose(node: unknown, options?: { phase?: WorkflowPhase }): TransposeDescription;
/** Named inputs are checked before effects; returns legacy Patches or detached Text without host authority. */
export function executeTranspose(node: unknown, namedInputs: unknown, execution?: TransposeExecution): Promise<TransposeExecutionResult>;
