export interface TextRule {
    kind: 'literal' | 'regex';
    pattern: string;
    replacement?: string;
    /** Unique i/m/s/u for regex, i/u for literal; global matching is implicit. */
    flags?: string;
}
export interface TextRulesSettings {
    mode?: 'replace' | 'extract';
    rules?: TextRule[];
    separator?: string;
}
export interface TextRuleFinding {
    ruleIndex: number;
    segmentIndex: number;
    /** UTF-16 positions within the segment at this rule's turn. */
    start: number;
    end: number;
    text: string;
}
export interface TextRuleError { code: string; message: string }
export type TextRuleResult<T> = { ok: true; data: T } | { ok: false; error: TextRuleError };
export interface TextRuleWorker {
    postMessage(message: unknown): void;
    addEventListener(type: 'message' | 'error', listener: (event: any) => void): void;
    removeEventListener(type: 'message' | 'error', listener: (event: any) => void): void;
    terminate(): void | Promise<unknown>;
}
export interface TextRulesExecution {
    /** Integer milliseconds, 100..2000; default 1000. Deadline includes Worker startup. */
    timeoutMs?: number;
    signal?: AbortSignal;
    /** A dedicated terminable Worker with browser-shaped message/error events. */
    workerFactory?: () => TextRuleWorker;
}
export interface DraftRuleSpan { index: number; start: number; end: number; text: string }
export interface RuleDraft {
    kind: 'draft';
    text: string;
    source: { originalText: string; [key: string]: unknown };
    spans?: DraftRuleSpan[];
    scope?: 'whole' | 'narration' | 'dialogue';
    protectedLiterals?: string[];
    [key: string]: unknown;
}
export interface FrozenRuleDraft {
    readonly kind: 'draft';
    readonly text: string;
    readonly source: Readonly<RuleDraft['source']>;
    readonly spans: readonly Readonly<DraftRuleSpan>[];
    readonly scope?: 'whole' | 'narration' | 'dialogue';
    readonly protectedLiterals?: readonly string[];
    readonly [key: string]: unknown;
}
export interface DraftRulePatches {
    kind: 'patches';
    draft: FrozenRuleDraft;
    patches: { index: number; replacement: string }[];
    protectedLiterals: string[];
}
/** Text input/output <=100000 UTF-16 units; <=64 rules, <=4096 findings. No caller-thread regex fallback. */
export function applyTextRules(text: unknown, settings?: TextRulesSettings, execution?: TextRulesExecution): Promise<TextRuleResult<{ text: string; report: TextRuleFinding[] }>>;
/**
 * Replace-only Draft -> validated Patches; source/spans are deeply frozen snapshots.
 * Raw whole-text input may derive one original span; scoped unannotated input fails.
 * Draft snapshot compatibility budget: 500000 UTF-16 units including metadata keys,
 * depth 40, 20000 values; original Text <=100000 and <=256 spans.
 * Result still requires downstream Validate Patches -> Review Gate -> Apply Reply.
 */
export function createDraftRulePatches(draft: unknown, settings?: TextRulesSettings, execution?: TextRulesExecution): Promise<TextRuleResult<{ artifact: DraftRulePatches; report: TextRuleFinding[] }>>;
