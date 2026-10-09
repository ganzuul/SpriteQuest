import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as H from '../src/history.js';
const documentState = graph => JSON.stringify(Object.fromEntries(H.GRAPH_DOCUMENT_FIELDS.filter(key => Object.hasOwn(graph, key)).map(key => [key, graph[key]])));

test('a presentation effect follows its exact undo entry across undo and redo', () => {
    const graph = { id: 'comment-history-effect', schema: 3, runtime: 2, mode: 'native-pre', nodes: {
        frame: { id: 'frame', type: 'note', commentFrame: true, x: 0, y: 0, w: 400, h: 300 },
    }, wires: {}, groups: {} };
    H.track(graph);
    const beforeState = documentState(graph), receipt = H.capturePresentationStep(graph);
    const moved = structuredClone(graph); moved.nodes.frame.x = 40;
    assert.equal(H.commitGraphDocument(graph, moved), true);
    const effect = Object.freeze({});
    assert.equal(H.attachPresentationEffect(graph, { receipt, effect, beforeState, afterState: documentState(graph) }), true);
    const events = [];
    const off = H.onHistoryChange((current, event) => {
        if (current === graph && event) events.push({ x: current.nodes.frame.x, ...event });
    });
    try {
        H.undo(graph); H.redo(graph);
        assert.deepEqual(events, [{ x: 0, direction: 'undo', effect }, { x: 40, direction: 'redo', effect }]);
    } finally { off(); }
});

test('effects cannot attach to stale, pending, or already tagged history steps', () => {
    const graph = { id: 'comment-history-stale-effect', nodes: { frame: { id: 'frame', type: 'note', x: 0, y: 0 } }, wires: {}, groups: {} };
    H.track(graph);
    const beforeState = documentState(graph), receipt = H.capturePresentationStep(graph), moved = structuredClone(graph);
    moved.nodes.frame.x = 40; H.commitGraphDocument(graph, moved);
    const afterState = documentState(graph), effect = Object.freeze({});
    assert.equal(H.attachPresentationEffect(graph, { receipt, effect, beforeState: afterState, afterState }), false);
    assert.equal(H.attachPresentationEffect(graph, { receipt, effect: {}, beforeState, afterState }), false);
    assert.equal(H.attachPresentationEffect(graph, { receipt, effect, beforeState, afterState }), true);
    assert.equal(H.attachPresentationEffect(graph, { receipt, effect: Object.freeze({}), beforeState, afterState }), false);
    const nextReceipt = H.capturePresentationStep(graph);
    moved.nodes.frame.x = 80; H.commitGraphDocument(graph, moved);
    assert.equal(H.attachPresentationEffect(graph, { receipt, effect: Object.freeze({}), beforeState, afterState }), false);
    const nextBefore = afterState, nextAfter = documentState(graph);
    graph.nodes.frame.title = 'Pending title'; H.noteChange(graph);
    assert.equal(H.attachPresentationEffect(graph, { receipt: nextReceipt, effect: Object.freeze({}), beforeState: nextBefore, afterState: nextAfter }), false);
    H.flush(graph);
});

test('unrelated edits keep their own undo step and never serialize view effects', () => {
    const graph = { id: 'comment-history-independent-effect', nodes: { frame: { id: 'frame', type: 'note', x: 0, y: 0 } }, wires: {}, groups: {} };
    H.track(graph);
    const beforeState = documentState(graph), receipt = H.capturePresentationStep(graph), moved = structuredClone(graph);
    moved.nodes.frame.x = 40; H.commitGraphDocument(graph, moved);
    const effect = Object.freeze({});
    assert.equal(H.attachPresentationEffect(graph, { receipt, effect, beforeState, afterState: documentState(graph) }), true);
    const renamed = structuredClone(graph); renamed.nodes.frame.title = 'A later title'; H.commitGraphDocument(graph, renamed);
    const events = [], off = H.onHistoryChange((current, event) => { if (current === graph) events.push(event); });
    try {
        H.undo(graph); assert.equal(graph.nodes.frame.x, 40); assert.equal(events.at(-1), undefined);
        H.undo(graph); assert.equal(graph.nodes.frame.x, 0); assert.deepEqual(events.at(-1), { direction: 'undo', effect });
        H.redo(graph); assert.equal(graph.nodes.frame.x, 40); assert.deepEqual(events.at(-1), { direction: 'redo', effect });
        H.redo(graph); assert.equal(graph.nodes.frame.title, 'A later title'); assert.equal(events.at(-1), undefined);
        assert.equal(Object.hasOwn(graph, 'effect'), false);
        assert.equal(documentState(graph), documentState(renamed));
        assert.deepEqual(Object.keys(graph), ['id', 'nodes', 'wires', 'groups']);
    } finally { off(); }
});

test('a receipt from an identical abandoned edit cannot tag its replacement entry', () => {
    const graph = { id: 'comment-history-repeated-transition', nodes: { frame: { id: 'frame', type: 'note', x: 0, y: 0 } }, wires: {}, groups: {} };
    H.track(graph);
    const beforeState = documentState(graph), receipt = H.capturePresentationStep(graph), moved = structuredClone(graph);
    moved.nodes.frame.x = 40; H.commitGraphDocument(graph, moved);
    const afterState = documentState(graph);
    H.undo(graph);
    const replacementReceipt = H.capturePresentationStep(graph);
    H.commitGraphDocument(graph, moved);
    assert.equal(H.attachPresentationEffect(graph, { receipt, effect: Object.freeze({}), beforeState, afterState }), false);
    assert.equal(H.attachPresentationEffect(graph, { receipt: replacementReceipt, effect: Object.freeze({}), beforeState, afterState }), true);
});
