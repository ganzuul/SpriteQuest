<script lang="ts">
    import type { WorkflowView, WorkflowActions } from './types';
    let { actions, mode = 'setup' }: { actions: WorkflowActions; mode?: string } = $props();
    let view = $state.raw<WorkflowView | null>(null);
    let ruleDraft = $state<{ text: string; error: string } | null>(null);
    export function update(value: WorkflowView) {
        if (value.graphId !== view?.graphId || value.selectedId !== view?.selectedId) ruleDraft = null;
        view = value;
    }
    const lines = (value: string) => value.split('\n').filter(line => line.trim());
    function editRules(id: string, text: string) {
        const error = actions.editRules(id, text);
        ruleDraft = error ? { text, error } : null;
    }
</script>
{#if view}
<section class="pc-workflows" data-pc-workflows={mode} aria-label={mode === 'library' ? 'Workflow library' : 'Workflow setup and review'}>
{#if mode === 'library'}
    <label>Workflow mode
        <select aria-label="Workflow mode" class="text_pole" value={view.workflowMode} onchange={(event) => actions.setMode(event.currentTarget.value)}>
            <option value="legacy">Legacy · Replace prompt</option><option value="native">Native · Guidance and reviewed reply</option>
        </select>
    </label>
    <h3>Workflow examples</h3>
    {#each view.starters as starter (starter.id)}
        <article class="pc-workflow-starter">
            <strong>{starter.title}</strong><p>{starter.purpose}</p>
            <small>{starter.phase === 'pre' ? 'Before reply · Guidance' : 'After reply · Reviewed reply'} · Roles: {starter.roles.join(', ')} · Maximum {starter.callBound} auxiliary requests</small>
            <button class="menu_button" onclick={() => actions.install(starter.id)}>Install {starter.title}</button>
        </article>
    {/each}
    <h3>Node families</h3>
    {#each view.families as family (family.name)}
        <details class="pc-workflow-family" open={view.native}>
            <summary>{family.name}</summary><p>{family.description}</p>
            {#if family.name === 'Transpose'}<small>No supported operations yet. Reference-based voice matching is a future candidate.</small>{/if}
            {#each family.operations as op (op.id)}
                <button class="menu_button" disabled={!view.native || !op.compatible} title={!view.native ? 'Install a native example first; legacy controls remain below.' : !op.compatible ? 'This operation requires the ' + op.phase + ' phase.' : 'Add operation'} onclick={() => actions.addNode(op.id)}>{op.title} <small>· {op.phase}</small></button>
            {/each}
            {#if !view.native}
                {#each family.legacy as node (node.id)}
                    <button class="menu_button" aria-label={'Add legacy ' + node.title} draggable="true" ondragstart={(event) => event.dataTransfer?.setData('application/x-prompt-canvas', JSON.stringify({ kind: 'block', type: node.id }))} onclick={() => actions.addLegacyNode(node.id)}>{node.title} <small>· legacy</small></button>
                {/each}
            {/if}
        </details>
    {/each}
{:else}
    <h3>{view.name}</h3>
    <p>{view.phase === 'pre' ? 'Guidance helps SillyTavern plan its normal reply.' : 'Review a revision of the latest completed assistant reply.'}</p>
    <strong>Maximum auxiliary requests: {view.callBound}</strong>
    {#each view.roles as role (role.name)}
        <label>{role.name} connection
            <select aria-label={role.name + ' connection'} class="text_pole" value={role.profileId} onchange={(event) => actions.bindRole(role.name, event.currentTarget.value, role.model)}>
                <option value="">Choose a connection</option>
                {#each view.profiles as profile (profile.id)}<option value={profile.id}>{profile.name}</option>{/each}
            </select>
        </label>
        <label>{role.name} model override<input class="text_pole" value={role.model} oninput={(event) => actions.bindRole(role.name, role.profileId, event.currentTarget.value)} placeholder="Use profile model" /></label>
    {/each}
    <button class="menu_button" onclick={() => actions.assign(view?.phase || '')}>Assign {view.phase} phase and enable native mode</button>
    <small>{view.assigned ? 'Assigned to this phase.' : 'Phase is not assigned.'} Mode: {view.workflowMode}. Arming is a separate action.</small>
    {#each view.issues as issue}<p class="pc-error">{issue}</p>{/each}
    <button class="menu_button" disabled={view.busy || !!view.issues.length || !!ruleDraft} onclick={() => actions.run()}>{view.busy ? 'Running…' : view.phase === 'pre' ? 'Test workflow' : 'Run reviewed repair'}</button>
    {#if view.phase === 'pre'}<small>Test workflow does not publish guidance. A later Send reruns the workflow and may incur up to {view.callBound} auxiliary requests again.</small>{/if}
    {#each view.groups as group (group.id)}
        <button class="menu_button" onclick={() => actions.expand(group.id)}>{group.collapsed ? 'Open' : 'Fold'} {group.title} formation · Surface · maximum {group.callBound} {group.callBound === 1 ? 'request' : 'requests'}</button>
    {/each}
    <h4>Inspect operations</h4>
    {#each view.nodes as node (node.id)}
        <button class="menu_button" aria-pressed={view.selectedId === node.id} onclick={() => actions.inspect(node.id)}>Inspect {node.title}</button>
        {#if node.id === view.selectedId}
            <div class="pc-workflow-editor">
                <p>{node.family} · {node.phase} phase · {node.input} → {node.output}</p>
                <p>Canonical type: {node.canonicalTitle}</p>
                <label>Alias<input class="text_pole" data-alias maxlength="80" value={node.alias} oninput={(event) => actions.presentNode(node.id, 'alias', event.currentTarget.value)} /></label>
                <button class="menu_button" onclick={() => actions.presentNode(node.id, 'alias', '')}>Reset alias</button>
                <label><input type="checkbox" checked={node.compact} onchange={(event) => actions.presentNode(node.id, 'compact', event.currentTarget.checked)} /> Compact card</label>
                <label><input type="checkbox" checked={node.enabled} onchange={(event) => actions.updateNode(node.id, 'enabled', event.currentTarget.checked)} /> Enabled</label>
                <small>Disabled operations block preflight; they do not bypass.</small>
                {#if node.modelRole}
                    <label>Model role<input class="text_pole" value={node.modelRole} oninput={(event) => actions.updateNode(node.id, 'modelRole', event.currentTarget.value)} /></label>
                    <label>Node connection override<select class="text_pole" value={node.profileId} onchange={(event) => actions.updateNode(node.id, 'profileId', event.currentTarget.value || null)}><option value="">Use role binding</option>{#each view.profiles as profile (profile.id)}<option value={profile.id}>{profile.name}</option>{/each}</select></label>
                    <label>Node model override<input class="text_pole" value={node.model} placeholder="Use bound model" oninput={(event) => actions.updateNode(node.id, 'model', event.currentTarget.value || null)} /></label>
                    <small>Effective connection: {node.effective}</small>
                {/if}
                {#each node.controls as control (control.key)}
                    <label>{control.label}
                    {#if control.options}
                        <select class="text_pole" value={String(control.value)} onchange={(event) => actions.updateNode(node.id, control.key, event.currentTarget.value)}>{#each control.options as option}<option value={option}>{option}</option>{/each}</select>
                    {:else if control.kind === 'boolean'}
                        <input type="checkbox" checked={Boolean(control.value)} onchange={(event) => actions.updateNode(node.id, control.key, event.currentTarget.checked)} />
                    {:else if control.kind === 'number'}
                        <input aria-label={control.label} class="text_pole" type="number" min={control.key === 'keepRecent' ? 0 : 1} value={Number(control.value)} oninput={(event) => actions.updateNode(node.id, control.key, Number(event.currentTarget.value))} />
                    {:else if control.kind === 'rules'}
                        <textarea aria-label={control.label} aria-invalid={!!ruleDraft} aria-describedby={'rule-help-' + node.id + (ruleDraft ? ' rule-error-' + node.id : '')} class="text_pole" value={ruleDraft?.text ?? String(control.value)} oninput={(event) => editRules(node.id, event.currentTarget.value)}></textarea>
                    {:else}
                        <textarea class="text_pole" value={String(control.value)} oninput={(event) => actions.updateNode(node.id, control.key, control.kind === 'lines' ? lines(event.currentTarget.value) : event.currentTarget.value)}></textarea>
                    {/if}
                    </label>
                    {#if control.kind === 'rules'}
                        <small id={'rule-help-' + node.id}>One literal phrase per line. Imported objects use one JSON object per line with a "phrase" field; keep their other fields to preserve metadata. Quote a literal phrase that starts with &#123;, [ or &quot; as a JSON string.</small>
                        {#if ruleDraft}<p id={'rule-error-' + node.id} class="pc-error" role="alert">{ruleDraft.error}</p>{/if}
                    {/if}
                {/each}
                <button class="menu_button" onclick={() => actions.duplicate(node.id)}>Duplicate operation</button>
                <button class="menu_button pc-danger" onclick={() => actions.remove(node.id)}>Delete operation</button>
                {#if node.operation === 'smart-compactor'}<small>Protected literal pins reserve every source message containing an exact match verbatim. A missing pin reports PIN_MISSING. Source IDs are for inspection.</small>{/if}
                {#if node.operation === 'pattern-scan'}<small>{view.quoteHelp}</small>{/if}
            </div>
        {/if}
    {/each}
    {#if view.status}<p role="status">{view.status}</p>{/if}
    {#if view.result}
        <h4 class="pc-workflow-result">Workflow result</h4>
        {#if view.result.error}<p class="pc-error">{view.result.error}</p>{/if}
        <p>Actual auxiliary requests: {view.result.actualCalls} / {view.result.callBound}</p>
        <p>Token count method: {view.result.tokenMethods.join(', ') || 'Not reported'}</p>
        {#if view.result.guidance}<h4>Computed guidance</h4><pre>{view.result.guidance}</pre>{/if}
        {#if view.result.applyAvailable}
            <div class="pc-workflow-comparison"><div>Original<pre>{view.result.original}</pre></div><div>Candidate<pre>{view.result.candidate}</pre></div></div>
            {#if view.result.applyIssue}<p class="pc-error">{view.result.applyIssue}</p>{/if}
            <button class="menu_button" disabled={view.busy || !!view.result.applyIssue || !!ruleDraft} onclick={() => actions.apply()}>Apply reviewed candidate</button>
            <button class="menu_button" disabled={view.busy} onclick={() => actions.reject()}>Reject candidate</button>
            <small>Apply rechecks source freshness. Other memory extensions may already have consumed the original; saving does not confirm durability.</small>
        {/if}
        <details><summary>Findings and changes</summary><pre>{JSON.stringify({ findings: view.result.findings, changes: view.result.changes }, null, 2)}</pre></details>
        <details><summary>Reports and request trace</summary><pre>{JSON.stringify({ reports: view.result.reports, calls: view.result.calls }, null, 2)}</pre></details>
    {/if}
{/if}
</section>
{/if}
