<script lang="ts">
    import { onMount } from 'svelte';
    import type { WorkflowExampleTile } from './types';
    let { examples = [], issue = '', retry, scrollTop = 0, scroll, open }: { examples?: readonly WorkflowExampleTile[]; issue?: string; retry?: () => boolean | void; scrollTop?: number; scroll: (top: number) => void; open: (id: string) => boolean | Promise<boolean> } = $props();
    let grid: HTMLDivElement;
    let opening = $state('');
    onMount(() => { grid.scrollTop = scrollTop; });
    async function choose(id: string) {
        if (opening) return;
        opening = id;
        try { await open(id); } finally { opening = ''; }
    }
</script>

{#if issue}<div class="pc-examples-issue" role="alert"><span>{issue}</span>{#if retry}<button type="button" class="pc-btn menu_button" onclick={() => retry?.()}>Retry</button>{/if}</div>{/if}
<div class="pc-examples-grid" bind:this={grid} onscroll={() => scroll(grid.scrollTop)} aria-busy={!!opening}>
    {#each examples as example (example.id)}
        {@const preview = example.thumbnail}
        <button type="button" class="pc-example-tile" class:pc-example-unavailable={!preview} aria-label={example.title} aria-describedby={example.issue ? `pc-example-issue-${example.number}` : undefined} title={example.issue || example.goal} disabled={!!opening || !preview} onclick={() => choose(example.id)}>
            {#if preview}
            <svg class="pc-example-preview" viewBox={`${preview.bounds.x} ${preview.bounds.y} ${preview.bounds.w} ${preview.bounds.h}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
                {#each preview.comments as comment (comment.id)}
                    <g class="pc-example-comment" data-id={comment.id}>
                        <rect x={comment.x} y={comment.y} width={comment.w} height={comment.h} rx="4" style:stroke={comment.color} />
                        <text x={comment.x + 12} y={comment.y + 24}>{comment.title}</text>
                    </g>
                {/each}
                {#each preview.wires as wire (wire.id)}<path class="pc-wire pc-wire-native" data-kind={wire.kind} data-id={wire.id} d={wire.d} />{/each}
                {#each preview.nodes as node (node.id)}
                    <g class={node.className} data-id={node.id}>
                        <rect class="pc-example-card" x={node.x} y={node.y} width={node.w} height={node.h} rx="4" />
                        <svg x={node.x + 8} y={node.y + 7} width="16" height="16" viewBox="0 0 24 24"><path class="pc-example-icon" d={node.iconPath} /></svg>
                        <text class="pc-example-node-title" x={node.x + 28} y={node.y + 20} textLength={node.title.length * 6 > node.w - 36 ? node.w - 36 : undefined} lengthAdjust="spacingAndGlyphs">{node.title}</text>
                        {#each node.ports as pin (pin.id)}
                            <circle data-kind={pin.kind} cx={pin.x} cy={pin.y} r="4" />
                            <text class="pc-example-pin-label" x={pin.x + (pin.dir === 'in' ? 9 : -9)} y={pin.y + 4} text-anchor={pin.dir === 'in' ? 'start' : 'end'}>{pin.label}</text>
                        {/each}
                    </g>
                {/each}
            </svg>
            {:else}<span class="pc-example-unavailable-preview"><strong>Unavailable</strong><span id={`pc-example-issue-${example.number}`}>{example.issue}</span></span>{/if}
            <span class="pc-example-title">{example.title}</span>
        </button>
    {/each}
</div>

<style>
    .pc-examples-issue { flex: none; display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-bottom: 1px solid var(--pc-border); color: var(--pc-warn); font-size: 12px; }
    .pc-examples-issue span { flex: 1; }
    .pc-examples-issue button { flex: none; padding: 3px 8px; }
    .pc-examples-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-content: start; gap: 8px; overflow: auto; min-height: 0; flex: 1; padding: 10px; scrollbar-gutter: stable; }
    .pc-example-tile { box-sizing: border-box; display: flex; flex-direction: column; min-width: 0; height: 116px; padding: 4px; border: 1px solid var(--pc-border); border-radius: 4px; color: var(--pc-text); background: var(--pc-block); text-align: left; cursor: pointer; content-visibility: auto; contain-intrinsic-size: auto 116px; }
    .pc-example-tile:hover, .pc-example-tile:focus-visible { border-color: var(--pc-accent, var(--pc-flow)); }
    .pc-example-tile:focus-visible { outline: 2px solid var(--pc-accent, var(--pc-flow)); outline-offset: -2px; }
    .pc-example-tile:disabled { cursor: progress; opacity: .7; }
    .pc-example-tile.pc-example-unavailable { cursor: default; opacity: .8; }
    .pc-example-unavailable-preview { box-sizing: border-box; display: flex; flex-direction: column; flex: none; gap: 4px; width: 100%; height: 72px; padding: 7px; border: 1px solid var(--pc-border); border-radius: 2px; background: var(--pc-canvas); color: var(--pc-muted); font: 11px/14px system-ui, 'Segoe UI', sans-serif; overflow: hidden; }
    .pc-example-unavailable-preview strong { color: var(--pc-warn); font-weight: 500; }
    .pc-example-unavailable-preview > span { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; }
    .pc-example-preview { box-sizing: border-box; display: block; flex: none; width: 100%; height: 72px; border: 1px solid var(--pc-border); border-radius: 2px; background-color: var(--pc-canvas); background-image: radial-gradient(var(--pc-border) .6px, transparent .7px); background-size: 7px 7px; pointer-events: none; }
    .pc-example-title { box-sizing: border-box; display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; height: 34px; line-height: 15px; padding: 4px 3px 0; font: 12px/15px system-ui, 'Segoe UI', sans-serif; }
    .pc-example-card { fill: var(--pc-block); stroke: var(--pc-border); stroke-width: 1.5; }
    .pc-example-preview text { fill: var(--pc-text); font: 12px system-ui, 'Segoe UI', sans-serif; }
    .pc-example-preview .pc-example-node-title { font-weight: 500; }
    .pc-example-preview .pc-example-pin-label { fill: var(--pc-muted); font-size: 10px; }
    .pc-example-icon { fill: none; stroke: var(--pc-muted); stroke-width: 1.5; }
    .pc-example-comment rect { fill: color-mix(in srgb, var(--pc-panel-solid) 45%, transparent); stroke-width: 2; }
    .pc-example-comment text { fill: var(--pc-muted); }
    .pc-example-preview circle { fill: var(--pc-pin-color, #72adc0); }
    .pc-example-preview [data-kind="context"] { --pc-pin-color: #72adc0; }
    .pc-example-preview [data-kind="guidance"] { --pc-pin-color: #c190be; }
    .pc-example-preview [data-kind="draft"] { --pc-pin-color: #92c9ad; }
    .pc-example-preview [data-kind="findings"], .pc-example-preview [data-kind="patches"] { --pc-pin-color: #b65b9e; }
    .pc-example-preview [data-kind="candidate"] { --pc-pin-color: #cca56d; }
    .pc-example-preview [data-kind="text"] { --pc-pin-color: #a5bfa0; }
    .pc-example-preview [data-kind="data"] { --pc-pin-color: #7e9bc5; }
    @media (max-width: 620px) { .pc-examples-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
