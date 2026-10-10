<script lang="ts">
    import { tick } from 'svelte';
    import type { WorkbenchView, WorkbenchActions } from './types';
    let { state: view, actions, local }: { state: WorkbenchView; actions: WorkbenchActions; local: (command: string) => void } = $props();
    const rootWorkflow = $derived(view.rootWorkflow ?? view.workflow);
    let active = $state('');
    let nav: HTMLElement;
    let panel = $state<HTMLDivElement>(null!);
    let anchor: HTMLButtonElement | null = null;
    let left = $state(0), top = $state(0);
    const names = ['File', 'Edit', 'Graph', 'Node', 'Preview', 'Workflows', 'Tools', 'Help'];
    type Item = { label: string; command: string; shortcut?: string; disabled?: boolean };
    const item = (label: string, command: string, shortcut = '', disabled = false): Item => ({ label, command, shortcut, disabled });
    function items(name: string): Item[] {
        switch (name) {
            case 'File': return [item('New workflow', 'new'), item('Open workflow…', 'open-workflow'), item('Open examples…', 'examples'), item('Save workflow', 'save'), item('Import into graph…', 'import-into-graph'), item('Export workflow JSON…', 'export'), item('Close workspace', 'close')];
            case 'Edit': return [item('Undo', 'undo', 'Ctrl Z', !view.history.undo), item('Redo', 'redo', 'Ctrl Shift Z', !view.history.redo), item('Copy', 'copy', 'Ctrl C', !view.selectionActions?.copy), item('Cut', 'cut', 'Ctrl X', !view.selectionActions?.cut), item('Paste', 'paste', 'Ctrl V'), item('Delete selection', 'delete-selection', 'Del', !view.selectionActions?.delete)];
            case 'Graph': return [item('Select tool', 'select-tool'), item('Pan tool', 'pan-tool'), item('Zoom in', 'zoom-in'), item('Zoom out', 'zoom-out'), item('Fit to view', 'fit'), item('Fit selection', 'fit-selection', '', !view.selectionCount), item('Duplicate workflow', 'duplicate'), item('Rename workflow', 'rename'), item('Delete workflow', 'delete')];
            case 'Node': return [item('Add node…', 'add-node'), item('Inspect selection', 'reveal-inspector')];
            case 'Preview': return [item('Show preview', 'show-preview'), item('Collapse preview', 'collapse-preview')];
            case 'Workflows': return [item('Workflow setup…', 'workflow-setup'), item('Workflow examples…', 'examples'), item('Run workflow', 'run-workflow', '', !rootWorkflow || !!rootWorkflow?.busy || !!rootWorkflow?.issues.length), item('Stop workflow', 'stop-workflow', '', !rootWorkflow?.busy)];
            case 'Tools': return [item('Theme and colours', 'theme'), item('Toggle inspector', 'inspector')];
            default: return [item('Workspace guide', 'help')];
        }
    }
    function close(restore = false) { active = ''; if (restore) anchor?.focus({ preventScroll: true }); }
    async function open(name: string, button: HTMLButtonElement, focus = false) {
        if (active === name && !focus) { close(); return; }
        active = name; anchor = button; await tick();
        const rect = button.getBoundingClientRect(), bounds = panel.getBoundingClientRect();
        left = Math.max(4, Math.min(rect.left, window.innerWidth - bounds.width - 4)); top = rect.bottom + 2;
        if (focus) panel.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
    }
    function command(value: string) {
        close(true);
        if (['workflow-setup', 'examples', 'show-preview', 'collapse-preview', 'add-node', 'help'].includes(value)) local(value);
        else if (value === 'select-tool' || value === 'pan-tool') actions.mode(value === 'select-tool' ? 'select' : 'pan');
        else if (value === 'zoom-in' || value === 'zoom-out') actions.zoom(value === 'zoom-in' ? 1.15 : 1 / 1.15);
        else actions.command(value);
    }
    function keys(event: KeyboardEvent) {
        const target = event.target as HTMLElement;
        if (event.key === 'Escape' && active) { event.preventDefault(); event.stopPropagation(); close(true); return; }
        if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault(); const name = active || target.textContent || names[0];
            const next = names[(names.indexOf(name) + (event.key === 'ArrowRight' ? 1 : names.length - 1)) % names.length];
            const button = nav.querySelector<HTMLButtonElement>(`[data-menu="${next}"]`)!;
            if (active) open(next, button, true); else button.focus();
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            if (!active) { open(target.dataset.menu || names[0], target as HTMLButtonElement, true); return; }
            const buttons = [...panel.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')], index = buttons.indexOf(target as HTMLButtonElement);
            buttons[event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowUp' ? buttons.length - 1 : 1)) % buttons.length]?.focus();
        } else if (event.key === 'Tab') close();
    }
</script>
<svelte:window onpointerdown={(event) => { if (active && !nav.contains(event.target as Node) && !panel?.contains(event.target as Node)) close(); }} onresize={() => close()} />
<nav class="pc-workspace-menus" aria-label="Workspace menus" bind:this={nav}>
    {#each names as name}<button type="button" data-menu={name} class="pc-flat-menu" aria-haspopup="menu" aria-expanded={active === name} onclick={(event) => open(name, event.currentTarget)} onkeydown={keys}>{name}</button>{/each}
    {#if active}
        <div class="pc-workspace-menu-panel" role="menu" tabindex="-1" aria-label={active} bind:this={panel} style:left={`${left}px`} style:top={`${top}px`} onkeydown={keys}>
            {#each items(active) as entry}<button type="button" role="menuitem" disabled={entry.disabled} onclick={() => command(entry.command)}><span>{entry.label}</span><small>{entry.shortcut}</small></button>{/each}
        </div>
    {/if}
</nav>
