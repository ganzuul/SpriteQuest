import assert from 'node:assert/strict';
import test from 'node:test';
import { activeModelMetadata } from '../src/workflow/model-profiles.js';
import { operationDefaults } from '../src/workflow/catalog.js';
import { resolveBinding, requestModel, bindingStatus, bindingSummary } from '../src/workflow/connections.js';
import { computeDefinitionIdentity } from '../src/workflow/definitions.js';
import { exportWorkflow, parseWorkflow } from '../src/workflow/packages.js';
import { prepareWorkflowInsertion } from '../src/workflow/insertion.js';
const active = 'lattice:active-sillytavern';
const messages = [{role:'system',content:'Owned instruction'},{role:'user',content:'Owned context'}];
const complete = text => ({choices:[{message:{content:text},finish_reason:'stop'}]});
function chatHost() {
    return {mainApi:'openai',chatCompletionSettings:{chat_completion_source:'nanogpt',nanogpt_model:'live-model',temperature:0.23,openai_max_tokens:9000,bias_presets:{current:[{text:'yes',value:1}]},bias_preset_selected:'current'},
        getChatCompletionModel:settings=>settings.nanogpt_model,
        ConnectionManagerRequestService:{getProfile:()=>{throw Error('Active route must not consult fixed profiles');},sendRequest:()=>{throw Error('Active route must not use Connection Manager');}},
        ChatCompletionService:{presetToGeneratePayload:async(preset,overrides,payload)=>({max_tokens:overrides.openai_max_tokens,...payload,temperature:preset.temperature,bias:preset.bias_presets[preset.bias_preset_selected],max_completion_tokens:overrides.openai_max_tokens}),sendRequest:async payload=>complete(JSON.stringify(payload))}};
}
const bindingFor = context => resolveBinding({profileId:active,modelRole:'Analysis'},{},context);

test('new model-capable nodes explicitly follow the active host while saved nulls retain role fallback',()=>{
    for(const operation of ['response-plan','smart-compactor','repair']) assert.equal(operationDefaults(operation).profileId,active);
    assert.equal(operationDefaults('scene-context').profileId,null);
    const context={CONNECT_API_MAP:{custom:{selected:'openai',source:'custom'}},ConnectionManagerRequestService:{getProfile:id=>({id,name:'Role',api:'custom',model:'role-model','api-url':'https://fixture.example'})}};
    assert.equal(resolveBinding({profileId:null,modelRole:'Analysis'},{roles:{Analysis:{profileId:'legacy'}}},context).data.model,'role-model');
});

test('active chat requests use unsaved model, sampler and bias with owned messages and bounded token aliases',async()=>{
    const context=chatHost(), bound=bindingFor(context);assert.equal(bound.ok,true,JSON.stringify(bound.error));
    const response=await requestModel({binding:bound.data,messages,maxTokens:37},context);assert.equal(response.ok,true,JSON.stringify(response.error));
    const sent=JSON.parse(response.data.text);assert.equal(sent.model,'live-model');assert.equal(sent.temperature,0.23);assert.deepEqual(sent.bias,[{text:'yes',value:1}]);
    assert.deepEqual(sent.messages,messages);assert.equal(sent.chat_completion_source,'nanogpt');assert.equal(sent.max_tokens,37);assert.equal(sent.max_completion_tokens,37);assert.equal(sent.stream,false);
    context.chatCompletionSettings.nanogpt_model='next-model';assert.equal(bindingFor(context).data.model,'next-model');
    assert.equal(bindingStatus(bound.data,context).error.code,'BINDING_CHANGED');
    assert.equal(resolveBinding({profileId:active,model:'node-model'},{},context).data.model,'node-model');
    assert.equal(context.chatCompletionSettings.openai_max_tokens,9000);
});

for(const [label,mutate] of [
    ['main API',c=>{c.mainApi='textgenerationwebui';}],['source',c=>{c.chatCompletionSettings.chat_completion_source='custom';}],
    ['model',c=>{c.chatCompletionSettings.nanogpt_model='changed';}],['sampler',c=>{c.chatCompletionSettings.temperature=0.4;}],
]) test(`fresh context after asynchronous conversion prevents sending when active ${label} changes`,async()=>{
    let current=chatHost(),sent=false;
    current.ChatCompletionService.presetToGeneratePayload=async(_preset,_override,payload)=>{current={...current,chatCompletionSettings:{...current.chatCompletionSettings}};mutate(current);return payload;};
    current.ChatCompletionService.sendRequest=async()=>{sent=true;return complete('unsafe');};
    const bound=bindingFor(current);assert.equal(bound.ok,true,JSON.stringify(bound.error));
    assert.equal((await requestModel({binding:bound.data,messages,maxTokens:10},()=>current)).error.code,'BINDING_CHANGED');assert.equal(sent,false);
});

test('active aborts before transmission and ignores late response while preserving completion evidence',async()=>{
    const context=chatHost(),abort=new AbortController();let sent=false;
    context.ChatCompletionService.presetToGeneratePayload=async(_preset,_override,payload)=>{abort.abort();return payload;};
    context.ChatCompletionService.sendRequest=async()=>{sent=true;return complete('unsafe');};
    let bound=bindingFor(context);assert.equal(bound.ok,true,JSON.stringify(bound.error));
    assert.equal((await requestModel({binding:bound.data,messages,maxTokens:10,signal:abort.signal},context)).error.code,'ABORTED');assert.equal(sent,false);
    const late=new AbortController();context.ChatCompletionService.presetToGeneratePayload=async(_preset,_override,payload)=>payload;
    context.ChatCompletionService.sendRequest=async()=>{late.abort();return complete('late');};
    bound=bindingFor(context);assert.equal((await requestModel({binding:bound.data,messages,maxTokens:10,signal:late.signal},context)).error.code,'ABORTED');
    context.ChatCompletionService.sendRequest=async()=>({choices:[{message:{content:'partial'},finish_reason:'length'}]});
    assert.equal((await requestModel({binding:bindingFor(context).data,messages,maxTokens:10},context)).error.code,'TRUNCATED_OUTPUT');
    context.ChatCompletionService.sendRequest=async()=>({choices:[{message:{content:'unverified'}}]});
    assert.equal((await requestModel({binding:bindingFor(context).data,messages,maxTokens:10},context)).error.code,'COMPLETION_UNVERIFIED');
});

test('active text formats captured unsaved instruct and routes owned bounded prompt without fixed-profile activation',async()=>{
    const context={mainApi:'textgenerationwebui',textCompletionSettings:{type:'generic',generic_model:'text-model',temperature:0.31},powerUserSettings:{instruct:{enabled:true,input_sequence:'LIVE:'},context:{chat_start:'start'}},getTextGenServer:()=> 'https://text.example',
        TextCompletionService:{constructPrompt:(owned,instruct)=>instruct.input_sequence+owned.map(m=>m.content).join('|'),presetToGeneratePayload:(_preset,overrides,payload)=>({...payload,temperature:0.31,genamt:overrides.genamt}),sendRequest:async payload=>complete(JSON.stringify(payload))}};
    const bound=bindingFor(context);assert.equal(bound.ok,true,JSON.stringify(bound.error));
    const result=await requestModel({binding:bound.data,messages,maxTokens:19},context);assert.equal(result.ok,true,JSON.stringify(result.error));
    const sent=JSON.parse(result.data.text);assert.equal(sent.prompt,'LIVE:Owned instruction|Owned context');assert.equal(sent.api_type,'generic');assert.equal(sent.api_server,'https://text.example');assert.equal(sent.max_tokens,19);assert.equal(sent.genamt,19);assert.equal(sent.model,'text-model');
    context.powerUserSettings.instruct.input_sequence='CHANGED:';assert.equal(bindingStatus(bound.data,context).error.code,'BINDING_CHANGED');
    context.powerUserSettings.instruct.enabled=false;
    assert.equal(JSON.parse((await requestModel({binding:bindingFor(context).data,messages,maxTokens:19},context)).data.text).prompt,'Owned instruction\n\nOwned context');
});

test('active metadata is authenticated and safe summaries carry no captured settings',()=>{
    const context=chatHost();context.chatCompletionSettings.api_key='secret';context.chatCompletionSettings.custom_headers='Authorization: secret';
    const bound=bindingFor(context);assert.equal(bound.ok,true,JSON.stringify(bound.error));
    assert.equal(bindingStatus({...bound.data},context).error.code,'BINDING_CHANGED');
    assert.deepEqual(Object.keys(bindingSummary(bound.data)).sort(),['fingerprint','model','profileId','role']);
    assert.ok(!JSON.stringify(bound.data).includes('secret'));assert.ok(!JSON.stringify(bindingSummary(bound.data)).includes('temperature'));
    bound.data.model='forged';assert.equal(bindingStatus(bound.data,context).error.code,'BINDING_CHANGED');
});

const draft = profileId => ({id:'definition',version:1,name:'Plan',interface:[],parameters:[],body:{schema:3,runtime:2,mode:'native-pre',nodes:{plan:{id:'plan',type:'workflow',operation:'response-plan',profileId}},wires:{},roles:{Analysis:{profileId}}}});
const graph = profileId => ({id:'root',schema:3,runtime:2,mode:'native-pre',nodes:{plan:{id:'plan',type:'workflow',operation:'response-plan',profileId}},wires:{},roles:{Analysis:{profileId}},definitions:{}});
test('portable active identity survives workflow export and import while local profile identities are stripped',()=>{
    const exported=exportWorkflow(graph(active));assert.equal(exported.graph.nodes.plan.profileId,active);assert.equal(exported.graph.roles.Analysis.profileId,active);
    assert.equal(parseWorkflow(JSON.stringify(exported)).data.nodes.plan.profileId,active);
    const local=computeDefinitionIdentity(draft('local')),other=computeDefinitionIdentity(draft('another')),live=computeDefinitionIdentity(draft(active));
    assert.equal(local.ok,true);assert.equal(live.ok,true);assert.equal(local.data.semanticHash,other.data.semanticHash);assert.notEqual(live.data.semanticHash,local.data.semanticHash);
    assert.equal(live.data.materializedDefinition.body.nodes.plan.profileId,active);
    const inserted=prepareWorkflowInsertion({...graph(null),nodes:{},roles:{}},graph(active));assert.equal(inserted.ok,true,JSON.stringify(inserted.error));
    assert.deepEqual(inserted.data.diagnostics.unresolvedBindings,[]);
});
test('active display metadata resolves host model without exposing settings or requiring request services',()=>{
    const context=chatHost();context.chatCompletionSettings.api_key='secret';delete context.ChatCompletionService;
    assert.deepEqual(activeModelMetadata(context),{api:'nanogpt',apiLabel:'NanoGPT',model:'live-model'});
    context.chatCompletionSettings.nanogpt_model='changed';assert.equal(activeModelMetadata(context).model,'changed');
    context.mainApi='legacy';assert.equal(activeModelMetadata(context),null);
});

import { createNativeWorkflowController } from '../src/workflow/host.js';
import { starterGraph } from '../src/workflow/starters.js';
function activeController() {
    const graph=starterGraph('reviewed-de-slop'),context=chatHost();
    Object.assign(context,{chatId:'chat',characterId:1,groupId:null,chat:[{mes:'Hello',is_user:true},{mes:'We delve.',is_user:false,swipe_id:0,swipes:['We delve.'],gen_started:1,gen_finished:2}],extensionPrompts:{}});
    context.ChatCompletionService.sendRequest=async()=>complete('{"patches":[{"index":0,"replacement":"explore"}]}');
    return {graph,context,controller:createNativeWorkflowController({context:()=>({...context}),countTokens:async text=>({tokens:Math.ceil(text.length/4),method:'fixture'})})};
}
test('host request adapter rechecks a freshly captured main API before transmitting',async()=>{
    const {graph,context,controller}=activeController();let sent=false;
    context.ChatCompletionService.presetToGeneratePayload=async(_preset,_override,payload)=>{context.mainApi='legacy';return payload;};
    context.ChatCompletionService.sendRequest=async()=>{sent=true;return complete('unsafe');};
    const result=await controller.runPost(graph);assert.equal(result.error.code,'BINDING_CHANGED');assert.equal(sent,false);assert.deepEqual(result.reviewHandles,[]);
});
for(const [label,mutate] of [['sampler',c=>{c.chatCompletionSettings.temperature=0.6;}],['model',c=>{c.chatCompletionSettings.nanogpt_model='changed';}],['API',c=>{c.mainApi='legacy';}]]) test(`settled active candidates reject changed host ${label}`,async()=>{
    const {graph,context,controller}=activeController(),result=await controller.runPost(graph);assert.equal(result.ok,true,JSON.stringify(result.error));
    assert.equal(result.reviewHandles.length,1);assert.equal(controller.candidateStatus(result.reviewHandles[0]).ok,true);
    mutate(context);assert.equal(controller.candidateStatus(result.reviewHandles[0]).error.code,'BINDING_CHANGED');
    assert.equal((await controller.apply(result.reviewHandles[0])).error.code,'BINDING_CHANGED');assert.equal(context.chat.at(-1).mes,'We delve.');
});

test('an already-aborted request never reads fresh host authority',async()=>{
    const abort=new AbortController();abort.abort();let reads=0;
    const result=await requestModel({binding:{},messages,maxTokens:10,signal:abort.signal},()=>{reads++;return chatHost();});
    assert.equal(result.error.code,'ABORTED');assert.equal(reads,0);
});

for(const [label,field] of [['API token','api_token'],['access token','access_token'],['credential bundle','credentials']]) test(`active converter captures omit private ${label}`,async()=>{
    const context=chatHost();context.chatCompletionSettings[field]='secret';
    context.ChatCompletionService.presetToGeneratePayload=async(preset,_override,payload)=>({...payload,privateFieldPresent:Object.hasOwn(preset,field)});
    const response=await requestModel({binding:bindingFor(context).data,messages,maxTokens:10},context);assert.equal(response.ok,true,JSON.stringify(response.error));
    assert.equal(JSON.parse(response.data.text).privateFieldPresent,false);
});

for(const [label,mutate] of [
    ['API',c=>{c.mainApi='openai';}],['provider',c=>{c.textCompletionSettings.type='ollama';}],['model',c=>{c.textCompletionSettings.generic_model='changed';}],
    ['endpoint',c=>{c.server='https://changed.example';}],['sampler',c=>{c.textCompletionSettings.temperature=0.5;}],
    ['instruct',c=>{c.powerUserSettings.instruct.input_sequence='CHANGED:';}],['context stops',c=>{c.powerUserSettings.context.chat_start='changed';}],
]) test(`active text rechecks ${label} changes before transmission`,async()=>{
    let sent=false;
    const context={mainApi:'textgenerationwebui',textCompletionSettings:{type:'generic',generic_model:'text-model',temperature:0.3},server:'https://text.example',getTextGenServer:()=>context.server,powerUserSettings:{instruct:{enabled:true,input_sequence:'LIVE:'},context:{chat_start:'start'}},
        TextCompletionService:{constructPrompt:owned=>owned.map(m=>m.content).join('|'),presetToGeneratePayload:(_preset,_override,payload)=>{mutate(context);return payload;},sendRequest:async()=>{sent=true;return complete('unsafe');}}};
    const bound=bindingFor(context);assert.equal(bound.ok,true,JSON.stringify(bound.error));
    assert.equal((await requestModel({binding:bound.data,messages,maxTokens:10},()=>({...context}))).error.code,'BINDING_CHANGED');assert.equal(sent,false);
});
test('active unsupported completion-evidence and proxy routes fail before transmission',()=>{
    for(const source of ['claude','makersuite','vertexai']) {
        const context=chatHost();context.chatCompletionSettings.chat_completion_source=source;
        assert.equal(bindingFor(context).error.code,'UNSUPPORTED_BINDING');
    }
    const context=chatHost();context.chatCompletionSettings.chat_completion_source='openai';context.chatCompletionSettings.reverse_proxy='https://proxy.example';
    assert.equal(bindingFor(context).error.code,'UNSUPPORTED_BINDING');
    assert.equal(bindingFor({mainApi:'textgenerationwebui',textCompletionSettings:{type:'infermaticai',infermaticai_model:'model'}}).error.code,'UNSUPPORTED_BINDING');
});
test('active service receives the original abort signal and raw completion extraction mode',async()=>{
    const context=chatHost(),abort=new AbortController();
    context.ChatCompletionService.sendRequest=async(_payload,extractData,signal)=>complete(JSON.stringify({extractData,sameSignal:signal===abort.signal}));
    const result=await requestModel({binding:bindingFor(context).data,messages,maxTokens:10,signal:abort.signal},context);
    assert.equal(result.ok,true,JSON.stringify(result.error));assert.deepEqual(JSON.parse(result.data.text),{extractData:false,sameSignal:true});
});

for(const [model,alias] of [['o1','max_completion_tokens'],['o3-mini','max_completion_tokens'],['o4-mini','max_completion_tokens'],['gpt-5.6-terra','max_completion_tokens'],['gpt-6-astra','max_completion_tokens'],['gpt-4.1','max_tokens']]) test(`active ${model} respects host token-field selection while bounding the converted cap`,async()=>{
    const context=chatHost();context.chatCompletionSettings.chat_completion_source='openai';context.chatCompletionSettings.nanogpt_model=model;
    // The real converter chooses the native alias, then merges owned overridePayload.
    context.ChatCompletionService.presetToGeneratePayload=async(_preset,overridePreset,payload)=>({[alias]:9000,...payload,nativeCap:overridePreset.openai_max_tokens});
    const result=await requestModel({binding:bindingFor(context).data,messages,maxTokens:37},context);assert.equal(result.ok,true,JSON.stringify(result.error));
    const sent=JSON.parse(result.data.text);assert.equal(sent[alias],37);assert.equal(sent.nativeCap,37);
    assert.equal(Object.hasOwn(sent,alias==='max_tokens'?'max_completion_tokens':'max_tokens'),false);
});

function stoppingHost(api) {
    const context=chatHost();context.powerUserSettings={custom_stopping_strings:'["END"]',custom_stopping_strings_macro:false,single_line:false,instruct:{enabled:false},context:{}};
    if(api==='textgenerationwebui') Object.assign(context,{mainApi:api,textCompletionSettings:{type:'generic',generic_model:'text-model'},getTextGenServer:()=> 'https://text.example',TextCompletionService:{presetToGeneratePayload:(_preset,_override,payload)=>payload,sendRequest:async payload=>complete(JSON.stringify(payload))}});
    return context;
}
for(const [api,field,value] of [['openai','custom_stopping_strings','["CHANGED"]'],['openai','custom_stopping_strings_macro',true],['textgenerationwebui','custom_stopping_strings','["CHANGED"]'],['textgenerationwebui','custom_stopping_strings_macro',true],['textgenerationwebui','single_line',true]]) test(`active ${api} rejects changed public ${field} before transmission`,async()=>{
    const context=stoppingHost(api);let sent=false;
    const service=api==='openai'?context.ChatCompletionService:context.TextCompletionService;
    service.presetToGeneratePayload=(_preset,_override,payload)=>{context.powerUserSettings[field]=value;return payload;};
    service.sendRequest=async()=>{sent=true;return complete('unsafe');};
    const bound=bindingFor(context);assert.equal(bound.ok,true,JSON.stringify(bound.error));
    assert.equal((await requestModel({binding:bound.data,messages,maxTokens:10},()=>({...context}))).error?.code,'BINDING_CHANGED');assert.equal(sent,false);
});
for(const [field,value] of [['custom_stopping_strings','["CHANGED"]'],['custom_stopping_strings_macro',true]]) test(`settled active candidate rejects changed public ${field}`,async()=>{
    const {graph,context,controller}=activeController();context.powerUserSettings={custom_stopping_strings:'["END"]',custom_stopping_strings_macro:false};
    const result=await controller.runPost(graph);assert.equal(result.ok,true,JSON.stringify(result.error));
    assert.equal(controller.candidateStatus(result.reviewHandles[0]).ok,true);context.powerUserSettings[field]=value;
    assert.equal(controller.candidateStatus(result.reviewHandles[0]).error?.code,'BINDING_CHANGED');
});
for(const type of ['ooba','generic','tabby','llamacpp','koboldcpp']) test(`active ${type} may request its server-loaded model without sending a null model field`,async()=>{
    const context={mainApi:'textgenerationwebui',textCompletionSettings:{type},powerUserSettings:{instruct:{enabled:false}},getTextGenServer:()=> 'https://local.example',TextCompletionService:{presetToGeneratePayload:(_preset,_override,payload)=>({...payload}),sendRequest:async payload=>complete(JSON.stringify(payload))}};
    const bound=bindingFor(context);assert.equal(bound.ok,true,JSON.stringify(bound.error));assert.equal(bound.data.model,null);
    const result=await requestModel({binding:bound.data,messages,maxTokens:23},context);assert.equal(result.ok,true,JSON.stringify(result.error));
    const sent=JSON.parse(result.data.text);assert.equal(Object.hasOwn(sent,'model'),false);assert.equal(sent.max_tokens,23);assert.equal(sent.api_type,type);
    const explicit=resolveBinding({profileId:active,model:'node-model'},{},context);assert.equal(explicit.ok,true);
    const override=await requestModel({binding:explicit.data,messages,maxTokens:23},context);assert.equal(JSON.parse(override.data.text).model,'node-model');
});
