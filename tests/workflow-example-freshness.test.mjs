import test from 'node:test';
import assert from 'node:assert/strict';
import { createNativeWorkflowController } from '../src/workflow/host.js';
import { createNativeMemoryAdapter } from '../src/workflow/introspection/host-memory.js';
import { fixtureGraph } from './helpers/workflow-fixtures.mjs';
import { graphBy, createExampleFixture, seedMemory, sourceRefs, upsert, readMemory, recordedArtifact, accepted, response, reflection } from './helpers/consumed-memory-fixtures.mjs';
const deferred=()=>{let resolve;const promise=new Promise(done=>resolve=done);return {promise,resolve};};
const promptText=context=>Object.values(context.extensionPrompts).map(prompt=>prompt.value).filter(Boolean).join('\n');
const hint='Rin may return to discuss the ferry inquiry. Leave Rowan free to respond.';
function sceneFixture({includeCharacter=true,selectActor}={}){
 const graph=fixtureGraph('native-guidance');graph.nodes['smart-compactor'].method='select';Object.assign(graph.nodes['scene-context'],{includeCharacter,visibilityMode:'public'});
 const entered=deferred(),release=deferred(),listeners=new Map();let requests=0,supplied;
 const context={chatId:'example-freshness',characterId:0,groupId:null,characters:[{avatar:'rin.png',data:{name:'Rin',description:'Rin wants to find the missing boat.',personality:'Rin is patient.',scenario:'Rin is at the ferry.'}}],chat:[{mes:'Rin left to ask the ferry keeper about the missing boat.',is_user:true,send_date:1},{mes:'Rowan waits on the landing.',is_user:false,swipe_id:0,send_date:2,gen_started:2,gen_finished:3},{mes:'Continue.',is_user:true}],chatMetadata:{unrelated:{keep:true}},extensionPrompts:{},setExtensionPrompt(key,value){this.extensionPrompts[key]={value};},eventTypes:{GENERATION_STARTED:'GENERATION_STARTED'},eventSource:{on(name,fn){listeners.set(name,fn);},removeListener(name){listeners.delete(name);},async emit(name,...args){await listeners.get(name)?.(...args);}}};
 const controller=createNativeWorkflowController({context:()=>context,getGraph:()=>graph,isEnabled:()=>true,isBusy:()=>false,userId:()=> 'default-user',...(selectActor?{selectIntrospectionActor:selectActor}:{}),countTokens:async text=>({tokens:Math.ceil(text.length/4),method:'synthetic-fixture'}),resolveBinding:()=>({ok:true,data:{profileId:'fixture',model:'fixture'}}),request:async request=>{requests++;supplied=request.messages.map(message=>message.content).join('\n');entered.resolve();await release.promise;return response(hint);}});controller.subscribe();
 return {graph,controller,context,entered,release,supplied:()=>supplied,requests:()=>requests,async send(){await context.eventSource.emit('GENERATION_STARTED','normal',{},false);return controller.beforeGenerate(context.chat,8192,()=>{},'normal');}};
}
async function pendingScene(f,mutate){const pending=f.send();await Promise.race([f.entered.promise,pending.then(value=>{throw Error(JSON.stringify(value.error));})]);mutate(f);f.release.resolve();return pending;}
for(const field of ['name','description','personality','scenario'])test('owned Send rejects changed included public character '+field+' during planning',async()=>{
 const f=sceneFixture(),result=await pendingScene(f,({context})=>context.characters[0].data[field]='Changed '+field);
 assert.equal(result.ok,false);assert.equal(result.error.code,'STALE_SOURCE');assert.equal(promptText(f.context),'');assert.equal(f.requests(),1);
});
test('owned Send publishes unchanged public context and ignores unrelated card metadata',async()=>{
 const f=sceneFixture(),result=accepted(await pendingScene(f,({context})=>{context.characters[0].data.editorNotes='Unrelated';context.chatMetadata.unrelated.more=true;}));
 assert.equal(result.published,true);assert.equal(promptText(f.context),hint);assert.match(f.supplied(),/Rin wants to find the missing boat/);f.controller.cancel();
});
test('owned Send ignores character text excluded by the Scene Context control',async()=>{
 const f=sceneFixture({includeCharacter:false});accepted(await pendingScene(f,({context})=>context.characters[0].data.description='Another boat.'));
 assert.equal(promptText(f.context),hint);assert.equal(f.supplied().includes('Rin wants to find the missing boat.'),false);f.controller.cancel();
});
test('owned Send ignores character fields omitted by the bounded snapshot',async()=>{
 const f=sceneFixture();f.context.characters[0].data.scenario='x'.repeat(16001);accepted(await pendingScene(f,({context})=>context.characters[0].data.scenario='y'.repeat(16001)));
 assert.equal(promptText(f.context),hint);assert.equal(f.supplied().includes('x'.repeat(16001)),false);f.controller.cancel();
});
test('owned Send rejects selected message edits while planning waits',async()=>{
 const f=sceneFixture(),result=await pendingScene(f,({context})=>context.chat[1].mes='Rin returned.');assert.equal(result.ok,false);assert.equal(result.error.code,'STALE_RUN');assert.equal(promptText(f.context),'');
});
for(const kind of ['avatar','trusted actor'])test('native memory identity rechecks '+kind+' selection',async()=>{
 let actor='character:rin.png';const f=sceneFixture({selectActor:()=>actor}),adapter=createNativeMemoryAdapter({context:()=>f.context,...(kind==='trusted actor'?{selectActor:()=>actor}:{})}),session=accepted(adapter.capture()).data;
 try{assert.equal((await session.readIdentity()).ok,true);if(kind==='avatar')f.context.characters[0].avatar='mira.png';else actor='character:mira.png';assert.equal((await session.readIdentity()).error.code,'SCOPE_MISMATCH');}finally{session.release();}
});
const ferry='Sol promised to meet Mira at the ferry before dawn.',archive='Sol promised to return the archive key.';
async function promiseFixture({countTokens}={}){
 const graph=graphBy(21);graph.nodes['pre-compose'].template='Saved topic: ferry\nActor episodes: {{data:/payload/episodes}}';
 const f=createExampleFixture(graph,{chat:[{mes:ferry,is_user:false,swipe_id:0,gen_started:1,gen_finished:2},{mes:archive,is_user:false,swipe_id:0,gen_started:2,gen_finished:3}],...(countTokens?{tokenCount:countTokens}:{})});
 await seedMemory(f,({events})=>events.filter(event=>[ferry,archive].includes(event.text)).map(event=>upsert('episodes',event.text===ferry?'ferry-promise':'archive-promise',event.text,sourceRefs([event]))));
 f.ferry=ferry;f.archive=archive;f.read=view=>readMemory(f,view??'state');f.inspect=async()=>{const result=await f.controller.runTarget(f.graph,{workflowId:f.graph.id,instancePath:[],nodeId:'pre-output',portId:'out'});if(result.ok)f.text=recordedArtifact(result,'pre-output').text;return result;};return f;
}
const invalidRefs=read=>read.reports.filter(report=>report.code==='INVALIDATED_SOURCES').flatMap(report=>report.sourceRefs);
const age=f=>{for(let i=0;i<65;i++)f.context.chat.push({mes:'Unrelated later exchange '+i,is_user:true,send_date:i+10});};
function unchanged(f,metadata){assert.deepEqual(f.context.chatMetadata,metadata);assert.equal(f.memorySaves(),1);assert.equal(f.requests.length,0);assert.equal(promptText(f.context),'');}
test('selected supported memory records inspect without requests, publication or saving',async()=>{
 const f=await promiseFixture(),metadata=structuredClone(f.context.chatMetadata);const result=accepted(await f.inspect());assert.deepEqual(result.reviewHandles,[]);assert.ok(f.text.includes(ferry));assert.equal(f.text.includes(archive),false);unchanged(f,metadata);
});
test('edited selected memory remains historical and reports invalidated evidence without writing',async()=>{
 const f=await promiseFixture(),metadata=structuredClone(f.context.chatMetadata);f.context.chat[0].mes='Sol refused the ferry meeting.';const historical=await f.read();assert.ok(invalidRefs(historical).some(ref=>ref.id==='chat:0'));assert.equal(historical.artifact.value.payload.episodes[0].text,ferry);accepted(await f.inspect());assert.ok(f.text.includes(ferry));unchanged(f,metadata);
});
test('unrelated stale stored history does not taint selected ferry recall',async()=>{
 const f=await promiseFixture(),metadata=structuredClone(f.context.chatMetadata);f.context.chat[1].mes='Sol refused the archive key.';assert.ok(invalidRefs(await f.read()).some(ref=>ref.id==='chat:1'));accepted(await f.inspect());assert.ok(f.text.includes(ferry));assert.equal(f.text.includes(archive),false);unchanged(f,metadata);
});
test('empty nonmatching recall remains inspectable beside invalidated stored history',async()=>{
 const f=await promiseFixture();f.context.chat[0].mes='Sol refused.';f.graph.nodes['pre-recall'].query='harbor';accepted(await f.inspect());assert.match(f.text,/Actor episodes: \[\]/);assert.equal(f.text.includes(ferry),false);
});
test('unchanged recall older than the 64-event model window remains current',async()=>{
 const f=await promiseFixture(),metadata=structuredClone(f.context.chatMetadata);age(f);const events=await f.read('events');assert.equal(events.artifact.value.payload.events.length,64);assert.equal(events.artifact.value.payload.events.some(event=>event.text===ferry),false);accepted(await f.inspect());assert.ok(f.text.includes(ferry));assert.deepEqual(invalidRefs(await f.read()),[]);unchanged(f,metadata);
});
const mutations=[['edit',f=>f.context.chat[0].mes='Sol refused the ferry.'],['deletion',f=>f.context.chat.splice(0,1)],['reindexing',f=>f.context.chat.push(f.context.chat.shift())],['duplicate after an edit',f=>{const original=structuredClone(f.context.chat[0]);f.context.chat[0].mes='Sol refused.';f.context.chat.push(original);}],['actor visibility',f=>f.context.chat[0].visibleTo=['character:rin.png']]];
for(const [name,mutate]of mutations)test('historical recall reports '+name+' outside the recent window',async()=>{
 const f=await promiseFixture(),metadata=structuredClone(f.context.chatMetadata);age(f);mutate(f);assert.ok(invalidRefs(await f.read()).length);unchanged(f,metadata);
});
async function duringCount(mutate,aged=true){const entered=deferred(),release=deferred(),f=await promiseFixture();if(aged)age(f);const adapter=createNativeMemoryAdapter({context:()=>f.context}),session=accepted(adapter.capture()).data;
 try{const selected=accepted(await session.memory.recall({query:'ferry',limit:4}));f.text='Saved topic: ferry\nActor episodes: '+JSON.stringify(selected.artifact.value.payload.episodes);const count=async()=>{entered.resolve();await release.promise;return {tokens:Math.ceil(f.text.length/4),method:'deferred-guidance-fixture'};};const pending=count();await entered.promise;mutate(f);release.resolve();await pending;return {f,result:session.readFresh()};}finally{session.release();}}
for(const aged of [false,true])for(const [name,mutate]of mutations.filter(([name])=>['edit','deletion','actor visibility'].includes(name)))test((aged?'aged':'recent')+' selected source '+name+' during Guidance counting invalidates the consumed-memory read',async()=>{
 const {f,result}=await duringCount(mutate,aged);assert.equal(result.ok,false);assert.equal(result.error.code,'STALE_SOURCE');assert.equal(promptText(f.context),'');assert.equal(f.requests.length,0);assert.equal(f.memorySaves(),1);
});
for(const [name,mutate]of [['unchanged',()=>{}],['unrelated archive edit',f=>f.context.chat[1].mes='Sol refused the archive key.']])test('selected aged recall remains current during '+name+' while counting',async()=>{const {f,result}=await duringCount(mutate);accepted(result);assert.ok(f.text.includes(ferry));assert.equal(promptText(f.context),'');});
test('public owned guidance is cleared if a consumed message changes during publication',async()=>{
 const f=sceneFixture();let changed=false;f.context.setExtensionPrompt=function(key,value){this.extensionPrompts[key]={value};if(value&&!changed){changed=true;this.chat[1].mes='Foreign edit during publication.';}};
 const result=await pendingScene(f,()=>{});assert.equal(result.ok,false);assert.equal(changed,true);assert.equal(promptText(f.context),'');
});
for(const explicitState of [false,true])test('Reflect '+(explicitState?'explicit state consumes':'identity fallback omits')+' old memory evidence during model work',async()=>{
 const f=await promiseFixture();age(f);const adapter=createNativeMemoryAdapter({context:()=>f.context}),session=accepted(adapter.capture()).data;
 try{const identity=accepted(await session.readIdentity()).data;if(explicitState)accepted(await session.memory.read({view:'state'}));f.context.chat[1].mes='Foreign archive edit.';const fresh=session.readFresh();assert.equal(fresh.ok,!explicitState);if(!explicitState){const {executeIntrospection}=await import('../src/workflow/introspection/nodes.js');const result=await executeIntrospection({type:'workflow',operation:'reflect',operationVersion:1,mode:'character'},{context:{kind:'context',messages:[{id:'current',role:'user',text:'Continue.'}]}},{root:true,...identity,request:async()=>response(reflection())});accepted(result);}}finally{session.release();}
});
test('selected aged recall stays current beside an edited aged archive record',async()=>{
 const f=await promiseFixture();age(f);f.context.chat[1].mes='Archive edit.';assert.deepEqual(invalidRefs(await f.read()).map(ref=>ref.id),['chat:1']);accepted(await f.inspect());assert.ok(f.text.includes(ferry));
});
async function duringDigest(f,mutate){const original=globalThis.crypto.subtle.digest.bind(globalThis.crypto.subtle),entered=deferred(),release=deferred();let pause=true;globalThis.crypto.subtle.digest=async(...args)=>{if(pause&&new TextDecoder().decode(args[1]).includes(ferry)){pause=false;entered.resolve();await release.promise;}return original(...args);};try{const pending=f.inspect();await entered.promise;mutate(f);release.resolve();return await pending;}finally{globalThis.crypto.subtle.digest=original;release.resolve();}}
test('an aged source changed during its digest retains historical invalidation',async()=>{const f=await promiseFixture();age(f);const result=await duringDigest(f,f=>f.context.chat[0].mes='Foreign ferry edit.');if(result.ok)assert.ok(result.recording.units.some(unit=>unit.reports?.some(report=>report.code==='INVALIDATED_SOURCES')));else assert.equal(result.error.code,'STALE_SOURCE');assert.equal(promptText(f.context),'');});
for(const [name,mutate]of [['actor change',f=>f.context.characters[0].avatar='rin.png'],['chat replacement',f=>f.context.chat=structuredClone(f.context.chat)],['cancellation',f=>f.controller.cancel('Historical recall stopped')]])test('historical target authority rejects '+name+' during its digest',async()=>{const f=await promiseFixture();age(f);const result=await duringDigest(f,mutate);assert.equal(result.ok,false);assert.equal(promptText(f.context),'');assert.equal(f.requests.length,0);assert.equal(f.memorySaves(),1);});
test('private memory Compose guidance cannot manufacture a native publication grant',async()=>{
 const f=await promiseFixture();const result=await f.pre();assert.equal(result.ok,false);assert.equal(result.error.code,'ACTOR_GUIDANCE_UNVERIFIED');assert.equal(promptText(f.context),'');assert.equal(f.memorySaves(),1);
});
