<script lang="ts">
    import { tick } from 'svelte';
    import type { WorkflowView } from './types';
    let { view, add }: { view?: WorkflowView; add: (id: string, legacy: boolean) => void } = $props();
    let shelf: HTMLElement;
    let familyPanel = $state<HTMLDivElement>(null!), leafPanel = $state<HTMLDivElement>(null!);
    let family = $state(''), group = $state(''), search = $state(false), query = $state('');
    let compact = $state(false), x = $state(0), y = $state(0), leafX = $state(0), leafY = $state(0);
    let anchor: HTMLButtonElement | null = null;
    const names = ['Input', 'Shaping', 'Surface', 'Transpose', 'Derive', 'Output', 'Subgraphs'];
    const paths = ['M3 7 12 2l9 5v10l-9 5-9-5ZM3 7l9 5 9-5M12 12v10', 'M20 8a8 8 0 1 0 0 8M20 3v5h-5', 'M12 3v18M3 12h18M5 5l14 14', 'M3 7h18m-4-4 4 4-4 4M21 17H3m4-4-4 4 4 4', 'M5 20v-6M12 20V8M19 20V3', 'M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5', 'M3 3h7v7H3ZM14 14h7v7h-7ZM7 10v7h7'];
    const colors = ['#7fbfa2', '#b3b776', '#d3a884', '#a49ab9', '#87b2d0', '#a8c883', '#bda3c7'];
    type Entry = { id: string; title: string; legacy: boolean; compatible: boolean; phase: string; family: string };
    function entries(name = family): Entry[] {
        const data = view?.families.find(entry => entry.name === name);
        if (!data) return [];
        if (!view?.native) return data.legacy.map(entry => ({ ...entry, legacy: true, compatible: true, phase: 'legacy', family: name }));
        return data.operations.filter(entry => name !== 'Surface' || !['pattern-scan', 'validate-patches'].includes(entry.id)).map(entry => ({ ...entry, legacy: false, family: name }));
    }
    const groupTitle = (value: string) => value === 'pre' ? 'Planning' : value === 'post' ? 'Reply' : 'Legacy blocks';
    function close(restore = false) { family = ''; group = ''; search = false; if (restore) anchor?.focus({ preventScroll: true }); }
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
    async function open(name: string, button: HTMLButtonElement) {
        if (family === name) { close(); return; }
        family = name; group = ''; search = false; anchor = button; await tick();
        const rect = button.getBoundingClientRect(), size = familyPanel.getBoundingClientRect(), spot = position(rect, size.width, size.height, 110);
        x = spot.x; y = spot.y; compact = spot.compact;
        familyPanel.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    }
    async function openGroup(value: string, button: HTMLButtonElement) {
        group = value; await tick();
        const rect = button.getBoundingClientRect(), parent = familyPanel.getBoundingClientRect(), size = leafPanel.getBoundingClientRect();
        const spot = position({ top: rect.top, left: parent.left, right: parent.right }, size.width, size.height, 155);
        leafX = spot.x; leafY = spot.y; compact ||= spot.compact;
        leafPanel.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true });
    }
    export async function openSearch() {
        family = ''; group = ''; search = true; query = ''; await tick();
        const pane = bounds(); leafX = Math.min(136, Math.max(4, pane.width - 266)); leafY = 13;
        leafPanel.querySelector<HTMLInputElement>('input')?.focus();
    }
    function select(entry: Entry) { close(true); add(entry.id, entry.legacy); }
    function keys(event: KeyboardEvent) {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true); return; }
        if (event.key === 'ArrowLeft' && group) { event.preventDefault(); group = ''; tick().then(() => familyPanel.querySelector<HTMLButtonElement>('button')?.focus()); return; }
        if (event.key === 'Tab') { close(); return; }
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || (event.target as HTMLElement).tagName === 'INPUT') return;
        event.preventDefault(); const panel = (event.target as HTMLElement).closest('[role="menu"]') || shelf;
        const buttons = [...panel.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')].filter(button => button.getBoundingClientRect().height > 0);
        const index = buttons.indexOf(event.target as HTMLButtonElement);
        buttons[event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowUp' ? buttons.length - 1 : 1)) % buttons.length]?.focus();
    }
</script>
<svelte:window onpointerdown={(event) => { if (!(event.target as HTMLElement).closest('.pc-node-shelf, .pc-shelf-menu')) close(); }} onresize={() => close()} />
<nav class={`pc-node-shelf${compact && family ? ' pc-shelf-replaced' : ''}`} aria-label="Node families" bind:this={shelf}>
    {#each names as name, index}
        <button type="button" data-family={name} class="pc-family-row" style:--pc-family={colors[index]} disabled={!entries(name).length || name === 'Transpose' || name === 'Subgraphs'} title={name === 'Transpose' ? 'No supported Transpose operations yet.' : name === 'Subgraphs' ? 'Reusable subgraphs are not available yet.' : 'Browse ' + name + ' nodes'} aria-haspopup="menu" aria-expanded={family === name} onclick={(event) => open(name, event.currentTarget)} onkeydown={keys}>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d={paths[index]} /></svg><span>{name}</span>
        </button>
    {/each}
</nav>
{#if family}
    <div class={`pc-shelf-menu pc-family-menu${compact && group ? ' pc-shelf-replaced' : ''}`} role="menu" tabindex="-1" aria-label={family + ' categories'} bind:this={familyPanel} style:left={`${x}px`} style:top={`${y}px`} style:--pc-family={colors[names.indexOf(family)]} onkeydown={keys}>
        {#if compact}<button type="button" role="menuitem" onclick={() => close(true)}>‹ Families</button>{/if}
        {#each [...new Set(entries().map(entry => entry.phase))] as phase}
            <button type="button" role="menuitem" aria-haspopup="menu" aria-expanded={group === phase} onclick={(event) => openGroup(phase, event.currentTarget)}><span class="pc-subfamily-name">{groupTitle(phase).toUpperCase()}</span><span aria-hidden="true">›</span></button>
        {/each}
    </div>
{/if}
{#if group || search}
    <div class="pc-shelf-menu pc-leaf-menu" role="menu" tabindex="-1" aria-label={search ? 'Search nodes' : family + ' nodes'} bind:this={leafPanel} style:left={`${leafX}px`} style:top={`${leafY}px`} onkeydown={keys}>
        {#if compact && group}<button type="button" role="menuitem" onclick={() => { group = ''; tick().then(() => familyPanel.querySelector<HTMLButtonElement>('button')?.focus()); }}>‹ {family}</button>{/if}
        {#if search}<input class="text_pole" aria-label="Search nodes" placeholder="Search nodes…" bind:value={query} />{/if}
        {#each (search ? names.flatMap(name => entries(name)).filter(entry => (entry.title + ' ' + entry.id + ' ' + entry.family).toLowerCase().includes(query.toLowerCase())) : entries().filter(entry => entry.phase === group)) as entry (entry.family + entry.id)}
            <button type="button" role="menuitem" disabled={!entry.compatible} title={entry.compatible ? 'Add ' + entry.title : 'Requires the ' + entry.phase + ' phase'} onclick={() => select(entry)}><span class="pc-leaf-icon" aria-hidden="true">◇</span><span>{entry.title}</span><small>{entry.legacy ? 'L' : entry.phase.toUpperCase()}</small></button>
        {/each}
    </div>
{/if}
