import assert from 'node:assert/strict';
import { test } from 'node:test';
const api = await import('../src/workflow/introspection/contracts.js').catch(() => ({}));
const scope = { chatId: 'chat-1', actorId: 'npc-1' };
const ref = { id: 'event-1', revision: 'rev-1' };

test('actor state is a detached versioned snapshot with separate enduring and temporary fields', () => {
    assert.equal(typeof api.createActorState, 'function');
    const initial = { beliefs: [{ id: 'trust', text: 'Trust remains guarded', classification: 'interpretation', sourceRefs: [] }] };
    const result = api.createActorState(scope, { id: 'store-1', version: 0 }, initial);
    assert.equal(result.ok, true);
    assert.equal(result.data.kind, 'data');
    assert.deepEqual(result.data.value.scope, scope);
    assert.equal(result.data.value.payload.beliefs[0].text, initial.beliefs[0].text);
    assert.deepEqual(result.data.value.payload.traits, []);
    assert.deepEqual(result.data.value.payload.conditions, []);
    assert.deepEqual(result.data.value.payload.values, {});
    initial.beliefs[0].text = 'changed';
    assert.equal(result.data.value.payload.beliefs[0].text, 'Trust remains guarded');
    assert.ok(Object.isFrozen(result.data.value.payload));
});

test('plain record parsing rejects getters without executing them', () => {
    let accessed = false;
    const record = { kind: 'data', get value() { accessed = true; return {}; } };
    assert.equal(api.parseRecord(record).ok, false);
    assert.equal(accessed, false);
});

test('state proposals are pure, identity checked and cannot rewrite enduring traits', () => {
    const state = api.createActorState(scope, { id: 'store-1', version: 0 }).data;
    const proposal = api.makeRecord('state-proposal', state.value, {
        changes: [{ op: 'upsert', collection: 'conditions', item: { id: 'anger', text: 'Immediate anger eased', classification: 'interpretation', sourceRefs: [ref] } }],
        values: {}, curves: {}, tracks: {},
    }, [ref]).data;
    const result = api.applyStateProposal(state, proposal);
    assert.equal(result.ok, true);
    assert.equal(result.data.value.payload.conditions[0].text, 'Immediate anger eased');
    assert.deepEqual(state.value.payload.conditions, []);
    const mismatched = structuredClone(proposal); mismatched.value.scope.actorId = 'other';
    assert.equal(api.applyStateProposal(state, mismatched).ok, false);
    const bad = structuredClone(proposal); bad.value.payload.changes[0].collection = 'traits';
    assert.equal(api.applyStateProposal(state, bad).ok, false);
});

test('evidence membership requires both source identity and revision', () => {
    assert.equal(api.validateEvidence([ref], [ref]).ok, true);
    assert.equal(api.validateEvidence([{ ...ref, revision: 'changed' }], [ref]).ok, false);
});

test('record boundaries reject oversized collections and unsafe versions', () => {
    assert.equal(api.createActorState(scope, { id: 's', version: -1 }).ok, false);
    assert.equal(api.createActorState(scope, { id: 's', version: 0 }, { beliefs: Array.from({ length: 65 }, (_, n) => ({ id: String(n), text: 'x', classification: 'interpretation', sourceRefs: [] })) }).ok, false);
});
