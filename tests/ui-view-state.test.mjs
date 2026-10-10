import assert from 'node:assert/strict';
import { test } from 'node:test';

const api = await import('../src/ui/view-state.js').catch(() => ({}));
const workflowId = 'root/workflow';
const root = { kind: 'root', workflowId };
const instance = instancePath => ({ kind: 'instance', workflowId, instancePath });
const library = (version = 1, semanticHash = 'hash') => ({ kind: 'library', workflowId, definitionRef: { id: 'same/definition', version, semanticHash } });
const navigation = () => [
    { identity: instance(['a/b']), label: 'Alias one' },
    { identity: instance(['a']), label: 'Alias parent' },
    { identity: instance(['a', 'b']), label: 'Alias nested' },
    { identity: instance(['repeat']), label: 'Same definition again' },
    { identity: library(), label: 'Library one' },
];
const store = options => api.createViewState({ workflowId, navigation: navigation(), ...options });
const active = view => view.project().active;
const accepted = result => { assert.equal(result.ok, true, JSON.stringify(result)); return result.data; };

test('root names refresh tabs and breadcrumbs while retaining presentation and editor context', () => {
    const view = store({ rootLabel: 'Story graph' });
    assert.ok(view);
    assert.equal(active(view).label, 'Story graph');
    accepted(view.openInstance(['a', 'b']));
    accepted(view.updateView({ camera: { x: 18, y: -4, zoom: 1.5 } }));
    const context = view.captureContext(), key = active(view).key;
    accepted(view.replaceNavigation(navigation(), { rootLabel: 'Renamed graph' }));
    assert.equal(view.project().tabs[0].label, 'Renamed graph');
    assert.deepEqual(active(view).breadcrumbs.map(crumb => crumb.label), ['Renamed graph', 'Alias parent', 'Alias nested']);
    assert.equal(active(view).key, key);
    assert.deepEqual(active(view).camera, { x: 18, y: -4, zoom: 1.5 });
    assert.equal(view.isContextCurrent(context), true);
    accepted(view.replaceNavigation(navigation()));
    assert.equal(view.project().tabs[0].label, 'Renamed graph', 'A child label refresh retains the root name');
    const restored = store({ rootLabel: 'Reloaded name', persisted: accepted(view.serialize()) });
    assert.equal(restored.project().tabs[0].label, 'Reloaded name');
    assert.equal(active(restored).breadcrumbs[0].label, 'Reloaded name');
});

test('root labels normalize whitespace and keep long or absent graph names navigable', () => {
    assert.equal(active(store({ rootLabel: '  Named graph  ' })).label, 'Named graph');
    assert.equal(active(store({ rootLabel: 'x'.repeat(300) })).label, 'x'.repeat(256));
    for (const rootLabel of [undefined, null, '', '   ', 42]) assert.equal(active(store({ rootLabel })).label, 'Graph 1');
});

test('qualified group positions persist locally without changing current navigation authority', () => {
    const view = store(), before = active(view).key;
    const position = { collapsed: true, x: 13.5, y: -9, frame: { x: 13.5, y: -9, w: 260, h: 140 } };
    accepted(view.updateView({ groupPresentation: { group: position } }));
    assert.equal(active(view).key, before);
    const restored = store({ persisted: accepted(view.serialize()) });
    assert.deepEqual(active(restored).groupPresentation.group, position);
    assert.equal(view.updateView({ groupPresentation: { group: { x: Infinity } } }).ok, false);
    assert.equal(view.updateView({ groupPresentation: { group: { frame: { x: 0, y: 0, w: -1, h: 2 } } } }).ok, false);
});

// Joining path IDs or using definition IDs would merge unrelated editor state.
test('deduplicates exact structural paths while separating repeated instances and library pins', () => {
    assert.equal(typeof api.createViewState, 'function');
    const view = store();
    assert.equal(active(view).label, 'Graph 1');
    assert.equal(view.closeView(root).ok, false, 'the main graph remains open');
    accepted(view.openInstance(['a/b']));
    const first = active(view).key;
    accepted(view.openInstance(['a', 'b']));
    assert.notEqual(active(view).key, first);
    accepted(view.openInstance(['a/b']));
    assert.equal(active(view).key, first);
    accepted(view.openInstance(['repeat']));
    accepted(view.openLibrary(library().definitionRef));
    assert.equal(view.project().tabs.length, 5);
    assert.equal(active(view).readOnly, true);
    assert.notEqual(api.viewIdentityKey(library(1)), api.viewIdentityKey(library(2)));
    assert.notEqual(api.viewIdentityKey(library(1, 'hash')), api.viewIdentityKey(library(1, 'other')));
    assert.notEqual(api.viewIdentityKey(instance(['a'])), api.viewIdentityKey({ ...instance(['a']), workflowId: 'another' }));
});

// Discarding a closed view or sharing presentation through a definition loses local view state.
test('close and reopen retain independent camera selection inspector and node presentation', () => {
    const view = store();
    accepted(view.openInstance(['a/b']));
    accepted(view.updateView({ camera: { x: 12, y: -20, zoom: 1.75 }, selection: { primary: { kind: 'node', id: 'work' }, multi: ['work'] }, inspector: { item: { kind: 'node', id: 'work' }, section: 'details', open: true }, nodePresentation: { work: { alias: 'Local alias', compact: true, x: 40, y: 50 } } }));
    accepted(view.openInstance(['repeat']));
    assert.deepEqual(active(view).camera, { x: 0, y: 0, zoom: 1 });
    assert.deepEqual(active(view).selection, { primary: null, multi: [] });
    assert.deepEqual(active(view).nodePresentation, {});
    accepted(view.closeView(instance(['a/b'])));
    assert.equal(view.project().closedViews.length, 1);
    accepted(view.reopenView(instance(['a/b'])));
    assert.deepEqual(active(view).camera, { x: 12, y: -20, zoom: 1.75 });
    assert.deepEqual(active(view).selection, { primary: { kind: 'node', id: 'work' }, multi: ['work'] });
    assert.equal(active(view).inspector.section, 'details');
    assert.equal(active(view).nodePresentation.work.alias, 'Local alias');
    assert.ok(Object.isFrozen(active(view).camera), 'projection cannot mutate retained state');
});

// Looking up aliases by a separator path or retaining deleted navigation revives the wrong tab.
test('cached navigation refreshes breadcrumbs and deleted descendants reveal the nearest surviving parent', () => {
    const view = store();
    accepted(view.openInstance(['a', 'b']));
    assert.deepEqual(active(view).breadcrumbs.map(crumb => crumb.label), ['Graph 1', 'Alias parent', 'Alias nested']);
    const renamed = navigation().map(entry => ({ ...entry, label: entry.label === 'Alias parent' ? 'Renamed parent' : entry.label }));
    accepted(view.replaceNavigation(renamed));
    assert.deepEqual(active(view).breadcrumbs.map(crumb => crumb.label), ['Graph 1', 'Renamed parent', 'Alias nested']);
    accepted(view.revealParent());
    assert.deepEqual(active(view).identity.instancePath, ['a']);
    accepted(view.openInstance(['a', 'b']));
    accepted(view.replaceNavigation(renamed.filter(entry => entry.identity.kind !== 'instance' || entry.identity.instancePath.length !== 2)));
    assert.deepEqual(active(view).identity.instancePath, ['a']);
    assert.equal(view.reopenView(instance(['a', 'b'])).ok, false);
    assert.equal(view.project().tabs.some(tab => tab.identity.kind === 'instance' && tab.identity.instancePath.length === 2), false);
    accepted(view.replaceNavigation([]));
    assert.equal(active(view).identity.kind, 'root');
    assert.equal(view.project().tabs.length, 1);
    assert.deepEqual(active(view).breadcrumbs, [], 'main view has no redundant header');
});

// A captured path alone becomes valid again after switching away and back.
test('view context epochs permanently expire continuations on focus close removal and explicit invalidation', () => {
    const view = store();
    accepted(view.openInstance(['a/b']));
    const first = view.captureContext();
    assert.equal(view.isContextCurrent(first), true);
    accepted(view.updateView({ camera: { x: 1, y: 2, zoom: 1 } }));
    assert.equal(view.isContextCurrent(first), true, 'camera changes preserve an editor context');
    accepted(view.focusView(root));
    accepted(view.focusView(instance(['a/b'])));
    assert.equal(view.isContextCurrent(first), false);
    const second = view.captureContext();
    accepted(view.closeView());
    accepted(view.reopenView(instance(['a/b'])));
    assert.equal(view.isContextCurrent(second), false);
    const third = view.captureContext();
    accepted(view.invalidateContext());
    assert.equal(view.isContextCurrent(third), false);
    const fourth = view.captureContext();
    accepted(view.replaceNavigation([]));
    assert.equal(view.isContextCurrent(fourth), false);
    assert.equal(view.isContextCurrent({ ...view.captureContext() }), false, 'foreign continuation tokens are not adopted');
});

// Library data cannot grant editing, and saved permissions cannot override prepared ownership.
test('library inspection never grants editing while validated child navigation supplies the permission', () => {
    assert.equal(store({ navigation: [{ identity: library(), label: 'Bad library', readOnly: false }] }), null);
    const view = store({ navigation: [{ identity: instance(['a']), label: 'Private copy', readOnly: false }] });
    accepted(view.openInstance(['a']));
    assert.equal(active(view).readOnly, false);
    const continuation = view.captureContext();
    accepted(view.replaceNavigation([{ identity: instance(['a']), label: 'Pinned again' }]));
    assert.equal(active(view).readOnly, true);
    assert.equal(view.isContextCurrent(continuation), false, 'ownership changes expire editor continuations');
});

// Restoring a shared definition or saved readOnly bit would lose instance isolation and grant authority.
test('bounded persistence restores closed independent views and trusts only current navigation permissions', () => {
    const view = store({ navigation: navigation().map(entry => entry.identity.kind === 'instance' ? { ...entry, readOnly: false } : entry) });
    accepted(view.openInstance(['a/b']));
    accepted(view.updateView({ camera: { x: 9, y: 10, zoom: 2 }, nodePresentation: { work: { alias: 'One', compact: true } } }));
    accepted(view.closeView());
    accepted(view.openInstance(['repeat']));
    accepted(view.updateView({ selection: { primary: { kind: 'wire', id: 'wire/one' }, multi: [] } }));
    const persisted = accepted(view.serialize());
    assert.equal(new TextEncoder().encode(JSON.stringify(persisted)).length <= 262144, true);
    const serialized = JSON.stringify(persisted);
    for (const forbidden of ['readOnly', 'breadcrumbs', 'label', 'recording', 'authority', 'snapshot']) assert.equal(serialized.includes('"' + forbidden + '"'), false);
    const reloaded = store({ persisted, initialCamera: { x: 100, y: 100, zoom: 0.5 } });
    assert.deepEqual(active(reloaded).identity.instancePath, ['repeat']);
    assert.equal(active(reloaded).selection.primary.id, 'wire/one');
    assert.equal(active(reloaded).readOnly, true);
    assert.equal(reloaded.project().closedViews.length, 1);
    accepted(reloaded.reopenView(instance(['a/b'])));
    assert.deepEqual(active(reloaded).camera, { x: 9, y: 10, zoom: 2 });
    assert.equal(active(reloaded).nodePresentation.work.alias, 'One');
    assert.equal(active(reloaded).readOnly, true);
    assert.deepEqual(reloaded.project().tabs[0].camera, { x: 0, y: 0, zoom: 1 }, 'saved root state takes priority over the compatibility fallback');
    assert.equal(reloaded.isContextCurrent(view.captureContext()), false, 'continuations never survive a store reload');
});

// Old saved graph.view values must not produce nonfinite transforms or change the shipped zoom range.
test('current initial root camera normalizes finite pan and clamps zoom without affecting new child views', () => {
    for (const [initialCamera, want] of [
        [{ x: 30, y: -50, zoom: 100 }, { x: 30, y: -50, zoom: 2.5 }],
        [{ x: 30, y: -50, zoom: 0.1 }, { x: 30, y: -50, zoom: 0.25 }],
        [{ x: Infinity, y: NaN, zoom: 'bad' }, { x: 0, y: 0, zoom: 1 }],
    ]) assert.deepEqual(active(store({ initialCamera })).camera, want);
    const view = store({ initialCamera: { x: 30, y: -50, zoom: 2 } });
    accepted(view.openInstance(['a']));
    assert.deepEqual(active(view).camera, { x: 0, y: 0, zoom: 1 });
});

// A rejected update must not partially move the camera or retain semantic/private data.
test('malformed and oversized presentation updates reject atomically with a visible limit result', () => {
    const view = store();
    const before = view.project();
    for (const patch of [
        { camera: { x: 1, y: 2, zoom: NaN } },
        { camera: { x: 1, y: 2, zoom: 1 }, nodePresentation: { node: { model: 'private' } } },
        { selection: { primary: { kind: 'node', id: 'a' }, multi: ['a'], recording: {} } },
        { inspector: { item: null, section: '', open: true, authority: true } },
        { nodePresentation: { node: { alias: 'a'.repeat(81) } } },
        { recording: { artifact: 'unbounded' } },
    ]) {
        assert.equal(view.updateView(patch).ok, false);
        assert.deepEqual(view.project(), before);
    }
    const nodePresentation = Object.fromEntries(Array.from({ length: 1000 }, (_, index) => ['node-' + index, { alias: '🦊'.repeat(40), compact: true, x: 1, y: 2 }]));
    accepted(view.updateView({ nodePresentation }));
    accepted(view.openInstance(['repeat']));
    const beforeLimit = accepted(view.serialize());
    const rejected = view.updateView({ nodePresentation });
    assert.equal(rejected.ok, false);
    assert.equal(rejected.error.code, 'VIEW_LIMIT');
    assert.deepEqual(accepted(view.serialize()), beforeLimit);
    assert.equal(new TextEncoder().encode(JSON.stringify(beforeLimit)).length <= 262144, true);
});

// Accessors, custom prototypes and ambiguous paths must not run code or partially replace navigation.
test('untrusted view DTOs reject without invoking getters and navigation replacement remains atomic', () => {
    let reads = 0;
    const getter = Object.defineProperty({}, 'label', { enumerable: true, get() { reads++; return 'unsafe'; } });
    getter.identity = instance(['a']);
    assert.equal(store({ navigation: [getter] }), null);
    assert.equal(reads, 0);
    const view = store();
    const patch = Object.defineProperty({}, 'camera', { enumerable: true, get() { reads++; return { x: 1, y: 2, zoom: 1 }; } });
    assert.equal(view.updateView(patch).ok, false);
    assert.equal(reads, 0);
    const before = view.project();
    for (const entries of [
        [{ identity: instance(['missing', 'child']), label: 'No parent' }],
        [{ identity: { ...instance(['a']), workflowId: 'foreign' }, label: 'Wrong root' }],
        [{ identity: instance(Array(9).fill('deep')), label: 'Too deep' }],
        [navigation()[0], navigation()[0]],
        [Object.assign(Object.create({ readOnly: false }), navigation()[0])],
    ]) {
        assert.equal(view.replaceNavigation(entries).ok, false);
        assert.deepEqual(view.project(), before);
    }
    assert.equal(api.viewIdentityKey({ ...instance(['a']), instancePath: ['a', ''] }), null);
    assert.equal(api.createViewState({ workflowId, navigation: [], authority: true }), null);
    assert.equal(api.viewIdentityKey({ kind: 'instance', workflowId, instancePath: new Array(1) }), null);
    const revoked = Proxy.revocable({}, {}); revoked.revoke();
    assert.equal(view.isContextCurrent(revoked.proxy), false);
    assert.equal(api.createViewState({ workflowId: 'x'.repeat(262145), navigation: [] }), null);
});

// Corrupt persistence cannot install duplicate paths, a foreign root or a closed permanent root.
test('malformed persistence is rejected and deleted saved descendants reconcile without restoring foreign data', () => {
    const view = store();
    accepted(view.openInstance(['a', 'b']));
    const persisted = accepted(view.serialize());
    const reloaded = store({ persisted, navigation: navigation().filter(entry => entry.identity.kind !== 'instance' || entry.identity.instancePath.length !== 2) });
    assert.deepEqual(active(reloaded).identity.instancePath, ['a']);
    const reordered = store({ persisted: { ...persisted, views: [...persisted.views].reverse() } });
    assert.equal(reordered.project().tabs[0].identity.kind, 'root', 'Graph 1 remains the main tab after restoring reordered data');
    for (const bad of [
        { ...persisted, version: 2 },
        { ...persisted, workflowId: 'foreign' },
        { ...persisted, views: [...persisted.views, persisted.views[0]] },
        { ...persisted, views: persisted.views.map(entry => entry.identity.kind === 'root' ? { ...entry, open: false } : entry) },
        { ...persisted, views: persisted.views.map(entry => ({ ...entry, readOnly: false })) },
        { ...persisted, views: persisted.views.map(entry => ({ ...entry, camera: { x: 1, y: 2, zoom: Infinity } })) },
    ]) assert.equal(store({ persisted: bad }), null);
});

// Rebuilding unrelated view DTOs on a camera tick would make Svelte reconsider every node overlay.
test('camera actions preserve stable frozen selection inspector and node presentation snapshots', () => {
    const view = store();
    accepted(view.openInstance(['a/b']));
    accepted(view.updateView({ nodePresentation: { work: { alias: 'Keep mounted', compact: true } } }));
    const before = active(view);
    const context = view.captureContext();
    accepted(view.updateView({ camera: { x: 10, y: 20, zoom: 1.2 } }));
    const after = active(view);
    assert.equal(after.selection, before.selection);
    assert.equal(after.inspector, before.inspector);
    assert.equal(after.nodePresentation, before.nodePresentation);
    assert.equal(view.isContextCurrent(context), true);
    assert.deepEqual(before.camera, { x: 0, y: 0, zoom: 1 });
    assert.ok(Object.isFrozen(after.nodePresentation.work));
});

// The byte and retained-view limits must permit reloading every state they accepted in memory.
test('a thousand bounded nested instance views reload and an extra retained view rejects atomically', () => {
    const many = [{ identity: instance(['p']), label: 'Parent' }, ...Array.from({ length: 1000 }, (_, index) => ({ identity: instance(['p', String(index)]), label: 'Child ' + index }))];
    const view = store({ navigation: many });
    accepted(view.openInstance(['p']));
    for (let index = 0; index < 999; index++) accepted(view.openInstance(['p', String(index)]));
    const saved = accepted(view.serialize());
    assert.equal(saved.views.length, 1001);
    assert.equal(new TextEncoder().encode(JSON.stringify(saved)).length <= 262144, true);
    const reloaded = store({ navigation: many, persisted: saved });
    assert.ok(reloaded, 'admitted bounded states reload');
    assert.equal(reloaded.project().tabs.length, 1001);
    assert.equal(view.openInstance(['p', '999']).error.code, 'VIEW_LIMIT');
    assert.deepEqual(accepted(view.serialize()), saved);
});

test('Details width survives graph focus, close/reopen and restore without accepting unsafe persistence', () => {
    const view = store();
    accepted(view.updateView({ inspector: { item: null, section: '', open: true, width: 400 } }));
    accepted(view.openInstance(['a/b']));
    accepted(view.updateView({ inspector: { item: null, section: '', open: true, width: 300 } }));
    accepted(view.closeView()); assert.equal(active(view).inspector.width, 400);
    accepted(view.reopenView(instance(['a/b']))); assert.equal(active(view).inspector.width, 300);
    const persisted = accepted(view.serialize()), restored = store({ persisted }); assert.equal(active(restored).inspector.width, 300);
    const before = JSON.stringify(accepted(view.serialize()));
    for (const width of [219, 521, Infinity, NaN, '300']) assert.equal(view.updateView({ inspector: { item: null, section: '', open: true, width } }).ok, false);
    assert.equal(JSON.stringify(accepted(view.serialize())), before);
    const legacy = { ...persisted, views: persisted.views.map(entry => { const { width, ...inspector } = entry.inspector; return { ...entry, inspector }; }) };
    assert.ok(store({ persisted: legacy }), 'existing inspector persistence remains readable');
});
