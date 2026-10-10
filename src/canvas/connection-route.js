const NECK = 25;
const TURN = 12;
const RETURN_DEPTH = 6;
const pointText = point => `${point.x},${point.y}`;
const offset = (point, x, y = 0) => ({ x: point.x + x, y: point.y + y });
const mix = (a, b, weight) => ({ x: a.x * (1 - weight) + b.x * weight, y: a.y * (1 - weight) + b.y * weight });

function pointAt(points, t) {
    let row = points;
    while (row.length > 1) row = row.slice(1).map((point, i) => mix(row[i], point, t));
    return row[0];
}

// Approximate arc length, then evaluate the real curve at the interpolated parameter.
// The label is therefore on the SVG path even when the path has a returning bow.
function routeLabel(segments) {
    const intervals = [];
    let length = 0;
    // Normalize only the length calculation: finite graph endpoints may have a
    // separation larger than Number.MAX_VALUE. Evaluate labels in graph space.
    const scale = Math.max(1, ...segments.flat().flatMap(point => [Math.abs(point.x), Math.abs(point.y)]));
    for (const points of segments) {
        const steps = points.length === 2 ? 1 : 64;
        let previous = points[0];
        for (let i = 1; i <= steps; i++) {
            const next = pointAt(points, i / steps);
            const distance = Math.hypot(next.x / scale - previous.x / scale, next.y / scale - previous.y / scale);
            intervals.push({ points, start: (i - 1) / steps, end: i / steps, distance });
            length += distance;
            previous = next;
        }
    }
    let remaining = length / 2;
    for (const interval of intervals) {
        if (remaining <= interval.distance) {
            const fraction = interval.distance ? remaining / interval.distance : 0;
            return pointAt(interval.points, interval.start + (interval.end - interval.start) * fraction);
        }
        remaining -= interval.distance;
    }
    return segments.at(-1).at(-1);
}

/**
 * A free pointer has no arrival pin. Keep its preview to one source-anchored
 * cubic, with a horizontal departure that grows with the pull distance. Giving
 * the cursor a pin neck would create a returning bow while it is near the source.
 */
export function buildDragConnectionRoute(origin, pointer) {
    const start = { x: origin.x, y: origin.y }, end = { x: pointer.x, y: pointer.y };
    const direction = origin.side === 'left' ? -1 : 1;
    const handle = Math.min(100, Math.hypot(end.x - start.x, end.y - start.y) * 0.4);
    const points = [start, offset(start, direction * handle), end, end];
    return { d: `M ${pointText(start)} C ${points.slice(1).map(pointText).join(' ')}` };
}

/**
 * Direct graph-space route shared by settled wires and hit targets.
 * Endpoints have finite x/y and side: 'left' | 'right'. Omitted sides default to
 * source-right and target-left. No card bounds required.
 * Horizontal leads clear the usual 12px pin inset. Small smooth turns frame a
 * straight middle span, which may pass behind cards; there is no obstacle routing.
 * @param {{x: number, y: number, side?: string}} from
 * @param {{x: number, y: number, side?: string}} to
 * @returns {{d: string, label: {x: number, y: number}}}
 */
export function buildConnectionRoute(from, to) {
    const start = { x: from.x, y: from.y }, end = { x: to.x, y: to.y };
    const fromDirection = from.side === 'left' ? -1 : 1;
    const toDirection = to.side === 'right' ? 1 : -1;
    const departure = offset(start, fromDirection * NECK);
    const arrival = offset(end, toDirection * NECK);
    const dx = arrival.x - departure.x, dy = arrival.y - departure.y;
    const segments = [[start, departure]];

    const span = Math.hypot(dx, dy);
    let unit;
    if (!Number.isFinite(span)) {
        // Subtract scaled coordinates when even the endpoint difference overflows.
        const scale = Math.max(Math.abs(departure.x), Math.abs(departure.y), Math.abs(arrival.x), Math.abs(arrival.y));
        const x = arrival.x / scale - departure.x / scale, y = arrival.y / scale - departure.y / scale;
        const length = Math.hypot(x, y);
        unit = { x: x / length, y: y / length };
    } else unit = span ? { x: dx / span, y: dy / span } : { x: fromDirection, y: 0 };

    const bend = Math.min(TURN, span / 4), handle = Math.min(6, bend / 2);
    // Either endpoint can reverse against the middle chord, including a target
    // on the same side as its source. Grow the shallow return smoothly inside
    // the local fallback so crossing horizontal alignment cannot flip its depth.
    const returnProgress = Math.min(1, Math.max(0, -dx * fromDirection / TURN, dx * toDirection / TURN));
    const returnWeight = returnProgress * returnProgress * (3 - 2 * returnProgress);
    const returnDepth = returnWeight * RETURN_DEPTH * Math.max(0, 1 - Math.abs(dy) / 12);
    const normal = { x: -unit.y * returnDepth, y: unit.x * returnDepth };
    const directEntry = offset(departure, unit.x * bend + normal.x, unit.y * bend + normal.y);
    const directExit = offset(arrival, -unit.x * bend + normal.x, -unit.y * bend + normal.y);

    // The chord direction is undefined at coincident lead ends. Fade the direct
    // turns into one fixed small arch there, rather than flipping its normal.
    // Its middle span and tangent handles shrink continuously to zero.
    const progress = Math.min(1, span / (2 * TURN));
    const weight = progress * progress * (3 - 2 * progress);
    const apex = offset(mix(departure, arrival, .5), 0, -fromDirection * RETURN_DEPTH);
    const entry = mix(apex, directEntry, weight), exit = mix(apex, directExit, weight);
    const endHandle = 6 * (1 - weight) + handle * weight;
    const middleHandle = handle * weight;
    segments.push([departure, offset(departure, fromDirection * endHandle),
        offset(entry, -unit.x * middleHandle, -unit.y * middleHandle), entry]);
    if (entry.x !== exit.x || entry.y !== exit.y) segments.push([entry, exit]);
    segments.push([exit, offset(exit, unit.x * middleHandle, unit.y * middleHandle),
        offset(arrival, toDirection * endHandle), arrival], [arrival, end]);
    const d = `M ${pointText(start)} ` + segments.map(points =>
        `${points.length === 2 ? 'L' : 'C'} ${points.slice(1).map(pointText).join(' ')}`).join(' ');
    return { d, label: routeLabel(segments) };
}
