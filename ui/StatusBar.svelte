<script lang="ts">
    import type { StatusView, WorkbenchActions } from './types';
    let { status, actions }: { status: StatusView; actions: WorkbenchActions } = $props();
    let element: HTMLDivElement;
    export function getElement() { return element; }
</script>
<div class="pc-status" bind:this={element}>
    <span class={`pc-pill ${status.armed ? 'pc-pill-on' : 'pc-pill-off'}`}>{status.armed ? 'Armed' : 'Off'}</span>
    <span class={`pc-status-text${status.warning ? ' pc-status-warn' : ''}`} aria-live="polite">{status.text}</span>
    {#if status.warning}<button type="button" class="pc-btn menu_button pc-primary" title={status.overrideTitle} onclick={actions.unpin}>Run this one instead</button>{/if}
    <span class="pc-spacer"></span>
    <button type="button" class="pc-btn menu_button" onclick={actions.pinChat}><i class="fa-solid fa-thumbtack"></i> {status.chatPinned ? 'Unpin from chat' : 'Pin to this chat'}</button>
    <button type="button" class="pc-btn menu_button" title={status.charTitle} onclick={actions.pinCharacter}><i class="fa-solid fa-user-pen"></i> {status.charPinned ? 'Unpin from character' : 'Pin to character'}</button>
    <button type="button" class="pc-btn menu_button" onclick={actions.makeDefault}><i class="fa-solid fa-star"></i> {status.isDefault ? 'Default canvas' : 'Make default'}</button>
    <button type="button" class="pc-btn menu_button pc-primary" onclick={actions.preview}><i class="fa-solid fa-eye"></i> Preview prompt</button>
</div>
