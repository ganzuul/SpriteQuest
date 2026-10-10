import {UNIFIED_WORKFLOW_EXAMPLE_DATA} from '../../src/workflow/unified-example-data.js';
const exampleCount=UNIFIED_WORKFLOW_EXAMPLE_DATA.length, lastExampleTitle=UNIFIED_WORKFLOW_EXAMPLE_DATA.at(-1).title;
import { test, expect } from '@playwright/test';

async function load(page) {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
}
async function openExamples(page, menu = 'File') {
    await page.getByRole('button', { name: menu, exact: true }).click();
    await page.getByRole('menuitem', { name: menu === 'File' ? 'Open examples…' : 'Workflow examples…', exact: true }).click({ timeout: 2500 });
    return page.getByRole('dialog', { name: 'Examples', exact: true });
}

test('File examples is directly below Open workflow and opens the compact complete example picker', async ({ page }, testInfo) => {
    await load(page);
    await page.getByRole('button', { name: 'File', exact: true }).click();
    const items = await page.getByRole('menu', { name: 'File', exact: true }).getByRole('menuitem').allTextContents();
    expect(items[items.findIndex(item => item.includes('Open workflow…')) + 1]).toContain('Open examples…');
    await page.getByRole('menuitem', { name: 'Open examples…', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Examples', exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.pc-example-tile')).toHaveCount(exampleCount);
    await expect(dialog.locator('.pc-example-tile').first()).toHaveAccessibleName('Guide, revise and annotate a scene');
    await expect(dialog.locator('.pc-example-tile').last()).toHaveAccessibleName(lastExampleTitle);
    const box = await dialog.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(550);
    expect(box.width).toBeLessThanOrEqual(570);
    expect(box.height).toBeGreaterThanOrEqual(420);
    expect(box.height).toBeLessThanOrEqual(440);
    const previews = dialog.locator('.pc-example-preview');
    await expect(previews).toHaveCount(exampleCount);
    expect(await previews.first().evaluate(element => element.getBoundingClientRect().height)).toBe(72);
    expect(await dialog.locator('.pc-examples-grid').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(3);
    await dialog.screenshot({ path: testInfo.outputPath('examples-picker-desktop.png') });
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});

test('both menus retain picker scroll, trap Tab, close on Escape and restore trigger focus', async ({ page }) => {
    await load(page);
    let dialog = await openExamples(page);
    const close = dialog.getByRole('button', { name: 'Close panel', exact: true });
    await expect(close).toBeFocused();
    await close.press('Shift+Tab');
    await expect(dialog.locator('.pc-example-tile').last()).toBeFocused();
    await dialog.locator('.pc-example-tile').last().press('Tab');
    await expect(close).toBeFocused();
    const scrollTop = await dialog.locator('.pc-examples-grid').evaluate(async element => {
        element.scrollTop = element.scrollHeight;
        await new Promise(resolve => requestAnimationFrame(resolve));
        return element.scrollTop;
    });
    expect(scrollTop).toBeGreaterThan(0);
    await close.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('button', { name: 'File', exact: true })).toBeFocused();
    dialog = await openExamples(page, 'Workflows');
    expect(await dialog.locator('.pc-examples-grid').evaluate(element => element.scrollTop)).toBe(scrollTop);
    await dialog.getByRole('button', { name: 'Close panel', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Workflows', exact: true })).toBeFocused();
});

test('narrow picker has two columns and its last long-name tile opens by keyboard', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 500, height: 720 });
    await load(page);
    const dialog = await openExamples(page);
    const box = await dialog.boundingBox();
    expect(box.width).toBeLessThanOrEqual(476);
    expect(await dialog.locator('.pc-examples-grid').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(2);
    const last = dialog.getByRole('button', { name: lastExampleTitle, exact: true });
    await last.focus();
    await expect(last).toBeInViewport();
    await dialog.screenshot({ path: testInfo.outputPath('examples-picker-narrow.png') });
    await last.press('Enter');
    await expect(dialog).toBeHidden();
    await expect.poll(() => page.evaluate(() => window.canvasHarness.graph.name)).toBe(lastExampleTitle);
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});

test('each example tile activates an independently editable native primary workflow without host effects', async ({ page }) => {
    test.setTimeout(180000);
    await load(page);
    const before = await page.evaluate(() => {
        const settings = window.canvasHarness.S.settings();
        return structuredClone({ enabled: settings.enabled, nativeBindings: settings.nativeBindings, graphs: settings.graphs });
    });
    const examples = await page.evaluate(async () => {
        const h = window.canvasHarness;
        const { listWorkflowExamples } = await import('/src/workflow/examples.js?v=' + h.version);
        return listWorkflowExamples().map(example => ({ title: example.title, count: Object.values(example.graph.nodes).filter(node => node.type !== 'note' || !node.commentFrame).length }));
    });
    for (const example of examples) {
        const dialog = await openExamples(page);
        await dialog.getByRole('button', { name: example.title, exact: true }).click();
        await expect(dialog).toBeHidden();
        await expect.poll(() => page.evaluate(() => window.canvasHarness.graph.name)).toBe(example.title);
        await expect(page.locator('.pc-canvas-host .pc-node-native')).toHaveCount(example.count);
        const active = await page.evaluate(() => {
            const h = window.canvasHarness;
            return { savedId: h.S.settings().activeGraphId, currentId: h.graph.id, mode: h.graph.mode };
        });
        expect(active.savedId).toBe(active.currentId);
        expect(active.mode).toBe('native-unified');
        await expect(page.getByRole('combobox', { name: 'Workflow', exact: true })).toHaveValue(active.savedId);
        await page.evaluate(async()=>{const h=window.canvasHarness,id=document.querySelector('.pc-canvas-host .pc-node-native').dataset.id,node=h.graph.nodes[id];await h.view({x:280-node.x,y:80-node.y,zoom:1});});
        await page.locator('.pc-canvas-host .pc-node-native .pc-native-heading').first().click({timeout:5000});
        await expect(page.getByRole('textbox', { name: 'Node name', exact: true })).toBeEnabled();
    }
    const after = await page.evaluate(() => {
        const h = window.canvasHarness, settings = h.S.settings();
        return structuredClone({ enabled: settings.enabled, nativeBindings: settings.nativeBindings, graphs: settings.graphs, providerCalls: h.providerCalls() });
    });
    expect(after.enabled).toBe(before.enabled);
    expect(after.nativeBindings).toEqual(before.nativeBindings);
    for (const [id, graph] of Object.entries(before.graphs)) expect(after.graphs[id]).toEqual(graph);
    expect(after.providerCalls).toBe(0);
});

test('reopening a tile preserves the independently edited first copy', async ({ page }, testInfo) => {
    await load(page);
    let dialog = await openExamples(page);
    await dialog.getByRole('button', { name: 'Guide, revise and annotate a scene', exact: true }).click();
    await expect(dialog).toBeHidden();
    const firstId = await page.evaluate(() => window.canvasHarness.graph.id);
    await page.locator('.pc-canvas-host .pc-node-native .pc-native-heading').first().click();
    await page.getByRole('textbox', { name: 'Node name', exact: true }).fill('My edited brief');
    await page.getByRole('textbox', { name: 'Node name', exact: true }).press('Tab');
    await expect(page.locator('.pc-canvas-host .pc-node-title').first()).toHaveText('My edited brief');
    const edited = await page.evaluate(() => structuredClone(window.canvasHarness.graph));
    dialog = await openExamples(page);
    await dialog.getByRole('button', { name: 'Guide, revise and annotate a scene', exact: true }).click();
    await expect(dialog).toBeHidden();
    expect(await page.evaluate(() => window.canvasHarness.graph.id)).not.toBe(firstId);
    await expect.poll(() => page.evaluate(() => window.canvasHarness.graph.name)).toBe('Guide, revise and annotate a scene (2)');
    expect(await page.evaluate(id => structuredClone(window.canvasHarness.S.getGraph(id)), firstId)).toEqual(edited);
    await expect(page.locator('.pc-canvas-host .pc-node-title').first()).not.toHaveText('My edited brief');
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});

test('a package malformed after catalog loading keeps the picker and previous root, then allows retry after repair', async ({ page }) => {
    await load(page);
    const dialog = await openExamples(page);
    const before = await page.evaluate(async () => {
        const h = window.canvasHarness;
        const { UNIFIED_WORKFLOW_EXAMPLE_DATA } = await import('/src/workflow/unified-example-data.js?v=' + h.version);
        const example = UNIFIED_WORKFLOW_EXAMPLE_DATA[0];
        window.examplesCorruptPackage = example.packages[0].graph.nodes;
        example.packages[0].graph.nodes = {};
        return structuredClone({ graphs: h.S.settings().graphs, activeGraphId: h.S.settings().activeGraphId });
    });
    const tile = dialog.getByRole('button', { name: 'Guide, revise and annotate a scene', exact: true });
    await tile.click();
    await expect(dialog).toBeVisible();
    await expect(tile).toBeEnabled();
    expect(await page.evaluate(() => {
        const settings = window.canvasHarness.S.settings();
        return structuredClone({ graphs: settings.graphs, activeGraphId: settings.activeGraphId });
    })).toEqual(before);
    await page.evaluate(async () => {
        const h = window.canvasHarness;
        const { UNIFIED_WORKFLOW_EXAMPLE_DATA } = await import('/src/workflow/unified-example-data.js?v=' + h.version);
        UNIFIED_WORKFLOW_EXAMPLE_DATA[0].packages[0].graph.nodes = window.examplesCorruptPackage;
    });
    await tile.click();
    await expect(dialog).toBeHidden();
    await expect.poll(() => page.evaluate(() => window.canvasHarness.graph.name)).toBe('Guide, revise and annotate a scene');
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});

test('one malformed primary stays as a disabled diagnostic tile while other examples still open', async ({ page }) => {
    await load(page);
    const beforeId = await page.evaluate(async () => {
        const h = window.canvasHarness;
        const { UNIFIED_WORKFLOW_EXAMPLE_DATA } = await import('/src/workflow/unified-example-data.js?v=' + h.version);
        const primary = UNIFIED_WORKFLOW_EXAMPLE_DATA[0].packages[0].graph;
        Object.values(primary.nodes).find(node => node.type === 'workflow').operation = 'missing-example-operation';
        return h.S.settings().activeGraphId;
    });
    const dialog = await openExamples(page);
    await expect(dialog.locator('.pc-example-tile')).toHaveCount(exampleCount);
    const invalid = dialog.getByRole('button', { name: 'Guide, revise and annotate a scene', exact: true });
    await expect(invalid).toBeDisabled();
    await expect(invalid).toContainText('Unavailable');
    await expect(invalid).toHaveAccessibleDescription(/unknown workflow operation/i);
    await expect(dialog.locator('.pc-example-tile:not(:disabled)')).toHaveCount(exampleCount-1);
    expect(await page.evaluate(() => window.canvasHarness.S.settings().activeGraphId)).toBe(beforeId);
    await dialog.getByRole('button', { name: 'Combat with a tactical recap', exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect.poll(() => page.evaluate(() => window.canvasHarness.graph.name)).toBe('Combat with a tactical recap');
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});

test('catalog-wide loading failure preserves the workspace and Retry restores the examples', async ({ page }) => {
    await load(page);
    const beforeId = await page.evaluate(async () => {
        const h = window.canvasHarness;
        const { UNIFIED_WORKFLOW_EXAMPLE_DATA } = await import('/src/workflow/unified-example-data.js?v=' + h.version);
        window.exampleCatalogTitleDescriptor = Object.getOwnPropertyDescriptor(UNIFIED_WORKFLOW_EXAMPLE_DATA[0], 'title');
        Object.defineProperty(UNIFIED_WORKFLOW_EXAMPLE_DATA[0], 'title', { configurable: true, get() { throw new Error('The example catalog is temporarily unavailable.'); } });
        return h.S.settings().activeGraphId;
    });
    const dialog = await openExamples(page);
    await expect(dialog.getByRole('alert')).toHaveText('The example catalog is temporarily unavailable.Retry');
    await expect(page.getByRole('dialog', { name: 'Lattice', exact: true })).toBeVisible();
    expect(await page.evaluate(() => window.canvasHarness.S.settings().activeGraphId)).toBe(beforeId);
    await page.evaluate(async () => {
        const h = window.canvasHarness;
        const { UNIFIED_WORKFLOW_EXAMPLE_DATA } = await import('/src/workflow/unified-example-data.js?v=' + h.version);
        Object.defineProperty(UNIFIED_WORKFLOW_EXAMPLE_DATA[0], 'title', window.exampleCatalogTitleDescriptor);
        delete window.exampleCatalogTitleDescriptor;
    });
    await dialog.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(dialog.getByRole('alert')).toHaveCount(0);
    await expect(dialog.locator('.pc-example-tile:not(:disabled)')).toHaveCount(exampleCount);
    await dialog.getByRole('button', { name: 'Guide, revise and annotate a scene', exact: true }).click();
    await expect(dialog).toBeHidden();
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});
