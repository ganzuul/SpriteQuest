import assert from 'node:assert/strict';
import {test} from 'node:test';
import {state,proposal} from './fixtures/introspection.mjs';
import {makeRecord} from '../src/workflow/introspection/contracts.js';
const api=await import('../src/workflow/introspection/nodes.js').catch(()=>({}));
const node=(operation,settings={})=>({type:'workflow',operation,operationVersion:1,...settings});
test('six registrations distill modes and declare dynamic typed ports',()=>{
    assert.equal(typeof api.describeIntrospection,'function');
    assert.equal(api.INTROSPECTION_OPERATIONS.length,6);
    const inner=api.describeIntrospection(node('express',{mode:'inner-voice'}));
    assert.equal(inner.ok,true); assert.equal(inner.data.descriptor.output,'text'); assert.equal(inner.data.descriptor.modelRole,'Prose'); assert.equal(inner.data.descriptor.requestBound,1);
    const behavior=api.describeIntrospection(node('express')); assert.equal(behavior.data.descriptor.output,'guidance');assert.equal(behavior.data.descriptor.requestBound,0);
    const commit=api.describeIntrospection(node('memory',{mode:'commit',idempotencyKey:'k'}),{phase:'post'}); assert.equal(commit.data.descriptor.terminal,true);assert.equal(commit.data.descriptor.rootOnly,true);
    assert.equal(api.describeIntrospection(node('memory',{mode:'commit',idempotencyKey:'k'}),{phase:'pre'}).ok,false);
});
test('invalid settings and named ports cannot access a memory provider',async()=>{
    let reads=0;
    const ports={memory:{read(){reads++;throw Error('must not read');}}};
    assert.equal((await api.executeIntrospection(node('state',{mode:'invalid'}),{},ports)).ok,false);
    assert.equal((await api.executeIntrospection(node('state'),{wrong:state()},ports)).ok,false);
    assert.equal((await api.executeIntrospection(node('state',{updates:{anger:NaN}}),{},ports)).ok,false);
    assert.equal(reads,0);
});
test('Memory Commit returns an intent without writing',async()=>{
    let writes=0;
    const result=await api.executeIntrospection(node('memory',{mode:'commit',idempotencyKey:'apology'}),{proposal:proposal()},{phase:'post',memory:{commit(){writes++;}}});
    assert.equal(result.ok,true);assert.equal(result.artifact.value.recordType,'commit-intent');assert.equal(writes,0);
});
test('State value passes an explicit state through detached and preserves controls round trip',async()=>{
    const descriptor=api.describeIntrospection(node('state')).data.descriptor;
    assert.deepEqual(JSON.parse(JSON.stringify(descriptor)),descriptor);
    const result=await api.executeIntrospection(node('state'),{state:state()});
    assert.equal(result.ok,true);assert.equal(result.artifact.value.recordType,'actor-state');
});
test('Express accepts an assessment without optional records',async()=>{
    const assessment=makeRecord('reflection',state().value,{behaviorHints:['Keep guarded'],attentionHints:['Notice the apology']}).data;
    const result=await api.executeIntrospection(node('express'),{assessment},{root:true});
    assert.equal(result.ok,true);assert.deepEqual(result.artifact,{kind:'guidance',text:'Keep guarded'});
});
test('all eighteen modes publish portable typed descriptions',()=>{
    const cases={reflect:['character','recall','scene'],internalize:['experience','pattern','recovery'],express:['behavior','attention','inner-voice'],context:['assemble','perspective','focus'],memory:['read','recall','commit'],state:['value','curve','track']};
    let count=0;
    for(const [operation,modes] of Object.entries(cases)) for(const mode of modes){
        const controls=mode==='perspective'?{actorId:'npc-1'}:mode==='commit'?{idempotencyKey:'k'}:{};
        const result=api.describeIntrospection(node(operation,{mode,...controls}),{phase:'post'});
        assert.equal(result.ok,true,`${operation}/${mode}`);assert.deepEqual(JSON.parse(JSON.stringify(result.data)),result.data);count++;
    }
    assert.equal(count,18);
});
test('adapter rejects capability getters without evaluating them and catches pending source edits',async()=>{
    let reads=0;
    const rejected=await api.executeIntrospection(node('state'),{state:state()},{get request(){reads++;return ()=>{};}});
    assert.equal(rejected.ok,false);assert.equal(reads,0);
    const context={kind:'context',messages:[{id:'scene',revision:'r1',role:'user',text:'An apology.'}]};
    const result=await api.executeIntrospection(node('reflect'),{context,state:state()},{request:async()=>{context.messages[0].revision='r2';return {ok:true,data:{text:'{}',finish:'stop'}};}});
    assert.equal(result.ok,false);assert.equal(result.error.code,'STALE_INPUT');
});
