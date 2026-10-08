import { test, expect } from '@playwright/test';
test('the real workbench opens with an Output card and no browser errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    await expect(page.locator('.pc-root.pc-open')).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Lattice', exact: true })).toBeVisible();
    await expect(page.locator('.pc-brand')).toHaveText('LATTICE');
    expect(await page.evaluate(() => window.lattice === window.sillyCanvas && window.lattice === window.promptCanvas && typeof window.lattice.open === 'function')).toBe(true);
    expect(await page.evaluate(() => window.latticeGenerationInterceptor === window.comfyTavernGenerationInterceptor && typeof window.latticeGenerationInterceptor === 'function')).toBe(true);
    await expect(page.locator('.pc-node-output')).toBeVisible();
    const bounds = await page.locator('.pc-canvas-host').boundingBox();
    expect(bounds.width).toBeGreaterThan(400);
    expect(bounds.height).toBeGreaterThan(400);
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => window.sillyCanvas.open === window.canvasHarness.UI.open && !!document.getElementById('pc-sendbar') && !!document.getElementById('pc-menu-launch'))).toBe(true);
});
