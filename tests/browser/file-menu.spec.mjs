import { test, expect } from '@playwright/test';

async function load(page) {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
}
async function menu(page, action) {
    await page.getByRole('menubar', { name: 'Workspace menus' }).getByRole('menuitem', { name: 'File', exact: true }).click();
    await page.getByRole('menuitem', { name: action, exact: true }).click({ timeout: 2500 });
}
async function snapshot(page) {
    return page.evaluate(() => {
        const h = window.canvasHarness, settings = h.S.settings();
        return structuredClone({ graphs: settings.graphs, activeGraphId: settings.activeGraphId, enabled: settings.enabled, nativeBindings: settings.nativeBindings });
    });
}
async function workflowFile(page) {
    return page.evaluate(() => {
        const h = window.canvasHarness, file = JSON.parse(h.S.exportGraph(h.graph.id));
        file.graph.name = 'Opened JSON workflow';
        return file;
    });
}
async function choose(page, action, value) {
    const [chooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 2500 }),
        menu(page, action),
    ]);
    await chooser.setFiles({ name: 'example.workflow.json', mimeType: 'application/json', buffer: Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)) });
    return chooser;
}

test('File Open uses the system JSON picker and opens a separate workflow', async ({ page }) => {
    await load(page);
    const before = await snapshot(page), file = await workflowFile(page);
    const chooser = await choose(page, 'Open workflow…', file);
    expect(await chooser.element().getAttribute('accept')).toContain('.json');
    expect(chooser.isMultiple()).toBe(false);
    await expect.poll(() => page.evaluate(() => window.canvasHarness.graph.name)).toBe('Opened JSON workflow');
    const after = await snapshot(page);
    expect(after.activeGraphId).not.toBe(before.activeGraphId);
    expect(after.graphs[before.activeGraphId]).toEqual(before.graphs[before.activeGraphId]);
    expect(Object.keys(after.graphs)).toHaveLength(Object.keys(before.graphs).length + 1);
    expect(after.enabled).toBe(before.enabled);
    expect(after.nativeBindings).toEqual(before.nativeBindings);
});

test('File Save persists the full workflow, local bindings and current camera', async ({ page }) => {
    await load(page);
    const expected = await page.evaluate(async () => {
        const h = window.canvasHarness, role = Object.keys(h.graph.roles)[0];
        h.graph.roles[role] = { profileId: 'local-profile', model: 'local-model' };
        h.S.touchGraph(h.graph); h.UI.refreshIfOpen(); await h.settle();
        window.fileMenuSaves = [];
        h.context.saveSettingsDebounced = () => window.fileMenuSaves.push(structuredClone(h.context.extensionSettings.lattice));
        await h.view({ x: 321, y: 87, zoom: 0.8 });
        return { document: structuredClone(h.graph), camera: { ...h.canvas.view }, saves: window.fileMenuSaves.length };
    });
    await page.getByRole('menubar', { name: 'Workspace menus' }).getByRole('menuitem', { name: 'File', exact: true }).click();
    const save = page.getByRole('menuitem', { name: 'Save to workspace', exact: true });
    await expect(save).toBeVisible({ timeout: 2000 });
    await save.click();
    await expect.poll(() => page.evaluate(() => window.fileMenuSaves.length)).toBeGreaterThan(expected.saves);
    const persisted = await page.evaluate(() => window.fileMenuSaves.at(-1));
    expect(persisted.graphs[expected.document.id]).toEqual(expected.document);
    expect(persisted.workspaceViews[expected.document.id].views.find(view => view.identity.kind === 'root').camera).toEqual(expected.camera);
    expect(await page.evaluate(() => window.canvasHarness.toasts.some(toast => /save requested.*SillyTavern/i.test(toast.message)))).toBe(true);
});

test('File Export JSON downloads a portable copy that Open can reopen without changing the original', async ({ page }) => {
    await load(page);
    const role = await page.evaluate(() => {
        const h = window.canvasHarness, role = Object.keys(h.graph.roles)[0];
        h.graph.roles[role] = { profileId: 'local-profile', model: 'local-model' };
        h.S.touchGraph(h.graph); return role;
    });
    const before = await snapshot(page);
    const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 2500 }),
        menu(page, 'Export portable workflow…'),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.workflow\.json$/);
    const chunks = [];
    for await (const chunk of await download.createReadStream()) chunks.push(chunk);
    const file = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    expect(file).toMatchObject({ kind: 'lattice-workflow', schema: 2, minRuntime: 2 });
    expect(file.graph.roles[role]).toEqual({ profileId: null, model: 'local-model' });
    expect(await snapshot(page)).toEqual(before);
    await page.getByRole('menubar', { name: 'Workspace menus' }).getByRole('menuitem', { name: 'File', exact: true }).click();
    await expect(page.getByRole('menuitem', { name: 'Import workflow', exact: true })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await choose(page, 'Open workflow…', file);
    await expect.poll(() => page.evaluate(() => window.canvasHarness.graph.id)).not.toBe(before.activeGraphId);
    const after = await snapshot(page);
    expect(after.graphs[before.activeGraphId]).toEqual(before.graphs[before.activeGraphId]);
    expect(Object.keys(after.graphs[after.activeGraphId].nodes)).toHaveLength(Object.keys(file.graph.nodes).length);
});

test('File New immediately opens a unified starter and retains existing workflows', async ({ page }) => {
    await load(page);
    await page.evaluate(() => window.canvasHarness.view({ x: 180, y: 120, zoom: 0.75 }));
    const before = await snapshot(page);
    await menu(page, 'New workflow');
    await expect.poll(() => page.evaluate(() => window.canvasHarness.graph.id)).not.toBe(before.activeGraphId);
    const after = await snapshot(page);
    expect(after.graphs[after.activeGraphId].name).toBe('Untitled workflow');
    expect(Object.keys(after.graphs)).toHaveLength(Object.keys(before.graphs).length + 1);
    expect(after.graphs[before.activeGraphId]).toEqual(before.graphs[before.activeGraphId]);
    expect(after.graphs[after.activeGraphId].mode).toBe('native-unified');
    expect(Object.values(after.graphs[after.activeGraphId].nodes).map(node=>node.operation)).toEqual(['on-send','generate-reply','review-publish']);
    expect(Object.keys(after.graphs[after.activeGraphId].wires)).toHaveLength(2);
    expect(after.enabled).toBe(before.enabled);
    expect(after.nativeBindings).toEqual(before.nativeBindings);
});

test('closing and reopening the same workflow cancels its inline rename draft', async ({ page }) => {
    await load(page);
    await page.getByRole('menubar', { name: 'Workspace menus' }).getByRole('menuitem', { name: 'File', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Rename workflow…', exact: true }).click();
    const rename = page.locator('.pc-graph-tabs').getByRole('textbox', { name: 'Graph name', exact: true });
    await rename.fill('Discarded rename draft');
    await page.evaluate(async () => {
        const h = window.canvasHarness;
        h.UI.refreshIfOpen(); await h.settle();
    });
    await expect(rename).toHaveValue('Discarded rename draft');
    await page.evaluate(async () => {
        const h = window.canvasHarness, graph = h.graph;
        h.UI.close();
        graph.name = 'Changed while closed'; h.S.touchGraph(graph);
        h.UI.open(); await h.settle();
    });
    await expect(rename).toHaveCount(0);
    await expect(page.locator('.pc-graph-tabs [role="tab"]').first()).toHaveText('Changed while closed');
    expect(await page.evaluate(() => window.canvasHarness.graph.name)).toBe('Changed while closed');
});

test('File New offers to save edited workflow changes and Cancel preserves the canvas', async ({ page }) => {
    await load(page);
    await page.evaluate(async () => {
        const h = window.canvasHarness;
        h.graph.description = 'Unsaved workflow description';
        h.S.touchGraph(h.graph); h.UI.refreshIfOpen(); await h.settle();
        await h.view({ x: 120, y: 80, zoom: 0.75 });
    });
    const before = await snapshot(page);
    await menu(page, 'New workflow');
    const dialog = page.getByRole('dialog', { name: 'Save workflow changes?', exact: true });
    await expect(dialog).toBeVisible({ timeout: 2500 });
    await expect(dialog.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    expect(await snapshot(page)).toEqual(before);
    expect(await page.evaluate(() => ({ ...window.canvasHarness.canvas.view }))).toMatchObject({ x: 120, y: 80, zoom: 0.75 });
    await menu(page, 'New workflow');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    expect(await snapshot(page)).toEqual(before);
});

test('File New Save downloads all current workflow edits before opening a unified starter', async ({ page }) => {
    await load(page);
    await page.evaluate(async () => {
        const h = window.canvasHarness;
        h.graph.description = 'Save these workflow edits';
        h.S.touchGraph(h.graph); h.UI.refreshIfOpen(); await h.settle();
    });
    const before = await snapshot(page);
    await menu(page, 'New workflow');
    const dialog = page.getByRole('dialog', { name: 'Save workflow changes?', exact: true });
    const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 2500 }),
        dialog.getByRole('button', { name: 'Save', exact: true }).click({ timeout: 2500 }),
    ]);
    const chunks = [];
    for await (const chunk of await download.createReadStream()) chunks.push(chunk);
    const file = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    expect(file.graph.id).toBe(before.activeGraphId);
    expect(file.graph.description).toBe('Save these workflow edits');
    expect(Object.keys(file.graph.nodes)).toEqual(Object.keys(before.graphs[before.activeGraphId].nodes));
    await expect.poll(() => page.evaluate(() => window.canvasHarness.graph.id)).not.toBe(before.activeGraphId);
    const after = await snapshot(page);
    expect(after.graphs[after.activeGraphId].mode).toBe('native-unified');
    expect(Object.values(after.graphs[after.activeGraphId].nodes).map(node=>node.operation)).toEqual(['on-send','generate-reply','review-publish']);
    expect(Object.keys(after.graphs[after.activeGraphId].wires)).toHaveLength(2);
    expect(after.graphs[before.activeGraphId]).toEqual(before.graphs[before.activeGraphId]);
});

test('File New Discard opens a unified starter without downloading the edited workflow', async ({ page }) => {
    await load(page);
    const downloads = [];
    page.on('download', download => downloads.push(download));
    await page.evaluate(async () => {
        const h = window.canvasHarness;
        h.graph.description = 'Kept in the workspace';
        h.S.touchGraph(h.graph); h.UI.refreshIfOpen(); await h.settle();
    });
    const before = await snapshot(page);
    await menu(page, 'New workflow');
    await page.getByRole('dialog', { name: 'Save workflow changes?', exact: true }).getByRole('button', { name: 'Discard', exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.canvasHarness.graph.id)).not.toBe(before.activeGraphId);
    const after = await snapshot(page);
    expect(after.graphs[after.activeGraphId].mode).toBe('native-unified');
    expect(Object.values(after.graphs[after.activeGraphId].nodes).map(node=>node.operation)).toEqual(['on-send','generate-reply','review-publish']);
    expect(Object.keys(after.graphs[after.activeGraphId].wires)).toHaveLength(2);
    expect(after.graphs[before.activeGraphId]).toEqual(before.graphs[before.activeGraphId]);
    expect(downloads).toEqual([]);
});

test('File New keeps the current workflow if its save download fails', async ({ page }) => {
    await load(page);
    await page.evaluate(async () => {
        const h = window.canvasHarness;
        h.graph.description = 'Changes must remain available';
        h.S.touchGraph(h.graph); h.UI.refreshIfOpen(); await h.settle();
        URL.createObjectURL = () => { throw new Error('Save download failed'); };
    });
    const before = await snapshot(page);
    await menu(page, 'New workflow');
    await page.getByRole('dialog', { name: 'Save workflow changes?', exact: true }).getByRole('button', { name: 'Save', exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.canvasHarness.toasts.at(-1))).toMatchObject({ type: 'error', message: 'Save download failed' });
    expect(await snapshot(page)).toEqual(before);
    await menu(page, 'New workflow');
    await expect(page.getByRole('dialog', { name: 'Save workflow changes?', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    expect(await snapshot(page)).toEqual(before);
});

test('the New save prompt blocks canvas shortcuts when the backdrop takes focus', async ({ page }) => {
    await load(page);
    await page.evaluate(async () => {
        const h = window.canvasHarness;
        h.canvas.select({ kind: 'node', id: Object.keys(h.graph.nodes)[0] });
        h.graph.description = 'Protect this workflow';
        h.S.touchGraph(h.graph); h.UI.refreshIfOpen(); await h.settle();
    });
    const before = await snapshot(page);
    await menu(page, 'New workflow');
    const dialog = page.getByRole('dialog', { name: 'Save workflow changes?', exact: true });
    await expect(dialog).toBeVisible();
    await page.mouse.click(5, 5);
    await page.keyboard.press('Delete');
    expect(await snapshot(page)).toEqual(before);
    await page.evaluate(() => {
        const clipboardData = new DataTransfer();
        clipboardData.setData('text/plain', 'Do not paste onto the canvas');
        document.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }));
    });
    expect(await snapshot(page)).toEqual(before);
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    expect(await snapshot(page)).toEqual(before);
});

test('the New save prompt wraps backward from dialog focus into its buttons', async ({ page }) => {
    await load(page);
    await page.evaluate(async () => {
        const h = window.canvasHarness;
        h.graph.description = 'Keep focus in the prompt';
        h.S.touchGraph(h.graph); h.UI.refreshIfOpen(); await h.settle();
    });
    await menu(page, 'New workflow');
    const dialog = page.getByRole('dialog', { name: 'Save workflow changes?', exact: true });
    await page.mouse.click(5, 5);
    await page.keyboard.press('Delete');
    await expect(dialog).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('combobox', { name: 'New workflow type', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Save', exact: true })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('combobox', { name: 'New workflow type', exact: true })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
});

test('cancelling either File picker leaves all workflows and assignments unchanged', async ({ page }) => {
    await load(page);
    const before = await snapshot(page);
    for (const action of ['Open workflow…', 'Import into current graph…']) {
        const [chooser] = await Promise.all([page.waitForEvent('filechooser'), menu(page, action)]);
        await chooser.setFiles([]);
        await chooser.element().evaluate(input => input.dispatchEvent(new Event('cancel', { bubbles: true })));
        await page.evaluate(() => window.canvasHarness.settle());
        expect(await snapshot(page)).toEqual(before);
        await expect(page.getByRole('dialog', { name: 'Import into graph', exact: true })).toHaveCount(0);
    }
});

test('invalid and unreadable File selections report errors without changing workflows', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await load(page);
    const before = await snapshot(page), file = await workflowFile(page);
    for (const action of ['Open workflow…', 'Import into current graph…']) {
        for (const value of ['{invalid', { kind: 'lattice-workflow', schema: 99, minRuntime: 2 }]) {
            const count = await page.evaluate(() => window.canvasHarness.toasts.length);
            await choose(page, action, value);
            await expect.poll(() => page.evaluate(() => window.canvasHarness.toasts.length)).toBeGreaterThan(count);
            expect(await page.evaluate(() => window.canvasHarness.toasts.at(-1).type)).toBe('error');
            expect(await snapshot(page)).toEqual(before);
        }
    }
    await page.evaluate(() => { File.prototype.text = async () => { throw new Error('Simulated file read failure'); }; });
    for (const action of ['Open workflow…', 'Import into current graph…']) {
        const count = await page.evaluate(() => window.canvasHarness.toasts.length);
        await choose(page, action, file);
        await expect.poll(() => page.evaluate(() => window.canvasHarness.toasts.length)).toBeGreaterThan(count);
        expect(await page.evaluate(() => window.canvasHarness.toasts.at(-1))).toMatchObject({ type: 'error', message: expect.stringMatching(/read/i) });
        expect(await snapshot(page)).toEqual(before);
    }
    await expect(page.getByRole('dialog', { name: 'Import into graph', exact: true })).toHaveCount(0);
    expect(pageErrors).toEqual([]);
});

test('a delayed Open cannot change the workflow after switching roots or closing', async ({ page }) => {
    await load(page);
    await page.evaluate(() => {
        const read = File.prototype.text;
        File.prototype.text = async function () {
            const text = await read.call(this);
            return new Promise(resolve => { window.releaseFileMenuRead = () => resolve(text); });
        };
    });
    for (const change of ['switch', 'close']) {
        await page.evaluate(() => { delete window.releaseFileMenuRead; });
        await choose(page, 'Open workflow…', await workflowFile(page));
        await page.waitForFunction(() => !!window.releaseFileMenuRead);
        if (change === 'switch') {
            const id = await page.evaluate(() => {
                const h = window.canvasHarness, graph = h.S.createGraph('Another saved workflow');
                h.UI.refreshIfOpen(); return graph.id;
            });
            await page.getByRole('combobox', { name: 'Workflow', exact: true }).selectOption(id);
        } else await menu(page, 'Close workspace');
        const before = await snapshot(page);
        await page.evaluate(async () => { window.releaseFileMenuRead(); await window.canvasHarness.settle(); });
        expect(await snapshot(page)).toEqual(before);
    }
    await expect(page.getByRole('dialog', { name: 'Lattice', exact: true })).toBeHidden();
});

test('File Close retains committed workflow data and restores the same workspace and camera', async ({ page }) => {
    await load(page);
    const camera = await page.evaluate(async () => {
        const h = window.canvasHarness;
        window.fileMenuRoot = document.querySelector('.pc-root');
        window.fileMenuGraph = h.graph;
        await h.view({ x: 230, y: 145, zoom: 0.75 });
        return { ...h.canvas.view };
    });
    const before = await snapshot(page);
    await menu(page, 'Close workspace');
    await expect(page.getByRole('dialog', { name: 'Lattice', exact: true })).toBeHidden();
    expect(await snapshot(page)).toEqual(before);
    await page.evaluate(async () => { window.canvasHarness.UI.open(); await window.canvasHarness.settle(); });
    await expect(page.getByRole('dialog', { name: 'Lattice', exact: true })).toBeVisible();
    expect(await snapshot(page)).toEqual(before);
    expect(await page.evaluate(() => ({
        sameRoot: window.fileMenuRoot === document.querySelector('.pc-root'),
        sameDocument: window.fileMenuGraph === window.canvasHarness.graph,
        camera: { ...window.canvasHarness.canvas.view },
        providerCalls: window.canvasHarness.providerCalls(),
    }))).toEqual({ sameRoot: true, sameDocument: true, camera, providerCalls: 0 });
});
