<script lang="ts">
    import type { NodeCardData, CanvasActions } from './types';
    let { card, actions }: { card: NodeCardData; actions: CanvasActions } = $props();
    const stop = (event: Event) => event.stopPropagation();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (Cards are keyboard focus stops that reveal named pins and actions in overview.) -->
<div class={card.className} data-id={card.id} title={card.offHint} role="group" tabindex="0" aria-label={`${card.label}: ${card.title}`} style:left={`${card.x}px`} style:top={`${card.y}px`}>
    <div class="pc-native-heading"><svg class="pc-native-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={card.iconPath} /></svg><span class="pc-node-title" title={card.titleHint}>{card.title}</span></div>
    <div class="pc-native-pins">
        {#each card.ports as port (port.id)}
            <div class={`pc-native-row pc-native-row-${port.dir}`} style:grid-row={port.row}>
                <span class="pc-native-pin-label">{port.label}</span>
                <div class={port.className} data-node={card.id} data-dir={port.dir} data-port={port.port} data-side={port.side} data-kind={port.kind} title={port.title} role="img" aria-label={port.title} onmouseenter={() => actions.hoverPin({ nodeId: card.id, dir: port.dir, port: port.port })} onmouseleave={() => actions.hoverPin(null)}></div>
            </div>
        {/each}
    </div>
    {#if card.type === 'note'}<div class="pc-node-body">{card.body}</div>{/if}
    {#if card.compact}<span class="pc-native-alias" title={card.titleHint}>{card.title}</span>{/if}
    {#if card.hostResult}<button type="button" class="pc-node-action pc-host-result" aria-label="Preview host result" onmousedown={stop} onclick={(event) => { stop(event); actions.hostResult(card.id); }}><i class="fa-solid fa-eye" aria-hidden="true"></i> Host result</button>{/if}
    {#if card.boundary}
        <div class="pc-boundary-actions" data-boundary-actions>
            <button type="button" class="pc-node-action" aria-label={'Edit ' + card.boundary.direction} disabled={!card.boundary.editable || !actions.boundary} onpointerdowncapture={stop} onmousedowncapture={stop} onclickcapture={event => { stop(event); if (card.boundary?.editable) actions.boundary?.(card.id, 'edit'); }}>Edit {card.boundary.direction}</button>
            <button type="button" class="pc-node-action" aria-label={'Add ' + card.boundary.direction} disabled={!card.boundary.editable || !actions.boundary} onpointerdowncapture={stop} onmousedowncapture={stop} onclickcapture={event => { stop(event); if (card.boundary?.editable) actions.boundary?.(card.id, 'add'); }}>Add {card.boundary.direction}</button>
        </div>
    {/if}
</div>

<style>
    .pc-boundary-actions { display: flex; gap: 6px; padding: 8px 10px; }
    .pc-boundary-actions .pc-node-action { margin: 0; padding: 3px 5px; border: 1px solid var(--pc-border, #ffffff20); border-radius: 2px; font-size: 11px; cursor: pointer; }
    .pc-boundary-actions :disabled { opacity: .5; cursor: default; }
    :global(.pc-node-compact) .pc-boundary-actions { flex-direction: column; gap: 3px; padding: 4px; }
</style>
