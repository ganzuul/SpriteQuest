import { readFile, realpath } from 'node:fs/promises';
import { dirname, resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const APPROVED_MODELS = Object.freeze(['z-ai/glm-5.2','z-ai/glm-5.2:thinking']);
const integer = (n,min,max) => Number.isSafeInteger(n) && n >= min && n <= max;
/** One session's paid boundary. Reservations count failures and are never retried. */
export function createLiveGuard({live=false,host='http://127.0.0.1:8000',priorAttempts=3,maxAttempts=3} = {}) {
    let url;
    try { url = new URL(host); } catch { throw Error('Use a plain HTTP loopback host.'); }
    if (url.protocol !== 'http:' || !['127.0.0.1','[::1]'].includes(url.hostname) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw Error('Use a plain HTTP loopback host without credentials or a path.');
    if (!integer(priorAttempts,3,8)) throw Error('The prior attempt count must include the three earlier attempts.');
    if (!integer(maxAttempts,1,5) || priorAttempts + maxAttempts > 8) throw Error('The attempt bound exceeds the remaining global allowance.');
    let attempted=0, active=null, stopped=false;
    return {
        attempts:()=>attempted,
        stop:()=>{stopped=true;},
        /** Abort all host generation traffic unless exactly owned by the current reservation. */
        authorize(payload) {
            if (!active || active.used || payload?.chat_completion_source !== 'nanogpt' || payload.model !== active.model || payload.max_tokens !== active.maxTokens || payload.stream === true || JSON.stringify(payload.messages) !== active.messages) return false;
            active.used=true; return true;
        },
        async request(input,transport) {
            if (live !== true) throw Error('Live execution requires explicit --live opt-in.');
            if (stopped) throw Error('The live session is stopped; no retries are allowed.');
            if (!APPROVED_MODELS.includes(input?.binding?.model)) throw Error('Unapproved live model.');
            if (!integer(input?.maxTokens,1,4096)) throw Error('Completion cap must be an integer from 1 through 4096.');
            if (!Array.isArray(input?.messages) || !input.messages.length || input.messages.some(m=>!m || !['system','user','assistant','tool'].includes(m.role) || typeof m.content !== 'string')) throw Error('Only owned synthetic messages may be sent.');
            if (active || attempted >= maxAttempts) throw Error('Live attempt limit reached or a reservation is already active.');
            attempted++;
            active={model:input.binding.model,maxTokens:input.maxTokens,messages:JSON.stringify(input.messages),used:false};
            try {
                const result=await transport();
                if (!result?.ok) stopped=true;
                return result;
            } catch (error) { stopped=true; throw error; }
            finally { active=null; }
        },
    };
}

/** Serve only the narrowly required production dependency graph, never host files or secrets. */
export async function productionModulePath(repoRoot,url) {
    const allowed = new Set(['runtime','contracts','catalog','compactor','repair','connections','starters']);
    const match = /^\/__comfytavern-live-test\/src\/workflow\/([a-z-]+)\.js$/.exec(new URL(url).pathname);
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
    const guard=createLiveGuard(options);
    if (options.live !== true) return {status:'disabled',attempts:0,message:'No model calls. Pass --live only after live-readiness approval.'};
    const repoRoot=dirname(dirname(fileURLToPath(import.meta.url)));
    const {version}=JSON.parse(await readFile(resolve(repoRoot,'manifest.json'),'utf8'));
    const {chromium}=await import('@playwright/test');
    const browser=await chromium.launch({headless:true});
    const context=await browser.newContext({serviceWorkers:'block'});
    const page=await context.newPage();
    let blocked=0,accepted=0;
    // Set before navigation: even installed extensions cannot generate during browser startup.
    await context.route('**/api/**',async route=>{
        const url=new URL(route.request().url());
        if (/\/(generate|completions?)(\/|$)/.test(url.pathname)) {
            let payload;
            try {payload=route.request().postDataJSON();} catch { /* Do not log the body. */ }
            if (!guard.authorize(payload)) {blocked++;await route.abort();return;}
            accepted++;
        }
        await route.continue();
    });
    await context.route('**/__comfytavern-live-test/**',async route=>{
        try {
            const path=await productionModulePath(repoRoot,route.request().url());
            await route.fulfill({contentType:'text/javascript',body:await readFile(path,'utf8')});
        } catch { await route.abort(); }
    });
    const bridge=createLiveReservationBridge(guard);
    await page.exposeBinding('__comfyReserve',(_source,input)=>bridge.reserve(input));
    await page.exposeBinding('__comfyFinish',(_source,result)=>bridge.finish(result));
    try {
        const csrfResponse=await context.request.get(new URL('/csrf-token',options.host).href);
        if (!csrfResponse.ok()) throw Error('Local CSRF service unavailable.');
        const csrf=await csrfResponse.json();
        const login=await context.request.post(new URL('/api/users/login',options.host).href,{headers:{'x-csrf-token':csrf.token},data:{handle:'default-user',password:''}});
        if (!login.ok()) throw Error('Local default-user login unavailable.');
        await page.goto(options.host,{waitUntil:'domcontentloaded'});
        // Readiness implementation follows the existing host's public login/profile services.
        await page.waitForFunction(()=>typeof window.SillyTavern?.getContext==='function',{}, {timeout:60000});
        await page.waitForFunction(id=>window.SillyTavern.getContext().extensionSettings?.connectionManager?.profiles?.some(profile=>profile.id===id),options.profileId,{timeout:60000});
        const fixtures=await page.evaluate(runSyntheticFixtures,{version,profileId:options.profileId});

        return {status:fixtures.every(f=>f.ok) ? 'passed' : 'failed',evidenceType:'real-browser production runtime + host request service',manifestVersion:version,priorAttempts:options.priorAttempts,attempts:guard.attempts(),totalAttempts:options.priorAttempts+guard.attempts(),backendAccepted:accepted,backendBlocked:blocked,ownedMessageOnly:accepted===guard.attempts(),providerCost:{reported:fixtures.some(fixture=>fixture.calls.some(call=>Number.isFinite(call.usage?.cost))),note:'Provider metadata only; not a verified billing total'},fixtures};
    } finally {guard.stop();await context.close();await browser.close();}
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href===import.meta.url) {
    try {console.log(JSON.stringify(await runLiveFixtures(parseArgs(process.argv.slice(2))),null,2));}
    catch {console.error('Live harness stopped. No retry was made. Inspect local host readiness and the sanitized fixture report.');process.exitCode=1;}
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
            const prefix='/__comfytavern-live-test/src/workflow/';
            const runtime=dependencies?.runtime ?? await import(`${prefix}runtime.js?v=${version}`);
            const connections=dependencies?.connections ?? await import(`${prefix}connections.js?v=${version}`);
            const {starterGraph}=dependencies?.starters ?? await import(`${prefix}starters.js?v=${version}`);
            const host=dependencies?.host ?? window.SillyTavern.getContext();
            const reserve=dependencies?.reserve ?? (input=>window.__comfyReserve(input));
            const finish=dependencies?.finish ?? (result=>window.__comfyFinish(result));
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
            if (first.ok) results.push(summarize('plain repair; candidate only, no Apply',await runtime.runWorkflow(post,ports(draft))));
            return results;

}
