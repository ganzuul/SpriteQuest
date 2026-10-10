import assert from 'node:assert/strict';
import {test} from 'node:test';
import {formatRecords} from '../src/workflow/operations/format-records.js';
import {executeFileNode} from '../src/workflow/operations/file-nodes.js';
test('Format single JSON explicitly preserves a whole progression document object',async()=>{
 const state={values:[{key:'experience',value:180}],ledger:[{eventId:'a'}],campaign:'Story-2'};
 const pure=formatRecords(state,{format:'json',jsonShape:'single'});assert.equal(pure.ok,true,JSON.stringify(pure));assert.deepEqual(JSON.parse(pure.data.text),state);assert.deepEqual(pure.data.records,[state]);assert.deepEqual(pure.data.serialization,{format:'json',jsonShape:'single'});
 const result=await executeFileNode({operation:'format',jsonShape:'single'},{in:{kind:'data',value:state}},{phase:'post'});assert.equal(result.ok,true,JSON.stringify(result));assert.deepEqual(JSON.parse(result.outputs.text.text),state);
 assert.deepEqual(JSON.parse(formatRecords(state,{format:'json'}).data.text),[state],'Existing array format remains the default');
});
test('single JSON shape cannot pick an arbitrary record from zero or multiple records',()=>{
 for(const value of [[],[{id:'a'},{id:'b'}]]){const result=formatRecords(value,{format:'json',jsonShape:'single'});assert.equal(result.ok,false);assert.equal(result.error.code,'FORMAT_CARDINALITY');}
 assert.equal(formatRecords({id:'a'},{format:'json',jsonShape:'guess'}).ok,false);
 assert.equal(formatRecords({id:'a'},{format:'jsonl',jsonShape:'single'}).ok,false);
});
test('single JSON still applies mapping/schema and preserves private artifact labels',async()=>{
 const result=await executeFileNode({operation:'format',jsonShape:'single',mapping:'select',fields:[{name:'experience',path:['xp']}],schema:JSON.stringify({type:'object',required:['experience'],properties:{experience:{type:'number'}},additionalProperties:false})},{in:{kind:'data',value:{xp:20,other:30},visibility:{kind:'actor-private',actorId:'mara'}}});assert.equal(result.ok,true,JSON.stringify(result));assert.deepEqual(JSON.parse(result.outputs.text.text),{experience:20});assert.deepEqual(result.outputs.text.visibility,{kind:'actor-private',actorId:'mara'});
});
