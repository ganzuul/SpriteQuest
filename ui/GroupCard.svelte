<script lang="ts">
    import type { GroupCardData, CanvasActions } from './types';
    let { group, actions }: { group: GroupCardData; actions: CanvasActions } = $props();
    function down(event: MouseEvent, action: 'open' | 'collapse') { event.stopPropagation(); event.preventDefault(); actions.group(group.id, action); }
    function keyboardClick(event: MouseEvent, action: 'open' | 'collapse') { event.stopPropagation(); if (event.detail === 0) actions.group(group.id, action); }
</script>
<div class={group.className} data-group={group.id} role="group" aria-label={`Group: ${group.title}`} style:left={`${group.x}px`} style:top={`${group.y}px`} style:width={`${group.w}px`} style:height={group.collapsed ? undefined : `${group.h}px`}>
    <div class={group.collapsed ? 'pc-node-head' : 'pc-group-frame-head'}>
        <i class="fa-solid fa-object-group" aria-hidden="true"></i>
        <span class={group.collapsed ? 'pc-node-title' : 'pc-group-frame-title'}>{group.title}</span>
        <span class="pc-group-frame-count">{group.count}</span>
        <button type="button" class={`pc-node-action fa-solid pc-group-btn ${group.collapsed ? 'fa-up-right-and-down-left-from-center' : 'fa-down-left-and-up-right-to-center'}`} data-action={group.collapsed ? 'open' : 'collapse'} title={group.collapsed ? 'Open group' : 'Fold group'} aria-label={group.collapsed ? 'Open group' : 'Fold group'} onmousedown={(e) => down(e, group.collapsed ? 'open' : 'collapse')} onclick={(e) => keyboardClick(e, group.collapsed ? 'open' : 'collapse')}></button>
    </div>
    {#if group.collapsed}<div class="pc-node-body">{group.body}</div>{/if}
</div>
