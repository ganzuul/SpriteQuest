import test from 'node:test';
import assert from 'node:assert/strict';
import * as library from '../src/workflow/definition-library.js';
import * as composition from '../src/workflow/composition.js';
import { computeDefinitionIdentity, definitionRefKey, nodeBindingOverrideKey } from '../src/workflow/definitions.js';
import { validateGraphStructure } from '../src/workflow/contracts.js';
import { graphDocumentSignature, graphSemanticSignature } from '../src/workflow/ports.js';
import { inspectExpandedGraph } from '../src/workflow/graph-validation.js';

const ref = value => ({ id: value.id, version: value.version, semanticHash: value.semanticHash });
const finalize = draft => { const result = computeDefinitionIdentity(draft); assert.equal(result.ok, true, JSON.stringify(result)); return { ...structuredClone(result.data.materializedDefinition), semanticHash: result.data.semanticHash }; };
const instance = (id, definition) => ({ id, type: 'subgraph', definition: ref(definition), parameterOverrides: {}, roleOverrides: {}, nodeBindingOverrides: {} });
const port = (id, direction, boundaryNodeId, kind = 'context') => ({ id, direction, boundaryNodeId, label: id, kind, required: direction === 'input', cardinality: 'one' });
const wire = (id, from, fromPort, to, toPort, extra = {}) => ({ id, route: 'wire', from, fromPort, to, toPort, ...extra });
const leaf = () => finalize({ id: 'leaf', version: 1, name: 'Leaf', interface: [port('input', 'input', 'entry'), port('output', 'output', 'exit')], parameters: [
    { id: 'tokens', label: 'Tokens', target: { instancePath: [], nodeId: 'work', controlId: 'targetTokens' } },
    { id: 'recent', label: 'Recent', target: { instancePath: [], nodeId: 'work', controlId: 'keepRecent' } },
    { id: 'purpose', label: 'Purpose', target: { instancePath: [], nodeId: 'work', controlId: 'purpose' } },
], body: { schema: 3, runtime: 2, mode: 'native-pre', nodes: { entry: { id: 'entry', type: 'subgraph-input', interfacePortId: 'input' }, work: { id: 'work', type: 'workflow', operation: 'smart-compactor' }, exit: { id: 'exit', type: 'subgraph-output', interfacePortId: 'output' } }, wires: { a: wire('a', 'entry', 'out', 'work', 'in', { order: 4, kind: 'append' }), b: wire('b', 'work', 'out', 'exit', 'in') } } });
const outer = child => {
    const nodes = { work: instance('work', child) }, wires = {};
    for (const p of child.interface) { nodes[p.boundaryNodeId] = { id: p.boundaryNodeId, type: `subgraph-${p.direction}`, interfacePortId: p.id }; const id = `boundary-${p.id}`; wires[id] = p.direction === 'input' ? wire(id, p.boundaryNodeId, 'out', 'work', p.id) : wire(id, 'work', p.id, p.boundaryNodeId, 'in'); }
    return finalize({ id: 'outer', version: 1, name: 'Outer', interface: child.interface, parameters: child.parameters.map(p => ({ ...p, target: { ...p.target, instancePath: ['work', ...p.target.instancePath] } })), body: { schema: 3, runtime: 2, mode: child.body.mode, nodes, wires } });
};
const root = (child = leaf()) => { const parent = outer(child); return { id: 'root', schema: 3, runtime: 2, mode: 'native-pre', roles: { Analysis: { profileId: 'parent-profile', model: 'parent-model' } }, nodes: { source: { id: 'source', type: 'workflow', operation: 'scene-context' }, one: instance('one', parent), two: instance('two', parent) }, wires: { rootEdge: wire('rootEdge', 'source', 'out', 'one', child.interface.find(p => p.direction === 'input').id) }, portals: {}, definitions: { [definitionRefKey(child)]: child, [definitionRefKey(parent)]: parent } }; };
const at = (graph, path) => { let scope = graph, definition; for (const id of path) { definition = graph.definitions[definitionRefKey(scope.nodes[id].definition)]; scope = definition.body; } return { definition, scope }; };
const owned = (child = leaf()) => { const original = root(child), result = library.makeLocalCopy(original, { instancePath: ['one', 'work'], id: 'private-leaf' }); assert.equal(result.ok, true, JSON.stringify(result)); return result.data.candidate; };
const command = (graph, path, fields) => ({ viewPath: path, ...(path.length ? { expectedRef: ref(at(graph, path).definition) } : {}), ...fields });
function accepted(original, result) { assert.equal(result.ok, true, JSON.stringify(result)); assert.equal(result.data.baseSignature, graphSemanticSignature(original)); assert.equal(result.data.baseDocumentSignature, graphDocumentSignature(original)); assert.equal(validateGraphStructure(result.data.candidate).ok, true); return result.data.candidate; }
function rejected(original, call, code) { const before = structuredClone(original), result = call(); assert.equal(result.ok, false, JSON.stringify(result.error ?? {})); if (code) assert.equal(result.error.code, code); assert.deepEqual(original, before); return result; }

test('qualified saved primitive edits revise only the owned branch and no-op retains pins', () => {
    assert.equal(typeof library.prepareNativeNodeEdit, 'function');
    const graph = owned(), before = structuredClone(graph), pin = ref(at(graph, ['one', 'work']).definition);
    const next = accepted(graph, library.prepareNativeNodeEdit(graph, command(graph, ['one', 'work'], { kind: 'controls', nodeId: 'work', controls: { targetTokens: 321, keepRecent: 0, purpose: '' } })));
    assert.equal(at(next, ['one', 'work']).scope.nodes.work.targetTokens, 321);
    assert.equal(at(next, ['one', 'work']).scope.nodes.work.keepRecent, 0);
    assert.deepEqual(next.nodes.two, graph.nodes.two);
    assert.deepEqual(graph, before);
    rejected(next, () => library.prepareNativeNodeEdit(next, { viewPath: ['one', 'work'], expectedRef: pin, kind: 'enabled', nodeId: 'work', value: false }), 'STALE_DEFINITION');
    const unchanged = library.prepareNativeNodeEdit(next, command(next, ['one', 'work'], { kind: 'controls', nodeId: 'work', controls: { targetTokens: 321 } }));
    assert.equal(unchanged.data.changed, false); assert.deepEqual(unchanged.data.candidate, next);
    const disabled = accepted(next, library.prepareNativeNodeEdit(next, command(next, ['one', 'work'], { kind: 'enabled', nodeId: 'work', value: false })));
    assert.equal(at(disabled, ['one', 'work']).scope.nodes.work.enabled, false);
    rejected(root(), () => library.prepareNativeNodeEdit(root(), command(root(), ['one', 'work'], { kind: 'controls', nodeId: 'work', controls: { targetTokens: 4 } })), 'READ_ONLY_DEFINITION');
});

test('qualified primitive binding null falls back while wrapper null blocks and reset preserves sibling fields', () => {
    const graph = owned(), path = ['one', 'work'];
    let next = accepted(graph, library.prepareNativeNodeEdit(graph, command(graph, path, { kind: 'binding', nodeId: 'work', field: 'model', mode: 'set', value: null })));
    assert.equal(inspectExpandedGraph(next).data.primitives.find(unit => JSON.stringify(unit.address.instancePath) === '["one","work"]').node.model, 'parent-model');
    next = accepted(next, library.prepareNativeNodeEdit(next, command(next, path, { kind: 'model-role', nodeId: 'work', mode: 'set', value: 'Custom' })));
    assert.equal(at(next, path).scope.nodes.work.modelRole, 'Custom');
    next = accepted(next, library.prepareNativeNodeEdit(next, command(next, path, { kind: 'model-role', nodeId: 'work', mode: 'remove' })));
    assert.equal(Object.hasOwn(at(next, path).scope.nodes.work, 'modelRole'), true, 'identity materializes the default role');
    const wrapperPath = ['one'], wrapper = at(next, wrapperPath).scope.nodes.work;
    const change = fields => command(next, wrapperPath, { kind: 'binding-override', nodeId: 'work', expectedInstanceRef: wrapper.definition, target: { kind: 'node', instancePath: [], nodeId: 'work' }, ...fields });
    next = accepted(next, library.prepareNativeNodeEdit(next, change({ field: 'profileId', mode: 'set', value: 'own-profile' })));
    next = accepted(next, library.prepareNativeNodeEdit(next, change({ field: 'model', mode: 'set', value: null })));
    let binding = at(next, wrapperPath).scope.nodes.work.nodeBindingOverrides[nodeBindingOverrideKey([], 'work')];
    assert.deepEqual(binding, { profileId: 'own-profile', model: null });
    assert.equal(inspectExpandedGraph(next).data.primitives.find(unit => JSON.stringify(unit.address.instancePath) === '["one","work"]').node.model, null);
    next = accepted(next, library.prepareNativeNodeEdit(next, change({ field: 'model', mode: 'reset' })));
    binding = at(next, wrapperPath).scope.nodes.work.nodeBindingOverrides[nodeBindingOverrideKey([], 'work')]; assert.deepEqual(binding, { profileId: 'own-profile' });
    const pinned = root(), pin = pinned.nodes.one.definition;
    const over = accepted(pinned, library.prepareNativeNodeEdit(pinned, { viewPath: [], kind: 'parameter-override', nodeId: 'one', expectedInstanceRef: pin, parameterId: 'recent', mode: 'set', value: 0 }));
    assert.equal(over.nodes.one.parameterOverrides.recent, 0);
    const empty = accepted(over, library.prepareNativeNodeEdit(over, { viewPath: [], kind: 'parameter-override', nodeId: 'one', expectedInstanceRef: pin, parameterId: 'purpose', mode: 'set', value: '' }));
    assert.equal(empty.nodes.one.parameterOverrides.purpose, '');
    const reset = accepted(empty, library.prepareNativeNodeEdit(empty, { viewPath: [], kind: 'parameter-override', nodeId: 'one', expectedInstanceRef: pin, parameterId: 'recent', mode: 'reset' })); assert.equal(Object.hasOwn(reset.nodes.one.parameterOverrides, 'recent'), false);
});

test('qualified admission rejects getters and unknown fields before trusted mutation', () => {
    const graph = owned(); let calls = 0;
    const unsafe = { get viewPath() { calls++; return []; } };
    assert.equal(library.prepareNativeNodeEdit(graph, unsafe).ok, false); assert.equal(calls, 0);
    rejected(graph, () => library.prepareNativeNodeEdit(graph, { viewPath: [], kind: 'enabled', nodeId: 'source', value: false, surprise: true }), 'INVALID_COMMAND');
    rejected(graph, () => library.prepareNativeNodeEdit(graph, { viewPath: [], kind: 'controls', nodeId: 'source', controls: { undeclared: true } }), 'INVALID_SETTINGS');
    rejected(graph, () => library.prepareNativeNodeEdit(graph, { viewPath: [], kind: 'binding', nodeId: 'source', field: 'model', mode: 'block', value: null }), 'INVALID_COMMAND');
    rejected(graph, () => library.prepareNativeNodeEdit(graph, { viewPath: [], expectedRef: graph.nodes.one.definition, kind: 'enabled', nodeId: 'source', value: false }), 'STALE_DEFINITION');
    const schema2 = { id: 'old', schema: 2, runtime: 1, mode: 'native-pre', nodes: { source: graph.nodes.source }, wires: {} };
    rejected(schema2, () => library.prepareNativeNodeEdit(schema2, { viewPath: [], kind: 'enabled', nodeId: 'source', value: false }), 'UNSUPPORTED_VERSION');
});

test('dynamic pin controls require explicit incident removals and cannot erase publishers', () => {
    const graph = { id: 'root', schema: 3, runtime: 2, mode: 'native-pre', nodes: { source: { id: 'source', type: 'workflow', operation: 'scene-context' }, join: { id: 'join', type: 'workflow', operation: 'context-join', inputs: [{ id: 'first', label: 'First' }, { id: 'second', label: 'Second' }, { id: 'third', label: 'Third' }] } }, wires: { a: wire('a', 'source', 'out', 'join', 'first'), b: wire('b', 'source', 'out', 'join', 'third') }, portals: {}, definitions: {} };
    const fields = { viewPath: [], kind: 'controls', nodeId: 'join', controls: { inputs: [{ id: 'first', label: 'First' }, { id: 'second', label: 'Second' }] } };
    rejected(graph, () => library.prepareNativeNodeEdit(graph, fields), 'INVALID_PORT');
    const next = accepted(graph, library.prepareNativeNodeEdit(graph, { ...fields, removeEdgeIds: ['b'] })); assert.deepEqual(Object.keys(next.wires), ['a']);
    rejected(graph, () => library.prepareNativeNodeEdit(graph, { ...fields, removeEdgeIds: ['missing'] }), 'INVALID_WIRE');
});

test('wrapper reset still requires an actual current parameter, role and primitive target', () => {
    const graph = root(), base = { viewPath: [], nodeId: 'one', expectedInstanceRef: graph.nodes.one.definition };
    rejected(graph, () => library.prepareNativeNodeEdit(graph, { ...base, kind: 'parameter-override', parameterId: 'missing', mode: 'reset' }), 'INVALID_OVERRIDE');
    rejected(graph, () => library.prepareNativeNodeEdit(graph, { ...base, kind: 'binding-override', target: { kind: 'role', role: 'Missing' }, field: 'model', mode: 'reset' }), 'INVALID_OVERRIDE');
    rejected(graph, () => library.prepareNativeNodeEdit(graph, { ...base, kind: 'binding-override', target: { kind: 'node', instancePath: ['work'], nodeId: 'missing' }, field: 'model', mode: 'reset' }), 'INVALID_OVERRIDE');
});

test('qualified portal conversion preserves the same consumer wire and restores it', () => {
    assert.equal(typeof composition.prepareQualifiedPortalEdit, 'function');
    const graph = owned(), path = ['one', 'work'];
    const converted = composition.prepareQualifiedPortalEdit(graph, command(graph, path, { kind: 'convert-wire', edgeId: 'a', publisher: { kind: 'create', label: 'Input shared' } }));
    const next = accepted(graph, converted), scope = at(next, path).scope, portalId = scope.wires.a.portalId;
    assert.deepEqual(scope.wires.a, { id: 'a', route: 'portal', portalId, to: 'work', toPort: 'in', order: 4, kind: 'append' });
    assert.deepEqual(scope.portals[portalId].source, { nodeId: 'entry', portId: 'out' });
    assert.deepEqual(converted.data.addedEdgeIds, []); assert.deepEqual(converted.data.removedEdgeIds, []);
    assert.deepEqual(next.nodes.two, graph.nodes.two);
    const restored = accepted(next, composition.prepareQualifiedPortalEdit(next, command(next, path, { kind: 'restore', edgeId: 'a' })));
    assert.deepEqual(at(restored, path).scope.wires.a, at(graph, path).scope.wires.a);
    const output = accepted(graph, composition.prepareQualifiedPortalEdit(graph, command(graph, path, { kind: 'create', source: { nodeId: 'work', portId: 'out' }, label: 'Output only' })));
    assert.deepEqual(at(output, path).scope.wires, at(graph, path).scope.wires);
    assert.equal(Object.keys(at(output, path).scope.portals).length, 1);
});

test('qualified portal policies reject mismatches and cycles without altering the source', () => {
    const graph = owned(), path = ['one', 'work'];
    let next = accepted(graph, composition.prepareQualifiedPortalEdit(graph, command(graph, path, { kind: 'create', source: { nodeId: 'entry', portId: 'out' }, label: 'Input', id: 'input-publisher' })));
    next = accepted(next, composition.prepareQualifiedPortalEdit(next, command(next, path, { kind: 'bind', portalId: 'input-publisher', to: { nodeId: 'work', portId: 'in' }, replace: true })));
    const consumer = Object.values(at(next, path).scope.wires).find(e => e.route === 'portal').id;
    rejected(next, () => composition.prepareQualifiedPortalEdit(next, command(next, path, { kind: 'delete', portalId: 'input-publisher' })), 'PORTAL_IN_USE');
    rejected(next, () => composition.prepareQualifiedPortalEdit(next, command(next, path, { kind: 'retarget', portalId: 'input-publisher', source: { nodeId: 'work', portId: 'out' } })), 'CYCLE');
    rejected(next, () => composition.prepareQualifiedPortalEdit(next, command(next, path, { kind: 'convert-wire', edgeId: 'b', publisher: { kind: 'existing', portalId: 'input-publisher' } })), 'INVALID_PORTAL');
    const restored = accepted(next, composition.prepareQualifiedPortalEdit(next, command(next, path, { kind: 'delete', portalId: 'input-publisher', consumers: 'restore' })));
    assert.equal(at(restored, path).scope.wires[consumer].route, 'wire');
    const disconnected = composition.prepareQualifiedPortalEdit(next, command(next, path, { kind: 'delete', portalId: 'input-publisher', consumers: 'disconnect' }));
    const removed = accepted(next, disconnected); assert.equal(at(removed, path).scope.wires[consumer], undefined); assert.deepEqual(disconnected.data.removedEdgeIds, [consumer]);
    rejected(graph, () => composition.prepareQualifiedPortalEdit(graph, command(graph, path, { kind: 'create', source: { nodeId: 'exit', portId: 'out' }, label: 'Missing' })), 'INVALID_PORTAL');
});

const emptyMaps = () => ({ portMap: {}, parameterMap: {}, roleMap: {}, nodeBindingMap: {} });
test('nested Update requires the real editable parent and captured wrapper pin', () => {
    assert.equal(typeof library.prepareQualifiedInstanceUpdate, 'function');
    const graph = owned(), path = ['one'], old = at(graph, path).scope.nodes.work.definition, replacementDraft = structuredClone(leaf()); replacementDraft.id = 'replacement';
    const replacement = finalize(replacementDraft), fields = { instanceId: 'work', expectedInstanceRef: old, definition: replacement, snapshots: {}, ...emptyMaps() };
    const result = library.prepareQualifiedInstanceUpdate(graph, command(graph, path, fields)), next = accepted(graph, result);
    assert.deepEqual(at(next, path).scope.nodes.work.definition, ref(replacement));
    assert.deepEqual(result.data.fromRef, old); assert.deepEqual(result.data.toRef, ref(replacement));
    assert.deepEqual(next.nodes.two, graph.nodes.two);
    assert.deepEqual(next.localDefinitionOwners, [{ instancePath: ['one'], definitionId: graph.nodes.one.definition.id }]);
    assert.equal(Object.values(next.definitions).some(d => d.id === 'private-leaf'), false, 'unreachable proven private snapshots are pruned');
    rejected(next, () => library.prepareQualifiedInstanceUpdate(next, command(next, path, fields)), 'STALE_DEFINITION');
    rejected(root(), () => library.prepareQualifiedInstanceUpdate(root(), command(root(), path, { ...fields, expectedInstanceRef: leaf() })), 'READ_ONLY_DEFINITION');
    const missing = command(graph, path, fields); delete missing.roleMap;
    rejected(graph, () => library.prepareQualifiedInstanceUpdate(graph, missing), 'INVALID_OVERRIDE');
    const same = library.prepareQualifiedInstanceUpdate(graph, command(graph, path, { ...fields, definition: at(graph, ['one', 'work']).definition })); assert.equal(same.data.changed, false); assert.deepEqual(same.data.candidate, graph);
});

test('qualified Update remaps all four saved maps plus wire and publisher ports atomically', () => {
    const graph = root(), old = graph.nodes.one.definition, replacementDraft = structuredClone(at(graph, ['one']).definition);
    replacementDraft.id = 'mapped'; replacementDraft.interface[0].id = 'new-input'; replacementDraft.body.nodes.entry.interfacePortId = 'new-input';
    replacementDraft.interface[1].id = 'new-output'; replacementDraft.body.nodes.exit.interfacePortId = 'new-output';
    replacementDraft.parameters.find(p => p.id === 'tokens').id = 'new-tokens'; replacementDraft.parameters = replacementDraft.parameters.filter(p => p.id !== 'recent');
    replacementDraft.body.roles = { Alternate: {} }; const replacement = finalize(replacementDraft);
    graph.nodes.one.parameterOverrides = { tokens: 333, recent: 0 };
    graph.nodes.one.roleOverrides = { Analysis: { model: 'saved-model' } };
    graph.nodes.one.nodeBindingOverrides[nodeBindingOverrideKey(['work'], 'work')] = { profileId: 'saved-profile' };
    graph.portals.out = { id: 'out', label: 'Output', kind: 'context', source: { nodeId: 'one', portId: 'output' } };
    const fields = { viewPath: [], instanceId: 'one', expectedInstanceRef: old, definition: replacement, snapshots: { [definitionRefKey(leaf())]: leaf() }, portMap: { input: 'new-input', output: 'new-output' }, parameterMap: { tokens: 'new-tokens', recent: null }, roleMap: { Analysis: 'Alternate' }, nodeBindingMap: { [nodeBindingOverrideKey(['work'], 'work')]: null } };
    const next = accepted(graph, library.prepareQualifiedInstanceUpdate(graph, fields));
    assert.equal(next.wires.rootEdge.toPort, 'new-input'); assert.equal(next.portals.out.source.portId, 'new-output');
    assert.deepEqual(next.nodes.one.parameterOverrides, { 'new-tokens': 333 }); assert.deepEqual(next.nodes.one.roleOverrides, { Alternate: { model: 'saved-model' } }); assert.deepEqual(next.nodes.one.nodeBindingOverrides, {});
    rejected(graph, () => library.prepareQualifiedInstanceUpdate(graph, { ...fields, portMap: {} }), 'INVALID_PORT');
    rejected(graph, () => library.prepareQualifiedInstanceUpdate(graph, { ...fields, portMap: { input: null, output: 'new-output' } }));
    rejected(graph, () => library.prepareQualifiedInstanceUpdate(graph, { ...fields, parameterMap: { tokens: 'missing' } }), 'INVALID_OVERRIDE');
});

const metadata = (graph, path, fields) => ({ instancePath: path, expectedRef: ref(at(graph, path).definition), ...fields });
test('owned interface commands create a real boundary and retain identity on label edits', () => {
    assert.equal(typeof library.prepareOwnedDefinitionMetadataEdit, 'function');
    const graph = owned(), path = ['one', 'work'];
    const added = library.prepareOwnedDefinitionMetadataEdit(graph, metadata(graph, path, { kind: 'interface', edit: { kind: 'add', label: 'Extra', direction: 'input', artifactKind: 'text', required: false } }));
    let next = accepted(graph, added), definition = at(next, path).definition, p = definition.interface.find(p => p.label === 'Extra');
    assert.ok(p.id); assert.equal(p.cardinality, 'one'); assert.equal(p.kind, 'text'); assert.deepEqual(definition.body.nodes[p.boundaryNodeId], { id: p.boundaryNodeId, type: 'subgraph-input', interfacePortId: p.id });
    const id = p.id, boundary = p.boundaryNodeId;
    next = accepted(next, library.prepareOwnedDefinitionMetadataEdit(next, metadata(next, path, { kind: 'interface', edit: { kind: 'update', id, label: 'Renamed', artifactKind: 'text', required: false } })));
    p = at(next, path).definition.interface.find(p => p.id === id); assert.equal(p.label, 'Renamed'); assert.equal(p.direction, 'input'); assert.equal(p.boundaryNodeId, boundary);
    const noop = library.prepareOwnedDefinitionMetadataEdit(next, metadata(next, path, { kind: 'interface', edit: { kind: 'update', id, label: 'Renamed', artifactKind: 'text', required: false } })); assert.equal(noop.data.changed, false);
    const removed = accepted(next, library.prepareOwnedDefinitionMetadataEdit(next, metadata(next, path, { kind: 'interface', edit: { kind: 'remove', id } })));
    assert.equal(at(removed, path).definition.interface.some(p => p.id === id), false); assert.equal(at(removed, path).scope.nodes[boundary], undefined);
    assert.deepEqual(removed.nodes.two, graph.nodes.two);
});

test('owned interface changes reject connected incompatible ports rather than dropping wires', () => {
    const graph = owned(), path = ['one', 'work'];
    rejected(graph, () => library.prepareOwnedDefinitionMetadataEdit(graph, metadata(graph, path, { kind: 'interface', edit: { kind: 'remove', id: 'input' } })), 'DANGLING_WIRE');
    rejected(graph, () => library.prepareOwnedDefinitionMetadataEdit(graph, metadata(graph, path, { kind: 'interface', edit: { kind: 'update', id: 'input', label: 'Changed', artifactKind: 'text', required: true } })), 'ARTIFACT_KIND');
    rejected(graph, () => library.prepareOwnedDefinitionMetadataEdit(graph, metadata(graph, path, { kind: 'interface', edit: { kind: 'update', id: 'input', label: 'Changed', artifactKind: 'context', required: true, direction: 'output' } })), 'INVALID_COMMAND');
    rejected(root(), () => library.prepareOwnedDefinitionMetadataEdit(root(), metadata(root(), path, { kind: 'interface', edit: { kind: 'add', label: 'Extra', direction: 'input', artifactKind: 'text', required: false } })), 'READ_ONLY_DEFINITION');
});

test('owned parameters use actual eligible controls and reject surviving ancestor exposures', () => {
    const draft = structuredClone(leaf()); draft.body.nodes.compose = { id: 'compose', type: 'workflow', operation: 'compose', operationVersion: 1, sections: [] };
    draft.body.nodes.join = { id: 'join', type: 'workflow', operation: 'context-join', operationVersion: 1, inputs: [{ id: 'first', label: 'First' }, { id: 'second', label: 'Second' }] };
    const graph = owned(finalize(draft)), path = ['one', 'work'];
    const target = { instancePath: [], nodeId: 'compose', controlId: 'sections' };
    let next = accepted(graph, library.prepareOwnedDefinitionMetadataEdit(graph, metadata(graph, path, { kind: 'parameter', edit: { kind: 'add', label: 'Sections', target } })));
    const parameter = at(next, path).definition.parameters.find(p => p.label === 'Sections'); assert.deepEqual(parameter.target, target);
    next = accepted(next, library.prepareOwnedDefinitionMetadataEdit(next, metadata(next, path, { kind: 'parameter', edit: { kind: 'update', id: parameter.id, label: 'Segments' } })));
    assert.equal(at(next, path).definition.parameters.find(p => p.id === parameter.id).label, 'Segments');
    const removed = accepted(next, library.prepareOwnedDefinitionMetadataEdit(next, metadata(next, path, { kind: 'parameter', edit: { kind: 'remove', id: parameter.id } })));
    assert.equal(at(removed, path).definition.parameters.some(p => p.id === parameter.id), false);
    rejected(graph, () => library.prepareOwnedDefinitionMetadataEdit(graph, metadata(graph, path, { kind: 'parameter', edit: { kind: 'add', label: 'Slots', target: { instancePath: [], nodeId: 'join', controlId: 'inputs' } } })), 'DEFINITION_PARAMETER');
    rejected(graph, () => library.prepareOwnedDefinitionMetadataEdit(graph, metadata(graph, path, { kind: 'parameter', edit: { kind: 'remove', id: 'tokens' } })), 'PARAMETER_IN_USE');
    rejected(graph, () => library.prepareOwnedDefinitionMetadataEdit(graph, metadata(graph, path, { kind: 'parameter', edit: { kind: 'add', label: 'Missing', target: { instancePath: ['missing'], nodeId: 'compose', controlId: 'sections' } } })), 'DEFINITION_PARAMETER');
});

test('qualified commands reject non-string discriminants without invoking coercion hooks', () => {
    const graph = root(), malformed = { toString: 'not a function', valueOf: 'not a function' };
    assert.equal(library.prepareNativeNodeEdit(graph, { viewPath: [], kind: malformed }).ok, false);
    assert.equal(composition.prepareQualifiedPortalEdit(graph, { viewPath: [], kind: malformed }).ok, false);
    assert.equal(library.prepareOwnedDefinitionMetadataEdit(graph, { instancePath: ['one'], expectedRef: graph.nodes.one.definition, kind: 'interface', edit: { kind: malformed } }).ok, false);
});

test('root qualified Update prunes only unreachable proven private snapshots', () => {
    const graph = owned(), target = at(graph, ['two']).definition, snapshots = { [definitionRefKey(leaf())]: leaf() };
    const next = accepted(graph, library.prepareQualifiedInstanceUpdate(graph, { viewPath: [], instanceId: 'one', expectedInstanceRef: graph.nodes.one.definition, definition: target, snapshots, ...emptyMaps() }));
    assert.deepEqual(next.nodes.two, graph.nodes.two); assert.deepEqual(next.localDefinitionOwners, []);
    assert.equal(Object.values(next.definitions).some(definition => definition.id === 'private-leaf' || definition.id === graph.nodes.one.definition.id), false);
    assert.ok(next.definitions[definitionRefKey(target)]);
});
