import assert from 'node:assert/strict';
import test from 'node:test';
import {executeEvent} from '../src/workflow/operations/event-nodes.js';
import {artifactVisibility} from '../src/workflow/artifact-privacy.js';
let createNativeActorContext;
try{({createNativeActorContext}=await import('../src/workflow/native-actor-context.js'));}catch(error){if(error.code!=='ERR_MODULE_NOT_FOUND')throw error;}
const freeze=value=>{if(value&&typeof value==='object'){Object.freeze(value);Object.values(value).forEach(freeze);}return value;};
const data=(value,visibility={kind:'public'})=>freeze({kind:'data',value,visibility});
const presence=(actorId='character:mara.png')=>data({schemaVersion:1,recordType:'scene-presence',actorId,sceneId:'Story-2',sourceId:'scene-source',revision:'r1',status:'present',evidence:'Mara and Elias stand together.'});
function fixture(extra={}){
 assert.equal(typeof createNativeActorContext,'function');let user='default-user',current=true,proofCurrent=true,memories=[],reads=0;
 const c={chatId:'Story-2',characterId:0,groupId:null,characters:[{avatar:'mara.png',data:{name:'Mara',description:'Mara alone fears the sea.',visibility:{kind:'actor-private',actorId:'character:mara.png'}}},{avatar:'elias.png',data:{name:'Elias',description:'Elias alone fears fire.',visibility:{kind:'actor-private',actorId:'character:elias.png'}}}],chat:[{mes:'Mara and Elias stand together.',is_user:true},{mes:'Mara remembers the sea.',is_user:false,visibleTo:['character:mara.png']},{mes:'Elias remembers the fire.',is_user:false,visibility:{kind:'actor-private',actorId:'character:elias.png'}}]};
 const authorized=new WeakSet(),signal=new AbortController(),p=presence(),e=presence('character:elias.png');authorized.add(p);authorized.add(e);
 const ports={context:()=>c,userId:()=>user,isCurrent:()=>current,signal:signal.signal,authorizePresence(artifact,request){reads++;return authorized.has(artifact)&&proofCurrent&&artifact.value.actorId===request.actorId?{ok:true,data:{source:{sourceId:'scene-source',revision:'r1',sceneId:'Story-2'}}}:{ok:false,error:{code:'secret',message:'do not echo credentials'}};},readMemories:async()=>({ok:true,data:memories}),...extra};
 const result=createNativeActorContext(ports);assert.equal(result.ok,true,JSON.stringify(result.error));return {c,p,e,service:result.data,signal,ports,setUser:v=>user=v,setCurrent:v=>current=v,setProof:v=>proofCurrent=v,setMemories:v=>memories=v,reads:()=>reads};
}

test('native actor context selects actual canonical loaded actors and isolates each private card/message',async()=>{
 const f=fixture();for(const [actor,p,own,other]of [['character:mara.png',f.p,'sea','fire'],['character:elias.png',f.e,'fire','sea']]){
  const result=await f.service.actorContext(actor,{sceneId:'Story-2',sourceId:'scene-source',revision:'r1',signal:f.signal.signal},p);assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(result.data.scope.actorId,actor);assert.equal(result.data.visibility,'actor-private');const text=JSON.stringify(result.data.context);assert.ok(text.includes(own));assert.equal(text.includes(other),false);assert.equal(artifactVisibility(result.data).actorId,actor);
 }
});

test('native context rejects unknown actors and forged or cloned presence without private context',async()=>{
 const f=fixture();for(const [actor,p]of [['Mara',f.p],['character:unknown.png',f.p],['character:mara.png',structuredClone(f.p)],['character:mara.png',presence()]]){const result=await f.service.actorContext(actor,{sceneId:'Story-2',sourceId:'scene-source',revision:'r1'},p);assert.equal(result.ok,false);assert.equal(result.data,undefined);assert.equal(JSON.stringify(result).includes('credentials'),false);}
});

test('presence request identity cannot rebase the exact retained actor source',async()=>{
 const f=fixture();for(const key of ['sceneId','sourceId','revision']){const request={sceneId:'Story-2',sourceId:'scene-source',revision:'r1',[key]:'forged'};assert.equal((await f.service.actorContext('character:mara.png',request,f.p)).ok,false);}
});

test('opaque actor grants cannot be cloned or used after scope/source revocation',()=>{
 const f=fixture(),granted=f.service.authorizeActor('character:elias.png',f.e);assert.equal(granted.ok,true,JSON.stringify(granted.error));assert.deepEqual(granted.data.scope,{userId:'default-user',chatId:'Story-2',actorId:'character:elias.png'});assert.equal(f.service.checkActorGrant(structuredClone(granted.data.grant)).ok,false);assert.equal(f.service.checkActorGrant(granted.data.grant).ok,true);f.setProof(false);assert.equal(f.service.checkActorGrant(granted.data.grant).ok,false);
});

for(const mutation of ['user','chat','actor','card','visibility','cancel','release'])test('actor grant rejects '+mutation+' changes',()=>{
 const f=fixture(),grant=f.service.authorizeActor('character:mara.png',f.p).data.grant;
 if(mutation==='user')f.setUser('another-user');else if(mutation==='chat')f.c.chatId='other';else if(mutation==='actor')f.c.characterId=1;else if(mutation==='card')f.c.characters[0].data.description='Changed';else if(mutation==='visibility')f.c.chat[0].visibility={kind:'hidden'};else if(mutation==='cancel')f.signal.abort();else f.service.release();
 assert.equal(f.service.checkActorGrant(grant).ok,false);
});

test('appended native reply preserves a prior grant but edited captured prefix revokes it',()=>{
 const f=fixture(),grant=f.service.authorizeActor('character:mara.png',f.p).data.grant;f.c.chat.push({mes:'A newly generated public reply.',is_user:false});assert.equal(f.service.checkActorGrant(grant).ok,true);f.c.chat[0].mes='Edited prior source.';assert.equal(f.service.checkActorGrant(grant).ok,false);
});

for(const source of ['wrapper','data','message'])test('actor context disclosure getter on '+source+' fails without execution',async()=>{
 const f=fixture();let reads=0;const target=source==='wrapper'?f.c.characters[0]:source==='data'?f.c.characters[0].data:f.c.chat[0];Object.defineProperty(target,'visibility',{enumerable:true,configurable:true,get(){reads++;return {kind:'public'};}});const result=await f.service.actorContext('character:mara.png',{sceneId:'Story-2',sourceId:'scene-source',revision:'r1'},f.p);assert.equal(result.ok,false);assert.equal(reads,0);
});

test('awaited memory read cannot disclose another actor or accept a canceled/mutated source',async()=>{
 for(const mutation of ['wrong-memory','source','cancel']){
  let entered,release;const ready=new Promise(r=>entered=r),wait=new Promise(r=>release=r);const f=fixture({readMemories:async()=>{entered();await wait;return {ok:true,data:[{memoryId:'episode',actorId:mutation==='wrong-memory'?'character:elias.png':'character:mara.png',visibility:'actor-private',text:'Private memory.'}]};}});
  const pending=f.service.actorContext('character:mara.png',{sceneId:'Story-2',sourceId:'scene-source',revision:'r1'},f.p);const early=await Promise.race([ready.then(()=>null),pending]);assert.equal(early,null,JSON.stringify(early?.error));if(mutation==='source')f.c.chat[0].mes='Changed';if(mutation==='cancel')f.signal.abort();release();const result=await pending;assert.equal(result.ok,false);assert.equal(result.data,undefined);
 }
});

test('uniform private model legs require exact grant-backed inputs and refuse hidden/mixed/artifact clones',()=>{
 const f=fixture(),g=f.service.authorizeActor('character:mara.png',f.p).data.grant,h=f.service.authorizeActor('character:elias.png',f.e).data.grant;
 const a=data({thought:'Sea'},{kind:'actor-private',actorId:'character:mara.png'}),b=data({thought:'Fire'},{kind:'actor-private',actorId:'character:elias.png'});
 assert.equal(f.service.authorizeModelInputs({evidence:a}).ok,false);assert.equal(f.service.retainScopedArtifact(a,g).ok,true);assert.equal(f.service.retainScopedArtifact(b,h).ok,true);assert.equal(f.service.authorizeModelInputs({evidence:a}).ok,true);assert.equal(f.service.authorizeModelInputs({evidence:structuredClone(a)}).ok,false);assert.equal(f.service.authorizeModelInputs({a,b}).ok,false);assert.equal(f.service.authorizeModelInputs({hidden:data({secret:'hidden'},{kind:'hidden'})}).ok,false);
 const output=data({reflection:'Mara thinks of the sea.'},{kind:'actor-private',actorId:'character:mara.png'});assert.equal(f.service.retainScopedOutput({a},output).ok,true);assert.equal(f.service.authorizeModelInputs({output}).ok,true);assert.equal(f.service.retainScopedOutput({a},data({thought:'Fire'},{kind:'actor-private',actorId:'character:elias.png'})).ok,false);
});

test('only exact retained current selected actor guidance is admitted to native generation',async()=>{
 const f=fixture(),guidance=freeze({kind:'guidance',text:'Mara acts cautiously.',scope:{actorId:'character:mara.png',sceneId:'Story-2'},visibility:'actor-private',acceptance:'pending',sourceRefs:[{sourceId:'scene-source',revision:'r1'}]});
 const payload={node:{operation:'character-direction',actorId:'character:mara.png'},inputs:{presence:f.p},artifact:guidance,rawResult:{ok:true,artifact:guidance,reports:[{operation:'character-direction',actualCalls:1}]}};
 assert.equal(f.service.authorizeGuidance(guidance).ok,false);await f.service.actorContext('character:mara.png',{sceneId:'Story-2',sourceId:'scene-source',revision:'r1'},f.p);assert.equal(f.service.retainGuidance(payload).ok,true);assert.equal(f.service.authorizeGuidance(guidance).ok,true);assert.equal(f.service.authorizeGuidance(structuredClone(guidance)).ok,false);f.c.characterId=1;assert.equal(f.service.authorizeGuidance(guidance).ok,false);
});

test('Event actorContext callback receives the exact original presence artifact as private third argument',async()=>{
 const p=presence();let exact,calls=0;
 const result=await executeEvent({operation:'character-direction',actorId:'character:mara.png',systemPrompt:'Only Mara.'},{presence:p},{actorContext(actor,request,artifact){exact=artifact;return {ok:true,data:{scope:{actorId:actor,sceneId:request.sceneId},visibility:'actor-private',context:{},memories:[]}};},request:async()=>{calls++;return {ok:true,data:{text:'Mara hesitates.',finish:'stop'}};}});
 assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(exact,p);assert.equal(calls,1);
});

test('Event dispatch must retain the grant for the material actually captured before model dispatch',async()=>{
 const f=fixture(),node={operation:'character-direction',actorId:'character:mara.png'};
 assert.equal(f.service.authorizeEventInputs(node,{presence:f.p}).ok,false);
 assert.equal((await f.service.actorContext(node.actorId,{sceneId:'Story-2',sourceId:'scene-source',revision:'r1'},f.p)).ok,true);
 assert.equal(f.service.authorizeEventInputs(node,{presence:f.p}).ok,true);
 f.c.characters[0].data.description='Changed private context';
 assert.equal(f.service.authorizeEventInputs(node,{presence:f.p}).ok,false);
});
test('a captured private file producer can retain exact normalized outputs without granting authored labels',()=>{
 const f=fixture(),grant=f.service.authorizeActor('character:elias.png',f.e).data.grant;
 const artifact=data({reflection:'Elias remembers fire.'},{kind:'actor-private',actorId:'character:elias.png'}),rawResult={ok:true,outputs:{document:artifact}};
 assert.equal(f.service.captureScopedResult(rawResult,grant).ok,true);
 const normalized=data(structuredClone(artifact.value),{kind:'actor-private',actorId:'character:elias.png'});
 assert.equal(f.service.retainScopedOutput({},normalized,{rawResult,portId:'document'}).ok,true);
 assert.equal(f.service.authorizeModelInputs({data:normalized}).ok,true);
 assert.equal(f.service.retainScopedOutput({},data({reflection:'invented'},{kind:'actor-private',actorId:'character:elias.png'}),{rawResult,portId:'document'}).ok,false);
 assert.equal(f.service.retainScopedOutput({},data(artifact.value,{kind:'actor-private',actorId:'character:elias.png'}),{rawResult:structuredClone(rawResult),portId:'document'}).ok,false);
});

test('Actor Context emits checked per-actor RuntimeContext with zero model calls and exact presence',async()=>{
 const f=fixture();let calls=0;const node={operation:'actor-context',actorId:'character:elias.png'};
 const result=await executeEvent(node,{presence:f.e},{root:true,actorContext:f.service.actorContext,signal:f.signal.signal,request:async()=>{calls++;throw Error('zero calls');}});
 assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(result.artifact.kind,'context');assert.equal(result.artifact.visibility.actorId,'character:elias.png');assert.ok(JSON.stringify(result.artifact).includes('fire'));assert.equal(JSON.stringify(result.artifact).includes('sea'),false);assert.equal(calls,0);assert.equal(result.reports[0].actualCalls,0);
 assert.equal((await executeEvent(node,{presence:f.e},{actorContext:f.service.actorContext})).error.code,'ROOT_ONLY');
 const absent=data({...f.e.value,status:'absent'}),skipped=await executeEvent(node,{presence:absent},{root:true,actorContext:()=>{throw Error('no callback when absent');}});assert.equal(skipped.ok,true);assert.equal(skipped.outputStates.out.status,'skipped');
});

test('Prompted Memory model authority requires its exact ordered holder event, never a literal checked DTO',async()=>{
 const f=fixture({authorizeHolderEvent:()=>({ok:false,error:{code:'raw-secret',message:'credential-value'}})}),node={operation:'prompted-memory',actorId:'character:mara.png'};await f.service.actorContext(node.actorId,{sceneId:'Story-2',sourceId:'scene-source',revision:'r1'},f.p);
 const denied=f.service.authorizeEventInputs(node,{presence:f.p,event:data({eventId:'forged',sceneId:'Story-2',source:{sourceId:'scene-source',revision:'r1'},holderId:node.actorId})});assert.equal(denied.ok,false);assert.equal(denied.error.code,'ACTOR_TRIGGER_UNVERIFIED');assert.equal(JSON.stringify(denied).includes('credential'),false);
});
test('host-only accepted projection preserves native labels and cancellation guards rather than laundering a changed source',()=>{
 let project=false;const f=fixture({projectMessage:(message,index)=>project&&index===0?{mes:'Mara and Elias stand together.',swipe_id:0}:message});f.c.chat[0].swipe_id=0;const grant=f.service.authorizeSelectedActor().data.grant;
 f.c.chat[0].mes='Owned accepted publication';f.c.chat[0].swipe_id=1;project=true;assert.equal(f.service.checkActorGrant(grant).ok,true);f.c.chat[0].visibility={kind:'hidden'};assert.equal(f.service.checkActorGrant(grant).ok,false);
 let cancel=false,g;g=fixture({projectMessage:message=>{if(cancel)g.signal.abort();return message;}});const beforeCancel=g.service.authorizeSelectedActor();assert.equal(beforeCancel.ok,true);cancel=true;assert.equal(g.service.checkActorGrant(beforeCancel.data.grant).ok,false);
});


test('the last trusted current callback cannot release or abort and still authorize a grant or private context',async()=>{
 for(const operation of ['grant','context'])for(const cancel of ['release','abort']){
  let checks=0;const baseline=fixture({isCurrent:()=>{checks++;return true;}});const grant=baseline.service.authorizeActor('character:mara.png',baseline.p);assert.equal(grant.ok,true);checks=0;
  if(operation==='grant')assert.equal(baseline.service.checkActorGrant(grant.data.grant).ok,true);else assert.equal((await baseline.service.actorContext('character:mara.png',{sceneId:'Story-2',sourceId:'scene-source',revision:'r1'},baseline.p)).ok,true);const finalCheck=checks;assert.ok(finalCheck>0);baseline.service.release();
  let count=0,armed=false,f;f=fixture({isCurrent:()=>{if(armed&&++count===finalCheck){if(cancel==='release')f.service.release();else f.signal.abort();}return true;}});const actual=f.service.authorizeActor('character:mara.png',f.p);assert.equal(actual.ok,true);armed=true;
  const result=operation==='grant'?f.service.checkActorGrant(actual.data.grant):await f.service.actorContext('character:mara.png',{sceneId:'Story-2',sourceId:'scene-source',revision:'r1'},f.p);assert.equal(count>=finalCheck,true);assert.equal(result.ok,false);assert.equal(result.data,undefined);f.service.release();
 }
});

test('Character Direction retains exact same actor Data authority through capture, model admission and native guidance',async()=>{
 const f=fixture(),node={operation:'character-direction',actorId:'character:mara.png'},grant=f.service.authorizeActor(node.actorId,f.p).data.grant;
 const projected=data({trust:.85,affection:.75},{kind:'actor-private',actorId:node.actorId});assert.equal(f.service.retainScopedArtifact(projected,grant).ok,true);let calls=0;
 const inputs={presence:f.p,data:projected};const result=await executeEvent(node,inputs,{actorContext:f.service.actorContext,signal:f.signal.signal,request:async request=>{calls++;assert.equal(f.service.authorizeEventInputs(node,inputs).ok,true);const payload=JSON.parse(request.messages[1].content);assert.deepEqual(payload.data,{trust:.85,affection:.75});assert.equal(payload.scope.actorId,node.actorId);return {ok:true,data:{text:'Mara trusts Elias enough to lower her guard.',finish:'stop'}};}});
 assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(calls,1);const artifact=freeze(result.artifact);assert.equal(f.service.retainGuidance({node,inputs,artifact,rawResult:result}).ok,true);assert.equal(f.service.authorizeGuidance(artifact).ok,true);assert.equal(f.service.authorizeGuidance(freeze(structuredClone(artifact))).ok,false);
});

for(const denied of ['forged','clone','stale','other actor','mixed','hidden'])test('Character Direction '+denied+' Data never reaches private actor capture or model dispatch',async()=>{
 let reads=0;const f=fixture({readMemories:async()=>{reads++;return {ok:true,data:[]};}}),node={operation:'character-direction',actorId:'character:mara.png'};
 const actorId=denied==='other actor'?'character:elias.png':node.actorId,exactPresence=actorId===node.actorId?f.p:f.e,grant=f.service.authorizeActor(actorId,exactPresence).data.grant;
 let projected=data({trust:.85},{kind:'actor-private',actorId});
 if(denied!=='forged')assert.equal(f.service.retainScopedArtifact(projected,grant).ok,true);
 if(denied==='clone')projected=freeze(structuredClone(projected));
 if(denied==='stale')f.c.characters[0].data.description='Changed private source';
 if(denied==='mixed')projected=data([{visibility:'actor-private',actorId:node.actorId,value:'sea'},{visibility:'actor-private',actorId:'character:elias.png',value:'fire'}]);
 if(denied==='hidden')projected=data({secret:'hidden'},{kind:'hidden'});
 let calls=0;const result=await executeEvent(node,{presence:f.p,data:projected},{actorContext:f.service.actorContext,signal:f.signal.signal,request:async()=>{calls++;throw Error('unsafe model dispatch');}});
 assert.equal(result.ok,false,denied);assert.equal(result.error.code,'ACTOR_MODEL_SCOPE',denied);assert.equal(reads,0,denied);assert.equal(calls,0,denied);assert.equal(result.artifact,undefined);
});

test('Character Direction event authority rejects a retained other actor input even after valid actor context capture',async()=>{
 const f=fixture(),node={operation:'character-direction',actorId:'character:mara.png'};await f.service.actorContext(node.actorId,{sceneId:'Story-2',sourceId:'scene-source',revision:'r1'},f.p);
 const grant=f.service.authorizeActor('character:elias.png',f.e).data.grant,other=data({trust:1},{kind:'actor-private',actorId:'character:elias.png'});assert.equal(f.service.retainScopedArtifact(other,grant).ok,true);assert.equal(f.service.authorizeModelInputs({data:other}).ok,true);
 const checked=f.service.authorizeEventInputs(node,{presence:f.p,data:other});assert.equal(checked.ok,false);assert.equal(checked.error.code,'ACTOR_MODEL_SCOPE');
});

test('Character Direction rechecks retained Data after actor capture callbacks before reading private memories',async()=>{
 let f,armed=false,contexts=0,reads=0;f=fixture({context:()=>{if(armed&&++contexts===2)f.c.characters[0].data.description='Changed while capturing current actor';return f.c;},readMemories:async()=>{reads++;return {ok:true,data:[]};}});
 const node={operation:'character-direction',actorId:'character:mara.png'},grant=f.service.authorizeSelectedActor().data.grant,projected=data({trust:.85},{kind:'actor-private',actorId:node.actorId});assert.equal(f.service.retainScopedArtifact(projected,grant).ok,true);armed=true;let calls=0;
 const result=await executeEvent(node,{presence:f.p,data:projected},{actorContext:f.service.actorContext,signal:f.signal.signal,request:async()=>{calls++;throw Error('stale Data dispatch');}});
 assert.equal(result.ok,false);assert.equal(result.error.code,'ACTOR_MODEL_SCOPE');assert.equal(reads,0);assert.equal(calls,0);assert.equal(result.artifact,undefined);
});

test('Character Direction checks captured presence after final Data authorization callbacks before returning private context',async()=>{
 let f,afterMemory=false,contexts=0;f=fixture({context:()=>{if(afterMemory&&++contexts===3)f.setProof(false);return f.c;},readMemories:async()=>{afterMemory=true;return {ok:true,data:[]};}});
 const actorId='character:mara.png',grant=f.service.authorizeSelectedActor().data.grant,projected=data({trust:.85},{kind:'actor-private',actorId});assert.equal(f.service.retainScopedArtifact(projected,grant).ok,true);
 const result=await f.service.actorContext(actorId,{sceneId:'Story-2',sourceId:'scene-source',revision:'r1',signal:f.signal.signal,data:projected},f.p);
 assert.equal(result.ok,false);assert.equal(result.data,undefined);assert.equal(result.error.code,'ACTOR_PRESENCE_UNVERIFIED');
});

test('Character Direction admission rechecks captured presence after selected Data authorization before dispatch',async()=>{
 let f,armed=false,contexts=0;f=fixture({context:()=>{if(armed&&++contexts===2)f.setProof(false);return f.c;}});
 const node={operation:'character-direction',actorId:'character:mara.png'},grant=f.service.authorizeSelectedActor().data.grant,projected=data({trust:.85},{kind:'actor-private',actorId:node.actorId});assert.equal(f.service.retainScopedArtifact(projected,grant).ok,true);
 assert.equal((await f.service.actorContext(node.actorId,{sceneId:'Story-2',sourceId:'scene-source',revision:'r1',signal:f.signal.signal,data:projected},f.p)).ok,true);armed=true;
 const result=f.service.authorizeEventInputs(node,{presence:f.p,data:projected});let calls=0;if(result.ok)calls++;
 assert.equal(result.ok,false);assert.equal(result.error.code,'ACTOR_CONTEXT_CHANGED');assert.equal(calls,0);
});
