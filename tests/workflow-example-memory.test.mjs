import test from 'node:test';
import assert from 'node:assert/strict';
import {
    graphBy, createExampleFixture, completedMessage, response, reflection,
    proposal, upsert, sourceRefs, guidance, seedMemory, currentMemory, recordedArtifact,
    verifyRun, assertPhaseCoverage,
} from './helpers/workflow-example-fixtures.mjs';

const executed = new Set();
const run = (f, result, calls) => { verifyRun(f, result, calls); executed.add(f.graph.id); return result; };
function analysisInput(input, stage) {
    assert.equal(input.binding.profileId, 'fixtureAnalysis');
    assert.equal(input.maxTokens, stage.node.maxTokens);
    const caps = {
        'example-persistent-conditions-post': 4096, 'example-persistent-conditions-pre': 2048,
        'example-promise-callback-post': 4096, 'example-sensory-memory-pre': 2048,
        'example-anger-and-trust-post': 4096, 'example-anger-and-trust-pre': 2048,
        'example-earned-trust-post': 4096, 'example-earned-trust-pre': 2048,
        'example-offscreen-agenda-post': 4096, 'example-offscreen-agenda-pre': 4096,
        'example-inner-voice-pre': 2048,
    };
    assert.equal(input.maxTokens, caps[stage.address.workflowId]);
    assert.ok(input.messages[0].content.includes(stage.node.instructions));
    return JSON.parse(input.messages[1].content);
}
async function capture(f, graph, makeChanges) {
    f.setRequest(async (input, stage) => {
        assert.equal(stage.node.operation, 'internalize');
        const supplied = analysisInput(input, stage);
        assert.ok(supplied.events.length);
        for (const event of supplied.events) {
            assert.match(event.id, /^chat:\d+$/); assert.match(event.revision, /^[a-f\d]{64}$/);
            assert.equal(event.text, f.context.chat[Number(event.id.slice(5))].mes);
            assert.equal(event.settled, true);
        }
        return response(proposal(makeChanges(supplied)));
    });
    const result = await f.post(graph);
    run(f, result, 1);
    assert.equal(result.memoryCommit.applied, true); assert.equal(result.memoryCommit.acknowledged, true);
    return result;
}
async function appraise(f, graph, makeReflection) {
    f.setRequest(async (input, stage) => response(makeReflection(analysisInput(input, stage))));
    return run(f, await f.pre(graph), 1);
}
const stateItems = (state, collection) => state.payload[collection];

test('example 20: settled injury persists into another scene and Pre proposes movement limits without healing', async () => {
    const post = graphBy(20, 'post'), pre = graphBy(20, 'pre');
    const f = createExampleFixture(post, { character: { avatar: 'rin.png', name: 'Rin', description: 'Rin prefers practical movement and retains established physical limits.' }, chat: [completedMessage('Rin twists her ankle on the quay.', 0, true), completedMessage('Rin favors that ankle and asks for support.', 1)] });
    let injuryRefs;
    await capture(f, post, supplied => {
        injuryRefs = sourceRefs(supplied.events);
        return [upsert('conditions', 'ankle-limit', 'Rin favors the injured ankle and needs support.', injuryRefs)];
    });
    f.append('In the ferry cabin, the narrow steps lead to the deck.', true);
    const saved = await currentMemory(f), metadata = structuredClone(f.context.chatMetadata), writes = f.memorySaves();
    const hints = ['Possibility: Rin asks for support or takes a less demanding route while favoring the ankle.'];
    const result = await appraise(f, pre, supplied => {
        assert.equal(supplied.state.store.version, 1); assert.equal(supplied.state.scope.actorId, 'character:rin.png');
        assert.deepEqual(stateItems(supplied.state, 'conditions')[0].sourceRefs, injuryRefs);
        assert.ok(supplied.context.messages.some(message => message.text.includes('ferry cabin')));
        return reflection({ brief: 'Observation: stored ankle limits remain; no recovery event exists.', behaviorHints: hints });
    });
    assert.equal(guidance(f.context), hints.join('\n'));
    assert.deepEqual(recordedArtifact(result, 'pre-state').value, saved);
    assert.deepEqual(await currentMemory(f), saved); assert.deepEqual(f.context.chatMetadata, metadata); assert.equal(f.memorySaves(), writes);
});

test('example 21: a captured ferry promise is recalled nonemptily, while an unrelated query returns no episode', async () => {
    const post = graphBy(21, 'post'), pre = graphBy(21, 'pre');
    const f = createExampleFixture(post, { chat: [completedMessage('Will you bring the ferry before dawn?', 0, true), completedMessage('Mira promises to bring the ferry before dawn, without claiming it has arrived.', 1)] });
    let refs;
    await capture(f, post, supplied => {
        refs = sourceRefs(supplied.events);
        return [upsert('episodes', 'ferry-promise', 'Mira promised to bring the ferry before dawn; arrival remains unresolved.', refs)];
    });
    const writes = f.memorySaves();
    const result = run(f, await f.pre(pre), 0);
    const episodes = recordedArtifact(result, 'pre-recall').value.payload.episodes;
    assert.deepEqual(episodes.map(episode => episode.id), ['ferry-promise']); assert.deepEqual(episodes[0].sourceRefs, refs);
    assert.ok(guidance(f.context).includes('ferry-promise')); assert.match(guidance(f.context), /arrival remains unresolved/);
    const negative = graphBy(21, 'pre'); negative.nodes['pre-recall'].query = 'desert caravan';
    f.controller.cancel('The first fixture generation has settled.');
    const empty = run(f, await f.pre(negative), 0);
    assert.deepEqual(recordedArtifact(empty, 'pre-recall').value.payload.episodes, []);
    assert.match(guidance(f.context), /Actor episodes: \[\]/);
    assert.equal(f.memorySaves(), writes);
});

test('example 22: supported sensory episode recalls its exact ID and a nonmatch stays with present evidence', async () => {
    const f = createExampleFixture(graphBy(22), { chat: [completedMessage('Mira remembers waiting beside her father at the harbor lamp; its lamp-oil smell was distinct.', 0, true), completedMessage('The ferry cabin now smells of lamp-oil.', 1)] });
    await seedMemory(f, supplied => [upsert('episodes', 'harbor-lamp-memory', supplied.events[0].text, sourceRefs([supplied.events[0]]))]);
    const writes = f.memorySaves();
    const result = await appraise(f, graphBy(22), supplied => {
        assert.deepEqual(supplied.episodes.map(episode => episode.id), ['harbor-lamp-memory']);
        assert.match(supplied.episodes[0].text, /lamp-oil/);
        return reflection({ recalls: ['Recalled evidence: the harbor lamp and its oil smell.'], recalledEpisodeIds: ['harbor-lamp-memory'], attentionHints: ['Possibility: let the lamp-oil smell color Mira’s pause, then return to the present cabin.'] });
    });
    assert.deepEqual(recordedArtifact(result, 'pre-reflect').value.payload.recalledEpisodeIds, ['harbor-lamp-memory']);
    assert.match(guidance(f.context), /lamp-oil smell/);
    const other = createExampleFixture(graphBy(22), { chat: [completedMessage('Mira bought bread at the winter market.', 0, true), completedMessage('The cabin now smells of lamp-oil while Mira waits to board.', 1)] });
    await seedMemory(other, supplied => [upsert('episodes', 'winter-market', supplied.events[0].text, sourceRefs([supplied.events[0]]))]);
    const nonmatch = await appraise(other, graphBy(22), supplied => {
        assert.equal(supplied.episodes.some(episode => episode.text.includes('lamp-oil')), false);
        return reflection({ recalls: [], recalledEpisodeIds: [], attentionHints: ['Observation: remain with the present lamp-oil smell; no supplied episode supports a recollection.'] });
    });
    assert.deepEqual(recordedArtifact(nonmatch, 'pre-reflect').value.payload.recalledEpisodeIds, []);
    assert.match(guidance(other.context), /no supplied episode supports/); assert.equal(f.memorySaves(), writes);
});

test('example 23: accepted apology eases temporary anger, retains guarded trust and Run to here writes nothing', async () => {
    const post = graphBy(23, 'post'), pre = graphBy(23, 'pre');
    const f = createExampleFixture(post, { chat: [completedMessage('Sol handled Mira’s letters after she asked him not to.', 0, true), completedMessage('Mira is angry and says she will keep her letters out of his reach.', 1)] });
    await seedMemory(f, supplied => {
        const refs = sourceRefs(supplied.events);
        return [upsert('conditions', 'temporary-anger', 'Mira is temporarily angry about the letter boundary.', refs), upsert('beliefs', 'guarded-trust', 'Mira remains guarded about Sol handling her letters.', refs, 'interpretation')];
    });
    f.append('Sol apologizes for handling the letters.', true); f.append('Mira accepts the apology but asks Sol to leave her letters alone.');
    const before = await currentMemory(f), guarded = before.payload.beliefs[0], writes = f.memorySaves();
    f.setGraph(post);
    f.setRequest(async (input, stage) => {
        const supplied = analysisInput(input, stage), recent = supplied.events.slice(-2);
        assert.match(recent[0].text, /apologizes/); assert.match(recent[1].text, /accepts the apology/);
        return response(proposal([{ op: 'remove', collection: 'conditions', id: 'temporary-anger' }]));
    });
    const target = { kind: 'terminal', address: { workflowId: post.id, instancePath: [], nodeId: 'post-commit' } };
    verifyRun(f, await f.controller.runTarget(post, target), 1);
    assert.equal(f.memorySaves(), writes); assert.deepEqual(await currentMemory(f), before);
    run(f, await f.post(post), 1);
    const after = await currentMemory(f);
    assert.deepEqual(after.payload.conditions, []); assert.deepEqual(after.payload.beliefs, [guarded]);
    assert.deepEqual(after.payload.traits, before.payload.traits);
    const result = await appraise(f, pre, supplied => {
        assert.deepEqual(supplied.state.payload.beliefs, [guarded]); assert.deepEqual(supplied.state.payload.conditions, []);
        return reflection({ behaviorHints: ['Possibility: Mira cooperates quietly while asking Sol to leave her letters alone.', 'Possibility: Mira sorts her own letters and invites Sol to handle the other stack.'] });
    });
    assert.match(guidance(f.context), /leave her letters alone/); assert.equal(recordedArtifact(result, 'pre-reflect').value.store.version, 2);
});

test('example 24: setback and kept promise retain both exact sources, with reliability still tentative', async () => {
    const post = graphBy(24, 'post'), pre = graphBy(24, 'pre');
    const f = createExampleFixture(post, { chat: [completedMessage('Sol previously failed to return the borrowed chart and Mira was disappointed.', 0, true), completedMessage('This time Sol returns the chart exactly as promised.', 1)] });
    let refs;
    await capture(f, post, supplied => {
        refs = sourceRefs(supplied.events);
        return [upsert('episodes', 'chart-setback', supplied.events[0].text, [refs[0]]), upsert('episodes', 'chart-return', supplied.events[1].text, [refs[1]]), upsert('relationships', 'possible-reliability', 'Interpretation: one kept promise after a setback suggests possible reliability, not an established recurrence.', refs, 'interpretation')];
    });
    const state = await currentMemory(f), writes = f.memorySaves();
    assert.deepEqual(state.payload.episodes.flatMap(episode => episode.sourceRefs), refs);
    assert.equal(state.payload.relationships[0].classification, 'interpretation'); assert.deepEqual(state.payload.traits, []);
    const result = await appraise(f, pre, supplied => {
        assert.equal(supplied.state.store.version, 1); assert.deepEqual(supplied.episodes.map(episode => episode.id), ['chart-setback', 'chart-return']);
        assert.deepEqual(supplied.state.payload.relationships[0].sourceRefs, refs);
        return reflection({ recalledEpisodeIds: ['chart-setback', 'chart-return'], behaviorHints: ['Possibility: Mira offers one small reversible task while retaining the previous disappointment.'] });
    });
    assert.match(guidance(f.context), /small reversible task/);
    assert.deepEqual(recordedArtifact(result, 'pre-episodes').value.store, recordedArtifact(result, 'pre-state').value.store);
    assert.equal(f.memorySaves(), writes);
});

test('example 25: counter replay is stable, Pre renders count and edited/deleted counted evidence blocks further writes', async () => {
    for (const mutation of ['edit', 'delete']) {
        const post = graphBy(25, 'post'), pre = graphBy(25, 'pre');
        const f = createExampleFixture(post);
        run(f, await f.post(), 0);
        const first = (await currentMemory(f)).payload.tracks['harbor-pressure'];
        assert.equal(first.count, 2); assert.deepEqual(first.eventIds, ['chat:0', 'chat:1']);
        run(f, await f.post(post), 0);
        assert.equal((await currentMemory(f)).payload.tracks['harbor-pressure'].count, 2);
        f.append('I ask about the gate.', true); run(f, await f.post(post), 0);
        assert.equal((await currentMemory(f)).payload.tracks['harbor-pressure'].count, 3);
        const shown = run(f, await f.pre(pre), 0);
        assert.match(guidance(f.context), /3 distinct eligible public messages/);
        assert.deepEqual(recordedArtifact(shown, 'pre-fields').value.eventIds, ['chat:0', 'chat:1', 'chat:2']);
        const writes = f.memorySaves(), metadata = structuredClone(f.context.chatMetadata);
        if (mutation === 'edit') f.context.chat[0].mes = 'Edited counted message.'; else f.context.chat.splice(0, 1);
        const rejected = await f.post(post);
        assert.equal(rejected.ok, false, `Counted ${mutation} evidence must not silently reconcile`);
        assert.match(rejected.error.code, /EVIDENCE|SOURCE|STALE_INTROSPECTION_STATE/);
        assert.equal(f.memorySaves(), writes); assert.deepEqual(f.context.chatMetadata, metadata); assert.equal(f.requests.length, 0);
    }
});

test('example 26: observed departure seeds an unresolved goal, Pre offers a possibility, and only actual return becomes history', async () => {
    const post = graphBy(26, 'post'), pre = graphBy(26, 'pre');
    const f = createExampleFixture(post, { character: { avatar: 'rin.png', name: 'Rin' }, chat: [completedMessage('The ferry is missing; Rin wants to locate it.', 0, true), completedMessage('Rin leaves to ask the ferry keeper about the missing boat.', 1)] });
    await capture(f, post, supplied => {
        const refs = sourceRefs(supplied.events);
        return [upsert('goals', 'locate-ferry', 'Rin intends to locate the missing ferry; the inquiry is unresolved.', refs), upsert('episodes', 'ferry-inquiry-departure', supplied.events[1].text, [refs[1]])];
    });
    const before = await currentMemory(f), writes = f.memorySaves();
    const result = await appraise(f, pre, supplied => {
        assert.deepEqual(supplied.state.payload.goals, before.payload.goals);
        assert.deepEqual(supplied.episodes.map(episode => episode.id), ['ferry-inquiry-departure']);
        return reflection({ recalledEpisodeIds: ['ferry-inquiry-departure'], attentionHints: ['Possibility: Rin may return to report an unresolved inquiry; no keeper answer or ferry location is established.'] });
    });
    assert.match(guidance(f.context), /^Possibility:/); assert.equal(f.memorySaves(), writes);
    assert.deepEqual(recordedArtifact(result, 'pre-state').value, before);
    f.append('Rin returns and reports that the ferry keeper has not seen the boat.');
    await capture(f, post, supplied => {
        const event = supplied.events.at(-1); assert.match(event.text, /returns and reports/);
        return [upsert('episodes', 'ferry-inquiry-return', 'Rin reported the keeper had not seen the boat; boat location remains unverified.', sourceRefs([event]))];
    });
    const after = await currentMemory(f);
    assert.deepEqual(after.payload.goals, before.payload.goals);
    assert.deepEqual(after.payload.episodes.map(episode => episode.id), ['ferry-inquiry-departure', 'ferry-inquiry-return']);
    assert.match(after.payload.episodes[1].text, /reported.*unverified/); assert.equal(f.memorySaves(), writes + 1);
});

test('example 27: Analysis plus fictional Prose converts labeled inner voice to Guidance without memory writes', async () => {
    const graph = graphBy(27), fictionalText = 'A spare cup. A spare chair. Mira could offer those. One night at a time; that was the useful limit. The old argument still made room in her thoughts, but it did not have to happen again. Hospitality could keep its boundary.';
    const f = createExampleFixture(graph, { character: { description: 'Mira and Eli had an old argument last winter; Mira remains hospitable but wants practical limits.' }, chat: [completedMessage('Eli arrives unexpectedly.', 0, true), completedMessage('Mira says, "Of course you can stay."', 1)], request: async (input, stage) => {
        if (stage.node.operation === 'reflect') {
            const supplied = analysisInput(input, stage); assert.equal(input.maxTokens, 2048);
            assert.ok(supplied.context.messages.some(message => message.text.includes('old argument')));
            return response(reflection({ brief: 'Observation: Mira invites Eli; interpretation: hospitality coexists with apprehension about the old argument.', conflicts: ['Interpretation: hospitality and a wish for practical limits coexist.'] }));
        }
        assert.equal(stage.node.id, 'pre-inner-voice'); assert.equal(input.binding.profileId, 'fixtureProse'); assert.equal(input.maxTokens, 1024);
        assert.match(input.messages[0].content, /fictional inner voice/);
        assert.equal(JSON.parse(input.messages[1].content).assessment.recordType, 'reflection');
        return response(fictionalText);
    } });
    const original = f.message.mes, result = run(f, await f.pre(), 2);
    const fictional = recordedArtifact(result, 'pre-inner-voice');
    assert.equal(fictional.kind, 'text'); assert.equal(fictional.fictional, true); assert.equal(fictional.text, fictionalText);
    assert.ok(guidance(f.context).includes(fictionalText)); assert.match(guidance(f.context), /^Fictional inner voice for Mira/);
    assert.match(guidance(f.context), /Keep this separate from spoken dialogue/);
    assert.equal(f.message.mes, original); assert.equal(f.memorySaves(), 0); assert.deepEqual(f.context.chatMetadata, {});
});

test('memory suite executes all 14 phase packages in examples 20–27', () => assertPhaseCoverage(executed, 20, 27));
