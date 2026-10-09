// Current history preserves editable documents without rewinding runtime authority.
import assert from 'node:assert/strict';
import { installMock } from './mock.js';
installMock();
const v = JSON.parse((await import('node:fs')).readFileSync(new URL('../manifest.json', import.meta.url))).version;
const S = await import(`../src/state.js?v=${v}`), H = await import(`../src/history.js?v=${v}`);
S.onGraphTouched(g => H.noteChange(g));
const tick = (ms = 5) => new Promise(r => setTimeout(r, ms));
const g = S.createGraph('History'); H.track(g);
const node = (id, x = 0) => ({ id, type: 'workflow', operation: 'compose', title: id, x, y: 0, sections: [{ name: 'Text', text: '' }] });
g.nodes.a = node('a'); g.nodes.b = node('b', 300); S.touchGraph(g); await tick();
assert.equal(H.peek(g).undo, 'add 2 blocks');
g.wires.edge = { id: 'edge', route: 'wire', from: 'a', fromPort: 'out', to: 'b', toPort: 'section.Text' }; S.touchGraph(g); await tick();
assert.equal(H.peek(g).undo, 'connect "a" → "b"');
delete g.nodes.a; delete g.wires.edge; S.touchGraph(g); await tick();
assert.equal(H.undo(g), 'delete "a"'); assert.ok(g.nodes.a && g.wires.edge);
assert.equal(H.redo(g), 'delete "a"'); assert.ok(!g.nodes.a); H.undo(g);
for (const ch of 'Hello there') { g.nodes.a.sections[0].text += ch; S.touchGraph(g); await tick(2); }
assert.equal(H.peek(g).undo, 'your last edit'); await tick(750); assert.equal(H.undo(g), 'edit "a"'); assert.equal(g.nodes.a.sections[0].text, '');
g.nodes.a.sections[0].text = 'quick'; S.touchGraph(g); assert.equal(H.undo(g), 'edit "a"');
g.nodes.a.x = 300; S.touchGraph(g); await tick(); assert.equal(H.peek(g).undo, 'move "a"');
g.nodes.a.enabled = false; S.touchGraph(g); await tick(); assert.equal(H.peek(g).undo, 'switch off "a"');
for (let i = 0; i < 5; i++) g.nodes['batch' + i] = node('batch' + i); S.touchGraph(g); await tick();
assert.equal(H.peek(g).undo, 'add 5 blocks'); H.undo(g); assert.equal(Object.keys(g.nodes).length, 2);
g.nodes.note = { id: 'note', type: 'note', x: 0, y: 0, content: 'Annotation' }; S.touchGraph(g); await tick(); assert.equal(H.peek(g).redo, null);
const before = H.peek(g).undo; g.view = { x: 10, y: 10, zoom: 2 }; S.touchGraph(g); H.flush(g); assert.equal(H.peek(g).undo, before);
for (let i = 0; i < 70; i++) { g.nodes['cap' + i] = node('cap' + i); S.touchGraph(g); H.flush(g); }
let count = 0; while (H.undo(g)) count++; assert.equal(count, 50);
const other = S.createGraph('Other'); H.track(other); assert.equal(H.peek(other).undo, null);
const native = S.blankGraph('Composition'); native.id = 'history-composition'; native.roles = { Analysis: { model: 'old' } }; H.track(native);
native.mode = 'native-post'; native.roles.Analysis.model = 'new'; native.portals = { p: { id: 'p', label: 'Portal' } };
native.definitions = { d: { id: 'd', version: 1, body: { nodes: { x: { id: 'x', instructions: 'Pinned body' } } } } };
native.nodes.instance = { id: 'instance', type: 'subgraph', definition: { id: 'd', version: 1, semanticHash: 'hash' }, parameterOverrides: { tone: 'warm' }, roleOverrides: { Prose: { model: 'override' } }, nodeBindingOverrides: { x: { model: 'local' } } };
H.noteChange(native); H.flush(native);
native.view = { x: 999 }; native.selection = ['current']; native.recording = { id: 'latest' }; native.authority = { apply: false, generation: 2 };
H.undo(native); assert.equal(native.schema, 3); assert.equal(native.runtime, 2); assert.equal(native.mode, 'native-pre'); assert.equal(native.roles.Analysis.model, 'old'); assert.deepEqual(native.portals, {}); assert.deepEqual(native.definitions, {});
assert.deepEqual(native.view, { x: 999 }); assert.deepEqual(native.selection, ['current']); assert.deepEqual(native.recording, { id: 'latest' }); assert.deepEqual(native.authority, { apply: false, generation: 2 });
H.redo(native); assert.equal(native.mode, 'native-post'); assert.equal(native.roles.Analysis.model, 'new'); assert.equal(native.definitions.d.body.nodes.x.instructions, 'Pinned body'); assert.deepEqual(native.nodes.instance.parameterOverrides, { tone: 'warm' }); assert.deepEqual(native.nodes.instance.nodeBindingOverrides, { x: { model: 'local' } });
console.log('history: ok');
