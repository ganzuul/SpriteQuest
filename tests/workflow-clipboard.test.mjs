import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computeDefinitionIdentity, definitionRefKey } from '../src/workflow/definitions.js';

let clipboard;
try { clipboard = await import('../src/workflow/clipboard.js'); } catch { clipboard = {}; }
const graph = () => ({ id: 'current', schema: 3, runtime: 2, mode: 'native-pre', nodes: {
    source: { id: 'source', type: 'workflow', operation: 'scene-context', x: 20, y: 30 },
    compact: { id: 'compact', type: 'workflow', operation: 'smart-compactor', x: 320, y: 30, profileId: 'private-profile', model: 'portable-model', modelRole: 'Analysis', inGroup: 'pair' },
    output: { id: 'output', type: 'workflow', operation: 'response-plan', x: 600, y: 30 },
}, wires: {
    kept: { id: 'kept', route: 'wire', from: 'source', fromPort: 'out', to: 'compact', toPort: 'in' },
    omitted: { id: 'omitted', route: 'wire', from: 'compact', fromPort: 'out', to: 'output', toPort: 'in' },
}, portals: {}, definitions: {}, roles: { Analysis: { profileId: 'private-profile', model: 'portable-model' }, Unused: { profileId: 'unrelated' } }, groups: { pair: { id: 'pair', title: 'Pair', x: 0, y: 0, collapsed: false, frame: { x: 0, y: 0, w: 500, h: 100 } } } });

test('clipboard exports current portable fragments and strips unrelated endpoints and host profiles', () => {
    assert.equal(typeof clipboard.makeClip, 'function');
    const source = graph(), before = structuredClone(source), result = clipboard.makeClip(source, { nodeIds: ['source', 'compact'] });
    assert.equal(result.ok, true, JSON.stringify(result));
    const envelope = result.data;
    assert.deepEqual([envelope.kind, envelope.schema, envelope.minRuntime], ['lattice-workflow', 2, 2]);
    assert.deepEqual(Object.keys(envelope.graph.nodes), ['source', 'compact']); assert.deepEqual(Object.keys(envelope.graph.wires), ['kept']);
    assert.deepEqual(Object.keys(envelope.graph.groups), []); assert.equal(envelope.graph.nodes.compact.inGroup, undefined);
    assert.deepEqual(Object.keys(envelope.graph.roles), ['Analysis']); assert.equal(envelope.graph.nodes.compact.profileId, null);
    assert.equal(envelope.graph.roles.Analysis.profileId, null); assert.deepEqual(source, before);
});

test('clipboard rejects old brands, raw graphs and old clipboard markers', () => {
    assert.equal(typeof clipboard.readClip, 'function');
    for (const value of [graph(), { latticeClip: 1, nodes: [] }, { sillyCanvasClip: 1, nodes: [] }, { kind: 'comfytavern-workflow', schema: 2, minRuntime: 2, graph: graph() }, { kind: 'lattice-workflow', schema: 1, minRuntime: 1, graph: graph() }]) {
        assert.equal(clipboard.readClip(JSON.stringify(value)).ok, false);
    }
});

test('clipboard insertion is detached, fresh, placed and ready for one captured transaction', () => {
    assert.equal(typeof clipboard.prepareClipPaste, 'function');
    const source = graph(), destination = graph(), before = structuredClone(destination);
    const clip = clipboard.makeClip(source, { nodeIds: ['source', 'compact'], groupIds: ['pair'] }); assert.equal(clip.ok, true);
    const read = clipboard.readClip(JSON.stringify(clip.data)); assert.equal(read.ok, true);
    const pasted = clipboard.prepareClipPaste(destination, read.data, { at: { x: 1000, y: 500 } });
    assert.equal(pasted.ok, true, JSON.stringify(pasted)); assert.deepEqual(destination, before);
    const { candidate, added, identityMap } = pasted.data;
    assert.equal(added.nodes.length, 2); assert.equal(added.wires.length, 1); assert.equal(added.groups.length, 1);
    assert.notEqual(identityMap.nodes.source, 'source'); assert.deepEqual([candidate.nodes[identityMap.nodes.source].x, candidate.nodes[identityMap.nodes.source].y], [1000, 500]);
    assert.equal(candidate.wires[identityMap.wires.kept].from, identityMap.nodes.source);
    const again = clipboard.prepareClipPaste(candidate, clip.data); assert.equal(again.ok, true);
    assert.ok(again.data.added.nodes.every(id => !added.nodes.includes(id)));
});

test('selected wrappers include only their exact nested definition closure', () => {
    assert.equal(typeof clipboard.makeClip, 'function');
    const definition = computeDefinitionIdentity({ id: 'source-definition', version: 1, name: 'Source', interface: [{ id: 'result', label: 'Result', direction: 'output', kind: 'text', cardinality: 'one', required: false, boundaryNodeId: 'exit' }], parameters: [], body: { schema: 3, runtime: 2, mode: 'native-pre', nodes: { source: { id: 'source', type: 'workflow', operation: 'compose', outputKind: 'text', sections: [{ name: 'value', text: 'Portable body' }] }, exit: { id: 'exit', type: 'subgraph-output', interfacePortId: 'result' } }, wires: { edge: { id: 'edge', route: 'wire', from: 'source', fromPort: 'out', to: 'exit', toPort: 'in' } } } });
    assert.equal(definition.ok, true, JSON.stringify(definition));
    const current = graph(), snapshot = { ...definition.data.materializedDefinition, semanticHash: definition.data.semanticHash }, key = definitionRefKey(snapshot);
    current.definitions = { [key]: snapshot }; current.nodes.wrapper = { id: 'wrapper', type: 'subgraph', x: 0, y: 0, definition: { id: snapshot.id, version: snapshot.version, semanticHash: snapshot.semanticHash } };
    const result = clipboard.makeClip(current, { nodeIds: ['wrapper'] }); assert.equal(result.ok, true, JSON.stringify(result));
    assert.deepEqual(Object.keys(result.data.graph.definitions), [key]); assert.deepEqual(Object.keys(result.data.graph.nodes), ['wrapper']);
});

test('default current model roles and current terminal nodes survive portable selection', () => {
    const source = graph(); delete source.nodes.compact.modelRole;
    source.nodes.terminal = { id: 'terminal', type: 'workflow', operation: 'guidance', x: 800, y: 30 };
    const result = clipboard.makeClip(source, { nodeIds: ['compact', 'terminal'] });
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.ok(result.data.graph.nodes.terminal); assert.deepEqual(Object.keys(result.data.graph.roles), ['Analysis']);
});

test('clipboard keeps selected portal publishers and their consumers without dangling sources', () => {
    const source = graph(); delete source.wires.kept;
    source.portals = { alias: { id: 'alias', label: 'Source alias', kind: 'context', source: { nodeId: 'source', portId: 'out' } } };
    source.wires.alias = { id: 'alias', route: 'portal', portalId: 'alias', to: 'compact', toPort: 'in' };
    const included = clipboard.makeClip(source, { nodeIds: ['source', 'compact'] }); assert.equal(included.ok, true, JSON.stringify(included));
    assert.deepEqual(Object.keys(included.data.graph.portals), ['alias']); assert.deepEqual(Object.keys(included.data.graph.wires), ['alias']);
    const isolated = clipboard.makeClip(source, { nodeIds: ['compact'] }); assert.equal(isolated.ok, true);
    assert.deepEqual(isolated.data.graph.portals, {}); assert.deepEqual(isolated.data.graph.wires, {});
});

test('unsafe clipboard objects reject without getter execution or recipient mutation', () => {
    let reads = 0; const hostile = { get kind() { reads++; throw new Error('Do not inspect'); } }, destination = graph(), before = structuredClone(destination);
    assert.equal(clipboard.readClip(hostile).ok, false); assert.equal(clipboard.prepareClipPaste(destination, hostile).ok, false);
    assert.equal(clipboard.makeClip(hostile, { nodeIds: ['source'] }).ok, false); assert.equal(reads, 0); assert.deepEqual(destination, before);
});
