import {recallActivationLabel,recallUseLabel,recallConsumeLabel,recallTargetLabel} from '../workflow/recall-labels.js?v=0.26.0';
const intersects=(a,b)=>a==='both'||b==='both'||a===b;
const policy=node=>JSON.stringify([node.actorId,node.memorySetId,node.target??'both',node.uses??'next-match',node.consumeOn??'accepted']);
const unique=values=>[...new Set(values)];
const keyLabel=hotkey=>[hotkey?.ctrl&&'Ctrl',hotkey?.alt&&'Alt',hotkey?.shift&&'Shift',hotkey?.meta&&'Meta',hotkey?.code?.replace(/^Key|^Digit/,'')].filter(Boolean).join('+');
/** Pure display projection. Authority and lifecycle metadata come from the trusted runtime. */
export function projectRecallView({rootGraph,status,enabled,issue='',nodeIds=[],viewKind='root'}){
 const graphNodes=Object.values(rootGraph?.nodes??{}),nodes={},groups=new Map();
 const relevant=graphNodes.filter(node=>['recall','hotkey-arm'].includes(node.operation));
 const unavailable=!enabled?'Lattice disabled':viewKind!=='root'?'Memory recall is available in the root workflow.':!status?.scope?issue||'Memory recall requires an active user, chat, and character.':'';
 for(const node of relevant){
  const target=node.target??'both',matches=graphNodes.filter(other=>other.operation==='hotkey-arm'&&other.actorId===node.actorId&&other.memorySetId===node.memorySetId).sort((a,b)=>a.id.localeCompare(b.id));
  const request=status?.requests?.find(request=>request.memorySetId===node.memorySetId&&request.queued);
  const actorCurrent=node.actorId===status?.scope?.actorId;
  const manual=node.operation==='hotkey-arm'||(node.activation??'armed').startsWith('armed');
  const compatible=new Set(matches.map(policy)).size<=1;
  const shortcut=matches[0],validPolicy=!!shortcut&&[recallTargetLabel(shortcut.target??'both'),recallUseLabel(shortcut.uses??'next-match'),recallConsumeLabel(shortcut.consumeOn??'accepted')].every(label=>label!=='Unavailable');
  const targetMatches=!!shortcut&&intersects(target,shortcut.target??'both');
  const registered=!!shortcut&&status?.shortcuts?.some(item=>(item.nodeId??item.id)===shortcut.id);
  const visible=!unavailable&&actorCurrent&&manual&&targetMatches;
  const queued=visible&&!!request;
  let reason=unavailable||(!actorCurrent?'This node belongs to another character.':!manual?'This Recall uses automatic triggers.':!matches.length?'Add a matching Recall Shortcut to queue this memory set.':!compatible?'Matching Recall Shortcuts use different policies. Make their target, repetition, and consumption settings match.':!validPolicy?'Choose supported Recall Shortcut settings.':!targetMatches?'The Recall and Shortcut generation targets do not overlap.':!registered?'The matching Recall Shortcut is unavailable.':'');
  const state=unavailable||!actorCurrent?'unavailable':queued?request.pendingState??'queued':'not-queued';
  const use=shortcut?.uses??'next-match',remaining=request?.remaining??{reply:false,swipe:false};
  const types=[remaining.reply&&'reply',remaining.swipe&&'generated swipe'].filter(Boolean).join(' and ');
  const statusText=state==='unavailable'?reason:state==='generation'?'Recall reserved for this generation':state==='acceptance'?'Recall awaiting acceptance':queued?use==='until-disarmed'?'Repeat until cancelled: '+types:use==='one-per-type'?'Queued once for each: '+types:'Queued for next '+types:'Not queued';
  const view={nodeId:node.id,memorySetId:node.memorySetId??'',state,queued,queueAllowed:!reason&&!queued,cancelAllowed:queued,reason,targetLabel:recallTargetLabel(shortcut?.target??target),useLabel:recallUseLabel(shortcut?.uses??node.uses??'next-match'),consumeLabel:recallConsumeLabel(shortcut?.consumeOn??node.consumeOn??'accepted'),activationLabel:node.operation==='recall'?recallActivationLabel(node.activation??'armed'):'Manual queue',statusText,remaining,pendingCount:queued?request.pendingGenerationCount??0:0,shortcutNodeIds:matches.map(item=>item.id),hotkeys:matches.map(item=>({nodeId:item.id,label:keyLabel(item.hotkey)})),...(queued?{badge:{state,tooltip:statusText,ariaLabel:'Memory recall: '+statusText+'. Open recall details.'}}:{})};
  nodes[node.id]=view;
  if(actorCurrent&&viewKind==='root'){const group=groups.get(view.memorySetId)??{memorySetId:view.memorySetId,nodeIds:[],shortcutNodeIds:[],hotkeys:[],view};group.nodeIds.push(node.id);group.shortcutNodeIds=unique([...group.shortcutNodeIds,...view.shortcutNodeIds]);group.hotkeys=view.hotkeys;groups.set(view.memorySetId,group);if(view.queueAllowed||view.cancelAllowed)group.view=view;}
 }
 const commands=ids=>{const views=unique(ids).map(id=>nodes[id]).filter(Boolean),queue=views.filter(node=>node.queueAllowed),cancel=views.filter(node=>node.cancelAllowed);return {queueNodeIds:queue.map(node=>node.nodeId),cancelNodeIds:cancel.map(node=>node.nodeId),queueShortcutNodeIds:unique(queue.map(node=>node.shortcutNodeIds[0])),cancelShortcutNodeIds:unique(cancel.map(node=>node.shortcutNodeIds[0])),queueMemorySetCount:unique(queue.map(node=>node.memorySetId)).length,cancelMemorySetCount:unique(cancel.map(node=>node.memorySetId)).length,queueReason:queue.length?'':views.find(node=>node.reason)?.reason??(views.some(node=>node.queued)?'Recall is already queued.':'Select an eligible Recall or Recall Shortcut node.'),cancelReason:cancel.length?'':unavailable||'No manual recall is queued for these nodes.',relevantNodeIds:views.map(node=>node.nodeId),excludedCount:ids.length-queue.length};};
 return {nodes,sets:[...groups.values()].map(group=>({...group,...group.view})).sort((a,b)=>a.memorySetId.localeCompare(b.memorySetId)),commands:{selected:commands(nodeIds),all:commands(relevant.map(node=>node.id))},issue:unavailable||issue};
}
