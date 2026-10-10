# Input Sources Implementation Plan

> **For agentic workers:** Use the existing parallel task ownership below and incremental red/green tests. Integrate through the current native workflow contracts.

**Goal:** Add discoverable Text, File Input, and Prompt Source Input nodes.

**Architecture:** Small source descriptors use existing Text artifacts and typed pins. The host owns prompt snapshots/freshness; the editor owns atomic file import. Existing JSON Decode supplies parsing.

**Tech Stack:** JavaScript ES modules, declaration contracts, Svelte, Node assertions, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-09-input-sources-design.md`

## Global constraints

- Schema 3, runtime 2, operation version 1; no new dependencies or model requests.
- Text limit 100,000 UTF-16 units; file byte limit 400,000; filename limit 255.
- Preserve existing checkout edits and existing saved graph semantics.

## Review focus

- Empty imported files are distinguishable from an unloaded node.
- UTF-8 errors and size errors preserve the previous snapshot.
- Delayed file reads reject stale editor captures.
- Host prompt overrides, disabled blocks, and unavailable macro expansion produce explicit outcomes.
- Host prompt changes during a model-backed run prevent settlement.

## Tasks

### 1. Source operations — input_operations

- [x] Add incremental failing contract tests, then `INPUT_OPERATIONS`, `describeInput(node,{phase})`, and `executeInput(node,{phase})` in `src/workflow/operations/input-nodes.js` plus declarations.
- [x] Verify literals, empty loaded files, unloaded files, limits, phase validation, and root-only Prompt Source metadata.

### 2. Host reader — prompt_reader

- [x] Add incremental failing selection tests, then `snapshotPromptSource(context,node)` and `promptSourceFingerprint(context,node)` in `src/workflow/prompt-source.js` plus declarations.
- [x] Verify raw/resolved selection, active system overrides, prompt entry enablement, missing/disabled sources, and text bounds.

### 3. File UI — file_details

- [x] Test and implement bounded strict UTF-8 `readTextFile(file)`.
- [x] Add `NodeDetailsView.fileInput` and `NodeDetailsActions.loadFile(selection,file)`, file picker UI, and prepared view projection.
- [x] Verify picker, errors, disabled read-only state, and actual loading in the browser.

### 4. Integration — main agent

- [x] Register source descriptions, runtime dispatch, types, palette icons/search, and root-only constraints.
- [x] Capture prompt sources with freshness checks in the host.
- [x] Read/import files through captured editor transactions; commit controls atomically.
- [x] Test source-to-JSON-to-Guidance execution, package persistence and subgraphs, and host settlement freshness.
- [x] Document the three nodes and run unit/type/build/assets/browser verification.
- [x] Obtain independent review of the completed changes and address actionable findings.

## Verification

- New source operation, prompt reader, file UI, integration, and host tests: 68 passed.
- Final isolated Input browser suite: 6 passed; includes both phases, undo/redo, portable snapshots, invalid files, multiline editing, and stale selections.
- Types: no errors or warnings. Assets: 287 versioned local imports verified. Build and installed-extension smoke passed without missing imports, errors, or provider calls.
- Broad unit run: 147/149 files passed during concurrent context-menu work; both affected unrelated files passed on retry. Broad browser run: 199/201 passed; both isolated retries passed.
- Independent review verified source freshness and guarded resolution against the installed host macro evaluator. No remaining actionable findings.
