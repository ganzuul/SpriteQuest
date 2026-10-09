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

test('previews from either pin direction use the same connection route', async () => {
    const env = fixture();
    try {
        for (const dir of ['out', 'in']) {
            const nodeId = dir === 'out' ? 'a' : 'b', loose = { x: -30, y: 180, side: dir === 'out' ? 'left' : 'right' };
            env.canvas.updateNativeWire({ gesture: { kind: 'drag', origin: { nodeId, dir, portId: dir }, ghost: { x: loose.x, y: loose.y } } });
            env.canvas.frames.flush();
            const origin = env.canvas.endpoint(nodeId, dir);
            const expected = dir === 'out' ? buildConnectionRoute(origin, loose) : buildConnectionRoute(loose, origin);
            assert.equal(env.host.querySelector('.pc-wire-ghost').getAttribute('d'), expected.d);
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
