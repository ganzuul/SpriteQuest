import assert from 'node:assert/strict';
import { exportWorkflow, parseWorkflow } from '../src/workflow/packages.js';
const graph = { id: 'g', schema: 3, runtime: 2, mode: 'native-unified', roles: { Analysis: { profileId: 'private-profile', model: 'model-name' } }, nodes: {
    source: { id: 'source', type: 'workflow', operation: 'scene-context', profileId: 'local-profile' },
}, wires: {}, groups: {}, portals: {}, definitions: {} };
let exported;
assert.doesNotThrow(() => { exported = exportWorkflow(graph); }, 'unfinished schema3 authoring documents can be exported');
assert.deepEqual([exported.kind, exported.schema, exported.minRuntime], ['lattice-workflow', 2, 2]);
assert.equal(exported.graph.roles.Analysis.profileId, null);
assert.equal(exported.graph.roles.Analysis.model, 'model-name');
assert.equal(exported.graph.nodes.source.profileId, null);
assert.equal(graph.roles.Analysis.profileId, 'private-profile');
assert.deepEqual(parseWorkflow(JSON.stringify(exported)).data, exported.graph);
for (const pair of [[1, 2], [2, 1], [3, 2], [2, 3]]) {
    assert.equal(parseWorkflow(JSON.stringify({ ...exported, schema: pair[0], minRuntime: pair[1] })).error.code, 'UNSUPPORTED_PACKAGE');
}
assert.equal(parseWorkflow(JSON.stringify({ ...exported, schema: 1, minRuntime: 1 })).error.code, 'UNSUPPORTED_PACKAGE');
const oversize = { ...exported, graph: { ...exported.graph, description: '界'.repeat(700000) } };
assert.ok(JSON.stringify(oversize).length < 2000000);
assert.equal(parseWorkflow(JSON.stringify(oversize)).error.code, 'MALFORMED_WORKFLOW');
assert.throws(() => exportWorkflow(oversize.graph), /2,000,000 UTF-8 bytes/);
const old = { ...graph, schema: 2, runtime: 1, description: '界'.repeat(700000), nodes: {
    source: graph.nodes.source,
    plan: { id: 'plan', type: 'workflow', operation: 'response-plan' },
    output: { id: 'output', type: 'workflow', operation: 'guidance' },
}, wires: { a: { id: 'a', from: 'source', to: 'plan', order: 0 }, b: { id: 'b', from: 'plan', to: 'output', order: 0 } } };
assert.throws(() => exportWorkflow(old), /schema 3 and runtime 2/);
const oldEnvelope = { kind: 'lattice-workflow', schema: 1, minRuntime: 1, graph: old };
assert.equal(parseWorkflow(JSON.stringify(oldEnvelope)).error.code, 'MALFORMED_WORKFLOW', 'the byte bound applies before retired-package admission');
for (const kind of ['lattice-workflow', 'comfytavern-workflow']) {
    assert.equal(parseWorkflow(JSON.stringify({ ...oldEnvelope, kind, graph: { ...old, description: '' } })).error.code, 'UNSUPPORTED_PACKAGE');
}
assert.equal(parseWorkflow(JSON.stringify({ ...exported, graph: { ...graph, schema: 2, runtime: 1 } })).error.code, 'UNSUPPORTED_VERSION');
const privateGraph = { ...graph, recording: { text: 'private output' }, chat: [{ text: 'private chat' }], nodes: { source: { ...graph.nodes.source, candidate: { text: 'private candidate' } } } };
const portable = exportWorkflow(privateGraph);
assert.equal(portable.graph.recording, undefined);
assert.equal(portable.graph.chat, undefined);
assert.equal(portable.graph.nodes.source.candidate, undefined);
const nestedPrivate = { ...graph, roles: { Analysis: { profileId: 'local', model: 'model-name', recording: { text: 'private' } } }, groups: { g: { id: 'g', title: 'Group', recording: { text: 'private' } } }, view: { x: 1, y: 2, zoom: 1, recording: { text: 'private' } } };
const nestedPortable = exportWorkflow(nestedPrivate).graph;
assert.equal(nestedPortable.roles.Analysis.recording, undefined);
assert.equal(nestedPortable.groups.g.recording, undefined);
assert.equal(nestedPortable.view.recording, undefined);
const layout = { ...graph, groups: { g: { id: 'g', title: 'Group', x: 2, y: 3, w: 260, frame: { x: 2, y: 3, w: 560, h: 340 }, collapsed: false } } };
assert.deepEqual(parseWorkflow(JSON.stringify(exportWorkflow(layout))).data.groups, layout.groups, 'schema3 packages preserve existing group geometry');
assert.equal(parseWorkflow('{"kind":"lattice-workflow","schema":2,"minRuntime":2,"graph":{"__proto__":{}}}').ok, false);
assert.throws(() => exportWorkflow({ ...graph, get description() { throw new Error('getter invoked'); } }), /bounded plain/);
console.log('workflow-packages: ok');
