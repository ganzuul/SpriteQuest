import assert from 'node:assert/strict';
import test from 'node:test';
import { captureFastBinding, requestFastDecision } from '../src/workflow/fast-connections.js';
const api = await import('../src/workflow/fast-registry.js').catch(() => ({}));
function fixture() {
    let user = 'default-user', configuration = { schema: 1, connections: {} }, saves = 0, calls = 0;
    const registry = api.createFastRegistry({ getUserId: () => user, getConfiguration: () => configuration, setConfiguration: value => { configuration = value; }, save: async () => { saves++; }, fetch: async (_url, options) => { calls++; assert.equal(options.headers.Authorization, 'Bearer PRIVATE_KEY'); return { ok: true, status: 200, text: async () => JSON.stringify({ model: 'jev-any', answers: { event: { type: 'noul', noul: 0.9 } }, usage: { input_tokens: 3, output_tokens: 2 } }) }; } });
    return { registry, config: () => configuration, change: value => { configuration = value; }, user: value => { user = value; }, counts: () => ({ saves, calls }) };
}
const question = { event: { type: 'noul', instructions: 'Did the event occur?' } };
test('configured Jev uses a session credential through real typed capture without persisting or exposing the key', async () => {
    assert.equal(typeof api.createFastRegistry, 'function'); const f = fixture();
    assert.equal(f.registry.upsert({ id: 'jev', label: 'Fast scene decision', provider: 'jev', model: 'jev-any' }).ok, true);
    assert.equal(f.registry.setCredential('jev', 'PRIVATE_KEY').ok, true);
    const captured = await captureFastBinding('jev', f.registry.host); assert.equal(captured.ok, true, JSON.stringify(captured.error));
    const result = await requestFastDecision(captured.data, { state: 'Scene', questions: question }, f.registry.host); assert.equal(result.ok, true, JSON.stringify(result.error)); assert.equal(f.counts().calls, 1);
    assert.doesNotMatch(JSON.stringify(f.config()), /PRIVATE_KEY/); assert.doesNotMatch(JSON.stringify(f.registry.snapshot()), /PRIVATE_KEY/); assert.equal(f.registry.snapshot().data.connections[0].credentialReady, true);
});
test('same-reference credential rotation invalidates an old binding before any network call', async () => {
    const f = fixture(); f.registry.upsert({ id: 'jev', provider: 'jev', model: 'jev-any' }); f.registry.setCredential('jev', 'PRIVATE_KEY'); const captured = await captureFastBinding('jev', f.registry.host);
    const reference = f.config().connections.jev.credentialRef; f.registry.setCredential('jev', 'ROTATED'); assert.equal(f.config().connections.jev.credentialRef, reference);
    const result = await requestFastDecision(captured.data, { state: 'Scene', questions: question }, f.registry.host); assert.equal(result.error.code, 'BINDING_CHANGED'); assert.equal(f.counts().calls, 0);
});
test('external configuration edits and user switches advance the synchronous epoch and revoke session secrets', async () => {
    const f = fixture(); f.registry.upsert({ id: 'jev', provider: 'jev', model: 'jev-any' }); f.registry.setCredential('jev', 'PRIVATE_KEY'); const captured = await captureFastBinding('jev', f.registry.host); const before = f.registry.host.getRegistryRevision();
    f.change({ ...f.config(), connections: { ...f.config().connections, jev: { ...f.config().connections.jev, model: 'different-model' } } }); assert.notEqual(f.registry.host.getRegistryRevision(), before);
    assert.equal((await requestFastDecision(captured.data, { state: 'Scene', questions: question }, f.registry.host)).error.code, 'BINDING_CHANGED');
    f.user('other-user'); assert.equal(f.registry.snapshot().data.connections[0].credentialReady, false); assert.equal((await captureFastBinding('jev', f.registry.host)).error.code, 'AUTH_MISSING');
});
test('Laya and compatible endpoints are explicit and unsafe routes or portable inline keys are rejected', () => {
    const f = fixture(); assert.equal(f.registry.upsert({ id: 'laya', provider: 'laya', model: 'local-model', endpoint: 'http://127.0.0.1:8080/v1/systemone' }).ok, true);
    assert.equal(f.registry.upsert({ id: 'remote', provider: 'compatible', model: 'custom', endpoint: 'http://untrusted.example/v1/systemone' }).ok, false);
    assert.equal(f.registry.upsert({ id: 'inline', provider: 'jev', model: 'x', apiKey: 'SECRET' }).ok, false);
    assert.equal(f.registry.upsert({ id: 'wrong-path', provider: 'laya', model: 'x', endpoint: 'https://example.com/v1/chat/completions' }).ok, false);
    let getter = 0; assert.equal(f.registry.upsert(Object.defineProperty({}, 'id', { enumerable: true, get() { getter++; return 'hidden'; } })).ok, false); assert.equal(getter, 0);
});
test('configuration persistence is explicit and reports an unverified host save honestly', async () => {
    const f = fixture(); f.registry.upsert({ id: 'laya', provider: 'laya', model: 'local', endpoint: 'http://localhost:8080/v1/systemone' }); assert.equal(f.counts().saves, 0);
    const result = await f.registry.save(); assert.equal(result.ok, true); assert.equal(result.data.acknowledged, false); assert.equal(result.data.appliedLocally, true); assert.equal(f.counts().saves, 1);
    const before = f.registry.host.getRegistryRevision(); assert.equal(f.registry.remove('laya').ok, true); assert.notEqual(f.registry.host.getRegistryRevision(), before); assert.equal(f.registry.snapshot().data.connections.length, 0);
});
test('disposed registries cannot recover old authority or expose raw configuration failures', async () => {
    const f = fixture(); f.registry.upsert({ id: 'jev', provider: 'jev', model: 'jev-any' }); f.registry.setCredential('jev', 'PRIVATE_KEY'); const captured = await captureFastBinding('jev', f.registry.host); f.registry.dispose();
    assert.equal((await requestFastDecision(captured.data, { state: 'Scene', questions: question }, f.registry.host)).ok, false); assert.equal(f.registry.snapshot().ok, false); assert.equal(f.registry.setCredential('jev', 'PRIVATE_KEY').ok, false);
});
test('overlarge registry updates are rejected before replacing valid settings and reserved IDs never alter dictionaries', () => {
    const f = fixture(); for (const id of ['__proto__', 'constructor', 'prototype']) assert.equal(f.registry.upsert({ id, provider: 'jev', model: 'x' }).ok, false);
    assert.equal(f.registry.upsert({ id: 'toString', provider: 'jev', model: 'jev-any' }).ok, true);
    let limitReached = false;
    for (let i = 0; i < 128; i++) {
        const before = structuredClone(f.config()); const result = f.registry.upsert({ id: 'large-' + i, label: 'l'.repeat(256), provider: 'compatible', model: 'm'.repeat(256), endpoint: 'https://example.com/' + 'p'.repeat(1990) + '/v1/systemone' });
        if (!result.ok) { limitReached = true; assert.deepEqual(f.config(), before); assert.equal(f.registry.snapshot().ok, true); break; }
    }
    assert.equal(limitReached, true);
});

for (const mutation of ['user', 'credential']) test('fetch refresh detects ' + mutation + ' changes before transmitting a captured key', async () => {
    let user = 'default-user', config = { schema: 1, connections: {} }, armed = false, reads = 0, calls = 0, registry;
    registry = api.createFastRegistry({ getUserId: () => { if (armed && ++reads === 7) { armed = false; if (mutation === 'user') user = 'other-user'; else registry.setCredential('jev', 'ROTATED'); } return user; }, getConfiguration: () => config, setConfiguration: value => { config = value; }, fetch: async () => { calls++; return { ok: true, status: 200, text: async () => JSON.stringify({ model: 'jev-any', answers: { event: { type: 'noul', noul: 0.9 } }, usage: { input_tokens: 3, output_tokens: 2 } }) }; } });
    registry.upsert({ id: 'jev', provider: 'jev', model: 'jev-any' }); registry.setCredential('jev', 'PRIVATE_KEY'); const captured = await captureFastBinding('jev', registry.host); assert.equal(captured.ok, true); armed = true;
    const result = await requestFastDecision(captured.data, { state: 'Scene', questions: question }, registry.host); assert.equal(result.error.code, 'BINDING_CHANGED'); assert.equal(calls, 0);
});
test('failed configuration admission still revokes a changed user and cannot restore an old epoch or key', async () => {
    const f = fixture(); f.registry.upsert({ id: 'jev', provider: 'jev', model: 'jev-any' }); f.registry.setCredential('jev', 'PRIVATE_KEY'); const original = structuredClone(f.config()), captured = await captureFastBinding('jev', f.registry.host), epoch = f.registry.host.getRegistryRevision();
    f.user('other-user'); f.change({ schema: 999, connections: {} }); assert.equal(f.registry.snapshot().ok, false); f.user('default-user'); f.change(original);
    assert.notEqual(f.registry.host.getRegistryRevision(), epoch); assert.equal(f.registry.snapshot().data.connections[0].credentialReady, false);
    const result = await requestFastDecision(captured.data, { state: 'Scene', questions: question }, f.registry.host); assert.equal(result.error.code, 'BINDING_CHANGED'); assert.equal(f.counts().calls, 0);
});
