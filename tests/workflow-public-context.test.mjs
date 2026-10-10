import assert from 'node:assert/strict';
import test from 'node:test';
import {snapshotContext,createNativeWorkflowController} from '../src/workflow/host.js';
import {describeOperation,operationDefaults,semanticControlsForNode} from '../src/workflow/catalog.js';
import {computeDefinitionIdentity} from '../src/workflow/definitions.js';
import {artifactVisibility} from '../src/workflow/artifact-privacy.js';
import {starterGraph} from '../src/workflow/starters.js';
import {unifiedRecipeHost} from './helpers/unified-recipe-host.mjs';
const response=text=>({ok:true,data:{text:typeof text==='string'?text:JSON.stringify(text),finish:'stop'}});
const publicNode={visibilityMode:'public'};
const context=()=>({chatId:'Story-2',characterId:0,groupId:null,characters:[{avatar:'mara.png',data:{name:'Mara',description:'A public card.'}}],chat:[{is_user:true,mes:'Mara enters.'},{is_user:false,mes:'She finds a brass key.'}]});

test('public Scene Context includes unmarked host text without actor visibility labels',()=>{
 const c=context(),snapshot=snapshotContext(c,{node:publicNode,visibilityActorId:'character:mara.png'});
 assert.equal(snapshot.ok,undefined);assert.deepEqual(snapshot.messages.map(m=>m.text),['Mara','A public card.','Mara enters.','She finds a brass key.']);
 assert.ok(snapshot.messages.every(m=>!Object.hasOwn(m,'visibleTo')));assert.equal(Object.hasOwn(snapshot.source,'actorId'),false);assert.deepEqual(artifactVisibility(snapshot),{kind:'public'});assert.ok(Object.isFrozen(snapshot));
});

test('public Scene Context omits explicitly restricted messages and card without copying their text or labels',()=>{
 const c=context();c.chat[0].visibleTo=['character:mara.png'];c.characters[0].data.visibleTo=['character:mara.png'];
 const before=structuredClone(c),snapshot=snapshotContext(c,{node:publicNode,visibilityActorId:'character:mara.png'});
 assert.deepEqual(snapshot.messages.map(m=>m.text),['She finds a brass key.']);assert.deepEqual(artifactVisibility(snapshot),{kind:'public'});
 assert.deepEqual(snapshot.report.omissions,[{id:'chat:0',reason:'restricted visibility'},{id:'character:name',reason:'restricted visibility'},{id:'character:description',reason:'restricted visibility'}]);
 assert.equal(JSON.stringify(snapshot).includes('A public card.'),false);assert.equal(JSON.stringify(snapshot).includes('character:mara.png'),false);assert.deepEqual(c,before);
});

test('public Scene Context counts only admitted whole messages and reports restricted oversize sources',()=>{
 const c=context();c.chat=[{mes:'PUBLIC',is_user:true},{mes:'SECRET'.repeat(20000),visibleTo:[],is_user:false}];c.characters[0].data={description:'PRIVATE'.repeat(20000),visibleTo:['mara']};
 const snapshot=snapshotContext(c,{node:publicNode});assert.equal(snapshot.ok,undefined);assert.deepEqual(snapshot.messages.map(m=>m.text),['PUBLIC']);
 assert.deepEqual(snapshot.report.omissions,[{id:'chat:1',reason:'restricted visibility'},{id:'character:description',reason:'restricted visibility'}]);
 assert.equal(snapshotContext(c,{node:publicNode,chat:[{mes:'x'.repeat(100001),is_user:true}]}).error.code,'INPUT_LIMIT');
});

for(const source of ['chat','character'])for(const invalid of ['malformed','accessor'])test('public Scene Context rejects '+source+' '+invalid+' visibility without invoking accessors',()=>{
 const c=context(),material=source==='chat'?c.chat[0]:c.characters[0].data;let reads=0;
 if(invalid==='malformed')material.visibleTo='mara';else Object.defineProperty(material,'visibleTo',{enumerable:true,get(){reads++;return ['mara'];}});
 assert.equal(snapshotContext(c,{node:publicNode}).error.code,'INVALID_CONTEXT_VISIBILITY');assert.equal(reads,0);
});

test('default actor Scene Context retains the existing Perspective visibility contract',()=>{
 const c=context();c.chat[1].visibleTo=['other'];
 for(const node of [{},{visibilityMode:'actor'}]){const snapshot=snapshotContext(c,{node,visibilityActorId:'mara'});assert.deepEqual(snapshot.messages.slice(-2).map(m=>m.visibleTo),[['mara'],['other']]);assert.equal(snapshot.source.actorId,'mara');assert.equal(artifactVisibility(snapshot).kind,'hidden');}
});

test('Scene Context visibility mode is checked own metadata and offered as an enum',()=>{
 const graph=starterGraph('native-guidance'),node={id:'scene',type:'workflow',operation:'scene-context'};
 const descriptor=describeOperation(graph,node).data.descriptor;assert.deepEqual(descriptor.controlDescriptors.visibilityMode,{type:'enum',values:['actor','public'],default:'actor',label:'Context visibility'});
 for(const mode of ['all',null,1])assert.equal(describeOperation(graph,{...node,visibilityMode:mode}).error.code,'INVALID_SETTINGS');
 let reads=0;const unsafe={...node,get visibilityMode(){reads++;return 'public';}};
 assert.equal(describeOperation(graph,unsafe).error.code,'INVALID_SETTINGS');assert.equal(snapshotContext(context(),{node:unsafe}).error.code,'INVALID_CONTEXT_VISIBILITY');assert.equal(reads,0);
});

test('default actor mode preserves prior semantic controls and pinned definition content',()=>{
 const node={id:'scene',type:'workflow',operation:'scene-context'},body={schema:3,runtime:2,mode:'native-pre',nodes:{scene:node},wires:{},portals:{},roles:{}};
 const definition={id:'scene-helper',name:'Scene helper',version:1,interface:[],parameters:[],body};
 const old=computeDefinitionIdentity(definition);assert.equal(old.ok,true);assert.equal(old.data.semanticHash,'sha256:c5a893033679e629fa6c3252ac931a96b26c10f4b2aae9a87d2bee3cda7b75ca');const oldControls={includeCharacter:true,recentMessages:12};
 assert.deepEqual(JSON.parse(old.data.canonicalContent).body.nodes.scene.controls,oldControls);assert.equal(Object.hasOwn(old.data.materializedDefinition.body.nodes.scene,'visibilityMode'),false);
 assert.deepEqual(semanticControlsForNode(node),{recentMessages:12,includeCharacter:true});
 const actor=computeDefinitionIdentity({...definition,body:{...body,nodes:{scene:{...node,visibilityMode:'actor'}}}});
 const pub=computeDefinitionIdentity({...definition,body:{...body,nodes:{scene:{...node,visibilityMode:'public'}}}});
 assert.equal(actor.data.semanticHash,old.data.semanticHash);assert.notEqual(pub.data.semanticHash,old.data.semanticHash);assert.equal(pub.data.materializedDefinition.body.nodes.scene.visibilityMode,'public');
});

test('native public Scene Context does not invoke the selected actor callback',async()=>{
 const c=context(),graph=starterGraph('native-guidance');let actorReads=0;
 graph.nodes['scene-context'].visibilityMode='public';const controller=createNativeWorkflowController({context:()=>c,isBusy:()=>false,selectIntrospectionActor(){actorReads++;throw Error('actor selection is unnecessary');}});
 const result=await controller.runTarget(graph,{workflowId:graph.id,instancePath:[],nodeId:'scene-context',portId:'out'});
 assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(actorReads,0);const snapshot=result.recording.artifacts.find(a=>a.kind==='context').value;assert.deepEqual(artifactVisibility(snapshot),{kind:'public'});controller.dispose();
});

for(const source of ['chat','character'])for(const replacement of ['restricted','accessor'])test('native public '+source+' '+replacement+' visibility change rejects an awaited source',async()=>{
 const c=context(),graph=starterGraph('native-guidance');graph.nodes['scene-context'].visibilityMode='public';graph.nodes['smart-compactor'].method='select';
 let entered,release,reads=0;const ready=new Promise(r=>entered=r),wait=new Promise(r=>release=r);
 const controller=createNativeWorkflowController({context:()=>c,isBusy:()=>false,countTokens:async()=>({tokens:1,method:'fixture'}),resolveBinding:()=>({ok:true,data:{profileId:'fixture',model:'fixture'}}),request:async()=>{entered();await wait;return response('Public plan.');}});
 const pending=controller.runPre(graph);const early=await Promise.race([ready.then(()=>null),pending]);assert.equal(early,null,JSON.stringify(early?.error));const material=source==='chat'?c.chat[0]:c.characters[0].data;
 if(replacement==='restricted')material.visibleTo=['mara'];else Object.defineProperty(material,'visibleTo',{enumerable:true,get(){reads++;return ['mara'];}});
 release();const result=await pending;assert.equal(result.ok,false);assert.equal(result.error.code,'STALE_SOURCE');assert.equal(reads,0);controller.dispose();
});

function notesGraph(mode){
 const graph=starterGraph('unified-basic');const make=(id,operation,controls={})=>({...operationDefaults(operation),id,type:'workflow',...controls});
 Object.assign(graph.nodes,{scene:make('scene','scene-context',{visibilityMode:mode}),extract:make('extract','extract',{mode:'literal',patterns:[{id:'key',label:'Brass key',literal:'brass key'}]}),enrich:make('enrich','enrich'),notes:make('notes','render-notes'),append:make('append','append')});
 const wire=(id,from,fromPort,to,toPort)=>({id,route:'wire',from,fromPort,to,toPort});delete graph.wires.draft;
 for(const [id,from,fromPort,to,toPort]of [['extract','generate-reply','draft','extract','source'],['records','extract','out','enrich','data'],['context','scene','out','enrich','context'],['notes','enrich','out','notes','data'],['section','notes','out','append','section'],['body','generate-reply','draft','append','draft'],['review','append','out','review-publish','draft']])graph.wires[id]=wire(id,from,fromPort,to,toPort);
 return graph;
}

test('actual native public Scene Context supports Enrich to Render Notes to one reviewed reply',async()=>{
 for(const mode of ['actor','public']){
  let transmitted;const f=unifiedRecipeHost(notesGraph(mode),{request:async options=>{transmitted=JSON.parse(options.messages[1].content);return response([{id:'key:13',details:'A generated warm metallic glint.'}]);}});
  const result=await f.generate('Mara finds a brass key.');
  if(mode==='actor'){assert.equal(result.ok,false);assert.equal(result.error.code,'ACTOR_MODEL_SCOPE');assert.equal(f.calls(),0);assert.equal(result.reviewHandles.length,0);}else{
   assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(f.calls(),1);assert.equal(f.saves(),0);assert.equal(result.reviewHandles.length,1);assert.deepEqual(artifactVisibility(transmitted.context),{kind:'public'});
   assert.equal(f.c.chat.at(-1).mes,'Mara finds a brass key.');const accepted=await f.controller.apply(result.reviewHandles[0]);assert.equal(accepted.ok,true,JSON.stringify(accepted.error));assert.match(f.c.chat.at(-1).mes,/<details>/);assert.match(f.c.chat.at(-1).mes,/Generated proposal/);assert.equal(f.c.chat.at(-1).swipes[0],'Mara finds a brass key.');
  }f.controller.dispose();
 }
});


for(const source of ['chat','character'])for(const label of [{kind:'hidden'},{kind:'actor-private',actorId:'mara'}])test('public '+source+' omits explicit '+label.kind+' visibility without relabeling',()=>{
 const c=context(),material=source==='chat'?c.chat[0]:c.characters[0].data;material.visibility=label;const before=structuredClone(c),snapshot=snapshotContext(c,{node:publicNode});
 assert.equal(snapshot.ok,undefined);assert.deepEqual(artifactVisibility(snapshot),{kind:'public'});assert.equal(snapshot.messages.some(m=>m.text===material.mes||m.text==='A public card.'&&source==='character'),false);assert.ok(snapshot.report.omissions.some(o=>o.id===(source==='chat'?'chat:0':'character:description')&&o.reason==='restricted visibility'));assert.deepEqual(c,before);
});

for(const source of ['chat','character'])for(const invalid of ['malformed','accessor','nested-accessor'])test('public '+source+' rejects '+invalid+' disclosure labels without invoking getters',()=>{
 const c=context(),material=source==='chat'?c.chat[0]:c.characters[0].data;let reads=0;
 if(invalid==='malformed')material.visibility={kind:'actor-private'};else if(invalid==='nested-accessor')material.visibility={get kind(){reads++;return 'public';}};else Object.defineProperty(material,'visibility',{enumerable:true,get(){reads++;return {kind:'public'};}});
 assert.equal(snapshotContext(c,{node:publicNode}).error.code,'INVALID_CONTEXT_VISIBILITY');assert.equal(reads,0);
});

test('public sources with valid explicit public labels are included without native extras inspection',()=>{
 const c=context();let reads=0;c.chat[0].visibility={kind:'public'};c.characters[0].data.visibility='public';Object.defineProperty(c.chat[0].extra={},'reasoning',{enumerable:true,get(){reads++;throw Error('private native extra');}});
 const snapshot=snapshotContext(c,{node:publicNode});assert.equal(snapshot.ok,undefined);assert.deepEqual(snapshot.messages.map(m=>m.text),['Mara','A public card.','Mara enters.','She finds a brass key.']);assert.deepEqual(artifactVisibility(snapshot),{kind:'public'});assert.equal(reads,0);
});

for(const source of ['chat','character'])for(const replacement of ['hidden','accessor'])test('native public '+source+' '+replacement+' disclosure-label mutation rejects late output',async()=>{
 const c=context(),graph=starterGraph('native-guidance');graph.nodes['scene-context'].visibilityMode='public';graph.nodes['smart-compactor'].method='select';
 let entered,release,reads=0;const ready=new Promise(r=>entered=r),wait=new Promise(r=>release=r);
 const controller=createNativeWorkflowController({context:()=>c,isBusy:()=>false,countTokens:async()=>({tokens:1,method:'fixture'}),resolveBinding:()=>({ok:true,data:{profileId:'fixture',model:'fixture'}}),request:async()=>{entered();await wait;return response('Public plan.');}});
 const pending=controller.runPre(graph);const early=await Promise.race([ready.then(()=>null),pending]);assert.equal(early,null,JSON.stringify(early?.error));const material=source==='chat'?c.chat[0]:c.characters[0].data;
 if(replacement==='hidden')material.visibility={kind:'hidden'};else Object.defineProperty(material,'visibility',{enumerable:true,get(){reads++;return {kind:'public'};}});
 release();const result=await pending;assert.equal(result.ok,false);assert.equal(result.error.code,'STALE_SOURCE');assert.equal(reads,0);controller.dispose();
});

test('additive Format default jsonShape preserves earlier version-1 helper controls and body',()=>{
 const node={id:'format',type:'workflow',operation:'format'},body={schema:3,runtime:2,mode:'native-pre',nodes:{format:node},wires:{},portals:{},roles:{}};
 const definition={id:'format-helper',name:'Format helper',version:1,interface:[],parameters:[],body};
 const omitted=computeDefinitionIdentity(definition);assert.equal(omitted.ok,true);assert.equal(Object.hasOwn(JSON.parse(omitted.data.canonicalContent).body.nodes.format.controls,'jsonShape'),false);assert.equal(Object.hasOwn(omitted.data.materializedDefinition.body.nodes.format,'jsonShape'),false);
 const explicit=computeDefinitionIdentity({...definition,body:{...body,nodes:{format:{...node,jsonShape:'records'}}}});assert.equal(explicit.data.semanticHash,omitted.data.semanticHash);
 const value=computeDefinitionIdentity({...definition,body:{...body,nodes:{format:{...node,jsonShape:'single'}}}});assert.notEqual(value.data.semanticHash,omitted.data.semanticHash);assert.equal(value.data.materializedDefinition.body.nodes.format.jsonShape,'single');
});


for(const restriction of ['visibleTo','visibility','accessor'])test('public card respects native wrapper '+restriction+' rather than dropping it when selecting data',()=>{
 const c=context(),card=c.characters[0];let reads=0;
 if(restriction==='visibleTo')card.visibleTo=['mara'];else if(restriction==='visibility')card.visibility={kind:'hidden'};else Object.defineProperty(card,'visibility',{enumerable:true,get(){reads++;return {kind:'public'};}});
 const snapshot=snapshotContext(c,{node:publicNode});
 if(restriction==='accessor')assert.equal(snapshot.error.code,'INVALID_CONTEXT_VISIBILITY');else {assert.deepEqual(snapshot.messages.map(m=>m.text),c.chat.map(m=>m.mes));assert.deepEqual(snapshot.report.omissions,[{id:'character:name',reason:'restricted visibility'},{id:'character:description',reason:'restricted visibility'}]);assert.deepEqual(artifactVisibility(snapshot),{kind:'public'});}
 assert.equal(reads,0);
});

for(const replacement of ['visibleTo','hidden','accessor'])test('native public wrapper '+replacement+' mutation rejects an awaited card source',async()=>{
 const c=context(),graph=starterGraph('native-guidance');graph.nodes['scene-context'].visibilityMode='public';graph.nodes['smart-compactor'].method='select';
 let entered,release,reads=0;const ready=new Promise(r=>entered=r),wait=new Promise(r=>release=r);
 const controller=createNativeWorkflowController({context:()=>c,isBusy:()=>false,countTokens:async()=>({tokens:1,method:'fixture'}),resolveBinding:()=>({ok:true,data:{profileId:'fixture',model:'fixture'}}),request:async()=>{entered();await wait;return response('Public plan.');}});
 const pending=controller.runPre(graph);const early=await Promise.race([ready.then(()=>null),pending]);assert.equal(early,null,JSON.stringify(early?.error));const card=c.characters[0];
 if(replacement==='visibleTo')card.visibleTo=['mara'];else if(replacement==='hidden')card.visibility={kind:'hidden'};else Object.defineProperty(card,'visibility',{enumerable:true,get(){reads++;return {kind:'public'};}});
 release();const result=await pending;assert.equal(result.ok,false);assert.equal(result.error.code,'STALE_SOURCE');assert.equal(reads,0);controller.dispose();
});
