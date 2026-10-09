import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { parseSubgraph, exportSubgraph, parseWorkflow, exportWorkflow } from '../src/workflow/packages.js';
import { computeDefinitionIdentity, definitionRefKey, validateDefinition } from '../src/workflow/definitions.js';
import { resolveWorkflow } from '../src/workflow/resolve.js';
import { runWorkflow } from '../src/workflow/runtime.js';
import { Worker } from 'node:worker_threads';
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

const literal = createLibrarySubgraph('literal-cleanup');
assert.equal(literal.ok, true, 'Literal Cleanup package exists');
assert.deepEqual(literal.data.definition.body.nodes.scan.rules, ['the words hung in the air', 'the tension was palpable', 'something unreadable']);
assert.equal(literal.data.definition.body.nodes.scan.scope, 'narration');
assert.deepEqual(literal.data.definition.parameters.map(parameter => parameter.id), ['rules', 'scope', 'caseSensitive', 'exemptions', 'pins', 'instructions', 'strength', 'maxTokens']);
const literalRoot = library.createLibraryWorkflow('literal-cleanup');
assert.equal(literalRoot.ok, true);
assert.equal(resolveWorkflow(literalRoot.data.graph).data.callBound, 1);
const runLiteral = async (text, overrides = {}) => {
    const graph = structuredClone(literalRoot.data.graph);
    graph.nodes.library.parameterOverrides = overrides;
    let requests = 0;
    const stages = [];
    const source = { originalText: text, token: 'original-source-token' };
    const result = await runWorkflow(graph, {
        snapshot: () => ({ kind: 'draft', text, source }),
        countTokens: async text => ({ tokens: Math.ceil(text.length / 4), method: 'fixed-test' }),
        resolveBinding: node => { assert.equal(node.modelRole, 'Prose'); return { ok: true, data: { model: 'fixed-test-model' } }; },
        request: async () => { requests++; return { ok: true, data: { text: '{"patches":[{"index":0,"replacement":"unease"}]}', finish: 'stop' } }; },
        onEvent: event => stages.push(event),
    });
    return { result, requests, stages, source };
};
const literalMatched = await runLiteral('Before, the tension was palpable. "the tension was palpable"');
assert.equal(literalMatched.result.ok, true);
assert.equal(literalMatched.result.actualCalls, 1);
assert.equal(literalMatched.requests, 1);
const terminalValue = result => result.recording.artifacts[result.recording.terminals[0].artifact].value;
assert.equal(terminalValue(literalMatched.result).text, 'Before, unease. "the tension was palpable"');
assert.equal(literalMatched.source.originalText, 'Before, the tension was palpable. "the tension was palpable"');
assert.ok(!JSON.stringify(literalMatched.result.recording).includes(literalMatched.source.token), 'recording excludes source authority');
assert.equal(terminalValue(literalMatched.result).reviewRequired, true);
const unmatched = await runLiteral('Mara waits quietly.');
assert.equal(unmatched.result.ok, true);
assert.equal(unmatched.result.actualCalls, 0);
assert.equal(unmatched.requests, 0);
const protectedLiteral = await runLiteral('the tension was palpable', { pins: ['the tension was palpable'] });
assert.equal(protectedLiteral.result.ok, true);
assert.equal(protectedLiteral.requests, 0);
console.log('workflow-library-subgraphs: Literal Cleanup passed');

const formatting = createLibrarySubgraph('formatting-cleanup');
assert.equal(formatting.ok, true, 'Formatting Cleanup package exists');
assert.deepEqual(formatting.data.definition.parameters.map(parameter => parameter.id), ['rules']);
assert.deepEqual(formatting.data.definition.body.nodes.rules.rules, [{ kind: 'literal', pattern: '\r\n', replacement: '\n' }]);
const formattingRoot = library.createLibraryWorkflow('formatting-cleanup');
assert.equal(formattingRoot.ok, true);
assert.equal(resolveWorkflow(formattingRoot.data.graph).data.callBound, 0);
const runFormatting = async (text, extra = {}) => {
    let effects = 0;
    const workers = [], handlers = new Map(), terminations = [];
    const draft = { kind: 'draft', text, source: { originalText: text, token: 'frozen-format-source' }, ...extra };
    const before = structuredClone(draft);
    const effect = () => { effects++; throw new Error('No model/host action expected'); };
    const result = await runWorkflow(formattingRoot.data.graph, {
        snapshot: () => draft, request: effect, resolveBinding: effect, countTokens: effect,
        apply: effect, arm: effect, install: effect,
        createWorker() {
            const worker = new Worker(new URL('./fixtures/text-rules-node-worker.mjs', import.meta.url));
            workers.push(worker);
            return {
                addEventListener(type, fn) { const handler = type === 'message' ? data => { if (!data.fixtureStarted) fn({ data }); } : error => fn({ error }); handlers.set(fn, handler); worker.on(type, handler); },
                removeEventListener(type, fn) { worker.off(type, handlers.get(fn)); handlers.delete(fn); },
                postMessage(data) { worker.postMessage(data); },
                terminate() { const pending = worker.terminate(); terminations.push(pending); return pending; },
            };
        },
    });
    await Promise.all(terminations);
    assert.equal(effects, 0);
    assert.equal(handlers.size, 0);
    assert.ok(workers.every(worker => worker.threadId === -1));
    assert.deepEqual(draft, before);
    return result;
};
const formatted = await runFormatting('one\r\ntwo\rthree');
assert.equal(formatted.ok, true, JSON.stringify(formatted.error));
assert.equal(formatted.actualCalls, 0);
assert.equal(terminalValue(formatted).text, 'one\ntwo\rthree');
assert.ok(!JSON.stringify(formatted.recording).includes('frozen-format-source'), 'recording excludes source authority');
assert.equal(terminalValue(formatted).reviewRequired, true);
const narrowed = await runFormatting('a\r\nb\r\nc', { scope: 'whole', spans: [{ index: 0, start: 0, end: 4, text: 'a\r\nb' }] });
assert.equal(narrowed.ok, true);
assert.equal(terminalValue(narrowed).text, 'a\nb\r\nc');
const noPermission = await runFormatting('a\r\nb', { spans: [] });
assert.equal(noPermission.ok, true);
assert.equal(terminalValue(noPermission).text, 'a\r\nb');
const pinnedFormatting = await runFormatting('a\r\nb', { protectedLiterals: ['a\r\nb'] });
assert.equal(pinnedFormatting.ok, false);
assert.equal(pinnedFormatting.error.code, 'PROTECTED_LITERAL_REMOVED');
console.log('workflow-library-subgraphs: Formatting Cleanup passed');

for (const id of ['context-lens', 'scene-compass', 'literal-cleanup', 'formatting-cleanup']) {
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
    if (id === 'literal-cleanup') semanticChange.body.nodes.scan.scope = 'whole';
    if (id === 'formatting-cleanup') semanticChange.body.nodes.rules.rules[0].replacement = ' ';
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
