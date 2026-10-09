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
| `src/canvas.js`, `src/canvas/` | Graph gestures, camera, selection, geometry, cards, and connections |
| `src/workflow/catalog.js` | Registered operations, controls, phases, and artifact contracts |
| `src/workflow/operations/` | Operation implementations and deterministic primitives |
| `src/workflow/starters.js` | Included example definitions |
| `workflows/`, `workflows/subgraphs/` | Portable workflow and subgraph packages |
| `tests/browser/` | Mock host and production UI acceptance fixtures |

Use `node tools/bump-version.mjs <version>` for release metadata and versioned import queries, then rebuild. Hard reload SillyTavern after updating installed assets so its modules load together.

## Local UI harness

`npm run harness` serves the mock host at `http://127.0.0.1:4178`. It loads the actual entry point, controllers, stylesheet, and committed bundle. The host provides synthetic data and does not represent a live provider integration.

`npm run smoke:install` checks an installed asset copy without developer source or `node_modules`. `npm run benchmark` measures camera and drag rendering on synthetic graphs. `npm run capture` records general renderer visuals in ignored development output.

## Reproduce documentation screenshots

```powershell
node tools/capture-documentation.mjs
```

This script uses the installed Playwright Chromium browser and a temporary local server on port 4186. It captures the current production UI into `docs/images/`; it does not build the bundle or download a browser. Make sure the port is free and the committed bundle matches the UI you intend to document.

The fixtures supply synthetic writing material, saved workflow data, layout positions, and the supplied Literal cleanup subgraph. Captures use actual navigation, settings panels, runs, and review controls. Completed examples must succeed with zero auxiliary model calls. All nonlocal requests and mutating HTTP requests are blocked; any page error or blocked request fails the capture. The script closes its browser and server afterward.

The 20 captures cover workspace orientation, context assembly, node shelf/search, setup, operation details, recorded preview, reply review, execution details, and subgraph instances, tabs, interfaces, and parameter overrides. An ignored evidence report is written to `benchmark-results/documentation-capture.json`.

The capture also samples rendered wire paths to require forward flow and reject crossings through unrelated cards. Endpoint cards are excluded because wires originate at their pins.

After capturing, inspect the images for readable node names, controls, graph layout, and visible results. Run `node tools/check-documentation.mjs` to check local links/anchors, the registered-node inventory, current screenshot references, and public branding. Use ordinary screenshots of the running UI for operator instructions.

## Live model checks

`node tools/live-workflow-test.mjs` is disabled by default. A live session needs explicit current authorization for its provider, models, token caps, and request allowance. Use synthetic material, a current ledger, and the harness's request gate. Historical allowances are not authorization for a new session. Documentation capture uses no live model requests.
