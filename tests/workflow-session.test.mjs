import assert from 'node:assert/strict';
import test from 'node:test';
import { installMock } from './mock.js';
installMock();
const { createWorkflowSession }=await import('../src/ui/workflow-surface.js');
const { starterGraph }=await import('../src/workflow/starters.js');
const { resolveWorkflow }=await import('../src/workflow/resolve.js');
const { parseRunPlan,freeze }=await import('../src/workflow/record-data.js');
const { createRunRecorder }=await import('../src/workflow/recording.js');
const { workflowSignature }=await import('../src/workflow/runtime.js');
function runRecord(root,runId,status='completed') {
    const plan=parseRunPlan(resolveWorkflow(root).data),recorder=createRunRecorder({runId});recorder.accept({runId,seq:1,at:1,elapsedMs:0,type:'plan',plan});
    if(status==='cancelled')recorder.accept({runId,seq:2,at:2,elapsedMs:1,type:'run-cancelling'});
    recorder.accept({runId,seq:status==='cancelled'?3:2,at:3,elapsedMs:2,type:'run-settled',status});return recorder.finish();
}
const response=(recording,ok=true)=>freeze({schema:3,runtime:2,mode:'root',runId:recording.runId,ok,callBound:recording.plan.callBound,actualCalls:0,recording,reviewHandles:[],...(!ok?{error:{code:'ABORTED',message:'Stopped'}}:{})});
test('session preserves the exact prior recording during preparation and keeps a new record-free error separate',async()=>{
    const root=starterGraph('structured-guidance'),recording=runRecord(root,'first');let finish,state;
    const runtime={runPre:()=>new Promise(resolve=>finish=resolve),cancel(){}};
    const session=createWorkflowSession({runtime:()=>runtime,current:()=>root,epoch:()=>1,active:()=>true,changed:value=>state=value});
    const first=session.run();finish(response(recording));await first;assert.equal(state.recording,recording);assert.equal(session.result().recording,recording);
    const second=session.run();assert.equal(state.recording,recording);finish({ok:false,error:{code:'RUN_ID_REQUIRED',message:'Preparation failed'}});await second;
    assert.equal(state.recording,recording);assert.equal(state.preparationError.message,'Preparation failed');assert.equal(session.result().runId,'first');assert.equal(state.reviewHandles.length,0);
});
test('automatic Send then manual root/target and record-free failures retain one exact diagnostic owner',async()=>{
    const root=starterGraph('structured-guidance'),sent=runRecord(root,'send'),manual=runRecord(root,'manual'),targetRecord=runRecord(root,'target');let state,finish,target;
    const runtime={cancel(){},runPre:()=>new Promise(resolve=>finish=resolve),runTarget:(_root,choice)=>{target=choice;return new Promise(resolve=>finish=resolve);}};
    const session=createWorkflowSession({runtime:()=>runtime,current:()=>root,epoch:()=>1,active:()=>true,changed:value=>state=value});
    session.receiveAutomatic({origin:{graph:root,graphId:root.id,signature:workflowSignature(root),kind:'send',phase:'pre',runId:'send'},result:response(sent)});
    assert.equal(state.recording,sent);assert.equal(session.result().recording,sent);assert.match(state.status,/Automatic Send/);assert.equal(Object.isFrozen(root),false);
    let pending=session.run();assert.equal(state.recording,sent);finish(response(manual));await pending;assert.equal(state.recording,manual);assert.equal(session.result().recording,manual);
    const choice={workflowId:root.id,instancePath:[],nodeId:'compose-guidance',portId:'out'};pending=session.run({target:choice});assert.equal(state.recording,manual);assert.equal(target,choice);finish({...response(targetRecord),mode:'target'});await pending;
    assert.equal(state.recording,targetRecord);assert.equal(session.result().recording,targetRecord);assert.deepEqual(state.reviewHandles,[]);
    pending=session.run();finish({schema:3,runtime:2,mode:'root',ok:false,error:{code:'INVALID_RUN_CLOCK',message:'New clock failure'},actualCalls:0,callBound:0});await pending;
    assert.equal(state.recording,targetRecord);assert.equal(state.result.runId,'target');assert.equal(state.result.recording.status,'completed');assert.equal(state.preparationError.message,'New clock failure');assert.equal(state.result.error,undefined);
    assert.equal(new Set([state.recording,state.result.recording]).size,1);
});
test('safe progress never reads current graph controls and invalidation rejects late ok after Stop or root replacement',async()=>{
    const root=starterGraph('structured-guidance'),plan=parseRunPlan(resolveWorkflow(root).data);let options,finish,state,current=root,epoch=1;
    const runtime={cancel(){},runPre:(_root,opts)=>{options=opts;return new Promise(resolve=>finish=resolve);}};
    const session=createWorkflowSession({runtime:()=>runtime,current:()=>current,epoch:()=>epoch,active:()=>true,changed:value=>state=value});
    let pending=session.run();options.onEvent({runId:'guarded',seq:1,at:1,elapsedMs:0,type:'plan',plan});
    const node=Object.values(root.nodes).find(node=>node.operation==='compose'),saved=node.template;let reads=0;Object.defineProperty(node,'template',{get(){reads++;throw new Error('event signature read');},configurable:true});
    options.onEvent({runId:'guarded',seq:2,at:2,elapsedMs:1,type:'node-phase',address:plan.units[0].address,phase:'executing'});assert.equal(reads,0);assert.equal(state.runState.lastSeq,2);
    Object.defineProperty(node,'template',{value:saved,writable:true,enumerable:true,configurable:true});
    session.cancel('Stop');epoch++;finish(response(runRecord(root,'guarded')));await pending;assert.equal(state.recording,null);assert.deepEqual(state.reviewHandles,[]);
    pending=session.run();options.onEvent({runId:'replaced',seq:1,at:1,elapsedMs:0,type:'plan',plan});current={...root};session.invalidate('Root replaced');current=root;finish(response(runRecord(root,'replaced','cancelled'),false));await pending;
    assert.equal(state.recording,null);assert.equal(state.busy,false);
});
test('progress has one explicit runId and root ownership survives view changes but rejects newer-run completions',async()=>{
    const root=starterGraph('structured-guidance'),plan=parseRunPlan(resolveWorkflow(root).data),pending=[];let viewEpoch=1,state,rootEpoch=1;
    const runtime={runPre:(_graph,options)=>new Promise(resolve=>pending.push({resolve,options})),cancel(){}};
    const session=createWorkflowSession({runtime:()=>runtime,current:()=>root,epoch:()=>rootEpoch,active:()=>true,changed:value=>state=value});
    const first=session.run();pending[0].options.onEvent(freeze({runId:'one',seq:1,at:1,elapsedMs:0,type:'plan',plan}));viewEpoch++;assert.equal(viewEpoch,2);assert.equal(state.runState.runId,'one');
    const observed=state.runState;pending[0].options.onEvent({runId:'foreign',seq:2,at:2,elapsedMs:1,type:'node-phase',address:plan.units[0].address,phase:'executing'});assert.equal(state.runState,observed);
    const second=session.run();pending[0].resolve(response(runRecord(root,'one')));await first;assert.notEqual(session.result()?.runId,'one');pending[1].resolve(response(runRecord(root,'two')));await second;assert.equal(session.result().runId,'two');
    const obsolete=session.run();rootEpoch++;pending[2].resolve(response(runRecord(root,'three')));await obsolete;assert.equal(session.result().runId,'two');
});
test('Stop retains diagnostics and accepts only its matching late cancelled record without handles',async()=>{
    const root=starterGraph('structured-guidance'),plan=parseRunPlan(resolveWorkflow(root).data);let finish,options,state,epoch=1;
    const runtime={runPre:(_root,opts)=>{options=opts;return new Promise(resolve=>finish=resolve);},cancel(){options.onEvent(freeze({runId:'stopped',seq:2,at:2,elapsedMs:1,type:'run-cancelling'}));assert.equal(state.runState.status,'cancelling','barrier is visible before the host epoch changes');epoch++;}};
    const session=createWorkflowSession({runtime:()=>runtime,current:()=>root,epoch:()=>epoch,active:()=>true,changed:value=>state=value});
    const pending=session.run();options.onEvent(freeze({runId:'stopped',seq:1,at:1,elapsedMs:0,type:'plan',plan}));session.cancel('Stopped');
    assert.equal(state.runState.status,'cancelling');finish(response(runRecord(root,'stopped','cancelled'),false));await pending;assert.equal(state.recording.runId,'stopped');assert.equal(state.recording.status,'cancelled');assert.equal(state.reviewHandles.length,0);
});
test('only the matching cancelled settlement event can close progress after the Stop epoch barrier',async()=>{
    const root=starterGraph('structured-guidance'),plan=parseRunPlan(resolveWorkflow(root).data);let state,options,finish,epoch=1;
    const runtime={runPre:(_root,opts)=>{options=opts;return new Promise(resolve=>finish=resolve);},cancel(){options.onEvent({runId:'closed',seq:2,at:2,elapsedMs:1,type:'run-cancelling'});epoch++;}};
    const session=createWorkflowSession({runtime:()=>runtime,current:()=>root,epoch:()=>epoch,active:()=>true,changed:value=>state=value});const pending=session.run();options.onEvent({runId:'closed',seq:1,at:1,elapsedMs:0,type:'plan',plan});session.cancel();
    options.onEvent({runId:'closed',seq:3,at:3,elapsedMs:2,type:'run-settled',status:'completed'});assert.equal(state.runState.status,'cancelling');
    options.onEvent({runId:'closed',seq:3,at:3,elapsedMs:2,type:'run-settled',status:'cancelled'});assert.equal(state.runState.status,'cancelled');
    finish(response(runRecord(root,'closed','cancelled'),false));await pending;assert.equal(state.recording.runId,'closed');assert.equal(state.reviewHandles.length,0);
});
test('schema3 Apply forwards the explicit frozen root handle and retains its recording after application',async()=>{
    const { normalizeNativeGraph }=await import('../src/workflow/migration.js');
    const root=normalizeNativeGraph(starterGraph('reviewed-de-slop')).data;root.nodes.repair.mode='scan';root.nodes.other={id:'other',type:'workflow',operation:'apply-reply'};root.wires.other={id:'other',route:'wire',from:'review-gate',fromPort:'out',to:'other',toPort:'in'};
    const recording=runRecord(root,'apply'),plan=resolveWorkflow(root).data,handles=plan.terminals.map((terminal,index)=>freeze({handleId:'handle-'+index,runId:'apply',terminal}));let applied,checks=0,state;
    const runtime={cancel(){},runPost:async()=>({...response(recording),reviewHandles:handles}),candidateStatus:()=>{checks++;return {ok:true};},apply:async selector=>{applied=selector;return {ok:true};}};
    const session=createWorkflowSession({runtime:()=>runtime,current:()=>root,epoch:()=>1,active:()=>true,changed:value=>state=value});await session.run();
    await session.apply();assert.equal(applied,undefined);await session.apply({...handles[0],terminal:handles[1].terminal});assert.equal(applied,undefined);assert.equal(checks,0);
    await session.apply(handles[1]);assert.deepEqual(applied,handles[1]);assert.equal(Object.isFrozen(applied),true);assert.equal(checks,1);assert.equal(state.recording,recording);assert.equal(state.result.recording,recording);assert.equal(state.reviewHandles.length,0);assert.equal(state.availability,'stale');
});
test('same schema3 Send replay stays unavailable after Stop or invalidation while a fresh Send replaces it',()=>{
    const root=starterGraph('structured-guidance');let state,current=root;
    const session=createWorkflowSession({runtime:()=>({cancel(){}}),current:()=>current,epoch:()=>1,active:()=>true,changed:value=>state=value});
    const automatic=id=>({origin:{graph:root,graphId:root.id,signature:workflowSignature(root),kind:'send',phase:'pre',runId:id},result:response(runRecord(root,id))});
    const sent=automatic('send');session.receiveAutomatic(sent);assert.equal(state.recording,sent.result.recording);session.cancel();assert.equal(state.availability,'stale');
    session.receiveAutomatic(sent);assert.equal(state.availability,'stale');assert.equal(state.recording,sent.result.recording);
    session.receiveAutomatic({...sent,result:{...sent.result}});assert.equal(state.availability,'stale','same run in a new notification wrapper remains unavailable');
    const fresh=automatic('fresh');current={...root};session.receiveAutomatic(fresh);assert.equal(state.recording,sent.result.recording,'same ID on another root object cannot adopt Send');current=root;session.receiveAutomatic(fresh);assert.equal(state.availability,'current');assert.equal(state.recording,fresh.result.recording);
    session.invalidate('Semantic invalidation');session.receiveAutomatic({...fresh,result:{...fresh.result}});assert.equal(state.availability,'stale');assert.equal(state.recording,fresh.result.recording);
    const next=automatic('next');session.receiveAutomatic(next);assert.equal(state.availability,'current');assert.equal(state.recording,next.result.recording);
});
