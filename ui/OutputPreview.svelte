<script lang="ts">
    import type { DetailTarget, DetailReviewSelector, OutputPreviewActions, OutputPreviewView } from './detail-types';
    let { view, actions = {}, collapse }: { view: OutputPreviewView | null; actions?: OutputPreviewActions; collapse?: () => void } = $props();
    const previewId = $props.id();
    let sectionScope = $derived(JSON.stringify([view?.sourceKey, view?.selectedKey]));
    let sectionChoice = $state<{ scope: string; id: string | null }>({ scope: '', id: null });
    let activeSection = $derived((sectionChoice.scope === sectionScope ? view?.sections.find(section => section.id === sectionChoice.id) : null) ?? view?.sections[0] ?? null);
    $effect(() => {
        const id = sectionChoice.scope === sectionScope && view?.sections.some(section => section.id === sectionChoice.id) ? sectionChoice.id : view?.sections[0]?.id ?? null;
        if (sectionChoice.scope !== sectionScope || sectionChoice.id !== id) sectionChoice = { scope: sectionScope, id };
    });
    const tabId = (id: string) => previewId + '-tab-' + encodeURIComponent(id);
    function tabKey(event: KeyboardEvent, index: number) {
        event.stopPropagation();
        const sections = view?.sections ?? [];
        if (!sections.length || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? sections.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + sections.length) % sections.length;
        sectionChoice = { scope: sectionScope, id: sections[next].id };
        const button = event.currentTarget as HTMLButtonElement;
        button.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
    }
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
        const terminal = { kind: 'terminal' as const, address: { ...value.terminal.address, instancePath: [...value.terminal.address.instancePath] } };
        return { handleId: value.handleId, runId: value.runId, terminal };
    }
</script>

<section class="pc-output-preview" aria-label="Output preview">
{#if view}
    <header>
        <h3>{selected?.label ?? view.title}</h3>
        {#if view.choices.length}
            <label class="pc-preview-choice"><span class="pc-preview-sr-only">Preview output</span><select aria-label="Preview output" value={view.selectedKey ?? ''} disabled={!actions.select} onchange={event => choose(event.currentTarget.value)}><option value="" disabled>Choose an output</option>{#each view.choices as choice (choice.key)}<option value={choice.key}>{choice.label} · {choice.kind}</option>{/each}</select></label>
        {/if}
        <div class="pc-preview-tools"><button type="button" aria-pressed={view.followSelection} disabled={!actions.follow} onclick={() => actions.follow?.()}>Follow selection</button><button type="button" aria-pressed={view.pinned} disabled={view.pinned ? !actions.follow : !selected || !actions.pin} onclick={() => { if (view?.pinned) actions.follow?.(); else if (view && selected) actions.pin?.(view.sourceKey, copyTarget(selected.target)); }}>{view.pinned ? 'Unpin preview' : 'Pin preview'}</button>{#if collapse}<button type="button" onclick={collapse}>Collapse preview</button>{/if}</div>
    </header>
    {#if view.sections.length}
        <div class="pc-preview-tabs" role="tablist" aria-label="Recorded artifacts">
            {#each view.sections as section, index (section.id)}
                <button type="button" role="tab" id={tabId(section.id)} aria-selected={activeSection?.id === section.id} aria-controls={previewId + '-panel'} tabindex={activeSection?.id === section.id ? 0 : -1} onclick={() => { sectionChoice = { scope: sectionScope, id: section.id }; }} onkeydowncapture={event => tabKey(event, index)}>{section.label}</button>
            {/each}
        </div>
    {/if}
    <div class="pc-preview-sections">
        {#if activeSection}
            {@const section = activeSection}
            <div role="tabpanel" tabindex="0" onkeydowncapture={event => event.stopPropagation()} onpastecapture={event => event.stopPropagation()} id={previewId + '-panel'} aria-labelledby={tabId(section.id)}>
                <article data-artifact-kind={section.kind}>
                    <div class="pc-preview-section-heading"><span>{section.label}</span><small>{section.kind}</small></div>
                    {#if section.format === 'omitted'}<p class="pc-preview-note">{section.text}</p>
                    {:else}<pre>{section.text}</pre>{/if}
                    {#if section.truncated}<small class="pc-preview-note">Truncated diagnostic{section.format === 'json-prefix-text' ? ' · JSON prefix shown as text' : ''}</small>{/if}
                </article>
            </div>
        {:else}
            <p class="pc-preview-empty">{view.status === 'not-run' ? 'Run this workflow or use Run to here to inspect an output.' : 'No recorded artifact is available for this output.'}</p>
        {/if}
        {#if view.statusDetail}<p class="pc-preview-note">{view.statusDetail}</p>{/if}
        {#each view.sections.filter(section => section.id !== activeSection?.id && (section.format === 'omitted' || section.truncated)) as section (section.id)}
            <p class="pc-preview-note">{section.label}: {section.format === 'omitted' ? section.text : 'Truncated diagnostic' + (section.format === 'json-prefix-text' ? ' · JSON prefix shown as text' : '')}</p>
        {/each}
        {#if view.runHere?.issue}<p class="pc-preview-note">{view.runHere.issue}</p>{/if}
        {#each view.issues as issue}<p class="pc-preview-error">{issue}</p>{/each}
        {#if view.review?.issue}<p class="pc-preview-error">{view.review.issue}</p>{/if}
        {#if view.review}<small class="pc-preview-note">Apply rechecks the source and connection. Recorded preview text may be truncated.</small>{/if}
    </div>
    <footer>
        <span class="pc-preview-status" data-status={view.status}>{statusLabel(view.status)}</span>
        <span>{view.pinned ? 'Pinned preview' : view.followSelection ? 'Following selection' : 'Selection not followed'}</span>
        {#if view.runHere}<button type="button" data-run-here title="Runs the selected output's dependencies. Results are diagnostic previews." disabled={!canRun} onclick={() => { if (view && selected && canRun) actions.runHere?.(view.sourceKey, copyTarget(selected.target)); }}>Run to here · maximum {view.runHere.callBound} {view.runHere.callBound === 1 ? 'request' : 'requests'}</button>{/if}
        {#if view.review}<button type="button" data-preview-apply disabled={!canApply} onclick={() => { if (view?.review && canApply) actions.apply?.(copySelector(view.review.selector)); }}>Apply reviewed candidate</button><button type="button" disabled={!canReject} onclick={() => { if (view?.review && canReject) actions.reject?.(copySelector(view.review.selector)); }}>Reject candidate</button>{/if}
    </footer>
{:else}
    <p class="pc-preview-empty">Select a node output to inspect its recorded result.</p>
{/if}
</section>

<style>
    .pc-output-preview { box-sizing: border-box; height: 100%; min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden; color: var(--pc-text, #deded9); font: inherit; font-size: 12px; line-height: 1.4; }
    header { flex: 0 0 auto; display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 7px 10px; border-bottom: 1px solid var(--pc-border, #3a3c35); }
    h3 { flex: 1 1 140px; min-width: 0; margin: 0; font-size: 14px; font-weight: 400; overflow-wrap: anywhere; }
    small { color: var(--pc-muted, #a1a59b); font-size: 12px; line-height: 1.5; overflow-wrap: anywhere; }
    button { min-height: 25px; max-width: 100%; padding: 4px 7px; border: 0; border-radius: 2px; background: transparent; color: inherit; font: inherit; font-size: 12px; line-height: 1.4; cursor: pointer; box-shadow: none; overflow-wrap: anywhere; }
    button:hover:not(:disabled) { background: var(--pc-raised, #353632); }
    button[aria-pressed='true'], button[aria-selected='true'] { background: #ffffff06; }
    :is(button, select, [role='tabpanel']):focus-visible { outline: 2px solid var(--pc-accent, #e18a24); outline-offset: -2px; }
    :disabled { opacity: .55; cursor: default; }
    .pc-preview-tools { display: flex; flex-wrap: wrap; gap: 2px; min-width: 0; }
    .pc-preview-choice { flex: 0 1 210px; min-width: 0; margin: 0; }
    .pc-preview-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    select { box-sizing: border-box; width: 100%; min-width: 0; max-width: 100%; min-height: 27px; padding: 3px 6px; border: 1px solid var(--pc-border, #3a3c35); border-radius: 2px; background: var(--pc-node, #1d1e1d); color: inherit; font: inherit; }
    .pc-preview-tabs { flex: 0 0 auto; display: flex; flex-wrap: wrap; gap: 2px; padding: 0 7px; border-bottom: 1px solid var(--pc-border, #3a3c35); }
    .pc-preview-tabs button { position: relative; border-radius: 0; }
    .pc-preview-tabs button[aria-selected='true']::after { content: ''; position: absolute; left: 7px; right: 7px; bottom: 0; height: 2px; background: var(--pc-accent, #e18a24); }
    .pc-preview-sections { flex: 1 1 0; min-width: 0; min-height: 0; overflow-y: auto; overflow-x: hidden; padding: 10px 14px; scrollbar-width: thin; }
    article { min-width: 0; padding: 0; border: 0; border-radius: 0; background: transparent; box-shadow: none; }
    .pc-preview-section-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 7px; color: var(--pc-muted, #a1a59b); }
    pre { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; font-family: inherit; font-size: 12px; line-height: 1.55; }
    .pc-preview-note, .pc-preview-empty { margin: 0; color: var(--pc-muted, #a1a59b); font-size: 12px; line-height: 1.5; overflow-wrap: anywhere; }
    .pc-preview-note { display: block; margin-top: 7px; }
    .pc-preview-error { margin: 7px 0 0; color: #e08f8f; font-size: 12px; line-height: 1.5; overflow-wrap: anywhere; }
    footer { flex: 0 0 auto; display: flex; flex-wrap: wrap; align-items: center; gap: 2px 10px; padding: 4px 10px; color: var(--pc-muted, #a1a59b); background: var(--pc-raised, #353632); }
    footer button { color: var(--pc-text, #deded9); }
    .pc-preview-status[data-status='stale'] { color: #c6ad75; } .pc-preview-status[data-status='removed'] { color: #e08f8f; }
    @media (max-width: 480px) {
        header { gap: 3px; padding: 5px 8px; }
        h3 { flex-basis: 100%; font-size: 13px; }
        .pc-preview-choice { flex: 1 1 100%; }
        .pc-preview-tools { flex-wrap: nowrap; width: 100%; }
        .pc-preview-tools button { flex: 1 1 auto; min-width: 0; padding: 3px 4px; font-size: 11px; }
        .pc-preview-tabs { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: thin; }
        .pc-preview-tabs button { flex: 0 0 auto; }
        .pc-preview-sections { min-height: 55px; padding: 8px 12px; }
        header, footer { flex-shrink: 1; min-height: 0; overflow-y: auto; }
        footer { padding: 3px 8px; gap: 0 7px; }
        footer button { padding: 3px 4px; font-size: 11px; }
    }
</style>
