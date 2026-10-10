import { cloneJsonValue } from './operations/json-data.js?v=0.27.0';
import { prepareFastDecisionRequest, validateFastDecisionResponse } from './decision.js?v=0.27.0';
const fail = (code,message) => ({ ok: false, error: { code,message } });
const captured = new WeakMap();
/** The trusted host increments this synchronous epoch for every config/secret mutation. */
function registryRevision(host) {
    if(typeof host?.getRegistryRevision!=='function')return fail('SERVICE_UNAVAILABLE','A synchronous coherent fast-registry revision is required.');
    let revision;try{revision=host.getRegistryRevision();}catch{return fail('SERVICE_UNAVAILABLE','The coherent fast-registry revision is unavailable.');}
    if(!(Number.isSafeInteger(revision)&&revision>=0||typeof revision==='string'&&revision.length>0&&revision.length<=256))return fail('SERVICE_UNAVAILABLE','Fast-registry revision must be a synchronous opaque token.');
    return {ok:true,data:{revision}};
}
function registryStatus(remembered) {
    const current=registryRevision(remembered.host);
    return current.ok&&current.data.revision===remembered.registryRevision?{ok:true}:fail('BINDING_CHANGED','The coherent connection or credential registry changed after capture.');
}
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const canonical = value => Array.isArray(value) ? '['+value.map(canonical).join(',')+']' : plain(value) ? '{'+Object.keys(value).sort().map(key => JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}' : JSON.stringify(value);
function inspectConfiguration(raw,id) {
    const checked = cloneJsonValue(raw); if (!checked.ok) return fail('INVALID_FAST_CONNECTION','Fast connections require trusted bounded own data.');
    const config = checked.data.value;
    if (!plain(config) || Object.keys(config).some(key => !['id','revision','provider','model','endpoint','credentialRef'].includes(key)) || config.id !== id || typeof id !== 'string' || !id.trim() || id.length > 128 || !(typeof config.revision === 'string' && config.revision.length > 0 && config.revision.length <= 128 || Number.isSafeInteger(config.revision) && config.revision > 0) || !['jev','laya','compatible'].includes(config.provider) || typeof config.model !== 'string' || !config.model.trim() || config.model.length > 256) return fail('INVALID_FAST_CONNECTION','Select a versioned typed connection with an explicit model.');
    if (Object.hasOwn(config,'credentialRef') && (typeof config.credentialRef !== 'string' || !config.credentialRef.trim() || config.credentialRef.length > 128 || /[\r\n]/.test(config.credentialRef))) return fail('INVALID_FAST_CONNECTION','Credentials use a trusted secret reference.');
    if (config.provider === 'jev' && !config.credentialRef) return fail('AUTH_MISSING','The hosted Jev connection requires an API-key reference.');
    const endpoint = config.endpoint ?? (config.provider === 'jev' ? 'https://api.typesafe.ai/v1/systemone' : null);
    if (typeof endpoint !== 'string' || endpoint.length > 2048) return fail('INVALID_FAST_ENDPOINT','Specify the complete typed /v1/systemone endpoint.');
    let url; try { url = new URL(endpoint); } catch { return fail('INVALID_FAST_ENDPOINT','The typed endpoint must be an absolute HTTP(S) URL.'); }
    const loopback = ['localhost','127.0.0.1','[::1]'].includes(url.hostname);
    if (url.username || url.password || url.search || url.hash || !(url.protocol === 'https:' || url.protocol === 'http:' && loopback) || !url.pathname.endsWith('/v1/systemone') || config.provider === 'jev' && url.href !== 'https://api.typesafe.ai/v1/systemone') return fail('INVALID_FAST_ENDPOINT','Use HTTPS or loopback HTTP without embedded credentials, query or fragment. Jev uses its fixed endpoint.');
    return { ok: true, data: { config,endpoint:url.href,signature:canonical(config) } };
}
async function configuration(id,host) {
    if(typeof id!=='string'||!id.trim()||id.length>128)return fail('INVALID_FAST_CONNECTION','Select a bounded stable connection ID.');
    if (typeof host?.getConnection !== 'function') return fail('SERVICE_UNAVAILABLE','The trusted fast-connection registry is unavailable.');
    try { return inspectConfiguration(await host.getConnection(id),id); } catch { return fail('CONNECTION_MISSING','The trusted fast connection is unavailable.'); }
}
async function credential(config,host) {
    if (!config.credentialRef) return { ok: true, data: { secret:null } };
    if (typeof host.resolveSecret !== 'function') return fail('AUTH_MISSING','The trusted credential resolver is unavailable.');
    let secret; try { secret = await host.resolveSecret(config.credentialRef); } catch { return fail('AUTH_MISSING','The configured credential is unavailable.'); }
    if (typeof secret !== 'string' || !secret.trim() || secret.length > 8192 || /[\r\n]/.test(secret)) return fail('AUTH_MISSING','The configured credential is unavailable or invalid.');
    return { ok: true,data: { secret } };
}
/** The returned DTO carries no endpoint or credential and cannot be reconstructed as authority. */
export async function captureFastBinding(id,host) {
    const epoch=registryRevision(host);if(!epoch.ok)return epoch;
    const resolved = await configuration(id,host); if (!resolved.ok) return resolved;
    const authentication = await credential(resolved.data.config,host); if (!authentication.ok) return authentication;
    const rechecked = await configuration(id,host); if (!rechecked.ok || rechecked.data.signature !== resolved.data.signature) return fail('BINDING_CHANGED','The fast connection changed while it was captured.');
    const currentEpoch=registryRevision(host);if(!currentEpoch.ok||currentEpoch.data.revision!==epoch.data.revision)return fail('BINDING_CHANGED','The coherent connection or credential registry changed during capture.');
    const binding = Object.freeze({ capability:'typed-decision',connectionId:id,provider:resolved.data.config.provider,model:resolved.data.config.model,revision:resolved.data.config.revision,fingerprint:globalThis.crypto.randomUUID() });
    captured.set(binding,{host,...resolved.data,secret:authentication.data.secret,registryRevision:epoch.data.revision});
    return { ok:true,data:binding };
}
export function fastBindingSummary(binding) {
    return captured.has(binding) ? Object.freeze({ capability:binding.capability,connectionId:binding.connectionId,provider:binding.provider,model:binding.model,revision:binding.revision,fingerprint:binding.fingerprint }) : undefined;
}
export async function fastBindingStatus(binding,host) {
    const remembered = captured.get(binding);
    if (!remembered || remembered.host !== host) return fail('BINDING_CHANGED','Capture the trusted fast connection before requesting.');
    const initialRegistry=registryStatus(remembered);if(!initialRegistry.ok)return initialRegistry;
    const current = await configuration(binding.connectionId,host); if (!current.ok || current.data.signature !== remembered.signature) return fail('BINDING_CHANGED','The fast connection changed after capture.');
    const authentication = await credential(current.data.config,host); if (!authentication.ok || authentication.data.secret !== remembered.secret) return fail('BINDING_CHANGED','The fast credential changed or became unavailable.');
    const final = await configuration(binding.connectionId,host);
    const finalRegistry=registryStatus(remembered);if(!finalRegistry.ok)return finalRegistry;
    return final.ok && final.data.signature === remembered.signature ? { ok:true } : fail('BINDING_CHANGED','The fast connection changed during authentication.');
}
async function boundedResponseText(response) {
    if (response.body && typeof response.body.getReader === 'function') {
        const reader=response.body.getReader(),chunks=[];let size=0;
        try {
            while (true) {
                const item=await reader.read();if(item.done)break;
                if (!(item.value instanceof Uint8Array)) throw new Error('Invalid response stream.');
                size+=item.value.byteLength;if(size>262144){await reader.cancel();return fail('FAST_RESPONSE_LIMIT','The typed response exceeds the bounded JSON limit.');}chunks.push(item.value);
            }
            const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
            return {ok:true,data:{text:new TextDecoder('utf-8',{fatal:true}).decode(bytes)}};
        } finally {reader.releaseLock();}
    }
    if (typeof response.text !== 'function') return fail('INVALID_FAST_RESPONSE','The provider response exposes no bounded JSON body.');
    const text=await response.text();
    return typeof text==='string'&&text.length<=262144&&new TextEncoder().encode(text).byteLength<=262144?{ok:true,data:{text}}:fail('FAST_RESPONSE_LIMIT','The typed response exceeds the bounded JSON limit.');
}
/** Inject fetch and secrets from trusted host configuration; portable nodes never supply either. */
export async function requestFastDecision(binding,value,host) {
    let signal,state,questions;
    try {
        if(!plain(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value)))return fail('INVALID_REQUEST','Typed request inputs require own data.');
        for(const key of Reflect.ownKeys(value)){const item=Object.getOwnPropertyDescriptor(value,key);if(!['state','questions','signal'].includes(key)||!item?.enumerable||!Object.hasOwn(item,'value'))return fail('INVALID_REQUEST','Typed request inputs require supported own data.');}
        signal=Object.getOwnPropertyDescriptor(value,'signal')?.value;state=Object.getOwnPropertyDescriptor(value,'state')?.value;questions=Object.getOwnPropertyDescriptor(value,'questions')?.value;
        if(signal!==undefined&&!(signal instanceof AbortSignal))return fail('INVALID_REQUEST','Cancellation must use the trusted AbortSignal.');
    }catch{return fail('INVALID_REQUEST','Typed request inputs require supported own data.');}
    if(signal?.aborted)return fail('ABORTED','The typed request was stopped.');
    const prepared=prepareFastDecisionRequest({state,questions});if(!prepared.ok)return prepared;
    if(typeof host?.fetch!=='function')return fail('SERVICE_UNAVAILABLE','The trusted typed HTTP transport is unavailable.');
    const authentication=await fastBindingStatus(binding,host);if(signal?.aborted)return fail('ABORTED','The typed request was stopped during authentication.');if(!authentication.ok)return authentication;
    if(signal?.aborted)return fail('ABORTED','The typed request was stopped before transmission.');
    const remembered=captured.get(binding);
    try {
        const beforeSend=registryStatus(remembered);if(!beforeSend.ok)return beforeSend;
        const response=await host.fetch(remembered.endpoint,{method:'POST',headers:{'Content-Type':'application/json',...(remembered.secret===null?{}:{Authorization:'Bearer '+remembered.secret})},body:JSON.stringify({model:remembered.config.model,...prepared.data}),redirect:'error',credentials:'omit',cache:'no-store',...(signal?{signal}:{})});
        if(signal?.aborted)return fail('ABORTED','Ignore the stopped typed response.');
        const fresh=await fastBindingStatus(binding,host);if(signal?.aborted)return fail('ABORTED','Ignore the response stopped during freshness validation.');if(!fresh.ok)return fresh;
        if(response?.ok!==true||!Number.isInteger(response.status)||response.status<200||response.status>=300){const status=response?.status;return fail(status===401||status===403?'AUTH_FAILED':status===429?'RATE_LIMITED':status===529||status===503?'PROVIDER_OVERLOADED':status===422||status===400?'INVALID_FAST_REQUEST':'HTTP_ERROR','The typed provider rejected the request; no answer was inferred.');}
        const body=await boundedResponseText(response);if(!body.ok)return body;
        if(signal?.aborted)return fail('ABORTED','Ignore the stopped typed response.');
        const afterRead=await fastBindingStatus(binding,host);if(signal?.aborted)return fail('ABORTED','Ignore the response stopped during final freshness validation.');if(!afterRead.ok)return afterRead;
        const beforePublication=registryStatus(remembered);if(!beforePublication.ok)return beforePublication;
        let raw;try{raw=JSON.parse(body.data.text);}catch{return fail('INVALID_FAST_RESPONSE','The typed provider returned malformed JSON.');}
        const checked=validateFastDecisionResponse(raw,prepared.data.questions);if(!checked.ok)return checked;
        const {diagnostics:providedDiagnostics,...core}=checked.data;
        if(remembered.secret!==null&&containsSecret(core,remembered.secret))return fail('INVALID_FAST_RESPONSE','The provider echoed credential data in its answer; no answer was published.');
        const diagnostics=remembered.secret===null?providedDiagnostics:redactSecret(providedDiagnostics,remembered.secret);
        // Keep the documented raw shape for the engine validator and expose only safe provenance.
        const typedResponse={...core,...(diagnostics?.routing===undefined?{}:{routing:diagnostics.routing}),...(diagnostics?.action===undefined?{}:{action:diagnostics.action})};
        return {ok:true,data:{response:typedResponse,usage:checked.data.usage,provenance:{...fastBindingSummary(binding),returnedModel:checked.data.model}}};
    }catch{return fail(signal?.aborted?'ABORTED':'REQUEST_FAILED','The typed HTTP request failed; no retry was made.');}
}

function containsSecret(value,secret) {
    if(typeof value==='string')return value.includes(secret);
    return value!==null&&typeof value==='object'&&Object.entries(value).some(([key,item])=>key.includes(secret)||containsSecret(item,secret));
}
function redactSecret(value,secret) {
    if(typeof value==='string')return value.replaceAll(secret,'[redacted]');
    if(value===null||typeof value!=='object')return value;
    if(Array.isArray(value))return value.map(item=>redactSecret(item,secret));
    return Object.fromEntries(Object.entries(value).map(([key,item])=>[key.replaceAll(secret,'[redacted]'),redactSecret(item,secret)]));
}