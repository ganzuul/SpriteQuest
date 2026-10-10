import { test, expect } from '@playwright/test';

async function setup(page) {
    await page.addInitScript(() => {
        localStorage.removeItem('lattice.workspace.preview');
        localStorage.removeItem('lattice.workspace.panes');
    });
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(async () => {
        const h = window.canvasHarness, theme = await import('/src/theme.js?v=' + h.version);
        await h.reset(); theme.setPreset('lattice'); await h.view({ x: 150, y: 40, zoom: 1 }); await h.settle();
    });
}

test('compact shelf and drawers keep the approved dimensions, bold labels and opaque contents', async ({ page }) => {
    await setup(page);
    const before = await page.evaluate(() => JSON.stringify(window.canvasHarness.graph));
    const shelf = page.locator('.pc-node-shelf');
    const dimensions = await shelf.evaluate(element => {
        const row = element.querySelector('.pc-family-row'), label = row.querySelector('span'), icon = row.querySelector('svg');
        const rect = row.getBoundingClientRect(), next = row.nextElementSibling.getBoundingClientRect(), glyph = icon.getBoundingClientRect();
        const css = getComputedStyle(label);
        return { width: rect.width, height: rect.height, pitch: next.y - rect.y, iconWidth: glyph.width, iconHeight: glyph.height, fontSize: parseFloat(css.fontSize), fontWeight: css.fontWeight, surface: getComputedStyle(row).backgroundColor };
    });
    expect(dimensions.width).toBeCloseTo(102.4, 1);
    expect(dimensions.height).toBeCloseTo(33.6, 1);
    expect(dimensions.pitch).toBeCloseTo(36, 1);
    expect(dimensions.iconWidth).toBeCloseTo(19.2, 1);
    expect(dimensions.iconHeight).toBeCloseTo(19.2, 1);
    expect(dimensions.fontSize).toBeCloseTo(11.2, 1);
    expect(dimensions.fontWeight).toBe('700');
    await page.locator('.pc-family-row[data-family="Input"]').click();
    await page.mouse.move(5, 5);
    const drawer = page.locator('.pc-shelf-menu[aria-label="Input nodes"]');
    await expect(drawer).toBeVisible();
    const paint = await drawer.evaluate(element => {
        const root = element.closest('.pc-root'), probe = document.createElement('div');
        probe.style.backgroundColor = 'color-mix(in srgb, var(--pc-control) 90%, transparent)'; root.append(probe);
        const expectedSurface = getComputedStyle(probe).backgroundColor; probe.remove();
        const row = element.querySelector('[data-shelf-choice]'), label = row.querySelector('.pc-catalog-name'), icon = row.querySelector('svg');
        const alpha = color => {
            const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
            const context = canvas.getContext('2d'); context.fillStyle = color; context.fillRect(0, 0, 1, 1);
            return context.getImageData(0, 0, 1, 1).data[3];
        };
        const contents = [label, icon].map(child => ({ opacity: getComputedStyle(child).opacity, alpha: alpha(getComputedStyle(child).color) }));
        const ancestorOpacity = []; for (let node = label; node && node !== root.parentElement; node = node.parentElement) ancestorOpacity.push(getComputedStyle(node).opacity);
        return { width: element.getBoundingClientRect().width, rowHeight: row.getBoundingClientRect().height,
            iconWidth: icon.getBoundingClientRect().width, fontSize: parseFloat(getComputedStyle(label).fontSize), fontWeight: getComputedStyle(label).fontWeight,
            surface: getComputedStyle(element).backgroundColor, expectedSurface, alpha: alpha(getComputedStyle(element).backgroundColor), contents, ancestorOpacity };
    });
    expect(paint.width).toBeCloseTo(200, 1);
    expect(paint.rowHeight).toBeCloseTo(33.6, 1);
    expect(paint.iconWidth).toBeCloseTo(19.2, 1);
    expect(paint.fontSize).toBeCloseTo(11.2, 1);
    expect(paint.fontWeight).toBe('700');
    expect(paint.surface).toBe(paint.expectedSurface);
    expect(dimensions.surface).toBe(paint.expectedSurface);
    expect(paint.alpha).toBeGreaterThan(0); expect(paint.alpha).toBeLessThan(255);
    expect(paint.contents).toEqual([{ opacity: '1', alpha: 255 }, { opacity: '1', alpha: 255 }]);
    expect(paint.ancestorOpacity.every(opacity => opacity === '1')).toBe(true);
    const pins = await page.locator('.pc-node-native .pc-port').evaluateAll(elements => elements.map(element => { const rect = element.getBoundingClientRect(); return { width: rect.width, height: rect.height }; }));
    expect(pins.length).toBeGreaterThan(0);
    for (const pin of pins) { expect(pin.width).toBeCloseTo(24, 1); expect(pin.height).toBeCloseTo(24, 1); }
    expect(await page.evaluate(() => JSON.stringify(window.canvasHarness.graph))).toBe(before);
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});

for (const width of [360, 736]) test(`compact drawer stays reachable without clipping at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 }); await setup(page);
    await page.locator('.pc-family-row[data-family="Input"]').click();
    const drawer = page.locator('.pc-shelf-menu[aria-label="Input nodes"]'); await expect(drawer).toBeVisible();
    await page.keyboard.press('End');
    const geometry = await drawer.evaluate(element => {
        const rect = element.getBoundingClientRect(), area = element.closest('.pc-canvas-area').getBoundingClientRect();
        const focused = document.activeElement.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, area: { left: area.left, right: area.right, top: area.top, bottom: area.bottom }, focused: { top: focused.top, bottom: focused.bottom }, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth, pageWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth };
    });
    expect(geometry.width).toBeCloseTo(200, 1);
    expect(geometry.left).toBeGreaterThanOrEqual(geometry.area.left - 1);
    expect(geometry.right).toBeLessThanOrEqual(geometry.area.right + 1);
    expect(geometry.top).toBeGreaterThanOrEqual(geometry.area.top - 1);
    expect(geometry.bottom).toBeLessThanOrEqual(geometry.area.bottom + 1);
    expect(geometry.focused.top).toBeGreaterThanOrEqual(geometry.top - 1);
    expect(geometry.focused.bottom).toBeLessThanOrEqual(geometry.bottom + 1);
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);
    expect(geometry.pageWidth).toBeLessThanOrEqual(geometry.viewportWidth);
});
