import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'benchmark-results', 'visuals'); await mkdir(output, { recursive: true });
const server = spawn(process.execPath, ['tools/serve-harness.mjs'], { cwd: root, env: { ...process.env, PORT: '4179' }, stdio: 'ignore', windowsHide: true });
let browser;
try {
    let ready = false;
    for (let i = 0; i < 60 && !ready; i++) {
        try { ready = (await fetch('http://127.0.0.1:4179/manifest.json')).ok; } catch {}
        if (!ready) await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!ready) throw new Error('Visual host did not start');
    browser = await chromium.launch();
    const results = [];
    for (const [name, width, height, theme, reduced] of [
        ['desktop', 1440, 1000, 'midnight', false], ['neon', 1440, 1000, 'neon', false],
        ['light', 1440, 1000, 'parchment', false], ['narrow', 700, 900, 'midnight', true],
    ]) {
        const page = await browser.newPage({ viewport: { width, height }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
        const errors = []; page.on('pageerror', error => errors.push(error.message));
        await page.goto('http://127.0.0.1:4179/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
        await page.evaluate(async theme => {
            const { canvas, S, UI, reset, settle } = window.canvasHarness;
            await reset(2, 2);
            const graph = canvas.graph;
            const gen = S.addNode(graph, 'generate', 40, 270); gen.title = 'Scene planner'; gen.content = 'Suggest one detail for the next scene.';
            const dec = S.addNode(graph, 'decider', 640, 40); dec.title = 'Scene route';
            const memory = S.addNode(graph, 'memory', 350, 270); memory.title = 'Scene notes';
            const out = S.outputNode(graph); out.x = 640; out.y = 350;
            const prompt = Object.values(graph.nodes).find(node => node.type === 'prompt');
            S.connect(graph, prompt.id, gen.id, 'merge'); S.connect(graph, gen.id, out.id, 'merge'); S.connect(graph, gen.id, memory.id, 'save');
            const version = (await (await fetch('/manifest.json')).json()).version;
            (await import('/src/theme.js?v=' + version)).setPreset(theme);
            canvas.render(); canvas.select({ kind: 'node', id: prompt.id }); canvas.fit(); UI.refreshIfOpen(); await settle();
        }, theme);
        const metrics = await page.evaluate(() => {
            const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
            return { canvas: rect('.pc-canvas-host'), controls: rect('.pc-canvas-controls'), header: rect('.pc-header'), zoom: document.querySelector('.pc-zoom-readout').textContent,
                reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, overflow: document.querySelector('.pc-header').scrollWidth > innerWidth };
        });
        const path = join(output, name + '.png'); await page.screenshot({ path });
        results.push({ name, theme, width, height, path, errors, ...metrics }); await page.close();
    }
    await writeFile(join(output, 'metrics.json'), JSON.stringify(results, null, 2));
    for (const result of results) console.log(JSON.stringify(result));
    if (results.some(result => result.errors.length || result.overflow || result.canvas.height < 100 || result.canvas.width < 100)) throw new Error('Visual harness errors or collapsed layout');
} finally { await browser?.close(); server.kill(); }
