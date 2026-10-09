import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as validation from '../src/workflow/graph-validation.js';
import { computeDefinitionIdentity, definitionRefKey } from '../src/workflow/definitions.js';
import { nestedWorkflow } from './fixtures/workflow-prepared-fixture.mjs';

function fixture() {
    const root = nestedWorkflow();
    const original = Object.values(root.definitions).find(item => item.id === 'prepared-outer');
    const draft = structuredClone(original);
    draft.body.nodes.work.roleOverrides = { Analysis: { model: 'library-model' } };
    const identity = computeDefinitionIdentity(draft); assert.equal(identity.ok, true);
    const definition = { ...identity.data.materializedDefinition, semanticHash: identity.data.semanticHash };
    const snapshots = Object.fromEntries(Object.entries(root.definitions).filter(([, item]) => item.id !== original.id));
    return { definition, snapshots };
}

test('a real checked definition exposes its bounded nested display inventory without a synthetic workflow', () => {
    assert.equal(typeof validation.inspectDefinitionGraph, 'function');
    const { definition, snapshots } = fixture(), before = structuredClone({ definition, snapshots });
    const result = validation.inspectDefinitionGraph(definition, snapshots);
    assert.equal(result.ok, true, JSON.stringify(result));
    const { expansion, ...metadata } = result.data;
    assert.deepEqual(metadata, validation.validateDefinition(definition, snapshots).data);
    assert.deepEqual(expansion.scopes.map(scope => scope.instancePath), [[], ['work']]);
    assert.equal(expansion.nodeCount, 6);
    assert.equal(expansion.primitives.length, 1);
    const leaf = expansion.primitives[0];
    assert.deepEqual(leaf.address.instancePath, ['work']);
    assert.equal(leaf.node.profileId, 'local'); assert.equal(leaf.node.model, 'library-model');
    const pins = [...expansion.pins.values()];
    assert.ok(pins.some(pin => pin.address.nodeId === 'entry' && pin.direction === 'output' && pin.kind === 'context'));
    assert.ok(pins.some(pin => pin.address.nodeId === 'exit' && pin.direction === 'input' && pin.kind === 'guidance'));
    assert.equal(result.data.nodes, undefined); // Definition inspection is not a root execution document.
    leaf.node.model = 'changed display'; expansion.scopes[0].graph.nodes.work.title = 'Display alias';
    assert.deepEqual({ definition, snapshots }, before);
    assert.equal(Object.isFrozen(definition), false); assert.equal(Object.isFrozen(snapshots), false);
});

test('definition display retains the complete validator admission and never executes accessors', () => {
    assert.equal(typeof validation.inspectDefinitionGraph, 'function');
    const { definition, snapshots } = fixture();
    for (const [input, table] of [
        [{ ...definition, semanticHash: 'sha256:' + '0'.repeat(64) }, snapshots],
        [definition, {}],
        [definition, { ...snapshots, [definitionRefKey(definition)]: { ...definition, body: { ...definition.body, nodes: { ...definition.body.nodes, work: { ...definition.body.nodes.work, enabled: false } } } } }],
        [{ ...definition, body: { ...definition.body, nodes: { ...definition.body.nodes, illegal: { id: 'illegal', type: 'workflow', operation: 'scene-context' } } } }, snapshots],
    ]) {
        const expected = validation.validateDefinition(input, table), actual = validation.inspectDefinitionGraph(input, table);
        assert.equal(expected.ok, false); assert.deepEqual(actual, expected);
    }
    let reads = 0;
    const dangerous = {}; Object.defineProperty(dangerous, 'id', { enumerable: true, get() { reads++; throw new Error('must not read'); } });
    assert.equal(validation.inspectDefinitionGraph(dangerous, snapshots).ok, false);
    assert.equal(validation.inspectDefinitionGraph(definition, { unsafe: dangerous }).ok, false);
    assert.equal(reads, 0);
});
