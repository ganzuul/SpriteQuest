import assert from 'node:assert/strict';
import test from 'node:test';
import { runWorkflow } from '../src/workflow/runtime.js';
import { describeOperation, operationDefaults } from '../src/workflow/catalog.js';
import { expandRecordAddress } from '../src/workflow/record-data.js';
const node=(id,operation,settings={})=>({id,type:'workflow',operation,...settings});
const wire=(id,from,fromPort,to,toPort)=>({id,route:'wire',from,fromPort,to,toPort});
const graph=(nodes,wires=[])=>({id:'engine-integration',schema:3,runtime:2,mode:'native-unified',nodes,wires:Object.fromEntries(wires.map(edge=>[edge.id,edge])),definitions:{},portals:{}});
const target=(nodeId)=>({workflowId:'engine-integration',instancePath:[],nodeId,portId:'out'});
const row=(result,id)=>result.recording.units.find(unit=>expandRecordAddress(result.recording,unit.address).nodeId===id);
const output=(result,id)=>{const unit=row(result,id),pin=unit.ports.find(pin=>pin.direction==='output'&&result.recording.identities.strings[pin.port]==='out');return result.recording.artifacts[pin.artifact].value;};

test('Decision is editable through the real catalog and executes on its own text binding',async()=>{
    const root=graph({source:node('source','compose',{sections:[{name:'scene',text:'Mira kissed Elias.'}]}),decision:node('decision','decision',{inputKind:'text',questions:{kiss:{type:'noul',instructions:'Did Mira kiss Elias in this scene?'}}})},[wire('scene','source','out','decision','in')]);
    const described=describeOperation(root,root.nodes.decision);assert.equal(described.ok,true,JSON.stringify(described.error));
    assert.equal(operationDefaults('decision').operation,'decision');assert.equal(described.data.descriptor.requestCapability,'text-completion');
    const binding={profileId:'decision-model',model:'separate-model'};let calls=0;
    const result=await runWorkflow(root,{target:target('decision'),resolveBinding:async()=>({ok:true,data:binding}),countTokens:async()=>({tokens:12}),request:async request=>{assert.equal(request.binding,binding);calls++;return {ok:true,data:{text:JSON.stringify({answers:{kiss:{type:'noul',accepted:true}}}),finish:'stop',usage:{outputTokens:7}}};}});
    assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(calls,1);assert.equal(result.actualCalls,1);assert.equal(result.callBound,1);
    assert.equal(output(result,'decision').value.answers.kiss.accepted,true);assert.equal(row(result,'decision').request.status,'completed');
});

test('Fast Decision uses the typed capability without tokenizing or resolving a text model',async()=>{
    const root=graph({source:node('source','compose',{sections:[{name:'scene',text:'Mira kissed Elias.'}]}),fast:node('fast','fast-decision',{inputKind:'text',fastConnectionId:'local-laya',questions:{kiss:{type:'noul',instructions:'Did Mira kiss Elias?'}}})},[wire('scene','source','out','fast','in')]);
    const binding={connectionId:'local-laya',capability:'typed-decision',provider:'laya',model:'laya-any'};let calls=0,binds=0;
    const result=await runWorkflow(root,{target:target('fast'),resolveBinding:async()=>{throw new Error('Text binding must stay inactive');},bindingSummary:()=>{throw new Error('Text binding summary must stay inactive');},fastBindingSummary:()=>binding,countTokens:async()=>{throw new Error('Typed protocol has no completion tokenizer');},resolveFastBinding:async selected=>{assert.equal(selected.fastConnectionId,'local-laya');binds++;return {ok:true,data:binding};},requestFastDecision:async options=>{assert.equal(options.binding,binding);assert.equal(options.state,'Mira kissed Elias.');calls++;return {ok:true,data:{model:'laya-any',answers:{kiss:{type:'noul',noul:0.97}},usage:{input_tokens:12,output_tokens:4}}};}});
    assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(calls,1);assert.equal(binds,1);assert.equal(result.actualCalls,1);assert.equal(result.callBound,1);
    assert.equal(output(result,'fast').value.answers.kiss.noul,0.97);assert.equal(row(result,'fast').request.capability,'typed-decision');assert.equal(row(result,'fast').request.inputTokens,null);assert.equal(row(result,'fast').request.usage.input_tokens,12);
});

test('explicit Fast fallback counts both capabilities and binds text only after an allowed failure',async()=>{
    const root=graph({source:node('source','compose',{sections:[{name:'scene',text:'Mira kissed Elias.'}]}),fast:node('fast','fast-decision',{inputKind:'text',fastConnectionId:'jev-main',fallbackEnabled:true,fallbackAllowedCodes:['RATE_LIMITED'],fallbackProfileId:'independent-fallback',questions:{kiss:{type:'noul',instructions:'Did Mira kiss Elias?'}}})},[wire('scene','source','out','fast','in')]);
    const fastBinding={model:'jev',connectionId:'jev-main'},textBinding={model:'other-model',profileId:'independent-fallback'};const events=[],order=[];
    const ports={target:target('fast'),onEvent:event=>events.push(event),resolveFastBinding:async()=>({ok:true,data:fastBinding}),resolveBinding:async selected=>{order.push('text-bind');assert.equal(selected.profileId,'independent-fallback');assert.equal(selected.modelRole,'decision');return {ok:true,data:textBinding};},countTokens:async()=>({tokens:10}),requestFastDecision:async options=>{order.push('typed');assert.equal(options.binding,fastBinding);return {ok:false,error:{code:'RATE_LIMITED',message:'Retry later'}};},request:async options=>{order.push('text');assert.equal(options.binding,textBinding);return {ok:true,data:{text:JSON.stringify({answers:{kiss:{type:'noul',accepted:true}}}),finish:'stop'}};}};
    const result=await runWorkflow(root,ports);assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(result.callBound,2);assert.equal(result.actualCalls,2);assert.deepEqual(order,['typed','text-bind','text']);
    assert.deepEqual(events.filter(event=>event.type==='request-start').map(event=>[event.attempt,event.capability]),[[1,'typed-decision'],[2,'text-completion']]);
    assert.equal(output(result,'fast').value.fallback.reason,'RATE_LIMITED');assert.equal(row(result,'fast').request.capability,'text-completion');
    order.length=0;
    const held=await runWorkflow(root,{...ports,requestFastDecision:async()=>({ok:false,error:{code:'AUTH_FAILED',message:'No'}})});
    assert.equal(held.ok,false);assert.equal(held.error.code,'AUTH_FAILED');assert.equal(held.actualCalls,1);assert.deepEqual(order,[]);
});

test('typed malformed or cancelled responses fail instead of becoming No',async()=>{
    const root=graph({source:node('source','compose',{sections:[{name:'scene',text:'Mira kissed Elias.'}]}),fast:node('fast','fast-decision',{inputKind:'text',fastConnectionId:'jev-main'})},[wire('scene','source','out','fast','in')]);
    const ports={target:target('fast'),resolveFastBinding:async()=>({ok:true,data:{model:'jev'}}),requestFastDecision:async()=>({ok:true,data:{model:'jev',answers:{decision:{type:'noul',noul:2}},usage:{input_tokens:1,output_tokens:1}}})};
    const malformed=await runWorkflow(root,ports);assert.equal(malformed.error.code,'INVALID_FAST_RESPONSE');assert.equal(malformed.actualCalls,1);assert.equal(row(malformed,'fast').request.status,'failed');
    const controller=new AbortController();const cancelled=await runWorkflow(root,{...ports,signal:controller.signal,requestFastDecision:async()=>{controller.abort();return {ok:true,data:{model:'jev',answers:{decision:{type:'noul',noul:0.9}},usage:{input_tokens:1,output_tokens:1}}};}});
    assert.equal(cancelled.error.code,'ABORTED');assert.equal(cancelled.recording.status,'cancelled');assert.equal(cancelled.actualCalls,1);
});

test('Condition compares structured arrays with numeric and Boolean entries through graph admission',async()=>{
    const root=graph({text:node('text','text',{text:'{"values":[1,true,null,{"k":"x"}]}'}),data:node('data','json-decode'),condition:node('condition','condition',{path:['values'],value:[1,true,null,{k:'x'}]})},[wire('a','text','out','data','in'),wire('b','data','out','condition','in')]);
    const result=await runWorkflow(root,{target:target('condition')});assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(output(result,'condition').value.accepted,true);
});

test('Model Call produces schema-checked Data through the real named workflow ports',async()=>{
    const root=graph({prompt:node('prompt','text',{text:'Invent a wand effect.'}),model:node('model','model-call',{outputKind:'data',schema:'{"type":"object","required":["effect"],"properties":{"effect":{"type":"string"}},"additionalProperties":false}'})},[wire('prompt','prompt','out','model','prompt')]);
    const result=await runWorkflow(root,{target:target('model'),resolveBinding:async()=>({ok:true,data:{profileId:'wild-author'}}),countTokens:async()=>({tokens:5}),request:async()=>({ok:true,data:{text:'{"effect":"paper moths"}',finish:'stop'}})});
    assert.equal(result.ok,true,JSON.stringify(result.error));assert.deepEqual(output(result,'model').value,{effect:'paper moths'});assert.equal(result.actualCalls,1);
});

test('revised Draft authority survives Branch and Join before legacy final validation',async()=>{
    const root=graph({source:node('source','reply-snapshot'),revise:node('revise','revise-draft',{scope:'whole'}),literal:node('literal','text',{text:'{"accepted":false}'}),decision:node('decision','json-decode'),branch:node('branch','branch',{artifactKind:'draft'}),optional:node('optional','revise-draft',{scope:'whole'}),join:node('join','join',{artifactKind:'draft'}),scan:node('scan','repair',{mode:'scan'}),final:node('final','validate-patches')},[wire('a','source','out','revise','draft'),wire('b','literal','out','decision','in'),wire('c','decision','out','branch','condition'),wire('d','revise','out','branch','in'),wire('e','branch','yes','optional','draft'),wire('f','revise','out','join','base'),wire('g','optional','out','join','optional'),wire('h','join','out','scan','in'),wire('i','scan','out','final','in')]);
    let calls=0,bindings=0;const result=await runWorkflow(root,{target:target('final'),snapshot:async()=>({kind:'draft',text:'Original prose.',source:{originalText:'Original prose.',chatId:'Story-2'}}),resolveBinding:async()=>{bindings++;return {ok:true,data:{profileId:'revision'}};},countTokens:async()=>({tokens:5}),request:async()=>{calls++;return {ok:true,data:{text:'First prose.',finish:'stop'}};}});
    assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(calls,1);assert.equal(bindings,1);assert.equal(row(result,'optional').status,'skipped');
    assert.equal(output(result,'final').original,'Original prose.');assert.equal(output(result,'final').text,'First prose.');
});

test('empty Enrich finishes without resolving or calling a model connection', async () => {
    const root = graph({ literal: node('literal', 'text', { text: '{"type":"extracted-records","records":[],"sourceRefs":[]}' }), data: node('data', 'json-decode'), enrich: node('enrich', 'enrich') }, [wire('a', 'literal', 'out', 'data', 'in'), wire('b', 'data', 'out', 'enrich', 'data')]);
    let bindings = 0, calls = 0;
    const result = await runWorkflow(root, { target: target('enrich'), resolveBinding: async () => { bindings++; return { ok: false, error: { code: 'BINDING_MISSING', message: 'No selected model' } }; }, request: async () => { calls++; throw new Error('Empty records need no call'); } });
    assert.equal(result.ok, true, JSON.stringify(result.error)); assert.equal(bindings, 0); assert.equal(calls, 0); assert.equal(result.actualCalls, 0); assert.deepEqual(output(result, 'enrich').value.records, []);
});

test('extracted notes append to the Draft while the story-body output excludes the dropdown', async () => {
    const root = graph({ source: node('source', 'reply-snapshot'), extract: node('extract', 'extract', { mode: 'literal', patterns: [{ id: 'wand', literal: 'broken wand', label: 'Broken wand' }] }), render: node('render', 'render-notes'), append: node('append', 'append'), body: node('body', 'draft-text') }, [wire('a', 'source', 'out', 'extract', 'source'), wire('b', 'extract', 'out', 'render', 'data'), wire('c', 'source', 'out', 'append', 'draft'), wire('d', 'render', 'out', 'append', 'section'), wire('e', 'append', 'out', 'body', 'draft')]);
    const result = await runWorkflow(root, { target: target('body'), snapshot: async () => ({ kind: 'draft', text: 'She raised the broken wand.', source: { originalText: 'She raised the broken wand.', chatId: 'Story-2' } }) });
    assert.equal(result.ok, true, JSON.stringify(result.error)); assert.equal(result.actualCalls, 0); assert.match(output(result, 'append').text, /<details>/); assert.match(output(result, 'append').text, /Broken wand/); assert.equal(output(result, 'body').text, 'She raised the broken wand.');
});

test('explicit Fast fallback survives unavailable primary binding and reports only transmitted calls', async () => {
    const root = graph({ source: node('source', 'text', { text: 'Mira kissed Elias.' }), fast: node('fast', 'fast-decision', { inputKind: 'text', fastConnectionId: 'missing', fallbackEnabled: true, fallbackAllowedCodes: ['SERVICE_UNAVAILABLE'], fallbackProfileId: 'independent-fallback' }) }, [wire('a', 'source', 'out', 'fast', 'in')]);
    let fastBindings = 0, textBindings = 0, textCalls = 0;
    const base = { target: target('fast'), resolveFastBinding: async () => { fastBindings++; return { ok: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Primary unavailable' } }; }, resolveBinding: async () => { textBindings++; return { ok: true, data: { profileId: 'fallback' } }; }, countTokens: async () => ({ tokens: 5 }), request: async () => { textCalls++; return { ok: true, data: { text: '{"answers":{"decision":{"type":"noul","accepted":true}}}', finish: 'stop' } }; } };
    const unavailableBinding = await runWorkflow(root, base);
    assert.equal(unavailableBinding.ok, true, JSON.stringify(unavailableBinding.error)); assert.equal(fastBindings, 1); assert.equal(textBindings, 1); assert.equal(textCalls, 1); assert.equal(unavailableBinding.actualCalls, 1); assert.equal(output(unavailableBinding, 'fast').value.actualCalls, 1);
    fastBindings = 0; textBindings = 0; textCalls = 0;
    const unavailableTransport = await runWorkflow(root, { ...base, resolveFastBinding: async () => { fastBindings++; return { ok: true, data: { model: 'typed' } }; } });
    assert.equal(unavailableTransport.ok, true, JSON.stringify(unavailableTransport.error)); assert.equal(unavailableTransport.actualCalls, 1); assert.equal(output(unavailableTransport, 'fast').value.actualCalls, 1); assert.equal(fastBindings, 1); assert.equal(textBindings, 1); assert.equal(textCalls, 1);
});

test('host settlement receives the independent fallback binding and recording identifies its completion connection', async () => {
    const { runWorkflowForHost } = await import('../src/workflow/runtime.js');
    const root = graph({ source: node('source', 'text', { text: 'A kiss.' }), fast: node('fast', 'fast-decision', { inputKind: 'text', fastConnectionId: 'jev', fallbackEnabled: true, fallbackAllowedCodes: ['RATE_LIMITED'], fallbackProfileId: 'fallback-text' }) }, [wire('a', 'source', 'out', 'fast', 'in')]);
    const primary = { connectionId: 'jev', model: 'jev', provider: 'jev' }, fallback = { profileId: 'fallback-text', model: 'separate-model' }; let retained;
    const result = await runWorkflowForHost(root, { resolveFastBinding: async () => ({ ok: true, data: primary }), resolveBinding: async () => ({ ok: true, data: fallback }), countTokens: async () => ({ tokens: 5 }), requestFastDecision: async () => ({ ok: false, error: { code: 'RATE_LIMITED', message: 'Busy' } }), request: async () => ({ ok: true, data: { text: '{"answers":{"decision":{"type":"noul","accepted":true}}}', finish: 'stop' } }) }, { settle: async value => { retained = value.bindings; return { ok: true }; } });
    assert.equal(result.error.code, 'MISSING_TERMINAL');
    const targeted = await runWorkflowForHost(root, { target: target('fast'), resolveFastBinding: async () => ({ ok: true, data: primary }), resolveBinding: async () => ({ ok: true, data: fallback }), countTokens: async () => ({ tokens: 5 }), requestFastDecision: async () => ({ ok: false, error: { code: 'RATE_LIMITED', message: 'Busy' } }), request: async () => ({ ok: true, data: { text: '{"answers":{"decision":{"type":"noul","accepted":true}}}', finish: 'stop' } }) }, { settle: async value => { retained = value.bindings; return { ok: true }; } });
    assert.equal(targeted.ok, true, JSON.stringify(targeted.error)); assert.deepEqual(retained.map(item => [item.binding, item.capability, item.role]), [[primary, 'typed-decision', 'fastDecision'], [fallback, 'text-completion', 'decision']]); assert.equal(row(targeted, 'fast').binding.profileId, 'fallback-text'); assert.equal(row(targeted, 'fast').binding.model, 'separate-model'); assert.equal(row(targeted, 'fast').binding.capability, 'text-completion'); assert.equal(output(targeted, 'fast').value.actualCalls, 2);
});

for (const mode of ['native-pre', 'native-post']) test('enabled Fast fallback works during fixed preflight in ' + mode, async () => {
    const root = graph({ source: node('source', 'text', { text: 'A kiss.' }), fast: node('fast', 'fast-decision', { inputKind: 'text', fastConnectionId: 'missing', fallbackEnabled: true, fallbackAllowedCodes: ['SERVICE_UNAVAILABLE'], fallbackProfileId: 'text-fallback' }) }, [wire('a', 'source', 'out', 'fast', 'in')]); root.mode = mode;
    let fastBindings = 0, textBindings = 0;
    const result = await runWorkflow(root, { target: target('fast'), resolveFastBinding: async () => { fastBindings++; return { ok: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Unavailable' } }; }, resolveBinding: async () => { textBindings++; return { ok: true, data: { profileId: 'text-fallback' } }; }, countTokens: async () => ({ tokens: 4 }), request: async () => ({ ok: true, data: { text: '{"answers":{"decision":{"type":"noul","accepted":true}}}', finish: 'stop' } }) });
    assert.equal(result.ok, true, JSON.stringify(result.error)); assert.equal(fastBindings, 1); assert.equal(textBindings, 1); assert.equal(result.actualCalls, 1); assert.equal(output(result, 'fast').value.actualCalls, 1);
});
