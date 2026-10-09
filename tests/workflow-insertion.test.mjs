import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareWorkflowInsertion, parseWorkflowInsertionFile } from '../src/workflow/insertion.js';
import { exportWorkflow } from '../src/workflow/packages.js';
import { starterGraph } from '../src/workflow/starters.js';
import { graphDocumentSignature, graphSemanticSignature } from '../src/workflow/ports.js';
test('file preview accepts only the current portable workflow and remains host-free', () => {
    const graph = starterGraph('native-guidance'), envelope = exportWorkflow(graph);
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'SillyTavern');
    Object.defineProperty(globalThis, 'SillyTavern', { configurable: true, get() { throw new Error('Preview must never read host state'); } });
    try {
        const parsed = parseWorkflowInsertionFile(JSON.stringify(envelope));
        assert.equal(parsed.ok, true); assert.equal(parsed.data.schema, 3);
        assert.deepEqual(parsed.data, envelope.graph);
        for (const file of [graph, { ...envelope, kind: 'comfytavern-workflow' }, { ...envelope, schema: 1, minRuntime: 1 }, { ...envelope, graph: { ...graph, schema: 2, runtime: 1 } }, { kind: 'prompt-canvas-graph', schema: 1, graph: { nodes: {}, wires: {} } }, { kind: 'lattice-subgraph', schema: 1, minRuntime: 2 }]) assert.equal(parseWorkflowInsertionFile(JSON.stringify(file)).ok, false);
        assert.equal(parseWorkflowInsertionFile('{').error.code, 'INVALID_JSON');
    } finally {
        if (previous) Object.defineProperty(globalThis, 'SillyTavern', previous); else delete globalThis.SillyTavern;
    }
});

test('empty current imports preserve absent optional containers without incidental edits', () => {
    const graph = starterGraph('native-guidance');
    delete graph.roles; delete graph.groups; delete graph.portals; delete graph.definitions;
    const result = prepareWorkflowInsertion(graph, { schema: 3, runtime: 2, mode: 'native-pre', nodes: {}, wires: {} });
    assert.equal(result.ok, true); assert.deepEqual(result.data.candidate, graph);
    assert.equal(Object.values(result.data.added).every(ids => !ids.length), true);
});

test('insertion prepares a detached additive candidate with fresh internal identities', () => {
    const destination = starterGraph('native-guidance');
    const imported = starterGraph('native-guidance');
    const before = structuredClone(destination), source = structuredClone(imported);
    let next = 0;
    const result = prepareWorkflowInsertion(destination, imported, { allocateId: () => `fresh-${++next}` });
    assert.equal(result.ok, true);
    const { candidate, added, identityMap } = result.data;
    assert.equal(candidate.schema, 3);
    assert.equal(candidate.runtime, 2);
    assert.equal(Object.keys(candidate.nodes).length, 8);
    assert.equal(added.nodes.length, 4);
    assert.equal(added.wires.length, 3);
    for (const wire of Object.values(imported.wires)) {
        const copy = candidate.wires[identityMap.wires[wire.id]];
        assert.equal(copy.from, identityMap.nodes[wire.from]);
        assert.equal(copy.to, identityMap.nodes[wire.to]);
        assert.equal(copy.route, 'wire');
        assert.equal(copy.fromPort, 'out');
        assert.equal(copy.toPort, 'in');
    }
    assert.deepEqual(destination, before);
    assert.deepEqual(imported, source);
    candidate.nodes[added.nodes[0]].x = 123456;
    assert.deepEqual(destination, before);
    assert.deepEqual(imported, source);
});

test('candidate limits, malformed layout and malformed composition cannot bypass atomic validation', () => {
    const destination = starterGraph('native-guidance'), imported = starterGraph('native-guidance');
    let allocations = 0;
    for (const change of [graph => { graph.portals = { p: { id: 'p' } }; }, graph => { graph.definitions = { d: { id: 'd' } }; }, graph => { graph.nodes['scene-context'].x = '100'; }]) {
        const invalid = structuredClone(imported);
        change(invalid);
        assert.equal(prepareWorkflowInsertion(destination, invalid, { allocateId: () => `bad-${++allocations}` }).ok, false);
    }
    assert.equal(allocations, 0);
    for (let index = 0; index < 993; index++) destination.nodes[`note-${index}`] = { id: `note-${index}`, type: 'note', x: index, y: 0 };
    const before = structuredClone(destination);
    assert.equal(prepareWorkflowInsertion(destination, imported).ok, false);
    assert.deepEqual(destination, before);
    const unfinished = starterGraph('native-guidance');
    delete unfinished.wires['wire-1'];
    delete unfinished.nodes.guidance;
    delete unfinished.wires['wire-3'];
    assert.equal(prepareWorkflowInsertion(starterGraph('native-guidance'), unfinished).ok, true);
});

test('default allocation remains fresh in dense namespaces and placement clears extended frames', () => {
    const destination = starterGraph('native-guidance'), imported = starterGraph('native-guidance');
    for (let index = 1; index <= 110; index++) destination.nodes[`import-${index}`] = { id: `import-${index}`, type: 'note', x: 0, y: 0 };
    imported.groups.frame = { id: 'frame', x: -500, y: 0, frame: { x: -600, y: -50, w: 900, h: 400 } };
    const result = prepareWorkflowInsertion(destination, imported);
    assert.equal(result.ok, true);
    const right = Math.max(...Object.values(destination.nodes).map(node => node.x + (node.w ?? 260)));
    assert.ok(result.data.candidate.groups[result.data.identityMap.groups.frame].frame.x > right);
});

test('review diagnostics report phase, terminal effects, conservative bound and unresolved local bindings', () => {
    const destination = starterGraph('native-guidance'), imported = starterGraph('native-guidance');
    imported.roles.Analysis = { profileId: 'import-profile', model: 'import-model' };
    imported.nodes['response-plan'].profileId = 'node-profile';
    imported.nodes['response-plan'].model = 'node-model';
    const result = prepareWorkflowInsertion(destination, imported);
    assert.equal(result.ok, true);
    const { diagnostics, candidate, identityMap } = result.data;
    assert.equal(diagnostics.phase, 'pre');
    assert.equal(diagnostics.callBound, 4);
    assert.equal(diagnostics.importedCallBound, 2);
    assert.equal(diagnostics.bindingReviewRequired, true);
    assert.deepEqual(diagnostics.unresolvedBindings, []);
    assert.deepEqual(diagnostics.requiredRoles, [identityMap.roles.Analysis]);
    assert.deepEqual(diagnostics.terminals, [{ nodeId: identityMap.nodes.guidance, address: { workflowId: destination.id, instancePath: [], nodeId: identityMap.nodes.guidance }, operation: 'guidance' }]);
    assert.deepEqual(candidate.roles[identityMap.roles.Analysis], imported.roles.Analysis);
    assert.equal(candidate.nodes[identityMap.nodes['response-plan']].profileId, 'node-profile');
    delete imported.roles;
    const unbound = prepareWorkflowInsertion(destination, imported);
    assert.equal(unbound.ok, true);
    assert.deepEqual(unbound.data.diagnostics.unresolvedBindings, [{ nodeId: unbound.data.identityMap.nodes['smart-compactor'], address: { workflowId: destination.id, instancePath: [], nodeId: unbound.data.identityMap.nodes['smart-compactor'] }, role: unbound.data.identityMap.roles.Analysis, missing: ['profileId', 'model'] }]);
});

test('preconditions protect editable aliases/body while camera and selection remain outside signatures', () => {
    const destination = starterGraph('native-guidance'), imported = starterGraph('native-guidance');
    destination.selection = { nodes: ['scene-context'] };
    const result = prepareWorkflowInsertion(destination, imported, { viewPath: [] });
    assert.equal(result.ok, true);
    const { baseSignature, baseDocumentSignature, candidate, viewPath } = result.data;
    assert.equal(baseSignature, graphSemanticSignature(destination));
    assert.equal(baseDocumentSignature, graphDocumentSignature(destination));
    assert.deepEqual(viewPath, []);
    assert.deepEqual(candidate.view, destination.view);
    assert.deepEqual(candidate.selection, destination.selection);
    destination.view.x += 100;
    destination.selection.nodes = [];
    assert.equal(graphDocumentSignature(destination), baseDocumentSignature);
    assert.equal(graphSemanticSignature(destination), baseSignature);
    destination.nodes['response-plan'].title = 'An intervening alias';
    assert.notEqual(graphDocumentSignature(destination), baseDocumentSignature);
    assert.equal(graphSemanticSignature(destination), baseSignature);
    destination.nodes['response-plan'].instructions = 'An intervening body edit';
    assert.notEqual(graphSemanticSignature(destination), baseSignature);
});

test('unsafe inputs, modes, malformed composition and unowned views reject before allocation', () => {
    const destination = starterGraph('native-guidance'), imported = starterGraph('native-guidance');
    let allocations = 0, getterReads = 0;
    const allocateId = () => { allocations++; return `id-${allocations}`; };
    for (const options of [{ at: { x: NaN, y: 0 } }, { at: { x: '1', y: 0 } }, { at: null }, { viewPath: 'instance' }, { allocateId: 12 }, null]) {
        const result = prepareWorkflowInsertion(destination, imported, options);
        assert.equal(result.error?.code, 'INVALID_OPTIONS');
    }
    assert.equal(prepareWorkflowInsertion(destination, imported, { viewPath: ['instance'], allocateId }).error?.code, 'READ_ONLY_VIEW');
    assert.equal(prepareWorkflowInsertion(destination, starterGraph('reviewed-de-slop'), { allocateId }).error?.code, 'MODE_MISMATCH');
    assert.equal(prepareWorkflowInsertion(destination, { schema: 1, nodes: {}, wires: {} }, { allocateId }).error?.code, 'UNSUPPORTED_VERSION');
    const future = { ...imported, schema: 4, runtime: 3 };
    assert.equal(prepareWorkflowInsertion(destination, future, { allocateId }).error?.code, 'UNSUPPORTED_VERSION');
    for (const composition of [{ portals: { p: { id: 'p', source: { nodeId: 'scene-context', portId: 'missing' }, kind: 'context', label: 'Context' } } }, { definitions: { d: { id: 'd', version: 1 } } }]) {
        assert.equal(prepareWorkflowInsertion(destination, { ...imported, schema: 3, runtime: 2, ...composition }, { allocateId }).ok, false);
    }
    const getterGraph = { ...imported, get mode() { getterReads++; return 'native-pre'; } };
    const getterOptions = { get at() { getterReads++; return { x: 0, y: 0 }; } };
    assert.equal(prepareWorkflowInsertion(destination, getterGraph, { allocateId }).ok, false);
    assert.equal(prepareWorkflowInsertion(destination, imported, getterOptions).ok, false);
    assert.equal(prepareWorkflowInsertion(destination, { ...imported, token: 'unsafe' }, { allocateId }).ok, false);
    assert.equal(allocations, 0);
    assert.equal(getterReads, 0);
});

test('allocation rejects unsafe identities and bounds collision retries atomically', () => {
    const destination = starterGraph('native-guidance'), imported = starterGraph('native-guidance');
    const before = structuredClone(destination);
    for (const invalid of ['', null, 12, '__proto__', 'constructor', 'prototype']) {
        assert.equal(prepareWorkflowInsertion(destination, imported, { allocateId: () => invalid }).error?.code, 'INVALID_ID');
    }
    let attempts = 0;
    assert.equal(prepareWorkflowInsertion(destination, imported, { allocateId: () => { attempts++; return 'scene-context'; } }).error?.code, 'IDENTITY_COLLISION');
    assert.ok(attempts <= 100);
    assert.equal(prepareWorkflowInsertion(destination, imported, { allocateId: () => { throw new Error('allocator unavailable'); } }).error?.code, 'INSERTION_FAILED');
    let sequence = 0;
    const result = prepareWorkflowInsertion(destination, imported, { allocateId: () => sequence++ < 2 ? 'scene-context' : `custom-${sequence}` });
    assert.equal(result.ok, true);
    assert.equal(new Set([...result.data.added.nodes, ...result.data.added.wires]).size, 7);
    assert.deepEqual(destination, before);
});

test('explicit placement is exact, preserves relative layout and remaps component membership', () => {
    const destination = starterGraph('reviewed-de-slop'), imported = starterGraph('reviewed-de-slop');
    imported.groups['ai-de-slop'].frame = { x: 400, y: 130, w: 900, h: 400 };
    const result = prepareWorkflowInsertion(destination, imported, { at: { x: -12.5, y: 33.25 } });
    assert.equal(result.ok, true);
    const { candidate, identityMap } = result.data;
    const first = candidate.nodes[identityMap.nodes['reply-snapshot']];
    assert.equal(first.x, -12.5);
    assert.equal(first.y, 33.25);
    const group = candidate.groups[identityMap.groups['ai-de-slop']];
    assert.deepEqual(group.members, imported.groups['ai-de-slop'].members.map(id => identityMap.nodes[id]));
    assert.equal(group.entry, identityMap.nodes['pattern-scan']);
    assert.equal(group.exit, identityMap.nodes['validate-patches']);
    assert.deepEqual(group.component, { id: 'ai-de-slop', version: 1 });
    assert.deepEqual(group.frame, { x: 287.5, y: 23.25, w: 900, h: 400 });
    for (const node of Object.values(imported.nodes)) {
        const copy = candidate.nodes[identityMap.nodes[node.id]];
        assert.equal(copy.x - first.x, node.x - imported.nodes['reply-snapshot'].x);
        assert.equal(copy.y - first.y, node.y - imported.nodes['reply-snapshot'].y);
        if (node.inGroup) assert.equal(copy.inGroup, group.id);
    }
    const automatic = prepareWorkflowInsertion(destination, imported);
    assert.equal(automatic.ok, true);
    const recipientRight = Math.max(...Object.values(destination.nodes).map(node => node.x + node.w));
    assert.ok(Math.min(...automatic.data.added.nodes.map(id => automatic.data.candidate.nodes[id].x)) > recipientRight);
});

test('implicit Analysis/Prose roles become independent explicit namespaces on every insertion', () => {
    for (const [starter, operation, role] of [['native-guidance', 'response-plan', 'Analysis'], ['reviewed-de-slop', 'repair', 'Prose']]) {
        const destination = starterGraph(starter), imported = starterGraph(starter);
        destination.roles[role] = { profileId: 'recipient-profile', model: 'recipient-model' };
        delete imported.roles;
        delete imported.nodes[operation].modelRole;
        const first = prepareWorkflowInsertion(destination, imported);
        assert.equal(first.ok, true);
        const firstRole = first.data.candidate.nodes[first.data.identityMap.nodes[operation]].modelRole;
        assert.equal(typeof firstRole, 'string');
        assert.notEqual(firstRole, role);
        assert.deepEqual(first.data.candidate.roles[firstRole], { profileId: null, model: null });
        assert.deepEqual(first.data.candidate.roles[role], destination.roles[role]);
        const second = prepareWorkflowInsertion(first.data.candidate, imported);
        assert.equal(second.ok, true);
        const secondRole = second.data.candidate.nodes[second.data.identityMap.nodes[operation]].modelRole;
        assert.notEqual(firstRole, secondRole);
        assert.deepEqual(second.data.candidate.roles[firstRole], { profileId: null, model: null });
        assert.equal(new Set([...first.data.added.nodes, ...second.data.added.nodes]).size, 2 * first.data.added.nodes.length);
    }
});
