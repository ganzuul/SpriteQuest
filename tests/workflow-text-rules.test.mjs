import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Worker } from 'node:worker_threads';
import { applyTextRules, createDraftRulePatches } from '../src/workflow/operations/text-rules.js';
function workerHarness() {
    const workers = [];
    return {
        workers,
        factory(entryURL) {
            const worker = new Worker(new URL('./fixtures/text-rules-node-worker.mjs', import.meta.url), { workerData: { entryURL: entryURL?.href } });
            const handlers = new Map();
            let markStarted;
            const resource = { worker, termination: null, listeners: 0, started: new Promise(resolve => { markStarted = resolve; }) };
            workers.push(resource);
            return {
                addEventListener(type, fn) {
                    const handler = type === 'message' ? data => {
                        if (data.fixtureStarted) markStarted(); else fn({ data });
                    } : error => fn({ error });
                    handlers.set(fn, { type, handler }); resource.listeners++;
                    worker.on(type, handler);
                },
                removeEventListener(type, fn) {
                    const item = handlers.get(fn);
                    if (item) { worker.off(type, item.handler); handlers.delete(fn); resource.listeners--; }
                },
                postMessage(data) { worker.postMessage(data); },
                terminate() { resource.termination = worker.terminate(); return resource.termination; },
            };
        },
        async cleaned() {
            assert.ok(workers.length > 0);
            for (const resource of workers) {
                assert.ok(resource.termination, 'owned Worker must be terminated');
                await resource.termination;
                assert.equal(resource.worker.threadId, -1);
                assert.equal(resource.listeners, 0);
            }
        },
    };
}
const literal = (pattern, replacement, flags) => ({ kind: 'literal', pattern, replacement, ...(flags ? { flags } : {}) });
test('literal replacements are global literal strings and terminate the real Worker', async () => {
    assert.equal(typeof applyTextRules, 'function');
    const harness = workerHarness();
    const result = await applyTextRules('cold cold', { rules: [literal('cold', '$& warm')] }, { workerFactory: harness.factory });
    assert.equal(result.ok, true);
    assert.equal(result.data.text, '$& warm $& warm');
    assert.deepEqual(result.data.report, [
        { ruleIndex: 0, segmentIndex: 0, start: 0, end: 4, text: 'cold' },
        { ruleIndex: 0, segmentIndex: 0, start: 5, end: 9, text: 'cold' },
    ]);
    await harness.cleaned();
});
test('regex replace expands numbered and named captures and standard context tokens', async () => {
    const harness = workerHarness();
    const result = await applyTextRules('a12 b34', { rules: [{ kind: 'regex', pattern: '(?<letter>[a-z])(\\d+)', replacement: '$<letter>:$2:$$:$&:$`:$\'', flags: 'i' }] }, { workerFactory: harness.factory });
    assert.equal(result.ok, true);
    assert.equal(result.data.text, 'a:12:$:a12:: b34 b:34:$:b34:a12 :');
    await harness.cleaned();
});
test('extraction joins whole matches in rule order without sequentially replacing text', async () => {
    const harness = workerHarness();
    const result = await applyTextRules('cat 12 dog 34', { mode: 'extract', separator: '|', rules: [{ kind: 'regex', pattern: '\\d+' }, literal('cat')] }, { workerFactory: harness.factory });
    assert.equal(result.ok, true);
    assert.equal(result.data.text, '12|34|cat');
    assert.deepEqual(result.data.report.map(({ ruleIndex, start }) => [ruleIndex, start]), [[0, 4], [0, 11], [1, 0]]);
    await harness.cleaned();
});
test('zero-width regex matches reject the entire result and release the Worker', async () => {
    const harness = workerHarness();
    const result = await applyTextRules('abc', { rules: [literal('a', 'A'), { kind: 'regex', pattern: '(?=b)', replacement: 'x' }] }, { workerFactory: harness.factory });
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'INVALID_RULES');
    assert.equal(result.data, undefined);
    await harness.cleaned();
});
test('oversized or nonstring Text fails before creating a Worker', async () => {
    const harness = workerHarness();
    for (const text of ['x'.repeat(100001), null, 123]) {
        const result = await applyTextRules(text, {}, { workerFactory: harness.factory });
        assert.equal(result.ok, false);
        assert.equal(result.error.code, 'INPUT_LIMIT');
    }
    assert.equal(harness.workers.length, 0);
});
test('malformed settings and unsafe rule descriptors return INVALID_RULES before execution', async () => {
    const harness = workerHarness();
    let reads = 0;
    const accessor = {}; Object.defineProperty(accessor, 'rules', { enumerable: true, get() { reads++; throw Error('getter'); } });
    for (const settings of [
        { mode: 'repair' }, null, [], { rules: [literal('', 'x')] }, { rules: [literal('x'.repeat(2049), 'y')] },
        { rules: Array(65).fill(literal('x', 'y')) }, { rules: Array(1) }, { rules: [{ kind: 'other', pattern: 'x' }] },
        { rules: [literal('x', 'y', 'g')] }, { rules: [literal('x', 'y', 'm')] },
        { rules: [{ kind: 'regex', pattern: 'x', flags: 'ii' }] }, { rules: [literal('x', 3)] },
        { rules: 'x' }, { separator: 3 }, { unexpected: true }, accessor,
    ]) {
        const result = await applyTextRules('x', settings, { workerFactory: harness.factory });
        assert.equal(result.ok, false);
        assert.equal(result.error.code, 'INVALID_RULES');
    }
    assert.equal(reads, 0);
    assert.equal(harness.workers.length, 0);
});
test('replacement output overflow fails without exposing partial text', async () => {
    const harness = workerHarness();
    const result = await applyTextRules('x'.repeat(50001), { rules: [literal('x'.repeat(1000), 'y'.repeat(2000))] }, { workerFactory: harness.factory });
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'OUTPUT_LIMIT');
    assert.equal(result.data, undefined);
    await harness.cleaned();
});
test('more than 4096 matches rejects all findings rather than truncating permissions', async () => {
    const harness = workerHarness();
    const result = await applyTextRules('x'.repeat(4097), { rules: [literal('x', 'y')] }, { workerFactory: harness.factory });
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'FINDING_LIMIT');
    assert.equal(result.data, undefined);
    await harness.cleaned();
});
test('case-insensitive literal rules run sequentially with UTF-16 positions at each turn', async () => {
    const harness = workerHarness();
    const rules = [literal('cold', 'warm warm', 'iu'), literal('warm', 'hot')];
    const before = structuredClone(rules);
    const result = await applyTextRules('🧊 COLD cold', { rules }, { workerFactory: harness.factory });
    assert.equal(result.ok, true);
    assert.equal(result.data.text, '🧊 hot hot hot hot');
    assert.deepEqual(result.data.report.map(({ ruleIndex, start, end }) => [ruleIndex, start, end]), [
        [0, 3, 7], [0, 8, 12], [1, 3, 7], [1, 8, 12], [1, 13, 17], [1, 18, 22],
    ]);
    assert.deepEqual(rules, before);
    await harness.cleaned();
});
test('catastrophic regex reaches deadline and releases its actual Worker', async () => {
    const harness = workerHarness();
    let watchdog;
    const result = await Promise.race([
        applyTextRules('a'.repeat(100) + '!', { rules: [{ kind: 'regex', pattern: '(a+)+$', replacement: 'x' }] }, { workerFactory: harness.factory, timeoutMs: 100 }),
        new Promise(resolve => { watchdog = setTimeout(() => resolve({ ok: false, error: { code: 'NO_DEADLINE' } }), 1000); }),
    ]);
    clearTimeout(watchdog);
    if (result.error?.code === 'NO_DEADLINE') await Promise.all(harness.workers.map(({ worker }) => worker.terminate()));
    assert.equal(result.error?.code, 'RULE_TIMEOUT');
    assert.equal(result.data, undefined);
    await harness.cleaned();
});
test('cancellation interrupts an active regex Worker and detaches AbortSignal listeners', async () => {
    const harness = workerHarness();
    const controller = new AbortController();
    const pending = applyTextRules('a'.repeat(100) + '!', { rules: [{ kind: 'regex', pattern: '(a+)+$', replacement: 'x' }] }, { workerFactory: harness.factory, signal: controller.signal });
    await harness.workers[0].started;
    controller.abort();
    const result = await pending;
    assert.equal(result.error?.code, 'ABORTED');
    await harness.cleaned();
    const { getEventListeners } = await import('node:events');
    assert.equal(getEventListeners(controller.signal, 'abort').length, 0);
});
test('already aborted work creates no Worker', async () => {
    const harness = workerHarness();
    const controller = new AbortController(); controller.abort();
    const result = await applyTextRules('x', { rules: [literal('x', 'y')] }, { workerFactory: harness.factory, signal: controller.signal });
    assert.equal(result.error?.code, 'ABORTED');
    assert.equal(harness.workers.length, 0);
});
test('execution deadlines must be integer milliseconds from 100 through 2000', async () => {
    const harness = workerHarness();
    for (const timeoutMs of [99, 2001, 100.5, Infinity, '100', null]) {
        const result = await applyTextRules('x', {}, { workerFactory: harness.factory, timeoutMs });
        assert.equal(result.error?.code, 'INVALID_RULES');
    }
    assert.equal(harness.workers.length, 0);
    assert.equal((await applyTextRules('x', {}, null)).error?.code, 'INVALID_RULES');
    assert.equal((await applyTextRules('x', {}, { signal: {} })).error?.code, 'INVALID_RULES');
});
test('unavailable or malformed Worker factories return Results instead of rejecting', async () => {
    for (const workerFactory of [() => { throw Error('unavailable'); }, () => null, () => ({})]) {
        let result;
        await assert.doesNotReject(async () => { result = await applyTextRules('x', {}, { workerFactory }); });
        assert.equal(result.error?.code, 'WORKER_UNAVAILABLE');
    }
    assert.equal((await applyTextRules('x')).error?.code, 'WORKER_UNAVAILABLE');
});
test('Draft rules emit one validated patch per original span and freeze the source permissions', async () => {
    assert.equal(typeof createDraftRulePatches, 'function');
    const { validatePatches } = await import('../src/workflow/repair.js');
    const text = 'Left cold | cold Right';
    const draft = { kind: 'draft', text, source: { originalText: text, token: 'source-metadata' }, scope: 'whole', spans: [
        { index: 0, start: 5, end: 9, text: 'cold' }, { index: 1, start: 12, end: 16, text: 'cold' },
    ], findings: [{ code: 'UPSTREAM' }] };
    const original = structuredClone(draft);
    const harness = workerHarness();
    const pending = createDraftRulePatches(draft, { rules: [literal('cold', 'warm warm'), literal('warm warm', 'hot')] }, { workerFactory: harness.factory });
    draft.source.token = 'changed-after-snapshot';
    const result = await pending;
    assert.equal(result.ok, true);
    assert.deepEqual(result.data.artifact.patches, [{ index: 0, replacement: 'hot' }, { index: 1, replacement: 'hot' }]);
    assert.deepEqual(result.data.artifact.draft, original);
    assert.equal(Object.isFrozen(result.data.artifact.draft.source), true);
    assert.equal(Object.isFrozen(result.data.artifact.draft.spans[0]), true);
    assert.equal(result.data.artifact.draft.text, text);
    assert.deepEqual(result.data.artifact.draft.spans, original.spans);
    assert.equal(draft.text, text);
    assert.deepEqual(draft.spans, original.spans);
    const candidate = validatePatches(result.data.artifact);
    assert.equal(candidate.ok, true);
    assert.equal(candidate.artifact.text, 'Left hot | hot Right');
    assert.equal(candidate.artifact.reviewRequired, true);
    await harness.cleaned();
});
test('raw unscoped Draft derives only a whole-text original span and empty Draft has none', async () => {
    const { validatePatches } = await import('../src/workflow/repair.js');
    const harness = workerHarness();
    const draft = { kind: 'draft', text: 'cold', source: { originalText: 'cold' } };
    const result = await createDraftRulePatches(draft, { rules: [literal('cold', 'warm')] }, { workerFactory: harness.factory });
    assert.equal(result.ok, true);
    assert.equal(result.data.artifact.draft.scope, 'whole');
    assert.deepEqual(result.data.artifact.draft.spans, [{ index: 0, start: 0, end: 4, text: 'cold' }]);
    assert.equal(Object.hasOwn(draft, 'spans'), false);
    assert.equal(validatePatches(result.data.artifact).artifact.text, 'warm');
    const empty = await createDraftRulePatches({ kind: 'draft', text: '', source: { originalText: '' } }, {}, { workerFactory: harness.factory });
    assert.equal(empty.ok, true);
    assert.deepEqual(empty.data.artifact.draft.spans, []);
    assert.deepEqual(empty.data.artifact.patches, []);
    await harness.cleaned();
});
test('Draft extraction fails before Worker execution because extraction is Text-only', async () => {
    const harness = workerHarness();
    const result = await createDraftRulePatches({ kind: 'draft', text: 'cold', source: { originalText: 'cold' } }, { mode: 'extract', rules: [literal('cold')] }, { workerFactory: harness.factory });
    assert.equal(result.error?.code, 'INVALID_RULES');
    assert.equal(harness.workers.length, 0);
});
test('Draft metadata getters and unsupported snapshots fail without being evaluated', async () => {
    const harness = workerHarness();
    let reads = 0;
    const source = {}; Object.defineProperty(source, 'originalText', { enumerable: true, get() { reads++; return 'cold'; } });
    const base = () => ({ kind: 'draft', text: 'cold', source: { originalText: 'cold' } });
    const cyclic = base(); cyclic.metadata = cyclic;
    for (const draft of [{ kind: 'draft', text: 'cold', source }, { ...base(), metadata: new Date(0) }, { ...base(), spans: Array(1) }, cyclic, { ...base(), protectedLiterals: 17 }]) {
        let result;
        await assert.doesNotReject(async () => { result = await createDraftRulePatches(draft, {}, { workerFactory: harness.factory }); });
        assert.equal(result.error?.code, 'INVALID_DRAFT');
    }
    assert.equal(reads, 0);
    assert.equal(harness.workers.length, 0);
});
test('Draft Text and original span count have pre-execution bounds', async () => {
    const harness = workerHarness();
    const text = 'x'.repeat(100001);
    const oversized = await createDraftRulePatches({ kind: 'draft', text, source: { originalText: text } }, { rules: [literal('x', '')] }, { workerFactory: harness.factory });
    assert.equal(oversized.error?.code, 'INPUT_LIMIT');
    const manyText = Array(257).fill('x').join(' ');
    const spans = Array.from({ length: 257 }, (_, index) => ({ index, start: index * 2, end: index * 2 + 1, text: 'x' }));
    const many = await createDraftRulePatches({ kind: 'draft', text: manyText, source: { originalText: manyText }, spans }, {}, { workerFactory: harness.factory });
    assert.equal(many.error?.code, 'SPAN_LIMIT');
    assert.equal(harness.workers.length, 0);
});
test('Draft output includes unedited text in its aggregate 100000-unit limit', async () => {
    const harness = workerHarness();
    const text = 'cold ' + 'x'.repeat(99990) + ' cold';
    const draft = { kind: 'draft', text, source: { originalText: text }, spans: [{ index: 0, start: 0, end: 4, text: 'cold' }, { index: 1, start: 99996, end: 100000, text: 'cold' }] };
    const result = await createDraftRulePatches(draft, { rules: [literal('cold', 'warm warm')] }, { workerFactory: harness.factory });
    assert.equal(result.error?.code, 'OUTPUT_LIMIT');
    assert.equal(result.data, undefined);
    assert.equal(draft.text.length, 100000);
    await harness.cleaned();
});
test('extract mode ignores replacement expansion and bounds only extracted text', async () => {
    const harness = workerHarness();
    const result = await applyTextRules('a a', { mode: 'extract', rules: [{ kind: 'regex', pattern: 'a', replacement: 'x'.repeat(100000) }] }, { workerFactory: harness.factory });
    assert.equal(result.ok, true);
    assert.equal(result.data.text, 'a\na');
    await harness.cleaned();
});
test('intermediate rule output overflow fails even if a later rule would shrink it', async () => {
    const harness = workerHarness();
    const result = await applyTextRules('a' + 'x'.repeat(99999), { rules: [literal('a', 'aa'), literal('aa', 'a')] }, { workerFactory: harness.factory });
    assert.equal(result.error?.code, 'OUTPUT_LIMIT');
    await harness.cleaned();
});
test('explicit null settings fields do not silently become omitted defaults', async () => {
    const harness = workerHarness();
    for (const settings of [{ mode: null }, { rules: null }, { separator: null }, { rules: [literal('x', null)] }, { rules: [{ kind: 'regex', pattern: 'x', flags: null }] }]) {
        const result = await applyTextRules('x', settings, { workerFactory: harness.factory });
        assert.equal(result.error?.code, 'INVALID_RULES');
    }
    assert.equal(harness.workers.length, 0);
});
test('scoped unannotated and forged original Draft permissions never widen authority', async () => {
    const harness = workerHarness();
    const base = { kind: 'draft', text: 'cold "cold"', source: { originalText: 'cold "cold"' } };
    for (const draft of [
        { ...base, scope: 'dialogue' }, { ...base, scope: 'narration' },
        { ...base, scope: 'dialogue', spans: [{ index: 0, start: 0, end: 4, text: 'cold' }] },
        { ...base, scope: 'whole', spans: [{ index: 1, start: 0, end: 4, text: 'cold' }] },
        { ...base, spans: [{ index: 0, start: 0, end: 4, text: 'wrong' }] },
    ]) {
        const result = await createDraftRulePatches(draft, { rules: [literal('cold', 'warm')] }, { workerFactory: harness.factory });
        assert.equal(result.error?.code, 'INVALID_SPANS');
        assert.equal(result.data, undefined);
    }
    const stale = await createDraftRulePatches({ ...base, text: 'changed' }, {}, { workerFactory: harness.factory });
    assert.equal(stale.error?.code, 'STALE_SOURCE');
    assert.equal(harness.workers.length, 0);
});
test('Text may delete freely while Draft deletion fails the existing nonblank patch gate', async () => {
    const harness = workerHarness();
    const settings = { rules: [literal('cold', '')] };
    const text = await applyTextRules('cold', settings, { workerFactory: harness.factory });
    assert.equal(text.ok, true);
    assert.equal(text.data.text, '');
    const draft = await createDraftRulePatches({ kind: 'draft', text: 'cold', source: { originalText: 'cold' } }, settings, { workerFactory: harness.factory });
    assert.equal(draft.error?.code, 'INVALID_PATCHES');
    assert.equal(draft.data, undefined);
    await harness.cleaned();
});
test('Draft protected wording is preserved by the existing gate across span boundaries', async () => {
    const harness = workerHarness();
    const text = 'keep cold now';
    const draft = { kind: 'draft', text, source: { originalText: text }, spans: [{ index: 0, start: 5, end: 9, text: 'cold' }], protectedLiterals: ['keep cold'] };
    const rejected = await createDraftRulePatches(draft, { rules: [literal('cold', 'warm')] }, { workerFactory: harness.factory });
    assert.equal(rejected.error?.code, 'PROTECTED_LITERAL_REMOVED');
    assert.equal(rejected.data, undefined);
    assert.equal(draft.text, text);
    const accepted = await createDraftRulePatches(draft, { rules: [literal('cold', 'cold and warm')] }, { workerFactory: harness.factory });
    assert.equal(accepted.ok, true);
    assert.deepEqual(accepted.data.artifact.protectedLiterals, ['keep cold']);
    const { validatePatches } = await import('../src/workflow/repair.js');
    assert.equal(validatePatches(accepted.data.artifact).artifact.text, 'keep cold and warm now');
    await harness.cleaned();
});

test('installed browser Worker entry inherits the caller cache query and runs in a real thread', async () => {
    const harness = workerHarness();
    const previous = globalThis.Worker;
    let entryURL;
    globalThis.Worker = class {
        constructor(url, options) {
            entryURL = url;
            assert.deepEqual(options, { type: 'module' });
            return harness.factory(url);
        }
    };
    try {
        const nativeApi = await import('../src/workflow/operations/text-rules.js?v=installed-cache-test');
        const result = await nativeApi.applyTextRules('cold', { rules: [literal('cold', 'warm')] });
        assert.equal(result.ok, true);
        assert.equal(result.data.text, 'warm');
        await harness.cleaned();
        assert.equal(entryURL.pathname.endsWith('/text-rules-worker.js'), true);
        assert.equal(entryURL.search, '?v=installed-cache-test');
    } finally {
        if (previous === undefined) delete globalThis.Worker; else globalThis.Worker = previous;
    }
});
test('malformed protected-literal metadata cannot weaken Draft permissions', async () => {
    const harness = workerHarness();
    for (const protectedLiterals of [null, 'cold', [''], [3], ['x'.repeat(2049)], Array(129).fill('cold')]) {
        const result = await createDraftRulePatches({ kind: 'draft', text: 'cold', source: { originalText: 'cold' }, protectedLiterals }, {}, { workerFactory: harness.factory });
        assert.equal(result.error?.code, 'INVALID_DRAFT');
    }
    assert.equal(harness.workers.length, 0);
});
test('invalid regex syntax fails even when an empty Draft has no segments', async () => {
    const harness = workerHarness();
    const result = await createDraftRulePatches({ kind: 'draft', text: '', source: { originalText: '' } }, { rules: [{ kind: 'regex', pattern: '(' }] }, { workerFactory: harness.factory });
    assert.equal(result.error?.code, 'INVALID_RULES');
    await harness.cleaned();
});
test('actual Worker module failure returns WORKER_UNAVAILABLE and terminates the thread', async () => {
    const harness = workerHarness();
    const result = await applyTextRules('cold', {}, { workerFactory: () => harness.factory(new URL('./fixtures/no-text-rule-worker.mjs', import.meta.url)) });
    assert.equal(result.error?.code, 'WORKER_UNAVAILABLE');
    await harness.cleaned();
});
test('regex flags apply case-insensitive multiline dot-all Unicode semantics', async () => {
    const harness = workerHarness();
    const result = await applyTextRules('A\n7\nb', { rules: [{ kind: 'regex', pattern: '^a.(?<digit>\\d)$', replacement: 'n=$<digit>', flags: 'imsu' }] }, { workerFactory: harness.factory });
    assert.equal(result.ok, true);
    assert.equal(result.data.text, 'n=7\nb');
    assert.deepEqual(result.data.report, [{ ruleIndex: 0, segmentIndex: 0, start: 0, end: 3, text: 'A\n7' }]);
    await harness.cleaned();
});
test('Draft metadata snapshot budgets reject excess characters depth and visited values', async () => {
    const harness = workerHarness();
    const base = () => ({ kind: 'draft', text: 'cold', source: { originalText: 'cold' } });
    const deep = base(); let cursor = deep; for (let index = 0; index < 41; index++) { cursor.metadata = {}; cursor = cursor.metadata; }
    for (const draft of [{ ...base(), metadata: 'x'.repeat(500000) }, deep, { ...base(), metadata: Array(20000).fill(0) }]) {
        const result = await createDraftRulePatches(draft, {}, { workerFactory: harness.factory });
        assert.equal(result.error?.code, 'INVALID_DRAFT');
    }
    assert.equal(harness.workers.length, 0);
});
test('exact Text rule pattern and finding boundaries remain usable', async () => {
    const harness = workerHarness();
    const rules = [literal('x', 'y'), ...Array.from({ length: 63 }, () => literal('z'.repeat(2048), 'q'))];
    const result = await applyTextRules('x'.repeat(4096) + ' '.repeat(95904), { rules }, { workerFactory: harness.factory, timeoutMs: 2000 });
    assert.equal(result.ok, true);
    assert.equal(result.data.text, 'y'.repeat(4096) + ' '.repeat(95904));
    assert.equal(result.data.report.length, 4096);
    assert.deepEqual(result.data.report.at(-1), { ruleIndex: 0, segmentIndex: 0, start: 4095, end: 4096, text: 'x' });
    await harness.cleaned();
});
