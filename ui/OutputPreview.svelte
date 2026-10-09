<script lang="ts">
    import type { DetailTarget, DetailReviewSelector, OutputPreviewActions, OutputPreviewView } from './detail-types';
    let { view, actions = {} }: { view: OutputPreviewView | null; actions?: OutputPreviewActions } = $props();
    let selected = $derived(view?.choices.find(choice => choice.key === view?.selectedKey) ?? null);
    const statusLabel = (status: string) => ({ 'not-run': 'Not run', current: 'Current', stale: 'Stale', removed: 'Source removed' }[status] ?? status);
    const addressKey = (target: DetailTarget) => 'kind' in target ? JSON.stringify(['terminal', target.address.workflowId, target.address.instancePath, target.address.nodeId]) : JSON.stringify(['output', target.workflowId, target.instancePath, target.nodeId, target.portId]);
    const copyTarget = (target: DetailTarget): DetailTarget => 'kind' in target ? { kind: 'terminal', address: { ...target.address, instancePath: [...target.address.instancePath] } } : { ...target, instancePath: [...target.instancePath] };
    let canRun = $derived(!!(view && selected && view.status !== 'removed' && !view.busy && view.runHere?.enabled && actions.runHere));
    let selectedReview = $derived(!!(view && selected && view.review?.mode === 'root' && view.review.selectedRootTerminal && 'kind' in selected.target && selected.target.address.instancePath.length === 0 && addressKey(selected.target) === addressKey(view.review.selector.terminal)));
    let canApply = $derived(!!(view && view.status === 'current' && !view.busy && selectedReview && view.review?.fresh && view.review.canApply && actions.apply));
    let canReject = $derived(!!(view && !view.busy && selectedReview && actions.reject));
    function choose(key: string) {
        const choice = view?.choices.find(item => item.key === key);
        if (view && choice) actions.select?.(view.sourceKey, choice.key, copyTarget(choice.target));
    }
    function copySelector(value: DetailReviewSelector): DetailReviewSelector {
        return { handleId: value.handleId, runId: value.runId, terminal: { kind: 'terminal', address: { ...value.terminal.address, instancePath: [...value.terminal.address.instancePath] } } };
    }
</script>

<section class="pc-output-preview" aria-label="Output preview">
{#if view}
    <header><div><h3>{view.title}</h3><span class="pc-preview-status" data-status={view.status}>{statusLabel(view.status)}</span>{#if selected}<small>{selected.kind} · {'kind' in selected.target ? 'Host result' : selected.target.portId}</small>{/if}</div>
        <div class="pc-preview-tools"><button type="button" aria-pressed={view.followSelection} disabled={!actions.follow} onclick={() => actions.follow?.()}>Follow selection</button><button type="button" aria-pressed={view.pinned} disabled={view.pinned ? !actions.follow : !selected || !actions.pin} onclick={() => { if (view?.pinned) actions.follow?.(); else if (view && selected) actions.pin?.(view.sourceKey, copyTarget(selected.target)); }}>{view.pinned ? 'Unpin preview' : 'Pin preview'}</button></div>
    </header>
    {#if view.statusDetail}<p class="pc-preview-note">{view.statusDetail}</p>{/if}
    {#if view.choices.length}
        <label class="pc-preview-choice">Preview output<select aria-label="Preview output" value={view.selectedKey ?? ''} disabled={!actions.select} onchange={event => choose(event.currentTarget.value)}><option value="" disabled>Choose an output</option>{#each view.choices as choice (choice.key)}<option value={choice.key}>{choice.label} · {choice.kind}</option>{/each}</select></label>
    {/if}
    {#if view.runHere}<div class="pc-preview-run"><button type="button" data-run-here disabled={!canRun} onclick={() => { if (view && selected && canRun) actions.runHere?.(view.sourceKey, copyTarget(selected.target)); }}>Run to here · maximum {view.runHere.callBound} {view.runHere.callBound === 1 ? 'request' : 'requests'}</button>{#if view.runHere.issue}<small>{view.runHere.issue}</small>{/if}<small>Runs the selected output's dependencies. Results are diagnostic previews.</small></div>{/if}
    {#if !view.sections.length}<p class="pc-preview-empty">{view.status === 'not-run' ? 'Run this workflow or use Run to here to inspect an output.' : 'No recorded artifact is available for this output.'}</p>{/if}
    <div class="pc-preview-sections">
    {#each view.sections as section (section.id)}
        <article data-artifact-kind={section.kind}><div class="pc-preview-section-heading"><h4>{section.label}</h4><small>{section.kind}</small></div>
            {#if section.format === 'omitted'}<p class="pc-preview-note">{section.text}</p>
            {:else}<pre>{section.text}</pre>{/if}
            {#if section.truncated}<small class="pc-preview-note">Truncated diagnostic{section.format === 'json-prefix-text' ? ' · JSON prefix shown as text' : ''}</small>{/if}
        </article>
    {/each}
    </div>
    {#each view.issues as issue}<p class="pc-preview-error">{issue}</p>{/each}
    {#if view.review}
        <footer><button type="button" data-preview-apply disabled={!canApply} onclick={() => { if (view?.review && canApply) actions.apply?.(copySelector(view.review.selector)); }}>Apply reviewed candidate</button><button type="button" disabled={!canReject} onclick={() => { if (view?.review && canReject) actions.reject?.(copySelector(view.review.selector)); }}>Reject candidate</button>
            {#if view.review.issue}<p class="pc-preview-error">{view.review.issue}</p>{/if}<small>Apply rechecks the source and connection. Recorded preview text may be truncated.</small>
        </footer>
    {/if}
{:else}
    <p class="pc-preview-empty">Select a node output to inspect its recorded result.</p>
{/if}
</section>

<style>
    .pc-output-preview { min-width: 0; color: #d8dfe2; font: inherit; font-size: 12px; padding: 12px; }
    header { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; border-bottom: 1px solid #ffffff0d; padding-bottom: 10px; } header > div { min-width: 0; }
    h3 { margin: 0 0 5px; font-size: 14px; overflow-wrap: anywhere; } h4 { margin: 0; font-size: 12px; font-weight: 500; }
    small { display: block; color: #9aa5ac; font-size: 10px; line-height: 1.5; overflow-wrap: anywhere; }
    button { min-height: 27px; padding: 4px 8px; border: 1px solid #ffffff10; border-radius: 2px; background: #2a2c2e; color: #d6dfe3; font: inherit; font-size: 11px; cursor: pointer; box-shadow: inset 0 1px #ffffff05; }
    button:hover:not(:disabled) { background: #35383b; } button[aria-pressed='true'] { color: var(--SmartThemeQuoteColor, #e18a24); } :is(button, select):focus-visible { outline: 2px solid var(--SmartThemeQuoteColor, #e18a24); outline-offset: 1px; } :disabled { opacity: .55; cursor: default; }
    .pc-preview-tools { display: flex; flex-wrap: wrap; gap: 5px; justify-content: flex-end; } .pc-preview-status { font-size: 10px; color: #a9b8ac; } .pc-preview-status[data-status='stale'] { color: #c6ad75; } .pc-preview-status[data-status='removed'] { color: #d48c92; } .pc-preview-status[data-status='not-run'] { color: #9ea8ae; }
    .pc-preview-choice { display: flex; align-items: center; gap: 8px; margin: 10px 0; color: #aeb8be; font-size: 11px; }
    select { min-width: 0; max-width: 100%; flex: 1; min-height: 28px; padding: 4px 6px; border: 1px solid #ffffff12; border-radius: 2px; background: #17191a; color: #dce2e5; font: inherit; }
    .pc-preview-run { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 9px 0; } .pc-preview-run > small:last-child { flex-basis: 100%; }
    .pc-preview-sections { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr)); gap: 9px; } article { min-width: 0; padding: 9px; border: 1px solid #ffffff0b; border-radius: 4px; background: #191b1c66; box-shadow: inset 0 1px #0005; }
    .pc-preview-section-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; } pre { margin: 8px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 11px; line-height: 1.55; max-height: 360px; overflow: auto; }
    .pc-preview-note, .pc-preview-empty { color: #9aa6ae; font-size: 11px; line-height: 1.5; } .pc-preview-error { color: #e58d94; font-size: 11px; overflow-wrap: anywhere; }
    footer { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; padding-top: 10px; border-top: 1px solid #ffffff0d; } footer > :is(small, p) { flex-basis: 100%; }
    @media (max-width: 480px) { header { flex-wrap: wrap; } .pc-preview-tools { justify-content: flex-start; } .pc-preview-choice { align-items: flex-start; flex-direction: column; } select { width: 100%; } }
</style>
