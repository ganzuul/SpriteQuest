import type { SlopPolicyEntry, SlopPolicyMode } from '../library/slop-policies.js';
import type { ReferenceDraftSettings, ReferencePatches, ReferenceScope } from './reference-draft.js';

export const CLEANUP_MODES: readonly ['inspect', 'contextual', 'strict'];
export interface CleanupSettings extends ReferenceDraftSettings {
    /** Inspect by default. Contextual/strict each make at most one Prose request. */
    mode?: SlopPolicyMode;
    /** Authorized by default; raw Drafts require an explicit whole/narration/dialogue scope. */
    scope?: ReferenceScope;
    /** Unique known category IDs. Omit or [] means the complete selected policy library. */
    categories?: readonly string[];
    /** Case-insensitive by default; quote/apostrophe variants retain original offsets. */
    caseSensitive?: boolean;
    strength?: 'light' | 'balanced';
    /** At most 10,000 UTF-16 units; default empty. */
    instructions?: string;
    /** Integer 1..65,536; default 2048. */
    maxTokens?: number;
}
export interface NormalizedCleanupSettings {
    readonly mode: SlopPolicyMode;
    readonly scope: ReferenceScope;
    readonly categories: readonly string[];
    readonly protectedLiterals: readonly string[];
    readonly caseSensitive: boolean;
    readonly strength: 'light' | 'balanced';
    readonly instructions: string;
    readonly maxTokens: number;
}
export interface CleanupError { code: string; message: string; readonly [key: string]: unknown }
export type CleanupResult<T> = { ok: true; data: T } | { ok: false; error: CleanupError };
export interface CleanupContext {
    readonly kind: 'context';
    readonly messages: readonly { readonly id: string; readonly role: 'system' | 'user' | 'assistant'; readonly text: string; readonly [key: string]: unknown }[];
    readonly [key: string]: unknown;
}
export interface CleanupRequest {
    readonly messages: readonly { readonly role: 'system' | 'user'; readonly content: string }[];
    readonly maxTokens: number;
    /** Passed by identity, never included in writing prompt. */
    readonly binding: unknown;
    readonly signal?: AbortSignal;
}
export interface CleanupCompletion {
    readonly text: string;
    /** Recognized successful finish evidence is mandatory for requested proposals. */
    readonly finish: string;
    readonly usage?: unknown;
}
export interface CleanupPorts {
    /** Services and binding may be absent for inspect or when no editable windows remain. */
    readonly request?: (request: CleanupRequest) => Promise<CleanupResult<CleanupCompletion>>;
    readonly countTokens?: (text: string) => Promise<{ readonly tokens: number; readonly [key: string]: unknown }>;
    readonly binding?: unknown;
    readonly signal?: AbortSignal;
    /**
     * Replaces Draft.context when supplied, including an empty messages array. Otherwise the
     * existing Draft Context is used. Only role/text enters prompts; metadata is omitted.
     */
    readonly context?: CleanupContext;
}
export interface CleanupLiteralFinding {
    code: 'SLOP_LITERAL_MATCH';
    policyId: string;
    rule: string;
    /** Original UTF-16 offsets and exact matched spelling; a match is not semantic judgment. */
    start: number;
    end: number;
    text: string;
    categories: string[];
    editable: boolean;
    protected: boolean;
}
export interface CleanupSemanticReport {
    code: 'SEMANTIC_ASSESSMENT_REQUIRED';
    assessment: 'not-performed' | 'model-requested-review-required';
    policies: SlopPolicyEntry[];
    message: string;
}
export interface CleanupModeReport {
    code: 'PROSE_CLEANUP';
    mode: SlopPolicyMode;
    requestCount: 0 | 1;
    tokenCount?: number;
    literalAssessment: 'wording-match-only';
    semanticPreservation: 'review-dependent';
    message: string;
}
export interface CleanupOutput {
    artifact: ReferencePatches;
    /** Includes original literal findings and, for strict, candidate and immutable-original matches. */
    report: (Record<string, unknown> | CleanupLiteralFinding | CleanupSemanticReport | CleanupModeReport)[];
}
/** Synchronous own-data control validation. Returns a detached, deep-frozen normalized snapshot. */
export function validateCleanupSettings(settings?: CleanupSettings): CleanupResult<{ settings: NormalizedCleanupSettings }>;
/**
 * Preserves original Draft spans/source/protections, including empty permissions. Adds literal
 * findings to the frozen prepared Draft for Candidate inspection. Existing spans only narrow.
 * All consumed data snapshots precede awaits. Text <=100,000 UTF-16 units; instructions <=10,000;
 * <=256 spans/windows; <=128 protected strings x 2,048 units; <=4,096 combined findings. Bounded
 * own-data traversal <=20,000 values/depth 40/500,000 key and string units may reject earlier.
 * Selected explicit or inherited Context <=100,000 serialized UTF-16 units after role/text
 * redaction; prompt <=500,000 units. No retries or host effects.
 * Missing/failed/truncated/aborted output and changed or ambiguous immutable anchors return no
 * proposal. Strict reports unresolved literal wording; semantic preservation still needs review.
 */
export function cleanupDraft(draft: unknown, settings?: CleanupSettings, ports?: CleanupPorts): Promise<CleanupResult<CleanupOutput>>;
