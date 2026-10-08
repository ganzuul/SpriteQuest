<script lang="ts">
    import Toolbar from './Toolbar.svelte';
    import StatusBar from './StatusBar.svelte';
    import CanvasControls from './CanvasControls.svelte';
    import DomainSurface from './DomainSurface.svelte';
    import type { WorkbenchView, WorkbenchActions } from './types';
    let { actions }: { actions: WorkbenchActions } = $props();
    let view = $state.raw<WorkbenchView>({ graphs: [], graphId: '', armed: false, sideOpen: true, inspectorOpen: true, history: { undo: false, redo: false, undoTitle: 'Nothing to undo', redoTitle: 'Nothing to redo', note: '', showNote: false }, status: { armed: false, warning: false, text: '', overrideTitle: '', chatPinned: false, charPinned: false, charTitle: 'No character selected', isDefault: false }, camera: { x: 0, y: 0, zoom: 1, mode: 'select' }, selectionCount: 0 });
    let root: HTMLDivElement, canvasHost: HTMLDivElement;
    let toolbar: { getParts(): { header: HTMLElement; graphSelect: HTMLSelectElement; arm: HTMLInputElement; sideBtn: HTMLButtonElement; inspBtn: HTMLButtonElement } };
    let status: { getElement(): HTMLDivElement }, library: { getElement(): HTMLDivElement }, inspector: { getElement(): HTMLDivElement }, preview: { getElement(): HTMLDivElement };
    export function getParts() { return { root, parts: { ...toolbar.getParts(), status: status.getElement(), sidebar: library.getElement(), inspector: inspector.getElement(), preview: preview.getElement(), canvasHost } }; }
    export function update(value: Partial<WorkbenchView>) { view = { ...view, ...value }; }
</script>
<div class="pc-root" role="dialog" aria-modal="true" aria-label="Silly Canvas" data-pc-workbench="svelte" bind:this={root}>
    <Toolbar state={view} {actions} bind:this={toolbar} />
    <StatusBar status={view.status} {actions} bind:this={status} />
    <div class="pc-body">
        <DomainSurface className="pc-sidebar" label="Block library" bind:this={library} />
        <div class="pc-stage">
            <div class="pc-canvas-area">
                <div class="pc-canvas-host" aria-label="Node canvas" bind:this={canvasHost}></div>
                <CanvasControls camera={view.camera} count={view.selectionCount} {actions} />
            </div>
            <DomainSurface className="pc-preview" label="Prompt preview" bind:this={preview} />
        </div>
        <DomainSurface className="pc-inspector" label="Selection inspector" bind:this={inspector} />
    </div>
</div>
