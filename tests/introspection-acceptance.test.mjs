import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {state,events,proposal,intent} from './fixtures/introspection.mjs';
const api=await import('../src/workflow/introspection/library.js').catch(()=>({}));
const memoryApi=await import('../src/workflow/introspection/memory.js').catch(()=>({}));
const loadExample=async file=>JSON.parse(await readFile(new URL(`../examples/introspection/${file}.json`,import.meta.url),'utf8'));
test('cross-turn apology eases anger while preserving guarded trust and commits once',async()=>{
    assert.equal(typeof api.runIntrospectionExample,'function');
    const backend=memoryApi.createInMemoryBackend(state(),events());
    const memory=memoryApi.createMemoryService(backend);
    const manifest=await loadExample('internalize-and-commit');
    let calls=0;
    const result=await api.runIntrospectionExample(manifest,{}, {root:true,memory,request:async()=>{calls++;return {ok:true,data:{text:JSON.stringify(proposal().value.payload),finish:'stop'}};}});
    assert.equal(result.ok,true); assert.equal(calls,1);assert.equal(result.data.settlements[0].applied,true);
    const next=await memory.read({view:'state'});
    assert.equal(next.artifact.value.store.version,1);
    assert.equal(next.artifact.value.payload.values.anger,0.35);
    assert.equal(next.artifact.value.payload.beliefs[0].text,'Trust remains guarded');
    const replay=await memory.commit(intent(),{root:true});
    assert.equal(replay.ok,true);assert.equal(replay.data.applied,false);
});
test('invalid graph, preview and target execution perform no provider work',async()=>{
    const manifest=await loadExample('internalize-and-commit');let calls=0;
    const ports={root:true,request(){calls++;},memory:{read(){calls++;},commit(){calls++;}}};
    assert.equal((await api.runIntrospectionExample(manifest,{}, {...ports,preview:true})).ok,false);
    assert.equal((await api.runIntrospectionExample(manifest,{}, {...ports,root:false})).ok,false);
    const bad=structuredClone(manifest);bad.nodes.at(-1).inputs.proposal={node:'missing'};
    assert.equal((await api.runIntrospectionExample(bad,{},ports)).ok,false);assert.equal(calls,0);
});
test('failure after a proposed update never settles pending intent',async()=>{
    const manifest=await loadExample('internalize-and-commit');
    const backend=memoryApi.createInMemoryBackend(state(),events()),memory=memoryApi.createMemoryService(backend);
    const result=await api.runIntrospectionExample(manifest,{}, {root:true,memory,request:async()=>({ok:true,data:{text:'{}',finish:'length'}})});
    assert.equal(result.ok,false);assert.equal((await memory.read({view:'state'})).artifact.value.store.version,0);
});
test('scene reflection renders behavioral guidance with explicit source handoff',async()=>{
    const manifest=await loadExample('reflect-and-express');
    const memory=memoryApi.createMemoryService(memoryApi.createInMemoryBackend(state(),events()));
    const inputs={scene:{kind:'context',messages:[{id:'apology',revision:'r1',role:'user',text:'I am sorry.'}]},character:{kind:'context',messages:[{id:'character',role:'system',text:'The actor remains guarded.'}]}};
    const result=await api.runIntrospectionExample(manifest,inputs,{root:true,memory,request:async()=>({ok:true,data:{text:JSON.stringify({brief:'Anger softens, trust remains guarded.',behaviorHints:['Acknowledge the apology cautiously.']}),finish:'stop'}})});
    assert.equal(result.ok,true,JSON.stringify(result));assert.equal(result.data.calls,1);assert.equal(result.data.settlements.length,0);
    assert.equal(result.data.outputs.guidance.text,'Acknowledge the apology cautiously.');
});
test('manifest rejects unsafe node identities before services and catches external source edits',async()=>{
    const manifest={format:'lattice-introspection-example',version:1,integrationRequired:true,phase:'pre',nodes:[{id:'__proto__',type:'workflow',operation:'state',operationVersion:1,inputs:{state:{input:'state'}}}],outputs:{state:{node:'__proto__'}}};
    assert.equal(api.validateIntrospectionExample(manifest,{state:state()}).ok,false);
    const reflection={...manifest,nodes:[{id:'reflection',type:'workflow',operation:'reflect',operationVersion:1,inputs:{state:{input:'state'},context:{input:'context'}}}],outputs:{reflection:{node:'reflection'}}};
    const context={kind:'context',messages:[{id:'apology',revision:'r1',role:'user',text:'Sorry.'}]};
    const result=await api.runIntrospectionExample(reflection,{state:state(),context},{root:true,request:async()=>{context.messages[0].revision='r2';return {ok:true,data:{text:'{}',finish:'stop'}};}});
    assert.equal(result.ok,false);assert.equal(result.error.code,'STALE_INPUT');
});
