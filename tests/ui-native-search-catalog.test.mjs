import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ARTIFACT_KINDS, describeOperation, operationDefaults, portsForNode } from '../src/workflow/catalog.js';
import { computeDefinitionIdentity, definitionRefKey, validateDefinition } from '../src/workflow/definitions.js';
import { prepareNativeConnectionEdit } from '../src/workflow/connection-edits.js';
import { createNativeWireBridge } from '../src/ui/native-wire-bridge.js';
import { captureGraphEditContext, commitPreparedGraph } from '../src/workflow/transactions.js';
import * as history from '../src/history.js?v=0.21.0';
const api = await import('../src/ui/native-search-catalog.js?v=0.21.0').catch(() => ({}));
const scope = (mode = 'native-pre', extra = {}) => ({ schema: 3, runtime: 2, mode, workflowId: 'root', viewPath: [], inDefinition: false, ...extra });
function catalog(input = scope(), options) {
    assert.equal(typeof api.prepareNativeSearchCatalog, 'function');
    const result = api.prepareNativeSearchCatalog(input, options);
    assert.equal(result.ok, true, JSON.stringify(result));
    return result.data;
}
const choice = (value, id) => value.choices.find(item => item.id === id);

test('default and declared variants describe real pins in the containing phase without allocated identities', () => {
    for (const mode of ['native-pre', 'native-post']) {
        const value = catalog(scope(mode));
        for (const item of value.choices.filter(item => !item.disabledReason)) {
            const command = api.resolveNativeSearchChoice(value, item.id);
            const described = describeOperation(scope(mode), { type: 'workflow', ...operationDefaults(command.operation), ...command.controls,
                ...(command.operation === 'reroute' ? { artifactKind: command.artifactKind, phase: mode.slice(7) } : {}) });
            assert.equal(described.ok, true);
            assert.equal(item.phase, mode.slice(7));
            assert.deepEqual(item.ports, described.data.ports.map(port => ({ portId: port.id, dir: port.direction === 'input' ? 'in' : 'out', kind: port.kind, label: port.label, required: port.required })));
            for (const port of item.ports) for (const key of ['nodeId', 'center', 'address']) assert.equal(Object.hasOwn(port, key), false);
        }
        assert.equal(choice(value, 'operation:reroute'), undefined);
        assert.ok(value.families.includes('Transpose'));
        assert.equal(value.choices.some(item => item.family === 'Transpose'), false);
    }
});

const ref = value => ({ id: value.id, version: value.version, semanticHash: value.semanticHash });
const finalize = draft => {
    const identity = computeDefinitionIdentity(draft); assert.equal(identity.ok, true, JSON.stringify(identity));
    return { ...structuredClone(identity.data.materializedDefinition), semanticHash: identity.data.semanticHash };
};
const wire = (id, from, to, fromPort = 'out', toPort = 'in') => ({ id, route: 'wire', from, fromPort, to, toPort, order: 0 });
function savedClosure() {
    const interfacePorts = [
        { id: 'left', label: 'Left', direction: 'input', kind: 'context', required: true, cardinality: 'one', boundaryNodeId: 'entry-left' },
        { id: 'right', label: 'Right', direction: 'input', kind: 'context', required: true, cardinality: 'one', boundaryNodeId: 'entry-right' },
        { id: 'primary', label: 'Primary', direction: 'output', kind: 'context', required: false, cardinality: 'one', boundaryNodeId: 'exit-primary' },
        { id: 'secondary', label: 'Secondary', direction: 'output', kind: 'context', required: false, cardinality: 'one', boundaryNodeId: 'exit-secondary' },
    ];
    const boundaryNodes = Object.fromEntries(interfacePorts.map(port => [port.boundaryNodeId, { id: port.boundaryNodeId, type: port.direction === 'input' ? 'subgraph-input' : 'subgraph-output', interfacePortId: port.id }]));
    const child = finalize({ id: 'checked-leaf', version: 2, name: 'Inner Loom', interface: interfacePorts, parameters: [], body: {
        schema: 3, runtime: 2, mode: 'native-pre', nodes: { ...boundaryNodes,
            first: { id: 'first', type: 'workflow', operation: 'smart-compactor' }, second: { id: 'second', type: 'workflow', operation: 'smart-compactor' } },
        wires: { a: wire('a', 'entry-left', 'first'), b: wire('b', 'first', 'exit-primary'), c: wire('c', 'entry-right', 'second'), d: wire('d', 'second', 'exit-secondary') },
    } });
    const definition = finalize({ id: 'checked-outer', version: 3, name: 'Saved Nested Loom', interface: interfacePorts, parameters: [], body: {
        schema: 3, runtime: 2, mode: 'native-pre', nodes: { ...boundaryNodes,
            nested: { id: 'nested', type: 'subgraph', definition: ref(child), parameterOverrides: {}, roleOverrides: {}, nodeBindingOverrides: {} } },
        wires: { a: wire('a', 'entry-left', 'nested', 'out', 'left'), b: wire('b', 'nested', 'exit-primary', 'primary'),
            c: wire('c', 'entry-right', 'nested', 'out', 'right'), d: wire('d', 'nested', 'exit-secondary', 'secondary') },
    } });
    return { definition, snapshots: { [definitionRefKey(child)]: child } };
}
let catalogRootSequence = 0;
const graph = (mode = 'native-pre') => ({ id: 'catalog-root-' + ++catalogRootSequence, schema: 3, runtime: 2, mode, nodes: {}, wires: {}, definitions: {}, portals: {}, groups: {} });
const catalogScope = root => scope(root.mode, { workflowId: root.id });

test('typed reroutes expose all actual kinds and create real containing-phase nodes without a generic preset', () => {
    for (const mode of ['native-pre', 'native-post']) {
        const root = graph(mode), value = catalog(catalogScope(root));
        assert.equal(value.choices.filter(item => item.id.startsWith('operation:reroute:')).length, 7);
        for (const kind of ARTIFACT_KINDS) {
            const id = 'operation:reroute:' + kind, item = choice(value, id);
            assert.ok(item, id); assert.equal(item.phase, mode.slice(7));
            assert.deepEqual(item.ports.map(port => [port.portId, port.dir, port.kind]), [['in', 'in', kind], ['out', 'out', kind]]);
            const result = prepareNativeConnectionEdit(root, { kind: 'create', ...api.resolveNativeSearchChoice(value, id), graphPoint: { x: -4.125, y: 91.75 } });
            assert.equal(result.ok, true, JSON.stringify(result));
            const node = result.data.candidate.nodes[result.data.addedNodeIds[0]];
            assert.deepEqual([node.operation, node.artifactKind, node.phase, node.compact, node.x, node.y], ['reroute', kind, mode.slice(7), true, -4.125, 91.75]);
            assert.deepEqual(portsForNode(result.data.candidate, node).map(port => [port.id, port.kind]), [['in', kind], ['out', kind]]);
            assert.deepEqual(api.filterNativeSearchChoices(value, { query: 'Reroute', origin: { dir: 'out', kind } }).map(item => item.id), [id]);
        }
        assert.equal(api.resolveNativeSearchChoice(value, 'operation:reroute'), null);
    }
});

test('checked real closures enable exact saved names and ports while bodies stay private and detached', () => {
    const saved = savedClosure(), before = structuredClone(saved);
    assert.equal(validateDefinition(saved.definition, saved.snapshots).ok, true);
    const value = catalog(scope(), { checkedLibraryClosures: [saved] }), id = 'definition:' + definitionRefKey(saved.definition), item = choice(value, id);
    assert.equal(item.label, 'Saved Nested Loom'); assert.deepEqual(item.definitionRef, ref(saved.definition)); assert.equal(item.disabledReason, undefined);
    assert.deepEqual(item.ports.map(port => [port.portId, port.dir]), [['left', 'in'], ['right', 'in'], ['primary', 'out'], ['secondary', 'out']]);
    for (const key of ['definition', 'snapshots', 'body', 'parameters']) assert.equal(Object.hasOwn(item, key), false);
    for (const port of item.ports) for (const key of ['boundaryNodeId', 'nodeId', 'address', 'center']) assert.equal(Object.hasOwn(port, key), false);
    assert.equal(JSON.stringify(value).includes('checked-leaf'), false);
    const packet = api.resolveNativeSearchChoice(value, id);
    assert.equal(packet.kind, 'create-instance'); assert.deepEqual(packet.definition, before.definition); assert.deepEqual(packet.snapshots, before.snapshots);
    assert.ok(Object.isFrozen(packet)); assert.ok(Object.isFrozen(packet.definition.body.nodes)); assert.ok(Object.isFrozen(packet.snapshots));
    saved.definition.name = 'Mutated'; saved.definition.body.nodes.nested.definition.id = 'mutated'; saved.snapshots = {};
    assert.equal(item.label, 'Saved Nested Loom'); assert.deepEqual(api.resolveNativeSearchChoice(value, id), packet);
    assert.deepEqual(api.matchNativeSearchPorts(value, id, { dir: 'out', kind: 'context' }).map(port => port.portId), ['left', 'right']);
    assert.deepEqual(api.matchNativeSearchPorts(value, id, { dir: 'in', kind: 'context' }).map(port => port.portId), ['primary', 'secondary']);
    assert.equal(api.resolveNativeSearchChoice(structuredClone(value), id), null);
    assert.ok(api.filterNativeSearchChoices(value, { query: 'Saved Nested Loom' }).some(item => item.id === id));
    let reads = 0; Object.defineProperty(saved.definition.body, 'nodes', { enumerable: true, get() { reads++; throw new Error('source lookup'); } });
    for (let i = 0; i < 5; i++) {
        assert.ok(api.filterNativeSearchChoices(value, { query: 'Loom', origin: { dir: 'out', kind: 'context' } }).some(item => item.id === id));
        assert.equal(api.resolveNativeSearchChoice(value, id), packet);
    }
    assert.equal(reads, 0);
});

test('closure preparation rejects hashes, missing children, root-only bodies, duplicates and accessor data', () => {
    const saved = savedClosure(), id = 'definition:' + definitionRefKey(saved.definition);
    const invalid = [
        { definition: { ...saved.definition, semanticHash: 'sha256:' + 'f'.repeat(64) }, snapshots: saved.snapshots },
        { definition: saved.definition },
        { ...saved, snapshots: null },
        { ...saved, definitionRef: ref(saved.definition) },
    ];
    const forbidden = structuredClone(saved.definition); forbidden.id = 'forbidden'; forbidden.body.nodes.rootSource = { id: 'rootSource', type: 'workflow', operation: 'scene-context' };
    invalid.push({ definition: finalize(forbidden), snapshots: saved.snapshots });
    for (const entry of invalid) assert.equal(api.prepareNativeSearchCatalog(scope(), { checkedLibraryClosures: [entry] }).ok, false);
    assert.equal(api.prepareNativeSearchCatalog(scope(), { checkedLibraryClosures: [saved, saved] }).ok, false);
    const metadata = { definitionRef: ref(saved.definition), name: saved.definition.name, phase: 'pre', ports: saved.definition.interface.map(({ boundaryNodeId, ...port }) => port) };
    assert.equal(api.prepareNativeSearchCatalog(scope(), { checkedLibraryClosures: [saved], checkedLibraryEntries: [metadata] }).ok, false);
    assert.equal(api.resolveNativeSearchChoice(catalog(scope(), { checkedLibraryEntries: [metadata] }), id), null);
    let reads = 0; const trapped = structuredClone(saved);
    Object.defineProperty(trapped.snapshots[Object.keys(trapped.snapshots)[0]].body, 'nodes', { enumerable: true, get() { reads++; return {}; } });
    assert.equal(api.prepareNativeSearchCatalog(scope(), { checkedLibraryClosures: [trapped] }).ok, false); assert.equal(reads, 0);
    const oversized = structuredClone(saved); oversized.definition.name = '界'.repeat(700000);
    assert.equal(api.prepareNativeSearchCatalog(scope(), { checkedLibraryClosures: [oversized] }).ok, false);
});

test('closure phase filtering keeps exact private scope and optional empty snapshots without public body leakage', () => {
    const pre = savedClosure(), post = { definition: finalize({ id: 'post-saved', version: 1, name: 'Post Relay', interface: [], parameters: [], body: {
        schema: 3, runtime: 2, mode: 'native-post', nodes: { relay: { id: 'relay', type: 'workflow', operation: 'reroute', artifactKind: 'draft', phase: 'post' } }, wires: {},
    } }) };
    for (const mode of ['native-pre', 'native-post']) {
        const value = catalog(scope(mode, { viewPath: ['owned', 'nested'], inDefinition: true }), { checkedLibraryClosures: [pre, post] });
        const wanted = mode === 'native-pre' ? pre : post, other = mode === 'native-pre' ? post : pre;
        assert.deepEqual(value.scope.viewPath, ['owned', 'nested']);
        assert.deepEqual(value.choices.filter(item => item.family === 'Subgraphs').map(item => item.label), [wanted.definition.name]);
        assert.equal(api.resolveNativeSearchChoice(value, 'definition:' + definitionRefKey(other.definition)), null);
        assert.ok(api.resolveNativeSearchChoice(value, 'definition:' + definitionRefKey(wanted.definition)));
        for (const operation of ['scene-context', 'reply-snapshot', 'guidance', 'apply-reply']) assert.equal(choice(value, 'operation:' + operation), undefined);
    }
});

test('an enabled real 257-port Unicode definition preserves every named choice and excludes unrelated snapshots', () => {
    const ports = Array.from({ length: 257 }, (_, i) => ({ id: 'port-' + i, label: 'Port ' + i, direction: 'input', kind: 'context', required: false, cardinality: 'one', boundaryNodeId: 'boundary-' + i }));
    const definition = finalize({ id: '界'.repeat(300), version: 1, name: 'Wide Saved Loom', interface: ports, parameters: [], body: {
        schema: 3, runtime: 2, mode: 'native-pre', nodes: Object.fromEntries(ports.map(port => [port.boundaryNodeId, { id: port.boundaryNodeId, type: 'subgraph-input', interfacePortId: port.id }])), wires: {},
    } });
    const unrelated = savedClosure(), value = catalog(scope(), { checkedLibraryClosures: [{ definition, snapshots: { [definitionRefKey(unrelated.definition)]: unrelated.definition, ...unrelated.snapshots } }] });
    const id = 'definition:' + definitionRefKey(definition);
    assert.deepEqual(api.matchNativeSearchPorts(value, id, { dir: 'out', kind: 'context' }).map(port => port.portId), ports.map(port => port.id));
    const packet = api.resolveNativeSearchChoice(value, id); assert.deepEqual(packet.snapshots, {}); assert.equal(packet.definition.id, definition.id);
    const result = prepareNativeConnectionEdit(graph(), { kind: 'create', ...packet, graphPoint: { x: 5, y: 7 } });
    assert.equal(result.ok, true, JSON.stringify(result)); assert.equal(portsForNode(result.data.candidate, result.data.candidate.nodes[result.data.addedNodeIds[0]]).length, 257);
});

function bridgeFixture(saved = savedClosure(), mode = 'native-pre') {
    const root = graph(mode), commands = [], contexts = new WeakMap(), counts = { prepare: 0, commit: 0, opaqueReads: 0 };
    root.nodes.source = { id: 'source', type: 'workflow', operation: 'scene-context' };
    root.nodes.target = { id: 'target', type: 'workflow', operation: 'smart-compactor' };
    root.nodes.text = { id: 'text', type: 'workflow', ...operationDefaults('compose') };
    root.wires.incoming = wire('incoming', 'source', 'target');
    const context = { sessionId: root.id, viewPath: [], readOnly: false };
    let current = true;
    const value = catalog(catalogScope(root), { checkedLibraryClosures: [saved] });
    const bridge = createNativeWireBridge({ catalog: value, adapter: {
        capture() {
            const tx = captureGraphEditContext(root, () => context); if (!tx.ok) return tx;
            const opaque = new Proxy({}, { get() { counts.opaqueReads++; throw new Error('opaque read'); }, ownKeys() { counts.opaqueReads++; throw new Error('opaque keys'); }, getPrototypeOf() { counts.opaqueReads++; throw new Error('opaque prototype'); }, preventExtensions() { counts.opaqueReads++; throw new Error('opaque freeze'); } });
            contexts.set(opaque, tx.data); return { ok: true, data: opaque };
        },
        isCurrent(capture) { return contexts.has(capture) && current && !context.readOnly; },
        prepare(capture, command) { counts.prepare++; commands.push(command); return prepareNativeConnectionEdit(root, command); },
        commit(capture, prepared) { counts.commit++; return commitPreparedGraph(root, { ...prepared, context: contexts.get(capture) }); },
    } });
    const pin = (nodeId, dir = 'out', kind = 'context') => ({ nodeId, portId: dir === 'out' ? 'out' : 'in', dir, kind, center: { x: 10, y: 20 }, address: { workflowId: root.id, instancePath: [], nodeId, portId: dir === 'out' ? 'out' : 'in' } });
    const search = origin => {
        bridge.dispatch({ type: 'begin-pin', pin: origin, pointerId: 1, graphPoint: { x: 0, y: 0 }, originalBindings: [] });
        bridge.dispatch({ type: 'release', pointerId: 1, graphPoint: { x: -103.125, y: 71.75 }, screenAnchor: { x: 999, y: 720 }, hit: { kind: 'empty' } });
        return bridge.actions().search;
    };
    return { root, value, bridge, counts, commands, context, pin, search, stale() { current = false; } };
}
const settle = async () => { for (let i = 0; i < 5; i++) await Promise.resolve(); };

test('the existing bridge creates checked instances in either direction with explicit named-port choice and one history step', async () => {
    for (const reverse of [false, true]) {
        const saved = savedClosure(), env = bridgeFixture(saved), before = structuredClone(env.root), savedBefore = structuredClone(saved);
        history.track(env.root);
        const actions = env.search(reverse ? env.pin('target', 'in') : env.pin('source'));
        actions.choose('definition:' + definitionRefKey(saved.definition));
        assert.equal(env.bridge.project().search.mode, 'ports'); assert.equal(env.counts.prepare, 0);
        assert.deepEqual(env.bridge.project().search.ports.map(port => port.portId), reverse ? ['primary', 'secondary'] : ['left', 'right']);
        const selectedPort = reverse ? 'secondary' : 'right';
        env.bridge.actions().search.choosePort(selectedPort); await settle();
        assert.equal(env.counts.prepare, 1); assert.equal(env.counts.commit, 1); assert.equal(env.counts.opaqueReads, 0);
        const packet = env.commands[0]; assert.equal(packet.kind, 'create-instance'); assert.equal(packet.connection.portId, selectedPort);
        assert.deepEqual(packet.graphPoint, { x: -103.125, y: 71.75 });
        const added = Object.values(env.root.nodes).find(node => !Object.hasOwn(before.nodes, node.id));
        assert.deepEqual([added.type, added.x, added.y], ['subgraph', -103.125, 71.75]); assert.deepEqual(added.definition, ref(saved.definition));
        const addedWire = Object.values(env.root.wires).find(edge => !Object.hasOwn(before.wires, edge.id));
        assert.deepEqual([addedWire.from, addedWire.fromPort, addedWire.to, addedWire.toPort],
            reverse ? [added.id, 'secondary', 'target', 'in'] : ['source', 'out', added.id, 'right']);
        assert.equal(Object.hasOwn(env.root.wires, 'incoming'), !reverse);
        assert.equal(env.bridge.hasContentGesture(), false); assert.deepEqual(saved, savedBefore);
        assert.ok(history.undo(env.root)); assert.deepEqual(env.root, before); assert.equal(history.undo(env.root), null);
        assert.ok(history.redo(env.root)); assert.equal(env.root.nodes[added.id].type, 'subgraph'); assert.equal(history.redo(env.root), null);
    }
});

test('typed reroute packets also pass the existing bridge in both connection directions', async () => {
    for (const reverse of [false, true]) {
        const env = bridgeFixture(), beforeIds = new Set(Object.keys(env.root.nodes));
        const actions = env.search(reverse ? env.pin('target', 'in') : env.pin('source'));
        actions.choose('operation:reroute:context'); await settle();
        assert.equal(env.counts.prepare, 1); assert.equal(env.counts.commit, 1);
        assert.deepEqual(env.commands[0], { kind: 'create', operation: 'reroute', artifactKind: 'context', graphPoint: { x: -103.125, y: 71.75 },
            connection: { origin: { nodeId: reverse ? 'target' : 'source', portId: reverse ? 'in' : 'out' }, portId: reverse ? 'out' : 'in', replace: true } });
        const node = Object.values(env.root.nodes).find(node => !beforeIds.has(node.id));
        assert.deepEqual([node.operation, node.artifactKind, node.phase, node.compact], ['reroute', 'context', 'pre', true]);
        assert.equal(env.bridge.hasContentGesture(), false); assert.equal(env.counts.opaqueReads, 0);
    }
});

test('context-off library selection creates unconnected and obsolete catalog actions cannot retarget a new scope', async () => {
    const saved = savedClosure(), env = bridgeFixture(saved), id = 'definition:' + definitionRefKey(saved.definition);
    const old = env.search(env.pin('text', 'out', 'text'));
    assert.equal(env.bridge.project().search.choices.some(item => item.id === id), false);
    old.setContextSensitive(false); assert.ok(env.bridge.project().search.choices.some(item => item.id === id));
    old.choose(id); await settle();
    assert.equal(env.counts.commit, 1); assert.equal(env.commands[0].kind, 'create-instance'); assert.equal(env.commands[0].connection, undefined);
    assert.deepEqual(Object.keys(env.root.wires), ['incoming']);
    const pending = env.search(env.pin('source'));
    env.bridge.replaceCatalog(catalog(scope('native-pre', { workflowId: env.root.id, viewPath: ['new-view'], inDefinition: true }), { checkedLibraryClosures: [saved] }));
    pending.choose(id); pending.setContextSensitive(false); old.choose(id); await settle();
    assert.equal(env.counts.commit, 1); assert.equal(env.counts.prepare, 1); assert.equal(env.bridge.hasContentGesture(), false);
    const fresh = bridgeFixture(saved), freshActions = fresh.search(fresh.pin('source')); fresh.stale(); freshActions.choose(id); await settle();
    assert.equal(fresh.counts.prepare, 0); assert.equal(fresh.counts.commit, 0);
    const readonly = bridgeFixture(saved), readonlyBefore = structuredClone(readonly.root); readonly.context.readOnly = true;
    assert.equal(readonly.search(readonly.pin('source')), null); assert.equal(readonly.counts.prepare, 0); assert.deepEqual(readonly.root, readonlyBefore);
});

test('Draft Text Rules, JSON check, Compose Input and Context Join expose actual variant ports', () => {
    const pre = catalog(), post = catalog(scope('native-post'));
    assert.equal(choice(pre, 'operation:text-rules:draft'), undefined);
    assert.deepEqual(choice(post, 'operation:text-rules:draft').ports.map(p => [p.dir, p.kind]), [['in', 'draft'], ['out', 'patches']]);
    assert.equal(choice(pre, 'operation:json-decode:check').ports[0].kind, 'data');
    assert.deepEqual(api.resolveNativeSearchChoice(pre, 'operation:json-decode:check').controls, { mode: 'check' });
    assert.ok(choice(pre, 'operation:compose:input').ports.some(p => p.portId === 'section.Input' && p.kind === 'text'));
    assert.deepEqual(choice(pre, 'operation:context-join').ports.filter(p => p.dir === 'in').map(p => p.portId), ['context-1', 'context-2']);
    assert.equal(choice(post, 'operation:compose:guidance'), undefined);
    assert.equal(choice(pre, 'operation:compose:guidance').ports.find(p => p.dir === 'out').kind, 'guidance');
});

test('private bodies exclude root-only and wrong-phase operations while retaining dynamic both-phase choices', () => {
    for (const mode of ['native-pre', 'native-post']) {
        const value = catalog(scope(mode, { inDefinition: true, viewPath: ['instance'] }));
        for (const id of ['scene-context', 'reply-snapshot', 'guidance', 'apply-reply']) assert.equal(choice(value, 'operation:' + id), undefined);
        assert.ok(choice(value, 'operation:compose'));
        assert.ok(choice(value, 'operation:json-decode:check'));
        assert.equal(choice(value, mode === 'native-pre' ? 'operation:repair' : 'operation:smart-compactor'), undefined);
    }
});

test('cached query and context matching preserve multiple real compatible ports and allow context-off choices', () => {
    const value = catalog(), origin = { dir: 'out', kind: 'context' };
    const matched = api.filterNativeSearchChoices(value, { query: 'join', origin, contextSensitive: true });
    assert.deepEqual(matched.map(c => c.id), ['operation:context-join']);
    assert.deepEqual(api.matchNativeSearchPorts(value, matched[0].id, origin).map(p => p.portId), ['context-1', 'context-2']);
    assert.equal(api.filterNativeSearchChoices(value, { query: 'JSON', origin, contextSensitive: true }).length, 0);
    assert.equal(api.filterNativeSearchChoices(value, { query: 'JSON', origin, contextSensitive: false }).length, 2);
    assert.equal(api.matchNativeSearchPorts(value, 'operation:json-decode:check', origin).length, 0);
    assert.equal(api.resolveNativeSearchChoice(value, 'missing'), null);
    assert.equal(api.resolveNativeSearchChoice({ ...value }, 'operation:compose'), null, 'foreign catalog cannot provide checked commands');
});

test('checked shelf entries retain exact revision and actual interface choices but require an atomic producer', () => {
    const id = '界'.repeat(300);
    const interfacePorts = Array.from({ length: 257 }, (_, i) => ({ id: 'input-' + i, label: 'Input ' + i, direction: 'input', kind: 'context', required: false, cardinality: 'one', boundaryNodeId: 'boundary-' + i }));
    const draft = { id, version: 4, name: 'Saved shape', interface: interfacePorts, parameters: [], body: { schema: 3, runtime: 2, mode: 'native-pre', nodes: Object.fromEntries(interfacePorts.map(port => [port.boundaryNodeId, { id: port.boundaryNodeId, type: 'subgraph-input', interfacePortId: port.id }])), wires: {} } };
    const identity = computeDefinitionIdentity(draft); assert.equal(identity.ok, true);
    const definition = { ...identity.data.materializedDefinition, semanticHash: identity.data.semanticHash };
    assert.equal(validateDefinition(definition, { [definitionRefKey(definition)]: definition }).ok, true, 'real 257-interface source is accepted by the existing definition validator');
    const ref = { id, version: 4, semanticHash: definition.semanticHash }, ports = interfacePorts.map(({ boundaryNodeId, ...port }) => port);
    const value = catalog(scope(), { checkedLibraryEntries: [{ definitionRef: ref, name: 'Saved shape', phase: 'pre', ports }] });
    const item = value.choices.find(c => c.family === 'Subgraphs');
    assert.deepEqual(item.definitionRef, ref);
    assert.equal(item.ports.length, 257);
    assert.match(item.disabledReason, /atomic/i);
    assert.equal(api.resolveNativeSearchChoice(value, item.id), null);
    ref.id = 'mutated'; ports[0].id = 'mutated';
    assert.equal(item.definitionRef.id, id); assert.equal(item.ports[0].portId, 'input-0');
    assert.ok(Object.isFrozen(item.ports));
});

test('catalog admission rejects unsupported schema, malformed/getter scope and malformed shelf metadata without invoking getters', () => {
    assert.equal(typeof api.prepareNativeSearchCatalog, 'function');
    assert.equal(api.prepareNativeSearchCatalog(scope('native-pre', { schema: 2, runtime: 1 })).ok, false);
    let reads = 0;
    const trapped = { ...scope() }; Object.defineProperty(trapped, 'workflowId', { enumerable: true, get() { reads++; return 'root'; } });
    assert.equal(api.prepareNativeSearchCatalog(trapped).ok, false); assert.equal(reads, 0);
    assert.equal(api.prepareNativeSearchCatalog(scope(), { checkedLibraryEntries: [{ definitionRef: {}, name: 'bad', phase: 'pre', ports: [] }] }).ok, false);
    assert.equal(api.prepareNativeSearchCatalog(scope('native-pre', { viewPath: Array(9).fill('instance'), inDefinition: true })).ok, false);
});

test('genuine interface and data overlimits reject while a disabled shelf remains a queryable cached choice', () => {
    const ref = { id: 'definition', version: 1, semanticHash: 'sha256:' + 'f'.repeat(64) };
    const ports = Array.from({ length: 1001 }, (_, i) => ({ id: 'port-' + i, label: '', direction: 'input', kind: 'context', required: false, cardinality: 'one' }));
    assert.equal(api.prepareNativeSearchCatalog(scope(), { checkedLibraryEntries: [{ definitionRef: ref, name: 'Saved', phase: 'pre', ports }] }).ok, false);
    assert.equal(api.prepareNativeSearchCatalog(scope('native-pre', { workflowId: '界'.repeat(700000) })).ok, false);
    const value = catalog(scope(), { checkedLibraryEntries: [{ definitionRef: ref, name: 'Saved', phase: 'pre', ports: ports.slice(0, 1) }] });
    assert.match(api.filterNativeSearchChoices(value, { query: 'Saved' })[0].disabledReason, /checked definition.*atomic/i);
});

test('public cached filter rejects accessor or malformed options without evaluating them', () => {
    const value = catalog(); let reads = 0;
    const options = {}; Object.defineProperty(options, 'query', { enumerable: true, get() { reads++; return 'Compose'; } });
    assert.deepEqual(api.filterNativeSearchChoices(value, options), []); assert.equal(reads, 0);
    assert.deepEqual(api.filterNativeSearchChoices(value, { query: '', origin: { dir: 'sideways', kind: 'context' } }), []);
    assert.deepEqual(api.filterNativeSearchChoices(value, { contextSensitive: 'yes' }), []);
});

test('cached operation purpose, prototype shortcode and known aliases each independently find compatible choices', () => {
    const value = catalog(), item = choice(value, 'operation:smart-compactor');
    assert.equal(typeof item.purpose, 'string'); assert.equal(item.shortcode, 'cp'); assert.ok(Object.isFrozen(item.searchAliases));
    for (const [field, term] of [['purpose', 'protected'], ['shortcode', 'cp'], ['searchAliases', 'compaction']]) {
        const fields = { label: item.label, family: item.family, purpose: item.purpose, shortcode: item.shortcode, searchAliases: item.searchAliases.join(' ') };
        assert.ok(fields[field].includes(term));
        for (const [name, contents] of Object.entries(fields)) if (name !== field) assert.equal(contents.toLowerCase().includes(term), false, term + ' appears only in ' + field);
        const filtered = api.filterNativeSearchChoices(value, { query: term.toUpperCase(), origin: { dir: 'out', kind: 'context' }, contextSensitive: true });
        assert.ok(filtered.some(match => match.id === item.id), term);
        assert.equal(api.filterNativeSearchChoices(value, { query: term, origin: { dir: 'out', kind: 'draft' }, contextSensitive: true }).some(match => match.id === item.id), false);
        assert.ok(api.filterNativeSearchChoices(value, { query: term, origin: { dir: 'out', kind: 'draft' }, contextSensitive: false }).some(match => match.id === item.id));
    }
    for (const entry of value.choices) { assert.equal(typeof entry.purpose, 'string'); assert.equal(typeof entry.shortcode, 'string'); assert.ok(Object.isFrozen(entry.searchAliases)); }
});

test('saved subgraph label and admitted optional search metadata remain immutable without placed-node aliases', () => {
    const entry = { definitionRef: { id: 'saved', version: 1, semanticHash: 'sha256:' + 'e'.repeat(64) }, name: 'Saved Loom', phase: 'pre', ports: [], purpose: 'Reusable arrangement', shortcode: 'lm', searchAliases: ['woven branch'] };
    const value = catalog(scope(), { checkedLibraryEntries: [entry] }), item = value.choices.find(choice => choice.family === 'Subgraphs');
    assert.equal(item.label, 'Saved Loom'); assert.deepEqual(item.searchAliases, ['woven branch']);
    for (const term of ['Saved Loom', 'arrangement', 'lm', 'woven branch']) assert.ok(api.filterNativeSearchChoices(value, { query: term }).some(choice => choice.id === item.id));
    entry.name = 'Changed'; entry.searchAliases.push('changed alias'); assert.equal(item.label, 'Saved Loom'); assert.deepEqual(item.searchAliases, ['woven branch']);
    let reads = 0; const trapped = { ...entry }; Object.defineProperty(trapped, 'purpose', { enumerable: true, get() { reads++; return 'bad'; } });
    assert.equal(api.prepareNativeSearchCatalog(scope(), { checkedLibraryEntries: [trapped] }).ok, false); assert.equal(reads, 0);
    for (const searchAliases of [[42], 'not an array']) assert.equal(api.prepareNativeSearchCatalog(scope(), { checkedLibraryEntries: [{ ...entry, searchAliases }] }).ok, false);
    assert.equal(api.prepareNativeSearchCatalog(scope(), { placedNodeAliases: ['placed node alias'] }).ok, false);
});
