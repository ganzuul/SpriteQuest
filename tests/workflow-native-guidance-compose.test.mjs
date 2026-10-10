import { computeDefinitionIdentity, definitionRefKey } from '../src/workflow/definition-data.js';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {registerHooks} from 'node:module';
import {createNativeWorkflowController} from '../src/workflow/host.js?v=0.27.0';
import {createChatDocumentCatalog} from '../src/workflow/document-catalog.js?v=0.27.0';
import {operationDefaults} from '../src/workflow/catalog.js?v=0.27.0';
const pause=()=>new Promise(r=>setTimeout(r,5));
const mara='character:mara.png',elias='character:elias.png';
function graphFor(mode='direction'){
 const nodes={},wires={};const node=(id,operation,settings={})=>nodes[id]={id,type:'workflow',...operationDefaults(operation),...settings};const wire=(id,from,fromPort,to,toPort)=>wires[id]={id,route:'wire',from,fromPort,to,toPort};
 node('send','on-send');node('generate','generate-reply',{budgetTokens:4096});node('review','review-publish');wire('send','send','activation','generate','activation');wire('review','generate','draft','review','draft');
 node('scene','scene-context',{visibilityMode:'public',includeCharacter:false});node('castPrompt','text',{text:'Return actual participating actors with context.source identity and exact quoted chat evidence.'});node('cast','model-call',{outputKind:'data'});wire('castPrompt','castPrompt','out','cast','prompt');wire('castContext','scene','out','cast','context');
 for(const [id,actorId]of [['mara',mara],['elias',elias]]){node(id,'scene-presence',{actorId});wire(id+'Presence','cast','out',id,'in');}
 if(mode==='direction'){
  node('direction','character-direction',{actorId:mara,systemPrompt:'Mara alone should hesitate and consider the sea.'});wire('present','mara','out','direction','presence');wire('guidance','direction','out','generate','guidance');
 }else{
  delete nodes.scene;delete wires.castContext;nodes.cast.phase='post';nodes.castPrompt.phase='post';nodes.mara.phase='post';nodes.elias.phase='post';
  node('scopeText','text',{text:JSON.stringify({sourceId:'authored',revision:'authored',sceneId:'Story-2',visibility:'public'}),phase:'post'});node('scope','json-decode',{phase:'post'});node('source','draft-event-source');wire('scopeText','scopeText','out','scope','in');wire('draft','generate','draft','source','in');wire('scope','scope','out','source','scope');wire('castSource','source','out','cast','data');
  for(const [id,actorId]of [['mara',mara],['elias',elias]]){
   node(id+'Context','actor-context',{actorId,phase:'post'});wire(id+'ContextPresence',id,'out',id+'Context','presence');
   node(id+'Read','read-file',{targetId:id+'.md',actorScope:'presence',actorId,phase:'post'});wire(id+'ReadPresence',id,'out',id+'Read','presence');
   node(id+'Prompt','text',{text:'Reflect privately for '+actorId+'.',phase:'post'});node(id+'Reflect','model-call',{instructions:'Reflect privately for '+actorId+'.',phase:'post'});wire(id+'ReflectPrompt',id+'Read','text',id+'Reflect','prompt');wire(id+'ReflectData',id+'Read','document',id+'Reflect','data');wire(id+'ActorContext',id+'Context','out',id+'Reflect','context');
   node(id+'Write','write-file',{actorScope:'presence',actorId,mode:'append'});wire(id+'WritePresence',id,'out',id+'Write','presence');wire(id+'Reference',id+'Read','reference',id+'Write','reference');wire(id+'Reflection',id+'Reflect','out',id+'Write','text');
  }
 }
 return {id:'actor-story',name:'Actor story',schema:3,runtime:2,mode:'native-unified',nodes,wires,definitions:{},portals:{}};
}
function fixture(mode='direction',options={}){
 const graph=graphFor(mode),listeners=new Map(),results=[],requests=[];let busy=false,user='default-user';
 const c={chatId:'Story-2',characterId:0,groupId:null,characters:[{avatar:'mara.png',data:{name:'Mara',description:'PRIVATE SEA memory',visibility:{kind:'actor-private',actorId:mara}}},{avatar:'elias.png',data:{name:'Elias',description:'PRIVATE FIRE memory',visibility:{kind:'actor-private',actorId:elias}}}],chat:[{mes:options.chatText??'Mara and Elias meet by the door.',is_user:true,extra:{}}],chatMetadata:{},extensionPrompts:{},eventTypes:Object.fromEntries(['GENERATION_STARTED','GENERATION_STOPPED','GENERATION_ENDED','MESSAGE_RECEIVED','MESSAGE_SENT','CHAT_CHANGED','MESSAGE_EDITED','MESSAGE_UPDATED','MESSAGE_DELETED','MESSAGE_SWIPED','MESSAGE_SWIPE_DELETED'].map(n=>[n,n]))};
 c.eventSource={on(name,fn){const bucket=listeners.get(name)??[];bucket.push(fn);listeners.set(name,bucket);},removeListener(name,fn){listeners.set(name,(listeners.get(name)??[]).filter(v=>v!==fn));},async emit(name,...args){for(const fn of listeners.get(name)??[])await fn(...args);}};c.setExtensionPrompt=(key,value)=>{c.extensionPrompts[key]={value};};c.saveChat=async()=>{};c.updateMessageBlock=async()=>{};c.swipe={refresh:async()=>{}};
 const catalog=createChatDocumentCatalog({getContext:()=>c,getUserId:()=>user});for(const [id,actorId,content]of [['mara',mara,'PRIVATE SEA reflection'],['elias',elias,'PRIVATE FIRE reflection']])assert.equal(catalog.define({targetId:id+'.md',name:id,format:'markdown',content,visibility:{kind:'actor-private',actorId}}).ok,true);
 const controller=(options.controllerFactory??createNativeWorkflowController)({context:()=>{options.onContext?.(c);return c;},getGraph:phase=>phase==='unified'?graph:undefined,isEnabled:()=>true,userId:()=>user,isBusy:()=>busy,documentCatalog:catalog,countTokens:async text=>{await options.onCount?.(text,c);return {tokens:Math.ceil(text.length/4)};},resolveBinding:()=>({ok:true,data:{profileId:'fixed',model:'test'}}),request:async request=>{requests.push(request);const material=JSON.parse(request.messages.at(-1).content);await options.onRequest?.(request,material,c);const override=options.modelOutput?.(material,c);if(override!==undefined)return {ok:true,data:{text:typeof override==='string'?override:JSON.stringify(override),finish:'stop'}};if(material.context?.source?.actorId===undefined&&material.context?.source||material.data?.watch==='draft'){const s=material.context?.source??material.data;return {ok:true,data:{text:JSON.stringify({sceneId:s.sceneId,sourceId:s.sourceId,revision:s.revision,actors:[{actorId:mara,status:'present',evidence:s.watch==='draft'?s.text:c.chat[0].mes},{actorId:elias,status:'present',evidence:s.watch==='draft'?'Mara and Elias kiss by the door.':'Mara and Elias meet by the door.'}]}),finish:'stop'}};}return {ok:true,data:{text:material.request?.includes('FIRE')?'Elias considers the fire.':'Mara considers the sea.',finish:'stop'}};},persistenceVerifier:{saveAndVerify:async selection=>{await options.onVerify?.(selection,c);return {ok:true,data:{acknowledged:true}};}},onEvent:options.onEvent,onResult:value=>results.push(value),syncMesToSwipe(index){const m=c.chat[index];m.swipes[m.swipe_id]=m.mes;return true;},syncSwipeToMes(index,swipeId){const m=c.chat[index];m.swipe_id=swipeId;m.mes=m.swipes[swipeId];Object.assign(m,structuredClone(m.swipe_info[swipeId]));return true;}});controller.subscribe();
 return {c,graph,controller,catalog,requests,results,setUser:v=>user=v,async start(){busy=true;await c.eventSource.emit('GENERATION_STARTED','normal',{},false);return controller.beforeGenerate(c.chat.map(m=>({...m})),8192,()=>{},'normal');},async complete(){const now=new Date().toISOString(),reply=options.replyText??'Mara and Elias kiss by the door.';c.chat.push({mes:reply,is_user:false,extra:{},gen_started:now,gen_finished:now,swipe_id:0,swipes:[reply],swipe_info:[{gen_started:now,gen_finished:now,extra:{}}]});await c.eventSource.emit('MESSAGE_RECEIVED',c.chat.length-1,'normal');busy=false;await c.eventSource.emit('GENERATION_ENDED',c.chat.length);for(let i=0;i<100&&!results.length;i++)await pause();return results.at(-1);}};
}

function addCompose(f, nested = false) {
    const node = (id, settings) => f.graph.nodes[id] = { id, type: 'workflow', ...operationDefaults('compose'), outputKind: 'guidance', ...settings };
    const wire = (id, from, fromPort, to, toPort) => f.graph.wires[id] = { id, route: 'wire', from, fromPort, to, toPort };
    delete f.graph.wires.guidance;
    node('compose', { sections: [{ name: 'public', text: 'Public weather.' }, { name: 'actor', text: '', kind: 'guidance' }] });
    wire('actorMerge', 'direction', 'out', 'compose', 'section.actor');
    if (nested) { node('outer', { sections: [{ name: 'inner', text: '', kind: 'guidance' }, { name: 'public', text: 'Public ending.' }] }); wire('innerMerge', 'compose', 'out', 'outer', 'section.inner'); }
    wire('guidance', nested ? 'outer' : 'compose', 'out', 'generate', 'guidance');
}

test('native Compose injects public plus exact current actor Character Direction once', async () => {
    const f = fixture(); addCompose(f);
    try {
        const ready = await f.start(); assert.equal(ready.ok, true, JSON.stringify(ready.error));
        assert.ok(Object.values(f.c.extensionPrompts).some(p => p.value === 'Public weather.\n\nMara considers the sea.'));
        const result = await f.complete(); assert.equal(result.ok, true, JSON.stringify(result.error));
        assert.equal((await f.controller.apply(result.reviewHandles[0])).ok, true);
    } finally { f.controller.dispose(); }
});

test('a cleared run registry cannot retain late aggregates or authorize late originals', async () => {
    const { createNativeGuidanceComposition } = await import('../src/workflow/native-guidance-compose.js');
    const registry = createNativeGuidanceComposition();
    const source = Object.freeze({ kind: 'guidance', text: 'Private.', visibility: { kind: 'actor-private', actorId: mara } });
    const artifact = Object.freeze({ kind: 'guidance', text: 'Private.', visibility: source.visibility });
    const payload = { node: { operation: 'compose', outputKind: 'guidance', sections: [{ name: 'source', text: '', kind: 'guidance' }] }, inputs: { 'section.source': source }, artifact, portId: 'out' };
    registry.clear();
    assert.equal(registry.retain(payload).ok, false);
    assert.equal(registry.authorize(artifact, () => ({ ok: true })).ok, false);
});

test('authentic private Guidance crosses a legal static system boundary before nested composition', async () => {
    const f = fixture(); addCompose(f, true);
    wrapDirection(f);
    try {
        const ready = await f.start(); assert.equal(ready.ok, true, JSON.stringify(ready.error));
        assert.ok(Object.values(f.c.extensionPrompts).some(p => p.value === 'Public weather.\n\nMara considers the sea.\n\nPublic ending.'));
        const result = await f.complete(); assert.equal(result.ok, true, JSON.stringify(result.error));
        assert.equal((await f.controller.apply(result.reviewHandles[0])).ok, true);
    } finally { f.controller.dispose(); }
});

function wrapDirection(f) {
    const direction = f.graph.nodes.direction;
    const body = { schema: 3, runtime: 2, mode: 'native-unified', nodes: { input: { id: 'input', type: 'subgraph-input', interfacePortId: 'presence' }, direction, output: { id: 'output', type: 'subgraph-output', interfacePortId: 'guidance' } }, wires: {
        presence: { id: 'presence', route: 'wire', from: 'input', fromPort: 'out', to: 'direction', toPort: 'presence' },
        guidance: { id: 'guidance', route: 'wire', from: 'direction', fromPort: 'out', to: 'output', toPort: 'in' },
    } };
    const identity = computeDefinitionIdentity({ id: 'actor-system', version: 1, name: 'Actor system', parameters: [], body, interface: [
        { id: 'presence', label: 'Presence', kind: 'data', direction: 'input', required: true, cardinality: 'one', boundaryNodeId: 'input' },
        { id: 'guidance', label: 'Guidance', kind: 'guidance', direction: 'output', required: false, cardinality: 'one', boundaryNodeId: 'output' },
    ] }); assert.equal(identity.ok, true, JSON.stringify(identity.error));
    const definition = { ...identity.data.materializedDefinition, semanticHash: identity.data.semanticHash };
    f.graph.definitions[definitionRefKey(definition)] = definition;
    delete f.graph.nodes.direction;
    f.graph.nodes.system = { id: 'system', type: 'subgraph', definition: { id: definition.id, version: definition.version, semanticHash: definition.semanticHash } };
    f.graph.wires.present.to = 'system'; f.graph.wires.present.toPort = 'presence';
    f.graph.wires.actorMerge.from = 'system'; f.graph.wires.actorMerge.fromPort = 'guidance';
}

test('disabled nested Character Direction omits guidance without actor discovery or source calls', async () => {
    const f = fixture(); addCompose(f); wrapDirection(f); f.graph.nodes.system.enabled = false;
    f.graph.nodes.compose.sections[1].onSkipped = 'omit';
    for (const id of ['scene', 'castPrompt', 'cast', 'mara', 'elias']) delete f.graph.nodes[id];
    for (const [id, wire] of Object.entries(f.graph.wires)) if (!f.graph.nodes[wire.from] || !f.graph.nodes[wire.to]) delete f.graph.wires[id];
    f.c.characterId = 99;
    try {
        const ready = await f.start(); assert.equal(ready.ok, true, JSON.stringify(ready.error));
        assert.equal(f.requests.length, 0);
        assert.ok(Object.values(f.c.extensionPrompts).some(p => p.value === 'Public weather.'));
    } finally { f.controller.dispose(); }
});

function recallGraph(options={}) {
 const nodes={},wires={};const node=(id,operation,settings={})=>nodes[id]={id,type:'workflow',...operationDefaults(operation),...settings};
 const wire=(id,from,fromPort,to,toPort)=>wires[id]={id,route:'wire',from,fromPort,to,toPort};
 node('send','on-send');node('generate','generate-reply',{budgetTokens:4096});node('review','review-publish');wire('activation','send','activation','generate','activation');wire('draft','generate','draft','review','draft');
 node('hotkey','hotkey-arm',{actorId:'character:0',memorySetId:'moments',consumeOn:options.consumeOn??'accepted',target:options.target??'both',uses:options.uses??'next-match'});
 node('scene','scene-context',{includeCharacter:false,visibilityMode:'public'});node('prompt','text',{text:'Return actual participating actors with sceneId, sourceId, revision copied from context.source and evidence quoted from chat.'});node('cast','model-call',{outputKind:'data'});node('presence','scene-presence',{actorId:'character:0'});
 wire('prompt','prompt','out','cast','prompt');wire('context','scene','out','cast','context');wire('cast','cast','out','presence','in');
 node('read','read-file',{targetId:'moments.json'});node('decode','json-decode');wire('json','read','text','decode','in');
 node('recall','recall',{actorId:'character:0',memorySetId:'moments',activation:options.activation??'armed'});wire('records','decode','out','recall','records');wire('presence','presence','out','recall','presence');wire('guidance','recall','out','generate','guidance');
 return {id:'recall-story',name:'Recall story',schema:3,runtime:2,mode:'native-unified',nodes,wires,portals:{},definitions:{}};
}
function recallFixture(options={}) {
 const graph=recallGraph(options),listeners=new Map(),results=[],registrations=[];let busy=false,user='default-user',requests=0;
 const c={chatId:'story',characterId:0,groupId:null,characters:[{data:{name:'Mara'}}],chat:[{mes:'Mara waits at the door.',is_user:true,extra:{}}],chatMetadata:{},extensionPrompts:{},eventTypes:Object.fromEntries(['GENERATION_STARTED','GENERATION_STOPPED','GENERATION_ENDED','MESSAGE_RECEIVED','MESSAGE_SENT','CHAT_CHANGED','MESSAGE_EDITED','MESSAGE_UPDATED','MESSAGE_DELETED','MESSAGE_SWIPED','MESSAGE_SWIPE_DELETED'].map(name=>[name,name]))};
 c.eventSource={on(name,fn){const bucket=listeners.get(name)??[];bucket.push(fn);listeners.set(name,bucket);},removeListener(name,fn){listeners.set(name,(listeners.get(name)??[]).filter(value=>value!==fn));},async emit(name,...args){for(const fn of listeners.get(name)??[])await fn(...args);}};
 c.setExtensionPrompt=(key,value)=>{c.extensionPrompts[key]={value};options.onPrompt?.(value,c);};c.saveChat=async()=>{};c.updateMessageBlock=async()=>{};c.swipe={refresh:async()=>{}};
 const catalog=createChatDocumentCatalog({getContext:()=>c,getUserId:()=>user});assert.equal(catalog.define({targetId:'moments.json',name:'Moments',format:'json',content:JSON.stringify([{id:'m1',actorId:'character:0',text:'PRIVATE harbor memory',tags:['harbor']}]),visibility:{kind:'actor-private',actorId:'character:0'}}).ok,true);
 const controller=createNativeWorkflowController({context:()=>c,getGraph:phase=>phase==='unified'?graph:undefined,isEnabled:()=>options.isEnabled?.()??true,userId:()=>user,isBusy:()=>busy,documentCatalog:catalog,countTokens:async text=>{await options.onCount?.(text,c);return {tokens:Math.ceil(text.length/4)};},resolveBinding:()=>({ok:true,data:{profileId:'fixed',model:'test'}}),request:async request=>{requests++;const material=JSON.parse(request.messages.at(-1).content);await options.onModel?.(material,c);const s=material.context?.source??material.data;const output=options.modelOutput?.(material)??{sceneId:s.sceneId??'story',sourceId:s.sourceId??'manual-source',revision:s.revision??'manual-revision',actors:[{actorId:'character:0',status:'present',evidence:'Mara waits at the door.'}]};return {ok:true,data:{text:JSON.stringify(output),finish:'stop'}};},registerRecallHotkey:entry=>{const captured={...entry,disposed:false};registrations.push(captured);return {ok:true,data:{dispose:()=>{captured.disposed=true;}}};},persistenceVerifier:{saveAndVerify:async()=>({ok:true,data:{acknowledged:true}})},onResult:value=>results.push(value),syncMesToSwipe(index){const m=c.chat[index];m.swipes[m.swipe_id]=m.mes;return true;},syncSwipeToMes(index,swipeId){const m=c.chat[index];m.swipe_id=swipeId;m.mes=m.swipes[swipeId];Object.assign(m,structuredClone(m.swipe_info[swipeId]));return true;}});
 controller.subscribe();
 return {c,graph,controller,catalog,results,registrations,requests:()=>requests,setUser:value=>{user=value;},async start(type='normal'){busy=true;await c.eventSource.emit('GENERATION_STARTED',type,{},false);return controller.beforeGenerate(c.chat.map(message=>({...message})),8192,()=>{},type);},async complete(type='normal'){const now=new Date().toISOString();if(type==='normal')c.chat.push({mes:'Native reply.',is_user:false,extra:{},gen_started:now,gen_finished:now,swipe_id:0,swipes:['Native reply.'],swipe_info:[{gen_started:now,gen_finished:now,extra:{}}]});else{const m=c.chat.at(-1);Object.assign(m,{mes:'Native swipe.',gen_started:now,gen_finished:now});m.swipes.push(m.mes);m.swipe_info.push({gen_started:now,gen_finished:now,extra:{}});}await c.eventSource.emit('MESSAGE_RECEIVED',c.chat.length-1,type);busy=false;await c.eventSource.emit('GENERATION_ENDED',c.chat.length);for(let i=0;i<60&&!results.length;i++)await pause();return results.at(-1);}};
}

test('root Recall composes with public guidance and consumes only the accepted native reply', async () => {
    const f = recallFixture();
    addRecallCompose(f);
    try {
        assert.equal(f.controller.queueRecall('hotkey').ok, true);
        const ready = await f.start(); assert.equal(ready.ok, true, JSON.stringify(ready.error));
        assert.ok(Object.values(f.c.extensionPrompts).some(p => p.value.startsWith('Public weather.\n\n') && p.value.includes('PRIVATE harbor memory')));
        assert.equal(f.controller.statusRecall().data.shortcuts[0].queued, true);
        const result = await f.complete(); assert.equal(result.ok, true, JSON.stringify(result.error));
        assert.equal(f.controller.statusRecall().data.shortcuts[0].queued, true);
        assert.equal((await f.controller.apply(result.reviewHandles[0])).ok, true);
        assert.equal(f.controller.statusRecall().data.shortcuts[0].queued, false);
        assert.equal(JSON.stringify(result).includes('originals'), false);
        assert.equal(JSON.stringify(f.graph).includes('PRIVATE harbor memory'), false);
    } finally { f.controller.dispose(); }
});

test('native aggregate currentness is rechecked after tokenizer and prompt setter callbacks', async () => {
    for (const checkpoint of ['tokenizer', 'setter']) {
        let changed = false;
        const f = fixture('direction', { onCount(text, c) { if (checkpoint === 'tokenizer' && text.startsWith('Public weather.') && !changed) { changed = true; c.characters[0].data.description = 'Changed private card.'; } } });
        addCompose(f);
        const setter = f.c.setExtensionPrompt;
        f.c.setExtensionPrompt = (key, value) => { setter(key, value); if (checkpoint === 'setter' && value.startsWith('Public weather.') && !changed) { changed = true; f.c.characterId = 1; } };
        try {
            const ready = await f.start(); assert.equal(changed, true, checkpoint); assert.equal(ready.ok, false, checkpoint);
            assert.equal(Object.values(f.c.extensionPrompts).some(p => p.value), false, checkpoint);
            assert.equal(ready.reviewHandles.length, 0);
            assert.equal(f.c.chatMetadata.latticeDocuments, undefined);
        } finally { f.controller.dispose(); }
    }
});

test('native aggregate authorization rejects cloned and forged envelopes despite copied provenance', async () => {
    const hostURL = new URL('../src/workflow/host.js?composition-proof-capture', import.meta.url).href;
    const registryURL = new URL('../src/workflow/native-guidance-compose.js', import.meta.url).href;
    const state = {}; globalThis.latticeCompositionProofCapture = state;
    const adapter = 'data:text/javascript,' + encodeURIComponent(`import {createNativeGuidanceComposition as real} from ${JSON.stringify(registryURL)};export const createNativeGuidanceComposition=()=>{const service=real();globalThis.latticeCompositionProofCapture.service=service;return Object.freeze({...service,retain(payload){if(payload.node.operation==='compose')globalThis.latticeCompositionProofCapture.payload=payload;return service.retain(payload);},authorize(artifact,original){globalThis.latticeCompositionProofCapture.original=original;return service.authorize(artifact,original);}});};`);
    const hook = registerHooks({ resolve(specifier, context, next) { return context.parentURL === hostURL && specifier.startsWith('./native-guidance-compose.js') ? { url: adapter, shortCircuit: true } : next(specifier, context); } });
    let f;
    try {
        const { createNativeWorkflowController: controllerFactory } = await import(hostURL);
        f = fixture('direction', { controllerFactory }); addCompose(f);
        assert.equal((await f.start()).ok, true);
        assert.equal(state.service.authorize(state.payload.artifact, state.original).ok, true);
        for (const artifact of [Object.freeze(structuredClone(state.payload.artifact)), Object.freeze({ ...state.payload.artifact, text: 'Rewritten private instructions.' }), Object.freeze({ ...state.payload.artifact, sourceRefs: [{ sourceId: 'forged', revision: 'fake' }] })]) {
            assert.equal(state.service.authorize(artifact, state.original).ok, false);
        }
        const modified = Object.freeze({ ...state.payload.artifact, text: 'Modified after composition.' });
        assert.equal(state.service.retain({ ...state.payload, artifact: modified }).ok, false);
        const original = state.payload.inputs['section.actor'];
        const clonedSource = Object.freeze(structuredClone(original));
        const copied = Object.freeze({ ...state.payload.artifact });
        assert.equal(state.service.retain({ ...state.payload, inputs: { ...state.payload.inputs, 'section.actor': clonedSource }, artifact: copied }).ok, true);
        assert.equal(state.service.authorize(copied, state.original).ok, false);
    } finally { f?.controller.dispose(); hook.deregister(); delete globalThis.latticeCompositionProofCapture; }
});

test('native Compose blocks private Text even when its connected text is unused by the template', async () => {
    const f = fixture(); addCompose(f);
    f.graph.nodes.privateText = { id: 'privateText', type: 'workflow', ...operationDefaults('read-file'), targetId: 'mara.md' };
    f.graph.nodes.compose.sections.push({ name: 'privateText', text: '', kind: 'text' });
    f.graph.nodes.compose.mode = 'template'; f.graph.nodes.compose.template = '{{section:public}}';
    f.graph.wires.privateText = { id: 'privateText', route: 'wire', from: 'privateText', fromPort: 'text', to: 'compose', toPort: 'section.privateText' };
    try {
        const ready = await f.start(); assert.equal(ready.ok, false); assert.equal(ready.error.code, 'ACTOR_GUIDANCE_UNVERIFIED', JSON.stringify(ready.error));
        assert.equal(Object.values(f.c.extensionPrompts).some(p => p.value), false);
        assert.equal(ready.reviewHandles.length, 0);
        assert.equal(f.c.chatMetadata.latticeDocuments, undefined);
    } finally { f.controller.dispose(); }
});

test('native composed guidance denies authentic other-actor and hidden contributions', async () => {
    for (const restricted of ['other-actor', 'hidden']) {
        const f = fixture(); addCompose(f);
        if (restricted === 'other-actor') {
            f.graph.nodes.direction.actorId = elias; f.graph.wires.present.from = 'elias';
        } else {
            assert.equal(f.catalog.define({ targetId: 'hidden.md', name: 'Hidden', format: 'text', content: 'Hidden source.', visibility: { kind: 'hidden' } }).ok, true);
            f.graph.nodes.hiddenRead = { id: 'hiddenRead', type: 'workflow', ...operationDefaults('read-file'), targetId: 'hidden.md' };
            f.graph.nodes.compose.sections.push({ name: 'hiddenSource', text: '' });
            f.graph.wires.hiddenInput = { id: 'hiddenInput', route: 'wire', from: 'hiddenRead', fromPort: 'text', to: 'compose', toPort: 'section.hiddenSource' };
        }
        try {
            const ready = await f.start(); assert.equal(ready.ok, false, restricted);
            assert.equal(Object.values(f.c.extensionPrompts).some(p => p.value), false, restricted);
            assert.equal(ready.reviewHandles.length, 0);
        } finally { f.controller.dispose(); }
    }
});

function addRecallCompose(f) {
    f.graph.nodes.compose = { id: 'compose', type: 'workflow', ...operationDefaults('compose'), outputKind: 'guidance', sections: [{ name: 'public', text: 'Public weather.' }, { name: 'memory', text: '', kind: 'guidance', onSkipped: 'omit' }] };
    f.graph.wires.guidance.to = 'compose'; f.graph.wires.guidance.toPort = 'section.memory';
    f.graph.wires.composed = { id: 'composed', route: 'wire', from: 'compose', fromPort: 'out', to: 'generate', toPort: 'guidance' };
}

test('composed Recall preview and rejection preserve queues without installing or settling effects', async () => {
    const f = recallFixture(); addRecallCompose(f);
    try {
        assert.equal(f.controller.queueRecall('hotkey').ok, true);
        const preview = await f.controller.runTarget(f.graph, { workflowId: f.graph.id, instancePath: [], nodeId: 'compose', portId: 'out' });
        assert.equal(preview.ok, true, JSON.stringify(preview.error));
        assert.equal(Object.values(f.c.extensionPrompts).some(p => p.value), false);
        assert.equal(preview.reviewHandles.length, 0);
        assert.equal(f.controller.statusRecall().data.shortcuts[0].queued, true);
        f.results.length = 0;
        assert.equal((await f.start()).ok, true);
        const result = await f.complete(); assert.equal(result.ok, true, JSON.stringify(result.error));
        assert.equal(f.controller.reject(result.reviewHandles[0]).ok, true);
        assert.equal(f.controller.statusRecall().data.shortcuts[0].queued, true);
        assert.equal(f.c.chatMetadata.latticeDocuments, undefined);
    } finally { f.controller.dispose(); }
});

test('composed Recall source mutation or cancellation during native admission revokes injection and pending claims', async () => {
    for (const mutation of ['tokenizer-source', 'setter-source', 'stop']) {
        let changed = false;
        let f;
        const mutate = async c => { changed = true; if (mutation === 'stop') await c.eventSource.emit('GENERATION_STOPPED'); else c.chatMetadata.latticeDocuments = { 'default-user': { 'moments.json': { content: 'Changed source.', revision: 1 } } }; };
        f = recallFixture({ onCount: async (text, c) => { if (!changed && text.startsWith('Public weather.') && mutation !== 'setter-source') await mutate(c); }, onPrompt: (text, c) => { if (!changed && text.startsWith('Public weather.') && mutation === 'setter-source') void mutate(c); } });
        addRecallCompose(f);
        try {
            assert.equal(f.controller.queueRecall('hotkey').ok, true);
            const ready = await f.start(); assert.equal(changed, true, mutation); assert.equal(ready.ok, false, mutation);
            assert.equal(Object.values(f.c.extensionPrompts).some(p => p.value), false, mutation);
            assert.equal(ready.reviewHandles.length, 0);
            assert.equal(f.controller.statusRecall().data.shortcuts[0].queued, true);
            assert.equal(f.controller.statusRecall().data.shortcuts[0].pendingCount, 0);
        } finally { f.controller.dispose(); }
    }
});

test('composition authorization reads own authorizer Results without getter execution or reentrant release admission', async () => {
    const { createNativeGuidanceComposition } = await import('../src/workflow/native-guidance-compose.js');
    const source = Object.freeze({ kind: 'guidance', text: 'Private.', visibility: { kind: 'actor-private', actorId: mara } });
    const registry = createNativeGuidanceComposition(); let reads = 0;
    const response = {}; Object.defineProperty(response, 'ok', { enumerable: true, get() { reads++; registry.clear(); return true; } });
    assert.equal(registry.authorize(source, () => response).ok, false);
    assert.equal(reads, 0);
    assert.equal(registry.authorize(source, () => { registry.clear(); return { ok: true }; }).ok, false);
});

test('Compose and Generate retain independent rendered budgets in native execution', async () => {
    for (const boundary of ['compose', 'generate']) {
        const f = fixture(); addCompose(f);
        f.graph.nodes.compose.budgetTokens = boundary === 'compose' ? 1 : 4096;
        f.graph.nodes.generate.budgetTokens = boundary === 'generate' ? 1 : 4096;
        try {
            const ready = await f.start(); assert.equal(ready.ok, false);
            assert.equal(ready.error.code, boundary === 'compose' ? 'COMPOSE_OVERFLOW' : 'GUIDANCE_OVERFLOW');
            assert.equal(ready.error.nodeId, boundary);
            assert.equal(Object.values(f.c.extensionPrompts).some(p => p.value), false);
        } finally { f.controller.dispose(); }
    }
});
