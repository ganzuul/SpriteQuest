import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createFileStore } from '../src/workflow/file-store.js';

const scope={userId:'default-user',chatId:'Story-2'};
const makeFixture = (acknowledged=true) => {
    let document={targetId:'sword',revision:0,format:'json',content:'{"souls":[]}',receipts:[]};
    let writes=0;
    const store=createFileStore({scope,authorizedTargets:['sword'],
        load:async targetId=>({ok:true,data:structuredClone(document)}),
        validateEvidence:async()=>({ok:true}),
        isCurrent:()=>true,
        compareAndSwap:async update=>{
            writes++;
            assert.equal(update.expectedRevision,document.revision);
            document={targetId:update.targetId,revision:document.revision+1,format:update.projectedDocument.format,content:update.projectedDocument.content,receipts:[...document.receipts,{intentId:update.intentId,fingerprint:update.fingerprint,revision:document.revision+1}]};
            return {ok:true,data:{applied:true,acknowledged,revision:document.revision}};
        },
    });
    return {store,readDocument:()=>structuredClone(document),writes:()=>writes,setDocument:value=>{document=structuredClone(value);}};
};
const addSoul={operation:'add-unique',collectionPath:'/souls',missingPath:'error',key:'eventId',records:[{eventId:'kill-1',victimId:'enemy-1'}]};
const options={intentId:'capture-kill-1',evidence:[{id:'scene-event-1',revision:'final-1'}]};

test('authorized reads prepare a reviewable update and only accepted root settlement writes once',async()=>{
    const fixture=makeFixture();
    const read=await fixture.store.read('sword');
    assert.equal(read.ok,true,JSON.stringify(read));
    const prepared=await fixture.store.prepare(read.data.fileRef,addSoul,options);
    assert.equal(prepared.ok,true,JSON.stringify(prepared));
    assert.equal(fixture.writes(),0);
    assert.equal(JSON.parse(prepared.data.plan.projectedDocument.content).souls.length,1);
    for(const controls of [{root:true,accepted:false},{root:false,accepted:true},{root:true,accepted:true,preview:true},{root:true,accepted:true,dryRun:true}]){
        assert.equal((await fixture.store.commit(prepared.data.handle,controls)).ok,false);
    }
    assert.equal(fixture.writes(),0);
    const written=await fixture.store.commit(prepared.data.handle,{root:true,accepted:true});
    assert.equal(written.ok,true,JSON.stringify(written));
    assert.equal(written.data.status,'confirmed');
    const replay=await fixture.store.commit(prepared.data.handle,{root:true,accepted:true});
    assert.equal(replay.ok,true);
    assert.equal(replay.data.status,'confirmed');
    assert.equal(replay.data.applied,false);
    assert.equal(fixture.writes(),1);
    assert.equal(JSON.parse(fixture.readDocument().content).souls.length,1);
});
test('imported or copied references cannot grant file or intent authority',async()=>{
    const fixture=makeFixture();
    assert.equal((await fixture.store.read('other')).ok,false);
    const read=await fixture.store.read('sword');
    const forged=await fixture.store.prepare(structuredClone(read.data.fileRef),addSoul,options);
    assert.equal(forged.ok,false);assert.equal(forged.error.code,'FILE_REFERENCE_UNAUTHORIZED');
    const prepared=await fixture.store.prepare(read.data.fileRef,addSoul,options);
    const written=await fixture.store.commit(structuredClone(prepared.data.handle),{root:true,accepted:true});
    assert.equal(written.ok,false);assert.equal(written.error.code,'FILE_INTENT_UNAUTHORIZED');
    assert.equal(fixture.writes(),0);
});

test('save without a durable acknowledgement remains unverified and blocks blind retry',async()=>{
    const fixture=makeFixture(false);
    const read=await fixture.store.read('sword');
    const prepared=await fixture.store.prepare(read.data.fileRef,addSoul,options);
    const saved=await fixture.store.commit(prepared.data.handle,{root:true,accepted:true});
    assert.equal(saved.ok,true);assert.equal(saved.data.status,'save-unverified');
    assert.equal(saved.data.applied,true);assert.equal(saved.data.acknowledged,false);
    const retry=await fixture.store.commit(prepared.data.handle,{root:true,accepted:true});
    assert.equal(retry.ok,false);assert.equal(retry.error.code,'PERSISTENCE_UNKNOWN');
    const latest=await fixture.store.read('sword');
    const next=await fixture.store.prepare(latest.data.fileRef,{...addSoul,records:[{eventId:'kill-2'}]},{...options,intentId:'capture-kill-2'});
    assert.equal(next.ok,true);
    assert.equal((await fixture.store.commit(next.data.handle,{root:true,accepted:true})).error.code,'PERSISTENCE_UNKNOWN');
    assert.equal(fixture.writes(),1);
});

test('stable intent identities cannot refer to different proposed content',async()=>{
    const fixture=makeFixture(),read=await fixture.store.read('sword');
    const first=await fixture.store.prepare(read.data.fileRef,addSoul,options);
    const same=await fixture.store.prepare(read.data.fileRef,structuredClone(addSoul),structuredClone(options));
    assert.equal(same.ok,true);assert.equal(same.data.handle,first.data.handle);
    const changed=await fixture.store.prepare(read.data.fileRef,{...addSoul,records:[{eventId:'different'}]},options);
    assert.equal(changed.ok,false);assert.equal(changed.error.code,'FILE_INTENT_CONFLICT');
    fixture.store.release();
    assert.equal((await fixture.store.commit(first.data.handle,{root:true,accepted:true})).error.code,'FILE_CAPTURE_RELEASED');
    assert.equal(fixture.writes(),0);
});
test('write receipts stay bounded so a readable large text document remains readable after settlement',async()=>{
    const fixture=makeFixture();
    fixture.setDocument({targetId:'sword',revision:0,format:'text',content:'a'.repeat(140000),receipts:[]});
    const read=await fixture.store.read('sword');
    assert.equal(read.ok,true);
    const prepared=await fixture.store.prepare(read.data.fileRef,{operation:'append-text',text:'b',separator:'',emptyPolicy:'omit',trailingSeparator:false},options);
    assert.equal(prepared.ok,true,JSON.stringify(prepared));
    const saved=await fixture.store.commit(prepared.data.handle,{root:true,accepted:true});
    assert.equal(saved.ok,true,JSON.stringify(saved));
    const reread=await fixture.store.read('sword');
    assert.equal(reread.ok,true,JSON.stringify(reread));
    assert.equal(reread.data.snapshot.content.length,140001);
});
test('settlement lifecycle controls are checked and captured before queued work',async()=>{
    const fixture=makeFixture(),read=await fixture.store.read('sword');
    const prepared=await fixture.store.prepare(read.data.fileRef,addSoul,options);
    for(const flags of [{root:true,accepted:true,preview:'true'},{root:true,accepted:true,dryRun:1},{root:true,accepted:true,extra:'allow'}]){
        assert.equal((await fixture.store.commit(prepared.data.handle,flags)).ok,false,'malformed controls cannot authorize persistence');
    }
    const flags={root:true,accepted:false};
    const queued=fixture.store.commit(prepared.data.handle,flags);
    flags.accepted=true;
    assert.equal((await queued).ok,false,'acceptance cannot change after queuing');
    assert.equal(fixture.writes(),0);
});
import { createChatDocumentBackend } from '../src/workflow/file-store.js';
test('chat metadata storage creates only the selected logical document and preserves other namespaces',async()=>{
    let saves=0;
    const chat=[];
    const context={chat,chatId:'Story-2',userId:'default-user',chatMetadata:{otherExtension:{keep:true},latticeDocuments:{'other-user':{archive:{content:'leave'}}}}};
    const backend=createChatDocumentBackend({scope,getContext:()=>context,saveMetadata:async()=>{saves++;return undefined;},initialDocuments:[{targetId:'sword',format:'json',content:'{"souls":[]}'}]});
    const store=createFileStore({scope,authorizedTargets:['sword'],...backend,validateEvidence:async()=>({ok:true}),isCurrent:()=>true});
    const read=await store.read('sword');assert.equal(read.ok,true,JSON.stringify(read));
    assert.equal(Object.hasOwn(context.chatMetadata.latticeDocuments,'default-user'),false,'read does not create a canonical document');
    const prepared=await store.prepare(read.data.fileRef,addSoul,options);
    const saved=await store.commit(prepared.data.handle,{root:true,accepted:true});
    assert.equal(saved.ok,true,JSON.stringify(saved));assert.equal(saved.data.status,'save-unverified');
    assert.equal(saves,1);
    assert.deepEqual(context.chatMetadata.otherExtension,{keep:true});
    assert.deepEqual(context.chatMetadata.latticeDocuments['other-user'],{archive:{content:'leave'}});
    assert.equal(JSON.parse(context.chatMetadata.latticeDocuments['default-user'].sword.content).souls.length,1);
    assert.equal(context.chatMetadata.latticeDocuments['default-user'].sword.scope.chatId,'Story-2');
});
test('an identical semantic duplicate has no file write or invented durable acknowledgement',async()=>{
    const fixture=makeFixture();
    fixture.setDocument({targetId:'sword',revision:0,format:'json',content:JSON.stringify({souls:addSoul.records}),receipts:[]});
    const read=await fixture.store.read('sword');
    const prepared=await fixture.store.prepare(read.data.fileRef,addSoul,options);
    assert.equal(prepared.ok,true);assert.equal(prepared.data.plan.receipt.changed,false);
    const saved=await fixture.store.commit(prepared.data.handle,{root:true,accepted:true});
    assert.equal(saved.ok,true,JSON.stringify(saved));assert.equal(saved.data.status,'unchanged');
    assert.equal(saved.data.applied,false);assert.equal(saved.data.acknowledged,false);
    assert.equal(fixture.writes(),0);
    assert.equal((await fixture.store.commit(prepared.data.handle,{root:true,accepted:true})).data.status,'unchanged');
});
test('file configuration admission does not evaluate getters or accept copied scope authority fields',async()=>{
    let reads=0;
    const unsafe={authorizedTargets:['sword'],load:async()=>({ok:true}),compareAndSwap:async()=>({ok:true}),validateEvidence:async()=>({ok:true}),isCurrent:()=>true};
    Object.defineProperty(unsafe,'scope',{enumerable:true,get(){reads++;return scope;}});
    const store=createFileStore(unsafe);
    assert.equal((await store.read('sword')).ok,false);assert.equal(reads,0);
    const copied=createFileStore({...unsafe,scope:{...scope,authority:'model-authored'}});
    assert.equal((await copied.read('sword')).ok,false);
});
test('revision and same-version content conflicts hold the entire prepared projection',async()=>{
    for(const change of [{revision:1,content:'{"souls":[],"other":"new"}'},{revision:0,content:'{"souls":[],"other":"same-version-edit"}'}]){
        const fixture=makeFixture(),read=await fixture.store.read('sword');
        const prepared=await fixture.store.prepare(read.data.fileRef,addSoul,options);
        fixture.setDocument({...fixture.readDocument(),...change});
        const settled=await fixture.store.commit(prepared.data.handle,{root:true,accepted:true});
        assert.equal(settled.ok,false);assert.equal(settled.error.code,'FILE_REVISION_CONFLICT');
        assert.equal(fixture.writes(),0);assert.equal(fixture.readDocument().content,change.content);
    }
});

test('native logical-document access rejects user/chat switches and missing creation templates',async()=>{
    const context={chat:[],chatId:'Story-2',userId:'default-user',chatMetadata:{}};
    const backend=createChatDocumentBackend({scope,getContext:()=>context,saveMetadata:async()=>true});
    assert.equal((await backend.load('missing')).error.code,'FILE_NOT_FOUND');
    context.userId='other-user';assert.equal((await backend.load('missing')).error.code,'STALE_FILE_SCOPE');
    context.userId='default-user';context.chat=[];assert.equal((await backend.load('missing')).error.code,'STALE_FILE_SCOPE');
    assert.deepEqual(context.chatMetadata,{});
});

test('concurrent accepted calls serialize one stable intent without duplicate writes',async()=>{
    const fixture=makeFixture(),read=await fixture.store.read('sword');
    const prepared=await fixture.store.prepare(read.data.fileRef,addSoul,options);
    const results=await Promise.all([fixture.store.commit(prepared.data.handle,{root:true,accepted:true}),fixture.store.commit(prepared.data.handle,{root:true,accepted:true})]);
    assert.equal(results.every(result=>result.ok),true);assert.equal(fixture.writes(),1);
    assert.deepEqual(results.map(result=>result.data.applied),[true,false]);
});

test('a CAS exception preserves unknown application and a save barrier',async()=>{
    let writes=0;
    const document={targetId:'sword',revision:0,format:'json',content:'{"souls":[]}',receipts:[]};
    const store=createFileStore({scope,authorizedTargets:['sword'],isCurrent:()=>true,load:async()=>({ok:true,data:document}),validateEvidence:async()=>({ok:true}),compareAndSwap:async()=>{writes++;throw new Error('Unknown host outcome.');}});
    const read=await store.read('sword'),prepared=await store.prepare(read.data.fileRef,addSoul,options);
    const first=await store.commit(prepared.data.handle,{root:true,accepted:true});
    assert.equal(first.ok,true);assert.equal(first.data.status,'unknown');assert.equal(first.data.applied,null);
    assert.equal((await store.commit(prepared.data.handle,{root:true,accepted:true})).error.code,'PERSISTENCE_UNKNOWN');assert.equal(writes,1);
});

test('cancellation and final source invalidation prevent a native file save',async()=>{
    const controller=new AbortController();let writes=0;
    const document={targetId:'sword',revision:0,format:'json',content:'{"souls":[]}',receipts:[]};
    const store=createFileStore({scope,authorizedTargets:['sword'],signal:controller.signal,isCurrent:()=>true,load:async()=>({ok:true,data:document}),validateEvidence:async()=>{controller.abort();return {ok:true};},compareAndSwap:async()=>{writes++;return {ok:true,data:{applied:true,acknowledged:true,revision:1}};}});
    const read=await store.read('sword'),prepared=await store.prepare(read.data.fileRef,addSoul,options);
    assert.equal((await store.commit(prepared.data.handle,{root:true,accepted:true})).error.code,'CANCELLED');assert.equal(writes,0);
});
test('malformed CAS outcomes block exact and different later intents on the target',async()=>{
    for(const malformed of [undefined,{ok:true,error:{code:'BAD',message:'Contradictory result'}},{ok:false,error:{code:'BAD'}}]){
        let writes=0,document={targetId:'sword',revision:0,format:'json',content:'{"souls":[]}',receipts:[]};
        const store=createFileStore({scope,authorizedTargets:['sword'],load:async()=>({ok:true,data:document}),validateEvidence:async()=>({ok:true}),isCurrent:()=>true,
            compareAndSwap:async update=>{writes++;document={...document,revision:document.revision+1,content:update.projectedDocument.content};return malformed;}});
        const first=await store.prepare((await store.read('sword')).data.fileRef,addSoul,options);
        assert.equal((await store.commit(first.data.handle,{root:true,accepted:true})).ok,false);
        assert.equal((await store.commit(first.data.handle,{root:true,accepted:true})).error.code,'PERSISTENCE_UNKNOWN');
        const second=await store.prepare((await store.read('sword')).data.fileRef,{...addSoul,records:[{eventId:'kill-2'}]},{...options,intentId:'capture-kill-2'});
        assert.equal((await store.commit(second.data.handle,{root:true,accepted:true})).error.code,'PERSISTENCE_UNKNOWN');assert.equal(writes,1);
    }
});

test('real logical-document backend can append to and reread a large admitted text document',async()=>{
    let saves=0;const context={chat:[],chatId:'Story-2',userId:'default-user',chatMetadata:{}};
    const backend=createChatDocumentBackend({scope,getContext:()=>context,saveMetadata:async()=>{saves++;return true;},initialDocuments:[{targetId:'sword',format:'text',content:'a'.repeat(140000)}]});
    const store=createFileStore({scope,authorizedTargets:['sword'],...backend,validateEvidence:async()=>({ok:true}),isCurrent:()=>true});
    const read=await store.read('sword');assert.equal(read.ok,true);
    const prepared=await store.prepare(read.data.fileRef,{operation:'append-text',text:'b',separator:'',emptyPolicy:'omit',trailingSeparator:false},options);assert.equal(prepared.ok,true);
    const saved=await store.commit(prepared.data.handle,{root:true,accepted:true});assert.equal(saved.ok,true,JSON.stringify(saved));assert.equal(saved.data.status,'confirmed');
    assert.equal(saves,1);assert.equal((await store.read('sword')).data.snapshot.content.length,140001);
});
