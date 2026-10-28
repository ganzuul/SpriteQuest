# SpriteQuest / Lattice repository instructions

This repository combines a SillyTavern workflow extension with SpriteQuest's companion story and map tooling. The extension's installed interface is branded Lattice; the companion service and authored materials use SpriteQuest.

## Build and test

Use Node.js 24 or later and the committed lockfile.

```sh
npm ci
npx playwright install chromium
npm run build
npm run check:types
npm run check:assets
npm test
npm run test:browser
npm run check
```

`npm run check` runs the unit suite, Svelte/TypeScript checks, production build, asset checks, and browser acceptance tests. For a focused Node suite, `npm test -- workflow-compose` selects matching test filenames under `tests/`. To run one test case, use Node's test-name filter:

```sh
node --import ./tools/node-test-host.mjs --test --test-name-pattern="case name" tests/workflow-compose.test.mjs
```

Run one browser spec with `npx playwright test tests/browser/workbench.spec.mjs`. The smaller `npm run test:fast` targets `test/*.test.mjs`; the main `npm test` suite is discovered from `tests/`. Run a companion Python test module directly, for example `python3 companion/test_forge_service.py`.

## Architecture

- `index.js` integrates the extension with SillyTavern and delegates state, workflow execution, and UI work to `src/`. Svelte components in `ui/` present the editor; `src/ui/` prepares editor views and translates interactions into domain commands. Canvas rendering and gestures are in `src/canvas.js` and `src/canvas/`.
- Workflows are versioned graph documents with typed, named artifact ports. `src/workflow/catalog.js` defines operations and their controls/contracts; `graph-validation.js` and `resolve.js` validate and plan runs; `runtime.js` executes them. The graph's connections, not canvas placement, determine data flow.
- `src/run.js` and `src/workflow/host.js` integrate execution with live SillyTavern state. Native effects are staged and revalidated by `native-settlement.js` / `staged-effects.js`; preview, diagnostics, and Run to here are not acceptance. Review / Publish is the boundary for accepting a reply and settling its proposed story changes.
- `companion/forge_service.py` is the optional local Python HTTP service for roster guidance and the append-only event ledger. Companion map, terrain, rendering, and character tools are separate pipelines that consume authored data under `library/`, `companion/`, and `workflows/`.
- `ui/` is the build source for the committed `dist/lattice-ui.js` bundle. Rebuild and include the bundle when changing UI source; do not hand-edit generated output. `docs/developer-guide.md` and `docs/development.md` describe the architecture and build workflow in depth.

## Repository-specific conventions

- A new or changed workflow operation can cross the catalog, operation implementation, graph validation, editor controls/search/guides, saved workflow data, and tests. Follow the add-a-node guidance in `docs/developer-guide.md`; use catalog descriptors, defaults, and validators rather than inventing serialized fields.
- Keep graph edits within the existing checked-candidate/transaction flow. Editor projections are display contracts; private host handles and authority must not be copied into portable workflow data.
- Preserve the separation between proposing, reviewing, accepting, and persisting effects. A successful run or preview is not permission to write story state; preserve freshness, scope, and persistence checks when touching host operations.
- SpriteQuest intentionally translates engineering and agent concepts into story lore. When a design document crosses that seam, describe both the in-world expression and its concrete implementation. Keep repository engineering, tests, and git conventions ordinary rather than making them depend on fictional rules.
