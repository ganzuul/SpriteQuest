import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareWorkflowInsertion, parseWorkflowInsertionFile } from '../src/workflow/insertion.js';
import { exportWorkflow } from '../src/workflow/packages.js';
import { starterGraph } from '../src/workflow/starters.js';
import { graphDocumentSignature, graphSemanticSignature } from '../src/workflow/ports.js';

test('file preview parses real native and legacy envelopes purely without creating an Output', () => {
    const native = starterGraph('native-guidance'), legacy = legacyFragment();
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'SillyTavern');
    Object.defineProperty(globalThis, 'SillyTavern', { configurable: true, get() { throw new Error('Preview must never read host state'); } });
    try {
        const saved = JSON.stringify(exportWorkflow(native));
        const parsed = parseWorkflowInsertionFile(saved);
        assert.equal(parsed.ok, true); assert.equal(parsed.data.schema, 2);
        assert.deepEqual(Object.keys(parsed.data.nodes), Object.keys(native.nodes));
        for (const file of [JSON.stringify({ kind: 'prompt-canvas-graph', schema: 1, graph: legacy }), JSON.stringify(legacy)]) {
            const result = parseWorkflowInsertionFile(file);
            assert.equal(result.ok, true); assert.deepEqual(result.data, legacy);
            assert.equal(Object.values(result.data.nodes).some(node => node.type === 'output'), false);
        }
    } finally {
        if (previous) Object.defineProperty(globalThis, 'SillyTavern', previous); else delete globalThis.SillyTavern;
    }
});

test('native versions and package mismatch never fall through to legacy file parsing', () => {
    const native = starterGraph('native-guidance');
    for (const file of [
        { kind: 'lattice-workflow', schema: 8, minRuntime: 8, graph: native },
        { kind: 'lattice-workflow', schema: 1, minRuntime: 1, graph: { ...native, schema: 99 } },
        { ...native, schema: 99 },
        { kind: 'prompt-canvas-graph', schema: 1, graph: { ...native, runtime: 99 } },
        { kind: 'lattice-subgraph', schema: 1, minRuntime: 2, graph: legacyFragment() },
    ]) assert.equal(parseWorkflowInsertionFile(JSON.stringify(file)).ok, false);
    assert.equal(parseWorkflowInsertionFile('{').error.code, 'INVALID_JSON');
    assert.equal(parseWorkflowInsertionFile(JSON.stringify({ kind: 'prompt-canvas-graph', schema: 2, graph: legacyFragment() })).error.code, 'UNSUPPORTED_PACKAGE');
});

test('empty imports preserve absent containers and schema without incidental normalization edits', () => {
    const legacy = { id: 'empty-legacy', schema: 1, nodes: { out: { id: 'out', type: 'output' } }, wires: {} };
    const native = starterGraph('native-guidance');
    for (const [destination, imported] of [[legacy, { schema: 1, nodes: {}, wires: {} }], [native, { schema: 2, runtime: 1, mode: 'native-pre', nodes: {}, wires: {} }]]) {
        const result = prepareWorkflowInsertion(destination, imported);
        assert.equal(result.ok, true); assert.deepEqual(result.data.candidate, destination);
        assert.equal(Object.values(result.data.added).every(ids => !ids.length), true);
    }
});

function legacyFragment() {
    const node = (id, type, extra = {}) => ({ id, type, x: 10, y: 20, w: 260, enabled: true, ...extra });
    return { schema: 1, nodes: {
        prompt: node('prompt', 'prompt', { content: 'Keep {{user}} agency', role: 'system', inGroup: 'group' }),
        generate: node('generate', 'generate', { x: 310, repeat: 2, role: 'user', model: 'saved-model', inGroup: 'group' }),
        peer: node('peer', 'generate', { y: 400 }),
        decider: node('decider', 'decider', { mode: 'first', keys: [{ id: 'yes', conditions: [{ mode: 'search', scope: 'incoming', terms: 'yes' }] }], fallback: { id: 'no' } }),
        state: node('state', 'state', { values: [{ id: 'energy', start: 10, stageDots: true, rules: [{ id: 'rule', when: 'turn', op: 'sub', amount: '1' }], stages: [{ id: 'low', from: 0, to: 4, text: 'Tired' }] }] }),
        memory: node('memory', 'memory', { content: 'Initial memory' }),
    }, wires: {
        forward: { id: 'forward', from: 'prompt', to: 'generate', kind: 'prepend', order: 1 },
        result: { id: 'result', from: 'decider', to: 'prompt', kind: 'merge', port: 'yes', mode: 'result', result: 'matched' },
        stage: { id: 'stage', from: 'state', to: 'prompt', kind: 'merge', port: 'energy:low', mode: 'activate' },
        loop: { id: 'loop', from: 'generate', to: 'prompt', kind: 'merge', loop: { max: 3, stopWhenSame: true } },
        save: { id: 'save', from: 'generate', to: 'memory', kind: 'save' },
        together: { id: 'together', from: 'generate', to: 'peer', kind: 'together' },
    }, groups: { group: { id: 'group', title: 'Legacy group', x: 0, y: 0, members: ['prompt', 'generate'] } } };
}

test('legacy review preconditions include text, aliases and local port rules but exclude camera bookkeeping', () => {
    const destination = legacyFragment(), result = prepareWorkflowInsertion(destination, legacyFragment());
    assert.equal(result.ok, true);
    const signature = result.data.baseSignature;
    destination.view = { x: 400, y: 0, zoom: 2 };
    destination.selection = ['prompt'];
    destination.updatedAt = 99;
    assert.equal(graphDocumentSignature(destination), signature);
    for (const change of [
        graph => { graph.nodes.prompt.content = 'Changed body'; },
        graph => { graph.nodes.prompt.title = 'Changed alias'; },
        graph => { graph.nodes.decider.keys[0].conditions[0].terms = 'Changed rule'; },
        graph => { graph.nodes.state.values[0].rules[0].amount = '2'; },
    ]) {
        const changed = structuredClone(destination);
        change(changed);
        assert.notEqual(graphDocumentSignature(changed), signature);
    }
    let allocations = 0;
    const collided = prepareWorkflowInsertion(destination, legacyFragment(), { allocateId: () => { allocations++; return 'prompt'; } });
    assert.equal(collided.error?.code, 'IDENTITY_COLLISION');
    assert.equal(allocations, 100);
    const oversized = legacyFragment();
    for (let i = 0; i < 990; i++) oversized.nodes[`note-${i}`] = { id: `note-${i}`, type: 'note', x: 0, y: 0 };
    assert.equal(prepareWorkflowInsertion(oversized, legacyFragment()).error?.code, 'GRAPH_LIMIT');
});

test('legacy diagnostics expose conservative request bounds and save effects without resolving host bindings', () => {
    const destination = legacyFragment(), imported = legacyFragment();
    const originalHost = Object.getOwnPropertyDescriptor(globalThis, 'SillyTavern');
    let hostReads = 0;
    Object.defineProperty(globalThis, 'SillyTavern', { configurable: true, get() { hostReads++; throw new Error('host must not be read'); } });
    try {
        const result = prepareWorkflowInsertion(destination, imported);
        assert.equal(result.ok, true);
        const { diagnostics, identityMap } = result.data;
        assert.equal(diagnostics.callBound, 42);
        assert.equal(diagnostics.importedCallBound, 12);
        assert.equal(diagnostics.boundKind, 'conservative');
        assert.equal(diagnostics.bindingReviewRequired, true);
        assert.deepEqual(diagnostics.requiredRoles, []);
        assert.deepEqual(diagnostics.terminals, [{ nodeId: identityMap.nodes.memory, operation: 'save-memory' }]);
        assert.deepEqual(diagnostics.inheritedBindings, [identityMap.nodes.generate, identityMap.nodes.peer]);
        assert.equal(hostReads, 0);
    } finally {
        if (originalHost) Object.defineProperty(globalThis, 'SillyTavern', originalHost);
        else delete globalThis.SillyTavern;
    }
});

test('historical legacy imports normalize only shipped obsolete fields and preserve recipient data', () => {
    const destination = legacyFragment(), imported = legacyFragment();
    delete destination.schema;
    delete imported.schema;
    delete destination.nodes.prompt.inGroup;
    destination.nodes.prompt.group = 'group';
    destination.wires.forward.kind = 'sequence';
    delete imported.nodes.prompt.inGroup;
    imported.nodes.prompt.group = 'group';
    imported.nodes.lore = { id: 'lore', type: 'lorebook', group: 'lore-filter', x: 10, y: 20 };
    imported.wires.forward.kind = 'sequence';
    const original = structuredClone(destination);
    const result = prepareWorkflowInsertion(destination, imported);
    assert.equal(result.ok, true);
    const { candidate, identityMap } = result.data;
    assert.equal(Object.hasOwn(candidate, 'schema'), false);
    assert.equal(candidate.nodes[identityMap.nodes.prompt].inGroup, identityMap.groups.group);
    assert.equal(Object.hasOwn(candidate.nodes[identityMap.nodes.prompt], 'group'), false);
    assert.equal(candidate.nodes[identityMap.nodes.lore].group, 'lore-filter');
    assert.equal(candidate.wires[identityMap.wires.forward].kind, 'merge');
    assert.deepEqual(candidate.nodes.prompt, original.nodes.prompt);
    assert.deepEqual(candidate.wires.forward, original.wires.forward);
    assert.deepEqual(destination, original);
});

test('legacy unsafe identities, missing keyed references and unsupported wire semantics reject before allocation', () => {
    const destination = legacyFragment(), before = structuredClone(destination);
    const changes = [
        graph => { graph.wires.result.port = 'missing-key'; },
        graph => { graph.wires.stage.port = 'energy:missing-stage'; },
        graph => { graph.nodes.state.values[0].stageDots = false; },
        graph => { graph.nodes.decider.keys.push({ id: 'yes' }); },
        graph => { graph.nodes.prompt.inGroup = 'missing-group'; },
        graph => { graph.groups.group.entry = 'missing-node'; },
        graph => { graph.groups.group.members.push('prompt'); },
        graph => { graph.wires.loop.from = 'state'; },
        graph => { graph.wires.loop.loop.max = -1; },
        graph => { delete graph.wires.loop.loop; },
        graph => { graph.wires.save.to = 'prompt'; },
        graph => { graph.wires.together.from = 'prompt'; },
        graph => { graph.wires.forward.mode = 'future-mode'; },
        graph => { graph.wires.forward.kind = 'future-kind'; },
        graph => { graph.nodes.prompt.type = 'workflow'; },
        graph => { graph.nodes.prompt.id = 'other'; },
        graph => { graph.portals = { p: { id: 'p' } }; },
    ];
    let allocated = 0;
    for (const change of changes) {
        const graph = legacyFragment();
        change(graph);
        assert.equal(prepareWorkflowInsertion(destination, graph, { allocateId: () => `id-${++allocated}` }).ok, false);
    }
    assert.equal(allocated, 0);
    assert.deepEqual(destination, before);
    let getters = 0;
    const unsafe = legacyFragment();
    Object.defineProperty(unsafe.nodes.prompt, 'content', { get() { getters++; return 'unsafe'; } });
    assert.equal(prepareWorkflowInsertion(destination, unsafe).ok, false);
    assert.equal(getters, 0);
    assert.equal(prepareWorkflowInsertion(destination, starterGraph('native-guidance')).error?.code, 'MODE_MISMATCH');
    assert.equal(prepareWorkflowInsertion(starterGraph('native-guidance'), destination).error?.code, 'MODE_MISMATCH');
});

test('legacy duplicate Output rejects atomically with Open separately guidance and never synthesizes terminals', () => {
    const destination = legacyFragment(), imported = legacyFragment();
    destination.nodes.output = { id: 'output', type: 'output', x: 0, y: 900 };
    imported.nodes.output = { id: 'output', type: 'output', x: 0, y: 900 };
    const before = structuredClone(destination);
    let allocations = 0;
    const result = prepareWorkflowInsertion(destination, imported, { allocateId: () => `allocated-${++allocations}` });
    assert.equal(result.error?.code, 'DUPLICATE_OUTPUT');
    assert.match(result.error.message, /Open separately/);
    assert.match(result.error.message, /fragment without Output/);
    assert.equal(allocations, 0);
    assert.deepEqual(destination, before);
    const withoutOutput = prepareWorkflowInsertion(legacyFragment(), legacyFragment());
    assert.equal(withoutOutput.ok, true);
    assert.equal(Object.values(withoutOutput.data.candidate.nodes).some(node => node.type === 'output'), false);
    const firstOutput = prepareWorkflowInsertion(legacyFragment(), imported);
    assert.equal(firstOutput.ok, true);
    assert.equal(Object.values(firstOutput.data.candidate.nodes).filter(node => node.type === 'output').length, 1);
});

test('legacy fragments insert into populated legacy graphs preserving keyed ports, wire modes and recipient Output', () => {
    const destination = legacyFragment();
    destination.id = 'legacy-root';
    destination.mode = 'legacy';
    destination.roles = { saved: 'recipient metadata' };
    destination.nodes.output = { id: 'output', type: 'output', x: 0, y: 900 };
    const imported = legacyFragment(), before = structuredClone(destination), original = structuredClone(imported);
    const result = prepareWorkflowInsertion(destination, imported, { at: { x: 1000, y: 300 } });
    assert.equal(result.ok, true);
    const { candidate, identityMap, diagnostics, baseSignature, baseDocumentSignature } = result.data;
    assert.equal(candidate.schema, 1);
    assert.equal(candidate.mode, 'legacy');
    assert.equal(candidate.runtime, undefined);
    assert.deepEqual(candidate.roles, destination.roles);
    assert.deepEqual(candidate.nodes.output, destination.nodes.output);
    assert.equal(Object.values(candidate.nodes).filter(node => node.type === 'output').length, 1);
    assert.equal(candidate.nodes[identityMap.nodes.prompt].x, 1000);
    assert.equal(candidate.nodes[identityMap.nodes.generate].x, 1300);
    assert.equal(candidate.nodes[identityMap.nodes.prompt].role, 'system');
    assert.equal(candidate.nodes[identityMap.nodes.generate].role, 'user');
    assert.deepEqual(candidate.nodes[identityMap.nodes.decider].keys, imported.nodes.decider.keys);
    assert.deepEqual(candidate.nodes[identityMap.nodes.state].values, imported.nodes.state.values);
    for (const wire of Object.values(imported.wires)) {
        assert.deepEqual(candidate.wires[identityMap.wires[wire.id]], { ...wire, id: identityMap.wires[wire.id], from: identityMap.nodes[wire.from], to: identityMap.nodes[wire.to] });
    }
    assert.equal(candidate.nodes[identityMap.nodes.prompt].inGroup, identityMap.groups.group);
    assert.deepEqual(candidate.groups[identityMap.groups.group].members, ['prompt', 'generate'].map(id => identityMap.nodes[id]));
    assert.equal(diagnostics.phase, 'legacy');
    assert.equal(diagnostics.recipientOutputPreserved, 'output');
    assert.equal(baseSignature, graphDocumentSignature(destination));
    assert.equal(baseDocumentSignature, graphDocumentSignature(destination));
    assert.deepEqual(destination, before);
    assert.deepEqual(imported, original);
    const repeated = prepareWorkflowInsertion(candidate, imported);
    assert.equal(repeated.ok, true);
    assert.notEqual(repeated.data.identityMap.nodes.prompt, identityMap.nodes.prompt);
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

test('candidate limits, malformed layout and schema2 composition cannot bypass atomic validation', () => {
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
    assert.deepEqual(diagnostics.terminals, [{ nodeId: identityMap.nodes.guidance, operation: 'guidance' }]);
    assert.deepEqual(candidate.roles[identityMap.roles.Analysis], imported.roles.Analysis);
    assert.equal(candidate.nodes[identityMap.nodes['response-plan']].profileId, 'node-profile');
    delete imported.roles;
    const unbound = prepareWorkflowInsertion(destination, imported);
    assert.equal(unbound.ok, true);
    assert.deepEqual(unbound.data.diagnostics.unresolvedBindings, [{ nodeId: unbound.data.identityMap.nodes['smart-compactor'], role: unbound.data.identityMap.roles.Analysis, missing: ['profileId', 'model'] }]);
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

test('unsafe inputs, modes, unsupported composition and nonroot views reject before allocation', () => {
    const destination = starterGraph('native-guidance'), imported = starterGraph('native-guidance');
    let allocations = 0, getterReads = 0;
    const allocateId = () => { allocations++; return `id-${allocations}`; };
    for (const options of [{ at: { x: NaN, y: 0 } }, { at: { x: '1', y: 0 } }, { at: null }, { viewPath: 'instance' }, { allocateId: 12 }, null]) {
        const result = prepareWorkflowInsertion(destination, imported, options);
        assert.equal(result.error?.code, 'INVALID_OPTIONS');
    }
    assert.equal(prepareWorkflowInsertion(destination, imported, { viewPath: ['instance'], allocateId }).error?.code, 'READ_ONLY_VIEW');
    assert.equal(prepareWorkflowInsertion(destination, starterGraph('reviewed-de-slop'), { allocateId }).error?.code, 'MODE_MISMATCH');
    assert.equal(prepareWorkflowInsertion(destination, { schema: 1, nodes: {}, wires: {} }, { allocateId }).error?.code, 'MODE_MISMATCH');
    const future = { ...imported, schema: 4, runtime: 3 };
    assert.equal(prepareWorkflowInsertion(destination, future, { allocateId }).error?.code, 'UNSUPPORTED_VERSION');
    for (const composition of [{ portals: { p: { id: 'p', source: { nodeId: 'scene-context', portId: 'out' }, kind: 'context', label: 'Context' } } }, { definitions: { d: { id: 'd', version: 1 } } }]) {
        assert.equal(prepareWorkflowInsertion(destination, { ...imported, schema: 3, runtime: 2, ...composition }, { allocateId }).error?.code, 'UNSUPPORTED_COMPOSITION');
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
