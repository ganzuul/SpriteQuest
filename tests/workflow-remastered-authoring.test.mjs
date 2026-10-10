import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
test('Decision lessons retain stable packages and use nullable ordinary answers',async()=>{
 const {REMASTERED_WORKFLOW_EXAMPLE_DATA:entries}=await import('../src/workflow/remastered-example-data.js');
 const promise=entries[10].packages[0].graph,kiss=entries[28].packages[0].graph;
 assert.equal(promise.nodes['promise-decision'].operation,'decision');
 assert.equal(promise.nodes['promise-gate'].operation,'branch');
 assert.deepEqual(promise.nodes['promise-acceptance'].fields[0].path,['answers','promise','accepted']);
 assert.equal(kiss.nodes['kiss-decision'].operation,'decision');
 assert.deepEqual(kiss.nodes['kiss-gate'].fields[0].path,['answers','kiss','accepted']);
 assert.ok(Object.values(kiss.wires).some(w=>w.from==='kiss-gate'&&w.fromPort==='out'&&w.to==='confirmed-kiss'));
 assert.ok(existsSync(new URL('../examples/remastered/11-detect-a-promise-with-fast-decision.lattice.json',import.meta.url)));
 for(const entry of entries)assert.equal(JSON.stringify(entry.packages).includes('fast-decision'),false);
});
test('new authored curriculum supplies exactly thirty complete unified lessons', async()=>{
 const path=new URL('../src/workflow/remastered-example-data.js',import.meta.url);
 assert.ok(existsSync(path),'The new curriculum data has not been authored');
 const {REMASTERED_WORKFLOW_EXAMPLE_DATA: entries}=await import(path);
 assert.equal(entries.length,30);
 assert.deepEqual(entries.map(e=>e.number),Array.from({length:30},(_,i)=>i+1));
 for(const entry of entries){assert.equal(entry.id,`lesson-${String(entry.number).padStart(2,'0')}`);assert.equal(entry.packages.length,1);assert.equal(entry.packages[0].graph.mode,'native-unified');assert.ok(entry.lesson.steps.length);assert.ok(entry.lesson.checkpoints.length);}
});
test('composition uses pinned pure processors, bounded iteration and live file reference staging', async()=>{
 const {REMASTERED_WORKFLOW_EXAMPLE_DATA: entries}=await import('../src/workflow/remastered-example-data.js');
 const helper=entries.find(e=>e.number===13);assert.ok(helper,'Reusable processor lesson is missing');
 assert.equal(Object.values(helper.packages[0].graph.nodes).filter(n=>n.type==='subgraph').length,2);
 const each=entries.find(e=>e.number===14).packages[0].graph.nodes['explain-each'];assert.equal(each.limit,3);assert.equal(each.requestBoundPerIteration,1);
 const record=entries.find(e=>e.number===17).packages[0].graph;assert.ok(Object.values(record.wires).some(w=>record.nodes[w.from]?.operation==='read-file'&&w.fromPort==='reference'&&record.nodes[w.to]?.operation==='write-file'));
});
import {parseWorkflow} from '../src/workflow/packages.js';
import {validateWorkflow} from '../src/workflow/contracts.js';
import {prepareWorkflowPlanner} from '../src/workflow/resolve.js';
import {portsForNode,operationFor,phaseForNode} from '../src/workflow/catalog.js';
import {definitionRefKey,validateDefinition} from '../src/workflow/definitions.js';
import {prepareWorkflowInsertion} from '../src/workflow/insertion.js';
test('every lesson round-trips, prepares and installs additively without changing a saved graph', async()=>{
 const {REMASTERED_WORKFLOW_EXAMPLE_DATA:entries}=await import('../src/workflow/remastered-example-data.js');
 const empty={id:'saved',name:'Existing saved workflow',schema:3,runtime:2,mode:'native-unified',nodes:{},wires:{},groups:{},roles:{},definitions:{},portals:{}};
 const before=JSON.stringify(empty);
 for(const entry of entries){const parsed=parseWorkflow(JSON.stringify(entry.packages[0]));assert.equal(parsed.ok,true,entry.id+JSON.stringify(parsed.error));const graph=parsed.data;assert.equal(validateWorkflow(graph).ok,true,entry.id);assert.equal(prepareWorkflowPlanner(graph).ok,true,entry.id);const inserted=prepareWorkflowInsertion(empty,graph);assert.equal(inserted.ok,true,entry.id+JSON.stringify(inserted.error));assert.equal(JSON.stringify(empty),before);for(const [key,definition]of Object.entries(graph.definitions)){assert.equal(key,definitionRefKey(definition));assert.equal(validateDefinition(definition,graph.definitions).ok,true);for(const n of Object.values(definition.body.nodes))if(n.type==='workflow')assert.equal(operationFor(n)?.rootOnly??false,false,`${entry.id} helper may not contain a host authority source`);}for(const n of Object.values(graph.nodes))if(n.type==='workflow'){assert.ok(n.alias.startsWith(operationFor(n,{phase:phaseForNode(graph,n),mode:graph.mode}).title),`${entry.id} alias preserves operation`);assert.ok(portsForNode(graph,n).length);}for(const checkpoint of entry.lesson.checkpoints){const n=Object.values(graph.nodes).find(n=>n.alias===checkpoint.node);assert.ok(n,entry.id+' checkpoint alias');assert.ok(portsForNode(graph,n).some(p=>p.id===checkpoint.port),entry.id+' checkpoint pin');}}
});
test('authority stays at genuine root sources and exact live file/clock references', async()=>{
 const {REMASTERED_WORKFLOW_EXAMPLE_DATA:entries}=await import('../src/workflow/remastered-example-data.js');
 const wire=(g,from,port,to,input)=>Object.values(g.wires).some(w=>w.from===from&&w.fromPort===port&&w.to===to&&w.toPort===input);
 for(const entry of entries){const g=entry.packages[0].graph;for(const n of Object.values(g.nodes)){if(n.operation==='write-file'){const edge=Object.values(g.wires).find(w=>w.to===n.id&&w.toPort==='reference');assert.equal(g.nodes[edge?.from]?.operation,'read-file');assert.equal(edge.fromPort,'reference');}if(n.operation==='commit-clock'){const edge=Object.values(g.wires).find(w=>w.to===n.id&&w.toPort==='projection');assert.equal(g.nodes[edge?.from]?.operation,'advance-time');assert.equal(edge.fromPort,'report');const occurrence=Object.values(g.wires).find(w=>w.to===n.id&&w.toPort==='occurrences');if(occurrence)assert.equal(g.nodes[occurrence.from].operation,'advance-time');}if(n.operation==='actor-context'||n.operation==='character-direction'){assert.ok(Object.values(g.wires).some(w=>w.to===n.id&&w.toPort==='presence'));}}}
 const kiss=entries[28].packages[0].graph;for(const name of ['rowan','iris']){assert.equal(JSON.parse(kiss.nodes[name+'-permission-text'].text).allowModelAuthoredReflection,false);assert.ok(wire(kiss,name+'-file','reference',name+'-save','reference'));assert.equal(kiss.nodes[name+'-file'].actorId,kiss.nodes[name+'-context'].actorId);assert.equal(kiss.nodes[name+'-save'].actorId,kiss.nodes[name+'-context'].actorId);}
});

test('relationship portrayal carries projected private State through verified Character Direction', async () => {
 const {REMASTERED_WORKFLOW_EXAMPLE_DATA:entries}=await import('../src/workflow/remastered-example-data.js');
 const graph=entries[29].packages[0].graph;
 assert.equal(graph.nodes.portrayal.operation,'character-direction');
 assert.ok(Object.values(graph.wires).some(w=>w.from==='relationship'&&w.fromPort==='out'&&w.to==='portrayal'&&w.toPort==='data'));
 assert.ok(Object.values(graph.wires).some(w=>w.from==='rowan-route'&&w.fromPort==='yes'&&w.to==='portrayal'&&w.toPort==='presence'));
 assert.equal(Object.values(graph.nodes).some(n=>n.operation==='actor-context'),false);
 for (const actor of ['rowan','iris']) {
  const kiss=entries[28].packages[0].graph;
  assert.ok(Object.values(kiss.wires).some(w=>w.from===actor+'-prompt-gate'&&w.fromPort==='yes'&&w.to===actor+'-reflect'&&w.toPort==='prompt'));
 }
});

test('paired reflection requires both actors before either private model leg', async () => {
 const {REMASTERED_WORKFLOW_EXAMPLE_DATA:entries}=await import('../src/workflow/remastered-example-data.js');
 const g=entries[28].packages[0].graph;
 for (const [key,other] of [['rowan','iris'],['iris','rowan']]) {
  assert.ok(Object.values(g.wires).some(w=>w.from===other+'-present'&&w.to===key+'-partner-prompt'&&w.toPort==='condition'));
  assert.ok(Object.values(g.wires).some(w=>w.from===key+'-partner-prompt'&&w.fromPort==='yes'&&w.to===key+'-kiss-prompt'&&w.toPort==='in'));
 }
});

test('memory lessons retain lawful producer and current-stage actor authority', async () => {
 const {REMASTERED_WORKFLOW_EXAMPLE_DATA:entries}=await import('../src/workflow/remastered-example-data.js');
 const memory=entries[17].packages[0].graph;
 assert.equal(memory.nodes.context.visibilityMode,'public');
 assert.equal(memory.nodes.settled.phase,'post');
 assert.equal(memory.nodes.commit.idempotencyKey,'lattice-memory-commit');
 assert.equal(memory.nodes['memory-direction'].operation,'character-direction');
 assert.ok(Object.values(memory.wires).some(w=>w.from==='express'&&w.to==='express-material'));
 const reminder=entries[21].packages[0].graph;
 assert.equal(reminder.nodes.remember.phase,'post');
 assert.equal(reminder.nodes.memories.phase,'post');
 for(const [number,id] of [[26,'memories-file'],[30,'relationship-state-file']]) {
  const graph=entries[number-1].packages[0].graph;
  assert.equal(graph.nodes[id].actorScope,'selected');
  assert.equal(graph.nodes[id].actorId,'');
  assert.equal(Object.values(graph.wires).some(w=>w.to===id&&w.toPort==='presence'),false);
 }
 const kiss=entries[28].packages[0].graph;
 assert.equal(kiss.nodes['rowan-present'].operation,'select-fields');
 assert.equal(kiss.nodes['rowan-presence-policy'].missingPolicy,'hold');
});

test('authored root cards participate in artifact flow or real host registration', async () => {
 const {REMASTERED_WORKFLOW_EXAMPLE_DATA:entries}=await import('../src/workflow/remastered-example-data.js');
 for(const e of entries){const g=e.packages[0].graph,wires=Object.values(g.wires);for(const n of Object.values(g.nodes)){if(n.type!=='workflow'||['review-publish','write-file','commit-clock','commit-outcomes','hotkey-arm'].includes(n.operation)||n.operation==='memory'&&n.mode==='commit')continue;assert.ok(wires.some(w=>w.from===n.id),e.id+' unused '+n.id);}}
});
