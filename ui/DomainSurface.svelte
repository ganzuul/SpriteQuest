<script lang="ts">
    let { className, label }: { className: string; label: string } = $props();
    let element: HTMLDivElement;
    export function getElement() { return element; }
</script>
<div class={className} aria-label={label} bind:this={element}></div>
