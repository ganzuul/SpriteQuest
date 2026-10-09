import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compile } from 'svelte/compiler';
import { JSDOM } from 'jsdom';
const dom=new JSDOM('<!doctype html><body></body>',{pretendToBeVisual:true});
globalThis.window=dom.window;globalThis.document=dom.window.document;
for(const key of ['Node','Element','Text','Comment','Document','HTMLElement','HTMLButtonElement','HTMLInputElement','HTMLSelectElement','MutationObserver'])Object.defineProperty(globalThis,key,{configurable:true,value:dom.window[key]});
const clientURL=new URL('../node_modules/svelte/src/index-client.js',import.meta.url).href;
const {mount,unmount,flushSync}=await import(clientURL);
async function fixture(view,actions,mode='setup') {
    const directory=await mkdtemp(join(tmpdir(),'lattice-workflow-surface-')),host=document.createElement('div');document.body.append(host);
    const source=await readFile(new URL('../ui/WorkflowSurface.svelte',import.meta.url),'utf8'),output=compile(source,{filename:'WorkflowSurface.svelte',generate:'client',css:'injected'});
    const code=output.js.code.replace(/(['"])(svelte(?:\/[^'"]*)?)\1/g,(_,quote,specifier)=>JSON.stringify(specifier==='svelte'?clientURL:import.meta.resolve(specifier)));
    const file=join(directory,'surface.mjs');await writeFile(file,code);const component=(await import(pathToFileURL(file).href)).default;
    const mounted=mount(component,{target:host,props:{actions,mode}});mounted.update(view);flushSync();
    return {host,update(next){mounted.update(next);flushSync();},async close(){await unmount(mounted);host.remove();const rel=relative(resolve(tmpdir()),resolve(directory));assert.ok(rel&&!rel.startsWith('..')&&!isAbsolute(rel));await rm(directory,{recursive:true,force:true});}};
}
const selector={handleId:'opaque',runId:'review',terminal:{kind:'terminal',address:{workflowId:'root',instancePath:[],nodeId:'apply'}}};
const base=()=>({graphId:'root',name:'Review',native:true,phase:'post',workflowMode:'native',assigned:false,selectedId:null,roles:[],profiles:[],starters:[],families:[],nodes:[],groups:[],callBound:0,issues:[],busy:false,status:'',quoteHelp:'',result:null});
test('bounded result bridge renders actual diagnostic format and forwards only the explicit selector',async()=>{
    const calls=[],view={...base(),availability:'superseded',preparationError:{code:'PREP',message:'New preparation failed'},result:{kind:'bounded',ok:true,error:'',actualCalls:0,callBound:0,runId:'review',sections:[{kind:'candidate',format:'json-prefix-text',text:'{"prefix":"kept',truncated:true},{kind:'text',format:'omitted',text:'Artifact omitted: recording-byte-limit',truncated:false}],tokenMethods:[],applyAvailable:true,selectedReviewHandle:selector,applyIssue:''}};
    const f=await fixture(view,{apply:value=>calls.push(value),reject(){},run(){},assign(){}});
    try {
        assert.match(f.host.textContent,/New preparation failed/);assert.match(f.host.textContent,/Retained diagnostic: superseded/);assert.match(f.host.textContent,/Diagnostic preview truncated/);assert.match(f.host.textContent,/Artifact omitted: recording-byte-limit/);
        assert.equal(f.host.querySelector('pre').textContent,'{"prefix":"kept');assert.equal(f.host.textContent.includes('Reports and request trace'),false);
        const apply=[...f.host.querySelectorAll('button')].find(button=>button.textContent==='Apply selected reviewed terminal');apply.click();flushSync();assert.equal(calls.length,1);assert.equal(calls[0],selector);
        f.update({...view,result:{...view.result,applyAvailable:false,selectedReviewHandle:null}});assert.equal([...f.host.querySelectorAll('button')].some(button=>button.textContent.includes('Apply selected')),false);
    } finally {await f.close();}
});
test('zero-call library labels show empty roles and legacy result retains its existing Apply callback',async()=>{
    const library=await fixture({...base(),starters:[{id:'zero',title:'Zero-call',purpose:'Local tools',phase:'pre',roles:[],callBound:0}]},{install(){},setMode(){}},'library');
    try {assert.match(library.host.textContent,/Roles: None.*Maximum 0 auxiliary requests/);}finally{await library.close();}
    const calls=[],legacy=await fixture({...base(),result:{kind:'legacy',ok:true,error:'',actualCalls:0,callBound:1,guidance:'',original:'Before',candidate:'After',findings:[],changes:[],reports:[],calls:[],tokenMethods:[],applyAvailable:true,applyIssue:''}},{apply:(...args)=>calls.push(args),reject(){},run(){},assign(){}});
    try {assert.match(legacy.host.textContent,/Before/);[...legacy.host.querySelectorAll('button')].find(button=>button.textContent==='Apply reviewed candidate').click();assert.deepEqual(calls,[[]]);}finally{await legacy.close();}
});
