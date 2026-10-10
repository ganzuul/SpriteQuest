import assert from 'node:assert/strict';
import {test} from 'node:test';
import {installWorkflowExample} from '../src/workflow/examples.js';
import {unifiedRecipeHost} from './helpers/unified-recipe-host.mjs';
import {seedMemory,upsert,sourceRefs,reflection,completedMessage,readMemory} from './helpers/consumed-memory-fixtures.mjs';
const installed = number => {
 const result = installWorkflowExample(`lesson-${String(number).padStart(2,'0')}`,{graphs:{}});
 assert.equal(result.ok,true,JSON.stringify(result.error));
 return result.data.graph;
};
const candidate = result => result.recording.artifacts.find(a=>a.kind==='candidate').value;
test('lesson 1 carries an owned native Draft to review and publishes only after Apply',async()=>{
 const f=unifiedRecipeHost(installed(1),{request:async()=>{throw Error('Lesson 1 must make no auxiliary request');}});
 try {
  const body='Mara reaches the quiet pier.';
  const result=await f.generate(body);
  assert.equal(result.ok,true,JSON.stringify(result.error));
  assert.equal(candidate(result).text,body);
  assert.equal(result.reviewHandles.length,1);
  assert.equal(f.calls(),0);
  assert.equal(f.saves(),0);
  assert.equal(f.c.chat.at(-1).swipes.length,1);
  const applied=await f.controller.apply(result.reviewHandles[0]);
  assert.equal(applied.ok,true,JSON.stringify(applied.error));
  assert.equal(f.c.chat.at(-1).mes,body);
  assert.equal(f.c.chat.at(-1).swipes[0],body);
 } finally {f.controller.dispose();}
});

const response = value => ({ok:true,data:{text:typeof value==='string'?value:JSON.stringify(value),finish:'stop'}});
const guidance = result => result.recording.artifacts.filter(a=>a.kind==='guidance').map(a=>a.value.text).join('\n');
test('lesson 6 selects imported snapshot fields that causally guide the native reply',async()=>{
 const f=unifiedRecipeHost(installed(6),{request:async()=>{throw Error('Snapshot selection must be deterministic');}});
 try {
  const result=await f.generate('The lighthouse remains dark.');
  assert.equal(result.ok,true,JSON.stringify(result.error));
  assert.match(guidance(result),/North Harbor/);
  assert.match(guidance(result),/The lighthouse is dark/);
  assert.doesNotMatch(guidance(result),/distant kingdom|festival/);
  assert.equal(candidate(result).text,'The lighthouse remains dark.');
  assert.equal(f.calls(),0);
 } finally {f.controller.dispose();}
});
test('lesson 7 revises the owned narration without changing protected literals or dialogue',async()=>{
 const body='At North Harbor, Mara slowly walked toward the pier. "Wait," Elias said.';
 const revised='At North Harbor, Mara approached the pier. "Wait," Elias said.';
 const f=unifiedRecipeHost(installed(7),{request:async options=>{
  const payload=JSON.parse(options.messages[1].content);
  assert.equal(payload.draft,body);
  assert.match(options.messages[0].content,/Revise/);
  return response(revised);
 }});
 try {
  const result=await f.generate(body);
  assert.equal(result.ok,true,JSON.stringify(result.error));
  assert.equal(candidate(result).text,revised);
  assert.equal(f.c.chat.at(-1).mes,body);
  assert.equal(f.calls(),1);
  assert.equal((await f.controller.apply(result.reviewHandles[0])).ok,true);
  assert.equal(f.c.chat.at(-1).mes,revised);
  assert.equal(f.c.chat.at(-1).swipes[0],body);
 } finally {f.controller.dispose();}
});
test('lesson 8 appends literal observed notes while retaining the new native Draft ownership',async()=>{
 for(const body of ['Mara carries a lantern and a map.','Mara watches the waves.']){
  const f=unifiedRecipeHost(installed(8),{request:async()=>{throw Error('Literal extraction must not call a model');}});
  try {
   const result=await f.generate(body);
   assert.equal(result.ok,true,JSON.stringify(result.error));
   assert.ok(candidate(result).text.startsWith(body));
   if(body.includes('lantern')){assert.match(candidate(result).text,/<details>/);assert.match(candidate(result).text,/Lantern/);assert.match(candidate(result).text,/Map/);}
   assert.equal(f.calls(),0);
   assert.equal(f.saves(),0);
   assert.equal((await f.controller.apply(result.reviewHandles[0])).ok,true);
   assert.ok(f.c.chat.at(-1).mes.startsWith(body));
   assert.equal(f.c.chat.at(-1).swipes[0],body);
  } finally {f.controller.dispose();}
 }
});

const node = (graph,id) => Object.values(graph.nodes).find(n=>n.id.startsWith(id+'-'));
const doc = (targetId,format,content) => ({targetId,name:targetId,format,content,visibility:{kind:'public'}});
const records = (body,id='arrival') => [{id,label:'Arrival',text:body,classification:'observation',evidence:[{start:0,end:body.length,quote:body}]}];
test('lesson 9 keeps a skipped travel card optional but holds missing destination',async()=>{
 for(const [value,want] of [[{destination:'North Harbor',landmark:'dark lighthouse'},'card'],[{destination:''},'base'],[{},'hold']]){
  const graph=installed(9);node(graph,'route-text').text=JSON.stringify(value);
  const f=unifiedRecipeHost(graph,{request:async()=>{throw Error('Travel condition is deterministic');}});
  try {
   const result=await f.generate('Mara prepares to leave.');
   if(want==='hold'){assert.equal(result.reviewHandles?.length??0,0);assert.equal(f.saves(),0);}
   else {assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(result.reviewHandles.length,1);if(want==='card')assert.match(candidate(result).text,/North Harbor/);else assert.equal(candidate(result).text,'Mara prepares to leave.');}
   assert.equal(f.calls(),0);
  } finally {f.controller.dispose();}
 }
});
test('lesson 10 routes semantic true, false and null without treating uncertainty as false',async()=>{
 const body='Mara opened the door, crossed the hall, and lit the lamp.';
 for(const answer of [true,false,null]){
  const f=unifiedRecipeHost(installed(10),{request:async options=>options.messages[0].content.startsWith('Evaluate')?response({answers:{recap:{type:'noul',accepted:answer}}}):response(records(body))});
  try {
   const result=await f.generate(body);
   if(answer===null){assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(result.reviewHandles.length,1);assert.equal(candidate(result).text,body);assert.equal(f.calls(),1);assert.ok(result.recording.artifacts.some(a=>a.kind==='data'&&a.value?.value?.answers?.recap?.accepted===null),'The semantic answer remains unresolved, not false');}
   else {assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(result.reviewHandles.length,1);if(answer)assert.match(candidate(result).text,/<details>/);else assert.equal(candidate(result).text,body);assert.equal(f.calls(),answer?2:1);}
   assert.equal(f.saves(),0);
  } finally {f.controller.dispose();}
 }
});
test('lesson 13 reuses pinned pure helper with independent exposed title overrides',async()=>{
 const f=unifiedRecipeHost(installed(13),{request:async()=>{throw Error('Pure cards need no model');}});
 try {
  const result=await f.generate('Mara checks her supplies.');
  assert.equal(result.ok,true,JSON.stringify(result.error));
  assert.match(candidate(result).text,/Lantern card/);assert.match(candidate(result).text,/Chart card/);
  assert.match(candidate(result).text,/cracked glass lantern/);assert.match(candidate(result).text,/folded coastal chart/);
  assert.equal(f.calls(),0);assert.equal(f.saves(),0);
 } finally {f.controller.dispose();}
});
test('lesson 14 runs ordered bounded helper results and holds a fourth clue',async()=>{
 const inputs=[];
 const f=unifiedRecipeHost(installed(14),{request:async options=>{const item=JSON.parse(options.messages[1].content).data;inputs.push(item.id);return response({...item,interpretation:'Interpretation: check this clue carefully.'});}});
 try {
  const result=await f.generate('Mara examines three clues.');
  assert.equal(result.ok,true,JSON.stringify(result.error));
  assert.deepEqual(inputs,['wet-boots','warm-wax','quiet-bell']);
  const text=candidate(result).text;assert.ok(text.indexOf('wet-boots')<text.indexOf('warm-wax'));assert.ok(text.indexOf('warm-wax')<text.indexOf('quiet-bell'));
  assert.equal(f.calls(),3);assert.equal(f.saves(),0);
 } finally {f.controller.dispose();}
 const graph=installed(14),source=node(graph,'clues-text'),clues=JSON.parse(source.text);clues.push({id:'fourth',quote:'Another clue.'});source.text=JSON.stringify(clues);
 const over=unifiedRecipeHost(graph,{request:async()=>{throw Error('Overflow must hold before helper requests');}});
 try {const result=await over.generate('Mara examines four clues.');assert.equal(result.ok,false);assert.equal(result.error.code,'ITERATION_LIMIT');assert.equal(over.calls(),0);assert.equal(over.saves(),0);}finally{over.controller.dispose();}
});
test('lesson 17 stages same-target document projection, accepts once and rejects without saving',async()=>{
 const body='Mara reached the pier.';
 for(const accept of [true,false]){
  const f=unifiedRecipeHost(installed(17),{documents:[doc('accepted-scene-journal','json','[]')],request:async()=>response(records(body))});
  try {
   const result=await f.generate(body);
   assert.equal(result.ok,true,JSON.stringify(result.error));
   assert.equal(candidate(result).text,body);assert.equal(f.calls(),1);assert.equal(f.saves(),0);assert.equal(f.c.chatMetadata.latticeDocuments,undefined);
   if(accept){const applied=await f.controller.apply(result.reviewHandles[0]);assert.equal(applied.ok,true,JSON.stringify(applied.error));assert.deepEqual(JSON.parse(f.c.chatMetadata.latticeDocuments['default-user']['accepted-scene-journal'].content),[{id:'arrival',text:body}]);assert.equal(f.saves(),1);assert.equal((await f.controller.apply(result.reviewHandles[0])).ok,true);assert.equal(f.saves(),1);}
   else {assert.equal(f.controller.reject(result.reviewHandles[0]).ok,true);assert.equal((await f.controller.apply(result.reviewHandles[0])).ok,false);assert.equal(f.saves(),0);assert.equal(f.c.chatMetadata.latticeDocuments,undefined);}
  } finally {f.controller.dispose();}
 }
});
const actor='character:rowan.png',partner='character:iris.png';
const castContext = c => {c.characters=[{avatar:'rowan.png',data:{name:'Rowan'}},{avatar:'iris.png',data:{name:'Iris'}}];};
const saved = (f,target) => JSON.parse(f.c.chatMetadata.latticeDocuments['default-user'][target].content);
const clockDoc = (minute=780) => doc('story-clock','json',JSON.stringify({schemaVersion:1,clockId:'story-clock',calendarId:'campaign-days',dayLengthMinutes:1440,absoluteMinute:minute,revision:1}));
test('lesson 19 confirms exact native evidence and rejects a model-proposed action',async()=>{
 const body='Rowan opened the lighthouse door.';
 for(const accepted of [true,false]){
  const f=unifiedRecipeHost(installed(19),{configureContext:castContext,request:async options=>options.messages[0].content.startsWith('Evaluate')?response({answers:{actual:{type:'noul',accepted}}}):response([{eventType:'scene-action',actorId:actor,position:{start:0,end:body.length},semantics:'actual'}])});
  try {
   const result=await f.generate(body);assert.equal(result.ok,true,JSON.stringify(result.error));
   const events=result.recording.artifacts.flatMap(a=>a.kind==='data'&&Array.isArray(a.value?.value)?a.value.value:[]).filter(e=>e.recordType==='occurrence'&&e.status==='confirmed');
   if(accepted){assert.ok(events.length>0);assert.equal(events.at(-1).evidence.text,body);assert.equal(events.at(-1).actorId,actor);}
   else assert.equal(events.length,0);
   assert.ok(candidate(result).text.startsWith(body));assert.equal(f.calls(),2);assert.equal(f.saves(),0);
  } finally {f.controller.dispose();}
 }
});
test('lesson 20 derives pre-generation consequences from confirmed player use and accepted holder state',async()=>{
 const player='Rowan uses the signal lantern.';
 for(const accepted of [true,false]){
  const f=unifiedRecipeHost(installed(20),{playerText:player,configureContext:castContext,documents:[doc('accepted-item-holders','json',JSON.stringify({'signal-lantern':actor}))],request:async options=>options.messages[0].content.startsWith('Evaluate')?response({answers:{actual:{type:'noul',accepted}}}):response({candidates:[{eventType:'item-used',actorId:actor,itemId:'signal-lantern',position:{start:0,end:player.length},semantics:'actual'}]})});
  try {
   const result=await f.generate('The lantern casts a blue signal.');assert.equal(result.ok,true,JSON.stringify(result.error));
   const text=guidance(result);
   if(accepted){assert.match(text,/"holderId":"character:rowan.png"/);assert.match(text,/"status":"confirmed"/);assert.match(text,/Rowan uses the signal lantern/);}
   else assert.doesNotMatch(text,/"status":"confirmed"|"holderId"/);
   assert.equal(f.calls(),2);assert.equal(f.saves(),0);assert.equal(candidate(result).text,'The lantern casts a blue signal.');
  } finally {f.controller.dispose();}
 }
});
test('lesson 23 advances a genuine clock only after accepted review and preserves rejection',async()=>{
 for(const accept of [true,false]){
  const f=unifiedRecipeHost(installed(23),{documents:[clockDoc(360)],request:async()=>{throw Error('Authored time needs no model');}});
  try {
   const result=await f.generate('An hour passes on the road.');assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(f.saves(),0);assert.equal(f.calls(),0);
   if(accept){const applied=await f.controller.apply(result.reviewHandles[0]);assert.equal(applied.ok,true,JSON.stringify(applied.error));assert.equal(saved(f,'story-clock').absoluteMinute,420);assert.equal(saved(f,'story-clock').revision,2);assert.equal(f.saves(),1);assert.equal((await f.controller.apply(result.reviewHandles[0])).ok,true);assert.equal(f.saves(),1);}
   else {assert.equal(f.controller.reject(result.reviewHandles[0]).ok,true);assert.equal(f.saves(),0);assert.equal(f.c.chatMetadata.latticeDocuments,undefined);}
  } finally {f.controller.dispose();}
 }
});
test('lesson 24 wires genuine scheduled crossings and retained interrupt remainder into accepted Clock Commit',async()=>{
 for(const [policy,minute,consumed,remainder] of [['interrupt',840,1,1440],['catch-up',2280,6,0]]){
  const graph=installed(24);node(graph,'advance').policy=policy;
  const f=unifiedRecipeHost(graph,{documents:[clockDoc()],request:async()=>{throw Error('Time triggers are deterministic');}});
  try {
   const result=await f.generate('Rowan rests until the next scheduled occurrence.');assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(f.saves(),0);assert.equal(f.calls(),0);
   const applied=await f.controller.apply(result.reviewHandles[0]);assert.equal(applied.ok,true,JSON.stringify(applied.error));
   const clock=saved(f,'story-clock');assert.equal(clock.absoluteMinute,minute);assert.equal(clock.settledTimeEventIds.length,consumed);assert.equal(clock.pendingTimeAdvance?.minutes??0,remainder);assert.equal(f.saves(),1);
   assert.equal((await f.controller.apply(result.reviewHandles[0])).ok,true);assert.equal(f.saves(),1);
  } finally {f.controller.dispose();}
 }
});

test('lesson 11 uses one ordinary Decision and preserves accepted rejected and unresolved routes',async()=>{
 for(const accepted of [true,false,null]){
  const f=unifiedRecipeHost(installed(11),{request:async()=>response({answers:{promise:{type:'noul',accepted}}})});
  try {
   const result=await f.generate('Rowan listens to the promise.');assert.equal(result.ok,true,JSON.stringify(result.error));
   const answer=result.recording.artifacts.map(a=>a.value?.value).find(v=>v?.answers?.promise);
   assert.ok(answer);assert.equal(answer.answers.promise.accepted,accepted);assert.equal(f.calls(),1);assert.equal(f.saves(),0);assert.equal(result.reviewHandles.length,1);assert.ok(candidate(result).text.startsWith('Rowan listens'));
  } finally {f.controller.dispose();}
 }
});
const privateCastContext = c => {c.characters=[{avatar:'rowan.png',data:{name:'Rowan',description:'ROWAN PRIVATE SEA',visibility:{kind:'actor-private',actorId:actor}}},{avatar:'iris.png',data:{name:'Iris',description:'IRIS PRIVATE FIRE',visibility:{kind:'actor-private',actorId:partner}}}];};
test('lesson 21 gives only an actually present selected actor private native direction',async()=>{
 for(const status of ['present','absent']){
  const requests=[];
  const f=unifiedRecipeHost(installed(21),{playerText:'Rowan and Iris stand beside the lighthouse door.',configureContext:privateCastContext,request:async options=>{
   const material=JSON.parse(options.messages[1].content);requests.push(material);
   if(material.request){const source=material.context.source;return response({sceneId:source.sceneId,sourceId:source.sourceId,revision:source.revision,actors:[{actorId:actor,status,evidence:'Rowan and Iris stand beside the lighthouse door.'}]});}
   return response('Rowan alone hesitates before the sea.');
  }});
  try {
   const result=await f.generate('Rowan waits by the door.');assert.equal(result.ok,true,JSON.stringify(result.error));
   assert.equal(f.calls(),status==='present'?2:1);assert.equal(guidance(result).includes('Rowan alone hesitates'),status==='present');
   if(status==='present'){assert.match(JSON.stringify(requests[1]),/ROWAN PRIVATE SEA/);assert.doesNotMatch(JSON.stringify(requests[1]),/IRIS PRIVATE FIRE/);}
   assert.equal(candidate(result).text,'Rowan waits by the door.');assert.equal(f.saves(),0);
  } finally {f.controller.dispose();}
 }
});
test('lesson 17 deduplicates an existing canonical record without discarding prior journal entries',async()=>{
 const body='Rowan reached the pier.',prior=[{id:'older',text:'Earlier scene.'},{id:'arrival',text:body}];
 const f=unifiedRecipeHost(installed(17),{documents:[doc('accepted-scene-journal','json',JSON.stringify(prior))],request:async()=>response(records(body))});
 try {
  const result=await f.generate(body);assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(f.saves(),0);
  const applied=await f.controller.apply(result.reviewHandles[0]);assert.equal(applied.ok,true,JSON.stringify(applied.error));
  // A no-op may leave canonical storage unmaterialized; the authorized template remains the same content.
  const content=f.c.chatMetadata.latticeDocuments?.['default-user']?.['accepted-scene-journal']?.content??f.catalog.definition('accepted-scene-journal').data.content;
  assert.deepEqual(JSON.parse(content),prior);assert.equal(f.calls(),1);
  const before=f.saves();assert.equal((await f.controller.apply(result.reviewHandles[0])).ok,true);assert.equal(f.saves(),before);
 } finally {f.controller.dispose();}
});
const documentContent=(f,target)=>JSON.parse(f.c.chatMetadata.latticeDocuments?.['default-user']?.[target]?.content??f.catalog.definition(target).data.content);
test('lesson 27 settles one fixed or novelty-approved wild draw without rerolling on Apply',async()=>{
 const player='Rowan uses the broken wand.';
 for(const wild of [false,true]){
  let draws=0;const library={libraryId:'wand-effects',revision:'r1',itemId:'broken-wand',effects:[wild?{id:'wild',kind:'generate',weight:1}:{id:'sparks',kind:'fixed',weight:1,description:'Blue sparks replace the spell.'}]};
  const f=unifiedRecipeHost(installed(27),{playerText:player,configureContext:castContext,documents:[doc('wand-holders','json',JSON.stringify({'broken-wand':actor})),doc('wand-effects','json',JSON.stringify(library)),doc('wand-outcomes','json','[]')],random:()=>{draws++;return .5;},request:async options=>{
   const material=JSON.parse(options.messages[1].content);
   if(options.messages[0].content.startsWith('Revise'))return response(material.draft);
   if(options.messages[0].content.startsWith('Evaluate'))return response({answers:{[material.questions.novel?'novel':'actual']:{type:'noul',accepted:true}}});
   if(options.messages[0].content.includes('Invent')||material.outcome)return response({id:'paper-moths',description:'Paper moths circle Rowan.',spellOutcome:'replaced',duration:'One minute',consequence:'The target is unharmed.'});
   return response({candidates:[{eventType:'item-used',actorId:actor,itemId:'broken-wand',position:{start:0,end:player.length},semantics:'actual'}]});
  }});
  try {
   const body=wild?'Paper moths circle Rowan.':'Blue sparks replace the spell.';
   const result=await f.generate(body);assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(draws,1);assert.equal(f.calls(),wild?5:3);assert.equal(f.saves(),0);assert.match(guidance(result),wild?/paper-moths/:/sparks/);
   const applied=await f.controller.apply(result.reviewHandles[0]);assert.equal(applied.ok,true,JSON.stringify(applied.error));
   const outcomes=saved(f,'wand-outcomes');assert.equal(outcomes.length,1);assert.equal(outcomes[0].acceptance,'accepted');assert.equal(outcomes[0].effect.id,wild?'paper-moths':'sparks');assert.equal(outcomes[0].event.holderId,actor);assert.equal(f.saves(),1);
   assert.equal((await f.controller.apply(result.reviewHandles[0])).ok,true);assert.equal(draws,1);assert.equal(f.calls(),wild?5:3);assert.equal(f.saves(),1);
  } finally {f.controller.dispose();}
 }
});
test('lesson 28 crosses 99 to 100 souls only from a new deliberately confirmed kill',async()=>{
 const body='Rowan killed Iris with the soul-stealing sword.',prior=Array.from({length:99},(_,i)=>({id:'prior-'+i}));
 for(const accepted of [true,false]){
  const f=unifiedRecipeHost(installed(28),{configureContext:castContext,documents:[doc('sword-souls','json',JSON.stringify(prior))],request:async options=>{
   const material=JSON.parse(options.messages[1].content);
   if(options.messages[0].content.startsWith('Revise'))return response(material.draft+' The sword glows at its new tier.');
   if(options.messages[0].content.startsWith('Evaluate'))return response({answers:{actual:{type:'noul',accepted}}});
   return response([{eventType:'scene-action',actorId:actor,objectId:partner,position:{start:0,end:body.length},semantics:'actual'}]);
  }});
  try {
   const result=await f.generate(body);assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(f.saves(),0);assert.equal(f.calls(),accepted?3:2);
   if(accepted)assert.match(candidate(result).text,/new tier/);else assert.equal(candidate(result).text,body);
   const applied=await f.controller.apply(result.reviewHandles[0]);assert.equal(applied.ok,true,JSON.stringify(applied.error));
   const souls=documentContent(f,'sword-souls');assert.equal(souls.length,accepted?100:99);if(accepted){assert.equal(souls.at(-1).victimId,partner);assert.equal(souls.at(-1).quote,body);}
   assert.equal((await f.controller.apply(result.reviewHandles[0])).ok,true);assert.equal(documentContent(f,'sword-souls').length,accepted?100:99);
  } finally {f.controller.dispose();}
 }
});
test('lesson 28 does not award a second soul when a regenerated confirmed kill repeats the same victim',async()=>{
 const body='Rowan killed Iris with the soul-stealing sword.',prior=Array.from({length:99},(_,i)=>({id:'prior-'+i}));
 const request=async options=>{const material=JSON.parse(options.messages[1].content);if(options.messages[0].content.startsWith('Revise'))return response(material.draft);if(options.messages[0].content.startsWith('Evaluate'))return response({answers:{actual:{type:'noul',accepted:true}}});return response([{eventType:'scene-action',actorId:actor,objectId:partner,position:{start:0,end:body.length},semantics:'actual'}]);};
 const first=unifiedRecipeHost(installed(28),{configureContext:castContext,documents:[doc('sword-souls','json',JSON.stringify(prior))],request});let acceptedSouls;
 try {const result=await first.generate(body);assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal((await first.controller.apply(result.reviewHandles[0])).ok,true);acceptedSouls=documentContent(first,'sword-souls');assert.equal(acceptedSouls.length,100);}finally{first.controller.dispose();}
 const repeat=unifiedRecipeHost(installed(28),{configureContext:castContext,documents:[doc('sword-souls','json',JSON.stringify(acceptedSouls))],request});
 try {const result=await repeat.generate(body);assert.equal(result.ok,false);assert.equal(result.error.code,'IDENTITY_CONFLICT','Changed source evidence for a collected victim deliberately holds for reconciliation');assert.equal(result.reviewHandles?.length??0,0);assert.equal(documentContent(repeat,'sword-souls').length,100);assert.equal(repeat.saves(),0);assert.equal(repeat.calls(),2,'The repeated victim does not cross a tier or request revision');}finally{repeat.controller.dispose();}
});
const privateDoc=(targetId,actorId,content=[])=>({...doc(targetId,'json',JSON.stringify(content)),visibility:{kind:'actor-private',actorId}});
test('lesson 29 requires explicit per-actor permission and preserves isolated private reflection files',async()=>{
 const body='Rowan and Iris kiss beside the lighthouse door.';
 for(const permission of [false,true,'rowan-only']){
  const permitted=key=>permission===true||(permission==='rowan-only'&&key==='rowan'),count=permission===true?2:permission==='rowan-only'?1:0;
  const graph=installed(29);
  for(const key of ['rowan','iris'])node(graph,key+'-permission-text').text=JSON.stringify({allowModelAuthoredReflection:permitted(key)});
  const reflections=[];
  const f=unifiedRecipeHost(graph,{configureContext:privateCastContext,documents:[privateDoc('rowan-moments',actor),privateDoc('iris-moments',partner)],request:async options=>{
   const material=JSON.parse(options.messages[1].content);
   if(material.questions?.kiss)return response({answers:{kiss:{type:'noul',accepted:true}}});
   if(material.request?.startsWith('Return exactly {sceneId')){const source=material.data;return response({sceneId:source.sceneId,sourceId:source.sourceId,revision:source.revision,actors:[{actorId:actor,status:'present',evidence:body},{actorId:partner,status:'present',evidence:body}]});}
   if(material.context?.source?.actorId){reflections.push(material);return response({reflection:material.context.source.actorId===actor?'Rowan privately remembers the sea.':'Iris privately remembers the fire.'});}
   return response([{eventType:'scene-action',actorId:actor,objectId:partner,position:{start:0,end:body.length},semantics:'actual'}]);
  }});
  try {
   const result=await f.generate(body);assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(candidate(result).text,body);assert.equal(f.saves(),0);assert.equal(f.calls(),3+count);assert.equal(reflections.length,count);
   for(const material of reflections){const text=JSON.stringify(material);assert.equal(text.includes('ROWAN PRIVATE SEA')&&text.includes('IRIS PRIVATE FIRE'),false);assert.match(text,material.context.source.actorId===actor?/ROWAN PRIVATE SEA/:/IRIS PRIVATE FIRE/);}
   assert.doesNotMatch(candidate(result).text,/PRIVATE SEA|PRIVATE FIRE|privately remembers/);
   const applied=await f.controller.apply(result.reviewHandles[0]);assert.equal(applied.ok,true,JSON.stringify(applied.error));assert.equal(f.saves(),count);
   for(const [key,id] of [['rowan',actor],['iris',partner]]){if(permitted(key)){const record=saved(f,key+'-moments')[0];assert.equal(record.actorId,id);assert.equal(record.sharedQuote,body);assert.equal(record.sceneEvidence.text,body);assert.equal(record.reflectionOrigin,'model-authored');assert.equal(record.text,record.reflection);}else{assert.deepEqual(documentContent(f,key+'-moments'),[]);}}
  } finally {f.controller.dispose();}
 }
});
test('lesson 30 derives selected-actor private portrayal from directional rules and genuine elapsed story minutes',async()=>{
 const player='Rowan helped Iris repair the lantern.';
 const initial={values:[['trust',2],['desire',1],['tension',2],['excitement',1]].map(([dimension,value])=>({key:'rowan-toward-iris-'+dimension,value,subjectId:actor,objectId:partner,visibility:{kind:'actor-private',actorId:actor}})),ledger:[]};
 for(const accept of [true,false]){
  const portrayal=[];
  const f=unifiedRecipeHost(installed(30),{playerText:player,configureContext:privateCastContext,documents:[privateDoc('rowan-relationship',actor,initial),clockDoc(10080)],request:async options=>{
   const material=JSON.parse(options.messages[1].content);
   if(options.messages[0].content.startsWith('Evaluate'))return response({answers:{actual:{type:'noul',accepted:true}}});
   if(material.request?.startsWith('Return exactly {sceneId')){const source=material.context.source;return response({sceneId:source.sceneId,sourceId:source.sourceId,revision:source.revision,actors:[{actorId:actor,status:'present',evidence:player}]});}
   if(material.scope?.actorId){portrayal.push(material);return response('Rowan shows cautious trust at '+material.data.values[0].value+' and leaves Iris free to respond.');}
   return response([{eventType:'scene-action',actorId:actor,objectId:partner,position:{start:0,end:player.length},semantics:'actual'}]);
  }});
  try {
   const result=await f.generate('Rowan sets down the repaired lantern.');assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(f.saves(),0);assert.equal(f.calls(),4);assert.equal(portrayal.length,1);
   assert.equal(portrayal[0].scope.actorId,actor);assert.deepEqual(portrayal[0].data.values.map(v=>v.value),[2,.85,.75,.5],'Projected decay and interaction values causally reach the selected actor request');assert.match(JSON.stringify(portrayal[0]),/ROWAN PRIVATE SEA/);assert.doesNotMatch(JSON.stringify(portrayal[0]),/IRIS PRIVATE FIRE/);assert.match(guidance(result),/cautious trust at 2/);assert.equal(candidate(result).text,'Rowan sets down the repaired lantern.');
   if(accept){
    const applied=await f.controller.apply(result.reviewHandles[0]);assert.equal(applied.ok,true,JSON.stringify(applied.error));
    const state=saved(f,'rowan-relationship');assert.equal(state.values[0].value,2,'One week decays2→1, one confirmed support adds1');assert.equal(state.values[0].subjectId,actor);assert.equal(state.values[0].objectId,partner);assert.deepEqual(state.values.map(v=>v.value),[2,.85,.75,.5]);assert.equal(state.ledger.length,4);assert.equal(f.saves(),1);
    assert.equal((await f.controller.apply(result.reviewHandles[0])).ok,true);assert.equal(f.saves(),1);assert.equal(f.calls(),4);
   }else{
    assert.equal(f.controller.reject(result.reviewHandles[0]).ok,true);assert.equal((await f.controller.apply(result.reviewHandles[0])).ok,false);assert.deepEqual(documentContent(f,'rowan-relationship'),initial);assert.equal(f.saves(),0);assert.equal(f.c.chatMetadata.latticeDocuments,undefined);
   }
  } finally {f.controller.dispose();}
 }
});
test('lesson 27 holds a rejected or unresolved wild novelty proposal without publication or outcome persistence',async()=>{
 for(const novelty of [false,null]){
 const player='Rowan uses the broken wand.';let draws=0;
 const library={libraryId:'wand-effects',revision:'r1',itemId:'broken-wand',effects:[{id:'wild',kind:'generate',weight:1}]};
 const f=unifiedRecipeHost(installed(27),{playerText:player,configureContext:castContext,documents:[doc('wand-holders','json',JSON.stringify({'broken-wand':actor})),doc('wand-effects','json',JSON.stringify(library)),doc('wand-outcomes','json','[]')],random:()=>{draws++;return .5;},request:async options=>{
  const material=JSON.parse(options.messages[1].content);
  if(options.messages[0].content.startsWith('Evaluate'))return response({answers:{[material.questions.novel?'novel':'actual']:{type:'noul',accepted:material.questions.novel?novelty:true}}});
  if(material.outcome)return response({id:'paper-moths',description:'Paper moths circle Rowan.',spellOutcome:'replaced',duration:'One minute',consequence:'The target is unharmed.'});
  if(options.messages[0].content.startsWith('Revise'))throw Error('Rejected novelty cannot reach revision');
  return response({candidates:[{eventType:'item-used',actorId:actor,itemId:'broken-wand',position:{start:0,end:player.length},semantics:'actual'}]});
 }});
 try {const result=await f.generate('A rejected wild proposal.');assert.equal(result.ok,false);assert.equal(result.reviewHandles?.length??0,0);assert.equal(draws,1);assert.equal(f.saves(),0);assert.equal(f.c.chatMetadata.latticeDocuments,undefined);assert.equal(f.c.chat.length,1,'Unresolved required effect guidance holds native generation');}finally{f.controller.dispose();}
 }
});
test('lesson 29 skips rejected evidence but holds unresolved or missing evidence before private reflection',async()=>{
 const body='Rowan and Iris discuss the lighthouse.';
 for(const [empty,accepted] of [[true,true],[false,false],[false,null]]){
  const graph=installed(29);for(const key of ['rowan','iris'])node(graph,key+'-permission-text').text=JSON.stringify({allowModelAuthoredReflection:true});
  let decisions=0;
  const f=unifiedRecipeHost(graph,{configureContext:privateCastContext,documents:[privateDoc('rowan-moments',actor),privateDoc('iris-moments',partner)],request:async options=>{
   const material=JSON.parse(options.messages[1].content);
   if(material.questions?.kiss){decisions++;return response({answers:{kiss:{type:'noul',accepted}}});}
   if(material.request?.startsWith('Return exactly {sceneId')){const source=material.data;return response({sceneId:source.sceneId,sourceId:source.sourceId,revision:source.revision,actors:[{actorId:actor,status:'present',evidence:body},{actorId:partner,status:'present',evidence:body}]});}
   if(material.context?.source?.actorId)throw Error('Absent/unconfirmed kiss must not request private reflection');
   return response(empty?[]:[{eventType:'scene-action',actorId:actor,objectId:partner,position:{start:0,end:body.length},semantics:'actual'}]);
  }});
  try {const result=await f.generate(body);if(!empty&&accepted===false){assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(candidate(result).text,body);assert.equal(result.reviewHandles.length,1);assert.equal((await f.controller.apply(result.reviewHandles[0])).ok,true);}else{assert.equal(result.ok,false);assert.equal(result.error.code,'UNRESOLVED_INPUT');assert.equal(result.reviewHandles?.length??0,0);}assert.equal(f.saves(),0);assert.equal(decisions,empty?0:1);assert.equal(f.c.chatMetadata.latticeDocuments,undefined);assert.equal(f.c.chat.at(-1).mes,body);}finally{f.controller.dispose();}
 }
});

test('lesson 27 requires an actual use and accepted known holder before drawing or settling an effect',async()=>{
 const player='Rowan examines the broken wand.';
 for(const missing of ['use','holder']){
  let draws=0;
  const library={libraryId:'wand-effects',revision:'r1',itemId:'broken-wand',effects:[{id:'sparks',kind:'fixed',weight:1,description:'Blue sparks.'}]};
  const f=unifiedRecipeHost(installed(27),{playerText:player,configureContext:castContext,documents:[doc('wand-holders','json',JSON.stringify(missing==='holder'?{}:{'broken-wand':actor})),doc('wand-effects','json',JSON.stringify(library)),doc('wand-outcomes','json','[]')],random:()=>{draws++;return .5;},request:async options=>{
   if(options.messages[0].content.startsWith('Evaluate'))return response({answers:{actual:{type:'noul',accepted:true}}});
   if(options.messages[0].content.startsWith('Revise'))throw Error('Missing use/holder cannot authorize revision');
   return response({candidates:missing==='use'?[]:[{eventType:'item-used',actorId:actor,itemId:'broken-wand',position:{start:0,end:player.length},semantics:'actual'}]});
  }});
  try {const result=await f.generate('Rowan examines the wand.');assert.equal(result.ok,false,missing);assert.equal(result.reviewHandles?.length??0,0);assert.equal(draws,0);assert.equal(f.saves(),0);assert.deepEqual(documentContent(f,'wand-outcomes'),[]);}finally{f.controller.dispose();}
 }
});
test('lesson 29 requires both actors present before either permitted private reflection',async()=>{
 const body='Rowan and Iris kiss beside the lighthouse door.';
 for(const [rowanPresent,irisStatus] of [[false,'absent'],[true,'absent'],[true,'unresolved']]){
  const graph=installed(29);for(const key of ['rowan','iris'])node(graph,key+'-permission-text').text=JSON.stringify({allowModelAuthoredReflection:true});
  const reflections=[];
  const f=unifiedRecipeHost(graph,{configureContext:privateCastContext,documents:[privateDoc('rowan-moments',actor),privateDoc('iris-moments',partner)],request:async options=>{
   const material=JSON.parse(options.messages[1].content);
   if(material.questions?.kiss)return response({answers:{kiss:{type:'noul',accepted:true}}});
   if(material.request?.startsWith('Return exactly {sceneId')){const source=material.data;return response({sceneId:source.sceneId,sourceId:source.sourceId,revision:source.revision,actors:[{actorId:actor,status:rowanPresent?'present':'absent',evidence:body},{actorId:partner,status:irisStatus,evidence:body}]});}
   if(material.context?.source?.actorId){reflections.push(material.context.source.actorId);assert.equal(material.context.source.actorId,actor);assert.doesNotMatch(JSON.stringify(material),/IRIS PRIVATE FIRE/);return response({reflection:'Rowan alone privately remembers the sea.'});}
   return response([{eventType:'scene-action',actorId:actor,objectId:partner,position:{start:0,end:body.length},semantics:'actual'}]);
  }});
  try {const result=await f.generate(body);if(irisStatus==='unresolved'){assert.equal(result.ok,false,'Unresolved participation is held explicitly');assert.equal(result.error.code,'UNRESOLVED_INPUT');assert.equal(result.reviewHandles?.length??0,0);}else{assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(candidate(result).text,body);assert.equal((await f.controller.apply(result.reviewHandles[0])).ok,true);}assert.deepEqual(reflections,[],'A paired kiss recipe needs both actually present actors');assert.equal(f.calls(),3);assert.equal(f.saves(),0);assert.deepEqual(documentContent(f,'rowan-moments'),[]);assert.deepEqual(documentContent(f,'iris-moments'),[]);}finally{f.controller.dispose();}
 }
});

test('lesson 18 recalls native history and commits two distinct owned replies with exact settled source revisions',async()=>{
 let body='',turn=0;const reflections=[],directions=[],proposals=[];
 const f=unifiedRecipeHost(installed(18),{configureContext:privateCastContext,request:async options=>{
  const m=JSON.parse(options.messages[1].content);
  if(m.request?.startsWith('Return exactly {sceneId')){const source=m.context?.source??m.data;return response({sceneId:source.sceneId,sourceId:source.sourceId,revision:source.revision,actors:[{actorId:actor,status:'present',evidence:f.c.chat.findLast(x=>x.is_user).mes}]});}
  if(m.scope?.actorId&&Object.hasOwn(m,'data')){directions.push(m);assert.equal(m.scope.actorId,actor);assert.match(JSON.stringify(m.data),/Remember the accepted lantern scene/);return response('Rowan carefully remembers the accepted lantern scene.');}
  if(m.events){const event=m.events.find(e=>e.text===body);assert.ok(event,'Internalize receives this newly completed exact native reply');assert.equal(event.settled,true);assert.match(event.revision,/^[a-f0-9]{64}$/);proposals.push({id:event.id,revision:event.revision,text:event.text});return response({changes:[upsert('episodes','accepted-turn-'+turn,body,sourceRefs([event]))],values:{},curves:{},tracks:{}});}
  reflections.push(m);assert.equal(m.state.scope.actorId,actor);assert.equal(m.state.payload.episodes.length,turn-1);return response(reflection({brief:'Observation: accepted history remains exact.',behaviorHints:['Remember the accepted lantern scene; leave player choices explicit.']}));
 }});
 try {
  for(turn=1;turn<=2;turn++){
   body='Rowan lights the lantern in the current scene '+turn+'.';if(turn===2)f.c.chat.push(completedMessage('Rowan pauses at the lighthouse.',2,true));
   const before=f.saves(),r=await f.generate(body);assert.equal(r.ok,true,JSON.stringify({turn,error:r.error}));assert.equal(candidate(r).text,body);assert.match(guidance(r),/carefully remembers/);assert.equal(f.saves(),before);
   assert.equal((await f.controller.apply(r.reviewHandles[0])).ok,true);const stored=f.c.chatMetadata.latticeIntrospection['native-chat'][actor];assert.equal(stored.state.value.store.version,turn);assert.equal(stored.state.value.payload.episodes.length,turn);assert.equal(stored.receipts.length,turn);assert.equal(new Set(stored.receipts.map(x=>x.key)).size,turn);
   const episode=stored.state.value.payload.episodes.at(-1);assert.equal(episode.text,body);const currentEvents=await readMemory({context:f.c},'events'),currentRef=currentEvents.artifact.value.sourceRefs.find(x=>x.id===proposals.at(-1).id);assert.deepEqual(episode.sourceRefs,[currentRef],'Stored source rebases to the exact accepted selected native revision');assert.notEqual(currentRef.revision,proposals.at(-1).revision);
   const saves=f.saves();assert.equal((await f.controller.apply(r.reviewHandles[0])).ok,true);assert.equal(f.saves(),saves);
  }
  assert.equal(reflections.length,2);assert.equal(directions.length,2);assert.equal(proposals.length,2);assert.notEqual(proposals[0].id,proposals[1].id);assert.equal(f.calls(),8);
 }finally{f.controller.dispose();}
});
const seedLantern=async f=>seedMemory({context:f.c},({events})=>[upsert('episodes','lantern-memory',events[0].text,sourceRefs([events[0]]))]);
const withLanternHistory=c=>{privateCastContext(c);c.chat.unshift(completedMessage('Rowan once used the signal lantern beside the lighthouse.',0));};
test('lesson 22 recalls a genuine native episode and stages separate output records across two accepted turns',async()=>{
 const f=unifiedRecipeHost(installed(22),{playerText:'Rowan carries the signal lantern.',configureContext:withLanternHistory,documents:[doc('accepted-item-holders','json',JSON.stringify({'signal-lantern':actor})),privateDoc('rowan-item-memories',actor)],request:async options=>{
  const m=JSON.parse(options.messages[1].content);
  if(m.request){const source=m.context?.source??m.data;return response({sceneId:source.sceneId,sourceId:source.sourceId,revision:source.revision,actors:[{actorId:actor,status:'present',evidence:source.text??f.c.chat.findLast(x=>x.is_user).mes}]});}
  assert.equal(m.event.holderId,actor);assert.equal(m.memories[0].memoryId,'lantern-memory');assert.match(m.memories[0].text,/once used/);assert.doesNotMatch(JSON.stringify(m),/IRIS PRIVATE FIRE/);return response({kind:'recalled',memoryId:'lantern-memory'});
 }});
 try {
  await seedLantern(f);
  for(let turn=1;turn<=2;turn++){
   if(turn===2)f.c.chat.push(completedMessage('Rowan still carries the signal lantern.',3,true));
   const r=await f.generate('Rowan holds the signal lantern carefully.');assert.equal(r.ok,true,JSON.stringify(r.error));assert.equal(f.saves(),turn-1);assert.equal(candidate(r).text,'Rowan holds the signal lantern carefully.');assert.equal((await f.controller.apply(r.reviewHandles[0])).ok,true);
   const output=saved(f,'rowan-item-memories');assert.equal(output.length,turn);assert.equal(new Set(output.map(x=>x.eventId)).size,turn);assert.equal(output.at(-1).memory.memoryId,'lantern-memory');assert.equal(output.at(-1).memory.classification,'recalled');assert.equal(f.saves(),turn);
  }
  assert.equal(f.calls(),4);
 }finally{f.controller.dispose();}
});
test('lesson 22 guards missing mention, absent holder and unpermitted invention without private output writes',async()=>{
 for(const mode of ['no-mention','absent','no-memory','creation-denied']){
  const graph=installed(22);if(mode==='creation-denied')node(graph,'remember').mode='create';
  const f=unifiedRecipeHost(graph,{playerText:mode==='no-mention'?'Rowan watches the sea.':'Rowan carries the signal lantern.',configureContext:withLanternHistory,documents:[doc('accepted-item-holders','json',JSON.stringify({'signal-lantern':actor})),privateDoc('rowan-item-memories',actor)],request:async options=>{
   const m=JSON.parse(options.messages[1].content);if(m.request){const source=m.context?.source??m.data;return response({sceneId:source.sceneId,sourceId:source.sourceId,revision:source.revision,actors:[{actorId:actor,status:mode==='absent'?'absent':'present',evidence:source.text??f.c.chat.findLast(x=>x.is_user).mes}]});}throw Error('Unavailable/unpermitted memory must not request invented history');
  }});
  try {if(mode!=='no-memory')await seedLantern(f);const r=await f.generate(mode==='no-mention'?'Rowan waits beside the sea.':'Rowan carries the signal lantern.');if(['no-mention','absent'].includes(mode)){assert.equal(r.ok,true,JSON.stringify(r.error));assert.equal((await f.controller.apply(r.reviewHandles[0])).ok,true);}else{assert.equal(r.ok,false);assert.equal(r.reviewHandles?.length??0,0);if(mode==='creation-denied')assert.equal(r.error.code,'MEMORY_CREATION_NOT_ALLOWED');}assert.equal(f.saves(),0);assert.deepEqual(documentContent(f,'rowan-item-memories'),[]);}finally{f.controller.dispose();}
 }
});
test('lesson 26 recalls unchanged selected-actor records and consumes queued recall only on accepted review',async()=>{
 const prior=[{id:'lighthouse-memory',actorId:actor,text:'ROWAN PRIVATE MEMORY: the lighthouse lantern was warm.'}];
 const graph=installed(26),f=unifiedRecipeHost(graph,{playerText:'Rowan walks beside the sea.',configureContext:privateCastContext,documents:[privateDoc('rowan-moments',actor,prior)],request:async options=>{const m=JSON.parse(options.messages[1].content),source=m.context.source;return response({sceneId:source.sceneId,sourceId:source.sourceId,revision:source.revision,actors:[{actorId:actor,status:'present',evidence:f.c.chat.findLast(x=>x.is_user).mes}]});}});
 try {
  assert.equal(f.controller.statusRecall().data.shortcuts[0].queued,false,'Preview configuration does not queue recall');assert.equal(f.controller.queueRecall(node(graph,'hotkey').id).ok,true);
  for(let turn=1;turn<=2;turn++){
   if(turn===2)f.c.chat.push(completedMessage('Rowan listens to the waves.',2,true));const r=await f.generate('Rowan pauses by the shore.');assert.equal(r.ok,true,JSON.stringify(r.error));assert.equal(guidance(r).includes(prior[0].text),turn===1);assert.equal(f.controller.statusRecall().data.shortcuts[0].remaining.reply,turn===1);assert.equal((await f.controller.apply(r.reviewHandles[0])).ok,true);assert.equal(f.controller.statusRecall().data.shortcuts[0].remaining.reply,false);assert.equal(f.controller.statusRecall().data.shortcuts[0].remaining.swipe,true);assert.equal(f.saves(),0);assert.deepEqual(documentContent(f,'rowan-moments'),prior);
  }
  assert.equal(f.calls(),2);
 }finally{f.controller.dispose();}
});
test('lesson 26 keywords require actual presence and preserve records on rejected review',async()=>{
 const prior=[{id:'lighthouse-memory',actorId:actor,text:'ROWAN PRIVATE MEMORY: the lighthouse lantern was warm.'}];
 for(const mode of ['keyword','no-keyword','absent']){
  const f=unifiedRecipeHost(installed(26),{playerText:mode==='no-keyword'?'Rowan visits the coast.':'Rowan visits the lighthouse.',configureContext:privateCastContext,documents:[privateDoc('rowan-moments',actor,prior)],request:async options=>{const m=JSON.parse(options.messages[1].content),source=m.context.source;return response({sceneId:source.sceneId,sourceId:source.sourceId,revision:source.revision,actors:[{actorId:actor,status:mode==='absent'?'absent':'present',evidence:f.c.chat.findLast(x=>x.is_user).mes}]});}});
  try {const r=await f.generate('Rowan pauses by the shore.');assert.equal(r.ok,true,JSON.stringify(r.error));assert.equal(guidance(r).includes(prior[0].text),mode==='keyword');assert.equal(f.controller.reject(r.reviewHandles[0]).ok,true);assert.equal(f.saves(),0);assert.deepEqual(documentContent(f,'rowan-moments'),prior);}finally{f.controller.dispose();}
 }
});

test('lesson 22 requires explicit creation permission before an invented private memory can be staged',async()=>{
 const body='Rowan carries the signal lantern.',graph=installed(22);node(graph,'remember').mode='create';node(graph,'remember').allowCreate=true;
 const f=unifiedRecipeHost(graph,{configureContext:privateCastContext,documents:[doc('accepted-item-holders','json',JSON.stringify({'signal-lantern':actor})),privateDoc('rowan-item-memories',actor)],request:async options=>{
  const m=JSON.parse(options.messages[1].content);if(m.request){const source=m.data;return response({sceneId:source.sceneId,sourceId:source.sourceId,revision:source.revision,actors:[{actorId:actor,status:'present',evidence:source.text}]});}assert.equal(m.mode,'create');assert.equal(m.allowCreate,true);assert.doesNotMatch(JSON.stringify(m),/IRIS PRIVATE FIRE/);return response({kind:'invented',text:'An explicitly authored private lantern memory.'});
 }});
 try {const r=await f.generate(body);assert.equal(r.ok,true,JSON.stringify(r.error));assert.equal(f.saves(),0);assert.equal((await f.controller.apply(r.reviewHandles[0])).ok,true);const record=saved(f,'rowan-item-memories')[0];assert.equal(record.memory.actorId,actor);assert.equal(record.memory.classification,'invented');assert.equal(record.memory.text,'An explicitly authored private lantern memory.');assert.equal(f.saves(),1);assert.equal(f.calls(),2);assert.equal(f.c.chatMetadata.latticeIntrospection,undefined,'The output ledger does not silently create a native episode');}finally{f.controller.dispose();}
});
test('lesson 30 makes no private portrayal request for an absent actor without inventing interaction progression',async()=>{
 const initial={values:[['trust',2],['desire',1],['tension',2],['excitement',1]].map(([dimension,value])=>({key:'rowan-toward-iris-'+dimension,value,subjectId:actor,objectId:partner,visibility:{kind:'actor-private',actorId:actor}})),ledger:[]};
 const f=unifiedRecipeHost(installed(30),{playerText:'The coast lies quiet.',configureContext:privateCastContext,documents:[privateDoc('rowan-relationship',actor,initial),clockDoc(10080)],request:async options=>{const m=JSON.parse(options.messages[1].content);if(m.request?.startsWith('Return exactly {sceneId')){const source=m.context.source;return response({sceneId:source.sceneId,sourceId:source.sourceId,revision:source.revision,actors:[{actorId:actor,status:'absent',evidence:'The coast lies quiet.'}]});}if(m.scope?.actorId)throw Error('Absent actor must not request private portrayal');if(options.messages[0].content.startsWith('Evaluate'))throw Error('No actual interaction must not request confirmation');return response([]);}});
 try {const r=await f.generate('The tide recedes.');assert.equal(r.ok,true,JSON.stringify(r.error));assert.equal(guidance(r),'');assert.equal(candidate(r).text,'The tide recedes.');assert.equal(f.calls(),2);assert.equal(f.saves(),0);assert.equal((await f.controller.apply(r.reviewHandles[0])).ok,true);const state=documentContent(f,'rowan-relationship');assert.deepEqual(state.values.map(x=>x.value),[1,.75,1,0],'Accepted story-time decay remains lawful without an invented interaction');assert.deepEqual(state.ledger,[]);assert.equal(f.saves(),1);}finally{f.controller.dispose();}
});
