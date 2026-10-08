import assert from 'node:assert/strict';
import { runWorkflow } from '../src/workflow/runtime.js';
import { starterGraph } from '../src/workflow/starters.js';
const countTokens = async text => ({tokens: Math.ceil(text.length / 4), method:'fixture'});
const binding = {profileId:'fixed',model:'fake'};
const context = {kind:'context',messages:[{id:'1',role:'user',text:'What happens next?',source:'chat'}]};
const seen = [];
const ports = {snapshot:()=>structuredClone(context), countTokens, resolveBinding:()=>({ok:true,data:binding}), request:async request=>{seen.push(request); return {ok:true,data:{text:'Consider a quiet departure.',usage:{completion_tokens:6},finish:'stop'}};}};
{
 const graph = starterGraph('native-guidance');
 graph.nodes['scene-context'].y=9999;
 const before=JSON.stringify(graph);
 const result=await runWorkflow(graph,ports);
 assert.equal(result.ok,true); assert.equal(result.artifact.kind,'guidance');
 assert.equal(result.calls.length,1); assert.equal(result.callBound,2);
 assert.equal(seen[0].binding,binding); assert.equal(seen[0].maxTokens,768);
 assert.match(seen[0].messages[0].content,/guidance|proposal/i);
 assert.equal(JSON.stringify(graph),before);
 assert.equal(result.reports.at(-1).method,'fixture');
}
{
 const graph=starterGraph('native-guidance'); let calls=0;
 const result=await runWorkflow(graph,{...ports,resolveBinding:node=>node.operation==='response-plan'?{ok:false,error:{code:'PROFILE_MISSING',message:'Missing'}}:{ok:true,data:binding},request:async()=>{calls++;}});
 assert.equal(result.error.code,'PROFILE_MISSING'); assert.equal(calls,0);
 for(const options of [{dryRun:true},{preview:true}]) { const r=await runWorkflow(graph,{...ports,...options,request:async()=>{calls++;}}); assert.equal(r.calls.length,0); }
 assert.equal(calls,0);
 graph.wires.cycle={id:'cycle',from:'guidance',to:'scene-context',order:0};
 assert.equal((await runWorkflow(graph,ports)).ok,false);
}
{
 const graph=starterGraph('reviewed-de-slop');
 const source={originalText:'We delve.',token:'immutable-token'};
 const result=await runWorkflow(graph,{...ports,snapshot:()=>({kind:'draft',text:source.originalText,source}),request:async()=>({ok:true,data:{text:'{"patches":[{"index":0,"replacement":"explore"}]}',finish:'stop'}})});
 assert.equal(result.ok,true); assert.equal(result.artifact.text,'We explore.');
 assert.equal(result.artifact.source.token,source.token); assert.equal(result.artifact.reviewRequired,true); assert.equal(result.calls.length,1);
}
console.log('workflow runtime tests passed');
// Native graphs must never enter the lore-scanning legacy compiler/executor.
{
 const {installMock}=await import('./mock.js');const c=installMock();let scans=0;c.getWorldInfoPrompt=async()=>{scans++;return {};};
 const {compile}=await import('../src/compile.js');const {run,callCount}=await import('../src/run.js');
 const graph=starterGraph('native-guidance');
 assert.equal((await compile(graph)).ok,false);assert.equal((await run(graph)).plan.ok,false);assert.equal(scans,0);
 assert.equal(callCount(graph),2);
 const dec={id:'d',type:'decider',enabled:true,mode:'first',keys:[{id:'yes',conditions:[{mode:'ai',question:'Is it?',engine:'model'}]}]};
 assert.equal(callCount({nodes:{d:dec},wires:{}}),2,'Legacy yes/no can attempt two requests');
 dec.mode='ai';assert.equal(callCount({nodes:{d:dec},wires:{}}),1,'Legacy sorter has one call');
}
// Injected ports cannot promote missing completion evidence, and cutoff metadata remains inspectable.
{
 const g=starterGraph('native-guidance');
 const noEvidence=await runWorkflow(g,{...ports,request:async()=>({ok:true,data:{text:'Unsafe incomplete plan'}})});
 assert.equal(noEvidence.error.code,'COMPLETION_UNVERIFIED');
 const cutoff=await runWorkflow(g,{...ports,request:async()=>({ok:false,error:{code:'TRUNCATED_OUTPUT',message:'cut off',finish:'length',usage:{completion_tokens:768}}})});
 assert.equal(cutoff.calls.length,1);assert.equal(cutoff.trace[0].error.usage.completion_tokens,768);assert.equal(cutoff.trace[0].error.finish,'length');
}
