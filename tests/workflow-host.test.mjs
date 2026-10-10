import assert from 'node:assert/strict';
import test from 'node:test';
import {snapshotContext,snapshotReply} from '../src/workflow/host.js';
import {reviewGraph,nativeFixture} from './helpers/native-workflow-fixture.mjs';
const post=reviewGraph();
const fixture=(request,graph=post)=>nativeFixture(graph,{request});
const sourceGraph={id:'source-target',schema:3,runtime:2,mode:'native-unified',nodes:{source:{id:'source',type:'workflow',operation:'reply-snapshot'}},wires:{},definitions:{},portals:{}};
const readSelected=f=>f.controller.runTarget(sourceGraph,{workflowId:sourceGraph.id,instancePath:[],nodeId:'source',portId:'out'});

test('cancellation clears only owned Lattice prompts',()=>{const f=fixture();f.c.extensionPrompts['lattice:guidance:new']={value:'clear'};f.c.extensionPrompts['comfytavern:guidance:old']={value:'keep historical'};f.controller.cancel();assert.equal(f.owned(),'');assert.equal(f.c.extensionPrompts.other.value,'keep');assert.equal(f.c.extensionPrompts['comfytavern:guidance:old'].value,'keep historical');});
test('accepted unified revision preserves original swipe, applies once and requires its issued handle',async()=>{const f=fixture(),result=await f.generate();assert.equal(result.ok,true,JSON.stringify(result.error));const handle=structuredClone(result.reviewHandles[0]);assert.equal((await f.controller.apply(handle)).ok,true);assert.equal(f.original.mes,'We explore.');assert.equal(f.original.swipes[0],'We delve.');assert.equal(f.original.swipe_info[0].extra.old,'keep');assert.equal(f.original.extra.old,undefined);assert.ok(f.original.extra.latticeRevision);await f.controller.apply(handle);assert.equal(f.original.swipes.length,2);assert.equal(f.c.saved,1);assert.equal((await f.controller.apply({...handle,handleId:'forged'})).ok,false);});
for(const [label,mutate] of [['reply',f=>f.original.mes+=' external'],['new turn',f=>f.c.chat.push({is_user:true,mes:'new'})],['order',f=>f.c.chat.reverse()],['delete',f=>f.c.chat.pop()],['chat',f=>f.c.chatId='two'],['swipe',f=>f.original.swipe_id=1],['busy',f=>f.setBusy(true)],['cancel',f=>f.controller.cancel('graph changed')],['stored original',f=>f.original.swipes[0]='externally rewritten']])test('unified candidate rejects changed '+label+' without altering chat',async()=>{const f=fixture(),result=await f.generate();assert.equal(result.ok,true,JSON.stringify(result.error));mutate(f);const before=JSON.stringify(f.c.chat);assert.equal((await f.controller.apply(structuredClone(result.reviewHandles[0]))).ok,false);assert.equal(JSON.stringify(f.c.chat),before);});
test('save failure restores the entire local message',async()=>{const f=fixture(),r=await f.generate(),before=structuredClone(f.original);f.c.saveChat=async()=>{throw Error('save failed');};assert.equal((await f.controller.apply(r.reviewHandles[0])).ok,false);assert.deepEqual(f.original,before);});
test('concurrent accepts serialize and cancellation during save rolls back',async()=>{const f=fixture(),r=await f.generate(),before=structuredClone(f.original);let started,release;const ready=new Promise(resolve=>started=resolve);f.c.saveChat=async()=>{started();await new Promise(resolve=>release=resolve);};const pending=f.controller.apply(r.reviewHandles[0]);await ready;assert.equal((await f.controller.apply(r.reviewHandles[0])).error.code,'BUSY');f.controller.cancel('chat changed');release();assert.equal((await pending).ok,false);assert.deepEqual(f.original,before);});
for(const remove of [f=>delete f.c.saveChat,f=>delete f.c.updateMessageBlock,f=>delete f.c.swipe.refresh])test('missing host Apply capability preserves the original',async()=>{const f=fixture(),r=await f.generate(),before=structuredClone(f.original);remove(f);assert.equal((await f.controller.apply(r.reviewHandles[0])).error.code,'APPLY_UNAVAILABLE');assert.deepEqual(f.original,before);});
test('canvas presentation retains review authority while semantic controls invalidate it',async()=>{const graph=reviewGraph(),f=fixture(undefined,graph),r=await f.generate(graph);graph.view={x:800,y:-300,zoom:0.4};graph.name='Renamed';graph.updatedAt=99;Object.assign(graph.nodes.repair,{x:400,y:-999,w:600,title:'New label',collapsed:true});graph.groups['ai-de-slop'].collapsed=false;assert.equal(f.controller.candidateStatus(r.reviewHandles[0]).ok,true);graph.nodes.repair.instructions='Different instruction';assert.equal(f.controller.candidateStatus(r.reviewHandles[0]).ok,false);});
for(const [name,change] of [['tokens',g=>g.nodes.repair.maxTokens=999],['role',g=>g.roles.Prose.model='different'],['wire',g=>g.wires.draft.fromPort='missing'],['invalid default',g=>g.nodes.repair.instructions=null]])test('review rejects semantic '+name+' changes',async()=>{const graph=reviewGraph(),f=fixture(undefined,graph),r=await f.generate(graph);change(graph);assert.equal(f.controller.candidateStatus(r.reviewHandles[0]).ok,false);});
test('delayed model output survives cosmetic pan and layout changes',async()=>{const graph=reviewGraph();let started,release;const ready=new Promise(resolve=>started=resolve),f=fixture(async()=>{started();return new Promise(resolve=>release=resolve);},graph);const pending=f.generate(graph);await ready;graph.view.zoom=2;graph.nodes.repair.y+=800;graph.groups['ai-de-slop'].h=300;release({ok:true,data:{text:'We explore.',finish:'stop'}});assert.equal((await pending).ok,true);});
test('snapshot context remains bounded and never activates native lore',()=>{const f=fixture();let lore=0;f.c.getWorldInfoPrompt=()=>{lore++;};const context=snapshotContext(f.c,{chat:[{is_user:true,mes:'supplied only'}]});assert.equal(context.messages.at(-1).text,'supplied only');assert.equal(lore,0);assert.ok(Object.isFrozen(context));f.c.characterId=0;f.c.characters=[{description:'d'.repeat(20000)}];const s=snapshotContext(f.c,{chat:[{mes:'old'.repeat(34000),is_user:false},{mes:'recent',is_user:false},{mes:'current 😀',is_user:true}]});assert.equal(s.messages.at(-1).text,'current 😀');assert.equal(s.messages.at(-2).text,'recent');assert.ok(s.report.omissions.some(item=>item.id==='chat:0'));assert.ok(s.report.omissions.some(item=>item.id==='character:description'));assert.equal(snapshotContext(f.c,{chat:[{is_user:true,mes:'x'.repeat(100001)}]}).error.code,'INPUT_LIMIT');});
for(const patch of [{role:'tool'},{role:'system'},{extra:{type:'narrator'}},{mes:'...'}])test('unsupported reply material cannot become a Draft',()=>{const f=fixture();Object.assign(f.original,patch);assert.equal(snapshotReply(f.c).ok,false);});
// A failed stream belongs to one generation of one swipe, not every future revision of its message.
function selectStoredSwipe(f,id) {
 const m=f.original,info=m.swipe_info[id];m.swipe_id=id;m.mes=m.swipes[id];
 for(const key of ['send_date','gen_started','gen_finished'])m[key]=info[key];
 m.extra=structuredClone(info.extra);
}
async function stoppedSwipeFixture({earlierSwipes=1,started=3}={}) {
 const f=fixture();
 while(f.original.swipes.length<earlierSwipes) {
  f.original.swipes.push('Another completed reply');
  f.original.swipe_info.push({send_date:1,gen_started:1,gen_finished:2,extra:{}});
 }
 await f.c.eventSource.emit('GENERATION_STARTED','swipe',{},false);
 f.original.swipes.push('We delve into an unfinished');
 f.original.swipe_info.push({send_date:3,gen_started:started,gen_finished:started===null?null:4,extra:{}});selectStoredSwipe(f,earlierSwipes);
 const abortController=new AbortController();abortController.abort();
 f.c.streamingProcessor={messageId:1,timeStarted:started===null?undefined:new Date(started),isFinished:true,isStopped:false,abortController};
 await f.c.eventSource.emit('GENERATION_STOPPED');await f.c.eventSource.emit('GENERATION_ENDED',2);
 return f;
}
{
 const f=await stoppedSwipeFixture(),scan=structuredClone(post);scan.nodes.repair.mode='scan';
 assert.equal((await readSelected(f)).ok,false,'the selected stopped fragment must stay ineligible');
 selectStoredSwipe(f,0);await f.c.eventSource.emit('MESSAGE_SWIPED',1);
 assert.equal((await readSelected(f)).ok,true,'a prior completed swipe remains reviewable with the stale stopped processor present');
 selectStoredSwipe(f,1);await f.c.eventSource.emit('MESSAGE_SWIPED',1);
 f.c.streamingProcessor=null;
 assert.equal((await readSelected(f)).ok,false,'returning to the stopped fragment must still fail after processor cleanup');
}
for(const type of ['swipe','continue']) {
 const f=await stoppedSwipeFixture(),scan=structuredClone(post);scan.nodes.repair.mode='scan';
 await f.c.eventSource.emit('GENERATION_STARTED',type,{},false);
 const id=type==='swipe'?2:1;
 // Even the same visible text is a different completed result when the new generation finishes.
 f.original.swipes[id]='We delve into an unfinished';
 f.original.swipe_info[id]={send_date:5,gen_started:5,gen_finished:6,extra:{}};selectStoredSwipe(f,id);
 f.c.streamingProcessor={messageId:1,timeStarted:new Date(5),isFinished:true,isStopped:false,abortController:new AbortController()};
 await f.c.eventSource.emit('GENERATION_ENDED',2);f.c.streamingProcessor=null;
 assert.equal((await readSelected(f)).ok,true,`a successful later ${type} must be reviewable on the same message object`);
 if(type==='swipe') {
  selectStoredSwipe(f,1);await f.c.eventSource.emit('MESSAGE_SWIPED',1);
  assert.equal((await readSelected(f)).ok,false,'a later success must not erase failure evidence for the older swipe');
 }
}
{
 const f=await stoppedSwipeFixture(),scan=structuredClone(post);scan.nodes.repair.mode='scan';
 // A final pending progress callback can change the text/timestamp after Stop without completing the stream.
 f.original.mes='We delve into an unfinished fragment';f.original.gen_finished=5;
 f.original.swipes[1]=f.original.mes;f.original.swipe_info[1].gen_finished=5;f.c.streamingProcessor=null;
 assert.equal((await readSelected(f)).ok,false,'late progress from the failed generation is not successful completion');
}

// Native deleteSwipe splices both arrays, updates the selected index, then emits before selecting a replacement.
async function deleteStoredSwipe(f,id) {
 const m=f.original,current=m.swipe_id;
 m.swipes.splice(id,1);m.swipe_info.splice(id,1);
 const next=id<current?current-1:id>current?current:Math.min(id,m.swipes.length-1);
 m.swipe_id=next;
 await f.c.eventSource.emit('MESSAGE_SWIPE_DELETED',{messageId:1,swipeId:id,newSwipeId:next});
 if(id===current) {selectStoredSwipe(f,next);await f.c.eventSource.emit('MESSAGE_SWIPED',1);}
}
async function completeAnotherSwipe(f,started=5) {
 await f.c.eventSource.emit('GENERATION_STARTED','swipe',{},false);
 const id=f.original.swipes.length;
 f.original.swipes.push('We delve into an unfinished');
 f.original.swipe_info.push({send_date:5,gen_started:started,gen_finished:started===null?null:6,extra:{}});selectStoredSwipe(f,id);
 f.c.streamingProcessor={messageId:1,timeStarted:started===null?undefined:new Date(started),isFinished:true,isStopped:false,abortController:new AbortController()};
 await f.c.eventSource.emit('GENERATION_ENDED',2);f.c.streamingProcessor=null;
}
for(const [earlierSwipes,started] of [[1,3],[3,3],[3,null]]) {
 await test(`Stopped swipe stays rejected after deleting ${earlierSwipes} earlier swipes (generation ${started??'unknown'})`,async()=>{
  const f=await stoppedSwipeFixture({earlierSwipes,started}),scan=structuredClone(post);scan.nodes.repair.mode='scan';
  await completeAnotherSwipe(f);
  for(let remaining=earlierSwipes;remaining>0;remaining--) {
   await deleteStoredSwipe(f,0);
   assert.equal((await readSelected(f)).ok,true,'the selected successful reply remains reviewable after reindexing');
   selectStoredSwipe(f,remaining-1);await f.c.eventSource.emit('MESSAGE_SWIPED',1);
   const rejected=await readSelected(f);
   assert.equal(rejected.ok,false,'the surviving stopped fragment remains ineligible at its new index');
   assert.equal(rejected.error.code,'REPLY_UNAVAILABLE');
   selectStoredSwipe(f,remaining);await f.c.eventSource.emit('MESSAGE_SWIPED',1);
  }
 });
}
for(const started of [3,null]) {
 await test(`Deleting the failed swipe does not poison the completed replacement (generation ${started??'unknown'})`,async()=>{
  const f=await stoppedSwipeFixture({started}),scan=structuredClone(post);scan.nodes.repair.mode='scan';
  await completeAnotherSwipe(f,started===null?null:5);
  selectStoredSwipe(f,1);await f.c.eventSource.emit('MESSAGE_SWIPED',1);
  await deleteStoredSwipe(f,1);
  assert.equal((await readSelected(f)).ok,true,'a completed reply can occupy the deleted failed index, even with identical text and unknown timestamps');
  selectStoredSwipe(f,0);await f.c.eventSource.emit('MESSAGE_SWIPED',1);
  assert.equal((await readSelected(f)).ok,true,'the earlier completed alternative remains reviewable');
 });
}
// Awaited host callbacks must not corrupt the issued revision or the original it preserves.
const applyCorruptions=[
 ['stored candidate text',m=>{m.swipes[m.swipe_id]='different stored text';}],
 ['new swipe metadata',m=>{delete m.swipe_info[m.swipe_id];}],
 ['revision provenance',m=>{delete m.swipe_info[m.swipe_id].extra.latticeRevision;}],
 ['selected revision metadata',m=>{delete m.extra.latticeRevision;}],
 ['revision completion metadata',m=>{m.swipe_info[m.swipe_id].gen_finished='changed';}],
 ['original swipe text',m=>{m.swipes[0]='rewritten original';}],
 ['original swipe metadata',m=>{m.swipe_info[0].extra.old='lost';}],
 ['swipe alignment',m=>{m.swipe_info.push({extra:{}});}],
];
for(const stage of ['MESSAGE_SWIPED','MESSAGE_UPDATED','render','refresh','save'])for(const [name,corrupt] of applyCorruptions) {
 await test(`Apply rolls back ${name} changed during ${stage}`,async()=>{
  const f=fixture(),r=await f.generate(post),before=structuredClone(f.original);
  const mutate=()=>{if(f.original.swipe_id===1)corrupt(f.original);};
  if(stage==='render')f.c.updateMessageBlock=mutate;
  else if(stage==='refresh')f.c.swipe.refresh=mutate;
  else if(stage==='save')f.c.saveChat=async()=>{f.c.saved=(f.c.saved??0)+1;mutate();};
  else f.c.eventSource.on(stage,mutate);
  const applied=await f.controller.apply(r.reviewHandles[0]);
  assert.equal(applied.ok,false,`${stage} changed ${name}`);
  assert.equal(applied.error.code,'APPLY_FAILED');assert.equal(applied.appliedLocally,false);
  assert.deepEqual(f.original,before,'rollback restores the entire original local message');
  assert.equal(f.c.saved,stage==='save'?1:undefined);
  assert.equal(applied.persistence,stage==='save'?'unverified':'not-attempted');
 });
}

await test('Apply preserves host synchronization of original metadata and harmless revision enrichment',async()=>{
 const f=fixture();f.original.swipe_info[0].extra={stale:'replace from current message'};
 f.original.extra.current='preserve';f.original.swipe_info[0].gen_finished=-1;
 const r=await f.generate(post),sourceFinish=f.original.gen_finished;
 f.c.eventSource.on('MESSAGE_UPDATED',()=>{
  f.original.extra.extensionDisplay='harmless';
  Object.assign(f.original.swipe_info[f.original.swipe_id],{extra:structuredClone(f.original.extra)});
 });
 const applied=await f.controller.apply(r.reviewHandles[0]);
 assert.equal(applied.ok,true);
 assert.deepEqual(f.original.swipe_info[0].extra,{old:'keep',current:'preserve'});
 assert.equal(f.original.swipe_info[0].gen_finished,sourceFinish);
 assert.equal(f.original.swipe_info[applied.swipeId].extra.extensionDisplay,'harmless');
 assert.equal(f.original.swipe_info[applied.swipeId].extra.latticeRevision.sourceSwipeId,0);
});

await test('Apply rollback after a chat switch does not render into the replacement chat',async()=>{
 const f=fixture(),r=await f.generate(post),before=structuredClone(f.original);
 let rendered=0,refreshed=0;
 f.c.updateMessageBlock=()=>{rendered++;};f.c.swipe.refresh=()=>{refreshed++;};
 const replacement=[{is_user:true,mes:'another chat'}];
 f.c.eventSource.on('MESSAGE_UPDATED',()=>{
  f.original.swipes[f.original.swipe_id]='listener corruption';
  f.c.chat=replacement;f.c.chatId='two';
 });
 assert.equal((await f.controller.apply(r.reviewHandles[0])).ok,false);
 assert.deepEqual(f.original,before);assert.equal(f.c.chat,replacement);
 assert.equal(rendered,0);assert.equal(refreshed,0);assert.equal(f.c.saved,undefined);
});
