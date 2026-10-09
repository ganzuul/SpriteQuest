import { cloneDefinitionData, computeDefinitionIdentity, definitionRefKey, validateDefinition } from './definitions.js?v=0.19.1';
import { safeWorkflowData, validateGraphStructure } from './contracts.js?v=0.19.1';
import { prepareGraphCandidate } from './prepared-graph-edit.js?v=0.19.1';
import { compositionIds, definitionChain, ownershipEntries, ownsDefinitionPath, samePath, prunePrivateSnapshots } from './composition-edit.js?v=0.19.1';

const fail = (code, message) => ({ ok: false, error: { code, message } });
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const reference = definition => ({ id: definition.id, version: definition.version, semanticHash: definition.semanticHash });

function mergeSnapshots(existing, incoming) {
    if (!record(existing) || !record(incoming)) return fail('DEFINITION_REF', 'Expected snapshot tables.');
    const merged = { ...existing };
    for (const [key, definition] of Object.entries(incoming)) {
        if (Object.hasOwn(merged, key)) {
            const left = computeDefinitionIdentity(merged[key]), right = computeDefinitionIdentity(definition);
            if (!left.ok) return left;
            if (!right.ok) return right;
            if (left.data.canonicalContent !== right.data.canonicalContent) return fail('DEFINITION_CONFLICT', 'An exact pin has conflicting canonical content.');
        } else Object.defineProperty(merged, key, { enumerable: true, configurable: true, writable: true, value: definition });
    }
    return { ok: true, data: merged };
}

/** Immutable shelf commands return new DTOs; no persistence or placed-workflow mutation. */
export function installDefinition(library, definition, snapshots = {}) {
    if (!safeWorkflowData(library) || !record(library) || !record(library.definitions) || !safeWorkflowData(definition) || !record(definition) || !safeWorkflowData(snapshots)) return fail('DEFINITION_DATA', 'Expected bounded local library data.');
    const incoming = mergeSnapshots(snapshots, { [definitionRefKey(definition)]: definition });
    if (!incoming.ok) return incoming;
    const merged = mergeSnapshots(library.definitions, incoming.data);
    if (!merged.ok) return merged;
    const key = definitionRefKey(definition), validation = validateDefinition(merged.data[key], merged.data);
    if (!validation.ok) return validation;
    const materialized = {};
    for (const [key, item] of Object.entries(merged.data)) {
        const identity = computeDefinitionIdentity(item);
        if (!identity.ok) return identity;
        materialized[key] = identity.data.materializedDefinition;
    }
    const frozen = cloneDefinitionData({ definitions: materialized });
    if (!frozen.ok) return frozen;
    const addedDefinitionKeys = Object.keys(materialized).filter(key => !Object.hasOwn(library.definitions, key));
    return { ok: true, data: { library: frozen.data, ref: reference(validation.data.definition), changed: addedDefinitionKeys.length > 0, addedDefinitionKeys } };
}

export function createRevision(library, draft) {
    if (!safeWorkflowData(library) || !record(library) || !record(library.definitions) || !safeWorkflowData(draft) || !record(draft)) return fail('DEFINITION_DATA', 'Expected a library and editable definition draft.');
    const versions = Object.values(library.definitions).filter(item => item?.id === draft.id).map(item => item.version);
    const version = Math.max(0, ...versions) + 1;
    if (!Number.isSafeInteger(version)) return fail('DEFINITION_METADATA', 'Definition version limit reached.');
    const candidate = { ...structuredClone(draft), version }; delete candidate.semanticHash;
    const identity = computeDefinitionIdentity(candidate);
    if (!identity.ok) return identity;
    return installDefinition(library, { ...identity.data.materializedDefinition, semanticHash: identity.data.semanticHash });
}

export function removeLibraryEntry(library, ref) {
    if (!safeWorkflowData(library) || !record(library) || !record(library.definitions) || !safeWorkflowData(ref) || !record(ref)) return fail('DEFINITION_DATA', 'Expected a library and exact reference.');
    const key = definitionRefKey(ref);
    if (!Object.hasOwn(library.definitions, key)) return fail('MISSING_DEFINITION', 'The shelf entry does not exist.');
    const validation = validateDefinition(library.definitions[key], library.definitions);
    if (!validation.ok) return validation;
    for (const [otherKey, item] of Object.entries(library.definitions)) if (otherKey !== key && Object.values(item.body.nodes).some(node => node.type === 'subgraph' && definitionRefKey(node.definition) === key)) return fail('DEFINITION_IN_USE', 'Another shelf definition pins this revision.');
    const definitions = { ...library.definitions }; delete definitions[key];
    const frozen = cloneDefinitionData({ definitions });
    return frozen.ok ? { ok: true, data: { library: frozen.data, changed: true } } : frozen;
}

function editableInstance(graph, command) {
    if (!safeWorkflowData(command) || !record(command) || typeof command.instanceId !== 'string') return fail('INVALID_INSTANCE', 'Expected an instance command.');
    const validation = validateGraphStructure(graph);
    if (!validation.ok) return validation;
    const node = Object.hasOwn(graph.nodes, command.instanceId) && graph.nodes[command.instanceId];
    return node?.type === 'subgraph' ? { ok: true, data: structuredClone(graph) } : fail('INVALID_INSTANCE', 'Expected a root-scope subgraph instance.');
}

export function makeLocalCopy(graph, command) {
    const input = qualifiedInstance(graph, command); if (!input.ok) return input;
    const { candidate, path, chain } = input.data, ids = compositionIds(candidate);
    if (!ids.claim(command.id) || command.name !== undefined && typeof command.name !== 'string') return fail('DEFINITION_CONFLICT', 'A local copy requires a fresh safe ID and optional display name.');
    const draft = { ...structuredClone(chain.at(-1).definition), id: command.id, version: 1, ...(command.name === undefined ? {} : { name: command.name }) };
    return reviseQualified(graph, candidate, path, chain, draft, true, ids);
}

/** Reviewable explicit update: missing mappings retain the same stable ID; null drops an override.
 * Connected port removal is never implicit and must map to a compatible new port.
 */
export function prepareInstanceUpdate(graph, command) {
    const editable = editableInstance(graph, command); if (!editable.ok) return editable;
    for (const key of ['portMap', 'parameterMap', 'roleMap', 'nodeBindingMap']) if (!record(command[key] ?? {})) return fail('INVALID_OVERRIDE', 'Update mappings must be records.');
    const candidate = editable.data, node = candidate.nodes[command.instanceId];
    const installed = installDefinition({ definitions: candidate.definitions ?? {} }, command.definition, command.snapshots ?? {});
    if (!installed.ok) return installed;
    candidate.definitions = structuredClone(installed.data.library.definitions);
    node.definition = installed.data.ref;
    if (node.localCopy && node.localCopy.definitionId !== node.definition.id) delete node.localCopy;
    const map = (mapping, id) => Object.hasOwn(mapping ?? {}, id) ? mapping[id] : id;
    const remap = (values, mapping) => {
        const result = {};
        for (const [key, value] of Object.entries(values ?? {})) {
            const next = map(mapping, key);
            if (next === null) continue;
            if (typeof next !== 'string' || !next || Object.hasOwn(result, next) || ['__proto__', 'prototype', 'constructor'].includes(next)) return null;
            result[next] = value;
        }
        return result;
    };
    for (const [field, mapping] of [['parameterOverrides', 'parameterMap'], ['roleOverrides', 'roleMap'], ['nodeBindingOverrides', 'nodeBindingMap']]) {
        const values = remap(node[field], command[mapping]);
        if (!values) return fail('INVALID_OVERRIDE', 'Override mappings must be unambiguous stable IDs.');
        node[field] = values;
    }
    for (const wire of Object.values(candidate.wires)) {
        if (wire.to === node.id) wire.toPort = map(command.portMap, wire.toPort);
        if (wire.route === 'wire' && wire.from === node.id) wire.fromPort = map(command.portMap, wire.fromPort);
    }
    for (const portal of Object.values(candidate.portals ?? {})) if (portal.source.nodeId === node.id) portal.source.portId = map(command.portMap, portal.source.portId);
    if (candidate.localDefinitionOwners !== undefined) {
        const owners = ownershipEntries(candidate).filter(entry => definitionChain(candidate, entry.instancePath)?.at(-1).definition.id === entry.definitionId);
        candidate.localDefinitionOwners = owners.filter(entry => entry.instancePath.every((_, index) => owners.some(parent => samePath(parent.instancePath, entry.instancePath.slice(0, index + 1)))));
    }
    return prepareGraphCandidate(graph, candidate);
}

/** Local body editing creates immutable revisions through an explicitly owned qualified path. */
export function prepareLocalDefinitionEdit(graph, command) {
    const input = qualifiedInstance(graph, command); if (!input.ok) return input;
    const { candidate, path, chain } = input.data, node = chain.at(-1).node;
    if (!ownsDefinitionPath(candidate, path)) return fail('READ_ONLY_DEFINITION', 'Make an explicit local copy before editing this definition.');
    if (!record(command.expectedRef) || definitionRefKey(command.expectedRef) !== definitionRefKey(node.definition)) return fail('STALE_DEFINITION', 'The local definition changed; prepare the edit again.');
    if (!record(command.draft) || command.draft.id !== node.definition.id) return fail('DEFINITION_REF', 'A local edit must preserve its owned definition ID.');
    return reviseQualified(graph, candidate, path, chain, structuredClone(command.draft), false, compositionIds(candidate));
}

function qualifiedInstance(graph, command) {
    if (!safeWorkflowData(command) || !record(command)) return fail('INVALID_INSTANCE', 'Expected a plain instance command.');
    const validation = validateGraphStructure(graph); if (!validation.ok) return validation;
    const path = command.instancePath ?? [command.instanceId], chain = definitionChain(graph, path);
    if (!chain) return fail('INVALID_INSTANCE', 'Expected a bounded existing instance path.');
    return { ok: true, data: { candidate: structuredClone(graph), path: [...path], chain } };
}

function reviseQualified(original, candidate, path, chain, leafDraft, copying, ids) {
    let draft = leafDraft;
    const owners = ownershipEntries(candidate), changedRefs = [];
    for (let depth = path.length - 1; depth >= 0; depth--) {
        const prefix = path.slice(0, depth + 1), previous = chain[depth].definition;
        if (depth !== path.length - 1) {
            const childRef = reference(draft);
            draft = structuredClone(previous);
            draft.body.nodes[path[depth + 1]].definition = childRef;
            if (!ownsDefinitionPath(original, prefix)) { draft.id = ids.next('local-definition'); draft.version = 1; }
        }
        const newIdentity = draft.id !== previous.id;
        if (!newIdentity) draft.version = Math.max(...Object.values(candidate.definitions).filter(item => item.id === draft.id).map(item => item.version)) + 1;
        else draft.version = 1;
        delete draft.semanticHash;
        const identity = computeDefinitionIdentity(draft); if (!identity.ok) return identity;
        draft = { ...structuredClone(identity.data.materializedDefinition), semanticHash: identity.data.semanticHash };
        candidate.definitions[definitionRefKey(draft)] = draft;
        changedRefs.push({ instancePath: prefix, before: reference(previous), after: reference(draft) });
        const owner = owners.find(entry => samePath(entry.instancePath, prefix));
        if (owner) owner.definitionId = draft.id; else owners.push({ instancePath: prefix, definitionId: draft.id });
    }
    candidate.nodes[path[0]].definition = reference(draft);
    candidate.nodes[path[0]].localCopy = { definitionId: draft.id };
    candidate.localDefinitionOwners = owners.filter(entry => definitionChain(candidate, entry.instancePath)?.at(-1).definition.id === entry.definitionId);
    prunePrivateSnapshots(candidate, new Set([...ownershipEntries(original), ...owners].map(entry => entry.definitionId)));
    const prepared = prepareGraphCandidate(original, candidate);
    return prepared.ok ? { ok: true, data: { ...prepared.data, changedRefs, instancePath: [...path], copying } } : prepared;
}
