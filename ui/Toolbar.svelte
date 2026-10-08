<script lang="ts">
    import type { WorkbenchView, WorkbenchActions } from './types';
    let { state, actions }: { state: WorkbenchView; actions: WorkbenchActions } = $props();
    let header: HTMLElement, graphSelect: HTMLSelectElement, arm: HTMLInputElement, sideBtn: HTMLButtonElement, inspBtn: HTMLButtonElement;
    export function getParts() { return { header, graphSelect, arm, sideBtn, inspBtn }; }
    const menu = [ ['duplicate', 'Duplicate canvas', 'fa-clone'], ['rename', 'Rename canvas', 'fa-i-cursor'], ['import', 'Import canvas', 'fa-file-import'], ['export', 'Export canvas', 'fa-file-export'], ['seed', 'Seed from SillyTavern’s current prompt order', 'fa-wand-magic-sparkles'], ['delete', 'Delete canvas', 'fa-trash-can'] ];
</script>
<header class="pc-header" data-pc-ui="svelte" bind:this={header}>
    <div class="pc-brand"><i class="fa-solid fa-diagram-project"></i><span>ComfyTavern</span></div>
    <select class="pc-select pc-graph-select text_pole" aria-label="Canvas" value={state.graphId} bind:this={graphSelect} onchange={(event) => actions.pickGraph(event.currentTarget.value)}>
        {#each state.graphs as graph (graph.id)}<option value={graph.id}>{graph.name}</option>{/each}
    </select>
    <div class="pc-header-actions pc-history">
        <button type="button" class={`pc-btn menu_button pc-undo${state.history.undo ? '' : ' pc-disabled'}`} disabled={!state.history.undo} title={state.history.undoTitle} aria-label="Undo" onclick={() => actions.command('undo')}>↶</button>
        <button type="button" class={`pc-btn menu_button pc-redo${state.history.redo ? '' : ' pc-disabled'}`} disabled={!state.history.redo} title={state.history.redoTitle} aria-label="Redo" onclick={() => actions.command('redo')}>↷</button>
        <span class={`pc-history-note${state.history.showNote ? ' pc-show' : ''}`}>{state.history.note}</span>
    </div>
    <div class="pc-header-actions pc-document-actions">
        <button type="button" class="pc-btn menu_button" title="New canvas" onclick={() => actions.command('new')}>+ New</button>
        <details class="pc-toolbar-menu">
            <summary class="pc-btn menu_button" aria-label="Canvas actions">Canvas <span aria-hidden="true">⌄</span></summary>
            <div class="pc-toolbar-menu-panel">
                {#each menu as [name, label, icon] (name)}
                    <button type="button" class={`pc-btn menu_button${name === 'delete' ? ' pc-danger' : ''}`} disabled={name === 'seed' && state.nativeGraph} title={name === 'seed' && state.nativeGraph ? 'Prompt-order seeding is available only for legacy canvases.' : label} onclick={(event) => { actions.command(name); event.currentTarget.closest('details')?.removeAttribute('open'); }}><i class={`fa-solid ${icon}`}></i> {label}</button>
                {/each}
            </div>
        </details>
        <button type="button" class="pc-btn menu_button" title="Fit to view" onclick={() => actions.command('fit')}>Fit</button>
        <button type="button" class="pc-btn menu_button pc-theme-btn" title="Theme and colours" onclick={() => actions.command('theme')}><i class="fa-solid fa-palette"></i><span>Theme</span></button>
    </div>
    <div class="pc-header-actions pc-surface-actions">
        <button type="button" class={`pc-btn menu_button pc-pane-toggle${state.sideOpen ? ' pc-on' : ''}`} title="Show or hide the library" aria-label="Toggle library" aria-pressed={state.sideOpen} bind:this={sideBtn} onclick={() => actions.command('sidebar')}><i class="fa-solid fa-list-ul"></i><span>Library</span></button>
        <button type="button" class={`pc-btn menu_button pc-pane-toggle${state.inspectorOpen ? ' pc-on' : ''}`} title="Show or hide the inspector" aria-label="Toggle inspector" aria-pressed={state.inspectorOpen} bind:this={inspBtn} onclick={() => actions.command('inspector')}><i class="fa-solid fa-sliders"></i><span>Inspector</span></button>
    </div>
    <label class="pc-arm"><input class="pc-arm-input" type="checkbox" checked={state.armed} bind:this={arm} onchange={(event) => actions.arm(event.currentTarget.checked)} /><span>Arm</span></label>
    <button type="button" class="pc-btn menu_button pc-close" title="Close" aria-label="Close canvas" onclick={() => actions.command('close')}>×</button>
</header>
