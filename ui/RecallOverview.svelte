<script lang="ts">
    import type {RecallOverviewView,RecallOverviewActions} from './types';
    let {view,actions,close}:{view:RecallOverviewView;actions?:RecallOverviewActions;close:()=>void}=$props();
    let pending=$state(''),issue=$state('');
    const shortcut=(key:RecallOverviewView['nodes'][number]['hotkey'])=>[key.ctrl?'Ctrl':'',key.alt?'Alt':'',key.shift?'Shift':'',key.meta?'Meta':'',key.code.replace(/^Key|^Digit/u,'')].filter(Boolean).join('+');
    async function change(nodeId:string,queued:boolean){if(pending)return;pending=nodeId;issue='';try{const result=await (queued?actions?.cancel(nodeId):actions?.queue(nodeId));if(result?.ok!==true)issue=result?.error.message??'Recall controls are unavailable.';}catch{issue='Recall controls are unavailable.';}finally{pending='';}}
</script>
<header><h2>Memory recall</h2><button type="button" onclick={close}>Close</button></header>
<p>Queue a memory set for the next reply, generated swipe, or both. Automatic Recall triggers use the workflow’s own conditions.</p>
{#if view.scope}<p>User {view.scope.userId} · Chat {view.scope.chatId} · Actor {view.scope.actorId}</p>{/if}
{#if view.issue || issue}<p role="alert">{issue || view.issue}</p>{/if}
{#if !view.nodes.length}<p>Add a Recall Shortcut node to the open unified workflow for the active character, then enable Lattice. Configure the actor, memory set, target and use policy in Details.</p>{/if}
{#each view.nodes as node (node.nodeId)}
    <fieldset><legend>{node.memorySetId} · {node.queued?'Queued':'Not queued'}</legend>
        <p>{shortcut(node.hotkey)} · {node.target} · {node.uses} · consume on {node.consumeOn}</p>
        <p>Remaining: {node.remaining.reply?'reply ':''}{node.remaining.swipe?'swipe':''}{!node.remaining.reply&&!node.remaining.swipe?'none':''}. Pending generations: {node.pendingCount}.</p>
        <button type="button" aria-label={(node.queued?'Cancel recall ':'Queue recall ')+node.memorySetId} disabled={!!pending || !actions} onclick={()=>change(node.nodeId,node.queued)}>{pending===node.nodeId?'Updating…':node.queued?'Cancel recall':'Queue recall'}</button>
    </fieldset>
{/each}
<p><button type="button" onclick={()=>actions?.refresh()} disabled={!!pending || !actions}>Refresh recall state</button></p>
<small>Shortcuts use physical keys and do not fire while typing in inputs. Duplicate active shortcuts require a different key. Editing the graph or switching scope revokes old shortcuts.</small>
<style>header{display:flex;align-items:center;justify-content:space-between;gap:1rem}fieldset{margin:1rem 0;padding:.75rem}p{line-height:1.5}small{display:block;line-height:1.5;opacity:.85}</style>
