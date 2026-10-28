# ComfyUI runtime: launch, models, budget

How SpriteQuest starts ComfyUI, where its configuration lives, and how the
companion scripts choose models. Written after debugging a run that loaded the
wrong model family, referenced a file that was not installed, and then exhausted
GPU memory.

## Launch chain

1. `systemd --user` unit `~/.config/systemd/user/llama-swap.service` runs
   `llama-swap -config ~/.config/llama-swap/config.yaml -listen 127.0.0.1:8080 -watch-config`.
   The drop-in `00-gpu.conf` pins compute to the RTX 2070 Super by GPU UUID.
2. `~/.config/llama-swap/config.yaml` declares the `comfyui` entry:
   `cmd: bash tools/serve_comfyui.sh ${PORT}`. `${PORT}` comes from `startPort: 5800`.
3. `tools/serve_comfyui.sh` sets cwd to `${COMFY_DIR:-$HOME/ComfyUI}` and execs
   `.venv/bin/python main.py --port "$PORT" --enable-cors-header "*"`.

Clients never use the worker port; they use the proxy at
`http://127.0.0.1:8080/upstream/comfyui`. The `:8188` references in older notes
were the pre-manager standalone server.

| What | Path |
|---|---|
| ComfyUI install / cwd | `~/ComfyUI` |
| Extra model search paths | `~/ComfyUI/extra_model_paths.yaml` |
| UI settings | `~/ComfyUI/user/default/comfy.settings.json` |
| Manager routing | `~/.config/llama-swap/config.yaml` |
| Service + GPU pin | `~/.config/systemd/user/llama-swap.service(.d/00-gpu.conf)` |

Cycle only the renderer with
`curl -X POST http://localhost:8080/api/models/unload/comfyui`; it restarts on
the next request.

## Model discovery

`companion/comfy_models.py` is the single registry. It maps a role to a local
folder, the ComfyUI folder keys to query, and an ordered candidate list:

| Role | Folder | Notes |
|---|---|---|
| `moss_unet` | `diffusion_models` | MOSS diffusion models only |
| `moss_clip` | `text_encoders`, `clip_gguf` | verified Qwen3.5 safetensors first; GGUF opt-in |
| `moss_vae` | `vae` | Flux2 VAE |
| `image_unet` / `image_clip` / `image_vae` | as above | family-agnostic; used by NPC sheets and validation |

The registry reads three sources: a reachable ComfyUI's `/models/<folder>` lists,
`~/ComfyUI/models/<folder>`, and any directories named in
`~/ComfyUI/extra_model_paths.yaml` (parsed directly, so offline tools see the
same models ComfyUI does). `strict=True` raises instead of naming a file that is
not installed; only dry-run paths use `strict=False`.

`python3 tools/link_models.py --write` keeps ComfyUI fed from the shared cache
with one symlink per model in `~/ComfyUI/models/<category>/`, resolved through
the cache's `refs/main` pointer. Dry run by default; `--prune` clears dangling
links. This is preferred over hand-writing `extra_model_paths.yaml`, which pins
the same snapshot commit in every category and breaks when the cache updates.
The links are currently in place for the MOSS diffusion model, encoder, VAEs and
LoRAs.

## Memory budget

`require_budget()` refuses a job before it swaps the machine: encoder size × 1.3
against free host RAM (the GGUF/safetensors loader materialises a full state
dict), and ~6 GiB VRAM scaled by canvas area against free VRAM. Measured
behaviour on the 8 GiB card: 768×768 fits, 1024×1024 exceeds the card during
MOSS reference preprocessing (`4.01 GiB` allocated, `3.94 GiB` requested,
`26.81 MiB` free). Use `--ignore-budget` only when you have checked by hand.
`MAP_DIFFUSION_SIZE` (768) is the default canvas for that reason; the bundle
renderer still writes 1024px assets by upscaling. From the CLI:

```bash
python3 companion/render_map_art.py border-march --export-workflow  # safe: 768
python3 companion/render_map_art.py border-march --canvas max       # 1024, needs >12 GiB free
```

The same rule applies outside the script: a Q8_0 text encoder is ~9.8 GB and
must not be loaded while other work is resident on a 23 GB machine.

## Validation

```bash
python3 -m companion.validate_workflows --offline   # fast, local folders only
python3 -m companion.validate_workflows             # also asks ComfyUI
```

It reports missing models, links to absent nodes, and `LoadImage` files that are
not in ComfyUI's input folder, then exits non-zero. Current known drift: the
sprite workflows snapshot `flux3_image_klein_sd_Q4_K_M.gguf`, whose Hugging Face
cache entry is no longer present.

## GGUF text encoders

Core ComfyUI has no GGUF support; `ComfyUI-GGUF` provides it, and Qwen3.5/MOSS
needs upstream PR <https://github.com/city96/ComfyUI-GGUF/pull/490>. See
[cartographers-moss-atlas-ontology.md](cartographers-moss-atlas-ontology.md) for
the patch location and the model-identity caveat.