import assert from 'node:assert/strict';
import test from 'node:test';
import { reflect, internalize, express } from '../src/workflow/introspection/analysis.js';
import { createActorState, makeRecord } from '../src/workflow/introspection/contracts.js';
import { requestModel, resolveBinding } from '../src/workflow/connections.js';

const scope = { chatId: 'completion-errors', actorId: 'mira' }, store = { id: 'fixture', version: 0 };
const ref = { id: 'apology', revision: 'settled-1' };
const operations = ['Reflect', 'Internalize', 'Express inner voice'];
const messages = {
    TRUNCATED_OUTPUT: 'The response reached its completion limit.',
    COMPLETION_UNVERIFIED: 'The response has no verified complete text result.',
    EMPTY_OUTPUT: 'The response is empty.',
    OUTPUT_LIMIT: 'The response exceeds the bounded output limit.',
    ABORTED: 'The operation was stopped; discard its late response.',
    REQUEST_FAILED: 'Analysis request returned no valid result; no retry was made.',
};

async function run(operation, request) {
    const state = createActorState(scope, store).data;
    const context = { kind: 'context', messages: [{ id: ref.id, revision: ref.revision, role: 'user', text: 'An apology was offered.' }] };
    const events = makeRecord('events', state.value, { events: [{ ...ref, text: 'An apology was offered.', settled: true }] }, [ref]).data;
    const assessment = makeRecord('reflection', state.value, { brief: 'An apology may ease the tension.' }, []).data;
    const before = JSON.stringify({ state, context, events, assessment });
    let requests = 0, writes = 0;
    const ports = { request: async input => { requests++; return request(input); }, memory: { commit: async () => { writes++; throw new Error('No memory write is allowed.'); } } };
    const result = operation === 'Reflect' ? await reflect(context, {}, { scope, store, ...ports })
        : operation === 'Internalize' ? await internalize(state, events, {}, ports)
            : await express(assessment, { mode: 'inner-voice' }, ports);
    assert.equal(requests, 1); assert.equal(writes, 0);
    assert.equal(JSON.stringify({ state, context, events, assessment }), before);
    assert.equal(result.ok, false);
    assert.equal(Object.hasOwn(result, 'artifact'), false);
    return result;
}

for (const operation of operations) for (const code of Object.keys(messages)) {
    test(`${operation} retains known failed completion ${code} with a fixed safe message`, async () => {
        const result = await run(operation, async () => ({ ok: false, error: { code, message: 'UNTRUSTED_PROVIDER_MESSAGE', finish: 'length', usage: { completion_tokens: 1024 } } }));
        assert.deepEqual(result.error, { code, message: messages[code] });
        assert.equal(JSON.stringify(result).includes('UNTRUSTED_PROVIDER_MESSAGE'), false);
    });
}

for (const operation of operations) {
    test(`${operation} preserves the actual requestModel truncation envelope without retrying`, async () => {
        let sends = 0;
        const profile = { id: 'fixed', api: 'custom', model: 'fixture', preset: 'sampler', 'api-url': 'https://fixture.invalid' };
        const context = {
            CONNECT_API_MAP: { custom: { selected: 'openai', source: 'custom' } },
            getPresetManager: () => ({ getCompletionPresetByName: () => ({ temperature: 0.2 }) }),
            ChatCompletionService: { presetToGeneratePayload: async () => ({}) },
            ConnectionManagerRequestService: { getProfile: () => profile, sendRequest: async () => {
                sends++; return { choices: [{ message: { content: 'Partial output' }, finish_reason: 'length' }], usage: { completion_tokens: 1024 } };
            } },
        };
        const binding = resolveBinding({ profileId: 'fixed', modelRole: 'Analysis' }, {}, context);
        assert.equal(binding.ok, true, JSON.stringify(binding.error));
        const result = await run(operation, request => requestModel({ ...request, binding: binding.data }, context));
        assert.deepEqual(result.error, { code: 'TRUNCATED_OUTPUT', message: messages.TRUNCATED_OUTPUT });
        assert.equal(sends, 1);
    });
}

for (const [name, response] of [
    ['unknown provider code', { ok: false, error: { code: 'PROVIDER_DOWN', message: 'UNTRUSTED_PROVIDER_MESSAGE' } }],
    ['non-string code', { ok: false, error: { code: ['TRUNCATED_OUTPUT'], message: 'UNTRUSTED_PROVIDER_MESSAGE' } }],
    ['missing error', { ok: false }],
    ['oversized failed response', { ok: false, error: { code: 'TRUNCATED_OUTPUT', message: 'x'.repeat(262145) } }],
    ['contradictory successful envelope', { ok: true, error: { code: 'TRUNCATED_OUTPUT' } }],
]) {
    test(`Reflect keeps ${name} a bounded generic request failure`, async () => {
        const result = await run('Reflect', async () => response);
        assert.deepEqual(result.error, { code: 'REQUEST_FAILED', message: messages.REQUEST_FAILED });
    });
}

test('Reflect does not evaluate failed completion code accessors', async () => {
    let reads = 0;
    const result = await run('Reflect', async () => ({ ok: false, error: { get code() { reads++; return 'TRUNCATED_OUTPUT'; } } }));
    assert.deepEqual(result.error, { code: 'REQUEST_FAILED', message: messages.REQUEST_FAILED });
    assert.equal(reads, 0);
});
