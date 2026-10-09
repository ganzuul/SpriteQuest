import { test, expect } from '@playwright/test';
test('native wires meet real left input and right output pins at nonidentity zoom', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(async () => {
        const version = (await (await fetch('/manifest.json')).json()).version;
        const { starterGraph } = await import(`/src/workflow/starters.js?v=${version}`);
        const { normalizeNativeGraph } = await import(`/src/workflow/migration.js?v=${version}`);
        const native = normalizeNativeGraph(starterGraph('native-guidance'));
        if (!native.ok) throw new Error(native.error.message);
        window.canvasHarness.canvas.setGraph(native.data);
        await window.canvasHarness.view({ x: 93, y: 47, zoom: .73 });
    });
    const geometry = await page.evaluate(() => {
        const { canvas } = window.canvasHarness;
        const wire = canvas.graph.wires['wire-1'];
        const path = canvas.svg.querySelector(`.pc-wire[data-id="${wire.id}"]`);
        const pin = (id, dir) => {
            const card = canvas.nodeLayer.querySelector(`.pc-node[data-id="${id}"]`);
            const target = card.querySelector(`.pc-port[data-dir="${dir}"]:not(.pc-port-strip)`);
            const box = card.getBoundingClientRect(), dot = target.getBoundingClientRect();
            return { x: dot.x + dot.width / 2, y: dot.y + dot.height / 2, left: box.left, right: box.right, top: box.top, bottom: box.bottom };
        };
        const screenPoint = length => {
            const point = path.getPointAtLength(length);
            const screen = new DOMPoint(point.x, point.y).matrixTransform(path.getScreenCTM());
            return { x: screen.x, y: screen.y };
        };
        return { input: pin(wire.to, 'in'), output: pin(wire.from, 'out'), start: screenPoint(0), end: screenPoint(path.getTotalLength()), zoom: canvas.view.zoom };
    });
    expect(geometry.zoom).toBe(.73);
    const { input, output, start, end } = geometry;
    // All tolerances are screen pixels, including the SVG points transformed by its actual matrix.
    expect.soft(Math.abs(input.x - input.left - 12 * geometry.zoom), 'native input sits inside the left edge, matching the approved proposal').toBeLessThanOrEqual(1);
    expect.soft(Math.abs(output.right - output.x - 12 * geometry.zoom), 'native output sits inside the right edge, matching the approved proposal').toBeLessThanOrEqual(1);
    expect.soft(input.y, 'input pin is inside the vertical card extent').toBeGreaterThan(input.top + 2);
    expect.soft(output.y, 'output pin is inside the vertical card extent').toBeLessThan(output.bottom - 2);
    expect.soft(Math.hypot(start.x - output.x, start.y - output.y), 'wire starts at the actual output pin center').toBeLessThanOrEqual(1);
    expect.soft(Math.hypot(end.x - input.x, end.y - input.y), 'wire ends at the actual input pin center').toBeLessThanOrEqual(1);
});
async function setup(page) {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    return page.evaluate(() => window.canvasHarness.reset(25, 5));
}
test('mixed native cards stay intrinsic and usable beneath the shelf at narrow widths', async ({ page }, testInfo) => {
    for (const width of [1024, 736, 360, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
        await page.evaluate(async () => {
            const { starterGraph } = await import('/src/workflow/starters.js?v=' + window.canvasHarness.version);
            const h = window.canvasHarness, graph = starterGraph('native-guidance');
            document.querySelector('.pc-root').classList.add('pc-hide-sidebar', 'pc-hide-inspector');
            const source = graph.nodes['scene-context'], compact = graph.nodes['smart-compactor'], plan = graph.nodes['response-plan'], terminal = graph.nodes.guidance;
            Object.assign(source, { x: 30, y: 300, presentation: { compact: true, alias: 'Scene' } });
            Object.assign(compact, { x: 155, y: 300, presentation: { alias: 'Keep the scene clear' } });
            Object.assign(plan, { x: 30, y: 460, presentation: { compact: true, alias: 'Plan' } });
            Object.assign(terminal, { x: 195, y: 460 });
            const belowShelf = document.querySelector('.pc-node-shelf').getBoundingClientRect().height / .85 + 30;
            source.y = compact.y = belowShelf; plan.y = terminal.y = belowShelf + 100;
            h.canvas.setGraph(graph); await h.view({ x: 0, y: 0, zoom: .85 });
        });
        const geometry = await page.evaluate(() => {
            const h = window.canvasHarness, card = h.canvas.nodeLayer.querySelector('[data-id="scene-context"]'), box = card.getBoundingClientRect();
            return { compact: h.canvas.widthOf(h.graph.nodes['scene-context']), normal: h.canvas.widthOf(h.graph.nodes['smart-compactor']), belowShelf: !!document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.closest('[data-id="scene-context"]'), overflow: document.documentElement.scrollWidth > innerWidth };
        });
        await page.screenshot({ path: testInfo.outputPath(`native-cards-${width}.png`) });
        expect(geometry.compact).toBeLessThan(geometry.normal);
        expect(geometry.normal).toBeLessThan(260);
        expect(geometry).toMatchObject({ belowShelf: true, overflow: false });
    }
});
test('native intrinsic geometry grows group frames and stays cached during camera frames', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(async () => {
        const { starterGraph } = await import('/src/workflow/starters.js?v=' + window.canvasHarness.version);
        const h = window.canvasHarness, graph = starterGraph('native-guidance');
        graph.nodes['smart-compactor'].inGroup = 'group';
        graph.groups.group = { id: 'group', title: 'Group', enabled: true, collapsed: false };
        graph.nodes['scene-context'].presentation = { compact: true, alias: 'Source' };
        h.canvas.setGraph(graph); await h.view({ x: 180, y: 20, zoom: .73 });
        const card = h.canvas.nodeLayer.querySelector('[data-id="smart-compactor"]');
        window.intrinsicProbe = { card, frameWidth: graph.groups.group.frame.w, path: h.canvas.svg.querySelector('[data-id="wire-1"].pc-wire') };
        card.style.minWidth = '350px';
    });
    await expect.poll(() => page.evaluate(() => window.canvasHarness.graph.groups.group.frame.w)).toBeGreaterThan(await page.evaluate(() => window.intrinsicProbe.frameWidth));
    const result = await page.evaluate(async () => {
        const h = window.canvasHarness, p = window.intrinsicProbe;
        await h.settle();
        const cardBox = p.card.getBoundingClientRect(), zoom = h.canvas.view.zoom;
        const cached = h.canvas.widthOf(h.graph.nodes['smart-compactor']);
        const rect = h.canvas.host.getBoundingClientRect(), d = p.path.getAttribute('d');
        const original = Element.prototype.getBoundingClientRect; let reads = 0;
        Element.prototype.getBoundingClientRect = function () { if (this.matches('.pc-node, .pc-port')) reads++; return original.call(this); };
        for (let i = 0; i < 12; i++) h.canvas.host.dispatchEvent(new WheelEvent('wheel', { deltaY: -2, clientX: rect.left + 400, clientY: rect.top + 150, cancelable: true }));
        await h.settle(); Element.prototype.getBoundingClientRect = original;
        const dot = p.card.querySelector('.pc-port-in').getBoundingClientRect();
        const end = p.path.getPointAtLength(p.path.getTotalLength()), screen = new DOMPoint(end.x, end.y).matrixTransform(p.path.getScreenCTM());
        return { cached, measured: cardBox.width / zoom, reads, sameCard: h.canvas.nodeLayer.contains(p.card), samePath: d === p.path.getAttribute('d'), endpointError: Math.hypot(screen.x - dot.x - dot.width / 2, screen.y - dot.y - dot.height / 2), compactWidth: h.canvas.widthOf(h.graph.nodes['scene-context']) };
    });
    expect(result.cached).toBeCloseTo(result.measured, 2);
    expect(result.compactWidth).toBeLessThan(160);
    expect(result).toMatchObject({ reads: 0, sameCard: true, samePath: true });
    expect(result.endpointError).toBeLessThanOrEqual(1);
});
test('native pin hover highlights only attached wires and body drops cancel linking', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(async () => {
        const { starterGraph } = await import('/src/workflow/starters.js?v=' + window.canvasHarness.version);
        window.canvasHarness.canvas.setGraph(starterGraph('native-guidance'));
        await window.canvasHarness.view({ x: 220, y: 0, zoom: .7 });
    });
    const card = page.locator('.pc-node[data-id="smart-compactor"]'), pin = card.locator('.pc-port-in');
    await card.locator('.pc-node-title').hover();
    await expect(page.locator('.pc-wire-feeds')).toHaveCount(0);
    await pin.hover();
    await expect(page.locator('.pc-wire-feeds')).toHaveCount(1);
    await expect(page.locator('.pc-wire-feeds')).toHaveAttribute('data-id', 'wire-1');
    await page.evaluate(() => { const h = window.canvasHarness; delete h.graph.wires['wire-1']; h.canvas.render(); });
    const output = await page.locator('.pc-node[data-id="scene-context"] .pc-port-out').boundingBox();
    const body = await card.locator('.pc-node-title').boundingBox();
    await page.mouse.move(output.x + output.width / 2, output.y + output.height / 2); await page.mouse.down();
    await page.mouse.move(body.x + body.width / 2, body.y + body.height / 2); await page.mouse.up();
    expect(await page.evaluate(() => Object.keys(window.canvasHarness.graph.wires).length)).toBe(2);
    await expect(page.locator('.pc-wire-ghost')).toHaveCount(0);
    const input = await pin.boundingBox();
    await page.mouse.move(output.x + output.width / 2, output.y + output.height / 2); await page.mouse.down();
    await page.mouse.move(input.x + input.width / 2, input.y + input.height / 2); await page.mouse.up();
    expect(await page.evaluate(() => Object.keys(window.canvasHarness.graph.wires).length)).toBe(3);
});
test('native compact aliases preserve identity, real pins and the execution signature', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.getByRole('button', { name: 'Toggle library', exact: true }).click();
    await page.getByRole('button', { name: 'Install Scene guidance' }).click();
    await page.getByRole('button', { name: 'Inspect Smart Compactor', exact: true }).click();
    const id = await page.evaluate(async () => {
        const h = window.canvasHarness, node = Object.values(h.graph.nodes).find(n => n.operation === 'smart-compactor');
        const { graphSemanticSignature } = await import('/src/workflow/ports.js?v=' + window.canvasHarness.version);
        window.compactProbe = { card: h.canvas.nodeLayer.querySelector(`[data-id="${node.id}"]`), signature: graphSemanticSignature(h.graph), signatureOf: graphSemanticSignature, title: node.title };
        window.compactProbe.port = window.compactProbe.card.querySelector('.pc-port-in');
        window.compactProbe.prepares = 0;
        const prepare = h.canvas.hooks.prepareRender;
        h.canvas.hooks.prepareRender = (...args) => { window.compactProbe.prepares++; return prepare(...args); };
        return node.id;
    });
    const alias = page.getByLabel('Alias', { exact: true });
    await expect(alias).toHaveAttribute('maxlength', '80');
    await alias.fill('<img src=x onerror=alert(1)> Quiet');
    await page.getByLabel('Compact card', { exact: true }).check();
    const card = page.locator(`.pc-node[data-id="${id}"]`);
    await expect(card).toHaveClass(/pc-node-compact/);
    await expect(card.locator('.pc-node-title')).toHaveText('<img src=x onerror=alert(1)> Quiet');
    await expect(card.locator('img')).toHaveCount(0);
    await expect(page.getByText('Canonical type: Smart Compactor', { exact: true })).toBeVisible();
    expect(await page.evaluate(id => {
        const h = window.canvasHarness, p = window.compactProbe;
        return { sameCard: h.canvas.nodeLayer.contains(p.card), samePin: p.card.contains(p.port), signature: p.signatureOf(h.graph) === p.signature, title: h.graph.nodes[id].title === p.title };
    }, id)).toEqual({ sameCard: true, samePin: true, signature: true, title: true });
    await page.getByRole('button', { name: 'Reset alias', exact: true }).click();
    await expect(alias).toHaveValue('');
    await expect(card.locator('.pc-node-title')).toHaveText('Smart Compactor');
    await card.locator('.pc-node-title').click(); await page.keyboard.press('F2');
    await expect(alias).toBeFocused();
    expect(await page.evaluate(() => window.compactProbe.prepares)).toBe(0);
    await expect(page.locator('.pc-node-native').filter({ has: page.locator('.pc-node-title', { hasText: 'Scene Context' }) }).locator('.pc-port-in')).toHaveCount(0);
    await expect(page.locator('.pc-node-native').filter({ has: page.locator('.pc-node-title', { hasText: 'Guidance' }) }).locator('.pc-port-out')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Preview host result', exact: true })).toBeVisible();
});
test('multi-drag keeps card and wire elements and reads no card heights', async ({ page }) => {
    const ids = await setup(page);
    await page.evaluate(ids => {
        const { canvas } = window.canvasHarness; canvas.setMulti(ids.slice(0, 3));
        window.renderProbe = { card: canvas.nodeLayer.querySelector(`[data-id="${ids[0]}"]`), wire: canvas.svg.querySelector('.pc-wire'), reads: 0 };
        const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
        window.renderProbe.descriptor = descriptor;
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get() { if (this.matches('.pc-node')) window.renderProbe.reads++; return descriptor.get.call(this); } });
    }, ids);
    const r = await page.locator(`.pc-node[data-id="${ids[0]}"]`).boundingBox();
    await page.mouse.move(r.x + 100, r.y + 40); await page.mouse.down(); await page.mouse.move(r.x + 140, r.y + 80, { steps: 5 });
    await page.evaluate(() => window.canvasHarness.settle());
    const result = await page.evaluate(() => {
        const { canvas } = window.canvasHarness; const p = window.renderProbe;
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', p.descriptor);
        return { card: canvas.nodeLayer.contains(p.card), wire: canvas.svg.contains(p.wire), reads: p.reads };
    });
    expect(result).toEqual({ card: true, wire: true, reads: 0 });
    await page.mouse.up();
});
test('ResizeObserver refreshes wire endpoints after a card grows', async ({ page }) => {
    const ids = await setup(page);
    const before = await page.evaluate(id => {
        const { canvas } = window.canvasHarness;
        const wire = Object.values(canvas.graph.wires).find(wire => wire.from === id);
        const path = canvas.svg.querySelector(`.pc-wire[data-id="${wire.id}"]`);
        const node = canvas.nodeLayer.querySelector(`[data-id="${id}"]`);
        window.resizeProbe = { path, d: path.getAttribute('d') };
        node.style.minHeight = '320px'; return window.resizeProbe.d;
    }, ids[0]);
    await expect.poll(() => page.evaluate(() => window.resizeProbe.path.getAttribute('d'))).not.toBe(before);
    expect(await page.evaluate(() => window.canvasHarness.canvas.svg.contains(window.resizeProbe.path))).toBe(true);
});
test('graph projections and selection updates preserve mounted cards and ports', async ({ page }) => {
    const ids = await setup(page);
    const result = await page.evaluate(id => {
        const { canvas, graph } = window.canvasHarness;
        const card = canvas.nodeLayer.querySelector(`[data-id="${id}"]`), port = card.querySelector('.pc-port-in');
        graph.nodes[id].title = 'Edited title'; canvas.render();
        canvas.select({ kind: 'node', id });
        return { card: canvas.nodeLayer.contains(card), port: card.contains(port), title: card.querySelector('.pc-node-title').textContent };
    }, ids[0]);
    expect(result).toEqual({ card: true, port: true, title: 'Edited title' });
});
