import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createNativeWorkflowController } from '../src/workflow/host.js?v=0.26.0';
import { createChatDocumentCatalog } from '../src/workflow/document-catalog.js?v=0.26.0';
import { operationDefaults } from '../src/workflow/catalog.js?v=0.26.0';
const nextTurn = () => new Promise(resolve => setTimeout(resolve, 10));
function unifiedGraph({ guidance = false, revise = true } = {}) {
    const nodes = { send: { id: 'send', type: 'workflow', operation: 'on-send' }, generate: { id: 'generate', type: 'workflow', operation: 'generate-reply' }, review: { id: 'review', type: 'workflow', operation: 'review-publish' } };
    const wires = { activation: { id: 'activation', route: 'wire', from: 'send', fromPort: 'activation', to: 'generate', toPort: 'activation' } };
    if (revise) nodes.revise = { id: 'revise', type: 'workflow', operation: 'revise-draft', scope: 'whole', instructions: 'Tighten prose.' };
    wires.reply = { id: 'reply', route: 'wire', from: 'generate', fromPort: 'draft', to: revise ? 'revise' : 'review', toPort: 'draft' };
    if (revise) wires.review = { id: 'review', route: 'wire', from: 'revise', fromPort: 'out', to: 'review', toPort: 'draft' };
    if (guidance) { nodes.guide = { id: 'guide', type: 'workflow', operation: 'compose', outputKind: 'guidance', sections: [{ name: 'Style', text: 'Use vivid prose.' }] }; wires.guidance = { id: 'guidance', route: 'wire', from: 'guide', fromPort: 'out', to: 'generate', toPort: 'guidance' }; }
    return { id: 'unified', name: 'Unified test', schema: 3, runtime: 2, mode: 'native-unified', nodes, wires, portals: {}, definitions: {} };
}
function nativeFixture(graph = unifiedGraph(), options = {}) {
    const listeners = new Map(), events = [], results = [];
    const c = { chatId: 'story', characterId: 0, groupId: null, characters: [{ data: { name: 'Mara' } }], chat: [{ mes: 'I open the door.', is_user: true, extra: {} }], extensionPrompts: {}, eventTypes: Object.fromEntries(['GENERATION_STARTED', 'GENERATION_STOPPED', 'GENERATION_ENDED', 'MESSAGE_RECEIVED', 'MESSAGE_SENT', 'CHAT_CHANGED', 'MESSAGE_EDITED', 'MESSAGE_UPDATED', 'MESSAGE_DELETED', 'MESSAGE_SWIPED', 'MESSAGE_SWIPE_DELETED'].map(name => [name, name])) };
    c.eventSource = { on(name, fn) { const bucket = listeners.get(name) ?? []; bucket.push(fn); listeners.set(name, bucket); }, removeListener(name, fn) { listeners.set(name, (listeners.get(name) ?? []).filter(value => value !== fn)); }, async emit(name, ...args) { for (const listener of listeners.get(name) ?? []) await listener(...args); } };
    c.setExtensionPrompt = (key, value) => { c.extensionPrompts[key] = { value }; };
    c.saveChat = async () => {}; c.updateMessageBlock = async () => {}; c.swipe = { refresh: async () => {} };
    let busy = false, user = 'default-user', requests = 0;
    const controller = createNativeWorkflowController({ ...options.ports, context: () => c, getGraph: phase => phase === 'unified' ? graph : undefined, isEnabled: () => true, userId: () => user, isBusy: () => busy, countTokens: options.countTokens ?? (async text => ({ tokens: Math.ceil(text.length / 4) })), resolveBinding: options.resolveBinding ?? (() => ({ ok: true, data: { profileId: 'fixed', model: 'test' } })), request: options.request ?? (async () => { requests++; return { ok: true, data: { text: 'Revised reply.', finish: 'stop' } }; }), onEvent: event => events.push(event), onResult: result => results.push(result), syncMesToSwipe(index) { const m = c.chat[index]; m.swipes[m.swipe_id] = m.mes; return true; }, syncSwipeToMes(index, swipeId) { const m = c.chat[index]; m.swipe_id = swipeId; m.mes = m.swipes[swipeId]; Object.assign(m, structuredClone(m.swipe_info[swipeId])); return true; } });
    controller.subscribe();
    return { c, controller, events, results, setBusy(value) { busy = value; }, setUser(value) { user = value; }, requests: () => requests, async start(type = 'normal') { busy = true; await c.eventSource.emit('GENERATION_STARTED', type, {}, false); return controller.beforeGenerate(c.chat.map(message => ({ ...message })), 8192, options.abort ?? (() => {}), type); } };
}
function addReply(f, { normalized = true, text = 'Native reply.' } = {}) {
    const now = new Date().toISOString(), m = { mes: text, is_user: false, extra: {}, gen_started: now, gen_finished: now };
    if (normalized) Object.assign(m, { swipe_id: 0, swipes: [text], swipe_info: [{ gen_started: now, gen_finished: now, extra: {} }] });
    f.c.chat.push(m); return m;
}
async function settled(f) { for (let tries = 0; tries < 30 && !f.results.length; tries++) await nextTurn(); assert.equal(f.results.length, 1, 'Owned continuation must settle promptly'); return f.results[0]; }

function consequenceGraph({memory=false,twoFiles=false,revise=false,notes=false,notesText='Native reply.'}={}) {
    const graph=unifiedGraph({revise});
    const node=(id,operation,extra={})=>({id,type:'workflow',...operationDefaults(operation,extra.mode?{mode:extra.mode}:{}),...extra});
    const wire=(id,from,fromPort,to,toPort)=>graph.wires[id]={id,route:'wire',from,fromPort,to,toPort};
    if(notes){graph.nodes.notes=node('notes','text',{text:notesText});graph.nodes.append=node('append','append');wire('note-draft',revise?'revise':'generate',revise?'out':'draft','append','draft');wire('note-section','notes','out','append','section');graph.wires[revise?'review':'reply'].from='append';graph.wires[revise?'review':'reply'].fromPort='out';}
    if(memory){graph.nodes.state=node('state','memory',{phase:'post'});graph.nodes.events=node('events','memory',{view:'events',phase:'post'});graph.nodes.track=node('track','state',{mode:'track',phase:'post'});graph.nodes.commit=node('commit','memory',{mode:'commit'});wire('state','state','out','track','state');wire('events','events','out','track','events');wire('commit','track','out','commit','proposal');}
    else {
        graph.nodes.body=node('body','draft-text');wire('body','generate','draft','body','draft');
        for(const id of twoFiles?['one','two']:['one']){graph.nodes['read'+id]=node('read'+id,'read-file',{targetId:id+'.txt'});graph.nodes['write'+id]=node('write'+id,'write-file',{mode:'append'});wire('ref'+id,'read'+id,'reference','write'+id,'reference');wire('text'+id,'body','out','write'+id,'text');}
    }
    return graph;
}
function consequenceFixture(options={}) {
    let catalog,saves=0,chatSaves=0,models=0,failSecond=options.failSecond;
    const f=nativeFixture(consequenceGraph(options),{request:async()=>{models++;return {ok:true,data:{text:options.revisedText??'Rewritten reply.',finish:'stop'}};},ports:{documentCatalog:{capture:()=>catalog.capture()},persistenceVerifier:{saveAndVerify:async selection=>{saves++;await options.onSave?.(selection,f.c);if(selection.targetId==='two.txt'&&failSecond){failSecond=false;return {ok:false,error:{code:'DISK_UNAVAILABLE',message:'No save'}};}return {ok:true,data:{acknowledged:options.acknowledged!==false}};}}}});
    f.c.characters[0].avatar='mara.png';f.c.chatMetadata={unrelated:{keep:true}};f.c.saveMetadata=async()=>{saves++;return true;};f.c.saveChat=async()=>{chatSaves++;};
    catalog=createChatDocumentCatalog({getContext:()=>f.c,getUserId:()=> 'default-user'});
    for(const id of options.twoFiles?['one','two']:['one'])assert.equal(catalog.define({targetId:id+'.txt',name:id,format:'text',content:'Prior',visibility:{kind:'public'}}).ok,true);
    return {...f,catalog,saves:()=>saves,chatSaves:()=>chatSaves,models:()=>models,async complete(){const prepared=await f.start();assert.equal(prepared.ok,true,JSON.stringify(prepared.error));addReply(f);await f.c.eventSource.emit('MESSAGE_RECEIVED',1,'normal');f.setBusy(false);await f.c.eventSource.emit('GENERATION_ENDED',2);return settled(f);}};
}
test('native file staging retains review authority and saves only after original-preserving acceptance',async()=>{
    const f=consequenceFixture(),result=await f.complete();assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(f.saves(),0);assert.equal(f.c.chatMetadata.latticeDocuments,undefined);
    const accepted=await f.controller.apply(result.reviewHandles[0]);assert.equal(accepted.ok,true,JSON.stringify(accepted.error));assert.equal(accepted.settlement.status,'settled');assert.equal(f.saves(),1);assert.equal(f.chatSaves(),1);assert.deepEqual(f.c.chat[1].swipes,['Native reply.','Native reply.']);assert.equal(f.c.chatMetadata.latticeDocuments['default-user']['one.txt'].content,'Prior\nNative reply.');assert.deepEqual(f.c.chatMetadata.unrelated,{keep:true});
    assert.equal((await f.controller.apply(result.reviewHandles[0])).ok,true);assert.equal(f.saves(),1);assert.equal(f.chatSaves(),1);
});
test('all native file targets preflight before publication and cancellation releases retained review',async()=>{
    const f=consequenceFixture(),result=await f.complete();assert.equal(result.ok,true,JSON.stringify(result.error));f.catalog.remove('one.txt');const accepted=await f.controller.apply(result.reviewHandles[0]);assert.equal(accepted.ok,false);assert.equal(f.chatSaves(),0);assert.equal(f.saves(),0);assert.equal(f.c.chat[1].swipes.length,1);
    const g=consequenceFixture(),review=await g.complete();g.controller.cancel();assert.equal((await g.controller.apply(review.reviewHandles[0])).ok,false);assert.equal(g.saves(),0);
});
test('unified memory stays read-only through review and validates final body before publication',async()=>{
    for(const revise of [false,true]){const f=consequenceFixture({memory:true,revise}),result=await f.complete();assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(f.saves(),0);const accepted=await f.controller.apply(result.reviewHandles[0]);if(revise){assert.equal(accepted.error.code,'FINAL_EVIDENCE_REEXTRACT_REQUIRED');assert.equal(f.chatSaves(),0);assert.equal(f.saves(),0);}else{assert.equal(accepted.ok,true,JSON.stringify(accepted.error));assert.equal(accepted.settlement.status,'settled');assert.equal(f.saves(),1);assert.equal(f.c.chat[1].swipes.length,2);}}
});
test('owned native portrayal excludes private prior context from the public Draft and review recording',async()=>{
    const f=nativeFixture(unifiedGraph({revise:false}));f.c.chat[0].mes='PRIVATE PRIOR GUIDANCE';f.c.chat[0].visibleTo=['mara'];const prepared=await f.start();assert.equal(prepared.ok,true);addReply(f);await f.c.eventSource.emit('MESSAGE_RECEIVED',1,'normal');f.setBusy(false);await f.c.eventSource.emit('GENERATION_ENDED',2);const result=await settled(f);assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(result.reviewHandles.length,1);assert.equal(JSON.stringify(result.recording).includes('PRIVATE PRIOR GUIDANCE'),false);
});
test('manual unified Read File target acquires catalog scope without acquiring native generation',async()=>{
    const f=consequenceFixture(),result=await f.controller.runTarget(consequenceGraph(),{workflowId:'unified',instancePath:[],nodeId:'readone',portId:'text'});assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(f.saves(),0);assert.equal(result.reviewHandles.length,0);assert.equal(JSON.stringify(result.recording).includes('Prior'),true);
});
test('an explicitly restricted current native reply cannot become a public review candidate',async()=>{
    const f=nativeFixture(unifiedGraph({revise:false}));assert.equal((await f.start()).ok,true);const m=addReply(f);m.visibleTo=['mara'];await f.c.eventSource.emit('MESSAGE_RECEIVED',1,'normal');f.setBusy(false);await f.c.eventSource.emit('GENERATION_ENDED',2);const result=await settled(f);assert.equal(result.ok,false);assert.equal(result.error.code,'PRIVATE_MATERIAL');assert.equal(result.reviewHandles.length,0);
});
test('partial native file recovery retries only the failed target without model or publication reruns',async()=>{
    let conflict=true;const f=consequenceFixture({twoFiles:true,revise:true,onSave:(selection,c)=>{if(selection.targetId==='one.txt'&&conflict){conflict=false;c.chatMetadata.latticeDocuments['default-user']['two.txt']={targetId:'two.txt',revision:1,format:'text',content:'Concurrent text',receipts:[],scope:{userId:'default-user',chatId:'story'}};}}});
    const result=await f.complete();assert.equal(result.ok,true,JSON.stringify(result.error));const first=await f.controller.apply(result.reviewHandles[0]);assert.equal(first.ok,true,JSON.stringify(first.error));assert.equal(first.settlement.status,'partial');assert.equal(f.models(),1);assert.equal(f.saves(),1);assert.equal(f.chatSaves(),1);assert.equal(f.controller.candidateStatus(result.reviewHandles[0]).persistOnly,true);
    delete f.c.chatMetadata.latticeDocuments['default-user']['two.txt'];const retry=await f.controller.retryPersistence(result.reviewHandles[0]);assert.equal(retry.ok,true,JSON.stringify(retry.error));assert.equal(retry.settlement.status,'settled');assert.equal(f.saves(),2);assert.equal(f.models(),1);assert.equal(f.chatSaves(),1);assert.equal(f.c.chatMetadata.latticeDocuments['default-user']['one.txt'].revision,1);assert.equal(f.c.chatMetadata.latticeDocuments['default-user']['two.txt'].revision,1);
});
test('unknown native file save is retained as unverified and bars new writes to that target',async()=>{
    const f=consequenceFixture({acknowledged:false}),result=await f.complete();const accepted=await f.controller.apply(result.reviewHandles[0]);assert.equal(accepted.ok,true,JSON.stringify(accepted.error));assert.equal(accepted.settlement.status,'save-unverified');assert.equal(f.saves(),1);assert.equal((await f.controller.retryPersistence(result.reviewHandles[0])).error.code,'PERSISTENCE_RECOVERY_UNAVAILABLE');assert.equal((await f.controller.apply(result.reviewHandles[0])).ok,true);assert.equal(f.saves(),1);assert.equal(f.chatSaves(),1);
    const later=await f.controller.runTarget(consequenceGraph(),{workflowId:'unified',instancePath:[],nodeId:'readone',portId:'text'});assert.equal(later.ok,false);assert.equal(later.error.code,'PERSISTENCE_UNKNOWN');assert.equal(f.saves(),1);
});
test('rejecting a retained file review revokes every write capability',async()=>{
    const f=consequenceFixture(),result=await f.complete();assert.equal(f.controller.reject(result.reviewHandles[0]).ok,true);assert.equal((await f.controller.apply(result.reviewHandles[0])).ok,false);assert.equal(f.saves(),0);assert.equal(f.chatSaves(),0);
});
test('appended notes cannot authorize memory evidence removed from the final narrative',async()=>{
    const f=consequenceFixture({memory:true,revise:true,notes:true}),result=await f.complete();assert.equal(result.ok,true,JSON.stringify(result.error));const accepted=await f.controller.apply(result.reviewHandles[0]);assert.equal(accepted.error.code,'FINAL_EVIDENCE_REEXTRACT_REQUIRED');assert.equal(f.chatSaves(),0);assert.equal(f.saves(),0);assert.deepEqual(f.c.chat[1].swipes,['Native reply.']);
});
test('manual unified Write File target returns staged preview and releases it without any native save',async()=>{
    const f=consequenceFixture(),graph=consequenceGraph();addReply(f);graph.nodes.snapshot={id:'snapshot',type:'workflow',operation:'reply-snapshot'};graph.wires.body.from='snapshot';graph.wires.body.fromPort='out';
    const result=await f.controller.runTarget(graph,{workflowId:'unified',instancePath:[],nodeId:'writeone',portId:'receipt'});assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(JSON.stringify(result.recording).includes('FILE_INTENT_STAGED'),true);assert.equal(result.reviewHandles.length,0);assert.equal(f.saves(),0);assert.equal(f.c.chatMetadata.latticeDocuments,undefined);
});
test('large appended presentation notes do not change bounded canonical memory evidence',async()=>{
    const f=consequenceFixture({memory:true,notes:true,notesText:'N'.repeat(5000)}),result=await f.complete();assert.equal(result.ok,true,JSON.stringify(result.error));const accepted=await f.controller.apply(result.reviewHandles[0]);assert.equal(accepted.ok,true,JSON.stringify(accepted.error));assert.equal(accepted.settlement.status,'settled');assert.equal(f.saves(),1);
});
