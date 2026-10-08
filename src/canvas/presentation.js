import { operationFor } from '../workflow/catalog.js?v=0.19.0';
import { NODE_TYPES, deciderKeys, outPorts, hasPorts, inOffGroup } from '../state.js?v=0.19.0';
const took = (chosen, id) => Array.isArray(chosen) ? chosen.includes(id) : chosen === id;
const ROUTING_WORDS = { all: 'every output that matches fires', first: 'the first output that matches fires', random: 'a weighted random pick', ai: 'the AI picks the outputs that apply' };
const routingOf = node => node.mode === null || node.mode === '' ? null : node.mode === undefined || node.mode === 'rules' ? 'first' : ROUTING_WORDS[node.mode] ? node.mode : 'first';

export function tokenChip(node, tokens, trace) {
    const fmt = n => n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `${n}`;
    const t = tokens?.get(node.id), tr = trace?.get(node.id);
    const how = t?.exact === false ? 'estimated at four characters a token' : 'counted with SillyTavern’s tokenizer for the current model';
    const approx = t?.exact === false ? '≈' : '';
    const chip = { text: '', title: '', className: 'pc-tok' };
    if (t && node.type === NODE_TYPES.OUTPUT && t.total) {
        chip.text = `${approx}${fmt(t.total)} tok`; chip.className += ' pc-tok-total';
        chip.title = `The whole prompt this canvas would send right now: ${t.total.toLocaleString()} tokens (${how}).`;
    } else if (t && node.type === NODE_TYPES.GENERATE && t.in !== undefined) {
        chip.text = `${approx}${fmt(t.in)} → ≤${fmt(t.out)}`;
        chip.title = `This block is asked about ${t.in.toLocaleString()} tokens and may answer with up to ${t.out.toLocaleString()} (its "Longest reply"). Tokens ${how}.`;
    } else if (t?.own) {
        chip.text = `${approx}${fmt(t.own)} tok`;
        chip.title = t.loose ? `${t.own.toLocaleString()} tokens of its own text (${how}). Not in the prompt right now: nothing it is wired to reaches Output on this send.` : `${t.own.toLocaleString()} tokens of its own text (${how}). Counted again as you edit.`;
        if (t.loose) chip.className += ' pc-tok-loose';
    } else if (!t && tr?.chars && tr.status === 'in') {
        chip.text = `≈${fmt(Math.ceil(tr.chars / 4))} tok`; chip.title = "About how many tokens this block adds (its own text, from the last preview)";
    } else return null;
    return chip;
}

/** Plain presentation data; Svelte consumes this without importing domain state. */
export function nodeCard(node, { graph, selection, multi, trace, tokens, reaching, hooks, preview, ruleLabel, labels, icons }) {
    const groupOff = inOffGroup(graph, node), tr = trace?.get(node.id);
    const operation = operationFor(node);
    const stranded = !operation && node.type !== NODE_TYPES.NOTE && node.type !== NODE_TYPES.OUTPUT && reaching && !reaching.has(node.id);
    const card = {
        id: node.id, type: node.type, x: node.x, y: node.y, w: node.w || 260,
        className: `pc-node pc-node-${node.type}${node.enabled === false || groupOff ? ' pc-off' : ''}${groupOff ? ' pc-group-off' : ''}${stranded ? ' pc-stranded' : ''}${selection?.kind === 'node' && selection.id === node.id ? ' pc-selected' : ''}${multi.has(node.id) ? ' pc-multi' : ''}${tr ? ` pc-trace-${tr.status}` : ''}`,
        hint: stranded ? 'Not wired through to Output, so this block does nothing.' : undefined,
        title: node.title || 'Untitled', titleHint: node.title || '', label: labels[node.type] ?? node.type, icon: icons[node.type] ?? 'fa-square',
        token: tokenChip(node, tokens, trace), offHint: groupOff && node.enabled !== false ? 'Its group is switched off, so this block sends nothing and nothing passes through it.' : node.enabled === false ? 'This block is switched off. Its own text is not sent; anything wired through it still passes.' : undefined,
        enabled: node.enabled !== false, toggle: node.type !== NODE_TYPES.OUTPUT, help: node.type === NODE_TYPES.DECIDER,
        body: preview(node), rows: [], rowClass: 'pc-dec-keys', mode: undefined, model: null, notices: [], ports: [],
    };
    if (operation) {
        const bound = typeof operation.requestBound === 'function' ? operation.requestBound(node) : operation.requestBound;
        card.label = operation.title; card.icon = operation.terminal ? 'fa-paper-plane' : 'fa-cube';
        card.body = operation.family + ' · ' + operation.phase + ' phase · ' + (operation.input || 'snapshot') + ' → ' + (operation.output || (operation.id === 'guidance' ? 'Guidance for native reply' : 'Reviewed reply'));
        card.offHint = node.enabled === false || groupOff ? 'Disabled operations block native preflight. They cannot be bypassed.' : undefined;
        card.notices.push({ className: 'pc-node-wave', icon: 'fa-bolt', text: 'maximum ' + bound + ' auxiliary request' + (bound === 1 ? '' : 's') });
        if (operation.modelRole) {
            const binding = node.profileId ? node : graph.roles?.[node.modelRole || operation.modelRole];
            const resolved = hooks.nativeBinding?.(node, graph);
            card.model = { where: resolved?.display || hooks.profileName?.(binding?.profileId) || binding?.profileId || 'Missing ' + (node.modelRole || operation.modelRole) + ' binding', actual: node.model || binding?.model || '', title: 'Fixed node override or workflow role. Never follows the active chat connection.', pick: false };
        }
        if (operation.input) card.ports.push({ id: 'in', className: 'pc-port pc-port-in', dir: 'in', title: 'Input: ' + operation.input });
        if (!operation.terminal) {
            card.ports.push({ id: 'out', className: 'pc-port pc-port-out', dir: 'out', title: 'Output: ' + operation.output });
            card.ports.push({ id: 'strip', className: 'pc-port pc-port-strip', dir: 'out', title: 'Wire the ' + operation.output + ' artifact' });
        }
        return card;
    }
    if (node.type === NODE_TYPES.DECIDER) {
        card.body = null;
        const chosen = tr?.decision ?? null, routing = routingOf(node), keys = deciderKeys(node);
        card.mode = { className: `pc-dec-mode${routing ? '' : ' pc-dec-unset'}`, text: routing ? routing === 'ai' && node.sorter?.engine === 'jev' ? 'Jev picks the outputs that apply' : ROUTING_WORDS[routing] : 'Not set up yet — select it and choose how it routes' };
        const row = (key, text, fallback = false) => ({ id: key.id, name: key.name || 'key', text, chosen: took(chosen, key.id), fallback });
        if (routing === 'random') {
            const total = keys.reduce((n, key) => n + Math.max(0, Number(key.weight ?? 1)), 0) || 1;
            card.rows = keys.map(key => row(key, `${Math.round(100 * Math.max(0, Number(key.weight ?? 1)) / total)}%`));
        } else if (routing) {
            card.rows = (node.keys ?? []).map(key => {
                const description = String(key.description ?? '').trim(), rules = (key.conditions ?? []).map(ruleLabel).filter(Boolean);
                return row(key, routing === 'ai' ? description ? description.length > 60 ? description.slice(0, 60) + '…' : description : 'no description yet' : rules.length ? `if ${rules.join(key.match === 'all' ? ' and ' : ' or ')}` : 'no rules yet');
            });
            if (node.fallback) card.rows.push(row(node.fallback, 'when nothing else fires', true));
        }
    }
    if (node.type === NODE_TYPES.STATE) {
        card.body = null; card.rowClass += ' pc-state-rows';
        const st = tr?.state ?? null;
        if (!(node.values ?? []).length) card.mode = { className: 'pc-dec-mode pc-dec-unset', text: 'No values yet — select it and add one' };
        card.rows = (node.values ?? []).map(value => {
            const val = st ? st[value.id] : undefined;
            const stage = val === undefined ? null : (value.stages ?? []).find(s => Number(val) >= (s.from === '' || s.from == null ? -Infinity : Number(s.from)) && Number(val) <= (s.to === '' || s.to == null ? Infinity : Number(s.to)));
            const shown = val === undefined ? `starts at ${value.start ?? 0}` : `${val}${value.kind !== 'text' && value.max !== '' && value.max != null ? `/${value.max}` : ''}${stage?.name ? ` · ${stage.name}` : ''}`;
            const rules = (value.rules ?? []).length, stages = (value.stages ?? []).length;
            return { id: value.id, name: value.name || 'key', text: `${shown}${rules ? ` · ${rules} rule${rules === 1 ? '' : 's'}` : ''}${stages ? ` · ${stages} stages${value.stageDots ? ' with dots' : ''}` : ''}`, chosen: !!(stage?.text || stage?.promptId) };
        });
    }
    const notice = (className, icon, text, title) => card.notices.push({ className, icon, text, title });
    if (![NODE_TYPES.DECIDER, NODE_TYPES.STATE].includes(node.type) && node.condition && node.condition.mode !== 'always') notice('pc-node-cond', 'fa-code-branch', node.condition.mode === 'probability' ? ruleLabel(node.condition) : `if ${ruleLabel(node.condition)}`);
    if (node.profileId || node.type === NODE_TYPES.GENERATE) {
        const where = hooks.profileName?.(node.profileId) ?? (node.profileId || 'same as the chat');
        const actual = node.type === NODE_TYPES.GENERATE ? (hooks.effectiveModel?.(node) ?? node.model) : node.model;
        const pick = node.type === NODE_TYPES.GENERATE && !!hooks.onModelClick;
        card.model = { where, actual: actual || '', pick, title: (node.model ? 'This block’s own model.' : node.profileId ? 'The model this connection profile uses.' : 'Follows whatever model the chat is using right now.') + (pick ? ' Click to choose another.' : '') };
    }
    if (node.type === NODE_TYPES.GENERATE) {
        if (node.forward === 'all') notice('pc-node-repeat', 'fa-angles-down', 'passes on its inputs and its answer', 'What is wired into this block goes on down the canvas too, not only the answer.');
        if (Number(node.repeat) > 1) notice('pc-node-repeat', 'fa-repeat', `up to ${Math.min(10, Math.round(node.repeat))} passes${node.repeatStopWhenSame !== false ? ', stops when nothing changes' : ''}`);
        const wave = hooks.waveInfo?.(node);
        if (wave && wave.total > 1) {
            if (!wave.siblings.length) notice('pc-node-wave', 'fa-arrow-down-1-9', `wave ${wave.wave} of ${wave.waves} · waits for the wave before`, 'This waits, because a Generate block upstream feeds it.');
            else if (wave.willRunTogether) notice('pc-node-wave', 'fa-bolt', `${wave.tied ? 'tied to' : 'at the same time as'} ${wave.siblings.join(', ')}`, wave.tied ? 'You tied these, so they go out together whatever the setting says.' : 'These go out together because nothing wires one into another.');
            else notice('pc-node-wave pc-node-wave-off', 'fa-bolt-slash', `could go out with ${wave.siblings.join(', ')} — sending one at a time`, 'Parallel sending is switched off. Tie these blocks, or switch it on in the status bar.');
        }
    }
    const copies = hooks.copiesOf?.(node) ?? 1;
    if (copies > 1) notice('pc-node-dup', 'fa-clone', `sent ${copies}× — reaches Output down ${copies} paths`, 'This block’s text lands in the prompt more than once. Usually a wiring surprise rather than something you wanted.');
    if (node.type === NODE_TYPES.ST && node.override?.content !== undefined) notice('pc-node-cond pc-node-override', 'fa-pen', 'edited on this canvas');
    if (hasPorts(node)) {
        const keys = outPorts(node), chosen = tr?.decision ?? null;
        card.ports.push(...keys.map((key, i) => {
            const valueName = key.stage ? (node.values ?? []).find(v => v.id === key.valueId)?.name || 'the value' : '';
            return { id: `key:${key.id}`, className: `pc-port pc-port-out pc-port-key${took(chosen, key.id) ? ' pc-port-chosen' : ''}${key === node.fallback ? ' pc-port-fallback' : ''}${key.stage ? ' pc-port-stage' : ''}`, dir: 'out', port: key.id, left: 100 * (i + 1) / (keys.length + 1), label: key.name || 'key', title: key.stage ? `Stage "${key.name}": drag onto a block to switch it on while ${valueName} is in this stage` : node.type === NODE_TYPES.STATE ? `Drag to send "${key.name}"` : `Drag to wire the "${key.name}" path` };
        }));
    }
    if (node.type !== NODE_TYPES.NOTE) {
        if (node.type !== NODE_TYPES.OUTPUT && !hasPorts(node)) {
            card.ports.push({ id: 'out', className: 'pc-port pc-port-out', dir: 'out', title: node.type === NODE_TYPES.GENERATE ? 'The model’s reply leaves from here. It does not go back into this block.' : 'Drag to wire this block into another' });
            card.ports.push({ id: 'strip', className: 'pc-port pc-port-strip', dir: 'out', title: 'Drag from the bottom edge to wire this block into another' });
        }
        card.ports.push({ id: 'in', className: 'pc-port pc-port-in', dir: 'in', title: node.type === NODE_TYPES.GENERATE ? 'Everything wired in here is the question sent to the model' : 'What comes in here is read before this block’s own text' });
        if (node.type === NODE_TYPES.GENERATE) for (const side of ['right', 'left']) card.ports.push({ id: `tie:${side}`, className: `pc-port pc-port-tie pc-port-tie-${side}`, dir: 'tie', side, icon: 'fa-bolt', title: 'Drag to another Generate block to send them at the same time' });
    }
    return card;
}
