import { isWorkflowGraph } from './workflow/contracts.js?v=0.22.0';
import { graphPoint, zoomAt, wheelFactor } from './canvas/camera.js?v=0.22.0';
import { createFrameScheduler } from './canvas/frame.js?v=0.22.0';
import { selectionMode, rectangle, intersects, combineSelection } from './canvas/selection.js?v=0.22.0';
import { createGeometryCache, indexIncidentWires } from './canvas/geometry.js?v=0.22.0';
import { nodeCard, preparedCardFor } from './canvas/presentation.js?v=0.22.0';
import { buildConnectionRoute } from './canvas/connection-route.js?v=0.22.0';
import { isCommentFrame, containedCommentNodes } from './canvas/comment-frames.js?v=0.22.0';
import { mountCanvas } from '../dist/lattice-ui.js?v=0.22.0';
const groupMembers = (graph, id) => Object.values(graph?.nodes ?? {}).filter(node => node.inGroup === id);
const groupOf = (graph, node) => node && graph?.groups?.[node.inGroup];

// Prepared cards expand catalog metadata beyond the authoring budget. Keep this
// draw-only traversal bounded independently; authoring admission stays unchanged.
function safePreparedGraph(graph) {
    // Retained authored text and prepared Note bodies may each consume the full
    // authoring allowance. Reserve another 8 KiB per admitted card for catalog,
    // named-pin and attachment metadata, while still bounding the entire DTO.
    const characterLimit = 2 * 2000000 + 1000 * 8192;
    let entries = 0, characters = 0;
    const active = new Set();
    const visit = (item, depth) => {
        if (++entries > 200000 || depth > 40) return false;
        if (typeof item === 'string') { characters += item.length; return characters <= characterLimit; }
        if (item === null || typeof item === 'boolean') return true;
        if (typeof item === 'number') return Number.isFinite(item);
        if (typeof item !== 'object' || active.has(item)) return false;
        if (![Object.prototype, Array.prototype, null].includes(Object.getPrototypeOf(item))) return false;
        const properties = Object.getOwnPropertyDescriptors(item);
        active.add(item);
        for (const key of Reflect.ownKeys(properties)) {
            if (typeof key !== 'string' || ['__proto__', 'prototype', 'constructor'].includes(key)
                || /^(api[_-]?key|api[_-]?token|access[_-]?token|token|password|secret|credentials?|authorization|headers?|provider|endpoint|base[_-]?url)$/i.test(key)
                || !('value' in properties[key]) || !visit(properties[key].value, depth + 1)) return false;
        }
        active.delete(item);
        return true;
    };
    try {
        const cards = Object.getOwnPropertyDescriptor(graph, 'nativeCards');
        if (cards && (!('value' in cards) || !cards.value || typeof cards.value !== 'object'
            || Array.isArray(cards.value) || Object.keys(Object.getOwnPropertyDescriptors(cards.value)).length > 1000)) return false;
        return visit(graph, 0);
    } catch { return false; }
}
/** Prepared named-pin rendering, cached geometry, camera and native interaction bridge. */
export class Canvas {

    constructor(host, hooks = {}) {
        this.host = host;
        this.hooks = hooks;
        this.graph = null;
        this.selection = null;      // {kind:'node'|'wire'|'group', id}
        this.multi = new Set();     // blocks picked with Shift-click or a Shift-drag box
        this.marquee = null;
        this.drag = null;
        this.nativeWireView = null;
        this.wireMulti = new Set();
        this.wireSelections = new Map();
        this.nativeCaptures = new Set();
        this.trace = null;
        this.mode = 'select';
        this.operationEpoch = 0;
        this.spaceDown = false;
        this.geometry = createGeometryCache();
        this.nodeElements = new Map();
        this.incident = new Map();
        this.wireViews = new Map();
        this.eventController = new window.AbortController();
        host.classList.add('pc-canvas');
        host.tabIndex = 0;
        host.innerHTML = '';
        this.layer = mountCanvas(host, {
            hostResult: id => this.hooks.onHostResult?.(this.graph?.nodes[id]),
            hoverPin: pin => { this.hoverPin = pin; this.#applyFocus(); },
            group: (id, action) => this.setCollapsed(id, action === 'collapse'),
        });
        this.viewport = this.layer.viewport; this.svg = this.layer.svg; this.nodeLayer = this.layer.nodeLayer; this.commentLayer = this.layer.commentLayer;
        this.frames = createFrameScheduler(flags => {
            if (flags & 1) this.applyTransform();
            if (flags & 2) this.#drawWires();
            if (flags & 4) this.#renderDrag();
        });
        const Resize = globalThis.ResizeObserver ?? window.ResizeObserver;
        if (Resize) this.resizeObserver = new Resize(entries => {
            let changed = false;
            for (const entry of entries) {
                const id = entry.target.dataset.id ?? `group:${entry.target.dataset.group}`;
                changed = this.#measureCard(entry.target, id) || changed;
            }
            if (changed && this.graph) {
                this.layer.setGroups(Object.values(this.graph.groups ?? {}).map(group => this.#groupCard(group)));
                this.frames.schedule(2);
            }
        });
        this.#bind();
    }

    async destroy() {
        this.cancelGesture();
        this.frames.destroy();
        this.resizeObserver?.disconnect();
        this.eventController.abort();
        await this.layer.destroy();
    }

    get view() {
        this.graph.view ??= { x: 0, y: 0, zoom: 1 };
        return this.graph.view;
    }

    setGraph(graph) {
        if (!graph) return;
        if (!isWorkflowGraph(graph) || !safePreparedGraph(graph)) throw new Error('Expected a prepared current workflow graph.');
        for (const node of Object.values(graph.nodes)) preparedCardFor(graph, node, this.hooks);
        this.cancelGesture();
        if (this.nativeSelectionKey) this.wireSelections.set(this.nativeSelectionKey, [...this.wireMulti]);
        if (graph !== this.graph) { this.trace = null; this.hoverPin = null; this.hoverWire = null; this.geometry.clear(); this.wireViews.clear(); }
        this.graph = graph; this.selection = null; this.multi.clear();
        const scope = this.hooks.nativeScope?.();
        if (scope?.workflowId && this.nativeSelectionRoot !== scope.workflowId) this.wireSelections.clear();
        this.nativeSelectionRoot = scope?.workflowId ?? this.nativeSelectionRoot;
        this.nativeSelectionKey = scope?.workflowId && Array.isArray(scope.instancePath) ? JSON.stringify([scope.workflowId, scope.instancePath]) : null;
        this.wireMulti = new Set((this.wireSelections.get(this.nativeSelectionKey) ?? []).filter(id => graph.wires[id]));
        this.nativeWireView = null; this.render();
    }

    setTrace(trace) {
        this.trace = new Map((trace ?? []).map(t => [t.id, t]));
        this.render();
    }

    applyTransform() {
        const v = this.view;
        this.viewport.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.zoom})`;
        // The canvas background moves and scales with the graph. Each theme
        // background has its own layers, so each gets sizes to match.
        const s = 24 * v.zoom;
        const at = `${v.x}px ${v.y}px`;
        const grid = globalThis.document?.documentElement?.dataset?.pcGrid ?? 'dots';
        if (grid === 'lines') {
            this.host.style.backgroundSize = `${s}px ${s}px, ${s}px ${s}px, ${s * 5}px ${s * 5}px, ${s * 5}px ${s * 5}px`;
            this.host.style.backgroundPosition = `${at}, ${at}, ${at}, ${at}`;
        } else if (grid === 'paper') {
            this.host.style.backgroundSize = `${s * 1.5}px ${s * 1.5}px, 100% 100%`;
            this.host.style.backgroundPosition = `${at}, 0 0`;
        } else if (grid === 'scan') {
            this.host.style.backgroundSize = `auto, 100% 100%`;
            this.host.style.backgroundPosition = `0 0, 0 0`;
        } else {
            this.host.style.backgroundSize = `${s}px ${s}px`;
            this.host.style.backgroundPosition = at;
        }
        this.hooks.onView?.({ ...v, mode: this.mode });
    }

    toGraph(clientX, clientY) {
        const rect = this.gestureRect ?? this.host.getBoundingClientRect();
        return graphPoint(this.view, { x: clientX - rect.left, y: clientY - rect.top });
    }

    zoomBy(factor, clientX, clientY) {
        if (!this.graph) return;
        const rect = this.host.getBoundingClientRect();
        if (zoomAt(this.view, factor, { x: clientX - rect.left, y: clientY - rect.top })) this.applyTransform();
    }

    fit() {
        const boxes = Object.values(this.graph?.nodes ?? {}).filter(n => !this.#folded(n)).map(n => ({ x: n.x, y: n.y, w: this.widthOf(n), h: this.heightOf(n) || 160 }));
        for (const g of Object.values(this.graph?.groups ?? {})) {
            if (g.collapsed) boxes.push({ x: g.x, y: g.y, w: g.w || 260, h: this.geometry.get(`group:${g.id}`, 160) || 160 });
            else boxes.push(this.#nativeGroupFrame(g));
        }
        if (!boxes.length) return;
        const pad = 80;
        const minX = Math.min(...boxes.map(b => b.x)) - pad;
        const minY = Math.min(...boxes.map(b => b.y)) - pad;
        const maxX = Math.max(...boxes.map(b => b.x + b.w)) + pad;
        const maxY = Math.max(...boxes.map(b => b.y + b.h)) + pad;
        const rect = this.host.getBoundingClientRect();
        // The narrow shelf floats across the canvas. Fit frames below it, while
        // ordinary pan/zoom and node placement retain the entire canvas area.
        const shelf = this.host.parentElement?.querySelector('.pc-node-shelf');
        const shelfRect = shelf?.getBoundingClientRect();
        const topInset = shelfRect && shelfRect.width > rect.width / 2
            ? Math.min(Math.max(0, rect.height - 80), Math.max(0, shelfRect.bottom - rect.top + 16)) : 0;
        const height = rect.height - topInset;
        const zoom = Math.max(0.25, Math.min(1.2, Math.min(rect.width / (maxX - minX), height / (maxY - minY))));
        const v = this.view;
        v.zoom = zoom;
        v.x = -minX * zoom + (rect.width - (maxX - minX) * zoom) / 2;
        v.y = topInset - minY * zoom + (height - (maxY - minY) * zoom) / 2;
        this.applyTransform();
    }

    render() {
        if (!this.graph) return;
        this.incident = indexIncidentWires(Object.values(this.graph.wires));
        this.applyTransform(); this.#drawNodes(); this.#drawWires();
    }

    #applyFocus() {
        const pin = this.hoverPin;
        const pins = new Set();
        for (const path of this.svg.querySelectorAll('path.pc-wire')) {
            const wire = this.graph?.wires[path.dataset.id];
            const attached = pin && wire && (pin.dir === 'in' ? wire.to === pin.nodeId && wire.toPort === pin.port : wire.from === pin.nodeId && wire.fromPort === pin.port);
            const focused = wire && (attached || this.hoverWire === wire.id || this.wireMulti.has(wire.id) || this.selection?.kind === 'wire' && this.selection.id === wire.id);
            path.classList.toggle('pc-wire-feeds', !!focused);
            if (focused) {
                pins.add(JSON.stringify([wire.from, 'out', wire.fromPort]));
                pins.add(JSON.stringify([wire.to, 'in', wire.toPort]));
            }
        }
        for (const element of this.nodeLayer.querySelectorAll('.pc-port[data-node][data-dir][data-port]')) {
            element.classList.toggle('pc-pin-highlight', pins.has(JSON.stringify([element.dataset.node, element.dataset.dir, element.dataset.port])));
        }
    }

    #drawNodes() {
        const groups = this.graph.groups ?? {};
        const context = { graph: this.graph, selection: this.selection, multi: this.multi, trace: this.trace, hooks: this.hooks };
        const cards = Object.values(this.graph.nodes).filter(n => !isCommentFrame(n) && !this.#folded(n)).sort((a, b) => (a.y - b.y) || (a.x - b.x)).map(node => nodeCard(node, context));
        const draw = this.graph, capture = this.#canEdit() ? this.hooks.captureCommentEdit?.() : null;
        const current = id => this.graph === draw && isCommentFrame(draw.nodes[id]);
        this.layer.setComments(Object.values(draw.nodes).filter(isCommentFrame).map(node => this.#commentCard(node)), {
            select: id => { if (current(id)) { this.setMulti([]); this.select({ kind: 'node', id }); } },
            update: (id, patch) => { if (current(id) && this.#canEdit()) this.hooks.onCommentPatch?.(capture, id, patch); },
            command: (id, command) => { if (current(id) && this.#canEdit()) this.hooks.onCommentCommand?.(capture, id, command); },
        });
        this.layer.setNodes(cards);
        this.resizeObserver?.disconnect(); this.nodeElements.clear();
        this.#measureCards('.pc-node[data-id]');
        this.layer.setGroups(Object.values(groups).map(g => this.#groupCard(g)));
        this.#measureCards('.pc-node-group');
        this.geometry.retain([...Object.keys(this.graph.nodes), ...Object.keys(groups).map(id => `group:${id}`)]);
        this.#paintMulti();
    }

    #measureCards(selector) {
        for (const el of this.nodeLayer.querySelectorAll(selector)) {
            const id = el.dataset.id ?? 'group:' + el.dataset.group;
            this.nodeElements.set(id, el); this.#measureCard(el, id); this.resizeObserver?.observe(el);
        }
    }

    #measureCard(el, id) {
        if (!el.classList.contains('pc-node-native')) return this.geometry.update(id, el.offsetHeight);
        const box = el.getBoundingClientRect(), zoom = this.view.zoom || 1;
        const pins = [...el.querySelectorAll('.pc-port')].map(port => {
            const dot = port.getBoundingClientRect();
            return { id: port.dataset.port, direction: port.dataset.dir, side: port.dataset.side, kind: port.dataset.kind, x: (dot.left + dot.width / 2 - box.left) / zoom, y: (dot.top + dot.height / 2 - box.top) / zoom };
        });
        return this.geometry.measure(id, box.width / zoom, box.height / zoom, pins);
    }

    endpoint(nodeId, direction, portId = direction) {
        const node = this.graph?.nodes[nodeId], offset = this.geometry.endpoint(nodeId, direction, portId);
        return node && offset ? { ...offset, x: node.x + offset.x, y: node.y + offset.y } : null;
    }

    #folded(node) {
        const g = groupOf(this.graph, node);
        return g?.collapsed ? g : null;
    }

    #nativeGroupFrame(g) {
        const members = groupMembers(this.graph, g.id);
        if (!members.length) return g.frame ?? { x: g.x ?? 0, y: g.y ?? 0, w: g.w || 260, h: 140 };
        const x = Math.min(...members.map(node => node.x)) - 24, y = Math.min(...members.map(node => node.y)) - 48;
        const right = Math.max(...members.map(node => node.x + this.widthOf(node))) + 24;
        const bottom = Math.max(...members.map(node => node.y + this.heightOf(node))) + 24;
        if (!g.frame) return { x, y, w: right - x, h: bottom - y };
        const left = Math.min(g.frame.x, x), top = Math.min(g.frame.y, y);
        return { x: left, y: top, w: Math.max(g.frame.x + g.frame.w, right) - left, h: Math.max(g.frame.y + g.frame.h, bottom) - top };
    }

    #groupCard(g) {
        const members = groupMembers(this.graph, g.id).sort((a, b) => (a.y - b.y) || (a.x - b.x));
        const frame = this.#nativeGroupFrame(g), selected = this.selection?.kind === 'group' && this.selection.id === g.id;
        const multi = members.length > 0 && members.every(n => this.multi.has(n.id));
        return {
            id: g.id, collapsed: !!g.collapsed, x: g.collapsed ? g.x ?? frame.x : frame.x, y: g.collapsed ? g.y ?? frame.y : frame.y,
            w: g.collapsed ? g.w || 260 : frame.w, h: frame.h,
            className: (g.collapsed ? 'pc-node pc-node-group' : 'pc-group-frame') + (selected ? ' pc-selected' : '') + (multi ? ' pc-multi' : '') + (members.length ? '' : ' pc-group-empty'),
            title: g.title || 'Group', body: members.map(n => n.presentation?.alias || n.title || this.#nativeCard(n).canonicalTitle).join(' · '),
            count: `${members.length} node${members.length === 1 ? '' : 's'}`,
        };
    }

    heightOf(node) {
        return isCommentFrame(node) ? (Number.isFinite(node.h) && node.h > 0 ? node.h : 220) : this.geometry.get(node?.id);
    }

    #nativeCard(node) { return node && preparedCardFor(this.graph, node, this.hooks); }

    widthOf(node) { return isCommentFrame(node) ? (Number.isFinite(node.w) && node.w > 0 ? node.w : 360) : this.geometry.width(node?.id); }

    #commentCard(node) {
        return { id: node.id, x: node.x ?? 0, y: node.y ?? 0, w: this.widthOf(node), h: this.heightOf(node),
            title: node.title || 'Comment', content: node.content || '', color: node.color || '#637d89', moveContents: node.moveContents !== false,
            selected: this.selection?.kind === 'node' && this.selection.id === node.id || this.multi.has(node.id), readOnly: !this.#canEdit() };
    }

    #paintMulti() {
        for (const el of this.nodeLayer.querySelectorAll('.pc-node[data-id]')) {
            el.classList.toggle('pc-multi', this.multi.has(el.dataset.id));
        }
        for (const el of this.nodeLayer.querySelectorAll('.pc-node-group')) {
            const members = groupMembers(this.graph, el.dataset.group);
            el.classList.toggle('pc-multi', members.length > 0 && members.every(n => this.multi.has(n.id)));
        }
        for (const el of this.commentLayer.querySelectorAll('.pc-comment-frame[data-id]')) {
            el.classList.toggle('pc-comment-selected', this.multi.has(el.dataset.id) || this.selection?.kind === 'node' && this.selection.id === el.dataset.id);
        }
    }

    setMulti(ids) {
        const hadWireSelection = this.wireMulti.size > 0;
        this.wireMulti.clear();
        const next = new Set(ids.filter(id => this.graph?.nodes[id]));
        if (next.size === this.multi.size && [...next].every(id => this.multi.has(id))
            && (!this.selection || (next.size === 1 && this.selection.kind === 'node' && next.has(this.selection.id)))) {
            if (hadWireSelection) this.#drawWires();
            return;
        }
        this.multi = next;
        this.selection = next.size === 1 ? { kind: 'node', id: [...next][0] } : null;
        for (const el of this.nodeLayer.querySelectorAll('.pc-node[data-id]')) el.classList.toggle('pc-selected', this.selection?.id === el.dataset.id);
        for (const el of this.nodeLayer.querySelectorAll('.pc-node-group, .pc-group-frame')) el.classList.remove('pc-selected');
        this.#paintMulti();
        this.#drawWires();
        this.hooks.onSelect?.(this.selection ? this.graph.nodes[this.selection.id] : null, this.selection?.kind ?? null);
        this.hooks.onMulti?.([...this.multi]);
    }

    #pickedIds() {
        const ids = new Set(this.multi);
        if (this.selection?.kind === 'node') ids.add(this.selection.id);
        if (this.selection?.kind === 'group') for (const n of groupMembers(this.graph, this.selection.id)) ids.add(n.id);
        return ids;
    }

    #dragGroups(ids, extraGroup) {
        const selected = new Set(ids);
        return Object.values(this.graph.groups ?? {}).filter(group => {
            const members = groupMembers(this.graph, group.id);
            return group.collapsed && (group.id === extraGroup || members.length && members.every(node => selected.has(node.id)));
        }).map(group => {
            const frame = this.#nativeGroupFrame(group);
            return { id: group.id, x: group.x ?? frame.x, y: group.y ?? frame.y,
                original: Object.fromEntries(['x', 'y', 'frame'].filter(key => Object.hasOwn(group, key)).map(key => [key, structuredClone(group[key])])) };
        });
    }

    setMode(mode) {
        this.mode = mode === 'pan' ? 'pan' : 'select';
        this.host.classList.toggle('pc-pan-mode', this.mode === 'pan');
        if (this.graph) this.hooks.onView?.({ ...this.view, mode: this.mode });
    }

    selectAll() { if (this.graph) this.setMulti(Object.keys(this.graph.nodes)); }

    fitSelection() {
        const ids = this.#pickedIds();
        if (!ids.size) { this.fit(); return; }
        const boxes = [];
        const groups = new Set();
        for (const id of ids) {
            const n = this.graph.nodes[id]; if (!n) continue;
            const g = this.#folded(n);
            if (g) {
                if (groups.has(g.id)) continue; groups.add(g.id);
                boxes.push({ x: g.x, y: g.y, w: g.w || 260, h: this.geometry.get(`group:${g.id}`, 80) });
            } else boxes.push({ x: n.x, y: n.y, w: this.widthOf(n), h: this.heightOf(n) || 90 });
        }
        const selectedGroup = this.selection?.kind === 'group' ? this.graph.groups?.[this.selection.id] : null;
        if (selectedGroup && !selectedGroup.collapsed) boxes.push(this.#nativeGroupFrame(selectedGroup));
        if (!boxes.length) return;
        const minX = Math.min(...boxes.map(b => b.x)) - 60, minY = Math.min(...boxes.map(b => b.y)) - 60;
        const maxX = Math.max(...boxes.map(b => b.x + b.w)) + 60, maxY = Math.max(...boxes.map(b => b.y + b.h)) + 60;
        const rect = this.host.getBoundingClientRect();
        const zoom = Math.max(0.25, Math.min(1.2, rect.width / (maxX - minX), rect.height / (maxY - minY)));
        Object.assign(this.view, { zoom, x: (rect.width - (minX + maxX) * zoom) / 2, y: (rect.height - (minY + maxY) * zoom) / 2 });
        this.applyTransform();
    }

    cancelGesture(reason = 'cancel') {
        this.operationEpoch++;
        const bridge = this.#nativeBridge();
        const active = !!(this.drag || this.marquee || this.pan || bridge?.hasContentGesture());
        if (bridge) { const result = bridge.cancel(reason); this.updateNativeWire(result.view, result.requests); }
        const wheeling = !!this.wheelRect;
        this.frames.cancel(); clearTimeout(this.wheelTimer);
        this.gestureRect = null; this.wheelRect = null;
        const d = this.drag;
        if (d && this.graph) this.#restoreDrag(d);
        if (this.pan?.start && this.graph) Object.assign(this.view, this.pan.start);
        this.marquee?.box.remove();
        this.drag = null; this.marquee = null; this.pan = null;
        this.nativeMouseSuppressed = false;
        this.spaceDown = false;
        this.host.classList.remove('pc-panning', 'pc-interacting', 'pc-space-pan');
        this.hooks.onDragBlock?.(false);
        if (active && this.graph) {
            const start = this.gestureStart;
            this.multi = new Set(start?.multi ?? this.multi);
            this.wireMulti = new Set([...(start?.wireMulti ?? this.wireMulti)].filter(id => this.graph.wires[id]));
            this.selection = start?.selection ?? null;
            if (this.selection?.kind === 'wire' && !this.graph.wires[this.selection.id]) {
                const surviving = [...this.wireMulti].at(-1);
                this.selection = surviving ? { kind: 'wire', id: surviving } : null;
            }
            this.render();
            const sel = this.selection;
            const picked = sel?.kind === 'node' ? this.graph.nodes[sel.id] : sel?.kind === 'group' ? this.graph.groups?.[sel.id] : sel?.kind === 'wire' ? this.graph.wires[sel.id] : null;
            this.hooks.onSelect?.(picked, sel?.kind ?? null); this.hooks.onMulti?.([...this.multi]);
        }
        else if (wheeling && this.graph) this.applyTransform();
        return active;
    }

    #restoreDrag(d) {
        for (const [id, x, y] of d.several ?? []) {
            const node = this.graph.nodes[id]; if (node) { node.x = x; node.y = y; }
        }
        const node = d.id && this.graph.nodes[d.id];
        if (node) {
            node.x = d.homeX; node.y = d.homeY;
            if (d.sizeBefore) for (const axis of ['w', 'h']) {
                if (d.sizeBefore[axis] === undefined) delete node[axis]; else node[axis] = d.sizeBefore[axis];
            }
        }
        for (const saved of d.groups ?? []) {
            const group = this.graph.groups?.[saved.id]; if (!group) continue;
            for (const key of ['x', 'y', 'frame']) delete group[key]; Object.assign(group, saved.original);
        }
    }

    #focusCommentGesture(event) {
        // Leaving a title editor may commit and replace the drawing. Capture the
        // gesture only after that focus change, using the current graph and view.
        this.host.focus({ preventScroll: true });
        this.gestureRect = this.host.getBoundingClientRect();
        this.gestureStart = { selection: this.selection && { ...this.selection }, multi: [...this.multi], wireMulti: [...this.wireMulti], cx: event.clientX, cy: event.clientY };
    }

    #beginCommentDrag(event, frame) {
        if (!this.#canEdit()) return;
        const capture = this.hooks.captureCommentEdit?.();
        if (!capture) return;
        const start = this.toGraph(event.clientX, event.clientY);
        let nodes;
        if (this.multi.size > 1 && this.multi.has(frame.id)) nodes = [...this.multi].map(id => this.graph.nodes[id]).filter(Boolean);
        else {
            nodes = [frame, ...(frame.moveContents !== false ? containedCommentNodes(this.graph, frame, node => ({ x: node.x, y: node.y, w: this.widthOf(node), h: this.heightOf(node) })).filter(node => !this.#folded(node)) : [])];
            this.setMulti([]); this.select({ kind: 'node', id: frame.id });
        }
        this.drag = { comment: true, capture, several: nodes.map(node => [node.id, node.x, node.y]), groups: this.#dragGroups(nodes.map(node => node.id)), sx: start.x, sy: start.y, moved: false };
    }

    #updateMarquee(e) {
        const m = this.marquee;
        if (!m) return;
        if (!m.moved && Math.hypot(e.clientX - m.cx, e.clientY - m.cy) < 4) return;
        m.moved = true;
        const p = this.toGraph(e.clientX, e.clientY);
        m.x1 = p.x; m.y1 = p.y;
        const r = rectangle({ x: m.x0, y: m.y0 }, p);
        Object.assign(m.box.style, { display: '', left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
        const hits = [];
        for (const n of Object.values(this.graph.nodes)) {
            if (!this.#folded(n) && intersects(r, { x: n.x, y: n.y, w: this.widthOf(n), h: this.heightOf(n) || 90 })) hits.push(n.id);
        }
        for (const g of Object.values(this.graph.groups ?? {})) {
            if (!g.collapsed) continue;
            if (intersects(r, { x: g.x, y: g.y, w: g.w || 260, h: this.geometry.get(`group:${g.id}`, 80) })) hits.push(...groupMembers(this.graph, g.id).map(n => n.id));
        }
        this.setMulti([...combineSelection(m.initial, hits, m.mode)]);
    }

    setCollapsed(gid, collapsed) {
        if (typeof gid !== 'string' || !Object.hasOwn(this.graph?.groups ?? {}, gid) || typeof collapsed !== 'boolean') return false;
        return this.hooks.onNativeGroupPresentation?.(gid, collapsed) === true;
    }

    #path(from, to) { return buildConnectionRoute(from, to).d; }

    #drawWires(changedNodes = null) {
        if (!this.graph) return;
        const affected = changedNodes ? new Set([...changedNodes].flatMap(id => [...(this.incident.get(id) ?? [])])) : null;
        const visible = new Set(), bounds = { w: 4000, h: 4000 };
        for (const n of Object.values(this.graph.nodes)) { bounds.w = Math.max(bounds.w, n.x + 800); bounds.h = Math.max(bounds.h, n.y + 800); }
        for (const wire of Object.values(this.graph.wires)) {
            if (!wire.from || !wire.fromPort || !wire.to || !wire.toPort) continue;
            const from = this.endpoint(wire.from, 'out', wire.fromPort), to = this.endpoint(wire.to, 'in', wire.toPort);
            if (!from || !to || this.#folded(this.graph.nodes[wire.from]) || this.#folded(this.graph.nodes[wire.to])) continue;
            visible.add(wire.id); if (affected && !affected.has(wire.id)) continue;
            const off = [wire.from, wire.to].some(id => this.graph.nodes[id]?.enabled === false);
            const selected = this.selection?.kind === 'wire' && this.selection.id === wire.id || this.wireMulti.has(wire.id);
            const route = buildConnectionRoute(from, to);
            this.wireViews.set(wire.id, { id: wire.id, kind: from.kind, d: route.d,
                className: 'pc-wire pc-wire-native' + (off ? ' pc-wire-off' : '') + (selected ? ' pc-selected' : ''),
                label: { ...route.label, text: from.kind, className: 'pc-wire-label' } });
        }
        for (const id of this.wireViews.keys()) if (!visible.has(id)) this.wireViews.delete(id);
        const native = this.nativeWireView?.gesture;
        const origin = native?.origin && this.endpoint(native.origin.nodeId, native.origin.dir, native.origin.portId);
        const target = native?.target && this.endpoint(native.target.nodeId, native.target.dir, native.target.portId);
        const loose = native?.ghost && { ...native.ghost, side: native.origin?.dir === 'in' ? 'right' : 'left' };
        const ghost = native && native.kind !== 'idle' && origin && loose ? {
            d: native.origin.dir === 'out' ? this.#path(origin, target ?? loose) : this.#path(target ?? loose, origin),
            className: 'pc-wire pc-wire-ghost pc-wire-native' + (native.feedback?.compatible === false ? ' pc-wire-invalid' : ''),
        } : null;
        this.layer.setWires([...this.wireViews.values()], bounds, ghost);
        this.#applyFocus();
    }

    #renderDrag() {
        const d = this.drag; if (!d) return;
        const ids = d.id ? [d.id] : d.several.map(([id]) => id);
        this.layer.setPositions(ids.map(id => this.graph.nodes[id]).filter(Boolean).map(n => ({ id: n.id, x: n.x, y: n.y, ...(isCommentFrame(n) ? { w: this.widthOf(n), h: this.heightOf(n) } : {}) })), []);
        this.layer.setGroups(Object.values(this.graph.groups ?? {}).map(g => this.#groupCard(g)));
        this.#drawWires(new Set(ids));
    }

    #crossedDragThreshold(e) {
        return this.drag?.moved || Math.hypot(e.clientX - (this.gestureStart?.cx ?? e.clientX), e.clientY - (this.gestureStart?.cy ?? e.clientY)) >= 8;
    }

    #nativeBridge() { return this.graph ? this.hooks.nativeBridge?.() : null; }

    #canEdit() { return this.hooks.canEdit ? this.hooks.canEdit() === true : this.hooks.nativeScope?.()?.readOnly !== true; }

    hasContentGesture() { return !!(this.drag || this.#nativeBridge()?.hasContentGesture()); }

    updateNativeWire(view, requests = []) {
        this.nativeWireView = view;
        for (const request of requests ?? []) {
            if (request.type === 'capture-pointer' && !this.nativeCaptures.has(request.pointerId)) {
                this.nativeCaptures.add(request.pointerId);
                try { this.host.setPointerCapture(request.pointerId); } catch { /* no active synthetic pointer */ }
            } else if (request.type === 'release-pointer' && this.nativeCaptures.delete(request.pointerId)) {
                try { this.host.releasePointerCapture(request.pointerId); } catch { /* capture may already have ended */ }
            } else if (request.type === 'consume') {
                this.nativeEvent?.preventDefault(); this.nativeEvent?.stopPropagation();
            }
        }
        this.frames.schedule(2);
    }

    #dispatchNative(event, domEvent) {
        const bridge = this.#nativeBridge(); if (!bridge) return;
        this.nativeEvent = domEvent;
        try { const result = bridge.dispatch(event); this.updateNativeWire(result.view, result.requests); }
        finally { this.nativeEvent = null; }
    }

    #nativePin(element) {
        const pin = element?.closest?.('.pc-port[data-node][data-dir][data-port]');
        if (!pin || !this.host.contains(pin)) return null;
        const { node: nodeId, dir, port: portId } = pin.dataset;
        const metadata = this.#nativeCard(this.graph.nodes[nodeId]);
        const port = metadata?.ports.find(port => port.port === portId && port.dir === dir);
        const center = this.endpoint(nodeId, dir, portId), scope = this.hooks.nativeScope?.();
        if (!port || !center || !scope?.workflowId || !Array.isArray(scope.instancePath)) return null;
        return { nodeId, portId, dir, kind: port.kind, center: { x: center.x, y: center.y },
            address: { workflowId: scope.workflowId, instancePath: [...scope.instancePath], nodeId, portId } };
    }

    #nativeAttachments(pin) { return this.hooks.nativeAttachments?.(pin) ?? { originalBindings: [], jumps: [] }; }

    #nativeHit(e) {
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (!element || !this.host.contains(element)) return { kind: 'outside' };
        const pin = this.#nativePin(element); if (pin) return { kind: 'pin', pin };
        if (element.closest('.pc-node, .pc-group-frame')) return { kind: 'body' };
        if (element.closest('button, input, textarea, select, summary, a, [contenteditable="true"], .pc-wire-hit, .pc-comment-header, .pc-comment-resize')) return { kind: 'surface' };
        return { kind: 'empty' };
    }

    #openNativeSearch(e) {
        if (!this.#canEdit()) return;
        const bridge = this.#nativeBridge(); if (!bridge) return;
        this.gestureStart = { selection: this.selection && { ...this.selection }, multi: [...this.multi], wireMulti: [...this.wireMulti] };
        const result = bridge.openUnconnectedSearch({ graphPoint: this.toGraph(e.clientX, e.clientY), screenAnchor: { x: e.clientX, y: e.clientY } });
        this.updateNativeWire(result.view, result.requests);
    }

    #bind() {
        const host = this.host;
        const on = (target, type, handler, options = {}) => target.addEventListener(type, handler, { ...options, signal: this.eventController.signal });
        const inEditor = (e) => e.target?.closest?.('input, textarea, select, [contenteditable="true"]');
        const typing = (e) => inEditor(e) || document.activeElement?.matches?.('input, textarea, select, [contenteditable="true"]');
        on(host, 'pointerover', event => {
            const wire = event.target.closest?.('.pc-wire-hit[data-id]');
            if (wire) { this.hoverWire = wire.dataset.id; this.#applyFocus(); }
        });
        on(host, 'pointerout', event => {
            const wire = event.target.closest?.('.pc-wire-hit[data-id]');
            if (wire && !wire.contains(event.relatedTarget)) { this.hoverWire = null; this.#applyFocus(); }
        });
        on(document, 'keydown', (e) => {
            const root = host.closest('.pc-root');
            if (root && !root.classList.contains('pc-open')) return;
            if (e.key === 'Escape' && !typing(e) && (host.contains(e.target) || host.contains(document.activeElement))) {
                if (this.cancelGesture('escape')) e.preventDefault();
                return;
            }
            if ((e.code === 'Space' || e.key === ' ') && !typing(e) && !e.target?.closest?.('button, a, summary')) {
                e.preventDefault(); this.spaceDown = true; host.classList.add('pc-space-pan');
            }
        });
        on(document, 'keyup', (e) => {
            if (e.code === 'Space' || e.key === ' ') { this.spaceDown = false; host.classList.remove('pc-space-pan'); }
        });
        on(window, 'blur', () => this.cancelGesture('blur'));
        on(window, 'resize', () => this.cancelGesture());
        on(host, 'pointercancel', () => this.cancelGesture('pointercancel'));
        on(host, 'lostpointercapture', e => {
            {
                if (this.drag || this.marquee || this.pan) { this.cancelGesture(); return; }
                this.nativeCaptures.delete(e.pointerId);
                this.#dispatchNative({ type: 'capture-lost', pointerId: e.pointerId, buttons: e.buttons }, e);
                return;
            }
        });
        on(host, 'pointerdown', (e) => {
            if (e.button === 0 && !inEditor(e) && !e.target.closest('.pc-node-action')) {
                const pinElement = e.target.closest('.pc-port'), pin = this.#nativePin(e.target);
                const wire = e.target.closest('.pc-wire-hit');
                if (pinElement || e.altKey && wire) {
                    e.preventDefault(); e.stopPropagation(); this.nativeMouseSuppressed = true;
                    host.focus({ preventScroll: true });
                    if (!this.#canEdit()) return;
                    this.gestureStart = { selection: this.selection && { ...this.selection }, multi: [...this.multi], wireMulti: [...this.wireMulti] };
                    this.gestureRect = host.getBoundingClientRect();
                    const attachment = pin ? this.#nativeAttachments(pin) : null;
                    if (e.altKey && (pin || wire)) this.#dispatchNative({ type: 'activate-target', target: pin ? { kind: 'pin', pin } : { kind: 'wire', id: wire.dataset.id },
                        timestamp: e.timeStamp, alt: true, ...(pin ? { originalBindings: attachment.originalBindings } : {}) }, e);
                    else if (pin) this.#dispatchNative({ type: 'begin-pin', pin, pointerId: e.pointerId, graphPoint: this.toGraph(e.clientX, e.clientY),
                        originalBindings: attachment.originalBindings, ctrl: e.ctrlKey }, e);
                    return;
                }
            }
            // Body drags and pans already use window mouse handlers. Generic
            // capture would retarget their click/double-click to the host.
        });
        on(window, 'pointermove', e => {
            if (this.nativeWireView?.gesture?.kind !== 'drag' || this.nativeWireView.gesture.released) return;
            this.#dispatchNative({ type: 'pointer-move', pointerId: e.pointerId, graphPoint: this.toGraph(e.clientX, e.clientY), hit: this.#nativeHit(e) }, e);
        });
        on(window, 'pointerup', e => {
            if (this.nativeWireView?.gesture?.kind === 'drag' && !this.nativeWireView.gesture.released) {
                this.#dispatchNative({ type: 'release', pointerId: e.pointerId, graphPoint: this.toGraph(e.clientX, e.clientY),
                    screenAnchor: { x: e.clientX, y: e.clientY }, hit: this.#nativeHit(e) }, e);
            }
            this.nativeMouseSuppressed = false;
            if (!this.drag && !this.pan && !this.marquee) this.gestureRect = null;
        });
        // Where the pointer is on the canvas, so a paste lands under it.
        on(host, 'mousemove', (e) => { if (this.graph) this.pointer = this.toGraph(e.clientX, e.clientY); });
        on(host, 'mouseleave', () => { this.pointer = null; });
        on(host, 'wheel', (e) => {
            if (!this.graph || this.drag || this.marquee || this.pan || this.#nativeBridge()?.hasContentGesture()) return;
            e.preventDefault();
            const rect = this.wheelRect ??= host.getBoundingClientRect();
            const factor = wheelFactor(e.deltaY, e.deltaMode, rect.height);
            if (!zoomAt(this.view, factor, { x: e.clientX - rect.left, y: e.clientY - rect.top })) return;
            host.classList.add('pc-interacting');
            this.frames.schedule();
            clearTimeout(this.wheelTimer);
            this.wheelTimer = setTimeout(() => {
                this.frames.flush(); host.classList.remove('pc-interacting');
                this.wheelRect = null;
            }, 160);
        }, { passive: false });
        on(host, 'mousedown', (e) => {
            if (!this.graph) return;
            if (this.nativeMouseSuppressed || e.target.closest('.pc-port')) { e.preventDefault(); return; }
            if (e.target.closest('.pc-node-action')) return;
            if (inEditor(e)) return;
            this.gestureRect = host.getBoundingClientRect();
            if (e.button === 1 || (e.button === 0 && (this.spaceDown || this.mode === 'pan'))) {
                e.preventDefault();
                const editor = inEditor({ target: document.activeElement });
                const workspace = host.closest('.pc-root');
                if (!editor || !(host.contains(editor) || workspace?.contains(editor))) host.focus({ preventScroll: true });
                this.gestureStart = { selection: this.selection && { ...this.selection }, multi: [...this.multi], wireMulti: [...this.wireMulti] };
                const v = this.view;
                this.pan = { x: e.clientX - v.x, y: e.clientY - v.y, start: { ...v } };
                host.classList.add('pc-panning');
                return;
            }
            if (e.button !== 0) return;
            this.gestureStart = { selection: this.selection && { ...this.selection }, multi: [...this.multi], wireMulti: [...this.wireMulti], cx: e.clientX, cy: e.clientY };
            const port = e.target.closest('.pc-port');
            const nodeEl = e.target.closest('.pc-node[data-id]');
            const groupEl = e.target.closest('.pc-node-group, .pc-group-frame-head, .pc-group-frame');
            const wireHit = e.target.closest('.pc-wire-hit');
            const commentResize = e.target.closest('.pc-comment-resize');
            if (commentResize) {
                const id = commentResize.closest('.pc-comment-frame')?.dataset.id;
                e.preventDefault(); this.#focusCommentGesture(e);
                const frame = this.graph.nodes[id];
                if (!isCommentFrame(frame) || !this.#canEdit()) return;
                const capture = this.hooks.captureCommentEdit?.(); if (!capture) return;
                e.preventDefault(); this.setMulti([]); this.select({ kind: 'node', id: frame.id });
                const start = this.toGraph(e.clientX, e.clientY);
                this.drag = { comment: true, resize: true, capture, id: frame.id, sx: start.x, sy: start.y, homeX: frame.x, homeY: frame.y,
                    homeW: this.widthOf(frame), homeH: this.heightOf(frame), sizeBefore: { w: frame.w, h: frame.h }, moved: false };
                return;
            }
            const commentHeader = e.target.closest('.pc-comment-header');
            if (commentHeader) {
                const id = commentHeader.closest('.pc-comment-frame')?.dataset.id;
                e.preventDefault(); this.#focusCommentGesture(e);
                const frame = this.graph.nodes[id];
                if (isCommentFrame(frame)) {
                    e.preventDefault();
                    if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
                        const ids = this.#pickedIds();
                        if (e.altKey || ((e.ctrlKey || e.metaKey) && !e.shiftKey && ids.has(frame.id))) ids.delete(frame.id);
                        else ids.add(frame.id);
                        this.setMulti([...ids]);
                        if (!e.shiftKey || e.altKey) return;
                    }
                    if (!this.#canEdit()) { if (this.multi.size < 2 || !this.multi.has(frame.id)) { this.setMulti([]); this.select({ kind: 'node', id: frame.id }); } return; }
                    this.#beginCommentDrag(e, frame);
                }
                return;
            }
            if (groupEl && !port) {
                const gid = groupEl.dataset.group ?? groupEl.closest('[data-group]')?.dataset.group;
                if ([...this.#pickedIds()].some(id => isCommentFrame(this.graph.nodes[id]))) this.#focusCommentGesture(e);
                if (!this.graph.groups?.[gid]) return;
                e.preventDefault(); e.stopPropagation();
                const action = e.target.closest('[data-action]')?.dataset.action;
                if (action === 'collapse' || action === 'open') { this.setCollapsed(gid, action === 'collapse'); return; }
                const group = this.graph.groups[gid], members = groupMembers(this.graph, gid).map(node => node.id);
                if (!group.collapsed) { this.multi.clear(); this.select({ kind: 'group', id: gid }); return; }
                let selected = this.#pickedIds();
                if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
                    const remove = e.altKey || (e.ctrlKey || e.metaKey) && !e.shiftKey && members.every(id => selected.has(id));
                    for (const id of members) if (remove) selected.delete(id); else selected.add(id);
                    this.setMulti([...selected]); if (!e.shiftKey || remove) return;
                } else if (!members.length || !members.every(id => selected.has(id))) {
                    this.multi.clear(); this.select({ kind: 'group', id: gid }); selected = new Set(members);
                }
                const start = this.toGraph(e.clientX, e.clientY), ids = [...selected];
                const comment = ids.some(id => isCommentFrame(this.graph.nodes[id]));
                if (comment && !this.#canEdit()) return;
                const capture = comment ? this.hooks.captureCommentEdit?.() : null;
                if (comment && !capture) return;
                this.drag = { comment, capture, several: ids.map(id => [id, this.graph.nodes[id]?.x ?? 0, this.graph.nodes[id]?.y ?? 0]),
                    groups: this.#dragGroups(ids, gid), clickedGroup: e.shiftKey ? null : gid, sx: start.x, sy: start.y, moved: false };
                return;
            }
            if (nodeEl && e.button === 0) {
                const id = nodeEl.dataset.id;
                if ([...this.#pickedIds()].some(id => isCommentFrame(this.graph.nodes[id]))) this.#focusCommentGesture(e);
                const node = this.graph.nodes[id];
                if (!node) return;
                if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
                    const ids = this.#pickedIds();
                    if (e.altKey || ((e.ctrlKey || e.metaKey) && !e.shiftKey && ids.has(id))) ids.delete(id);
                    else ids.add(id);
                    this.setMulti([...ids]);
                    if (!e.shiftKey || e.altKey) return;
                }
                if (this.multi.size > 1 && this.multi.has(id)) {
                    // Drag them all together.
                    const comment = [...this.multi].some(id => isCommentFrame(this.graph.nodes[id]));
                    if (comment && !this.#canEdit()) return;
                    const capture = comment ? this.hooks.captureCommentEdit?.() : null;
                    if (comment && !capture) return;
                    const start = this.toGraph(e.clientX, e.clientY);
                    this.drag = { comment, capture, several: [...this.multi].map(m => [m, this.graph.nodes[m]?.x ?? 0, this.graph.nodes[m]?.y ?? 0]), groups: this.#dragGroups(this.multi), clicked: e.shiftKey ? null : id, sx: start.x, sy: start.y, moved: false };
                    return;
                }
                if (this.multi.size && !e.shiftKey) this.setMulti([]);
                this.select({ kind: 'node', id });
                this.wireMulti.clear();
                const start = this.toGraph(e.clientX, e.clientY);
                this.drag = {
                    id,
                    dx: start.x - node.x,
                    dy: start.y - node.y,
                    homeX: node.x,
                    homeY: node.y,
                    moved: false,
                };
                return;
            }
            if (wireHit) {
                const sel = { kind: 'wire', id: wireHit.dataset.id };
                {
                    const modified = e.shiftKey || e.ctrlKey || e.metaKey;
                    if (!modified) this.wireMulti.clear();
                    if (modified && this.wireMulti.has(sel.id)) this.wireMulti.delete(sel.id); else this.wireMulti.add(sel.id);
                    this.multi.clear(); const primary = [...this.wireMulti].at(-1);
                    this.select(primary ? { kind: 'wire', id: primary } : null);
                }
                return;
            }
            if (e.button === 0) {
                const p = this.toGraph(e.clientX, e.clientY);
                const box = document.createElement('div');
                box.className = 'pc-marquee';
                box.style.display = 'none';
                this.nodeLayer.append(box);
                this.marquee = { x0: p.x, y0: p.y, x1: p.x, y1: p.y, cx: e.clientX, cy: e.clientY, box, mode: selectionMode(e), initial: this.#pickedIds(), moved: false };
                host.classList.add('pc-interacting');
                e.preventDefault();
                return;
            }
        });
        on(window, 'mousemove', (e) => {
            if (this.marquee) {
                this.#updateMarquee(e);
                return;
            }
            if (this.drag?.resize) {
                if (!this.#crossedDragThreshold(e)) return;
                const d = this.drag, frame = this.graph.nodes[d.id], point = this.toGraph(e.clientX, e.clientY);
                if (!isCommentFrame(frame)) return;
                frame.w = Math.max(180, Math.round(d.homeW + point.x - d.sx));
                frame.h = Math.max(100, Math.round(d.homeH + point.y - d.sy));
                d.moved = true; host.classList.add('pc-interacting'); this.frames.schedule(4); return;
            }
            if (this.drag?.several) {
                if (!this.#crossedDragThreshold(e)) return;
                const p = this.toGraph(e.clientX, e.clientY);
                const d = this.drag;
                const dx = Math.round(p.x - d.sx), dy = Math.round(p.y - d.sy);
                if (!dx && !dy && !d.moved) return;
                if (!d.moved && !d.comment) this.hooks.onDragBlock?.(true);
                d.moved = true;
                for (const [id, x, y] of d.several) {
                    const n = this.graph.nodes[id];
                    if (!n) continue;
                    n.x = x + dx; n.y = y + dy;
                }
                for (const saved of d.groups ?? []) {
                    const group = this.graph.groups?.[saved.id]; if (!group) continue;
                    group.x = saved.x + dx; group.y = saved.y + dy;
                    if (saved.original.frame) group.frame = { ...saved.original.frame, x: saved.original.frame.x + dx, y: saved.original.frame.y + dy };
                }
                this.host.classList.add('pc-interacting');
                this.frames.schedule(4);
                return;
            }
            if (this.drag) {
                if (!this.#crossedDragThreshold(e)) return;
                const p = this.toGraph(e.clientX, e.clientY);
                const node = this.graph.nodes[this.drag.id];
                if (!node) return;
                node.x = Math.round(p.x - this.drag.dx);
                node.y = Math.round(p.y - this.drag.dy);
                if (!this.drag.moved && !this.drag.comment) this.hooks.onDragBlock?.(true);
                this.drag.moved = true;
                this.host.classList.add('pc-interacting');
                this.frames.schedule(4);
                return;
            }
            if (this.pan) {
                const v = this.view;
                v.x = e.clientX - this.pan.x;
                v.y = e.clientY - this.pan.y;
                this.frames.schedule();
            }
        });
        on(window, 'mouseup', (e) => {
            this.frames.flush(); this.gestureRect = null; this.host.classList.remove('pc-interacting');
            if (this.marquee) {
                this.#updateMarquee(e); const m = this.marquee; this.marquee = null; m.box.remove();
                if (!m.moved && m.mode === 'replace') this.setMulti([]);
                return;
            }
            if (this.drag) {
                const d = this.drag; this.drag = null;
                const ids = d.id ? [d.id] : d.several.map(([id]) => id);
                if (d.moved) {
                    this.hooks.onDragBlock?.(false);
                    if (d.comment) {
                        const draw = this.graph;
                        const positions = ids.map(id => draw.nodes[id]).filter(Boolean).map(node => ({ id: node.id, x: node.x, y: node.y, ...(isCommentFrame(node) ? { w: this.widthOf(node), h: this.heightOf(node) } : {}) }));
                        const groups = (d.groups ?? []).map(saved => draw.groups?.[saved.id]).filter(Boolean)
                            .map(group => ({ id: group.id, x: group.x, y: group.y, ...(group.frame ? { frame: structuredClone(group.frame) } : {}) }));
                        const result = this.#canEdit() && this.hooks.onCommentLayout?.(d.capture, positions, groups);
                        if ((!result || result.ok === false) && this.graph === draw) this.#restoreDrag(d);
                    } else this.hooks.onPresentationChange?.(ids, (d.groups ?? []).map(group => group.id));
                }
                else if (d.clickedGroup) { this.multi.clear(); this.select({ kind: 'group', id: d.clickedGroup }); }
                else if (d.clicked) this.setMulti([d.clicked]);
                this.render();
            }
            if (this.pan) { this.frames.flush(); this.pan = null; this.host.classList.remove('pc-panning'); }
        });
        on(host, 'dblclick', (e) => {
            if (inEditor(e)) return;
            if (e.target.closest('[data-action]')) return;
            const comment = e.target.closest('.pc-comment-header')?.closest('.pc-comment-frame');
            if (comment) { this.hooks.onReveal?.({ kind: 'node', id: comment.dataset.id }); return; }
            const groupEl = e.target.closest('.pc-node-group, .pc-group-frame-head');
            if (groupEl) {
                const gid = groupEl.dataset.group ?? groupEl.closest('[data-group]')?.dataset.group;
                const g = this.graph.groups?.[gid];
                if (g) this.setCollapsed(gid, !g.collapsed);
                return;
            }
            const nodeEl = e.target.closest('.pc-node[data-id]');
            if (nodeEl) {
                if (e.target.closest('.pc-port')) return;
                this.hooks.onOpen?.(this.graph.nodes[nodeEl.dataset.id]);
                return;
            }
            const wireHit = e.target.closest('.pc-wire-hit');
            if (wireHit) {
                {
                    e.preventDefault(); e.stopPropagation();
                    if (this.#canEdit()) this.#dispatchNative({ type: 'wire-double-click', wireId: wireHit.dataset.id,
                        direct: !!this.graph.wires[wireHit.dataset.id]?.from, graphPoint: this.toGraph(e.clientX, e.clientY), timestamp: e.timeStamp,
                        alt: e.altKey, ctrl: e.ctrlKey, shift: e.shiftKey, meta: e.metaKey }, e);
                }
                return;
            }
            this.#openNativeSearch(e);
        });
        on(host, 'contextmenu', (e) => {
            if (inEditor(e)) return;
            e.preventDefault();
            {
                const pin = this.#nativePin(e.target), bridge = this.#nativeBridge();
                if (pin && bridge) {
                    this.gestureStart = { selection: this.selection && { ...this.selection }, multi: [...this.multi], wireMulti: [...this.wireMulti] };
                    const result = bridge.openPinMenu({ pin, screenAnchor: { x: e.clientX, y: e.clientY },
                        readOnly: !this.#canEdit(), ...this.#nativeAttachments(pin) });
                    this.updateNativeWire(result.view, result.requests); return;
                }
                if (!e.target.closest('.pc-node, .pc-group-frame, .pc-wire-hit, .pc-comment-frame')) { this.#openNativeSearch(e); return; }
            }
            const nodeEl = e.target.closest('.pc-node[data-id], .pc-comment-frame[data-id]');
            const groupEl = e.target.closest('.pc-node-group, .pc-group-frame-head');
            const gid = groupEl ? (groupEl.dataset.group ?? groupEl.closest('[data-group]')?.dataset.group) : null;
            const wireHit = e.target.closest('.pc-wire-hit');
            this.hooks.onContextMenu?.({
                event: e,
                group: gid ? this.graph.groups?.[gid] ?? null : null,
                several: nodeEl && this.multi.size > 1 && this.multi.has(nodeEl.dataset.id) ? [...this.multi] : null,
                node: nodeEl ? this.graph.nodes[nodeEl.dataset.id] : null,
                wire: wireHit ? this.graph.wires[wireHit.dataset.id] : null,
                at: this.toGraph(e.clientX, e.clientY),
            });
        });
    }

    select(sel) {
        if (sel?.kind === 'wire') this.wireMulti.add(sel.id); else this.wireMulti.clear();
        this.selection = sel; this.render();
        const pick = !sel ? null : sel.kind === 'node' ? this.graph.nodes[sel.id] : sel.kind === 'group' ? this.graph.groups?.[sel.id] : this.graph.wires[sel.id];
        this.hooks.onSelect?.(pick ?? null, sel?.kind ?? null);
    }

    async deleteSelection() {
        if (!this.graph || !this.#canEdit()) return false;
        if (this.wireMulti.size || this.selection?.kind === 'wire') {
            const ids = this.wireMulti.size ? [...this.wireMulti] : [this.selection.id];
            const bridge = this.#nativeBridge(); if (!bridge) return false;
            const result = bridge.disconnectWires(ids); this.updateNativeWire(result.view, result.requests); return true;
        }
        const sel = this.multi.size > 1 ? { kind: 'nodes', ids: [...this.multi] } : this.selection && { ...this.selection };
        return sel && this.hooks.onNativeDelete ? this.hooks.onNativeDelete(sel) : false;
    }
}
