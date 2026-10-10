import { test, expect } from '@playwright/test';

const details = page => page.getByRole('region', { name: 'Node details', exact: true });
const selectCompose = async page => {
    await page.locator('.pc-node-native[data-id="n0"] .pc-native-heading').click();
    await expect(details(page)).toBeVisible();
};

async function setup(page) {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(async () => {
        const h = window.canvasHarness;
        const [{ canvasWorkflow }, { operationDefaults }] = await Promise.all([
            import('/tests/browser/native-fixture.mjs'), import('/src/workflow/catalog.js?v=' + h.version),
        ]);
        for (const id of ['details-other-root', 'details-draft-root']) {
            const graph = canvasWorkflow(operationDefaults, 1, 1); graph.id = id; graph.name = id;
            graph.nodes.annotation = { id: 'annotation', type: 'note', commentFrame: true, moveContents: false,
                title: 'Inspector comment', content: '', color: '#637d89', x: 360, y: 80, w: 240, h: 180 };
            await h.activate(graph);
        }
        await h.view({ x: 90, y: 80, zoom: .9 });
    });
    await selectCompose(page);
}

test('invalid JSON is retained after switching roots and returning to the qualified node', async ({ page }) => {
    await setup(page);
    const before = await page.evaluate(() => structuredClone(window.canvasHarness.graph.nodes.n0.sections));
    const editor = details(page).getByLabel('Sections', { exact: true });
    await editor.fill('{"unfinished":');
    await details(page).getByRole('button', { name: 'Save Sections', exact: true }).click();
    await expect(editor).toHaveAttribute('aria-invalid', 'true');
    await page.getByLabel('Workflow', { exact: true }).selectOption('details-other-root');
    await selectCompose(page);
    await expect(editor).toHaveValue(JSON.stringify(before, null, 2));
    await page.getByLabel('Workflow', { exact: true }).selectOption('details-draft-root');
    await selectCompose(page);
    await expect(editor).toHaveValue('{"unfinished":');
    await expect(editor).toHaveAttribute('aria-invalid', 'true');
    await details(page).getByRole('button', { name: 'Save Sections', exact: true }).click();
    await expect(details(page).getByRole('alert')).toContainText('Enter valid JSON');
    expect(await page.evaluate(() => window.canvasHarness.graph.nodes.n0.sections)).toEqual(before);
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});

test('comment inspection preserves an invalid node draft for the mounted workspace lifetime', async ({ page }) => {
    await setup(page);
    const editor = details(page).getByLabel('Sections', { exact: true });
    await editor.fill('{"unfinished":');
    await details(page).getByRole('button', { name: 'Save Sections', exact: true }).click();
    await page.locator('.pc-comment-frame[data-id="annotation"] .pc-comment-select').click();
    await expect(page.locator('.pc-comment-details')).toBeVisible();
    await expect(details(page)).toBeHidden();
    await selectCompose(page);
    await expect(editor).toHaveValue('{"unfinished":');
    await expect(editor).toHaveAttribute('aria-invalid', 'true');
    await expect(details(page).getByRole('alert')).toContainText('Enter valid JSON');
    const mountedInspector = await details(page).elementHandle();
    await page.getByRole('button', { name: 'Close canvas', exact: true }).click();
    await expect(details(page)).toBeHidden();
    expect(await mountedInspector.evaluate(element => element.isConnected)).toBe(true);
    await page.evaluate(() => window.lattice.open());
    await selectCompose(page);
    expect(await details(page).evaluate((element, original) => element === original, mountedInspector)).toBe(true);
    await expect(editor).toHaveValue('{"unfinished":');
    await expect(editor).toHaveAttribute('aria-invalid', 'true');
});
