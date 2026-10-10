import test from 'node:test';
import assert from 'node:assert/strict';
import { Worker as ThreadWorker } from 'node:worker_threads';
import { listWorkflowExamples } from '../src/workflow/examples.js';
import { createNativeWorkflowController } from '../src/workflow/host.js';
import { createNativeMemoryAdapter } from '../src/workflow/introspection/host-memory.js';

class BrowserWorker {
    constructor(url) {
        this.worker = new ThreadWorker(new URL('./fixtures/text-rules-node-worker.mjs', import.meta.url), { workerData: { entryURL: url.href } });
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
const graphFor = id => listWorkflowExamples().find(entry => entry.id === id).graph;
function fixture(graph, text = 'Mira waits at the closed ferry gate.', request) {
    let requests = 0, memorySaves = 0;
    const message = { mes: text, is_user: false, swipe_id: 0, swipes: [text], swipe_info: [{ extra: {}, gen_started: 1, gen_finished: 2 }], extra: {}, gen_started: 1, gen_finished: 2 };
    const context = { chatId: 'example-acceptance', characterId: 0, characters: [{ avatar: 'mira.png', name: 'Mira' }], groupId: null, chatMetadata: {}, chat: [{ mes: 'At the ferry gate, Mira holds an unopened letter.', is_user: true, send_date: 0 }, message], extensionPrompts: {}, setExtensionPrompt(key, value) { this.extensionPrompts[key] = { value }; }, saveChat: async () => {}, saveMetadata: async () => { memorySaves++; return true; }, updateMessageBlock: async () => {}, swipe: { refresh: async () => {} } };
    const controller = createNativeWorkflowController({ context: () => context, getGraph: () => graph, isEnabled: () => true, isBusy: () => false,
        countTokens: async value => ({ tokens: Math.ceil(value.length / 4), method: 'example-fixture' }),
        resolveBinding: () => ({ ok: true, data: { profileId: 'fixture', model: 'fixture' } }),
        request: async input => { requests++; if (!request) throw new Error('This example must not call a model.'); return request(input); },
        syncMesToSwipe(index) { const m = context.chat[index]; m.swipes[m.swipe_id] = m.mes; return true; },
        syncSwipeToMes(index, id) { const m = context.chat[index]; m.swipe_id = id; m.mes = m.swipes[id]; Object.assign(m, structuredClone(m.swipe_info[id])); return true; },
    });
    return { controller, context, message, requests: () => requests, memorySaves: () => memorySaves };
}
const accepted = result => { assert.equal(result.ok, true, JSON.stringify(result.error)); return result; };
const guidance = context => Object.values(context.extensionPrompts).map(prompt => prompt.value).filter(Boolean).join('\n');

test('scene brief publishes its authored guidance through native Send without a model or memory write', async () => {
    const graph = graphFor('scene-brief-basics'), f = fixture(graph);
    const result = accepted(await f.controller.beforeGenerate(f.context.chat, 8192, () => {}));
    assert.equal(result.actualCalls, 0);
    assert.equal(guidance(f.context), 'At the closed ferry gate, Mira can explain the delay or offer shelter. Keep the unopened letter sealed. End with a question or NPC action that leaves the player free to answer; do not supply the player’s decision.');
    assert.equal(f.message.mes, 'Mira waits at the closed ferry gate.');
    assert.equal(f.requests(), 0); assert.equal(f.memorySaves(), 0);
});

test('JSON brief decodes, selects, and renders the configured scene fields without a model', async () => {
    const graph = graphFor('structured-brief-basics'), f = fixture(graph);
    accepted(await f.controller.beforeGenerate(f.context.chat, 8192, () => {}));
    assert.equal(guidance(f.context), 'At the ferry gate, preserve the obstacle: closed for inspection. Mira may respond. Leave the player free to wait or ask Mira about the delay.');
    assert.equal(f.requests(), 0); assert.equal(f.memorySaves(), 0);
});

test('literal phrase example proposes its exact replacement and changes the reply only after Apply', async () => {
    const priorWorker = globalThis.Worker; globalThis.Worker = BrowserWorker;
    try {
        const graph = graphFor('configured-phrase-repair');
        const original = 'He let out a breath he didn\'t know he was holding, then opened the letter. "No more delays," Mira said.';
        const f = fixture(graph, original);
        const result = accepted(await f.controller.runPost(graph));
        assert.equal(result.actualCalls, 0); assert.equal(f.requests(), 0);
        assert.equal(f.message.mes, original);
        assert.equal(result.reviewHandles.length, 1);
        accepted(await f.controller.apply(result.reviewHandles[0]));
        assert.equal(f.message.mes, 'He exhaled, then opened the letter. "No more delays," Mira said.');
        assert.equal(f.message.swipes[0], original);
        assert.equal(f.memorySaves(), 0);
    } finally { if (priorWorker === undefined) delete globalThis.Worker; else globalThis.Worker = priorWorker; }
});

test('glossary example changes configured terms while preserving its protected painting title', async () => {
    const graph = graphFor('canonical-terminology');
    const original = 'The envoy returned to Greyhaven carrying a sun stone. The painting Greyhaven at Dusk hung by the door.';
    const f = fixture(graph, original);
    const result = accepted(await f.controller.runPost(graph));
    assert.equal(result.actualCalls, 0); assert.equal(f.requests(), 0);
    assert.equal(f.message.mes, original);
    accepted(await f.controller.apply(result.reviewHandles[0]));
    assert.equal(f.message.mes, 'The envoy returned to Grayhaven carrying a sunstone. The painting Greyhaven at Dusk hung by the door.');
    assert.equal(f.memorySaves(), 0);
});

test('shorter-reply example makes one bounded Prose request and leaves application to review', async () => {
    const graph = graphFor('concise-recast');
    const original = 'After taking a moment to look at the door, she reached out her hand and slowly turned the handle. She waited for the latch to click.';
    const candidate = 'She looked at the door, slowly turned the handle, and waited for the latch to click.';
    const f = fixture(graph, original, async request => {
        assert.equal(request.maxTokens, 8192);
        const supplied = JSON.parse(request.messages[1].content);
        assert.equal(supplied.original, original);
        assert.ok(supplied.reference);
        return { ok: true, data: { text: candidate, finish: 'stop' } };
    });
    const result = accepted(await f.controller.runPost(graph));
    assert.equal(result.actualCalls, 1); assert.equal(f.requests(), 1);
    assert.equal(f.message.mes, original);
    accepted(await f.controller.apply(result.reviewHandles[0]));
    assert.equal(f.message.mes, candidate);
    assert.equal(f.memorySaves(), 0);
});

test('promise recall handles an empty actor history without fabricating a remembered promise or writing memory', async () => {
    const graph = graphFor('promise-callback'), f = fixture(graph);
    accepted(await f.controller.beforeGenerate(f.context.chat, 8192, () => {}));
    assert.match(guidance(f.context), /Saved topic: ferry\nActor episodes: \[\]/);
    assert.equal(f.requests(), 0); assert.equal(f.memorySaves(), 0);
    assert.deepEqual(f.context.chatMetadata, {});
});

test('settled-message counter tracks new public messages without counting a repeated run twice', async () => {
    const graph = graphFor('consequence-clock'), f = fixture(graph);
    async function currentCount() {
        const adapter = createNativeMemoryAdapter({ context: () => f.context });
        const session = accepted(adapter.capture({ signal: new AbortController().signal, isCurrent: () => true })).data;
        try {
            const state = accepted(await session.memory.read({ view: 'state' }));
            return state.artifact.value.payload.tracks['harbor-pressure'].count;
        } finally { session.release(); }
    }
    const first = accepted(await f.controller.runPost(graph));
    assert.equal(first.actualCalls, 0);
    assert.equal(first.memoryCommit.applied, true);
    assert.equal(await currentCount(), 2);
    accepted(await f.controller.runPost(graph));
    assert.equal(await currentCount(), 2);
    f.context.chat.push({ mes: 'I ask Mira about the gate.', is_user: true, send_date: 3 });
    accepted(await f.controller.runPost(graph));
    assert.equal(await currentCount(), 3);
    assert.equal(f.requests(), 0);
});
