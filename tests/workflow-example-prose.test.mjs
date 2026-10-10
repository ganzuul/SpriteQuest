import test from 'node:test';
import assert from 'node:assert/strict';
import {
    accepted, graphBy, createExampleFixture, completedMessage, response, reflection,
    guidance, recordedArtifact, verifyRun, assertPhaseCoverage, withBrowserWorker,
    upsert, sourceRefs, seedMemory, currentMemory,
} from './helpers/workflow-example-fixtures.mjs';

const executed = new Set();
const run = (f, result, calls) => { verifyRun(f, result, calls); executed.add(f.graph.id); return result; };
const unchanged = (f, original) => { assert.equal(f.message.mes, original); assert.equal(f.memorySaves(), 0); };

for (const [number, expected] of [
    [1, 'At the closed ferry gate, Mira can explain the delay or offer shelter. Keep the unopened letter sealed. End with a question or NPC action that leaves the player free to answer; do not supply the player’s decision.'],
    [3, 'At the ferry gate, preserve the obstacle: closed for inspection. Mira may respond. Leave the player free to wait or ask Mira about the delay.'],
]) test(`example ${number}: native Send publishes exact authored Guidance with zero auxiliary effects`, async () => {
    const f = createExampleFixture(graphBy(number)), original = f.message.mes;
    run(f, await f.pre(), 0);
    assert.equal(guidance(f.context), expected);
    assert.equal(f.requests.length, 0); assert.equal(f.chatSaves(), 0); unchanged(f, original);
});

for (const [number, original, candidate] of [
    [2, 'He let out a breath he didn\'t know he was holding, then opened the letter. "No more delays," Mira said.', 'He exhaled, then opened the letter. "No more delays," Mira said.'],
    [4, 'The envoy returned to Greyhaven carrying a sun stone. The painting Greyhaven at Dusk hung by the door.', 'The envoy returned to Grayhaven carrying a sunstone. The painting Greyhaven at Dusk hung by the door.'],
]) test(`example ${number}: exact literal candidate preserves protected content and needs Apply`, async () => withBrowserWorker(async () => {
    const f = createExampleFixture(graphBy(number), { text: original });
    const result = run(f, await f.post(), 0);
    assert.equal(f.requests.length, 0); unchanged(f, original);
    assert.equal(result.reviewHandles.length, 1);
    assert.equal(recordedArtifact(result, 'review').text, candidate);
    accepted(await f.controller.apply(result.reviewHandles[0]));
    assert.equal(f.message.mes, candidate); assert.equal(f.message.swipes[0], original);
    assert.equal(f.memorySaves(), 0);
}));

const planning = [
    { number: 5, name: 'Tessa', card: 'Tessa guards the night checkpoint and may lower its barrier.', chat: ['Tessa demands an explanation for the broken seal.', 'Rowan has not answered. The player controls Rowan.'], output: 'NPC action: Tessa repeats her question about the broken seal.\nPlayer boundary: Rowan owns his answer, intent and next movement.\nStop: Wait for Rowan to respond.' },
    { number: 6, name: 'Sol', card: 'Sol owns a locked chest and wants his stolen map returned before opening it.', chat: ['Rowan inspected the lock twice and asked what is inside.', 'Sol remains beside the chest. No one has accepted a bargain.'], output: 'Existing hook: the locked chest and missing map.\nNPC initiative (optional): Sol may offer to open it if his map is returned.\nOpen response: Ask whether Rowan accepts; leave the answer unwritten.' },
    { number: 7, name: 'Rook', card: 'Rook is the attacker, standing in the doorway with a short spear.', chat: ["Mira is behind a heavy table. The exit is to Mira's left.", 'The table remains between Mira and Rook. The player controls Mira.'], output: 'Start positions: Rook at the door; Mira behind the table.\nApproach: Rook steps toward the table.\nObstacle: the heavy table still separates them; distance is unclear.\nStop: Before contact or Mira’s defense.' },
    { number: 8, name: 'Mira', card: 'Mira and Sol share the debt-table focal exchange.', chat: ['Mira, Sol, Rin, Kesh and Oren sit at the table. Rin sorts papers; Kesh holds the lamp; Oren watches the door.', "Rowan asks Mira whether she will repay Sol's debt. The player controls Rowan. No repayment decision is settled."], output: 'Focal exchange: Mira answers Rowan’s debt question; Sol may clarify what he is owed.\nAmbient presence: Rin sorts papers, Kesh holds the lamp and Oren watches the door.\nPlayer boundary: Leave Rowan’s response and repayment unsettled.' },
];
for (const spec of planning) test(`example ${spec.number}: bounded Analysis receives evidence and author instructions, then publishes raw plan`, async () => {
    const graph = graphBy(spec.number), node = graph.nodes['pre-plan'];
    const f = createExampleFixture(graph, {
        chat: spec.chat.map((text, index) => completedMessage(text, index, index === 0)),
        character: { name: spec.name, description: spec.card },
        request: async input => {
            assert.equal(input.binding.profileId, 'fixtureAnalysis'); assert.equal(input.maxTokens, node.maxTokens);
            assert.equal(input.maxTokens, spec.number === 8 ? 4096 : 2048);
            if (spec.number === 8) {
                assert.ok(input.messages[1].content.includes('Keep the final plan within 180 words.'));
                assert.equal(graph.nodes['pre-guidance'].budgetTokens, 400);
            }
            assert.ok(input.messages.map(message => message.content).join('\n').includes(node.instructions));
            for (const text of [...spec.chat, spec.card]) assert.ok(input.messages[1].content.includes(text), `Missing evidence: ${text}`);
            return response(spec.output);
        },
    });
    const original = f.message.mes;
    const result = run(f, await f.pre(), 1);
    assert.equal(f.requests.length, 1); assert.equal(guidance(f.context), spec.output); unchanged(f, original);
    assert.equal(recordedArtifact(result, 'pre-plan').text, spec.output);
    if (spec.number === 6) {
        const prompt = f.requests[0].messages[1].content;
        assert.match(prompt, /Label any newly proposed bargain as optional/);
        assert.match(prompt, /never present it as an already-existing offer or bargain/);
    }
    if (spec.number === 7) {
        assert.deepEqual(graph.nodes['pre-focus'].pins, ['table', 'door']);
        const selected = recordedArtifact(result, 'pre-focus');
        assert.ok(selected.messages.some(message => message.text.includes('table')));
        assert.ok(selected.messages.some(message => message.text.includes('door')));
    }
});

const transfers = [
    [9, 'After taking a moment to look at the door, she reached out her hand and slowly turned the handle. She waited for the latch to click.', 'She looked at the door, slowly turned the handle, and waited for the latch to click.'],
    [10, 'The room felt eerie. Rain tapped the cracked window. Mira waited beside the table. "Keep the lamp lit," Sol said.', 'Rain ticked against the cracked window. Mira waited beside the table. "Keep the lamp lit," Sol said.'],
    [11, 'Tessa pointed at the water across the road. "Due to the fact that the road is flooded, our departure must be delayed." She set the travel bag on the bench.', 'Tessa pointed at the water across the road. "Road\'s flooded. We\'ll have to wait." She set the travel bag on the bench.'],
    [12, 'Rin steadied the lantern. "I disagree with your assessment. The bridge is unsafe." She kept her boots on the near bank.', 'Rin steadied the lantern. "That bridge? No. It\'s unsafe." She kept her boots on the near bank.'],
    [13, 'He saw her name on the envelope and put it down unopened. "Later," he said.', 'Her name on the envelope. He put it down unopened. "Later," he said.'],
    // The leading protected Jon is immutable; even a style specimen cannot move it.
    [14, 'Jon stood by the door. The latch was cold beneath his hand. "Wait here," Mira said from the corridor.', 'Jon felt the cold latch beneath his hand and stayed by the door. "Wait here," Mira said from the corridor.'],
    [15, 'At night in the kitchen, Mira closes the door. "They\'re here," she says.', 'INT. KITCHEN — NIGHT\nMira closes the door.\nMIRA: They\'re here.'],
    [16, 'She waited at the gate while the cold wind blew. The courier had not arrived.', 'She waited at the gate. The cold wind bit. The courier had not arrived.'],
];
for (const [number, original, candidate] of transfers) test(`example ${number}: Prose contract supplies source windows/reference/controls and review owns application`, async () => {
    const graph = graphBy(number), node = Object.values(graph.nodes).find(node => ['style-transfer', 'format-transfer'].includes(node.operation));
    const f = createExampleFixture(graph, { text: original, request: async input => {
        const payload = JSON.parse(input.messages[1].content);
        assert.equal(input.binding.profileId, 'fixtureProse'); assert.equal(input.maxTokens, node.maxTokens);
        assert.equal(input.maxTokens, [9, 13, 14, 16].includes(number) ? 8192 : 2048);
        assert.equal(payload.original, original); assert.ok(payload.windows.length);
        for (const window of payload.windows) {
            assert.equal(window.text, original.slice(window.start, window.end));
            for (const literal of node.protectedLiterals) assert.equal(window.text.includes(literal), false);
            if (node.scope === 'dialogue') assert.equal(original[window.start - 1], '"');
        }
        assert.equal(payload.controls.scope, node.scope); assert.equal(payload.controls.strength, node.strength);
        assert.equal(payload.controls.instructions, node.instructions);
        assert.deepEqual(payload.controls.protectedLiterals, node.protectedLiterals);
        assert.match(input.messages[0].content, /immutable regions exactly/);
        if (number === 15) {
            assert.equal(payload.reference.kind, 'data');
            assert.match(payload.reference.value.layout, /INT\. KITCHEN/);
            assert.equal(payload.reference.value.rules.length, 2);
            assert.deepEqual(payload.reference.value.requiredContent, ['night', 'kitchen', 'Mira', 'closes the door', "They're here"]);
            assert.match(payload.controls.instructions, /Keep MIRA: and its supplied dialogue on the same line, exactly MIRA: \[supplied dialogue\]/);
        } else {
            assert.equal(payload.reference.kind, 'text'); assert.ok(payload.reference.text.trim());
            if (number === 16) for (const label of ['Rhythm:', 'Imagery:', 'Priority:']) assert.ok(payload.reference.text.includes(label));
        }
        return response(candidate);
    } });
    const result = run(f, await f.post(), 1);
    assert.equal(f.requests.length, 1); unchanged(f, original);
    assert.equal(result.reviewHandles.length, 1); assert.equal(recordedArtifact(result, 'review').text, candidate);
    if (number === 15) assert.equal(recordedArtifact(result, 'decode').kind, 'data');
    accepted(await f.controller.apply(result.reviewHandles[0]));
    assert.equal(f.message.mes, candidate); assert.equal(f.message.swipes[0], original);
    if (node.scope === 'narration') assert.deepEqual(candidate.match(/"[^"]*"/g), original.match(/"[^"]*"/g));
    for (const literal of node.protectedLiterals) assert.ok(candidate.includes(literal));
    assert.equal(f.memorySaves(), 0);
});

test('example 5: planning treats unspecified staging as unknown and marks new NPC movement as optional', async () => {
    const original = [
        completedMessage('Tessa demands an explanation for the broken seal.', 0, false),
        completedMessage('Rowan has not answered. The player controls Rowan.', 1, true),
    ];
    const proposed = 'NPC action: Tessa may repeat her demand.\nPlayer boundary: Leave Rowan’s response unwritten.\nStop: Await the player’s answer.';
    const f = createExampleFixture(graphBy(5), {
        chat: original,
        character: { name: 'Tessa', description: 'Tessa guards the checkpoint and owns its barrier. Its current state and her position are unspecified.' },
        request: async () => response(proposed),
    });
    run(f, await f.pre(), 1);
    const prompt = f.requests[0].messages.map(message => message.content).join('\n');
    assert.match(prompt, /Unspecified current staging is unknown/);
    assert.match(prompt, /Do not presuppose the barrier's state, current relative positions, or new existing props/);
    assert.match(prompt, /Phrase any new NPC movement explicitly as an optional proposal/);
    assert.equal(f.requests[0].maxTokens, 2048);
    assert.equal(guidance(f.context), proposed);
    assert.deepEqual(f.context.chat, original);
    assert.equal(f.memorySaves(), 0);
});

test('example 17: resume context forces historical summarization, retains exact pins/recent evidence and publishes second Analysis result', async () => {
    const graph = graphBy(17);
    const old = Array.from({ length: 6 }, (_, i) => completedMessage(`Old harbor discussion ${i}: ${'Repeated weather and prior route discussion. '.repeat(38)}`, i, true));
    const chat = [...old, completedMessage('The ferry is delayed. Mira still has the unopened letter.', 6, true), completedMessage('Rin left to check the harbor.', 7), completedMessage('What can Mira do while we wait?', 8, true)];
    const expected = 'Established now: ferry is delayed; the unopened letter remains sealed.\nUnresolved: Rin left to check the harbor; arrival and progress are unconfirmed.\nOptional next beat: Mira explains the gate delay and asks what the player wants to know.';
    const f = createExampleFixture(graph, { chat, request: async (input, stage) => {
        assert.equal(input.binding.profileId, 'fixtureAnalysis');
        if (stage.node.id === 'pre-compact') {
            assert.equal(input.maxTokens, 2048); assert.match(input.messages[1].content, /Old harbor discussion/);
            assert.equal(input.messages[1].content.includes('What can Mira do'), false);
            assert.equal(input.messages[1].content.includes('Rin left to check the harbor'), false);
            assert.match(input.messages[0].content, /Summarize only the supplied historical chunk/);
            assert.match(input.messages[0].content, /Purpose keywords are not facts/);
            assert.match(input.messages[0].content, /do not import recent facts absent from that chunk/);
            return response('Earlier harbor discussions repeat weather and unresolved routes; no boat location was established.');
        }
        assert.equal(stage.node.id, 'pre-plan'); assert.equal(input.maxTokens, 2048);
        for (const pin of ['ferry is delayed', 'unopened letter']) assert.ok(input.messages[1].content.includes(pin));
        assert.match(input.messages[1].content, /Rin left to check the harbor/);
        assert.match(input.messages[1].content, /Earlier harbor discussions/);
        assert.match(input.messages[1].content, /Keep the unopened letter sealed/);
        assert.match(input.messages[1].content, /Rin's departure does not prove arrival or progress/);
        assert.match(input.messages[1].content, /Establish current facts only from supplied sources/);
        assert.match(input.messages[1].content, /Do not invent existing travelers or weather/);
        return response(expected);
    } });
    const result = run(f, await f.pre(), 2);
    assert.equal(f.requests.length, 2); assert.equal(guidance(f.context), expected);
    const compacted = recordedArtifact(result, 'pre-compact');
    for (const text of chat.slice(-3).map(message => message.mes)) assert.ok(compacted.messages.some(message => message.text === text));
    assert.deepEqual(compacted.original.filter(message => message.source === 'chat').map(message => message.text), chat.map(message => message.mes));
    assert.equal(f.memorySaves(), 0);
});

test('example 17: resume planning preserves the seal and does not upgrade Rin’s departure into progress', async () => {
    const f = createExampleFixture(graphBy(17), {
        chat: [completedMessage('The ferry is delayed. Mira holds the unopened letter.', 0, true), completedMessage('Rin left to check the harbor. No arrival or progress is confirmed.', 1, false)],
        request: async () => response('Established now: ferry delayed; letter sealed.\nUnresolved: Rin’s inquiry has no confirmed progress.\nOptional next beat: Mira may ask about the delay.'),
    });
    run(f, await f.pre(), 1);
    const prompt = f.requests[0].messages[1].content;
    assert.match(prompt, /Keep the unopened letter sealed/);
    assert.match(prompt, /Rin's departure does not prove arrival or progress/);
    assert.match(prompt, /Establish current facts only from supplied sources/);
    assert.match(prompt, /Do not invent existing travelers or weather/);
    assert.equal(f.memorySaves(), 0);
});

test('example 18: character appraisal requests two optional hints and labels inferred hand placement as interpretation', async () => {
    const hints = ['Possibility: Mira acknowledges useful help.', 'Possibility: Mira asks Sol to take one agreed part of the repair.'];
    const f = createExampleFixture(graphBy(18), {
        character: { name: 'Mira', description: 'Mira values independence and practical cooperation.' },
        chat: [completedMessage("Sol takes Mira's tools and offers to finish the repair without asking.", 0, false), completedMessage('Mira has not answered or accepted the offer.', 1, true)],
        request: async () => response(reflection({ brief: 'Interpretation: unsolicited help may constrain Mira’s choice.', behaviorHints: hints })),
    });
    run(f, await f.pre(), 1);
    const prompt = f.requests[0].messages[0].content;
    assert.match(prompt, /Put two specific optional behavior hints in behaviorHints/);
    assert.doesNotMatch(prompt, /two or three specific optional behavior hints/);
    assert.match(prompt, /Classify any inferred current hand placement as interpretation, not established evidence/);
    assert.match(prompt, /at most two items in each reflection array/);
    assert.equal(guidance(f.context), hints.join('\n'));
    assert.equal(f.memorySaves(), 0);
});

for (const [number, hints, conflicts] of [
    [18, ['Possibility: Mira hesitates and asks permission to inspect the letter’s seal.'], ['Interpretation: curiosity meets her promise to keep the seal intact.']],
    [19, ['Possibility: Mira offers help while explicitly keeping her promise to Sol.'], ['Interpretation: helping Rowan conflicts with her promise to Sol.']],
]) test(`example ${number}: distinct nonempty character appraisal renders behavior without memory writes`, async () => {
    const graph = graphBy(number), node = graph.nodes['pre-reflect'];
    const payload = reflection({ brief: number === 18 ? 'Interpretation: curiosity constrained by an existing promise.' : 'Interpretation: two current commitments create competing motives.', behaviorHints: hints, conflicts });
    const suppliedChat = number === 18
        ? ['Mira is curious about the letter but promised Sol to keep its seal intact.', 'Mira pauses over the seal and asks whether she has permission to inspect it.']
        : ['Rowan needs help understanding the sealed letter.', 'Mira says she wants to help Rowan but promised Sol that she would keep the letter sealed.'];
    let saved;
    const f = createExampleFixture(graph, { chat: suppliedChat.map((text, i) => completedMessage(text, i, i === 0)), character: { description: 'Mira promised Sol she would keep the letter sealed but wants to help Rowan.' }, request: async input => {
        assert.equal(input.binding.profileId, 'fixtureAnalysis'); assert.equal(input.maxTokens, node.maxTokens);
        assert.equal(input.maxTokens, 2048);
        assert.ok(input.messages[0].content.includes(node.instructions));
        const supplied = JSON.parse(input.messages[1].content);
        assert.ok(supplied.context.messages.some(message => message.text.includes('promised Sol')));
        assert.equal(supplied.state.scope.actorId, 'character:mira.png');
        assert.deepEqual(supplied.state, saved);
        assert.deepEqual(supplied.state.payload.goals.map(goal => goal.id), number === 18 ? ['keep-seal'] : ['keep-seal', 'help-rowan']);
        for (const key of ['appraisals', 'conflicts', 'recalls', 'sceneChanges', 'behaviorHints', 'attentionHints', 'recalledEpisodeIds']) assert.ok(Array.isArray(payload[key]));
        return response(payload);
    } });
    await seedMemory(f, supplied => {
        const refs = sourceRefs(supplied.events);
        const changes = [upsert('goals', 'keep-seal', 'Mira promised Sol she would keep the seal intact.', refs)];
        if (number === 19) changes.push(upsert('goals', 'help-rowan', 'Mira says she wants to help Rowan understand the letter.', sourceRefs([supplied.events.at(-1)])));
        return changes;
    });
    saved = await currentMemory(f);
    const writes = f.memorySaves(), metadata = structuredClone(f.context.chatMetadata);
    const result = run(f, await f.pre(), 1);
    assert.equal(guidance(f.context), hints.join('\n'));
    const assessment = recordedArtifact(result, 'pre-reflect').value;
    assert.deepEqual(assessment.payload.conflicts, conflicts); assert.equal(assessment.store.version, 1);
    assert.equal(f.memorySaves(), writes); assert.deepEqual(f.context.chatMetadata, metadata);
});

test('prose and guidance suite executes every phase in examples 1–19', () => assertPhaseCoverage(executed, 1, 19));
