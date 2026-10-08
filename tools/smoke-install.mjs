import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, cp, mkdir, mkdtemp, access } from 'node:fs/promises';
import { join, resolve, extname, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const install = await mkdtemp(join(tmpdir(), 'sillycanvas-install-'));
for (const name of ['manifest.json', 'index.js', 'style.css', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'src', 'dist']) await cp(join(root, name), join(install, name), { recursive: true });
// Only the host mock accompanies the install; no developer UI source or dependencies.
await mkdir(join(install, 'tests', 'browser'), { recursive: true });
for (const name of ['tests/mock.js', 'tests/browser/harness.js', 'tests/browser/harness.html']) await cp(join(root, name), join(install, name));
let hasDependencies = true;
try { await access(join(install, 'node_modules')); } catch { hasDependencies = false; }
if (hasDependencies) throw new Error('The installation smoke must run without node_modules');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
// Host-owned public exports are separate from the copied extension distribution.
// The synthetic host is idle and only synchronizes its own mock chat messages.
const publicHostModule = `
    const context = () => globalThis.SillyTavern.getContext();
    export const isGenerating = () => false;
    export function syncMesToSwipe(index) {
        const m = context().chat[index], id = m?.swipe_id;
        if (!m || !Number.isInteger(id) || typeof m.swipes?.[id] !== 'string' || !Array.isArray(m.swipe_info)) return false;
        m.swipes[id] = m.mes;
        m.swipe_info[id] = { ...m.swipe_info[id], extra: structuredClone(m.extra || {}) };
        return true;
    }
    export function syncSwipeToMes(index, swipeId) {
        const m = context().chat[index];
        if (!m || !Number.isInteger(swipeId) || typeof m.swipes?.[swipeId] !== 'string') return false;
        m.swipe_id = swipeId; m.mes = m.swipes[swipeId];
        Object.assign(m, structuredClone(m.swipe_info?.[swipeId] || {}));
        return true;
    }
`;
const server = createServer(async (request, response) => {
    try {
        const pathname = new URL(request.url, 'http://localhost').pathname;
        if (pathname === '/script.js') { response.writeHead(200, { 'Content-Type': 'text/javascript' }).end(publicHostModule); return; }
        const path = resolve(install, '.' + pathname);
        if (!path.startsWith(install + sep)) { response.writeHead(403).end(); return; }
        const body = await readFile(path); response.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream' }).end(body);
    } catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch();
try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [], missing = [], requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) missing.push(response.url()); });
    page.on('request', request => requests.push(request.url()));
    await page.goto(`http://127.0.0.1:${server.address().port}/tests/browser/harness.html`); await page.waitForFunction(() => !!window.canvasHarness);
    const result = await page.evaluate(async () => {
        const { UI, S, canvas, settle } = window.canvasHarness, graph = canvas.graph, root = document.querySelector('.pc-root');
        const helpers = await import('/script.js'), context = globalThis.SillyTavern.getContext();
        const index = context.chat.length;
        const message = { mes: 'Synthetic original', swipe_id: 0, swipes: ['Synthetic original', 'Synthetic revision'], swipe_info: [{ send_date: 1, extra: {} }, { send_date: 2, extra: { revised: true } }], extra: { preserved: true } };
        context.chat.push(message);
        const publicHelpers = !helpers.isGenerating() && helpers.syncMesToSwipe(index) && message.swipe_info[0].extra.preserved === true && message.swipe_info[0].send_date === 1 && helpers.syncSwipeToMes(index, 1) && message.mes === 'Synthetic revision' && message.extra.revised === true && !helpers.syncMesToSwipe(index + 1) && !helpers.syncSwipeToMes(index, 9);
        context.chat.pop();
        const node = S.addNode(graph, 'prompt', 40, 40); canvas.render(); canvas.select({ kind: 'node', id: node.id });
        UI.close(); window.sillyCanvas.open(); await settle();
        return { publicHelpers, mounted: root === document.querySelector('.pc-root'), sharedGraph: graph === window.canvasHarness.graph,
            launchers: !!document.getElementById('pc-sendbar') && !!document.getElementById('pc-menu-launch'), workbench: root.dataset.pcWorkbench,
            output: !!root.querySelector('.pc-node-output'), node: !!root.querySelector(`[data-id="${node.id}"]`) };
    });
    if (errors.length || missing.length || !result.publicHelpers || !result.mounted || !result.sharedGraph || !result.launchers || !result.output || !result.node || result.workbench !== 'svelte') throw Error(JSON.stringify({ result, errors, missing }));
    if (requests.some(url => new URL(url).hostname !== '127.0.0.1')) throw Error('Production smoke made an external request');
    const apiRequests = requests.filter(url => new URL(url).pathname.startsWith('/api/')).length;
    if (apiRequests) throw Error('Production smoke made an unexpected host API/model request');
    console.log(JSON.stringify({ apiRequests, install, nodeModules: false, developerUiSource: false, requests: requests.length, errors, missing, ...result }, null, 2));
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
