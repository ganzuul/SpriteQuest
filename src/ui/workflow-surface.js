import { workflowSignature } from '../workflow/runtime.js?v=0.18.0';
import * as uiBundle from '../../dist/silly-canvas-ui.js?v=0.18.0';
import { FAMILIES, OPERATIONS, operationFor } from '../workflow/catalog.js?v=0.18.0';
import { safeWorkflowData, validateWorkflow } from '../workflow/contracts.js?v=0.18.0';
import { STARTERS } from '../workflow/starters.js?v=0.18.0';
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
export function projectWorkflow(graph, { profiles = [], settings = {}, selectedId = null, result = null, busy = false, status = '', applyIssue = '', resolveBinding, candidateStatus } = {}) {
    const validation = graph?.schema === 2 ? validateWorkflow(graph) : null;
    const issues = validation && !validation.ok ? [validation.error.message] : [];
    const reachable = new Set(validation?.ok ? validation.data.orderedNodes.map(node => node.id) : []);
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
        return { id: node.id, title: node.title || op.title, operation: node.operation, family: op.family, phase: op.phase, input: op.input || 'snapshot', output: op.output || 'host output', terminal: op.terminal, modelRole: role, profileId: node.profileId || '', model: node.model || '', effective, enabled: node.enabled !== false, controls };
    });
    const artifact = result?.artifact?.kind === 'candidate' ? result.artifact : result?.candidate;
    const freshness = artifact ? candidateStatus?.(artifact) : null;
    const roleNames = [...new Set([...Object.keys(graph?.roles ?? {}), ...nodes.map(node => node.modelRole).filter(Boolean)])];
    const families = FAMILIES.map(name => ({
        name, description: descriptions[name],
        legacy: legacy[name].map(id => ({ id, title: id === 'memory' ? (name === 'Input' ? 'Memory reader' : 'Memory save') : legacyTitles[id] })),
        operations: Object.values(OPERATIONS)
            .filter(op => op.family === name || name === 'Surface' && ['pattern-scan', 'validate-patches'].includes(op.id))
            .map(op => ({ id: op.id, title: op.title, phase: op.phase, compatible: !graph?.schema || graph.schema !== 2 || op.phase === graph.mode.slice(7) })),
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
        applyAvailable: !!artifact && result.ok === true,
        applyIssue: freshness?.ok === false ? freshness.error.message : applyIssue,
    } : null;
    return {
        graphId: graph?.id || '', name: graph?.name || '', native: graph?.schema === 2,
        phase: graph?.mode?.slice(7) || '', workflowMode: settings.workflowMode || 'legacy',
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



/** A UI transaction holds its frozen candidate and never looks up a newer run on Apply. */
const freezeCandidate = value => { if (value && typeof value === 'object') { for (const child of Object.values(value)) freezeCandidate(child); Object.freeze(value); } return value; };
export function createWorkflowSession({ runtime, current, epoch, active, changed }) {
    let result = null, busy = false, status = '', applyIssue = '', generation = 0;
    const publish = () => changed({ result, busy, status, applyIssue });
    const signature = workflowSignature;
    const capture = () => { const graph = current(), uiEpoch = epoch(), serial = ++generation, revision = signature(graph); return { graph, valid: () => active() && current() === graph && epoch() === uiEpoch && generation === serial && signature(graph) === revision }; };
    return {
        result: () => result,
        refreshFreshness() { const candidate = result?.artifact?.kind === 'candidate' ? result.artifact : null; const freshness = candidate ? runtime()?.candidateStatus?.(candidate) : null; applyIssue = freshness?.ok === false ? freshness.error.message : ''; publish(); },
        async run() {
            const transaction = capture(); result = null; busy = true; status = ''; applyIssue = ''; publish();
            try {
                const controller = runtime();
                if (!controller) throw new Error('Native workflow runtime is unavailable.');
                const response = await (transaction.graph.mode === 'native-pre' ? controller.runPre(transaction.graph) : controller.runPost(transaction.graph));
                if (!transaction.valid()) return;
                result = freezeCandidate(structuredClone(response)); status = response.ok ? 'Run complete. Review the result.' : response.error?.message || 'Run failed.';
            } catch (error) { if (transaction.valid()) status = error.message; }
            finally { if (transaction.valid()) { busy = false; publish(); } }
        },
        async apply() {
            if (busy || !result?.ok || result.artifact?.kind !== 'candidate') return;
            const freshness = runtime()?.candidateStatus?.(result.artifact);
            if (freshness?.ok === false) { applyIssue = freshness.error.message; status = applyIssue; publish(); return; }
            const candidate = freezeCandidate(structuredClone(result.artifact)), transaction = capture();
            busy = true; publish();
            try {
                const response = await runtime().apply(candidate);
                if (!transaction.valid()) return;
                status = response.ok ? 'Candidate applied in memory. Save durability is unconfirmed.' : response.error?.message || 'Apply failed.';
                if (response.ok) result = null;
            } catch (error) { if (transaction.valid()) status = error.message; }
            finally { if (transaction.valid()) { busy = false; publish(); } }
        },
        cancel(reason = 'Workflow view closed') { generation++; runtime()?.cancel(reason); result = null; busy = false; status = ''; applyIssue = ''; publish(); },
        reject() { generation++; result = null; busy = false; applyIssue = ''; status = 'Candidate rejected. Original reply preserved.'; runtime()?.cancel('Candidate rejected'); publish(); },
    };
}
