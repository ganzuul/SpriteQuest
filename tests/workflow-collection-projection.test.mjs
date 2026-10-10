import assert from 'node:assert/strict';
import {test} from 'node:test';
import {reduceCollection,executeCollection,describeCollection} from '../src/workflow/operations/collection-nodes.js';
test('Collection project keeps each exact selected record in iteration order',()=>{
 const first={eventId:'a',evidence:{quote:'casts'}},second={eventId:'b',evidence:{quote:'casts again'}};
 const result=reduceCollection([{event:first},{event:second}],{mode:'project',fieldPath:['event']});assert.equal(result.ok,true,JSON.stringify(result));assert.deepEqual(result.data.value,[first,second]);assert.equal(result.data.actualCalls,0);
 assert.deepEqual(reduceCollection([],{mode:'project',fieldPath:['event']}).data.value,[]);
 assert.equal(reduceCollection([{other:1}],{mode:'project',fieldPath:['event']}).error.code,'UNRESOLVED_COLLECTION');
 assert.deepEqual(reduceCollection([{other:1},{event:first}],{mode:'project',fieldPath:['event'],missingPolicy:'exclude'}).data.value,[first]);
 assert.deepEqual(reduceCollection([{other:1}],{mode:'project',fieldPath:['event'],missingPolicy:'include'}).data.value,[null]);
});
test('Collection flatten combines one explicit array level and enforces total bound',()=>{
 const result=reduceCollection([[{eventId:'a'}],[],[{eventId:'b'},{eventId:'c'}]],{mode:'flatten'});assert.equal(result.ok,true,JSON.stringify(result));assert.deepEqual(result.data.value.map(e=>e.eventId),['a','b','c']);
 assert.deepEqual(reduceCollection([],{mode:'flatten'}).data.value,[]);
 assert.equal(reduceCollection([[1],2],{mode:'flatten'}).error.code,'INVALID_COLLECTION');
 assert.equal(reduceCollection([Array(600).fill(1),Array(600).fill(2)],{mode:'flatten'}).error.code,'COLLECTION_LIMIT');
 assert.deepEqual(reduceCollection([[[1]]],{mode:'flatten'}).data.value,[[1]],'No recursive implicit flattening');
});
test('Collection projection and flatten preserve private source restrictions',async()=>{
 for(const [mode,value,path]of[['project',[{secret:{id:'a'}}],['secret']],['flatten',[[{id:'a'}]],[]]]){
  const node={operation:'collection',mode,fieldPath:path};assert.equal(describeCollection(node).ok,true);
  const result=await executeCollection(node,{in:{kind:'data',value,visibility:{kind:'actor-private',actorId:'mara'}}});assert.equal(result.ok,true,JSON.stringify(result));assert.deepEqual(result.artifact.visibility,{kind:'actor-private',actorId:'mara'});
 }
});
