<script lang="ts">
    import type { NodeCardData } from './types';
    import type { CommentFrameData } from './comment-types';
    import NodeCard from './NodeCard.svelte';
    import CommentFrame from './CommentFrame.svelte';
    import { tick } from 'svelte';
    import { alignCardPins } from '../src/canvas/pin-alignment.js';
    let { card = null, comment = null }: { card?: NodeCardData | null; comment?: CommentFrameData | null } = $props();
    let holder: HTMLDivElement;
    const actions = { hoverPin() {}, hostResult() {}, group() {} };
    const commentActions = { select() {}, update() {}, command() {} };
    const fixed = $derived(card ? { ...card, x: 0, y: 0 } : null);
    const fixedComment = $derived(comment ? { ...comment, x: 0, y: 0, w: Math.min(comment.w, 360), selected: false, readOnly: true } : null);
    $effect(() => {
        card; comment;
        const element = holder;
        if (!element) return;
        let disposed = false;
        const doc = element.ownerDocument;
        const align = () => {
            if (disposed) return;
            const node = element.querySelector<HTMLElement>('.pc-node-native');
            if (node) alignCardPins(node, 1);
        };
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(align);
        observer?.observe(element);
        doc.addEventListener('pc-theme', align);
        doc.fonts?.addEventListener('loadingdone', align);
        void tick().then(align);
        void doc.fonts?.ready.then(align);
        return () => {
            disposed = true;
            observer?.disconnect();
            doc.removeEventListener('pc-theme', align);
            doc.fonts?.removeEventListener('loadingdone', align);
        };
    });
</script>
<div class="pc-node-guide-preview" data-guide-node={comment?.id ?? card?.id} role="img" aria-label={comment ? `Comment: ${comment.title}` : card ? `${card.label} node: ${card.ports.map(port => port.label).join(', ')}` : 'Node preview'}>
    <div class="pc-node-guide-preview-card" inert bind:this={holder}>
        {#if fixedComment}<CommentFrame comment={fixedComment} actions={commentActions} />{:else if fixed}<NodeCard card={fixed} {actions} />{/if}
    </div>
</div>
<style>
    .pc-node-guide-preview { display: flex; justify-content: center; min-width: 0; padding: 20px 12px; }
    .pc-node-guide-preview-card { min-width: 0; max-width: 100%; }
    .pc-node-guide-preview-card :global(.pc-node) { position: relative; }
    .pc-node-guide-preview-card :global(.pc-comment-frame) { position: relative; max-width: 100%; max-height: 240px; }
</style>
