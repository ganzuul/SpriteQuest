import { realpath } from 'node:fs/promises';
import { resolve, relative, isAbsolute, sep } from 'node:path';

const integer = (n,min,max) => Number.isSafeInteger(n) && n >= min && n <= max;
const safeUsage = usage => {
    if (!usage || typeof usage !== 'object') return null;
    const numeric=['prompt_tokens','completion_tokens','total_tokens','input_tokens','output_tokens','reasoning_tokens','cache_read_input_tokens','cache_creation_input_tokens','cost'];
    const safe=Object.fromEntries(numeric.filter(key=>Number.isFinite(usage[key]) && usage[key]>=0).map(key=>[key,usage[key]]));
    if (typeof usage.currency==='string' && /^[A-Z]{3}$/.test(usage.currency)) safe.currency=usage.currency;
    return Object.keys(safe).length ? safe : null;
};
const safeFinish = value => typeof value==='string' && ['stop','eos_token','eos','stop_sequence','end_turn','complete','completed','length','max_tokens','max_output_tokens'].includes(value.toLowerCase()) ? value : null;
const safeCode = value => typeof value==='string' && /^[A-Z_]{1,60}$/.test(value) ? value : null;
/** One session's paid boundary. Reservations count failures and are never retried. */
export function createProviderTestGuard({live=false,host='http://127.0.0.1:8000',priorAttempts=0,maxAttempts=3,approvedModels=[]} = {}) {
    let url;
    try { url = new URL(host); } catch { throw Error('Use a plain HTTP loopback host.'); }
    if (url.protocol !== 'http:' || !['127.0.0.1','[::1]'].includes(url.hostname) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw Error('Use a plain HTTP loopback host without credentials or a path.');
    if (!integer(priorAttempts,0,Number.MAX_SAFE_INTEGER)) throw Error('The prior attempt count must be a nonnegative safe integer.');
    if (!integer(maxAttempts,1,5) || !Number.isSafeInteger(priorAttempts+maxAttempts)) throw Error('The per-run attempt bound must be an integer from 1 through 5.');
    const models=new Set(Array.isArray(approvedModels) ? approvedModels.filter(model=>typeof model==='string' && /^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,127}$/.test(model)) : []);
    let attempted=0, active=null, stopped=false; const ledger=[];
    return {
        attempts:()=>attempted,
        ledger:()=>structuredClone(ledger),
        stop:()=>{stopped=true;},
        /** Abort all host generation traffic unless exactly owned by the current reservation. */
        authorize(payload) {
            if (stopped || !active || active.used || payload?.chat_completion_source !== 'nanogpt' || payload.model !== active.model || payload.max_tokens !== active.maxTokens || payload.stream === true || JSON.stringify(payload.messages) !== active.messages) return false;
            active.used=true; active.record.backendAccepted=true; return true;
        },
        async request(input,transport) {
            if (live !== true) throw Error('Live execution requires explicit --live opt-in.');
            if (stopped) throw Error('The live session is stopped; no retries are allowed.');
            if (!models.has(input?.binding?.model)) throw Error('Unapproved live model.');
            if (!integer(input?.maxTokens,1,4096)) throw Error('Completion cap must be an integer from 1 through 4096.');
            if (!Array.isArray(input?.messages) || !input.messages.length || input.messages.some(m=>!m || !['system','user','assistant','tool'].includes(m.role) || typeof m.content !== 'string')) throw Error('Only owned synthetic messages may be sent.');
            if (active || attempted >= maxAttempts) throw Error('Live attempt limit reached or a reservation is already active.');
            attempted++;
            const record={attempt:attempted,model:input.binding.model,maxTokens:input.maxTokens,outcome:'reserved',backendAccepted:false,usageStatus:'unknown',usage:null,finish:null,elapsedMs:null,output:null};
            ledger.push(record);
            active={model:input.binding.model,maxTokens:input.maxTokens,messages:JSON.stringify(input.messages),used:false,record};
            const started=Date.now();
            try {
                const result=await transport();
                record.outcome=result?.ok ? 'complete' : 'failed';
                record.usage=safeUsage(result?.data?.usage ?? result?.error?.usage);
                record.usageStatus=record.usage ? 'reported' : 'unknown';
                record.finish=safeFinish(result?.data?.finish ?? result?.error?.finish);
                record.elapsedMs=Date.now()-started;
                record.output=typeof result?.data?.text==='string' ? result.data.text.slice(0,100000) : null;
                if (!result?.ok) stopped=true;
                return result;
            } catch (error) { stopped=true; record.outcome='failed'; record.elapsedMs=Date.now()-started; throw error; }
            finally { active=null; }
        },
    };
}

/** Serve only the narrowly required production dependency graph, never host files or secrets. */
export async function productionModulePath(repoRoot,url) {
    const allowed = new Set(['runtime','contracts','catalog','compactor','repair','connections','starters']);
    const match = /^\/__lattice-provider-test\/src\/workflow\/([a-z-]+)\.js$/.exec(new URL(url).pathname);
    if (!match || !allowed.has(match[1])) throw Error('Unapproved production module path.');
    const root=await realpath(repoRoot), target=await realpath(resolve(root,'src','workflow',`${match[1]}.js`));
    const rel=relative(root,target);
    if (rel.startsWith(`..${sep}`) || rel==='..' || isAbsolute(rel)) throw Error('Production module escaped the verified repository.');
    return target;
}

export function createReservationBridge(guard) {
    let session=null;
    return {
        async reserve(input) {
            let release,ready,refused;
            const pending=new Promise(resolve=>{release=resolve;});
            const readiness=new Promise((resolve,reject)=>{ready=resolve;refused=reject;});
            const completed=guard.request(input,()=>{ready();return pending;});
            completed.catch(refused);
            await readiness;
            session={release,completed};
            return true;
        },
        async finish(result) {
            if (!session) throw Error('No live reservation is active.');
            const current=session;session=null;
            current.release(result);await current.completed;
        },
    };
}
export function createRequestBoundary(guard,host) {
    const origin=new URL(host).origin;
    let accepted=0,blocked=0;
    const reads=new Set(['GET /api/extensions/discover','GET /api/users/me','POST /api/settings/get','POST /api/ping','POST /api/secrets/read','POST /api/secrets/settings']);
    const tokenizers=/^\/api\/tokenizers\/(gpt2|openai|llama|nerdstash|nerdstash_v2|mistral|yi|claude|llama3|gemma|jamba|qwen2|command-r|command-a|nemo|deepseek)\/(encode|decode)$/;
    return {
        counts:()=>({backendAccepted:accepted,backendBlocked:blocked}),
        allow({url,method,payload}) {
            let target;
            try {target=new URL(url);} catch {blocked++;return false;}
            let allowed=false;
            if (target.origin===origin && !target.username && !target.password) {
                const path=target.pathname;
                const modelQuery=[...target.searchParams];
                const localOpenAIQuery=method==='POST' && /^\/api\/tokenizers\/openai\/(count|encode|decode)$/.test(path) && modelQuery.length===1 && modelQuery[0][0]==='model' && /^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,127}$/.test(modelQuery[0][1]);
                if (path==='/api/backends/chat-completions/generate') {
                    allowed=method==='POST' && !target.search && guard.authorize(payload);
                    if (allowed) accepted++;
                } else if (localOpenAIQuery || !target.search && (reads.has(`${method} ${path}`) || method==='POST' && tokenizers.test(path))) allowed=true;
                else if (method==='GET' && !path.startsWith('/api/') && !path.startsWith('/proxy/') && !/^\/(characters|chats|worlds)\//.test(path)) {
                    allowed=['/','/version','/csrf-token'].includes(path) || /\.(js|mjs|css|html|json|png|jpg|jpeg|svg|ico|gif|webp|woff2?|ttf|wasm)$/i.test(path);
                }
            }
            if (!allowed) blocked++;
            return allowed;
        },
    };
}

/** Node owns attempt accounting even if the browser never returns a result. */
export async function runProviderTestSession(input={}, {execute,cleanup}={}) {
    const options={host:'http://127.0.0.1:8000',priorAttempts:0,maxAttempts:3,approvedModels:[],fixtureLabels:[],...input};
    let guard,boundary,currentStage='configuration',failureStage=null,cleanupFailed=false,version=null;
    const fixtures=[];
    const stages=new Set(['manifest','browser','context','boundary','bindings','login','navigation','readiness','evaluate']);
    try {
        guard=createProviderTestGuard(options);boundary=createRequestBoundary(guard,options.host);
        if (options.live===true) await execute({guard,boundary,
            stage:value=>{currentStage=stages.has(value) ? value : 'execute';},
            fail:value=>{failureStage ??= stages.has(value) ? value : 'execute';guard.stop();},
            setVersion:value=>{version=typeof value==='string' && /^\d+\.\d+\.\d+$/.test(value) ? value : null;},
            recordFixture:value=>{fixtures.push(sanitizeFixture(value,options.fixtureLabels,options.approvedModels));},
        });
    } catch {failureStage=currentStage;}
    finally {
        guard?.stop();
        try {await cleanup?.();} catch {cleanupFailed=true;failureStage ??= 'cleanup';}
    }
    const ledger=guard?.ledger() ?? [],counts=boundary?.counts() ?? {backendAccepted:0,backendBlocked:0};
    const prior=integer(options.priorAttempts,0,Number.MAX_SAFE_INTEGER) ? options.priorAttempts : null;
    const attempts=guard?.attempts() ?? 0;
    const status=failureStage ? 'failed' : options.live!==true ? 'disabled' : fixtures.length>0 && fixtures.every(fixture=>fixture.ok) ? 'passed' : 'failed';
    return {status,evidenceType:'caller-supplied provider test with an exact owned request boundary',manifestVersion:version,failureStage,cleanupFailed,
        priorAttempts:prior,attempts,totalAttempts:prior===null ? null : prior+attempts,...counts,
        attemptLedger:ledger,unknownUsageAttempts:ledger.filter(item=>item.usageStatus==='unknown').length,
        ownedMessageOnly:counts.backendAccepted===ledger.filter(item=>item.backendAccepted).length,
        allReservationsReachedBackend:counts.backendAccepted===attempts,
        providerCost:{reported:ledger.some(item=>Number.isFinite(item.usage?.cost)),note:'Provider metadata only; not a verified billing total'},
        completedFixtures:fixtures.length,fixtures,
        ledgerAction:'Advance the external attempt ledger from totalAttempts before any separately authorized rerun. No retry was made.',
    };
}
function sanitizeFixture(value,labels,models) {
    if (!Array.isArray(labels) || !labels.includes(value?.label)) throw Error('Unknown fixture progress.');
    const recording=value.recording,terminal=recording?.terminal;
    return {label:value.label,ok:value.ok===true,error:safeCode(value.error),
        callBound:integer(value.callBound,0,5)?value.callBound:null,actualCalls:integer(value.actualCalls,0,5)?value.actualCalls:null,
        recording:{status:['completed','failed','cancelled','invalid','stale'].includes(recording?.status)?recording.status:null,
            rows:(recording?.rows??[]).slice(0,64).map(row=>({status:['waiting','not-run','running','completed','failed','blocked','cancelled'].includes(row.status)?row.status:null,
                attempts:integer(row.attempts,0,5)?row.attempts:null,binding:row.binding?{model:models.includes(row.binding.model)?row.binding.model:null}:null,
                request:row.request?{maxTokens:integer(row.request.maxTokens,1,4096)?row.request.maxTokens:null,finish:safeFinish(row.request.finish),usage:safeUsage(row.request.usage)}:null})),
            terminal:terminal?{kind:['context','guidance','candidate','draft'].includes(terminal.kind)?terminal.kind:null,
                format:['structured','json-prefix-text','omitted'].includes(terminal.format)?terminal.format:null,text:typeof terminal.text==='string'?terminal.text.slice(0,100000):null}:null},
        review:{required:value.review?.required===true,handle:null}};
}
