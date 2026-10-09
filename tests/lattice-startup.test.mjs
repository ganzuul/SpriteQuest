import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as S from '../src/state.js?v=0.20.0';

function host(extensionSettings = {}) {
    let effects = 0;
    const context = { extensionSettings, saveSettingsDebounced() { effects++; } };
    globalThis.SillyTavern = { getContext: () => context };
    return { context, effects: () => effects };
}

test('fresh Lattice opens a current zero-call starter without reading old settings', () => {
    const root = {};
    Object.defineProperty(root, 'prompt-canvas', { enumerable: true, get() { throw new Error('Old settings must not be read'); } });
    const h = host(root), settings = S.settings(), graph = S.getGraph(settings.activeGraphId);
    assert.equal(S.MODULE, 'lattice');
    assert.equal(root.lattice, settings);
    assert.equal(settings.schema, 1);
    assert.equal(settings.enabled, false);
    assert.deepEqual(settings.nativeBindings, { preGraphId: null, postGraphId: null });
    assert.equal(Object.hasOwn(settings, 'workflowMode'), false);
    assert.equal(graph.schema, 3); assert.equal(graph.runtime, 2);
    assert.equal(graph.template.id, 'structured-guidance');
    assert.equal(Object.values(graph.nodes).some(node => ['smart-compactor', 'response-plan', 'repair'].includes(node.operation)), false);
    assert.equal(h.effects(), 0);
    assert.equal(S.settings(), settings); assert.equal(S.getGraph(graph.id), graph);
});

test('saved retired or malformed Lattice documents fail without replacing data', () => {
    for (const graph of [{ id: 'old', schema: 1, nodes: {}, wires: {} }, { id: 'early', schema: 2, runtime: 1, mode: 'native-pre', nodes: {}, wires: {} }]) {
        const stored = { schema: 1, enabled: false, activeGraphId: graph.id, graphs: { [graph.id]: graph }, nativeBindings: { preGraphId: null, postGraphId: null }, subgraphLibrary: { definitions: {} }, ui: {} };
        const before = structuredClone(stored), h = host({ lattice: stored });
        assert.throws(() => S.settings(), /workflow|document|schema|runtime/i);
        assert.deepEqual(stored, before); assert.equal(h.effects(), 0);
    }
});

test('current CRUD does not assign execution and imports reject retired packages atomically', () => {
    host(); const settings = S.settings();
    const created = S.createGraph('New workflow'), copy = S.duplicateGraph(created.id);
    assert.equal(created.schema, 3); assert.equal(copy.runtime, 2); assert.notEqual(copy.id, created.id);
    const before = structuredClone(settings);
    const rejected = S.importGraph(JSON.stringify({ kind: 'prompt-canvas-graph', schema: 1, graph: { nodes: {}, wires: {} } }));
    assert.equal(rejected.ok, false); assert.deepEqual(settings, before);
    S.deleteGraph(created.id); assert.equal(S.getGraph(created.id), null);
    assert.equal(settings.enabled, false); assert.deepEqual(settings.nativeBindings, { preGraphId: null, postGraphId: null });
});
