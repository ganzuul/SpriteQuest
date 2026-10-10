import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, mouse } from './canvas-fixture.mjs';

for (const readOnly of [false, true]) test(`expanded group header moves its members and saved frame in ${readOnly ? 'readonly' : 'editable'} presentation`, async () => {
    const changes = [], env = fixture({ canEdit: () => !readOnly, onPresentationChange: (...args) => changes.push(args) });
    try {
        const group = { id: 'open', title: 'Open', collapsed: false, x: 50, y: 50, frame: { x: 20, y: 10, w: 600, h: 200 } };
        env.graph.groups.open = group; env.a.inGroup = env.b.inGroup = 'open'; env.canvas.render();
        const header = () => env.host.querySelector('.pc-group-frame-head');
        mouse(header(), 'mousedown', 60, 20); mouse(window, 'mousemove', 64, 20); mouse(window, 'mouseup', 64, 20);
        assert.deepEqual([env.a.x, env.b.x, group.frame.x], [50, 350, 20], 'a click does not move the group');
        assert.deepEqual(env.canvas.selection, { kind: 'group', id: 'open' }); assert.deepEqual(changes, []);
        mouse(header(), 'mousedown', 60, 20); mouse(window, 'mousemove', 100, 50); env.canvas.frames.flush();
        assert.deepEqual([env.a.x, env.a.y, env.b.x, env.b.y], [90, 80, 390, 80]);
        assert.deepEqual([group.x, group.y, group.frame.x, group.frame.y], [90, 80, 60, 40]);
        assert.deepEqual([env.host.querySelector('.pc-group-frame').style.left, env.host.querySelector('.pc-group-frame').style.top], ['60px', '32px']);
        mouse(window, 'mouseup', 100, 50);
        assert.deepEqual(changes, [[['a', 'b'], ['open']]]);
        assert.equal(group.collapsed, false); assert.equal(env.a.inGroup, 'open'); assert.equal(env.b.inGroup, 'open');
        assert.equal(env.canvas.hasContentGesture(), false);
    } finally { await env.canvas.destroy(); }
});

test('cancelling an expanded group header drag restores members and absent anchors', async () => {
    const changes = [], env = fixture({ onPresentationChange: (...args) => changes.push(args) });
    try {
        env.graph.groups.open = { id: 'open', title: 'Open', collapsed: false };
        env.a.inGroup = env.b.inGroup = 'open'; env.canvas.render();
        const before = structuredClone(env.graph);
        mouse(env.host.querySelector('.pc-group-frame-head'), 'mousedown', 60, 20); mouse(window, 'mousemove', 100, 50);
        assert.deepEqual([env.a.x, env.b.x], [90, 390]);
        env.canvas.cancelGesture('escape');
        assert.deepEqual(env.graph, before); assert.deepEqual(changes, []);
    } finally { await env.canvas.destroy(); }
});

test('an empty expanded group header moves and commits its saved frame', async () => {
    const changes = [], env = fixture({ onPresentationChange: (...args) => changes.push(args) });
    try {
        const group = { id: 'empty', title: 'Empty', collapsed: false, frame: { x: 20, y: 10, w: 200, h: 120 } };
        env.graph.groups.empty = group; env.canvas.render();
        mouse(env.host.querySelector('.pc-group-frame-head'), 'mousedown', 60, 20); mouse(window, 'mousemove', 100, 50); mouse(window, 'mouseup', 100, 50);
        assert.deepEqual(group.frame, { x: 60, y: 40, w: 200, h: 120 });
        assert.deepEqual([env.a.x, env.b.x], [50, 350]); assert.deepEqual(changes, [[[], ['empty']]]);
    } finally { await env.canvas.destroy(); }
});

test('expanded group header preserves group selection with modifiers and leaves unrelated nodes in place', async () => {
    const env = fixture(), outside = { ...env.a, id: 'outside', x: 650 };
    try {
        env.graph.nodes.outside = outside; env.graph.nativeCards.outside = structuredClone(env.graph.nativeCards.a);
        env.graph.groups.open = { id: 'open', title: 'Open', collapsed: false, x: 50, y: 50 };
        env.a.inGroup = env.b.inGroup = 'open'; env.canvas.render();
        for (const options of [{ shiftKey: true }, { ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
            env.canvas.selectAll();
            mouse(env.host.querySelector('.pc-group-frame-head'), 'mousedown', 60, 20, options); mouse(window, 'mouseup', 60, 20, options);
            assert.deepEqual(env.canvas.selection, { kind: 'group', id: 'open' }); assert.equal(env.canvas.multi.size, 0);
        }
        env.canvas.selectAll();
        mouse(env.host.querySelector('.pc-group-frame-head'), 'mousedown', 60, 20); mouse(window, 'mousemove', 100, 50); mouse(window, 'mouseup', 100, 50);
        assert.deepEqual([env.a.x, env.b.x, outside.x], [90, 390, 650]);
    } finally { await env.canvas.destroy(); }
});

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
