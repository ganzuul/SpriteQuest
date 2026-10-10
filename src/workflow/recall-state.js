import { cloneJsonValue, stringifyJsonValue } from './operations/json-data.js?v=0.27.0';
import { own, plain, freeze } from './record-data.js?v=0.27.0';
const fail=(code,message)=>({ok:false,error:{code,message}});
const good=data=>({ok:true,data:freeze(data)});
const id=value=>typeof value==='string'&&!!value.trim()&&value.length<=256;
const exact=(value,keys,required=keys)=>plain(value)&&Object.keys(value).every(key=>keys.includes(key))&&required.every(key=>Object.hasOwn(value,key));
const checked=raw=>{const result=cloneJsonValue(raw);return result.ok?result.data.value:null;};
const eventId=value=>typeof value==='string'&&!!value.trim()&&value.length<=2048;
const canonical=value=>{const result=stringifyJsonValue(value);return result.ok?result.data.text:null;};
const targets=['reply','swipe','both'],uses=['next-match','one-per-type','until-disarmed'];
const allows=(target,kind)=>target==='both'||target===kind;
export function validateRecallScope(raw){const value=checked(raw);return exact(value,['userId','chatId','workflowId','actorId'])&&Object.values(value).every(id)?good({userId:value.userId,chatId:value.chatId,workflowId:value.workflowId,actorId:value.actorId}):fail('INVALID_RECALL_SCOPE','Recall requires a checked user, chat, workflow and actor scope.');}
export function validateRecallArmProposal(raw){
 const value=checked(raw);
 if(!exact(value,['schemaVersion','type','actorId','memorySetId','target','uses','consumeOn','hotkey'])||value.schemaVersion!==1||value.type!=='recall-arm-proposal'||!id(value.actorId)||!id(value.memorySetId)||!targets.includes(value.target)||!uses.includes(value.uses)||!['success','accepted'].includes(value.consumeOn))return fail('INVALID_RECALL_ARM','Use a bounded recall proposal with explicit target and consumption policy.');
 const hotkey=value.hotkey;
 if(!exact(hotkey,['code','ctrl','alt','shift','meta'])||typeof hotkey.code!=='string'||!(/^(Key[A-Z]|Digit[0-9]|F([1-9]|1[0-2]))$/u).test(hotkey.code)||['ctrl','alt','shift','meta'].some(key=>typeof hotkey[key]!=='boolean')||!hotkey.ctrl&&!hotkey.alt&&!hotkey.meta&&!/^F/u.test(hotkey.code))return fail('INVALID_RECALL_HOTKEY','Select a physical key with Control, Alt or Meta, or a function key.');
 return good({schemaVersion:1,type:'recall-arm-proposal',actorId:value.actorId,memorySetId:value.memorySetId,target:value.target,uses:value.uses,consumeOn:value.consumeOn,hotkey:{code:hotkey.code,ctrl:hotkey.ctrl,alt:hotkey.alt,shift:hotkey.shift,meta:hotkey.meta}});
}
function automaticTrigger(raw){const value=checked(raw);return exact(value,['kind','sourceId','revision','eventIds'])&&['keyword','event','character'].includes(value.kind)&&id(value.sourceId)&&id(value.revision)&&Array.isArray(value.eventIds)&&value.eventIds.length<=64&&value.eventIds.every(eventId)&&new Set(value.eventIds).size===value.eventIds.length?good(value):fail('INVALID_RECALL_TRIGGER','Recall activation needs bounded distinct source and event identities.');}
const generationEnvelope=value=>exact(value,['generationId','kind','stage','newlyGenerated'])&&id(value.generationId)&&['reply','swipe'].includes(value.kind)&&['pre','post'].includes(value.stage)&&typeof value.newlyGenerated==='boolean';
function validateAuthority(raw){
 const value=checked(raw);if(!exact(value,['scope','generation']))return fail('INVALID_RECALL_AUTHORITY','Return one bounded own-data scope and owned generation snapshot.');
 const scope=validateRecallScope(value.scope);if(!scope.ok)return scope;
 if(value.generation!==null&&!generationEnvelope(value.generation))return fail('INVALID_RECALL_GENERATION','The coherent authority needs a checked generation envelope or no active generation.');
 return good({scope:scope.data,generation:value.generation});
}
/** The trusted callback returns one coherent owner snapshot; portable DTOs never restore live authority. */
export function createRecallState(ports){
 if(!exact(ports,['getAuthority','signal'],['getAuthority'])||typeof own(ports,'getAuthority')!=='function')return fail('INVALID_RECALL_PORTS','Bind one trusted coherent scope and owned generation authority callback.');
 const getAuthority=own(ports,'getAuthority'),signal=own(ports,'signal');let released=false;
 const live=()=>released||signal?.aborted?fail('RECALL_STATE_RELEASED','The scoped recall state has been released.'):null;
 const readAuthority=()=>{const before=live();if(before)return before;let result;try{result=validateAuthority(getAuthority());}catch{return fail('RECALL_AUTHORITY_UNAVAILABLE','The trusted coherent Recall authority is unavailable.');}const after=live();return after??result;};
 const initial=readAuthority();if(!initial.ok)return initial;
 const scope=initial.data.scope,scopeKey=canonical(scope),arms=new Map(),claims=new Map(),claimAuthority=new WeakMap();let sequence=0;
 const authority=()=>{const result=readAuthority();if(!result.ok)return result;return canonical(result.data.scope)===scopeKey?result:fail('STALE_RECALL_SCOPE','The recall user, chat, workflow or actor changed.');};
 const current=()=>{const result=authority();return result.ok?good(scope):result;};
 // Every guard after the authority callback is local. No later callback can invalidate another facet.
 function liveClaim(entry){
  const available=live();if(available)return available;
  if(claims.get(entry.key)!==entry||['failed','cancelled'].includes(entry.status))return fail('RECALL_CLAIM_CLOSED','This activation was released without consumption.');
  const arm=entry.arm;
  if(!entry.consumed&&arm&&(arms.get(arm.armId)!==arm||!arm.armed||!arm.pending.has(entry.key)||!arm.remaining[entry.activation.generationType]))return fail('RECALL_CLAIM_CLOSED','The exact arm allowance is no longer reserved for this activation.');
  return null;
 }
 function claimGeneration(entry,generation,options={}){
  if(generation===null)return fail('INVALID_RECALL_GENERATION','No owned generation is available for this Recall claim.');
  if(generation.generationId!==entry.activation.generationId||generation.kind!==entry.activation.generationType||generation.newlyGenerated!==true||options.stage!==undefined&&generation.stage!==options.stage)return fail('STALE_RECALL_GENERATION','The owned generation changed while Recall was pending.');
  return null;
 }
 const armView=arm=>({armId:arm.armId,scope,...arm.proposal,armed:arm.armed,remaining:{...arm.remaining},pendingGenerationIds:[...arm.pending].map(key=>claims.get(key)?.activation.generationId).filter(Boolean)});
 function arm(raw){
  const fresh=authority();if(!fresh.ok)return fresh;const result=validateRecallArmProposal(raw);if(!result.ok)return result;const proposal=result.data;
  if(proposal.actorId!==scope.actorId)return fail('RECALL_ACTOR_MISMATCH','Arm only the actor authorized by this recall session.');
  const existing=[...arms.values()].find(entry=>entry.armed&&entry.proposal.memorySetId===proposal.memorySetId);
  if(existing)return canonical(existing.proposal)===canonical(proposal)?good(armView(existing)):fail('RECALL_ARM_CONFLICT','Disarm the existing memory-set intent before changing its target or policy.');
  const available=live();if(available)return available;
  if(arms.size>=64){for(const [key,entry]of arms)if(!entry.armed&&!entry.pending.size){arms.delete(key);break;}if(arms.size>=64)return fail('RECALL_ARM_LIMIT','This session reached its bounded active arm limit.');}
  const entry={armId:'recall-arm:'+ ++sequence,proposal,armed:true,remaining:{reply:allows(proposal.target,'reply'),swipe:allows(proposal.target,'swipe')},pending:new Set()};arms.set(entry.armId,entry);return good(armView(entry));
 }
 const skip=(code,message,status='skipped')=>good({status,reason:{code,message}});
 function activate(raw){
  const fresh=authority();if(!fresh.ok)return fresh;const request=checked(raw);
  if(!exact(request,['actorId','memorySetId','target','automatic'],['actorId','memorySetId','target'])||request.actorId!==scope.actorId||!id(request.memorySetId)||!targets.includes(request.target))return fail('INVALID_RECALL_ACTIVATION','Recall activation must match the authorized actor and memory set.');
  let automatic;if(Object.hasOwn(request,'automatic')){const result=automaticTrigger(request.automatic);if(!result.ok)return result;automatic=result.data;}
  const generation=fresh.data.generation;if(generation===null)return fail('INVALID_RECALL_GENERATION','Recall activation requires an owned reply or generated-swipe operation.');
  if(!generation.newlyGenerated||!allows(request.target,generation.kind))return skip('RECALL_TARGET_INELIGIBLE','This operation is not a newly generated eligible recall target.');
  const key=canonical([scope.userId,scope.chatId,scope.workflowId,scope.actorId,request.memorySetId,generation.generationId]);
  if(claims.has(key))return skip('RECALL_ALREADY_ACTIVATED','This memory set already activated for this owned generation.');
  const armed=[...arms.values()].find(entry=>entry.armed&&entry.proposal.memorySetId===request.memorySetId&&entry.remaining[generation.kind]);
  if(armed&&armed.pending.size&&armed.proposal.uses!=='until-disarmed')return skip('RECALL_USE_RESERVED','A matching arm allowance is reserved by another generation.','unresolved');
  if(!armed&&!automatic)return skip('RECALL_NOT_ARMED','No matching arm or automatic activation is available.');
  if(claims.size>=1024)return fail('RECALL_HISTORY_LIMIT','The scoped activation history reached its bound; start a fresh session explicitly.');
  const available=live();if(available)return available;
  const claim=Object.freeze({claimId:'recall-claim:'+ ++sequence}),activation=freeze({schemaVersion:1,type:'recall-activation',activationId:key,scope,memorySetId:request.memorySetId,generationId:generation.generationId,generationType:generation.kind,stage:generation.stage,origin:armed?'manual':automatic.kind,...(automatic?{sourceId:automatic.sourceId,revision:automatic.revision,eventIds:automatic.eventIds}:{}),...(armed?{armId:armed.armId}:{})});
  const entry={key,claim,activation,arm:armed,consumeOn:armed?.proposal.consumeOn??'accepted',status:'reserved',consumed:false};claims.set(key,entry);claimAuthority.set(claim,entry);armed?.pending.add(key);
  return {ok:true,data:{status:'activated',activation,claim}};
 }
 function consume(entry){if(entry.consumed)return;entry.consumed=true;const arm=entry.arm;if(!arm)return;arm.pending.delete(entry.key);if(arm.proposal.uses==='next-match')arm.remaining={reply:false,swipe:false};else if(arm.proposal.uses==='one-per-type')arm.remaining[entry.activation.generationType]=false;arm.armed=arm.armed&&(arm.proposal.uses==='until-disarmed'||arm.remaining.reply||arm.remaining.swipe);}
 function checkClaim(claim,options={}){
  const entry=claim&&typeof claim==='object'?claimAuthority.get(claim):undefined;if(!entry)return fail('RECALL_CLAIM_UNAUTHORIZED','Use the exact live activation claim.');
  const checkedOptions=checked(options);if(!exact(checkedOptions,['stage'],[])||checkedOptions.stage!==undefined&&!['pre','post'].includes(checkedOptions.stage))return fail('INVALID_RECALL_GENERATION','Use a supported Recall stage.');
  const fresh=authority();if(!fresh.ok)return fresh;
  const open=liveClaim(entry);if(open)return open;const owner=claimGeneration(entry,fresh.data.generation,checkedOptions);return owner??good(entry.activation);
 }
 function settle(claim,raw){
  const entry=claim&&typeof claim==='object'?claimAuthority.get(claim):undefined;if(!entry)return fail('RECALL_CLAIM_UNAUTHORIZED','Settle the exact live claim retained by the trusted host.');
  const outcome=checked(raw);if(!exact(outcome,['status'])||!['succeeded','accepted','failed','cancelled'].includes(outcome.status))return fail('INVALID_RECALL_SETTLEMENT','Use an explicit successful, accepted, failed or cancelled outcome.');
  const fresh=authority();if(!fresh.ok)return fresh;
  if(['failed','cancelled'].includes(entry.status))return entry.status===outcome.status?good({status:entry.status,consumed:false}):fail('RECALL_CLAIM_CLOSED','This unsuccessful activation claim has closed.');
  const open=liveClaim(entry);if(open)return open;
  if(['succeeded','accepted'].includes(outcome.status)){const owner=claimGeneration(entry,fresh.data.generation);if(owner)return owner;}
  if(entry.status==='accepted'||entry.consumed)return good({status:entry.status,consumed:entry.consumed});
  entry.status=outcome.status;
  if(['failed','cancelled'].includes(outcome.status)){entry.arm?.pending.delete(entry.key);claims.delete(entry.key);return good({status:entry.status,consumed:false});}
  if(outcome.status==='accepted'||entry.consumeOn==='success')consume(entry);
  return good({status:entry.status,consumed:entry.consumed});
 }
 function disarm(armId){const fresh=authority();if(!fresh.ok)return fresh;if(!id(armId)||!arms.has(armId))return fail('RECALL_ARM_UNAVAILABLE','Select a live armed intent in this scope.');const available=live();if(available)return available;const arm=arms.get(armId);arm.armed=false;arm.remaining={reply:false,swipe:false};for(const key of arm.pending){const entry=claims.get(key);if(entry){entry.status='cancelled';claims.delete(key);}}arm.pending.clear();return good(armView(arm));}
 const inspect=()=>{const fresh=authority();return fresh.ok?good({scope,arms:[...arms.values()].map(armView),activationCount:claims.size}):fresh;};
 const release=()=>{released=true;arms.clear();claims.clear();};
 return {ok:true,data:Object.freeze({current,arm,activate,checkClaim,settle,disarm,inspect,release})};
}
