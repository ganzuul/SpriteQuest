import test from 'node:test';
import assert from 'node:assert/strict';
import { starterGraph } from '../src/workflow/starters.js';
import { definitionRefKey } from '../src/workflow/definition-data.js';
let sequence = 0;
async function host(value) {
    let saves = 0;
    globalThis.SillyTavern = { getContext: () => ({ extensionSettings: { lattice: value }, saveSettingsDebounced() { saves++; } }) };
    const state = await import('../src/state.js?integrated-fast-retirement=' + ++sequence);
    return { state, saves: () => saves };
}
const settings = () => ({ schema: 2, enabled: true, ui: {}, subgraphLibrary: { definitions: {}, entries: {} }, migrationRecovery: [], recoveryDraft: null });
const fastGraph = () => {
    const graph = starterGraph('unified-basic'); graph.id = 'cold-fast-document';
    graph.nodes.fast = { id: 'fast', type: 'workflow', operation: 'fast-decision', fastConnectionId: 'PRIVATE-FAST', fallbackProfileId: 'PRIVATE-TEXT' };
    return graph;
};
test('schema-2 Fast recovery drafts are archived once without becoming the active document', async () => {
    const value = settings(), graph = fastGraph(); value.recoveryDraft = { graph, workspaceViews: null };
    const original = structuredClone(graph), { state, saves } = await host(value);
    const admitted = state.settings();
    assert.deepEqual(admitted.archivedWorkflows.graphs[graph.id], original);
    assert.equal(admitted.recoveryDraft.graph.mode, 'native-unified');
    assert.notEqual(state.activeWorkflow().id, graph.id);
    assert.equal(admitted.enabled, false);
    assert.equal(admitted.migrationRecovery.filter(item => item.id === 'retired-recovery-draft').length, 1);
    assert.equal(saves(), 1); state.settings(); assert.equal(saves(), 1);
    assert.doesNotMatch(state.exportArchivedWorkflows(), /PRIVATE-/);
    assert.deepEqual(admitted.archivedWorkflows.graphs[graph.id], original);
});
test('schema-2 helper retirement preserves cold pins and unreadable recovery originals atomically', async () => {
    const value = settings(), original = { get unavailable() { throw Error('Unreadable original must remain untouched'); } };
    value.migrationRecovery.push({ id: 'unreadable', name: 'Earlier recovery', original });
    const definition = { id: 'fast-helper', version: 1, semanticHash: 'sha256:' + 'a'.repeat(64), body: { nodes: { fast: fastGraph().nodes.fast } } };
    const ref = { id: definition.id, version: 1, semanticHash: definition.semanticHash }, key = definitionRefKey(ref);
    value.subgraphLibrary.definitions[key] = definition; value.subgraphLibrary.entries[ref.id] = ref;
    const { state, saves } = await host(value); state.settings();
    assert.equal(value.migrationRecovery[0].original, original);
    assert.deepEqual(value.archivedWorkflows.definitions[key], definition);
    assert.deepEqual(value.archivedWorkflows.entries[ref.id], ref);
    assert.equal(Object.hasOwn(value.subgraphLibrary.definitions, key), false);
    assert.equal(Object.hasOwn(value.subgraphLibrary.entries, ref.id), false);
    assert.equal(saves(), 1); state.settings(); assert.equal(saves(), 1);
});
test('read-only schema-2 retirement leaves the complete original settings untouched', async () => {
    const value = settings(), graph = fastGraph(); value.recoveryDraft = { graph, workspaceViews: null };
    Object.defineProperty(value, 'archivedWorkflows', { configurable: true, enumerable: true, writable: false, value: undefined });
    const before = structuredClone(value), { state, saves } = await host(value);
    assert.throws(() => state.settings(), /read-only/);
    assert.deepEqual(value, before); assert.equal(saves(), 0);
});
test('a read-only recovery draft blocks helper retirement before document authority changes', async () => {
    const prior = await host(settings()); prior.state.settings();
    const graph = prior.state.activeWorkflow(), token = prior.state.documentSession.capture();
    const value = settings(), definition = { id: 'cold-helper', version: 1, semanticHash: 'a'.repeat(64), body: { nodes: { fast: fastGraph().nodes.fast } } };
    value.subgraphLibrary.definitions[definitionRefKey(definition)] = definition;
    Object.defineProperty(value, 'recoveryDraft', { enumerable: true, configurable: true, writable: false, value: null });
    const before = structuredClone(value), next = await host(value);
    assert.throws(() => next.state.settings(), /read-only/);
    assert.deepEqual(value, before); assert.equal(next.saves(), 0);
    assert.equal(next.state.documentSession.current(), graph);
    assert.equal(next.state.documentSession.stillCurrent(token), true);
});
test('occupied recovery IDs retain each distinct retired draft envelope', async () => {
    const value = settings(), graph = fastGraph();
    const earlier = { graph: { ...graph, id: 'earlier-fast' }, workspaceViews: null };
    value.migrationRecovery.push({ id: 'retired-recovery-draft', original: earlier });
    const original = { graph, workspaceViews: { authoredPresentation: 'Keep exact recovery presentation' } };
    value.recoveryDraft = original;
    const { state } = await host(value); state.settings();
    assert.equal(value.migrationRecovery.length, 2);
    assert.equal(new Set(value.migrationRecovery.map(item => item.id)).size, 2);
    assert.ok(value.migrationRecovery.some(item => item.original === original));
    assert.ok(value.archivedWorkflows.graphs['earlier-fast']);
});
test('conflicting activatable and original retired recovery identities reject atomically', async () => {
    const value = settings(), graph = fastGraph();
    value.migrationRecovery.push({ id: graph.id, graph, original: { ...graph, name: 'Different authored original' } });
    const before = structuredClone(value), { state, saves } = await host(value);
    assert.throws(() => state.settings(), /identity conflicts/);
    assert.deepEqual(value, before); assert.equal(saves(), 0);
});
test('a fixed recovery array length rejects retirement before any authored settings change', async () => {
    const value = settings(), definition = { id: 'cold-helper', version: 1, semanticHash: 'a'.repeat(64), body: { nodes: { fast: fastGraph().nodes.fast } } };
    value.subgraphLibrary.definitions[definitionRefKey(definition)] = definition;
    value.recoveryDraft = { graph: { id: 'unreadable-draft' } };
    Object.defineProperty(value.migrationRecovery, 'length', { writable: false });
    const before = structuredClone(value), { state, saves } = await host(value);
    assert.throws(() => state.settings(), /read-only/);
    assert.deepEqual(value, before); assert.equal(saves(), 0);
});
test('recognizable malformed Fast recovery is retained and disables its fallback document', async () => {
    const value = settings(), graph = fastGraph(); delete graph.wires;
    const original = { graph, workspaceViews: null }; value.recoveryDraft = original;
    const { state } = await host(value); state.settings();
    assert.equal(value.enabled, false);
    assert.ok(value.migrationRecovery.some(entry => entry.original === original));
    assert.notEqual(state.activeWorkflow().id, graph.id);
});
