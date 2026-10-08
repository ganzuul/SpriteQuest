import assert from 'node:assert/strict';
import { test } from 'node:test';
import { describeContextJoin, executeContextJoin } from '../src/workflow/operations/context-join.js';
import { inspectContextData, parseRuntimeContext } from '../src/workflow/operations/context-data.js';

const joinNode = (inputs = [{ id: 'left', label: 'Left' }, { id: 'right', label: 'Right' }]) => ({
    id: 'join', type: 'workflow', operation: 'context-join', operationVersion: 1, inputs,
});

// A Proxy can lie after descriptor inspection; parse into owned plain data before reading schema fields.
test('rejects Proxy payloads and settings before consuming their property reads', () => {
    let reads = 0;
    const intercepted = new Proxy(message('proxy'), { get(target, key, receiver) { reads++; return Reflect.get(target, key, receiver); } });
    const result = executeContextJoin(joinNode(), { left: context([]), right: context([intercepted]) });
    assert.equal(result.error?.code, 'INVALID_CONTEXT');
    assert.equal(reads, 0);
    const config = new Proxy(joinNode(), { get(target, key, receiver) { reads++; return Reflect.get(target, key, receiver); } });
    assert.equal(describeContextJoin(config).error?.code, 'INVALID_SETTINGS');
    assert.equal(executeContextJoin(config, {}).error?.code, 'INVALID_SETTINGS');
    assert.equal(reads, 0);
});

// Standard-object prototype pollution must neither call inherited getters nor manufacture source/trust claims.
test('reads only own settings/source/derived fields even when Object.prototype is polluted', () => {
    const node = joinNode(), inputs = { left: context([message('left')]), right: context([message('right')]) };
    const keys = ['source', 'derived', 'type', 'operation', 'operationVersion'];
    const previous = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(Object.prototype, key)]));
    let reads = 0;
    try {
        Object.defineProperties(Object.prototype, {
            source: { configurable: true, get() { reads++; return { chatId: 'inherited' }; } },
            derived: { configurable: true, value: true },
            type: { configurable: true, value: 'workflow' },
            operation: { configurable: true, value: 'context-join' },
            operationVersion: { configurable: true, value: 1 },
        });
        const result = executeContextJoin(node, inputs);
        assert.equal(result.ok, true);
        assert.equal(reads, 0);
        assert.equal(Object.hasOwn(result.artifact, 'derived'), false);
        assert.deepEqual(result.artifact.source.inputs, [{ portId: 'left', source: null }, { portId: 'right', source: null }]);
        assert.equal(describeContextJoin({ inputs: node.inputs }).error?.code, 'INVALID_SETTINGS');
    } finally {
        for (const key of keys) {
            const descriptor = previous.get(key);
            if (descriptor) Object.defineProperty(Object.prototype, key, descriptor);
            else delete Object.prototype[key];
        }
    }
});

// Exotic/hidden/cyclic data and clone failures must become Results, never invoke Context getters or throw.
test('rejects adversarial plain-data shapes and maps reflection/clone failures to Results', () => {
    const invoke = right => executeContextJoin(joinNode(), { left: context([]), right });
    const proxyMessage = context([new Proxy(message('proxy'), {})]);
    assert.equal(invoke(proxyMessage).error?.code, 'INVALID_CONTEXT');
    assert.equal(invoke(context([], { source: new Proxy({ token: 'opaque' }, {}) })).error?.code, 'INVALID_CONTEXT');
    assert.equal(invoke(new Proxy(context([]), { ownKeys() { throw Error('reflection'); } })).error?.code, 'INVALID_CONTEXT');
    const hole = context([message('a'), message('b')]); delete hole.messages[0];
    const extraArrayKey = context([]); extraArrayKey.messages.extra = true;
    const hidden = context([]); Object.defineProperty(hidden, 'hidden', { value: 'hidden' });
    const symbol = context([]); symbol[Symbol('metadata')] = 'symbol';
    const cyclic = context([]); cyclic.source = cyclic;
    const inherited = Object.create(context([message('inherited')]));
    const exotic = context([], { source: new Date() });
    const nonfinite = context([], { source: { number: Infinity } });
    let reads = 0;
    const unusedGetter = context([]); Object.defineProperty(unusedGetter, 'reports', { enumerable: true, get() { reads++; return []; } });
    for (const input of [hole, extraArrayKey, hidden, symbol, cyclic, inherited, exotic, nonfinite, unusedGetter,
        context([], { source: undefined }), context([], { source: { method() {} } })]) {
        const result = invoke(input);
        assert.equal(result.error?.code, 'INVALID_CONTEXT');
        assert.equal(Object.hasOwn(result, 'artifact'), false);
    }
    assert.equal(reads, 0);
    const own = Object.create(null); Object.assign(own, context([message('own')], { source: { token: 'opaque' } }));
    assert.equal(invoke(own).ok, true);
    assert.equal(describeContextJoin(new Proxy(joinNode(), { get() { throw Error('read'); } })).error?.code, 'INVALID_SETTINGS');
});

// JSON.stringify turns -0 into 0, but preserved runtime data must not dedupe those distinct values.
test('preserves signed zero and treats different finite-number payloads or source scopes as conflicts', () => {
    const first = context([message('same', '', { metadata: { number: -0 } })]);
    const different = context([message('same', '', { metadata: { number: 0 } })]);
    assert.equal(executeContextJoin(joinNode(), { left: first, right: different }).error?.code, 'CONTEXT_ID_CONFLICT');
    const same = executeContextJoin(joinNode(), { left: first, right: first });
    assert.equal(same.ok, true);
    assert.equal(Object.is(same.artifact.messages[0].metadata.number, -0), true);
    assert.equal(executeContextJoin(joinNode(), {
        left: context([message('same')], { source: { number: -0 } }), right: context([message('same')], { source: { number: 0 } }),
    }).error?.code, 'CONTEXT_ID_CONFLICT');
});

// A dynamic input may not alias the fixed output endpoint, even when directions differ.
test('rejects the reserved output ID without broadening other stable input ID policy', () => {
    const bad = joinNode([{ id: 'out', label: 'Input' }, { id: 'other', label: 'Other' }]);
    assert.equal(describeContextJoin(bad).error?.code, 'INVALID_SETTINGS');
    assert.equal(executeContextJoin(bad, {}).error?.code, 'INVALID_SETTINGS');
    const node = joinNode([{ id: '__proto__', label: 'Prototype name' }, { id: 'constructor', label: 'Constructor name' }]);
    const inputs = Object.create(null);
    inputs.__proto__ = context([message('a')]);
    inputs.constructor = context([message('b')]);
    assert.equal(executeContextJoin(node, inputs).ok, true);
});

// Diagnostic ID lists must stay bounded without losing exact merge/reintroduction counts.
test('bounds duplicate and warning ID samples while preserving all per-pin counts', () => {
    const raw = Array.from({ length: 100 }, (_, i) => message(`m${i}`, ''));
    const duplicate = executeContextJoin(joinNode(), { left: context(raw), right: context(raw) });
    assert.equal(duplicate.ok, true);
    assert.equal(duplicate.reports[0].duplicateIds.length, 64);
    assert.equal(duplicate.reports[0].duplicateIdsOmitted, 36);
    assert.equal(duplicate.reports[0].originalDuplicateIds.length, 64);
    assert.equal(duplicate.reports[0].originalDuplicateIdsOmitted, 36);
    assert.equal(duplicate.reports[0].inputs[1].deduplicatedCount, 100);
    assert.equal(duplicate.reports[0].outputCount, 100);
    const warning = executeContextJoin(joinNode(), { left: context([], { original: raw }), right: context(raw) });
    assert.equal(warning.reports[1].inputs[0].count, 100);
    assert.equal(warning.reports[1].inputs[0].messageIds.length, 64);
    assert.equal(warning.reports[1].inputs[0].messageIdsOmitted, 36);
    const hugeId = 'x'.repeat(9000);
    const large = executeContextJoin(joinNode(), { left: context([message(hugeId, '')]), right: context([message(hugeId, '')]) });
    assert.deepEqual(large.reports[0].duplicateIds, []);
    assert.equal(large.reports[0].duplicateIdsOmitted, 1);
    assert.equal(large.artifact.messages[0].id, hugeId);
});

// Rejoining raw history must explain when an earlier compaction's removed material becomes current again.
test('warns with per-pin IDs and counts when another branch reintroduces omitted originals', () => {
    const raw = [message('old', 'history'), message('recent', 'recent')];
    const compacted = context([message('summary', 'summary', { source: 'compactor' }), raw[1]], {
        original: raw, source: { chatId: 'same' }, reports: [{ code: 'COMPACTED_CONTEXT' }],
    });
    const result = executeContextJoin(joinNode(), { left: compacted, right: context(raw, { source: { chatId: 'same' } }) });
    assert.equal(result.ok, true);
    assert.deepEqual(result.artifact.messages.map(item => item.id), ['summary', 'recent', 'old']);
    assert.deepEqual(result.artifact.original, raw);
    assert.deepEqual(result.reports[1], { code: 'COMPACTED_CONTEXT_REINTRODUCED', inputs: [
        { compactedPortId: 'left', reintroducedPortId: 'right', count: 1, messageIds: ['old'] },
    ] });
    assert.equal(result.reports[0].inputs[1].retainedCount, 1);
    assert.equal(result.reports[0].inputs[1].deduplicatedCount, 1);
    assert.equal(result.reports[0].inputs[1].originalDeduplicatedCount, 2);
    const differentSource = executeContextJoin(joinNode(), {
        left: context([], { original: [message('old')], source: { chatId: 'one' } }),
        right: context([message('other')], { source: { chatId: 'two' } }),
    });
    assert.equal(differentSource.reports.length, 1);
});

// Returning mutable shared message/source trees would allow downstream edits to corrupt a frozen run.
test('returns deeply frozen independent results while leaving mutable and frozen inputs unchanged', () => {
    const left = context([message('left', 'left', { metadata: { values: [1, 2] } })], { source: { token: 'opaque' } });
    const right = context([message('right')]);
    const node = joinNode(), before = structuredClone({ node, left, right });
    const result = executeContextJoin(node, { left, right });
    assert.equal(result.ok, true);
    assert.equal(Object.isFrozen(result), true);
    assert.equal(Object.isFrozen(result.artifact.messages[0].metadata.values), true);
    assert.equal(Object.isFrozen(result.artifact.source.inputs[0].source), true);
    assert.equal(Object.isFrozen(result.reports[0].inputs[0]), true);
    assert.notEqual(result.artifact.messages[0], left.messages[0]);
    assert.notEqual(result.artifact.original[0], left.messages[0]);
    assert.notEqual(result.artifact.messages[0], result.artifact.original[0]);
    assert.throws(() => { result.artifact.messages[0].text = 'edited'; }, TypeError);
    left.messages[0].metadata.values.push(3);
    assert.deepEqual(result.artifact.messages[0].metadata.values, [1, 2]);
    left.messages[0].metadata.values.pop();
    assert.deepEqual({ node, left, right }, before);
    assert.equal(Object.isFrozen(left), false);
    const freeze = item => { if (item && typeof item === 'object') { Object.values(item).forEach(freeze); Object.freeze(item); } return item; };
    assert.equal(executeContextJoin(freeze(node), freeze({ left, right })).ok, true);
    assert.equal(Object.isFrozen(describeContextJoin(node).data.ports[0]), true);
    assert.equal(Object.isFrozen(executeContextJoin(node, {}).error), true);
});

// Checking only each input would allow output/provenance to cross structural and text bounds.
test('enforces current and original output message/text limits and checks constructed source metadata', () => {
    const invoke = (left, right = context([])) => executeContextJoin(joinNode(), { left, right });
    const many = Array.from({ length: 1000 }, (_, i) => message(`m${i}`, ''));
    assert.equal(invoke(context(many)).ok, true);
    assert.equal(invoke(context(many), context([message('extra', '')])).error?.code, 'CONTEXT_JOIN_LIMIT');
    assert.equal(invoke(context([], { original: many }), context([], { original: [message('extra', '')] })).error?.code, 'CONTEXT_JOIN_LIMIT');
    assert.equal(invoke(context([message('exact', '😀'.repeat(50000))])).ok, true);
    assert.equal(invoke(context([message('exact', 'x'.repeat(100000))]), context([message('extra', 'x')])).error?.code, 'CONTEXT_JOIN_LIMIT');
    assert.equal(invoke(context([], { original: [message('exact', 'x'.repeat(100000))] }), context([], { original: [message('extra', 'x')] })).error?.code, 'CONTEXT_JOIN_LIMIT');
    let deep = 'leaf';
    for (let i = 0; i < 38; i++) deep = { nested: deep };
    const deepResult = invoke(context([], { source: deep }));
    assert.equal(deepResult.error?.code, 'CONTEXT_JOIN_LIMIT');
    assert.equal(Object.hasOwn(deepResult, 'artifact'), false);
    const sharedSource = { token: 'x'.repeat(260000) };
    assert.equal(invoke(context([], { source: sharedSource }), context([], { source: sharedSource })).error?.code, 'CONTEXT_JOIN_LIMIT');
    const wideSource = Object.fromEntries(Array.from({ length: 11000 }, (_, i) => [`k${i}`, null]));
    assert.equal(invoke(context([], { source: wideSource }), context([], { source: wideSource })).error?.code, 'CONTEXT_JOIN_LIMIT');
    assert.equal(parseRuntimeContext(context([message('over', 'x'.repeat(100001))])).error?.code, 'CONTEXT_JOIN_LIMIT');
    assert.equal(parseRuntimeContext(context([...many, message('over', '')])).error?.code, 'CONTEXT_JOIN_LIMIT');
    assert.equal(inspectContextData('x'.repeat(500000)).ok, true);
    assert.equal(inspectContextData('x'.repeat(500001)).error?.code, 'CONTEXT_JOIN_LIMIT');
    assert.equal(inspectContextData(Array(19998).fill(null)).ok, true);
    assert.equal(inspectContextData(Array(19999).fill(null)).error?.code, 'CONTEXT_JOIN_LIMIT');
    let exactDepth = null;
    for (let i = 0; i < 40; i++) exactDepth = { child: exactDepth };
    assert.equal(inspectContextData(exactDepth).ok, true);
    assert.equal(inspectContextData({ child: exactDepth }).error?.code, 'CONTEXT_JOIN_LIMIT');
});

// First/last-wins or text-only dedupe would hide ID collisions and promote source/derived claims.
test('fails full payload or source-scope ID conflicts independently in current and original material', () => {
    for (const changed of [message('same', 'different'), message('same', 'same', { role: 'assistant' }),
        message('same', 'same', { source: 'compactor' }), message('same', 'same', { derived: true }),
        message('same', 'same', { metadata: { trust: 'new' } })]) {
        const result = executeContextJoin(joinNode(), { left: context([message('same', 'same')]), right: context([changed]) });
        assert.equal(result.error?.code, 'CONTEXT_ID_CONFLICT');
        assert.equal(result.error?.messageId, 'same');
        assert.deepEqual(result.error?.portIds, ['left', 'right']);
        assert.equal(result.error?.material, 'messages');
        assert.equal(Object.hasOwn(result, 'artifact'), false);
    }
    for (const source of [{ chatId: 'two' }, { chatId: 'one', token: 'other' }]) {
        assert.equal(executeContextJoin(joinNode(), {
            left: context([message('same')], { source: { chatId: 'one' } }), right: context([message('same')], { source }),
        }).error?.code, 'CONTEXT_ID_CONFLICT');
    }
    const originalConflict = executeContextJoin(joinNode(), {
        left: context([], { original: [message('same', 'old')] }), right: context([], { original: [message('same', 'changed')] }),
    });
    assert.equal(originalConflict.error?.code, 'CONTEXT_ID_CONFLICT');
    assert.equal(originalConflict.error?.material, 'original');
});

// Comparing insertion order or only text would either invent conflicts or erase intentional repetition.
test('deduplicates canonical full messages and originals while retaining the first pin origin and exact counts', () => {
    const first = { id: 'same', role: 'user', text: 'same', metadata: { a: 1, b: [true, null] } };
    const reordered = { metadata: { b: [true, null], a: 1 }, text: 'same', role: 'user', id: 'same' };
    const result = executeContextJoin(joinNode(), {
        left: context([first], { source: { chatId: 'one', extra: { a: 1, b: 2 } }, original: [message('same', 'original')] }),
        right: context([reordered, message('distinct', 'same')], { source: { extra: { b: 2, a: 1 }, chatId: 'one' }, original: [message('same', 'original'), message('removed')] }),
    });
    assert.equal(result.ok, true);
    assert.deepEqual(result.artifact.messages, [first, message('distinct', 'same')]);
    assert.deepEqual(result.artifact.original, [message('same', 'original'), message('removed')]);
    assert.deepEqual(result.artifact.provenance.origins, [
        { portId: 'left', messageIds: ['same'], originalMessageIds: ['same'] },
        { portId: 'right', messageIds: ['distinct'], originalMessageIds: ['removed'] },
    ]);
    assert.deepEqual(result.reports[0], { code: 'CONTEXT_JOIN', inputs: [
        { portId: 'left', inputCount: 1, retainedCount: 1, deduplicatedCount: 0, originalInputCount: 1, originalRetainedCount: 1, originalDeduplicatedCount: 0 },
        { portId: 'right', inputCount: 2, retainedCount: 1, deduplicatedCount: 1, originalInputCount: 2, originalRetainedCount: 1, originalDeduplicatedCount: 1 },
    ], outputCount: 2, originalCount: 2, duplicateIds: ['same'], originalDuplicateIds: ['same'] });
    assert.equal(Object.hasOwn(result.artifact, 'derived'), false);
});

// Partial success or reading an inherited/accessor pin would let invalid data reach downstream nodes.
test('fails missing or malformed named inputs and Context messages before reading accessor content', () => {
    const valid = context([message('one')]);
    const missing = executeContextJoin(joinNode(), { left: valid });
    assert.equal(missing.error?.code, 'MISSING_INPUT');
    assert.equal(missing.error?.portId, 'right');
    assert.equal(Object.hasOwn(missing, 'artifact'), false);
    for (const invalid of [null, [], { kind: 'draft', messages: [] }, { kind: 'context', messages: null },
        context([message('', 'text')]), context([message('id', 'text', { role: 'developer' })]),
        context([message('id', 5)]), context([message('id'), message('id')]),
        context([], { original: null }), context([], { original: [message('id'), message('id')] })]) {
        const result = executeContextJoin(joinNode(), { left: valid, right: invalid });
        assert.equal(result.error?.code, 'INVALID_CONTEXT');
        assert.equal(Object.hasOwn(result, 'artifact'), false);
    }
    let reads = 0;
    const hostile = context([{ id: 'hostile', role: 'user', get text() { reads++; return 'secret'; } }]);
    assert.equal(executeContextJoin(joinNode(), { left: valid, right: hostile }).error?.code, 'INVALID_CONTEXT');
    const named = { left: valid, get right() { reads++; return valid; } };
    assert.equal(executeContextJoin(joinNode(), named).error?.code, 'INVALID_CONTEXT');
    assert.equal(reads, 0);
    assert.equal(executeContextJoin({ ...joinNode(), inputs: [] }, {}).error?.code, 'INVALID_SETTINGS');
});

// Sorting by IDs/roles or reconstructing originals from reduced messages would erase selected material.
test('joins exact ordered current messages and independently preserved originals with composite provenance', () => {
    const left = context([message('z', ' 😀 exact\n ', { role: 'system', source: 'compactor', extra: { token: 'opaque' } })], {
        original: [message('old', 'removed'), message('z', 'original z')], source: { chatId: 'one', token: 'opaque-source' },
    });
    const right = context([message('a', 'equal'), message('b', 'equal', { role: 'assistant', derived: true })], {
        source: { chatId: 'two' }, derived: true, reports: [{ code: 'BOUNDED_CONTEXT', nativeLoreIncluded: false }],
    });
    const result = executeContextJoin(joinNode(), { right, left });
    assert.equal(result.ok, true);
    assert.deepEqual(result.artifact.messages, [left.messages[0], right.messages[0], right.messages[1]]);
    assert.deepEqual(result.artifact.original, [left.original[0], left.original[1], right.messages[0], right.messages[1]]);
    assert.deepEqual(result.artifact.source, { operation: 'context-join', inputs: [
        { portId: 'left', source: { chatId: 'one', token: 'opaque-source' } }, { portId: 'right', source: { chatId: 'two' } },
    ] });
    assert.deepEqual(result.artifact.provenance, { operation: 'context-join', version: 1, origins: [
        { portId: 'left', messageIds: ['z'], originalMessageIds: ['old', 'z'] },
        { portId: 'right', messageIds: ['a', 'b'], originalMessageIds: ['a', 'b'] },
    ] });
    assert.equal(result.artifact.derived, true);
    assert.equal(Object.hasOwn(result.artifact, 'reports'), false);
    assert.equal(Object.hasOwn(result.artifact.source, 'nativeLoreIncluded'), false);
    const reordered = executeContextJoin(joinNode([...joinNode().inputs].reverse()), { right, left });
    assert.deepEqual(reordered.artifact.messages.map(item => item.id), ['a', 'b', 'z']);
});

// Accepting malformed slots would permit ambiguous identities and executing a pre-only node post-reply.
test('rejects malformed bounded slot settings and post phase without evaluating getters', () => {
    const malformed = [undefined, null, [], [joinNode().inputs[0]], Array.from({ length: 17 }, (_, i) => ({ id: `p${i}`, label: 'P' })),
        [{ id: 'same', label: 'A' }, { id: 'same', label: 'B' }],
        [{ id: '', label: 'A' }, { id: 'b', label: 'B' }],
        [{ id: 'a'.repeat(129), label: 'A' }, { id: 'b', label: 'B' }],
        [{ id: 'a', label: 'A'.repeat(81) }, { id: 'b', label: 'B' }],
        [{ id: 'a', label: 'A', unexpected: true }, { id: 'b', label: 'B' }]];
    for (const inputs of malformed) assert.equal(describeContextJoin({ ...joinNode(), inputs }).error?.code, 'INVALID_SETTINGS');
    assert.equal(describeContextJoin(joinNode(), { phase: 'post' }).error?.code, 'INVALID_SETTINGS');
    let reads = 0;
    const hostile = { ...joinNode(), get inputs() { reads++; return joinNode().inputs; } };
    assert.equal(describeContextJoin(hostile).error?.code, 'INVALID_SETTINGS');
    assert.equal(reads, 0);
    const boundary = describeContextJoin(joinNode([{ id: 'a'.repeat(128), label: 'A'.repeat(80) }, { id: 'b', label: '' }]));
    assert.equal(boundary.ok, true);
});
const message = (id, text = id, extra = {}) => ({ id, role: 'user', text, ...extra });
const context = (messages, extra = {}) => ({ kind: 'context', messages, ...extra });

// Losing ordered named pins would make authoring/execution depend on graph enumeration.
test('describes required ordered Context pins with zero-request pre-phase metadata', () => {
    const node = joinNode();
    const result = describeContextJoin(node, { phase: 'pre' });
    assert.equal(result.ok, true);
    assert.deepEqual(result.data.ports, [
        { id: 'left', label: 'Left', kind: 'context', direction: 'input', required: true, cardinality: 'one' },
        { id: 'right', label: 'Right', kind: 'context', direction: 'input', required: true, cardinality: 'one' },
        { id: 'out', label: 'Context', kind: 'context', direction: 'output', required: false, cardinality: 'one' },
    ]);
    assert.equal(result.data.descriptor.family, 'Shaping');
    assert.equal(result.data.descriptor.phase, 'pre');
    assert.equal(result.data.descriptor.minimumSchema, 3);
    assert.equal(result.data.descriptor.requestBound, 0);
    assert.equal(result.data.descriptor.modelRole, null);
    assert.equal(result.data.descriptor.terminal, false);
    assert.equal(result.data.descriptor.controlDescriptors.inputs.type, 'array');
    const defaults = describeContextJoin({ ...node, ...result.data.descriptor.defaults });
    assert.deepEqual(defaults.data.ports.map(port => port.id), ['context-1', 'context-2', 'out']);
    assert.deepEqual(node, joinNode());
});
