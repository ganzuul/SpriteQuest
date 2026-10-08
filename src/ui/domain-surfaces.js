/** Explicit adapters for specialized native domain editors inside stable Svelte surfaces. */
export function createDomainSurfaces({ renderLibrary, renderInspector, refreshPreview, openState, renderTheme, openModel }) {
    return {
        library: { render: renderLibrary },
        inspector: { render: renderInspector },
        preview: { refresh: refreshPreview },
        state: { open: openState },
        theme: { render: renderTheme },
        model: { open: openModel },
    };
}
