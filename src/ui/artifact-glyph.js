/** Artifact identity is shared by live pins, example previews and the theme picker. */
export const ARTIFACT_KINDS = Object.freeze(['context', 'guidance', 'draft', 'patches', 'candidate', 'text', 'data']);
export const ARTIFACT_PIN_SCALE = 0.5625;
export const ARTIFACT_PIN_COLORS = Object.freeze({
    context: '#f0e442', guidance: '#cc79a7', draft: '#7fd8c5', patches: '#ed8956',
    candidate: '#b49af2', text: '#e69f00', data: '#56b4e9',
});
export const ARTIFACT_PIN_NAMES = Object.freeze({
    context: 'filled circle', guidance: 'diamond', draft: 'pentagon', patches: 'triangle',
    candidate: 'ring with center dot', text: 'capsule', data: 'square',
});

const triangleHalfHeight = Math.sqrt(3) * 5.5 / 2;
const SHAPES = Object.freeze({
    context: '<circle cx="0" cy="0" r="5.5" />',
    guidance: '<polygon points="0,-6.5 6.5,0 0,6.5 -6.5,0" />',
    draft: '<polygon points="0,-5.5 5.5,-1.32 3.41,5.5 -3.41,5.5 -5.5,-1.32" />',
    patches: `<polygon points="0,${-triangleHalfHeight} 5.5,${triangleHalfHeight} -5.5,${triangleHalfHeight}" />`,
    candidate: '<circle cx="0" cy="0" r="6.5" fill="none" /><circle cx="0" cy="0" r="2.475" />',
    text: '<rect x="-7.5" y="-3.465" width="15" height="6.93" rx="3.465" />',
    data: '<rect x="-5.5" y="-5.5" width="11" height="11" />',
});

/** Returns only constant SVG markup; neither theme settings nor labels become markup. */
export function artifactGlyphMarkup(kind) {
    const knownKind = ARTIFACT_KINDS.includes(kind) ? kind : 'context';
    return `<g data-glyph="${knownKind}" transform="scale(${ARTIFACT_PIN_SCALE})" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">${SHAPES[knownKind]}</g>`;
}

export function createArtifactGlyph(kind, doc = document) {
    const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '-9 -9 18 18');
    svg.setAttribute('width', '18');
    svg.setAttribute('height', '18');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.innerHTML = artifactGlyphMarkup(kind);
    return svg;
}
