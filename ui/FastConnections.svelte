<script lang="ts">
    import { untrack } from 'svelte';
    import type { FastConnectionsView, FastConnectionsActions, FastProvider, FastSettingsResult } from './fast-connections-types';
    let { view, actions = {}, close }: { view: FastConnectionsView; actions?: FastConnectionsActions; close: () => void } = $props();
    let selected = $state(''), id = $state(''), label = $state(''), provider = $state<FastProvider>('jev'), model = $state(''), endpoint = $state(''), sessionKey = $state('');
    let busy = $state(false), message = $state(''), issue = $state(''), owner = $state(untrack(() => view.userId));
    let scopeRevision = 0;
    const current = $derived(view.connections.find(connection => connection.id === selected));
    function resetScope() { scopeRevision++; owner = view.userId; choose(''); issue = 'The active user changed. Choose a connection for this user.'; }
    $effect(() => { if (owner !== view.userId) resetScope(); });
    function captureScope() { if (owner !== view.userId) { resetScope(); return null; } const revision = scopeRevision, userId = owner; return { userId, current: () => scopeRevision === revision && owner === userId && view.userId === userId }; }
    function choose(value: string) {
        selected = value; sessionKey = ''; message = ''; issue = '';
        const connection = view.connections.find(item => item.id === value);
        id = connection?.id ?? ''; label = connection?.label ?? ''; provider = connection?.provider ?? 'jev'; model = connection?.model ?? ''; endpoint = connection?.endpoint ?? '';
    }
    function result(value: FastSettingsResult | undefined) {
        if (value?.ok) message = value.data?.message ?? 'Connection settings updated.';
        else issue = value?.error.message ?? 'Fast connection settings are unavailable.';
    }
    async function save() {
        if (busy || !actions.save) return;
        const scope = captureScope(); if (!scope) return;
        const password = sessionKey; sessionKey = ''; busy = true; message = ''; issue = '';
        const configuration = { id, label: label || id, provider, model, ...(provider === 'jev' ? {} : { endpoint }) };
        try { const saved = await actions.save(configuration, password, scope.userId); if (scope.current()) { result(saved); if (saved.ok) selected = configuration.id; } }
        catch { if (scope.current()) issue = 'Fast connection settings could not be updated.'; }
        finally { busy = false; }
    }
    async function remove() {
        if (!selected || busy || !actions.remove) return;
        const scope = captureScope(); if (!scope) return;
        sessionKey = ''; busy = true; issue = ''; message = '';
        try { const removed = await actions.remove(selected, scope.userId); if (scope.current()) { if (removed.ok) choose(''); result(removed); } }
        catch { if (scope.current()) issue = 'The connection could not be removed.'; } finally { busy = false; }
    }
    async function clearKey() {
        if (!selected || busy || !actions.clearCredential) return;
        const scope = captureScope(); if (!scope) return;
        sessionKey = ''; busy = true; issue = ''; message = '';
        try { const cleared = await actions.clearCredential(selected, scope.userId); if (scope.current()) result(cleared); }
        catch { if (scope.current()) issue = 'The session key could not be cleared.'; } finally { busy = false; }
    }
</script>
<section class="pc-fast-connections" aria-label="Fast connection setup">
    <p>Configure a typed Jev, Laya or compatible model for Fast Decision. Node settings keep only the connection ID.</p>
    <label>Configured Fast connection<select aria-label="Configured Fast connection" value={selected} disabled={busy} onchange={event => choose(event.currentTarget.value)}><option value="">New connection</option>{#each view.connections as connection (connection.id)}<option value={connection.id}>{connection.label} · {connection.provider} · {connection.model}</option>{/each}</select></label>
    <div class="pc-fast-fields">
        <label>Connection ID<input aria-label="Connection ID" value={id} maxlength="128" disabled={busy || !!selected} oninput={event => id = event.currentTarget.value} /></label>
        <label>Connection name<input aria-label="Connection name" value={label} maxlength="256" disabled={busy} oninput={event => label = event.currentTarget.value} /></label>
        <label>Provider<select aria-label="Provider" value={provider} disabled={busy} onchange={event => { provider = event.currentTarget.value as FastProvider; }}><option value="jev">Jev API</option><option value="laya">Laya</option><option value="compatible">Compatible typed API</option></select></label>
        <label>Typed model<input aria-label="Typed model" value={model} maxlength="256" disabled={busy} oninput={event => model = event.currentTarget.value} /></label>
    </div>
    <label>Typed endpoint<input aria-label="Typed endpoint" value={provider === 'jev' ? 'https://api.typesafe.ai/v1/systemone' : endpoint} readonly={provider === 'jev'} disabled={busy} type="url" maxlength="2048" oninput={event => endpoint = event.currentTarget.value} /></label>
    <small>{provider === 'jev' ? 'Jev uses its fixed SystemOne endpoint and requires a session API key.' : 'Enter the complete /v1/systemone route using HTTPS or HTTP on localhost. A session key is optional for an unauthenticated local service.'}</small>
    <label>Session API key<input aria-label="Session API key" type="password" autocomplete="new-password" spellcheck="false" value={sessionKey} maxlength="8192" disabled={busy} oninput={event => sessionKey = event.currentTarget.value} /></label>
    <small>Keys are session-only. Re-enter them after restarting SillyTavern. Leave this field empty to keep an existing session key.</small>
    {#if current}<p class="pc-fast-key-status">Session key: {current.credentialReady ? 'ready' : 'not entered'}</p>{/if}
    {#if view.issue || issue}<p role="alert">{issue || view.issue}</p>{/if}
    {#if message}<p role="status">{message}</p>{/if}
    <footer><button type="button" disabled={busy || !actions.save || !!view.issue} onclick={save}>{busy ? 'Applying…' : 'Save connection'}</button><button type="button" disabled={busy || !current?.credentialReady || !actions.clearCredential} onclick={clearKey}>Clear session key</button><button type="button" disabled={busy || !selected || !actions.remove} onclick={remove}>Remove connection</button><button type="button" onclick={() => { sessionKey = ''; close(); }}>Close</button></footer>
</section>
<style>
    .pc-fast-connections { min-width: 0; font-size: 12px; color: var(--pc-text); }
    p, small { line-height: 1.5; overflow-wrap: anywhere; } p { color: var(--pc-muted); } small { display: block; font-size: 11px; color: var(--pc-muted); }
    label { display: block; margin: 10px 0 5px; font-size: 11px; }
    input, select { display: block; width: 100%; box-sizing: border-box; margin-top: 4px; padding: 6px; background: var(--pc-field); color: var(--pc-text); border: 1px solid var(--pc-border); border-radius: 2px; font: inherit; }
    .pc-fast-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 0 12px; }
    footer { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 15px; }
    button { padding: 5px 8px; border: 1px solid var(--pc-border); border-radius: 2px; background: var(--pc-control); color: var(--pc-text); font: inherit; cursor: pointer; }
    :is(button, input, select):focus-visible { outline: 2px solid var(--pc-accent); outline-offset: 1px; } :disabled { opacity: .55; cursor: default; }
    [role='alert'] { color: var(--pc-error); } [role='status'] { color: var(--pc-text); }
    @media (max-width: 550px) { .pc-fast-fields { grid-template-columns: 1fr; } }
</style>
