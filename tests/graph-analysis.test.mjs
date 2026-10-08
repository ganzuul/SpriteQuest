import assert from 'node:assert/strict';
import { createGraphAnalysis } from '../src/ui/graph-analysis.js';
let countRuns = 0, levelRuns = 0;
const analysis = createGraphAnalysis({ counts: () => { countRuns++; return new Map([['a', 3]]); }, levels: g => { levelRuns++; return [[g.nodes.a]]; }, group: () => new Set(['a']) });
const graph = { nodes: { a: { id: 'a', title: 'A', enabled: true } }, wires: {}, groups: {}, view: { x: 0, y: 0, zoom: 1 } };
const first = analysis.prepare(graph);
for (let i = 0; i < 100; i++) assert.equal(analysis.prepare(graph), first);
assert.equal(first.counts.get('a'), 3);
assert.equal(countRuns, 1, 'card projections share one emission analysis');
assert.equal(levelRuns, 1, 'cards share one level analysis');
graph.view.zoom = 2;
assert.equal(analysis.prepare(graph), first, 'camera work does not invalidate analysis');
graph.nodes.a.enabled = false;
assert.notEqual(analysis.prepare(graph), first, 'a graph edit invalidates the projection');
assert.equal(countRuns, 2); assert.equal(levelRuns, 2);
for (const schema of [2, 3, 99]) {
    graph.schema = schema;
    const native = analysis.prepare(graph);
    assert.equal(native.counts.size, 0, 'switching a cached legacy graph to native clears legacy analysis');
    assert.deepEqual(native.waves, []);
    graph.view.zoom += 0.1;
    assert.equal(analysis.prepare(graph), native, 'native camera changes retain empty projection');
}
assert.equal(countRuns, 2, 'all native versions skip legacy emission work');
assert.equal(levelRuns, 2, 'all native versions skip legacy scheduling');
console.log('graph-analysis: ok');
