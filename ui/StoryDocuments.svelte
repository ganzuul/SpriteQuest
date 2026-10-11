<script lang="ts">
    import DiagnosticMessage from './DiagnosticMessage.svelte';
 import {createStoryClockTemplate} from '../src/ui/story-document-setup.js';
 import type {StoryDocumentsView,StoryDocumentsActions} from './storage-setup-types';
 import type {StoryDocumentDefinition} from '../src/workflow/document-catalog';
 let {view,actions,close}:{view:StoryDocumentsView;actions?:StoryDocumentsActions;close:()=>void}=$props();
 let selected=$state(''),targetId=$state(''),name=$state(''),format=$state<StoryDocumentDefinition['format']>('json'),content=$state(''),visibility=$state<'public'|'hidden'|'actor-private'>('public'),actorId=$state(''),columns=$state(''),pending=$state(false),failure=$state(''),message=$state(''),loaded=$state(false),calendarId=$state('story-calendar'),absoluteMinute=$state(0);
 let capture='',generation=0;
 function reset(){targetId='';name='';format='json';content='';visibility='public';actorId='';columns='';loaded=false;failure='';message='';}
 $effect(()=>{if(view.key===capture)return;capture=view.key;generation++;pending=false;selected='';reset();});
 function select(){generation++;pending=false;reset();const summary=view.documents.find(doc=>doc.targetId===selected);if(summary){targetId=summary.targetId;name=summary.name;format=summary.format;visibility=summary.visibility.kind;actorId=summary.visibility.kind==='actor-private'?summary.visibility.actorId:'';columns=summary.columns?.join(', ')??'';}}
 function clockTemplate(){const result=createStoryClockTemplate(targetId,calendarId,absoluteMinute);if(result.ok){content=result.data.text;failure='';}else failure=result.error.code + ': ' + result.error.message;}
 async function perform(kind:'load'|'save'|'remove'){
  if(!actions||pending||!view.key)return;const key=view.key,request=++generation;pending=true;failure='';message='';
  try{
   let result:any;
   if(kind==='load')result=await actions.load(key,selected);
   else if(kind==='remove')result=await actions.remove(key,selected);
   else {const definition:StoryDocumentDefinition={targetId,name,format,content,visibility:visibility==='actor-private'?{kind:visibility,actorId}:{kind:visibility}};if(format==='csv')definition.columns=columns.split(',').map(column=>column.trim()).filter(Boolean);result=await actions.save(key,definition);}
   if(key!==view.key||request!==generation)return;
   if(!result?.ok){failure=(result?.error ? result.error.code + ': ' + result.error.message : undefined)??'Workflow Data setup could not be applied.';return;}
   if(kind==='load'){const definition=result.data?.definition;if(!definition){failure='The initial template could not be loaded.';return;}targetId=definition.targetId;name=definition.name;format=definition.format;content=definition.content;visibility=definition.visibility.kind;actorId=definition.visibility.actorId??'';columns=definition.columns?.join(', ')??'';loaded=true;}
   else {message=result.data?.message??'Authorization updated locally.';loaded=false;}
  }catch{if(key===view.key&&request===generation)failure='Workflow Data setup could not be applied.';}
  finally{if(key===view.key&&request===generation)pending=false;}
 }
</script>
<div class="pc-story-documents">
 <p>Active user: {view.scope.userId || 'Unavailable'} · Chat: {view.scope.chatId || 'Unavailable'}</p>
 <p>Manage the documents used by your workflows here. Updating an authorization or its initial template leaves existing canonical document content intact. Read File and Write File use these target IDs.</p>
 {#if view.issue}<div><DiagnosticMessage issue={view.issue} /></div>{/if}
 <label>Workflow data document<select aria-label="Workflow data document" bind:value={selected} onchange={select} disabled={pending}><option value="">New document authorization</option>{#each view.documents as doc (doc.targetId)}<option value={doc.targetId}>{doc.name} ({doc.targetId}, {doc.format}, {doc.visibility.kind})</option>{/each}</select></label>
 <div class="pc-document-actions"><button type="button" disabled={!selected||pending} onclick={()=>perform('load')}>Load initial template</button><button type="button" disabled={!selected||pending} onclick={()=>perform('remove')}>Remove authorization</button><button type="button" disabled={pending} onclick={()=>actions?.refresh()}>Refresh scope</button></div>
 <form onsubmit={event=>{event.preventDefault();void perform('save');}}>
  <label>Logical target ID<input aria-label="Logical target ID" maxlength="128" bind:value={targetId} disabled={!!selected||pending} placeholder="souls.json" /></label>
  <label>Document name<input aria-label="Document name" maxlength="256" bind:value={name} disabled={pending} /></label>
  <label>Format<select aria-label="Document format" bind:value={format} disabled={!!selected||pending}><option value="json">JSON</option><option value="jsonl">JSON Lines</option><option value="csv">CSV</option><option value="text">Plain text</option><option value="markdown">Markdown</option></select></label>
  <label>Visibility<select aria-label="Document visibility" bind:value={visibility} disabled={pending}><option value="public">Public</option><option value="hidden">Hidden</option><option value="actor-private">Actor private</option></select></label>
  {#if visibility==='actor-private'}<label>Actor ID<input aria-label="Actor ID" maxlength="128" bind:value={actorId} disabled={pending} /></label>{/if}
  {#if format==='csv'}<label>CSV columns, comma separated<input aria-label="CSV columns" bind:value={columns} disabled={pending} /></label>{/if}
  {#if format==='json'}<details><summary>Story clock template</summary><label>Calendar ID<input aria-label="Calendar ID" bind:value={calendarId} disabled={pending} /></label><label>Starting story minute<input aria-label="Starting story minute" type="number" min="0" step="1" bind:value={absoluteMinute} disabled={pending} /></label><button type="button" disabled={!targetId.trim()||pending||!!selected&&!loaded} onclick={clockTemplate}>Use story clock template</button><p>Midnight on the first day is minute 0. The clock advances through graph events, using explicit story time.</p></details>{/if}
  <label>Initial template<textarea aria-label="Initial template" rows="7" maxlength="100000" bind:value={content} disabled={pending||!!selected&&!loaded} placeholder={format==='json'?'[]':''}></textarea></label>
  <p>JSON templates preserve your chosen object or list structure. CSV uses the named columns. Existing authorizations require explicit template loading before editing.</p>
  {#if failure}<div><DiagnosticMessage issue={failure} /></div>{/if}{#if message || view.notice}<p role="status">{message || view.notice}</p>{/if}
  <footer><button type="button" onclick={close}>Close</button><button type="submit" disabled={!actions||!view.key||!targetId.trim()||!name.trim()||pending||!!selected&&!loaded||visibility==='actor-private'&&!actorId.trim()}>{pending?'Saving…':'Save authorization'}</button></footer>
 </form>
</div>
<style>
 .pc-story-documents {width:min(520px,100%);font-size:12px;} p {line-height:1.5;color:var(--pc-muted,#aeb7ba);} label {display:block;margin:12px 0;} input,select,textarea {display:block;width:100%;box-sizing:border-box;margin-top:4px;padding:6px;border:1px solid var(--pc-border,#ffffff30);background:var(--pc-canvas,#141516);color:inherit;font:inherit;} textarea {resize:vertical;} button {padding:5px 8px;background:var(--pc-block,#2a2c2e);color:inherit;border:1px solid var(--pc-border,#ffffff30);font:inherit;} footer,.pc-document-actions {display:flex;gap:7px;flex-wrap:wrap;} footer {justify-content:flex-end;} :disabled {opacity:.5;} :is(input,select,textarea,button):focus-visible {outline:2px solid var(--pc-flow,#e18a24);outline-offset:1px;}
</style>
