import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, dom } from './canvas-fixture.mjs';

const pin = (env, node, dir) => env.host.querySelector(`.pc-port[data-node="${node}"][data-dir="${dir}"]`);
const gesture = feedback => ({ kind: 'drag', origin: { nodeId: 'a', dir: 'out', portId: 'out' }, target: { nodeId: 'b', dir: 'in', portId: 'in' }, ghost: { x: 350, y: 74 }, feedback });

test('hovering an unconnected pin highlights that pin and clears on leaving', async () => {
    const env = fixture();
    try {
        const output = pin(env, 'b', 'out');
        output.dispatchEvent(new dom.window.MouseEvent('mouseenter'));
        assert.ok(output.classList.contains('pc-pin-highlight'), 'an unconnected hovered pin still has visible feedback');
        assert.equal(pin(env, 'a', 'out').classList.contains('pc-pin-highlight'), false);
        output.dispatchEvent(new dom.window.MouseEvent('mouseleave'));
        assert.equal(output.classList.contains('pc-pin-highlight'), false);
    } finally { await env.canvas.destroy(); }
});

test('drag origin and checked target highlight independently of settled wire focus', async () => {
    const env = fixture();
    try {
        env.graph.wires = {}; env.canvas.render();
        const origin = pin(env, 'a', 'out'), target = pin(env, 'b', 'in');
        env.canvas.updateNativeWire({ gesture: gesture(null) }); env.canvas.frames.flush();
        assert.ok(origin.classList.contains('pc-pin-highlight'));
        assert.ok(target.classList.contains('pc-pin-target'), 'target is visible while compatibility is pending');
        assert.equal(target.classList.contains('pc-pin-compatible'), false);
        env.canvas.updateNativeWire({ gesture: gesture({ compatible: true }) }); env.canvas.frames.flush();
        assert.ok(target.classList.contains('pc-pin-compatible'), 'validated compatible target has affirmative feedback');
        assert.equal(target.classList.contains('pc-pin-invalid'), false);
        env.canvas.updateNativeWire({ gesture: gesture({ compatible: false }) }); env.canvas.frames.flush();
        assert.ok(target.classList.contains('pc-pin-invalid'), 'rejected target has distinct feedback');
        assert.equal(target.classList.contains('pc-pin-compatible'), false);
        env.canvas.updateNativeWire({ gesture: { kind: 'idle' } }); env.canvas.frames.flush();
        for (const element of [origin, target]) for (const name of ['pc-pin-highlight', 'pc-pin-target', 'pc-pin-compatible', 'pc-pin-invalid']) assert.equal(element.classList.contains(name), false, 'completed or cancelled drag clears feedback');
    } finally { await env.canvas.destroy(); }
});

test('pending and rejected source-pin hits keep the near-origin wire simple', async () => {
    const env = fixture();
    try {
        for (const dir of ['out', 'in']) for (const feedback of [null, { compatible: false }]) {
            const nodeId = dir === 'out' ? 'a' : 'b', origin = env.canvas.endpoint(nodeId, dir);
            const point = { x: origin.x + (dir === 'out' ? 2 : -2), y: origin.y + 1 };
            const source = { nodeId, dir, portId: dir };
            env.canvas.updateNativeWire({ gesture: { kind: 'drag', origin: source, target: source, ghost: point, feedback } }); env.canvas.frames.flush();
            const d = env.host.querySelector('.pc-wire-ghost').getAttribute('d');
            assert.equal(env.host.querySelector('.pc-wire-ghost').getAttribute('data-kind'), origin.kind, 'free preview carries the dragged artifact type for pin-matched color');
            assert.equal((d.match(/C/g) ?? []).length, 1, 'unadmitted source hit cannot introduce a settled returning bow');
            assert.equal((d.match(/L/g) ?? []).length, 0);
            const coordinates = d.match(/[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi).map(Number);
            assert.deepEqual(coordinates.slice(-2), [point.x, point.y], 'preview follows free cursor until destination is validated');
        }
    } finally { await env.canvas.destroy(); }
});

test('validated targets preview the same established wire from either origin direction', async () => {
    const env = fixture();
    try {
        env.b.x = 0; env.b.y = 200; env.canvas.render();
        const settled = env.host.querySelector('.pc-wire[data-id="edge"]').getAttribute('d');
        for (const dir of ['out', 'in']) {
            const source = dir === 'out' ? { nodeId: 'a', dir: 'out', portId: 'out' } : { nodeId: 'b', dir: 'in', portId: 'in' };
            const target = dir === 'out' ? { nodeId: 'b', dir: 'in', portId: 'in' } : { nodeId: 'a', dir: 'out', portId: 'out' };
            env.canvas.updateNativeWire({ gesture: { kind: 'drag', origin: source, target, ghost: { x: -500, y: -500 }, feedback: { compatible: true } } }); env.canvas.frames.flush();
            assert.equal(env.host.querySelector('.pc-wire-ghost').getAttribute('d'), settled, 'validated target snaps to measured real pin geometry');
            assert.equal(env.host.querySelector('.pc-wire-ghost').getAttribute('data-kind'), env.canvas.endpoint(source.nodeId, source.dir, source.portId).kind, 'snapped preview preserves type color from either origin direction');
        }
    } finally { await env.canvas.destroy(); }
});
