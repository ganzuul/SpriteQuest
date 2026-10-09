/** Coalesce input bursts while allowing synchronous flushes on gesture completion. */
export function createFrameScheduler(render, { request = globalThis.requestAnimationFrame ?? (fn => setTimeout(() => fn(performance.now()), 16)), cancel = globalThis.cancelAnimationFrame ?? clearTimeout } = {}) {
    let frame = null;
    let dirty = 0;
    let generation = 0;
    let destroyed = false;
    function run(ticket, time) {
        if (destroyed || ticket !== generation) return;
        frame = null;
        const flags = dirty; dirty = 0;
        if (flags) render(flags, time ?? performance.now());
    }
    return {
        schedule(flags = 1) {
            if (destroyed) return;
            dirty |= flags;
            if (frame === null) { const ticket = ++generation; frame = request(time => run(ticket, time)); }
        },
        flush() {
            if (destroyed || !dirty) return;
            if (frame !== null) cancel(frame);
            frame = null; generation++;
            const flags = dirty; dirty = 0; render(flags, performance.now());
        },
        cancel() {
            if (frame !== null) cancel(frame);
            frame = null; dirty = 0; generation++;
        },
        destroy() { this.cancel(); destroyed = true; },
    };
}
