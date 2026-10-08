import assert from 'node:assert/strict';
import { installMock } from './mock.js';
installMock({ settings: { graphs: {} } });
const { validateWorkflow } = await import('../src/workflow/contracts.js');
function fixturePreGraph() {
    return { id: 'pre', name: 'Pre', schema: 2, runtime: 1, mode: 'native-pre', roles: { Analysis: { profileId: null, model: null } }, nodes: {
        source: { id: 'source', type: 'workflow', operation: 'scene-context', enabled: true, x: 0, y: 0 },
        compact: { id: 'compact', type: 'workflow', operation: 'smart-compactor', enabled: true, x: 0, y: 100, targetTokens: 1200, keepRecent: 2, method: 'select', pins: [] },
        plan: { id: 'plan', type: 'workflow', operation: 'response-plan', enabled: true, modelRole: 'Analysis', x: 0, y: 200, maxTokens: 768 },
        output: { id: 'output', type: 'workflow', operation: 'guidance', enabled: true, x: 0, y: 300, budgetTokens: 768 },
    }, wires: { a: { id: 'a', from: 'source', to: 'compact', order: 0 }, b: { id: 'b', from: 'compact', to: 'plan', order: 0 }, c: { id: 'c', from: 'plan', to: 'output', order: 0 } }, groups: {} };
}
const graph = fixturePreGraph();
graph.nodes.plan.y = -500;
assert.deepEqual(validateWorkflow(graph).data.orderedNodes.map(n => n.id), ['source', 'compact', 'plan', 'output']);

// A wire cycle must fail before execution, even when positions suggest an order.
const cycle = fixturePreGraph();
cycle.wires.back = { id: 'back', from: 'plan', to: 'compact', order: 1 };
assert.equal(validateWorkflow(cycle).error?.code, 'CYCLE');
const dangling = fixturePreGraph();
dangling.wires.a.from = 'missing';
assert.equal(validateWorkflow(dangling).error?.code, 'DANGLING_WIRE');
const wrongPhase = fixturePreGraph();
assert.equal(validateWorkflow(wrongPhase, { phase: 'post' }).error?.code, 'WRONG_PHASE');
const wrongKind = fixturePreGraph();
wrongKind.wires.c.from = 'source';
assert.equal(validateWorkflow(wrongKind).error?.code, 'ARTIFACT_KIND');
const unknown = fixturePreGraph();
unknown.nodes.plan.operation = 'future-plan';
assert.equal(validateWorkflow(unknown).error?.code, 'UNKNOWN_OPERATION');
const future = fixturePreGraph();
future.runtime = 2;
assert.equal(validateWorkflow(future).error?.code, 'UNSUPPORTED_VERSION');
const ambiguous = fixturePreGraph();
ambiguous.wires.extra = { id: 'extra', from: 'source', to: 'plan', order: 1 };
assert.equal(validateWorkflow(ambiguous).error?.code, 'AMBIGUOUS_INPUT');
const disabled = fixturePreGraph();
disabled.nodes.compact.enabled = false;
assert.equal(validateWorkflow(disabled).error?.code, 'DISABLED_OPERATION');
const invalidNumber = fixturePreGraph();
invalidNumber.nodes.compact.targetTokens = 0;
assert.equal(validateWorkflow(invalidNumber).error?.code, 'INVALID_SETTINGS');
const noTerminal = fixturePreGraph();
delete noTerminal.nodes.output; delete noTerminal.wires.c;
assert.equal(validateWorkflow(noTerminal).error?.code, 'MISSING_TERMINAL');
const reachable = fixturePreGraph();
reachable.nodes.compact.method = 'compress';
reachable.nodes.unused = { id: 'unused', type: 'workflow', operation: 'response-plan', maxTokens: 768 };
assert.deepEqual({ ids: validateWorkflow(reachable).data.orderedNodes.map(n => n.id), bound: validateWorkflow(reachable).data.callBound }, { ids: ['source', 'compact', 'plan', 'output'], bound: 2 });
// Malformed external objects fail safely rather than throwing or trusting prototypes.
const malformed = [null, [], { ...fixturePreGraph(), nodes: null }, Object.assign(Object.create({ injected: true }), fixturePreGraph()), { ...fixturePreGraph(), name: 'x'.repeat(2000001) }];
for (const item of malformed) assert.equal(validateWorkflow(item).error?.code, 'MALFORMED_WORKFLOW');
// All stored operation settings are checked, including unreachable blocks.
const badSettings = fixturePreGraph();
badSettings.nodes.unused = { id: 'unused', type: 'workflow', operation: 'smart-compactor', method: 'recursive', pins: [], targetTokens: 1200 };
assert.equal(validateWorkflow(badSettings).error?.code, 'INVALID_SETTINGS');
const missingInput = fixturePreGraph();
delete missingInput.wires.a;
assert.equal(validateWorkflow(missingInput).error?.code, 'MISSING_INPUT');
// Graph-level settings are validated before any host bindings are resolved.
const invalidBindings = fixturePreGraph();
invalidBindings.roles.Analysis.profileId = 42;
assert.equal(validateWorkflow(invalidBindings).error?.code, 'INVALID_SETTINGS');
const { exportWorkflow, parseWorkflow } = await import('../src/workflow/packages.js');
const portable = fixturePreGraph();
portable.template = { id: 'scene-guidance', version: 1 };
portable.roles.Analysis = { profileId: 'local-profile', model: 'preferred-model' };
portable.nodes.plan.profileId = 'override-profile';
portable.nodes.plan.model = 'node-model';
portable.groups.compound = { id: 'compound', title: 'Formation', entry: 'compact', exit: 'plan', members: ['compact', 'plan'], collapsed: true };
portable.nodes.compact.inGroup = 'compound'; portable.nodes.plan.inGroup = 'compound';
const envelope = exportWorkflow(portable);
assert.deepEqual([envelope.kind, envelope.schema, envelope.minRuntime], ['comfytavern-workflow', 1, 1]);
const roundtrip = parseWorkflow(JSON.stringify(envelope));
assert.equal(roundtrip.ok, true);
const expectedPortable = structuredClone(portable);
expectedPortable.roles.Analysis.profileId = null; expectedPortable.nodes.plan.profileId = null;
assert.deepEqual(roundtrip.data, expectedPortable);
assert.equal(portable.nodes.plan.profileId, 'override-profile', 'export never mutates the saved instance');
const futurePackage = { ...envelope, schema: 2 };
assert.equal(parseWorkflow(JSON.stringify(futurePackage)).error?.code, 'UNSUPPORTED_PACKAGE');
assert.equal(parseWorkflow(JSON.stringify({ ...envelope, minRuntime: 2 })).error?.code, 'UNSUPPORTED_PACKAGE');
const S = await import('../src/state.js?v=0.19.0');
assert.equal(S.defaultNode('workflow', 10, 20).operation, 'scene-context');
assert.equal(S.defaultNode('workflow', 10, 20).recentMessages, 12);
assert.equal(S.defaultNode('workflow', 10, 20).includeCharacter, true);
assert.equal(S.settings().workflowMode, 'legacy');
assert.deepEqual(S.settings().nativeBindings, { preGraphId: null, postGraphId: null });
const imported = S.importGraph(JSON.stringify(envelope));
assert.equal(imported.ok, true);
assert.equal(Object.values(imported.graph.nodes).some(n => n.type === 'output'), false, 'native import never inserts legacy Output');
assert.equal(imported.graph.roles.Analysis.profileId, null);
assert.equal(JSON.parse(S.exportGraph(imported.graph.id)).kind, 'comfytavern-workflow');
const editGraph = fixturePreGraph();
editGraph.nodes.loose = { id: 'loose', type: 'workflow', operation: 'response-plan' };
assert.equal(S.connect(editGraph, 'output', 'loose').ok, false, 'native host outputs have no outgoing artifact');

const connectGraph = fixturePreGraph();
delete connectGraph.wires.a;
assert.equal(S.connect(connectGraph, 'source', 'compact').wire?.order, 0, 'native edit wires have explicit order');
assert.deepEqual(validateWorkflow(reachable).data.requiredRoles, ['Analysis'], 'setup derives unique reachable call roles from descriptors');
const inheritedOperation = fixturePreGraph();
inheritedOperation.nodes.plan.operation = '__proto__';
assert.equal(validateWorkflow(inheritedOperation).error?.code, 'UNKNOWN_OPERATION');
for (const extra of [{ order: -1 }, { order: 0.5 }, { order: null }, { kind: 'save' }, { loop: { max: 3 } }]) {
    const badWire = fixturePreGraph(); Object.assign(badWire.wires.a, extra);
    assert.equal(validateWorkflow(badWire).error?.code, 'INVALID_WIRE');
}
const secretPackage = structuredClone(envelope);
secretPackage.graph.nodes.plan.apiKey = 'synthetic-do-not-persist';
assert.equal(parseWorkflow(JSON.stringify(secretPackage)).error?.code, 'MALFORMED_WORKFLOW');
const annotated = fixturePreGraph();
annotated.nodes.note = { id: 'note', type: 'note', content: 'An editor annotation', x: 100, y: 100 };
assert.equal(validateWorkflow(annotated).ok, true);
assert.deepEqual(validateWorkflow(annotated).data.orderedNodes.map(n => n.id), ['source', 'compact', 'plan', 'output']);
const brokenFormation = fixturePreGraph();
brokenFormation.groups.formation = { id: 'formation', component: { id: 'ai-de-slop', version: 1 }, entry: 'missing', exit: 'plan', members: ['compact', 'plan'] };
assert.equal(validateWorkflow(brokenFormation).error?.code, 'INVALID_GROUP');
const futureFormation = fixturePreGraph();
futureFormation.groups.formation = { id: 'formation', component: { id: 'future-component', version: 1 }, entry: 'compact', exit: 'plan', members: ['compact', 'plan'] };
assert.equal(validateWorkflow(futureFormation).error?.code, 'UNSUPPORTED_COMPONENT');
const unmigratedNative = fixturePreGraph();
S.migrateGraph(unmigratedNative);
assert.equal(unmigratedNative.migrated, undefined, 'legacy migration never rewrites native graphs');
// Compatibility and pure parsing remain side-effect free.
const settingsBeforeReject = structuredClone(S.settings());
assert.equal(S.importGraph(JSON.stringify(futurePackage)).ok, false);
assert.deepEqual(S.settings(), settingsBeforeReject);
const rawNative = fixturePreGraph(); delete rawNative.mode;
assert.equal(S.importGraph(JSON.stringify(rawNative)).ok, false);
assert.deepEqual(S.settings(), settingsBeforeReject);
const legacyResult = S.importGraph(JSON.stringify({ kind: 'prompt-canvas-graph', schema: 1, graph: { schema: 1, name: 'Legacy', nodes: { p: { id: 'p', type: 'prompt', content: 'still legacy' } }, wires: {} } }));
assert.equal(legacyResult.ok, true);
assert.ok(S.outputNode(legacyResult.graph));
assert.equal(JSON.parse(S.exportGraph(legacyResult.graph.id)).kind, 'prompt-canvas-graph');
const offGroup = fixturePreGraph();
offGroup.groups.off = { id: 'off', enabled: false }; offGroup.nodes.compact.inGroup = 'off';
assert.equal(validateWorkflow(offGroup).error?.code, 'DISABLED_OPERATION');
const scanOnly = { id: 'post', schema: 2, runtime: 1, mode: 'native-post', roles: { Prose: { profileId: null, model: null } }, nodes: {
    source: { id: 'source', type: 'workflow', operation: 'reply-snapshot' },
    scan: { id: 'scan', type: 'workflow', operation: 'pattern-scan' },
    repair: { id: 'repair', type: 'workflow', operation: 'repair', mode: 'scan' },
    validate: { id: 'validate', type: 'workflow', operation: 'validate-patches' },
    review: { id: 'review', type: 'workflow', operation: 'review-gate' },
    apply: { id: 'apply', type: 'workflow', operation: 'apply-reply' },
}, wires: { a: { id: 'a', from: 'source', to: 'scan', order: 0 }, b: { id: 'b', from: 'scan', to: 'repair', order: 0 }, c: { id: 'c', from: 'repair', to: 'validate', order: 0 }, d: { id: 'd', from: 'validate', to: 'review', order: 0 }, e: { id: 'e', from: 'review', to: 'apply', order: 0 } } };
assert.equal(validateWorkflow(scanOnly).data.callBound, 0);
assert.deepEqual(validateWorkflow(scanOnly).data.requiredRoles, []);
scanOnly.nodes.repair.mode = 'repair';
assert.equal(validateWorkflow(scanOnly).data.callBound, 1);
assert.deepEqual(validateWorkflow(scanOnly).data.requiredRoles, ['Prose']);
assert.equal(validateWorkflow(fixturePreGraph()).data.callBound, 1);
assert.throws(() => exportWorkflow(secretPackage.graph));
assert.equal(parseWorkflow('x'.repeat(2000001)).ok, false);
assert.equal(parseWorkflow('{"kind":"comfytavern-workflow","schema":1,"minRuntime":1,"__proto__":{}}').ok, false);



// A JSON object reference must produce typed failure before property-key coercion.
const objectWireFrom = fixturePreGraph();
objectWireFrom.wires.a.from = { toString: null, valueOf: null };
assert.equal(parseWorkflow(JSON.stringify({ ...envelope, graph: objectWireFrom })).error?.code, 'INVALID_WIRE');
const objectWireTo = fixturePreGraph();
objectWireTo.wires.a.to = { toString: null, valueOf: null };
assert.equal(parseWorkflow(JSON.stringify({ ...envelope, graph: objectWireTo })).error?.code, 'INVALID_WIRE');
const objectGroupEntry = fixturePreGraph();
objectGroupEntry.groups.ordinary = { id: 'ordinary', entry: { toString: null, valueOf: null } };
assert.equal(parseWorkflow(JSON.stringify({ ...envelope, graph: objectGroupEntry })).error?.code, 'INVALID_GROUP');
const objectGroupExit = fixturePreGraph();
objectGroupExit.groups.ordinary = { id: 'ordinary', exit: { toString: null, valueOf: null } };
assert.equal(parseWorkflow(JSON.stringify({ ...envelope, graph: objectGroupExit })).error?.code, 'INVALID_GROUP');
const objectGroupMember = fixturePreGraph();
objectGroupMember.groups.ordinary = { id: 'ordinary', members: [{ toString: null, valueOf: null }] };
assert.equal(parseWorkflow(JSON.stringify({ ...envelope, graph: objectGroupMember })).error?.code, 'INVALID_GROUP');
const objectNodeGroup = fixturePreGraph();
objectNodeGroup.nodes.compact.inGroup = { toString: null, valueOf: null };
assert.equal(parseWorkflow(JSON.stringify({ ...envelope, graph: objectNodeGroup })).error?.code, 'INVALID_GROUP');
function fixtureComponentGraph() {
    const graph = structuredClone(scanOnly);
    graph.groups = { formation: { id: 'formation', component: { id: 'ai-de-slop', version: 1 }, entry: 'scan', exit: 'validate', members: ['scan', 'repair', 'validate'] } };
    for (const id of ['scan', 'repair', 'validate']) graph.nodes[id].inGroup = 'formation';
    return graph;
}
for (const field of ['entry', 'exit', 'members']) {
    const incompleteComponent = fixtureComponentGraph();
    delete incompleteComponent.groups.formation[field];
    assert.equal(parseWorkflow(JSON.stringify({ ...envelope, graph: incompleteComponent })).error?.code, 'INVALID_GROUP', `canonical component requires ${field}`);
}
for (const port of ['entry', 'exit']) {
    const outsidePort = fixtureComponentGraph();
    outsidePort.groups.formation[port] = 'source';
    assert.equal(parseWorkflow(JSON.stringify({ ...envelope, graph: outsidePort })).error?.code, 'INVALID_GROUP', `${port} must be a formation member`);
}
const detachedMember = fixtureComponentGraph();
delete detachedMember.nodes.repair.inGroup;
assert.equal(parseWorkflow(JSON.stringify({ ...envelope, graph: detachedMember })).error?.code, 'INVALID_GROUP', 'declared members must appear in the canvas group');
const undeclaredMember = fixtureComponentGraph();
undeclaredMember.nodes.source.inGroup = 'formation';
assert.equal(parseWorkflow(JSON.stringify({ ...envelope, graph: undeclaredMember })).error?.code, 'INVALID_GROUP', 'canvas group members must all be declared in the component');
const objectOperation = fixturePreGraph();
objectOperation.nodes.plan.operation = { toString: null, valueOf: null };
assert.equal(parseWorkflow(JSON.stringify({ ...envelope, graph: objectOperation })).error?.code, 'UNKNOWN_OPERATION');
const objectGraphName = fixturePreGraph();
objectGraphName.name = { toString: null, valueOf: null };
assert.equal(S.importGraph(JSON.stringify({ ...envelope, graph: objectGraphName })).error?.code, 'INVALID_SETTINGS');
const inheritedReference = fixturePreGraph();
inheritedReference.groups.ordinary = { id: 'ordinary', entry: 'toString', members: ['toString'] };
assert.equal(parseWorkflow(JSON.stringify({ ...envelope, graph: inheritedReference })).error?.code, 'INVALID_GROUP', 'references must point to saved own nodes');
const inheritedGroup = fixturePreGraph();
inheritedGroup.nodes.compact.inGroup = 'toString';
assert.equal(parseWorkflow(JSON.stringify({ ...envelope, graph: inheritedGroup })).error?.code, 'INVALID_GROUP');
const ordinaryGroup = fixturePreGraph();
ordinaryGroup.groups.ordinary = { id: 'ordinary', title: 'Plain group' };
assert.equal(parseWorkflow(JSON.stringify({ ...envelope, graph: ordinaryGroup })).ok, true, 'ordinary groups keep optional formation metadata');
assert.equal(parseWorkflow(JSON.stringify({ ...envelope, graph: fixtureComponentGraph() })).ok, true, 'complete canvas-aligned components still import');
const settingsBeforeMalformedReferences = structuredClone(S.settings());
for (const invalid of [objectWireFrom, objectWireTo, objectGroupEntry, objectGroupExit, objectGroupMember, objectNodeGroup]) {
    assert.equal(S.importGraph(JSON.stringify({ ...envelope, graph: invalid })).ok, false);
}
assert.deepEqual(S.settings(), settingsBeforeMalformedReferences, 'malformed references never mutate settings');
console.log('workflow-contracts: ok');
