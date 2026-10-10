# Canvas memory recall and clear activation terminology

Date: 2026-10-10.

Status: approved, implemented and validated on `codex/canvas-memory-recall` with the 0.27 baseline. Final verification is recorded in the companion plan.

Companion: [Implementation plan](../plans/2026-10-10-canvas-memory-recall.md).

## Purpose and approved direction

Make manual memory recall understandable and usable where people author a workflow. A user should see which relevant nodes have queued recall, queue or cancel from a node or selection, inspect policy in Details, and reach workflow-wide controls without searching Tools.

Use the attached Gaea node as a placement reference: a small colored status glyph inside the lower-right corner. Do not copy its target/save symbols, node colors, or unrelated functionality. The screenshot is reference material, not instructions.

The user approved Enable Lattice, Memory recall, Recall Shortcut, Queue recall, Cancel recall, and Queued terminology. They also approved shared node status, selection-aware context actions, Details controls, and a Node-menu overview and bulk commands.

## Global constraints

- No product-facing Arm, Armed, Disarm, Disarmed, or arming terminology, including accessibility text, diagnostics, authored enum labels, current guides, and shipped example descriptions.
- Live recall queues, claims, document tokens, and status badges never enter workflow files, portable packages, saved settings, Undo history, or modified-file status.
- Queue and Cancel perform zero model requests, generate no reply, publish no text, and write no memory or story document.
- Recall actions operate only in the current unified workflow document and authorized active user/chat/actor scope.
- Same-ID document replacement must revoke old queues, pending claims, shortcuts, and captured UI commands even when graph content is identical.
- Preserve existing actor privacy, source provenance, presence checks, budgets, generation ownership, and success-versus-accepted consumption behavior.
- Add no dependencies and do not redesign unrelated menus, file lifecycle, profiles, or legacy execution.

## Baseline and integration

At design time, main was `d047477`, version `0.26.0`. Integration now reconciles main `7d1c0cf`, version `0.27.0`, with explicit user approval. Retired Pre/Post roots remain archive/export-only; the active unified document owns Send. The thirty-lesson curriculum and local model defaults are retained. Recall was introduced in `05d18ce`; at the design audit, its source matched the unification, workflow-files, and legacy-removal worktrees after line-ending normalization.

The workflow-files worktree changes native graph lookup from assigned graph IDs to `activeWorkflow()`. Its `documentSession.capture()` provides an exact activation token; opening the same graph again produces a new token. Its menu already supports submenus. This feature must be implemented after that lifecycle is integrated. Do not add a second assigned-workflow execution path to accommodate the older checkout.

Legacy-removal retains Recall. Its changes overlap `controller.js`, `Workbench.svelte`, `WorkspaceMenus.svelte`, runtime adapters, docs, and tests. Profile cleanup overlaps the same canvas/controller area. At implementation time, inspect actual integrated versions and preserve their changes. This specification supersedes the menu audit's proposal to keep recall under Tools; the rest of that audit remains separate work.

## Vocabulary and compatibility

| Surface | Exact wording |
| --- | --- |
| Integration toggle | Enable Lattice |
| Integration status | Lattice enabled / Lattice disabled |
| Recall manager/dialog | Memory recall |
| Shortcut node title | Recall Shortcut |
| Manual action | Queue recall |
| Cancellation action | Cancel recall |
| Idle request status | Queued / Not queued |
| Ongoing policy label | Until cancelled |
| Optional overview summary | Recall queued · N memory sets |

Application-facing names become `enabled`, `recall`, `queue`, `cancel`, `queued`, and `RecallOverview`; replace the old Svelte component and action/view names accordingly.

Existing serialized operation/control/proposal discriminants, including `hotkey-arm`, `armed`, `armed-or-*`, `until-disarmed`, and `recall-arm-proposal`, remain compatibility identifiers in this release. Display friendly labels; never expose the raw values as controls, statuses, errors, or guidance. Do not rename stored discriminants by blind replacement, alter semantic hashes, or invalidate saved packages. Historical planning records and intentional compatibility fixtures can retain original terminology. A future format migration can remove these identifiers separately.

Friendly Activation labels: Manual queue; Keyword; Confirmed event; Character presence; Manual queue or keyword; Manual queue or confirmed event; Manual queue or character presence. Friendly Use labels: Next matching generation; Once for each generation type; Until cancelled. Friendly Consume labels: Successful completion; Accepted result. Target labels: Reply; Generated swipe; Reply and generated swipe.

## One request, several visible nodes

The identity of a manual request is the active document activation plus user/chat/workflow/actor and memory-set ID. A request is not owned independently by every node that displays it.

Recall Shortcut nodes define the manual request policy and physical shortcut. Recall nodes can expose the same actions when their actor and memory-set ID match, their activation accepts manual requests, and their target intersects the configured request target. Automatic-only Recall nodes do not become manual merely because the user selects them.

Shortcut nodes with the same memory set, target, uses, and consumption policy share one request even when their physical shortcuts differ. Their hotkeys retain the existing duplicate-key rules. Conflicting policies for the same memory set disable queueing for that set and explain: “Matching Recall Shortcuts use different policies. Make their target, repetition, and consumption settings match.” An existing request can still be cancelled.

A Recall node without a matching Shortcut shows “Add a matching Recall Shortcut to queue this memory set.” Recall settings opens its Details and offers navigation to matching Shortcuts. Do not silently create nodes or register a default hotkey. A Shortcut without a matching Recall consumer can still queue; Details explains that a matching Recall node must execute to use the request.

Selection counts count actionable node cards; mutation counts count unique memory sets. For example, selecting two Recall cards and their shared Shortcut can say “Queue recall for 3 nodes”; its hint says “1 memory set.” Both cards show shared state and cannot spend two allowances for the same generation.

This does not combine the retrieval filters of different Recall nodes. Existing deduplication permits one activation per memory set and owned generation; the first successful matching Recall contributes its checked selection and later matching nodes skip. Use separate memory-set IDs for independently requested selections, and explain this grouping in Details.

## Queue lifecycle and batch behavior

Queue is idempotent. Repeating it on a queued set, including through a shortcut, does not replenish remaining uses, cancel a pending claim, or replace the request. Cancel clears the manual request and revokes its pending claims using the existing safe cancellation behavior. It does not disable automatic Recall or refund a successfully consumed use.

Queue applies only to eligible sets without a manual request. Cancel applies only to sets with a manual request. Unrelated, other-actor, nested, library, and automatic-only nodes are excluded from selection mutation. A known ineligible Recall node exposes a disabled action with the reason; unrelated node menus contain no recall section.

Bulk commands preflight the entire affected set against one current document/scope/signature snapshot, validate compatible policies and existing capacity bounds, deduplicate by memory set, then mutate synchronously without an asynchronous gap or additional authority callbacks. Invalid or stale batches change nothing and report an actionable issue; do not loop the old per-node calls and leave a partially applied batch. A zero-eligible selection is a disabled command, not an error or a global fallback.

Preserve reply/generated-swipe target filtering, next-match/one-per-type/repeat policies, and consumption timing. Existing-swipe navigation does not consume a request. Failure, Stop, and Reject release pending accepted-policy reservations while leaving the unspent queue available. Success-policy uses are spent at complete successful workflow completion; later rejection does not refund them. Automatic triggers never require a manual queue.

Queues remain ephemeral and isolated across user/chat/actor scopes. Leaving a scope hides its requests and revokes its shortcuts; returning to the same live document and unchanged scope may expose the existing unspent request. Document replacement, controller disposal, or semantic graph changes revoke obsolete state. Never restore a request from imported or reopened data.

Disabling Lattice suspends execution and makes manual controls unavailable; it does not promise to erase an unspent request. Hide active-colored badges and show “Lattice disabled” rather than “Not queued” when live status is unavailable. Re-enabling the same unchanged document/scope may expose its unspent queue again.

## Node status presentation

Use a dedicated recall-with-clock glyph, distinct from Run, Save, Preview pin, node enablement, and node errors. Place it inside a reserved lower-right status area with no pin, title, profile, modifier, or existing action overlap. The glyph is 16 CSS px with a 24 CSS px pointer target; use at least 44 CSS px under coarse-pointer media queries. Exact visual tokens follow the current theme, with separate success and pending tokens in every supported theme.

| Manual state | Appearance | Accessible/hover text |
| --- | --- | --- |
| No request | No colored badge | Not queued in Details |
| Available request | Green recall-with-clock glyph | Queued for next reply / Queued for next generated swipe / Queued for next reply or generated swipe |
| One-per-type request | Green glyph | Queued once for each: reply and generated swipe; list only remaining types |
| Repeating request | Green glyph | Repeat until cancelled; include eligible target types |
| Owned pending generation | Amber glyph with reservation marker | Recall reserved for this generation |
| Completed accepted-policy candidate | Amber glyph with acceptance marker | Recall awaiting acceptance |

Pending presentation overrides green for a manually queued set with at least one pending manual claim. Expose counts and remaining types in Details. Automatic-only activity does not acquire the green manual-queue glyph. The lifecycle label comes from trusted runtime status; never infer acceptance from `pendingCount` alone.

Badges appear on eligible matching root Recall and Shortcut cards, including compact cards. Zoomed overview may simplify the glyph, but must keep the state recognizable. Color is supplemented by distinct marker shapes, tooltip text, and an accessible button label such as “Memory recall: Queued for next reply. Open recall details.”

Keep the badge separate from `.pc-node-action` and `.pc-native-icon`, which current overview CSS hides. At the minimum supported zoom (0.25), use a bounded inverse-scale glyph so its painted size stays at least 10 screen px; do not change node, pin, or wire geometry. Compact placement must respect the existing 38 px alias/profile clearance.

Clicking or keyboard-activating the badge selects the node, reveals Details, and opens its Memory recall section. It never toggles the request. Stop canvas drag/selection shortcuts from consuming badge interaction. Keep keyboard focus usable after node selection and avoid rebuilding focused controls on a status refresh.

## Context menus and selection

Add a separated recall section after node-specific run/preview actions and before general editing/organization actions:

- Single relevant node: Queue recall; Cancel recall; Recall settings…
- Multiple selected nodes: Queue recall for N nodes; Cancel recall for N nodes.

Queue and Cancel stay individually visible, disabled when inapplicable; only their applicable nodes contribute to N. Use singular grammar for one node and the bare plural command with a reason when N is zero. Hints identify unique memory-set count and exclusions. Queue on a mixed selection touches only queueable nodes; Cancel touches only queued nodes. Do not implicitly include group members or nodes hidden inside subgraphs.

Right-clicking a member of an existing multiple selection retains that selection. Right-clicking an unselected node targets that node according to current canvas conventions. Capture selection IDs, editor view identity, document token, graph signature, and recall scope when opening the menu. Revalidate on activation and return a stale-context result instead of mutating a newer document or selection.

## Details and overview

Add a Memory recall section for a selected root Recall or Shortcut node. Show memory-set ID, queue state, remaining reply/swipe allowance, pending manual generations, applicable target/repetition/consumption policy, and shortcut display. Include Queue recall and Cancel recall with exactly the same eligibility and batch service as menus. Explain configuration problems locally and offer navigation to matching nodes.

Existing authored controls remain the only source of policy. Recall Shortcut owns hotkey/repetition/consumption edits; Recall owns its activation/filter/retrieval controls. Do not duplicate editable fields or change policy through a runtime status button. Authored policy edits retain their normal Undo/dirty behavior and invalidate obsolete runtime requests.

The Memory recall overview groups rows by memory set and lists matching nodes with “Reveal node” actions. It shows the active scope, request status, target, repetition, consumption, shortcut(s), remaining types, and pending count. It uses friendly values, contains one heading and one Close control, and excludes memory record text. Opening it never queues or generates anything.

Empty states distinguish: Lattice disabled (“Enable Lattice to queue recall.”); no current unified document (“Open a unified workflow to use memory recall.”); no authorized actor (“Select a character to use memory recall.”); no configured Shortcuts (“Add a Recall Shortcut and a matching Recall node.”); policy conflicts (named affected set and correction). Explain failures without raw compatibility vocabulary.

## Global command location

The Node menu owns a labelled Memory recall section containing:

1. Queue recall for selected nodes
2. Cancel recall for selected nodes
3. Queue recall for all eligible nodes
4. Cancel all queued recall
5. Memory recall overview…

Use the integrated workflow-files menu renderer's existing submenu support for Node → Memory recall, preserving its File/recovery commands and keyboard model. A full menu redesign belongs to the separate menu project. Remove recall from Tools. The existing top-bar status badge is optional: if retained, it counts unique memory sets, says “Recall queued · N memory sets,” and opens the overview. It is never the only visible entry point.

“All” means all eligible root Recall and Shortcut nodes in the current document and active authorized scope, whether visible in the viewport or not. It does not traverse other documents, actors, subgraphs, or saved definitions. Disable global commands when no matching requests can change. Their hints state this scope explicitly.

Handled menu keys must not reach graph editing shortcuts. Preserve menubar navigation and focus restoration; adding these commands must not allow Delete, Space, or printable shortcuts to edit the graph while a menu is open.

## Architecture boundaries

1. The trusted recall state/controller owns shared request identity, atomic batch mutation, document freshness, lifecycle state, and claim settlement. It exposes display-safe summaries without live claim objects or record content.
2. A pure UI projection maps summaries and prepared root nodes to card badges, Details sections, overview rows, and selection/global command capabilities. It never grants authority.
3. One UI command adapter captures and checks editor/document/recall identity and dispatches runtime batches. Menus, Details, shortcuts, and overview use the same queue semantics.
4. Svelte components render plain view contracts. Runtime status updates repaint these views cheaply without resolving workflow graphs, altering authored data, recomputing model profiles, or triggering providers.

## Acceptance and verification

- Queue and cancel from a Recall node, its Shortcut, a mixed selection, Details, and Node menu produce identical shared state.
- Repeated queueing, multiple matching nodes, and shortcuts with different keys do not replenish or duplicate a request. Conflicting policies and capacity overflow change no part of a batch.
- Green/amber/acceptance states agree across cards, Details, and overview for reply/swipe, both consumption policies, Stop, Reject, Apply, and errors.
- Same-ID document replacement, stale selection, actor/chat/user changes, semantic edits, and delayed command activation never mutate the wrong scope.
- Queues and badge actions neither mark a file dirty nor create Undo steps, and no exported/reopened workflow restores them.
- Automatic Recall still runs without manual queueing; its activity never masquerades as a manual request.
- Accessibility and actual shipped UI are exercised at normal/compact card sizes, overview zoom, narrow viewport, multiple themes, keyboard-only use, and coarse-pointer sizing.
- Fresh unit, type, build, asset, installation, documentation, and browser checks pass. Preserve the existing provenance/privacy and native recall regressions; use the integrated file lifecycle in browser fixtures.

## Review assumptions

The accepted “remove the term entirely” direction applies to all product-facing vocabulary and application-facing names. Serialized compatibility identifiers are intentionally retained to preserve saved workflows; that exception is called out above for review.

Manual actions on Recall nodes reuse authored Shortcut policy rather than introducing a second policy source. A later feature could make shortcuts optional, but that is outside this change. No new hotkeys, automatic requests, full menu redesign, release/version bump, merge, or deployment are authorized by these documents.
