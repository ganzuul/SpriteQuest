# Stateful workflow subgraphs and composed guidance

Date: 2026-10-10
Status: Approved feature scope; implementation authorized in an isolated worktree.
Base: a049df68442cfaa3d91d767767fbc9b9643a94fc

## Intent

A user can build one small Main workflow from independent magical-item, relationship, weather, or other reusable system subgraphs. Each body is editable in a tab. Connected systems run automatically within the same native reply cycle. The workflow file owns composition; no persistent graph-to-story attachment is introduced.

Use existing nodes and typed boundaries. Main retains exactly one On Send, Generate Reply and authoritative Review / Publish. Tabs are editor views. Connections determine influence and dependencies.

## Global constraints

- Keep schema 3, runtime 2 and existing operationVersion 1 contracts.
- Add zero public node types; extend Compose, subgraph capabilities and editor commands.
- Preserve old Compose settings, section.NAME pin IDs, literal fallbacks, templates, separators and pinned semantic hashes.
- Native generation and acceptance remain owned by the enclosing Main workflow.
- Preview, Run to here, rejection, cancellation and public runner calls never publish or persist effects.
- Preserve actor, user, chat, source, document-reference and currentness authorization; portable bytes never grant authority.
- Keep For Each host-operation restrictions and native lifecycle/source root-only rules.
- Keep duplicate writes to one target rejected; no silent last-writer-wins or claim of atomic disk saving.
- Use Node.js 24 or later and the existing locked dependencies; no new runtime dependency.
- Leave F:/git/SillyCanvas and its unrelated uncommitted changes untouched.

## Compose upgrade

Each section remains an own plain record with name:string and text:string. Add optional kind:'text'|'guidance' (default text), required:boolean (default false), and onSkipped:'fallback'|'omit' (default fallback). Its input pin stays section.NAME, with the declared artifact kind and required status. Ordering is section-array ordering.

Completed connected artifacts override literal fallback. Unconnected optional sources retain literal fallback. Connected skipped sources configured omit contribute no join section and bind an empty value in template mode. Required missing inputs remain validation failures. Required skipped and unresolved connected inputs follow the existing runtime's skip/hold rules.

Compose Guidance receives original Guidance artifacts directly. It preserves conservative visibility and original contribution identity. Generic private Text/Data, copied guidance metadata and serialized provenance do not acquire native guidance authorization. Public contributions and authentic current-selected-actor Character Direction or Recall may compose into one private native injection, with each original revalidated at every existing injection currentness check. Other-actor and hidden contributions remain blocked. Reentrant tokenizer/prompt callbacks, changed sources and cancellation revoke admission.

Introduce budgetTokens: integer 0..8192, default 0, where 0 preserves the absence of an additional Compose cap. Generate Reply retains its existing final budget check. Nonzero Compose caps measure the rendered output using the supplied tokenizer, hold on overflow, and never truncate instructions. Reports expose ordered contribution status and the measured total, while existing Preview displays the exact final text. New default controls are elided from semantic hashing so existing pinned definitions remain valid.

Keep the pure composeText renderer's existing contract. Retain aggregate native authorization in a per-run private registry after output privacy preservation, modifiers and freezing; never serialize authority. Modified or forged aggregate output cannot inherit authentic constituents' grants.

## Stateful static subgraphs

Permit exactly the existing Read File, Write to File, Story Clock, Clock Commit and Outcome Commit operations inside statically composed definitions. A single trusted operation allowlist controls validation, discovery, editor availability and host dispatch. The host delegates its captured scoped sessions to these operations; arbitrary nested primitives do not become root operations.

Keep Memory, Recall, Recall Shortcut, On Send, Generate Reply, Review / Publish, Scene Context, Reply Snapshot and existing explicitly root-only source/publication operations under their present contracts. Native actor guidance that is already legal in subgraphs keeps its existing authorization.

Nested stateful nodes may span Preparation and Response in one native-unified body. Their retained effects join the exact Main accepted result. File write intent identity includes full workflow/instance/node address; sibling instances with identical internal IDs cannot collide. Canonical event/random identities and retained replay caches keep their existing meaning.

Default Chat clock remains shared, including in systems. Default notes and outcomes used inside a subgraph receive stable instance-scoped targets based on workflow and full instance path. Root defaults and explicit author-selected targets retain existing identities. All related read/write/ledger controls resolve consistently without mutating pinned definitions; default provisioning discovers only selected active operations. Explicit shared destinations remain subject to duplicate-write checks.

## System enable control

The existing subgraph enabled property becomes a whole-system participation control. A disabled wrapper skips its entire descendant tree, including host reads, model calls, terminal effects and default provisioning. Its connected outputs are recorded skipped so optional Compose sources can omit them. Required consumers follow normal skipped-input semantics. Explicitly disabled primitive dependencies keep their existing validation behavior. Incomplete enabled systems produce addressed diagnostics before calls or effects.

## Add system authoring

Add Workflow -> Add system... in a unified root workspace. The command is root-scoped even when an instance tab is focused. Choose a saved reusable subgraph, configure exposed values, select explicit typed source bindings and output destinations, and preview the resulting connections. Required inputs must be bound; optional ports can remain unused. Ambiguous sources require selection, and occupied destination pins are never replaced implicitly.

A preparation Guidance output can connect to a selected existing Compose Guidance node or a newly created one. Create a uniquely named optional Guidance section with onSkipped:omit. For a new Compose, connect its output to the one native generator only if the generator guidance input is empty; an occupied generator input requires an explicit chosen existing merge point.

The insertion, definition closure, local editable copy, overrides, optional source adapters, Compose section and wires are one stale-checked transaction and one undo operation. The inserted body opens in a tab. State-only systems are valid additions through their staged terminals. Other outputs require explicit legal destinations and do not inject automatically.

Workflow Save/Open retains the complete root, definitions, overrides and opened tabs using the existing editable document format. Portable packages retain graph composition and definition closure; no new multi-root file/runtime format is introduced.

## Verification

Use incremental red/green tests for each behavioral addition. Cover backwards-compatible pinned packages; typed and skipped Compose sources; exact private guidance authorization and reentrancy; scoped stateful subgraphs with duplicate local IDs; shared clock/scoped default targets; preview/rejection/cancellation; disabled systems; atomic insertion/undo; and saved tab restoration.

Provide one combined multi-system example built only from existing operations and subgraph boundaries. Run the full Node suite, Svelte/type checks, production build, installed-asset checks and browser acceptance suite. Review the whole branch independently and fix substantive findings before reporting completion.
