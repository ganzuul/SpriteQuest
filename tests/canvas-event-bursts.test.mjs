import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, dom, mouse } from './canvas-fixture.mjs';

function countWork(canvas, host) {
    const counts = { nodes: 0, positions: 0, wires: 0, measure: 0, endpoint: 0, bounds: 0, views: 0, selections: 0 };
    for (const [method, key] of [['setNodes', 'nodes'], ['setPositions', 'positions'], ['setWires', 'wires']]) {
        const call = canvas.layer[method]; canvas.layer[method] = (...args) => { counts[key]++; return call(...args); };
    }
    for (const [method, key] of [['measure', 'measure'], ['endpoint', 'endpoint']]) {
        const call = canvas.geometry[method].bind(canvas.geometry); canvas.geometry[method] = (...args) => { counts[key]++; return call(...args); };
    }
    const bounds = host.getBoundingClientRect; host.getBoundingClientRect = () => { counts.bounds++; return bounds(); };
    canvas.hooks.onView = () => { counts.views++; };
    canvas.hooks.onSelect = () => { counts.selections++; };
    return counts;
}
function holdFrames() {
    const request = globalThis.requestAnimationFrame, cancel = globalThis.cancelAnimationFrame;
    let sequence = 0; const queued = new Map();
    globalThis.requestAnimationFrame = callback => { queued.set(++sequence, callback); return sequence; };
    globalThis.cancelAnimationFrame = ticket => queued.delete(ticket);
    return { size: () => queued.size, flush() { const callbacks = [...queued.values()]; queued.clear(); callbacks.forEach(callback => callback(0)); }, restore() { globalThis.requestAnimationFrame = request; globalThis.cancelAnimationFrame = cancel; } };
}

test('node selection paints before returning without rebuilding cards, routes, geometry or camera', async () => {
    const f = fixture(), card = f.host.querySelector('[data-id="a"]'), path = f.host.querySelector('.pc-wire');
    const counts = countWork(f.canvas, f.host);
    try {
        mouse(card, 'mousedown', 80, 80);
        assert.equal(card.classList.contains('pc-selected'), true, 'selection is visible during the input event');
        mouse(window, 'mouseup', 80, 80);
        assert.equal(f.host.querySelector('[data-id="a"]'), card); assert.equal(f.host.querySelector('.pc-wire'), path);
        assert.deepEqual(counts, { nodes: 0, positions: 0, wires: 0, measure: 0, endpoint: 0, bounds: 1, views: 0, selections: 1 });
    } finally { await f.canvas.destroy(); }
});

test('a node click outside a multi-selection publishes only the final selection', async () => {
    const f = fixture(); f.canvas.setMulti(['b']); const counts = countWork(f.canvas, f.host);
    try {
        mouse(f.host.querySelector('[data-id="a"]'), 'mousedown', 80, 80); mouse(window, 'mouseup', 80, 80);
        assert.deepEqual(f.canvas.selection, { kind: 'node', id: 'a' }); assert.equal(f.canvas.multi.size, 0);
        assert.equal(counts.selections, 1); assert.equal(counts.nodes, 0); assert.equal(counts.measure, 0);
    } finally { await f.canvas.destroy(); }
});

test('rapid wheel and pan bursts paint once per frame and retain every final camera delta', async () => {
    const frames = holdFrames(), f = fixture(), counts = countWork(f.canvas, f.host);
    try {
        for (let index = 0; index < 60; index++) f.host.dispatchEvent(new dom.window.WheelEvent('wheel', { deltaY: -1, clientX: 200, clientY: 200, bubbles: true, cancelable: true }));
        assert.equal(frames.size(), 1); assert.equal(counts.views, 0); assert.equal(counts.bounds, 1);
        frames.flush(); assert.equal(counts.views, 1); assert.equal(counts.nodes, 0); assert.equal(counts.measure, 0);
        assert.ok(Math.abs(f.graph.view.zoom - Math.exp(0.12)) < 1e-12);
        f.canvas.cancelGesture(); const before = { ...f.graph.view }; counts.views = 0; counts.bounds = 0;
        mouse(f.host, 'mousedown', 20, 20, { button: 1 });
        for (let index = 1; index <= 60; index++) mouse(f.host, 'mousemove', 20 + index, 20 + index * 2, { button: 1 });
        assert.equal(frames.size(), 1); assert.equal(counts.views, 0); assert.equal(counts.bounds, 1);
        frames.flush(); assert.equal(counts.views, 1); mouse(window, 'mouseup', 80, 140, { button: 1 });
        assert.equal(f.graph.view.x, before.x + 60); assert.equal(f.graph.view.y, before.y + 120);
        assert.equal(counts.nodes, 0); assert.equal(counts.measure, 0); assert.equal(counts.endpoint, 0);
    } finally { await f.canvas.destroy(); frames.restore(); }
});

test('rapid node drag bursts route only incident wires once per frame without card reconstruction on release', async () => {
    const frames = holdFrames(), f = fixture();
    for (let index = 0; index < 40; index++) {
        const id = 'other-' + index; f.graph.nodes[id] = { ...f.b, id, x: 700 + index * 300 }; f.graph.nativeCards[id] = structuredClone(f.graph.nativeCards.b);
        f.canvas.geometry.measure(id, 160, 48, [{ id: 'in', direction: 'in', x: 0, y: 24 }, { id: 'out', direction: 'out', x: 160, y: 24 }]);
        if (index) f.graph.wires['other-wire-' + index] = { id: 'other-wire-' + index, route: 'wire', from: 'other-' + (index - 1), fromPort: 'out', to: id, toPort: 'in' };
    }
    f.canvas.render(); const counts = countWork(f.canvas, f.host), card = f.host.querySelector('[data-id="a"]');
    try {
        mouse(card, 'mousedown', 80, 80); counts.endpoint = 0;
        for (let index = 1; index <= 60; index++) mouse(f.host, 'mousemove', 80 + index, 80 + index);
        assert.equal(frames.size(), 1); assert.equal(counts.positions, 0);
        frames.flush(); assert.equal(counts.positions, 1); assert.equal(counts.wires, 1);
        assert.equal(counts.endpoint, 2, 'unchanged wire endpoints are not revisited');
        assert.equal(card.style.left, '110px'); assert.equal(card.classList.contains('pc-selected'), true);
        mouse(window, 'mouseup', 140, 140);
        assert.equal(counts.nodes, 0); assert.equal(counts.measure, 0); assert.equal(counts.views, 0);
    } finally { await f.canvas.destroy(); frames.restore(); }
});

test('wheel completion and pan cancellation flush their final camera at the gesture boundary', async () => {
    const frames = holdFrames(), commits = [], views = [];
    const f = fixture({ onView: view => views.push(view), onViewCommit: () => commits.push({ ...f.graph.view }) });
    try {
        for (let index = 0; index < 60; index++) f.host.dispatchEvent(new dom.window.WheelEvent('wheel', { deltaY: -1, clientX: 200, clientY: 200, bubbles: true, cancelable: true }));
        f.canvas.cancelGesture(); assert.equal(frames.size(), 0); assert.equal(commits.length, 1); assert.deepEqual(commits[0], f.graph.view);
        const camera = { ...f.graph.view };
        mouse(f.host, 'mousedown', 20, 20, { button: 1 }); mouse(f.host, 'mousemove', 100, 140, { button: 1 });
        f.canvas.cancelGesture(); assert.equal(frames.size(), 0); assert.deepEqual(f.graph.view, camera); assert.equal(commits.length, 2); assert.deepEqual(commits[1], camera);
        mouse(f.host, 'mousedown', 20, 20, { button: 1 }); mouse(f.host, 'mousemove', 50, 60, { button: 1 }); mouse(window, 'mouseup', 50, 60, { button: 1 });
        assert.equal(commits.length, 3); assert.deepEqual(commits[2], f.graph.view); assert.equal(views.at(-1).x, camera.x + 30);
    } finally { await f.canvas.destroy(); frames.restore(); }
});

test('a full render acquires comment edit authority only when authored comment controls exist', async () => {
    let editable = true, captures = 0;
    const f = fixture({ canEdit: () => editable, captureCommentEdit: () => { captures++; return {}; } });
    try {
        assert.equal(captures, 0, 'Native-only admission and render do not capture root comment edits');
        const frame = { id: 'frame', type: 'note', commentFrame: true, title: 'Comment', content: 'Notes', x: 0, y: 0, w: 500, h: 200 };
        f.graph.nodes.frame = frame; f.graph.nativeCards.frame = { canonicalTitle: 'Comment', family: 'Organization', iconPath: 'M1 1', body: frame.content, ports: [], hostResult: false };
        f.canvas.render(); assert.equal(captures, 1); assert.ok(f.host.querySelector('.pc-comment-title-input'));
        editable = false; f.canvas.render(); assert.equal(captures, 1); assert.equal(f.host.querySelector('.pc-comment-title-input'), null);
    } finally { await f.canvas.destroy(); }
});


test('full native Canvas drawing classifies the graph only once for the visible card batch', async () => {
    const f = fixture(), read = Object.getOwnPropertyDescriptors;
    const counts = { graph: 0, nodes: 0, wires: 0, nodeA: 0, nodeB: 0 };
    Object.getOwnPropertyDescriptors = value => {
        for (const [key, object] of Object.entries({ graph: f.graph, nodes: f.graph.nodes, wires: f.graph.wires, nodeA: f.a, nodeB: f.b })) if (value === object) counts[key]++;
        return read(value);
    };
    try {
        f.canvas.render();
        assert.deepEqual(counts, { graph: 1, nodes: 1, wires: 1, nodeA: 1, nodeB: 1 });
        assert.equal(f.host.querySelectorAll('.pc-node-native').length, 2);
    } finally { Object.getOwnPropertyDescriptors = read; await f.canvas.destroy(); }
});
