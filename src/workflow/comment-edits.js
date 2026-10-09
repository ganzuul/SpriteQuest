import { cloneDefinitionData, definitionRefKey } from './definitions.js?v=0.20.0';
import { cloneWorkflowDocument } from './document.js?v=0.20.0';
import { graphSemanticSignature } from './ports.js?v=0.20.0';
import { prepareGraphCandidate } from './prepared-graph-edit.js?v=0.20.0';
import { safeId, definitionChain, ownsDefinitionPath } from './composition-edit.js?v=0.20.0';
import { isCommentFrame } from '../canvas/comment-frames.js?v=0.20.0';

const fail = (code, message) => ({ ok: false, error: { code, message } });
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const only = (value, fields) => record(value) && Object.keys(value).every(key => fields.includes(key));
const reference = definition => ({ id: definition.id, version: definition.version, semanticHash: definition.semanticHash });
const exactRef = (expected, actual) => only(expected, ['id', 'version', 'semanticHash']) && definitionRefKey(expected) === definitionRefKey(actual);
const frameFields = ['id', 'type', 'commentFrame', 'moveContents', 'title', 'content', 'color', 'x', 'y', 'w', 'h'];
const patchFields = ['title', 'content', 'color', 'moveContents', 'x', 'y', 'w', 'h'];
const commandFields = { create: ['frame'], update: ['nodeId', 'patch'], delete: ['nodeId'], layout: ['positions'] };
const validPatch = patch => only(patch, patchFields) && Object.entries(patch).every(([key, value]) =>
    ['title', 'content', 'color'].includes(key) ? typeof value === 'string'
        : key === 'moveContents' ? typeof value === 'boolean'
            : Number.isFinite(value) && (!['w', 'h'].includes(key) || value > 0));

/**
 * Prepare a detached, presentation-only candidate for a saved native root.
 * Commands require explicit viewPath; a nested path additionally requires its
 * exact current expectedRef and private ownership of every ancestor definition.
 * Supported commands:
 * - create: {frame}, a fresh authored note/commentFrame and finite rectangle;
 * - update: {nodeId, patch}, authored text/color/toggle/rectangle fields only;
 * - delete: {nodeId}, removes only the frame;
 * - layout: {positions:[{id,x,y,w?,h?}]}, x/y for existing nodes, w/h for frames.
 * Return the standard prepareGraphCandidate result plus viewPath/expectedRef.
 * The caller captures/commits qualified edit context; this seam performs no I/O.
 */
export function prepareCommentEdit(root, input) {
    const admitted = cloneDefinitionData(input); if (!admitted.ok) return admitted;
    const command = admitted.data;
    if (!record(command) || typeof command.kind !== 'string' || !Object.hasOwn(commandFields, command.kind) || !only(command, ['kind', 'viewPath', 'expectedRef', ...commandFields[command.kind]])) return fail('INVALID_COMMAND', 'Expected a comment command.');
    if (!Array.isArray(command.viewPath) || command.viewPath.length > 8 || !command.viewPath.every(safeId)) return fail('INVALID_INSTANCE', 'Expected an explicit bounded containing graph path.');
    const copied = cloneWorkflowDocument(root); if (!copied.ok) return copied;
    const candidate = copied.data;
    if (!safeId(candidate.id)) return fail('INVALID_CONTEXT', 'Comment edits require a saved root document ID.');
    const path = [...command.viewPath], chain = path.length ? definitionChain(root, path) : [];
    if (!chain) return fail('INVALID_INSTANCE', 'The containing graph path does not exist.');
    const definition = chain.at(-1)?.definition;
    if (path.length ? !exactRef(command.expectedRef, reference(definition)) : command.expectedRef !== undefined) return fail('STALE_DEFINITION', 'Supply the current exact containing definition pin.');
    if (path.length && !ownsDefinitionPath(root, path)) return fail('READ_ONLY_DEFINITION', 'Make a local copy before editing this definition.');
    // Authored annotations/layout have no semantic identity. Keep the same bundled
    // snapshot key and pins; do not use the version-bumping generic definition seam.
    const scope = definition ? candidate.definitions[definitionRefKey(definition)].body : candidate;
    if (command.kind === 'create') {
        const frame = command.frame;
        if (!only(frame, frameFields) || !isCommentFrame(frame) || !safeId(frame.id)
            || !validPatch(Object.fromEntries(Object.entries(frame).filter(([key]) => patchFields.includes(key))))
            || !['x', 'y', 'w', 'h'].every(key => Object.hasOwn(frame, key)) || Object.hasOwn(scope.nodes, frame.id)) return fail('INVALID_COMMENT', 'Expected a fresh authored comment frame with a finite rectangle.');
        scope.nodes[frame.id] = structuredClone(frame);
    } else if (command.kind === 'layout') {
        if (!Array.isArray(command.positions) || command.positions.length > 1000) return fail('INVALID_LAYOUT', 'Expected a bounded node layout batch.');
        const seen = new Set();
        for (const position of command.positions) {
            if (!only(position, ['id', 'x', 'y', 'w', 'h']) || !safeId(position.id) || !Object.hasOwn(scope.nodes, position.id) || seen.has(position.id)
                || !Number.isFinite(position.x) || !Number.isFinite(position.y)) return fail('INVALID_LAYOUT', 'Expected unique existing nodes and finite positions.');
            const node = scope.nodes[position.id];
            for (const key of ['w', 'h']) if (Object.hasOwn(position, key) && (!isCommentFrame(node) || !Number.isFinite(position[key]) || position[key] <= 0)) return fail('INVALID_LAYOUT', 'Only comment frames accept positive authored dimensions.');
            seen.add(position.id);
            Object.assign(node, Object.fromEntries(Object.entries(position).filter(([key]) => key !== 'id')));
        }
    } else {
        const node = safeId(command.nodeId) && Object.hasOwn(scope.nodes, command.nodeId) && scope.nodes[command.nodeId];
        if (!isCommentFrame(node)) return fail('INVALID_COMMENT', 'Expected an existing comment frame.');
        if (command.kind === 'delete') delete scope.nodes[command.nodeId];
        else {
            if (!validPatch(command.patch)) return fail('INVALID_COMMENT', 'Expected an authored presentation patch.');
            Object.assign(node, structuredClone(command.patch));
        }
    }
    if (graphSemanticSignature(root) !== graphSemanticSignature(candidate)) return fail('SEMANTIC_COMMENT_EDIT', 'Comment edits must preserve execution identity.');
    const prepared = prepareGraphCandidate(root, candidate);
    return prepared.ok ? { ok: true, data: { ...prepared.data, viewPath: path, ...(definition ? { expectedRef: reference(definition) } : {}) } } : prepared;
}
