import { listWorkflowExampleResults } from '../workflow/examples.js?v=0.26.0';
import { prepareWorkspaceViews } from './workspace-preparation.js?v=0.26.0';
import { nodeCards } from '../canvas/presentation.js?v=0.26.0';
import { isCommentFrame } from '../canvas/comment-frames.js?v=0.26.0';
import { buildConnectionRoute } from '../canvas/connection-route.js?v=0.26.0';

const PRESENTATION_REVISION = 2;
let cacheKey = '', cachedTiles;
const freeze = value => {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        Object.values(value).forEach(freeze);
        Object.freeze(value);
    }
    return value;
};

/** Native preparation only: no host context, runtime, model binding, or execution. */
export function projectWorkflowExamples() {
    const examples = listWorkflowExampleResults();
    const key = JSON.stringify([PRESENTATION_REVISION, examples]);
    if (key === cacheKey) return cachedTiles;
    const tiles = examples.map(example => {
        const tile = { id: example.id, number: example.number, title: example.title, goal: example.goal };
        if (!example.result.ok) return { ...tile, thumbnail: null, issue: example.result.error.message || 'This example package is invalid.' };
        try { return { ...tile, thumbnail: projectThumbnail(example.result.data), issue: '' }; }
        catch (error) { return { ...tile, thumbnail: null, issue: error instanceof Error ? error.message : 'This example preview is unavailable.' }; }
    });
    // Theme colors stay live CSS roles in the SVG; cached geometry serves every theme.
    cachedTiles = freeze(tiles); cacheKey = key;
    return cachedTiles;
}

function projectThumbnail(graph) {
    const prepared = prepareWorkspaceViews(graph);
    if (!prepared.ok) throw new Error(`Cannot preview example ${graph.name}: ${prepared.error?.message || 'Invalid workflow'}`);
    const drawing = prepared.data.preparedViews.find(view => view.identity.kind === 'root').drawBase;
    const comments = Object.values(drawing.nodes).filter(isCommentFrame).map(node => ({
        id: node.id, x: node.x, y: node.y, w: node.w, h: node.h,
        title: node.title || 'Comment', content: node.content || '', color: node.color || '#637d89',
    }));
    const cards = nodeCards(Object.values(drawing.nodes).filter(node => !isCommentFrame(node)), { graph: drawing });
    const nodes = cards.map(card => {
        const rows = Math.max(0, ...card.ports.map(port => port.row));
        const h = 32 + rows * 24 + (card.hostResult ? 28 : 0) + (card.type === 'note' ? 42 : 0);
        return {
            id: card.id, x: card.x, y: card.y, w: card.w, h, title: card.title,
            className: card.className, iconPath: card.iconPath, body: card.body,
            ports: card.ports.map(port => ({ ...port, x: card.x + (port.side === 'left' ? 12 : card.w - 12), y: card.y + 28 + (port.row - 0.5) * 24 })),
        };
    });
    const byId = new Map(nodes.map(node => [node.id, node]));
    const points = [...nodes, ...comments].flatMap(node => [{ x: node.x, y: node.y }, { x: node.x + node.w, y: node.y + node.h }]);
    const wires = Object.values(drawing.wires).map(wire => {
        const from = byId.get(wire.from)?.ports.find(port => port.dir === 'out' && port.port === wire.fromPort);
        const to = byId.get(wire.to)?.ports.find(port => port.dir === 'in' && port.port === wire.toPort);
        if (!from || !to) throw new Error(`Cannot preview named pins for example wire ${wire.id}`);
        const route = buildConnectionRoute(from, to);
        const coordinates = route.d.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi)?.map(Number) || [];
        for (let index = 0; index < coordinates.length; index += 2) points.push({ x: coordinates[index], y: coordinates[index + 1] });
        return { id: wire.id, d: route.d, kind: from.kind, from: { nodeId: wire.from, portId: wire.fromPort }, to: { nodeId: wire.to, portId: wire.toPort } };
    });
    const left = Math.min(...points.map(point => point.x)), top = Math.min(...points.map(point => point.y));
    const right = Math.max(...points.map(point => point.x)), bottom = Math.max(...points.map(point => point.y));
    return { bounds: { x: left - 24, y: top - 24, w: right - left + 48, h: bottom - top + 48 }, nodes, wires, comments };
}
