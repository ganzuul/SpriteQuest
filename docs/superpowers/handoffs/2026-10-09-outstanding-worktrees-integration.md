# Outstanding worktree integration

The user requested merging all outstanding worktree work and pushing main. The integration starts at main `9d07f5a848cda078f6f2e17c0d2d6f5178d3a0fe` and produces release **0.23.0** in the existing attached `lattice-native-finish` checkout, on `codex/merge-outstanding-worktrees`.

## Included history

| Source branch | Audited tip | Integration |
| --- | --- | --- |
| `codex/lattice-tools-completion` | `7fc01cfee1538caca2c70e9979779826e357a9e4` | Merge `5336bdf`: native Transpose operations, permission-preserving cleanup, policy assets and reusable workflow library |
| `codex/lattice-introspection` | `be33afee9801829df425f8527c5338b1c271e25b` | Merge `164069f`: scoped contracts, analysis, Context/State, Memory adapters and package harness |
| `codex/lattice-reference-tools` | `134f6514d33022a5b012893ef0ca08bc4b79396a` | Merge `467b0c8`: predecessor history and four unique historical documents; newer completion implementation retained |
| `codex/lattice-node-primitives` | `eb527498a790225b25bf1db991085399e4c89018` | Merge `b29798c`: 14 already integrated patch-equivalent commits and the unique delivery-acceptance record |
| `codex/lattice-workspace` | `768128b08a2ce81c96277664e70610081062ae15` | Already an ancestor of main |
| `codex/lattice-rebrand` | `8d1ac56ccd62ad6544d0ead50c584cd72a7ea2c4` | Already an ancestor of main |
| `codex/native-workflows` | `a5b8d815a32d03bfdeb529e153d87b60447f4c3d` | Already an ancestor of main |
| `codex/svelte-ui-migration` | `2308c830543070785bc5f003c5896b6df404a5d4` | Already an ancestor of main |

All source worktrees had clean tracked/index/untracked status at inventory. All ten worktree tips and every local branch commit are reachable from integration HEAD. Source worktrees, branches, dependencies and ignored review/benchmark artifacts are retained. The newer native architecture and completed canvas interaction changes remain intact.

## Final release checks

- `npm run check`: 125/125 Node test files; Svelte diagnostics 0 errors and 0 warnings; Vite build 146 modules; 256 consistently versioned local imports; 150/150 browser tests.
- `npm run smoke:install`: fresh copied installation without dependencies or developer UI source; 84 asset requests; no missing assets, browser errors, API requests or provider calls.
- `npm run capture`: all 15 required workspace states passed, including fresh/narrow/high-DPR launches, child view, real running and real failure.
- `node tools/capture-documentation.mjs`: 20 current screenshots, no browser errors or blocked requests. Six screenshots changed; approved Ember reference images are untouched.
- `node tools/check-documentation.mjs`: 7 public documents, 117 local links, 19 registered operations and 20 screenshots passed.
- Independent read-only reviews found no tools/library/UI or Introspection package merge blockers.

The installation audit initially misidentified the new `src/workflow/introspection/memory.js` as the retired memory reader because it compared basenames. It now allows only that exact canonical installed path. All other retired module copies and imports still fail the audit. The rerun passed.

## Preserved primary work and package prerequisites

The primary checkout's original 19 untracked files and four approved Ember files match their original SHA-256 preservation records. New uncommitted zoom/camera source, test and generated-asset edits appeared in the primary checkout during integration. They are ongoing work outside this worktree merge; the primary checkout is left intact. The integration does not reset, stash or overwrite them. An additional ignored preservation manifest records the primary state before publication.

Introspection is merged as authored: its three manifests retain `integrationRequired: true`. Its modules and portable harness are available, but native catalog/menu/runtime mounting, trusted host settlement and atomic cross-writer metadata coordination remain required. See [the package guide](../../introspection-package.md) and [the authored handoff](../../research/2026-10-09-introspection-package-handoff.md). It does not yet add canvas nodes.

The prepared release is published through a normal push to `origin/main`. Verify the published SHA through GitHub CLI and `git ls-remote`; retain the actively edited primary checkout until its concurrent work can be reconciled independently.
