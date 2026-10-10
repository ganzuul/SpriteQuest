import test from 'node:test';
import assert from 'node:assert/strict';
import {
    accepted, examplePhases, graphBy, createExampleFixture, completedMessage, response,
    reflection, upsert, sourceRefs, seedMemory, currentMemory, guidance, recordedArtifact,
    verifyRun, assertPhaseCoverage,
} from './helpers/workflow-example-fixtures.mjs';

const executed = new Set(), definitions = new Set();
const run = (f, result, calls) => { verifyRun(f, result, calls); executed.add(f.graph.id); return result; };
function definitionRan(f, instanceId) {
    const instance = f.graph.nodes[instanceId];
    assert.ok(f.stages.some(stage => stage.address.instancePath.includes(instanceId)), `Pinned ${instanceId} must execute internally`);
    definitions.add(instance.definition.id);
}

test('example 28: exposed lens keeps its 720-token target, recent two, exact pins and one bounded Analysis call', async () => {
    const graph = graphBy(28), lens = graph.nodes.lens;
    assert.deepEqual(lens.parameterOverrides.pins, ['sealed letter', 'gate']);
    assert.equal(lens.parameterOverrides.targetTokens, 720); assert.equal(lens.parameterOverrides.keepRecent, 2);
    const chat = Array.from({ length: 6 }, (_, index) => completedMessage(`Old quay detail ${index}: ${'Repeated atmosphere without new causal evidence. '.repeat(30)}`, index, true));
    chat.push(completedMessage('The inspector keeps the gate closed. Mira holds the sealed letter.', 6, true), completedMessage('Mira waits beside the inspector.', 7), completedMessage('Why is the inspection still unresolved?', 8, true));
    const expected = 'Mira asks the inspector what remains to be checked at the gate. Keep the sealed letter closed and stop for the player’s answer.';
    const f = createExampleFixture(graph, { chat, request: async (input, stage) => {
        assert.equal(stage.node.id, 'plan'); assert.deepEqual(stage.address.instancePath, []);
        assert.equal(input.binding.profileId, 'fixtureAnalysis'); assert.equal(input.maxTokens, 4096);
        assert.ok(input.messages[1].content.includes(graph.nodes.plan.instructions));
        assert.match(input.messages[1].content, /sealed letter/); assert.match(input.messages[1].content, /gate/);
        for (const text of chat.slice(-2).map(message => message.mes)) assert.ok(input.messages[1].content.includes(text));
        assert.equal(input.messages[1].content.includes('Old quay detail 0'), false);
        return response(expected);
    } });
    const result = run(f, await f.pre(), 1);
    const effective = f.stages.find(stage => stage.node.id === 'focus').node;
    assert.equal(effective.targetTokens, 720); assert.equal(effective.keepRecent, 2); assert.deepEqual(effective.pins, ['sealed letter', 'gate']);
    const selected = recordedArtifact(result, 'focus', 'out', ['lens']);
    assert.ok(selected.messages.length < selected.original.length);
    for (const pin of lens.parameterOverrides.pins) assert.ok(selected.messages.some(message => message.text.includes(pin)));
    for (const text of chat.slice(-2).map(message => message.mes)) assert.ok(selected.messages.some(message => message.text === text));
    assert.equal(guidance(f.context), expected); assert.equal(f.memorySaves(), 0); definitionRan(f, 'lens');
});

test('example 29: reaction definition uses its exposed authored instructions and Analysis override, then deterministic behavior', async () => {
    const graph = graphBy(29), reaction = graph.nodes.reaction;
    const payload = reflection({ brief: 'Interpretation: curiosity remains bounded by Mira’s promise.', behaviorHints: ['Possibility: Mira studies the seal and asks permission without opening the letter.'] });
    const f = createExampleFixture(graph, { character: { description: 'Mira promised not to break the letter’s seal; she is curious about it.' }, request: async (input, stage) => {
        assert.equal(stage.node.id, 'reflect'); assert.deepEqual(stage.address.instancePath, ['reaction']);
        assert.equal(input.maxTokens, 2048); assert.equal(input.binding.profileId, 'fixtureAnalysis');
        assert.ok(input.messages[0].content.includes(reaction.parameterOverrides.instructions));
        const supplied = JSON.parse(input.messages[1].content);
        assert.equal(supplied.state.scope.actorId, 'character:mira.png');
        assert.ok(supplied.context.messages.some(message => message.text.includes('promised not to break')));
        return response(payload);
    } });
    assert.deepEqual(reaction.roleOverrides.Analysis, graph.roles.Analysis);
    const result = run(f, await f.pre(), 1);
    assert.deepEqual(recordedArtifact(result, 'reflect', 'out', ['reaction']).value.payload, payload);
    assert.equal(guidance(f.context), payload.behaviorHints.join('\n'));
    assert.equal(f.memorySaves(), 0); definitionRan(f, 'reaction');
});

test('example 30 Pre: addressed Character and Scene appraisals retain distinct arrays, conflicts and matching scope/version', async () => {
    const graph = graphBy(30, 'pre');
    const f = createExampleFixture(graph, { character: { description: 'Mira is practical and guarded. One fulfilled promise does not erase disappointment.' }, chat: [
        completedMessage('Sol previously failed to return Mira’s chart.', 0, true),
        completedMessage('Sol now returns the chart as promised.', 1),
        completedMessage('The ferry is delayed; Mira holds the unopened letter.', 2, true),
        completedMessage('Rin left to check the harbor and has not returned.', 3),
    ] });
    await seedMemory(f, supplied => [
        upsert('relationships', 'guarded-reliability', 'Interpretation: Mira sees possible reliability after a setback, but remains guarded.', sourceRefs(supplied.events.slice(0, 2)), 'interpretation'),
        upsert('episodes', 'chart-setback', supplied.events[0].text, sourceRefs([supplied.events[0]])),
        upsert('episodes', 'chart-return', supplied.events[1].text, sourceRefs([supplied.events[1]])),
    ]);
    const state = await currentMemory(f), writes = f.memorySaves(), suppliedStates = [], suppliedEpisodes = [];
    const character = reflection({
        brief: 'Interpretation: Mira recognizes the kept promise while remaining guarded.',
        conflicts: ['Interpretation: a cautious opening conflicts with the earlier disappointment.'],
        behaviorHints: ['Possibility: offer Sol one small reversible task.'],
        recalledEpisodeIds: ['chart-setback', 'chart-return'],
    });
    const scene = reflection({
        brief: 'Observation: ferry delayed, letter unopened; Rin’s inquiry is unresolved.',
        conflicts: ['Observation: no settled return supports completing Rin’s inquiry.'],
        sceneChanges: ['Observation: the ferry remains delayed.'],
        attentionHints: ['Possibility: ask what the inspector still needs, keeping the letter unopened.'],
        behaviorHints: [], recalledEpisodeIds: ['chart-return'],
    });
    f.setRequest(async (input, stage) => {
        assert.equal(stage.node.id, 'reflect'); assert.equal(input.maxTokens, stage.address.instancePath[0] === 'pre-scene' ? 4096 : 2048);
        assert.equal(input.binding.profileId, 'fixtureAnalysis');
        assert.ok(input.messages[0].content.includes(stage.node.instructions));
        const supplied = JSON.parse(input.messages[1].content);
        suppliedStates.push(supplied.state); suppliedEpisodes.push(supplied.episodes);
        assert.deepEqual(supplied.state, state); assert.deepEqual(supplied.episodes.map(episode => episode.id), ['chart-setback', 'chart-return']);
        if (stage.address.instancePath[0] === 'pre-character') { assert.equal(stage.node.mode, 'character'); return response(character); }
        assert.deepEqual(stage.address.instancePath, ['pre-scene']); assert.equal(stage.node.mode, 'scene'); return response(scene);
    });
    const result = run(f, await f.pre(), 2);
    assert.equal(suppliedStates.length, 2); assert.deepEqual(suppliedStates[0], suppliedStates[1]); assert.deepEqual(suppliedEpisodes[0], suppliedEpisodes[1]);
    const characterArtifact = recordedArtifact(result, 'reflect', 'out', ['pre-character']).value;
    const sceneArtifact = recordedArtifact(result, 'reflect', 'out', ['pre-scene']).value;
    assert.deepEqual(characterArtifact.payload, character); assert.deepEqual(sceneArtifact.payload, scene);
    assert.deepEqual(characterArtifact.scope, sceneArtifact.scope); assert.deepEqual(characterArtifact.store, sceneArtifact.store);
    assert.equal(characterArtifact.store.version, 1);
    const expected = `CHARACTER\nCharacter appraisal: ${character.brief}\nOptions: ${JSON.stringify(character.behaviorHints)}\nConflicts: ${JSON.stringify(character.conflicts)}\nEpisode IDs: ${JSON.stringify(character.recalledEpisodeIds)}\n\nSCENE\nScene appraisal: ${scene.brief}\nObserved changes: ${JSON.stringify(scene.sceneChanges)}\nAttention: ${JSON.stringify(scene.attentionHints)}\nConflicts: ${JSON.stringify(scene.conflicts)}\n\nPreserve settled scene facts; character interpretations remain tentative. If sections conflict, keep uncertainty visible and leave player decisions open.`;
    assert.equal(guidance(f.context), expected);
    assert.equal(recordedArtifact(result, 'render', 'out', ['pre-character']).kind, 'text');
    assert.equal(recordedArtifact(result, 'render', 'out', ['pre-scene']).kind, 'text');
    assert.equal(recordedArtifact(result, 'compose', 'out', ['pre-brief']).kind, 'guidance');
    assert.equal(f.memorySaves(), writes); assert.deepEqual(await currentMemory(f), state);
    for (const id of ['pre-character', 'pre-scene', 'pre-brief']) definitionRan(f, id);
});

test('example 30 Post: dialogue-only voice has one 4096-token Prose request, exact narration and explicit Apply', async () => {
    const graph = graphBy(30, 'post');
    const original = 'Mira rested the unopened letter on the table. Sol waited at the gate. "You kept your promise this time. What happens next?" Mira said.';
    const candidate = 'Mira rested the unopened letter on the table. Sol waited at the gate. "You kept this one. Tell me what happens next." Mira said.';
    const f = createExampleFixture(graph, { text: original, request: async (input, stage) => {
        assert.equal(stage.node.id, 'voice'); assert.deepEqual(stage.address.instancePath, ['post-voice']);
        assert.equal(input.binding.profileId, 'fixtureProse'); assert.equal(input.maxTokens, 4096);
        const supplied = JSON.parse(input.messages[1].content);
        assert.equal(supplied.original, original); assert.equal(supplied.controls.scope, 'dialogue'); assert.equal(supplied.controls.strength, 'light');
        assert.deepEqual(supplied.controls.protectedLiterals, ['Mira', 'Sol']);
        assert.equal(supplied.reference.kind, 'text'); assert.equal(supplied.reference.text, graph.nodes['post-reference'].text);
        assert.equal(supplied.windows.length, 1); assert.equal(supplied.windows[0].text, 'You kept your promise this time. What happens next?');
        return response(candidate);
    } });
    assert.deepEqual(graph.nodes['post-voice'].roleOverrides.Prose, graph.roles.Prose);
    const result = run(f, await f.post(), 1);
    assert.equal(f.message.mes, original); assert.equal(result.reviewHandles.length, 1);
    assert.equal(recordedArtifact(result, 'post-review').text, candidate);
    accepted(await f.controller.apply(result.reviewHandles[0]));
    assert.equal(f.message.mes, candidate); assert.equal(f.message.swipes[0], original);
    assert.equal(candidate.split('"')[0], original.split('"')[0]); assert.equal(candidate.split('"')[2], original.split('"')[2]);
    assert.equal(f.memorySaves(), 0); definitionRan(f, 'post-voice');
});

test('native acceptance inventory covers 30 catalog IDs, 37 phases and all six executed pinned definitions', () => {
    assert.equal(examplePhases.length, 37); assert.equal(new Set(examplePhases.map(entry => entry.id)).size, 30);
    assert.deepEqual([...new Set(examplePhases.map(entry => entry.number))].sort((a, b) => a - b), Array.from({ length: 30 }, (_, i) => i + 1));
    assertPhaseCoverage(executed, 28, 30);
    const expectedDefinitions = [28, 29, 30].flatMap(number => examplePhases.filter(entry => entry.number === number).flatMap(entry => Object.values(graphBy(number, entry.phase).definitions).map(definition => definition.id)));
    assert.equal(expectedDefinitions.length, 6); assert.deepEqual([...definitions].sort(), expectedDefinitions.sort());
});
