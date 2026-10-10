import {UNIFIED_WORKFLOW_EXAMPLE_DATA} from '../src/workflow/unified-example-data.js?v=0.26.0';
const exampleCount=30+UNIFIED_WORKFLOW_EXAMPLE_DATA.length;
import test from 'node:test';
import assert from 'node:assert/strict';

test('example thumbnails project all legacy and unified primary workflows in lesson order', async () => {
    const api = await import('../src/ui/example-catalog.js?v=0.26.0').catch(error => {
        if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
        return {};
    });
    assert.equal(typeof api.projectWorkflowExamples, 'function', 'The native package thumbnail projection is available');
    const tiles = api.projectWorkflowExamples();
    assert.equal(tiles.length, exampleCount);
    assert.deepEqual(tiles.map(tile => tile.number), Array.from({ length: exampleCount }, (_, index) => index + 1));
    assert.equal(tiles[0].title, 'Make a scene brief');
    assert.equal(tiles[29].title, 'Combine memory with a voice pass');
    for (const tile of tiles) {
        assert.ok(tile.thumbnail.nodes.length, tile.title);
        assert.ok(tile.thumbnail.wires.length, tile.title);
        assert.ok(tile.thumbnail.nodes.every(node => node.title && node.ports.every(port => port.label && port.kind)));
        assert.ok(tile.thumbnail.bounds.w > 0 && tile.thumbnail.bounds.h > 0);
    }
});

test('thumbnails preserve native authored positions, named typed wires, labels and comment notes', async () => {
    const { listWorkflowExamples } = await import('../src/workflow/examples.js?v=0.26.0');
    const { projectWorkflowExamples } = await import('../src/ui/example-catalog.js?v=0.26.0');
    const examples = listWorkflowExamples(), before = structuredClone(examples), tiles = projectWorkflowExamples();
    for (const [index, example] of examples.entries()) {
        const preview = tiles[index].thumbnail;
        assert.equal(preview.nodes.length + preview.comments.length, Object.keys(example.graph.nodes).length);
        assert.equal(preview.wires.length, Object.keys(example.graph.wires).length);
        for (const node of preview.nodes) {
            const authored = example.graph.nodes[node.id];
            assert.equal(node.x, authored.x);
            assert.equal(node.y, authored.y);
            assert.equal(node.w, authored.w || 260);
            if (authored.title || authored.alias || authored.presentation?.alias) assert.equal(node.title, authored.presentation?.alias || authored.alias || authored.title);
            assert.ok(node.x >= preview.bounds.x && node.x + node.w <= preview.bounds.x + preview.bounds.w);
            assert.ok(node.y >= preview.bounds.y && node.y + node.h <= preview.bounds.y + preview.bounds.h);
        }
        for (const comment of preview.comments) {
            const authored = example.graph.nodes[comment.id];
            assert.deepEqual([comment.x, comment.y, comment.w, comment.h, comment.title, comment.content], [authored.x, authored.y, authored.w, authored.h, authored.title, authored.content]);
        }
        for (const wire of preview.wires) {
            const authored = example.graph.wires[wire.id];
            assert.deepEqual(wire.from, { nodeId: authored.from, portId: authored.fromPort });
            assert.deepEqual(wire.to, { nodeId: authored.to, portId: authored.toPort });
            const source = preview.nodes.find(node => node.id === authored.from).ports.find(pin => pin.dir === 'out' && pin.port === authored.fromPort);
            assert.equal(wire.kind, source.kind);
            assert.ok(wire.d.startsWith(`M ${source.x},${source.y} `));
            assert.match(wire.d, /C /);
        }
    }
    assert.deepEqual(examples, before, 'Preparing thumbnails cannot change saved examples');
});

test('stable example revisions reuse immutable thumbnail projections', async () => {
    const { projectWorkflowExamples } = await import('../src/ui/example-catalog.js?v=0.26.0');
    const first = projectWorkflowExamples(), again = projectWorkflowExamples();
    assert.equal(again, first);
    assert.equal(Object.isFrozen(first), true);
    assert.equal(Object.isFrozen(first[0].thumbnail.nodes[0].ports), true);
    assert.throws(() => { first[0].thumbnail.nodes[0].title = 'Changed'; }, TypeError);
});

test('a malformed primary retains its diagnostic tile while the other previews stay usable', async () => {
    const { WORKFLOW_EXAMPLE_DATA } = await import('../src/workflow/example-data.js?v=0.26.0');
    const { projectWorkflowExamples } = await import('../src/ui/example-catalog.js?v=0.26.0');
    const entry = WORKFLOW_EXAMPLE_DATA[0], node = Object.values(entry.packages[0].graph.nodes).find(node => node.type === 'workflow');
    const operation = node.operation;
    try {
        node.operation = 'missing-example-operation';
        let tiles;
        assert.doesNotThrow(() => { tiles = projectWorkflowExamples(); }, 'A malformed example must not abort the workspace catalog');
        assert.equal(tiles.length, exampleCount);
        assert.deepEqual(tiles.map(tile => tile.number), Array.from({ length: exampleCount }, (_, index) => index + 1));
        assert.equal(tiles[0].title, 'Make a scene brief');
        assert.equal(tiles[0].thumbnail, null);
        assert.match(tiles[0].issue, /operation|unsupported|unknown/i);
        assert.ok(tiles.slice(1).every(tile => !tile.issue && tile.thumbnail.nodes.length));
    } finally { node.operation = operation; }
    const repaired = projectWorkflowExamples();
    assert.equal(repaired[0].issue, '');
    assert.ok(repaired[0].thumbnail.nodes.length);
});
