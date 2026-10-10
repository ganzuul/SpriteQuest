import test from 'node:test';
import assert from 'node:assert/strict';
import { graphBy, examplePhases, currentMemory, readMemory } from './helpers/workflow-example-fixtures.mjs';
import { liveCaseSpec } from '../tools/roleplay-soak-cases.mjs';
const api = await import('../tools/soak-roleplay-examples.mjs').catch(() => ({}));

test('live sweep requires explicit account/profile/live options before opening a local session', async () => {
    assert.equal(typeof api.parseSoakArgs, 'function');
    const options = api.parseSoakArgs(['--account', 'lattice-examples-soak-test', '--profile-id', 'approved-profile']);
    let sessions = 0;
    const result = await api.runSoakSweep(options, { openSession: async () => { sessions++; throw Error('Must remain offline'); } });
    assert.equal(result.ok, true);
    assert.equal(result.data.status, 'disabled');
    assert.equal(sessions, 0);
    for (const args of [['--live'], ['--account', 'default-user', '--profile-id', 'approved-profile', '--live'], ['--account', 'lattice-examples-soak-test', '--profile-id', 'approved-profile', '--max-requests', '81']]) assert.throws(() => api.parseSoakArgs(args));
});

test('explicit 80-request admission preserves cumulative history while the default ceiling stays 64', async () => {
    const args = ['--live', '--account', 'lattice-examples-soak-test', '--profile-id', 'approved-profile'];
    assert.equal(api.parseSoakArgs(args).maxRequests, 64);
    const options = api.parseSoakArgs([...args, '--max-requests', '80', '--prior-attempts', '1']);
    assert.equal(options.maxRequests, 80);
    const data = { maxRequests: 64, externalPriorAttempts: 1, requests: Array.from({ length: 78 }, (_, index) => ({ attempt: index + 2, outcome: 'complete' })), phases: [{ graphId: graphBy(5).id, revision: 'baseline', status: 'failed' }] };
    const originalRequests = structuredClone(data.requests), originalPhases = structuredClone(data.phases), checkpoints = [];
    const ledger = api.createSoakLedger(data, { maxRequests: options.maxRequests, checkpoint: async value => checkpoints.push(structuredClone(value)) });
    assert.equal(data.maxRequests, 80);
    assert.equal(ledger.remaining(), 1);
    const input = { binding: { model: 'z-ai/glm-5.2:thinking' }, maxTokens: 2048, messages: [{ role: 'user', content: 'Explicitly approved synthetic revalidation.' }] };
    const stage = { node: { operation: 'response-plan', maxTokens: 2048 }, address: { workflowId: graphBy(5).id, instancePath: [], nodeId: 'pre-plan' } };
    let calls = 0;
    await ledger.request(input, stage, { number: 5, phase: 'pre', revision: 'grounding-v4' }, async () => { calls++; return { ok: true, data: { text: 'Optional grounded direction.', finish: 'stop' } }; });
    assert.deepEqual(data.requests.slice(0, -1), originalRequests);
    assert.deepEqual(data.phases, originalPhases);
    assert.equal(data.externalPriorAttempts, 1);
    assert.equal(data.requests.at(-1).attempt, 80);
    assert.equal(checkpoints[0].maxRequests, 80);
    await assert.rejects(() => ledger.request(input, stage, { number: 5, phase: 'pre' }, async () => { calls++; }));
    assert.equal(calls, 1);
    assert.equal(ledger.remaining(), 0);
    const defaultLedger = api.createSoakLedger({ maxRequests: 80, requests: Array.from({ length: 63 }, () => ({})), externalPriorAttempts: 1 }, { checkpoint: async () => {} });
    assert.equal(defaultLedger.remaining(), 0, 'a previous extension does not implicitly raise the invocation default');
    assert.throws(() => api.createSoakLedger({}, { maxRequests: 81, checkpoint: async () => {} }));
});

test('ledger checkpoints a reservation before transport and counts the 64th failed request without retry', async () => {
    assert.equal(typeof api.createSoakLedger, 'function');
    const checkpoints = [], prior = { requests: Array.from({ length: 63 }, (_, index) => ({ attempt: index + 1, outcome: 'complete' })) };
    const guard = api.createSoakLedger(prior, { maxRequests: 64, checkpoint: async value => checkpoints.push(structuredClone(value)) });
    let attempts = 0;
    const input = { binding: { model: 'z-ai/glm-5.2:thinking' }, maxTokens: 512, messages: [{ role: 'user', content: 'Synthetic letter fixture.' }] };
    const stage = { node: { id: 'plan', maxTokens: 512 }, address: { workflowId: 'fixture', instancePath: [], nodeId: 'plan' } };
    const result = await guard.request(input, stage, { number: 5, phase: 'pre' }, async () => {
        attempts++;
        assert.equal(checkpoints.at(-1).requests.at(-1).outcome, 'reserved');
        return { ok: false, error: { code: 'REQUEST_FAILED' } };
    });
    assert.equal(result.ok, false);
    assert.equal(guard.data.requests.length, 64);
    assert.equal(guard.data.requests.at(-1).outcome, 'failed');
    await assert.rejects(() => guard.request(input, stage, { number: 5, phase: 'pre' }, async () => { attempts++; }));
    assert.equal(attempts, 1);
    assert.equal(checkpoints.at(-1).requests.at(-1).outcome, 'failed');
});

test('native fixture replaces fake role overrides and uses production connection requests with authored caps', async () => {
    assert.equal(typeof api.createLiveFixture, 'function');
    const profile = { id: 'approved-profile', name: 'Approved fixture connection', api: 'nanogpt', model: 'z-ai/glm-5.2:thinking', preset: 'Wandlight-1.8', 'secret-id': 'opaque-selected-id' };
    const preset = { temperature: 0.72, frequency_penalty: 0.1, presence_penalty: 0.2, top_p: 0.92, seed: 17, show_thoughts: true, reasoning_effort: 'high', nanogpt_provider: 'fixture-route', nanogpt_payg_override: false };
    let sent;
    const graph = graphBy(29), f = api.createLiveFixture(graph, { character: { description: 'Mira promised to keep the letter sealed.' } }, {
        profile, preset, settings: { oai_settings: {} },
        send: async payload => { sent = payload; return { choices: [{ message: { content: JSON.stringify({ brief: 'Observation: letter sealed.', behaviorHints: ['Possibility: Mira asks permission.'] }) }, finish_reason: 'stop' }], usage: { total_tokens: 80 } }; },
        request: async (input, stage, context, execute) => { assert.equal(input.maxTokens, stage.node.maxTokens); return execute(); },
    });
    assert.equal(f.graph.roles.Analysis.profileId, profile.id);
    assert.equal(f.graph.nodes.reaction.roleOverrides.Analysis.profileId, profile.id);
    const result = await f.controller.beforeGenerate(f.context.chat, 8192, () => {});
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.equal(result.actualCalls, 1);
    assert.equal(sent.model, profile.model);
    assert.equal(sent.secret_id, 'opaque-selected-id');
    assert.equal(sent.max_tokens, 2048);
    assert.equal(sent.stream, false);
    assert.equal(sent.temperature, 0.72);
    assert.equal(sent.frequency_penalty, 0.1);
    assert.equal(sent.presence_penalty, 0.2);
    assert.equal(sent.top_p, 0.92);
    assert.equal(sent.seed, 17);
    assert.equal(sent.include_reasoning, true);
    assert.equal(sent.reasoning_effort, 'high');
    assert.equal(sent.nanogpt_provider, 'fixture-route');
    assert.equal(sent.custom_include_body, '');
});

test('installed NanoGPT sampler mapping keeps raw effort and omits unsupported quiet multi-swipe and top-k', () => {
    assert.equal(typeof api.presetToNanoGPTPayload, 'function');
    const payload = api.presetToNanoGPTPayload({ temperature: 0.7, top_k: 20, min_p: 0.1, n: 4, seed: -1, reasoning_effort: 'auto', show_thoughts: true }, { oai_settings: { temp_openai: 0.5, freq_pen_openai: 0, pres_pen_openai: 0, top_p_openai: 1 } }, { model: 'z-ai/glm-5.2:thinking', max_tokens: 100, messages: [{ role: 'user', content: 'Synthetic.' }] });
    assert.equal(payload.temperature, 0.7);
    assert.equal(payload.reasoning_effort, 'auto');
    assert.equal(payload.include_reasoning, true);
    for (const key of ['n', 'top_k', 'min_p', 'seed']) assert.equal(Object.hasOwn(payload, key), false, key);
    assert.equal(payload.max_tokens, 100);
});

test('installed custom stop strings parse JSON, filter empties, substitute fixture names and limit four', () => {
    const settings = { oai_settings: {}, power_user: { custom_stopping_strings: JSON.stringify(['', 3, '{{char}}:', '{{user}}:', 'END', 'DONE', 'FIFTH']), custom_stopping_strings_macro: true } };
    const payload = api.presetToNanoGPTPayload({}, settings, { model: 'z-ai/glm-5.2:thinking', messages: [] }, { name: 'Rin' });
    assert.deepEqual(payload.stop, ['Rin:', 'Synthetic player:', 'END', 'DONE']);
    assert.equal(Object.hasOwn(api.presetToNanoGPTPayload({}, { power_user: { custom_stopping_strings: '{broken' } }), 'stop'), false);
});

test('all 37 live phase cases seed only native completed-message references without provider calls', async () => {
    assert.equal(examplePhases.length, 37);
    let requests = 0;
    const profile = { id: 'approved-profile', name: 'Approved fixture connection', api: 'nanogpt', model: 'z-ai/glm-5.2:thinking', preset: 'Wandlight-1.8', 'secret-id': 'opaque-selected-id' };
    for (const { number, phase, graphId } of examplePhases) {
        const spec = liveCaseSpec(number, phase);
        assert.equal(spec.graph.id, graphId);
        const f = api.createLiveFixture(spec.graph, spec.options, {
            profile, preset: {}, settings: { oai_settings: {} },
            request: async () => { requests++; throw Error('Seeds must remain deterministic'); },
            send: async () => { requests++; throw Error('Seeds must remain offline'); },
        });
        await spec.seed(f);
        f.setGraph(spec.graph);
        const state = await currentMemory(f);
        const nativeEvents = (await readMemory(f, 'events')).artifact.value.payload.events;
        const refs = new Set(nativeEvents.map(event => `${event.id}:${event.revision}`));
        for (const collection of ['conditions', 'beliefs', 'goals', 'relationships', 'episodes']) {
            for (const item of state.payload[collection] ?? []) {
                for (const ref of item.sourceRefs) assert.equal(refs.has(`${ref.id}:${ref.revision}`), true, `${graphId} ${collection}/${item.id}`);
            }
        }
        assert.equal(f.graph.roles.Analysis.model, profile.model);
    }
    assert.equal(requests, 0);
});

test('manual failed-phase revisions preserve the original phase ledger and never repeat a graph/revision', () => {
    assert.equal(typeof api.selectSoakSpecs, 'function');
    const args = ['--account', 'lattice-examples-soak-test', '--profile-id', 'approved-profile', '--retest-failed', '--revision', 'reasoning-caps-v2'];
    const options = api.parseSoakArgs(args), failed5 = graphBy(5).id, complete6 = graphBy(6).id, failed23 = graphBy(23, 'post').id;
    const data = { phases: [{ graphId: failed5, status: 'failed' }, { graphId: complete6, status: 'completed' }, { graphId: failed23, status: 'failed' }] };
    const original = structuredClone(data);
    const specs = api.selectSoakSpecs(options, data);
    assert.deepEqual(specs.map(spec => [spec.number, spec.phase, spec.revision, spec.retestOf]), [[5, 'pre', 'reasoning-caps-v2', 0], [23, 'post', 'reasoning-caps-v2', 2]]);
    assert.deepEqual(data, original);
    data.phases.push({ graphId: failed5, revision: 'reasoning-caps-v2', status: 'failed' });
    assert.deepEqual(api.selectSoakSpecs(options, data).map(spec => spec.number), [23]);
    data.phases.push({ graphId: failed23, revision: 'reasoning-caps-v2', status: 'completed' });
    assert.deepEqual(api.selectSoakSpecs({ ...options, revision: 'reasoning-caps-v3' }, data).map(spec => spec.number), [5]);
    for (const extra of [['--retest-failed'], ['--revision', 'reasoning-caps-v2'], ['--retest-failed', '--revision', 'baseline']]) assert.throws(() => api.parseSoakArgs(['--account', 'lattice-examples-soak-test', '--profile-id', 'approved-profile', ...extra]));
});

test('manual revalidation requires an explicit live range and retargets only finished prior phases once per revision', () => {
    const base = ['--account', 'lattice-examples-soak-test', '--profile-id', 'approved-profile'];
    const mode = ['--revalidate', '--revision', 'grounding-v4', '--from', '5', '--to', '6', '--phase', 'pre'];
    const options = api.parseSoakArgs(['--live', ...base, ...mode, '--max-requests', '80']);
    assert.equal(options.revalidate, true);
    for (const extras of [
        mode,
        ['--live', '--revalidate', '--revision', 'grounding-v4', '--to', '6'],
        ['--live', '--revalidate', '--revision', 'grounding-v4', '--from', '5'],
        ['--live', '--revalidate', '--from', '5', '--to', '6'],
        ['--live', '--revalidate', '--revision', 'baseline', '--from', '5', '--to', '6'],
        ['--live', '--revalidate', '--revision', 'invalid/revision', '--from', '5', '--to', '6'],
        ['--live', '--retest-failed', ...mode],
        ['--live', ...mode, '--retest-failed'],
    ]) assert.throws(() => api.parseSoakArgs([...base, ...extras]));
    const graph5 = graphBy(5).id, graph6 = graphBy(6).id, finishedAt = '2026-10-10T04:00:00.000Z';
    const data = { requests: [], phases: [
        { graphId: graph5, status: 'completed', finishedAt },
        { graphId: graph6, status: 'completed', finishedAt },
        { graphId: graph5, revision: 'reasoning-caps-v2', status: 'failed', finishedAt, retestOf: 0 },
        { graphId: graph5, revision: 'reasoning-caps-v3', status: 'completed', finishedAt, retestOf: 0 },
    ] };
    const original = structuredClone(data);
    assert.deepEqual(api.selectSoakSpecs(options, data).map(spec => [spec.number, spec.revalidateOf]), [[5, 3], [6, 1]]);
    assert.deepEqual(data, original);
    assert.deepEqual(api.selectSoakSpecs({ ...options, from: 7, to: 7 }, data), [], 'unattempted graphs do not enter revalidation');
    data.requests.push({ address: { workflowId: graph5 }, number: 5, phase: 'pre', revision: 'grounding-v4', outcome: 'reserved' });
    assert.deepEqual(api.selectSoakSpecs(options, data).map(spec => spec.number), [6], 'reserved request history also prevents a repeat');
    data.phases.push({ graphId: graph6, revision: 'grounding-v4', status: 'running' });
    assert.deepEqual(api.selectSoakSpecs(options, data), [], 'running same-revision and finished previous requests remain attempted');
    assert.deepEqual(api.selectSoakSpecs({ ...options, revision: 'grounding-v5' }, data).map(spec => spec.number), [5], 'latest running phase is not settled');
    data.phases.at(-1).status = 'completed';
    assert.deepEqual(api.selectSoakSpecs({ ...options, revision: 'grounding-v5' }, data).map(spec => spec.number), [5], 'terminal status without finishedAt is not settled');
    data.phases.at(-1).finishedAt = finishedAt;
    assert.deepEqual(api.selectSoakSpecs({ ...options, revision: 'grounding-v5' }, data).map(spec => [spec.number, spec.revalidateOf]), [[5, 3], [6, 4]]);
});

test('retest attempts keep a shared cumulative reservation ceiling and record their explicit revision', async () => {
    const data = { requests: [{ attempt: 2, revision: 'baseline', outcome: 'failed' }], externalPriorAttempts: 1 };
    const ledger = api.createSoakLedger(data, { maxRequests: 3, checkpoint: async () => {} });
    const input = { binding: { model: 'z-ai/glm-5.2:thinking' }, maxTokens: 2048, messages: [{ role: 'user', content: 'Revised synthetic request.' }] };
    const stage = { node: { operation: 'response-plan', maxTokens: 2048 }, address: { workflowId: graphBy(5).id, instancePath: [], nodeId: 'pre-plan' } };
    await ledger.request(input, stage, { number: 5, phase: 'pre', revision: 'reasoning-caps-v2' }, async () => ({ ok: true, data: { text: 'Guidance.', finish: 'stop' } }));
    assert.equal(data.requests.length, 2);
    assert.equal(data.requests[0].revision, 'baseline');
    assert.equal(data.requests[1].revision, 'reasoning-caps-v2');
    assert.equal(data.requests[1].attempt, 3);
    assert.equal(ledger.remaining(), 0);
    await assert.rejects(() => ledger.request(input, stage, { number: 5, phase: 'pre', revision: 'reasoning-caps-v3' }, async () => { throw Error('Must not transmit'); }));
});

test('native tokenizer mirrors installed full=true NanoGPT counting and rejects invalid endpoint counts', async () => {
    assert.equal(typeof api.createLocalTokenCounter, 'function');
    const calls = [], client = { call: async (path, body) => { calls.push({ path, body }); return { token_count: 393 }; } };
    const count = api.createLocalTokenCounter(client), result = await count('Synthetic guidance.');
    assert.deepEqual(calls, [{ path: '/api/tokenizers/openai/count?model=gpt-3.5-turbo', body: [{ content: 'Synthetic guidance.' }] }]);
    assert.equal(result.tokens, 393, 'full=true keeps the full endpoint count without subtracting two');
    assert.equal(result.method, count.method);
    assert.match(result.method, /gpt-3\.5-turbo.*full=true/);
    for (const token_count of [-1, 1.5, Infinity, '393', 1048577, undefined]) await assert.rejects(() => api.createLocalTokenCounter({ call: async () => ({ token_count }) })('Synthetic guidance.'));
});

test('live fixture uses its native tokenizer service while explicit offline overrides retain precedence', async () => {
    const profile = { id: 'approved-profile', api: 'nanogpt', model: 'z-ai/glm-5.2:thinking', preset: 'Wandlight-1.8', 'secret-id': 'opaque-selected-id' };
    const countTokens = api.createLocalTokenCounter({ call: async () => ({ token_count: 393 }) });
    const services = { profile, preset: {}, settings: {}, countTokens };
    const native = api.createLiveFixture(graphBy(8), {}, services);
    assert.equal((await native.countTokens('Synthetic guidance.')).tokens, 393);
    assert.equal(native.tokenizerMethod, countTokens.method);
    const explicit = api.createLiveFixture(graphBy(8), { tokenCount: async () => ({ tokens: 7, method: 'explicit-test' }) }, services);
    assert.equal((await explicit.countTokens('Synthetic guidance.')).tokens, 7);
    const offline = api.createLiveFixture(graphBy(8), {}, { ...services, countTokens: undefined });
    assert.deepEqual(await offline.countTokens('12345'), { tokens: 2, method: 'example-fixture' });
});

test('native counting admits ensemble guidance within 400 tokens even when chars/4 reports overflow', async () => {
    const text = 'Optional: preserve the focal exchange and leave the player response open. '.repeat(24);
    assert.ok(Math.ceil(text.length / 4) > 400);
    const profile = { id: 'approved-profile', api: 'nanogpt', model: 'z-ai/glm-5.2:thinking', preset: 'Wandlight-1.8', 'secret-id': 'opaque-selected-id' };
    const services = {
        profile, preset: {}, settings: {},
        request: async (input, stage, context, execute) => execute(),
        send: async () => ({ choices: [{ message: { content: text }, finish_reason: 'stop' }] }),
    };
    const old = api.createLiveFixture(graphBy(8), {}, services);
    const rejected = await old.controller.beforeGenerate(old.context.chat, 8192, () => {});
    assert.equal(rejected.error.code, 'GUIDANCE_OVERFLOW');
    const native = api.createLiveFixture(graphBy(8), {}, { ...services, countTokens: api.createLocalTokenCounter({ call: async (path, body) => ({ token_count: body[0].content.trim() === text.trim() ? 393 : Math.ceil(body[0].content.length / 4) }) }) });
    const admitted = await native.controller.beforeGenerate(native.context.chat, 8192, () => {});
    assert.equal(admitted.ok, true, JSON.stringify(admitted.error));
    assert.equal(admitted.actualCalls, 1);
    assert.ok(Object.values(native.context.extensionPrompts).some(prompt => prompt.value.includes(text.trim())), JSON.stringify(native.context.extensionPrompts));
});
