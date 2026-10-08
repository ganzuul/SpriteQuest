import assert from 'node:assert/strict';
import { installMock } from './mock.js';
const context = installMock({ settings: { graphs: {} } });
let loreScans = 0, snapshots = 0;
context.getWorldInfoPrompt = async () => { loreScans++; return {}; };
context.getCharacterCardFields = () => { snapshots++; return {}; };
const state = await import('../src/state.js');
const { compile } = await import('../src/compile.js');
const { run, callCount, sendWorkflowState } = await import('../src/run.js');
const { runWorkflow, workflowSignature } = await import('../src/workflow/runtime.js');
const { graphSemanticSignature } = await import('../src/workflow/ports.js');
const { starterGraph } = await import('../src/workflow/starters.js');
const { normalizeNativeGraph } = await import('../src/workflow/migration.js');
const { exportWorkflow } = await import('../src/workflow/packages.js');
const { isNativeWorkflow } = await import('../src/workflow/contracts.js');

const native = normalizeNativeGraph(starterGraph('native-guidance')).data;
for (const schema of [3, 99]) {
    const graph = { ...structuredClone(native), schema };
    const before = structuredClone(graph);
    state.migrateGraph(graph);
    assert.deepEqual(graph, before, 'native versions bypass destructive legacy migration');
    assert.equal((await compile(graph)).ok, false);
    assert.equal((await run(graph)).plan.ok, false);
    assert.equal(callCount(graph), 0);
    let calls = 0;
    const executed = await runWorkflow(graph, { request: async () => { calls++; }, snapshot: () => { snapshots++; } });
    assert.equal(executed.error.code, 'UNSUPPORTED_VERSION');
    assert.equal(calls, 0);
}
assert.equal(loreScans, 0);
assert.equal(snapshots, 0);
assert.equal(workflowSignature(native), graphSemanticSignature(native));
const namedChanged = structuredClone(native);
Object.values(namedChanged.wires)[0].fromPort = 'changed';
assert.notEqual(workflowSignature(namedChanged), workflowSignature(native));

const imported = state.importGraph(JSON.stringify(exportWorkflow(native)));
assert.equal(imported.ok, true);
assert.equal(imported.graph.schema, 3);
assert.equal(Object.values(imported.graph.nodes).some(node => node.type === 'output'), false);
assert.equal(JSON.parse(state.exportGraph(imported.graph.id)).schema, 2);
const settingsBefore = structuredClone(state.settings());
for (const data of [{ ...native, schema: 99 }, { graph: { ...native, schema: 99 } }, { ...native, runtime: 99 }]) {
    assert.equal(state.importGraph(JSON.stringify(data)).ok, false);
}
assert.deepEqual(state.settings(), settingsBefore);
const ids = Object.keys(native.nodes);
const beforeConnect = structuredClone(native);
assert.equal(state.connect(native, ids[0], ids[1], 'together').ok, false, 'native schema3 cannot enter legacy edit commands');
assert.deepEqual(native, beforeConnect);
const old = starterGraph('native-guidance');
const beforeOld = structuredClone(old);
assert.equal(state.connect(old, 'scene-context', 'smart-compactor', 'together').ok, false);
assert.equal(state.connect(old, 'scene-context', 'guidance').ok, false);
assert.equal(state.connect(old, 'scene-context', 'response-plan').ok, false, 'occupied native input rejects atomically');
assert.deepEqual(old, beforeOld);
delete old.wires['wire-1'];
const connected = state.connect(old, 'scene-context', 'smart-compactor');
assert.equal(connected.ok, true);
assert.equal(connected.wire.order, 0);
assert.equal(old.schema, 2);
const disabled = structuredClone(native);
disabled.groups.off = { id: 'off', enabled: false };
disabled.nodes['scene-context'].inGroup = 'off';
assert.equal(state.activeGraph(disabled), disabled, 'native dependency validation retains disabled topology');
assert.equal(workflowSignature({ schema: 2, runtime: 1, mode: 'native-pre', nodes: { s: { id: 's', type: 'workflow', operation: 'scene-context' } }, wires: {} }), '{"groups":[],"mode":"native-pre","nodes":[{"controls":{"includeCharacter":true,"recentMessages":12},"enabled":true,"id":"s","key":"s","model":null,"modelRole":null,"operation":"scene-context","operationVersion":1,"profileId":null,"type":"workflow"}],"roles":{},"runtime":1,"schema":2,"wires":[]}', 'literal established schema2 signature remains stable after delegation');
const large = { ...native, id: 'large', description: '' };
const overhead = new TextEncoder().encode(JSON.stringify(exportWorkflow(large))).length;
large.description = 'x'.repeat(2000000 - overhead);
state.settings().graphs.large = large;
const largeJson = state.exportGraph('large');
assert.ok(new TextEncoder().encode(largeJson).length <= 2000000, 'state writer must preserve envelope UTF-8 bound after serialization');
state.settings().workflowMode = 'native';
state.settings().nativeBindings.preGraphId = imported.graph.id;
assert.equal(sendWorkflowState().automatic, false);
assert.match(sendWorkflowState().armedText, /unsupported|requires schema/i);
// A false routing predicate authorizes legacy context work, so unsafe metadata must fail closed.
let routingGetterReads = 0;
const legacy = state.blankGraph('Routing fixture');
const unsafeRouting = [];
for (const key of ['schema', 'mode', 'runtime']) {
    const accessor = structuredClone(legacy);
    Object.defineProperty(accessor, key, { get() { routingGetterReads++; return key === 'mode' ? 'native-pre' : 3; }, enumerable: true });
    unsafeRouting.push(accessor);
}
const inherited = Object.assign(Object.create({ schema: 3, mode: 'native-pre' }), structuredClone(legacy));
delete inherited.schema;
unsafeRouting.push(inherited);
const inheritedAccessor = Object.setPrototypeOf(structuredClone(legacy), { get schema() { routingGetterReads++; return 3; } });
delete inheritedAccessor.schema;
unsafeRouting.push(inheritedAccessor);
for (const graph of unsafeRouting) {
    loreScans = 0; snapshots = 0;
    let saves = 0, touches = 0;
    context.saveSettingsDebounced = () => { saves++; };
    const unsubscribe = state.onGraphTouched(() => { touches++; });
    assert.equal((await compile(graph, { dryRun: true })).ok, false);
    assert.equal((await run(graph, { dryRun: true })).plan.ok, false);
    assert.equal(callCount(graph), 0);
    assert.equal(loreScans, 0, 'unsafe routing never activates legacy lore');
    assert.equal(snapshots, 0, 'unsafe routing never reads legacy character context');
    state.migrateGraph(graph);
    assert.equal(Object.hasOwn(graph, 'migrated'), false, 'unsafe routing never receives legacy migration writes');
    assert.equal(loreScans, 0, 'unsafe routing never activates legacy lore');
    assert.equal(snapshots, 0, 'unsafe routing never reads legacy character context');
    const wires = graph.wires;
    assert.equal(state.connect(graph, 'missing', 'also-missing').ok, false);
    assert.equal(graph.wires, wires);
    assert.equal(saves, 0);
    assert.equal(touches, 0);
    unsubscribe();
    state.settings().graphs.unsafeRouting = graph;
    state.settings().nativeBindings.preGraphId = 'unsafeRouting';
    assert.equal(sendWorkflowState().automatic, false);
    state.settings().activeGraphId = 'unsafeRouting';
    state.settings().workflowMode = 'legacy';
    assert.equal(sendWorkflowState().automatic, false);
    state.settings().workflowMode = 'native';
}
assert.equal(routingGetterReads, 0, 'routing never invokes own or inherited accessors');
for (const prototype of [Object.prototype, null]) {
    assert.equal(isNativeWorkflow(Object.assign(Object.create(prototype), structuredClone(legacy))), false);
    assert.equal(isNativeWorkflow(Object.assign(Object.create(prototype), structuredClone(native))), true);
}
console.log('workflow-dispatch: ok');
