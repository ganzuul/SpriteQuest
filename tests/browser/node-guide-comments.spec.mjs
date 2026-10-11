import { test, expect } from '@playwright/test';

for (const width of [1440, 390]) for (const key of ['comment', 'note']) {
    test(`${key} guide initially fits its complete readable example at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto('/tests/browser/harness.html');
        await page.waitForFunction(() => !!window.canvasHarness);
        await page.evaluate(async key => {
            const h = window.canvasHarness;
            const { getNodeGuideExample } = await import('/src/workflow/node-guide-examples.js?v=' + h.version);
            const example = getNodeGuideExample(key);
            const node = Object.values(example.graph.nodes).find(node => key === 'comment' ? node.commentFrame : node.type === 'note' && !node.commentFrame);
            await h.activate(example.graph); h.canvas.select({ kind: 'node', id: node.id }); await h.settle();
        }, key);
        const before = await page.evaluate(() => JSON.stringify(window.canvasHarness.graph));
        await page.locator('.pc-workspace-details button[title^="Help with"]').click();
        const guide = page.locator('.pc-node-guide-dialog');
        await expect.poll(() => guide.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
        await guide.locator('details[data-guide-example] > summary').click();
        const canvas = guide.locator('.pc-canvas-host');
        await expect(canvas.locator('.pc-wire-native')).toHaveCount(2);
        await page.evaluate(async () => { await document.fonts.ready; await window.canvasHarness.settle(); });
        await canvas.scrollIntoViewIfNeeded();
        await expect.poll(() => canvas.evaluate(host => {
            const box = host.getBoundingClientRect(), dialog = host.closest('.pc-node-guide-dialog').getBoundingClientRect();
            const left = Math.max(0, box.left, dialog.left), right = Math.min(innerWidth, box.right, dialog.right);
            const top = Math.max(0, box.top, dialog.top), bottom = Math.min(innerHeight, box.bottom, dialog.bottom);
            const fits = element => { const b = element.getBoundingClientRect(); return b.left >= left - .5 && b.right <= right + .5 && b.top >= top - .5 && b.bottom <= bottom + .5; };
            return [...host.querySelectorAll('.pc-node-native, .pc-comment-frame, .pc-wire-native')].every(fits);
        })).toBe(true);
        const scale = await canvas.evaluate(host => new DOMMatrix(getComputedStyle(host.querySelector('.pc-viewport')).transform).a);
        const labels = await canvas.locator('.pc-native-pin-label').evaluateAll(elements => elements.map(el => parseFloat(getComputedStyle(el).fontSize)));
        expect(Math.min(...labels) * scale).toBeGreaterThanOrEqual(11);
        await expect.poll(() => guide.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
        if (key === 'comment') {
            const spacing = await canvas.evaluate(host => {
                const notes = host.querySelector('.pc-comment-notes').getBoundingClientRect();
                return [...host.querySelectorAll('.pc-node-native')].every(card => card.getBoundingClientRect().top > notes.bottom);
            });
            expect(spacing).toBe(true);
        }
        expect(await page.evaluate(() => JSON.stringify(window.canvasHarness.graph))).toBe(before);
        expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
    });
}
