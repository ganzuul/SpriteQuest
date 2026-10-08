import { runWorkflow, freezeArtifact, workflowSignature } from './runtime.js?v=0.19.1';
import { resolveBinding, requestModel } from './connections.js?v=0.19.1';

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
    const keys=new Set(), sources=new Map(), stopped=new WeakMap();
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
        result=freezeArtifact(value);
        // Keep the editable graph reference outside the frozen result. Only a fresh
        // completed Send can replace this one bounded, inspectable origin record.
        const origin=run?.native ? Object.freeze({graph:run.originalGraph,graphId:run.graph.id,graphName:run.graph.name,signature:run.signature,phase:'pre',kind:'send',runId:run.epoch}) : null;
        if(origin)automaticResult=Object.freeze({result,origin});
        try{ports.onResult?.(result,origin);}catch{/* UI observers cannot own lifecycle. */}
        return result;
    };
    const clear=()=>{
        const c=context();
        // Clear guidance left by the previous brand during an in-place upgrade.
        for(const key of Object.keys(c.extensionPrompts ?? {})) if(key.startsWith(PREFIX) || key.startsWith('comfytavern:guidance:')) keys.add(key);
        for(const key of keys) { try{c.setExtensionPrompt?.(key,'',1,0,false,0);if(c.extensionPrompts?.[key])c.extensionPrompts[key].value='';}catch{if(c.extensionPrompts)delete c.extensionPrompts[key];} }
    };
    const cancel=(reason='Workflow canceled')=>{
        epoch++; sources.clear(); clear();
        if(active) {active.controller.abort(reason); const abort=active.abortPrimary;active.abortPrimary=null;try{abort?.(true);}catch{/* Native abort callback is best effort. */}}
        active=null;
    };
    const fresh=(run)=>run.epoch===epoch && !run.controller.signal.aborted && same(run.identity,identity(context())) && run.signature===workflowSignature(run.originalGraph) && (!run.native || (ports.isEnabled?.() !== false && ports.getGraph?.('pre')===run.originalGraph));
    const start=(graph,native=false,abortPrimary=null)=>{
        cancel('Superseded by a new workflow');
        const run={epoch,controller:new AbortController(),identity:identity(context()),graph:structuredClone(graph),signature:workflowSignature(graph),originalGraph:graph,native,abortPrimary,pending:true};
        active=run; return run;
    };
    const execute=async(run,snapshot,phase)=>runWorkflow(run.graph,{
        phase,signal:run.controller.signal,snapshot,
        countTokens:ports.countTokens,
        resolveBinding:(node,graph)=>(ports.resolveBinding ?? ((n,g)=>resolveBinding(n,g,context())))(node,graph),
        request:ports.request ?? (request=>requestModel(request,context())),
        onStage:ports.onStage,
    });
    const preSnapshots=(run,c,chat)=>new Map(Object.values(run.graph.nodes ?? {}).filter(node=>node.operation==='scene-context').map(node=>[node.id,snapshotContext(c,{chat,node})]));
    async function runPre(graph) {
        const run=start(graph);const c=context();const snapshots=preSnapshots(run,c,c.chat);
        const value=await execute(run,(_phase,node)=>snapshots.get(node.id), 'pre');
        if(!fresh(run)) return fail('STALE_RUN','Workflow source or settings changed.');
        active=null;return notify(value);
    }
    async function beforeGenerate(chat,_contextSize,abort,type='normal') {
        clear(); type=type || 'normal';
        if(generation.aborted) {abort?.(true);return notify(fail('ABORTED','The native generation was stopped before workflow preparation.'));}
        if(generation.dryRun || !['normal','swipe','regenerate','continue'].includes(type)) {if(active)cancel('Overlapping background generation');return {ok:true,skipped:true};}
        if(ports.isEnabled?.() === false) return {ok:true,skipped:true};
        const tail=(chat ?? []).at(-1),liveTail=context().chat?.at(-1);
        if([tail,liveTail].some(message=>message?.is_tool || message?.extra?.tool_invocations?.length)) {
            if(active)cancel('Internal tool continuation');
            return {ok:true,skipped:true,reason:'internal-tool-continuation'};
        }
        const graph=ports.getGraph?.('pre');if(!graph)return {ok:true,skipped:true};
        if(active?.native) {cancel('Overlapping native generation');abort?.(true);return notify(fail('OVERLAPPING_GENERATION','Overlapping native requests are unsupported; send again when settled.'));}
        const run=start(graph,true,abort), c=context(), snapshots=preSnapshots(run,c,chat), original=sourceText(chat);
        generation.originalTail ??= {message:c.chat?.at(-1),text:c.chat?.at(-1)?.mes};
        let value=await execute(run,(_phase,node)=>snapshots.get(node.id),'pre');
        if(!fresh(run) || sourceText(chat)!==original) {if(active===run)cancel('Source changed during preparation');return fail('STALE_RUN','Stopped or changed generation cannot publish guidance.');}
        if(!value.ok) {
            clear();active=null;
            if(value.error.code==='ABORTED') {run.abortPrimary?.(true);run.abortPrimary=null;return notify(value,run);}
            return notify({...value,fallback:'native',reports:[...value.reports,{code:'NATIVE_FALLBACK',message:'Preparation failed; SillyTavern will generate without Lattice guidance.'}]},run);
        }
        try {
            if(typeof c.setExtensionPrompt!=='function')throw new Error('Prompt setter unavailable');
            for(const output of value.outputs) {
                const key=PREFIX+output.nodeId;keys.add(key);
                c.setExtensionPrompt(key,output.artifact.text,1,0,false,0);
                if(c.extensionPrompts && c.extensionPrompts[key]?.value!==output.artifact.text)throw new Error('Prompt not accepted');
            }
            run.pending=false;
            return notify({...value,published:true},run);
        } catch {
            clear();active=null;return notify({...value,ok:false,error:{code:'GUIDANCE_UNAVAILABLE',message:'Native guidance could not be installed; the native reply remains available.'},fallback:'native'},run);
        }
    }
    async function runPost(graph,messageIndex) {
        if(ports.isBusy?.() || applying)return notify(fail('BUSY','Wait for generation or reply application to finish.'));
        const c=context(), snapshot=snapshotReply(c,messageIndex);
        if(snapshot.ok===false)return notify(snapshot);
        const message=c.chat[snapshot.source.messageIndex];
        if(stoppedRevision(message))return notify(fail('REPLY_UNAVAILABLE','The stopped reply is not a completed repair target.'));
        const run=start(graph), entry={message,chat:c.chat,refs:[...c.chat],prefix:sourceText(c.chat),swipeText:message.swipes?.[snapshot.source.swipeId],source:snapshot.source,run,candidate:null,applied:null};
        sources.set(snapshot.source.token,entry);
        const value=await execute(run,()=>snapshot,'post');
        if(!fresh(run) || !validSource(entry))return fail('STALE_SOURCE','The reply changed during review preparation.');
        active=null;
        if(value.ok && value.artifact?.kind==='candidate')entry.candidate=structuredClone(value.artifact);
        return notify(value);
    }
    function validSource(entry) {
        const c=context(),s=entry.source;
        return fresh(entry.run) && !ports.isBusy?.() && c.chat===entry.chat && c.chat.length===s.chatLength && c.chat.every((m,i)=>m===entry.refs[i]) && c.chat[s.messageIndex]===entry.message && s.messageIndex===c.chat.length-1 && completed(entry.message) && !incompleteStream(c,s.messageIndex) && !stoppedRevision(entry.message) && (entry.message.swipe_id ?? 0)===s.swipeId && entry.message.swipes?.[s.swipeId]===entry.swipeText && entry.message.mes===s.originalText && sourceText(c.chat)===entry.prefix;
    }
    function candidateStatus(candidate) {
        const entry=sources.get(candidate?.source?.token);
        if(!entry || !entry.candidate || !same(candidate,entry.candidate))return fail('STALE_CANDIDATE','This candidate is no longer available; run the workflow again.');
        if(entry.applied)return fail('ALREADY_APPLIED','This revision has already been applied.');
        if(applying || ports.isBusy?.())return fail('BUSY','Wait for generation or reply application to finish.');
        return validSource(entry)?{ok:true}:fail('STALE_SOURCE','The chat, reply or swipe changed. Run the workflow again.');
    }
    async function apply(candidate) {
        const entry=sources.get(candidate?.source?.token);
        if(!entry || !entry.candidate || !same(candidate,entry.candidate))return notify(fail('STALE_CANDIDATE','This candidate is no longer available; run the workflow again.'));
        if(entry.applied) {
            if(same(identity(context()),entry.run.identity) && context().chat?.[entry.source.messageIndex]===entry.message && entry.message.mes===candidate.text && entry.message.swipe_id===entry.applied.swipeId)return entry.applied;
            return notify(fail('STALE_CANDIDATE','The applied revision is no longer the selected reply.'));
        }
        if(applying)return fail('BUSY','A reply application is already in progress.');
        if(!validSource(entry))return notify(fail('STALE_SOURCE','The chat, reply or swipe changed. Run the workflow again.'));
        const c=context(),m=entry.message,index=entry.source.messageIndex;
        if(typeof c.saveChat!=='function' || typeof c.updateMessageBlock!=='function' || typeof c.swipe?.refresh!=='function' || typeof ports.syncMesToSwipe!=='function' || typeof ports.syncSwipeToMes!=='function')return notify(fail('APPLY_UNAVAILABLE','Required native save, display or swipe synchronization APIs are unavailable.'));
        const backup=structuredClone(m); let mutated=false,saveAttempted=false;
        applying=true;
        try {
            // No await is allowed between this last source check and the mutation.
            if(!validSource(entry))throw new Error('Source changed');
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
            const stillApplied=()=>intactSwipes() && entry.run.epoch===epoch && same(identity(context()),entry.run.identity) && !ports.isBusy?.() && context().chat===entry.chat && c.chat.length===entry.source.chatLength && c.chat.every((item,i)=>item===entry.refs[i]) && m.mes===candidate.text && m.swipe_id===swipeId;
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
            entry.applied=freezeArtifact({ok:true,appliedLocally:true,saveAttempted:true,persistence:'unverified',swipeId,artifact:candidate,reports:[{code:'PERSISTENCE_UNVERIFIED',message:'Applied locally and requested a save. The host does not acknowledge durable persistence; other memory extensions may retain the original.'}],calls:[],trace:[]});
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
    return {beforeGenerate,runPre,runPost,apply,candidateStatus,cancel,lastResult:()=>result,lastAutomaticResult:()=>automaticResult,subscribe,dispose:()=>unsubscribe?.()};
}
