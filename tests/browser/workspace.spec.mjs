import { test, expect } from '@playwright/test';

test('flat workspace menus support keyboard navigation, Escape and outside dismissal', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    const labels = await page.locator('.pc-flat-menu').allTextContents();
    expect(labels).toEqual(['File', 'Edit', 'Graph', 'Node', 'Preview', 'Workflows', 'Tools', 'Help']);
    const file = page.getByRole('button', { name: 'File', exact: true });
    await file.focus(); await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'New canvas', exact: true })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('menu', { name: 'Edit', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Edit', exact: true })).toBeFocused();
    await expect(page.getByRole('dialog', { name: 'Lattice', exact: true })).toBeVisible();
    await file.click(); await page.locator('.pc-preview-pane-head strong').click();
    await expect(page.getByRole('menu', { name: 'File', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Setup', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Workflow setup', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Setup', exact: true })).toBeFocused();
    await expect(page.locator('.pc-root')).toHaveClass(/pc-open/);
});

test('shelf stays outside the camera and cascades align with their opening rows', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(() => window.canvasHarness.reset());
    const shelf = page.locator('.pc-node-shelf'), first = await shelf.boundingBox();
    await page.evaluate(() => window.canvasHarness.view({ x: -200, y: 150, zoom: 1.5 }));
    expect(await shelf.boundingBox()).toEqual(first);
    await expect(page.locator('[data-family="Transpose"]')).toBeDisabled();
    const input = page.locator('[data-family="Input"]'); await input.click();
    const row = await input.boundingBox(), family = await page.locator('.pc-family-menu').boundingBox();
    expect(family.y).toBeCloseTo(row.y, 0); expect(family.x).toBeGreaterThanOrEqual(row.x + row.width);
    const category = page.getByRole('menuitem', { name: 'LEGACY BLOCKS', exact: false }); await category.click();
    const opening = await category.boundingBox(), leaf = await page.locator('.pc-leaf-menu').boundingBox();
    expect(leaf.y).toBeCloseTo(opening.y, 0); expect(leaf.x).toBeGreaterThanOrEqual(family.x + family.width);
    const count = await page.evaluate(() => Object.keys(window.canvasHarness.graph.nodes).length);
    await page.getByRole('menuitem', { name: 'Prompt L', exact: true }).click();
    expect(await page.evaluate(() => Object.keys(window.canvasHarness.graph.nodes).length)).toBe(count + 1);
});

for (const width of [1024, 736, 360, 320]) test(`workspace fits ${width}px and loads its local brand font`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const requests = []; page.on('request', request => requests.push(request.url()));
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    const brand = await page.evaluate(async () => {
        await document.fonts.ready;
        const word = document.querySelector('.pc-brand span'), logo = document.querySelector('.pc-brand img'), css = getComputedStyle(word);
        return { loaded: document.fonts.check('600 20px "Bricolage Grotesque"'), family: css.fontFamily, size: css.fontSize, weight: css.fontWeight, color: css.color, logo: logo.complete && logo.naturalWidth > 0, overflow: document.querySelector('.pc-root').scrollWidth > innerWidth };
    });
    expect(brand).toMatchObject({ loaded: true, size: '20px', weight: '600', color: 'rgb(255, 255, 255)', logo: true, overflow: false });
    expect(brand.family).toContain('Bricolage Grotesque');
    expect(requests.some(url => url.includes('/assets/bricolage-grotesque.ttf'))).toBe(true);
    expect(requests.every(url => new URL(url).hostname === '127.0.0.1')).toBe(true);
    await expect(page.locator('.pc-brand span')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Help', exact: true })).toBeInViewport();
    await page.locator('[data-family="Input"]').click();
    await page.getByRole('menuitem', { name: 'LEGACY BLOCKS', exact: false }).click();
    const menu = await page.locator('.pc-leaf-menu').boundingBox(), graph = await page.locator('.pc-canvas-area').boundingBox();
    expect(menu.x).toBeGreaterThanOrEqual(graph.x); expect(menu.x + menu.width).toBeLessThanOrEqual(graph.x + graph.width + 1);
});

test('root Run and Stop remain active while the preview divider resizes', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(() => {
        const c = window.canvasHarness.context;
        c.extensionSettings.connectionManager = { profiles: [{ id: 'analysis', name: 'Analysis connection', api: 'openai', model: 'synthetic-shell-model', preset: null }] };
        c.CONNECT_API_MAP = { openai: { selected: 'openai', source: 'openai' } };
        window.shellRequests = 0;
        c.ConnectionManagerRequestService = { getProfile: id => c.extensionSettings.connectionManager.profiles.find(profile => profile.id === id), sendRequest: () => { window.shellRequests++; return new Promise(resolve => { window.finishShellRequest = resolve; }); } };
        c.ChatCompletionService = { presetToGeneratePayload: async (_preset, _route, payload) => payload };
    });
    await page.getByRole('button', { name: 'Setup', exact: true }).click();
    await page.getByRole('button', { name: 'Install Scene guidance', exact: true }).click();
    await page.getByRole('dialog', { name: 'Workflow setup', exact: true }).getByLabel('Analysis connection', { exact: true }).selectOption('analysis');
    await page.getByRole('button', { name: 'Close panel', exact: true }).click();
    await page.locator('.pc-root-run').click();
    await expect(page.locator('.pc-root-run')).toHaveText('■ Stop');
    await expect.poll(() => page.evaluate(() => window.shellRequests)).toBe(1);
    await page.getByRole('separator', { name: 'Resize preview' }).focus(); await page.keyboard.press('ArrowDown');
    await expect(page.locator('.pc-root-run')).toHaveText('■ Stop');
    expect(await page.evaluate(() => window.shellRequests)).toBe(1);
    expect(await page.evaluate(() => window.canvasHarness.S.settings().enabled)).toBe(false);
    await page.locator('.pc-root-run').click();
    await expect(page.locator('.pc-root-run')).toHaveText('▶ Run');
    await page.evaluate(() => window.finishShellRequest({ choices: [{ message: { content: 'Late synthetic guidance.' }, finish_reason: 'stop' }] }));
    await page.evaluate(() => window.canvasHarness.settle());
    await expect(page.getByText('Late synthetic guidance.', { exact: true })).toHaveCount(0);
});

test('preview divider redistributes panes without changing the graph camera, selection or cards', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    const ids = await page.evaluate(() => window.canvasHarness.reset());
    await page.evaluate(() => window.canvasHarness.UI.runPreview());
    await page.evaluate(async id => {
        const { canvas, view } = window.canvasHarness;
        canvas.select({ kind: 'node', id }); await view({ x: 170, y: 100, zoom: .8 });
        window.workspaceProbe = { card: document.querySelector(`.pc-node[data-id="${id}"]`), camera: { ...canvas.view }, selection: canvas.selection.id, preview: document.querySelector('.pc-preview'), previewText: document.querySelector('.pc-preview').textContent };
    }, ids[0]);
    const graph = page.locator('.pc-canvas-host'), preview = page.locator('.pc-preview-pane');
    const divider = page.getByRole('separator', { name: 'Resize preview' });
    await expect(divider).toBeVisible();
    const before = { graph: await graph.boundingBox(), preview: await preview.boundingBox() };
    const handle = await divider.boundingBox();
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
    await page.mouse.down(); await page.mouse.move(handle.x + handle.width / 2, handle.y + 90); await page.mouse.up();
    expect((await preview.boundingBox()).height).toBeGreaterThan(before.preview.height + 60);
    expect((await graph.boundingBox()).height).toBeLessThan(before.graph.height - 60);
    await divider.focus(); await page.keyboard.press('ArrowUp');
    await page.getByRole('button', { name: 'Collapse preview' }).click();
    await page.getByRole('button', { name: 'Expand preview' }).click();
    const preserved = await page.evaluate(id => {
        const { canvas } = window.canvasHarness, probe = window.workspaceProbe;
        return { card: probe.card === document.querySelector(`.pc-node[data-id="${id}"]`), camera: { ...canvas.view }, selection: canvas.selection.id, preview: probe.preview === document.querySelector('.pc-preview') && probe.previewText === document.querySelector('.pc-preview').textContent };
    }, ids[0]);
    expect(preserved.card).toBe(true);
    expect(preserved.preview).toBe(true);
    expect(preserved.camera).toEqual(await page.evaluate(() => window.workspaceProbe.camera));
    expect(preserved.selection).toBe(ids[0]);
});
