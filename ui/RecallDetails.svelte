<script lang="ts">
 import type {RecallNodeStatus} from './recall-types';
 import type {DetailEditResponse} from './detail-types';
 let {view,actions}:{view:RecallNodeStatus;actions:{queue?:()=>DetailEditResponse;cancel?:()=>DetailEditResponse;revealShortcut?:(nodeId:string)=>void}}=$props();
 let pending=$state(false),issue=$state(''),identity='',sequence=0;
 $effect(()=>{if(identity!==view.nodeId){identity=view.nodeId;sequence++;pending=false;issue='';}});
 async function change(action:'queue'|'cancel'){if(pending)return;const nodeId=view.nodeId,token=++sequence;pending=true;issue='';try{const result=await actions[action]?.();if(token===sequence&&nodeId===view.nodeId&&result?.ok!==true)issue=result?.error.message??'Memory recall is unavailable.';}catch{if(token===sequence&&nodeId===view.nodeId)issue='Memory recall could not be updated.';}finally{if(token===sequence&&nodeId===view.nodeId)pending=false;}}
</script>
<section class="pc-recall-details" aria-label="Memory recall">
 <h3>Memory recall</h3><p role="status">{view.statusText}</p>
 <dl><dt>Memory set</dt><dd>{view.memorySetId || 'Choose a memory set'}</dd><dt>Target</dt><dd>{view.targetLabel}</dd><dt>Repetition</dt><dd>{view.useLabel}</dd><dt>Consume on</dt><dd>{view.consumeLabel}</dd></dl>
 {#if view.queued}<p>Remaining: {view.remainingText}</p>{/if}
 {#if view.pendingCount}<p>Pending generations: {view.pendingCount}</p>{/if}
 <div class="pc-detail-actions"><button type="button" disabled={pending||!view.queueAllowed||!actions.queue} title={!view.queueAllowed?view.reason||'Recall is already queued.':undefined} onclick={()=>change('queue')}>Queue recall</button><button type="button" disabled={pending||!view.cancelAllowed||!actions.cancel} onclick={()=>change('cancel')}>Cancel recall</button></div>
 {#if view.reason}<p>{view.reason}</p>{/if}{#if issue}<p role="alert">{issue}</p>{/if}
 {#if view.shortcutNodeIds.includes(view.nodeId)&&view.consumerCount===0}<p>Add a matching Recall node and connect it to the workflow. Queueing this Shortcut has an effect when that Recall executes.</p>{/if}
 {#each view.hotkeys as key (key.nodeId)}<button type="button" class="pc-recall-link" disabled={!actions.revealShortcut} onclick={()=>actions.revealShortcut?.(key.nodeId)}>Recall Shortcut · {key.label}</button>{/each}
 <small>Matching nodes share one request. The first successful matching Recall supplies the selection for a generation. Use different memory-set IDs for independent selections. Automatic triggers keep their own conditions.</small>
</section>
<style>.pc-recall-details{padding:10px 0;border-block:1px solid var(--pc-border);margin:10px 0}h3{font-size:13px;margin:0 0 8px}dl{display:grid;grid-template-columns:auto 1fr;gap:4px 10px}dt{opacity:.75}dd{margin:0;overflow-wrap:anywhere}p,small{line-height:1.5}small{display:block;margin-top:8px;opacity:.8}.pc-detail-actions{display:flex;gap:6px;flex-wrap:wrap}.pc-recall-link{display:block;margin-top:6px}</style>
