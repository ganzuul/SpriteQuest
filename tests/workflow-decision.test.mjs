import { DECISION_OPERATIONS, describeDecision, executeDecision } from '../src/workflow/operations/decision-nodes.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareDecisionRequest, runDecision } from '../src/workflow/decision.js';
const yesQuestion = { kiss: { type: 'noul', instructions: 'Did the characters kiss?' } };
const completion = answers => ({ ok: true, data: { text: JSON.stringify({ answers }), finish: 'stop' } });

test('request checks bounded keyed batches and own data without invoking accessors', () => {
  let reads = 0;
  const question = { type: 'noul' }; Object.defineProperty(question, 'instructions', { enumerable: true, get() { reads++; return 'Question'; } });
  assert.equal(prepareDecisionRequest({ state: 'Scene', questions: { kiss: question } }).ok, false); assert.equal(reads, 0);
  assert.equal(prepareDecisionRequest({ state: 'Scene', questions: {} }).ok, false);
  assert.equal(prepareDecisionRequest({ state: true, questions: yesQuestion }).ok, false);
  assert.equal(prepareDecisionRequest({ state: 'Scene', questions: Object.fromEntries(Array.from({ length: 33 }, (_, i) => [String(i), yesQuestion.kiss])) }).ok, false);
});

test('Decision sends its frozen question and validates strict JSON with self-reported certainty', async () => {
  let seen;
  const result = await runDecision({ state: 'Mira kissed Jev.', questions: yesQuestion, maxTokens: 256 }, { request: async options => { seen = options; return { ok: true, data: { text: JSON.stringify({ answers: { kiss: { type: 'noul', accepted: true, confidence: 0.8, evidence: 'Mira kissed Jev.' } } }), finish: 'stop', usage: { prompt_tokens: 5, completion_tokens: 9 } } }; } });
  assert.equal(result.ok, true); assert.equal(result.data.answers.kiss.accepted, true); assert.equal(result.data.confidenceSemantics, 'self-reported'); assert.equal(result.data.actualCalls, 1);
  assert.match(seen.messages[1].content, /Mira kissed Jev/); assert.match(seen.messages[1].content, /kiss/); assert.equal(seen.maxTokens, 256);
});
test('Decision preserves unresolved and rejects malformed, unverified and out-of-rubric output', async () => {
  const request = text => async () => ({ ok: true, data: { text, finish: 'stop' } });
  const uncertain = await runDecision({ state: 'Scene', questions: yesQuestion }, { request: request('{"answers":{"kiss":{"type":"noul","accepted":null}}}') });
  assert.equal(uncertain.data.answers.kiss.accepted, null);
  for (const text of ['No', '```json\n{}\n```', '{"answers":{"other":{"type":"noul","accepted":false}}}', '{"answers":{"kiss":{"type":"noul","accepted":false,"confidence":2}}}']) assert.equal((await runDecision({ state: 'Scene', questions: yesQuestion }, { request: request(text) })).ok, false);
  assert.equal((await runDecision({ state: 'Scene', questions: yesQuestion }, { request: async () => ({ ok: true, data: { text: '{"answers":{"kiss":{"type":"noul","accepted":false}}}', finish: 'length' } }) })).error.code, 'COMPLETION_UNVERIFIED');
});

test('cancellation never becomes No, including a late text result', async () => {
  const controller = new AbortController(); let calls = 0;
  const result = await runDecision({ state: 'Scene', questions: yesQuestion }, { signal: controller.signal, request: async () => { calls++; controller.abort(); return completion({ kiss: { type: 'noul', accepted: false } }); } });
  assert.equal(result.error.code, 'ABORTED'); assert.equal(calls, 1);
});

test('Decision sends an independent state and question snapshot', async () => {
  const questions = structuredClone(yesQuestion), state = { scene: 'Mira kissed Jev.' };
  const result = await runDecision({ state, questions }, { request: async options => {
    questions.kiss.type = 'choice'; state.scene = 'Changed';
    const sent = JSON.parse(options.messages[1].content);
    assert.deepEqual(sent, { state: { scene: 'Mira kissed Jev.' }, questions: yesQuestion });
    return completion({ kiss: { type: 'noul', accepted: true } });
  } });
  assert.equal(result.ok, true); assert.equal(result.data.answers.kiss.accepted, true);
});

test('Decision describes one text request and rejects the retired operation', () => {
  const normal = describeDecision({ operation:'decision',questions:yesQuestion },{phase:'pre'});
  assert.equal(normal.ok,true);assert.equal(normal.data.descriptor.requestCapability,'text-completion');assert.equal(normal.data.descriptor.requestBound,1);assert.equal(normal.data.descriptor.title,'Decision');
  assert.equal(Object.hasOwn(DECISION_OPERATIONS,'fast-decision'),false);
  assert.equal(describeDecision({operation:'fast-decision',questions:yesQuestion},{phase:'post'}).error.code,'UNKNOWN_OPERATION');
});

test('Decision emits structured Data through its bounded text request', async () => {
  const node={operation:'decision',questions:yesQuestion,inputKind:'text'};
  const result=await executeDecision(node,{in:{kind:'text',text:'Mira kissed Jev.'}},{phase:'post',request:async () => completion({kiss:{type:'noul',accepted:true}})});
  assert.equal(result.ok,true);assert.equal(result.artifact.kind,'data');assert.equal(result.artifact.value.answers.kiss.accepted,true);assert.equal(result.artifact.value.actualCalls,1);
  assert.equal((await executeDecision({...node,inputKind:'data'},{in:{kind:'text',text:'Scene'}},{phase:'post'})).error.code,'INVALID_INPUT');
});

test('execution rejects accessor controls without throwing or evaluating them', async () => {
  let reads=0; const node={operation:'decision',questions:yesQuestion};Object.defineProperty(node,'phase',{enumerable:true,get(){reads++;return 'pre';}});
  const result=await executeDecision(node,{in:{kind:'data',value:{scene:'Scene'}}});assert.equal(result.ok,false);assert.equal(reads,0);
});

test('one Decision batch keeps every stable question identity against one captured state', async () => {
  const questions={...yesQuestion,holder:{type:'choice',instructions:'Who holds the wand?',criteria:{mira:'Mira',jev:'Jev'}},closeness:{type:'score',instructions:'Rate closeness',criteria:['Distant','Close']}};
  let calls=0;
  const result=await runDecision({state:{scene:'Mira kissed Jev while carrying her wand.'},questions},{request:async options=>{calls++;assert.deepEqual(JSON.parse(options.messages[1].content).questions,questions);return completion({kiss:{type:'noul',accepted:true},holder:{type:'choice',choice:'mira'},closeness:{type:'score',score:0.9}});}});
  assert.equal(result.ok,true);assert.equal(calls,1);assert.equal(result.data.actualCalls,1);assert.deepEqual(Object.keys(result.data.answers),Object.keys(questions));
});

test('text Decision validates offered choices and bounded scores without fabricating distributions', async () => {
  const questions={holder:{type:'choice',instructions:'Holder?',criteria:{mira:'Mira',jev:'Jev'}},closeness:{type:'score',instructions:'Closeness?',criteria:['Distant','Close']}};
  const evaluate=answers=>runDecision({state:'Scene',questions},{request:async()=>({ok:true,data:{text:JSON.stringify({answers}),finish:'stop'}})});
  const valid={holder:{type:'choice',choice:'mira'},closeness:{type:'score',score:0.8}};
  assert.equal((await evaluate(valid)).ok,true);assert.equal((await evaluate({...valid,holder:{type:'choice',choice:'other'}})).ok,false);assert.equal((await evaluate({...valid,closeness:{type:'score',score:2}})).ok,false);
});
test('text usage records only bounded token counters rather than raw provider metadata', async () => {
  const result=await runDecision({state:'Scene',questions:yesQuestion},{request:async()=>({ok:true,data:{text:'{"answers":{"kiss":{"type":"noul","accepted":false}}}',finish:'stop',usage:{prompt_tokens:5,completion_tokens:3,authorization:'secret-value'}}})});
  assert.equal(result.ok,true);assert.deepEqual(result.data.usage,{prompt_tokens:5,completion_tokens:3});assert.doesNotMatch(JSON.stringify(result),/secret-value/);
});

test('Decision score cannot exceed exact authored rubric bounds', async () => {
  const questions={closeness:{type:'score',instructions:'Rate closeness',criteria:['Distant','Close']}};
  for(const score of [-5e-7,1+5e-7]) {
    const result=await runDecision({state:'Scene',questions},{request:async()=>completion({closeness:{type:'score',score}})});
    assert.equal(result.ok,false);assert.equal(result.error.code,'INVALID_DECISION_OUTPUT');
  }
});

test('ordinary Decision rejects retired fallback controls before making a request',async()=>{
  let calls=0;const result=await runDecision({state:'Scene',questions:yesQuestion,fallback:{enabled:true,allowedCodes:['RATE_LIMITED']}},{request:async()=>{calls++;return {ok:true,data:{text:'{"answers":{"kiss":{"type":"noul","accepted":true}}}',finish:'stop'}};}});
  assert.equal(result.ok,false);assert.equal(result.error.code,'INVALID_SETTINGS');assert.equal(calls,0);
});
