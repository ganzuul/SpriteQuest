import { cloneJsonValue } from './json-data.js?v=0.26.0';
import { validateDecisionQuestions, runDecision, runFastDecision } from '../decision.js?v=0.26.0';
const fail=(code,message)=>({ok:false,error:{code,message}});
const plain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&[Object.prototype,null].includes(Object.getPrototypeOf(value));
const own=(value,key,fallback)=>{const property=Object.getOwnPropertyDescriptor(value,key);if(!property)return fallback;if(!property.enumerable||!Object.hasOwn(property,'value'))throw new Error('Own data required.');return property.value;};
const questionDefaults={decision:{type:'noul',instructions:'Does the supplied scene establish the described event?'}};
const controls={
    inputKind:{type:'enum',label:'State input',values:['data','text'],default:'data'},
    questions:{type:'object',label:'Questions',editor:'json',default:questionDefaults,help:'Use stable IDs and typed noul, choice or ordered score questions. Fast probabilities require a separately configured acceptance gate.'},
    maxTokens:{type:'integer',label:'Decision token limit',default:2048,min:1,max:65536},
};
const register=(id,title,extra={})=>({id,title,family:'Derive',phase:'both',operationVersion:1,minimumSchema:3,minimumRuntime:2,input:'data',output:'data',controls:Object.keys({...controls,...extra}),controlDescriptors:{...controls,...extra},defaults:Object.fromEntries(Object.entries({...controls,...extra}).map(([key,item])=>[key,item.default])),requestBound:1,modelRole:id==='decision'?'decision':'fastDecision',requestCapability:id==='decision'?'text-completion':'typed-decision',terminal:false,dynamicPorts:true});
export const DECISION_OPERATIONS={
    decision:register('decision','Decision'),
    'fast-decision':register('fast-decision','Fast Decision',{
        fastConnectionId:{type:'string',label:'Fast connection',default:'',maxLength:128,help:'Choose a configured Jev, Laya or compatible typed endpoint. Endpoints and credentials remain in host settings.'},
        fallbackEnabled:{type:'boolean',label:'Allow Decision fallback',default:false},
        fallbackAllowedCodes:{type:'array',label:'Fallback on errors',items:'string',max:8,default:[],visibleWhen:{key:'fallbackEnabled',value:true},help:'An explicit allow list; cancellation and changed bindings never trigger fallback.'},
        fallbackProfileId:{type:'string',label:'Fallback text connection',default:'',maxLength:128,visibleWhen:{key:'fallbackEnabled',value:true}},
    }),
};
function resolve(node,options){
    try{
        if(!plain(node)||!plain(options))return fail('INVALID_SETTINGS','Decision node and options require plain own data.');
        const id=own(node,'operation'),base=DECISION_OPERATIONS[id];if(!Object.hasOwn(DECISION_OPERATIONS,id)||!base)return fail('UNKNOWN_OPERATION','Unknown Decision operation.');
        if(own(node,'operationVersion',1)!==1)return fail('INVALID_SETTINGS','Decision operation version must be 1.');
        const phase=own(options,'phase',own(node,'phase'));
        if(!['pre','post'].includes(phase)||own(node,'phase')!==undefined&&own(node,'phase')!==phase)return fail('INVALID_PHASE','Provide a matching effective Decision phase.');
        const settings={};for(const key of base.controls){const checked=cloneJsonValue(own(node,key,base.defaults[key]));if(!checked.ok)return fail('INVALID_SETTINGS','Decision controls require bounded JSON.');settings[key]=checked.data.value;}
        const questions=validateDecisionQuestions(settings.questions);if(!questions.ok)return questions;
        if(!['data','text'].includes(settings.inputKind)||!Number.isSafeInteger(settings.maxTokens)||settings.maxTokens<1||settings.maxTokens>65536)return fail('INVALID_SETTINGS','Select a supported input and bounded text completion limit.');
        if(id==='fast-decision'){
            if(typeof settings.fastConnectionId!=='string'||settings.fastConnectionId.length>128||typeof settings.fallbackProfileId!=='string'||settings.fallbackProfileId.length>128||typeof settings.fallbackEnabled!=='boolean'||!Array.isArray(settings.fallbackAllowedCodes)||settings.fallbackAllowedCodes.length>8||new Set(settings.fallbackAllowedCodes).size!==settings.fallbackAllowedCodes.length||settings.fallbackAllowedCodes.some(code=>!['REQUEST_FAILED','SERVICE_UNAVAILABLE','RATE_LIMITED','PROVIDER_OVERLOADED','AUTH_MISSING','HTTP_ERROR','INVALID_FAST_RESPONSE'].includes(code))||settings.fallbackEnabled&&(!settings.fallbackProfileId.trim()||!settings.fallbackAllowedCodes.length))return fail('INVALID_SETTINGS','Fallback requires a separately selected text connection and explicit supported error codes.');
        }
        const descriptor={...base,phase,input:settings.inputKind,requestBound:id==='fast-decision'&&settings.fallbackEnabled?2:1,...(id==='fast-decision'&&settings.fallbackEnabled?{fallbackModelRole:'decision'}:{})};
        const ports=[{id:'in',label:'State',kind:settings.inputKind,direction:'input',required:true,cardinality:'one'},{id:'out',label:'Decision',kind:'data',direction:'output',required:false,cardinality:'one'}];
        return {ok:true,data:{descriptor,ports,settings}};
    }catch{return fail('INVALID_SETTINGS','Decision controls require supported own data.');}
}
export function describeDecision(node,options={}){
    const checked=resolve(node,options);if(!checked.ok)return checked;const {descriptor,ports}=checked.data;return {ok:true,data:{descriptor,ports}};
}
export async function executeDecision(node,inputs,local={}){
    try{
        const checked=resolve(node,{phase:local.phase??own(node,'phase')});if(!checked.ok)return checked;
        const {settings}=checked.data;
        if(!plain(inputs))return fail('INVALID_INPUT','Decision requires a named State artifact.');
        const input=own(inputs,'in');if(!plain(input)||own(input,'kind')!==settings.inputKind)return fail('INVALID_INPUT','The State artifact must match the selected input kind.');
        const state=cloneJsonValue(own(input,settings.inputKind==='text'?'text':'value'));if(!state.ok)return fail('INVALID_INPUT','State must be bounded own JSON or text.');
        if(node.operation==='fast-decision'&&!settings.fastConnectionId.trim())return fail('BINDING_MISSING','Select a configured typed Fast Decision connection.');
        const request={state:state.data.value,questions:settings.questions,maxTokens:settings.maxTokens,...(node.operation==='fast-decision'?{fallback:{enabled:settings.fallbackEnabled,allowedCodes:settings.fallbackAllowedCodes}}:{})};
        const initialCount=typeof local.getRequestCount==='function'?local.getRequestCount():undefined;
        if(initialCount!==undefined&&(!Number.isSafeInteger(initialCount)||initialCount<0))return fail('INVALID_PORTS','The request counter must be a nonnegative safe integer.');
        const result=await (node.operation==='decision'?runDecision(request,local):runFastDecision(request,local));
        if(!result.ok)return result;
        if(initialCount!==undefined){const count=local.getRequestCount()-initialCount;if(!Number.isSafeInteger(count)||count<0||count>checked.data.descriptor.requestBound)return fail('INVALID_PORTS','The request counter exceeds this node budget.');result.data.actualCalls=count;}
        const output=cloneJsonValue(result.data);if(!output.ok)return fail('DECISION_OUTPUT_LIMIT','The decision record exceeds portable JSON limits.');
        return {ok:true,artifact:{kind:'data',value:output.data.value},reports:[{operation:node.operation,actualCalls:result.data.actualCalls,source:result.data.source,...(result.data.fallback?{fallback:result.data.fallback}:{})}]};
    }catch{return fail('INVALID_INPUT','Decision state requires bounded own data.');}
}
