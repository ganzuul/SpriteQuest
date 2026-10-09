import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
// Default to the containing repository, independently of the invoking directory.
const root = resolve(process.argv[2] ?? fileURLToPath(new URL('../../../../', import.meta.url)));
const { chromium } = createRequire(resolve(root, 'package.json'))('@playwright/test');
const html = `<!doctype html><html><head><link rel="stylesheet" href="/style.css"><style>html,body{margin:0;font:16px Arial;background:#15151b}.pc-canvas-host{width:100%;height:100%}.pc-header,.pc-status,.pc-sidebar,.pc-inspector{display:none}</style></head><body><script type="module">
import { installMock } from '/tests/mock.js'; installMock();
const version=(await (await fetch('/manifest.json')).json()).version;
const {Canvas}=await import('/src/canvas.js?v='+version);
const theme=await import('/src/theme.js?v='+version);
const {operationDefaults}=await import('/src/workflow/catalog.js?v='+version);
const {prepareWorkspaceViews}=await import('/src/ui/workspace-preparation.js?v='+version);
let preparationRuns=0;
const prepare=graph=>{preparationRuns++;const result=prepareWorkspaceViews(graph);if(!result.ok)throw Error(JSON.stringify(result.error));const draw=structuredClone(result.data.preparedViews[0].drawBase);draw.view={...graph.view};return draw;};
const {mountWorkbench}=await import('/dist/lattice-ui.js?v='+version);
const workbench=mountWorkbench(document.body,{});workbench.root.classList.add('pc-open');
const canvas=new Canvas(workbench.parts.canvasHost,{onView:camera=>workbench.update({camera}),onSelect:()=>workbench.update({selectionCount:canvas.multi.size||(canvas.selection?.kind==='node'?1:0)}),onMulti:ids=>workbench.update({selectionCount:ids.length})});
window.bench={canvas,theme,prepare,operationDefaults,calls:()=>({preparationRuns})};
</script></body></html>`;
const server = createServer(async (request, response) => {
    try {
        const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        if (pathname === '/') { response.writeHead(200, { 'Content-Type': 'text/html' }); response.end(html); return; }
        const path = resolve(root, `.${pathname}`);
        if (!path.startsWith(root.endsWith(sep) ? root : root + sep)) { response.writeHead(403).end(); return; }
        const body = await readFile(path);
        response.writeHead(200, { 'Content-Type': extname(path) === '.css' ? 'text/css' : extname(path) === '.json' ? 'application/json' : 'text/javascript' }); response.end(body);
    } catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const errors = []; page.on('pageerror', error => errors.push(error.message));
const session = await page.context().newCDPSession(page); await session.send('Performance.enable');
const metrics = async () => Object.fromEntries((await session.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
const rows = [];
const lodStyle = `
.pc-lod-probe .pc-native-pin-label,.pc-lod-probe .pc-native-icon,.pc-lod-probe .pc-node-body,.pc-lod-probe .pc-host-result{visibility:hidden!important}
.pc-lod-probe .pc-node:not(.pc-selected){box-shadow:none!important}
.pc-lod-probe-wires .pc-wire-label{display:none!important}
`;
const percentile=(values,p)=>values.toSorted((a,b)=>a-b)[Math.min(values.length-1,Math.floor(values.length*p))];
async function traceStop(){const done=new Promise(resolve=>session.once('Tracing.tracingComplete',resolve));await session.send('Tracing.end');const {stream}=await done;let data='';for(;;){const part=await session.send('IO.read',{handle:stream});data+=part.data;if(part.eof)break;}await session.send('IO.close',{handle:stream});const events=JSON.parse(data).traceEvents;const sum=name=>events.filter(e=>e.name===name&&e.ph==='X').reduce((a,e)=>a+(e.dur||0)/1000,0);return {paintMs:sum('Paint'),rasterMs:sum('RasterTask'),prePaintMs:sum('PrePaint')};}
try {
 await page.goto(`http://127.0.0.1:${server.address().port}`);await page.waitForFunction(()=>!!window.bench);await page.addStyleTag({content:lodStyle});
 for(const size of [100,300,500])for(const theme of ['ember','neon']){
  const setup=await page.evaluate(async ({size,theme})=>{
   const b=window.bench,c=b.canvas;c.cancelGesture();b.theme.setPreset(theme);c.host.classList.remove('pc-lod-probe','pc-lod-probe-wires');
   const cols=Math.ceil(Math.sqrt(size*1440*160/(900*220)));
   const g={id:'benchmark',name:'Benchmark',schema:3,runtime:2,mode:'native-pre',roles:{},portals:{},definitions:{},nodes:{},wires:{},groups:{},view:{x:20,y:20,zoom:.25}};
   for(let i=0;i<size;i++){g.nodes['n'+i]={...b.operationDefaults('compose'),id:'n'+i,type:'workflow',operation:'compose',operationVersion:1,enabled:true,title:'Compose text '+i,outputKind:'text',sections:Array.from({length:4},(_,j)=>({name:'Input'+j,text:'Text'})),x:(i%cols)*220,y:Math.floor(i/cols)*160};if(i>0)g.wires['w'+i]={id:'w'+i,route:'wire',from:'n'+(i-1),fromPort:'out',to:'n'+i,toPort:'section.Input0'};}
   const start=performance.now();c.setGraph(b.prepare(g));c.host.classList.add('pc-interacting');await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const renderMs=performance.now()-start;
   const box=c.host.getBoundingClientRect(),nodes=[...c.nodeLayer.querySelectorAll('.pc-node')];const visible=nodes.filter(n=>{const r=n.getBoundingClientRect();return r.right>box.left&&r.left<box.right&&r.bottom>box.top&&r.top<box.bottom;}).length;
   const geometry=nodes.slice(0,5).map(n=>{const r=n.getBoundingClientRect();return {w:r.width,h:r.height,pins:[...n.querySelectorAll('.pc-port')].map(p=>{const q=p.getBoundingClientRect();return [q.x-r.x,q.y-r.y];})};});
   return {renderMs,visible,nodes:nodes.length,ports:c.nodeLayer.querySelectorAll('.pc-port').length,wires:c.svg.querySelectorAll('.pc-wire').length,elements:c.viewport.querySelectorAll('*').length,geometry};
  },{size,theme});
  for(let repeat=0;repeat<2;repeat++)for(const mode of repeat?['full-lod','node-lod','baseline']:['baseline','node-lod','full-lod']){
   const switchInfo=await page.evaluate(async ({mode,geometry})=>{const c=window.bench.canvas;c.host.classList.toggle('pc-lod-probe',mode!=='baseline');c.host.classList.toggle('pc-lod-probe-wires',mode==='full-lod');Object.assign(c.view,{x:20,y:20,zoom:.25});c.applyTransform();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const actual=[...c.nodeLayer.querySelectorAll('.pc-node')].slice(0,5).map(n=>{const r=n.getBoundingClientRect();return {w:r.width,h:r.height,pins:[...n.querySelectorAll('.pc-port')].map(p=>{const q=p.getBoundingClientRect();return [q.x-r.x,q.y-r.y];})};});return {geometryRetained:actual.every((r,i)=>Math.abs(r.w-geometry[i].w)<.01&&Math.abs(r.h-geometry[i].h)<.01&&r.pins.every((p,j)=>p.every((v,k)=>Math.abs(v-geometry[i].pins[j][k])<.01))),actual,expected:geometry};},{mode,geometry:setup.geometry});
   if(!switchInfo.geometryRetained)throw Error('Geometry changed: '+size+' '+mode+' '+JSON.stringify(switchInfo));
   const tracing=size>=500&&repeat===1;
   if(tracing)await session.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline,cc',transferMode:'ReturnAsStream'});
   const before=await metrics();
   const sample=await page.evaluate(async ()=>{const b=window.bench,c=b.canvas,intervals=[],handlers=[];const calls=b.calls();let prev;const node=c.nodeLayer.firstElementChild,wire=c.svg.querySelector('.pc-wire');for(let i=0;i<90;i++){const t=await new Promise(r=>requestAnimationFrame(r));if(prev!==undefined)intervals.push(t-prev);prev=t;const start=performance.now();const wave=(1-Math.cos(i*Math.PI/30))/2;c.view.zoom=.25+wave*.025;c.view.x=20+wave*16;c.view.y=20+wave*10;c.applyTransform();handlers.push(performance.now()-start);}await new Promise(r=>requestAnimationFrame(r));return {intervals,handlers,preparationRuns:b.calls().preparationRuns-calls.preparationRuns,nodeIdentityRetained:c.nodeLayer.contains(node),wireIdentityRetained:c.svg.contains(wire)};});
   const after=await metrics(),trace=tracing?await traceStop():{};
   const row={size,theme,mode,repeat,tracing,visible:setup.visible,elements:setup.elements,ports:setup.ports,wires:setup.wires,renderMs:setup.renderMs,geometryRetained:switchInfo.geometryRetained,frameMedianMs:percentile(sample.intervals,.5),frameP95Ms:percentile(sample.intervals,.95),framesOver25:sample.intervals.filter(t=>t>25).length,frameSamples:sample.intervals.length,handlerMedianMs:percentile(sample.handlers,.5),handlerP95Ms:percentile(sample.handlers,.95),taskMs:(after.TaskDuration-before.TaskDuration)*1000,layoutMs:(after.LayoutDuration-before.LayoutDuration)*1000,styleMs:(after.RecalcStyleDuration-before.RecalcStyleDuration)*1000,...trace,preparationRuns:sample.preparationRuns,nodeIdentityRetained:sample.nodeIdentityRetained,wireIdentityRetained:sample.wireIdentityRetained};
   for(const key in row)if(typeof row[key]==='number')row[key]=Math.round(row[key]*100)/100;rows.push(row);console.log(JSON.stringify(row));
  }
 }
 const browserSession=await browser.newBrowserCDPSession();const info=await browserSession.send('SystemInfo.getInfo');
 await writeFile(new URL('./canvas-lod-results.json', import.meta.url),JSON.stringify({commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),browser:await browser.version(),gpu:info.gpu.devices,viewport:{width:1440,height:900},zoom:[.25,.275],scope:'Real mounted Svelte Workbench, four input Compose cards, chain wires, controlled camera transform each rAF with actual pc-interacting compositor hint, 90 frames, two repeats in reversed order; CPU unthrottled; CSS-only simplification retains DOM and dimensions.',errors,rows},null,2));
 if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();await new Promise(r=>server.close(r));}
