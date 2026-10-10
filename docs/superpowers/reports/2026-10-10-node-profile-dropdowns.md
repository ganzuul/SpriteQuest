# Node profile controls — acceptance report

Implemented on `codex/node-profile-dropdowns`, based on `94c05fa08c57516f6420c6b5de349bbaab4ade9f`, in the managed worktree.

Every currently model-calling node has the approved grey searchable profile bar below its card and detected model-only text above. New model-capable nodes explicitly choose **Active SillyTavern model**; that option stays first during search and follows the current host connection at request time. Existing fixed profiles, legacy role inheritance, explicit instance blocks, model overrides, and pinned occurrence ownership are preserved.

The picker supports AND keywords, wrapped result names, selected checkmarks, keyboard selection, independent wheel scrolling, outside dismissal, and stale-context rejection. An unmatched query plus Enter leaves the binding unchanged. Profile edits use the existing persistence and Undo/Redo path. Missing profiles remain unavailable; library entries remain read-only.

Visual acceptance used the actual four-node workbench at normal width and at 736px with a nonidentity camera. The plug icon, search strip, colours, spacing and typography were compared with the approved mock. Measured CSS matches: popup 330px, results cap 244px, bar minimum 35px, card-to-bar gap 7px, model/bar/result text 11/12/13px. Native card geometry is preserved: the captured 129.734px cards and bars align exactly, and long model names wrap on those narrower cards. Screenshots and metrics are retained locally under `.tmp/node-profiles/`.

Final verification:

- Complete unit suite: **175/175 test files passed** on the final source tree.
- Complete browser suite: **266/266 passed** against the final bundle and corrected synthetic role-inheritance fixtures.
- Svelte/TypeScript: **0 errors, 0 warnings**.
- Production build: **159 modules**, successful.
- Asset verification: **315 versioned local imports**, successful.
- Final real-UI capture: **1/1 passed**, with normal and narrow screenshots inspected.
- Git whitespace check: clean.

Independent task reviews, scoped fix reviews, the broad branch review, and the verification-fixture review passed after their findings were addressed. Runtime checks cover active routing, host-selected token limits, cancellation, public-settings freshness, supported model-less text routes, completion evidence, and portable active markers. Installed host source also confirms that node model overrides reach native model conversion before token-alias and reasoning decisions. Automated transports were simulated; validation made no paid provider requests.
