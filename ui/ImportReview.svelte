<script lang="ts">
    import DiagnosticMessage from './DiagnosticMessage.svelte';
    import { onMount } from 'svelte';
    import type { ImportReviewView, WorkbenchActions } from './types';
    let { view, actions }: { view: ImportReviewView; actions: WorkbenchActions } = $props();
    const uid = $props.id();
    let dialog: HTMLDivElement;
    onMount(() => {
        const anchor = document.activeElement as HTMLElement;
        dialog.querySelector<HTMLButtonElement>('button')?.focus();
        return () => anchor?.focus({ preventScroll: true });
    });
    function keys(event: KeyboardEvent) {
        event.stopPropagation();
        if (event.key === 'Escape') { event.preventDefault(); actions.cancelImport?.(); }
        if (event.key === 'Tab') {
            const buttons = [...dialog.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
            const first = buttons[0], last = buttons.at(-1);
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
    }
</script>
<div class="pc-workspace-overlay pc-import-overlay">
    <div class="pc-workspace-dialog pc-import-review" role="dialog" aria-modal="true" aria-label="Import into graph" tabindex="-1" bind:this={dialog} onkeydown={keys} onpaste={(event) => event.stopPropagation()}>
        <header><h2>Import into graph</h2><button type="button" class="pc-btn menu_button" aria-label="Cancel import" onclick={() => actions.cancelImport?.()}>×</button></header>
        <p><strong>{view.name}</strong> <small>{view.fileName}</small></p>
        <dl><dt>Phase</dt><dd>{view.phase}</dd><dt>Additions</dt><dd>{view.nodeCount} blocks · {view.wireCount} wires · {view.groupCount} groups</dd><dt>Conservative request bound</dt><dd>{view.callBound} total · {view.importedCallBound} imported</dd></dl>
        <p class="pc-import-explanation">This authoring bound includes unfinished branches. Bindings and reachable execution are checked when you explicitly run the workflow.</p>
        {#if view.requiredRoles.length}<p>Imported model roles: {view.requiredRoles.join(', ')}.</p>{/if}
        {#if view.unresolvedBindings.length}
            <h3>Saved bindings to review</h3><ul>{#each view.unresolvedBindings as binding}<li>{binding.title} · {binding.role}: missing {binding.missing.join(' and ')}</li>{/each}</ul>
        {:else if view.bindingReviewRequired}<p>Saved model metadata is present. Review local connections before running.</p>{/if}
        {#if view.terminals.length}<h3>Imported terminal effects</h3><ul>{#each view.terminals as terminal}<li>{terminal.title} · {terminal.operation}</li>{/each}</ul>{:else}<p>No imported terminal effects.</p>{/if}
        <p>Insertion keeps internal wiring and relative layout. Review the inserted nodes before running the workflow.</p>
        {#if view.error}<div id={uid + '-error'}><DiagnosticMessage issue={view.error} /></div>{/if}
        <footer><button type="button" class="pc-btn menu_button" onclick={() => actions.cancelImport?.()}>Cancel</button>{#if view.error}<button type="button" class="pc-btn menu_button" onclick={() => actions.prepareImportAgain?.()}>Prepare again</button>{/if}<button type="button" class="pc-btn menu_button pc-import-accept" aria-describedby={view.error ? uid + '-error' : undefined} disabled={!!view.error} onclick={() => actions.acceptImport?.()}>Insert into graph</button></footer>
    </div>
</div>
