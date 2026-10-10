import { REMASTERED_WORKFLOW_EXAMPLE_DATA } from './remastered-example-data.js?v=0.26.0';
import { UNIFIED_WORKFLOW_EXAMPLE_DATA } from './unified-example-data.js?v=0.26.0';
import { WORKFLOW_EXAMPLE_DATA } from './example-data.js?v=0.26.0';
import { parseWorkflow } from './packages.js?v=0.26.0';
import { cloneWorkflowDocument } from './document.js?v=0.26.0';
import { validateWorkflow } from './contracts.js?v=0.26.0';

const ALL_WORKFLOW_EXAMPLES = [...REMASTERED_WORKFLOW_EXAMPLE_DATA, ...WORKFLOW_EXAMPLE_DATA, ...UNIFIED_WORKFLOW_EXAMPLE_DATA];
const lessonMetadata = lesson => lesson ? structuredClone(lesson) : undefined;
let sequence = 0;
const fail = (code, message) => ({ ok: false, error: { code, message } });
const plain = value => value !== null && typeof value === 'object' && [Object.prototype, null].includes(Object.getPrototypeOf(value));
function admitExamplePackages(entry) {
    try {
        if (!Array.isArray(entry.packages) || !entry.packages.length) return fail('MALFORMED_EXAMPLE', 'That workflow example has no primary package.');
        const graphs = [];
        for (const envelope of entry.packages) {
            const parsed = parseWorkflow(JSON.stringify(envelope));
            if (!parsed.ok) return parsed;
            const validation = validateWorkflow(parsed.data);
            if (!validation.ok) return validation;
            graphs.push(parsed.data);
        }
        return { ok: true, data: graphs };
    } catch { return fail('MALFORMED_EXAMPLE', 'That workflow example contains malformed local package data.'); }
}
function destinationRegistry(settings) {
    try {
        if (!plain(settings)) return null;
        const property = Object.getOwnPropertyDescriptor(settings, 'graphs');
        if (!property?.writable || !Object.hasOwn(property, 'value') || !plain(property.value)) return null;
        const descriptors = Object.getOwnPropertyDescriptors(property.value);
        if (Reflect.ownKeys(descriptors).some(key => typeof key !== 'string' || ['__proto__', 'prototype', 'constructor'].includes(key) || !descriptors[key].enumerable || !Object.hasOwn(descriptors[key], 'value'))) return null;
        const entries = Object.fromEntries(Object.entries(descriptors).map(([key, descriptor]) => [key, descriptor.value]));
        if (Object.values(entries).some(graph => !plain(graph) || Object.getOwnPropertyDescriptor(graph, 'name') && !Object.hasOwn(Object.getOwnPropertyDescriptor(graph, 'name'), 'value'))) return null;
        return entries;
    } catch { return null; }
}
function independentCopy(source, registry, names) {
    const cloned = cloneWorkflowDocument(source);
    if (!cloned.ok) return cloned;
    const graph = cloned.data;
    const suffix = `${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}-${++sequence}`;
    let id = `example-copy-${suffix}`;
    while (Object.hasOwn(registry, id)) id = `example-copy-${suffix}-${++sequence}`;
    const nodes = Object.fromEntries(Object.keys(graph.nodes).map(id => [id, `${id}-${suffix}`]));
    const groups = Object.fromEntries(Object.keys(graph.groups).map(id => [id, `${id}-${suffix}`]));
    const portals = Object.fromEntries(Object.keys(graph.portals).map(id => [id, `${id}-${suffix}`]));
    graph.nodes = Object.fromEntries(Object.values(graph.nodes).map(node => {
        node.id = nodes[node.id];
        if (node.inGroup) node.inGroup = groups[node.inGroup];
        return [node.id, node];
    }));
    graph.wires = Object.fromEntries(Object.values(graph.wires).map(wire => {
        wire.id = `${wire.id}-${suffix}`; wire.to = nodes[wire.to];
        if (wire.route === 'wire') wire.from = nodes[wire.from];
        else wire.portalId = portals[wire.portalId];
        return [wire.id, wire];
    }));
    graph.groups = Object.fromEntries(Object.values(graph.groups).map(group => {
        group.id = groups[group.id];
        if (group.members) group.members = group.members.map(id => nodes[id]);
        return [group.id, group];
    }));
    graph.portals = Object.fromEntries(Object.values(graph.portals).map(portal => {
        portal.id = portals[portal.id]; portal.source.nodeId = nodes[portal.source.nodeId];
        return [portal.id, portal];
    }));
    let name = graph.name, ordinal = 2;
    while (names.has(name)) name = `${graph.name} (${ordinal++})`;
    names.add(name); graph.id = id; graph.name = name;
    graph.createdAt = graph.updatedAt = Date.now();
    return cloneWorkflowDocument(graph);
}

/** Read independent primary graph data from the local portable example catalog. */
export function listWorkflowExamples() {
    return REMASTERED_WORKFLOW_EXAMPLE_DATA.map(({ id, number, title, goal, lesson, packages }) => {
        const parsed = parseWorkflow(JSON.stringify(packages[0]));
        if (!parsed.ok) throw new Error(`${title}: ${parsed.error.message}`);
        return { id, number, title, goal, lesson: lessonMetadata(lesson), graph: parsed.data };
    });
}

/** Preserve catalog metadata when one bundle fails admission. Every successful
 * Result owns a detached primary graph; every companion has also passed admission.
 * @returns {import('./examples').WorkflowExampleResult[]}
 */
export function listWorkflowExampleResults() {
    return REMASTERED_WORKFLOW_EXAMPLE_DATA.map(entry => {
        const { id, number, title, goal } = entry, admitted = admitExamplePackages(entry);
        return { id, number, title, goal, lesson: lessonMetadata(entry.lesson), result: admitted.ok ? { ok: true, data: admitted.data[0] } : admitted };
    });
}

/** Install independent local roots. Saving, activation, assignment and running belong to the caller.
 * @param {string} id
 * @param {{graphs: Record<string, import('./types').NativeGraph3>}} settings
 * @returns {import('./types').Result<{graph: import('./types').NativeGraph3, companions: import('./types').NativeGraph3[]}>}
 */
export function installWorkflowExample(id, settings) {
    const entry = ALL_WORKFLOW_EXAMPLES.find(entry => entry.id === id);
    if (!entry) return fail('UNKNOWN_EXAMPLE', 'That workflow example is unavailable.');
    const registry = destinationRegistry(settings);
    if (!registry) return fail('INVALID_EXAMPLE_DESTINATION', 'Use a writable local workflow registry.');
    const admitted = admitExamplePackages(entry);
    if (!admitted.ok) return admitted;
    const names = new Set(Object.values(registry).map(graph => Object.getOwnPropertyDescriptor(graph, 'name')?.value)), prepared = [];
    for (const graph of admitted.data) {
        const result = independentCopy(graph, registry, names);
        if (!result.ok) return result;
        const validation = validateWorkflow(result.data);
        if (!validation.ok) return validation;
        registry[result.data.id] = result.data; prepared.push(result.data);
    }
    settings.graphs = registry;
    return { ok: true, data: { graph: prepared[0], companions: prepared.slice(1) } };
}
