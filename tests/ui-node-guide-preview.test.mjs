import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';
import { compile } from 'svelte/compiler';
import { render } from 'svelte/server';
import { JSDOM } from 'jsdom';
import { prepareNodeGuideScene } from '../src/ui/node-guide-scene.js';
import { nodeGuideWires, layoutNodeGuideCards, layoutNodeGuideComment } from '../src/ui/node-guide-preview.js';
import { siblingWorkflow } from './fixtures/workflow-prepared-fixture.mjs';

const compose = () => JSON.parse(readFileSync(new URL('../docs/workshop/compose-guide/compose-example.lattice.json', import.meta.url))).graph;

test('guide scenes prepare current named cards and full connections without changing authored graphs', () => {
    const graph = compose(), before = structuredClone(graph);
    const result = prepareNodeGuideScene(graph);
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.equal(result.data.cards.length, 5);
    assert.equal(result.data.connections.length, 4);
    const card = result.data.cards.find(card => card.id === 'guidance');
    assert.equal(card.label, 'Compose');
    assert.equal(card.ports.find(port => port.port === 'section.Direction').label, 'Direction');
    assert.equal(result.data.connections.find(wire => wire.id === 'edge-3').kind, 'guidance');
    card.ports[0].label = 'Changed in the preview';
    assert.deepEqual(graph, before);
});

test('guide scenes reject invalid graphs instead of drawing fabricated cards', () => {
    const graph = compose();
    graph.nodes.guidance.operation = 'missing-operation';
    assert.equal(prepareNodeGuideScene(graph).ok, false);
});

test('guide scenes show the requested subgraph scope and its declared boundary pins', () => {
    const graph = siblingWorkflow(), before = structuredClone(graph);
    const result = prepareNodeGuideScene(graph, { instancePath: ['first/path'] });
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.deepEqual(result.data.cards.map(card => card.id), ['entry', 'work', 'exit']);
    assert.equal(result.data.cards[0].title, 'Scene');
    assert.equal(result.data.connections.length, 2);
    assert.deepEqual(graph, before);
    assert.equal(prepareNodeGuideScene(graph, { instancePath: ['missing'] }).data.cards.length, 5, 'unavailable scopes fall back to the complete root');
});

test('guide scenes can show pinned helper definition bodies while preserving the parent graph', () => {
    const graph = siblingWorkflow(), before = structuredClone(graph);
    const result = prepareNodeGuideScene(graph, { definitionKey: Object.keys(graph.definitions)[0] });
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.deepEqual(result.data.cards.map(card => card.id), ['entry', 'work', 'exit']);
    assert.equal(result.data.cards.find(card => card.id === 'work').label, 'Response Plan');
    assert.deepEqual(graph, before);
});

test('guide scenes preserve actual authored comment frames as read-only presentation', () => {
    const graph = compose();
    graph.nodes.comment = { id: 'comment', type: 'note', commentFrame: true, x: 10, y: 20, w: 360, h: 220, title: 'Scene brief', content: 'Direction and boundary', color: '#637d89', moveContents: true };
    const result = prepareNodeGuideScene(graph);
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.equal(Array.isArray(result.data.comments), true);
    assert.equal(result.data.comments.length, 1);
    assert.equal(result.data.comments[0].title, 'Scene brief');
    assert.equal(result.data.comments[0].readOnly, true);
    assert.equal(result.data.cards.length, 5);
});

test('portal connections render from their actual publishing pin to the consumer', () => {
    const graph = compose();
    graph.portals = { scene: { id: 'scene', label: 'Scene direction', kind: 'text', source: { nodeId: 'direction', portId: 'out' } } };
    graph.wires['edge-2'] = { id: 'edge-2', route: 'portal', portalId: 'scene', to: 'guidance', toPort: 'section.Direction' };
    const result = prepareNodeGuideScene(graph);
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.deepEqual(result.data.connections.find(connection => connection.id === 'edge-2'), { id: 'edge-2', from: 'direction', fromPort: 'out', to: 'guidance', toPort: 'section.Direction', kind: 'text', off: false });
});

test('small example layouts stack measured native cards in dependency order on narrow screens', () => {
    const cards = [{ id: 'end', x: 900, y: 400 }, { id: 'start', x: 100, y: 100 }, { id: 'middle', x: 500, y: 400 }], before = structuredClone(cards);
    const dimensions = new Map([['start', { w: 120, h: 50 }], ['middle', { w: 200, h: 80 }], ['end', { w: 160, h: 60 }]]);
    const connections = [{ from: 'start', to: 'middle' }, { from: 'middle', to: 'end' }];
    const positions = layoutNodeGuideCards(cards, connections, dimensions, 360);
    assert.deepEqual(positions, [{ id: 'start', x: 0, y: 0 }, { id: 'middle', x: 0, y: 82 }, { id: 'end', x: 0, y: 194 }]);
    assert.deepEqual(cards, before);
});

test('small desktop layouts wrap measured cards to keep the preview within its available width', () => {
    const cards = [{ id: 'start', x: 100, y: 100 }, { id: 'middle', x: 500, y: 400 }, { id: 'end', x: 900, y: 400 }];
    const dimensions = new Map([['start', { w: 220, h: 50 }], ['middle', { w: 240, h: 80 }], ['end', { w: 210, h: 60 }]]);
    const positions = layoutNodeGuideCards(cards, [{ from: 'start', to: 'middle' }, { from: 'middle', to: 'end' }], dimensions, 600);
    assert.deepEqual(positions, [{ id: 'start', x: 0, y: 0 }, { id: 'middle', x: 252, y: 0 }, { id: 'end', x: 0, y: 112 }]);
});

test('a teaching comment follows its originally contained cards and reserves wrapped text space', () => {
    const cards = [{ id: 'start', x: 100, y: 140 }, { id: 'end', x: 400, y: 140 }];
    const comment = { id: 'comment', x: 76, y: 80, w: 900, h: 280, title: 'Native reply path', content: 'Send, then review.', color: '#637d89', moveContents: true, selected: false, readOnly: true };
    const before = structuredClone({ cards, comment });
    const dimensions = new Map([['start', { w: 120, h: 50 }], ['end', { w: 200, h: 80 }]]);
    const layout = layoutNodeGuideComment(cards, [comment], [{ from: 'start', to: 'end' }], dimensions, 360, 72);
    assert.ok(layout, 'the complete teaching frame is compacted for the guide');
    assert.deepEqual(layout.nodes, [{ id: 'start', x: 24, y: 132 }, { id: 'end', x: 24, y: 214 }]);
    assert.deepEqual(layout.comments, [{ ...comment, x: 0, y: 0, w: 248, h: 318 }]);
    assert.deepEqual({ cards, comment }, before, 'only detached display geometry is changed');
});

test('unrelated, empty and multiple comment frames retain their existing authored layout', () => {
    const cards = [{ id: 'inside', x: 100, y: 140 }, { id: 'outside', x: 1100, y: 140 }];
    const dimensions = new Map(cards.map(card => [card.id, { w: 120, h: 50 }]));
    const frame = { id: 'comment', x: 76, y: 80, w: 900, h: 280, title: 'One branch', content: 'Keep this beside its branch.', color: '#637d89', moveContents: true, selected: false, readOnly: true };
    assert.equal(layoutNodeGuideComment(cards, [frame], [], dimensions, 360, 40), null);
    assert.equal(layoutNodeGuideComment([], [frame], [], dimensions, 360, 40), null);
    assert.equal(layoutNodeGuideComment([cards[0]], [frame, { ...frame, id: 'other' }], [], dimensions, 360, 40), null);
});

test('guide routes use measured named pins and omit connections whose pin is absent', () => {
    const connections = [
        { id: 'visible', from: 'a', fromPort: 'out', to: 'b', toPort: 'section.Direction', kind: 'text', off: false },
        { id: 'missing', from: 'a', fromPort: 'out', to: 'b', toPort: 'missing', kind: 'text', off: false },
    ];
    const anchors = new Map([
        ['a/out', { x: 40, y: 60, side: 'right' }],
        ['b/section.Direction', { x: 310, y: 120, side: 'left' }],
    ]);
    const wires = nodeGuideWires(connections, (nodeId, portId) => anchors.get(nodeId + '/' + portId));
    assert.equal(wires.length, 1);
    assert.equal(wires[0].id, 'visible');
    assert.match(wires[0].d, /^M 40,60 L 65,60 /);
    assert.match(wires[0].d, /L 310,120$/);
    assert.equal(wires[0].label.text, 'text');
});

test('the fixed preview shows the selected native card and its named pins without a canvas', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'lattice-guide-preview-'));
    try {
        for (const name of ['ArtifactPin', 'NodeCard', 'CommentFrame', 'NodeGuidePreview']) {
            const sourceURL = new URL(`../ui/${name}.svelte`, import.meta.url);
            const output = compile(await readFile(sourceURL, 'utf8'), { filename: `${name}.svelte`, generate: 'server', css: 'injected' });
            const code = output.js.code.replace(/(['"])(svelte(?:\/[^'" ]*)?)\1/g, (_, quote, specifier) => JSON.stringify(import.meta.resolve(specifier)))
                .replace(/(['"])(\.\.?\/[^'"]+)\1/g, (_, quote, specifier) => JSON.stringify(specifier.endsWith('.svelte') ? specifier.replace(/\.svelte$/, '.mjs') : new URL(specifier, sourceURL).href));
            await writeFile(join(directory, `${name}.mjs`), code);
        }
        const { default: Preview } = await import(pathToFileURL(join(directory, 'NodeGuidePreview.mjs')).href);
        const card = prepareNodeGuideScene(compose()).data.cards.find(card => card.id === 'guidance');
        const html = new JSDOM(render(Preview, { props: { card } }).body).window.document;
        const node = html.querySelector('.pc-node-native');
        assert.ok(node, 'the real native card is visible');
        assert.equal(node.querySelector('.pc-node-title').textContent, 'Compose');
        assert.equal(node.style.left, '0px');
        assert.equal(node.style.top, '0px');
        assert.equal(html.querySelector('.pc-port[data-port="section.Direction"]').getAttribute('data-kind'), 'text');
        assert.ok(node.closest('[inert]'), 'preview controls cannot edit the selected node');
        assert.equal(html.querySelector('.pc-canvas-host'), null);
        const comment = { id: 'comment', x: 900, y: 450, w: 360, h: 220, title: 'Scene brief', content: 'Direction and boundary', color: '#637d89', moveContents: true, selected: true, readOnly: false };
        const commentHTML = new JSDOM(render(Preview, { props: { card, comment } }).body).window.document;
        const frame = commentHTML.querySelector('.pc-comment-frame');
        assert.ok(frame, 'comments use the actual comment renderer');
        assert.equal(frame.style.left, '0px');
        assert.equal(frame.style.top, '0px');
        assert.equal(frame.querySelector('.pc-comment-title-input'), null, 'comment preview has no edit input');
        assert.ok(frame.closest('[inert]'));
        assert.equal(frame.querySelector('.pc-comment-notes').textContent, 'Direction and boundary');
        assert.equal(comment.x, 900, 'fixed rendering does not change the selected comment');
    } finally {
        const path = relative(resolve(tmpdir()), resolve(directory));
        assert.ok(path && !path.startsWith('..') && !isAbsolute(path));
        await rm(directory, { recursive: true, force: true });
    }
});

test('example previews reserve a themed full-width canvas instead of adding controls', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'lattice-guide-canvas-'));
    try {
        for (const name of ['DiagnosticMessage', 'ArtifactPin', 'NodeCard', 'GroupCard', 'WireLayer', 'CommentFrame', 'NodeProfilePicker', 'CanvasLayer', 'NodeGuideCanvas']) {
            const sourceURL = new URL(`../ui/${name}.svelte`, import.meta.url);
            const output = compile(await readFile(sourceURL, 'utf8'), { filename: `${name}.svelte`, generate: 'server', css: 'injected' });
            const code = output.js.code.replace(/(['"])(svelte(?:\/[^'" ]*)?)\1/g, (_, quote, specifier) => JSON.stringify(import.meta.resolve(specifier)))
                .replace(/(['"])(\.\.?\/[^'"]+)\1/g, (_, quote, specifier) => JSON.stringify(specifier.endsWith('.svelte') ? specifier.replace(/\.svelte$/, '.mjs') : new URL(specifier, sourceURL).href));
            await writeFile(join(directory, `${name}.mjs`), code);
        }
        const { default: Preview } = await import(pathToFileURL(join(directory, 'NodeGuideCanvas.mjs')).href);
        const html = new JSDOM(render(Preview, { props: { scene: prepareNodeGuideScene(compose()).data } }).body).window.document;
        assert.ok(html.querySelector('.pc-canvas-host'), 'the theme cascade applies to the real canvas host');
        assert.equal(html.querySelector('.pc-canvas-host').getAttribute('aria-label'), 'Example node graph');
        assert.equal(html.querySelectorAll('button').length, 0, 'zoom or execution controls are not added by the preview');
    } finally {
        const path = relative(resolve(tmpdir()), resolve(directory));
        assert.ok(path && !path.startsWith('..') && !isAbsolute(path));
        await rm(directory, { recursive: true, force: true });
    }
});
