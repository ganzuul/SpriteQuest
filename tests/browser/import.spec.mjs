import { test, expect } from '@playwright/test';

const fragment = { kind: 'prompt-canvas-graph', schema: 1, graph: { name: 'Legacy fragment', schema: 1, nodes: {
    p: { id: 'p', type: 'prompt', title: 'Imported prompt', x: 10, y: 20, content: 'Saved prompt', role: 'system' },
    g: { id: 'g', type: 'generate', title: 'Imported Generate', x: 310, y: 20, repeat: 2 },
}, wires: { w: { id: 'w', from: 'p', to: 'g', kind: 'prepend', order: 1 } }, groups: {} } };

async function load(page) {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(() => { const h = window.canvasHarness; h.H.track(h.graph); h.H.flush(h.graph); });
}
async function chooseImport(page, value, command = 'Import into graph…') {
    await page.getByRole('button', { name: 'File', exact: true }).click();
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('menuitem', { name: command, exact: true }).click();
    await (await chooser).setFiles({ name: 'workflow.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) });
}
async function snapshot(page) {
    return page.evaluate(() => {
        const h = window.canvasHarness, s = h.S.settings();
        return { graph: structuredClone(h.graph), graphs: Object.keys(s.graphs), enabled: s.enabled, mode: s.workflowMode,
            bindings: structuredClone(s.nativeBindings), chat: structuredClone(h.context.chat), prompts: structuredClone(h.context.extensionPrompts) };
    });
}

test('File additive legacy review is pure until acceptance and inserts as one undo step', async ({ page }) => {
    await load(page);
    const before = await snapshot(page);
    await chooseImport(page, fragment);
    const review = page.getByRole('dialog', { name: 'Import into graph' });
    await expect(review).toBeVisible(); await expect(review).toContainText('legacy');
    await expect(review).toContainText('Conservative request bound');
    await expect(review).toContainText('one Output');
    expect(await snapshot(page)).toEqual(before);
    await page.evaluate(() => { const h = window.canvasHarness; h.graph.view = { x: 321, y: 123, zoom: .75 }; h.graph.updatedAt = 777; h.canvas.applyTransform(); });
    await review.getByRole('button', { name: 'Insert into graph', exact: true }).click();
    await expect(review).not.toBeVisible();
    const after = await snapshot(page);
    expect(after.graph.id).toBe(before.graph.id); expect(after.graphs).toEqual(before.graphs);
    expect(Object.keys(after.graph.nodes)).toHaveLength(Object.keys(before.graph.nodes).length + 2);
    expect(after.graph.view).toEqual({ x: 321, y: 123, zoom: .75 });
    expect(await page.evaluate(() => window.canvasHarness.selection.length)).toBe(2);
    for (const key of ['enabled', 'mode', 'bindings', 'chat', 'prompts']) expect(after[key]).toEqual(before[key]);
    await page.keyboard.press('Control+z');
    expect((await snapshot(page)).graph.nodes).toEqual(before.graph.nodes);
    expect((await snapshot(page)).graph.view).toEqual(after.graph.view);
    await page.keyboard.press('Control+Shift+z');
    expect((await snapshot(page)).graph.nodes).toEqual(after.graph.nodes);
});

test('legacy second Output rejects before review and retains Open/import canvas behavior', async ({ page }) => {
    await load(page); const before = await snapshot(page);
    const full = structuredClone(fragment); full.graph.nodes.out = { id: 'out', type: 'output', x: 400, y: 400 };
    await chooseImport(page, full);
    await expect.poll(() => page.evaluate(() => window.canvasHarness.toasts.at(-1)?.message)).toContain('Open separately');
    await expect(page.getByRole('dialog', { name: 'Import into graph' })).not.toBeVisible();
    expect(await snapshot(page)).toEqual(before);
    await chooseImport(page, full, 'Import canvas');
    await expect.poll(() => page.evaluate(() => window.canvasHarness.graph.id)).not.toBe(before.graph.id);
    expect((await snapshot(page)).graphs).toHaveLength(before.graphs.length + 1);
});

test('repeated native insertion preserves schema2 recipient IDs and roles while selecting independent additions', async ({ page }) => {
    await load(page);
    await page.getByRole('button', { name: 'Toggle library', exact: true }).click();
    await page.getByRole('button', { name: 'Install Scene guidance', exact: true }).click();
    const saved = await page.evaluate(async () => {
        const h = window.canvasHarness;
        h.graph.roles.Analysis = { profileId: 'recipient', model: 'recipient-model' };
        h.S.touchGraph(h.graph); h.H.flush(h.graph);
        const { starterGraph } = await import('/src/workflow/starters.js?v=' + window.canvasHarness.version);
        const { exportWorkflow } = await import('/src/workflow/packages.js?v=' + window.canvasHarness.version);
        return exportWorkflow(starterGraph('native-guidance'));
    });
    const before = await snapshot(page), ids = Object.keys(before.graph.nodes);
    for (const total of [8, 12]) {
        await chooseImport(page, saved);
        const review = page.getByRole('dialog', { name: 'Import into graph' });
        await expect(review).toContainText('pre'); await expect(review).toContainText('Imported terminal effects');
        await expect(review).toContainText('Saved bindings to review');
        await review.getByRole('button', { name: 'Insert into graph', exact: true }).click();
        const after = await snapshot(page);
        expect(after.graph.schema).toBe(3); expect(after.graph.runtime).toBe(2);
        expect(Object.keys(after.graph.nodes)).toHaveLength(total);
        for (const id of ids) expect(after.graph.nodes[id]).toEqual(before.graph.nodes[id]);
        expect(after.graph.roles.Analysis).toEqual(before.graph.roles.Analysis);
        expect(await page.evaluate(() => window.canvasHarness.selection.length)).toBe(4);
        for (const key of ['enabled', 'mode', 'bindings', 'chat', 'prompts']) expect(after[key]).toEqual(before[key]);
    }
    const after = await snapshot(page);
    expect(Object.keys(after.graph.roles)).toEqual(['Analysis', 'Import 1: Analysis', 'Import 2: Analysis']);
    await page.keyboard.press('Control+z'); expect(Object.keys((await snapshot(page)).graph.nodes)).toHaveLength(8);
    await page.keyboard.press('Control+z');
    const restored = (await snapshot(page)).graph;
    expect(restored.schema).toBe(2); expect(restored.nodes).toEqual(before.graph.nodes); expect(restored.roles).toEqual(before.graph.roles);
    await page.keyboard.press('Control+Shift+z'); await page.keyboard.press('Control+Shift+z');
    expect((await snapshot(page)).graph.nodes).toEqual(after.graph.nodes);
});

for (const change of ['alias', 'body', 'read-only', 'session', 'path', 'root']) test(`review rejects a changed ${change} without further mutation or history`, async ({ page }) => {
    await load(page);
    await page.evaluate(() => {
        const h = window.canvasHarness;
        window.importEditContext = { sessionId: 'browser-import', viewPath: [], readOnly: false };
        h.UI.setGraphEditAdapter({ root: () => h.graph, readContext: () => window.importEditContext });
    });
    await chooseImport(page, fragment);
    const review = page.getByRole('dialog', { name: 'Import into graph' });
    await expect(review).toBeVisible();
    await page.evaluate(change => {
        const h = window.canvasHarness;
        if (change === 'alias' || change === 'body') {
            const node = Object.values(h.graph.nodes)[0];
            node[change === 'alias' ? 'title' : 'content'] = 'Intervening edit';
            h.S.touchGraph(h.graph); h.H.flush(h.graph);
        } else if (change === 'read-only') window.importEditContext.readOnly = true;
        else if (change === 'session') window.importEditContext.sessionId = 'reopened-session';
        else if (change === 'path') window.importEditContext.viewPath = ['child/instance'];
        else { const replacement = structuredClone(h.graph); h.S.settings().graphs[replacement.id] = replacement; h.canvas.setGraph(replacement); }
    }, change);
    const before = await snapshot(page), history = await page.evaluate(() => window.canvasHarness.H.peek(window.canvasHarness.graph));
    await review.getByRole('button', { name: 'Insert into graph', exact: true }).click();
    await expect(review.getByRole('alert')).toContainText(change === 'read-only' ? 'read-only' : change === 'root' ? 'replaced' : 'changed');
    expect(await snapshot(page)).toEqual(before);
    expect(await page.evaluate(() => window.canvasHarness.H.peek(window.canvasHarness.graph))).toEqual(history);
    if (change === 'alias') {
        await review.getByRole('button', { name: 'Prepare again', exact: true }).click();
        await expect(review.getByRole('alert')).toHaveCount(0);
        await review.getByRole('button', { name: 'Insert into graph', exact: true }).click();
        expect(Object.values((await snapshot(page)).graph.nodes).some(node => node.title === 'Intervening edit')).toBe(true);
    }
});

test('mismatch and malformed native files reject; empty legacy insertion is a no-op', async ({ page }) => {
    await load(page); const before = await snapshot(page);
    const native = await page.evaluate(async () => {
        const { starterGraph } = await import('/src/workflow/starters.js?v=' + window.canvasHarness.version);
        const { exportWorkflow } = await import('/src/workflow/packages.js?v=' + window.canvasHarness.version);
        return exportWorkflow(starterGraph('native-guidance'));
    });
    for (const file of [native, { ...native, schema: 99, minRuntime: 99 }]) {
        await chooseImport(page, file);
        await expect.poll(() => page.evaluate(() => window.canvasHarness.toasts.length)).toBeGreaterThan(0);
        await expect(page.getByRole('dialog', { name: 'Import into graph' })).not.toBeVisible();
        expect(await snapshot(page)).toEqual(before);
    }
    const history = await page.evaluate(() => window.canvasHarness.H.peek(window.canvasHarness.graph));
    await chooseImport(page, { schema: 1, nodes: {}, wires: {}, groups: {} });
    await page.getByRole('dialog', { name: 'Import into graph' }).getByRole('button', { name: 'Insert into graph', exact: true }).click();
    expect(await snapshot(page)).toEqual(before);
    expect(await page.evaluate(() => window.canvasHarness.H.peek(window.canvasHarness.graph))).toEqual(history);
});

for (const change of ['body', 'camera']) test(`async file read captures earlier document preconditions while ${change} changes`, async ({ page }) => {
    await load(page);
    await page.evaluate(() => {
        const read = File.prototype.text;
        File.prototype.text = async function () {
            const text = await read.call(this);
            return new Promise(resolve => { window.finishImportFileRead = () => resolve(text); });
        };
    });
    await chooseImport(page, fragment);
    await page.waitForFunction(() => !!window.finishImportFileRead);
    await page.evaluate(change => {
        const h = window.canvasHarness;
        if (change === 'body') { Object.values(h.graph.nodes)[0].content = 'Changed while reading'; h.S.touchGraph(h.graph); h.H.flush(h.graph); }
        else { h.graph.view = { x: 654, y: 321, zoom: .7 }; h.graph.updatedAt = 987; h.canvas.applyTransform(); }
    }, change);
    const before = await snapshot(page);
    await page.evaluate(() => window.finishImportFileRead());
    const review = page.getByRole('dialog', { name: 'Import into graph' });
    await expect(review).toBeVisible();
    await review.getByRole('button', { name: 'Insert into graph', exact: true }).click();
    if (change === 'body') { await expect(review.getByRole('alert')).toContainText('changed'); expect(await snapshot(page)).toEqual(before); }
    else { await expect(review).not.toBeVisible(); expect((await snapshot(page)).graph.view).toEqual(before.graph.view); }
});

test('acceptance preserves the current camera without rolling back a captured pan gesture', async ({ page }) => {
    await load(page); await chooseImport(page, fragment);
    await page.evaluate(() => {
        const h = window.canvasHarness, rect = h.canvas.host.getBoundingClientRect();
        h.canvas.host.dispatchEvent(new MouseEvent('mousedown', { clientX: rect.left + 100, clientY: rect.top + 100, button: 1, bubbles: true }));
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: rect.left + 145, clientY: rect.top + 125, buttons: 4, bubbles: true }));
    });
    const camera = (await snapshot(page)).graph.view;
    await page.getByRole('dialog', { name: 'Import into graph' }).getByRole('button', { name: 'Insert into graph', exact: true }).evaluate(button => button.click());
    expect((await snapshot(page)).graph.view).toEqual(camera);
    await page.evaluate(() => { window.dispatchEvent(new MouseEvent('mouseup', { button: 1, bubbles: true })); });
});

for (const gesture of ['drag', 'link']) test(`an unfinished ${gesture} cannot survive installing a reviewed document`, async ({ page }) => {
    await load(page);
    await page.evaluate(async () => { const h = window.canvasHarness; await h.reset(); h.H.flush(h.graph); });
    await chooseImport(page, fragment);
    await page.evaluate(async () => {
        const controller = (await import('/src/run.js?v=' + window.canvasHarness.version)).getNativeWorkflowController();
        window.importGestureCancellations = 0;
        if (controller) { const cancel = controller.cancel; controller.cancel = (...args) => { window.importGestureCancellations++; return cancel(...args); }; }
    });
    const active = await page.evaluate(gesture => {
        const h = window.canvasHarness;
        const target = h.canvas.nodeLayer.querySelector(gesture === 'drag' ? '.pc-node-title' : '.pc-port[data-dir="out"]');
        const rect = target.getBoundingClientRect();
        target.dispatchEvent(new MouseEvent('mousedown', { clientX: rect.left + 5, clientY: rect.top + 5, button: 0, bubbles: true }));
        return !!(gesture === 'drag' ? h.canvas.drag : h.canvas.linking);
    }, gesture);
    expect(active).toBe(true);
    const before = await snapshot(page), history = await page.evaluate(() => window.canvasHarness.H.peek(window.canvasHarness.graph));
    const review = page.getByRole('dialog', { name: 'Import into graph' });
    await review.getByRole('button', { name: 'Insert into graph', exact: true }).evaluate(button => button.click());
    await expect(review.getByRole('alert')).toContainText('active graph gesture');
    expect(await snapshot(page)).toEqual(before);
    expect(await page.evaluate(() => window.canvasHarness.H.peek(window.canvasHarness.graph))).toEqual(history);
    expect(await page.evaluate(() => window.importGestureCancellations)).toBe(0);
    await page.evaluate(() => window.canvasHarness.canvas.cancelGesture());
    await review.getByRole('button', { name: 'Prepare again', exact: true }).click();
    await review.getByRole('button', { name: 'Insert into graph', exact: true }).click();
    expect(Object.keys((await snapshot(page)).graph.nodes)).toHaveLength(Object.keys(before.graph.nodes).length + 2);
    expect(await page.evaluate(() => !!window.canvasHarness.canvas.drag || !!window.canvasHarness.canvas.linking)).toBe(false);
});
