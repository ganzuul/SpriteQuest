import { createChatMetadataBackend, createMemoryService } from './memory.js?v=0.25.0';
import { fail, makeRecord, ownData, parseRecord, validateEvidence } from './contracts.js?v=0.25.0';

const good = data => ({ ok: true, data });
const id = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 128 && !['__proto__', 'prototype', 'constructor'].includes(value);
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const canonical = value => value === null || typeof value !== 'object' ? JSON.stringify(value) : Array.isArray(value) ? `[${value.map(canonical).join(',')}]` : `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
const plain = value => value && typeof value === 'object' && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const aborted = signal => !!signal && Object.getOwnPropertyDescriptor(AbortSignal.prototype, 'aborted').get.call(signal);
const date = value => value instanceof Date ? value.toISOString() : typeof value === 'string' || typeof value === 'number' ? value : null;

/** Visibility is explicit own data; native visibility accessors never receive authority. */
export function nativeVisibility(material) {
    try {
        const property = material && Object.getOwnPropertyDescriptor(material, 'visibleTo');
        if (!property) return good({ present: false });
        const owned = Object.hasOwn(property, 'value') ? ownData(property.value) : null;
        if (!owned?.ok || !Array.isArray(owned.data) || owned.data.length > 64 || !owned.data.every(value => typeof value === 'string' && value.trim().length > 0 && value.length <= 128)) return fail('INVALID_CONTEXT_VISIBILITY', 'Explicit context visibility requires bounded actor identifiers.');
        return good({ present: true, visibleTo: owned.data });
    } catch { return fail('INVALID_CONTEXT_VISIBILITY', 'Explicit context visibility could not be inspected.'); }
}

/** The actor comes from trusted host selection, never a workflow record. */
export function nativeMemoryScope(context, selectActor) {
    const chatId = context.getCurrentChatId?.() ?? context.chatId;
    const character = context.characters?.[context.characterId];
    let actorId;
    if (typeof selectActor === 'function') actorId = selectActor(context);
    else if (character || (!context.groupId && context.characterId !== undefined && context.characterId !== null)) actorId = `character:${character?.avatar ?? context.characterId}`;
    if (!id(chatId)) return fail('CHAT_REQUIRED', 'Select an active chat before reading or committing memory.');
    if (!id(actorId)) return fail('ACTOR_REQUIRED', 'Select an active character before reading or committing group memory.');
    return good({ chatId, actorId });
}

function selected(context, index, isSettled, actorId) {
    const message = context.chat?.[index];
    if (!message || typeof message.mes !== 'string' || !message.mes.trim() || message.mes === '...' || message.mes.length > 4096 || message.is_system || message.is_tool || message.is_intermediate || ['narrator', 'tool'].includes(message.extra?.type) || (message.role && !['assistant', 'user'].includes(message.role)) || message.extra?.tool_invocations?.length || message.extra?.tool_calls?.length || message.extra?.image || message.extra?.media?.length || message.extra?.isSmallSys || message.extra?.is_intermediate || message.extra?.partial || message.extra?.unfinished || (message.gen_started && !message.gen_finished)) return null;
    const visibility = nativeVisibility(message);
    if (!visibility.ok || (visibility.data.present && !visibility.data.visibleTo.includes(actorId))) return null;
    const settled = isSettled?.(message, index, context);
    if (settled === false) return null;
    const stream = context.streamingProcessor;
    // The trusted native predicate distinguishes selected revisions from an older retained
    // stopped processor. Without that authority, incomplete streaming remains excluded.
    if (settled !== true && stream?.messageId === index && (!stream.isFinished || stream.isStopped || stream.abortController?.signal?.aborted)) return null;
    // Only selected public text and revision identity enter the DTO. Private extra fields stay native.
    return JSON.stringify([index, message.is_user === true ? 'user' : 'assistant', message.mes, message.swipe_id ?? 0, date(message.send_date), date(message.gen_started), date(message.gen_finished), visibility.data]);
}

export async function nativeMemoryFingerprint(value) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

/** One controller owns this adapter and reuses services and unknown-save barriers by scope. */
export function createNativeMemoryAdapter({ context, selectActor, isSettled, storeId = 'native-chat' }) {
    const slots = new Map(), authorities = new WeakMap();
    let writeQueue = Promise.resolve();
    const currentScope = () => nativeMemoryScope(context(), selectActor);
    const checkScope = scope => { const current = currentScope(); return current.ok && equal(current.data, scope) ? good(undefined) : fail('SCOPE_MISMATCH', 'The active chat or actor changed before memory persistence.'); };
    const checkAuthority = authority => {
        if (aborted(authority.signal)) return fail('CANCELLED', 'Memory commit was cancelled before persistence.');
        if (authority.isCurrent?.() === false || context().chat !== authority.chat) return fail('STALE_SOURCE', 'The workflow or chat source changed before memory persistence.');
        return checkScope(authority.scope);
    };

    function createSlot(scope) {
        const slot = { scope, sources: new Map(), persistence: null, unknown: new Map(), backend: null, service: null };
        const persistenceGuard = (key, fingerprint) => {
            if (!slot.unknown.size) return good(undefined);
            const pending = slot.unknown.get(key);
            if (pending && pending.fingerprint !== fingerprint) return fail('IDEMPOTENCY_CONFLICT', 'The commit key has an unconfirmed save for different content.');
            const c = context(), owned = ownData(c.chatMetadata?.latticeIntrospection?.[storeId]?.[scope.actorId]);
            const state = owned.ok ? parseRecord(owned.data.state, 'actor-state') : owned;
            if (!state.ok || !equal(state.data.scope, scope) || state.data.store.id !== storeId || !Array.isArray(owned.data.receipts)) return fail('PERSISTENCE_UNKNOWN', 'Locally applied unconfirmed memory is unavailable; reload confirmed metadata before another write.');
            // A local receipt proves application only. Object replacement can also come
            // from another extension, so only a new adapter after host reload reconciles it.
            for (const unknown of slot.unknown.values()) {
                if (state.data.store.version < unknown.version || !owned.data.receipts.some(receipt => canonical(receipt) === canonical(unknown))) return fail('PERSISTENCE_UNKNOWN', 'An unconfirmed local memory version or receipt changed; reload confirmed metadata before another write.');
            }
            if (slot.unknown.has(key)) return fail('PERSISTENCE_UNKNOWN', 'This exact commit was applied locally but its native save remains unconfirmed; reload confirmed metadata before retrying it.');
            // A distinct next-version intent can advance the intact locally applied state.
            // Package CAS still checks its version, source evidence and stored receipts.
            return good(undefined);
        };
        slot.persistenceGuard = persistenceGuard;
        const metadataContext = () => {
            const checked = checkScope(scope); if (!checked.ok) throw new Error(checked.error.code);
            const c = context();
            if (!plain(c.chatMetadata)) throw new Error('Chat metadata is unavailable');
            return { chatId: scope.chatId, chatMetadata: c.chatMetadata };
        };
        const sourceCheck = refs => {
            const checked = checkScope(scope); if (!checked.ok) return checked;
            const owned = ownData(refs); if (!owned.ok) return owned;
            const valid = validateEvidence(owned.data, owned.data); if (!valid.ok) return valid;
            for (const ref of owned.data) {
                const source = slot.sources.get(JSON.stringify([ref.id, ref.revision]));
                if (!source || context().chat?.[source.index] !== source.message || selected(context(), source.index, isSettled, scope.actorId) !== source.descriptor) return fail('INVALID_INTROSPECTION_EVIDENCE', 'A selected settled message or its actor visibility changed.');
            }
            return good(undefined);
        };
        const readEvents = async () => {
            const checked = checkScope(scope); if (!checked.ok) return checked;
            const c = context(), chat = c.chat;
            if (!Array.isArray(chat)) return fail('INVALID_MEMORY_CONTEXT', 'Active chat messages are unavailable.');
            const descriptors = [];
            for (let index = Math.max(0, chat.length - 64); index < chat.length; index++) {
                const descriptor = selected(c, index, isSettled, scope.actorId);
                if (descriptor) descriptors.push({ index, message: chat[index], descriptor, text: chat[index].mes });
            }
            const events = await Promise.all(descriptors.map(async source => ({ ...source, revision: await nativeMemoryFingerprint(source.descriptor) })));
            const current = checkScope(scope); if (!current.ok) return current;
            if (context().chat !== chat || events.some(source => chat[source.index] !== source.message || selected(context(), source.index, isSettled, scope.actorId) !== source.descriptor)) return fail('STALE_SOURCE', 'Settled messages changed while their evidence was captured.');
            const sources = new Map(), refs = [], material = [];
            for (const source of events) {
                const ref = { id: `chat:${source.index}`, revision: source.revision };
                sources.set(JSON.stringify([ref.id, ref.revision]), source); refs.push(ref);
                material.push({ ...ref, text: source.text, settled: true });
            }
            slot.sources = sources;
            const result = makeRecord('events', { scope, store: { id: storeId, version: 0 } }, { events: material }, refs);
            return result.ok ? good(result.data) : result;
        };
        const saveMetadata = async next => {
            const persistence = slot.persistence;
            const checked = persistence && checkAuthority(persistence.authority);
            if (!checked?.ok) { if (persistence) persistence.failure = checked; return false; }
            const evidence = sourceCheck(persistence.sourceRefs ?? []);
            if (!evidence.ok) { persistence.failure = evidence; return false; }
            const c = context();
            if (typeof c.saveMetadata !== 'function' || !plain(c.chatMetadata)) { persistence.failure = fail('MEMORY_SAVE_UNAVAILABLE', 'The native metadata save API is unavailable.'); return false; }
            const candidate = next.chatMetadata?.latticeIntrospection?.[storeId]?.[scope.actorId];
            const latest = c.chatMetadata.latticeIntrospection?.[storeId]?.[scope.actorId];
            if (!equal(latest, persistence.before)) { persistence.failure = fail('STALE_VERSION', 'Actor memory changed immediately before native persistence.'); return false; }
            const metadata = ownData(c.chatMetadata); if (!metadata.ok) { persistence.failure = metadata; return false; }
            const owned = ownData(candidate); if (!owned.ok) { persistence.failure = owned; return false; }
            const namespace = metadata.data.latticeIntrospection ?? {};
            if (!plain(namespace) || (namespace[storeId] !== undefined && !plain(namespace[storeId]))) { persistence.failure = fail('INVALID_MEMORY_METADATA', 'The native introspection namespace is malformed.'); return false; }
            // No await separates the last authority check, fresh namespace merge and save invocation.
            const final = checkAuthority(persistence.authority); if (!final.ok) { persistence.failure = final; return false; }
            c.chatMetadata.latticeIntrospection = { ...namespace, [storeId]: { ...(namespace[storeId] ?? {}), [scope.actorId]: owned.data } };
            persistence.saveAttempted = true;
            try {
                const result = await c.saveMetadata();
                const acknowledged = result === true || (plain(result) && Object.getOwnPropertyDescriptor(result, 'ok')?.value === true);
                if (!acknowledged) { const receipt = owned.data.receipts.at(-1); slot.unknown.set(receipt.key, receipt); }
                return acknowledged;
            } catch { const receipt = owned.data.receipts.at(-1); slot.unknown.set(receipt.key, receipt); return false; }
        };
        const backend = () => createChatMetadataBackend({ scope, storeId, getContext: metadataContext, saveMetadata, readEvents, validateSources: sourceCheck });
        slot.backend = backend();
        slot.service = createMemoryService({ scope, storeId, load: () => slot.backend.load(), readEvents: () => slot.backend.readEvents(), validateSources: refs => slot.backend.validateSources(refs), compareAndSwap: (input, controls) => {
            const pending = writeQueue.then(async () => {
                const authority = controls.signal && authorities.get(controls.signal);
                if (!authority) return fail('ROOT_REQUIRED', 'Native persistence requires captured workflow authority.');
                const checked = checkAuthority(authority); if (!checked.ok) return checked;
                const persistence = persistenceGuard(input.receipt.key, input.receipt.fingerprint); if (!persistence.ok) return persistence;
                const evidence = sourceCheck(controls.sourceRefs ?? []); if (!evidence.ok) return evidence;
                const c = context();
                slot.persistence = { authority, sourceRefs: controls.sourceRefs, before: structuredClone(c.chatMetadata?.latticeIntrospection?.[storeId]?.[scope.actorId]), failure: null, saveAttempted: false };
                try {
                    const result = await slot.backend.compareAndSwap(input, controls);
                    if (slot.persistence.failure) { slot.backend = backend(); return slot.persistence.failure; }
                    return result;
                } finally { slot.persistence = null; }
            });
            writeQueue = pending.then(() => undefined, () => undefined);
            return pending;
        } });
        return slot;
    }

    function capture({ signal, isCurrent } = {}) {
        try {
            const scope = currentScope(); if (!scope.ok) return scope;
            if (!id(storeId)) return fail('INVALID_MEMORY_CONFIG', 'Native memory store identity is invalid.');
            const authority = { scope: scope.data, signal: signal ?? new AbortController().signal, isCurrent, chat: context().chat };
            const checked = checkAuthority(authority); if (!checked.ok) return checked;
            const key = JSON.stringify([storeId, scope.data.chatId, scope.data.actorId]);
            let slot = slots.get(key); if (!slot) { slot = createSlot(scope.data); slots.set(key, slot); }
            const memory = {
                read: async settings => { const before = checkAuthority(authority); if (!before.ok) return before; const result = await slot.service.read(settings); const after = checkAuthority(authority); return after.ok ? result : after; },
                recall: async settings => { const before = checkAuthority(authority); if (!before.ok) return before; const result = await slot.service.recall(settings); const after = checkAuthority(authority); return after.ok ? result : after; },
                commit: (intent, flags = {}) => {
                    const checked = checkAuthority(authority); if (!checked.ok) return Promise.resolve(checked);
                    const record = parseRecord(intent, 'commit-intent'); if (!record.ok) return Promise.resolve(record);
                    const persistence = slot.persistenceGuard(record.data.payload.idempotencyKey, canonical(record.data)); if (!persistence.ok) return Promise.resolve(persistence);
                    authorities.set(authority.signal, authority);
                    return slot.service.commit(intent, { ...flags, signal: authority.signal });
                },
            };
            return good({ scope: scope.data, storeId, memory, release:()=>{slot.sources.clear();authorities.delete(authority.signal);} });
        } catch { return fail('INVALID_MEMORY_CONTEXT', 'Native memory authority could not be captured.'); }
    }
    return Object.freeze({ capture });
}
