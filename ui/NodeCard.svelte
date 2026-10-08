<script lang="ts">
    import type { NodeCardData, CanvasActions } from './types';
    let { card, actions }: { card: NodeCardData; actions: CanvasActions } = $props();
    const stop = (event: Event) => event.stopPropagation();
</script>

<div class={card.className} data-id={card.id} title={card.hint} role="group" aria-label={`${card.label}: ${card.title}`}
    style:left={`${card.x}px`} style:top={`${card.y}px`} style:width={card.native ? undefined : `${card.w}px`}
    onmouseenter={() => { if (!card.native) actions.hover(card.id); }} onmouseleave={() => actions.hover(null)}>
    {#if card.native}
        <div class="pc-native-heading"><svg class="pc-native-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={card.iconPath} /></svg><span class="pc-node-title" title={card.titleHint}>{card.title}</span></div>
        <div class="pc-native-pins">
            {#each card.ports as port (port.id)}
                <div class={`pc-native-row pc-native-row-${port.dir}`} style:grid-row={port.row}>
                    <span class="pc-native-pin-label">{port.label}<small>{port.kind}</small></span>
                    <div class={port.className} data-node={card.id} data-dir={port.dir} data-port={port.port} data-side={port.side} data-kind={port.kind} title={port.title} role="img" aria-label={port.title} onmouseenter={() => actions.hoverPin({ nodeId: card.id, dir: port.dir, port: port.port! })} onmouseleave={() => actions.hoverPin(null)}></div>
                </div>
            {/each}
        </div>
        {#if card.hostResult}<button type="button" class="pc-node-action pc-host-result" aria-label="Preview host result" onmousedown={stop} onclick={(event) => { stop(event); actions.hostResult(card.id); }}><i class="fa-solid fa-eye" aria-hidden="true"></i> Host result</button>{/if}
    {:else}
    <div class="pc-node-head">
        <span class="pc-badge"><i class={`fa-solid ${card.icon} pc-badge-icon`}></i> {card.label}</span>
        <span class="pc-node-title" title={card.titleHint}>{card.title}</span>
        {#if card.token}<span class={card.token.className} title={card.token.title}>{card.token.text}</span>{/if}
        {#if card.offHint}<span class="pc-off-pill" title={card.offHint}>OFF</span>{/if}
        {#if card.help}<button type="button" class="pc-node-action pc-help-btn fa-solid fa-circle-question" title="How Deciders work" aria-label="How Deciders work" onmousedown={stop} onclick={(event) => { stop(event); actions.help(card.id); }}></button>{/if}
        {#if card.toggle}<button type="button" class={`pc-node-action pc-toggle fa-solid ${card.enabled ? 'fa-toggle-on pc-toggle-on' : 'fa-toggle-off pc-toggle-off'}`} title={card.enabled ? 'Switched on — click to switch off' : 'Switched off — click to switch on'} aria-label={`Switch ${card.title} ${card.enabled ? 'off' : 'on'}`} aria-pressed={card.enabled} onmousedown={stop} onclick={(event) => { stop(event); actions.toggle(card.id); }}></button>{/if}
    </div>
    {#if card.body !== null}<div class="pc-node-body">{card.body}</div>{/if}
    {#if card.body === null}
        <div class={card.rowClass}>
            {#if card.mode}<div class={card.mode.className}>{card.mode.text}</div>{/if}
            {#each card.rows as row (row.id)}
                <div class={`pc-dec-key${row.chosen ? ' pc-dec-chosen' : ''}${row.fallback ? ' pc-dec-fallback' : ''}`}><b>{row.name}</b><span>{row.text}</span></div>
            {/each}
        </div>
    {/if}
    {#if card.model}
        {#if card.model.pick}
            <button type="button" class="pc-node-action pc-node-model pc-node-model-pick" title={card.model.title} onmousedown={stop} ondblclick={stop} onclick={(event) => { stop(event); actions.model(card.id, event.currentTarget); }}>
                <i class="fa-solid fa-microchip"></i> {card.model.where}{#if card.model.actual} · <b>{card.model.actual}</b>{/if} <i class="fa-solid fa-caret-down pc-model-caret"></i>
            </button>
        {:else}<div class="pc-node-model" title={card.model.title}><i class="fa-solid fa-microchip"></i> {card.model.where}{#if card.model.actual} · <b>{card.model.actual}</b>{/if}</div>{/if}
    {/if}
    {#each card.notices as notice, index (`${notice.className}:${index}`)}
        <div class={notice.className} title={notice.title}><i class={`fa-solid ${notice.icon}`}></i> {notice.text}</div>
    {/each}
    {#each card.ports as port (port.id)}
        <div class={port.className} data-node={card.id} data-dir={port.dir} data-port={port.port} data-side={port.side} style:left={port.left === undefined ? undefined : `${port.left}%`} title={port.title}>{#if port.label}<span class="pc-port-keyname">{port.label}</span>{/if}{#if port.icon}<i class={`fa-solid ${port.icon}`}></i>{/if}</div>
    {/each}
    {/if}
</div>
