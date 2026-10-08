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
        await settle();
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', descriptor);
        return { reads, transforms, sameNode: node === canvas.nodeLayer.querySelector('.pc-node'), sameWire: wire === canvas.svg.querySelector('.pc-wire'), samePath: path === wire.getAttribute('d'), zoom: canvas.view.zoom };
    });
    expect(result).toMatchObject({ reads: 0, transforms: 1, sameNode: true, sameWire: true, samePath: true });
    expect(result.zoom).toBeCloseTo(Math.exp(0.06), 8);
});
