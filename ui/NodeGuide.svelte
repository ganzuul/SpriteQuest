<script lang="ts">
    import type { NodeGuideView } from '../src/ui/node-guide';
    import type { NodeGuideExample } from '../src/workflow/node-guide-examples';
    import type { NodeGuideActions } from './node-guide-types';
    import type { NodeGuideScene } from '../src/ui/node-guide-scene';
    import NodeGuidePreview from './NodeGuidePreview.svelte';
    import NodeGuideCanvas from './NodeGuideCanvas.svelte';
    let { guide, actions = {}, contextKey, close }: { guide: NodeGuideView; actions?: NodeGuideActions; contextKey: string; close: () => void } = $props();
    let expanded = $state(false), busy = $state(false), error = $state('');
    let example = $state.raw<NodeGuideExample | null>(null);
    let scene = $state.raw<NodeGuideScene | null>(null);
    let status = $state({enabled: false, reason: ''});
    let copyStatus = $state('');
    $effect(() => {
        contextKey; guide.key;
        if (!expanded) return;
        status = actions.status?.(guide.key) ?? {enabled: false, reason: 'Example insertion is unavailable in this view.'};
    });
    function toggle(event: Event) {
        expanded = (event.currentTarget as HTMLDetailsElement).open;
        if (expanded && !example) {
            const loaded = actions.example?.(guide.key);
            if (loaded?.ok) { example = loaded.data.example; scene = loaded.data.scene; }
            else error = loaded && !loaded.ok ? loaded.error.message : 'This example is unavailable.';
        }
        if (!expanded) { example = null; scene = null; error = ''; copyStatus = ''; }
    }
    async function copyFixture(fixture: { name: string; content: string }) {
        try { await navigator.clipboard.writeText(fixture.content); copyStatus = `Copied ${fixture.name}.`; }
        catch { copyStatus = `Select and copy the data for ${fixture.name} below.`; }
    }
    async function add() {
        if (!actions.add || !status.enabled || busy) return;
        busy = true; error = '';
        try {
            const result = await actions.add(guide.key);
            if (result.ok) close(); else error = result.error.message;
        } catch { error = 'The example could not be added. Try again.'; }
        finally { busy = false; }
    }
</script>

<div class="pc-node-guide" data-guide-key={guide.key}>
    <p class="pc-guide-summary">{guide.summary}</p>
    <NodeGuidePreview card={guide.card} comment={guide.comment} />
    <section><h3>How to use it</h3><ol>{#each guide.howTo as step}<li>{step}</li>{/each}</ol></section>
    <details data-guide-settings open><summary>Settings and options</summary>
        <dl>{#each guide.settings as setting (setting.key)}<div><dt>{setting.label}</dt><dd>{setting.description}</dd></div>{/each}</dl>
        {#if !guide.settings.length}<p>This node has no settings to configure.</p>{/if}
    </details>
    <details data-guide-example ontoggle={toggle}><summary>Example</summary>
        {#if expanded && example && scene}
            <h3>{example.title}</h3><p>{example.description}</p>
            {#if example.requirements.length}<p class="pc-guide-requirements"><strong>Before running:</strong> {example.requirements.join(' ')}</p>{/if}
            {#if example.fixtures?.length}
                <details class="pc-guide-fixtures"><summary>Setup data</summary>
                    <p>Copy each sample into its named workflow file before running the example.</p>
                    {#each example.fixtures as fixture (fixture.name)}
                        <div class="pc-guide-fixture">
                            <div><strong>{fixture.name}</strong><button type="button" class="pc-btn" aria-label={`Copy ${fixture.name}`} onclick={() => copyFixture(fixture)}>Copy</button></div>
                            <textarea aria-label={fixture.name} readonly value={fixture.content} spellcheck={false}></textarea>
                        </div>
                    {/each}
                    {#if copyStatus}<p role="status">{copyStatus}</p>{/if}
                </details>
            {/if}
            <NodeGuideCanvas {scene} focusNodeIds={example.focus?.nodeIds ?? []}>
                {#snippet footer()}
                    <div class="pc-guide-example-action"><button type="button" class="pc-btn" disabled={!status.enabled || busy} title={status.reason || undefined} onclick={add}>{busy ? 'Adding…' : 'Add example to current tab'}</button>
                        {#if status.reason}<p>{status.reason}</p>{/if}
                        {#if error}<p role="alert">{error}</p>{/if}
                    </div>
                {/snippet}
            </NodeGuideCanvas>
            <ol>{#each example.steps as step}<li>{step}</li>{/each}</ol>
            <p><strong>Result:</strong> {example.expected}</p>
        {:else if expanded}<p role="status">{error || 'This example is unavailable.'}</p>{/if}
    </details>
</div>

<style>
    .pc-node-guide { display: grid; gap: 20px; padding: 20px; font-size: 14px; line-height: 1.55; color: var(--pc-text); }
    p, h3, ol, dl { margin: 0; }
    h3 { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
    ol { padding-left: 24px; } li + li { margin-top: 6px; }
    summary { cursor: pointer; font-weight: 600; font-size: 15px; }
    details { border-top: 1px solid var(--pc-border); padding-top: 14px; }
    details > :not(summary) { margin-top: 14px; }
    dl { display: grid; gap: 12px; }
    dl > div { display: grid; grid-template-columns: minmax(110px, 30%) 1fr; gap: 16px; }
    dt { font-weight: 600; } dd { margin: 0; overflow-wrap: anywhere; }
    .pc-guide-requirements { color: var(--pc-muted); font-size: 13px; }
    .pc-guide-fixture { display: grid; gap: 8px; min-width: 0; }
    .pc-guide-fixture > div { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .pc-guide-fixture strong { overflow-wrap: anywhere; }
    textarea { width: 100%; min-width: 0; height: 160px; box-sizing: border-box; padding: 10px; resize: vertical; border: 1px solid var(--pc-border); border-radius: var(--pc-r-sm); background: var(--pc-panel); color: var(--pc-text); font: 12px/1.5 var(--pc-font-mono, monospace); }
    .pc-guide-example-action { display: grid; justify-items: start; gap: 6px; }
    .pc-guide-example-action p { font-size: 12px; color: var(--pc-muted); }
    .pc-btn { padding: 7px 10px; background: var(--pc-panel); border: 1px solid var(--pc-border); border-radius: var(--pc-r-sm); color: var(--pc-text); font: inherit; cursor: pointer; }
    .pc-btn:disabled { opacity: .55; cursor: default; }
    .pc-btn:focus-visible, summary:focus-visible { outline: 2px solid var(--pc-flow); outline-offset: 3px; }
    @media (max-width: 520px) { .pc-node-guide { padding: 14px; } dl > div { grid-template-columns: 1fr; gap: 2px; } }
</style>
