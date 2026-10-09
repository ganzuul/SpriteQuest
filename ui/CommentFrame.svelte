<script lang="ts">
    import type { CommentFrameActions, CommentFrameData } from './comment-types';
    let { comment, actions }: { comment: CommentFrameData; actions: CommentFrameActions } = $props();
    const stop = (event: Event) => event.stopPropagation();
</script>

<div class="pc-comment-frame" class:pc-comment-selected={comment.selected} class:pc-comment-readonly={comment.readOnly}
    data-id={comment.id} role="group" aria-label={`Comment: ${comment.title}`}
    style:left={`${comment.x}px`} style:top={`${comment.y}px`} style:width={`${comment.w}px`} style:height={`${comment.h}px`} style:--frame-color={comment.color}>
    <header class="pc-comment-header">
        <button type="button" class="pc-comment-select" aria-label={`Select comment: ${comment.title}`} title="Drag header to move comment" onclick={event => { if (event.detail === 0) actions.select(comment.id); }}>⋮⋮</button>
        {#if comment.readOnly}
            <span class="pc-comment-title">{comment.title}</span>
        {:else}
            <input class="pc-comment-title-input" aria-label="Comment title" value={comment.title}
                onfocus={() => actions.select(comment.id)} onpointerdowncapture={stop} onmousedowncapture={stop} onclickcapture={stop} onkeydowncapture={stop}
                onchange={event => { if (!comment.readOnly) actions.update(comment.id, { title: event.currentTarget.value }); }} />
        {/if}
    </header>
    <div class="pc-comment-notes">{comment.content}</div>
    {#if !comment.readOnly}
        <button type="button" class="pc-comment-resize" aria-label={`Resize comment: ${comment.title}`} title="Drag to resize comment" onclick={event => { if (event.detail === 0) actions.select(comment.id); }}></button>
    {/if}
</div>

<style>
    .pc-comment-frame {
        position: absolute;
        box-sizing: border-box;
        pointer-events: none;
        border: 1px solid color-mix(in srgb, var(--frame-color) 58%, var(--pc-border, #777));
        border-radius: var(--pc-r, 4px);
        background: color-mix(in srgb, var(--frame-color) 9%, transparent);
        color: var(--pc-text, #e8e8e8);
        font-family: var(--pc-font, inherit);
    }
    .pc-comment-selected { outline: 2px solid var(--pc-flow, #7ab7ff); outline-offset: 2px; }
    .pc-comment-header {
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: 5px;
        height: 36px;
        box-sizing: border-box;
        padding: 0 10px 0 7px;
        border-bottom: 1px solid color-mix(in srgb, var(--frame-color) 35%, transparent);
        border-radius: var(--pc-r, 4px) var(--pc-r, 4px) 0 0;
        background: color-mix(in srgb, var(--frame-color) 18%, var(--pc-panel, #18181d));
        cursor: grab;
    }
    .pc-comment-title, .pc-comment-title-input {
        flex: 1;
        min-width: 0;
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        color: var(--pc-text, #e8e8e8);
    }
    .pc-comment-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pc-comment-title-input {
        box-sizing: border-box;
        padding: 3px 4px;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 3px;
    }
    .pc-comment-title-input:focus { outline: 1px solid var(--pc-flow, #7ab7ff); background: var(--pc-panel, #18181d); }
    .pc-comment-select {
        padding: 1px 2px;
        border: 0;
        background: transparent;
        color: var(--pc-text, #e8e8e8);
        font: inherit;
        cursor: grab;
    }
    .pc-comment-notes {
        pointer-events: none;
        box-sizing: border-box;
        max-height: calc(100% - 36px);
        overflow: hidden;
        padding: 10px 12px 18px;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        font-size: 12px;
        line-height: 1.45;
        color: var(--pc-text, #e8e8e8);
    }
    .pc-comment-resize {
        position: absolute;
        right: 2px;
        bottom: 2px;
        width: 16px;
        height: 16px;
        pointer-events: auto;
        cursor: nwse-resize;
        border: 0;
        padding: 0;
        background: repeating-linear-gradient(135deg, transparent 0 3px, var(--pc-text, #e8e8e8) 3px 4px);
        clip-path: polygon(100% 0, 100% 100%, 0 100%);
    }
    .pc-comment-select:focus-visible, .pc-comment-resize:focus-visible { outline: 2px solid var(--pc-flow, #7ab7ff); }
    .pc-comment-readonly .pc-comment-header, .pc-comment-readonly .pc-comment-select { cursor: default; }
</style>
