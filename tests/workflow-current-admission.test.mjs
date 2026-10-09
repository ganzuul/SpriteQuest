import assert from 'node:assert/strict';
import { exportWorkflow, parseWorkflow, exportSubgraph, parseSubgraph } from '../src/workflow/packages.js';
import * as contracts from '../src/workflow/contracts.js';
import { parseWorkflowInsertionFile, prepareWorkflowInsertion } from '../src/workflow/insertion.js';
import { siblingWorkflow } from './fixtures/workflow-prepared-fixture.mjs';

const graph = siblingWorkflow();
const envelope = exportWorkflow(graph);
const before = structuredClone(graph);
for (const rejected of [
    { ...envelope, kind: 'comfytavern-workflow' },
    { ...envelope, kind: 'sillycanvas-workflow' },
    { ...envelope, schema: 1, minRuntime: 1 },
    { ...envelope, graph: { schema: 1, nodes: {}, wires: {} } },
    { ...envelope, graph: { ...graph, schema: 2, runtime: 1 } },
    graph,
    { kind: 'prompt-canvas-graph', schema: 1, graph: { schema: 1, nodes: {}, wires: {} } },
]) {
    assert.equal(parseWorkflow(JSON.stringify(rejected)).ok, false, `reject ${rejected.kind ?? 'raw graph'} schema ${rejected.schema}`);
    assert.equal(parseWorkflowInsertionFile(JSON.stringify(rejected)).ok, false, 'additive file admission uses the same current-only boundary');
}
assert.deepEqual(graph, before);
assert.equal(typeof contracts.isWorkflowGraph, 'function');
assert.equal(contracts.isWorkflowGraph(graph), true);
let reads = 0;
for (const malformed of [null, [], {}, { ...graph, schema: 1 }, { ...graph, schema: 2, runtime: 1 }, { ...graph, get schema() { reads++; return 3; } }, Object.assign(Object.create({ schema: 3 }), graph)]) {
    assert.equal(contracts.isWorkflowGraph(malformed), false);
    assert.equal(contracts.validateGraphStructure(malformed).ok, false);
}
assert.equal(reads, 0, 'classification and validation never execute getters');
for (const malformed of [{ ...graph, get annotation() { reads++; return 'unsafe'; } }, { ...graph, nodes: { get node() { reads++; return {}; } } }]) assert.equal(contracts.isWorkflowGraph(malformed), false);
const drawingScope = { schema: 3, runtime: 2, mode: 'native-pre', nodes: { boundary: { id: 'boundary', type: 'subgraph-input', interfacePortId: 'in' } }, wires: {} };
assert.equal(contracts.isWorkflowGraph(drawingScope), true, 'classification does not resolve the prepared drawing scope');
assert.equal(contracts.validateGraphStructure(drawingScope).error.code, 'ROOT_BOUNDARY', 'strict admission remains separate from classification');
const nestedAccessor = { ...drawingScope, nodes: { primitive: { id: 'primitive', type: 'workflow', get operation() { reads++; return 'scene-context'; } } } };
assert.equal(contracts.isWorkflowGraph(nestedAccessor), true, 'classification does not walk primitive controls or call the resolver');
assert.equal(contracts.validateGraphStructure(nestedAccessor).ok, false);
assert.equal(reads, 0);
const { cloneWorkflowDocument } = await import('../src/workflow/document.js');
const unfinished = { id: 'unfinished', schema: 3, runtime: 2, mode: 'native-pre', nodes: { source: { id: 'source', type: 'workflow', operation: 'scene-context' } }, wires: {} };
const cloned = cloneWorkflowDocument(unfinished);
assert.equal(cloned.ok, true);
assert.deepEqual([cloned.data.groups, cloned.data.roles, cloned.data.portals, cloned.data.definitions], [{}, {}, {}, {}]);
cloned.data.nodes.source.alias = 'Detached';
assert.equal(unfinished.nodes.source.alias, undefined);
assert.equal(parseWorkflow(JSON.stringify(exportWorkflow(unfinished))).ok, true);
assert.equal(contracts.validateWorkflow(unfinished).error.code, 'MISSING_TERMINAL');
for (const retired of [{ ...unfinished, schema: 2, runtime: 1 }, { schema: 1, nodes: {}, wires: {} }]) {
    assert.equal(cloneWorkflowDocument(retired).error.code, 'UNSUPPORTED_VERSION');
    assert.equal(prepareWorkflowInsertion(unfinished, retired).ok, false);
}
const definition = Object.values(graph.definitions)[0];
const subgraph = exportSubgraph(definition, graph.definitions);
assert.deepEqual([subgraph.kind, subgraph.schema, subgraph.minRuntime], ['lattice-subgraph', 1, 2]);
assert.equal(subgraph.definition.semanticHash, definition.semanticHash, 'portable snapshots retain exact semantic pins');
assert.deepEqual(subgraph.definitions, {}, 'standalone export includes only the dependency closure and omits its duplicate top snapshot');
assert.deepEqual(Object.keys(envelope.graph.definitions), Object.keys(graph.definitions), 'portable current workflow pins retain the owning table identities');
assert.equal(parseSubgraph(JSON.stringify(subgraph)).ok, true, 'current standalone subgraph envelope schema 1 remains supported');
for (const oversized of [{ ...envelope, graph: { ...envelope.graph, description: '界'.repeat(700000) } }, { ...subgraph, definition: { ...subgraph.definition, description: '界'.repeat(700000) } }]) {
    const json = JSON.stringify(oversized);
    assert.ok(json.length < 2000000);
    assert.equal((oversized.kind === 'lattice-subgraph' ? parseSubgraph : parseWorkflow)(json).error.code, 'MALFORMED_WORKFLOW');
}
console.log('workflow-current-admission: ok');
