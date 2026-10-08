import { readFile, realpath } from 'node:fs/promises';
import { dirname, resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const APPROVED_MODELS = Object.freeze(['z-ai/glm-5.2','z-ai/glm-5.2:thinking']);
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
export function createLiveGuard({live=false,host='http://127.0.0.1:8000',priorAttempts=3,maxAttempts=3} = {}) {
    let url;
    try { url = new URL(host); } catch { throw Error('Use a plain HTTP loopback host.'); }
    if (url.protocol !== 'http:' || !['127.0.0.1','[::1]'].includes(url.hostname) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw Error('Use a plain HTTP loopback host without credentials or a path.');
    if (!integer(priorAttempts,3,8)) throw Error('The prior attempt count must include the three earlier attempts.');
    if (!integer(maxAttempts,1,5) || priorAttempts + maxAttempts > 8) throw Error('The attempt bound exceeds the remaining global allowance.');
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
            if (!APPROVED_MODELS.includes(input?.binding?.model)) throw Error('Unapproved live model.');
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
    const match = /^\/__lattice-live-test\/src\/workflow\/([a-z-]+)\.js$/.exec(new URL(url).pathname);
    if (!match || !allowed.has(match[1])) throw Error('Unapproved production module path.');
    const root=await realpath(repoRoot), target=await realpath(resolve(root,'src','workflow',`${match[1]}.js`));
    const rel=relative(root,target);
    if (rel.startsWith(`..${sep}`) || rel==='..' || isAbsolute(rel)) throw Error('Production module escaped the verified repository.');
    return target;
}

function parseArgs(args) {
    const options={live:false,host:'http://127.0.0.1:8000',priorAttempts:3,maxAttempts:3,profileId:'ea3e4acd-9d20-4f7e-8082-650041e8cccc'};
    for (let i=0;i<args.length;i++) {
        if (args[i]==='--live') options.live=true;
        else if (['--host','--prior-attempts','--max-attempts','--profile-id'].includes(args[i])) {
            const key={'--host':'host','--prior-attempts':'priorAttempts','--max-attempts':'maxAttempts','--profile-id':'profileId'}[args[i]];
            if (!args[i+1] || args[i+1].startsWith('--')) throw Error('Missing argument value.');
            options[key]=key.endsWith('Attempts') ? Number(args[++i]) : args[++i];
        } else throw Error('Unknown argument. Use --live only after explicit live-readiness approval.');
    }
    return options;
}

export async function runLiveFixtures(options) {
    let browser,context;
    return runLiveSession(options,{
        execute:async({guard,boundary,stage,recordFixture,setVersion,fail})=>{
            const repoRoot=dirname(dirname(fileURLToPath(import.meta.url)));
            stage('manifest');
            const {version}=JSON.parse(await readFile(resolve(repoRoot,'manifest.json'),'utf8'));setVersion(version);
            const {chromium}=await import('@playwright/test');
            stage('browser');browser=await chromium.launch({headless:true});
            stage('context');context=await browser.newContext({serviceWorkers:'block'});
            const page=await context.newPage();
            // All HTTP traffic crosses this boundary before the first navigation.
            stage('boundary');
            await context.route('**/*',async route=>{
                try {
                const request=route.request(),url=request.url(),method=request.method();
                let payload;
                if (method==='POST' && url===new URL('/api/backends/chat-completions/generate',options.host).href) {
                    try {payload=request.postDataJSON();} catch { /* Never print the body. */ }
                }
                if (!boundary.allow({url,method,payload})) {await route.abort();return;}
                if (new URL(url).pathname.startsWith('/__lattice-live-test/')) {
                    try {
                        const path=await productionModulePath(repoRoot,url);
                        await route.fulfill({contentType:'text/javascript',body:await readFile(path,'utf8')});
                    } catch {await route.abort();}
                } else await route.continue();
                } catch {fail('boundary');try {await route.abort();} catch { /* Context may already be closed. */ }}
            });
            await context.routeWebSocket('**/*',async socket=>{try {boundary.allow({url:socket.url(),method:'WEBSOCKET'});await socket.close();} catch {fail('boundary');}});
            const bridge=createLiveReservationBridge(guard);
            stage('bindings');
            await page.exposeBinding('__comfyReserve',(_source,input)=>bridge.reserve(input));
            await page.exposeBinding('__comfyFinish',(_source,result)=>bridge.finish(result));
            await page.exposeBinding('__comfyFixture',(_source,fixture)=>recordFixture(fixture));
            stage('login');
            const csrfResponse=await context.request.get(new URL('/csrf-token',options.host).href);
            if (!csrfResponse.ok()) throw Error('Local CSRF service unavailable.');
            const csrf=await csrfResponse.json();
            const login=await context.request.post(new URL('/api/users/login',options.host).href,{headers:{'x-csrf-token':csrf.token},data:{handle:'default-user',password:''}});
            if (!login.ok()) throw Error('Local default-user login unavailable.');
            stage('navigation');await page.goto(options.host,{waitUntil:'domcontentloaded'});
            stage('readiness');
            await page.waitForFunction(()=>typeof window.SillyTavern?.getContext==='function',{}, {timeout:60000});
            await page.waitForFunction(id=>window.SillyTavern.getContext().extensionSettings?.connectionManager?.profiles?.some(profile=>profile.id===id),options.profileId,{timeout:60000});
            stage('evaluate');
            await page.evaluate(runSyntheticFixtures,{version,profileId:options.profileId});
        },
        cleanup:async()=>{
            let failed=false;
            // Each resource gets its own cleanup attempt; no exception discards the ledger.
            for (const resource of [context,browser]) {
                try {await resource?.close();} catch {failed=true;}
            }
            if (failed) throw Error('Cleanup unavailable.');
        },
    });
}
export function createLiveReservationBridge(guard) {
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
export async function runSyntheticFixtures({version,profileId},dependencies) {
            const prefix='/__lattice-live-test/src/workflow/';
            const runtime=dependencies?.runtime ?? await import(`${prefix}runtime.js?v=${version}`);
            const connections=dependencies?.connections ?? await import(`${prefix}connections.js?v=${version}`);
            const {starterGraph}=dependencies?.starters ?? await import(`${prefix}starters.js?v=${version}`);
            const host=dependencies?.host ?? window.SillyTavern.getContext();
            const reserve=dependencies?.reserve ?? (input=>window.__comfyReserve(input));
            const finish=dependencies?.finish ?? (result=>window.__comfyFinish(result));
            const progress=dependencies ? dependencies.progress ?? (()=>{}) : fixture=>window.__comfyFixture(fixture);
            const safeUsage=usage=>{
                if (!usage || typeof usage!=='object') return null;
                const numeric=['prompt_tokens','completion_tokens','total_tokens','input_tokens','output_tokens','reasoning_tokens','cache_read_input_tokens','cache_creation_input_tokens','cost'];
                return {...Object.fromEntries(numeric.filter(key=>Number.isFinite(usage[key]) && usage[key]>=0).map(key=>[key,usage[key]])),...(typeof usage.currency==='string' && /^[A-Z]{3}$/.test(usage.currency) ? {currency:usage.currency} : {})};
            };
            const countTokens=async text=>{
                if (typeof host.getTokenCountAsync==='function') {
                    const tokens=await host.getTokenCountAsync(text);
                    if (Number.isFinite(tokens) && tokens>=0) return {tokens,method:'host-tokenizer'};
                }
                return {tokens:Math.ceil(text.length/4),method:'character-estimate'};
            };
            const pre=starterGraph('native-guidance');
            pre.roles.Analysis={profileId,model:'z-ai/glm-5.2:thinking'};
            Object.assign(pre.nodes['smart-compactor'],{model:'z-ai/glm-5.2',targetTokens:700,keepRecent:1,pins:['LANTERN-KEEP-26'],maxTokens:1024,purpose:'Summarize the repeated setup in at most 80 words.'});
            Object.assign(pre.nodes['response-plan'],{maxTokens:4096,instructions:'In at most 120 words suggest two optional next beats; preserve the user decision and LANTERN-KEEP-26. No new established events.'});
            const contextArtifact={kind:'context',messages:[
                {id:'history',role:'user',text:'A fictional traveler waits at a blue lantern beside a closed gate. The traveler has not decided whether to enter. '.repeat(40),source:'synthetic'},
                {id:'recent',role:'user',text:'LANTERN-KEEP-26: The gate remains closed; the traveler chooses what happens next.',source:'synthetic'},
            ]};
            const post=starterGraph('reviewed-de-slop');post.roles.Prose={profileId,model:'z-ai/glm-5.2'};
            const text='The lantern was a testament to the keeper\'s patience. The gate stayed shut.';
            const draft={kind:'draft',text,source:{chatId:'synthetic-fixture',messageIndex:0,swipeId:0,originalText:text,token:'synthetic-26'},context:{kind:'context',messages:[{id:'scene',role:'user',text:'The fictional gate remains closed.',source:'synthetic'}]}};
            const signal=AbortSignal.timeout(180000);
            const ports=snapshot=>({signal,snapshot:async()=>structuredClone(snapshot),countTokens,resolveBinding:(node,graph)=>connections.resolveBinding(node,graph,host),request:async input=>{
                await reserve({binding:{model:input.binding.model},messages:input.messages,maxTokens:input.maxTokens});
                let result;
                try {result=await connections.requestModel(input,host);} catch {result={ok:false,error:{code:'REQUEST_FAILED',message:'Production adapter failed.'}};}
                await finish(result);return result;
            }});
            const summarize=(label,result)=>({label,ok:result.ok,error:result.error?.code ?? null,callBound:result.callBound,actualCalls:result.actualCalls,reports:result.reports,calls:result.calls.map(call=>({nodeId:call.nodeId,model:call.binding.model,maxTokens:call.maxTokens,elapsedMs:call.elapsedMs,tokenCount:call.tokenCount,finish:call.result?.finish ?? call.error?.finish ?? null,usage:safeUsage(call.result?.usage ?? call.error?.usage),error:call.error?.code ?? null,output:call.result?.text ?? null})),constraints:label.startsWith('plain compactor') ? {
                pinPreserved:result.artifact?.context?.messages?.some(message=>message.id==='recent' && message.text===contextArtifact.messages[1].text) ?? false,
                compactionWithinBudget:result.reports.some(report=>report.code==='COMPACTION' && report.tokens<=700),
                guidanceWithinBudget:result.reports.some(report=>report.code==='GUIDANCE_BUDGET' && report.tokens<=report.budget),
                guidancePublished:false,
            } : {
                originalPreserved:result.artifact?.original===text,
                unselectedTextPreserved:result.artifact?.text?.startsWith(text.slice(0,text.indexOf('a testament to')))===true && result.artifact?.text?.endsWith(text.slice(text.indexOf('a testament to')+'a testament to'.length))===true,
                reviewRequired:result.artifact?.reviewRequired===true,
                applyInvoked:false,
            },artifact:result.artifact ? {kind:result.artifact.kind,text:result.artifact.text ?? null,messages:result.artifact.kind==='context' ? result.artifact.messages : undefined,changes:result.artifact.changes} : null});
            const first=await runtime.runWorkflow(pre,ports(contextArtifact));
            const results=[summarize('plain compactor + thinking planner',first)];
            await progress(results[0]);
            if (first.ok) {
                results.push(summarize('plain repair; candidate only, no Apply',await runtime.runWorkflow(post,ports(draft))));
                await progress(results[1]);
            }
            return results;

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
export async function runLiveSession(input={}, {execute,cleanup}={}) {
    const options={host:'http://127.0.0.1:8000',priorAttempts:3,maxAttempts:3,...input};
    let guard,boundary,currentStage='configuration',failureStage=null,cleanupFailed=false,version=null;
    const fixtures=[];
    const stages=new Set(['manifest','browser','context','boundary','bindings','login','navigation','readiness','evaluate']);
    try {
        guard=createLiveGuard(options);boundary=createRequestBoundary(guard,options.host);
        if (options.live===true) await execute({guard,boundary,
            stage:value=>{currentStage=stages.has(value) ? value : 'execute';},
            fail:value=>{failureStage ??= stages.has(value) ? value : 'execute';guard.stop();},
            setVersion:value=>{version=typeof value==='string' && /^\d+\.\d+\.\d+$/.test(value) ? value : null;},
            recordFixture:value=>{fixtures.push(sanitizeFixture(value));},
        });
    } catch {failureStage=currentStage;}
    finally {
        guard?.stop();
        try {await cleanup?.();} catch {cleanupFailed=true;failureStage ??= 'cleanup';}
    }
    const ledger=guard?.ledger() ?? [],counts=boundary?.counts() ?? {backendAccepted:0,backendBlocked:0};
    const prior=integer(options.priorAttempts,3,8) ? options.priorAttempts : null;
    const attempts=guard?.attempts() ?? 0;
    const status=failureStage ? 'failed' : options.live!==true ? 'disabled' : fixtures.length===2 && fixtures.every(fixture=>fixture.ok) ? 'passed' : 'failed';
    return {status,evidenceType:'real-browser production runtime + host request service',manifestVersion:version,failureStage,cleanupFailed,
        priorAttempts:prior,attempts,totalAttempts:prior===null ? null : prior+attempts,...counts,
        attemptLedger:ledger,unknownUsageAttempts:ledger.filter(item=>item.usageStatus==='unknown').length,
        ownedMessageOnly:counts.backendAccepted===ledger.filter(item=>item.backendAccepted).length,
        allReservationsReachedBackend:counts.backendAccepted===attempts,
        providerCost:{reported:ledger.some(item=>Number.isFinite(item.usage?.cost)),note:'Provider metadata only; not a verified billing total'},
        completedFixtures:fixtures.length,fixtures,
        ledgerAction:'Advance the external attempt ledger from totalAttempts before any separately authorized rerun. No retry was made.',
    };
}
function sanitizeFixture(value) {
    if (!['plain compactor + thinking planner','plain repair; candidate only, no Apply'].includes(value?.label)) throw Error('Unknown fixture progress.');
    const texts=value=>typeof value==='string' ? value.slice(0,100000) : null;
    const constraints=['pinPreserved','compactionWithinBudget','guidanceWithinBudget','guidancePublished','originalPreserved','unselectedTextPreserved','reviewRequired','applyInvoked'];
    const reportKeys=['code','tokens','method','budget','retainedMessageIds','removedMessageIds','summarizedMessageIds','inputOmittedMessageIds','originalRetained','messageIds'];
    const reports=(value.reports ?? []).map(report=>Object.fromEntries(reportKeys.filter(key=>Object.hasOwn(report,key)).map(key=>[key,structuredClone(report[key])])));
    return {label:value.label,ok:value.ok===true,error:safeCode(value.error),callBound:value.callBound,actualCalls:value.actualCalls,reports,
        constraints:Object.fromEntries(constraints.filter(key=>typeof value.constraints?.[key]==='boolean').map(key=>[key,value.constraints[key]])),
        calls:(value.calls ?? []).map(call=>({nodeId:['smart-compactor','response-plan','repair'].includes(call.nodeId) ? call.nodeId : null,model:APPROVED_MODELS.includes(call.model) ? call.model : null,maxTokens:integer(call.maxTokens,1,4096) ? call.maxTokens : null,elapsedMs:Number.isFinite(call.elapsedMs) ? call.elapsedMs : null,tokenCount:call.tokenCount && {tokens:Number.isFinite(call.tokenCount.tokens) ? call.tokenCount.tokens : null,method:['host-tokenizer','character-estimate'].includes(call.tokenCount.method) ? call.tokenCount.method : null},finish:safeFinish(call.finish),usage:safeUsage(call.usage),error:safeCode(call.error),output:texts(call.output)})),
        artifact:value.artifact ? {kind:['context','guidance','candidate','draft'].includes(value.artifact.kind) ? value.artifact.kind : null,text:texts(value.artifact.text)} : null,
    };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href===import.meta.url) {
    let report;
    try {report=await runLiveFixtures(parseArgs(process.argv.slice(2)));}
    catch {report={status:'failed',failureStage:'configuration',priorAttempts:null,attempts:0,totalAttempts:null,backendAccepted:0,backendBlocked:0,attemptLedger:[],unknownUsageAttempts:0,completedFixtures:0,fixtures:[],ledgerAction:'No request started. Check the external ledger before a separately authorized run.'};}
    console.log(JSON.stringify(report,null,2));
    if (report.status==='failed') process.exitCode=1;
}
