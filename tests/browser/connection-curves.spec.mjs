import { test, expect } from '@playwright/test';

async function arrangeBackwardWire(page, targetAbove) {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(async targetAbove => {
        const h = window.canvasHarness;
        await h.reset(2, 2);
        Object.assign(h.graph.nodes.n0, { x: 700, y: targetAbove ? 560 : 80, title: 'Source' });
        Object.assign(h.graph.nodes.n1, { x: 260, y: targetAbove ? 80 : 560, title: 'Target' });
        h.S.touchGraph(h.graph);
        h.UI.refreshIfOpen();
        await h.settle();
    }, targetAbove);
    for (const name of ['Toggle inspector']) {
        const toggle = page.getByRole('button', { name, exact: true });
        if (await toggle.getAttribute('aria-pressed') === 'true') await toggle.click();
    }
    const collapse = page.getByRole('button', { name: 'Collapse preview', exact: true });
    if (await collapse.isVisible()) await collapse.click();
    await page.evaluate(() => window.canvasHarness.view({ x: 0, y: 0, zoom: .73 }));
}

async function renderedWire(page) {
    return page.evaluate(() => {
        const { canvas } = window.canvasHarness;
        const path = canvas.svg.querySelector('.pc-wire[data-id="w1"]');
        const hit = canvas.svg.querySelector('.pc-wire-hit[data-id="w1"]');
        const label = canvas.svg.querySelector('.pc-wire-label');
        const length = path.getTotalLength(), matrix = path.getScreenCTM();
        const graphPoint = distance => {
            const p = path.getPointAtLength(distance);
            return { x: p.x, y: p.y };
        };
        const screenPoint = distance => {
            const p = graphPoint(distance), s = new DOMPoint(p.x, p.y).matrixTransform(matrix);
            return { x: s.x, y: s.y };
        };
        const wire = canvas.graph.wires.w1;
        const pin = (node, direction, port) => {
            const card = canvas.nodeLayer.querySelector(`.pc-node-native[data-id="${node}"]`);
            const rect = card.querySelector(`.pc-port[data-dir="${direction}"][data-port="${port}"]`).getBoundingClientRect();
            return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        };
        const labelPoint = { x: Number(label.getAttribute('x')), y: Number(label.getAttribute('y')) };
        const samples = Array.from({ length: 2001 }, (_, index) => graphPoint(length * index / 2000));
        const middleSlopes = Array.from({ length: 61 }, (_, index) => {
            const at = length * (.2 + index / 100);
            const before = graphPoint(at - 4), after = graphPoint(at + 4);
            return Math.abs(after.y - before.y) / Math.hypot(after.x - before.x, after.y - before.y);
        });
        return {
            d: path.getAttribute('d'), hitD: hit.getAttribute('d'),
            start: screenPoint(0), departure: screenPoint(5), arrival: screenPoint(length - 5), end: screenPoint(length),
            graphStart: graphPoint(0), graphEnd: graphPoint(length),
            verticalDeviation: Math.max(...samples.map(p => Math.abs(p.y - graphPoint(0).y))),
            output: pin(wire.from, 'out', wire.fromPort), input: pin(wire.to, 'in', wire.toPort),
            middleVerticalFraction: Math.min(...middleSlopes),
            labelDistance: Math.min(...samples.map(p => Math.hypot(p.x - labelPoint.x, p.y - labelPoint.y))),
        };
    });
}

test('native level backward wires keep a compact return at different horizontal separations', async ({ page }, testInfo) => {
    await arrangeBackwardWire(page, false);
    let previousGap = 0;
    for (const separation of [300, 520, 820]) {
        await page.evaluate(async separation => {
            const h = window.canvasHarness;
            Object.assign(h.graph.nodes.n0, { x: 320 + separation, y: 250 });
            Object.assign(h.graph.nodes.n1, { x: 320, y: 250 });
            h.S.touchGraph(h.graph);
            h.UI.refreshIfOpen();
            await h.settle();
            const wire = h.canvas.graph.wires.w1;
            const pinY = (node, direction, port) => {
                const card = h.canvas.nodeLayer.querySelector(`.pc-node-native[data-id="${node}"]`);
                const rect = card.querySelector(`.pc-port[data-dir="${direction}"][data-port="${port}"]`).getBoundingClientRect();
                return rect.y + rect.height / 2;
            };
            h.graph.nodes.n1.y += (pinY(wire.from, 'out', wire.fromPort) - pinY(wire.to, 'in', wire.toPort)) / h.canvas.view.zoom;
            h.S.touchGraph(h.graph);
            h.UI.refreshIfOpen();
            await h.settle();
        }, separation);
        await page.evaluate(() => window.canvasHarness.view({ x: 0, y: 0, zoom: .73 }));
        const wire = await renderedWire(page);
        const gap = wire.graphStart.x - wire.graphEnd.x;
        expect(gap, 'each layout increases the backward pin separation').toBeGreaterThan(previousGap + 150);
        previousGap = gap;
        expect(Math.abs(wire.graphStart.y - wire.graphEnd.y), 'both pins are level in graph space').toBeLessThan(1);
        expect(Math.hypot(wire.start.x - wire.output.x, wire.start.y - wire.output.y), 'wire begins at the visible output pin').toBeLessThanOrEqual(1);
        expect(Math.hypot(wire.end.x - wire.input.x, wire.end.y - wire.input.y), 'wire ends at the visible input pin').toBeLessThanOrEqual(1);
        expect(wire.departure.x).toBeGreaterThan(wire.start.x);
        expect(Math.abs(wire.departure.y - wire.start.y), 'output lead remains horizontal').toBeLessThan(1);
        expect(wire.end.x).toBeGreaterThan(wire.arrival.x);
        expect(Math.abs(wire.end.y - wire.arrival.y), 'input lead remains horizontal').toBeLessThan(1);
        expect(wire.verticalDeviation, `level return at a ${Math.round(gap)}px pin separation stays shallow`).toBeLessThanOrEqual(36);
        expect(wire.hitD, 'hit target follows the visible cable').toBe(wire.d);
        expect(wire.labelDistance, 'wire kind label is anchored on the visible curve').toBeLessThan(1);
        await page.evaluate(() => window.canvasHarness.view({ x: 75, y: 60, zoom: .95 }));
        const clip = await page.evaluate(() => {
            const { canvas } = window.canvasHarness;
            const elements = [canvas.svg.querySelector('.pc-wire[data-id="w1"]'), ...canvas.nodeLayer.querySelectorAll('.pc-node-native')];
            const bounds = elements.map(element => element.getBoundingClientRect());
            const x = Math.max(0, Math.floor(Math.min(...bounds.map(rect => rect.left))) - 24);
            const y = Math.max(0, Math.floor(Math.min(...bounds.map(rect => rect.top))) - 24);
            const right = Math.min(innerWidth, Math.ceil(Math.max(...bounds.map(rect => rect.right))) + 24);
            const bottom = Math.min(innerHeight, Math.ceil(Math.max(...bounds.map(rect => rect.bottom))) + 24);
            return { x, y, width: right - x, height: bottom - y };
        });
        await page.screenshot({ path: testInfo.outputPath(`level-backward-${Math.round(gap)}.png`), clip });
        await page.evaluate(() => window.canvasHarness.view({ x: 85, y: 35, zoom: 1.1 }));
        const zoomed = await renderedWire(page);
        expect(zoomed.d, 'zoom preserves the graph-space cable route').toBe(wire.d);
        expect(zoomed.hitD).toBe(zoomed.d);
        expect(zoomed.labelDistance).toBeLessThan(1);
        expect(zoomed.verticalDeviation).toBeCloseTo(wire.verticalDeviation, 3);
    }
});

for (const targetAbove of [true, false]) {
    const direction = targetAbove ? 'above' : 'below';
    test(`native backward wire to a target far ${direction} stays curved through its middle`, async ({ page }, testInfo) => {
        await arrangeBackwardWire(page, targetAbove);
        const wire = await renderedWire(page);
        expect(wire.input.x).toBeLessThan(wire.output.x);
        expect(Math.abs(wire.input.y - wire.output.y)).toBeGreaterThan(300);
        expect(Math.hypot(wire.start.x - wire.output.x, wire.start.y - wire.output.y), 'wire begins at the visible output pin').toBeLessThanOrEqual(1);
        expect(Math.hypot(wire.end.x - wire.input.x, wire.end.y - wire.input.y), 'wire ends at the visible input pin').toBeLessThanOrEqual(1);
        expect(wire.departure.x).toBeGreaterThan(wire.start.x);
        expect(Math.abs(wire.departure.y - wire.start.y), 'output lead remains horizontal').toBeLessThan(1);
        expect(wire.end.x).toBeGreaterThan(wire.arrival.x);
        expect(Math.abs(wire.end.y - wire.arrival.y), 'input lead remains horizontal').toBeLessThan(1);
        // A steep returning cable should keep changing height through its middle;
        // a horizontal join creates the visible shelf reported for this layout.
        expect(wire.middleVerticalFraction, 'the middle does not flatten into a shelf').toBeGreaterThan(.2);
        expect(wire.hitD, 'hit target follows the visible cable').toBe(wire.d);
        expect(wire.labelDistance, 'wire kind label is anchored on the visible curve').toBeLessThan(1);
        await page.locator('.pc-canvas').screenshot({ path: testInfo.outputPath(`backward-${direction}.png`) });
        await page.evaluate(() => window.canvasHarness.view({ x: 85, y: 35, zoom: 1.1 }));
        const zoomed = await renderedWire(page);
        expect(zoomed.d, 'zoom preserves the graph-space cable route').toBe(wire.d);
        expect(zoomed.hitD).toBe(zoomed.d);
        expect(zoomed.labelDistance).toBeLessThan(1);
    });
}
