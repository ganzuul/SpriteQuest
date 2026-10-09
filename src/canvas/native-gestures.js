// These are gesture projections, not graph validation or edit authority.
const EVENT_FIELDS = ['type', 'pin', 'capture', 'pointerId', 'graphPoint', 'originalBindings', 'current', 'ctrl', 'hit', 'requestId', 'compatible', 'reason', 'screenAnchor', 'choice', 'matchingPorts', 'contextSensitive', 'portId', 'target', 'timestamp', 'alt', 'wireId', 'direct', 'shift', 'meta', 'buttons'];
const STATE_FIELDS = ['kind', 'altGuard', 'mode', 'origin', 'capture', 'pointerId', 'originalBindings', 'ghost', 'target', 'feedback', 'requestId', 'released', 'graphPoint', 'screenAnchor', 'expectedCaptureLoss', 'contextSensitive', 'choice', 'ports'];
const DOCUMENT_BYTES = 2000000;
const PROJECTION_BYTES = 8 * 1024 * 1024;
const encoder = new TextEncoder();
// UTF-8 and whole-projection accounting happens once during admission below.
const text = (value, limit = DOCUMENT_BYTES) => typeof value === 'string' && value.length > 0 && value.length <= limit;
const integer = value => Number.isSafeInteger(value) && value >= 0;
const requireData = valid => { if (!valid) throw new TypeError('Unsupported native gesture projection'); };
const ownedStates = new WeakSet();
const immutableBytes = new WeakMap();

function admittedData(value) {
    const budget = { bytes: 0, strings: new Map() };
    const charge = bytes => { budget.bytes += bytes; requireData(budget.bytes <= PROJECTION_BYTES); };
    const stringBytes = value => {
        if (!budget.strings.has(value)) {
            requireData(encoder.encode(value).length <= DOCUMENT_BYTES);
            budget.strings.set(value, encoder.encode(JSON.stringify(value)).length);
        }
        return budget.strings.get(value);
    };
    const freeze = value => {
        if (typeof value === 'string') { charge(stringBytes(value)); return; }
        if (value === null || typeof value === 'boolean' || typeof value === 'number') { charge(JSON.stringify(value).length); return; }
        const cached = immutableBytes.get(value);
        if (cached !== undefined) { charge(cached); return; }
        const before = budget.bytes;
        if (Array.isArray(value)) {
            charge(2 + Math.max(0, value.length - 1));
            for (const item of value) freeze(item);
        } else {
            // The opaque token is retained by identity, never inspected or frozen.
            const keys = Object.keys(value).filter(key => key !== 'capture' && value[key] !== undefined);
            charge(2 + Math.max(0, keys.length - 1));
            for (const key of keys) { charge(stringBytes(key) + 1); freeze(value[key]); }
        }
        Object.freeze(value);
        immutableBytes.set(value, budget.bytes - before);
    };
    freeze(value);
    return value;
}

function admittedState(value) {
    if (ownedStates.has(value)) return value;
    admittedData(value);
    ownedStates.add(value);
    return value;
}

function record(value, fields) {
    requireData(value !== null && typeof value === 'object');
    const prototype = Object.getPrototypeOf(value);
    requireData(prototype === Object.prototype || prototype === null);
    const keys = Reflect.ownKeys(value);
    requireData(keys.length <= fields.length);
    const result = {};
    for (const key of keys) {
        requireData(typeof key === 'string' && fields.includes(key));
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        requireData(descriptor && Object.hasOwn(descriptor, 'value'));
        result[key] = descriptor.value;
    }
    return result;
}

function array(value, limit, project) {
    requireData(Array.isArray(value) && Object.getPrototypeOf(value) === Array.prototype);
    const length = Object.getOwnPropertyDescriptor(value, 'length')?.value;
    requireData(integer(length) && length <= limit && Reflect.ownKeys(value).length === length + 1);
    const result = [];
    for (let index = 0; index < length; index++) {
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
        requireData(descriptor && Object.hasOwn(descriptor, 'value'));
        result.push(project(descriptor.value));
    }
    return result;
}

function point(value) {
    const p = record(value, ['x', 'y']);
    requireData(Number.isFinite(p.x) && Number.isFinite(p.y));
    return p;
}

function pin(value) {
    const p = record(value, ['nodeId', 'portId', 'dir', 'kind', 'center', 'address']);
    requireData(text(p.nodeId) && text(p.portId) && ['in', 'out'].includes(p.dir) && text(p.kind));
    p.center = point(p.center);
    if (p.address !== undefined) {
        const a = record(p.address, ['workflowId', 'instancePath', 'nodeId', 'portId']);
        requireData(text(a.workflowId) && a.nodeId === p.nodeId && a.portId === p.portId);
        a.instancePath = array(a.instancePath, 8, part => { requireData(text(part)); return part; });
        p.address = a;
    }
    return p;
}

function bindings(value) {
    return array(value, 20000, value => {
        const b = record(value, ['kind', 'id', 'portalId']);
        requireData(['direct', 'portal', 'portal-publisher'].includes(b.kind));
        requireData(b.kind === 'portal-publisher' ? text(b.id) || text(b.portalId) : text(b.id));
        requireData(b.id === undefined || text(b.id));
        requireData(b.portalId === undefined || text(b.portalId));
        return b;
    });
}

function ports(value) {
    const result = array(value, 1000, value => {
        const p = record(value, ['portId', 'dir', 'kind', 'label']);
        requireData(text(p.portId) && ['in', 'out'].includes(p.dir) && text(p.kind) && (p.label === undefined || p.label === '' || text(p.label)));
        return p;
    });
    requireData(new Set(result.map(p => p.portId)).size === result.length);
    return result;
}

function target(value) {
    const t = record(value, ['kind', 'id', 'pin']);
    requireData(t.kind === 'wire' && text(t.id) && t.pin === undefined || t.kind === 'pin' && t.id === undefined);
    if (t.kind === 'pin') t.pin = pin(t.pin);
    return t;
}

function eventData(value) {
    const e = record(value, EVENT_FIELDS);
    requireData(text(e.type, 64));
    for (const key of ['current', 'ctrl', 'compatible', 'contextSensitive', 'alt', 'direct', 'shift', 'meta']) requireData(e[key] === undefined || typeof e[key] === 'boolean');
    for (const key of ['pointerId', 'requestId']) requireData(e[key] === undefined || integer(e[key]));
    requireData(e.buttons === undefined || integer(e.buttons));
    for (const key of ['choice', 'portId', 'wireId']) requireData(e[key] === undefined || text(e[key]));
    requireData(e.reason === undefined || typeof e.reason === 'string' && e.reason.length <= 2048);
    requireData(e.timestamp === undefined || Number.isFinite(e.timestamp) && e.timestamp >= 0 && e.timestamp <= Number.MAX_SAFE_INTEGER - 500);
    if (e.pin !== undefined) e.pin = pin(e.pin);
    if (e.graphPoint !== undefined) e.graphPoint = point(e.graphPoint);
    if (e.screenAnchor !== undefined) e.screenAnchor = point(e.screenAnchor);
    if (e.originalBindings !== undefined) e.originalBindings = bindings(e.originalBindings);
    if (e.matchingPorts !== undefined) e.matchingPorts = ports(e.matchingPorts);
    if (e.target !== undefined) e.target = target(e.target);
    if (e.hit !== undefined) {
        e.hit = record(e.hit, ['kind', 'pin']);
        requireData(['pin', 'empty', 'body', 'outside', 'surface'].includes(e.hit.kind));
        if (e.hit.kind === 'pin') e.hit.pin = pin(e.hit.pin);
        else requireData(e.hit.pin === undefined);
    }
    return e;
}

function stateData(value) {
    if (ownedStates.has(value)) return value;
    if (value == null) return idle();
    const s = record(value, STATE_FIELDS);
    requireData(['idle', 'drag', 'search', 'port-choice'].includes(s.kind));
    if (s.altGuard != null) {
        s.altGuard = record(s.altGuard, ['target', 'timestamp', 'until']);
        requireData(Number.isFinite(s.altGuard.timestamp) && s.altGuard.timestamp >= 0 && s.altGuard.until === s.altGuard.timestamp + 500);
        s.altGuard.target = target(s.altGuard.target);
    } else s.altGuard = null;
    if (s.kind === 'idle') { requireData(Object.keys(s).every(key => ['kind', 'altGuard'].includes(key))); return s; }
    requireData(['connect', 'move-input', 'move-output'].includes(s.mode) && s.capture != null && integer(s.pointerId) && integer(s.requestId) && typeof s.released === 'boolean');
    s.origin = pin(s.origin);
    s.originalBindings = bindings(s.originalBindings);
    s.ghost = point(s.ghost);
    s.target = s.target == null ? null : pin(s.target);
    if (s.feedback != null) {
        s.feedback = record(s.feedback, ['compatible', 'reason']);
        requireData(typeof s.feedback.compatible === 'boolean' && (s.feedback.reason === undefined || typeof s.feedback.reason === 'string' && s.feedback.reason.length <= 2048));
    } else s.feedback = null;
    requireData(s.expectedCaptureLoss === undefined || typeof s.expectedCaptureLoss === 'boolean');
    requireData(s.contextSensitive === undefined || typeof s.contextSensitive === 'boolean');
    requireData(s.choice === undefined || text(s.choice));
    if (s.graphPoint !== undefined) s.graphPoint = point(s.graphPoint);
    if (s.screenAnchor !== undefined) s.screenAnchor = point(s.screenAnchor);
    if (s.ports !== undefined) s.ports = ports(s.ports);
    if (['search', 'port-choice'].includes(s.kind)) {
        requireData(s.released && s.mode === 'connect' && typeof s.contextSensitive === 'boolean');
        s.graphPoint = point(s.graphPoint);
        s.screenAnchor = point(s.screenAnchor);
    }
    if (s.kind === 'port-choice') { requireData(text(s.choice)); s.ports = ports(s.ports); }
    return s;
}

const idle = altGuard => ({ kind: 'idle', altGuard: altGuard ?? null });
const pinCopy = pin => ({ ...pin, center: { ...pin.center }, ...(pin.address ? { address: { ...pin.address, instancePath: [...pin.address.instancePath] } } : {}) });
const samePin = (a, b) => a.nodeId === b.nodeId && a.portId === b.portId && a.dir === b.dir
    && (a.address === b.address || a.address && b.address && a.address.workflowId === b.address.workflowId
        && a.address.instancePath.length === b.address.instancePath.length
        && a.address.instancePath.every((part, index) => part === b.address.instancePath[index]));
const validation = state => ({ type: 'validate-target', capture: state.capture, requestId: state.requestId, mode: state.mode, origin: pinCopy(state.origin), target: pinCopy(state.target), originalBindings: state.originalBindings.map(binding => ({ ...binding })) });
const releaseEffects = state => state.released ? [] : [{ type: 'release-pointer', pointerId: state.pointerId, expected: true }];
const altTargetCopy = target => target.kind === 'wire' ? { kind: 'wire', id: target.id } : { kind: 'pin', pin: pinCopy(target.pin) };

function connected(state) {
    const from = state.origin.dir === 'out' ? state.origin : state.target;
    const to = state.origin.dir === 'in' ? state.origin : state.target;
    return { state: idle(state.altGuard), effects: [
        ...releaseEffects(state),
        { type: 'prepare-command', capture: state.capture, command: state.mode === 'connect'
            ? { kind: 'connect', from: pinCopy(from), to: pinCopy(to), originalBindings: state.originalBindings.map(binding => ({ ...binding })) }
            : { kind: state.mode, origin: pinCopy(state.origin), target: pinCopy(state.target), originalBindings: state.originalBindings.map(binding => ({ ...binding })) } },
        { type: 'clear-draft' },
    ] };
}

function cancelled(state, reason) {
    return { state: idle(state.altGuard), effects: [
        ...releaseEffects(state),
        ...(['search', 'port-choice'].includes(state.kind) ? [{ type: 'close-search' }] : []),
        ...(reason ? [{ type: 'feedback', reason }] : []),
        { type: 'clear-draft' },
    ] };
}

function created(state, portId) {
    return { state: idle(state.altGuard), effects: [
        { type: 'prepare-command', capture: state.capture, command: portId
            ? { kind: 'create-connect', choice: state.choice, portId, origin: pinCopy(state.origin), graphPoint: { ...state.graphPoint } }
            : { kind: 'create-unconnected', choice: state.choice, graphPoint: { ...state.graphPoint } } },
        { type: 'close-search' },
        { type: 'clear-draft' },
    ] };
}

function reduce(state, event) {
    if (['escape', 'pointercancel', 'blur', 'view-change', 'dismiss-search', 'cancel'].includes(event.type)) return state.kind === 'idle' ? { state: idle(), effects: [] } : cancelled({ ...state, altGuard: null });
    if (state.kind === 'idle' && ['activate-target', 'wire-double-click'].includes(event.type)) {
        if (state.altGuard && event.timestamp >= state.altGuard.timestamp && event.timestamp <= state.altGuard.until) return { state, effects: [{ type: 'consume', reason: 'rapid-alt-sequence', target: altTargetCopy(state.altGuard.target) }] };
        const next = state.altGuard ? idle() : state;
        if (event.current !== true) return { state: next, effects: [] };
        if (event.type === 'activate-target' && event.alt) {
            const target = event.target;
            const command = target.kind === 'wire' ? { kind: 'disconnect-wire', wireId: target.id } : { kind: 'disconnect-pin', pin: pinCopy(target.pin), originalBindings: event.originalBindings.map(binding => ({ ...binding })) };
            return { state: idle({ target, timestamp: event.timestamp, until: event.timestamp + 500 }), effects: [{ type: 'prepare-command', capture: event.capture, command }] };
        }
        if (event.type === 'wire-double-click' && event.direct && !event.alt && !event.ctrl && !event.shift && !event.meta) return { state: next, effects: [{ type: 'prepare-command', capture: event.capture, command: { kind: 'reroute', wireId: event.wireId, graphPoint: { ...event.graphPoint } } }] };
        return { state: next, effects: [] };
    }
    if (['release', 'target-result', 'choose-node', 'choose-port'].includes(event.type)) {
        const eligible = event.type === 'release' ? state.kind === 'drag' && !state.released && event.pointerId === state.pointerId
            : event.type === 'target-result' ? state.kind === 'drag' && state.target !== null
                : event.type === 'choose-node' ? state.kind === 'search' : state.kind === 'port-choice';
        if (!eligible) return { state, effects: [] };
        if (state.kind === 'idle' || event.capture !== state.capture || (event.type === 'target-result' && event.requestId !== state.requestId)) return { state, effects: [] };
        if (event.current !== true) return cancelled(state);
    }
    if (event.type === 'begin-pin' && state.kind === 'idle') {
        if (event.current !== true) return { state, effects: [] };
        const mode = event.ctrl && event.originalBindings.length ? event.pin.dir === 'in' ? 'move-input' : 'move-output' : 'connect';
        return { state: { kind: 'drag', altGuard: state.altGuard, mode, origin: event.pin, capture: event.capture, pointerId: event.pointerId, originalBindings: event.originalBindings, ghost: event.graphPoint, target: null, feedback: null, requestId: 0, released: false }, effects: [{ type: 'capture-pointer', pointerId: event.pointerId }] };
    }
    if (state.kind === 'drag' && !state.released && event.type === 'pointer-move' && event.pointerId === state.pointerId) {
        if (event.hit.kind === 'pin' && (!state.target || !samePin(state.target, event.hit.pin))) {
            const next = { ...state, ghost: event.graphPoint, target: event.hit.pin, feedback: null, requestId: state.requestId + 1 };
            return { state: next, effects: [validation(next)] };
        }
        return { state: { ...state, ghost: event.graphPoint, ...(event.hit.kind !== 'pin' ? { target: null, feedback: null, requestId: state.requestId + 1 } : {}) }, effects: [] };
    }
    if (state.kind === 'drag' && state.target && event.type === 'target-result' && event.capture === state.capture && event.requestId === state.requestId) {
        const next = { ...state, feedback: { compatible: event.compatible, ...(event.reason ? { reason: event.reason } : {}) } };
        return state.released ? event.compatible ? connected(next) : cancelled(next, event.reason) : { state: next, effects: [] };
    }
    if (state.kind === 'drag' && !state.released && event.type === 'release' && event.pointerId === state.pointerId) {
        if (event.hit.kind === 'pin') {
            const same = state.target && samePin(event.hit.pin, state.target);
            if (same && state.feedback) return state.feedback.compatible ? connected(state) : cancelled(state, state.feedback.reason);
            const next = { ...state, target: event.hit.pin, feedback: null, requestId: same ? state.requestId : state.requestId + 1, ghost: event.graphPoint, graphPoint: event.graphPoint, released: true, expectedCaptureLoss: true };
            return { state: next, effects: [...releaseEffects(state), ...(!same ? [validation(next)] : [])] };
        }
        if (event.hit.kind === 'empty' && state.mode === 'connect') {
            const next = { ...state, kind: 'search', target: null, feedback: null, ghost: event.graphPoint, graphPoint: event.graphPoint, screenAnchor: event.screenAnchor, released: true, expectedCaptureLoss: true, contextSensitive: true };
            return { state: next, effects: [...releaseEffects(state), { type: 'open-search', capture: state.capture, origin: pinCopy(state.origin), graphPoint: { ...next.graphPoint }, screenAnchor: { ...next.screenAnchor }, contextSensitive: true }] };
        }
        return cancelled(state);
    }
    if (state.kind !== 'idle' && event.type === 'capture-lost' && event.pointerId === state.pointerId) {
        return state.expectedCaptureLoss ? { state: { ...state, expectedCaptureLoss: false }, effects: [] } : cancelled(state);
    }
    if (state.kind === 'search' && event.type === 'choose-node') {
        const next = { ...state, choice: event.choice };
        if (event.matchingPorts.length === 1) return created(next, event.matchingPorts[0].portId);
        if (!event.matchingPorts.length) return event.contextSensitive ? { state, effects: [{ type: 'feedback', reason: 'No compatible port' }] } : created(next);
        const ports = event.matchingPorts;
        return { state: { ...next, kind: 'port-choice', ports }, effects: [{ type: 'open-port-choice', capture: state.capture, choice: event.choice, ports: ports.map(port => ({ ...port })), screenAnchor: { ...state.screenAnchor } }] };
    }
    if (state.kind === 'port-choice' && event.type === 'choose-port' && state.ports.some(port => port.portId === event.portId)) return created(state, event.portId);
    return { state, effects: [] };
}

/**
 * Pure native schema-3 gesture transition. The caller classifies real hits,
 * resolves compatibility and supplies current:true only after checking its
 * captured operation/view/document context. `capture` is opaque: retain and
 * compare its identity only. Effects request work; none perform an edit.
 */
export function transitionNativeGesture(previous, event) {
    let state;
    try { state = admittedState(stateData(previous)); } catch { return { state: admittedState(idle()), effects: [] }; }
    let input;
    try { input = admittedData(eventData(event)); } catch { return { state, effects: [] }; }
    // Required per-event fields are checked before the transition can emit work.
    const required = {
        'begin-pin': ['pin', 'capture', 'pointerId', 'graphPoint', 'originalBindings'],
        'pointer-move': ['pointerId', 'graphPoint', 'hit'],
        release: ['pointerId', 'capture', 'graphPoint', 'hit'],
        'target-result': ['capture', 'requestId', 'compatible'],
        'capture-lost': ['pointerId'],
        'choose-node': ['capture', 'choice', 'matchingPorts', 'contextSensitive'],
        'choose-port': ['capture', 'portId'],
        'activate-target': ['capture', 'target', 'timestamp'],
        'wire-double-click': ['capture', 'wireId', 'direct', 'graphPoint', 'timestamp'],
    }[input.type] ?? [];
    if (required.some(key => input[key] == null)
        || input.type === 'release' && input.hit.kind === 'empty' && state.mode === 'connect' && !input.screenAnchor
        || input.type === 'activate-target' && input.target.kind === 'pin' && !input.originalBindings) return { state, effects: [] };
    const result = reduce(state, input);
    try { result.state = admittedState(result.state); } catch { return { state, effects: [] }; }
    return result;
}
