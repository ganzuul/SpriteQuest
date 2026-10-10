import { test, expect } from '@playwright/test';
async function load(page) {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
}
async function viewMenu(page) {
    await page.getByRole('menubar', { name: 'Workspace menus' }).getByRole('menuitem', { name: 'View', exact: true }).click();
}
test('View remembers shelf visibility and Reset layout restores panels without changing the document', async ({ page }) => {
    await load(page);
    await viewMenu(page);
    await page.getByRole('menuitemcheckbox', { name: 'Show node shelf', exact: true }).click();
    await expect(page.locator('.pc-node-shelf')).toBeHidden();
    await page.reload(); await page.waitForFunction(() => !!window.canvasHarness);
    await expect(page.locator('.pc-node-shelf')).toBeHidden();
    const before = await page.evaluate(() => structuredClone(window.canvasHarness.graph));
    await viewMenu(page);
    await page.getByRole('menuitem', { name: 'Reset panel layout', exact: true }).click();
    await expect(page.locator('.pc-node-shelf')).toBeVisible();
    await expect(page.locator('.pc-preview-content')).toBeVisible();
    await expect(page.locator('.pc-workspace-details')).toBeVisible();
    expect(await page.evaluate(() => structuredClone(window.canvasHarness.graph))).toEqual(before);
});

test('Graph Rename reveals hidden Details and focuses the selected node name', async ({ page }) => {
    await load(page);
    await page.evaluate(async () => { const h = window.canvasHarness; await h.reset(); h.canvas.select({kind:'node',id:'n1'}); await h.settle(); });
    await viewMenu(page);
    await page.getByRole('menuitemcheckbox', {name:'Show Details',exact:true}).click();
    await expect(page.locator('.pc-workspace-details')).toBeHidden();
    await page.getByRole('menubar',{name:'Workspace menus'}).getByRole('menuitem',{name:'Graph',exact:true}).click();
    await page.getByRole('menuitem',{name:'Rename selection…',exact:true}).click();
    await expect(page.locator('.pc-workspace-details')).toBeVisible();
    await expect(page.getByRole('textbox',{name:'Node name',exact:true})).toBeFocused();
});

test('validation and Help show current data and documentation without running or editing the workflow', async ({ page }) => {
    await load(page);
    await page.evaluate(() => window.canvasHarness.reset());
    const before = await page.evaluate(() => structuredClone(window.canvasHarness.graph));
    const menubar = page.getByRole('menubar', {name:'Workspace menus'});
    await menubar.getByRole('menuitem', {name:'Workflow',exact:true}).click();
    await page.getByRole('menuitem', {name:'Validate workflow',exact:true}).click();
    const report = page.getByRole('dialog', {name:'Workflow validation',exact:true});
    await expect(report).toContainText(before.name);
    await expect(report).toContainText('maximum 0 model requests');
    await expect(report).toContainText('Add Guidance, Apply Reply or Memory Commit to finish the workflow.');
    await page.keyboard.press('Escape');
    await menubar.getByRole('menuitem', {name:'Help',exact:true}).click();
    await page.getByRole('menuitem', {name:'About Lattice',exact:true}).click();
    await expect(page.getByRole('dialog', {name:'About Lattice',exact:true})).toContainText('Lattice ' + await page.evaluate(() => window.canvasHarness.version));
    await page.keyboard.press('Escape');
    await menubar.getByRole('menuitem', {name:'Help',exact:true}).click();
    await page.getByRole('menuitem', {name:'Node reference',exact:true}).click();
    const reference = page.getByRole('link', {name:'Open the complete node reference',exact:true});
    await page.keyboard.press('Tab');
    await expect(reference).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', {name:'Close panel',exact:true})).toBeFocused();
    expect((await page.request.get(await reference.getAttribute('href'))).ok()).toBe(true);
    expect(await page.evaluate(() => structuredClone(window.canvasHarness.graph))).toEqual(before);
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});

test('View pins the selected output and Workflow diagnostics retain its exact source and target', async ({ page }) => {
    await load(page);
    await page.evaluate(async () => { const h = window.canvasHarness; await h.reset(); h.canvas.select({kind: 'node', id: 'n1'}); await h.settle(); });
    const choice = page.locator('.pc-output-preview').getByRole('combobox', { name: 'Preview output', exact: true });
    const target = JSON.parse(await choice.inputValue());
    const before = await page.evaluate(() => structuredClone(window.canvasHarness.graph));
    await viewMenu(page);
    await page.getByRole('menuitemradio', { name: 'Pin current output', exact: true }).click();
    await page.evaluate(async () => { const h = window.canvasHarness; h.canvas.select({kind:'node',id:'n0'}); await h.settle(); });
    expect(JSON.parse(await choice.inputValue())).toEqual(target);
    await page.getByRole('menubar', {name:'Workspace menus'}).getByRole('menuitem', {name:'Workflow',exact:true}).click();
    await page.getByRole('menuitem', {name:'Run to current output',exact:true}).click();
    await expect(page.locator('.pc-run-meter-label')).toHaveText('Completed');
    const result = await page.evaluate(async () => {
        const h = window.canvasHarness, run = (await import('/src/run.js?v='+h.version)).getNativeWorkflowController().lastResult();
        const { expandRecordAddress } = await import('/src/workflow/record-data.js?v='+h.version);
        const encoded = run.recording.plan.target;
        return { mode: run.mode, target: {...expandRecordAddress(run.recording, encoded.address), portId: run.recording.identities.strings[encoded.port]}, providerCalls: h.providerCalls() };
    });
    expect(result).toEqual({mode:'target',target,providerCalls:0});
    expect(await page.evaluate(() => structuredClone(window.canvasHarness.graph))).toEqual(before);
});
