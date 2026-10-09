import assert from 'node:assert/strict';
import test from 'node:test';
import { installMock } from './mock.js';
installMock();
const surface=await import('../src/ui/workflow-surface.js');
const { prepareWorkflowPlanner }=await import('../src/workflow/resolve.js?v=0.22.1');
const { starterGraph }=await import('../src/workflow/starters.js');
const { cloneWorkflowDocument }=await import('../src/workflow/document.js');
const { runWorkflow }=await import('../src/workflow/runtime.js');
const { siblingWorkflow,twoOutputWorkflow }=await import('./fixtures/workflow-prepared-fixture.mjs');
const { resolveWorkflow }=await import('../src/workflow/resolve.js');
const { parseRunPlan,freeze }=await import('../src/workflow/record-data.js');
const { createRunRecorder,formatRecordedArtifact }=await import('../src/workflow/recording.js');
const { createRunState,reduceRunState }=await import('../src/workflow/run-state.js');
const graph3=kind=>cloneWorkflowDocument(starterGraph(kind)).data;
test('root preparation owns binding work and every selection/view projection uses cached lookups',()=>{
    assert.equal(typeof surface.prepareWorkflowProjection,'function');assert.equal(typeof surface.projectPreparedWorkflow,'function');
    const root=graph3('native-guidance');let bindings=0,freshness=0;
    const prepared=surface.prepareWorkflowProjection(root,{planner:prepareWorkflowPlanner(root).data,resolveBinding:()=>{bindings++;return {ok:true,data:{profileId:'fixed',model:'fixture',endpoint:'private endpoint'}};},candidateStatus:()=>{freshness++;return {ok:true};}});
    assert.equal(bindings,2);assert.equal(freshness,0);
    for(const nodeId of ['scene-context','smart-compactor','response-plan']) {
        const selectedTarget={workflowId:root.id,instancePath:[],nodeId,portId:'out'},view=surface.projectPreparedWorkflow(prepared,{selectedTarget,selectedAddress:selectedTarget,viewPath:[]});
        assert.equal(view.targetSummary.issues.length,0);assert.equal(view.selectedId,nodeId);assert.equal(view.nodes.some(node=>node.id===nodeId),true);assert.ok(!JSON.stringify(view).includes('private endpoint'));
    }
    assert.equal(bindings,2);assert.equal(freshness,0);assert.equal(Object.isFrozen(root),false);
});
test('multiple root review handles require explicit terminal selection and target runs never acquire Apply',()=>{
    const root=graph3('reviewed-de-slop');root.nodes.repair.mode='scan';root.nodes.secondApply={id:'secondApply',type:'workflow',operation:'apply-reply'};
    root.wires.second={id:'second',route:'wire',from:'review-gate',fromPort:'out',to:'secondApply',toPort:'in'};
    const plan=parseRunPlan(resolveWorkflow(root).data),recorder=createRunRecorder({runId:'multiple'});recorder.accept({runId:'multiple',seq:1,at:1,elapsedMs:0,type:'plan',plan});
    recorder.capture({address:plan.terminals[0].address,direction:'terminal',artifact:freeze({kind:'candidate',text:'x'.repeat(300000)})});
    recorder.accept({runId:'multiple',seq:2,at:2,elapsedMs:1,type:'run-settled',status:'completed'});
    const recording=recorder.finish(),handles=plan.terminals.map((terminal,index)=>freeze({handleId:'opaque-'+index,runId:'multiple',terminal})),result=freeze({schema:3,runtime:2,mode:'root',ok:true,runId:'multiple',actualCalls:0,callBound:0,recording,reviewHandles:handles});
    let checks=0;const prepared=surface.prepareWorkflowProjection(root,{result,candidateStatus:()=>{checks++;return {ok:true};}});assert.equal(checks,2);
    const target=handles[0].terminal;
    assert.equal(surface.projectPreparedWorkflow(prepared,{selectedTarget:target}).result.applyAvailable,false);
    const view=surface.projectPreparedWorkflow(prepared,{selectedTarget:target,selectedReviewHandle:handles[0]});assert.equal(view.result.applyAvailable,true);assert.deepEqual(view.result.sections[0],{kind:recording.artifacts[0].kind,...formatRecordedArtifact(recording.artifacts[0])});assert.equal(view.result.sections[0].format,'json-prefix-text');
    assert.equal(surface.projectPreparedWorkflow(prepared,{selectedTarget:handles[1].terminal,selectedReviewHandle:handles[0]}).result.applyAvailable,false);
    assert.equal(surface.projectPreparedWorkflow(prepared,{selectedTarget:target,selectedReviewHandle:{...handles[0],handleId:'invented'}}).result.applyAvailable,false);
    assert.equal(surface.projectPreparedWorkflow(prepared,{selectedTarget:target,selectedReviewHandle:handles[0],availability:'stale'}).result.applyAvailable,false);
    assert.equal(surface.projectPreparedWorkflow(prepared,{selectedTarget:target,selectedReviewHandle:handles[0],result:{...result,mode:'target'}}).result.applyAvailable,false);
    assert.equal(checks,2,'selection never checks host freshness');assert.equal(Object.isFrozen(root),false);
});
test('qualified sibling selection ignores unrelated missing bindings and resolves wrapper recording previews',async()=>{
    const root=siblingWorkflow();let preparations=0;
    const ports={snapshot:()=>({kind:'context',messages:[{id:'scene',role:'user',text:'Scene.',source:'chat'}]}),countTokens:async()=>({tokens:1,method:'fixture'}),resolveBinding:()=>({ok:true,data:{profileId:'fixture',model:'fixture'}}),request:async()=>({ok:true,data:{text:'Prepared proposal',finish:'stop'}})};
    const session=surface.createWorkflowSession({runtime:()=>({runPre:(graph,options)=>runWorkflow(graph,{...ports,...options}),cancel(){}}),current:()=>root,epoch:()=>1,active:()=>true,changed(){}});await session.run();const result=session.result();
    assert.equal(result.ok,true,JSON.stringify(result.error));
    const prepared=surface.prepareWorkflowProjection(root,{result,resolveBinding:(_node,bindingGraph)=>{assert.deepEqual(bindingGraph.roles,{});return ++preparations===1?{ok:false,error:{message:'First missing'}}:{ok:true,data:{profileId:'second',model:'fixture',authorization:'private'}};}});
    assert.equal(preparations,2);assert.match(surface.projectPreparedWorkflow(prepared).issues.join(' '),/First missing/);
    const choice={workflowId:root.id,instancePath:[],nodeId:'second',portId:'proposal'},view=surface.projectPreparedWorkflow(prepared,{selectedTarget:choice,selectedAddress:choice});
    assert.equal(view.targetSummary.callBound,1);assert.equal(view.issues.length,0);assert.ok(view.result.sections[0].text.includes('Prepared proposal'));assert.equal(view.result.applyAvailable,false);
    const inside=surface.projectPreparedWorkflow(prepared,{viewPath:['second'],selectedAddress:{workflowId:root.id,instancePath:['second'],nodeId:'work'}});
    assert.equal(inside.selectedId,'work');assert.deepEqual(inside.nodes[0].address.instancePath,['second']);assert.equal(inside.nodes[0].modelRole,'Analysis');
    let rootReads=0;Object.defineProperty(root,'nodes',{get(){rootReads++;throw new Error('pixel must not inspect root');},configurable:true});
    for(let index=0;index<12;index++)surface.projectPreparedWorkflow(prepared,{viewPath:index%2?['first/path']:['second'],selectedAddress:{workflowId:root.id,instancePath:['second'],nodeId:'work'},selectedTarget:choice,status:'Pixel '+index});
    assert.equal(rootReads,0);assert.equal(preparations,2);
});
test('foreign planner and projection objects reject without invoking caller properties',()=>{
    assert.equal(typeof surface.prepareWorkflowProjection,'function');let reads=0;const foreign={get inventory(){reads++;throw new Error('foreign');}},root=graph3('native-guidance');
    const invalid=surface.prepareWorkflowProjection(root,{planner:foreign});assert.match(surface.projectPreparedWorkflow(invalid).issues.join(' '),/prepared planner/i);assert.equal(reads,0);assert.equal(Object.isFrozen(foreign),false);
    const other=prepareWorkflowPlanner(structuredClone(root)).data,mismatch=surface.prepareWorkflowProjection(root,{planner:other});assert.match(surface.projectPreparedWorkflow(mismatch).issues.join(' '),/prepared planner/i);
    assert.match(surface.projectPreparedWorkflow(foreign).issues.join(' '),/prepared projection/i);assert.equal(reads,0);
});
test('bounded artifact previews and zero-call starter metadata come from the actual recording',async()=>{
    assert.equal(typeof surface.prepareWorkflowProjection,'function');const root=starterGraph('structured-guidance');let bindings=0;
    const result=await runWorkflow(root,{countTokens:async()=>({tokens:1,method:'fixture'})});assert.equal(result.ok,true,JSON.stringify(result.error));
    const prepared=surface.prepareWorkflowProjection(root,{result,resolveBinding:()=>{bindings++;throw new Error('zero call');}}),target={kind:'terminal',address:{workflowId:root.id,instancePath:[],nodeId:'guidance'}};
    const view=surface.projectPreparedWorkflow(prepared,{result,recording:result.recording,selectedTarget:target});assert.equal(bindings,0);assert.equal(view.callBound,0);assert.equal(view.starters.length,4);assert.equal(view.result.applyAvailable,false);assert.ok(view.result.sections[0].text.includes('quiet conversation'));assert.ok(!('calls' in view.result));assert.equal(view.rows.length,5);
    assert.equal(surface.projectPreparedWorkflow(prepared,{selectedTarget:target,status:'Selection only'}).rows,view.rows,'unchanged recording/view uses the prepared row lookup');
});
test('original current full rendering and cached target recordings retain separate compatible result shapes',async()=>{
    const root=starterGraph('native-guidance');root.roles.Analysis={profileId:'p',model:'chosen'};let preparations=0,effects=0;
    const target={workflowId:root.id,instancePath:[],nodeId:'scene-context',portId:'out'},result=await runWorkflow(root,{target,snapshot:()=>({kind:'context',messages:[{id:'source',role:'user',text:'Original source',source:'chat'}]}),countTokens:async()=>({tokens:1,method:'fixture'}),resolveBinding:()=>{effects++;throw new Error('target has no model');},request:()=>{effects++;throw new Error('target has no model');}});
    assert.equal(result.ok,true);assert.equal(result.schema,3);assert.equal(result.mode,'target');assert.equal(effects,0);
    const prepared=surface.prepareWorkflowProjection(root,{profiles:[{id:'p',name:'Profile'}],result,resolveBinding:()=>{preparations++;return {ok:true,data:{profileId:'p',model:'chosen',authorization:'private'}};}});
    assert.equal(preparations,2,'full and target preparation resolve each original model node once');
    const view=surface.projectPreparedWorkflow(prepared,{result,selectedTarget:target,selectedAddress:target});assert.equal(view.callBound,0);assert.equal(view.targetSummary.issues.length,0);assert.equal(view.result.kind,'bounded');assert.equal(view.result.applyAvailable,false);assert.ok(view.result.sections[0].text.includes('Original source'));assert.ok(!('calls'in view.result));
    for(let count=0;count<10;count++)surface.projectPreparedWorkflow(prepared,{selectedTarget:{...target,nodeId:count%2?'response-plan':'scene-context'},status:'select'});assert.equal(preparations,2);assert.equal(root.schema,3);assert.equal(root.runtime,2);assert.equal(Object.isFrozen(root),false);
});
test('retained current recording gives way to newer root and target progress with stable cached rows',async()=>{
    const root=starterGraph('native-guidance'),prior=await runWorkflow(root,{snapshot:()=>({kind:'context',messages:[{id:'source',role:'user',text:'Scene',source:'chat'}]}),countTokens:async()=>({tokens:1,method:'fixture'}),resolveBinding:()=>({ok:true,data:{profileId:'p',model:'fixture'}}),request:async()=>({ok:true,data:{text:'Prior guidance',finish:'stop'}})});
    assert.equal(prior.ok,true);const recording=prior.recording,prepared=surface.prepareWorkflowProjection(root,{result:prior,resolveBinding:()=>({ok:true,data:{profileId:'p',model:'fixture'}})});
    for(const mode of ['root','target']) {
        const target={workflowId:root.id,instancePath:[],nodeId:'scene-context',portId:'out'},plan=parseRunPlan(resolveWorkflow(cloneWorkflowDocument(root).data,mode==='target'?{target}:{}).data),runId='current-'+mode;
        let state=reduceRunState(createRunState(runId),{runId,seq:1,at:1,elapsedMs:0,type:'plan',plan});state=reduceRunState(state,{runId,seq:2,at:2,elapsedMs:1,type:'node-phase',address:plan.units[0].address,phase:'executing'});
        const view=surface.projectPreparedWorkflow(prepared,{recording,runState:state,availability:'superseded',selectedTarget:mode==='target'?target:undefined});
        assert.equal(view.rows[0].status,'running');assert.equal(view.rows[0].address.workflowId,root.id);assert.equal(surface.projectPreparedWorkflow(prepared,{recording,runState:state,status:'Selection'}).rows,view.rows);assert.equal(view.recording,recording);assert.equal(Object.isFrozen(root),false);
    }
});
test('malformed supported phase values produce safe diagnostics without binding effects or caller freezing',()=>{
    for(const mode of [42,false,{},[],null,()=>{}]) {
        const root={id:'malformed',schema:3,runtime:2,mode,nodes:{},wires:{},definitions:{},portals:{}};let effects=0;
        const view=surface.projectPreparedWorkflow(surface.prepareWorkflowProjection(root,{resolveBinding:()=>{effects++;throw new Error('binding');},candidateStatus:()=>{effects++;throw new Error('freshness');}}));
        assert.ok(view.issues.length>0);assert.equal(effects,0);assert.equal(Object.isFrozen(root),false);if(mode&&['object','function'].includes(typeof mode))assert.equal(Object.isFrozen(mode),false);
    }
    let reads=0;const root={id:'getter',schema:3,runtime:2,nodes:{},wires:{},definitions:{},portals:{}};Object.defineProperty(root,'mode',{get(){reads++;throw new Error('mode getter');},enumerable:true});
    assert.ok(surface.projectPreparedWorkflow(surface.prepareWorkflowProjection(root)).issues.length>0);assert.equal(reads,0);assert.equal(Object.isFrozen(root),false);
});
test('recorded wrapper aliases survive definition revisions and unknown stale mappings stay unavailable',async()=>{
    const root=twoOutputWorkflow(),ports={countTokens:async()=>({tokens:1,method:'fixture'})};
    const session=surface.createWorkflowSession({runtime:()=>({runPre:(graph,options)=>runWorkflow(graph,{...ports,...options}),cancel(){}}),current:()=>root,epoch:()=>1,active:()=>true,changed(){}});await session.run();const result=session.result(),recording=result.recording;
    const first={workflowId:root.id,instancePath:[],nodeId:'wrapper',portId:'first'},second={...first,portId:'second'};
    const initial=surface.prepareWorkflowProjection(root,{result}),before=surface.projectPreparedWorkflow(initial,{selectedTarget:first});assert.ok(before.result.sections[0].text.includes('Alpha'));assert.ok(surface.projectPreparedWorkflow(initial,{selectedTarget:second}).result.sections[0].text.includes('Beta'));
    const unknownRoot=twoOutputWorkflow(),unknown=await runWorkflow(unknownRoot,ports),targetResult=await runWorkflow(unknownRoot,{...ports,target:first});
    Object.assign(root,twoOutputWorkflow(true));const changed=surface.prepareWorkflowProjection(root,{result});const historical=surface.projectPreparedWorkflow(changed,{selectedTarget:first,availability:'stale'});
    assert.ok(historical.result.sections[0].text.includes('Alpha'),'old wrapper first cannot be relabeled through the new Beta route');assert.equal(historical.recording,recording);assert.deepEqual(historical.result.previewTarget,{workflowId:root.id,instancePath:['wrapper'],nodeId:'alpha',portId:'out'});
    const pinned=surface.projectPreparedWorkflow(changed,{selectedTarget:second,pinnedPreview:before.result.previewTarget,availability:'stale'});assert.ok(pinned.result.sections[0].text.includes('Alpha'));
    const uncaptured=surface.projectPreparedWorkflow(surface.prepareWorkflowProjection(root,{result:unknown}),{selectedTarget:first,availability:'stale'});assert.equal(uncaptured.result.sections[0].format,'omitted');assert.match(uncaptured.result.sections[0].text,/historical wrapper mapping unavailable/);assert.equal(uncaptured.result.previewTarget,null);assert.equal(uncaptured.recording,unknown.recording);
    const unprovenCurrent=surface.projectPreparedWorkflow(surface.prepareWorkflowProjection(root,{result:unknown}),{selectedTarget:first});assert.equal(unprovenCurrent.result.sections[0].format,'omitted','current availability alone cannot prove old mapping');
    const uncapturedRoot=twoOutputWorkflow(),uncapturedSession=surface.createWorkflowSession({runtime:()=>({runPre:(graph,options)=>runWorkflow(graph,{...ports,...options}),cancel(){}}),current:()=>uncapturedRoot,epoch:()=>1,active:()=>true,changed(){}});await uncapturedSession.run();Object.assign(uncapturedRoot,twoOutputWorkflow(true));
    const mismatchedRevision=surface.projectPreparedWorkflow(surface.prepareWorkflowProjection(uncapturedRoot,{result:uncapturedSession.result()}),{selectedTarget:first});assert.equal(mismatchedRevision.result.sections[0].format,'omitted','registered adoption cannot seed aliases from a different current definition revision');
    const recovered=surface.projectPreparedWorkflow(surface.prepareWorkflowProjection(root,{result:targetResult}),{selectedTarget:first,availability:'stale'});assert.ok(recovered.result.sections[0].text.includes('Alpha'),'admitted target/resolvedTarget recovers the exact old primitive');assert.equal(recovered.result.applyAvailable,false);
    const automatic=surface.createWorkflowSession({runtime:()=>({cancel(){}}),current:()=>unknownRoot,epoch:()=>1,active:()=>true,changed(){}}),{workflowSignature}=await import('../src/workflow/runtime.js');
    automatic.receiveAutomatic({origin:{kind:'send',phase:'pre',graph:unknownRoot,graphId:unknownRoot.id,runId:unknown.runId,signature:workflowSignature(unknownRoot)},result:unknown});
    const freshAuto=surface.prepareWorkflowProjection(unknownRoot,{result:automatic.result()});assert.ok(surface.projectPreparedWorkflow(freshAuto,{selectedTarget:first}).result.sections[0].text.includes('Alpha'),'verified automatic adoption seeds unchanged current wrapper mapping');
    const oldAuto=surface.prepareWorkflowProjection(root,{result:automatic.result()});assert.ok(surface.projectPreparedWorkflow(oldAuto,{selectedTarget:first,availability:'stale'}).result.sections[0].text.includes('Alpha'),'the captured alias is not replaced by a later definition');
    assert.equal(Object.isFrozen(root),false);
});

test('preview addresses are detached immutable DTOs and cannot rewrite recorded wrapper history',async()=>{
    const root=twoOutputWorkflow(),ports={countTokens:async()=>({tokens:1,method:'fixture'})};
    const session=surface.createWorkflowSession({runtime:()=>({runPre:(graph,options)=>runWorkflow(graph,{...ports,...options}),cancel(){}}),current:()=>root,epoch:()=>1,active:()=>true,changed(){}});
    await session.run();const result=session.result(),recording=result.recording;
    const first={workflowId:root.id,instancePath:[],nodeId:'wrapper',portId:'first'},canonical={workflowId:root.id,instancePath:['wrapper'],nodeId:'alpha',portId:'out'};
    const prepared=surface.prepareWorkflowProjection(root,{result}),project=()=>surface.projectPreparedWorkflow(prepared,{selectedTarget:first});
    const initial=project(),preview=initial.result.previewTarget,text=view=>view.result.sections.map(section=>section.text).join(' ');
    const mutate=(address)=>{const node=address.kind==='terminal'?address.address:address;try{node.nodeId='beta';}catch{}try{node.instancePath[0]='different';}catch{}};
    assert.ok(text(initial).includes('Alpha'));mutate(preview);const repeated=project();
    assert.ok(text(repeated).includes('Alpha'),'public address/path mutations cannot change the private alias');
    assert.deepEqual(preview,canonical);assert.equal(Object.isFrozen(preview),true);assert.equal(Object.isFrozen(preview.instancePath),true);
    const direct=surface.projectPreparedWorkflow(prepared,{selectedTarget:canonical});mutate(direct.result.previewTarget);
    assert.deepEqual(direct.result.previewTarget,canonical);assert.equal(Object.isFrozen(direct.result.previewTarget),true);assert.equal(Object.isFrozen(direct.result.previewTarget.instancePath),true);
    assert.ok(text(surface.projectPreparedWorkflow(prepared,{selectedTarget:canonical})).includes('Alpha'));
    const targetResult=await runWorkflow(root,{...ports,target:first}),targetPrepared=surface.prepareWorkflowProjection(root,{result:targetResult});
    const recovered=surface.projectPreparedWorkflow(targetPrepared,{selectedTarget:first});mutate(recovered.result.previewTarget);
    assert.deepEqual(recovered.result.previewTarget,canonical);assert.equal(Object.isFrozen(recovered.result.previewTarget),true);assert.equal(Object.isFrozen(recovered.result.previewTarget.instancePath),true);
    assert.ok(text(surface.projectPreparedWorkflow(targetPrepared,{selectedTarget:first})).includes('Alpha'));
    const terminal={kind:'terminal',address:{workflowId:root.id,instancePath:[],nodeId:'one'}},terminalView=surface.projectPreparedWorkflow(prepared,{selectedTarget:terminal});
    assert.deepEqual(terminalView.result.previewTarget,terminal);mutate(terminalView.result.previewTarget);assert.deepEqual(terminalView.result.previewTarget,terminal);
    assert.equal(Object.isFrozen(terminalView.result.previewTarget),true);assert.equal(Object.isFrozen(terminalView.result.previewTarget.address),true);assert.equal(Object.isFrozen(terminalView.result.previewTarget.address.instancePath),true);
    Object.assign(root,twoOutputWorkflow(true));const stale=surface.projectPreparedWorkflow(surface.prepareWorkflowProjection(root,{result}),{selectedTarget:first,availability:'stale'});
    assert.ok(text(stale).includes('Alpha'),'retained historical alias remains unchanged after route revision');assert.deepEqual(stale.result.previewTarget,canonical);assert.equal(stale.recording,recording);
    assert.equal(Object.isFrozen(root),false);assert.equal(Object.isFrozen(first),false);assert.equal(Object.isFrozen(first.instancePath),false);assert.equal(Object.isFrozen(canonical),false);assert.equal(Object.isFrozen(canonical.instancePath),false);assert.equal(Object.isFrozen(terminal.address),false);
});