import assert from 'node:assert/strict';
import test from 'node:test';
import { parseEffectLibrary, selectRandomOutcomes, executeRandom, describeRandom } from '../src/workflow/operations/random-outcomes.js';
import { normalizeOccurrences, confirmOccurrences, resolveItemHolders } from '../src/workflow/operations/event-data.js';

const source={sourceId:'action-42',revision:'r1',sceneId:'scene-42',watch:'player-message',text:'Mara casts the broken wand.',visibility:'public'};
const normalized=normalizeOccurrences(source,[{eventType:'item-used',actorId:'mara',itemId:'broken-wand-01',position:{start:0,end:source.text.length},semantics:'actual'}],{actorIds:['mara'],itemIds:['broken-wand-01']});
const confirmed=confirmOccurrences(normalized.data.events,[{eventId:normalized.data.events[0].eventId,accepted:true}]);
const event=resolveItemHolders({'broken-wand-01':'mara'},confirmed.data.events).data.events[0];
const library={libraryId:'wand-effects',revision:'effects-r1',itemId:'broken-wand-01',effects:[
    {id:'sparks',kind:'fixed',weight:80,description:'Violet sparks replace the spell.'},
    {id:'wild-surge',kind:'generate',weight:20},
]};
test('weighted selection is retained across retry and library updates', async () => {
    let draws=0;
    const first=await selectRandomOutcomes([event],library,[],{random:()=>{draws++;return 0.85;}});
    assert.equal(first.ok,true,JSON.stringify(first.error));
    assert.equal(first.data.outcomes[0].selection.id,'wild-surge');
    assert.equal(first.data.outcomes[0].status,'drawn');
    const retry=await selectRandomOutcomes([event],{...library,revision:'effects-r2',effects:[{id:'new',kind:'fixed',weight:1,description:'A completely different library.'}]},first.data.outcomes,{random:()=>{draws++;return 0;}});
    assert.equal(retry.ok,true,JSON.stringify(retry.error));
    assert.equal(retry.data.outcomes[0].selection.id,'wild-surge');
    assert.equal(retry.data.outcomes[0].library.revision,'effects-r1');
    assert.equal(retry.data.draws,0);
    assert.equal(draws,1);
});
test('every weight and eligible entry is validated before randomness', async () => {
    let calls=0;
    for(const effects of [
        [{id:'good',kind:'fixed',weight:1,description:'Good.'},{id:'bad',kind:'fixed',weight:-1,description:'Bad.',eligible:false}],
        [{id:'zero',kind:'fixed',weight:0,description:'Zero.'}],
        [{id:'same',kind:'fixed',weight:1,description:'A.'},{id:'same',kind:'fixed',weight:1,description:'B.'}],
    ]) {
        const result=await selectRandomOutcomes([event],{...library,effects},[],{random:()=>{calls++;return 0;}});
        assert.equal(result.ok,false);
        assert.equal(result.error.code,'INVALID_EFFECT_LIBRARY'); assert.equal(result.data,undefined);
    }
    assert.equal(calls,0);
});
test('plain text weighted lines retain an explicit generated branch', () => {
    const parsed=parseEffectLibrary('40 | Violet sparks replace the spell.\n20 | @generate:wild-surge', {format:'text',libraryId:'text-wand',revision:'r1',itemId:'broken-wand-01'});
    assert.equal(parsed.ok,true,JSON.stringify(parsed.error));
    assert.deepEqual(parsed.data.library.effects.map(effect=>[effect.kind,effect.weight]),[['fixed',40],['generate',20]]);
    assert.equal(parsed.data.library.effects[1].id,'wild-surge');
});
test('confirmed zero uses complete with no random calls', async () => {
    const result=await selectRandomOutcomes([],library,[],{random:()=>{throw new Error('Unexpected draw');}});
    assert.equal(result.ok,true,JSON.stringify(result.error));
    assert.deepEqual(result.data.outcomes,[]);
    assert.equal(result.data.draws,0);
    assert.equal(result.data.actualCalls,0);
});
test('wild author failure retries the same draw and a successful invention is reused', async () => {
    const picked=await selectRandomOutcomes([event],library,[],{random:()=>0.85});
    const drawn=picked.data.outcomes[0];
    const descriptor=describeRandom({operation:'effect-author',instructions:'No permanent consequences.'},{phase:'pre'});
    assert.equal(descriptor.ok,true,JSON.stringify(descriptor.error));
    assert.equal(descriptor.data.descriptor.requestBound,1);
    let attempts=0;
    const execution={request:async options=>{
        attempts++;assert.equal(options.messages[1].content.includes('wild-surge'),true);
        if(attempts===1)return {ok:false,error:{code:'HTTP_ERROR',message:'Unavailable'}};
        return {ok:true,data:{text:JSON.stringify({id:'paper-moths',description:'Three paper moths orbit the chest.',spellOutcome:'replaced',duration:'Until the next cast or scene end.',consequence:'The chest is easier to find; the lock stays locked.'}),finish:'stop'}};
    }};
    const failed=await executeRandom({operation:'effect-author',instructions:'No permanent consequences.'},{in:{kind:'data',value:drawn}},execution);
    assert.equal(failed.ok,false);
    assert.equal(failed.error.code,'HTTP_ERROR');
    const retry=await selectRandomOutcomes([event],library,[drawn],{random:()=>{throw new Error('Must not redraw');}});
    assert.equal(retry.ok,true,JSON.stringify(retry.error));
    const authored=await executeRandom({operation:'effect-author',instructions:'No permanent consequences.'},{in:{kind:'data',value:retry.data.outcomes[0]}},execution);
    assert.equal(authored.ok,true,JSON.stringify(authored.error));
    assert.equal(authored.artifact.value.status,'proposed');
    assert.equal(authored.artifact.value.effect.id,'paper-moths');
    const reused=await executeRandom({operation:'effect-author'},{in:authored.artifact},execution);
    assert.equal(reused.ok,true,JSON.stringify(reused.error));
    assert.equal(attempts,2);
    const unresolved=await executeRandom({operation:'stage-outcome'},{in:authored.artifact,novelty:{kind:'data',value:{}}});
    assert.equal(unresolved.ok,true);
    assert.equal(unresolved.outputStates.out.status,'unresolved');
    const resolved=await executeRandom({operation:'stage-outcome'},{in:authored.artifact,novelty:{kind:'data',value:{accepted:true}}});
    assert.equal(resolved.ok,true,JSON.stringify(resolved.error));
    assert.equal(resolved.artifact.value.status,'resolved');
    assert.equal(resolved.artifact.value.acceptance,'pending');
});
test('planned or holder-conflicted actions cannot draw random effects', async () => {
    let draws=0;
    const result=await selectRandomOutcomes([{...event,holderId:'elias'}],library,[],{random:()=>{draws++;return 0;}});
    assert.equal(result.ok,false);
    assert.equal(result.error.code,'INVALID_RANDOM_EVENT');
    assert.equal(draws,0);
});
test('deliberate reroll needs a separate identity and explicit policy', async () => {
    const first=await selectRandomOutcomes([event],library,[],{random:()=>0});
    const denied=await selectRandomOutcomes([event],library,first.data.outcomes,{random:()=>0.85,rerollId:'reroll-1'});
    assert.equal(denied.ok,false);
    assert.equal(denied.error.code,'REROLL_POLICY_REQUIRED');
    const rerolled=await selectRandomOutcomes([event],library,first.data.outcomes,{random:()=>0.85,rerollId:'reroll-1',rerollPolicy:'explicit'});
    assert.equal(rerolled.ok,true,JSON.stringify(rerolled.error));
    assert.notEqual(rerolled.data.outcomes[0].outcomeId,first.data.outcomes[0].outcomeId);
    assert.equal(rerolled.data.outcomes[0].selection.id,'wild-surge');
});
test('outcome output bounds are checked before making unrecoverable draws', async () => {
    const large={...library,effects:Array.from({length:40},(_,index)=>({id:'entry-'+index,kind:'fixed',weight:1,description:'x'.repeat(3500)}))};
    const text='Mara casts the broken wand. Mara casts the broken wand.';
    const source2={...source,text};
    const candidates=[{eventType:'item-used',actorId:'mara',itemId:'broken-wand-01',position:{start:0,end:26},semantics:'actual'},{eventType:'item-used',actorId:'mara',itemId:'broken-wand-01',position:{start:27,end:53},semantics:'actual'}];
    const normalized2=normalizeOccurrences(source2,candidates,{actorIds:['mara'],itemIds:['broken-wand-01']});
    const confirmed2=confirmOccurrences(normalized2.data.events,normalized2.data.events.map(value=>({eventId:value.eventId,accepted:true})));
    const events=resolveItemHolders({'broken-wand-01':'mara'},confirmed2.data.events).data.events;
    let draws=0;
    const result=await selectRandomOutcomes(events,large,[],{random:()=>{draws++;return 0;}});
    assert.equal(result.ok,false);
    assert.equal(result.error.code,'OUTCOME_LIMIT');
    assert.equal(draws,0);
});
test('all eligible UTF-8 outcome projections fit before randomness is consumed', async () => {
    const multibyte={...library,effects:[
        {id:'ascii',kind:'fixed',weight:1,description:'a'.repeat(4096)},
        {id:'emoji',kind:'fixed',weight:1,description:'😀'.repeat(2000)},
        ...Array.from({length:68},(_,index)=>({id:'filler-'+index,kind:'fixed',weight:1,description:'b'.repeat(3400)})),
    ]};
    assert.equal(parseEffectLibrary(multibyte).ok,true);
    let draws=0;
    const result=await selectRandomOutcomes([event],multibyte,[],{random:()=>{draws++;return 1.5/70;}});
    assert.equal(result.ok,false);
    assert.equal(result.error.code,'OUTCOME_LIMIT');
    assert.equal(draws,0,'An oversized eligible effect must fail before a draw is consumed.');
});

test('outcome preflight reserves the longest valid draw number encoding', async () => {
    const shortSource={sourceId:'s',revision:'r',sceneId:'c',watch:'player-message',text:'Mara casts the wand.',visibility:'public'};
    const normalizedShort=normalizeOccurrences(shortSource,[{eventType:'item-used',actorId:'mara',itemId:'wand',position:{start:0,end:shortSource.text.length},semantics:'actual'}],{actorIds:['mara'],itemIds:['wand']});
    const confirmedShort=confirmOccurrences(normalizedShort.data.events,[{eventId:normalizedShort.data.events[0].eventId,accepted:true}]);
    const shortEvent=resolveItemHolders({wand:'mara'},confirmedShort.data.events).data.events[0];
    const nearLimit={libraryId:'l',revision:'r',itemId:'wand',effects:[
        {id:'ascii',kind:'fixed',weight:1,description:'a'.repeat(4096)},
        ...Array.from({length:70},(_,index)=>({id:'f'+index,kind:'fixed',weight:1,description:'b'.repeat(index===69?3152:3500)})),
    ]};
    assert.equal(parseEffectLibrary(nearLimit).ok,true);
    let draws=0;
    const result=await selectRandomOutcomes([shortEvent],nearLimit,[],{random:()=>{draws++;return 0.0000011111111111111112;}});
    assert.equal(result.ok,false);
    assert.equal(result.error.code,'OUTCOME_LIMIT');
    assert.equal(draws,0,'Long unit encodings must be accounted for before drawing.');
});