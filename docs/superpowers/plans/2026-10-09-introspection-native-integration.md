# Native Introspection integration

The user asked to finish the missing Introspection node integration and push main. The existing six-entry package and its published contracts are the implementation baseline. This completes its native mounting and host settlement, alongside the already registered Transpose tools.

## Design

Register Reflect, Internalize, Express, Context, Memory and State in a dedicated Introspection shelf family. Preserve their mode-specific typed inputs, outputs, controls and request bounds. Project only declared package settings from native nodes; canvas presentation, model bindings and authoring metadata are not package controls. Render finite fractional numeric controls and bounded JSON objects through the existing Details draft/validation flow. Every mode change uses the existing immutable full-root edit and wire compatibility checks.

Dispatch through the current bounded native runtime, preserving global request accounting and recording. The public runner remains effect-free. Only the host runner receives a private Introspection hook with the active chat and actor memory adapter. Memory sources stay root-only; State inside a definition requires an explicit state input. Memory Commit is a post-phase root terminal with no downstream output and at most one included commit terminal per run.

Use revisioned completed-message evidence and a scoped chat-metadata store. A successful root settlement may persist the exact compiled commit intent only after rechecking source, actor/chat, version and cancellation. Preview, dry-run, targeted runs and failed runs do not persist. Serialize memory writers, preserve other metadata namespaces, and distinguish acknowledged persistence from an unknown save outcome. Default commit keys derive from the actual proposal identity so repeat attempts are idempotent without preventing future turns.

## Work and ownership

- [x] Catalog worker: native node projection, dynamic registration, numeric/object control contracts and graph policies; focused regression tests.
- [x] Host worker: scoped settled evidence, metadata adapter, private host execution and commit settlement; lifecycle regression tests.
- [x] UI worker: shelf/search/palette, Details control projection and editing; mounted component/browser regression tests.
- [x] Root: runtime dispatch, mode edits, actual native examples/starters, current documentation and cross-layer acceptance tests.
- [x] Root: combine and review; run full tests/types/build/assets/browser/installation and actual UI captures.
- Root: publish the verified 0.24.0 release to main, then attempt a safe fast-forward of the primary checkout. Active edits must be preserved; an overlapping dirty checkout requires deferring its update.

## Execution constraints

Use the existing attached integration checkout on `codex/introspection-native`, starting at published main `2307ad59a39968a06c6d6424e2e0f4840ce341f5`. Workers have separate ownership and do not touch the actively edited primary checkout. GitHub CLI always receives network permission. Provider tests use synthetic responses; no live provider calls are necessary. The user's explicit request authorizes implementation and the main push; no additional design or publication approval is required.

## Verification

The complete Node gate passed 131/131 files. All 155 browser cases passed after extending the approved theme fixture for the eighth family; the final shelf-width adjustment also passed 27 affected browser cases and its Node layout checks. Svelte/TypeScript reported zero errors and warnings. The production build transformed 146 modules; asset checks verified 270 versioned local imports. A clean-install smoke loaded 92 local requests with zero missing assets, errors, host API requests or providers. All 15 production workspace capture cases and 20 documentation captures passed. Independent review passed 45 focused host/runtime tests and has no remaining findings. The 23 original primary-checkout preservation hashes remain intact.
