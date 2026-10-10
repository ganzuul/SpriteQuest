# Node profile themes and unified workflow follow-up

The attached `codex/node-profile-dropdowns` worktree was fast-forwarded to latest `origin/main`, `d807155fbc27d7a4784b729579068ad8527981c1`, before this follow-up. That base includes the original profile feature and the unified workflow release.

Profile controls now inherit Lattice's live surface, border, text, quiet text, accent, error and font roles. The bar, popup and options use the workspace's 4px corners, with subtle inset surface edges. Search backgrounds clip to the popup corners. Popups retain the selected panel's RGB while making its alpha opaque, preventing canvas content from showing through translucent SillyTavern themes. Host button/input filters, shadows and margins are reset locally. Selected profiles, keyboard focus, scrollbars and error text follow the selected theme, including neutral Signal and custom light palettes.

Creation now uses the selected Introspection mode's declared controls and defaults, then the validated effective model role. This fixes Active SillyTavern model defaults for Express / Inner Voice, Context / Focus / Compress, and Item Use Trigger / Extract. Saved legacy bindings remain unchanged. Ordinary text-model profile projection covers the current unified primitives; Fast Decision keeps its typed endpoint and separate optional text fallback, and For Each keeps per-helper role bindings.

Catalog regressions cover 33 positive configurations across 18 operations and 20 deterministic, host or typed configurations without ordinary profile bars. The browser regression renders the new unified model nodes, edits Decision independently, verifies Undo, and switches Extract between model and literal modes.

A separate browser reproduction exposed error-footer overflow in a short canvas: a long rejected-edit message moved the popup above the canvas. The popup is now bounded by available space; its results and error remain scrollable. Existing search, wheel isolation, outside dismissal, keyboard controls, qualified instance edits and stale-context protections are retained.

Visual inspection covered all eight approved themes. Local evidence is retained under `.tmp/node-profiles/theme-screenshots/`; browser captures and traces are under `.tmp/profile-followup-full-browser/`. A final unobstructed unified-node capture is retained under `.tmp/profile-final-visual/`.

Verification:

- Before fixes: the Ash bar-color regression failed; Item Use extraction had a null model role; Context compression rejected its method control; the short-viewport error regression overflowed the canvas.
- Focused theme suite: 10/10 passed, including the actual eight-theme picker, custom light palette/font, host-style isolation, translucent panels and keyboard focus.
- Focused unified authoring/profile suite: 10/10 passed.
- Final layout checks: 4/4 passed, including the reproduced error overflow.
- Final unified-node visual capture: 1/1 passed; inspected all eleven visible model controls plus literal Extract and typed Fast Decision without ordinary bars.
- Svelte/TypeScript: 0 errors, 0 warnings.
- Production build: 171 modules, successful.
- Asset check: 499 versioned local imports, successful.
- Complete unit suite: 244/244 test files passed.
- Complete browser suite: 280/280 passed against the rebuilt worktree bundle (13.5 minutes).
- Git whitespace check: clean.
- Independent review: no findings. Additional Chromium probes verified zoom .72/1.7, narrow and short viewports, coarse pointers, and long scrollable errors with bounded popup geometry.
