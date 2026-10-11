import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createGraphViewSession } from '../src/ui/graph-view-session.js';
import { viewIdentityKey } from '../src/ui/view-state.js';
const api = await import('../src/ui/system-authoring-views.js').catch(() => ({}));
const root = { id: 'main' }, identity = path => ({ kind: 'instance', workflowId: 'main', instancePath: path });
const navigation = paths => paths.map(path => ({ identity: identity(path), label: path.join('/'), readOnly: false }));
const prepared = paths => ({ navigation: navigation(paths), preparedViews: [{ kind: 'root', workflowId: 'main' }, ...paths.map(identity)].map(identity => ({ identity, ...(identity.kind === 'root' ? {} : { definitionRef: { id: 'd', version: 1, semanticHash: 'hash' } }), savedGraph: { mode: 'native-pre', nodes: { work: { id: 'work', type: 'workflow' } }, wires: {} }, effectiveNodes: {}, interface: [], ports: [] })) });
function create(paths) { return createGraphViewSession({ root, activationId: 'live', ...prepared(paths) }).data; }
test('Add system presentation preflight changes no live views and history restores origin focus and later descendants', () => {
    const session = create([['origin']]);
    session.openInstance(['origin']);
    const before = session.serialize().data;
    assert.equal(typeof api.preflightSystemViews, 'function');
    const check = api.preflightSystemViews(root, prepared([['origin'], ['new'], ['new', 'nested']]), before, 'new');
    assert.equal(check.ok, true, JSON.stringify(check));
    assert.deepEqual(session.serialize().data, before);
    session.replacePreparedViews(prepared([['origin'], ['new'], ['new', 'nested']]));
    api.restoreSystemViews(session, check.data.after.views, check.data.after.activeKey);
    const effect = api.captureSystemPresentation(before, session.serialize().data, 'new');
    session.openInstance(['new', 'nested']);
    session.updateView({ camera: { x: 23, y: 5, zoom: 1 } });
    api.refreshSystemPresentation(effect, session.serialize().data, 'undo');
    session.replacePreparedViews(prepared([['origin']]));
    const undo = api.restoreSystemViews(session, effect.before.views, effect.before.activeKey);
    assert.equal(undo.ok, true);
    assert.equal(session.readEditor().view.key, before.activeKey);
    session.replacePreparedViews(prepared([['origin'], ['new'], ['new', 'nested']]));
    assert.equal(api.restoreSystemViews(session, effect.after.views, effect.after.activeKey).ok, true);
    assert.equal(session.readEditor().view.key, viewIdentityKey(identity(['new'])));
    const nested = session.serialize().data.views.find(v => JSON.stringify(v.identity.instancePath) === '["new","nested"]');
    assert.equal(nested.camera.x, 23);
});
test('system open preflight rejects exhausted retained-view budget without changing live presentation', () => {
    const paths = Array.from({ length: 1000 }, (_, i) => ['existing-' + i]);
    const session = create([...paths, ['new']]);
    for (const path of paths)
        assert.equal(session.openInstance(path).ok, true);
    const before = session.serialize().data;
    const result = api.preflightSystemViews(root, prepared([...paths, ['new']]), before, 'new');
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'VIEW_LIMIT');
    assert.deepEqual(session.serialize().data, before);
});


test('successive system additions use deterministic vacant root space including a new merge slot', () => {
 assert.equal(typeof api.vacantSystemPoint,'function');const graph={nodes:{old:{id:'old',x:120,y:100,w:300,h:180}}};const first=api.vacantSystemPoint(graph);graph.nodes.one={id:'one',...first,w:300,h:180};graph.nodes.merge={id:'merge',x:first.x+360,y:first.y,w:300,h:180};const second=api.vacantSystemPoint(graph);assert.notDeepEqual(second,first);assert.deepEqual(api.vacantSystemPoint(graph),second);
 for(const node of Object.values(graph.nodes))assert.ok(second.x+684<=node.x||second.x>=node.x+(node.w??300)+24||second.y+204<=node.y||second.y>=node.y+(node.h??180)+24);
});
