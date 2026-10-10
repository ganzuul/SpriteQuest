import test from 'node:test';
import assert from 'node:assert/strict';
import * as retained from '../src/canvas/retained-scene.js';

test('content and coordinate patches retain membership order and untouched slots', () => {
    assert.equal(typeof retained.updateRenderSlots,'function');
    const slots=new Map(), a={id:'a',x:10}, b={id:'b',x:20};
    const first=retained.updateRenderSlots([a,b],[],slots,value=>({id:value.id,value}));
    const nextA={...a,x:30}; const next=retained.updateRenderSlots([nextA,b],first,slots,value=>({id:value.id,value}));
    assert.equal(next,first); assert.equal(next[0].value,nextA); assert.equal(next[1].value,b);
    const reordered=retained.updateRenderSlots([b,nextA],next,slots,value=>({id:value.id,value}));
    assert.notEqual(reordered,next); assert.equal(reordered[1],first[0]);
    const removed=retained.updateRenderSlots([b],reordered,slots,value=>({id:value.id,value}));
    assert.equal(removed[0],first[1]); assert.equal(slots.has('a'),false);
});
