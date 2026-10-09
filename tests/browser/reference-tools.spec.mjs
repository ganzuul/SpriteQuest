import { test, expect } from '@playwright/test';

async function launchPost(page) {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(async () => {
        await window.canvasHarness.activate({ id: 'reference-tools-ui', name: 'Reference tools', schema: 3, runtime: 2, mode: 'native-post', roles: {}, nodes: {}, wires: {}, groups: {}, portals: {}, definitions: {}, view: { x: 0, y: 0, zoom: 1 } });
    });
}
async function insert(page, family, group, choice, operation) {
    await page.locator(`[data-family="${family}"]`).click();
    await page.locator(`[data-subfamily="${group}"]`).click();
    await page.locator(`[data-shelf-choice="${choice}"]`).click();
    const id = await page.evaluate(operation => Object.values(window.canvasHarness.graph.nodes).find(node => node.operation === operation).id, operation);
    await page.evaluate(async id => { const h = window.canvasHarness, node = h.graph.nodes[id]; await h.view({ x: 280 - node.x, y: 80 - node.y, zoom: 1 }); }, id);
    await page.locator(`.pc-node[data-id="${id}"] .pc-native-heading`).click();
    return id;
}

test('post Transpose presets and Details retain reference, scope and boolean controls', async ({ page }) => {
    await launchPost(page);
    await expect(page.locator('[data-family="Transpose"]')).toBeEnabled();
    const id = await insert(page, 'Transpose', 'Reference voice', 'operation:style-transfer:character-voice', 'style-transfer');
    await expect(page.getByLabel('Mode', { exact: true })).toHaveValue('character-voice');
    await expect(page.getByLabel('Scope', { exact: true })).toHaveValue('dialogue');
    await page.getByLabel('Reference', { exact: true }).selectOption('data');
    await page.getByLabel('Mode', { exact: true }).selectOption('rhythm');
    await expect(page.getByLabel('Scope', { exact: true })).toHaveValue('dialogue');
    await page.getByLabel('Scope', { exact: true }).selectOption('narration');
    await expect.poll(() => page.evaluate(id => { const node = window.canvasHarness.graph.nodes[id]; return [node.referenceKind, node.mode, node.scope]; }, id)).toEqual(['data', 'rhythm', 'narration']);
    await expect(page.locator(`.pc-node[data-id="${id}"] .pc-port[data-port="reference"]`)).toHaveAttribute('data-kind', 'data');
    const glossary = await insert(page, 'Transpose', 'Canonical terms', 'operation:terminology-map', 'terminology-map');
    await page.getByRole('checkbox', { name: 'Case sensitive', exact: true }).uncheck();
    await expect.poll(() => page.evaluate(id => window.canvasHarness.graph.nodes[id].caseSensitive, glossary)).toBe(false);
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});

test('cleanup preset retains category selection independently of mode and scope', async ({ page }) => {
    await launchPost(page);
    const id = await insert(page, 'Surface', 'Revision', 'operation:repair:strict', 'repair');
    await expect(page.getByLabel('Mode', { exact: true })).toHaveValue('strict');
    await expect(page.getByLabel('Scope', { exact: true })).toHaveValue('narration');
    await page.getByLabel('Policy categories (empty selects all)', { exact: true }).fill('generic-tension-atmosphere');
    await page.locator('[data-save-control="categories"]').click();
    await expect.poll(() => page.evaluate(id => window.canvasHarness.graph.nodes[id].categories, id)).toEqual(['generic-tension-atmosphere']);
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});

test('Repair Details shows scope and policy controls only for cleanup modes', async ({ page }) => {
    await launchPost(page);
    await insert(page, 'Surface', 'Revision', 'operation:repair', 'repair');
    const mode = page.getByLabel('Mode', { exact: true });
    await expect(mode).toHaveValue('repair');
    await expect(page.getByLabel('Scope', { exact: true })).toHaveCount(0);
    await expect(page.getByLabel('Policy categories (empty selects all)', { exact: true })).toHaveCount(0);
    await mode.selectOption('contextual');
    await expect(page.getByLabel('Scope', { exact: true })).toHaveValue('narration');
    await expect(page.getByLabel('Policy categories (empty selects all)', { exact: true })).toBeVisible();
    await mode.selectOption('scan');
    await expect(page.getByLabel('Scope', { exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});
