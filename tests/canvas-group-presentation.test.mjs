import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, mouse } from './canvas-fixture.mjs';

test('readonly folded drag commits only detached node/group presentation and cancellation restores anchors', async () => {
    const changes = [], semantic = [], env = fixture({ canEdit: () => false, onPresentationChange: (...args) => changes.push(args), onNativeGroupPresentation: (...args) => semantic.push(args) });
    const group = { id: 'fold', title: 'Fold', collapsed: true, x: 50, y: 50, frame: { x: 20, y: 10, w: 600, h: 200 } };
    env.graph.groups.fold = group; env.a.inGroup = env.b.inGroup = 'fold'; env.canvas.render();
    const before = structuredClone(env.graph);
    mouse(env.host.querySelector('.pc-node-group'), 'mousedown', 60, 60); mouse(window, 'mousemove', 100, 90);
    assert.deepEqual([env.a.x, env.b.x, group.x, group.y, group.frame.x, group.frame.y], [90, 390, 90, 80, 60, 40]);
    env.canvas.cancelGesture('escape'); assert.deepEqual(env.graph, before); assert.deepEqual(changes, []);
    mouse(env.host.querySelector('.pc-node-group'), 'mousedown', 60, 60); mouse(window, 'mousemove', 100, 90); mouse(window, 'mouseup', 100, 90);
    assert.deepEqual(changes, [[['a', 'b'], ['fold']]]); assert.deepEqual(semantic, []);
    assert.equal(env.canvas.hasContentGesture(), false); await env.canvas.destroy();
});

test('dragging a visible selected node carries selected folded groups and restores missing anchors on cancel', async () => {
    const env = fixture(), outside = { ...env.a, id: 'outside', x: 650 };
    env.graph.nodes.outside = outside; env.graph.nativeCards.outside = structuredClone(env.graph.nativeCards.a);
    env.graph.groups.fold = { id: 'fold', title: 'Fold', collapsed: true }; env.a.inGroup = env.b.inGroup = 'fold';
    env.canvas.render(); env.canvas.selectAll(); const before = structuredClone(env.graph);
    mouse(env.host.querySelector('[data-id="outside"]'), 'mousedown', 660, 60); mouse(window, 'mousemove', 700, 90);
    assert.equal(env.a.x, 90); assert.equal(outside.x, 690); assert.equal(env.graph.groups.fold.x, 66);
    env.canvas.cancelGesture(); assert.deepEqual(env.graph, before); assert.equal(Object.hasOwn(env.graph.groups.fold, 'x'), false);
    await env.canvas.destroy();
});
