import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, dom, mouse } from './canvas-fixture.mjs';
import { buildConnectionRoute } from '../src/canvas/connection-route.js';
import { createCommentFrame } from '../src/canvas/comment-frames.js';
const addComment = env => {
    const frame = createCommentFrame(env.graph, ['a', 'b'], node => ({ x: node.x, y: node.y, w: 160, h: 48 }), { id: 'frame', content: 'Workflow notes' });
    env.graph.nodes.frame = frame;
    env.graph.nativeCards.frame = { canonicalTitle: 'Comment', family: 'Organization', iconPath: 'M1 1', body: frame.content, ports: [], hostResult: false };
    env.canvas.render();
    return frame;
};

test('settled connection, hit target and label use the shared graph-space spline', async () => {
    const env = fixture();
    try {
        env.b.x = 0; env.b.y = 200; env.canvas.render();
        const route = buildConnectionRoute(env.canvas.endpoint('a', 'out'), env.canvas.endpoint('b', 'in'));
        const path = env.host.querySelector('.pc-wire[data-id="edge"]');
        const hit = env.host.querySelector('.pc-wire-hit[data-id="edge"]');
        const label = env.host.querySelector('.pc-wire-label');
        assert.equal(path.getAttribute('d'), route.d);
        assert.equal(hit.getAttribute('d'), route.d);
        assert.equal(Number(label.getAttribute('x')), route.label.x);
        assert.equal(Number(label.getAttribute('y')), route.label.y);
    } finally { await env.canvas.destroy(); }
});

test('header dragging previews captured contents and emits one authored layout batch', async () => {
    const capture = {}, edits = [], overlays = [];
    const env = fixture({ captureCommentEdit: () => capture, onCommentLayout: (token, positions) => { edits.push({ token, positions }); return { ok: true }; }, onPresentationChange: ids => overlays.push(ids) });
    try {
        const frame = addComment(env), before = [frame, env.a, env.b].map(node => ({ id: node.id, x: node.x, y: node.y }));
        mouse(env.host.querySelector('.pc-comment-header'), 'mousedown', frame.x + 5, frame.y + 10);
        mouse(window, 'mousemove', frame.x + 45, frame.y + 40);
        mouse(window, 'mouseup', frame.x + 5, frame.y + 10);
        assert.equal(edits.length, 1);
        assert.equal(edits[0].token, capture);
        assert.deepEqual(edits[0].positions, before.map(position => ({ ...position, x: position.x + 40, y: position.y + 30, ...(position.id === 'frame' ? { w: frame.w, h: frame.h } : {}) })));
        assert.deepEqual(overlays, []);
    } finally { await env.canvas.destroy(); }
});

test('resize previews and cancellation restore the exact frame without moving its contents', async () => {
    const edits = [];
    const env = fixture({ captureCommentEdit: () => ({}), onCommentLayout: (token, positions) => { edits.push(positions); return { ok: true }; } });
    try {
        const frame = addComment(env), before = structuredClone(frame), a = structuredClone(env.a), b = structuredClone(env.b);
        const resize = env.host.querySelector('.pc-comment-resize');
        const x = frame.x + frame.w, y = frame.y + frame.h;
        mouse(resize, 'mousedown', x, y); mouse(window, 'mousemove', x + 60, y + 50);
        assert.equal(frame.w, before.w + 60); assert.equal(frame.h, before.h + 50);
        assert.deepEqual(env.a, a); assert.deepEqual(env.b, b);
        env.canvas.cancelGesture('escape');
        assert.deepEqual(frame, before); assert.deepEqual(edits, []);
        mouse(env.host.querySelector('.pc-comment-resize'), 'mousedown', x, y);
        mouse(window, 'mousemove', x + 30, y + 20); mouse(window, 'mouseup', x + 30, y + 20);
        assert.deepEqual(edits, [[{ id: 'frame', x: before.x, y: before.y, w: before.w + 30, h: before.h + 20 }]]);
    } finally { await env.canvas.destroy(); }
});

test('explicit mixed selection dragging commits frames and chosen nodes without adding contents', async () => {
    const edits = [], overlays = [];
    const env = fixture({ captureCommentEdit: () => ({}), onCommentLayout: (capture, positions) => { edits.push(positions); return { ok: true }; }, onPresentationChange: ids => overlays.push(ids) });
    try {
        const frame = addComment(env), before = { x: frame.x, y: frame.y }, b = structuredClone(env.b);
        env.canvas.setMulti(['a', 'frame']);
        mouse(env.host.querySelector('.pc-node[data-id="a"]'), 'mousedown', 60, 60);
        mouse(window, 'mousemove', 90, 80); mouse(window, 'mouseup', 90, 80);
        assert.equal(edits.length, 1);
        assert.deepEqual(edits[0].map(({ id, x, y }) => ({ id, x, y })), [{ id: 'a', x: 80, y: 70 }, { id: 'frame', x: before.x + 30, y: before.y + 20 }]);
        assert.deepEqual(env.b, b); assert.deepEqual(overlays, []);
    } finally { await env.canvas.destroy(); }
});

test('explicit comment selection carries collapsed group geometry in one layout batch from each drag surface', async () => {
    for (const startSurface of ['comment', 'node', 'group']) {
        const edits = [], presentations = [], dragBlocks = [], capture = {};
        const env = fixture({ captureCommentEdit: () => capture, onCommentLayout: (...args) => { edits.push(args); return { ok: true }; },
            onPresentationChange: (...args) => presentations.push(args), onDragBlock: blocked => dragBlocks.push(blocked) });
        try {
            const frame = addComment(env);
            const outside = { ...env.a, id: 'outside', x: 650 };
            env.graph.nodes.outside = outside; env.graph.nativeCards.outside = structuredClone(env.graph.nativeCards.a);
            const group = { id: 'fold', title: 'Fold', collapsed: true, x: 50, y: 50, frame: { x: 20, y: 10, w: 600, h: 200 } };
            env.graph.groups.fold = group; env.a.inGroup = env.b.inGroup = 'fold'; env.canvas.render();
            env.canvas.setMulti(['a', 'b', 'frame', 'outside']);
            const element = env.host.querySelector(startSurface === 'comment' ? '.pc-comment-header' : startSurface === 'group' ? '.pc-node-group' : '.pc-node[data-id="outside"]');
            const x = startSurface === 'comment' ? frame.x + 5 : startSurface === 'group' ? 60 : 660;
            const y = startSurface === 'comment' ? frame.y + 10 : 60;
            mouse(element, 'mousedown', x, y); mouse(window, 'mousemove', x + 40, y + 30);
            assert.deepEqual({ x: group.x, y: group.y, frame: group.frame }, { x: 90, y: 80, frame: { x: 60, y: 40, w: 600, h: 200 } }, startSurface);
            mouse(window, 'mouseup', x + 40, y + 30);
            assert.equal(edits.length, 1, startSurface); assert.equal(edits[0][0], capture);
            assert.deepEqual(edits[0][1].map(position => position.id), ['a', 'b', 'frame', 'outside']);
            assert.deepEqual(edits[0][2], [{ id: 'fold', x: 90, y: 80, frame: { x: 60, y: 40, w: 600, h: 200 } }]);
            assert.deepEqual(presentations, []); assert.equal(dragBlocks.includes(true), false);
        } finally { await env.canvas.destroy(); }
    }
});

test('cancelled and rejected mixed comment drags restore absent group anchors and exact saved frames', async () => {
    for (const finish of ['cancel', 'reject']) {
        const env = fixture({ captureCommentEdit: () => ({}), onCommentLayout: () => ({ ok: false }) });
        try {
            const frame = addComment(env);
            env.graph.groups.fold = { id: 'fold', title: 'Fold', collapsed: true, frame: { x: 20, y: 10, w: 600, h: 200 } };
            env.a.inGroup = env.b.inGroup = 'fold'; env.canvas.render(); env.canvas.setMulti(['a', 'b', 'frame']);
            const before = structuredClone(env.graph), x = frame.x + 5, y = frame.y + 10;
            mouse(env.host.querySelector('.pc-comment-header'), 'mousedown', x, y); mouse(window, 'mousemove', x + 40, y + 30);
            assert.equal(Object.hasOwn(env.graph.groups.fold, 'x'), true);
            if (finish === 'cancel') env.canvas.cancelGesture('escape'); else mouse(window, 'mouseup', x + 40, y + 30);
            assert.deepEqual(env.graph, before, finish);
        } finally { await env.canvas.destroy(); }
    }
});

test('mixed comment drags focus before capture and use the drawing replaced by title blur', async () => {
    for (const startSurface of ['node', 'group', 'shift-node']) {
        let env, replacement, capturedDraw;
        env = fixture({ captureCommentEdit: () => { capturedDraw = env?.canvas.graph; return {}; }, onCommentLayout: () => ({ ok: true }) });
        try {
            const frame = addComment(env), outside = { ...env.a, id: 'outside', x: 650 };
            env.graph.nodes.outside = outside; env.graph.nativeCards.outside = structuredClone(env.graph.nativeCards.a);
            env.graph.groups.fold = { id: 'fold', title: 'Fold', collapsed: true, x: 50, y: 50 };
            env.a.inGroup = env.b.inGroup = 'fold'; env.canvas.render();
            const selected = startSurface === 'shift-node' ? ['a', 'b', 'frame'] : ['a', 'b', 'frame', 'outside'];
            env.canvas.setMulti(selected);
            const before = structuredClone(env.graph);
            const title = env.host.querySelector('.pc-comment-title-input'); title.focus(); env.canvas.setMulti(selected);
            title.addEventListener('blur', () => {
                replacement = structuredClone(env.graph);
                for (const node of Object.values(replacement.nodes)) node.x += 100;
                replacement.groups.fold.x += 100;
                env.canvas.setGraph(replacement); env.canvas.setMulti(selected);
            }, { once: true });
            const element = env.host.querySelector(startSurface === 'group' ? '.pc-node-group' : '.pc-node[data-id="outside"]');
            const x = startSurface === 'group' ? 60 : 660;
            mouse(element, 'mousedown', x, 60, { shiftKey: startSurface === 'shift-node' }); mouse(window, 'mousemove', x + 40, 90);
            assert.equal(document.activeElement, env.host, startSurface);
            assert.ok(replacement); assert.equal(capturedDraw, replacement);
            assert.deepEqual(env.graph, before);
            assert.equal(replacement.nodes.frame.x, frame.x + 140); assert.equal(replacement.nodes.outside.x, 790);
            assert.equal(replacement.groups.fold.x, 190);
            env.canvas.cancelGesture('escape');
            assert.equal(replacement.nodes.frame.x, frame.x + 100); assert.equal(replacement.groups.fold.x, 150);
        } finally { await env.canvas.destroy(); }
    }
});

test('loss of edit authority during a comment gesture restores all preview positions', async () => {
    let editable = true;
    const edits = [];
    const env = fixture({ canEdit: () => editable, captureCommentEdit: () => ({}), onCommentLayout: (capture, positions) => { edits.push(positions); return { ok: true }; } });
    try {
        const frame = addComment(env), before = structuredClone(env.graph.nodes);
        mouse(env.host.querySelector('.pc-comment-header'), 'mousedown', frame.x + 5, frame.y + 10);
        mouse(window, 'mousemove', frame.x + 45, frame.y + 40);
        editable = false;
        mouse(window, 'mouseup', 80, 80);
        assert.deepEqual(env.graph.nodes, before); assert.deepEqual(edits, []);
        assert.equal(env.host.querySelector('.pc-comment-title-input'), null);
        assert.equal(env.host.querySelector('.pc-comment-resize'), null);
    } finally { await env.canvas.destroy(); }
});

test('frame context menus carry the frame and the current explicit multi-selection', async () => {
    const menus = [];
    const env = fixture({ onContextMenu: menu => menus.push(menu) });
    try {
        const frame = addComment(env); env.canvas.setMulti(['a', 'frame']);
        mouse(env.host.querySelector('.pc-comment-header'), 'contextmenu', 40, 10);
        assert.equal(menus.length, 1);
        assert.equal(menus[0].node, frame);
        assert.deepEqual(menus[0].several, ['a', 'frame']);
        assert.deepEqual(menus[0].at, { x: 40, y: 10 });
    } finally { await env.canvas.destroy(); }
});

test('modifier clicks add frames without a later mouse click clearing the selected set', async () => {
    const env = fixture({ captureCommentEdit: () => ({}) });
    try {
        addComment(env); env.canvas.setMulti(['a']);
        const grip = env.host.querySelector('.pc-comment-select');
        mouse(grip, 'mousedown', 40, 5, { ctrlKey: true }); mouse(window, 'mouseup', 40, 5);
        mouse(grip, 'click', 40, 5, { ctrlKey: true, detail: 1 });
        assert.deepEqual([...env.canvas.multi], ['a', 'frame']);
        assert.ok(env.host.querySelector('.pc-comment-frame').classList.contains('pc-comment-selected'));
    } finally { await env.canvas.destroy(); }
});

test('free previews from either pin direction start at the real source with one simple cubic', async () => {
    const env = fixture();
    try {
        for (const dir of ['out', 'in']) {
            const nodeId = dir === 'out' ? 'a' : 'b', origin = env.canvas.endpoint(nodeId, dir);
            const loose = { x: origin.x + (dir === 'out' ? 5 : -5), y: origin.y + 2 };
            env.canvas.updateNativeWire({ gesture: { kind: 'drag', origin: { nodeId, dir, portId: dir }, ghost: loose } });
            env.canvas.frames.flush();
            const d = env.host.querySelector('.pc-wire-ghost').getAttribute('d');
            assert.equal((d.match(/C/g) ?? []).length, 1);
            assert.equal((d.match(/L/g) ?? []).length, 0, 'free pointer has no second pin neck');
            const coordinates = d.match(/[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi).map(Number);
            assert.deepEqual(coordinates.slice(0, 2), [origin.x, origin.y]);
            assert.deepEqual(coordinates.slice(-2), [loose.x, loose.y]);
            assert.equal(coordinates[3], origin.y, 'source departure is horizontal');
            assert.ok((coordinates[2] - origin.x) * (dir === 'out' ? 1 : -1) > 0, 'departure follows source pin side');
        }
    } finally { await env.canvas.destroy(); }
});

test('move-contents off moves only the frame and failed commits restore the preview', async () => {
    const edits = [];
    const env = fixture({ captureCommentEdit: () => ({}), onCommentLayout: (capture, positions) => { edits.push(positions); return { ok: false }; } });
    try {
        const frame = addComment(env); frame.moveContents = false; env.canvas.render();
        const before = structuredClone(env.graph.nodes), x = frame.x + 5, y = frame.y + 10;
        mouse(env.host.querySelector('.pc-comment-header'), 'mousedown', x, y);
        mouse(window, 'mousemove', x + 40, y + 30); mouse(window, 'mouseup', x + 40, y + 30);
        assert.deepEqual(edits, [[{ id: 'frame', x: before.frame.x + 40, y: before.frame.y + 30, w: frame.w, h: frame.h }]]);
        assert.deepEqual(env.graph.nodes, before);
    } finally { await env.canvas.destroy(); }
});

test('comment double clicks reveal details while title editing leaves graph search alone', async () => {
    let searches = 0; const reveals = [];
    const bridge = { hasContentGesture: () => false, cancel: () => ({ view: null, requests: [] }), openUnconnectedSearch() { searches++; return { view: null, requests: [] }; } };
    const env = fixture({ nativeBridge: () => bridge, onReveal: selection => reveals.push(selection) });
    try {
        addComment(env);
        mouse(env.host.querySelector('.pc-comment-title-input'), 'dblclick', 50, 5);
        assert.equal(searches, 0);
        mouse(env.host.querySelector('.pc-comment-header'), 'dblclick', 40, 5);
        assert.deepEqual(reveals, [{ kind: 'node', id: 'frame' }]);
        assert.equal(searches, 0);
    } finally { await env.canvas.destroy(); }
});

test('a gesture begun after title editing takes keyboard focus so Escape cancels it', async () => {
    const env = fixture({ captureCommentEdit: () => ({}) });
    try {
        const frame = addComment(env), before = structuredClone(env.graph.nodes);
        env.host.querySelector('.pc-comment-title-input').focus();
        mouse(env.host.querySelector('.pc-comment-select'), 'mousedown', frame.x + 5, frame.y + 10);
        mouse(window, 'mousemove', frame.x + 45, frame.y + 40);
        document.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
        assert.equal(env.canvas.drag, null); assert.deepEqual(env.graph.nodes, before);
        assert.equal(document.activeElement, env.host);
    } finally { await env.canvas.destroy(); }
});

test('authored frames render behind wires and nodes with their full stored bounds', async () => {
    const env = fixture();
    try {
        const frame = addComment(env);
        const element = env.host.querySelector('.pc-comment-frame[data-id="frame"]');
        assert.ok(element);
        assert.equal(env.host.querySelector('.pc-node[data-id="frame"]'), null);
        assert.equal(env.canvas.widthOf(frame), frame.w);
        assert.equal(env.canvas.heightOf(frame), frame.h);
        assert.equal(element.style.width, frame.w + 'px');
        assert.equal(element.style.height, frame.h + 'px');
        assert.ok(env.host.querySelector('.pc-comment-layer').compareDocumentPosition(env.canvas.svg) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
        assert.equal(getComputedStyle(element).pointerEvents, 'none');
    } finally { await env.canvas.destroy(); }
});

test('hovered and selected connections highlight both real pins and clear focus', async () => {
    const env = fixture();
    const output = env.host.querySelector('.pc-port[data-node="a"][data-dir="out"]');
    const input = env.host.querySelector('.pc-port[data-node="b"][data-dir="in"]');
    const other = env.host.querySelector('.pc-port[data-node="b"][data-dir="out"]');
    try {
        env.canvas.select({ kind: 'wire', id: 'edge' });
        assert.ok(output.classList.contains('pc-pin-highlight'));
        assert.ok(input.classList.contains('pc-pin-highlight'));
        assert.equal(other.classList.contains('pc-pin-highlight'), false);
        env.canvas.select(null);
        const hit = env.host.querySelector('.pc-wire-hit[data-id="edge"]');
        hit.dispatchEvent(new dom.window.MouseEvent('pointerover', { bubbles: true }));
        assert.ok(output.classList.contains('pc-pin-highlight'));
        assert.ok(input.classList.contains('pc-pin-highlight'));
        assert.ok(env.host.querySelector('.pc-wire[data-id="edge"]').classList.contains('pc-wire-feeds'));
        hit.dispatchEvent(new dom.window.MouseEvent('pointerout', { bubbles: true, relatedTarget: env.host }));
        assert.equal(output.classList.contains('pc-pin-highlight'), false);
        assert.equal(input.classList.contains('pc-pin-highlight'), false);
    } finally { await env.canvas.destroy(); }
});
