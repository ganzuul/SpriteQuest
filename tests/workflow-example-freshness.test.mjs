import test from 'node:test';
import assert from 'node:assert/strict';
import { installWorkflowExample } from '../src/workflow/examples.js';
import { graphBy } from './helpers/workflow-example-fixtures.mjs';
import { createNativeWorkflowController } from '../src/workflow/host.js';
import { createNativeMemoryAdapter } from '../src/workflow/introspection/host-memory.js';

const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const accepted = result => { assert.equal(result.ok, true, JSON.stringify(result.error)); return result; };
const guidance = context => Object.values(context.extensionPrompts).map(prompt => prompt.value).filter(Boolean).join('\n');
const hint = 'Rin may return to discuss the unresolved ferry inquiry. Leave Rowan free to respond.';

function fixture({ includeCharacter = true, selectActor } = {}) {
    const graph = graphBy('offscreen-agenda');
    graph.nodes['pre-scene'].includeCharacter = includeCharacter;
    const entered = deferred(), release = deferred();
    let requests = 0, saves = 0, supplied;
    const context = {
        chatId: 'example-freshness', characterId: 0, groupId: null,
        characters: [{ avatar: 'rin.png', data: { name: 'Rin', description: 'Rin wants to find the missing boat.', personality: 'Rin is patient.', scenario: 'Rin is at the ferry.' } }],
        chat: [{ mes: 'Rin left to ask the ferry keeper about the missing boat.', is_user: true, send_date: 1 }, { mes: 'Rowan waits on the landing.', is_user: false, swipe_id: 0, send_date: 2, gen_started: 2, gen_finished: 3 }],
        chatMetadata: { unrelated: { keep: true } }, extensionPrompts: {},
        setExtensionPrompt(key, value) { this.extensionPrompts[key] = { value }; },
        async saveMetadata() { saves++; return true; },
    };
    const controller = createNativeWorkflowController({ context: () => context, getGraph: () => graph, isEnabled: () => true, isBusy: () => false,
        ...(selectActor ? { selectIntrospectionActor: selectActor } : {}),
        countTokens: async text => ({ tokens: Math.ceil(text.length / 4), method: 'freshness-fixture' }),
        resolveBinding: () => ({ ok: true, data: { profileId: 'fixture', model: 'fixture' } }),
        request: async request => {
            requests++; supplied = JSON.parse(request.messages[1].content); entered.resolve(); await release.promise;
            return { ok: true, data: { text: JSON.stringify({ brief: 'The ferry inquiry remains unresolved.', attentionHints: [hint], recalledEpisodeIds: [] }), finish: 'stop' } };
        },
    });
    return { graph, controller, context, entered, release, supplied: () => supplied, requests: () => requests, saves: () => saves };
}

async function pendingSend(f, mutate) {
    const pending = f.controller.beforeGenerate(f.context.chat, 8192, () => {});
    await f.entered.promise;
    mutate(f);
    f.release.resolve();
    return pending;
}

for (const field of ['name', 'description', 'personality', 'scenario']) {
    test(`offscreen plan Send rejects a changed included character ${field} after Reflect starts`, async () => {
        const f = fixture();
        const result = await pendingSend(f, ({ context }) => { context.characters[0].data[field] = `Changed ${field}`; });
        assert.equal(result.ok, false);
        assert.equal(result.error.code, 'STALE_SOURCE');
        assert.equal(guidance(f.context), '');
        assert.equal(f.requests(), 1); assert.equal(f.saves(), 0);
    });
}

test('offscreen plan Send rejects an avatar actor change with unchanged numeric character and chat IDs', async () => {
    const f = fixture();
    const result = await pendingSend(f, ({ context }) => { context.characters[0].avatar = 'mira.png'; });
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'STALE_SOURCE');
    assert.equal(guidance(f.context), '');
    assert.equal(f.context.characterId, 0); assert.equal(f.context.chatId, 'example-freshness');
});

test('offscreen plan Send rechecks the trusted selected actor before publishing', async () => {
    let actor = 'character:rin.png';
    const f = fixture({ selectActor: () => actor });
    const result = await pendingSend(f, () => { actor = 'character:mira.png'; });
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'STALE_SOURCE');
    assert.equal(guidance(f.context), '');
    assert.equal(f.supplied().state.scope.actorId, 'character:rin.png');
});

test('offscreen plan Send publishes unchanged requested context and ignores unrelated card metadata', async () => {
    const f = fixture();
    const result = accepted(await pendingSend(f, ({ context }) => { context.characters[0].data.editorNotes = 'Unrelated editor metadata'; context.chatMetadata.unrelated.more = 'kept'; }));
    assert.equal(result.published, true);
    assert.equal(guidance(f.context), hint);
    assert.ok(f.supplied().context.messages.some(message => message.id === 'character:description' && message.text === 'Rin wants to find the missing boat.'));
    assert.equal(f.requests(), 1); assert.equal(f.saves(), 0);
});

test('offscreen plan Send accepts card text edits when Scene Context excludes character fields', async () => {
    const f = fixture({ includeCharacter: false });
    const result = accepted(await pendingSend(f, ({ context }) => { context.characters[0].data.description = 'Rin now seeks another boat.'; }));
    assert.equal(result.published, true);
    assert.equal(guidance(f.context), hint);
    assert.equal(f.supplied().context.messages.some(message => message.id.startsWith('character:')), false);
});

test('offscreen plan Send ignores edits to card fields omitted by the snapshot limit', async () => {
    const f = fixture();
    f.context.characters[0].data.scenario = 'x'.repeat(16001);
    accepted(await pendingSend(f, ({ context }) => { context.characters[0].data.scenario = 'y'.repeat(16001); }));
    assert.equal(guidance(f.context), hint);
    assert.equal(f.supplied().context.messages.some(message => message.id === 'character:scenario'), false);
});

test('offscreen plan Send rejects selected message edits while Reflect is pending', async () => {
    const f = fixture();
    const result = await pendingSend(f, ({ context }) => { context.chat[1].mes = 'Rin already returned.'; });
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'STALE_SOURCE');
    assert.equal(guidance(f.context), '');
});

async function promiseFixture({ countTokens } = {}) {
    const installed = accepted(installWorkflowExample('promise-callback', { graphs: {} })).data;
    const graph = installed.graph, post = installed.companions[0];
    let requests = 0, saves = 0;
    const ferry = 'Sol promised to meet Mira at the ferry before dawn.';
    const archive = 'Sol promised to return the archive key.';
    const context = {
        chatId: 'promise-freshness', characterId: 0, groupId: null, characters: [{ avatar: 'mira.png', name: 'Mira' }],
        chat: [ferry, archive].map((mes, index) => ({ mes, is_user: false, swipe_id: 0, send_date: index + 1, gen_started: index + 1, gen_finished: index + 2 })),
        chatMetadata: { unrelated: { keep: true } }, extensionPrompts: {},
        setExtensionPrompt(key, value) { this.extensionPrompts[key] = { value }; },
        async saveMetadata() { saves++; return true; },
    };
    const controller = createNativeWorkflowController({ context: () => context, getGraph: () => graph, isEnabled: () => true, isBusy: () => false,
        countTokens: countTokens ?? (async text => ({ tokens: Math.ceil(text.length / 4), method: 'freshness-fixture' })),
        resolveBinding: () => ({ ok: true, data: { profileId: 'fixture', model: 'fixture' } }),
        request: async request => {
            requests++;
            const supplied = JSON.parse(request.messages[1].content);
            return { ok: true, data: { finish: 'stop', text: JSON.stringify({ changes: supplied.events.map(event => ({ op: 'upsert', collection: 'episodes', item: {
                id: event.text === ferry ? 'ferry-promise' : 'archive-promise', text: event.text, classification: 'observation', sourceRefs: [{ id: event.id, revision: event.revision }],
            } })) }) } };
        },
    });
    const saved = accepted(await controller.runPost(post));
    assert.deepEqual(saved.memoryCommit, { applied: true, acknowledged: true, version: 1 });
    async function read(view = 'state') {
        const session = accepted(createNativeMemoryAdapter({ context: () => context }).capture()).data;
        try { return accepted(await session.memory.read({ view })); }
        finally { session.release(); }
    }
    return { graph, controller, context, ferry, archive, read, requests: () => requests, saves: () => saves };
}

test('promise callback publishes a genuinely captured supported ferry promise without another model call', async () => {
    const f = await promiseFixture();
    const result = accepted(await f.controller.beforeGenerate(f.context.chat, 8192, () => {}));
    assert.equal(result.published, true);
    assert.ok(guidance(f.context).includes(f.ferry));
    assert.equal(guidance(f.context).includes(f.archive), false);
    assert.equal(f.requests(), 1); assert.equal(f.saves(), 1);
});

test('promise callback refuses publication of a selected episode whose settled source was edited', async () => {
    const f = await promiseFixture(), stored = structuredClone(f.context.chatMetadata);
    f.context.chat[0].mes = 'Sol refused to meet Mira at the ferry before dawn.';
    const historical = await f.read();
    assert.ok(historical.reports.some(report => report.code === 'INVALIDATED_SOURCES'));
    assert.equal(historical.artifact.value.payload.episodes[0].text, f.ferry);
    const result = await f.controller.beforeGenerate(f.context.chat, 8192, () => {});
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'STALE_MEMORY_EVIDENCE');
    assert.equal(guidance(f.context), '');
    assert.deepEqual(f.context.chatMetadata, stored);
    assert.equal(f.requests(), 1); assert.equal(f.saves(), 1);
});

test('promise callback permits valid selected recall when an unrelated archive episode is stale', async () => {
    const f = await promiseFixture(), stored = structuredClone(f.context.chatMetadata);
    f.context.chat[1].mes = 'Sol refused to return the archive key.';
    assert.ok((await f.read()).reports.some(report => report.code === 'INVALIDATED_SOURCES'));
    accepted(await f.controller.beforeGenerate(f.context.chat, 8192, () => {}));
    assert.ok(guidance(f.context).includes(f.ferry));
    assert.equal(guidance(f.context).includes(f.archive), false);
    assert.deepEqual(f.context.chatMetadata, stored);
});

test('promise callback permits empty nonmatching recall despite stale stored history', async () => {
    const f = await promiseFixture();
    f.context.chat[0].mes = 'Sol refused to meet Mira at the ferry before dawn.';
    Object.values(f.graph.nodes).find(node => node.operation === 'memory').query = 'harbor';
    accepted(await f.controller.beforeGenerate(f.context.chat, 8192, () => {}));
    assert.match(guidance(f.context), /Actor episodes: \[\]/);
    assert.equal(guidance(f.context).includes(f.ferry), false);
});

function agePromiseSources(f) {
    for (let index = 0; index < 65; index++) f.context.chat.push({ mes: `Unrelated later exchange ${index}.`, is_user: true, send_date: index + 10 });
}

test('promise callback recalls unchanged history older than the 64-event model input window', async () => {
    const f = await promiseFixture(), stored = structuredClone(f.context.chatMetadata);
    agePromiseSources(f);
    const events = await f.read('events');
    assert.equal(events.artifact.value.payload.events.length, 64);
    assert.equal(events.artifact.value.payload.events.some(event => event.text === f.ferry), false);
    const result = accepted(await f.controller.beforeGenerate(f.context.chat, 8192, () => {}));
    assert.equal(result.published, true);
    assert.ok(guidance(f.context).includes(f.ferry));
    assert.equal((await f.read()).reports.some(report => report.code === 'INVALIDATED_SOURCES'), false);
    assert.deepEqual(f.context.chatMetadata, stored);
    assert.equal(f.requests(), 1); assert.equal(f.saves(), 1);
});

for (const [name, mutate] of [
    ['edited', f => { f.context.chat[0].mes = 'Sol refused to meet Mira at the ferry before dawn.'; }],
    ['deleted', f => { f.context.chat.splice(0, 1); }],
    ['reindexed', f => { const source = f.context.chat.shift(); f.context.chat.push(source); }],
    ['duplicated after an edit', f => { const duplicate = structuredClone(f.context.chat[0]); f.context.chat[0].mes = 'Sol refused.'; f.context.chat.push(duplicate); }],
    ['hidden from the actor', f => { f.context.chat[0].visibleTo = ['character:rin.png']; }],
]) {
    test(`promise callback rejects ${name} historical evidence outside the recent window`, async () => {
        const f = await promiseFixture(), stored = structuredClone(f.context.chatMetadata);
        agePromiseSources(f); mutate(f);
        const historical = await f.read();
        assert.ok(historical.reports.some(report => report.code === 'INVALIDATED_SOURCES'));
        const result = await f.controller.beforeGenerate(f.context.chat, 8192, () => {});
        assert.equal(result.ok, false);
        assert.equal(result.error.code, 'STALE_MEMORY_EVIDENCE');
        assert.equal(guidance(f.context), '');
        assert.deepEqual(f.context.chatMetadata, stored);
    });
}

async function duringPromiseGuidance(mutate, aged = true) {
    const entered = deferred(), release = deferred();
    const f = await promiseFixture({ countTokens: async text => {
        if (text.startsWith('Saved topic: ferry\nActor episodes:')) { entered.resolve(); await release.promise; }
        return { tokens: Math.ceil(text.length / 4), method: 'deferred-guidance-fixture' };
    } });
    if (aged) agePromiseSources(f);
    const pending = f.controller.beforeGenerate(f.context.chat, 8192, () => {});
    await entered.promise; mutate(f); release.resolve();
    return { f, result: await pending };
}

for (const aged of [false, true]) for (const [name, mutate] of [
    ['edit', f => { f.context.chat[0].mes = 'Sol refused to meet Mira at the ferry before dawn.'; }],
    ['deletion', f => { f.context.chat.splice(0, 1); }],
    ['visibility change', f => { f.context.chat[0].visibleTo = ['character:rin.png']; }],
]) {
    test(`promise callback rejects ${aged ? 'aged' : 'recent'} source ${name} while final Guidance token counting waits`, async () => {
        const { f, result } = await duringPromiseGuidance(mutate, aged);
        assert.equal(result.ok, false);
        assert.equal(result.error.code, 'STALE_SOURCE');
        assert.equal(guidance(f.context), '');
        assert.equal(f.requests(), 1); assert.equal(f.saves(), 1);
    });
}

test('promise callback publishes unchanged aged evidence after final Guidance token counting waits', async () => {
    const { f, result } = await duringPromiseGuidance(() => {});
    accepted(result);
    assert.equal(result.published, true);
    assert.ok(guidance(f.context).includes(f.ferry));
});

test('promise callback ignores an unrelated aged archive edit while final Guidance token counting waits', async () => {
    const { f, result } = await duringPromiseGuidance(f => { f.context.chat[1].mes = 'Sol refused to return the archive key.'; });
    accepted(result);
    assert.ok(guidance(f.context).includes(f.ferry));
});

test('promise callback clears installed guidance if selected aged evidence changes during publication', async () => {
    const f = await promiseFixture(); agePromiseSources(f);
    let changed = false;
    f.context.setExtensionPrompt = function (key, value) {
        this.extensionPrompts[key] = { value };
        if (value && !changed) { changed = true; this.chat[0].mes = 'Sol refused to meet Mira.'; }
    };
    const result = await f.controller.beforeGenerate(f.context.chat, 8192, () => {});
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'GUIDANCE_UNAVAILABLE');
    assert.equal(changed, true);
    assert.equal(guidance(f.context), '');
});

async function duringReflectIdentityGuidance(explicitState) {
    const f = await promiseFixture(); agePromiseSources(f);
    const graph = graphBy('offscreen-agenda');
    for (const [id, wire] of Object.entries(graph.wires)) if (wire.from === 'pre-episodes' || (!explicitState && wire.from === 'pre-state')) delete graph.wires[id];
    delete graph.nodes['pre-episodes']; if (!explicitState) delete graph.nodes['pre-state'];
    const entered = deferred(), release = deferred(), direction = 'Mira can keep the conversation open.';
    const controller = createNativeWorkflowController({ context: () => f.context, getGraph: () => graph, isEnabled: () => true, isBusy: () => false,
        countTokens: async text => { if (text === direction) { entered.resolve(); await release.promise; } return { tokens: Math.ceil(text.length / 4), method: 'deferred-guidance-fixture' }; },
        resolveBinding: () => ({ ok: true, data: { profileId: 'fixture', model: 'fixture' } }),
        request: async () => ({ ok: true, data: { finish: 'stop', text: JSON.stringify({ attentionHints: [direction], recalledEpisodeIds: [] }) } }),
    });
    // Native prompt projection supplies only the recent exchanges; the older archive is unused here.
    const pending = controller.beforeGenerate(f.context.chat.slice(-6), 8192, () => {});
    await entered.promise; f.context.chat[1].mes = 'Sol refused to return the archive key.'; release.resolve();
    return { f, result: await pending, direction };
}

test('Reflect scope/store fallback ignores unused old state evidence edited before publication', async () => {
    const { f, result, direction } = await duringReflectIdentityGuidance(false);
    accepted(result);
    assert.equal(guidance(f.context), direction);
});

test('Reflect with explicit State rejects old state evidence edited before publication', async () => {
    const { f, result } = await duringReflectIdentityGuidance(true);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'STALE_SOURCE');
    assert.equal(guidance(f.context), '');
});

test('promise callback keeps unchanged aged recall valid beside an edited aged archive episode', async () => {
    const f = await promiseFixture();
    agePromiseSources(f);
    f.context.chat[1].mes = 'Sol refused to return the archive key.';
    const historical = await f.read();
    const invalid = historical.reports.find(report => report.code === 'INVALIDATED_SOURCES');
    assert.deepEqual(invalid.sourceRefs.map(ref => ref.id), ['chat:1']);
    accepted(await f.controller.beforeGenerate(f.context.chat, 8192, () => {}));
    assert.ok(guidance(f.context).includes(f.ferry));
});

async function duringHistoricalDigest(f, mutate) {
    const original = globalThis.crypto.subtle.digest.bind(globalThis.crypto.subtle), entered = deferred(), release = deferred();
    let pause = true;
    globalThis.crypto.subtle.digest = async (...args) => {
        if (pause && new TextDecoder().decode(args[1]).includes(f.ferry)) { pause = false; entered.resolve(); await release.promise; }
        return original(...args);
    };
    try {
        const pending = f.controller.beforeGenerate(f.context.chat, 8192, () => {});
        await entered.promise; mutate(f); release.resolve();
        return await pending;
    } finally { globalThis.crypto.subtle.digest = original; release.resolve(); }
}

test('promise callback retains invalidation if an aged source changes during its historical digest', async () => {
    const f = await promiseFixture(); agePromiseSources(f);
    const result = await duringHistoricalDigest(f, f => { f.context.chat[0].mes = 'Sol refused to meet Mira.'; });
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'STALE_MEMORY_EVIDENCE');
    assert.equal(guidance(f.context), '');
});

for (const [name, mutate] of [
    ['actor change', f => { f.context.characters[0].avatar = 'rin.png'; }],
    ['chat replacement', f => { f.context.chat = structuredClone(f.context.chat); }],
    ['cancellation', f => { f.controller.cancel('Historical recall stopped'); }],
]) {
    test(`promise callback rechecks native authority after ${name} during a historical digest`, async () => {
        const f = await promiseFixture(); agePromiseSources(f);
        const result = await duringHistoricalDigest(f, mutate);
        assert.equal(result.ok, false);
        assert.equal(guidance(f.context), '');
        assert.equal(f.requests(), 1); assert.equal(f.saves(), 1);
    });
}
