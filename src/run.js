/** Current Lattice host facade. SillyTavern owns native reply generation. */
import { ctx, safe, settings } from './state.js?v=0.26.0';
import { validateWorkflow } from './workflow/contracts.js?v=0.26.0';
import { createNativeWorkflowController } from './workflow/host.js?v=0.26.0';
import { bindingStatus } from './workflow/connections.js?v=0.26.0';
import { createChatDocumentCatalog } from './workflow/document-catalog.js?v=0.26.0';
import { createRecallShortcutRegistry } from './ui/recall-shortcuts.js?v=0.26.0';
import { createNativePersistenceVerifier } from './workflow/native-persistence.js?v=0.26.0';
export { runWorkflow, workflowSignature } from './workflow/runtime.js?v=0.26.0';
export { createNativeWorkflowController, snapshotContext, snapshotReply } from './workflow/host.js?v=0.26.0';

let controller, helpers, userHelpers, nativeUserReader, initialization, documentCatalog, persistenceVerifier, recallShortcuts, recallEvents;
const currentUser = () => userHelpers?.getCurrentUserHandle?.();
// The immutable native export reads the current handle without invoking graph or
// request hooks. Private transport uses this separate passive authority last.
const transportUserId = () => nativeUserReader?.();
/** UI authorization and accepted writes share one live user/chat catalog lease. */
export function getStoryDocumentCatalog() {
    return documentCatalog ??= createChatDocumentCatalog({getContext:ctx,getUserId:currentUser,
        saveMetadata:async()=>{const saved=await getNativePersistenceVerifier().saveAndVerify({kind:'document-catalog'});return saved.ok&&saved.data.acknowledged===true;}});
}
export function getNativePersistenceVerifier() {
    return persistenceVerifier ??= createNativePersistenceVerifier({getContext:ctx,getUserId:currentUser,fetch:(...args)=>globalThis.fetch(...args)});
}
export const storyDocumentState = () => getStoryDocumentCatalog().snapshot();
export function callCount(graph) { const checked = validateWorkflow(graph); return checked.ok ? checked.data.callBound : 0; }
/** Send follows its assigned workflow independently of the open editor tab. */
export function sendWorkflowState() {
    const value = settings(), unifiedId = value.nativeBindings.workflowGraphId;
    const assigned = value.graphs[unifiedId ?? value.nativeBindings.preGraphId], unified = unifiedId !== undefined && unifiedId !== null;
    const checked = assigned ? validateWorkflow(assigned, unified ? {} : { phase: 'pre' }) : null;
    const graph = checked?.ok && (!unified || assigned.mode === 'native-unified') ? assigned : null;
    if (unified) return { automatic: !!graph,
        armLabel: graph ? 'Enable unified workflow on Send' : 'Enable workflows (assign a unified workflow)',
        armedText: graph ? '"' + graph.name + '" runs one unified workflow across preparation, SillyTavern generation and reply review (maximum ' + checked.data.callBound + ' auxiliary requests). SillyTavern builds its normal prompt.' : 'The assigned unified workflow cannot run: ' + (checked?.error?.message ?? 'Assign a valid unified workflow.') + ' SillyTavern builds its normal prompt.',
        offText: 'Lattice is off. Enable it to run the assigned unified workflow on Send.',
    };
    return { automatic: !!graph,
        armLabel: graph ? 'Enable guidance before Send' : 'Enable workflows (assign a unified workflow or legacy pre phase)',
        armedText: graph ? '"' + graph.name + '" adds guidance before Send (maximum ' + checked.data.callBound + ' auxiliary requests). SillyTavern builds its normal prompt. Post repair remains manual.' : assigned ? 'The assigned workflow cannot run: ' + checked.error.message + ' SillyTavern builds its normal prompt.' : 'No pre workflow is assigned. Assign a unified workflow for preparation and reply review. Post repair is manual via Run and review. SillyTavern builds its normal prompt.',
        offText: 'Lattice is off. SillyTavern builds its normal prompt. Post repair requires manual Run and review.',
    };
}
export function getNativeWorkflowController() {
    return controller ??= createNativeWorkflowController({
        registerRecallHotkey: request => { recallShortcuts ??= createRecallShortcutRegistry(globalThis.document,{changed:()=>safe(()=>globalThis.document.dispatchEvent(new CustomEvent('pc-recall-state')))}); return recallShortcuts.register(request); },
        context: ctx, userId: currentUser, transportUserId, documentCatalog: getStoryDocumentCatalog(), persistenceVerifier: getNativePersistenceVerifier(),
        isEnabled: () => settings().enabled === true,
        getGraph: phase => settings().graphs[settings().nativeBindings[phase === 'unified' ? 'workflowGraphId' : phase === 'pre' ? 'preGraphId' : 'postGraphId']],
        isBusy: () => !helpers || helpers.isGenerating(),
        syncMesToSwipe: (...args) => helpers?.syncMesToSwipe(...args), syncSwipeToMes: (...args) => helpers?.syncSwipeToMes(...args),
        bindingStatus,
        countTokens: async text => { const count = ctx().getTokenCountAsync; if (typeof count === 'function') { const tokens = await count(text); if (Number.isFinite(tokens) && tokens >= 0) return { tokens, method: 'host-tokenizer' }; } return { tokens: Math.ceil(text.length / 4), method: 'character-estimate' }; },
        onResult: (result, origin) => { if (!result.ok) safe(() => globalThis.toastr?.warning(result.error.message, 'Lattice workflow')); if (origin) safe(() => globalThis.document?.dispatchEvent(new CustomEvent('pc-native-result'))); },
    });
}
/** Public host helpers are imported independently so missing user support cannot disable legacy review. */
export function initializeNativeWorkflowController() {
    const current = getNativeWorkflowController(); current.subscribe();
    if(!recallEvents&&globalThis.document?.addEventListener){recallEvents=true;globalThis.document.addEventListener('pc-state',()=>current.syncRecall());}
    current.syncRecall();
    initialization ??= Promise.allSettled([
        import('/script.js').then(module => { if (['isGenerating', 'syncMesToSwipe', 'syncSwipeToMes'].every(key => typeof module[key] === 'function')) helpers = module; }),
        import('/scripts/user.js').then(module => { if (typeof module.getCurrentUserHandle === 'function') { userHelpers = module; nativeUserReader = module.getCurrentUserHandle; } }),
    ]);
    return initialization.then(result=>{current.syncRecall();return result;});
}
