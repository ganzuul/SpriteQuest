import assert from 'node:assert/strict';
import { test } from 'node:test';

const api = await import('../src/ui/graph-view-session.js').catch(() => ({}));
const root = { id: 'root/workflow', schema: 3, runtime: 2, mode: 'native-pre', nodes: {}, wires: {} };
const rootIdentity = { kind: 'root', workflowId: root.id };
const instance = path => ({ kind: 'instance', workflowId: root.id, instancePath: path });
const library = version => ({ kind: 'library', workflowId: root.id, definitionRef: { id: 'library/definition', version, semanticHash: 'hash-' + version } });
const entries = () => [
    { identity: instance(['a']), label: 'First instance', readOnly: false },
    { identity: instance(['a', 'nested']), label: 'Nested instance', readOnly: true },
    { identity: instance(['repeat']), label: 'Repeated definition', readOnly: true },
    { identity: library(1), label: 'Library revision 1', readOnly: true },
    { identity: library(2), label: 'Library revision 2', readOnly: true },
];
const cache = navigation => [rootIdentity, ...navigation.map(entry => entry.identity)].map(identity => ({
    identity,
    ...(identity.kind === 'root' ? {} : { definitionRef: identity.definitionRef ?? { id: 'same', version: 1, semanticHash: 'same-hash' } }),
    savedGraph: { mode: 'native-pre', nodes: { work: { id: 'work', type: 'workflow', targetTokens: 100 } }, wires: {} },
    effectiveNodes: { work: { id: 'work', type: 'workflow', targetTokens: 200 } },
    interface: [], ports: [],
}));
const accepted = result => { assert.equal(result.ok, true, JSON.stringify(result.error)); return result.data; };
const create = (options = {}) => {
    const navigation = options.navigation ?? entries();
    return accepted(api.createGraphViewSession({ root, activationId: 'activation-1', navigation, preparedViews: cache(navigation), ...options }));
};

// Navigation owns only editor presentation; the root request still sees its original reference and epoch.
test('cached editor navigation preserves externally owned root execution and separate presentation', async () => {
    assert.equal(typeof api.createGraphViewSession, 'function');
    const session = create();
    const rootEpoch = 7, capturedRoot = session.readRoot();
    let finish;
    const pending = new Promise(resolve => { finish = resolve; }).then(result => session.readRoot() === capturedRoot && rootEpoch === 7 ? result : null);
    const rootEditor = session.readEditor();
    accepted(session.openInstance(['a']));
    accepted(session.updateView({ camera: { x: 23, y: -4, zoom: 1.5 }, selection: { primary: { kind: 'node', id: 'work' }, multi: ['work'] } }));
    const childEditor = session.readEditor();
    assert.equal(childEditor.readOnly, false);
    assert.equal(childEditor.prepared.savedGraph.nodes.work.targetTokens, 100);
    assert.equal(childEditor.prepared.effectiveNodes.work.targetTokens, 200);
    assert.notEqual(childEditor.prepared, rootEditor.prepared);
    accepted(session.closeView());
    accepted(session.reopenView(instance(['a'])));
    assert.deepEqual(session.readEditor().view.camera, { x: 23, y: -4, zoom: 1.5 });
    assert.equal(session.readEditor().prepared, childEditor.prepared, 'view actions reuse the prepared cache');
    assert.equal(session.readRoot(), root);
    assert.equal(Object.isFrozen(root), false, 'the live root is private runtime data, never frozen by the UI cache');
    finish({ ok: true, text: 'accepted root completion' });
    assert.deepEqual(await pending, { ok: true, text: 'accepted root completion' });
});

// A path alone must not revive an obsolete editor after away/back, permission change or workbench close.
test('private editor continuations include activation and view epoch while library views stay readonly', () => {
    const session = create();
    accepted(session.openInstance(['a']));
    const token = session.captureEditorContext();
    assert.equal(session.isEditorContextCurrent(token), true);
    assert.deepEqual(session.readEditContext(), { activationId: 'activation-1', sessionId: 'activation-1:1', viewPath: ['a'], readOnly: false });
    accepted(session.updateView({ camera: { x: 1, y: 2, zoom: 1 } }));
    assert.equal(session.isEditorContextCurrent(token), true);
    accepted(session.focusView(rootIdentity));
    accepted(session.focusView(instance(['a'])));
    assert.equal(session.isEditorContextCurrent(token), false);
    assert.equal(session.isEditorContextCurrent({ ...session.captureEditorContext() }), false);
    assert.equal(create().isEditorContextCurrent(session.captureEditorContext()), false);
    accepted(session.openLibrary(library(1).definitionRef));
    const firstKey = session.readEditor().view.key;
    assert.equal(session.readEditor().readOnly, true);
    assert.equal(session.readEditContext().readOnly, true);
    assert.deepEqual(session.readEditContext().viewPath, []);
    assert.equal(Object.hasOwn(session.readEditContext(), 'runtimeAddress'), false);
    accepted(session.openLibrary(library(2).definitionRef));
    assert.notEqual(session.readEditor().view.key, firstKey);
    const libraryToken = session.captureEditorContext();
    session.deactivate();
    assert.equal(session.isEditorContextCurrent(libraryToken), false);
    assert.equal(session.readEditContext().readOnly, true);
    assert.equal(session.project().active, false);
    assert.equal(session.openInstance(['a']).ok, false, 'a closed session cannot reactivate through navigation');
});

// Corrupt presentation cannot prevent a valid root from running, and recovery must be visible.
test('corrupt persistence recovers visibly while current navigation and activation errors remain explicit', () => {
    const session = create({ persisted: { version: 99 }, initialCamera: { x: 44, y: 22, zoom: 0.8 } });
    assert.equal(session.readRoot(), root);
    assert.deepEqual(session.readEditor().view.camera, { x: 44, y: 22, zoom: 0.8 });
    assert.deepEqual(session.project().warnings.map(warning => warning.code), ['VIEW_PERSISTENCE']);
    const restored = create({ persisted: accepted(session.serialize()) });
    assert.deepEqual(restored.project().warnings, []);
    assert.deepEqual(restored.readEditor().view.camera, { x: 44, y: 22, zoom: 0.8 });
    assert.equal(api.createGraphViewSession({ root, activationId: '', navigation: entries(), preparedViews: cache(entries()) }).error.code, 'VIEW_ACTIVATION');
    assert.equal(api.createGraphViewSession({ root: null, activationId: 'valid', navigation: entries(), preparedViews: cache(entries()) }).error.code, 'VIEW_ROOT');
    assert.equal(api.createGraphViewSession({ root, activationId: 'valid', navigation: [{ identity: library(1), label: 'Unsafe', readOnly: false }], preparedViews: cache(entries()), persisted: { version: 99 } }).error.code, 'VIEW_NAVIGATION');
});

// Cached display values are detached plain data, and an incomplete cache cannot install the wrong graph.
test('cache admission requires exact complete identities and never invokes public DTO accessors', () => {
    const navigation = entries(), preparedViews = cache(navigation);
    const session = create({ navigation, preparedViews });
    preparedViews[0].savedGraph.nodes.work.targetTokens = 999;
    assert.equal(session.readEditor().prepared.savedGraph.nodes.work.targetTokens, 100);
    assert.ok(Object.isFrozen(session.readEditor().prepared.savedGraph.nodes.work));
    for (const invalid of [
        preparedViews.slice(1),
        [...preparedViews, preparedViews[0]],
        preparedViews.map((view, index) => index === 0 ? { ...view, identity: { ...view.identity, workflowId: 'foreign' } } : view),
        preparedViews.map(view => view.identity.kind === 'library' ? { ...view, readOnly: false } : view),
        preparedViews.map(view => view.identity.kind === 'library' ? { ...view, ports: [{ address: { workflowId: root.id, instancePath: [], nodeId: 'work', portId: 'out' }, direction: 'output', kind: 'text' }] } : view),
    ]) assert.equal(api.createGraphViewSession({ root, activationId: 'valid', navigation, preparedViews: invalid }).error.code, 'VIEW_CACHE');
    let reads = 0;
    const accessor = { ...preparedViews[0] };
    Object.defineProperty(accessor, 'savedGraph', { enumerable: true, get() { reads++; return {}; } });
    assert.equal(api.createGraphViewSession({ root, activationId: 'valid', navigation, preparedViews: [accessor, ...preparedViews.slice(1)] }).error.code, 'VIEW_CACHE');
    assert.equal(reads, 0);
});

// A refresh cannot change ownership or graph content while preserving a pending editor capability.
test('prepared refresh is atomic and only label-only refresh may preserve editor contexts', () => {
    const session = create();
    accepted(session.openInstance(['a', 'nested']));
    const token = session.captureEditorContext();
    const renamed = entries().map(entry => ({ ...entry, label: entry.identity.kind === 'instance' && entry.identity.instancePath.length === 1 ? 'Renamed parent' : entry.label }));
    accepted(session.replacePreparedViews({ navigation: renamed, preparedViews: cache(renamed) }, { invalidateEditor: false }));
    assert.equal(session.isEditorContextCurrent(token), true);
    assert.equal(session.readEditor().view.breadcrumbs[1].label, 'Renamed parent');
    const before = session.project(), beforeEditor = session.readEditor().prepared;
    const changed = cache(renamed); changed[2].effectiveNodes.work.targetTokens = 999;
    assert.equal(session.replacePreparedViews({ navigation: renamed, preparedViews: changed }, { invalidateEditor: false }).error.code, 'VIEW_CONTEXT_REQUIRED');
    assert.deepEqual(session.project(), before);
    assert.equal(session.readEditor().prepared, beforeEditor);
    const owned = renamed.map(entry => entry.identity.kind === 'instance' && entry.identity.instancePath.length === 2 ? { ...entry, readOnly: false } : entry);
    assert.equal(session.replacePreparedViews({ navigation: owned, preparedViews: cache(owned) }, { invalidateEditor: false }).error.code, 'VIEW_CONTEXT_REQUIRED');
    const invalidNav = renamed.map(entry => entry.identity.kind === 'library' ? { ...entry, readOnly: false } : entry);
    assert.equal(session.replacePreparedViews({ navigation: invalidNav, preparedViews: cache(invalidNav) }).error.code, 'VIEW_NAVIGATION');
    assert.equal(session.replacePreparedViews({ navigation: renamed, preparedViews: cache(renamed).slice(1) }).error.code, 'VIEW_CACHE');
    assert.deepEqual(session.project(), before);
    assert.equal(session.isEditorContextCurrent(token), true);
    accepted(session.replacePreparedViews({ navigation: owned, preparedViews: cache(owned) }));
    assert.equal(session.isEditorContextCurrent(token), false);
    assert.equal(session.readEditContext().readOnly, false);
    const ownedToken = session.captureEditorContext();
    const surviving = owned.filter(entry => entry.identity.kind !== 'instance' || entry.identity.instancePath.length !== 2);
    accepted(session.replacePreparedViews({ navigation: surviving, preparedViews: cache(surviving) }));
    assert.deepEqual(session.readEditContext().viewPath, ['a']);
    assert.equal(session.isEditorContextCurrent(ownedToken), false);
});

// Producer metadata may be larger than the presentation envelope; it is cached, not persisted or recapped.
test('valid large prepared metadata retains producer bounds and root identity changes expire editors', () => {
    const navigation = entries(), preparedViews = cache(navigation);
    preparedViews[0].savedGraph.nodes.work.note = 'x'.repeat(300000);
    const session = create({ navigation, preparedViews });
    assert.equal(session.readEditor().prepared.savedGraph.nodes.work.note.length, 300000);
    assert.equal(JSON.stringify(accepted(session.serialize())).includes('xxx'), false);
    const token = session.captureEditorContext();
    const oldId = root.id;
    try {
        root.id = 'replaced/root';
        assert.equal(session.isEditorContextCurrent(token), false);
        assert.equal(session.readEditContext().readOnly, true);
        assert.equal(session.openInstance(['a']).error.code, 'VIEW_ROOT_CHANGED');
    } finally { root.id = oldId; }
});
