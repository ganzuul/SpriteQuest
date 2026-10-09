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
    const source=await readFile(new URL('../ui/WorkflowSetup.svelte',import.meta.url),'utf8'),output=compile(source,{filename:'WorkflowSetup.svelte',generate:'client',css:'injected'});
    const code=output.js.code.replace(/(['"])(svelte(?:\/[^'"]*)?)\1/g,(_,quote,specifier)=>JSON.stringify(specifier==='svelte'?clientURL:import.meta.resolve(specifier)));
    const file=join(directory,'surface.mjs');await writeFile(file,code);const component=(await import(pathToFileURL(file).href)).default;
    const mounted=mount(component,{target:host,props:{actions:{workflowSetup:actions},view}});flushSync();
    return {host,update(next){view=next;flushSync();},async close(){await unmount(mounted);host.remove();const rel=relative(resolve(tmpdir()),resolve(directory));assert.ok(rel&&!rel.startsWith('..')&&!isAbsolute(rel));await rm(directory,{recursive:true,force:true});}};
}
const { starterGraph } = await import('../src/workflow/starters.js?v=0.22.0');
const { prepareWorkflowProjection, projectPreparedWorkflow } = await import('../src/ui/workflow-surface.js?v=0.22.0');
test('actual Setup lists all eight current examples and forwards a selected installation without arming',async()=>{
    const graph=starterGraph('structured-guidance'), view=projectPreparedWorkflow(prepareWorkflowProjection(graph)),calls=[];
    const f=await fixture(view,{install:id=>calls.push(['install',id]),assign:phase=>calls.push(['assign',phase]),bindRole(){}});
    try { assert.equal(f.host.querySelector('select[aria-label="Workflow mode"]'),null);assert.equal(f.host.querySelectorAll('.pc-workflow-starter').length,8);assert.match(f.host.textContent,/Maximum 0 auxiliary requests/);assert.match(f.host.textContent,/Arming is a separate action/);
        [...f.host.querySelectorAll('button')].find(button=>button.textContent==='Install Structured guidance').click();flushSync();assert.deepEqual(calls,[['install','structured-guidance']]);
        [...f.host.querySelectorAll('button')].find(button=>button.textContent==='Assign pre phase').click();flushSync();assert.deepEqual(calls.at(-1),['assign','pre']);
    } finally {await f.close();}
});
test('actual Setup role controls pass explicit local profile choices',async()=>{
    const graph=starterGraph('native-guidance'),view=projectPreparedWorkflow(prepareWorkflowProjection(graph,{profiles:[{id:'local',name:'Local profile'}]})),calls=[];
    const f=await fixture(view,{install(){},assign(){},bindRole:(...args)=>calls.push(args)});
    try {const select=f.host.querySelector('[aria-label="Analysis connection"]');assert.ok(select);select.value='local';select.dispatchEvent(new window.Event('change',{bubbles:true}));flushSync();assert.equal(calls[0][0],'Analysis');assert.equal(calls[0][1],'local');}finally{await f.close();}
});
