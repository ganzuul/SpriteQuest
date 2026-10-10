import assert from 'node:assert/strict';
import { Worker as ThreadWorker } from 'node:worker_threads';
import { WORKFLOW_EXAMPLE_DATA } from '../../src/workflow/example-data.js';
import { parseWorkflow } from '../../src/workflow/packages.js';
import { createNativeWorkflowController } from '../../src/workflow/host.js';
import { createNativeMemoryAdapter } from '../../src/workflow/introspection/host-memory.js';
import { makeRecord } from '../../src/workflow/introspection/contracts.js';
// Match host.js's module URL: binding authentication is held in its WeakMap.
import { bindingStatus } from '../../src/workflow/connections.js?v=0.27.0';

// Read every companion package: the public primary-graph listing omits seven phases.
export const examplePhases = WORKFLOW_EXAMPLE_DATA.flatMap(entry => entry.packages.map(pack => ({
    id: entry.id, number: entry.number, phase: pack.graph.mode.slice(7), graphId: pack.graph.id,
})));
export function accepted(result) {
    assert.equal(result.ok, true, JSON.stringify(result.error));
    return result;
}
export function graphBy(id, phase) {
    const entry = WORKFLOW_EXAMPLE_DATA.find(entry => entry.id === id || entry.number === id);
    assert.ok(entry, `Unknown example ${id}`);
    const pack = entry.packages.find(pack => phase === undefined || pack.graph.mode === `native-${phase}`);
    assert.ok(pack, `Missing ${phase} package for ${entry.id}`);
    return accepted(parseWorkflow(JSON.stringify(pack))).data;
}
export function bindFixtureRoles(graph) {
    graph.roles.Analysis = { profileId: 'fixtureAnalysis', model: 'fixture-model' };
    graph.roles.Prose = { profileId: 'fixtureProse', model: 'fixture-model' };
    // Definition-local explicit null roles intentionally shadow parent roles.
    for (const node of Object.values(graph.nodes)) {
        if (!node.definition) continue;
        const definition = Object.values(graph.definitions).find(def => def.id === node.definition.id);
        for (const role of Object.keys(definition?.body.roles ?? {})) node.roleOverrides[role] = { ...graph.roles[role] };
    }
    return graph;
}
export function completedMessage(text, index = 1, isUser = false) {
    return isUser ? { mes: text, is_user: true, send_date: index } : {
        mes: text, is_user: false, swipe_id: 0, swipes: [text],
        swipe_info: [{ extra: {}, gen_started: index * 2 + 1, gen_finished: index * 2 + 2 }],
        extra: {}, gen_started: index * 2 + 1, gen_finished: index * 2 + 2,
    };
}
export const response = text => ({ ok: true, data: { text: typeof text === 'string' ? text : JSON.stringify(text), finish: 'stop' } });
export function reflection(overrides = {}) {
    return {
        brief: 'Observation: Mira waits at the closed gate; interpretation: she remains cautious.',
        appraisals: ['Interpretation: the promise constrains her curiosity.'],
        conflicts: ['Interpretation: curiosity conflicts with keeping the seal intact.'],
        recalls: [], sceneChanges: [],
        behaviorHints: ['Possibility: Mira pauses and asks permission without opening the letter.'],
        attentionHints: ['Observation: the closed gate is an unresolved obstacle.'],
        recalledEpisodeIds: [], ...overrides,
    };
}
export const sourceRefs = events => events.map(({ id, revision }) => ({ id, revision }));
export const upsert = (collection, id, text, refs, classification = 'observation') => ({ op: 'upsert', collection, item: { id, text, classification, sourceRefs: refs } });
export const proposal = changes => ({ changes, values: {}, curves: {}, tracks: {} });
export const guidance = context => Object.values(context.extensionPrompts).map(prompt => prompt.value).filter(Boolean).join('\n');

export function createExampleFixture(graph, options = {}) {
    bindFixtureRoles(graph);
    let currentGraph = graph, requestPort = options.request, stage;
    let memorySaves = 0, chatSaves = 0;
    const supplied = options.chat ?? [
        completedMessage('At the ferry gate, Mira holds an unopened letter.', 0, true),
        completedMessage(options.text ?? 'Mira waits at the closed ferry gate.'),
    ];
    const chat = supplied.map((item, index) => typeof item === 'string' ? completedMessage(item, index, index % 2 === 0) : structuredClone(item));
    const character = { avatar: 'mira.png', name: 'Mira', ...options.character };
    const requests = [], stages = [], events = [], requestErrors = [];
    const context = {
        chatId: options.chatId ?? 'example-acceptance', characterId: 0, characters: [character], groupId: null,
        chatMetadata: structuredClone(options.chatMetadata ?? {}), chat, extensionPrompts: {},
        CONNECT_API_MAP: { fixture: { selected: 'openai', source: 'nanogpt' } },
        ConnectionManagerRequestService: { getProfile: id => ({ id, name: id, api: 'fixture', model: 'fixture-model' }) },
        chatCompletionSettings: {},
        setExtensionPrompt(key, value) { this.extensionPrompts[key] = { value }; },
        saveChat: async () => { chatSaves++; },
        saveMetadata: async () => { memorySaves++; return true; },
        updateMessageBlock: async () => {}, swipe: { refresh: async () => {} },
    };
    const countTokens = options.tokenCount ?? (async text => ({ tokens: Math.ceil(text.length / 4), method: 'example-fixture' }));
    const controller = createNativeWorkflowController({
        context: () => context, getGraph: () => currentGraph, isEnabled: () => true, isBusy: () => false, countTokens,
        onStage(node, address) { stage = { node, address }; stages.push(stage); options.onStage?.(node, address); },
        onEvent(event) { events.push(event); options.onEvent?.(event); },
        request: async input => {
            const captured = { ...input, stage, payload: input.messages[1]?.content };
            requests.push(captured);
            try {
                accepted(bindingStatus(input.binding, context));
                assert.equal(typeof requestPort, 'function', 'This example must not call a model.');
                return await requestPort(input, stage, context);
            } catch (error) { requestErrors.push(error); throw error; }
        },
        syncMesToSwipe(index) { const m = context.chat[index]; m.swipes[m.swipe_id] = m.mes; return true; },
        syncSwipeToMes(index, id) { const m = context.chat[index]; m.swipe_id = id; m.mes = m.swipes[id]; Object.assign(m, structuredClone(m.swipe_info[id])); return true; },
    });
    const f = {
        controller, context, graph, requests, stages, events, requestErrors, countTokens,
        get message() { return context.chat.at(-1); },
        memorySaves: () => memorySaves, chatSaves: () => chatSaves,
        setRequest(request) { requestPort = request; },
        setGraph(next) { currentGraph = bindFixtureRoles(next); f.graph = next; return next; },
        async pre(next = f.graph) { f.setGraph(next); return controller.beforeGenerate(context.chat, 8192, () => {}); },
        async post(next = f.graph) { f.setGraph(next); return controller.runPost(next); },
        append(text, isUser = false) { const m = completedMessage(text, context.chat.length, isUser); context.chat.push(m); return m; },
    };
    return f;
}
export async function readMemory(f, view = 'state', settings) {
    const adapter = createNativeMemoryAdapter({ context: () => f.context });
    const session = accepted(adapter.capture({ signal: new AbortController().signal, isCurrent: () => true })).data;
    try { return accepted(await (settings ? session.memory.recall(settings) : session.memory.read({ view }))); }
    finally { session.release(); }
}
export const currentMemory = async f => (await readMemory(f)).artifact.value;
// Seed a fixture through trusted native persistence, with refs captured from its
// supplied completed messages. This avoids a model that pretends a seed is evidence.
export async function seedMemory(f, makeChanges) {
    const adapter = createNativeMemoryAdapter({ context: () => f.context });
    const session = accepted(adapter.capture({ signal: new AbortController().signal, isCurrent: () => true })).data;
    try {
        const state = accepted(await session.memory.read({ view: 'state' })).artifact.value;
        const events = accepted(await session.memory.read({ view: 'events' })).artifact.value.payload.events;
        const proposed = accepted(makeRecord('state-proposal', state, proposal(makeChanges({ state, events })), sourceRefs(events))).data;
        const intent = accepted(makeRecord('commit-intent', proposed.value, { proposal: proposed.value, idempotencyKey: `example-fixture-seed-${state.store.version}` }, proposed.value.sourceRefs)).data;
        return accepted(await session.memory.commit(intent, { root: true })).data;
    } finally { session.release(); }
}
export function recordedArtifact(result, nodeId, portId = 'out', instancePath = []) {
    const recording = result.recording;
    const { strings, paths, addresses } = recording.identities;
    const decodePath = index => index === 0 ? [] : [...decodePath(paths[index][0]), strings[paths[index][1]]];
    const unit = recording.units.find(unit => {
        const [, path, node] = addresses[unit.address];
        return strings[node] === nodeId && JSON.stringify(decodePath(path)) === JSON.stringify(instancePath);
    });
    assert.ok(unit, `Missing recorded unit ${instancePath.join('/')}/${nodeId}`);
    const port = unit.ports.find(port => port.direction === 'output' && strings[port.port] === portId);
    assert.ok(port && port.artifact !== null, `Missing recorded ${nodeId}.${portId}`);
    const artifact = recording.artifacts[port.artifact];
    assert.equal(artifact.format, 'structured', `Artifact ${nodeId} must be completely inspectable`);
    return artifact.value;
}
export function verifyRun(f, result, expectedCalls) {
    if (!result.ok && f.requestErrors.length) throw f.requestErrors.at(-1);
    accepted(result);
    assert.equal(result.actualCalls, expectedCalls);
    assert.equal(result.recording.status, 'completed');
    return result;
}
export function assertPhaseCoverage(executed, first, last) {
    const expected = examplePhases.filter(entry => entry.number >= first && entry.number <= last).map(entry => entry.graphId).sort();
    assert.deepEqual([...executed].sort(), expected);
}

export class BrowserWorker {
    constructor(url) {
        this.worker = new ThreadWorker(new URL('../fixtures/text-rules-node-worker.mjs', import.meta.url), { workerData: { entryURL: url.href } });
        this.handlers = new Map();
    }
    addEventListener(type, callback) {
        const handler = type === 'message' ? data => { if (!data?.fixtureStarted) callback({ data }); } : error => callback({ error });
        this.handlers.set(callback, handler); this.worker.on(type, handler);
    }
    removeEventListener(type, callback) { this.worker.off(type, this.handlers.get(callback)); this.handlers.delete(callback); }
    postMessage(data) { this.worker.postMessage(data); }
    terminate() { return this.worker.terminate(); }
}
export async function withBrowserWorker(fn) {
    const previous = globalThis.Worker; globalThis.Worker = BrowserWorker;
    try { return await fn(); }
    finally { if (previous === undefined) delete globalThis.Worker; else globalThis.Worker = previous; }
}
