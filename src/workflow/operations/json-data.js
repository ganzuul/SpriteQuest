// Called only with validated clones; stringify primitives without object/array hooks.
function encodeJson(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) {
        let text = '[';
        for (let i = 0; i < value.length; i++) text += `${i ? ',' : ''}${encodeJson(value[i])}`;
        return `${text}]`;
    }
    let text = '{';
    const keys = Object.keys(value);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        text += `${i ? ',' : ''}${JSON.stringify(key)}:${encodeJson(value[key])}`;
    }
    return `${text}}`;
}

export function cloneJsonValue(value) {
    const ancestors = new Set();
    let visited = 0;
    const clone = (input, depth = 0) => {
        if (depth > 32 || ++visited > 10000) throw new Error('JSON structure exceeds limits.');
        if (input === null || typeof input === 'string' || typeof input === 'boolean') return input;
        if (typeof input === 'number' && Number.isFinite(input)) return input;
        if (typeof input !== 'object' || input === null) throw new Error('Unsupported JSON value.');
        const array = Array.isArray(input);
        const prototype = Object.getPrototypeOf(input);
        if (array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) throw new Error('JSON objects must be plain.');
        if (ancestors.has(input)) throw new Error('JSON values cannot contain cycles.');
        ancestors.add(input);
        const output = array ? [] : {};
        const keys = Reflect.ownKeys(input);
        if (array && keys.length !== input.length + 1) throw new Error('JSON arrays must be dense.');
        for (const key of keys) {
            if (array && key === 'length') continue;
            const property = Object.getOwnPropertyDescriptor(input, key);
            if (typeof key !== 'string' || !property || !Object.hasOwn(property,'value') || !property.enumerable) throw new Error('JSON requires enumerable own data properties.');
            if (array && (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= input.length)) throw new Error('JSON arrays cannot contain named properties.');
            Object.defineProperty(output, key, { value: clone(property.value, depth + 1), enumerable: true, configurable: true, writable: true });
        }
        ancestors.delete(input);
        return output;
    };
    try {
        const output = clone(value);
        if (new TextEncoder().encode(encodeJson(output)).byteLength > 262144) throw new Error('JSON byte limit exceeded.');
        return { ok: true, data: { value: output } };
    }
    catch { return { ok: false, error: { code: 'INVALID_JSON_VALUE', message: 'Input must contain only plain JSON data.' } }; }
}

export function stringifyJsonValue(value) {
    try {
        const checked = cloneJsonValue(value);
        if (!checked.ok) return checked;
        return { ok: true, data: { text: encodeJson(checked.data.value) } };
    } catch { return { ok: false, error: { code: 'INVALID_JSON_VALUE', message: 'Input must contain only plain JSON data.' } }; }
}

export function readJsonPath(value, path) {
    const checkedPath = cloneJsonValue(path);
    if (!checkedPath.ok || !Array.isArray(checkedPath.data.value) || checkedPath.data.value.some(key => typeof key !== 'string' && !(Number.isSafeInteger(key) && key >= 0))) {
        return { ok: false, error: { code: 'INVALID_JSON_PATH', message: 'Path must be an array of string keys or nonnegative integer indices.' } };
    }
    const checked = cloneJsonValue(value);
    if (!checked.ok) return checked;
    let current = checked.data.value;
    for (const key of checkedPath.data.value) {
        if (!current || typeof current !== 'object') return { ok: true, data: { found: false } };
        if (Array.isArray(current) && !/^(0|[1-9]\d*)$/.test(String(key))) return { ok: true, data: { found: false } };
        const property = Object.getOwnPropertyDescriptor(current, key);
        if (!property?.enumerable || !Object.hasOwn(property,'value')) return { ok: true, data: { found: false } };
        current = property.value;
    }
    return { ok: true, data: { found: true, value: current } };
}
