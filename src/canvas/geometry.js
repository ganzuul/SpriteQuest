/** Graph-space heights. Reads happen in a single batch or through ResizeObserver. */
export function createGeometryCache() {
    const heights = new Map();
    return {
        get(id, fallback = 90) { return heights.get(id) ?? fallback; },
        update(id, height) {
            if (!Number.isFinite(height) || height < 0 || (height === 0 && heights.get(id) > 0)) return false;
            const next = Math.round(height * 100) / 100;
            if (heights.get(id) === next) return false;
            heights.set(id, next); return true;
        },
        retain(ids) { const keep = new Set(ids); for (const id of heights.keys()) if (!keep.has(id)) heights.delete(id); },
        clear() { heights.clear(); },
    };
}

export function indexIncidentWires(wires) {
    const index = new Map();
    for (const wire of wires) for (const id of [wire.from, wire.to]) {
        if (!index.has(id)) index.set(id, new Set());
        index.get(id).add(wire.id);
    }
    return index;
}
