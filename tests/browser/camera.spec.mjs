import { test, expect } from '@playwright/test';
test('wheel camera work preserves geometry and never measures node endpoints', async ({ page }) => {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(() => window.canvasHarness.reset(25, 5));
    const result = await page.evaluate(async () => {
        const { canvas, settle } = window.canvasHarness;
        const wire = canvas.svg.querySelector('.pc-wire');
        const node = canvas.nodeLayer.querySelector('.pc-node');
        const path = wire.getAttribute('d');
        const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
        let reads = 0;
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get() { if (this.matches('.pc-node')) reads++; return descriptor.get.call(this); } });
        let transforms = 0; const apply = canvas.applyTransform.bind(canvas);
        canvas.applyTransform = () => { transforms++; apply(); };
        const rect = canvas.host.getBoundingClientRect();
        for (let i = 0; i < 30; i++) canvas.host.dispatchEvent(new WheelEvent('wheel', { deltaY: -1, clientX: rect.left + 200, clientY: rect.top + 200, cancelable: true }));
        while (canvas.host.classList.contains('pc-interacting')) await settle();
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', descriptor);
        return { reads, transforms, sameNode: node === canvas.nodeLayer.querySelector('.pc-node'), sameWire: wire === canvas.svg.querySelector('.pc-wire'), samePath: path === wire.getAttribute('d'), zoom: canvas.view.zoom };
    });
    expect(result).toMatchObject({ reads: 0, sameNode: true, sameWire: true, samePath: true });
    expect(result.transforms).toBeGreaterThan(2);
    expect(result.transforms).toBeLessThan(30);
    expect(result.zoom).toBeCloseTo(Math.exp(0.06), 8);
});

test('a mouse wheel notch animates with the graph point fixed under the pointer', async ({ page }) => {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(() => window.canvasHarness.reset(25, 5));
    const samples = await page.evaluate(async () => {
        const { canvas } = window.canvasHarness, rect = canvas.host.getBoundingClientRect();
        const x = rect.left + 400, y = rect.top + 300, samples = [];
        canvas.host.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, clientX: x, clientY: y, cancelable: true }));
        do {
            await new Promise(resolve => requestAnimationFrame(resolve));
            const point = canvas.toGraph(x, y);
            const matrix = new DOMMatrix(getComputedStyle(canvas.viewport).transform);
            samples.push({ zoom: canvas.view.zoom, matrixZoom: matrix.a, x: point.x, y: point.y, grid: parseFloat(canvas.host.style.backgroundSize) });
        } while (canvas.host.classList.contains('pc-interacting'));
        return samples;
    });
    expect(samples.length).toBeGreaterThan(3);
    expect(samples[0].zoom).toBeGreaterThan(.7866278610665534);
    expect(samples[0].zoom).toBeLessThan(1);
    for (let index = 0; index < samples.length; index++) {
        const sample = samples[index];
        expect(sample.x).toBeCloseTo(400, 7); expect(sample.y).toBeCloseTo(300, 7);
        expect(sample.matrixZoom).toBeCloseTo(sample.zoom, 5);
        // CSSOM rounds serialized pixel values; allow less than a thousandth of a pixel.
        expect(Math.abs(sample.grid - 24 * sample.zoom)).toBeLessThan(.001);
        if (index) expect(sample.zoom).toBeLessThanOrEqual(samples[index - 1].zoom);
    }
    expect(samples.at(-1).zoom).toBeCloseTo(.7866278610665534, 10);
});

test('system reduced motion keeps wheel zoom immediate', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(() => window.canvasHarness.reset());
    const zoom = await page.evaluate(async () => {
        const { canvas, settle } = window.canvasHarness, rect = canvas.host.getBoundingClientRect();
        canvas.host.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, clientX: rect.left + 200, clientY: rect.top + 200, cancelable: true }));
        await settle(); return canvas.view.zoom;
    });
    expect(zoom).toBeCloseTo(.7866278610665534, 10);
});
