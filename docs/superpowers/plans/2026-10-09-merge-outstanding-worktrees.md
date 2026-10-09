# Outstanding worktree integration plan

> **For agentic workers:** Use the existing branch-finishing and verification workflow; resolve conflicts in the attached integration worktree and keep source worktrees intact.

**Goal:** Merge all outstanding authored worktree history into main and push the verified result, as requested by the user on October 9, 2026.

**Architecture:** Start from `9d07f5a` (0.22.1) in the clean attached worktree. Merge current reference-tools completion and Introspection branches first, then their older predecessor/documentation histories. Resolve overlaps in favor of the current native architecture and preserve the completed interaction polish.

**Tech stack:** JavaScript native workflow domain, Svelte workspace, Node behavior suite, Playwright browser checks.

## Constraints

- Preserve all source worktrees and local ignored artifacts; do not reset or delete them.
- Preserve the primary checkout's 19 unrelated untracked files and four approved Ember reference files.
- Leave new zoom/camera edits authored concurrently in the primary checkout intact; update that checkout only if it is clean.
- Retain actual typed admission, edit authority, privacy/permission guards, Undo, and current native-only behavior.
- Merge Introspection as authored; its documented host/UI mounting prerequisite remains explicit.
- Use GitHub CLI with network permission for GitHub actions; publish through a normal push without force.

## Tasks

- [x] Inventory every worktree, committed divergence, patch-equivalent history and uncommitted work.
- [x] Merge tools completion and Introspection; resolve source, UI and release metadata conflicts.
- [x] Merge older reference and primitive histories, retaining unique records and newer production behavior.
- [x] Bump one consistent release version, regenerate bundle, and run the full suite plus affected capture/install checks.
- [x] Review all branch-tip reachability, preservation hashes and the combined result.
- [x] Prepare the verified release for main publication; preserve concurrent primary edits and report remaining package prerequisites.

## Publication

Publish the verified integration commit with a normal `git push origin HEAD:main`, then compare its SHA with GitHub's main commit and `git ls-remote`. The primary checkout began clean apart from 19 preserved untracked files, but received additional zoom/camera edits during verification. Those changes belong to ongoing work and are excluded from this integration; leave the primary checkout intact rather than fast-forwarding over them.
