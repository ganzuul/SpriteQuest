import { test, expect } from '@playwright/test';
test('install and explicitly bind and assign a pre workflow without arming it', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(() => { window.canvasHarness.context.extensionSettings.connectionManager = { profiles: [{ id: 'analysis', name: 'Analysis connection' }] }; });
    await page.getByRole('button', { name: 'Install Scene guidance' }).click();
    await expect(page.getByText('Bind Analysis to an available connection before running.', { exact: true })).toBeVisible();
    const before = await page.evaluate(() => { const settings = window.canvasHarness.S.settings(); return { enabled: settings.enabled, mode: settings.workflowMode, assigned: settings.nativeBindings.preGraphId }; });
    expect(before).toEqual({ enabled: false, mode: 'legacy', assigned: null });
    await page.getByLabel('Analysis connection', { exact: true }).selectOption('analysis');
    await page.getByRole('button', { name: 'Assign pre phase and enable native mode' }).click();
    expect(await page.evaluate(() => window.canvasHarness.S.settings().workflowMode)).toBe('native');
    expect(await page.evaluate(() => window.canvasHarness.S.settings().enabled)).toBe(false);
    await page.getByRole('button', { name: 'Inspect Smart Compactor' }).click();
    await page.getByLabel('Target artifact tokens').fill('900');
    expect(await page.evaluate(() => Object.values(window.canvasHarness.graph.nodes).find(node => node.operation === 'smart-compactor').targetTokens)).toBe(900);
    await expect(page.getByText('Maximum auxiliary requests: 2', { exact: true })).toBeVisible();
});



test('post setup opens the same AI De-slop primitives and preserves a focused editor', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(() => {
        const c = window.canvasHarness.context;
        c.extensionSettings.connectionManager = { profiles: [{ id: 'prose', name: 'Prose connection', api: 'openai', model: 'workflow-test-model', preset: null }] };
        c.CONNECT_API_MAP = { openai: { selected: 'openai', source: 'openai' } };
        c.ConnectionManagerRequestService = { getProfile: id => c.extensionSettings.connectionManager.profiles.find(profile => profile.id === id) };
        c.getWorldInfoPrompt = () => { throw new Error('Native UI must not scan lore'); };
    });
    await page.getByRole('button', { name: 'Install Reviewed AI De-slop' }).click();
    const ids = await page.evaluate(() => Object.keys(window.canvasHarness.graph.nodes));
    await expect(page.locator('.pc-node-group')).toContainText('Surface');
    await page.getByLabel('Prose connection', { exact: true }).selectOption('prose');
    await page.getByRole('button', { name: 'Assign post phase and enable native mode' }).click();
    await expect(page.getByText('Maximum auxiliary requests: 1', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Open AI De-slop formation' }).click();
    expect(await page.evaluate(() => Object.keys(window.canvasHarness.graph.nodes))).toEqual(ids);
    await page.getByRole('button', { name: 'Inspect Pattern Scan' }).click();
    const rules = page.getByLabel('rules', { exact: true });
    await rules.focus(); await page.evaluate(() => { window.workflowEditorProbe = document.activeElement; });
    await rules.fill('tapestry\ndelve');
    expect(await page.evaluate(() => document.activeElement === window.workflowEditorProbe && document.contains(window.workflowEditorProbe))).toBe(true);
    await page.getByRole('button', { name: 'Inspect Repair' }).click();
    await expect(page.getByText('Effective connection: Prose connection · workflow-test-model · provider', { exact: true })).toBeVisible();
    await page.getByLabel('Node model override').fill('node-override-model');
    expect(await page.evaluate(() => Object.values(window.canvasHarness.graph.nodes).find(node => node.operation === 'repair').model)).toBe('node-override-model');
});


test('native preview opens setup without legacy prompt compilation or lore scans', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.getByRole('button', { name: 'Install Scene guidance' }).click();
    await page.evaluate(async () => {
        window.nativeLoreScans = 0;
        window.canvasHarness.context.getWorldInfoPrompt = async () => { window.nativeLoreScans++; return {}; };
        await window.canvasHarness.UI.runPreview();
    });
    expect(await page.evaluate(() => window.nativeLoreScans)).toBe(0);
    await expect(page.locator('.pc-preview')).not.toHaveClass(/pc-preview-open/);
    await expect(page.getByRole('button', { name: 'Test workflow', exact: true })).toBeVisible();
});


test('mode is explicit and can return to legacy without changing arming', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.getByRole('button', { name: 'Install Scene guidance' }).click();
    await page.getByRole('button', { name: 'Assign pre phase and enable native mode' }).click();
    await page.getByLabel('Workflow mode', { exact: true }).selectOption('legacy');
    expect(await page.evaluate(() => window.canvasHarness.S.settings().workflowMode)).toBe('legacy');
    expect(await page.evaluate(() => window.canvasHarness.S.settings().enabled)).toBe(false);
});


test('legacy Input discovery adds a Prompt while preserving its controls', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.locator('.pc-workflow-family').filter({ has: page.locator('summary', { hasText: /^Input$/ }) }).locator('summary').click();
    const add = page.getByRole('button', { name: 'Add legacy Prompt', exact: true });
    await expect(add).toBeVisible();
    await add.click();
    await expect(page.locator('.pc-inspector textarea').first()).toBeVisible();
    expect(await page.evaluate(() => window.canvasHarness.graph.nodes[window.canvasHarness.canvas.selection.id].type)).toBe('prompt');
});


test('native empty-canvas creation offers compatible operations without adding a legacy prompt', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.getByRole('button', { name: 'Install Scene guidance' }).click();
    await page.locator('.pc-canvas-host').dblclick({ position: { x: 8, y: 8 } });
    expect(await page.evaluate(() => Object.values(window.canvasHarness.graph.nodes).some(node => node.type === 'prompt'))).toBe(false);
    await expect(page.locator('.pc-menu').getByText('Scene Context', { exact: true })).toBeVisible();
});


async function reviewFixture(page) {
    await page.route('**/script.js', route => route.fulfill({ contentType: 'text/javascript', body: `
        const context = () => globalThis.SillyTavern.getContext();
        export const isGenerating = () => false;
        export function syncMesToSwipe(index) { const m = context().chat[index]; m.swipe_info[m.swipe_id] = { extra: structuredClone(m.extra || {}) }; return true; }
        export function syncSwipeToMes(index, swipeId) { const m = context().chat[index]; m.swipe_id = swipeId; m.mes = m.swipes[swipeId]; Object.assign(m, structuredClone(m.swipe_info[swipeId])); return true; }
    ` }));
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.evaluate(async () => {
        const c = window.canvasHarness.context;
        c.chatId = 'synthetic-workflow-ui';
        c.chat = [{ mes: 'Hello', is_user: true }, { mes: 'We delve.', is_user: false, swipe_id: 0, swipes: ['We delve.'], swipe_info: [{ extra: { preserved: true } }], extra: { preserved: true }, gen_started: 1, gen_finished: 2 }];
        c.extensionSettings.connectionManager = { profiles: [{ id: 'prose', name: 'Prose connection', api: 'openai', model: 'workflow-test-model', preset: null }] };
        c.CONNECT_API_MAP = { openai: { selected: 'openai', source: 'openai' } };
        window.workflowRequests = [];
        c.ConnectionManagerRequestService = {
            getProfile: id => c.extensionSettings.connectionManager.profiles.find(profile => profile.id === id),
            sendRequest: async (...args) => { window.workflowRequests.push(args); return { choices: [{ message: { content: '{"patches":[{"index":0,"replacement":"explore"}]}' }, finish_reason: 'stop' }], usage: { prompt_tokens: 50, completion_tokens: 10 } }; },
        };
        c.ChatCompletionService = { presetToGeneratePayload: async (_preset, _route, payload) => payload };
        c.setExtensionPrompt = (key, value, position, depth, scan, role) => { c.extensionPrompts[key] = { value, position, depth, scan, role }; };
        c.updateMessageBlock = () => {}; c.swipe = { refresh() {} };
        c.saveChat = async () => { window.workflowSaveAttempts = (window.workflowSaveAttempts || 0) + 1; };
        await (await import('/src/run.js?v=0.18.0')).initializeNativeWorkflowController();
    });
    await page.getByRole('button', { name: 'Install Reviewed AI De-slop' }).click();
    await page.getByLabel('Prose connection', { exact: true }).selectOption('prose');
}
test('a real reviewed run requires Apply and preserves the original swipe', async ({ page }) => {
    await reviewFixture(page);
    await page.getByRole('button', { name: 'Run reviewed repair', exact: true }).click();
    await expect(page.getByText('Actual auxiliary requests: 1 / 1', { exact: true })).toBeVisible();
    await expect(page.getByText('We explore.', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => window.canvasHarness.context.chat.at(-1).mes)).toBe('We delve.');
    await page.getByRole('button', { name: 'Apply reviewed candidate', exact: true }).click();
    await expect(page.getByText('Candidate applied in memory. Save durability is unconfirmed.', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => window.canvasHarness.context.chat.at(-1).swipes)).toEqual(['We delve.', 'We explore.']);
    expect(await page.evaluate(() => window.workflowSaveAttempts)).toBe(1);
    expect(await page.evaluate(() => window.workflowRequests.length)).toBe(1);
});
test('an external reply edit disables Apply and a rejected candidate preserves the original', async ({ page }) => {
    await reviewFixture(page);
    await page.getByRole('button', { name: 'Run reviewed repair', exact: true }).click();
    const apply = page.getByRole('button', { name: 'Apply reviewed candidate', exact: true });
    await expect(apply).toBeEnabled();
    await page.evaluate(async () => { const c = window.canvasHarness.context; c.chat.at(-1).mes = 'External edit.'; await c.eventSource.emit(c.eventTypes.MESSAGE_EDITED, c.chat.length - 1); });
    await expect(apply).toBeDisabled();
    await expect(page.getByText(/candidate is no longer available|chat, reply or swipe changed/)).toBeVisible();
    await page.getByRole('button', { name: 'Reject candidate', exact: true }).click();
    expect(await page.evaluate(() => window.canvasHarness.context.chat.at(-1).mes)).toBe('External edit.');
    expect(await page.evaluate(() => window.workflowSaveAttempts || 0)).toBe(0);
});


test('switching graph or closing cancels a delayed run and ignores its late result', async ({ page }) => {
    await reviewFixture(page);
    await page.evaluate(() => {
        const c = window.canvasHarness.context;
        c.ConnectionManagerRequestService.sendRequest = (...args) => new Promise(resolve => { window.finishWorkflowRequest = resolve; window.workflowSignal = args[3].signal; });
    });
    await page.getByRole('button', { name: 'Run reviewed repair', exact: true }).click();
    await page.waitForFunction(() => !!window.finishWorkflowRequest);
    const legacy = await page.evaluate(() => window.canvasHarness.S.allGraphs().find(graph => graph.schema !== 2).id);
    await page.locator('.pc-graph-select').selectOption(legacy);
    expect(await page.evaluate(() => window.workflowSignal.aborted)).toBe(true);
    await page.evaluate(async () => { window.finishWorkflowRequest({ choices: [{ message: { content: '{"patches":[{"index":0,"replacement":"late"}]}' }, finish_reason: 'stop' }] }); await window.canvasHarness.settle(); });
    await expect(page.getByRole('button', { name: 'Apply reviewed candidate', exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => window.canvasHarness.context.chat.at(-1).mes)).toBe('We delve.');
    await page.getByRole('button', { name: 'Install Reviewed AI De-slop' }).click();
    await page.getByLabel('Prose connection', { exact: true }).selectOption('prose');
    await page.evaluate(() => { window.finishWorkflowRequest = null; });
    await page.getByRole('button', { name: 'Run reviewed repair', exact: true }).click();
    await page.waitForFunction(() => !!window.finishWorkflowRequest);
    await page.getByRole('button', { name: 'Close canvas', exact: true }).click();
    expect(await page.evaluate(() => window.workflowSignal.aborted)).toBe(true);
    await page.evaluate(async () => { window.finishWorkflowRequest({ choices: [{ message: { content: '{"patches":[{"index":0,"replacement":"late"}]}' }, finish_reason: 'stop' }] }); window.canvasHarness.UI.open(); await window.canvasHarness.settle(); });
    await expect(page.getByRole('button', { name: 'Apply reviewed candidate', exact: true })).toHaveCount(0);
});
test('manual pre Test shows guidance without publishing and later Send reruns its request', async ({ page }) => {
    await reviewFixture(page);
    await page.getByRole('button', { name: 'Install Scene guidance' }).click();
    await page.getByLabel('Analysis connection', { exact: true }).selectOption('prose');
    await page.getByRole('button', { name: 'Assign pre phase and enable native mode' }).click();
    await page.evaluate(() => {
        const c = window.canvasHarness.context;
        c.ConnectionManagerRequestService.sendRequest = async (...args) => { window.workflowRequests.push(args); return { choices: [{ message: { content: 'Keep user agency.' }, finish_reason: 'stop' }], usage: { prompt_tokens: 40, completion_tokens: 8 } }; };
    });
    await page.getByRole('button', { name: 'Test workflow', exact: true }).click();
    await expect(page.getByText('Keep user agency.', { exact: true })).toBeVisible();
    await expect(page.getByText('Actual auxiliary requests: 1 / 2', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => Object.keys(window.canvasHarness.context.extensionPrompts).filter(key => key.startsWith('comfytavern:guidance:')).length)).toBe(0);
    await page.getByLabel('Arm', { exact: true }).check();
    await page.evaluate(async () => { const c = window.canvasHarness.context; await window.comfyTavernGenerationInterceptor(c.chat, 8192, () => {}, 'normal'); });
    expect(await page.evaluate(() => window.workflowRequests.length)).toBe(2);
    expect(await page.evaluate(() => Object.values(window.canvasHarness.context.extensionPrompts).some(prompt => prompt.value === 'Keep user agency.'))).toBe(true);
});
test('review controls and comparison stay usable in a narrow viewport', async ({ page }) => {
    await reviewFixture(page);
    await page.setViewportSize({ width: 760, height: 900 });
    await page.getByRole('button', { name: 'Toggle library', exact: true }).click();
    await page.getByRole('button', { name: 'Run reviewed repair', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Apply reviewed candidate', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Reject candidate', exact: true }).click();
    await expect(page.getByText('Candidate rejected. Original reply preserved.', { exact: true })).toBeVisible();
});



test('native wire inspection describes artifact flow without legacy prompt controls', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.getByRole('button', { name: 'Install Scene guidance' }).click();
    await page.evaluate(() => { const h = window.canvasHarness; h.canvas.select({ kind: 'wire', id: Object.keys(h.graph.wires)[0] }); });
    await expect(page.getByText('Artifact wire', { exact: true })).toBeVisible();
    await expect(page.getByText('How it joins', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Cut artifact wire', exact: true })).toBeVisible();
});


test('the native inspector provides a keyboard-accessible duplicate action', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.getByRole('button', { name: 'Install Scene guidance' }).click();
    await page.getByRole('button', { name: 'Inspect Response Plan', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Duplicate operation', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Duplicate operation', exact: true }).focus();
    await page.keyboard.press('Enter');
    expect(await page.evaluate(() => Object.values(window.canvasHarness.graph.nodes).filter(node => node.operation === 'response-plan').length)).toBe(2);
});


test('native camera pan and zoom preserve the focused editor without domain work', async ({ page }) => {
    await reviewFixture(page);
    await page.getByRole('button', { name: 'Run reviewed repair', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Apply reviewed candidate', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Inspect Repair', exact: true }).click();
    await page.getByLabel('instructions', { exact: true }).focus();
    const measured = await page.evaluate(async () => {
        const { context: c, canvas, settle } = window.canvasHarness;
        const controller = (await import('/src/run.js?v=0.18.0')).getNativeWorkflowController();
        const editor = document.activeElement, node = canvas.nodeLayer.querySelector('.pc-node'), requests = window.workflowRequests.length;
        let analysis = 0, bindings = 0, freshness = 0, tokens = 0, lore = 0;
        const prepare = canvas.hooks.prepareRender, getProfile = c.ConnectionManagerRequestService.getProfile, candidateStatus = controller.candidateStatus, count = c.getTokenCountAsync;
        canvas.hooks.prepareRender = (...args) => { analysis++; return prepare(...args); };
        c.ConnectionManagerRequestService.getProfile = (...args) => { bindings++; return getProfile(...args); };
        controller.candidateStatus = (...args) => { freshness++; return candidateStatus(...args); };
        c.getTokenCountAsync = (...args) => { tokens++; return count(...args); };
        c.getWorldInfoPrompt = async () => { lore++; return {}; };
        const rect = canvas.host.getBoundingClientRect(), point = { clientX: rect.left + 150, clientY: rect.top + 150 };
        for (let i = 0; i < 30; i++) canvas.host.dispatchEvent(new WheelEvent('wheel', { ...point, deltaY: -1, cancelable: true }));
        await settle(); await new Promise(resolve => setTimeout(resolve, 200));
        canvas.host.dispatchEvent(new MouseEvent('mousedown', { ...point, button: 1, bubbles: true, cancelable: true }));
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: point.clientX + 30, clientY: point.clientY + 20, buttons: 4 }));
        window.dispatchEvent(new MouseEvent('mouseup', { clientX: point.clientX + 30, clientY: point.clientY + 20, button: 1 }));
        await settle();
        return { analysis, bindings, freshness, tokens, lore, requests: window.workflowRequests.length - requests, sameEditor: editor === document.activeElement && document.contains(editor), sameNode: node === canvas.nodeLayer.querySelector('.pc-node') };
    });
    expect(measured).toEqual({ analysis: 0, bindings: 0, freshness: 0, tokens: 0, lore: 0, requests: 0, sameEditor: true, sameNode: true });
    expect(await page.evaluate(async () => { const controller = (await import('/src/run.js?v=0.18.0')).getNativeWorkflowController(); return controller.candidateStatus(controller.lastResult().artifact).ok; })).toBe(true);
    const title = await page.locator('.pc-node-title').filter({ hasText: /^Reply Snapshot$/ }).boundingBox();
    await page.mouse.move(title.x + 20, title.y + 8); await page.mouse.down();
    await page.mouse.move(title.x + 60, title.y + 28, { steps: 4 }); await page.mouse.up();
    await expect(page.getByRole('button', { name: 'Apply reviewed candidate', exact: true })).toBeEnabled();
    expect(await page.evaluate(async () => { const controller = (await import('/src/run.js?v=0.18.0')).getNativeWorkflowController(); return controller.candidateStatus(controller.lastResult().artifact).ok; })).toBe(true);
    await page.getByRole('button', { name: 'Inspect Repair', exact: true }).click();
    await page.getByLabel('instructions', { exact: true }).fill('A semantic operation edit.');
    await expect(page.getByRole('button', { name: 'Apply reviewed candidate', exact: true })).toHaveCount(0);
});


test('the legacy add-node menu shares the six family discovery order', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.locator('.pc-canvas-host').click({ button: 'right', position: { x: 8, y: 8 } });
    expect(await page.locator('.pc-menu-head').allTextContents()).toEqual(['Input', 'Shaping', 'Surface', 'Transpose', 'Derive', 'Output']);
    await expect(page.locator('.pc-menu').getByText('Add Prompt', { exact: true })).toBeVisible();
});


test('an imported native graph with omitted role records can bind its required role', async ({ page }) => {
    await reviewFixture(page);
    const imported = await page.evaluate(() => {
        const h = window.canvasHarness, envelope = JSON.parse(h.S.exportGraph(h.graph.id));
        delete envelope.graph.roles;
        const result = h.S.importGraph(JSON.stringify(envelope)); h.UI.refreshIfOpen(); return result.graph.id;
    });
    await page.locator('.pc-graph-select').selectOption(imported);
    await page.getByLabel('Prose connection', { exact: true }).selectOption('prose');
    expect(await page.evaluate(() => window.canvasHarness.graph.roles?.Prose?.profileId)).toBe('prose');
});


test('narrow workflow inspection and review remain opaque during selection feedback', async ({ page }) => {
    await reviewFixture(page);
    await page.setViewportSize({ width: 760, height: 1000 });
    for (const theme of ['midnight', 'parchment']) {
        await page.evaluate(async theme => (await import('/src/theme.js?v=0.18.0')).setPreset(theme), theme);
        await page.getByRole('button', { name: 'Inspect Pattern Scan', exact: true }).click();
        const opacity = await page.locator('.pc-inspector').evaluate(inspector => {
            const animations = inspector.getAnimations();
            const canvas = document.createElement('canvas'), context = canvas.getContext('2d');
            canvas.width = canvas.height = 1;
            return [0, 200, 399].map(time => {
                for (const animation of animations) { animation.pause(); animation.currentTime = time; }
                context.clearRect(0, 0, 1, 1);
                context.fillStyle = getComputedStyle(inspector).backgroundColor;
                context.fillRect(0, 0, 1, 1);
                return context.getImageData(0, 0, 1, 1).data[3];
            });
        });
        expect(opacity, theme + ' must hide graph content throughout inspection feedback').toEqual([255, 255, 255]);
        const editor = page.getByLabel('rules', { exact: true });
        await editor.focus(); await page.evaluate(() => { window.narrowWorkflowEditor = document.activeElement; });
        await editor.fill('delve');
        expect(await page.evaluate(() => document.activeElement === window.narrowWorkflowEditor && document.contains(window.narrowWorkflowEditor))).toBe(true);
    }
    await page.getByRole('button', { name: 'Toggle library', exact: true }).click();
    await page.getByRole('button', { name: 'Run reviewed repair', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Apply reviewed candidate', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});


test('narrow toolbar exposes readable labeled pane and theme controls', async ({ page }) => {
    await reviewFixture(page);
    await page.setViewportSize({ width: 760, height: 1000 });
    for (const theme of ['midnight', 'parchment']) {
        await page.evaluate(async theme => (await import('/src/theme.js?v=0.18.0')).setPreset(theme), theme);
        await expect(page.getByRole('button', { name: 'Toggle library', exact: true }).getByText('Library', { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Toggle inspector', exact: true }).getByText('Inspector', { exact: true })).toBeVisible();
        await expect(page.getByTitle('Theme and colours', { exact: true }).getByText('Theme', { exact: true })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    const library = page.getByRole('button', { name: 'Toggle library', exact: true });
    const previous = await library.getAttribute('aria-pressed');
    await library.focus(); await page.keyboard.press('Enter');
    await expect(library).toHaveAttribute('aria-pressed', previous === 'true' ? 'false' : 'true');
});
