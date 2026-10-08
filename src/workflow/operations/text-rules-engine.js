const MAX_TEXT = 100000;
function reject(code, message) { throw Object.assign(new Error(message), { code }); }
function boundedText() {
    const parts = [];
    let length = 0;
    return {
        append(part) {
            if (length + part.length > MAX_TEXT) reject('OUTPUT_LIMIT', 'Text rules output exceeds 100,000 UTF-16 units.');
            length += part.length;
            if (part.length) parts.push(part);
        },
        text: () => parts.join(''),
    };
}
function replacementToken(token, key, match, text) {
    if (key === '$') return '$';
    if (key === '&') return match[0];
    if (key === '`') return text.slice(0, match.index);
    if (key === "'") return text.slice(match.index + match[0].length);
    if (key[0] === '<') return match.groups ? (match.groups[key.slice(1, -1)] ?? '') : token;
    const index = Number(key);
    if (index > 0 && index < match.length) return match[index] ?? '';
    if (key.length === 2 && Number(key[0]) > 0 && Number(key[0]) < match.length) return (match[Number(key[0])] ?? '') + key[1];
    return token;
}
function replacementText(template, match, text) {
    const output = boundedText();
    let cursor = 0;
    for (const token of template.matchAll(/\$(\$|&|`|'|[0-9]{1,2}|<[^>]*>)/g)) {
        output.append(template.slice(cursor, token.index));
        output.append(replacementToken(token[0], token[1], match, text));
        cursor = token.index + token[0].length;
    }
    output.append(template.slice(cursor));
    return output.text();
}
/** Worker-only engine. Callers must use the terminable Worker boundary in text-rules.js. */
export function runTextRuleSegments(request) {
    try { return transformSegments(request); }
    catch (error) { return { ok: false, error: { code: error.code ?? 'INVALID_RULES', message: error.message } }; }
}
function transformSegments({ segments, settings }) {
    const compiled = settings.rules.map(rule => rule.kind === 'regex' ? new RegExp(rule.pattern, rule.flags + 'g') : null);
    const report = [];
    let aggregateLength = 0;
    const output = segments.map((source, segmentIndex) => {
        let text = source, extractedCount = 0;
        const extracted = boundedText();
        for (const [ruleIndex, rule] of settings.rules.entries()) {
            let cursor = 0;
            const result = boundedText();
            const matches = rule.kind === 'regex'
                ? text.matchAll(compiled[ruleIndex])
                : literalMatches(text, rule.pattern, rule.flags);
            for (const match of matches) {
                if (match[0].length === 0) reject('INVALID_RULES', 'Zero-width text rules are unsupported.');
                const start = match.index, end = start + match[0].length;
                if (report.length >= 4096) reject('FINDING_LIMIT', 'Text rules exceed 4,096 findings.');
                report.push({ ruleIndex, segmentIndex, start, end, text: match[0] });
                if (settings.mode === 'extract') {
                    if (extractedCount++) extracted.append(settings.separator);
                    extracted.append(match[0]);
                } else {
                    result.append(text.slice(cursor, start));
                    result.append(rule.kind === 'regex' ? replacementText(rule.replacement, match, text) : rule.replacement);
                    cursor = end;
                }
            }
            if (settings.mode !== 'extract') {
                result.append(text.slice(cursor));
                text = result.text();
            }
        }
        const value = settings.mode === 'extract' ? extracted.text() : text;
        aggregateLength += value.length;
        if (aggregateLength > MAX_TEXT) reject('OUTPUT_LIMIT', 'Aggregate text rules output exceeds 100,000 UTF-16 units.');
        return value;
    });
    return { ok: true, data: { segments: output, report } };
}
function* literalMatches(text, pattern, flags) {
    if (flags) { yield* text.matchAll(new RegExp(RegExp.escape(pattern), flags + 'g')); return; }
    let cursor = 0, start;
    while ((start = text.indexOf(pattern, cursor)) !== -1) {
        const match = [pattern]; match.index = start;
        yield match;
        cursor = start + pattern.length;
    }
}
