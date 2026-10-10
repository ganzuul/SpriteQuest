import { test, expect } from '@playwright/test';

async function openCanvas(page) {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(() => window.canvasHarness.reset());
}

async function centerOffset(page, selector) {
    return page.evaluate(selector => {
        const host = window.canvasHarness.canvas.host.getBoundingClientRect();
        const boxes = [...document.querySelectorAll(selector)].map(element => element.getBoundingClientRect());
        const left = Math.min(...boxes.map(box => box.left)), right = Math.max(...boxes.map(box => box.right));
        const top = Math.min(...boxes.map(box => box.top)), bottom = Math.max(...boxes.map(box => box.bottom));
        return { x: (left + right) / 2 - (host.left + host.width / 2),
            y: (top + bottom) / 2 - (host.top + host.height / 2), zoom: window.canvasHarness.canvas.view.zoom,
            contained: left >= host.left && right <= host.right && top >= host.top && bottom <= host.bottom };
    }, selector);
}

test('F fits and centers the selected node while preserving selection and history', async ({ page }) => {
    await openCanvas(page);
    const before = await page.evaluate(async () => {
        const h = window.canvasHarness;
        h.canvas.select({ kind: 'node', id: 'n0' });
        await h.view({ x: -430, y: 215, zoom: .8 });
        return { nodes: structuredClone(h.graph.nodes), history: h.H.peek(h.graph) };
    });
    await page.locator('.pc-canvas-host').focus();
    await page.keyboard.press('f');
    const offset = await centerOffset(page, '.pc-node[data-id="n0"]');
    expect(Math.abs(offset.x)).toBeLessThan(1);
    expect(Math.abs(offset.y)).toBeLessThan(1);
    expect(offset.zoom).toBe(1.2);
    expect(offset.contained).toBe(true);
    expect(await page.evaluate(() => window.canvasHarness.canvas.selection)).toEqual({ kind: 'node', id: 'n0' });
    expect(await page.evaluate(() => {
        const h = window.canvasHarness; return { nodes: h.graph.nodes, history: h.H.peek(h.graph) };
    })).toEqual(before);
});

test('F fits and centers the combined bounds of two or more selections', async ({ page }) => {
    await openCanvas(page);
    for (const ids of [['n0', 'n1'], ['n0', 'n1', 'n2']]) {
        await page.evaluate(async ids => {
            const h = window.canvasHarness;
            h.canvas.select(null); h.canvas.setMulti(ids);
            await h.view({ x: -390, y: 135, zoom: 1.4 });
        }, ids);
        await page.locator('.pc-canvas-host').focus();
        await page.keyboard.press('f');
        const selector = ids.length ? ids.map(id => `.pc-node[data-id="${id}"]`).join(', ') : '.pc-node';
        const offset = await centerOffset(page, selector);
        expect(Math.abs(offset.x), `horizontal center of ${JSON.stringify(ids)}`).toBeLessThan(1);
        expect(Math.abs(offset.y), `vertical center of ${JSON.stringify(ids)}`).toBeLessThan(1);
        expect(offset.zoom).toBeLessThanOrEqual(1.2);
        expect(offset.contained).toBe(true);
        expect(await page.evaluate(() => [...window.canvasHarness.canvas.multi])).toEqual(ids);
    }
});

test('F with no selection frames the graph using the same shelf-aware view as Fit graph', async ({ page }) => {
    await openCanvas(page);
    const fitted = await page.evaluate(async () => {
        const h = window.canvasHarness;
        h.canvas.select(null); h.canvas.setMulti([]);
        h.canvas.fit();
        const fitted = { ...h.canvas.view };
        await h.view({ x: -390, y: 135, zoom: 1.4 });
        return fitted;
    });
    await page.locator('.pc-canvas-host').focus();
    await page.keyboard.press('f');
    expect(await page.evaluate(() => ({ ...window.canvasHarness.canvas.view }))).toEqual(fitted);
    expect((await centerOffset(page, '.pc-node')).contained).toBe(true);
});

test('View advertises F for fitting, period remains an alias, and Center selection preserves zoom', async ({ page }) => {
    await openCanvas(page);
    await page.evaluate(async () => {
        const h = window.canvasHarness;
        h.canvas.select({ kind: 'node', id: 'n0' });
        await h.view({ x: -430, y: 215, zoom: .8 });
    });
    await page.getByRole('menubar', { name: 'Workspace menus' }).getByRole('menuitem', { name: 'View', exact: true }).click();
    await expect(page.getByRole('menuitem', { name: 'Fit selection', exact: true }).locator('kbd')).toHaveText('F');
    const center = page.getByRole('menuitem', { name: 'Center selection', exact: true });
    await expect(center.locator('kbd')).toHaveCount(0);
    await center.click();
    expect((await centerOffset(page, '.pc-node[data-id="n0"]')).zoom).toBe(.8);
    await page.locator('.pc-canvas-host').focus();
    await page.keyboard.press('f');
    const fitted = await page.evaluate(() => ({ ...window.canvasHarness.canvas.view }));
    await page.evaluate(() => window.canvasHarness.view({ x: -430, y: 215, zoom: .8 }));
    await page.keyboard.press('.');
    expect(await page.evaluate(() => ({ ...window.canvasHarness.canvas.view }))).toEqual(fitted);
});

test('F leaves the camera alone while typing, with command modifiers, or when the canvas is closed', async ({ page }) => {
    await openCanvas(page);
    const before = await page.evaluate(async () => {
        const h = window.canvasHarness;
        h.canvas.select({ kind: 'node', id: 'n0' });
        await h.view({ x: -430, y: 215, zoom: .8 });
        return { ...h.canvas.view };
    });
    const alias = page.getByLabel('Node name', { exact: true });
    await alias.fill('Alias');
    await alias.press('f');
    await expect(alias).toHaveValue('Aliasf');
    expect(await page.evaluate(() => ({ ...window.canvasHarness.canvas.view }))).toEqual(before);
    for (const tag of ['textarea', 'div']) {
        await page.evaluate(tag => {
            const editor = document.createElement(tag);
            editor.id = 'focus-test-editor';
            if (tag === 'div') editor.contentEditable = 'true';
            document.querySelector('.pc-root').append(editor);
        }, tag);
        await page.locator('#focus-test-editor').press('f');
        expect(await page.evaluate(() => ({ ...window.canvasHarness.canvas.view }))).toEqual(before);
        await page.evaluate(() => document.getElementById('focus-test-editor').remove());
    }
    await page.locator('.pc-canvas-host').focus();
    const modified = await page.evaluate(() => [
        { ctrlKey: true }, { metaKey: true }, { altKey: true }, { repeat: true },
    ].map(options => {
        const h = window.canvasHarness;
        const event = new KeyboardEvent('keydown', { key: 'f', bubbles: true, cancelable: true, ...options });
        h.canvas.host.dispatchEvent(event);
        return { prevented: event.defaultPrevented, camera: { ...h.canvas.view } };
    }));
    for (const result of modified) expect(result).toEqual({ prevented: false, camera: before });
    await page.getByRole('button', { name: 'Close canvas', exact: true }).click();
    await page.keyboard.press('f');
    expect(await page.evaluate(() => ({ ...window.canvasHarness.canvas.view }))).toEqual(before);
});

test('F during a node drag preserves the camera and the next pointer movement', async ({ page }) => {
    await openCanvas(page);
    await page.evaluate(() => window.canvasHarness.view({ x: 100, y: 100, zoom: 1 }));
    const heading = await page.locator('.pc-node[data-id="n0"] .pc-native-heading').boundingBox();
    const x = heading.x + heading.width / 2, y = heading.y + heading.height / 2;
    await page.mouse.move(x, y); await page.mouse.down();
    await page.mouse.move(x + 20, y + 20);
    expect(await page.evaluate(() => window.canvasHarness.canvas.hasContentGesture())).toBe(true);
    const before = await page.evaluate(() => {
        const canvas = window.canvasHarness.canvas;
        return { camera: { ...canvas.view }, node: { x: canvas.graph.nodes.n0.x, y: canvas.graph.nodes.n0.y } };
    });
    await page.keyboard.press('f');
    expect(await page.evaluate(() => ({ ...window.canvasHarness.canvas.view }))).toEqual(before.camera);
    await page.mouse.move(x + 30, y + 30); await page.mouse.up();
    const after = await page.evaluate(() => {
        const node = window.canvasHarness.canvas.graph.nodes.n0; return { x: node.x, y: node.y };
    });
    expect(after.x).toBeCloseTo(before.node.x + 10);
    expect(after.y).toBeCloseTo(before.node.y + 10);
});
