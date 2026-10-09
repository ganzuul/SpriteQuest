/** Current Lattice host facade. Workflow requests never replace the host prompt. */
import { ctx, safe, settings } from './state.js?v=0.22.0';
import { validateWorkflow } from './workflow/contracts.js?v=0.22.0';
import { createNativeWorkflowController } from './workflow/host.js?v=0.22.0';
export { runWorkflow, workflowSignature } from './workflow/runtime.js?v=0.22.0';
export { createNativeWorkflowController, snapshotContext, snapshotReply } from './workflow/host.js?v=0.22.0';

let controller, helpers, initialization;
export function callCount(graph) {
    const checked = validateWorkflow(graph);
    return checked.ok ? checked.data.callBound : 0;
}
/** Send follows the assigned pre workflow, independently of the open graph tab. */
export function sendWorkflowState() {
    const value = settings(), assigned = value.graphs[value.nativeBindings.preGraphId];
    const checked = assigned ? validateWorkflow(assigned, { phase: 'pre' }) : null;
    const graph = checked?.ok ? assigned : null;
    return {
        automatic: !!graph,
        armLabel: graph ? 'Enable guidance before Send' : 'Enable workflows (assign pre guidance in Setup)',
        armedText: graph ? '"' + graph.name + '" adds guidance before Send (maximum ' + checked.data.callBound + ' auxiliary requests). SillyTavern builds its normal prompt. Post repair remains manual.' : assigned ? 'The assigned workflow cannot run: ' + checked.error.message + ' SillyTavern builds its normal prompt.' : 'No pre workflow is assigned. Post repair is manual via Run and review. SillyTavern builds its normal prompt.',
        offText: 'Lattice is off. SillyTavern builds its normal prompt. Post repair requires manual Run and review.',
    };
}
export function getNativeWorkflowController() {
    return controller ??= createNativeWorkflowController({
        context: ctx,
        isEnabled: () => settings().enabled === true,
        getGraph: phase => settings().graphs[settings().nativeBindings[phase === 'pre' ? 'preGraphId' : 'postGraphId']],
        isBusy: () => !helpers || helpers.isGenerating(),
        syncMesToSwipe: (...args) => helpers?.syncMesToSwipe(...args),
        syncSwipeToMes: (...args) => helpers?.syncSwipeToMes(...args),
        countTokens: async text => {
            const count = ctx().getTokenCountAsync;
            if (typeof count === 'function') { const tokens = await count(text); if (Number.isFinite(tokens) && tokens >= 0) return { tokens, method: 'host-tokenizer' }; }
            return { tokens: Math.ceil(text.length / 4), method: 'character-estimate' };
        },
        onResult: (result, origin) => {
            if (!result.ok) safe(() => globalThis.toastr?.warning(result.error.message, 'Lattice workflow'));
            if (origin) safe(() => globalThis.document?.dispatchEvent(new CustomEvent('pc-native-result')));
        },
    });
}
/** These are actual public SillyTavern helpers; absence keeps review unavailable. */
export function initializeNativeWorkflowController() {
    const current = getNativeWorkflowController(); current.subscribe();
    initialization ??= import('/script.js').then(module => {
        if (['isGenerating', 'syncMesToSwipe', 'syncSwipeToMes'].every(key => typeof module[key] === 'function')) helpers = module;
    }).catch(() => {});
    return initialization;
}
