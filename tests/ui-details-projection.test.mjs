import test from 'node:test';
import assert from 'node:assert/strict';
import { starterGraph } from '../src/workflow/starters.js?v=0.26.0';
import { createGraphViewSession } from '../src/ui/graph-view-session.js?v=0.26.0';
import { projectPreparedWorkflow } from '../src/ui/workflow-surface.js?v=0.26.0';
import { prepareWorkspaceViews, projectWorkspacePanels } from '../src/ui/workspace-preparation.js?v=0.26.0';
import { computeDefinitionIdentity, definitionRefKey } from '../src/workflow/definitions.js?v=0.26.0';

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
