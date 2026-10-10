import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createNativeWorkflowController } from '../src/workflow/host.js';
import {withNativeBoundary} from './helpers/workflow-fixtures.mjs';

const graph = withNativeBoundary({
    id:'prompt-host',schema:3,runtime:2,mode:'native-unified',
    nodes:{prompt:{id:'prompt',type:'workflow',operation:'prompt-source',operationVersion:1,source:'system',form:'raw'},compose:{id:'compose',type:'workflow',operation:'compose',operationVersion:1,outputKind:'guidance',sections:[{name:'Style',text:''}]},output:{id:'output',type:'workflow',operation:'guidance'}},
    wires:{a:{id:'a',route:'wire',from:'prompt',fromPort:'out',to:'compose',toPort:'section.Style'},b:{id:'b',route:'wire',from:'compose',fromPort:'out',to:'output',toPort:'in'}},definitions:{},portals:{}
},'output');
function fixture(countTokens=()=>({tokens:10}),assignedGraph=graph) {
    const c={mainApi:'textgenerationwebui',chatId:'prompt-test',characterId:0,characters:[{data:{name:'Test'}}],chat:[{mes:'Hello',is_user:true}],powerUserSettings:{sysprompt:{enabled:true,content:'Use measured prose.'}},extensionPrompts:{}};
    c.setExtensionPrompt=(key,value)=>{c.extensionPrompts[key]={value};};
    const listeners=new Map();c.eventTypes={GENERATION_STARTED:'GENERATION_STARTED'};c.eventSource={on:(name,fn)=>listeners.set(name,fn),removeListener:()=>{},emit:async(name,...args)=>listeners.get(name)?.(...args)};
    const controller=createNativeWorkflowController({context:()=>c,userId:()=> 'default-user',countTokens,isEnabled:()=>true,getGraph:phase=>phase==='unified'?assignedGraph:undefined});controller.subscribe();
    return {c,controller};
}

test('Prompt Source supplies configured Text without publishing a manual preview',async()=>{
    const {c,controller}=fixture();
    const result=await controller.runTarget(graph,{workflowId:graph.id,instancePath:[],nodeId:'output',portId:'out'});
    assert.equal(result.ok,true,JSON.stringify(result.error));
    assert.equal(result.actualCalls,0);
    assert.ok(JSON.stringify(result.recording).includes('Use measured prose.'));
    assert.deepEqual(c.extensionPrompts,{});
});

test('changed host prompt prevents native guidance publication',async()=>{
    const f=fixture(()=>{f.c.powerUserSettings.sysprompt.content='Changed while preparing';return {tokens:10};});
    await f.c.eventSource.emit('GENERATION_STARTED','normal',{},false);
    const result=await f.controller.beforeGenerate(f.c.chat,8192,()=>{},'normal');
    assert.equal(result.ok,false);
    assert.equal(result.error.code,'STALE_SOURCE');
    assert.equal(result.awaitingNative,undefined);
    assert.ok(Object.values(f.c.extensionPrompts).every(entry=>!entry.value));
});

test('Prompt Source selects the Post phase without reading a reply snapshot',async()=>{
    const {controller}=fixture();
    const post={id:'post-prompt',schema:3,runtime:2,mode:'native-unified',nodes:{prompt:{...graph.nodes.prompt,phase:'post'}},wires:{},definitions:{},portals:{}};
    const target={workflowId:post.id,instancePath:[],nodeId:'prompt',portId:'out'};
    const result=await controller.runTarget(post,target);
    assert.equal(result.ok,true,JSON.stringify(result.error));
    assert.ok(JSON.stringify(result.recording).includes('Use measured prose.'));
});

import { safeSource } from '../src/workflow/record-data.js';
test('recorded prompt metadata identifies the configured block without retaining credentials',()=>{
    const source=safeSource({source:'prompt-entry',block:'prompt-entry',promptId:'main',form:'raw',enabled:true,mainApi:'openai',override:'none',orderScope:'global',apiKey:'private',text:'private source body'});
    assert.equal(source.promptId,'main');
    assert.equal(source.form,'raw');
    assert.equal(source.enabled,true);
    assert.equal(Object.hasOwn(source,'apiKey'),false);
    assert.equal(Object.hasOwn(source,'text'),false);
});

test('equivalent resolved text still rejects a changed configured prompt template',async()=>{
    const resolved=structuredClone(graph);resolved.nodes.prompt.form='resolved';
    const f=fixture(()=>{f.c.powerUserSettings.sysprompt.content='Use Mira.';return {tokens:10};},resolved);
    f.c.powerUserSettings.sysprompt.content='Use {{char}}.';
    f.c.substituteParams=text=>text.replaceAll('{{char}}','Mira');
    await f.c.eventSource.emit('GENERATION_STARTED','normal',{},false);
    const result=await f.controller.beforeGenerate(f.c.chat,8192,()=>{},'normal');
    assert.equal(result.ok,false);
    assert.equal(result.error.code,'STALE_SOURCE');
    assert.ok(Object.values(f.c.extensionPrompts).every(entry=>!entry.value));
});
