import assert from 'node:assert/strict';
import test from 'node:test';
import { createNativeWorkflowController, snapshotContext, snapshotReply } from '../src/workflow/host.js';
import { starterGraph } from '../src/workflow/starters.js';
const pre = starterGraph('native-guidance'), post=starterGraph('reviewed-de-slop');

for (const schema of [3, 99]) for (const entry of ['runPre', 'beforeGenerate', 'runPost']) {
 test(`${entry} rejects ${schema===3?'malformed schema3 wires':'schema '+schema} before any host source or snapshot reads`, async () => {
  const graph = { ...structuredClone(entry === 'runPost' ? post : pre), schema, runtime: 2 }; delete graph.wires['wire-1'].fromPort;
  let requests=0;
  const f=fixture(async()=>{requests++;return {ok:true,data:{text:'Unexpected request',finish:'stop'}};},graph);
  const chat=f.c.chat;
  const reads={chat:0,message:0,character:0,identity:0};
  Object.defineProperty(f.c,'chat',{get(){reads.chat++;return chat;}});
  Object.defineProperty(f.original,'mes',{get(){reads.message++;return 'We delve.';}});
  f.c.characters=[null,{get description(){reads.character++;return 'Character source';}}];
  Object.defineProperty(f.c,'characterId',{get(){reads.identity++;return 1;}});
  f.c.extensionPrompts['lattice:guidance:old']={value:'stale guidance'};
  f.c.extensionPrompts['comfytavern:guidance:old']={value:'stale historic guidance'};
  const result=entry==='beforeGenerate'
   ? await f.controller.beforeGenerate(chat,8192,()=>{},'normal')
   : await f.controller[entry](graph);
  assert.equal(result.error.code,schema===3?'INVALID_WIRE':'UNSUPPORTED_VERSION');
  assert.equal(result.fallback,entry==='beforeGenerate'?'native':undefined);
  assert.deepEqual(reads,{chat:0,message:0,character:0,identity:0});
  assert.equal(requests,0);
  assert.equal(f.c.extensionPrompts['lattice:guidance:old'].value,'');
  assert.equal(f.c.extensionPrompts['comfytavern:guidance:old'].value,'stale historic guidance');
  assert.equal(f.c.extensionPrompts.other.value,'keep');
 });
}
test('cancellation clears only Lattice guidance and preserves other extensions', () => {
 const f=fixture();
 f.c.extensionPrompts['comfytavern:guidance:old']={value:'obsolete guidance'};
 f.c.extensionPrompts['lattice:guidance:new']={value:'current guidance'};
 f.controller.cancel('upgrade');
 assert.equal(f.c.extensionPrompts['comfytavern:guidance:old'].value,'obsolete guidance');
 assert.equal(f.c.extensionPrompts['lattice:guidance:new'].value,'');
 assert.equal(f.c.extensionPrompts.other.value,'keep');
});
test('automatic Send retains request evidence with original graph identity separately from manual results', async () => {
 const graph=starterGraph('native-guidance');
 const f=fixture(async()=>({ok:true,data:{text:'Actual Send',usage:{completion_tokens:17},finish:'stop'}}),graph);
 const sent=await f.controller.beforeGenerate(f.c.chat,8192,()=>{},'normal');
 assert.equal(typeof f.controller.lastAutomaticResult,'function');
 const record=f.controller.lastAutomaticResult();
 assert.equal(record.result,sent);
 assert.equal(record.origin.graph,graph);
 assert.equal(record.origin.graphId,graph.id);
 assert.equal(record.origin.phase,'pre');
 assert.equal(record.origin.kind,'send');
 assert.equal(typeof record.origin.signature,'string');
 assert.equal(typeof record.origin.runId,'string');
 assert.equal(record.result.actualCalls,1);
 assert.equal(record.result.callBound,2);
 assert.equal(record.result.recording.units.find(unit=>unit.request).request.usage.completion_tokens,17);
 assert.equal(Object.isFrozen(graph),false,'publishing origin must not freeze the editable original graph');
 await f.controller.runPre(graph);
 assert.equal(f.controller.lastAutomaticResult().origin,record.origin,'manual run preserves automatic Send provenance'); assert.equal(f.controller.lastAutomaticResult().superseded,true); assert.equal(f.controller.lastAutomaticResult().result.recording,undefined,'superseded run does not duplicate diagnostic payloads');
 f.c.setExtensionPrompt=()=>{throw new Error('Setter rejected');};
 const failed=await f.controller.beforeGenerate(f.c.chat,8192,()=>{},'normal');
 assert.equal(failed.error.code,'GUIDANCE_UNAVAILABLE');
 assert.equal(failed.actualCalls,1,'a publication failure still exposes the incurred request');
 assert.equal(failed.recording.units.find(unit=>unit.request).request.usage.completion_tokens,17);
 assert.notEqual(f.controller.lastAutomaticResult().origin.runId,record.origin.runId);
});
function fixture(request,assignedGraph=pre) {
 const listeners={}; const original={mes:'We delve.',is_user:false,swipe_id:0,swipes:['We delve.'],swipe_info:[{extra:{old:'keep'},send_date:1,gen_started:1,gen_finished:2}],extra:{old:'keep'},send_date:1,gen_started:1,gen_finished:2};
 const c={chatId:'one',characterId:1,groupId:null,chat:[{mes:'Hello',is_user:true},original],extensionPrompts:{other:{value:'keep'}},eventTypes:Object.fromEntries(['GENERATION_STARTED','GENERATION_STOPPED','GENERATION_ENDED','CHAT_CHANGED','MESSAGE_EDITED','MESSAGE_UPDATED','MESSAGE_DELETED','MESSAGE_SWIPED','MESSAGE_SWIPE_DELETED','MESSAGE_SENT'].map(k=>[k,k])),eventSource:{on:(name,fn)=>{(listeners[name]??=[]).push(fn);},removeListener:()=>{},emit:async(name,...args)=>{for(const fn of listeners[name]??[])await fn(...args);}},setExtensionPrompt:(key,value,position,depth,scan,role)=>{c.extensionPrompts[key]={value,position,depth,scan,role};},saveChat:async()=>{c.saved=(c.saved??0)+1;},updateMessageBlock:()=>{},swipe:{refresh:()=>{}}};
 let busy=false;
 const controller=createNativeWorkflowController({context:()=>c,isBusy:()=>busy,getGraph:()=>assignedGraph,isEnabled:()=>true,countTokens:async text=>({tokens:Math.ceil(text.length/4),method:'fixture'}),resolveBinding:()=>({ok:true,data:{profileId:'fake',model:'fake'}}),request:request??(async()=>({ok:true,data:{text:'{"patches":[{"index":0,"replacement":"explore"}]}',finish:'stop'}})),syncMesToSwipe:index=>{const m=c.chat[index]; m.swipes[m.swipe_id]=m.mes;Object.assign(m.swipe_info[m.swipe_id],{send_date:m.send_date,gen_started:m.gen_started,gen_finished:m.gen_finished,extra:structuredClone(m.extra)});return true;},syncSwipeToMes:(index,id)=>{const m=c.chat[index];m.swipe_id=id;m.mes=m.swipes[id];Object.assign(m,structuredClone(m.swipe_info[id]));return true;}});
 controller.subscribe();
 return {c,controller,original,setGraph:value=>{assignedGraph=value;},setBusy:value=>{busy=value;},owned:()=>Object.entries(c.extensionPrompts).filter(([key])=>key.startsWith('lattice:guidance:')).map(([,v])=>v.value).join('')};
}
{
 let release, started; const waiting=new Promise(r=>started=r);
 const f=fixture(async()=>{started(); return await new Promise(r=>release=r);});
 let aborted=0; const pending=f.controller.beforeGenerate(f.c.chat,8192,value=>{assert.equal(value,true);aborted++;},'normal');
 await waiting; f.controller.cancel('chat changed'); release({ok:true,data:{text:'late',finish:'stop'}}); await pending;
 assert.equal(f.owned(),''); assert.equal(f.c.extensionPrompts.other.value,'keep');assert.equal(aborted,1);
 assert.equal(f.controller.lastAutomaticResult(),null,'a canceled interceptor never retains its late result for UI reopening');
}
{
 let requests=0; const f=fixture(async()=>{requests++;return {ok:true,data:{text:'Plan',finish:'stop'}};});
 const before=structuredClone(f.c.chat);
 assert.equal((await f.controller.runPre(pre)).ok,true); assert.equal(f.owned(),'');
 await f.controller.beforeGenerate(f.c.chat,8192,()=>{},'swipe'); assert.equal(requests,2);assert.equal(f.owned(),'Plan');assert.deepEqual(f.c.chat,before);
 await f.controller.beforeGenerate(f.c.chat,8192,()=>{},'quiet');assert.equal(requests,2);assert.equal(f.owned(),'');
}
{
 const f=fixture(); const result=await f.controller.runPost(post); assert.equal(result.ok,true); assert.equal(f.original.mes,'We delve.');
 const candidate=structuredClone(result.reviewHandles[0]); const applied=await f.controller.apply(candidate);
 assert.equal(applied.ok,true); assert.equal(applied.appliedLocally,true); assert.equal(applied.persistence,'unverified'); assert.equal(f.original.mes,'We explore.');
 assert.equal(f.original.swipes[0],'We delve.'); assert.equal(f.original.swipe_info[0].extra.old,'keep');assert.equal(f.original.extra.old,undefined);assert.ok(f.original.extra.latticeRevision);
 await f.controller.apply(candidate); assert.equal(f.original.swipes.length,2);assert.equal(f.c.saved,1);
}
for(const mutate of [f=>f.original.mes+=' external',f=>f.c.chat.push({is_user:true,mes:'new'}),f=>f.c.chat.reverse(),f=>f.c.chat.pop(),f=>f.c.chatId='two',f=>f.original.swipe_id=1,f=>f.setBusy(true),f=>f.controller.cancel('graph changed')]) {
 const f=fixture();const r=await f.controller.runPost(post);mutate(f); const before=JSON.stringify(f.c.chat);assert.equal((await f.controller.apply(structuredClone(r.reviewHandles[0]))).ok,false);assert.equal(JSON.stringify(f.c.chat),before);
}
{
 const f=fixture();const r=await f.controller.runPost(post); const before=structuredClone(f.original);f.c.saveChat=async()=>{throw new Error('save failed');};assert.equal((await f.controller.apply(r.reviewHandles[0])).ok,false);assert.deepEqual(f.original,before);
}
{
 const f=fixture(); let lore=0; f.c.getWorldInfoPrompt=()=>{lore++;}; f.c.characters=[{description:'Visible character'}];
 const s=snapshotContext(f.c,{phase:'pre',chat:[{is_user:true,mes:'supplied only'}]});assert.equal(s.messages.at(-1).text,'supplied only');assert.equal(lore,0);assert.ok(Object.isFrozen(s));
 f.original.is_system=true;assert.equal(snapshotReply(f.c).ok,false);
}
console.log('workflow host tests passed');
// Read-only review availability shares the application source guard.
{
 const f=fixture();const r=await f.controller.runPost(post);
 assert.equal(f.controller.candidateStatus(structuredClone(r.reviewHandles[0])).ok,true);
 f.original.mes+=' changed';assert.equal(f.controller.candidateStatus(r.reviewHandles[0]).ok,false);
}
// Failure is an explicit native fallback; canceled/aborted sends are not.
{
 const f=fixture(async()=>({ok:false,error:{code:'REQUEST_FAILED',message:'Unavailable'}}));let aborted=0;
 const r=await f.controller.beforeGenerate(f.c.chat,8192,()=>{aborted++;},'normal');
 assert.equal(r.fallback,'native');assert.equal(aborted,0);assert.equal(f.owned(),'');
}
// Dry runs, impersonation and stopped streaming fragments cannot invoke repair.
{
 let requests=0;const f=fixture(async()=>{requests++;return {ok:true,data:{text:'Plan',finish:'stop'}};});
 await f.c.eventSource.emit('GENERATION_STARTED','normal',{},true);
 await f.controller.beforeGenerate(f.c.chat,8192,()=>{},'normal');
 await f.controller.beforeGenerate(f.c.chat,8192,()=>{},'impersonate');assert.equal(requests,0);
 f.original.mes='partial streaming reply';await f.c.eventSource.emit('GENERATION_STOPPED');assert.equal((await f.controller.runPost(post)).ok,false);assert.equal(requests,0);
}
// Host streaming timestamps are updated during progress, so timestamps alone are insufficient.
{
 const f=fixture(); f.c.streamingProcessor={messageId:1,isFinished:false,isStopped:false,abortController:new AbortController()};
 assert.equal(snapshotReply(f.c).ok,false);
 f.c.streamingProcessor.isFinished=true;f.c.streamingProcessor.abortController.abort();assert.equal(snapshotReply(f.c).ok,false);
 await f.c.eventSource.emit('GENERATION_ENDED',2);f.c.streamingProcessor=null;
 assert.equal((await f.controller.runPost(post)).ok,false);
}
// Bounded snapshots reserve current/recent turns verbatim and report every omission.
{
 const f=fixture(); f.c.characterId=0;f.c.characters=[{description:'d'.repeat(20000)}];
 const latest='current 😀';const chat=[{mes:'old'.repeat(34000),is_user:false},{mes:'recent',is_user:false},{mes:latest,is_user:true}];
 const s=snapshotContext(f.c,{chat});assert.equal(s.messages.at(-1).text,latest);assert.equal(s.messages.at(-2).text,'recent');
 assert.ok(s.report.omissions.some(o=>o.id==='chat:0'));assert.ok(s.report.omissions.some(o=>o.id==='character:description'));
 assert.equal(snapshotContext(f.c,{chat:[{is_user:true,mes:'x'.repeat(100001)}]}).error.code,'INPUT_LIMIT');
}
// Changing only the stored selected swipe is still a stale source.
{
 const f=fixture();const r=await f.controller.runPost(post);f.original.swipes[0]='externally rewritten';
 assert.equal(f.controller.candidateStatus(r.reviewHandles[0]).ok,false);
}
// An already aborted native signal blocks the owning send before any auxiliary request.
{
 let requests=0;const f=fixture(async()=>{requests++;return {ok:true,data:{text:'Plan',finish:'stop'}};});
 const signal=new AbortController();signal.abort();let aborted=0;
 await f.c.eventSource.emit('GENERATION_STARTED','normal',{signal:signal.signal},false);
 const r=await f.controller.beforeGenerate(f.c.chat,8192,()=>{aborted++;},'normal');assert.equal(r.ok,false);assert.equal(requests,0);assert.equal(aborted,1);
}
// Known tool continuation must not pay a second prepass.
{
 let requests=0;const f=fixture(async()=>{requests++;return {ok:true,data:{text:'Plan',finish:'stop'}};});
 f.c.chat.push({mes:'Tool result',is_system:true,extra:{tool_invocations:[{}]}});
 const r=await f.controller.beforeGenerate(f.c.chat,8192,()=>{},'normal');assert.equal(r.skipped,true);assert.equal(requests,0);assert.equal(f.owned(),'');
}
// An adapter ABORTED result cancels the native send, without claiming native fallback.
{
 const f=fixture(async()=>({ok:false,error:{code:'ABORTED',message:'Stopped'}}));let aborted=0;
 const r=await f.controller.beforeGenerate(f.c.chat,8192,()=>{aborted++;},'normal');
 assert.equal(aborted,1);assert.equal(r.fallback,undefined);assert.equal(f.owned(),'');
}
// Role-tagged tool/system material and placeholder fragments are not completed assistant text.
for(const patch of [{role:'tool'},{role:'system'},{extra:{type:'narrator'}},{mes:'...'}]) {
 const f=fixture();Object.assign(f.original,patch);assert.equal(snapshotReply(f.c).ok,false);
}
// A supported event listener may reject or alter a commit; restore the original on detection.
{
 const f=fixture();const r=await f.controller.runPost(post);const before=structuredClone(f.original);
 f.c.eventSource.on('MESSAGE_UPDATED',()=>{f.original.mes='listener edit';});
 assert.equal((await f.controller.apply(r.reviewHandles[0])).ok,false);assert.deepEqual(f.original,before);assert.equal(f.c.saved,undefined);
}
for(const remove of [f=>delete f.c.saveChat,f=>delete f.c.updateMessageBlock,f=>delete f.c.swipe.refresh]) {
 const f=fixture();const r=await f.controller.runPost(post);remove(f);const before=structuredClone(f.original);assert.equal((await f.controller.apply(r.reviewHandles[0])).error.code,'APPLY_UNAVAILABLE');assert.deepEqual(f.original,before);
}
// Concurrent accepts are serialized, and external cancellation during a save rolls back locally.
{
 const f=fixture();const r=await f.controller.runPost(post);let release,started;const ready=new Promise(r=>started=r);const before=structuredClone(f.original);
 f.c.saveChat=async()=>{started();await new Promise(r=>release=r);};const pending=f.controller.apply(r.reviewHandles[0]);await ready;
 assert.equal((await f.controller.apply(r.reviewHandles[0])).error.code,'BUSY');f.controller.cancel('chat changed');release();assert.equal((await pending).ok,false);assert.deepEqual(f.original,before);
}
// Selecting/assigning a native workflow never arms the production interceptor.
{
 const {installMock}=await import('./mock.js');const c=installMock({settings:{enabled:false,graphs:{[pre.id]:pre},nativeBindings:{preGraphId:pre.id}}});let requests=0;
 c.ConnectionManagerRequestService={getProfile:()=>{requests++;throw new Error('Disarmed workflow must not resolve requests');}};
 const {getNativeWorkflowController}=await import('../src/run.js');const controller=getNativeWorkflowController();
 const r=await controller.beforeGenerate(c.chat,8192,()=>{},'normal');assert.equal(r.skipped,true);assert.equal(requests,0);
}
// Stopping auxiliary preparation must not permanently mark the old completed reply as partial.
{
 let release,started;const ready=new Promise(r=>started=r);const f=fixture(async()=>{started();return await new Promise(r=>release=r);});
 const pending=f.controller.beforeGenerate(f.c.chat,8192,()=>{},'normal');await ready;
 await f.c.eventSource.emit('GENERATION_STOPPED');release({ok:true,data:{text:'late',finish:'stop'}});await pending;
 assert.equal(snapshotReply(f.c).kind,'draft');
 const scan=structuredClone(post);scan.nodes.repair.mode='scan';assert.equal((await f.controller.runPost(scan)).ok,true);
}

// Only explicit source fields are snapshotted; unrelated extension metadata need not be cloneable.
{
 const f=fixture(async()=>({ok:true,data:{text:'Plan',finish:'stop'}}));f.c.chat[0].extra={extensionCallback:()=>{}};
 assert.equal((await f.controller.runPre(pre)).ok,true);
 assert.equal((await f.controller.beforeGenerate(f.c.chat,8192,()=>{},'normal')).ok,true);
}
// Canvas presentation is not executable state: reviewed candidates survive it.
{
 const f=fixture(), graph=structuredClone(post), r=await f.controller.runPost(graph);
 graph.view={x:800,y:-300,zoom:0.4};graph.name='Renamed';graph.updatedAt=99;
 graph.nodes.repair.x+=400;graph.nodes.repair.y=-999;graph.nodes.repair.w=600;graph.nodes.repair.title='New label';graph.nodes.repair.collapsed=true;
 graph.groups['ai-de-slop'].collapsed=false;graph.groups['ai-de-slop'].x=333;
 assert.equal(f.controller.candidateStatus(r.reviewHandles[0]).ok,true);
 graph.nodes.repair.instructions='A different instruction';assert.equal(f.controller.candidateStatus(r.reviewHandles[0]).ok,false);
}
// A delayed provider response remains current after pan/zoom/layout changes.
{
 const graph=structuredClone(post);let release,started;const ready=new Promise(r=>started=r);
 const f=fixture(async()=>{started();return await new Promise(r=>release=r);});const pending=f.controller.runPost(graph);await ready;
 graph.view.zoom=2;graph.nodes.repair.y+=800;graph.groups['ai-de-slop'].h=300;
 release({ok:true,data:{text:'{"patches":[{"index":0,"replacement":"explore"}]}',finish:'stop'}});
 assert.equal((await pending).ok,true);
}
for(const change of [g=>g.nodes.repair.maxTokens++,g=>g.roles.Prose.model='different',g=>g.wires['wire-1'].fromPort='missing']) {
 const f=fixture(),g=structuredClone(post),r=await f.controller.runPost(g);change(g);assert.equal(f.controller.candidateStatus(r.reviewHandles[0]).ok,false);
}
// Invalid explicit settings cannot masquerade as omitted defaults in the semantic identity.
{
 const f=fixture(),graph=structuredClone(post),r=await f.controller.runPost(graph);
 graph.nodes.repair.instructions=null;assert.equal(f.controller.candidateStatus(r.reviewHandles[0]).ok,false);
}

// The native interceptor also keeps cosmetic edits, but rejects an equivalent replacement graph object.
for(const replace of [false,true]) {
 const graph=structuredClone(pre);let release,started;const ready=new Promise(r=>started=r);
 const f=fixture(async()=>{started();return await new Promise(r=>release=r);},graph);let aborted=0;
 const pending=f.controller.beforeGenerate(f.c.chat,8192,()=>{aborted++;},'normal');await ready;
 if(replace)f.setGraph(structuredClone(graph));else{graph.view.x+=400;graph.nodes['response-plan'].x+=800;}
 release({ok:true,data:{text:'Plan remains current',finish:'stop'}});const r=await pending;
 assert.equal(r.ok,!replace);assert.equal(f.owned(),replace?'':'Plan remains current');assert.equal(aborted,replace?1:0);
}

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
 assert.equal((await f.controller.runPost(scan)).ok,false,'the selected stopped fragment must stay ineligible');
 selectStoredSwipe(f,0);await f.c.eventSource.emit('MESSAGE_SWIPED',1);
 assert.equal((await f.controller.runPost(scan)).ok,true,'a prior completed swipe remains reviewable with the stale stopped processor present');
 selectStoredSwipe(f,1);await f.c.eventSource.emit('MESSAGE_SWIPED',1);
 f.c.streamingProcessor=null;
 assert.equal((await f.controller.runPost(scan)).ok,false,'returning to the stopped fragment must still fail after processor cleanup');
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
 assert.equal((await f.controller.runPost(scan)).ok,true,`a successful later ${type} must be reviewable on the same message object`);
 if(type==='swipe') {
  selectStoredSwipe(f,1);await f.c.eventSource.emit('MESSAGE_SWIPED',1);
  assert.equal((await f.controller.runPost(scan)).ok,false,'a later success must not erase failure evidence for the older swipe');
 }
}
{
 const f=await stoppedSwipeFixture(),scan=structuredClone(post);scan.nodes.repair.mode='scan';
 // A final pending progress callback can change the text/timestamp after Stop without completing the stream.
 f.original.mes='We delve into an unfinished fragment';f.original.gen_finished=5;
 f.original.swipes[1]=f.original.mes;f.original.swipe_info[1].gen_finished=5;f.c.streamingProcessor=null;
 assert.equal((await f.controller.runPost(scan)).ok,false,'late progress from the failed generation is not successful completion');
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
   assert.equal((await f.controller.runPost(scan)).ok,true,'the selected successful reply remains reviewable after reindexing');
   selectStoredSwipe(f,remaining-1);await f.c.eventSource.emit('MESSAGE_SWIPED',1);
   const rejected=await f.controller.runPost(scan);
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
  assert.equal((await f.controller.runPost(scan)).ok,true,'a completed reply can occupy the deleted failed index, even with identical text and unknown timestamps');
  selectStoredSwipe(f,0);await f.c.eventSource.emit('MESSAGE_SWIPED',1);
  assert.equal((await f.controller.runPost(scan)).ok,true,'the earlier completed alternative remains reviewable');
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
  const f=fixture(),r=await f.controller.runPost(post),before=structuredClone(f.original);
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
 const r=await f.controller.runPost(post);
 f.c.eventSource.on('MESSAGE_UPDATED',()=>{
  f.original.extra.extensionDisplay='harmless';
  Object.assign(f.original.swipe_info[f.original.swipe_id],{extra:structuredClone(f.original.extra)});
 });
 const applied=await f.controller.apply(r.reviewHandles[0]);
 assert.equal(applied.ok,true);
 assert.deepEqual(f.original.swipe_info[0].extra,{old:'keep',current:'preserve'});
 assert.equal(f.original.swipe_info[0].gen_finished,2);
 assert.equal(f.original.swipe_info[applied.swipeId].extra.extensionDisplay,'harmless');
 assert.equal(f.original.swipe_info[applied.swipeId].extra.latticeRevision.sourceSwipeId,0);
});

await test('Apply rollback after a chat switch does not render into the replacement chat',async()=>{
 const f=fixture(),r=await f.controller.runPost(post),before=structuredClone(f.original);
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
