import type { Result } from '../operations/json-data.js';
export type SlopPolicyMode = 'inspect' | 'contextual' | 'strict';
export type SlopPolicyScope = 'authorized' | 'narration' | 'dialogue' | 'whole';
export type SlopPolicyMatchType = 'phrase' | 'template' | 'behavior';
export interface SlopPolicySource {
    title: string;
    fileName: string;
    categoryCount: number;
    occurrenceCount: number;
    uniqueEntryCount: number;
    templateCount: number;
    behaviorCount: number;
}
export interface SlopPolicyCategory { id: string; label: string }
export interface SlopPolicyEntry {
    id: string;
    text: string;
    matchType: SlopPolicyMatchType;
    /** All original category memberships, including unselected categories. */
    categories: string[];
}
export interface SlopPolicyLibrary {
    version: 1;
    source: SlopPolicySource;
    categories: SlopPolicyCategory[];
    entries: SlopPolicyEntry[];
}
export interface SlopPolicySettings {
    mode?: SlopPolicyMode;
    scope?: SlopPolicyScope;
    /** Unique category IDs; omit or supply [] for all. */
    categories?: string[];
}
export interface SlopPolicySelection extends SlopPolicyLibrary {
    mode: SlopPolicyMode;
    scope: SlopPolicyScope;
}
/**
 * Validate and clone bounded JSON, preserving source order, metadata and wording.
 * Defaults to inspect/narration. Mode and scope are policy data; no matching,
 * semantic cleanup, provider calls, or Apply authority are performed.
 * source counts always describe the original library, not filtered selection.
 */
export function selectSlopPolicies(library: unknown, settings?: SlopPolicySettings): Result<{ value: SlopPolicySelection }>;
