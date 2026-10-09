import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createActorState, makeRecord } from '../src/workflow/introspection/contracts.js';

const api = await import('../src/workflow/introspection/analysis.js').catch(() => ({}));
const scope = { chatId: 'chat-1', actorId: 'npc-1' };
const store = { id: 'store-1', version: 0 };
const ref = { id: 'event-1', revision: 'rev-1' };
const context = () => ({ kind: 'context', messages: [{ id: ref.id, revision: ref.revision, role: 'user', text: 'The player apologizes for the insult.' }] });
const reflection = () => ({ brief: 'Anger eases; trust remains guarded.', appraisals: ['The apology may be sincere.'], conflicts: [], recalls: [], sceneChanges: [], behaviorHints: ['Accept the apology cautiously.'], attentionHints: ['Watch for consistent conduct.'], recalledEpisodeIds: [] });
const response = payload => ({ ok: true, data: { text: JSON.stringify(payload), finish: 'stop' } });
const actorState = () => createActorState(scope, store).data;
const episode = { id: 'episode-1', text: 'The earlier insult damaged trust.', classification: 'observation', sourceRefs: [{ id: 'prior-event', revision: 'prior-rev' }] };
const episodes = () => makeRecord('episodes', actorState().value, { episodes: [episode] }, episode.sourceRefs).data;
const events = () => makeRecord('events', actorState().value, { events: [{ ...ref, text: 'The player apologizes for the insult.', settled: true }] }, [ref]).data;
const proposal = () => ({ changes: [{ op: 'upsert', collection: 'conditions', item: { id: 'anger', text: 'Immediate anger has eased.', classification: 'interpretation', sourceRefs: [{ ...ref }] } }], values: {}, curves: {}, tracks: {} });

test('Reflect produces scoped evidence-backed character assessment in one bounded Analysis request', async () => {
    assert.equal(typeof api.reflect, 'function');
    const requests = [];
    const result = await api.reflect(context(), {}, { scope, store, request: async request => { requests.push(request); return response(reflection()); } });
    assert.equal(result.ok, true);
    assert.equal(result.artifact.kind, 'data');
    assert.equal(result.artifact.value.recordType, 'reflection');
    assert.deepEqual(result.artifact.value.scope, scope);
    assert.deepEqual(result.artifact.value.sourceRefs, [ref]);
    assert.equal(result.artifact.value.payload.brief, 'Anger eases; trust remains guarded.');
    assert.equal(requests.length, 1);
    assert.equal(requests[0].maxTokens, 2048);
    assert.match(requests[0].messages[0].content, /private state/i);
    assert.ok(result.reports.some(report => report.modelRole === 'Analysis'));
});

test('invalid settings are rejected before an injected request can run', async () => {
    let calls = 0, accessed = false;
    const ports = { scope, store, request: async () => { calls++; return response(reflection()); } };
    for (const settings of [{ mode: 'unsupported' }, { maxTokens: 0 }, { maxTokens: 65537 }, { instructions: 'x'.repeat(4097) }, { get mode() { accessed = true; return 'character'; } }]) {
        const result = await api.reflect(context(), settings, ports);
        assert.equal(result.ok, false);
        assert.equal(result.error.code, 'INVALID_SETTINGS');
        assert.equal(Object.hasOwn(result, 'artifact'), false);
    }
    assert.equal(calls, 0);
    assert.equal(accessed, false);
});

test('incomplete or malformed model replies never return an authoritative assessment or retry', async () => {
    for (const [reply, code] of [
        [{ ok: true, data: { text: JSON.stringify(reflection()), finish: 'length' } }, 'TRUNCATED_OUTPUT'],
        [{ ok: true, data: { text: JSON.stringify(reflection()) } }, 'COMPLETION_UNVERIFIED'],
        [{ ok: true, data: { text: ' ', finish: 'stop' } }, 'EMPTY_OUTPUT'],
        [{ ok: true, data: { text: 'x'.repeat(262145), finish: 'stop' } }, 'OUTPUT_LIMIT'],
        [{ ok: true }, 'REQUEST_FAILED'],
        [{ ok: false, error: { code: 'PROVIDER_DOWN', message: 'unavailable' } }, 'REQUEST_FAILED'],
    ]) {
        let calls = 0;
        const result = await api.reflect(context(), {}, { scope, store, request: async () => { calls++; return reply; } });
        assert.equal(result.ok, false);
        assert.equal(result.error.code, code);
        assert.equal(Object.hasOwn(result, 'artifact'), false);
        assert.equal(calls, 1);
    }
});

test('unbounded or unsafe context is rejected before spending a request', async () => {
    let calls = 0, accessed = false;
    const contexts = [
        { kind: 'context', messages: Array.from({ length: 65 }, (_, n) => ({ id: `e-${n}`, revision: 'r', role: 'user', text: 'x' })) },
        { kind: 'context', messages: [{ id: 'x', revision: 'r', role: 'user', text: 'x'.repeat(4097) }] },
        { kind: 'context', messages: Array.from({ length: 9 }, (_, n) => ({ id: `e-${n}`, revision: 'r', role: 'user', text: 'x'.repeat(4000) })) },
        { kind: 'context', messages: [{ id: 'x', revision: '', role: 'user', text: 'x' }] },
        { kind: 'context', get messages() { accessed = true; return []; } },
        JSON.parse('{"kind":"context","messages":[],"constructor":{}}'),
    ];
    for (const input of contexts) {
        const result = await api.reflect(input, {}, { scope, store, request: async () => { calls++; return response(reflection()); } });
        assert.equal(result.ok, false);
        assert.equal(Object.hasOwn(result, 'artifact'), false);
    }
    assert.equal(calls, 0);
    assert.equal(accessed, false);
});

test('Reflect modes use distinct evidence instructions and state-derived scope with supplied recall episodes', async () => {
    const directives = { character: /beliefs.*goals/i, recall: /supplied episodes/i, scene: /scene.*changes/i };
    for (const mode of ['character', 'recall', 'scene']) {
        let request;
        const payload = reflection(); payload.recalls = ['The insult remains relevant.']; payload.recalledEpisodeIds = ['episode-1'];
        const result = await api.reflect(context(), { mode, instructions: 'Keep trust guarded.' }, { state: actorState(), episodes: episodes(), request: async value => { request = value; return response(payload); } });
        assert.equal(result.ok, true);
        assert.deepEqual(result.artifact.value.scope, scope);
        assert.deepEqual(result.artifact.value.sourceRefs, [ref, ...episode.sourceRefs]);
        assert.deepEqual(result.artifact.value.payload.recalledEpisodeIds, ['episode-1']);
        assert.match(request.messages[0].content, directives[mode]);
        assert.match(request.messages[0].content, /Keep trust guarded/);
        assert.ok(request.messages[1].content.includes(episode.text));
    }
});

test('Reflect rejects invented recall IDs and conflicting supplied source revisions', async () => {
    const payload = reflection(); payload.recalledEpisodeIds = ['invented'];
    const result = await api.reflect(context(), { mode: 'recall' }, { scope, store, request: async () => response(payload) });
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'UNKNOWN_EPISODE');
    let calls = 0;
    const conflicting = makeRecord('episodes', actorState().value, { episodes: [{ ...episode, sourceRefs: [{ ...ref, revision: 'changed' }] }] }, [{ ...ref, revision: 'changed' }]).data;
    const invalid = await api.reflect(context(), {}, { state: actorState(), episodes: conflicting, request: async () => { calls++; return response(reflection()); } });
    assert.equal(invalid.ok, false);
    assert.equal(invalid.error.code, 'INVALID_INTROSPECTION_EVIDENCE');
    assert.equal(calls, 0);
});

test('cancellation and source edits discard pending assessments', async () => {
    const cancelled = new AbortController(); cancelled.abort();
    let calls = 0;
    const early = await api.reflect(context(), {}, { scope, store, signal: cancelled.signal, request: async () => { calls++; return response(reflection()); } });
    assert.equal(early.ok, false);
    assert.equal(early.error.code, 'ABORTED');
    assert.equal(calls, 0);
    const late = new AbortController();
    const stopped = await api.reflect(context(), {}, { scope, store, signal: late.signal, request: async () => { late.abort(); return response(reflection()); } });
    assert.equal(stopped.ok, false);
    assert.equal(stopped.error.code, 'ABORTED');
    const edited = context();
    const stale = await api.reflect(edited, {}, { scope, store, request: async () => { edited.messages[0].revision = 'rev-2'; return response(reflection()); } });
    assert.equal(stale.ok, false);
    assert.equal(stale.error.code, 'STALE_INPUT');
    assert.equal(Object.hasOwn(stale, 'artifact'), false);
});

test('Internalize modes return pure proposals from settled events using distinct Analysis instructions', async () => {
    assert.equal(typeof api.internalize, 'function');
    const directives = { experience: /experience.*updates/i, pattern: /recurr.*interpretation/i, recovery: /recover.*temporary/i };
    for (const mode of ['experience', 'pattern', 'recovery']) {
        const state = actorState();
        let request, calls = 0;
        const result = await api.internalize(state, events(), { mode }, { request: async value => { calls++; request = value; return response(proposal()); } });
        assert.equal(result.ok, true);
        assert.equal(result.artifact.value.recordType, 'state-proposal');
        assert.equal(result.artifact.value.payload.changes[0].item.text, 'Immediate anger has eased.');
        assert.deepEqual(result.artifact.value.sourceRefs, [ref]);
        assert.deepEqual(state.value.payload.conditions, []);
        assert.match(request.messages[0].content, directives[mode]);
        assert.match(request.messages[0].content, /traits/i);
        assert.equal(calls, 1);
        assert.equal(request.maxTokens, 2048);
    }
});

test('Internalize requires current settled evidence for every proposed item', async () => {
    let calls = 0;
    const empty = makeRecord('events', actorState().value, { events: [] }, []).data;
    const missing = await api.internalize(actorState(), empty, {}, { request: async () => { calls++; return response(proposal()); } });
    assert.equal(missing.ok, false);
    assert.equal(calls, 0);
    for (const mutate of [
        value => { value.changes[0].item.sourceRefs = []; },
        value => { value.changes[0].item.sourceRefs[0].revision = 'stale'; },
        value => { value.changes[0].collection = 'traits'; },
    ]) {
        const payload = proposal(); mutate(payload);
        const result = await api.internalize(actorState(), events(), {}, { request: async () => response(payload) });
        assert.equal(result.ok, false);
        assert.equal(Object.hasOwn(result, 'artifact'), false);
    }
});

test('Express Behavior and Attention render the relevant hints without a model call', async () => {
    assert.equal(typeof api.express, 'function');
    const assessment = makeRecord('reflection', actorState().value, reflection(), [ref]).data;
    let calls = 0;
    for (const [mode, text] of [['behavior', 'Accept the apology cautiously.'], ['attention', 'Watch for consistent conduct.']]) {
        const result = await api.express(assessment, { mode }, { request: async () => { calls++; throw new Error('should not call'); } });
        assert.equal(result.ok, true);
        assert.deepEqual(result.artifact, { kind: 'guidance', text });
        assert.equal(result.reports[0].requests, 0);
    }
    assert.equal(calls, 0);
});

test('Express Inner Voice makes one bounded Prose request and labels fictional Text', async () => {
    const assessment = makeRecord('reflection', actorState().value, reflection(), [ref]).data;
    let calls = 0, request;
    const result = await api.express(assessment, { mode: 'inner-voice', maxTokens: 512 }, { request: async value => { calls++; request = value; return { ok: true, data: { text: 'I can forgive the words, but trust takes time.', finish: 'end_turn' } }; } });
    assert.equal(result.ok, true);
    assert.deepEqual(result.artifact, { kind: 'text', text: 'I can forgive the words, but trust takes time.', fictional: true });
    assert.equal(calls, 1);
    assert.equal(request.maxTokens, 512);
    assert.match(request.messages[0].content, /fictional/i);
    assert.match(request.messages[0].content, /player.*agency/i);
    assert.equal(result.reports[0].modelRole, 'Prose');
});

test('Express returns no empty or oversized text even when individual input hints are bounded', async () => {
    const oversized = reflection(); oversized.behaviorHints = ['a'.repeat(3000), 'b'.repeat(3000)];
    const empty = reflection(); empty.attentionHints = [];
    for (const [payload, mode, reply, code] of [
        [oversized, 'behavior', null, 'OUTPUT_LIMIT'],
        [empty, 'attention', null, 'EMPTY_OUTPUT'],
        [reflection(), 'inner-voice', { ok: true, data: { text: 'x'.repeat(4097), finish: 'stop' } }, 'OUTPUT_LIMIT'],
    ]) {
        const assessment = makeRecord('reflection', actorState().value, payload, [ref]).data;
        const result = await api.express(assessment, { mode }, { request: async () => reply });
        assert.equal(result.ok, false);
        assert.equal(result.error.code, code);
        assert.equal(Object.hasOwn(result, 'artifact'), false);
    }
});

test('engines reject inherited or accessor ports without executing untrusted fields', async () => {
    let accessed = false, calls = 0;
    const bad = { scope, store, get state() { accessed = true; return actorState(); }, request: async () => { calls++; return response(reflection()); } };
    const reflected = await api.reflect(context(), {}, bad);
    assert.equal(reflected.ok, false);
    assert.equal(reflected.error.code, 'INVALID_PORTS');
    assert.equal(accessed, false);
    const inherited = Object.assign(Object.create({ request: async () => { calls++; return response(proposal()); } }), {});
    const internalized = await api.internalize(actorState(), events(), {}, inherited);
    assert.equal(internalized.ok, false);
    assert.equal(internalized.error.code, 'INVALID_PORTS');
    const expressed = await api.express(makeRecord('reflection', actorState().value, reflection(), [ref]).data, {}, bad);
    assert.equal(expressed.ok, false);
    assert.equal(expressed.error.code, 'INVALID_PORTS');
    assert.equal(calls, 0);
});

test('Express checks supplied provenance and actor identity before using an assessment', async () => {
    const assessment = makeRecord('reflection', actorState().value, reflection(), [ref]).data;
    let calls = 0;
    const changedContext = context(); changedContext.messages[0].revision = 'changed';
    const wrongState = createActorState({ ...scope, actorId: 'other' }, store).data;
    for (const extra of [{ context: changedContext }, { state: wrongState }]) {
        const result = await api.express(assessment, { mode: 'inner-voice' }, { ...extra, request: async () => { calls++; return { ok: true, data: { text: 'prose', finish: 'stop' } }; } });
        assert.equal(result.ok, false);
        assert.equal(Object.hasOwn(result, 'artifact'), false);
    }
    assert.equal(calls, 0);
    const valid = await api.express(assessment, {}, { context: context() });
    assert.equal(valid.ok, true);
});

test('structured requests state their payload schema and evidence limits explicitly', async () => {
    let reflectionRequest, proposalRequest;
    await api.reflect(context(), {}, { scope, store, request: async value => { reflectionRequest = value; return response(reflection()); } });
    await api.internalize(actorState(), events(), {}, { request: async value => { proposalRequest = value; return response(proposal()); } });
    for (const key of ['brief', 'appraisals', 'conflicts', 'recalls', 'sceneChanges', 'behaviorHints', 'attentionHints', 'recalledEpisodeIds']) assert.ok(reflectionRequest.messages[0].content.includes(key));
    for (const key of ['changes', 'values', 'curves', 'tracks', 'classification', 'sourceRefs']) assert.ok(proposalRequest.messages[0].content.includes(key));
    assert.match(proposalRequest.messages[0].content, /32/);
    assert.match(reflectionRequest.messages[0].content, /4096/);
});

test('explicit Context scope cannot cross chat or actor boundaries', async () => {
    let calls = 0;
    const input = context(); input.source = { chatId: 'other-chat', actorId: scope.actorId };
    const reflected = await api.reflect(input, {}, { state: actorState(), request: async () => { calls++; return response(reflection()); } });
    assert.equal(reflected.ok, false);
    assert.equal(reflected.error.code, 'SCOPE_MISMATCH');
    const actorInput = context(); actorInput.scope = { chatId: scope.chatId, actorId: 'other-actor' };
    const assessment = makeRecord('reflection', actorState().value, reflection(), [ref]).data;
    const expressed = await api.express(assessment, { mode: 'inner-voice' }, { context: actorInput, request: async () => { calls++; return { ok: true, data: { text: 'voice', finish: 'stop' } }; } });
    assert.equal(expressed.ok, false);
    assert.equal(expressed.error.code, 'SCOPE_MISMATCH');
    assert.equal(calls, 0);
});

test('Express validates scoped settled-event provenance including stale revisions', async () => {
    const assessment = makeRecord('reflection', actorState().value, reflection(), [ref]).data;
    const changed = structuredClone(events());
    changed.value.payload.events[0].revision = 'changed';
    changed.value.sourceRefs[0].revision = 'changed';
    const invalid = await api.express(assessment, {}, { events: changed });
    assert.equal(invalid.ok, false);
    assert.equal(invalid.error.code, 'INVALID_INTROSPECTION_EVIDENCE');
    const valid = await api.express(assessment, {}, { events: events() });
    assert.equal(valid.ok, true);
    const mutable = structuredClone(events());
    const late = await api.express(assessment, { mode: 'inner-voice' }, { events: mutable, request: async () => { mutable.value.store.version++; return { ok: true, data: { text: 'voice', finish: 'stop' } }; } });
    assert.equal(late.ok, false);
    assert.equal(late.error.code, 'STALE_INPUT');
});

test('hostile response objects return failures instead of rejecting the operation promise', async () => {
    const hostile = new Proxy({}, { getOwnPropertyDescriptor() { throw new Error('hostile descriptor'); } });
    const result = await api.reflect(context(), {}, { scope, store, request: async () => hostile });
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'REQUEST_FAILED');
    assert.equal(Object.hasOwn(result, 'artifact'), false);
});
