import assert from 'node:assert/strict';
import { test } from 'node:test';
import { graphDocumentSignature, graphSemanticSignature } from '../src/workflow/ports.js';
import { validateGraphStructure } from '../src/workflow/contracts.js';
import { computeDefinitionIdentity, definitionRefKey } from '../src/workflow/definitions.js';
import { exportWorkflow, parseWorkflow } from '../src/workflow/packages.js';
import { captureGraphEditContext, commitPreparedGraph } from '../src/workflow/transactions.js';
import * as comments from '../src/workflow/comment-edits.js';

const frame = () => ({ id: 'frame', type: 'note', commentFrame: true, moveContents: true, title: 'Comment', content: 'Line one\nLine two', color: '#637d89', x: 0, y: 0, w: 500, h: 400 });
const root = () => ({ id: 'comment-edit-root', schema: 3, runtime: 2, mode: 'native-pre', nodes: {
    source: { id: 'source', type: 'workflow', operation: 'scene-context', x: 20, y: 80 },
    work: { id: 'work', type: 'workflow', operation: 'smart-compactor', x: 300, y: 80 },
}, wires: { edge: { id: 'edge', route: 'wire', from: 'source', fromPort: 'out', to: 'work', toPort: 'in' } }, groups: {}, portals: {}, roles: {}, definitions: {} });
const refFor = definition => ({ id: definition.id, version: definition.version, semanticHash: definition.semanticHash });
const finalize = draft => {
    const identity = computeDefinitionIdentity(draft);
    assert.equal(identity.ok, true, JSON.stringify(identity));
    return { ...structuredClone(identity.data.materializedDefinition), semanticHash: identity.data.semanticHash };
};
const nested = (owned = true) => {
    const leaf = finalize({ id: 'private-leaf', version: 1, name: 'Leaf', interface: [
        { id: 'input', label: 'Input', kind: 'context', direction: 'input', required: true, cardinality: 'one', boundaryNodeId: 'entry' },
        { id: 'output', label: 'Output', kind: 'context', direction: 'output', required: false, cardinality: 'one', boundaryNodeId: 'exit' },
    ], parameters: [], body: { schema: 3, runtime: 2, mode: 'native-pre', nodes: {
        entry: { id: 'entry', type: 'subgraph-input', interfacePortId: 'input', x: 0, y: 80 },
        work: { id: 'work', type: 'workflow', operation: 'smart-compactor', x: 300, y: 80 },
        exit: { id: 'exit', type: 'subgraph-output', interfacePortId: 'output', x: 600, y: 80 },
        frame: frame(),
    }, wires: { a: { id: 'a', route: 'wire', from: 'entry', fromPort: 'out', to: 'work', toPort: 'in' }, b: { id: 'b', route: 'wire', from: 'work', fromPort: 'out', to: 'exit', toPort: 'in' } } } });
    const outerDraft = structuredClone(leaf); outerDraft.id = 'private-outer'; outerDraft.name = 'Outer'; delete outerDraft.semanticHash;
    outerDraft.body.nodes.work = { id: 'work', type: 'subgraph', definition: refFor(leaf), x: 300, y: 80 };
    outerDraft.body.wires.a.toPort = 'input'; outerDraft.body.wires.b.fromPort = 'output';
    const outer = finalize(outerDraft);
    const source = root(); source.nodes.work = { id: 'work', type: 'subgraph', definition: refFor(outer), x: 300, y: 80 };
    source.wires.edge.toPort = 'input';
    source.definitions = { [definitionRefKey(leaf)]: leaf, [definitionRefKey(outer)]: outer };
    if (owned) source.localDefinitionOwners = [{ instancePath: ['work'], definitionId: outer.id }, { instancePath: ['work', 'work'], definitionId: leaf.id }];
    assert.equal(validateGraphStructure(source).ok, true);
    return { source, leaf, outer, path: ['work', 'work'] };
};

test('root creation prepares a detached frame preserving wires, nodes, metadata, and semantics', () => {
    assert.equal(typeof comments.prepareCommentEdit, 'function');
    const source = root(), authored = frame();
    source.recording = { status: 'completed' };
    const before = structuredClone(source), beforeFrame = structuredClone(authored);
    const prepared = comments.prepareCommentEdit(source, { kind: 'create', viewPath: [], frame: authored });
    assert.equal(prepared.ok, true, JSON.stringify(prepared));
    const edit = prepared.data;
    assert.equal(edit.changed, true);
    assert.deepEqual(edit.candidate.nodes.frame, authored);
    assert.deepEqual(edit.candidate.nodes.source, source.nodes.source);
    assert.deepEqual(edit.candidate.wires, source.wires);
    assert.deepEqual(edit.candidate.recording, source.recording);
    assert.deepEqual(edit.addedEdgeIds, []); assert.deepEqual(edit.removedEdgeIds, []);
    assert.deepEqual(edit.viewPath, []);
    assert.equal(edit.baseSignature, graphSemanticSignature(source));
    assert.equal(edit.baseDocumentSignature, graphDocumentSignature(source));
    assert.equal(graphSemanticSignature(edit.candidate), graphSemanticSignature(source));
    assert.equal(validateGraphStructure(edit.candidate).ok, true);
    edit.candidate.nodes.frame.title = 'Detached';
    assert.deepEqual(source, before); assert.deepEqual(authored, beforeFrame);
});

test('root frame updates preserve runtime node fields and return an unchanged preparation for no-op edits', () => {
    const source = root(); source.nodes.frame = frame();
    const before = structuredClone(source);
    const patch = { title: 'Changed title', content: 'New\nnotes', color: '#807c69', moveContents: false, x: -50, y: 60, w: 900, h: 600 };
    const prepared = comments.prepareCommentEdit(source, { kind: 'update', viewPath: [], nodeId: 'frame', patch });
    assert.equal(prepared.ok, true, JSON.stringify(prepared));
    assert.deepEqual(prepared.data.candidate.nodes.frame, { ...source.nodes.frame, ...patch });
    assert.deepEqual(prepared.data.candidate.nodes.work, source.nodes.work);
    assert.deepEqual(prepared.data.candidate.wires, source.wires);
    assert.equal(graphSemanticSignature(prepared.data.candidate), graphSemanticSignature(source));
    assert.deepEqual(source, before);
    const noop = comments.prepareCommentEdit(prepared.data.candidate, { kind: 'update', viewPath: [], nodeId: 'frame', patch });
    assert.equal(noop.ok, true, JSON.stringify(noop));
    assert.equal(noop.data.changed, false);
    assert.equal(comments.prepareCommentEdit(source, { kind: 'update', viewPath: [], nodeId: 'work', patch: { title: 'Forbidden' } }).ok, false);
});

test('delete removes only the selected frame and never its contained ordinary nodes or wires', () => {
    const source = root(); source.nodes.frame = frame();
    const before = structuredClone(source);
    const prepared = comments.prepareCommentEdit(source, { kind: 'delete', viewPath: [], nodeId: 'frame' });
    assert.equal(prepared.ok, true, JSON.stringify(prepared));
    assert.deepEqual(prepared.data.candidate.nodes, { source: source.nodes.source, work: source.nodes.work });
    assert.deepEqual(prepared.data.candidate.wires, source.wires);
    assert.deepEqual(prepared.data.removedEdgeIds, []);
    assert.equal(graphSemanticSignature(prepared.data.candidate), graphSemanticSignature(source));
    assert.deepEqual(source, before);
    assert.equal(comments.prepareCommentEdit(source, { kind: 'delete', viewPath: [], nodeId: 'work' }).ok, false);
    assert.equal(comments.prepareCommentEdit(source, { kind: 'delete', viewPath: [], nodeId: 'missing' }).ok, false);
});

test('layout prepares ordinary-node movement and frame movement or resize as one semantics-neutral batch', () => {
    const source = root(); source.nodes.frame = frame();
    const before = structuredClone(source);
    const positions = [{ id: 'frame', x: 40, y: 50, w: 600, h: 500 }, { id: 'source', x: 60, y: 130 }, { id: 'work', x: 340, y: 130 }];
    const prepared = comments.prepareCommentEdit(source, { kind: 'layout', viewPath: [], positions });
    assert.equal(prepared.ok, true, JSON.stringify(prepared));
    assert.deepEqual(prepared.data.candidate.nodes.frame, { ...source.nodes.frame, x: 40, y: 50, w: 600, h: 500 });
    assert.deepEqual(prepared.data.candidate.nodes.source, { ...source.nodes.source, x: 60, y: 130 });
    assert.deepEqual(prepared.data.candidate.nodes.work, { ...source.nodes.work, x: 340, y: 130 });
    assert.deepEqual(prepared.data.candidate.wires, source.wires);
    assert.equal(graphSemanticSignature(prepared.data.candidate), graphSemanticSignature(source));
    assert.deepEqual(source, before);
    const noop = comments.prepareCommentEdit(prepared.data.candidate, { kind: 'layout', viewPath: [], positions });
    assert.equal(noop.ok, true); assert.equal(noop.data.changed, false);
});

test('layout moves a comment and collapsed group in one detached presentation batch', () => {
    const source = root(); source.nodes.frame = frame();
    source.groups.group = { id: 'group', title: 'Folded stage', members: ['source'], collapsed: true, color: '#506070', x: 20, y: 80, frame: { x: 10, y: 70, w: 260, h: 140 } };
    source.nodes.source.inGroup = 'group';
    const before = structuredClone(source);
    const positions = [{ id: 'frame', x: 40, y: 50 }, { id: 'source', x: 60, y: 130 }];
    const groupPositions = [{ id: 'group', x: 60, y: 130, frame: { x: 50, y: 120, w: 260, h: 140 } }];
    const prepared = comments.prepareCommentEdit(source, { kind: 'layout', viewPath: [], positions, groupPositions });
    assert.equal(prepared.ok, true, JSON.stringify(prepared));
    assert.deepEqual(prepared.data.candidate.groups.group, { ...source.groups.group, ...groupPositions[0] });
    assert.deepEqual(prepared.data.candidate.nodes.source, { ...source.nodes.source, x: 60, y: 130 });
    assert.deepEqual(prepared.data.candidate.nodes.frame, { ...source.nodes.frame, x: 40, y: 50 });
    assert.equal(graphSemanticSignature(prepared.data.candidate), graphSemanticSignature(source));
    assert.deepEqual(source, before);
    groupPositions[0].frame.x = 999;
    assert.equal(prepared.data.candidate.groups.group.frame.x, 50);
    const noFrame = comments.prepareCommentEdit(source, { kind: 'layout', viewPath: [], positions: [], groupPositions: [{ id: 'group', x: 90, y: 100 }] });
    assert.equal(noFrame.ok, true, JSON.stringify(noFrame));
    assert.deepEqual(noFrame.data.candidate.groups.group.frame, source.groups.group.frame);
    const noop = comments.prepareCommentEdit(noFrame.data.candidate, { kind: 'layout', viewPath: [], positions: [], groupPositions: [{ id: 'group', x: 90, y: 100 }] });
    assert.equal(noop.ok, true); assert.equal(noop.data.changed, false);
});

test('owned nested comment-group layout preserves exact containing and ancestor definition identity', () => {
    const { source, leaf, outer, path } = nested(), key = definitionRefKey(leaf), expectedRef = refFor(leaf);
    source.definitions[key].body.groups = { group: { id: 'group', members: ['work'], collapsed: true, x: 300, y: 80 } };
    source.definitions[key].body.nodes.work.inGroup = 'group';
    const before = structuredClone(source);
    const prepared = comments.prepareCommentEdit(source, { kind: 'layout', viewPath: path, expectedRef, positions: [{ id: 'frame', x: 20, y: 30 }, { id: 'work', x: 320, y: 110 }], groupPositions: [{ id: 'group', x: 320, y: 110, frame: { x: 290, y: 100, w: 260, h: 140 } }] });
    assert.equal(prepared.ok, true, JSON.stringify(prepared));
    assert.deepEqual(prepared.data.candidate.definitions[definitionRefKey(outer)], outer);
    assert.deepEqual(refFor(prepared.data.candidate.definitions[key]), expectedRef);
    assert.deepEqual(prepared.data.candidate.definitions[key].body.groups.group, { ...source.definitions[key].body.groups.group, x: 320, y: 110, frame: { x: 290, y: 100, w: 260, h: 140 } });
    assert.equal(computeDefinitionIdentity(prepared.data.candidate.definitions[key]).data.semanticHash, leaf.semanticHash);
    assert.equal(graphSemanticSignature(prepared.data.candidate), graphSemanticSignature(source));
    assert.deepEqual(source, before);
    assert.equal(comments.prepareCommentEdit(source, { kind: 'layout', viewPath: path, expectedRef: { ...expectedRef, version: 2 }, positions: [], groupPositions: [] }).error.code, 'STALE_DEFINITION');
    delete source.localDefinitionOwners;
    assert.equal(comments.prepareCommentEdit(source, { kind: 'layout', viewPath: path, expectedRef, positions: [], groupPositions: [] }).error.code, 'READ_ONLY_DEFINITION');
});

test('malformed group layouts reject atomically without reading unsafe accessors or altering fold metadata', () => {
    const source = root(); source.nodes.frame = frame();
    source.groups.group = { id: 'group', title: 'Keep', members: ['source'], collapsed: true, x: 20, y: 80 };
    const before = structuredClone(source), row = { id: 'group', x: 60, y: 130 };
    const input = { kind: 'layout', viewPath: [], positions: [{ id: 'frame', x: 40, y: 50 }] };
    for (const groupPositions of [null, {}, [{ ...row, id: 'missing' }], [row, row], [{ ...row, id: '__proto__' }], [{ id: 'group', y: 10 }], [{ ...row, x: Infinity }], [{ ...row, collapsed: false }], [{ ...row, members: [] }], [{ ...row, frame: { x: 0, y: 0, w: 0, h: 1 } }], [{ ...row, frame: { x: 0, y: 0, w: 10, h: 20, collapsed: true } }], [{ ...row, frame: { x: 0, y: 0, w: 10 } }], Array(1001).fill(row)]) {
        assert.equal(comments.prepareCommentEdit(source, { ...input, groupPositions }).ok, false, JSON.stringify(groupPositions));
        assert.deepEqual(source, before);
    }
    let reads = 0;
    assert.equal(comments.prepareCommentEdit(source, { ...input, groupPositions: [{ ...row, get frame() { reads++; throw Error('Do not read'); } }] }).ok, false);
    assert.equal(reads, 0); assert.deepEqual(source, before);
});

test('owned nested edits replace only the saved target snapshot while preserving all exact pins and hashes', () => {
    const { source, leaf, outer, path } = nested();
    const before = structuredClone(source), expectedRef = refFor(leaf);
    const prepared = comments.prepareCommentEdit(source, { kind: 'update', viewPath: path, expectedRef, nodeId: 'frame', patch: { title: 'Private notes', content: 'Nested\nannotation', moveContents: false } });
    assert.equal(prepared.ok, true, JSON.stringify(prepared));
    const edit = prepared.data, key = definitionRefKey(leaf);
    assert.deepEqual(edit.viewPath, path); assert.deepEqual(edit.expectedRef, expectedRef);
    assert.deepEqual(Object.keys(edit.candidate.definitions), Object.keys(source.definitions));
    assert.deepEqual(edit.candidate.nodes, source.nodes);
    assert.deepEqual(edit.candidate.localDefinitionOwners, source.localDefinitionOwners);
    assert.deepEqual(edit.candidate.definitions[definitionRefKey(outer)], outer);
    assert.deepEqual(refFor(edit.candidate.definitions[key]), refFor(leaf));
    assert.deepEqual(edit.candidate.definitions[key].body.nodes.frame, { ...leaf.body.nodes.frame, title: 'Private notes', content: 'Nested\nannotation', moveContents: false });
    assert.deepEqual(edit.candidate.definitions[key].body.nodes.work, leaf.body.nodes.work);
    assert.deepEqual(edit.candidate.definitions[key].body.wires, leaf.body.wires);
    assert.equal(graphSemanticSignature(edit.candidate), graphSemanticSignature(source));
    assert.equal(computeDefinitionIdentity(edit.candidate.definitions[key]).data.semanticHash, leaf.semanticHash);
    assert.equal(validateGraphStructure(edit.candidate).ok, true);
    const imported = parseWorkflow(JSON.stringify(exportWorkflow(edit.candidate)));
    assert.equal(imported.ok, true, JSON.stringify(imported));
    assert.deepEqual(imported.data.definitions[key].body.nodes.frame, edit.candidate.definitions[key].body.nodes.frame);
    assert.deepEqual(source, before);
});

test('scope guards reject shared definitions, stale exact pins, missing paths, and retired or library documents', () => {
    const { source, leaf, path } = nested(false);
    const command = { kind: 'update', viewPath: path, expectedRef: refFor(leaf), nodeId: 'frame', patch: { title: 'Rejected' } };
    const before = structuredClone(source);
    assert.equal(comments.prepareCommentEdit(source, command).error.code, 'READ_ONLY_DEFINITION');
    const owned = nested();
    for (const expectedRef of [undefined, { ...refFor(owned.leaf), version: 2 }, { ...refFor(owned.leaf), id: 'another' }, { ...refFor(owned.leaf), semanticHash: `sha256:${'0'.repeat(64)}` }, { ...refFor(owned.leaf), extra: true }]) {
        const input = { ...command, expectedRef };
        if (expectedRef === undefined) delete input.expectedRef;
        assert.equal(comments.prepareCommentEdit(owned.source, input).error.code, 'STALE_DEFINITION');
    }
    assert.equal(comments.prepareCommentEdit(owned.source, { ...command, viewPath: ['missing'] }).error.code, 'INVALID_INSTANCE');
    const create = { kind: 'create', viewPath: [], frame: frame() };
    for (const viewPath of [null, 'work', Array(9).fill('work'), ['__proto__']]) assert.equal(comments.prepareCommentEdit(root(), { ...create, viewPath }).error.code, 'INVALID_INSTANCE');
    const omittedPath = { ...create }; delete omittedPath.viewPath;
    assert.equal(comments.prepareCommentEdit(root(), omittedPath).error.code, 'INVALID_INSTANCE');
    assert.equal(comments.prepareCommentEdit(root(), { ...create, expectedRef: refFor(owned.leaf) }).error.code, 'STALE_DEFINITION');
    assert.equal(comments.prepareCommentEdit({ ...root(), schema: 2, runtime: 1 }, create).error.code, 'UNSUPPORTED_VERSION');
    assert.equal(comments.prepareCommentEdit({ definitions: source.definitions }, create).ok, false);
    assert.equal(comments.prepareCommentEdit(leaf.body, create).ok, false, 'a raw saved body cannot bypass containing ownership');
    assert.deepEqual(source, before);
});

test('malicious comment fields and unsafe accessors reject without reads or graph mutations', () => {
    const source = root(); source.nodes.frame = frame();
    const before = structuredClone(source);
    const update = { kind: 'update', viewPath: [], nodeId: 'frame', patch: {} };
    for (const patch of [{ operation: 'scene-context' }, { enabled: false }, { type: 'workflow' }, { inGroup: 'group' }, { id: 'changed' }, { memberIds: ['work'] }, { title: 12 }, { content: [] }, { color: null }, { moveContents: 'true' }, { w: 0 }, { h: -1 }, { x: Infinity }, JSON.parse('{"__proto__":{"title":"Injected"}}')]) {
        assert.equal(comments.prepareCommentEdit(source, { ...update, patch }).ok, false, JSON.stringify(patch));
    }
    for (const change of [{ enabled: true }, { operation: 'reroute' }, { inGroup: 'group' }, { memberIds: ['work'] }, { type: 'workflow' }, { commentFrame: false }, { id: '__proto__' }, { id: 'work' }, { w: 0 }, { h: -1 }]) {
        assert.equal(comments.prepareCommentEdit(source, { kind: 'create', viewPath: [], frame: { ...frame(), id: 'new', ...change } }).ok, false, JSON.stringify(change));
    }
    for (const nodeId of ['__proto__', 'constructor', 'missing', 'source']) assert.equal(comments.prepareCommentEdit(source, { ...update, nodeId, patch: { title: 'No' } }).ok, false);
    let reads = 0;
    const hostileCommand = { get kind() { reads++; throw new Error('Do not inspect'); } };
    const hostilePatch = { get title() { reads++; throw new Error('Do not inspect'); } };
    const hostileRoot = { ...source, get name() { reads++; throw new Error('Do not inspect'); } };
    assert.equal(comments.prepareCommentEdit(source, hostileCommand).ok, false);
    assert.equal(comments.prepareCommentEdit(source, { ...update, patch: hostilePatch }).ok, false);
    assert.equal(comments.prepareCommentEdit(hostileRoot, update).ok, false);
    assert.equal(comments.prepareCommentEdit(source, { ...update, callback: () => {} }).ok, false);
    assert.equal(reads, 0);
    assert.deepEqual(source, before);
});

test('layout rejects ordinary-node dimensions and malformed batches atomically', () => {
    const source = root(); source.nodes.frame = frame();
    source.nodes.ordinary = { id: 'ordinary', type: 'note', x: 50, y: 100, w: 120, h: 70 };
    const before = structuredClone(source);
    const validFirst = { id: 'frame', x: 10, y: 20 };
    for (const positions of [null, {}, [{ id: 'source', x: 1, y: 2, w: 300 }], [{ id: 'ordinary', x: 1, y: 2, h: 100 }], [validFirst, { id: 'missing', x: 1, y: 2 }], [validFirst, { ...validFirst, x: 30 }], [{ id: 'constructor', x: 1, y: 2 }], [{ id: 'source', y: 2 }], [{ id: 'source', x: NaN, y: 2 }], [{ id: 'source', x: 1, y: 2, enabled: false }], [{ ...validFirst, w: 0 }], [{ ...validFirst, h: -1 }], Array.from({ length: 1001 }, () => validFirst)]) {
        assert.equal(comments.prepareCommentEdit(source, { kind: 'layout', viewPath: [], positions }).ok, false);
        assert.deepEqual(source, before);
    }
});

test('prepared root and nested annotation commits preserve recording activation and opaque authority handles', () => {
    const child = nested();
    const cases = [
        { source: root(), path: [], command: { kind: 'create', viewPath: [], frame: frame() } },
        { source: child.source, path: child.path, command: { kind: 'update', viewPath: child.path, expectedRef: refFor(child.leaf), nodeId: 'frame', patch: { title: 'Live annotation' } } },
    ];
    for (const { source, path, command } of cases) {
        const recording = source.recording = { id: 'current-recording', status: 'completed' };
        const activation = source.activation = { sessionId: 'active-session', epoch: 3 };
        const opaqueHandle = source.opaqueHandle = { runId: 'current-run', authorityId: 'current-authority' };
        const current = { sessionId: 'annotation-session', viewPath: path, readOnly: false };
        const capture = captureGraphEditContext(source, () => current);
        assert.equal(capture.ok, true, JSON.stringify(capture));
        const prepared = comments.prepareCommentEdit(source, command);
        assert.equal(prepared.ok, true, JSON.stringify(prepared));
        assert.deepEqual(prepared.data.candidate.recording, recording);
        assert.deepEqual(prepared.data.candidate.activation, activation);
        assert.deepEqual(prepared.data.candidate.opaqueHandle, opaqueHandle);
        assert.equal(source.recording, recording); assert.equal(source.activation, activation); assert.equal(source.opaqueHandle, opaqueHandle);
        const committed = commitPreparedGraph(source, { ...prepared.data, context: capture.data });
        assert.equal(committed.ok, true, JSON.stringify(committed));
        assert.equal(committed.data.changed, true); assert.equal(committed.data.semanticChanged, false);
        assert.equal(source.recording, recording); assert.equal(source.activation, activation); assert.equal(source.opaqueHandle, opaqueHandle);
    }
});

test('a raw note-only saved body cannot masquerade as a current root document', () => {
    const body = { schema: 3, runtime: 2, mode: 'native-pre', nodes: { frame: frame() }, wires: {} };
    assert.equal(validateGraphStructure(body).ok, true);
    const command = { kind: 'update', viewPath: [], nodeId: 'frame', patch: { title: 'Forbidden' } };
    const prepared = comments.prepareCommentEdit(body, command);
    assert.equal(prepared.ok, false);
    assert.equal(prepared.error.code, 'INVALID_CONTEXT');
    assert.equal(body.nodes.frame.title, 'Comment');
});

test('owned nested creation layout and deletion preserve ancestor snapshots and exact leaf identity', () => {
    const { source, leaf, outer, path } = nested();
    const before = structuredClone(source), expectedRef = refFor(leaf), key = definitionRefKey(leaf);
    const commands = [
        { kind: 'create', frame: { ...frame(), id: 'second' } },
        { kind: 'layout', positions: [{ id: 'work', x: 400, y: 150 }, { id: 'frame', x: 100, y: 100, w: 700, h: 500 }] },
        { kind: 'delete', nodeId: 'frame' },
    ];
    for (const command of commands) {
        const prepared = comments.prepareCommentEdit(source, { ...command, viewPath: path, expectedRef });
        assert.equal(prepared.ok, true, JSON.stringify(prepared));
        const candidate = prepared.data.candidate, scope = candidate.definitions[key].body;
        assert.deepEqual(candidate.nodes, source.nodes);
        assert.deepEqual(candidate.definitions[definitionRefKey(outer)], outer);
        assert.deepEqual(refFor(candidate.definitions[key]), expectedRef);
        assert.deepEqual(scope.wires, leaf.body.wires);
        assert.equal(graphSemanticSignature(candidate), graphSemanticSignature(source));
        if (command.kind === 'create') assert.deepEqual(scope.nodes.second, { ...frame(), id: 'second' });
        if (command.kind === 'layout') {
            assert.deepEqual(scope.nodes.work, { ...leaf.body.nodes.work, x: 400, y: 150 });
            assert.deepEqual(scope.nodes.frame, { ...frame(), x: 100, y: 100, w: 700, h: 500 });
        }
        if (command.kind === 'delete') {
            assert.equal(scope.nodes.frame, undefined);
            assert.deepEqual(scope.nodes.work, leaf.body.nodes.work);
        }
        assert.deepEqual(source, before);
    }
});

test('malformed command kinds return a failure result without property-key coercion', () => {
    for (const kind of [null, 12, {}, { toString: 'create', valueOf: 'create' }, ['create'], '__proto__', 'unknown']) {
        let result;
        assert.doesNotThrow(() => { result = comments.prepareCommentEdit(root(), { kind, viewPath: [], frame: frame() }); });
        assert.equal(result.ok, false);
    }
});

test('owned nested frame batch deletion preserves exact ancestor pins and live runtime identity in one commit', () => {
    const {source,leaf,outer,path}=nested(),key=definitionRefKey(leaf),expectedRef=refFor(leaf);
    source.definitions[key].body.nodes.second={...frame(),id:'second',x:600};
    const recording=source.recording={id:'active',status:'completed'},activation=source.activation={sessionId:'active'},opaqueHandle=source.opaqueHandle={authorityId:'active'};
    const before=structuredClone(source),context={sessionId:'batch',viewPath:path,readOnly:false},capture=captureGraphEditContext(source,()=>context);
    const prepared=comments.prepareCommentEdit(source,{kind:'delete-batch',nodeIds:['frame','second'],viewPath:path,expectedRef});
    assert.equal(prepared.ok,true,JSON.stringify(prepared));assert.equal(prepared.data.candidate.definitions[key].body.nodes.frame,undefined);assert.equal(prepared.data.candidate.definitions[key].body.nodes.second,undefined);
    assert.deepEqual(prepared.data.candidate.definitions[definitionRefKey(outer)],outer);assert.deepEqual(refFor(prepared.data.candidate.definitions[key]),expectedRef);assert.deepEqual(prepared.data.candidate.definitions[key].body.wires,leaf.body.wires);assert.equal(graphSemanticSignature(prepared.data.candidate),graphSemanticSignature(source));assert.deepEqual(source,before);
    const committed=commitPreparedGraph(source,{...prepared.data,context:capture.data});assert.equal(committed.ok,true,JSON.stringify(committed));assert.equal(committed.data.semanticChanged,false);assert.equal(source.recording,recording);assert.equal(source.activation,activation);assert.equal(source.opaqueHandle,opaqueHandle);
});

test('frame batch deletion rejects malformed, mixed, stale and shared requests atomically', () => {
    const {source,leaf,path}=nested(),command={kind:'delete-batch',nodeIds:['frame'],viewPath:path,expectedRef:refFor(leaf)},before=structuredClone(source);
    for(const nodeIds of [[],null,{},['frame','frame'],['frame','work'],['frame','missing'],['__proto__'],Array(1001).fill('frame')]){assert.equal(comments.prepareCommentEdit(source,{...command,nodeIds}).ok,false);assert.deepEqual(source,before);}
    assert.equal(comments.prepareCommentEdit(source,{...command,expectedRef:{...command.expectedRef,version:2}}).error.code,'STALE_DEFINITION');
    delete source.localDefinitionOwners;assert.equal(comments.prepareCommentEdit(source,command).error.code,'READ_ONLY_DEFINITION');
});
