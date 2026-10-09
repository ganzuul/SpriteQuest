import assert from 'node:assert/strict';
import { test } from 'node:test';
import { installMock } from './mock.js';
import { starterGraph } from '../src/workflow/starters.js';
import { prepareWorkflowInsertion } from '../src/workflow/insertion.js';
import { captureGraphEditContext } from '../src/workflow/transactions.js?v=0.19.1';
import * as H from '../src/history.js?v=0.19.1';
import * as S from '../src/state.js?v=0.19.1';

let serial = 0;
function fixture() {
    const host = installMock({ settings: { enabled: false, workflowMode: 'legacy', nativeBindings: { preGraphId: null, postGraphId: null }, graphs: {} } });
    let saves = 0; host.saveSettingsDebounced = () => saves++;
    const root = starterGraph('native-guidance'); root.id = `state-transaction-${++serial}`;
    root.recording = { id: 'diagnostic' }; root.authority = { apply: 'current-only' };
    const context = { sessionId: 'state', viewPath: [], readOnly: false };
    const token = captureGraphEditContext(root, () => context).data;
    const prepared = { ...prepareWorkflowInsertion(root, starterGraph('native-guidance')).data, context: token };
    H.track(root);
    const calls = [];
    const hooks = { onSemanticChange: graph => calls.push(['cancel', graph.id]), reconcileViews: graph => calls.push(['reconcile', Object.keys(graph.nodes).length]) };
    return { root, host, context, prepared, hooks, calls, saves: () => saves };
}

test('state accepted document commit and semantic undo/redo persist, cancel and reconcile once each', () => {
    const { root, host, prepared, hooks, calls, saves } = fixture();
    const touched = [];
    const unsubscribe = S.onGraphTouched((graph, options) => { if (graph !== root) return; touched.push(options); if (options?.history !== false) H.noteChange(graph); });
    try {
        assert.equal(S.commitGraphEdit(root, prepared, hooks).ok, true);
        assert.deepEqual(calls, [['cancel', root.id], ['reconcile', 8]]);
        assert.deepEqual(touched, [{ history: false, semanticChanged: true }]);
        assert.equal(saves(), 1); assert.equal(root.authority.apply, 'current-only');
        assert.equal(S.stepGraphHistory(root, 'undo', hooks).data.semanticChanged, true);
        assert.equal(S.stepGraphHistory(root, 'redo', hooks).data.semanticChanged, true);
        assert.equal(saves(), 3); assert.equal(calls.length, 6);
        assert.equal(S.stepGraphHistory(root, 'redo', hooks).data.changed, false);
        assert.equal(saves(), 3); assert.equal(calls.length, 6);
        assert.deepEqual(root.recording, { id: 'diagnostic' });
        assert.deepEqual(host.extensionSettings['prompt-canvas'].nativeBindings, { preGraphId: null, postGraphId: null });
        assert.equal(host.extensionSettings['prompt-canvas'].enabled, false);
        assert.equal(host.extensionSettings['prompt-canvas'].workflowMode, 'legacy');
    } finally { unsubscribe(); }
});

test('native presentation undo preserves authority and recording and performs only reconciliation', () => {
    const { root, hooks, calls, saves } = fixture();
    const view = root.view, authority = root.authority, recording = root.recording;
    root.nodes['response-plan'].presentation = { alias: 'Plan alias', compact: true };
    H.noteChange(root); H.flush(root);
    assert.equal(S.stepGraphHistory(root, 'undo', hooks).data.semanticChanged, false);
    assert.deepEqual(calls, [['reconcile', 4]]);
    assert.equal(S.stepGraphHistory(root, 'redo', hooks).data.semanticChanged, false);
    assert.equal(calls.length, 2); assert.equal(saves(), 2);
    assert.equal(root.view, view); assert.equal(root.authority, authority); assert.equal(root.recording, recording);
});

test('rejected and no-op state commits cannot save, cancel, reconcile, or mutate history', () => {
    const { root, prepared, context, hooks, calls, saves } = fixture();
    const before = structuredClone(root), history = H.peek(root);
    context.readOnly = true;
    assert.equal(S.commitGraphEdit(root, prepared, hooks).error.code, 'READ_ONLY_VIEW');
    assert.deepEqual(root, before); assert.deepEqual(H.peek(root), history);
    context.readOnly = false;
    const noOp = { ...prepared, candidate: structuredClone(root) };
    assert.equal(S.commitGraphEdit(root, noOp, hooks).data.changed, false);
    assert.deepEqual(calls, []); assert.equal(saves(), 0); assert.deepEqual(H.peek(root), history);
});

test('immutable bookkeeping cannot throw after the complete editable document was accepted', () => {
    const { root, prepared, hooks, calls, saves } = fixture();
    Object.defineProperty(root, 'updatedAt', { value: 123, enumerable: true, configurable: false, writable: false });
    assert.equal(S.commitGraphEdit(root, prepared, hooks).ok, true);
    assert.equal(root.updatedAt, 123); assert.equal(saves(), 1); assert.equal(calls.length, 2);
});
