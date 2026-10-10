# Recall integration with Lattice 0.27

The user approved integrating canvas memory recall in a managed worktree, then explicitly approved reconciling main's 0.27 changes. This reconciliation merges main `7d1c0cf8b474484622152b7b14b86cce51ed8822` into `codex/canvas-memory-recall`, whose feature tip was `7ccb2da39738f5401783b8d7a62db982f70b7968`.

Worktree: `C:/Users/Keptin/.codex/worktrees/canvas-memory-recall/SillyCanvas`. Main and the source workflow-files checkout remain unchanged by this integration. Pushing, release, deployment and merging this feature into main are outside the approved plan.

## Resulting behavior

- The open unified document owns Send. Enable Lattice remains a separate preference. Retired Pre/Post roots remain archived for export and cannot be activated, recovered or opened as editable workflow files.
- The thirty-lesson remastered curriculum, current model defaults, portable Fast Decision selector cleanup, actor/memory provenance and authorization ordering remain intact.
- Active document files retain local model bindings, save checkpoints, guarded replacement, recent files and valid unified recovery drafts. Legacy recovery candidates fail before prompting to replace a dirty document.
- Recall Shortcut nodes and eligible Recall nodes show green queued or amber pending badges. Details and context actions queue/cancel a node or selection; Node → Memory recall provides selected/all commands and a grouped overview.
- Matching nodes and different shortcut keys share one request per memory set. Requeue cannot replenish or revoke pending use. Queue state remains ephemeral and does not dirty the document, alter Undo history or invoke a provider.
- Document activation revokes old queues, claims, shortcuts, captures and displayed run evidence, including reactivation of the identical graph object. Late old-document completions and delayed acceptance saves cannot replace current Send output. A fresh Send completed while the canvas is closed remains reviewable when reopened.
- Product wording uses Enable Lattice, Memory recall, Recall Shortcut, Queue recall, Cancel recall, Queued and Until cancelled. Existing serialized compatibility discriminants remain unchanged.

## Reconciliation and verification

Source and fixture conflicts were resolved against 0.27's unified-only execution. Removed legacy modules, example generators and suites remain deleted. New document/session admission tests cover retired inputs and exact activation ownership. Current documentation and teaching prose were updated; generated lessons retain the main baseline's operational controls, bindings, wires, groups and pinned definitions. All local module cache URLs use `0.27.0`; distributed assets were rebuilt.

The [implementation plan](2026-10-10-canvas-memory-recall.md) records completed validation and integration.

| Check | Result |
| --- | --- |
| Full Node gate, `npm run test` | 256/256 test files passed in the final complete rerun |
| Complete Playwright suite, CI, port 4189, two workers | 287/287 passed |
| Final host/session ownership regression suites | 127/127 passed; 15/15 settlement cases also passed with the repository's preloaded test host |
| Svelte/type check | 0 errors, 0 warnings |
| Production build | Passed, 173 modules |
| Installed/versioned assets | 505 imports; one native domain module graph; self-contained UI |
| Documentation check | 11 guides, 227 local links, 75 operations, 20 screenshots |
| Installed extension smoke | 149 requests, no missing assets/errors, zero API/provider calls |
| Visual inspection | Dark, custom light, narrow, compact minimum zoom; 44 × 44 touch targets and 10 × 10 minimum glyphs |
| Independent review | No remaining findings after exact-document and delayed-save fixes |

Verification used local host/provider fixtures. There were no live provider calls or chat writes. Per-gate output and visual captures are retained in the ignored `.superpowers/sdd/2026-10-10-canvas-memory-recall/` directory of this worktree.
