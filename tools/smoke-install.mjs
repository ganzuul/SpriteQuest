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
const server = createServer(async (request, response) => {
    try {
        const path = resolve(install, '.' + new URL(request.url, 'http://localhost').pathname);
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
        const node = S.addNode(graph, 'prompt', 40, 40); canvas.render(); canvas.select({ kind: 'node', id: node.id });
        UI.close(); window.sillyCanvas.open(); await settle();
        return { mounted: root === document.querySelector('.pc-root'), sharedGraph: graph === window.canvasHarness.graph,
            launchers: !!document.getElementById('pc-sendbar') && !!document.getElementById('pc-menu-launch'), workbench: root.dataset.pcWorkbench,
            output: !!root.querySelector('.pc-node-output'), node: !!root.querySelector(`[data-id="${node.id}"]`) };
    });
    if (errors.length || missing.length || !result.mounted || !result.sharedGraph || !result.launchers || !result.output || !result.node || result.workbench !== 'svelte') throw Error(JSON.stringify({ result, errors, missing }));
    if (requests.some(url => new URL(url).hostname !== '127.0.0.1')) throw Error('Production smoke made an external request');
    console.log(JSON.stringify({ install, nodeModules: false, developerUiSource: false, requests: requests.length, errors, missing, ...result }, null, 2));
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
