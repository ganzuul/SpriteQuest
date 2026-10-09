import {createActorState,makeRecord} from '../../src/workflow/introspection/contracts.js';
export const scope={chatId:'chat-1',actorId:'npc-1'};
export const ref={id:'apology',revision:'r1'};
export const state=()=>createActorState(scope,{id:'store-1',version:0},{beliefs:[{id:'trust',text:'Trust remains guarded',classification:'interpretation',sourceRefs:[]}],conditions:[{id:'anger',text:'Anger is sharp',classification:'interpretation',sourceRefs:[]}],values:{anger:0.8}}).data;
export const events=(base=state().value)=>makeRecord('events',base,{events:[{...ref,text:'The player offers a sincere apology.',settled:true}]},[ref]).data;
export const proposal=(base=state().value)=>makeRecord('state-proposal',base,{changes:[{op:'upsert',collection:'conditions',item:{id:'anger',text:'Immediate anger eased',classification:'interpretation',sourceRefs:[ref]}}],values:{anger:0.35}},[ref]).data;
export const intent=(candidate=proposal(),key='apology-1')=>makeRecord('commit-intent',candidate.value,{proposal:candidate.value,idempotencyKey:key},candidate.value.sourceRefs).data;
