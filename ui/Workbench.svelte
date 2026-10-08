<script lang="ts">
    import { onMount, tick } from 'svelte';
    import Toolbar from './Toolbar.svelte';
    import StatusBar from './StatusBar.svelte';
    import CanvasControls from './CanvasControls.svelte';
    import DomainSurface from './DomainSurface.svelte';
    import PaneDivider from './PaneDivider.svelte';
    import GraphTabs from './GraphTabs.svelte';
    import NodeShelf from './NodeShelf.svelte';
    import WorkflowSetup from './WorkflowSetup.svelte';
    import type { WorkbenchView, WorkbenchActions } from './types';
    let { actions }: { actions: WorkbenchActions } = $props();
    let view = $state.raw<WorkbenchView>({ graphs: [], graphId: '', armed: false, sideOpen: true, inspectorOpen: true, history: { undo: false, redo: false, undoTitle: 'Nothing to undo', redoTitle: 'Nothing to redo', note: '', showNote: false }, status: { armed: false, warning: false, text: '', overrideTitle: '', chatPinned: false, charPinned: false, charTitle: 'No character selected', isDefault: false }, camera: { x: 0, y: 0, zoom: 1, mode: 'select' }, selectionCount: 0 });
    let root: HTMLDivElement, canvasHost: HTMLDivElement, stage: HTMLDivElement;
    let toolbar: { focusGraphSelect(): void; getParts(): { header: HTMLElement; graphSelect: HTMLSelectElement; arm: HTMLInputElement; sideBtn: HTMLButtonElement; inspBtn: HTMLButtonElement } };
    let status: { getElement(): HTMLDivElement }, library: { getElement(): HTMLDivElement }, inspector: { getElement(): HTMLDivElement }, preview: { getElement(): HTMLDivElement };
    export function getParts() { return { root, parts: { ...toolbar.getParts(), status: status.getElement(), sidebar: library.getElement(), inspector: inspector.getElement(), preview: preview.getElement(), canvasHost } }; }
    export function update(value: Partial<WorkbenchView>) { view = { ...view, ...value }; }
    const storageKey = 'lattice.workspace.preview';
    function savedPane() { try { const data = JSON.parse(localStorage.getItem(storageKey) || 'null'); return { height: Number.isFinite(data?.height) ? Math.max(90, Math.min(600, data.height)) : 220, collapsed: data?.collapsed === true }; } catch { return { height: 220, collapsed: false }; } }
    const initial = savedPane();
    let previewHeight = $state(initial.height), collapsed = $state(initial.collapsed), maxHeight = $state(500);
    let overlay = $state('');
    let dialog = $state<HTMLDivElement>(null!);
    let overlayAnchor: HTMLElement | null = null;
    let shelf: { openSearch(): void };
    function persist() { try { localStorage.setItem(storageKey, JSON.stringify({ height: previewHeight, collapsed })); } catch { /* Private storage may be disabled. */ } }
    function resizeStart() { actions.resizeStart?.(); }
    function collapse(value: boolean) { resizeStart(); collapsed = value; persist(); }
    export function revealPreview() { collapse(false); }
    async function local(command: string) {
        if (command === 'open-workflow') toolbar.focusGraphSelect();
        else if (command === 'show-preview') collapse(false);
        else if (command === 'collapse-preview') collapse(true);
        else if (command === 'add-node') shelf.openSearch();
        else { overlayAnchor = document.activeElement as HTMLElement; overlay = command; await tick(); dialog.querySelector<HTMLButtonElement>('button')?.focus(); }
    }
    function closeOverlay() { overlay = ''; overlayAnchor?.focus({ preventScroll: true }); }
    function overlayKeys(event: KeyboardEvent) {
        // Keep native input editing and modal button activation, while none
        // of these keys can reach the background graph shortcut listeners.
        event.stopPropagation();
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeOverlay(); }
        if (event.key === 'Tab') {
            const elements = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, textarea, [tabindex="0"]')];
            const first = elements[0], last = elements.at(-1);
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
    }
    onMount(() => {
        const measure = () => { maxHeight = Math.max(90, stage.clientHeight - 190); };
        const Resize = globalThis.ResizeObserver;
        if (!Resize) { measure(); window.addEventListener('resize', measure); return () => window.removeEventListener('resize', measure); }
        const observer = new Resize(measure);
        observer.observe(stage); return () => observer.disconnect();
    });
</script>
<div class="pc-root" role="dialog" aria-modal="true" aria-label="Lattice" data-pc-workbench="svelte" bind:this={root}>
    <Toolbar state={view} {actions} {local} bind:this={toolbar} />
    <StatusBar status={view.status} {actions} bind:this={status} />
    <div class="pc-body">
        <DomainSurface className="pc-sidebar" label="Block library" bind:this={library} />
        <div class="pc-stage" bind:this={stage}>
            <section class="pc-preview-pane" class:pc-preview-collapsed={collapsed} aria-label="Output preview" style:--pc-preview-height={`${Math.min(previewHeight, maxHeight)}px`}>
                <header class="pc-preview-pane-head"><strong>Preview</strong><button type="button" class="pc-btn menu_button" aria-expanded={!collapsed} onclick={() => collapse(!collapsed)}>{collapsed ? 'Expand preview' : 'Collapse preview'}</button></header>
                <div class="pc-preview-content" hidden={collapsed}>
                    <DomainSurface className="pc-preview" label="Prompt preview" bind:this={preview} />
                    <p class="pc-preview-placeholder">{view.workflow?.native ? 'Run the workflow to review its result in Details.' : 'Choose Preview › Compile prompt to inspect the current prompt.'}</p>
                </div>
            </section>
            {#if !collapsed}<PaneDivider height={Math.min(previewHeight, maxHeight)} max={maxHeight} start={resizeStart} change={(height) => { previewHeight = height; persist(); }} />{/if}
            <GraphTabs />
            <div class="pc-canvas-area">
                <div class="pc-canvas-host" aria-label="Node canvas" bind:this={canvasHost}></div>
                <NodeShelf view={view.workflow} add={(id, legacy) => actions.addNode?.(id, legacy)} bind:this={shelf} />
                <CanvasControls camera={view.camera} count={view.selectionCount} {actions} />
            </div>
        </div>
        <DomainSurface className="pc-inspector" label="Selection inspector" bind:this={inspector} />
    </div>
    {#if overlay}
        <div class="pc-workspace-overlay">
            <div class="pc-workspace-dialog" role="dialog" tabindex="-1" aria-modal="true" aria-label={overlay === 'workflow-setup' ? 'Workflow setup' : 'Workspace guide'} bind:this={dialog} onkeydown={overlayKeys} onpaste={(event) => event.stopPropagation()}>
                <header><h2>{overlay === 'workflow-setup' ? 'Workflow setup' : 'Workspace guide'}</h2><button type="button" class="pc-btn menu_button" aria-label="Close panel" onclick={closeOverlay}>×</button></header>
                {#if overlay === 'workflow-setup'}<WorkflowSetup view={view.workflow} {actions} />{:else}<p>Browse node families on the floating shelf. Middle mouse pans the graph; the wheel zooms around the pointer. Use the divider or its arrow keys to resize Preview.</p><p>Library holds personal blocks and saved material. Setup contains workflow examples, phase assignment and role defaults. Arm enables the selected host workflow; Run tests it explicitly.</p>{/if}
            </div>
        </div>
    {/if}
</div>
