import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createStagedEffects } from '../src/workflow/staged-effects.js';

const scope={userId:'default-user',chatId:'Story-2'};
test('paired effects preflight before publication and retry only the missing persisted intent',async()=>{
    const order=[];let firstWrites=0,secondWrites=0,publications=0;
    const bundle=createStagedEffects({scope,originalEvidence:{sourceId:'native-reply',revision:'original'},isCurrent:()=>true,
        validateFinal:async evidence=>({ok:true}),
        publish:async()=>{order.push('publish');publications++;return {ok:true,data:{appliedLocally:true,persistence:'unverified'}};},
    });
    const stage=(targetId,commit)=>bundle.stage({intentId:targetId+'-kiss-1',targetId,proposed:{eventId:'kiss-1'},
        preflight:async()=>{order.push('preflight:'+targetId);return {ok:true,data:{status:'ready'}};},commit,
    });
    assert.equal(stage('mira',async()=>{order.push('write:mira');firstWrites++;return {ok:true,data:{status:'confirmed',applied:true,acknowledged:true}};}).ok,true);
    assert.equal(stage('elias',async()=>{order.push('write:elias');secondWrites++;return secondWrites===1?{ok:false,error:{code:'SAVE_FAILED',message:'Try persistence again.'}}:{ok:true,data:{status:'confirmed',applied:true,acknowledged:true}};}).ok,true);
    const first=await bundle.settle({root:true,accepted:true,finalEvidence:{revision:'final'}});
    assert.equal(first.ok,true,JSON.stringify(first));assert.equal(first.data.status,'partial');
    assert.deepEqual(order,['preflight:mira','preflight:elias','publish','write:mira','write:elias']);
    assert.equal(first.data.receipts[0].status,'confirmed');assert.equal(first.data.receipts[1].status,'failed');
    const retry=await bundle.settle({root:true,accepted:true,finalEvidence:{revision:'final'}});
    assert.equal(retry.ok,true,JSON.stringify(retry));assert.equal(retry.data.status,'settled');
    assert.equal(firstWrites,1);assert.equal(secondWrites,2);assert.equal(publications,1);
    assert.equal(retry.data.receipts.length,2);
});
test('a thrown write has an unknown outcome and is never blindly retried',async()=>{
    let writes=0;
    const bundle=createStagedEffects({scope,originalEvidence:{revision:'original'},isCurrent:()=>true,validateFinal:async()=>({ok:true}),publish:async()=>({ok:true,data:{appliedLocally:true}})});
    bundle.stage({intentId:'one',targetId:'memories',proposed:{eventId:'kiss-1'},preflight:async()=>({ok:true,data:{status:'ready'}}),commit:async()=>{writes++;throw new Error('Save may already have happened.');}});
    const first=await bundle.settle({root:true,accepted:true,finalEvidence:{revision:'final'}});
    assert.equal(first.ok,true);assert.equal(first.data.receipts[0].status,'unknown');assert.equal(first.data.status,'save-unverified');
    const retry=await bundle.settle({root:true,accepted:true,finalEvidence:{revision:'final'}});
    assert.equal(retry.ok,true);assert.equal(retry.data.receipts[0].status,'unknown');assert.equal(writes,1);
});
const makeBundle=overrides=>createStagedEffects({scope,originalEvidence:{revision:'original'},isCurrent:()=>true,validateFinal:async()=>({ok:true}),publish:async()=>({ok:true,data:{appliedLocally:true}}),...overrides});
const effect=(intentId,targetId,overrides={})=>({intentId,targetId,proposed:{eventId:intentId},preflight:async()=>({ok:true,data:{status:'ready'}}),commit:async()=>({ok:true,data:{status:'confirmed',applied:true,acknowledged:true}}),...overrides});

test('conflict preflight holds every write and publication',async()=>{
    let writes=0,publications=0;
    const bundle=makeBundle({publish:async()=>{publications++;return {ok:true,data:{appliedLocally:true}};}});
    bundle.stage(effect('one','mira',{commit:async()=>{writes++;return {ok:true,data:{status:'confirmed'}};}}));
    bundle.stage(effect('two','elias',{preflight:async()=>({ok:false,error:{code:'FILE_REVISION_CONFLICT',message:'Recompute dependent prose.'}})}));
    const result=await bundle.settle({root:true,accepted:true,finalEvidence:{revision:'final'}});
    assert.equal(result.ok,false);assert.equal(result.error.code,'FILE_REVISION_CONFLICT');
    assert.equal(writes,0);assert.equal(publications,0);
});

test('empty qualifying-event collections still publish normally without writes',async()=>{
    let publications=0;
    const bundle=makeBundle({publish:async()=>{publications++;return {ok:true,data:{appliedLocally:true,persistence:'unverified'}};}});
    const result=await bundle.settle({root:true,accepted:true,finalEvidence:{revision:'final'}});
    assert.equal(result.ok,true);assert.equal(result.data.status,'settled');assert.deepEqual(result.data.receipts,[]);
    assert.equal(publications,1);assert.equal(result.data.publication.persistence,'unverified');
});

test('reject and malformed/preview lifecycle controls cannot persist',async()=>{
    let writes=0;
    const bundle=makeBundle();bundle.stage(effect('one','mira',{commit:async()=>{writes++;return {ok:true,data:{status:'confirmed'}};}}));
    for(const flags of [{root:true,accepted:false},{root:false,accepted:true},{root:true,accepted:true,preview:true},{root:true,accepted:true,dryRun:true},{root:true,accepted:true,preview:'false'}])assert.equal((await bundle.settle({...flags,finalEvidence:{revision:'final'}})).ok,false);
    bundle.reject();assert.equal((await bundle.settle({root:true,accepted:true,finalEvidence:{revision:'final'}})).error.code,'EFFECTS_REJECTED');
    assert.equal(writes,0);
});

test('final-body validation precedes source preflight and publication',async()=>{
    let preflights=0,publications=0;
    const bundle=makeBundle({validateFinal:async()=>({ok:false,error:{code:'EVENT_REMOVED',message:'The final prose removed the kiss.'}}),publish:async()=>{publications++;return {ok:true,data:{appliedLocally:true}};}});
    bundle.stage(effect('kiss','mira',{preflight:async()=>{preflights++;return {ok:true,data:{status:'ready'}};}}));
    assert.equal((await bundle.settle({root:true,accepted:true,finalEvidence:{revision:'changed'}})).error.code,'EVENT_REMOVED');
    assert.equal(preflights,0);assert.equal(publications,0);
});

test('persistence recovery retains exactly the already accepted final body',async()=>{
    let writes=0;
    const bundle=makeBundle();bundle.stage(effect('one','mira',{commit:async()=>{writes++;return {ok:false,error:{code:'SAVE_FAILED',message:'Retry later.'}};}}));
    assert.equal((await bundle.settle({root:true,accepted:true,finalEvidence:{revision:'final'}})).data.status,'partial');
    const changed=await bundle.settle({root:true,accepted:true,finalEvidence:{revision:'different'}});
    assert.equal(changed.ok,false);assert.equal(changed.error.code,'FINAL_EVIDENCE_CHANGED');assert.equal(writes,1);
    assert.equal(bundle.stage(effect('new','new-target')).error.code,'EFFECTS_ALREADY_PUBLISHED');
});

test('unverified successful saves are retained without redundant retries',async()=>{
    let writes=0;
    const bundle=makeBundle();bundle.stage(effect('one','mira',{commit:async()=>{writes++;return {ok:true,data:{status:'save-unverified',applied:true,acknowledged:false}};}}));
    const first=await bundle.settle({root:true,accepted:true,finalEvidence:{revision:'final'}});
    assert.equal(first.data.status,'save-unverified');
    const retry=await bundle.settle({root:true,accepted:true,finalEvidence:{revision:'final'}});
    assert.equal(retry.data.status,'save-unverified');assert.equal(writes,1);
});

test('same-target projections must be composed before staging and stable intent IDs cannot change',()=>{
    const bundle=makeBundle();assert.equal(bundle.stage(effect('one','mira')).ok,true);
    assert.equal(bundle.stage(effect('two','mira')).error.code,'DUPLICATE_EFFECT_TARGET');
    assert.equal(bundle.stage(effect('one','different')).error.code,'EFFECT_ID_CONFLICT');
    assert.equal(bundle.inspect().data.effects.length,1);
});

test('unknown publication is a barrier rather than a reason to publish again',async()=>{
    let publications=0;
    const bundle=makeBundle({publish:async()=>{publications++;throw new Error('May have published.');}});
    const flags={root:true,accepted:true,finalEvidence:{revision:'final'}};
    assert.equal((await bundle.settle(flags)).error.code,'PUBLICATION_UNKNOWN');
    assert.equal((await bundle.settle(flags)).error.code,'PUBLICATION_UNKNOWN');assert.equal(publications,1);
});

test('staged configuration and metadata admission never execute getters',async()=>{
    let reads=0;
    const config={originalEvidence:{revision:'original'},isCurrent:()=>true,validateFinal:async()=>({ok:true}),publish:async()=>({ok:true,data:{appliedLocally:true}})};
    Object.defineProperty(config,'scope',{enumerable:true,get(){reads++;return scope;}});
    const bundle=createStagedEffects(config);
    assert.equal((await bundle.settle({root:true,accepted:true,finalEvidence:{revision:'final'}})).ok,false);
    assert.equal(reads,0);
});
test('malformed publication outcomes establish a barrier before any retry',async()=>{
    for(const malformed of [undefined,{ok:true,error:{code:'BAD',message:'Contradictory result'}},{ok:false,error:{code:'BAD'}}]){
        let publications=0;const bundle=makeBundle({publish:async()=>{publications++;return malformed;}});
        const flags={root:true,accepted:true,finalEvidence:{revision:'final'}};
        assert.equal((await bundle.settle(flags)).error.code,'PUBLICATION_UNKNOWN');
        assert.equal((await bundle.settle(flags)).error.code,'PUBLICATION_UNKNOWN');assert.equal(publications,1);
    }
});

test('acceptance seals the effect set before asynchronous final validation',async()=>{
    let release,entered,writes=0;const started=new Promise(resolve=>{entered=resolve;});
    const bundle=makeBundle({validateFinal:async data=>{assert.deepEqual(data.effects,[]);entered();await new Promise(resolve=>{release=resolve;});return {ok:true};}});
    const pending=bundle.settle({root:true,accepted:true,finalEvidence:{revision:'final'}});
    // Sealing applies synchronously, including before the queued settlement starts.
    assert.equal(bundle.stage(effect('early','mira')).error.code,'EFFECTS_SEALED');
    await started;
    assert.equal(bundle.stage(effect('late','elias',{commit:async()=>{writes++;return {ok:true,data:{status:'confirmed'}};}})).error.code,'EFFECTS_SEALED');
    release();assert.equal((await pending).ok,true);assert.equal(writes,0);
});

test('staging accounts for the entire review envelope before admitting a large proposal',()=>{
    const bundle=makeBundle();const staged=bundle.stage({...effect('i'.repeat(256),'t'.repeat(256)),proposed:'x'.repeat(261800)});
    assert.equal(staged.ok,false);assert.equal(staged.error.code,'EFFECT_BUNDLE_LIMIT');assert.deepEqual(bundle.inspect().data.effects,[]);
});
