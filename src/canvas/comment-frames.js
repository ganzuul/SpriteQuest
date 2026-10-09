/** Authored comments are visual notes, never execution groups or stored membership. */
export const COMMENT_PADDING = 24;
export const COMMENT_HEADER_HEIGHT = 36;

export function isCommentFrame(node) {
    return node?.type === 'note' && node.commentFrame === true;
}

const validBounds = bounds => bounds && ['x', 'y', 'w', 'h'].every(key => Number.isFinite(bounds[key])) && bounds.w >= 0 && bounds.h >= 0;

function surroundingBounds(bounds) {
    const left = Math.min(...bounds.map(rect => rect.x)), top = Math.min(...bounds.map(rect => rect.y));
    const right = Math.max(...bounds.map(rect => rect.x + rect.w)), bottom = Math.max(...bounds.map(rect => rect.y + rect.h));
    return { x: left - COMMENT_PADDING, y: top - COMMENT_PADDING - COMMENT_HEADER_HEIGHT, w: right - left + COMMENT_PADDING * 2, h: bottom - top + COMMENT_PADDING * 2 + COMMENT_HEADER_HEIGHT };
}

function frameId(nodes, requested) {
    const available = id => typeof id === 'string' && id.length > 0 && !['__proto__', 'prototype', 'constructor'].includes(id) && !Object.hasOwn(nodes, id);
    if (available(requested)) return requested;
    let index = 1;
    while (!available(`comment_${index}`)) index++;
    return `comment_${index}`;
}

/**
 * Return a detached frame without inserting it. boundsFor(node) supplies cached,
 * measured graph-space {x,y,w,h}; missing/invalid measurements are ignored.
 * Options: id, at:{x,y}, title, content (multiline notes), color, moveContents.
 * Absent/colliding/unsafe IDs use the first free comment_N ID. Empty frames
 * start at at (default 0,0), with a useful 360x220 rectangle.
 * Existing frames are excluded from selection. No group/member fields are added.
 */
export function createCommentFrame(graph, ids, boundsFor, options = {}) {
    const nodes = graph.nodes;
    const bounds = [...new Set(ids)].filter(id => Object.hasOwn(nodes, id)).map(id => nodes[id]).filter(node => !isCommentFrame(node)).map(node => boundsFor(node)).filter(validBounds);
    const geometry = bounds.length ? surroundingBounds(bounds) : { x: Number.isFinite(options.at?.x) ? options.at.x : 0, y: Number.isFinite(options.at?.y) ? options.at.y : 0, w: 360, h: 220 };
    return { id: frameId(nodes, options.id), type: 'note', commentFrame: true, moveContents: options.moveContents ?? true, title: options.title ?? 'Comment', content: options.content ?? '', color: options.color ?? '#637d89', ...geometry };
}

/**
 * Capture detached ordinary-node snapshots fully inside the frame below its
 * header. Boundary equality counts as contained. Ordinary notes are included;
 * comment frames are excluded. Call once at drag start, then move these IDs.
 * Containment is derived from geometry; no membership is written to the graph.
 */
export function containedCommentNodes(graph, frame, boundsFor) {
    if (!isCommentFrame(frame) || !validBounds(frame)) return [];
    return Object.values(graph.nodes).filter(node => {
        if (isCommentFrame(node)) return false;
        const bounds = boundsFor(node);
        return validBounds(bounds) && bounds.x >= frame.x && bounds.y >= frame.y + COMMENT_HEADER_HEIGHT
            && bounds.x + bounds.w <= frame.x + frame.w && bounds.y + bounds.h <= frame.y + frame.h;
    }).map(node => structuredClone(node));
}

/** Return a new frame fitted to its currently contained nodes with creation
 * padding/header. An empty frame keeps its current rectangle and authored data.
 */
export function fitCommentFrame(graph, frame, boundsFor) {
    const bounds = containedCommentNodes(graph, frame, boundsFor).map(node => boundsFor(graph.nodes[node.id])).filter(validBounds);
    return { ...frame, ...(bounds.length ? surroundingBounds(bounds) : {}) };
}
