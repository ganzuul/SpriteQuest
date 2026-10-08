<script lang="ts">
    import type { GroupCardData, CanvasActions } from './types';
    let { group, actions }: { group: GroupCardData; actions: CanvasActions } = $props();
    function down(event: MouseEvent, action: string) { event.stopPropagation(); event.preventDefault(); actions.group(group.id, action); }
    function keyboardClick(event: MouseEvent, action: string) { event.stopPropagation(); if (event.detail === 0) actions.group(group.id, action); }
</script>
<div class={group.className} data-group={group.id} role="group" aria-label={`Group: ${group.title}`} style:left={`${group.x}px`} style:top={`${group.y}px`} style:width={`${group.w}px`} style:height={group.collapsed ? undefined : `${group.h}px`}>
    <div class={group.collapsed ? 'pc-node-head' : 'pc-group-frame-head'}>
        {#if group.collapsed}<span class="pc-badge"><i class="fa-solid fa-object-group pc-badge-icon"></i> Group</span>{:else}<i class="fa-solid fa-object-group"></i>{/if}
        <span class={group.collapsed ? 'pc-node-title' : 'pc-group-frame-title'}>{group.title}</span>
        {#if !group.collapsed}<span class="pc-group-frame-count">{group.count}</span>{/if}
        {#if group.token}<span class={group.token.className} title={group.token.title}>{group.token.text}</span>{/if}
        {#if !group.enabled}<span class="pc-off-pill" title="This whole group is switched off. Nothing in it is sent, and nothing passes through it.">OFF</span>{/if}
        <button type="button" class={`pc-node-action fa-solid pc-group-btn ${group.collapsed ? 'fa-up-right-and-down-left-from-center' : 'fa-down-left-and-up-right-to-center'}`} data-action={group.collapsed ? 'open' : 'collapse'} title={group.collapsed ? 'Open the group as a blanket' : 'Fold the group'} aria-label={group.collapsed ? 'Open group' : 'Fold group'} onmousedown={(e) => down(e, group.collapsed ? 'open' : 'collapse')} onclick={(e) => keyboardClick(e, group.collapsed ? 'open' : 'collapse')}></button>
        <button type="button" class={`pc-node-action pc-toggle fa-solid ${group.enabled ? 'fa-toggle-on pc-toggle-on' : 'fa-toggle-off pc-toggle-off'}`} data-action="toggle" title={group.enabled ? 'Switch the whole group off' : 'Switch the whole group on'} aria-label="Toggle group" aria-pressed={group.enabled} onmousedown={(e) => down(e, 'toggle')} onclick={(e) => keyboardClick(e, 'toggle')}></button>
    </div>
    {#if group.collapsed}
        <div class="pc-node-body">{group.body}</div><div class="pc-node-model pc-group-io">{group.io}</div>
        <div class="pc-node-cond">{group.enabled ? 'double-click to open' : 'switched off — nothing goes through'}</div>
        <div class="pc-gport pc-gport-in" data-gport="in" data-group={group.id} title="Drag up to a block to wire it into this group"></div>
        <div class="pc-gport pc-gport-out" data-gport="out" data-group={group.id} title="Drag to wire a block in this group into another block"></div>
    {:else}<div class="pc-group-resize" data-action="resize" title="Drag to resize the blanket"></div>{/if}
</div>
