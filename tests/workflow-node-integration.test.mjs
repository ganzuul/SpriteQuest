import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as catalog from '../src/workflow/catalog.js';
import * as ports from '../src/workflow/ports.js';
import { validateGraphStructure, validateWorkflow } from '../src/workflow/contracts.js';

const node = (id, operation, controls = {}) => ({ id, type: 'workflow', operation, ...controls });
const graph = (phase = 'pre', nodes = {}, wires = {}) => ({ id: 'integration', schema: 3, runtime: 2, mode: `native-${phase}`, nodes, wires, definitions: {}, portals: {} });
const wire = (id, from, to, toPort = 'in', fromPort = 'out') => ({ id, route: 'wire', from, fromPort, to, toPort });

test('the shared catalog resolves actual dynamic pins in both graph phases', () => {
    assert.equal(typeof catalog.describeOperation, 'function');
    for (const phase of ['pre', 'post']) {
        for (const operation of ['compose', 'text-rules', 'json-decode', 'select-fields']) {
            const n = node('work', operation), g = graph(phase, { work: n });
            const description = catalog.describeOperation(g, n);
            assert.equal(description.ok, true, JSON.stringify(description));
            assert.equal(description.data.descriptor.phase, phase);
            assert.equal(description.data.descriptor.minimumSchema, 3);
            assert.equal(description.data.descriptor.requestBound, 0);
            assert.equal(description.data.descriptor.modelRole, null);
            assert.equal(description.data.descriptor.terminal, false);
            assert.equal(validateGraphStructure(g).ok, true);
        }
    }
    const compose = node('c', 'compose', { sections: [{ name: 'first', text: 'A' }, { name: 'second', text: 'B' }] });
    assert.deepEqual(catalog.portsForNode(graph('pre'), compose).map(p => p.id), ['data', 'section.first', 'section.second', 'out']);
    const decode = node('j', 'json-decode', { mode: 'check' });
    assert.equal(catalog.portsForNode(graph('post'), decode)[0].kind, 'data');
    assert.equal(validateGraphStructure(graph('post', { c: node('c', 'compose', { outputKind: 'guidance' }) })).ok, false);
    assert.equal(validateGraphStructure(graph('pre', { t: node('t', 'text-rules', { inputKind: 'draft' }) })).ok, false);
    assert.equal(validateGraphStructure(graph('post', { t: node('t', 'text-rules', { inputKind: 'draft', mode: 'extract' }) })).ok, false);
});

test('all five new operations reject schema2 and malformed declared controls', () => {
    for (const operation of ['compose', 'text-rules', 'json-decode', 'select-fields', 'context-join']) {
        const g = graph('pre', { work: node('work', operation) });
        g.schema = 2; g.runtime = 1;
        assert.equal(validateWorkflow(g).ok, false, operation);
        assert.equal(validateGraphStructure(g).ok, false, operation);
    }
    for (const [operation, controls] of [
        ['compose', { sections: [{ name: 'same', text: 'A' }, { name: 'same', text: 'B' }] }],
        ['text-rules', { rules: [{ kind: 'regex', pattern: 'x', flags: 'g' }] }],
        ['json-decode', { schema: '{broken' }],
        ['select-fields', { fields: [{ name: 'x', path: 'invalid pointer' }] }],
        ['context-join', { inputs: [{ id: 'one', label: 'A' }, { id: 'one', label: 'B' }] }],
        ['compose', { separator: null }],
    ]) assert.equal(validateGraphStructure(graph('pre', { work: node('work', operation, controls) })).ok, false, operation);
});

test('control changes preserve stable pins and reject occupied removed pins atomically', () => {
    assert.equal(typeof ports.prepareNodeControlChange, 'function');
    const g = graph('pre', { source: node('source', 'compose'), target: node('target', 'compose', { sections: [{ name: 'one', text: 'A' }, { name: 'two', text: 'B' }] }) }, { e: wire('e', 'source', 'target', 'section.one') });
    const before = structuredClone(g);
    const removed = ports.prepareNodeControlChange(g, { nodeId: 'target', controls: { sections: [{ name: 'two', text: 'B' }] } });
    assert.equal(removed.ok, false);
    assert.deepEqual(g, before);
    const reorder = ports.prepareNodeControlChange(g, { nodeId: 'target', controls: { sections: [...g.nodes.target.sections].reverse() } });
    assert.equal(reorder.ok, true, JSON.stringify(reorder));
    assert.deepEqual(reorder.data.candidate.wires, g.wires);
    assert.equal(reorder.data.changed, true);
    const explicit = ports.prepareNodeControlChange(g, { nodeId: 'target', controls: { sections: [{ name: 'two', text: 'B' }] }, removeEdgeIds: ['e'] });
    assert.equal(explicit.ok, true, JSON.stringify(explicit));
    assert.deepEqual(explicit.data.removedEdgeIds, ['e']);
    assert.deepEqual(explicit.data.candidate.wires, {});
    assert.equal(ports.prepareNodeControlChange(g, { nodeId: 'target', controls: { profileId: 'hidden' } }).ok, false);
    const mode = graph('pre', { source: node('source', 'compose'), target: node('target', 'json-decode') }, { e: wire('e', 'source', 'target') });
    assert.equal(ports.prepareNodeControlChange(mode, { nodeId: 'target', controls: { mode: 'check' } }).ok, false);
    mode.portals.p = { id: 'p', label: 'Published', kind: 'text', source: { nodeId: 'source', portId: 'out' } };
    assert.equal(ports.prepareNodeControlChange(mode, { nodeId: 'source', controls: { outputKind: 'guidance' }, removeEdgeIds: ['e'] }).ok, false, 'a publisher cannot silently disappear');
});
import { computeDefinitionIdentity, definitionRefKey, validateDefinition } from '../src/workflow/definitions.js';
import { resolveWorkflow } from '../src/workflow/resolve.js';
import { exportWorkflow, parseWorkflow, exportSubgraph, parseSubgraph } from '../src/workflow/packages.js';
import { executePrimitive } from '../src/workflow/operations/nodes.js';
import { executeContextJoin } from '../src/workflow/operations/context-join.js';
import { Worker } from 'node:worker_threads';

const joinSlots = [{ id: 'a/one', label: 'First' }, { id: 'b|two', label: 'Second' }];
const finalize = draft => {
    const result = computeDefinitionIdentity(draft);
    assert.equal(result.ok, true, JSON.stringify(result));
    return { ...structuredClone(result.data.materializedDefinition), semanticHash: result.data.semanticHash };
};
const definition = (id, body, iface = [], parameters = []) => ({ id, version: 1, name: id, body, interface: iface, parameters });
const boundary = (id, kind, direction) => ({ id, label: id, kind, direction, required: direction === 'input', cardinality: 'one', boundaryNodeId: `${id}-boundary` });
const mixedDraft = () => {
    const iface = [boundary('text', 'text', 'input'), boundary('data', 'data', 'output'), boundary('result', 'text', 'output')];
    const body = graph('post', {
        'text-boundary': { id: 'text-boundary', type: 'subgraph-input', interfacePortId: 'text' },
        decode: node('decode', 'json-decode'),
        pick: node('pick', 'select-fields', { fields: [{ name: 'selected', path: ['value'], required: false, default: { profileId: 'ordinary data', model: 'ordinary data' } }] }),
        check: node('check', 'json-decode', { mode: 'check', schema: '{"type":"object"}' }),
        compose: node('compose', 'compose', { mode: 'template', template: '{{/selected}}' }),
        rules: node('rules', 'text-rules'),
        'data-boundary': { id: 'data-boundary', type: 'subgraph-output', interfacePortId: 'data' },
        'result-boundary': { id: 'result-boundary', type: 'subgraph-output', interfacePortId: 'result' },
    }, { a: wire('a', 'text-boundary', 'decode'), b: wire('b', 'decode', 'pick'), c: wire('c', 'pick', 'check'), d: wire('d', 'check', 'compose', 'data'), e: wire('e', 'compose', 'rules'), f: wire('f', 'check', 'data-boundary'), g: wire('g', 'rules', 'result-boundary') });
    delete body.definitions;
    body.roles = { Portable: { profileId: 'private local', model: 'portable model' }, Blocked: { model: null } };
    body.nodes.compose.profileId = 'private local'; body.nodes.compose.model = 'portable model';
    return definition('mixed', body, iface, [{ id: 'schema', label: 'Schema', target: { instancePath: [], nodeId: 'check', controlId: 'schema' } }]);
};

test('Context Join slots keep stable connections; labels are presentation and order is semantic', () => {
    const g = graph('pre', { source: node('source', 'scene-context'), join: node('join', 'context-join', { inputs: joinSlots }) }, { a: wire('a', 'source', 'join', 'a/one'), b: wire('b', 'source', 'join', 'b|two') });
    assert.equal(validateGraphStructure(g).ok, true);
    assert.equal(catalog.portsForNode(g, g.nodes.join)[0].id, 'a/one');
    const rename = ports.prepareNodeControlChange(g, { nodeId: 'join', controls: { inputs: joinSlots.map(slot => ({ ...slot, label: slot.label + ' renamed' })) } });
    assert.equal(rename.ok, true);
    assert.equal(ports.graphSemanticSignature(rename.data.candidate), ports.graphSemanticSignature(g));
    assert.notEqual(ports.graphDocumentSignature(rename.data.candidate), ports.graphDocumentSignature(g));
    const reorder = ports.prepareNodeControlChange(g, { nodeId: 'join', controls: { inputs: [...joinSlots].reverse() } });
    assert.equal(reorder.ok, true);
    assert.notEqual(ports.graphSemanticSignature(reorder.data.candidate), ports.graphSemanticSignature(g));
    assert.deepEqual(reorder.data.candidate.wires, g.wires);
    const invalid = ports.prepareNodeControlChange(g, { nodeId: 'join', controls: { inputs: [{ id: 'new', label: 'New' }, joinSlots[1]] } });
    assert.equal(invalid.ok, false);
    const draft = definition('join', graph('pre', { join: g.nodes.join }));
    const hashed = finalize(draft), relabeled = structuredClone(draft); relabeled.body.nodes.join.inputs[0].label = 'Different';
    assert.equal(finalize(relabeled).semanticHash, hashed.semanticHash);
    const reordered = structuredClone(draft); reordered.body.nodes.join.inputs.reverse();
    assert.notEqual(finalize(reordered).semanticHash, hashed.semanticHash);
});

test('mixed pinned operations materialize controls and resolve a targeted post-phase closure', () => {
    const snapshot = finalize(mixedDraft()), key = definitionRefKey(snapshot);
    assert.equal(validateDefinition(snapshot).ok, true);
    assert.equal(snapshot.body.nodes.rules.separator, '\n');
    assert.equal(snapshot.body.nodes.decode.mode, 'parse');
    const g = graph('post', { source: node('source', 'compose', { sections: [{ name: 'json', text: '{"value":"ok"}' }] }), instance: { id: 'instance', type: 'subgraph', definition: { id: snapshot.id, version: 1, semanticHash: snapshot.semanticHash }, parameterOverrides: {}, roleOverrides: { Blocked: { model: null } }, nodeBindingOverrides: {} }, unrelated: node('unrelated', 'text-rules') }, { a: wire('a', 'source', 'instance', 'text') });
    g.definitions[key] = snapshot;
    const result = resolveWorkflow(g, { target: { workflowId: g.id, instancePath: [], nodeId: 'instance', portId: 'result' } });
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(result.data.phase, 'post');
    assert.equal(result.data.callBound, 0);
    assert.deepEqual(result.data.requiredRoles, []);
    assert.equal(result.data.primitives.find(p => p.address.nodeId === 'unrelated').included, false);
    assert.equal(result.data.primitives.filter(p => p.included).length, 6);
    const modeChange = structuredClone(g); modeChange.nodes.instance.parameterOverrides.schema = 'invalid JSON';
    assert.equal(validateGraphStructure(modeChange).ok, false, 'deep exposed control validation remains authoritative');
    const stablePins = structuredClone(g); stablePins.nodes.instance.parameterOverrides.schema = '{"type":"object","required":["selected"]}';
    assert.equal(validateGraphStructure(stablePins).ok, true);
});

test('workflow and standalone packages retain declared Text/Data controls and portable model blockers', () => {
    const snapshot = finalize(mixedDraft()), standalone = exportSubgraph(snapshot);
    const parsed = parseSubgraph(JSON.stringify(standalone));
    assert.equal(parsed.ok, true, JSON.stringify(parsed));
    assert.equal(parsed.data.definition.semanticHash, snapshot.semanticHash);
    assert.deepEqual(parsed.data.definition.interface.map(p => p.kind), ['text', 'data', 'text']);
    assert.equal(parsed.data.definition.body.roles.Portable.profileId, null);
    assert.equal(parsed.data.definition.body.roles.Portable.model, 'portable model');
    assert.deepEqual(parsed.data.definition.body.roles.Blocked, { model: null });
    assert.deepEqual(parsed.data.definition.body.nodes.pick.fields[0].default, { profileId: 'ordinary data', model: 'ordinary data' });
    const g = graph('post', { instance: { id: 'instance', type: 'subgraph', definition: { id: snapshot.id, version: 1, semanticHash: snapshot.semanticHash }, parameterOverrides: {}, roleOverrides: { Portable: { profileId: 'secret local', model: 'portable override' }, Blocked: { model: null } }, nodeBindingOverrides: {} } });
    g.definitions[definitionRefKey(snapshot)] = snapshot;
    g.mode = 'native-unified';
    const roundtrip = parseWorkflow(JSON.stringify(exportWorkflow(g)));
    assert.equal(roundtrip.ok, true, JSON.stringify(roundtrip));
    assert.equal(roundtrip.data.nodes.instance.roleOverrides.Portable.profileId, null);
    assert.equal(roundtrip.data.nodes.instance.roleOverrides.Portable.model, 'portable override');
    assert.deepEqual(roundtrip.data.nodes.instance.roleOverrides.Blocked, { model: null });
    assert.equal(roundtrip.data.definitions[definitionRefKey(snapshot)].semanticHash, snapshot.semanticHash);
    const malformed = { kind: 'lattice-workflow', schema: 2, minRuntime: 2, graph: graph('pre', { bad: node('bad', 'select-fields', { fields: [{ name: 'bad', path: 'invalid' }] }) }) };
    assert.equal(parseWorkflow(JSON.stringify(malformed)).ok, false, 'portable whitelist cannot silently erase invalid declared controls');
});

test('ordered Context boundaries roundtrip with slots preserved', () => {
    const iface = [boundary('left', 'context', 'input'), boundary('right', 'context', 'input'), boundary('result', 'context', 'output')];
    const body = graph('pre', { 'left-boundary': { id: 'left-boundary', type: 'subgraph-input', interfacePortId: 'left' }, 'right-boundary': { id: 'right-boundary', type: 'subgraph-input', interfacePortId: 'right' }, join: node('join', 'context-join', { inputs: joinSlots }), 'result-boundary': { id: 'result-boundary', type: 'subgraph-output', interfacePortId: 'result' } }, { a: wire('a', 'left-boundary', 'join', 'a/one'), b: wire('b', 'right-boundary', 'join', 'b|two'), c: wire('c', 'join', 'result-boundary') });
    const snapshot = finalize(definition('joined', body, iface));
    assert.equal(validateDefinition(snapshot).ok, true);
    const roundtrip = parseSubgraph(JSON.stringify(exportSubgraph(snapshot)));
    assert.equal(roundtrip.ok, true);
    assert.deepEqual(roundtrip.data.definition.body.nodes.join.inputs, joinSlots);
    assert.equal(roundtrip.data.definition.semanticHash, snapshot.semanticHash);
});

test('registered adapters keep bounded runtime Data and Context provenance separate from portable settings', async () => {
    const text = await executePrimitive(node('c', 'compose', { sections: [{ name: 'json', text: '{"token":"opaque","value":"ok"}' }] }), {}, { phase: 'pre' });
    assert.equal(text.ok, true);
    const decoded = await executePrimitive(node('j', 'json-decode'), { in: text.artifact }, { phase: 'pre' });
    assert.equal(decoded.ok, true);
    assert.equal(decoded.artifact.value.token, 'opaque');
    const picked = await executePrimitive(node('s', 'select-fields', { fields: [{ name: 'kept', path: ['token'] }] }), { in: decoded.artifact }, { phase: 'pre' });
    assert.deepEqual(picked.artifact, { kind: 'data', value: { kept: 'opaque' } });
    let workers = 0, resource, termination;
    const handlers = new Map();
    const rules = await executePrimitive(node('t', 'text-rules', { rules: [{ kind: 'literal', pattern: 'opaque', replacement: 'kept' }] }), { in: { kind: 'text', text: 'opaque' } }, { phase: 'pre', createWorker() { workers++; resource = new Worker(new URL('./fixtures/text-rules-node-worker.mjs', import.meta.url));
        return { addEventListener(type, fn) { const handler = type === 'message' ? data => { if (!data?.fixtureStarted) fn({ data }); } : error => fn({ error }); handlers.set(fn, handler); resource.on(type, handler); }, removeEventListener(type, fn) { resource.off(type, handlers.get(fn)); handlers.delete(fn); }, postMessage(data) { resource.postMessage(data); }, terminate() { termination = resource.terminate(); return termination; } }; } });
    assert.equal(rules.ok, true, JSON.stringify(rules));
    assert.equal(rules.artifact.text, 'kept');
    assert.equal(workers, 1);
    assert.ok(termination); await termination; assert.equal(resource.threadId, -1); assert.equal(handlers.size, 0);
    const joined = executeContextJoin({ ...node('join', 'context-join', { inputs: joinSlots }), operationVersion: 1 }, { 'a/one': { kind: 'context', messages: [{ id: 'a', role: 'user', text: 'A' }], source: { token: 'opaque' } }, 'b|two': { kind: 'context', messages: [{ id: 'b', role: 'assistant', text: 'B' }], source: { token: 'opaque' } } });
    assert.equal(joined.ok, true);
    assert.equal(joined.artifact.source.inputs[0].source.token, 'opaque');
    assert.equal(catalog.describeOperation(graph('pre'), node('join', 'context-join')).data.descriptor.requestBound, 0);
    assert.equal(validateGraphStructure(graph('pre', { c: node('c', 'compose', { template: 'x'.repeat(100001) }) })).ok, false);
});

test('checked catalog descriptions do not read accessor routing metadata', () => {
    let reads = 0;
    const n = node('unsafe', 'compose');
    Object.defineProperty(n, 'operation', { enumerable: true, get() { reads++; return 'compose'; } });
    assert.equal(catalog.describeOperation(graph('pre'), n).ok, false);
    const g = graph('pre');
    Object.defineProperty(g, 'mode', { enumerable: true, get() { reads++; return 'native-pre'; } });
    assert.equal(catalog.describeOperation(g, node('safe', 'compose')).ok, false);
    assert.equal(reads, 0);
});
test('resolved Context Join nodes materialize executable defaults without mutating saved data', () => {
    const g = graph('pre', { source: node('source', 'scene-context'), join: node('join', 'context-join') }, { a: wire('a', 'source', 'join', 'context-1'), b: wire('b', 'source', 'join', 'context-2') });
    const saved = structuredClone(g);
    const result = resolveWorkflow(g, { target: { workflowId: g.id, instancePath: [], nodeId: 'join', portId: 'out' } });
    assert.equal(result.ok, true, JSON.stringify(result));
    const join = result.data.primitives.find(p => p.address.nodeId === 'join').node;
    const input = { kind: 'context', messages: [{ id: 'one', role: 'user', text: 'source' }] };
    const output = executeContextJoin(join, { 'context-1': input, 'context-2': input });
    assert.equal(output.ok, true, JSON.stringify(output));
    assert.deepEqual(output.artifact.messages, input.messages);
    assert.deepEqual(g, saved);
});

test('Context Join slot removal requires explicit incident disconnection and valid remaining slots', () => {
    const slots = [...joinSlots, { id: 'third', label: 'Third' }];
    const g = graph('pre', { source: node('source', 'scene-context'), join: node('join', 'context-join', { inputs: slots }) }, { e: wire('e', 'source', 'join', 'third') });
    assert.equal(ports.prepareNodeControlChange(g, { nodeId: 'join', controls: { inputs: joinSlots } }).ok, false);
    const accepted = ports.prepareNodeControlChange(g, { nodeId: 'join', controls: { inputs: joinSlots }, removeEdgeIds: ['e'] });
    assert.equal(accepted.ok, true);
    assert.deepEqual(accepted.data.candidate.wires, {});
    assert.equal(ports.prepareNodeControlChange(g, { nodeId: 'join', controls: { inputs: [joinSlots[0]] }, removeEdgeIds: ['e'] }).ok, false);
    const unrelated = graph('pre', { ...g.nodes, other: node('other', 'smart-compactor') }, { other: wire('other', 'source', 'other') });
    assert.equal(ports.prepareNodeControlChange(unrelated, { nodeId: 'join', controls: {}, removeEdgeIds: ['other'] }).ok, false);
});
test('Context Join pin layout stays editable inside bodies and cannot be exposed as a parameter', () => {
    const draft = definition('layout', graph('pre', { join: node('join', 'context-join', { inputs: joinSlots }) }), [], [{ id: 'layout', label: 'Layout', target: { instancePath: [], nodeId: 'join', controlId: 'inputs' } }]);
    const snapshot = finalize(draft);
    const checked = validateDefinition(snapshot);
    assert.equal(checked.ok, false);
    assert.equal(checked.error.code, 'DEFINITION_PARAMETER');
    const g = graph('pre', { instance: { id: 'instance', type: 'subgraph', definition: { id: snapshot.id, version: snapshot.version, semanticHash: snapshot.semanticHash }, parameterOverrides: { layout: joinSlots }, roleOverrides: {}, nodeBindingOverrides: {} } });
    g.definitions[definitionRefKey(snapshot)] = snapshot;
    assert.equal(validateGraphStructure(g).error.code, 'DEFINITION_PARAMETER');
    const clean = finalize({ ...draft, parameters: [] });
    const outer = finalize(definition('outer-layout', graph('pre', { child: { id: 'child', type: 'subgraph', definition: { id: clean.id, version: clean.version, semanticHash: clean.semanticHash }, parameterOverrides: {}, roleOverrides: {}, nodeBindingOverrides: {} } }), [], [{ id: 'nested-layout', label: 'Layout', target: { instancePath: ['child'], nodeId: 'join', controlId: 'inputs' } }]));
    assert.equal(validateDefinition(outer, { [definitionRefKey(clean)]: clean }).error.code, 'DEFINITION_PARAMETER');
    assert.equal(catalog.describeOperation(graph('pre'), node('join', 'context-join')).data.descriptor.controlDescriptors.inputs.exposable, false);
});
