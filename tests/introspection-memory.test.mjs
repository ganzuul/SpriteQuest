import assert from 'node:assert/strict';
import { test } from 'node:test';
const api = await import('../src/workflow/introspection/memory.js').catch(() => ({}));
const scope = { chatId: 'chat-1', actorId: 'npc-1' };
const ref = { id: 'event-1', revision: 'rev-1' };
const item = (id, text, classification = 'interpretation', sourceRefs = [ref]) => ({ id, text, classification, sourceRefs });
const record = (recordType, payload, version = 0, refs = [ref]) => ({ kind: 'data', value: { schemaVersion: 1, recordType, scope: { ...scope }, store: { id: 'store-1', version }, sourceRefs: structuredClone(refs), payload } });
const state = (version = 0, initial = {}) => record('actor-state', { traits: [], beliefs: [], goals: [], relationships: [], conflicts: [], conditions: [], episodes: [], values: {}, curves: {}, tracks: {}, ...initial }, version, [...new Map(Object.values(initial).filter(Array.isArray).flat().flatMap(entry => entry.sourceRefs ?? []).map(value => [JSON.stringify(value), value])).values()]);
const events = () => record('events', { events: [{ id: ref.id, revision: ref.revision, text: 'An apology was offered', settled: true }] });
const proposal = (version = 0, changes = [{ op: 'upsert', collection: 'conditions', item: item('anger', 'Immediate anger eased') }]) => record('state-proposal', { changes, values: {}, curves: {}, tracks: {} }, version);
const intent = (key = 'commit-1', version = 0, changes) => record('commit-intent', { idempotencyKey: key, proposal: proposal(version, changes).value }, version);
const create = (initial = state(), material = events()) => api.createMemoryService(api.createInMemoryBackend(initial, material));
const assertFailure = (result, code) => { assert.equal(result.ok, false); if (code) assert.equal(result.error.code, code); };
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };

test('memory reads detached snapshots and deterministically recalls matching episodes', async () => {
    assert.equal(typeof api.createMemoryService, 'function');
    assert.equal(typeof api.createInMemoryBackend, 'function');
    const initial = state(0, { episodes: [item('apology', 'Apology after the argument'), item('argument', 'Argument at the gate'), item('garden', 'Walk in the garden')] });
    const service = create(initial);
    const first = await service.read({ view: 'state' });
    assert.equal(first.ok, true);
    assert.equal(first.artifact.value.payload.episodes[0].text, 'Apology after the argument');
    initial.value.payload.episodes[0].text = 'mutated outside';
    assert.equal((await service.read({ view: 'state' })).artifact.value.payload.episodes[0].text, 'Apology after the argument');
    const recalled = await service.recall({ query: 'argument apology', limit: 2 });
    assert.equal(recalled.ok, true);
    assert.equal(recalled.artifact.value.recordType, 'episodes');
    assert.deepEqual(recalled.artifact.value.payload.episodes.map(value => value.id), ['apology', 'argument']);
    assert.equal((await service.read({ view: 'events' })).artifact.value.recordType, 'events');
    assert.equal((await service.read({ view: 'episodes' })).artifact.value.recordType, 'episodes');
    assertFailure(await service.recall({ query: 'x', limit: 65 }));
    assertFailure(await service.read({ view: 'unknown' }));
});

test('explicit root commit persists one version and makes identical replay idempotent', async () => {
    const service = create();
    const result = await service.commit(intent(), { root: true });
    assert.equal(result.ok, true);
    assert.deepEqual({ applied: result.data.applied, acknowledged: result.data.acknowledged, version: result.data.version }, { applied: true, acknowledged: true, version: 1 });
    assert.equal(result.data.state.value.payload.conditions[0].text, 'Immediate anger eased');
    const replay = await service.commit(intent(), { root: true });
    assert.equal(replay.ok, true);
    assert.equal(replay.data.applied, false);
    assert.equal((await service.read({ view: 'state' })).artifact.value.store.version, 1);
    const conflicting = intent(); conflicting.value.payload.proposal.payload.changes[0].item.text = 'Trust restored completely';
    assertFailure(await service.commit(conflicting, { root: true }), 'IDEMPOTENCY_CONFLICT');
    assertFailure(await service.commit(intent('stale'), { root: true }), 'STALE_VERSION');
});

test('simultaneous commits serialize so a stale candidate cannot overwrite the first', async () => {
    const service = create();
    const results = await Promise.all([service.commit(intent('first'), { root: true }), service.commit(intent('second'), { root: true })]);
    assert.equal(results[0].ok, true);
    assertFailure(results[1], 'STALE_VERSION');
    assert.equal((await service.read({ view: 'state' })).artifact.value.store.version, 1);
});

test('event reads follow the current actor-state version across two Track commits', async () => {
    const { advanceState } = await import('../src/workflow/introspection/context-state.js');
    const material = events();
    let context = { chatId: scope.chatId, chatMetadata: {} };
    const backends = [api.createInMemoryBackend(state(), material), api.createChatMetadataBackend({ scope, storeId: 'store-1', getContext: () => context, saveMetadata: async next => { context = next; return true; }, readEvents: async () => ({ ok: true, data: material }), validateSources: async () => ({ ok: true }) })];
    for (const backend of backends) {
        const service = api.createMemoryService(backend);
        for (let turn = 0; turn < 2; turn++) {
            const prior = await service.read({ view: 'state' });
            const current = await service.read({ view: 'events' });
            assert.equal(current.ok, true);
            assert.equal(current.artifact.value.store.version, turn);
            assert.equal(current.artifact.value.store.version, prior.artifact.value.store.version);
            assert.deepEqual(current.artifact.value.scope, scope);
            assert.deepEqual(current.artifact.value.sourceRefs, [ref]);
            assert.deepEqual(current.artifact.value.payload, { events: [{ id: 'event-1', revision: 'rev-1', text: 'An apology was offered', settled: true }] });
            const tracked = advanceState(prior.artifact, { mode: 'track', trackId: 'apologies' }, current.artifact);
            assert.equal(tracked.ok, true);
            assert.deepEqual(tracked.artifact.value.payload.tracks.apologies, { eventIds: ['event-1'], count: 1 });
            const request = record('commit-intent', { idempotencyKey: `track-turn-${turn}`, proposal: tracked.artifact.value }, turn, tracked.artifact.value.sourceRefs);
            const saved = await service.commit(request, { root: true });
            assert.equal(saved.ok, true); assert.equal(saved.data.version, turn + 1);
        }
        assert.equal((await backend.readEvents()).data.value.store.version, 0);
    }
    assert.equal(material.value.store.version, 0);
});

test('preview dry-run nonroot and cancelled commits never persist', async () => {
    for (const controls of [{ root: true, preview: true }, { root: true, dryRun: true }, { root: false }, {}]) {
        const service = create();
        assertFailure(await service.commit(intent(), controls));
        assert.equal((await service.read({ view: 'state' })).artifact.value.store.version, 0);
    }
    const controller = new AbortController(); controller.abort();
    const service = create();
    assertFailure(await service.commit(intent(), { root: true, signal: controller.signal }), 'CANCELLED');
    assert.equal((await service.read({ view: 'state' })).artifact.value.store.version, 0);
});

test('commit validates item sources and preserves possibility classification', async () => {
    const service = create();
    const missing = intent(); missing.value.payload.proposal.payload.changes[0].item.sourceRefs = [{ id: 'missing', revision: 'rev-1' }];
    assertFailure(await service.commit(missing, { root: true }));
    const unsupportedObservation = intent('unsupported', 0, [{ op: 'upsert', collection: 'episodes', item: item('fact', 'They intend to leave', 'observation', []) }]);
    assertFailure(await service.commit(unsupportedObservation, { root: true }), 'INVALID_INTROSPECTION_EVIDENCE');
    const possible = intent('possible', 0, [{ op: 'upsert', collection: 'beliefs', item: item('fear', 'They may leave', 'possibility') }]);
    const result = await service.commit(possible, { root: true });
    assert.equal(result.ok, true);
    assert.equal(result.data.state.value.payload.beliefs[0].classification, 'possibility');
    const draftEvents = events(); draftEvents.value.payload.events[0].settled = false;
    assertFailure(await create(state(), draftEvents).commit(intent(), { root: true }));
});

test('source deletion edits and swipe revisions prevent a new stale commit', async () => {
    for (const replacement of [record('events', { events: [] }, 0, []), record('events', { events: [{ id: ref.id, revision: 'rev-2', text: 'Edited apology', settled: true }] }, 0, [{ id: ref.id, revision: 'rev-2' }])]) {
        let material = events();
        const service = api.createMemoryService(api.createInMemoryBackend(state(), () => material));
        assert.equal((await service.commit(intent('prior'), { root: true })).ok, true);
        material = replacement;
        const read = await service.read({ view: 'state' });
        assert.equal(read.ok, true);
        assert.ok(read.reports.some(report => report.code === 'INVALIDATED_SOURCES'));
        assert.equal(read.artifact.value.payload.conditions[0].text, 'Immediate anger eased');
        assertFailure(await service.commit(intent('next', 1), { root: true }));
        assert.equal((await service.read({ view: 'state' })).artifact.value.store.version, 1);
    }
});

test('cancellation and invalidation during awaited validation prevent CAS', async () => {
    for (const invalidate of [false, true]) {
        let material = events();
        const backend = api.createInMemoryBackend(state(), () => material);
        const entered = deferred(); const release = deferred();
        backend.validateSources = async () => { entered.resolve(); await release.promise; return { ok: true }; };
        const service = api.createMemoryService(backend); const controller = new AbortController();
        const pending = service.commit(intent(), { root: true, signal: controller.signal });
        await entered.promise;
        if (invalidate) material = record('events', { events: [] }, 0, []); else controller.abort();
        release.resolve();
        assertFailure(await pending);
        assert.equal((await service.read({ view: 'state' })).artifact.value.store.version, 0);
    }
});

test('a version changed during awaited validation is rejected before writing', async () => {
    const backend = api.createInMemoryBackend(state(), events());
    const entered = deferred(); const release = deferred();
    backend.validateSources = async () => { entered.resolve(); await release.promise; return { ok: true }; };
    const service = api.createMemoryService(backend);
    const pending = service.commit(intent(), { root: true });
    await entered.promise;
    assert.equal((await backend.compareAndSwap({ expectedVersion: 0, state: state(1, { values: { trust: 3 } }), receipt: { key: 'external', fingerprint: 'external', version: 1 } })).ok, true);
    release.resolve();
    assertFailure(await pending, 'STALE_VERSION');
    assert.equal((await service.read({ view: 'state' })).artifact.value.payload.values.trust, 3);
});

test('scope mismatch and unsafe duplicate receipts fail without authoritative output', async () => {
    const backend = api.createInMemoryBackend(state(), events());
    const mismatched = state(); mismatched.value.scope.actorId = 'other';
    backend.load = async () => ({ ok: true, data: { state: mismatched, receipts: [] } });
    assertFailure(await api.createMemoryService(backend).read({ view: 'state' }), 'SCOPE_MISMATCH');
    let accessed = false;
    const unsafe = api.createInMemoryBackend(state(), events());
    unsafe.load = async () => ({ ok: true, data: { state: state(), receipts: [{ key: 'x', get fingerprint() { accessed = true; return 'x'; }, version: 0 }] } });
    assertFailure(await api.createMemoryService(unsafe).commit(intent(), { root: true }));
    assert.equal(accessed, false);
    const duplicate = api.createInMemoryBackend(state(), events());
    duplicate.load = async () => ({ ok: true, data: { state: state(), receipts: [{ key: 'same', fingerprint: 'a', version: 0 }, { key: 'same', fingerprint: 'b', version: 0 }] } });
    assertFailure(await api.createMemoryService(duplicate).read({ view: 'state' }));
});

test('metadata namespaces actors and saves only an explicit acknowledged commit', async () => {
    let context = { chatId: scope.chatId, chatMetadata: { unrelated: { preserved: true } } };
    const backend = api.createChatMetadataBackend({ scope, storeId: 'store-1', getContext: () => context, saveMetadata: async next => { context = structuredClone(next); return true; }, readEvents: async () => ({ ok: true, data: events() }), validateSources: async () => ({ ok: true }) });
    const service = api.createMemoryService(backend);
    assert.deepEqual(context.chatMetadata, { unrelated: { preserved: true } });
    assert.equal((await service.read({ view: 'state' })).artifact.value.store.version, 0);
    const result = await service.commit(intent(), { root: true });
    assert.equal(result.ok, true); assert.equal(result.data.acknowledged, true);
    assert.deepEqual(context.chatMetadata.unrelated, { preserved: true });
    assert.equal(context.chatMetadata.latticeIntrospection['store-1']['npc-1'].state.value.store.version, 1);
    context = { chatId: 'other-chat', chatMetadata: context.chatMetadata };
    assertFailure(await service.commit(intent('next', 1), { root: true }), 'SCOPE_MISMATCH');
});

test('unknown metadata save outcome cannot trigger a blind retry', async () => {
    for (const acknowledgement of [false, undefined]) {
        const context = { chatId: scope.chatId, chatMetadata: {} }; let writes = 0;
        const backend = api.createChatMetadataBackend({ scope, storeId: 'store-1', getContext: () => context, saveMetadata: async () => { writes++; return acknowledgement; }, readEvents: async () => ({ ok: true, data: events() }), validateSources: async () => ({ ok: true }) });
        const service = api.createMemoryService(backend);
        const result = await service.commit(intent(), { root: true });
        assert.equal(result.ok, true); assert.equal(result.data.applied, true); assert.equal(result.data.acknowledged, false);
        assertFailure(await service.commit(intent(), { root: true }), 'PERSISTENCE_UNKNOWN');
        assertFailure(await service.commit(intent('another-key'), { root: true }), 'PERSISTENCE_UNKNOWN');
        assertFailure(await api.createMemoryService(backend).commit(intent(), { root: true }), 'PERSISTENCE_UNKNOWN');
        assert.equal(writes, 1);
    }
});

test('cancellation during metadata CAS context reads is checked before saving', async () => {
    let context = { chatId: scope.chatId, chatMetadata: {} }; let pause = false; let writes = 0;
    const entered = deferred(); const release = deferred();
    const backend = api.createChatMetadataBackend({ scope, storeId: 'store-1', getContext: async () => { if (pause) { pause = false; entered.resolve(); await release.promise; } return context; }, saveMetadata: async next => { writes++; context = next; return true; }, readEvents: async () => ({ ok: true, data: events() }), validateSources: async () => ({ ok: true }) });
    const nativeCAS = backend.compareAndSwap;
    backend.compareAndSwap = (input, controls) => { pause = true; return nativeCAS(input, controls); };
    const service = api.createMemoryService(backend); const controller = new AbortController();
    const pending = service.commit(intent(), { root: true, signal: controller.signal });
    await entered.promise; controller.abort(); release.resolve();
    assertFailure(await pending, 'CANCELLED');
    assert.equal(writes, 0);
    assert.deepEqual(context.chatMetadata, {});
});

test('source invalidation during metadata CAS context reads prevents saving a stale proposal', async () => {
    let context = { chatId: scope.chatId, chatMetadata: {} }; let pause = false; let material = events(); let writes = 0;
    const entered = deferred(); const release = deferred();
    const backend = api.createChatMetadataBackend({ scope, storeId: 'store-1', getContext: async () => { if (pause) { pause = false; entered.resolve(); await release.promise; } return context; }, saveMetadata: async next => { writes++; context = next; return true; }, readEvents: async () => ({ ok: true, data: material }), validateSources: async () => material.value.payload.events.length ? { ok: true } : { ok: false, error: { code: 'INVALID_INTROSPECTION_EVIDENCE', message: 'Source no longer exists.' } } });
    const nativeCAS = backend.compareAndSwap;
    backend.compareAndSwap = (input, controls) => { pause = true; return nativeCAS(input, controls); };
    const pending = api.createMemoryService(backend).commit(intent(), { root: true });
    await entered.promise; material = record('events', { events: [] }, 0, []); release.resolve();
    assertFailure(await pending);
    assert.equal(writes, 0);
    assert.deepEqual(context.chatMetadata, {});
});

test('an unknown save becomes a confirmed replay when its persisted receipt is later read', async () => {
    let context = { chatId: scope.chatId, chatMetadata: {} };
    const backend = api.createChatMetadataBackend({ scope, storeId: 'store-1', getContext: () => context, saveMetadata: async next => { context = next; return false; }, readEvents: async () => ({ ok: true, data: events() }), validateSources: async () => ({ ok: true }) });
    const service = api.createMemoryService(backend);
    const first = await service.commit(intent(), { root: true });
    assert.equal(first.ok, true); assert.equal(first.data.acknowledged, false);
    const replay = await service.commit(intent(), { root: true });
    assert.equal(replay.ok, true); assert.equal(replay.data.applied, false); assert.equal(replay.data.acknowledged, true);
    const second = await service.commit(intent('next', 1), { root: true });
    assert.equal(second.ok, true); assert.equal(second.data.version, 2);
});

test('canonical receipt fingerprints ignore object key order and snapshot queued input', async () => {
    const service = create();
    const original = intent();
    const pending = service.commit(original, { root: true });
    original.value.payload.proposal.payload.changes[0].item.text = 'Mutated before asynchronous settlement';
    assert.equal((await pending).data.state.value.payload.conditions[0].text, 'Immediate anger eased');
    const reversed = value => Array.isArray(value) ? value.map(reversed) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).reverse().map(key => [key, reversed(value[key])])) : value;
    const replay = await service.commit(reversed(intent()), { root: true });
    assert.equal(replay.ok, true); assert.equal(replay.data.applied, false);
});

test('CAS rejects wrong scope versions and conflicting receipts without changing storage', async () => {
    const backend = api.createInMemoryBackend(state(), events());
    const receipt = { key: 'manual', fingerprint: 'manual-content', version: 1 };
    assertFailure(await backend.compareAndSwap({ expectedVersion: 1, state: state(2), receipt: { ...receipt, version: 2 } }), 'STALE_VERSION');
    assertFailure(await backend.compareAndSwap({ expectedVersion: 0, state: state(3), receipt: { ...receipt, version: 3 } }));
    const other = state(1); other.value.scope.chatId = 'another-chat';
    assertFailure(await backend.compareAndSwap({ expectedVersion: 0, state: other, receipt }), 'SCOPE_MISMATCH');
    assert.equal((await backend.load()).data.state.value.store.version, 0);
    assert.equal((await backend.compareAndSwap({ expectedVersion: 0, state: state(1), receipt })).ok, true);
    assertFailure(await backend.compareAndSwap({ expectedVersion: 1, state: state(2), receipt: { ...receipt, version: 2 } }));
    assert.equal((await backend.load()).data.state.value.store.version, 1);
});

test('in-memory CAS owns its input before waiting for current source material', async () => {
    const entered = deferred(); const release = deferred();
    const backend = api.createInMemoryBackend(state(), async () => { entered.resolve(); await release.promise; return events(); });
    const input = { expectedVersion: 0, state: state(1, { conditions: [item('anger', 'Immediate anger eased')] }), receipt: { key: 'manual', fingerprint: 'manual-content', version: 1 } };
    const pending = backend.compareAndSwap(input, { sourceRefs: [ref] });
    await entered.promise; input.state.value.scope.actorId = 'other'; input.state.value.payload.conditions[0].text = 'Mutated while awaiting'; release.resolve();
    assert.equal((await pending).ok, true);
    assert.equal((await backend.load()).data.state.value.payload.conditions[0].text, 'Immediate anger eased');
});

test('version and receipt limits reject new writes instead of dropping idempotency history', async () => {
    assertFailure(await create(state(Number.MAX_SAFE_INTEGER)).commit(intent('overflow', Number.MAX_SAFE_INTEGER), { root: true }), 'VERSION_LIMIT');
    const backend = api.createInMemoryBackend(state(64), events());
    backend.load = async () => ({ ok: true, data: { state: state(64), receipts: Array.from({ length: 64 }, (_, index) => ({ key: `receipt-${index}`, fingerprint: 'stored-content', version: index + 1 })) } });
    assertFailure(await api.createMemoryService(backend).commit(intent('new', 64), { root: true }), 'RECEIPT_LIMIT');
    assert.equal((await backend.load()).data.state.value.store.version, 64);
});

test('malformed validators and scope-changing event records never authorize a commit', async () => {
    const backend = api.createInMemoryBackend(state(), events());
    backend.validateSources = async () => ({ ok: true, data: true });
    assertFailure(await api.createMemoryService(backend).commit(intent(), { root: true }), 'INVALID_MEMORY_BACKEND_RESULT');
    const other = api.createInMemoryBackend(state(), events());
    other.readEvents = async () => { const material = events(); material.value.scope.actorId = 'other'; return { ok: true, data: material }; };
    assertFailure(await api.createMemoryService(other).commit(intent(), { root: true }), 'SCOPE_MISMATCH');
    assert.equal((await backend.load()).data.state.value.store.version, 0);
});

test('accessors oversized intent and malformed persistence acknowledgements are rejected', async () => {
    const service = create(); let accessed = false;
    const malformed = { kind: 'data', get value() { accessed = true; return intent().value; } };
    assertFailure(await service.commit(malformed, { root: true })); assert.equal(accessed, false);
    const large = intent(); large.value.payload.proposal.payload.changes[0].item.text = 'x'.repeat(4097);
    assertFailure(await service.commit(large, { root: true }));
    const backend = api.createInMemoryBackend(state(), events()); backend.compareAndSwap = async () => ({ ok: true, data: { acknowledged: 'yes' } });
    assertFailure(await api.createMemoryService(backend).commit(intent(), { root: true }));
    assert.equal((await service.read({ view: 'state' })).artifact.value.store.version, 0);
});
