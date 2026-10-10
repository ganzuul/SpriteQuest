import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { approvedEmber, openEmber, measureEmber, assertEmber, assertColor, hasOuterRing } from '../tests/browser/ember-fixture.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),base='http://127.0.0.1:4180',args=process.argv.slice(2);
if(!args.every(arg=>arg==='--execute'||arg==='--help'||arg.startsWith('--output=')))throw Error('Use --execute, --output=<directory>, or --help.');
if(args.includes('--help')){console.log('node tools/capture-ember-theme.mjs --execute [--output=<directory>]\nCaptures the production fresh Ember workspace and enlarged first Compose/JSON Decode cards with approved Dark Lite tokens, orange selection, real zero-call success/failure and metrics. No build or downloads.');process.exit(0);}
if(!args.includes('--execute'))throw Error('Supply --execute for the authorized production Ember capture.');
const output=resolve(root,args.find(arg=>arg.startsWith('--output='))?.slice(9)||'benchmark-results/ember-visuals');
const manifest=JSON.parse(await readFile(join(root,'manifest.json'),'utf8')),bundle=await readFile(join(root,'dist/lattice-ui.js'));
const evidence={version:manifest.version,bundleSha256:createHash('sha256').update(bundle).digest('hex'),tokens:approvedEmber.settings,approvedReferences:approvedEmber.references,viewport:{width:1440,height:900,dpr:1},startedAt:new Date().toISOString(),status:'running',images:[],errors:[],blockedRequests:[]};
const assert=(condition,message)=>{if(!condition)throw Error(message);},pause=ms=>new Promise(resolvePause=>setTimeout(resolvePause,ms));
await mkdir(output,{recursive:true});let server,browser,serverText='';
try{
    try{const response=await fetch(base+'/manifest.json',{signal:AbortSignal.timeout(500)});if(response.ok)throw Error('Port 4180 already serves another host; stop it before this runner.');}catch(error){if(error.message.startsWith('Port 4180'))throw error;}
    server=spawn(process.execPath,['tools/serve-harness.mjs'],{cwd:root,env:{...process.env,PORT:'4180'},stdio:['ignore','pipe','pipe'],windowsHide:true});
    let launchError;server.on('error',error=>{launchError=error;});for(const stream of [server.stdout,server.stderr])stream.on('data',data=>{serverText=(serverText+data.toString()).slice(-4096);});
    let ready=false;
    for(let attempt=0;attempt<80;attempt++){
        if(launchError||server.exitCode!==null)throw launchError??Error('Local harness exited: '+serverText);
        try{const response=await fetch(base+'/manifest.json',{signal:AbortSignal.timeout(500)});if(response.ok&&(await response.json()).version===manifest.version){ready=true;break;}}catch{}
        await pause(100);
    }
    assert(ready,'Local Ember production host did not start.');
    browser=await chromium.launch();const context=await browser.newContext({viewport:{width:evidence.viewport.width,height:evidence.viewport.height},deviceScaleFactor:1,reducedMotion:'reduce',serviceWorkers:'block'});
    const responses=new Set();
    await context.route('**/*',async route=>{
        const request=route.request(),url=new URL(request.url());
        if(['data:','blob:'].includes(url.protocol))return route.continue();
        if(url.origin!==base||!['GET','HEAD'].includes(request.method())){evidence.blockedRequests.push(request.method()+' '+url.href);return route.abort('blockedbyclient');}
        if(url.pathname==='/scripts/user.js')return route.fulfill({contentType:'text/javascript',body:"export const getCurrentUserHandle=()=> 'default-user';"});
        if(url.pathname==='/script.js')return route.fulfill({contentType:'text/javascript',body:`
            const context=()=>globalThis.SillyTavern.getContext();export const isGenerating=()=>false;
            export function syncMesToSwipe(i){const m=context().chat[i];m.swipe_info[m.swipe_id]={extra:structuredClone(m.extra||{})};return true;}
            export function syncSwipeToMes(i,s){const m=context().chat[i];m.swipe_id=s;m.mes=m.swipes[s];Object.assign(m,structuredClone(m.swipe_info[s]));return true;}
        `});
        return route.continue();
    });
    const page=await context.newPage();page.setDefaultTimeout(10000);
    page.on('pageerror',error=>evidence.errors.push(error.message));page.on('console',message=>{if(message.type()==='error')evidence.errors.push(message.text());});
    context.on('response',response=>{responses.add(new URL(response.url()).pathname);if(response.status()>=400)evidence.errors.push('HTTP '+response.status()+': '+response.url());});
    const ids=await openEmber(page,{url:base+'/tests/browser/harness.html'});
    evidence.fresh=await measureEmber(page);assertEmber(evidence.fresh);assert(responses.has('/dist/lattice-ui.js'),'The actual production UI bundle was not loaded.');
    const authored=evidence.fresh.graphBytes;
    await page.evaluate(async id=>{const h=window.canvasHarness;h.canvas.select({kind:'node',id});await h.settle();},ids.guidanceCompose);await page.locator('[data-run-here]').click();await page.waitForFunction(()=>document.querySelector('.pc-run-meter-label')?.textContent.trim()==='Completed');
    evidence.run=await page.evaluate(async()=>{const h=window.canvasHarness,result=(await import('/src/run.js?v='+h.version)).getNativeWorkflowController().lastResult();return {ok:result.ok,mode:result.mode,actualCalls:result.actualCalls,providerCalls:h.providerCalls()};});
    assert(evidence.run.ok&&evidence.run.mode==='target'&&evidence.run.actualCalls===0&&evidence.run.providerCalls===0,'Unified structured composition target did not complete with zero provider calls.');
    await page.locator('.pc-node-native[data-id="'+ids.guidanceCompose+'"] .pc-native-heading').click();
    evidence.workspaceFrame=await page.evaluate(async firstId=>{
        const h=window.canvasHarness;await h.settle();
        const rect=element=>{const r=element.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
        const canvas=rect(h.canvas.host),shelf=rect(document.querySelector('.pc-node-shelf')),viewport=rect(h.canvas.viewport),previous={...h.canvas.view};
        const cards=[...document.querySelectorAll('.pc-node-native')];
        if(cards.length!==Object.keys(h.graph.nodes).length||!Number.isFinite(previous.zoom)||previous.zoom<=0)throw Error('Full Ember reference needs the actual unified fixture and a finite camera.');
        const boxes=cards.map(card=>({id:card.dataset.id,...rect(card)}));
        const left=Math.min(...boxes.map(box=>box.left)),top=Math.min(...boxes.map(box=>box.top)),right=Math.max(...boxes.map(box=>box.right)),bottom=Math.max(...boxes.map(box=>box.bottom));
        // Frame the measured cards beside the floating shelf using the existing
        // presentation camera. Authored node positions and product CSS stay intact.
        const available={left:Math.max(canvas.left+32,shelf.right+32),top:canvas.top+32,right:canvas.right-32,bottom:canvas.bottom-32};
        const width=(right-left)/previous.zoom,height=(bottom-top)/previous.zoom;
        if(width<=0||height<=0||available.right<=available.left||available.bottom<=available.top)throw Error('The measured Ember chain has no usable capture area beside the shelf.');
        const zoom=Math.min(1,(available.right-available.left)/width,(available.bottom-available.top)/height);
        const origin={x:viewport.left-previous.x,y:viewport.top-previous.y};
        const graphBounds={left:(left-viewport.left)/previous.zoom,top:(top-viewport.top)/previous.zoom,width,height};
        const view={zoom,x:available.left+(available.right-available.left-width*zoom)/2-origin.x-graphBounds.left*zoom,y:available.top+(available.bottom-available.top-height*zoom)/2-origin.y-graphBounds.top*zoom};
        await h.view(view);
        return {canvas:rect(h.canvas.host),shelf:rect(document.querySelector('.pc-node-shelf')),available,previous,view:{...h.canvas.view},graphBounds,cards:cards.map(card=>({id:card.dataset.id,...rect(card)})),firstId};
    },ids.firstCompose);
    const frame=evidence.workspaceFrame;
    assert(frame.cards.length===Object.keys(JSON.parse(authored).nodes).length,'The full Ember reference lost a card.');
    for(const card of frame.cards)assert(card.left>=frame.canvas.left+16&&card.top>=frame.canvas.top+16&&card.right<=frame.canvas.right-16&&card.bottom<=frame.canvas.bottom-16,card.id+' must be complete inside the actual canvas.');
    const firstCard=frame.cards.find(card=>card.id===frame.firstId);
    assert(firstCard&&firstCard.left>=frame.shelf.right+16,'The first Compose card must clear the floating shelf.');
    evidence.workspace=await measureEmber(page);assertEmber(evidence.workspace);
    assert(evidence.workspace.graphBytes===authored&&evidence.workspace.hostSheet===evidence.fresh.hostSheet,'Full reference camera or selection changed authored data or the host theme.');
    const selected=evidence.workspace.nodes.find(node=>node.id===ids.guidanceCompose);assertColor(selected.border,approvedEmber.settings.tokens.SmartThemeQuoteColor,'selected orange border');assert(hasOuterRing(selected.shadow,approvedEmber.settings.tokens.SmartThemeQuoteColor),'Selected card lost its orange outer ring.');
    const image=async(name,options={})=>{const path=join(output,name+'.png');await page.screenshot({path,animations:'disabled',...options});evidence.images.push({name,path});};
    await image('ember-workspace');
    await page.evaluate(async id=>{const h=window.canvasHarness,node=h.canvas.graph.nodes[id];await h.view({zoom:1.5,x:150-node.x*1.5,y:120-node.y*1.5});},ids.firstCompose);
    evidence.enlarged=await measureEmber(page);assertEmber(evidence.enlarged);assert(evidence.enlarged.graphBytes===authored,'Run, selection or camera changed the fresh authored graph.');
    const first=await page.locator('.pc-node-native[data-id="'+ids.firstCompose+'"]').boundingBox(),second=await page.locator('.pc-node-native[data-id="'+ids.jsonDecode+'"]').boundingBox(),canvas=await page.locator('.pc-canvas-host').boundingBox();
    const clip={x:Math.min(first.x,second.x)-12,y:Math.min(first.y,second.y)-12,width:Math.max(first.x+first.width,second.x+second.width)-Math.min(first.x,second.x)+24,height:Math.max(first.y+first.height,second.y+second.height)-Math.min(first.y,second.y)+24};
    assert(clip.x>=canvas.x&&clip.y>=canvas.y&&clip.x+clip.width<=canvas.x+canvas.width&&clip.y+clip.height<=canvas.y+canvas.height,'The enlarged reference must contain both complete cards inside the actual canvas.');
    await image('ember-nodes',{clip});
    await page.evaluate(id=>{const h=window.canvasHarness;h.graph.nodes[id].sections[0].text='{broken';h.S.save();h.UI.refreshIfOpen();},ids.firstCompose);await page.evaluate(()=>window.canvasHarness.settle());
    await page.evaluate(async id=>{const h=window.canvasHarness;h.canvas.select({kind:'node',id});await h.settle();},ids.guidanceCompose);await page.locator('[data-run-here]').click();await page.waitForFunction(()=>document.querySelector('.pc-run-meter-label')?.textContent.trim()==='Failed');
    await page.locator('.pc-node-native[data-id="'+ids.jsonDecode+'"] .pc-native-heading').click();evidence.failure=await measureEmber(page);
    const failed=evidence.failure.nodes.find(node=>node.id===ids.jsonDecode);assert(failed.classes.includes('pc-trace-failed')&&failed.classes.includes('pc-selected'),'Actual invalid JSON did not produce a selected failed card.');assertColor(failed.border,evidence.failure.roles.error,'failure priority');assert(hasOuterRing(failed.shadow,evidence.failure.roles.error)&&!hasOuterRing(failed.shadow,approvedEmber.settings.tokens.SmartThemeQuoteColor),'Failure must retain its error ring above selection.');assert(Number(failed.heading.opacity)<1&&failed.heading.filter.includes('grayscale'),'Failed interior must remain dimmed and grayscale.');assert(evidence.failure.providerCalls===0,'Failure capture attempted a provider call.');
    await image('ember-selected-failure');
    assert(evidence.errors.length===0&&evidence.blockedRequests.length===0,'Capture produced browser, missing-resource or request-guard errors.');evidence.status='passed';
}catch(error){evidence.status='failed';evidence.error=error.stack??String(error);process.exitCode=1;}
finally{
    const fail=(stage,error)=>{evidence.status='failed';process.exitCode=1;(evidence.cleanupErrors??=[]).push({stage,error:error.stack??String(error)});};
    try{await browser?.close();}catch(error){fail('browser close',error);}
    try{if(server?.kill()===false&&server.exitCode===null)throw Error('Runner-owned server did not accept termination.');}catch(error){fail('server stop',error);}
    evidence.finishedAt=new Date().toISOString();evidence.serverLog=serverText;
    try{await writeFile(join(output,'metrics.json'),JSON.stringify(evidence,null,2));}catch(error){fail('metrics persistence',error);}
    console.log(JSON.stringify({status:evidence.status,output,version:evidence.version,images:evidence.images.length,providerCalls:evidence.failure?.providerCalls??evidence.run?.providerCalls,errors:evidence.errors},null,2));
}
