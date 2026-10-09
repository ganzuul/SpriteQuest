<script lang="ts">
    import { onMount, tick } from 'svelte';
    import Toolbar from './Toolbar.svelte';
    import StatusBar from './StatusBar.svelte';
    import CanvasControls from './CanvasControls.svelte';
    import DomainSurface from './DomainSurface.svelte';
    import PaneDivider from './PaneDivider.svelte';
    import GraphTabs from './GraphTabs.svelte';
    import GraphBreadcrumbs from './GraphBreadcrumbs.svelte';
    import NodeDetails from './NodeDetails.svelte';
    import OutputPreview from './OutputPreview.svelte';
    import RunDetails from './RunDetails.svelte';
    import RunMeter from './RunMeter.svelte';
    import PortalManager from './PortalManager.svelte';
    import SubgraphManager from './SubgraphManager.svelte';
    import NodeSearch from './NodeSearch.svelte';
    import PinMenu from './PinMenu.svelte';
    import NodeShelf from './NodeShelf.svelte';
    import WorkflowSetup from './WorkflowSetup.svelte';
    import ImportReview from './ImportReview.svelte';
    import type { WorkbenchView, WorkbenchActions } from './types';
    let { actions }: { actions: WorkbenchActions } = $props();
    let view = $state.raw<WorkbenchView>({ graphs: [], graphId: '', armed: false, sideOpen: true, inspectorOpen: true, history: { undo: false, redo: false, undoTitle: 'Nothing to undo', redoTitle: 'Nothing to redo', note: '', showNote: false }, status: { armed: false, warning: false, text: '', overrideTitle: '', chatPinned: false, charPinned: false, charTitle: 'No character selected', isDefault: false }, camera: { x: 0, y: 0, zoom: 1, mode: 'select' }, selectionCount: 0 });
    let root: HTMLDivElement, canvasHost: HTMLDivElement, stage: HTMLDivElement;
    let toolbar: { focusGraphSelect(): void; getParts(): { header: HTMLElement; graphSelect: HTMLSelectElement; arm: HTMLInputElement; sideBtn: HTMLButtonElement; inspBtn: HTMLButtonElement } };
    let status: { getElement(): HTMLDivElement }, library: { getElement(): HTMLDivElement }, inspector: { getElement(): HTMLDivElement }, preview: { getElement(): HTMLDivElement };
    export function getParts() { return { root, parts: { ...toolbar.getParts(), status: status.getElement(), sidebar: library.getElement(), inspector: inspector.getElement(), preview: preview.getElement(), canvasHost } }; }
    export function updateActions(value: Partial<WorkbenchActions>) { actions = { ...actions, ...value }; }
    export function update(value: Partial<WorkbenchView>) { view = { ...view, ...value }; }
    const storageKey = 'lattice.workspace.preview';
    function savedPane() { try { const data = JSON.parse(localStorage.getItem(storageKey) || 'null'); return { height: Number.isFinite(data?.height) ? Math.max(90, Math.min(600, data.height)) : 240, collapsed: data?.collapsed === true }; } catch { return { height: 240, collapsed: false }; } }
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
    export function revealWorkflowSetup() { return local('workflow-setup'); }
    async function local(command: string) {
        if (command === 'open-workflow') toolbar.focusGraphSelect();
        else if (command === 'show-preview') collapse(false);
        else if (command === 'collapse-preview') collapse(true);
        else if (command === 'add-node') shelf.openSearch();
        else { overlayAnchor = document.activeElement as HTMLElement; overlay = command; await tick(); dialog.querySelector<HTMLButtonElement>('button')?.focus(); }
    }
    function closeOverlay() { overlay = ''; overlayAnchor?.focus({ preventScroll: true }); }
    function managerKeys(event: KeyboardEvent, kind: 'portalManager' | 'subgraphManager') {
        event.stopPropagation();
        if (event.key === 'Escape') { event.preventDefault(); actions[kind]?.close?.(); return; }
        if (event.key === 'Tab') {
            const elements = [...(event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex="0"]')];
            const first = elements[0], last = elements.at(-1);
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
    }
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
<div class="pc-root" class:pc-native-workspace={view.workflow?.native} class:pc-native-default={view.nativeDefaultTheme} class:pc-native-flat={view.nativeFlatCanvas} role="dialog" aria-modal="true" aria-label="Lattice" data-pc-workbench="svelte" bind:this={root}>
    <Toolbar state={view} {actions} {local} bind:this={toolbar} />
    <StatusBar status={view.status} {actions} bind:this={status} />
    <div class="pc-body">
        <DomainSurface className="pc-sidebar" label="Block library" bind:this={library} />
        <div class="pc-stage" bind:this={stage}>
            <section class="pc-preview-pane" class:pc-preview-collapsed={collapsed} aria-label="Output preview" style:--pc-preview-height={`${Math.min(previewHeight, maxHeight)}px`}>
                <header class="pc-preview-pane-head"><strong>Preview</strong><button type="button" class="pc-btn menu_button" aria-expanded={!collapsed} onclick={() => collapse(!collapsed)}>{collapsed ? 'Expand preview' : 'Collapse preview'}</button></header>
                <div class="pc-preview-content" hidden={collapsed}>
                    <DomainSurface className="pc-preview" label="Prompt preview" bind:this={preview} />
                    {#if view.workflow?.native}<OutputPreview view={view.outputPreview ?? null} actions={actions.outputPreview} collapse={() => collapse(true)} />{:else}<p class="pc-preview-placeholder">{view.workflow?.native ? 'Run the workflow to review its result in Details.' : 'Choose Preview › Compile prompt to inspect the current prompt.'}</p>{/if}
                </div>
            </section>
            {#if !collapsed}<PaneDivider height={Math.min(previewHeight, maxHeight)} max={maxHeight} start={resizeStart} change={(height) => { previewHeight = height; persist(); }} />{/if}
            <GraphTabs views={view.graphViews} actions={actions.graphViewActions} panelId="pc-workspace-graph" />
            <div class="pc-canvas-area" id="pc-workspace-graph" role={view.graphViews ? 'tabpanel' : undefined}>
                {#if view.workflow?.native}<div class="pc-workspace-run"><RunMeter view={view.runMeter ?? null} open={() => { overlay = 'run-details'; }} /></div>{/if}
                <GraphBreadcrumbs view={view.graphViews?.active} actions={actions.graphViewActions} />
                <div class="pc-canvas-host" aria-label="Node canvas" bind:this={canvasHost}></div>
                {#if view.nativeDiagnostic}<p class="pc-native-diagnostic" role="alert">{view.nativeDiagnostic}</p>{/if}
                <NodeShelf view={view.workflow} choices={view.nativeChoices} choose={actions.chooseNative} manageSubgraphs={actions.manageSubgraphs} readOnly={view.readOnly} add={(id, legacy) => actions.addNode?.(id, legacy)} bind:this={shelf} />
                {#if !view.workflow?.native}<CanvasControls camera={view.camera} count={view.selectionCount} {actions} />{/if}
            </div>
        </div>
        <div class="pc-inspector pc-workspace-details" hidden={!view.inspectorOpen}>
            {#if view.workflow?.native}<header class="pc-details-heading"><strong>Details</strong><button type="button" onclick={() => actions.managePortals?.()}>Portals</button><button type="button" onclick={() => actions.manageSubgraphs?.()}>Subgraphs</button></header><NodeDetails view={view.nodeDetails ?? null} actions={actions.nodeDetails} />{/if}
            <DomainSurface className="pc-legacy-inspector" label="Selection inspector" bind:this={inspector} />
        </div>
    </div>
    {#if overlay}
        <div class="pc-workspace-overlay">
            <div class="pc-workspace-dialog" role="dialog" tabindex="-1" aria-modal="true" aria-label={overlay === 'workflow-setup' ? 'Workflow setup' : overlay === 'run-details' ? 'Run details' : 'Workspace guide'} bind:this={dialog} onkeydown={overlayKeys} onpaste={(event) => event.stopPropagation()}>
                <header><h2>{overlay === 'workflow-setup' ? 'Workflow setup' : overlay === 'run-details' ? 'Run details' : 'Workspace guide'}</h2><button type="button" class="pc-btn menu_button" aria-label="Close panel" onclick={closeOverlay}>×</button></header>
                {#if overlay === 'run-details'}<RunDetails view={view.runDetails ?? null} actions={actions.runDetails} />{:else if overlay === 'workflow-setup'}<WorkflowSetup view={view.rootWorkflow ?? view.workflow} {actions} />{:else}<p>Browse node families on the floating shelf. Middle mouse pans the graph; the wheel zooms around the pointer. Use the divider or its arrow keys to resize Preview.</p><p>Library holds personal blocks and saved material. Setup contains workflow examples, phase assignment and role defaults. Arm enables the selected host workflow; Run tests it explicitly.</p><p>File › Import into graph reviews a same-mode fragment before one undoable insertion. Import canvas opens a separate graph. Legacy canvases have one Output: use a fragment without another Output, or open the full workflow separately. Legacy request bounds conservatively include possible repeats and loops; actual reachable calls may be lower.</p><p>Right-click empty graph space or drag from a pin to search for compatible nodes. Double-click a subgraph to open its saved body in a graph tab. Pinned bodies are read-only; Make local copy enables edits through the real parent instance.</p><p>The Subgraphs shelf manages individual subgraph JSON files. Portals connect pins through named references. Preview artifact tabs show results for the selected node; Run to here checks the request bound before running. Apply reviews the fresh result against the full root workflow.</p>{/if}
            </div>
        </div>
    {/if}
    <NodeSearch view={view.nativeSearch} actions={actions.nativeSearch} />
    <PinMenu view={view.nativePinMenu} actions={actions.nativePinMenu} />
    {#if view.portalManager}<div class="pc-workspace-overlay"><div class="pc-manager-dialog" role="dialog" tabindex="-1" aria-modal="true" aria-label="Manage portals" onkeydown={(event) => managerKeys(event, 'portalManager')} onpaste={(event) => event.stopPropagation()}><PortalManager view={view.portalManager} actions={actions.portalManager} /></div></div>{/if}
    {#if view.subgraphManager}<div class="pc-workspace-overlay"><div class="pc-manager-dialog" role="dialog" tabindex="-1" aria-modal="true" aria-label="Manage subgraphs" onkeydown={(event) => managerKeys(event, 'subgraphManager')} onpaste={(event) => event.stopPropagation()}><SubgraphManager view={view.subgraphManager} actions={actions.subgraphManager} /></div></div>{/if}
    {#if view.importReview}<ImportReview view={view.importReview} {actions} />{/if}
</div>

<style>
    .pc-manager-dialog { max-height: calc(100% - 24px); max-width: calc(100% - 24px); overflow: auto; border-radius: 4px; }
    .pc-workspace-details { flex: 0 0 258px; width: 258px; min-width: 0; overflow: auto; border-left: 1px solid var(--pc-border); background: var(--pc-panel); }
    .pc-details-heading { display: flex; align-items: center; gap: 5px; padding: 8px 12px; font-size: 11px; border-bottom: 1px solid var(--pc-border); }
    .pc-details-heading strong { margin-right: auto; } .pc-details-heading button { padding: 3px 5px; border: 1px solid var(--pc-border); border-radius: 2px; background: var(--pc-block); color: inherit; font: inherit; font-size: 10px; }
    .pc-workspace-run { position: absolute; left: 14px; bottom: 13px; z-index: 20; }
    .pc-native-workspace :global(.pc-status) { display: none; }
    .pc-native-flat :global(.pc-canvas-host) { background-image: none; }
    .pc-native-workspace { --pc-r: 4px; --pc-r-sm: 2px; }
    .pc-native-default { --pc-panel: #202120; --pc-panel-solid: #202120; --pc-field: #1a1b19; --pc-block: #1d1e1d; --pc-canvas: #2b2b29; --pc-border: #454641; --pc-flow: var(--SmartThemeQuoteColor, #e18a24); background: #272725; }
    .pc-native-workspace :global(.pc-preview-pane) { position: relative; box-sizing: border-box; background: var(--pc-panel); border-radius: 4px; box-shadow: inset 2px 2px 3px #00000070, inset -1px -1px 0 #ffffff20; }
    .pc-native-workspace :global(.pc-preview-pane-head) { display: none; }
    .pc-native-workspace :global(.pc-canvas-area) { border-color: var(--pc-flow); border-radius: 4px; box-shadow: inset 2px 2px 3px #00000070, inset -1px -1px 0 #ffffff20; overflow: visible; }
    .pc-native-workspace :global(.pc-canvas-area::after), .pc-native-workspace :global(.pc-preview-pane::after) { content: ""; position: absolute; inset: 1px; border-radius: 3px; box-shadow: inset 2px 2px 3px #00000070, inset -1px -1px 0 #ffffff20; pointer-events: none; z-index: 4; }
    .pc-native-workspace :global(.pc-graph-tabs) { padding: 0; }
    .pc-native-diagnostic { position: absolute; top: 10px; left: 12px; right: 12px; z-index: 10; margin: 0; padding: 8px 10px; border: 1px solid #b55c64; border-radius: 2px; background: var(--pc-panel); color: #e9a4aa; font-size: 12px; }
    .pc-native-workspace.pc-native-workspace :global(.pc-graph-tab[aria-selected="true"]) { color: var(--pc-flow); border-color: var(--pc-flow); background: var(--pc-canvas); }
    .pc-native-workspace :global(.pc-graph-tab-list) { padding: 0 6px 3px 0; margin-bottom: -3px; }
    .pc-native-workspace :global(.pc-graph-tab[aria-selected="true"]::after) { background: var(--pc-canvas); border-color: var(--pc-flow); }
    .pc-native-workspace :global(.pc-graph-tab[aria-selected="true"]::before) { border-color: var(--pc-flow); }
    .pc-native-workspace :global(.pc-graph-location) { position: absolute; top: 0; left: 0; right: 0; z-index: 5; }
    .pc-native-workspace :global(.pc-canvas-host) { border-radius: 4px; }
    .pc-native-workspace :global(.pc-inspector) { box-sizing: border-box; flex-basis: 258px; width: 258px; padding: 0; position: static; }
    .pc-native-workspace :global(.pc-preview) { display: none; }
    .pc-native-workspace :global(.pc-node-native) { background: var(--pc-block); border-radius: 4px; }
    .pc-native-workspace :global(.pc-family-input .pc-native-heading), .pc-native-workspace :global(.pc-family-input .pc-native-alias) { color: #96ad52; }
    .pc-native-workspace :global(.pc-family-shaping .pc-native-heading), .pc-native-workspace :global(.pc-family-shaping .pc-native-alias) { color: #589aab; }
    .pc-native-workspace :global(.pc-family-surface .pc-native-heading), .pc-native-workspace :global(.pc-family-surface .pc-native-alias) { color: #92c9ad; }
    .pc-native-workspace :global(.pc-family-transpose .pc-native-heading), .pc-native-workspace :global(.pc-family-transpose .pc-native-alias) { color: #9080b6; }
    .pc-native-workspace :global(.pc-family-derive .pc-native-heading), .pc-native-workspace :global(.pc-family-derive .pc-native-alias) { color: #b65b9e; }
    .pc-native-workspace :global(.pc-family-output .pc-native-heading), .pc-native-workspace :global(.pc-family-output .pc-native-alias) { color: #c96d82; }
    .pc-native-workspace :global(.pc-family-subgraphs .pc-native-heading), .pc-native-workspace :global(.pc-family-subgraphs .pc-native-alias) { color: #a3aa99; }
    @media (max-width: 860px) {
        .pc-native-workspace :global(.pc-body) { flex-direction: column; overflow: auto; }
        .pc-native-workspace :global(.pc-stage) { flex: none; height: max(440px, 65vh); width: 100%; }
        .pc-native-workspace :global(.pc-inspector) { flex: none; width: 100%; }
        .pc-workspace-details { flex: none; width: 100%; border-left: 0; border-top: 1px solid var(--pc-border); min-height: 150px; }
    }
</style>
