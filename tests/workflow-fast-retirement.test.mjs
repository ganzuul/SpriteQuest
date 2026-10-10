import assert from 'node:assert/strict';
import { test } from 'node:test';
import { starterGraph } from '../src/workflow/starters.js';
import { computeDefinitionIdentity, definitionRefKey } from '../src/workflow/definition-data.js';
import { parseWorkflow } from '../src/workflow/packages.js';
import { portableArchivedWorkflow, retiredLibraryKeys } from '../src/workflow/retired-workflows.js';
import { ACTIVE_PROFILE_ID } from '../src/workflow/model-profiles.js';

let sequence = 0;
async function stateFor(value) {
    let saves = 0;
    const context = { extensionSettings: { lattice: value }, saveSettingsDebounced() { saves++; } };
    globalThis.SillyTavern = { getContext: () => context };
    const state = await import('../src/state.js?fast-retirement=' + ++sequence);
    return { state, saves: () => saves };
}
function fastGraph(id = 'saved-fast') {
    const graph = starterGraph('unified-basic');
    graph.id = id;
    graph.nodes.fast = { id: 'fast', type: 'workflow', operation: 'fast-decision', operationVersion: 1, phase: 'pre', inputKind: 'text', fastConnectionId: 'local-fast', questions: { event: { type: 'noul', instructions: 'Did the event occur?' } } };
    return graph;
}
const saved = graph => ({ schema: 1, enabled: true, graphs: { [graph.id]: graph }, activeGraphId: graph.id, nativeBindings: { workflowGraphId: graph.id }, subgraphLibrary: { definitions: {} }, ui: {} });

test('cold export scrubs qualified exposed connection controls while preserving similarly shaped story data', () => {
    const pin = id => ({ id, version: 1, semanticHash: 'sha256:' + id.slice(0, 1).repeat(64) });
    const inner = { ...pin('child'), parameters: [], body: { nodes: { each: { id: 'each', type: 'workflow', operation: 'for-each' }, prose: { id: 'prose', type: 'workflow', operation: 'model-call' }, story: { id: 'story', type: 'workflow', operation: 'text' } } } };
    const outer = { ...pin('holder'), body: { nodes: { child: { id: 'child', type: 'subgraph', definition: pin('child') } } }, parameters: [
        { id: 'bindings', target: { instancePath: ['child'], nodeId: 'each', controlId: 'roleOverrides' } },
        { id: 'profile', target: { instancePath: ['child'], nodeId: 'prose', controlId: 'profileId' } },
        { id: 'story', target: { instancePath: ['child'], nodeId: 'story', controlId: 'text' } },
    ] };
    const graph = fastGraph(); graph.definitions = { [definitionRefKey(inner)]: inner, [definitionRefKey(outer)]: outer };
    graph.nodes.wrapper = { id: 'wrapper', type: 'subgraph', definition: pin('holder'), parameterOverrides: { bindings: { analysis: { profileId: 'PRIVATE-ROLE', model: 'override' }, prose: { profileId: ACTIVE_PROFILE_ID } }, profile: 'PRIVATE-NODE', story: { profileId: 'authored-story' } } };
    const before = structuredClone(graph), portable = portableArchivedWorkflow(graph);
    assert.equal(portable.nodes.wrapper.parameterOverrides.bindings.analysis.profileId, null);
    assert.equal(portable.nodes.wrapper.parameterOverrides.profile, null);
    assert.equal(portable.nodes.wrapper.parameterOverrides.bindings.prose.profileId, ACTIVE_PROFILE_ID);
    assert.deepEqual(portable.nodes.wrapper.parameterOverrides.story, { profileId: 'authored-story' });
    assert.deepEqual(graph, before);
});

test('retired roots preserve formerly accepted null optional containers verbatim', async () => {
    const graph = fastGraph();
    for (const key of ['groups', 'roles', 'portals', 'definitions']) graph[key] = null;
    const host = await stateFor(saved(graph)), current = host.state.settings();
    assert.deepEqual(current.archivedWorkflows.graphs[graph.id], graph);
    assert.equal(host.saves(), 1);
});

test('retirement follows exposed helper pins, preserves their recovery closure and ignores note references', async () => {
    const pin = id => ({ id, version: 1, semanticHash: 'sha256:' + id.slice(0, 1).repeat(64) });
    const child = { ...pin('child'), parameters: [{ id: 'selected', target: { instancePath: [], nodeId: 'each', controlId: 'helper' } }], body: { nodes: { each: { id: 'each', type: 'workflow', operation: 'for-each', helper: pin('good') } } } };
    const retired = { ...pin('fast'), body: { nodes: fastGraph().nodes } }, good = { ...pin('good'), body: { nodes: {} } };
    const parent = { ...pin('parent'), body: { nodes: { child: { id: 'child', type: 'subgraph', definition: pin('child'), parameterOverrides: { selected: pin('fast') } } } } };
    const note = { ...pin('notes'), body: { nodes: { note: { id: 'note', type: 'note', definition: pin('fast'), helper: pin('fast') } } } };
    const definitions = Object.fromEntries([child, retired, good, parent, note].map(item => [definitionRefKey(item), item]));
    assert.deepEqual([...retiredLibraryKeys(definitions)].sort(), [definitionRefKey(retired), definitionRefKey(parent)].sort());
    const value = saved(starterGraph('unified-basic')); value.subgraphLibrary.definitions = definitions;
    const host = await stateFor(value), current = host.state.settings(), exported = JSON.parse(host.state.exportArchivedWorkflows());
    assert.ok(current.subgraphLibrary.definitions[definitionRefKey(child)]);
    assert.ok(current.subgraphLibrary.definitions[definitionRefKey(good)]);
    for (const item of [child, retired, good, parent]) assert.deepEqual(current.archivedWorkflows.definitions[definitionRefKey(item)], item);
    assert.ok(exported.definitions[definitionRefKey(child)]);
    assert.equal(Object.hasOwn(current.archivedWorkflows.definitions, definitionRefKey(note)), false);
});

test('a saved Fast Decision workflow becomes recoverable cold data without losing its original or running it', async () => {
    const graph = fastGraph(), original = structuredClone(graph);
    const host = await stateFor(saved(graph)), value = host.state.settings();
    assert.deepEqual(value.archivedWorkflows?.graphs?.[graph.id], original);
    assert.equal(Object.hasOwn(value.graphs, graph.id), false);
    assert.equal(value.graphs[value.activeGraphId].mode, 'native-unified');
    assert.equal(value.nativeBindings.workflowGraphId, null);
    assert.equal(value.enabled, false);
    assert.equal(host.saves(), 1);
    assert.equal(host.state.settings(), value);
    assert.equal(host.saves(), 1);
});

test('recovery export includes library-only archives and cannot import or expose local profile selectors', async () => {
    const graph = starterGraph('unified-basic'), value = saved(graph);
    const definition = { id: 'saved-library', version: 1, name: 'Original', semanticHash: 'sha256:' + 'a'.repeat(64), interface: [], parameters: [], body: { schema: 3, runtime: 2, mode: 'native-pre', nodes: { fast: { id: 'fast', type: 'workflow', operation: 'fast-decision', fastConnectionId: 'PRIVATE-FAST', fallbackProfileId: 'PRIVATE-TEXT', profileId: 'PRIVATE-TEXT' } }, wires: {}, roles: { analysis: { profileId: 'PRIVATE-ROLE' } } } };
    value.archivedWorkflows = { schema: 1, graphs: {}, definitions: { [definitionRefKey(definition)]: definition }, entries: { [definition.id]: { id: definition.id, version: 1, semanticHash: definition.semanticHash } }, bindings: {}, activeGraphId: null };
    const host = await stateFor(value), current = host.state.settings(), before = structuredClone(current);
    const json = host.state.exportArchivedWorkflows();
    assert.equal(typeof json, 'string');
    const recovery = JSON.parse(json);
    assert.equal(recovery.kind, 'lattice-workflow-archive');
    assert.equal(recovery.definitions[definitionRefKey(definition)].body.nodes.fast.operation, 'fast-decision');
    assert.doesNotMatch(json, /PRIVATE-/);
    assert.equal(parseWorkflow(json).ok, false);
    assert.deepEqual(current, before); assert.equal(host.saves(), 0);
});

test('retired library helpers and their dependent shelf heads remain recoverable while unrelated helpers remain available', async () => {
    const body = fastGraph('helper-body');
    body.mode = 'native-pre'; body.nodes = { fast: body.nodes.fast }; body.wires = {};
    // Original pin captured with the pre-retirement catalog; it cannot be recreated
    // through the current catalog once Fast Decision has been removed.
    Object.assign(body.nodes.fast, { modelRole: 'fastDecision', maxTokens: 2048, fallbackEnabled: false, fallbackAllowedCodes: [], fallbackProfileId: '' });
    const definition = { id: 'fast-helper', version: 1, name: 'Saved typed helper', description: '', body, interface: [], parameters: [], semanticHash: 'sha256:22dca83253b400dd6ac547a625033d5d3525a37748a37656c0b92b5f9f9d05b0' }, ref = { id: definition.id, version: definition.version, semanticHash: definition.semanticHash };
    const normal = starterGraph('unified-basic'), value = saved(normal);
    const parent = { id: 'parent-helper', version: 1, name: 'Saved parent', body: { schema: 3, runtime: 2, mode: 'native-pre', nodes: { child: { id: 'child', type: 'subgraph', definition: ref } }, wires: {}, groups: {}, roles: {}, portals: {}, definitions: {} }, interface: [], parameters: [] };
    const parentIdentity = computeDefinitionIdentity(parent); assert.equal(parentIdentity.ok, true);
    const parentDefinition = { ...parentIdentity.data.materializedDefinition, semanticHash: parentIdentity.data.semanticHash }, parentRef = { id: parentDefinition.id, version: parentDefinition.version, semanticHash: parentDefinition.semanticHash };
    const goodIdentity = computeDefinitionIdentity({ ...parent, id: 'ordinary-helper', body: { ...parent.body, nodes: { text: { id: 'text', type: 'workflow', operation: 'text', text: 'Keep me' } } } }); assert.equal(goodIdentity.ok, true);
    const good = { ...goodIdentity.data.materializedDefinition, semanticHash: goodIdentity.data.semanticHash }, goodRef = { id: good.id, version: good.version, semanticHash: good.semanticHash };
    value.subgraphLibrary = { definitions: { [definitionRefKey(ref)]: definition, [definitionRefKey(parentRef)]: parentDefinition, [definitionRefKey(goodRef)]: good }, entries: { [ref.id]: ref, [parentRef.id]: parentRef, [goodRef.id]: goodRef } };
    const original = structuredClone(value.subgraphLibrary), host = await stateFor(value), current = host.state.settings();
    assert.deepEqual(current.archivedWorkflows?.definitions?.[definitionRefKey(ref)], original.definitions[definitionRefKey(ref)]);
    assert.deepEqual(current.archivedWorkflows.definitions[definitionRefKey(parentRef)], original.definitions[definitionRefKey(parentRef)]);
    assert.deepEqual(current.subgraphLibrary, { definitions: { [definitionRefKey(goodRef)]: good }, entries: { [goodRef.id]: goodRef } });
    assert.equal(current.nativeBindings.workflowGraphId, normal.id); assert.equal(current.enabled, true);
    assert.equal(host.saves(), 1);
});

test('a mixed workspace preserves unrelated assignment and remains stable after a fresh settings admission', async () => {
    const retired = fastGraph(), good = starterGraph('unified-basic'), value = saved(retired);
    value.graphs[good.id] = good; value.nativeBindings.workflowGraphId = good.id;
    const host = await stateFor(value), current = host.state.settings();
    assert.equal(current.enabled, true); assert.equal(current.nativeBindings.workflowGraphId, good.id);
    assert.deepEqual(current.graphs, { [good.id]: good });
    assert.deepEqual(current.archivedWorkflows.graphs[retired.id], retired);
    const reload = await stateFor(structuredClone(current));
    assert.deepEqual(reload.state.settings(), current); assert.equal(reload.saves(), 0);
});

test('stage and Fast retirement share one atomic migration and preserve both originals', async () => {
    const fast = fastGraph(), old = { id: 'old-pre', schema: 3, runtime: 2, mode: 'native-pre', nodes: { text: { id: 'text', type: 'workflow', operation: 'text', text: 'Keep this.' } }, wires: {} };
    const value = saved(fast); value.graphs[old.id] = old;
    value.nativeBindings.preGraphId = old.id; value.nativeBindings.postGraphId = null;
    const host = await stateFor(value), current = host.state.settings();
    assert.deepEqual(current.archivedWorkflows.graphs, { [fast.id]: fast, [old.id]: old });
    assert.deepEqual(current.archivedWorkflows.bindings, { workflowGraphId: fast.id, preGraphId: old.id, postGraphId: null });
    assert.deepEqual(current.nativeBindings, { workflowGraphId: null });
    assert.equal(current.enabled, false); assert.equal(host.saves(), 1);
});

test('empty legacy settings retain the starter created during unified assignment migration', async () => {
    const value = saved(starterGraph('unified-basic'));
    value.graphs = {}; value.activeGraphId = null; value.nativeBindings = { preGraphId: null, postGraphId: null };
    const host = await stateFor(value), current = host.state.settings();
    assert.equal(Object.keys(current.graphs).length, 1);
    assert.equal(current.graphs[current.activeGraphId].mode, 'native-unified');
    assert.deepEqual(current.nativeBindings, { workflowGraphId: null });
    assert.equal(current.enabled, false); assert.equal(host.saves(), 1);
});

test('a read-only library prevents a mixed retirement before any graph or assignment changes', async () => {
    const graph = fastGraph(), value = saved(graph), definition = { id: 'saved-helper', version: 1, semanticHash: 'sha256:' + 'a'.repeat(64), body: { nodes: { fast: graph.nodes.fast } } };
    value.subgraphLibrary.definitions[definitionRefKey(definition)] = definition;
    const before = structuredClone(value);
    Object.defineProperty(value, 'subgraphLibrary', { enumerable: true, writable: false, value: value.subgraphLibrary });
    const host = await stateFor(value);
    assert.throws(() => host.state.settings(), /read.only/i);
    assert.deepEqual(value, before); assert.equal(host.saves(), 0);
});

test('unsafe or read-only recovery inputs reject before getters, authored data changes or saving', async () => {
    const value = saved(fastGraph()), before = structuredClone(value);
    Object.defineProperty(value, 'graphs', { enumerable: true, writable: false, value: value.graphs });
    const host = await stateFor(value);
    assert.throws(() => host.state.settings(), /read.only/i);
    assert.deepEqual(value, before); assert.equal(host.saves(), 0);
    const unsafe = saved(fastGraph()); let reads = 0;
    Object.defineProperty(unsafe, 'archivedWorkflows', { enumerable: true, get() { reads++; throw Error('Must not read'); } });
    const badHost = await stateFor(unsafe);
    assert.throws(() => badHost.state.settings(), /plain.data/i);
    assert.equal(reads, 0); assert.equal(badHost.saves(), 0);
});
