import assert from 'node:assert/strict';
import test from 'node:test';
const { buildDragConnectionRoute } = await import('../src/canvas/connection-route.js');

function preview(origin, pointer) {
    assert.equal(typeof buildDragConnectionRoute, 'function', 'free dragging has its own source-anchored curve');
    return buildDragConnectionRoute(origin, pointer);
}
function cubic(d) {
    assert.equal((d.match(/C/g) ?? []).length, 1, 'a free cursor uses one simple cubic');
    assert.equal((d.match(/[LQ]/g) ?? []).length, 0, 'a free cursor has no artificial target neck');
    const values = d.match(/[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi).map(Number);
    assert.equal(values.length, 8);
    return Array.from({ length: 4 }, (_, i) => ({ x: values[i * 2], y: values[i * 2 + 1] }));
}
function at(points, t) {
    let row = points;
    while (row.length > 1) row = row.slice(1).map((point, i) => ({ x: row[i].x * (1 - t) + point.x * t, y: row[i].y * (1 - t) + point.y * t }));
    return row[0];
}

test('near-origin free wire leaves either source horizontally without a returning bow', () => {
    for (const side of ['right', 'left']) for (const delta of [{ x: 1, y: 1 }, { x: 5, y: -2 }, { x: -4, y: 2 }]) {
        const sign = side === 'left' ? -1 : 1, origin = { x: 100, y: 80, side };
        const pointer = { x: origin.x + sign * delta.x, y: origin.y + delta.y }, points = cubic(preview(origin, pointer).d);
        assert.deepEqual(points[0], { x: 100, y: 80 });
        assert.deepEqual(points[3], pointer);
        assert.equal(points[1].y, origin.y);
        assert.ok((points[1].x - origin.x) * sign > 0, 'source tangent follows its pin side');
        for (let i = 0; i <= 100; i++) {
            const p = at(points, i / 100);
            assert.ok(p.y >= Math.min(origin.y, pointer.y) - 1e-8 && p.y <= Math.max(origin.y, pointer.y) + 1e-8, 'preview cannot bow away from the pointer');
            assert.ok(Math.abs(p.x - origin.x) <= 6, 'near-origin preview stays near the source');
        }
    }
});

test('free wire mirrors input-origin dragging and stays compact as the cursor is pulled out', () => {
    const right = { x: 0, y: 0, side: 'right' }, left = { ...right, side: 'left' };
    for (const pointer of [{ x: 0, y: 0 }, { x: 16, y: -10 }, { x: 120, y: 90 }, { x: 450, y: -240 }]) {
        const out = cubic(preview(right, pointer).d), input = cubic(preview(left, { x: -pointer.x, y: pointer.y }).d);
        for (let i = 0; i <= 100; i++) {
            const a = at(out, i / 100), b = at(input, i / 100);
            assert.ok(Math.abs(a.x + b.x) < 1e-8 && Math.abs(a.y - b.y) < 1e-8, 'reverse-input pull mirrors output pull');
            assert.ok(a.x >= -1e-8 && a.x <= pointer.x + 1e-8, 'outward pull does not double back');
        }
    }
});
