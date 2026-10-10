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
    assert.deepEqual(parts[0].at(-1), { x: from.x + direction(from.side) * 25, y: from.y }, 'source lead travels 25 graph pixels before its turn');
    assert.deepEqual(parts.at(-1)[0], { x: to.x + direction(to.side) * 25, y: to.y }, 'target lead travels 25 graph pixels from its pin');
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

// A forward turn should rotate directly from its horizontal lead toward the
// middle. Fixed horizontal handles used to make steep turns hook past the join,
// and simply shortening that handle still left an S-shaped inflection.
function forwardTurnFixtures() {
    return ['right', 'left'].flatMap(side => [-1, 1].flatMap(vertical => [
        { gap: 51, rise: 300 },
        { gap: 52, rise: 300 },
        { gap: 60, rise: 300 },
        { gap: 75, rise: 80 },
        { gap: 100, rise: 150 },
        { gap: 100, rise: 300 },
        { gap: 240, rise: 1200 },
    ].map(({ gap, rise }) => ({
        from: { x: 0, y: 0, side },
        to: { x: direction(side) * gap, y: vertical * rise, side: side === 'right' ? 'left' : 'right' },
        description: `${side} output, gap ${gap}, rise ${vertical * rise}`,
    }))));
}

function derivatives(points) {
    return points.slice(1).map((point, i) => ({
        x: (points.length - 1) * (point.x - points[i].x),
        y: (points.length - 1) * (point.y - points[i].y),
    }));
}

test('steep forward endpoint turns never hook back against the horizontal travel direction', () => {
    const failures = [];
    for (const { from, to, description } of forwardTurnFixtures()) {
        const result = route(from, to), parts = segments(result.d);
        assertPinNecks(result.d, from, to);
        assert.equal(parts[2].length, 2, 'a steep forward cable keeps a literal straight middle');
        for (const [name, turn, lead] of [
            ['source', parts[1], parts[0].at(-1)],
            ['target', parts[3], parts.at(-1)[0]],
        ]) {
            assert.ok(turn.every(point => distance(point, lead) <= 15), `${description}: ${name} turn stays compact`);
            const velocity = derivatives(turn);
            const minimumX = Math.min(...Array.from({ length: 1001 }, (_, index) => at(velocity, index / 1000).x * direction(from.side)));
            if (minimumX < -1e-8) failures.push(`${description}: ${name} turn reverses x tangent by ${minimumX}`);
        }
    }
    assert.deepEqual(failures, [], 'forward endpoint turns must not double back horizontally');
});

test('steep forward turns rotate once toward the middle without tangent overshoot or inflection', () => {
    const failures = [];
    for (const { from, to, description } of forwardTurnFixtures()) {
        const parts = segments(route(from, to).d);
        const horizontal = direction(from.side), vertical = Math.sign(to.y - from.y);
        const middle = parts[2];
        const middleAngle = Math.atan2((middle[1].y - middle[0].y) * vertical, (middle[1].x - middle[0].x) * horizontal);
        for (const [name, turn, rotation] of [['source', parts[1], 1], ['target', parts[3], -1]]) {
            const velocity = derivatives(turn), acceleration = derivatives(velocity);
            let previousAngle = name === 'source' ? 0 : middleAngle;
            for (let index = 0; index <= 1000; index++) {
                const t = index / 1000, v = at(velocity, t), a = at(acceleration, t);
                const angle = Math.atan2(v.y * vertical, v.x * horizontal);
                const curvature = (v.x * a.y - v.y * a.x) * horizontal * vertical * rotation;
                if (Math.hypot(v.x, v.y) < 1e-6 || angle < -1e-8 || angle > middleAngle + 1e-8
                    || (angle - previousAngle) * rotation < -1e-8 || curvature < -1e-8) {
                    failures.push(`${description}: ${name} changes its turn direction at t=${t} (angle ${angle}, middle ${middleAngle}, signed curvature ${curvature})`);
                    break;
                }
                previousAngle = angle;
            }
        }
    }
    assert.deepEqual(failures, [], 'endpoint tangents must rotate monotonically between the lead and middle directions');
});

test('settled wires use a literal direct middle span between compact turns', () => {
    for (const [from, to] of [
        [{ x: 20, y: 40, side: 'right' }, { x: 320, y: 170, side: 'left' }],
        [{ x: 300, y: 90, side: 'right' }, { x: 60, y: 90, side: 'left' }],
        [{ x: 300, y: 100, side: 'right' }, { x: 60, y: -200, side: 'left' }],
        [{ x: -123.75, y: -30.125, side: 'left' }, { x: -500.25, y: -180.875, side: 'right' }],
    ]) {
        const parts = segments(route(from, to).d);
        assert.equal(parts.length, 5, 'two leads and two compact turns frame one central span');
        assert.equal(parts[2].length, 2, 'the middle is a literal straight line');
        for (const [turn, lead] of [[parts[1], parts[0].at(-1)], [parts[3], parts.at(-1)[0]]]) {
            assert.ok(turn.every(point => distance(point, lead) <= 15), 'turn controls stay local instead of bowing across the canvas');
        }
    }
});

test('coincident lead ends have bounded continuous local curvature', () => {
    for (const fromSide of ['right', 'left']) for (const toSide of ['right', 'left']) {
        const from = { x: 0, y: 0, side: fromSide };
        const to = { x: 25 * (direction(fromSide) - direction(toSide)), y: 0, side: toSide };
        const result = route(from, to), points = samples(result.d);
        const lead = { x: 25 * direction(fromSide), y: 0 };
        assert.ok(points.every(point => Number.isFinite(point.x) && Number.isFinite(point.y)));
        assert.ok(points.some(point => Math.abs(point.y) >= 4), 'coincident leads keep a small local turn');
        assert.ok(segments(result.d).slice(1, -1).flat().every(point => distance(point, lead) <= 12), 'coincidence does not create a broad loop');
        for (const delta of [{ x: .001, y: 0 }, { x: -.001, y: 0 }, { x: 0, y: .001 }, { x: 0, y: -.001 }]) {
            const nearby = route(from, { ...to, x: to.x + delta.x, y: delta.y });
            const other = samples(nearby.d);
            assert.ok(Math.max(...points.map(point => Math.min(...other.map(candidate => distance(point, candidate))))) < .1,
                'crossing coincident leads cannot jump between opposite turn shapes');
            assert.ok(distance(result.label, nearby.label) < .1, 'coincident labels do not jump');
        }
    }
});

test('same-height backward connections retain a six-pixel stable returning turn', () => {
    const from = { x: 300, y: 90, side: 'right' }, to = { x: 60, y: 90, side: 'left' };
    const result = route(from, to);
    assertPinNecks(result.d, from, to);
    const points = samples(result.d);
    assert.ok(Math.max(...points.map(p => Math.abs(p.y - 90))) >= 5.9, 'returning wire does not collapse onto its baseline');
    assert.ok(points.every(p => Math.abs(p.y - 90) <= 6.001), 'returning turn remains only six pixels deep');
    assert.ok(points.every(p => p.y >= -30 && p.y <= 210 && p.x >= -30 && p.x <= 390), 'bow stays near endpoints without perimeter lanes');
    assert.deepEqual(route(from, to), result, 'same graph endpoints give deterministic geometry');
});

test('same-side level connections turn around either endpoint without a collinear cusp', () => {
    for (const [from, to] of [
        [{ x: 0, y: 0, side: 'right' }, { x: 100, y: 0, side: 'right' }],
        [{ x: 0, y: 0, side: 'right' }, { x: -100, y: 0, side: 'right' }],
        [{ x: 0, y: 0, side: 'left' }, { x: 100, y: 0, side: 'left' }],
        [{ x: 0, y: 0, side: 'left' }, { x: -100, y: 0, side: 'left' }],
    ]) {
        const result = route(from, to), parts = segments(result.d), points = samples(result.d);
        assertPinNecks(result.d, from, to);
        assert.ok(points.some(point => Math.abs(point.y) >= 5.9), 'a reversing endpoint needs a shallow return instead of doubling back along its baseline');
        assert.ok(points.every(point => Math.abs(point.y) <= 6.001), 'same-side returns keep the six-pixel depth');
        assert.equal(parts[2].length, 2, 'same-side returns retain a literal straight middle');
        for (const turn of [parts[1], parts[3]]) {
            const derivatives = turn.slice(1).map((point, i) => ({ x: 3 * (point.x - turn[i].x), y: 3 * (point.y - turn[i].y) }));
            for (let i = 0; i <= 1000; i++) {
                const tangent = at(derivatives, i / 1000);
                assert.ok(Math.hypot(tangent.x, tangent.y) > .1, 'the rounded turn has no interior zero-speed cusp');
            }
        }
    }
});

test('level backward wires take a shallow rounded shortcut', () => {
    for (const side of ['right', 'left']) for (const width of [80, 240, 600]) {
        const sign = direction(side);
        const from = { x: sign * 300, y: 90, side };
        const to = { x: sign * (300 - width), y: 90, side: side === 'right' ? 'left' : 'right' };
        const result = route(from, to), points = samples(result.d, 1000);
        assertPinNecks(result.d, from, to);
        assert.ok(points.every(point => Math.abs(point.y - 90) <= 6.001), 'level return depth stays shallow as the pins move apart');
        assert.ok(points.every(point => point.x * sign >= 267 - width && point.x * sign <= 333), 'rounded turns stay local to the pins');
        const interior = points.filter(point => point.x * sign >= 300 - width * .85 && point.x * sign <= 300 - width * .15);
        assert.ok(interior.length > 2);
        assert.ok(Math.max(...interior.map(point => point.y)) - Math.min(...interior.map(point => point.y)) < .5,
            'the central span is straight instead of a broad bowl');
    }
});

test('vertically separated backward connections flow diagonally through the middle', () => {
    for (const side of ['right', 'left']) for (const dy of [-300, 300]) {
        const sign = direction(side);
        const from = { x: sign * 300, y: 100, side };
        const to = { x: sign * 60, y: 100 + dy, side: side === 'right' ? 'left' : 'right' };
        const result = route(from, to);
        assertPinNecks(result.d, from, to);
        const middle = samples(result.d, 1000).filter(point => Math.abs(point.x - sign * 180) <= 4);
        assert.ok(middle.length >= 2, 'wire crosses the central strip');
        assert.ok((middle.at(-1).y - middle[0].y) * Math.sign(dy) > 4,
            'wire keeps moving toward the target instead of forming a horizontal shelf');
    }
});

test('steep backward connections stay centered between their endpoints', () => {
    for (const side of ['right', 'left']) for (const dy of [-300, 300]) {
        const sign = direction(side);
        const from = { x: sign * 300, y: 100, side };
        const to = { x: sign * 60, y: 100 + dy, side: side === 'right' ? 'left' : 'right' };
        const points = samples(route(from, to).d, 1000);
        const middle = points.reduce((best, point) => Math.abs(point.x - sign * 180) < Math.abs(best.x - sign * 180) ? point : best);
        assert.ok(Math.abs(middle.y - (100 + dy / 2)) < 2, 'steep wires have no artificial downward midpoint bias');
        assert.ok(points.every((point, i) => !i || (point.y - points[i - 1].y) * Math.sign(dy) >= -1e-8),
            'steep wires travel toward the target without vertical detours');
    }
});

test('steep backward connections keep port turns close to the pins', () => {
    for (const side of ['right', 'left']) for (const dx of [0, 80, 240]) for (const dy of [-300, 300]) {
        const sign = direction(side);
        const from = { x: sign * 300, y: 100, side };
        const to = { x: sign * (300 - dx), y: 100 + dy, side: side === 'right' ? 'left' : 'right' };
        const points = samples(route(from, to).d, 1000);
        assert.ok(points.every(point => point.x * sign <= 337 && point.x * sign >= 263 - dx),
            'port turns stay within 12px of the horizontal necks instead of forming wide hooks');
    }
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
        assert.ok(samples(result.d).some(p => Math.abs(p.y - from.y) >= 5), 'degenerate horizontal placement still gets compact curvature');
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

for (const x of [12, 50, 74]) test(`backward, close necks, and forward transitions remain stable at target gap ${x}`, () => {
    for (const side of ['right', 'left']) {
        const from = { x: 0, y: 0, side }, sign = direction(side);
        for (const y of [-300, -20, 0, 20, 300]) {
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
        const neckCoincidence = 25 * (direction(fromSide) - direction(toSide));
        assertAdjacentRoutesStayClose(from,
            { x: neckCoincidence, y: -0.001, side: toSide },
            { x: neckCoincidence, y: 0.001, side: toSide }, `coincident ${fromSide}/${toSide}`);
    }
});

test('nearly level lead ends cross their horizontal alignment without a return-depth jump', () => {
    for (const fromSide of ['right', 'left']) for (const toSide of ['right', 'left']) {
        const from = { x: 0, y: 0, side: fromSide };
        const alignedLeadX = 25 * (direction(fromSide) - direction(toSide));
        for (const y of [-6, -3, 3, 6]) {
            assertAdjacentRoutesStayClose(from,
                { x: alignedLeadX - .001, y, side: toSide },
                { x: alignedLeadX + .001, y, side: toSide }, `aligned lead x, y ${y}, sides ${fromSide}/${toSide}`);
        }
    }
});

test('rounded returns stay stable as the pins leave level alignment', () => {
    for (const side of ['right', 'left']) {
        const sign = direction(side), from = { x: sign * 300, y: 90, side };
        for (const dy of [-12, -6, 0, 6, 12]) {
            const target = { x: sign * 60, side: side === 'right' ? 'left' : 'right' };
            assertAdjacentRoutesStayClose(from, { ...target, y: 90 + dy - .001 }, { ...target, y: 90 + dy + .001 },
                `rounded return dy ${dy}, source ${side}`);
        }
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
test('extreme finite separation keeps every routed control point and label finite for all pin sides', () => {
    for (const fromSide of ['left', 'right']) for (const toSide of ['left', 'right']) {
        for (const x of [-1e155, -100, 100, 1e155]) for (const y of [-1e155, 1e155]) {
            const from = { x: 0, y: 0, side: fromSide }, to = { x, y, side: toSide };
            const result = route(from, to);
            assert.doesNotMatch(result.d, /NaN|Infinity/, `finite endpoints ${fromSide}/${toSide} ${x},${y} require finite SVG geometry`);
            const parts = segments(result.d);
            assert.deepEqual(parts[0][0], { x: 0, y: 0 });
            assert.deepEqual(parts.at(-1).at(-1), { x, y });
            assert.ok(parts.flat().every(point => Number.isFinite(point.x) && Number.isFinite(point.y)));
            assert.ok(Number.isFinite(result.label.x) && Number.isFinite(result.label.y));
        }
    }
});

test('nearly level returns stay shallow at extreme finite horizontal separations', () => {
    for (const side of ['right', 'left']) for (const width of [1e155, 1e160]) for (const dy of [-28, 0, 28]) {
        const sign = direction(side);
        const result = route({ x: 0, y: 0, side }, { x: -sign * width, y: dy, side: side === 'right' ? 'left' : 'right' });
        assert.ok(segments(result.d).flat().every(point => Math.abs(point.y) <= 128),
            'horizontal distance must not amplify tiny tangent errors into a vertical detour');
        assert.ok(Math.abs(result.label.y) <= 128, 'label stays with the shallow return');
    }
});

test('opposite extreme finite endpoints keep routed coordinates and arc labels finite', () => {
    for (const fromSide of ['left', 'right']) for (const toSide of ['left', 'right']) {
        const result = route({ x: -1e308, y: -1e308, side: fromSide }, { x: 1e308, y: 1e308, side: toSide });
        assert.doesNotMatch(result.d, /NaN|Infinity/);
        assert.ok(segments(result.d).flat().every(point => Number.isFinite(point.x) && Number.isFinite(point.y)));
        assert.ok(Number.isFinite(result.label.x) && Number.isFinite(result.label.y), 'half-arc label survives distances larger than Number.MAX_VALUE');
    }
});
