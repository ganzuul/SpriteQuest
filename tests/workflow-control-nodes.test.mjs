import assert from 'node:assert/strict';
import test from 'node:test';
import { executeControl, describeControl } from '../src/workflow/operations/control-nodes.js';

const data = value => ({ kind: 'data', value });
const helper = { id: 'ordered-helper', version: 1, semanticHash: 'sha256:' + 'a'.repeat(64) };
test('an optional skipped contribution completes Collect with an empty ordered collection', async () => {
    const result = await executeControl({ type: 'workflow', operation: 'collect', inputs: [{ id: 'optional', label: 'Optional', required: false }] }, {}, { inputStates: { optional: { status: 'skipped' } } });
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.deepEqual(result.outputs.out, data([]));
});

test('Join keeps the base Draft when its declared optional revision was skipped', async () => {
    const draft = { kind: 'draft', text: 'Base', source: { originalText: 'Base' } };
    const result = await executeControl({ type: 'workflow', operation: 'join', artifactKind: 'draft', inputs: [{ id: 'base', label: 'Base', required: true }, { id: 'revision', label: 'Revision', required: false }] }, { base: draft }, { inputStates: { base: { status: 'completed' }, revision: { status: 'skipped' } } });
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.deepEqual(result.outputs.out, draft);
});

test('unresolved optional inputs hold Join rather than silently selecting the base', async () => {
    const result = await executeControl({ type: 'workflow', operation: 'join', inputs: [{ id: 'base', label: 'Base', required: true }, { id: 'other', label: 'Other', required: false }] }, { base: data(1) }, { inputStates: { base: { status: 'completed' }, other: { status: 'unresolved', reason: { code: 'UNCERTAIN', message: 'Needs review' } } } });
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.equal(result.outputStates.out.status, 'unresolved');
    assert.equal(result.outputs, undefined);
});

test('Confidence Gate preserves the decision and sends a middle-band metric to unresolved', async () => {
    const decision = { answers: { kiss: { noul: 0.5 } }, provider: 'typed-fixture' };
    const result = await executeControl({ type: 'workflow', operation: 'confidence-gate', metricPath: ['answers','kiss','noul'], acceptMin: 0.8, rejectMax: 0.2 }, { in: data(decision) });
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.deepEqual(result.outputs.unresolved.value.decision, decision);
    assert.equal(result.outputs.unresolved.value.accepted, undefined);
    assert.equal(result.outputStates.accepted.status, 'skipped');
    assert.equal(result.outputStates.rejected.status, 'skipped');
});

test('Confidence Gate uses the authored metric path instead of inventing provider confidence', async () => {
    const decision = { choice: 'wand', act_probability: 0.99 };
    const result = await executeControl({ type: 'workflow', operation: 'confidence-gate', metricPath: ['taskProbability'], acceptMin: 0.8, rejectMax: 0.2 }, { in: data(decision) });
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.equal(result.outputs.unresolved.value.metric, null);
    assert.deepEqual(result.outputs.unresolved.value.decision, decision);
});

test('For Each processes ordered items against the previous checked projected state', async () => {
    const seen = [];
    const result = await executeControl({ type: 'workflow', operation: 'for-each', helper, mode: 'projected-state', limit: 3, requestBoundPerIteration: 0 }, { in: data([2, 3]), state: data({ total: 0 }) }, { iterateHelper: async invocation => {
        seen.push([invocation.index, invocation.projectedState.total]);
        const total = invocation.projectedState.total + invocation.item;
        return { ok: true, artifact: data(total), projectedState: { total } };
    } });
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.deepEqual(seen, [[0, 0], [1, 2]]);
    assert.deepEqual(result.outputs.out, data([2, 5]));
    assert.deepEqual(result.outputs.state, data({ total: 5 }));
});

test('an empty collection validates its pinned helper and completes without invoking it', async () => {
    const result = await executeControl({ type: 'workflow', operation: 'for-each', helper, limit: 3, requestBoundPerIteration: 0 }, { in: data([]) }, { iterateHelper: () => { throw new Error('No work'); } });
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.deepEqual(result.outputs.out, data([]));
    const invalid = await executeControl({ type: 'workflow', operation: 'for-each', helper: { ...helper, semanticHash: 'arbitrary' } }, { in: data([]) });
    assert.equal(invalid.ok, false);
});

test('For Each rejects excess items and unbounded or executable helper settings', async () => {
    const excess = await executeControl({ type: 'workflow', operation: 'for-each', helper, limit: 1 }, { in: data([1, 2]) });
    assert.equal(excess.error.code, 'ITERATION_LIMIT');
    assert.equal(describeControl({ type: 'workflow', operation: 'for-each', helper: () => {}, limit: 129 }).ok, false);
});

test('For Each does not publish partial results after helper failure or cancellation', async () => {
    const failed = await executeControl({ type: 'workflow', operation: 'for-each', helper }, { in: data([1, 2]) }, { iterateHelper: async ({ index }) => index ? { ok: false, error: { code: 'PROVIDER_FAILED', message: 'Failed' } } : { ok: true, artifact: data(1) } });
    assert.equal(failed.error.code, 'PROVIDER_FAILED');
    assert.equal(failed.outputs, undefined);
    const controller = new AbortController();
    const cancelled = await executeControl({ type: 'workflow', operation: 'for-each', helper }, { in: data([1]) }, { signal: controller.signal, iterateHelper: async () => { controller.abort(); return { ok: true, artifact: data('late') }; } });
    assert.equal(cancelled.error.code, 'ABORTED');
    assert.equal(cancelled.outputs, undefined);
});

test('For Each closes saved request capabilities after each iteration',async()=>{
    let saved,calls=0;
    const result=await executeControl({type:'workflow',operation:'for-each',helper,requestBoundPerIteration:1},{in:data([1])},{request:async()=>{calls++;return {ok:true,data:{text:'one',finish:'stop'}};},iterateHelper:async(_,ports)=>{saved=ports.request;return {ok:true,artifact:data(1)};}});
    assert.equal(result.ok,true,JSON.stringify(result.error));
    const late=await saved({messages:[],maxTokens:1});
    assert.equal(late.ok,false);
    assert.equal(late.error.code,'ITERATION_CLOSED');assert.equal(calls,0);
});

test('For Each rejects concurrent helper requests before dispatching a second request',async()=>{
    let calls=0;
    const result=await executeControl({type:'workflow',operation:'for-each',helper,requestBoundPerIteration:2},{in:data([1])},{request:async()=>{calls++;await new Promise(resolve=>setImmediate(resolve));return {ok:true,data:{text:'one',finish:'stop'}};},iterateHelper:async(_, {request})=>{await Promise.all([request({messages:[],maxTokens:1}),request({messages:[],maxTokens:1})]);return {ok:true,artifact:data('ignored')};}});
    assert.equal(result.ok,false);
    assert.equal(result.error.code,'ITERATION_REQUEST_IN_PROGRESS');assert.equal(calls,1);assert.equal(result.outputs,undefined);
});

test('Condition compares object content independently of JSON property order',async()=>{
    const result=await executeControl({type:'workflow',operation:'condition',value:{a:1,b:2}},{in:data({b:2,a:1})});
    assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(result.outputs.out.value.accepted,true);
});
