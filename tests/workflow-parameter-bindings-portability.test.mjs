import test from 'node:test';
import assert from 'node:assert/strict';
import {computeDefinitionIdentity, definitionRefKey, inspectPinnedDefinitionIdentity} from '../src/workflow/definitions.js';
import {exportWorkflow, parseWorkflow, exportSubgraph, parseSubgraph, selectSubgraphClosure} from '../src/workflow/packages.js';
import {runWorkflow} from '../src/workflow/runtime.js';
import {resolveBinding, requestModel} from '../src/workflow/connections.js';

const node = (id, operation, extra = {}) => ({id, type: 'workflow', operation, ...extra});
const edge = (id, from, fromPort, to, toPort) => ({id, route: 'wire', from, fromPort, to, toPort});
const ref = definition => ({id: definition.id, version: definition.version, semanticHash: definition.semanticHash});
const output = {id: 'result', label: 'Result', direction: 'output', kind: 'data', required: false, cardinality: 'one', boundaryNodeId: 'exit'};
const finalize = raw => {
    const checked = computeDefinitionIdentity(raw);
    assert.equal(checked.ok, true, JSON.stringify(checked.error));
    return {...checked.data.materializedDefinition, semanticHash: checked.data.semanticHash};
};
function fixture(localProfile = 'LOCAL-PROFILE-A', nested = true) {
    const helper = finalize({id: 'decision-helper', version: 1, name: 'Decision helper', interface: [
        {id: 'item', label: 'Item', direction: 'input', kind: 'data', required: true, cardinality: 'one', boundaryNodeId: 'entry'}, output,
    ], parameters: [], body: {schema: 3, runtime: 2, mode: 'native-unified', roles: {decision: {profileId: null, model: null}}, nodes: {
        entry: {id: 'entry', type: 'subgraph-input', interfacePortId: 'item'},
        decide: node('decide', 'decision', {questions: {answer: {type: 'noul', instructions: 'Is this item present?'}}}),
        exit: {id: 'exit', type: 'subgraph-output', interfacePortId: 'result'},
    }, wires: {a: edge('a', 'entry', 'out', 'decide', 'in'), b: edge('b', 'decide', 'out', 'exit', 'in')}}});
    const each = finalize({id: 'qualified-each', version: 1, name: 'Qualified each', interface: [output], parameters: [
        {id: 'bindings', label: 'Helper bindings', target: {instancePath: [], nodeId: 'each', controlId: 'roleOverrides'}},
    ], body: {schema: 3, runtime: 2, mode: 'native-unified', nodes: {
        items: node('items', 'text', {text: '[{"item":1}]'}), decode: node('decode', 'json-decode'),
        each: node('each', 'for-each', {helper: ref(helper), limit: 2, requestBoundPerIteration: 1}),
        exit: {id: 'exit', type: 'subgraph-output', interfacePortId: 'result'},
    }, wires: {a: edge('a', 'items', 'out', 'decode', 'in'), b: edge('b', 'decode', 'out', 'each', 'in'), c: edge('c', 'each', 'out', 'exit', 'in')}}});
    const holder = finalize({id: 'nested-holder', version: 1, name: 'Nested holder', interface: [output], parameters: [
        {id: 'bindings', label: 'Nested helper bindings', target: {instancePath: ['child'], nodeId: 'each', controlId: 'roleOverrides'}},
        {id: 'storyMetadata', label: 'Story metadata', target: {instancePath: [], nodeId: 'schedule', controlId: 'metadata'}},
    ], body: {schema: 3, runtime: 2, mode: 'native-unified', nodes: {
        child: {id: 'child', type: 'subgraph', definition: ref(each), ...(nested ? {parameterOverrides: {bindings: {decision: {profileId: localProfile, model: 'nested-model'}}}} : {})},
        schedule: node('schedule', 'time-trigger', {scheduleId: 'unused-schedule'}),
        exit: {id: 'exit', type: 'subgraph-output', interfacePortId: 'result'},
    }, wires: {a: edge('a', 'child', 'result', 'exit', 'in')}}});
    const storyMetadata = {decision: {profileId: 'FICTIONAL-ACTOR-ID', model: 'fictional-model'}};
    const graph = {id: 'portable-root', schema: 3, runtime: 2, mode: 'native-unified', definitions: Object.fromEntries([helper, each, holder].map(def => [definitionRefKey(def), def])), nodes: {
        wrapper: {id: 'wrapper', type: 'subgraph', definition: ref(holder), parameterOverrides: {bindings: {decision: {profileId: localProfile, model: null}}, storyMetadata}},
        unusedEach: node('unusedEach', 'for-each', {helper: ref(holder), limit: 1, requestBoundPerIteration: 1}),
    }, wires: {}};
    return {graph, holder, helper, storyMetadata};
}
const must = result => {assert.equal(result.ok, true, JSON.stringify(result.error)); return result.data;};
const byId = (graph, id) => Object.values(graph.definitions).find(definition => definition.id === id);

test('workflow export removes local exposed helper bindings and rebases every affected ordinary and helper pin', () => {
    const f = fixture(), before = structuredClone(f.graph), exported = exportWorkflow(f.graph);
    assert.equal(JSON.stringify(exported).includes('LOCAL-PROFILE-A'), false);
    assert.deepEqual(exported.graph.nodes.wrapper.parameterOverrides.bindings, {decision: {profileId: null, model: null}});
    const holder = byId(exported.graph, 'nested-holder');
    assert.deepEqual(holder.body.nodes.child.parameterOverrides.bindings, {decision: {profileId: null, model: 'nested-model'}});
    assert.notEqual(holder.semanticHash, f.holder.semanticHash, 'sanitized parameter semantics require a new exact pin');
    assert.deepEqual(exported.graph.nodes.wrapper.definition, ref(holder));
    assert.deepEqual(exported.graph.nodes.unusedEach.helper, ref(holder));
    for (const [key, definition] of Object.entries(exported.graph.definitions)) {
        assert.equal(key, definitionRefKey(definition));
        must(inspectPinnedDefinitionIdentity(ref(definition), exported.graph.definitions));
    }
    assert.deepEqual(must(parseWorkflow(JSON.stringify(exported))), exported.graph);
    assert.deepEqual(f.graph, before);
});

test('portable rebasing propagates through parent snapshots and helper references to those parents', () => {
    const f = fixture(), parent = finalize({id: 'parent-holder', version: 1, name: 'Parent holder', interface: [output], parameters: [], body: {schema: 3, runtime: 2, mode: 'native-unified', nodes: {
        saved: {id: 'saved', type: 'subgraph', definition: ref(f.holder)},
        exit: {id: 'exit', type: 'subgraph-output', interfacePortId: 'result'},
    }, wires: {a: edge('a', 'saved', 'result', 'exit', 'in')}}});
    f.graph.definitions[definitionRefKey(parent)] = parent;
    f.graph.nodes.wrapper.definition = ref(parent);
    delete f.graph.nodes.wrapper.parameterOverrides;
    f.graph.nodes.unusedEach.helper = ref(parent);
    const portable = exportWorkflow(f.graph).graph, holder = byId(portable, 'nested-holder'), exportedParent = byId(portable, 'parent-holder');
    assert.notEqual(exportedParent.semanticHash, parent.semanticHash);
    assert.deepEqual(exportedParent.body.nodes.saved.definition, ref(holder));
    assert.deepEqual(portable.nodes.wrapper.definition, ref(exportedParent));
    assert.deepEqual(portable.nodes.unusedEach.helper, ref(exportedParent));
    assert.equal(Object.hasOwn(portable.nodes.wrapper, 'parameterOverrides'), false);
    assert.deepEqual(must(parseWorkflow(JSON.stringify(exportWorkflow(f.graph)))), portable);
});

test('portable identities remain stable when only local exposed helper profile choices change', () => {
    const a = fixture('LOCAL-PROFILE-A'), b = fixture('LOCAL-PROFILE-B');
    assert.notEqual(a.holder.semanticHash, b.holder.semanticHash);
    assert.deepEqual(exportWorkflow(a.graph), exportWorkflow(b.graph));
});

test('binding sanitization follows qualified control targets and preserves similarly shaped story JSON', () => {
    const f = fixture(), portable = exportWorkflow(f.graph).graph;
    assert.deepEqual(portable.nodes.wrapper.parameterOverrides.storyMetadata, f.storyMetadata);
    assert.equal(JSON.stringify(portable).includes('FICTIONAL-ACTOR-ID'), true);
});

test('raw workflow import sanitizes exposed helper bindings with exact rebasing and remains idempotent', () => {
    const f = fixture(), parsed = must(parseWorkflow(JSON.stringify({kind: 'lattice-workflow', schema: 2, minRuntime: 2, graph: f.graph})));
    assert.equal(JSON.stringify(parsed).includes('LOCAL-PROFILE-A'), false);
    assert.deepEqual(parsed, exportWorkflow(f.graph).graph);
    assert.deepEqual(must(parseWorkflow(JSON.stringify(exportWorkflow(parsed)))), parsed);
});

test('standalone export carries the helper closure and rebases sanitized nested binding overrides', () => {
    const f = fixture(), before = structuredClone(f.holder), exported = exportSubgraph(f.holder, f.graph.definitions);
    assert.equal(JSON.stringify(exported).includes('LOCAL-PROFILE-A'), false);
    assert.ok(exported.definitions[definitionRefKey(f.helper)], 'a standalone For Each must carry its exact helper');
    const parsed = must(parseSubgraph(JSON.stringify(exported)));
    assert.deepEqual(parsed.definition, exported.definition);
    assert.deepEqual(parsed.definitions, exported.definitions);
    assert.deepEqual(exportSubgraph(parsed.definition, parsed.definitions), exported);
    assert.deepEqual(f.holder, before);
});

test('imported qualified binding parameters still dispatch through the newly selected local profile', async () => {
    const f = fixture('LOCAL-PROFILE-A', false), graph = must(parseWorkflow(JSON.stringify(exportWorkflow(f.graph)))), before = structuredClone(graph.definitions);
    graph.nodes.wrapper.parameterOverrides.bindings.decision.profileId = 'imported-choice';
    const requests = [], profile = {id: 'imported-choice', name: 'Imported choice', api: 'openai', model: 'profile-default'};
    const context = {CONNECT_API_MAP: {openai: {selected: 'openai', source: 'openai'}}, chatCompletionSettings: {}, ChatCompletionService: {presetToGeneratePayload: async (_preset, _source, payload) => payload}, ConnectionManagerRequestService: {
        getProfile: id => id === profile.id ? profile : null,
        sendRequest: async (profileId, messages, maxTokens, options, payload) => {requests.push([profileId, payload.model]); return {choices: [{message: {content: '{"answers":{"answer":{"type":"noul","accepted":true}}}'}, finish_reason: 'stop'}]};},
    }};
    const result = await runWorkflow(graph, {target: {workflowId: graph.id, instancePath: [], nodeId: 'wrapper', portId: 'result'}, resolveBinding: (n, g) => resolveBinding(n, g, context), countTokens: async () => ({tokens: 1}), request: options => requestModel(options, context)});
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.equal(result.actualCalls, 1);
    assert.deepEqual(requests, [['imported-choice', 'profile-default']]);
    assert.deepEqual(graph.definitions, before);
});

test('closure selection returns diagnostics for malformed drafts before reading unchecked child metadata', () => {
    for (const mutate of [
        (definition, table) => {definition.body.nodes.broken = null;},
        (definition, table) => {definition.body.nodes.child.definition = null;},
        (definition, table) => {table[definitionRefKey(definition.body.nodes.child.definition)].parameters = [null];},
        (definition, table) => {table[definitionRefKey(definition.body.nodes.child.definition)].parameters[0].target = null;},
        (definition, table) => {table[definitionRefKey(definition.body.nodes.child.definition)].body.nodes = null;},
    ]) {
        const f = fixture(), definition = structuredClone(f.holder), table = structuredClone(f.graph.definitions);
        mutate(definition, table);
        let result;
        assert.doesNotThrow(() => {result = selectSubgraphClosure(definition, table);});
        assert.equal(result.ok, false);
    }
});

test('qualified exposed helper-pin overrides rebase and carry their alternative helper closure', () => {
    const f = fixture(), eachDraft = structuredClone(byId(f.graph, 'qualified-each'));
    eachDraft.id = 'alternate-each';
    eachDraft.parameters.push({id: 'helperChoice', label: 'Helper choice', target: {instancePath: [], nodeId: 'each', controlId: 'helper'}});
    const each = finalize(eachDraft), driver = finalize({id: 'driver', version: 1, name: 'Driver', interface: [output], parameters: [
        {id: 'helperChoice', label: 'Qualified helper choice', target: {instancePath: ['wrapped'], nodeId: 'each', controlId: 'helper'}},
    ], body: {schema: 3, runtime: 2, mode: 'native-unified', nodes: {
        wrapped: {id: 'wrapped', type: 'subgraph', definition: ref(each), parameterOverrides: {helperChoice: ref(f.holder), bindings: {decision: {profileId: 'LOCAL-PROFILE-A', model: null}}}},
        exit: {id: 'exit', type: 'subgraph-output', interfacePortId: 'result'},
    }, wires: {a: edge('a', 'wrapped', 'result', 'exit', 'in')}}});
    f.graph.definitions[definitionRefKey(each)] = each;
    f.graph.definitions[definitionRefKey(driver)] = driver;
    f.graph.nodes = {wrapper: {id: 'wrapper', type: 'subgraph', definition: ref(driver), parameterOverrides: {helperChoice: ref(f.holder)}}};
    const portable = exportWorkflow(f.graph).graph, holder = byId(portable, 'nested-holder');
    assert.deepEqual(portable.nodes.wrapper.parameterOverrides.helperChoice, ref(holder));
    assert.deepEqual(byId(portable, 'driver').body.nodes.wrapped.parameterOverrides.helperChoice, ref(holder));
    assert.equal(JSON.stringify(portable).includes('LOCAL-PROFILE-A'), false);
    must(parseWorkflow(JSON.stringify(exportWorkflow(f.graph))));
    const standalone = exportSubgraph(driver, f.graph.definitions), parsed = must(parseSubgraph(JSON.stringify(standalone)));
    assert.ok(Object.values(parsed.definitions).some(definition => definition.id === 'nested-holder'));
    assert.ok(Object.values(parsed.definitions).some(definition => definition.id === 'qualified-each'));
    assert.ok(Object.values(parsed.definitions).some(definition => definition.id === 'decision-helper'));
    assert.deepEqual(exportSubgraph(parsed.definition, parsed.definitions), standalone);
});

test('exposed helper binding export retains sparse inheritance and explicit null fields', () => {
    for (const [value, expected] of [
        [{}, {}],
        [{decision: {model: 'explicit-model'}}, {decision: {model: 'explicit-model'}}],
        [{decision: {profileId: 'LOCAL-PROFILE-A'}}, {decision: {profileId: null}}],
        [{decision: {profileId: null, model: null}}, {decision: {profileId: null, model: null}}],
    ]) {
        const f = fixture('LOCAL-PROFILE-A', false);
        f.graph.nodes.wrapper.parameterOverrides.bindings = value;
        const graph = exportWorkflow(f.graph).graph;
        assert.deepEqual(graph.nodes.wrapper.parameterOverrides.bindings, expected);
        assert.deepEqual(must(parseWorkflow(JSON.stringify(exportWorkflow(f.graph)))).nodes.wrapper.parameterOverrides.bindings, expected);
    }
});


test('ordinary notes with non-executable helper metadata export without treating them as workflow requests',()=>{
 const nodes={n:{id:'n',type:'note',content:'ordinary note',operation:'for-each',helper:null}},graph={id:'notes',schema:3,runtime:2,mode:'native-unified',nodes,wires:{}};
 const exported=exportWorkflow(graph);assert.equal(exported.kind,'lattice-workflow');assert.equal(parseWorkflow(JSON.stringify(exported)).ok,true);assert.equal(exported.graph.nodes.n.content,'ordinary note');
 const definition=finalize({id:'note-helper',version:1,name:'Note helper',interface:[],parameters:[],body:{schema:3,runtime:2,mode:'native-unified',nodes,wires:{}}}),standalone=exportSubgraph(definition);assert.equal(parseSubgraph(JSON.stringify(standalone)).ok,true);assert.equal(standalone.definition.body.nodes.n.content,'ordinary note');
});
