import test from 'node:test';
import assert from 'node:assert/strict';
import { createViewState } from '../src/ui/view-state.js';
const root={kind:'root',workflowId:'root'};
test('local publisher aliases round-trip with exact view/ref/source while old version one state stays valid',()=>{
 const store=createViewState({workflowId:'root'}), old=store.serialize().data;
 const alias={identity:root,source:{nodeId:'node',portId:'out'},label:'Local alias'};
 assert.equal(store.updateView({portalPresentation:{portal:alias}}).ok,true);
 const state=store.serialize(); assert.equal(state.ok,true);
 const restored=createViewState({workflowId:'root',persisted:state.data});assert.equal(restored.project().active.portalPresentation.portal.label,'Local alias');
 assert.ok(createViewState({workflowId:'root',persisted:old}));
 const before=store.serialize().data;
 assert.equal(store.updateView({portalPresentation:{portal:{...alias,identity:{kind:'root',workflowId:'other'}}}}).ok,false);
 assert.deepEqual(store.serialize().data,before);
 assert.equal(store.updateView({portalPresentation:{portal:{...alias,label:'x'.repeat(81)}}}).ok,false);
});

test('publisher aliases share the existing byte budget and exact library pin without an extra count cap',()=>{
 const store=createViewState({workflowId:'r'});const aliases=Object.fromEntries(Array.from({length:1100},(_,i)=>['p'+i,{identity:{kind:'root',workflowId:'r'},source:{nodeId:'n',portId:'o'},label:'a'}]));assert.equal(store.updateView({portalPresentation:aliases}).ok,true);
 const ref={id:'d',version:1,semanticHash:'hash'},identity={kind:'library',workflowId:'r',definitionRef:ref};const library=createViewState({workflowId:'r',navigation:[{identity,label:'D',readOnly:true}]});library.openLibrary(ref);const before=library.serialize().data;
 assert.equal(library.updateView({portalPresentation:{p:{identity,definitionRef:{...ref,version:2},source:{nodeId:'n',portId:'o'},label:'wrong'}}}).ok,false);assert.deepEqual(library.serialize().data,before);
});
