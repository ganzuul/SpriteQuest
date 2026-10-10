import test from 'node:test';
import assert from 'node:assert/strict';
import { createNativeMemoryAdapter } from '../src/workflow/introspection/host-memory.js';
import {
    graphBy, createExampleFixture, seedMemory, sourceRefs, upsert, guidance, response, reflection,
} from './helpers/consumed-memory-fixtures.mjs';

const promise = 'Sol promised to bring the ferry before dawn.';

async function implicitStateFixture() {
    const graph = graphBy(21, 'pre');
    const reader = Object.values(graph.nodes).find(node => node.operation === 'memory');
    reader.operation = 'state';
    reader.mode = 'value';
    for (const field of ['view', 'query', 'limit']) delete reader[field];
    const fixture = createExampleFixture(graph, { chat: [promise, 'Mira waits at the gate.'] });
    await seedMemory(fixture, ({ events }) => [upsert('episodes', 'ferry-promise', events[0].text, sourceRefs([events[0]]))]);
    return fixture;
}

test('implicit State Value inspection retains invalidated consumed evidence and native reads report its stale source', async () => {
    const fixture = await implicitStateFixture();
    fixture.context.chat[0].mes = 'Sol refused to bring the ferry before dawn.';
    const metadata = structuredClone(fixture.context.chatMetadata);
    const saves = fixture.memorySaves();

    const result = await fixture.controller.runTarget(fixture.graph,{workflowId:fixture.graph.id,instancePath:[],nodeId:'pre-recall',portId:'out'});

    assert.equal(result.ok,true,JSON.stringify(result.error));
    assert.deepEqual(result.reviewHandles,[]);
    const adapter=createNativeMemoryAdapter({context:()=>fixture.context}),captured=adapter.capture({signal:new AbortController().signal,isCurrent:()=>true});
    assert.equal(captured.ok,true);
    try{const read=await captured.data.memory.read({view:'state'});assert.equal(read.ok,true);assert.ok(read.reports.some(report=>report.code==='INVALIDATED_SOURCES'&&report.sourceRefs.length));}finally{captured.data.release();}
    assert.equal(guidance(fixture.context), '');
    assert.deepEqual(fixture.context.chatMetadata, metadata);
    assert.equal(fixture.memorySaves(), saves);
    assert.equal(fixture.requests.length, 0);
});

test('implicit State Value target records unchanged supported memory without publication', async () => {
    const fixture = await implicitStateFixture();
    const metadata = structuredClone(fixture.context.chatMetadata);
    const saves = fixture.memorySaves();

    const result = await fixture.controller.runTarget(fixture.graph,{workflowId:fixture.graph.id,instancePath:[],nodeId:'pre-recall',portId:'out'});

    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.deepEqual(result.reviewHandles, []);
    assert.equal(guidance(fixture.context),'');
    assert.ok(result.recording.artifacts.some(artifact=>JSON.stringify(artifact.value).includes(promise)));
    assert.deepEqual(fixture.context.chatMetadata, metadata);
    assert.equal(fixture.memorySaves(), saves);
    assert.equal(fixture.requests.length, 0);
});

function identityReflectGraph() {
    const graph = graphBy(18);
    delete graph.nodes['pre-state'];
    for (const [id, wire] of Object.entries(graph.wires)) if (wire.from === 'pre-state') delete graph.wires[id];
    return graph;
}

test('Reflect identity-only lookup does not consume unrelated invalidated stored history', async () => {
    const hint = 'Possibility: wait for the player.';
    const fixture = createExampleFixture(identityReflectGraph(), {
        chat: [promise, 'Mira waits at the gate.'],
        request: async input => {
            const supplied = JSON.parse(input.messages[1].content);
            assert.deepEqual(supplied.state.payload.episodes, []);
            assert.deepEqual(supplied.episodes, []);
            assert.deepEqual(supplied.state.scope, { chatId: 'example-acceptance', actorId: 'character:mira.png' });
            assert.deepEqual(supplied.state.store, { id: 'native-chat', version: 1 });
            return response(reflection({ behaviorHints: [hint] }));
        },
    });
    await seedMemory(fixture, ({ events }) => [upsert('episodes', 'unused-promise', events[0].text, sourceRefs([events[0]]))]);
    fixture.context.chat[0].mes = 'Sol refused to bring the ferry before dawn.';
    const metadata = structuredClone(fixture.context.chatMetadata);
    const saves = fixture.memorySaves();

    const result = await fixture.reflectIdentity();

    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.deepEqual(result.artifact.value.payload.behaviorHints,[hint]);
    assert.equal(guidance(fixture.context), '');
    assert.deepEqual(fixture.context.chatMetadata, metadata);
    assert.equal(fixture.memorySaves(), saves);
    assert.equal(fixture.requests.length, 1);
});

test('Reflect identity-only target lookup ignores an omitted history edit during execution', async () => {
    const archived = 'Unused archived exchange.';
    const edited = 'Edited unused archived exchange.';
    const hint = 'Possibility: wait for the player.';
    const fixture = createExampleFixture(identityReflectGraph(), {
        chat: [archived, 'Mira waits at the gate.'],
        request: async input => {
            const supplied = JSON.parse(input.messages[1].content);
            assert.deepEqual(supplied.state.payload.episodes, []);
            assert.deepEqual(supplied.episodes, []);
            assert.equal(input.messages[1].content.includes(archived), false);
            fixture.context.chat[0].mes = edited;
            return response(reflection({ behaviorHints: [hint] }));
        },
    });
    const original = globalThis.crypto.subtle.digest.bind(globalThis.crypto.subtle);
    globalThis.crypto.subtle.digest = async (...args) => {
        // Reproduce a native edit during any unnecessary capture of this omitted source.
        if (new TextDecoder().decode(args[1]).includes(archived)) fixture.context.chat[0].mes = edited;
        return original(...args);
    };
    try {
        const result = await fixture.reflectIdentity();

        assert.equal(result.ok, true, JSON.stringify(result.error));
        assert.deepEqual(result.artifact.value.payload.behaviorHints,[hint]);
        assert.equal(guidance(fixture.context), '');
        assert.equal(fixture.context.chat[0].mes, edited);
        assert.equal(fixture.requests.length, 1);
        assert.equal(fixture.memorySaves(), 0);
    } finally { globalThis.crypto.subtle.digest = original; }
});

for (const [name, mutate] of [
    ['malformed payload', stored => { stored.state.value.payload.episodes = 'corrupt'; }],
    ['wrong chat scope', stored => { stored.state.value.scope.chatId = 'another-chat'; }],
    ['wrong store identity', stored => { stored.state.value.store.id = 'another-store'; }],
    ['malformed receipts', stored => { stored.receipts = [{ key: 'bad', fingerprint: 'bad', version: 99 }]; }],
]) {
    test(`Reflect identity-only lookup rejects ${name} without a model call`, async () => {
        const fixture = createExampleFixture(identityReflectGraph(), { chat: [promise, 'Mira waits at the gate.'] });
        await seedMemory(fixture, ({ events }) => [upsert('episodes', 'unused-promise', events[0].text, sourceRefs([events[0]]))]);
        mutate(fixture.context.chatMetadata.latticeIntrospection['native-chat']['character:mira.png']);
        const metadata = structuredClone(fixture.context.chatMetadata);
        const saves = fixture.memorySaves();

        const result = await fixture.reflectIdentity();

        assert.equal(result.ok, false);
        assert.equal(guidance(fixture.context), '');
        assert.deepEqual(fixture.context.chatMetadata, metadata);
        assert.equal(fixture.memorySaves(), saves);
        assert.equal(fixture.requests.length, 0);
    });
}

for (const [name, mutate, code] of [
    ['chat replacement', ({ fixture }) => { fixture.context.chat = structuredClone(fixture.context.chat); }, 'STALE_SOURCE'],
    ['actor change', ({ fixture }) => { fixture.context.characters[0].avatar = 'sol.png'; }, 'SCOPE_MISMATCH'],
    ['cancellation', ({ controller }) => { controller.abort(); }, 'CANCELLED'],
    ['workflow change', authority => { authority.current = false; }, 'STALE_SOURCE'],
]) {
    test(`identity lookup rejects ${name} during its stored snapshot load`, async () => {
        const fixture = createExampleFixture(identityReflectGraph());
        const authority = { fixture, controller: new AbortController(), current: true };
        const adapter = createNativeMemoryAdapter({ context: () => fixture.context });
        const captured = adapter.capture({ signal: authority.controller.signal, isCurrent: () => authority.current });
        assert.equal(captured.ok, true);

        const pending = captured.data.readIdentity();
        mutate(authority);
        const result = await pending;

        assert.equal(result.ok, false);
        assert.equal(result.error.code, code);
        assert.equal(fixture.memorySaves(), 0);
    });
}
