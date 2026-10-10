<script lang="ts">
    import { artifactGlyphMarkup } from '../src/ui/artifact-glyph.js';
    let { kind, className = 'pc-pin-glyph', x, y }: { kind: string; className?: string; x?: number; y?: number } = $props();
</script>

<svg class={className} data-kind={kind} {x} {y} width="18" height="18" viewBox="-9 -9 18 18" aria-hidden="true" focusable="false">{@html artifactGlyphMarkup(kind)}</svg>
