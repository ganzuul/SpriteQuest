import test from 'node:test';
import assert from 'node:assert/strict';
import {createNativeWorkflowController} from '../src/workflow/host.js';
import {operationDefaults} from '../src/workflow/catalog.js';
import {ACTIVE_PROFILE_ID} from '../src/workflow/model-profiles.js';

const mara='character:mara.png',elias='character:elias.png';
const complete=text=>({choices:[{message:{content:text},finish_reason:'stop'}]});
function directionGraph(profileId){
 const nodes={},wires={};
 const add=(id,operation,settings={})=>nodes[id]={id,type:'workflow',...operationDefaults(operation),...settings};
 const connect=(id,from,fromPort,to,toPort)=>wires[id]={id,route:'wire',from,fromPort,to,toPort};
 add('send','on-send');add('generate','generate-reply');add('review','review-publish');connect('activate','send','activation','generate','activation');connect('review','generate','draft','review','draft');
 add('scene','scene-context',{visibilityMode:'public',includeCharacter:false});add('prompt','text',{text:'Return exact present cast using context.source identity and an actual chat quote.'});add('cast','model-call',{profileId,outputKind:'data'});add('presence','scene-presence',{actorId:mara});
 add('direction','character-direction',{profileId,actorId:mara,systemPrompt:'A separate private system prompt for Mara alone.'});
 connect('prompt','prompt','out','cast','prompt');connect('scene','scene','out','cast','context');connect('cast','cast','out','presence','in');connect('presence','presence','out','direction','presence');connect('guidance','direction','out','generate','guidance');
 return {id:'active-actor-freshness',schema:3,runtime:2,mode:'native-unified',nodes,wires,definitions:{},portals:{}};
}
function fixture(route,options={}){
 const graph=directionGraph(route==='active'?ACTIVE_PROFILE_ID:'fixed-profile'),listeners=new Map(),sent=[];let user='default-user',controller,convertedPrivate=false,mutated=false;
 const c={mainApi:'openai',chatId:'Story-2',characterId:0,groupId:null,characters:[
  {avatar:'mara.png',data:{name:'Mara',description:'PRIVATE SEA memory',visibility:{kind:'actor-private',actorId:mara}}},
  {avatar:'elias.png',data:{name:'Elias',description:'PRIVATE FIRE memory',visibility:{kind:'actor-private',actorId:elias}}},
 ],chat:[{mes:'Mara and Elias meet beside the sea.',is_user:true,extra:{}}],chatMetadata:{},extensionPrompts:{},chatCompletionSettings:{chat_completion_source:'nanogpt',nanogpt_model:'active-model',temperature:0.1},CONNECT_API_MAP:{nanogpt:{selected:'openai',source:'nanogpt'}},eventTypes:{GENERATION_STARTED:'GENERATION_STARTED',GENERATION_STOPPED:'GENERATION_STOPPED',GENERATION_ENDED:'GENERATION_ENDED'}};
 let nativeChatId='Story-2';if(options.functionChatId){c.getCurrentChatId=()=>nativeChatId;delete c.chatId;}
 const fixedProfile={id:'fixed-profile',name:'Fixed profile',api:'nanogpt',model:'fixed-model'};c.extensionSettings={connectionManager:{profiles:[fixedProfile]}};
 const controls={c,graph,sent,fixedProfile,setChatId:value=>nativeChatId=value,setUser:value=>user=value,cancel:()=>controller.cancel('Canceled during conversion')};
 const mutate=()=>{if(!mutated&&convertedPrivate&&options.bindingMutation){mutated=true;options.bindingMutation(controls);}};
 c.getChatCompletionModel=settings=>{mutate();return settings.nanogpt_model;};
 c.eventSource={on(name,fn){const bucket=listeners.get(name)??[];bucket.push(fn);listeners.set(name,bucket);},removeListener(name,fn){listeners.set(name,(listeners.get(name)??[]).filter(item=>item!==fn));},async emit(name,...args){for(const fn of listeners.get(name)??[])await fn(...args);}};
 c.setExtensionPrompt=(key,value)=>{c.extensionPrompts[key]={value};};
 const send=async payload=>{const material=JSON.parse(payload.messages.at(-1).content);sent.push(JSON.stringify(payload.messages));if(material.context?.source&&material.context.source.actorId===undefined){const source=material.context.source;return complete(JSON.stringify({sceneId:source.sceneId,sourceId:source.sourceId,revision:source.revision,actors:[{actorId:mara,status:'present',evidence:c.chat[0].mes}]}));}return complete('Mara considers the sea.');};
 c.ChatCompletionService={presetToGeneratePayload:async(_preset,overrides,payload)=>{if(JSON.stringify(payload.messages).includes('PRIVATE SEA')){await Promise.resolve();await options.convert?.(controls);convertedPrivate=true;}return {...payload,...(overrides.openai_max_tokens?{max_tokens:overrides.openai_max_tokens}:{})};},sendRequest:send};
 c.ConnectionManagerRequestService={getProfile:id=>{mutate();return id==='fixed-profile'?fixedProfile:null;},sendRequest:async(_profile,_messages,_maxTokens,_options,payload)=>send(payload)};
 controller=createNativeWorkflowController({context:()=>options.freshContext?{...c}:c,getGraph:phase=>phase==='unified'?graph:undefined,isEnabled:()=>true,isBusy:()=>true,userId:()=>{options.userIdHook?.(controls);return user;},transportUserId:options.passiveUser===false?undefined:options.passiveUser==='async'?async()=>user:()=>user,countTokens:async text=>({tokens:Math.ceil(text.length/4)})});controller.subscribe();
 return {...controls,controller,async start(){await c.eventSource.emit('GENERATION_STARTED','normal',{},false);return controller.beforeGenerate(c.chat.map(message=>({...message})),8192,()=>{},'normal');}};
}
for(const route of ['active','fixed']){
 test(`${route} native adapter preserves intact private actor scope through conversion`,async()=>{
  const f=fixture(route);try{const result=await f.start();assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(f.sent.length,2);assert.ok(f.sent[1].includes('PRIVATE SEA'));assert.equal(f.sent[1].includes('PRIVATE FIRE'),false);assert.ok(Object.values(f.c.extensionPrompts).some(prompt=>prompt.value==='Mara considers the sea.'));}finally{f.controller.dispose();}
 });
 for(const [name,change]of [
  ['card',f=>f.c.characters[0].data.description='Revoked private card'],
  ['user',f=>f.setUser('other-user')],
  ['selected actor',f=>f.c.characterId=1],
  ['cancellation',f=>f.cancel()],
 ])test(`${route} native adapter rejects ${name} revocation during asynchronous conversion before private transmission`,async()=>{
  const f=fixture(route,{convert:change});try{const result=await f.start();assert.equal(result.ok,false);assert.equal(f.sent.length,1,'Only the public cast call may transmit');assert.equal(f.sent.some(text=>text.includes('PRIVATE SEA')),false);assert.equal(Object.values(f.c.extensionPrompts).some(prompt=>prompt.value),false);}finally{f.controller.dispose();}
 });
 test(`${route} final binding callback cannot revoke a private actor after conversion and still transmit`,async()=>{
  const f=fixture(route,{bindingMutation:f=>f.c.characters[0].data.description='Revoked from final binding callback'});try{const result=await f.start();assert.equal(result.ok,false);assert.equal(f.sent.length,1);assert.equal(f.sent.some(text=>text.includes('PRIVATE SEA')),false);}finally{f.controller.dispose();}
 });
}

for(const route of ['active','fixed'])for(const [name,change]of [
 ['card',f=>f.c.characters[0].data.description='Revoked in final freshness callback'],
 ['selected actor',f=>f.c.characterId=1],
])test(`${route} final native freshness callback cannot revoke ${name} through copied context wrappers`,async()=>{
 let armed=false,reads=0,mutated=false;
 const f=fixture(route,{freshContext:true,convert(){armed=true;},userIdHook(controls){
  // Exercise the last native-prefix freshness callback after exact actor checks.
  const stack=new Error().stack;if(armed&&!mutated&&stack.includes('at nativePrefixFresh')&&stack.includes('at authorizeModelScope')&&!stack.includes('native-actor-context.js')&&!stack.includes('native-recall.js')&&++reads===2){mutated=true;change(controls);}
 }});
 try{const result=await f.start();assert.equal(mutated,true,'The final source callback must execute');assert.equal(result.ok,false);assert.equal(f.sent.length,1,'Revoked private context must not transmit');assert.equal(f.sent.some(text=>text.includes('PRIVATE SEA')),false);assert.equal(Object.values(f.c.extensionPrompts).some(prompt=>prompt.value),false);}finally{f.controller.dispose();}
});

for(const route of ['active','fixed'])for(const [name,change,setup]of [
 ['model configuration',f=>route==='active'?f.c.chatCompletionSettings.nanogpt_model='changed-after-binding-check':f.fixedProfile.model='changed-after-binding-check',{}],
 ['computed chat function',f=>f.c.getCurrentChatId=()=> 'Story-3',{functionChatId:true}],
 ['computed chat closure',f=>f.setChatId('Story-3'),{functionChatId:true}],
])test(`${route} final source callback cannot revoke ${name} before private transmission`,async()=>{
 let armed=false,reads=0,mutated=false;
 const f=fixture(route,{...setup,freshContext:true,convert(){armed=true;},userIdHook(controls){
  const stack=new Error().stack;if(armed&&!mutated&&stack.includes('at nativePrefixFresh')&&stack.includes('at authorizeModelScope')&&!stack.includes('native-actor-context.js')&&!stack.includes('native-recall.js')&&++reads===2){mutated=true;change(controls);}
 }});
 try{const result=await f.start();assert.equal(mutated,true);assert.equal(result.ok,false);assert.equal(f.sent.length,1,'Revoked scope/configuration must not transmit');assert.equal(f.sent.some(text=>text.includes('PRIVATE SEA')),false);}finally{f.controller.dispose();}
});

for(const route of ['active','fixed']){
 test(`${route} final computed chat callback cannot change opaque user ownership and transmit private context`,async()=>{
  let armed=false,reads=0,mutated=false;const f=fixture(route,{freshContext:true,functionChatId:true,convert(){armed=true;}});
  f.c.getCurrentChatId=()=>{const stack=new Error().stack;if(armed&&!mutated&&stack.includes('at beforeSend')&&!stack.includes('at authorizeModelScope')&&!stack.includes('native-actor-context.js')&&!stack.includes('native-recall.js')&&++reads===2){mutated=true;f.setUser('other-user');}return 'Story-2';};
  try{const result=await f.start();assert.equal(mutated,true);assert.equal(result.ok,false);assert.equal(f.sent.length,1,'The closed user scope must not transmit private context');assert.equal(f.sent.some(text=>text.includes('PRIVATE SEA')),false);}finally{f.controller.dispose();}
 });
 for(const passiveUser of [false,'async'])test(`${route} private transport requires a separate synchronous passive user reader (${passiveUser})`,async()=>{
  const f=fixture(route,{passiveUser});try{const result=await f.start();assert.equal(result.ok,false);assert.equal(f.sent.length,1);assert.equal(f.sent.some(text=>text.includes('PRIVATE SEA')),false);}finally{f.controller.dispose();}
 });
}
