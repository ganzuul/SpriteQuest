const fail=message=>({ok:false,error:{code:'STALE_RECALL_CONTEXT',message}});
/** Ephemeral command authority; captured selection IDs never fall back to another scope. */
export function createRecallCommands(ports){
 const captures=new WeakMap();
 return Object.freeze({
 capture(nodeIds){const context=ports.readContext();if(!context||!Array.isArray(nodeIds)||!nodeIds.length||nodeIds.length>1000)return fail('Select an eligible Recall or Recall Shortcut node.');const native=ports.captureRecall();if(!native?.ok)return native??fail('Memory recall is unavailable.');const capture=Object.freeze({});captures.set(capture,{context,nodeIds:[...new Set(nodeIds)],native:native.data});return {ok:true,data:capture};},
 change(capture,action){const saved=captures.get(capture);if(!saved||!['queue','cancel'].includes(action)||!ports.isContextCurrent(saved.context))return fail('The document or selection changed. Reopen these controls and try again.');const context=ports.readContext();if(!context||!ports.isContextCurrent(saved.context))return fail('Memory recall is unavailable.');const allowed=action==='queue'?'queueAllowed':'cancelAllowed';const intended=saved.nodeIds.filter(id=>saved.context.projection.nodes[id]?.[allowed]);const views=intended.map(id=>context.projection.nodes[id]);if(views.some(view=>!view?.[allowed]))return fail('Recall eligibility changed. Reopen these controls and try again.');const eligible=views;if(!eligible.length)return fail(views.find(view=>view?.reason)?.reason||'No eligible memory recall requests in this selection.');const shortcutNodeIds=[...new Set(eligible.map(view=>view.shortcutNodeIds[0]))];const result=ports.changeRecallQueues(saved.native,{action,shortcutNodeIds});if(result?.ok)ports.changed(result.data);return result??fail('Memory recall is unavailable.');},
 openDetails(nodeId){ports.openDetails(nodeId);},
 });
}
