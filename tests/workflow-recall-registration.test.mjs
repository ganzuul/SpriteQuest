import assert from 'node:assert/strict';
import {test} from 'node:test';
import {OPERATIONS,operationDefaults,describeOperation} from '../src/workflow/catalog.js';
import {validateGraphStructure} from '../src/workflow/contracts.js';
import {runWorkflow} from '../src/workflow/runtime.js';
const graph=()=>({id:'recall-root',name:'Recall root',schema:3,runtime:2,mode:'native-unified',nodes:{arm:{id:'arm',type:'workflow',...operationDefaults('hotkey-arm'),actorId:'mara',memorySetId:'mara-memories'}},wires:{},groups:{},portals:{},definitions:{},roles:{}});

test('Recall Shortcut defaults to Ctrl+Shift+M',()=>{assert.deepEqual(operationDefaults('hotkey-arm').hotkey,{code:'KeyM',ctrl:true,alt:false,shift:true,meta:false});});
test('Recall registers strict root host capabilities with stage-correct pins and portable settings',()=>{
 assert.equal(OPERATIONS.recall.rootOnly,true);assert.equal(OPERATIONS.recall.requestBound,0);assert.equal(OPERATIONS['hotkey-arm'].hostOperation,true);
 const g=graph();assert.equal(validateGraphStructure(g).ok,true);assert.deepEqual(describeOperation(g,g.nodes.arm).data.ports.map(p=>[p.id,p.kind,p.direction]),[['proposal','data','output']]);
 g.nodes.recall={id:'recall',type:'workflow',...operationDefaults('recall'),actorId:'mara',memorySetId:'mara-memories',phase:'post',activation:'keyword',keywords:['letter']};
 const described=describeOperation(g,g.nodes.recall);assert.equal(described.ok,true,JSON.stringify(described));assert.equal(described.data.descriptor.phase,'post');assert.equal(described.data.ports.find(p=>p.id==='source').kind,'data');
 assert.equal(describeOperation(g,{...g.nodes.recall,actorId:''}).ok,false);
});
test('Recall host operation cannot execute without an owned root host seam',async()=>{
 const g=graph();const result=await runWorkflow(g,{target:{workflowId:g.id,instancePath:[],nodeId:'arm',portId:'proposal'}});assert.equal(result.ok,false);assert.equal(result.error.code,'HOST_OPERATION_REQUIRED');
});
