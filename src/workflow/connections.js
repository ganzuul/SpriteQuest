const fail = (code, message) => ({ok:false,error:{code,message}});
const resolved = new WeakMap();
const safeSignature = value => JSON.stringify(value, (key,item) => /secret|password|api.?key|custom_headers|authorization/i.test(key) ? undefined : item);
const ENDPOINT_FIELDS = {custom:'custom_url',vertexai:'vertexai_region',zai:'zai_endpoint',siliconflow:'siliconflow_endpoint',minimax:'minimax_endpoint',pollinations:'pollinations_endpoint'};
// These host sources inherit reverse_proxy during preset conversion.
const PROXY_SOURCES = new Set(['claude','openai','mistralai','makersuite','vertexai','deepseek','xai','zai','moonshot']);
// Installed nonstreaming wrappers discard the upstream completion reason.
const LOSSY_CC_SOURCES = new Set(['claude','makersuite','vertexai']);
const COMPLETE_REASONS = new Set(['stop','eos_token','eos','stop_sequence','end_turn','complete','completed']);
const TC_MODELS = {ooba:'custom_model',generic:'generic_model',mancer:'mancer_model',togetherai:'togetherai_model',infermaticai:'infermaticai_model',dreamgen:'dreamgen_model',openrouter:'openrouter_model',vllm:'vllm_model',aphrodite:'aphrodite_model',ollama:'ollama_model',featherless:'featherless_model',tabby:'tabby_model',llamacpp:'llamacpp_model'};
function presetByName(context, api, name) {
    if (!name) return {};
    const manager = context.getPresetManager?.(api);
    const found = manager?.getCompletionPresetByName?.(name);
    if (found !== undefined) return structuredClone(found);
    const list = manager?.getPresetList?.();
    const names = list?.preset_names;
    const index = Array.isArray(names) ? names.indexOf(name) : names?.[name];
    return index !== undefined && index >= 0 && list.presets?.[index] !== undefined ? structuredClone(list.presets[index]) : null;
}
function completionEvidence(raw, binding) {
    if (binding.api === 'textgenerationwebui' && binding.source === 'ollama') {
        const prompt = raw?.prompt_eval_count, completion = raw?.eval_count;
        const hasPrompt = Number.isSafeInteger(prompt) && prompt >= 0;
        const hasCompletion = Number.isSafeInteger(completion) && completion >= 0;
        const usage = hasPrompt || hasCompletion ? {...(hasPrompt ? {prompt_tokens:prompt} : {}),...(hasCompletion ? {completion_tokens:completion} : {}),...(hasPrompt && hasCompletion ? {total_tokens:prompt + completion} : {})} : null;
        return {finish:raw?.done === true ? raw?.done_reason : null,usage};
    }
    const choice = raw?.choices?.[0];
    const reasons = [choice?.finish_reason,choice?.native_finish_reason,raw?.finish_reason,raw?.stop_reason,raw?.results?.[0]?.finish_reason];
    const cutoff = reasons.find(reason=>typeof reason === 'string' && ['length','max_tokens','max_output_tokens'].includes(reason.toLowerCase()));
    const unverified = reasons.find(reason=>reason !== undefined && reason !== null && (typeof reason !== 'string' || !COMPLETE_REASONS.has(reason.toLowerCase())));
    return {finish:cutoff ?? unverified ?? reasons.find(reason=>reason !== undefined && reason !== null) ?? null,usage:raw?.usage ?? null};
}
/** Send node-owned messages through the fixed profile, without activating it. */
export async function requestModel({binding,messages,maxTokens,signal},context) {
    if (signal?.aborted) return fail('ABORTED', 'The request was stopped.');
    if (!Number.isSafeInteger(maxTokens) || maxTokens <= 0 || maxTokens > 65536 || !Array.isArray(messages) || !messages.length || messages.length > 1000 || messages.some(message=>!message || !['system','user','assistant','tool'].includes(message.role) || typeof message.content !== 'string')) return fail('INVALID_REQUEST', 'Provide owned messages and a positive bounded completion limit.');
    if (typeof context.ConnectionManagerRequestService?.sendRequest !== 'function') return fail('SERVICE_UNAVAILABLE', 'SillyTavern Connection Manager is unavailable.');
    const remembered = resolved.get(binding);
    if (!remembered || safeSignature(binding) !== remembered.metadata) return fail('BINDING_CHANGED', 'Resolve the fixed connection again before requesting.');
    const check = () => {
        const current = resolveBinding(remembered.node,remembered.graph,context);
        return current.ok && resolved.get(current.data).signature === remembered.signature;
    };
    if (!check()) return fail('BINDING_CHANGED', 'The fixed connection changed after preflight. Run preflight again.');
    try {
        const tc = binding.api === 'textgenerationwebui';
        const payload = {model:binding.model,max_tokens:maxTokens,stream:false,...(tc ? {api_type:binding.source,api_server:binding.endpoint} : {chat_completion_source:binding.source,messages})};
        if (!tc && ENDPOINT_FIELDS[binding.source]) payload[ENDPOINT_FIELDS[binding.source]] = binding.endpoint;
        Object.assign(payload,binding.endpointDependencies ?? {});
        let overrides = payload;
        if (!tc) {
            overrides = await context.ChatCompletionService.presetToGeneratePayload(presetByName(context,'openai',binding.preset),{chat_completion_source:binding.source},payload);
            overrides.custom_include_body = '';
            overrides.custom_exclude_body = '';
        }
        if (signal?.aborted) return fail('ABORTED', 'The request was stopped before transmission.');
        if (!check()) return fail('BINDING_CHANGED', 'The fixed connection changed before transmission. Run preflight again.');
        const raw = await context.ConnectionManagerRequestService.sendRequest(binding.profileId,messages,maxTokens,{stream:false,extractData:false,includePreset:tc,includeInstruct:true,signal},overrides);
        const choice = raw?.choices?.[0];
        if (signal?.aborted) return fail('ABORTED', 'The request was stopped; ignore its late output.');
        const {finish,usage} = completionEvidence(raw,binding);
        const reason = typeof finish === 'string' ? finish.toLowerCase() : '';
        if (['length','max_tokens','max_output_tokens'].includes(reason)) return {ok:false,error:{code:'TRUNCATED_OUTPUT',message:'The request reached its completion limit.',finish,usage}};
        if (!COMPLETE_REASONS.has(reason)) return {ok:false,error:{code:'COMPLETION_UNVERIFIED',message:'The host response does not expose a verified complete text result; keep the original.',finish:typeof finish === 'string' ? finish : null,usage}};
        let text;
        try { text = context.extractMessageFromData?.(raw,binding.api); } catch { /* Provider fallback below. */ }
        const nativeText = Array.isArray(raw?.message?.content) ? raw.message.content.filter(part=>part.type === 'text' && typeof part.text === 'string').map(part=>part.text).join('') : undefined;
        text ||= choice?.message?.content ?? choice?.text ?? raw?.response ?? nativeText ?? raw?.results?.[0]?.text ?? raw?.content ?? raw?.text ?? (typeof raw === 'string' ? raw : '');
        if (typeof text !== 'string' || !text.trim()) return fail('EMPTY_OUTPUT', 'The auxiliary request returned no text.');
        return {ok:true,data:{text,usage,finish}};
    } catch {
        return fail(signal?.aborted ? 'ABORTED' : 'REQUEST_FAILED', 'The auxiliary request failed. Inspect the fixed connection; no retry was made.');
    }
}
export function resolveBinding(node, graph, context) {
    const role = graph.roles?.[node.modelRole];
    const profileId = node.profileId || role?.profileId;
    if (!profileId) return fail('BINDING_MISSING', 'Assign a fixed connection to this node or its model role.');
    if (typeof context.ConnectionManagerRequestService?.getProfile !== 'function') return fail('SERVICE_UNAVAILABLE', 'SillyTavern Connection Manager is unavailable.');
    let profile;
    try { profile = context.ConnectionManagerRequestService.getProfile(profileId); }
    catch { return fail('PROFILE_MISSING', 'The fixed connection profile is missing or unavailable.'); }
    if (!profile) return fail('PROFILE_MISSING', 'The fixed connection profile is missing.');
    const route = context.CONNECT_API_MAP?.[profile.api];
    if (!route || !['openai','textgenerationwebui'].includes(route.selected)) return fail('UNSUPPORTED_BINDING', 'Only mapped chat/text completion connections are supported.');
    if ((route.selected === 'openai' && LOSSY_CC_SOURCES.has(route.source)) || (route.selected === 'textgenerationwebui' && route.type === 'infermaticai')) return fail('UNSUPPORTED_BINDING', 'This installed host wrapper discards completion evidence. Use a connection that preserves its completion reason.');
    if (profile.proxy) return fail('UNSUPPORTED_BINDING', 'Named proxy routes cannot be verified through the public host context. Use a directly resolved connection.');
    const preset = presetByName(context,route.selected,profile.preset);
    if (!preset) return fail('PRESET_MISSING', 'The fixed profile sampler preset is missing.');
    const inheritedProxy = Object.hasOwn(preset,'reverse_proxy') ? preset.reverse_proxy : context.chatCompletionSettings?.reverse_proxy;
    if (route.selected === 'openai' && PROXY_SOURCES.has(route.source) && inheritedProxy) return fail('UNSUPPORTED_BINDING', 'This route inherits a reverse proxy that cannot be isolated through the public host services. Use a direct connection.');
    const tc = route.selected === 'textgenerationwebui';
    if (tc && profile.instruct && !presetByName(context,'instruct',profile.instruct)) return fail('INSTRUCT_MISSING', 'The fixed profile instruct preset is missing.');
    if (tc && context.textCompletionSettings?.type !== route.type) return fail('UNSUPPORTED_BINDING', 'The host cannot convert text completion samplers across providers without switching the live connection.');
    const model = node.model || (!node.profileId && role?.model) || profile.model || (tc ? (route.type === 'huggingface' ? 'tgi' : context.textCompletionSettings?.[TC_MODELS[route.type]]) : context.getChatCompletionModel?.({...context.chatCompletionSettings,...preset,chat_completion_source:route.source}));
    if (!model && !(tc && route.type === 'koboldcpp')) return fail('MODEL_MISSING', 'Select a model in the fixed profile or node.');
    const field = ENDPOINT_FIELDS[route.source];
    const extraFields = route.source === 'azure' ? ['azure_base_url','azure_deployment_name','azure_api_version'] : route.source === 'workers_ai' ? ['workers_ai_account_id'] : [];
    const extras = Object.fromEntries(extraFields.map(key=>[key,preset[key] || context.chatCompletionSettings?.[key]]));
    if (extraFields.some(key=>!extras[key])) return fail('ENDPOINT_MISSING', 'The provider requires endpoint/account configuration in its preset or host settings.');
    const endpoint = tc ? profile['api-url'] || context.getTextGenServer?.(route.type) : field ? profile['api-url'] || preset[field] || context.chatCompletionSettings?.[field] : extras.azure_base_url || extras.workers_ai_account_id || null;
    if ((tc || field) && !endpoint) return fail('ENDPOINT_MISSING', 'The fixed profile requires an available endpoint.');
    const data = {profileId,profileName:profile.name,model:model || null,source:tc ? route.type : route.source,api:route.selected,endpoint:endpoint || null,endpointOrigin:(tc || field) && profile['api-url'] ? 'profile' : (field && preset[field]) || (extraFields.length && preset[extraFields[0]]) ? 'preset' : endpoint ? 'host' : 'provider',preset:profile.preset || null,instruct:profile.instruct || null,...(extraFields.length ? {endpointDependencies:extras} : {})};
    resolved.set(data,{node:{profileId:node.profileId,model:node.model,modelRole:node.modelRole},graph:{roles:{[node.modelRole]:{profileId:role?.profileId,model:role?.model}}},metadata:safeSignature(data),signature:safeSignature([data,preset,tc ? presetByName(context,'instruct',profile.instruct) : null])});
    return {ok:true,data};
}
