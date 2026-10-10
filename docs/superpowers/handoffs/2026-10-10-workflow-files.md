# Workflow file handling implementation

The approved document model is implemented on `codex/workflow-files` in the managed `workflow-files` worktree. The original checkout remains untouched.

## Product behavior

- File owns New, Open, Open Recent, Open Examples, Save and Save As. The header displays the filename and document status. Recent lists ten real file handles and rereads their current contents; Clear Recent leaves the files intact.
- Browser-native file access supplies operating-system dialogs where available. Other browsers expose Open and Download JSON. A downloaded copy does not clear the disk-save checkpoint or authorize discarding a draft.
- All replacements share Save / Don't Save / Cancel. Invalid files, failed writes, external edits and stale completions preserve the current draft. Closing the workbench retains its document and cancels pending replacement.
- Send uses the open document with the existing Arm gate. Opening never arms or runs a workflow. Legacy pre/post documents and their manual execution remain supported.
- Editable `lattice-document` JSON preserves local connection IDs, supported controls, pinned definitions, local ownership and workspace presentation. Portable sharing export remains separate and removes local bindings. Runtime results, chat and credentials remain outside the authoring file.
- Settings retain preferences, reusable subgraphs and one recovery draft. Previous collections are migrated into separate recovery choices, including invalid originals and issue descriptions.

## Removed debt

Removed the workflow selector and its view contracts/CSS, collection Duplicate/Delete actions, Workflows assignment menu/status, assigned-ID runtime lookup, per-tab Save, New-only prompt, settings graph/view registries, and competing controller save maps. Examples are detached document factories. Public document activation replaces selector-driven test fixtures. Document authority and history remain coherent across public and versioned module URLs.

## Review and verification

Independent reviews covered storage/codec/session and integrated state/runtime/controller/UI. Addressed malformed recovery presentation, optional portable document IDs, malformed JSON envelope results, and previously silent Recent persistence failures. The controller also protects edits arriving during a save and pending replacements during close.

Native File browser regressions pass for Save As, same-file Save, dirty/cancel/discard guards, re-reading Recent, clearing the list, history reset, external-change protection and camera/close behavior. Normal and narrow File-menu screenshots were visually inspected. Native picker and writable boundaries are mocked in automated browser tests; these checks do not launch operating-system dialogs on each platform.

Full project verification is in progress; the final result is recorded below after completion.
