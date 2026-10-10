<script lang="ts">
    import { onDestroy, untrack } from 'svelte';
    import type { DetailBindingMode, DetailControl, DetailEditResponse, DetailSelection, NodeDetailsActions, NodeDetailsView } from './detail-types';
    let { view, actions = {}, idPrefix = 'pc-node-details' }: { view: NodeDetailsView | null; actions?: NodeDetailsActions; idPrefix?: string } = $props();
    type LocalDraft = { text: string; error: string; pending: boolean; editor?: DetailControl['editor']; representation?: 'json-text' | 'json-value'; artifactKind?: string; required?: boolean; boundaryId?: string; boundaryDirection?: 'input' | 'output' };
    let drafts = $state<Record<string, LocalDraft>>({});
    let errors = $state<Record<string, string>>({});
    let identity = '', revision = '', support = '';
    let sequence = 0, boundaryDraftSequence = 0;
    const requests = new Map<string, number>();
    // The mounted workspace inspector owns drafts; qualified nodes never share them.
    const draftCache = new Map<string, typeof drafts>();
    const settledDrafts = (values: typeof drafts) => Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { ...value, pending: false }]));
    function supportedDrafts(values: typeof drafts, node: NodeDetailsView | null) {
        if (!node) return {};
        return Object.fromEntries(Object.entries(settledDrafts(values)).flatMap(([key, value]) => {
            if (key === 'model' || key === 'profileId') {
                const binding = key === 'model' ? node.model?.model : node.model?.profile;
                return binding?.allowedModes.some(option => option.value === 'override') ? [[key, value]] : [];
            }
            if (key === 'boundary') return node.boundary && value.boundaryId === node.boundary.id && value.boundaryDirection === node.boundary.direction ? [[key, { ...value, artifactKind: node.boundary.kinds.includes(value.artifactKind ?? '') ? value.artifactKind : node.boundary.kind }]] : [];
            if (key === 'fileInput') return node.fileInput ? [[key, value]] : [];
            return node.controls.some(control => control.key === key && control.editor === value.editor && control.representation === value.representation && (control.editor === 'json' || control.editor === 'lines')) ? [[key, value]] : [];
        }));
    }
    const selectionIdentity = (node: DetailSelection) => JSON.stringify([node.selectionKey, 'kind' in node.address
        ? [node.address.kind, node.address.definitionRef.id, node.address.definitionRef.version, node.address.definitionRef.semanticHash, node.address.nodeId]
        : [node.address.workflowId, node.address.instancePath, node.address.nodeId]]);
    let alive = true;
    onDestroy(() => { alive = false; requests.clear(); draftCache.clear(); });
    $effect(() => {
        const next = view ? selectionIdentity(view) : '', nextRevision = view?.revision ?? '';
        const nextSupport = JSON.stringify([view?.controls.map(control => [control.key, control.editor, control.representation]), view?.model?.profile.allowedModes, view?.model?.model.allowedModes, view?.boundary && [view.boundary.id, view.boundary.direction, view.boundary.kinds], !!view?.fileInput]);
        const changedSelection = next !== identity;
        if (changedSelection || nextRevision !== revision || nextSupport !== support) {
            if (changedSelection || nextSupport !== support) boundaryDraftSequence++;
            if (changedSelection) {
                if (identity) draftCache.set(identity, untrack(() => settledDrafts(drafts)));
            }
            identity = next; revision = nextRevision; support = nextSupport; requests.clear(); sequence++; errors = {};
            // A revision expires writes, while unsaved text still belongs to this node.
            drafts = supportedDrafts(changedSelection ? draftCache.get(next) ?? {} : untrack(() => drafts), view);
        }
    });
    const selection = (node: NodeDetailsView): DetailSelection => ({ selectionKey: node.selectionKey, revision: node.revision, address: 'kind' in node.address ? { ...node.address, definitionRef: { ...node.address.definitionRef } } : { ...node.address, instancePath: [...node.address.instancePath] } });
    const current = (captured: DetailSelection) => alive && !!view && view.selectionKey === captured.selectionKey && view.revision === captured.revision && selectionIdentity(view) === selectionIdentity(captured);
    function textFor(control: DetailControl) {
        if (control.editor === 'json') return control.representation === 'json-text' ? String(control.value ?? '') : JSON.stringify(control.value, null, 2);
        return control.editor === 'lines' && Array.isArray(control.value) ? control.value.join('\n') : String(control.value ?? '');
    }
    async function perform(key: string, presentation: boolean, operation: (captured: DetailSelection) => DetailEditResponse) {
        const node = view;
        if (!node || (presentation ? !node.canPresent : node.readOnly)) return;
        const captured = selection(node), token = ++sequence;
        requests.set(key, token); errors = { ...errors, [key]: '' };
        if (drafts[key]) drafts = { ...drafts, [key]: { ...drafts[key], pending: true, error: '' } };
        let error = '';
        try { const result = await operation(captured); if (!result.ok) error = result.error.code + ': ' + result.error.message; }
        catch { error = 'The edit could not be accepted. Please try again.'; }
        if (!current(captured) || requests.get(key) !== token) return;
        requests.delete(key); errors = { ...errors, [key]: error };
        if (drafts[key]) {
            if (error) drafts = { ...drafts, [key]: { ...drafts[key], error, pending: false } };
            else { const next = { ...drafts }; delete next[key]; drafts = next; }
        }
    }
    function chooseFile(input: HTMLInputElement) {
        const file = input.files?.[0]; input.value = '';
        if (!file || !view?.fileInput || view.readOnly || !actions.loadFile || drafts.fileInput?.pending) return;
        drafts = { ...drafts, fileInput: { text: '', error: '', pending: false } };
        // perform captures this selection synchronously before the file action starts reading.
        void perform('fileInput', false, captured => actions.loadFile!(captured, file));
    }
    function draft(control: DetailControl, text: string) {
        if (!view || view.readOnly) return;
        requests.delete(control.key);
        drafts = { ...drafts, [control.key]: { text, error: '', pending: false, editor: control.editor, representation: control.representation } };
        errors = { ...errors, [control.key]: '' };
    }
    function save(control: DetailControl) {
        if (!view || view.readOnly || !actions.editControl) return;
        const text = drafts[control.key]?.text ?? textFor(control);
        let value: unknown = text;
        if (control.editor === 'json') {
            try {
                if (!(control.representation === 'json-text' && control.allowEmpty && text.trim() === '')) {
                    const parsed = JSON.parse(text);
                    if (control.representation !== 'json-text') value = parsed;
                }
            } catch { drafts = { ...drafts, [control.key]: { text, error: 'Enter valid JSON before saving.', pending: false, editor: control.editor, representation: control.representation } }; return; }
        } else if (control.editor === 'lines') value = text.split('\n').filter(line => line.trim());
        void perform(control.key, false, captured => actions.editControl!(captured, control.key, value));
    }
    function editControl(control: DetailControl, value: unknown) {
        if (!actions.editControl) return;
        void perform(control.key, false, captured => actions.editControl!(captured, control.key, value));
    }
    function editNumber(control: DetailControl, input: HTMLInputElement) {
        if (!view || view.readOnly || !actions.editControl) return;
        const value = Number(input.value);
        if (!input.value.trim() || !Number.isFinite(value)) {
            errors = { ...errors, [control.key]: 'Enter a finite number before saving.' }; return;
        }
        if (!input.validity.valid) {
            errors = { ...errors, [control.key]: 'Enter a number within the allowed range and step.' }; return;
        }
        editControl(control, value);
    }
    function editBinding(field: 'profileId' | 'model', mode: string, value: string | null) {
        const binding = bindingFor(field);
        if (!binding?.allowedModes.some(option => option.value === mode) || !actions.editBinding) return;
        void perform(field, false, captured => actions.editBinding!(captured, field, mode as DetailBindingMode, value));
    }
    const bindingFor = (field: 'profileId' | 'model') => field === 'profileId' ? view?.model?.profile : view?.model?.model;
    const bindingMode = (field: 'profileId' | 'model') => drafts[field] ? 'override' : bindingFor(field)?.mode;
    const bindingText = (field: 'profileId' | 'model') => drafts[field]?.text ?? bindingFor(field)?.value ?? '';
    function draftBinding(field: 'profileId' | 'model', text: string) {
        if (!view || view.readOnly || !actions.editBinding || !bindingFor(field)?.allowedModes.some(option => option.value === 'override')) return;
        requests.delete(field);
        drafts = { ...drafts, [field]: { text, error: '', pending: false } };
        errors = { ...errors, [field]: '' };
    }
    function chooseBindingMode(field: 'profileId' | 'model', mode: string) {
        const binding = bindingFor(field);
        if (!view || view.readOnly || !actions.editBinding || !binding?.allowedModes.some(option => option.value === mode)) return;
        // Revealing an editor is local; null keeps its historical saved fallback.
        if (mode === 'override') { draftBinding(field, bindingText(field)); return; }
        requests.delete(field);
        const next = { ...drafts }; delete next[field]; drafts = next;
        errors = { ...errors, [field]: '' };
        if (mode !== binding.mode) editBinding(field, mode, null);
    }
    function saveBinding(field: 'profileId' | 'model', text: string) {
        if (!view || view.readOnly || bindingMode(field) !== 'override' || !actions.editBinding || !bindingFor(field)?.allowedModes.some(option => option.value === 'override')) return;
        draftBinding(field, text);
        if (!text.trim()) {
            drafts = { ...drafts, [field]: { text, error: field === 'profileId' ? 'Choose a connection before saving an override.' : 'Enter a model identifier before saving an override.', pending: false } };
            return;
        }
        editBinding(field, 'override', text);
    }
    function boundaryValues() {
        return { label: drafts.boundary?.text ?? view?.boundary?.label ?? '', artifactKind: drafts.boundary?.artifactKind ?? view?.boundary?.kind ?? '', required: drafts.boundary?.required ?? view?.boundary?.required ?? false };
    }
    function draftBoundary(field: 'label' | 'artifactKind' | 'required', value: string | boolean) {
        if (!view?.boundary || view.readOnly || !actions.editInterface) return;
        if (field === 'artifactKind' && !view.boundary.kinds.includes(String(value))) return;
        const next = { ...boundaryValues(), [field]: value };
        boundaryDraftSequence++;
        requests.delete('boundary'); errors = { ...errors, boundary: '' };
        drafts = { ...drafts, boundary: { text: String(next.label), artifactKind: String(next.artifactKind), required: next.required === true, error: '', pending: false, boundaryId: view.boundary.id, boundaryDirection: view.boundary.direction } };
    }
    function editBoundary() {
        if (!view?.boundary || view.readOnly || !actions.editInterface || drafts.boundary?.pending) return;
        const id = view.boundary.id, values = boundaryValues();
        if (!values.label.trim() || !view.boundary.kinds.includes(values.artifactKind)) return;
        const draftSequence = ++boundaryDraftSequence;
        drafts = { ...drafts, boundary: { text: values.label, artifactKind: values.artifactKind, required: values.required, error: '', pending: false, boundaryId: id, boundaryDirection: view.boundary.direction } };
        void perform('boundary', false, async captured => {
            const result = await actions.editInterface!(captured, { kind: 'update', id, ...values });
            // A successful interface transaction can publish its revision before this response settles.
            // Only its acknowledged draft expires; newer local edits still belong to the selected port.
            if (result.ok && alive && view?.boundary?.id === id && selectionIdentity(view) === selectionIdentity(captured) && boundaryDraftSequence === draftSequence) {
                const next = { ...drafts }; delete next.boundary; drafts = next;
            }
            return result;
        });
    }
</script>

<section class="pc-node-details" aria-label="Node details">
{#if view}
    <header><svg viewBox="0 0 24 24" aria-hidden="true"><path d={view.iconPath} /></svg><div><h3>{view.title}</h3><small>{#if view.boundary}Subgraph {view.boundary.direction}{:else}Canonical type: {view.canonicalTitle}{/if}</small></div></header>
    <p class="pc-detail-meta">{view.family} · {view.phase} phase{#if view.readOnly} · Read-only body{/if}</p>
    {#if view.boundary}
        <fieldset class="pc-detail-group" data-boundary-controls><legend>Subgraph {view.boundary.direction}</legend>
            <label>Port label<input id={idPrefix + '-boundary-label'} aria-label="Subgraph port label" value={boundaryValues().label} disabled={view.readOnly || !actions.editInterface} oninput={event => draftBoundary('label', event.currentTarget.value)} /></label>
            <label>Type<select aria-label="Subgraph port type" value={boundaryValues().artifactKind} disabled={view.readOnly || !actions.editInterface} onchange={event => draftBoundary('artifactKind', event.currentTarget.value)}>{#each view.boundary.kinds as kind}<option value={kind}>{kind}</option>{/each}</select></label>
            <label class="pc-detail-check"><input aria-label="Required subgraph port" type="checkbox" checked={boundaryValues().required} disabled={view.readOnly || !actions.editInterface} onchange={event => draftBoundary('required', event.currentTarget.checked)} /> Required</label>
            <div class="pc-detail-actions"><button type="button" data-save-boundary disabled={view.readOnly || !actions.editInterface || !boundaryValues().label.trim() || !!drafts.boundary?.pending} onclick={() => editBoundary()}>{drafts.boundary?.pending ? 'Validating…' : 'Save port'}</button></div>
            <small>Labels appear on the subgraph block. Disconnect incompatible connections before changing the type. Deleting this node removes its port and attached connections.</small>
            {#if drafts.boundary?.error || errors.boundary}<p class="pc-detail-error" role="alert">{drafts.boundary?.error || errors.boundary}</p>{/if}
        </fieldset>
    {/if}
    <fieldset class="pc-detail-group"><legend>Presentation</legend>
        {#if !view.boundary}
        <label>Alias<input aria-label="Alias" maxlength="80" value={view.alias} disabled={!view.canPresent || !actions.present} onchange={event => { const value = event.currentTarget.value; if (actions.present) void perform('alias', true, captured => actions.present!(captured, 'alias', value)); }} /></label>
        <button type="button" disabled={!view.canPresent || !actions.present} onclick={() => { if (actions.present) void perform('alias', true, captured => actions.present!(captured, 'alias', '')); }}>Reset alias</button>
        {/if}
        <label class="pc-detail-check"><input aria-label="Compact card" type="checkbox" checked={view.compact} disabled={!view.canPresent || !actions.present} onchange={event => { const value = event.currentTarget.checked; if (actions.present) void perform('compact', true, captured => actions.present!(captured, 'compact', value)); }} /> Compact card</label>
        {#if errors.alias || errors.compact}<p class="pc-detail-error" role="alert">{errors.alias || errors.compact}</p>{/if}
    </fieldset>
    {#if !view.boundary}<fieldset class="pc-detail-group"><legend>Operation</legend>
        <label class="pc-detail-check"><input aria-label="Enabled" type="checkbox" checked={view.enabled} disabled={view.readOnly || !actions.editField} onchange={event => { const value = event.currentTarget.checked; if (actions.editField) void perform('enabled', false, captured => actions.editField!(captured, 'enabled', value)); }} /> Enabled</label>
        <small>Disabled operations block execution.</small>
        {#if errors.enabled}<p class="pc-detail-error" role="alert">{errors.enabled}</p>{/if}
        {#if view.fileInput}
            <div data-file-input-controls>
                <label>{view.fileInput.loaded ? 'Replace file' : 'Choose file'}<input type="file" aria-label={view.fileInput.loaded ? 'Replace file' : 'Choose file'} accept=".txt,.md,.json,text/plain,text/markdown,application/json" disabled={view.readOnly || !actions.loadFile || !!drafts.fileInput?.pending} aria-invalid={!!errors.fileInput} aria-describedby={errors.fileInput ? idPrefix + '-error-fileInput' : undefined} onchange={event => chooseFile(event.currentTarget)} /></label>
                <p>{view.fileInput.loaded ? 'Loaded file: ' + view.fileInput.fileName : 'No file loaded.'}</p>
                <small>The file's UTF-8 text is embedded in this workflow. Runs use the saved snapshot; replace the file to refresh it.</small>
                <small>Choose a .txt, .md or .json file up to 400,000 bytes and 100,000 UTF-16 code units.</small>
                {#if drafts.fileInput?.pending}<p role="status">Loading file…</p>{/if}
                {#if errors.fileInput}<p id={idPrefix + '-error-fileInput'} class="pc-detail-error" role="alert">{errors.fileInput}</p>{/if}
            </div>
        {/if}
        {#each view.controls as control (control.key)}
            <label>{control.label}
            {#if control.editor === 'enum'}
                <select aria-label={control.label} value={String(control.value)} disabled={view.readOnly || !actions.editControl} onchange={event => editControl(control, event.currentTarget.value)}>{#each control.options ?? [] as option (option.value)}<option value={option.value}>{option.label}</option>{/each}</select>
            {:else if control.editor === 'boolean'}
                <input aria-label={control.label} type="checkbox" checked={Boolean(control.value)} disabled={view.readOnly || !actions.editControl} onchange={event => editControl(control, event.currentTarget.checked)} />
            {:else if control.editor === 'number'}
                <input aria-label={control.label} type="number" min={control.min} max={control.max} step={control.step ?? 1} aria-invalid={!!errors[control.key]} aria-describedby={errors[control.key] ? idPrefix + '-error-' + control.key : undefined} value={Number(control.value)} disabled={view.readOnly || !actions.editControl} onchange={event => editNumber(control, event.currentTarget)} />
            {:else if control.editor === 'json' || control.editor === 'lines'}
                <textarea aria-label={control.label} aria-invalid={!!(drafts[control.key]?.error || errors[control.key])} aria-describedby={(drafts[control.key]?.error || errors[control.key]) ? idPrefix + '-error-' + control.key : undefined} value={drafts[control.key]?.text ?? textFor(control)} disabled={view.readOnly || !actions.editControl} oninput={event => draft(control, event.currentTarget.value)}></textarea>
            {:else}
                <textarea aria-label={control.label} value={textFor(control)} disabled={view.readOnly || !actions.editControl} onchange={event => editControl(control, event.currentTarget.value)}></textarea>
            {/if}
            </label>
            {#if control.editor === 'json' || control.editor === 'lines'}<button type="button" data-save-control={control.key} disabled={view.readOnly || !actions.editControl || !!drafts[control.key]?.pending} onclick={() => save(control)}>{drafts[control.key]?.pending ? 'Validating…' : 'Save ' + control.label}</button>{/if}
            {#if control.help}<small>{control.help}</small>{/if}
            {#if control.exposureNote}<small>{control.exposureNote}</small>{/if}
            {#if control.effective !== undefined}<small>Effective: {control.effective}{#if control.source} · {control.source}{/if}</small>{/if}
            {#if drafts[control.key]?.error || errors[control.key]}<p id={idPrefix + '-error-' + control.key} class="pc-detail-error" role="alert">{drafts[control.key]?.error || errors[control.key]}</p>{/if}
        {/each}
    </fieldset>{/if}
    {#if view.model}
        <fieldset class="pc-detail-group" data-model-controls><legend>Model</legend>
            <label>Model role<input aria-label="Model role" value={view.model.role} disabled={view.readOnly || !view.model.roleEditable || !actions.editField} onchange={event => { const value = event.currentTarget.value; if (view?.model?.roleEditable && actions.editField) void perform('modelRole', false, captured => actions.editField!(captured, 'modelRole', value)); }} /></label>
            <label>Connection mode<select aria-label="Connection mode" value={bindingMode('profileId')} disabled={view.readOnly || !actions.editBinding} onchange={event => chooseBindingMode('profileId', event.currentTarget.value)}>{#each view.model.profile.allowedModes as option (option.value)}<option value={option.value}>{option.label}</option>{/each}</select></label>
            {#if bindingMode('profileId') === 'override'}
                <label>Connection profile<select aria-label="Connection profile" value={bindingText('profileId')} disabled={view.readOnly || !actions.editBinding} onchange={event => saveBinding('profileId', event.currentTarget.value)}><option value="">Choose a connection</option>{#each view.model.profile.options ?? [] as option (option.value)}<option value={option.value}>{option.label}</option>{/each}</select></label>
            {/if}
            <label>Model mode<select aria-label="Model mode" value={bindingMode('model')} disabled={view.readOnly || !actions.editBinding} onchange={event => chooseBindingMode('model', event.currentTarget.value)}>{#each view.model.model.allowedModes as option (option.value)}<option value={option.value}>{option.label}</option>{/each}</select></label>
            {#if bindingMode('model') === 'override'}<label>Model identifier<input aria-label="Model identifier" value={bindingText('model')} disabled={view.readOnly || !actions.editBinding} oninput={event => draftBinding('model', event.currentTarget.value)} onchange={event => saveBinding('model', event.currentTarget.value)} /></label>{/if}
            <small>Effective connection: {view.model.effective}</small><small>{view.model.source}</small>
            {#if view.model.issue}<p class="pc-detail-error">{view.model.issue}</p>{/if}
            {#if errors.modelRole || drafts.profileId?.error || errors.profileId || drafts.model?.error || errors.model}<p class="pc-detail-error" role="alert">{errors.modelRole || drafts.profileId?.error || errors.profileId || drafts.model?.error || errors.model}</p>{/if}
        </fieldset>
    {/if}
    {#if view.ports.length}<details><summary>Inputs and outputs</summary>{#each view.ports as port (port.direction + ':' + port.id)}<p class="pc-detail-port">{port.direction === 'input' ? 'In' : 'Out'} · {port.label}<small>{port.kind}</small></p>{/each}</details>{/if}
    {#if view.status}<p role="status">{view.status}</p>{/if}
    {#each view.issues ?? [] as issue}<p class="pc-detail-error">{issue}</p>{/each}
    <footer>{#if !view.boundary}<button type="button" disabled={view.readOnly || !actions.duplicate} onclick={() => { if (view && !view.readOnly) actions.duplicate?.(selection(view)); }}>Duplicate</button>{/if}<button type="button" class="pc-detail-danger" disabled={view.readOnly || !actions.remove} onclick={() => { if (view && !view.readOnly) actions.remove?.(selection(view)); }}>Delete</button></footer>
{:else}
    <p class="pc-detail-empty">Select a node to inspect its settings.</p>
{/if}
</section>

<style>
    .pc-node-details { min-width: 0; color: #d7dcdf; font: inherit; font-size: 12px; padding: 12px; }
    header { display: flex; gap: 9px; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #ffffff0c; }
    header svg { width: 22px; height: 22px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
    header div { min-width: 0; } h3 { font-size: 14px; margin: 0 0 3px; overflow-wrap: anywhere; }
    small { display: block; color: #9aa4aa; font-size: 10px; line-height: 1.5; overflow-wrap: anywhere; }
    .pc-detail-meta { color: #aeb5ba; font-size: 10px; } .pc-detail-group { min-width: 0; margin: 12px 0; padding: 10px 0; border: 0; border-top: 1px solid #ffffff0c; border-radius: 0; background: transparent; box-shadow: none; }
    legend { padding: 0 5px; color: #bbc2c6; font-size: 11px; } label { display: block; margin: 8px 0; color: #bec6ca; font-size: 11px; }
    input:not([type='checkbox']), select, textarea { display: block; width: 100%; box-sizing: border-box; margin-top: 4px; min-height: 28px; padding: 5px 7px; border: 1px solid #ffffff12; border-radius: 2px; background: #14151680; color: #e1e5e7; font: inherit; }
    textarea { min-height: 70px; resize: vertical; line-height: 1.5; } input[type='checkbox'] { accent-color: var(--SmartThemeQuoteColor, #e18a24); }
    .pc-detail-check { display: flex; align-items: center; gap: 6px; } button { min-height: 27px; padding: 4px 8px; border: 1px solid #ffffff10; border-radius: 2px; background: #2a2c2e; color: #d5dce0; font: inherit; font-size: 11px; cursor: pointer; box-shadow: inset 0 1px #ffffff05; }
    button:hover:not(:disabled) { background: #35383a; } :is(button, input, select, textarea):focus-visible { outline: 2px solid var(--SmartThemeQuoteColor, #e18a24); outline-offset: 1px; }
    :disabled { opacity: .55; cursor: default; } .pc-detail-error { color: #e58d94; font-size: 11px; overflow-wrap: anywhere; } .pc-detail-danger { color: #e58d94; }
    .pc-detail-port { display: flex; justify-content: space-between; gap: 8px; margin: 8px 0; font-size: 11px; } details { padding: 8px 0; border-top: 1px solid #ffffff0c; } summary { cursor: pointer; font-size: 11px; }
    footer, .pc-detail-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; } .pc-detail-empty { color: #96a0a6; }
</style>
