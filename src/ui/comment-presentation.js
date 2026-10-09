import { cloneDefinitionData } from '../workflow/definitions.js?v=0.20.0';
import { safeId } from '../workflow/composition-edit.js?v=0.20.0';
import { viewIdentityKey } from './view-state.js?v=0.20.0';

const MAX_BYTES = 262144;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const only = (value, fields) => record(value) && Object.keys(value).every(key => fields.includes(key));
const coordinatesFor = node => Object.fromEntries(['x', 'y'].filter(axis => Object.hasOwn(node, axis)).map(axis => [axis, node[axis]]));
function plain(value) {
    const copied = cloneDefinitionData(value);
    return copied.ok && new TextEncoder().encode(JSON.stringify(copied.data)).length <= MAX_BYTES ? copied.data : null;
}
function validPresentation(value) {
    return record(value) && Object.keys(value).length <= 1000 && Object.entries(value).every(([id, node]) => safeId(id) && only(node, ['alias', 'compact', 'x', 'y'])
        && (!Object.hasOwn(node, 'alias') || typeof node.alias === 'string' && node.alias.length <= 80)
        && (!Object.hasOwn(node, 'compact') || typeof node.compact === 'boolean')
        && ['x', 'y'].every(axis => !Object.hasOwn(node, axis) || Number.isFinite(node[axis])));
}
function validViewKey(identity) {
    const key = viewIdentityKey(identity);
    return key && safeId(identity.workflowId)
        && (identity.kind !== 'instance' || identity.instancePath.every(safeId))
        && (identity.kind !== 'library' || safeId(identity.definitionRef.id)) ? key : null;
}

/** Capture {viewKey,identity,coordinates:{[id]:{x?,y?}}} for view.key/identity.
 * nodeIds is a bounded array of ordinary IDs selected by the caller; duplicate
 * IDs collapse. Empty coordinate records capture absence of both axes. No graph,
 * frame, or history membership is inferred here. Invalid/unsafe DTOs return null.
 */
export function captureCommentPresentation(view, nodeIds) {
    const source = plain(view), ids = plain(nodeIds);
    if (!record(source) || !Array.isArray(ids) || ids.length > 1000 || !ids.every(safeId) || !validPresentation(source.nodePresentation)) return null;
    const key = validViewKey(source.identity);
    if (!key || source.key !== key) return null;
    const effect = { viewKey: key, identity: structuredClone(source.identity), coordinates: Object.fromEntries([...new Set(ids)].map(id => [id, coordinatesFor(Object.hasOwn(source.nodePresentation, id) ? source.nodePresentation[id] : {})])) };
    return plain(effect) ? effect : null;
}

/** Derive a detached nodePresentation table: undo restores captured x/y presence
 * and values, redo removes both axes. Preserve current alias/compact and unrelated
 * records; remove emptied affected records. The caller targets effect.viewKey and
 * owns history/session checks. Invalid/unsafe/excess-size DTOs return null.
 */
export function applyCommentPresentation(currentNodePresentation, effect, direction) {
    const current = plain(currentNodePresentation), captured = plain(effect);
    const key = record(captured) ? validViewKey(captured.identity) : null;
    if (!['undo', 'redo'].includes(direction) || !validPresentation(current) || !only(captured, ['viewKey', 'identity', 'coordinates'])
        || !record(captured.coordinates) || Object.keys(captured.coordinates).length > 1000
        || !key || captured.viewKey !== key
        || !Object.entries(captured.coordinates).every(([id, node]) => safeId(id) && only(node, ['x', 'y']) && Object.values(node).every(Number.isFinite))) return null;
    const next = structuredClone(current);
    for (const id of Object.keys(captured.coordinates)) {
        const node = Object.hasOwn(next, id) ? next[id] : {};
        delete node.x; delete node.y;
        if (direction === 'undo') Object.assign(node, captured.coordinates[id]);
        if (Object.keys(node).length) next[id] = node;
        else delete next[id];
    }
    return validPresentation(next) && plain(next) ? next : null;
}
