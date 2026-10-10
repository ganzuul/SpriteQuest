import {workflowCreationPhase} from '../src/ui/provider-settings.js';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { installMock } from './mock.js';
import * as S from '../src/state.js';
import { createGraphViewSession } from '../src/ui/graph-view-session.js';
import { prepareWorkspaceViews } from '../src/ui/workspace-preparation.js';
import { createLibraryWorkflow } from '../src/workflow/library/subgraphs.js';
import { parseWorkflow } from '../src/workflow/packages.js';

const accepted = result => { assert.equal(result.ok, true, JSON.stringify(result.error)); return result.data; };

async function controllerFunction(name, env) {
    const source = await readFile(new URL('../src/ui/controller.js', import.meta.url), 'utf8');
    let start = source.indexOf('function ' + name + '(');
    assert.ok(start >= 0, `Actual controller function ${name} is available`);
    if (source.slice(start - 6, start) === 'async ') start -= 6;
    const end = source.indexOf('\n}', start) + 2;
    return Function('env', 'with(env){' + source.slice(start, end) + ';return ' + name + ';}')(env);
}

async function installSaveTracking(env) {
    env.savedWorkflowDocuments = new WeakMap();
    env.workflowSaveRequests = new WeakMap();
    env.workflowDocumentSnapshot = await controllerFunction('workflowDocumentSnapshot', env);
    env.hasUnsavedWorkflowChanges = await controllerFunction('hasUnsavedWorkflowChanges', env);
    env.savedWorkflowDocuments.set(env.current, env.workflowDocumentSnapshot(env.current));
}

async function openEnvironment(file) {
    const original = { ...S.blankGraph('Original workflow'), id: 'original' };
    const stored = { schema: 1, enabled: false, activeGraphId: original.id, graphs: { original }, nativeBindings: { preGraphId: null, postGraphId: null }, subgraphLibrary: { definitions: {} }, ui: {} };
    const notices = [], changes = [];
    let change;
    const input = { files: file ? [file] : [], addEventListener(event, listener) { assert.equal(event, 'change'); change = listener; }, click() {} };
    const env = {
        current: original, uiEpoch: 1,
        document: { createElement(tag) { assert.equal(tag, 'input'); return input; } },
        stillEditing: (graph, epoch) => env.current === graph && env.uiEpoch === epoch,
        settings: () => stored,
        importGraph() { assert.fail('The unreadable workflow must not be imported'); },
        save: () => changes.push('save'), setCanvasGraph: () => changes.push('canvas'), renderAll: () => changes.push('render'),
        toast: (message, type) => notices.push({ message, type }),
    };
    const open = await controllerFunction('onImportGraph', env);
    open();
    return { env, stored, original, notices, changes, choose: () => change() };
}

test('Open reports an unreadable file without changing the active workflow', async () => {
    const fixture = await openEnvironment({ text: async () => { throw new Error('File read failed'); } });
    await assert.doesNotReject(fixture.choose());
    assert.equal(fixture.env.current, fixture.original);
    assert.equal(fixture.stored.activeGraphId, 'original');
    assert.deepEqual(fixture.changes, []);
    assert.deepEqual(fixture.notices, [{ message: 'File read failed', type: 'error' }]);
});

test('Open activates an imported workflow and reports that it was opened', async () => {
    const fixture = await openEnvironment({ text: async () => '{"workflow":"portable"}' });
    const opened = { ...S.blankGraph('Opened workflow'), id: 'opened' };
    fixture.env.importGraph = text => {
        assert.equal(text, '{"workflow":"portable"}');
        fixture.stored.graphs[opened.id] = opened;
        return { ok: true, graph: opened };
    };
    await fixture.choose();
    assert.equal(fixture.env.current, opened);
    assert.equal(fixture.stored.activeGraphId, 'opened');
    assert.deepEqual(fixture.changes, ['save', 'canvas', 'render']);
    assert.equal(fixture.notices[0].type, 'success');
    assert.match(fixture.notices[0].message, /^Opened .*Opened workflow/);
});

test('Open catches import exceptions without activating or persisting a workflow', async () => {
    const fixture = await openEnvironment({ text: async () => 'unreadable package' });
    fixture.env.importGraph = () => { throw new Error('Import failed'); };
    await assert.doesNotReject(fixture.choose());
    assert.equal(fixture.env.current, fixture.original);
    assert.deepEqual(fixture.stored.graphs, { original: fixture.original });
    assert.deepEqual(fixture.changes, []);
    assert.deepEqual(fixture.notices, [{ message: 'Import failed', type: 'error' }]);
});

test('Open ignores a cancelled file picker without mutation or persistence', async () => {
    const fixture = await openEnvironment(null);
    await fixture.choose();
    assert.equal(fixture.env.current, fixture.original);
    assert.deepEqual(fixture.stored.graphs, { original: fixture.original });
    assert.deepEqual(fixture.changes, []);
    assert.deepEqual(fixture.notices, []);
});

test('Open rejects a stale file read before invoking the importer', async () => {
    let finish;
    const fixture = await openEnvironment({ text: () => new Promise(resolve => { finish = resolve; }) });
    const pending = fixture.choose();
    fixture.env.uiEpoch++;
    finish('{"workflow":"too late"}');
    await pending;
    assert.equal(fixture.env.current, fixture.original);
    assert.deepEqual(fixture.stored.graphs, { original: fixture.original });
    assert.deepEqual(fixture.changes, []);
    assert.deepEqual(fixture.notices, []);
});

test('Open suppresses a stale read rejection after the captured view changes', async () => {
    let reject;
    const fixture = await openEnvironment({ text: () => new Promise((_resolve, fail) => { reject = fail; }) });
    const pending = fixture.choose();
    fixture.env.uiEpoch++;
    reject(new Error('Obsolete file read failed'));
    await assert.doesNotReject(pending);
    assert.equal(fixture.env.current, fixture.original);
    assert.deepEqual(fixture.changes, []);
    assert.deepEqual(fixture.notices, []);
});

async function saveEnvironment() {
    const host = installMock();
    const graph = accepted(createLibraryWorkflow('scene-compass')).graph;
    graph.id = 'local-save-root'; graph.name = 'Local workflow';
    const stored = S.settings();
    stored.graphs[graph.id] = graph; stored.activeGraphId = graph.id;
    stored.nativeBindings.preGraphId = graph.id; stored.enabled = true;
    graph.roles.Analysis = { profileId: 'local-profile', model: 'role-model' };
    const bound = Object.values(graph.nodes).find(node => node.type === 'workflow');
    bound.profileId = 'node-profile'; bound.model = 'node-model';
    const prepared = accepted(prepareWorkspaceViews(graph));
    const session = accepted(createGraphViewSession({ root: graph, activationId: 'file-save', ...prepared }));
    accepted(session.openInstance(prepared.navigation[0].identity.instancePath));
    const notices = [];
    const env = {
        ...S, current: graph, graphViews: session, viewSaveTimer: null,
        clearTimeout() {}, setTimeout() { assert.fail('Explicit Save must flush immediately'); },
        canvas: { cancelGesture() { accepted(session.updateView({ camera: { x: 70, y: 90, zoom: 1.5 } })); } },
        toast: (message, type) => notices.push({ message, type }),
    };
    env.persistGraphViews = await controllerFunction('persistGraphViews', env);
    await installSaveTracking(env);
    return { env, host, graph, stored, session, notices, save: await controllerFunction('onSaveGraph', env) };
}

test('Save persists full local settings and retained views before reporting a host save request', async () => {
    const fixture = await saveEnvironment();
    const before = structuredClone(fixture.graph), activeKey = fixture.session.readEditor().view.key;
    let requested, finish;
    fixture.host.saveSettingsDebounced = function () {
        assert.equal(this, fixture.host, 'the host callback retains its context');
        requested = structuredClone(S.settings());
        return new Promise(resolve => { finish = resolve; });
    };
    const pending = fixture.save();
    assert.deepEqual(fixture.notices, [], 'feedback waits for a returned host promise');
    assert.deepEqual(requested.graphs['local-save-root'], before);
    assert.deepEqual(requested.nativeBindings, { preGraphId: 'local-save-root', postGraphId: null });
    assert.equal(requested.enabled, true);
    assert.equal(requested.activeGraphId, 'local-save-root');
    const views = requested.workspaceViews['local-save-root'];
    assert.equal(views.activeKey, activeKey);
    assert.deepEqual(views.views.find(view => view.identity.kind === 'instance').camera, { x: 70, y: 90, zoom: 1.5 });
    finish(); await pending;
    assert.deepEqual(fixture.graph, before);
    assert.equal(fixture.session.readEditor().view.key, activeKey);
    assert.equal(fixture.notices[0].type, 'info');
    assert.match(fixture.notices[0].message, /save requested.*SillyTavern/i);
});

test('Save reports an unavailable host callback without claiming a save request', async () => {
    const fixture = await saveEnvironment();
    delete fixture.host.saveSettingsDebounced;
    await assert.doesNotReject(fixture.save());
    assert.equal(fixture.notices.length, 1);
    assert.equal(fixture.notices[0].type, 'error');
    assert.match(fixture.notices[0].message, /save.*unavailable/i);
    assert.equal(fixture.stored.workspaceViews, undefined);
});

test('Save reports synchronous and asynchronous host errors without success feedback', async () => {
    for (const callback of [() => { throw new Error('Host save failed'); }, () => Promise.reject(new Error('Host save failed'))]) {
        const fixture = await saveEnvironment();
        const before = structuredClone(fixture.graph);
        fixture.host.saveSettingsDebounced = callback;
        await assert.doesNotReject(fixture.save());
        assert.deepEqual(fixture.notices, [{ message: 'Host save failed', type: 'error' }]);
        assert.deepEqual(fixture.graph, before);
    }
});

test('a delayed Save cannot replace the checkpoint of a newer successful Save', async () => {
    const fixture = await saveEnvironment();
    let finish;
    fixture.graph.description = 'First edit';
    fixture.host.saveSettingsDebounced = () => new Promise(resolve => { finish = resolve; });
    const first = fixture.save();
    fixture.graph.description = 'Latest saved edit';
    fixture.host.saveSettingsDebounced = () => {};
    await fixture.save();
    finish(); await first;
    assert.equal(fixture.env.hasUnsavedWorkflowChanges(fixture.graph), false);
});

test('saving through a graph tab clears the current workflow unsaved checkpoint', async () => {
    const fixture = await saveEnvironment();
    fixture.graph.description = 'Saved through graph tab';
    fixture.env.onSaveGraph = fixture.save;
    const saveView = await controllerFunction('onSaveGraphView', fixture.env);
    await saveView(fixture.session.readEditor().view.key);
    assert.equal(fixture.env.hasUnsavedWorkflowChanges(fixture.graph), false);
});

async function exportEnvironment() {
    const blobs = new Map(), downloads = [], revoked = [], later = [], notices = [];
    const env = {
        current: { id: 'whole-root', name: 'Whole workflow' }, Blob,
        exportGraph: () => null,
        URL: {
            createObjectURL(blob) { const url = 'blob:workflow-' + blobs.size; blobs.set(url, blob); return url; },
            revokeObjectURL(url) { revoked.push(url); },
        },
        setTimeout(callback) { later.push(callback); },
        document: { createElement(tag) {
            assert.equal(tag, 'a');
            return { click() { downloads.push({ file: this.download, blob: blobs.get(this.href) }); } };
        } },
        toast: (message, type) => notices.push({ message, type }),
    };
    env.downloadGraphViewJSON = await controllerFunction('downloadGraphViewJSON', env);
    await installSaveTracking(env);
    return { env, downloads, revoked, later, notices, export: await controllerFunction('onExportGraph', env) };
}

test('Export reports an unavailable workflow without downloading null data', async () => {
    const fixture = await exportEnvironment();
    assert.doesNotThrow(() => fixture.export());
    assert.equal(fixture.notices.length, 1);
    assert.equal(fixture.notices[0].type, 'error');
    assert.match(fixture.notices[0].message, /workflow.*available/i);
    assert.deepEqual(fixture.downloads, []);
});

test('Export reports a failed download click and still defers object URL cleanup', async () => {
    const fixture = await exportEnvironment();
    fixture.env.exportGraph = () => '{"portable":"workflow"}';
    fixture.env.document.createElement = () => ({ click() { throw new Error('Download failed'); } });
    assert.doesNotThrow(() => fixture.export());
    assert.deepEqual(fixture.notices, [{ message: 'Download failed', type: 'error' }]);
    assert.deepEqual(fixture.revoked, [], 'the object URL remains available until the queued cleanup');
    assert.equal(fixture.later.length, 1);
    fixture.later[0]();
    assert.deepEqual(fixture.revoked, ['blob:workflow-0']);
});

test('Export downloads the whole current root while a subgraph view is active', async () => {
    const workspace = await saveEnvironment();
    const fixture = await exportEnvironment();
    fixture.env.current = workspace.graph;
    fixture.env.graphViews = workspace.session;
    fixture.env.exportGraph = S.exportGraph;
    const before = structuredClone(workspace.graph), activeKey = workspace.session.readEditor().view.key;
    assert.equal(workspace.session.readEditor().view.identity.kind, 'instance');
    fixture.export();
    assert.deepEqual(fixture.notices, []);
    assert.equal(fixture.downloads.length, 1);
    assert.equal(fixture.downloads[0].file, 'Local_workflow.workflow.json');
    const exported = accepted(parseWorkflow(await fixture.downloads[0].blob.text()));
    assert.equal(exported.id, 'local-save-root');
    assert.deepEqual(Object.keys(exported.nodes).sort(), Object.keys(before.nodes).sort());
    assert.deepEqual(Object.keys(exported.definitions).sort(), Object.keys(before.definitions).sort());
    assert.equal(exported.roles.Analysis.profileId, null, 'portable export retains its binding-stripping semantics');
    assert.deepEqual(workspace.graph, before, 'portable export must not strip local source bindings');
    assert.equal(workspace.session.readEditor().view.key, activeKey);
    assert.deepEqual(fixture.revoked, []);
    fixture.later.forEach(callback => callback());
    assert.deepEqual(fixture.revoked, ['blob:workflow-0']);
});

async function newEnvironment() {
    const host = installMock();
    const original = S.createGraph('Original workflow');
    S.settings().activeGraphId = original.id;
    const changes = [];
    host.saveSettingsDebounced = () => changes.push('save');
    const env = {
        ...S, workflowCreationPhase, current: original, uiEpoch: 1, canvas: null, pendingNewWorkflow: null,
        workbench: { update() {} },
        setCanvasGraph: () => changes.push('canvas'), renderAll: () => changes.push('render'),
    };
    env.stillEditing = (graph, epoch) => env.current === graph && env.uiEpoch === epoch;
    await installSaveTracking(env);
    env.requestNewWorkflowChoice = await controllerFunction('requestNewWorkflowChoice', env);
    env.chooseNewWorkflow = await controllerFunction('chooseNewWorkflow', env);
    return { env, original, changes, create: await controllerFunction('onNewGraph', env) };
}

test('New Cancel preserves unsaved workflow edits without creating or saving a graph', async () => {
    const fixture = await newEnvironment();
    fixture.original.description = 'Unsaved edits';
    const pending = fixture.create();
    fixture.env.chooseNewWorkflow('cancel');
    await pending;
    assert.equal(fixture.env.current, fixture.original);
    assert.equal(S.allGraphs().length, 1);
    assert.equal(S.settings().activeGraphId, fixture.original.id);
    assert.deepEqual(fixture.changes, []);
});

test('New activates an untitled unified workflow without requesting a name', async () => {
    const fixture = await newEnvironment();
    await fixture.create();
    assert.equal(fixture.env.current.name, 'Untitled workflow');
    assert.equal(fixture.env.current.mode, 'native-unified'); assert.deepEqual(Object.values(fixture.env.current.nodes).map(n=>n.operation), ['on-send','generate-reply','review-publish']);
    assert.notEqual(fixture.env.current, fixture.original);
    assert.equal(S.resolveGraph().graph, fixture.env.current);
    assert.equal(S.allGraphs().length, 2);
    assert.deepEqual(fixture.changes, ['save', 'save', 'canvas', 'render']);
});

test('archived workflow export downloads the recovery copy and handles an empty archive without changing a workflow',async()=>{
 const calls=[],env={exportArchivedWorkflows:()=>'{"kind":"lattice-workflow-archive"}',downloadGraphViewJSON:(...args)=>calls.push(args),toast:(...args)=>calls.push(args)};
 const exportArchive=await controllerFunction('onExportArchivedWorkflows',env);assert.equal(exportArchive(),true);assert.deepEqual(calls[0],['{"kind":"lattice-workflow-archive"}','lattice-archived-workflows.json']);
 calls.length=0;env.exportArchivedWorkflows=()=>null;assert.equal(exportArchive(),false);assert.equal(calls.some(call=>call[1]==='lattice-archived-workflows.json'),false);
});
