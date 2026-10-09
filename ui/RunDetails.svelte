<script lang="ts">
    import type { RunDetailsActions, RunDetailsView } from './detail-types';
    let { view, actions = {} }: { view: RunDetailsView | null; actions?: RunDetailsActions } = $props();
    const statusLabel = (status: string) => status === 'not-run' ? 'Not run' : status === 'empty' ? 'Ready' : status.charAt(0).toUpperCase() + status.slice(1);
    const duration = (value: number | null) => value !== null && Number.isFinite(value) && value >= 0 ? (value / 1000).toFixed(2) + 's' : 'Unknown';
    const count = (value: number | null | undefined) => value !== undefined && value !== null && Number.isFinite(value) && value >= 0 ? String(value) : 'Unknown';
</script>

<section class="pc-run-details" aria-label="Run details">
{#if view}
    <header><h3>Run details</h3><span class="pc-run-status" data-status={view.status}>{statusLabel(view.status)}</span></header>
    <div class="pc-run-summary"><p>{view.completedCount} of {view.executableCount} stages complete</p><p>{view.actualCalls} of {view.callBound} requests</p><p>Elapsed: {duration(view.elapsedMs)}</p></div>
    {#if view.issue}<p class="pc-run-error">{view.issue}</p>{/if}
    {#if !view.rows.length}<p class="pc-run-empty">No execution plan has been recorded.</p>{/if}
    <ol class="pc-run-rows">
    {#each view.rows as row (row.key)}
        <li data-run-row={row.key} data-depth={row.depth} data-status={row.status} style:margin-left={`${Math.max(0, Math.min(8, row.depth)) * 12}px`}>
            <div class="pc-run-row-heading"><button type="button" aria-label={'Open ' + row.title + ' in graph'} disabled={!actions.jump} onclick={() => { if (view) actions.jump?.(view.runId, { ...row.address, instancePath: [...row.address.instancePath] }); }}>{#if row.kind === 'instance'}<span aria-hidden="true">▱</span>{/if}{row.title}</button><span class="pc-run-status" data-status={row.status}>{statusLabel(row.status)}</span></div>
            {#if row.subphase}<small>{statusLabel(row.subphase)}</small>{/if}
            <div class="pc-run-row-meta"><small>Duration: {duration(row.durationMs)}</small><small>{row.attempts} of {row.callBound} requests</small></div>
            {#if row.issue}<p class="pc-run-error">{row.issue}</p>{/if}
            {#if row.kind === 'primitive'}<details><summary>Reported usage</summary><div class="pc-run-usage"><small>Input tokens: {count(row.usage?.inputTokens)}</small><small>Output tokens: {count(row.usage?.outputTokens)}</small><small>Total tokens: {count(row.usage?.totalTokens)}</small><small>Cost: {row.usage?.cost ?? 'Unknown'}</small></div></details>{/if}
        </li>
    {/each}
    </ol>
{:else}
    <p class="pc-run-empty">Run a workflow to inspect its processing stages.</p>
{/if}
</section>

<style>
    .pc-run-details { min-width: 0; padding: 12px; color: var(--pc-text); font: inherit; font-size: 12px; }
    header { display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--pc-border); padding-bottom: 9px; } h3 { margin: 0; font-size: 14px; }
    .pc-run-status { font-size: 10px; color: var(--pc-muted); white-space: nowrap; } .pc-run-status[data-status='running'], .pc-run-status[data-status='cancelling'] { color: var(--SmartThemeQuoteColor, #e18a24); } .pc-run-status[data-status='failed'], .pc-run-status[data-status='invalid'] { color: #e58d94; } .pc-run-status[data-status='completed'] { color: #a4c2ad; } .pc-run-status[data-status='stale'] { color: #c4ad7b; } .pc-run-status[data-status='blocked'] { color: #c497a0; }
    .pc-run-summary { display: flex; flex-wrap: wrap; gap: 5px 16px; margin: 10px 0; color: var(--pc-muted); font-size: 11px; } .pc-run-summary p { margin: 0; }
    .pc-run-rows { margin: 12px 0 0; padding: 0; list-style: none; } li { min-width: 0; padding: 8px 9px; margin-bottom: 6px; border: 1px solid var(--pc-border); border-radius: 4px; background: var(--pc-control); box-shadow: inset 0 1px #0004; }
    li[data-status='running'], li[data-status='cancelling'] { border-color: var(--SmartThemeQuoteColor, #e18a24); } li[data-status='failed'] { border-color: #a44d59; background: #1a1b1c; } li[data-status='blocked'], li[data-status='not-run'] { background: #181a1b55; }
    .pc-run-row-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; } button { min-width: 0; border: 0; background: none; padding: 2px 0; color: var(--pc-text); font: inherit; font-size: 12px; text-align: left; cursor: pointer; overflow-wrap: anywhere; } button span { margin-right: 5px; color: var(--pc-muted); } button:hover:not(:disabled) { color: var(--SmartThemeQuoteColor, #e18a24); } button:focus-visible { outline: 2px solid var(--SmartThemeQuoteColor, #e18a24); outline-offset: 2px; border-radius: 2px; } button:disabled { cursor: default; }
    small { display: block; color: var(--pc-muted); font-size: 10px; line-height: 1.6; overflow-wrap: anywhere; } .pc-run-row-meta { display: flex; flex-wrap: wrap; gap: 5px 14px; margin-top: 4px; }
    .pc-run-error { color: #e58d94; margin: 6px 0; font-size: 11px; overflow-wrap: anywhere; } .pc-run-empty { color: var(--pc-muted); font-size: 11px; } details { margin-top: 4px; } summary { font-size: 10px; color: var(--pc-muted); cursor: pointer; } .pc-run-usage { display: grid; grid-template-columns: repeat(auto-fit, minmax(125px, 1fr)); gap: 2px 8px; padding-top: 4px; }
    :global(:root[data-pc-own="1"]) .pc-run-details summary { color: var(--pc-muted); }
</style>
