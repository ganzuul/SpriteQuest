import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { ARTIFACT_KINDS, ARTIFACT_PIN_SCALE, artifactGlyphMarkup, createArtifactGlyph } from '../src/ui/artifact-glyph.js';

const doc = new JSDOM('<body></body>').window.document;

test('the shared glyph vocabulary contains exactly the seven live artifact kinds', () => {
    assert.deepEqual(ARTIFACT_KINDS, ['context', 'guidance', 'draft', 'patches', 'candidate', 'text', 'data']);
    assert.equal(ARTIFACT_PIN_SCALE, 0.5625);
    assert.equal(new Set(ARTIFACT_KINDS.map(artifactGlyphMarkup)).size, 7);
    for (const kind of ARTIFACT_KINDS) {
        const glyph = createArtifactGlyph(kind, doc), group = glyph.firstElementChild;
        assert.equal(glyph.getAttribute('viewBox'), '-9 -9 18 18');
        assert.equal(group.getAttribute('transform'), 'scale(0.5625)');
        assert.equal(group.getAttribute('stroke-width'), '1.5', 'The approved stroke scales with the glyph');
        assert.equal(group.getAttribute('fill'), 'currentColor', 'Themes affect the color only');
    }
});

test('Patches is an upright equilateral triangle at the approved size', () => {
    const triangle = createArtifactGlyph('patches', doc).querySelector('polygon');
    const points = triangle.getAttribute('points').split(' ').map(point => point.split(',').map(Number));
    assert.equal(points.length, 3);
    assert.equal(points[0][0], 0);
    assert.ok(points[0][1] < points[1][1]);
    for (let index = 0; index < 3; index++) {
        const a = points[index], b = points[(index + 1) % 3];
        assert.ok(Math.abs(Math.hypot(a[0] - b[0], a[1] - b[1]) - 11) < 1e-12);
    }
});

test('Candidate remains a ring with a center dot and Text remains a horizontal capsule', () => {
    const [ring, dot] = createArtifactGlyph('candidate', doc).querySelectorAll('circle');
    assert.equal(ring.getAttribute('r'), '6.5');
    assert.equal(ring.getAttribute('fill'), 'none');
    assert.equal(dot.getAttribute('r'), '2.475');
    const capsule = createArtifactGlyph('text', doc).querySelector('rect');
    assert.equal(capsule.getAttribute('width'), '15');
    assert.equal(capsule.getAttribute('height'), '6.93');
    assert.equal(capsule.getAttribute('rx'), '3.465');
});

test('unexpected type text cannot insert markup into the shared glyph', () => {
    assert.equal(artifactGlyphMarkup('<script>bad</script>'), artifactGlyphMarkup('context'));
});
