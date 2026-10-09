import test from 'node:test';
import assert from 'node:assert/strict';
import { transitionNativeGesture } from '../src/canvas/native-gestures.js';
import { validateGraphStructure } from '../src/workflow/contracts.js';
import { computeDefinitionIdentity, validateDefinition, definitionRefKey } from '../src/workflow/definitions.js';
import { portsForNode } from '../src/workflow/catalog.js';

const output = { nodeId: 'source', portId: 'text', dir: 'out', kind: 'text', center: { x: 10, y: 20 }, address: { workflowId: 'root', instancePath: [], nodeId: 'source', portId: 'text' } };
const input = { nodeId: 'sink', portId: 'prompt', dir: 'in', kind: 'text', center: { x: 100, y: 80 }, address: { workflowId: 'root', instancePath: [], nodeId: 'sink', portId: 'prompt' } };
const begin = (pin, capture = {}, extra = {}) => transitionNativeGesture(undefined, { type: 'begin-pin', pin, capture, pointerId: 7, graphPoint: pin.center, originalBindings: [], current: true, ...extra });
const move = (state, pin) => transitionNativeGesture(state, { type: 'pointer-move', pointerId: 7, graphPoint: { x: 95, y: 75 }, hit: { kind: 'pin', pin } });
const accept = (state, extra = {}) => transitionNativeGesture(state, { type: 'target-result', capture: state.capture, requestId: state.requestId, current: true, compatible: true, ...extra });
const release = (state, hit, extra = {}) => transitionNativeGesture(state, { type: 'release', pointerId: 7, capture: state.capture, current: true, graphPoint: { x: 99.25, y: 75.5 }, screenAnchor: { x: 600, y: 320 }, hit, ...extra });
const search = pin => release(begin(pin).state, { kind: 'empty' });
const choose = (state, extra = {}) => transitionNativeGesture(state, { type: 'choose-node', capture: state.capture, current: true, choice: 'repair', matchingPorts: [{ portId: 'body', dir: 'in', kind: 'text' }], contextSensitive: true, ...extra });

test('output drag connects only the actual validated named input', () => {
    const capture = {};
    const started = begin(output, capture);
    assert.equal(started.state.kind, 'drag');
    assert.equal(started.state.mode, 'connect');
    assert.deepEqual(started.effects, [{ type: 'capture-pointer', pointerId: 7 }]);
    const hovered = move(started.state, input);
    assert.equal(hovered.state.feedback, null);
    assert.deepEqual(hovered.effects, [{ type: 'validate-target', capture, requestId: 1, mode: 'connect', origin: output, target: input, originalBindings: [] }]);
    const validated = accept(hovered.state);
    assert.deepEqual(validated.state.feedback, { compatible: true });
    const finished = release(validated.state, { kind: 'pin', pin: input });
    assert.equal(finished.state.kind, 'idle');
    assert.deepEqual(finished.effects, [
        { type: 'release-pointer', pointerId: 7, expected: true },
        { type: 'prepare-command', capture, command: { kind: 'connect', from: output, to: input, originalBindings: [] } },
        { type: 'clear-draft' },
    ]);
});

test('input-origin drag preserves its named input when connecting in reverse', () => {
    const hovered = move(begin(input).state, output);
    const finished = release(accept(hovered.state).state, { kind: 'pin', pin: output });
    const command = finished.effects.find(effect => effect.type === 'prepare-command').command;
    assert.equal(command.from.portId, 'text');
    assert.equal(command.to.portId, 'prompt');
    assert.equal(command.to.nodeId, 'sink');
});

test('Ctrl input move retains the original binding until one prepared move', () => {
    const originals = [{ kind: 'portal', id: 'binding-1', portalId: 'portal-1' }];
    const destination = { ...input, nodeId: 'new-sink', portId: 'body', address: { ...input.address, nodeId: 'new-sink', portId: 'body' } };
    const started = begin(input, {}, { ctrl: true, originalBindings: originals });
    assert.equal(started.state.mode, 'move-input');
    originals[0].id = 'mutated-by-caller';
    const hovered = move(started.state, destination);
    assert.deepEqual(hovered.effects[0].originalBindings, [{ kind: 'portal', id: 'binding-1', portalId: 'portal-1' }]);
    const finished = release(accept(hovered.state).state, { kind: 'pin', pin: destination });
    assert.deepEqual(finished.effects.find(effect => effect.type === 'prepare-command').command, { kind: 'move-input', origin: input, target: destination, originalBindings: [{ kind: 'portal', id: 'binding-1', portalId: 'portal-1' }] });
    assert.equal(finished.effects.some(effect => effect.type === 'disconnect'), false);
});

test('Ctrl output move retains ordinary consumers and portal publisher references', () => {
    const originals = [{ kind: 'direct', id: 'wire-1' }, { kind: 'direct', id: 'wire-2' }, { kind: 'portal-publisher', id: 'publisher-1', portalId: 'portal-1' }];
    const target = { ...output, nodeId: 'new-source', address: { ...output.address, nodeId: 'new-source' } };
    const started = begin(output, {}, { ctrl: true, originalBindings: originals });
    assert.equal(started.state.mode, 'move-output');
    const hovered = move(started.state, target);
    const finished = release(accept(hovered.state).state, { kind: 'pin', pin: target });
    assert.deepEqual(finished.effects.find(effect => effect.type === 'prepare-command').command, { kind: 'move-output', origin: output, target, originalBindings: originals });
});

test('Ctrl on an unconnected pin starts an ordinary connection', () => {
    assert.equal(begin(input, {}, { ctrl: true }).state.mode, 'connect');
});

test('actual rejected pin feedback clears after leaving the pin and never connects', () => {
    const hovered = move(begin(output).state, input);
    const rejected = accept(hovered.state, { compatible: false, reason: 'A cycle would be introduced' });
    assert.deepEqual(rejected.state.feedback, { compatible: false, reason: 'A cycle would be introduced' });
    const finished = release(rejected.state, { kind: 'pin', pin: input });
    assert.equal(finished.state.kind, 'idle');
    assert.deepEqual(finished.effects, [{ type: 'release-pointer', pointerId: 7, expected: true }, { type: 'feedback', reason: 'A cycle would be introduced' }, { type: 'clear-draft' }]);
    const body = transitionNativeGesture(rejected.state, { type: 'pointer-move', pointerId: 7, graphPoint: { x: 20, y: 30 }, hit: { kind: 'body' } });
    assert.equal(body.state.target, null);
    assert.equal(body.state.feedback, null);
    assert.equal(body.effects.length, 0);
});

test('late compatibility for a previous actual pin cannot validate the current pin', () => {
    const first = move(begin(output).state, input);
    const other = { ...input, nodeId: 'other', address: { ...input.address, nodeId: 'other' } };
    const next = move(first.state, other);
    const late = accept(next.state, { requestId: first.state.requestId });
    assert.equal(late.state, next.state);
    assert.equal(late.state.feedback, null);
    const current = accept(next.state);
    assert.deepEqual(current.state.feedback, { compatible: true });
});

test('body outside surface and Ctrl empty releases cancel without preparing edits', () => {
    for (const hit of [{ kind: 'body' }, { kind: 'outside' }, { kind: 'surface' }, { kind: 'empty' }]) {
        const started = begin(input, {}, { ctrl: true, originalBindings: [{ kind: 'direct', id: 'original' }] });
        const finished = release(started.state, hit);
        assert.equal(finished.state.kind, 'idle', hit.kind);
        assert.deepEqual(finished.effects, [{ type: 'release-pointer', pointerId: 7, expected: true }, { type: 'clear-draft' }]);
        assert.deepEqual(started.state.originalBindings, [{ kind: 'direct', id: 'original' }]);
    }
});

test('genuine empty release retains its live draft and captured graph point through search', () => {
    const started = begin(output);
    const point = { x: 99.25, y: 75.5 };
    const anchor = { x: 600, y: 320 };
    const opened = release(started.state, { kind: 'empty' }, { graphPoint: point, screenAnchor: anchor });
    assert.equal(opened.state.kind, 'search');
    assert.deepEqual(opened.state.ghost, point);
    assert.deepEqual(opened.state.graphPoint, point);
    assert.deepEqual(opened.effects, [{ type: 'release-pointer', pointerId: 7, expected: true }, { type: 'open-search', capture: started.state.capture, origin: output, graphPoint: point, screenAnchor: anchor, contextSensitive: true }]);
    point.x = 2000;
    anchor.x = 0;
    const selected = choose(opened.state, { screenAnchor: { x: 2, y: 3 }, graphPoint: { x: 4, y: 5 } });
    assert.equal(selected.state.kind, 'idle');
    assert.deepEqual(selected.effects, [{ type: 'prepare-command', capture: started.state.capture, command: { kind: 'create-connect', choice: 'repair', portId: 'body', origin: output, graphPoint: { x: 99.25, y: 75.5 } } }, { type: 'close-search' }, { type: 'clear-draft' }]);
});

test('search offers an explicit port choice for ambiguous matching descriptors', () => {
    const opened = search(output);
    const ports = [{ portId: 'body', dir: 'in', kind: 'text', label: 'Body' }, { portId: 'instructions', dir: 'in', kind: 'text', label: 'Instructions' }];
    const ambiguous = choose(opened.state, { matchingPorts: ports });
    assert.equal(ambiguous.state.kind, 'port-choice');
    assert.deepEqual(ambiguous.effects, [{ type: 'open-port-choice', capture: opened.state.capture, choice: 'repair', ports, screenAnchor: { x: 600, y: 320 } }]);
    const unknown = transitionNativeGesture(ambiguous.state, { type: 'choose-port', capture: ambiguous.state.capture, current: true, portId: 'fabricated' });
    assert.equal(unknown.state, ambiguous.state);
    assert.equal(unknown.effects.length, 0);
    ports[1].portId = 'mutated';
    const selected = transitionNativeGesture(ambiguous.state, { type: 'choose-port', capture: ambiguous.state.capture, current: true, portId: 'instructions' });
    assert.equal(selected.state.kind, 'idle');
    assert.deepEqual(selected.effects[0].command, { kind: 'create-connect', choice: 'repair', portId: 'instructions', origin: output, graphPoint: { x: 99.25, y: 75.5 } });
});

test('context sensitive off creates an incompatible choice unconnected', () => {
    const opened = search(input);
    const incompatible = choose(opened.state, { choice: 'source-free', matchingPorts: [] });
    assert.equal(incompatible.state.kind, 'search');
    assert.deepEqual(incompatible.effects, [{ type: 'feedback', reason: 'No compatible port' }]);
    const selected = choose(opened.state, { choice: 'source-free', matchingPorts: [], contextSensitive: false });
    assert.deepEqual(selected.effects[0].command, { kind: 'create-unconnected', choice: 'source-free', graphPoint: { x: 99.25, y: 75.5 } });
    assert.equal(selected.state.kind, 'idle');
});

test('pin release pending validation retains the exact drop point and survives expected capture loss', () => {
    const started = begin(output);
    const pending = release(started.state, { kind: 'pin', pin: input });
    assert.equal(pending.state.kind, 'drag');
    assert.equal(pending.state.released, true);
    assert.deepEqual(pending.state.graphPoint, { x: 99.25, y: 75.5 });
    assert.deepEqual(pending.effects.map(effect => effect.type), ['release-pointer', 'validate-target']);
    const lost = transitionNativeGesture(pending.state, { type: 'capture-lost', pointerId: 7 });
    assert.equal(lost.state.kind, 'drag');
    assert.equal(lost.effects.length, 0);
    const selected = accept(lost.state);
    assert.equal(selected.state.kind, 'idle');
    assert.deepEqual(selected.effects.map(effect => effect.type), ['prepare-command', 'clear-draft']);
    assert.equal(selected.effects[0].command.to.portId, 'prompt');
});

test('a new pin on release cannot reuse the last validated pin feedback', () => {
    const first = accept(move(begin(output).state, input).state);
    const other = { ...input, nodeId: 'other', address: { ...input.address, nodeId: 'other' } };
    const pending = release(first.state, { kind: 'pin', pin: other });
    assert.equal(pending.state.feedback, null);
    assert.equal(pending.state.released, true);
    assert.equal(pending.effects.some(effect => effect.type === 'prepare-command'), false);
    const rejected = accept(pending.state, { compatible: false, reason: 'Input phase differs' });
    assert.equal(rejected.state.kind, 'idle');
    assert.deepEqual(rejected.effects, [{ type: 'feedback', reason: 'Input phase differs' }, { type: 'clear-draft' }]);
});

test('expected release-to-search capture cleanup is consumed once', () => {
    const opened = search(output);
    const lost = transitionNativeGesture(opened.state, { type: 'capture-lost', pointerId: 7 });
    assert.equal(lost.state.kind, 'search');
    assert.equal(lost.effects.length, 0);
    const unexpected = transitionNativeGesture(lost.state, { type: 'capture-lost', pointerId: 7 });
    assert.equal(unexpected.state.kind, 'idle');
    assert.deepEqual(unexpected.effects, [{ type: 'close-search' }, { type: 'clear-draft' }]);
});

test('external operation view and document freshness rejects only the captured pending gesture', () => {
    for (const reason of ['operation', 'view', 'document']) {
        const pending = release(begin(output).state, { kind: 'pin', pin: input });
        const stale = accept(pending.state, { current: false, reason });
        assert.equal(stale.state.kind, 'idle', reason);
        assert.equal(stale.effects.some(effect => effect.type === 'prepare-command'), false);
        const opened = search(output);
        const staleChoice = choose(opened.state, { current: false });
        assert.equal(staleChoice.state.kind, 'idle', reason);
        assert.deepEqual(staleChoice.effects, [{ type: 'close-search' }, { type: 'clear-draft' }]);
    }
});

test('a stale result for a prior capture cannot clear a newer drag or chooser', () => {
    const old = move(begin(output).state, input);
    const newer = move(begin(input).state, output);
    const late = transitionNativeGesture(newer.state, { type: 'target-result', capture: old.state.capture, requestId: old.state.requestId, current: false, compatible: true });
    assert.equal(late.state, newer.state);
    const opened = search(output);
    const oldChoice = choose(opened.state, { capture: old.state.capture, current: false });
    assert.equal(oldChoice.state, opened.state);
    assert.equal(oldChoice.effects.length, 0);
});

test('release must match the capture and fresh authority before preparing a command', () => {
    const validated = accept(move(begin(output).state, input).state);
    const wrongCapture = release(validated.state, { kind: 'pin', pin: input }, { capture: {} });
    assert.equal(wrongCapture.state, validated.state);
    const stale = release(validated.state, { kind: 'pin', pin: input }, { current: false });
    assert.equal(stale.state.kind, 'idle');
    assert.equal(stale.effects.some(effect => effect.type === 'prepare-command'), false);
    const missing = release(validated.state, { kind: 'pin', pin: input }, { current: undefined });
    assert.equal(missing.state.kind, 'idle');
});

test('read-only or stale initiation never captures a pointer', () => {
    assert.deepEqual(begin(output, {}, { current: false }), { state: { kind: 'idle', altGuard: null }, effects: [] });
    assert.equal(begin(output, {}, { current: undefined }).state.kind, 'idle');
});

test('Escape pointercancel blur view change and chooser dismissal clear fresh pending gestures', () => {
    for (const type of ['escape', 'pointercancel', 'blur', 'view-change', 'dismiss-search', 'cancel']) {
        const opened = search(output);
        const result = transitionNativeGesture(opened.state, { type });
        assert.equal(result.state.kind, 'idle', type);
        assert.deepEqual(result.effects, [{ type: 'close-search' }, { type: 'clear-draft' }]);
        const started = begin(input, {}, { ctrl: true, originalBindings: [{ kind: 'direct', id: 'kept' }] });
        const stopped = transitionNativeGesture(started.state, { type });
        assert.equal(stopped.state.kind, 'idle', type);
        assert.deepEqual(stopped.effects, [{ type: 'release-pointer', pointerId: 7, expected: true }, { type: 'clear-draft' }]);
        assert.deepEqual(started.state.originalBindings, [{ kind: 'direct', id: 'kept' }]);
    }
});

test('unexpected capture loss cancels a drag regardless of buttons and mismatched pointer loss is ignored', () => {
    const started = begin(output);
    const other = transitionNativeGesture(started.state, { type: 'capture-lost', pointerId: 99 });
    assert.equal(other.state, started.state);
    const lost = transitionNativeGesture(started.state, { type: 'capture-lost', pointerId: 7, buttons: 0 });
    assert.equal(lost.state.kind, 'idle');
    assert.equal(lost.effects.some(effect => effect.type === 'prepare-command'), false);
});

test('chooser explicit port result requires current matching capture', () => {
    const opened = choose(search(output).state, { matchingPorts: [{ portId: 'body', dir: 'in', kind: 'text' }, { portId: 'instructions', dir: 'in', kind: 'text' }] });
    const wrong = transitionNativeGesture(opened.state, { type: 'choose-port', capture: {}, current: false, portId: 'body' });
    assert.equal(wrong.state, opened.state);
    const stale = transitionNativeGesture(opened.state, { type: 'choose-port', capture: opened.state.capture, current: false, portId: 'body' });
    assert.equal(stale.state.kind, 'idle');
    assert.equal(stale.effects.some(effect => effect.type === 'prepare-command'), false);
});

test('rapid Alt double click retains the first cable identity and cannot delete the exposed neighbor', () => {
    const capture = {};
    const first = transitionNativeGesture(undefined, { type: 'activate-target', alt: true, target: { kind: 'wire', id: 'wire-1' }, timestamp: 100, capture, current: true });
    assert.equal(first.state.kind, 'idle');
    assert.deepEqual(first.effects, [{ type: 'prepare-command', capture, command: { kind: 'disconnect-wire', wireId: 'wire-1' } }]);
    assert.deepEqual(first.state.altGuard.target, { kind: 'wire', id: 'wire-1' });
    const second = transitionNativeGesture(first.state, { type: 'activate-target', alt: true, target: { kind: 'wire', id: 'neighbor' }, timestamp: 150, capture, current: true });
    assert.equal(second.state, first.state);
    assert.deepEqual(second.effects, [{ type: 'consume', reason: 'rapid-alt-sequence', target: { kind: 'wire', id: 'wire-1' } }]);
    const doubled = transitionNativeGesture(second.state, { type: 'wire-double-click', wireId: 'neighbor', direct: true, graphPoint: { x: 2.25, y: 3.5 }, timestamp: 155, capture, current: true });
    assert.deepEqual(doubled.effects, [{ type: 'consume', reason: 'rapid-alt-sequence', target: { kind: 'wire', id: 'wire-1' } }]);
    const later = transitionNativeGesture(doubled.state, { type: 'activate-target', alt: true, target: { kind: 'wire', id: 'neighbor' }, timestamp: 701, capture, current: true });
    assert.equal(later.effects[0].command.wireId, 'neighbor');
});

test('Alt pin disconnect projects all supplied attachments without allocating or removing them', () => {
    const capture = {};
    const originals = [{ kind: 'direct', id: 'wire-1' }, { kind: 'portal-publisher', id: 'publisher-1', portalId: 'portal-1' }];
    const first = transitionNativeGesture(undefined, { type: 'activate-target', alt: true, target: { kind: 'pin', pin: output }, originalBindings: originals, timestamp: 100, capture, current: true });
    assert.deepEqual(first.effects[0], { type: 'prepare-command', capture, command: { kind: 'disconnect-pin', pin: output, originalBindings: originals } });
    const second = transitionNativeGesture(first.state, { type: 'activate-target', alt: true, target: { kind: 'pin', pin: input }, originalBindings: [], timestamp: 120, capture, current: true });
    assert.deepEqual(second.effects, [{ type: 'consume', reason: 'rapid-alt-sequence', target: { kind: 'pin', pin: output } }]);
    assert.deepEqual(originals, [{ kind: 'direct', id: 'wire-1' }, { kind: 'portal-publisher', id: 'publisher-1', portalId: 'portal-1' }]);
});

test('plain direct wire double click prepares reroute at the exact captured graph point', () => {
    const capture = {};
    const reroute = transitionNativeGesture(undefined, { type: 'wire-double-click', wireId: 'wire-1', direct: true, graphPoint: { x: 2.25, y: 3.5 }, timestamp: 2000, capture, current: true });
    assert.deepEqual(reroute.effects, [{ type: 'prepare-command', capture, command: { kind: 'reroute', wireId: 'wire-1', graphPoint: { x: 2.25, y: 3.5 } } }]);
    for (const extra of [{ direct: false }, { current: false }, { alt: true }, { ctrl: true }, { shift: true }]) {
        const blocked = transitionNativeGesture(undefined, { type: 'wire-double-click', wireId: 'wire-1', direct: true, graphPoint: { x: 2.25, y: 3.5 }, timestamp: 2000, capture, current: true, ...extra });
        assert.equal(blocked.effects.some(effect => effect.type === 'prepare-command'), false);
    }
});

test('Alt guard expires by supplied time and fresh cancellation clears it', () => {
    const first = transitionNativeGesture(undefined, { type: 'activate-target', alt: true, target: { kind: 'wire', id: 'wire-1' }, timestamp: 100, capture: {}, current: true });
    const cancelled = transitionNativeGesture(first.state, { type: 'blur' });
    assert.equal(cancelled.state.altGuard, null);
    const later = transitionNativeGesture(first.state, { type: 'wire-double-click', wireId: 'wire-2', direct: true, graphPoint: { x: 2.25, y: 3.5 }, timestamp: 601, capture: {}, current: true });
    assert.equal(later.effects[0].command.kind, 'reroute');
    assert.equal(later.state.altGuard, null);
});

test('malformed nonfinite or genuinely excessive public DTOs cannot start or complete gestures', () => {
    const excessiveId = 'x'.repeat(2000001);
    for (const pin of [{ ...output, center: { x: Infinity, y: 0 } }, { ...output, nodeId: excessiveId, address: { ...output.address, nodeId: excessiveId } }, { ...output, address: { ...output.address, instancePath: Array(9).fill('child') } }, { ...output, dir: 'tie' }, { ...output, center: null }, { ...output, address: { ...output.address, portId: 'different' } }]) {
        const result = begin(pin);
        assert.equal(result.state.kind, 'idle');
        assert.equal(result.effects.length, 0);
    }
    assert.equal(begin(output, {}, { originalBindings: Array(20001).fill({ kind: 'direct', id: 'wire' }) }).state.kind, 'idle');
    const started = begin(output);
    const invalidRelease = release(started.state, { kind: 'empty' }, { graphPoint: { x: NaN, y: 0 } });
    assert.equal(invalidRelease.effects.some(effect => effect.type === 'open-search'), false);
    const opened = search(output);
    for (const matchingPorts of [Array.from({ length: 1001 }, (_, index) => ({ portId: `port-${index}`, dir: 'in', kind: 'text' })), [{ portId: 'body', dir: 'in', kind: 'text', nodeId: 'invented' }], [{ portId: 'body', dir: 'in', kind: 'text' }, { portId: 'body', dir: 'in', kind: 'text' }]]) {
        assert.equal(choose(opened.state, { matchingPorts }).effects.length, 0);
    }
    assert.equal(transitionNativeGesture(undefined, { type: 'wire-double-click', wireId: 'wire', direct: true, graphPoint: { x: -Infinity, y: 0 }, timestamp: 0, current: true, capture: {} }).effects.length, 0);
});

test('unsupported projections and accessors are rejected without invoking getters', () => {
    let reads = 0;
    const getter = () => { reads++; throw new Error('must not read'); };
    const pin = { ...output, center: Object.defineProperty({ y: 20 }, 'x', { get: getter, enumerable: true }) };
    assert.equal(begin(pin).state.kind, 'idle');
    const event = Object.defineProperty({}, 'type', { get: getter, enumerable: true });
    assert.equal(transitionNativeGesture(undefined, event).state.kind, 'idle');
    const binding = Object.defineProperty({ kind: 'direct' }, 'id', { get: getter, enumerable: true });
    assert.equal(begin(output, {}, { originalBindings: [binding] }).state.kind, 'idle');
    const bindings = [];
    Object.defineProperty(bindings, '0', { get: getter, enumerable: true });
    assert.equal(begin(output, {}, { originalBindings: bindings }).state.kind, 'idle');
    assert.equal(begin(Object.assign(Object.create({ inherited: true }), output)).state.kind, 'idle');
    const badState = Object.defineProperty({ kind: 'drag' }, 'capture', { get: getter, enumerable: true });
    assert.equal(transitionNativeGesture(badState, { type: 'escape' }).state.kind, 'idle');
    assert.equal(reads, 0);
});

test('opaque private capture identity is retained without cloning or deep reading it', () => {
    const token = Proxy.revocable({}, {});
    token.revoke();
    const started = begin(output, token.proxy);
    assert.equal(started.state.capture, token.proxy);
    const hovered = move(started.state, input);
    assert.equal(hovered.effects[0].capture, token.proxy);
    const result = release(accept(hovered.state).state, { kind: 'pin', pin: input });
    assert.equal(result.effects[1].capture, token.proxy);
});

test('qualified pin identity prevents feedback from a different instance address being reused', () => {
    const first = accept(move(begin(output).state, input).state);
    const sibling = { ...input, address: { ...input.address, instancePath: ['sibling'] } };
    const next = move(first.state, sibling);
    assert.equal(next.state.feedback, null);
    assert.equal(next.effects[0].type, 'validate-target');
    assert.deepEqual(next.effects[0].target.address.instancePath, ['sibling']);
});

test('state transitions and effect projections never mutate retained pin or binding DTOs', () => {
    const originals = [{ kind: 'direct', id: 'wire-1' }];
    const started = begin(output, {}, { ctrl: true, originalBindings: originals });
    const target = { ...output, nodeId: 'replacement', address: { ...output.address, nodeId: 'replacement' } };
    Object.freeze(started.state.origin.center);
    Object.freeze(started.state.origin.address.instancePath);
    Object.freeze(started.state.origin.address);
    Object.freeze(started.state.origin);
    Object.freeze(started.state.originalBindings[0]);
    Object.freeze(started.state.originalBindings);
    Object.freeze(started.state);
    const hovered = move(started.state, target);
    hovered.effects[0].origin.center.x = 999;
    hovered.effects[0].originalBindings[0].id = 'mutated-effect';
    assert.equal(hovered.state.origin.center.x, 10);
    assert.equal(hovered.state.originalBindings[0].id, 'wire-1');
    assert.equal(started.state.target, null);
});

test('another pointer release cannot cancel or finish the owner even with stale freshness', () => {
    const validated = accept(move(begin(output).state, input).state);
    const other = release(validated.state, { kind: 'pin', pin: input }, { pointerId: 99, current: false });
    assert.equal(other.state, validated.state);
    assert.deepEqual(other.effects, []);
});

test('Ctrl empty release cancels without requiring a popup screen anchor', () => {
    const started = begin(input, {}, { ctrl: true, originalBindings: [{ kind: 'direct', id: 'original' }] });
    const finished = release(started.state, { kind: 'empty' }, { screenAnchor: undefined });
    assert.equal(finished.state.kind, 'idle');
    assert.deepEqual(finished.effects, [{ type: 'release-pointer', pointerId: 7, expected: true }, { type: 'clear-draft' }]);
});

test('unsupported optional binding and retained state data cannot cross the plain DTO boundary', () => {
    const malformedPublisher = [{ kind: 'portal-publisher', portalId: 'portal-1', id: { nested: 'unsupported' } }];
    assert.equal(begin(output, {}, { originalBindings: malformedPublisher }).state.kind, 'idle');
    const started = begin(output);
    const oversized = { ...started.state, ports: Array.from({ length: 1001 }, (_, index) => ({ portId: `port-${index}`, dir: 'in', kind: 'text' })) };
    assert.equal(transitionNativeGesture(oversized, { type: 'escape' }).state.kind, 'idle');
    assert.deepEqual(transitionNativeGesture(oversized, { type: 'escape' }).effects, []);
    const idleWithUnsupportedData = { kind: 'idle', altGuard: null, ports: [{ arbitrary: {} }] };
    assert.deepEqual(transitionNativeGesture(idleWithUnsupportedData, { type: 'unrelated' }), { state: { kind: 'idle', altGuard: null }, effects: [] });
});

const sourceGraph = (workflowId = 'source-workflow', sourceId = 'source') => ({ id: workflowId, schema: 3, runtime: 2, mode: 'native-pre', nodes: { [sourceId]: { id: sourceId, type: 'workflow', operation: 'scene-context' } }, wires: {}, portals: {}, definitions: {} });
const actualPin = (graph, nodeId, portId, instancePath = []) => {
    const port = portsForNode(graph, graph.nodes[nodeId]).find(port => port.id === portId);
    return { nodeId, portId: port.id, dir: port.direction === 'input' ? 'in' : 'out', kind: port.kind, center: { x: 10.25, y: 20.5 }, address: { workflowId: graph.id, instancePath, nodeId, portId: port.id } };
};
const manyInputDefinition = (count, suffix = '') => {
    const draft = { id: `definition-${suffix}`, version: 1, name: 'Optional inputs', interface: [], parameters: [], body: { schema: 3, runtime: 2, mode: 'native-pre', nodes: {}, wires: {} } };
    for (let index = 0; index < count; index++) {
        const id = `port-${index}-${suffix}`, boundaryNodeId = `boundary-${index}`;
        draft.interface.push({ id, label: `Input ${index} ${suffix}`, direction: 'input', kind: 'context', required: false, cardinality: 'one', boundaryNodeId });
        draft.body.nodes[boundaryNodeId] = { id: boundaryNodeId, type: 'subgraph-input', interfacePortId: id };
    }
    const identity = computeDefinitionIdentity(draft);
    assert.equal(identity.ok, true);
    const definition = { ...structuredClone(identity.data.materializedDefinition), semanticHash: identity.data.semanticHash };
    assert.equal(validateDefinition(definition, {}).ok, true);
    return definition;
};

test('source-admitted long Unicode workflow node path port and command identities remain exact', () => {
    const longId = `id-${'雪🌈'.repeat(257)}`;
    const graph = sourceGraph(longId, `node-${longId}`);
    assert.equal(validateGraphStructure(graph).ok, true);
    const origin = actualPin(graph, `node-${longId}`, 'out');
    const started = begin(origin);
    assert.equal(started.state.kind, 'drag');
    assert.deepEqual(started.state.origin.address, origin.address);
    const definition = manyInputDefinition(1, longId);
    const instanceId = `instance-${longId}`;
    graph.definitions[definitionRefKey(definition)] = definition;
    graph.nodes[instanceId] = { id: instanceId, type: 'subgraph', definition: { id: definition.id, version: 1, semanticHash: definition.semanticHash }, parameterOverrides: {}, roleOverrides: {}, nodeBindingOverrides: {} };
    assert.equal(validateGraphStructure(graph).ok, true);
    const target = actualPin(graph, instanceId, definition.interface[0].id);
    const finished = release(accept(move(started.state, target).state).state, { kind: 'pin', pin: target });
    assert.equal(finished.effects[1].command.to.portId, definition.interface[0].id);
    const boundary = actualPin({ ...definition.body, id: graph.id, interface: definition.interface }, 'boundary-0', 'out', [instanceId]);
    const child = begin(boundary);
    assert.equal(child.state.kind, 'drag');
    assert.deepEqual(child.state.origin.address.instancePath, [instanceId]);
    const chosen = choose(search(origin).state, { choice: definition.id, matchingPorts: [{ portId: target.portId, dir: target.dir, kind: target.kind, label: definition.interface[0].label }] });
    assert.equal(chosen.effects[0].command.choice, definition.id);
    assert.equal(chosen.effects[0].command.portId, target.portId);
});

test('source-admitted 2001 portal publishers plus direct and portal consumers can move or Alt disconnect', () => {
    const graph = sourceGraph();
    for (let index = 0; index < 2001; index++) {
        const id = `publisher-${index}`;
        graph.portals[id] = { id, label: id, kind: 'context', source: { nodeId: 'source', portId: 'out' } };
    }
    graph.nodes.directSink = { id: 'directSink', type: 'workflow', operation: 'smart-compactor' };
    graph.nodes.portalSink = { id: 'portalSink', type: 'workflow', operation: 'smart-compactor' };
    graph.wires.direct = { id: 'direct', route: 'wire', from: 'source', fromPort: 'out', to: 'directSink', toPort: 'in' };
    graph.wires.consumer = { id: 'consumer', route: 'portal', portalId: 'publisher-0', to: 'portalSink', toPort: 'in' };
    assert.equal(validateGraphStructure(graph).ok, true);
    const originals = [{ kind: 'direct', id: 'direct' }, { kind: 'portal', id: 'consumer', portalId: 'publisher-0' }, ...Object.values(graph.portals).map(portal => ({ kind: 'portal-publisher', id: portal.id, portalId: portal.id }))];
    const origin = actualPin(graph, 'source', 'out');
    const started = begin(origin, {}, { ctrl: true, originalBindings: originals });
    assert.equal(started.state.mode, 'move-output');
    assert.equal(started.state.originalBindings.length, 2003);
    const alt = transitionNativeGesture(undefined, { type: 'activate-target', target: { kind: 'pin', pin: origin }, originalBindings: originals, timestamp: 100, current: true, capture: {}, alt: true });
    assert.equal(alt.effects[0].command.kind, 'disconnect-pin');
    assert.deepEqual(alt.effects[0].command.originalBindings, originals);
});

test('source-admitted 257 optional interface ports open explicit choice and select the actual final port', () => {
    const definition = manyInputDefinition(257);
    const graph = sourceGraph();
    graph.definitions[definitionRefKey(definition)] = definition;
    graph.nodes.instance = { id: 'instance', type: 'subgraph', definition: { id: definition.id, version: 1, semanticHash: definition.semanticHash }, parameterOverrides: {}, roleOverrides: {}, nodeBindingOverrides: {} };
    assert.equal(validateGraphStructure(graph).ok, true);
    const origin = actualPin(graph, 'source', 'out');
    const matchingPorts = portsForNode(graph, graph.nodes.instance).map(port => ({ portId: port.id, dir: 'in', kind: port.kind, label: port.label }));
    const selected = choose(search(origin).state, { choice: definition.id, matchingPorts });
    assert.equal(selected.state.kind, 'port-choice');
    assert.equal(selected.effects[0].ports.length, 257);
    const finalPort = matchingPorts[256].portId;
    const finished = transitionNativeGesture(selected.state, { type: 'choose-port', capture: selected.state.capture, current: true, portId: finalPort });
    assert.equal(finished.effects[0].command.portId, finalPort);
});

test('five empty live moves reuse stable projections without per-binding descriptor reads', () => {
    const originals = Array.from({ length: 2003 }, (_, index) => ({ kind: index < 2 ? 'direct' : 'portal-publisher', id: `attachment-${index}` }));
    let state = begin(output, {}, { ctrl: true, originalBindings: originals }).state;
    const retained = state.originalBindings, origin = state.origin;
    const watched = new Set(retained);
    const descriptor = Object.getOwnPropertyDescriptor;
    let fieldReads = 0;
    const reused = [], reusedOrigins = [];
    Object.getOwnPropertyDescriptor = (value, key) => { if (watched.has(value)) fieldReads++; return descriptor(value, key); };
    try {
        for (let index = 0; index < 5; index++) {
            const result = transitionNativeGesture(state, { type: 'pointer-move', pointerId: 7, graphPoint: { x: index + 0.25, y: index + 0.5 }, hit: { kind: 'empty' } });
            state = result.state;
            reused.push(state.originalBindings === retained);
            reusedOrigins.push(state.origin === origin);
            for (const binding of state.originalBindings) watched.add(binding);
            assert.deepEqual(result.effects, []);
        }
    } finally { Object.getOwnPropertyDescriptor = descriptor; }
    assert.equal(fieldReads, 0);
    assert.deepEqual(reused, [true, true, true, true, true]);
    assert.deepEqual(reusedOrigins, [true, true, true, true, true]);
});

test('produced states and static projections are deeply immutable while private capture remains untouched', () => {
    const capture = { privatePayload: 'x'.repeat(9 * 1024 * 1024) };
    const started = begin(output, capture, { ctrl: true, originalBindings: [{ kind: 'direct', id: 'original' }] });
    for (const value of [started.state, started.state.origin, started.state.origin.center, started.state.origin.address, started.state.origin.address.instancePath, started.state.originalBindings, started.state.originalBindings[0], started.state.ghost]) assert.equal(Object.isFrozen(value), true);
    assert.throws(() => { started.state.originalBindings[0].id = 'changed'; }, TypeError);
    assert.equal(Object.isFrozen(capture), false);
    capture.newPrivateField = 'still writable';
    assert.equal(started.state.capture, capture);
});

test('foreign valid state is detached once and then reused without revalidating foreign or admitted refs', () => {
    const started = begin(output, {}, { ctrl: true, originalBindings: [{ kind: 'direct', id: 'original' }] });
    const foreign = { ...started.state, origin: structuredClone(started.state.origin), originalBindings: [{ kind: 'direct', id: 'foreign' }], ghost: { ...started.state.ghost } };
    const descriptor = Object.getOwnPropertyDescriptor;
    const watched = new Set(foreign.originalBindings);
    let fieldReads = 0;
    Object.getOwnPropertyDescriptor = (value, key) => { if (watched.has(value)) fieldReads++; return descriptor(value, key); };
    let adopted;
    try { adopted = transitionNativeGesture(foreign, { type: 'pointer-move', pointerId: 7, graphPoint: { x: 30, y: 40 }, hit: { kind: 'empty' } }); }
    finally { Object.getOwnPropertyDescriptor = descriptor; }
    assert.equal(fieldReads > 0, true);
    assert.notEqual(adopted.state.originalBindings, foreign.originalBindings);
    assert.equal(Object.isFrozen(adopted.state.originalBindings), true);
    foreign.originalBindings[0].id = 'mutated-foreign';
    foreign.origin.center.x = 999;
    assert.equal(adopted.state.originalBindings[0].id, 'foreign');
    assert.equal(adopted.state.origin.center.x, 10);
    const next = transitionNativeGesture(adopted.state, { type: 'pointer-move', pointerId: 7, graphPoint: { x: 31, y: 41 }, hit: { kind: 'empty' } });
    assert.equal(next.state.originalBindings, adopted.state.originalBindings);
    assert.equal(next.state.origin, adopted.state.origin);
});

test('retained port choice arrays are immutable and reused through capture cleanup with isolated effects', () => {
    const matchingPorts = Array.from({ length: 257 }, (_, index) => ({ portId: `port-${index}`, dir: 'in', kind: 'context', label: `Input ${index}` }));
    const selected = choose(search(output).state, { matchingPorts });
    assert.equal(Object.isFrozen(selected.state.ports), true);
    assert.equal(Object.isFrozen(selected.state.ports[0]), true);
    selected.effects[0].ports[0].portId = 'mutated-effect';
    matchingPorts[0].portId = 'mutated-public';
    assert.equal(selected.state.ports[0].portId, 'port-0');
    const lost = transitionNativeGesture(selected.state, { type: 'capture-lost', pointerId: 7 });
    assert.equal(lost.state.ports, selected.state.ports);
    assert.equal(lost.state.origin, selected.state.origin);
});

test('UTF-8 identity and whole public projection budgets reject genuine excess without counting opaque capture', () => {
    const tooManyBytes = `id-${'雪'.repeat(666667)}`;
    assert.equal(begin({ ...output, nodeId: tooManyBytes, address: { ...output.address, nodeId: tooManyBytes } }).state.kind, 'idle');
    const largeButIndividualValid = '雪'.repeat(600000);
    const oversized = Array.from({ length: 6 }, (_, index) => ({ kind: 'direct', id: `${index}-${largeButIndividualValid}` }));
    const rejected = begin(output, {}, { ctrl: true, originalBindings: oversized });
    assert.equal(rejected.state.kind, 'idle');
    assert.deepEqual(rejected.effects, []);
    const searchState = search(output).state;
    const overBudgetPorts = Array.from({ length: 6 }, (_, index) => ({ portId: `port-${index}`, dir: 'in', kind: 'context', label: largeButIndividualValid }));
    const rejectedChoice = choose(searchState, { matchingPorts: overBudgetPorts });
    assert.equal(rejectedChoice.state, searchState);
    assert.deepEqual(rejectedChoice.effects, []);
});
