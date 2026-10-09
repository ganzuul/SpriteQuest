import { ownData, inspectCapabilities, fail, freeze, parseRecord } from './contracts.js?v=0.25.0';
import { describeIntrospection, executeIntrospection } from './nodes.js?v=0.25.0';
import { parseRuntimeContext } from '../operations/context-data.js?v=0.25.0';

const object = value => value && typeof value === 'object' && !Array.isArray(value);
const id = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 128 && !['__proto__','prototype','constructor'].includes(value);
function binding(value) {
    return object(value) && Object.keys(value).length === 1 && ((Object.hasOwn(value,'input') && id(value.input)) || (Object.hasOwn(value,'node') && id(value.node)));
}
/** Validate the entire manifest and its typed bindings before accessing host/model services. */
export function validateIntrospectionExample(manifest,namedInputs={}) {
    const checked = ownData({manifest,namedInputs}); if (!checked.ok) return checked;
    const {manifest:m,namedInputs:inputs} = checked.data;
    if (!object(m) || m.format !== 'lattice-introspection-example' || m.version !== 1 || m.integrationRequired !== true || !['pre','post'].includes(m.phase) || !Array.isArray(m.nodes) || m.nodes.length < 1 || m.nodes.length > 64 || !object(m.outputs) || Object.keys(m.outputs).length > 16 || !object(inputs) || Object.keys(inputs).length > 32 || Object.keys(m).some(key=>!['format','version','integrationRequired','phase','description','nodes','outputs'].includes(key)) || (m.description !== undefined && (typeof m.description !== 'string' || m.description.length > 4096))) return fail('INVALID_EXAMPLE','Expected a bounded version-1 introspection example manifest.');
    const available = new Map(), external = new Map(), nodes = []; let terminals = 0;
    for (const [key,value] of Object.entries(inputs)) {
        if (!id(key)) return fail('INVALID_EXAMPLE','Invalid external input identity.');
        const valid = value?.kind === 'context' ? parseRuntimeContext(value) : parseRecord(value);
        if (!valid.ok) return valid;
        external.set(key,value.kind);
    }
    for (const entry of m.nodes) {
        if (!object(entry) || !id(entry.id) || available.has(entry.id) || !object(entry.inputs)) return fail('INVALID_EXAMPLE','Nodes require unique identities and named bindings.');
        const {inputs:bindings,...node} = entry;
        const described = describeIntrospection(node,{phase:m.phase}); if (!described.ok) return described;
        const pins = described.data.ports.filter(p=>p.direction==='input');
        if (Object.keys(bindings).some(key=>!pins.some(p=>p.id===key))) return fail('INVALID_EXAMPLE','Unknown input binding.');
        for (const pin of pins) {
            const link = bindings[pin.id];
            if (link === undefined) { if (pin.required) return fail('INVALID_EXAMPLE',`Missing binding ${entry.id}.${pin.id}.`); continue; }
            if (!binding(link)) return fail('INVALID_EXAMPLE','A binding must identify one external input or prior node.');
            const kind = link.node ? available.get(link.node)?.output : external.get(link.input);
            if (kind !== pin.kind || (link.node && available.get(link.node)?.terminal)) return fail('INVALID_EXAMPLE','Bindings must match typed prior nonterminal outputs.');
        }
        if (described.data.descriptor.terminal && (++terminals > 1 || entry !== m.nodes.at(-1))) return fail('INVALID_EXAMPLE','A single commit terminal must be the final node.');
        available.set(entry.id,described.data.descriptor);
        nodes.push({node,bindings,descriptor:described.data.descriptor});
    }
    for (const [key,link] of Object.entries(m.outputs)) if (!id(key) || !binding(link) || (link.node ? !available.has(link.node) : !external.has(link.input))) return fail('INVALID_EXAMPLE','Invalid output binding.');
    return freeze({ok:true,data:{manifest:m,inputs,nodes,requestBound:nodes.reduce((sum,item)=>sum+item.descriptor.requestBound,0)}});
}
/** Package-only runner: native registration is a later host integration step. */
export async function runIntrospectionExample(manifest,namedInputs={},ports={}) {
    try {
        const checked = validateIntrospectionExample(manifest,namedInputs); if (!checked.ok) return checked;
        const capabilities=inspectCapabilities(ports);if(!capabilities.ok)return capabilities;ports=capabilities.data;
        if (ports.preview || ports.dryRun || ports.root !== true) return fail('ROOT_EXECUTION_REQUIRED','Runnable examples require explicit root execution; preview and dry-run perform no work.');
        if (ports.signal?.aborted) return fail('ABORTED','Example was stopped.');
        const {manifest:m,inputs,nodes,requestBound} = checked.data;
        const fingerprint=JSON.stringify({manifest:m,namedInputs:inputs});
        const unchanged=()=>{const latest=ownData({manifest,namedInputs});return latest.ok && JSON.stringify(latest.data)===fingerprint;};
        const artifacts = Object.create(null), reports = [], settlements = []; let calls = 0, intent;
        const resolve = link => link.node ? artifacts[link.node] : inputs[link.input];
        for (const {node,bindings,descriptor} of nodes) {
            if (ports.signal?.aborted) return fail('ABORTED','Example was stopped.');
            const local = {...ports,phase:m.phase,binding:ports.bindings?.[descriptor.modelRole] ?? ports.binding,request:async request=>{
                if (ports.signal?.aborted) return fail('ABORTED','Example was stopped.');
                if (calls >= requestBound) return fail('CALL_LIMIT','Example request bound exceeded.');
                if (typeof ports.request !== 'function') return fail('SERVICE_UNAVAILABLE','A resolved model request service is required.');
                calls++;
                return ports.request({...request,modelRole:descriptor.modelRole});
            }};
            const result = await executeIntrospection(node,Object.fromEntries(Object.entries(bindings).map(([key,link])=>[key,resolve(link)])),local);
            if (!result.ok) return result;
            if (!unchanged()) return fail('STALE_INPUT','Example settings or external inputs changed while execution was pending.');
            artifacts[node.id] = result.artifact; reports.push(...result.reports);
            if (descriptor.terminal) intent = result.artifact;
        }
        if (ports.signal?.aborted) return fail('ABORTED','Example was stopped.');
        if (!unchanged()) return fail('STALE_INPUT','Example settings or external inputs changed before settlement.');
        // Resolve and clone output before any write, so no fallible data work remains after settlement.
        const outputs = ownData(Object.fromEntries(Object.entries(m.outputs).map(([key,link])=>[key,resolve(link)])));
        if (!outputs.ok) return outputs;
        if (intent) {
            if (typeof ports.memory?.commit !== 'function') return fail('SERVICE_UNAVAILABLE','Commit settlement requires a scoped host memory service.');
            const settled = await ports.memory.commit(intent,{root:true,signal:ports.signal,preview:false,dryRun:false});
            if (!settled.ok) return settled;
            settlements.push(settled.data);
        }
        return {ok:true,data:{artifacts,outputs:outputs.data,reports,calls,requestBound,settlements}};
    } catch { return fail('EXAMPLE_FAILED','Example services returned an unexpected failure.'); }
}
