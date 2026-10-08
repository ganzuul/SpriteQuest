import { test, expect } from '@playwright/test';
async function setup(page) {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    return page.evaluate(() => window.canvasHarness.reset(25, 5));
}
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
