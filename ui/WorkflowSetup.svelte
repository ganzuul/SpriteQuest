<script lang="ts">
    import type { WorkbenchActions, WorkflowView } from './types';
    let { view, actions }: { view?: WorkflowView; actions: WorkbenchActions } = $props();
</script>
{#if view}
        <h3>{view.name}</h3>
        <p>{view.phase === 'pre' ? 'Guidance helps SillyTavern plan its normal reply.' : 'Review a revision of the latest completed assistant reply.'}</p>
        <p>Maximum auxiliary requests: {view.callBound}</p>
        {#each view.roles as role (role.name)}
            <label>{role.name} connection<select class="text_pole" aria-label={role.name + ' connection'} value={role.profileId} onchange={(event) => actions.workflowSetup?.bindRole(role.name, event.currentTarget.value, role.model)}><option value="">Choose a connection</option>{#each view.profiles as profile (profile.id)}<option value={profile.id}>{profile.name}</option>{/each}</select></label>
            <label>{role.name} model override<input class="text_pole" value={role.model} placeholder="Use profile model" oninput={(event) => actions.workflowSetup?.bindRole(role.name, role.profileId, event.currentTarget.value)} /></label>
        {/each}
        <button type="button" class="pc-btn menu_button" onclick={() => actions.workflowSetup?.assign(view?.phase || '')}>Assign {view.phase} phase</button>
        <p>{view.assigned ? 'Assigned to this phase.' : 'Phase is not assigned.'} Arming is a separate action.</p>
        {#each view.issues as issue}<p class="pc-error">{issue}</p>{/each}
    <h3>Workflow examples</h3>
    {#each view.starters as starter (starter.id)}
        <article class="pc-workflow-starter"><strong>{starter.title}</strong><p>{starter.purpose}</p><small>{starter.phase === 'pre' ? 'Before reply' : 'After reply'} · Maximum {starter.callBound} auxiliary requests</small><button type="button" class="pc-btn menu_button" onclick={() => actions.workflowSetup?.install(starter.id)}>Install {starter.title}</button></article>
    {/each}
{/if}
