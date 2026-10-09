import { safeWorkflowData, validateGraphStructure } from './contracts.js?v=0.21.0';
import { portsForNode, operationFor } from './catalog.js?v=0.21.0';
import { computeDefinitionIdentity, definitionRefKey, nodeBindingOverrideKey } from './definition-data.js?v=0.21.0';
import { inspectExpandedGraph } from './graph-validation.js?v=0.21.0';
import { prepareGraphCandidate } from './prepared-graph-edit.js?v=0.21.0';
import { compositionIds, definitionChain, ownershipEntries, ownsDefinitionPath, samePath, pathStartsWith, safeId, prunePrivateSnapshots } from './composition-edit.js?v=0.21.0';

const fail = (code, message) => ({ ok: false, error: { code, message } });
const reference = definition => ({ id: definition.id, version: definition.version, semanticHash: definition.semanticHash });
const clone = value => structuredClone(value);
const sourceOf = (scope, wire) => wire.route === 'portal' ? scope.portals[wire.portalId].source : { nodeId: wire.from, portId: wire.fromPort };
const endpointKey = source => JSON.stringify([source.nodeId, source.portId]);

function editScope(root, command, path) {
    if (!safeWorkflowData(command) || !command || typeof command !== 'object' || Array.isArray(command)) return fail('INVALID_COMPOSITION', 'Expected a plain edit command.');
    path ??= command.viewPath ?? [];
    const checked = validateGraphStructure(root); if (!checked.ok) return checked;
    if (root.schema !== 3) return fail('UNSUPPORTED_VERSION', 'Composition edits require a normalized schema-3 graph.');
    if (!Array.isArray(path) || path.length > 8 || !path.every(safeId)) return fail('INVALID_INSTANCE', 'Expected a bounded scope path.');
    const chain = path.length ? definitionChain(root, path) : [];
    if (!chain) return fail('INVALID_INSTANCE', 'The containing scope does not exist.');
    if (path.length && !ownsDefinitionPath(root, path)) return fail('READ_ONLY_DEFINITION', 'Make a local copy of the containing scope before editing.');
    const candidate = clone(root); candidate.definitions ??= {};
    const definition = chain.at(-1)?.definition;
    return { ok: true, data: { candidate, path, definition, scope: clone(definition?.body ?? root), ids: compositionIds(root) } };
}

function saveDefinition(candidate, draft) {
    delete draft.semanticHash;
    const identity = computeDefinitionIdentity(draft); if (!identity.ok) return identity;
    const snapshot = { ...clone(identity.data.materializedDefinition), semanticHash: identity.data.semanticHash };
    candidate.definitions[definitionRefKey(snapshot)] = snapshot;
    return { ok: true, data: snapshot };
}

function finishScope(original, context, owners, details, relocate = address => address) {
    let { candidate, scope, path } = context;
    const rewriteBindings = (graph, prefix) => {
        for (const node of Object.values(graph.nodes)) if (node.type === 'subgraph') {
            const relativeBase = [...prefix, node.id], bindings = {};
            for (const [key, value] of Object.entries(node.nodeBindingOverrides ?? {})) {
                const [relativePath, nodeId] = JSON.parse(key), address = relocate([...relativeBase, ...relativePath, nodeId]);
                if (pathStartsWith(address, relativeBase)) bindings[nodeBindingOverrideKey(address.slice(relativeBase.length, -1), address.at(-1))] = value;
            }
            node.nodeBindingOverrides = bindings;
        }
    };
    rewriteBindings(scope, path);
    const chain = path.length ? definitionChain(original, path) : [];
    for (let depth = path.length - 1; depth >= 0; depth--) {
        const prefix = path.slice(0, depth + 1), previous = chain[depth].definition, draft = { ...clone(previous), body: scope };
        draft.version = Math.max(...Object.values(candidate.definitions).filter(item => item.id === draft.id).map(item => item.version)) + 1;
        for (const parameter of draft.parameters) {
            const at = relocate([...prefix, ...parameter.target.instancePath, parameter.target.nodeId]);
            parameter.target.instancePath = at.slice(prefix.length, -1); parameter.target.nodeId = at.at(-1);
        }
        const saved = saveDefinition(candidate, draft); if (!saved.ok) return saved;
        scope = clone(depth ? chain[depth - 1].definition.body : original);
        scope.nodes[path[depth]].definition = reference(saved.data);
        rewriteBindings(scope, path.slice(0, depth));
    }
    candidate = { ...scope, definitions: candidate.definitions };
    // The edited ancestor IDs remain stable. Keep only ownership still backed by live exact pins.
    candidate.localDefinitionOwners = owners.filter(entry => definitionChain(candidate, entry.instancePath)?.at(-1).definition.id === entry.definitionId);
    candidate.localDefinitionOwners = candidate.localDefinitionOwners.filter(entry => entry.instancePath.every((_, index) => candidate.localDefinitionOwners.some(parent => samePath(parent.instancePath, entry.instancePath.slice(0, index + 1)))));
    for (const node of Object.values(candidate.nodes)) if (node.type === 'subgraph') {
        const owner = candidate.localDefinitionOwners.find(entry => samePath(entry.instancePath, [node.id]));
        if (owner) node.localCopy = { definitionId: owner.definitionId }; else delete node.localCopy;
    }
    prunePrivateSnapshots(candidate, new Set(ownershipEntries(original).map(entry => entry.definitionId)));
    const prepared = prepareGraphCandidate(original, candidate);
    return prepared.ok ? { ok: true, data: { ...prepared.data, ...details } } : prepared;
}

/** The preparation itself is the reviewable proposal; no persistence or graph mutation occurs. */
export function prepareCreateFromSelection(root, command) {
    const input = editScope(root, command); if (!input.ok) return input;
    const context = input.data, { candidate, scope, path, ids } = context;
    if (!Array.isArray(command.nodeIds) || !command.nodeIds.length || command.nodeIds.length > 1000 || new Set(command.nodeIds).size !== command.nodeIds.length || command.nodeIds.some(id => !safeId(id) || !Object.hasOwn(scope.nodes, id))) return fail('INVALID_SELECTION', 'Select existing unique nodes.');
    if (!ids.claim(command.definitionId) || typeof command.name !== 'string') return fail('DEFINITION_CONFLICT', 'A selection requires a fresh definition ID and name.');
    const selected = new Set(command.nodeIds);
    for (const id of selected) if (['scene-context', 'reply-snapshot', 'guidance', 'apply-reply'].includes(scope.nodes[id].operation) || ['subgraph-input', 'subgraph-output'].includes(scope.nodes[id].type)) return fail('ROOT_ONLY_OPERATION', 'Root-only operations and existing boundaries cannot be selected.');
    const instanceId = command.instanceId ?? ids.next('subgraph');
    if (command.instanceId !== undefined && !ids.claim(instanceId)) return fail('INVALID_INSTANCE', 'The wrapper requires a fresh ID.');
    // The containing scope still owns its role defaults and overrides; inherit them exactly once.
    const body = { schema: 3, runtime: 2, mode: scope.mode, nodes: {}, wires: {}, portals: {}, groups: {}, roles: {} };
    for (const id of selected) { body.nodes[id] = clone(scope.nodes[id]); delete body.nodes[id].localCopy; }
    const interfaces = [], inputs = new Map(), outputs = new Map(), addedEdgeIds = [], removedEdgeIds = [];
    const boundary = (direction, kind, required, label) => {
        const id = ids.next(direction), boundaryNodeId = ids.next(`boundary-${direction}`);
        const port = { id, label, direction, kind, required, cardinality: 'one', boundaryNodeId };
        interfaces.push(port); body.nodes[boundaryNodeId] = { id: boundaryNodeId, type: `subgraph-${direction}`, interfacePortId: id }; return port;
    };
    const bodyWire = (from, fromPort, to, toPort) => { const id = ids.next('edge'); body.wires[id] = { id, route: 'wire', from, fromPort, to, toPort }; addedEdgeIds.push(id); };
    const exposeOutput = source => {
        const key = endpointKey(source); if (outputs.has(key)) return outputs.get(key);
        const descriptor = portsForNode({ ...scope, definitions: candidate.definitions }, scope.nodes[source.nodeId]).find(port => port.id === source.portId && port.direction === 'output');
        const port = boundary('output', descriptor.kind, false, descriptor.label);
        bodyWire(source.nodeId, source.portId, port.boundaryNodeId, 'in'); outputs.set(key, port); return port;
    };
    const originalWires = Object.values(scope.wires);
    for (const wire of originalWires) {
        const source = sourceOf(scope, wire), fromSelected = selected.has(source.nodeId), toSelected = selected.has(wire.to);
        if (fromSelected && toSelected) {
            body.wires[wire.id] = { id: wire.id, route: 'wire', from: source.nodeId, fromPort: source.portId, to: wire.to, toPort: wire.toPort };
            delete scope.wires[wire.id];
        } else if (toSelected) {
            const descriptor = portsForNode({ ...scope, definitions: candidate.definitions }, scope.nodes[wire.to]).find(port => port.direction === 'input' && port.id === wire.toPort);
            const key = endpointKey(source); let port = inputs.get(key);
            if (!port) { port = boundary('input', descriptor.kind, descriptor.required, descriptor.label); inputs.set(key, port); scope.wires[wire.id] = { ...wire, to: instanceId, toPort: port.id }; }
            else { port.required ||= descriptor.required; delete scope.wires[wire.id]; removedEdgeIds.push(wire.id); }
            bodyWire(port.boundaryNodeId, 'out', wire.to, wire.toPort);
        } else if (fromSelected && wire.route === 'wire') { const port = exposeOutput(source); scope.wires[wire.id] = { ...wire, from: instanceId, fromPort: port.id }; }
    }
    for (const portal of Object.values(scope.portals ?? {})) if (selected.has(portal.source.nodeId)) { const port = exposeOutput(portal.source); portal.source = { nodeId: instanceId, portId: port.id }; }
    for (const id of selected) for (const descriptor of portsForNode({ ...scope, definitions: candidate.definitions }, scope.nodes[id]).filter(port => port.direction === 'input')) {
        if (originalWires.some(wire => wire.to === id && wire.toPort === descriptor.id)) continue;
        const port = boundary('input', descriptor.kind, descriptor.required, descriptor.label); inputs.set(JSON.stringify(['unbound', id, descriptor.id]), port); bodyWire(port.boundaryNodeId, 'out', id, descriptor.id);
    }
    for (const [id, group] of Object.entries(scope.groups ?? {})) {
        const members = Object.keys(body.nodes).filter(nodeId => body.nodes[nodeId].inGroup === id);
        if (!members.length && !(group.members ?? []).some(nodeId => selected.has(nodeId))) continue;
        const groupId = ids.next('group'), moved = clone(group); moved.id = groupId;
        if (moved.members) moved.members = moved.members.filter(nodeId => selected.has(nodeId));
        body.groups[groupId] = moved; for (const nodeId of members) body.nodes[nodeId].inGroup = groupId;
        if (group.members) group.members = group.members.filter(nodeId => !selected.has(nodeId));
        if (!Object.values(scope.nodes).some(node => !selected.has(node.id) && node.inGroup === id)) delete scope.groups[id];
    }
    for (const id of selected) delete scope.nodes[id];
    const saved = saveDefinition(candidate, { id: command.definitionId, version: 1, name: command.name, interface: interfaces, parameters: [], body }); if (!saved.ok) return saved;
    scope.nodes[instanceId] = { id: instanceId, type: 'subgraph', definition: reference(saved.data), parameterOverrides: {}, roleOverrides: {}, nodeBindingOverrides: {} };
    const owners = ownershipEntries(root).map(entry => pathStartsWith(entry.instancePath, path) && selected.has(entry.instancePath[path.length]) ? { ...entry, instancePath: [...path, instanceId, ...entry.instancePath.slice(path.length)] } : entry);
    owners.push({ instancePath: [...path, instanceId], definitionId: saved.data.id });
    const relocate = at => pathStartsWith(at, path) && selected.has(at[path.length]) ? [...path, instanceId, ...at.slice(path.length)] : at;
    const result = finishScope(root, context, owners, { instanceId, definitionRef: reference(saved.data), proposal: { inputs: [...inputs.values()], outputs: [...outputs.values()], selectedNodeIds: [...selected] } }, relocate);
    if (result.ok) { result.data.addedEdgeIds = addedEdgeIds; result.data.removedEdgeIds = removedEdgeIds; }
    return result;
}

/** Preserve an outer parameter even when the retained child has no exposed matching control.
 * Only affected branches receive private immutable pins; untouched children remain exact.
 */
export function materializeInstanceControls(candidate, instance, differences, ids, at, changedRefs) {
    const definition = candidate.definitions[definitionRefKey(instance.definition)], draft = clone(definition);
    const pending = [];
    instance.parameterOverrides = clone(instance.parameterOverrides ?? {});
    for (const difference of differences) {
        const exposed = definition.parameters.find(parameter => samePath(parameter.target.instancePath, difference.instancePath) && parameter.target.nodeId === difference.nodeId && parameter.target.controlId === difference.controlId);
        if (exposed) instance.parameterOverrides[exposed.id] = clone(difference.value); else pending.push(difference);
    }
    if (!pending.length) return { ok: true };
    for (const difference of pending.filter(item => !item.instancePath.length)) draft.body.nodes[difference.nodeId][difference.controlId] = clone(difference.value);
    const childIds = new Set(pending.filter(item => item.instancePath.length).map(item => item.instancePath[0]));
    for (const id of childIds) {
        const nested = materializeInstanceControls(candidate, draft.body.nodes[id], pending.filter(item => item.instancePath[0] === id).map(item => ({ ...item, instancePath: item.instancePath.slice(1) })), ids, [...at, id], changedRefs);
        if (!nested.ok) return nested;
    }
    draft.id = ids.next('unpack-definition'); draft.version = 1;
    const saved = saveDefinition(candidate, draft); if (!saved.ok) return saved;
    const before = clone(instance.definition); instance.definition = reference(saved.data);
    changedRefs.push({ instancePath: [...at], before, after: clone(instance.definition) });
    return { ok: true };
}

export function prepareUnpack(root, command) {
    if (!safeWorkflowData(command) || !command || typeof command !== 'object' || Array.isArray(command)) return fail('INVALID_COMPOSITION', 'Expected a plain unpack command.');
    const instancePath = command.instancePath ?? [command.instanceId];
    if (!Array.isArray(instancePath) || !instancePath.length || instancePath.length > 8 || !instancePath.every(safeId)) return fail('INVALID_INSTANCE', 'Expected a qualified instance.');
    const path = instancePath.slice(0, -1), input = editScope(root, command, path); if (!input.ok) return input;
    const context = input.data, { candidate, scope, ids } = context, instanceId = instancePath.at(-1), instance = scope.nodes[instanceId];
    if (instance?.type !== 'subgraph') return fail('INVALID_INSTANCE', 'Expected a subgraph instance.');
    const definition = candidate.definitions[definitionRefKey(instance.definition)], expanded = inspectExpandedGraph(root); if (!expanded.ok) return expanded;
    const materialized = expanded.data.scopes.find(item => samePath(item.instancePath, instancePath)).graph;
    const identityMap = { nodes: {}, wires: {}, groups: {}, portals: {} }, generatedReroutes = [], generatedRoles = [], changedRefs = [];
    const parentRoles = expanded.data.scopes.find(item => samePath(item.instancePath, path)).graph.roles;
    const occupiedRoles = new Set(expanded.data.scopes.flatMap(item => [...Object.keys(item.graph.roles ?? {}), ...Object.values(item.graph.nodes).map(node => node.modelRole).filter(Boolean)]));
    let roleCounter = 1;
    for (const field of Object.keys(identityMap)) for (const id of Object.keys(definition.body[field] ?? {})) identityMap[field][id] = ids.next(field === 'nodes' ? 'node' : field === 'wires' ? 'edge' : field === 'groups' ? 'group' : 'portal');
    const enabled = instance.enabled !== false;
    scope.groups ??= {}; scope.portals ??= {};
    for (const [oldId, originalNode] of Object.entries(definition.body.nodes)) {
        const node = clone(materialized.nodes[oldId]), id = identityMap.nodes[oldId]; node.id = id;
        delete node.localCopy;
        if (node.inGroup) node.inGroup = identityMap.groups[node.inGroup];
        else if (instance.inGroup) node.inGroup = instance.inGroup;
        if (!enabled) node.enabled = false;
        const boundary = definition.interface.find(port => port.boundaryNodeId === oldId);
        if (boundary) {
            node.type = 'workflow'; node.operation = 'reroute'; node.operationVersion = 1; node.phase = scope.mode.slice(7); node.artifactKind = boundary.kind; delete node.interfacePortId;
            generatedReroutes.push({ nodeId: id, interfacePortId: boundary.id, direction: boundary.direction, kind: boundary.kind });
        } else if (node.type === 'workflow') {
            const inherited = parentRoles[node.modelRole] ?? {};
            if (['profileId', 'model'].some(field => node[field] === null && inherited[field] != null)) {
                const sourceRole = node.modelRole ?? operationFor(node).modelRole ?? 'Binding';
                let role;
                do { role = `Unpack${roleCounter++}:${sourceRole}`; } while (occupiedRoles.has(role) || !ids.claim(role));
                occupiedRoles.add(role); scope.roles ??= {};
                scope.roles[role] = { profileId: node.profileId ?? null, model: node.model ?? null }; node.modelRole = role;
                generatedRoles.push({ role, sourceRole, nodeId: id, binding: clone(scope.roles[role]) });
            }
        } else if (node.type === 'subgraph') {
            const childPath = [...instancePath, oldId];
            const actualUnits = expanded.data.primitives.filter(unit => pathStartsWith(unit.address.instancePath, childPath));
            const baseline = inspectExpandedGraph({ id: root.id ?? 'workflow', schema: 3, runtime: 2, mode: scope.mode, roles: clone(materialized.roles), nodes: { [oldId]: clone(originalNode) }, wires: {}, definitions: root.definitions ?? {} });
            if (!baseline.ok) return baseline;
            const differences = [];
            for (const unit of actualUnits) {
                const relative = unit.address.instancePath.slice(childPath.length), previous = baseline.data.primitives.find(item => samePath(item.address.instancePath, [oldId, ...relative]) && item.address.nodeId === unit.address.nodeId);
                for (const controlId of operationFor(unit.node).controls) if (JSON.stringify(unit.node[controlId]) !== JSON.stringify(previous.node[controlId])) differences.push({ instancePath: relative, nodeId: unit.address.nodeId, controlId, value: unit.node[controlId] });
            }
            const controls = materializeInstanceControls(candidate, node, differences, ids, [...path, id], changedRefs); if (!controls.ok) return controls;
            // Freeze the effective binding at each primitive; moving a wrapper must not capture parent roles.
            node.nodeBindingOverrides = clone(node.nodeBindingOverrides ?? {});
            for (const unit of actualUnits) node.nodeBindingOverrides[nodeBindingOverrideKey(unit.address.instancePath.slice(childPath.length), unit.address.nodeId)] = { profileId: unit.node.profileId ?? null, model: unit.node.model ?? null };
        }
        scope.nodes[id] = node;
    }
    for (const [oldId, group] of Object.entries(definition.body.groups ?? {})) {
        const next = clone(group); next.id = identityMap.groups[oldId];
        if (next.members) next.members = next.members.map(id => identityMap.nodes[id]);
        scope.groups[next.id] = next;
    }
    for (const group of Object.values(scope.groups)) {
        if (group.members?.includes(instanceId)) group.members = group.members.flatMap(id => id === instanceId ? Object.values(identityMap.nodes).filter(nodeId => scope.nodes[nodeId]?.inGroup === group.id) : [id]);
    }
    const portNode = portId => identityMap.nodes[definition.interface.find(port => port.id === portId).boundaryNodeId];
    for (const wire of Object.values(scope.wires)) {
        if (wire.to === instanceId) { wire.to = portNode(wire.toPort); wire.toPort = 'in'; }
        if (wire.route === 'wire' && wire.from === instanceId) { wire.from = portNode(wire.fromPort); wire.fromPort = 'out'; }
    }
    for (const portal of Object.values(scope.portals)) if (portal.source.nodeId === instanceId) portal.source = { nodeId: portNode(portal.source.portId), portId: 'out' };
    for (const [oldId, wire] of Object.entries(definition.body.wires)) {
        const next = { ...clone(wire), id: identityMap.wires[oldId], to: identityMap.nodes[wire.to] };
        if (next.route === 'wire') next.from = identityMap.nodes[wire.from]; else next.portalId = identityMap.portals[wire.portalId];
        scope.wires[next.id] = next;
    }
    for (const [oldId, portal] of Object.entries(definition.body.portals ?? {})) {
        const next = { ...clone(portal), id: identityMap.portals[oldId], source: { ...portal.source, nodeId: identityMap.nodes[portal.source.nodeId] } }; scope.portals[next.id] = next;
    }
    delete scope.nodes[instanceId];
    const relocate = at => pathStartsWith(at, instancePath) && at.length > instancePath.length ? [...path, identityMap.nodes[at[instancePath.length]], ...at.slice(instancePath.length + 1)] : at;
    const owners = ownershipEntries(root).filter(entry => !samePath(entry.instancePath, instancePath)).map(entry => ({ ...entry, instancePath: relocate(entry.instancePath) }));
    const result = finishScope(root, context, owners, { instancePath: [...instancePath], identityMap, generatedReroutes, generatedRoles, changedRefs }, relocate);
    if (result.ok) result.data.addedEdgeIds = Object.values(identityMap.wires);
    return result;
}
