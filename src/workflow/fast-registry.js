import { cloneJsonValue } from './operations/json-data.js?v=0.26.0';
import { freeze } from './record-data.js?v=0.26.0';
const fail = (code, message) => ({ ok: false, error: { code, message } });
const good = data => ({ ok: true, data: freeze(data) });
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value, max) => typeof value === 'string' && !!value.trim() && value.length <= max && !/[\r\n]/.test(value);
const identifier = value => text(value, 128) && !['__proto__', 'prototype', 'constructor'].includes(value);
const canonical = value => Array.isArray(value) ? '[' + value.map(canonical).join(',') + ']' : plain(value) ? '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}' : JSON.stringify(value);
function connection(value, stored = false) {
    const checked = cloneJsonValue(value); if (!checked.ok) throw new Error('connection');
    const config = checked.data.value;
    const keys = stored ? ['id', 'label', 'provider', 'model', 'endpoint', 'credentialRef', 'revision'] : ['id', 'label', 'provider', 'model', 'endpoint'];
    if (!plain(config) || Object.keys(config).some(key => !keys.includes(key)) || !identifier(config.id) || !text(config.model, 256) || !['jev', 'laya', 'compatible'].includes(config.provider) || config.label !== undefined && !text(config.label, 256)) throw new Error('connection');
    if (stored && (!text(config.revision, 128) || config.credentialRef !== undefined && !text(config.credentialRef, 128))) throw new Error('revision');
    const endpoint = config.endpoint ?? (config.provider === 'jev' ? 'https://api.typesafe.ai/v1/systemone' : null);
    if (!text(endpoint, 2048)) throw new Error('endpoint');
    const url = new URL(endpoint), loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if (url.username || url.password || url.search || url.hash || !(url.protocol === 'https:' || url.protocol === 'http:' && loopback) || !url.pathname.endsWith('/v1/systemone') || config.provider === 'jev' && url.href !== 'https://api.typesafe.ai/v1/systemone') throw new Error('endpoint');
    return { ...config, label: config.label ?? config.id, ...(config.endpoint === undefined ? {} : { endpoint: url.href }) };
}
function configuration(raw) {
    const checked = cloneJsonValue(raw); if (!checked.ok) throw new Error('registry');
    const value = checked.data.value;
    if (!plain(value) || value.schema !== 1 || Object.keys(value).some(key => !['schema', 'connections'].includes(key)) || !plain(value.connections) || Object.keys(value.connections).length > 128) throw new Error('registry');
    const connections = {};
    for (const [key, item] of Object.entries(value.connections)) { const saved = connection(item, true); if (saved.id !== key) throw new Error('identity'); connections[key] = saved; }
    return { schema: 1, connections };
}
/** Host configuration is separate from portable workflows. Credentials live only in this session. */
export function createFastRegistry(ports) {
    const descriptors = Object.getOwnPropertyDescriptors(ports), methods = {};
    for (const key of ['getUserId', 'getConfiguration', 'setConfiguration', 'save', 'fetch']) {
        const property = descriptors[key]; if (property && (!Object.hasOwn(property, 'value') || typeof property.value !== 'function')) throw new Error('Fast registry requires trusted own host methods.');
        methods[key] = property?.value;
    }
    if (['getUserId', 'getConfiguration', 'setConfiguration'].some(key => typeof methods[key] !== 'function')) throw new Error('Fast registry requires trusted scope and configuration methods.');
    const transport = methods.fetch ?? globalThis.fetch; const boot = globalThis.crypto.randomUUID(), secrets = new Map(); let counter = 0, stamp, owner, saved, closed = false;
    const bump = () => { if (++counter > Number.MAX_SAFE_INTEGER) { closed = true; secrets.clear(); throw new Error('epoch exhausted'); } };
    const refresh = () => {
        if (closed) throw new Error('closed');
        let userId;
        try { userId = methods.getUserId(); if (!text(userId, 128)) throw new Error('scope'); }
        catch { bump(); secrets.clear(); owner = undefined; stamp = undefined; saved = null; throw new Error('scope'); }
        // Scope changes revoke immediately, including when the following configuration read fails.
        if (owner !== userId) { bump(); secrets.clear(); owner = userId; stamp = undefined; saved = null; }
        let next;
        try { next = configuration(methods.getConfiguration()); }
        catch { if (stamp !== null) bump(); stamp = null; saved = null; throw new Error('registry'); }
        const signature = canonical([userId, next]);
        if (stamp !== signature) { bump(); stamp = signature; saved = next; }
        return saved;
    };
    const install = next => { const checked=configuration(next); bump(); methods.setConfiguration(freeze(checked)); stamp = undefined; refresh(); };
    const revision = () => { refresh(); return boot + ':' + counter; };
    const inspect = () => {
        try { refresh(); return good({ userId: owner, credentialStorage: 'session', connections: Object.values(saved.connections).map(item => ({ ...item, credentialReady: !!item.credentialRef && secrets.has(item.credentialRef) })) }); }
        catch { return fail('FAST_REGISTRY_UNAVAILABLE', 'Fast connection settings are unavailable for the active user.'); }
    };
    const host = Object.freeze({
        getRegistryRevision: revision,
        getConnection: id => { refresh(); const item = saved.connections[id]; if (!Object.hasOwn(saved.connections, id) || !item) return null; const { label, ...config } = item; return freeze(config); },
        resolveSecret: reference => { refresh(); return secrets.get(reference) ?? null; },
        fetch: (...args) => {
            const expected = counter;
            try { refresh(); } catch { return Promise.resolve({ ok: false, status: 409 }); }
            // The typed transport checks this changed epoch before interpreting the local blocked response.
            if (counter !== expected || closed) return Promise.resolve({ ok: false, status: 409 });
            if (typeof transport !== 'function') throw new Error('Transport unavailable');
            return transport(...args);
        },
    });
    return Object.freeze({ host, snapshot: inspect,
        upsert(raw) {
            try { refresh(); const item = connection(raw), previous = Object.hasOwn(saved.connections,item.id)?saved.connections[item.id]:undefined; if (!previous && Object.keys(saved.connections).length >= 128) return fail('FAST_REGISTRY_LIMIT', 'At most 128 Fast connections are supported.');
                const credentialRef = previous?.credentialRef ?? 'session:' + globalThis.crypto.randomUUID();
                const next = { ...item, revision: globalThis.crypto.randomUUID(), ...(item.provider === 'jev' || previous?.credentialRef ? { credentialRef } : {}) };
                install({ schema: 1, connections: { ...saved.connections, [item.id]: next } }); return inspect();
            } catch { return fail('INVALID_FAST_CONNECTION', 'Use a named typed model with HTTPS or a loopback /v1/systemone endpoint and no inline credentials.'); }
        },
        remove(id) {
            try { refresh(); if (!text(id, 128) || !Object.hasOwn(saved.connections, id)) return fail('CONNECTION_MISSING', 'Select an existing Fast connection.');
                const previous = saved.connections[id], next = { ...saved.connections }; delete next[id]; if (previous.credentialRef) secrets.delete(previous.credentialRef); install({ schema: 1, connections: next }); return inspect();
            } catch { return fail('FAST_REGISTRY_UNAVAILABLE', 'Fast connection settings are unavailable.'); }
        },
        setCredential(id, secret) {
            try { refresh(); if (!text(id, 128) || !Object.hasOwn(saved.connections, id)) return fail('CONNECTION_MISSING', 'Select an existing Fast connection.');
                if (!text(secret, 8192)) return fail('INVALID_CREDENTIAL', 'Enter a nonempty session API key without line breaks.');
                const item = saved.connections[id], credentialRef = item.credentialRef ?? 'session:' + globalThis.crypto.randomUUID(); bump(); secrets.set(credentialRef, secret);
                if (!item.credentialRef) install({ schema: 1, connections: { ...saved.connections, [id]: { ...item, credentialRef, revision: globalThis.crypto.randomUUID() } } });
                return good({ connectionId: id, credentialReady: true, credentialStorage: 'session' });
            } catch { return fail('FAST_REGISTRY_UNAVAILABLE', 'Fast connection settings are unavailable.'); }
        },
        clearCredential(id) {
            try { refresh(); if (!text(id, 128) || !Object.hasOwn(saved.connections, id)) return fail('CONNECTION_MISSING', 'Select an existing Fast connection.'); bump(); const item = saved.connections[id]; if (item.credentialRef) secrets.delete(item.credentialRef); return good({ connectionId: id, credentialReady: false }); }
            catch { return fail('FAST_REGISTRY_UNAVAILABLE', 'Fast connection settings are unavailable.'); }
        },
        async save() {
            try { const before = revision(); if (typeof methods.save !== 'function') return fail('CONFIG_SAVE_UNAVAILABLE', 'A host settings save method is required.'); const result = await methods.save(); if (revision() !== before) return fail('BINDING_CHANGED', 'Fast settings changed during the save.'); return good({ appliedLocally: true, saveAttempted: true, acknowledged: result === true || (plain(result) && Object.getOwnPropertyDescriptor(result, 'ok')?.value === true) }); }
            catch { return fail('CONFIG_SAVE_FAILED', 'Fast settings remain local; the host save could not be verified.'); }
        },
        dispose() { if (!closed) { bump(); closed = true; secrets.clear(); saved = null; stamp = null; owner = null; } },
    });
}