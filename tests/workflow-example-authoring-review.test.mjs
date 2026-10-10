import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WORKFLOW_EXAMPLE_DATA } from '../src/workflow/example-data.js';
import { describeOperation } from '../src/workflow/catalog.js';
import { exportWorkflow, parseWorkflow } from '../src/workflow/packages.js';
import { runWorkflow } from '../src/workflow/runtime.js';
import { validateWorkflow } from '../src/workflow/contracts.js';
import { completedMessage, createExampleFixture, guidance, response, verifyRun } from './helpers/workflow-example-fixtures.mjs';

const graphFor = (id, phase) => {
    const recipe = WORKFLOW_EXAMPLE_DATA.find(entry => entry.id === id);
    const envelope = recipe.packages.find(item => item.graph.mode === `native-${phase}`);
    const parsed = parseWorkflow(JSON.stringify(envelope));
    assert.equal(parsed.ok, true, JSON.stringify(parsed.error));
    return parsed.data;
};
const recordedOutput = (result, nodeId, portId = 'out') => {
    const { strings, addresses } = result.recording.identities;
    const unit = result.recording.units.find(item => strings[addresses[item.address][2]] === nodeId);
    const port = unit.ports.find(item => item.direction === 'output' && strings[item.port] === portId);
    return result.recording.artifacts[port.artifact].value;
};
const target = (graph, nodeId) => ({ workflowId: graph.id, instancePath: [], nodeId, portId: 'out' });
const facts = '{"place":"ferry gate","obstacle":"closed for inspection","npc":"Mira","openChoice":"wait or ask Mira about the delay"}';
const literalSources = [
    ['structured-brief-basics', 'pre', 'json', `${facts}\n`, 'decode', 'in'],
    ['canonical-terminology', 'post', 'glossary', '{"entries":[{"from":"Greyhaven","to":"Grayhaven"},{"from":"sun stone","to":"sunstone"}]}', 'decode', 'in'],
    ['screenplay-format', 'post', 'template', '{"layout":"INT. KITCHEN — NIGHT\\n[action in present tense]\\nMIRA: [supplied dialogue]","rules":["Keep supplied action/speech; normalize heading/speaker casing.","Omit absent fields; invent no location, time, speaker or action."],"requiredContent":["night","kitchen","Mira","closes the door","They\'re here"]}', 'decode', 'in'],
    ['style-blend', 'post', 'rhythmReference', 'Use short declarative sentences; pause when attention shifts. Original sample: The bell stopped. He stayed at the desk. Borrow rhythm only.', 'blend', 'section.Rhythm'],
    ['style-blend', 'post', 'imageryReference', 'Use one compact physical metaphor for an existing sensation. Original sample: The cold worried at the cuff of her coat. Borrow imagery only.', 'blend', 'section.Imagery'],
    ['continuity-and-voice', 'post', 'post-reference', 'Mira: short concrete clauses; guarded understatement; direct questions when evidence is missing. Avoid repeated catchphrases or sudden warmth. Example: “You kept this one. Tell me what happens next.” Preserve all actions and commitments.', 'post-voice', 'reference'],
];

// Reintroducing Compose-only controls on a literal source must fail this
// portable operation contract, while each existing consumer keeps its named pin.
for (const [id, phase, key, expected, consumer, input] of literalSources) {
    test(`${id} ${key} is an editable Input Text source with its existing consumer`, async () => {
        const graph = graphFor(id, phase), node = graph.nodes[key];
        const described = describeOperation(graph, node);
        assert.equal(described.ok, true, JSON.stringify(described.error));
        assert.equal(described.data.descriptor.family, 'Input');
        assert.deepEqual(described.data.descriptor.controls, ['text']);
        assert.deepEqual(described.data.ports.map(({ id, direction, kind }) => ({ id, direction, kind })), [{ id: 'out', direction: 'output', kind: 'text' }]);
        assert.ok(Object.values(graph.wires).some(wire => wire.from === key && wire.fromPort === 'out' && wire.to === consumer && wire.toPort === input));
        const result = await runWorkflow(graph, { target: target(graph, key) });
        assert.equal(result.ok, true, JSON.stringify(result.error));
        assert.equal(result.actualCalls, 0);
        assert.equal(recordedOutput(result, key).text, expected);
    });
}

test('JSON lesson imports ordered Trim then Unwrap fence modifiers and renders the same checked brief', async () => {
    const graph = graphFor('structured-brief-basics', 'pre');
    const modifiers = [
        { id: 'trim-json-padding', type: 'trim', version: 1, enabled: true, settings: { edges: 'both' } },
        { id: 'unwrap-json-fence', type: 'unwrap-fence', version: 1, enabled: true, settings: {} },
    ];
    assert.deepEqual(graph.nodes.json.modifiers, modifiers);
    const imported = parseWorkflow(JSON.stringify(exportWorkflow(graph)));
    assert.equal(imported.ok, true, JSON.stringify(imported.error));
    assert.deepEqual(imported.data.nodes.json.modifiers, modifiers);
    const result = await runWorkflow(imported.data, { countTokens: async () => ({ tokens: 40 }) });
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.equal(result.actualCalls, 0);
    const source = recordedOutput(result, 'json');
    assert.equal(source.modifiers.rawText, `  \n\`\`\`json\n${facts}\n\`\`\`\n  `);
    assert.deepEqual(source.modifiers.trace.map(item => item.type), ['trim', 'unwrap-fence']);
    assert.equal(source.text, `${facts}\n`);
    assert.deepEqual(recordedOutput(result, 'decode'), { kind: 'data', value: { place: 'ferry gate', obstacle: 'closed for inspection', npc: 'Mira', openChoice: 'wait or ask Mira about the delay' } });
    assert.equal(recordedOutput(result, 'render').text, 'At the ferry gate, preserve the obstacle: closed for inspection. Mira may respond. Leave the player free to wait or ask Mira about the delay.');
});

test('JSON lesson cannot decode its fenced source when Unwrap fence is disabled', async () => {
    const graph = graphFor('structured-brief-basics', 'pre');
    graph.nodes.json.modifiers = (graph.nodes.json.modifiers ?? []).map(item => item.type === 'unwrap-fence' ? { ...item, enabled: false } : item);
    const result = await runWorkflow(graph, { countTokens: async () => ({ tokens: 40 }) });
    assert.equal(result.ok, false, 'a fence is Text syntax rather than raw JSON');
    assert.equal(result.error.code, 'INVALID_JSON');
    assert.equal(result.error.nodeId, 'decode');
    assert.equal(result.actualCalls, 0);
});

// Omitting a shared evidence wire lets Express render an assessment without
// validating the supplied scope, store version, source revisions or episode IDs.
const evidenceLessons = [
    ['persistent-conditions', ['state', 'context']],
    ['sensory-memory', ['state', 'episodes', 'context']],
    ['anger-and-trust', ['state', 'context']],
    ['earned-trust', ['state', 'episodes', 'context']],
    ['offscreen-agenda', ['state', 'episodes', 'context']],
];
for (const [id, inputs] of evidenceLessons) {
    test(`${id} fans the same root evidence snapshots into Reflect and Express`, () => {
        const graph = graphFor(id, 'pre');
        const reflect = graph.nodes['pre-reflect'], express = graph.nodes['pre-express'];
        const reflectPorts = describeOperation(graph, reflect), expressPorts = describeOperation(graph, express);
        assert.equal(reflectPorts.ok, true, JSON.stringify(reflectPorts.error));
        assert.equal(expressPorts.ok, true, JSON.stringify(expressPorts.error));
        for (const input of inputs) {
            const source = input === 'context' ? 'pre-scene' : `pre-${input}`;
            const sourceNode = graph.nodes[source];
            assert.ok(sourceNode, `${id}: root ${input} source remains inspectable`);
            if (input !== 'context') {
                assert.equal(sourceNode.operation, 'memory');
                assert.equal(sourceNode.mode, 'read');
                assert.equal(sourceNode.view, input);
            }
            for (const [consumer, described] of [[reflect, reflectPorts], [express, expressPorts]]) {
                assert.ok(described.data.ports.some(port => port.id === input && port.direction === 'input'));
                const wire = Object.values(graph.wires).find(item => item.to === consumer.id && item.toPort === input);
                assert.ok(wire, `${id}: ${source}.out → ${consumer.id}.${input}`);
                assert.equal(wire.from, source);
                assert.equal(wire.fromPort, 'out');
            }
        }
    });
}

test('all 33 model-backed example stages reserve reasoning-compatible completion tiers without changing call ceilings', () => {
    let stages = 0, calls = 0;
    for (const recipe of WORKFLOW_EXAMPLE_DATA) for (const { graph } of recipe.packages) {
        const validated = validateWorkflow(graph);
        assert.equal(validated.ok, true, JSON.stringify(validated.error));
        calls += validated.data.callBound;
        for (const { node, address, requestBound, included } of validated.data.primitives) {
            if (!requestBound || !included) continue;
            stages++;
            const expected = [9, 13, 14, 16].includes(recipe.number) && node.operation === 'style-transfer' ? 8192 : [8, 28].includes(recipe.number) && node.operation === 'response-plan' ? 4096 : recipe.number === 26 && node.operation === 'reflect' ? 4096 : recipe.number === 30 && node.operation === 'reflect' && address.instancePath[0] === 'pre-scene' ? 4096 : node.operation === 'internalize' ? 4096 : node.operation === 'express' ? 1024 : recipe.number === 30 && node.operation === 'style-transfer' ? 4096 : 2048;
            assert.equal(node.maxTokens, expected, `${recipe.number} ${graph.mode} ${[...address.instancePath, node.id].join('/')}`);
        }
    }
    assert.equal(stages, 33);
    assert.equal(calls, 33);
});

test('ensemble source separates reasoning headroom, final-plan word target and Guidance budget', () => {
    const catalog = JSON.parse(readFileSync(new URL('../docs/research/2026-10-09-lattice-example-catalog.json', import.meta.url), 'utf8'));
    const entry = catalog.entries.find(item => item.number === 8);
    const plan = entry.nodeDetails.find(item => item.key === 'pre-plan');
    assert.ok(plan.settings.instructions.endsWith('Keep the final plan within 180 words.'));
    assert.equal(plan.settings.maxTokens, 4096);
    assert.match(plan.inspect, /4096-token completion cap includes provider reasoning/);
    assert.match(plan.inspect, /final plan targets 180 words/);
    assert.match(plan.inspect, /Guidance independently enforces its 400-token budget/);
    assert.equal(entry.nodeDetails.find(item => item.key === 'pre-guidance').settings.budgetTokens, 400);
    assert.equal(entry.variants[0].maxCalls, 1);
});

test('Reflect and Internalize author concise raw JSON protocols in every resolved instance', () => {
    let reflections = 0, proposals = 0;
    for (const recipe of WORKFLOW_EXAMPLE_DATA) for (const { graph } of recipe.packages) {
        for (const { node, address } of validateWorkflow(graph).data.primitives) {
            if (!['reflect', 'internalize'].includes(node.operation)) continue;
            const label = `${recipe.number} ${[...address.instancePath, node.id].join('/')}`;
            assert.match(node.instructions, /beginning with \{ and ending with \}/, label);
            assert.match(node.instructions, /No Markdown, fences or preface/, label);
            if (node.operation === 'reflect') {
                reflections++;
                assert.match(node.instructions, /at most two items in each reflection array/, label);
                assert.match(node.instructions, /one concise sentence for brief/, label);
            } else {
                proposals++;
                assert.match(node.instructions, /at most three best-supported changes/, label);
                assert.match(node.instructions, /exact supplied event IDs and revisions/, label);
                assert.match(node.instructions, /values, curves and tracks as empty objects unless needed/, label);
            }
        }
    }
    assert.equal(reflections, 11);
    assert.equal(proposals, 5);
});

test('advanced completion defaults and public overrides agree, while each override remains local to its wrapper', () => {
    for (const [id, phase, wrapperId, parameterId, nodeId, expected] of [
        ['character-reaction-subgraph', 'pre', 'reaction', 'maxTokens', 'reflect', 2048],
        ['continuity-and-voice', 'pre', 'pre-character', 'appraisalTokens', 'reflect', 2048],
        ['continuity-and-voice', 'pre', 'pre-scene', 'appraisalTokens', 'reflect', 4096],
        ['continuity-and-voice', 'post', 'post-voice', 'voiceTokens', 'voice', 4096],
    ]) {
        const graph = graphFor(id, phase), wrapper = graph.nodes[wrapperId];
        const definition = Object.values(graph.definitions).find(item => item.id === wrapper.definition.id);
        assert.equal(definition.body.nodes[nodeId].maxTokens, expected);
        assert.equal(wrapper.parameterOverrides[parameterId], expected);
        const originalDefinitions = structuredClone(graph.definitions);
        wrapper.parameterOverrides[parameterId] = expected + 512;
        const validated = validateWorkflow(graph);
        assert.equal(validated.ok, true, JSON.stringify(validated.error));
        const unit = validated.data.primitives.find(item => item.address.instancePath[0] === wrapperId && item.node.id === nodeId);
        assert.equal(unit.node.maxTokens, expected + 512);
        assert.deepEqual(graph.definitions, originalDefinitions);
        for (const peer of validated.data.primitives.filter(item => item.address.instancePath.length && item.address.instancePath[0] !== wrapperId && item.node.operation === 'reflect')) assert.equal(peer.node.maxTokens, peer.address.instancePath[0] === 'pre-scene' ? 4096 : 2048);
    }
});

test('context lens planner keeps Rin’s location unknown and does not invent sealed-letter inspection obligations', async () => {
    const proposal = 'Optional NPC action: Mira may ask the inspector about the gate delay. Keep the letter unopened and leave the player’s response open.';
    const chat = [
        completedMessage('The ferry is delayed. The inspector keeps the gate closed. Mira holds the sealed letter. The unopened letter remains intact.', 0, true),
        completedMessage('Rin left to check the harbor; no arrival, progress or current location is confirmed.', 1, false),
        completedMessage('What can Mira do while we wait?', 2, true),
    ];
    const f = createExampleFixture(graphFor('context-lens-subgraph', 'pre'), { chat, request: async () => response(proposal) });
    const result = await f.pre();
    verifyRun(f, result, 1);
    const prompt = f.requests[0].messages[1].content;
    assert.match(prompt, /Establish current facts only from supplied evidence/);
    assert.match(prompt, /Rin's departure does not establish harbor arrival, progress or current location/);
    assert.match(prompt, /Do not invent inspection rules or obligations to inspect the sealed letter/);
    assert.match(prompt, /Keep it unopened/);
    assert.match(prompt, /Clearly label any newly proposed NPC action as optional/);
    assert.equal(f.requests[0].maxTokens, 4096);
    assert.equal(guidance(f.context), proposal);
    assert.deepEqual(f.context.chat, chat);
    assert.equal(f.memorySaves(), 0);
});

for (const wrapperId of ['pre-character', 'pre-scene']) test(`continuity ${wrapperId} keeps Rin’s inquiry and ferry wait duration unresolved`, async () => {
    const chat = [
        completedMessage('Sol previously failed to return Mira’s chart; Mira remains guarded.', 0, true),
        completedMessage('Sol now returns the chart as promised.', 1, false),
        completedMessage('The ferry is delayed; Mira holds the unopened letter.', 2, true),
        completedMessage('Rin left to check the harbor and has not returned.', 3, false),
    ];
    const f = createExampleFixture(graphFor('continuity-and-voice', 'pre'), {
        chat,
        character: { name: 'Mira', description: 'Mira is practical and guarded. One kept promise does not erase disappointment.' },
        request: async (input, stage) => response(stage.address.instancePath[0] === 'pre-character'
            ? { brief: 'Interpretation: Mira recognizes the kept promise while remaining guarded.', behaviorHints: ['Possibility: Mira may offer one small agreed task while keeping the letter unopened.'], conflicts: ['Interpretation: a cautious opening coexists with earlier disappointment.'] }
            : { brief: 'Observation: ferry delayed; Rin’s harbor inquiry is unresolved.', sceneChanges: ['Observation: the letter remains unopened.'], attentionHints: ['Possibility: Mira may ask about the ferry delay.'], conflicts: ['Observation: Rin has not returned; her progress and elapsed wait are unconfirmed.'] }),
    });
    const result = await f.pre();
    verifyRun(f, result, 2);
    const request = f.requests.find(item => item.stage.address.instancePath[0] === wrapperId);
    assert.ok(request, `${wrapperId} must run its actual child Reflect`);
    assert.match(request.messages[0].content, /Rin's supplied departure or absence does not prove harbor arrival, progress, lateness or being overdue/);
    assert.match(request.messages[0].content, /The ferry delay does not establish an elapsed wait length/);
    assert.equal(request.maxTokens, wrapperId === 'pre-scene' ? 4096 : 2048);
    const published = guidance(f.context);
    assert.match(published, /remaining guarded/);
    assert.match(published, /letter.*unopened/);
    assert.match(published, /ferry delayed/);
    assert.match(published, /Rin’s harbor inquiry is unresolved/);
    assert.deepEqual(f.context.chat, chat);
    assert.equal(f.memorySaves(), 0);
});
