<script lang="ts">
    import NodeCard from './NodeCard.svelte';
    import GroupCard from './GroupCard.svelte';
    import WireLayer from './WireLayer.svelte';
    import CommentFrame from './CommentFrame.svelte';
    import NodeProfilePicker from './NodeProfilePicker.svelte';
    import type { NodeProfileData } from './node-profile-types';
    import type { CommentFrameData, CommentFrameActions } from './comment-types';
    import type { CanvasActions, NodeCardData, GroupCardData, WireData, PositionUpdate } from './types';
    let { actions }: { actions: CanvasActions } = $props();
    let nodes = $state.raw<NodeCardData[]>([]), groups = $state.raw<GroupCardData[]>([]), wires = $state.raw<WireData[]>([]);
    let comments = $state.raw<CommentFrameData[]>([]);
    let nodeProfiles = $state.raw<NodeProfileData[]>([]);
    let commentActions = $state.raw<CommentFrameActions>({ select() {}, update() {}, command() {} });
    let ghost = $state.raw<{ d: string; className: string } | null>(null);
    let bounds = $state.raw({ w: 4000, h: 4000 });
    let viewport: HTMLDivElement, svg: SVGSVGElement, nodeLayer: HTMLDivElement, commentLayer: HTMLDivElement;
    export function getLayers() { return { viewport, svg, nodeLayer, commentLayer }; }
    export function setComments(value: CommentFrameData[], callbacks: CommentFrameActions) { comments = value; commentActions = callbacks; }
    export function setNodes(value: NodeCardData[]) { nodes = value; }
    export function setNodeProfiles(value: NodeProfileData[]) { nodeProfiles = value; }
    export function setGroups(value: GroupCardData[]) { groups = value; }
    export function setWires(value: WireData[], size: { w: number; h: number }, preview: typeof ghost) { wires = value; bounds = size; ghost = preview; }
    export function setPositions(nodeUpdates: PositionUpdate[], groupUpdates: PositionUpdate[]) {
        const n = new Map(nodeUpdates.map(value => [value.id, value])), g = new Map(groupUpdates.map(value => [value.id, value]));
        nodes = nodes.map(node => n.has(node.id) ? { ...node, ...n.get(node.id) } : node);
        comments = comments.map(comment => n.has(comment.id) ? { ...comment, ...n.get(comment.id) } : comment);
        groups = groups.map(group => g.has(group.id) ? { ...group, ...g.get(group.id) } : group);
    }
</script>
<div class="pc-viewport" data-pc-renderer="svelte" bind:this={viewport}>
    <div class="pc-comment-layer" bind:this={commentLayer}>
        {#each comments as comment (comment.id)}<CommentFrame {comment} actions={commentActions} />{/each}
    </div>
    <svg class="pc-wires" width={bounds.w} height={bounds.h} viewBox={`0 0 ${bounds.w} ${bounds.h}`} bind:this={svg} aria-label="Canvas connections">
        <WireLayer {wires} {ghost} />
    </svg>
    <div class="pc-nodes" bind:this={nodeLayer}>
        {#each groups.filter(group => !group.collapsed) as group (group.id)}<GroupCard {group} {actions} />{/each}
        {#each nodes as card (card.id)}<NodeCard {card} {actions} />{/each}
        {#each groups.filter(group => group.collapsed) as group (group.id)}<GroupCard {group} {actions} />{/each}
    </div>
    <div class="pc-node-profile-layer">
        {#each nodeProfiles as row (row.id)}<NodeProfilePicker {row} editProfile={actions.editProfile} refreshProfiles={actions.refreshProfiles} />{/each}
    </div>
</div>
<style>
    .pc-comment-layer { position: absolute; top: 0; left: 0; pointer-events: none; }
    .pc-node-profile-layer { position: absolute; top: 0; left: 0; pointer-events: none; }
</style>
