import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { parseSubgraph, exportSubgraph, parseWorkflow, exportWorkflow } from '../src/workflow/packages.js';
import { computeDefinitionIdentity, definitionRefKey, validateDefinition } from '../src/workflow/definitions.js';
import { resolveWorkflow } from '../src/workflow/resolve.js';
import { runWorkflow } from '../src/workflow/runtime.js';
import { operationFor } from '../src/workflow/catalog.js';
// Git core.autocrlf changes storage newlines, not package JSON content.
const canonicalFile = url => readFileSync(url, 'utf8').replace(/\r\n/g, '\n');

assert.ok(existsSync(new URL('../src/workflow/library/subgraphs.js', import.meta.url)), 'portable library factory exists');
const { createLibrarySubgraph } = await import('../src/workflow/library/subgraphs.js');
const lens = createLibrarySubgraph('context-lens');
assert.equal(lens.ok, true);
const parsed = parseSubgraph(lens.data.json);
assert.equal(parsed.ok, true);
assert.deepEqual(parsed.data.definition, lens.data.definition);
assert.equal(validateDefinition(parsed.data.definition, parsed.data.definitions).ok, true);
assert.equal(computeDefinitionIdentity(parsed.data.definition).data.semanticHash, parsed.data.definition.semanticHash);
assert.equal(JSON.stringify(exportSubgraph(parsed.data.definition, parsed.data.definitions), null, 2) + '\n', lens.data.json);
assert.deepEqual(lens.data.definition.interface.map(port => [port.id, port.kind]), [['context', 'context'], ['selected-context', 'context']]);
assert.equal(lens.data.definition.body.nodes.compact.method, 'select');
assert.deepEqual(lens.data.definition.parameters.map(parameter => parameter.id), ['targetTokens', 'keepRecent', 'pins', 'method', 'purpose', 'maxTokens']);
assert.ok(Object.values(lens.data.definition.body.nodes).every(node => !['scene-context', 'guidance'].includes(node.operation)));
console.log('workflow-library-subgraphs: Context Lens passed');

const library = await import('../src/workflow/library/subgraphs.js');
const scene = createLibrarySubgraph('scene-compass');
assert.equal(scene.ok, true, 'Scene Compass package exists');
const scenePackage = parseSubgraph(scene.data.json).data;
assert.deepEqual(Object.keys(scenePackage.definitions), [definitionRefKey(lens.data.definition)]);
assert.deepEqual(scenePackage.definition.body.nodes.lens.definition, { id: lens.data.definition.id, version: 1, semanticHash: lens.data.definition.semanticHash });
assert.equal(scenePackage.definition.body.definitions, undefined, 'closure remains flat outside bodies');
assert.equal(computeDefinitionIdentity(scenePackage.definition).data.semanticHash, scenePackage.definition.semanticHash);
assert.ok(scenePackage.definition.parameters.some(parameter => parameter.target.instancePath[0] === 'lens'));
assert.match(scenePackage.definition.body.nodes.plan.instructions, /user agency/i);
const sceneRoot = library.createLibraryWorkflow('scene-compass');
assert.equal(sceneRoot.ok, true);
assert.equal(resolveWorkflow(sceneRoot.data.graph).data.callBound, 1);
assert.equal(library.createLibraryWorkflow('context-lens').error.code, 'LIBRARY_UTILITY_ONLY');
const sceneBefore = JSON.stringify(sceneRoot.data.graph);
const requests = [];
const sceneRun = await runWorkflow(sceneRoot.data.graph, {
    snapshot: () => ({ kind: 'context', messages: [{ id: 'user-1', role: 'user', text: 'Mara waits by the door.' }] }),
    countTokens: async text => ({ tokens: Math.ceil(text.length / 4), method: 'fixed-test' }),
    resolveBinding: node => { assert.equal(node.modelRole, 'Analysis'); return { ok: true, data: { model: 'fixed-test-model' } }; },
    request: async request => { requests.push(request); return { ok: true, data: { text: 'Mara could choose to leave.', finish: 'stop' } }; },
});
assert.equal(sceneRun.ok, true);
assert.equal(sceneRun.actualCalls, 1);
assert.equal(requests.length, 1);
assert.match(requests[0].messages[0].content, /Preserve user agency/);
assert.equal(JSON.stringify(sceneRoot.data.graph), sceneBefore);
console.log('workflow-library-subgraphs: Scene Compass passed');

// Known cleanup recipes must fail before exposing any executable graph or definition.
for (const id of ['literal-cleanup', 'formatting-cleanup']) {
    for (const factory of [createLibrarySubgraph, library.createLibraryWorkflow]) {
        const result = factory(id);
        assert.equal(result.ok, false, `${id} requires permission-preserving registration`);
        assert.equal(result.error.code, 'LIBRARY_PERMISSION_PREREQUISITE');
        assert.match(result.error.message, /permission/i);
        assert.ok(!Object.hasOwn(result, 'data'), 'deferred recipes expose no executable package');
    }
}
let deferredEffects = 0;
for (const [id, draft] of [
    ['literal-cleanup', { kind: 'draft', text: 'the tension was palpable', source: { originalText: 'the tension was palpable' }, spans: [] }],
    ['literal-cleanup', { kind: 'draft', text: 'the tension was palpable', source: { originalText: 'the tension was palpable' }, protectedLiterals: ['the tension was palpable'] }],
    ['literal-cleanup', { kind: 'draft', text: 'the tension was palpable', source: { originalText: 'the tension was palpable' }, scope: 'dialogue', spans: [] }],
    ['formatting-cleanup', { kind: 'draft', text: 'one\r\ntwo', source: { originalText: 'one\r\ntwo' } }],
]) {
    const before = structuredClone(draft);
    const requested = library.createLibraryWorkflow(id);
    const effect = () => { deferredEffects++; throw new Error('Deferred cleanup cannot perform effects'); };
    if (requested.ok) await runWorkflow(requested.data.graph, { snapshot: () => { deferredEffects++; return draft; }, resolveBinding: effect, countTokens: effect, request: effect, createWorker: effect });
    assert.equal(requested.ok, false);
    assert.deepEqual(draft, before);
}
assert.equal(deferredEffects, 0, 'deferred cleanup reaches no snapshot, binding, model or Worker port');
for (const id of ['literal-cleanup', 'formatting-cleanup']) for (const kind of ['subgraphs', 'workflows']) {
    assert.equal(existsSync(new URL(`../examples/library/${kind}/${id}.json`, import.meta.url)), false, `${id} executable ${kind} file is absent`);
}
console.log('workflow-library-subgraphs: cleanup permission deferral passed');
for (const id of ['context-lens', 'scene-compass']) {
    const { definition, json } = createLibrarySubgraph(id).data;
    const imported = parseSubgraph(json);
    assert.equal(imported.ok, true);
    assert.equal(definition.id, `lattice.library.${id}`);
    assert.equal(definition.version, 1);
    assert.equal(definition.semanticHash, computeDefinitionIdentity(definition).data.semanticHash);
    assert.equal(JSON.stringify(exportSubgraph(imported.data.definition, imported.data.definitions), null, 2) + '\n', json);
    for (const snapshot of [definition, ...Object.values(imported.data.definitions)]) {
        assert.equal(snapshot.body.definitions, undefined);
        for (const node of Object.values(snapshot.body.nodes)) {
            if (node.type !== 'workflow') continue;
            const op = operationFor(node, { phase: snapshot.body.mode.slice(7) });
            assert.ok(op, 'every package operation is registered');
            assert.ok(!op.terminal && op.input, 'sources and terminals stay outside definition bodies');
            assert.equal(node.profileId, undefined);
            assert.equal(node.model, undefined);
        }
        assert.ok(Object.values(snapshot.body.roles).every(binding => binding.model === null && binding.profileId === undefined));
    }
    const local = structuredClone(definition);
    local.name = 'Local display name';
    for (const node of Object.values(local.body.nodes)) if (node.type === 'workflow') node.profileId = 'private-local-profile';
    for (const binding of Object.values(local.body.roles)) binding.profileId = 'private-role-profile';
    assert.equal(computeDefinitionIdentity(local).data.semanticHash, definition.semanticHash);
    const stripped = exportSubgraph(local, imported.data.definitions);
    assert.ok(!JSON.stringify(stripped).includes('private-local-profile'));
    assert.ok(!JSON.stringify(stripped).includes('private-role-profile'));
    assert.equal(parseSubgraph(JSON.stringify(stripped)).ok, true);
    const semanticChange = structuredClone(definition);
    if (id === 'context-lens') semanticChange.body.nodes.compact.targetTokens++;
    if (id === 'scene-compass') semanticChange.body.nodes.plan.instructions += ' Changed.';
    assert.notEqual(computeDefinitionIdentity(semanticChange).data.semanticHash, definition.semanticHash);
    const example = new URL(`../examples/library/subgraphs/${id}.json`, import.meta.url);
    assert.ok(existsSync(example), `${id} canonical subgraph file exists`);
    assert.equal(canonicalFile(example), json, `${id} example is generated from its canonical factory`);
    if (id !== 'context-lens') {
        const root = library.createLibraryWorkflow(id).data;
        const importedRoot = parseWorkflow(root.json);
        assert.equal(importedRoot.ok, true);
        assert.deepEqual(importedRoot.data, root.graph);
        assert.equal(JSON.stringify(exportWorkflow(importedRoot.data), null, 2) + '\n', root.json);
        assert.equal(canonicalFile(new URL(`../examples/library/workflows/${id}.json`, import.meta.url)), root.json);
        assert.ok(Object.hasOwn(root.graph.definitions, definitionRefKey(root.graph.nodes.library.definition)));
    }
}
assert.equal(existsSync(new URL('../examples/library/workflows/context-lens.json', import.meta.url)), false);
for (const invalid of ['missing', '', null, 7, {}, 'constructor', '__proto__']) {
    assert.equal(createLibrarySubgraph(invalid).error.code, 'UNKNOWN_LIBRARY_SUBGRAPH');
    assert.equal(library.createLibraryWorkflow(invalid).error.code, 'UNKNOWN_LIBRARY_WORKFLOW');
}
const tamperedScene = JSON.parse(scene.data.json);
tamperedScene.definitions[definitionRefKey(lens.data.definition)].body.nodes.compact.targetTokens++;
assert.equal(parseSubgraph(JSON.stringify(tamperedScene)).error.code, 'DEFINITION_HASH');
const missingScene = JSON.parse(scene.data.json);
missingScene.definitions = {};
assert.equal(parseSubgraph(JSON.stringify(missingScene)).error.code, 'MISSING_DEFINITION');
assert.equal(createLibrarySubgraph('context-lens').data.json, lens.data.json, 'factories remain deterministic and detached');
console.log('workflow-library-subgraphs: canonical files and portability passed');

for (const method of ['select', 'compress']) {
    const graph = structuredClone(sceneRoot.data.graph);
    graph.nodes.library.parameterOverrides = { method, targetTokens: 100, keepRecent: 1 };
    const target = { workflowId: graph.id, instancePath: ['library', 'lens'], nodeId: 'compact', portId: 'out' };
    assert.equal(resolveWorkflow(graph, { target }).data.callBound, method === 'compress' ? 1 : 0);
    assert.equal(resolveWorkflow(graph).data.callBound, method === 'compress' ? 2 : 1);
    const result = await runWorkflow(graph, {
        target,
        snapshot: () => ({ kind: 'context', messages: [{ id: 'history', role: 'user', text: 'Older fact. '.repeat(100) }, { id: 'recent', role: 'user', text: 'Current scene.' }] }),
        countTokens: async text => ({ tokens: Math.ceil(text.length / 4), method: 'fixed-test' }),
        resolveBinding: () => ({ ok: true, data: { model: 'fixed-test-model' } }),
        request: async () => ({ ok: true, data: { text: 'Earlier facts summarized.', finish: 'stop' } }),
    });
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.equal(result.actualCalls, method === 'compress' ? 1 : 0);
    assert.equal(result.recording.terminals.length, 0, 'utility target carries no terminal authority');
    assert.ok(result.recording.artifacts.some(entry => entry.value?.kind === 'context' && entry.value?.messages?.some(message => message.id === 'recent')));
}
let unboundEffects = 0;
const unbound = await runWorkflow(sceneRoot.data.graph, { snapshot: () => { unboundEffects++; }, request: () => { unboundEffects++; } });
assert.equal(unbound.error.code, 'BINDING_MISSING');
assert.equal(unbound.actualCalls, 0);
assert.equal(unboundEffects, 0);
console.log('workflow-library-subgraphs: utility modes and unresolved roles passed');
