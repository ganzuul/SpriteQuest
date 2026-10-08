// Svelte's DOM runtime expects the standard browser constructors. Existing
// tests create their own jsdom window; getters follow that window per process.
for (const key of ['Node', 'Element', 'Text', 'Comment', 'Document', 'HTMLDivElement', 'HTMLMediaElement', 'HTMLInputElement', 'HTMLSelectElement', 'HTMLOptionElement', 'HTMLFormElement', 'SVGElement', 'MutationObserver']) {
    if (!(key in globalThis)) Object.defineProperty(globalThis, key, { configurable: true, get: () => globalThis.window?.[key] });
}
