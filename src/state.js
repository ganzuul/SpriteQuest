/** Current Lattice documents and settings. SillyTavern owns its normal prompt. */
import { installStarter, starterGraph } from './workflow/starters.js?v=0.27.0';
import { exportWorkflow, parseWorkflow } from './workflow/packages.js?v=0.27.0';
import { safeWorkflowData, validateGraphStructure } from './workflow/contracts.js?v=0.27.0';
import { cloneWorkflowDocument } from './workflow/document.js?v=0.27.0';
import { commitPreparedGraph, graphEditSignature } from './workflow/transactions.js?v=0.27.0';
import * as graphHistory from './history.js?v=0.27.0';

export const MODULE = 'lattice';
export const ctx = () => globalThis.SillyTavern.getContext();
export function uid(prefix = 'n') { return prefix + '_' + (globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2)); }
export function safe(fn, fallback = undefined) { try { return fn(); } catch { return fallback; } }
const admitted = new WeakSet();
const plain = value => value && typeof value === 'object' && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));

/** Settings registries contain independently bounded documents, not one package. */
function dataRecord(value) {
    try {
        if (!plain(value)) return null;
        const descriptors = Object.getOwnPropertyDescriptors(value), result = {};
        for (const key of Reflect.ownKeys(descriptors)) {
            const descriptor = descriptors[key];
            if (typeof key !== 'string' || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value') || !safeWorkflowData({ [key]: null })) return null;
            result[key] = descriptor.value;
        }
        return result;
    } catch { return null; }
}

function checkRegistry(value) {
    const entries = dataRecord(value);
    return entries && Object.values(entries).every(safeWorkflowData);
}

function checkSettings(value) {
    const saved = dataRecord(value), metadata = {}, graphs = dataRecord(saved?.graphs), library = dataRecord(saved?.subgraphLibrary);
    if (saved) for (const [key, item] of Object.entries(saved)) if (!['graphs', 'subgraphLibrary', 'workspaceViews'].includes(key)) metadata[key] = item;
    if (!saved || !safeWorkflowData(metadata) || saved.schema !== 1 || typeof saved.enabled !== 'boolean' || !graphs || !plain(saved.nativeBindings) || !plain(saved.ui) || !library || !checkRegistry(library.definitions ?? {}) || !safeWorkflowData(Object.fromEntries(Object.entries(library).filter(([key]) => key !== 'definitions'))) || !checkRegistry(saved.workspaceViews ?? {})) throw new Error('Lattice settings must be a current plain-data document (schema 1).');
    if (Object.hasOwn(saved, 'workflowMode')) throw new Error('Lattice settings contain an unsupported workflow mode.');
    const checkedGraphs = {};
    for (const [id, graph] of Object.entries(graphs)) {
        const checked = cloneWorkflowDocument(graph);
        if (!checked.ok || checked.data.id !== id) throw new Error('Lattice workflow document ' + id + ' is invalid: ' + (checked.error?.message ?? 'unsupported identity'));
        checkedGraphs[id] = checked.data;
    }
    if (saved.activeGraphId !== null && !Object.hasOwn(graphs, saved.activeGraphId)) throw new Error('Lattice settings refer to an unavailable active workflow.');
    for (const [phase, field] of [['pre', 'preGraphId'], ['post', 'postGraphId'], ['unified', 'workflowGraphId']]) {
        const id = saved.nativeBindings[field];
        if (phase === 'unified' && id === undefined) continue; // Legacy settings remain independently assigned.
        if (id !== null && (typeof id !== 'string' || checkedGraphs[id]?.mode !== 'native-' + phase)) throw new Error('Lattice ' + phase + ' binding does not identify a current workflow.');
    }
}

/** Admit saved settings once; camera projections never repeat domain validation. */
export function settings() {
    const c = ctx(), root = c.extensionSettings ?? c.extension_settings;
    if (!plain(root)) throw new Error('Lattice: getContext() exposed no extension settings.');
    const property = Object.getOwnPropertyDescriptor(root, MODULE);
    if (!property) {
        const value = { schema: 1, enabled: false, graphs: {}, activeGraphId: null, nativeBindings: { workflowGraphId: null, preGraphId: null, postGraphId: null }, subgraphLibrary: { definitions: {} }, ui: {} };
        const graph = installStarter('unified-basic', value);
        value.activeGraphId = graph.id;
        checkSettings(value);
        root[MODULE] = value; admitted.add(value);
        return value;
    }
    if (!('value' in property)) throw new Error('Lattice settings must not contain an accessor.');
    const value = property.value;
    if (!admitted.has(value)) { checkSettings(value); admitted.add(value); }
    return value;
}
export function save() { safe(() => ctx().saveSettingsDebounced()); }

/** An empty current authoring document; terminals and connections are explicit. */
export function blankGraph(name = 'Untitled', phase = 'unified') {
    return { id: uid('g'), name, description: '', schema: 3, runtime: 2, mode: phase === 'unified' ? 'native-unified' : phase === 'post' ? 'native-post' : 'native-pre', createdAt: Date.now(), updatedAt: Date.now(), nodes: {}, wires: {}, portals: {}, definitions: {}, groups: {}, roles: {}, view: { x: 0, y: 0, zoom: 1 } };
}
export function allGraphs() { return Object.values(settings().graphs).sort((a, b) => a.name.localeCompare(b.name)); }
export function getGraph(id) { return settings().graphs[id] ?? null; }
export function resolveGraph() { const graph = getGraph(settings().activeGraphId); return { graph, source: graph ? 'active' : 'none' }; }
export function createGraph(name, phase = 'unified') {
    const graph = blankGraph(name || 'Untitled', phase);
    if (phase === 'unified') { const starter = starterGraph('unified-basic'); Object.assign(graph, { nodes: starter.nodes, wires: starter.wires }); }
    settings().graphs[graph.id] = graph; save(); return graph;
}
export function duplicateGraph(id, name) {
    const source = getGraph(id); if (!source) return null;
    const graph = structuredClone(source); graph.id = uid('g'); graph.name = name || source.name + ' copy';
    graph.createdAt = graph.updatedAt = Date.now(); settings().graphs[graph.id] = graph; save(); return graph;
}
export function deleteGraph(id) {
    const value = settings(); if (!Object.hasOwn(value.graphs, id)) return;
    delete value.graphs[id];
    for (const field of ['workflowGraphId', 'preGraphId', 'postGraphId']) if (value.nativeBindings[field] === id) value.nativeBindings[field] = null;
    if (!Object.keys(value.graphs).length) { const graph = blankGraph(); value.graphs[graph.id] = graph; }
    if (value.activeGraphId === id) value.activeGraphId = Object.keys(value.graphs)[0];
    save();
}

const touchListeners = new Set();
export function syncGroupMembers(graph) {
    for (const group of Object.values(graph?.groups ?? {})) {
        if (!Array.isArray(group.members)) continue;
        const members = Object.values(graph.nodes).filter(node => node.inGroup === group.id).map(node => node.id);
        group.members = members;
    }
}
export function onGraphTouched(fn) { touchListeners.add(fn); return () => touchListeners.delete(fn); }
export function touchGraph(graph) {
    if (!graph) return; syncGroupMembers(graph); graph.updatedAt = Date.now(); save();
    for (const fn of touchListeners) safe(() => fn(graph));
}
function finishGraphDocumentEdit(graph, summary, hooks) {
    if (summary.semanticChanged) safe(() => hooks.onSemanticChange?.(graph, summary));
    safe(() => hooks.reconcileViews?.(graph, summary));
    const property = Object.getOwnPropertyDescriptor(graph, 'updatedAt');
    if (property?.writable || !property && Object.isExtensible(graph)) graph.updatedAt = Date.now();
    save();
    for (const fn of touchListeners) safe(() => fn(graph, { history: false, semanticChanged: summary.semanticChanged }));
}
export function commitGraphEdit(graph, prepared, hooks = {}) {
    const result = commitPreparedGraph(graph, prepared);
    if (result.ok && result.data.changed) finishGraphDocumentEdit(graph, result.data, hooks);
    return result;
}
export function stepGraphHistory(graph, direction, hooks = {}) {
    if (!['undo', 'redo'].includes(direction)) return { ok: false, error: { code: 'INVALID_HISTORY_ACTION', message: 'Choose Undo or Redo.' } };
    const before = graphEditSignature(graph), label = graphHistory[direction](graph);
    const summary = { changed: !!label, semanticChanged: !!label && before !== graphEditSignature(graph), rootId: graph.id, label };
    if (summary.changed) finishGraphDocumentEdit(graph, summary, hooks);
    return { ok: true, data: summary };
}

/** Groups are presentation only; executable interfaces belong to subgraphs. */
export function groupMembers(graph, id) { return Object.values(graph.nodes).filter(node => node.inGroup === id); }
export function groupOf(graph, node) { return node?.inGroup ? graph.groups?.[node.inGroup] ?? null : null; }
export function groupNodes(graph, ids, title = 'Group') {
    const members = ids.map(id => graph.nodes[id]).filter(Boolean); if (members.length < 2) return null;
    const x = Math.min(...members.map(node => node.x)), y = Math.min(...members.map(node => node.y));
    const group = { id: uid('grp'), title, collapsed: true, x, y, w: 180, frame: { x: x - 20, y: y - 40, w: Math.max(...members.map(node => node.x + 180)) - x + 40, h: Math.max(...members.map(node => node.y + 80)) - y + 60 } };
    graph.groups ??= {}; graph.groups[group.id] = group;
    for (const node of members) node.inGroup = group.id;
    touchGraph(graph); return group;
}
export function createBlanket(graph, x, y, { w = 560, h = 340, title = 'Group' } = {}) {
    const group = { id: uid('grp'), title, collapsed: false, x: Math.round(x), y: Math.round(y), w: 180, frame: { x: Math.round(x), y: Math.round(y), w, h } };
    graph.groups ??= {}; graph.groups[group.id] = group; touchGraph(graph); return group;
}
export function ungroup(graph, id) {
    for (const node of groupMembers(graph, id)) delete node.inGroup;
    delete graph.groups[id]; touchGraph(graph);
}

export function exportGraph(id) { const graph = getGraph(id); return graph ? JSON.stringify(exportWorkflow(graph)) : null; }
export function importGraph(json) {
    const parsed = parseWorkflow(json);
    if (!parsed.ok) return { ...parsed, reason: parsed.error.message };
    const graph = structuredClone(parsed.data); graph.id = uid('g');
    const taken = new Set(allGraphs().map(item => item.name)), base = graph.name || 'Imported';
    let name = base, count = 2; while (taken.has(name)) name = base + ' (' + count++ + ')';
    graph.name = name; graph.createdAt = graph.updatedAt = Date.now(); settings().graphs[graph.id] = graph; save();
    return { ok: true, graph };
}
