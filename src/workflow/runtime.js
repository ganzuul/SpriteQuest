import { validateWorkflow } from './contracts.js?v=0.19.1';
import { operationFor } from './catalog.js?v=0.19.1';
import { compactContext, formatContext } from './compactor.js?v=0.19.1';
import { scanDraft, repairDraft, validatePatches } from './repair.js?v=0.19.1';

/** Execution identity shared by the host and UI. Canvas presentation never invalidates work. */
export function workflowSignature(graph) {
    if (!graph) return 'null';
    const binding = value => value && typeof value === 'object' && !Array.isArray(value) ? {profileId:value.profileId ?? null,model:value.model ?? null} : value;
    const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])) : value;
    const nodes = Object.entries(graph.nodes ?? {}).filter(([,node])=>node.type !== 'note' || node.inGroup !== undefined).map(([key,node])=>{
        const operation = operationFor(node);
        const controls = Object.fromEntries((operation?.controls ?? []).map(control=>[control,node[control] === undefined ? operation.defaults[control] : node[control]]));
        // Patch validation accepts extra protected wording even without an inspector control.
        if (node.operation === 'validate-patches') controls.protectedLiterals = node.protectedLiterals === undefined ? [] : node.protectedLiterals;
        return {key,id:node.id,type:node.type,operation:node.operation,operationVersion:node.operationVersion === undefined ? 1 : node.operationVersion,enabled:node.enabled !== false,modelRole:node.modelRole ?? operation?.modelRole ?? null,...binding(node),inGroup:node.inGroup,controls};
    });
    const wires = Object.entries(graph.wires ?? {}).map(([key,wire])=>({key,id:wire.id,from:wire.from,to:wire.to,order:wire.order,kind:wire.kind,port:wire.port,loop:wire.loop}));
    const groups = Object.entries(graph.groups ?? {}).map(([key,group])=>({key,id:group.id,enabled:group.enabled !== false,component:group.component === undefined ? undefined : group.component && {id:group.component.id,version:group.component.version},entry:group.entry,exit:group.exit,members:group.members}));
    const roles = Object.fromEntries(Object.entries(graph.roles ?? {}).map(([role,value])=>[role,binding(value)]));
    return JSON.stringify(canonical({schema:graph.schema,runtime:graph.runtime,mode:graph.mode,nodes,wires,groups,roles}));
}

export function freezeArtifact(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        Object.freeze(value);
        for (const child of Object.values(value)) freezeArtifact(child);
    }
    return value;
}
const failure = (code, message, nodeId) => ({ok:false,error:{code,message,...(nodeId ? {nodeId} : {})}});
const success = artifact => ({ok:true,artifact,reports:[]});
const cutoff = finish => ['length','max_tokens','max_output_tokens'].includes(String(finish).toLowerCase());
const complete = finish => ['stop','eos_token','eos','stop_sequence','end_turn','complete','completed'].includes(String(finish).toLowerCase());

/** Evaluate artifacts by wires. Transport and host mutations are injected, never inferred. */
export async function runWorkflow(graph, ports = {}) {
    const calls = [], reports = [], outputs = [];
    let callBound = 0, currentNode;
    const finish = result => freezeArtifact({...result,reports:[...reports,...(result.reports ?? [])],calls,trace:calls,outputs,callBound,actualCalls:calls.length});
    try {
        const validated = validateWorkflow(graph, {phase:ports.phase});
        if (!validated.ok) return finish(validated);
        graph = structuredClone(graph);
        const nodes = validated.data.orderedNodes.map(node => graph.nodes[node.id]);
        callBound = validated.data.callBound;
        if (ports.dryRun || ports.preview) return finish({ok:true,preview:true});
        const bindings = new Map();
        for (const node of nodes) {
            const op = operationFor(node), bound = typeof op.requestBound === 'function' ? op.requestBound(node) : op.requestBound;
            if (!bound) continue;
            if (ports.signal?.aborted) return finish(failure('ABORTED','Workflow was stopped.'));
            const resolved = await ports.resolveBinding?.({...node,modelRole:node.modelRole ?? op.modelRole},graph);
            if (!resolved?.ok) return finish({...resolved ?? failure('BINDING_MISSING','Resolve every fixed model connection before running.'),error:{...(resolved?.error ?? {code:'BINDING_MISSING',message:'Resolve every fixed model connection before running.'}),nodeId:node.id}});
            // The request adapter authenticates this exact object with a WeakMap.
            bindings.set(node.id,resolved.data);
        }
        const artifacts = new Map();
        const nodeCalls = new Map();
        for (const node of nodes) {
            currentNode = node;
            if (ports.signal?.aborted) return finish(failure('ABORTED','Workflow was stopped.',node.id));
            ports.onStage?.(node);
            const wire = Object.values(graph.wires).find(item=>item.to === node.id);
            const input = wire ? artifacts.get(wire.from) : null;
            const op = operationFor(node);
            const request = async options => {
                if (ports.signal?.aborted) return failure('ABORTED','Workflow was stopped.',node.id);
                const bound = typeof op.requestBound === 'function' ? op.requestBound(node) : op.requestBound;
                if (calls.length >= callBound || (nodeCalls.get(node.id) ?? 0) >= bound) return failure('CALL_LIMIT','Workflow request limit reached.',node.id);
                const tokenCount = await ports.countTokens(options.messages.map(item=>`${item.role}: ${item.content}`).join('\n'));
                if (ports.signal?.aborted) return failure('ABORTED','Workflow was stopped.',node.id);
                const binding = bindings.get(node.id);
                const record = {nodeId:node.id,iteration:(nodeCalls.get(node.id) ?? 0)+1,binding:{profileId:binding?.profileId,model:binding?.model,endpoint:binding?.endpoint,endpointOrigin:binding?.endpointOrigin,preset:binding?.preset},messages:structuredClone(options.messages),maxTokens:options.maxTokens,tokenCount,elapsedMs:0};
                calls.push(record); nodeCalls.set(node.id,record.iteration);
                const started = Date.now();
                let response;
                try { response = await ports.request({...options,binding,signal:ports.signal}); }
                catch { response = failure(ports.signal?.aborted ? 'ABORTED' : 'REQUEST_FAILED','Auxiliary request failed; no retry was made.',node.id); }
                record.elapsedMs = Date.now()-started;
                if (!response || typeof response.ok !== 'boolean' || (response.ok && typeof response.data?.text !== 'string') || (!response.ok && !response.error)) response = failure('INVALID_RESPONSE','Auxiliary request returned an invalid result.',node.id);
                if (response.ok) record.result = structuredClone(response.data);
                else record.error = structuredClone(response.error);
                if (ports.signal?.aborted) { record.error = {code:'ABORTED',message:'Ignore the stopped request result.'}; return {ok:false,error:record.error}; }
                if (response.ok && cutoff(response.data.finish)) { record.error = {code:'TRUNCATED_OUTPUT',message:'Auxiliary output reached its completion limit.',usage:response.data.usage,finish:response.data.finish}; return {ok:false,error:record.error}; }
                if (response.ok && !complete(response.data.finish)) { record.error = {code:'COMPLETION_UNVERIFIED',message:'Auxiliary output has no verified completion evidence.',usage:response.data.usage,finish:response.data.finish ?? null}; return {ok:false,error:record.error}; }
                return response;
            };
            const local = {...ports,binding:bindings.get(node.id),request};
            let result;
            switch (node.operation) {
                case 'scene-context': case 'reply-snapshot': {
                    const snapshot = await ports.snapshot(op.phase,node);
                    result = snapshot?.ok === false ? snapshot : success(structuredClone(snapshot));
                    if (result.ok && snapshot.report) result.reports.push(snapshot.report);
                    if (result.ok && result.artifact?.kind !== op.output) result = failure('INVALID_SNAPSHOT','The host did not provide the expected frozen source.',node.id);
                    break;
                }
                case 'smart-compactor': result = await compactContext(input,node,local); break;
                case 'response-plan': {
                    const messages = [
                        {role:'system',content:'Write concise optional scene guidance: direction, actor intentions, constraints and possible next beats. These are proposals, not established events. Preserve user agency. Use only the supplied context and instructions.'},
                        {role:'user',content:`Instructions: ${node.instructions ?? ''}\n\n${formatContext(input)}`},
                    ];
                    const response = await request({messages,maxTokens:node.maxTokens ?? 768});
                    result = response.ok ? (response.data.text.trim() ? success({kind:'guidance',text:response.data.text,context:input,derived:true}) : failure('EMPTY_OUTPUT','Planning returned no guidance.',node.id)) : response;
                    break;
                }
                case 'guidance': {
                    const measured = await ports.countTokens(input.text);
                    result = measured.tokens <= (node.budgetTokens ?? 768) ? success(input) : failure('GUIDANCE_OVERFLOW','Guidance exceeds its artifact token budget; nothing was published.',node.id);
                    reports.push({code:'GUIDANCE_BUDGET',nodeId:node.id,...measured,budget:node.budgetTokens ?? 768});
                    break;
                }
                case 'pattern-scan': result = scanDraft(input,node); break;
                case 'repair': result = await repairDraft(input,node,local); break;
                case 'validate-patches': result = validatePatches(input,node); break;
                case 'review-gate': case 'apply-reply': result = success({...input,reviewRequired:true}); break;
                default: result = failure('UNKNOWN_OPERATION','Unsupported workflow operation.',node.id);
            }
            if (ports.signal?.aborted) return finish(failure('ABORTED','Workflow was stopped.',node.id));
            if (!result.ok) return finish(result);
            reports.push(...(result.reports ?? []));
            artifacts.set(node.id,freezeArtifact(result.artifact));
            if (op.terminal) outputs.push({nodeId:node.id,artifact:result.artifact});
        }
        return finish(success(outputs.at(-1)?.artifact));
    } catch {
        return finish(failure(ports.signal?.aborted ? 'ABORTED' : 'WORKFLOW_FAILED','Workflow preparation failed; inspect the source, connection and tokenizer.',currentNode?.id));
    }
}
