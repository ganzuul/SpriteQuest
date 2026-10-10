import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { installMock } from './mock.js';
installMock();
const S = await import('../src/state.js?v=0.26.0');
const source = await readFile(new URL('../src/ui/controller.js', import.meta.url), 'utf8');
function actual(name, env) {
    const start = source.indexOf('function '+name+'('), end = source.indexOf('\nfunction ', start+1);
    assert.ok(start >= 0);
    return Function('env', 'with(env){'+(source.slice(start-6,start)==='async '?'async ':'')+source.slice(start,end<0?undefined:end)+';return '+name+';}')(env);
}
function fixture() {
    const original = S.createGraph('Z current'); S.settings().activeGraphId = original.id;
    const env = { ...S, current: original, uiEpoch: 1, canvas: null, pendingNewWorkflow: null, hasUnsavedWorkflowChanges: () => false, isOpen: () => true, inputBox: async () => 'A new', confirmBox: async () => true, renderAll() {}, toast() {}, setCanvasGraph() { assert.equal(S.settings().activeGraphId, env.current.id); } };
    env.stillEditing = actual('stillEditing', env);
    return env;
}
test('New and Duplicate persist the newly opened current root', async () => {
    for (const name of ['onNewGraph','onDuplicateGraph']) {
        const env = fixture(), previous = env.current; await actual(name,env)();
        assert.notEqual(env.current,previous); assert.equal(S.resolveGraph().graph,env.current);
    }
});
test('Delete activates the exact surviving root selected by current state', async () => {
    const env = fixture(); S.createGraph('A alphabetically earlier');
    await actual('onDeleteGraph',env)(); assert.equal(S.resolveGraph().graph,env.current);
});
test('captured New continuation cannot switch roots after the active view changes', async () => {
    const env = fixture(), count = S.allGraphs().length; let finish;
    env.hasUnsavedWorkflowChanges = () => true;
    env.requestNewWorkflowChoice = () => new Promise(resolve => { finish=resolve; }); const pending = actual('onNewGraph',env)();
    env.uiEpoch++; finish('discard'); await pending; assert.equal(S.allGraphs().length,count);
});
test('Import persists the actual newly opened root after the captured file read', async () => {
    const env = fixture(), text = S.exportGraph(env.current.id); let change;
    const input = { files: [{ name:'current.workflow.json', text:async()=>text }], addEventListener(_name,handler) { change=handler; }, click(){} };
    env.document = { createElement:()=>input }; actual('onImportGraph',env)(); await change();
    assert.equal(S.resolveGraph().graph,env.current);
});
