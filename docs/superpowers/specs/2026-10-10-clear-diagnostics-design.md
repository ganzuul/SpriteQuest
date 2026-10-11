# Clear Lattice messages

The user approved the workshop proposal on 2026-10-10 and authorized implementation. The aim is for people to understand what happened, what it means for their work, and the next useful action without understanding Lattice internals.

## Scope and behavior

Use a shared, pure diagnostic presenter across errors, warnings, empty states, disabled actions, validation, connections, import/export, Workflow Data, Recall, and review/saving. Preserve stable service error codes and runtime safety checks. Do not alter execution, acceptance, privacy, save verification, or retry authority to make an error disappear.

Messages use visible node and control names. Expected setup, waiting, skipped branches and user cancellation are informational. Degraded or partial outcomes are warnings. An action that failed or is blocked is an error. Unknown failures have an honest plain-language fallback, with no invented cause or blanket retry suggestion. Keep bounded technical details behind an accessible disclosure; never expose credentials or raw private source content.

The presenter accepts a string or a plain error record plus optional context, and returns a plain DiagnosticView containing a stable id, severity, title, message, optional sanitized technical code/message, and optional node location. Cause-specific matching must precede broad code families, because some codes have several causes. The presenter is deterministic and has no host access, side effects, callbacks, or model requests.

## Preview and actions

Distinguish not run, running/waiting, intentionally skipped, failed upstream, outdated/removed sources, and absent retained output. A failed output does not also display a generic empty-state complaint. Show each originating diagnostic once within a panel; do not collapse independent failures at different node addresses. Earlier output remains explicitly labeled as earlier output.

Prevent Run to here paths that depend on On Send or Generate Reply before executing any model dependency. This restriction affects manual previews only; ordinary SillyTavern Send continues normally. Explain: "This step starts when you send a message. Enable Lattice, then send a message in SillyTavern to run this workflow." Source-free preparation and response paths remain runnable. Maintain request bounds.

Explain disabled Run/Apply controls in visible text associated with the control. Safe navigation actions may reveal the affected node or configuration; do not automatically send, rerun models, apply replies, or repeat writes. Retry failed saves retains the accepted reply, retries only authorized failed targets, and makes no model request. Unknown or unverified save outcomes are never described as failed writes eligible for retry.

## UI and coverage

An accessible reusable diagnostic disclosure provides consistent plain copy and technical details. Text conveys severity; color is supplemental. Avoid duplicate live announcements or automatic focus changes. Toasts use concise presented copy and appropriate severity; persistent panels own the explanation and details. Confirmations describe the consequence and use existing choices.

Document an inventory of message families and display surfaces, including exceptional raw error paths. Add presentation at every user-facing diagnostic boundary. Tailor common known errors and use a readable conservative fallback for internal validation errors. No new runtime dependency or generic rule engine.

## Verification

Use incremental red/green tests for cause/context selection, neutral states, unknown failure privacy, deduplication, preflight preventing paid work, source-free previews, and saving uncertainty. Exercise actual Svelte components with keyboard-accessible disclosures and disabled explanations. Run the full unit suite, Svelte type check, build, asset checks, and browser suite. Inspect a captured diagnostic panel. Other changes in the original checkout are excluded; work occurs in the attached managed worktree.
