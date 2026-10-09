import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const html = `<!doctype html><html><head><link rel="stylesheet" href="/style.css"><style>html,body{margin:0;font:16px Arial;background:#15151b}.pc-canvas-host{width:100%;height:100%}.pc-header,.pc-status,.pc-sidebar,.pc-inspector{display:none}</style></head><body><script type="module">
import { installMock } from '/tests/mock.js'; installMock();
const version=(await (await fetch('/manifest.json')).json()).version;
const {Canvas}=await import('/src/canvas.js?v='+version);
const theme=await import('/src/theme.js?v='+version);
const {operationDefaults}=await import('/src/workflow/catalog.js?v='+version);
const {prepareWorkspaceViews}=await import('/src/ui/workspace-preparation.js?v='+version);
let preparationRuns=0;
const prepare=graph=>{preparationRuns++;const result=prepareWorkspaceViews(graph);if(!result.ok)throw Error(JSON.stringify(result.error));const draw=structuredClone(result.data.preparedViews[0].drawBase);draw.view={...graph.view};return draw;};
const {mountWorkbench}=await import('/dist/lattice-ui.js?v='+version);
const workbench=mountWorkbench(document.body,{});workbench.root.classList.add('pc-open');
const canvas=new Canvas(workbench.parts.canvasHost,{onView:camera=>workbench.update({camera}),onSelect:()=>workbench.update({selectionCount:canvas.multi.size||(canvas.selection?.kind==='node'?1:0)}),onMulti:ids=>workbench.update({selectionCount:ids.length})});
window.bench={canvas,theme,prepare,operationDefaults,calls:()=>({preparationRuns})};
</script></body></html>`;
const server = createServer(async (request, response) => {
    try {
        const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        if (pathname === '/') { response.writeHead(200, { 'Content-Type': 'text/html' }); response.end(html); return; }
        const path = resolve(root, `.${pathname}`);
        if (!path.startsWith(root.endsWith(sep) ? root : root + sep)) { response.writeHead(403).end(); return; }
        const body = await readFile(path);
        response.writeHead(200, { 'Content-Type': extname(path) === '.css' ? 'text/css' : extname(path) === '.json' ? 'application/json' : 'text/javascript' }); response.end(body);
    } catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const errors = []; page.on('pageerror', error => errors.push(error.message));
const session = await page.context().newCDPSession(page); await session.send('Performance.enable');
const metrics = async () => Object.fromEntries((await session.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
const rows = [];
try {
    await page.goto(`http://127.0.0.1:${server.address().port}`); await page.waitForFunction(() => !!window.bench);
    for (const size of process.argv.includes('--quick') ? [100, 250] : [25, 100, 250]) for (const theme of ['ember', 'parchment', 'neon']) for (const zoom of [1, 2.2]) for (const mode of ['zoom', 'pan', 'multi-drag']) {
        const setup = await page.evaluate(async ({ size, theme, zoom, mode }) => {
            const b = window.bench, c = b.canvas; c.cancelGesture(); b.theme.setPreset(theme);
            const graph = { id: 'benchmark', name: 'Benchmark', schema:3,runtime:2,mode:'native-pre',roles:{},portals:{},definitions:{},nodes: {}, wires: {}, groups: {}, view: { x: 40, y: 40, zoom } };
            for (let i = 0; i < size; i++) {
                graph.nodes['n'+i] = { ...b.operationDefaults('compose'), id:'n'+i,type:'workflow',operation:'compose',operationVersion:1,enabled:true,title:'Text '+i,outputKind:'text',sections:[{name:'Text',text:'Synthetic native text. '.repeat(12)}],x:(i%8)*230,y:Math.floor(i/8)*180 };
                if(i>0)graph.wires['w'+i]={id:'w'+i,route:'wire',from:'n'+(i-1),fromPort:'out',to:'n'+i,toPort:'section.Text'};
            }
            const start = performance.now(); c.setGraph(b.prepare(graph)); const renderMs = performance.now() - start;
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            if (mode === 'pan') c.host.dispatchEvent(new MouseEvent('mousedown', { button: 1, clientX: 100, clientY: 100, bubbles: true }));
            if (mode === 'multi-drag') { c.setMulti(['n0', 'n1']); c.nodeLayer.querySelector('[data-id="n0"]').dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 100, clientY: 100, bubbles: true })); }
            return { renderMs, nodes: Object.keys(graph.nodes).length, wires: Object.keys(graph.wires).length };
        }, { size, theme, zoom, mode });
        const before = await metrics();
        const sample = await page.evaluate(async mode => {
            const b = window.bench, c = b.canvas, handlers = [], intervals = [];
            const node = c.nodeLayer.querySelector('.pc-node'), paths = [...c.svg.querySelectorAll('.pc-wire')];
            const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight'); let heightReads = 0;
            Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get() { if (this.matches('.pc-node')) heightReads++; return descriptor.get.call(this); } });
            const calls = b.calls(); let previous;
            for (let i = 0; i < 30; i++) {
                const stamp = await new Promise(resolve => requestAnimationFrame(resolve));
                if (previous !== undefined) intervals.push(stamp - previous); previous = stamp;
                const start = performance.now();
                if (mode === 'zoom') c.host.dispatchEvent(new WheelEvent('wheel', { deltaY: (i % 2 ? -1 : 1) * Math.log(1.1) / 0.002, clientX: 400, clientY: 350, bubbles: true, cancelable: true }));
                else c.host.dispatchEvent(new MouseEvent('mousemove', { clientX: 100 + (i % 2) * 12, clientY: 100 + (i % 2) * 8, bubbles: true }));
                handlers.push(performance.now() - start);
            }
            await new Promise(resolve => requestAnimationFrame(resolve));
            const result = { heightReads, nodeIdentityRetained: c.nodeLayer.contains(node), wireIdentityRetained: paths.every(path => c.svg.contains(path)), preparationRuns: b.calls().preparationRuns - calls.preparationRuns };
            Object.defineProperty(HTMLElement.prototype, 'offsetHeight', descriptor);
            const sorted = handlers.toSorted((a, b) => a - b), frames = intervals.toSorted((a, b) => a - b);
            c.host.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            return { ...result, handlerMedianMs: sorted[15], handlerP95Ms: sorted[28], frameMedianMs: frames[14], frameP95Ms: frames[27], framesOver25Ms: intervals.filter(time => time > 25).length };
        }, mode);
        const after = await metrics();
        const row = { size, theme, zoom, mode, ...setup, ...sample, layoutCount: after.LayoutCount - before.LayoutCount, layoutMs: (after.LayoutDuration - before.LayoutDuration) * 1000 };
        for (const key in row) if (typeof row[key] === 'number') row[key] = Math.round(row[key] * 100) / 100;
        if(row.heightReads!==0||!row.nodeIdentityRetained||!row.wireIdentityRetained||row.preparationRuns!==0)throw Error('Native camera/presentation work rebuilt preparation or geometry: '+JSON.stringify(row));
        rows.push(row); console.log(JSON.stringify(row));
    }
    const output = new URL('../benchmark-results/', import.meta.url); await mkdir(output, { recursive: true });
    await writeFile(new URL('latest.json', output), JSON.stringify({ browser: await browser.version(), viewport: { width: 1440, height: 900 }, scope: 'Real Svelte canvas, mounted workbench and camera/selection controls; auxiliary panes hidden for the matched full canvas viewport; current prepared schema3/runtime2 Compose cards; single named-pin Text chain; one preparation per admission; cursor-anchored 1.1x wheel steps; 30 animation frames per sample.', errors, rows }, null, 2));
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(`Saved ${rows.length} samples to benchmark-results/latest.json`);
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
