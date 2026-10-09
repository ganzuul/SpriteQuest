import { prepareWorkflowPlanner, preparedWorkflowExpansion } from '../workflow/resolve.js?v=0.20.0';
import { normalizeNativeGraph } from '../workflow/migration.js?v=0.20.0';
import { sha256Text } from '../workflow/definition-data.js?v=0.20.0';
import { prepareCompositionViews } from '../workflow/composition-views.js?v=0.20.0';
import { createRunState, reduceRunState, projectRunRows } from '../workflow/run-state.js?v=0.20.0';
import { formatRecordedArtifact } from '../workflow/recording.js?v=0.20.0';
import { addressKey, nodeAddress, targetAddress, own, safeBinding, safeError, expandRecordAddress, freeze } from '../workflow/record-data.js?v=0.20.0';
import { workflowSignature } from '../workflow/runtime.js?v=0.20.0';
import * as uiBundle from '../../dist/lattice-ui.js?v=0.20.0';
import { FAMILIES, OPERATIONS, operationFor } from '../workflow/catalog.js?v=0.20.0';
import { isNativeWorkflow, safeWorkflowData, validateWorkflow } from '../workflow/contracts.js?v=0.20.0';
import { STARTERS } from '../workflow/starters.js?v=0.20.0';
const descriptions = { Input: 'Bring material into a workflow.', Shaping: 'Change the plan or amount of material.', Surface: 'Refine expression.', Transpose: 'Apply a reference’s qualities.', Derive: 'Extract findings from a source.', Output: 'Inspect or commit an artifact.' };
const legacy = { Input: ['prompt', 'st', 'history', 'injection', 'lorebook', 'state', 'memory'], Shaping: ['generate', 'decider'], Surface: [], Transpose: [], Derive: [], Output: ['output', 'memory'] };
const legacyTitles = { prompt: 'Prompt', st: 'ST prompt reader', history: 'History', injection: 'Injection reader', lorebook: 'Lorebook', state: 'State', generate: 'Generate', decider: 'Decider', output: 'Replace prompt', memory: 'Memory' };
const choices = { method: ['select', 'compress'], scope: ['whole', 'narration', 'dialogue'], strength: ['light', 'medium', 'strong'] };
const labels = { targetTokens: 'Target artifact tokens', keepRecent: 'Recent messages kept verbatim', maxTokens: 'Maximum response tokens', budgetTokens: 'Guidance artifact budget', includeCharacter: 'Include character fields', recentMessages: 'Recent messages', profileId: 'Node connection override', model: 'Node model override', modelRole: 'Model role', protectedLiterals: 'Protected literal wording' };
export const QUOTE_SCOPE_HELP = 'Dialogue is text inside paired ASCII double quotes (") or paired curly double quotes (“…”). Narration is text outside those paired quotes, excluding the quote delimiters. Apostrophes and single quotes are ordinary text.';
const requestBound = node => { const bound = operationFor(node)?.requestBound || 0; return typeof bound === 'function' ? bound(node) : bound; };
// Plain phrases stay approachable; JSON objects retain portable rule metadata.
// Quote JSON-looking or multiline literal strings so their representation is unambiguous.
const formatRule = rule => typeof rule === 'string' && !/^[\s]*[\[{"]|[\r\n]/.test(rule) ? rule : JSON.stringify(rule);
export function parseWorkflowRules(text) {
    const rules = [];
    for (const [index, line] of text.split('\n').entries()) {
        if (!line.trim()) continue;
        let rule = line;
        if (/^\s*[\[{"]/.test(line)) {
            try { rule = JSON.parse(line); }
            catch { return { ok: false, error: `Line ${index + 1}: use valid JSON for an object or quoted phrase. Changes not saved.` }; }
        }
        const phrase = rule && typeof rule === 'object' && !Array.isArray(rule) ? rule.phrase : rule;
        if (typeof phrase !== 'string' || !phrase.trim() || phrase.length > 2048 || !safeWorkflowData(rule)) {
            return { ok: false, error: `Line ${index + 1}: use a nonblank phrase or an object with a string "phrase", at most 2,048 characters. Changes not saved.` };
        }
        rules.push(rule);
    }
    if (rules.length > 128 || !safeWorkflowData(rules)) return { ok: false, error: 'Use at most 128 rules with bounded portable metadata. Changes not saved.' };
    return { ok: true, data: rules };
}
function projectLegacyWorkflow(graph, { profiles = [], settings = {}, selectedId = null, result = null, busy = false, status = '', applyIssue = '', resolveBinding, candidateStatus } = {}) {
    const native = isNativeWorkflow(graph);
    const validation = native ? validateWorkflow(graph) : null;
    const unsupported = native && (graph.schema !== 2 || graph.runtime !== 1);
    const phase = typeof graph?.mode === 'string' ? graph.mode.slice(7) : '';
    const issues = validation && !validation.ok ? [validation.error.message] : [];
    const reachable = new Set(validation?.ok ? (validation.data.orderedNodes || []).map(node => node.id) : []);
    const nodes = Object.values(graph?.nodes ?? {}).filter(node => operationFor(node)).map(node => {
        const op = operationFor(node), role = node.modelRole ?? op.modelRole;
        const callBound = reachable.has(node.id) ? requestBound(node) : 0;
        const binding = node.profileId ? { profileId: node.profileId, model: node.model } : graph.roles?.[role];
        const profile = profiles.find(profile => profile.id === binding?.profileId);
        let effective = profile ? profile.name || profile.id : role ? 'Missing ' + role + ' connection' : 'No model call';
        if (resolveBinding && op.modelRole && callBound > 0 && profile) {
            const resolved = resolveBinding({ ...node, modelRole: role }, graph);
            if (!resolved.ok) issues.push((node.title || op.title) + ': ' + resolved.error.message);
            else effective = resolved.data.display || [resolved.data.profileName, resolved.data.model, resolved.data.endpoint, resolved.data.endpointOrigin].filter(Boolean).join(' · ');
        } else if (op.modelRole && callBound > 0 && !profile) issues.push('Bind ' + role + ' to an available connection before running.');
        const controls = Object.entries(op.defaults).map(([key, fallback]) => ({ key, label: labels[key] || key.replace(/([A-Z])/g, ' $1'), value: Array.isArray(node[key] ?? fallback) ? (node[key] ?? fallback).map(value => key === 'rules' ? formatRule(value) : typeof value === 'string' ? value : JSON.stringify(value)).join('\n') : node[key] ?? fallback, kind: key === 'rules' ? 'rules' : Array.isArray(fallback) ? 'lines' : typeof fallback, options: key === 'mode' ? (node.operation === 'repair' ? ['repair', 'scan'] : ['literal']) : choices[key] || null }));
        return { id: node.id, canonicalTitle: op.title, alias: String(node.presentation?.alias || '').slice(0, 80), compact: node.presentation?.compact === true, title: node.presentation?.alias || node.title || op.title, operation: node.operation, family: op.family, phase: op.phase, input: op.input || 'snapshot', output: op.output || 'host output', terminal: op.terminal, modelRole: role, profileId: node.profileId || '', model: node.model || '', effective, enabled: node.enabled !== false, controls };
    });
    const artifact = result?.artifact?.kind === 'candidate' ? result.artifact : result?.candidate;
    const freshness = artifact && !unsupported ? candidateStatus?.(artifact) : null;
    const roleNames = [...new Set([...Object.keys(graph?.roles ?? {}), ...nodes.map(node => node.modelRole).filter(Boolean)])];
    const families = FAMILIES.map(name => ({
        name, description: descriptions[name],
        legacy: legacy[name].map(id => ({ id, title: id === 'memory' ? (name === 'Input' ? 'Memory reader' : 'Memory save') : legacyTitles[id] })),
        operations: Object.values(OPERATIONS)
            .filter(op => op.family === name || name === 'Surface' && ['pattern-scan', 'validate-patches'].includes(op.id))
            .map(op => ({ id: op.id, title: op.title, phase: op.phase, compatible: !native || op.phase === phase })),
    }));
    const resultView = result ? {
        ok: result.ok, error: result.error?.message || '',
        actualCalls: result.actualCalls ?? result.calls?.length ?? 0,
        callBound: result.callBound ?? (validation?.ok ? validation.data.callBound : 0),
        guidance: result.artifact?.kind === 'guidance' ? result.artifact.text : '',
        original: artifact?.original || (result.artifact?.kind === 'draft' ? result.artifact.text : ''),
        candidate: artifact?.text || '', findings: artifact?.findings || [], changes: artifact?.changes || [],
        reports: result.reports || [], calls: result.calls || [],
        tokenMethods: [...new Set([
            ...(result.reports || []).map(report => report.method || report.tokenMethod),
            ...(result.calls || []).map(call => call.tokenCount?.method),
        ].filter(Boolean))],
        applyAvailable: !unsupported && !!artifact && result.ok === true,
        applyIssue: unsupported ? validation?.error?.message || 'Unsupported workflow execution version.' : freshness?.ok === false ? freshness.error.message : applyIssue,
    } : null;
    return {
        graphId: graph?.id || '', name: graph?.name || '', native,
        phase, workflowMode: settings.workflowMode || 'legacy',
        assigned: graph?.id === settings.nativeBindings?.[graph?.mode === 'native-pre' ? 'preGraphId' : 'postGraphId'],
        roles: roleNames.map(name => ({ name, profileId: graph?.roles?.[name]?.profileId || '', model: graph?.roles?.[name]?.model || '' })),
        profiles: profiles.map(profile => ({ id: profile.id, name: profile.name || profile.id })),
        starters: STARTERS.map(({ operations, ...starter }) => starter),
        families, nodes, selectedId,
        groups: Object.values(graph?.groups ?? {}).filter(group => group.component)
            .map(group => ({ id: group.id, title: group.title, members: group.members, collapsed: group.collapsed, callBound: Object.values(graph.nodes).filter(node => node.inGroup === group.id).reduce((sum, node) => sum + requestBound(node), 0) })),
        callBound: validation?.ok ? validation.data.callBound : 0,
        issues: [...new Set(issues)], busy, status, result: resultView, quoteHelp: QUOTE_SCOPE_HELP,
    };
}
// Content/host preparation owns expensive work. Selection projects cached plain data.
const projections = new WeakMap();
const historicalPreviews = new WeakMap();
const noRows = freeze([]);
const pathKey = path => JSON.stringify(path);
const targetKey = target => target?.kind === 'terminal' ? 'terminal:' + addressKey(target.address) : addressKey(target) + ':' + target.portId;
const ownedPreviewTarget = raw => { const target = targetAddress(raw); return target ? freeze(target) : null; };
const summaryView = result => result.ok ? { callBound: result.data.callBound, issues: [], requiredBindingAddresses: result.data.requiredBindingAddresses } : { callBound: 0, issues: [result.error.message], requiredBindingAddresses: [] };
const emptyView = message => ({ graphId: '', name: '', native: true, phase: '', workflowMode: 'legacy', assigned: false, roles: [], profiles: [], starters: [], families: [], nodes: [], groups: [], selectedId: null, callBound: 0, issues: [message], busy: false, status: '', result: null, quoteHelp: QUOTE_SCOPE_HELP, rows: [], targets: [] });
// Keep a fixed digest, never the semantic signature's saved controls/body text.
function rememberRecordingRevision(recording, revision) {
    if (recording && typeof recording === 'object' && typeof revision === 'string' && !historicalPreviews.has(recording)) historicalPreviews.set(recording, { revision: sha256Text(revision), aliases: null });
}
function prepareRecordedAliases(root, recording, workflowId, aliases) {
    const history = historicalPreviews.get(recording);
    if (!history || history.aliases || recording.identities.strings[recording.plan.workflowId] !== workflowId) return;
    if (history.revision === sha256Text(workflowSignature(root))) history.aliases = new Map(aliases);
}
function recordedTarget(recording, target) {
    const address = expandRecordAddress(recording, own(target, 'address')); if (!address) return null;
    if (own(target, 'kind') === 'terminal') return { kind: 'terminal', address };
    const portId = own(recording.identities.strings, String(own(target, 'port')));
    return typeof portId === 'string' ? { ...address, portId } : null;
}
function recordedPrimitiveTarget(recording, target) {
    if (target.kind === 'terminal') return recording.terminals.some(item => { const address = expandRecordAddress(recording, item.address); return address && addressKey(address) === addressKey(target.address); });
    return recording.units.some(unit => { const address = expandRecordAddress(recording, unit.address); return address && addressKey(address) === addressKey(target) && unit.ports.some(port => port.direction === 'output' && recording.identities.strings[port.port] === target.portId); });
}
function historicalPreviewTarget(recording, target) {
    if (!recording || !target) return { target: null, unavailable: false };
    if (recordedPrimitiveTarget(recording, target)) return { target: ownedPreviewTarget(target), unavailable: false };
    const requested = recordedTarget(recording, recording.plan.target), resolved = recordedTarget(recording, recording.plan.resolvedTarget);
    if (requested && targetKey(requested) === targetKey(target) && resolved && recordedPrimitiveTarget(recording, resolved)) return { target: ownedPreviewTarget(resolved), unavailable: false };
    const canonical = historicalPreviews.get(recording)?.aliases?.get(targetKey(target));
    return canonical && recordedPrimitiveTarget(recording, canonical) ? { target: ownedPreviewTarget(canonical), unavailable: false } : { target: null, unavailable: true };
}
function nodeControls(node, op) {
    return Object.entries(op.defaults).map(([key, fallback]) => {
        const value = node[key] ?? fallback, descriptor = op.controlDescriptors?.[key];
        return { key, label: descriptor?.label || labels[key] || key.replace(/([A-Z])/g, ' $1'),
            value: descriptor?.editor === 'json' ? JSON.stringify(value, null, 2) : Array.isArray(value) ? value.map(item => key === 'rules' ? formatRule(item) : typeof item === 'string' ? item : JSON.stringify(item)).join('\n') : value,
            kind: descriptor?.editor === 'json' ? 'readonly-json' : key === 'rules' ? 'rules' : Array.isArray(fallback) ? 'lines' : typeof fallback,
            options: descriptor?.values || (key === 'mode' ? node.operation === 'repair' ? ['repair', 'scan'] : ['literal'] : choices[key] || null) };
    });
}
function safeHandle(raw) {
    const terminal = targetAddress(own(raw, 'terminal')), handleId = own(raw, 'handleId'), runId = own(raw, 'runId');
    return terminal?.kind === 'terminal' && !terminal.address.instancePath.length && typeof handleId === 'string' && handleId && typeof runId === 'string' && runId ? freeze({ handleId, runId, terminal }) : null;
}
function candidateOf(result) { return result?.artifact?.kind === 'candidate' ? result.artifact : result?.candidate; }
function baseWorkflowView(graph, profiles, settings) {
    const native = isNativeWorkflow(graph), phase = typeof graph.mode === 'string' ? graph.mode.slice(7) : '';
    const roles = Object.keys(graph.roles ?? {});
    for (const node of Object.values(graph.nodes ?? {})) {
        const role = node.modelRole ?? operationFor(node, { phase })?.modelRole;
        if (role && !roles.includes(role)) roles.push(role);
    }
    return { graphId: graph.id || '', name: graph.name || '', native, phase,
        workflowMode: settings.workflowMode || 'legacy', assigned: graph.id === settings.nativeBindings?.[phase === 'pre' ? 'preGraphId' : 'postGraphId'],
        roles: roles.map(name => ({ name, profileId: graph.roles?.[name]?.profileId || '', model: graph.roles?.[name]?.model || '' })),
        profiles: profiles.map(profile => ({ id: profile.id, name: profile.name || profile.id })),
        starters: STARTERS.map(({ operations, ...starter }) => structuredClone(starter)),
        families: FAMILIES.map(name => ({ name, description: descriptions[name], legacy: (legacy[name] || []).map(id => ({ id, title: id === 'memory' ? name === 'Input' ? 'Memory reader' : 'Memory save' : legacyTitles[id] })),
            operations: Object.values(OPERATIONS).filter(op => op.family === name || name === 'Surface' && ['pattern-scan', 'validate-patches'].includes(op.id)).map(op => ({ id: op.id, title: op.title, phase: op.phase || phase, compatible: native && (!op.phase || op.phase === phase) && (!op.minimumSchema || graph.schema >= op.minimumSchema) })) })),
        quoteHelp: QUOTE_SCOPE_HELP };
}
/** Root preparation boundary. The returned token is branded and contains no public authority. */
export function prepareWorkflowProjection(root, { planner, profiles = [], settings = {}, result = null, resolveBinding, candidateStatus } = {}) {
    const token = Object.freeze({});
    const reject = (message, base = {}) => { projections.set(token, { failure: { ...emptyView(message), ...base, issues: [message] }, result }); return token; };
    if (planner !== undefined) {
        const brand = preparedWorkflowExpansion(root, planner);
        if (!brand.ok) return reject(brand.error.message);
    }
    if (!root || typeof root !== 'object' || Array.isArray(root) || !safeWorkflowData(root)) return reject('Expected safe workflow data.');
    const graph = structuredClone(root);
    // Legacy rendering remains the proven schema-2 branch, prepared once rather than per pixel.
    if (graph.schema !== 3 || graph.runtime !== 2) {
        const bindings = new Map();
        const resolveOnce = (node, bindingGraph) => {
            const cached = bindings.get(node.id); if (cached) return cached.result;
            let resolved;
            try { resolved = resolveBinding?.(node, bindingGraph); }
            catch (error) { resolved = { ok: false, error: { message: error?.message || 'Connection preparation failed.' } }; }
            // Retain a bounded result, not the adapter's authenticated binding object.
            const safe = resolved?.ok ? { ok: true, data: safeBinding(resolved.data) || {} } : { ok: false, error: { message: resolved?.error?.message || 'Bind ' + (node.modelRole || 'model') + ' to an available connection before running.' } };
            bindings.set(node.id, { result: safe }); return resolved || safe;
        };
        const view = projectLegacyWorkflow(graph, { profiles, settings, result: null, resolveBinding: resolveBinding ? resolveOnce : undefined });
        const candidate = candidateOf(result), freshness = candidate && graph.schema === 2 && graph.runtime === 1 ? candidateStatus?.(candidate) : null;
        const summaries = new Map(), targets = [];
        if (graph.schema === 2 && graph.runtime === 1) {
            const normalized = normalizeNativeGraph(graph), prepared = normalized.ok ? prepareWorkflowPlanner(normalized.data) : normalized;
            if (prepared.ok) {
                const inventory = prepared.data.inventory;
                for (const unit of inventory.primitives) if (unit.requestBound > 0 && !bindings.has(unit.node.id)) resolveOnce(unit.node, { schema: 2, runtime: 1, mode: graph.mode, roles: {} });
                for (const pin of inventory.pins) if (pin.direction === 'output') targets.push(pin.address);
                targets.push(...inventory.terminals);
                for (const target of targets) {
                    const summary = summaryView(prepared.data.summarize(target)), issues = [...summary.issues];
                    for (const address of summary.requiredBindingAddresses) { const binding = bindings.get(address.nodeId)?.result; if (!binding?.ok) issues.push(binding?.error.message || 'Missing model connection.'); }
                    summaries.set(targetKey(target), freeze({ ...summary, issues: [...new Set(issues)] }));
                }
            }
        }
        projections.set(token, { legacy: true, graph, base: freeze(structuredClone(view)), freshness, result, summaries, targets, rows: new WeakMap() }); return token;
    }
    const prepared = planner === undefined ? prepareWorkflowPlanner(root) : { ok: true, data: planner };
    if (!prepared.ok) return reject(prepared.error.message, baseWorkflowView(graph, profiles, settings));
    planner = prepared.data;
    const composition = prepareCompositionViews(root, planner);
    if (!composition.ok) return reject(composition.error.message, baseWorkflowView(graph, profiles, settings));
    const inventory = planner.inventory, bindings = new Map(), boundIssues = new Map();
    // Effective materialized model overrides are explicit; inherited definitions cannot re-read root roles.
    for (const unit of inventory.primitives) if (unit.requestBound > 0) {
        let resolution;
        try { resolution = resolveBinding?.(unit.node, { schema: 3, runtime: 2, mode: graph.mode, roles: {} }); }
        catch (error) { resolution = { ok: false, error: { message: error?.message || 'Connection preparation failed.' } }; }
        const binding = resolution?.ok ? safeBinding(resolution.data) : null;
        bindings.set(addressKey(unit.address), binding || {});
        if (!resolution?.ok) boundIssues.set(addressKey(unit.address), resolution?.error?.message || 'Bind ' + (unit.node.modelRole || 'model') + ' to an available connection before running.');
    }
    const withBindings = summary => {
        const safe = summaryView(summary), issues = [...safe.issues];
        for (const address of safe.requiredBindingAddresses) if (boundIssues.has(addressKey(address))) issues.push(boundIssues.get(addressKey(address)));
        return freeze({ ...safe, issues: [...new Set(issues)] });
    };
    const rootSummary = withBindings(planner.summarize()), summaries = new Map(), targets = [], previewTargets = new Map();
    for (const pin of inventory.pins) if (pin.direction === 'output') targets.push(pin.address);
    targets.push(...inventory.terminals);
    const checked = preparedWorkflowExpansion(root, planner).data;
    for (const target of targets) {
        summaries.set(targetKey(target), withBindings(planner.summarize(target)));
        const mapping = target.kind === 'terminal' ? null : checked.boundaryMappings.find(item => targetKey({ ...item.instance, portId: item.portId }) === targetKey(target) || targetKey(item.boundary) === targetKey(target));
        previewTargets.set(targetKey(target), ownedPreviewTarget(mapping?.source || target));
    }
    prepareRecordedAliases(root, result?.recording, graph.id, previewTargets);
    const units = new Map(inventory.primitives.map(unit => [addressKey(unit.address), unit])), views = new Map();
    for (const view of composition.data.views) {
        const nodes = Object.values(view.effectiveNodes).flatMap(node => {
            const address = { workflowId: inventory.workflowId, instancePath: view.instancePath, nodeId: node.id }, unit = units.get(addressKey(address));
            const op = operationFor(node, { phase: inventory.phase });
            if (!op && node.type !== 'subgraph') return [];
            const binding = bindings.get(addressKey(address)), role = node.modelRole ?? op?.modelRole ?? null;
            const metadata = op || { title: node.title || 'Subgraph', family: 'Subgraphs', phase: inventory.phase, terminal: false, defaults: {} };
            return [{ id: node.id, address, canonicalTitle: metadata.title, alias: String(node.presentation?.alias || '').slice(0, 80), compact: node.presentation?.compact === true,
                title: node.presentation?.alias || node.title || metadata.title, operation: node.operation || 'subgraph', family: metadata.family, phase: metadata.phase || inventory.phase,
                input: metadata.input || 'snapshot', output: metadata.output || 'host output', terminal: metadata.terminal, modelRole: role,
                profileId: node.profileId || '', model: node.model || '', enabled: node.enabled !== false,
                effective: unit?.requestBound ? [binding?.profileId, binding?.model].filter(Boolean).join(' · ') || boundIssues.get(addressKey(address)) || 'Model connection' : 'No model call',
                controls: nodeControls(node, metadata), ports: view.ports.filter(pin => pin.address.nodeId === node.id) }];
        });
        const groups = Object.values(view.savedGraph.groups ?? {}).filter(group => group.component).map(group => ({ id: group.id, title: group.title, members: [...group.members], collapsed: group.collapsed,
            callBound: nodes.filter(node => group.members.includes(node.id)).reduce((sum, node) => sum + (units.get(addressKey(node.address))?.requestBound || 0), 0) }));
        views.set(pathKey(view.instancePath), freeze({ instancePath: view.instancePath, editable: view.editable, nodes, groups, targets: targets.filter(target => pathKey((target.kind === 'terminal' ? target.address : target).instancePath) === pathKey(view.instancePath)) }));
    }
    const handles = new Map();
    const applyTerminals = new Set(inventory.primitives.filter(unit => unit.terminal && unit.node.operation === 'apply-reply').map(unit => addressKey(unit.address)));
    for (const raw of result?.reviewHandles || []) {
        const handle = safeHandle(raw);
        if (!handle || handle.runId !== result.runId || handle.terminal.address.workflowId !== graph.id || result.mode !== 'root' || !result.ok || !applyTerminals.has(addressKey(handle.terminal.address))) continue;
        const freshness = candidateStatus?.(handle);
        handles.set(handle.handleId, freeze({ handle, issue: freshness?.ok === false ? freshness.error.message : '' }));
    }
    projections.set(token, { base: freeze(baseWorkflowView(graph, profiles, settings)), rootSummary, summaries, views, handles, previewTargets, result, rows: new WeakMap() }); return token;
}
function cachedRows(owner, source, viewPath) {
    if (!source || typeof source !== 'object') return noRows;
    let views = owner.rows.get(source); if (!views) { views = new Map(); owner.rows.set(source, views); }
    const key = pathKey(viewPath);
    if (!views.has(key)) views.set(key, projectRunRows(source, viewPath));
    return views.get(key);
}
const progressSource = (recording, runState) => runState && (!recording || runState.runId !== recording.runId || runState.lastSeq > recording.lastSeq) ? runState : recording;
function boundedSections(recording, target) {
    if (!recording || !target) return [];
    let artifactId = null;
    if (target.kind === 'terminal') {
        const entry = recording.terminals.find(item => {
            const address = expandRecordAddress(recording, item.address); return address && addressKey(address) === addressKey(target.address);
        });
        artifactId = entry?.artifact;
    } else {
        const unit = recording.units.find(item => { const address = expandRecordAddress(recording, item.address); return address && addressKey(address) === addressKey(target); });
        artifactId = unit?.ports.find(port => port.direction === 'output' && recording.identities.strings[port.port] === target.portId)?.artifact;
    }
    const artifact = recording.artifacts.find(item => item.id === artifactId);
    return artifact ? [{ kind: artifact.kind, ...formatRecordedArtifact(artifact) }] : [];
}
function legacyResultView(result, owner, applyIssue) {
    if (!result) return null;
    const artifact = candidateOf(result), supported = owner.graph.schema === 2 && owner.graph.runtime === 1;
    return { kind: 'legacy', ok: result.ok, error: result.error?.message || '', actualCalls: result.actualCalls ?? result.calls?.length ?? 0,
        callBound: result.callBound ?? owner.base.callBound,
        guidance: result.artifact?.kind === 'guidance' ? result.artifact.text : '', original: artifact?.original || (result.artifact?.kind === 'draft' ? result.artifact.text : ''),
        candidate: artifact?.text || '', findings: artifact?.findings || [], changes: artifact?.changes || [], reports: result.reports || [], calls: result.calls || [],
        tokenMethods: [...new Set([...(result.reports || []).map(report => report.method || report.tokenMethod), ...(result.calls || []).map(call => call.tokenCount?.method)].filter(Boolean))],
        applyAvailable: supported && !!artifact && result.ok === true,
        applyIssue: !supported ? owner.base.issues[0] || 'Unsupported workflow execution version.' : owner.freshness?.ok === false ? owner.freshness.error.message : applyIssue };
}
/** Selection/navigation projection: no resolver, binding, freshness or signature work. */
export function projectPreparedWorkflow(prepared, { viewPath = [], selectedId = null, selectedAddress, selectedTarget, selectedReviewHandle, pinnedPreview, result, recording, runState = null, availability = 'current', preparationError = null, busy = false, status = '', applyIssue = '' } = {}) {
    const owner = projections.get(prepared);
    if (!owner) return emptyView('Use an actual prepared projection.');
    result ??= owner.result;
    if (owner.failure) return { ...owner.failure, busy, status, result: result ? { kind: 'bounded', ok: result.ok === true, error: result.error?.message || '', actualCalls: result.actualCalls || 0, callBound: 0, sections: [], applyAvailable: false, applyIssue: owner.failure.issues[0], tokenMethods: [] } : null };
    recording ??= result?.recording;
    if (owner.legacy) {
        const target = targetAddress(selectedTarget), pinned = targetAddress(pinnedPreview), address = nodeAddress(selectedAddress);
        const summary = target ? owner.summaries.get(targetKey(target)) || { callBound: 0, issues: ['Select an actual output or tagged terminal.'], requiredBindingAddresses: [] } : { callBound: owner.base.callBound, issues: owner.base.issues, requiredBindingAddresses: [] };
        const resultView = result?.mode === 'target' ? { kind: 'bounded', ok: result.ok === true, error: result.error?.message || '', actualCalls: result.actualCalls || 0, callBound: result.callBound ?? summary.callBound,
            runId: recording?.runId || result.runId || '', sections: boundedSections(recording, pinned || target), tokenMethods: [], applyAvailable: false, selectedReviewHandle: null, applyIssue: '' } : legacyResultView(result, owner, applyIssue);
        if (resultView && availability !== 'current') resultView.applyAvailable = false;
        return { ...owner.base, selectedId: address && address.workflowId === owner.base.graphId && !address.instancePath.length ? address.nodeId : selectedId,
            targets: owner.targets, targetSummary: summary, callBound: summary.callBound, issues: summary.issues, busy, status, result: resultView, rows: cachedRows(owner, progressSource(recording, runState), []), recording: recording || null, availability, preparationError };
    }
    const path = safeWorkflowData(viewPath) && Array.isArray(viewPath) ? pathKey(viewPath) : '', view = owner.views.get(path);
    if (!view) return { ...owner.base, ...emptyView('The selected workflow view is unavailable.'), busy, status };
    const address = nodeAddress(selectedAddress), target = targetAddress(selectedTarget), pinned = targetAddress(pinnedPreview);
    const summary = target ? owner.summaries.get(targetKey(target)) || { callBound: 0, issues: ['Select an actual output or tagged terminal.'], requiredBindingAddresses: [] } : owner.rootSummary;
    const selector = safeHandle(selectedReviewHandle), cached = selector ? owner.handles.get(selector.handleId) : null;
    const validHandle = cached && selector.runId === cached.handle.runId && targetKey(selector.terminal) === targetKey(cached.handle.terminal) && target?.kind === 'terminal' && targetKey(target) === targetKey(cached.handle.terminal)
        && result?.mode === 'root' && result?.ok && result.runId === selector.runId && recording?.runId === selector.runId && availability === 'current' && !view.instancePath.length;
    const preview = historicalPreviewTarget(recording, pinned || target), displayedTarget = preview.target;
    const resultView = result || recording ? { kind: 'bounded', ok: result?.ok === true, error: result?.error?.message || '', actualCalls: result?.actualCalls || 0, callBound: result?.callBound ?? recording?.plan?.callBound ?? summary.callBound,
        runId: recording?.runId || result?.runId || '', sections: preview.unavailable ? [{ kind: 'diagnostic', ...formatRecordedArtifact({ format: 'omitted', reason: 'historical wrapper mapping unavailable' }) }] : boundedSections(recording, displayedTarget), previewTarget: displayedTarget, applyAvailable: !!validHandle,
        selectedReviewHandle: validHandle ? cached.handle : null, applyIssue: validHandle ? cached.issue || applyIssue : applyIssue, tokenMethods: [...new Set((recording?.units || []).map(unit => unit.request?.tokenCount?.method).filter(Boolean))] } : null;
    const rowSource = progressSource(recording, runState);
    return { ...owner.base, nodes: view.nodes, groups: view.groups, selectedId: address && address.workflowId === owner.base.graphId && pathKey(address.instancePath) === path ? address.nodeId : selectedId,
        instancePath: view.instancePath, editable: view.editable, targets: view.targets, targetSummary: summary, callBound: summary.callBound, issues: summary.issues,
        busy, status, result: resultView, rows: cachedRows(owner, rowSource, view.instancePath), recording: recording || null, availability, preparationError };
}
/** Compatibility preparation wrapper. Controllers should cache the explicit producer. */
export function projectWorkflow(graph, options = {}) { return projectPreparedWorkflow(prepareWorkflowProjection(graph, options), options); }

export function createWorkflowSurface(target, actions, mode = 'setup') {
    return uiBundle.mountWorkflowSurface(target, {
        ...actions,
        editRules(id, text) {
            const parsed = parseWorkflowRules(text);
            if (!parsed.ok) return parsed.error;
            actions.updateNode(id, 'rules', parsed.data);
            return null;
        },
    }, mode);
}



/** Legacy candidates stay captured; bounded diagnostics are shared by exact immutable reference. */
const freezeCandidate = value => { if (value && typeof value === 'object') { for (const child of Object.values(value)) freezeCandidate(child); Object.freeze(value); } return value; };
function boundedResult(raw, handles) {
    const result = { schema: raw.schema, runtime: raw.runtime, mode: raw.mode, runId: raw.runId, ok: raw.ok === true, callBound: raw.callBound, actualCalls: raw.actualCalls, recording: raw.recording, reviewHandles: handles };
    const error = safeError(raw.error); if (error) result.error = error;
    for (const key of ['preview', 'published', 'fallback']) if (raw[key] !== undefined) result[key] = raw[key];
    return freeze(result);
}
export function createWorkflowSession({ runtime, current, epoch, rootCurrent = current, runEpoch = epoch, active, changed }) {
    let result = null, recording = null, runState = null, preparationError = null, reviewHandles = [], availability = 'current';
    let busy = false, status = '', applyIssue = '', generation = 0, invocation = null;
    let ignoredAutomatic = new WeakSet(), displayedAutomatic = null;
    const publish = () => changed({ result, recording, runState, preparationError, reviewHandles, availability, busy, status, applyIssue });
    const rootOwned = transaction => active() && rootCurrent() === transaction.graph && generation === transaction.serial;
    const valid = transaction => rootOwned(transaction) && runEpoch() === transaction.epoch && !transaction.cancelled;
    const settledValid = transaction => valid(transaction) && workflowSignature(transaction.graph) === transaction.revision;
    function clearAuthority() {
        reviewHandles = [];
        if (result?.recording && (result.schema === 3 || result.mode === 'target')) result = boundedResult(result, reviewHandles);
    }
    function adopt(response, cancelled = false, revision) {
        preparationError = null;
        if (response.recording) {
            recording = response.recording;
            rememberRecordingRevision(recording, revision);
            if (runState?.runId !== recording.runId) runState = null;
            reviewHandles = cancelled || response.mode !== 'root' ? [] : (response.reviewHandles || []).map(safeHandle).filter(Boolean);
            if (response.schema === 3 || response.mode === 'target') result = boundedResult(response, reviewHandles);
            else { const { recording: ignored, ...legacyResult } = response; result = freezeCandidate({ ...structuredClone(legacyResult), recording }); }
            availability = cancelled ? 'cancelled' : 'current';
        } else if (response.ok === false && (recording || invocation?.graph.schema === 3)) {
            preparationError = safeError(response.error) || { code: 'PREPARATION_FAILED', message: 'Workflow preparation failed.' };
            clearAuthority(); availability = recording ? 'superseded' : 'current';
        } else { result = freezeCandidate(structuredClone(response)); reviewHandles = []; availability = 'current'; }
        status = cancelled ? response.error?.message || 'Run cancelled.' : response.ok ? 'Run complete. Review the result.' : response.error?.message || 'Run failed.';
    }
    function capture() {
        const graph = rootCurrent(), transaction = { graph, epoch: runEpoch(), serial: ++generation, revision: workflowSignature(graph), runId: null, cancelled: false };
        invocation = transaction; return transaction;
    }
    function observe(transaction, event) {
        const cancelledSettlement = transaction.cancelled && rootOwned(transaction) && transaction.runId && own(event, 'runId') === transaction.runId && own(event, 'type') === 'run-settled' && own(event, 'status') === 'cancelled';
        if (!cancelledSettlement && !valid(transaction)) return;
        let previous = runState;
        if (!transaction.runId) {
            if (own(event, 'type') !== 'plan' || own(event, 'seq') !== 1) return;
            previous = createRunState(own(event, 'runId'));
        }
        const next = reduceRunState(previous, event);
        if (!next || next === previous) return;
        transaction.runId = next.runId; runState = next; publish();
    }
    return {
        result: () => result,
        receiveAutomatic(record) {
            const graph = rootCurrent(), origin = record?.origin;
            if (!active() || !record?.result || !origin || origin.kind !== 'send' || origin.phase !== 'pre' || graph?.mode !== 'native-pre' || origin.graph !== graph || origin.graphId !== graph.id || origin.signature !== workflowSignature(graph) || ignoredAutomatic.has(record) || displayedAutomatic === record) return;
            if (busy) { ignoredAutomatic.add(record); return; }
            // A payload-free superseded Send cannot replace the one retained diagnostic.
            if (record.result.schema === 3 && !record.result.recording) return;
            if (record.result.schema === 3 && availability !== 'current' && recording?.runId === record.result.recording.runId) return;
            generation++; invocation = null; displayedAutomatic = record; adopt(record.result, false, origin.signature); applyIssue = '';
            status = `Automatic Send · pre phase · "${origin.graphName || graph.name}". ${result?.ok ? 'Review the result.' : record.result.error?.message || 'Run failed.'}`; publish();
        },
        refreshFreshness(selector) {
            const handle = safeHandle(selector), legacyCandidate = candidateOf(result);
            const captured = handle && reviewHandles.find(item => item.handleId === handle.handleId && item.runId === handle.runId && targetKey(item.terminal) === targetKey(handle.terminal));
            const freshness = captured || legacyCandidate ? runtime()?.candidateStatus?.(captured || legacyCandidate) : null;
            applyIssue = freshness?.ok === false ? freshness.error.message : ''; publish();
        },
        async run(options = {}) {
            const controller = runtime(), previous = controller?.lastAutomaticResult?.();
            if (previous?.origin.graph === rootCurrent()) ignoredAutomatic.add(previous);
            displayedAutomatic = null;
            const transaction = capture();
            if (recording) { clearAuthority(); availability = 'superseded'; } else result = null;
            runState = null; preparationError = null; busy = true; status = ''; applyIssue = ''; publish();
            try {
                if (!controller) throw new Error('Native workflow runtime is unavailable.');
                const onEvent = event => observe(transaction, event);
                const response = await (options.target !== undefined ? controller.runTarget(transaction.graph, options.target, { ...options, onEvent }) : transaction.graph.mode === 'native-pre' ? controller.runPre(transaction.graph, { ...options, onEvent }) : controller.runPost(transaction.graph, undefined, { ...options, onEvent }));
                const cancelledDiagnostic = transaction.cancelled && rootOwned(transaction) && transaction.runId && response?.ok === false && response.error?.code === 'ABORTED' && response.recording?.status === 'cancelled' && response.recording.runId === transaction.runId;
                if (!cancelledDiagnostic && !settledValid(transaction)) return;
                adopt(response, cancelledDiagnostic, transaction.revision); busy = false; publish(); return response;
            } catch (error) {
                if (valid(transaction)) { preparationError = { code: 'PREPARATION_FAILED', message: error?.message || 'Run failed.' }; status = preparationError.message; busy = false; clearAuthority(); publish(); }
            } finally {
                if (invocation === transaction) {
                    invocation = null;
                    if (busy && generation === transaction.serial) { busy = false; clearAuthority(); availability = recording ? 'stale' : 'current'; publish(); }
                }
            }
        },
        async apply(selector) {
            if (busy || !result?.ok || availability !== 'current') return;
            let candidate;
            if (result.schema === 3 || result.mode === 'target') {
                const handle = safeHandle(selector);
                candidate = handle && reviewHandles.find(item => item.handleId === handle.handleId && item.runId === handle.runId && targetKey(item.terminal) === targetKey(handle.terminal));
                if (!candidate || result.mode !== 'root' || candidate.runId !== result.runId || candidate.terminal.address.workflowId !== rootCurrent()?.id) return;
            } else if (result.artifact?.kind === 'candidate') candidate = freezeCandidate(structuredClone(result.artifact));
            if (!candidate) return;
            const freshness = runtime()?.candidateStatus?.(candidate);
            if (freshness?.ok === false) { applyIssue = freshness.error.message; status = applyIssue; publish(); return; }
            const transaction = capture(); busy = true; publish();
            try {
                const response = await runtime().apply(candidate);
                if (!settledValid(transaction)) return;
                status = response.ok ? 'Candidate applied in memory. Save durability is unconfirmed.' : response.error?.message || 'Apply failed.';
                if (response.ok) { clearAuthority(); availability = recording ? 'stale' : 'current'; if (!recording) result = null; }
            } catch (error) { if (valid(transaction)) status = error?.message || 'Apply failed.'; }
            finally { if (valid(transaction)) { busy = false; invocation = null; publish(); } }
        },
        cancel(reason = 'Workflow view closed') {
            // Host publishes the recording barrier synchronously while this observer still owns the invocation.
            runtime()?.cancel(reason);
            if (invocation) invocation.cancelled = true;
            displayedAutomatic = null; ignoredAutomatic = new WeakSet(); clearAuthority();
            if (!recording) result = null;
            availability = recording ? 'stale' : 'current'; busy = false; status = ''; applyIssue = ''; publish();
        },
        invalidate(reason = 'Workflow changed') {
            runtime()?.cancel(reason); generation++; invocation = null; clearAuthority();
            if (!recording) result = null;
            availability = recording ? 'stale' : 'current'; busy = false; status = ''; applyIssue = ''; publish();
        },
        reject() {
            runtime()?.cancel('Candidate rejected'); generation++; invocation = null; clearAuthority();
            if (!recording) result = null;
            availability = recording ? 'stale' : 'current'; busy = false; applyIssue = ''; status = 'Candidate rejected. Original reply preserved.'; publish();
        },
    };
}
