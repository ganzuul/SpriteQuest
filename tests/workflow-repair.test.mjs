import assert from 'node:assert/strict';
import { scanDraft, repairDraft, validatePatches } from '../src/workflow/repair.js';
const draft = text => ({ kind: 'draft', text, source: { chatId: 'synthetic', messageIndex: 4, swipeId: 0, originalText: text } });
const scanned = (text = 'Before. "A shiver ran down her spine." After.', node = { rules: ['A shiver ran down her spine.'] }) => scanDraft(draft(text), node).artifact;
// Losing literal matches or changing source bytes must fail this fixture.
{
    const input = draft('😀 A shiver ran down her spine.');
    const result = scanDraft(input, { rules: ['a shiver ran down her spine.'] });
    assert.equal(result.ok, true);
    assert.equal(result.artifact.text, input.text);
    assert.deepEqual(result.artifact.spans, [{ index: 0, start: 3, end: 31, text: 'A shiver ran down her spine.' }]);
    assert.equal(input.spans, undefined);
}

// Ignoring narration/dialogue scope would leak edit permissions across quotes.
{
    const input = draft('cold "cold" cold “cold” cold');
    assert.deepEqual(scanDraft(input, { rules: ['cold'], scope: 'dialogue' }).artifact.spans.map(s => [s.start, s.end]), [[6, 10], [18, 22]]);
    assert.deepEqual(scanDraft(input, { rules: ['cold'], scope: 'narration' }).artifact.spans.map(s => [s.start, s.end]), [[0, 4], [12, 16], [24, 28]]);
}
// Unmatched quotation must produce a report and no guessed scoped permissions.
{
    const result = scanDraft(draft('cold "cold'), { rules: ['cold'], scope: 'narration' });
    assert.deepEqual(result.artifact.spans, []);
    assert.equal(result.reports[0]?.code, 'UNMATCHED_QUOTES');
}
// Exempted literal occurrences must never grant editable spans.
{
    const result = scanDraft(draft('cold heart and cold.'), { rules: ['cold'], exemptions: ['cold heart'] });
    assert.deepEqual(result.artifact.spans.map(s => [s.start, s.end]), [[15, 19]]);
}
// Protected wording remains inspectable but never receives edit permission.
{
    const result = scanDraft(draft('cold heart and cold.'), { rules: ['cold'], protectedLiterals: ['cold heart'] });
    assert.deepEqual(result.artifact.spans.map(s => [s.start, s.end]), [[15, 19]]);
    assert.equal(result.artifact.findings[0].protected, true);
}
// Overlapping or adjacent phrase hits grant one sorted, stable edit region.
{
    const result = scanDraft(draft('abcdef zz abc'), { rules: ['def', 'abc', 'bcd'] });
    assert.deepEqual(result.artifact.spans, [{ index: 0, start: 0, end: 6, text: 'abcdef' }, { index: 1, start: 10, end: 13, text: 'abc' }]);
    assert.equal(result.artifact.findings.length, 4);
}
// Case-insensitive matching must retain original offsets and treat regex punctuation literally.
{
    const result = scanDraft(draft('İ [cold] COLD'), { rules: ['[cold]'], exemptions: ['x.*'] });
    assert.deepEqual(result.artifact.spans.map(s => [s.start, s.end]), [[2, 8]]);
    assert.deepEqual(scanDraft(draft('COLD cold'), { rules: ['cold'], caseSensitive: true }).artifact.spans.map(s => [s.start, s.end]), [[5, 9]]);
}
// One bounded repair uses supplied span indices and splices only those original ranges.
{
    let attempts = 0;
    const input = scanned();
    const repaired = await repairDraft(input, { id: 'repair' }, {
        binding: { profileId: 'synthetic-prose', model: 'synthetic-model' },
        countTokens: async () => ({ tokens: 100, method: 'synthetic' }),
        request: async request => {
            attempts++;
            assert.equal(request.binding.profileId, 'synthetic-prose');
            assert.equal(request.maxTokens, 2048);
            assert.match(request.messages[0].content, /patches/);
            assert.match(request.messages[1].content, /A shiver ran down her spine/);
            return { ok: true, data: { text: '{"patches":[{"index":0,"replacement":"She paused."}]}', usage: { completion_tokens: 20 }, finish: 'stop' } };
        },
    });
    assert.equal(repaired.ok, true);
    const result = validatePatches(repaired.artifact, { id: 'validate' });
    assert.equal(result.ok, true);
    assert.equal(result.artifact.text, 'Before. "She paused." After.');
    assert.equal(result.artifact.original, input.text);
    assert.equal(result.artifact.reviewRequired, true);
    assert.deepEqual(result.artifact.source, input.source);
    assert.deepEqual(result.artifact.usage, { completion_tokens: 20 });
    assert.equal(attempts, 1);
    assert.equal(repaired.calls.length, 1);
}
// Literal scan-only reaches an unchanged inspectable candidate without a request or tokenizer.
{
    const input = scanned();
    const result = await repairDraft(input, { mode: 'scan' }, { request: () => { throw Error('scan made a request'); } });
    assert.equal(result.ok, true);
    assert.equal(result.calls.length, 0);
    const candidate = validatePatches(result.artifact);
    assert.equal(candidate.artifact.text, input.text);
    assert.deepEqual(candidate.artifact.findings, input.findings);
    assert.deepEqual(candidate.artifact.changes, []);
}
const patchArtifact = (patches, extra = {}) => ({ kind: 'patches', draft: scanned(), patches, finish: 'stop', ...extra });
// Invalid JSON is an explicit failure with the original still inspectable.
{
    const result = validatePatches(patchArtifact('{not json'));
    assert.equal(result.error?.code, 'INVALID_PATCHES');
    assert.equal(result.artifact.text, 'Before. "A shiver ran down her spine." After.');
}
// A model cannot invent an index outside the supplied permission set.
assert.equal(validatePatches(patchArtifact('{"patches":[{"index":99,"replacement":"Gone"}]}')).error?.code, 'INVALID_PATCHES');
// Repeating an index cannot splice the original range twice.
assert.equal(validatePatches(patchArtifact('{"patches":[{"index":0,"replacement":"One"},{"index":0,"replacement":"Two"}]}')).error?.code, 'INVALID_PATCHES');
// Blank/non-string replacements are not deletions authorized by prose repair.
for (const replacement of ['', '   ', null, 7]) assert.equal(validatePatches(patchArtifact(JSON.stringify({ patches: [{ index: 0, replacement }] }))).error?.code, 'INVALID_PATCHES');
// Imported/altered intersecting permissions must fail before candidate construction.
{
    const artifact = patchArtifact([]);
    artifact.draft.spans.push({ index: 1, start: 10, end: 20, text: artifact.draft.text.slice(10, 20) });
    assert.equal(validatePatches(artifact).error?.code, 'INVALID_SPANS');
}
// Literal pins retain every original occurrence, including repetitions inside edited spans.
{
    const artifact = patchArtifact([{ index: 0, replacement: 'pin' }]);
    artifact.draft = scanned('pin pin', { rules: ['pin pin'] });
    artifact.protectedLiterals = ['pin'];
    assert.equal(validatePatches(artifact).error?.code, 'PROTECTED_LITERAL_REMOVED');
}
// Cutoff output remains a failed artifact even when its JSON happens to parse.
for (const finish of ['length', 'max_tokens', 'max_output_tokens']) assert.equal(validatePatches(patchArtifact('{"patches":[]}', { finish })).error?.code, 'TRUNCATED_OUTPUT');
// A draft that no longer agrees with its frozen source cannot produce a candidate.
{
    const artifact = patchArtifact([]);
    artifact.draft.source.originalText = 'A different swipe';
    assert.equal(validatePatches(artifact).error?.code, 'STALE_SOURCE');
}
// An already-aborted run cannot issue a repair request.
{
    const controller = new AbortController(); controller.abort();
    const result = await repairDraft(scanned(), {}, { signal: controller.signal });
    assert.equal(result.error?.code, 'ABORTED');
    assert.equal(result.calls.length, 0);
}
// An abort while a request is pending invalidates its later successful completion.
{
    const controller = new AbortController();
    const result = await repairDraft(scanned(), {}, {
        signal: controller.signal,
        countTokens: async () => ({ tokens: 10, method: 'synthetic' }),
        request: async () => { controller.abort(); return { ok: true, data: { text: '{"patches":[]}', usage: { completion_tokens: 1 }, finish: 'stop' } }; },
    });
    assert.equal(result.error?.code, 'ABORTED');
    assert.equal(result.calls.length, 1);
    assert.equal(result.artifact.kind, 'draft');
}
// Provider failures remain explicit and retain the attempted request for review.
{
    const result = await repairDraft(scanned(), {}, { countTokens: async () => ({ tokens: 1, method: 'synthetic' }), request: async () => ({ ok: false, error: { code: 'PROFILE_UNAVAILABLE', message: 'Synthetic unavailable profile' } }) });
    assert.equal(result.error?.code, 'PROFILE_UNAVAILABLE');
    assert.equal(result.calls.length, 1);
    assert.equal(result.artifact.kind, 'draft');
}
// Empty rules/permissions produce a no-op without requiring model ports.
{
    const input = scanned('Untouched. 😀', {});
    assert.deepEqual(input.spans, []);
    const result = await repairDraft(input);
    assert.equal(result.ok, true);
    assert.deepEqual(result.calls, []);
    assert.equal(validatePatches(result.artifact).artifact.text, 'Untouched. 😀');
}
// An empty model patch response explicitly reports unchanged prose.
{
    const result = validatePatches(patchArtifact('{"patches":[]}'));
    assert.equal(result.ok, true);
    assert.equal(result.artifact.text, 'Before. "A shiver ran down her spine." After.');
    assert.deepEqual(result.artifact.changes, []);
    assert.equal(result.reports[0]?.code, 'NO_CHANGES');
}
// Identity replacements do not appear as changes needing acceptance.
{
    const result = validatePatches(patchArtifact([{ index: 0, replacement: 'A shiver ran down her spine.' }]));
    assert.equal(result.ok, true);
    assert.deepEqual(result.artifact.changes, []);
    assert.equal(result.reports[0]?.code, 'NO_CHANGES');
}
// Oversized input or permission sets must stop before transmission, without truncation.
{
    const text = 'x'.repeat(100001);
    assert.equal(scanDraft(draft(text), { rules: ['x'] }).error?.code, 'INPUT_LIMIT');
    const input = scanned(); input.text = text; input.source.originalText = text;
    assert.equal((await repairDraft(input)).error?.code, 'INPUT_LIMIT');
    const many = scanned('x '.repeat(257), { rules: ['x'] });
    assert.equal((await repairDraft(many)).error?.code, 'SPAN_LIMIT');
}
// Malformed external scan/repair artifacts return explicit failures before reading or sending.
for (const input of [null, {}, { kind: 'context', text: 'x' }, draft(17)]) {
    assert.equal(scanDraft(input).error?.code, 'INVALID_DRAFT');
    assert.equal((await repairDraft(input)).error?.code, 'INVALID_DRAFT');
}
assert.equal(validatePatches(null).error?.code, 'INVALID_PATCHES');
// Invalid permission sets are rejected by repair itself before port use.
{
    const input = scanned(); input.spans[0].end = 500;
    assert.equal((await repairDraft(input)).error?.code, 'INVALID_SPANS');
    const stale = scanned(); stale.source.originalText = 'Other';
    assert.equal((await repairDraft(stale)).error?.code, 'STALE_SOURCE');
}
// Malformed or excessive editable preferences fail before scanning/transmission.
for (const node of [{ scope: 'guess' }, { rules: [''] }, { rules: [{ phrase: 42 }] }, { exemptions: [7] }, { protectedLiterals: [''] }, { caseSensitive: 'false' }, { rules: Array(129).fill('cold') }]) assert.equal(scanDraft(draft('cold'), node).error?.code, 'INVALID_SETTINGS');
for (const node of [{ mode: 'rewrite' }, { maxTokens: 0 }, { instructions: 17 }, { protectedLiterals: [null] }]) assert.equal((await repairDraft(scanned(), node)).error?.code, 'INVALID_SETTINGS');
// Pending requests and later consumers cannot alter the frozen supplied permissions.
{
    const input = scanned();
    const result = await repairDraft(input, {}, { countTokens: async () => ({ tokens: 10, method: 'synthetic' }), request: async () => {
        input.spans[0].end = 40; input.source.originalText = 'Changed elsewhere';
        return { ok: true, data: { text: '{"patches":[{"index":0,"replacement":"She paused."}]}', usage: null, finish: 'stop' } };
    } });
    assert.throws(() => { result.artifact.draft.spans[0].end = 40; }, TypeError);
    assert.equal(validatePatches(result.artifact).artifact.text, 'Before. "She paused." After.');
}
// Abort during token measurement stops before the request reservation/send.
{
    const controller = new AbortController();
    const result = await repairDraft(scanned(), {}, { signal: controller.signal, countTokens: async () => { controller.abort(); return { tokens: 1, method: 'synthetic' }; }, request: async () => { throw Error('sent after token-stage abort'); } });
    assert.equal(result.error?.code, 'ABORTED');
    assert.equal(result.calls.length, 0);
}
// Unexpected port exceptions do not escape or erase the attempted request.
{
    const result = await repairDraft(scanned(), {}, { countTokens: async () => ({ tokens: 10, method: 'synthetic' }), request: async () => { throw Error('synthetic transport exception'); } });
    assert.equal(result.error?.code, 'REQUEST_FAILED');
    assert.equal(result.calls.length, 1);
    assert.equal(result.artifact.kind, 'draft');
}
// Tokenizer failures stop without attempting a model call.
{
    const result = await repairDraft(scanned(), {}, { countTokens: async () => { throw Error('synthetic tokenizer failure'); } });
    assert.equal(result.error?.code, 'TOKEN_COUNT_FAILED');
    assert.equal(result.calls.length, 0);
}
// Whole-text scan still reports unmatched quotes while its scope remains unambiguous.
{
    const result = scanDraft(draft('cold "cold'), { rules: ['cold'], scope: 'whole' });
    assert.equal(result.artifact.spans.length, 2);
    assert.equal(result.reports[0]?.code, 'UNMATCHED_QUOTES');
}
// Supplied spans cannot escape a declared scope or split UTF-16 surrogate pairs.
{
    const scoped = patchArtifact([]); scoped.draft.scope = 'dialogue';
    scoped.draft.spans = [{ index: 0, start: 0, end: 6, text: 'Before' }];
    assert.equal(validatePatches(scoped).error?.code, 'INVALID_SPANS');
    const split = patchArtifact([]); split.draft = draft('😀');
    split.draft.spans = [{ index: 0, start: 1, end: 2, text: '\ude00' }];
    assert.equal(validatePatches(split).error?.code, 'INVALID_SPANS');
}
// Patch schema forbids replacement text from smuggling alternative ranges or envelope data.
for (const patches of ['{"patches":[{"index":0,"replacement":"X","start":0}]}', '{"patches":[],"text":"whole rewrite"}', 'null', '{"patches":{}}']) assert.equal(validatePatches(patchArtifact(patches)).error?.code, 'INVALID_PATCHES');
// Excessive finding/prompt/output material stops explicitly rather than being truncated.
{
    assert.equal(scanDraft(draft('x '.repeat(4097)), { rules: ['x'] }).error?.code, 'SCAN_LIMIT');
    const input = scanned(); input.rules = ['x'.repeat(500001)];
    assert.equal((await repairDraft(input)).error?.code, 'INPUT_LIMIT');
    assert.equal(validatePatches(patchArtifact('x'.repeat(100001))).error?.code, 'OUTPUT_LIMIT');
}
// Rejected cutoff output retains usage/finish alongside original source and findings.
{
    const result = validatePatches(patchArtifact('{"patches":[]}', { finish: 'length', usage: { completion_tokens: 2048 } }));
    assert.equal(result.artifact.finish, 'length');
    assert.deepEqual(result.artifact.usage, { completion_tokens: 2048 });
    assert.deepEqual(result.artifact.findings, scanned().findings);
}
// Apostrophes/single quotes are ordinary narration; they never guess dialogue scope.
{
    const input = draft("It's 'cold' today.");
    assert.deepEqual(scanDraft(input, { rules: ['cold'], scope: 'dialogue' }).artifact.spans, []);
    assert.deepEqual(scanDraft(input, { rules: ['cold'], scope: 'narration' }).artifact.spans.map(s => [s.start, s.end]), [[6, 10]]);
}
// Inspector edits during measurement cannot change the already-bounded request settings.
{
    const node = { maxTokens: 2048, protectedLiterals: ['paused'] };
    const result = await repairDraft(scanned(), node, { countTokens: async () => { node.maxTokens = 999999; node.protectedLiterals = []; return { tokens: 10, method: 'synthetic' }; }, request: async request => {
        assert.equal(request.maxTokens, 2048);
        return { ok: true, data: { text: '{"patches":[]}', usage: null, finish: 'stop' } };
    } });
    assert.equal(result.ok, true);
    assert.deepEqual(result.artifact.protectedLiterals, ['paused']);
}
