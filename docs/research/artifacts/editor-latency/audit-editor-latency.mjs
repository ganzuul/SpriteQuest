import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, sep, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cpus, totalmem } from 'node:os';
import { parseAuditOptions, percentile, summarizeMotionSample, summarizeMotionSamples } from './editor-latency-options.mjs';

// Production controller + production Svelte bundle; isolated synthetic host.
const root = resolve(process.argv.find(a => a.startsWith('--source='))?.slice(9) ?? fileURLToPath(new URL('../../../../', import.meta.url)));
const output = resolve(process.argv.find(a => a.startsWith('--output='))?.slice(9) ?? fileURLToPath(new URL('./', import.meta.url)));
const options = parseAuditOptions(process.argv.slice(2));
const { sizes, repeats, rates, modes, motionModes, motionPlain, motionRepeats, motionFrames, motionEvents, motionInstrumentedRepeats, skipMotion } = options;
const { chromium } = createRequire(join(root, 'package.json'))('@playwright/test');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer(async (request, response) => {
    try {
        const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        const path = resolve(root, `.${pathname}`);
        if (!path.startsWith(root + sep)) { response.writeHead(403).end(); return; }
        response.setHeader('Content-Type', mime[extname(path)] ?? 'application/octet-stream');
        let body = await readFile(path);
        if (pathname === '/tests/browser/harness.js') {
            // Install measurement before settings admission captures its exact saver.
            // Forward the production view qualifier through the fixture wrapper.
            body = body.toString().replace('const context = installMock();', "const context = installMock();\nglobalThis.__latticeAuditSaveStats = { calls: 0, lastAt: null };\ncontext.saveSettingsDebounced = () => { globalThis.__latticeAuditSaveStats.calls++; globalThis.__latticeAuditSaveStats.lastAt = performance.now(); };").replace('function (graph) { canvas = this; return setGraph.call(this, graph); }', 'function (graph, ...options) { canvas = this; return setGraph.call(this, graph, ...options); }');
        }
        response.setHeader('Cache-Control', 'no-store'); response.end(body);
    } catch { response.writeHead(404).end(); }
});
await mkdir(output, { recursive: true });
const sourceFiles=[];
async function hashSource(directory){for(const entry of await readdir(join(root,directory),{withFileTypes:true})){const name=join(directory,entry.name);if(entry.isDirectory())await hashSource(name);else{const data=await readFile(join(root,name));sourceFiles.push({path:name.replaceAll('\\','/'),bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}}}
for(const dir of ['src','ui','dist','assets'])await hashSource(dir);
for(const path of ['index.js','manifest.json','style.css','package.json','package-lock.json','tests/mock.js','tests/browser/harness.js','tests/browser/harness.html','tests/browser/native-fixture.mjs']){const data=await readFile(join(root,path));sourceFiles.push({path,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}
sourceFiles.sort((a,b)=>a.path.localeCompare(b.path));
const measurementFiles = await Promise.all(['audit-editor-latency.mjs','editor-latency-options.mjs'].map(async path => { const data = await readFile(new URL(path, import.meta.url)); return {path, bytes:data.length, sha256:createHash('sha256').update(data).digest('hex')}; }));
await writeFile(join(output,'editor-latency-source-manifest.json'),JSON.stringify({source:root,files:sourceFiles,measurementFiles},null,2));
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`, rows = [], errors = [], blocked = [];
let browser;
const metrics = async session => Object.fromEntries((await session.send('Performance.getMetrics')).metrics.map(m => [m.name,m.value]));
try {
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    await page.route('**/*', route => {
        const req = route.request(), url = new URL(req.url());
        if (['data:', 'blob:'].includes(url.protocol)) return route.continue();
        if (url.origin !== base || !['GET','HEAD'].includes(req.method())) { blocked.push(`${req.method()} ${url.href}`); return route.abort(); }
        if (url.pathname === '/script.js') return route.fulfill({ contentType: 'text/javascript', body: 'export const isGenerating=()=>false;export const syncMesToSwipe=()=>true;export const syncSwipeToMes=()=>true;' });
        return route.continue();
    });
    page.on('pageerror', e => errors.push(e.message));
    const session = await page.context().newCDPSession(page);
    await session.send('Performance.enable');
    for (const rate of rates) for (const size of sizes.filter(n => rate === 1 || n === 100)) {
        await session.send('Emulation.setCPUThrottlingRate', { rate });
        await page.goto(base + '/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness);
        await page.evaluate(async () => {
            const h = window.canvasHarness;
            const [{canvasWorkflow},{operationDefaults}] = await Promise.all([import('/tests/browser/native-fixture.mjs'),import('/src/workflow/catalog.js?v='+h.version)]);
            window.audit = { fixture:n=>{const g=canvasWorkflow(operationDefaults,n,10);delete g.wires.w1;return g;}, defaults:operationDefaults, samples:[], get saveCalls(){return globalThis.__latticeAuditSaveStats.calls;}, get lastSaveAt(){return globalThis.__latticeAuditSaveStats.lastAt;} };
            window.audit.arm = detailed => {
                const c=h.canvas, stats={jsonCalls:0,jsonMs:0,cloneCalls:0,cloneMs:0,saveCalls:0,renderCalls:0,setGraphCalls:0,cardHeightReads:0,pinRectReads:0,methods:{}}, restores=[];
                const wrap=(object,key,label)=>{const original=object[key];if(typeof original!=='function')return;object[key]=function(...args){const t=performance.now();try{return original.apply(this,args);}finally{const s=stats.methods[label]??={calls:0,ms:0};s.calls++;s.ms+=performance.now()-t;}};restores.push(()=>object[key]=original);};
                if(detailed){
                    const json=JSON.stringify,clone=window.structuredClone;
                    JSON.stringify=function(...args){const t=performance.now();try{return json.apply(this,args);}finally{stats.jsonCalls++;stats.jsonMs+=performance.now()-t;}};
                    window.structuredClone=function(...args){const t=performance.now();try{return clone.apply(this,args);}finally{stats.cloneCalls++;stats.cloneMs+=performance.now()-t;}};
                    restores.push(()=>{JSON.stringify=json;window.structuredClone=clone;});
                    for(const key of ['render','setGraph','setNodeProfiles','setTrace','updateNativeWire'])wrap(c,key,'canvas.'+key);
                    for(const key of ['applyScene','setWirePreview','setVisualStatus','setNodes','setWires','setGroups','setComments','setPositions','setNodeProfiles','setRecallStatus'])wrap(c.layer,key,'layer.'+key);
                    const height=Object.getOwnPropertyDescriptor(HTMLElement.prototype,'offsetHeight'),rect=Element.prototype.getBoundingClientRect;
                    Object.defineProperty(HTMLElement.prototype,'offsetHeight',{configurable:true,get(){if(this.matches('.pc-node'))stats.cardHeightReads++;return height.get.call(this);}});
                    Element.prototype.getBoundingClientRect=function(){if(this.matches('.pc-port'))stats.pinRectReads++;return rect.call(this);};
                    restores.push(()=>{Object.defineProperty(HTMLElement.prototype,'offsetHeight',height);Element.prototype.getBoundingClientRect=rect;});
                }
                const saves=window.audit.saveCalls,nodes=[...c.nodeLayer.querySelectorAll('.pc-node')],wires=[...c.svg.querySelectorAll('.pc-wire')],control=document.querySelector('.pc-node-details input[aria-label="Trim output"]');
                return ()=>{stats.saveCalls=window.audit.saveCalls-saves;stats.renderCalls=stats.methods['canvas.render']?.calls??0;stats.setGraphCalls=stats.methods['canvas.setGraph']?.calls??0;const retained={nodes:nodes.every(n=>c.nodeLayer.contains(n)),wires:wires.every(w=>c.svg.contains(w)),control:control?.isConnected??null};restores.reverse().forEach(r=>r());return {stats,retained};};
            };
            window.audit.pin=(nodeId,dir)=>{const c=h.canvas,el=c.nodeLayer.querySelector(`.pc-port[data-node="${nodeId}"][data-dir="${dir}"]${dir==='in'?'[data-port="section.Text"]':''}`),portId=el.dataset.port,meta=c.graph.nativeCards[nodeId].ports.find(p=>p.port===portId&&p.dir===dir),center=c.endpoint(nodeId,dir,portId);return {nodeId,dir,portId,kind:meta.kind,center:{x:center.x,y:center.y},address:{workflowId:h.graph.id,instancePath:[],nodeId,portId}};};
        });
        for (const mode of modes) {
            const samples=[];
            for(let repeat=-1;repeat<=repeats;repeat++) {
                const detailed=repeat===repeats;
                await page.evaluate(async ({size,mode,repeat}) => {
                    const h=window.canvasHarness,a=window.audit;
                    if(repeat===-1 || ['shelf-create','search-create','connect-hover','connect-release'].includes(mode)) await h.activate(a.fixture(size));
                    h.canvas.cancelGesture(); h.canvas.select({kind:'node',id:'n0'}); await h.settle();
                    if(mode==='shelf-create'){document.querySelector('[data-family="Input"]').click();await h.settle();}
                    if(mode==='search-create')h.canvas.hooks.nativeBridge().openUnconnectedSearch({graphPoint:{x:350,y:350},screenAnchor:{x:400,y:400}});
                    if(mode==='detail-save'){const t=document.querySelector('textarea[aria-label="Section 1 text"]');t.value='Changed '+repeat;t.dispatchEvent(new Event('input',{bubbles:true}));await h.settle();}
                    if(mode.startsWith('connect-')){const b=h.canvas.hooks.nativeBridge();a.bridge=b;a.from=a.pin('n0','out');a.to=a.pin('n1','in');b.dispatch({type:'begin-pin',pin:a.from,pointerId:99,graphPoint:a.from.center,originalBindings:[]});if(mode==='connect-release'){b.dispatch({type:'pointer-move',pointerId:99,graphPoint:a.to.center,hit:{kind:'pin',pin:a.to}});await h.settle();}}
                },{size,mode,repeat});
                // Allow the setup selection's ordinary 180ms debounce to settle.
                await page.waitForTimeout(300);
                const before=await metrics(session);
                const profile=['detail-toggle','shelf-create','connect-release'].includes(mode)&&size===250&&detailed&&rate===1;
                if(profile){await session.send('Profiler.enable');await session.send('Profiler.setSamplingInterval',{interval:1000});await session.send('Profiler.start');}
                const sample=await page.evaluate(async({mode,repeat,detailed})=>{
                    const h=window.canvasHarness,c=h.canvas,a=window.audit,restore=a.arm(detailed),beforeNodes=Object.keys(h.graph.nodes).length,beforeWires=Object.keys(h.graph.wires).length;
                    const beforeLocalJson=!!document.querySelector('textarea[aria-label="Sections"]'),expander=document.querySelector('.pc-node-details summary')?.parentElement,beforeExpanded=expander?.open;
                    await new Promise(r=>requestAnimationFrame(r));const start=performance.now();let expected;
                    try{
                        if(mode==='local-json')document.querySelector('.pc-node-details button[aria-label^="Edit Sections"],.pc-node-details button[aria-label^="Use structured"]').click();
                        else if(mode==='local-expand')document.querySelector('.pc-node-details summary').click();
                        else if(mode==='detail-enum'){const inputs=[...document.querySelectorAll('[role="radiogroup"][aria-label="Mode"] input')],next=inputs.find(e=>!e.checked);expected=next.value;next.checked=true;next.dispatchEvent(new Event('change',{bubbles:true}));}
                        else if(mode==='detail-toggle'){const input=document.querySelector('input[aria-label="Trim output"]');expected=!input.checked;input.checked=expected;input.dispatchEvent(new Event('change',{bubbles:true}));}
                        else if(mode==='detail-save')document.querySelector('button[data-save-control="sections"]').click();
                        else if(mode==='selection')c.select({kind:'node',id:'n1'});
                        else if(mode==='shelf-create')document.querySelector('[data-shelf-choice="operation:scene-context"]').click();
                        else if(mode==='search-create')c.hooks.nativeBridge().actions().search.choose('operation:scene-context');
                        else if(mode==='connect-hover')a.bridge.dispatch({type:'pointer-move',pointerId:99,graphPoint:a.to.center,hit:{kind:'pin',pin:a.to}});
                        else if(mode==='connect-release')a.bridge.dispatch({type:'release',pointerId:99,graphPoint:a.to.center,screenAnchor:{x:500,y:500},hit:{kind:'pin',pin:a.to}});
                        const syncMs=performance.now()-start;
                        await h.settle();const settledMs=performance.now()-start,result=restore();
                        if(mode.endsWith('create')&&Object.keys(h.graph.nodes).length!==beforeNodes+1)throw Error('Creation did not commit');
                        if(mode==='connect-release'&&Object.keys(h.graph.wires).length!==beforeWires+1)throw Error('Connection did not commit');
                        if(mode==='connect-hover'&&a.bridge.project().gesture.feedback?.compatible!==true)throw Error('Hover validation did not succeed: '+JSON.stringify(a.bridge.project()));
                        if(mode==='detail-enum'&&h.graph.nodes.n0.mode!==expected)throw Error('Enum edit did not commit');
                        if(mode==='detail-toggle'&&Boolean(h.graph.nodes.n0.modifiers?.find(m=>m.type==='trim')?.enabled)!==expected)throw Error('Toggle did not commit');
                        if(mode==='detail-save'&&h.graph.nodes.n0.sections[0].text!=='Changed '+repeat)throw Error('Structured edit did not commit');
                        if(mode==='selection'&&c.selection?.id!=='n1')throw Error('Selection did not change');
                        if(mode==='local-json'&&!!document.querySelector('textarea[aria-label="Sections"]')===beforeLocalJson)throw Error('Local editor representation did not change');
                        if(mode==='local-expand'&&expander.open===beforeExpanded)throw Error('Local section did not expand/collapse');
                        if(h.providerCalls())throw Error('Unexpected provider call');
                        return {repeat,detailed,syncMs,settledMs,...result,nodes:Object.keys(h.graph.nodes).length,wires:Object.keys(h.graph.wires).length,elements:c.viewport.querySelectorAll('*').length};
                    }catch(e){restore();throw e;}
                },{mode,repeat,detailed});
                const after=await metrics(session);
                if(profile){const {profile}=await session.send('Profiler.stop');await writeFile(join(output,`${mode}-250.cpuprofile`),JSON.stringify(profile));}
                for(const [key,metric] of [['taskMs','TaskDuration'],['scriptMs','ScriptDuration'],['layoutMs','LayoutDuration'],['styleMs','RecalcStyleDuration']])sample[key]=(after[metric]-before[metric])*1000;
                if(repeat>=0)samples.push(sample);
                await page.evaluate(()=>window.audit.bridge?.cancel('cancel'));
            }
            const plain=samples.filter(s=>!s.detailed),row={size,rate,mode,repeats:plain.length,syncMedianMs:percentile(plain.map(s=>s.syncMs),.5),syncP95Ms:percentile(plain.map(s=>s.syncMs),.95),settledMedianMs:percentile(plain.map(s=>s.settledMs),.5),settledP95Ms:percentile(plain.map(s=>s.settledMs),.95),syncWorstMs:Math.max(...plain.map(s=>s.syncMs)),settledWorstMs:Math.max(...plain.map(s=>s.settledMs)),samples};
            rows.push(row);console.log(JSON.stringify({...row,samples:undefined,instrumented:samples.at(-1)}));
            await writeFile(join(output,'editor-latency-results.json'),JSON.stringify({partial:true,rows,errors,blocked},null,2));
        }
        // Plain motion is opt-in; preserve the two instrumented legacy samples.
        if (!skipMotion) for (const mode of motionModes) {
            const repetitions = [
                ...(motionPlain ? [{repeat:-1,detailed:false,warmup:true}, ...Array.from({length:motionRepeats},(_,repeat)=>({repeat,detailed:false,warmup:false}))] : []),
                ...Array.from({length:motionInstrumentedRepeats},(_,repeat)=>({repeat,detailed:true,warmup:false})),
            ];
            for (const repetition of repetitions) {
                await page.evaluate(async size=>{await canvasHarness.activate(window.audit.fixture(size));canvasHarness.canvas.select({kind:'node',id:'n0'});await canvasHarness.settle();},size);
                // Setup selection/recovery timers must finish outside the sampled gesture.
                await page.waitForTimeout(300);
                const sample=await page.evaluate(async ({mode,detailed,frames,events})=>{
                    const h=canvasHarness,c=h.canvas,a=window.audit,restore=a.arm(detailed),heading=c.nodeLayer.querySelector('[data-id="n0"] .pc-native-heading'),box=heading.getBoundingClientRect(),at={x:box.left+20,y:box.top+10},initialNodeX=h.graph.nodes.n0.x,initialCameraX=c.view.x,initialZoom=c.view.zoom;
                    const mouse=(target,type,x,y,button=0)=>target.dispatchEvent(new MouseEvent(type,{button,clientX:x,clientY:y,bubbles:true,cancelable:true}));
                    const originalViewCommit=c.hooks.onViewCommit;
                    let zoomCommitAt=null,zoomCommitSyncMs=null;
                    if(mode==='zoom')c.hooks.onViewCommit=function(...args){zoomCommitAt=performance.now();try{return originalViewCommit?.apply(this,args);}finally{zoomCommitSyncMs=performance.now()-zoomCommitAt;}};
                    try {
                        const down=performance.now();
                        if(mode==='drag')mouse(heading,'mousedown',at.x,at.y);
                        if(mode==='pan')mouse(c.host,'mousedown',at.x,at.y,1);
                        if(mode==='wire-preview'){a.bridge=c.hooks.nativeBridge();a.from=a.pin('n0','out');a.bridge.dispatch({type:'begin-pin',pin:a.from,pointerId:99,graphPoint:a.from.center,originalBindings:[]});}
                        const downMs=performance.now()-down,intervals=[],handlers=[];
                        let previous,sawZoomChange=false,thresholdAt=null,thresholdSyncMs=null,thresholdSettledMs=null,lastInputAt=null;
                        for(let frame=0;frame<frames;frame++){
                            const stamp=await new Promise(r=>requestAnimationFrame(r));
                            if(previous!==undefined)intervals.push(stamp-previous);
                            if(frame===1)thresholdSettledMs=performance.now()-thresholdAt;
                            previous=stamp;
                            const t=performance.now(); if(frame===0)thresholdAt=t;
                            for(let e=0;e<events;e++){
                                const x=at.x+30+(frame%10)+e,y=at.y+10+frame/4;
                                if(mode==='zoom')c.host.dispatchEvent(new WheelEvent('wheel',{deltaY:frame%2?-2:2,clientX:600,clientY:400,bubbles:true,cancelable:true}));
                                else if(mode==='wire-preview')a.bridge.dispatch({type:'pointer-move',pointerId:99,graphPoint:{x,y},hit:{kind:'empty'}});
                                else mouse(c.host,'mousemove',x,y);
                            }
                            const handlerMs=performance.now()-t; handlers.push(handlerMs);
                            if(frame===0)thresholdSyncMs=handlerMs;
                            lastInputAt=performance.now(); if(c.view.zoom!==initialZoom)sawZoomChange=true;
                        }
                        const preview=mode==='wire-preview'?a.bridge.project().gesture:null;
                        if(preview&&(preview.kind!=='drag'||(preview.ghost.x===a.from.center.x&&preview.ghost.y===a.from.center.y)))throw Error('Wire preview did not move');
                        const release=performance.now(),savesAtRelease=a.saveCalls;
                        if(mode==='wire-preview')a.bridge.cancel('cancel');else if(mode!=='zoom')mouse(c.host,'mouseup',at.x+60,at.y+30,mode==='pan'?1:0);
                        const releaseSyncMs=mode==='zoom'?null:performance.now()-release;
                        await h.settle(); const releaseSettledMs=mode==='zoom'?null:performance.now()-release;
                        let zoomCommitDelayMs=null,zoomSaveBoundaryMs=null;
                        if(mode==='zoom'){
                            // Wheel idle commit and controller view save are
                            // distinct from live frame work. This is host submission, not disk ack.
                            const deadline=performance.now()+5000;
                            while(zoomCommitAt===null||a.saveCalls===savesAtRelease){if(performance.now()>deadline)throw Error('Final zoom commit/save boundary did not complete');await new Promise(r=>setTimeout(r,10));}
                            zoomCommitDelayMs=zoomCommitAt-lastInputAt; zoomSaveBoundaryMs=a.lastSaveAt-lastInputAt;
                        }
                        if(mode==='drag'&&h.graph.nodes.n0.x===initialNodeX)throw Error('Drag did not persist coordinates');
                        if(mode==='pan'&&c.view.x===initialCameraX)throw Error('Pan did not change camera');
                        if(mode==='zoom'&&!sawZoomChange)throw Error('Zoom did not change camera');
                        if(mode==='wire-preview'&&a.bridge.project().gesture.kind!=='idle')throw Error('Wire preview did not cancel');
                        if(h.providerCalls())throw Error('Unexpected provider call during motion');
                        return {downMs,thresholdDelayMs:thresholdAt-down,thresholdSyncMs,thresholdSettledMs,releaseSyncMs,releaseSettledMs,zoomCommitDelayMs,zoomCommitSyncMs,zoomSaveBoundaryMs,intervals,handlers,...restore(),providerCalls:h.providerCalls()};
                    } catch(error) {restore();throw error;}
                    finally {if(mode==='zoom')c.hooks.onViewCommit=originalViewCommit;}
                },{mode,detailed:repetition.detailed,frames:motionFrames,events:motionEvents});
                if(repetition.warmup)continue;
                const row={size,rate,mode,...repetition,sampling:repetition.detailed?'instrumented':'plain',frames:motionFrames,eventsPerFrame:motionEvents,...summarizeMotionSample(sample),...sample};
                rows.push(row);console.log(JSON.stringify({...row,intervals:undefined,handlers:undefined}));
                await writeFile(join(output,'editor-latency-results.json'),JSON.stringify({partial:true,rows,motionSummary:summarizeMotionSamples(rows),errors,blocked},null,2));
            }
        }
    }
    const info=await(await browser.newBrowserCDPSession()).send('SystemInfo.getInfo');
    const bundle=await readFile(join(root,'dist/lattice-ui.js'));
    const report={date:'2026-10-10',source:root,head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),status:execFileSync('git',['status','--short'],{cwd:root,encoding:'utf8'}),bundleSha256:createHash('sha256').update(bundle).digest('hex'),browser:await browser.version(),gpu:info.gpu.devices,viewport:{width:1440,height:1000},runtime:process.version,hardware:{cpus:cpus().map(({model,speed})=>({model,speed})),memoryBytes:totalmem(),platform:process.platform,arch:process.arch},command:process.argv,measurementFiles,...options,motionSummary:summarizeMotionSamples(rows),scope:'Full mounted production controller and Svelte UI. Synthetic disabled host; no providers. One warmup, uninstrumented repeat timings, one instrumented operation-count sample; synthetic DOM events/controller bridge commands. settledMs ends at second rAF after action (a paint opportunity estimate, not INP). Motion frame/event counts are recorded in options; two instrumented samples remain separate from opt-in plain gestures after one warmup. thresholdDelayMs is down-to-first-batch, thresholdSyncMs is first batch handler time, thresholdSettledMs ends at next rAF. Final zoom idle commit and host save submission are measured separately; submission does not acknowledge disk persistence. CPU rate 4 is a stress condition, not a hardware prediction.',errors,blocked,providerCalls:await page.evaluate(()=>canvasHarness.providerCalls()),rows};
    await writeFile(join(output,'editor-latency-results.json'),JSON.stringify(report,null,2));
    if(errors.length||blocked.length)throw Error(JSON.stringify({errors,blocked}));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
