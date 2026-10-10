import { test, expect } from '@playwright/test';

test('wire type labels stay quiet until the connection is hovered or selected', async ({ page }) => {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(async () => {
        const h = window.canvasHarness;
        await h.reset(2, 2);
        Object.assign(h.graph.nodes.n0, { x: 100, y: 120 });
        Object.assign(h.graph.nodes.n1, { x: 650, y: 320 });
        h.S.touchGraph(h.graph); h.UI.refreshIfOpen(); await h.settle();
        h.canvas.select(null); h.view({ x: 80, y: 40, zoom: .85 });
    });
    const label = page.locator('.pc-wire-label[data-id="w1"]');
    const wire = page.locator('.pc-wire-native[data-id="w1"]');
    const currentLabel = page.locator('.pc-wire-label').first();
    expect(await currentLabel.evaluate(element => getComputedStyle(element).visibility), 'redundant type label is hidden in a resting graph').toBe('hidden');
    await expect(label).toHaveCount(1);
    const point = await wire.evaluate(path => {
        const at = path.getPointAtLength(path.getTotalLength() / 2);
        const screen = new DOMPoint(at.x, at.y).matrixTransform(path.getScreenCTM());
        return { x: screen.x, y: screen.y };
    });
    await page.mouse.move(point.x, point.y);
    await expect(label).toBeVisible();
    await page.mouse.move(10, 10);
    await expect(label).toBeHidden();
    await page.evaluate(() => window.canvasHarness.canvas.select({ kind: 'wire', id: 'w1' }));
    await expect(label).toBeVisible();
    await page.evaluate(() => window.canvasHarness.canvas.select(null));
    await expect(label).toBeHidden();
});
