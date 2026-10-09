import test from 'node:test';
import assert from 'node:assert/strict';
import { starterGraph } from '../src/workflow/starters.js?v=0.19.1';
import { normalizeNativeGraph } from '../src/workflow/migration.js?v=0.19.1';
import { createGraphViewSession } from '../src/ui/graph-view-session.js?v=0.19.1';
import { createWorkflowSession, projectPreparedWorkflow } from '../src/ui/workflow-surface.js?v=0.19.1';
const api = await import('../src/ui/workspace-preparation.js?v=0.19.1').catch(() => ({}));
test('prepared editor drawing is detached and overlays never change the activated root', async () => {
    assert.equal(typeof api.prepareWorkspaceViews, 'function');
    const root = normalizeNativeGraph(starterGraph('native-guidance')).data; root.id = 'workspace-root';
    let bindings = 0;
    const prepared = api.prepareWorkspaceViews(root, { resolveBinding: () => { bindings++; return { ok: true, data: { profileId: 'cached', model: 'cached-model' } }; } });
    assert.equal(prepared.ok, true, JSON.stringify(prepared));
    const count = bindings, before = structuredClone(root);
    const views = createGraphViewSession({ root, activationId: 'active', ...prepared.data }).data;
    views.updateView({ camera: { x: 99, y: 88, zoom: 1.5 }, nodePresentation: { 'response-plan': { alias: 'Plan', compact: true, x: 17, y: 18 } } });
    const drawing = api.projectEditorDraw(views.readEditor());
    assert.equal(drawing.id,root.id);assert.deepEqual(drawing.view, { x: 99, y: 88, zoom: 1.5 }); assert.equal(drawing.nodes['response-plan'].presentation.alias, 'Plan');
    drawing.nodes['response-plan'].instructions = 'draw graph is never a draft';
    assert.deepEqual(root, before); assert.equal(bindings, count);
    const view = projectPreparedWorkflow(prepared.data.workflow, { selectedId: 'response-plan' }); assert.equal(view.nodes.find(n => n.id === 'response-plan').effective, 'cached · cached-model'); assert.equal(bindings, count);
    let settle, cancelled = 0, state;
    const runtime = { runPre: async actual => { assert.equal(actual, root); return new Promise(resolve => { settle = resolve; }); }, cancel: () => { cancelled++; } };
    const execution = createWorkflowSession({ runtime: () => runtime, rootCurrent: () => root, runEpoch: () => 7, active: () => true, changed: next => { state = next; } });
    const running = execution.run();
    views.updateView({ camera: { x: 1, y: 2, zoom: 0.7 } }); views.focusView(views.project().graphViews.active.key);
    settle({ ok: true, schema: 3, mode: 'root', actualCalls: 0 }); await running;
    assert.equal(state.result.ok, true); assert.equal(state.busy, false); assert.equal(cancelled, 0); assert.equal(bindings, count);
});

test('library inspection uses a real definition inventory and exposes no runtime addresses', async () => {
    assert.equal(typeof api.prepareLibraryViews, 'function');
    const { nestedWorkflow } = await import('./fixtures/workflow-prepared-fixture.mjs');
    const root = nestedWorkflow(), before = structuredClone(root), definitions = root.definitions;
    const result = api.prepareLibraryViews(root.id, definitions); assert.equal(result.ok,true,JSON.stringify(result));
    for (const view of result.data.preparedViews) { assert.equal(view.identity.kind,'library');assert.equal(view.readOnly,true);assert.deepEqual(view.identity.definitionRef,view.definitionRef);assert.equal(view.savedGraph.id,undefined);assert.ok(view.ports.every(port=>!Object.hasOwn(port,'address'))); }
    const outer = result.data.preparedViews.find(view=>view.definitionRef.id==='prepared-outer');
    assert.ok(outer.drawBase.nativeCards.entry.ports.some(port=>port.kind==='context'));
    assert.ok(outer.drawBase.nativeCards.work.ports.some(port=>port.port==='proposal'));
    const nested = result.data.preparedViews.find(view=>view.definitionRef.id==='prepared-plan');assert.ok(nested);
    assert.deepEqual(root,before);
});

test('not-run meter uses cached checked root rows before events without a second planner or host read',()=>{
 const root=normalizeNativeGraph(starterGraph('structured-guidance')).data;root.id='idle-root';let bindings=0;const prepared=api.prepareWorkspaceViews(root,{resolveBinding:()=>{bindings++;return {ok:true,data:{}};}});assert.equal(prepared.ok,true);const count=bindings;
 assert.ok(prepared.data.idleRunRows.length>0);assert.ok(prepared.data.idleRunRows.every(row=>row.status==='not-run'));assert.equal(prepared.data.idleRunRows.reduce((sum,row)=>sum+row.executableCount,0),Object.values(root.nodes).length);assert.equal(bindings,count);
});


// Execute the actual bounded controller functions, with real accepted Canvas/store/domain APIs.
// Only external UI notifications are replaced; the function bodies are read from current source.
const controllerText=await(await import('node:fs/promises')).readFile(new URL('../src/ui/controller.js',import.meta.url),'utf8');
function controllerFunction(name,env){const start=controllerText.indexOf('function '+name+'(');assert.ok(start>=0,'Actual controller function '+name);const next=controllerText.indexOf('\nfunction ',start+1);const source=controllerText.slice(start,next<0?undefined:next);return Function('env','with(env){'+source+';return '+name+';}')(env);}
async function restoreFixture(){
 const {siblingWorkflow}=await import('./fixtures/workflow-prepared-fixture.mjs');const root=siblingWorkflow(),prepared=api.prepareWorkspaceViews(root),session=createGraphViewSession({root,activationId:'restore',...prepared.data}).data;const env={current:root,graphViews:session,editorDraw:null,selected:null,selectedKind:null,restoringEditor:false,selectedPreview:null,canvasTraceRows:null,cancelImportReview(){},replaceNativeBridge(){},syncPaneToggles(){},updateWorkflowProjection(){},paintHistory(){},workbench:{update(){}}};
 const {fixture}=await import('./canvas-fixture.mjs');const real=fixture({nativeCard:node=>env.editorDraw?.nativeCards[node.id],nativeScope:()=>({workflowId:root.id,instancePath:session.readEditor().view.identity.instancePath??[],readOnly:session.readEditor().readOnly}),canEdit:()=>!session.readEditor().readOnly});env.canvas=real.canvas;env.root=document.createElement('div');env.projectEditorDraw=api.projectEditorDraw;const restore=controllerFunction('activateEditorDraw',env);env.activate=()=>{restore();for(const node of Object.values(env.editorDraw.nodes))real.canvas.geometry.measure(node.id,160,48,env.editorDraw.nativeCards[node.id]?.ports.map(pin=>({id:pin.port,direction:pin.dir,x:pin.dir==='in'?0:160,y:24,side:pin.side,kind:pin.kind}))??[]);real.canvas.render();};return {...env,env,session,real};
}
test('actual controller roundtrip preserves primary node wire and supported ephemeral cable paint',async()=>{
 const {env,session,real}=await restoreFixture();try{
 session.updateView({selection:{primary:{kind:'node',id:'source'},multi:[]}});env.activate();assert.deepEqual(real.canvas.selection,{kind:'node',id:'source'});assert.ok(real.host.querySelector('.pc-node[data-id="source"]').classList.contains('pc-selected'));
 session.openInstance(['first/path']);env.activate();session.focusView(session.project().graphViews.tabs[0].key);env.activate();assert.deepEqual(real.canvas.selection,{kind:'node',id:'source'});assert.deepEqual(session.readEditor().view.selection.primary,real.canvas.selection);
 session.updateView({selection:{primary:{kind:'wire',id:'a'},multi:[]}});env.activate();real.canvas.wireMulti.add('b');real.canvas.render();session.openInstance(['first/path']);env.activate();session.focusView(session.project().graphViews.tabs[0].key);env.activate();assert.deepEqual(real.canvas.selection,{kind:'wire',id:'a'});assert.deepEqual([...real.canvas.wireMulti].sort(),['a','b']);assert.deepEqual([...real.host.querySelectorAll('.pc-wire.pc-selected')].map(edge=>edge.dataset.id).sort(),['a','b']);
 }finally{await real.canvas.destroy();real.host.remove();}
});

test('Edit availability uses the actual child saved scope and readonly library permission',async()=>{
 const {siblingWorkflow}=await import('./fixtures/workflow-prepared-fixture.mjs');const root=siblingWorkflow(),saved=structuredClone(Object.values(root.definitions)[0].body);let readOnly=false,last;const canvas={selection:{kind:'node',id:'work'},multi:new Set()},env={current:root,canvas,currentPick:()=>({nodeIds:['work']}),NODE_TYPES:{OUTPUT:'output'},groupMembers:(graph,id)=>Object.values(graph.nodes).filter(node=>node.inGroup===id),graphViews:{readEditor:()=>({prepared:{savedGraph:saved},readOnly,view:{identity:{kind:'instance'}}})},editorDraw:saved,workbench:{update(value){last=value;}}};const update=controllerFunction('updateSelectionCount',env);update();assert.deepEqual(last.selectionActions,{copy:true,cut:true,delete:true});
 root.nodes.entry={id:'entry',type:'workflow',operation:'scene-context'};canvas.selection={kind:'node',id:'entry'};env.currentPick=()=>({nodeIds:['entry']});update();assert.deepEqual(last.selectionActions,{copy:false,cut:false,delete:false});
 canvas.selection={kind:'wire',id:'a'};env.currentPick=()=>null;update();assert.equal(last.selectionActions.delete,true);saved.groups={child:{id:'child'}};canvas.selection={kind:'group',id:'child'};update();assert.equal(last.selectionActions.delete,true);
 readOnly=true;canvas.selection={kind:'node',id:'work'};env.currentPick=()=>({nodeIds:['work']});update();assert.deepEqual(last.selectionActions,{copy:true,cut:false,delete:false});
});

test('nested library Copy bundles only its real reachable pin closure and actual insertion accepts it',async()=>{
 const {nestedWorkflow}=await import('./fixtures/workflow-prepared-fixture.mjs');const source=nestedWorkflow(),root=starterGraph('structured-guidance'),content=api.prepareWorkspaceViews(root),library=api.prepareLibraryViews(root.id,source.definitions);const session=createGraphViewSession({root,activationId:'library-copy',navigation:[...content.data.navigation,...library.data.navigation],preparedViews:[...content.data.preparedViews,...library.data.preparedViews]}).data;session.openLibrary(library.data.preparedViews.find(view=>view.definitionRef.id==='prepared-outer').definitionRef);const packages=await import('../src/workflow/packages.js?v=0.19.1'),{definitionRefKey}=await import('../src/workflow/definition-data.js?v=0.19.1'),{prepareWorkflowInsertion}=await import('../src/workflow/insertion.js?v=0.19.1');const env={current:root,graphViews:session,editorDraw:api.projectEditorDraw(session.readEditor()),workspacePrepared:{libraryDefinitions:source.definitions},selectSubgraphClosure:packages.selectSubgraphClosure,definitionRefKey};const fragment=controllerFunction('makeNativeFragment',env)({nodeIds:['work']});assert.ok(fragment);assert.equal(Object.keys(fragment.definitions).length,1);assert.ok(fragment.definitions[definitionRefKey(fragment.nodes.work.definition)]);assert.equal(fragment.nodes.work.localCopy,undefined);assert.deepEqual(root.definitions,{});const inserted=prepareWorkflowInsertion(root,fragment);assert.equal(inserted.ok,true,JSON.stringify(inserted));const conflict=structuredClone(root);conflict.definitions[definitionRefKey(fragment.nodes.work.definition)]={...fragment.definitions[definitionRefKey(fragment.nodes.work.definition)],body:{...fragment.definitions[definitionRefKey(fragment.nodes.work.definition)].body,nodes:{...fragment.definitions[definitionRefKey(fragment.nodes.work.definition)].body.nodes,work:{...fragment.definitions[definitionRefKey(fragment.nodes.work.definition)].body.nodes.work,instructions:'Conflicting canonical settings'}}}};assert.equal(prepareWorkflowInsertion(conflict,fragment).ok,false);
});

test('native Cut waits for a successful write and rejects failure or a stale qualified continuation',async()=>{
 const {toClipboard,fromClipboard}=await import('../src/clip.js?v=0.19.1');let writes=0,deletes=0,notes=[],toasts=[],resolveWrite,current=true;const env={graphViews:{},currentPick:()=>({nodeIds:['work']}),makeNativeFragment:()=>({schema:3,runtime:2,mode:'native-pre',nodes:{work:{id:'work',type:'workflow',operation:'compose'}},wires:{},groups:{}}),captureEditor:()=>({ok:true,data:{captured:true}}),editorCurrent:()=>current,toClipboard,deleteNativeSelection:async(selection,capture)=>{assert.ok(capture?.captured,'Deletion must retain the pre-write qualified token');deletes++;return true;},flashHistoryNote:note=>notes.push(note),toast:message=>toasts.push(message)};const copy=controllerFunction('copySelection',env);const older={latticeClip:1,nodes:[{id:'older',type:'prompt',title:'older'}],wires:[],groups:[],origin:{x:0,y:0}};Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{writeText:async()=>{writes++;throw new Error('denied');},readText:async()=>JSON.stringify(older)}}});assert.equal(await copy(true),false);assert.equal(deletes,0);assert.equal(notes.length,0);assert.ok(toasts[0].includes('not cut'));assert.equal((await fromClipboard()).nodes[0].id,'older');
 navigator.clipboard.writeText=()=>new Promise(resolve=>{resolveWrite=resolve;});const pending=copy(true);await Promise.resolve();assert.equal(deletes,0);current=false;resolveWrite();assert.equal(await pending,false);assert.equal(deletes,0);
 current=true;navigator.clipboard.writeText=async()=>{};assert.equal(await copy(true),true);assert.equal(deletes,1);assert.ok(notes[0].startsWith('Cut '));env.toClipboard=async()=>{throw new Error('rejected');};assert.equal(await copy(true),false);assert.equal(deletes,1);
});


test('actual pin jump uses a current navigation token and an existing prepared opposite pin',async()=>{
 const {env,session,real}=await restoreFixture();try{env.activate();env.editorCurrent=capture=>session.isEditorContextCurrent(capture);const jump=controllerFunction('jumpNativeNode',env),capture=session.captureEditorContext(),target={nodeId:'first/path',portId:'scene',dir:'in'};assert.equal(jump(capture,target),true);assert.deepEqual(real.canvas.selection,{kind:'node',id:'first/path'});assert.equal(jump(capture,{...target,portId:'fabricated'}),false);session.openInstance(['first/path']);env.activate();session.focusView(session.project().graphViews.tabs[0].key);env.activate();assert.equal(jump(capture,target),false,'Away and back cannot revive a retained pin menu');const latest=session.captureEditorContext();delete env.editorDraw.nodes['first/path'];assert.equal(jump(latest,target),false,'Deleted targets cannot be followed');}finally{await real.canvas.destroy();real.host.remove();}
});


test('native plaintext paste uses valid Compose sections and one real root transaction in both phases', async () => {
    const { captureGraphEditContext, commitPreparedGraph } = await import('../src/workflow/transactions.js?v=0.19.1');
    const { prepareNativeConnectionEdit } = await import('../src/workflow/connection-edits.js?v=0.19.1');
    const { composeText } = await import('../src/workflow/operations/compose.js?v=0.19.1');
    const { siblingWorkflow } = await import('./fixtures/workflow-prepared-fixture.mjs');
    const H = await import('../src/history.js?v=0.19.1');
    const text = '  User 🌿\nSecond line: 界\n  ', point = { x: 13.125, y: -7.5 };
    for (const phase of ['pre', 'post']) {
        const root = { id: 'plaintext-root-' + phase, schema: 3, runtime: 2, mode: 'native-' + phase, nodes: {}, wires: {}, groups: {}, portals: {}, definitions: {} };
        const prepared = api.prepareWorkspaceViews(root), library = api.prepareLibraryViews(root.id, siblingWorkflow().definitions);
        assert.equal(prepared.ok, true, JSON.stringify(prepared)); assert.equal(library.ok, true, JSON.stringify(library));
        const created = createGraphViewSession({ root, activationId: 'plaintext-' + phase, navigation: [...prepared.data.navigation, ...library.data.navigation], preparedViews: [...prepared.data.preparedViews, ...library.data.preparedViews] });
        assert.equal(created.ok, true, JSON.stringify(created)); const session = created.data, errors = [];
        let preparations = 0, commits = 0;
        const env = { current: root, graphViews: session, canvas: { pointer: null }, workspaceRevision: 0, editorCaptures: new WeakMap(), isOpen: () => true, readGraphEditContext: () => session.readEditContext(), captureGraphEditContext, graphDocumentHooks: {}, toast: message => errors.push(message), defaultNodeSpot: () => point,
            prepareNativeConnectionEdit(graph, command) { preparations++; return prepareNativeConnectionEdit(graph, command); },
            commitGraphEdit(graph, command) { commits++; return commitPreparedGraph(graph, command); } };
        // Execute the actual paste, private capture/current/path and commit adapters.
        // Only persistence/UI notifications are replaced by the public root commit producer.
        for (const name of ['readNativeClip', 'captureEditor', 'editorCurrent', 'scopeCommand', 'commitCaptured']) env[name] = controllerFunction(name, env);
        const paste = controllerFunction('pasteOnCanvas', env), before = structuredClone(root); H.track(root);
        assert.equal(paste(text, point), true, JSON.stringify(errors));
        assert.equal(preparations, 1); assert.equal(commits, 1);
        const added = Object.values(root.nodes); assert.equal(added.length, 1);
        assert.equal(added[0].operation, 'compose'); assert.equal(added[0].phase, phase);
        assert.equal(added[0].outputKind, phase === 'pre' ? 'guidance' : 'text');
        assert.deepEqual(added[0].sections, [{ name: 'pasted_text', text }]);
        assert.deepEqual({ x: added[0].x, y: added[0].y }, point);
        const composed = composeText({ sections: added[0].sections, separator: added[0].separator });
        assert.equal(composed.ok, true, JSON.stringify(composed)); assert.equal(composed.data.text, text);
        assert.ok(H.undo(root)); assert.deepEqual(root, before); assert.equal(H.undo(root), null, 'Paste creates only one history step');
        assert.equal(paste(' \n\t ', point), false, 'Blank plaintext is not an edit');
        const capture = env.captureEditor(); assert.equal(capture.ok, true);
        session.openLibrary(library.data.preparedViews[0].definitionRef);
        assert.equal(paste(text, point, capture.data), false, 'A captured root cannot retarget a readonly library view');
        assert.equal(paste({ text }, point), false, 'Fresh readonly capture cannot prepare or commit plaintext');
        assert.equal(preparations, 1); assert.equal(commits, 1); assert.deepEqual(root, before);
    }
});
