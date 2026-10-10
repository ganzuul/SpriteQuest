import assert from 'node:assert/strict';
import { test } from 'node:test';
import { exportWorkflow, parseWorkflow } from '../src/workflow/packages.js';
import { validateGraphStructure, validateWorkflow } from '../src/workflow/contracts.js';
import { operationDefaults } from '../src/workflow/catalog.js';
import { computeDefinitionIdentity, definitionRefKey } from '../src/workflow/definitions.js';

const legacyGraph = (id = 'old-pre', mode = 'native-pre') => ({ id, name: 'Saved scene tool', description: '', schema: 3, runtime: 2, mode, nodes: { text: { id: 'text', type: 'workflow', operation: 'text', operationVersion: 1, text: 'Keep this authored text.' } }, wires: {}, groups: {}, roles: {}, portals: {}, definitions: {}, view: { x: 4, y: 7, zoom: 1 } });
function savedSettings(graph) {
    return { schema: 1, enabled: true, activeGraphId: graph.id, graphs: { [graph.id]: graph }, nativeBindings: { preGraphId: graph.mode === 'native-pre' ? graph.id : null, postGraphId: graph.mode === 'native-post' ? graph.id : null }, subgraphLibrary: { definitions: {} }, ui: {} };
}
let sequence = 0;
async function stateFor(value) {
    let saves = 0;
    const context = { extensionSettings: { lattice: value }, saveSettingsDebounced() { saves++; } };
    globalThis.SillyTavern = { getContext: () => context };
    const state = await import('../src/state.js?retirement=' + ++sequence);
    return { state, context, saves: () => saves };
}

test('retiring a saved Pre root preserves its original and opens an unassigned disabled unified workflow', async () => {
    const graph = legacyGraph(), original = structuredClone(graph), value = savedSettings(graph);
    const host = await stateFor(value), current = host.state.settings();
    assert.deepEqual(current.archivedWorkflows?.graphs?.[graph.id], original);
    assert.deepEqual(current.archivedWorkflows.bindings, { preGraphId: graph.id, postGraphId: null });
    assert.equal(current.archivedWorkflows.activeGraphId, graph.id);
    assert.equal(Object.hasOwn(current.graphs, graph.id), false);
    assert.equal(current.graphs[current.activeGraphId].mode, 'native-unified');
    assert.deepEqual(current.nativeBindings, { workflowGraphId: null });
    assert.equal(current.enabled, false);
    assert.equal(host.saves(), 1);
    assert.equal(host.state.settings(), current);
    assert.equal(host.saves(), 1);
});

test('archived originals export portable recovery data without local connections or assignment effects', async () => {
    const graph = legacyGraph('old-post', 'native-post');
    graph.nodes.text.profileId = 'local-private-profile';
    const host = await stateFor(savedSettings(graph));
    const current = host.state.settings(), before = structuredClone(current);
    assert.equal(typeof host.state.exportArchivedWorkflows, 'function');
    const exported = JSON.parse(host.state.exportArchivedWorkflows());
    assert.equal(exported.kind, 'lattice-workflow-archive');
    assert.equal(exported.graphs[graph.id].mode, 'native-post');
    assert.equal(exported.graphs[graph.id].nodes.text.text, 'Keep this authored text.');
    assert.equal(JSON.stringify(exported).includes('local-private-profile'), false);
    assert.deepEqual(current, before);
    assert.equal(host.saves(), 1);
});

test('a retired root package cannot reactivate an archived workflow through import', async () => {
    const graph = legacyGraph(), host = await stateFor(savedSettings(graph));
    const current = host.state.settings(), before = structuredClone(current), saves = host.saves();
    const json = JSON.stringify(exportWorkflow(graph));
    assert.equal(parseWorkflow(json).ok, false);
    const imported = host.state.importGraph(json);
    assert.equal(imported.ok, false);
    assert.equal(imported.error.code, 'WRONG_PHASE');
    assert.deepEqual(current, before);
    assert.equal(host.saves(), saves);
});

test('recovery removes Fast Decision selectors from roots, nested pins and exposed overrides without editing originals', async () => {
    const fast = id => ({ id, type: 'workflow', operation: 'fast-decision', operationVersion: 1, ...operationDefaults('fast-decision'), fastConnectionId: 'private-fast-selector', fallbackEnabled: true, fallbackProfileId: 'private-text-selector', fallbackAllowedCodes: ['RATE_LIMITED'] });
    const finalize = draft => {
        const checked = computeDefinitionIdentity(draft);
        assert.equal(checked.ok, true, JSON.stringify(checked.error));
        return { ...checked.data.materializedDefinition, semanticHash: checked.data.semanticHash };
    };
    const ref = definition => ({ id: definition.id, version: definition.version, semanticHash: definition.semanticHash });
    const parameters = instancePath => ['fastConnectionId', 'fallbackProfileId', 'fallbackEnabled'].map(controlId => ({ id: controlId, label: controlId, target: { instancePath, nodeId: 'fast', controlId } }));
    const overrides = { fastConnectionId: 'private-override-fast', fallbackProfileId: 'private-override-text', fallbackEnabled: true };
    const child = finalize({ id: 'fast-child', version: 1, name: 'Fast child', interface: [], parameters: parameters([]), body: { schema: 3, runtime: 2, mode: 'native-pre', nodes: { fast: fast('fast') }, wires: {} } });
    const parent = finalize({ id: 'fast-parent', version: 1, name: 'Fast parent', interface: [], parameters: parameters(['child']), body: { schema: 3, runtime: 2, mode: 'native-pre', nodes: { child: { id: 'child', type: 'subgraph', definition: ref(child), parameterOverrides: overrides, roleOverrides: {}, nodeBindingOverrides: {} } }, wires: {} } });
    const graph = legacyGraph();
    graph.nodes.fast = fast('fast');
    graph.nodes.parent = { id: 'parent', type: 'subgraph', definition: ref(parent), parameterOverrides: overrides, roleOverrides: {}, nodeBindingOverrides: {} };
    graph.definitions = { [definitionRefKey(child)]: child, [definitionRefKey(parent)]: parent };
    const original = structuredClone(graph), host = await stateFor(savedSettings(graph));
    const current = host.state.settings(), exported = JSON.parse(host.state.exportArchivedWorkflows()).graphs[graph.id];
    assert.doesNotMatch(JSON.stringify(exported), /private-(?:fast|text|override)/);
    assert.deepEqual(current.archivedWorkflows.graphs[graph.id], original);
    assert.deepEqual(exported.nodes.parent.parameterOverrides, { fastConnectionId: '', fallbackProfileId: '', fallbackEnabled: false });
    for (const document of [exported, ...Object.values(exported.definitions).map(item => item.body)]) {
        for (const node of Object.values(document.nodes)) if (node.operation === 'fast-decision') {
            assert.equal(node.fastConnectionId, ''); assert.equal(node.fallbackProfileId, ''); assert.equal(node.fallbackEnabled, false);
            assert.deepEqual(node.fallbackAllowedCodes, ['RATE_LIMITED']);
        }
    }
    assert.equal(validateGraphStructure(exported).ok, true);
    assert.equal(host.saves(), 1);
});

test('legacy stage bodies remain structurally valid but cannot be admitted as executable roots', () => {
    const graph = legacyGraph();
    assert.equal(validateGraphStructure(graph).ok, true);
    const checked = validateWorkflow(graph);
    assert.equal(checked.ok, false);
    assert.equal(checked.error.code, 'WRONG_PHASE');
});

test('a mixed workspace keeps its assigned unified workflow enabled and archives only retired roots once across reloads', async () => {
    const graph = legacyGraph(), value = savedSettings(graph);
    const { starterGraph } = await import('../src/workflow/starters.js');
    const unified = starterGraph('unified-basic');
    value.graphs[unified.id] = unified; value.nativeBindings.workflowGraphId = unified.id;
    const host = await stateFor(value), current = host.state.settings();
    assert.equal(current.activeGraphId, unified.id);
    assert.deepEqual(current.graphs, { [unified.id]: unified });
    assert.equal(current.enabled, true);
    assert.deepEqual(current.nativeBindings, { workflowGraphId: unified.id });
    const reloaded = await stateFor(structuredClone(current));
    assert.deepEqual(reloaded.state.settings(), current);
    assert.equal(reloaded.saves(), 0);
});

test('retirement refuses a read-only settings replacement before changing any authored state', async () => {
    const value = savedSettings(legacyGraph()), before = structuredClone(value);
    Object.defineProperty(value, 'graphs', { value: value.graphs, enumerable: true, writable: false });
    const host = await stateFor(value);
    assert.throws(() => host.state.settings(), /read.only/i);
    assert.deepEqual(value, before);
    assert.equal(host.saves(), 0);
});

test('archive accessors and conflicting originals reject without reads, mutations or saves', async () => {
    const graph = legacyGraph(); let reads = 0;
    const accessor = savedSettings(graph);
    Object.defineProperty(accessor, 'archivedWorkflows', { enumerable: true, get() { reads++; throw Error('Must not read archive getter'); } });
    const unsafe = await stateFor(accessor);
    assert.throws(() => unsafe.state.settings(), /plain.data/i);
    assert.equal(reads, 0); assert.equal(unsafe.saves(), 0);
    const conflict = savedSettings(graph), original = structuredClone(graph);
    original.nodes.text.text = 'An earlier original';
    conflict.archivedWorkflows = { schema: 1, graphs: { [graph.id]: original }, bindings: { preGraphId: graph.id, postGraphId: null }, activeGraphId: graph.id };
    const before = structuredClone(conflict), host = await stateFor(conflict);
    assert.throws(() => host.state.settings(), /identity conflicts/i);
    assert.deepEqual(conflict, before); assert.equal(host.saves(), 0);
});
