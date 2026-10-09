import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';

// Real controller, Svelte workbench and all auxiliary panes; synthetic host only.
const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2), source = resolve(args.find(arg => arg.startsWith('--source='))?.slice(9) || root);
const label = args.find(arg => arg.startsWith('--label='))?.slice(8) || 'final';
if (!/^[a-z0-9-]+$/.test(label)) throw Error('Use a simple output label.');
const base = 'http://127.0.0.1:4191', rows = [], errors = [], blocked = [];
const version = JSON.parse(await readFile(join(source, 'manifest.json'), 'utf8')).version;
let server, browser;
try {
    try { if ((await fetch(base + '/manifest.json', { signal: AbortSignal.timeout(300) })).ok) throw Error('Profile port already in use.'); }
    catch (error) { if (error.message === 'Profile port already in use.') throw error; }
    server = spawn(process.execPath, ['tools/serve-harness.mjs'], { cwd: source, env: { ...process.env, PORT: '4191' }, stdio: 'ignore', windowsHide: true });
    let ready = false;
    for (let i = 0; i < 80 && !ready; i++) {
        if (server.exitCode !== null) throw Error('Profile host exited.');
        try { ready = (await fetch(base + '/manifest.json')).ok; } catch {}
        if (!ready) await new Promise(resolveWait => setTimeout(resolveWait, 100));
    }
    if (!ready) throw Error('Profile host did not start.');
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    await page.route('**/*', route => {
        const request = route.request(), url = new URL(request.url());
        if (['data:', 'blob:'].includes(url.protocol)) return route.continue();
        if (url.origin !== base || !['GET', 'HEAD'].includes(request.method())) { blocked.push(request.method() + ' ' + url.href); return route.abort(); }
        if (url.pathname === '/script.js') return route.fulfill({ contentType: 'text/javascript', body: 'export const isGenerating=()=>false;export const syncMesToSwipe=()=>true;export const syncSwipeToMes=()=>true;' });
        return route.continue();
    });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    for (const size of [25, 100, 250]) for (const mode of ['pan', 'zoom', 'drag', 'select']) {
        await page.evaluate(async size => { const h = window.canvasHarness; await h.reset(size, 10); await h.view({ x: 150, y: 40, zoom: 1 }); }, size);
        const row = await page.evaluate(async ({ size, mode }) => {
            const h = window.canvasHarness, c = h.canvas, ids = Object.keys(h.graph.nodes), first = c.nodeLayer.querySelector('[data-id="' + ids[0] + '"]');
            const nodes = [...c.nodeLayer.querySelectorAll('.pc-node')], wires = [...c.svg.querySelectorAll('.pc-wire')];
            const authored = JSON.stringify(h.graph), json = JSON.stringify, clone = window.structuredClone;
            const height = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight'), rect = Element.prototype.getBoundingClientRect, render = c.render;
            const stats = { jsonCalls: 0, jsonMs: 0, cloneCalls: 0, cloneMs: 0, cardHeightReads: 0, pinRectReads: 0, renders: 0 };
            JSON.stringify = function (...args) { const start = performance.now(); try { return json.apply(this, args); } finally { stats.jsonCalls++; stats.jsonMs += performance.now() - start; } };
            window.structuredClone = function (...args) { const start = performance.now(); try { return clone.apply(this, args); } finally { stats.cloneCalls++; stats.cloneMs += performance.now() - start; } };
            Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get() { if (this.matches('.pc-node')) stats.cardHeightReads++; return height.get.call(this); } });
            Element.prototype.getBoundingClientRect = function () { if (this.matches('.pc-port')) stats.pinRectReads++; return rect.call(this); };
            c.render = function (...args) { stats.renders++; return render.apply(this, args); };
            const handlers = [], frames = []; let previous;
            let startHandlerMs, endHandlerMs;
            try {
                const downStart = performance.now();
                if (mode === 'pan') c.host.dispatchEvent(new MouseEvent('mousedown', { button: 1, clientX: 200, clientY: 500, bubbles: true }));
                if (mode === 'drag') first.querySelector('.pc-native-heading').dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 220, clientY: 480, bubbles: true }));
                startHandlerMs = performance.now() - downStart;
                for (let frame = 0; frame < 30; frame++) {
                    const stamp = await new Promise(resolveFrame => requestAnimationFrame(resolveFrame));
                    if (previous !== undefined) frames.push(stamp - previous); previous = stamp;
                    const start = performance.now();
                    if (mode === 'select') {
                        const card = c.nodeLayer.querySelector('[data-id="' + ids[frame % 2] + '"] .pc-native-heading');
                        card.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 220, clientY: 480, bubbles: true }));
                        c.host.dispatchEvent(new MouseEvent('mouseup', { button: 0, clientX: 220, clientY: 480, bubbles: true }));
                    } else for (let event = 0; event < 12; event++) {
                        if (mode === 'zoom') c.host.dispatchEvent(new WheelEvent('wheel', { deltaY: (frame % 2 ? -1 : 1) * 2, clientX: 600, clientY: 600, bubbles: true, cancelable: true }));
                        else c.host.dispatchEvent(new MouseEvent('mousemove', { clientX: 220 + (frame % 2 ? 12 : 6) + event / 2, clientY: 480 + frame / 3, bubbles: true }));
                    }
                    handlers.push(performance.now() - start);
                }
                const upStart = performance.now();
                c.host.dispatchEvent(new MouseEvent('mouseup', { button: mode === 'pan' ? 1 : 0, clientX: 240, clientY: 490, bubbles: true }));
                endHandlerMs = performance.now() - upStart;
                await h.settle();
            } finally {
                JSON.stringify = json; window.structuredClone = clone; Object.defineProperty(HTMLElement.prototype, 'offsetHeight', height); Element.prototype.getBoundingClientRect = rect; c.render = render;
            }
            if (mode !== 'drag' && JSON.stringify(h.graph) !== authored) throw Error('Camera/selection changed authored data.');
            const percentile = (values, fraction) => values.toSorted((a, b) => a - b)[Math.floor((values.length - 1) * fraction)];
            return { size, mode, eventsPerFrame: mode === 'select' ? 1 : 12, frames: 30, ...stats, startHandlerMs, endHandlerMs, handlerP95Ms: percentile(handlers, .95), maxHandlerMs: Math.max(...handlers), frameP95Ms: percentile(frames, .95), maxFrameMs: Math.max(...frames), framesOver25Ms: frames.filter(value => value > 25).length, nodesRetained: nodes.every(node => c.nodeLayer.contains(node)), wiresRetained: wires.every(wire => c.svg.contains(wire)), providerCalls: h.providerCalls(), auxiliaryPanesMounted: !!document.querySelector('.pc-inspector') && !!document.querySelector('.pc-preview-pane') };
        }, { size, mode });
        if (!row.nodesRetained || !row.wiresRetained || row.providerCalls || !row.auxiliaryPanesMounted) throw Error('Profile violated identity/host/full-workspace guards: ' + JSON.stringify(row));
        rows.push(row); console.log(JSON.stringify(row));
    }
    if (errors.length || blocked.length) throw Error(JSON.stringify({ errors, blocked }));
    const output = join(root, 'benchmark-results'); await mkdir(output, { recursive: true });
    await writeFile(join(output, 'interactions-' + label + '.json'), JSON.stringify({ source, version, scope: 'Full actual controller and Svelte workbench with inspector/preview mounted, 30 frames per sample, 12 input events per frame; 30 alternating node selections.', errors, blocked, rows }, null, 2));
} finally { await browser?.close(); server?.kill(); }
