import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createViewState, viewIdentityKey } from '../src/ui/view-state.js';
import * as presentation from '../src/ui/comment-presentation.js';

const identity = () => ({ kind: 'instance', workflowId: 'root', instancePath: ['child'] });
const view = (nodePresentation = {}) => ({ identity: identity(), key: viewIdentityKey(identity()), nodePresentation });

test('capture retains exact view identity and only selected coordinate presence and values', () => {
    assert.equal(typeof presentation.captureCommentPresentation, 'function');
    const source = view({ first: { x: 50, y: 80, alias: 'Keep alias', compact: true }, second: { y: -10 }, unrelated: { x: 700, y: 900 } });
    const before = structuredClone(source);
    const effect = presentation.captureCommentPresentation(source, ['first', 'second', 'absent', 'first']);
    assert.deepEqual(effect, { viewKey: '["instance","root",["child"]]', identity: identity(), coordinates: { first: { x: 50, y: 80 }, second: { y: -10 }, absent: {} } });
    assert.deepEqual(source, before);
    source.identity.instancePath[0] = 'different'; source.nodePresentation.first.x = 900;
    assert.deepEqual(effect.identity, identity()); assert.equal(effect.coordinates.first.x, 50);
});

test('redo clears only captured coordinates and drops empty records while preserving current aliases', () => {
    assert.equal(typeof presentation.applyCommentPresentation, 'function');
    const effect = presentation.captureCommentPresentation(view({ first: { x: 50, y: 80 }, second: { x: 90, y: 100 } }), ['first', 'second']);
    const source = { first: { x: 50, y: 80, alias: 'New alias', compact: false }, second: { x: 90, y: 100 }, unrelated: { x: -5, y: 70, alias: 'Unrelated' } };
    const before = structuredClone(source), beforeEffect = structuredClone(effect);
    const cleared = presentation.applyCommentPresentation(source, effect, 'redo');
    assert.deepEqual(cleared, { first: { alias: 'New alias', compact: false }, unrelated: { x: -5, y: 70, alias: 'Unrelated' } });
    assert.notEqual(cleared, source); assert.notEqual(cleared.unrelated, source.unrelated);
    assert.deepEqual(source, before); assert.deepEqual(effect, beforeEffect);
});

test('undo restores mixed coordinate presence while retaining aliases and compact edits made later', () => {
    const effect = presentation.captureCommentPresentation(view({ both: { x: 0, y: -80 }, xOnly: { x: 10 }, yOnly: { y: 20 } }), ['both', 'xOnly', 'yOnly', 'neither']);
    const current = { both: { alias: 'Current alias', compact: false }, xOnly: { x: 700, y: 900, compact: true }, yOnly: { x: 800, y: 1000 }, neither: { x: 300, y: 400, alias: 'Keep' }, unrelated: { x: 9, alias: 'Stay' } };
    const before = structuredClone(current);
    const restored = presentation.applyCommentPresentation(current, effect, 'undo');
    assert.deepEqual(restored, { both: { alias: 'Current alias', compact: false, x: 0, y: -80 }, xOnly: { compact: true, x: 10 }, yOnly: { y: 20 }, neither: { alias: 'Keep' }, unrelated: { x: 9, alias: 'Stay' } });
    assert.deepEqual(current, before);
});

test('effects for the same authored positions retain independent overlays and exact view addresses', () => {
    const firstView = view({ node: { x: 100, y: 200 } }), secondView = view({ node: { x: 600, y: 800 } });
    const first = presentation.captureCommentPresentation(firstView, ['node']);
    const second = presentation.captureCommentPresentation(secondView, ['node']);
    const thirdView = { ...view({ node: { x: 150, y: 250 } }), identity: { kind: 'instance', workflowId: 'root', instancePath: ['other'] } };
    thirdView.key = viewIdentityKey(thirdView.identity);
    const third = presentation.captureCommentPresentation(thirdView, ['node']);
    const current = { node: { alias: 'Keep alias' } };
    assert.deepEqual(presentation.applyCommentPresentation(current, second, 'undo'), { node: { alias: 'Keep alias', x: 600, y: 800 } });
    assert.deepEqual(presentation.applyCommentPresentation(current, first, 'undo'), { node: { alias: 'Keep alias', x: 100, y: 200 } });
    assert.deepEqual(presentation.applyCommentPresentation(current, third, 'undo'), { node: { alias: 'Keep alias', x: 150, y: 250 } });
    assert.notEqual(third.viewKey, first.viewKey);
    assert.deepEqual(first.coordinates.node, { x: 100, y: 200 });
    assert.deepEqual(second.coordinates.node, { x: 600, y: 800 });
});

test('capture and apply reject malformed view addresses instead of matching invalid null keys', () => {
    assert.equal(presentation.captureCommentPresentation({ ...view(), key: 'different' }, []), null);
    assert.equal(presentation.captureCommentPresentation({ ...view(), identity: { kind: 'instance', workflowId: 'root', instancePath: ['constructor'] }, key: '["instance","root",["constructor"]]' }, []), null);
    assert.equal(presentation.applyCommentPresentation({ node: { x: 10 } }, { viewKey: null, identity: {}, coordinates: { node: {} } }, 'redo'), null);
    const effect = presentation.captureCommentPresentation(view({ node: { x: 10 } }), ['node']);
    assert.equal(presentation.applyCommentPresentation({}, { ...effect, viewKey: 'different' }, 'undo'), null);
    assert.equal(presentation.applyCommentPresentation({}, effect, 'unknown'), null);
});

test('safe node IDs matching Object prototype names restore into owned plain records', () => {
    const effect = presentation.captureCommentPresentation(view({ valueOf: { x: 25, y: 50 } }), ['valueOf']);
    const prototypeMethod = Object.prototype.valueOf;
    const originalDescriptors = Object.getOwnPropertyDescriptors(prototypeMethod);
    try {
        const restored = presentation.applyCommentPresentation({}, effect, 'undo');
        assert.deepEqual(restored, { valueOf: { x: 25, y: 50 } });
        assert.deepEqual(Object.getOwnPropertyDescriptors(prototypeMethod), originalDescriptors);
    } finally {
        for (const axis of ['x', 'y']) {
            if (Object.hasOwn(originalDescriptors, axis)) Object.defineProperty(prototypeMethod, axis, originalDescriptors[axis]);
            else delete prototypeMethod[axis];
        }
    }
});

test('undo rejects a derived table exceeding the existing 1000-node view patch limit', () => {
    const current = Object.fromEntries(Array.from({ length: 1000 }, (_, index) => ['current' + index, { alias: 'Retained' }]));
    const effect = presentation.captureCommentPresentation(view({ restored: { x: 30 } }), ['restored']);
    const before = structuredClone(current);
    assert.equal(presentation.applyCommentPresentation(current, effect, 'undo') === null, true);
    assert.deepEqual(current, before);
});

test('capture rejects a combined effect exceeding the view UTF-8 byte budget', () => {
    const longIdentity = { kind: 'root', workflowId: 'workflow' + 'a'.repeat(4000) };
    const source = { identity: longIdentity, key: viewIdentityKey(longIdentity), nodePresentation: {} };
    const ids = Array.from({ length: 1000 }, (_, index) => 'node' + index + 'b'.repeat(250));
    assert.ok(new TextEncoder().encode(JSON.stringify(ids)).length < 262144);
    assert.ok(new TextEncoder().encode(JSON.stringify(source)).length < 262144);
    assert.equal(presentation.captureCommentPresentation(source, ids) === null, true);
});

test('unsafe IDs non-presentation fields and accessors reject without callback execution or mutation', () => {
    const source = view({ node: { x: 10, y: 20, alias: 'Keep' } }), before = structuredClone(source);
    const effect = presentation.captureCommentPresentation(source, ['node']);
    for (const ids of [['__proto__'], ['constructor'], [12], null, Array(2), Array.from({ length: 1001 }, (_, index) => 'node' + index)]) assert.equal(presentation.captureCommentPresentation(source, ids), null);
    for (const node of [{ x: Infinity }, { compact: 'true' }, { alias: 'a'.repeat(81) }, { operation: 'smart-compactor' }, { w: 200 }]) {
        assert.equal(presentation.captureCommentPresentation(view({ node }), ['node']), null);
        assert.equal(presentation.applyCommentPresentation({ node }, effect, 'undo'), null);
    }
    for (const coordinates of [{ node: { alias: 'Overwrite' } }, { node: { x: '10' } }, { node: { y: NaN } }, JSON.parse('{"__proto__":{"x":50}}')]) assert.equal(presentation.applyCommentPresentation(source.nodePresentation, { ...effect, coordinates }, 'undo'), null);
    let reads = 0;
    const hostileView = { ...source, get nodePresentation() { reads++; throw new Error('Do not inspect'); } };
    const hostileNode = { get x() { reads++; throw new Error('Do not inspect'); } };
    const hostileEffect = { get coordinates() { reads++; throw new Error('Do not inspect'); } };
    assert.equal(presentation.captureCommentPresentation(hostileView, ['node']), null);
    assert.equal(presentation.captureCommentPresentation(view({ node: hostileNode }), ['node']), null);
    assert.equal(presentation.applyCommentPresentation({ node: hostileNode }, effect, 'undo'), null);
    assert.equal(presentation.applyCommentPresentation(source.nodePresentation, hostileEffect, 'undo'), null);
    assert.equal(presentation.captureCommentPresentation({ ...source, callback: () => { reads++; } }, ['node']), null);
    assert.equal(reads, 0); assert.deepEqual(source, before);
});

test('derived patches apply to the existing view store and round-trip without changing camera or aliases', () => {
    const navigation = [{ identity: identity(), label: 'Child', readOnly: false }];
    const store = createViewState({ workflowId: 'root', navigation });
    assert.equal(store.openInstance(['child']).ok, true);
    assert.equal(store.updateView({ camera: { x: 15, y: -20, zoom: 1.5 }, nodePresentation: { node: { x: 60, y: 90, alias: 'Local', compact: true }, unrelated: { x: 700, y: 900 } } }).ok, true);
    const before = store.project().active;
    const effect = presentation.captureCommentPresentation(before, ['node']);
    const cleared = presentation.applyCommentPresentation(before.nodePresentation, effect, 'redo');
    assert.equal(store.updateView({ nodePresentation: cleared }, effect.viewKey).ok, true);
    assert.deepEqual(store.project().active.nodePresentation.node, { alias: 'Local', compact: true });
    const restored = presentation.applyCommentPresentation(store.project().active.nodePresentation, effect, 'undo');
    assert.equal(store.updateView({ nodePresentation: restored }, effect.viewKey).ok, true);
    assert.deepEqual(store.project().active.nodePresentation, before.nodePresentation);
    assert.deepEqual(store.project().active.camera, before.camera);
    const loaded = createViewState({ workflowId: 'root', navigation, persisted: store.serialize().data });
    assert.deepEqual(loaded.project().active.nodePresentation, before.nodePresentation);
});

test('mixed capture retains detached selected group coordinate and frame presence with exact view identity', () => {
    const source = { ...view({ node: { x: 50, y: 80, alias: 'Keep alias' } }), groupPresentation: { both: { collapsed: true, x: 10, y: 20, frame: { x: 1, y: 2, w: 260, h: 140 } }, yOnly: { y: 30 }, frameOnly: { frame: { x: 3, y: 4, w: 300, h: 200 } }, unrelated: { collapsed: false, x: 900 } } };
    const before = structuredClone(source);
    const effect = presentation.captureCommentPresentation(source, ['node'], ['both', 'yOnly', 'frameOnly', 'absent', 'both']);
    assert.deepEqual(effect, { viewKey: source.key, identity: identity(), coordinates: { node: { x: 50, y: 80 } }, groupCoordinates: { both: { x: 10, y: 20, frame: { x: 1, y: 2, w: 260, h: 140 } }, yOnly: { y: 30 }, frameOnly: { frame: { x: 3, y: 4, w: 300, h: 200 } }, absent: {} } });
    assert.deepEqual(source, before);
    source.groupPresentation.both.frame.x = 900;
    assert.equal(effect.groupCoordinates.both.frame.x, 1);
    assert.deepEqual(presentation.applyCommentPresentation(source.nodePresentation, effect, 'redo'), { node: { alias: 'Keep alias' } });
});

test('group redo clears affected geometry and preserves current collapse state and unrelated groups', () => {
    assert.equal(typeof presentation.applyCommentGroupPresentation, 'function');
    const effect = presentation.captureCommentPresentation({ ...view(), groupPresentation: { group: { x: 50, y: 80, frame: { x: 40, y: 60, w: 260, h: 140 } } } }, [], ['group', 'empty']);
    const current = { group: { collapsed: false, x: 90, y: 100, frame: { x: 80, y: 90, w: 280, h: 160 } }, empty: { x: 20 }, unrelated: { collapsed: true, x: 700, frame: { x: 700, y: 900, w: 300, h: 200 } } };
    const before = structuredClone(current), beforeEffect = structuredClone(effect);
    const next = presentation.applyCommentGroupPresentation(current, effect, 'redo');
    assert.deepEqual(next, { group: { collapsed: false }, unrelated: before.unrelated });
    assert.notEqual(next.unrelated.frame, current.unrelated.frame);
    assert.deepEqual(current, before); assert.deepEqual(effect, beforeEffect);
    assert.deepEqual(presentation.applyCommentGroupPresentation(current, presentation.captureCommentPresentation(view(), []), 'redo'), current);
});

test('group undo restores exact mixed geometry presence while preserving later collapse changes', () => {
    const effect = presentation.captureCommentPresentation({ ...view(), groupPresentation: { both: { x: 0, y: -80, frame: { x: -5, y: -90, w: 260, h: 140 } }, xOnly: { x: 10 }, frameOnly: { frame: { x: 5, y: 6, w: 200, h: 120 } } } }, [], ['both', 'xOnly', 'frameOnly', 'neither']);
    const current = { both: { collapsed: false }, xOnly: { x: 700, y: 900, frame: { x: 700, y: 900, w: 300, h: 200 }, collapsed: true }, frameOnly: { x: 5, y: 6 }, neither: { x: 300, y: 400, collapsed: true }, unrelated: { x: 9 } };
    const before = structuredClone(current);
    const restored = presentation.applyCommentGroupPresentation(current, effect, 'undo');
    assert.deepEqual(restored, { both: { collapsed: false, x: 0, y: -80, frame: { x: -5, y: -90, w: 260, h: 140 } }, xOnly: { collapsed: true, x: 10 }, frameOnly: { frame: { x: 5, y: 6, w: 200, h: 120 } }, neither: { collapsed: true }, unrelated: { x: 9 } });
    assert.deepEqual(current, before);
});

test('mixed node and group patches round-trip through the existing native view store', () => {
    const navigation = [{ identity: identity(), label: 'Child', readOnly: false }], store = createViewState({ workflowId: 'root', navigation });
    assert.equal(store.openInstance(['child']).ok, true);
    assert.equal(store.updateView({ nodePresentation: { node: { x: 60, y: 90, alias: 'Keep' } }, groupPresentation: { group: { collapsed: true, x: 120, y: 130, frame: { x: 100, y: 110, w: 300, h: 200 } }, unrelated: { collapsed: false } } }).ok, true);
    const before = store.project().active, effect = presentation.captureCommentPresentation(before, ['node'], ['group']);
    const patch = direction => ({ nodePresentation: presentation.applyCommentPresentation(store.project().active.nodePresentation, effect, direction), groupPresentation: presentation.applyCommentGroupPresentation(store.project().active.groupPresentation, effect, direction) });
    assert.equal(store.updateView(patch('redo'), effect.viewKey).ok, true);
    assert.deepEqual(store.project().active.groupPresentation, { group: { collapsed: true }, unrelated: { collapsed: false } });
    assert.equal(store.updateView(patch('undo'), effect.viewKey).ok, true);
    const loaded = createViewState({ workflowId: 'root', navigation, persisted: store.serialize().data });
    assert.deepEqual(loaded.project().active.groupPresentation, before.groupPresentation);
    assert.deepEqual(loaded.project().active.nodePresentation, before.nodePresentation);
});

test('group helpers reject unknown fields invalid rectangles unsafe IDs and accessors without reads', () => {
    const source = { ...view(), groupPresentation: { group: { x: 10, frame: { x: 0, y: 0, w: 20, h: 30 } } } }, effect = presentation.captureCommentPresentation(source, [], ['group']);
    for (const ids of [null, ['constructor'], ['__proto__'], [42], Array(2), Array(1001).fill('group')]) assert.equal(presentation.captureCommentPresentation(source, [], ids), null);
    for (const group of [{}, { x: Infinity }, { collapsed: 'yes' }, { alias: 'No' }, { frame: { x: 0, y: 0, w: 0, h: 10 } }, { frame: { x: 0, y: 0, w: 20 } }, { frame: { x: 0, y: 0, w: 20, h: 30, title: 'No' } }]) {
        assert.equal(presentation.captureCommentPresentation({ ...view(), groupPresentation: { group } }, [], ['group']), null);
        assert.equal(presentation.applyCommentGroupPresentation({ group }, effect, 'undo'), null);
    }
    for (const groupCoordinates of [{ group: { collapsed: true } }, { group: { x: '10' } }, { group: { frame: { x: 0, y: 0, w: 0, h: 30 } } }, JSON.parse('{"__proto__":{"x":50}}')]) {
        const invalid = { ...effect, groupCoordinates };
        assert.equal(presentation.applyCommentGroupPresentation({}, invalid, 'undo'), null);
        assert.equal(presentation.applyCommentPresentation({}, invalid, 'undo'), null);
    }
    assert.equal(presentation.applyCommentGroupPresentation({}, { ...effect, viewKey: 'wrong' }, 'undo'), null);
    let reads = 0;
    const hostile = { get frame() { reads++; throw Error('Do not read'); } };
    assert.equal(presentation.captureCommentPresentation({ ...view(), groupPresentation: { group: hostile } }, [], ['group']), null);
    assert.equal(presentation.applyCommentGroupPresentation({ group: hostile }, effect, 'undo'), null);
    assert.equal(presentation.applyCommentGroupPresentation({}, { ...effect, groupCoordinates: { group: hostile } }, 'undo'), null);
    assert.equal(reads, 0);
});

test('group effects obey row and combined byte limits without mutating the current table', () => {
    const current = Object.fromEntries(Array.from({ length: 1000 }, (_, i) => ['current' + i, { collapsed: true }]));
    const source = { ...view(), groupPresentation: { restored: { x: 30 } } }, effect = presentation.captureCommentPresentation(source, [], ['restored']), before = structuredClone(current);
    assert.equal(presentation.applyCommentGroupPresentation(current, effect, 'undo'), null);
    assert.deepEqual(current, before);
    assert.equal(presentation.captureCommentPresentation({ ...view(), groupPresentation: current }, [], Object.keys(current).concat('extra')), null);
    const longIdentity = { kind: 'root', workflowId: 'workflow' + 'a'.repeat(4000) };
    const largeView = { identity: longIdentity, key: viewIdentityKey(longIdentity), nodePresentation: {} };
    const ids = Array.from({ length: 1000 }, (_, i) => 'group' + i + 'b'.repeat(250));
    assert.equal(presentation.captureCommentPresentation(largeView, [], ids), null);
});
