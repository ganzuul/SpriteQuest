import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computeDefinitionIdentity, describeExposedParameter } from '../src/workflow/definition-data.js';
import { prepareNodeControlChange, graphSemanticSignature } from '../src/workflow/ports.js';
import { resolveComposeContributions } from '../src/workflow/compose-guidance.js';
import { describeOperation } from '../src/workflow/catalog.js';

function legacyDefinition() {
    return { id: 'legacy-compose', version: 1, name: 'Legacy Compose', parameters: [], interface: [], body: { schema: 3, runtime: 2, mode: 'native-pre', nodes: { compose: { id: 'compose', type: 'workflow', operation: 'compose', sections: [{ name: 'a', text: 'A' }] } }, wires: {} } };
}

test('the archived pre-change Compose pin retains its exact hash and materialized legacy controls', () => {
    // Verified using actual archived 135143e3 definition/catalog/primitive modules.
    const result = computeDefinitionIdentity(legacyDefinition()); assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.equal(result.data.semanticHash, 'sha256:37a8df2545d712d7ca9f07f17c887ff36245864282eca65bf6487da853db0b04');
    assert.equal(Object.hasOwn(result.data.materializedDefinition.body.nodes.compose, 'budgetTokens'), false);
    const explicit = legacyDefinition(); Object.assign(explicit.body.nodes.compose, { budgetTokens: 0 });
    Object.assign(explicit.body.nodes.compose.sections[0], { kind: 'text', required: false, onSkipped: 'fallback' });
    assert.equal(computeDefinitionIdentity(explicit).data.semanticHash, result.data.semanticHash);
});

test('typed Compose wires survive legal edits and incompatible kind changes require explicit removal', () => {
    const graph = { id: 'typed-compose', schema: 3, runtime: 2, mode: 'native-unified', nodes: {
        source: { id: 'source', type: 'workflow', operation: 'compose', outputKind: 'guidance' },
        merge: { id: 'merge', type: 'workflow', operation: 'compose', outputKind: 'guidance', sections: [{ name: 'source', text: '', kind: 'guidance' }] },
    }, wires: { source: { id: 'source', route: 'wire', from: 'source', fromPort: 'out', to: 'merge', toPort: 'section.source' } } };
    const before = structuredClone(graph);
    assert.equal(describeOperation(graph, graph.nodes.merge).data.ports.find(port => port.id === 'section.source').kind, 'guidance');
    const changed = prepareNodeControlChange(graph, { nodeId: 'merge', controls: { sections: [{ name: 'source', text: '' }] } });
    assert.equal(changed.ok, false); assert.deepEqual(graph, before);
    const removed = prepareNodeControlChange(graph, { nodeId: 'merge', controls: { sections: [{ name: 'source', text: '' }] }, removeEdgeIds: ['source'] });
    assert.equal(removed.ok, true, JSON.stringify(removed.error)); assert.deepEqual(removed.data.removedEdgeIds, ['source']);
    const additive = structuredClone(graph); additive.nodes.merge.budgetTokens = 0;
    assert.equal(graphSemanticSignature(additive), graphSemanticSignature(graph));
    additive.nodes.merge.budgetTokens = 3;
    assert.notEqual(graphSemanticSignature(additive), graphSemanticSignature(graph));
    assert.equal(describeExposedParameter(graph.nodes.merge, 'budgetTokens').ok, true);
    assert.equal(describeExposedParameter(graph.nodes.merge, 'sections').ok, true);
});

test('contribution reports and original artifact identities follow declared section order', () => {
    const a = Object.freeze({ kind: 'guidance', text: 'A' }), b = Object.freeze({ kind: 'guidance', text: 'B' });
    const result = resolveComposeContributions({ sections: [{ name: 'a', text: '', kind: 'guidance' }, { name: 'b', text: '', kind: 'guidance' }] }, { 'section.b': b, 'section.a': a });
    assert.equal(result.ok, true); assert.equal(result.data.originals[0], a); assert.equal(result.data.originals[1], b);
    assert.deepEqual(result.data.contributions.map(report => [report.portId, report.status]), [['section.a', 'completed'], ['section.b', 'completed']]);
    assert.equal(Object.hasOwn(result.data.contributions[0], 'originalArtifact'), false);
});

test('legacy exposed Compose sections preserve archived pins and still admit portable definitions', async () => {
    const { validateDefinition } = await import('../src/workflow/definitions.js');
    const { exportSubgraph, parseSubgraph } = await import('../src/workflow/packages.js');
    const raw = legacyDefinition(); raw.parameters = [{ id: 'sections', label: 'Sections', target: { instancePath: [], nodeId: 'compose', controlId: 'sections' } }];
    const identity = computeDefinitionIdentity(raw); assert.equal(identity.ok, true);
    assert.equal(identity.data.semanticHash, 'sha256:309f86d0aead3cf68a2e08bc39786ff23aedfb0a6082ee55edb6a5ea64a9a116');
    const definition = { ...identity.data.materializedDefinition, semanticHash: identity.data.semanticHash };
    assert.equal(validateDefinition(definition).ok, true);
    assert.equal(parseSubgraph(JSON.stringify(exportSubgraph(definition))).ok, true);
});

test('effective exposed-section overrides cannot change a retained boundary wire to an incompatible kind', async () => {
    const { validateGraphStructure } = await import('../src/workflow/contracts.js');
    const { definitionRefKey } = await import('../src/workflow/definition-data.js');
    const raw = legacyDefinition();
    raw.parameters = [{ id: 'sections', label: 'Sections', target: { instancePath: [], nodeId: 'compose', controlId: 'sections' } }];
    raw.interface = [{ id: 'source', label: 'Source', direction: 'input', kind: 'text', required: false, cardinality: 'one', boundaryNodeId: 'entry' }];
    raw.body.nodes.entry = { id: 'entry', type: 'subgraph-input', interfacePortId: 'source' };
    raw.body.wires.source = { id: 'source', route: 'wire', from: 'entry', fromPort: 'out', to: 'compose', toPort: 'section.a' };
    const identity = computeDefinitionIdentity(raw); assert.equal(identity.ok, true);
    const definition = { ...identity.data.materializedDefinition, semanticHash: identity.data.semanticHash };
    const graph = { id: 'override', schema: 3, runtime: 2, mode: 'native-unified', nodes: { system: { id: 'system', type: 'subgraph', definition: { id: definition.id, version: definition.version, semanticHash: definition.semanticHash }, parameterOverrides: { sections: [{ name: 'a', text: 'Override' }] } } }, wires: {}, definitions: { [definitionRefKey(definition)]: definition } };
    assert.equal(validateGraphStructure(graph).ok, true);
    graph.nodes.system.parameterOverrides.sections[0].kind = 'guidance';
    const invalid = validateGraphStructure(graph); assert.equal(invalid.ok, false);
    assert.equal(invalid.error.code, 'ARTIFACT_KIND');
});
