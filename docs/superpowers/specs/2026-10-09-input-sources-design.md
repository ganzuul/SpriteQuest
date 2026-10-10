# Input sources

The user approved developing Text, File Input, and Prompt Source after discussing their overlap with Compose, JSON Decode, and Style Transfer. These extend the existing native source flow; they do not replace SillyTavern prompt assembly.

## Behavior

- Text emits its editable multiline literal as Text, including empty text, with no macro expansion.
- File Input imports a UTF-8 text file once, saves its filename and contents with the node, and emits Text. It never rereads a path during execution. Empty imported files are valid; an unloaded node fails visibly. JSON parsing remains JSON Decode's responsibility.
- Prompt Source reads either the configured active system block or a selected Prompt Manager entry by stable identifier. Raw preserves the template; Resolved uses guarded host substitution for pure name and formatting macros only. Broader macro syntax and literal brace fragments require Raw. Known disabled/inactive, missing, unsupported, or oversized sources fail visibly; explicit configured entries report unknown activation if the host exposes no order. This is not the final assembled generation prompt.
- All three have one Text output, no input pins, and zero auxiliary requests. Text and File Input work in either phase and inside reusable subgraphs; Prompt Source works in either phase but is root-only.
- Text is bounded to 100,000 UTF-16 units without truncation. File selection is limited to 400,000 bytes before decoding and 100,000 UTF-16 units afterward, using strict UTF-8 decoding. Filenames are display basenames up to 255 units.
- File contents are portable semantic controls; live browser File objects and paths are never persisted. Prompt captures remain run artifacts; exports retain only source selectors.
- Prompt sources are frozen for a run and checked again before host settlement. Source changes invalidate publication/application.
- File loading commits filename, contents, and loaded state together through the existing captured editor transaction. A changed graph, view, node, or revision rejects a delayed load; failed loading leaves the previous snapshot intact.

## Integration and validation

Register one canonical shelf entry per node, with search aliases and icons. Details provides Text's editor, File Input's picker and saved filename, and Prompt Source's selectors. Existing Compose and JSON Decode remain unchanged.

Verify operation contracts, UTF-8/file bounds and delayed reads, host prompt selection and freshness, Text/JSON/Guidance execution, portable package round trips, subgraph restrictions, shelf discovery, and the actual Details file picker. Run the unit suite, types, build, asset checks, and relevant browser checks. Existing unrelated edits must be preserved.
