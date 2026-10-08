<script lang="ts">
    let { height, min = 90, max = 500, change, start }: { height: number; min?: number; max?: number; change: (height: number) => void; start: () => void } = $props();
    let handle: HTMLDivElement;
    let drag: { id: number; y: number; height: number } | null = null;
    const clamp = (value: number) => Math.max(min, Math.min(max, value));
    function down(event: PointerEvent) {
        if (event.button !== 0) return;
        event.preventDefault(); start(); drag = { id: event.pointerId, y: event.clientY, height };
        handle.setPointerCapture(event.pointerId); handle.focus({ preventScroll: true });
    }
    function move(event: PointerEvent) { if (drag?.id === event.pointerId) change(clamp(drag.height + event.clientY - drag.y)); }
    function finish(event: PointerEvent, cancel = false) {
        if (drag?.id !== event.pointerId) return;
        const original = drag.height; drag = null;
        if (cancel) change(original);
        if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    }
    function key(event: KeyboardEvent) {
        const delta = event.shiftKey ? 40 : 12;
        const value = event.key === 'ArrowUp' ? height - delta : event.key === 'ArrowDown' ? height + delta : event.key === 'Home' ? min : event.key === 'End' ? max : null;
        if (value !== null) { event.preventDefault(); event.stopPropagation(); start(); change(clamp(value)); }
        if (event.key === 'Escape' && drag) { change(drag.height); drag = null; }
    }
</script>
<!-- A separator owns keyboard focus while it adjusts the two adjacent panes. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<div class="pc-pane-divider" role="separator" aria-label="Resize preview" aria-orientation="horizontal" aria-valuemin={min} aria-valuemax={Math.round(max)} aria-valuenow={Math.round(height)} tabindex="0" bind:this={handle} onpointerdown={down} onpointermove={move} onpointerup={(event) => finish(event)} onpointercancel={(event) => finish(event, true)} onlostpointercapture={(event) => finish(event, true)} onkeydown={key}></div>
