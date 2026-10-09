import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validatePatches } from '../src/workflow/repair.js';
import * as operation from '../src/workflow/operations/terminology-map.js';
const rawDraft = text => ({ kind: 'draft', text, source: { originalText: text, token: 'source-token', revision: { swipe: 2 } } });
const must = result => { assert.equal(result.ok, true, JSON.stringify(result.error)); return result.data; };
const mapped = (text, entries, settings = {}) => must(operation.mapTerminology(rawDraft(text), { entries }, { scope: 'whole', ...settings }));
const candidate = data => { const result = validatePatches(data.artifact); assert.equal(result.ok, true); return result.artifact.text; };

test('canonical replacement produces compatible patches and preserves source provenance', () => {
    assert.equal(typeof operation.mapTerminology, 'function');
    const draft = rawDraft('The old term remains.');
    const before = structuredClone(draft);
    const data = must(operation.mapTerminology(draft, { entries: [{ from: 'old term', to: 'canonical term' }] }, { scope: 'whole' }));
    assert.equal(candidate(data), 'The canonical term remains.');
    assert.deepEqual(draft, before);
    assert.deepEqual(JSON.parse(JSON.stringify(data.artifact.draft.source)), draft.source);
    assert.equal(Object.isFrozen(data.artifact.draft.source.revision), true);
    assert.deepEqual(data.artifact.patches.map(p => ({ ...p })), [{ index: 0, replacement: 'The canonical term remains.' }]);
    assert.equal(data.report.at(-1).findings[0].start, 4);
    assert.equal(data.report.at(-1).findings[0].end, 12);
    assert.equal(data.report.at(-1).findings[0].glossaryIndex, 0);
});

test('mappings are simultaneous and choose leftmost longest original literals', () => {
    const data = mapped('A B AB ABC A', [{ from: 'A', to: 'B' }, { from: 'B', to: 'C' }, { from: 'AB', to: 'long' }, { from: 'ABC', to: '$&$$$1' }]);
    assert.equal(candidate(data), 'B C long $&$$$1 B');
    assert.deepEqual(data.report.at(-1).findings.map(f => [f.start, f.end, f.glossaryIndex]), [[0, 1, 0], [2, 3, 1], [4, 6, 2], [7, 10, 3], [11, 12, 0]]);
});
test('word matching respects Unicode neighbors and original window boundaries while phrase matching is literal', () => {
    const entries = [{ from: 'cat', to: 'dog' }];
    const text = 'cat scatter caté cat\u0301 cat_ cat2 😀cat';
    assert.equal(candidate(mapped(text, entries)), 'dog scatter caté cat\u0301 cat_ cat2 😀dog');
    assert.equal(candidate(mapped('scatter', entries, { match: 'phrase' })), 'sdogter');
    const draft = { ...rawDraft('xcat caty cat'), spans: [{ index: 0, start: 1, end: 4, text: 'cat' }, { index: 1, start: 5, end: 8, text: 'cat' }, { index: 2, start: 10, end: 13, text: 'cat' }] };
    assert.equal(candidate(must(operation.mapTerminology(draft, { entries }))), 'xcat caty dog');
    assert.equal(candidate(mapped('xcat caty', entries, { protectedLiterals: ['x', 'y'] })), 'xcat caty');
});

test('Unicode case-insensitive literals retain absolute UTF-16 offsets without expansion', () => {
    const data = mapped('😀 K ſ İ I 𐐀 ß ẞ ss', [{ from: 'k', to: 'KELVIN' }, { from: 's', to: 'S' }, { from: 'i', to: 'eye' }, { from: '𐐨', to: 'D' }, { from: 'ß', to: 'sharp' }], { caseSensitive: false });
    assert.equal(candidate(data), '😀 KELVIN S İ eye D sharp sharp ss');
    assert.deepEqual(data.report.at(-1).findings.map(f => [f.start, f.end, f.glossaryIndex]), [[3, 4, 0], [5, 6, 1], [9, 10, 2], [11, 13, 3], [14, 15, 4], [16, 17, 4]]);
    assert.equal(candidate(mapped('CAT cat', [{ from: 'cat', to: 'dog' }])), 'CAT dog');
});
test('duplicate effective rules reject the whole mapping while empty glossaries are no-change', () => {
    for (const [entries, settings] of [
        [[{ from: 'cat', to: 'one' }, { from: 'cat', to: 'two' }], {}],
        [[{ from: 'k', to: 'one' }, { from: 'K', to: 'two' }], { caseSensitive: false }],
        [[{ from: 's', to: 'one' }, { from: 'ſ', to: 'two' }], { caseSensitive: false }],
        [[{ from: 'ß', to: 'one' }, { from: 'ẞ', to: 'two' }], { caseSensitive: false }],
    ]) {
        const result = operation.mapTerminology(rawDraft('cat k s ß'), { entries }, { scope: 'whole', ...settings });
        assert.equal(result.ok, false); assert.equal(result.error.code, 'DUPLICATE_RULE'); assert.equal(result.data, undefined);
    }
    const empty = mapped('cat', []);
    assert.deepEqual(empty.artifact.patches, []);
    assert.equal(empty.report.at(-1).count, 0);
    assert.deepEqual(empty.report.at(-1).findings, []);
    assert.equal(candidate(mapped('ß ss', [{ from: 'ß', to: 'one' }, { from: 'ss', to: 'two' }], { caseSensitive: false })), 'one two');
    assert.equal(candidate(mapped('CAT cat', [{ from: 'CAT', to: 'one' }, { from: 'cat', to: 'two' }])), 'one two');
});
test('malformed glossary and settings reject without reading accessors or returning artifacts', () => {
    let reads = 0;
    const getter = key => Object.defineProperty({}, key, { enumerable: true, get() { reads++; return key === 'entries' ? [] : 'cat'; } });
    const entryGetter = Object.defineProperty({ to: 'dog' }, 'from', { enumerable: true, get() { reads++; return 'cat'; } });
    const arrayGetter = []; Object.defineProperty(arrayGetter, '0', { enumerable: true, get() { reads++; return { from: 'cat', to: 'dog' }; } });
    const extraArray = []; extraArray.named = 1;
    const validEntry = { from: 'cat', to: 'dog' };
    const unsafeGlossaries = [null, [], {}, { entries: null }, { entries: [null] }, { entries: [Object.create(validEntry)] }, { entries: [entryGetter] }, { entries: arrayGetter }, { entries: new Array(1) }, { entries: extraArray }, getter('entries'), Object.create({ entries: [] }), { entries: [], extra: true }, { entries: [{ ...validEntry, extra: true }] }, { entries: [{ from: ' ', to: 'dog' }] }, { entries: [{ from: 'cat', to: '' }] }, { entries: [{ from: 3, to: 'dog' }] }];
    for (const glossary of unsafeGlossaries) {
        const result = operation.mapTerminology(rawDraft('cat'), glossary, { scope: 'whole' });
        assert.equal(result.ok, false); assert.equal(result.error.code, 'INVALID_GLOSSARY'); assert.equal(result.data, undefined);
    }
    for (const settings of [null, [], getter('scope'), getter('caseSensitive'), getter('match'), Object.create({ scope: 'whole' }), { scope: 'whole', caseSensitive: null }, { scope: 'whole', match: 'regex' }, { scope: 'whole', extra: true }, { scope: 'whole', protectedLiterals: null }]) {
        const result = operation.mapTerminology(rawDraft('cat'), { entries: [validEntry] }, settings);
        assert.equal(result.ok, false); assert.equal(result.error.code, 'INVALID_SETTINGS'); assert.equal(result.data, undefined);
    }
    assert.equal(reads, 0);
});
test('glossary limits include 128 rules and 2048-unit literals and reject larger data', () => {
    const entries = Array.from({ length: 128 }, (_, i) => ({ from: 'term-' + i, to: 'canonical-' + i }));
    assert.equal(candidate(mapped('term-127', entries)), 'canonical-127');
    const overflow = operation.mapTerminology(rawDraft('term-127'), { entries: [...entries, { from: 'extra', to: 'new' }] }, { scope: 'whole' });
    assert.equal(overflow.ok, false); assert.equal(overflow.error.code, 'INVALID_GLOSSARY');
    assert.equal(candidate(mapped('x'.repeat(2048), [{ from: 'x'.repeat(2048), to: 'y'.repeat(2048) }])), 'y'.repeat(2048));
    for (const entry of [{ from: 'x'.repeat(2049), to: 'y' }, { from: 'x', to: 'y'.repeat(2049) }]) {
        const result = operation.mapTerminology(rawDraft('x'), { entries: [entry] }, { scope: 'whole' });
        assert.equal(result.ok, false); assert.equal(result.error.code, 'INVALID_GLOSSARY'); assert.equal(result.data, undefined);
    }
});

test('finding and output caps fail atomically at the first excess', () => {
    const entry = [{ from: 'x', to: 'y' }];
    const inclusive = mapped('x '.repeat(4096), entry);
    assert.equal(inclusive.report.at(-1).count, 4096);
    assert.equal(candidate(inclusive), 'y '.repeat(4096));
    const tooMany = operation.mapTerminology(rawDraft('x '.repeat(4097)), { entries: entry }, { scope: 'whole' });
    assert.equal(tooMany.ok, false); assert.equal(tooMany.error.code, 'FINDING_LIMIT'); assert.equal(tooMany.data, undefined);
    const text = 'x'.repeat(2048);
    const nearLimit = mapped(text.repeat(48) + 'tail'.repeat(424), [{ from: text, to: text }], { match: 'phrase' });
    assert.equal(candidate(nearLimit).length, 100000);
    const output = mapped('x '.repeat(50), [{ from: 'x', to: 'y'.repeat(1999) }]);
    assert.equal(candidate(output).length, 100000);
    const tooLong = operation.mapTerminology(rawDraft('x '.repeat(50)), { entries: [{ from: 'x', to: 'y'.repeat(2000) }] }, { scope: 'whole' });
    assert.equal(tooLong.ok, false); assert.equal(tooLong.error.code, 'OUTPUT_LIMIT'); assert.equal(tooLong.data, undefined);
});
test('boundary traversal treats lone low surrogates separately and cannot replace halves of astral characters', () => {
    assert.equal(candidate(mapped('x\udc00cat 𐐀cat', [{ from: 'cat', to: 'dog' }])), 'x\udc00dog 𐐀cat');
    assert.equal(candidate(mapped('😀', [{ from: '\ud83d', to: 'x' }, { from: '\ude00', to: 'y' }], { match: 'phrase' })), '😀');
});
test('scope and protected literals narrow authorized original spans and preserve parent indices', () => {
    const text = 'old KEEP old "old" old';
    const draft = { ...rawDraft(text), spans: [{ index: 0, start: 9, end: 22, text: text.slice(9, 22), note: 'permission' }], protectedLiterals: ['KEEP'] };
    const data = must(operation.mapTerminology(draft, { entries: [{ from: 'old', to: 'new' }] }, { scope: 'narration', protectedLiterals: ['old KEEP'] }));
    assert.equal(candidate(data), 'old KEEP new "old" new');
    assert.deepEqual(data.report.at(-1).findings.map(f => [f.start, f.end, f.spanIndex]), [[9, 12, 0], [19, 22, 0]]);
    assert.equal(data.artifact.draft.spans[0].note, 'permission');
    assert.deepEqual(data.artifact.draft.spans.map(s => [s.start, s.end]), [[9, 22]]);
    assert.equal(operation.mapTerminology(rawDraft('old'), { entries: [{ from: 'old', to: 'new' }] }).error.code, 'SCOPE_REQUIRED');
    assert.equal(candidate(mapped('old KEEP old', [{ from: 'old KEEP', to: 'new' }, { from: 'KEEP old', to: 'new' }], { match: 'phrase', protectedLiterals: ['KEEP'] })), 'old KEEP old');
    const empty = must(operation.mapTerminology({ ...rawDraft('old'), spans: [] }, { entries: [{ from: 'old', to: 'new' }] }, { scope: 'whole' }));
    assert.deepEqual(empty.artifact.patches, []);
});

test('literal regex metacharacters remain exact and glossary inputs stay isolated from results', () => {
    const draft = rawDraft('a.b a*b [cat] c++');
    const glossary = { entries: [{ from: 'a.b', to: '$&' }, { from: '[cat]', to: '$1$$' }, { from: 'c++', to: '$`$\'' }] };
    const settings = { scope: 'whole', match: 'phrase', protectedLiterals: [] };
    const before = structuredClone({ draft, glossary, settings });
    const data = must(operation.mapTerminology(draft, glossary, settings));
    assert.equal(candidate(data), '$& a*b $1$$ $`$\'');
    assert.deepEqual({ draft, glossary, settings }, before);
    glossary.entries[0].to = 'changed'; settings.protectedLiterals.push('a.b'); draft.source.revision.swipe = 99;
    assert.equal(candidate(data), '$& a*b $1$$ $`$\'');
    assert.equal(data.report.at(-1).findings[0].to, '$&');
    assert.equal(data.artifact.draft.source.revision.swipe, 2);
    const unchanged = mapped('CAT', [{ from: 'cat', to: 'dog' }]);
    assert.deepEqual(unchanged.artifact.patches, []);
    assert.equal(unchanged.report.at(-1).count, 0);
    assert.equal(unchanged.report[0].code, 'NO_CHANGES');
});
