import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve, isAbsolute } from 'node:path';
import { JSDOM } from 'jsdom';
import { compiled } from './helpers/svelte-compile.mjs';

const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const key of ['Node', 'Element', 'Text', 'Comment', 'Document', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'MutationObserver', 'AbortController']) {
    Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
}
const { mount, unmount, flushSync, tick } = await import(new URL('../node_modules/svelte/src/index-client.js', import.meta.url));

async function fixture() {
    const directory = await mkdtemp(join(tmpdir(), 'lattice-guide-touch-'));
    const host = document.createElement('div');
    document.body.append(host);
    let mounted;
    const close = async () => {
        if (mounted) { await unmount(mounted); mounted = null; }
        host.remove();
        const rel = relative(resolve(tmpdir()), resolve(directory));
        assert.ok(rel && !rel.startsWith('..') && !isAbsolute(rel));
        await rm(directory, { recursive: true, force: true });
    };
    try {
        const { component } = await compiled('NodeGuideCanvas', directory);
        mounted = mount(component, { target: host, props: { scene: { cards: [], comments: [], connections: [] } } });
        flushSync(); await tick(); flushSync();
        const surface = host.querySelector('.pc-canvas-host'), viewport = host.querySelector('.pc-viewport');
        const captures = new Set(), released = [];
        surface.setPointerCapture = id => captures.add(id);
        surface.hasPointerCapture = id => captures.has(id);
        surface.releasePointerCapture = id => {
            captures.delete(id); released.push(id);
            pointer('lostpointercapture', id, 0, 0);
        };
        function pointer(type, id, x, y) {
            const event = new dom.window.MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX: x, clientY: y });
            Object.defineProperties(event, { pointerId: { value: id }, pointerType: { value: 'touch' } });
            surface.dispatchEvent(event);
        }
        const camera = () => viewport.style.transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px\) scale\(([-\d.]+)\)/).slice(1).map(Number);
        return { surface, viewport, pointer, camera, captures, released, close };
    } catch (error) { await close(); throw error; }
}

test('a lifted pinch finger leaves the captured remaining finger able to pan and releases it on teardown', async () => {
    const f = await fixture();
    try {
        f.pointer('pointerdown', 1, 100, 100);
        f.pointer('pointerdown', 2, 200, 100);
        f.pointer('pointermove', 2, 220, 100);
        const before = f.camera();
        // Browsers implicitly release the lifted pointer before lostpointercapture.
        f.captures.delete(2);
        f.pointer('pointerup', 2, 220, 100);
        f.pointer('lostpointercapture', 2, 220, 100);
        f.pointer('pointermove', 1, 130, 115);
        assert.deepEqual(f.camera(), [before[0] + 30, before[1] + 15, before[2]], 'remaining touch rebases its pan at the current zoom');
        assert.deepEqual([...f.captures], [1]);
        await f.close();
        assert.deepEqual([...f.captures], [], 'unmount explicitly releases the remaining touch');
        assert.deepEqual(f.released, [1]);
        const settled = f.viewport.style.transform;
        f.pointer('pointermove', 1, 300, 300);
        assert.equal(f.viewport.style.transform, settled, 'detached preview has no active gesture listeners');
    } finally { await f.close(); }
});

test('cancelling one captured touch releases that capture and preserves the remaining gesture', async () => {
    const f = await fixture();
    try {
        f.pointer('pointerdown', 3, 40, 50);
        f.pointer('pointerdown', 4, 100, 50);
        f.pointer('pointercancel', 4, 100, 50);
        assert.deepEqual([...f.captures], [3], 'cancelled capture is explicitly released');
        f.pointer('pointermove', 3, 45, 57);
        assert.deepEqual(f.camera(), [5, 7, 1]);
        await f.close();
        assert.deepEqual(f.released, [4, 3]);
        assert.deepEqual([...f.captures], []);
    } finally { await f.close(); }
});
