import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { installMock } from './mock.js';
installMock();
const S = await import('../src/state.js?v=0.26.0');

async function openController(env) {
    const source = await readFile(new URL('../src/ui/controller.js', import.meta.url), 'utf8');
    const start = source.indexOf('function onOpenExample(');
    assert.ok(start >= 0, 'The real controller must open a bundled example');
    const end = source.indexOf('\nfunction ', start + 1);
    return Function('env', 'with(env){' + source.slice(start, end < 0 ? undefined : end) + ';return onOpenExample;}')(env);
}

async function catalogController(env) {
    const source = await readFile(new URL('../src/ui/controller.js', import.meta.url), 'utf8');
    const start = source.indexOf('function refreshExampleCatalog(');
    assert.ok(start >= 0, 'Example discovery must isolate catalog failures from canvas initialization');
    const end = source.indexOf('\nfunction ', start + 1);
    return Function('env', 'with(env){' + source.slice(start, end < 0 ? undefined : end) + ';return refreshExampleCatalog;}')(env);
}

test('a catalog failure leaves the workspace available and a later retry restores its tiles', async () => {
    const updates = [], notices = [], tiles = [{ id: 'unified-guidance-prose-notes', title: 'Guide, revise and annotate a scene' }];
    let fail = true;
    const env = {
        projectWorkflowExamples() { if (fail) throw new Error('Broken catalog'); return tiles; },
        workbench: { update: value => updates.push(value) },
        toast: (message, type) => notices.push({ message, type }),
    };
    const refresh = await catalogController(env);
    assert.equal(refresh(), false);
    assert.match(updates.at(-1).examplesIssue, /Broken catalog/);
    assert.equal(notices.at(-1).type, 'error');
    fail = false;
    assert.equal(refresh(), true);
    assert.deepEqual(updates.at(-1), { examples: tiles, examplesIssue: '' });
});

test('opening an example persists its real editable root without changing existing workflows or workflow assignment', async () => {
    const original = S.createGraph('Original example test workflow');
    const stored = S.settings();
    stored.activeGraphId = original.id;
    stored.enabled = true;
    stored.nativeBindings = { workflowGraphId: original.id };
    const before = structuredClone({ original, bindings: stored.nativeBindings });
    const notices = [], frames = [];
    let saves = 0, fitted = 0;
    const env = {
        current: original, uiEpoch: 1, settings: S.settings,
        save: () => saves++,
        setCanvasGraph() { assert.equal(stored.activeGraphId, env.current.id); env.uiEpoch++; },
        renderAll() {},
        requestAnimationFrame: callback => frames.push(callback),
        stillEditing: (graph, epoch) => env.current === graph && env.uiEpoch === epoch,
        graphViews: { readEditor: () => ({ view: { identity: { kind: 'root' } } }) },
        canvas: { fit() { fitted++; } },
        toast: (message, type) => notices.push({ message, type }),
    };
    const open = await openController(env);
    const { installWorkflowExample } = await import('../src/workflow/examples.js?v=0.26.0');
    env.installWorkflowExample = installWorkflowExample;
    assert.equal(open('unified-guidance-prose-notes'), true);
    assert.notEqual(env.current.id, original.id);
    assert.equal(env.current.name, 'Guide, revise and annotate a scene');
    assert.equal(stored.activeGraphId, env.current.id);
    assert.equal(S.resolveGraph().graph, env.current);
    assert.equal(env.current.mode,'native-unified');
    assert.ok(Object.values(env.current.nodes).some(node=>node.operation==='review-publish'));
    assert.deepEqual(stored.graphs[original.id], before.original);
    assert.deepEqual(stored.nativeBindings, before.bindings);
    assert.equal(stored.enabled, true);
    assert.equal(saves, 1);
    assert.equal(notices.at(-1).type, 'success');
    while (frames.length) frames.shift()();
    assert.equal(fitted, 1);
});

test('opening an example does not fit a child tab entered before layout settles', async () => {
    const original = S.createGraph('Example fit owner');
    const frames = [];
    let viewKind = 'root';
    const { installWorkflowExample } = await import('../src/workflow/examples.js?v=0.26.0');
    const env = {
        current: original, uiEpoch: 1, settings: S.settings, installWorkflowExample,
        save() {}, setCanvasGraph() { env.uiEpoch++; }, renderAll() {}, toast() {},
        requestAnimationFrame: callback => frames.push(callback),
        stillEditing: (graph, epoch) => env.current === graph && env.uiEpoch === epoch,
        graphViews: { readEditor: () => ({ view: { identity: { kind: viewKind } } }) },
        canvas: { fit() { assert.fail('The pending fit belongs only to the newly opened root'); } },
    };
    assert.equal((await openController(env))('unified-continuity-warnings'), true);
    viewKind = 'instance';
    while (frames.length) frames.shift()();
});

test('an unavailable example leaves the current workflow and saved workspace untouched', async () => {
    const original = S.createGraph('Failed example open original'), stored = S.settings();
    stored.activeGraphId = original.id;
    const before = structuredClone(stored), notices = [];
    const { installWorkflowExample } = await import('../src/workflow/examples.js?v=0.26.0');
    const env = {
        current: original, settings: S.settings, installWorkflowExample,
        save() { assert.fail('Failed opening cannot save'); },
        setCanvasGraph() { assert.fail('Failed opening cannot activate another root'); },
        renderAll() { assert.fail('Failed opening cannot redraw another root'); },
        toast: (message, type) => notices.push({ message, type }),
    };
    assert.equal((await openController(env))('missing-example'), false);
    assert.equal(env.current, original);
    assert.deepEqual(stored, before);
    assert.equal(notices.length, 1); assert.equal(notices[0].type, 'error');
});
