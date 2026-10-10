import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { prepareWorkspaceViews, projectEditorDraw } from '../src/ui/workspace-preparation.js?v=0.27.0';
import { createGraphViewSession } from '../src/ui/graph-view-session.js?v=0.27.0';
import { projectPreparedWorkflow } from '../src/ui/workflow-surface.js?v=0.27.0';
import { siblingWorkflow, twoOutputWorkflow } from './fixtures/workflow-prepared-fixture.mjs';

const source = await readFile(new URL('../src/ui/controller.js', import.meta.url), 'utf8');
function actual(name, env) {
    const start = source.indexOf('function ' + name + '(');
    assert.ok(start >= 0, 'Actual controller function ' + name);
    const line = source.slice(start, source.indexOf('\n', start));
    const end = line.includes('} ') || line.endsWith('}') ? start + line.length : source.indexOf('\n}', start) + 2;
    return Function('env', 'with(env){' + source.slice(start, end) + ';return ' + name + ';}')(env);
}
function fixture(graph = siblingWorkflow(), path = ['second']) {
    let bindingReads = 0;
    const prepared = prepareWorkspaceViews(graph, { resolveBinding: () => { bindingReads++; return { ok: true, data: { profileId: 'local', model: 'test-model' } }; } });
    assert.equal(prepared.ok, true, JSON.stringify(prepared));
    const session = createGraphViewSession({ root: graph, activationId: 'context-menu', ...prepared.data }).data;
    if (path.length) assert.equal(session.openInstance(path).ok, true);
    const env = { current: graph, graphViews: session, workspacePrepared: prepared.data, editorDraw: projectEditorDraw(session.readEditor()),
        workspaceRevision: 0, workflowState: { busy: false }, pinnedPreview: null, selectedPreview: null,
        editorCaptures: new WeakMap(), isOpen: () => true, activeEditRoot: () => graph, projectPreparedWorkflow,
        updateWorkflowProjection() {}, workbench: { revealPreview() {} }, applyPreviewReview() {}, rejectPreviewReview() {},
    };
    for (const name of ['captureEditor', 'editorCurrent']) env[name] = actual(name, env);
    const start = source.indexOf('const outputPreviewActions = {'), end = source.indexOf('\n};', start) + 3;
    env.outputPreviewActions = Function('env', 'with(env){' + source.slice(start, end) + ';return outputPreviewActions;}')(env);
    env.canvasPreviewMenuItems = actual('canvasPreviewMenuItems', env);
    const token = env.captureEditor(true).data;
    return { env, token, session, bindingReads: () => bindingReads };
}

test('context preview pin captures the clicked instance rather than an identically named sibling', () => {
    const f = fixture(), count = f.bindingReads();
    const items = f.env.canvasPreviewMenuItems(f.env.editorDraw.nodes.work, f.token);
    const pin = items.find(item => item.id === 'pin-preview');
    assert.ok(pin); pin.action();
    assert.deepEqual(f.env.pinnedPreview, { workflowId: 'prepared-root', instancePath: ['second'], nodeId: 'work', portId: 'out' });
    for (let i = 0; i < 4; i++) f.env.canvasPreviewMenuItems(f.env.editorDraw.nodes.work, f.token);
    assert.equal(f.bindingReads(), count, 'menu building uses cached summaries and never re-resolves model bindings');
});

test('a wrapper with several outputs pins the explicitly chosen port', () => {
    const f = fixture(twoOutputWorkflow(), []);
    const items = f.env.canvasPreviewMenuItems(f.env.editorDraw.nodes.wrapper, f.token);
    const pin = items.find(item => item.id === 'pin-preview');
    assert.ok(pin?.children);
    assert.deepEqual(pin.children.map(item => item.label), ['First', 'Second']);
    pin.children[1].action();
    assert.deepEqual(f.env.pinnedPreview, { workflowId: 'two-output-root', instancePath: [], nodeId: 'wrapper', portId: 'second' });
});

test('Run to here rechecks busy state before dispatching the captured qualified target', () => {
    const f = fixture();
    let launched = null;
    f.env.workflowSession = { run({ target }) { launched = target; } };
    const run = f.env.canvasPreviewMenuItems(f.env.editorDraw.nodes.work, f.token).find(item => item.id === 'run-to-here');
    assert.ok(run); assert.equal(run.disabled, false);
    f.env.workflowState.busy = true; run.action();
    assert.equal(launched, null);
    f.env.workflowState.busy = false; run.action();
    assert.deepEqual(launched, { workflowId: 'prepared-root', instancePath: ['second'], nodeId: 'work', portId: 'out' });
});
