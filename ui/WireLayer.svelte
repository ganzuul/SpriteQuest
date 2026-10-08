<script lang="ts">
    import type { WireData } from './types';
    let { wires, markerId, ghost }: { wires: WireData[]; markerId: string; ghost: { d: string; className: string } | null } = $props();
</script>
<defs><marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" class="pc-loop-arrow" /></marker></defs>
{#each wires as wire (wire.id)}
    <path d={wire.d} class="pc-wire-hit" data-id={wire.id} />
    <path d={wire.d} class={wire.className} data-id={wire.id} data-kind={wire.kind} marker-end={wire.arrow ? `url(#${markerId})` : undefined}><title>{wire.kind ? `${wire.kind} artifact` : wire.label.text}</title></path>
    <text x={wire.label.x} y={wire.label.y} class={wire.label.className} data-id={wire.label.id} text-anchor={wire.label.anchor}>{wire.label.text}{#if wire.label.title}<title>{wire.label.title}</title>{/if}</text>
{/each}
{#if ghost}<path d={ghost.d} class={ghost.className} />{/if}
