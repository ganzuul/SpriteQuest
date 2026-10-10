import { DECISION_OPERATIONS, describeDecision, executeDecision } from '../src/workflow/operations/decision-nodes.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareFastDecisionRequest, validateFastDecisionResponse, runDecision, runFastDecision } from '../src/workflow/decision.js';
const yesQuestion = { kiss: { type: 'noul', instructions: 'Did the characters kiss?' } };
const response = (answers) => ({ model: 'jev-1.13.0', answers, usage: { input_tokens: 12, output_tokens: 2 } });
test('noul preserves probability rather than silently turning uncertainty into No', () => {
  const request = prepareFastDecisionRequest({ state: 'They looked at one another.', questions: yesQuestion });
  assert.equal(request.ok, true);
  const result = validateFastDecisionResponse(response({ kiss: { type: 'noul', noul: 0.46 } }), yesQuestion);
  assert.equal(result.ok, true);
  assert.equal(result.data.answers.kiss.noul, 0.46);
  assert.equal(Object.hasOwn(result.data.answers.kiss, 'accepted'), false);
});
test('typed answer keys, answer types, finite ranges and usage must match the request', () => {
  for (const answers of [{ other: { type: 'noul', noul: 0.5 } }, { kiss: { type: 'choice', choice: 'yes' } }, { kiss: { type: 'noul', noul: 1.1 } }, { kiss: { type: 'noul', noul: NaN } }]) assert.equal(validateFastDecisionResponse(response(answers), yesQuestion).ok, false);
  assert.equal(validateFastDecisionResponse({ ...response({ kiss: { type: 'noul', noul: 1 } }), usage: { input_tokens: -1, output_tokens: 2 } }, yesQuestion).ok, false);
});
test('request checks bounded keyed batches and own data without invoking accessors', () => {
  let reads = 0;
  const question = { type: 'noul' }; Object.defineProperty(question, 'instructions', { enumerable: true, get() { reads++; return 'Question'; } });
  assert.equal(prepareFastDecisionRequest({ state: 'Scene', questions: { kiss: question } }).ok, false); assert.equal(reads, 0);
  assert.equal(prepareFastDecisionRequest({ state: 'Scene', questions: {} }).ok, false);
  assert.equal(prepareFastDecisionRequest({ state: true, questions: yesQuestion }).ok, false);
  assert.equal(prepareFastDecisionRequest({ state: 'Scene', questions: Object.fromEntries(Array.from({ length: 33 }, (_, i) => [String(i), yesQuestion.kiss])) }).ok, false);
});
test('choice preserves a complete distribution and rejects contradictory or absent alternatives', () => {
  const questions = { holder: { type: 'choice', instructions: 'Who holds the wand?', criteria: { mira: 'Mira', jev: 'Jev' } } };
  const valid = { type: 'choice', choice: 'mira', probabilities: { mira: 0.8, jev: 0.2 }, confidence: 0.6 };
  assert.deepEqual(validateFastDecisionResponse(response({ holder: valid }), questions).data.answers.holder, valid);
  for (const invalid of [{ ...valid, choice: 'other' }, { ...valid, choice: 'jev' }, { ...valid, probabilities: { mira: 0.8 } }, { ...valid, probabilities: { mira: 0.8, jev: 0.3 } }, { ...valid, confidence: 2 }, { ...valid, selectedkey: 'jev' }]) assert.equal(validateFastDecisionResponse(response({ holder: invalid }), questions).ok, false);
});
test('score validates zero-based weighted score and exact ordered legend without flattening metrics', () => {
  const questions = { closeness: { type: 'score', instructions: 'Rate closeness', criteria: ['Distant', 'Friendly', 'Intimate'] } };
  const valid = { type: 'score', score: 1.05, legend: { 0: 'Distant', 1: 'Friendly', 2: 'Intimate' }, probabilities: { 0: 0, 1: 0.95, 2: 0.05 }, confidence: 0.92 };
  assert.deepEqual(validateFastDecisionResponse(response({ closeness: valid }), questions).data.answers.closeness, valid);
  for (const invalid of [{ ...valid, score: 2 }, { ...valid, legend: { 0: 'Intimate', 1: 'Friendly', 2: 'Distant' } }, { ...valid, probabilities: { 1: 0, 2: 0.95, 3: 0.05 } }]) assert.equal(validateFastDecisionResponse(response({ closeness: invalid }), questions).ok, false);
});
test('Laya routing/action diagnostics are retained bounded and redact credentials; stale aliases fail', () => {
  const value = { ...response({ kiss: { type: 'noul', noul: 0.7 } }), routing: { model: 'multilingual', authorization: 'Bearer secret', api_key: 'secret' }, action: { act_probability: 0.99 } };
  const result = validateFastDecisionResponse(value, yesQuestion);
  assert.deepEqual(result.data.diagnostics, { routing: { model: 'multilingual' }, action: { act_probability: 0.99 } });
  assert.equal(validateFastDecisionResponse(response({ kiss: { type: 'noul', noul: 0.7, yesprob: 0.1 } }), yesQuestion).ok, false);
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
test('Fast Decision fallback is explicitly allowed, independently requested and retains failure provenance', async () => {
  let textCalls = 0; const local = { typedRequest: async () => ({ ok: false, error: { code: 'RATE_LIMITED', message: 'private transport detail' } }), request: async () => { textCalls++; return { ok: true, data: { text: '{"answers":{"kiss":{"type":"noul","accepted":false}}}', finish: 'stop' } }; } };
  const initial = { state: 'Scene', questions: yesQuestion };
  const noFallback = await runFastDecision(initial, local); assert.equal(noFallback.error.code, 'RATE_LIMITED'); assert.equal(textCalls, 0);
  const result = await runFastDecision({ ...initial, fallback: { enabled: true, allowedCodes: ['RATE_LIMITED'] } }, local);
  assert.equal(result.ok, true); assert.equal(textCalls, 1); assert.equal(result.data.actualCalls, 2); assert.deepEqual(result.data.fallback, { from: 'typed-provider', reason: 'RATE_LIMITED' }); assert.doesNotMatch(JSON.stringify(result), /private transport detail/);
  const mismatch = await runFastDecision({ ...initial, fallback: { enabled: true, allowedCodes: ['REQUEST_FAILED'] } }, local); assert.equal(mismatch.ok, false); assert.equal(textCalls, 1);
});
test('cancellation never becomes No or starts fallback, including late results', async () => {
  const controller = new AbortController(); let calls = 0;
  const result = await runFastDecision({ state: 'Scene', questions: yesQuestion, fallback: { enabled: true, allowedCodes: ['REQUEST_FAILED'] } }, { signal: controller.signal, typedRequest: async () => { calls++; controller.abort(); return { ok: true, data: response({ kiss: { type: 'noul', noul: 0 } }) }; }, request: async () => { throw new Error('Must not call'); } });
  assert.equal(result.error.code, 'ABORTED'); assert.equal(calls, 1);
});
test('typed request receives a frozen independent snapshot and adapter provenance survives', async () => {
  const questions = structuredClone(yesQuestion);
  const result = await runFastDecision({ state: { scene: 'Mira kissed Jev.' }, questions }, { typedRequest: async options => {
    questions.kiss.type = 'choice';
    assert.equal(Object.isFrozen(options.questions.kiss), true);
    assert.equal(Object.isFrozen(options.state), true);
    return { ok: true, data: { response: response({ kiss: { type: 'noul', noul: 0.8 } }), provenance: { capability: 'typed-decision', connectionId: 'fast-one', provider: 'jev', model: 'jev-latest', returnedModel: 'jev-current', fingerprint: 'captured-id', secret: 'never expose' } } };
  } });
  assert.equal(result.ok, true); assert.equal(result.data.answers.kiss.noul, 0.8);
  assert.equal(result.data.provenance.connectionId, 'fast-one'); assert.equal(result.data.provenance.returnedModel, 'jev-current'); assert.doesNotMatch(JSON.stringify(result), /never expose/);
});
test('Decision descriptions expose distinct capabilities and explicit fallback request bounds', () => {
  const normal = describeDecision({ operation:'decision',questions:yesQuestion },{phase:'pre'});
  assert.equal(normal.ok,true);assert.equal(normal.data.descriptor.requestCapability,'text-completion');assert.equal(normal.data.descriptor.requestBound,1);assert.equal(normal.data.descriptor.title,'Decision');
  const fast = describeDecision({ operation:'fast-decision',questions:yesQuestion,fastConnectionId:'fast-one',fallbackEnabled:true,fallbackAllowedCodes:['RATE_LIMITED'],fallbackProfileId:'text-independent' },{phase:'post'});
  assert.equal(fast.ok,true);assert.equal(fast.data.descriptor.requestCapability,'typed-decision');assert.equal(fast.data.descriptor.requestBound,2);assert.equal(fast.data.descriptor.fallbackModelRole,'decision');
  assert.equal(DECISION_OPERATIONS['fast-decision'].title,'Fast Decision');
  assert.equal(describeDecision({operation:'fast-decision',questions:yesQuestion,fallbackEnabled:true,fallbackAllowedCodes:['ABORTED'],fallbackProfileId:'text-independent'},{phase:'post'}).ok,false);
});
test('decision operation emits typed Data through its independent request capabilities', async () => {
  const node={operation:'fast-decision',questions:yesQuestion,fastConnectionId:'fast-one',inputKind:'text'};
  const result=await executeDecision(node,{in:{kind:'text',text:'Mira kissed Jev.'}},{phase:'post',typedRequest:async () => ({ok:true,data:response({kiss:{type:'noul',noul:0.9}})})});
  assert.equal(result.ok,true);assert.equal(result.artifact.kind,'data');assert.equal(result.artifact.value.answers.kiss.noul,0.9);
  assert.equal((await executeDecision({...node,inputKind:'data'},{in:{kind:'text',text:'Scene'}},{phase:'post'})).error.code,'INVALID_INPUT');
});
test('execution rejects accessor controls without throwing or evaluating them', async () => {
  let reads=0; const node={operation:'decision',questions:yesQuestion};Object.defineProperty(node,'phase',{enumerable:true,get(){reads++;return 'pre';}});
  const result=await executeDecision(node,{in:{kind:'data',value:{scene:'Scene'}}});assert.equal(result.ok,false);assert.equal(reads,0);
});
test('one typed batch keeps every stable question identity against one frozen state', async () => {
  const questions={...yesQuestion,holder:{type:'choice',instructions:'Who holds the wand?',criteria:{mira:'Mira',jev:'Jev'}},closeness:{type:'score',instructions:'Rate closeness',criteria:['Distant','Close']}};
  let calls=0;
  const result=await runFastDecision({state:{scene:'Mira kissed Jev while carrying her wand.'},questions},{typedRequest:async options=>{calls++;assert.deepEqual(options.questions,questions);return {ok:true,data:response({kiss:{type:'noul',noul:0.95},holder:{type:'choice',choice:'mira',probabilities:{mira:0.9,jev:0.1},confidence:0.8},closeness:{type:'score',score:0.9,legend:{0:'Distant',1:'Close'},probabilities:{0:0.1,1:0.9},confidence:0.8}})};}});
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
test('score weighted rounding tolerance cannot admit a value outside the exact authored rubric bounds', () => {
  const questions={closeness:{type:'score',instructions:'Rate closeness',criteria:['Distant','Close']}};
  for(const [score,probabilities] of [[-5e-7,{0:1,1:0}],[1+5e-7,{0:0,1:1}]]) {
    const result=validateFastDecisionResponse(response({closeness:{type:'score',score,legend:{0:'Distant',1:'Close'},probabilities,confidence:1}}),questions);
    assert.equal(result.ok,false);assert.equal(result.error.code,'INVALID_FAST_RESPONSE');
  }
});
