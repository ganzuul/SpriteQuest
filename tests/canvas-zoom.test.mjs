import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, dom, mouse } from './canvas-fixture.mjs';

function holdFrames() {
    const request = globalThis.requestAnimationFrame, cancel = globalThis.cancelAnimationFrame;
    let sequence = 0, time = 0;
    const queued = new Map();
    globalThis.requestAnimationFrame = callback => { queued.set(++sequence, callback); return sequence; };
    globalThis.cancelAnimationFrame = ticket => queued.delete(ticket);
    return {
        size: () => queued.size,
        step(delta = 16) { time += delta; const callbacks = [...queued.values()]; queued.clear(); callbacks.forEach(callback => callback(time)); },
        settle() { for (let i = 0; queued.size && i < 30; i++) this.step(); assert.equal(queued.size, 0, 'zoom stops requesting frames'); },
        restore() { globalThis.requestAnimationFrame = request; globalThis.cancelAnimationFrame = cancel; },
    };
}
function wheel(host, deltaY, x = 200, y = 200) {
    host.dispatchEvent(new dom.window.WheelEvent('wheel', { deltaY, clientX: x, clientY: y, bubbles: true, cancelable: true }));
}
function near(actual, expected) { assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} should be near ${expected}`); }

test('a wheel notch eases across frames with cursor, grid and hit testing aligned', async () => {
    const frames = holdFrames(), f = fixture();
    let paints = 0, measures = 0;
    const measure = f.canvas.geometry.measure.bind(f.canvas.geometry);
    f.canvas.geometry.measure = (...args) => { measures++; return measure(...args); };
    f.canvas.hooks.onView = () => paints++;
    const node = f.host.querySelector('.pc-node'), wire = f.host.querySelector('.pc-wire'), path = wire.getAttribute('d');
    try {
        wheel(f.host, 120);
        assert.equal(f.canvas.view.zoom, 1, 'the input event queues a target instead of jumping to it');
        assert.equal(frames.size(), 1);
        frames.step();
        assert.ok(f.canvas.view.zoom < 1 && f.canvas.view.zoom > 0.7866278610665534, 'first paint is between the old and requested scales');
        let previous = f.canvas.view.zoom;
        while (frames.size()) {
            frames.step();
            assert.ok(f.canvas.view.zoom <= previous, 'zoom out moves monotonically');
            previous = f.canvas.view.zoom;
            const point = f.canvas.toGraph(200, 200);
            near(point.x, 200); near(point.y, 200);
            near(parseFloat(f.host.style.backgroundSize), 24 * f.canvas.view.zoom);
            assert.equal(f.canvas.viewport.style.transform, `translate(${f.canvas.view.x}px, ${f.canvas.view.y}px) scale(${f.canvas.view.zoom})`);
        }
        near(f.canvas.view.zoom, 0.7866278610665534);
        assert.ok(paints > 2 && paints < 20, 'motion finishes within a short animation');
        assert.equal(measures, 0);
        assert.equal(f.host.querySelector('.pc-node'), node); assert.equal(f.host.querySelector('.pc-wire'), wire); assert.equal(wire.getAttribute('d'), path);
    } finally { await f.canvas.destroy(); frames.restore(); }
});

test('wheel retargeting retains all deltas and anchors at the newly displayed cursor point', async () => {
    const frames = holdFrames(), f = fixture();
    try {
        wheel(f.host, 120); frames.step(); frames.step();
        const before = { ...f.canvas.view }, anchor = f.canvas.toGraph(300, 120);
        wheel(f.host, -60, 300, 120); wheel(f.host, -30, 300, 120);
        assert.deepEqual(f.canvas.view, before, 'retargeting does not jump the camera');
        assert.equal(frames.size(), 1);
        while (frames.size()) {
            frames.step(); const point = f.canvas.toGraph(300, 120); near(point.x, anchor.x); near(point.y, anchor.y);
        }
        near(f.canvas.view.zoom, 0.9417645335842487); // exp(-(120 - 60 - 30) * .002)
    } finally { await f.canvas.destroy(); frames.restore(); }
});

test('starting a pan stops zoom at the displayed camera without a jump or later drift', async () => {
    const frames = holdFrames(), f = fixture();
    try {
        wheel(f.host, 120); frames.step(); const before = { ...f.canvas.view };
        mouse(f.host, 'mousedown', 20, 20, { button: 1 });
        assert.deepEqual(f.canvas.view, before);
        frames.settle(); assert.deepEqual(f.canvas.view, before);
        mouse(window, 'mousemove', 50, 60, { button: 1 }); frames.step();
        near(f.canvas.view.x, before.x + 30); near(f.canvas.view.y, before.y + 40); near(f.canvas.view.zoom, before.zoom);
        mouse(window, 'mouseup', 50, 60, { button: 1 }); frames.settle();
        near(f.canvas.view.zoom, before.zoom);
    } finally { await f.canvas.destroy(); frames.restore(); }
});

test('zoom buttons accumulate smoothly and settle at the existing limits', async () => {
    const frames = holdFrames(), f = fixture();
    try {
        f.canvas.zoomBy(1.15, 200, 200); f.canvas.zoomBy(1.15, 200, 200);
        assert.equal(f.canvas.view.zoom, 1); frames.step();
        assert.ok(f.canvas.view.zoom > 1 && f.canvas.view.zoom < 1.3225);
        frames.settle(); near(f.canvas.view.zoom, 1.3225);
        f.canvas.zoomBy(100, 200, 200); frames.settle(); assert.equal(f.canvas.view.zoom, 2.5);
        f.canvas.zoomBy(.0001, 200, 200); frames.settle(); assert.equal(f.canvas.view.zoom, .25);
        wheel(f.host, 120); assert.equal(frames.size(), 0, 'wheel at the limit starts no animation');
    } finally { await f.canvas.destroy(); frames.restore(); }
});

test('reduced motion applies wheel zoom in one paint', async () => {
    const frames = holdFrames(), original = window.matchMedia;
    window.matchMedia = query => ({ matches: query === '(prefers-reduced-motion: reduce)' });
    const f = fixture();
    try {
        wheel(f.host, 120); frames.step();
        near(f.canvas.view.zoom, 0.7866278610665534); assert.equal(frames.size(), 0);
    } finally { await f.canvas.destroy(); window.matchMedia = original; frames.restore(); }
});

test('switching graphs cancels zoom frames and leaves the new camera untouched', async () => {
    const frames = holdFrames(), f = fixture();
    try {
        wheel(f.host, -120); frames.step();
        const replacement = structuredClone(f.graph); replacement.id = 'next'; replacement.view = { x: 90, y: 70, zoom: .8 };
        f.canvas.setGraph(replacement); frames.settle();
        assert.deepEqual(f.canvas.view, { x: 90, y: 70, zoom: .8 });
        assert.equal(f.canvas.viewport.style.transform, 'translate(90px, 70px) scale(0.8)');
    } finally { await f.canvas.destroy(); frames.restore(); }
});

test('starting a node drag freezes zoom at the displayed scale', async () => {
    const frames = holdFrames(), f = fixture();
    try {
        wheel(f.host, 120); frames.step(); const before = { ...f.canvas.view };
        mouse(f.host.querySelector('[data-id="a"]'), 'mousedown', 80, 80);
        frames.settle(); assert.deepEqual(f.canvas.view, before);
        mouse(window, 'mousemove', 110, 120); frames.step();
        assert.ok(f.a.x > 50 && f.a.y > 50, 'the node drag still moves its presentation');
        assert.deepEqual(f.canvas.view, before, 'dragging never resumes the interrupted zoom');
        mouse(window, 'mouseup', 110, 120);
    } finally { await f.canvas.destroy(); frames.restore(); }
});

for (const method of ['fit', 'fitSelection']) test(`${method} during zoom retains its fitted camera on later frames`, async () => {
    const frames = holdFrames(), f = fixture();
    try {
        wheel(f.host, 120); frames.step(); f.canvas.setMulti(['a']);
        f.canvas[method](); const fitted = { ...f.canvas.view };
        frames.settle(); assert.deepEqual(f.canvas.view, fitted);
        assert.equal(f.canvas.viewport.style.transform, `translate(${fitted.x}px, ${fitted.y}px) scale(${fitted.zoom})`);
    } finally { await f.canvas.destroy(); frames.restore(); }
});
