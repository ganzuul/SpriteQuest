/**
 * Align the interactive wrapper, glyph and measured wire anchor with label ink.
 * Called synchronously before Canvas caches card geometry. Screen measurements
 * are converted back to graph pixels so alignment is independent of zoom.
 */
const contexts = new WeakMap();

/** Read only the first or last rendered line; ordinary single-line pins skip this. */
function edgeLineText(label, fromEnd) {
    const doc = label.ownerDocument, walker = doc.createTreeWalker(label, 4);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    if (fromEnd) nodes.reverse();
    const range = doc.createRange();
    let lineTop, text = '';
    for (const node of nodes) {
        const value = node.textContent ?? '';
        for (let step = 0; step < value.length; step++) {
            const index = fromEnd ? value.length - 1 - step : step;
            range.setStart(node, index); range.setEnd(node, index + 1);
            const bounds = range.getBoundingClientRect();
            if (!bounds.height) continue;
            if (lineTop === undefined) lineTop = bounds.top;
            else if (Math.abs(bounds.top - lineTop) > .01) return text;
            text = fromEnd ? value[index] + text : text + value[index];
        }
    }
    return text;
}

export function alignCardPins(card, zoom = 1) {
    const doc = card.ownerDocument, view = doc.defaultView;
    const scale = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
    for (const row of card.querySelectorAll('.pc-native-row')) {
        const label = row.querySelector('.pc-native-pin-label'), pin = row.querySelector('.pc-port');
        if (!label || !pin) continue;
        const bounds = row.getBoundingClientRect(), labelBox = label.getBoundingClientRect();
        // Hidden compact labels and DOM-only tests have no visible ink to align.
        if (!bounds.height || !labelBox.height || view.getComputedStyle(label).display === 'none') {
            pin.style.setProperty('--pc-pin-y', '0px');
            continue;
        }
        if (!contexts.has(doc)) {
            let context = null;
            try { context = doc.createElement('canvas').getContext('2d'); } catch { /* Canvas unavailable: retain the line-box center. */ }
            contexts.set(doc, context);
        }
        const context = contexts.get(doc);
        if (!context) { pin.style.setProperty('--pc-pin-y', '0px'); continue; }
        const style = view.getComputedStyle(label);
        context.font = style.font || `${style.fontSize} ${style.fontFamily}`;
        const probe = doc.createElement('span');
        probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
        probe.setAttribute('aria-hidden', 'true');
        label.prepend(probe);
        const firstBaseline = probe.getBoundingClientRect().top;
        probe.remove();
        label.append(probe);
        const lastBaseline = probe.getBoundingClientRect().top;
        probe.remove();
        const wrapped = Math.abs(lastBaseline - firstBaseline) > .01;
        const firstMetrics = context.measureText(wrapped ? edgeLineText(label, false) : label.textContent ?? '');
        const lastMetrics = wrapped ? context.measureText(edgeLineText(label, true)) : firstMetrics;
        const ascent = firstMetrics.actualBoundingBoxAscent, descent = lastMetrics.actualBoundingBoxDescent;
        if (!Number.isFinite(ascent) || !Number.isFinite(descent)) continue;
        // Only lettering on the top and bottom rendered lines defines the
        // visible block edges; capitals on another line cannot raise its top.
        const center = (firstBaseline + lastBaseline + (descent - ascent) * scale) / 2;
        const offset = (center - bounds.top - bounds.height / 2) / scale;
        pin.style.setProperty('--pc-pin-y', `${offset}px`);
    }
}
