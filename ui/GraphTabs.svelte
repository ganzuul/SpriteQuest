<script lang="ts">
    import { tick } from 'svelte';
    import type { GraphViews, GraphViewActions, GraphViewInfo } from './view-types';
    let { views, actions = {}, panelId, idPrefix = 'pc-graph-view' }: { views?: GraphViews; actions?: GraphViewActions; panelId?: string; idPrefix?: string } = $props();
    let nav = $state<HTMLElement>(null!), menu = $state<HTMLDivElement>(null!), trigger = $state<HTMLButtonElement>(null!);
    let menuOpen = $state(false), focusKey = $state(''), previousActive = '';
    const tabElements: Record<string, HTMLButtonElement> = {};
    $effect(() => {
        const activeKey = views?.active.key ?? '';
        if (previousActive !== activeKey) { focusKey = activeKey; menuOpen = false; }
        else if (views && !views.tabs.some(tab => tab.key === focusKey)) focusKey = activeKey;
        previousActive = activeKey;
    });
    function fullLabel(view: GraphViewInfo) {
        const location = view.breadcrumbs.map(crumb => crumb.label).join(' / ') || view.label;
        const identity = view.identity;
        return identity.kind === 'instance' ? `${location} (${identity.instancePath.map(id => JSON.stringify(id)).join(' → ')})` : identity.kind === 'library' ? `${location} · Library v${identity.definitionRef.version} (${identity.definitionRef.id})` : location;
    }
    function focusTab(key: string) { focusKey = key; actions.focusView?.(key); tabElements[key]?.focus({ preventScroll: true }); }
    function tabKeys(event: KeyboardEvent, index: number) {
        if (!views || !['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Delete'].includes(event.key)) return;
        event.preventDefault(); event.stopPropagation();
        if (event.key === 'Delete') { if (views.tabs[index].identity.kind !== 'root') closeTab(views.tabs[index]); return; }
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? views.tabs.length - 1 : (index + (event.key === 'ArrowLeft' ? views.tabs.length - 1 : 1)) % views.tabs.length;
        focusTab(views.tabs[next].key);
    }
    async function closeTab(view: GraphViewInfo) {
        if (view.identity.kind === 'root') return;
        actions.closeView?.(view.key);
        await tick();
        const currentKey = views?.active.key;
        if (currentKey && views?.tabs.some(tab => tab.key === currentKey)) { focusKey = currentKey; tabElements[currentKey]?.focus({ preventScroll: true }); }
    }
    function closeMenu(restore = false) { menuOpen = false; if (restore) trigger?.focus({ preventScroll: true }); }
    async function toggleMenu() {
        menuOpen = !menuOpen;
        if (menuOpen) { await tick(); if (menuOpen) menu?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus(); }
    }
    function menuKeys(event: KeyboardEvent) {
        event.stopPropagation();
        if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); return; }
        if (event.key === 'Tab') { closeMenu(); return; }
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const buttons = [...menu.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')], index = buttons.indexOf(event.target as HTMLButtonElement);
        buttons[event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowUp' ? buttons.length - 1 : 1)) % buttons.length]?.focus();
    }
    function menuAction(action: () => void) { closeMenu(true); action(); }
</script>
<svelte:window onpointerdown={(event) => { if (menuOpen && !nav?.contains(event.target as Node)) closeMenu(); }} />
{#if views}
    <nav class="pc-graph-tabs pc-graph-tabs-multi" aria-label="Open graph views" bind:this={nav}>
        <div class="pc-graph-tab-list" role="tablist" aria-label="Graph views">
            {#each views.tabs as view, index (view.key)}
                <div class="pc-graph-tab-item" class:pc-graph-tab-active={view.key === views.active.key}>
                    <button type="button" class="pc-graph-tab" class:pc-graph-tab-closeable={view.identity.kind !== 'root'} role="tab" id={`${idPrefix}-${index}`} aria-controls={panelId} aria-selected={view.key === views.active.key} tabindex={view.key === (focusKey || views.active.key) ? 0 : -1} title={fullLabel(view)} onclick={() => focusTab(view.key)} onkeydown={(event) => tabKeys(event, index)} bind:this={tabElements[view.key]}><span>{view.label}</span>{#if view.readOnly}<span class="pc-graph-tab-lock" aria-label="Read only">◇</span>{/if}</button>
                    {#if view.identity.kind !== 'root'}<button type="button" class="pc-graph-tab-close" aria-label={`Close ${view.label} · ${fullLabel(view)}`} title={`Close ${fullLabel(view)}`} tabindex={view.key === (focusKey || views.active.key) ? 0 : -1} onclick={() => closeTab(view)}>×</button>{/if}
                </div>
            {/each}
        </div>
        <button type="button" class="pc-graph-view-overflow" aria-label="Graph view actions" title="Focus, close or reopen graph views" aria-haspopup="menu" aria-expanded={menuOpen} onclick={toggleMenu} bind:this={trigger}>⋯</button>
        {#if menuOpen}
            <div class="pc-graph-view-menu" role="menu" aria-label="Graph view actions" tabindex="-1" onkeydown={menuKeys} bind:this={menu}>
                {#each views.tabs as view (view.key)}<button type="button" role="menuitem" title={fullLabel(view)} onclick={() => menuAction(() => focusTab(view.key))}>Focus {fullLabel(view)}</button>{/each}
                <button type="button" role="menuitem" disabled={views.active.identity.kind === 'root' || !actions.closeView} onclick={() => menuAction(() => closeTab(views!.active))}>Close active view</button>
                <button type="button" role="menuitem" disabled={views.tabs.every(view => view.identity.kind === 'root' || view.key === views!.active.key) || !actions.closeOtherViews} onclick={() => menuAction(() => actions.closeOtherViews?.(views!.active.key))}>Close other views</button>
                {#each views.closedViews as view (view.key)}<button type="button" role="menuitem" title={fullLabel(view)} onclick={() => menuAction(() => actions.reopenView?.(view.key))}>Reopen {view.label} · {fullLabel(view)}</button>{/each}
            </div>
        {/if}
    </nav>
{/if}
<style>
    .pc-graph-tabs-multi { gap: 4px; min-width: 0; }
    .pc-graph-tab-list { display: flex; align-items: stretch; min-width: 0; flex: 1; overflow-x: auto; scrollbar-width: none; }
    .pc-graph-tab-list::-webkit-scrollbar { display: none; }
    .pc-graph-tab-item { position: relative; display: flex; flex: 0 0 auto; max-width: 220px; }
    .pc-graph-tabs-multi .pc-graph-tab { display: flex; align-items: center; gap: 5px; min-width: 0; max-width: 220px; white-space: nowrap; }
    .pc-graph-tab > span:first-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
    .pc-graph-tab-closeable { padding-right: 28px; }
    .pc-graph-tabs-multi .pc-graph-tab:not([aria-selected="true"]) { background: var(--pc-panel); margin-bottom: 0; color: var(--pc-muted); }
    .pc-graph-tabs-multi .pc-graph-tab:not([aria-selected="true"])::before, .pc-graph-tabs-multi .pc-graph-tab:not([aria-selected="true"])::after { display: none; }
    .pc-graph-tab-lock { font-size: 10px; }
    .pc-graph-tab-close { position: absolute; right: 4px; top: 7px; width: 18px; height: 18px; padding: 0; border: 0; border-radius: 2px; background: transparent; color: var(--pc-muted); font: inherit; line-height: 18px; }
    .pc-graph-view-overflow { flex: 0 0 26px; align-self: center; height: 24px; border: 1px solid var(--pc-border); border-radius: 2px; background: var(--pc-panel-solid); color: var(--pc-text); font: inherit; }
    .pc-graph-tab-close:hover, .pc-graph-view-overflow:hover { color: var(--pc-accent); background: var(--pc-panel); }
    .pc-graph-tab-close:focus-visible, .pc-graph-view-overflow:focus-visible, .pc-graph-view-menu button:focus-visible { outline: 2px solid var(--pc-accent); outline-offset: -2px; }
    .pc-graph-view-menu { position: absolute; top: 100%; right: 4px; z-index: 10; display: flex; flex-direction: column; width: max-content; max-width: min(420px, calc(100vw - 40px)); max-height: min(360px, 60vh); overflow: auto; padding: 4px; border: 1px solid var(--pc-border); border-radius: 4px; background: var(--pc-panel-solid); box-shadow: var(--pc-recess); }
    .pc-graph-view-menu button { display: block; width: 100%; padding: 6px 8px; border: 0; border-radius: 2px; background: transparent; color: var(--pc-text); font: inherit; font-size: 12px; text-align: left; overflow-wrap: anywhere; }
    .pc-graph-view-menu button:hover:not(:disabled) { background: var(--pc-panel); color: var(--pc-accent); }
    .pc-graph-view-menu button:disabled { opacity: .45; }
    @media (max-width: 480px) { .pc-graph-tab-item, .pc-graph-tabs-multi .pc-graph-tab { max-width: 160px; } }
</style>
