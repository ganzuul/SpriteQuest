# LATTICE development guide

[Documentation](README.md) · [Operator's manual](operators-manual.md)

The installed extension uses the committed self-contained UI bundle in `dist/lattice-ui.js`. Users do not need Node.js, npm dependencies, or a CDN connection to load it. Development uses Node.js 24 or later and the pinned lockfile.

## Build and check

```powershell
npm ci
npx playwright install chromium
npm run check
```

`check` runs the Node behavior suite, Svelte type checks, production build, asset import checks, and browser acceptance tests. Commit regenerated `dist/lattice-ui.js` with UI source changes. Documentation-only edits do not require rebuilding the bundle.

| Location | Responsibility |
| --- | --- |
| `ui/*.svelte` | Workbench, nodes, shelf, Details, Preview, and manager presentation |
| `src/ui/` | Host orchestration, editor projections, scoped editing, navigation, and presentation state |
| `src/ui/native-search-catalog.js` | Canonical family node choices, search aliases, and checked pin-aware creation |
| `src/canvas.js`, `src/canvas/` | Graph gestures, camera, selection, geometry, cards, and connections |
| `src/workflow/catalog.js` | Registered operations, controls, phases, and artifact contracts |
| `src/workflow/operations/` | Operation implementations and deterministic primitives |
| `src/workflow/starters.js` | Eleven technical starter definitions used by fixtures and tests |
| `src/workflow/examples.js`, `src/workflow/example-data.js` | Validated bundled roleplay recipes and atomic independent-copy installation |
| `src/ui/example-catalog.js`, `ui/ExamplesBrowser.svelte` | Actual-package thumbnail projection and compact example picker |
| `tools/build-roleplay-examples.mjs` | Generate native roleplay packages and bundled runtime data from the authoring catalog |
| `examples/roleplay/` | Thirty lessons as 37 portable phase packages, including six embedded definitions |
| `workflows/`, `workflows/subgraphs/` | Portable workflow and subgraph packages |
| `tests/browser/` | Mock host and production UI acceptance fixtures |

Use `node tools/bump-version.mjs <version>` for release metadata and versioned import queries, then rebuild. Hard reload SillyTavern after updating installed assets so its modules load together.

Recipe authoring data lives in `docs/research/2026-10-09-lattice-example-catalog.json`. After changing its node settings, typed wires, comment groups, or subgraph drafts, regenerate the portable packages and `src/workflow/example-data.js`:

```powershell
node tools/build-roleplay-examples.mjs
```

The generator validates every package and embedded definition, including the authored model roles and call bounds. Runtime opening uses the bundled local data rather than reading the research catalog or fetching packages. `src/ui/controller.js` opens the independent primary copy as the active document; companion copies become available through **File → Recover previous workflows**. Opening an example does not change **Enable Lattice**.

`tests/workflow-example-execution.test.mjs` supplies seven native execution fixtures with synthetic host evidence and deterministic model adapters. They verify representative outputs, review/application boundaries, and memory behavior without live provider requests; they do not claim live-model validation of all thirty lessons.

## Local UI harness

`npm run harness` serves the mock host at `http://127.0.0.1:4178`. It loads the actual entry point, controllers, stylesheet, and committed bundle. The host provides synthetic data and does not represent a live provider integration.

`npm run smoke:install` checks an installed asset copy without developer source or `node_modules`. `npm run benchmark` measures camera and drag rendering on synthetic graphs. `npm run capture` records general renderer visuals in ignored development output.

`node tools/profile-workspace-interactions.mjs --label=final` measures pan, zoom, drag, and selection in the full mounted workspace on 25, 100, and 250-node fixtures. `--source=<checkout>` profiles an existing build for a matched comparison. Timings include instrumentation overhead; use the operation counts alongside them. `node tools/capture-interaction-polish.mjs` captures the search, Details handle, shelf scrolling, pin feedback, and left chat-bar logo using synthetic data. Both tools block provider requests and write ignored evidence under `benchmark-results/`.

## Reproduce documentation screenshots

```powershell
node tools/capture-documentation.mjs
```

This script uses the installed Playwright Chromium browser and a temporary local server on port 4186. It captures the current production UI into `docs/images/`; it does not build the bundle or download a browser. Make sure the port is free and the committed bundle matches the UI you intend to document.

The fixtures supply synthetic writing material, saved workflow data, layout positions, and the supplied Literal cleanup subgraph. Captures use actual navigation, settings panels, runs, and review controls. Completed examples must succeed with zero auxiliary model calls. All nonlocal requests and mutating HTTP requests are blocked; any page error or blocked request fails the capture. The script closes its browser and server afterward.

The 19 captures cover workspace orientation, context assembly, node shelf/search, operation Details, recorded preview, reply review, execution details, and subgraph instances, tabs, interfaces, and parameter overrides. The capture flow opens the Pre document as the active workflow without enabling Lattice. Connection profiles and optional model overrides belong in each node's Details. The shelf capture opens a family directly to canonical node rows; operation modes belong in Details. Subgraphs are created from canvas selection, edited through boundary Details, and saved with the wrapper context menu. The shelf offers Input/Output nodes and saved-definition context actions. An ignored evidence report is written to `benchmark-results/documentation-capture.json`.

When changing discovery metadata, keep one public choice per operation and retain mode/kind names as search aliases. Pin-aware creation can select a compatible checked configuration without adding duplicate public rows. Preserve saved node settings and distinct subgraph revision identities. Transpose's new Text creation defaults must coexist with saved nodes whose omitted Input type retains Draft → Patches behavior.

The capture also samples rendered wire paths to require forward flow and reject crossings through unrelated cards. Endpoint cards are excluded because wires originate at their pins.

After capturing, inspect the images for readable node names, controls, graph layout, and visible results. Run `node tools/check-documentation.mjs` to check local links/anchors, the registered-node inventory, current screenshot references, and public branding. Use ordinary screenshots of the running UI for operator instructions.

## Live model checks

`node tools/live-workflow-test.mjs` is disabled by default. A live session needs explicit current authorization for its provider, models, token caps, and request allowance. Use synthetic material, a current ledger, and the harness's request gate. Historical allowances are not authorization for a new session. Documentation capture uses no live model requests.
