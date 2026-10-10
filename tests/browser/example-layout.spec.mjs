import { test, expect } from '@playwright/test';
test('Fit to view keeps opened lesson nodes clear of the floating shelf in root and helper views', async ({ page }) => {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    await page.getByRole('button', { name: 'File', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Open examples…', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Examples', exact: true });
    await dialog.getByRole('button', { name: 'Build one reusable item-card processor', exact: true }).click();
    await expect(dialog).toBeHidden();
    async function check() { await page.getByRole('button', { name: 'Graph', exact: true }).click(); await page.getByRole('menuitem', { name: 'Fit to view', exact: true }).click(); await expect.poll(() => page.evaluate(() => { const shelf = document.querySelector('.pc-node-shelf').getBoundingClientRect(); const nodes = [...document.querySelectorAll('.pc-canvas-host .pc-node-native')].map(n => n.getBoundingClientRect()); return Math.min(...nodes.map(n => n.left)) - shelf.right; })).toBeGreaterThan(8); }
    await check();
    await page.locator('.pc-canvas-host .pc-node-subgraph .pc-native-heading').first().dblclick();
    await expect(page.locator('.pc-graph-tabs [role="tab"]')).toHaveCount(2);
    await check();
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});
test('Fit to view includes every capstone node within the unobstructed canvas overview', async ({ page }) => {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    const lessons = await page.evaluate(async () => { const d = await import('/src/workflow/remastered-example-data.js?v=' + window.canvasHarness.version); return d.REMASTERED_WORKFLOW_EXAMPLE_DATA.filter(e => e.number >= 27).map(e => e.title); });
    expect(lessons).toHaveLength(4);
    for (const title of lessons) {
        await page.getByRole('button', { name: 'File', exact: true }).click();
        await page.getByRole('menuitem', { name: 'Open examples…', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: 'Examples', exact: true });
        await dialog.getByRole('button', { name: title, exact: true }).click();
        await expect(dialog).toBeHidden();
        await page.getByRole('button', { name: 'Graph', exact: true }).click();
        await page.getByRole('menuitem', { name: 'Fit to view', exact: true }).click();
        await expect.poll(() => page.evaluate(() => { const host = document.querySelector('.pc-canvas-host').getBoundingClientRect(), shelf = document.querySelector('.pc-node-shelf').getBoundingClientRect(); return [...document.querySelectorAll('.pc-canvas-host .pc-node-native')].every(n => { const r = n.getBoundingClientRect(); return r.left >= shelf.right + 8 && r.right <= host.right - 8 && r.top >= host.top + 8 && r.bottom <= host.bottom - 8; }); })).toBe(true);
    }
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});
