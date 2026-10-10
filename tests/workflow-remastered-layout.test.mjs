import test from 'node:test';
import assert from 'node:assert/strict';
import {REMASTERED_WORKFLOW_EXAMPLE_DATA as entries} from '../src/workflow/remastered-example-data.js';
const overlaps=(a,b)=>a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;
const contains=(a,b)=>a.x<=b.x&&a.y<=b.y&&a.x+a.w>=b.x+b.w&&a.y+a.h>=b.y+b.h;
test('all roots and helper views have separated cards and honest group geometry',()=>{
 for(const entry of entries)for(const graph of [entry.packages[0].graph,...Object.values(entry.packages[0].graph.definitions).map(d=>d.body)]){const nodes=Object.values(graph.nodes),groups=Object.values(graph.groups??{});for(let i=0;i<nodes.length;i++){const a=nodes[i];assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.y)&&a.w>0&&a.h>0,entry.id+' finite layout');for(const b of nodes.slice(i+1))assert.equal(overlaps(a,b),false,`${entry.id}: ${a.id} overlaps ${b.id}`);}for(let i=0;i<groups.length;i++){const a=groups[i];for(const b of groups.slice(i+1))assert.equal(overlaps(a,b),false,`${entry.id}: ${a.id} overlaps group ${b.id}`);for(const n of nodes){if(a.members.includes(n.id)){assert.equal(n.inGroup,a.id);assert.ok(contains(a,n),`${entry.id}: group does not contain member`);}else assert.equal(overlaps(a,n),false,`${entry.id}: group crosses nonmember ${n.id}`);}}}
});
test('saved teaching instructions are nearby real comments and helpers retain their own boundaries',()=>{
 for(const entry of entries){const graph=entry.packages[0].graph,note=graph.nodes['lesson-note'];assert.equal(note.commentFrame,true);assert.match(note.content,/Checkpoints:/);assert.ok(note.y+note.h<=Math.min(...Object.values(graph.nodes).filter(n=>n.type!=='note').map(n=>n.y)));for(const d of Object.values(graph.definitions)){const input=d.body.nodes.item,output=d.body.nodes.result;assert.ok(input.x<output.x);assert.equal(input.interfacePortId,'item');assert.equal(output.interfacePortId,'result');}}
});
