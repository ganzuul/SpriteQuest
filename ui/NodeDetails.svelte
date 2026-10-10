<script lang="ts">
    import { onDestroy, untrack } from 'svelte';
    import DetailControlEditor from './DetailControl.svelte';
    import ModifierStack from './ModifierStack.svelte';
    import type { DetailBindingMode, DetailControl, DetailEditResponse, DetailModifier, DetailSelection, NodeDetailsActions, NodeDetailsView } from './detail-types';
    let { view, actions = {}, idPrefix = 'pc-node-details' }: { view: NodeDetailsView | null; actions?: NodeDetailsActions; idPrefix?: string } = $props();
    type LocalDraft = { text: string; error: string; pending: boolean; editor?: DetailControl['editor']; representation?: 'json-text' | 'json-value'; artifactKind?: string; required?: boolean; boundaryId?: string; boundaryDirection?: 'input' | 'output'; modifierType?: string };
    let drafts = $state<Record<string, LocalDraft>>({});
    let errors = $state<Record<string, string>>({});
    let identity = '', revision = '', support = '';
    let sequence = 0, boundaryDraftSequence = 0, draftVisit = 0;
    const requests = new Map<string, number>();
    let modifierBusy = $state(false);
    let modifierIdSequence = 0, modifierBusySequence = 0, modifierEpoch = 0;
    const modifierGenerations = new Map<string, number>();
    const draftGenerations = new Map<string, number>();
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
            if (key.startsWith('modifier:')) {
                const item = node.modifiers?.items.find(item => 'modifier:' + item.id === key);
                return item && item.type === value.modifierType && node.modifiers?.options.some(option => option.type === item.type) ? [[key, value]] : [];
            }
            return node.controls.some(control => control.key === key && control.editor === value.editor && control.representation === value.representation && (control.editor === 'json' || control.editor === 'lines')) ? [[key, value]] : [];
        }));
    }
    const selectionIdentity = (node: DetailSelection) => JSON.stringify([node.selectionKey, 'kind' in node.address
        ? [node.address.kind, node.address.definitionRef.id, node.address.definitionRef.version, node.address.definitionRef.semanticHash, node.address.nodeId]
        : [node.address.workflowId, node.address.instancePath, node.address.nodeId]]);
    let alive = true;
    onDestroy(() => { alive = false; requests.clear(); draftCache.clear(); draftGenerations.clear(); modifierGenerations.clear(); });
    $effect(() => {
        const next = view ? selectionIdentity(view) : '', nextRevision = view?.revision ?? '';
        const nextSupport = JSON.stringify([view?.controls.map(control => [control.key, control.editor, control.representation]), view?.model?.profile.allowedModes, view?.model?.model.allowedModes, view?.model?.editable, view?.boundary && [view.boundary.id, view.boundary.direction, view.boundary.kinds], !!view?.fileInput, view?.modifiers && [view.modifiers.items.map(item => [item.id, item.type]).sort(([a], [b]) => a.localeCompare(b)), view.modifiers.options.map(option => [option.type, option.fields.map(field => [field.key, field.editor])]), view.modifiers.editable, view.readOnly]]);
        const changedSelection = next !== identity;
        if (changedSelection || nextRevision !== revision || nextSupport !== support) {
            if (changedSelection || nextSupport !== support) { boundaryDraftSequence++; modifierEpoch++; }
            if (changedSelection) {
                draftVisit++;
                if (identity) draftCache.set(identity, untrack(() => settledDrafts(drafts)));
            }
            identity = next; revision = nextRevision; support = nextSupport; requests.clear(); sequence++; errors = {}; modifierBusy = false; modifierBusySequence++;
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
    function draftContract(node: NodeDetailsView, key: string) {
        if (key === 'model' || key === 'profileId') {
            const binding = key === 'model' ? node.model?.model : node.model?.profile;
            return binding?.allowedModes.some(option => option.value === 'override') ? JSON.stringify(['binding', key, node.model?.editable ?? !node.readOnly]) : null;
        }
        const control = node.controls.find(control => control.key === key);
        return control && (control.editor === 'json' || control.editor === 'lines') ? JSON.stringify([control.editor, control.representation, control.allowEmpty, control.structured]) : null;
    }
    function nextDraftGeneration(key: string) {
        const generation = (draftGenerations.get(key) ?? 0) + 1;
        draftGenerations.set(key, generation);
        return generation;
    }
    async function perform(key: string, presentation: boolean, operation: (captured: DetailSelection) => DetailEditResponse) {
        const node = view;
        const bindingEdit = key === 'profileId' || key === 'model';
        if (!node || (presentation ? !node.canPresent : bindingEdit ? !canEditBinding(node) : node.readOnly)) return;
        const captured = selection(node), token = ++sequence, visit = draftVisit, contract = draftContract(node, key);
        const generation = drafts[key] && contract ? nextDraftGeneration(key) : null;
        requests.set(key, token); errors = { ...errors, [key]: '' };
        if (drafts[key]) drafts = { ...drafts, [key]: { ...drafts[key], pending: true, error: '' } };
        let error = '', accepted = false;
        try { const result = await operation(captured); accepted = result.ok; if (!result.ok) error = result.error.code + ': ' + result.error.message; }
        catch { error = 'The edit could not be accepted. Please try again.'; }
        // A successful transaction may publish its revision before acknowledgment.
        // Expire only the submitted draft; later text, Saves and node visits keep theirs.
        if (accepted && generation !== null && drafts[key] && alive && view && draftVisit === visit && selectionIdentity(view) === selectionIdentity(captured) && draftGenerations.get(key) === generation && draftContract(view, key) === contract) {
            const next = { ...drafts }; delete next[key]; drafts = next;
        }
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
        nextDraftGeneration(control.key);
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
    const canEditBinding = (node: NodeDetailsView | null = view) => !!node?.model && (node.model.editable ?? !node.readOnly) && !!actions.editBinding;
    const bindingMode = (field: 'profileId' | 'model') => drafts[field] ? 'override' : bindingFor(field)?.mode;
    const bindingText = (field: 'profileId' | 'model') => drafts[field]?.text ?? bindingFor(field)?.value ?? '';
    const profileSelection = () => {
        const profile = view?.model?.profile;
        return drafts.profileId?.text ?? (profile && Object.hasOwn(profile, 'effectiveValue') ? profile.effectiveValue ?? '' : profile?.value ?? '');
    };
    const usesProfileModel = () => view?.model?.profile.mode === 'override' || !!view?.model?.profileDefaultModel;
    function draftBinding(field: 'profileId' | 'model', text: string) {
        if (!canEditBinding() || !bindingFor(field)?.allowedModes.some(option => option.value === 'override')) return;
        nextDraftGeneration(field);
        requests.delete(field);
        drafts = { ...drafts, [field]: { text, error: '', pending: false } };
        errors = { ...errors, [field]: '' };
    }
    function chooseBindingMode(field: 'profileId' | 'model', mode: string) {
        const binding = bindingFor(field);
        if (!canEditBinding() || !binding?.allowedModes.some(option => option.value === mode)) return;
        // Revealing an editor is local; null keeps its historical saved fallback.
        if (mode === 'override') { draftBinding(field, bindingText(field)); return; }
        requests.delete(field);
        const next = { ...drafts }; delete next[field]; drafts = next;
        errors = { ...errors, [field]: '' };
        if (mode !== binding.mode) editBinding(field, mode, null);
    }
    function saveBinding(field: 'profileId' | 'model', text: string) {
        if (!canEditBinding() || (field === 'model' && bindingMode(field) !== 'override') || !bindingFor(field)?.allowedModes.some(option => option.value === 'override')) return;
        draftBinding(field, text);
        if (!text.trim()) {
            const defaultMode = view?.readOnly ? 'block' : 'inherit';
            if (field === 'model' && usesProfileModel() && bindingFor(field)?.allowedModes.some(option => option.value === defaultMode)) {
                chooseBindingMode(field, defaultMode); return;
            }
            drafts = { ...drafts, [field]: { text, error: field === 'profileId' ? 'Choose a connection before saving an override.' : 'Enter a model identifier before saving an override.', pending: false } };
            return;
        }
        editBinding(field, 'override', text);
    }
    const canEditModifiers = () => !!view?.modifiers?.editable && !view.readOnly && !!actions.editModifiers;
    const cloneModifiers = () => JSON.parse(JSON.stringify(view?.modifiers?.items ?? [])) as DetailModifier[];
    function modifierSettings(item: DetailModifier) {
        const cached = drafts['modifier:' + item.id];
        if (cached) { try { return JSON.parse(cached.text) as Record<string, unknown>; } catch { /* saved settings remain inspectable */ } }
        return item.settings;
    }
    const modifierDrafts = () => Object.fromEntries((view?.modifiers?.items ?? []).map(item => {
        const cached = drafts['modifier:' + item.id];
        return [item.id, { settings: modifierSettings(item), error: cached?.error || errors['modifier:' + item.id] || '', pending: !!cached?.pending, dirty: !!cached }];
    }));
    function editModifierStack(items: DetailModifier[]) {
        if (!canEditModifiers() || modifierBusy || items.length > 16 || !actions.editModifiers) return;
        const token = ++modifierBusySequence;
        modifierBusy = true;
        void perform('modifiers', false, captured => actions.editModifiers!(captured, items)).finally(() => { if (token === modifierBusySequence) modifierBusy = false; });
    }
    function addModifier(type: string) {
        if (!canEditModifiers() || !view?.modifiers || view.modifiers.items.length >= 16) return;
        const option = view.modifiers.options.find(option => option.type === type);
        if (!option) return;
        const items = cloneModifiers();
        let id: string;
        do { id = `mod-${type.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 28)}-${Date.now().toString(36)}-${(++modifierIdSequence).toString(36)}`; } while (items.some(item => item.id === id));
        editModifierStack([...items, { id, type, version: 1, enabled: true, settings: JSON.parse(JSON.stringify(option.defaultSettings)) }]);
    }
    function quickModifier(type: string, enabled: boolean) {
        if (!canEditModifiers() || !view?.modifiers || !view.modifiers.options.some(option => option.type === type)) return;
        const items = cloneModifiers();
        if (!items.some(item => item.type === type)) { if (enabled) addModifier(type); return; }
        editModifierStack(items.map(item => item.type === type ? { ...item, enabled } : item));
    }
    function enableModifier(id: string, enabled: boolean) {
        if (!canEditModifiers() || !view?.modifiers?.items.some(item => item.id === id)) return;
        editModifierStack(cloneModifiers().map(item => item.id === id ? { ...item, enabled } : item));
    }
    function removeModifier(id: string) {
        if (!canEditModifiers() || !view?.modifiers?.items.some(item => item.id === id)) return;
        editModifierStack(cloneModifiers().filter(item => item.id !== id));
    }
    function moveModifier(id: string, direction: -1 | 1) {
        if (!canEditModifiers()) return;
        const items = cloneModifiers(), from = items.findIndex(item => item.id === id), to = from + direction;
        if (from < 0 || to < 0 || to >= items.length) return;
        [items[from], items[to]] = [items[to], items[from]];
        editModifierStack(items);
    }
    function draftModifier(id: string, field: string, value: unknown) {
        if (!canEditModifiers()) return;
        const item = view?.modifiers?.items.find(item => item.id === id), option = view?.modifiers?.options.find(option => option.type === item?.type);
        if (!item || !option?.fields.some(control => control.key === field)) return;
        const key = 'modifier:' + id;
        modifierGenerations.set(key, (modifierGenerations.get(key) ?? 0) + 1);
        requests.delete(key); errors = { ...errors, [key]: '' };
        drafts = { ...drafts, [key]: { text: JSON.stringify({ ...modifierSettings(item), [field]: value }), error: '', pending: false, modifierType: item.type } };
    }
    function saveModifier(id: string) {
        if (!canEditModifiers() || !actions.editModifiers) return;
        const item = view?.modifiers?.items.find(item => item.id === id), key = 'modifier:' + id;
        if (!item || !drafts[key] || drafts[key].pending) return;
        const generation = (modifierGenerations.get(key) ?? 0) + 1, epoch = modifierEpoch, type = item.type;
        modifierGenerations.set(key, generation);
        const settings = modifierSettings(item), items = cloneModifiers().map(entry => entry.id === id ? { ...entry, settings } : entry);
        void perform(key, false, async captured => {
            const result = await actions.editModifiers!(captured, items);
            // A accepted graph commit can publish a revision before its acknowledgment.
            if (result.ok && alive && view && selectionIdentity(view) === selectionIdentity(captured) && modifierEpoch === epoch && modifierGenerations.get(key) === generation && view.modifiers?.items.some(entry => entry.id === id && entry.type === type)) {
                const next = { ...drafts }; delete next[key]; drafts = next;
            }
            return result;
        });
    }
    const controlGroups = () => {
        const groups = new Map<string, DetailControl[]>();
        for (const control of view?.controls ?? []) {
            const name = control.group && control.group !== 'Main' ? control.group : control.advanced ? 'Advanced' : 'Main';
            groups.set(name, [...(groups.get(name) ?? []), control]);
        }
        return [...groups].sort(([a], [b]) => a === 'Main' ? -1 : b === 'Main' ? 1 : 0);
    };
    const groupHasError = (controls: DetailControl[]) => controls.some(control => !!(drafts[control.key]?.error || errors[control.key]));
    const modelSummary = () => {
        if (!view?.model) return '';
        return `Model connection · ${view.model.issue ? 'Binding needs attention' : view.model.effective || 'Choose a connection'}`;
    };
    function editName(value: string) {
        if (!view || view.boundary || !actions.present) return;
        void perform('alias', true, captured => actions.present!(captured, 'alias', value === view?.canonicalTitle ? '' : value));
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
    <header style:--pc-detail-family={view.familyColor ?? 'var(--pc-accent)'}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d={view.iconPath} /></svg>
        <div class="pc-detail-identity">
            <input id={idPrefix + '-name'} class="pc-detail-name" aria-label="Node name" maxlength={view.boundary ? undefined : 80} value={view.boundary ? boundaryValues().label : view.alias || view.title || view.canonicalTitle} disabled={view.boundary ? view.readOnly || !actions.editInterface : !view.canPresent || !actions.present} oninput={event => { if (view?.boundary) draftBoundary('label', event.currentTarget.value); }} onchange={event => { if (!view?.boundary) editName(event.currentTarget.value); }} />
            {#if !view.boundary && (view.alias || view.title || view.canonicalTitle) !== view.canonicalTitle}<small data-canonical-title>Canonical type: {view.canonicalTitle}</small>{/if}
            <small>{view.boundary ? 'Subgraph ' + view.boundary.direction : view.family + ' · ' + view.phase + ' phase'}</small>
        </div>
        {#if actions.duplicate || actions.remove}<details class="pc-detail-commands"><summary aria-label="Node commands" title="Node commands">⋯</summary><div class="pc-detail-command-list">
            {#if !view.boundary && actions.duplicate}<button type="button" disabled={view.readOnly} onclick={() => { if (view && !view.readOnly) actions.duplicate?.(selection(view)); }}>Duplicate</button>{/if}
            {#if actions.remove}<button type="button" class="pc-detail-danger" disabled={view.readOnly} onclick={() => { if (view && !view.readOnly) actions.remove?.(selection(view)); }}>Delete</button>{/if}
        </div></details>{/if}
    </header>
    {#if view.phaseEditable}<label>Workflow stage<select aria-label="Workflow stage" value={view.phase} disabled={view.readOnly || !actions.editPhase} onchange={event => { const phase = event.currentTarget.value as 'pre' | 'post'; void perform('phase', false, captured => actions.editPhase!(captured, phase)); }}><option value="pre">Preparation · before Generate Reply</option><option value="post">Response · after Generate Reply</option></select></label>{#if errors.phase}<p role="alert" class="pc-detail-error">{errors.phase}</p>{/if}{/if}
    {#if view.operation === 'fast-decision'}<p><button type="button" onclick={() => actions.openFastConnections?.()} disabled={!actions.openFastConnections}>Configure Fast connections…</button></p>{/if}
    {#if view.readOnly || !view.enabled}<p class="pc-detail-state">{#if view.readOnly}<span>Read-only body</span>{/if}{#if !view.enabled}<span class="pc-detail-blocked">Blocks run · Disabled</span>{/if}</p>{/if}
    {#if errors.alias}<p class="pc-detail-error" role="alert">{errors.alias}</p>{/if}
    {#if view.boundary}
        <fieldset class="pc-detail-group" data-boundary-controls><legend>Subgraph {view.boundary.direction}</legend>
            <label>Type<select aria-label="Subgraph port type" value={boundaryValues().artifactKind} disabled={view.readOnly || !actions.editInterface} onchange={event => draftBoundary('artifactKind', event.currentTarget.value)}>{#each view.boundary.kinds as kind}<option value={kind}>{kind}</option>{/each}</select></label>
            <label class="pc-detail-check"><input aria-label="Required subgraph port" type="checkbox" checked={boundaryValues().required} disabled={view.readOnly || !actions.editInterface} onchange={event => draftBoundary('required', event.currentTarget.checked)} /> Required</label>
            <div class="pc-detail-actions"><button type="button" data-save-boundary disabled={view.readOnly || !actions.editInterface || !boundaryValues().label.trim() || !!drafts.boundary?.pending} onclick={() => editBoundary()}>{drafts.boundary?.pending ? 'Validating…' : 'Save port'}</button></div>
            <small>Labels appear on the subgraph block. Disconnect incompatible connections before changing the type. Deleting this node removes its port and attached connections.</small>
            {#if drafts.boundary?.error || errors.boundary}<p class="pc-detail-error" role="alert">{drafts.boundary?.error || errors.boundary}</p>{/if}
        </fieldset>
    {/if}
    {#if !view.boundary}
        <fieldset class="pc-detail-group pc-detail-main" data-operation-controls>
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
            {#each controlGroups().filter(([group]) => group === 'Main') as [group, controls] (group)}
                {#each controls as control (control.key)}{@render controlEditor(control)}{/each}
            {/each}
        </fieldset>
        {#each controlGroups().filter(([group]) => group !== 'Main') as [group, controls] (group)}
            <details class="pc-detail-group" data-control-group={group} open={groupHasError(controls)}><summary>{group}</summary>
                {#each controls as control (control.key)}{@render controlEditor(control)}{/each}
            </details>
        {/each}
    {/if}
    {#if view.model}
        <details class="pc-detail-group" data-model-controls open><summary>{modelSummary()}</summary>
            <label>Connection profile<select aria-label="Connection profile" value={profileSelection()} disabled={!canEditBinding() || !view.model.profile.allowedModes.some(option => option.value === 'override')} onchange={event => saveBinding('profileId', event.currentTarget.value)}><option value="">Choose a connection</option>{#if profileSelection() && !(view.model.profile.options ?? []).some(option => option.value === profileSelection())}<option value={profileSelection()}>Unavailable connection · {profileSelection()}</option>{/if}{#each view.model.profile.options ?? [] as option (option.value)}<option value={option.value}>{option.label}</option>{/each}</select></label>
            <label>Model mode<select aria-label="Model mode" value={bindingMode('model')} disabled={!canEditBinding()} onchange={event => chooseBindingMode('model', event.currentTarget.value)}>{#each view.model.model.allowedModes as option (option.value)}<option value={option.value}>{option.value === 'inherit' && !view.readOnly ? usesProfileModel() || !view.model.model.effectiveValue ? 'Use profile model' : 'Existing role model' : option.label}</option>{/each}</select></label>
            {#if bindingMode('model') === 'override'}<label>Model identifier<input aria-label="Model identifier" value={bindingText('model')} disabled={!canEditBinding()} oninput={event => draftBinding('model', event.currentTarget.value)} onchange={event => saveBinding('model', event.currentTarget.value)} /></label>{/if}
            <details data-binding-advanced><summary>Advanced connection settings</summary>
                <label>Connection mode<select aria-label="Connection mode" value={bindingMode('profileId')} disabled={!canEditBinding()} onchange={event => chooseBindingMode('profileId', event.currentTarget.value)}>{#each view.model.profile.allowedModes as option (option.value)}<option value={option.value}>{option.label}</option>{/each}</select></label>
                <label>Model role<input aria-label="Model role" value={view.model.role} disabled={view.readOnly || !view.model.roleEditable || !actions.editField} onchange={event => { const value = event.currentTarget.value; if (view?.model?.roleEditable && actions.editField) void perform('modelRole', false, captured => actions.editField!(captured, 'modelRole', value)); }} /></label>
            </details>
            {#if !view.model.issue || view.model.effective.trim() !== view.model.issue.trim()}<small>Effective connection: {view.model.effective}</small>{/if}{#if view.model.source}<small>{view.model.source}</small>{/if}
            {#if view.model.issue}<p class="pc-detail-error" role="alert">{view.model.issue}</p>{/if}
            {#if errors.modelRole || drafts.profileId?.error || errors.profileId || drafts.model?.error || errors.model}<p class="pc-detail-error" role="alert">{errors.modelRole || drafts.profileId?.error || errors.profileId || drafts.model?.error || errors.model}</p>{/if}
        </details>
    {/if}
    {#if view.ports.length}<details class="pc-detail-group"><summary>Inputs and outputs</summary>{#each view.ports as port (port.direction + ':' + port.id)}<p class="pc-detail-port">{port.direction === 'input' ? 'In' : 'Out'} · {port.label}<small>{port.kind}</small></p>{/each}</details>{/if}
    {#if view.status}<p role="status">{view.status}</p>{/if}
    {#each view.issues ?? [] as issue}<p class="pc-detail-error" role="alert">{issue}</p>{/each}
    {#if view.modifiers}
        <ModifierStack items={view.modifiers.items} options={view.modifiers.options} disabled={!canEditModifiers()} busy={modifierBusy} drafts={modifierDrafts()} error={errors.modifiers || ''} {idPrefix} onquick={quickModifier} onadd={addModifier} onenable={enableModifier} onremove={removeModifier} onmove={moveModifier} ondraft={draftModifier} onsave={saveModifier} />
    {/if}
{:else}
    <p class="pc-detail-empty">Select a node to inspect its settings.</p>
{/if}
</section>

{#snippet controlEditor(control: DetailControl)}
    <DetailControlEditor {control} text={drafts[control.key]?.text ?? textFor(control)} error={drafts[control.key]?.error || errors[control.key] || ''} disabled={!!view?.readOnly || !actions.editControl} pending={!!drafts[control.key]?.pending} idPrefix={idPrefix + '-' + control.key} ontext={text => draft(control, text)} onvalue={value => editControl(control, value)} onnumber={input => editNumber(control, input)} onsave={() => save(control)} />
{/snippet}

<style>
    .pc-node-details { box-sizing: border-box; flex: 1; display: flex; flex-direction: column; min-width: 0; width: 100%; color: var(--pc-text); font: inherit; font-size: 12px; padding: 10px; }
    .pc-node-details :global(.pc-modifiers) { margin-top: auto; padding-top: 12px; }
    header { display: flex; gap: 7px; align-items: start; padding-bottom: 10px; border-bottom: 1px solid var(--pc-border); }
    header svg { width: 21px; height: 21px; margin-top: 5px; flex: none; fill: none; stroke: var(--pc-detail-family); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
    .pc-detail-identity { min-width: 0; flex: 1; } .pc-detail-identity .pc-detail-name { font-weight: 600; font-size: 14px; margin: 0 0 2px !important; border-color: transparent !important; background: transparent !important; padding: 3px !important; }
    .pc-detail-name:hover:not(:disabled), .pc-detail-name:focus { border-color: var(--pc-border) !important; background: var(--pc-field) !important; }
    small { display: block; color: var(--pc-muted); font-size: 10px; line-height: 1.5; overflow-wrap: anywhere; }
    .pc-detail-state { display: flex; flex-wrap: wrap; gap: 3px 8px; margin: 8px 0; color: var(--pc-muted); font-size: 10px; } .pc-detail-blocked { color: var(--pc-warn); }
    .pc-detail-group { min-width: 0; margin: 10px 0 0; padding: 9px 0 0; border: 0; border-top-width: 1px; border-top-style: solid; border-top-color: var(--pc-border); border-radius: 0; background: transparent; box-shadow: none; }
    .pc-detail-main { margin-top: 0; border-top-color: transparent; padding-top: 2px; }
    legend { padding: 0 5px; color: var(--pc-muted); font-size: 11px; } label { display: block; margin: 8px 0; color: var(--pc-text); font-size: 11px; }
    input:not([type='checkbox']), select { display: block; width: 100%; min-width: 0; box-sizing: border-box; margin-top: 4px; min-height: 28px; padding: 5px 7px; border: 1px solid var(--pc-border); border-radius: 2px; background: var(--pc-field); color: var(--pc-text); font: inherit; }
    input[type='checkbox'] { accent-color: var(--pc-accent); }
    .pc-detail-check { display: flex; align-items: center; gap: 6px; } button { min-height: 27px; padding: 4px 8px; border: 1px solid var(--pc-border); border-radius: 2px; background: var(--pc-control); color: var(--pc-text); font: inherit; font-size: 11px; cursor: pointer; }
    button:hover:not(:disabled) { background: color-mix(in srgb, var(--pc-text) 10%, var(--pc-control)); } :is(button, input, select):focus-visible { outline: 2px solid var(--pc-accent); outline-offset: 1px; }
    :disabled { opacity: .55; cursor: default; } .pc-detail-error { color: var(--pc-error); font-size: 11px; overflow-wrap: anywhere; } .pc-detail-danger { color: var(--pc-error); }
    .pc-detail-port { display: flex; justify-content: space-between; gap: 8px; margin: 8px 0; font-size: 11px; } summary { cursor: pointer; font-size: 11px; color: var(--pc-muted); overflow-wrap: anywhere; }
    .pc-detail-actions { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; } .pc-detail-empty { color: var(--pc-muted); }
    .pc-detail-commands { position: relative; flex: none; padding-top: 2px; } .pc-detail-commands summary { padding: 2px 5px; list-style: none; font-size: 18px; line-height: 20px; } .pc-detail-commands summary::-webkit-details-marker { display: none; }
    .pc-detail-command-list { position: absolute; top: 28px; right: 0; z-index: 2; display: grid; gap: 3px; min-width: 90px; padding: 4px; border: 1px solid var(--pc-border); background: var(--pc-panel-solid); }
    .pc-detail-command-list button { text-align: left; background: transparent; border: 0; }
</style>
