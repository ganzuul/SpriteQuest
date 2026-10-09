import { inspectExpandedGraph, nodeAddressKey, safeWorkflowData } from './graph-validation.js?v=0.19.1';
import { artifactAddressKey } from './definition-data.js?v=0.19.1';

const fail = (code, message, address) => ({ ok: false, error: { code, message, ...(address ? { nodeId: address.nodeId, address } : {}) } });
/** Pure complete inventory plus selected upstream execution closure. No binding/host work.
 * @returns {import('./types').Result<import('./types').ResolvedPlan>}
 */
export function resolveWorkflow(root, options = {}) {
    if (!safeWorkflowData(options) || !options || typeof options !== 'object' || Array.isArray(options)) return fail('INVALID_TARGET', 'Expected plain planning options.');
    const { target } = options;
    const expanded = inspectExpandedGraph(root);
    if (!expanded.ok) return expanded;
    const plan = expanded.data, byKey = new Map(plan.primitives.map(unit => [nodeAddressKey(unit.address), unit]));
    const terminals = plan.primitives.filter(unit => unit.terminal).map(unit => ({ kind: 'terminal', address: unit.address }));
    let resolvedTarget, starts;
    if (target !== undefined) {
        if (!safeWorkflowData(target) || !target || typeof target !== 'object') return fail('INVALID_TARGET', 'Expected an actual output or tagged terminal target.');
        if (target.kind === 'terminal') {
            const unit = target.address && byKey.get(nodeAddressKey(target.address));
            if (!unit?.terminal || target.address.portId !== undefined) return fail('INVALID_TARGET', 'The target is not a terminal operation.');
            resolvedTarget = { kind: 'terminal', address: unit.address }; starts = [unit];
        } else {
            if (target.kind !== undefined) return fail('INVALID_TARGET', 'Unknown target kind.');
            const key = artifactAddressKey(target), pin = plan.pins.find(pin => artifactAddressKey(pin.address) === key && pin.direction === 'output');
            if (!pin) return fail('INVALID_TARGET', 'Select an existing output port explicitly.');
            const mapping = plan.boundaryMappings.find(item => artifactAddressKey({ ...item.instance, portId: item.portId }) === key || artifactAddressKey(item.boundary) === key);
            if (mapping?.disabled) return fail('DISABLED_OPERATION', 'The selected output passes through a disabled boundary.', mapping.instance);
            resolvedTarget = mapping ? mapping.source : pin.address;
            if (!resolvedTarget) return fail('MISSING_INPUT', 'The selected wrapper output has no connected source.');
            const unit = byKey.get(nodeAddressKey(resolvedTarget));
            if (!unit) return fail('INVALID_TARGET', 'The selected output does not resolve to a primitive.');
            starts = [unit];
        }
    } else {
        if (!terminals.length) return fail('MISSING_TERMINAL', 'Add Guidance or Apply Reply to finish the workflow.');
        starts = terminals.map(terminal => byKey.get(nodeAddressKey(terminal.address)));
    }
    const dependencies = new Map(plan.primitives.map(unit => [nodeAddressKey(unit.address), []]));
    for (const edge of plan.edges) {
        const list = dependencies.get(nodeAddressKey(edge.to)), upstream = byKey.get(nodeAddressKey(edge.from)).address;
        if (!list.some(at => nodeAddressKey(at) === nodeAddressKey(upstream))) list.push(upstream);
    }
    const included = new Set();
    const visit = unit => { const key = nodeAddressKey(unit.address); if (included.has(key)) return; included.add(key); for (const at of dependencies.get(key)) visit(byKey.get(nodeAddressKey(at))); };
    starts.forEach(visit);
    const containsIncluded = instance => plan.primitives.some(unit => included.has(nodeAddressKey(unit.address)) && unit.address.instancePath.length > instance.instancePath.length && instance.instancePath.every((id, i) => unit.address.instancePath[i] === id) && unit.address.instancePath[instance.instancePath.length] === instance.nodeId);
    for (const mapping of plan.boundaryMappings) if (target === undefined && mapping.direction === 'input' && mapping.required && containsIncluded(mapping.instance) && !mapping.source) return fail('MISSING_INPUT', 'Connect the required instance input.', mapping.instance);
    for (const unit of plan.primitives) if (included.has(nodeAddressKey(unit.address))) {
        if (!unit.enabled || plan.edges.some(edge => nodeAddressKey(edge.to) === nodeAddressKey(unit.address) && edge.disabled)) return fail('DISABLED_OPERATION', 'A selected dependency is disabled.', unit.address);
        for (const port of unit.inputPorts) if (port.required && !plan.edges.some(edge => artifactAddressKey(edge.to) === artifactAddressKey({ ...unit.address, portId: port.id }))) return fail('MISSING_INPUT', 'Connect the required input artifact.', unit.address);
    }
    const primitives = plan.primitives.map(unit => ({ ...unit, included: included.has(nodeAddressKey(unit.address)), dependencies: dependencies.get(nodeAddressKey(unit.address)) }));
    const hierarchy = plan.hierarchy.map(entry => ({ ...entry, included: entry.kind === 'primitive' ? included.has(nodeAddressKey(entry.address)) : containsIncluded(entry.address) }));
    const callBound = primitives.reduce((sum, unit) => sum + (unit.included ? unit.requestBound : 0), 0);
    return { ok: true, data: {
        workflowId: plan.workflowId, phase: plan.phase, mode: target === undefined ? 'root' : 'target', primitives, edges: plan.edges, hierarchy, boundaryMappings: plan.boundaryMappings,
        dependencies: primitives.map(unit => ({ address: unit.address, dependencies: unit.dependencies })),
        terminals: terminals.filter(terminal => included.has(nodeAddressKey(terminal.address))), callBound,
        perNodeBounds: primitives.map(unit => ({ address: unit.address, requestBound: unit.requestBound, included: unit.included })),
        requiredRoles: [...new Set(primitives.filter(unit => unit.included && unit.requestBound > 0).map(unit => unit.node.modelRole).filter(Boolean))],
        ...(target === undefined ? {} : { target: structuredClone(target), resolvedTarget }),
        units: primitives.map(unit => ({ address: unit.address, operation: unit.node.operation, label: unit.node.alias ?? unit.node.title ?? unit.node.operation, included: unit.included, dependencies: unit.dependencies, requestBound: unit.requestBound, inputPorts: unit.inputPorts.map(port => port.id), outputPorts: unit.outputPorts.map(port => port.id) })),
    } };
}
