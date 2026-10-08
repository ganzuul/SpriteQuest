import { test, expect } from '@playwright/test';
test('editing imported structured scan rules preserves findings and metadata and rejects invalid drafts', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.getByRole('button', { name: 'Toggle library', exact: true }).click();
    await page.getByRole('button', { name: 'Install Reviewed AI De-slop' }).click();
    await page.evaluate(() => {
        const node = Object.values(window.canvasHarness.graph.nodes).find(node => node.operation === 'pattern-scan');
        node.rules = [{ phrase: 'delve', note: 'Keep this preference', details: { category: 'wording' } }, 'weave'];
        node.caseSensitive = true; node.exemptions = ['delve safely']; node.protectedLiterals = ['weave'];
        window.canvasHarness.S.touchGraph(window.canvasHarness.graph); window.canvasHarness.UI.refreshIfOpen();
    });
    await page.getByRole('button', { name: 'Inspect Pattern Scan' }).click();
    const editor = page.getByLabel('rules', { exact: true });
    const initial = await editor.inputValue();
    await editor.focus(); await page.evaluate(() => { window.ruleEditorElement = document.activeElement; });
    await editor.fill(initial + '\ntapestry');
    const read = () => page.evaluate(async () => {
        const node = Object.values(window.canvasHarness.graph.nodes).find(node => node.operation === 'pattern-scan');
        const { scanDraft } = await import('/src/workflow/repair.js');
        const text = 'Delve, delve, delve safely, weave, tapestry.';
        return { node, scan: scanDraft({ kind: 'draft', text, source: { originalText: text } }, node) };
    });
    let state = await read();
    expect(state.node.rules).toEqual([{ phrase: 'delve', note: 'Keep this preference', details: { category: 'wording' } }, 'weave', 'tapestry']);
    expect(state.scan.artifact.findings.map(f => [f.text, f.protected])).toEqual([['delve', false], ['weave', true], ['tapestry', false]]);
    expect(state.scan.artifact.caseSensitive).toBe(true);
    expect(state.scan.artifact.exemptions).toEqual(['delve safely']);
    await editor.fill((await editor.inputValue()).replace('"phrase":"delve"', '"phrase":"Delve"'));
    state = await read();
    expect(state.node.rules[0]).toEqual({ phrase: 'Delve', note: 'Keep this preference', details: { category: 'wording' } });
    expect(state.scan.artifact.findings.map(f => f.text)).toEqual(['Delve', 'weave', 'tapestry']);
    const saved = state.node.rules;
    await editor.fill('{"phrase":');
    await expect(editor).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('alert')).toContainText('not saved');
    expect((await read()).node.rules).toEqual(saved);
    await page.getByLabel('case Sensitive', { exact: true }).uncheck();
    await expect(editor).toHaveValue('{"phrase":');
    expect((await read()).node.rules).toEqual(saved);
    await editor.fill('ordinary phrase\n{"phrase":"delve","note":"retained"}');
    await expect(editor).toHaveAttribute('aria-invalid', 'false');
    expect((await read()).node.rules).toEqual(['ordinary phrase', { phrase: 'delve', note: 'retained' }]);
    expect(await page.evaluate(() => document.contains(window.ruleEditorElement))).toBe(true);
});

test('formation request summary follows scan mode and additional reachable repair members', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.getByRole('button', { name: 'Toggle library', exact: true }).click();
    await page.getByRole('button', { name: 'Install Reviewed AI De-slop' }).click();
    await page.getByRole('button', { name: 'Inspect Repair' }).click();
    await page.getByLabel(/^mode/).selectOption('scan');
    await expect(page.getByRole('button', { name: /Open AI De-slop formation/ })).toContainText('maximum 0 requests');
    await expect(page.getByText('Maximum auxiliary requests: 0', { exact: true })).toBeVisible();
    await expect(page.locator('.pc-node-group')).toContainText('maximum 0 auxiliary requests');
    await page.getByLabel(/^mode/).selectOption('repair');
    await page.evaluate(() => {
        const { graph, S, UI } = window.canvasHarness;
        const group = Object.values(graph.groups)[0];
        const byOp = op => Object.values(graph.nodes).find(n => n.operation === op);
        for (const op of ['repair', 'validate-patches', 'apply-reply']) {
            const node = structuredClone(byOp(op)); node.id = op + '-extra'; node.inGroup = group.id;
            graph.nodes[node.id] = node; group.members.push(node.id);
        }
        for (const [i, [from, to]] of [[byOp('reply-snapshot').id, 'repair-extra'], ['repair-extra', 'validate-patches-extra'], ['validate-patches-extra', 'apply-reply-extra']].entries()) {
            const id = 'extra-wire-' + i; graph.wires[id] = { id, from, to, order: i };
        }
        S.touchGraph(graph); window.canvasHarness.canvas.render(); UI.refreshIfOpen();
    });
    await expect(page.getByRole('button', { name: /Open AI De-slop formation/ })).toContainText('maximum 2 requests');
    await expect(page.getByText('Maximum auxiliary requests: 2', { exact: true })).toBeVisible();
    await expect(page.locator('.pc-node-group')).toContainText('maximum 2 auxiliary requests');
});

test('install and explicitly bind and assign a pre workflow without arming it', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.getByRole('button', { name: 'Toggle library', exact: true }).click();
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
    await page.getByRole('button', { name: 'Toggle library', exact: true }).click();
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
    await page.getByRole('button', { name: 'Toggle library', exact: true }).click();
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
    await page.getByRole('button', { name: 'Toggle library', exact: true }).click();
    await page.getByRole('button', { name: 'Install Scene guidance' }).click();
    await page.getByRole('button', { name: 'Assign pre phase and enable native mode' }).click();
    await page.getByLabel('Workflow mode', { exact: true }).selectOption('legacy');
    expect(await page.evaluate(() => window.canvasHarness.S.settings().workflowMode)).toBe('legacy');
    expect(await page.evaluate(() => window.canvasHarness.S.settings().enabled)).toBe(false);
});


test('legacy Input discovery adds a Prompt while preserving its controls', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.getByRole('button', { name: 'Toggle library', exact: true }).click();
    await page.locator('.pc-workflow-family').filter({ has: page.locator('summary', { hasText: /^Input$/ }) }).locator('summary').click();
    const add = page.getByRole('button', { name: 'Add legacy Prompt', exact: true });
    await expect(add).toBeVisible();
    await add.click();
    await expect(page.locator('.pc-inspector textarea').first()).toBeVisible();
    expect(await page.evaluate(() => window.canvasHarness.graph.nodes[window.canvasHarness.canvas.selection.id].type)).toBe('prompt');
});


test('native empty-canvas creation offers compatible operations without adding a legacy prompt', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.getByRole('button', { name: 'Toggle library', exact: true }).click();
    await page.getByRole('button', { name: 'Install Scene guidance' }).click();
    await page.getByRole('button', { name: 'Toggle library', exact: true }).click();
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
    await page.getByRole('button', { name: 'Toggle library', exact: true }).click();
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
        await (await import('/src/run.js?v=0.19.1')).initializeNativeWorkflowController();
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
test('manual pre Test and actual Send show their distinct guidance and request evidence', async ({ page }) => {
    await reviewFixture(page);
    await page.getByRole('button', { name: 'Install Scene guidance' }).click();
    await page.getByLabel('Analysis connection', { exact: true }).selectOption('prose');
    await page.getByRole('button', { name: 'Assign pre phase and enable native mode' }).click();
    await page.evaluate(() => {
        const c = window.canvasHarness.context;
        c.ConnectionManagerRequestService.sendRequest = async (...args) => { window.workflowRequests.push(args); return { choices: [{ message: { content: window.workflowRequests.length === 1 ? 'Manual test guidance.' : 'Actual Send guidance.' }, finish_reason: 'stop' }], usage: { prompt_tokens: 40, completion_tokens: window.workflowRequests.length === 1 ? 8 : 17 } }; };
    });
    await page.getByRole('button', { name: 'Test workflow', exact: true }).click();
    await expect(page.getByText('Manual test guidance.', { exact: true })).toBeVisible();
    await expect(page.getByText('Actual auxiliary requests: 1 / 2', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => Object.keys(window.canvasHarness.context.extensionPrompts).filter(key => key.startsWith('lattice:guidance:')).length)).toBe(0);
    await page.getByLabel('Arm', { exact: true }).check();
    await page.evaluate(async () => { const c = window.canvasHarness.context; await window.latticeGenerationInterceptor(c.chat, 8192, () => {}, 'normal'); });
    expect(await page.evaluate(() => window.workflowRequests.length)).toBe(2);
    expect(await page.evaluate(() => Object.values(window.canvasHarness.context.extensionPrompts).some(prompt => prompt.value === 'Actual Send guidance.'))).toBe(true);
    await expect(page.getByText('Actual Send guidance.', { exact: true })).toBeVisible();
    await expect(page.getByText('Manual test guidance.', { exact: true })).toHaveCount(0);
    await expect(page.locator('.pc-workflows [role="status"]')).toContainText('Automatic Send');
    await page.getByText('Reports and request trace', { exact: true }).click();
    const trace = page.locator('details').filter({ has: page.getByText('Reports and request trace', { exact: true }) });
    await expect(trace).toContainText('Actual Send guidance.');
    expect(JSON.parse(await trace.locator('pre').textContent()).calls[0].result.usage.completion_tokens).toBe(17);
    await expect(trace).toContainText('host-tokenizer');
    await page.evaluate(async () => {
        const c = window.canvasHarness.context;
        await c.eventSource.emit(c.eventTypes.GENERATION_ENDED, c.chat.length);
        await c.eventSource.emit(c.eventTypes.GENERATION_STARTED, 'normal', {}, false);
        c.ConnectionManagerRequestService.sendRequest = async (...args) => { window.workflowRequests.push(args); throw new Error('Synthetic Send failure'); };
        await window.latticeGenerationInterceptor(c.chat, 8192, () => {}, 'normal');
    });
    await expect(trace).toContainText('REQUEST_FAILED');
    await expect(trace).not.toContainText('Actual Send guidance.');
    await expect(trace).toContainText('NATIVE_FALLBACK');
    await expect(page.getByText('Actual auxiliary requests: 1 / 2', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => window.workflowRequests.length)).toBe(3);
});

test('automatic Send evidence stays with its original graph through post review, close, and reopen', async ({ page }) => {
    await reviewFixture(page);
    const preId = await page.evaluate(async () => {
        const h = window.canvasHarness, s = h.S.settings();
        const pre = (await import('/src/workflow/starters.js?v=0.19.1')).installStarter('native-guidance', s);
        pre.roles.Analysis.profileId = 'prose';
        s.nativeBindings.preGraphId = pre.id; s.workflowMode = 'native'; s.enabled = true;
        h.S.save(); h.UI.refreshIfOpen(); return pre.id;
    });
    await page.getByRole('button', { name: 'Run reviewed repair', exact: true }).click();
    await expect(page.getByText('We explore.', { exact: true })).toBeVisible();
    await page.evaluate(async () => {
        const c = window.canvasHarness.context;
        c.ConnectionManagerRequestService.sendRequest = async (...args) => { window.workflowRequests.push(args); return { choices: [{ message: { content: 'First automatic guidance.' }, finish_reason: 'stop' }] }; };
        await window.latticeGenerationInterceptor(c.chat, 8192, () => {}, 'normal');
    });
    await expect(page.getByText('We explore.', { exact: true })).toBeVisible();
    await expect(page.getByText('First automatic guidance.', { exact: true })).toHaveCount(0);
    await page.locator('.pc-graph-select').selectOption(preId);
    await expect(page.getByText('First automatic guidance.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Close canvas', exact: true }).click();
    await page.evaluate(async () => {
        const c = window.canvasHarness.context;
        c.ConnectionManagerRequestService.sendRequest = async (...args) => { window.workflowRequests.push(args); return { choices: [{ message: { content: 'Send while closed.' }, finish_reason: 'stop' }] }; };
        await window.latticeGenerationInterceptor(c.chat, 8192, () => {}, 'normal');
        await window.canvasHarness.settle();
    });
    await expect(page.locator('.pc-root')).not.toHaveClass(/pc-open/);
    expect((await page.locator('.pc-workflows').allTextContents()).join('')).not.toContain('Send while closed.');
    await page.evaluate(async () => { window.canvasHarness.UI.open(); await window.canvasHarness.settle(); });
    await expect(page.getByText('Send while closed.', { exact: true })).toBeVisible();
    await expect(page.getByText('First automatic guidance.', { exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => window.workflowRequests.length)).toBe(3);
});

test('native graphs reject legacy prompt seeding before confirmation while legacy seeding works', async ({ page }) => {
    await reviewFixture(page);
    await page.evaluate(() => {
        const c = window.canvasHarness.context;
        c.chatCompletionSettings.prompts = [{ identifier: 'fixture-prompt', name: 'Fixture prompt', content: 'Seeded content', role: 'system' }];
        c.chatCompletionSettings.prompt_order = [{ character_id: 100000, order: [{ identifier: 'fixture-prompt', enabled: true }] }];
        c.POPUP_TYPE = { CONFIRM: 1 }; c.POPUP_RESULT = { AFFIRMATIVE: 1 };
        c.callGenericPopup = async () => { window.seedConfirmations = (window.seedConfirmations || 0) + 1; return 1; };
        window.beforeNativeSeed = JSON.stringify(window.canvasHarness.graph);
    });
    await page.getByRole('button', { name: 'Graph', exact: true }).click();
    const seed = page.getByRole('menuitem', { name: 'Seed from SillyTavern’s current prompt order', exact: true });
    await expect(seed).toBeDisabled();
    // A stale/programmatic toolbar activation must still hit the controller guard.
    await seed.evaluate(button => { button.disabled = false; button.click(); });
    await page.evaluate(() => window.canvasHarness.settle());
    expect(await page.evaluate(() => window.seedConfirmations || 0)).toBe(0);
    expect(await page.evaluate(() => JSON.stringify(window.canvasHarness.graph) === window.beforeNativeSeed)).toBe(true);
    expect(await page.evaluate(async () => (await import('/src/workflow/contracts.js?v=0.19.1')).validateWorkflow(window.canvasHarness.graph).ok)).toBe(true);
    const legacy = await page.evaluate(() => window.canvasHarness.S.allGraphs().find(graph => graph.schema !== 2).id);
    await page.locator('.pc-graph-select').selectOption(legacy);
    await page.getByRole('button', { name: 'Graph', exact: true }).click();
    await expect(seed).toBeEnabled(); await seed.click();
    await expect.poll(() => page.evaluate(() => window.seedConfirmations || 0)).toBe(1);
    expect(await page.evaluate(() => Object.values(window.canvasHarness.graph.nodes).some(node => node.identifier === 'fixture-prompt'))).toBe(true);
});

test('Send indicator and arm messages follow native pre assignment, manual post-only, and legacy modes', async ({ page }) => {
    await reviewFixture(page);
    await page.getByRole('button', { name: 'Install Scene guidance' }).click();
    const names = await page.evaluate(() => {
        const h = window.canvasHarness, s = h.S.settings();
        const legacy = h.S.allGraphs().find(graph => graph.schema !== 2), pre = h.graph;
        legacy.name = 'Unrelated legacy prompt'; pre.name = 'Assigned native guidance';
        s.nativeBindings.preGraphId = pre.id; s.workflowMode = 'native'; s.enabled = true;
        s.activeGraphId = legacy.id; h.S.setChatBinding(legacy.id); h.S.save(); document.dispatchEvent(new CustomEvent('pc-state'));
        return { pre: pre.name, legacy: legacy.name };
    });
    const indicator = page.locator('#pc-sendbar');
    await expect(indicator).toHaveClass(/pc-sendbar-on/);
    await expect(indicator).toHaveAttribute('title', /Assigned native guidance.*adds guidance/);
    await expect(indicator).toHaveAttribute('title', /2 auxiliary requests/);
    expect(await indicator.getAttribute('title')).not.toContain(names.legacy);
    await expect(page.locator('label[for="pc-enabled"]')).toContainText('native');
    expect(await page.locator('label[for="pc-enabled"]').textContent()).not.toContain('instead of SillyTavern');
    await indicator.dispatchEvent('contextmenu'); await indicator.dispatchEvent('contextmenu');
    expect(await page.evaluate(() => window.canvasHarness.toasts.at(-1).message)).toMatch(/Assigned native guidance.*guidance/);
    await page.evaluate(() => {
        const h = window.canvasHarness, s = h.S.settings();
        s.nativeBindings.preGraphId = null;
        s.nativeBindings.postGraphId = h.S.allGraphs().find(graph => graph.mode === 'native-post').id;
        h.S.save(); document.dispatchEvent(new CustomEvent('pc-state'));
    });
    await expect(indicator).not.toHaveClass(/pc-sendbar-on/);
    await expect(indicator).toHaveAttribute('title', /No automatic.*manual/i);
    await indicator.dispatchEvent('contextmenu'); await indicator.dispatchEvent('contextmenu');
    expect(await page.evaluate(() => window.canvasHarness.toasts.at(-1).message)).toMatch(/manual/i);
    await page.evaluate(() => { const h = window.canvasHarness; h.S.settings().workflowMode = 'legacy'; h.S.save(); document.dispatchEvent(new CustomEvent('pc-state')); });
    await expect(indicator).toHaveAttribute('title', /Unrelated legacy prompt.*builds the prompt/);
    await expect(indicator).toHaveClass(/pc-sendbar-on/);
    await expect(page.locator('label[for="pc-enabled"]')).toContainText('instead of SillyTavern');
    await indicator.dispatchEvent('contextmenu'); await indicator.dispatchEvent('contextmenu');
    expect(await page.evaluate(() => window.canvasHarness.toasts.at(-1).message)).toMatch(/builds the prompt/);
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
    await page.getByRole('button', { name: 'Toggle library', exact: true }).click();
    await page.getByRole('button', { name: 'Install Scene guidance' }).click();
    await page.evaluate(() => { const h = window.canvasHarness; h.canvas.select({ kind: 'wire', id: Object.keys(h.graph.wires)[0] }); });
    await expect(page.getByText('Artifact wire', { exact: true })).toBeVisible();
    await expect(page.getByText('How it joins', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Cut artifact wire', exact: true })).toBeVisible();
});


test('the native inspector provides a keyboard-accessible duplicate action', async ({ page }) => {
    await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
    await page.getByRole('button', { name: 'Toggle library', exact: true }).click();
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
        const controller = (await import('/src/run.js?v=0.19.1')).getNativeWorkflowController();
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
    expect(await page.evaluate(async () => { const controller = (await import('/src/run.js?v=0.19.1')).getNativeWorkflowController(); return controller.candidateStatus(controller.lastResult().artifact).ok; })).toBe(true);
    const title = await page.locator('.pc-node-title').filter({ hasText: /^Reply Snapshot$/ }).boundingBox();
    await page.mouse.move(title.x + 20, title.y + 8); await page.mouse.down();
    await page.mouse.move(title.x + 60, title.y + 28, { steps: 4 }); await page.mouse.up();
    await expect(page.getByRole('button', { name: 'Apply reviewed candidate', exact: true })).toBeEnabled();
    expect(await page.evaluate(async () => { const controller = (await import('/src/run.js?v=0.19.1')).getNativeWorkflowController(); return controller.candidateStatus(controller.lastResult().artifact).ok; })).toBe(true);
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
        await page.evaluate(async theme => (await import('/src/theme.js?v=0.19.1')).setPreset(theme), theme);
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
        await page.evaluate(async theme => (await import('/src/theme.js?v=0.19.1')).setPreset(theme), theme);
        await expect(page.getByRole('button', { name: 'Toggle library', exact: true }).getByText('Library', { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Toggle inspector', exact: true }).getByText('Details', { exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'Tools', exact: true }).click();
        await expect(page.getByRole('menuitem', { name: 'Theme and colours', exact: true })).toBeVisible();
        await page.keyboard.press('Escape');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    const library = page.getByRole('button', { name: 'Toggle library', exact: true });
    const previous = await library.getAttribute('aria-pressed');
    await library.focus(); await page.keyboard.press('Enter');
    await expect(library).toHaveAttribute('aria-pressed', previous === 'true' ? 'false' : 'true');
});
