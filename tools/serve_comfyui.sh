#!/bin/sh
# Launch ComfyUI on a given port for the GPU resource manager (llama-swap).
#
# llama-swap execs a model's `cmd` as a bare argv (whitespace-split, no shell),
# so a builtin like `cd` cannot run in it. This wrapper owns the cwd and the
# venv and then execs ComfyUI — the one place that knows how to start it.
set -eu

PORT="${1:?usage: serve_comfyui.sh PORT}"
COMFY="${COMFY_DIR:-$HOME/ComfyUI}"
if [ ! -d "$COMFY" ]; then
  echo "ComfyUI not found at $COMFY (set COMFY_DIR)" >&2
  exit 1
fi
cd "$COMFY"
exec .venv/bin/python main.py --port "$PORT" --enable-cors-header "*"
