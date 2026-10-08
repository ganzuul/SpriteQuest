import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as runtime from '../src/workflow/runtime.js';
import * as connections from '../src/workflow/connections.js';
import * as starters from '../src/workflow/starters.js';
import { createLiveGuard, createLiveReservationBridge, productionModulePath, runSyntheticFixtures } from '../tools/live-workflow-test.mjs';
const model = 'z-ai/glm-5.2';
const owned = [{role:'system',content:'Synthetic fixture only.'},{role:'user',content:'A synthetic blue lantern.'}];
const options = { live:true, host:'http://127.0.0.1:8000', priorAttempts:3, maxAttempts:3 };
const request = {binding:{model},messages:owned,maxTokens:1024};
const response = {ok:true,data:{text:'Fixture answer',finish:'stop',usage:{prompt_tokens:20,completion_tokens:3}}};
function probe(config = options, reply = response) {
    let executions = 0;
    const guard = createLiveGuard(config);
    return {guard, executions:()=>executions, send:input=>guard.request(input, async()=>{ executions++; return reply; })};
}
// Removing the opt-in check would execute this paid boundary.
test('without explicit live opt-in no transport executes', async()=>{
    const p = probe({...options,live:false});
    await assert.rejects(p.send(request),/opt.in/i); assert.equal(p.executions(),0);
});
// An unchecked host would send credentials to a remote server.
test('only plain HTTP loopback hosts are accepted', ()=>{
    for (const host of ['https://example.com','http://127.0.0.1.evil:8000','http://localhost:8000','http://user:pass@127.0.0.1:8000']) assert.throws(()=>createLiveGuard({...options,host}),/loopback/i);
});
test('unapproved models and excessive completion caps fail before transport', async()=>{
    const p = probe();
    for (const input of [{...request,binding:{model:'z-ai/glm-5.1'}},{...request,maxTokens:4097},{...request,maxTokens:0},{...request,maxTokens:2.5}]) await assert.rejects(p.send(input),/model|cap/i);
    assert.equal(p.executions(),0);
});
test('the global prior allowance and local bound refuse extra attempts', async()=>{
    assert.throws(()=>createLiveGuard({...options,priorAttempts:2}),/prior/i);
    assert.throws(()=>createLiveGuard({...options,maxAttempts:6}),/attempt/i);
    const p = probe({...options,maxAttempts:1});
    assert.equal((await p.send(request)).ok,true);
    await assert.rejects(p.send(request),/attempt/i);
    assert.equal(p.executions(),1); assert.equal(p.guard.attempts(),1);
});
test('only one exact owned backend payload consumes a reservation', async()=>{
    const guard = createLiveGuard(options); let paid = 0;
    assert.equal(guard.authorize({model,max_tokens:1024,messages:owned,chat_completion_source:'nanogpt'}),false);
    await guard.request(request,async()=>{
        assert.equal(guard.authorize({model,max_tokens:1024,messages:[...owned,{role:'user',content:'Unexpected private input'}],chat_completion_source:'nanogpt'}),false);
        const payload = {model,max_tokens:1024,messages:owned,chat_completion_source:'nanogpt'};
        if (guard.authorize(payload)) paid++;
        if (guard.authorize(payload)) paid++;
        return response;
    });
    assert.equal(paid,1);
    assert.equal(guard.authorize({model,max_tokens:1024,messages:owned,chat_completion_source:'nanogpt'}),false);
});
test('provider rejection stops the session without retry', async()=>{
    const p = probe(options,{ok:false,error:{code:'REQUEST_FAILED',message:'Failure'}});
    assert.equal((await p.send(request)).ok,false);
    await assert.rejects(p.send(request),/stopped/i);
    assert.equal(p.executions(),1);
});
test('a thrown transport is counted and cannot be retried', async()=>{
    const guard=createLiveGuard(options); let paid=0;
    await assert.rejects(guard.request(request,async()=>{paid++;throw Error('failure');}),/failure/);
    await assert.rejects(guard.request(request,async()=>{paid++;return response;}),/stopped/i);
    assert.equal(paid,1); assert.equal(guard.attempts(),1);
});

test('reservation bridge refuses invalid and concurrent sends without replacing the owned payload', async()=>{
    const guard=createLiveGuard(options), bridge=createLiveReservationBridge(guard);
    await assert.rejects(bridge.reserve({...request,binding:{model:'unapproved'}}),/model/i);
    await bridge.reserve(request);
    await assert.rejects(bridge.reserve(request),/attempt|active/i);
    assert.equal(guard.authorize({model,max_tokens:1024,messages:owned,chat_completion_source:'nanogpt'}),true);
    await bridge.finish(response);
    assert.equal(guard.attempts(),1);
});
test('dedicated module routing refuses arbitrary files and serves an actual production module', async()=>{
    const root=fileURLToPath(new URL('../',import.meta.url));
    const path=await productionModulePath(root,'http://127.0.0.1/__comfytavern-live-test/src/workflow/runtime.js?v=0.18.0');
    assert.equal(path,fileURLToPath(new URL('../src/workflow/runtime.js',import.meta.url)));
    for (const url of ['http://127.0.0.1/__comfytavern-live-test/.git/config','http://127.0.0.1/__comfytavern-live-test/src/state.js','http://127.0.0.1/__comfytavern-live-test/src/workflow/../../.aws/credentials']) await assert.rejects(productionModulePath(root,url),/module/i);
});
test('production fixture graphs compact pinned text, plan bounded guidance and return a reviewed candidate in exactly three requests', async()=>{
    const guard=createLiveGuard(options), bridge=createLiveReservationBridge(guard);
    const host={
        CONNECT_API_MAP:{nanogpt:{selected:'openai',source:'nanogpt'}},chatCompletionSettings:{},
        ChatCompletionService:{presetToGeneratePayload:async(_preset,_route,payload)=>payload},
        ConnectionManagerRequestService:{getProfile:()=>({name:'Synthetic profile',api:'nanogpt',model}),sendRequest:async(_profile,messages,maxTokens,_options,payload)=>{
            assert.equal(guard.authorize(payload),true);
            const text=messages[0].content.startsWith('Summarize') ? 'A traveler waits by a blue lantern and a closed gate, undecided about entering.' : messages[0].content.startsWith('Write concise') ? 'Offer the traveler a choice to wait or examine the gate. LANTERN-KEEP-26 remains a constraint.' : '{"patches":[{"index":0,"replacement":"showed"}]}';
            return {choices:[{message:{content:text},finish_reason:'stop'}],usage:{prompt_tokens:50,completion_tokens:20,total_tokens:70,cost:0,currency:'USD',privateField:'must never reach report'}};
        }},
    };
    const results=await runSyntheticFixtures({version:'0.18.0',profileId:'fixture-profile'},{runtime,connections,starters,host,reserve:bridge.reserve,finish:bridge.finish});
    assert.equal(results.length,2);
    assert.deepEqual(results.map(result=>[result.ok,result.actualCalls]),[[true,2],[true,1]]);
    assert.deepEqual(results.flatMap(result=>result.calls.map(call=>call.model)),['z-ai/glm-5.2','z-ai/glm-5.2:thinking','z-ai/glm-5.2']);
    assert.equal(results[0].constraints.pinPreserved,true);
    assert.equal(results[0].constraints.compactionWithinBudget,true);
    assert.equal(results[0].constraints.guidanceWithinBudget,true);
    assert.equal(results[1].artifact.kind,'candidate');
    assert.equal(results[1].artifact.text,'The lantern was showed the keeper\'s patience. The gate stayed shut.');
    assert.equal(results[1].constraints.originalPreserved,true);
    assert.equal(results[1].constraints.unselectedTextPreserved,true);
    assert.equal(results[1].constraints.reviewRequired,true);
    assert.equal(JSON.stringify(results).includes('privateField'),false);
    assert.equal(guard.attempts(),3);
});