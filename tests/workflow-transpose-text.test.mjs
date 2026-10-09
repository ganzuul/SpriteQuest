import assert from 'node:assert/strict';
import test from 'node:test';
import { describeTranspose, executeTranspose } from '../src/workflow/operations/transpose-nodes.js';
import { describeOperation, operationDefaults } from '../src/workflow/catalog.js';
import { validateGraphStructure } from '../src/workflow/contracts.js';
import { prepareNodeControlChange } from '../src/workflow/ports.js';
import { runWorkflow } from '../src/workflow/runtime.js';

const must = result => { assert.equal(result.ok, true, JSON.stringify(result.error)); return result.data; };
const textArtifact = text => ({ kind: 'text', text });
const node = (id, operation, controls = {}) => ({ id, type: 'workflow', operation, operationVersion: 1, ...controls });
const wire = (id, from, to, toPort = 'in') => ({ id, route: 'wire', from, fromPort: 'out', to, toPort });
const graph = (nodes, wires = {}, phase = 'pre') => ({ id: 'transpose-text', schema: 3, runtime: 2, mode: 'native-' + phase, nodes, wires, definitions: {}, portals: {}, roles: {} });
const services = (text, extra = {}) => ({ binding: {}, countTokens: async () => ({ tokens: 3 }), request: async () => ({ ok: true, data: { text, finish: 'stop' } }), ...extra });
const operations = ['style-transfer', 'format-transfer', 'terminology-map'];
const referenceFor = operation => operation === 'terminology-map'
    ? { kind: 'data', value: { entries: [{ from: 'Captain', to: 'Commander' }] } }
    : textArtifact('Plain prose.');

function contentFlow(operation, phase) {
    const nodes = {
        source: node('source', 'compose', { sections: [{ name: 'Content', text: 'Captain waits.' }] }),
        example: node('example', 'compose', { sections: [{ name: 'Reference', text: operation === 'terminology-map' ? '{"entries":[{"from":"Captain","to":"Commander"}]}' : 'Plain prose.' }] }),
        change: node('change', operation, { inputKind: 'text', scope: 'whole', profileId: 'fixture-profile', model: 'fixture-model' }),
        next: node('next', 'compose', { mode: 'template', template: '{{section:Content}} Ready.', sections: [{ name: 'Content', text: '' }] }),
    };
    const wires = { a: wire('a', 'source', 'change'), b: wire('b', 'example', 'change', 'reference'), c: wire('c', 'change', 'next', 'section.Content') };
    if (operation === 'terminology-map') {
        nodes.reference = node('reference', 'json-decode');
        wires.b = wire('b', 'example', 'reference');
        wires.reference = wire('reference', 'reference', 'change', 'reference');
    }
    return graph(nodes, wires, phase);
}

test('explicit Text Transpose exposes phase-specific ports and safe input choices', () => {
    for (const operation of operations) for (const phase of ['pre', 'post']) {
        const n = node('change', operation, { inputKind: 'text' });
        const { descriptor, ports } = must(describeOperation(graph({ change: n }, {}, phase), n));
        assert.equal(descriptor.phase, phase);
        assert.equal(descriptor.input, 'text'); assert.equal(descriptor.output, 'text');
        assert.equal(ports.find(port => port.id === 'in').kind, 'text');
        assert.equal(ports.find(port => port.id === 'out').kind, 'text');
        assert.equal(descriptor.controlDescriptors.inputKind.label, 'Input type');
        assert.deepEqual(descriptor.controlDescriptors.inputKind.values, phase === 'pre' ? ['text'] : ['draft', 'text']);
        assert.equal(descriptor.defaults.inputKind, 'text');
    }
    assert.equal(must(describeTranspose({ operation: 'style-transfer', inputKind: 'text' }, { phase: 'pre' })).descriptor.phase, 'pre');
    assert.equal(operationDefaults('style-transfer').inputKind, 'draft');
    const legacy = must(describeOperation(graph({}, {}, 'post'), node('legacy', 'style-transfer')));
    assert.equal(legacy.descriptor.input, 'draft'); assert.equal(legacy.descriptor.output, 'patches');
    assert.equal(describeOperation(graph({}, {}, 'pre'), node('legacy', 'style-transfer')).ok, false);
    for (const bad of [{ inputKind: 'data' }, { inputKind: 'draft', phase: 'pre' }, { inputKind: 'text', phase: 'bad' }]) assert.equal(describeTranspose({ operation: 'style-transfer', ...bad }).ok, false);
});

test('Text Transpose executes all operations in pre and post without exposing Draft authority', async () => {
    for (const operation of operations) for (const phase of ['pre', 'post']) {
        const result = await executeTranspose({ operation, inputKind: 'text', scope: 'whole' }, { in: textArtifact('Captain waits.'), reference: referenceFor(operation) }, { ...services('Commander waits.'), phase });
        assert.equal(result.ok, true, JSON.stringify(result.error));
        assert.deepEqual(result.artifact, { kind: 'text', text: 'Commander waits.' });
        assert.equal(JSON.stringify(result).includes('originalText'), false);
        assert.equal(result.artifact.source, undefined); assert.equal(result.artifact.draft, undefined);
    }
});

test('Text terminology uses authorized content scope without reading model or host authority', async () => {
    let authorityReads = 0;
    const execution = { phase: 'pre' };
    for (const key of ['request', 'countTokens', 'binding', 'signal', 'snapshot', 'resolveBinding', 'apply']) Object.defineProperty(execution, key, { enumerable: true, get() { authorityReads++; throw Error('No authority'); } });
    const input = textArtifact('Captain waits. "Captain speaks."');
    const result = await executeTranspose({ operation: 'terminology-map', inputKind: 'text', scope: 'authorized', protectedLiterals: ['Captain speaks.'] }, { in: input, reference: referenceFor('terminology-map') }, execution);
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.deepEqual(result.artifact, textArtifact('Commander waits. "Captain speaks."'));
    assert.equal(result.reports.at(-1).count, 1); assert.equal(authorityReads, 0);
    assert.deepEqual(input, textArtifact('Captain waits. "Captain speaks."'));
});

test('Text transfer retains mode, context, token budget and one injected binding request', async () => {
    let requests = 0, counts = 0, hostReads = 0;
    const binding = Object.freeze({ opaque: true }), controller = new AbortController();
    const context = { kind: 'context', messages: [{ id: 'm', role: 'user', text: 'Keep facts.' }] };
    const execution = services('Captain waits. "Commander speaks."', {
        phase: 'pre', binding, signal: controller.signal,
        countTokens: async prompt => { counts++; assert.ok(prompt.includes('Keep facts.')); return { tokens: 19 }; },
        request: async packet => {
            requests++; assert.equal(packet.binding, binding); assert.equal(packet.signal, controller.signal); assert.equal(packet.maxTokens, 17);
            const prompt = JSON.parse(packet.messages[1].content);
            assert.equal(prompt.controls.mode, 'character-voice'); assert.equal(prompt.controls.strength, 'balanced');
            assert.equal(prompt.controls.instructions, 'Keep it plain.'); assert.deepEqual(prompt.context, context.messages);
            assert.equal(JSON.stringify(prompt).includes('originalText'), false);
            return { ok: true, data: { text: 'Captain waits. "Commander speaks."', finish: 'stop' } };
        },
    });
    Object.defineProperty(execution, 'snapshot', { get() { hostReads++; throw Error('No snapshot'); } });
    const result = await executeTranspose({ operation: 'style-transfer', inputKind: 'text', mode: 'character-voice', scope: 'dialogue', strength: 'balanced', instructions: 'Keep it plain.', maxTokens: 17 }, { in: textArtifact('Captain waits. "Captain speaks."'), reference: textArtifact('Voice reference.'), context }, execution);
    assert.equal(result.ok, true, JSON.stringify(result.error)); assert.deepEqual(result.artifact, textArtifact('Captain waits. "Commander speaks."'));
    assert.equal(requests, 1); assert.equal(counts, 1); assert.equal(hostReads, 0);
    assert.equal(result.reports.at(-1).requestCount, 1); assert.equal(result.reports.at(-1).tokenCount, 19);
});

test('Text targets reject unsafe, oversized and wrong-kind inputs before model effects', async () => {
    let effects = 0, reads = 0;
    const execution = services('Changed', { phase: 'pre', countTokens: async () => { effects++; return { tokens: 1 }; }, request: async () => { effects++; return { ok: true, data: { text: 'Changed', finish: 'stop' } }; } });
    const getter = Object.defineProperty({ kind: 'text' }, 'text', { enumerable: true, get() { reads++; return 'Captain'; } });
    for (const input of [{ kind: 'draft', text: 'Captain', source: { originalText: 'Captain' } }, { kind: 'data', value: 'Captain' }, { kind: 'text' }, { kind: 'text', text: 1 }, textArtifact('x'.repeat(100001)), getter, Object.create(textArtifact('Captain'))]) {
        const result = await executeTranspose({ operation: 'style-transfer', inputKind: 'text' }, { in: input, reference: referenceFor('style-transfer') }, execution);
        assert.equal(result.ok, false); assert.equal(result.artifact, undefined);
    }
    assert.equal(effects, 0); assert.equal(reads, 0);
});

test('Text candidates retain protected regions, scope and verified completion validation', async () => {
    const inputs = { in: textArtifact('Captain waits. "Keep this."'), reference: referenceFor('style-transfer') };
    for (const [candidate, extra] of [['Commander waits. "Changed."', {}], ['Commander goes. "Keep this."', {}], ['Commander waits. "Keep this."', { finish: 'length' }], [' ', {}]]) {
        const result = await executeTranspose({ operation: 'style-transfer', inputKind: 'text', protectedLiterals: ['waits.'] }, inputs, services(candidate, { phase: 'pre', request: async () => ({ ok: true, data: { text: candidate, finish: 'stop', ...extra } }) }));
        assert.equal(result.ok, false); assert.equal(result.artifact, undefined);
    }
    const result = await executeTranspose({ operation: 'style-transfer', inputKind: 'text', protectedLiterals: ['waits.'] }, inputs, { ...services('Commander waits. "Keep this."'), phase: 'pre' });
    assert.equal(result.ok, true, JSON.stringify(result.error)); assert.deepEqual(result.artifact, textArtifact('Commander waits. "Keep this."'));
});

test('Text transfer cancellation suppresses late output with at most one request', async () => {
    let requests = 0;
    const controller = new AbortController();
    const result = await executeTranspose({ operation: 'format-transfer', inputKind: 'text' }, { in: textArtifact('Captain waits.'), reference: referenceFor('format-transfer') }, services('Commander waits.', { phase: 'pre', signal: controller.signal, request: async () => { requests++; controller.abort(); return { ok: true, data: { text: 'Commander waits.', finish: 'stop' } }; } }));
    assert.equal(result.ok, false); assert.equal(result.error.code, 'ABORTED'); assert.equal(result.artifact, undefined); assert.equal(requests, 1);
});

test('Text Transpose chains to another Text operation with bounded model calls and no snapshot or host writes', async () => {
    for (const operation of operations) for (const phase of ['pre', 'post']) {
        const g = contentFlow(operation, phase), binding = { profileId: 'fixture-profile', model: 'fixture-model' };
        assert.equal(validateGraphStructure(g).ok, true, JSON.stringify(validateGraphStructure(g).error));
        let requests = 0, bindings = 0, hostEffects = 0;
        const result = await runWorkflow(g, {
            target: { workflowId: g.id, instancePath: [], nodeId: 'next', portId: 'out' }, countTokens: async () => ({ tokens: 2 }),
            snapshot: () => { hostEffects++; throw Error('No snapshot'); }, apply: () => { hostEffects++; throw Error('No writes'); },
            resolveBinding: () => { bindings++; return { ok: true, data: binding }; },
            request: async packet => { requests++; assert.equal(packet.binding, binding); return { ok: true, data: { text: 'Commander waits.', finish: 'stop' } }; },
        });
        assert.equal(result.ok, true, JSON.stringify(result.error)); assert.equal(result.callBound, operation === 'terminology-map' ? 0 : 1);
        assert.equal(result.actualCalls, result.callBound); assert.equal(requests, result.callBound); assert.equal(bindings, result.callBound); assert.equal(hostEffects, 0);
        assert.ok(result.recording.artifacts.some(item => item.value?.kind === 'text' && item.value.text === 'Commander waits. Ready.'));
        assert.equal(result.recording.artifacts.some(item => ['draft', 'patches', 'candidate'].includes(item.kind)), false);
        assert.equal(result.recording.terminals.length, 0);
    }
});

test('changing Transpose target kind preserves atomic wire validation', () => {
    const g = contentFlow('style-transfer', 'post'), before = structuredClone(g);
    assert.equal(prepareNodeControlChange(g, { nodeId: 'change', controls: { inputKind: 'draft' } }).ok, false);
    assert.deepEqual(g, before);
    const changed = prepareNodeControlChange(g, { nodeId: 'change', controls: { inputKind: 'draft' }, removeEdgeIds: ['a', 'c'] });
    assert.equal(changed.ok, true, JSON.stringify(changed.error));
    assert.equal(must(describeOperation(changed.data.candidate, changed.data.candidate.nodes.change)).ports.find(port => port.id === 'out').kind, 'patches');
});

test('Text materialization ignores inherited permissions', async () => {
    let reads = 0;
    Object.defineProperty(Object.prototype, 'protectedLiterals', { configurable: true, get() { reads++; throw Error('Ambient permissions are not Text authority'); } });
    try {
        const result = await executeTranspose({ operation: 'terminology-map', inputKind: 'text', scope: 'whole' }, { in: textArtifact('Captain waits.'), reference: referenceFor('terminology-map') }, { phase: 'pre' });
        assert.equal(result.ok, true, JSON.stringify(result.error));
        assert.deepEqual(result.artifact, textArtifact('Commander waits.'));
        assert.equal(reads, 0);
    } finally { delete Object.prototype.protectedLiterals; }
});
