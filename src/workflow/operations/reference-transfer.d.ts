import type { JsonValue } from './json-data.js';
import type { ReferenceDraftSettings, ReferencePatches } from './reference-draft.js';

export type ReferenceTransferMode = 'narration' | 'character-voice' | 'rhythm' | 'register';
export type ReferenceMaterial =
    | { readonly kind: 'text'; readonly text: string }
    | { readonly kind: 'data'; readonly value: JsonValue[] | { [key: string]: JsonValue } };
export type ReferenceTransferSettings = ReferenceDraftSettings & {
    /** light by default; stronger adaptation still preserves original meaning. */
    strength?: 'light' | 'balanced';
    /** At most 10,000 UTF-16 units; defaults to empty. */
    instructions?: string;
    /** Integer 1..65,536, defaults to 2048. */
    maxTokens?: number;
} & (
    | { kind: 'style'; mode?: ReferenceTransferMode }
    | { kind: 'format'; mode?: never }
);
export interface ReferenceTransferContext {
    readonly kind: 'context';
    readonly messages: readonly {
        readonly id: string;
        readonly role: 'system' | 'user' | 'assistant';
        readonly text: string;
        readonly [key: string]: unknown;
    }[];
    readonly [key: string]: unknown;
}
export interface ReferenceTransferError {
    code: string;
    message: string;
    readonly [key: string]: unknown;
}
export type ReferenceTransferResult<T> = { ok: true; data: T } | { ok: false; error: ReferenceTransferError };
export interface ReferenceTransferRequest {
    readonly messages: readonly { readonly role: 'system' | 'user'; readonly content: string }[];
    readonly maxTokens: number;
    /** Passed by identity; never inspected for model/provider configuration. */
    readonly binding: unknown;
    readonly signal?: AbortSignal;
}
export interface ReferenceTransferCompletion {
    /** Exact complete proposed prose, including all immutable regions. */
    readonly text: string;
    /** Successful finish evidence is mandatory at runtime. */
    readonly finish: string;
    readonly usage?: unknown;
}
export interface ReferenceTransferPorts {
    /** Both services and binding may be absent only when there are no editable windows. */
    readonly request?: (request: ReferenceTransferRequest) => Promise<ReferenceTransferResult<ReferenceTransferCompletion>>;
    /** Own-data envelope, never a bare numeric count; finite nonnegative tokens. */
    readonly countTokens?: (text: string) => Promise<{ readonly tokens: number; readonly [key: string]: unknown }>;
    readonly binding?: unknown;
    readonly signal?: AbortSignal;
    /** Overrides frozen Draft context; prompt includes only message id/role/text. */
    readonly context?: ReferenceTransferContext;
}
export interface ReferenceTransferReport {
    code: 'REFERENCE_TRANSFER';
    kind: 'style' | 'format';
    mode?: ReferenceTransferMode;
    requestCount: 0 | 1;
    tokenCount?: number;
    semanticPreservation: 'review-dependent';
    message: string;
}
export interface ReferenceTransferOutput {
    artifact: ReferencePatches;
    report: (Record<string, unknown> | ReferenceTransferReport)[];
}
/**
 * Snapshot bounded own data before either service await. One Prose request maximum,
 * no retries. Text/reference/candidate <=100,000 UTF-16 units; context messages
 * <=100,000 serialized UTF-16 units; prompt <=500,000 UTF-16 units. Data values use
 * JSON limits: 262,144 serialized UTF-8 bytes, depth 32, 10,000 values.
 * Format Data templates may declare value.requiredContent (<=128 nonblank literals,
 * each <=2048 UTF-16 units); missing original content fails before requesting.
 * Preserves exact raw completion text: never trims it or removes fences. Immutable
 * anchors are validated by the common reference helper; authorized semantic edits
 * require review. Returns Patches only and grants no Apply or host authority.
 */
export function transferDraft(draft: unknown, reference: ReferenceMaterial, settings: ReferenceTransferSettings, ports?: ReferenceTransferPorts): Promise<ReferenceTransferResult<ReferenceTransferOutput>>;
