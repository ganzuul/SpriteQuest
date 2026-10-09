import { test, expect } from '@playwright/test';
async function setup(page) {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    return page.evaluate(() => window.canvasHarness.reset());
}
test('all block types, tall named ports and wire modes survive token, trace and theme updates', async ({ page }) => {
    await setup(page);
    const result = await page.evaluate(async () => {
        const { canvas, S, settle } = window.canvasHarness; const g = canvas.graph, fresh = S.blankGraph('Parity');
        g.nodes = fresh.nodes; g.wires = {}; g.groups = {};
        const nodes = { output: S.outputNode(g) };
        for (const [i, type] of Object.values(S.NODE_TYPES).filter(type => type !== 'output').entries()) nodes[type] = S.addNode(g, type, (i % 3) * 310, Math.floor(i / 3) * 210);
        const dec = nodes.decider; dec.mode = 'all'; dec.keys = Array.from({ length: 18 }, (_, i) => S.newDeciderKey(`Route ${i + 1}`));
        dec.keys.forEach(key => { key.conditions[0].terms = 'go'; });
        const state = nodes.state, value = S.newStateValue('energy'); value.stageDots = true;
        value.stages = [{ id: 'awake', name: 'Awake', from: 5, to: 10, text: 'Awake.' }]; state.values = [value];
        const gen = nodes.generate, gen2 = S.addNode(g, 'generate', gen.x + 320, gen.y + 100);
        const link = (from, to, kind = 'merge', options) => { const r = S.connect(g, from.id, to.id, kind, options); if (!r.ok) throw Error(r.reason); return r.wire; };
        link(nodes.prompt, gen); link(gen, nodes.output); link(gen, gen2, 'together'); link(gen, nodes.memory, 'save');
        link(gen, nodes.prompt); link(nodes.history, nodes.output, 'append'); link(nodes.injection, nodes.output, 'prepend');
        const named = link(dec, nodes.output, 'merge', { port: dec.keys[0].id }); named.mode = 'activate';
        const stage = S.outPorts(state).find(port => port.stage); link(state, nodes.output, 'merge', { port: stage.id });
        link(nodes.lorebook, nodes.output).mode = 'result';
        canvas.setGraph(g); await settle();
        const card = canvas.nodeLayer.querySelector(`[data-id="${dec.id}"]`), port = card.querySelector('.pc-port-key');
        const wire = canvas.svg.querySelector(`.pc-wire[data-id="${named.id}"]`);
        const start = wire.getAttribute('d').match(/^M ([\d.-]+) ([\d.-]+)/).slice(1).map(Number);
        const expected = [dec.x + dec.w / (S.outPorts(dec).length + 1), dec.y + card.offsetHeight];
        const version = (await (await fetch('/manifest.json')).json()).version;
        for (const theme of ['neon', 'parchment', 'blueprint']) (await import('/src/theme.js?v=' + version)).setPreset(theme);
        canvas.setTokens(new Map([[dec.id, { own: 12, exact: true }]])); canvas.setTrace([{ id: dec.id, status: 'in', decision: [dec.keys[0].id] }]);
        return { types: Object.values(S.NODE_TYPES).every(type => canvas.nodeLayer.querySelector('.pc-node-' + type)), height: card.offsetHeight,
            start, expected, ports: card.querySelectorAll('.pc-port-key').length, stagePorts: canvas.nodeLayer.querySelectorAll('.pc-port-stage').length,
            classes: ['loop', 'together', 'save', 'append', 'prepend', 'mode-activate', 'mode-result'].every(kind => canvas.svg.querySelector('.pc-wire-' + kind)),
            same: canvas.nodeLayer.contains(card) && card.contains(port) && canvas.svg.contains(wire), chosen: !!card.querySelector('.pc-port-chosen'), token: card.querySelector('.pc-tok').textContent };
    });
    expect(result.types).toBe(true); expect(result.height).toBeGreaterThan(300); expect(result.ports).toBe(19); expect(result.stagePorts).toBe(1);
    expect(result.start[0]).toBeCloseTo(result.expected[0]); expect(result.start[1]).toBeCloseTo(result.expected[1]);
    expect(result.classes).toBe(true); expect(result.same).toBe(true); expect(result.chosen).toBe(true); expect(result.token).toContain('12');
});
test('named output ports wire through real mouse gestures', async ({ page }) => {
    await setup(page);
    const ids = await page.evaluate(async () => {
        const { canvas, S, settle } = window.canvasHarness; const g = canvas.graph;
        const dec = S.addNode(g, 'decider', 40, 40); dec.mode = 'first'; dec.keys = [S.newDeciderKey('Chosen route')];
        const out = S.outputNode(g); out.x = 360; out.y = 330;
        canvas.render(); canvas.fit(); await settle(); return { dec: dec.id, key: dec.keys[0].id, out: out.id };
    });
    const start = await page.locator(`.pc-port[data-node="${ids.dec}"][data-port="${ids.key}"]`).boundingBox();
    const end = await page.locator(`.pc-port-in[data-node="${ids.out}"]`).boundingBox();
    await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2); await page.mouse.down();
    await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 6 }); await page.mouse.up();
    expect(await page.evaluate(ids => Object.values(window.canvasHarness.graph.wires).some(wire => wire.from === ids.dec && wire.to === ids.out && wire.port === ids.key), ids)).toBe(true);
});
test('group shortcut, keyboard fold controls and protected Output keep prompt behavior', async ({ page }) => {
    const ids = await setup(page);
    await page.keyboard.press('Control+a'); await page.keyboard.press('Control+g');
    await expect(page.locator('.pc-node-group')).toHaveCount(1); await expect(page.locator('.pc-node-output')).toHaveCount(1);
    expect(await page.evaluate(() => !!window.canvasHarness.S.outputNode(window.canvasHarness.graph).inGroup)).toBe(false);
    await page.getByRole('button', { name: 'Open group', exact: true }).focus(); await page.keyboard.press('Space');
    await expect(page.locator(`.pc-node[data-id="${ids[0]}"]`)).toBeVisible(); await expect(page.locator('.pc-group-frame')).toHaveCount(1);
    await page.getByRole('button', { name: 'Fold group', exact: true }).focus(); await page.keyboard.press('Enter');
    await expect(page.locator('.pc-node-group')).toHaveCount(1);
    expect(await page.evaluate(() => window.canvasHarness.canvas.spaceDown)).toBe(false);
});
test('copy and paste selected blocks preserve their internal wire and one undo step', async ({ page }) => {
    const ids = await setup(page);
    await page.evaluate(ids => {
        const { canvas, H, graph } = window.canvasHarness; H.flush(graph); canvas.setMulti(ids.slice(0, 2));
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.clipboardProbe = text; } } });
    }, ids);
    await page.keyboard.press('Control+c'); await page.waitForFunction(() => !!window.clipboardProbe);
    const pasted = await page.evaluate(() => {
        const { graph, H } = window.canvasHarness, original = new Set(Object.keys(graph.nodes));
        const data = new DataTransfer(); data.setData('text/plain', window.clipboardProbe);
        document.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, clipboardData: data })); H.flush(graph);
        const copies = Object.values(graph.nodes).filter(node => !original.has(node.id));
        return { nodes: copies.length, internal: Object.values(graph.wires).some(wire => copies.some(node => node.id === wire.from) && copies.some(node => node.id === wire.to)) };
    });
    expect(pasted).toEqual({ nodes: 2, internal: true });
    await page.keyboard.press('Control+z'); expect(await page.evaluate(() => Object.keys(window.canvasHarness.graph.nodes).length)).toBe(4);
});
test('contenteditable keeps typing shortcuts and narrow tools remain usable', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 900 }); await setup(page);
    const inspectorToggle = page.getByRole('button', { name: 'Toggle inspector', exact: true });
    if (await inspectorToggle.getAttribute('aria-pressed') === 'false') await inspectorToggle.click();
    await expect(page.locator('.pc-inspector')).toBeVisible();
    await page.evaluate(() => {
        const editor = document.createElement('div'); editor.contentEditable = 'true'; editor.setAttribute('aria-label', 'Editable probe'); editor.textContent = 'Typing';
        document.querySelector('.pc-inspector').append(editor); editor.focus();
    });
    const editor = page.getByLabel('Editable probe', { exact: true });
    await expect(editor).toBeVisible(); await expect(editor).toBeFocused();
    await page.keyboard.press('Control+a'); await page.keyboard.press('Backspace'); await page.keyboard.press('Space'); await page.keyboard.press('Escape');
    expect(await editor.textContent()).toMatch(/^\s$/);
    expect(await page.evaluate(() => ({ open: window.canvasHarness.UI.isOpen(), nodes: Object.keys(window.canvasHarness.graph.nodes).length, pan: window.canvasHarness.canvas.spaceDown }))).toEqual({ open: true, nodes: 4, pan: false });
    await page.getByRole('button', { name: 'Toggle inspector', exact: true }).click();
    await page.getByRole('button', { name: 'Pan tool', exact: true }).focus(); await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: 'Pan tool', exact: true })).toHaveAttribute('aria-pressed', 'true');
    const area = await page.locator('.pc-canvas-host').boundingBox(), tools = await page.locator('.pc-canvas-controls').boundingBox();
    expect(tools.x + tools.width).toBeLessThanOrEqual(area.x + area.width); expect(tools.y + tools.height).toBeLessThanOrEqual(area.y + area.height);
});
