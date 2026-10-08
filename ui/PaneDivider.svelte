<script lang="ts">
    import { onDestroy } from 'svelte';
    let { height, min = 90, max = 500, change, start }: { height: number; min?: number; max?: number; change: (height: number) => void; start: () => void } = $props();
    let handle: HTMLDivElement;
    let drag: { id: number; y: number; height: number } | null = null;
    const clamp = (value: number) => Math.max(min, Math.min(max, value));
    function down(event: PointerEvent) {
        if (event.button !== 0) return;
        cancel();
        event.preventDefault(); start(); drag = { id: event.pointerId, y: event.clientY, height };
        handle.setPointerCapture(event.pointerId); handle.focus({ preventScroll: true });
    }
    function move(event: PointerEvent) { if (drag?.id === event.pointerId) change(clamp(drag.height + event.clientY - drag.y)); }
    function finish(rollback = false, pointerId = drag?.id) {
        if (!drag || drag.id !== pointerId) return;
        const completed = drag; drag = null;
        if (rollback) change(completed.height);
        if (handle.hasPointerCapture(completed.id)) handle.releasePointerCapture(completed.id);
    }
    function cancel() { finish(true); }
    function key(event: KeyboardEvent) {
        const delta = event.shiftKey ? 40 : 12;
        const value = event.key === 'ArrowUp' ? height - delta : event.key === 'ArrowDown' ? height + delta : event.key === 'Home' ? min : event.key === 'End' ? max : null;
        if (value !== null) { event.preventDefault(); event.stopPropagation(); start(); change(clamp(value)); }
        if (event.key === 'Escape' && drag) { event.preventDefault(); event.stopPropagation(); cancel(); }
    }
    onDestroy(cancel);
</script>
<svelte:window onblur={cancel} />
<!-- A separator owns keyboard focus while it adjusts the two adjacent panes. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<div class="pc-pane-divider" role="separator" aria-label="Resize preview" aria-orientation="horizontal" aria-valuemin={min} aria-valuemax={Math.round(max)} aria-valuenow={Math.round(height)} tabindex="0" bind:this={handle} onpointerdown={down} onpointermove={move} onpointerup={(event) => finish(false, event.pointerId)} onpointercancel={(event) => finish(true, event.pointerId)} onlostpointercapture={(event) => finish(true, event.pointerId)} onkeydown={key}></div>
