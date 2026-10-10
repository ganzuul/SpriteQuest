import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveBinding } from '../src/workflow/connections.js';
import { computeDefinitionIdentity, definitionRefKey, nodeBindingOverrideKey } from '../src/workflow/definitions.js';
import { resolveWorkflow } from '../src/workflow/resolve.js';
import { exportWorkflow, parseWorkflow } from '../src/workflow/packages.js';
import { runWorkflow } from '../src/workflow/runtime.js';
import {withNativeBoundary} from './helpers/workflow-fixtures.mjs';

const role = { profileId: 'role-profile', model: 'role-model' };
const profiles = Object.fromEntries(['role', 'node', 'inner', 'outer'].map(name => [`${name}-profile`, {
    id: `${name}-profile`, name: `${name} connection`, api: 'custom', model: `${name}-default`, 'api-url': 'https://fixture.example',
}]));
const host = {
    CONNECT_API_MAP: { custom: { selected: 'openai', source: 'custom' } },
    ConnectionManagerRequestService: { getProfile: id => profiles[id] },
};
const wire = (id, from, fromPort, to, toPort) => ({ id, route: 'wire', from, fromPort, to, toPort });
const plan = (id, binding = {}) => ({ id, type: 'workflow', operation: 'response-plan', ...binding });
const terminal = id => ({ id, type: 'workflow', operation: 'guidance' });
const ref = definition => ({ id: definition.id, version: definition.version, semanticHash: definition.semanticHash });
const instance = (id, definition, overrides = {}) => ({ id, type: 'subgraph', definition: ref(definition), ...overrides });

function finalize(draft) {
    const identity = computeDefinitionIdentity(draft);
    assert.equal(identity.ok, true, JSON.stringify(identity.error));
    return { ...identity.data.materializedDefinition, semanticHash: identity.data.semanticHash };
}

function definition(id, work, roles = { Analysis: role }) {
    return finalize({ id, version: 1, name: id, parameters: [], interface: [
        { id: 'input', label: 'Input', kind: 'context', direction: 'input', required: true, cardinality: 'one', boundaryNodeId: 'entry' },
        { id: 'output', label: 'Output', kind: 'guidance', direction: 'output', required: false, cardinality: 'one', boundaryNodeId: 'exit' },
    ], body: { schema: 3, runtime: 2, mode: 'native-pre', roles, nodes: {
        entry: { id: 'entry', type: 'subgraph-input', interfacePortId: 'input' },
        [work.id]: work,
        exit: { id: 'exit', type: 'subgraph-output', interfacePortId: 'output' },
    }, wires: {
        input: wire('input', 'entry', 'out', work.id, work.type === 'subgraph' ? 'input' : 'in'),
        output: wire('output', work.id, work.type === 'subgraph' ? 'output' : 'out', 'exit', 'in'),
    } } });
}

function root(branches, definitions = {}) {
    const graph = { id: 'root', schema: 3, runtime: 2, mode: 'native-unified', roles: { Analysis: role },
        nodes: { source: { id: 'source', type: 'workflow', operation: 'scene-context' } }, wires: {}, definitions };
    for (const branch of branches) {
        const outputId = `${branch.id}-output`;
        graph.nodes[branch.id] = branch;
        graph.nodes[outputId] = terminal(outputId);
        graph.wires[`${branch.id}-input`] = wire(`${branch.id}-input`, 'source', 'out', branch.id, branch.type === 'subgraph' ? 'input' : 'in');
        graph.wires[outputId] = wire(outputId, branch.id, branch.type === 'subgraph' ? 'output' : 'out', outputId, 'in');
    }
    graph.nodes.joined={id:'joined',type:'workflow',operation:'join',artifactKind:'guidance',inputs:branches.map(branch=>({id:branch.id,label:branch.id,required:true}))};
    for(const branch of branches)graph.wires['joined-'+branch.id]=wire('joined-'+branch.id,branch.id+'-output','out','joined',branch.id);
    return withNativeBoundary(graph,'joined');
}

function nested(innerBinding = {}, outerBinding = undefined) {
    const leaf = definition('leaf', plan('work'));
    const inner = instance('child', leaf, { nodeBindingOverrides: { [nodeBindingOverrideKey([], 'work')]: innerBinding } });
    const wrapper = definition('wrapper', inner, {});
    const first = instance('first', wrapper, {
        ...(outerBinding === undefined ? {} : { nodeBindingOverrides: { [nodeBindingOverrideKey(['child'], 'work')]: outerBinding } }),
    });
    const second = instance('second', wrapper);
    return root([first, second], { [definitionRefKey(leaf)]: leaf, [definitionRefKey(wrapper)]: wrapper });
}

async function execute(graph) {
    const before = structuredClone(graph), addresses = new WeakMap(), requests = [];
    const result = await runWorkflow(graph, {
        target:{workflowId:graph.id,instancePath:[],nodeId:'joined',portId:'out'},
        snapshot: () => ({ kind: 'context', messages: [{ id: 'scene', role: 'user', text: 'What happens next?', source: 'chat' }] }),
        countTokens: async text => ({ tokens: Math.ceil(text.length / 4), method: 'fixture' }),
        resolveBinding: (node, bindingGraph, address) => {
            assert.deepEqual(bindingGraph.roles, {}, 'the expanded selectors must be complete before runtime binding');
            const binding = resolveBinding(node, bindingGraph, host);
            if (binding.ok) addresses.set(binding.data, address);
            return binding;
        },
        request: async request => {
            const address = addresses.get(request.binding);
            requests.push([address.instancePath, address.nodeId, request.binding.profileId, request.binding.model]);
            return { ok: true, data: { text: 'Consider a quiet departure.', finish: 'stop' } };
        },
    });
    assert.deepEqual(graph, before, 'execution must preserve shared definitions and saved selectors');
    return { result, requests };
}

for (const [label, binding] of [
    ['omitted model', { profileId: 'node-profile' }],
    ['null model', { profileId: 'node-profile', model: null }],
]) test(`a saved node profile with ${label} requests its profile model`, async () => {
    const graph = root([plan('selected', binding), plan('inherited', { profileId: null, model: null })]);
    const { result, requests } = await execute(graph);
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.deepEqual(requests, [
        [[], 'selected', 'node-profile', 'node-default'],
        [[], 'inherited', 'role-profile', 'role-model'],
    ]);
});

test('a saved node explicit model remains paired with its own profile', async () => {
    const { result, requests } = await execute(root([plan('selected', { profileId: 'node-profile', model: 'node-explicit' })]));
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.deepEqual(requests, [[[], 'selected', 'node-profile', 'node-explicit']]);
});

test('a profile-only nested node override requests its profile model without affecting a sibling instance', async () => {
    const { result, requests } = await execute(nested({}, { profileId: 'outer-profile' }));
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.deepEqual(requests, [
        [['first', 'child'], 'work', 'outer-profile', 'outer-default'],
        [['second', 'child'], 'work', 'role-profile', 'role-model'],
    ]);
});

test('nested node override fields retain outer precedence and inner explicit model choices', async () => {
    for (const [inner, outer, expected] of [
        [{ profileId: 'inner-profile', model: 'inner-explicit' }, { profileId: 'outer-profile' }, ['outer-profile', 'inner-explicit']],
        [{ profileId: 'inner-profile', model: 'inner-explicit' }, { model: 'outer-explicit' }, ['inner-profile', 'outer-explicit']],
        [{ profileId: 'inner-profile', model: 'inner-explicit' }, { profileId: 'outer-profile', model: null }, ['outer-profile', 'outer-default']],
    ]) {
        const { result, requests } = await execute(nested(inner, outer));
        assert.equal(result.ok, true, JSON.stringify(result.error));
        assert.deepEqual(requests, [
            [['first', 'child'], 'work', ...expected],
            [['second', 'child'], 'work', 'inner-profile', 'inner-explicit'],
        ]);
    }
});

test('a profile-only role override keeps the merged role model', async () => {
    const leaf = definition('leaf', plan('work'));
    const graph = root([
        instance('first', leaf, { roleOverrides: { Analysis: { profileId: 'outer-profile' } } }),
        instance('second', leaf),
    ], { [definitionRefKey(leaf)]: leaf });
    const { result, requests } = await execute(graph);
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.deepEqual(requests, [
        [['first'], 'work', 'outer-profile', 'role-model'],
        [['second'], 'work', 'role-profile', 'role-model'],
    ]);
});

test('an explicit wrapper model null uses the selected role profile model', async () => {
    const { result, requests } = await execute(nested({}, { model: null }));
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.deepEqual(requests, [
        [['first', 'child'], 'work', 'role-profile', 'role-default'],
        [['second', 'child'], 'work', 'role-profile', 'role-model'],
    ]);
});

test('an explicit wrapper profile null blocks role fallback before any request', async () => {
    const graph = nested({ profileId: 'inner-profile' }, { profileId: null });
    const expanded = resolveWorkflow(graph);
    assert.equal(expanded.ok, true, JSON.stringify(expanded.error));
    const selected = expanded.data.primitives.find(unit => unit.address.instancePath[0] === 'first' && unit.address.nodeId === 'work');
    assert.equal(selected.node.profileId, null);
    const { result, requests } = await execute(graph);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'BINDING_MISSING');
    assert.deepEqual(requests, []);
});

test('an active profile occurrence override follows live model while its pinned sibling keeps the inherited profile', async () => {
    host.mainApi = 'openai';host.chatCompletionSettings = {chat_completion_source:'nanogpt',nanogpt_model:'live-model'};
    host.getChatCompletionModel = settings => settings.nanogpt_model;
    host.ChatCompletionService = {presetToGeneratePayload:async()=>({}),sendRequest:async()=>({})};
    const { result, requests } = await execute(nested({}, {profileId:'lattice:active-sillytavern'}));
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.deepEqual(requests, [
        [['first','child'],'work','lattice:active-sillytavern','live-model'],
        [['second','child'],'work','role-profile','role-model'],
    ]);
});


test('portable pinned occurrence selectors preserve the active marker while stripping sibling local role profiles', () => {
    const graph = nested({}, {profileId:'lattice:active-sillytavern'});
    const imported = parseWorkflow(JSON.stringify(exportWorkflow(graph)));
    assert.equal(imported.ok,true,JSON.stringify(imported.error));
    assert.equal(imported.data.nodes.first.nodeBindingOverrides[nodeBindingOverrideKey(['child'],'work')].profileId,'lattice:active-sillytavern');
    assert.equal(graph.roles.Analysis.profileId,'role-profile');
    assert.equal(imported.data.roles.Analysis.profileId,null);
});
