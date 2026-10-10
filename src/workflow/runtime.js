import { applyTextModifiers } from './modifiers.js?v=0.26.0';
import { operationFor } from './catalog.js?v=0.26.0';
import { cloneWorkflowDocument } from './document.js?v=0.26.0';
import { resolveWorkflow } from './resolve.js?v=0.26.0';
import { compactContext, formatContext } from './compactor.js?v=0.26.0';
import { scanDraft, repairDraft, validatePatches } from './repair.js?v=0.26.0';
import { graphSemanticSignature } from './ports.js?v=0.26.0';
import { executePrimitive, PRIMITIVE_OPERATIONS } from './operations/nodes.js?v=0.26.0';
import { executeInput, INPUT_OPERATIONS } from './operations/input-nodes.js?v=0.26.0';
import { executeContextJoin } from './operations/context-join.js?v=0.26.0';
import { executeControl, CONTROL_OPERATIONS } from './operations/control-nodes.js?v=0.26.0';
import { executeTranspose, TRANSPOSE_OPERATIONS } from './operations/transpose-nodes.js?v=0.26.0';
import { cleanupDraft, CLEANUP_MODES } from './operations/prose-cleanup.js?v=0.26.0';
import { executeIntrospection } from './introspection/nodes.js?v=0.26.0';
import { INTROSPECTION_NATIVE_OPERATIONS, projectIntrospectionNode } from './introspection/native.js?v=0.26.0';
import { admitRunPlan, createRunRecorder } from './recording.js?v=0.26.0';
import { addressKey, freeze, own, plain, parseRunPlan, safeBinding, safeError, safeIteration, safeUsage, boundedText } from './record-data.js?v=0.26.0';

/** Execution identity shared by the host and UI. Canvas presentation never invalidates work. */
export const workflowSignature = graphSemanticSignature;
export const freezeArtifact = freeze;
const failure = (code,message,nodeId) => ({ok:false,error:{code,message,...(nodeId ? {nodeId} : {})}});
const success = artifact => ({ok:true,artifact,reports:[]});
const cutoff = finish => ['length','max_tokens','max_output_tokens'].includes(String(finish).toLowerCase());
const complete = finish => ['stop','eos_token','eos','stop_sequence','end_turn','complete','completed'].includes(String(finish).toLowerCase());
const artifactKey = address => JSON.stringify([address.workflowId,address.instancePath,address.nodeId,address.portId]);
const versionMetadata = value => typeof value==='number' && Number.isFinite(value) ? value : undefined;
const observe = (observer,...args) => { try { const pending=observer?.(...args); if(pending && typeof pending.then==='function')Promise.resolve(pending).catch(()=>{}); } catch {/* Observers never own execution. */} };

function planWorkflow(graph,ports) {
    const normalized=cloneWorkflowDocument(graph);if(!normalized.ok)return normalized;
    if(ports.phase && normalized.data.mode!=='native-'+ports.phase)return failure('WRONG_PHASE','The workflow operation does not support this phase.');
    const resolved=resolveWorkflow(normalized.data,ports.target===undefined?{}:{target:ports.target});return resolved.ok?{...resolved,graph:normalized.data}:resolved;
}
async function executeNode(node,inputs,op,local) {
    const input=inputs.in;
    if(op.hostOperation||local.executeHostOperation&&['scene-context','reply-snapshot','prompt-source'].includes(node.operation)) {
        if(!local.root||!local.executeHostOperation)return failure('HOST_OPERATION_REQUIRED','This operation requires its owned root host adapter.',node.id);
        return local.executeHostOperation(node,inputs,{phase:local.phase,rootMode:local.rootMode,root:local.root,address:local.address,inputStates:local.inputStates,request:local.request,...(local.signal?{signal:local.signal}:{})});
    }
    if(Object.hasOwn(CONTROL_OPERATIONS,node.operation))return executeControl(node,inputs,local);
    if(node.operation!=='prompt-source' && Object.hasOwn(INPUT_OPERATIONS,node.operation))return executeInput(node,{phase:local.phase});
    if(Object.hasOwn(PRIMITIVE_OPERATIONS,node.operation))return executePrimitive(node,inputs,{phase:local.phase,...(local.signal?{signal:local.signal}:{}),...(local.createWorker?{createWorker:local.createWorker}:{}),...(local.timeoutMs!==undefined?{timeoutMs:local.timeoutMs}:{})});
    if(node.operation==='context-join')return executeContextJoin(node,inputs);
    if(Object.hasOwn(TRANSPOSE_OPERATIONS,node.operation))return executeTranspose(node,inputs,{phase:local.phase,request:local.request,countTokens:local.countTokens,binding:local.binding,...(local.signal?{signal:local.signal}:{})});
    if(Object.hasOwn(INTROSPECTION_NATIVE_OPERATIONS,node.operation)) {
        const projected=projectIntrospectionNode(node);if(!projected.ok)return projected;
        const capabilities={phase:local.phase,root:local.root,request:local.request,countTokens:local.countTokens,binding:local.binding,...(local.signal?{signal:local.signal}:{})};
        if(local.executeIntrospection)return local.executeIntrospection(node,inputs,{...capabilities,address:local.address,rootMode:local.rootMode,inputStates:local.inputStates});
        // Public execution can consume explicitly injected reads, but never obtains
        // the commit capability or trusted host settlement authority.
        const memory=own(local,'memory');
        if(memory)capabilities.memory=Object.fromEntries(['read','recall'].flatMap(key=>{
            const method=own(memory,key);return typeof method==='function'?[[key,options=>method.call(memory,options)]]:[];
        }));
        return executeIntrospection(projected.data,inputs,capabilities);
    }
    switch(node.operation) {
        case 'scene-context':case 'reply-snapshot':case 'prompt-source': {
            const snapshot=await local.snapshot(op.phase,node),result=snapshot?.ok===false?snapshot:success(structuredClone(snapshot?.ok===true?snapshot.artifact:snapshot));
            if(result.ok && snapshot?.report)result.reports.push(snapshot.report);
            return result.ok && result.artifact?.kind!==op.output?failure('INVALID_SNAPSHOT','The host did not provide the expected frozen source.',node.id):result;
        }
        case 'smart-compactor':return compactContext(input,node,local);
        case 'response-plan': {
            const messages=[{role:'system',content:'Write concise optional scene guidance: direction, actor intentions, constraints and possible next beats. These are proposals, not established events. Preserve user agency. Use only the supplied context and instructions.'},{role:'user',content:'Instructions: '+(node.instructions??'')+'\n\n'+formatContext(input)}];
            const response=await local.request({messages,maxTokens:node.maxTokens??768});
            return response.ok?(response.data.text.trim()?success({kind:'guidance',text:response.data.text,context:input,derived:true}):failure('EMPTY_OUTPUT','Planning returned no guidance.',node.id)):response;
        }
        case 'guidance': {
            const measured=await local.countTokens(input.text),result=measured.tokens<=(node.budgetTokens??768)?success(input):failure('GUIDANCE_OVERFLOW','Guidance exceeds its artifact token budget; nothing was published.',node.id);
            result.reports=[{code:'GUIDANCE_BUDGET',nodeId:node.id,...measured,budget:node.budgetTokens??768}];return result;
        }
        case 'pattern-scan':return scanDraft(input,node);
        case 'repair': {
            if(!CLEANUP_MODES.includes(node.mode))return repairDraft(input,node,local);
            const settings=Object.fromEntries(op.controls.filter(key=>key!=='policyVersion').map(key=>[key,node[key]===undefined?op.defaults[key]:node[key]]));
            const result=await cleanupDraft(input,settings,{request:local.request,countTokens:local.countTokens,binding:local.binding,...(local.signal?{signal:local.signal}:{}),...(inputs.context?{context:inputs.context}:{})});
            return result.ok?{ok:true,artifact:result.data.artifact,reports:result.data.report}:result;
        }
        case 'validate-patches':return validatePatches(input,node);
        case 'review-gate':case 'apply-reply':return success({...input,reviewRequired:true});
        case 'reroute':return success(input);
        default:return failure('UNKNOWN_OPERATION','Unsupported workflow operation.',node.id);
    }
}

/** Public execution returns addressed bounded recordings. */
export async function runWorkflow(graph,ports={}) { return executeWorkflow(graph,ports); }
/** Host-only lifecycle transport; deliberately absent from the public facade. */
export async function runWorkflowForHost(graph,ports={},hooks={}) { return executeWorkflow(graph,ports,hooks); }

async function executeWorkflow(original,ports,hooks={}) {
    const schema=versionMetadata(own(original,'schema')),runtime=versionMetadata(own(original,'runtime')),mode=ports.target===undefined?'root':'target';
    const artifacts=new Map(),outputStates=new Map(),bindings=new Map(),nodeCalls=new Map(),terminals=[];
    let runId,recorder,plan,safePlan,current,callBound=0,actualCalls=0,seq=0,lastElapsed=0,cancelling=false,closed=false,removeAbort=()=>{};
    let now,monotonic,started;
    const safeFailure=result=>{const error=safeError(result?.error)??{code:'WORKFLOW_FAILED',message:'Workflow preparation failed; inspect the source, connection and tokenizer.'};if(current && safePlan?.units.some(unit=>unit.included&&addressKey(unit.address)===addressKey(current.address)))Object.assign(error,{nodeId:current.address.nodeId,address:current.address});return {ok:false,error};};
    const emit=(type,details={})=>{
        if(closed || (cancelling && !(type==='run-settled'&&details.status==='cancelled')))return;
        let at=now(),elapsed=monotonic()-started;if(!Number.isFinite(at)||at<0)at=0;if(!Number.isFinite(elapsed)||elapsed<0)elapsed=lastElapsed;lastElapsed=Math.max(lastElapsed,elapsed);
        const event=freeze({runId,seq:seq+1,at,elapsedMs:lastElapsed,type,...details}),accepted=recorder.accept(event);
        if(!accepted.ok)throw new Error('Event admission failed');if(accepted.data.lastSeq!==event.seq)return;
        seq=event.seq;if(type==='run-cancelling')cancelling=true;observe(ports.onEvent,event);return event;
    };
    const cancel=()=>{if(!cancelling&&!closed&&safePlan){emit('run-cancelling',{reason:{code:'ABORTED',message:'Workflow was stopped.'}});cancelling=true;}};
    const stopped=()=>ports.signal?.aborted||cancelling;
    const finish=raw=>{
        const result=raw.ok?raw:safeFailure(raw);
        if(recorder && !closed){if(stopped())cancel();emit('run-settled',{status:stopped()?'cancelled':result.ok?'completed':raw.unresolved?'unresolved':!safePlan?'invalid':/^STALE|BINDING_CHANGED/.test(result.error?.code)?'stale':'failed',...(!result.ok?{error:safeError(result.error),...(current&&safePlan&&!raw.unresolved?{failedAddress:current.address}:{})}:{})});closed=true;}
        const recording=recorder?.finish();
        const identity=typeof runId==='string'?{runId}:{};
        return freezeArtifact({...(schema!==undefined?{schema}:{}),...(runtime!==undefined?{runtime}:{}),...identity,mode,ok:result.ok,callBound,actualCalls,...(recording?{recording}:{}),...(!result.ok?{error:result.error}:{}),...(result.preview?{preview:true}:{})});
    };
    try {
        runId=ports.runId===undefined?(globalThis.crypto?.randomUUID?.()??'run-'+Date.now()+'-'+Math.random()):ports.runId;
        recorder=createRunRecorder({runId});if(recorder.ok===false){const error=recorder;recorder=null;runId=undefined;return finish(error);}
        now=ports.clock?.now??Date.now;monotonic=ports.clock?.monotonic??(()=>globalThis.performance?.now?.()??Date.now());
        if(typeof now!=='function'||typeof monotonic!=='function') {recorder=null;return finish(failure('INVALID_RUN_CLOCK','Provide finite nonnegative run clocks.'));}
        let initial;
        try {started=monotonic();initial=now();}catch {recorder=null;return finish(failure('INVALID_RUN_CLOCK','Provide finite nonnegative run clocks.'));}
        if(!Number.isFinite(started)||started<0||!Number.isFinite(initial)||initial<0){recorder=null;return finish(failure('INVALID_RUN_CLOCK','Provide finite nonnegative run clocks.'));}
        // After creation, a misbehaving injected clock cannot prevent safe settlement.
        const readNow=now,readMonotonic=monotonic;
        now=()=>{try{const value=readNow();return Number.isFinite(value)&&value>=0?value:initial;}catch{return initial;}};
        monotonic=()=>{try{const value=readMonotonic();return Number.isFinite(value)&&value>=0?value:started+lastElapsed;}catch{return started+lastElapsed;}};
        const prepared=planWorkflow(original,ports);if(!prepared.ok)return finish(prepared);
        const originalGraphSnapshot=structuredClone(original);
        plan=prepared.data;callBound=plan.callBound;safePlan=parseRunPlan(plan);
        if(!safePlan)return finish(failure('INVALID_RUN_PLAN','The workflow execution inventory is invalid.'));
        const admission=admitRunPlan(safePlan,{runId});if(!admission.ok){safePlan=null;return finish(admission);}
        const abort=()=>cancel();ports.signal?.addEventListener('abort',abort,{once:true});removeAbort=()=>ports.signal?.removeEventListener('abort',abort);
        emit('plan',{plan:safePlan});
        if(stopped())return finish(failure('ABORTED','Workflow was stopped.'));
        if(ports.dryRun||ports.preview)return finish({ok:true,preview:true});
        const preparation=await hooks.prepare?.(plan,{cancel,originalGraphSnapshot});if(preparation?.ok===false)return finish(preparation);
        const nodes=plan.primitives.filter(unit=>unit.included);
        const bindingGraph={...prepared.graph,roles:{}};
        const bindUnit=async(unit,op)=>{
            current=unit;const node=unit.node;
            emit('node-phase',{address:unit.address,phase:'binding'});
            const resolved=await ports.resolveBinding?.({...node,modelRole:node.modelRole??op.modelRole},bindingGraph,unit.address);
            if(stopped())return failure('ABORTED','Workflow was stopped.',node.id);
            if(!resolved?.ok){const error=resolved??failure('BINDING_MISSING','Resolve the activated model connection before running.');emit('node-settled',{address:unit.address,status:'failed',error:safeError(error.error)});return error;}
            const binding=resolved.data;bindings.set(addressKey(unit.address),binding);
            emit('node-phase',{address:unit.address,phase:'binding',binding:safeBinding(ports.bindingSummary?.(binding)??{role:node.modelRole??op.modelRole,profileId:binding?.profileId,model:binding?.model})});
            return resolved;
        };
        // Unconditional legacy plans retain fixed-model preflight before any source
        // effects. Controls and owned host outputs can deactivate nodes, so those
        // plans (and unified plans) bind only after actual input activation.
        const legacyPreflight=['native-pre','native-post'].includes(prepared.graph.mode)&&!hooks.executeHostOperation&&nodes.every(unit=>!Object.hasOwn(CONTROL_OPERATIONS,unit.node.operation)&&!operationFor(unit.node,{phase:unit.phase,mode:prepared.graph.mode}).hostOperation);
        if(legacyPreflight)for(const unit of nodes){
            const op=operationFor(unit.node,{phase:unit.phase,mode:prepared.graph.mode});
            if(stopped())return finish(failure('ABORTED','Workflow was stopped.',unit.node.id));
            if(unit.requestBound&&op.modelRole){const bound=await bindUnit(unit,op);if(!bound.ok)return finish(bound);}
        }
        let unresolved=false;
        for(const unit of nodes) {
            current=unit;const node=unit.node,key=addressKey(unit.address),op=operationFor(node,{phase:unit.phase,mode:prepared.graph.mode});let binding=bindings.get(key);
            if(stopped())return finish(failure('ABORTED','Workflow was stopped.',node.id));
            const inputs=Object.create(null),inputStates=Object.create(null);
            for(const edge of plan.edges)if(addressKey(edge.to)===key){const state=outputStates.get(artifactKey(edge.from))??{status:'unresolved',reason:{code:'OUTPUT_MISSING',message:'The upstream output has not resolved.'}};inputStates[edge.to.portId]=state;if(state.status==='completed')inputs[edge.to.portId]=artifacts.get(artifactKey(edge.from));}
            for(const port of unit.inputPorts)if(Object.hasOwn(inputStates,port.id))recorder.capture({address:unit.address,direction:'input',portId:port.id,state:inputStates[port.id],...(Object.hasOwn(inputs,port.id)?{artifact:inputs[port.id],source:inputs[port.id]?.source}:{})});
            const held=Object.values(inputStates).find(state=>state.status==='unresolved');
            const skipped=unit.inputPorts.some(port=>port.required&&inputStates[port.id]?.status==='skipped');
            if(held||skipped){const status=held?'unresolved':'skipped',state={status,reason:held?.reason??{code:'INPUT_SKIPPED',message:'A required branch input was skipped.'}};if(held)unresolved=true;
                for(const port of unit.outputPorts){outputStates.set(artifactKey({...unit.address,portId:port.id}),state);recorder.capture({address:unit.address,direction:'output',portId:port.id,state});}
                emit('node-settled',{address:unit.address,status,reason:state.reason});continue;
            }
            if(unit.requestBound&&op.modelRole&&!bindings.has(key)){const bound=await bindUnit(unit,op);if(!bound.ok)return finish(bound);binding=bound.data;}
            emit('node-phase',{address:unit.address,phase:'executing'});observe(ports.onStage,freezeArtifact(structuredClone(node)),unit.address);
            const request=async options=>{
                if(stopped())return failure('ABORTED','Workflow was stopped.',node.id);
                if(actualCalls>=callBound||(nodeCalls.get(key)??0)>=unit.requestBound)return failure('CALL_LIMIT','Workflow request limit reached.',node.id);
                const tokenCount=await ports.countTokens(options.messages.map(item=>item.role+': '+item.content).join('\n'));
                if(stopped())return failure('ABORTED','Workflow was stopped.',node.id);
                if(!Number.isFinite(tokenCount?.tokens)||tokenCount.tokens<0)return failure('TOKEN_COUNT_FAILED','The tokenizer returned an invalid count.',node.id);
                const attempt=(nodeCalls.get(key)??0)+1;nodeCalls.set(key,attempt);actualCalls++;
                const iteration=node.operation==='for-each'?safeIteration(options.iteration):undefined;
                emit('request-start',{address:unit.address,attempt,maxTokens:options.maxTokens,inputTokens:tokenCount.tokens,...(iteration?{iteration}:{})});const requestStarted=lastElapsed;
                let response;try{response=await ports.request({...options,binding:node.operation==='for-each'?options.binding??binding:binding,signal:ports.signal});}catch{response=failure(stopped()?'ABORTED':'REQUEST_FAILED','Auxiliary request failed; no retry was made.',node.id);}
                if(!response||typeof response.ok!=='boolean'||(response.ok&&typeof response.data?.text!=='string')||(!response.ok&&!response.error))response=failure('INVALID_RESPONSE','Auxiliary request returned an invalid result.',node.id);
                if(stopped())response=failure('ABORTED','Ignore the stopped request result.',node.id);
                else if(response.ok&&cutoff(response.data.finish))response={ok:false,error:{code:'TRUNCATED_OUTPUT',message:'Auxiliary output reached its completion limit.',usage:response.data.usage,finish:response.data.finish}};
                else if(response.ok&&!complete(response.data.finish))response={ok:false,error:{code:'COMPLETION_UNVERIFIED',message:'Auxiliary output has no verified completion evidence.',usage:response.data.usage,finish:response.data.finish??null}};
                const metadata=response.ok?response.data:response.error;
                emit('request-settled',{address:unit.address,attempt,status:stopped()?'cancelled':response.ok?'completed':'failed',durationMs:Math.max(0,monotonic()-started-requestStarted),...(metadata?.finish!==undefined?{finish:boundedText(metadata.finish,128)??null}:{}),...(safeUsage(metadata?.usage)!==undefined?{usage:safeUsage(metadata.usage)}:{}),...(!response.ok?{error:safeError(response.error)}:{})});return response;
            };
            const result=await executeNode(node,inputs,op,{...ports,phase:unit.phase,rootMode:prepared.graph.mode,binding,request,inputStates:freezeArtifact(inputStates),root:unit.address.instancePath.length===0,address:unit.address,executeIntrospection:hooks.executeIntrospection,executeHostOperation:hooks.executeHostOperation});
            if(stopped())return finish(failure('ABORTED','Workflow was stopped.',node.id));
            if(!result?.ok){emit('node-settled',{address:unit.address,status:'failed',error:safeError(result?.error)});return finish(result??failure('WORKFLOW_FAILED','The operation returned no result.',node.id));}
            const outputs=own(result,'outputs'),states=own(result,'outputStates');
            if(outputs!==undefined&&!plain(outputs)||states!==undefined&&!plain(states)||[...Object.keys(outputs??{}),...Object.keys(states??{})].some(id=>!unit.outputPorts.some(port=>port.id===id))){const error=failure('INVALID_OUTPUT','The operation returned undeclared output ports.',node.id);emit('node-settled',{address:unit.address,status:'failed',error:error.error});return finish(error);}
            const metadata={binding:safeBinding(ports.bindingSummary?.(binding)??{role:node.modelRole,profileId:binding?.profileId,model:binding?.model}),reports:result.reports};
            let allSkipped=unit.outputPorts.length>0,hasUnresolved=false;
            for(const port of unit.outputPorts){let output=own(outputs,port.id);if(outputs===undefined&&port.id==='out')output=result.artifact;
                const rawState=own(states,port.id),status=rawState===undefined?(output===undefined?'unresolved':'completed'):own(rawState,'status');
                if(!['completed','skipped','unresolved'].includes(status)||status==='completed'&&(output===undefined||own(output,'kind')!==port.kind)||status!=='completed'&&output!==undefined){const error=failure('INVALID_OUTPUT','Output state and artifact must match the declared port.',node.id);emit('node-settled',{address:unit.address,status:'failed',error:error.error});return finish(error);}
                const reason=safeError(own(rawState,'reason')),state=freezeArtifact({status,...(reason?{reason}:{})});outputStates.set(artifactKey({...unit.address,portId:port.id}),state);allSkipped&&=status==='skipped';hasUnresolved||=status==='unresolved';
                if(status!=='completed'){recorder.capture({address:unit.address,direction:'output',portId:port.id,state});continue;}
                let modifierMetadata;if(node.modifiers?.length){const modified=applyTextModifiers(output?.text,node.modifiers);if(!modified.ok){emit('node-settled',{address:unit.address,status:'failed',error:safeError(modified.error)});return finish(modified);}output={...output,text:modified.data.text};modifierMetadata={rawText:modified.data.rawText,trace:modified.data.trace};}
                const artifact=freezeArtifact(output),recordedArtifact=modifierMetadata?freezeArtifact({...artifact,modifiers:modifierMetadata}):artifact;artifacts.set(artifactKey({...unit.address,portId:port.id}),artifact);recorder.capture({address:unit.address,direction:'output',portId:port.id,artifact:recordedArtifact,state,source:artifact?.source,...metadata});
            }
            if(unit.terminal){const artifact=freezeArtifact(result.artifact),terminal={kind:'terminal',address:unit.address};terminals.push({terminal,artifact});recorder.capture({address:unit.address,direction:'terminal',artifact,state:{status:'completed'},source:artifact?.source,...metadata});}
            if(hasUnresolved)unresolved=true;emit('node-settled',{address:unit.address,status:hasUnresolved?'unresolved':allSkipped?'skipped':'completed'});
        }
        current=null;
        if(unresolved)return finish({...failure('UNRESOLVED_INPUT','A selected workflow output is unresolved; dependent work is held.'),unresolved:true});
        const settlement=await hooks.settle?.({mode,terminals:mode==='root'?terminals:[],bindings:plan.primitives.filter(unit=>bindings.has(addressKey(unit.address))).map(unit=>({address:unit.address,binding:bindings.get(addressKey(unit.address))}))});
        if(stopped())return finish(failure('ABORTED','Workflow was stopped.'));if(settlement?.ok===false)return finish(settlement);
        return finish({ok:true});
    } catch {return finish(failure(stopped()?'ABORTED':'WORKFLOW_FAILED','Workflow preparation failed; inspect the source, connection and tokenizer.',current?.node.id));}
    finally {removeAbort();artifacts.clear();outputStates.clear();bindings.clear();nodeCalls.clear();terminals.length=0;plan=null;safePlan=null;recorder=null;current=null;}
}
