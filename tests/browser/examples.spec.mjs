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

test('File examples is directly below Open workflow and opens the compact thirty-tile picker', async ({ page }, testInfo) => {
    await load(page);
    await page.getByRole('button', { name: 'File', exact: true }).click();
    const items = await page.getByRole('menu', { name: 'File', exact: true }).getByRole('menuitem').allTextContents();
    expect(items[items.findIndex(item => item.includes('Open workflow…')) + 1]).toContain('Open examples…');
    await page.getByRole('menuitem', { name: 'Open examples…', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Examples', exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.pc-example-tile')).toHaveCount(30);
    await expect(dialog.locator('.pc-example-tile').first()).toHaveAccessibleName('Make a scene brief');
    await expect(dialog.locator('.pc-example-tile').last()).toHaveAccessibleName('Combine memory with a voice pass');
    const box = await dialog.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(550);
    expect(box.width).toBeLessThanOrEqual(570);
    expect(box.height).toBeGreaterThanOrEqual(420);
    expect(box.height).toBeLessThanOrEqual(440);
    const previews = dialog.locator('.pc-example-preview');
    await expect(previews).toHaveCount(30);
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
    const last = dialog.getByRole('button', { name: 'Combine memory with a voice pass', exact: true });
    await last.focus();
    await expect(last).toBeInViewport();
    await dialog.screenshot({ path: testInfo.outputPath('examples-picker-narrow.png') });
    await last.press('Enter');
    await expect(dialog).toBeHidden();
    await expect.poll(() => page.evaluate(() => window.canvasHarness.graph.name)).toBe('Combine memory with a voice pass');
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});

test('each of thirty tiles activates an independently editable native primary workflow without host effects', async ({ page }) => {
    test.setTimeout(90000);
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
        expect(active.mode).toMatch(/^native-(pre|post)$/);
        await expect(page.getByRole('combobox', { name: 'Workflow', exact: true })).toHaveValue(active.savedId);
        await page.locator('.pc-canvas-host .pc-node-native .pc-native-heading').first().click();
        await expect(page.getByRole('checkbox', { name: 'Enabled', exact: true })).toBeEnabled();
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

test('reopening a tile preserves the edited first copy and advanced subgraphs open for inspection', async ({ page }, testInfo) => {
    await load(page);
    let dialog = await openExamples(page);
    await dialog.getByRole('button', { name: 'Make a scene brief', exact: true }).click();
    await expect(dialog).toBeHidden();
    const firstId = await page.evaluate(() => window.canvasHarness.graph.id);
    await page.locator('.pc-canvas-host .pc-node-native .pc-native-heading').first().click();
    await page.getByRole('textbox', { name: 'Alias', exact: true }).fill('My edited brief');
    await page.getByRole('textbox', { name: 'Alias', exact: true }).press('Tab');
    await expect(page.locator('.pc-canvas-host .pc-node-title').first()).toHaveText('My edited brief');
    const edited = await page.evaluate(() => structuredClone(window.canvasHarness.graph));
    dialog = await openExamples(page);
    await dialog.getByRole('button', { name: 'Make a scene brief', exact: true }).click();
    await expect(dialog).toBeHidden();
    expect(await page.evaluate(() => window.canvasHarness.graph.id)).not.toBe(firstId);
    await expect.poll(() => page.evaluate(() => window.canvasHarness.graph.name)).toBe('Make a scene brief (2)');
    expect(await page.evaluate(id => structuredClone(window.canvasHarness.S.getGraph(id)), firstId)).toEqual(edited);
    await expect(page.locator('.pc-canvas-host .pc-node-title').first()).not.toHaveText('My edited brief');
    dialog = await openExamples(page);
    await dialog.getByRole('button', { name: 'Combine memory with a voice pass', exact: true }).click();
    await expect(dialog).toBeHidden();
    await page.locator('.pc-canvas-host .pc-node-subgraph .pc-native-heading').first().dblclick();
    await expect(page.locator('.pc-graph-tabs [role="tab"]')).toHaveCount(2);
    await page.evaluate(async () => { await window.canvasHarness.view({ x: 280, y: 60, zoom: 0.7 }); });
    await expect(page.locator('.pc-canvas-host .pc-node-subgraph-input').first()).toBeVisible();
    await page.locator('.pc-canvas-host .pc-node-subgraph-input .pc-native-heading').first().click();
    await expect(page.getByRole('textbox', { name: 'Subgraph port label', exact: true })).toBeDisabled();
    await page.locator('.pc-graph-tabs [role="tab"]').first().click();
    await page.locator('.pc-canvas-host .pc-node-subgraph .pc-native-heading').first().click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Make editable copy', exact: true }).click();
    await page.evaluate(async () => { await window.canvasHarness.view({ x: 280, y: 60, zoom: 0.7 }); });
    await page.locator('.pc-canvas-host .pc-node-subgraph-input .pc-native-heading').first().click();
    await expect(page.getByRole('textbox', { name: 'Subgraph port label', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Graph', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Fit to view', exact: true }).click();
    await page.getByRole('dialog', { name: 'Lattice', exact: true }).screenshot({ path: testInfo.outputPath('example-30-opened-subgraph.png') });
    dialog = await openExamples(page);
    await dialog.getByRole('button', { name: 'Make a scene brief', exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(page.locator('.pc-graph-tabs [role="tab"]')).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => window.canvasHarness.graph.name)).toBe('Make a scene brief (3)');
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});

test('a malformed companion keeps the picker and previous root, then allows retry after repair', async ({ page }) => {
    await load(page);
    const dialog = await openExamples(page);
    const before = await page.evaluate(async () => {
        const h = window.canvasHarness;
        const { WORKFLOW_EXAMPLE_DATA } = await import('/src/workflow/example-data.js?v=' + h.version);
        const example = WORKFLOW_EXAMPLE_DATA.find(example => example.number === 20);
        window.examplesCorruptCompanion = example.packages[1].graph.nodes;
        example.packages[1].graph.nodes = {};
        return structuredClone({ graphs: h.S.settings().graphs, activeGraphId: h.S.settings().activeGraphId });
    });
    const tile = dialog.getByRole('button', { name: 'Record injuries and fatigue', exact: true });
    await tile.click();
    await expect(dialog).toBeVisible();
    await expect(tile).toBeEnabled();
    expect(await page.evaluate(() => {
        const settings = window.canvasHarness.S.settings();
        return structuredClone({ graphs: settings.graphs, activeGraphId: settings.activeGraphId });
    })).toEqual(before);
    await page.evaluate(async () => {
        const h = window.canvasHarness;
        const { WORKFLOW_EXAMPLE_DATA } = await import('/src/workflow/example-data.js?v=' + h.version);
        WORKFLOW_EXAMPLE_DATA.find(example => example.number === 20).packages[1].graph.nodes = window.examplesCorruptCompanion;
    });
    await tile.click();
    await expect(dialog).toBeHidden();
    await expect.poll(() => page.evaluate(() => window.canvasHarness.graph.name)).toBe('Record injuries and fatigue');
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});

test('one malformed primary stays as a disabled diagnostic tile while other examples still open', async ({ page }) => {
    await load(page);
    const beforeId = await page.evaluate(async () => {
        const h = window.canvasHarness;
        const { WORKFLOW_EXAMPLE_DATA } = await import('/src/workflow/example-data.js?v=' + h.version);
        const primary = WORKFLOW_EXAMPLE_DATA[0].packages[0].graph;
        Object.values(primary.nodes).find(node => node.type === 'workflow').operation = 'missing-example-operation';
        return h.S.settings().activeGraphId;
    });
    const dialog = await openExamples(page);
    await expect(dialog.locator('.pc-example-tile')).toHaveCount(30);
    const invalid = dialog.getByRole('button', { name: 'Make a scene brief', exact: true });
    await expect(invalid).toBeDisabled();
    await expect(invalid).toContainText('Unavailable');
    await expect(invalid).toHaveAccessibleDescription(/unknown workflow operation/i);
    await expect(dialog.locator('.pc-example-tile:not(:disabled)')).toHaveCount(29);
    expect(await page.evaluate(() => window.canvasHarness.S.settings().activeGraphId)).toBe(beforeId);
    await dialog.getByRole('button', { name: 'Replace a repeated phrase', exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect.poll(() => page.evaluate(() => window.canvasHarness.graph.name)).toBe('Replace a repeated phrase');
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});

test('catalog-wide loading failure preserves the workspace and Retry restores the examples', async ({ page }) => {
    await load(page);
    const beforeId = await page.evaluate(async () => {
        const h = window.canvasHarness;
        const { WORKFLOW_EXAMPLE_DATA } = await import('/src/workflow/example-data.js?v=' + h.version);
        WORKFLOW_EXAMPLE_DATA.map = () => { throw new Error('The example catalog is temporarily unavailable.'); };
        return h.S.settings().activeGraphId;
    });
    const dialog = await openExamples(page);
    await expect(dialog.getByRole('alert')).toHaveText('The example catalog is temporarily unavailable.Retry');
    await expect(page.getByRole('dialog', { name: 'Lattice', exact: true })).toBeVisible();
    expect(await page.evaluate(() => window.canvasHarness.S.settings().activeGraphId)).toBe(beforeId);
    await page.evaluate(async () => {
        const h = window.canvasHarness;
        const { WORKFLOW_EXAMPLE_DATA } = await import('/src/workflow/example-data.js?v=' + h.version);
        delete WORKFLOW_EXAMPLE_DATA.map;
    });
    await dialog.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(dialog.getByRole('alert')).toHaveCount(0);
    await expect(dialog.locator('.pc-example-tile:not(:disabled)')).toHaveCount(30);
    await dialog.getByRole('button', { name: 'Make a scene brief', exact: true }).click();
    await expect(dialog).toBeHidden();
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});
