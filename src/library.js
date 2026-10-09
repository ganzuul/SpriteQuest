/** Validated reusable Lattice subgraphs; persistence never edits placed snapshots. */
import { settings, save } from './state.js?v=0.26.0';
import { cloneDefinitionData } from './workflow/definitions.js?v=0.26.0';
import { validateGraphStructure } from './workflow/contracts.js?v=0.26.0';
import { installDefinition, createRevision, removeLibraryEntry } from './workflow/definition-library.js?v=0.26.0';
const subgraphCaches = new WeakMap();
const libraryFailure = (code, message) => Object.freeze({ ok: false, error: Object.freeze({ code, message }) });

/** Explicit load/manager refresh. Invalid shelf data remains available for manager recovery;
 * placed workflow snapshots and execution are independent of this result.
 */
export function loadSubgraphLibrary() {
    const s = settings(), property = Object.getOwnPropertyDescriptor(s, 'subgraphLibrary');
    const copied = property && 'value' in property ? cloneDefinitionData(property.value) : libraryFailure('DEFINITION_DATA', 'The saved subgraph library must be plain data.');
    let result = copied;
    if (copied.ok) {
        const library = copied.data;
        if (!library || typeof library !== 'object' || Array.isArray(library) || Object.keys(library).length !== 1 || !library.definitions || typeof library.definitions !== 'object' || Array.isArray(library.definitions)) result = libraryFailure('DEFINITION_DATA', 'Expected a saved definition table.');
        else {
            const checked = validateGraphStructure({ schema: 3, runtime: 2, mode: 'native-pre', nodes: {}, wires: {}, definitions: library.definitions });
            result = checked.ok ? Object.freeze({ ok: true, data: library }) : libraryFailure(checked.error.code, checked.error.message);
        }
    } else result = libraryFailure(copied.error.code, copied.error.message);
    subgraphCaches.set(s, result);
    return result;
}

/** Cheap projection only. The manager explicitly loads once and refreshes after changes. */
export function getSubgraphLibrary() {
    return subgraphCaches.get(settings()) ?? libraryFailure('LIBRARY_NOT_LOADED', 'Load the subgraph library before displaying it.');
}

function changeSubgraphLibrary(prepare) {
    const loaded = loadSubgraphLibrary(); if (!loaded.ok) return loaded;
    const result = prepare(loaded.data); if (!result.ok || !result.data.changed) return result;
    const s = settings();
    // Persist a separate copy. No root touch, history step, run cancellation or authority change.
    try { s.subgraphLibrary = structuredClone(result.data.library); }
    catch { return libraryFailure('LIBRARY_READ_ONLY', 'The saved subgraph library is read-only.'); }
    subgraphCaches.set(s, Object.freeze({ ok: true, data: result.data.library }));
    save(); return result;
}

export function installSubgraphDefinition(definition, snapshots = {}) {
    return changeSubgraphLibrary(library => installDefinition(library, definition, snapshots));
}
export function reviseSubgraphDefinition(draft, snapshots = {}) {
    return changeSubgraphLibrary(library => createRevision(library, draft, snapshots));
}
export function removeSubgraphDefinition(ref) {
    return changeSubgraphLibrary(library => removeLibraryEntry(library, ref));
}
