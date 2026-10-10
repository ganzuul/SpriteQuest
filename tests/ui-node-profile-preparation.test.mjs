import test from 'node:test';
import assert from 'node:assert/strict';
import { starterGraph } from '../src/workflow/starters.js?v=0.27.0';
import { createGraphViewSession } from '../src/ui/graph-view-session.js?v=0.27.0';
import { projectPreparedWorkflow } from '../src/ui/workflow-surface.js?v=0.27.0';
import * as api from '../src/ui/workspace-preparation.js?v=0.27.0';
const activeId = 'lattice:active-sillytavern';
const profiles = [{ id: 'saved', name: 'Reasoning connection', api: 'openai', apiLabel: 'OpenAI', model: 'profile-model', endpoint: 'private-url', provider: 'private-route', secret: 'private-key' }];
function fixture(root, options = {}) {
    const prepared = api.prepareWorkspaceViews(root, { profiles, activeModel: { api: 'openai', apiLabel: 'OpenAI', model: 'host-model' }, ...options });
    assert.equal(prepared.ok, true, JSON.stringify(prepared));
    const session = createGraphViewSession({ root, activationId: 'profiles', ...prepared.data }).data;
    return { prepared: prepared.data, session, view: () => projectPreparedWorkflow(prepared.data.workflow, { viewPath: session.readEditor().view.identity.instancePath ?? [] }), rows: () => api.projectNodeProfiles(session.readEditor(), projectPreparedWorkflow(prepared.data.workflow, { viewPath: session.readEditor().view.identity.instancePath ?? [] }), 'profiles:7') };
}
function rootFixture() {
    const root = structuredClone(starterGraph('native-guidance')); root.id = 'profile-root';
    root.nodes['response-plan'].profileId = 'saved'; root.nodes['response-plan'].model = 'node-model';
    return root;
}
test('prepared per-node controls expose only safe current profile metadata and qualified unselected addresses', () => {
    assert.equal(typeof api.projectNodeProfiles, 'function');
    const root = rootFixture(), before = structuredClone(root), f = fixture(root);
    const rows = f.rows(), plan = rows.find(row => row.id === 'response-plan');
    assert.equal(plan.value, 'saved'); assert.equal(plan.label, 'Reasoning connection'); assert.equal(plan.model, 'node-model');
    assert.equal(plan.editable, true);
    assert.deepEqual(plan.selection, { selectionKey: JSON.stringify([f.session.readEditor().view.key, 'response-plan']), revision: 'profiles:7', address: { workflowId: root.id, instancePath: [], nodeId: 'response-plan' } });
    assert.equal(f.session.readEditor().view.selection.primary, null);
    assert.deepEqual(plan.options, [{ value: activeId, label: 'Active SillyTavern model', apiLabel: 'OpenAI', model: 'host-model', active: true }, { value: 'saved', label: 'Reasoning connection', apiLabel: 'OpenAI', model: 'profile-model', active: false }]);
    assert.ok(!JSON.stringify(rows).includes('private-'));
    assert.ok(!rows.some(row => root.nodes[row.id].operation === 'scene-context'));
    assert.deepEqual(root, before);
});
test('model metadata remains detectable when completion-policy rejects execution and missing profiles stay unavailable', () => {
    const root = rootFixture(); delete root.nodes['response-plan'].model;
    const f = fixture(root, { resolveBinding: () => ({ ok: false, error: { message: 'Completion evidence unavailable' } }) });
    assert.equal(f.rows().find(row => row.id === 'response-plan').model, 'profile-model');
    root.nodes['response-plan'].profileId = 'missing';
    const missing = fixture(root).rows().find(row => row.id === 'response-plan');
    assert.equal(missing.value, 'missing'); assert.equal(missing.label, 'Unavailable connection · missing'); assert.equal(missing.model, '');
});
test('active metadata refresh respects node model overrides and cached camera/selection projection never resolves again', () => {
    const root = rootFixture(); root.nodes['response-plan'].profileId = activeId;
    let resolves = 0;
    const f = fixture(root, { resolveBinding: () => { resolves++; return { ok: false, error: { message: 'Unavailable' } }; } });
    const before = resolves;
    for (let i = 0; i < 5; i++) { f.session.updateView({ camera: { x: i, y: i, zoom: 1.1 }, selection: { primary: { kind: 'node', id: 'response-plan' }, multi: [] } }); assert.equal(f.rows().find(row => row.id === 'response-plan').model, 'node-model'); }
    assert.equal(resolves, before);
    delete root.nodes['response-plan'].model;
    assert.equal(fixture(root).rows().find(row => row.id === 'response-plan').model, 'host-model');
    assert.equal(fixture(root, { activeModel: { api: 'openai', apiLabel: 'OpenAI', model: 'changed-model' } }).rows().find(row => row.id === 'response-plan').model, 'changed-model');
});
test('model-free operation mode hides its control and readonly library nodes use detached profile metadata', async () => {
    const root = rootFixture();
    root.nodes['smart-compactor'].method = 'select';
    assert.ok(!fixture(root).rows().some(row => row.id === 'smart-compactor'));
    const { siblingWorkflow } = await import('./fixtures/workflow-prepared-fixture.mjs');
    const shared = siblingWorkflow(), f = fixture(shared);
    f.session.openInstance(['first/path']);
    const row = f.rows().find(row => row.id === 'work');
    assert.equal(row.editable, true); assert.deepEqual(row.selection.address.instancePath, ['first/path']);
    const library = api.prepareLibraryViews(shared.id, shared.definitions); assert.equal(library.ok, true);
    const librarySession = createGraphViewSession({ root: shared, activationId: 'library', preparedViews: [...f.prepared.preparedViews, ...library.data.preparedViews], navigation: [...f.prepared.navigation, ...library.data.navigation] }).data;
    assert.equal(librarySession.openLibrary(library.data.preparedViews[0].definitionRef).ok, true);
    const readonly = api.projectNodeProfiles(librarySession.readEditor(), f.view(), 'library:1').find(row => row.id === 'work');
    assert.equal(readonly.editable, false); assert.equal(readonly.selection.address.kind, 'library');
});

test('imported wand helpers can select Active with no saved profiles and library views retain the choice',async()=>{
 const {installWorkflowExample}=await import('../src/workflow/examples.js?v=0.27.0');
 const installed=installWorkflowExample('unified-broken-wand',{graphs:{},nativeBindings:{workflowGraphId:null},enabled:false});
 assert.equal(installed.ok,true,JSON.stringify(installed));
 const root=installed.data.graph, prepared=api.prepareWorkspaceViews(root,{profiles:[],activeModel:{apiLabel:'Host API',model:'host-model'}});
 assert.equal(prepared.ok,true,JSON.stringify(prepared));
 const roles=prepared.data.preparedViews.flatMap(view=>Object.values(view.drawBase.iterationBindings??{}).flatMap(bindings=>bindings.roles));
 assert.ok(roles.some(row=>row.role==='decision'));assert.ok(roles.some(row=>row.role==='effectAuthor'));
 for(const role of roles)assert.deepEqual(role.profile.options,[{value:activeId,label:'Active SillyTavern model'}]);
 const library=api.prepareLibraryViews(root.id,root.definitions);assert.equal(library.ok,true);
 for(const view of library.data.preparedViews)for(const bindings of Object.values(view.drawBase.iterationBindings??{}))for(const role of bindings.roles)assert.deepEqual(role.profile.options,[{value:activeId,label:'Active SillyTavern model'}]);
});
