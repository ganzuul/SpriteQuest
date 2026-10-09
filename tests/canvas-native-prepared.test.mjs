import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture } from './canvas-fixture.mjs';
import { canvasWorkflow } from './browser/native-fixture.mjs';
import { operationDefaults } from '../src/workflow/catalog.js';
import { safeWorkflowData, validateGraphStructure } from '../src/workflow/contracts.js';
import { exportWorkflow, parseWorkflow } from '../src/workflow/packages.js';
import { prepareWorkspaceViews } from '../src/ui/workspace-preparation.js';

function preparedGraph(count = 3) {
    const authored = canvasWorkflow(operationDefaults, count, 5);
    assert.equal(validateGraphStructure(authored).ok, true);
    const prepared = prepareWorkspaceViews(authored);
    assert.equal(prepared.ok, true, JSON.stringify(prepared.error));
    const draw = structuredClone(prepared.data.preparedViews[0].drawBase);
    draw.view = { ...authored.view };
    return { authored, draw };
}

test('Canvas admits and renders 250 genuinely prepared current cards without enlarging authoring admission', async () => {
    const { authored, draw } = preparedGraph(250), before = JSON.stringify(authored);
    assert.equal(safeWorkflowData(authored), true);
    assert.equal(safeWorkflowData(draw), false, 'expanded prepared metadata exceeds the authoring traversal budget');
    const env = fixture();
    try {
        assert.doesNotThrow(() => env.canvas.setGraph(draw));
        assert.equal(env.canvas.graph, draw);
        assert.equal(env.host.querySelectorAll('.pc-node-native').length, 250);
        assert.equal(Object.keys(draw.wires).length, 249);
        assert.equal(JSON.stringify(authored), before);
        const overBudget = { ...authored, extra: Array(20001).fill(0) };
        assert.equal(validateGraphStructure(overBudget).ok, false, 'authoring traversal remains independently bounded');
    } finally { await env.canvas.destroy(); env.host.remove(); }
});

test('near-limit current packages export, parse, prepare and render with bounded presentation overhead', async () => {
    const compose = canvasWorkflow(operationDefaults, 21, 5);
    for (const node of Object.values(compose.nodes)) node.sections[0].text = '';
    const note = { ...canvasWorkflow(operationDefaults, 1), nodes: { note: { id: 'note', type: 'note', content: '', x: 40, y: 80 } }, wires: {} };
    const bytes = value => new TextEncoder().encode(JSON.stringify(value)).byteLength;
    for (const authored of [compose, note]) {
        const nodes = Object.values(authored.nodes), remaining = 1999990 - bytes(exportWorkflow(authored));
        for (const [index, node] of nodes.entries()) {
            const text = 'x'.repeat(Math.floor(remaining / nodes.length) + (index < remaining % nodes.length ? 1 : 0));
            if (node.type === 'note') node.content = text; else node.sections[0].text = text;
        }
        const before = JSON.stringify(authored), envelope = exportWorkflow(authored), json = JSON.stringify(envelope);
        assert.equal(bytes(envelope), 1999990);
        const parsed = parseWorkflow(json); assert.equal(parsed.ok, true, JSON.stringify(parsed.error));
        const prepared = prepareWorkspaceViews(parsed.data); assert.equal(prepared.ok, true, JSON.stringify(prepared.error));
        const draw = structuredClone(prepared.data.preparedViews[0].drawBase); draw.view = { ...parsed.data.view };
        const env = fixture();
        try {
            assert.doesNotThrow(() => env.canvas.setGraph(draw));
            assert.equal(env.host.querySelectorAll('.pc-node-native').length, nodes.length);
            if (nodes.length === 1) assert.equal(env.host.querySelector('.pc-node-body').textContent, authored.nodes.note.content);
            assert.equal(JSON.stringify(authored), before);
            const excessive = structuredClone(envelope), first = Object.values(excessive.graph.nodes)[0];
            if (first.type === 'note') first.content += 'x'.repeat(11); else first.sections[0].text += 'x'.repeat(11);
            assert.equal(bytes(excessive), 2000001);
            assert.throws(() => exportWorkflow(excessive.graph), /2,000,000 UTF-8 bytes/);
            assert.equal(parseWorkflow(JSON.stringify(excessive)).ok, false, 'portable package byte budget is unchanged');
        } finally { await env.canvas.destroy(); env.host.remove(); }
    }
});

test('prepared admission rejects card accessors and unsafe nested values before switching Canvas', async () => {
    const env = fixture(), current = env.canvas.graph;
    let reads = 0;
    const accessor = () => { reads++; throw Error('Accessor must never be read'); };
    const variants = [
        graph => Object.defineProperty(graph, 'nativeCards', { get: accessor }),
        graph => Object.defineProperty(graph.nativeCards, 'n0', { get: accessor }),
        graph => Object.defineProperty(graph.nativeCards.n0, 'ports', { get: accessor }),
        graph => Object.defineProperty(graph.nativeCards.n0, 'constructor', { value: 'unsafe', enumerable: true }),
        graph => { graph.nativeCards.n0.extra = { apiKey: 'synthetic prohibited key' }; },
        graph => { graph.nativeCards.n0.extra = { value: Infinity }; },
        graph => { graph.nativeCards.n0.extra = new Date(0); },
        graph => { graph.nativeCards.n0.extra = graph.nativeCards.n0; },
    ];
    try {
        for (const mutate of variants) {
            const { draw } = preparedGraph(); mutate(draw);
            assert.throws(() => env.canvas.setGraph(draw), /prepared current workflow/);
            assert.equal(env.canvas.graph, current);
            assert.equal(env.host.querySelectorAll('.pc-node-native').length, 2);
        }
        assert.equal(reads, 0);
    } finally { await env.canvas.destroy(); env.host.remove(); }
});

test('prepared admission retains node, wire, card and total traversal bounds', async () => {
    const env = fixture(), current = env.canvas.graph;
    const variants = [
        graph => { graph.nodes = Object.fromEntries(Array.from({ length: 1001 }, (_, i) => ['node' + i, { id: 'node' + i, type: 'note' }])); },
        graph => { graph.wires = Object.fromEntries(Array.from({ length: 2001 }, (_, i) => ['wire' + i, { id: 'wire' + i }])); },
        graph => { for (let i = 0; i < 998; i++) graph.nativeCards['extra' + i] = {}; },
        graph => { graph.extra = Array(200001).fill(0); },
        graph => { graph.extra = Array(13).fill('x'.repeat(1000000)); },
        graph => { graph.nativeCards.n0.body = 'x'.repeat(2000001); },
    ];
    try {
        for (const mutate of variants) {
            const { draw } = preparedGraph(); mutate(draw);
            assert.throws(() => env.canvas.setGraph(draw), /prepared current workflow/);
            assert.equal(env.canvas.graph, current);
        }
    } finally { await env.canvas.destroy(); env.host.remove(); }
});
