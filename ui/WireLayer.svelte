<script lang="ts">
    import type { WireData } from './types';
    let { wires, ghost }: { wires: WireData[]; ghost: { d: string; className: string; kind: string } | null } = $props();
</script>
{#each wires as wire (wire.id)}
    <path d={wire.d} class="pc-wire-hit" data-id={wire.id} />
    <path d={wire.d} class={wire.className} data-id={wire.id} data-kind={wire.kind}><title>{wire.kind} artifact</title></path>
    <text x={wire.label.x} y={wire.label.y} class={wire.label.className} data-id={wire.id} text-anchor="middle">{wire.label.text}</text>
{/each}
{#if ghost}<path d={ghost.d} class={ghost.className} data-kind={ghost.kind} />{/if}
