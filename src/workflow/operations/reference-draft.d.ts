export type ReferenceDraftResult<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };
export type ReferenceScope = 'authorized' | 'whole' | 'narration' | 'dialogue';
export interface ReferenceDraftSettings {
    /** Defaults to authorized. Only explicit scope can construct raw Draft permissions. */
    scope?: ReferenceScope;
    protectedLiterals?: readonly string[];
}
export interface ReferenceSpan {
    readonly index: number;
    readonly start: number;
    readonly end: number;
    readonly text: string;
    readonly [key: string]: unknown;
}
export interface FrozenReferenceDraft {
    readonly kind: 'draft';
    readonly text: string;
    readonly source: { readonly originalText: string; readonly [key: string]: unknown };
    readonly spans: readonly ReferenceSpan[];
    readonly scope?: 'whole' | 'narration' | 'dialogue';
    readonly protectedLiterals?: readonly string[];
    readonly [key: string]: unknown;
}
export interface ReferenceWindow {
    readonly index: number;
    /** Original parent span index, never renumbered by narrowing. */
    readonly spanIndex: number;
    /** Absolute original UTF-16 offsets. */
    readonly start: number;
    readonly end: number;
    readonly text: string;
}
export interface PreparedReferenceDraft {
    readonly draft: FrozenReferenceDraft;
    readonly windows: readonly ReferenceWindow[];
    readonly protectedLiterals: readonly string[];
}
export interface ReferenceCompletionMetadata {
    usage?: unknown;
    /** If supplied, must identify a successful completion; retained verbatim. */
    finish?: string;
}
export interface ReferencePatches {
    kind: 'patches';
    draft: FrozenReferenceDraft;
    patches: { index: number; replacement: string }[];
    protectedLiterals: readonly string[];
    usage?: unknown;
    finish?: string;
}
export interface ReferencePatchResult {
    artifact: ReferencePatches;
    report: Record<string, unknown>[];
}
/**
 * Deep-frozen own-data snapshot, locally authenticated; forged or cloned values fail.
 * Text <=100000 UTF-16 units; <=256 original spans and effective windows.
 * Data traversal <=20000 values, depth 40, <=500000 key/string UTF-16 units.
 * <=128 unique protected literals, each nonblank and <=2048 UTF-16 units.
 */
export function prepareReferenceDraft(draft: unknown, settings?: ReferenceDraftSettings): ReferenceDraftResult<PreparedReferenceDraft>;
/** Rebuild original parents from one dense replacement per effective window. */
export function createReferencePatches(prepared: PreparedReferenceDraft, replacements: readonly string[], metadata?: ReferenceCompletionMetadata): ReferenceDraftResult<ReferencePatchResult>;
/** Exact immutable-anchor alignment; ambiguity fails. Candidate text <=100000 UTF-16 units. */
export function alignReferenceCandidate(prepared: PreparedReferenceDraft, candidate: string, metadata?: ReferenceCompletionMetadata): ReferenceDraftResult<ReferencePatchResult>;
