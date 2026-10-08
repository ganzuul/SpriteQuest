/** Runtime plain JSON boundary; deliberately does not reject provenance keys such as token. */
/**
 * @typedef {null|boolean|number|string|RuntimeData[]|{[key:string]:RuntimeData}} RuntimeData
 * @typedef {{id:string,role:'system'|'user'|'assistant',text:string} & Record<string,RuntimeData>} ContextMessage
 * @typedef {{kind:'context',messages:ContextMessage[],original?:ContextMessage[],source?:RuntimeData,derived?:boolean} & Record<string,RuntimeData>} RuntimeContext
 */

/** Inspect complete runtime data without reading accessors or applying the portable secret-key denylist.
 * @param {unknown} value
 * @returns {import('../types').Result<unknown>}
 */
export function inspectContextData(value) {
    let entries = 0, characters = 0;
    const active = new Set();
    const visit = (item, depth) => {
        if (++entries > 20000 || depth > 40) return 'limit';
        if (typeof item === 'string') { characters += item.length; return characters > 500000 ? 'limit' : null; }
        if (item === null || typeof item === 'boolean') return null;
        if (typeof item === 'number') return Number.isFinite(item) ? null : 'invalid';
        if (typeof item !== 'object' || active.has(item)) return 'invalid';
        const array = Array.isArray(item), prototype = Object.getPrototypeOf(item);
        if (array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) return 'invalid';
        const properties = Object.getOwnPropertyDescriptors(item), keys = Reflect.ownKeys(properties);
        if (array && keys.length !== properties.length.value + 1) return 'invalid';
        active.add(item);
        for (const key of keys) {
            if (typeof key !== 'string') return 'invalid';
            if (array && key !== 'length' && (!/^(0|[1-9][0-9]*)$/u.test(key) || Number(key) >= properties.length.value)) return 'invalid';
            characters += key.length;
            if (characters > 500000) return 'limit';
            const property = properties[key];
            if (!Object.hasOwn(property, 'value') || ((!array || key !== 'length') && !property.enumerable)) return 'invalid';
            const error = visit(property.value, depth + 1);
            if (error) return error;
        }
        active.delete(item);
        return null;
    };
    try {
        const error = visit(value, 0);
        return error ? { ok: false, error: { code: error === 'limit' ? 'CONTEXT_JOIN_LIMIT' : 'INVALID_CONTEXT', message: error === 'limit' ? 'Runtime data exceeds depth, entry or character limits.' : 'Expected bounded plain JSON data.' } } : { ok: true, data: value };
    } catch {
        return { ok: false, error: { code: 'INVALID_CONTEXT', message: 'Runtime data could not be inspected as plain JSON.' } };
    }
}

/** Parse to an owned frozen Context DTO after validating the complete input, including unused metadata.
 * @param {unknown} value
 * @returns {import('../types').Result<RuntimeContext>}
 */
export function parseRuntimeContext(value) {
    const inspected = inspectContextData(value);
    if (!inspected.ok) return inspected;
    const invalid = () => ({ ok: false, error: { code: 'INVALID_CONTEXT', message: 'Expected Context with unique nonempty IDs, valid roles and exact string text.' } });
    try { value = structuredClone(value); }
    catch { return invalid(); }
    if (!value || Array.isArray(value) || typeof value !== 'object' || !Object.hasOwn(value, 'kind') || value.kind !== 'context' || !Object.hasOwn(value, 'messages')) return invalid();
    const validMessages = items => {
        if (!Array.isArray(items)) return 'invalid';
        if (items.length > 1000) return 'limit';
        const ids = new Set();
        let text = 0;
        for (const item of items) {
            if (!item || Array.isArray(item) || typeof item !== 'object' || !['id', 'role', 'text'].every(key => Object.hasOwn(item, key) && typeof item[key] === 'string')) return 'invalid';
            if (!item.id.trim() || ids.has(item.id) || !['system', 'user', 'assistant'].includes(item.role)) return 'invalid';
            text += item.text.length;
            if (text > 100000) return 'limit';
            ids.add(item.id);
        }
        return null;
    };
    const messageError = validMessages(value.messages) || (Object.hasOwn(value, 'original') ? validMessages(value.original) : null);
    if (messageError === 'invalid') return invalid();
    if (messageError === 'limit') return { ok: false, error: { code: 'CONTEXT_JOIN_LIMIT', message: 'Context exceeds 1,000 messages or 100,000 UTF-16 text units in current or original material.' } };
    return freezeContextData({ ok: true, data: value });
}

/** Canonical identity for already validated JSON; object key order is insignificant. */
export function canonicalContextData(value) {
    if (Object.is(value, -0)) return '-0';
    if (Array.isArray(value)) return `[${value.map(canonicalContextData).join(',')}]`;
    if (value !== null && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalContextData(value[key])}`).join(',')}}`;
    return JSON.stringify(value);
}

/** Freeze only validated/constructed owned data, never caller-owned inputs. */
export function freezeContextData(value) {
    if (value && typeof value === 'object') {
        for (const item of Object.values(value)) freezeContextData(item);
        Object.freeze(value);
    }
    return value;
}
