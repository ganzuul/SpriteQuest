## Task B: Prepared-only renderer and current clipboard

**Owner:** Canvas worker.
**Files:** `src/canvas.js`, `src/canvas/presentation.js`, `ui/{CanvasLayer,NodeCard,WireLayer,GroupCard}.svelte`, current clipboard module; relevant renderer types with UI owner coordination. Remove `src/clip.js` after callers switch. Keep camera/frame/geometry/selection modules unless necessary.
**Interfaces:** Keep Canvas lifecycle/setGraph/setTrace/view/Fit/cancellation/native-wire hooks used by the current controller. Only prepared named-pin DTOs are admissible. Clipboard exports current fragment creation/read/prepare-paste, using current insertion; no graph mutation before ROOT controller commits captured edits.

- [ ] Add RED tests proving no fallback legacy card/top-bottom endpoints/loop labels or old clipboard reader and correct current named/compact/host-terminal projection.
- [ ] Remove old type/icon/rule maps, library drops, token/compiler analysis, legacy linking/hover strips, Decider/State/group routing pins, together/loop/wire-mode code and unprepared graph fallback.
- [ ] Preserve real pin/body gestures, pointer cancellation, reverse drops/context search, modifier editing, reroutes, readonly scopes, group enclosure/collapse, camera/editor focus and keyed rendering.
- [ ] Use current portable fragment clipboard with fresh identities, definition closure/bindings, captured insertion/undo and strict package admission. UI owner wires commands.
- [ ] Run focused renderer/camera/clipboard tests and Svelte checks when shared contracts settle; report/freeze exact owned files.
