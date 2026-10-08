<script lang="ts">
    import type { WorkbenchView, WorkbenchActions } from './types';
    let { camera, count, actions }: { camera: WorkbenchView['camera']; count: number; actions: WorkbenchActions } = $props();
</script>
<div class="pc-canvas-controls" role="toolbar" aria-label="Canvas tools">
    <button type="button" class={`pc-btn${camera.mode === 'select' ? ' pc-on' : ''}`} aria-label="Select tool" aria-pressed={camera.mode === 'select'} title="Drag empty canvas to select blocks" onclick={() => actions.mode('select')}>Select</button>
    <button type="button" class={`pc-btn${camera.mode === 'pan' ? ' pc-on' : ''}`} aria-label="Pan tool" aria-pressed={camera.mode === 'pan'} title="Drag anywhere to pan; hold Space for temporary pan" onclick={() => actions.mode('pan')}>Pan</button>
    <span class="pc-control-separator"></span>
    <button type="button" class="pc-btn" aria-label="Zoom out" title="Zoom out" onclick={() => actions.zoom(1 / 1.15)}>−</button>
    <output class="pc-zoom-readout" aria-label="Canvas zoom">{Math.round(camera.zoom * 100)}%</output>
    <button type="button" class="pc-btn" aria-label="Zoom in" title="Zoom in" onclick={() => actions.zoom(1.15)}>+</button>
    <button type="button" class="pc-btn" title="Fit selection (.)" aria-label="Fit selection" onclick={actions.fitSelection}>Fit</button>
    {#if count}<span class="pc-selection-count">{count} selected</span>{/if}
</div>
<div class="pc-gesture-hint">Drag to select · Shift adds · Alt removes · Space pans</div>
