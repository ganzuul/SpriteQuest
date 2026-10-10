<script lang="ts">
    import WorkspaceMenus from './WorkspaceMenus.svelte';
    import type { WorkspaceMenuPanels } from './workspace-menu-model';
    import type { WorkbenchView, WorkbenchActions } from './types';
    let { state, actions, local, panels }: { state: WorkbenchView; actions: WorkbenchActions; local: (command: string) => void; panels?: WorkspaceMenuPanels } = $props();
    const workflow = $derived(state.rootWorkflow ?? state.workflow);
    let header: HTMLElement, graphSelect: HTMLSelectElement, arm: HTMLInputElement, inspBtn: HTMLButtonElement;
    export function getParts() { return { header, graphSelect, arm, inspBtn }; }
    export function focusGraphSelect() { graphSelect.focus(); }
</script>
<header class="pc-header" data-pc-ui="svelte" bind:this={header}>
    <div class="pc-menubar">
        <div class="pc-brand"><img src={actions.logoUrl} width="30" height="30" alt="" /><span>LATTICE</span></div>
        <WorkspaceMenus {state} {actions} {local} {panels} />
        <button type="button" class="pc-btn menu_button pc-close" title="Close" aria-label="Close canvas" onclick={() => actions.command('close')}>×</button>
    </div>
    <div class="pc-workflow-bar">
        <select class="pc-select pc-graph-select text_pole" aria-label="Workflow" value={state.graphId} bind:this={graphSelect} onchange={(event) => actions.pickGraph(event.currentTarget.value)}>{#each state.graphs as graph (graph.id)}<option value={graph.id}>{graph.name}</option>{/each}</select>
        <div class="pc-header-actions pc-history">
            <button type="button" class={`pc-btn menu_button pc-undo${state.history.undo ? '' : ' pc-disabled'}`} disabled={!state.history.undo} title={state.history.undoTitle} aria-label="Undo" onclick={() => actions.command('undo')}>↶</button>
            <button type="button" class={`pc-btn menu_button pc-redo${state.history.redo ? '' : ' pc-disabled'}`} disabled={!state.history.redo} title={state.history.redoTitle} aria-label="Redo" onclick={() => actions.command('redo')}>↷</button>
            <span class={`pc-history-note${state.history.showNote ? ' pc-show' : ''}`}>{state.history.note}</span>
        </div>
        {#if workflow?.ownedBusy || workflow?.busy}
            <button type="button" class="pc-btn menu_button pc-root-run" onclick={() => actions.command('stop-workflow')}>■ Stop</button>
        {:else if workflow?.phase === 'unified'}
            <span class="pc-send-guidance" title="Assign and arm the workflow, then Send in SillyTavern.">Generate with Send</span>
        {:else}
            <button type="button" class="pc-btn menu_button pc-root-run" disabled={!workflow || !!workflow.issues.length} title={workflow?.issues.join('\n') || 'Run the root workflow'} onclick={() => actions.command('run-workflow')}>▶ Run</button>
        {/if}
        <span class="pc-root-workflow-status" role="status">{workflow ? `${workflow.phase} · ${workflow.assigned ? 'Assigned' : 'Unassigned'} · ≤ ${workflow.callBound} requests` : 'Workflow unavailable'} · Autosave in SillyTavern</span>
        <div class="pc-header-actions pc-surface-actions">
            <button type="button" class={`pc-btn menu_button pc-pane-toggle${state.inspectorOpen ? ' pc-on' : ''}`} title="Show or hide the inspector" aria-label="Toggle inspector" aria-pressed={state.inspectorOpen} bind:this={inspBtn} onclick={() => actions.command('inspector')}>Details</button>
        </div>
        <label class="pc-arm"><input class="pc-arm-input" type="checkbox" checked={state.armed} bind:this={arm} onchange={(event) => actions.arm(event.currentTarget.checked)} /><span>Arm</span></label>
    </div>
</header>
