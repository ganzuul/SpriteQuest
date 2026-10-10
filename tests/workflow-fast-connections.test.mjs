import test from 'node:test';
import assert from 'node:assert/strict';
import { captureFastBinding, fastBindingStatus, fastBindingSummary, requestFastDecision } from '../src/workflow/fast-connections.js';
const questions = { kiss: { type: 'noul', instructions: 'Did they kiss?' } };
const raw = { model: 'jev-current', answers: { kiss: { type: 'noul', noul: 0.7 } }, usage: { input_tokens: 12, output_tokens: 2 } };
function fixture(overrides = {}) {
  let configuration = { id: 'fast-one', revision: 1, provider: 'jev', model: 'jev-latest', credentialRef: 'jev-secret', ...overrides }, secret = 'secret-value', calls = [], registryRevision = 1;
  const host = { getRegistryRevision: () => registryRevision, getConnection: () => configuration, resolveSecret: async () => secret, fetch: async (url, options) => { calls.push({ url, options }); return { ok: true, status: 200, text: async () => JSON.stringify(raw) }; } };
  return { host, calls, setConfig: value => { configuration = value; registryRevision++; }, getConfig: () => configuration, setSecret: value => { secret = value; registryRevision++; } };
}
test('captured Jev binding sends typed JSON and Bearer without exposing credential authority', async () => {
  const f = fixture(); const binding = await captureFastBinding('fast-one', f.host); assert.equal(binding.ok, true);
  const result = await requestFastDecision(binding.data, { state: 'Scene', questions }, f.host); assert.equal(result.ok, true);
  assert.equal(f.calls.length, 1); assert.equal(f.calls[0].url, 'https://api.typesafe.ai/v1/systemone'); assert.equal(f.calls[0].options.headers.Authorization, 'Bearer secret-value');
  assert.equal(f.calls[0].options.redirect, 'error'); assert.equal(f.calls[0].options.credentials, 'omit');
  assert.deepEqual(JSON.parse(f.calls[0].options.body), { model: 'jev-latest', state: 'Scene', questions });
  assert.doesNotMatch(JSON.stringify(binding.data), /secret-value|jev-secret|typesafe\.ai/); assert.doesNotMatch(JSON.stringify(fastBindingSummary(binding.data)), /secret-value|jev-secret|typesafe\.ai/);
  assert.equal((await fastBindingStatus({ ...binding.data }, f.host)).ok, false);
});
test('Laya supports explicit loopback endpoint and no authentication; unsafe endpoints fail', async () => {
  const f = fixture({ provider: 'laya', endpoint: 'http://127.0.0.1:8080/v1/systemone', model: 'multilingual', credentialRef: undefined });
  delete f.getConfig().credentialRef;
  const binding = await captureFastBinding('fast-one', f.host); assert.equal(binding.ok, true);
  assert.equal((await requestFastDecision(binding.data, { state: {}, questions }, f.host)).ok, true); assert.equal(Object.hasOwn(f.calls[0].options.headers,'Authorization'), false);
  for (const endpoint of ['http://example.com/v1/systemone','https://u:p@example.com/v1/systemone','https://example.com/v1/systemone?key=secret','file:///v1/systemone','https://example.com/v1/chat/completions']) {
    const bad = fixture({ provider: 'compatible', endpoint }); assert.equal((await captureFastBinding('fast-one', bad.host)).ok, false);
  }
});
test('captured configuration and credential freshness are checked before sending and after awaits', async () => {
  const f = fixture(), binding = (await captureFastBinding('fast-one', f.host)).data;
  f.setConfig({ ...f.getConfig(), model: 'jev-new' }); assert.equal((await requestFastDecision(binding, { state: 'Scene', questions }, f.host)).error.code, 'BINDING_CHANGED'); assert.equal(f.calls.length, 0);
  const g = fixture(), credentialBinding = (await captureFastBinding('fast-one', g.host)).data; g.setSecret('rotated'); assert.equal((await fastBindingStatus(credentialBinding,g.host)).error.code, 'BINDING_CHANGED');
  const h = fixture(), lateBinding = (await captureFastBinding('fast-one', h.host)).data;
  h.host.fetch = async () => { h.setConfig({ ...h.getConfig(), revision: 2 }); return { ok: true, status: 200, text: async () => JSON.stringify(raw) }; };
  assert.equal((await requestFastDecision(lateBinding,{ state: 'Scene', questions },h.host)).error.code, 'BINDING_CHANGED');
});
test('HTTP/schema failures stay failures, do not echo provider errors, and do not retry', async () => {
  for (const [status, expected] of [[401,'AUTH_FAILED'],[429,'RATE_LIMITED'],[529,'PROVIDER_OVERLOADED'],[422,'INVALID_FAST_REQUEST'],[500,'HTTP_ERROR']]) {
    const f = fixture(); let calls = 0; f.host.fetch = async () => { calls++; return { ok: false, status, text: async () => 'private API secret response' }; };
    const binding = (await captureFastBinding('fast-one',f.host)).data; const result = await requestFastDecision(binding,{ state: 'Scene', questions },f.host);
    assert.equal(result.error.code,expected); assert.equal(calls,1); assert.doesNotMatch(JSON.stringify(result), /private API secret/);
  }
  const f = fixture(); f.host.fetch = async () => ({ ok: true, status: 200, text: async () => '{invalid' });
  const binding = (await captureFastBinding('fast-one',f.host)).data; assert.equal((await requestFastDecision(binding,{ state: 'Scene', questions },f.host)).error.code,'INVALID_FAST_RESPONSE');
});
test('transport errors and cancelled or oversized late bodies do not yield judgments', async () => {
  const f = fixture(); f.host.fetch = async () => { throw new Error('secret request details'); }; const binding = (await captureFastBinding('fast-one',f.host)).data;
  const result = await requestFastDecision(binding,{ state: 'Scene', questions },f.host); assert.equal(result.error.code,'REQUEST_FAILED'); assert.doesNotMatch(JSON.stringify(result), /secret request details/);
  const g = fixture(), controller = new AbortController(); g.host.fetch = async () => ({ ok: true,status: 200,text: async () => { controller.abort(); return JSON.stringify(raw); } });
  const cancelled = await requestFastDecision((await captureFastBinding('fast-one',g.host)).data,{ state: 'Scene',questions,signal:controller.signal },g.host); assert.equal(cancelled.error.code,'ABORTED');
  const h = fixture(); h.host.fetch = async () => ({ ok: true,status: 200,text: async () => 'x'.repeat(262145) });
  assert.equal((await requestFastDecision((await captureFastBinding('fast-one',h.host)).data,{ state: 'Scene',questions },h.host)).error.code,'FAST_RESPONSE_LIMIT');
});
test('connection controls reject accessors and inline credentials; compatible typed models remain supported', async () => {
  let reads=0; const f=fixture({ provider:'compatible',endpoint:'https://typed.example/v1/systemone',model:'another-typed-model' });
  assert.equal((await captureFastBinding('fast-one',f.host)).ok,true);
  Object.defineProperty(f.getConfig(),'endpoint',{ enumerable:true,get(){reads++;return 'https://typed.example/v1/systemone';} });
  assert.equal((await captureFastBinding('fast-one',f.host)).ok,false);assert.equal(reads,0);
  const g=fixture({ apiKey:'secret' });assert.equal((await captureFastBinding('fast-one',g.host)).ok,false);
});
test('typed request inputs reject accessors before transport without executing them', async () => {
  const f=fixture(),binding=(await captureFastBinding('fast-one',f.host)).data;let reads=0;
  const input={questions};Object.defineProperty(input,'state',{enumerable:true,get(){reads++;return 'Scene';}});
  const result=await requestFastDecision(binding,input,f.host);assert.equal(result.ok,false);assert.equal(reads,0);assert.equal(f.calls.length,0);
});
test('streamed HTTP response enforces its byte limit before buffering the whole body', async () => {
  const f=fixture();let cancelled=false;
  f.host.fetch=async()=>({ok:true,status:200,body:new ReadableStream({start(controller){controller.enqueue(new Uint8Array(200000));controller.enqueue(new Uint8Array(70000));},cancel(){cancelled=true;}})});
  const binding=(await captureFastBinding('fast-one',f.host)).data;const result=await requestFastDecision(binding,{state:'Scene',questions},f.host);
  assert.equal(result.error.code,'FAST_RESPONSE_LIMIT');assert.equal(cancelled,true);
});
test('aborted and invalid requests perform no HTTP call', async () => {
  const f=fixture(),binding=(await captureFastBinding('fast-one',f.host)).data,controller=new AbortController();controller.abort();
  assert.equal((await requestFastDecision(binding,{state:'Scene',questions,signal:controller.signal},f.host)).error.code,'ABORTED');
  assert.equal((await requestFastDecision(binding,{state:'Scene',questions:{}},f.host)).ok,false);assert.equal(f.calls.length,0);
});
test('provider diagnostics cannot echo the resolved bearer value under an innocuous key', async () => {
  const f=fixture();f.host.fetch=async()=>({ok:true,status:200,text:async()=>JSON.stringify({...raw,routing:{model:'multilingual',note:'received secret-value from request'}})});
  const binding=(await captureFastBinding('fast-one',f.host)).data;const result=await requestFastDecision(binding,{state:'Scene',questions},f.host);
  assert.equal(result.ok,true);assert.doesNotMatch(JSON.stringify(result),/secret-value/);assert.match(result.data.response.routing.note,/redacted/);
});
test('abort while final freshness is awaited discards an otherwise valid completed body', async () => {
  const f=fixture(),controller=new AbortController();let bodyRead=false;
  const originalGet=f.host.getConnection;
  f.host.getConnection=async()=>{if(bodyRead){await Promise.resolve();controller.abort();}return originalGet();};
  f.host.fetch=async()=>({ok:true,status:200,text:async()=>{bodyRead=true;return JSON.stringify(raw);}});
  const binding=(await captureFastBinding('fast-one',f.host)).data;
  const result=await requestFastDecision(binding,{state:'Scene',questions,signal:controller.signal},f.host);
  assert.equal(result.ok,false);assert.equal(result.error.code,'ABORTED');
});
test('same-reference credential rotation during the last config read prevents old-bearer transmission', async () => {
  const f=fixture();let armed=false,rotateAtLookup=false;const get=f.host.getConnection,resolve=f.host.resolveSecret;
  f.host.resolveSecret=async reference=>{const value=await resolve(reference);if(armed)rotateAtLookup=true;return value;};
  f.host.getConnection=async()=>{if(rotateAtLookup){rotateAtLookup=false;f.setSecret('rotated-secret');}return get();};
  const binding=(await captureFastBinding('fast-one',f.host)).data;armed=true;
  const result=await requestFastDecision(binding,{state:'Scene',questions},f.host);
  assert.equal(result.ok,false);assert.equal(result.error.code,'BINDING_CHANGED');assert.equal(f.calls.length,0);
});
test('same-reference rotation in final awaited config read invalidates completed answer provenance', async () => {
  const f=fixture();let bodyRead=false,rotateAtLookup=false;const get=f.host.getConnection,resolve=f.host.resolveSecret;
  f.host.resolveSecret=async reference=>{const value=await resolve(reference);if(bodyRead)rotateAtLookup=true;return value;};
  f.host.getConnection=async()=>{if(rotateAtLookup){rotateAtLookup=false;f.setSecret('rotated-secret');}return get();};
  f.host.fetch=async()=>({ok:true,status:200,text:async()=>{bodyRead=true;return JSON.stringify(raw);}});
  const binding=(await captureFastBinding('fast-one',f.host)).data;
  const result=await requestFastDecision(binding,{state:'Scene',questions},f.host);
  assert.equal(result.ok,false);assert.equal(result.error.code,'BINDING_CHANGED');assert.equal(Object.hasOwn(result,'data'),false);
});
test('coherent registry freshness fails closed without a synchronous token covering credentials', async () => {
  for(const getRegistryRevision of [undefined,async()=>1,()=>({version:1})]) {
    const f=fixture();f.host.getRegistryRevision=getRegistryRevision;
    const result=await captureFastBinding('fast-one',f.host);
    assert.equal(result.ok,false);assert.equal(result.error.code,'SERVICE_UNAVAILABLE');assert.equal(f.calls.length,0);
  }
});
test('a capture cannot combine pre-rotation secret with post-rotation configuration epoch', async () => {
  const f=fixture();let rotateAtLookup=false;const get=f.host.getConnection,resolve=f.host.resolveSecret;
  f.host.resolveSecret=async reference=>{const value=await resolve(reference);rotateAtLookup=true;return value;};
  f.host.getConnection=async()=>{if(rotateAtLookup){rotateAtLookup=false;f.setSecret('rotated-secret');}return get();};
  const result=await captureFastBinding('fast-one',f.host);
  assert.equal(result.ok,false);assert.equal(result.error.code,'BINDING_CHANGED');assert.equal(f.calls.length,0);
});
