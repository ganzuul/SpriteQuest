import { test, expect } from '@playwright/test';

async function openNativeWorkspace(page, starter = 'structured-guidance') {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    const graphId = await page.evaluate(async starter => {
        const h = window.canvasHarness;
        const version = (await (await fetch('/manifest.json')).json()).version;
        const { starterGraph } = await import('/src/workflow/starters.js?v=' + version);
        const graph = starterGraph(starter);
        h.S.settings().graphs[graph.id] = graph;
        h.S.save(); h.UI.refreshIfOpen();
        return graph.id;
    }, starter);
    await page.getByRole('combobox', { name: 'Canvas', exact: true }).selectOption(graphId);
    await page.evaluate(() => window.canvasHarness.settle());
}

for (const width of [1024, 736, 360, 320]) test(`approved Lattice native surfaces and panel placement at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openNativeWorkspace(page);
    const graph = page.locator('.pc-canvas-area');
    const preview = page.locator('.pc-preview-pane');
    const inspector = page.locator('.pc-inspector');
    await expect(inspector).toBeVisible();
    const actual = await page.evaluate(() => {
        const read = selector => {
            const element = document.querySelector(selector), css = getComputedStyle(element), box = element.getBoundingClientRect();
            return { x: box.x, y: box.y, width: box.width, height: box.height, background: css.backgroundColor,
                radius: css.borderTopRightRadius, shadow: css.boxShadow, border: css.borderTopColor };
        };
        return { graph: read('.pc-canvas-area'), preview: read('.pc-preview-pane'), details: read('.pc-inspector'),
            node: read('.pc-node-native'), brand: document.querySelector('.pc-brand').textContent.trim(),
            font: document.fonts.check('600 20px "Bricolage Grotesque"'),
            accent: getComputedStyle(document.querySelector('.pc-graph-tab[aria-selected="true"]')).color,
            overflow: document.documentElement.scrollWidth > innerWidth };
    });
    expect(actual.brand).toBe('LATTICE');
    expect(actual.font).toBe(true);
    expect(actual.overflow).toBe(false);
    expect(actual.graph.radius).toBe('4px');
    expect(actual.graph.shadow).toContain('inset');
    expect(actual.graph.border).toBe(actual.accent);
    expect(actual.preview.background).toBe('rgb(32, 33, 32)');
    expect(actual.node.background).toBe('rgb(29, 30, 29)');
    expect(actual.graph.height).toBeGreaterThan(140);
    if (width > 760) {
        expect(actual.details.x).toBeGreaterThanOrEqual(actual.graph.x + actual.graph.width);
        expect(actual.details.width).toBeCloseTo(258, 0);
    } else {
        expect(actual.details.y).toBeGreaterThanOrEqual(actual.graph.y + actual.graph.height);
        expect(actual.details.width).toBeGreaterThan(width - 30);
    }
    expect((await preview.boundingBox()).y).toBeLessThan((await graph.boundingBox()).y);
});

test('approved floating shelf retains aligned purpose drawers and quiet shortcodes', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    await openNativeWorkspace(page, 'literal-cleanup');
    const family = page.locator('[data-family="Derive"]');
    await family.hover();
    const category = page.getByRole('menuitem', { name: 'ANALYSIS', exact: true });
    await category.hover();
    const leaf = page.locator('.pc-leaf-menu');
    await expect(leaf).toBeVisible();
    const [button, drawer, submenu] = await Promise.all([family.boundingBox(), page.locator('.pc-family-menu').boundingBox(), leaf.boundingBox()]);
    expect(button.width).toBe(110); expect(button.height).toBe(43);
    expect(drawer.width).toBe(155); expect(submenu.width).toBe(250);
    expect(drawer.x - button.x - button.width).toBeCloseTo(3, 0);
    expect(drawer.y).toBeCloseTo(button.y, 0);
    expect(submenu.x - drawer.x - drawer.width).toBeCloseTo(3, 0);
    const codes = await leaf.locator('small').allTextContents();
    expect(codes.some(code => code.trim().length > 0)).toBe(true);
});

test('a selected failed native node keeps its red ring and dimmed interior', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    await openNativeWorkspace(page);
    await page.evaluate(() => {
        const h = window.canvasHarness;
        h.graph.nodes['compose-json'].sections[0].text = '{broken';
        h.S.save(); h.UI.refreshIfOpen();
    });
    await page.evaluate(() => window.canvasHarness.settle());
    const failed = page.locator('.pc-node-native[data-id="json-decode"]');
    const before = await failed.boundingBox();
    await page.locator('.pc-root-run').click();
    await expect(failed).toHaveClass(/pc-trace-failed/);
    await expect(page.locator('.pc-node-native.pc-trace-blocked').first()).toBeVisible();
    await failed.locator('.pc-native-heading').click();
    await expect(failed).toHaveClass(/pc-selected/);
    const paint = await failed.evaluate(node => ({
        border: getComputedStyle(node).borderTopColor,
        ring: getComputedStyle(node).boxShadow,
        opacity: Number(getComputedStyle(node.querySelector('.pc-native-heading')).opacity),
        filter: getComputedStyle(node.querySelector('.pc-native-heading')).filter,
    }));
    expect(paint.border).toBe('rgb(224, 143, 143)');
    expect(paint.ring).toContain('rgb(224, 143, 143)');
    expect(paint.opacity).toBeLessThan(1);
    expect(paint.filter).toContain('grayscale');
    const after = await failed.boundingBox();
    expect(after.width).toBe(before.width); expect(after.height).toBe(before.height);
});
