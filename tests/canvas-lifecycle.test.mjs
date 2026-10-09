import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture, mouse } from './canvas-fixture.mjs';

test('switching prepared scopes cancels a body overlay without mutating either document', async () => {
    const updates = [], { canvas, graph, a, host } = fixture({ onPresentationChange: ids => updates.push(ids) });
    mouse(host.querySelector('[data-id="a"]'), 'mousedown', 80, 80);
    mouse(window, 'mousemove', 130, 120);
    assert.deepEqual([a.x,a.y],[100,90]);
    const replacement = structuredClone(graph); replacement.id = 'other';
    const before = structuredClone(replacement);
    canvas.setGraph(replacement);
    mouse(window,'mouseup',130,120);
    assert.deepEqual([a.x,a.y],[50,50]);
    assert.deepEqual(replacement,before); assert.deepEqual(updates,[]);
    assert.equal(canvas.hasContentGesture(),false); await canvas.destroy();
});

test('destroy releases window and host gesture listeners and unmounts the current layer', async () => {
    const removed = fixture(); await removed.canvas.destroy();
    mouse(removed.host,'mousedown',80,80); mouse(window,'mousemove',130,130); mouse(window,'mouseup',130,130);
    assert.deepEqual([removed.a.x,removed.a.y],[50,50]);
    assert.equal(removed.canvas.marquee,null); assert.equal(removed.host.querySelector('.pc-viewport'),null);
});

test('cancelling a pending wheel frame reconciles the camera and prevents stale paint', async () => {
    const wheeled=fixture();
    wheeled.host.dispatchEvent(new window.WheelEvent('wheel',{deltaY:-120,clientX:240,clientY:160,bubbles:true,cancelable:true}));
    assert.ok(wheeled.graph.view.zoom>1);
    window.dispatchEvent(new window.Event('resize'));
    const transform=`translate(${wheeled.graph.view.x}px, ${wheeled.graph.view.y}px) scale(${wheeled.graph.view.zoom})`;
    assert.equal(wheeled.canvas.viewport.style.transform,transform);
    await new Promise(resolve=>setTimeout(resolve,10)); assert.equal(wheeled.canvas.viewport.style.transform,transform);
    await wheeled.canvas.destroy();
});
