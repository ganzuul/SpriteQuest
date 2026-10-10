import assert from 'node:assert/strict';
import test from 'node:test';
import { createNativeMemoryAdapter } from '../src/workflow/introspection/host-memory.js?v=0.26.0';
import { makeRecord } from '../src/workflow/introspection/contracts.js?v=0.26.0';
import { advanceState } from '../src/workflow/introspection/context-state.js?v=0.26.0';
async function fixture() {
    let writes=0;
    const c={chatId:'story',characterId:0,groupId:null,characters:[{avatar:'mara.png'}],chatMetadata:{},chat:[{mes:'I draw the sword.',is_user:true},{mes:'The sword killed Orr.',is_user:false,swipe_id:0,swipes:['The sword killed Orr.'],swipe_info:[{gen_started:1,gen_finished:2}],gen_started:1,gen_finished:2}]};
    c.saveMetadata=async()=>{writes++;return true;};
    const controller=new AbortController();const session=createNativeMemoryAdapter({context:()=>c}).capture({signal:controller.signal,isCurrent:()=>true}).data;
    const state=await session.memory.read({view:'state'}),events=await session.memory.read({view:'events'});
    const proposal=advanceState(state.artifact,{mode:'track',trackId:'souls'},events.artifact);
    const intent=makeRecord('commit-intent',proposal.artifact.value,{proposal:proposal.artifact.value,idempotencyKey:'owned-turn'},proposal.artifact.value.sourceRefs).data;
    return {c,session,intent,writes:()=>writes,controller};
}
test('retained memory preflight performs no save and rejects changed final body before publication',async()=>{
    const f=await fixture(); assert.equal(typeof f.session.preflightAccepted,'function');
    const controls={body:'The sword killed Orr. Ash fell.',messageIndex:1,originalSwipeId:0};
    assert.equal((await f.session.preflightAccepted(f.intent,controls)).data.status,'ready');assert.equal(f.writes(),0);
    assert.equal((await f.session.preflightAccepted(f.intent,{...controls,body:'The sword spared Orr.'})).error.code,'FINAL_EVIDENCE_REEXTRACT_REQUIRED');assert.equal(f.writes(),0);
});
test('only exact privately accepted original swipe may authorize memory after final publication',async()=>{
    const f=await fixture(),body='The sword killed Orr. Ash fell.';
    await f.session.preflightAccepted(f.intent,{body,messageIndex:1,originalSwipeId:0});
    const m=f.c.chat[1];m.swipes.push(body);m.swipe_info.push({gen_started:3,gen_finished:4});Object.assign(m,{mes:body,swipe_id:1,gen_started:3,gen_finished:4});
    assert.equal(f.session.authorizeAcceptedPublication({body,finalText:body,messageIndex:1,originalSwipeId:0,finalSwipeId:1}).ok,true);
    assert.equal((await f.session.memory.commit(f.intent,{root:true})).ok,true);assert.equal(f.writes(),1);
});
test('historical edits or cancellation invalidate retained accepted memory authority',async()=>{
    for(const change of ['edit','abort']){const f=await fixture();if(change==='edit')f.c.chat[0].mes='Changed old event.';else f.controller.abort();
        assert.equal((await f.session.preflightAccepted(f.intent,{body:f.c.chat[1].mes,messageIndex:1,originalSwipeId:0})).ok,false);assert.equal(f.writes(),0);}
});
test('released memory authority cannot be reactivated by calling its retained capability',async()=>{
    const f=await fixture();f.session.release();const committed=await f.session.memory.commit(f.intent,{root:true});assert.equal(committed.ok,false);assert.equal(committed.error.code,'MEMORY_AUTHORITY_RELEASED');assert.equal(f.writes(),0);
});
