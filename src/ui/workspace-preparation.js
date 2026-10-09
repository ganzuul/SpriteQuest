import { inspectDefinitionGraph } from '../workflow/graph-validation.js?v=0.19.1';
import { formatRecordedArtifact } from '../workflow/recording.js?v=0.19.1';
import { projectRunRows } from '../workflow/run-state.js?v=0.19.1';
import { normalizeNativeGraph } from '../workflow/migration.js?v=0.19.1';
import { definitionRefKey } from '../workflow/definition-data.js?v=0.19.1';
import { prepareWorkflowPlanner } from '../workflow/resolve.js?v=0.19.1';
import { prepareCompositionViews } from '../workflow/composition-views.js?v=0.19.1';
import { prepareWorkflowProjection, projectPreparedWorkflow } from './workflow-surface.js?v=0.19.1';
import { operationFor, portsForNode } from '../workflow/catalog.js?v=0.19.1';
import { definitionChain } from '../workflow/composition-edit.js?v=0.19.1';
import { FAMILY_PALETTE, paletteForOperation } from './node-palette.js?v=0.19.1';
const rootIdentity = root => ({ kind: 'root', workflowId: root.id });
/** Content/host preparation only. The view session receives detached display DTOs. */
export function prepareWorkspaceViews(root, options = {}) {
    let planner, composition;
    if (root.schema === 3 && root.runtime === 2) {
        const prepared = prepareWorkflowPlanner(root); if (!prepared.ok) return prepared;
        planner = prepared.data;
        composition = prepareCompositionViews(root, planner); if (!composition.ok) return composition;
    } else composition = { ok: true, data: { views: [{ instancePath: [], editable: true, savedGraph: root, effectiveNodes: root.nodes, interface: [], ports: [] }] } };
    const workflow = prepareWorkflowProjection(root, { ...options, ...(planner ? { planner } : {}) });
    const navigation = [], preparedViews = composition.data.views.map(view => {
        const identity = view.instancePath.length ? { kind: 'instance', workflowId: root.id, instancePath: [...view.instancePath] } : rootIdentity(root);
        const definition = view.instancePath.length ? definitionChain(root, view.instancePath).at(-1).definition : null;
        if (definition) navigation.push({ identity, label: definition.name || view.instancePath.at(-1), readOnly: !view.editable });
        const drawBase = prepareEditorDrawBase(view,root.definitions);
        return { identity, ...(view.definitionRef ? { definitionRef: view.definitionRef } : {}), readOnly: !view.editable, savedGraph: view.savedGraph, effectiveNodes: view.effectiveNodes, interface: view.interface, ports: view.ports, drawBase };
    });
    const inventory=planner?.inventory;
    const idleRunRows=inventory?projectRunRows({plan:{workflowId:root.id,hierarchy:inventory.hierarchy},nodes:inventory.primitives.map(unit=>({...unit,included:unit.enabled!==false,status:'not-run',attempts:0,durationMs:null,request:null}))}):Object.values(preparedViews[0].drawBase.nodes).map(node=>({address:{workflowId:root.id,instancePath:[],nodeId:node.id},kind:'primitive',status:'not-run',executableCount:node.enabled!==false&&root.groups?.[node.inGroup]?.enabled!==false?1:0,completedCount:0,requestBound:operationBound(node),children:[]}));
    const previewChoices = preparedViews.flatMap(view => previewChoicesFor(view, projectPreparedWorkflow(workflow, { viewPath: view.identity.instancePath ?? [] }).targets));
    return { ok: true, data: { navigation, preparedViews, workflow, planner, idleRunRows, previewChoices } };
}
/** Cheap detached drawing overlay; never a saved body or full-root commit candidate. */
export function projectEditorDraw(editor) {
    const graph = structuredClone(editor.prepared.drawBase ?? editor.prepared.savedGraph), view = editor.view;
    if(view.identity.kind==='root')graph.id=view.identity.workflowId;else delete graph.id;
    graph.view = { ...view.camera }; graph.selection = [...view.selection.multi];
    graph.nodes ??= {}; graph.wires ??= {}; graph.groups ??= {};
    for (const [id, presentation] of Object.entries(view.nodePresentation)) {
        const node = graph.nodes[id]; if (!node) continue;
        node.presentation = { ...node.presentation, ...presentation };
        if (presentation.x !== undefined) node.x = presentation.x;
        if (presentation.y !== undefined) node.y = presentation.y;
    }
    for (const [id, presentation] of Object.entries(view.groupPresentation ?? {})) if (Object.hasOwn(graph.groups, id)) graph.groups[id].collapsed = presentation.collapsed;
    return graph;
}

const targetKey = target => JSON.stringify(target);
function previewChoicesFor(prepared, targets = []) {
    const path = prepared.identity.instancePath ?? [];
    return targets.map(target => {
        const at = target.kind === 'terminal' ? target.address : target, card = prepared.drawBase?.nativeCards?.[at.nodeId];
        const port = card?.ports.find(port => port.port === target.portId && port.dir === 'out');
        const label = (card?.canonicalTitle || at.nodeId) + (target.kind === 'terminal' ? ' · Host result' : ' · ' + (port?.label || target.portId));
        return { key: targetKey(target), label: path.length ? path.join(' / ') + ' · ' + label : label, kind: port?.kind || 'host', target: structuredClone(target) };
    });
}
/** Plain panel DTOs from cached saved/effective values and bounded run projections. */
export function projectWorkspacePanels(editor, workflow, state, revision, selectedTarget, pinnedPreview, rootWorkflow = workflow, idleRunRows = [], previewChoices, schema2Selector = null) {
    const library = editor?.view.identity.kind === 'library', path = editor?.view.identity.instancePath ?? [], graph = editor?.prepared.savedGraph;
    const selectedId = library ? editor.view.selection.primary?.kind === 'node' ? editor.view.selection.primary.id : null : workflow.selectedId, saved = graph?.nodes[selectedId], effective = library ? null : workflow.nodes.find(node => node.id === selectedId), metadata = editor?.prepared.drawBase?.nativeCards?.[selectedId];
    const address = library ? {kind:'library',definitionRef:editor.prepared.definitionRef,nodeId:selectedId} : { workflowId: workflow.graphId, instancePath: [...path], nodeId: selectedId };
    const controls = metadata ? Object.entries(metadata.controlDescriptors).map(([key, descriptor]) => {
        const value = saved?.[key] ?? metadata.defaults[key], effectiveValue = editor.prepared.effectiveNodes[selectedId]?.[key] ?? metadata.defaults[key];
        const editorType = descriptor.editor === 'json' || descriptor.type === 'array' && descriptor.items !== 'string' ? 'json' : descriptor.type === 'enum' ? 'enum' : descriptor.type === 'array' ? 'lines' : descriptor.type === 'integer' || descriptor.type === 'number' ? 'number' : descriptor.type === 'boolean' ? 'boolean' : 'text';
        return { key, label: descriptor.label || key.replace(/([A-Z])/g,' $1'), value, editor: editorType, ...(editorType === 'json' ? { representation: 'json-value' } : {}), ...(descriptor.values ? { options: descriptor.values.map(value => ({ value, label: value })) } : {}), ...(descriptor.min !== undefined ? { min: descriptor.min } : {}), ...(descriptor.max !== undefined ? { max: descriptor.max } : {}), effective: JSON.stringify(effectiveValue), source: JSON.stringify(value) === JSON.stringify(effectiveValue) ? 'Saved setting' : 'Effective instance override' };
    }) : [];
    const modes = [{ value: 'inherit', label: 'Inherit role' }, { value: 'override', label: 'Override' }];
    const field = (key, options) => ({ mode: saved?.[key] ? 'override' : 'inherit', value: saved?.[key] ?? null, allowedModes: modes, ...(options ? { options } : {}) });
    const nodeDetails = saved && metadata ? { selectionKey: JSON.stringify([editor.view.key, selectedId]), revision, address, title: editor.view.nodePresentation[selectedId]?.alias || effective?.title || saved.presentation?.alias || saved.title || metadata.canonicalTitle, canonicalTitle: metadata.canonicalTitle, iconPath: metadata.iconPath, family: metadata.family, phase: graph.mode.slice(7), alias: editor.view.nodePresentation[selectedId]?.alias ?? saved.presentation?.alias ?? '', compact: editor.view.nodePresentation[selectedId]?.compact ?? saved.presentation?.compact ?? false, enabled: saved.enabled !== false, readOnly: editor.readOnly || library, canPresent: true, controls,
        model: metadata.modelRole ? { role: saved.modelRole ?? metadata.modelRole, roleEditable: true, profile: field('profileId', workflow.profiles.map(profile => ({ value: profile.id, label: profile.name }))), model: field('model'), effective: effective?.effective || (library ? [editor.prepared.effectiveNodes[selectedId]?.profileId ?? graph.roles?.[saved.modelRole ?? metadata.modelRole]?.profileId,editor.prepared.effectiveNodes[selectedId]?.model ?? graph.roles?.[saved.modelRole ?? metadata.modelRole]?.model].filter(Boolean).join(' · ') : ''), source: 'Saved node override or containing role' } : null,
        ports: metadata.ports.map(port => ({ id: port.port, label: port.label, direction: port.dir === 'in' ? 'input' : 'output', kind: port.kind })), issues: [] } : null;
    const choices = library ? [] : previewChoices ?? previewChoicesFor(editor.prepared, workflow.targets);
    const target = pinnedPreview || selectedTarget, selectedKey = choices.find(choice => targetKey(choice.target) === targetKey(target))?.key ?? '';
    const result = workflow.result, sections = result?.kind === 'bounded' ? result.sections.map((section,i) => ({ id: String(i), label: section.kind, ...section })) : result ? ['guidance','original','candidate'].filter(key => result[key]).map(key => ({ id: key, label: key, kind: key === 'candidate' ? 'candidate' : 'text', text: result[key], format: 'structured-text', truncated: false })) : [];
    if (result?.kind === 'legacy') for (const [id, label] of [['findings', 'Findings'], ['changes', 'Changes'], ['reports', 'Reports'], ['calls', 'Call trace']]) {
        sections.push({ id, label, kind: 'diagnostic', ...formatRecordedArtifact({ value: result[id] }) });
    }
    const schema2Review = editor?.view.identity.kind === 'root' && graph?.schema === 2 && graph.runtime === 1 && graph.mode === 'native-post' && result?.kind === 'legacy' && schema2Selector?.kind === 'schema2-candidate' && targetKey(schema2Selector.terminal) === targetKey(target);
    const selector = editor?.view.identity.kind === 'root' ? result?.selectedReviewHandle ?? (schema2Review ? schema2Selector : null) : null;
    const outputPreview = { sourceKey: revision, title: 'Output preview', statusDetail: state.status || '', status: !library && target && !selectedKey ? 'removed' : !result ? 'not-run' : state.availability === 'current' ? 'current' : 'stale', choices, selectedKey, pinned: !!pinnedPreview, followSelection: !pinnedPreview, sections: library || target && !selectedKey ? [] : sections, issues: library ? ['Library inspection is read-only and has no runtime output.'] : workflow.issues, busy: state.busy, runHere: library || !selectedKey ? null : { enabled: !state.busy && !workflow.targetSummary?.issues?.length, callBound: workflow.targetSummary?.callBound ?? workflow.callBound, issue: workflow.targetSummary?.issues?.join(' ') }, review: selector ? { selector, canApply: result.applyAvailable, fresh: !result.applyIssue && state.availability === 'current', selectedRootTerminal: editor?.view.identity.kind === 'root' && target?.kind === 'terminal' && !target.address.instancePath.length, mode: 'root', issue: result.applyIssue } : null };
    const rowSource = state.runState || state.recording, rows = rootWorkflow.rows?.length ? rootWorkflow.rows : idleRunRows, flat = [];
    const visit = (items, depth) => { for (const row of items) { flat.push({ key: JSON.stringify(row.address), address: row.address, title: row.node?.presentation?.alias || row.node?.title || row.node?.operation || row.address.nodeId, kind: row.kind, depth, status: row.status, subphase: row.subphase, durationMs: row.durationMs ?? null, attempts: row.attempts ?? 0, callBound: row.requestBound ?? 0, usage: row.request?.usage ?? null, issue: row.error?.message }); visit(row.children ?? [],depth+1); } }; visit(rows,0);
    const executableCount = rows.reduce((sum,row) => sum+row.executableCount,0), completedCount = rows.reduce((sum,row) => sum+row.completedCount,0), status = state.busy ? rowSource?.status || 'running' : rowSource?.status || (result ? result.ok ? 'completed' : 'failed' : 'not-run');
    const runDetails = { runId: rowSource?.runId || '', status, elapsedMs: rowSource?.elapsedMs ?? null, actualCalls: state.busy ? flat.filter(row=>row.kind==='primitive').reduce((sum,row)=>sum+row.attempts,0) : rootWorkflow.result?.actualCalls ?? flat.filter(row=>row.kind==='primitive').reduce((sum,row)=>sum+row.attempts,0), callBound: rowSource?.plan?.callBound ?? rootWorkflow.result?.callBound ?? rootWorkflow.callBound, completedCount, executableCount, rows: flat, issue: state.preparationError?.message || result?.error || '' };
    const runMeter = { ...runDetails, rows: rows.map(row => ({ id: JSON.stringify(row.address), title: row.address.nodeId, status: row.status, executableCount: row.executableCount, completedCount: row.completedCount })) };
    return { nodeDetails, outputPreview, runDetails, runMeter };
}

function prepareEditorDrawBase(view,snapshots) {
        const normalized = view.savedGraph.schema === 2 ? normalizeNativeGraph(view.savedGraph) : null;
        const drawBase = structuredClone(normalized?.ok ? normalized.data : view.savedGraph);
        drawBase.nodes = structuredClone(view.effectiveNodes); drawBase.groups ??= {}; drawBase.wires ??= {}; drawBase.nativeCards = {};
        const metadata = { ...view.savedGraph, definitions: snapshots, interface: view.interface };
        let index = 0;
        for (const node of Object.values(drawBase.nodes)) {
            node.x ??= 40 + index % 3 * 240; node.y ??= 40 + Math.floor(index++ / 3) * 160;
            const operation = operationFor(node, { phase: view.savedGraph.mode?.slice(7) });
            const wrapper = node.type === 'subgraph', boundary = ['subgraph-input', 'subgraph-output'].includes(node.type);
            if (!operation && !wrapper && !boundary) continue;
            const actualPorts = portsForNode(metadata, node), rows = { in: 0, out: 0 };
            const title = operation?.title || (wrapper ? snapshots?.[JSON.stringify([node.definition.id, node.definition.version, node.definition.semanticHash])]?.name || 'Subgraph' : node.type === 'subgraph-input' ? 'Input boundary' : 'Output boundary');
            const family = operation?.family || 'Subgraphs', palette = FAMILY_PALETTE.find(item => item.name === family), discovery = paletteForOperation(node.operation);
            drawBase.nativeCards[node.id] = { canonicalTitle: title, family, familyColor: palette?.color || '#a3aa99', iconPath: wrapper || boundary ? palette?.icon : discovery.icon,
                body: wrapper ? 'Open the pinned subgraph' : boundary ? 'Definition interface' : operation.title,
                hostResult: !!operation?.terminal, controlDescriptors: structuredClone(operation?.controlDescriptors ?? {}), defaults: structuredClone(operation?.defaults ?? {}), modelRole: operation?.modelRole ?? null,
                ports: actualPorts.map(port => { const dir = port.direction === 'input' ? 'in' : 'out'; return { id: `${dir}:${port.id}`, port: port.id, dir, side: dir === 'in' ? 'left' : 'right', row: ++rows[dir], kind: port.kind, label: port.label, className: `pc-port pc-port-${dir}`, title: `${port.label}: ${port.kind}` }; }) };
        }

    drawBase.nativeAttachments = {};
    for (const [nodeId, card] of Object.entries(drawBase.nativeCards)) for (const port of card.ports) {
        const originalBindings = [], jumps = [];
        const jump = (id, targetId, targetPort, dir, portalLabel) => {
            const targetCard = drawBase.nativeCards[targetId], pin = targetCard?.ports.find(item => item.port === targetPort && item.dir === dir);
            if (!pin) return;
            jumps.push({ id, label: 'Go to ' + targetCard.canonicalTitle + ' · ' + pin.label + (portalLabel ? ' · ' + portalLabel : ''), target: { nodeId: targetId, portId: targetPort, dir } });
        };
        for (const edge of Object.values(drawBase.wires)) {
            if (port.dir === 'in' && edge.to === nodeId && edge.toPort === port.port) {
                if (edge.route === 'portal') {
                    const publisher = drawBase.portals?.[edge.portalId];
                    originalBindings.push({ kind: 'portal', id: edge.id, portalId: edge.portalId });
                    if (publisher) jump('portal-source:' + edge.id, publisher.source.nodeId, publisher.source.portId, 'out', publisher.label || publisher.id);
                } else {
                    originalBindings.push({ kind: 'direct', id: edge.id });
                    jump('wire-source:' + edge.id, edge.from, edge.fromPort, 'out');
                }
            } else if (port.dir === 'out' && edge.route !== 'portal' && edge.from === nodeId && edge.fromPort === port.port) {
                originalBindings.push({ kind: 'direct', id: edge.id });
                jump('wire-target:' + edge.id, edge.to, edge.toPort, 'in');
            }
        }
        for (const portal of Object.values(drawBase.portals ?? {})) if (port.dir === 'out' && portal.source.nodeId === nodeId && portal.source.portId === port.port) {
            originalBindings.push({ kind: 'portal-publisher', portalId: portal.id });
            for (const edge of Object.values(drawBase.wires)) if (edge.route === 'portal' && edge.portalId === portal.id) jump('portal-target:' + edge.id, edge.to, edge.toPort, 'in', portal.label || portal.id);
        }
        drawBase.nativeAttachments[JSON.stringify([nodeId, port.dir, port.port])] = { originalBindings, jumps };
    }
    return drawBase;
}
/** Content preparation for actual saved definitions. Never creates a workflow or runtime address. */
export function prepareLibraryViews(workflowId, snapshots) {
    const navigation=[],preparedViews=[],definitionInfo={};
    for (const definition of Object.values(snapshots)) {
        const checked=inspectDefinitionGraph(definition,snapshots);if(!checked.ok)return checked;
        const {ref,definition:actual,expansion}=checked.data;
        const eligibleTargets=[],nodeBindings=[],roles=new Map();
        for(const scope of expansion.scopes) for(const role of Object.keys(scope.graph.roles ?? {})) roles.set(role,{id:role,label:role});
        for(const unit of expansion.primitives) {
            const operation=operationFor(unit.node,{phase:actual.body.mode.slice(7)});
            const role=unit.node.modelRole ?? operation?.modelRole;if(role)roles.set(role,{id:role,label:role});
            const target={instancePath:[...unit.address.instancePath],nodeId:unit.address.nodeId};
            nodeBindings.push({id:JSON.stringify([target.instancePath,target.nodeId]),label:[...target.instancePath,operation?.title || target.nodeId].join(' / '),target:{kind:'node',...target}});
            for(const [controlId,descriptor] of Object.entries(operation?.controlDescriptors ?? {})) if(descriptor.exposable!==false) eligibleTargets.push({key:JSON.stringify([target.instancePath,target.nodeId,controlId]),label:[...target.instancePath,operation.title,descriptor.label || controlId].join(' / '),target:{...target,controlId}});
        }
        const parameters=actual.parameters.map(parameter=>{
            const unit=expansion.primitives.find(unit=>unit.address.nodeId===parameter.target.nodeId&&JSON.stringify(unit.address.instancePath)===JSON.stringify(parameter.target.instancePath));
            const descriptor=checked.data.parameterDescriptors[parameter.id];
            return {...parameter,control:detailControl(parameter.id,parameter.label,descriptor,unit.node[parameter.target.controlId])};
        });
        definitionInfo[definitionRefKey(ref)]={ref,name:actual.name,description:actual.description || '',phase:actual.body.mode.slice(7),nodeCount:checked.data.nodeCount,wireCount:checked.data.wireCount,interface:actual.interface,parameters,eligibleTargets,roles:[...roles.values()],nodeBindings};
        const identity={kind:'library',workflowId,definitionRef:ref};
        const scope=expansion.scopes.find(scope=>!scope.instancePath.length);
        const ports=[...expansion.pins.values()].filter(pin=>!pin.address.instancePath.length).map(({address,...port})=>({...port,nodeId:address.nodeId,portId:address.portId}));
        const view={savedGraph:actual.body,effectiveNodes:scope.graph.nodes,interface:actual.interface};
        navigation.push({identity,label:actual.name,readOnly:true});
        preparedViews.push({identity,definitionRef:ref,readOnly:true,...view,ports,drawBase:prepareEditorDrawBase(view,snapshots)});
    }
    return {ok:true,data:{navigation,preparedViews,definitionInfo}};
}

function detailControl(key,label,descriptor,value) {
 const editor=descriptor.editor==='json'||descriptor.type==='array'&&descriptor.items!=='string'?'json':descriptor.type==='enum'?'enum':descriptor.type==='array'?'lines':['integer','number'].includes(descriptor.type)?'number':descriptor.type==='boolean'?'boolean':'text';
 return {key,label,value,editor,...(editor==='json'?{representation:'json-value'}:{}),...(descriptor.values?{options:descriptor.values.map(value=>({value,label:value}))}:{}),...(descriptor.min!==undefined?{min:descriptor.min}:{}),...(descriptor.max!==undefined?{max:descriptor.max}:{})};
}
export function projectDefinitionInstance(info,wrapper,profiles=[],effectiveControls={},effectiveBindings={}) {
 const modes=[{value:'inherit',label:'Inherit definition'},{value:'override',label:'Override'},{value:'block',label:'Block inheritance'}];
 const field=(binding,key)=>({mode:Object.hasOwn(binding ?? {},key)?binding[key]===null?'block':'override':'inherit',value:binding?.[key] ?? null,allowedModes:modes,...(key==='profileId'?{options:profiles.map(profile=>({value:profile.id,label:profile.name}))}:{})});
 const parameters=info.parameters.map(row=>({...row,overridden:Object.hasOwn(wrapper.parameterOverrides ?? {},row.id),control:{...row.control,value:Object.hasOwn(wrapper.parameterOverrides ?? {},row.id)?wrapper.parameterOverrides[row.id]:row.control.value,effective:JSON.stringify(effectiveControls[row.id] ?? row.control.value),source:'Definition value with containing instance overrides'}}));
 const bindings=[...info.roles.map(role=>({key:'role:'+role.id,label:'Role '+role.label,target:{kind:'role',role:role.id},saved:wrapper.roleOverrides?.[role.id]})),...info.nodeBindings.map(row=>({key:'node:'+row.id,label:row.label,target:row.target,saved:wrapper.nodeBindingOverrides?.[row.id]}))].map(row=>({key:row.key,label:row.label,target:row.target,editable:true,profile:field(row.saved,'profileId'),model:field(row.saved,'model'),effective:effectiveBindings[row.key] || 'No model call',source:'Saved instance override or definition binding'}));
 return {parameters,bindings};
}
export function projectDefinitionUpdate(previous,next) {
 const rows=(old,choices,compatible=()=>true)=>old.map(row=>{const options=choices.filter(choice=>compatible(row,choice)).map(choice=>({id:choice.id,label:choice.label}));return {from:row.id,label:row.label,to:options.some(choice=>choice.id===row.id)?row.id:null,options,canDrop:true};});
 return {portMap:rows(previous.interface,next.interface,(a,b)=>a.direction===b.direction&&a.kind===b.kind),parameterMap:rows(previous.parameters,next.parameters),roleMap:rows(previous.roles,next.roles),nodeBindingMap:rows(previous.nodeBindings,next.nodeBindings)};
}

function operationBound(node) {const bound=operationFor(node)?.requestBound;return typeof bound==='function'?bound(node):bound ?? 0;}
