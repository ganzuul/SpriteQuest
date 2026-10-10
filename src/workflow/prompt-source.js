const fail = (code, message) => ({ok:false,error:{code,message}});

// Only pure host name/format macros are admitted. Card fields, lore outlets, variables,
// custom extension macros and random/time macros exceed this read-only source scope.
const pureMacros = new Set(['char','user','group','charifnotgroup','groupnotmuted','notchar','model','newline','trim','noop','original']);
function hasOnlyPureMacros(text) {
    // Legacy angle tokens expand before mutable variable macros in SillyTavern.
    if (/<(?:USER|BOT|CHAR|CHARIFNOTGROUP|GROUP)>/i.test(text)) return false;
    let safe = true;
    const remainder = text.replace(/\{\{([^{}]*)\}\}/g, (_, name) => {
        if (!pureMacros.has(name.toLowerCase())) safe = false;
        return '';
    });
    // Formatting macros can join separated literal braces into new macros.
    return safe && !/[{}]/.test(remainder);
}
function capture(context, text, source, original) {
    const rawSelectedText = text;
    if (source.form === 'resolved') {
        if (!hasOnlyPureMacros(text)) return fail('UNSUPPORTED_PROMPT_MACRO', 'Resolved prompt capture supports pure name and formatting macros only. Use raw form for this template.');
        if (typeof context?.substituteParams !== 'function') return fail('PROMPT_RESOLUTION_UNAVAILABLE', 'The host does not expose supported macro substitution. Use raw form.');
        // Host replacements can introduce later mutable macros. Return inert text
        // and retain failure locally; both host engines can swallow callback errors.
        let replacementRejection = null;
        const postProcessFn = value => {
            if (typeof value !== 'string' || /[{}]|<(?:USER|BOT|CHAR|CHARIFNOTGROUP|GROUP)>/i.test(value)) {
                replacementRejection = 'PROMPT_RESOLUTION_FAILED';
                return '';
            }
            if (value.length > 100000) {
                replacementRejection = 'INPUT_LIMIT';
                return '';
            }
            return value;
        };
        const options = {replaceCharacterCard:false,postProcessFn};
        if (original !== undefined && /\{\{original\}\}/i.test(text)) {
            if (!hasOnlyPureMacros(original)) return fail('UNSUPPORTED_PROMPT_MACRO', 'The configured original contains macros outside read-only resolution. Use raw form.');
            try { options.original = context.substituteParams(original, {replaceCharacterCard:false,postProcessFn}); }
            catch { return fail('PROMPT_RESOLUTION_FAILED', 'The host could not resolve the configured original template.'); }
            if (replacementRejection) return fail(replacementRejection, 'The host original macro replacement exceeded safe read-only resolution.');
            if (typeof options.original !== 'string') return fail('PROMPT_RESOLUTION_FAILED', 'Host macro substitution did not return original text.');
            if (options.original.length > 100000) return fail('INPUT_LIMIT', 'The resolved original exceeds the 100,000-character snapshot limit.');
            if (/\{\{|\}\}|<(?:USER|BOT|CHAR|CHARIFNOTGROUP|GROUP)>/i.test(options.original)) return fail('PROMPT_RESOLUTION_FAILED', 'The host left unresolved macros in the configured original template.');
        }
        try { text = context.substituteParams(text, options); }
        catch { return fail('PROMPT_RESOLUTION_FAILED', 'The host could not resolve this prompt template.'); }
        if (replacementRejection) return fail(replacementRejection, 'The host macro replacement exceeded safe read-only resolution.');
        if (typeof text !== 'string') return fail('PROMPT_RESOLUTION_FAILED', 'Host macro substitution did not return text.');
        if (/\{\{|\}\}|<(?:USER|BOT|CHAR|CHARIFNOTGROUP|GROUP)>/i.test(text)) return fail('PROMPT_RESOLUTION_FAILED', 'The host left unresolved macros in this template. Use raw form.');
    }
    if (text.length > 100000) return fail('INPUT_LIMIT', 'The prompt exceeds the 100,000-character snapshot limit.');
    return {ok:true,artifact:{kind:'text',text,source},fingerprint:JSON.stringify([rawSelectedText,original ?? null,text,source])};
}
function systemOverride(context) {
    if (context?.powerUserSettings?.prefer_character_prompt !== true) return null;
    const character = context?.characters?.[context.characterId];
    if (!character) return null;
    const chat = context?.chatMetadata?.system_prompt;
    const text = chat || character.data?.system_prompt;
    if (!text) return null;
    if (typeof text !== 'string') return fail('PROMPT_UNAVAILABLE', 'The selected system override is not text.');
    return text.trim() ? {text:text.trim(),override:chat ? 'chat' : 'character'} : null;
}
function promptEntry(context, promptId, source, form) {
    const settings = context?.chatCompletionSettings;
    if (!['openai','kobold','koboldhorde','novel','textgenerationwebui'].includes(context?.mainApi) || !Array.isArray(settings?.prompts)) return fail('PROMPT_UNAVAILABLE', 'Public prompt settings are unavailable or malformed.');
    if (settings.prompts.length > 10000 || (Array.isArray(settings.prompt_order) && settings.prompt_order.length > 1000)) return fail('INPUT_LIMIT', 'Public prompt settings exceed the bounded lookup limit.');
    const entries = settings.prompts.filter(prompt => prompt?.identifier === promptId);
    if (entries.length !== 1) return fail('PROMPT_UNAVAILABLE', 'The selected stable prompt identifier is missing or ambiguous.');
    const entry = entries[0];
    if (settings.prompt_order !== undefined && !Array.isArray(settings.prompt_order)) return fail('PROMPT_UNAVAILABLE', 'Public prompt order data is malformed.');
    if (entry?.marker === true) return fail('UNSUPPORTED_PROMPT', 'Prompt markers represent assembled material and cannot be captured as a configured text block.');
    if (!entry || typeof entry.content !== 'string') return fail('PROMPT_UNAVAILABLE', 'The selected prompt entry is unavailable in this host context.');
    let order = settings.prompt_order?.find(list => String(list?.character_id) === '100001'), orderScope = order ? 'global' : 'unavailable';
    if (!order && context?.groupId != null) { order = settings.prompt_order?.find(list => String(list?.character_id) === String(context.groupId)); if (order) orderScope = 'group'; }
    if (!order && context?.characterId != null) { order = settings.prompt_order?.find(list => String(list?.character_id) === String(context.characterId)); if (order) orderScope = 'character'; }
    if (order && !Array.isArray(order.order)) return fail('PROMPT_UNAVAILABLE', 'The active prompt order is malformed.');
    if (order?.order?.length > 10000) return fail('INPUT_LIMIT', 'The active prompt order exceeds the bounded lookup limit.');
    const references = order?.order?.filter(reference => reference?.identifier === promptId) ?? [];
    if (references.length > 1 || (references.length === 1 && typeof references[0].enabled !== 'boolean')) return fail('PROMPT_UNAVAILABLE', 'The selected prompt enabled state is unavailable or ambiguous.');
    const reference = references[0];
    if (order && !reference) return fail('PROMPT_INACTIVE', 'The selected prompt entry is absent from the active prompt order.');
    if (source === 'system' && !reference) return fail('PROMPT_UNAVAILABLE', 'The active main prompt enabled state is not exposed by this host.');
    const enabled = reference?.enabled ?? null;
    if (enabled === false) return fail('PROMPT_DISABLED', 'The selected prompt entry is disabled.');
    if (entry.content.length > 100000) return fail('INPUT_LIMIT', 'The prompt exceeds the 100,000-character snapshot limit.');
    const override = source === 'system' && entry.forbid_overrides !== true ? systemOverride(context) : null;
    if (override?.ok === false) return override;
    const text = override?.text ?? entry.content;
    if (text.length > 100000) return fail('INPUT_LIMIT', 'The prompt exceeds the 100,000-character snapshot limit.');
    return capture(context, text, {source,block:override ? override.override + '-system' : 'prompt-entry',promptId,form,enabled,mainApi:context.mainApi,override:override?.override ?? 'none',orderScope}, override ? entry.content : undefined);
}

/** Capture one configured host template; this never assembles the native prompt. */
function selectSnapshot(context, node = {}) {
    const source = node?.source ?? 'system', form = node?.form ?? 'raw', promptId = node?.promptId ?? 'main';
    if (!['system','prompt-entry'].includes(source) || !['raw','resolved'].includes(form) || (source === 'prompt-entry' && (typeof promptId !== 'string' || !promptId.trim() || promptId.length > 256))) return fail('INVALID_PROMPT_SOURCE', 'Choose a supported prompt source, form, and bounded stable prompt identifier.');
    if (source === 'prompt-entry' || context?.mainApi === 'openai') return promptEntry(context, source === 'system' ? 'main' : promptId, source, form);
    const system = context?.powerUserSettings?.sysprompt;
    if (!['kobold','koboldhorde','novel','textgenerationwebui'].includes(context?.mainApi) || !system || typeof system.enabled !== 'boolean' || typeof system.content !== 'string') return fail('PROMPT_UNAVAILABLE', 'The configured system prompt is unavailable in this host context.');
    if (!system.enabled) return fail('PROMPT_DISABLED', 'The configured system prompt is disabled.');
    if (system.content.length > 100000) return fail('INPUT_LIMIT', 'The prompt exceeds the 100,000-character snapshot limit.');
    const override = systemOverride(context);
    if (override?.ok === false) return override;
    const text = override?.text ?? system.content;
    if (text.length > 100000) return fail('INPUT_LIMIT', 'The prompt exceeds the 100,000-character snapshot limit.');
    return capture(context, text, {source:'system',block:override ? override.override + '-system' : 'sysprompt',form,enabled:true,mainApi:context.mainApi,override:override?.override ?? 'none'}, override ? system.content : undefined);
}

/** A broken public getter is unavailable input, never a retained host exception. */
export function snapshotPromptSource(context, node = {}) {
    try { return selectSnapshot(context, node); }
    catch { return fail('PROMPT_UNAVAILABLE', 'The host prompt settings could not be read safely.'); }
}
/** Opaque freshness material stays with the controller, never in graph controls. */
export function promptSourceFingerprint(context, node = {}) {
    const result = snapshotPromptSource(context, node);
    return result.ok ? {ok:true,data:result.fingerprint} : result;
}
