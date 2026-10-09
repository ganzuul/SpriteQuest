import assert from 'node:assert/strict';
import test from 'node:test';

let buildConnectionRoute;
try {
    ({ buildConnectionRoute } = await import('../src/canvas/connection-route.js'));
} catch (error) {
    if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
}

function route(from, to) {
    assert.equal(typeof buildConnectionRoute, 'function', 'shared connection route helper exists');
    return buildConnectionRoute(from, to);
}

// Interpret geometry so harmless SVG whitespace/command formatting changes do not break tests.
function segments(d) {
    const tokens = d.match(/[MLCQ]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi) ?? [];
    const result = [];
    let point;
    let index = 0;
    const read = () => ({ x: Number(tokens[index++]), y: Number(tokens[index++]) });
    while (index < tokens.length) {
        const command = tokens[index++].toUpperCase();
        if (command === 'M') point = read();
        else {
            assert.ok(['L', 'C', 'Q'].includes(command), 'route contains supported smooth geometry');
            const controls = Array.from({ length: command === 'C' ? 2 : command === 'Q' ? 1 : 0 }, read);
            const end = read();
            result.push([point, ...controls, end]);
            point = end;
        }
    }
    assert.ok(result.length);
    return result;
}
function at(points, t) {
    let row = points.map(point => ({ ...point }));
    while (row.length > 1) row = row.slice(1).map((point, i) => ({
        x: row[i].x * (1 - t) + point.x * t,
        y: row[i].y * (1 - t) + point.y * t,
    }));
    return row[0];
}
function samples(d, count = 400) {
    return segments(d).flatMap((part, i) => Array.from({ length: count + 1 }, (_, j) => at(part, j / count)).slice(i ? 1 : 0));
}
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const direction = side => side === 'left' ? -1 : 1;
function assertPinNecks(d, from, to) {
    const parts = segments(d);
    assert.deepEqual(parts[0][0], { x: from.x, y: from.y });
    assert.deepEqual(parts.at(-1).at(-1), { x: to.x, y: to.y });
    const nearStart = at(parts[0], 0.001), nearEnd = at(parts.at(-1), 0.999);
    assert.ok((nearStart.x - from.x) * direction(from.side) > 0, 'departure follows source side');
    assert.ok((nearEnd.x - to.x) * direction(to.side) > 0, 'arrival follows target side');
    assert.ok(Math.abs(nearStart.y - from.y) < 0.001, 'departure is horizontal');
    assert.ok(Math.abs(nearEnd.y - to.y) < 0.001, 'arrival is horizontal');
    const points = samples(d);
    const neckStart = points.find(p => (p.x - from.x) * direction(from.side) >= 12);
    const neckEnd = [...points].reverse().find(p => (p.x - to.x) * direction(to.side) >= 12);
    assert.ok(neckStart && Math.abs(neckStart.y - from.y) < 0.2, 'source neck clears inset pin');
    assert.ok(neckEnd && Math.abs(neckEnd.y - to.y) < 0.2, 'target neck clears inset pin');
    for (let i = 1; i < parts.length; i++) {
        const prev = parts[i - 1], next = parts[i];
        const left = { x: prev.at(-1).x - prev.at(-2).x, y: prev.at(-1).y - prev.at(-2).y };
        const right = { x: next[1].x - next[0].x, y: next[1].y - next[0].y };
        assert.ok(Math.hypot(left.x, left.y) > 0 && Math.hypot(right.x, right.y) > 0, 'joins have nonzero tangents');
        assert.ok(Math.abs(left.x * right.y - left.y * right.x) < 1e-5, 'joined curves have aligned tangents');
        assert.ok(left.x * right.x + left.y * right.y > 0, 'joined tangents keep direction');
    }
}

test('forward connections stay compact and leave/arrive horizontally', () => {
    const from = { x: 20, y: 40, side: 'right' }, to = { x: 320, y: 170, side: 'left' };
    const result = route(from, to);
    assertPinNecks(result.d, from, to);
    const points = samples(result.d);
    assert.ok(points.every(p => p.x >= 20 - 1e-8 && p.x <= 320 + 1e-8 && p.y >= 40 - 1e-8 && p.y <= 170 + 1e-8), 'forward curve stays inside endpoint rectangle');
    assert.ok(points.every((p, i) => !i || p.x >= points[i - 1].x), 'forward curve does not double back');
});

test('same-height backward connections retain a compact stable returning bow', () => {
    const from = { x: 300, y: 90, side: 'right' }, to = { x: 60, y: 90, side: 'left' };
    const result = route(from, to);
    assertPinNecks(result.d, from, to);
    const points = samples(result.d);
    assert.ok(Math.max(...points.map(p => Math.abs(p.y - 90))) >= 24, 'returning wire does not collapse onto its baseline');
    assert.ok(points.every(p => p.y >= -30 && p.y <= 210 && p.x >= -30 && p.x <= 390), 'bow stays near endpoints without perimeter lanes');
    assert.deepEqual(route(from, to), result, 'same graph endpoints give deterministic geometry');
});

test('close, vertical, and overlapping pins keep finite smooth necks', () => {
    for (const [from, to] of [
        [{ x: 100, y: 100, side: 'right' }, { x: 101, y: 101, side: 'left' }],
        [{ x: 100, y: 100, side: 'right' }, { x: 100, y: 360, side: 'left' }],
        [{ x: 100, y: 100, side: 'right' }, { x: 100, y: 100, side: 'left' }],
    ]) {
        const result = route(from, to);
        assertPinNecks(result.d, from, to);
        assert.ok(samples(result.d).every(p => Number.isFinite(p.x) && Number.isFinite(p.y)));
        assert.ok(Number.isFinite(result.label.x) && Number.isFinite(result.label.y));
        assert.ok(samples(result.d).some(p => Math.abs(p.y - from.y) >= 20), 'degenerate horizontal placement still gets curvature');
    }
});

test('port sides control both neck directions for every side combination', () => {
    for (const fromSide of ['left', 'right']) for (const toSide of ['left', 'right']) {
        const from = { x: 60, y: 30, side: fromSide }, to = { x: 300, y: 30, side: toSide };
        assertPinNecks(route(from, to).d, from, to);
    }
});

test('route labels lie halfway along the visible curve including returning bows', () => {
    for (const [from, to] of [
        [{ x: 20, y: 40, side: 'right' }, { x: 320, y: 170, side: 'left' }],
        [{ x: 300, y: 90, side: 'right' }, { x: 60, y: 90, side: 'left' }],
        [{ x: 400, y: -40, side: 'right' }, { x: 30, y: 190, side: 'left' }],
    ]) {
        const result = route(from, to), points = samples(result.d, 2000);
        const lengths = points.slice(1).map((point, i) => distance(point, points[i]));
        const half = lengths.reduce((sum, value) => sum + value, 0) / 2;
        let travelled = 0, expected = points[0];
        for (let i = 0; i < lengths.length; i++) {
            if (travelled + lengths[i] >= half) {
                expected = at([points[i], points[i + 1]], (half - travelled) / lengths[i]);
                break;
            }
            travelled += lengths[i];
        }
        assert.ok(distance(result.label, expected) < 0.5, 'label tracks half of visible arc length');
        assert.ok(Math.min(...points.map(p => distance(p, result.label))) < 0.5, 'label is on route, not baseline midpoint');
    }
});

test('ghost endpoints default to output-right and input-left geometry', () => {
    const from = { x: -30, y: 55 }, to = { x: 260, y: 20 };
    assert.deepEqual(route(from, to), route({ ...from, side: 'right' }, { ...to, side: 'left' }));
});

test('fractional negative graph coordinates preserve endpoint positions and finite labels', () => {
    const from = { x: -123.75, y: -30.125, side: 'left' }, to = { x: -125.25, y: -90.875, side: 'right' };
    const result = route(from, to);
    assertPinNecks(result.d, from, to);
    assert.ok(samples(result.d).every(p => Number.isFinite(p.x) && Number.isFinite(p.y)));
});


function assertAdjacentRoutesStayClose(from, firstTo, secondTo, description) {
    const first = route(from, firstTo), second = route(from, secondTo);
    const firstPoints = samples(first.d, 100), secondPoints = samples(second.d, 100);
    // Shape comparisons remain independent of command count by comparing the point sets.
    const displacement = Math.max(...firstPoints.map(point => Math.min(...secondPoints.map(other => distance(point, other)))));
    assert.ok(displacement < 0.1, `${description}: adjacent graph coordinates must not move the visible route materially (got ${displacement})`);
    assert.ok(distance(first.label, second.label) < 0.1, `${description}: route label must not jump`);
    assertPinNecks(first.d, from, firstTo);
    assertPinNecks(second.d, from, secondTo);
}

for (const x of [36, 60]) test(`close necks and forward transition remain stable at target gap ${x}`, () => {
    for (const side of ['right', 'left']) {
        const from = { x: 0, y: 0, side }, sign = direction(side);
        for (const y of [-20, 0, 20]) {
            const targetSide = side === 'right' ? 'left' : 'right';
            assertAdjacentRoutesStayClose(from,
                { x: sign * (x - 0.001), y, side: targetSide },
                { x: sign * (x + 0.001), y, side: targetSide }, `gap ${x}, y ${y}, source ${side}`);
        }
    }
});

test('coincident necks retain stable nonzero curvature as vertical displacement crosses zero', () => {
    for (const fromSide of ['right', 'left']) for (const toSide of ['right', 'left']) {
        const from = { x: 0, y: 0, side: fromSide };
        const neckCoincidence = 18 * (direction(fromSide) - direction(toSide));
        assertAdjacentRoutesStayClose(from,
            { x: neckCoincidence, y: -0.001, side: toSide },
            { x: neckCoincidence, y: 0.001, side: toSide }, `coincident ${fromSide}/${toSide}`);
    }
});

test('intermediate close-to-forward shapes preserve smooth joins and labels on the route', () => {
    for (const x of [36, 38, 42, 48, 54, 58, 60, 62]) for (const y of [-80, 0, 80]) {
        const from = { x: 0, y: 0, side: 'right' }, to = { x, y, side: 'left' };
        const result = route(from, to), points = samples(result.d, 1000);
        assertPinNecks(result.d, from, to);
        assert.ok(points.every(point => Number.isFinite(point.x) && Number.isFinite(point.y)));
        assert.ok(Math.min(...points.map(point => distance(point, result.label))) < 0.2, 'transition label remains on visible curve');
        assert.ok(points.every(point => point.x >= -80 && point.x <= x + 80 && point.y >= Math.min(0, y) - 120 && point.y <= Math.max(0, y) + 120), 'transition bow stays local');
    }
});
