import test from 'node:test';
import assert from 'node:assert/strict';
import * as preparation from '../src/ui/workspace-preparation.js?v=0.27.0';
import { prepareGraphArtifacts } from '../src/workflow/graph-artifacts.js?v=0.27.0';
import { makeLocalCopy } from '../src/workflow/definition-library.js?v=0.27.0';
import { nodeCard } from '../src/canvas/presentation.js?v=0.27.0';
import { fixtureGraph } from './helpers/workflow-fixtures.mjs';
import { siblingWorkflow } from './fixtures/workflow-prepared-fixture.mjs';
import { effectiveInstanceWorkflow } from './fixtures/workflow-effective-instance.mjs';

const dynamicRoot = () => {
    const graph = fixtureGraph('structured-guidance');
    graph.nodes['compose-json'].presentation = { alias: 'Placement 🌿', compact: true };
    graph.nodes['compose-json'].modifiers = [{ id: 'trim', type: 'trim', version: 1, enabled: true, settings: { edges: 'both' } }];
    return graph;
};
const privateBoundary = () => { const result = makeLocalCopy(siblingWorkflow(), { instancePath: ['first/path'], id: 'placement-owned' }); assert.equal(result.ok, true); return result.data.candidate; };
const unpositioned = () => ({ id: 'unpositioned', schema: 3, runtime: 2, mode: 'native-unified', nodes: { first: { id: 'first', type: 'workflow', operation: 'text', phase: 'pre', text: 'First' }, second: { id: 'second', type: 'workflow', operation: 'text', phase: 'pre', text: 'Second' } }, wires: {}, groups: {}, roles: {}, portals: {}, definitions: {} });
for (const [label, create, nodeId, viewPath] of [
    ['dynamic root card', dynamicRoot, 'compose-json', []],
    ['named wrapper pins', siblingWorkflow, 'first/path', []],
    ['private input boundary', privateBoundary, 'entry', ['first/path']],
    ['nested effective controls', () => effectiveInstanceWorkflow(true), 'compact', ['one', 'left']],
    ['fallback coordinates', unpositioned, 'second', []],
]) test('single-card placement matches full workspace for ' + label, () => {
    assert.equal(typeof preparation.prepareNodePlacement, 'function');
    const root = create(), before = structuredClone(root), admitted = prepareGraphArtifacts(root); assert.equal(admitted.ok, true, JSON.stringify(admitted.error));
    const full = preparation.prepareWorkspaceViews(root, { artifacts: admitted.data }); assert.equal(full.ok, true, JSON.stringify(full.error));
    const expected = full.data.preparedViews.find(view => JSON.stringify(view.identity.instancePath ?? []) === JSON.stringify(viewPath)).drawBase;
    const placement = preparation.prepareNodePlacement(root, { nodeId, viewPath, artifacts: admitted.data }); assert.equal(placement.ok, true, JSON.stringify(placement.error));
    const { graph, node } = placement.data;
    assert.deepEqual(Object.keys(graph.nodes), [nodeId]); assert.deepEqual(Object.keys(graph.nativeCards), [nodeId]); assert.equal(node, graph.nodes[nodeId]);
    assert.deepEqual(node, expected.nodes[nodeId]); assert.deepEqual(graph.nativeCards[nodeId], expected.nativeCards[nodeId]);
    assert.deepEqual(nodeCard(node, { graph }), nodeCard(expected.nodes[nodeId], { graph: expected }));
    assert.deepEqual(root, before); assert.equal(Object.isFrozen(node), false);
    node.title = 'local measurement'; graph.nativeCards[nodeId].canonicalTitle = 'local metadata';
    assert.notEqual(root.nodes[nodeId]?.title, 'local measurement'); assert.notEqual(expected.nativeCards[nodeId].canonicalTitle, 'local metadata');
    assert.deepEqual(root, before, 'local measurement changes never mutate the root or nested definition');
});

test('single-card placement rejects forged or stale artifacts and unknown qualified nodes', () => {
    assert.equal(typeof preparation.prepareNodePlacement, 'function');
    const root = dynamicRoot(), artifacts = prepareGraphArtifacts(root).data, nodeId = 'compose-json';
    for (const token of [{}, structuredClone(artifacts), prepareGraphArtifacts(unpositioned()).data]) {
        assert.equal(preparation.prepareNodePlacement(root, { nodeId, artifacts: token }).error.code, 'INVALID_GRAPH_ARTIFACTS');
    }
    for (const options of [{ nodeId: 'absent' }, { nodeId, viewPath: ['absent'] }, { nodeId: 'constructor' }]) assert.equal(preparation.prepareNodePlacement(root, { ...options, artifacts }).ok, false);
    root.nodes[nodeId].title = 'raw change'; assert.equal(preparation.prepareNodePlacement(root, { nodeId, artifacts }).error.code, 'INVALID_GRAPH_ARTIFACTS');
    const fresh = preparation.prepareNodePlacement(root, { nodeId }); assert.equal(fresh.ok, true); assert.equal(fresh.data.node.title, 'raw change');
    let reads = 0; Object.defineProperty(root.nodes[nodeId], 'title', { enumerable: true, get() { reads++; throw Error('getter'); } });
    assert.equal(preparation.prepareNodePlacement(root, { nodeId }).ok, false); assert.equal(reads, 0);
});

test('single-card placement clones only its selected drawing node and metadata', () => {
    assert.equal(typeof preparation.prepareNodePlacement, 'function');
    const root = { id: 'placement-counts', schema: 3, runtime: 2, mode: 'native-unified', nodes: Object.fromEntries(Array.from({ length: 100 }, (_, index) => ['n' + index, { id: 'n' + index, type: 'workflow', operation: 'text', phase: 'pre', x: index * 10, y: 50, text: 'Content ' + index }])), wires: {}, groups: {}, roles: {}, portals: {}, definitions: {} };
    const artifacts = prepareGraphArtifacts(root).data, clone = globalThis.structuredClone, graphNodeCounts = []; let drawClones = 0;
    globalThis.structuredClone = function(value, ...options) {
        if (new Error().stack.includes('prepareEditorDrawBase')) {
            drawClones++; if (value?.nodes) graphNodeCounts.push(Object.keys(value.nodes).length);
        }
        return clone(value, ...options);
    };
    let placement;
    try { placement = preparation.prepareNodePlacement(root, { nodeId: 'n99', artifacts }); }
    finally { globalThis.structuredClone = clone; }
    assert.equal(placement.ok, true, JSON.stringify(placement.error));
    assert.deepEqual(graphNodeCounts, [1], 'the drawing clone never copies all authored nodes and discards them');
    assert.ok(drawClones <= 3, 'only selected graph/defaults/control descriptors are cloned, calls=' + drawClones);
});
