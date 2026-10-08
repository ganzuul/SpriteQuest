/** Domain projections shared by every card in one graph revision. No UI runtime dependency. */
export function createGraphAnalysis({ counts, levels, group }) {
    const cache = new WeakMap();
    return {
        prepare(graph) {
            if (!graph) return { counts: new Map(), waves: [], waveById: new Map() };
            // Deliberately exclude view, tokens and trace. Graph mutations also occur
            // before touchGraph(), so a timestamp alone cannot identify a revision.
            const key = JSON.stringify([graph.nodes, graph.wires, graph.groups ?? {}]);
            const previous = cache.get(graph);
            if (previous?.key === key) return previous.value;
            if (graph.schema === 2) {
                const value = { counts: new Map(), waves: [], waveById: new Map() }; cache.set(graph, { key, value }); return value;
            }
            const waves = levels(graph);
            const total = waves.reduce((n, wave) => n + wave.length, 0);
            const waveById = new Map();
            for (const [i, wave] of waves.entries()) for (const node of wave) {
                const tiedIds = group(graph, node.id);
                const tied = wave.some(other => other.id !== node.id && tiedIds.has(other.id));
                waveById.set(node.id, { wave: i + 1, waves: waves.length, total, tied, willRunTogether: true, siblings: wave.filter(other => other.id !== node.id).map(other => other.title) });
            }
            const value = { counts: counts(graph), waves, waveById };
            cache.set(graph, { key, value });
            return value;
        },
    };
}
