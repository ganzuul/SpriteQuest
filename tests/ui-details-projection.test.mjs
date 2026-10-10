import test from 'node:test';
import assert from 'node:assert/strict';
import { starterGraph } from '../src/workflow/starters.js?v=0.26.0';
import { createGraphViewSession } from '../src/ui/graph-view-session.js?v=0.26.0';
import { projectPreparedWorkflow } from '../src/ui/workflow-surface.js?v=0.26.0';
import { prepareWorkspaceViews, projectWorkspacePanels } from '../src/ui/workspace-preparation.js?v=0.26.0';
import { computeDefinitionIdentity, definitionRefKey, nodeBindingOverrideKey } from '../src/workflow/definitions.js?v=0.26.0';
import { prepareNativeNodeEdit } from '../src/workflow/definition-library.js?v=0.26.0';

function details(root, id) {
    const prepared = prepareWorkspaceViews(root);
    assert.equal(prepared.ok, true, JSON.stringify(prepared));
    const session = createGraphViewSession({ root, activationId: 'details-projection', ...prepared.data }).data;
    return projectWorkspacePanels(session.readEditor(), projectPreparedWorkflow(prepared.data.workflow, { selectedId: id }), {}, 'revision', null, null).nodeDetails;
}

test('JSON Decode schema projects the actual stored JSON text contract', () => {
    const root = starterGraph('structured-guidance');
    const schema = details(root, 'json-decode').controls.find(control => control.key === 'schema');
    assert.equal(schema.editor, 'json');
    assert.equal(schema.representation, 'json-text');
    assert.equal(schema.allowEmpty, true, 'Empty schema disables schema validation');
    assert.equal(typeof schema.value, 'string');
});

test('Compose shows controls for its active mode and suppresses identical provenance', () => {
    const root = starterGraph('structured-guidance');
    const compose = root.nodes['compose-json'];
    compose.mode = 'join';
    let panel = details(root, compose.id);
    assert.equal(panel.controls.some(control => control.key === 'template'), false);
    assert.equal(panel.controls.find(control => control.key === 'sections').structured, 'sections');
    assert.equal(panel.controls.find(control => control.key === 'separator').group, 'Output');
    assert.equal(panel.controls.some(control => control.effective || control.source), false);
    compose.mode = 'template';
    panel = details(root, compose.id);
    assert.ok(panel.controls.find(control => control.key === 'template'));
    assert.equal(panel.controls.some(control => control.key === 'separator'), false);
});

test('Text modifiers are offered only on eligible output and stay visible on cards', () => {
    const root = starterGraph('structured-guidance');
    root.nodes['compose-json'].modifiers=[{id:'trim',type:'trim',version:1,enabled:true,settings:{edges:'both'}}];
    const panel=details(root,'compose-json');
    assert.equal(panel.modifiers.outputPortId,'out');
    assert.deepEqual(panel.modifiers.options.map(option=>option.type),['trim','whitespace','wrap','replace','unwrap-fence']);
    assert.equal(details(root,'json-decode').modifiers,null);
    const prepared=prepareWorkspaceViews(root);
    assert.equal(prepared.data.preparedViews[0].drawBase.nativeCards['compose-json'].modifierSummary.count,1);
});

test('local modifier preview is explicitly stale and leaves retained output untouched', () => {
    const root = starterGraph('structured-guidance');
    root.nodes['compose-json'].modifiers=[{id:'trim',type:'trim',version:1,enabled:true,settings:{edges:'both'}}];
    const prepared=prepareWorkspaceViews(root), session=createGraphViewSession({root,activationId:'local-preview',...prepared.data}).data;
    const target={workflowId:root.id,instancePath:[],nodeId:'compose-json',portId:'out'};
    const workflow={...projectPreparedWorkflow(prepared.data.workflow,{selectedId:'compose-json'}),result:{ok:true,sections:[{kind:'text',label:'Output',text:'  recorded  ',format:'structured-text',truncated:false,recordedRawText:'  recorded  ',recordedModifierTrace:[]}]}};
    const before=structuredClone(workflow.result);
    const preview=projectWorkspacePanels(session.readEditor(),workflow,{availability:'superseded'},'changed',target,null).outputPreview;
    assert.equal(preview.status,'stale');
    assert.equal(preview.sections.at(-1).text,'recorded');
    assert.equal(preview.sections.at(-1).label,'Local modifier preview · recorded source');
    assert.deepEqual(workflow.result,before);
    const pinned={...target,nodeId:'json-decode',portId:'data'};
    assert.equal(projectWorkspacePanels(session.readEditor(),workflow,{availability:'superseded'},'changed',target,pinned).outputPreview.sections.some(section=>section.label.startsWith('Local modifier')),false);
});

test('complete recorded source remains usable when its rendered preview was truncated', () => {
    const root=starterGraph('structured-guidance');
    root.nodes['compose-json'].modifiers=[{id:'trim',type:'trim',version:1,enabled:true,settings:{edges:'both'}}];
    const prepared=prepareWorkspaceViews(root),session=createGraphViewSession({root,activationId:'long-source',...prepared.data}).data;
    const target={workflowId:root.id,instancePath:[],nodeId:'compose-json',portId:'out'},raw=' '+ '😀'.repeat(35000)+' ';
    const workflow={...projectPreparedWorkflow(prepared.data.workflow,{selectedId:'compose-json'}),result:{ok:true,sections:[{kind:'text',text:'display prefix',format:'structured-text',truncated:true,recordedRawText:raw,recordedModifierTrace:[]}]}};
    const preview=projectWorkspacePanels(session.readEditor(),workflow,{availability:'superseded'},'changed',target,null).outputPreview.sections.at(-1);
    assert.equal(preview.id,'local-modifiers');
    assert.equal(preview.truncated,true);
    assert.ok(new TextEncoder().encode(preview.text).length<=65534);
    assert.ok(preview.text.startsWith('😀'));
});

test('containing instance mode overrides do not hide the effective operation controls', () => {
    const identity=computeDefinitionIdentity({id:'mode-controls',version:1,name:'Modes',interface:[],parameters:[{id:'method',label:'Method',target:{instancePath:[],nodeId:'compact',controlId:'method'}}],body:{schema:3,runtime:2,mode:'native-pre',roles:{},nodes:{compact:{id:'compact',type:'workflow',operation:'smart-compactor',method:'select'}},wires:{}}});
    assert.equal(identity.ok,true,JSON.stringify(identity));
    const definition={...identity.data.materializedDefinition,semanticHash:identity.data.semanticHash},ref={id:definition.id,version:definition.version,semanticHash:definition.semanticHash};
    const root={id:'effective-mode',schema:3,runtime:2,mode:'native-pre',roles:{},nodes:{wrapper:{id:'wrapper',type:'subgraph',definition:ref,parameterOverrides:{method:'compress'},nodeBindingOverrides:{'[[],"compact"]':{profileId:'instance-profile',model:'instance-model'}}}},wires:{},definitions:{[definitionRefKey(ref)]:definition}};
    const prepared=prepareWorkspaceViews(root),session=createGraphViewSession({root,activationId:'effective-mode',...prepared.data}).data;
    session.openInstance(['wrapper']);
    const workflow=projectPreparedWorkflow(prepared.data.workflow,{viewPath:['wrapper'],selectedId:'compact'});
    const panel=projectWorkspacePanels(session.readEditor(),workflow,{},'mode',null,null).nodeDetails;
    assert.ok(panel.controls.some(control=>control.key==='maxTokens'));
    assert.equal(panel.controls.find(control=>control.key==='method').effective,'compress');
    assert.equal(panel.model.source,'Containing instance override');
});

test('shared primitive details expose an editable effective connection with its profile model default', () => {
    const identity = computeDefinitionIdentity({ id: 'shared-connections', version: 1, name: 'Shared calls', interface: [], parameters: [], body: { schema: 3, runtime: 2, mode: 'native-pre', roles: { Analysis: { profileId: 'definition-profile', model: 'definition-model' } }, nodes: { work: { id: 'work', type: 'workflow', operation: 'response-plan' } }, wires: {} } });
    assert.equal(identity.ok, true, JSON.stringify(identity));
    const definition = { ...identity.data.materializedDefinition, semanticHash: identity.data.semanticHash }, ref = { id: definition.id, version: definition.version, semanticHash: definition.semanticHash };
    const root = { id: 'shared-model', schema: 3, runtime: 2, mode: 'native-pre', roles: {}, nodes: { first: { id: 'first', type: 'subgraph', definition: ref, nodeBindingOverrides: { '[[],"work"]': { profileId: 'instance-profile', model: null } } }, second: { id: 'second', type: 'subgraph', definition: ref } }, wires: {}, definitions: { [definitionRefKey(ref)]: definition } };
    const prepared = prepareWorkspaceViews(root), session = createGraphViewSession({ root, activationId: 'shared-model', ...prepared.data }).data;
    assert.equal(session.openInstance(['first']).ok, true);
    const workflow = projectPreparedWorkflow(prepared.data.workflow, { viewPath: ['first'], selectedId: 'work' });
    const panel = projectWorkspacePanels(session.readEditor(), workflow, {}, 'shared-connection', null, null).nodeDetails;
    assert.equal(panel.readOnly, true, 'shared definition fields stay immutable');
    assert.equal(panel.model.editable, true, 'the enclosing workflow can configure an instance binding');
    assert.equal(panel.model.profile.mode, 'override', 'the instance override can be reset through compatibility modes');
    assert.equal(panel.model.profile.value, 'instance-profile');
    assert.equal(panel.model.profile.effectiveValue, 'instance-profile');
    assert.equal(panel.model.profileDefaultModel, true);
    assert.equal(panel.model.model.mode, 'block', 'an explicit profile default stays distinct from resetting the instance model');
    assert.deepEqual(panel.model.model.allowedModes, [{ value: 'inherit', label: 'Use definition model' }, { value: 'override', label: 'Override' }, { value: 'block', label: 'Use profile model' }]);
    assert.equal(panel.model.source, 'Containing instance override');
    assert.deepEqual(root.definitions[definitionRefKey(ref)].body.nodes.work, definition.body.nodes.work);
});

test('shared definition profile and model appear as inherited defaults until the instance overrides them', () => {
    const identity = computeDefinitionIdentity({ id: 'saved-shared-connection', version: 1, name: 'Saved connection', interface: [], parameters: [], body: { schema: 3, runtime: 2, mode: 'native-pre', roles: {}, nodes: { work: { id: 'work', type: 'workflow', operation: 'response-plan', profileId: 'saved-profile', model: 'saved-model' } }, wires: {} } });
    assert.equal(identity.ok, true, JSON.stringify(identity));
    const definition = { ...identity.data.materializedDefinition, semanticHash: identity.data.semanticHash }, ref = { id: definition.id, version: definition.version, semanticHash: definition.semanticHash };
    const root = { id: 'shared-defaults', schema: 3, runtime: 2, mode: 'native-pre', roles: {}, nodes: { first: { id: 'first', type: 'subgraph', definition: ref }, second: { id: 'second', type: 'subgraph', definition: ref } }, wires: {}, definitions: { [definitionRefKey(ref)]: definition } };
    const prepared = prepareWorkspaceViews(root), session = createGraphViewSession({ root, activationId: 'shared-defaults', ...prepared.data }).data;
    assert.equal(session.openInstance(['first']).ok, true);
    const workflow = projectPreparedWorkflow(prepared.data.workflow, { viewPath: ['first'], selectedId: 'work' });
    const panel = projectWorkspacePanels(session.readEditor(), workflow, {}, 'shared-defaults', null, null).nodeDetails;
    assert.equal(panel.readOnly, true);
    assert.equal(panel.model.profile.mode, 'inherit'); assert.equal(panel.model.profile.value, null);
    assert.equal(panel.model.profile.effectiveValue, 'saved-profile');
    assert.equal(panel.model.profile.allowedModes[0].label, 'Use definition binding');
    assert.equal(panel.model.model.mode, 'inherit'); assert.equal(panel.model.model.value, null);
    assert.equal(panel.model.model.effectiveValue, 'saved-model');
    assert.deepEqual(panel.model.model.allowedModes, [{ value: 'inherit', label: 'Use definition model' }, { value: 'override', label: 'Override' }, { value: 'block', label: 'Use profile model' }]);
});

test('nested definition bindings remain inherited until root-owned overrides are set and reset', () => {
    function definition(draft) {
        const identity = computeDefinitionIdentity(draft);
        assert.equal(identity.ok, true, JSON.stringify(identity));
        const saved = { ...identity.data.materializedDefinition, semanticHash: identity.data.semanticHash };
        return { saved, ref: { id: saved.id, version: saved.version, semanticHash: saved.semanticHash } };
    }
    const inner = definition({ id: 'nested-binding-inner', version: 1, name: 'Inner', interface: [], parameters: [], body: { schema: 3, runtime: 2, mode: 'native-pre', roles: {}, nodes: { work: { id: 'work', type: 'workflow', operation: 'response-plan' } }, wires: {} } });
    const innerKey = nodeBindingOverrideKey([], 'work'), rootKey = nodeBindingOverrideKey(['work'], 'work');
    const outer = definition({ id: 'nested-binding-outer', version: 1, name: 'Outer', interface: [], parameters: [], body: { schema: 3, runtime: 2, mode: 'native-pre', roles: {}, nodes: { work: { id: 'work', type: 'subgraph', definition: inner.ref, nodeBindingOverrides: { [innerKey]: { profileId: 'inner-definition-profile', model: 'inner-definition-model' } } } }, wires: {} } });
    let root = { id: 'nested-binding-root', schema: 3, runtime: 2, mode: 'native-pre', roles: {}, nodes: { 'first/path': { id: 'first/path', type: 'subgraph', definition: outer.ref }, second: { id: 'second', type: 'subgraph', definition: outer.ref } }, wires: {}, definitions: { [definitionRefKey(inner.ref)]: inner.saved, [definitionRefKey(outer.ref)]: outer.saved } };
    const savedDefinitions = structuredClone(root.definitions);
    function panel() {
        const prepared = prepareWorkspaceViews(root); assert.equal(prepared.ok, true, JSON.stringify(prepared));
        const session = createGraphViewSession({ root, activationId: 'nested-binding', ...prepared.data }).data;
        assert.equal(session.openInstance(['first/path', 'work']).ok, true);
        const workflow = projectPreparedWorkflow(prepared.data.workflow, { viewPath: ['first/path', 'work'], selectedId: 'work' });
        return projectWorkspacePanels(session.readEditor(), workflow, {}, 'nested-binding', null, null).nodeDetails;
    }
    function edit(field, mode, value) {
        const prepared = prepareNativeNodeEdit(root, { kind: 'binding-override', viewPath: [], nodeId: 'first/path', expectedInstanceRef: root.nodes['first/path'].definition, target: { kind: 'node', instancePath: ['work'], nodeId: 'work' }, field, mode, ...(mode === 'set' ? { value } : {}) });
        assert.equal(prepared.ok, true, JSON.stringify(prepared)); root = prepared.data.candidate;
    }
    let details = panel(); assert.equal(details.readOnly, true);
    for (const field of ['profile', 'model']) {
        assert.equal(details.model[field].mode, 'inherit', 'a binding inside the pinned outer definition is not owned by the root');
        assert.equal(details.model[field].value, null);
    }
    assert.equal(details.model.profile.effectiveValue, 'inner-definition-profile');
    assert.equal(details.model.model.effectiveValue, 'inner-definition-model');
    edit('profileId', 'set', 'root-profile'); edit('model', 'set', 'root-model');
    details = panel();
    assert.equal(details.model.profile.mode, 'override'); assert.equal(details.model.profile.value, 'root-profile');
    assert.equal(details.model.model.mode, 'override'); assert.equal(details.model.model.value, 'root-model');
    edit('profileId', 'reset'); edit('model', 'reset');
    assert.equal(Object.hasOwn(root.nodes['first/path'].nodeBindingOverrides ?? {}, rootKey), false);
    details = panel();
    assert.equal(details.model.profile.mode, 'inherit'); assert.equal(details.model.profile.effectiveValue, 'inner-definition-profile');
    assert.equal(details.model.model.mode, 'inherit'); assert.equal(details.model.model.effectiveValue, 'inner-definition-model');
    assert.deepEqual(root.definitions, savedDefinitions, 'root override resets preserve every pinned definition');
});

test('Pattern Scan phrase rules retain their distinct raw schema', () => {
    const root={id:'scan',schema:3,runtime:2,mode:'native-post',roles:{},nodes:{scan:{id:'scan',type:'workflow',operation:'pattern-scan',rules:[]}},wires:{},definitions:{}};
    assert.equal(details(root,'scan').controls.find(control=>control.key==='rules').structured,undefined);
});

test('generated labels use readable sentence case while custom labels remain intact', () => {
    const root=starterGraph('native-guidance');
    const controls=details(root,'smart-compactor').controls;
    assert.equal(controls.find(control=>control.key==='targetTokens').label,'Target tokens');
    assert.equal(controls.find(control=>control.key==='keepRecent').label,'Keep recent');
    assert.equal(controls.find(control=>control.key==='pins').label,'Pinned wording');
    assert.equal(details(starterGraph('structured-guidance'),'json-decode').controls.find(control=>control.key==='schema').label,'Schema');
});

test('single-line identifiers get compact fields without shrinking prose controls', () => {
    const root={id:'curve-controls',schema:3,runtime:2,mode:'native-post',roles:{},nodes:{curve:{id:'curve',type:'workflow',operation:'state',mode:'curve'}},wires:{},definitions:{}};
    assert.equal(details(root,'curve').controls.find(control=>control.key==='curveId').singleLine,true);
    assert.equal(details(starterGraph('native-guidance'),'response-plan').controls.find(control=>control.key==='instructions').singleLine,undefined);
});
