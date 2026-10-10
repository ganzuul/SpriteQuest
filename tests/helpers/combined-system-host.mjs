import {unifiedRecipeHost} from './unified-recipe-host.mjs';
import {actor,partner} from '../../tools/remastered/shared.mjs';
import {combinedExampleResources} from '../../tools/combined-system-example.mjs';
export const playerText='Rowan uses the broken wand. Rowan helped Iris repair the lantern. We wait eight hours.';
export const initialRelationship={values:[['trust',0],['desire',0],['tension',2],['excitement',0]].map(([dimension,value])=>({key:'rowan-toward-iris-'+dimension,value,subjectId:actor,objectId:partner,visibility:{kind:'actor-private',actorId:actor}})),ledger:[]};
export const combinedDocuments=combinedExampleResources;
const response=value=>({ok:true,data:{text:JSON.stringify(value),finish:'stop'}});
export const readDocument=(f,target)=>JSON.parse(f.c.chatMetadata.latticeDocuments?.['default-user']?.[target]?.content??f.catalog.definition(target).data.content);
/** Reuse the trusted native recipe harness; mock only raw extractor and decision answers. */
export function createCombinedHost(graph,{noUse=false,requestOverride,documents=combinedDocuments()}={}){
 let draws=0;const injections=[],requests=[];const sourceText=noUse?playerText.replace('uses','carries'):playerText;
 const f=unifiedRecipeHost(graph,{documents,playerText:sourceText,random:()=>{draws++;return .5;},configureContext:c=>{
  c.characters=[{avatar:'rowan.png',data:{name:'Rowan',description:'ROWAN PRIVATE SEA',visibility:{kind:'actor-private',actorId:actor}}},{avatar:'iris.png',data:{name:'Iris',description:'IRIS PRIVATE FIRE',visibility:{kind:'actor-private',actorId:partner}}}];
  const setter=c.setExtensionPrompt;c.setExtensionPrompt=(key,value,...args)=>{if(key.startsWith('lattice:guidance:')&&value)injections.push({key,text:value,chatLength:c.chat.length});return setter(key,value,...args);};
 },request:async options=>{
  const material=JSON.parse(options.messages[1].content);requests.push(material);if(requestOverride)return requestOverride(options,material,response);
  if(options.messages[0].content.startsWith('Evaluate')&&material.questions?.actual)return response({answers:{actual:{type:'noul',accepted:true}}});
  if(material.source?.text===sourceText){const quote='Rowan uses the broken wand.';return response({candidates:noUse?[]:[{eventType:'item-used',actorId:actor,itemId:'broken-wand',position:{start:0,end:quote.length},semantics:'actual'}]});}
  if(material.data?.text===sourceText&&material.request?.includes('supportive interaction')){const quote='Rowan helped Iris repair the lantern.',start=sourceText.indexOf(quote);return response([{eventType:'scene-action',actorId:actor,objectId:partner,position:{start,end:start+quote.length},semantics:'actual'}]);}
  throw Error('Unexpected model request: '+JSON.stringify(material));
 }});
 return {...f,injections,requests,draws:()=>draws,generate:()=>f.generate(noUse?'Rain starts. Rowan sets down the repaired lantern.':'Blue sparks flash as rain starts. Rowan sets down the repaired lantern.')};
}
