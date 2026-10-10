import {recallControlLabel} from '../workflow/recall-labels.js?v=0.27.0';
import { prepareIterationBindings } from './iteration-bindings.js?v=0.27.0';
import { inspectDefinitionGraph } from '../workflow/graph-validation.js?v=0.27.0';
import { projectRunRows } from '../workflow/run-state.js?v=0.27.0';
import { definitionRefKey, nodeBindingOverrideKey } from '../workflow/definition-data.js?v=0.27.0';
import { prepareWorkflowPlanner } from '../workflow/resolve.js?v=0.27.0';
import { prepareCompositionViews } from '../workflow/composition-views.js?v=0.27.0';
import { prepareWorkflowProjection, projectPreparedWorkflow } from './workflow-surface.js?v=0.27.0';
import { ARTIFACT_KINDS, OPERATIONS, operationFor, portsForNode, phaseForNode } from '../workflow/catalog.js?v=0.27.0';
import { definitionChain } from '../workflow/composition-edit.js?v=0.27.0';
import { FAMILY_PALETTE, paletteForOperation, readNodePresentation } from './node-palette.js?v=0.27.0';
import { isCommentFrame } from '../canvas/comment-frames.js?v=0.27.0';
import { modifierTypes, modifierSummary, applyTextModifiers } from '../workflow/modifiers.js?v=0.27.0';
import { addressKey, boundedText, RENDERED_TEXT_BYTES } from '../workflow/record-data.js?v=0.27.0';
import { prepareNodeProfileOptions } from './node-profile-preparation.js?v=0.27.0';
const rootIdentity = root => ({ kind: 'root', workflowId: root.id });
/** First activation favors readable named cards; users can pan or explicitly Fit. */
export function initialWorkspaceCamera(node, { width, shelf, meter } = {}) {
    if (!node) return { x: 0, y: 0, zoom: 1 };
    const beside = shelf && shelf.x + shelf.w + 24 + node.w <= width - 16;
    let x = beside ? shelf.x + shelf.w + 24 : 16;
    const y = shelf && !beside ? shelf.y + shelf.h + 16 : 48;
    if (meter && x < meter.x + meter.w + 12 && x + node.w > meter.x - 12 && y < meter.y + meter.h + 12 && y + (node.h || 120) > meter.y - 12) x = meter.x + meter.w + 16;
    return { x: x - node.x, y: y - node.y, zoom: 1 };
}
/** Content/host preparation only. The view session receives detached display DTOs. */
export function prepareWorkspaceViews(root, options = {}) {
    const prepared = prepareWorkflowPlanner(root); if (!prepared.ok) return prepared;
    const planner = prepared.data;
    const primitivePhases = new Map(planner.inventory.primitives.map(unit => [addressKey(unit.address), unit.phase]));
    const composition = prepareCompositionViews(root, planner); if (!composition.ok) return composition;
    const workflow = prepareWorkflowProjection(root, { ...options, ...(planner ? { planner } : {}) });
    const helperProfiles = prepareNodeProfileOptions(options.profiles ?? [], options.activeModel).map(option => ({ id: option.value, name: option.label }));
    const navigation = [], preparedViews = composition.data.views.map(view => {
        const identity = view.instancePath.length ? { kind: 'instance', workflowId: root.id, instancePath: [...view.instancePath] } : rootIdentity(root);
        const wrapper = view.instancePath.length ? definitionChain(root, view.instancePath).at(-1) : null;
        if (wrapper) navigation.push({ identity, label: (readNodePresentation(wrapper.node).alias || (typeof wrapper.node.title === 'string' ? wrapper.node.title : '') || wrapper.definition.name || view.instancePath.at(-1)).slice(0, 256), readOnly: !view.editable });
        const drawBase = prepareEditorDrawBase(view, root.definitions, nodeId => primitivePhases.get(addressKey({ workflowId: root.id, instancePath: view.instancePath, nodeId })));
        // Saved primitive null means inheritance; only an explicit enclosing
        // instance null map blocks it. Cache that source distinction with the view.
        drawBase.iterationBindings = {}; drawBase.bindingBlocks = {}; drawBase.instanceBindingSources = {}; drawBase.profileDefaultModels = {}; drawBase.instanceBindingValues = {};
        const chain = view.instancePath.length ? definitionChain(root, view.instancePath) : [];
        let helperRoles=structuredClone(root.roles??{});
        for(const owner of chain){
            for(const [role,binding]of Object.entries(owner.definition.body.roles??{}))helperRoles[role]={...(helperRoles[role]??{}),...binding};
            for(const [role,binding]of Object.entries(owner.node.roleOverrides??{}))helperRoles[role]={...(helperRoles[role]??{}),...binding};
        }
        for (const node of Object.values(view.savedGraph.nodes)) {
            if(node.operation==='for-each')drawBase.iterationBindings[node.id]=prepareIterationBindings(node,root.definitions??{},helperProfiles,helperRoles);
            const binding = {};
            for (let depth = chain.length - 1; depth >= 0; depth--) Object.assign(binding, chain[depth].node.nodeBindingOverrides?.[nodeBindingOverrideKey(view.instancePath.slice(depth + 1), node.id)] ?? {});
            const fields = Object.fromEntries(Object.entries(binding).filter(([, value]) => value === null).map(([field]) => [field, true]));
            if (Object.keys(fields).length) drawBase.bindingBlocks[node.id] = fields;
            // The root inspector can reset only the top wrapper's override.
            // Inner pinned wrappers contribute effective defaults, not edit ownership.
            const rootBinding = chain[0]?.node.nodeBindingOverrides?.[nodeBindingOverrideKey(view.instancePath.slice(1), node.id)];
            if (rootBinding && Object.keys(rootBinding).length) drawBase.instanceBindingValues[node.id] = { ...rootBinding };
            drawBase.profileDefaultModels[node.id] = Object.hasOwn(binding, 'profileId') ? !!binding.profileId : !!node.profileId;
            const role = node.modelRole ?? drawBase.nativeCards[node.id]?.modelRole;
            if (Object.keys(binding).length || chain.some(owner => Object.keys(owner.node.roleOverrides?.[role] ?? {}).some(key => ['profileId','model'].includes(key) && !node[key]))) drawBase.instanceBindingSources[node.id] = true;
        }
        return { identity, ...(view.definitionRef ? { definitionRef: view.definitionRef } : {}), readOnly: !view.editable, savedGraph: view.savedGraph, effectiveNodes: view.effectiveNodes, interface: view.interface, ports: view.ports, drawBase };
    });
    const inventory=planner.inventory;
    const idleRunRows=projectRunRows({plan:{workflowId:root.id,hierarchy:inventory.hierarchy},nodes:inventory.primitives.map(unit=>({...unit,included:unit.enabled!==false,status:'not-run',attempts:0,durationMs:null,request:null}))});
    const previewChoices = preparedViews.flatMap(view => previewChoicesFor(view, projectPreparedWorkflow(workflow, { viewPath: view.identity.instancePath ?? [] }).targets));
    return { ok: true, data: { navigation, preparedViews, workflow, planner, idleRunRows, previewChoices } };
}
/** Cheap detached drawing overlay; never a saved body or full-root commit candidate. */
export function projectEditorDraw(editor) {
    const graph = structuredClone(editor.prepared.drawBase), view = editor.view;
    if(view.identity.kind==='root')graph.id=view.identity.workflowId;else delete graph.id;
    graph.view = { ...view.camera }; graph.selection = [...view.selection.multi];
    graph.nodes ??= {}; graph.wires ??= {}; graph.groups ??= {};
    for (const [id, presentation] of Object.entries(view.nodePresentation)) {
        const node = graph.nodes[id]; if (!node) continue;
        node.presentation = { ...node.presentation, ...presentation };
        if (!isCommentFrame(node) && presentation.x !== undefined) node.x = presentation.x;
        if (!isCommentFrame(node) && presentation.y !== undefined) node.y = presentation.y;
    }
    for (const [id, presentation] of Object.entries(view.groupPresentation ?? {})) if (Object.hasOwn(graph.groups, id)) Object.assign(graph.groups[id], structuredClone(presentation));
    return graph;
}

/** Cheap per-node decoration rows from prepared metadata, independent of selection. */
export function projectNodeProfiles(editor, workflow, revision) {
    if (!editor?.prepared) return [];
    const library = editor.view.identity.kind === 'library', path = editor.view.identity.instancePath ?? [];
    const options = (workflow.profiles ?? []).map(profile => ({ value: profile.id, label: profile.name, apiLabel: profile.apiLabel || '', model: profile.model || '', active: profile.active === true }));
    const available = options.length ? options : prepareNodeProfileOptions();
    return Object.values(editor.prepared.effectiveNodes).flatMap(node => {
        const op = operationFor(node), bound = op?.requestBound;
        const requestBound = typeof bound === 'function' ? bound(node) : bound || 0;
        if (!requestBound || op.requestCapability === 'typed-decision') return [];
        const prepared = library ? null : workflow.nodes.find(row => row.id === node.id);
        const role = node.modelRole ?? op.modelRole;
        const value = prepared?.profileId ?? node.profileId ?? editor.prepared.savedGraph.roles?.[role]?.profileId ?? '';
        const option = available.find(option => option.value === value);
        const model = prepared?.model || node.model || prepared?.resolvedModel || (option ? option.model : '') || '';
        const address = library ? { kind: 'library', definitionRef: editor.prepared.definitionRef, nodeId: node.id } : { workflowId: workflow.graphId, instancePath: [...path], nodeId: node.id };
        return [{ id: node.id, selection: { selectionKey: JSON.stringify([editor.view.key, node.id]), revision, address }, value, label: option?.label || (value ? 'Unavailable connection · ' + value : 'Choose a connection'), model, editable: !library, options: available }];
    });
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
export function projectWorkspacePanels(editor, workflow, state, revision, selectedTarget, pinnedPreview, rootWorkflow = workflow, idleRunRows = [], previewChoices) {
    const library = editor?.view.identity.kind === 'library', path = editor?.view.identity.instancePath ?? [], graph = editor?.prepared.savedGraph;
    const selectedId = library ? editor.view.selection.primary?.kind === 'node' ? editor.view.selection.primary.id : null : workflow.selectedId, saved = graph?.nodes[selectedId], effective = library ? null : workflow.nodes.find(node => node.id === selectedId), metadata = editor?.prepared.drawBase?.nativeCards?.[selectedId];
    const address = library ? {kind:'library',definitionRef:editor.prepared.definitionRef,nodeId:selectedId} : { workflowId: workflow.graphId, instancePath: [...path], nodeId: selectedId };
    const presentation = readNodePresentation(saved, editor?.view.nodePresentation[selectedId]);
    const fileInput = saved?.operation === 'file-input' ? { fileName: typeof saved.fileName === 'string' ? saved.fileName : '', loaded: saved.loaded === true } : null;
    const controls = metadata ? Object.entries(metadata.controlDescriptors).filter(([key, descriptor]) => {
        if (key === 'roleOverrides' && saved.operation === 'for-each' || descriptor.hidden || fileInput && ['fileName', 'content', 'loaded'].includes(key)) return false;
        const effectiveNode = editor.prepared.effectiveNodes[selectedId];
        if (!visibleDetailControl(saved, metadata.defaults, key) && !visibleDetailControl(effectiveNode, metadata.defaults, key)) return false;
        if (saved.operation === 'fast-decision' && ['fallbackProfileId', 'fallbackAllowedCodes'].includes(key)) return true;
        const condition = descriptor.visibleWhen;
        return !condition || [saved,effectiveNode].some(node => (node?.[condition.key] ?? metadata.defaults[condition.key] ?? metadata.controlDescriptors[condition.key]?.default) === condition.value);
    }).map(([key, descriptor]) => {
        const fallback = metadata.defaults[key] ?? descriptor.default;
        const value = saved?.[key] ?? fallback, effectiveValue = editor.prepared.effectiveNodes[selectedId]?.[key] ?? fallback;
        const selector = saved.operation === 'fast-decision' && key === 'fastConnectionId' ? workflow.fastConnections ?? [] : saved.operation === 'fast-decision' && key === 'fallbackProfileId' ? workflow.profiles.map(profile => ({ value: profile.id, label: profile.name })) : null;
        const options = selector ? [{ value: '', label: key === 'fastConnectionId' ? 'Choose a configured Fast connection' : 'Choose a fallback text connection' }, ...(value && !selector.some(option => option.value === value) ? [{ value, label: 'Unavailable connection · ' + value }] : []), ...selector] : null;
        return { ...detailControl(key, descriptor.label || friendlyControlLabel(key), ['recall','hotkey-arm'].includes(saved.operation)&&descriptor.values?{...descriptor,valueLabels:Object.fromEntries(descriptor.values.map(value=>[value,recallControlLabel(key,value)??value]))}:descriptor, value), ...detailPresentation(saved.operation, key), ...(options ? { editor: 'enum', options, help: key === 'fastConnectionId' ? 'Configure Jev, Laya or a compatible typed model in Fast connections. Only this selector is stored in the workflow.' : 'Select this profile and error codes before enabling fallback. The fallback uses the selected profile model.' } : {}), ...(JSON.stringify(value) === JSON.stringify(effectiveValue) ? {} : { effective: displayEffective(effectiveValue), source: 'Effective instance override' }) };
    }) : [];
    const modes = [{ value: 'inherit', label: 'Inherit role' }, { value: 'override', label: 'Override' }];
    const field = (key, options) => {
        const explicitNull = editor?.prepared.drawBase.bindingBlocks?.[selectedId]?.[key] === true;
        const pinnedInstance = !library && editor.readOnly;
        const ownProfile = editor.prepared.drawBase.profileDefaultModels?.[selectedId] === true;
        if (pinnedInstance) {
            const instance = editor.prepared.drawBase.instanceBindingValues?.[selectedId], present = Object.hasOwn(instance ?? {}, key);
            const value = present ? instance[key] : null;
            const inherited = [{ value: 'inherit', label: key === 'profileId' ? 'Use definition binding' : 'Use definition model' }, { value: 'override', label: 'Override' }];
            const allowedModes = explicitNull || key === 'model' && ownProfile ? [...inherited, { value: 'block', label: key === 'model' && ownProfile ? 'Use profile model' : 'Blocked by instance' }] : inherited;
            return { mode: present ? value === null ? 'block' : 'override' : 'inherit', value, effectiveValue: editor.prepared.effectiveNodes[selectedId]?.[key] ?? null, allowedModes, ...(options ? { options } : {}) };
        }
        const profileModelDefault = key === 'model' && explicitNull && ownProfile;
        const blocked = explicitNull && !profileModelDefault;
        const value = profileModelDefault ? null : saved?.[key] ?? null;
        return { mode: blocked ? 'block' : value ? 'override' : 'inherit', value, effectiveValue: editor.prepared.effectiveNodes[selectedId]?.[key] ?? null, allowedModes: blocked ? [...modes, { value: 'block', label: 'Blocked by instance' }] : modes, ...(options ? { options } : {}) };
    };
    const selection = { selectionKey: JSON.stringify([editor?.view.key, selectedId]), revision, address };
    const interfacePort = metadata?.boundary ? editor.prepared.interface.find(port => port.id === saved?.interfacePortId && port.boundaryNodeId === selectedId) : null;
    const boundary = interfacePort ? { id: interfacePort.id, label: interfacePort.label, direction: interfacePort.direction, kind: interfacePort.kind, required: interfacePort.required, kinds: [...ARTIFACT_KINDS] } : null;
    const commentDetails = isCommentFrame(saved) ? { selection, comment: { id: saved.id, x: saved.x, y: saved.y, w: saved.w, h: saved.h, title: saved.title ?? 'Comment', content: saved.content ?? '', color: saved.color ?? '#637d89', moveContents: saved.moveContents !== false, selected: true, readOnly: editor.readOnly || library } } : null;
    const nodeDetails = saved && metadata && !commentDetails ? { ...selection, title: boundary?.label ?? (presentation.alias || (typeof saved.title === 'string' ? saved.title : metadata.canonicalTitle)), canonicalTitle: metadata.canonicalTitle, operation: saved.operation, iconPath: metadata.iconPath, family: metadata.family, familyColor: metadata.familyColor, phase: effective?.phase ?? phaseForNode(graph,saved) ?? metadata.phase ?? graph.mode.slice(7), phaseEditable: graph.mode === 'native-unified' && OPERATIONS[saved.operation]?.phase === 'both', alias: presentation.alias, compact: presentation.compact, enabled: saved.enabled !== false, readOnly: editor.readOnly || library, canPresent: true, controls, ...(fileInput ? { fileInput } : {}), ...(boundary ? { boundary } : {}),
        model: metadata.requestCapability !== 'typed-decision' && metadata.modelRole && (effective?.effective !== 'No model call' || saved.model || saved.profileId || Object.keys(editor?.prepared.drawBase.bindingBlocks?.[selectedId] ?? {}).length) ? { role: saved.modelRole ?? metadata.modelRole, roleEditable: true, editable: !library, profileDefaultModel: editor.prepared.drawBase.profileDefaultModels?.[selectedId] ?? !!saved.profileId, profile: field('profileId', workflow.profiles.map(profile => ({ value: profile.id, label: profile.name }))), model: field('model'), effective: effective?.effective || (library ? [editor.prepared.effectiveNodes[selectedId]?.profileId ?? graph.roles?.[saved.modelRole ?? metadata.modelRole]?.profileId,editor.prepared.effectiveNodes[selectedId]?.model ?? graph.roles?.[saved.modelRole ?? metadata.modelRole]?.model].filter(Boolean).join(' · ') : ''), source: editor.prepared.drawBase.instanceBindingSources?.[selectedId] ? 'Containing instance override' : saved.profileId || saved.model ? 'Node override' : 'Inherited from ' + (saved.modelRole ?? metadata.modelRole), ...(effective?.issue ? {issue: effective.issue} : {}) } : null,
        helperBindings: saved.operation === 'for-each' ? { ...editor.prepared.drawBase.iterationBindings?.[selectedId], editable: !(editor.readOnly || library) } : null,
        modifiers: modifierView(saved, metadata, !(editor.readOnly || library)),
        ports: metadata.ports.map(port => ({ id: port.port, label: port.label, direction: port.dir === 'in' ? 'input' : 'output', kind: port.kind })), issues: [] } : null;
    const choices = library ? [] : previewChoices ?? previewChoicesFor(editor.prepared, workflow.targets);
    const target = pinnedPreview || selectedTarget, selectedKey = choices.find(choice => targetKey(choice.target) === targetKey(target))?.key ?? '';
    const result = workflow.result, sections = result ? result.sections.map((section,i) => ({ id: String(i), label: section.kind, ...section })) : [];
    if (!library && !state.busy && saved && nodeDetails?.modifiers && target?.nodeId === selectedId && target?.workflowId === workflow.graphId && target?.portId === nodeDetails.modifiers.outputPortId && JSON.stringify(target.instancePath) === JSON.stringify(path)) {
        const source = sections.find(section => section.format === 'structured-text' && typeof section.recordedRawText === 'string');
        if (source) {
            const local = applyTextModifiers(source.recordedRawText, saved.modifiers ?? []);
            if (local.ok && JSON.stringify(local.data.trace) !== JSON.stringify(source.recordedModifierTrace ?? [])) {
                const text = boundedText(local.data.text, RENDERED_TEXT_BYTES - 2);
                sections.push({id:'local-modifiers',kind:'text',label:'Local modifier preview · recorded source',text,format:'structured-text',truncated:text !== local.data.text});
            }
        }
    }
    const selector = editor?.view.identity.kind === 'root' ? result?.selectedReviewHandle ?? null : null;
    const outputPreview = { sourceKey: revision, title: 'Output preview', statusDetail: state.status || '', status: !library && target && !selectedKey ? 'removed' : !result ? 'not-run' : state.availability === 'current' ? 'current' : 'stale', choices, selectedKey, pinned: !!pinnedPreview, followSelection: !pinnedPreview, sections: library || target && !selectedKey ? [] : sections, issues: library ? ['Library inspection is read-only and has no runtime output.'] : workflow.issues, busy: state.busy, settlement: library ? null : result?.settlement ?? null, runHere: library || !selectedKey ? null : { enabled: !state.busy && !workflow.targetSummary?.issues?.length, callBound: workflow.targetSummary?.callBound ?? workflow.callBound, issue: workflow.targetSummary?.issues?.join(' ') }, review: selector ? { selector, canApply: result.applyAvailable, persistOnly: result.persistOnly, fresh: !result.applyIssue && state.availability === 'current', selectedRootTerminal: editor?.view.identity.kind === 'root' && target?.kind === 'terminal' && !target.address.instancePath.length, mode: 'root', issue: result.applyIssue } : null };
    const rowSource = state.runState || state.recording, rows = rootWorkflow.rows?.length ? rootWorkflow.rows : idleRunRows, flat = [];
    const visit = (items, depth) => { for (const row of items) { flat.push({ key: JSON.stringify(row.address), address: row.address, title: readNodePresentation(row.node).alias || (typeof row.node?.title === 'string' ? row.node.title : '') || row.node?.operation || row.address.nodeId, kind: row.kind, depth, status: row.status, subphase: row.subphase, durationMs: row.durationMs ?? null, attempts: row.attempts ?? 0, callBound: row.requestBound ?? 0, usage: row.request?.usage ?? null, issue: row.error?.message }); visit(row.children ?? [],depth+1); } }; visit(rows,0);
    const executableCount = rows.reduce((sum,row) => sum+row.executableCount,0), completedCount = rows.reduce((sum,row) => sum+row.completedCount,0), status = state.busy ? rowSource?.status || 'running' : rowSource?.status || (result ? result.ok ? 'completed' : 'failed' : 'not-run');
    const runDetails = { runId: rowSource?.runId || '', status, elapsedMs: rowSource?.elapsedMs ?? null, actualCalls: state.busy ? flat.filter(row=>row.kind==='primitive').reduce((sum,row)=>sum+row.attempts,0) : rootWorkflow.result?.actualCalls ?? flat.filter(row=>row.kind==='primitive').reduce((sum,row)=>sum+row.attempts,0), callBound: rowSource?.plan?.callBound ?? rootWorkflow.result?.callBound ?? rootWorkflow.callBound, completedCount, executableCount, rows: flat, issue: state.preparationError?.message || result?.error || '' };
    const runMeter = { ...runDetails, rows: rows.map(row => ({ id: JSON.stringify(row.address), title: row.address.nodeId, status: row.status, executableCount: row.executableCount, completedCount: row.completedCount })) };
    return { nodeDetails, commentDetails, outputPreview, runDetails, runMeter };
}

function prepareEditorDrawBase(view, snapshots, compiledPhase = () => undefined) {
        const drawBase = structuredClone(view.savedGraph);
        drawBase.nodes = structuredClone(view.effectiveNodes); drawBase.groups ??= {}; drawBase.wires ??= {}; drawBase.nativeCards = {};
        const metadata = { ...view.savedGraph, definitions: snapshots, interface: view.interface };
        let index = 0;
        for (const node of Object.values(drawBase.nodes)) {
            node.presentation = { ...node.presentation, ...readNodePresentation(node) };
            if (typeof node.title !== 'string') delete node.title;
            node.x ??= 40 + index % 3 * 240; node.y ??= 40 + Math.floor(index++ / 3) * 160;
            const phase = compiledPhase(node.id) ?? phaseForNode(view.savedGraph, node);
            const operation = operationFor(node, { phase, mode: view.savedGraph.mode });
            const wrapper = node.type === 'subgraph', boundary = ['subgraph-input', 'subgraph-output'].includes(node.type);
            if (node.type === 'note') { drawBase.nativeCards[node.id] = { canonicalTitle: 'Note', family: 'Organization', familyColor: '#a3aa99', iconPath: 'M5 3h14v18H5zM8 7h8M8 11h8M8 15h5', body: typeof node.content === 'string' ? node.content : '', ports: [], hostResult: false, defaults: {}, controlDescriptors: {}, modelRole: null }; continue; }
            if (!operation && !wrapper && !boundary) continue;
            const actualPorts = portsForNode(metadata, node), rows = { in: 0, out: 0 };
            const interfacePort = boundary ? view.interface.find(port => port.id === node.interfacePortId && port.boundaryNodeId === node.id) : null;
            const title = operation?.title || (wrapper ? snapshots?.[JSON.stringify([node.definition.id, node.definition.version, node.definition.semanticHash])]?.name || 'Subgraph' : interfacePort?.label || node.interfacePortId);
            const family = operation?.family || 'Subgraphs', palette = FAMILY_PALETTE.find(item => item.name === family), discovery = paletteForOperation(node.operation);
            drawBase.nativeCards[node.id] = { canonicalTitle: title, ...(phase || operation?.phase ? { phase: phase ?? operation.phase } : {}), ...(operation?.requestCapability ? { requestCapability: operation.requestCapability } : {}), family, familyColor: palette?.color || '#a3aa99', iconPath: wrapper || boundary ? palette?.icon : discovery.icon,
                body: wrapper ? 'Open the pinned subgraph' : boundary ? 'Definition interface' : operation.title,
                hostResult: !!operation?.terminal, modifierSummary: modifierSummary(node.modifiers ?? []), controlDescriptors: structuredClone(operation?.controlDescriptors ?? {}), defaults: structuredClone(operation?.defaults ?? {}), modelRole: operation?.modelRole ?? null,
                ...(interfacePort ? { boundary: { direction: interfacePort.direction, editable: view.editable === true } } : {}),
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
            const operation=operationFor(unit.node,{phase:phaseForNode(actual.body,unit.node),mode:actual.body.mode});
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
        const drawBase=prepareEditorDrawBase(view,snapshots);drawBase.iterationBindings={};
        for(const node of Object.values(actual.body.nodes))if(node.operation==='for-each')drawBase.iterationBindings[node.id]=prepareIterationBindings(node,snapshots,prepareNodeProfileOptions().map(option=>({id:option.value,name:option.label})),scope.graph.roles??{});
        preparedViews.push({identity,definitionRef:ref,readOnly:true,...view,ports,drawBase});
    }
    return {ok:true,data:{navigation,preparedViews,definitionInfo}};
}

function detailControl(key,label,descriptor,value) {
 const editor=descriptor.editor==='json'||descriptor.type==='object'||descriptor.type==='array'&&descriptor.items!=='string'?'json':descriptor.type==='enum'?'enum':descriptor.type==='array'?'lines':['integer','number'].includes(descriptor.type)?'number':descriptor.type==='boolean'?'boolean':'text';
 return {key,label,value:value ?? descriptor.default,editor,...(descriptor.help?{help:descriptor.help}:{}),...(editor==='json'?(descriptor.type==='string'?{representation:'json-text',allowEmpty:true}:{representation:'json-value'}):{}),...(descriptor.values?{options:descriptor.values.map(value=>({value,label:descriptor.valueLabels?.[value]??value}))}:{}),...(descriptor.min!==undefined?{min:descriptor.min}:{}),...(descriptor.max!==undefined?{max:descriptor.max}:{}),...(editor==='number'?{step:descriptor.step ?? (descriptor.type==='integer'?1:'any')}:{})};
}
const friendlyControlLabel = key => ({ maxTokens: 'Output tokens', budgetTokens: 'Token budget', pins: 'Pinned wording', rules: 'Rules' }[key] ?? key.replace(/([A-Z])/g, char => ' ' + char.toLowerCase()).replace(/^./, char => char.toUpperCase()));
const displayEffective = value => {const text = typeof value === 'string' ? value : JSON.stringify(value);return text?.length > 256 ? text.slice(0,256) + '…' : text;};
function visibleDetailControl(node, defaults, key) {
 const value = name => node?.[name] ?? defaults[name];
 if (node?.operation === 'compose') return key !== 'template' || value('mode') === 'template' ? key !== 'separator' || value('mode') === 'join' : false;
 if (node?.operation === 'text-rules') return key !== 'separator' || value('mode') === 'extract' ? !['scope','protectedLiterals'].includes(key) || value('inputKind') === 'draft' : false;
 if (node?.operation === 'smart-compactor' && key === 'maxTokens') return value('method') === 'compress';
 return true;
}
function detailPresentation(operation, key) {
 const structured = key === 'sections' && operation === 'compose' ? 'sections'
  : key === 'fields' && operation === 'select-fields' ? 'fields'
  : key === 'rules' && operation === 'text-rules' ? 'rules'
  : key === 'inputs' && operation === 'context-join' ? 'slots'
  : key === 'updates' && operation === 'state' ? 'numeric-map'
  : key === 'durations' ? 'durations' : undefined;
 const group = operation === 'fast-decision' && key.startsWith('fallback') ? 'Decision fallback' : ['pins','protectedLiterals','exemptions'].includes(key) ? 'Protections'
  : ['min','max','baseline','decay'].includes(key) ? 'Bounds'
  : key === 'durations' ? 'Phases'
  : ['separator','maxTokens'].includes(key) ? 'Output' : 'Main';
 return {group, ...(group !== 'Main' ? {advanced:true} : {}), ...(structured ? {structured} : {}), ...(['actorId','curveId','trackId','idempotencyKey','promptId'].includes(key) ? {singleLine:true} : {})};
}
function modifierView(node, metadata, editable) {
 const outputs = metadata.ports.filter(port => port.dir === 'out');
 if (node.type !== 'workflow' || metadata.hostResult || outputs.length !== 1 || outputs[0].kind !== 'text') return null;
 const options = Object.values(modifierTypes).map(type => ({type:type.type,label:type.label,defaultSettings:structuredClone(type.defaultSettings),fields:type.fields.map(field => detailControl(field.key,field.label,{type:field.type === 'enum' ? 'enum' : field.type,values:field.options,min:field.min,max:field.max}, type.defaultSettings[field.key]))}));
 return {items:structuredClone(node.modifiers ?? []), options, editable, outputPortId:outputs[0].port};
}
export function projectDefinitionInstance(info,wrapper,profiles=[],effectiveControls={},effectiveBindings={}) {
 const modes=[{value:'inherit',label:'Inherit definition'},{value:'override',label:'Override'},{value:'block',label:'Block inheritance'}];
 const field=(binding,key)=>({mode:Object.hasOwn(binding ?? {},key)?binding[key]===null?'block':'override':'inherit',value:binding?.[key] ?? null,allowedModes:modes,...(key==='profileId'?{options:profiles.map(profile=>({value:profile.id,label:profile.name}))}:{})});
 const parameters=info.parameters.map(row=>{const value=Object.hasOwn(wrapper.parameterOverrides ?? {},row.id)?wrapper.parameterOverrides[row.id]:row.control.value,effective=effectiveControls[row.id] ?? row.control.value;return {...row,overridden:Object.hasOwn(wrapper.parameterOverrides ?? {},row.id),control:{...row.control,value,...(JSON.stringify(value)===JSON.stringify(effective)?{}:{effective:displayEffective(effective),source:'Effective instance override'})}};});
 const bindings=[...info.roles.map(role=>({key:'role:'+role.id,label:'Role '+role.label,target:{kind:'role',role:role.id},saved:wrapper.roleOverrides?.[role.id]})),...info.nodeBindings.map(row=>({key:'node:'+row.id,label:row.label,target:row.target,saved:wrapper.nodeBindingOverrides?.[row.id]}))].map(row=>({key:row.key,label:row.label,target:row.target,editable:true,profile:field(row.saved,'profileId'),model:field(row.saved,'model'),effective:effectiveBindings[row.key] || 'No model call',source:'Saved instance override or definition binding'}));
 return {parameters,bindings};
}
export function projectDefinitionUpdate(previous,next) {
 const rows=(old,choices,compatible=()=>true)=>old.map(row=>{const options=choices.filter(choice=>compatible(row,choice)).map(choice=>({id:choice.id,label:choice.label}));return {from:row.id,label:row.label,to:options.some(choice=>choice.id===row.id)?row.id:null,options,canDrop:true};});
 return {portMap:rows(previous.interface,next.interface,(a,b)=>a.direction===b.direction&&a.kind===b.kind),parameterMap:rows(previous.parameters,next.parameters),roleMap:rows(previous.roles,next.roles),nodeBindingMap:rows(previous.nodeBindings,next.nodeBindings)};
}
