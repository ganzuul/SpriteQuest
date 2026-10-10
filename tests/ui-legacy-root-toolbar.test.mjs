import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { compiled } from './helpers/svelte-compile.mjs';
import { starterGraph } from '../src/workflow/starters.js?v=0.26.0';
import { cloneWorkflowDocument } from '../src/workflow/document.js?v=0.26.0';
import { prepareWorkspaceViews } from '../src/ui/workspace-preparation.js?v=0.26.0';
import { projectPreparedWorkflow, createWorkflowSession } from '../src/ui/workflow-surface.js?v=0.26.0';

const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const key of ['Node', 'Element', 'Text', 'Comment', 'Document', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLSelectElement', 'MutationObserver']) Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
const clientURL = new URL('../node_modules/svelte/src/index-client.js', import.meta.url).href;
const { mount, unmount, flushSync, tick } = await import(clientURL);
const directory = await mkdtemp(join(tmpdir(), 'lattice-legacy-root-toolbar-'));
after(async () => {
    const target = resolve(directory), rel = relative(resolve(tmpdir()), target);
    assert.ok(rel && !rel.startsWith('..') && !isAbsolute(rel)); await rm(target, { recursive: true, force: true });
});
const toolbar = await compiled('Toolbar', directory);
const harness = await compiled('LegacyToolbarHarness', directory, `<script>import Toolbar from ${JSON.stringify(pathToFileURL(toolbar.path).href)}; let { initial, actions } = $props(); let state = $state.raw(initial); export function update(next) { state = next; }</script><Toolbar {state} {actions} local={() => {}} />`);
const settle = async () => { flushSync(); await tick(); flushSync(); };
let sequence = 0;
const guidance = () => { const root = cloneWorkflowDocument(starterGraph('native-guidance')).data; root.id = 'toolbar-root-' + ++sequence; return root; };
function prepare(root, validBindings = true) {
    let bindings = 0;
    const result = prepareWorkspaceViews(root, { resolveBinding: () => { bindings++; return validBindings ? { ok: true, data: { profileId: 'cached', model: 'cached-model' } } : { ok: false, error: { message: 'The current root needs its model connection.' } }; } });
    assert.equal(result.ok, true, JSON.stringify(result));
    return { token: result.data.workflow, bindingCount: () => bindings };
}
const state = (workflow, rootWorkflow) => ({ graphs: [], graphId: 'root', armed: false, inspectorOpen: true, workflow, ...(rootWorkflow === undefined ? {} : { rootWorkflow }), history: { undo: false, redo: false }, selectionActions: {} });
async function fixture(initial, command = () => {}) {
    const host = document.createElement('div'); document.body.append(host);
    const mounted = mount(harness.component, { target: host, props: { initial, actions: { command, logoUrl: '/assets/lattice-logo.svg' } } }); await settle();
    return { host, run: () => host.querySelector('.pc-root-run'), async update(next) { mounted.update(next); await settle(); }, async close() { await unmount(mounted); host.remove(); } };
}

test('a deleted genuine pinned output cannot disable the valid legacy root Run control', async () => {
    const root = guidance(); root.nodes.scratch = { id: 'scratch', type: 'workflow', operation: 'compose', outputKind: 'text', sections: [{ name: 'note', text: 'Temporary preview' }] };
    const initial = prepare(root), pinned = projectPreparedWorkflow(initial.token).targets.find(target => target.nodeId === 'scratch'); assert.ok(pinned);
    const calls = [], f = await fixture(state(projectPreparedWorkflow(initial.token, { selectedTarget: pinned, pinnedPreview: pinned }), projectPreparedWorkflow(initial.token)), command => calls.push(command));
    try {
        assert.equal(f.run().disabled, false);
        delete root.nodes.scratch;
        const current = prepare(root), rootView = projectPreparedWorkflow(current.token), targetView = projectPreparedWorkflow(current.token, { selectedTarget: pinned, pinnedPreview: pinned });
        assert.equal(rootView.issues.length, 0); assert.ok(targetView.issues.length); const count = current.bindingCount();
        await f.update(state(targetView, rootView));
        assert.equal(f.run().disabled, false, 'the saved root governs its Run control');
        f.run().click(); await settle(); assert.deepEqual(calls, ['run-workflow']); assert.equal(current.bindingCount(), count);
    } finally { await f.close(); }
});

test('a valid deterministic target cannot enable Run for the current unbound legacy root', async () => {
    const root = guidance(), prepared = prepare(root, false), rootView = projectPreparedWorkflow(prepared.token);
    const sceneId = Object.values(root.nodes).find(node => node.operation === 'scene-context').id;
    const target = rootView.targets.find(target => target.nodeId === sceneId); assert.ok(target);
    const targetView = projectPreparedWorkflow(prepared.token, { selectedTarget: target, pinnedPreview: target });
    assert.ok(rootView.issues.length); assert.equal(targetView.issues.length, 0); const count = prepared.bindingCount(), calls = [];
    const f = await fixture(state(targetView, rootView), command => calls.push(command));
    try {
        assert.equal(f.run().disabled, true);
        f.run().click(); await settle(); assert.deepEqual(calls, []); assert.equal(prepared.bindingCount(), count);
    } finally { await f.close(); }
});

test('an actual busy legacy root session exposes Stop while the selected projection is idle', async () => {
    const root = guidance(), prepared = prepare(root), idle = projectPreparedWorkflow(prepared.token);
    let release, sessionState, cancelled = 0, runs = 0;
    const session = createWorkflowSession({ rootCurrent: () => root, runEpoch: () => 1, active: () => true, changed: next => { sessionState = next; }, runtime: () => ({ runPre: async actual => { assert.equal(actual, root); runs++; return new Promise(resolve => { release = resolve; }); }, cancel: () => { cancelled++; } }) });
    const running = session.run(); assert.equal(sessionState.busy, true);
    const f = await fixture(state(idle, projectPreparedWorkflow(prepared.token, sessionState)), command => { if (command === 'stop-workflow') session.cancel(); });
    try {
        assert.match(f.run().textContent, /Stop/); assert.equal(f.run().disabled, false);
        f.run().click(); await settle(); assert.equal(cancelled, 1); assert.equal(runs, 1);
        await f.update(state(idle, projectPreparedWorkflow(prepared.token, sessionState)));
        assert.match(f.run().textContent, /Run/); assert.equal(f.run().disabled, false);
    } finally { release({ ok: false, error: { message: 'Run cancelled.' } }); await running; await f.close(); }
});

test('a missing current workflow keeps the legacy Run control disabled', async () => {
    const f = await fixture(state(undefined));
    try { assert.equal(f.run().disabled, true); } finally { await f.close(); }
});
