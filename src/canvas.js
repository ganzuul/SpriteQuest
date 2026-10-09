import { operationFor } from './workflow/catalog.js?v=0.19.1';
import { isNativeWorkflow } from './workflow/contracts.js?v=0.19.1';
/**
 * Lattice — the canvas renderer.
 *
 * Keyed Svelte components render SVG wires and absolutely positioned cards.
 * The native controller owns graph edits, cached geometry and frame scheduling;
 * camera motion only changes the viewport and grid. The compiled UI ships with
 * the extension, and its ordinary DOM elements inherit the SillyTavern theme.
 *
 * Flow is top to bottom: the out port sits on the bottom edge, the in port on
 * the top edge, and wires curve downward. Reading order follows vertical
 * position, so the picture and the prompt agree.
 */

import {
    NODE_TYPES, WIRE_KINDS, connect, disconnect, removeNode, touchGraph, wiresInto, deciderKeys, outPorts, hasPorts,
    groupMembers, ungroup, deleteGroup, groupOf, inOffGroup, settleOnBlankets, gatherBlanket, setGroupEnabled, blanketAt, GROUP_MIN,
} from './state.js?v=0.19.1';
import { selectLabel } from './select.js?v=0.19.1';
import { graphPoint, zoomAt, wheelFactor } from './canvas/camera.js?v=0.19.1';
import { createFrameScheduler } from './canvas/frame.js?v=0.19.1';
import { selectionMode, rectangle, intersects, combineSelection } from './canvas/selection.js?v=0.19.1';
import { createGeometryCache, indexIncidentWires } from './canvas/geometry.js?v=0.19.1';
import { nodeCard } from './canvas/presentation.js?v=0.19.1';
import { mountCanvas } from '../dist/lattice-ui.js?v=0.19.1';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Text that goes into innerHTML. Block titles and rules can come from a pasted or imported canvas. */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

const WIRE_LABEL = {
    [WIRE_KINDS.MERGE]: 'merge',
    [WIRE_KINDS.APPEND]: 'append',
    [WIRE_KINDS.PREPEND]: 'prepend',
};

/** Not a data wire — a tie saying "send these two at the same time". */
const TOGETHER_LABEL = 'together';

const TYPE_LABEL = {
    [NODE_TYPES.WORKFLOW]: 'Workflow',
    [NODE_TYPES.PROMPT]: 'Prompt',
    [NODE_TYPES.ST]: 'SillyTavern',
    [NODE_TYPES.HISTORY]: 'History',
    [NODE_TYPES.INJECTION]: 'Injection',
    [NODE_TYPES.GENERATE]: 'Generate',
    [NODE_TYPES.OUTPUT]: 'Output',
    [NODE_TYPES.NOTE]: 'Note',
    [NODE_TYPES.DECIDER]: 'Decider',
    [NODE_TYPES.LOREBOOK]: 'Lorebook',
    [NODE_TYPES.STATE]: 'State',
    [NODE_TYPES.MEMORY]: 'Memory',
};

/** A symbol per block type, so a canvas can be read at a glance. */
const TYPE_ICON = {
    [NODE_TYPES.WORKFLOW]: 'fa-cube',
    [NODE_TYPES.PROMPT]: 'fa-align-left',
    [NODE_TYPES.ST]: 'fa-book',
    [NODE_TYPES.HISTORY]: 'fa-comments',
    [NODE_TYPES.INJECTION]: 'fa-syringe',
    [NODE_TYPES.GENERATE]: 'fa-wand-magic-sparkles',
    [NODE_TYPES.OUTPUT]: 'fa-paper-plane',
    [NODE_TYPES.NOTE]: 'fa-note-sticky',
    [NODE_TYPES.DECIDER]: 'fa-code-fork',
    [NODE_TYPES.LOREBOOK]: 'fa-book-atlas',
    [NODE_TYPES.STATE]: 'fa-gauge-high',
    [NODE_TYPES.MEMORY]: 'fa-floppy-disk',
};

/** Whether the last decision took this output. Decisions used to name one key; now a list. */
const took = (chosen, id) => Array.isArray(chosen) ? chosen.includes(id) : chosen === id;

/** A Decider's routing mode, in words. Mirrors routingMode() in compile.js. */
const ROUTING_WORDS = { all: 'every output that matches fires', first: 'the first output that matches fires', random: 'a weighted random pick', ai: 'the AI picks the outputs that apply' };
function routingOf(node) {
    if (node?.mode === null || node?.mode === '') return null;
    if (node?.mode === undefined || node.mode === 'rules') return 'first';
    return ROUTING_WORDS[node.mode] ? node.mode : 'first';
}

/** One rule, in a few words, for the face of a block. */
export function ruleLabel(c) {
    if (!c) return '';
    if (c.not) return `NOT ${ruleLabel({ ...c, not: false })}`;
    const OP = { gt: '>', lt: '<', gte: '\u2265', lte: '\u2264', eq: '=', every: 'every' };
    const terms = () => String(c.terms || '').split('\n').map(t => t.trim()).filter(Boolean);
    switch (c.mode) {
        case 'probability': return `${c.chance ?? 100}% of the time`;
        case 'expr': return String(c.formula ?? '').trim() || 'no formula yet';
        case 'search': {
            const t = terms();
            const where = { incoming: 'input', lastUser: 'user msg', lastAssistant: 'last reply', lastN: `last ${c.n || 3}`, chat: 'chat' }[c.scope || 'lastUser'] ?? '';
            if (!t.length) return 'no terms yet';
            const shown = t.slice(0, 3).map(x => `"${x}"`).join(', ') + (t.length > 3 ? ` +${t.length - 3}` : '');
            return `${c.matchMode === 'none' ? 'no' : c.matchMode === 'all' ? 'all of' : ''} ${shown} in ${where}`.trim();
        }
        case 'variable': return `${c.name || 'var'} ${c.op || 'eq'} ${c.value ?? ''}`;
        case 'model': return `model ~ ${c.value || '?'}`;
        case 'time': return `${c.from || '?'}\u2013${c.to || '?'}${Array.isArray(c.days) && c.days.length ? ' on some days' : ''}`;
        case 'chat': return c.what === 'lastSpeaker'
            ? `last speaker: ${c.value || 'user'}`
            : `${c.what === 'turn' ? 'turns' : 'messages'} ${OP[c.op || 'gte']} ${c.value ?? 0}`;
        case 'length': return `input ${OP[c.op || 'gt']} ${c.value ?? 0} ${c.unit === 'chars' ? 'chars' : 'words'}`;
        case 'character': return `character ~ ${c.value || '?'}`;
        case 'lacks': {
            const t = terms();
            if (!t.length) return 'no terms yet';
            const where = { incoming: 'input', lastUser: 'user msg', lastAssistant: 'last reply', lastN: `last ${c.n || 3}`, chat: 'chat' }[c.scope || 'incoming'] ?? '';
            return `no ${t.slice(0, 3).map(x => `"${x}"`).join(', ')}${t.length > 3 ? ` +${t.length - 3}` : ''} in ${where}`;
        }
        case 'number': {
            const SRC = { words: 'words', chars: 'chars', found: 'hits', messages: 'messages', turns: 'turns', roll: 'd100', variable: c.name || 'var' };
            return `${SRC[c.source || 'words'] ?? c.source} ${c.op === 'every' ? 'multiple of' : OP[c.op || 'gt']} ${c.value ?? 0}`;
        }
        case 'ai': {
            const q = String(c.question ?? '').trim();
            return q ? `${c.engine === 'jev' ? 'Jev' : 'AI'} says yes: "${q.length > 40 ? q.slice(0, 40) + '\u2026' : q}"` : 'no question yet';
        }
        default: return c.mode;
    }
}

export class Canvas {
    /**
     * @param {HTMLElement} host
     * @param {{onSelect?:Function, onChange?:Function, onOpen?:Function, onContextMenu?:Function}} hooks
     */
    constructor(host, hooks = {}) {
        this.host = host;
        this.hooks = hooks;
        this.graph = null;
        this.selection = null;      // {kind:'node'|'wire'|'group', id}
        this.multi = new Set();     // blocks picked with Shift-click or a Shift-drag box
        this.marquee = null;
        this.drag = null;
        this.linking = null;
        this.nativeWireView = null;
        this.wireMulti = new Set();
        this.wireSelections = new Map();
        this.nativeCaptures = new Set();
        this.trace = null;          // last compile trace, keyed by node id
        this.tokens = null;         // live token counts, keyed by node id
        this.tokensKey = '';
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
            hover: id => this.setHover(id),
            toggle: id => {
                const node = this.graph?.nodes[id]; if (!node || !this.#canEdit()) return;
                if (isNativeWorkflow(this.graph)) { this.hooks.onNativeToggle?.(id); return; }
                node.enabled = node.enabled === false; touchGraph(this.graph); this.render(); this.hooks.onChange?.();
            },
            help: id => this.hooks.onHelp?.(this.graph?.nodes[id]),
            model: (id, anchor) => this.hooks.onModelClick?.(this.graph?.nodes[id], anchor),
            group: (id, action) => { if (action === 'toggle') this.toggleGroup(id); else this.setCollapsed(id, action === 'collapse'); },
        });
        this.viewport = this.layer.viewport; this.svg = this.layer.svg; this.nodeLayer = this.layer.nodeLayer;

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

    /* -------------------------------------------------------------- */
    /* view                                                            */
    /* -------------------------------------------------------------- */

    get view() {
        this.graph.view ??= { x: 0, y: 0, zoom: 1 };
        return this.graph.view;
    }

    setGraph(graph) {
        if (!graph) return;
        this.cancelGesture();
        if (this.nativeSelectionKey) this.wireSelections.set(this.nativeSelectionKey, [...this.wireMulti]);
        if (graph !== this.graph) { this.trace = null; this.tokens = null; this.tokensKey = ''; this.hoverPin = null; this.geometry.clear(); }
        this.graph = graph;
        this.selection = null;
        this.multi.clear();
        const scope = this.hooks.nativeScope?.();
        if (scope?.workflowId && this.nativeSelectionRoot !== scope.workflowId) this.wireSelections.clear();
        this.nativeSelectionRoot = scope?.workflowId ?? this.nativeSelectionRoot;
        this.nativeSelectionKey = scope?.workflowId && Array.isArray(scope.instancePath) ? JSON.stringify([scope.workflowId, scope.instancePath]) : null;
        this.wireMulti = new Set((this.wireSelections.get(this.nativeSelectionKey) ?? []).filter(id => graph.wires[id]));
        this.nativeWireView = null;
        this.render();
    }

    setTrace(trace) {
        this.trace = new Map((trace ?? []).map(t => [t.id, t]));
        this.render();
    }

    /**
     * Token counts for the blocks, worked out in the background as you edit.
     * @param {Map<string, {own?:number, in?:number, out?:number, total?:number, exact?:boolean}>|null} map
     */
    setTokens(map) {
        const key = map ? JSON.stringify([...map]) : '';
        if (key === this.tokensKey) return;
        this.tokensKey = key;
        this.tokens = map;
        this.render();
    }

    /** The token chip for a block's header, or null. */


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

    /** Screen coordinates to graph coordinates. */
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
            else if (g.frame) boxes.push(g.frame);
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
        const shelf = isNativeWorkflow(this.graph) ? this.host.parentElement?.querySelector('.pc-node-shelf') : null;
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

    /* -------------------------------------------------------------- */
    /* rendering                                                       */
    /* -------------------------------------------------------------- */

    render(presentationOnly = false) {
        if (!this.graph) return;
        if (!presentationOnly && !isNativeWorkflow(this.graph)) this.hooks.prepareRender?.();
        this.incident = indexIncidentWires(Object.values(this.graph.wires));
        this.applyTransform();
        this.#drawNodes();
        this.#drawWires();
        this.#applyFocus();
    }

    /**
     * What feeds a block: every block whose text ends up in it, and the wires
     * that carry it. It stops at a Generate block, because only its answer
     * travels on, not what went into it. Blocks that only switch it on
     * (Activate wires) are returned separately.
     */
    feeders(nodeId) {
        const nodes = new Set();
        const wires = new Set();
        const switches = new Set();
        const stack = [nodeId];
        const seen = new Set();
        while (stack.length) {
            const id = stack.pop();
            if (seen.has(id)) continue;
            seen.add(id);
            for (const w of Object.values(this.graph.wires)) {
                if (w.to !== id || w.kind === WIRE_KINDS.TOGETHER || w.loop) continue;
                const src = this.graph.nodes[w.from];
                if (!src) continue;
                wires.add(w.id);
                if (w.mode === 'activate') { if (!nodes.has(src.id)) switches.add(src.id); continue; }
                nodes.add(src.id);
                switches.delete(src.id);
                if (src.type !== NODE_TYPES.GENERATE || src.forward === 'all') stack.push(src.id);
            }
        }
        return { nodes, wires, switches };
    }

    /** Light up what feeds the hovered block, or else the selected one. */
    #applyFocus() {
        if (isNativeWorkflow(this.graph)) {
            this.host.classList.remove('pc-focusing');
            for (const node of this.nodeLayer.querySelectorAll('.pc-node')) node.classList.remove('pc-feeds', 'pc-switches', 'pc-focus');
            const pin = this.hoverPin;
            for (const path of this.svg.querySelectorAll('path.pc-wire')) {
                const wire = this.graph.wires[path.dataset.id];
                const attached = pin && wire && (pin.dir === 'in' ? wire.to === pin.nodeId && (wire.toPort || 'in') === pin.port : wire.from === pin.nodeId && (wire.fromPort || 'out') === pin.port);
                path.classList.toggle('pc-wire-feeds', !!attached);
            }
            return;
        }
        const id = this.hoverId ?? (this.selection?.kind === 'node' ? this.selection.id : null);
        const f = id && this.graph?.nodes[id] ? this.feeders(id) : null;
        this.host.classList.toggle('pc-focusing', !!f && (f.nodes.size + f.switches.size) > 0);
        for (const el of this.nodeLayer.querySelectorAll('.pc-node')) {
            const nid = el.dataset.id;
            el.classList.toggle('pc-feeds', !!f?.nodes.has(nid));
            el.classList.toggle('pc-switches', !!f?.switches.has(nid));
            el.classList.toggle('pc-focus', !!f && nid === id);
        }
        for (const p of this.svg.querySelectorAll('path.pc-wire')) {
            p.classList.toggle('pc-wire-feeds', !!f?.wires.has(p.dataset.id));
        }
    }

    /** Hovering a block shows what feeds it. */
    setHover(id) {
        if (this.hoverId === id) return;
        this.hoverId = id;
        this.#applyFocus();
    }

    /** Nodes with a path to Output. Anything else is decoration. */
    #reaching() {
        const out = Object.values(this.graph.nodes).find(n => n.type === NODE_TYPES.OUTPUT);
        const seen = new Set();
        if (!out) return seen;
        // Output, and every Memory block something is saved into.
        const stack = [out.id, ...Object.values(this.graph.wires).filter(w => w.kind === WIRE_KINDS.SAVE).map(w => w.to)];
        while (stack.length) {
            const id = stack.pop();
            if (seen.has(id)) continue;
            seen.add(id);
            for (const w of Object.values(this.graph.wires)) {
                if (w.to === id) stack.push(w.from);
            }
        }
        return seen;
    }

    #drawNodes() {
        this.reaching = this.#reaching();
        const groups = this.graph.groups ?? {};
        if (!isNativeWorkflow(this.graph)) for (const [gid, g] of Object.entries(groups)) if ((g.collapsed || !g.frame) && !Object.values(this.graph.nodes).some(n => n.inGroup === gid)) delete groups[gid];
        const context = { graph: this.graph, selection: this.selection, multi: this.multi, trace: this.trace, tokens: this.tokens, reaching: this.reaching, hooks: this.hooks, preview: node => this.#preview(node), ruleLabel, labels: TYPE_LABEL, icons: TYPE_ICON };
        const cards = Object.values(this.graph.nodes).filter(n => !this.#folded(n)).sort((a, b) => (a.y - b.y) || (a.x - b.x)).map(node => nodeCard(node, context));
        this.layer.setNodes(cards);
        this.resizeObserver?.disconnect(); this.nodeElements.clear();
        this.#measureCards('.pc-node[data-id]');
        this.layer.setGroups(Object.values(groups).map(g => this.#groupCard(g)));
        this.#measureCards('.pc-node-group');
        this.geometry.retain(this.nodeElements.keys());
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

    /** Shared graph-space resolver for native paths, drafts and future named-pin gestures. No DOM reads. */
    endpoint(nodeId, direction, portId = direction) {
        const node = this.graph?.nodes[nodeId], offset = this.geometry.endpoint(nodeId, direction, portId);
        return node && offset ? { ...offset, x: node.x + offset.x, y: node.y + offset.y } : null;
    }

    #folded(node) {
        const g = groupOf(this.graph, node);
        return g?.collapsed ? g : null;
    }

    /** Wires crossing a group's edge: what comes in and what goes out. */
    #groupEdges(gid) {
        const inside = (id) => this.graph.nodes[id]?.inGroup === gid;
        const ins = [], outs = [];
        for (const w of Object.values(this.graph.wires)) {
            if (w.kind === WIRE_KINDS.TOGETHER || w.loop) continue;
            if (inside(w.to) && !inside(w.from)) ins.push(w);
            if (inside(w.from) && !inside(w.to)) outs.push(w);
        }
        return { ins, outs };
    }

    /** A folded group, drawn as one block. */
    #groupCard(g) {
        const members = groupMembers(this.graph, g.id).sort((a, b) => (a.y - b.y) || (a.x - b.x));
        if (!g.collapsed && !isNativeWorkflow(this.graph)) this.#groupFrame(g);
        const frame = g.frame ?? { x: g.x, y: g.y, w: g.w || 260, h: 140 };
        const selected = this.selection?.kind === 'group' && this.selection.id === g.id;
        const multi = members.length && members.every(n => this.multi.has(n.id));
        const groupTokens = members.reduce((n, m) => n + (this.tokens?.get(m.id)?.own ?? 0), 0);
        const edges = this.#groupEdges(g.id), name = id => this.graph.nodes[id]?.title || 'Untitled';
        const ins = [...new Set(edges.ins.map(w => name(w.from)))], outs = [...new Set(edges.outs.map(w => name(w.to)))];
        return {
            id: g.id, collapsed: !!g.collapsed, x: g.collapsed ? g.x : frame.x, y: g.collapsed ? g.y : frame.y, w: g.collapsed ? g.w || 260 : frame.w, h: frame.h,
            className: g.collapsed ? 'pc-node pc-node-group' + (selected ? ' pc-selected' : '') + (multi ? ' pc-multi' : '') + (g.enabled === false ? ' pc-off pc-group-is-off' : '') : 'pc-group-frame' + (selected ? ' pc-selected' : '') + (g.enabled === false ? ' pc-group-is-off' : '') + (members.length ? '' : ' pc-group-empty'),
            title: g.title || 'Group', enabled: g.enabled !== false,
            body: (g.component && !this.graph.nativeCards ? 'Surface · maximum ' + members.reduce((sum, node) => { const bound = operationFor(node)?.requestBound || 0; return sum + (typeof bound === 'function' ? bound(node) : bound); }, 0) + ' auxiliary requests · ' : '') + members.length + ' blocks: ' + members.map(n => n.title || 'Untitled').join(' · '),
            io: (ins.length ? 'in: ' + ins.join(', ') : 'nothing wired in') + '  →  ' + (outs.length ? 'out: ' + outs.join(', ') : 'goes nowhere'),
            count: members.length ? members.length + ' block' + (members.length === 1 ? '' : 's') : 'empty — drag blocks onto it',
            token: groupTokens && g.enabled !== false ? { className: 'pc-tok', text: groupTokens >= 1000 ? (groupTokens / 1000).toFixed(1) + 'k tok' : groupTokens + ' tok', title: 'The blocks in this group add ' + groupTokens.toLocaleString() + ' tokens of their own text.' } : null,
        };
    }

    heightOf(node) {
        return this.geometry.get(node?.id);
    }

    #nativeCard(node) { return node && (this.graph?.nativeCards?.[node.id] ?? this.hooks.nativeCard?.(node)); }
    widthOf(node) { return this.#nativeCard(node) || (!this.graph?.nativeCards && operationFor(node)) ? this.geometry.width(node.id) : node?.w || 260; }

    /**
     * An open group: a blanket on the canvas. Whatever rests on it is in the
     * group. It grows to keep its blocks on it, has a corner to resize it,
     * a switch for the whole group, and a button to fold it into one block.
     */
    #groupFrame(g) {
        const members = groupMembers(this.graph, g.id);
        if (!g.frame) {
            // A group from before blankets, or one just made from picked
            // blocks: lay the blanket around its blocks.
            if (!members.length) return;
            let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
            for (const n of members) {
                x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y);
                x1 = Math.max(x1, n.x + this.widthOf(n)); y1 = Math.max(y1, n.y + this.heightOf(n));
            }
            g.frame = { x: x0 - 24, y: y0 - 48, w: x1 - x0 + 48, h: y1 - y0 + 72 };
        }
        const f = g.frame;
        // Blocks grow as you type; the blanket grows with them.
        for (const n of members) {
            const right = n.x + this.widthOf(n) + 16, bottom = n.y + this.heightOf(n) + 16;
            if (right > f.x + f.w) f.w = Math.round(right - f.x);
            if (bottom > f.y + f.h) f.h = Math.round(bottom - f.y);
        }
    }



    toggleGroup(gid) {
        if (!this.#canEdit() || isNativeWorkflow(this.graph)) return;
        const g = this.graph.groups?.[gid];
        if (!g) return;
        setGroupEnabled(this.graph, gid, g.enabled === false);
        this.render();
        this.hooks.onChange?.();
    }

    /**
     * Put blocks on the blanket they now rest on (or take them off one).
     * Call after adding blocks somewhere, so a block dropped on an open
     * group joins it.
     */
    settle(ids) {
        if (!this.graph || !this.#canEdit() || isNativeWorkflow(this.graph)) return false;
        return settleOnBlankets(this.graph, ids, (n) => this.heightOf(n), (n) => this.widthOf(n));
    }

    /** While blocks are dragged, light up the blanket they would land on. */
    #hoverBlanket(ids) {
        let target = null;
        for (const id of ids) {
            const n = this.graph.nodes[id];
            if (!n || n.type === NODE_TYPES.OUTPUT) continue;
            target = blanketAt(this.graph, n.x + this.widthOf(n) / 2, n.y + this.heightOf(n) / 2)?.id ?? null;
            break;
        }
        for (const fr of this.nodeLayer.querySelectorAll('.pc-group-frame')) {
            fr.classList.toggle('pc-group-drop', fr.dataset.group === target);
        }
    }

    #paintMulti() {
        for (const el of this.nodeLayer.querySelectorAll('.pc-node[data-id]')) {
            el.classList.toggle('pc-multi', this.multi.has(el.dataset.id));
        }
        for (const el of this.nodeLayer.querySelectorAll('.pc-node-group')) {
            const members = groupMembers(this.graph, el.dataset.group);
            el.classList.toggle('pc-multi', members.length > 0 && members.every(n => this.multi.has(n.id)));
        }
    }

    /** Pick several blocks (Shift-click, or a Shift-drag box). */
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
        this.#applyFocus();
        this.hooks.onSelect?.(this.selection ? this.graph.nodes[this.selection.id] : null, this.selection?.kind ?? null);
        this.hooks.onMulti?.([...this.multi]);
    }

    #pickedIds() {
        const ids = new Set(this.multi);
        if (this.selection?.kind === 'node') ids.add(this.selection.id);
        if (this.selection?.kind === 'group') for (const n of groupMembers(this.graph, this.selection.id)) ids.add(n.id);
        return ids;
    }

    #selectedGroupStarts() {
        return Object.values(this.graph.groups ?? {}).filter(g => g.collapsed && groupMembers(this.graph, g.id).every(n => this.multi.has(n.id)))
            .map(g => ({ id: g.id, x: g.x, y: g.y, frame: g.frame && { ...g.frame } }));
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
        if (!boxes.length) return;
        const minX = Math.min(...boxes.map(b => b.x)) - 60, minY = Math.min(...boxes.map(b => b.y)) - 60;
        const maxX = Math.max(...boxes.map(b => b.x + b.w)) + 60, maxY = Math.max(...boxes.map(b => b.y + b.h)) + 60;
        const rect = this.host.getBoundingClientRect();
        const zoom = Math.max(0.25, Math.min(1.2, rect.width / (maxX - minX), rect.height / (maxY - minY)));
        Object.assign(this.view, { zoom, x: (rect.width - (minX + maxX) * zoom) / 2, y: (rect.height - (minY + maxY) * zoom) / 2 });
        this.applyTransform();
    }

    /** Restore a gesture without persisting a half-completed graph edit. */
    cancelGesture(reason = 'cancel') {
        this.operationEpoch++;
        const bridge = this.#nativeBridge();
        const active = !!(this.drag || this.marquee || this.pan || this.linking || bridge?.hasContentGesture());
        if (bridge) { const result = bridge.cancel(reason); this.updateNativeWire(result.view, result.requests); }
        const wheeling = !!this.wheelRect;
        this.frames.cancel(); clearTimeout(this.wheelTimer);
        this.gestureRect = null; this.wheelRect = null;
        const d = this.drag;
        if (d && this.graph) {
            for (const [id, x, y] of d.starts ?? d.several ?? []) {
                const n = this.graph.nodes[id]; if (n) { n.x = x; n.y = y; }
            }
            if (d.id && this.graph.nodes[d.id]) Object.assign(this.graph.nodes[d.id], { x: d.homeX, y: d.homeY });
            for (const start of d.groups ?? []) {
                const group = this.graph.groups?.[start.id];
                if (group) { group.x = start.x; group.y = start.y; if (start.frame) group.frame = { ...start.frame }; }
            }
            const g = this.graph.groups?.[d.group ?? d.resize];
            if (g && d.resize && g.frame) Object.assign(g.frame, { w: d.w, h: d.h });
            else if (g) { g.x = d.gx; g.y = d.gy; if (g.frame && d.fx !== undefined) Object.assign(g.frame, { x: d.fx, y: d.fy }); }
        }
        if (this.pan?.start && this.graph) Object.assign(this.view, this.pan.start);
        this.marquee?.box.remove();
        this.drag = null; this.marquee = null; this.pan = null; this.linking = null;
        this.nativeMouseSuppressed = false;
        this.spaceDown = false;
        this.host.classList.remove('pc-panning', 'pc-interacting', 'pc-tying', 'pc-space-pan');
        this.hooks.onNodeOverFolder?.(null); this.hooks.onDragBlock?.(false);
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
        if (wheeling && this.graph && !isNativeWorkflow(this.graph)) touchGraph(this.graph);
        return active;
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

    /** Fold or unfold a group. A folded group sits where its top-left block was. */
    setCollapsed(gid, collapsed) {
        if (!this.#canEdit() || isNativeWorkflow(this.graph)) return;
        const g = this.graph.groups?.[gid];
        if (!g) return;
        if (collapsed) {
            // Whatever rests on the blanket is the group.
            if (g.frame) gatherBlanket(this.graph, gid, (n) => this.heightOf(n), (n) => this.widthOf(n));
            const members = groupMembers(this.graph, gid);
            if (!members.length) {
                this.hooks.onToast?.('Put some blocks on the blanket first, then fold it.');
                return;
            }
            g.x = g.frame ? g.frame.x : Math.min(...members.map(n => n.x));
            g.y = g.frame ? g.frame.y : Math.min(...members.map(n => n.y));
        } else if (g.frame) {
            // The folded block may have been moved; the blanket comes along.
            const dx = g.x - g.frame.x, dy = g.y - g.frame.y;
            g.frame.x += dx; g.frame.y += dy;
        }
        g.collapsed = collapsed;
        touchGraph(this.graph);
        this.render();
        this.hooks.onChange?.();
    }



    #preview(node) {
        switch (node.type) {
            case NODE_TYPES.PROMPT:
                return (node.content || '').slice(0, 180) || 'Empty prompt';
            case NODE_TYPES.ST: {
                if (!node.identifier) return 'No prompt chosen';
                if (node.override?.content !== undefined) {
                    return String(node.override.content).slice(0, 180) || 'Overridden, and empty';
                }
                const text = this.hooks.stPreview?.(node) ?? '';
                if (text) return String(text).slice(0, 180);
                return 'Nothing in it right now';
            }
            case NODE_TYPES.GENERATE: {
                // Say how the question is put together, so the order is
                // visible without opening the block.
                const own = String(node.content ?? '').trim();
                const inputs = Object.values(this.graph.wires)
                    .filter(w => w.to === node.id && w.kind !== WIRE_KINDS.TOGETHER && !w.loop)
                    .map(w => this.graph.nodes[w.from]).filter(Boolean)
                    .sort((a, b) => (a.y - b.y) || (a.x - b.x));
                const n = inputs.length;
                const wired = `${n} wired block${n === 1 ? '' : 's'}`;
                if (!own && !n) return 'Nothing to ask yet. Wire blocks in above, or write an instruction.';
                if (!own) return `${wired}. The last one, "${inputs[n - 1].title}", is the instruction.`;
                const text = `"${own.slice(0, 140)}${own.length > 140 ? '\u2026' : ''}"`;
                if (!n) return text;
                return node.contentPosition === 'before' ? `${text}, then ${wired}` : `${wired}, then ${text}`;
            }
            case NODE_TYPES.HISTORY: {
                const span = node.count > 0
                    ? `Last ${node.count} messages${node.skip ? `, skipping ${node.skip}` : ''}`
                    : 'Whole chat';
                return node.format === 'prose'
                    ? `${span}, as prose${node.nameStyle && node.nameStyle !== 'none' ? ` with ${node.nameStyle} labels` : ' with no speaker labels'}`
                    : `${span}, as turns`;
            }
            case NODE_TYPES.INJECTION:
                return (node.sources || []).join(', ') || 'Nothing selected';
            case NODE_TYPES.LOREBOOK: {
                const src = node.sources ?? {};
                const from = [src.chat && 'chat', src.character && 'character', src.persona && 'persona', src.global && 'global']
                    .filter(Boolean).concat((node.books ?? []).map(b => `"${b}"`));
                const how = {
                    st: 'as SillyTavern would',
                    scan: node.scanFrom === 'chat' ? `keys in the last ${node.scanDepth || 4} messages` : 'keys in the text wired in',
                    all: 'every entry', constant: 'constant entries', picked: `${(node.picked ?? []).length} picked entries`,
                }[node.mode ?? 'st'];
                const bits = [how];
                if (node.memoryOnly) bits.push('Memory Books only');
                if (Number(node.maxEntries) > 0) bits.push(`max ${node.maxEntries}`);
                if (Number(node.tokenBudget) > 0) bits.push(`\u2264${node.tokenBudget} tok`);
                if (node.excludeFromWI) bits.push('kept out of World Info');
                return `${from.length ? from.join(' + ') : 'no lorebooks chosen'} \u00b7 ${bits.join(' \u00b7 ')}`;
            }
            case NODE_TYPES.NOTE:
                return node.content || '';
            case NODE_TYPES.MEMORY: {
                const text = this.hooks.memoryPreview?.(node) ?? node.content ?? '';
                return String(text).slice(0, 180) || 'Empty. Wire a Generate block into it to save its answers here.';
            }
            case NODE_TYPES.OUTPUT:
                return 'Everything wired here is sent, top to bottom.';
            case NODE_TYPES.DECIDER:
                return '';
            default:
                return '';
        }
    }

    #nodeEl(id) {
        return this.nodeElements.get(id) ?? null;
    }

    /**
     * Which block a wire being drawn would connect to: the block under the
     * pointer (anywhere on it, not just its port), or failing that the
     * nearest port within a generous reach, so a near miss still lands.
     */
    #linkTarget(e) {
        const link = this.linking;
        if (!link) return null;
        const under = document.elementFromPoint?.(e.clientX, e.clientY) ?? e.target;
        if (isNativeWorkflow(this.graph)) {
            const pin = under?.closest?.('.pc-port[data-node]');
            const valid = pin && pin.dataset.node !== link.nodeId && pin.dataset.dir === (link.dir === 'out' ? 'in' : 'out');
            link.targetPort = valid ? { nodeId: pin.dataset.node, dir: pin.dataset.dir, port: pin.dataset.port } : null;
            return link.targetPort?.nodeId ?? null;
        }
        // A folded group under the pointer: the group itself, sorted out on drop.
        const gel = under?.closest?.('.pc-node-group');
        if (gel && gel.dataset.group !== link.groupId && link.dir !== 'tie') return `group:${gel.dataset.group}`;
        const hit = under?.closest?.('.pc-port')?.dataset.node ?? under?.closest?.('.pc-node[data-id]')?.dataset.id ?? null;
        if (hit && hit !== link.nodeId && !(link.groupId && this.graph.nodes[hit]?.inGroup === link.groupId)) return hit;

        const p = this.toGraph(e.clientX, e.clientY);
        const reach = 36 / (this.view?.zoom || 1);
        let best = null, bestD = reach;
        for (const n of Object.values(this.graph.nodes)) {
            if (n.id === link.nodeId || n.type === NODE_TYPES.NOTE) continue;
            // Blocks folded away in a group are not on screen: the group stands in for them.
            if (this.#folded(n)) continue;
            if (link.groupId && n.inGroup === link.groupId) continue;
            if (link.dir === 'tie' && n.type !== NODE_TYPES.GENERATE) continue;
            const q = link.dir === 'tie'
                ? this.#sidePos(n.id, p.x < n.x + (n.w || 260) / 2 ? 'left' : 'right')
                : link.dir === 'in' && hasPorts(n)
                    ? this.#portPos(n.id, 'out', this.#nearestKey(n.id, p))
                    : this.#portPos(n.id, link.dir === 'out' ? 'in' : 'out');
            const d = Math.hypot(q.x - p.x, q.y - p.y);
            if (d < bestD) { bestD = d; best = n.id; }
        }
        if (link.dir !== 'tie') {
            for (const g of Object.values(this.graph.groups ?? {})) {
                if (!g.collapsed || g.id === link.groupId) continue;
                const q = this.#groupPortPos(g, link.dir === 'out' ? 'in' : 'out');
                const d = Math.hypot(q.x - p.x, q.y - p.y);
                if (d < bestD) { bestD = d; best = `group:${g.id}`; }
            }
        }
        return best;
    }

    /** A folded group's top (in) or bottom (out) dot, in graph coordinates. */
    #groupPortPos(g, dir) {
        const gh = this.geometry.get(`group:${g.id}`, 80);
        const gw = g.w || 260;
        return dir === 'out' ? { x: g.x + gw / 2, y: g.y + gh } : { x: g.x + gw / 2, y: g.y };
    }

    /**
     * The blocks a group is wired through. Entries: blocks nothing else in
     * the group feeds (where wires coming in should go). Exits: blocks that
     * feed nothing else in the group (where wires going out leave from).
     * A group can name its own with "Wires in go to" / "Wires out leave from".
     */
    groupEnds(gid) {
        const g = this.graph.groups?.[gid];
        const members = groupMembers(this.graph, gid).filter(n => n.type !== NODE_TYPES.NOTE)
            .sort((a, b) => (a.y - b.y) || (a.x - b.x));
        const inside = new Set(members.map(n => n.id));
        const internal = Object.values(this.graph.wires).filter(w => inside.has(w.from) && inside.has(w.to) && w.kind !== WIRE_KINDS.TOGETHER && w.kind !== WIRE_KINDS.SAVE);
        let entries = members.filter(n => !internal.some(w => w.to === n.id));
        let exits = members.filter(n => n.type !== NODE_TYPES.OUTPUT && !internal.some(w => w.from === n.id));
        if (!entries.length) entries = members;
        if (!exits.length) exits = members;
        if (g?.entry && inside.has(g.entry)) entries = [this.graph.nodes[g.entry]];
        if (g?.exit && inside.has(g.exit)) exits = [this.graph.nodes[g.exit]];
        return { members, entries, exits };
    }

    /**
     * Which block inside a group a wire should use. One obvious choice is
     * taken; otherwise the panel asks (a small menu at the pointer).
     * @returns {Promise<{id: string, port: string|null}|null>}
     */
    async #pickInGroup(gid, side, e) {
        const { members, entries, exits } = this.groupEnds(gid);
        const likely = side === 'in' ? entries : exits;
        // An exit with named dots (a Decider, a State block) needs one of them.
        const options = (list) => list.flatMap(n => side === 'out' && hasPorts(n)
            ? outPorts(n).map(k => ({ id: n.id, port: k.id, label: `${n.title || 'Untitled'} \u203a ${k.name || 'key'}` }))
            : [{ id: n.id, port: null, label: n.title || 'Untitled' }]);
        const first = options(likely);
        if (first.length === 1) return first[0];
        const rest = options(members.filter(n => !likely.includes(n)));
        if (!this.hooks.onPickMember) return first[0] ?? null;
        return await this.hooks.onPickMember({
            group: this.graph.groups[gid], side, likely: first, others: rest,
            clientX: e.clientX, clientY: e.clientY,
        });
    }



    #portPos(nodeId, dir, portId = null) {
        const node = this.graph.nodes[nodeId];
        if (!node) return { x: 0, y: 0 };
        const fold = this.#folded(node);
        if (fold) {
            const gh = this.geometry.get(`group:${fold.id}`, 80);
            const gw = fold.w || 260;
            return dir === 'out' ? { x: fold.x + gw / 2, y: fold.y + gh } : { x: fold.x + gw / 2, y: fold.y };
        }
        const w = node.w || 260;
        const h = this.geometry.get(nodeId);
        if (this.#nativeCard(node) || (!this.graph.nativeCards && operationFor(node))) return this.endpoint(nodeId, dir, portId || dir) ?? { x: node.x + (dir === 'out' ? this.widthOf(node) : 0), y: node.y + h / 2 };
        if (dir === 'out' && hasPorts(node)) {
            const keys = outPorts(node);
            const i = Math.max(0, keys.findIndex(k => k.id === portId));
            return { x: node.x + w * (i + 1) / (keys.length + 1), y: node.y + h };
        }
        return dir === 'out'
            ? { x: node.x + w / 2, y: node.y + h }
            : { x: node.x + w / 2, y: node.y };
    }

    /** The Decider key whose port is nearest a point, for a drop that did not name one. */
    #nearestKey(nodeId, p) {
        const node = this.graph.nodes[nodeId];
        let best = null, bestD = Infinity;
        for (const k of outPorts(node)) {
            const q = this.#portPos(nodeId, 'out', k.id);
            const d = Math.abs(q.x - p.x);
            if (d < bestD) { bestD = d; best = k.id; }
        }
        return best;
    }

    /** Middle of a node's left or right edge, in graph coordinates. */
    #sidePos(nodeId, side) {
        const node = this.graph.nodes[nodeId];
        if (!node) return { x: 0, y: 0 };
        const fold = this.#folded(node);
        if (fold) return { x: side === 'right' ? fold.x + (fold.w || 260) : fold.x, y: fold.y + 30 };
        const w = node.w || 260;
        const h = this.geometry.get(nodeId);
        return { x: side === 'right' ? node.x + w : node.x, y: node.y + h / 2 };
    }

    /** A flat tie between two blocks that simply go out at the same time. */
    #tiePath(a, b) {
        const dx = Math.max(40, Math.abs(b.x - a.x) * 0.4);
        return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
    }

    /**
     * A loop goes back up the canvas. Drawn out to the side and round, so it
     * never lies on top of the wires it is looping over.
     */
    #loopSide(from, to, wire = null) {
        // Clear the right-hand edge of both blocks it joins.
        const a = wire && this.graph.nodes[wire.from], b = wire && this.graph.nodes[wire.to];
        const edge = Math.max(from.x, to.x, a ? a.x + (a.w || 260) : 0, b ? b.x + (b.w || 260) : 0);
        return { x: edge + 36 + Math.min(80, Math.abs(from.y - to.y) * 0.08), y: (from.y + to.y) / 2 };
    }

    #loopPath(from, to, wire) {
        const s = this.#loopSide(from, to, wire);
        const down = from.y + 36, up = to.y - 36;
        return `M ${from.x} ${from.y} C ${from.x} ${down + 20}, ${s.x} ${down + 20}, ${s.x} ${down} `
            + `L ${s.x} ${up} C ${s.x} ${up - 20}, ${to.x} ${up - 20}, ${to.x} ${to.y}`;
    }

    #path(from, to) {
        if (from.side || to.side) {
            const dx = Math.max(40, Math.abs(to.x - from.x) * .5);
            const a = from.side === 'left' ? -1 : 1, b = to.side === 'right' ? 1 : -1;
            return `M ${from.x} ${from.y} C ${from.x + a * dx} ${from.y}, ${to.x + b * dx} ${to.y}, ${to.x} ${to.y}`;
        }
        // Right-angled wires, for themes that ask for them: down, across,
        // down, with small rounded turns (none on sharp themes).
        const look = globalThis.document?.documentElement?.dataset ?? {};
        if (look.pcWires === 'angled' && to.y - from.y > 30) {
            const r = look.pcShape === 'sharp' ? 0 : Math.min(10, Math.abs(to.x - from.x) / 2, (to.y - from.y) / 4);
            const mid = from.y + (to.y - from.y) / 2;
            if (Math.abs(to.x - from.x) < 1) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
            const dir = to.x > from.x ? 1 : -1;
            return `M ${from.x} ${from.y} L ${from.x} ${mid - r} Q ${from.x} ${mid} ${from.x + dir * r} ${mid} `
                + `L ${to.x - dir * r} ${mid} Q ${to.x} ${mid} ${to.x} ${mid + r} L ${to.x} ${to.y}`;
        }
        const dy = Math.max(40, Math.abs(to.y - from.y) * 0.5);
        return `M ${from.x} ${from.y} C ${from.x} ${from.y + dy}, ${to.x} ${to.y - dy}, ${to.x} ${to.y}`;
    }

    #drawWires(changedNodes = null) {
        if (!this.graph) return;
        const affected = changedNodes ? new Set([...changedNodes].flatMap(id => [...(this.incident.get(id) ?? [])])) : null;
        const visible = new Set(), bounds = { w: 4000, h: 4000 };
        for (const n of Object.values(this.graph.nodes)) { bounds.w = Math.max(bounds.w, n.x + 800); bounds.h = Math.max(bounds.h, n.y + 800); }
        for (const wire of Object.values(this.graph.wires)) {
            if (this.#nativeEditor() && (!wire.from || !wire.fromPort || !wire.to || !wire.toPort || !this.endpoint(wire.from, 'out', wire.fromPort) || !this.endpoint(wire.to, 'in', wire.toPort))) continue;
            const fa = this.#folded(this.graph.nodes[wire.from]), fb = this.#folded(this.graph.nodes[wire.to]);
            if (fa && fa === fb) continue;
            visible.add(wire.id); if (affected && !affected.has(wire.id)) continue;
            const tie = wire.kind === WIRE_KINDS.TOGETHER;
            const left = tie && this.graph.nodes[wire.from] && this.graph.nodes[wire.to] && this.graph.nodes[wire.from].x <= this.graph.nodes[wire.to].x;
            const from = tie ? this.#sidePos(left ? wire.from : wire.to, 'right') : this.#portPos(wire.from, 'out', wire.fromPort ?? wire.port ?? null);
            const to = tie ? this.#sidePos(left ? wire.to : wire.from, 'left') : this.#portPos(wire.to, 'in', wire.toPort ?? null);
            const back = wire.loop || (wire.kind === WIRE_KINDS.SAVE && to.y < from.y + 20);
            const d = tie ? this.#tiePath(from, to) : back ? this.#loopPath(from, to, wire) : this.#path(from, to);
            const src = this.graph.nodes[wire.from], isKey = hasPorts(src), chosen = isKey ? this.trace?.get(wire.from)?.decision : undefined;
            const untaken = isKey && chosen !== undefined && chosen !== null && !took(chosen, wire.port);
            const off = [wire.from, wire.to].some(id => this.graph.nodes[id]?.enabled === false || inOffGroup(this.graph, this.graph.nodes[id]));
            const mode = !tie && (wire.mode === 'activate' || wire.mode === 'result') ? wire.mode : null;
            let className = 'pc-wire pc-wire-' + wire.kind + (mode ? ' pc-wire-mode-' + mode : '') + (wire.loop ? ' pc-wire-loop' : '') + (isKey ? ' pc-wire-key' : '') + (untaken ? ' pc-wire-untaken' : '') + (off ? ' pc-wire-off' : '') + (this.selection?.kind === 'wire' && this.selection.id === wire.id || this.wireMulti.has(wire.id) ? ' pc-selected' : '');
            const side = back ? this.#loopSide(from, to, wire) : null;
            const key = isKey ? (outPorts(src).find(k => k.id === wire.port)?.name ?? 'key') : null;
            let text = tie ? TOGETHER_LABEL : wire.loop ? '↺ ' + (key ? key + ' · ' : '') + (wire.loop.max ?? 3) + '× max' : wire.kind === WIRE_KINDS.SAVE ? '⤓ save' + (key ? ' ' + key : '') + ({ append: ' (add)', keep: ' (add, keep last)' }[this.graph.nodes[wire.to]?.saveMode] ?? '') : mode === 'activate' ? '⚡ activate' : mode === 'result' ? '→ ' + (src?.type === NODE_TYPES.LOREBOOK ? 'entry names' : wire.result === 'matched' ? 'matched words' : 'result') : key ?? (WIRE_LABEL[wire.kind] ?? wire.kind);
            let labelClass = 'pc-wire-label' + (wire.loop ? ' pc-wire-label-loop' : '');
            if (!tie && !wire.loop && wire.condition && wire.condition.mode !== 'always') { text += ' · if ' + ruleLabel(wire.condition); labelClass += ' pc-wire-label-filter'; className += ' pc-wire-conditional'; }
            const filter = !tie && !wire.loop && !mode ? selectLabel(wire.select) : '';
            if (filter) { text += ' · ' + filter; if (!labelClass.includes('pc-wire-label-filter')) labelClass += ' pc-wire-label-filter'; }
            if (from.kind) { text = from.kind; className += ' pc-wire-native'; }
            this.wireViews.set(wire.id, { id: wire.id, kind: from.kind, d, className, arrow: !!back, label: { x: side ? side.x + 10 : (from.x + to.x) / 2, y: side ? side.y + 4 : (from.y + to.y) / 2, text, className: labelClass, anchor: back ? 'start' : undefined, id: wire.loop ? wire.id : undefined, title: wire.loop ? 'Loop: runs this section again, at most this many times. Click to change.' : undefined } });
        }
        if (!affected) for (const id of this.wireViews.keys()) if (!visible.has(id)) this.wireViews.delete(id);
        const native = this.nativeWireView?.gesture;
        const origin = native?.origin && this.endpoint(native.origin.nodeId, native.origin.dir, native.origin.portId);
        const target = native?.target && this.endpoint(native.target.nodeId, native.target.dir, native.target.portId);
        const loose = native?.ghost && { ...native.ghost, side: native.origin?.dir === 'in' ? 'right' : 'left' };
        const nativeGhost = native && native.kind !== 'idle' && origin && loose ? {
            d: native.origin.dir === 'out' ? this.#path(origin, target ?? loose) : this.#path(target ?? loose, origin),
            className: 'pc-wire pc-wire-ghost pc-wire-native' + (native.feedback?.compatible === false ? ' pc-wire-invalid' : ''),
        } : null;
        const ghost = nativeGhost ?? (this.linking?.ghost ? { d: this.linking.dir === 'tie' ? this.#tiePath(this.linking.from, this.linking.ghost) : this.#path(this.linking.from, this.linking.ghost), className: 'pc-wire pc-wire-ghost' + (this.linking.dir === 'tie' ? ' pc-wire-ghost-tie' : '') } : null);
        this.layer.setWires([...this.wireViews.values()], bounds, ghost);
    }

    #renderDrag() {
        const d = this.drag; if (!d) return;
        const ids = d.id ? [d.id] : (d.starts ?? d.several ?? []).map(([id]) => id);
        const nodes = ids.map(id => this.graph.nodes[id]).filter(Boolean).map(n => ({ id: n.id, x: n.x, y: n.y }));
        const gids = new Set([d.group, d.resize, ...(d.groups ?? []).map(g => g.id)].filter(Boolean));
        const groups = [...gids].map(id => this.graph.groups?.[id]).filter(Boolean).map(g => ({ id: g.id, x: g.collapsed ? g.x : g.frame?.x ?? g.x, y: g.collapsed ? g.y : g.frame?.y ?? g.y, w: g.collapsed ? g.w || 260 : g.frame?.w, h: g.frame?.h }));
        this.layer.setPositions(nodes, groups);
        this.#drawWires(new Set(ids));
        if (!d.group && !isNativeWorkflow(this.graph)) this.#hoverBlanket(ids);
        this.#applyFocus();
    }

    #crossedDragThreshold(e) {
        return this.drag?.moved || Math.hypot(e.clientX - (this.gestureStart?.cx ?? e.clientX), e.clientY - (this.gestureStart?.cy ?? e.clientY)) >= (isNativeWorkflow(this.graph) ? 8 : 4);
    }

    #nativeEditor() { return !!this.graph && isNativeWorkflow(this.graph) && (!!this.graph.nativeCards || this.graph.schema === 3); }
    #nativeBridge() { return this.#nativeEditor() ? this.hooks.nativeBridge?.() : null; }
    #canEdit() { return this.hooks.canEdit ? this.hooks.canEdit() === true : this.hooks.nativeScope?.()?.readOnly !== true; }

    hasContentGesture() { return !!(this.drag || this.linking || this.#nativeBridge()?.hasContentGesture()); }

    /** The bridge owns native gesture state; Canvas owns only DOM capture and drawing. */
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
        if (element.closest('button, input, textarea, select, summary, a, [contenteditable="true"], .pc-wire-hit')) return { kind: 'surface' };
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
            if (this.#nativeEditor()) {
                if (this.drag || this.marquee || this.pan) { this.cancelGesture(); return; }
                this.nativeCaptures.delete(e.pointerId);
                this.#dispatchNative({ type: 'capture-lost', pointerId: e.pointerId, buttons: e.buttons }, e);
                return;
            }
            if (e.buttons) this.cancelGesture();
        });
        on(host, 'pointerdown', (e) => {
            if (this.#nativeEditor() && e.button === 0 && !inEditor(e) && !e.target.closest('.pc-node-action')) {
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
            if (!this.graph || this.drag || this.linking || this.marquee || this.pan || this.#nativeBridge()?.hasContentGesture()) return;
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
                if (this.graph && !isNativeWorkflow(this.graph)) touchGraph(this.graph);
            }, 160);
        }, { passive: false });

        on(host, 'mousedown', (e) => {
            if (!this.graph) return;
            if (this.nativeMouseSuppressed || this.#nativeEditor() && e.target.closest('.pc-port')) { e.preventDefault(); return; }
            if (e.target.closest('.pc-node-action')) return;
            if (inEditor(e)) return;
            this.gestureRect = host.getBoundingClientRect();
            if (e.button === 1 || (e.button === 0 && (this.spaceDown || this.mode === 'pan'))) {
                e.preventDefault();
                host.focus({ preventScroll: true });
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
            const groupEl = e.target.closest('.pc-node-group, .pc-group-frame-head, .pc-group-resize');
            const wireHit = e.target.closest('.pc-wire-hit') ?? e.target.closest('.pc-wire-label-loop');

            const gport = e.target.closest('.pc-gport');
            if (gport && e.button === 0) {
                if (!this.#canEdit() || isNativeWorkflow(this.graph)) return;
                e.preventDefault();
                e.stopPropagation();
                const gid = gport.dataset.group;
                const g = this.graph.groups?.[gid];
                if (!g) return;
                const dir = gport.dataset.gport;
                this.linking = {
                    dir, groupId: gid, nodeId: null, port: null,
                    from: this.#groupPortPos(g, dir),
                    ghost: this.toGraph(e.clientX, e.clientY),
                };
                this.#drawWires();
                return;
            }

            if (groupEl && e.button === 0 && !port) {
                const gid = groupEl.dataset.group ?? groupEl.closest('[data-group]')?.dataset.group;
                const g = this.graph.groups?.[gid];
                if (!g) return;
                e.preventDefault();
                e.stopPropagation();
                const action = e.target.closest('[data-action]')?.dataset.action;
                if (action === 'collapse') { this.setCollapsed(gid, true); return; }
                if (action === 'open') { this.setCollapsed(gid, false); return; }
                if (action === 'toggle') { this.toggleGroup(gid); return; }
                if (!this.#canEdit() || isNativeWorkflow(this.graph)) { this.select({ kind: 'group', id: gid }); return; }
                const members = groupMembers(this.graph, gid).map(n => n.id);
                if (g.collapsed && (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey)) {
                    const ids = this.#pickedIds();
                    const remove = e.altKey || ((e.ctrlKey || e.metaKey) && !e.shiftKey && members.every(id => ids.has(id)));
                    for (const id of members) remove ? ids.delete(id) : ids.add(id);
                    this.setMulti([...ids]);
                    if (!e.shiftKey || e.altKey) return;
                }
                if (g.collapsed && (this.multi.size > members.length || e.shiftKey) && members.every(id => this.multi.has(id))) {
                    const start = this.toGraph(e.clientX, e.clientY);
                    this.drag = { several: [...this.multi].map(id => [id, this.graph.nodes[id].x, this.graph.nodes[id].y]), groups: this.#selectedGroupStarts(), clickedGroup: e.shiftKey ? null : gid, sx: start.x, sy: start.y, moved: false };
                    return;
                }
                this.multi.clear();
                this.select({ kind: 'group', id: gid });
                const start = this.toGraph(e.clientX, e.clientY);
                if (action === 'resize' && g.frame) {
                    this.drag = { resize: gid, sx: start.x, sy: start.y, w: g.frame.w, h: g.frame.h, moved: false };
                    return;
                }
                this.drag = {
                    group: gid, sx: start.x, sy: start.y, gx: g.x, gy: g.y, moved: false,
                    fx: g.frame?.x, fy: g.frame?.y,
                    starts: groupMembers(this.graph, gid).map(n => [n.id, n.x, n.y]),
                };
                return;
            }

            if (port) {
                if (!this.#canEdit()) return;
                e.preventDefault();
                e.stopPropagation();
                const dir = port.dataset.dir;
                const nodeId = port.dataset.node;
                let key = port.dataset.port ?? null;
                if (dir === 'out' && !key && hasPorts(this.graph.nodes[nodeId])) {
                    key = this.#nearestKey(nodeId, this.toGraph(e.clientX, e.clientY));
                }
                this.linking = {
                    dir,
                    nodeId,
                    port: key,
                    from: dir === 'tie'
                        ? this.#sidePos(nodeId, port.dataset.side === 'left' ? 'left' : 'right')
                        : this.#portPos(nodeId, dir, key),
                    ghost: this.toGraph(e.clientX, e.clientY),
                };
                this.host.classList.toggle('pc-tying', dir === 'tie');
                this.#drawWires();
                return;
            }

            if (nodeEl && e.button === 0) {
                const id = nodeEl.dataset.id;
                const node = this.graph.nodes[id];
                if (!isNativeWorkflow(this.graph) && !this.#canEdit()) { this.select({ kind: 'node', id }); return; }
                if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
                    const ids = this.#pickedIds();
                    if (e.altKey || ((e.ctrlKey || e.metaKey) && !e.shiftKey && ids.has(id))) ids.delete(id);
                    else ids.add(id);
                    this.setMulti([...ids]);
                    if (!e.shiftKey || e.altKey) return;
                }
                if (this.multi.size > 1 && this.multi.has(id)) {
                    // Drag them all together.
                    const start = this.toGraph(e.clientX, e.clientY);
                    this.drag = { several: [...this.multi].map(m => [m, this.graph.nodes[m]?.x ?? 0, this.graph.nodes[m]?.y ?? 0]), groups: isNativeWorkflow(this.graph) ? [] : this.#selectedGroupStarts(), clicked: e.shiftKey ? null : id, sx: start.x, sy: start.y, moved: false };
                    return;
                }
                if (this.multi.size && !e.shiftKey) this.setMulti([]);
                this.select({ kind: 'node', id });
                this.wireMulti.clear();
                if (e.target.closest('.pc-toggle')) return;
                const start = this.toGraph(e.clientX, e.clientY);
                this.drag = {
                    id,
                    dx: start.x - node.x,
                    dy: start.y - node.y,
                    homeX: node.x,
                    homeY: node.y,
                    moved: false,
                    overFolder: null,
                };
                return;
            }

            if (wireHit) {
                // A loop's label says "click to change": show its settings.
                const sel = { kind: 'wire', id: wireHit.dataset.id };
                if (this.#nativeEditor()) {
                    const modified = e.shiftKey || e.ctrlKey || e.metaKey;
                    if (!modified) this.wireMulti.clear();
                    if (modified && this.wireMulti.has(sel.id)) this.wireMulti.delete(sel.id); else this.wireMulti.add(sel.id);
                    this.multi.clear(); const primary = [...this.wireMulti].at(-1);
                    this.select(primary ? { kind: 'wire', id: primary } : null);
                } else if (wireHit.classList.contains('pc-wire-label-loop')) this.#reveal(sel); else this.select(sel);
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
            if (this.drag && !isNativeWorkflow(this.graph) && !this.#canEdit()) { this.cancelGesture(); return; }
            if (this.linking) {
                this.linking.ghost = this.toGraph(e.clientX, e.clientY);
                this.#drawWires(new Set());
                // Light up the block the wire would land on, so you can see
                // the drop will take before you let go.
                const target = this.#linkTarget(e);
                if (target !== this.linking.hover) {
                    this.#nodeEl(this.linking.hover)?.classList.remove('pc-link-target');
                    this.#groupEl(this.linking.hover)?.classList.remove('pc-link-target');
                    this.linking.hover = target;
                    if (!isNativeWorkflow(this.graph)) {
                        this.#nodeEl(target)?.classList.add('pc-link-target');
                        this.#groupEl(target)?.classList.add('pc-link-target');
                    }
                }
                return;
            }
            if (this.marquee) {
                this.#updateMarquee(e);
                return;
            }
            if (this.drag?.resize) {
                if (!this.#crossedDragThreshold(e)) return;
                const p = this.toGraph(e.clientX, e.clientY);
                const d = this.drag;
                const g = this.graph.groups?.[d.resize];
                if (!g?.frame) return;
                d.moved = true;
                g.frame.w = Math.max(GROUP_MIN.w, Math.round(d.w + p.x - d.sx));
                g.frame.h = Math.max(GROUP_MIN.h, Math.round(d.h + p.y - d.sy));
                this.frames.schedule(4);
                return;
            }
            if (this.drag?.group || this.drag?.several) {
                if (!this.#crossedDragThreshold(e)) return;
                const p = this.toGraph(e.clientX, e.clientY);
                const d = this.drag;
                const dx = Math.round(p.x - d.sx), dy = Math.round(p.y - d.sy);
                if (!dx && !dy && !d.moved) return;
                d.moved = true;
                for (const [id, x, y] of d.starts ?? d.several) {
                    const n = this.graph.nodes[id];
                    if (!n) continue;
                    n.x = x + dx; n.y = y + dy;
                }
                for (const start of d.groups ?? []) {
                    const g = this.graph.groups?.[start.id];
                    if (g) { g.x = start.x + dx; g.y = start.y + dy; if (g.frame && start.frame) { g.frame.x = start.frame.x + dx; g.frame.y = start.frame.y + dy; } }
                }
                if (d.group) {
                    const g = this.graph.groups?.[d.group];
                    if (g) {
                        g.x = d.gx + dx; g.y = d.gy + dy;
                        if (g.frame && d.fx !== undefined) { g.frame.x = d.fx + dx; g.frame.y = d.fy + dy; }
                    }
                }
                this.host.classList.add('pc-interacting');
                this.frames.schedule(4);
                if (!d.group && !isNativeWorkflow(this.graph)) this.#hoverBlanket(d.several.map(([id]) => id));
                return;
            }
            if (this.drag) {
                if (!this.#crossedDragThreshold(e)) return;
                const p = this.toGraph(e.clientX, e.clientY);
                const node = this.graph.nodes[this.drag.id];
                if (!node) return;
                node.x = Math.round(p.x - this.drag.dx);
                node.y = Math.round(p.y - this.drag.dy);
                if (!this.drag.moved) this.hooks.onDragBlock?.(true);
                this.drag.moved = true;
                this.host.classList.add('pc-interacting');
                this.frames.schedule(4);
                if (!isNativeWorkflow(this.graph)) this.#hoverBlanket([node.id]);

                // Dragging a block out over the library means "save it there":
                // into the folder under the pointer, or the first folder when
                // it is dropped anywhere else on the library.
                if (isNativeWorkflow(this.graph)) return;
                const under = document.elementFromPoint(e.clientX, e.clientY);
                const folder = under?.closest?.('.pc-folder[data-folder]:not([data-folder=""])')
                    ?? under?.closest?.('.pc-sidebar') ?? null;
                if (folder !== this.drag.overFolder) {
                    this.drag.overFolder = folder;
                    this.hooks.onNodeOverFolder?.(folder);
                }
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
            if (this.drag && !isNativeWorkflow(this.graph) && !this.#canEdit()) { this.cancelGesture(); return; }
            this.frames.flush();
            this.gestureRect = null;
            this.host.classList.remove('pc-interacting');
            if (this.linking) {
                const targetId = this.#linkTarget(e);
                const link = this.linking;
                this.#nodeEl(link.hover)?.classList.remove('pc-link-target');
                this.#groupEl(link.hover)?.classList.remove('pc-link-target');
                this.linking = null;
                this.host.classList.remove('pc-tying');

                if (targetId && targetId !== link.nodeId) {
                    this.#finishLink(link, targetId, e);
                    return;
                }
                this.render();
                return;
            }
            if (this.marquee) {
                this.#updateMarquee(e);
                const m = this.marquee;
                this.marquee = null;
                m.box.remove();
                if (!m.moved && m.mode === 'replace') this.setMulti([]);
                return;
            }
            if (this.drag?.resize) {
                const d = this.drag;
                this.drag = null;
                if (d.moved) {
                    gatherBlanket(this.graph, d.resize, (n) => this.heightOf(n), (n) => this.widthOf(n));
                    touchGraph(this.graph);
                    this.hooks.onChange?.();
                }
                this.render();
                return;
            }
            if (this.drag?.group || this.drag?.several) {
                const d = this.drag;
                this.drag = null;
                this.#hoverBlanket([]);
                if (d.moved) {
                    const g = d.group ? this.graph.groups?.[d.group] : null;
                    // A blanket put down picks up what it now lies under;
                    // blocks put down join the blanket they land on.
                    if (g && !g.collapsed) gatherBlanket(this.graph, g.id, (n) => this.heightOf(n), (n) => this.widthOf(n));
                    else if (d.several && !isNativeWorkflow(this.graph)) this.settle(d.several.map(([id]) => id));
                    if (isNativeWorkflow(this.graph) && !d.group) this.hooks.onPresentationChange?.(d.several.map(([id]) => id));
                    else { touchGraph(this.graph); this.hooks.onChange?.(); }
                }
                else if (d.clicked) this.setMulti([d.clicked]);
                else if (d.clickedGroup) { this.setMulti([]); this.select({ kind: 'group', id: d.clickedGroup }); }
                this.render();
                return;
            }
            if (this.drag) {
                const drop = this.drag;
                this.drag = null;
                this.hooks.onNodeOverFolder?.(null);
                if (drop.moved) this.hooks.onDragBlock?.(false);

                if (drop.overFolder) {
                    const node = this.graph.nodes[drop.id];
                    if (node) {
                        node.x = drop.homeX;
                        node.y = drop.homeY;
                        this.hooks.onNodeDropOnFolder?.(node, drop.overFolder.dataset.folder || null);
                    }
                } else if (drop.moved) {
                    if (!isNativeWorkflow(this.graph)) this.settle([drop.id]);
                    if (isNativeWorkflow(this.graph)) this.hooks.onPresentationChange?.([drop.id]);
                    else { touchGraph(this.graph); this.hooks.onChange?.(); }
                }
                this.#hoverBlanket([]);
                this.render();
            }
            if (this.pan) {
                this.frames.flush();
                this.pan = null;
                this.host.classList.remove('pc-panning');
                if (!isNativeWorkflow(this.graph)) touchGraph(this.graph);
            }
        });

        on(host, 'dblclick', (e) => {
            if (e.target.closest('[data-action]')) return;
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
                if (this.#nativeEditor()) {
                    e.preventDefault(); e.stopPropagation();
                    if (this.#canEdit()) this.#dispatchNative({ type: 'wire-double-click', wireId: wireHit.dataset.id,
                        direct: !!this.graph.wires[wireHit.dataset.id]?.from, graphPoint: this.toGraph(e.clientX, e.clientY), timestamp: e.timeStamp,
                        alt: e.altKey, ctrl: e.ctrlKey, shift: e.shiftKey, meta: e.metaKey }, e);
                } else this.cycleWire(wireHit.dataset.id);
                return;
            }
            if (this.#nativeEditor()) { this.#openNativeSearch(e); return; }
            if (!this.#canEdit()) return;
            this.hooks.onCreateAt?.(this.toGraph(e.clientX, e.clientY));
        });

        on(host, 'contextmenu', (e) => {
            e.preventDefault();
            if (this.#nativeEditor()) {
                const pin = this.#nativePin(e.target), bridge = this.#nativeBridge();
                if (pin && bridge) {
                    this.gestureStart = { selection: this.selection && { ...this.selection }, multi: [...this.multi], wireMulti: [...this.wireMulti] };
                    const result = bridge.openPinMenu({ pin, screenAnchor: { x: e.clientX, y: e.clientY },
                        readOnly: !this.#canEdit(), ...this.#nativeAttachments(pin) });
                    this.updateNativeWire(result.view, result.requests); return;
                }
                if (!e.target.closest('.pc-node, .pc-group-frame, .pc-wire-hit')) { this.#openNativeSearch(e); return; }
            }
            const nodeEl = e.target.closest('.pc-node[data-id]');
            const groupEl = e.target.closest('.pc-node-group, .pc-group-frame-head');
            const gid = groupEl ? (groupEl.dataset.group ?? groupEl.closest('[data-group]')?.dataset.group) : null;
            const wireHit = e.target.closest('.pc-wire-hit') ?? e.target.closest('.pc-wire-label-loop');
            this.hooks.onContextMenu?.({
                event: e,
                group: gid ? this.graph.groups?.[gid] ?? null : null,
                several: nodeEl && this.multi.size > 1 && this.multi.has(nodeEl.dataset.id) ? [...this.multi] : null,
                node: nodeEl ? this.graph.nodes[nodeEl.dataset.id] : null,
                wire: wireHit ? this.graph.wires[wireHit.dataset.id] : null,
                at: this.toGraph(e.clientX, e.clientY),
            });
        });

        on(host, 'dragover', (e) => { e.preventDefault(); });
        on(host, 'drop', (e) => {
            e.preventDefault();
            if (!this.#canEdit()) return;
            const raw = e.dataTransfer?.getData('application/x-prompt-canvas');
            if (!raw) return;
            try {
                this.hooks.onDrop?.(JSON.parse(raw), this.toGraph(e.clientX, e.clientY));
            } catch { /* not ours */ }
        });
    }

    #groupEl(token) {
        const gid = typeof token === 'string' && token.startsWith('group:') ? token.slice(6) : null;
        return gid ? this.nodeLayer.querySelector(`.pc-node-group[data-group="${CSS.escape(gid)}"]`) : null;
    }

    /**
     * Make the wire a drag asked for. Either end can be a folded group: then
     * the block inside it is picked (see #pickInGroup) before wiring.
     */
    async #finishLink(link, targetId, e) {
        const graph = this.graph, epoch = this.operationEpoch;
        const current = () => this.graph === graph && this.operationEpoch === epoch && this.#canEdit() && !this.#nativeEditor();
        if (!current()) return;
        const tie = link.dir === 'tie';
        const outward = tie || link.dir === 'out';
        // The two ends, each a block id or "group:<id>".
        let from = outward ? (link.groupId ? `group:${link.groupId}` : link.nodeId) : targetId;
        let to = outward ? targetId : (link.groupId ? `group:${link.groupId}` : link.nodeId);
        let port = link.dir === 'out' ? link.port : null;
        const at = { clientX: e.clientX, clientY: e.clientY };
        if (typeof from === 'string' && from.startsWith('group:')) {
            const pick = await this.#pickInGroup(from.slice(6), 'out', at);
            if (!current()) return;
            if (!pick) { this.render(); return; }
            from = pick.id; port = pick.port;
        }
        if (typeof to === 'string' && to.startsWith('group:')) {
            const pick = await this.#pickInGroup(to.slice(6), 'in', at);
            if (!current()) return;
            if (!pick) { this.render(); return; }
            to = pick.id;
        }
        if (!from || !to || from === to) { this.render(); return; }
        if (link.dir === 'in' && !link.groupId && hasPorts(this.graph.nodes[from]) && !port) {
            // Dragged up from a block onto a Decider: use the key nearest where it landed.
            port = this.#nearestKey(from, this.toGraph(e.clientX, e.clientY));
        }
        // Schema-2 primitive edges have implicit in/out endpoints; their port option
        // is reserved for legacy keyed outputs. Schema-3 editing uses the prepared graph-edit API.
        if (!current()) return;
        const res = connect(this.graph, from, to, tie ? WIRE_KINDS.TOGETHER : WIRE_KINDS.MERGE, { port: this.graph.schema === 2 ? null : port });
        if (!res.ok) this.hooks.onToast?.(res.reason);
        else {
            this.hooks.onChange?.();
            // A new loop: show its settings, so the limit is seen and can be changed.
            if (res.wire?.loop) { this.render(); this.#reveal({ kind: 'wire', id: res.wire.id }); return; }
        }
        this.render();
    }

    /** Select, and ask for the settings pane to be shown if it is folded away. */
    #reveal(sel) {
        if (this.hooks.onReveal) this.hooks.onReveal(sel); else this.select(sel);
    }

    select(sel) {
        if (this.#nativeEditor()) {
            if (sel?.kind === 'wire') this.wireMulti.add(sel.id);
            else this.wireMulti.clear();
        }
        this.selection = sel;
        this.render();
        const pick = !sel ? null
            : sel.kind === 'node' ? this.graph.nodes[sel.id]
            : sel.kind === 'group' ? this.graph.groups?.[sel.id]
            : this.graph.wires[sel.id];
        this.hooks.onSelect?.(pick ?? null, sel?.kind ?? null);
    }

    cycleWire(wireId) {
        if (!this.#canEdit() || this.#nativeEditor()) return;
        const wire = this.graph.wires[wireId];
        if (!wire) return;
        if (wire.kind === WIRE_KINDS.TOGETHER) {
            this.hooks.onToast?.('That is a "send together" tie. Nothing flows along it, so there is nothing to cycle.');
            return;
        }
        if (wire.loop || wire.kind === WIRE_KINDS.SAVE) { this.#reveal({ kind: 'wire', id: wireId }); return; }
        const order = [WIRE_KINDS.MERGE, WIRE_KINDS.APPEND, WIRE_KINDS.PREPEND];
        wire.kind = order[(order.indexOf(wire.kind) + 1) % order.length];
        touchGraph(this.graph);
        this.render();
        this.hooks.onChange?.();
    }

    setWireKind(wireId, kind) {
        if (!this.#canEdit() || this.#nativeEditor()) return;
        const wire = this.graph.wires[wireId];
        if (!wire) return;
        wire.kind = kind;
        touchGraph(this.graph);
        this.render();
        this.hooks.onChange?.();
    }

    /**
     * Delete what is picked: several blocks, a block, a wire, or a whole
     * group with its blocks. Asks first when the panel says to
     * (hooks.confirmDelete, the "ask before deleting" setting).
     */
    async deleteSelection() {
        const graph = this.graph, epoch = this.operationEpoch;
        if (!graph || !this.#canEdit()) return false;
        const ask = async (what) => {
            const approved = this.hooks.confirmDelete ? await this.hooks.confirmDelete(what) : true;
            return approved && this.graph === graph && this.operationEpoch === epoch && this.#canEdit();
        };
        if (this.#nativeEditor()) {
            if (this.wireMulti.size || this.selection?.kind === 'wire') {
                const ids = this.wireMulti.size ? [...this.wireMulti] : [this.selection.id];
                const bridge = this.#nativeBridge(); if (!bridge) return false;
                const result = bridge.disconnectWires(ids); this.updateNativeWire(result.view, result.requests); return true;
            }
            const sel = this.multi.size > 1 ? { kind: 'nodes', ids: [...this.multi] } : this.selection && { ...this.selection };
            if (!sel || !this.hooks.onNativeDelete) return false;
            return this.hooks.onNativeDelete(sel);
        }
        if (this.multi.size > 1) {
            const ids = [...this.multi].filter(id => this.graph.nodes[id] && this.graph.nodes[id].type !== NODE_TYPES.OUTPUT);
            if (!ids.length || !await ask(`these ${ids.length} blocks`)) return false;
            for (const id of ids) removeNode(this.graph, id);
            this.multi.clear();
            this.selection = null;
            this.render();
            this.hooks.onChange?.();
            return true;
        }
        const sel = this.selection;
        if (!sel) return false;
        if (sel.kind === 'wire') {
            disconnect(this.graph, sel.id);
        } else if (sel.kind === 'group') {
            const g = this.graph.groups?.[sel.id];
            if (!g) return false;
            const n = groupMembers(this.graph, sel.id).length;
            if (!await ask(`the group "${g.title || 'Group'}" and its ${n} block${n === 1 ? '' : 's'}`)) return false;
            deleteGroup(this.graph, sel.id);
        } else {
            const node = this.graph.nodes[sel.id];
            if (!node || node.type === NODE_TYPES.OUTPUT) return false;
            if (!await ask(`"${node.title || 'Untitled'}"`)) return false;
            removeNode(this.graph, sel.id);
        }
        this.selection = null;
        this.render();
        this.hooks.onChange?.();
        return true;
    }
}

export { WIRE_LABEL, TYPE_LABEL, TYPE_ICON };
