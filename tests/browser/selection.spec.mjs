import { test, expect } from '@playwright/test';
test('Shift-drag preserves and moves the selected set with real mouse input', async ({ page }) => {
    const ids = await setup(page);
    const before = await page.evaluate(ids => {
        const { canvas, graph } = window.canvasHarness; canvas.setMulti(ids.slice(0, 2)); return ids.slice(0, 2).map(id => [graph.nodes[id].x, graph.nodes[id].y]);
    }, ids);
    const card = await page.locator(`.pc-node[data-id="${ids[0]}"]`).boundingBox();
    await page.keyboard.down('Shift'); await page.mouse.move(card.x + 100, card.y + 30); await page.mouse.down();
    await page.mouse.move(card.x + 140, card.y + 65, { steps: 4 }); await page.mouse.up(); await page.keyboard.up('Shift');
    const after = await page.evaluate(ids => ({ positions: ids.slice(0, 2).map(id => [window.canvasHarness.graph.nodes[id].x, window.canvasHarness.graph.nodes[id].y]), count: window.canvasHarness.canvas.multi.size }), ids);
    expect(after).toEqual({ positions: before.map(([x, y]) => [x + 40, y + 35]), count: 2 });
});
async function setup(page) {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    return page.evaluate(() => window.canvasHarness.reset());
}
async function graphPosition(page, x, y) {
    return page.evaluate(({ x, y }) => {
        const { canvas } = window.canvasHarness; const r = canvas.host.getBoundingClientRect(); const v = canvas.view;
        return { x: r.left + v.x + x * v.zoom, y: r.top + v.y + y * v.zoom };
    }, { x, y });
}
async function marquee(page, a, b, modifiers = []) {
    for (const modifier of modifiers) await page.keyboard.down(modifier);
    const start = await graphPosition(page, ...a), end = await graphPosition(page, ...b);
    await page.mouse.move(start.x, start.y); await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: 5 });
    const live = await page.evaluate(() => [...window.canvasHarness.canvas.multi]);
    await page.mouse.up();
    for (const modifier of [...modifiers].reverse()) await page.keyboard.up(modifier);
    return live;
}
test('real drag rectangles replace, add, and remove selection in graph coordinates', async ({ page }) => {
    const ids = await setup(page);
    expect(await marquee(page, [20, 20], [310, 180])).toEqual([ids[0]]);
    expect(new Set(await marquee(page, [320, 20], [610, 180], ['Shift']))).toEqual(new Set(ids.slice(0, 2)));
    expect(await marquee(page, [610, 180], [320, 20], ['Alt'])).toEqual([ids[0]]);
    await expect(page.locator('.pc-marquee')).toHaveCount(0);
});
test('Ctrl+A selects blocks, Escape clears selection, and shortcuts leave text controls alone', async ({ page }) => {
    const ids = await setup(page);
    await page.keyboard.press('Control+a');
    expect((await page.evaluate(() => [...window.canvasHarness.canvas.multi])).length).toBe(ids.length + 1);
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => window.canvasHarness.canvas.multi.size)).toBe(0);
    await expect(page.locator('.pc-root')).toBeVisible();
    const card = page.locator(`.pc-node[data-id="${ids[0]}"]`); await card.click();
    const text = page.locator('.pc-inspector textarea').first(); await text.focus();
    await page.keyboard.press('Control+a'); await page.keyboard.press('Backspace');
    expect(await page.evaluate(id => !!window.canvasHarness.graph.nodes[id], ids[0])).toBe(true);
});
test('drag direction and a non-default camera do not change rectangle hit testing', async ({ page }) => {
    const ids = await setup(page);
    await page.evaluate(id => {
        const { graph, canvas } = window.canvasHarness;
        graph.nodes[id].x = -80; graph.nodes[id].y = -60;
        canvas.render(); Object.assign(graph.view, { x: 140, y: 140, zoom: 0.8 }); canvas.applyTransform();
    }, ids[0]);
    for (const [a, b] of [[[-100, -80], [200, 150]], [[200, -80], [-100, 150]], [[-100, 150], [200, -80]], [[200, 150], [-100, -80]]]) {
        expect(await marquee(page, a, b)).toEqual([ids[0]]);
    }
});
test('selected blocks move together as one undo step and Escape restores an unfinished drag', async ({ page }) => {
    const ids = await setup(page);
    const positions = await page.evaluate(ids => {
        const h = window.canvasHarness;
        h.H.flush(h.graph); h.H.track(h.graph); h.canvas.setMulti(ids.slice(0, 2));
        return ids.slice(0, 2).map(id => ({ x: h.graph.nodes[id].x, y: h.graph.nodes[id].y }));
    }, ids);
    const p = await graphPosition(page, 100, 80);
    await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.x + 40, p.y + 30); await page.mouse.up();
    const after = await page.evaluate(ids => ids.slice(0, 2).map(id => ({ x: window.canvasHarness.graph.nodes[id].x, y: window.canvasHarness.graph.nodes[id].y })), ids);
    expect(after).toEqual(positions.map(p => ({ x: p.x + 40, y: p.y + 30 })));
    await page.keyboard.press('Control+z');
    expect(await page.evaluate(ids => ids.slice(0, 2).map(id => ({ x: window.canvasHarness.graph.nodes[id].x, y: window.canvasHarness.graph.nodes[id].y })), ids)).toEqual(positions);
    await page.evaluate(ids => window.canvasHarness.canvas.setMulti(ids.slice(0, 2)), ids);
    await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.x + 40, p.y + 30);
    await page.keyboard.press('Escape'); await page.mouse.up();
    expect(await page.evaluate(ids => ids.slice(0, 2).map(id => ({ x: window.canvasHarness.graph.nodes[id].x, y: window.canvasHarness.graph.nodes[id].y })), ids)).toEqual(positions);
    await expect(page.locator('.pc-root')).toBeVisible();
});
test('Space and middle-button pan over selected blocks; blur cancels a gesture', async ({ page }) => {
    const ids = await setup(page);
    await page.evaluate(ids => window.canvasHarness.canvas.setMulti(ids.slice(0, 2)), ids);
    const start = await graphPosition(page, 100, 80);
    await page.keyboard.down('Space'); await page.mouse.move(start.x, start.y); await page.mouse.down();
    await page.mouse.move(start.x + 50, start.y + 30); await page.mouse.up(); await page.keyboard.up('Space');
    expect(await page.evaluate(() => ({ ...window.canvasHarness.canvas.view }))).toEqual({ x: 50, y: 30, zoom: 1 });
    expect(new Set(await page.evaluate(() => [...window.canvasHarness.canvas.multi]))).toEqual(new Set(ids.slice(0, 2)));
    await page.mouse.down({ button: 'middle' }); await page.mouse.move(start.x + 90, start.y + 60);
    await page.evaluate(() => window.dispatchEvent(new Event('blur'))); await page.mouse.up({ button: 'middle' });
    expect(await page.evaluate(() => window.canvasHarness.canvas.pan)).toBeNull();
    expect(await page.evaluate(() => ({ ...window.canvasHarness.canvas.view }))).toEqual({ x: 50, y: 30, zoom: 1 });
});
