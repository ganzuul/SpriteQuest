<script lang="ts">
    import type { CommentCommand, CommentFrameData, CommentPatch } from './comment-types';
    let { comment, readOnly = false, onPatch, onCommand }: {
        comment: CommentFrameData;
        readOnly?: boolean;
        onPatch: (patch: CommentPatch) => void;
        onCommand: (command: CommentCommand) => void;
    } = $props();
    const locked = $derived(readOnly || comment.readOnly);
    const stop = (event: Event) => event.stopPropagation();
    function patch(value: CommentPatch) { if (!locked) onPatch(value); }
    function command(value: CommentCommand) { if (!locked) onCommand(value); }
</script>

<section class="pc-comment-details" aria-label="Comment details">
    <h3>Comment</h3>
    {#if locked}<p class="pc-detail-meta">Read-only comment</p>{/if}
    <fieldset class="pc-detail-group" disabled={locked}>
        <legend>Comment</legend>
        <label>Title<input aria-label="Comment title" value={comment.title} disabled={locked} onkeydowncapture={stop} onchange={event => patch({ title: event.currentTarget.value })} /></label>
        <label>Notes<textarea aria-label="Comment notes" rows="5" value={comment.content} disabled={locked} onkeydowncapture={stop} onchange={event => patch({ content: event.currentTarget.value })}></textarea></label>
        <label class="pc-comment-color-label">Color<input aria-label="Comment color" type="color" value={comment.color} disabled={locked} onchange={event => patch({ color: event.currentTarget.value })} /></label>
        <label class="pc-detail-check"><input aria-label="Move contents" type="checkbox" checked={comment.moveContents} disabled={locked} onchange={event => patch({ moveContents: event.currentTarget.checked })} /> Move contents</label>
        <small>Moves fully contained nodes when you drag the comment header.</small>
    </fieldset>
    <div class="pc-comment-commands">
        <button type="button" class="pc-btn" disabled={locked} onclick={() => command('fit')}>Fit to contents</button>
        <button type="button" class="pc-btn pc-danger" disabled={locked} onclick={() => command('delete')}>Delete comment</button>
    </div>
    <small>Deleting this comment keeps its contents.</small>
</section>

<style>
    .pc-comment-details { display: grid; gap: 12px; color: var(--pc-text, #e8e8e8); }
    h3, p { margin: 0; }
    .pc-detail-group { display: grid; gap: 10px; margin: 0; padding: 12px; border: 1px solid var(--pc-border, #777); border-radius: var(--pc-r-sm, 5px); }
    label { display: grid; gap: 5px; font-size: 13px; }
    input:not([type="checkbox"]), textarea {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        padding: 6px 8px;
        border: 1px solid var(--pc-border, #777);
        border-radius: var(--pc-r-sm, 5px);
        background: var(--pc-block, #282830);
        color: var(--pc-text, #e8e8e8);
        font: inherit;
    }
    textarea { resize: vertical; line-height: 1.45; }
    .pc-detail-check { display: flex; align-items: center; gap: 7px; }
    .pc-comment-color-label { grid-template-columns: 1fr 56px; align-items: center; }
    input[type="color"] { height: 30px; padding: 2px; }
    small, .pc-detail-meta { font-size: 12px; line-height: 1.4; color: var(--pc-muted, #9aa0a6); }
    .pc-comment-commands { display: flex; flex-wrap: wrap; gap: 8px; }
    .pc-btn { padding: 6px 10px; border: 1px solid var(--pc-border, #777); border-radius: var(--pc-r-sm, 5px); background: transparent; color: var(--pc-text, #e8e8e8); font: inherit; cursor: pointer; }
    .pc-danger { color: var(--pc-error, #e08f8f); }
    :disabled { cursor: default; }
    input:focus-visible, textarea:focus-visible, button:focus-visible { outline: 2px solid var(--pc-flow, #7ab7ff); outline-offset: 2px; }
</style>
