import test from 'node:test';
import assert from 'node:assert/strict';
import { liveCaseSpec } from '../tools/roleplay-soak-cases.mjs';
import { createExampleFixture, recordedArtifact, response, verifyRun } from './helpers/workflow-example-fixtures.mjs';

const textOf = artifact => artifact.messages.map(message => message.text).join('\n');

async function runCase(number, output) {
    const spec = liveCaseSpec(number, 'pre');
    const f = createExampleFixture(spec.graph, { ...spec.options, request: async () => response(output) });
    await spec.seed(f);
    const result = await f.pre();
    verifyRun(f, result, 1);
    return { f, result };
}

test('live example 18 supplies Sol taking Mira’s tools without settling her reaction', async () => {
    const { f, result } = await runCase(18, {
        brief: 'Interpretation: unsolicited help may conflict with Mira’s independence.',
        behaviorHints: ['Possibility: Mira asks Sol to agree on one part of the repair.'],
    });
    const context = recordedArtifact(result, 'pre-scene');
    const card = context.messages.find(message => message.id === 'character:description');
    assert.match(card.text, /independence and practical cooperation/);
    assert.match(card.text, /dislikes having decisions made for her/);
    const chat = context.messages.filter(message => message.source !== 'character');
    assert.match(textOf({ messages: chat }), /Sol takes Mira's tools and says he will finish the repair for her without asking/);
    assert.match(textOf({ messages: chat }), /Mira has not yet answered/);
    assert.doesNotMatch(textOf({ messages: chat }), /Mira (?:accepts|accepted|agrees|agreed)|repair is finished/);
    const supplied = JSON.parse(f.requests[0].messages[1].content);
    assert.deepEqual(supplied.context.messages, context.messages);
    assert.equal(supplied.state.scope.actorId, 'character:mira.png');
    assert.equal(f.memorySaves(), 0);
});

test('live example 19 supplies the archive-door question with Rin’s witnessed-fact limit', async () => {
    const { f, result } = await runCase(19, {
        brief: 'Interpretation: Rin’s commitments remain in tension.',
        conflicts: ['Interpretation: protecting Sol conflicts with reporting only witnessed facts.'],
        behaviorHints: ['Possibility: Rin limits her answer to Sol’s presence.'],
    });
    const context = recordedArtifact(result, 'pre-scene');
    const card = context.messages.find(message => message.id === 'character:description');
    assert.match(card.text, /protect Sol/);
    assert.match(card.text, /promised Mira.*report what she witnessed/);
    const chatText = textOf({ messages: context.messages.filter(message => message.source !== 'character') });
    assert.match(chatText, /Mira asks Rin who opened the archive door/);
    assert.match(chatText, /Rin saw Sol present.*did not see the lock opened/);
    assert.match(chatText, /Rin has not answered/);
    assert.doesNotMatch(chatText, /Sol (?:opened the lock|is guilty|is innocent)|Rin (?:lies|confesses|breaks her promise)/);
    const supplied = JSON.parse(f.requests[0].messages[1].content);
    assert.deepEqual(supplied.context.messages, context.messages);
    assert.equal(supplied.state.scope.actorId, 'character:rin.png');
    assert.equal(f.memorySaves(), 0);
});

test('live example 28 retains the sealed-letter literal pin and unresolved ferry-gate evidence', async () => {
    const { f, result } = await runCase(28, 'Mira may ask the inspector about the gate while keeping the letter sealed. Leave the player’s next action open.');
    const source = recordedArtifact(result, 'source');
    assert.match(textOf(source), /The ferry is delayed/);
    assert.match(textOf(source), /The inspector keeps the gate closed/);
    assert.match(textOf(source), /Mira holds the sealed letter\. The unopened letter remains intact\./);
    const selected = recordedArtifact(result, 'focus', 'out', ['lens']);
    assert.ok(selected.messages.length < selected.original.length, 'The live fixture must exercise selection, not only passthrough.');
    for (const pin of ['sealed letter', 'gate']) {
        assert.ok(selected.messages.some(message => message.text.includes(pin)), `Missing retained literal pin: ${pin}`);
    }
    assert.match(textOf(selected), /The unopened letter remains intact/);
    assert.match(textOf(selected), /The ferry is delayed/);
    assert.match(textOf(selected), /Rin left to check the harbor/);
    assert.match(textOf(selected), /What can Mira do while we wait\?/);
    assert.doesNotMatch(textOf(selected), /Old harbor discussion 0/);
    assert.match(f.requests[0].messages[1].content, /sealed letter/);
    assert.equal(f.memorySaves(), 0);
});
