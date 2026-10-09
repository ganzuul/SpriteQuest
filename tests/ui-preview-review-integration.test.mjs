import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compile } from 'svelte/compiler';
import { JSDOM } from 'jsdom';
import { starterGraph } from '../src/workflow/starters.js?v=0.23.0';
import { cloneWorkflowDocument } from '../src/workflow/document.js?v=0.23.0';
import { computeDefinitionIdentity, definitionRefKey } from '../src/workflow/definitions.js?v=0.23.0';
import { createNativeWorkflowController } from '../src/workflow/host.js?v=0.23.0';
import { createWorkflowSession, prepareWorkflowProjection, projectPreparedWorkflow } from '../src/ui/workflow-surface.js?v=0.23.0';
import { createGraphViewSession } from '../src/ui/graph-view-session.js?v=0.23.0';
import { prepareWorkspaceViews, prepareLibraryViews, projectWorkspacePanels } from '../src/ui/workspace-preparation.js?v=0.23.0';
import { readNodePresentation } from '../src/ui/node-palette.js?v=0.23.0';

const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const key of ['Node', 'Element', 'Text', 'Comment', 'Document', 'HTMLElement', 'HTMLMediaElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLSelectElement', 'MutationObserver']) Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
const clientURL = new URL('../node_modules/svelte/src/index-client.js', import.meta.url).href;
const { mount, unmount, flushSync } = await import(clientURL);
const controllerText = await readFile(new URL('../src/ui/controller.js', import.meta.url), 'utf8');
function controllerFunction(name, env) {
    env.activeEditRoot ??= () => env.current;
    env.readNodePresentation ??= readNodePresentation;
    const start = controllerText.indexOf('function ' + name + '(');
    if (start < 0) return null;
    const end = controllerText.indexOf('\nfunction ', start + 1);
    return Function('env', 'with(env){' + (controllerText.slice(start - 6, start) === 'async ' ? 'async ' : '') + controllerText.slice(start, end) + ';return ' + name + ';}')(env);
}
function controllerActions(env) {
    const start = controllerText.indexOf('const outputPreviewActions = {'), end = controllerText.indexOf('\nconst runDetailsActions', start);
    return Function('env', 'with(env){' + controllerText.slice(start, end) + ';return outputPreviewActions;}')(env);
}
async function previewFixture(initial, actions) {
    const directory = await mkdtemp(join(tmpdir(), 'lattice-preview-review-')), host = document.createElement('div'); document.body.append(host);
    let mounted;
    async function compiled(name, source) {
        const output = compile(source, { filename: name + '.svelte', generate: 'client', css: 'injected' });
        assert.deepEqual(output.warnings.filter(warning => warning.code.startsWith('a11y')), []);
        const code = output.js.code.replace(/(['"])(svelte(?:\/[^'"]*)?)\1/g, (_, quote, specifier) => JSON.stringify(specifier === 'svelte' ? clientURL : import.meta.resolve(specifier)));
        const path = join(directory, name + '.mjs'); await writeFile(path, code); return path;
    }
    async function close() {
        if (mounted) await unmount(mounted); host.remove();
        const rel = relative(resolve(tmpdir()), resolve(directory)); assert.ok(rel && !rel.startsWith('..') && !isAbsolute(rel)); await rm(directory, { recursive: true, force: true });
    }
    try {
        const leaf = await compiled('OutputPreview', await readFile(new URL('../ui/OutputPreview.svelte', import.meta.url), 'utf8'));
        const harness = await compiled('PreviewHarness', `<script>import Leaf from ${JSON.stringify(pathToFileURL(leaf).href)}; let { initial, actions } = $props(); let view = $state.raw(initial); export function update(next) { view = next; }</script><Leaf {view} {actions} />`);
        mounted = mount((await import(pathToFileURL(harness).href)).default, { target: host, props: { initial, actions } }); flushSync();
        return { host, update(next) { mounted.update(next); flushSync(); }, close };
    } catch (error) { await close(); throw error; }
}
function childDefinition() {
    const checked = computeDefinitionIdentity({ id: 'inspection', version: 1, name: 'Inspection', parameters: [], interface: [{ id: 'text', label: 'Text', direction: 'output', kind: 'text', required: false, cardinality: 'one', boundaryNodeId: 'exit' }], body: { schema: 3, runtime: 2, mode: 'native-post', nodes: { compose: { id: 'compose', type: 'workflow', operation: 'compose', outputKind: 'text', sections: [{ name: 'value', text: 'Diagnostic only' }] }, exit: { id: 'exit', type: 'subgraph-output', interfacePortId: 'text' } }, wires: { edge: { id: 'edge', route: 'wire', from: 'compose', fromPort: 'out', to: 'exit', toPort: 'in' } } } });
    assert.equal(checked.ok, true, JSON.stringify(checked));
    return { ...checked.data.materializedDefinition, semanticHash: checked.data.semanticHash };
}
function adapter(schema = 3, suppliedRoot = null) {
    const saved = starterGraph('reviewed-de-slop'); saved.nodes.repair.mode = 'scan';
    const root = suppliedRoot ?? (schema === 3 ? cloneWorkflowDocument(saved).data : saved), definition = childDefinition();
    if (schema === 3 && root.mode === 'native-post') {
        root.definitions[definitionRefKey(definition)] = definition;
        root.nodes.inspection = { id: 'inspection', type: 'subgraph', definition: { id: definition.id, version: definition.version, semanticHash: definition.semanticHash }, parameterOverrides: {}, roleOverrides: {}, nodeBindingOverrides: {} };
    }
    const message = { mes: 'We delve.\n雪', is_user: false, swipe_id: 0, swipes: ['We delve.\n雪'], swipe_info: [{ extra: {}, gen_started: 1, gen_finished: 2 }], extra: {}, gen_started: 1, gen_finished: 2 };
    const counters = { requests: 0, checks: 0, apply: 0, saves: 0, cancel: 0 };
    const context = { chatId: 'review', characterId: 1, groupId: null, chat: [{ mes: 'Hello', is_user: true }, message], extensionPrompts: {}, setExtensionPrompt(key, value) { this.extensionPrompts[key] = { value }; }, saveChat: async () => { counters.saves++; }, updateMessageBlock: async () => {}, swipe: { refresh: async () => {} } };
    const host = createNativeWorkflowController({ context: () => context, getGraph: () => root, isEnabled: () => true, isBusy: () => false, countTokens: async text => ({ tokens: Math.ceil(text.length / 4), method: 'fixture' }), resolveBinding: () => { throw new Error('A scan-only run must not resolve bindings'); }, request: async () => { counters.requests++; throw new Error('A scan-only run must not request a model'); }, syncMesToSwipe: index => { const item = context.chat[index]; item.swipes[item.swipe_id] = item.mes; return true; }, syncSwipeToMes: (index, id) => { const item = context.chat[index]; item.swipe_id = id; item.mes = item.swipes[id]; Object.assign(item, structuredClone(item.swipe_info[id])); return true; } });
    const runtime = { ...host, candidateStatus(candidate) { counters.checks++; return host.candidateStatus(candidate); }, async apply(candidate) { counters.apply++; return host.apply(candidate); }, cancel(reason) { counters.cancel++; host.cancel(reason); } };
    const prepared = prepareWorkspaceViews(root, { candidateStatus: candidate => runtime.candidateStatus(candidate) }); assert.equal(prepared.ok, true, JSON.stringify(prepared));
    const library = prepareLibraryViews(root.id, { [definitionRefKey(definition)]: definition }); assert.equal(library.ok, true, JSON.stringify(library));
    prepared.data.navigation.push(...library.data.navigation); prepared.data.preparedViews.push(...library.data.preparedViews);
    const graphViews = createGraphViewSession({ root, activationId: 'preview-review-' + schema, ...prepared.data }).data; assert.ok(graphViews);
    const env = { current: root, graphViews, workspacePrepared: prepared.data, rootRunEpoch: 1, workspaceRevision: 1, uiEpoch: 1, editorCaptures: new WeakMap(), workspaceIssue: '', selectedPreview: null, pinnedPreview: null, selectedKind: 'node', selected: root.nodes['apply-reply'], workflowProjection: null, workflowProjectionGraph: null, workflowState: { result: null, reviewHandles: [], busy: false, availability: 'current', applyIssue: '' }, canvas: null, canvasTraceRows: null, editorDraw: null, isOpen: () => true, settings: () => ({}), projectPreparedWorkflow, projectWorkspacePanels, workbench: { update(value) { env.panels = value; } } };
    for (const name of ['captureEditor', 'editorCurrent', 'samePreviewTerminal', 'currentRootPreviewTerminal', 'currentPreviewHandle', 'applyPreviewReview', 'rejectPreviewReview', 'workflowView', 'updateWorkflowProjection']) { const fn = controllerFunction(name, env); if (fn) env[name] = fn; }
    env.workflowSession = createWorkflowSession({ runtime: () => runtime, rootCurrent: () => env.current, runEpoch: () => env.rootRunEpoch, active: () => env.isOpen(), changed(state) { const authorityChanged = state.result !== env.workflowState.result || state.reviewHandles !== env.workflowState.reviewHandles; env.workflowState = state; if (authorityChanged) env.workspacePrepared.workflow = prepareWorkflowProjection(env.current, { ...(prepared.data.planner ? { planner: prepared.data.planner } : {}), result: state.result, candidateStatus: candidate => runtime.candidateStatus(candidate) }); env.updateWorkflowProjection(); } });
    const actions = controllerActions(env);
    return { root, env, actions, graphViews, runtime, counters, context, message, definition, run: () => env.workflowSession.run(), refresh: () => env.updateWorkflowProjection(), terminal: { kind: 'terminal', address: { workflowId: root.id, instancePath: [], nodeId: 'apply-reply' } } };
}

// Real zero-call host results flow through the actual controller, cached projector and compiled leaf.
test('current preview preserves final host source freshness checks after review selection', async () => {
    const f = adapter(); await f.run(); const selector = structuredClone(f.env.panels.outputPreview.review?.selector); assert.ok(selector);
    f.message.mes += ' externally edited'; const before = structuredClone(f.message), checks = f.counters.checks;
    await f.actions.apply(selector);
    assert.equal(f.counters.checks, checks + 1); assert.equal(f.counters.apply, 0); assert.equal(f.counters.saves, 0); assert.deepEqual(f.message, before); assert.match(f.env.workflowState.applyIssue, /source|changed|stale/i);
});

test('current pinned root terminal keeps its actual handle across node selection and never applies from child or library views', async () => {
    const f = adapter(3); await f.run(); assert.equal(f.env.workflowState.result.ok, true, JSON.stringify(f.env.workflowState.result.error));
    const handle = f.env.workflowState.reviewHandles.find(handle => handle.terminal.address.nodeId === 'apply-reply'); assert.ok(handle);
    f.env.pinnedPreview = structuredClone(f.terminal); f.env.selectedPreview = null; f.env.selected = f.root.nodes['pattern-scan']; f.refresh();
    assert.deepEqual(f.env.workflowProjection.result.selectedReviewHandle, handle, 'review must use the effective pinned terminal rather than the newly selected node output');
    const leaf = await previewFixture(f.env.panels.outputPreview, f.actions);
    try {
        assert.equal(leaf.host.querySelector('[data-preview-apply]').disabled, false); assert.deepEqual(f.env.panels.outputPreview.review.selector, handle);
        const checks = f.counters.checks, cancelled = f.counters.cancel;
        assert.equal(f.graphViews.openInstance(['inspection']).ok, true); f.refresh(); leaf.update(f.env.panels.outputPreview); assert.equal(f.env.panels.outputPreview.review, null); await f.actions.apply(structuredClone(handle)); f.actions.reject(structuredClone(handle)); assert.equal(f.counters.checks, checks); assert.equal(f.counters.cancel, cancelled);
        assert.equal(f.graphViews.openLibrary(f.root.nodes.inspection.definition).ok, true); f.refresh(); assert.equal(f.env.panels.outputPreview.review, null, 'library DTO must not expose a root review selector'); await f.actions.apply(handle); assert.equal(f.counters.checks, checks);
        f.graphViews.focusView(f.graphViews.project().graphViews.tabs[0].key); f.refresh(); leaf.update(f.env.panels.outputPreview); assert.equal(leaf.host.querySelector('[data-preview-apply]').disabled, false); assert.deepEqual(f.env.panels.outputPreview.review.selector, handle);
        const copied = structuredClone(handle); copied.terminal.address.nodeId = 'repair'; await f.actions.apply(copied); assert.equal(f.counters.checks, checks); assert.deepEqual(f.env.workflowState.reviewHandles[0], handle);
        f.env.workflowSession.invalidate('Superseded run'); f.refresh(); await f.actions.apply(handle); assert.equal(f.counters.apply, 0); assert.equal(f.counters.requests, 0);
    } finally { await leaf.close(); }
});
async function workbenchFixture(actions) {
    const directory = await mkdtemp(join(tmpdir(), 'lattice-review-workbench-')), host = document.createElement('div'); document.body.append(host);
    const compiled = new Map();
    async function module(sourceURL) {
        if (compiled.has(sourceURL.href)) return compiled.get(sourceURL.href);
        const source = await readFile(sourceURL, 'utf8'), filename = sourceURL.pathname.split('/').at(-1), target = join(directory, filename.replace('.svelte', '.mjs'));
        compiled.set(sourceURL.href, pathToFileURL(target).href);
        let code = filename.endsWith('.svelte') ? compile(source, { filename, generate: 'client', css: 'injected' }).js.code : source;
        for (const match of [...code.matchAll(/\bfrom\s+(['"])(\.{1,2}\/[^'"]+)\1/g)]) {
            const url = new URL(match[2], sourceURL), destination = url.pathname.endsWith('.svelte') ? await module(url) : url.href;
            code = code.replace(match[0], 'from ' + JSON.stringify(destination));
        }
        code = code.replace(/(['"])(svelte(?:\/[^'"]*)?)\1/g, (_, quote, specifier) => JSON.stringify(specifier === 'svelte' ? clientURL : import.meta.resolve(specifier)));
        await writeFile(target, code); return pathToFileURL(target).href;
    }
    let bridge;
    async function close() { if (bridge) await bridge.destroy(); host.remove(); const rel = relative(resolve(tmpdir()), resolve(directory)); assert.ok(rel && !rel.startsWith('..') && !isAbsolute(rel)); await rm(directory, { recursive: true, force: true }); }
    try { const entry = await import(await module(new URL('../ui/entry.js', import.meta.url))); bridge = entry.mountWorkbench(host, actions); return { bridge, host, close }; }
    catch (error) { await close(); throw error; }
}

test('the actual Setup bridge opens examples without host work', async () => {
    const f = adapter(); await f.run(); const mounted = await workbenchFixture({ close() {}, resizeStart() {}, workflowSetup: {} });
    try {
        mounted.bridge.update(f.env.panels); const before = structuredClone(f.root), counters = { ...f.counters };
        mounted.bridge.revealWorkflowSetup(); await (await import(clientURL)).tick(); flushSync();
        const dialog = mounted.host.querySelector('[role="dialog"][aria-label="Workflow setup"]'); assert.ok(dialog, 'Setup opens the actual current panel');
        assert.equal(dialog.querySelector('[aria-label="Workflow mode"]'), null); assert.equal(dialog.querySelector('h3').textContent, f.root.name); assert.match(dialog.textContent, /latest completed assistant reply/); assert.equal(mounted.host.querySelectorAll('.pc-output-preview').length, 1); assert.deepEqual(f.root, before); assert.deepEqual(f.counters, counters); assert.equal(f.counters.requests, 0);
    } finally { await mounted.close(); }
});

test('actual automatic zero-call Send provenance remains visible without exposing schema3 payload diagnostics', async () => {
    const f = adapter(3, starterGraph('structured-guidance'));
    const sent = await f.runtime.beforeGenerate(f.context.chat, 8192, () => {}, 'normal'); assert.equal(sent.ok, true, JSON.stringify(sent.error));
    const record = f.runtime.lastAutomaticResult(); assert.equal(record.origin.graph, f.root); assert.equal(record.origin.kind, 'send');
    f.env.workflowSession.receiveAutomatic(record);
    const view = f.env.panels.outputPreview; assert.match(view.statusDetail, /Automatic Send.*pre phase/); assert.equal(view.review, null); assert.ok(view.sections.length);
    assert.ok(view.sections.every(section => !['findings', 'changes', 'reports', 'calls'].includes(section.id)), 'schema3 retains only its existing bounded artifacts');
    const leaf = await previewFixture(view, f.actions);
    try { assert.match(leaf.host.textContent, /Automatic Send.*pre phase/); assert.equal(leaf.host.querySelector('[data-preview-apply]'), null); assert.equal(f.counters.requests, 0); }
    finally { await leaf.close(); }
});
