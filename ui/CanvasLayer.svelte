<script lang="ts">
    import NodeCard from './NodeCard.svelte';
    import GroupCard from './GroupCard.svelte';
    import WireLayer from './WireLayer.svelte';
    import type { CanvasActions, NodeCardData, GroupCardData, WireData, PositionUpdate } from './types';
    let { actions }: { actions: CanvasActions } = $props();
    let nodes = $state.raw<NodeCardData[]>([]), groups = $state.raw<GroupCardData[]>([]), wires = $state.raw<WireData[]>([]);
    let ghost = $state.raw<{ d: string; className: string } | null>(null);
    let bounds = $state.raw({ w: 4000, h: 4000 });
    let viewport: HTMLDivElement, svg: SVGSVGElement, nodeLayer: HTMLDivElement;
    export function getLayers() { return { viewport, svg, nodeLayer }; }
    export function setNodes(value: NodeCardData[]) { nodes = value; }
    export function setGroups(value: GroupCardData[]) { groups = value; }
    export function setWires(value: WireData[], size: { w: number; h: number }, preview: typeof ghost) { wires = value; bounds = size; ghost = preview; }
    export function setPositions(nodeUpdates: PositionUpdate[], groupUpdates: PositionUpdate[]) {
        const n = new Map(nodeUpdates.map(value => [value.id, value])), g = new Map(groupUpdates.map(value => [value.id, value]));
        nodes = nodes.map(node => n.has(node.id) ? { ...node, ...n.get(node.id) } : node);
        groups = groups.map(group => g.has(group.id) ? { ...group, ...g.get(group.id) } : group);
    }
</script>
<div class="pc-viewport" data-pc-renderer="svelte" bind:this={viewport}>
    <svg class="pc-wires" width={bounds.w} height={bounds.h} viewBox={`0 0 ${bounds.w} ${bounds.h}`} bind:this={svg} aria-label="Canvas connections">
        <WireLayer {wires} {ghost} />
    </svg>
    <div class="pc-nodes" bind:this={nodeLayer}>
        {#each groups.filter(group => !group.collapsed) as group (group.id)}<GroupCard {group} {actions} />{/each}
        {#each nodes as card (card.id)}<NodeCard {card} {actions} />{/each}
        {#each groups.filter(group => group.collapsed) as group (group.id)}<GroupCard {group} {actions} />{/each}
    </div>
</div>
