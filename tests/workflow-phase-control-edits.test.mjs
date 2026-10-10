import test from 'node:test';
import assert from 'node:assert/strict';
import {operationDefaults} from '../src/workflow/catalog.js';
import {prepareNativeNodeEdit} from '../src/workflow/definition-library.js';
for(const [operation,mode] of [['memory','recall'],['state','curve']])for(const rootMode of ['native-post','native-unified'])test(rootMode+' changes explicit response-stage '+operation+' mode without losing stage',()=>{
 const node={...operationDefaults(operation),id:'work',type:'workflow',phase:'post'}, graph={id:'phase-mode-edit',schema:3,runtime:2,mode:rootMode,roles:{},definitions:{},nodes:{work:node},wires:{}};
 const before=structuredClone(graph);let result;
 assert.doesNotThrow(()=>{result=prepareNativeNodeEdit(graph,{kind:'controls',viewPath:[],nodeId:'work',controls:{mode}});});
 assert.equal(result.ok,true,JSON.stringify(result.error));
 assert.equal(result.data.candidate.nodes.work.mode,mode);
 assert.equal(result.data.candidate.nodes.work.phase,'post');
 assert.deepEqual(graph,before);
});
