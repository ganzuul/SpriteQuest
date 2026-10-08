/** Unscaled card dimensions and local pin centers. Filled by layout batches, never camera frames. */
export function createGeometryCache() {
    const heights = new Map();
    const cards = new Map();
    return {
        get(id, fallback = 90) { return heights.get(id) ?? fallback; },
        width(id, fallback = 260) { return cards.get(id)?.width ?? fallback; },
        endpoint(id, direction, portId) { return cards.get(id)?.pins.find(pin => pin.direction === direction && pin.id === portId); },
        measure(id, width, height, pins = []) {
            const changedHeight = this.update(id, height);
            if (!Number.isFinite(width) || width <= 0) return changedHeight;
            const next = { width, pins };
            if (JSON.stringify(cards.get(id)) === JSON.stringify(next)) return changedHeight;
            cards.set(id, next); return true;
        },
        update(id, height) {
            if (!Number.isFinite(height) || height < 0 || (height === 0 && heights.get(id) > 0)) return false;
            const next = Math.round(height * 100) / 100;
            if (heights.get(id) === next) return false;
            heights.set(id, next); return true;
        },
        retain(ids) { const keep = new Set(ids); for (const map of [heights, cards]) for (const id of map.keys()) if (!keep.has(id)) map.delete(id); },
        clear() { heights.clear(); cards.clear(); },
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
