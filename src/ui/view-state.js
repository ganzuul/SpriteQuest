/** Presentation-only editor views. All navigation DTOs are prepared by the caller;
 * this leaf never resolves definitions, prepares a host, or owns a workflow run.
 *
 * Instance identity: {kind:'instance', workflowId, instancePath:string[]}.
 * Library identity: {kind:'library', workflowId, definitionRef:{id,version,semanticHash}}.
 * Navigation entries: {identity, label, readOnly?}; omitted child permission is read-only.
 * Node presentation contains aliases, compact state and graph-local positions only.
 */
const MAX_BYTES = 262144;
const MAX_VIEWS = 1001;
const fail = (code, message) => ({ ok: false, error: { code, message } });
const textId = value => typeof value === 'string' && value.length > 0;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const ownKeys = (value, allowed) => Object.keys(value).every(key => allowed.includes(key));
const bytes = value => new TextEncoder().encode(JSON.stringify(value)).length;
const freeze = value => {
    if (value && typeof value === 'object') {
        if (Object.isFrozen(value)) return value;
        for (const child of Object.values(value)) freeze(child);
        Object.freeze(value);
    }
    return value;
};

// Inspect descriptors before reading values: presentation must stay bounded plain JSON.
function plain(value) {
    let count = 0, characters = 0;
    const parents = new Set();
    function visit(item, depth) {
        // Every JSON value consumes at least one encoded byte. A lower visit cap
        // would reject a reload of valid states already admitted by the byte limit.
        if (++count > MAX_BYTES || depth > 20) throw new Error('limit');
        if (item === null || typeof item === 'boolean') return item;
        if (typeof item === 'number' && Number.isFinite(item)) return item;
        if (typeof item === 'string') {
            characters += item.length;
            if (characters > MAX_BYTES) throw new Error('limit');
            return item;
        }
        if (!item || typeof item !== 'object' || parents.has(item)) throw new Error('data');
        const array = Array.isArray(item), proto = Object.getPrototypeOf(item);
        if (array ? proto !== Array.prototype : proto !== Object.prototype && proto !== null) throw new Error('prototype');
        const descriptors = Object.getOwnPropertyDescriptors(item), keys = Reflect.ownKeys(descriptors);
        if (keys.some(key => typeof key !== 'string') || keys.some(key => ['__proto__', 'prototype', 'constructor'].includes(key))) throw new Error('key');
        if (array && (keys.length !== item.length + 1 || keys.some(key => key !== 'length' && !/^(0|[1-9]\d*)$/.test(key)))) throw new Error('array');
        const copy = array ? [] : {};
        parents.add(item);
        for (const key of keys) {
            if (array && key === 'length') continue;
            const descriptor = descriptors[key];
            if (!descriptor.enumerable || !('value' in descriptor)) throw new Error('property');
            characters += key.length;
            if (characters > MAX_BYTES) throw new Error('limit');
            copy[key] = visit(descriptor.value, depth + 1);
        }
        parents.delete(item);
        return copy;
    }
    try {
        const copy = visit(value, 0);
        return bytes(copy) <= MAX_BYTES ? copy : null;
    } catch { return null; }
}

function identityFrom(value) {
    if (!record(value) || !textId(value.workflowId)) return null;
    if (value.kind === 'root' && ownKeys(value, ['kind', 'workflowId'])) return { kind: 'root', workflowId: value.workflowId };
    if (value.kind === 'instance' && ownKeys(value, ['kind', 'workflowId', 'instancePath']) && Array.isArray(value.instancePath) && value.instancePath.length > 0 && value.instancePath.length <= 8 && value.instancePath.every(textId)) return { kind: 'instance', workflowId: value.workflowId, instancePath: [...value.instancePath] };
    const ref = value.definitionRef;
    if (value.kind === 'library' && ownKeys(value, ['kind', 'workflowId', 'definitionRef']) && record(ref) && ownKeys(ref, ['id', 'version', 'semanticHash']) && textId(ref.id) && Number.isSafeInteger(ref.version) && ref.version > 0 && textId(ref.semanticHash)) return { kind: 'library', workflowId: value.workflowId, definitionRef: { ...ref } };
    return null;
}

const identityKey = identity => identity.kind === 'root' ? JSON.stringify(['root', identity.workflowId]) : identity.kind === 'instance' ? JSON.stringify(['instance', identity.workflowId, identity.instancePath]) : JSON.stringify(['library', identity.workflowId, identity.definitionRef.id, identity.definitionRef.version, identity.definitionRef.semanticHash]);

/** Exact structural tuple; invalid identities have no key. */
export function viewIdentityKey(value) {
    const copy = plain(value), identity = identityFrom(copy);
    return identity ? identityKey(identity) : null;
}

function preparedNavigation(workflowId, value) {
    const entries = plain(value);
    if (!Array.isArray(entries) || entries.length > 2000) return null;
    const root = { kind: 'root', workflowId }, rootKey = identityKey(root);
    const result = new Map([[rootKey, { identity: root, label: 'Graph 1', readOnly: false }]]);
    for (const entry of entries) {
        const identity = identityFrom(entry?.identity);
        if (!record(entry) || !ownKeys(entry, ['identity', 'label', 'readOnly']) || !identity || identity.workflowId !== workflowId || !textId(entry.label) || entry.label.length > 256 || (entry.readOnly !== undefined && typeof entry.readOnly !== 'boolean') || (identity.kind === 'library' && entry.readOnly === false)) return null;
        const key = identityKey(identity);
        if (result.has(key)) return null;
        result.set(key, { identity, label: entry.label, readOnly: entry.readOnly !== false });
    }
    for (const [key, entry] of result) {
        const path = entry.identity.instancePath;
        const ancestors = entry.identity.kind === 'root' ? [] : [rootKey];
        if (path) for (let length = 1; length < path.length; length++) ancestors.push(identityKey({ kind: 'instance', workflowId, instancePath: path.slice(0, length) }));
        if (ancestors.some(ancestor => !result.has(ancestor))) return null;
        entry.parentKey = ancestors.at(-1) ?? null;
        entry.breadcrumbs = entry.identity.kind === 'root' ? [] : [...ancestors, key].map(crumbKey => {
            const crumb = result.get(crumbKey);
            return { key: crumbKey, identity: plain(crumb.identity), label: crumb.label };
        });
    }
    for (const entry of result.values()) freeze(entry);
    return result;
}

const emptyPresentation = () => ({ camera: { x: 0, y: 0, zoom: 1 }, selection: { primary: null, multi: [] }, inspector: { item: null, section: '', open: true }, nodePresentation: {} });
const itemValid = item => item === null || (record(item) && ownKeys(item, ['kind', 'id']) && ['node', 'wire', 'group'].includes(item.kind) && textId(item.id));

function presentationPatch(value) {
    const patch = plain(value);
    if (!record(patch) || !ownKeys(patch, ['camera', 'selection', 'inspector', 'nodePresentation', 'portalPresentation'])) return null;
    if (patch.camera !== undefined) {
        const camera = patch.camera;
        if (!record(camera) || !ownKeys(camera, ['x', 'y', 'zoom']) || ![camera.x, camera.y, camera.zoom].every(Number.isFinite) || camera.zoom <= 0) return null;
        camera.zoom = Math.max(0.25, Math.min(2.5, camera.zoom));
    }
    if (patch.selection !== undefined && (!record(patch.selection) || !ownKeys(patch.selection, ['primary', 'multi']) || !itemValid(patch.selection.primary) || !Array.isArray(patch.selection.multi) || patch.selection.multi.length > 1000 || !patch.selection.multi.every(textId))) return null;
    if (patch.inspector !== undefined && (!record(patch.inspector) || !ownKeys(patch.inspector, ['item', 'section', 'open']) || !itemValid(patch.inspector.item) || typeof patch.inspector.section !== 'string' || patch.inspector.section.length > 256 || typeof patch.inspector.open !== 'boolean')) return null;
    if (patch.nodePresentation !== undefined) {
        if (!record(patch.nodePresentation) || Object.keys(patch.nodePresentation).length > 1000) return null;
        for (const [id, node] of Object.entries(patch.nodePresentation)) {
            if (!textId(id) || !record(node) || !ownKeys(node, ['alias', 'compact', 'x', 'y']) || (node.alias !== undefined && (typeof node.alias !== 'string' || node.alias.length > 80)) || (node.compact !== undefined && typeof node.compact !== 'boolean') || (node.x !== undefined && !Number.isFinite(node.x)) || (node.y !== undefined && !Number.isFinite(node.y))) return null;
        }
    }
    if (patch.portalPresentation !== undefined) {
        if (!record(patch.portalPresentation)) return null;
        for (const [id, alias] of Object.entries(patch.portalPresentation)) {
            if (!textId(id) || !record(alias) || !ownKeys(alias,['identity','definitionRef','source','label']) || !identityFrom(alias.identity) || typeof alias.label !== 'string' || alias.label.length > 80 || !record(alias.source) || !ownKeys(alias.source,['nodeId','portId']) || !textId(alias.source.nodeId) || !textId(alias.source.portId)) return null;
            if (alias.definitionRef !== undefined && (!identityFrom({kind:'library',workflowId:alias.identity.workflowId,definitionRef:alias.definitionRef}) || alias.identity.kind==='root' || alias.identity.kind==='library'&&identityKey({kind:'library',workflowId:alias.identity.workflowId,definitionRef:alias.definitionRef})!==identityKey(alias.identity))) return null;
        }
    }
    return patch;
}

function creationOptions(value) {
    try {
        if (!record(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return null;
        const descriptors = Object.getOwnPropertyDescriptors(value), keys = Reflect.ownKeys(descriptors);
        if (keys.some(key => !['workflowId', 'navigation', 'persisted', 'legacyView'].includes(key))) return null;
        const result = {};
        for (const key of keys) {
            if (!descriptors[key].enumerable || !('value' in descriptors[key])) return null;
            result[key] = descriptors[key].value;
        }
        return result;
    } catch { return null; }
}

function legacyCamera(value) {
    const camera = { x: 0, y: 0, zoom: 1 };
    try {
        if (!record(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return camera;
        const descriptors = Object.getOwnPropertyDescriptors(value);
        for (const key of ['x', 'y', 'zoom']) {
            const number = descriptors[key]?.value;
            if (Number.isFinite(number) && (key !== 'zoom' || number > 0)) camera[key] = key === 'zoom' ? Math.max(0.25, Math.min(2.5, number)) : number;
        }
    } catch { /* Corrupt compatibility data uses the finite defaults. */ }
    return camera;
}

function nearestKey(identity, navigation, rootKey) {
    if (identity.kind === 'instance') {
        for (let length = identity.instancePath.length; length > 0; length--) {
            const key = identityKey({ ...identity, instancePath: identity.instancePath.slice(0, length) });
            if (navigation.has(key)) return key;
        }
    }
    return rootKey;
}

function restoreViews(value, workflowId, navigation, rootKey) {
    const saved = plain(value);
    if (!record(saved) || !ownKeys(saved, ['version', 'workflowId', 'activeKey', 'views']) || saved.version !== 1 || saved.workflowId !== workflowId || typeof saved.activeKey !== 'string' || !Array.isArray(saved.views) || !saved.views.length || saved.views.length > MAX_VIEWS) return null;
    const all = new Map();
    for (const entry of saved.views) {
        if (!record(entry) || ![6,7].includes(Object.keys(entry).length) || !ownKeys(entry, ['identity', 'open', 'camera', 'selection', 'inspector', 'nodePresentation', 'portalPresentation']) || typeof entry.open !== 'boolean') return null;
        const identity = identityFrom(entry.identity);
        const presentation = presentationPatch({ camera: entry.camera, selection: entry.selection, inspector: entry.inspector, nodePresentation: entry.nodePresentation, ...(entry.portalPresentation !== undefined ? {portalPresentation:entry.portalPresentation} : {}) });
        if (!identity || identity.workflowId !== workflowId || !presentation || Object.values(presentation.portalPresentation ?? {}).some(alias => identityKey(alias.identity) !== identityKey(identity))) return null;
        const key = identityKey(identity);
        if (all.has(key)) return null;
        all.set(key, { identity, open: entry.open, ...presentation });
    }
    if (!all.get(rootKey)?.open || !all.get(saved.activeKey)?.open) return null;
    const retained = new Map([[rootKey, all.get(rootKey)], ...[...all].filter(([key]) => key !== rootKey && navigation.has(key))]);
    const activeKey = navigation.has(saved.activeKey) ? saved.activeKey : nearestKey(all.get(saved.activeKey).identity, navigation, rootKey);
    if (!retained.has(activeKey)) retained.set(activeKey, { identity: plain(navigation.get(activeKey).identity), open: true, ...emptyPresentation() });
    retained.get(activeKey).open = true;
    return { views: retained, activeKey };
}

const VIEW_FIELDS = ['identity', 'open', 'camera', 'selection', 'inspector', 'nodePresentation'];
const ENTRY_OVERHEAD = bytes(Object.fromEntries(VIEW_FIELDS.map(key => [key, null]))) - VIEW_FIELDS.length * 4;
function encodedEntry(view, previous, cached) {
    const fields = {};
    const keys = view.portalPresentation === undefined ? VIEW_FIELDS : [...VIEW_FIELDS,'portalPresentation'];
    let total = keys.length === VIEW_FIELDS.length ? ENTRY_OVERHEAD : bytes(Object.fromEntries(keys.map(key => [key,null]))) - keys.length * 4;
    for (const key of keys) {
        fields[key] = cached && Object.hasOwn(cached.fields,key) && previous[key] === view[key] ? cached.fields[key] : bytes(view[key]);
        total += fields[key];
    }
    return { fields, total };
}

/** Invalid creation returns null. Actions return plain Results and never mutate on failure. */
export function createViewState(options) {
    const copy = creationOptions(options);
    if (!record(copy) || !textId(copy.workflowId) || copy.workflowId.length > MAX_BYTES) return null;
    const workflowId = copy.workflowId, rootIdentity = { kind: 'root', workflowId }, rootKey = identityKey(rootIdentity);
    let navigation = preparedNavigation(workflowId, copy.navigation ?? []);
    if (!navigation) return null;
    let views = new Map([[rootKey, { identity: rootIdentity, open: true, ...emptyPresentation(), camera: legacyCamera(copy.legacyView) }]]);
    let activeKey = rootKey, epoch = 0;
    if (copy.persisted !== undefined) {
        const restored = restoreViews(copy.persisted, workflowId, navigation, rootKey);
        if (!restored) return null;
        views = restored.views; activeKey = restored.activeKey;
    }
    views = new Map([...views].map(([key, view]) => [key, freeze(view)]));
    // Cache encoded entry sizes: a camera tick need not serialize every retained view.
    let sizes = new Map([...views].map(([key, view]) => [key, encodedEntry(view)]));
    let entryBytes = [...sizes.values()].reduce((sum, size) => sum + size.total, 0);
    const fits = (count, total, key) => count <= MAX_VIEWS && bytes({ version: 1, workflowId, activeKey: key, views: [] }) + total + Math.max(0, count - 1) <= MAX_BYTES;
    if (!fits(views.size, entryBytes, activeKey)) return null;
    const publishView = (key, view, nextActive = activeKey) => {
        const size = encodedEntry(view, views.get(key), sizes.get(key)), count = views.size + (views.has(key) ? 0 : 1), total = entryBytes - (sizes.get(key)?.total ?? 0) + size.total;
        if (!fits(count, total, nextActive)) return false;
        views.set(key, freeze(view)); sizes.set(key, size); entryBytes = total;
        return true;
    };
    const limit = () => fail('VIEW_LIMIT', 'Retained graph views exceed the presentation-data limit.');
    const contexts = new WeakMap();
    const activate = key => {
        if (key !== activeKey) { activeKey = key; epoch++; }
    };
    const keyFor = value => typeof value === 'string' ? value : viewIdentityKey(value);
    const projectView = (key, view) => freeze({ key, ...view, ...navigation.get(key) });
    const project = () => freeze({ workflowId, viewEpoch: epoch, active: projectView(activeKey, views.get(activeKey)), tabs: [...views].filter(([, view]) => view.open).map(([key, view]) => projectView(key, view)), closedViews: [...views].filter(([, view]) => !view.open).map(([key, view]) => projectView(key, view)) });
    const success = () => ({ ok: true, data: projectView(activeKey, views.get(activeKey)) });
    const focusView = value => {
        const key = keyFor(value), view = views.get(key);
        if (!view?.open || !navigation.has(key)) return fail('VIEW_UNAVAILABLE', 'The graph view is unavailable.');
        if (!fits(views.size, entryBytes, key)) return limit();
        activate(key);
        return success();
    };
    const open = identity => {
        const key = viewIdentityKey(identity);
        if (!key || !navigation.has(key)) return fail('VIEW_UNAVAILABLE', 'The graph view is unavailable.');
        const view = views.has(key) ? { ...views.get(key), open: true } : { identity: plain(identity), open: true, ...emptyPresentation() };
        if (!publishView(key, view, key)) return limit();
        return focusView(key);
    };
    return Object.freeze({
        project,
        serialize() { return { ok: true, data: freeze({ version: 1, workflowId, activeKey, views: [...views.values()] }) }; },
        openInstance: path => open({ kind: 'instance', workflowId, instancePath: path }),
        openLibrary: definitionRef => open({ kind: 'library', workflowId, definitionRef }),
        focusView,
        closeView(value = activeKey) {
            const key = keyFor(value), view = views.get(key);
            if (key === rootKey) return fail('VIEW_PERMANENT', 'Graph 1 is permanent.');
            if (!view?.open) return fail('VIEW_UNAVAILABLE', 'The graph view is unavailable.');
            const nextActive = key === activeKey ? rootKey : activeKey;
            if (!publishView(key, { ...view, open: false }, nextActive)) return limit();
            if (key === activeKey) activate(nextActive);
            return success();
        },
        reopenView(value) {
            const key = keyFor(value), view = views.get(key);
            if (!view || !navigation.has(key)) return fail('VIEW_UNAVAILABLE', 'The graph view is unavailable.');
            return open(view.identity);
        },
        revealParent() {
            const parentKey = navigation.get(activeKey).parentKey;
            return parentKey ? open(navigation.get(parentKey).identity) : success();
        },
        replaceNavigation(value) {
            const next = preparedNavigation(workflowId, value);
            if (!next) return fail('VIEW_NAVIGATION', 'Expected complete prepared graph navigation.');
            const replacementKey = next.has(activeKey) ? activeKey : nearestKey(views.get(activeKey).identity, next, rootKey);
            const previousPermission = navigation.get(activeKey).readOnly;
            const retained = new Map([...views].filter(([key]) => next.has(key)));
            if (!retained.has(replacementKey)) retained.set(replacementKey, { identity: plain(next.get(replacementKey).identity), open: true, ...emptyPresentation() });
            else retained.set(replacementKey, { ...retained.get(replacementKey), open: true });
            const nextSizes = new Map([...retained].map(([key, view]) => [key, encodedEntry(view, views.get(key), sizes.get(key))]));
            const nextBytes = [...nextSizes.values()].reduce((sum, size) => sum + size.total, 0);
            if (!fits(retained.size, nextBytes, replacementKey)) return limit();
            views = new Map([...retained].map(([key, view]) => [key, freeze(view)])); sizes = nextSizes; entryBytes = nextBytes;
            navigation = next;
            if (replacementKey !== activeKey) activate(replacementKey);
            else if (previousPermission !== navigation.get(activeKey).readOnly) epoch++;
            return success();
        },
        captureContext() {
            const token = freeze({ workflowId, key: activeKey, epoch, identity: plain(views.get(activeKey).identity) });
            contexts.set(token, { key: activeKey, epoch });
            return token;
        },
        isContextCurrent(token) {
            const context = token !== null && typeof token === 'object' && contexts.get(token);
            return !!context && context.key === activeKey && context.epoch === epoch;
        },
        invalidateContext() { epoch++; return success(); },
        updateView(value, target = activeKey) {
            const key = keyFor(target), view = views.get(key), patch = presentationPatch(value);
            if (!view || !patch || Object.values(patch.portalPresentation ?? {}).some(alias => identityKey(alias.identity) !== identityKey(view.identity))) return fail('VIEW_DATA', 'Expected bounded view presentation data for this exact graph view.');
            if (!publishView(key, { ...view, ...patch })) return limit();
            return success();
        },
    });
}
