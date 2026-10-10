/** Current Lattice host facade. SillyTavern owns native reply generation. */
import { ctx, safe, settings } from './state.js?v=0.27.0';
import { validateWorkflow } from './workflow/contracts.js?v=0.27.0';
import { createNativeWorkflowController } from './workflow/host.js?v=0.27.0';
import { bindingStatus } from './workflow/connections.js?v=0.27.0';
import { createFastRegistry } from './workflow/fast-registry.js?v=0.27.0';
import { createFastHostBridge } from './workflow/fast-host.js?v=0.27.0';
import { createChatDocumentCatalog } from './workflow/document-catalog.js?v=0.27.0';
import { createRecallShortcutRegistry } from './ui/recall-shortcuts.js?v=0.27.0';
import { createNativePersistenceVerifier } from './workflow/native-persistence.js?v=0.27.0';
export { runWorkflow, workflowSignature } from './workflow/runtime.js?v=0.27.0';
export { createNativeWorkflowController, snapshotContext, snapshotReply } from './workflow/host.js?v=0.27.0';

let controller, helpers, userHelpers, nativeUserReader, initialization, fastRegistry, fastBridge, documentCatalog, persistenceVerifier, recallShortcuts, recallEvents;
const fastSettingsKey = 'lattice_fast_connections';
const currentUser = () => userHelpers?.getCurrentUserHandle?.();
// The immutable native export reads the current handle without invoking graph or
// request hooks. Private transport uses this separate passive authority last.
const transportUserId = () => nativeUserReader?.();
function hostSettings() {
    const c = ctx(), root = c.extensionSettings ?? c.extension_settings;
    if (!root || typeof root !== 'object' || Array.isArray(root)) throw new Error('Host settings unavailable');
    return root;
}
/** Provider configuration is host-owned; session credentials never enter workflow settings. */
export function getFastConnectionRegistry() {
    return fastRegistry ??= createFastRegistry({
        getUserId: currentUser,
        getConfiguration: () => { const property = Object.getOwnPropertyDescriptor(hostSettings(), fastSettingsKey); if (property && !Object.hasOwn(property,'value')) throw new Error('Fast settings accessor'); return property?.value ?? { schema: 1, connections: {} }; },
        setConfiguration: value => { hostSettings()[fastSettingsKey] = value; },
        save: () => { const current = ctx(); if (typeof current.saveSettingsDebounced !== 'function') throw new Error('Host save unavailable'); return current.saveSettingsDebounced(); },
        fetch: (...args) => globalThis.fetch(...args),
    });
}
/** UI authorization and accepted writes share one live user/chat catalog lease. */
export function getStoryDocumentCatalog() {
    return documentCatalog ??= createChatDocumentCatalog({getContext:ctx,getUserId:currentUser,
        saveMetadata:async()=>{const saved=await getNativePersistenceVerifier().saveAndVerify({kind:'document-catalog'});return saved.ok&&saved.data.acknowledged===true;}});
}
export function getNativePersistenceVerifier() {
    return persistenceVerifier ??= createNativePersistenceVerifier({getContext:ctx,getUserId:currentUser,fetch:(...args)=>globalThis.fetch(...args)});
}
export const storyDocumentState = () => getStoryDocumentCatalog().snapshot();
function getFastBridge() { return fastBridge ??= createFastHostBridge(getFastConnectionRegistry(), { completionBindingStatus: bindingStatus }); }
export const fastConnectionState = () => getFastConnectionRegistry().snapshot();
export const fastConnectionPreview = node => getFastBridge().preview(node);
export function callCount(graph) { const checked = validateWorkflow(graph); return checked.ok ? checked.data.callBound : 0; }
/** Send follows its assigned workflow independently of the open editor tab. */
export function sendWorkflowState() {
    const value = settings(), assigned = value.graphs[value.nativeBindings.workflowGraphId];
    const checked = assigned ? validateWorkflow(assigned) : null;
    const graph = checked?.ok && assigned.mode === 'native-unified' ? assigned : null;
    return { automatic: !!graph,
        armLabel: graph ? 'Enable unified workflow on Send' : 'Enable workflows (assign a unified workflow)',
        armedText: graph ? '"' + graph.name + '" runs one unified workflow across preparation, SillyTavern generation and reply review (maximum ' + checked.data.callBound + ' auxiliary requests). SillyTavern builds its normal prompt.' : 'The assigned unified workflow cannot run: ' + (checked?.error?.message ?? 'Assign a valid unified workflow.') + ' SillyTavern builds its normal prompt.',
        offText: 'Lattice is off. Enable it to run the assigned unified workflow on Send.',
    };
}
export function getNativeWorkflowController() {
    return controller ??= createNativeWorkflowController({
        registerRecallHotkey: request => { recallShortcuts ??= createRecallShortcutRegistry(globalThis.document,{changed:()=>safe(()=>globalThis.document.dispatchEvent(new CustomEvent('pc-recall-state')))}); return recallShortcuts.register(request); },
        context: ctx, userId: currentUser, transportUserId, documentCatalog: getStoryDocumentCatalog(), persistenceVerifier: getNativePersistenceVerifier(),
        isEnabled: () => settings().enabled === true,
        getGraph: () => settings().graphs[settings().nativeBindings.workflowGraphId],
        isBusy: () => !helpers || helpers.isGenerating(),
        syncMesToSwipe: (...args) => helpers?.syncMesToSwipe(...args), syncSwipeToMes: (...args) => helpers?.syncSwipeToMes(...args),
        resolveFastBinding: node => getFastBridge().resolve(node), fastBindingSummary: binding => getFastBridge().summary(binding),
        requestFastDecision: options => getFastBridge().request(options.binding, { state: options.state, questions: options.questions, signal: options.signal }), bindingStatus: (binding,context) => getFastBridge().bindingStatus(binding,context),
        countTokens: async text => { const count = ctx().getTokenCountAsync; if (typeof count === 'function') { const tokens = await count(text); if (Number.isFinite(tokens) && tokens >= 0) return { tokens, method: 'host-tokenizer' }; } return { tokens: Math.ceil(text.length / 4), method: 'character-estimate' }; },
        onResult: (result, origin) => { if (!result.ok) safe(() => globalThis.toastr?.warning(result.error.message, 'Lattice workflow')); if (origin) safe(() => globalThis.document?.dispatchEvent(new CustomEvent('pc-native-result'))); },
    });
}
/** Public host helpers are imported independently so missing user support cannot disable reviewed workflows. */
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
