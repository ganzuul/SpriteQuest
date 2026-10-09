// Canvas movement is one history step; camera and selection remain outside history.
import assert from 'node:assert/strict';
import { fixture, mouse } from './canvas-fixture.mjs';
const v = JSON.parse((await import('node:fs')).readFileSync(new URL('../manifest.json', import.meta.url))).version;
const H = await import(`../src/history.js?v=${v}`);
const { graph, canvas, host, a } = fixture({ onPresentationChange: () => H.noteChange(graph) }); H.track(graph);
const start = { x: a.x, y: a.y };
mouse(host.querySelector('[data-id="a"]'), 'mousedown', 70, 70); mouse(window, 'mousemove', 110, 100); mouse(window, 'mouseup', 110, 100); H.flush(graph);
assert.equal(H.peek(graph).undo, 'move "block"'); const camera = { x: 300, y: 200, zoom: 2 }; graph.view = camera;
H.undo(graph); assert.deepEqual({ x: graph.nodes.a.x, y: graph.nodes.a.y }, start); assert.equal(graph.view, camera); H.redo(graph); assert.equal(graph.nodes.a.x, start.x + 40); canvas.destroy(); console.log('undo-ui: ok');
