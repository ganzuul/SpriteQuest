<script lang="ts">
    import { tick } from 'svelte';
    import { FAMILY_PALETTE, PALETTE_GROUPS, paletteForOperation } from '../src/ui/node-palette.js';
    import type { WorkflowView } from './types';
    type ShelfChoice = { id: string; label: string; family: string; phase: string; shortcode?: string; purpose?: string; searchAliases?: readonly string[]; disabledReason?: string };
    let { view, add, choices, choose, manageSubgraphs, readOnly = false }: { view?: WorkflowView; add: (id: string) => void; choices?: readonly ShelfChoice[]; choose?: (id: string) => void; manageSubgraphs?: () => void; readOnly?: boolean } = $props();
    let shelf: HTMLElement;
    let familyPanel = $state<HTMLDivElement>(null!), leafPanel = $state<HTMLDivElement>(null!);
    let family = $state(''), group = $state(''), search = $state(false), query = $state('');
    let compact = $state(false), x = $state(0), y = $state(0), leafX = $state(0), leafY = $state(0);
    let anchor: HTMLButtonElement | null = null;
    let opening = 0;
    const names = FAMILY_PALETTE.map(item => item.name);
    const familyColor = (name: string) => FAMILY_PALETTE.find(item => item.name === name)?.color;
    type Entry = { id: string; title: string; compatible: boolean; phase: string; family: string; group: string; shortcode: string; icon: string; purpose?: string; searchAliases?: readonly string[]; disabledReason?: string; catalog?: boolean };
    function entries(name = family): Entry[] {
        if (choices !== undefined) return choices.filter(entry => entry.family === name).map(entry => {
            const metadata = paletteForOperation(entry.id.startsWith('operation:') ? entry.id.split(':')[1] : '');
            return { ...entry, title: entry.label, compatible: !entry.disabledReason && !!choose, catalog: true, group: name === 'Subgraphs' ? 'Library' : metadata.group, shortcode: entry.shortcode ?? metadata.shortcode, icon: name === 'Subgraphs' ? PALETTE_GROUPS.Library.icon : metadata.icon };
        });
        const data = view?.families.find(entry => entry.name === name);
        if (!data) return [];
        return data.operations.filter(entry => name !== 'Surface' || !['pattern-scan', 'validate-patches'].includes(entry.id)).map(entry => ({ ...entry, ...paletteForOperation(entry.id), family: name }));
    }
    const groups = () => [...new Set([...entries().map(entry => entry.group), ...(family === 'Subgraphs' && manageSubgraphs ? ['Library'] : [])])];
    function close(restore = false) { opening++; family = ''; group = ''; search = false; if (restore) anchor?.focus({ preventScroll: true }); }
    $effect(() => { const scope = view?.graphId, catalog = choices; void scope; void catalog; return () => close(); });
    function bounds() {
        const area = shelf.closest('.pc-canvas-area') as HTMLElement, rect = area.getBoundingClientRect();
        return { left: rect.left + area.clientLeft, top: rect.top + area.clientTop, right: rect.right - area.clientLeft, width: area.clientWidth, height: area.clientHeight };
    }
    function position(rect: Pick<DOMRect, 'top' | 'left' | 'right'>, width: number, height: number, parentWidth: number) {
        const pane = bounds(), roomRight = pane.right - rect.right - 6, roomLeft = rect.left - pane.left - 6;
        const fits = roomRight >= width || roomLeft >= width;
        const left = roomRight >= width ? rect.right - pane.left + 3 : roomLeft >= width ? rect.left - pane.left - width - 3 : 13;
        return { x: Math.max(4, Math.min(left, pane.width - width - 4)), y: Math.max(4, Math.min(rect.top - pane.top, pane.height - height - 4)), compact: !fits || pane.width < width + parentWidth + 26 };
    }
    function menuTop(rect: DOMRect, panel: HTMLDivElement, size: DOMRect) {
        const first = panel.querySelector('button')?.getBoundingClientRect();
        return first ? rect.top + (rect.height - first.height) / 2 - (first.top - size.top) : rect.top;
    }
    async function open(name: string, button: HTMLButtonElement, focus = true) {
        if (family === name) { if (focus) familyPanel?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true }); return; }
        const request = ++opening; family = name; group = ''; search = false; anchor = button; await tick();
        if (request !== opening || family !== name || !familyPanel?.isConnected) return;
        const rect = button.getBoundingClientRect(), size = familyPanel.getBoundingClientRect(), spot = position({ top: menuTop(rect, familyPanel, size), left: rect.left, right: rect.right }, size.width, size.height, 110);
        x = spot.x; y = spot.y; compact = spot.compact;
        if (focus) familyPanel.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    }
    async function openGroup(value: string, button: HTMLButtonElement, focus = true) {
        if (group === value) { if (focus) leafPanel?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true }); return; }
        const request = ++opening, currentFamily = family; group = value; await tick();
        if (request !== opening || group !== value || family !== currentFamily || !leafPanel?.isConnected) return;
        const rect = button.getBoundingClientRect(), parent = familyPanel.getBoundingClientRect(), size = leafPanel.getBoundingClientRect();
        const spot = position({ top: menuTop(rect, leafPanel, size), left: parent.left, right: parent.right }, size.width, size.height, 155);
        leafX = spot.x; leafY = spot.y; compact ||= spot.compact;
        if (focus) leafPanel.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true });
    }
    export async function openSearch() {
        const request = ++opening; family = ''; group = ''; search = true; query = ''; await tick();
        if (request !== opening || !search || !leafPanel?.isConnected) return;
        const pane = bounds(); leafX = Math.min(136, Math.max(4, pane.width - 266)); leafY = 13;
        leafPanel.querySelector<HTMLInputElement>('input')?.focus();
    }
    function select(entry: Entry) {
        const current = entries(entry.family).find(item => item.id === entry.id);
        if (!current?.compatible || readOnly) return;
        close(true); if (current.catalog) choose?.(current.id); else add(current.id);
    }
    async function restoreGroup() {
        const previous = group, currentFamily = family, request = ++opening; group = ''; await tick();
        if (request !== opening || family !== currentFamily || group || !familyPanel?.isConnected) return;
        [...familyPanel.querySelectorAll<HTMLButtonElement>('[data-subfamily]')].find(button => button.dataset.subfamily === previous)?.focus({ preventScroll: true });
    }
    function keys(event: KeyboardEvent) {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true); return; }
        const target = event.target as HTMLButtonElement;
        if (event.key === 'ArrowRight' && target.dataset.family && !target.disabled) { event.preventDefault(); event.stopPropagation(); open(target.dataset.family, target); return; }
        if (event.key === 'ArrowRight' && target.dataset.subfamily) { event.preventDefault(); event.stopPropagation(); openGroup(target.dataset.subfamily, target); return; }
        if (event.key === 'ArrowLeft' && group) { event.preventDefault(); event.stopPropagation(); restoreGroup(); return; }
        if (event.key === 'ArrowLeft' && family) { event.preventDefault(); event.stopPropagation(); close(true); return; }
        if (event.key === 'Tab') { close(); return; }
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || (event.target as HTMLElement).tagName === 'INPUT') return;
        event.preventDefault(); const panel = (event.target as HTMLElement).closest('[role="menu"]') || shelf;
        const buttons = [...panel.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
        const index = buttons.indexOf(event.target as HTMLButtonElement);
        buttons[event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowUp' ? buttons.length - 1 : 1)) % buttons.length]?.focus();
    }
</script>
<svelte:window onpointerdown={(event) => { if (!(event.target as HTMLElement).closest('.pc-node-shelf, .pc-shelf-menu')) close(); }} onresize={() => close()} />
<nav class={`pc-node-shelf${compact && family ? ' pc-shelf-replaced' : ''}`} aria-label="Node families" bind:this={shelf}>
    {#each FAMILY_PALETTE as item}
        <button type="button" data-family={item.name} class="pc-family-row" style:--pc-family={item.color} disabled={!entries(item.name).length && !(item.name === 'Subgraphs' && manageSubgraphs)} title={'Browse ' + item.name + ' nodes'} aria-haspopup="menu" aria-expanded={family === item.name} onclick={(event) => open(item.name, event.currentTarget)} onpointerenter={(event) => { if (event.pointerType !== 'touch' && !event.currentTarget.disabled) open(item.name, event.currentTarget, false); }} onkeydown={keys}>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d={item.icon} /></svg><span>{item.name}</span>
        </button>
    {/each}
</nav>
{#if family}
    <div class={`pc-shelf-menu pc-family-menu${compact && group ? ' pc-shelf-replaced' : ''}`} role="menu" tabindex="-1" aria-label={family + ' categories'} bind:this={familyPanel} style:left={`${x}px`} style:top={`${y}px`} style:--pc-family={familyColor(family)} onkeydown={keys}>
        {#if compact}<button type="button" role="menuitem" onclick={() => close(true)}>‹ Families</button>{/if}
        {#each groups() as name}
            <button type="button" role="menuitem" data-subfamily={name} aria-haspopup="menu" aria-expanded={group === name} onclick={(event) => openGroup(name, event.currentTarget)} onpointerenter={(event) => { if (event.pointerType !== 'touch') openGroup(name, event.currentTarget, false); }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={(PALETTE_GROUPS as Record<string, { icon: string }>)[name]?.icon} /></svg><span class="pc-subfamily-name">{name.toUpperCase()}</span><svg class="pc-sub-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg></button>
        {/each}
    </div>
{/if}
{#if group || search}
    <div class="pc-shelf-menu pc-leaf-menu" role="menu" tabindex="-1" aria-label={search ? 'Search nodes' : family + ' nodes'} bind:this={leafPanel} style:left={`${leafX}px`} style:top={`${leafY}px`} style:--pc-family={familyColor(family)} onkeydown={keys}>
        {#if compact && group}<button type="button" role="menuitem" onclick={restoreGroup}>‹ {family}</button>{/if}
        {#if search}<input class="text_pole" aria-label="Search nodes" placeholder="Search nodes…" bind:value={query} />{/if}
        {#each (search ? names.flatMap(name => entries(name)).filter(entry => [entry.title, entry.id, entry.family, entry.purpose, entry.shortcode, ...(entry.searchAliases ?? [])].join(' ').toLowerCase().includes(query.toLowerCase())) : entries().filter(entry => entry.group === group)) as entry (entry.family + entry.id)}
            <button type="button" role="menuitem" data-shelf-choice={entry.id} style:--pc-family={familyColor(entry.family)} disabled={!entry.compatible || readOnly} title={readOnly ? 'This graph is read-only.' : entry.disabledReason || (entry.compatible ? entry.purpose || 'Add ' + entry.title : 'Requires the ' + entry.phase + ' phase')} onclick={() => select(entry)}><svg class="pc-leaf-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={entry.icon} /></svg><span class="pc-catalog-name">{entry.title}</span><small>{entry.shortcode}</small></button>
        {/each}
        {#if !search && family === 'Subgraphs' && manageSubgraphs}<button type="button" role="menuitem" data-shelf-manage onclick={() => { close(true); manageSubgraphs?.(); }}><svg class="pc-leaf-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 18h18M8 3v6m8 6v6M3 12h18m-5-3v6" /></svg><span class="pc-catalog-name">Manage subgraphs…</span></button>{/if}
    </div>
{/if}
