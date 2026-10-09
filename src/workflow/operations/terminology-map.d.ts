import type { ReferenceDraftResult, ReferenceDraftSettings, ReferencePatches } from './reference-draft.js';

export interface TerminologyEntry {
    /** Exact nonblank literal, at most 2,048 UTF-16 units. No extra fields are accepted. */
    from: string;
    /** Inserted literally, including dollar characters; nonblank and at most 2,048 units. */
    to: string;
}
export interface TerminologyGlossary {
    /** Dense own-data array, 0..128 mappings, with unique effective from literals. */
    entries: readonly TerminologyEntry[];
}
export interface TerminologyMapSettings extends ReferenceDraftSettings {
    /** Defaults to true. False uses Unicode simple case folding without expanding text. */
    caseSensitive?: boolean;
    /** Defaults to word: neighbors outside the literal cannot be Unicode L/M/N/Pc. */
    match?: 'word' | 'phrase';
}
export interface TerminologyFinding {
    /** Absolute original UTF-16 offsets; end is exclusive. */
    start: number;
    end: number;
    /** Original glossary array index, unaffected by longest-literal selection. */
    glossaryIndex: number;
    /** Original glossary literals, retained verbatim. */
    from: string;
    to: string;
    /** Original authorized parent span index. */
    spanIndex: number;
}
export interface TerminologyReport {
    type: 'terminology';
    /** Exactly findings.length, including zero and identity mappings. */
    count: number;
    findings: TerminologyFinding[];
}
export interface TerminologyMapOutput {
    artifact: ReferencePatches;
    /** Preserves the common patch reports and appends one terminology diagnostic report. */
    report: [...Record<string, unknown>[], TerminologyReport];
}
export type TerminologyMapResult = ReferenceDraftResult<TerminologyMapOutput>;
/**
 * Validates unknown own plain data; getters and inherited inputs are rejected.
 * Simultaneous original-text mapping, leftmost then longest, within authorized
 * windows narrowed by scope and protected literals. No provider or host calls.
 * At most 4,096 findings and 100,000 output units; failure has no partial artifact.
 */
export function mapTerminology(draft: unknown, glossary: unknown, settings?: TerminologyMapSettings): TerminologyMapResult;
