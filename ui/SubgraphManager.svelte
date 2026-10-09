<script lang="ts">
    import { onDestroy } from 'svelte';
    import type { DetailBindingMode, DetailControl } from './detail-types';
    import type { LibraryManagerCapture, ManagerResponse, ManagerRef, ManagerScope, ManagerInterface, ManagerInterfaceEdit, ManagerParameterEdit, ManagerUpdateDetail, ManagerUpdateMaps, SubgraphManagerActions, SubgraphManagerView } from './manager-types';
    let { view, actions = {} }: { view: SubgraphManagerView | null; actions?: SubgraphManagerActions } = $props();
    let name = $state(''), error = $state(''), pending = $state('');
    let interfaceDrafts = $state<Record<string, { label: string; artifactKind: string; required: boolean }>>({}), parameterLabels = $state<Record<string, string>>({});
    let overrideDrafts = $state<Record<string, string | boolean>>({});
    const mapKinds = ['portMap', 'parameterMap', 'roleMap', 'nodeBindingMap'] as const;
    const mapLabels = { portMap: 'Ports', parameterMap: 'Parameters', roleMap: 'Model roles', nodeBindingMap: 'Node bindings' };
    let updateMaps = $state.raw<ManagerUpdateMaps>({ portMap: {}, parameterMap: {}, roleMap: {}, nodeBindingMap: {} });
    let newInterface = $state(''), newKind = $state(''), newDirection = $state<'input' | 'output'>('input'), newRequired = $state(true), newParameter = $state(''), targetKey = $state(''), saveMode = $state<'new' | 'revision'>('new'), saveTargetKey = $state(''), conversionName = $state('');
    let loaded = '', sequence = 0, alive = true;
    const refKey = (value: ManagerRef | null | undefined) => value ? JSON.stringify([value.id, value.version, value.semanticHash]) : '';
    const scopeKey = (value: ManagerScope) => JSON.stringify(value.kind === 'graph' ? ['graph', value.workflowId, value.instancePath, refKey(value.definitionRef)] : ['library', refKey(value.definitionRef)]);
    const entry = $derived(view?.entries.find(item => refKey(item.ref) === refKey(view.selectedRef)));
    const destination = $derived(view?.destinations.find(item => item.key === view.selectedDestinationKey));
    const ownedBody = $derived(!!view && view.permissions.bodyEdit && view.scope.kind === 'graph' && (!view.instance || view.instance.owned));
    const updateTarget = $derived(view?.update?.choices.find(item => item.key === view.update?.selectedKey));
    const mappingsChanged = $derived(JSON.stringify(updateMaps) !== JSON.stringify(initialMaps(view?.update ?? null)));
    $effect(() => {
        const key = view ? JSON.stringify([view.managerKey, view.revision, view.libraryRevision, scopeKey(view.scope), refKey(view.selectedRef), refKey(view.definition?.ref), view.instance?.address, refKey(view.instance?.ref), view.update?.selectedKey]) : '';
        if (key !== loaded) {
            loaded = key; name = entry?.name ?? view?.definition?.name ?? ''; error = ''; pending = ''; sequence++;
            interfaceDrafts = Object.fromEntries((view?.definition?.interface ?? []).map(row => [row.id, { label: row.label, artifactKind: row.kind, required: row.required }]));
            parameterLabels = Object.fromEntries((view?.definition?.parameters ?? []).map(row => [row.id, row.label]));
            overrideDrafts = Object.fromEntries((view?.instance?.parameters ?? []).map(row => [row.id, controlText(row.control)]));
            updateMaps = initialMaps(view?.update ?? null);
            newInterface = ''; newKind = view?.definition?.kinds[0] ?? ''; newDirection = 'input'; newRequired = true; newParameter = ''; targetKey = ''; saveMode = 'new'; saveTargetKey = ''; conversionName = '';
        }
    });
    onDestroy(() => { alive = false; sequence++; });
    const capture = (current: SubgraphManagerView): LibraryManagerCapture => ({ managerKey: current.managerKey, revision: current.revision, libraryRevision: current.libraryRevision, scope: $state.snapshot(current.scope) });
    const copyRef = (value: ManagerRef): ManagerRef => ({ id: value.id, version: value.version, semanticHash: value.semanticHash });
    function can(key: keyof SubgraphManagerView['capabilities'], permission?: keyof SubgraphManagerView['permissions']) { return !!view && view.capabilities[key] && (!permission || view.permissions[permission]) && (!['bodyEdit', 'instanceEdit'].includes(permission ?? '') || view.scope.kind === 'graph') && (!['editInterface', 'editParameter'].includes(key) || ownedBody); }
    function changed() { error = ''; pending = ''; sequence++; }
    function initialMaps(update: ManagerUpdateDetail | null): ManagerUpdateMaps { return { portMap: Object.fromEntries((update?.portMap ?? []).map(row => [row.from, row.to])), parameterMap: Object.fromEntries((update?.parameterMap ?? []).map(row => [row.from, row.to])), roleMap: Object.fromEntries((update?.roleMap ?? []).map(row => [row.from, row.to])), nodeBindingMap: Object.fromEntries((update?.nodeBindingMap ?? []).map(row => [row.from, row.to])) }; }
    function mapping(kind: keyof ManagerUpdateMaps, from: string, encoded: string) {
        const row = view?.update?.[kind].find(item => item.from === from); if (!row || !can('prepareUpdate', 'instanceEdit')) return;
        let value: unknown; try { value = JSON.parse(encoded); } catch { return; }
        if (value === null ? !row.canDrop : typeof value !== 'string' || !row.options.some(option => option.id === value)) return;
        updateMaps = { ...updateMaps, [kind]: { ...updateMaps[kind], [from]: value as string | null } }; changed();
    }
    function updateInstance(accept: boolean) {
        const instance = view?.instance, update = view?.update, target = updateTarget; if (!instance || !update || !target) return;
        if (accept) {
            if (!update.preparedKey || mappingsChanged || !can('acceptUpdate', 'instanceEdit') || !actions.acceptUpdate) return;
            const key = update.preparedKey;
            void perform('acceptUpdate', true, captured => actions.acceptUpdate!(captured, key, copyRef(instance.ref), copyRef(target.ref)));
        } else if (can('prepareUpdate', 'instanceEdit') && actions.prepareUpdate) {
            const maps = structuredClone(updateMaps);
            void perform('prepareUpdate', true, captured => actions.prepareUpdate!(captured, copyRef(instance.ref), copyRef(target.ref), maps));
        }
    }
    function controlText(control: DetailControl): string | boolean { return control.editor === 'boolean' ? control.value === true : control.editor === 'json' && control.representation === 'json-value' ? JSON.stringify(control.value, null, 2) ?? '' : control.editor === 'lines' && Array.isArray(control.value) ? control.value.join('\n') : String(control.value ?? ''); }
    function overrideDraft(id: string, control: DetailControl) { return overrideDrafts[id] ?? controlText(control); }
    function overrideField(id: string, value: string | boolean) { overrideDrafts = { ...overrideDrafts, [id]: value }; changed(); }
    function saveOverride(id: string, reset = false) {
        const row = view?.instance?.parameters.find(item => item.id === id);
        if (!row || !can('editParameterOverride', 'instanceEdit') || !actions.editParameterOverride) return;
        if (reset) { void perform('editParameterOverride', true, captured => actions.editParameterOverride!(captured, id, 'reset')); return; }
        const control = row.control, draft = overrideDraft(id, control); let value: unknown = draft;
        if (control.editor === 'json') {
            const text = String(draft);
            try { if (control.representation === 'json-text' && control.allowEmpty && !text.trim()) value = text; else { const parsed = JSON.parse(text); value = control.representation === 'json-text' ? text : parsed; } }
            catch { error = 'Enter valid JSON before saving.'; return; }
        } else if (control.editor === 'number') { value = Number(draft); if (!String(draft).trim() || !Number.isFinite(value)) { error = 'Enter a finite number before saving.'; return; } }
        else if (control.editor === 'lines') value = String(draft).split(/\r?\n/);
        else if (control.editor === 'enum' && !control.options?.some(option => option.value === value)) { error = 'Choose an available value before saving.'; return; }
        void perform('editParameterOverride', true, captured => actions.editParameterOverride!(captured, id, 'set', value));
    }
    function bindingChange(key: string, field: 'profileId' | 'model', mode: string, value: string | null, valueEdit = false) {
        const row = view?.instance?.bindings.find(item => item.key === key), binding = field === 'profileId' ? row?.profile : row?.model;
        if (!row?.editable || !binding || !can('editBindingOverride', 'instanceEdit') || !actions.editBindingOverride || !binding.allowedModes.some(option => option.value === mode) || valueEdit && binding.mode !== 'override') return;
        const target = $state.snapshot(row.target);
        void perform('editBindingOverride', true, captured => actions.editBindingOverride!(captured, target, field, mode as DetailBindingMode, value));
    }
    function interfaceDraft(row: ManagerInterface) { return interfaceDrafts[row.id] ?? { label: row.label, artifactKind: row.kind, required: row.required }; }
    function interfaceField(row: ManagerInterface, field: 'label' | 'artifactKind' | 'required', value: string | boolean) { interfaceDrafts = { ...interfaceDrafts, [row.id]: { ...interfaceDraft(row), [field]: value } }; changed(); }
    function editInterface(edit: ManagerInterfaceEdit) {
        if (!view?.definition || !can('editInterface', 'bodyEdit') || !actions.editInterface) return;
        if (edit.kind !== 'add' && !view.definition.interface.some(row => row.id === edit.id)) return;
        if (edit.kind !== 'remove' && !view.definition.kinds.includes(edit.artifactKind)) return;
        void perform('editInterface', true, captured => actions.editInterface!(captured, $state.snapshot(edit)));
    }
    function editParameter(edit: ManagerParameterEdit) {
        if (!view?.definition || !can('editParameter', 'bodyEdit') || !actions.editParameter) return;
        if (edit.kind !== 'add' && !view.definition.parameters.some(row => row.id === edit.id)) return;
        if (edit.kind === 'add' && !view.definition.eligibleTargets.some(row => JSON.stringify(row.target) === JSON.stringify(edit.target))) return;
        void perform('editParameter', true, captured => actions.editParameter!(captured, $state.snapshot(edit)));
    }
    async function perform(key: string, allowed: boolean, call: (captured: LibraryManagerCapture) => ManagerResponse) {
        if (!view || !allowed || pending) return;
        const captured = capture(view), serial = ++sequence, subject = refKey(view.selectedRef);
        pending = key; error = '';
        const current = () => alive && serial === sequence && view?.managerKey === captured.managerKey && view.revision === captured.revision && view.libraryRevision === captured.libraryRevision && scopeKey(view.scope) === scopeKey(captured.scope) && refKey(view.selectedRef) === subject;
        try { const result = await call(captured); if (current()) { pending = ''; error = result.ok ? '' : result.error.code + ': ' + result.error.message; } }
        catch (failure) { if (current()) { pending = ''; error = failure instanceof Error ? failure.message : 'The subgraph change could not be accepted.'; } }
    }
</script>

<section class="pc-manager" aria-label="Manage subgraphs">
    <header><h2>Manage subgraphs</h2>{#if actions.close}<button type="button" onclick={() => actions.close?.()}>Close</button>{/if}</header>
    {#if view}
        <p class="pc-note">{view.scopeLabel}</p>
        <details open><summary>Library</summary>
            <label>Revision<select aria-label="Library revision" value={entry?.key ?? ''} disabled={!actions.selectRef} onchange={event => { const value = event.currentTarget.value, selected = view?.entries.find(item => item.key === value); if (event.currentTarget.selectedIndex >= 0 && view && actions.selectRef && (!value || selected)) actions.selectRef(capture(view), selected ? copyRef(selected.ref) : null); }}><option value="">Select revision…</option>{#each view.entries as item (item.key)}<option value={item.key}>{item.name} · v{item.ref.version} · {item.phase}</option>{/each}</select></label>
            {#if entry}
                <p class="pc-note">Version {entry.ref.version} · {entry.nodeCount} nodes · {entry.wireCount} wires</p>
                <label>Definition name<input aria-label="Definition name" value={name} disabled={!view.permissions.libraryWrite} oninput={event => { name = event.currentTarget.value; changed(); }} /></label>
                <div class="pc-actions">
                    <button type="button" data-subgraph-open-library disabled={!actions.openLibrary} onclick={() => { if (view && entry) actions.openLibrary?.(capture(view), copyRef(entry.ref)); }}>Open definition</button>
                    <button type="button" data-subgraph-rename disabled={!can('renameRevision', 'libraryWrite') || !actions.renameRevision || !name.trim() || !!pending} onclick={() => { const selected = entry, value = name; if (selected && value.trim() && actions.renameRevision) void perform('renameRevision', can('renameRevision', 'libraryWrite'), captured => actions.renameRevision!(captured, copyRef(selected.ref), value)); }}>Save name as revision</button>
                    <button type="button" data-subgraph-duplicate disabled={!can('duplicate', 'libraryWrite') || !actions.duplicate || !name.trim() || !!pending} onclick={() => { const selected = entry, value = name; if (selected && value.trim() && actions.duplicate) void perform('duplicate', can('duplicate', 'libraryWrite'), captured => actions.duplicate!(captured, copyRef(selected.ref), value)); }}>Duplicate</button>
                    <button type="button" data-subgraph-export disabled={!can('exportJSON') || !actions.exportJSON || !!pending} onclick={() => { const selected = entry; if (selected && actions.exportJSON) void perform('exportJSON', can('exportJSON'), captured => actions.exportJSON!(captured, copyRef(selected.ref))); }}>Export .json</button>
                    <button type="button" data-subgraph-remove disabled={!can('removeRevision', 'libraryWrite') || !actions.removeRevision || !!pending} onclick={() => { const selected = entry; if (selected && actions.removeRevision) void perform('removeRevision', can('removeRevision', 'libraryWrite'), captured => actions.removeRevision!(captured, copyRef(selected.ref))); }}>Remove revision</button>
                </div>
                <label>Insert into<select aria-label="Insert destination" value={destination?.key ?? ''} disabled={!actions.selectDestination} onchange={event => { const key = event.currentTarget.value; if (event.currentTarget.selectedIndex >= 0 && view && actions.selectDestination && (!key || view.destinations.some(item => item.key === key))) actions.selectDestination(capture(view), key || null); }}><option value="">Choose editable graph…</option>{#each view.destinations as item (item.key)}<option value={item.key}>{item.label}</option>{/each}</select></label>
                <div class="pc-actions"><button type="button" data-subgraph-insert disabled={!can('insert', 'insert') || !actions.insert || !destination || !!pending} onclick={() => { const selected = entry, target = destination; if (selected && target && actions.insert) void perform('insert', can('insert', 'insert'), captured => actions.insert!(captured, copyRef(selected.ref), target.key)); }}>Insert into {destination?.label ?? 'graph'}</button></div>
            {/if}
            <div class="pc-actions"><button type="button" data-subgraph-import disabled={!can('importJSON', 'libraryWrite') || !actions.importJSON || !!pending} onclick={() => { if (actions.importJSON) void perform('importJSON', can('importJSON', 'libraryWrite'), captured => actions.importJSON!(captured)); }}>Import .json</button></div>
            <p class="pc-note">Shelf revisions are immutable. Removing one keeps placed instances intact.</p>
        </details>
        {#if view.definition}
            <details open><summary>Interface</summary>
                <p class="pc-note">{view.definition.name} · {ownedBody ? 'Owned local definition' : 'Read-only definition'}</p>
                {#if view.definition.description}<p class="pc-note">{view.definition.description}</p>{/if}
                {#each view.definition.interface as row (row.id)}
                    <div class="pc-row"><p class="pc-note">{row.direction} · {row.id} · Boundary {row.boundaryNodeId}</p><div class="pc-port-fields">
                        <label>Label<input aria-label={'Interface label ' + row.id} value={interfaceDraft(row).label} disabled={!can('editInterface', 'bodyEdit') || !actions.editInterface} oninput={event => interfaceField(row, 'label', event.currentTarget.value)} /></label>
                        <label>Kind<select aria-label={'Interface kind ' + row.id} value={interfaceDraft(row).artifactKind} disabled={!can('editInterface', 'bodyEdit') || !actions.editInterface} onchange={event => interfaceField(row, 'artifactKind', event.currentTarget.value)}>{#each view.definition.kinds as kind}<option value={kind}>{kind}</option>{/each}</select></label>
                    </div><label class="pc-check"><input type="checkbox" aria-label={'Required interface ' + row.id} checked={interfaceDraft(row).required} disabled={!can('editInterface', 'bodyEdit') || !actions.editInterface} onchange={event => interfaceField(row, 'required', event.currentTarget.checked)} />Required</label>
                    <div class="pc-actions"><button type="button" data-save-interface disabled={!can('editInterface', 'bodyEdit') || !actions.editInterface || !!pending} onclick={() => editInterface({ kind: 'update', id: row.id, ...interfaceDraft(row) })}>Save port</button><button type="button" data-remove-interface disabled={!can('editInterface', 'bodyEdit') || !actions.editInterface || !!pending} onclick={() => editInterface({ kind: 'remove', id: row.id })}>Remove port</button></div></div>
                {/each}
                {#if can('editInterface', 'bodyEdit')}
                    <div class="pc-port-fields"><label>New port<input aria-label="New interface label" value={newInterface} oninput={event => { newInterface = event.currentTarget.value; changed(); }} /></label><label>Direction<select aria-label="New interface direction" value={newDirection} onchange={event => { const value = event.currentTarget.value; if (value === 'input' || value === 'output') newDirection = value; changed(); }}><option value="input">Input</option><option value="output">Output</option></select></label></div>
                    <label>Kind<select aria-label="New interface kind" value={newKind} onchange={event => { newKind = event.currentTarget.value; changed(); }}>{#each view.definition.kinds as kind}<option value={kind}>{kind}</option>{/each}</select></label>
                    <label class="pc-check"><input type="checkbox" aria-label="New interface required" checked={newRequired} onchange={event => { newRequired = event.currentTarget.checked; changed(); }} />Required</label>
                    <div class="pc-actions"><button type="button" data-add-interface disabled={!newInterface.trim() || !actions.editInterface || !!pending} onclick={() => { if (newInterface.trim()) editInterface({ kind: 'add', label: newInterface, direction: newDirection, artifactKind: newKind, required: newRequired }); }}>Add boundary</button></div>
                {/if}
                <p class="pc-note">Ports keep stable IDs. Connected incompatible edits must be resolved before saving.</p>
            </details>
            <details open><summary>Exposed parameters</summary>
                {#each view.definition.parameters as row (row.id)}
                    <div class="pc-row"><label>Label<input aria-label={'Parameter label ' + row.id} value={parameterLabels[row.id] ?? row.label} disabled={!can('editParameter', 'bodyEdit') || !actions.editParameter} oninput={event => { parameterLabels = { ...parameterLabels, [row.id]: event.currentTarget.value }; changed(); }} /></label><p class="pc-note">{row.target.instancePath.join(' / ')}{row.target.instancePath.length ? ' / ' : ''}{row.target.nodeId} · {row.target.controlId}</p>
                    <div class="pc-actions"><button type="button" data-save-parameter disabled={!can('editParameter', 'bodyEdit') || !actions.editParameter || !!pending} onclick={() => editParameter({ kind: 'update', id: row.id, label: parameterLabels[row.id] ?? row.label })}>Save parameter</button><button type="button" data-remove-parameter disabled={!can('editParameter', 'bodyEdit') || !actions.editParameter || !!pending} onclick={() => editParameter({ kind: 'remove', id: row.id })}>Remove parameter</button></div></div>
                {/each}
                {#if can('editParameter', 'bodyEdit')}
                    <label>New parameter<input aria-label="New parameter label" value={newParameter} oninput={event => { newParameter = event.currentTarget.value; changed(); }} /></label>
                    <label>Target<select aria-label="Exposed parameter target" value={targetKey} onchange={event => { targetKey = event.currentTarget.value; changed(); }}><option value="">Select eligible control…</option>{#each view.definition.eligibleTargets as target (target.key)}<option value={target.key}>{target.label}</option>{/each}</select></label>
                    <div class="pc-actions"><button type="button" data-add-parameter disabled={!newParameter.trim() || !view.definition.eligibleTargets.some(item => item.key === targetKey) || !actions.editParameter || !!pending} onclick={() => { const target = view?.definition?.eligibleTargets.find(item => item.key === targetKey); if (target && newParameter.trim()) editParameter({ kind: 'add', label: newParameter, target: $state.snapshot(target.target) }); }}>Expose parameter</button></div>
                {/if}
                {#if view.definition.exposureNote}<p class="pc-note">{view.definition.exposureNote}</p>{/if}
            </details>
        {/if}
        {#if view.instance}
            <details open><summary>Instance</summary><p class="pc-note">Pinned v{view.instance.ref.version} · {view.instance.owned ? 'Owned local copy' : 'Read-only pinned body'}</p><div class="pc-actions">
                <button type="button" disabled={!actions.openInstance} onclick={() => { if (view?.instance) actions.openInstance?.(capture(view), $state.snapshot(view.instance.address)); }}>Open graph</button>
                <button type="button" data-subgraph-local-copy disabled={!can('makeLocalCopy', 'instanceEdit') || !actions.makeLocalCopy || !!pending} onclick={() => { const item = view?.instance; if (item && actions.makeLocalCopy) void perform('makeLocalCopy', can('makeLocalCopy', 'instanceEdit'), captured => actions.makeLocalCopy!(captured, $state.snapshot(item.address), copyRef(item.ref))); }}>Make local copy</button>
                <button type="button" data-subgraph-unpack disabled={!can('unpack', 'instanceEdit') || !actions.unpack || !!pending} onclick={() => { const item = view?.instance; if (item && actions.unpack) void perform('unpack', can('unpack', 'instanceEdit'), captured => actions.unpack!(captured, $state.snapshot(item.address), copyRef(item.ref))); }}>Unpack</button>
            </div>
            <label>Saved definition name<input aria-label="Saved definition name" value={name} disabled={!can('saveToShelf', 'bodyEdit') || !view.permissions.libraryWrite} oninput={event => { name = event.currentTarget.value; changed(); }} /></label>
            <label>Save to shelf<select aria-label="Shelf save mode" value={saveMode} disabled={!can('saveToShelf', 'bodyEdit') || !view.permissions.libraryWrite} onchange={event => { const value = event.currentTarget.value; if (value === 'new' || value === 'revision') saveMode = value; changed(); }}><option value="new">New entry with private identity</option><option value="revision">Revision of selected entry</option></select></label>
            {#if saveMode === 'revision'}<label>Revision target<select aria-label="Shelf revision target" value={saveTargetKey} disabled={!can('saveToShelf', 'bodyEdit') || !view.permissions.libraryWrite} onchange={event => { saveTargetKey = event.currentTarget.value; changed(); }}><option value="">Select exact shelf revision…</option>{#each view.entries as item (item.key)}<option value={item.key}>{item.name} · v{item.ref.version}</option>{/each}</select></label>{/if}
            <div class="pc-actions"><button type="button" data-subgraph-save-shelf disabled={!can('saveToShelf', 'bodyEdit') || !view.permissions.libraryWrite || !view.instance.owned || !actions.saveToShelf || !name.trim() || (saveMode === 'revision' && !view.entries.some(item => item.key === saveTargetKey)) || !!pending} onclick={() => { const target = view?.entries.find(item => item.key === saveTargetKey), mode = saveMode, value = name; if (view?.instance?.owned && view.permissions.libraryWrite && value.trim() && (mode === 'new' || target) && actions.saveToShelf) void perform('saveToShelf', can('saveToShelf', 'bodyEdit'), captured => actions.saveToShelf!(captured, mode, mode === 'revision' && target ? copyRef(target.ref) : null, value)); }}>Save definition to shelf</button></div>
            <p class="pc-note">Instance overrides remain on the wrapper. Saving does not bake them into the definition.</p></details>
            {#if view.instance.parameters.length}<details open><summary>Parameter overrides</summary>
                {#each view.instance.parameters as row (row.id)}
                    {@const control = row.control}
                    <div class="pc-row"><label>{row.label}
                        {#if control.editor === 'boolean'}<input type="checkbox" aria-label={'Override ' + row.label} checked={overrideDraft(row.id, control) === true} disabled={!can('editParameterOverride', 'instanceEdit') || !actions.editParameterOverride} onchange={event => overrideField(row.id, event.currentTarget.checked)} />
                        {:else if control.editor === 'json' || control.editor === 'lines'}<textarea aria-label={'Override ' + row.label} value={String(overrideDraft(row.id, control))} disabled={!can('editParameterOverride', 'instanceEdit') || !actions.editParameterOverride} oninput={event => overrideField(row.id, event.currentTarget.value)}></textarea>
                        {:else if control.editor === 'enum'}<select aria-label={'Override ' + row.label} value={String(overrideDraft(row.id, control))} disabled={!can('editParameterOverride', 'instanceEdit') || !actions.editParameterOverride} onchange={event => overrideField(row.id, event.currentTarget.value)}>{#each control.options ?? [] as option}<option value={option.value}>{option.label}</option>{/each}</select>
                        {:else}<input type={control.editor === 'number' ? 'number' : 'text'} aria-label={'Override ' + row.label} value={String(overrideDraft(row.id, control))} min={control.min} max={control.max} disabled={!can('editParameterOverride', 'instanceEdit') || !actions.editParameterOverride} oninput={event => overrideField(row.id, event.currentTarget.value)} />{/if}
                    </label><p class="pc-note">{row.overridden ? 'Saved instance override' : 'Inherited definition value'}{control.effective ? ' · Effective: ' + control.effective : ''}{control.source ? ' · ' + control.source : ''}</p>
                    <div class="pc-actions"><button type="button" data-save-override={row.id} disabled={!can('editParameterOverride', 'instanceEdit') || !actions.editParameterOverride || !!pending} onclick={() => saveOverride(row.id)}>Save override</button><button type="button" data-reset-override={row.id} disabled={!can('editParameterOverride', 'instanceEdit') || !actions.editParameterOverride || !row.overridden || !!pending} onclick={() => { if (view?.instance?.parameters.find(item => item.id === row.id)?.overridden) saveOverride(row.id, true); }}>Use definition value</button></div></div>
                {/each}
            </details>{/if}
            {#if view.instance.bindings.length}<details open data-instance-model><summary>Model bindings</summary>
                {#each view.instance.bindings as row (row.key)}
                    <div class="pc-row"><p>{row.label}</p>
                        <label>Connection mode<select aria-label={'Connection mode ' + row.key} value={row.profile.mode} disabled={!row.editable || !can('editBindingOverride', 'instanceEdit') || !actions.editBindingOverride || !!pending} onchange={event => bindingChange(row.key, 'profileId', event.currentTarget.value, row.profile.value)}>{#each row.profile.allowedModes as option}<option value={option.value}>{option.label}</option>{/each}</select></label>
                        {#if row.profile.mode === 'override'}<label>Saved connection{#if row.profile.options?.length}<select aria-label={'Connection override ' + row.key} value={row.profile.value ?? ''} disabled={!row.editable || !can('editBindingOverride', 'instanceEdit') || !actions.editBindingOverride || !!pending} onchange={event => bindingChange(row.key, 'profileId', 'override', event.currentTarget.value, true)}><option value="">Select connection…</option>{#each row.profile.options as option}<option value={option.value}>{option.label}</option>{/each}</select>{:else}<input aria-label={'Connection override ' + row.key} value={row.profile.value ?? ''} disabled={!row.editable || !can('editBindingOverride', 'instanceEdit') || !actions.editBindingOverride || !!pending} onchange={event => bindingChange(row.key, 'profileId', 'override', event.currentTarget.value, true)} />{/if}</label>{/if}
                        <label>Model mode<select aria-label={'Model mode ' + row.key} value={row.model.mode} disabled={!row.editable || !can('editBindingOverride', 'instanceEdit') || !actions.editBindingOverride || !!pending} onchange={event => bindingChange(row.key, 'model', event.currentTarget.value, row.model.value)}>{#each row.model.allowedModes as option}<option value={option.value}>{option.label}</option>{/each}</select></label>
                        {#if row.model.mode === 'override'}<label>Saved model<input aria-label={'Model override ' + row.key} value={row.model.value ?? ''} disabled={!row.editable || !can('editBindingOverride', 'instanceEdit') || !actions.editBindingOverride || !!pending} onchange={event => bindingChange(row.key, 'model', 'override', event.currentTarget.value, true)} /></label>{/if}
                        <p class="pc-note">Effective: {row.effective} · {row.source}</p>{#if row.issue}<p class="pc-error">{row.issue}</p>{/if}
                    </div>
                {/each}
            </details>{/if}
            {#if view.update}<details open><summary>Update instance</summary>
                <label>Target revision<select aria-label="Instance update revision" value={updateTarget?.key ?? ''} disabled={!view.permissions.instanceEdit || !actions.selectUpdateRef} onchange={event => { const key = event.currentTarget.value, target = view?.update?.choices.find(item => item.key === key); if (event.currentTarget.selectedIndex >= 0 && view && view.permissions.instanceEdit && view.scope.kind === 'graph' && actions.selectUpdateRef && (!key || target)) actions.selectUpdateRef(capture(view), target ? copyRef(target.ref) : null); }}><option value="">Choose exact revision…</option>{#each view.update.choices as target (target.key)}<option value={target.key}>{target.label}</option>{/each}</select></label>
                {#each mapKinds as kind}<details open><summary>{mapLabels[kind]}</summary>{#each view.update[kind] as row (row.from)}<label>{row.label}<select aria-label={'Mapping ' + kind + ' ' + row.from} data-map-kind={kind} value={JSON.stringify(Object.hasOwn(updateMaps[kind], row.from) ? updateMaps[kind][row.from] : row.to)} disabled={!can('prepareUpdate', 'instanceEdit') || !actions.prepareUpdate} onchange={event => mapping(kind, row.from, event.currentTarget.value)}>{#each row.options as option}<option value={JSON.stringify(option.id)}>{option.label}</option>{/each}{#if row.canDrop}<option value="null">Drop override</option>{/if}</select></label>{/each}{#if !view.update[kind].length}<p class="pc-note">No mappings.</p>{/if}</details>{/each}
                {#each view.update.summary as text}<p class="pc-note">{text}</p>{/each}
                {#if mappingsChanged}<p class="pc-note">Mappings changed. Prepare the update before accepting.</p>{/if}
                <div class="pc-actions"><button type="button" data-prepare-instance-update disabled={!can('prepareUpdate', 'instanceEdit') || !actions.prepareUpdate || !updateTarget || !!pending} onclick={() => updateInstance(false)}>Prepare update</button><button type="button" data-accept-instance-update disabled={!can('acceptUpdate', 'instanceEdit') || !actions.acceptUpdate || !view.update.preparedKey || !updateTarget || mappingsChanged || !!pending} onclick={() => updateInstance(true)}>Accept prepared update</button></div>
            </details>{/if}
        {/if}
        {#if view.selection}<details open><summary>Create subgraph</summary><p class="pc-note">{view.selection.label}</p><label>Name<input aria-label="Selection subgraph name" value={conversionName} disabled={!can('convertSelection', 'bodyEdit')} oninput={event => { conversionName = event.currentTarget.value; changed(); }} /></label><div class="pc-actions"><button type="button" data-subgraph-convert-selection disabled={!can('convertSelection', 'bodyEdit') || !actions.convertSelection || !conversionName.trim() || !view.selection.nodeIds.length || !!pending} onclick={() => { const ids = view?.selection?.nodeIds, value = conversionName; if (ids?.length && value.trim() && actions.convertSelection) void perform('convertSelection', can('convertSelection', 'bodyEdit'), captured => actions.convertSelection!(captured, [...ids], value)); }}>Convert selection</button></div></details>{/if}
        {#if view.issue}<p class="pc-error">{view.issue}</p>{/if}
        {#if error}<p class="pc-error" role="alert">{error}</p>{/if}
        {#if pending}<p class="pc-note" role="status">Preparing change…</p>{/if}
    {:else}<p class="pc-note">Open a graph to manage subgraphs.</p>{/if}
</section>

<style>
    .pc-manager { box-sizing: border-box; width: 390px; max-width: 100%; padding: 14px; border: 1px solid #41433b; border-radius: 4px; background: var(--pc-manager-background, #222321); color: #d3d3d3; box-shadow: inset 0 1px #ffffff08, inset 0 -1px #0005, 0 8px 28px #0005; font-size: 12px; }
    header { display: flex; align-items: center; gap: 8px; margin-bottom: 9px; } h2 { margin: 0 auto 0 0; font-size: 14px; font-weight: 600; }
    details { margin-top: 8px; padding: 9px 0 10px; border-top: 1px solid #41433b; } details:first-of-type { border-top: 0; } summary { color: #aab0a6; cursor: pointer; }
    label { display: block; margin-top: 10px; } input:not([type='checkbox']), select, textarea { display: block; box-sizing: border-box; width: 100%; margin-top: 5px; padding: 6px 8px; border: 1px solid #43453e; border-radius: 2px; background: #1a1b19; color: #dededb; font: inherit; box-shadow: inset 0 1px 3px #0005; } textarea { min-height: 64px; resize: vertical; line-height: 1.4; }
    .pc-port-fields { display: grid; grid-template-columns: minmax(0, 1fr) 112px; gap: 8px; } .pc-row { margin-top: 10px; } .pc-check { display: flex; align-items: center; gap: 6px; } input[type='checkbox'] { accent-color: var(--SmartThemeQuoteColor, #e18a24); }
    .pc-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; } button { padding: 5px 8px; border: 1px solid #45473f; border-radius: 2px; background: #353632; color: #d3d3d3; font: inherit; cursor: pointer; box-shadow: inset 0 1px #ffffff08, 0 1px #0004; }
    button:hover:not(:disabled) { background: #40413b; } :is(button,input,select,textarea,summary):focus-visible { outline: 2px solid var(--SmartThemeQuoteColor, #e18a24); outline-offset: 1px; } :disabled { opacity: .5; cursor: default; }
    .pc-note { margin: 10px 0 0; color: #989d96; overflow-wrap: anywhere; } .pc-error { color: #e58d94; overflow-wrap: anywhere; }
    @media (max-width: 480px) { .pc-port-fields { grid-template-columns: 1fr; } }
</style>
