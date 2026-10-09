const NECK = 18;
const pointText = point => `${point.x},${point.y}`;
const offset = (point, x, y = 0) => ({ x: point.x + x, y: point.y + y });

function pointAt(points, t) {
    if (points.length === 2) return {
        x: points[0].x * (1 - t) + points[1].x * t,
        y: points[0].y * (1 - t) + points[1].y * t,
    };
    const u = 1 - t;
    return {
        x: u ** 3 * points[0].x + 3 * u ** 2 * t * points[1].x + 3 * u * t ** 2 * points[2].x + t ** 3 * points[3].x,
        y: u ** 3 * points[0].y + 3 * u ** 2 * t * points[1].y + 3 * u * t ** 2 * points[2].y + t ** 3 * points[3].y,
    };
}

// Approximate arc length, then evaluate the real curve at the interpolated parameter.
// The label is therefore on the SVG path even when the path has a returning bow.
function routeLabel(segments) {
    const intervals = [];
    let length = 0;
    for (const points of segments) {
        const steps = points.length === 2 ? 1 : 64;
        let previous = points[0];
        for (let i = 1; i <= steps; i++) {
            const next = pointAt(points, i / steps);
            const distance = Math.hypot(next.x - previous.x, next.y - previous.y);
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
 * Direct graph-space spline shared by settled wires, hit targets and drag previews.
 * Endpoints have finite x/y and side: 'left' | 'right'. Omitted sides default to
 * source-right and target-left, including ghost endpoints. No card bounds required.
 * Short horizontal necks clear the usual 12px pin inset; returning paths bow locally
 * and may pass behind cards. This helper does not perform obstacle routing.
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

    // Keep one topology and one bow side as close necks cross. Smoothly converge to
    // a midpoint-subdivided forward cubic once there is room for a compact spline.
    const gap = dx * fromDirection;
    const progress = fromDirection === -toDirection ? Math.min(1, Math.max(0, gap / 24)) : 0;
    const blend = progress * progress * (3 - 2 * progress);
    const span = Math.hypot(dx, dy);
    const bow = Math.min(96, Math.max(32, span * 0.2));
    const forwardHandle = Math.min(100, Math.max(0, gap) * 0.4);
    const returningHandle = Math.min(72, Math.max(24, span * 0.22));
    const endHandle = returningHandle * (1 - blend) + forwardHandle / 2 * blend;
    const forwardTangent = { x: (dx - fromDirection * forwardHandle) / 4, y: dy / 4 };
    const returningMiddleHandle = Math.min(64, Math.max(18, span * 0.18));
    const middleHandle = returningMiddleHandle * (1 - blend) + Math.hypot(forwardTangent.x, forwardTangent.y) * blend;
    // Rotating, instead of lerping opposite vectors, keeps the join tangent nonzero.
    // The forward angle is measured in the source side's local coordinate system.
    const forwardAngle = Math.atan2(fromDirection * forwardTangent.y, Math.max(0, fromDirection * forwardTangent.x));
    const angle = Math.PI * (1 - blend) + forwardAngle * blend;
    const tangent = { x: fromDirection * Math.cos(angle), y: fromDirection * Math.sin(angle) };
    const middle = { x: (departure.x + arrival.x) / 2,
        y: (departure.y + arrival.y) / 2 + fromDirection * bow * (1 - blend) };
    segments.push(
        [departure, offset(departure, fromDirection * endHandle), offset(middle, -tangent.x * middleHandle, -tangent.y * middleHandle), middle],
        [middle, offset(middle, tangent.x * middleHandle, tangent.y * middleHandle), offset(arrival, toDirection * endHandle), arrival],
    );
    segments.push([arrival, end]);
    const d = `M ${pointText(start)} ` + segments.map(points =>
        `${points.length === 2 ? 'L' : 'C'} ${points.slice(1).map(pointText).join(' ')}`).join(' ');
    return { d, label: routeLabel(segments) };
}
