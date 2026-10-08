import type { TextRule, TextRuleFinding, TextRuleResult } from './text-rules.js';
/** Internal engine: run only within a dedicated terminable Worker. */
export function runTextRuleSegments(request: {
    segments: string[];
    settings: { mode: 'replace' | 'extract'; separator: string; rules: Required<TextRule>[] };
}): TextRuleResult<{ segments: string[]; report: TextRuleFinding[] }>;
