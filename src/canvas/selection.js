export function selectionMode({ altKey, shiftKey, ctrlKey, metaKey } = {}) {
    return altKey ? 'remove' : shiftKey || ctrlKey || metaKey ? 'add' : 'replace';
}
export function rectangle(a, b) {
    return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(b.x - a.x), h: Math.abs(b.y - a.y) };
}
export function intersects(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
export function combineSelection(initial, hits, mode) {
    const result = new Set(mode === 'replace' ? [] : initial);
    for (const id of hits) mode === 'remove' ? result.delete(id) : result.add(id);
    return result;
}
