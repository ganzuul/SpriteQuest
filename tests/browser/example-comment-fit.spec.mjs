import { test, expect } from '@playwright/test';

test('every lesson comment displays its complete instructions inside the saved rectangle', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    const failures = await page.evaluate(async () => {
        const h = window.canvasHarness;
        const { REMASTERED_WORKFLOW_EXAMPLE_DATA: lessons } = await import('/src/workflow/remastered-example-data.js?v=' + h.version);
        const failures = [];
        if (lessons.length !== 30) failures.push({ error: 'Expected all thirty lessons', count: lessons.length });
        for (const lesson of lessons) {
            await h.activate(structuredClone(lesson.packages[0].graph));
            await document.fonts.ready;
            await h.settle();
            const note = h.graph.nodes['lesson-note'];
            const notes = document.querySelector('.pc-comment-frame[data-id="lesson-note"] .pc-comment-notes');
            if (!notes) {
                failures.push({ lesson: lesson.number, error: 'Lesson comment is missing' });
                continue;
            }
            if (notes.textContent !== note.content || notes.scrollHeight > notes.clientHeight || notes.scrollWidth > notes.clientWidth) {
                failures.push({ lesson: lesson.number, completeText: notes.textContent === note.content,
                    contentHeight: notes.scrollHeight, availableHeight: notes.clientHeight,
                    contentWidth: notes.scrollWidth, availableWidth: notes.clientWidth });
            }
        }
        return failures;
    });
    expect(failures).toEqual([]);
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});

test('lesson comment sizing fits paragraphs, blank lines and long tokens at different widths', async ({ page }) => {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    const results = await page.evaluate(async () => {
        const h = window.canvasHarness;
        const { lessonCommentSize } = await import('/tools/remastered/comment-layout.mjs');
        await h.reset();
        const graph = structuredClone(h.graph);
        const content = [
            'Follow the reply through the graph. Inspect each checkpoint before accepting the result. '.repeat(8),
            '', '',
            'W'.repeat(180),
            'https://example.com/one-very-long-unbroken-checkpoint-identifier/'.repeat(6),
            '\tIndented instructions preserve their spacing.\n中文说明 😀 αβγδ — final paragraph.',
        ].join('\n');
        const results = [];
        for (const width of [180, 360, 900]) {
            const size = lessonCommentSize(content, width);
            graph.nodes['sizing-probe'] = { id: 'sizing-probe', type: 'note', commentFrame: true, moveContents: false,
                title: 'Sizing probe', content, x: 100, y: 0, ...size };
            await h.activate(structuredClone(graph));
            await document.fonts.ready;
            await h.settle();
            const notes = document.querySelector('.pc-comment-frame[data-id="sizing-probe"] .pc-comment-notes');
            results.push({ width: size.w, height: size.h, completeText: notes.textContent === content,
                verticalOverflow: notes.scrollHeight - notes.clientHeight,
                horizontalOverflow: notes.scrollWidth - notes.clientWidth });
        }
        return results;
    });
    for (const result of results) {
        expect(result.completeText, JSON.stringify(result)).toBe(true);
        expect(result.verticalOverflow, JSON.stringify(result)).toBeLessThanOrEqual(0);
        expect(result.horizontalOverflow, JSON.stringify(result)).toBeLessThanOrEqual(0);
    }
    expect(results[0].height).toBeGreaterThan(results[1].height);
    expect(results[1].height).toBeGreaterThan(results[2].height);
    expect(await page.evaluate(() => window.canvasHarness.providerCalls())).toBe(0);
});
