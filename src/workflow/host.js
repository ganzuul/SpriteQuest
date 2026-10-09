import { runWorkflowForHost, freezeArtifact, workflowSignature } from './runtime.js?v=0.19.1';
import { resolveBinding, requestModel, bindingStatus, bindingSummary } from './connections.js?v=0.19.1';
import { addressKey, safeError } from './record-data.js?v=0.19.1';

// Internal review seam: observations contain no authority or retained payload values.
const retentionInspectors=new WeakMap();
export const inspectWorkflowRetentionForReview=controller=>retentionInspectors.get(controller)?.();

const PREFIX = 'lattice:guidance:';
const fail = (code,message) => ({ok:false,error:{code,message},reports:[],calls:[],trace:[]});
const identity = c => ({chatId:c.getCurrentChatId?.() ?? c.chatId ?? null,characterId:c.characterId ?? null,groupId:c.groupId ?? null});
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const sourceText = chat => JSON.stringify((chat ?? []).map(m=>[m?.mes,m?.swipe_id,m?.is_user,m?.is_system]));
const token = () => globalThis.crypto.randomUUID();
const generationStamp = value => {
    if(typeof value!=='string' && typeof value!=='number' && !(value instanceof Date))return null;
    const stamp=new Date(value).getTime();return Number.isFinite(stamp)?stamp:null;
};
const replyRevision = m => ({swipeId:m.swipe_id ?? 0,text:m.mes,started:generationStamp(m.gen_started),finished:generationStamp(m.gen_finished)});
const incompleteStream = (c,index) => {
    const stream=c.streamingProcessor;
    if(stream?.messageId!==index)return false;
    const failed=stream.isStopped || stream.abortController?.signal?.aborted;
    // The host can retain a stopped processor after selecting another completed swipe.
    // Only a known, different generation identifies it as stale; missing evidence stays closed.
    const started=generationStamp(stream.timeStarted),selected=generationStamp(c.chat?.[index]?.gen_started);
    if(failed && started!==null && selected!==null && started!==selected)return false;
    return !stream.isFinished || failed;
};
const completed = m => !!m && (!m.role || m.role==='assistant') && !['narrator','tool'].includes(m.extra?.type) && m.mes!=='...' && !m.is_user && !m.is_system && !m.is_tool && !m.is_intermediate && !m.extra?.tool_invocations?.length && !m.extra?.tool_calls?.length && !m.extra?.image && !m.extra?.media?.length && !m.extra?.isSmallSys && !m.extra?.is_intermediate && !m.extra?.partial && !m.extra?.unfinished && !(m.gen_started && !m.gen_finished) && typeof m.mes === 'string' && !!m.mes.trim();

/** Explicit bounded material only; this never assembles a native prompt or activates lore. */
export function snapshotContext(context,{phase='pre',chat=context.chat,node={}}={}) {
    const messages=[], omissions=[],characterMessages=[];
    let remaining=100000;
    const available=Array.isArray(chat)?chat:[];
    const start=Math.max(0,available.length-Math.min(1000,node.recentMessages ?? 12));
    if(start) omissions.push({omittedMessages:start,reason:'recent-message limit'});
    let reserved=0;
    // Retain whole recent messages first. Partial messages undermine literal pins and scope.
    for(let i=available.length-1;i>=start;i--) {
        const m=available[i],id=`chat:${i}`;
        if(m?.extra?.tool_invocations?.length || m?.is_tool || typeof m?.mes!=='string') {omissions.push({id,reason:'unsupported message'});continue;}
        if(m.mes.length>remaining) {
            if(reserved<2)return fail('INPUT_LIMIT','The two latest context messages exceed the 100,000-character snapshot limit. Narrow the explicit source before running.');
            omissions.push({id,omittedCharacters:m.mes.length,reason:'snapshot character limit'});continue;
        }
        reserved++;remaining-=m.mes.length;
        messages.unshift({id,role:m.is_user?'user':m.is_system?'system':'assistant',text:m.mes,source:'chat'});
    }
    if(node.includeCharacter!==false) {
        const character=context.characters?.[context.characterId],data=character?.data ?? character;
        for(const key of ['name','description','personality','scenario']) {
            const text=data?.[key],id=`character:${key}`;
            if(typeof text!=='string' || !text)continue;
            if(text.length>16000 || text.length>remaining) {omissions.push({id,omittedCharacters:text.length,reason:'character field or snapshot limit'});continue;}
            remaining-=text.length;characterMessages.push({id,role:'system',text,source:'character'});
        }
    }
    return freezeArtifact({kind:'context',messages:[...characterMessages,...messages],source:{...identity(context),phase},report:{code:'BOUNDED_CONTEXT',omissions,limitCharacters:100000,nativeLoreIncluded:false}});
}
/** The opaque source token is JSON-safe; live message references stay in the controller. */
export function snapshotReply(context,messageIndex=context.chat?.length-1) {
    const message=context.chat?.[messageIndex];
    if(messageIndex !== context.chat?.length-1) return fail('OLDER_REPLY','Only the latest completed assistant reply can be reviewed.');
    if(incompleteStream(context,messageIndex) || !completed(message)) return fail('REPLY_UNAVAILABLE','Select a completed text-only assistant reply.');
    if(message.mes.length>100000) return fail('INPUT_LIMIT','The reply exceeds the 100,000-character repair limit.');
    return freezeArtifact({kind:'draft',text:message.mes,source:{...identity(context),token:token(),messageIndex,swipeId:message.swipe_id ?? 0,originalText:message.mes,chatLength:context.chat.length},context:snapshotContext(context,{phase:'post',chat:context.chat.slice(0,messageIndex)})});
}

/** Owns cancellation, guidance lifetime and explicit local revision commits. */
export function createNativeWorkflowController(ports) {
    const context=ports.context;
    let epoch=0, active=null, result=null, automaticResult=null, applying=false, internalEvents=0, unsubscribe=null;
    let generation={dryRun:false,type:'normal'};
    const keys=new Set(), sources=new Map(), candidates=new Map(), stopped=new WeakMap();
    const observe=(fn,...args)=>{try{const pending=fn?.(...args);if(pending&&typeof pending.then==='function')Promise.resolve(pending).catch(()=>{});}catch{/* Observers cannot own lifecycle. */}};
    const rememberStopped=c=>{
        const m=c.chat?.at(-1);if(!m)return;
        const revision=replyRevision(m),stream=c.streamingProcessor,started=generationStamp(stream?.timeStarted);
        // Pending progress can still change text/finish time after Stop; its generation stays failed.
        const failedStarted=stream?.messageId===c.chat.length-1 && started===revision.started?started:null;
        const records=stopped.get(m) ?? [];
        if(!records.some(record=>same(record.revision,revision)))records.push({revision,failedStarted});
        stopped.set(m,records);
    };
    const stoppedRevision=m=>{
        const revision=replyRevision(m);
        return (stopped.get(m) ?? []).some(record=>record.revision.swipeId===revision.swipeId && (record.failedStarted!==null?record.failedStarted===revision.started:same(record.revision,revision)));
    };
    const notify=(value,run=null)=>{
        const previous=result;
        if(!value.recording && previous?.recording && (previous.schema===3 || previous.mode==='target')) {
            // A failed attempt has no run identity. Preserve the old diagnostic separately.
            result=freezeArtifact({...previous,reviewHandles:[],superseded:true});
            const diagnostic={...value,error:safeError(value.error)};
            for(const field of ['artifact','outputs','reports','calls','trace'])delete diagnostic[field];
            const failure=freezeArtifact(diagnostic);
            observe(ports.onResult,failure,null);
            return failure;
        }
        result=freezeArtifact(value);
        const origin=run?.native && run.graph ? Object.freeze({graph:run.originalGraph,graphId:run.graph.id,graphName:run.graph.name,signature:run.signature,phase:'pre',kind:'send',runId:run.graph.schema===2?run.epoch:run.runId}) : null;
        if(origin)automaticResult=Object.freeze({result,origin});
        else if(result.recording && automaticResult?.result.schema===3 && automaticResult.result.recording!==result.recording) {
            const prior=automaticResult.result;
            automaticResult=Object.freeze({origin:automaticResult.origin,superseded:true,result:Object.freeze({schema:prior.schema,runtime:prior.runtime,runId:prior.runId,mode:prior.mode,ok:prior.ok,callBound:prior.callBound,actualCalls:prior.actualCalls})});
        }
        observe(ports.onResult,result,origin);
        return result;
    };
    const clear=()=>{
        const c=context();
        // Clear guidance left by the previous brand during an in-place upgrade.
        for(const key of Object.keys(c.extensionPrompts ?? {})) if(key.startsWith(PREFIX) || key.startsWith('comfytavern:guidance:')) keys.add(key);
        for(const key of keys) { try{c.setExtensionPrompt?.(key,'',1,0,false,0);if(c.extensionPrompts?.[key])c.extensionPrompts[key].value='';}catch{if(c.extensionPrompts)delete c.extensionPrompts[key];} }
    };
    const cancel=(reason='Workflow canceled')=>{
        // Publish this run's barrier while it still owns the epoch, then revoke authority.
        if(active?.cancel)active.cancel();
        else active?.controller.abort(reason); // Runtime listener marks the admitted plan before epoch revocation.
        epoch++; sources.clear(); candidates.clear(); clear();
        if(active) {active.controller.abort(reason); const abort=active.abortPrimary;active.abortPrimary=null;try{abort?.(true);}catch{/* Native abort callback is best effort. */}}
        active=null;
    };
    const bindingFresh=(run)=>{
        for(const check of run.bindingChecks??[]) {
            let status;
            if(ports.bindingStatus)status=ports.bindingStatus(check.binding,context());
            else if(!ports.resolveBinding)status=bindingStatus(check.binding,context());
            else {
                try {const current=ports.resolveBinding(check.node,check.graph,check.address);status=current?.ok&&same(current.data,check.metadata)?{ok:true}:fail('BINDING_CHANGED','The fixed connection changed after preflight. Run preflight again.');}
                catch {status=fail('BINDING_CHANGED','The fixed connection is no longer available. Run preflight again.');}
            }
            if(!status?.ok)return status??fail('BINDING_CHANGED','The fixed connection is no longer available.');
        }
        return {ok:true};
    };
    const fresh=(run)=>run.epoch===epoch && !run.controller.signal.aborted && same(run.identity,identity(context())) && run.signature===workflowSignature(run.originalGraph) && (!run.native || (ports.isEnabled?.() !== false && ports.getGraph?.('pre')===run.originalGraph));
    const sourceFresh=run=>[...(run.pendingSources?.values()??[])].every(validSource) && [...(run.sceneSources??[])].every(entry=>sourceText(entry.chat)===entry.text);
    const start=(graph,native=false,abortPrimary=null,target)=>{
        cancel('Superseded by a new workflow');
        const run={epoch,runId:token(),controller:new AbortController(),originalGraph:graph,native,abortPrimary,pending:true,target,mode:target===undefined?'root':'target',pendingSources:new Map(),sceneSources:[],bindingContexts:new Map(),bindingChecks:[],reviewHandles:[]};
        active=run;return run;
    };
    function prepareRun(run,plan,controls,options) {
        run.cancel=controls.cancel;
        const captured=controls.originalGraphSnapshot;
        run.graph={id:captured.id,name:captured.name,schema:captured.schema,runtime:captured.runtime,mode:captured.mode};
        run.signature=workflowSignature(captured);run.identity=identity(context());
        if(!fresh(run))return fail('STALE_RUN','Workflow source or settings changed.');
        if(options.phase==='post' && (ports.isBusy?.()||applying))return fail('BUSY','Wait for generation or reply application to finish.');
        if(run.native) {
            const tail=(options.chat??[]).at(-1),liveTail=context().chat?.at(-1);
            if([tail,liveTail].some(message=>message?.is_tool || message?.extra?.tool_invocations?.length))return fail('INTERNAL_TOOL_CONTINUATION','Internal tool continuation does not run guidance.');
            generation.originalTail??={message:liveTail,text:liveTail?.mes};
        }
        return {ok:true};
    }
    function selectedSnapshot(run,phase,node,options) {
        const c=context();
        if(!fresh(run))return fail('STALE_RUN','Workflow source or settings changed.');
        if(phase==='pre') {
            const chat=options.chat??c.chat;
            if(!run.sceneSources.some(entry=>entry.chat===chat))run.sceneSources.push({chat,text:sourceText(chat)});
            return snapshotContext(c,{chat,node});
        }
        const snapshot=snapshotReply(c,options.messageIndex);
        if(snapshot.ok===false)return snapshot;
        const message=c.chat[snapshot.source.messageIndex];
        if(stoppedRevision(message))return fail('REPLY_UNAVAILABLE','The stopped reply is not a completed repair target.');
        const entry={message,chat:c.chat,refs:[...c.chat],prefix:sourceText(c.chat),swipeText:message.swipes?.[snapshot.source.swipeId],source:snapshot.source,run};
        run.pendingSources.set(snapshot.source.token,entry);
        return snapshot;
    }
    function settleRun(run,transport) {
        if(!fresh(run)||!sourceFresh(run))return fail('STALE_SOURCE','The workflow source changed during preparation.');
        run.bindingChecks=transport.bindings.map(({address,binding})=>({address,binding,...run.bindingContexts.get(binding)}));
        const effective=bindingFresh(run);if(!effective.ok)return effective;
        if(transport.mode==='target')return {ok:true};
        if(run.native) {
            const c=context();
            try {
                if(typeof c.setExtensionPrompt!=='function')throw new Error('Prompt setter unavailable');
                for(const output of transport.terminals) {
                    if(output.artifact?.kind!=='guidance')continue;
                    const key=PREFIX+addressKey(output.terminal.address);keys.add(key);
                    c.setExtensionPrompt(key,output.artifact.text,1,0,false,0);
                    if(c.extensionPrompts && c.extensionPrompts[key]?.value!==output.artifact.text)throw new Error('Prompt not accepted');
                    if(!fresh(run)||!sourceFresh(run)||!bindingFresh(run).ok)throw new Error('Source changed during publication');
                }
                run.published=true;run.pending=false;return {ok:true};
            } catch {clear();return fail('GUIDANCE_UNAVAILABLE','Native guidance could not be installed; the native reply remains available.');}
        }
        for(const output of transport.terminals) {
            if(output.artifact?.kind!=='candidate')continue;
            const source=run.pendingSources.get(output.artifact.source?.token);if(!source)return fail('STALE_CANDIDATE','The candidate source is no longer available.');
            const handle={handleId:token(),runId:run.runId,terminal:output.terminal};
            const entry={...source,candidate:freezeArtifact(structuredClone(output.artifact)),terminal:output.terminal,handle,applied:null};
            sources.set(entry.source.token,source);candidates.set(handle.handleId,entry);
            if(run.graph.schema===3)run.reviewHandles.push(handle);
        }
        return {ok:true};
    }
    async function execute(run,options) {
        let value;
        try {value=await runWorkflowForHost(run.originalGraph,{
            phase:options.phase,target:run.target,runId:run.runId,signal:run.controller.signal,
            snapshot:(phase,node)=>selectedSnapshot(run,phase,node,options),countTokens:ports.countTokens,
            resolveBinding:(node,graph,address)=>{
                const result=(ports.resolveBinding??((n,g)=>resolveBinding(n,g,context())))(node,graph,address);
                if(result?.ok && ports.resolveBinding && !ports.bindingStatus) {
                    const role=graph.roles?.[node.modelRole];
                    run.bindingContexts.set(result.data,{node:{profileId:node.profileId,model:node.model,modelRole:node.modelRole},graph:{roles:role?{[node.modelRole]:{profileId:role.profileId,model:role.model}}:{}},metadata:structuredClone(result.data)});
                }
                return result;
            },
            bindingSummary:ports.bindingSummary??bindingSummary,
            request:ports.request??(request=>requestModel(request,context())),
            onStage:ports.onStage,onEvent:event=>{observe(ports.onEvent,event);observe(options.onEvent,event);},
        },{prepare:(plan,controls)=>prepareRun(run,plan,controls,options),settle:transport=>settleRun(run,transport)});}
        finally {delete run.cancel;run.bindingContexts.clear();}
        if(!value.ok||run.mode==='target') {run.pendingSources.clear();run.sceneSources.length=0;run.bindingChecks=[];for(const [id,entry]of candidates)if(entry.run===run)candidates.delete(id);for(const [id,entry]of sources)if(entry.run===run)sources.delete(id);if(run.native)clear();}
        else run.pendingSources.clear();
        const bounded=value.schema===3||run.mode==='target';
        const publicValue=freezeArtifact({...value,...(bounded?{reviewHandles:value.ok?run.reviewHandles:[]}:{})});
        run.publicResult=publicValue;
        return publicValue;
    }
    async function runPre(graph,options={}) {
        const run=start(graph),value=await execute(run,{phase:'pre',onEvent:options.onEvent});
        if(active===run) {active=null;return notify(value);}
        return value;
    }
    async function beforeGenerate(chat,_contextSize,abort,type='normal') {
        clear();type=type||'normal';
        if(generation.aborted) {abort?.(true);return notify(fail('ABORTED','The native generation was stopped before workflow preparation.'));}
        if(generation.dryRun || !['normal','swipe','regenerate','continue'].includes(type)) {if(active)cancel('Overlapping background generation');return {ok:true,skipped:true};}
        if(ports.isEnabled?.()===false)return {ok:true,skipped:true};
        const graph=ports.getGraph?.('pre');if(!graph)return {ok:true,skipped:true};
        if(active?.native) {cancel('Overlapping native generation');abort?.(true);return notify(fail('OVERLAPPING_GENERATION','Overlapping native requests are unsupported; send again when settled.'));}
        const run=start(graph,true,abort),value=await execute(run,{phase:'pre',chat});
        if(active!==run)return value;
        if(/^STALE/.test(value.error?.code??'')){cancel('Source changed during preparation');return value;}
        if(value.error?.code==='INTERNAL_TOOL_CONTINUATION'){active=null;return {ok:true,skipped:true,reason:'internal-tool-continuation'};}
        if(!value.ok) {
            active=null;
            if(value.error.code==='ABORTED'){run.abortPrimary?.(true);run.abortPrimary=null;return notify(value,run);}
            return notify(run.graph?.schema===3?{...value,fallback:'native'}:{...value,fallback:'native',reports:[...(value.reports??[]),{code:'NATIVE_FALLBACK',message:'Preparation failed; SillyTavern will generate without Lattice guidance.'}]},run);
        }
        return notify({...value,published:run.published===true},run);
    }
    async function runPost(graph,messageIndex,options={}) {
        const run=start(graph),value=await execute(run,{phase:'post',messageIndex,onEvent:options.onEvent});
        if(active===run){active=null;return notify(value);}
        return value;
    }
    async function runTarget(graph,target,{messageIndex,onEvent}={}) {
        const run=start(graph,false,null,target),phase=typeof graph?.mode==='string'?graph.mode.slice(7):undefined;
        const value=await execute(run,{phase,messageIndex,onEvent});
        if(active===run){active=null;return notify(value);}
        return value;
    }
    function validSource(entry) {
        const c=context(),s=entry.source;
        return fresh(entry.run) && !ports.isBusy?.() && c.chat===entry.chat && c.chat.length===s.chatLength && c.chat.every((m,i)=>m===entry.refs[i]) && c.chat[s.messageIndex]===entry.message && s.messageIndex===c.chat.length-1 && completed(entry.message) && !incompleteStream(c,s.messageIndex) && !stoppedRevision(entry.message) && (entry.message.swipe_id??0)===s.swipeId && entry.message.swipes?.[s.swipeId]===entry.swipeText && entry.message.mes===s.originalText && sourceText(c.chat)===entry.prefix;
    }
    function candidateEntry(selector) {
        if(selector?.handleId) {
            const entry=candidates.get(selector.handleId);
            return entry && selector.runId===entry.handle.runId && same(selector.terminal,entry.terminal)?entry:null;
        }
        for(const entry of candidates.values())if(entry.run.graph.schema===2&&same(selector,entry.candidate))return entry;
        return null;
    }
    function candidateStatus(selector) {
        const entry=candidateEntry(selector);
        if(!entry)return fail('STALE_CANDIDATE','This candidate is no longer available; run the workflow again.');
        if(entry.applied)return fail('ALREADY_APPLIED','This revision has already been applied.');
        if(applying||ports.isBusy?.())return fail('BUSY','Wait for generation or reply application to finish.');
        const effective=bindingFresh(entry.run);if(!effective.ok)return effective;
        return validSource(entry)?{ok:true}:fail('STALE_SOURCE','The chat, reply or swipe changed. Run the workflow again.');
    }
    async function apply(selector) {
        const entry=candidateEntry(selector),candidate=entry?.candidate;
        if(!entry)return notify(fail('STALE_CANDIDATE','This candidate is no longer available; run the workflow again.'));
        if(entry.applied) {
            if(fresh(entry.run) && bindingFresh(entry.run).ok && context().chat?.[entry.source.messageIndex]===entry.message && entry.message.mes===candidate.text && entry.message.swipe_id===entry.applied.swipeId)return entry.applied;
            return notify(fail('STALE_CANDIDATE','The applied revision is no longer the selected reply.'));
        }
        if(applying)return fail('BUSY','A reply application is already in progress.');
        const effective=bindingFresh(entry.run);if(!effective.ok)return notify(effective);
        if(!validSource(entry))return notify(fail('STALE_SOURCE','The chat, reply or swipe changed. Run the workflow again.'));
        const c=context(),m=entry.message,index=entry.source.messageIndex;
        if(typeof c.saveChat!=='function' || typeof c.updateMessageBlock!=='function' || typeof c.swipe?.refresh!=='function' || typeof ports.syncMesToSwipe!=='function' || typeof ports.syncSwipeToMes!=='function')return notify(fail('APPLY_UNAVAILABLE','Required native save, display or swipe synchronization APIs are unavailable.'));
        const backup=structuredClone(m); let mutated=false,saveAttempted=false;
        applying=true;
        try {
            // No await is allowed between this last source check and the mutation.
            if(!validSource(entry)||!bindingFresh(entry.run).ok)throw new Error('Source changed');
            mutated=true;
            m.swipes=Array.isArray(m.swipes)?[...m.swipes]:[m.mes];
            m.swipe_id=m.swipe_id ?? 0;
            if(!Number.isInteger(m.swipe_id) || typeof m.swipes[m.swipe_id]!=='string')throw new Error('Invalid swipe identity');
            m.swipe_info=Array.from({length:m.swipes.length},(_,i)=>structuredClone(m.swipe_info?.[i] ?? {send_date:m.send_date,extra:{}}));
            if(!ports.syncMesToSwipe(index))throw new Error('Cannot preserve original swipe');
            if(m.swipes[entry.source.swipeId]!==candidate.original)throw new Error('Original swipe was not preserved');
            // Capture after the public helper synchronizes current original metadata.
            const preserved=structuredClone({swipes:m.swipes,info:m.swipe_info});
            const swipeId=m.swipes.length,now=new Date().toISOString();
            const revisionInfo={send_date:now,gen_started:now,gen_finished:now,extra:{latticeRevision:{sourceToken:candidate.source.token,sourceSwipeId:candidate.source.swipeId,workflowId:entry.run.graph.id,at:now}}};
            m.swipes.push(candidate.text);
            m.swipe_info.push(structuredClone(revisionInfo));
            if(!ports.syncSwipeToMes(index,swipeId,m))throw new Error('Cannot select revision');
            const revisionMetadata=value=>value && ({send_date:value.send_date,gen_started:value.gen_started,gen_finished:value.gen_finished,revision:value.extra?.latticeRevision});
            const expectedMetadata=revisionMetadata(revisionInfo);
            const intactSwipes=()=>Array.isArray(m.swipes) && m.swipes.length===swipeId+1
                && m.swipes[swipeId]===candidate.text && same(m.swipes.slice(0,swipeId),preserved.swipes)
                && Array.isArray(m.swipe_info) && m.swipe_info.length===swipeId+1
                && same(m.swipe_info.slice(0,swipeId),preserved.info)
                && same(revisionMetadata(m.swipe_info[swipeId]),expectedMetadata) && same(revisionMetadata(m),expectedMetadata);
            const stillApplied=()=>intactSwipes() && fresh(entry.run) && bindingFresh(entry.run).ok && !ports.isBusy?.() && context().chat===entry.chat && c.chat.length===entry.source.chatLength && c.chat.every((item,i)=>item===entry.refs[i]) && m.mes===candidate.text && m.swipe_id===swipeId;
            if(!stillApplied())throw new Error('Revision synchronization failed');
            internalEvents++;
            try {
                for(const name of ['MESSAGE_SWIPED','MESSAGE_UPDATED']) { const event=(c.eventTypes ?? c.event_types)?.[name];if(event)await c.eventSource?.emit(event,index);if(!stillApplied())throw new Error('Reply changed during notification'); }
            } finally {internalEvents--;}
            await c.updateMessageBlock(index,m);
            if(!stillApplied())throw new Error('Reply changed during render');
            await c.swipe.refresh(true,false);
            if(!stillApplied())throw new Error('Reply changed before save');
            saveAttempted=true;const saved=await c.saveChat();
            if(saved===false || saved?.ok===false || !stillApplied())throw new Error('Save failed or source changed');
            entry.applied=freezeArtifact(entry.run.graph.schema===3?{...entry.run.publicResult,ok:true,appliedLocally:true,saveAttempted:true,persistence:'unverified',swipeId}:{ok:true,appliedLocally:true,saveAttempted:true,persistence:'unverified',swipeId,artifact:candidate,reports:[{code:'PERSISTENCE_UNVERIFIED',message:'Applied locally and requested a save. The host does not acknowledge durable persistence; other memory extensions may retain the original.'}],calls:[],trace:[]});
            for(const [id,sibling]of candidates)if(sibling!==entry&&sibling.source.token===entry.source.token)candidates.delete(id);
            return notify(entry.applied);
        } catch {
            if(mutated) {for(const key of Object.keys(m))delete m[key];Object.assign(m,backup);try{if(context().chat===entry.chat && same(identity(context()),entry.run.identity)){await c.updateMessageBlock(index,m);await c.swipe.refresh(true,false);}}catch{/* Report detectable failure even if refresh fails. */}}
            return notify({...fail('APPLY_FAILED','The revision could not be applied; the original local message was restored.'),appliedLocally:false,saveAttempted,persistence:saveAttempted?'unverified':'not-attempted'});
        } finally {applying=false;}
    }
    function subscribe() {
        if(unsubscribe)return unsubscribe;
        const c=context(),events=c.eventTypes ?? c.event_types ?? {},subscriptions=[];
        const on=(name,fn)=>{if(events[name] && c.eventSource?.on){c.eventSource.on(events[name],fn);subscriptions.push([events[name],fn]);}};
        on('GENERATION_STARTED',(type,options,dryRun)=>{
            generation={type:type || 'normal',dryRun:!!dryRun,aborted:!!options?.signal?.aborted,originalTail:{message:context().chat?.at(-1),text:context().chat?.at(-1)?.mes}};
            if(dryRun)return;
            cancel('Generation started');
            const owner=generation;
            if(options?.signal)options.signal.addEventListener('abort',()=>{if(generation===owner){generation.aborted=true;cancel('Generation aborted');}},{once:true});
        });
        on('GENERATION_STOPPED',()=>{generation.aborted=true;const m=context().chat?.at(-1);if(m && !m.is_user && (!generation.originalTail || m!==generation.originalTail.message || m.mes!==generation.originalTail.text || incompleteStream(context(),context().chat.length-1)))rememberStopped(context());cancel('Generation stopped');});
        on('GENERATION_ENDED',()=>{const c=context();if(incompleteStream(c,c.chat?.length-1) && c.chat?.at(-1))rememberStopped(c);if(active && !active.pending)active.abortPrimary=null;cancel('Generation ended');});
        on('MESSAGE_SWIPE_DELETED',({messageId,swipeId}={})=>{
            const m=context().chat?.[messageId],records=stopped.get(m);
            if(records && Number.isInteger(messageId) && Number.isInteger(swipeId) && swipeId>=0 && Array.isArray(m.swipes) && swipeId<=m.swipes.length) {
                const surviving=[];
                for(const record of records) {
                    if(record.revision.swipeId===swipeId)continue;
                    const id=record.revision.swipeId-(record.revision.swipeId>swipeId?1:0);
                    const revision={...record.revision,swipeId:id};
                    const stored=replyRevision({...m.swipe_info?.[id],swipe_id:id,mes:m.swipes[id]});
                    // Native deletion already spliced both arrays; only rebase a surviving failed revision.
                    if(record.failedStarted!==null?record.failedStarted===stored.started:same(revision,stored))surviving.push({...record,revision});
                }
                stopped.set(m,surviving);
            }
            if(!internalEvents)cancel('MESSAGE_SWIPE_DELETED');
        });
        for(const name of ['CHAT_CHANGED','MESSAGE_SENT','MESSAGE_RECEIVED','MESSAGE_DELETED','MESSAGE_SWIPED','MESSAGE_EDITED','MESSAGE_UPDATED'])on(name,()=>{if(!internalEvents)cancel(name);});
        unsubscribe=()=>{cancel('Controller disposed');for(const [event,fn]of subscriptions)(c.eventSource.removeListener ?? c.eventSource.off)?.call(c.eventSource,event,fn);unsubscribe=null;};
        return unsubscribe;
    }
    const controller={beforeGenerate,runPre,runPost,runTarget,apply,candidateStatus,cancel,lastResult:()=>result,lastAutomaticResult:()=>automaticResult,subscribe,dispose:()=>unsubscribe?.()};
    retentionInspectors.set(controller,()=>{
        const runs=new Set([active,...[...sources.values(),...candidates.values()].map(entry=>entry.run)].filter(Boolean));
        const recordings=new Set([result?.recording,automaticResult?.result.recording,...[...runs].map(run=>run.publicResult?.recording),...[...candidates.values()].map(entry=>entry.applied?.recording)].filter(Boolean));
        return freezeArtifact({distinctRecordings:recordings.size,sourceCount:sources.size,candidateCount:candidates.size,runs:[...runs].map(run=>({hasCancel:Object.hasOwn(run,'cancel'),bindingContexts:run.bindingContexts.size,bindingChecks:run.bindingChecks.map(check=>({fields:Object.keys(check).sort(),...(check.node?{nodeFields:Object.keys(check.node).sort()}:{}),...(check.graph?{graphFields:Object.keys(check.graph).sort()}:{} )}))}))});
    });
    return controller;
}
