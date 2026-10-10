import { computeDefinitionIdentity, definitionRefKey } from '../../src/workflow/definitions.js';

const ref = definition => ({ id: definition.id, version: definition.version, semanticHash: definition.semanticHash });
const finish = draft => {
    const identity = computeDefinitionIdentity(draft);
    if (!identity.ok) throw new Error(identity.error.message);
    return { ...identity.data.materializedDefinition, semanticHash: identity.data.semanticHash };
};
const wrapper = (id, definition) => ({ id, type: 'subgraph', definition: ref(definition), parameterOverrides: {}, roleOverrides: {}, nodeBindingOverrides: {} });

export function effectiveInstanceWorkflow(nested = false) {
    const leaf = finish({ id: 'effective-leaf', version: 1, name: 'Effective leaf', interface: [], parameters: [
        { id: 'budget', label: 'Budget', target: { instancePath: [], nodeId: 'compact', controlId: 'targetTokens' } },
    ], body: { schema: 3, runtime: 2, mode: 'native-pre', roles: {}, nodes: {
        compact: { id: 'compact', type: 'workflow', operation: 'smart-compactor', x: 200, y: 180, targetTokens: 960 },
        inherited: { id: 'inherited', type: 'workflow', operation: 'response-plan', x: 560, y: 180 },
    }, wires: {} } });
    const outer = nested ? finish({ id: 'effective-outer', version: 1, name: 'Effective outer', interface: [], parameters: [
        { id: 'budget', label: 'Budget', target: { instancePath: ['left'], nodeId: 'compact', controlId: 'targetTokens' } },
    ], body: { schema: 3, runtime: 2, mode: 'native-pre', nodes: {
        left: { ...wrapper('left', leaf), parameterOverrides: { budget: 500 } },
        right: { ...wrapper('right', leaf), parameterOverrides: { budget: 600 } },
    }, wires: {} } }) : leaf;
    return { id: 'effective-instance-root', name: 'Effective instance', schema: 3, runtime: 2, mode: 'native-pre', roles: { Analysis: { profileId: 'parent-profile', model: 'parent-model' } }, nodes: {
        one: { ...wrapper('one', outer), x: 200, y: 180, parameterOverrides: { budget: 720 } },
        two: { ...wrapper('two', outer), x: 560, y: 180 },
    }, wires: {}, definitions: { [definitionRefKey(leaf)]: leaf, ...(nested ? { [definitionRefKey(outer)]: outer } : {}) } };
}
