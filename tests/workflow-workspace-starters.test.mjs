import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fixtureGraph} from './helpers/workflow-fixtures.mjs';
import {withBrowserWorker} from './helpers/consumed-memory-fixtures.mjs';
import {runWorkflow} from '../src/workflow/runtime.js';
import {parseSubgraph} from '../src/workflow/packages.js';
import {definitionRefKey} from '../src/workflow/definitions.js';
const target=(graph,nodeId,portId='out')=>({workflowId:graph.id,instancePath:[],nodeId,portId});
const source=text=>({kind:'draft',text,source:{chatId:'fixture',messageIndex:1,swipeId:0,originalText:text,token:'fixture-source'}});

test('structured preparation target computes guidance without native activation or publication',async()=>{
    const graph=fixtureGraph('structured-guidance');let effects=0;
    const result=await runWorkflow(graph,{target:target(graph,'compose-guidance'),request(){effects++;},resolveBinding(){effects++;}});
    assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(effects,0);assert.deepEqual(result.recording.terminals,[]);
    assert.ok(result.recording.artifacts.some(artifact=>artifact.value?.text==='Direction: A quiet conversation.\nConstraint: Let the user choose their next action.'));
});
test('literal cleanup target uses a real worker and grants no Apply authority',async()=>withBrowserWorker(async()=>{
    const graph=fixtureGraph('literal-cleanup'),input=source('It was very very quiet.'),before=structuredClone(input);let effects=0;
    const result=await runWorkflow(graph,{target:target(graph,'validate-patches'),snapshot:()=>input,request(){effects++;},resolveBinding(){effects++;}});
    assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(result.actualCalls,0);assert.equal(effects,0);assert.deepEqual(result.recording.terminals,[]);assert.deepEqual(input,before);
    assert.ok(result.recording.artifacts.some(artifact=>artifact.kind==='candidate'&&artifact.value.text==='It was very quiet.'));
}));
test('pinned deterministic cleanup body retains its Draft/Patches interface in a unified diagnostic root',async()=>withBrowserWorker(async()=>{
    const parsed=parseSubgraph(await readFile(new URL('../workflows/subgraphs/literal-cleanup.json',import.meta.url),'utf8'));
    assert.equal(parsed.ok,true,JSON.stringify(parsed.error));const definition=parsed.data.definition;
    assert.deepEqual(definition.interface.map(port=>[port.id,port.direction,port.kind]),[['draft','input','draft'],['patches','output','patches']]);
    assert.deepEqual(definition.parameters.map(parameter=>parameter.target.controlId),['rules']);
    const graph=fixtureGraph('literal-cleanup'),old=graph.nodes['text-rules'];graph.definitions={[definitionRefKey(definition)]:definition};graph.nodes['text-rules']={id:old.id,type:'subgraph',definition:{id:definition.id,version:definition.version,semanticHash:definition.semanticHash},x:old.x,y:old.y};graph.wires['wire-1'].toPort='draft';graph.wires['wire-2'].fromPort='patches';
    const result=await runWorkflow(graph,{target:target(graph,'validate-patches'),snapshot:()=>source('It was very very quiet.')});
    assert.equal(result.ok,true,JSON.stringify(result.error));assert.deepEqual(result.recording.terminals,[]);assert.ok(result.recording.artifacts.some(artifact=>artifact.kind==='candidate'&&artifact.value.text==='It was very quiet.'));
}));
