# The Cartographers' Atlas Craft and MOSS Layouts

This design translates MOSS-Image's structured image-layout and reference-image
capabilities into Bureau of the Unwritten Atlas lore. It keeps the distinction
between a rendered map and the geographic record explicit: MOSS illuminates a
survey; it does not certify one.

## Diegetic ontology

| Bureau term | Fragment | In-world meaning |
|---|---|---|
| **Locus frame** | `cartographers/atlas-locus-frame` | Four sliding shoes mark the image region reserved for a named feature. The frame is lifted before the final map is inked. |
| **Witness plate** | `cartographers/atlas-witness-plate` | A fixed relief beneath the vellum lets an illuminator render terrain without losing its measured arrangement. |
| **Scale register** | `cartographers/atlas-scale-register` | A brass index links separate world, regional, and local leaves by their extents, orientations, and shared bearings. |

These are working instruments, not warrants. A locus frame records where a
feature belongs in an image, a witness plate offers a visual guide, and a scale
register carries relationships between maps. Only surveyed and warranted
records establish canonical geography.

## Concrete implementation

1. Keep geographic facts in map data: stable feature IDs, coordinates,
   geometry/footprints, routes, confidence, and parent-child map transforms.
2. For each requested scale, project those records into one image canvas and
   generate a flat MOSS Layout. Each named feature becomes an `items` entry
   whose bounding box is derived from its projected image-space footprint.
   The supported Layout format uses one global canvas, not nested coordinate
   spaces.
3. If terrain composition matters, provide a deterministic relief/control image
   as a reference. Use the MOSS-conditioned result for cartographic appearance,
   not as the authoritative source for measurements.
4. Composite exact route strokes, boundaries, symbols, and labels from the
   map records after generation when their positions or spelling must be exact.
5. Keep world, regional, and local outputs independently renderable. A parent
   transform relates their geography; it does not become an extra nested
   bounding box in the MOSS prompt.

MOSS boxes guide object arrangement within a canvas; they do not promise exact
landmark geometry, road continuity, or terrain topology. Validate the output
against the deterministic source using feature-box overlap/center offset and
route-connectivity checks. A render that misses a feature is a failed
illustration, not a change to the atlas record.

## Current SpriteQuest connection

`companion/render_map_art.py` now exports an experimental MOSS Layout workflow
for an outdoor map. Generate the Border March draft with:

```bash
python3 companion/render_map_art.py border-march --export-workflow
```

The command writes an API-format ComfyUI graph to
`workflows/comfyui/cartography_border-march_layout.json`, a readable editable
Layout draft beside it, and a deterministic top-down witness image into
`~/ComfyUI/input/`. The draft uses editable top-left pixel `xyxy` boxes; the
exporter compiles those to MOSS's centered `yxyx` prompt format in the graph.
Edit the sidecar draft and rerun the command to compile your changes; existing
drafts are preserved. Override the locations with `--workflow-out`,
`--layout-draft`, and `--comfy-input`. The default canvas is 768x768 to fit the
MOSS SFT checkpoint on an 8 GiB GPU; use `--width` and `--height` only when
additional GPU memory is available. The standalone map-art renderer upsamples
its 768px diffusion result for the existing 1024px asset bundle. This exporter
intentionally selects only MOSS diffusion candidates and rejects a non-MOSS
`--unet`; use `--unet`, `--clip`, and `--vae` to choose exact filenames when
model discovery differs from the ComfyUI installation. It loads the text encoder on CPU to avoid
competing with the diffusion model for the 8 GiB GPU; this trades generation
speed for memory headroom. The graph exposes the prompt/layout,
witness-image strength (`denoise`), seed, steps, and CFG in ordinary ComfyUI
nodes; it does not contact ComfyUI or run a generation. Open/import it using
ComfyUI's API-format workflow loader, with a compatible MOSS-Image model, VAE,
text encoder, and `ReferenceLatent` node installed.

### Text encoders: safetensors vs GGUF

ComfyUI's core `CLIPLoader` only lists `text_encoders` files with torch
extensions, so a `.gguf` encoder there is invisible to it. GGUF encoders are
published under the `clip_gguf` folder key by the ComfyUI-GGUF custom node and
must be loaded with `CLIPLoaderGGUF`; the exporter picks that node automatically
when `--clip` ends in `.gguf`. `CLIPLoaderGGUF` has no `device` input — it always
builds on the offload device, so the CPU placement is implicit.

A GGUF file also has to declare an architecture the node understands.
`Qwen3.5-9B-ComfyUI-Q8_0.gguf` declares `general.architecture = qwen35`, which is
absent from upstream ComfyUI-GGUF's `TXT_ARCH_LIST` (`t5`, `t5encoder`, `llama`,
`qwen2vl`, `qwen3`, `qwen3vl`, `gemma3`). Simply allowing the arch string is not
enough: llama.cpp's converter renames and permutes the hybrid-linear-attention
tensors, so the file loads but produces wrong names (`projkv`) and garbage
output.

Upstream PR <https://github.com/city96/ComfyUI-GGUF/pull/490> implements the
missing support: it maps `blk.*` to `model.language_model.*`, reverses the
llama.cpp DeltaNet changes (`norm - 1`, `A_log -> -exp(A_log)`, squeezed
`conv1d`, grouped-to-tiled V-head order) and reads `qwen35.ssm.group_count`.
That mapping matches the keys in the working
`qwen3.5_9b_w4a8_gptq.safetensors` encoder exactly. The patch is stored at
`tools/patches/comfyui-gguf-qwen35-text-encoder.patch` and is applied to the
local `~/ComfyUI/custom_nodes/ComfyUI-GGUF` checkout:

```bash
cd ~/ComfyUI/custom_nodes/ComfyUI-GGUF
git apply /home/nos/Nextcloud/SpriteQuest/tools/patches/comfyui-gguf-qwen35-text-encoder.patch
# revert with: git apply -R <same patch>
```

Until the PR is merged, re-apply it after updating that custom node.

**Resource warning:** a Q8_0 encoder is ~9.8 GB and the loader materialises a
full state dict plus dequantised copies, so give it roughly 12-16 GB of free
host RAM. On this 23 GB machine that means closing other work first; running it
while other applications are resident drives the box deep into swap. The
committed Border March graph therefore keeps the verified
`qwen3.5_9b_w4a8_gptq.safetensors` encoder, and GGUF is opt-in:

```bash
python3 companion/render_map_art.py border-march --export-workflow \
  --clip Qwen3.5-9B-ComfyUI-Q8_0.gguf
```

Auto-selection never invents a filename: it resolves against `~/ComfyUI/models`
and then the running ComfyUI's own model lists, and raises if neither has the
model.

The room-scale experiments in `companion/run_floorplan_diffusion_tests.py`
remain a separate experimental path. Their legacy `<obj_N>` prompt-table
builder in `companion/ortho_floorplan.py` has not been migrated; the new map
exporter instead emits the documented flat JSON Layout draft.

The current map declarations and renderers remain the geometry authority. This
ontology adds a vocabulary for future multi-scale layout generation; it does not
make generated images canonical or introduce a new map schema by itself.
