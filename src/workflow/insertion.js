import { isNativeWorkflow, safeWorkflowData, validateGraphStructure } from './contracts.js?v=0.19.1';
import { normalizeNativeGraph } from './migration.js?v=0.19.1';
import { operationFor } from './catalog.js?v=0.19.1';
import { graphDocumentSignature, graphSemanticSignature } from './ports.js?v=0.19.1';
import { normalizeLegacyInsertionGraph, validateLegacyInsertionGraph, legacyInsertionSignature, legacyInsertionDiagnostics } from './legacy-insertion.js?v=0.19.1';
import { parseWorkflow } from './packages.js?v=0.19.1';
import { inspectExpandedGraph } from './graph-validation.js?v=0.19.1';
import { computeDefinitionIdentity, definitionRefKey, nodeBindingOverrideKey } from './definition-data.js?v=0.19.1';
import { definitionChain, ownsDefinitionPath, pathStartsWith, ownershipEntries } from './composition-edit.js?v=0.19.1';
import { prepareLocalDefinitionEdit } from './definition-library.js?v=0.19.1';

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
 * @typedef {{phase:string, bindingReviewRequired:boolean, requiredRoles:string[], unresolvedBindings:Array<{nodeId:string, address?:import('./types').NodeAddress, role:string|null, missing:string[]}>, terminals:Array<{nodeId:string, address?:import('./types').NodeAddress, operation:string}>, callBound:number, importedCallBound:number, importedBindingOverrides?:Array<{address:import('./types').NodeAddress,binding:import('./types').Binding}>, changedRefs?:Array<{sourceKey:string,before:import('./types').DefinitionRef,after:import('./types').DefinitionRef}>, inheritedBindings?:string[], boundKind?:string, recipientOutputPreserved?:string|null}} InsertionDiagnostics
 * @typedef {{candidate:import('./types').NativeGraph2|import('./types').NativeGraph3|import('./legacy-insertion').LegacyInsertionGraph, diagnostics:InsertionDiagnostics, added:Record<IdentityKind,string[]>, identityMap:Record<IdentityKind,Record<string,string>>, viewPath:string[], baseSignature:string, baseDocumentSignature:string}} PreparedInsertion
 */

function reviewDiagnostics(candidate, added, viewPath, importedBindingOverrides, changedRefs) {
    const normalized = normalizeNativeGraph(candidate); if (!normalized.ok) return normalized;
    const expanded = inspectExpandedGraph(normalized.data); if (!expanded.ok) return expanded;
    const units = expanded.data.primitives, bound = unit => unit.enabled ? unit.requestBound : 0;
    const imported = units.filter(unit => pathStartsWith(unit.address.instancePath, viewPath) && added.nodes.includes(unit.address.instancePath.length > viewPath.length ? unit.address.instancePath[viewPath.length] : unit.address.nodeId));
    const requests = imported.filter(unit => bound(unit) > 0);
    const unresolvedBindings = requests.flatMap(({ node, address }) => {
        const missing = ['profileId', 'model'].filter(key => !node[key]);
        return missing.length ? [{ nodeId: node.id, address, role: node.modelRole ?? null, missing }] : [];
    });
    return { ok: true, data: {
        phase: candidate.mode.slice(7), bindingReviewRequired: requests.length > 0,
        requiredRoles: [...new Set(requests.map(unit => unit.node.modelRole).filter(Boolean))],
        unresolvedBindings, importedBindingOverrides, changedRefs,
        terminals: imported.filter(unit => unit.terminal).map(({ node, address }) => ({ nodeId: node.id, address, operation: node.operation })),
        // Conservative authoring bound includes unfinished branches; no binding/host preflight.
        callBound: units.reduce((sum, unit) => sum + bound(unit), 0),
        importedCallBound: imported.reduce((sum, unit) => sum + bound(unit), 0),
    } };
}

/**
 * Prepare an additive same-mode document without changing either input or host state.
 * `at` anchors the imported nodes' top-left exactly; default placement clears saved bounds.
 * The injected allocator must be pure. It receives the identity kind and original ID.
 * Unresolved bindings describe missing saved metadata, never local profile availability.
 * Legacy baseSignature is conservative editable-document identity, not native execution identity.
 * Private qualified views prepare a complete root revision; child transaction capability is separate.
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
        const native = isNativeWorkflow(destination);
        if (viewPath.length && (!native || !safeWorkflowData(destination) || !ownsDefinitionPath(destination, viewPath))) return fail('READ_ONLY_VIEW', 'Make an explicit local copy of the containing view before insertion.');
        if (native !== isNativeWorkflow(imported)) return fail('MODE_MISMATCH', 'Open this workflow separately: its graph mode or phase differs.');
        const normalize = native ? normalizeNativeGraph : normalizeLegacyInsertionGraph;
        const target = normalize(destination), source = native ? normalize(imported) : normalize(imported, { compatibility: true });
        if (!target.ok) return target;
        if (!source.ok) return source;
        if (!native && [...Object.values(target.data.nodes), ...Object.values(source.data.nodes)].filter(node => node.type === 'output').length > 1) return fail('DUPLICATE_OUTPUT', 'A legacy graph has one Output. Open separately, or import a fragment without Output.');
        if (native && target.data.mode !== source.data.mode) return fail('MODE_MISMATCH', 'Open this workflow separately: its graph mode or phase differs.');
        const containingDefinition = viewPath.length ? definitionChain(target.data, viewPath).at(-1).definition : null;
        for (const graph of [containingDefinition?.body ?? target.data, source.data]) {
            const items = [...Object.values(graph.nodes), ...Object.values(graph.groups ?? {})];
            const boxes = [...items, ...items.filter(item => item.frame !== undefined).map(item => item.frame)];
            if (boxes.some(box => !box || typeof box !== 'object' || Array.isArray(box) || ['x', 'y', 'w', 'h', 'width', 'height'].some(key => box[key] !== undefined && !Number.isFinite(box[key])))) return fail('INVALID_LAYOUT', 'Layout coordinates and dimensions must be finite numbers.');
        }
        const baseSignature = native ? graphSemanticSignature(destination) : legacyInsertionSignature(destination);
        const baseDocumentSignature = graphDocumentSignature(destination);
        let candidate = containingDefinition ? { ...structuredClone(containingDefinition.body), definitions: target.data.definitions } : target.data;
        const sourceExpansion = native ? inspectExpandedGraph(source.data) : null;
        if (sourceExpansion && !sourceExpansion.ok) return sourceExpansion;
        const importedBindingOverrides = [], changedRefs = [];
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
        if (native) for (const [key, definition] of Object.entries(source.data.definitions)) {
            identityMap.definitions[key] = key;
            if (Object.hasOwn(candidate.definitions, key)) {
                if (computeDefinitionIdentity(candidate.definitions[key]).data.canonicalContent !== computeDefinitionIdentity(definition).data.canonicalContent) return fail('DEFINITION_CONFLICT', 'An exact snapshot pin has conflicting semantic content.');
            } else { candidate.definitions[key] = structuredClone(definition); added.definitions.push(key); }
        }
        // Check the original combined pins before any collision renaming can hide conflicts.
        if (native) { const merged = validateGraphStructure({ ...target.data, definitions: candidate.definitions }); if (!merged.ok) return merged; }
        const occupied = new Set();
        const reserve = graph => {
            if (typeof graph.id === 'string') occupied.add(graph.id);
            for (const kind of ['nodes', 'wires', 'groups', 'portals', 'definitions']) Object.keys(graph[kind] ?? {}).forEach(id => occupied.add(id));
        };
        for (const graph of [target.data, source.data]) { reserve(graph); for (const definition of Object.values(graph.definitions ?? {})) { occupied.add(definition.id); reserve(definition.body); } }
        let serial = 0;
        const allocate = (kind, id) => {
            let fresh, attempts = 0;
            do {
                if (allocateId && ++attempts > 100) return fail('IDENTITY_COLLISION', 'The identity allocator could not produce a fresh ID.');
                fresh = allocateId ? allocateId(kind, id) : `import-${++serial}`;
                if (typeof fresh !== 'string' || !fresh.length || ['__proto__', 'prototype', 'constructor'].includes(fresh)) return fail('INVALID_ID', 'The identity allocator must return a safe nonempty string.');
            } while (occupied.has(fresh));
            occupied.add(fresh); return { ok: true, data: fresh };
        };
        for (const kind of native ? ['nodes', 'wires', 'groups', 'portals'] : ['nodes', 'wires', 'groups']) {
            candidate[kind] ??= {};
            for (const id of Object.keys(source.data[kind] ?? {})) {
                const allocated = allocate(kind, id); if (!allocated.ok) return allocated;
                const fresh = allocated.data;
                identityMap[kind][id] = fresh;
                added[kind].push(fresh);
            }
        }
        if (native) {
            const privateIds = new Set(ownershipEntries(target.data).map(entry => entry.definitionId)), replacements = new Map();
            const copyPin = key => {
                if (replacements.has(key)) return { ok: true, data: replacements.get(key) };
                const saved = source.data.definitions[key], draft = structuredClone(saved);
                let changed = privateIds.has(saved.id);
                for (const node of Object.values(draft.body.nodes)) if (node.type === 'subgraph') {
                    const child = copyPin(definitionRefKey(node.definition)); if (!child.ok) return child;
                    if (definitionRefKey(child.data) !== definitionRefKey(node.definition)) { node.definition = child.data; changed = true; }
                }
                let next = { id: saved.id, version: saved.version, semanticHash: saved.semanticHash };
                if (changed) {
                    const allocated = allocate('definitions', key); if (!allocated.ok) return allocated;
                    draft.id = allocated.data; draft.version = 1; delete draft.semanticHash;
                    const identity = computeDefinitionIdentity(draft); if (!identity.ok) return identity;
                    const snapshot = { ...structuredClone(identity.data.materializedDefinition), semanticHash: identity.data.semanticHash };
                    next = { id: snapshot.id, version: snapshot.version, semanticHash: snapshot.semanticHash };
                    const nextKey = definitionRefKey(next); candidate.definitions[nextKey] = snapshot; added.definitions.push(nextKey); identityMap.definitions[key] = nextKey;
                    changedRefs.push({ sourceKey: key, before: { id: saved.id, version: saved.version, semanticHash: saved.semanticHash }, after: next });
                }
                replacements.set(key, next); return { ok: true, data: next };
            };
            for (const node of Object.values(source.data.nodes)) if (node.type === 'subgraph') {
                const pin = copyPin(definitionRefKey(node.definition)); if (!pin.ok) return pin; node.definition = pin.data;
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
            candidate.roles[fresh] = { profileId: source.data.roles?.[role]?.profileId ?? null, model: source.data.roles?.[role]?.model ?? null };
        }
        for (const node of Object.values(source.data.nodes)) {
            if (native && node.type === 'subgraph') {
                delete node.localCopy;
                node.nodeBindingOverrides ??= {};
                for (const unit of sourceExpansion.data.primitives.filter(unit => unit.address.instancePath[0] === node.id && (operationFor(unit.node)?.modelRole || unit.node.modelRole))) {
                    const relativePath = unit.address.instancePath.slice(1), binding = { profileId: unit.node.profileId ?? null, model: unit.node.model ?? null };
                    node.nodeBindingOverrides[nodeBindingOverrideKey(relativePath, unit.address.nodeId)] = binding;
                    importedBindingOverrides.push({ address: { workflowId: destination.id ?? 'workflow', instancePath: [...viewPath, identityMap.nodes[node.id], ...relativePath], nodeId: unit.address.nodeId }, binding: structuredClone(binding) });
                }
            }
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
            if (native && wire.route === 'portal') wire.portalId = identityMap.portals[wire.portalId];
            else wire.from = identityMap.nodes[wire.from];
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
        for (const portal of Object.values(source.data.portals ?? {})) {
            portal.id = identityMap.portals[portal.id]; portal.source.nodeId = identityMap.nodes[portal.source.nodeId]; candidate.portals[portal.id] = portal;
        }
        // An empty fragment must not create optional containers or upgrade a schema.
        if (Object.values(added).every(ids => ids.length === 0)) candidate = structuredClone(destination);
        else if (containingDefinition) {
            const { definitions, ...body } = candidate;
            const edited = prepareLocalDefinitionEdit({ ...target.data, definitions }, { instancePath: viewPath, expectedRef: { id: containingDefinition.id, version: containingDefinition.version, semanticHash: containingDefinition.semanticHash }, draft: { ...structuredClone(containingDefinition), body } });
            if (!edited.ok) return edited;
            candidate = edited.data.candidate;
            added.definitions = Object.keys(candidate.definitions).filter(key => !Object.hasOwn(destination.definitions ?? {}, key));
        }
        const validation = native ? validateGraphStructure(candidate) : validateLegacyInsertionGraph(candidate);
        if (!validation.ok) return validation;
        const diagnostics = native ? reviewDiagnostics(candidate, added, viewPath, importedBindingOverrides, changedRefs) : { ok: true, data: legacyInsertionDiagnostics(candidate, added, destination) };
        return diagnostics.ok ? { ok: true, data: { candidate, diagnostics: diagnostics.data, added, identityMap, viewPath: [...viewPath], baseSignature, baseDocumentSignature } } : diagnostics;
    } catch {
        return fail('INSERTION_FAILED', 'Could not prepare this workflow insertion.');
    }
}
