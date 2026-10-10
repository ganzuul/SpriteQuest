import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {createChatDocumentCatalog} from '../src/workflow/document-catalog.js?v=0.27.0';
import {prepareNativeConnectionEdit} from '../src/workflow/connection-edits.js?v=0.27.0';
import {createConfiguredNodeSession,configuredCreationStage,nodeNeedsConfiguration,iterationHelperChoices} from '../src/ui/configured-node-creation.js?v=0.27.0';
const source=await readFile(new URL('../src/ui/controller.js',import.meta.url),'utf8');
function actual(name,env){const start=source.indexOf('function '+name+'('),end=source.indexOf('\n}',start)+2;assert.ok(start>=0);return Function('env','with(env){'+source.slice(start,end)+';return '+name+';}')(env);}
function fixture(){
 const graph={id:'setup-controller',schema:3,runtime:2,mode:'native-unified',definitions:{},portals:{},nodes:{compose:{id:'compose',type:'workflow',operation:'compose',phase:'post',sections:[{name:'body',text:''}]}},wires:{}};
 const context={chatId:'story',chatMetadata:{},chat:[]};let user='default-user',camera=10,commits=0;const catalog=createChatDocumentCatalog({getContext:()=>context,getUserId:()=>user,saveMetadata:()=>true});catalog.define({targetId:'souls.json',name:'Souls',format:'json',content:'[]',visibility:{kind:'public'}});
 const capture={},env={current:graph,selected:{id:'compose'},graphViews:{readEditor:()=>({prepared:{savedGraph:graph}})},editorDraw:{nativeCards:{compose:{phase:'post',ports:[{port:'section.body',dir:'in',kind:'text'}]}}},editorCurrent:token=>token===capture,workflowRuntime:{getStoryDocumentCatalog:()=>catalog},nodeDocumentCaptures:new Map(),nodeCreationScopes:new WeakMap(),pendingConfiguredNode:null,workbench:{update(value){if('configureNode'in value)env.view=value.configureNode;}},canvas:{toGraph:(x,y)=>({x:x+camera,y:y+camera})},createConfiguredNodeSession,configuredCreationStage,nodeNeedsConfiguration,iterationHelperChoices,
 prepareNativeCreation:(token,command)=>prepareNativeConnectionEdit(graph,command),prepareShelfNodeCreation:(token,command,at)=>prepareNativeConnectionEdit(graph,{...command,graphPoint:at??{x:0,y:0}}),commitCaptured(){commits++;return {ok:true,data:{changed:true}};}};
 const start=source.indexOf('const configuredNodeSession ='),end=source.indexOf('\n});',start)+4;assert.ok(start>=0);env.configuredNodeSession=Function('env','with(env){'+source.slice(start,end)+';return configuredNodeSession;}')(env);
 for(const name of ['requestNodeCreation','cancelConfiguredNode','commitNodeCreation'])env[name]=actual(name,env);
 return {graph,catalog,capture,env,user:value=>user=value,camera:value=>camera=value,commits:()=>commits};
}
test('actual controller native pin configuration keeps the origin stage and named output before preparing',async()=>{
 const f=fixture(),before=structuredClone(f.graph),pending=f.env.requestNodeCreation(f.capture,{kind:'create',operation:'read-file',requiresConfiguration:true,graphPoint:{x:25,y:30},connection:{origin:{nodeId:'compose',portId:'section.body'},portId:'text'}});assert.equal(f.env.view.phase,'post');assert.equal(JSON.stringify(f.env.view).includes('\"content\"'),false);const applied=f.env.configuredNodeSession.apply(f.env.view.key,'{"targetId":"souls.json"}','post');assert.equal(applied.ok,true,JSON.stringify(applied));const prepared=await pending;assert.equal(prepared.ok,true,JSON.stringify(prepared));const node=prepared.data.candidate.nodes[prepared.data.addedNodeIds[0]];assert.equal(node.phase,'post');assert.equal(node.x,25);assert.equal(node.targetId,'souls.json');assert.deepEqual(f.graph,before);assert.equal(f.env.view,null);
});
test('actual controller shelf configuration captures drop geometry and checks document lease again at commit',async()=>{
 const f=fixture(),pending=f.env.requestNodeCreation(f.capture,{kind:'create',operation:'read-file'},{x:30,y:40},true);f.camera(1000);assert.equal(f.env.configuredNodeSession.apply(f.env.view.key,'{"targetId":"souls.json"}','post').ok,true);const prepared=await pending,node=prepared.data.candidate.nodes[prepared.data.addedNodeIds[0]];assert.equal(node.x,40);assert.equal(node.y,50);f.catalog.remove('souls.json');const result=f.env.commitNodeCreation(f.capture,prepared);assert.equal(result.ok,false);assert.equal(result.error.code,'STALE_DOCUMENT_SETUP');assert.equal(f.commits(),0);
});
test('actual controller cancellation creates no candidate and scope switches hold configuration',async()=>{
 const f=fixture(),before=structuredClone(f.graph),pending=f.env.requestNodeCreation(f.capture,{kind:'create',operation:'read-file',graphPoint:{x:0,y:0}});const key=f.env.view.key;f.user('other-user');assert.equal(f.env.configuredNodeSession.apply(key,'{"targetId":"souls.json"}','post').error.code,'STALE_DOCUMENT_SETUP');f.env.cancelConfiguredNode(key);assert.equal((await pending).error.code,'NODE_CONFIGURATION_CANCELLED');assert.equal(f.env.nodeDocumentCaptures.size,0);assert.deepEqual(f.graph,before);assert.equal(f.commits(),0);
});
