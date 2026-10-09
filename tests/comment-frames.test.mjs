import assert from 'node:assert/strict';
import { test } from 'node:test';
import { exportWorkflow, parseWorkflow, exportSubgraph, parseSubgraph } from '../src/workflow/packages.js';
import { computeDefinitionIdentity } from '../src/workflow/definitions.js';
import { graphSemanticSignature } from '../src/workflow/ports.js';
import { validateGraphStructure } from '../src/workflow/contracts.js';
import { resolveWorkflow } from '../src/workflow/resolve.js';
import { makeClip, readClip, prepareClipPaste } from '../src/workflow/clipboard.js';
import { commitGraphDocument, undo, redo } from '../src/history.js';
import * as comments from '../src/canvas/comment-frames.js';

const graph = (nodes = {}) => ({ id: 'comments', schema: 3, runtime: 2, mode: 'native-pre', nodes, wires: {}, groups: {}, roles: {}, portals: {}, definitions: {} });
const measured = node => node.measured ?? { x: node.x, y: node.y, w: node.w, h: node.h };

test('creation surrounds selected measured bounds without inserting or executing a group', () => {
    assert.equal(typeof comments.createCommentFrame, 'function');
    const source = graph({
        first: { id: 'first', type: 'workflow', operation: 'scene-context', x: 1, y: 2, measured: { x: 100, y: 200, w: 260, h: 160 } },
        second: { id: 'second', type: 'note', x: 400, y: 260, w: 100, h: 90 },
        existing: { id: 'existing', type: 'note', commentFrame: true, x: -1000, y: -1000, w: 2000, h: 2000 },
    });
    const before = structuredClone(source);
    const frame = comments.createCommentFrame(source, ['first', 'second', 'existing', 'missing', 'first'], measured, { id: 'authored', title: 'Context', content: 'Line one\nLine two', color: '#637d89' });
    assert.deepEqual(frame, { id: 'authored', type: 'note', commentFrame: true, moveContents: true, title: 'Context', content: 'Line one\nLine two', color: '#637d89', x: 76, y: 140, w: 448, h: 244 });
    assert.deepEqual(source, before);
    assert.equal(frame.inGroup, undefined);
    assert.equal(frame.memberIds, undefined);
});

test('empty selection creates a finite useful frame at the graph cursor with collision-safe identity', () => {
    const source = graph({ comment_1: { id: 'comment_1', type: 'note' }, comment_2: { id: 'comment_2', type: 'note' } });
    const frame = comments.createCommentFrame(source, ['missing', '__proto__', 'constructor'], () => undefined, { at: { x: -120, y: 85 }, moveContents: false });
    assert.deepEqual(frame, { id: 'comment_3', type: 'note', commentFrame: true, moveContents: false, title: 'Comment', content: '', color: '#637d89', x: -120, y: 85, w: 360, h: 220 });
    const fallback = comments.createCommentFrame(source, [], measured, { id: '__proto__', at: { x: Infinity, y: NaN } });
    assert.equal(fallback.id, 'comment_3');
    assert.deepEqual([fallback.x, fallback.y, fallback.w, fallback.h], [0, 0, 360, 220]);
    assert.equal(comments.createCommentFrame(source, [], measured, { id: 'comment_1' }).id, 'comment_3');
});

test('containment snapshots fully enclosed ordinary nodes below the header and excludes other frames', () => {
    assert.equal(typeof comments.containedCommentNodes, 'function');
    const frame = { id: 'frame', type: 'note', commentFrame: true, x: 0, y: 0, w: 500, h: 300 };
    const source = graph({ frame,
        contained: { id: 'contained', type: 'workflow', x: -50, y: -50, measured: { x: 20, y: 50, w: 250, h: 120 } },
        ordinary: { id: 'ordinary', type: 'note', x: 400, y: 36, w: 100, h: 264, content: 'An ordinary note' },
        partial: { id: 'partial', type: 'workflow', x: 480, y: 100, w: 40, h: 50 },
        header: { id: 'header', type: 'workflow', x: 10, y: 10, w: 40, h: 30 },
        otherFrame: { id: 'otherFrame', type: 'note', commentFrame: true, x: 20, y: 50, w: 50, h: 50 },
        invalid: { id: 'invalid', type: 'note', x: NaN, y: 100, w: 50, h: 50 },
    });
    const snapshot = comments.containedCommentNodes(source, frame, measured);
    assert.deepEqual(snapshot.map(node => node.id), ['contained', 'ordinary']);
    source.nodes.contained.x = 900; source.nodes.contained.measured.x = 900;
    assert.equal(snapshot[0].x, -50);
    assert.equal(snapshot[0].measured.x, 20);
    assert.deepEqual(comments.containedCommentNodes(source, frame, measured).map(node => node.id), ['ordinary']);
    assert.deepEqual(comments.containedCommentNodes(source, { ...frame, w: -1 }, measured), []);
});

test('fit returns a new frame around current contained measured nodes while preserving authored metadata', () => {
    assert.equal(typeof comments.fitCommentFrame, 'function');
    const frame = { id: 'frame', type: 'note', commentFrame: true, moveContents: false, title: 'Fit me', content: 'Notes\nremain', color: '#637d89', x: 0, y: 0, w: 800, h: 600 };
    const source = graph({ frame, inside: { id: 'inside', type: 'note', x: 200, y: 100, w: 250, h: 120 }, outside: { id: 'outside', type: 'note', x: 900, y: 100, w: 40, h: 40 } });
    const before = structuredClone(source);
    const fitted = comments.fitCommentFrame(source, frame, measured);
    assert.deepEqual(fitted, { ...frame, x: 176, y: 40, w: 298, h: 204 });
    assert.notEqual(fitted, frame);
    assert.deepEqual(source, before);
    const empty = { ...frame, id: 'empty', x: -500, y: -500, w: 300, h: 200 };
    assert.deepEqual(comments.fitCommentFrame(source, empty, measured), empty);
});

test('fit uses the original node identity when reading cached measurements', () => {
    const frame = { id: 'frame', type: 'note', commentFrame: true, x: 0, y: 0, w: 800, h: 600 };
    const inside = { id: 'inside', type: 'note', x: 100, y: 200 };
    const cache = new WeakMap([[inside, { x: 100, y: 200, w: 100, h: 60 }]]);
    const fitted = comments.fitCommentFrame(graph({ frame, inside }), frame, node => cache.get(node));
    assert.deepEqual([fitted.x, fitted.y, fitted.w, fitted.h], [76, 140, 148, 144]);
});

test('workflow export and import preserve authored frame settings and ordinary notes', () => {
    const frame = comments.createCommentFrame(graph(), [], measured, { id: 'frame', title: 'Review', content: 'Reason\nNext step', moveContents: false, at: { x: 10, y: 20 }, color: '#807c69' });
    const ordinary = { id: 'ordinary', type: 'note', title: 'Note', content: 'Normal note', x: 30, y: 80, w: 120, h: 90 };
    const source = graph({ frame, ordinary });
    const exported = exportWorkflow(source);
    assert.deepEqual(exported.graph.nodes.frame, frame);
    assert.deepEqual(exported.graph.nodes.ordinary, ordinary);
    const imported = parseWorkflow(JSON.stringify(exported));
    assert.equal(imported.ok, true, JSON.stringify(imported));
    assert.deepEqual(imported.data.nodes, source.nodes);
});

test('frames stay nonexecuting and edits leave graph and definition semantic identity unchanged', () => {
    const source = graph({ source: { id: 'source', type: 'workflow', operation: 'scene-context' }, plan: { id: 'plan', type: 'workflow', operation: 'response-plan' }, output: { id: 'output', type: 'workflow', operation: 'guidance' } });
    source.wires.edge = { id: 'edge', route: 'wire', from: 'source', fromPort: 'out', to: 'plan', toPort: 'in' };
    source.wires.final = { id: 'final', route: 'wire', from: 'plan', fromPort: 'out', to: 'output', toPort: 'in' };
    const signature = graphSemanticSignature(source);
    const plan = resolveWorkflow(source);
    assert.equal(plan.ok, true, JSON.stringify(plan));
    source.nodes.frame = comments.createCommentFrame(source, [], measured, { id: 'frame' });
    assert.equal(validateGraphStructure(source).ok, true);
    assert.equal(graphSemanticSignature(source), signature);
    assert.deepEqual(resolveWorkflow(source).data.units, plan.data.units);
    Object.assign(source.nodes.frame, { title: 'Edited', content: 'Multiline\nnotes', moveContents: false, color: '#807c69', x: -80, y: 400, w: 900, h: 600 });
    assert.equal(graphSemanticSignature(source), signature);
    assert.deepEqual(resolveWorkflow(source).data.units, plan.data.units);
    const definition = { id: 'annotated', version: 1, name: 'Annotated', interface: [{ id: 'result', label: 'Result', direction: 'output', kind: 'text', required: false, cardinality: 'one', boundaryNodeId: 'exit' }], parameters: [], body: graph({
        compose: { id: 'compose', type: 'workflow', operation: 'compose', outputKind: 'text', sections: [{ name: 'text', text: 'Value' }] },
        exit: { id: 'exit', type: 'subgraph-output', interfacePortId: 'result' },
    }) };
    definition.body.wires.edge = { id: 'edge', route: 'wire', from: 'compose', fromPort: 'out', to: 'exit', toPort: 'in' };
    const before = computeDefinitionIdentity(definition);
    assert.equal(before.ok, true, JSON.stringify(before));
    definition.body.nodes.frame = structuredClone(source.nodes.frame);
    const after = computeDefinitionIdentity(definition);
    assert.equal(after.ok, true, JSON.stringify(after));
    assert.equal(after.data.semanticHash, before.data.semanticHash);
    assert.equal(after.data.canonicalContent, before.data.canonicalContent);
    const exported = exportSubgraph({ ...after.data.materializedDefinition, semanticHash: after.data.semanticHash });
    const imported = parseSubgraph(JSON.stringify(exported));
    assert.equal(imported.ok, true, JSON.stringify(imported));
    assert.deepEqual(imported.data.definition.body.nodes.frame, source.nodes.frame);
    for (const ordinary of [undefined, {}, { type: 'note' }, { type: 'note', commentFrame: 'true' }, { type: 'workflow', commentFrame: true }]) assert.equal(comments.isCommentFrame(ordinary), false);
    assert.equal(comments.isCommentFrame(source.nodes.frame), true);
});

test('clipboard preserves frame settings without implicitly copying its contained nodes', () => {
    const source = graph({ ordinary: { id: 'ordinary', type: 'note', x: 100, y: 120, w: 100, h: 60, content: 'Inside' } });
    source.nodes.frame = comments.createCommentFrame(source, ['ordinary'], measured, { id: 'frame', title: 'Copy', content: 'Multiline\nclipboard', moveContents: false });
    const clip = makeClip(source, { nodeIds: ['frame'] });
    assert.equal(clip.ok, true, JSON.stringify(clip));
    assert.deepEqual(Object.keys(clip.data.graph.nodes), ['frame']);
    const read = readClip(JSON.stringify(clip.data));
    assert.equal(read.ok, true, JSON.stringify(read));
    const destination = graph(), before = structuredClone(destination);
    const pasted = prepareClipPaste(destination, read.data, { at: { x: 1000, y: 400 } });
    assert.equal(pasted.ok, true, JSON.stringify(pasted));
    const id = pasted.data.identityMap.nodes.frame;
    assert.notEqual(id, 'frame');
    assert.deepEqual(pasted.data.candidate.nodes[id], { ...source.nodes.frame, id, x: 1000, y: 400 });
    assert.deepEqual(destination, before);
    const together = makeClip(source, { nodeIds: ['frame', 'ordinary'] });
    assert.equal(together.ok, true, JSON.stringify(together));
    assert.deepEqual(Object.keys(together.data.graph.nodes), ['frame', 'ordinary']);
});

test('authored frame creation editing and delete-only changes survive undo and redo', () => {
    const ordinary = { id: 'ordinary', type: 'note', title: 'Content', content: 'Retain me', x: 100, y: 120, w: 100, h: 60 };
    const source = { ...graph({ ordinary }), id: 'comment-history' };
    const frame = comments.createCommentFrame(source, ['ordinary'], measured, { id: 'frame' });
    assert.equal(commitGraphDocument(source, { ...source, nodes: { ...source.nodes, frame } }), true);
    assert.ok(undo(source)); assert.equal(source.nodes.frame, undefined); assert.deepEqual(source.nodes.ordinary, ordinary);
    assert.ok(redo(source)); assert.deepEqual(source.nodes.frame, frame);
    const edited = { ...frame, title: 'New title', content: 'Line one\nLine two', color: '#807c69', moveContents: false, x: 10, y: 20, w: 700, h: 400 };
    assert.equal(commitGraphDocument(source, { ...source, nodes: { ...source.nodes, frame: edited } }), true);
    assert.ok(undo(source)); assert.deepEqual(source.nodes.frame, frame);
    assert.ok(redo(source)); assert.deepEqual(source.nodes.frame, edited);
    assert.equal(commitGraphDocument(source, { ...source, nodes: { ordinary: source.nodes.ordinary } }), true);
    assert.deepEqual(source.nodes, { ordinary });
    assert.ok(undo(source)); assert.deepEqual(source.nodes.frame, edited); assert.deepEqual(source.nodes.ordinary, ordinary);
    assert.ok(redo(source)); assert.deepEqual(source.nodes, { ordinary });
});
