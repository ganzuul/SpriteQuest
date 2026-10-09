import test from 'node:test';
import assert from 'node:assert/strict';
import * as preparation from '../src/ui/workspace-preparation.js';

test('fresh desktop camera keeps authored cards readable beside the floating shelf', () => {
    const camera = preparation.initialWorkspaceCamera({ x: 100, y: 140, w: 260, h: 80 }, { width: 745, height: 494, shelf: { x: 13, y: 13, w: 110, h: 319 } });
    assert.equal(camera.zoom, 1);
    assert.equal(100 + camera.x, 147);
    assert.equal(140 + camera.y, 48);
});
test('fresh narrow camera keeps the first named card below the shelf without shrinking the graph', () => {
    const camera = preparation.initialWorkspaceCamera({ x: 100, y: 140, w: 260, h: 64 }, { width: 346, height: 299, shelf: { x: 13, y: 13, w: 320, h: 181 } });
    assert.equal(camera.zoom, 1);
    assert.equal(100 + camera.x, 16);
    assert.equal(140 + camera.y, 210);
    assert.ok(140 + camera.y + 64 <= 299);
});
test('empty preparation has a readable neutral camera', () => {
    assert.deepEqual(preparation.initialWorkspaceCamera(null, { width: 320, height: 200 }), { x: 0, y: 0, zoom: 1 });
});

for (const width of [306, 346, 722]) test(`fresh ${width + 14}px layout leaves the first named card clear of the run meter`, () => {
    const shelf = width < 575 ? { x: 13, y: 13, w: width - 26, h: 181 } : { x: 13, y: 13, w: 110, h: 237 };
    const meter = { x: 14, y: 261, w: 125, h: 25 }, node = { x: 100, y: 140, w: 260, h: 96 };
    const camera = preparation.initialWorkspaceCamera(node, { width, height: 299, shelf, meter });
    const card = { x: node.x + camera.x, y: node.y + camera.y, w: node.w, h: node.h };
    const overlap = card.x < meter.x + meter.w && card.x + card.w > meter.x && card.y < meter.y + meter.h && card.y + card.h > meter.y;
    assert.equal(camera.zoom, 1); assert.equal(overlap, false);
    assert.ok(card.x + 12 < width, 'The left named input pin stays inside the canvas');
    if (width < 575) assert.ok(card.y >= shelf.y + shelf.h + 16, 'Card stays below the two-column shelf');
});
