import assert from 'node:assert/strict';
import test from 'node:test';
import { createViewState, viewIdentityKey } from '../src/ui/view-state.js';

const api = await import('../src/ui/subgraph-view-state.js').catch(() => ({}));
const workflowId = 'workflow/id';
const identity = instancePath => ({ kind: 'instance', workflowId, instancePath });
const libraryIdentity = { kind: 'library', workflowId, definitionRef: { id: 'library', version: 1, semanticHash: 'library-hash' } };
const accepted = result => { assert.equal(result.ok, true, JSON.stringify(result.error)); return result.data; };
const navigation = paths => [...paths.map(path => ({ identity: identity(path), label: path.at(-1), readOnly: false })), { identity: libraryIdentity, label: 'Library', readOnly: true }];
const oldPaths = [['parent'], ['parent', 'chosen'], ['parent', 'chosen', 'nested'], ['parent', 'sibling'], ['chosen']];
const newPaths = [['parent'], ['parent', 'extracted'], ['parent', 'extracted', 'chosen'], ['parent', 'extracted', 'chosen', 'nested'], ['parent', 'sibling'], ['chosen']];
const state = (paths, persisted) => createViewState({ workflowId, navigation: navigation(paths), ...(persisted ? { persisted } : {}) });
const row = (serialized, path) => serialized.views.find(view => viewIdentityKey(view.identity) === viewIdentityKey(identity(path)));

function fixture() {
    const session = state(oldPaths);
    accepted(session.updateView({ camera: { x: 5, y: 10, zoom: 1.2 } }));
    accepted(session.openInstance(['parent', 'chosen']));
    accepted(session.updateView({ camera: { x: 70, y: -25, zoom: 1.4 }, selection: { primary: { kind: 'node', id: 'work' }, multi: ['work', 'other'] },
        inspector: { item: { kind: 'node', id: 'work' }, section: 'details', open: false, width: 360 },
        nodePresentation: { work: { alias: 'Visible', compact: true, x: 40, y: 60 } },
        groupPresentation: { group: { collapsed: true, x: 20, y: 10, frame: { x: 10, y: 5, w: 600, h: 320 } } },
        portalPresentation: { publisher: { identity: identity(['parent', 'chosen']), definitionRef: { id: 'selected', version: 1, semanticHash: 'selected-hash' }, source: { nodeId: 'work', portId: 'out' }, label: 'Local portal' } } }));
    accepted(session.openInstance(['parent', 'chosen', 'nested']));
    accepted(session.updateView({ camera: { x: -20, y: 90, zoom: 0.75 }, nodePresentation: { child: { alias: 'Nested' } }, selection: { primary: { kind: 'wire', id: 'wire' }, multi: [] } }));
    accepted(session.closeView());
    accepted(session.openInstance(['chosen'])); accepted(session.updateView({ nodePresentation: { unrelated: { alias: 'Root sibling' } } }));
    accepted(session.openLibrary(libraryIdentity.definitionRef)); accepted(session.updateView({ camera: { x: 11, y: 22, zoom: 1.1 } }));
    accepted(session.openInstance(['parent', 'sibling'])); accepted(session.updateView({ nodePresentation: { sibling: { alias: 'Keep me' } } }));
    return { session, serialized: accepted(session.serialize()) };
}

test('capture relocates only retained selected descendants and their exact portal identities', () => {
    assert.equal(typeof api.captureRelocatedSubgraphViews, 'function');
    const { serialized } = fixture(), original = structuredClone(serialized);
    const captured = api.captureRelocatedSubgraphViews(serialized, ['parent'], ['chosen'], 'extracted');
    assert.deepEqual(captured.before, [row(serialized, ['parent', 'chosen']), row(serialized, ['parent', 'chosen', 'nested'])]);
    assert.deepEqual(captured.after.map(view => view.identity.instancePath), [['parent', 'extracted', 'chosen'], ['parent', 'extracted', 'chosen', 'nested']]);
    assert.deepEqual(captured.after[0].portalPresentation.publisher.identity, identity(['parent', 'extracted', 'chosen']));
    assert.deepEqual(captured.after[0].portalPresentation.publisher.source, { nodeId: 'work', portId: 'out' });
    assert.deepEqual(captured.after[0].camera, { x: 70, y: -25, zoom: 1.4 });
    assert.equal(captured.after[0].open, true); assert.equal(captured.after[1].open, false);
    captured.after[0].nodePresentation.work.alias = 'Changed copy';
    assert.equal(captured.before[0].nodePresentation.work.alias, 'Visible'); assert.deepEqual(serialized, original);
    assert.deepEqual(api.captureRelocatedSubgraphViews(serialized, ['missing'], ['chosen'], 'extracted'), { before: [], after: [] });
});

test('capture compares structural parent path segments when IDs contain separators', () => {
    assert.equal(typeof api.captureRelocatedSubgraphViews, 'function');
    const session = state([['a/b'], ['a/b', 'chosen'], ['a'], ['a', 'b'], ['a', 'b', 'chosen']]);
    accepted(session.openInstance(['a/b', 'chosen'])); accepted(session.openInstance(['a', 'b', 'chosen']));
    const captured = api.captureRelocatedSubgraphViews(accepted(session.serialize()), ['a/b'], ['chosen'], 'wrapper');
    assert.deepEqual(captured.before.map(view => view.identity.instancePath), [['a/b', 'chosen']]);
    assert.deepEqual(captured.after.map(view => view.identity.instancePath), [['a/b', 'wrapper', 'chosen']]);
});

test('restoration retains open and closed descendants, complete presentation and unrelated active tabs', () => {
    assert.equal(typeof api.restoreSubgraphViews, 'function'); assert.equal(typeof api.captureRelocatedSubgraphViews, 'function');
    const { serialized } = fixture(), snapshots = api.captureRelocatedSubgraphViews(serialized, ['parent'], ['chosen'], 'extracted').after;
    const session = state(newPaths, serialized), before = accepted(session.serialize());
    accepted(session.openInstance(['parent', 'extracted', 'chosen', 'nested']));
    accepted(session.updateView({ camera: { x: 0, y: 0, zoom: 1 }, nodePresentation: {}, groupPresentation: { stale: { collapsed: true } },
        portalPresentation: { stale: { identity: identity(['parent', 'extracted', 'chosen', 'nested']), source: { nodeId: 'stale', portId: 'out' }, label: 'Stale' } } }));
    accepted(session.focusView(before.activeKey));
    const result = api.restoreSubgraphViews(session, snapshots); accepted(result);
    const restored = accepted(session.serialize());
    assert.equal(restored.activeKey, before.activeKey);
    assert.deepEqual(row(restored, ['parent', 'extracted', 'chosen']), snapshots[0]);
    assert.deepEqual(row(restored, ['parent', 'extracted', 'chosen', 'nested']), { ...snapshots[1], groupPresentation: {}, portalPresentation: {} });
    for (const view of before.views) assert.deepEqual(restored.views.find(item => viewIdentityKey(item.identity) === viewIdentityKey(view.identity)), view, 'unrelated tabs retain their exact presentation');
    const persisted = state(newPaths, restored); assert.ok(persisted, 'portal aliases still belong to the relocated identity after reload');
    assert.deepEqual(row(accepted(persisted.serialize()), ['parent', 'extracted', 'chosen']).portalPresentation, snapshots[0].portalPresentation);
    assert.deepEqual(api.restoreSubgraphViews(session, []), { ok: true, data: { restoredCount: 0 } });
});

test('restoration rejects unavailable paths safely and preserves the current active view on batch failure', () => {
    assert.equal(typeof api.restoreSubgraphViews, 'function');
    const { serialized } = fixture(), session = state(oldPaths, serialized), before = accepted(session.serialize());
    const missing = structuredClone(row(serialized, ['parent', 'chosen'])); missing.identity = identity(['missing']);
    const rejected = api.restoreSubgraphViews(session, [missing]);
    assert.equal(rejected.ok, false); assert.equal(rejected.error.code, 'VIEW_UNAVAILABLE'); assert.deepEqual(accepted(session.serialize()), before);
    const valid = structuredClone(row(serialized, ['parent', 'chosen'])); valid.camera.x = 88;
    const partial = api.restoreSubgraphViews(session, [valid, missing]);
    assert.equal(partial.ok, false); assert.equal(accepted(session.serialize()).activeKey, before.activeKey);
    assert.deepEqual(row(accepted(session.serialize()), ['parent', 'sibling']), row(before, ['parent', 'sibling']));
});

test('undo refresh rebases the latest relocated presentation and tab state without mutating snapshots', () => {
    assert.equal(typeof api.refreshRelocatedSubgraphViews, 'function');
    const { serialized } = fixture(), effect = api.captureRelocatedSubgraphViews(serialized, ['parent'], ['chosen'], 'extracted');
    const original = structuredClone(effect), session = state(newPaths, serialized);
    accepted(api.restoreSubgraphViews(session, effect.after));
    accepted(session.openInstance(['parent', 'extracted', 'chosen']));
    accepted(session.updateView({ camera: { x: -130, y: 200, zoom: 0.8 }, selection: { primary: { kind: 'group', id: 'group' }, multi: ['other'] },
        inspector: { item: { kind: 'group', id: 'group' }, section: 'presentation', open: true, width: 420 },
        nodePresentation: { work: { alias: 'Edited after extraction', compact: false, x: 90, y: -35 } },
        groupPresentation: { group: { collapsed: false, frame: { x: -100, y: -80, w: 700, h: 400 } } },
        portalPresentation: { publisher: { identity: identity(['parent', 'extracted', 'chosen']), source: { nodeId: 'work', portId: 'out' }, label: 'Edited portal' } } }));
    accepted(session.closeView());
    accepted(session.openInstance(['parent', 'extracted', 'chosen', 'nested'])); accepted(session.updateView({ nodePresentation: { child: { alias: 'Reopened nested', compact: true } } }));
    const current = accepted(session.serialize()), savedCurrent = structuredClone(current), refreshed = api.refreshRelocatedSubgraphViews(effect, current, 'undo');
    assert.deepEqual(refreshed.after[0], row(current, ['parent', 'extracted', 'chosen']));
    assert.deepEqual(refreshed.after[1], row(current, ['parent', 'extracted', 'chosen', 'nested']));
    assert.deepEqual(refreshed.before[0].identity, identity(['parent', 'chosen']));
    assert.deepEqual(refreshed.before[0].portalPresentation.publisher.identity, identity(['parent', 'chosen']));
    assert.equal(refreshed.before[0].portalPresentation.publisher.label, 'Edited portal');
    assert.deepEqual(refreshed.before[0].camera, { x: -130, y: 200, zoom: 0.8 });
    assert.deepEqual(refreshed.before[0].nodePresentation.work, { alias: 'Edited after extraction', compact: false, x: 90, y: -35 });
    assert.deepEqual(refreshed.before[0].groupPresentation, refreshed.after[0].groupPresentation);
    assert.deepEqual(refreshed.before[0].selection, refreshed.after[0].selection); assert.deepEqual(refreshed.before[0].inspector, refreshed.after[0].inspector);
    assert.equal(refreshed.before[0].open, false); assert.equal(refreshed.before[1].open, true);
    assert.equal(refreshed.before[1].nodePresentation.child.alias, 'Reopened nested');
    refreshed.before[0].nodePresentation.work.alias = 'Detached';
    assert.equal(refreshed.after[0].nodePresentation.work.alias, 'Edited after extraction');
    assert.deepEqual(effect, original); assert.deepEqual(current, savedCurrent);
});

test('redo refresh preserves edits at original paths and retains pairs whose source view is absent', () => {
    assert.equal(typeof api.refreshRelocatedSubgraphViews, 'function');
    const { serialized, session } = fixture(), effect = api.captureRelocatedSubgraphViews(serialized, ['parent'], ['chosen'], 'extracted');
    accepted(session.openInstance(['parent', 'chosen']));
    accepted(session.updateView({ camera: { x: 250, y: -60, zoom: 1.8 }, nodePresentation: { work: { alias: '', compact: false, x: -75, y: 115 } },
        portalPresentation: { publisher: { identity: identity(['parent', 'chosen']), source: { nodeId: 'work', portId: 'out' }, label: 'Edited before redo' } } }));
    accepted(session.closeView());
    const current = accepted(session.serialize()), original = structuredClone(effect), refreshed = api.refreshRelocatedSubgraphViews(effect, current, 'redo');
    assert.deepEqual(refreshed.before[0], row(current, ['parent', 'chosen']));
    assert.deepEqual(refreshed.after[0].identity, identity(['parent', 'extracted', 'chosen']));
    assert.deepEqual(refreshed.after[0].portalPresentation.publisher.identity, identity(['parent', 'extracted', 'chosen']));
    assert.equal(refreshed.after[0].portalPresentation.publisher.label, 'Edited before redo');
    assert.deepEqual(refreshed.after[0].camera, { x: 250, y: -60, zoom: 1.8 });
    assert.deepEqual(refreshed.after[0].nodePresentation.work, { alias: '', compact: false, x: -75, y: 115 }); assert.equal(refreshed.after[0].open, false);
    const pruned = { ...current, views: current.views.filter(view => viewIdentityKey(view.identity) !== viewIdentityKey(identity(['parent', 'chosen', 'nested']))) };
    const missing = api.refreshRelocatedSubgraphViews(effect, pruned, 'redo');
    assert.deepEqual(missing.before[1], original.before[1]); assert.deepEqual(missing.after[1], original.after[1]);
    assert.deepEqual(effect, original);
});

test('undo discovers views opened after extraction when no initial descendant snapshots existed', () => {
    assert.equal(typeof api.refreshRelocatedSubgraphViews, 'function');
    const source = state(oldPaths), effect = { ...api.captureRelocatedSubgraphViews(accepted(source.serialize()), ['parent'], ['chosen'], 'extracted'),
        relocation: { parentPath: ['parent'], selectedIds: ['chosen'], instanceId: 'extracted' } };
    assert.deepEqual(effect.before, []); assert.deepEqual(effect.after, []);
    const session = state(newPaths), original = structuredClone(effect);
    accepted(session.openInstance(['parent', 'extracted', 'chosen', 'nested']));
    accepted(session.updateView({ camera: { x: 310, y: -20, zoom: 1.6 }, nodePresentation: { child: { alias: 'Opened later', compact: true, x: 45, y: 75 } },
        portalPresentation: { publisher: { identity: identity(['parent', 'extracted', 'chosen', 'nested']), source: { nodeId: 'child', portId: 'out' }, label: 'Later portal' } } }));
    accepted(session.closeView());
    accepted(session.openInstance(['chosen'])); accepted(session.updateView({ nodePresentation: { unrelated: { alias: 'Unrelated' } } }));
    const current = accepted(session.serialize()), refreshed = api.refreshRelocatedSubgraphViews(effect, current, 'undo');
    assert.equal(refreshed.before.length, 1); assert.equal(refreshed.after.length, 1);
    assert.deepEqual(refreshed.after[0], row(current, ['parent', 'extracted', 'chosen', 'nested']));
    assert.deepEqual(refreshed.before[0].identity, identity(['parent', 'chosen', 'nested']));
    assert.deepEqual(refreshed.before[0].portalPresentation.publisher.identity, identity(['parent', 'chosen', 'nested']));
    assert.deepEqual(refreshed.before[0].camera, { x: 310, y: -20, zoom: 1.6 });
    assert.equal(refreshed.before[0].nodePresentation.child.alias, 'Opened later'); assert.equal(refreshed.before[0].open, false);
    const restored = state(oldPaths); accepted(api.restoreSubgraphViews(restored, refreshed.before));
    assert.equal(row(accepted(restored.serialize()), ['parent', 'chosen', 'nested']).nodePresentation.child.alias, 'Opened later');
    refreshed.before[0].nodePresentation.child.alias = 'Changed copy';
    assert.equal(refreshed.after[0].nodePresentation.child.alias, 'Opened later'); assert.deepEqual(effect, original);
});

test('refresh adds newly retained deeper descendants to existing pairs without duplicates', () => {
    assert.equal(typeof api.refreshRelocatedSubgraphViews, 'function');
    const { serialized } = fixture(), effect = { ...api.captureRelocatedSubgraphViews(serialized, ['parent'], ['chosen'], 'extracted'),
        relocation: { parentPath: ['parent'], selectedIds: ['chosen'], instanceId: 'extracted' } };
    const paths = [...newPaths, ['parent', 'extracted', 'chosen', 'nested', 'deep']], session = state(paths, serialized);
    accepted(api.restoreSubgraphViews(session, effect.after));
    accepted(session.openInstance(['parent', 'extracted', 'chosen', 'nested', 'deep']));
    accepted(session.updateView({ camera: { x: -70, y: 120, zoom: 0.65 }, selection: { primary: { kind: 'node', id: 'deep-work' }, multi: ['deep-work'] }, nodePresentation: { 'deep-work': { alias: 'Deep edit' } } }));
    const current = accepted(session.serialize()), refreshed = api.refreshRelocatedSubgraphViews(effect, current, 'undo');
    assert.equal(refreshed.before.length, 3); assert.equal(refreshed.after.length, 3);
    assert.deepEqual(refreshed.before[2].identity.instancePath, ['parent', 'chosen', 'nested', 'deep']);
    assert.deepEqual(refreshed.after[2], row(current, ['parent', 'extracted', 'chosen', 'nested', 'deep']));
    assert.deepEqual(refreshed.before[2].camera, { x: -70, y: 120, zoom: 0.65 });
    const repeated = api.refreshRelocatedSubgraphViews({ ...refreshed, relocation: effect.relocation }, current, 'undo');
    assert.equal(repeated.before.length, 3); assert.equal(repeated.after.length, 3);
    assert.deepEqual(repeated, refreshed);
});

test('redo discovers newly retained original paths and inserts only the structural wrapper segment', () => {
    assert.equal(typeof api.refreshRelocatedSubgraphViews, 'function');
    const paths = [['a/b'], ['a/b', 'chosen'], ['a/b', 'chosen', 'nested'], ['a'], ['a', 'b'], ['a', 'b', 'chosen']];
    const session = state(paths), effect = { before: [], after: [], relocation: { parentPath: ['a/b'], selectedIds: ['chosen'], instanceId: 'wrapper' } };
    accepted(session.openInstance(['a/b', 'chosen', 'nested']));
    accepted(session.updateView({ nodePresentation: { work: { alias: 'Before redo', compact: false, x: 20, y: 30 } },
        portalPresentation: { publisher: { identity: identity(['a/b', 'chosen', 'nested']), source: { nodeId: 'work', portId: 'out' }, label: 'Before portal' } } }));
    accepted(session.openInstance(['a', 'b', 'chosen']));
    const current = accepted(session.serialize()), refreshed = api.refreshRelocatedSubgraphViews(effect, current, 'redo');
    assert.equal(refreshed.before.length, 1); assert.equal(refreshed.after.length, 1);
    assert.deepEqual(refreshed.before[0], row(current, ['a/b', 'chosen', 'nested']));
    assert.deepEqual(refreshed.after[0].identity.instancePath, ['a/b', 'wrapper', 'chosen', 'nested']);
    assert.deepEqual(refreshed.after[0].portalPresentation.publisher.identity, identity(['a/b', 'wrapper', 'chosen', 'nested']));
    assert.deepEqual(refreshed.after[0].nodePresentation.work, { alias: 'Before redo', compact: false, x: 20, y: 30 });
    assert.equal(Object.hasOwn(refreshed, 'relocation'), false, 'only snapshot pairs are returned');
});
