import { isNativeWorkflow, safeWorkflowData, validateGraphStructure } from './contracts.js?v=0.19.1';
import { normalizeNativeGraph } from './migration.js?v=0.19.1';
import { operationFor } from './catalog.js?v=0.19.1';
import { graphDocumentSignature, graphSemanticSignature } from './ports.js?v=0.19.1';
import { normalizeLegacyInsertionGraph, validateLegacyInsertionGraph, legacyInsertionSignature, legacyInsertionDiagnostics } from './legacy-insertion.js?v=0.19.1';
import { parseWorkflow } from './packages.js?v=0.19.1';

const fail = (code, message) => ({ ok: false, error: { code, message } });

/** Parse a saved file for additive review; never install it or synthesize legacy Output.
 * Native package/version errors remain native errors, without legacy fallback.
 * @param {string} json
 * @returns {import('./types').Result<import('./types').NativeGraph2|import('./types').NativeGraph3|import('./legacy-insertion').LegacyInsertionGraph>}
 */
export function parseWorkflowInsertionFile(json) {
    if (typeof json !== 'string' || json.length > 2000000) return fail('MALFORMED_WORKFLOW', 'Workflow JSON must be at most 2 MB.');
    let parsed;
    try { parsed = JSON.parse(json); } catch { return fail('INVALID_JSON', 'That is not valid workflow JSON.'); }
    if (!safeWorkflowData(parsed) || !parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fail('MALFORMED_WORKFLOW', 'Expected a bounded plain workflow file.');
    if (['lattice-workflow', 'comfytavern-workflow', 'lattice-subgraph'].includes(parsed.kind)) return parseWorkflow(json);
    if (parsed.kind !== undefined && (parsed.kind !== 'prompt-canvas-graph' || parsed.schema !== 1)) return fail('UNSUPPORTED_PACKAGE', 'Open a supported workflow or legacy canvas file.');
    const graph = parsed.graph ?? parsed;
    if (isNativeWorkflow(graph)) {
        const validation = validateGraphStructure(graph);
        return validation.ok ? { ok: true, data: structuredClone(graph) } : validation;
    }
    return normalizeLegacyInsertionGraph(graph, { compatibility: true });
}

/**
 * @typedef {'nodes'|'wires'|'groups'|'portals'|'definitions'|'roles'} IdentityKind
 * @typedef {{at?: {x:number, y:number}, allocateId?: (kind:IdentityKind, sourceId:string) => string, viewPath?: string[]}} InsertionOptions
 * @typedef {{phase:string, bindingReviewRequired:boolean, requiredRoles:string[], unresolvedBindings:Array<{nodeId:string, role:string|null, missing:string[]}>, terminals:Array<{nodeId:string, operation:string}>, callBound:number, importedCallBound:number, inheritedBindings?:string[], boundKind?:string, recipientOutputPreserved?:string|null}} InsertionDiagnostics
 * @typedef {{candidate:import('./types').NativeGraph2|import('./types').NativeGraph3|import('./legacy-insertion').LegacyInsertionGraph, diagnostics:InsertionDiagnostics, added:Record<IdentityKind,string[]>, identityMap:Record<IdentityKind,Record<string,string>>, viewPath:string[], baseSignature:string, baseDocumentSignature:string}} PreparedInsertion
 */

function reviewDiagnostics(candidate, added) {
    const bound = node => {
        if (node.enabled === false || candidate.groups?.[node.inGroup]?.enabled === false) return 0;
        const value = operationFor(node)?.requestBound ?? 0;
        return typeof value === 'function' ? value(node) : value;
    };
    const nodes = added.nodes.map(id => candidate.nodes[id]);
    const requests = nodes.filter(node => bound(node) > 0);
    const unresolvedBindings = requests.flatMap(node => {
        const role = candidate.roles[node.modelRole];
        const missing = ['profileId', 'model'].filter(key => !(node[key] || role?.[key]));
        return missing.length ? [{ nodeId: node.id, role: node.modelRole ?? null, missing }] : [];
    });
    return {
        phase: candidate.mode.slice(7), bindingReviewRequired: requests.length > 0,
        requiredRoles: [...new Set(requests.map(node => node.modelRole).filter(Boolean))],
        unresolvedBindings,
        terminals: nodes.filter(node => operationFor(node)?.terminal).map(node => ({ nodeId: node.id, operation: node.operation })),
        // Conservative authoring bound includes unfinished branches; no binding/host preflight.
        callBound: Object.values(candidate.nodes).reduce((sum, node) => sum + bound(node), 0),
        importedCallBound: nodes.reduce((sum, node) => sum + bound(node), 0),
    };
}

/**
 * Prepare an additive same-mode document without changing either input or host state.
 * `at` anchors the imported nodes' top-left exactly; default placement clears saved bounds.
 * The injected allocator must be pure. It receives the identity kind and original ID.
 * Unresolved bindings describe missing saved metadata, never local profile availability.
 * Legacy baseSignature is conservative editable-document identity, not native execution identity.
 * @param {unknown} destination
 * @param {unknown} imported
 * @param {InsertionOptions} [options]
 * @returns {import('./types').Result<PreparedInsertion>}
 */
export function prepareWorkflowInsertion(destination, imported, options = {}) {
    try {
        if (!options || typeof options !== 'object' || Array.isArray(options) || ![Object.prototype, null].includes(Object.getPrototypeOf(options))) return fail('INVALID_OPTIONS', 'Expected insertion options.');
        const descriptors = Object.getOwnPropertyDescriptors(options);
        if (Object.values(descriptors).some(property => !('value' in property))) return fail('INVALID_OPTIONS', 'Insertion options must be plain data.');
        const { allocateId, at, viewPath = [] } = options;
        if ((allocateId !== undefined && typeof allocateId !== 'function') || (at !== undefined && (!safeWorkflowData(at) || !at || !Number.isFinite(at.x) || !Number.isFinite(at.y))) || !safeWorkflowData(viewPath) || !Array.isArray(viewPath) || viewPath.some(id => typeof id !== 'string' || !id)) return fail('INVALID_OPTIONS', 'Provide finite placement coordinates, a path of instance IDs, and an ID allocator.');
        if (viewPath.length) return fail('READ_ONLY_VIEW', 'Open the root graph to insert this workflow. Pinned bodies require an explicit local copy.');
        const native = isNativeWorkflow(destination);
        if (native !== isNativeWorkflow(imported)) return fail('MODE_MISMATCH', 'Open this workflow separately: its graph mode or phase differs.');
        // Reject composition before its validator can interpret partially staged data.
        // Task5 removes this gate together with complete reference-remapping coverage.
        if (native) for (const graph of [destination, imported]) {
            if (safeWorkflowData(graph) && graph && typeof graph === 'object' && (Object.keys(graph.portals ?? {}).length || Object.keys(graph.definitions ?? {}).length || Object.values(graph.nodes ?? {}).some(node => node?.type === 'subgraph'))) return fail('UNSUPPORTED_COMPOSITION', 'Composition insertion requires pinned-definition and portal remapping support.');
        }
        const normalize = native ? normalizeNativeGraph : normalizeLegacyInsertionGraph;
        const target = normalize(destination), source = native ? normalize(imported) : normalize(imported, { compatibility: true });
        if (!target.ok) return target;
        if (!source.ok) return source;
        if (!native && [...Object.values(target.data.nodes), ...Object.values(source.data.nodes)].filter(node => node.type === 'output').length > 1) return fail('DUPLICATE_OUTPUT', 'A legacy graph has one Output. Open separately, or import a fragment without Output.');
        if (native && target.data.mode !== source.data.mode) return fail('MODE_MISMATCH', 'Open this workflow separately: its graph mode or phase differs.');
        for (const graph of [target.data, source.data]) {
            // Task5 owns composition validation and the corresponding identity/reference remapping.
            if (Object.keys(graph.portals ?? {}).length || Object.keys(graph.definitions ?? {}).length || Object.values(graph.nodes).some(node => node.type === 'subgraph')) return fail('UNSUPPORTED_COMPOSITION', 'Composition insertion requires pinned-definition and portal remapping support.');
            const items = [...Object.values(graph.nodes), ...Object.values(graph.groups ?? {})];
            const boxes = [...items, ...items.filter(item => item.frame !== undefined).map(item => item.frame)];
            if (boxes.some(box => !box || typeof box !== 'object' || Array.isArray(box) || ['x', 'y', 'w', 'h', 'width', 'height'].some(key => box[key] !== undefined && !Number.isFinite(box[key])))) return fail('INVALID_LAYOUT', 'Layout coordinates and dimensions must be finite numbers.');
        }
        const baseSignature = native ? graphSemanticSignature(destination) : legacyInsertionSignature(destination);
        const baseDocumentSignature = graphDocumentSignature(destination);
        let candidate = target.data;
        const nodes = Object.values(source.data.nodes);
        const left = Math.min(...nodes.map(node => node.x ?? 0), ...(!nodes.length ? [0] : []));
        const top = Math.min(...nodes.map(node => node.y ?? 0), ...(!nodes.length ? [0] : []));
        const extentLeft = Math.min(left, ...Object.values(source.data.groups ?? {}).flatMap(group => [group.x ?? 0, ...(group.frame ? [group.frame.x] : [])]));
        const recipient = [...Object.values(candidate.nodes), ...Object.values(candidate.groups ?? {})];
        const right = Math.max(...recipient.map(item => (item.x ?? 0) + (item.w ?? item.width ?? 260)), ...Object.values(candidate.groups ?? {}).filter(group => group.frame).map(group => group.frame.x + group.frame.w));
        const offset = at ? { x: at.x - left, y: at.y - top } : { x: recipient.length ? right + 48 - extentLeft : 0, y: 0 };
        const translate = item => { item.x = (item.x ?? 0) + offset.x; item.y = (item.y ?? 0) + offset.y; };
        const identityMap = { nodes: {}, wires: {}, groups: {}, portals: {}, definitions: {}, roles: {} };
        const added = { nodes: [], wires: [], groups: [], portals: [], definitions: [], roles: [] };
        const occupied = new Set(['nodes', 'wires', 'groups', 'portals', 'definitions'].flatMap(kind => [...Object.keys(candidate[kind] ?? {}), ...Object.keys(source.data[kind] ?? {})]));
        let serial = 0;
        for (const kind of ['nodes', 'wires', 'groups']) {
            candidate[kind] ??= {};
            for (const id of Object.keys(source.data[kind] ?? {})) {
                let fresh, attempts = 0;
                do {
                    if (allocateId && ++attempts > 100) return fail('IDENTITY_COLLISION', 'The identity allocator could not produce a fresh ID.');
                    fresh = allocateId ? allocateId(kind, id) : `import-${++serial}`;
                    if (typeof fresh !== 'string' || !fresh.length || ['__proto__', 'prototype', 'constructor'].includes(fresh)) return fail('INVALID_ID', 'The identity allocator must return a safe nonempty string.');
                } while (occupied.has(fresh));
                occupied.add(fresh);
                identityMap[kind][id] = fresh;
                added[kind].push(fresh);
            }
        }
        if (native) candidate.roles ??= {};
        const roles = new Set(native ? Object.keys(source.data.roles ?? {}) : []);
        for (const node of native ? Object.values(source.data.nodes) : []) {
            const role = node.modelRole ?? operationFor(node)?.modelRole;
            if (role) roles.add(role);
        }
        for (const role of roles) {
            let suffix = 1, fresh;
            do { fresh = `Import ${suffix++}: ${role}`; } while (Object.hasOwn(candidate.roles, fresh));
            identityMap.roles[role] = fresh;
            added.roles.push(fresh);
            candidate.roles[fresh] = structuredClone(source.data.roles?.[role] ?? { profileId: null, model: null });
        }
        for (const node of Object.values(source.data.nodes)) {
            const role = native ? node.modelRole ?? operationFor(node)?.modelRole : null;
            if (role) node.modelRole = identityMap.roles[role];
            if (!native && node.type === 'decider') for (const key of node.keys ?? []) for (const condition of key.conditions ?? []) {
                if (condition?.input) condition.input = identityMap.wires[condition.input];
            }
            translate(node);
            node.id = identityMap.nodes[node.id];
            if (node.inGroup !== undefined) node.inGroup = identityMap.groups[node.inGroup];
            candidate.nodes[node.id] = node;
        }
        for (const wire of Object.values(source.data.wires)) {
            wire.id = identityMap.wires[wire.id];
            wire.from = identityMap.nodes[wire.from];
            wire.to = identityMap.nodes[wire.to];
            candidate.wires[wire.id] = wire;
        }
        for (const group of Object.values(source.data.groups ?? {})) {
            translate(group);
            if (group.frame) translate(group.frame);
            group.id = identityMap.groups[group.id];
            if (group.entry !== undefined) group.entry = identityMap.nodes[group.entry];
            if (group.exit !== undefined) group.exit = identityMap.nodes[group.exit];
            if (group.members !== undefined) group.members = group.members.map(id => identityMap.nodes[id]);
            candidate.groups[group.id] = group;
        }
        // An empty fragment must not create optional containers or upgrade a schema.
        if (Object.values(added).every(ids => ids.length === 0)) candidate = structuredClone(destination);
        const validation = native ? validateGraphStructure(candidate) : validateLegacyInsertionGraph(candidate);
        return validation.ok ? { ok: true, data: { candidate, diagnostics: native ? reviewDiagnostics(candidate, added) : legacyInsertionDiagnostics(candidate, added, destination), added, identityMap, viewPath: [...viewPath], baseSignature, baseDocumentSignature } } : validation;
    } catch {
        return fail('INSERTION_FAILED', 'Could not prepare this workflow insertion.');
    }
}
