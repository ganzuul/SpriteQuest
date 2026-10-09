import { test, expect } from '@playwright/test';

async function setup(page) {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(async () => {
        const h = window.canvasHarness;
        const { canvasWorkflow } = await import('/tests/browser/native-fixture.mjs');
        const { operationDefaults } = await import('/src/workflow/catalog.js?v=' + h.version);
        const graph = canvasWorkflow(operationDefaults, 5, 3);
        graph.id = 'subgraph-authoring'; graph.name = 'Subgraph authoring';
        graph.nodes.n2.sections.push({ name: 'External', text: '' });
        graph.wires.shared = { id: 'shared', route: 'wire', from: 'n0', fromPort: 'out', to: 'n2', toPort: 'section.External' };
        graph.wires.w4 = { id: 'w4', route: 'wire', from: 'n2', fromPort: 'out', to: 'n4', toPort: 'section.Text' };
        await h.activate(graph); await h.view({ x: 160, y: 50, zoom: 0.85 });
    });
}
async function create(page) {
    await page.locator('.pc-node[data-id="n1"] .pc-native-heading').click();
    await page.locator('.pc-node[data-id="n2"] .pc-native-heading').click({ modifiers: ['Shift'] });
    await expect.poll(() => page.evaluate(() => [...window.canvasHarness.canvas.multi].sort())).toEqual(['n1', 'n2']);
    await page.locator('.pc-node[data-id="n1"] .pc-native-heading').click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Create Subgraph', exact: true }).click();
    await expect(page.locator('.pc-graph-tabs [role="tab"][aria-selected="true"]')).toContainText('Subgraph');
    return page.evaluate(() => {
        const root = structuredClone(window.canvasHarness.S.getGraph('subgraph-authoring'));
        delete root.updatedAt;
        return Object.values(root.nodes).find(node => node.type === 'subgraph').id;
    });
}
async function snapshot(page) {
    return page.evaluate(() => {
        const root = structuredClone(window.canvasHarness.S.getGraph('subgraph-authoring'));
        delete root.updatedAt;
        const wrapper = Object.values(root.nodes).find(node => node.type === 'subgraph');
        const definition = wrapper && root.definitions[JSON.stringify([wrapper.definition.id, wrapper.definition.version, wrapper.definition.semanticHash])];
        return { root, wrapper, definition };
    });
}

test('selection creates an editable tab with shared input, output fanout, preserved wires and one-step undo', async ({ page }) => {
    await setup(page); const before = (await snapshot(page)).root;
    const wrapperId = await create(page), state = await snapshot(page);
    expect(state.definition.interface.filter(port => port.direction === 'input' && port.kind === 'text')).toHaveLength(1);
    expect(state.definition.interface.filter(port => port.direction === 'input' && port.kind === 'data')).toHaveLength(2);
    expect(state.definition.interface.filter(port => port.direction === 'output')).toHaveLength(1);
    expect(state.root.wires.w1.to).toBe(wrapperId); expect(state.root.wires.shared).toBeUndefined();
    expect(state.root.wires.w3.from).toBe(wrapperId); expect(state.root.wires.w4.from).toBe(wrapperId);
    expect(state.definition.body.wires.w2.from).toBe('n1'); expect(state.definition.body.wires.w2.to).toBe('n2');
    await expect(page.locator('.pc-node-subgraph-input')).toHaveCount(3);
    await expect(page.locator('.pc-node-subgraph-output')).toHaveCount(1);
    await page.locator('.pc-node-subgraph-input .pc-native-heading').first().click();
    await expect(page.getByLabel('Subgraph port label', { exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(page.locator('.pc-graph-tabs [role="tab"]')).toHaveCount(1);
    expect((await snapshot(page)).root).toEqual(before);
    await page.getByRole('button', { name: 'Redo', exact: true }).click();
    await page.locator(`.pc-node[data-id="${wrapperId}"] .pc-native-heading`).dblclick();
    await expect(page.locator('.pc-node-subgraph-input')).toHaveCount(3);
    await expect(page.locator('.pc-node-subgraph-output')).toHaveCount(1);
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});

test('boundary blocks rename real parent pins and add a typed input that can be wired with the mouse', async ({ page }) => {
    await setup(page); const wrapperId = await create(page);
    await page.locator('.pc-node-subgraph-input:has(.pc-port[data-kind="text"])').getByRole('button', { name: 'Edit input', exact: true }).click();
    await expect(page.getByLabel('Subgraph port label', { exact: true })).toBeFocused();
    const previousLabel = await page.getByLabel('Subgraph port label', { exact: true }).inputValue();
    await page.getByLabel('Subgraph port label', { exact: true }).fill('Source text');
    await page.locator('[data-save-boundary]').click();
    let state = await snapshot(page);
    expect(state.definition.interface.find(port => port.direction === 'input' && port.kind === 'text').label).toBe('Source text');
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(page.getByLabel('Subgraph port label', { exact: true })).toHaveValue(previousLabel);
    await page.getByRole('button', { name: 'Redo', exact: true }).click();
    await expect(page.getByLabel('Subgraph port label', { exact: true })).toHaveValue('Source text');
    await page.locator('.pc-graph-tabs [role="tab"]').first().click();
    await expect(page.locator(`.pc-node[data-id="${wrapperId}"] .pc-native-pin-label`).filter({ hasText: 'Source text' })).toHaveCount(1);
    await page.locator(`.pc-node[data-id="${wrapperId}"] .pc-native-heading`).dblclick();
    await page.locator('.pc-node-subgraph-input:has(.pc-port[data-kind="text"])').getByRole('button', { name: 'Add input', exact: true }).click();
    await expect(page.locator('.pc-node-subgraph-input')).toHaveCount(4);
    await expect(page.getByLabel('Subgraph port label', { exact: true })).toBeFocused();
    await page.getByLabel('Subgraph port label', { exact: true }).fill('Alternate text');
    await page.locator('[data-save-boundary]').click();
    state = await snapshot(page);
    const added = state.definition.interface.find(port => port.label === 'Alternate text');
    expect(added.kind).toBe('text'); expect(added.required).toBe(false);
    const source = page.locator(`.pc-port[data-node="${added.boundaryNodeId}"][data-dir="out"]`);
    const destination = page.locator('.pc-port[data-node="n2"][data-port="section.External"]');
    const a = await source.boundingBox(), b = await destination.boundingBox();
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 }); await page.mouse.up();
    await expect.poll(async () => {
        const current = await snapshot(page);
        return Object.values(current.definition.body.wires).some(edge => edge.from === added.boundaryNodeId && edge.to === 'n2' && edge.toPort === 'section.External');
    }).toBe(true);
    await page.locator('.pc-graph-tabs [role="tab"]').first().click();
    await expect(page.locator(`.pc-node[data-id="${wrapperId}"] .pc-native-pin-label`).filter({ hasText: 'Alternate text' })).toHaveCount(1);
    expect(await page.evaluate(() => window.canvasHarness.toasts.filter(item => item.level === 'error'))).toEqual([]);
});

test('empty subgraph bodies offer input and output creation from the canvas menu', async ({ page }) => {
    await setup(page);
    await page.evaluate(() => {
        const root = window.canvasHarness.S.getGraph('subgraph-authoring');
        root.nodes.note = { id: 'note', type: 'note', x: 400, y: 300, content: 'Reusable notes' };
        window.canvasHarness.UI.refreshIfOpen();
    });
    await page.locator('.pc-node[data-id="note"]').click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Create Subgraph', exact: true }).click();
    await expect(page.locator('.pc-graph-tabs [role="tab"][aria-selected="true"]')).toContainText('Subgraph');
    const host = await page.locator('.pc-canvas-host').boundingBox();
    await page.mouse.click(host.x + host.width - 80, host.y + host.height - 80, { button: 'right' });
    await page.getByRole('menuitem', { name: 'Add subgraph input', exact: true }).click();
    await expect(page.getByLabel('Subgraph port label', { exact: true })).toBeFocused();
    await expect(page.locator('.pc-node-subgraph-input')).toHaveCount(1);
    await page.mouse.click(host.x + host.width - 80, host.y + host.height - 180, { button: 'right' });
    await page.getByRole('menuitem', { name: 'Add subgraph output', exact: true }).click();
    await expect(page.locator('.pc-node-subgraph-output')).toHaveCount(1);
});

test('extracting an existing subgraph preserves descendant tabs, presentation and camera through undo and redo', async ({ page }) => {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(async () => {
        const h = window.canvasHarness, { nestedWorkflow } = await import('/tests/fixtures/workflow-prepared-fixture.mjs');
        const root = nestedWorkflow(); root.id = 'relocated-subgraph-views'; root.name = 'Relocated views';
        root.nodes['first/path'].x = 320; root.nodes['first/path'].y = 140;
        await h.activate(root);
    });
    await page.locator('.pc-node[data-id="first/path"] .pc-native-heading').dblclick();
    await page.locator('.pc-node[data-id="work"] .pc-native-heading').click();
    await page.getByLabel('Alias', { exact: true }).fill('My inner wrapper');
    await page.getByLabel('Alias', { exact: true }).press('Tab');
    await page.getByLabel('Compact card', { exact: true }).check();
    await page.evaluate(() => window.canvasHarness.view({ x: 511, y: 193, zoom: 0.7 }));
    await page.locator('.pc-node[data-id="work"]').click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Open subgraph', exact: true }).click();
    await page.evaluate(() => window.canvasHarness.view({ x: 177, y: 81, zoom: 0.8 }));
    await page.locator('.pc-graph-tabs [role="tab"]').first().click();
    const savedViews = async () => (await page.evaluate(() => window.canvasHarness.S.settings().workspaceViews['relocated-subgraph-views'].views)).map(view => ({ ...view, portalPresentation: view.portalPresentation ?? {}, groupPresentation: view.groupPresentation ?? {} }));
    const before = await savedViews();
    const descendants = before.filter(view => view.identity.kind === 'instance');
    expect(descendants).toHaveLength(2);
    await page.locator('.pc-node[data-id="first/path"] .pc-native-heading').click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Create Subgraph', exact: true }).click();
    const wrapperId = await page.evaluate(() => Object.values(window.canvasHarness.S.getGraph('relocated-subgraph-views').nodes).find(node => node.type === 'subgraph' && node.id !== 'second').id);
    const relocated = descendants.map(view => ({ ...view, identity: { ...view.identity, instancePath: [wrapperId, ...view.identity.instancePath] } }));
    for (const expected of relocated) expect((await savedViews()).find(view => JSON.stringify(view.identity) === JSON.stringify(expected.identity))).toEqual(expected);
    await expect(page.locator('.pc-graph-tabs [role="tab"]')).toHaveCount(4);
    await page.locator('.pc-graph-tabs [role="tab"]').filter({ hasText: 'Outer' }).click();
    await page.getByLabel('Alias', { exact: true }).fill('Edited after extraction');
    await page.getByLabel('Alias', { exact: true }).press('Tab');
    await page.getByLabel('Compact card', { exact: true }).uncheck();
    await page.evaluate(() => window.canvasHarness.view({ x: 611, y: 230, zoom: 0.65 }));
    await page.getByRole('button', { name: /^Close Plan/ }).click();
    await page.locator('.pc-graph-tabs [role="tab"]').first().click();
    const latestRelocated = (await savedViews()).filter(view => view.identity.kind === 'instance' && view.identity.instancePath.length > 1);
    const latestOriginal = latestRelocated.map(view => ({ ...view, identity: { ...view.identity, instancePath: view.identity.instancePath.slice(1) } }));
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    for (const expected of latestOriginal) expect((await savedViews()).find(view => JSON.stringify(view.identity) === JSON.stringify(expected.identity))).toEqual(expected);
    await page.getByRole('button', { name: 'Redo', exact: true }).click();
    for (const expected of latestRelocated) expect((await savedViews()).find(view => JSON.stringify(view.identity) === JSON.stringify(expected.identity))).toEqual(expected);
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});

test('nested tabs first opened after extraction retain their presentation through undo and redo', async ({ page }) => {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(async () => {
        const h = window.canvasHarness, { nestedWorkflow } = await import('/tests/fixtures/workflow-prepared-fixture.mjs');
        const root = nestedWorkflow(); root.id = 'new-subgraph-views'; root.name = 'New nested views';
        root.nodes['first/path'].x = 320; root.nodes['first/path'].y = 140;
        await h.activate(root);
    });
    await expect(page.locator('.pc-graph-tabs [role="tab"]')).toHaveCount(1);
    await page.locator('.pc-node[data-id="first/path"] .pc-native-heading').click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Create Subgraph', exact: true }).click();
    await page.locator('.pc-node[data-id="first/path"]').click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Open subgraph', exact: true }).click();
    await page.locator('.pc-node[data-id="work"] .pc-native-heading').click();
    await page.getByLabel('Alias', { exact: true }).fill('Opened after extraction');
    await page.getByLabel('Alias', { exact: true }).press('Tab');
    await page.getByLabel('Compact card', { exact: true }).check();
    await page.evaluate(() => window.canvasHarness.view({ x: 611, y: 230, zoom: 0.65 }));
    await page.locator('.pc-node[data-id="work"]').click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Open subgraph', exact: true }).click();
    await page.evaluate(() => window.canvasHarness.view({ x: 700, y: 300, zoom: 0.8 }));
    await page.locator('.pc-graph-tabs [role="tab"]').first().click();
    const savedViews = async () => (await page.evaluate(() => window.canvasHarness.S.settings().workspaceViews['new-subgraph-views'].views)).map(view => ({ ...view, portalPresentation: view.portalPresentation ?? {}, groupPresentation: view.groupPresentation ?? {} }));
    const outgoing = (await savedViews()).filter(view => view.identity.kind === 'instance' && view.identity.instancePath.length > 1);
    expect(outgoing).toHaveLength(2);
    const incoming = outgoing.map(view => ({ ...view, identity: { ...view.identity, instancePath: view.identity.instancePath.slice(1) } }));
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    for (const expected of incoming) expect((await savedViews()).find(view => JSON.stringify(view.identity) === JSON.stringify(expected.identity))).toEqual(expected);
    await page.getByRole('button', { name: 'Redo', exact: true }).click();
    for (const expected of outgoing) expect((await savedViews()).find(view => JSON.stringify(view.identity) === JSON.stringify(expected.identity))).toEqual(expected);
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});
