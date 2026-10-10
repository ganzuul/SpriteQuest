<script lang="ts">
    import { onMount, tick } from 'svelte';
    import type { SubgraphSaveView, SubgraphSaveActions } from './types';
    let { view, actions }: { view: SubgraphSaveView; actions?: SubgraphSaveActions } = $props();
    let dialog: HTMLDivElement;
    let name = $state(''), targetId = $state(''), pending = $state(false), failure = $state('');
    let captureKey = '', generation = 0;
    $effect(() => {
        if (view.key === captureKey) return;
        captureKey = view.key; generation++; name = view.name; targetId = view.targetId ?? ''; pending = false; failure = '';
        const captured = captureKey;
        void tick().then(() => { if (view.key === captured) { const input = dialog?.querySelector<HTMLInputElement>('input'); input?.focus({ preventScroll: true }); input?.select(); } });
    });
    onMount(() => { const anchor = document.activeElement as HTMLElement; return () => anchor?.focus({ preventScroll: true }); });
    async function save(event: SubmitEvent) {
        event.preventDefault();
        if (!actions || !name.trim() || pending || (targetId && !view.entries.some(entry => entry.id === targetId))) return;
        const captured = view.key, request = ++generation; pending = true; failure = '';
        try { await actions.save(captured, name, targetId || null); }
        catch { if (view.key === captured && request === generation) failure = 'The subgraph could not be saved. Please try again.'; }
        finally { if (view.key === captured && request === generation) pending = false; }
    }
    function keys(event: KeyboardEvent) {
        event.stopPropagation();
        if (event.key === 'Escape') { event.preventDefault(); actions?.close(); }
        if (event.key === 'Tab') {
            const controls = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled)')], first = controls[0], last = controls.at(-1);
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
    }
</script>
<div class="pc-workspace-overlay">
    <div class="pc-workspace-dialog pc-subgraph-save" role="dialog" aria-modal="true" aria-label="Save subgraph" tabindex="-1" bind:this={dialog} onkeydowncapture={keys} onpaste={event => event.stopPropagation()}>
        <header><h2>Save subgraph</h2><button type="button" aria-label="Close save subgraph" onclick={() => actions?.close()}>×</button></header>
        <form onsubmit={save}>
            <label>Name<input aria-label="Subgraph name" maxlength="80" bind:value={name} /></label>
            <label>Save as<select aria-label="Save as" bind:value={targetId}><option value="">Save new subgraph</option>{#each view.entries as entry (entry.id)}<option value={entry.id}>Update {entry.name}</option>{/each}</select></label>
            <p>Edits stay local until you save. Existing placed copies stay unchanged.</p>
            {#if view.error || failure}<p class="pc-save-error" role="alert">{view.error || failure}</p>{/if}
            <footer><button type="button" onclick={() => actions?.close()}>Cancel</button><button type="submit" data-save-subgraph disabled={!actions || !name.trim() || pending}>{pending ? 'Saving…' : 'Save'}</button></footer>
        </form>
    </div>
</div>
<style>
    .pc-subgraph-save { width: min(360px, calc(100% - 28px)); box-sizing: border-box; padding: 16px; color: #d7dcdf; font-size: 12px; }
    header { display: flex; align-items: center; gap: 10px; } h2 { flex: 1; margin: 0; font-size: 16px; }
    label { display: block; margin: 16px 0; } input, select { display: block; width: 100%; box-sizing: border-box; min-height: 30px; margin-top: 5px; padding: 5px 7px; border: 1px solid #ffffff20; border-radius: 2px; background: #141516; color: inherit; font: inherit; }
    p { color: #9ea9aa; line-height: 1.5; } button { padding: 5px 10px; background: #2a2c2e; color: inherit; border: 1px solid #ffffff20; border-radius: 2px; font: inherit; cursor: pointer; }
    footer { display: flex; justify-content: flex-end; gap: 7px; margin-top: 16px; } :disabled { opacity: .5; cursor: default; } .pc-save-error { color: #e58d94; }
    :is(button, input, select):focus-visible { outline: 2px solid var(--SmartThemeQuoteColor, #e18a24); outline-offset: 1px; }
</style>
