import assert from 'node:assert/strict';
import { createNativeWorkflowController, snapshotContext, snapshotReply } from '../src/workflow/host.js';
import { starterGraph } from '../src/workflow/starters.js';
const pre = starterGraph('native-guidance'), post=starterGraph('reviewed-de-slop');
function fixture(request,assignedGraph=pre) {
 const listeners={}; const original={mes:'We delve.',is_user:false,swipe_id:0,swipes:['We delve.'],swipe_info:[{extra:{old:'keep'},send_date:1}],extra:{old:'keep'},gen_started:1,gen_finished:2};
 const c={chatId:'one',characterId:1,groupId:null,chat:[{mes:'Hello',is_user:true},original],extensionPrompts:{other:{value:'keep'}},eventTypes:Object.fromEntries(['GENERATION_STARTED','GENERATION_STOPPED','GENERATION_ENDED','CHAT_CHANGED','MESSAGE_EDITED','MESSAGE_UPDATED','MESSAGE_DELETED','MESSAGE_SWIPED','MESSAGE_SENT'].map(k=>[k,k])),eventSource:{on:(name,fn)=>{(listeners[name]??=[]).push(fn);},removeListener:()=>{},emit:async(name,...args)=>{for(const fn of listeners[name]??[])await fn(...args);}},setExtensionPrompt:(key,value,position,depth,scan,role)=>{c.extensionPrompts[key]={value,position,depth,scan,role};},saveChat:async()=>{c.saved=(c.saved??0)+1;},updateMessageBlock:()=>{},swipe:{refresh:()=>{}}};
 let busy=false;
 const controller=createNativeWorkflowController({context:()=>c,isBusy:()=>busy,getGraph:()=>assignedGraph,isEnabled:()=>true,countTokens:async text=>({tokens:Math.ceil(text.length/4),method:'fixture'}),resolveBinding:()=>({ok:true,data:{profileId:'fake',model:'fake'}}),request:request??(async()=>({ok:true,data:{text:'{"patches":[{"index":0,"replacement":"explore"}]}',finish:'stop'}})),syncMesToSwipe:index=>{const m=c.chat[index]; Object.assign(m.swipe_info[m.swipe_id],{extra:structuredClone(m.extra)});return true;},syncSwipeToMes:(index,id)=>{const m=c.chat[index];m.swipe_id=id;m.mes=m.swipes[id];Object.assign(m,structuredClone(m.swipe_info[id]));return true;}});
 controller.subscribe();
 return {c,controller,original,setGraph:value=>{assignedGraph=value;},setBusy:value=>{busy=value;},owned:()=>Object.entries(c.extensionPrompts).filter(([key])=>key.startsWith('comfytavern:guidance:')).map(([,v])=>v.value).join('')};
}
{
 let release, started; const waiting=new Promise(r=>started=r);
 const f=fixture(async()=>{started(); return await new Promise(r=>release=r);});
 let aborted=0; const pending=f.controller.beforeGenerate(f.c.chat,8192,value=>{assert.equal(value,true);aborted++;},'normal');
 await waiting; f.controller.cancel('chat changed'); release({ok:true,data:{text:'late',finish:'stop'}}); await pending;
 assert.equal(f.owned(),''); assert.equal(f.c.extensionPrompts.other.value,'keep');assert.equal(aborted,1);
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
 const candidate=structuredClone(result.artifact); const applied=await f.controller.apply(candidate);
 assert.equal(applied.ok,true); assert.equal(applied.appliedLocally,true); assert.equal(applied.persistence,'unverified'); assert.equal(f.original.mes,'We explore.');
 assert.equal(f.original.swipes[0],'We delve.'); assert.equal(f.original.swipe_info[0].extra.old,'keep');assert.equal(f.original.extra.old,undefined);assert.ok(f.original.extra.comfyTavernRevision);
 await f.controller.apply(candidate); assert.equal(f.original.swipes.length,2);assert.equal(f.c.saved,1);
}
for(const mutate of [f=>f.original.mes+=' external',f=>f.c.chat.push({is_user:true,mes:'new'}),f=>f.c.chat.reverse(),f=>f.c.chat.pop(),f=>f.c.chatId='two',f=>f.original.swipe_id=1,f=>f.setBusy(true),f=>f.controller.cancel('graph changed')]) {
 const f=fixture();const r=await f.controller.runPost(post);mutate(f); const before=JSON.stringify(f.c.chat);assert.equal((await f.controller.apply(structuredClone(r.artifact))).ok,false);assert.equal(JSON.stringify(f.c.chat),before);
}
{
 const f=fixture();const r=await f.controller.runPost(post); const before=structuredClone(f.original);f.c.saveChat=async()=>{throw new Error('save failed');};assert.equal((await f.controller.apply(r.artifact)).ok,false);assert.deepEqual(f.original,before);
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
 assert.equal(f.controller.candidateStatus(structuredClone(r.artifact)).ok,true);
 f.original.mes+=' changed';assert.equal(f.controller.candidateStatus(r.artifact).ok,false);
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
 assert.equal(f.controller.candidateStatus(r.artifact).ok,false);
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
 assert.equal((await f.controller.apply(r.artifact)).ok,false);assert.deepEqual(f.original,before);assert.equal(f.c.saved,undefined);
}
for(const remove of [f=>delete f.c.saveChat,f=>delete f.c.updateMessageBlock,f=>delete f.c.swipe.refresh]) {
 const f=fixture();const r=await f.controller.runPost(post);remove(f);const before=structuredClone(f.original);assert.equal((await f.controller.apply(r.artifact)).error.code,'APPLY_UNAVAILABLE');assert.deepEqual(f.original,before);
}
// Concurrent accepts are serialized, and external cancellation during a save rolls back locally.
{
 const f=fixture();const r=await f.controller.runPost(post);let release,started;const ready=new Promise(r=>started=r);const before=structuredClone(f.original);
 f.c.saveChat=async()=>{started();await new Promise(r=>release=r);};const pending=f.controller.apply(r.artifact);await ready;
 assert.equal((await f.controller.apply(r.artifact)).error.code,'BUSY');f.controller.cancel('chat changed');release();assert.equal((await pending).ok,false);assert.deepEqual(f.original,before);
}
// Selecting/assigning a native workflow never arms the production interceptor.
{
 const {installMock}=await import('./mock.js');const c=installMock({settings:{enabled:false,workflowMode:'native',graphs:{[pre.id]:pre},nativeBindings:{preGraphId:pre.id}}});let requests=0;
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
 assert.equal(f.controller.candidateStatus(r.artifact).ok,true);
 graph.nodes.repair.instructions='A different instruction';assert.equal(f.controller.candidateStatus(r.artifact).ok,false);
}
// A delayed provider response remains current after pan/zoom/layout changes.
{
 const graph=structuredClone(post);let release,started;const ready=new Promise(r=>started=r);
 const f=fixture(async()=>{started();return await new Promise(r=>release=r);});const pending=f.controller.runPost(graph);await ready;
 graph.view.zoom=2;graph.nodes.repair.y+=800;graph.groups['ai-de-slop'].h=300;
 release({ok:true,data:{text:'{"patches":[{"index":0,"replacement":"explore"}]}',finish:'stop'}});
 assert.equal((await pending).ok,true);
}
for(const change of [g=>g.nodes.repair.maxTokens++,g=>g.roles.Prose.model='different',g=>g.wires['wire-1'].order++,g=>g.groups['ai-de-slop'].enabled=false]) {
 const f=fixture(),g=structuredClone(post),r=await f.controller.runPost(g);change(g);assert.equal(f.controller.candidateStatus(r.artifact).ok,false);
}
// Invalid explicit settings cannot masquerade as omitted defaults in the semantic identity.
{
 const f=fixture(),graph=structuredClone(post),r=await f.controller.runPost(graph);
 graph.nodes.repair.instructions=null;assert.equal(f.controller.candidateStatus(r.artifact).ok,false);
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
