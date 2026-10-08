import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Worker } from 'node:worker_threads';
const api = await import('../src/workflow/operations/nodes.js').catch(() => ({}));

function workerHarness() {
    const resources = [];
    return {
        resources,
        createWorker() {
            const worker = new Worker(new URL('./fixtures/text-rules-node-worker.mjs', import.meta.url));
            const handlers = new Map(), resource = { worker, termination: null };
            resources.push(resource);
            return {
                addEventListener(type, fn) { const handler = type === 'message' ? data => { if (!data?.fixtureStarted) fn({ data }); } : error => fn({ error }); handlers.set(fn, handler); worker.on(type, handler); },
                removeEventListener(type, fn) { worker.off(type, handlers.get(fn)); handlers.delete(fn); },
                postMessage(data) { worker.postMessage(data); },
                terminate() { resource.termination = worker.terminate(); return resource.termination; },
            };
        },
        async cleaned() {
            assert.ok(resources.length);
            for (const resource of resources) { assert.ok(resource.termination); await resource.termination; assert.equal(resource.worker.threadId, -1); }
        },
    };
}

test('static registration describes zero-request primitives and explicit editable defaults', () => {
    assert.ok(api.PRIMITIVE_OPERATIONS);
    assert.deepEqual(Object.keys(api.PRIMITIVE_OPERATIONS), ['compose', 'text-rules', 'json-decode', 'select-fields']);
    for (const [id, descriptor] of Object.entries(api.PRIMITIVE_OPERATIONS)) {
        assert.equal(descriptor.id, id);
        assert.equal(descriptor.requestBound, 0);
        assert.equal(descriptor.modelRole, null);
        assert.equal(descriptor.terminal, false);
        assert.deepEqual(descriptor.controls, Object.keys(descriptor.defaults));
        assert.deepEqual(descriptor.controlDescriptors.map(control => control.key), descriptor.controls);
        assert.ok(descriptor.controlDescriptors.every(control => ['enum', 'text', 'json'].includes(control.type)));
    }
    assert.deepEqual(api.PRIMITIVE_OPERATIONS.compose.defaults, { mode: 'join', outputKind: 'text', template: '', sections: [], separator: '\n\n' });
    assert.deepEqual(api.PRIMITIVE_OPERATIONS['text-rules'].defaults, { inputKind: 'text', mode: 'replace', rules: [], separator: '\n' });
    assert.deepEqual(api.PRIMITIVE_OPERATIONS['json-decode'].defaults, { mode: 'parse', schema: '' });
    assert.deepEqual(api.PRIMITIVE_OPERATIONS['select-fields'].defaults, { fields: [] });
});

test('Draft source requires own originalText and rejects inherited provenance before Worker creation', async () => {
    let reads = 0, workers = 0;
    Object.defineProperty(Object.prototype, 'originalText', { configurable: true, get() { reads++; return 'cold'; } });
    try {
        const draft = { kind: 'draft', text: 'cold', source: {} };
        const node = { operation: 'text-rules', inputKind: 'draft', rules: [{ kind: 'literal', pattern: 'cold', replacement: 'warm' }] };
        assert.equal(api.describePrimitive(node).ok, true);
        const result = await api.executePrimitive(node, { in: draft }, { createWorker() { workers++; throw Error('must not create Worker'); } });
        assert.equal(result.error?.code, 'INVALID_DRAFT');
        assert.equal(Object.hasOwn(result, 'artifact'), false);
        assert.equal(Object.hasOwn(draft.source, 'originalText'), false);
        assert.equal(reads, 0);
        assert.equal(workers, 0);
    } finally { delete Object.prototype.originalText; }
});

test('raw Draft rules ignore inherited scope, finish and usage metadata', async () => {
    const reads = { scope: 0, finish: 0, usage: 0 }, harness = workerHarness();
    for (const key of Object.keys(reads)) Object.defineProperty(Object.prototype, key, { configurable: true, get() { reads[key]++; throw Error('inherited ' + key); } });
    try {
        const draft = { kind: 'draft', text: 'cold', source: { originalText: 'cold' } };
        const node = { operation: 'text-rules', inputKind: 'draft', rules: [{ kind: 'literal', pattern: 'cold', replacement: 'warm' }] };
        assert.equal(api.describePrimitive(node).ok, true);
        const result = await api.executePrimitive(node, { in: draft }, { createWorker: harness.createWorker, timeoutMs: 2000 });
        assert.equal(result.ok, true);
        assert.equal(result.artifact.kind, 'patches');
        assert.equal(result.artifact.draft.scope, 'whole');
        assert.deepEqual(result.artifact.patches, [{ index: 0, replacement: 'warm' }]);
        assert.equal(Object.hasOwn(draft, 'scope'), false);
        assert.equal(Object.hasOwn(result.artifact, 'finish'), false);
        assert.equal(Object.hasOwn(result.artifact, 'usage'), false);
        assert.deepEqual(reads, { scope: 0, finish: 0, usage: 0 });
        await harness.cleaned();
    } finally { for (const key of Object.keys(reads)) delete Object.prototype[key]; }
});

test('inherited toJSON hooks cannot run during adapter Data cloning or Compose interpolation', async () => {
    let calls = 0;
    Object.defineProperty(Object.prototype, 'toJSON', { configurable: true, value() { calls++; throw Error('inherited toJSON'); } });
    try {
        const value = { token: 'ordinary', nested: { value: 7 } };
        const compose = { operation: 'compose', mode: 'template', template: '{{data:}}' };
        assert.equal(api.describePrimitive(compose, { phase: 'pre' }).ok, true);
        const composed = await api.executePrimitive(compose, { data: { kind: 'data', value } }, { phase: 'pre' });
        assert.deepEqual(composed, { ok: true, artifact: { kind: 'text', text: '{"token":"ordinary","nested":{"value":7}}' }, reports: [] });
        const decode = { operation: 'json-decode', schema: '{"type":"object"}' };
        assert.equal(api.describePrimitive(decode, { phase: 'pre' }).ok, true);
        const parsed = await api.executePrimitive(decode, { in: { kind: 'text', text: '{"token":"ordinary","nested":{"value":7}}' } }, { phase: 'pre' });
        assert.deepEqual(parsed.artifact, { kind: 'data', value });
        const checked = await api.executePrimitive({ ...decode, mode: 'check' }, { in: { kind: 'data', value } }, { phase: 'post' });
        assert.deepEqual(checked.artifact, { kind: 'data', value });
        const select = { operation: 'select-fields', fields: [{ name: 'nested', path: ['nested'] }] };
        assert.equal(api.describePrimitive(select, { phase: 'post' }).ok, true);
        const selected = await api.executePrimitive(select, { in: { kind: 'data', value } }, { phase: 'post' });
        assert.deepEqual(selected.artifact, { kind: 'data', value: { nested: { value: 7 } } });
        assert.equal(calls, 0);
    } finally { delete Object.prototype.toJSON; }
});

test('JSON Decode ignores inherited schema type in parse and check modes', async () => {
    let reads = 0;
    Object.defineProperty(Object.prototype, 'type', { configurable: true, get() { reads++; throw Error('inherited schema type'); } });
    try {
        const node = { operation: 'json-decode', schema: '{}' };
        const described = api.describePrimitive(node, { phase: 'pre' });
        assert.equal(described.ok, true);
        assert.equal(described.data.descriptor.input, 'text');
        assert.equal(described.data.descriptor.defaults.mode, 'parse');
        const parsed = await api.executePrimitive(node, { in: { kind: 'text', text: '{"value":[7]}' } }, { phase: 'pre' });
        assert.deepEqual(parsed, { ok: true, artifact: { kind: 'data', value: { value: [7] } }, reports: [] });
        assert.equal(api.describePrimitive({ ...node, mode: 'check' }, { phase: 'post' }).ok, true);
        const checked = await api.executePrimitive({ ...node, mode: 'check' }, { in: parsed.artifact }, { phase: 'post' });
        assert.deepEqual(checked, parsed);
        assert.notEqual(checked.artifact.value, parsed.artifact.value);
        assert.equal(reads, 0);
    } finally { delete Object.prototype.type; }
});

test('Select Fields ignores inherited required and keeps the declared required default', async () => {
    let reads = 0;
    Object.defineProperty(Object.prototype, 'required', { configurable: true, get() { reads++; throw Error('inherited required'); } });
    try {
        const node = { operation: 'select-fields', fields: [{ name: 'mustExist', path: ['missing'] }] };
        assert.equal(api.describePrimitive(node, { phase: 'pre' }).ok, true);
        const result = await api.executePrimitive(node, { in: { kind: 'data', value: {} } }, { phase: 'pre' });
        assert.equal(result.error?.code, 'MISSING_FIELD');
        assert.equal(result.error.name, 'mustExist');
        assert.deepEqual(result.error.path, ['missing']);
        const omitted = await api.executePrimitive({ operation: 'select-fields', fields: [{ name: 'optional', path: ['missing'], required: false }] }, { in: { kind: 'data', value: {} } }, { phase: 'post' });
        assert.deepEqual(omitted, { ok: true, artifact: { kind: 'data', value: {} }, reports: [] });
        assert.equal(reads, 0);
    } finally { delete Object.prototype.required; }
});

test('Compose ignores inherited template and uses declared join defaults without getter reads', async () => {
    let reads = 0;
    Object.defineProperty(Object.prototype, 'template', { configurable: true, get() { reads++; throw Error('inherited template'); } });
    try {
        const node = { operation: 'compose', sections: [{ name: 'a', text: 'A' }, { name: 'b', text: 'B' }] };
        const described = api.describePrimitive(node, { phase: 'pre' });
        assert.equal(described.ok, true);
        assert.equal(described.data.descriptor.defaults.mode, 'join');
        assert.equal(described.data.descriptor.defaults.template, '');
        const result = await api.executePrimitive(node, {}, { phase: 'pre' });
        assert.deepEqual(result, { ok: true, artifact: { kind: 'text', text: 'A\n\nB' }, reports: [] });
        assert.equal(reads, 0);
    } finally { delete Object.prototype.template; }
});

test('external reflection failures return Results and unrelated core metadata stays unread', async () => {
    const revoked = Proxy.revocable({}, {}); revoked.revoke();
    let described;
    assert.doesNotThrow(() => { described = api.describePrimitive(revoked.proxy, { phase: 'pre' }); });
    assert.equal(described.ok, false);
    for (const [node, inputs, execution] of [
        [revoked.proxy, {}, { phase: 'pre' }],
        [{ operation: 'compose', phase: 'pre' }, revoked.proxy, {}],
        [{ operation: 'compose', phase: 'pre' }, {}, revoked.proxy],
        [{ operation: 'compose', phase: 'pre' }, { data: { kind: 'data', value: revoked.proxy } }, {}],
    ]) {
        let result;
        await assert.doesNotReject(async () => { result = await api.executePrimitive(node, inputs, execution); });
        assert.equal(result.ok, false);
        assert.equal(Object.hasOwn(result, 'artifact'), false);
    }
    let reads = 0;
    const node = { operation: 'compose', phase: 'pre', enabled: true, operationVersion: 1, inGroup: 'group', presentation: { aliases: {} } };
    Object.defineProperty(node, 'futureMetadata', { enumerable: true, get() { reads++; throw Error('metadata getter'); } });
    assert.equal(api.describePrimitive(node).ok, true);
    assert.equal((await api.executePrimitive(node, {})).ok, true);
    assert.equal(reads, 0);
});

test('helper failures preserve error details and never publish partial artifacts', async () => {
    const cases = [
        [{ operation: 'compose', mode: 'template', template: '{{data:/missing}}' }, {}, { phase: 'pre' }, 'MISSING_PATH'],
        [{ operation: 'json-decode' }, { in: { kind: 'text', text: '```json\n{}\n```' } }, { phase: 'pre' }, 'INVALID_JSON'],
        [{ operation: 'select-fields', fields: [{ name: 'required', path: ['missing'] }] }, { in: { kind: 'data', value: {} } }, { phase: 'pre' }, 'MISSING_FIELD'],
        [{ operation: 'text-rules' }, { in: { kind: 'text', text: 'x' } }, { phase: 'pre', createWorker() { throw Error('unavailable'); } }, 'WORKER_UNAVAILABLE'],
        [{ operation: 'text-rules', inputKind: 'draft' }, { in: { kind: 'draft', text: 'x', source: { originalText: 'old' } } }, {}, 'STALE_SOURCE'],
        [{ operation: 'text-rules', inputKind: 'draft' }, { in: { kind: 'draft', text: 'x', source: { originalText: 'x' }, scope: 'dialogue' } }, {}, 'INVALID_SPANS'],
    ];
    for (const [node, inputs, execution, code] of cases) {
        let result;
        await assert.doesNotReject(async () => { result = await api.executePrimitive(node, inputs, execution); });
        assert.equal(result.error?.code, code, JSON.stringify(result));
        assert.equal(Object.hasOwn(result, 'artifact'), false);
    }
    const missing = await api.executePrimitive(cases[2][0], cases[2][1], cases[2][2]);
    assert.equal(missing.error.name, 'required');
    assert.deepEqual(missing.error.path, ['missing']);
    const harness = workerHarness();
    const draft = { kind: 'draft', text: 'Keep cold', source: { originalText: 'Keep cold' }, protectedLiterals: ['Keep'] };
    const blocked = await api.executePrimitive({ operation: 'text-rules', inputKind: 'draft', rules: [{ kind: 'literal', pattern: 'Keep', replacement: 'Drop' }] }, { in: draft }, { createWorker: harness.createWorker, timeoutMs: 2000 });
    assert.equal(blocked.error?.code, 'PROTECTED_LITERAL_REMOVED');
    assert.equal(Object.hasOwn(blocked, 'artifact'), false);
    const zero = await api.executePrimitive({ operation: 'text-rules', rules: [{ kind: 'regex', pattern: '(?=x)', replacement: 'a' }] }, { in: { kind: 'text', text: 'x' } }, { phase: 'pre', createWorker: harness.createWorker, timeoutMs: 2000 });
    assert.equal(zero.error?.code, 'INVALID_RULES');
    assert.equal(Object.hasOwn(zero, 'artifact'), false);
    await harness.cleaned();
});

test('runtime option snapshots read only own fields even when Object.prototype has accessors', async () => {
    let reads = 0;
    Object.defineProperty(Object.prototype, 'createWorker', { configurable: true, get() { reads++; throw Error('prototype getter'); } });
    try {
        const result = await api.executePrimitive({ operation: 'compose', phase: 'pre' }, {});
        assert.deepEqual(result, { ok: true, artifact: { kind: 'text', text: '' }, reports: [] });
        assert.equal(reads, 0);
    } finally { delete Object.prototype.createWorker; }
});

test('execution options fail as values before work and already-aborted execution never creates a Worker', async () => {
    const compose = { operation: 'compose', phase: 'pre' };
    for (const execution of [null, [], { workerFactory() {} }, { timeoutMs: 99 }, { timeoutMs: null }, { createWorker: 123 }, { signal: {} }]) {
        let result;
        await assert.doesNotReject(async () => { result = await api.executePrimitive(compose, {}, execution); });
        assert.equal(result.error?.code, 'INVALID_EXECUTION');
        assert.equal(Object.hasOwn(result, 'artifact'), false);
    }
    let reads = 0;
    const execution = { phase: 'pre' };
    Object.defineProperty(execution, 'createWorker', { enumerable: true, get() { reads++; throw Error('getter'); } });
    assert.equal((await api.executePrimitive(compose, {}, execution)).error?.code, 'INVALID_EXECUTION');
    assert.equal(reads, 0);
    const controller = new AbortController(); controller.abort();
    const harness = workerHarness();
    const result = await api.executePrimitive({ operation: 'text-rules' }, { in: { kind: 'text', text: 'x' } }, { phase: 'pre', signal: controller.signal, createWorker: harness.createWorker });
    assert.equal(result.error?.code, 'ABORTED');
    assert.equal(harness.resources.length, 0);
});

test('Compose applies overrides before enforcing output limits and permits unused constants in templates', async () => {
    const sections = [{ name: 'a', text: 'a'.repeat(60000) }, { name: 'b', text: 'b'.repeat(60000) }];
    assert.equal(api.describePrimitive({ operation: 'compose', sections }, { phase: 'pre' }).ok, true);
    const result = await api.executePrimitive({ operation: 'compose', sections, separator: '' }, { 'section.b': { kind: 'text', text: '' } }, { phase: 'pre' });
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.equal(result.artifact.text.length, 60000);
    const template = await api.executePrimitive({ operation: 'compose', mode: 'template', template: '{{section:a}}', sections }, {}, { phase: 'pre' });
    assert.equal(template.artifact.text.length, 60000);
    const overflow = await api.executePrimitive({ operation: 'compose', sections }, {}, { phase: 'pre' });
    assert.equal(overflow.error?.code, 'TEXT_LIMIT');
    assert.equal(Object.hasOwn(overflow, 'artifact'), false);
});

test('Draft rules preserve authorized original spans and return patches accepted by the review validator', async () => {
    const { validatePatches } = await import('../src/workflow/repair.js');
    const text = 'Keep cold | cold End';
    const draft = { kind: 'draft', text, source: { originalText: text, token: 'host-source' }, scope: 'whole', spans: [
        { index: 0, start: 5, end: 9, text: 'cold' }, { index: 1, start: 12, end: 16, text: 'cold' },
    ], protectedLiterals: ['Keep'], findings: [{ code: 'UPSTREAM' }] };
    const original = structuredClone(draft), harness = workerHarness();
    const result = await api.executePrimitive({ operation: 'text-rules', inputKind: 'draft', rules: [{ kind: 'literal', pattern: 'cold', replacement: 'hot' }] }, { in: draft }, { createWorker: harness.createWorker, timeoutMs: 2000 });
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(result.artifact.kind, 'patches');
    assert.deepEqual(result.artifact.patches, [{ index: 0, replacement: 'hot' }, { index: 1, replacement: 'hot' }]);
    // Own data/permissions are preserved; engine snapshots use null-prototype records.
    assert.deepEqual(structuredClone(result.artifact.draft), original);
    assert.deepEqual(draft, original);
    assert.equal(Object.isFrozen(result.artifact.draft.source), true);
    const candidate = validatePatches(result.artifact);
    assert.equal(candidate.ok, true);
    assert.equal(candidate.artifact.text, 'Keep hot | hot End');
    assert.equal(candidate.artifact.reviewRequired, true);
    assert.equal(result.reports.length, 2);
    await harness.cleaned();
});

test('Text Rules maps createWorker and forwards real replacement/extraction findings', async () => {
    const harness = workerHarness();
    const input = { in: { kind: 'text', text: 'cold 12 cold 34' } };
    const node = { operation: 'text-rules', rules: [{ kind: 'literal', pattern: 'cold', replacement: 'warm' }] };
    const before = structuredClone({ input, node });
    const replaced = await api.executePrimitive(node, input, { phase: 'pre', createWorker: harness.createWorker, timeoutMs: 2000 });
    assert.equal(replaced.ok, true, JSON.stringify(replaced));
    assert.deepEqual(replaced.artifact, { kind: 'text', text: 'warm 12 warm 34' });
    assert.deepEqual(replaced.reports, [
        { ruleIndex: 0, segmentIndex: 0, start: 0, end: 4, text: 'cold' },
        { ruleIndex: 0, segmentIndex: 0, start: 8, end: 12, text: 'cold' },
    ]);
    const extracted = await api.executePrimitive({ operation: 'text-rules', mode: 'extract', rules: [{ kind: 'regex', pattern: '\\d+' }], separator: '|' }, input, { phase: 'post', createWorker: harness.createWorker, timeoutMs: 2000 });
    assert.deepEqual(extracted.artifact, { kind: 'text', text: '12|34' });
    assert.deepEqual({ input, node }, before);
    await harness.cleaned();
});

test('schema control parses strictly within byte limits and enforces the helper subset', async () => {
    const input = { in: { kind: 'text', text: '{"token":7}' } };
    const run = schema => api.executePrimitive({ operation: 'json-decode', schema }, input, { phase: 'pre' });
    assert.equal((await run('{"type":"object","properties":{"token":{"type":"integer"}},"required":["token"],"additionalProperties":false}')).ok, true);
    const mismatch = await run('{"properties":{"token":{"type":"string"}}}');
    assert.equal(mismatch.error?.code, 'SCHEMA_MISMATCH');
    assert.equal(mismatch.error.findings[0].path, '/token');
    assert.equal(Object.hasOwn(mismatch, 'artifact'), false);
    for (const schema of ['```json\n{}\n```', ' ', '{"type":', '{} trailing']) assert.equal((await run(schema)).error?.code, 'INVALID_SCHEMA');
    for (const schema of ['{"$ref":"https://example.test"}', '{"pattern":"x"}', 'null', '[]']) assert.equal((await run(schema)).error?.code, 'UNSUPPORTED_SCHEMA');
    assert.equal(api.describePrimitive({ operation: 'json-decode', schema: '{"$ref":"x"}' }, { phase: 'pre' }).error?.code, 'UNSUPPORTED_SCHEMA');
    let calls = 0;
    const parse = JSON.parse;
    JSON.parse = (...args) => { calls++; return parse(...args); };
    try {
        assert.equal((await run(' '.repeat(262145))).error?.code, 'SCHEMA_LIMIT');
        assert.equal((await run('"' + '😀'.repeat(65536) + '"')).error?.code, 'SCHEMA_LIMIT');
        assert.equal(calls, 0, 'oversized schema must fail before parsing');
    } finally { JSON.parse = parse; }
});

test('JSON Decode and Select Fields compose native Data artifacts without mutable aliases', async () => {
    const parsed = await api.executePrimitive({ operation: 'json-decode' }, { in: { kind: 'text', text: '{"token":"yes","__proto__":{"constructor":9},"items":[1,2]}' } }, { phase: 'pre' });
    assert.equal(parsed.ok, true, JSON.stringify(parsed));
    assert.equal(parsed.artifact.kind, 'data');
    assert.deepEqual(parsed.reports, []);
    const selected = await api.executePrimitive({ operation: 'select-fields', fields: [
        { name: '__proto__', path: ['__proto__'] }, { name: 'token', path: ['token'] },
        { name: 'copy', path: ['items'] }, { name: 'fallback', path: ['missing'], required: false, default: { token: 3 } },
    ] }, { in: parsed.artifact }, { phase: 'pre' });
    assert.equal(selected.ok, true, JSON.stringify(selected));
    assert.equal(selected.artifact.value.__proto__.constructor, 9);
    assert.equal(selected.artifact.value.token, 'yes');
    assert.deepEqual(selected.artifact.value.fallback, { token: 3 });
    selected.artifact.value.copy[0] = 99;
    assert.equal(parsed.artifact.value.items[0], 1);
    const checked = await api.executePrimitive({ operation: 'json-decode', mode: 'check' }, { in: parsed.artifact }, { phase: 'post' });
    assert.deepEqual(checked, { ok: true, artifact: { kind: 'data', value: parsed.artifact.value }, reports: [] });
    checked.artifact.value.items[0] = 88;
    assert.equal(parsed.artifact.value.items[0], 1);
});

test('named input boundaries reject stale pins, missing required inputs and wrong artifact kinds', async () => {
    const compose = { operation: 'compose', sections: [{ name: 'x', text: 'constant' }] };
    for (const inputs of [
        { 'section.old': { kind: 'text', text: 'ignored' } }, { in: { kind: 'text', text: 'ignored' } },
        { 'section.x': { kind: 'data', value: 'wrong' } }, { 'section.x': { kind: 'text', text: 123 } },
        { data: { kind: 'text', text: '{}' } }, { data: { kind: 'data' } }, null, [],
        Object.create({ data: { kind: 'data', value: {} } }),
    ]) {
        const result = await api.executePrimitive(compose, inputs, { phase: 'pre' });
        assert.equal(result.ok, false, JSON.stringify(inputs));
        assert.equal(Object.hasOwn(result, 'artifact'), false);
    }
    for (const operation of ['text-rules', 'json-decode', 'select-fields']) {
        const result = await api.executePrimitive({ operation }, {}, { phase: 'pre' });
        assert.equal(result.error?.code, 'MISSING_INPUT');
    }
    let reads = 0;
    const inputs = {};
    Object.defineProperty(inputs, 'data', { enumerable: true, get() { reads++; throw Error('input getter'); } });
    assert.equal((await api.executePrimitive(compose, inputs, { phase: 'pre' })).ok, false);
    const artifact = { kind: 'text' };
    Object.defineProperty(artifact, 'text', { enumerable: true, get() { reads++; throw Error('text getter'); } });
    assert.equal((await api.executePrimitive(compose, { 'section.x': artifact }, { phase: 'pre' })).ok, false);
    assert.equal(reads, 0);
});

test('Compose constants and named section overrides publish native Text and Guidance artifacts', async () => {
    assert.equal(typeof api.executePrimitive, 'function');
    const sections = [{ name: 'one', text: 'constant' }, { name: 'two', text: 'tail' }];
    const constant = await api.executePrimitive({ operation: 'compose', sections }, {}, { phase: 'post' });
    assert.deepEqual(constant, { ok: true, artifact: { kind: 'text', text: 'constant\n\ntail' }, reports: [] });
    const node = { operation: 'compose', outputKind: 'guidance', mode: 'template', template: '{{section:two}}/{{section:one}}/{{data:/token}}', sections };
    const inputs = { 'section.one': { kind: 'text', text: 'wired' }, data: { kind: 'data', value: { token: 'ordinary-data' } } };
    const before = structuredClone({ node, inputs });
    assert.deepEqual(await api.executePrimitive(node, inputs), { ok: true, artifact: { kind: 'guidance', text: 'tail/wired/ordinary-data' }, reports: [] });
    assert.deepEqual({ node, inputs }, before);
    const reversed = { operation: 'compose', sections: [...sections].reverse(), separator: '|' };
    assert.equal((await api.executePrimitive(reversed, { 'section.one': inputs['section.one'] }, { phase: 'pre' })).artifact.text, 'tail|wired');
    assert.equal((await api.executePrimitive({ operation: 'compose', mode: 'template', template: '' }, {}, { phase: 'pre' })).artifact.text, '');
});

test('describing nodes rejects unsupported controls and unsafe descriptors without invoking getters', () => {
    for (const node of [
        { operation: 'other' }, { operation: '__proto__' },
        { operation: 'compose', mode: 'other' }, { operation: 'compose', outputKind: 'draft' },
        { operation: 'compose', template: 123 }, { operation: 'compose', sections: [{ name: 'same', text: 'x' }, { name: 'same', text: 'y' }] },
        { operation: 'text-rules', inputKind: 'data' }, { operation: 'text-rules', mode: 'repair' },
        { operation: 'text-rules', rules: [{ kind: 'regex', pattern: 'x', flags: 'g' }] },
        { operation: 'json-decode', mode: 'repair' }, { operation: 'json-decode', schema: {} },
        { operation: 'select-fields', fields: [{ name: 'x', path: 'x' }] },
    ]) assert.equal(api.describePrimitive(node, { phase: 'pre' }).ok, false, JSON.stringify(node));
    let reads = 0;
    const node = { operation: 'compose' };
    Object.defineProperty(node, 'sections', { enumerable: true, get() { reads++; throw Error('getter'); } });
    assert.equal(api.describePrimitive(node, { phase: 'pre' }).ok, false);
    const section = { name: 'x' };
    Object.defineProperty(section, 'text', { enumerable: true, get() { reads++; throw Error('getter'); } });
    assert.equal(api.describePrimitive({ operation: 'compose', sections: [section] }, { phase: 'pre' }).ok, false);
    const inherited = Object.create({ operation: 'compose' });
    assert.equal(api.describePrimitive(inherited, { phase: 'pre' }).ok, false);
    assert.equal(reads, 0);
});

test('mode-dependent ports enforce Guidance pre and Draft patches post phases', () => {
    const examples = [
        [{ operation: 'compose', outputKind: 'guidance' }, 'pre', null, 'guidance'],
        [{ operation: 'text-rules', inputKind: 'draft' }, 'post', 'draft', 'patches'],
        [{ operation: 'text-rules' }, 'pre', 'text', 'text'],
        [{ operation: 'json-decode' }, 'pre', 'text', 'data'],
        [{ operation: 'json-decode', mode: 'check' }, 'post', 'data', 'data'],
        [{ operation: 'select-fields' }, 'post', 'data', 'data'],
    ];
    for (const [node, phase, input, output] of examples) {
        const result = api.describePrimitive(node, { phase });
        assert.equal(result.ok, true, JSON.stringify(result));
        assert.equal(result.data.descriptor.input, input);
        assert.equal(result.data.descriptor.output, output);
        assert.equal(result.data.ports.at(-1).kind, output);
        if (input) assert.deepEqual(result.data.ports[0], { id: 'in', label: 'Input', direction: 'input', kind: input, required: true, cardinality: 'one' });
    }
    assert.equal(api.describePrimitive({ operation: 'compose', outputKind: 'guidance' }).data.descriptor.phase, 'pre');
    assert.equal(api.describePrimitive({ operation: 'text-rules', inputKind: 'draft' }).data.descriptor.phase, 'post');
    assert.equal(api.describePrimitive({ operation: 'compose', outputKind: 'guidance' }, { phase: 'post' }).error?.code, 'INVALID_PHASE');
    assert.equal(api.describePrimitive({ operation: 'text-rules', inputKind: 'draft' }, { phase: 'pre' }).error?.code, 'INVALID_PHASE');
    assert.equal(api.describePrimitive({ operation: 'text-rules', inputKind: 'draft', mode: 'extract' }).error?.code, 'INVALID_SETTINGS');
    assert.equal(api.describePrimitive({ operation: 'text-rules', phase: 'pre' }, { phase: 'post' }).error?.code, 'INVALID_PHASE');
});

test('effective descriptors require a phase and provide stable named Compose pins after reorder', () => {
    assert.equal(typeof api.describePrimitive, 'function');
    const node = { operation: 'compose', sections: [{ name: 'first', text: 'A' }, { name: 'last', text: 'B' }] };
    assert.equal(api.describePrimitive(node).error?.code, 'INVALID_PHASE');
    const result = api.describePrimitive(node, { phase: 'pre' });
    assert.equal(result.ok, true);
    assert.equal(result.data.descriptor.phase, 'pre');
    assert.deepEqual(result.data.ports, [
        { id: 'data', label: 'Data', direction: 'input', kind: 'data', required: false, cardinality: 'one' },
        { id: 'section.first', label: 'first', direction: 'input', kind: 'text', required: false, cardinality: 'one' },
        { id: 'section.last', label: 'last', direction: 'input', kind: 'text', required: false, cardinality: 'one' },
        { id: 'out', label: 'Output', direction: 'output', kind: 'text', required: false, cardinality: 'one' },
    ]);
    const reordered = api.describePrimitive({ ...node, sections: [...node.sections].reverse(), phase: 'post', enabled: true, operationVersion: 1 });
    assert.equal(reordered.data.descriptor.phase, 'post');
    assert.deepEqual(reordered.data.ports.filter(port => port.id.startsWith('section.')).map(port => port.id), ['section.last', 'section.first']);
});
