import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compile } from 'svelte/compiler';
import { JSDOM } from 'jsdom';
import { installMock } from './mock.js';
const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const key of ['Node', 'Element', 'Text', 'Comment', 'Document', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLSelectElement', 'MutationObserver']) Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
installMock({ settings: { graphs: {} } });
const version = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8')).version;
const { starterGraph } = await import(`../src/workflow/starters.js?v=${version}`);
const { cloneWorkflowDocument } = await import(`../src/workflow/document.js?v=${version}`);
const { prepareWorkspaceViews } = await import(`../src/ui/workspace-preparation.js?v=${version}`);
const { prepareWorkflowProjection, projectPreparedWorkflow, createWorkflowSession } = await import(`../src/ui/workflow-surface.js?v=${version}`);
const clientURL = new URL('../node_modules/svelte/src/index-client.js', import.meta.url).href;
const { mount, unmount, flushSync, tick } = await import(clientURL);
const directory = await mkdtemp(join(tmpdir(), 'lattice-workspace-menu-root-'));
after(async () => {
    const target = resolve(directory), rel = relative(resolve(tmpdir()), target);
    assert.ok(rel && !rel.startsWith('..') && !isAbsolute(rel)); await rm(target, { recursive: true, force: true });
});
async function compiled(name, source) {
    const output = compile(source, { filename: name + '.svelte', generate: 'client', css: 'injected' });
    assert.deepEqual(output.warnings.filter(warning => warning.code.startsWith('a11y')), []);
    const code = output.js.code.replace(/(['"])(svelte(?:\/[^'"]*)?)\1/g, (_, quote, specifier) => JSON.stringify(specifier === 'svelte' ? clientURL : import.meta.resolve(specifier)));
    const path = join(directory, name + '.mjs'); await writeFile(path, code);
    return { path, component: (await import(pathToFileURL(path).href)).default };
}
const leaf = await compiled('WorkspaceMenus', await readFile(new URL('../ui/WorkspaceMenus.svelte', import.meta.url), 'utf8'));
const harness = await compiled('WorkspaceMenuHarness', `<script>import Menus from ${JSON.stringify(pathToFileURL(leaf.path).href)}; let { initial, actions } = $props(); let state = $state.raw(initial); export function update(next) { state = next; }</script><Menus {state} {actions} local={() => {}} />`);
const settle = async () => { flushSync(); await tick(); flushSync(); };
const click = async element => { assert.ok(element); element.click(); await settle(); };
let sequence = 0;
const guidance = () => { const root = cloneWorkflowDocument(starterGraph('unified-basic')).data; root.id = 'menu-root-' + ++sequence; return root; };
function prepare(root, validBindings = true) {
    let bindings = 0;
    const result = prepareWorkspaceViews(root, { resolveBinding: () => { bindings++; return validBindings ? { ok: true, data: { profileId: 'cached', model: 'cached-model' } } : { ok: false, error: { message: 'The current root needs its model connection.' } }; } });
    assert.equal(result.ok, true, JSON.stringify(result));
    return { token: result.data.workflow, bindingCount: () => bindings };
}
const state = (workflow, rootWorkflow) => ({ workflow, ...(rootWorkflow === undefined ? {} : { rootWorkflow }), nativeGraph: workflow.native, history: { undo: false, redo: false }, selectionCount: 0, selectionActions: { copy: false, cut: false, delete: false } });
async function fixture(initial, command = () => {}) {
    const host = document.createElement('div'); document.body.append(host);
    const mounted = mount(harness.component, { target: host, props: { initial, actions: { command } } }); await settle();
    const menu = () => host.querySelector('[role="menu"]');
    const item = label => [...menu().querySelectorAll('[role="menuitem"]')].find(element => element.textContent.trim() === label);
    return { host, item, async open(name = 'Workflows') { if (!menu()) await click(host.querySelector('[data-menu="' + name + '"]')); }, async update(next) { mounted.update(next); await settle(); }, async close() { await unmount(mounted); host.remove(); } };
}
test('a removed pinned output does not disable assignment of the current unified root', async () => {
    const root = guidance(); root.nodes.scratch = { id: 'scratch', type: 'workflow', operation: 'compose', outputKind: 'text', sections: [] };
    const first = prepare(root), pinned = projectPreparedWorkflow(first.token).targets.find(target => target.nodeId === 'scratch');
    delete root.nodes.scratch; const current = prepare(root), rootView = projectPreparedWorkflow(current.token), selected = projectPreparedWorkflow(current.token, { selectedTarget: pinned, pinnedPreview: pinned });
    assert.ok(selected.issues.length); const count = current.bindingCount(), calls = [], f = await fixture(state(selected, rootView), command => calls.push(command));
    try { await f.open(); assert.equal(f.item('Assign unified workflow').disabled, false); await click(f.item('Assign unified workflow')); assert.deepEqual(calls, ['assign-workflow']); assert.equal(current.bindingCount(), count); }
    finally { await f.close(); }
});

test('a busy target session governs Stop while the selected projection is idle', async () => {
    const root = guidance(), prepared = prepare(root), idle = projectPreparedWorkflow(prepared.token);
    let release, sessionState, cancelled = 0, runs = 0;
    const session = createWorkflowSession({ rootCurrent: () => root, runEpoch: () => 1, active: () => true, changed: next => { sessionState = next; }, runtime: () => ({ runTarget: async actual => { assert.equal(actual, root); runs++; return new Promise(resolve => { release = resolve; }); }, cancel: () => { cancelled++; } }) });
    const running = session.run({ target: { workflowId: root.id, instancePath: [], nodeId: 'on-send', portId: 'activation' } }); assert.equal(sessionState.busy, true);
    const calls = [], f = await fixture(state(idle, projectPreparedWorkflow(prepared.token, sessionState)), command => { calls.push(command); if (command === 'stop-workflow') session.cancel(); });
    try {
        await f.open(); assert.equal(f.item('Stop workflow').disabled, false); assert.equal(f.item('Assign unified workflow').disabled, true);
        await click(f.item('Stop workflow')); assert.deepEqual(calls, ['stop-workflow']); assert.equal(cancelled, 1); assert.equal(runs, 1);
        await f.update(state(idle, projectPreparedWorkflow(prepared.token, sessionState))); await f.open(); assert.equal(f.item('Stop workflow').disabled, true);
    } finally { release({ ok: false, error: { message: 'Run cancelled.' } }); await running; await f.close(); }
});

test('an unavailable workflow keeps Stop disabled and exposes no assignment', async () => {
    const f = await fixture({ history: { undo: false, redo: false }, selectionCount: 0, selectionActions: {} });
    try { await f.open(); assert.equal(f.item('Stop workflow').disabled, true); assert.equal(f.item('Assign unified workflow'), undefined); } finally { await f.close(); }
});

test('unified Workflows menu offers assignment and Stop without legacy creation or root Run', async () => {
    const root = starterGraph('unified-basic'), prepared = prepare(root), calls = [];
    const f = await fixture(state(projectPreparedWorkflow(prepared.token)), command => calls.push(command));
    try {
        await f.open();
        assert.equal(f.item('Run workflow'), undefined);
        assert.equal(f.item('New legacy pre workflow'), undefined);
        assert.equal(f.item('New legacy post workflow'), undefined);
        assert.equal(f.item('Stop workflow').disabled, true);
        await click(f.item('Assign unified workflow'));
        assert.deepEqual(calls, ['assign-workflow']);
    } finally { await f.close(); }
});


test('File offers archived workflow export only when recoverable originals exist', async () => {
    const root = starterGraph('unified-basic'), view = state(projectPreparedWorkflow(prepare(root).token)), calls = [];
    const f = await fixture(view, command => calls.push(command));
    try {
        await f.open('File'); assert.equal(f.item('Export archived workflows…'), undefined);
        await f.update({ ...view, hasArchivedWorkflows: true });
        await click(f.item('Export archived workflows…')); assert.deepEqual(calls, ['export-archived-workflows']);
    } finally { await f.close(); }
});
