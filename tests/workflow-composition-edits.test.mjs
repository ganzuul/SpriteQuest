import assert from 'node:assert/strict';
import { computeDefinitionIdentity, definitionRefKey, validateDefinition } from '../src/workflow/definitions.js';
import { validateGraphStructure } from '../src/workflow/contracts.js';
import { resolveWorkflow } from '../src/workflow/resolve.js';
import * as library from '../src/workflow/definition-library.js';
import * as composition from '../src/workflow/composition.js';
import { graphSemanticSignature } from '../src/workflow/ports.js';

const finalize = draft => { const identity = computeDefinitionIdentity(draft); assert.equal(identity.ok, true); return { ...structuredClone(identity.data.materializedDefinition), semanticHash: identity.data.semanticHash }; };
const ref = value => ({ id: value.id, version: value.version, semanticHash: value.semanticHash });
const instance = (id, definition) => ({ id, type: 'subgraph', definition: ref(definition), parameterOverrides: {}, roleOverrides: {}, nodeBindingOverrides: {} });
const leaf = finalize({ id: 'leaf', version: 1, name: 'Leaf', interface: [
    { id: 'input', label: 'Input', direction: 'input', kind: 'context', required: true, cardinality: 'one', boundaryNodeId: 'entry' },
    { id: 'output', label: 'Output', direction: 'output', kind: 'context', required: false, cardinality: 'one', boundaryNodeId: 'exit' },
], parameters: [], body: { schema: 3, runtime: 2, mode: 'native-pre', nodes: {
    entry: { id: 'entry', type: 'subgraph-input', interfacePortId: 'input' }, work: { id: 'work', type: 'workflow', operation: 'smart-compactor' }, exit: { id: 'exit', type: 'subgraph-output', interfacePortId: 'output' },
}, wires: { a: { id: 'a', route: 'wire', from: 'entry', fromPort: 'out', to: 'work', toPort: 'in' }, b: { id: 'b', route: 'wire', from: 'work', fromPort: 'out', to: 'exit', toPort: 'in' } } } });
const outerDraft = structuredClone(leaf); outerDraft.id = 'outer'; outerDraft.body.nodes.work = instance('work', leaf); outerDraft.body.wires.a.toPort = 'input'; outerDraft.body.wires.b.fromPort = 'output';
const outer = finalize(outerDraft);
const root = () => ({ id: 'root', schema: 3, runtime: 2, mode: 'native-pre', roles: { Analysis: { profileId: 'parent-profile', model: 'parent-model' } }, nodes: {
    source: { id: 'source', type: 'workflow', operation: 'scene-context' }, one: instance('one', outer), two: instance('two', outer), plan: { id: 'plan', type: 'workflow', operation: 'response-plan' }, output: { id: 'output', type: 'workflow', operation: 'guidance' },
}, wires: { a: { id: 'a', route: 'wire', from: 'source', fromPort: 'out', to: 'one', toPort: 'input' }, b: { id: 'b', route: 'wire', from: 'one', fromPort: 'output', to: 'plan', toPort: 'in' }, c: { id: 'c', route: 'wire', from: 'plan', fromPort: 'out', to: 'output', toPort: 'in' } }, definitions: { [definitionRefKey(leaf)]: leaf, [definitionRefKey(outer)]: outer }, portals: {} });

const original = root(), copied = library.makeLocalCopy(original, { instancePath: ['one', 'work'], id: 'private-leaf' });
assert.equal(copied.ok, true, JSON.stringify(copied));
assert.deepEqual(copied.data.candidate.nodes.two.definition, ref(outer));
assert.notEqual(copied.data.candidate.nodes.one.definition.id, outer.id);
assert.equal(copied.data.candidate.localDefinitionOwners.length, 2);
const privateOuter = copied.data.candidate.definitions[definitionRefKey(copied.data.candidate.nodes.one.definition)];
assert.equal(privateOuter.body.nodes.work.definition.id, 'private-leaf');
assert.equal(privateOuter.body.nodes.work.localCopy, undefined);
const privateLeaf = copied.data.candidate.definitions[definitionRefKey(privateOuter.body.nodes.work.definition)];
const draft = structuredClone(privateLeaf); draft.body.nodes.work.targetTokens = 321;
const edited = library.prepareLocalDefinitionEdit(copied.data.candidate, { instancePath: ['one', 'work'], expectedRef: ref(privateLeaf), draft });
assert.equal(edited.ok, true, JSON.stringify(edited));
assert.equal(resolveWorkflow(edited.data.candidate).data.primitives.find(unit => JSON.stringify(unit.address.instancePath) === '["one","work"]').node.targetTokens, 321);
assert.deepEqual(edited.data.candidate.nodes.two.definition, ref(outer));
assert.deepEqual(original, root());
const forged = root(); forged.localDefinitionOwners = [{ instancePath: ['one', 'work'], definitionId: leaf.id }];
assert.equal(validateGraphStructure(forged).error.code, 'LOCAL_COPY_OWNERSHIP');

const inherited = resolveWorkflow(root()).data.primitives.find(unit => unit.address.instancePath.length === 2);
assert.equal(inherited.node.profileId, 'parent-profile');
assert.equal(inherited.node.model, 'parent-model');
const blockedBinding = root(); blockedBinding.nodes.one.roleOverrides.Analysis = { profileId: null, model: null };
const nullBinding = resolveWorkflow(blockedBinding).data.primitives.find(unit => unit.address.instancePath.length === 2);
assert.equal(nullBinding.node.profileId, null);
assert.equal(nullBinding.node.model, null);

const largeDraft = structuredClone(leaf); largeDraft.id = 'large';
for (let i = 0; i < 397; i++) largeDraft.body.nodes[`note-${i}`] = { id: `note-${i}`, type: 'note' };
const large = finalize(largeDraft), largeRoot = root();
largeRoot.nodes.one = instance('one', large); largeRoot.nodes.two = instance('two', large);
largeRoot.definitions = { [definitionRefKey(large)]: large };
let revisions = library.makeLocalCopy(largeRoot, { instanceId: 'one', id: 'large-private' });
assert.equal(revisions.ok, true);
for (let i = 0; i < 2; i++) {
    const current = revisions.data.candidate, previous = current.nodes.one.definition, next = structuredClone(current.definitions[definitionRefKey(previous)]);
    next.body.nodes.work.targetTokens = 101 + i;
    revisions = library.prepareLocalDefinitionEdit(current, { instanceId: 'one', expectedRef: previous, draft: next });
    assert.equal(revisions.ok, true, JSON.stringify(revisions));
    assert.deepEqual(revisions.data.candidate.nodes.two.definition, ref(large));
    assert.equal(Object.keys(revisions.data.candidate.definitions).length, 2);
}

const selectionRoot = root(); selectionRoot.nodes.one = { id: 'one', type: 'workflow', operation: 'smart-compactor', method: 'compress' }; delete selectionRoot.nodes.two;
selectionRoot.wires.a.toPort = 'in'; selectionRoot.wires.b.fromPort = 'out';
selectionRoot.nodes.other = { id: 'other', type: 'workflow', operation: 'smart-compactor' };
selectionRoot.wires.shared = { id: 'shared', route: 'wire', from: 'source', fromPort: 'out', to: 'other', toPort: 'in' };
selectionRoot.portals.result = { id: 'result', label: 'Published', kind: 'context', source: { nodeId: 'one', portId: 'out' } };
assert.equal(typeof composition.prepareCreateFromSelection, 'function');
const converted = composition.prepareCreateFromSelection(selectionRoot, { nodeIds: ['one', 'other'], definitionId: 'selection-definition', name: 'Selection' });
assert.equal(converted.ok, true, JSON.stringify(converted));
assert.equal(converted.data.proposal.inputs.length, 1, 'shared external sources are deduplicated');
assert.equal(converted.data.proposal.outputs.length, 1);
assert.equal(converted.data.candidate.portals.result.source.nodeId, converted.data.instanceId);
assert.equal(resolveWorkflow(converted.data.candidate).data.callBound, resolveWorkflow(selectionRoot).data.callBound);
assert.equal(composition.prepareCreateFromSelection(selectionRoot, { nodeIds: ['source'], definitionId: 'bad', name: 'Bad' }).error.code, 'ROOT_ONLY_OPERATION');
const unfinishedSelection = structuredClone(selectionRoot); delete unfinishedSelection.wires.a;
assert.equal(composition.prepareCreateFromSelection(unfinishedSelection, { nodeIds: ['one'], definitionId: 'unfinished', name: 'Unfinished' }).ok, true);

const unpackDraft = structuredClone(outer); unpackDraft.id = 'parameter-outer';
unpackDraft.parameters = [{ id: 'tokens', label: 'Tokens', target: { instancePath: ['work'], nodeId: 'work', controlId: 'targetTokens' } }];
const parameterOuter = finalize(unpackDraft), unpackRoot = root();
unpackRoot.definitions[definitionRefKey(parameterOuter)] = parameterOuter;
unpackRoot.nodes.one = instance('one', parameterOuter); unpackRoot.nodes.one.parameterOverrides.tokens = 777;
unpackRoot.nodes.one.roleOverrides.Analysis = { profileId: 'outer-profile', model: null };
unpackRoot.portals.published = { id: 'published', label: 'Published', source: { nodeId: 'one', portId: 'output' }, kind: 'context' };
const beforeUnpack = structuredClone(unpackRoot), unpacked = composition.prepareUnpack(unpackRoot, { instancePath: ['one'] });
assert.equal(unpacked.ok, true, JSON.stringify(unpacked));
assert.equal(unpacked.data.generatedReroutes.length, 2);
assert.equal(unpacked.data.changedRefs.length, 1, 'unexposed outer control materializes a new child pin');
assert.deepEqual(unpacked.data.candidate.nodes.two.definition, ref(outer));
const unpackPlan = resolveWorkflow(unpacked.data.candidate);
assert.equal(unpackPlan.ok, true, JSON.stringify(unpackPlan));
const movedChild = unpacked.data.identityMap.nodes.work;
const movedWork = unpackPlan.data.primitives.find(unit => JSON.stringify(unit.address.instancePath) === JSON.stringify([movedChild]));
assert.equal(movedWork.node.targetTokens, 777);
assert.equal(movedWork.node.profileId, 'outer-profile'); assert.equal(movedWork.node.model, null);
assert.equal(unpacked.data.candidate.portals.published.source.nodeId, unpacked.data.identityMap.nodes.exit);
assert.deepEqual(unpackRoot, beforeUnpack, 'preparation leaves the source untouched');
const unfinishedUnpack = structuredClone(unpackRoot); delete unfinishedUnpack.wires.a;
assert.equal(composition.prepareUnpack(unfinishedUnpack, { instanceId: 'one' }).ok, true, 'unfinished authoring unpacks');

assert.equal(composition.prepareCreateFromSelection(root(), { viewPath: ['one', 'work'], nodeIds: ['work'], definitionId: 'read-only', name: 'Read only' }).error.code, 'READ_ONLY_DEFINITION');
assert.equal(composition.prepareUnpack(root(), { instancePath: ['one', 'work'] }).error.code, 'READ_ONLY_DEFINITION');
const nestedOwned = library.makeLocalCopy(unpackRoot, { instancePath: ['one', 'work'], id: 'editable-nested' });
assert.equal(nestedOwned.ok, true);
const nestedSelection = composition.prepareCreateFromSelection(nestedOwned.data.candidate, { viewPath: ['one', 'work'], nodeIds: ['work'], definitionId: 'nested-selection', name: 'Nested selection' });
assert.equal(nestedSelection.ok, true, JSON.stringify(nestedSelection));
const nestedPlan = resolveWorkflow(nestedSelection.data.candidate);
assert.equal(nestedPlan.ok, true, JSON.stringify(nestedPlan));
assert.equal(nestedPlan.data.primitives.find(unit => unit.address.instancePath[0] === 'one').node.targetTokens, 777, 'ancestor exposed targets relocate through a new wrapper');
const nestedUnpacked = composition.prepareUnpack(nestedSelection.data.candidate, { instancePath: ['one', 'work', nestedSelection.data.instanceId] });
assert.equal(nestedUnpacked.ok, true, JSON.stringify(nestedUnpacked));
assert.equal(resolveWorkflow(nestedUnpacked.data.candidate).data.primitives.find(unit => unit.address.instancePath[0] === 'one' && unit.node.operation === 'smart-compactor').node.targetTokens, 777);

const passDraft = structuredClone(leaf); passDraft.id = 'pass'; delete passDraft.body.nodes.work;
passDraft.body.wires = { through: { id: 'through', route: 'portal', portalId: 'inside', to: 'exit', toPort: 'in' } };
passDraft.body.portals = { inside: { id: 'inside', label: 'Inside', source: { nodeId: 'entry', portId: 'out' }, kind: 'context' } };
const pass = finalize(passDraft), passRoot = root(); passRoot.nodes.one = instance('one', pass); passRoot.definitions[definitionRefKey(pass)] = pass;
passRoot.portals.outside = { id: 'outside', label: 'Outside', source: { nodeId: 'one', portId: 'output' }, kind: 'context' };
passRoot.wires.b = { id: 'b', route: 'portal', portalId: 'outside', to: 'plan', toPort: 'in' };
const passUnpacked = composition.prepareUnpack(passRoot, { instanceId: 'one' });
assert.equal(passUnpacked.ok, true, JSON.stringify(passUnpacked));
assert.equal(resolveWorkflow(passUnpacked.data.candidate).ok, true);
assert.equal(passUnpacked.data.candidate.wires.b.portalId, 'outside');
assert.notEqual(passUnpacked.data.identityMap.portals.inside, 'inside');
passRoot.nodes.one.enabled = false;
assert.equal(resolveWorkflow(composition.prepareUnpack(passRoot, { instanceId: 'one' }).data.candidate).error.code, 'DISABLED_OPERATION');
const directBindingRoot = root(); directBindingRoot.nodes.one = instance('one', leaf);
directBindingRoot.nodes.one.roleOverrides.Analysis = { profileId: null, model: null };
const directBindingUnpack = composition.prepareUnpack(directBindingRoot, { instanceId: 'one' });
assert.equal(directBindingUnpack.ok, true);
const directBindingUnit = resolveWorkflow(directBindingUnpack.data.candidate).data.primitives.find(unit => unit.address.nodeId === directBindingUnpack.data.identityMap.nodes.work);
assert.equal(directBindingUnit.node.model, null); assert.equal(directBindingUnit.node.profileId, null);
assert.equal(directBindingUnpack.data.generatedRoles.length, 1);
assert.deepEqual(directBindingUnpack.data.candidate.roles.Analysis, directBindingRoot.roles.Analysis);
const exposedLeafDraft = structuredClone(leaf); exposedLeafDraft.id = 'exposed-leaf';
exposedLeafDraft.parameters = [{ id: 'local-tokens', label: 'Tokens', target: { instancePath: [], nodeId: 'work', controlId: 'targetTokens' } }];
const exposedLeaf = finalize(exposedLeafDraft), exposedOuterDraft = structuredClone(parameterOuter); exposedOuterDraft.id = 'exposed-outer'; exposedOuterDraft.body.nodes.work = instance('work', exposedLeaf);
const exposedOuter = finalize(exposedOuterDraft), exposedRoot = root();
exposedRoot.definitions[definitionRefKey(exposedLeaf)] = exposedLeaf; exposedRoot.definitions[definitionRefKey(exposedOuter)] = exposedOuter;
exposedRoot.nodes.one = instance('one', exposedOuter); exposedRoot.nodes.one.parameterOverrides.tokens = 888;
exposedRoot.nodes.one.nodeBindingOverrides[JSON.stringify([['work'], 'work'])] = { profileId: null, model: null };
const exposedUnpack = composition.prepareUnpack(exposedRoot, { instanceId: 'one' });
assert.equal(exposedUnpack.ok, true, JSON.stringify(exposedUnpack));
assert.equal(exposedUnpack.data.changedRefs.length, 0);
assert.deepEqual(exposedUnpack.data.candidate.nodes[exposedUnpack.data.identityMap.nodes.work].definition, ref(exposedLeaf));
assert.equal(exposedUnpack.data.candidate.nodes[exposedUnpack.data.identityMap.nodes.work].parameterOverrides['local-tokens'], 888);
const exposedUnit = resolveWorkflow(exposedUnpack.data.candidate).data.primitives.find(unit => unit.address.instancePath[0] === exposedUnpack.data.identityMap.nodes.work);
assert.equal(exposedUnit.node.profileId, null); assert.equal(exposedUnit.node.model, null);
const deeperDraft = structuredClone(parameterOuter); deeperDraft.id = 'deep-outer'; deeperDraft.body.nodes.work = instance('work', outer);
deeperDraft.parameters[0].target.instancePath = ['work', 'work'];
const deeper = finalize(deeperDraft), deeperRoot = root(); deeperRoot.nodes.one = instance('one', deeper); deeperRoot.nodes.one.parameterOverrides.tokens = 999; deeperRoot.definitions[definitionRefKey(deeper)] = deeper;
const deeperUnpack = composition.prepareUnpack(deeperRoot, { instanceId: 'one' });
assert.equal(deeperUnpack.ok, true, JSON.stringify(deeperUnpack)); assert.equal(deeperUnpack.data.changedRefs.length, 2);
assert.equal(resolveWorkflow(deeperUnpack.data.candidate).data.primitives.find(unit => unit.address.instancePath[0] === deeperUnpack.data.identityMap.nodes.work).node.targetTokens, 999);
const selectedOwned = composition.prepareCreateFromSelection(copied.data.candidate, { nodeIds: ['one'], definitionId: 'owned-selection', name: 'Owned selection' });
assert.equal(selectedOwned.ok, true, JSON.stringify(selectedOwned));
assert.equal(selectedOwned.data.candidate.localDefinitionOwners.length, 3);
const ownershipUnpack = composition.prepareUnpack(selectedOwned.data.candidate, { instanceId: selectedOwned.data.instanceId });
assert.equal(ownershipUnpack.ok, true, JSON.stringify(ownershipUnpack));
assert.equal(ownershipUnpack.data.candidate.localDefinitionOwners.length, 2);
const scopedRoleDraft = structuredClone(leaf); scopedRoleDraft.id = 'scoped-role'; scopedRoleDraft.body.roles = { Analysis: { model: 'saved-model' } };
const scopedRole = finalize(scopedRoleDraft), scopedRoleRoot = root(); scopedRoleRoot.nodes.one = instance('one', scopedRole); scopedRoleRoot.nodes.one.roleOverrides.Analysis = { model: 'override-model' }; scopedRoleRoot.definitions[definitionRefKey(scopedRole)] = scopedRole;
const scopedOwned = library.makeLocalCopy(scopedRoleRoot, { instanceId: 'one', id: 'scoped-owned' });
const scopedConverted = composition.prepareCreateFromSelection(scopedOwned.data.candidate, { viewPath: ['one'], nodeIds: ['work'], definitionId: 'scoped-selection', name: 'Scoped selection' });
assert.equal(scopedConverted.ok, true, JSON.stringify(scopedConverted));
assert.equal(resolveWorkflow(scopedConverted.data.candidate).data.primitives.find(unit => unit.address.instancePath[0] === 'one').node.model, 'override-model');
assert.equal(typeof composition.prepareCompositionViews, 'function');
const views = composition.prepareCompositionViews(copied.data.candidate); assert.equal(views.ok, true);
assert.equal(views.data.views.find(view => JSON.stringify(view.instancePath) === '["one","work"]').editable, true);
assert.equal(views.data.views.find(view => JSON.stringify(view.instancePath) === '["two","work"]').editable, false);
assert.equal(views.data.views.find(view => JSON.stringify(view.instancePath) === '["two"]').ports.some(pin => pin.address.nodeId === 'entry' && pin.address.portId === 'out'), true);
const noTerminal = root(); delete noTerminal.nodes.output; delete noTerminal.wires.c;
assert.equal(composition.prepareCompositionViews(noTerminal).ok, true, 'view preparation never requires execution completeness');

// Review P2: portable model inheritance and null blockers are different semantic content.
const bindingLeafDraft = structuredClone(leaf); bindingLeafDraft.id = 'binding-leaf'; bindingLeafDraft.body.roles = { Analysis: { model: 'child-model', profileId: 'child-profile' } };
const bindingLeaf = finalize(bindingLeafDraft), bindingDependencies = { [definitionRefKey(bindingLeaf)]: bindingLeaf };
for (const consumer of ['body.roles', 'roleOverrides', 'nodeBindingOverrides']) {
    const inheritedDraft = structuredClone(leaf); inheritedDraft.id = `binding-${consumer}`;
    let inheritedBinding;
    if (consumer === 'body.roles') inheritedBinding = (inheritedDraft.body.roles = { Analysis: {} }).Analysis;
    else {
        inheritedDraft.body.nodes.work = instance('work', bindingLeaf); inheritedDraft.body.wires.a.toPort = 'input'; inheritedDraft.body.wires.b.fromPort = 'output';
        inheritedBinding = inheritedDraft.body.nodes.work[consumer][consumer === 'roleOverrides' ? 'Analysis' : JSON.stringify([[], 'work'])] = {};
    }
    const inheritedSnapshot = finalize(inheritedDraft); inheritedBinding.model = null; const blockedSnapshot = finalize(inheritedDraft);
    assert.notEqual(inheritedSnapshot.semanticHash, blockedSnapshot.semanticHash, consumer);
    assert.notEqual(computeDefinitionIdentity(inheritedSnapshot).data.canonicalContent, computeDefinitionIdentity(blockedSnapshot).data.canonicalContent);
    assert.equal(validateDefinition(inheritedSnapshot, { ...bindingDependencies, [definitionRefKey(blockedSnapshot)]: blockedSnapshot }).error.code, 'DEFINITION_CONFLICT');
    assert.equal(validateGraphStructure({ ...root(), definitions: { ...root().definitions, ...bindingDependencies, [definitionRefKey(inheritedSnapshot)]: inheritedSnapshot, [definitionRefKey(blockedSnapshot)]: blockedSnapshot } }).error.code, 'DEFINITION_CONFLICT');
    const installedBlocked = library.installDefinition({ definitions: bindingDependencies }, blockedSnapshot); assert.equal(installedBlocked.ok, true);
    assert.equal(library.installDefinition(installedBlocked.data.library, inheritedSnapshot).error.code, 'DEFINITION_CONFLICT');
    const models = [inheritedSnapshot, blockedSnapshot].map(snapshot => {
        const graph = root(); graph.nodes.one = instance('one', snapshot); Object.assign(graph.definitions, bindingDependencies, { [definitionRefKey(snapshot)]: snapshot });
        return resolveWorkflow(graph).data.primitives.find(unit => unit.address.instancePath[0] === 'one').node.model;
    });
    assert.deepEqual(models, [consumer === 'body.roles' ? 'parent-model' : 'child-model', null]);
    const portableModelHash = blockedSnapshot.semanticHash; inheritedBinding.profileId = null;
    assert.equal(finalize(inheritedDraft).semanticHash, portableModelHash, 'portable profile null stays excluded');
    inheritedBinding.profileId = 'environment-profile'; assert.equal(finalize(inheritedDraft).semanticHash, portableModelHash);
}
for (const container of ['roleOverrides', 'nodeBindingOverrides']) for (const field of ['model', 'profileId']) {
    const graph = root(); graph.nodes.one = instance('one', bindingLeaf); graph.definitions[definitionRefKey(bindingLeaf)] = bindingLeaf;
    const key = container === 'roleOverrides' ? 'Analysis' : JSON.stringify([[], 'work']); graph.nodes.one[container][key] = {};
    const beforeSignature = graphSemanticSignature(graph); graph.nodes.one[container][key][field] = null;
    assert.notEqual(graphSemanticSignature(graph), beforeSignature, `${container}.${field}`);
    assert.equal(resolveWorkflow(graph).data.primitives.find(unit => unit.address.instancePath[0] === 'one').node[field], null);
}
for (const field of ['model', 'profileId']) {
    const inherited = structuredClone(leaf); inherited.body.roles = { Analysis: {} };
    const graph = root(), saved = finalize(inherited); graph.nodes.one = instance('one', saved); graph.definitions[definitionRefKey(saved)] = saved;
    const beforeSignature = graphSemanticSignature(graph); saved.body.roles.Analysis[field] = null;
    assert.notEqual(graphSemanticSignature(graph), beforeSignature, `body.roles.${field}`);
}
const fallbackDraft = structuredClone(leaf), fallbackHash = finalize(fallbackDraft).semanticHash; fallbackDraft.body.nodes.work.model = null;
assert.equal(finalize(fallbackDraft).semanticHash, fallbackHash, 'saved primitive absent/null both retain role fallback');
const emptyCurrentGraph = { schema: 3, runtime: 2, mode: 'native-pre', nodes: {}, wires: {}, roles: { Analysis: {} } };
assert.equal(graphSemanticSignature(emptyCurrentGraph), graphSemanticSignature({ ...emptyCurrentGraph, groups: {}, portals: {}, definitions: {} }), 'optional current containers do not change execution identity');

// Review P2: an explicit update can leave a private pin without stale ownership permissions.
const updatedToLibrary = library.prepareInstanceUpdate(copied.data.candidate, { instanceId: 'one', definition: outer });
assert.equal(updatedToLibrary.ok, true, JSON.stringify(updatedToLibrary));
assert.equal(updatedToLibrary.data.candidate.nodes.one.localCopy, undefined);
assert.deepEqual(updatedToLibrary.data.candidate.localDefinitionOwners, []);
const bothOwned = library.makeLocalCopy(copied.data.candidate, { instancePath: ['two', 'work'], id: 'second-private-leaf' }); assert.equal(bothOwned.ok, true);
const otherOwners = bothOwned.data.candidate.localDefinitionOwners.filter(entry => entry.instancePath[0] === 'two');
const updatedOne = library.prepareInstanceUpdate(bothOwned.data.candidate, { instanceId: 'one', definition: outer });
assert.equal(updatedOne.ok, true, JSON.stringify(updatedOne));
assert.deepEqual(updatedOne.data.candidate.localDefinitionOwners, otherOwners);
assert.deepEqual(updatedOne.data.candidate.nodes.two, bothOwned.data.candidate.nodes.two);
const ownedOuterRef = copied.data.candidate.nodes.one.definition, replacingChild = structuredClone(copied.data.candidate.definitions[definitionRefKey(ownedOuterRef)]);
replacingChild.version++; replacingChild.body.nodes.work.definition = ref(leaf);
const childReplacement = library.prepareInstanceUpdate(copied.data.candidate, { instanceId: 'one', definition: finalize(replacingChild) });
assert.equal(childReplacement.ok, true, JSON.stringify(childReplacement));
assert.deepEqual(childReplacement.data.candidate.localDefinitionOwners, [{ instancePath: ['one'], definitionId: ownedOuterRef.id }]);
assert.deepEqual(childReplacement.data.candidate.nodes.one.localCopy, { definitionId: ownedOuterRef.id });
const retainingChild = structuredClone(copied.data.candidate.definitions[definitionRefKey(ownedOuterRef)]); retainingChild.version++; retainingChild.name = 'Display revision';
const unchangedPrivateChain = library.prepareInstanceUpdate(copied.data.candidate, { instanceId: 'one', definition: finalize(retainingChild) });
assert.equal(unchangedPrivateChain.ok, true, JSON.stringify(unchangedPrivateChain));
assert.deepEqual(unchangedPrivateChain.data.candidate.localDefinitionOwners, copied.data.candidate.localDefinitionOwners);
let getterCalls = 0; const commandWithGetter = { get viewPath() { getterCalls++; return []; } };
assert.equal(composition.prepareCreateFromSelection(root(), commandWithGetter).ok, false); assert.equal(getterCalls, 0);
console.log('workflow-composition-edits: nested ownership, bounded revisions, conversion and unpack passed');
