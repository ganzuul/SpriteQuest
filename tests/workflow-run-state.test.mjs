import assert from 'node:assert/strict';
import { test } from 'node:test';

const api = await import('../src/workflow/run-state.js').catch(() => ({}));
const address = (nodeId, instancePath = []) => ({ workflowId: 'workflow/one', instancePath, nodeId });
const unit = (nodeId, dependencies = [], included = true, instancePath = []) => ({ address: address(nodeId, instancePath), operation: 'work', included, dependencies: dependencies.map(id => address(id, instancePath)), requestBound: 1, inputPorts: ['in'], outputPorts: ['out'] });
const plan = () => ({ workflowId: 'workflow/one', phase: 'post', mode: 'target', target: { ...address('b'), portId: 'out' }, units: [unit('a'), unit('b', ['a']), unit('c'), unit('unused', [], false)], hierarchy: [], terminals: [], callBound: 3 });
const event = (seq, type, fields = {}) => ({ runId: 'run-1', seq, type, at: 100 + seq, elapsedMs: seq, ...fields });

// Removing explicit run initialization or accepting a foreign plan would relabel a retained run.
test('accepts only a same-run first plan and ignores malformed, duplicate and old events', () => {
    assert.equal(typeof api.createRunState, 'function');
    const empty = api.createRunState('run-1');
    assert.equal(api.reduceRunState(empty, event(1, 'plan', { runId: 'other', plan: plan() })), empty);
    const state = api.reduceRunState(empty, event(1, 'plan', { plan: plan() }));
    assert.equal(state.status, 'waiting');
    assert.deepEqual(state.nodes.map(node => node.status), ['waiting', 'waiting', 'waiting', 'not-run']);
    for (const e of [event(1, 'plan', { plan: plan() }), event(0, 'node-phase', { address: address('a'), phase: 'executing' }), event(2, 'unknown'), event(2, 'node-phase', { address: address('a'), phase: 'executing', elapsedMs: NaN })]) assert.equal(api.reduceRunState(state, e), state);
    const started = api.reduceRunState(state, event(7, 'node-phase', { address: address('a'), phase: 'executing' }));
    assert.equal(started.nodes[0].status, 'running');
    assert.equal(started.nodes[1].status, 'queued');
    assert.equal(started.lastSeq, 7, 'observer sequence gaps do not prevent progress');
    assert.equal(state.nodes[0].status, 'waiting', 'prior states remain unchanged');
    assert.ok(Object.isFrozen(started.nodes[0].address.instancePath));
});

// Marking every pending unit Blocked hides the distinction between descendants and unrelated work.
test('binding failure blocks selected descendants and leaves unrelated work not run', () => {
    let state = api.reduceRunState(api.createRunState('run-1'), event(1, 'plan', { plan: plan() }));
    state = api.reduceRunState(state, event(2, 'node-phase', { address: address('a'), phase: 'binding' }));
    assert.equal(state.nodes[0].status, 'waiting');
    assert.equal(state.nodes[0].subphase, 'binding');
    state = api.reduceRunState(state, event(3, 'run-settled', { status: 'failed', failedAddress: address('a'), error: { code: 'MISSING_BINDING', message: 'Choose a profile' } }));
    assert.deepEqual(state.nodes.map(node => node.status), ['failed', 'blocked', 'not-run', 'not-run']);
    assert.equal(api.reduceRunState(state, event(4, 'node-phase', { address: address('b'), phase: 'executing' })), state);
});

// A cancellation barrier must resist a deferred provider resolving successfully after Stop.
test('Stop preserves completed work, blocks late successes and settles selected pending work cancelled', () => {
    let state = api.reduceRunState(api.createRunState('run-1'), event(1, 'plan', { plan: plan() }));
    for (const e of [event(2, 'node-phase', { address: address('a'), phase: 'executing' }), event(3, 'node-settled', { address: address('a'), status: 'completed' }), event(4, 'node-phase', { address: address('b'), phase: 'executing' }), event(5, 'request-start', { address: address('b'), attempt: 1, maxTokens: 100 }), event(6, 'run-cancelling')]) state = api.reduceRunState(state, e);
    assert.deepEqual(state.nodes.map(node => node.status), ['completed', 'cancelling', 'queued', 'not-run']);
    for (const e of [event(7, 'request-settled', { address: address('b'), attempt: 1, status: 'completed', durationMs: 2 }), event(8, 'node-settled', { address: address('b'), status: 'completed' }), event(9, 'run-settled', { status: 'completed' })]) assert.equal(api.reduceRunState(state, e), state);
    state = api.reduceRunState(state, event(10, 'run-settled', { status: 'cancelled' }));
    assert.deepEqual(state.nodes.map(node => node.status), ['completed', 'cancelled', 'cancelled', 'not-run']);
    assert.equal(api.reduceRunState(state, event(11, 'plan', { plan: plan() })), state);
});

// Reopening an instance view must project its retained addresses, without re-resolving a graph.
test('hierarchy projection keeps repeated instances separate and counts only primitives', () => {
    const p = plan(); p.mode = 'root'; delete p.target;
    p.units = [unit('work', [], true, ['a/b']), unit('work', [], true, ['a', 'b'])];
    p.hierarchy = [{ address: address('a/b'), kind: 'instance', included: true }, { address: address('a'), kind: 'instance', included: true }, { address: address('b', ['a']), kind: 'instance', included: true }];
    let state = api.reduceRunState(api.createRunState('run-1'), event(1, 'plan', { plan: p }));
    state = api.reduceRunState(state, event(2, 'node-phase', { address: address('work', ['a/b']), phase: 'executing' }));
    const rows = api.projectRunRows(state);
    assert.deepEqual(rows.map(row => [row.address.nodeId, row.status, row.executableCount]), [['a/b', 'running', 1], ['a', 'queued', 1]]);
    assert.deepEqual(api.projectRunRows(state, ['a', 'b']).map(row => row.address), [address('work', ['a', 'b'])]);
    assert.deepEqual(api.projectRunRows(state, ['a/b']).map(row => row.address), [address('work', ['a/b'])]);
});

// Requests with no dispatch start must not count as paid attempts or accept arbitrary private fields.
test('request summaries count accepted dispatches and reject malformed phases safely', () => {
    let state = api.reduceRunState(api.createRunState('run-1'), event(1, 'plan', { plan: plan() }));
    const early = event(2, 'request-start', { address: address('a'), attempt: 1, maxTokens: 10 });
    assert.equal(api.reduceRunState(state, early), state);
    state = api.reduceRunState(state, event(3, 'node-phase', { address: address('a'), phase: 'executing', binding: { role: 'Analysis', model: 'chosen', endpoint: 'secret', headers: { authorization: 'secret' } } }));
    state = api.reduceRunState(state, event(4, 'request-start', { address: address('a'), attempt: 1, maxTokens: 10 }));
    assert.equal(api.reduceRunState(state, event(5, 'request-start', { address: address('a'), attempt: 2, maxTokens: 10 })), state);
    state = api.reduceRunState(state, event(6, 'request-settled', { address: address('a'), attempt: 1, status: 'completed', durationMs: 2, usage: { totalTokens: 8, cost: 'unknown', provider: 'secret' }, providerResponse: 'private' }));
    assert.equal(state.nodes[0].attempts, 1);
    assert.deepEqual(state.nodes[0].binding, { role: 'Analysis', model: 'chosen' });
    assert.deepEqual(state.nodes[0].request.usage, { totalTokens: 8 });
    let reads = 0;
    const malformed = Object.defineProperty(event(7, 'node-phase'), 'address', { get() { reads++; return address('a'); } });
    assert.equal(api.reduceRunState(state, malformed), state);
    assert.equal(reads, 0);
    assert.equal(api.createRunState({ get runId() { reads++; return 'run-1'; } }), null);
    assert.equal(reads, 0);
});

// Monotone sequence alone must not admit a dependent stage before its inputs settle.
test('rejects dependency and concurrent execution markers and preserves structural invalid runs', () => {
    const empty = api.createRunState('run-1');
    const invalid = api.reduceRunState(empty, event(1, 'run-settled', { status: 'invalid', error: { code: 'CYCLE', message: 'Hidden cycle' } }));
    assert.equal(invalid.status, 'invalid'); assert.equal(invalid.plan, null); assert.deepEqual(api.projectRunRows(invalid), []);
    let state = api.reduceRunState(empty, event(1, 'plan', { plan: plan() }));
    assert.equal(api.reduceRunState(state, event(2, 'node-phase', { address: address('b'), phase: 'executing' })), state);
    state = api.reduceRunState(state, event(3, 'node-phase', { address: address('a'), phase: 'executing' }));
    assert.equal(api.reduceRunState(state, event(4, 'node-phase', { address: address('c'), phase: 'executing' })), state);
    assert.equal(api.reduceRunState(state, event(5, 'run-settled', { status: 'failed', failedAddress: address('unused') })), state);
});

const activeRequestState = () => {
    const p = plan(); p.mode = 'root'; delete p.target;
    p.units = [unit('done'), unit('active', [], true, ['instance']), unit('descendant', ['active'], true, ['instance']), unit('unrelated'), unit('excluded', [], false)];
    p.hierarchy = [{ address: address('instance'), kind: 'instance', included: true }];
    let state = api.reduceRunState(api.createRunState('run-1'), event(1, 'plan', { plan: p }));
    for (const e of [event(2, 'node-phase', { address: address('done'), phase: 'executing' }), event(3, 'node-settled', { address: address('done'), status: 'completed' }), event(4, 'node-phase', { address: address('active', ['instance']), phase: 'executing' }), event(5, 'request-start', { address: address('active', ['instance']), attempt: 1, maxTokens: 100, inputTokens: 11 })]) state = api.reduceRunState(state, e);
    return state;
};

// An unattributed root failure cannot permanently leave its active primitive/request/wrapper Running.
test('unattributed terminal failure closes active work with descendant and timing summaries', () => {
    const previous = activeRequestState();
    const settled = api.reduceRunState(previous, event(9, 'run-settled', { status: 'failed', elapsedMs: 25, error: { code: 'ROOT_FAILED', message: 'Runtime failed' } }));
    assert.deepEqual(settled.nodes.map(node => node.status), ['completed', 'failed', 'blocked', 'not-run', 'not-run']);
    assert.equal(settled.nodes[0], previous.nodes[0]);
    const active = settled.nodes[1];
    assert.equal(active.subphase, null); assert.equal(active.durationMs, 21); assert.equal(active.settledAt, 25); assert.equal(active.attempts, 1);
    assert.equal(active.request.status, 'failed'); assert.equal(active.request.durationMs, 20); assert.equal(active.request.maxTokens, 100); assert.equal(active.request.inputTokens, 11);
    for (const key of ['usage', 'finish', 'cost']) assert.equal(Object.hasOwn(active.request, key), false);
    assert.equal(api.projectRunRows(settled).find(row => row.kind === 'instance').status, 'failed');
    assert.equal(api.reduceRunState(settled, event(10, 'request-settled', { elapsedMs: 26, address: address('active', ['instance']), attempt: 1, status: 'completed', durationMs: 21, usage: { totalTokens: 90 } })), settled);
    assert.equal(previous.nodes[1].status, 'running'); assert.equal(previous.nodes[1].request.status, 'running');
});

// The cancellation barrier must close the known request through the root terminal event, not a late provider event.
test('cancelled terminal settlement closes the active request and projects a cancelled wrapper', () => {
    const previous = activeRequestState();
    const cancelling = api.reduceRunState(previous, event(6, 'run-cancelling'));
    const cancelled = api.reduceRunState(cancelling, event(7, 'run-settled', { status: 'cancelled', elapsedMs: 15 }));
    assert.deepEqual(cancelled.nodes.map(node => node.status), ['completed', 'cancelled', 'cancelled', 'cancelled', 'not-run']);
    const active = cancelled.nodes[1];
    assert.equal(active.request.status, 'cancelled'); assert.equal(active.request.durationMs, 10); assert.equal(active.durationMs, 11); assert.equal(active.settledAt, 15); assert.equal(active.attempts, 1);
    for (const key of ['usage', 'finish', 'cost']) assert.equal(Object.hasOwn(active.request, key), false);
    assert.equal(api.projectRunRows(cancelled).find(row => row.kind === 'instance').status, 'cancelled');
    assert.equal(api.reduceRunState(cancelled, event(8, 'request-settled', { elapsedMs: 16, address: address('active', ['instance']), attempt: 1, status: 'completed', durationMs: 11 })), cancelled);
});

// Root closure must retain already reported provider results and prior Failed/Blocked/Not run classifications.
test('terminal settlement preserves closed request data and prior fail-fast states', () => {
    let reported = api.reduceRunState(activeRequestState(), event(6, 'request-settled', { address: address('active', ['instance']), attempt: 1, status: 'completed', elapsedMs: 7, durationMs: 2, usage: { totalTokens: 13 }, finish: 'stop' }));
    const failed = api.reduceRunState(reported, event(9, 'run-settled', { status: 'failed', elapsedMs: 25 }));
    assert.equal(failed.nodes[1].status, 'failed'); assert.equal(failed.nodes[1].request, reported.nodes[1].request);
    assert.equal(failed.nodes[1].request.durationMs, 2); assert.deepEqual(failed.nodes[1].request.usage, { totalTokens: 13 }); assert.equal(failed.nodes[1].request.finish, 'stop');
    const failFast = api.reduceRunState(activeRequestState(), event(6, 'node-settled', { address: address('active', ['instance']), status: 'failed', elapsedMs: 8 }));
    for (const status of ['failed', 'cancelled']) {
        const final = api.reduceRunState(failFast, event(9, 'run-settled', { status, elapsedMs: 25 }));
        assert.deepEqual(final.nodes.map(node => node.status), ['completed', 'failed', 'blocked', 'not-run', 'not-run']);
        assert.equal(final.nodes[1], failFast.nodes[1]); assert.equal(final.nodes[2], failFast.nodes[2]);
        assert.equal(final.nodes[1].request.status, 'failed'); assert.equal(final.nodes[1].request.durationMs, 3);
        assert.equal(final.nodes[1].settledAt, 8);
    }
});
