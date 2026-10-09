import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { openEmber } from '../tests/browser/ember-fixture.mjs';

const root = fileURLToPath(new URL('../', import.meta.url)), base = 'http://127.0.0.1:4192';
const output = join(root, 'benchmark-results/interaction-visuals');
const version = JSON.parse(await readFile(join(root, 'manifest.json'), 'utf8')).version;
const evidence = { version, scope: 'Actual Svelte workspace with synthetic current authoring data and approved Ember tokens; synthetic public chat-bar anchors.', images: [], errors: [], blocked: [] };
const center = async locator => { const box = await locator.boundingBox(); return { x: box.x + box.width / 2, y: box.y + box.height / 2 }; };
await mkdir(output, { recursive: true });
let server, browser;
try {
    try { if ((await fetch(base + '/manifest.json', { signal: AbortSignal.timeout(300) })).ok) throw Error('Capture port already in use.'); }
    catch (error) { if (error.message === 'Capture port already in use.') throw error; }
    server = spawn(process.execPath, ['tools/serve-harness.mjs'], { cwd: root, env: { ...process.env, PORT: '4192' }, stdio: 'ignore', windowsHide: true });
    let ready = false;
    for (let attempt = 0; attempt < 80 && !ready; attempt++) {
        if (server.exitCode !== null) throw Error('Capture server exited.');
        try { ready = (await fetch(base + '/manifest.json')).ok; } catch {}
        if (!ready) await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(ready);
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    await page.route('**/*', route => {
        const request = route.request(), url = new URL(request.url());
        if (['data:', 'blob:'].includes(url.protocol)) return route.continue();
        if (url.origin !== base || !['GET', 'HEAD'].includes(request.method())) { evidence.blocked.push(request.method() + ' ' + url.href); return route.abort(); }
        if (url.pathname === '/script.js') return route.fulfill({ contentType: 'text/javascript', body: 'export const isGenerating=()=>false;export const syncMesToSwipe=()=>true;export const syncSwipeToMes=()=>true;' });
        return route.continue();
    });
    page.on('pageerror', error => evidence.errors.push(error.message));
    await openEmber(page, { url: base + '/tests/browser/harness.html' });
    const capture = async (name, locator) => { await page.evaluate(() => window.canvasHarness.settle()); await (locator ?? page).screenshot({ path: join(output, name + '.png') }); evidence.images.push(name + '.png'); };
    const reset = async () => page.evaluate(async () => { await window.canvasHarness.reset(); await window.canvasHarness.view({ x: 150, y: 40, zoom: 1 }); });
    await reset(); await capture('workspace');
    const canvas = page.locator('.pc-canvas-host'), bounds = await canvas.boundingBox();
    await page.mouse.click(bounds.x + bounds.width - 100, bounds.y + 80, { button: 'right' });
    await capture('node-search');
    await page.keyboard.press('Escape');
    const details = page.getByRole('separator', { name: 'Resize Details', exact: true }), at = await center(details);
    await page.mouse.move(at.x, at.y); await page.mouse.down(); await page.mouse.move(at.x - 120, at.y); await page.mouse.up();
    evidence.detailsWidth = (await page.locator('.pc-inspector').boundingBox()).width;
    await capture('details-resized');
    const preview = await center(page.getByRole('separator', { name: 'Resize preview', exact: true }));
    await page.mouse.move(preview.x, preview.y); await page.mouse.down(); await page.mouse.move(preview.x, preview.y + 500); await page.mouse.up();
    evidence.shelf = await page.locator('.pc-node-shelf').evaluate(element => { const style = getComputedStyle(element), row = element.querySelector('button').getBoundingClientRect(); return { clientWidth: element.clientWidth, scrollWidth: element.scrollWidth, clientHeight: element.clientHeight, scrollHeight: element.scrollHeight, rowHeight: row.height, rowWidth: row.width, overflowX: style.overflowX, scrollbarWidth: style.scrollbarWidth, scrollbarColor: style.scrollbarColor }; });
    assert.equal(evidence.shelf.rowHeight, 28); assert.ok(evidence.shelf.scrollWidth <= evidence.shelf.clientWidth);
    await capture('shelf-scrolled-preview');
    await page.goto(base + '/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness); await reset();
    // Preview size persists across reloads; restore room for visible pin targets.
    const restoredPreview = await center(page.getByRole('separator', { name: 'Resize preview', exact: true }));
    await page.mouse.move(restoredPreview.x, restoredPreview.y); await page.mouse.down(); await page.mouse.move(restoredPreview.x, restoredPreview.y - 500); await page.mouse.up();
    const source = page.locator('.pc-port[data-node="n0"][data-dir="out"][data-port="out"]'), target = page.locator('.pc-port[data-node="n2"][data-dir="in"][data-port="section.Text"]');
    const origin = await center(source), end = await center(target);
    await page.mouse.move(origin.x, origin.y); await page.mouse.down(); await page.mouse.move(origin.x + 2, origin.y + 3);
    await capture('pin-near-origin');
    evidence.freeCurve = await page.locator('.pc-wire-ghost').getAttribute('d');
    assert.equal((evidence.freeCurve.match(/C/g) ?? []).length, 1);
    await page.mouse.move(end.x, end.y, { steps: 4 });
    await page.waitForFunction(() => document.querySelector('.pc-port[data-node="n2"][data-dir="in"][data-port="section.Text"]').classList.contains('pc-pin-compatible'));
    await capture('pin-compatible-target'); await page.keyboard.press('Escape'); await page.mouse.up();
    evidence.providerCalls = await page.evaluate(() => window.canvasHarness.providerCalls());
    await page.evaluate(() => {
        window.canvasHarness.UI.close();
        const bar = document.createElement('div'); bar.id = 'polish-chatbar';
        bar.style.cssText = 'display:flex;align-items:center;gap:12px;margin:24px;background:#171717;color:#DCDCD2;border:1px solid #333;border-radius:8px;padding:6px;width:850px;box-sizing:border-box';
        const left = document.getElementById('leftSendForm'), right = document.getElementById('rightSendForm');
        left.hidden = right.hidden = false; left.style.cssText = right.style.cssText = 'display:flex;align-items:center;gap:8px';
        document.getElementById('options_button').textContent = '☰'; document.getElementById('options_button').style.fontSize = '30px';
        document.getElementById('send_but').textContent = '➤'; document.getElementById('send_but').style.fontSize = '30px';
        const field = document.createElement('textarea'); field.setAttribute('aria-label', 'Message'); field.placeholder = 'Type a message'; field.rows = 1;
        field.style.cssText = 'flex:1;background:transparent;border:0;resize:none;text-align:center;color:inherit';
        bar.append(left, field, right); document.body.append(bar);
    });
    evidence.launcher = await page.locator('#pc-sendbar').evaluate(element => ({ parent: element.parentElement.id, imageLoaded: element.querySelector('img').complete && element.querySelector('img').naturalWidth > 0 }));
    assert.equal(evidence.launcher.parent, 'leftSendForm'); assert.equal(evidence.launcher.imageLoaded, true);
    await capture('chatbar-left-logo', page.locator('#polish-chatbar'));
    assert.equal(evidence.providerCalls, 0); assert.deepEqual(evidence.errors, []); assert.deepEqual(evidence.blocked, []);
    evidence.status = 'passed'; await writeFile(join(output, 'capture.json'), JSON.stringify(evidence, null, 2) + '\n');
    console.log(JSON.stringify(evidence));
} finally { await browser?.close(); server?.kill(); }
