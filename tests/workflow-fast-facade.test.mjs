import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import { installMock } from './mock.js';
const moduleUrl=source=>'data:text/javascript,'+encodeURIComponent(source);
const hooks=registerHooks({resolve(specifier,context,next){if(specifier==='/script.js')return {url:moduleUrl('export const isGenerating=()=>false;export const syncMesToSwipe=()=>true;export const syncSwipeToMes=()=>true;'),shortCircuit:true};if(specifier==='/scripts/user.js')return {url:moduleUrl('export const getCurrentUserHandle=()=>globalThis.latticeFacadeUser;'),shortCircuit:true};return next(specifier,context);}});
test('installed facade passes one runtime request object to the real typed transport',async()=>{
    const c=installMock();Object.assign(c,{chatId:'story',characterId:0,chat:[{mes:'I use the wand.',is_user:true}],characters:[{data:{name:'Mara'}}]});globalThis.latticeFacadeUser='default-user';
    const previousFetch=globalThis.fetch;let calls=0;globalThis.fetch=async(url,options)=>{calls++;assert.equal(url,'http://localhost:8080/v1/systemone');const body=JSON.parse(options.body);assert.equal(body.model,'local');assert.deepEqual(body.state,{scene:'The wand flashes.'});assert.ok(body.questions.event);return {ok:true,status:200,text:async()=>JSON.stringify({model:'local',answers:{event:{type:'noul',noul:0.95}},usage:{input_tokens:2,output_tokens:1}})};};
    try{const facade=await import('../src/run.js?v=0.26.0');await facade.initializeNativeWorkflowController();assert.equal(facade.getFastConnectionRegistry().upsert({id:'local',provider:'laya',model:'local',endpoint:'http://localhost:8080/v1/systemone'}).ok,true);
        const nodes={text:{id:'text',type:'workflow',operation:'text',text:JSON.stringify({scene:'The wand flashes.'})},decode:{id:'decode',type:'workflow',operation:'json-decode'},decision:{id:'decision',type:'workflow',operation:'fast-decision',fastConnectionId:'local',questions:{event:{type:'noul',instructions:'Was the wand used?'}}}};
        const graph={id:'facade',schema:3,runtime:2,mode:'native-pre',nodes,wires:{a:{id:'a',route:'wire',from:'text',fromPort:'out',to:'decode',toPort:'in'},b:{id:'b',route:'wire',from:'decode',fromPort:'out',to:'decision',toPort:'in'}},portals:{},definitions:{}};
        const result=await facade.getNativeWorkflowController().runTarget(graph,{workflowId:graph.id,instancePath:[],nodeId:'decision',portId:'out'});assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(result.actualCalls,1);assert.equal(calls,1);
    }finally{globalThis.fetch=previousFetch;delete globalThis.latticeFacadeUser;hooks.deregister();}
});

test('installed facade shares scoped catalog authorization with its trusted native controller',async()=>{
    const c=installMock();Object.assign(c,{chatId:'story',characterId:0,chat:[{mes:'A soul is captured.',is_user:true}],chatMetadata:{},characters:[{name:'Mara',avatar:'mara.png',chat:'Story-2'}]});globalThis.latticeFacadeUser='default-user';
    try {
        const facade=await import('../src/run.js?v=0.26.0'),catalog=facade.getStoryDocumentCatalog();
        assert.equal(catalog,facade.getStoryDocumentCatalog());assert.equal(facade.storyDocumentState().ok,true);
        assert.equal(catalog.define({targetId:'souls',name:'Sword souls',format:'json',content:'[]',visibility:{kind:'hidden'}}).ok,true);
        const graph={id:'file-facade',schema:3,runtime:2,mode:'native-unified',nodes:{read:{id:'read',type:'workflow',operation:'read-file',targetId:'souls'}},wires:{},portals:{},definitions:{}};
        const result=await facade.getNativeWorkflowController().runTarget(graph,{workflowId:graph.id,instancePath:[],nodeId:'read',portId:'document'});
        assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(result.actualCalls,0);
        const lease=catalog.capture();assert.equal(lease.ok,true);globalThis.latticeFacadeUser='someone-else';assert.equal(lease.data.isCurrent(),false);assert.equal(facade.storyDocumentState().data.documents.length,0);
    } finally {delete globalThis.latticeFacadeUser;}
});
