import { test, expect } from '@playwright/test';

async function launch(page) {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(async () => {
        await window.canvasHarness.activate({ id: 'shelf-drag', name: 'Shelf drag', schema: 3, runtime: 2, mode: 'native-pre', roles: {}, nodes: {}, wires: {}, groups: {}, portals: {}, definitions: {}, view: { x: 0, y: 0, zoom: 1 } });
        await window.canvasHarness.view({ x: -240, y: 90, zoom: 1.5 });
    });
}

async function pressChoice(page) {
    await page.locator('[data-family="Shaping"]').click();
    const box = await page.locator('[data-shelf-choice="operation:reroute"]').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
}

test('shelf drag shows a grabbing cursor and drops once at the pointer through pan and zoom', async ({ page }) => {
    await launch(page);
    await pressChoice(page);
    const canvas = await page.locator('.pc-canvas-host').boundingBox();
    const drop = { x: canvas.x + 450, y: canvas.y + 220 };
    await page.mouse.move(drop.x, drop.y, { steps: 8 });
    await expect(page.locator('.pc-shelf-drag-preview')).toHaveText('Reroute');
    expect(await page.locator('.pc-canvas-host').evaluate(element => getComputedStyle(element).cursor)).toBe('grabbing');
    expect(await page.evaluate(() => Object.keys(window.canvasHarness.graph.nodes).length)).toBe(0);
    await page.mouse.up();
    await expect(page.locator('.pc-node-native')).toHaveCount(1);
    const node = await page.evaluate(() => Object.values(window.canvasHarness.graph.nodes)[0]);
    expect(node.x).toBeCloseTo(460, 5);
    expect(node.y).toBeCloseTo(260 / 3, 5);
    const card = await page.locator('.pc-node-native').boundingBox();
    expect(card.x).toBeCloseTo(drop.x, 0);
    expect(card.y).toBeCloseTo(drop.y, 0);
    await expect(page.locator('.pc-shelf-drag-preview')).toHaveCount(0);
    expect(await page.locator('body').evaluate(element => element.classList.contains('pc-shelf-dragging'))).toBe(false);
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(page.locator('.pc-node-native')).toHaveCount(0);
    await page.getByRole('button', { name: 'Redo', exact: true }).click();
    await expect(page.locator('.pc-node-native')).toHaveCount(1);
    expect(await page.evaluate(() => Object.values(window.canvasHarness.graph.nodes)[0])).toEqual(node);
});

test('holding on the shelf changes the cursor and release over the shelf cancels creation', async ({ page }) => {
    await launch(page);
    await pressChoice(page);
    await expect(page.locator('.pc-shelf-drag-preview')).toBeVisible();
    await page.mouse.up();
    await expect(page.locator('.pc-shelf-drag-preview')).toHaveCount(0);
    expect(await page.evaluate(() => Object.keys(window.canvasHarness.graph.nodes).length)).toBe(0);
    // A subsequent ordinary click still creates exactly one node.
    await page.locator('[data-shelf-choice="operation:reroute"]').click();
    await expect(page.locator('.pc-node-native')).toHaveCount(1);
});

test('Escape and dropping outside the canvas cancel shelf drags without closing the workspace', async ({ page }) => {
    await launch(page);
    await pressChoice(page);
    const canvas = await page.locator('.pc-canvas-host').boundingBox();
    await page.mouse.move(canvas.x + 450, canvas.y + 220);
    await expect(page.locator('.pc-shelf-drag-preview')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.mouse.up();
    await expect(page.locator('.pc-shelf-drag-preview')).toHaveCount(0);
    await expect(page.locator('.pc-root')).toBeVisible();
    expect(await page.evaluate(() => Object.keys(window.canvasHarness.graph.nodes).length)).toBe(0);
    await pressChoice(page);
    const preview = await page.locator('.pc-preview-pane').boundingBox();
    await page.mouse.move(preview.x + preview.width / 2, preview.y + preview.height / 2);
    await page.mouse.up();
    await expect(page.locator('.pc-shelf-drag-preview')).toHaveCount(0);
    expect(await page.evaluate(() => Object.keys(window.canvasHarness.graph.nodes).length)).toBe(0);
});
