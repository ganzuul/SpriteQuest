import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, mouse } from './canvas-fixture.mjs';

test('centering a selected node preserves zoom and commits the displayed camera', async t => {
    const committed = [];
    const { canvas, graph, host } = fixture({ onViewCommit: () => committed.push({ ...graph.view }) });
    t.after(async () => { await canvas.destroy(); host.remove(); });
    Object.assign(graph.view, { x: -400, y: 300, zoom: 1.75 });
    canvas.applyTransform();
    canvas.select({ kind: 'node', id: 'a' });

    canvas.centerSelection();

    assert.deepEqual(graph.view, { x: 272.5, y: 270.5, zoom: 1.75 });
    assert.equal(canvas.viewport.style.transform, 'translate(272.5px, 270.5px) scale(1.75)');
    assert.deepEqual(committed, [{ x: 272.5, y: 270.5, zoom: 1.75 }]);
});

test('centering a folded group uses the rendered card position and measured size', async t => {
    const { canvas, graph, host, a, b } = fixture();
    t.after(async () => { await canvas.destroy(); host.remove(); });
    graph.groups.fold = { id: 'fold', title: 'Fold', collapsed: true, frame: { x: -200, y: -100, w: 1000, h: 500 } };
    a.inGroup = b.inGroup = 'fold';
    graph.view.zoom = .5;
    canvas.render();
    canvas.geometry.measure('group:fold', 300, 120);
    canvas.select({ kind: 'group', id: 'fold' });

    canvas.centerSelection();

    assert.deepEqual(graph.view, { x: 525, y: 420, zoom: .5 });
});

test('centering with no selection centers the graph without changing zoom', async t => {
    const { canvas, graph, host } = fixture();
    t.after(async () => { await canvas.destroy(); host.remove(); });
    Object.assign(graph.view, { x: 900, y: -800, zoom: .5 });

    canvas.centerSelection();

    assert.deepEqual(graph.view, { x: 360, y: 363, zoom: .5 });
});

test('centering includes both the primary node and the multiple node selection', async t => {
    const { canvas, graph, host } = fixture();
    t.after(async () => { await canvas.destroy(); host.remove(); });
    graph.view.zoom = 2;
    canvas.setMulti(['b']);
    canvas.select({ kind: 'node', id: 'a' });

    canvas.centerSelection();

    assert.deepEqual(graph.view, { x: -60, y: 252, zoom: 2 });
});

test('centering an expanded group uses its displayed frame, including empty groups', async t => {
    const { canvas, graph, host, a, b } = fixture();
    t.after(async () => { await canvas.destroy(); host.remove(); });
    graph.groups.expanded = { id: 'expanded', title: 'Expanded', frame: { x: -200, y: -100, w: 1000, h: 500 } };
    graph.groups.empty = { id: 'empty', title: 'Empty', frame: { x: 700, y: 200, w: 400, h: 200 } };
    a.inGroup = b.inGroup = 'expanded';
    graph.view.zoom = .5;
    canvas.render();

    canvas.select({ kind: 'group', id: 'expanded' });
    canvas.centerSelection();
    assert.deepEqual(graph.view, { x: 350, y: 325, zoom: .5 });

    canvas.select({ kind: 'group', id: 'empty' });
    canvas.centerSelection();
    assert.deepEqual(graph.view, { x: 50, y: 250, zoom: .5 });
});

test('centering selected members of a folded group uses the single visible group card', async t => {
    const { canvas, graph, host, a, b } = fixture();
    t.after(async () => { await canvas.destroy(); host.remove(); });
    graph.groups.fold = { id: 'fold', title: 'Fold', collapsed: true, x: 800, y: 500, w: 300 };
    a.inGroup = b.inGroup = 'fold';
    canvas.render();
    canvas.geometry.measure('group:fold', 300, 120);
    canvas.setMulti(['a', 'b']);

    canvas.centerSelection();

    assert.deepEqual(graph.view, { x: -450, y: -160, zoom: 1 });
});

test('centering the graph unions visible folded cards and empty group frames', async t => {
    const { canvas, graph, host, a, b } = fixture();
    t.after(async () => { await canvas.destroy(); host.remove(); });
    graph.groups.fold = { id: 'fold', title: 'Fold', collapsed: true, x: 800, y: 500, w: 300 };
    graph.groups.empty = { id: 'empty', title: 'Empty', frame: { x: -200, y: -100, w: 200, h: 200 } };
    a.inGroup = b.inGroup = 'fold';
    canvas.render();
    canvas.geometry.measure('group:fold', 300, 120);

    canvas.centerSelection();

    assert.deepEqual(graph.view, { x: 50, y: 140, zoom: 1 });
});

test('centering a selected wire uses its exact measured pin endpoints', async t => {
    const { canvas, graph, host } = fixture();
    t.after(async () => { await canvas.destroy(); host.remove(); });
    canvas.geometry.measure('a', 160, 48, [{ id: 'out', direction: 'out', x: 120, y: 40 }]);
    canvas.geometry.measure('b', 160, 48, [{ id: 'in', direction: 'in', x: 10, y: 10 }]);
    canvas.select({ kind: 'wire', id: 'edge' });

    canvas.centerSelection();

    assert.deepEqual(graph.view, { x: 235, y: 325, zoom: 1 });
});

test('centering selected wires unions the wire set and primary wire while ignoring stale IDs', async t => {
    const { canvas, graph, host, b } = fixture();
    t.after(async () => { await canvas.destroy(); host.remove(); });
    graph.nodes.c = { ...b, id: 'c', x: 900, y: 350 };
    graph.nativeCards.c = structuredClone(graph.nativeCards.b);
    graph.wires.second = { id: 'second', route: 'wire', from: 'b', fromPort: 'out', to: 'c', toPort: 'in' };
    canvas.render();
    canvas.geometry.measure('a', 160, 48, [{ id: 'out', direction: 'out', x: 120, y: 40 }]);
    canvas.geometry.measure('b', 160, 48, [{ id: 'in', direction: 'in', x: 10, y: 10 }, { id: 'out', direction: 'out', x: 160, y: 35 }]);
    canvas.geometry.measure('c', 160, 48, [{ id: 'in', direction: 'in', x: 0, y: 24 }]);
    canvas.select({ kind: 'wire', id: 'edge' });
    canvas.wireMulti = new Set(['second', 'stale']);

    canvas.centerSelection();

    assert.deepEqual(graph.view, { x: -35, y: 183, zoom: 1 });
});

test('centering ignores unavailable node geometry instead of corrupting the camera', async t => {
    const { canvas, graph, host, b } = fixture();
    t.after(async () => { await canvas.destroy(); host.remove(); });
    b.x = NaN;
    canvas.multi = new Set(['a', 'b', 'stale']);

    canvas.centerSelection();

    assert.deepEqual(graph.view, { x: 370, y: 326, zoom: 1 });
});

test('centering a comment frame uses its authored width and height', async t => {
    const { canvas, graph, host } = fixture();
    t.after(async () => { await canvas.destroy(); host.remove(); });
    graph.nodes.comment = { id: 'comment', type: 'note', commentFrame: true, x: -300, y: 500, w: 640, h: 300 };
    graph.view.zoom = 1.25;
    canvas.render();
    canvas.select({ kind: 'node', id: 'comment' });

    canvas.centerSelection();

    assert.deepEqual(graph.view, { x: 475, y: -412.5, zoom: 1.25 });
});

test('centering is a no-op for unavailable wire endpoints, stale selections, and an empty graph', async t => {
    let commits = 0;
    const { canvas, graph, host } = fixture({ onViewCommit: () => commits++ });
    t.after(async () => { await canvas.destroy(); host.remove(); });
    Object.assign(graph.view, { x: 30, y: 40, zoom: 1.25 });
    canvas.geometry.clear();
    canvas.select({ kind: 'wire', id: 'edge' });
    canvas.centerSelection();
    assert.deepEqual(graph.view, { x: 30, y: 40, zoom: 1.25 });

    canvas.select({ kind: 'node', id: 'stale' });
    canvas.centerSelection();
    assert.deepEqual(graph.view, { x: 30, y: 40, zoom: 1.25 });

    graph.nodes = {}; graph.wires = {};
    canvas.select(null);
    canvas.render();
    canvas.centerSelection();
    assert.deepEqual(graph.view, { x: 30, y: 40, zoom: 1.25 });
    assert.equal(commits, 0);
});

test('centering freezes animated zoom at the displayed scale without later camera drift', async t => {
    const request = globalThis.requestAnimationFrame, cancel = globalThis.cancelAnimationFrame;
    const queued = new Map();
    let sequence = 0;
    globalThis.requestAnimationFrame = callback => { queued.set(++sequence, callback); return sequence; };
    globalThis.cancelAnimationFrame = ticket => queued.delete(ticket);
    const commits = [];
    const { canvas, graph, host } = fixture({ onViewCommit: () => commits.push({ ...graph.view }) });
    t.after(async () => {
        await canvas.destroy(); host.remove();
        globalThis.requestAnimationFrame = request; globalThis.cancelAnimationFrame = cancel;
    });
    canvas.select({ kind: 'node', id: 'a' });
    canvas.zoomBy(1.6, 200, 200);
    const initialFrames = [...queued.values()]; queued.clear();
    for (const frame of initialFrames) frame(16);
    const displayedZoom = graph.view.zoom;
    assert.ok(displayedZoom > 1 && displayedZoom < 1.6);

    canvas.centerSelection();

    assert.equal(graph.view.zoom, displayedZoom);
    assert.equal(graph.view.x, 500 - 130 * displayedZoom);
    assert.equal(graph.view.y, 400 - 74 * displayedZoom);
    const centered = { ...graph.view };
    for (let time = 32; time <= 256; time += 16) {
        const frames = [...queued.values()]; queued.clear();
        for (const frame of frames) frame(time);
    }
    assert.deepEqual(graph.view, centered);
    assert.deepEqual(commits.at(-1), centered);
    assert.equal(canvas.viewport.style.transform, `translate(${centered.x}px, ${centered.y}px) scale(${displayedZoom})`);
});

test('centering during a node drag leaves the camera and drag coordinates intact', async t => {
    let commits = 0;
    const { canvas, graph, host, a } = fixture({ onViewCommit: () => commits++ });
    t.after(async () => { await canvas.destroy(); host.remove(); });
    mouse(host.querySelector('[data-id="a"]'), 'mousedown', 80, 80);
    mouse(window, 'mousemove', 110, 120);
    assert.deepEqual([a.x, a.y], [80, 90]);

    canvas.centerSelection();
    mouse(window, 'mousemove', 120, 130);

    assert.deepEqual([a.x, a.y], [90, 100]);
    assert.deepEqual(graph.view, { x: 0, y: 0, zoom: 1 });
    assert.equal(commits, 0);
    mouse(window, 'mouseup', 120, 130);
});
