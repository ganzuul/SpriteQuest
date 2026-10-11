# Diagnostic presentation inventory

Audit date: 2026-10-10. Scope: current source tree, including service producers, non-component UI projections, native DOM menus, Svelte components, launcher, and runtime notifications. Service codes remain unchanged. A family can contain multiple causes; the presenter selects specific causes before general codes. Unknown source text is omitted from both visible copy and technical details.

## Active presentation boundaries

| Producer family | Known source strings or codes | Active display and presentation boundary |
| --- | --- | --- |
| Runtime/host workflow results | `BUSY`, `ABORTED`, `CANCELLED`, `STALE_SOURCE`, validation and request errors | `src/run.js` `onResult` → `presentDiagnostic` → toast method selected from severity; persistent Preview/Run Details own detail |
| Launcher startup | arbitrary thrown host exception | `index.js` boot catch → `presentDiagnostic`; console keeps developer exception, toast never receives it |
| Enable Lattice state | `Open a valid unified workflow.`, invalid workflow validation, `Lattice is off. Enable it to run the open unified workflow on Send.` | `src/run.js` `sendWorkflowState` presents validation; `index.js` chat-bar title/settings label and explicit info toast show state |
| Controller error notifications | prepared edit/connection/library/document/Recall Result errors; arbitrary export exception | `src/ui/controller.js` `toast` → presenter, preserving records/codes; `warning` stays warning. Explicit info/success strings remain ordinary notices |
| Workflow document load/save | `FILE_READ_FAILED`, `FILE_WRITE_FAILED`, `FILE_PERMISSION`, `FILE_NOT_FOUND`, `FILE_CONFLICT`, `FILE_DOWNLOAD_FAILED`, `MALFORMED_WORKFLOW` | `workflow-file-access.js` returns stable Result errors; `document-controller.js` presents document status and reports original record to controller toast; WorkspaceMenus status/DiagnosticMessage |
| File cancellation | `FILE_CANCELLED`: `The file operation was cancelled.` | File access marks cancellation; document controller suppresses an unnecessary error notice; presenter treats the state as information |
| Browser recent-file persistence | `RECENT_STORAGE_FAILED`: `Recent workflow files could not be persisted in this browser.` | File-access warning deduplicates; controller hands it to document `storageIssue` → presenter → document status. A completed disk operation stays successful |
| Disk conflict | `This workflow file changed outside Lattice. Use Save As to preserve your draft without overwriting those changes.`, `This workflow file changed immediately after saving. Your draft remains open; use Save As to preserve it.` | File access preserves conflict result; document status/toast/WorkspaceMenus present; no automatic repeated write |
| Dirty-document replacement | `The document changed while the prompt was open. Try again.`, `New changes arrived while saving. Save them before switching documents.`, `Finish saving the JSON copy, then choose Don’t Save when you are ready to switch documents.` | Document controller status/report and DocumentPrompt; existing Save/Don’t Save/Cancel choices remain |
| Successful document saving | `Saved <filename>.`, `Saving a JSON copy. Your draft stays open.` | Document status and explicit success/info notification; browser download never clears a native save checkpoint |
| File Input source | `FILE_TOO_LARGE`: `Choose a file no larger than 400,000 bytes.`; `FILE_READ_FAILED`: `The selected file could not be read. Choose it again and retry.`; `FILE_INVALID_UTF8`: `This file is not valid UTF-8 text. Choose a UTF-8 text file.`; `FILE_CONTENT_TOO_LARGE`: `Choose a file containing at most 100,000 UTF-16 code units of text.`; `FILE_NAME_INVALID`: `Choose a file with a filename between 1 and 255 characters.` | `file-input.js` preserves safe source Result; Details File Input handler renders the shared diagnostic. Retains read/byte/text limits and saved snapshot |
| Examples/package previews | package admission failure; thrown thumbnail preparation exception | `example-catalog.js` presents tile issue; controller presents caught catalog exception; ExamplesBrowser shared diagnostic |
| Graph/workspace preparation | graph validation, missing definitions, root/session/view replacement, library failures | controller preserves code for toast and presents workspace/library status; Workbench shared diagnostic; root-owned `workspace-preparation.js` supplies structured panel diagnostics |
| Graph edit transactions | `STALE_CONTEXT`, `STALE_DOCUMENT`, `STALE_ROOT`, `READ_ONLY_DEFINITION`, `UNSUPPORTED_VIEW`: `The qualified graph view does not exist.` | producer Results are unchanged; controller toast and manager/Details shared diagnostic; native-wire bridge presents captured-adapter feedback |
| Native wire creation/edit/search | `INVALID_GESTURE`, connection/type/cycle/port validation; `Could not validate this connection.`, `Could not prepare the graph edit.`, `The pin belongs to a different graph view.` | `native-wire-bridge.js` presents Result feedback, NodeSearch/PinMenu render shared diagnostics; canvas compatibility presentation remains bounded and side-effect free |
| Disabled native context-menu actions | `A workflow is already running.`, target-summary issues, `This graph view is read-only.`, `Keep root-only operations and existing boundaries in their containing graph; connect an explicit snapshot before extracting State.` | controller Run to here hints present diagnostic text; native `context-menu.js` exposes visible reason text with `aria-describedby` for disabled action |
| Manual preview native boundary | `MANUAL_NATIVE_TRIGGER_REQUIRED`: `This step starts when you send a message. Enable Lattice, then send a message in SillyTavern to run this workflow.` | root-owned planner/preflight and Preview/menu summaries; Preview shared diagnostic and visible disabled reason; no model dependency executes |
| Preview empty/current/earlier states | `PREVIEW_NOT_RUN`, `PREVIEW_RUNNING`, `PREVIEW_WAITING`, `PREVIEW_SKIPPED`, `OUTPUT_NOT_RETAINED`, `EARLIER_OUTPUT`, `PREVIEW_TRUNCATED`, source replacement/removal | root-owned workflow projection → structured diagnostics/empty message → OutputPreview; actual failures suppress generic empty complaints |
| Safe diagnostic navigation | originating diagnostic node address | OutputPreview reveal → controller checks active document, prepared source/view/node, navigates instance/root, verifies editor, selects/fits node. Removed or other-document addresses are ignored |
| Node configuration | `NODE_CONFIGURATION_CANCELLED`, `INVALID_NODE_CONFIGURATION`, `STALE_CONTEXT`, missing Workflow Data/connection/helper settings | ConfigureNode/Details shared diagnostic; controller preserves configuration capture/lease checks and suppresses cancellation toast |
| Iteration helper inspection | `INVALID_ITERATION_BINDINGS`: `The exact helper role bindings could not be inspected.` and invalid exact helper/role metadata | `iteration-bindings.js` presents legacy string issue; Details shared diagnostic; no helper executes |
| Model profiles and provider requests | `BINDING_MISSING`, `PROFILE_MISSING`, `MODEL_MISSING`, `PRESET_MISSING`, `INSTRUCT_MISSING`, `ENDPOINT_MISSING`, `UNSUPPORTED_BINDING`, `BINDING_CHANGED`, `REQUEST_FAILED`, `EMPTY_RESPONSE`, output/input/token limits | service contracts keep Result codes; node profile preparation feeds Details/NodeProfilePicker; runtime/Preview/Run Details present cause-specific diagnostic and distinguish model truncation from display truncation |
| Ports, portals, subgraphs, clipboard | invalid label/type/direction, missing/cyclic/pinned definition, immutable/read-only edits, duplicate/occupied pin, insertion/export/import/clipboard errors | manager Results, ImportReview, NodeShelf, Details, NodeSearch and controller toast use presenter; prepared commits retain transaction checks |
| Comment presentation/history | `COMMENT_PRESENTATION`, `VIEW_PERSISTENCE`, `The comment history step changed before its presentation could be attached.`, retained-view/layout limits | controller native diagnostic and Workbench/Details present; pending presentation remains recoverable, Undo authority stays intact |
| Workflow Data authorization/setup | `DOCUMENT_SETUP_UNAVAILABLE`: `Workflow Data requires an active user and chat.`; `STALE_DOCUMENT_SETUP`; `INVALID_DOCUMENT_DEFINITION`; `FILE_TARGET_UNAUTHORIZED`; incompatible/missing source selection | StoryDocuments/WorkflowData/Details/ConfigureNode shared diagnostic; controller toast for failed operation; no changes to user/chat leases or authorization |
| Workflow Data reads/parsing/formatting | `FILE_BACKEND_FAILED`, `FILE_REFERENCE_UNAUTHORIZED`, `INVALID_FILE_SNAPSHOT`, JSON/JSONL/CSV/text/template parse and shape validation | runtime Results → Preview/Run Details/shared toast; component setup/import boundaries use presenter; backend/source contents do not appear in technical detail |
| Reviewed replies and saving | `STALE_SOURCE`, `ALREADY_APPLIED`, missing review candidate, acceptance invalidation, `PERSISTENCE_PARTIAL`, `PERSISTENCE_UNKNOWN`, `PERSISTENCE_UNVERIFIED`, `SAVE_UNVERIFIED`, `APPLY_SAVE_UNVERIFIED`, per-target failed/conflict/unknown write outcomes | root-owned result/review projection → OutputPreview + DiagnosticMessage; host onResult toast; failures eligible for retry remain distinct from uncertainty, accepted reply retained |
| Recall setup/status/commands | `Lattice disabled`, `Memory recall requires an active user, chat, and character.`, `This node belongs to another character.`, `Add a matching Recall Shortcut to queue this memory set.`, `Matching Recall Shortcuts use different policies. Make their target, repetition, and consumption settings match.`, `The Recall and Shortcut generation targets do not overlap.`, `Recall is already queued.`, `No manual recall is queued for these nodes.` | recall-projection/recall-commands preserve scope/eligibility; controller presents host errors; RecallOverview/RecallDetails/workspace menu/shared diagnostic show setup and disabled reasons |
| Recall lifecycle | `Recall reserved for this generation`, `Recall awaiting acceptance`, `Queued for next <types>`, `Not queued`, `Memory recall is available in the root workflow.` | Recall status/badge plain state text; missing setup/failed actions are diagnostic copy; no automatic queue/retry |
| Introspection/memory/state/consequence | invalid evidence/records/actor visibility, stale memory source, read-only preview commits, unsatisfied preconditions/conflicting state | runtime → shared Preview/Details/Run Details/notification presenter; static conservative validation fallback is intentional; never quote private evidence |
| Recovery/migration | previous workflow registry issues, malformed/retired documents, missing recovery candidate | state stores original diagnostic; document recovery menu and document controller present safe copy; original recovery data stays retained |
| Settings/theme/search empty states | no selected node/output, no matching node/profile/example, inherited/unavailable setting | component state/empty copy and shared DiagnosticMessage where a diagnostic exists; no error toast for normal empty results |

## Exceptional paths and integration checks

- Arbitrary caught startup, graph export, workflow export, archived export, catalog and thumbnail exceptions previously copied `.message` to the UI. They now use the conservative presenter fallback.
- Document save/open/clear-recents catches now produce fixed Result messages; status and notification presentation do not expose browser exceptions. Service-level file catches already used fixed bounded messages and keep their codes.
- Native wire adapter capture/prepare/commit failures now pass the error record to the presenter, rather than truncating and displaying arbitrary `.message`.
- `console.warn`/`console.error` developer logs are not diagnostic UI boundaries. Runtime recordings and cost/source artifacts remain technical evidence, not diagnostic text; they must retain existing privacy and size controls.
- Families with thousands of possible internal validation variants deliberately use conservative fallback when no specific safe catalog entry exists. Their service codes remain stable; technical disclosure uses catalog-owned explanation rather than arbitrary source text.
- Component and integration owners must keep already-presented `DiagnosticView` values intact for context-dependent messages. Fixed catalog-owned message strings may be presented again safely; dynamic context copy must retain its record/context.
- Browser coverage should exercise startup failure, disabled native context menu, failed save, unknown/unverified associated save outcome, invalid file input, imported package error, and current-versus-earlier preview. The full browser suite and captured panel are integration-owned.

## Literal source appendix

The appendix records exact static Result producer strings by file. Dynamic records, message forwarding, constructed validation messages and UI lifecycle strings are covered by the families above; absence from this literal list is not a claim that a producer has no diagnostics.

### src/state.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `WRONG_PHASE` | Active workflow documents require a unified root. Retired originals are recovery data only. | 266 |
| `INVALID_HISTORY_ACTION` | Choose Undo or Redo. | 338 |

### src/ui/configured-node-creation.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_CONFIGURATION` | Controls must be a bounded JSON object. | 43 |
| `INVALID_CONFIGURATION` | Use only declared node controls in the JSON object. | 43 |
| `INVALID_CONFIGURATION` | Complete the required identities and settings using the declared node controls. | 44 |
| `DOCUMENT_NOT_AUTHORIZED` | Select an actual authorized workflow data target. | 46 |
| `INVALID_ITERATION_HELPER` | Choose an exact bundled Data helper compatible with the iteration mode. | 47 |
| `INVALID_CONFIGURATION` | Use valid bounded JSON controls; identities remain logical values. | 49 |
| `STALE_CONTEXT` | The graph view changed. Open node configuration again. | 54 |
| `STALE_DOCUMENT_SETUP` | The user, chat or document authorization changed. Reopen node configuration. | 64 |
| `NODE_CONFIGURATION_CANCELLED` | Node creation cancelled. | 66 |
| `INVALID_PHASE` | The containing workflow fixes this node stage. | 77 |
| `CONFIGURATION_PORT_CHANGED` | The configured node no longer has the selected compatible pin. Choose a different connection. | 79 |
| `CONFIGURATION_FAILED` | The configured node could not be prepared. | 81 |

### src/ui/controller.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `DOCUMENT_SETUP_UNAVAILABLE` | Workflow Data setup is unavailable. | 164 |
| `READ_ONLY` | Library definitions are read-only. | 545 |
| `PROFILE_MISSING` | This connection is no longer available. | 548 |
| `STALE_DEFINITION` | The subgraph changed. Rename it again. | 908 |
| `STALE_CONTEXT` | The graph view changed or is read-only. | 1054 |
| `INVALID_GROUP` | Select at least two ordinary nodes to group. | 1056 |
| `INVALID_GROUP` | Select an editable group to ungroup. | 1069 |
| `INVALID_SELECTION` | The selected nodes changed. | 1198 |
| `INVALID_PORT` | Select the boundary whose port you want to edit. | 1289 |
| `INVALID_PORT` | Open an editable subgraph to add a port. | 1295 |
| `VIEW_INACTIVE` | The graph view is unavailable. | 1307 |
| `STALE_CONTEXT` | The graph view changed. Prepare this edit again. | 1315 |
| `STALE_CONTEXT` | The prepared edit belongs to a different containing graph. | 1318 |
| `STALE_CONTEXT` | The comment view changed or is read-only. | 1349 |
| `STALE_CONTEXT` | The comment changed. Select it again. | 1364 |
| `INVALID_COMMENT_COMMAND` | Choose a comment command. | 1366 |
| `INVALID_COMMENT_LAYOUT` | The comment layout no longer matches its captured contents. | 1413 |
| `INVALID_COMMENT_LAYOUT` | The comment layout no longer matches its captured groups. | 1415 |
| `STALE_CONTEXT` | The selected node changed. | 1496 |
| `INVALID_INSTANCE` | Select a node in a workflow instance. | 1502 |
| `STALE_CONTEXT` | The selected iteration node changed. | 1518 |
| `DOCUMENT_SETUP_UNAVAILABLE` | Open an active chat to adjust initial values. | 1535 |
| `INVALID_WORKFLOW_DATA` | Select a node that uses Workflow Data. | 1535 |
| `DOCUMENT_SETUP_UNAVAILABLE` | Open an active chat to adjust visibility. | 1554 |
| `INVALID_WORKFLOW_DATA` | Choose a compatible data source for this node. | 1564 |
| `DOCUMENT_SETUP_UNAVAILABLE` | Open an active chat to create a separate data source. | 1566 |
| `DOCUMENT_SETUP_UNAVAILABLE` | Workflow Data settings are unavailable. | 1577 |
| `INVALID_PHASE` | Choose a preparation or response stage for a both-stage node in a unified workflow. | 1588 |
| `INVALID_FILE_TARGET` | Select a File Input node. | 1597 |
| `STALE_CONTEXT` | The selected node changed while reading the file. | 1600 |
| `STALE_DOCUMENT_SETUP` | Workflow Data authorization changed before node creation. Reopen configuration. | 1690 |
| `STALE_CONTEXT` | The graph view changed. | 1697 |
| `DOCUMENT_SETUP_UNAVAILABLE` | Open an active chat and authorize a target in Workflow › Configure › Workflow Data before creating this node. | 1713 |
| `VIEW_INACTIVE` | The new node cannot be placed in this graph view. | 1741 |
| `STALE_CONTEXT` | The manager scope changed. Reopen this manager. | 1773 |
| `MISSING_DEFINITION` | The subgraph cannot be saved. | 1793 |

### src/ui/document-controller.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `RECENT_STORAGE_FAILED` | Recent files could not be cleared. | 85 |

### src/ui/file-input.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `FILE_TOO_LARGE` | Choose a file no larger than 400,000 bytes. | 3 |
| `FILE_READ_FAILED` | The selected file could not be read. Choose it again and retry. | 6 |
| `FILE_INVALID_UTF8` | This file is not valid UTF-8 text. Choose a UTF-8 text file. | 9 |
| `FILE_CONTENT_TOO_LARGE` | Choose a file containing at most 100,000 UTF-16 code units of text. | 10 |
| `FILE_NAME_INVALID` | Choose a file with a filename between 1 and 255 characters. | 12 |

### src/ui/graph-view-session.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `VIEW_CACHE` | Expected complete plain cached editor views matching the prepared navigation. | 55 |
| `VIEW_ROOT` | Expected the active workflow root. | 60 |
| `VIEW_ACTIVATION` | Expected a root activation identity. | 61 |
| `VIEW_NAVIGATION` | Expected complete prepared graph navigation. | 64 |
| `VIEW_INACTIVE` | The graph view session is closed. | 106 |
| `VIEW_ROOT_CHANGED` | The workflow root identity changed. | 107 |
| `VIEW_CONTEXT_REQUIRED` | Expected an explicit editor invalidation policy. | 111 |
| `VIEW_CONTEXT_REQUIRED` | Only cached navigation label changes may preserve an editor context. | 112 |
| `VIEW_PERSISTENCE` | Saved graph view presentation was invalid. The root workflow is available with fresh view presentation. | 69 |

### src/ui/iteration-bindings.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `ITERATION_DEPTH` | Helper role inspection exceeds its bounded graph limit. | 14 |
| `ITERATION_CYCLE` | A helper cannot recursively invoke itself. | 16 |
| `ITERATION_ROLE_LIMIT` | A helper can expose up to 64 text model roles. | 41 |
| `INVALID_ITERATION_BINDINGS` | The exact helper role bindings could not be inspected. | 47 |
| `INVALID_ITERATION_BINDING` | Choose a helper role and a supported binding field. | 66 |
| `INVALID_ITERATION_BINDING` | Choose a text model role required by this exact helper. | 68 |
| `INVALID_ITERATION_BINDING` | Model and profile selectors must be nonempty bounded text. | 73 |

### src/ui/preview-diagnostics.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `MANUAL_NATIVE_TRIGGER_REQUIRED` | This step starts when you send a message. | 21 |

### src/ui/recall-shortcuts.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `RECALL_HOTKEY_UNAVAILABLE` | The keyboard listener is unavailable. | 18 |
| `INVALID_RECALL_HOTKEY` | Use a scoped native Recall shortcut. | 19 |
| `RECALL_HOTKEY_CONFLICT` | This shortcut is already assigned to another active Recall Shortcut. Choose a different key. | 21 |

### src/ui/story-document-setup.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `STALE_DOCUMENT_SETUP` | The user, chat or Workflow Data catalog changed. Refresh setup before applying this edit. | 3 |
| `DOCUMENT_SETUP_UNAVAILABLE` | Workflow Data requires an active user and chat. | 10 |
| `DOCUMENT_SETUP_UNAVAILABLE` | Workflow Data setup is unavailable for the active user and chat. | 10 |
| `DOCUMENT_NOT_AUTHORIZED` | Choose an authorized workflow data document before loading its initial template. | 11 |
| `DOCUMENT_SETUP_FAILED` | The initial template could not be loaded. | 11 |
| `INVALID_DOCUMENT_SETUP` | Use a named logical target, a valid initial template and explicit visibility. | 14 |
| `INVALID_CLOCK_TEMPLATE` | Choose explicit clock/calendar IDs and a nonnegative whole story minute. | 28 |

### src/ui/subgraph-view-state.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `VIEW_DATA` | Expected captured instance view presentation for this workflow. | 63 |

### src/ui/view-state.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `VIEW_LIMIT` | Retained graph views exceed the presentation-data limit. | 244 |
| `VIEW_UNAVAILABLE` | The graph view is unavailable. | 255 |
| `VIEW_PERMANENT` | Graph 1 is permanent. | 275 |
| `VIEW_NAVIGATION` | Expected complete prepared graph navigation. | 293 |
| `VIEW_DATA` | Expected bounded view presentation data for this exact graph view. | 320 |

### src/ui/workflow-data-setup.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `STALE_DOCUMENT_SETUP` | The active user, chat or Workflow Data changed. Reopen the node settings. | 7 |
| `INVALID_WORKFLOW_DATA` | This node does not use Workflow Data. | 45 |
| `INCOMPATIBLE_WORKFLOW_DATA` | Choose a compatible data source for this node. | 51 |
| `INCOMPATIBLE_WORKFLOW_DATA` | This source has no compatible initial template. Create a separate source for new initial values. | 59 |
| `INCOMPATIBLE_WORKFLOW_DATA` | The initial values must match this node’s data source. | 66 |
| `INVALID_WORKFLOW_DATA` | Give the new data source a name. | 89 |
| `INVALID_CLOCK_TEMPLATE` | Use a calendar ID, a positive day length and a nonnegative whole starting minute. | 95 |

### src/ui/workflow-file-access.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `FILE_CANCELLED` | The file operation was cancelled. | 2 |
| `FILE_PERMISSION` | Permission to access this workflow file was denied. Choose it again or use Save As. | 32 |
| `FILE_NOT_FOUND` | This workflow file is missing. Choose another file. | 33 |
| `RECENT_STORAGE_FAILED` | Recent workflow files could not be persisted in this browser. | 49 |
| `FILE_PERMISSION` | Permission to read this workflow file was denied. Choose it again. | 114 |
| `MALFORMED_WORKFLOW` | Workflow JSON must be at most 2,000,000 UTF-8 bytes. | 116 |
| `FILE_DOWNLOAD_FAILED` | The workflow JSON copy could not be saved. | 140 |
| `FILE_PERMISSION` | Permission to save this workflow file was denied. Use Save As to choose another file. | 146 |
| `FILE_CONFLICT` | This workflow file changed outside Lattice. Use Save As to preserve your draft without overwriting those changes. | 149 |
| `FILE_CONFLICT` | This workflow file changed immediately after saving. Your draft remains open; use Save As to preserve it. | 161 |
| `RECENT_NOT_FOUND` | This workflow file is no longer in Open Recent. | 173 |

### src/ui/workflow-surface.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `MANUAL_NATIVE_TRIGGER_REQUIRED` | This step starts when you send a message. Enable Lattice, then send a message in SillyTavern to run this workflow. | 121 |
| `PREPARATION_FAILED` | Workflow preparation failed. | 248 |
| `RECORDING_REQUIRED` | Current workflow results require an addressed recording. | 250 |
| `WORKFLOW_FAILED` | Run failed. | 283 |
| `NATIVE_SEND_REQUIRED` | Enable this open unified workflow, then Send in SillyTavern. Generate Reply continues that native generation. Use Run to here to test supported nodes. | 295 |
| `PREPARATION_FAILED` | Workflow preparation could not finish. | 313 |
| `APPLY_FAILED` | Apply failed. | 344 |
| `APPLY_FAILED` | Reply application could not finish. | 345 |

### src/workflow/artifact-privacy.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `PRIVATE_MATERIAL` | Public reply assembly cannot disclose restricted evidence or decisions. | 2 |

### src/workflow/catalog.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_PHASE` | Repair requires the post phase. | 114 |
| `INVALID_SETTINGS` | Select a supported Repair mode. | 122 |
| `INVALID_SETTINGS` | Repair controls require own data properties. | 135 |
| `UNKNOWN_OPERATION` | Unknown workflow operation. | 186 |
| `INVALID_SETTINGS` | Scene Context visibility must be actor or public. | 187 |
| `UNKNOWN_OPERATION` | Unknown workflow operation version. | 189 |
| `WRONG_PHASE` | Lifecycle nodes require a unified workflow. | 190 |
| `UNSUPPORTED_VERSION` | This operation requires schema 3 and runtime 2. | 192 |
| `WRONG_PHASE` | The operation does not support its effective native phase. | 194 |
| `INVALID_SETTINGS` | Use plain operation metadata with own data properties. | 208 |

### src/workflow/comment-edits.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_COMMAND` | Expected a comment command. | 39 |
| `INVALID_INSTANCE` | Expected an explicit bounded containing graph path. | 40 |
| `INVALID_CONTEXT` | Comment edits require a saved root document ID. | 43 |
| `INVALID_INSTANCE` | The containing graph path does not exist. | 45 |
| `STALE_DEFINITION` | Supply the current exact containing definition pin. | 47 |
| `READ_ONLY_DEFINITION` | Make a local copy before editing this definition. | 48 |
| `INVALID_COMMENT` | Expected a fresh authored comment frame with a finite rectangle. | 56 |
| `INVALID_COMMENT` | Expected a bounded unique selection of existing comment frames. | 60 |
| `INVALID_LAYOUT` | Expected a bounded node layout batch. | 63 |
| `INVALID_LAYOUT` | Expected unique existing nodes and finite positions. | 67 |
| `INVALID_LAYOUT` | Only comment frames accept positive authored dimensions. | 69 |
| `INVALID_LAYOUT` | Expected a bounded group layout batch. | 74 |
| `INVALID_LAYOUT` | Expected unique existing groups and finite positions or positive rectangles. | 78 |
| `INVALID_COMMENT` | Expected an existing comment frame. | 84 |
| `INVALID_COMMENT` | Expected an authored presentation patch. | 87 |
| `SEMANTIC_COMMENT_EDIT` | Comment edits must preserve execution identity. | 91 |

### src/workflow/compactor.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | Use a positive target/completion limit, bounded recent count, and supported compaction method. | 13 |
| `INVALID_CONTEXT` | Expected uniquely identified context messages with role and text. | 14 |
| `ABORTED` | Compaction was stopped. | 15 |
| `PIN_MISSING` | A protected literal pin is absent from the input. Matching is exact and case-sensitive. | 34 |
| `PIN_BUDGET_EXCEEDED` | Pinned and recent messages exceed the target; increase the budget or reduce protected material. | 39 |
| `BINDING_MISSING` | Compression requires the resolved operation binding. | 41 |
| `SERVICE_UNAVAILABLE` | Compression request service is unavailable. | 42 |
| `INPUT_LIMIT` | No flexible message fits the bounded compression input. | 55 |
| `ABORTED` | Compaction was stopped before transmission. | 56 |
| `COMPACTION_OVERFLOW` | The measured summary and protected messages exceed the target. Keep the original. | 74 |
| `TRUNCATED_OUTPUT` | The summary reached its completion limit. | 7 |
| `COMPLETION_UNVERIFIED` | The summary has no verified complete text result; keep the original. | 8 |
| `EMPTY_OUTPUT` | The summary is empty. | 9 |
| `COMPRESSION_INPUT_OMITTED` | Older flexible messages were omitted from the bounded compression input; originals are retained. | 54 |
| `REQUEST_FAILED` | Compression request failed; no retry was made. | 59 |
| `REQUEST_FAILED` | Compression request returned an invalid result. | 60 |
| `ABORTED` | Compaction was stopped; ignore its late result. | 62 |

### src/workflow/composition-transform.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_COMPOSITION` | Expected a plain edit command. | 27 |
| `UNSUPPORTED_VERSION` | Composition edits require a normalized schema-3 graph. | 30 |
| `INVALID_INSTANCE` | Expected a bounded scope path. | 31 |
| `INVALID_INSTANCE` | The containing scope does not exist. | 33 |
| `READ_ONLY_DEFINITION` | Make a local copy of the containing scope before editing. | 34 |
| `INVALID_SELECTION` | Select existing unique nodes. | 91 |
| `DEFINITION_CONFLICT` | A selection requires a fresh definition ID and name. | 92 |
| `INVALID_COMPOSITION` | Supply only finite selected node rectangles. | 94 |
| `INVALID_COMPOSITION` | Supply selected node aliases and compact state only. | 95 |
| `INVALID_COMPOSITION` | Supply finite presentation for affected groups only. | 97 |
| `ROOT_ONLY_OPERATION` | Root-only operations and existing boundaries cannot be selected. | 100 |
| `ROOT_ONLY_OPERATION` | State extraction requires an explicit snapshot connection. | 101 |
| `INVALID_INSTANCE` | The wrapper requires a fresh ID. | 104 |
| `INVALID_COMPOSITION` | Expected a plain unpack command. | 205 |
| `INVALID_INSTANCE` | Expected a qualified instance. | 207 |
| `INVALID_INSTANCE` | Expected a subgraph instance. | 210 |

### src/workflow/composition.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_PORTAL` | Expected a plain portal command. | 18 |
| `INVALID_PORTAL` | A publisher requires a label and existing output. | 38 |
| `INVALID_PORTAL` | A publisher requires a fresh stable ID. | 40 |
| `INVALID_PORTAL` | Expected an existing publisher and label. | 46 |
| `INVALID_PORTAL` | Expected a publisher and compatible local output. | 51 |
| `INVALID_PORTAL` | Expected a publisher and named destination. | 56 |
| `AMBIGUOUS_INPUT` | This input is already bound. | 59 |
| `INVALID_PORTAL` | Expected a portal consumer wire. | 67 |
| `INVALID_PORTAL` | Expected an existing portal publisher. | 71 |
| `PORTAL_IN_USE` | Choose restore or disconnect for existing consumers. | 73 |
| `INVALID_PORTAL` | Expected an actual ordinary wire. | 79 |
| `INVALID_PORTAL` | Expected an actual wire output. | 81 |
| `INVALID_PORTAL` | The selected publisher must match this exact wire output. | 85 |
| `INVALID_COMMAND` | Expected a known qualified portal command. | 109 |
| `INVALID_COMMAND` | Expected actual named portal metadata and explicit policies. | 110 |
| `INVALID_COMMAND` | Choose an existing publisher or explicit new publisher. | 113 |

### src/workflow/connection-edits.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_OPTIONS` | Use a plain options object. | 30 |
| `INVALID_OPTIONS` | Only an own idFactory option is supported. | 32 |
| `INVALID_OPTIONS` | idFactory must be a function. | 34 |
| `INVALID_PORT` | Choose an existing named pin. | 38 |
| `INVALID_PORT` | Choose an actual pin with the required direction. | 40 |
| `INVALID_PORT` | A connection needs one output and one input. | 55 |
| `AMBIGUOUS_INPUT` | Replace the occupied input explicitly. | 59 |
| `ARTIFACT_KIND` | Move bindings between matching artifact pins. | 73 |
| `PORTAL_IN_USE` | Choose whether to restore or disconnect publisher consumers. | 98 |
| `INVALID_COMMAND` | Pin disconnection supports retain or disconnect publishers. | 115 |
| `INVALID_COMMAND` | Provide safe IDs and an explicit supported publisher policy. | 125 |
| `INVALID_COMMAND` | Capture a finite graph point before opening a menu. | 131 |
| `INVALID_WIRE` | Choose a stable direct-wire ID. | 132 |
| `INVALID_WIRE` | Reroute an existing visible direct wire. | 134 |
| `INVALID_COMMAND` | Capture a finite graph point before opening search. | 146 |
| `UNKNOWN_OPERATION` | Choose a declared operation. | 147 |
| `INVALID_SETTINGS` | Presets must be plain operation controls. | 149 |
| `INVALID_SETTINGS` | Select a supported operation mode. | 152 |
| `INVALID_SETTINGS` | Presets may contain only declared operation controls; Reroute creation requires its top-level artifact kind. | 156 |
| `INVALID_SETTINGS` | Only typed reroute creation accepts an actual artifact kind. | 157 |
| `INVALID_COMMAND` | Choose an existing origin and an explicit new-node port. | 158 |
| `WRONG_PHASE` | Choose a supported stage in the current workflow. | 159 |
| `INVALID_COMMAND` | Capture a finite graph point before inserting an instance. | 175 |
| `STALE_DEFINITION` | Supply the exact containing definition pin. | 176 |
| `INVALID_COMMAND` | Choose an existing origin and an explicit instance port. | 177 |
| `WRONG_PHASE` | Insert a definition in a compatible containing workflow. | 183 |
| `IDENTITY_COLLISION` | idFactory must preserve the fresh identity namespace. | 199 |
| `IDENTITY_COLLISION` | A copied snapshot table key must remain fresh. | 200 |
| `IDENTITY_COLLISION` | idFactory must return a fresh safe ID for each new record. | 224 |
| `INVALID_COMMAND` | Use bounded own plain command data. | 251 |
| `INVALID_COMMAND` | Use a supported native connection command. | 254 |
| `INVALID_COMMAND` | Use a bounded path of stable instance IDs. | 256 |
| `READ_ONLY_VIEW` | Make a local copy of the complete containing path before editing. | 262 |
| `STALE_DEFINITION` | The exact containing definition changed. | 264 |
| `INVALID_COMMAND` | The connection edit could not be prepared. | 311 |

### src/workflow/connections.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `BINDING_CHANGED` | Resolve the fixed connection again before requesting. | 42 |
| `BINDING_CHANGED` | The fixed connection changed after preflight. Run preflight again. | 46 |
| `BINDING_CHANGED` | The fixed connection is no longer available. Run preflight again. | 47 |
| `ABORTED` | The request was stopped. | 87 |
| `INVALID_REQUEST` | Provide owned messages and a positive bounded completion limit. | 88 |
| `SERVICE_UNAVAILABLE` | The required SillyTavern request service is unavailable. | 98 |
| `REQUEST_SCOPE_FAILED` | The trusted auxiliary request scope is unavailable. | 103 |
| `SERVICE_UNAVAILABLE` | The host instruct formatter is unavailable. | 114 |
| `ABORTED` | The request was stopped before transmission. | 128 |
| `BINDING_CHANGED` | The fixed connection changed before transmission. Run preflight again. | 130 |
| `BINDING_CHANGED` | The connection changed before transmission. Run preflight again. | 135 |
| `ABORTED` | The request was stopped; ignore its late output. | 141 |
| `EMPTY_OUTPUT` | The auxiliary request returned no text. | 152 |
| `BINDING_MISSING` | Choose a connection profile from the dropdown beneath this node. | 163 |
| `SERVICE_UNAVAILABLE` | SillyTavern Connection Manager is unavailable. | 164 |
| `PROFILE_MISSING` | The fixed connection profile is missing or unavailable. | 167 |
| `PROFILE_MISSING` | The fixed connection profile is missing. | 168 |
| `UNSUPPORTED_BINDING` | Only mapped chat/text completion connections are supported. | 170 |
| `UNSUPPORTED_BINDING` | This installed host wrapper discards completion evidence. Use a connection that preserves its completion reason. | 171 |
| `UNSUPPORTED_BINDING` | Named proxy routes cannot be verified through the public host context. Use a directly resolved connection. | 172 |
| `PRESET_MISSING` | The fixed profile sampler preset is missing. | 174 |
| `UNSUPPORTED_BINDING` | This route inherits a reverse proxy that cannot be isolated through the public host services. Use a direct connection. | 176 |
| `INSTRUCT_MISSING` | The fixed profile instruct preset is missing. | 178 |
| `UNSUPPORTED_BINDING` | The host cannot convert text completion samplers across providers without switching the live connection. | 179 |
| `MODEL_MISSING` | Select a model in the fixed profile or node. | 181 |
| `ENDPOINT_MISSING` | The provider requires endpoint/account configuration in its preset or host settings. | 185 |
| `ENDPOINT_MISSING` | The fixed profile requires an available endpoint. | 187 |
| `UNSUPPORTED_BINDING` | Only active chat/text completion connections are supported. | 201 |
| `MODEL_MISSING` | Select a model in SillyTavern or on the node. | 207 |
| `ENDPOINT_MISSING` | The provider requires endpoint/account configuration in its host settings. | 211 |
| `ENDPOINT_MISSING` | The active connection requires an available endpoint. | 213 |
| `TRUNCATED_OUTPUT` | The request reached its completion limit. | 144 |
| `COMPLETION_UNVERIFIED` | The host response does not expose a verified complete text result; keep the original. | 145 |

### src/workflow/contracts.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `MALFORMED_WORKFLOW` | Expected a bounded plain workflow graph. | 26 |
| `UNSUPPORTED_VERSION` | Expected schema 3 and runtime 2. | 27 |
| `WRONG_PHASE` | Executable root workflows require native-unified. Stage-specific bodies are reusable definitions only. | 34 |
| `WRONG_PHASE` | The workflow operation does not support this phase. | 35 |

### src/workflow/decision.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_QUESTIONS` | Questions must be bounded own JSON records. | 12 |
| `INVALID_QUESTIONS` | Provide 1–32 questions with stable bounded IDs. | 14 |
| `INVALID_QUESTIONS` | Each question needs a typed question and text or structured instructions. | 16 |
| `INVALID_QUESTIONS` | Yes/no descriptions use true and false criteria. | 18 |
| `INVALID_QUESTIONS` | Choice needs 2–255 named alternatives. | 20 |
| `INVALID_QUESTIONS` | Score needs 2–10 ordered rubric levels. | 21 |
| `INVALID_REQUEST` | Provide bounded text or structured state and keyed questions. | 27 |
| `INVALID_SETTINGS` | Decision settings require bounded supported controls. | 35 |
| `INVALID_SETTINGS` | The completion limit must be 1–65,536 tokens. | 39 |
| `INVALID_DECISION_OUTPUT` | Return one strict JSON answer for each requested question. | 44 |
| `INVALID_DECISION_OUTPUT` | The answer must match its declared type and bounded evidence. | 48 |
| `INVALID_DECISION_OUTPUT` | The answer lies outside its authored alternatives or rubric. | 50 |
| `ABORTED` | The decision was stopped. | 57 |
| `SERVICE_UNAVAILABLE` | Bind the independent text Decision connection. | 58 |
| `ABORTED` | Ignore the stopped decision result. | 64 |
| `COMPLETION_UNVERIFIED` | The text connection did not verify a complete response. | 67 |
| `INVALID_DECISION_OUTPUT` | Decision output must be bounded JSON text. | 69 |
| `INVALID_DECISION_OUTPUT` | Decision output must be strict JSON without prose or fences. | 70 |
| `INVALID_DECISION_OUTPUT` | Usage must contain bounded token counters. | 77 |
| `INVALID_DECISION_OUTPUT` | Usage token counts must be nonnegative safe integers. | 81 |

### src/workflow/definition-data.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `DEFINITION_DATA` | Definition data exceeds the UTF-8 byte limit. | 47 |
| `DEFINITION_DATA` | Expected bounded plain definition data without secrets or runtime records. | 49 |
| `DEFINITION_METADATA` | A definition requires an ID, positive exact version and display name. | 67 |
| `DEFINITION_HASH` | Expected a sha256 hash. | 68 |
| `DEFINITION_BODY` | Expected a schema-3/runtime-2 body with an explicit phase. | 70 |
| `DEFINITION_INTERFACE` | Expected interface and exposed-parameter lists. | 71 |
| `DEFINITION_LIMIT` | Definition body exceeds local traversal limits. | 72 |
| `DEFINITION_INTERFACE` | Invalid interface port metadata. | 75 |
| `DEFINITION_INTERFACE` | Interface and boundary mappings must be unique. | 76 |
| `DEFINITION_INTERFACE` | Each interface port requires exactly one matching boundary. | 78 |
| `DEFINITION_INTERFACE` | A boundary node has no matching interface port. | 83 |
| `DEFINITION_PARAMETER` | Invalid exposed-parameter target metadata. | 88 |
| `DEFINITION_PARAMETER` | Exposed parameter IDs and targets must be unique. | 90 |
| `DEFINITION_PARAMETER` | Parameter must target a catalog operation control. | 104 |
| `DEFINITION_PARAMETER` | Saved control default does not match its catalog descriptor. | 113 |
| `DEFINITION_PARAMETER` | Context Join input slots define pin layout. Edit inputs inside the graph body instead of exposing them as a parameter. | 121 |
| `DEFINITION_BODY` | Invalid body node identity. | 150 |
| `UNKNOWN_OPERATION` | Cannot hash an unknown operation. | 157 |
| `DEFINITION_REF` | An instance requires an exact definition reference. | 189 |
| `UNKNOWN_OPERATION` | Cannot hash an unknown node type. | 192 |
| `DEFINITION_BODY` | Cannot derive identity from malformed body metadata. | 208 |
| `DEFINITION_REF` | Expected an exact definition ID, version and SHA-256 hash. | 222 |
| `DEFINITION_REF` | Expected a local snapshot table. | 223 |
| `MISSING_DEFINITION` | The exact pinned definition is not bundled. | 225 |
| `DEFINITION_REF` | Snapshot metadata does not match its exact pin. | 227 |
| `DEFINITION_HASH` | Pinned hash does not match canonical semantic content. | 230 |
| `DEFINITION_CONFLICT` | The same definition ID and version has different canonical content. | 235 |
| `DEFINITION_REF` | A duplicate snapshot has inconsistent identity metadata. | 236 |

### src/workflow/definition-insertion.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `DEFINITION_DATA` | Expected a root, pinned snapshot table and exact references. | 16 |
| `DEFINITION_CONFLICT` | An exact snapshot pin has conflicting semantic content. | 23 |
| `INVALID_OPTIONS` | Supply an internal fresh definition allocator. | 46 |
| `INVALID_ID` | Expected a fresh definition identity. | 48 |
| `IDENTITY_COLLISION` | A copied definition requires a fresh safe identity. | 49 |
| `IDENTITY_COLLISION` | A copied snapshot table key must remain fresh. | 56 |
| `INSERTION_FAILED` | Could not prepare the pinned definition import. | 69 |

### src/workflow/definition-library.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_INSTANCE` | Expected an explicit bounded containing graph path. | 21 |
| `UNSUPPORTED_VERSION` | Qualified edits require schema 3 and runtime 2. | 25 |
| `INVALID_INSTANCE` | The containing graph path does not exist. | 27 |
| `STALE_DEFINITION` | Supply the current exact containing definition pin. | 29 |
| `READ_ONLY_DEFINITION` | Make a local copy of the containing graph before editing. | 30 |
| `INVALID_COMMAND` | Expected a known qualified node command. | 59 |
| `INVALID_COMMAND` | Expected controls and explicit incident wire IDs. | 60 |
| `INVALID_COMMAND` | Expected an explicit binding override consumption flag. | 61 |
| `INVALID_COMMAND` | Enabled requires a boolean. | 62 |
| `INVALID_COMMAND` | Expected a model or profile field. | 64 |
| `INVALID_COMMAND` | Expected an explicit saved set or removal command. | 67 |
| `INVALID_COMMAND` | Expected a stable parameter ID. | 69 |
| `INVALID_COMMAND` | Expected an actual role or structural primitive target. | 72 |
| `INVALID_INSTANCE` | Expected an actual local wrapper. | 107 |
| `STALE_DEFINITION` | The selected wrapper pin changed. | 108 |
| `INVALID_OVERRIDE` | Expected an actual current exposed parameter. | 111 |
| `INVALID_OVERRIDE` | Expected an actual current role or primitive target. | 116 |
| `DEFINITION_REF` | Expected snapshot tables. | 148 |
| `DEFINITION_CONFLICT` | An exact pin has conflicting canonical content. | 155 |
| `DEFINITION_DATA` | Expected bounded local library data. | 163 |
| `DEFINITION_DATA` | Expected a library, editable definition draft and plain pinned snapshots. | 183 |
| `DEFINITION_METADATA` | Definition version limit reached. | 188 |
| `DEFINITION_DATA` | Expected a library and exact reference. | 196 |
| `MISSING_DEFINITION` | The shelf entry does not exist. | 198 |
| `DEFINITION_IN_USE` | Another shelf definition pins this revision. | 201 |
| `INVALID_INSTANCE` | Expected an instance command. | 208 |
| `INVALID_INSTANCE` | Expected a root-scope subgraph instance. | 212 |
| `DEFINITION_CONFLICT` | A local copy requires a fresh safe ID and optional display name. | 218 |
| `INVALID_COMMAND` | Expected an explicit override materialization flag. | 219 |
| `DEFINITION_CONFLICT` | Materialization requires a fresh safe ID and optional display name. | 258 |
| `INVALID_OVERRIDE` | Update mappings must be records. | 350 |
| `INVALID_OVERRIDE` | Override mappings must be unambiguous stable IDs. | 377 |
| `INVALID_COMMAND` | Expected an explicit qualified instance Update. | 399 |
| `INVALID_OVERRIDE` | Supply all four explicit stable mapping records. | 400 |
| `STALE_DEFINITION` | The captured wrapper pin changed. | 411 |
| `INVALID_OVERRIDE` | Mapping must identify actual old and new metadata. | 416 |
| `INVALID_OVERRIDE` | Port mappings require matching direction and artifact kind. | 417 |
| `INVALID_COMMAND` | Expected a typed owned interface or parameter edit. | 433 |
| `INVALID_COMMAND` | Expected typed artifact kind and boundary direction. | 434 |
| `INVALID_COMMAND` | Expected a finite boundary graph point. | 435 |
| `INVALID_COMMAND` | Expected an actual relative control target. | 436 |
| `DEFINITION_INTERFACE` | Expected an actual interface port. | 462 |
| `DEFINITION_PARAMETER` | Expected an actual relative primitive control. | 468 |
| `DEFINITION_PARAMETER` | Expected an actual exposed parameter. | 475 |
| `PARAMETER_IN_USE` | Reset the surviving wrapper override before removing this parameter. | 478 |
| `PARAMETER_IN_USE` | Remove the surviving enclosing exposure before removing this parameter. | 481 |
| `READ_ONLY_DEFINITION` | Make an explicit local copy before editing this definition. | 493 |
| `STALE_DEFINITION` | The local definition changed; prepare the edit again. | 494 |
| `DEFINITION_REF` | A local edit must preserve its owned definition ID. | 495 |
| `INVALID_INSTANCE` | Expected a plain instance command. | 500 |
| `INVALID_INSTANCE` | Expected a bounded existing instance path. | 503 |

### src/workflow/document-catalog.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `DOCUMENT_CATALOG_UNAVAILABLE` | Workflow Data setup requires the active user and chat. | 57 |
| `STALE_DOCUMENT_SCOPE` | Workflow Data scope or catalog changed before this mutation. | 59 |
| `DOCUMENT_LEASE_UNAUTHORIZED` | Use the exact live lease captured by this document catalog. | 60 |
| `DOCUMENT_CATALOG_LIMIT` | At most 128 workflow data targets are supported. | 66 |
| `FILE_FORMAT_LOCKED` | An existing workflow data document retains its stored format. Choose a new target to convert formats. | 68 |
| `INVALID_DOCUMENT_DEFINITION` | Use a named logical target, a valid format/template and an explicit public, hidden or actor-private scope. | 71 |
| `FILE_NOT_AUTHORIZED` | Select an authorized workflow data document. | 77 |
| `DOCUMENT_CATALOG_UNAVAILABLE` | Workflow Data authorization could not be updated. | 79 |
| `FILE_NOT_AUTHORIZED` | Select a workflow data document created for this user and chat. | 82 |
| `DOCUMENT_CATALOG_UNAVAILABLE` | Workflow Data settings are unavailable. | 82 |
| `DOCUMENT_CATALOG_UNAVAILABLE` | Workflow Data settings could not be captured. | 87 |
| `CONFIG_SAVE_UNAVAILABLE` | A host metadata save method is required. | 88 |
| `STALE_DOCUMENT_SCOPE` | Workflow Data scope changed during its save. | 88 |
| `CONFIG_SAVE_FAILED` | Workflow Data settings remain local; the host save could not be verified. | 88 |

### src/workflow/document-file.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `MALFORMED_WORKFLOW` | Expected bounded plain workflow authoring data without credentials. | 127 |
| `WRONG_PHASE` | Editable workflow documents require a unified root. Retired originals are recovery data only. | 131 |
| `VIEW_DATA` | Workspace presentation belongs to a different workflow. | 132 |
| `VIEW_DATA` | Expected valid retained workspace presentation for this workflow. | 142 |
| `MALFORMED_WORKFLOW` | Workflow JSON must be at most 2,000,000 UTF-8 bytes. | 146 |
| `MALFORMED_WORKFLOW` | Malformed workflow authoring containers. | 148 |
| `INVALID_JSON` | That is not valid workflow JSON. | 155 |
| `UNSUPPORTED_PACKAGE` | Expected a Lattice workflow document. | 156 |
| `MALFORMED_WORKFLOW` | Invalid workflow authoring data. | 157 |
| `UNSUPPORTED_PACKAGE` | Expected a Lattice document with schema 1 and minRuntime 2. | 162 |

### src/workflow/draft-revisions.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | Revision controls require own plain data. | 162 |
| `INVALID_SETTINGS` | Specify a node identity and explicit supported revision scope. | 163 |
| `OUTPUT_LIMIT` | Revision requires nonblank text within 100,000 UTF-16 units. | 164 |
| `INVALID_SETTINGS` | Protections require bounded nonblank literals. | 167 |
| `INVALID_SETTINGS` | At most 128 protected literals are permitted. | 169 |
| `OUT_OF_SCOPE_CHANGE` | Presentation sections are immutable during narrative revision. | 176 |
| `LINEAGE_LIMIT` | At most 64 revisions may be composed; ancestry is never truncated. | 180 |
| `INVALID_SPANS` | Revision would cross new scope delimiters. | 184 |
| `UNMATCHED_QUOTES` | Revision introduces ambiguous scope delimiters. | 185 |
| `OUTPUT_LIMIT` | Draft output exceeds its own bounded snapshot contract. | 189 |
| `INVALID_ANCESTRY` | Final revision requires authenticated Draft lineage. | 196 |
| `INVALID_ANCESTRY` | Copied lineage is not authenticated. | 226 |
| `INVALID_DRAFT` | Annotations require bounded own plain data. | 230 |
| `INVALID_ANCESTRY` | Annotations cannot change revision ancestry, source or text. | 231 |
| `INVALID_SPANS` | Annotations require valid exact spans and cannot widen revision permissions. | 232 |
| `INVALID_SPANS` | Annotations cannot reinterpret stored scope or exemption case authority. | 233 |
| `INVALID_SPANS` | Annotations must retain existing exemptions and narrow permissions for added exemptions. | 237 |
| `INVALID_SPANS` | Annotations require bounded valid exemption protection. | 238 |
| `DISCLOSURE_CHANGED` | Annotations cannot remove or change existing disclosure restrictions. | 240 |
| `PROTECTED_LITERAL_REMOVED` | Annotations cannot remove protection authority. | 242 |
| `INVALID_ASSEMBLY` | Assembly requires bounded own-data sections and controls. | 252 |
| `INVALID_ASSEMBLY` | Use unique stable section identities, bounded text and an explicit separator. | 253 |
| `ASSEMBLY_LIMIT` | At most 64 pending sections are permitted. | 265 |
| `OUTPUT_LIMIT` | Assembled reply exceeds 100,000 UTF-16 units. | 267 |
| `LINEAGE_LIMIT` | At most 64 composed revisions are permitted. | 269 |

### src/workflow/examples.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `MALFORMED_EXAMPLE` | That workflow example has no primary package. | 13 |
| `MALFORMED_EXAMPLE` | That workflow example contains malformed local package data. | 23 |
| `UNKNOWN_EXAMPLE` | That workflow example is unavailable. | 85 |

### src/workflow/file-store.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_FILE_BACKEND_RESULT` | The file backend must return a checked Result. | 13 |
| `INVALID_FILE_BACKEND_RESULT` | The backend failure is malformed. | 14 |
| `INVALID_FILE_BACKEND_RESULT` | The backend success contains an error. | 15 |
| `INVALID_FILE_CONFIG` | Storage requires a captured user/chat scope, authorized targets and trusted backend ports. | 47 |
| `FILE_CAPTURE_RELEASED` | This file capture has been released. | 48 |
| `CANCELLED` | File settlement was cancelled. | 49 |
| `STALE_FILE_SCOPE` | The captured workflow or user/chat scope changed. | 49 |
| `STALE_FILE_SCOPE` | The captured file authority could not be verified. | 50 |
| `FILE_TARGET_UNAUTHORIZED` | Select and authorize this storage target in the host. | 55 |
| `FILE_BACKEND_FAILED` | The authorized target could not be read. | 56 |
| `INVALID_FILE_SNAPSHOT` | The backend must provide a bounded revisioned document and receipts. | 59 |
| `FILE_REFERENCE_UNAUTHORIZED` | Use the live reference captured by this authorized Read File. | 71 |
| `INVALID_FILE_INTENT` | Provide a stable intent identity and bounded source evidence. | 72 |
| `FILE_FINGERPRINT_FAILED` | The prepared intent fingerprint could not be created. | 79 |
| `FILE_INTENT_CONFLICT` | The stable intent identity already refers to different proposed content. | 82 |
| `FILE_INTENT_UNAUTHORIZED` | Only this captured store can settle its prepared intents. | 90 |
| `PERSISTENCE_UNKNOWN` | A prior save for this target is unconfirmed; reconcile persistence before any write. | 91 |
| `FILE_INTENT_CONFLICT` | This persisted intent identity refers to different content. | 96 |
| `FILE_REVISION_CONFLICT` | The target changed. Recompute its projection and dependent story output before acceptance. | 99 |
| `FILE_EVIDENCE_FAILED` | The proposed file evidence could not be validated. | 100 |
| `INVALID_FILE_BACKEND_RESULT` | Evidence validation must return Result<void>. | 102 |
| `FILE_REVISION_CONFLICT` | The target changed during evidence validation. | 104 |
| `FILE_ACCEPTANCE_REQUIRED` | Canonical file persistence requires accepted root settlement. | 109 |
| `INVALID_FILE_BACKEND_RESULT` | CAS must explicitly report application, revision and durable acknowledgement. | 122 |
| `INVALID_FILE_CONTROLS` | File lifecycle controls require known own boolean fields. | 130 |
| `INVALID_FILE_BACKEND_CONFIG` | A logical-document backend needs a trusted user/chat scope and explicit creation templates. | 148 |
| `STALE_FILE_SCOPE` | The native chat scope is unavailable. | 149 |
| `STALE_FILE_SCOPE` | The active user or chat changed before storage access. | 150 |
| `INVALID_FILE_METADATA` | Native chat metadata requires own data fields. | 152 |
| `INVALID_FILE_METADATA` | The logical-document namespace is malformed. | 154 |
| `INVALID_FILE_METADATA` | The selected user document namespace is malformed. | 156 |
| `FILE_TARGET_UNAUTHORIZED` | A logical target identity is required. | 160 |
| `FILE_NOT_FOUND` | Select an existing logical document or an explicit creation template. | 162 |
| `INVALID_FILE_METADATA` | The stored document must match its captured target and scope. | 163 |
| `INVALID_FILE_BACKEND_UPDATE` | CAS requires a checked prepared document and bounded receipt. | 173 |
| `CANCELLED` | Logical-document settlement was cancelled. | 174 |
| `FILE_REVISION_CONFLICT` | The logical document changed before its atomic local replacement. | 178 |
| `FILE_RECEIPT_LIMIT` | Document revision/receipt capacity needs explicit reconciliation. | 179 |
| `FILE_DOCUMENT_LIMIT` | The resulting document and receipts exceed storage admission limits. | 182 |
| `INVALID_FILE_BACKEND_UPDATE` | The prepared document must be own plain data. | 190 |

### src/workflow/graph-validation.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `MALFORMED_WORKFLOW` | Expected native graph containers. | 51 |
| `UNSUPPORTED_VERSION` | Expected schema 3 and runtime 2. | 52 |
| `WRONG_PHASE` | Expected an explicit native workflow phase. | 53 |
| `DEFINITION_REF` | Bundle all pinned snapshots in the owning table, not inside definition bodies. | 54 |
| `LOCAL_COPY_OWNERSHIP` | Ownership registries belong only to the root document. | 55 |
| `INVALID_SETTINGS` | Invalid workflow metadata or role binding. | 56 |
| `MALFORMED_WORKFLOW` | The graph exceeds traversal limits. | 58 |
| `INVALID_GROUP` | Invalid group metadata. | 60 |
| `INVALID_GROUP` | Invalid group presentation or layout. | 61 |
| `INVALID_GROUP` | Invalid group membership. | 62 |
| `INVALID_GROUP` | Declared membership must agree with node membership. | 63 |
| `MALFORMED_WORKFLOW` | Invalid node identity. | 67 |
| `INVALID_SETTINGS` | Invalid node presentation or layout. | 68 |
| `INVALID_SETTINGS` | Invalid enabled/group setting. | 69 |
| `ROOT_BOUNDARY` | Boundary nodes belong inside definitions. | 73 |
| `LOCAL_COPY_OWNERSHIP` | Local-copy ownership belongs to one root instance and its exact definition ID. | 79 |
| `WRONG_PHASE` | The instance phase differs from its container. | 80 |
| `UNKNOWN_OPERATION` | Unknown operation or version. | 88 |
| `WRONG_PHASE` | An operation does not support the containing phase. | 89 |
| `ROOT_ONLY_OPERATION` | Root-only operations cannot appear in reusable definitions. | 90 |
| `ROOT_ONLY_OPERATION` | State inside a reusable definition requires an explicit snapshot input. | 91 |
| `MULTIPLE_MEMORY_COMMITS` | A root workflow supports one Memory Commit terminal. | 92 |
| `INVALID_SETTINGS` | Invalid model binding. | 93 |
| `INVALID_SETTINGS` | Invalid protected literals. | 95 |
| `INVALID_PORTAL` | Invalid portal publisher metadata. | 99 |
| `DANGLING_WIRE` | A portal refers to a missing local node. | 100 |
| `INVALID_PORT` | A portal must publish a matching local output. | 102 |
| `MALFORMED_WORKFLOW` | Invalid wire identity. | 106 |
| `INVALID_WIRE` | Invalid named wire metadata. | 107 |
| `MISSING_PORTAL` | A consumer requires a local portal publisher. | 110 |
| `INVALID_WIRE` | Portal consumers cannot also specify a direct source. | 111 |
| `INVALID_WIRE` | Expected one direct or portal route. | 113 |
| `DANGLING_WIRE` | A wire refers to a missing local node. | 114 |
| `INVALID_PORT` | A wire requires existing output and input ports. | 116 |
| `ARTIFACT_KIND` | These ports carry incompatible artifacts. | 117 |
| `AMBIGUOUS_INPUT` | A named input accepts one binding. | 119 |
| `CYCLE` | Resolved dependencies contain a cycle. | 130 |
| `DEFINITION_REF` | Expected an exact pinned reference. | 140 |
| `MISSING_DEFINITION` | The exact pinned snapshot is not bundled. | 142 |
| `DEFINITION_PARAMETER` | A target path must traverse existing subgraph instances. | 149 |
| `DEFINITION_PARAMETER` | A target must identify a primitive operation. | 155 |
| `INVALID_OVERRIDE` | Expected override maps. | 162 |
| `INVALID_OVERRIDE` | Unknown exposed parameter. | 165 |
| `INVALID_OVERRIDE` | Parameter override does not match its catalog type/range. | 169 |
| `INVALID_OVERRIDE` | Unknown role or invalid role override. | 183 |
| `INVALID_OVERRIDE` | Node binding overrides require structural tuple keys. | 185 |
| `INVALID_OVERRIDE` | Invalid node binding override. | 186 |
| `DEFINITION_REF` | Expected a local snapshot table. | 198 |
| `DEFINITION_REF` | Snapshot keys must match exact references. | 203 |
| `GRAPH_LIMIT` | Bundled snapshot traversal exceeds limits. | 205 |
| `DEFINITION_RECURSION` | Recursive definitions are not supported. | 209 |
| `DEFINITION_DEPTH` | Definition nesting exceeds depth 8. | 220 |
| `DEFINITION_CONFLICT` | The same ID/version has different canonical content. | 241 |
| `DEFINITION_HASH` | Snapshot hash does not match its semantic content. | 243 |
| `DEFINITION_DATA` | Expected bounded plain definition data. | 265 |
| `DEFINITION_CONFLICT` | The supplied snapshot conflicts with its bundled copy. | 271 |
| `MALFORMED_WORKFLOW` | Expected bounded plain workflow data. | 294 |
| `LOCAL_COPY_OWNERSHIP` | Expected a bounded structural ownership registry. | 307 |
| `LOCAL_COPY_OWNERSHIP` | Ownership paths and definition IDs must be unique. | 310 |
| `LOCAL_COPY_OWNERSHIP` | Root shorthand and registry ownership must agree. | 315 |
| `LOCAL_COPY_OWNERSHIP` | Each owned ID must have one exact live instance path. | 320 |
| `LOCAL_COPY_OWNERSHIP` | Every private child requires privately owned ancestor paths. | 321 |
| `AMBIGUOUS_INPUT` | Expanded input has multiple bindings. | 335 |
| `DEFINITION_DEPTH` | Instance nesting exceeds depth 8. | 340 |
| `CYCLE` | Expanded boundary dependencies contain a cycle. | 443 |
| `CYCLE` | Expanded primitive dependencies contain a cycle. | 454 |
| `INVALID_STAGE_DEPENDENCY` | Preparation cannot consume native reply or Post-stage output. Move a compatible node to Post or remove the reverse dependency. | 459 |

### src/workflow/host.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_CONTEXT_VISIBILITY` | Explicit source disclosure requires a valid own visibility label. | 38 |
| `INVALID_CONTEXT_VISIBILITY` | Explicit source disclosure could not be inspected. | 43 |
| `INVALID_CONTEXT_VISIBILITY` | Scene Context requires an own actor or public visibility mode. | 124 |
| `INVALID_CONTEXT_VISIBILITY` | Host context visibility requires a bounded selected actor identifier. | 126 |
| `INPUT_LIMIT` | The two latest context messages exceed the 100,000-character snapshot limit. Narrow the explicit source before running. | 148 |
| `OLDER_REPLY` | Only the latest completed assistant reply can be reviewed. | 172 |
| `REPLY_UNAVAILABLE` | Select a completed text-only assistant reply. | 173 |
| `INPUT_LIMIT` | The reply exceeds the 100,000-character repair limit. | 174 |
| `ABORTED` | Workflow was stopped. | 243 |
| `BINDING_CHANGED` | The fixed connection changed after preflight. Run preflight again. | 262 |
| `BINDING_CHANGED` | The fixed connection is no longer available. Run preflight again. | 264 |
| `BINDING_CHANGED` | The fixed connection is no longer available. | 265 |
| `NATIVE_BOUNDARY_REQUIRED` | One selected native generation boundary is required. | 295 |
| `NATIVE_ACTIVATION_REQUIRED` | One selected On Send activation is required. | 296 |
| `MULTIPLE_MEMORY_COMMITS` | Use one Memory Commit terminal per native root run. | 301 |
| `STALE_RUN` | Workflow source or settings changed. | 302 |
| `BUSY` | Wait for generation or reply application to finish. | 309 |
| `INTERNAL_TOOL_CONTINUATION` | Internal tool continuation does not run guidance. | 312 |
| `ROOT_ONLY` | Actor authority requires an owned unified workflow. | 319 |
| `ACTOR_PRESENCE_UNVERIFIED` | This run has no retained scene presence. | 321 |
| `ACTOR_TRIGGER_UNVERIFIED` | This run has no ordered live holder trigger. | 322 |
| `STALE_ACTOR_SCOPE` | Actor memory scope changed. | 325 |
| `ACTOR_MEMORY_UNAVAILABLE` | The authorized native memory scope could not be captured. | 326 |
| `ACTOR_MEMORY_UNAVAILABLE` | Authorized native memories are unavailable or stale. | 327 |
| `ACTOR_MEMORY_UNAVAILABLE` | Authorized native memories require their captured actor scope. | 327 |
| `STALE_RUN` | Workflow source changed before Introspection execution. | 356 |
| `PROMPT_UNAVAILABLE` | The configured prompt source was not captured. | 388 |
| `REPLY_UNAVAILABLE` | The stopped reply is not a completed repair target. | 410 |
| `STALE_SOURCE` | The workflow source changed during preparation. | 416 |
| `UNTRUSTED_MEMORY_INTENT` | Only the compiled Memory Commit terminal may settle its exact intent. | 425 |
| `INVALID_MEMORY_TERMINAL` | The compiled Memory Commit terminal did not provide its exact intent. | 429 |
| `STALE_CANDIDATE` | The candidate source is no longer available. | 432 |
| `EFFECT_REVIEW_REQUIRED` | Staged consequences require one authoritative Review/Publish terminal. | 441 |
| `UNTRUSTED_FINAL_DRAFT` | Accepted consequences require the exact authoritative final Draft. | 444 |
| `ABORTED` | The auxiliary request scope has closed. | 466 |
| `STALE_SOURCE` | The captured source changed before auxiliary dispatch. | 467 |
| `ACTOR_SCOPE_FAILED` | Use this run’s exact authorized auxiliary inputs. | 478 |
| `ACTOR_SCOPE_FAILED` | Private transport requires the native read-only user authority. | 480 |
| `BINDING_CHANGED` | The native transport binding check is unavailable. | 482 |
| `ACTOR_CONTEXT_CHANGED` | The live actor source cannot be checked before transmission. | 485 |
| `ACTOR_SCOPE_FAILED` | The native read-only user authority is unavailable. | 490 |
| `ACTOR_CONTEXT_CHANGED` | The private transport user scope changed. | 490 |
| `ACTOR_CONTEXT_CHANGED` | The live actor source changed before transmission. | 492 |
| `NATIVE_OWNER_MISSING` | Native continuation requires its matching Generation Started event. | 535 |
| `UNSUPPORTED_NATIVE_GENERATION` | Unified workflows support ordinary nongroup replies and newly generated swipes. | 536 |
| `USER_SCOPE_UNAVAILABLE` | A trusted current user handle is required for native continuation. | 537 |
| `REPLY_UNAVAILABLE` | Native continuation requires a live chat source. | 538 |
| `UNSUPPORTED_NATIVE_SOURCE` | Send requires a user message; swipe requires the latest completed assistant message. | 540 |
| `INVALID_CONTEXT_VISIBILITY` | Live source visibility is invalid. | 542 |
| `NATIVE_GENERATION_MISMATCH` | Native generation ended before its preparation was released. | 560 |
| `STALE_SOURCE` | The owned native chat, prefix, user or workflow changed. | 561 |
| `NATIVE_REPLY_MISSING` | Generation ended without its matching received reply. | 562 |
| `NATIVE_COMPLETION_TIMEOUT` | Native generation did not become settled after End. | 564 |
| `REPLY_UNAVAILABLE` | The owned native reply is incomplete, stopped or unsupported. | 568 |
| `NATIVE_GENERATION_MISMATCH` | The received reply does not identify the owned generation. | 574 |
| `NATIVE_REPLY_UNNORMALIZED` | Native reply swipe normalization did not finish. | 575 |
| `NATIVE_SWIPE_MISMATCH` | Generated swipe changed existing swipe identities. | 576 |
| `ROOT_ONLY` | Native file capabilities require an authorized unified workflow. | 590 |
| `ACTOR_FILE_SCOPE_MISMATCH` | Use this present actor’s exact captured file session. | 594 |
| `STALE_RUN` | The accepted effect source changed. | 604 |
| `STALE_RUN` | The native file scope changed during capture. | 605 |
| `STATE_SOURCE_REQUIRED` | Accepted story state requires an actual captured player turn. | 611 |
| `STALE_SOURCE` | The player turn changed while capturing accepted story state. | 613 |
| `STATE_EVIDENCE_CHANGED` | The occurrence is not supported by the captured player message. | 620 |
| `PRIVATE_MATERIAL` | Restricted player events require an explicitly scoped event source. | 621 |
| `STATE_EVIDENCE_CHANGED` | Draft occurrences require their retained authentic narrative source. | 624 |
| `STATE_EVIDENCE_CHANGED` | Use the captured player message or owned native Draft as event evidence. | 625 |
| `STALE_RUN` | Native workflow source changed. | 631 |
| `NATIVE_OWNER_MISSING` | Native activation requires its owned generation event. | 632 |
| `MULTIPLE_SEND_ACTIVATIONS` | One owned Send activation is supported. | 634 |
| `STATE_SOURCE_REQUIRED` | Player Event Source requires an actual player message. | 640 |
| `PRIVATE_MATERIAL` | Player Event Source requires a public actual player message. | 641 |
| `NATIVE_ACTIVATION_REQUIRED` | Generation requires this run’s owned On Send activation. | 649 |
| `MULTIPLE_NATIVE_GENERATIONS` | One native generation boundary is supported. | 650 |
| `STALE_SOURCE` | Source changed while preparing native generation. | 655 |
| `BINDING_CHECK_UNAVAILABLE` | Native preparation requires its private request binding snapshot. | 656 |
| `BINDING_CHECK_UNAVAILABLE` | Native preparation could not verify its request bindings. | 661 |
| `STALE_SOURCE` | Source changed while checking native preparation bindings. | 666 |
| `ACTOR_GUIDANCE_SCOPE` | Native generation cannot receive hidden or mixed actor guidance. | 678 |
| `ACTOR_GUIDANCE_SCOPE` | Native generation requires its currently selected actor’s guidance. | 678 |
| `ACTOR_GUIDANCE_UNVERIFIED` | Use exact retained current-actor guidance. | 678 |
| `INVALID_GUIDANCE` | Native guidance requires bounded Guidance and a tokenizer. | 680 |
| `TOKEN_COUNT_FAILED` | Guidance tokenizer returned an invalid count. | 684 |
| `GUIDANCE_OVERFLOW` | Guidance exceeds the native boundary token budget. | 685 |
| `STALE_MEMORY_EVIDENCE` | Selected memory evidence is no longer current. | 686 |
| `GUIDANCE_UNAVAILABLE` | Native guidance could not be installed. | 690 |
| `ACTOR_FILE_SCOPE_MISMATCH` | The present-actor file capture changed. | 712 |
| `ACTOR_FILE_SCOPE_MISMATCH` | The private file belongs to a changed native actor. | 713 |
| `HOST_OPERATION_REQUIRED` | Unsupported private host operation. | 724 |
| `OVERLAPPING_GENERATION` | A new generation overlapped the owned native continuation. | 727 |
| `OVERLAPPING_GENERATION` | Overlapping native requests are unsupported. | 728 |
| `NATIVE_BOUNDARY_MISSING` | The selected workflow never reached native generation. | 731 |
| `ABORTED` | The native generation was stopped before workflow preparation. | 741 |
| `STALE_CANDIDATE` | This candidate is no longer available; run the workflow again. | 779 |
| `ALREADY_APPLIED` | This revision has already been applied. | 780 |
| `STALE_SOURCE` | The chat, reply, swipe, or prompt source changed. Run the workflow again. | 783 |
| `STALE_SOURCE` | The accepted reply or its captured scope changed. | 793 |
| `SETTLEMENT_UNAVAILABLE` | This review has no retained consequence bundle. | 801 |
| `PERSISTENCE_RECOVERY_UNAVAILABLE` | Only failed targets in a partially settled accepted review may retry persistence. | 802 |
| `STALE_CANDIDATE` | This review is no longer retained. | 803 |
| `STALE_CANDIDATE` | The applied revision is no longer the selected reply. | 809 |
| `BUSY` | A reply application is already in progress. | 811 |
| `APPLY_UNAVAILABLE` | Required native save, display or swipe synchronization APIs are unavailable. | 815 |
| `APPLY_FAILED` | The revision could not be applied; the original local message was restored. | 859 |
| `NATIVE_GENERATION_MISMATCH` | Received message does not match the owned generation. | 882 |
| `RECALL_PREVIEW_NO_ACTIVATION` | Recall activates only on an owned ordinary Send or generated swipe. | 698 |
| `NATIVE_OWNER_MISSING` | This step starts when you send a message. Enable Lattice, then send a message in SillyTavern to run this workflow. | 759 |

### src/workflow/insertion.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_OPTIONS` | Expected insertion options. | 63 |
| `INVALID_OPTIONS` | Insertion options must be plain data. | 65 |
| `INVALID_OPTIONS` | Provide finite placement coordinates, a path of instance IDs, and an ID allocator. | 67 |
| `READ_ONLY_VIEW` | Make an explicit local copy of the containing view before insertion. | 71 |
| `MODE_MISMATCH` | Paste a fragment compatible with the containing stage. | 73 |
| `INVALID_LAYOUT` | Layout coordinates and dimensions must be finite numbers. | 77 |
| `IDENTITY_COLLISION` | The identity allocator could not produce a fresh ID. | 112 |
| `INVALID_ID` | The identity allocator must return a safe nonempty string. | 114 |
| `SEMANTIC_COMMENT_INSERTION` | Comment-only insertion must preserve execution identity. | 204 |
| `INSERTION_FAILED` | Could not prepare this workflow insertion. | 208 |

### src/workflow/introspection/analysis.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_CONTEXT` | Expected bounded plain Context data. | 39 |
| `INPUT_LIMIT` | Context requires at most 64 bounded messages with valid explicit revisions when supplied. | 42 |
| `REQUEST_FAILED` | Analysis request returned no valid result; no retry was made. | 61 |
| `TRUNCATED_OUTPUT` | The response reached its completion limit. | 64 |
| `COMPLETION_UNVERIFIED` | The response has no verified complete text result. | 65 |
| `EMPTY_OUTPUT` | The response is empty. | 66 |
| `OUTPUT_LIMIT` | The response exceeds the bounded output limit. | 67 |
| `ABORTED` | The operation was stopped before transmission. | 81 |
| `SERVICE_UNAVAILABLE` | Model request service is unavailable. | 82 |
| `INPUT_LIMIT` | The prompt exceeds the bounded input limit. | 83 |
| `ABORTED` | The operation was stopped; discard its late response. | 87 |
| `STALE_INPUT` | Supplied material changed while the request was pending. | 88 |
| `REQUEST_FAILED` | Model request returned an invalid response; no retry was made. | 94 |
| `INVALID_SETTINGS` | Use a supported mode, bounded instructions and a completion limit from 1 to 65536. | 100 |
| `INVALID_PORTS` | Expected own data fields and explicitly injected capabilities. | 102 |
| `SCOPE_MISMATCH` | Explicit Context scope differs from the actor scope. | 108 |
| `STALE_INTROSPECTION_STATE` | Episode scope, store or version differs from the actor state. | 111 |
| `INVALID_INTROSPECTION_EVIDENCE` | Supplied sources have conflicting revisions. | 115 |
| `INVALID_OUTPUT` | Expected a raw JSON reflection payload. | 122 |
| `UNKNOWN_EPISODE` | The assessment recalls an episode that was not supplied. | 126 |
| `STALE_INTROSPECTION_STATE` | Event scope, store or version differs from the actor state. | 140 |
| `INVALID_INTROSPECTION_EVIDENCE` | Internalize requires at least one settled event. | 141 |
| `INVALID_OUTPUT` | Expected a raw JSON state-proposal payload. | 148 |
| `INVALID_INTROSPECTION_EVIDENCE` | Every proposed item requires supplied settled event evidence. | 151 |
| `STALE_INTROSPECTION_STATE` | Supplied scope, store or version differs from the assessment. | 170 |
| `STALE_INTROSPECTION_STATE` | Event scope, store or version differs from the assessment. | 178 |
| `ABORTED` | The operation was stopped. | 196 |
| `OUTPUT_LIMIT` | Fictional text exceeds 4096 characters. | 201 |
| `EMPTY_OUTPUT` | The assessment has no hints for this mode. | 205 |
| `OUTPUT_LIMIT` | Rendered guidance exceeds 4096 characters. | 206 |

### src/workflow/introspection/context-state.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | Settings must contain only supported plain data controls. | 17 |
| `INVALID_SETTINGS` | Context requires bounded settings for a supported mode. | 23 |
| `INVALID_SETTINGS` | Perspective requires an explicit actor ID. | 24 |
| `INVALID_CONTEXT` | Context requires a bounded plain named-input map. | 36 |
| `ABORTED` | Context shaping was stopped. | 37 |
| `MISSING_INPUT` | This Context mode requires its named context input. | 42 |
| `ABORTED` | Context shaping was stopped; ignore its late result. | 57 |
| `STALE_INPUT` | Supplied Context changed while Focus was pending. | 59 |
| `INVALID_CONTEXT` | Focus produced malformed or oversized Context. | 62 |
| `INVALID_CONTEXT` | Explicit visibility must be a bounded array of actor IDs. | 68 |
| `VISIBILITY_REQUIRED` | Perspective requires explicit visibility on supplied messages. | 69 |
| `INVALID_CONTEXT` | Message evidence revisions must be bounded IDs. | 70 |
| `INVALID_CONTEXT` | Context shaping could not consume its inputs. | 88 |
| `INVALID_SETTINGS` | State requires bounded values and supported deterministic controls. | 94 |
| `INVALID_SETTINGS` | Curve durations must be positive bounded phase durations. | 95 |
| `ACTOR_MISMATCH` | State settings refer to a different actor. | 105 |
| `INVALID_STATE` | Curve recovery exceeded numeric limits. | 123 |
| `STALE_INTROSPECTION_STATE` | Events scope, store or prior version differs from state. | 127 |
| `STALE_INTROSPECTION_STATE` | An event revision changed after its recorded evidence. | 132 |
| `TRACK_LIMIT` | Track exceeds 64 distinct settled event IDs. | 137 |
| `EVIDENCE_LIMIT` | Track evidence exceeds 64 source references. | 140 |
| `INVALID_STATE` | State advancement could not consume its inputs. | 145 |

### src/workflow/introspection/contracts.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_PORTS` | Expected own injected capabilities and a valid AbortSignal. | 76 |
| `STALE_INTROSPECTION_STATE` | Proposal scope, store or prior version differs from state. | 185 |

### src/workflow/introspection/host-memory.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_CONTEXT_VISIBILITY` | Explicit context visibility requires bounded actor identifiers. | 18 |
| `INVALID_CONTEXT_VISIBILITY` | Explicit context visibility could not be inspected. | 20 |
| `CHAT_REQUIRED` | Select an active chat before reading or committing memory. | 30 |
| `ACTOR_REQUIRED` | Select an active character before reading or committing group memory. | 31 |
| `SCOPE_MISMATCH` | The active chat or actor changed before memory persistence. | 60 |
| `MEMORY_AUTHORITY_RELEASED` | This workflow memory authority has been released. | 62 |
| `CANCELLED` | Memory commit was cancelled before persistence. | 63 |
| `STALE_SOURCE` | The workflow or chat source changed before memory persistence. | 64 |
| `INVALID_MEMORY_CONTEXT` | Historical memory evidence could not be inspected. | 97 |
| `IDEMPOTENCY_CONFLICT` | The commit key has an unconfirmed save for different content. | 105 |
| `PERSISTENCE_UNKNOWN` | Locally applied unconfirmed memory is unavailable; reload confirmed metadata before another write. | 108 |
| `PERSISTENCE_UNKNOWN` | An unconfirmed local memory version or receipt changed; reload confirmed metadata before another write. | 112 |
| `PERSISTENCE_UNKNOWN` | This exact commit was applied locally but its native save remains unconfirmed; reload confirmed metadata before retrying it. | 114 |
| `INVALID_INTROSPECTION_EVIDENCE` | A selected settled message or its actor visibility changed. | 143 |
| `INVALID_MEMORY_CONTEXT` | Active chat messages are unavailable. | 150 |
| `STALE_SOURCE` | Settled messages changed while their evidence was captured. | 158 |
| `INVALID_ACCEPTED_MEMORY` | The exact accepted original and selected publication must remain unchanged. | 178 |
| `INVALID_ACCEPTED_MEMORY` | The accepted native source could not be fingerprinted. | 181 |
| `INVALID_ACCEPTED_MEMORY` | The accepted native source changed while its revision was captured. | 182 |
| `MEMORY_SAVE_UNAVAILABLE` | The native metadata save API is unavailable. | 199 |
| `STALE_VERSION` | Actor memory changed immediately before native persistence. | 202 |
| `INVALID_MEMORY_METADATA` | The native introspection namespace is malformed. | 206 |
| `ROOT_REQUIRED` | Native persistence requires captured workflow authority. | 223 |
| `INVALID_MEMORY_CONFIG` | Native memory store identity is invalid. | 245 |
| `STALE_SOURCE` | Selected memory evidence changed after it was read. | 264 |
| `STALE_SOURCE` | Selected memory evidence could not be rechecked. | 265 |
| `INVALID_ACCEPTED_MEMORY` | Use the captured final narrative and original swipe identity. | 278 |
| `INVALID_ACCEPTED_MEMORY` | Memory must retain the exact selected native source. | 280 |
| `FINAL_EVIDENCE_REEXTRACT_REQUIRED` | Memory source narrative changed. Reextract or rebase its evidence from the final narrative body before accepting. | 282 |
| `INVALID_ACCEPTED_MEMORY` | Only the exact owned original-preserving publication may authorize retained memory. | 291 |
| `INVALID_ACCEPTED_MEMORY` | The original native swipe metadata changed during publication. | 293 |
| `INVALID_ACCEPTED_MEMORY` | Published final reply is unavailable. | 294 |
| `INVALID_MEMORY_CONTEXT` | Native memory authority could not be captured. | 310 |

### src/workflow/introspection/memory.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_MEMORY_CONFIG` | Options must be a plain object. | 21 |
| `INVALID_MEMORY_CONFIG` | Options require known own data fields. | 23 |
| `INVALID_MEMORY_CONFIG` | Options could not be inspected. | 25 |
| `SCOPE_MISMATCH` | Record belongs to another chat, actor or store. | 35 |
| `INVALID_MEMORY_RECEIPTS` | Receipts must be a bounded array. | 39 |
| `INVALID_MEMORY_RECEIPTS` | Receipt identity, fingerprint or committed version is invalid. | 42 |
| `INVALID_MEMORY_SNAPSHOT` | A snapshot requires state and receipts. | 51 |
| `INVALID_MEMORY_BACKEND_RESULT` | Backend must return a plain Result. | 60 |
| `INVALID_MEMORY_BACKEND_RESULT` | Backend failure is malformed. | 64 |
| `INVALID_MEMORY_BACKEND_RESULT` | Backend success is malformed. | 67 |
| `MEMORY_BACKEND_FAILED` | The memory backend operation failed. | 75 |
| `INVALID_MEMORY_CONFIG` | Memory requires a valid scope, store and explicit backend ports. | 83 |
| `INVALID_MEMORY_CONTROLS` | Commit lifecycle flags must be booleans. | 91 |
| `INVALID_MEMORY_CONTROLS` | Cancellation requires an AbortSignal. | 94 |
| `CANCELLED` | Memory commit was cancelled before persistence. | 99 |
| `INVALID_MEMORY_READ` | Memory view must be state, events or episodes. | 140 |
| `INVALID_MEMORY_RECALL` | Recall requires bounded query text and a limit from 1 to 64. | 163 |
| `IDEMPOTENCY_CONFLICT` | The idempotency key was used for different content. | 181 |
| `PERSISTENCE_UNKNOWN` | The prior save outcome is unknown; confirm persistence before another write. | 185 |
| `IDEMPOTENCY_CONFLICT` | The idempotency key has an unresolved save for different content. | 185 |
| `PERSISTENCE_UNKNOWN` | A prior save outcome remains unknown; confirm its receipt before another write. | 186 |
| `STALE_VERSION` | Commit prior version no longer matches the store. | 195 |
| `INVALID_MEMORY_BACKEND_RESULT` | Source validation must return Result<void>. | 199 |
| `STALE_VERSION` | The store changed during evidence validation. | 204 |
| `STALE_VERSION` | State content changed without advancing its version. | 205 |
| `INVALID_INTROSPECTION_EVIDENCE` | Proposal tracks require current settled event provenance. | 211 |
| `VERSION_LIMIT` | The next store version exceeds the safe integer limit. | 214 |
| `RECEIPT_LIMIT` | Receipt capacity requires explicit host reconciliation. | 215 |
| `INVALID_MEMORY_BACKEND_RESULT` | CAS must explicitly report acknowledgement. | 233 |
| `INVALID_INTROSPECTION_EVIDENCE` | Committed factual observations require explicit settled-event provenance. | 243 |
| `ROOT_REQUIRED` | Only explicit root settlement may commit memory. | 244 |
| `COMMIT_DISABLED` | Preview and dry-run execution cannot commit memory. | 245 |
| `MEMORY_BACKEND_FAILED` | Memory settlement could not complete. | 246 |
| `INVALID_MEMORY_CAS` | CAS requires a prior version, state and receipt. | 264 |
| `STALE_VERSION` | The compare-and-swap prior version has changed. | 266 |
| `INVALID_MEMORY_CAS` | CAS state and receipt must advance exactly one version. | 267 |
| `MEMORY_BACKEND_FAILED` | Current events could not be read. | 284 |
| `INVALID_MEMORY_CONFIG` | Metadata storage requires explicit scoped host ports. | 326 |
| `MEMORY_BACKEND_FAILED` | Chat context could not be read. | 329 |
| `INVALID_MEMORY_CONTEXT` | Chat context requires chat identity and plain metadata. | 331 |
| `SCOPE_MISMATCH` | The active chat changed before memory persistence. | 332 |
| `INVALID_MEMORY_METADATA` | Introspection metadata namespace is malformed. | 338 |
| `INVALID_MEMORY_METADATA` | Introspection store metadata is malformed. | 341 |
| `STALE_VERSION` | Metadata changed during compare-and-swap. | 354 |
| `PERSISTENCE_UNKNOWN` | The previous metadata save remains unconfirmed; no further save is authorized. | 359 |
| `STALE_VERSION` | Metadata changed during source revalidation. | 373 |
| `INVALIDATED_SOURCES` | Stored historical evidence has changed or no longer exists; explicit reconciliation is required. | 113 |

### src/workflow/introspection/native.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | Use plain native Introspection metadata. | 33 |
| `INVALID_SETTINGS` | Native Introspection metadata requires enumerable own data properties. | 35 |
| `UNKNOWN_OPERATION` | Unknown Introspection operation. | 38 |
| `UNKNOWN_OPERATION` | Unknown Introspection operation version. | 39 |
| `INVALID_SETTINGS` | Select a supported Introspection mode. | 41 |
| `INVALID_SETTINGS` | Introspection controls require bounded plain own data. | 48 |
| `INVALID_SETTINGS` | Native Introspection metadata could not be projected. | 51 |
| `INVALID_SETTINGS` | Use plain native Introspection phase options. | 82 |

### src/workflow/introspection/nodes.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | Expected a version-1 introspection workflow node. | 29 |
| `INVALID_SETTINGS` | Unsupported mode or node identity. | 31 |
| `INVALID_SETTINGS` | Unknown control for this introspection mode. | 34 |
| `INVALID_SETTINGS` | Control values exceed their bounds or use an unsupported shape. | 47 |
| `INVALID_SETTINGS` | Unsupported execution phase. | 73 |
| `INVALID_PHASE` | Memory Commit settles only after a successful root run. | 74 |
| `INVALID_INPUT` | Expected bounded plain named inputs. | 82 |
| `INVALID_INPUT` | Unknown named input. | 90 |
| `ABORTED` | Introspection was stopped. | 97 |
| `ROOT_ONLY` | Memory operations require the root graph. | 98 |
| `CALL_LIMIT` | Introspection request bound exceeded. | 102 |
| `SERVICE_UNAVAILABLE` | A resolved model request service is required. | 103 |
| `SERVICE_UNAVAILABLE` | A scoped memory service is required. | 120 |
| `MISSING_INPUT` | State needs an explicit snapshot or scoped memory service. | 126 |
| `STALE_INPUT` | Named inputs changed while introspection was pending. | 133 |
| `INVALID_RESULT` | Introspection service returned no verified result. | 134 |
| `INVALID_RESULT` | Introspection output kind differs from its descriptor. | 135 |
| `INTROSPECTION_FAILED` | Introspection inputs or services could not be consumed. | 138 |

### src/workflow/iteration-helpers.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `ABORTED` | Iteration was stopped; no partial result was published. | 15 |
| `INVALID_ITERATION_SETTINGS` | Compile a schema 3 pinned helper with an explicit phase, owner address and finite request bound. | 53 |
| `ITERATION_ADDRESS_LIMIT` | Iteration identities must fit the bounded root request history. | 54 |
| `ITERATION_PHASE` | The root workflow and iteration stage must agree. | 55 |
| `INVALID_ITERATION_ADDRESS` | The iteration owner must belong to a real root definition scope. | 57 |
| `INVALID_ITERATION_SETTINGS` | The iteration owner has invalid helper role bindings. | 63 |
| `ITERATION_DEPTH` | Qualified iteration helper addresses exceed depth 8. | 66 |
| `INVALID_ITERATION_SETTINGS` | The iteration helper could not be compiled from bounded own data. | 69 |
| `ITERATION_GRAPH_LIMIT` | Iteration helper compilation exceeds its bounded graph limit. | 83 |
| `ITERATION_CYCLE` | Iteration helpers cannot recursively invoke an active pinned helper. | 85 |
| `ITERATION_INTERFACE` | Helpers require Data item/result and explicit Data projectedState/nextState for stateful iteration. | 91 |
| `ITERATION_PHASE` | A pinned legacy helper scope belongs to another stage. | 102 |
| `ITERATION_ADDRESS_LIMIT` | Helper identities must fit the bounded root request history. | 106 |
| `ITERATION_PHASE` | A helper operation conflicts with the invocation stage. | 108 |
| `ITERATION_AUTHORITY` | Helper graphs cannot acquire root host, publication or native generation authority. | 109 |
| `INVALID_OVERRIDE` | Select a role actually declared by this helper or its nested iteration helpers. | 119 |
| `ITERATION_CALL_LIMIT` | The real helper request bound exceeds the authored per-iteration limit. | 130 |
| `INVALID_ITERATION_CAPABILITY` | Use the private compiler capability for this exact helper. | 141 |
| `INVALID_ITERATION_INVOCATION` | Iteration invocation requires bounded own JSON. | 143 |
| `INVALID_ITERATION_INVOCATION` | The invocation must match the compiled pin, stage and qualified owner. | 145 |
| `ITERATION_ADAPTER_MISSING` | The trusted root operation adapter is required. | 146 |
| `ACTOR_SCOPE_FAILED` | The helper seed scope was not retained. | 156 |
| `ITERATION_UNIT_FAILED` | A helper operation failed; no partial result was published. | 166 |
| `INVALID_ITERATION_OUTPUT` | A helper returned undeclared output pins. | 170 |
| `INVALID_ITERATION_OUTPUT` | Helper output states must match declared artifacts. | 172 |
| `INVALID_ITERATION_OUTPUT` | A helper returned invalid bounded artifacts or disclosure metadata. | 174 |
| `INVALID_ITERATION_OUTPUT` | A helper text modifier could not be applied. | 176 |
| `ACTOR_SCOPE_FAILED` | The helper output scope was not retained. | 178 |
| `ITERATION_OUTPUT_UNRESOLVED` | The helper result is skipped or unresolved. | 183 |
| `ITERATION_OUTPUT_UNRESOLVED` | The helper next state is skipped or unresolved. | 185 |
| `INVALID_ITERATION_OUTPUT` | The helper returned invalid own data; no partial result was published. | 187 |

### src/workflow/library/slop-policies.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SLOP_LIBRARY` | Library must contain bounded, consistent typed policy JSON. | 39 |
| `INVALID_SLOP_SETTINGS` | Settings must contain a known mode, scope and unique category IDs. | 41 |
| `INVALID_SLOP_SETTINGS` | Settings contain an unknown field. | 43 |
| `INVALID_SLOP_LIBRARY` | Selected policy JSON exceeds Data limits. | 61 |

### src/workflow/library/subgraphs.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `LIBRARY_PACKAGE` | The library subgraph could not be packaged. | 89 |
| `UNKNOWN_LIBRARY_SUBGRAPH` | Unknown library subgraph ID. | 103 |

### src/workflow/modifiers.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_MODIFIERS` | Use at most 16 unique version 1 modifiers with exact known bounded settings. | 46 |
| `INCOMPATIBLE_MODIFIERS` | Modifiers require a primitive node with exactly one Text output. | 51 |
| `INVALID_MODIFIERS` | Modifiers must be plain authoring data. | 54 |
| `MODIFIER_TEXT_LIMIT` | Modifier sources must be Text of at most 100,000 UTF-16 units. | 93 |
| `MODIFIER_OUTPUT_LIMIT` | Each modifier output must fit 100,000 UTF-16 units. | 108 |

### src/workflow/native-actor-context.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_ACTOR_PORTS` | Actor context requires trusted own host capabilities. | 27 |
| `ACTOR_PRESENCE_UNVERIFIED` | Use this run’s exact checked scene presence. | 51 |
| `ACTOR_PRESENCE_UNVERIFIED` | Use this actor’s confirmed current source presence. | 52 |
| `ACTOR_PRESENCE_UNVERIFIED` | The live presence source could not be authorized. | 54 |
| `ACTOR_NOT_LOADED` | Select an actual loaded canonical actor. | 58 |
| `ACTOR_GRANT_REQUIRED` | Use the exact privately captured actor grant. | 64 |
| `STALE_ACTOR_SCOPE` | Actor scope, source or loaded selection changed. | 67 |
| `STALE_ACTOR_SCOPE` | The loaded native actor scope is unavailable. | 70 |
| `INVALID_ACTOR_REQUEST` | Use the live actor request scope and signal. | 74 |
| `ACTOR_MODEL_SCOPE` | Character Direction Data must retain this actor’s exact current authority. | 75 |
| `ACTOR_PRESENCE_UNVERIFIED` | The requested scene must match the exact retained source. | 77 |
| `ACTOR_CONTEXT_LIMIT` | Narrow the bounded actor scene source. | 79 |
| `ACTOR_MEMORY_UNAVAILABLE` | Authorized actor memories could not be read. | 81 |
| `ACTOR_MEMORY_UNAVAILABLE` | Authorized memories require a bounded actor list. | 81 |
| `ACTOR_MEMORY_SCOPE_MISMATCH` | Authorized memories must belong only to this actor. | 81 |
| `ACTOR_CONTEXT_LIMIT` | Actor context exceeds the bounded data contract. | 82 |
| `ACTOR_ARTIFACT_SCOPE` | Retain only a checked immutable artifact in its captured actor scope. | 84 |
| `ACTOR_MODEL_SCOPE` | Model inputs require checked named artifacts. | 86 |
| `STALE_ACTOR_SCOPE` | Model source scope changed. | 86 |
| `ACTOR_MODEL_SCOPE` | Auxiliary models cannot receive hidden or mixed actor scopes. | 86 |
| `ACTOR_MODEL_SCOPE` | Private model inputs require their exact captured actor authority. | 87 |
| `ACTOR_MODEL_SCOPE` | Private model inputs require captured actor authority. | 88 |
| `ACTOR_CONTEXT_CHANGED` | The actor model must use its exact live captured context. | 92 |
| `ACTOR_MODEL_SCOPE` | Character Direction Data must retain its captured actor context scope. | 93 |
| `ACTOR_TRIGGER_UNVERIFIED` | Prompted Memory requires an exact live ordered holder event. | 94 |
| `ACTOR_TRIGGER_UNVERIFIED` | The ordered holder trigger could not be authorized. | 94 |
| `ACTOR_TRIGGER_UNVERIFIED` | Prompted Memory requires its exact current holder event and source. | 94 |
| `ACTOR_ARTIFACT_SCOPE` | Capture only a successful owned private producer. | 97 |
| `ACTOR_ARTIFACT_SCOPE` | The private output must preserve its exact captured producer payload. | 99 |
| `ACTOR_ARTIFACT_SCOPE` | Private outputs must retain their actor source authority. | 100 |
| `ACTOR_GUIDANCE_UNVERIFIED` | Retain only the exact checked Character Direction output. | 102 |
| `ACTOR_GUIDANCE_UNVERIFIED` | Character guidance source is unavailable. | 102 |
| `ACTOR_GUIDANCE_UNVERIFIED` | Private native guidance requires its exact retained actor producer. | 104 |
| `ACTOR_GUIDANCE_SCOPE` | Native generation requires the currently selected actor’s guidance. | 104 |
| `STALE_ACTOR_SCOPE` | Native actor selection changed. | 104 |

### src/workflow/native-draft-evidence.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_DRAFT_EVIDENCE_CONFIG` | Use trusted native Draft ownership callbacks. | 13 |
| `STALE_DRAFT_EVIDENCE` | Native Draft evidence authority changed. | 17 |
| `NATIVE_SOURCE_REQUIRED` | The owned native Draft is unavailable. | 18 |
| `UNTRUSTED_DRAFT_EVIDENCE` | Evidence must originate from this native Draft or its authentic revisions. | 21 |
| `INVALID_DRAFT_EVIDENCE` | Use the exact Draft Event Source inputs and output. | 27 |
| `INVALID_DRAFT_EVIDENCE` | Draft source scope and result require Data envelopes. | 29 |
| `DRAFT_SOURCE_MISMATCH` | Captured source must describe the exact narrative body and scope. | 31 |
| `DRAFT_DISCLOSURE_MISMATCH` | Evidence cannot declassify private narrative material. | 33 |
| `DRAFT_SOURCE_CONFLICT` | A captured source identity already describes another body. | 37 |
| `DRAFT_EVIDENCE_LIMIT` | A run retains at most 256 canonical narrative sources. | 38 |
| `INVALID_FILE_EVIDENCE` | Canonical writes require confirmed occurrences. | 43 |
| `FINAL_EVIDENCE_REEXTRACT_REQUIRED` | Reextract canonical occurrences from the authoritative final narrative body. | 45 |

### src/workflow/native-persistence.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_PERSISTENCE_CONTROLS` | Use a trusted optional cancellation signal. | 39 |
| `CANCELLED` | Persistence verification was stopped. | 40 |
| `PERSISTENCE_VERIFICATION_UNAVAILABLE` | Select bounded story metadata in the active user’s character chat. | 41 |
| `NATIVE_SAVE_UNAVAILABLE` | A native metadata save method is required. | 46 |

### src/workflow/native-recall.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `RECALL_SESSION_LIMIT` | The controller reached its bounded Recall session limit. | 51 |
| `RECALL_GRAPH_INVALID` | Recall shortcuts require a valid active unified workflow. | 52 |
| `RECALL_REGISTRATION_PENDING` | The scoped shortcut registration is already pending. | 66 |
| `STALE_RECALL_SHORTCUT` | This shortcut belongs to another active scope. | 67 |
| `RECALL_HOTKEY_UNAVAILABLE` | The trusted shortcut listener is unavailable. | 67 |
| `RECALL_HOTKEY_UNAVAILABLE` | The listener returned an unavailable cleanup capability. | 68 |
| `RECALL_HOTKEY_UNAVAILABLE` | The trusted listener did not return its scoped cleanup. | 69 |
| `STALE_RECALL_SHORTCUT` | The active scope changed while registering Recall. | 70 |
| `RECALL_UNAVAILABLE` | Enable Lattice and open a unified workflow for the active character. | 75 |
| `STALE_RECALL_CONTEXT` | Recall scope or status changed. Reopen these controls and try again. | 78 |
| `INVALID_RECALL_QUEUE` | Use a bounded recall selection. | 79 |
| `RECALL_NODE_UNAVAILABLE` | Select configured Recall Shortcuts in the current workflow. | 80 |
| `RECALL_QUEUE_CONFLICT` | Matching Recall Shortcuts use different policies. Make their target, repetition, and consumption settings match. | 82 |
| `INVALID_RECALL_OWNER` | Bind exact private native run controls. | 89 |
| `STALE_RECALL_SCOPE` | The native Recall scope changed before capture. | 91 |
| `RECALL_SOURCE_UNAVAILABLE` | Capture Recall from its current trusted native producer. | 100 |
| `INVALID_RECALL_SOURCE` | Use bounded native source identity. | 101 |
| `RECALL_RECORDS_UNVERIFIED` | Memory capture requires its exact checked canonical read. | 103 |
| `RECALL_SOURCE_UNAVAILABLE` | The source producer was revoked during capture. | 105 |
| `RECALL_SOURCE_UNAVAILABLE` | Use a captured native source producer. | 107 |
| `INVALID_RECALL_SOURCE` | Use bounded actual source metadata and text. | 107 |
| `RECALL_PROVENANCE_REQUIRED` | Use an exact current artifact from the trusted native source. | 108 |
| `RECALL_SOURCE_UNAVAILABLE` | The native Recall source was revoked. | 110 |
| `RECALL_SOURCE_UNAVAILABLE` | The native Recall source changed during retention. | 145 |
| `RECALL_PRESENCE_UNVERIFIED` | Presence must derive from this generationâ€™s actual scene source. | 149 |
| `RECALL_PRESENCE_UNVERIFIED` | Presence is restricted to another actor. | 151 |
| `RECALL_PRESENCE_UNVERIFIED` | Participating actors need evidence quoted from the actual scene source. | 153 |
| `RECALL_PRESENCE_UNVERIFIED` | Presence source changed during authorization. | 155 |
| `RECALL_PRESENCE_UNVERIFIED` | Use current native source-derived presence. | 157 |
| `RECALL_HOLDER_UNVERIFIED` | Use an unchanged actual occurrence from the current ordered holder producer. | 158 |
| `RECALL_HOLDER_UNVERIFIED` | Holder evidence is stale or restricted to another actor. | 158 |
| `RECALL_GUIDANCE_UNVERIFIED` | Use the exact privately authorized Recall Guidance. | 159 |
| `RECALL_TRIGGER_UNVERIFIED` | Keyword activation requires its exact current native narrative source. | 161 |
| `RECALL_TRIGGER_UNVERIFIED` | Event activation requires unchanged canonical confirmed occurrences from the actual current source. | 162 |
| `RECALL_RECORDS_UNVERIFIED` | Recall records require a live authorized File or Memory read. | 166 |
| `RECALL_ACTOR_MISMATCH` | Memory belongs to another actor or chat. | 172 |
| `RECALL_RECORDS_UNVERIFIED` | Canonical Memory scope, store, evidence and selected episodes must preserve the exact captured read. | 173 |
| `RECALL_RECORDS_UNVERIFIED` | Memory records cannot be invented or rewritten by source transformations. | 179 |
| `RECALL_ACTOR_MISMATCH` | Memory is private to another actor. | 180 |
| `RECALL_OWNER_MISSING` | Recall requires its owned native reply or generated swipe. | 185 |
| `STALE_RECALL_SCOPE` | Recall source changed during authorization. | 189 |
| `RECALL_CLAIM_UNAUTHORIZED` | Retain only this generationâ€™s exact live claim. | 190 |
| `ABORTED` | Recall was cancelled without publishing private material. | 191 |
| `STALE_RECALL_SOURCE` | Recall source changed before acceptance. | 198 |
| `STALE_RECALL_SCOPE` | Recall acceptance belongs to another generation. | 199 |

### src/workflow/native-settlement.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `FINAL_SOURCE_MISMATCH` | Accepted narrative must retain its original native source. | 23 |
| `FINAL_EVIDENCE_CHANGED` | Publication must use the exact Draft paired with its checked narrative evidence. | 24 |
| `EFFECTS_SEALED` | Acceptance sealed the retained effects; validate a new bundle to change them. | 27 |
| `INVALID_SETTLEMENT_SOURCE` | A captured native Draft is required. | 30 |
| `FINAL_SOURCE_MISMATCH` | Accepted narrative must retain the captured native source. | 32 |
| `FINAL_EVIDENCE_CHANGED` | Persistence recovery must keep the exact published Draft and presentation unchanged. | 38 |
| `NATIVE_SETTLEMENT_FAILED` | Retained acceptance could not complete. | 46 |
| `INVALID_FILE_EVIDENCE` | Use bounded canonical occurrence evidence. | 54 |
| `INVALID_FILE_EVIDENCE` | Canonical writes require confirmed occurrence records. | 57 |
| `FINAL_EVIDENCE_REEXTRACT_REQUIRED` | Canonical Draft evidence changed. Reextract or rebase it from the final narrative body before accepting. | 60 |
| `FINAL_EVIDENCE_CHANGED` | Final evidence must describe the authoritative narrative body. | 61 |
| `INVALID_NATIVE_FILE_CONFIG` | Native file staging requires captured catalog and persistence capabilities. | 70 |
| `FILE_SCOPE_UNAVAILABLE` | The logical document catalog is unavailable. | 72 |
| `STALE_FILE_SCOPE` | Document catalog belongs to another user or chat. | 73 |
| `PERSISTENCE_UNKNOWN` | This target has an unconfirmed native save. Reconcile it before another write. | 80 |
| `FILE_NOT_AUTHORIZED` | Select a document authorized in this chat. | 83 |
| `PRIVATE_DESTINATION` | Select this actor’s authorized private document. | 84 |
| `STALE_FILE_SCOPE` | Workflow Data authorization changed. | 85 |
| `NATIVE_SOURCE_REQUIRED` | A completed native source is required before staging a write. | 88 |
| `STALE_FILE_SCOPE` | Document intent scope changed. | 88 |

### src/workflow/native-story-state.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `STALE_STATE_SCOPE` | The accepted state scope changed or was released. | 32 |
| `STALE_STATE_SCOPE` | The accepted state scope could not be verified. | 32 |
| `STATE_EVIDENCE_CHANGED` | The captured event source could not be verified. | 33 |
| `STATE_EVIDENCE_CHANGED` | Use a confirmed occurrence from the captured player message or native Draft. | 33 |
| `STATE_EVIDENCE_CHANGED` | The captured event evidence changed. | 33 |
| `PLAYER_SOURCE_UNAVAILABLE` | A trusted captured player source is required. | 34 |
| `INVALID_CLOCK` | Select an authorized clock document. | 37 |
| `INVALID_CLOCK` | Story Clock requires an authored JSON clock document. | 39 |
| `INVALID_CLOCK` | The accepted clock document is invalid JSON. | 40 |
| `INVALID_CLOCK` | The accepted clock exceeds portable bounds. | 41 |
| `INVALID_CLOCK` | The accepted clock requires matching identity, schema 1 and positive revision. | 42 |
| `INVALID_CLOCK_LEDGER` | The accepted time advance ledger is invalid or exceeds 32 retained turns. | 44 |
| `INVALID_CLOCK_LEDGER` | A retained preturn clock must share the accepted clock identity. | 46 |
| `CLOCK_CAPTURE_REQUIRED` | Clock authority requires this exact captured accepted source. | 51 |
| `INVALID_TIME_PROJECTION` | The time projection is incomplete. | 56 |
| `TIME_PROJECTION_LIMIT` | Retain at most 32 chained time advances in one accepted turn. | 58 |
| `TIME_REMAINDER_UNRESOLVED` | Connect the exact retained remainder before chaining another advance after an interruption. | 59 |
| `TIME_PROJECTION_LIMIT` | The time projection exceeds portable ancestry bounds. | 61 |
| `TIME_PROJECTION_LIMIT` | The complete time ancestry or occurrence ledger exceeds its bound. | 63 |
| `TIME_PROJECTION_UNAUTHORIZED` | Clock Commit requires the retained Advance Time report. | 75 |
| `TIME_PROJECTION_UNAUTHORIZED` | Connected occurrences must derive from this retained time ancestry. | 77 |
| `PRIVATE_DESTINATION` | Clock Commit must preserve the time projection disclosure scope. | 78 |
| `CLOCK_REPLAY_CONFLICT` | This player turn already accepted a different time projection; explicitly reconcile it. | 81 |
| `CLOCK_LEDGER_FULL` | The retained turn ledger is full; explicitly archive it before advancing. | 83 |
| `CLOCK_LEDGER_FULL` | The accepted clock or occurrence ledger reached its bound. | 86 |
| `CLOCK_LEDGER_FULL` | The accepted clock projection exceeds portable bounds. | 89 |
| `STATE_EVIDENCE_CHANGED` | The native player source must preserve the original exact quote. | 99 |
| `INVALID_OUTCOME_LEDGER` | Outcome ledgers require JSON arrays. | 101 |
| `INVALID_OUTCOME_LEDGER` | The outcome ledger is invalid JSON. | 101 |
| `INVALID_OUTCOME_LEDGER` | The accepted outcome ledger must be a bounded JSON array. | 101 |
| `INVALID_OUTCOME_LEDGER` | The accepted outcome ledger contains invalid or unaccepted outcomes. | 101 |
| `UNTRUSTED_SAVED_OUTCOME` | Saved outcomes require the retained cache or an authorized ledger. | 102 |
| `UNTRUSTED_SAVED_OUTCOME` | Imported outcomes cannot authorize a native draw. Select its authorized ledger. | 104 |
| `OUTCOME_CACHE_FULL` | The pending draw cache is full; settle or explicitly cancel the pending outcomes. | 107 |
| `STATE_EVIDENCE_CHANGED` | The event source changed while selecting outcomes. | 110 |
| `STATE_EVIDENCE_CHANGED` | The retained draw source changed. | 115 |
| `OUTCOME_PROJECTION_UNAUTHORIZED` | The authored outcome must retain this captured draw and occurrence. | 118 |
| `OUTCOME_LIMIT` | Outcome Commit requires bounded own outcome data. | 122 |
| `OUTCOME_LIMIT` | Commit a bounded nonempty set of resolved outcomes. | 122 |
| `OUTCOME_PROJECTION_UNAUTHORIZED` | Outcome Commit requires the retained resolved draw and unchanged event. | 123 |
| `PRIVATE_DESTINATION` | Outcome Commit must preserve the occurrence disclosure scope. | 124 |
| `INVALID_OUTCOME_LEDGER` | Outcome Commit requires an authorized JSON array document. | 126 |
| `INVALID_FILE_EVIDENCE` | File evidence requires a bounded array. | 131 |
| `INVALID_FILE_EVIDENCE` | File evidence entries must be own records. | 131 |
| `TIME_PROJECTION_UNAUTHORIZED` | A scheduled consequence requires its exact retained occurrence and staged accepted clock. | 131 |
| `STATE_EVIDENCE_CHANGED` | The captured player event changed before acceptance. | 131 |

### src/workflow/operations/collection-nodes.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | Use supported Collection controls. | 28 |
| `INVALID_SETTINGS` | Use bounded Collection modes, paths and policies. | 33 |
| `INVALID_SETTINGS` | Thresholds must be an authored JSON number array. | 35 |
| `UNRESOLVED_COLLECTION` | The collection path is missing. | 45 |
| `INVALID_COLLECTION` | The selected value must be an array of at most 1024 entries. | 48 |
| `INVALID_COMPARISON` | Contains requires a string or array. | 56 |
| `INVALID_COMPARISON` | Numeric comparisons require finite numbers. | 58 |
| `INVALID_INPUT` | Collection extras contain only Other and Match values. | 66 |
| `INVALID_INPUT` | Threshold mode requires explicit before and after numbers. | 69 |
| `UNRESOLVED_COLLECTION` | A projection field is missing. | 78 |
| `INVALID_COLLECTION` | Flatten requires explicit array entries. | 85 |
| `COLLECTION_LIMIT` | Flattened collections contain at most 1024 entries. | 86 |
| `UNRESOLVED_COLLECTION` | A sum field is missing. | 94 |
| `INVALID_SUM` | Sum fields require bounded finite numbers. | 95 |
| `VALUE_OVERFLOW` | The numeric sum exceeds safe bounds. | 96 |
| `MISSING_INPUT` | Merge requires an explicit Other collection. | 100 |
| `COLLECTION_LIMIT` | Merged collections contain at most 1024 entries. | 103 |
| `INVALID_IDENTITY` | Unique merging requires an explicit nonempty scalar identity. | 109 |
| `IDENTITY_CONFLICT` | The same identity has different record content. | 111 |
| `UNRESOLVED_COLLECTION` | A filter or lookup field is missing. | 123 |
| `AMBIGUOUS_LOOKUP` | Multiple records match this lookup. | 130 |
| `UNRESOLVED_COLLECTION` | No record matches this lookup. | 131 |
| `COLLECTION_LIMIT` | The collection result exceeds portable JSON limits. | 136 |
| `INVALID_SETTINGS` | Use plain node metadata. | 141 |
| `INVALID_SETTINGS` | Routing metadata requires own data properties. | 144 |
| `UNKNOWN_OPERATION` | Unknown Collection operation. | 146 |
| `INVALID_PHASE` | Collection phase must match its effective phase. | 148 |
| `INVALID_SETTINGS` | Controls require own data properties. | 152 |
| `UNSUPPORTED_INPUT` | Use declared Collection inputs. | 166 |
| `MISSING_INPUT` | Required input is missing:  | 168 |
| `INVALID_INPUT` | Collection inputs require bounded Data artifacts. | 169 |
| `INVALID_INPUT` | Collection reducers require bounded own plain data. | 174 |

### src/workflow/operations/compose.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_COMPOSE` | Settings must be an object | 7 |
| `INVALID_COMPOSE` | Unsupported setting | 8 |
| `INVALID_COMPOSE` | Settings must use data properties | 10 |
| `INVALID_COMPOSE` | Invalid template, separator or sections | 15 |
| `INVALID_COMPOSE` | At most 64 sections are supported | 16 |
| `TEXT_LIMIT` | Text exceeds 100,000 UTF-16 units | 17 |
| `INVALID_COMPOSE` | Sections must be a dense data array | 22 |
| `INVALID_COMPOSE` | Section must be an object | 24 |
| `INVALID_COMPOSE` | Section must use name and text data properties | 26 |
| `INVALID_COMPOSE` | Sections require an identifier name and text | 28 |
| `TEXT_LIMIT` | Section text exceeds 100,000 UTF-16 units | 29 |
| `INVALID_COMPOSE` | Duplicate section:  | 30 |
| `INVALID_COMPOSE` | Settings or sections could not be inspected | 36 |
| `INVALID_TEMPLATE` | Unclosed placeholder | 64 |
| `MISSING_SECTION` | Missing section:  | 69 |
| `MISSING_PATH` | Data was not provided | 72 |
| `INVALID_TEMPLATE` | Invalid JSON pointer | 74 |
| `MISSING_PATH` | Missing data path:  | 78 |
| `INVALID_TEMPLATE` | Unsupported placeholder | 85 |
| `TEXT_LIMIT` | Output exceeds 100,000 UTF-16 units | 86 |

### src/workflow/operations/context-data.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_CONTEXT` | Runtime data could not be inspected as plain JSON. | 43 |
| `INVALID_CONTEXT` | Expected Context with unique nonempty IDs, valid roles and exact string text. | 54 |
| `CONTEXT_JOIN_LIMIT` | Context exceeds 1,000 messages or 100,000 UTF-16 text units in current or original material. | 74 |

### src/workflow/operations/context-join.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | Context Join settings could not be consumed as plain data. | 38 |
| `INVALID_SETTINGS` | Context Join requires pre phase and 2–16 unique bounded Context slots. | 42 |
| `INVALID_CONTEXT` | Context Join inputs could not be consumed as plain data. | 62 |
| `INVALID_SETTINGS` | Context Join requires 2–16 unique bounded Context slots. | 66 |
| `INVALID_CONTEXT` | Expected a plain named-input map. | 67 |
| `INVALID_CONTEXT` | Named inputs must be own enumerable Context pin values. | 75 |
| `INVALID_CONTEXT` | Named inputs could not be inspected as plain data. | 77 |
| `MISSING_INPUT` | A required Context input is missing. | 80 |
| `CONTEXT_ID_CONFLICT` | A Context message ID has conflicting payload or source scope. | 93 |

### src/workflow/operations/control-nodes.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | Control settings must be plain data. | 28 |
| `UNKNOWN_OPERATION` | Unknown control operation. | 30 |
| `INVALID_SETTINGS` | Control operation version must be 1. | 31 |
| `INVALID_PHASE` | Control phase must match its effective phase. | 33 |
| `INVALID_SETTINGS` | Controls require own data properties. | 37 |
| `INVALID_SETTINGS` | Controls require bounded JSON data. | 39 |
| `INVALID_SETTINGS` | For Each requires a pinned helper, 1–128 iterations and 0–16 requests per iteration. | 45 |
| `INVALID_SETTINGS` | For Each role overrides require up to 64 named roles with only bounded profile/model selectors. | 46 |
| `INVALID_SETTINGS` | Declare an explicit metric path, direction and nonoverlapping acceptance thresholds. | 50 |
| `INVALID_SETTINGS` | Condition requires a bounded path and supported comparison. | 53 |
| `INVALID_SETTINGS` | Join requires 1–16 unique typed input slots with explicit required flags. | 60 |
| `INVALID_SETTINGS` | Select a declared artifact kind. | 64 |
| `INVALID_SETTINGS` | Control settings could not be inspected. | 72 |
| `INVALID_INPUT` | Expected named control inputs. | 78 |
| `INVALID_INPUT` | Confidence Gate requires a typed Data decision. | 81 |
| `INVALID_INPUT` | Join contributions must match their typed slots. | 95 |
| `INVALID_INPUT` | Condition requires Data. | 103 |
| `INVALID_COMPARISON` | Ordered comparisons require finite numbers. | 112 |
| `INVALID_INPUT` | Branch requires its declared artifact and a Data decision. | 117 |
| `INVALID_INPUT` | Control inputs require bounded own data. | 121 |
| `INVALID_INPUT` | For Each requires a Data collection. | 126 |
| `INVALID_INPUT` | For Each requires an array collection. | 128 |
| `ITERATION_LIMIT` | The collection exceeds the authored iteration bound. | 129 |
| `INVALID_INPUT` | Projected state requires Data. | 131 |
| `MISSING_INPUT` | Projected-state iteration requires its explicit initial state. | 132 |
| `ABORTED` | Iteration was stopped. | 133 |
| `ITERATION_HELPER_MISSING` | Bind the pinned iteration helper before execution. | 134 |
| `ITERATION_CLOSED` | This iteration request capability has closed. | 140 |
| `ITERATION_REQUEST_IN_PROGRESS` | A helper request must settle before another starts. | 141 |
| `ITERATION_CALL_LIMIT` | The iteration request bound was reached. | 146 |
| `REQUEST_MISSING` | Iteration requires the bounded root request adapter. | 148 |
| `REQUEST_FAILED` | The iteration request failed. | 149 |
| `INVALID_RESPONSE` | Iteration request returned no result. | 149 |
| `ABORTED` | Ignore the stopped iteration result. | 155 |
| `INVALID_ITERATION_RESULT` | The iteration helper returned an invalid Result. | 157 |
| `INVALID_ITERATION_RESULT` | Iteration helpers must return Data results with valid disclosure metadata. | 159 |
| `INVALID_ITERATION_RESULT` | Projected state must carry valid disclosure metadata. | 162 |
| `INVALID_PROJECTION` | Each stateful iteration must return checked next projected state. | 162 |
| `GATE_NOT_SELECTED` | Another confidence route was selected. | 88 |
| `JOIN_INPUT_MISSING` | A required contribution has not completed. | 93 |
| `EMPTY_JOIN` | No contribution was selected. | 98 |
| `CONDITION_MISSING` | The comparison path has no value. | 106 |
| `BRANCH_NOT_SELECTED` | Another branch was selected. | 120 |
| `NO_PROJECTED_STATE` | Map mode supplied no state. | 165 |

### src/workflow/operations/decision-nodes.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | Decision node and options require plain own data. | 19 |
| `UNKNOWN_OPERATION` | Unknown Decision operation. | 20 |
| `INVALID_SETTINGS` | Decision operation version must be 1. | 21 |
| `INVALID_PHASE` | Provide a matching effective Decision phase. | 23 |
| `INVALID_SETTINGS` | Decision controls require bounded JSON. | 24 |
| `INVALID_SETTINGS` | Select a supported input and bounded text completion limit. | 26 |
| `INVALID_SETTINGS` | Decision controls require supported own data. | 30 |
| `INVALID_INPUT` | Decision requires a named State artifact. | 39 |
| `INVALID_INPUT` | The State artifact must match the selected input kind. | 40 |
| `INVALID_INPUT` | State must be bounded own JSON or text. | 41 |
| `INVALID_PORTS` | The request counter must be a nonnegative safe integer. | 44 |
| `INVALID_PORTS` | The request counter exceeds this node budget. | 47 |
| `DECISION_OUTPUT_LIMIT` | The decision record exceeds portable JSON limits. | 48 |
| `INVALID_INPUT` | Decision state requires bounded own data. | 50 |

### src/workflow/operations/document-mutations.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_RECORDS` | Records must be an array of structured objects. | 23 |
| `DOCUMENT_LIMIT` | Projected content exceeds 262,144 UTF-8 bytes. | 29 |
| `DOCUMENT_LIMIT` | Projected content exceeds supported snapshot limits. | 31 |
| `DOCUMENT_LIMIT` | Projected content exceeds supported document reader limits. | 33 |
| `INVALID_CSV` | CSV replacement requires a header. | 59 |
| `INVALID_CSV` | CSV requires LF or CRLF row separators. | 75 |
| `INVALID_CSV` | Unexpected text after a quoted CSV cell. | 78 |
| `INVALID_CSV` | CSV quotes must begin a cell. | 80 |
| `INVALID_CSV` | CSV has an unterminated quoted cell. | 84 |
| `CSV_HEADER_MISMATCH` | CSV header must exactly match the declared columns. | 86 |
| `INVALID_CSV` | Every CSV row must match the header width. | 87 |
| `INVALID_DOCUMENT_SNAPSHOT` | A bounded target, revision, format and content snapshot is required. | 95 |
| `INVALID_MUTATION_SETTINGS` | An explicit supported mutation policy is required. | 97 |
| `UNSUPPORTED_MUTATION` | Append Text requires a text or Markdown snapshot. | 99 |
| `INVALID_MUTATION_SETTINGS` | Append Text requires explicit text and separator policies. | 100 |
| `INVALID_MUTATION_SETTINGS` | Replacement requires complete content text. | 106 |
| `UNSUPPORTED_MUTATION` | CSV supports Add and Replace. | 113 |
| `INVALID_COLLECTION_PATH` | CSV requires the root collection. | 114 |
| `INVALID_RECORDS` | Mutation records must be an array. | 117 |
| `UNSUPPORTED_MUTATION` | JSON Lines supports literal Add and Replace. | 128 |
| `INVALID_COLLECTION_PATH` | JSON Lines requires the root collection. | 129 |
| `UNSUPPORTED_MUTATION` | Record mutations require a supported collection format. | 141 |
| `INVALID_RECORDS` | Mutation records must be an array of structured records. | 144 |
| `INVALID_COLLECTION_PATH` | Collection path must be a JSON Pointer. | 151 |
| `INVALID_COLLECTION_PATH` | Collection path exceeds the depth limit. | 153 |
| `MISSING_COLLECTION` | The selected collection does not exist. | 157 |
| `INVALID_COLLECTION` | The selected collection must be an array. | 164 |
| `INVALID_MUTATION_SETTINGS` | An explicit stable identity key is required. | 166 |
| `INVALID_RECORD_KEY` | Every record must have a nonblank string or finite number identity. | 168 |
| `IDENTITY_CONFLICT` | The same input identity has conflicting content. | 172 |
| `AMBIGUOUS_IDENTITY` | The existing collection contains duplicate identities. | 177 |
| `INVALID_MUTATION_SETTINGS` | Upsert requires merge or replace fieldPolicy. | 181 |
| `INVALID_MUTATION_SETTINGS` | Update Fields requires explicit unique field names excluding the identity key. | 182 |
| `RECORD_NOT_FOUND` | Update Fields requires an existing identity. | 194 |
| `MISSING_UPDATE_FIELD` | Every selected field must be supplied. | 195 |
| `IDENTITY_CONFLICT` | The same identity has conflicting content. | 188 |

### src/workflow/operations/event-data.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_EVENTS` | Use a declared occurrence status. | 45 |
| `INVALID_EVENTS` | Use distinct bounded occurrence records with canonical source evidence. | 50 |
| `INVALID_EVENTS` | Candidates require a bounded source and canonical actor/item identities. | 60 |
| `INVALID_CANDIDATE` | Candidates must retain known entities and exact source spans. | 69 |
| `INVALID_CONFIRMATIONS` | A checked decision is required for each unchanged candidate identity. | 90 |
| `UNRESOLVED_EVENTS` | At least one occurrence is uncertain; no partial confirmed collection is emitted. | 91 |
| `INCONSISTENT_CONFIRMATION` | A planned, recalled, threatened or uncertain occurrence cannot be confirmed as an actual event. | 96 |
| `INVALID_HOLDERS` | Holder state must map canonical item IDs to actor IDs or explicit unknown null. | 106 |
| `EVENT_ORDER` | Fold one explicitly ordered source revision at a time. | 109 |
| `EVENT_ORDER` | Events must be chronological. | 110 |
| `EVENT_ORDER` | Overlapping use/transfer evidence cannot establish a holder sequence. | 114 |
| `UNRESOLVED_HOLDER` | The active item holder is unknown. | 121 |
| `HOLDER_CONFLICT` | The attributed actor does not hold this item at the event position. | 122 |
| `INVALID_TRIGGER` | Use an explicit watched source, canonical entities and bounded literal activation policy. | 140 |
| `WATCH_MISMATCH` | The source does not match the trigger Watch setting. | 141 |
| `TRIGGER_LIMIT` | The watched source contains too many matches. | 152 |
| `TRIGGER_LIMIT` | The watched source contains more than 256 distinct mentions. | 158 |
| `TRIGGER_STATE_LIMIT` | Trigger state must retain at most 1024 IDs of at most 2048 characters; shorten identifiers or reset/prune state. | 170 |
| `INVALID_EVENTS` | Progression adaptation uses only an authored event type and explicit story minute. | 180 |
| `INVALID_EVENTS` | Draft evidence requires an explicit captured source scope. | 197 |
| `INVALID_EVENTS` | Draft evidence requires canonical source, scene and visibility identifiers. | 200 |

### src/workflow/operations/event-nodes.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | Use plain node metadata. | 27 |
| `INVALID_SETTINGS` | Routing metadata requires own data properties. | 30 |
| `INVALID_SETTINGS` | Use plain Event node settings. | 32 |
| `UNKNOWN_OPERATION` | Unknown Event operation. | 34 |
| `INVALID_PHASE` | Event phase must match its effective phase. | 36 |
| `INVALID_SETTINGS` | Controls require own data properties. | 40 |
| `INVALID_SETTINGS` | Use supported bounded Event controls. | 46 |
| `INVALID_SETTINGS` | Select a canonical actor identity. | 48 |
| `INVALID_SETTINGS` | Select a canonical item identity. | 59 |
| `INVALID_SETTINGS` | Provide 1–32 bounded literal aliases. | 60 |
| `INVALID_INPUT` | Event inputs require named Data artifacts. | 71 |
| `UNSUPPORTED_INPUT` | Unsupported Event input. | 73 |
| `MISSING_INPUT` | Required input is missing:  | 75 |
| `INVALID_INPUT` | Draft Event Source requires a checked Draft. | 78 |
| `INVALID_INPUT` | Event input requires bounded Data. | 82 |
| `INVALID_CAST` | Scene Cast requires explicit canonical participation states. | 90 |
| `INVALID_PRESENCE` | Direction requires the selected actors checked scene presence. | 104 |
| `ABORTED` | The actor request was stopped. | 106 |
| `ACTOR_CONTEXT_MISSING` | The trusted host must supply this actors authorized context. | 107 |
| `ACTOR_CONTEXT_FAILED` | The authorized actor context could not be captured. | 108 |
| `ABORTED` | Ignore the stopped actor context. | 109 |
| `INVALID_ACTOR_CONTEXT` | Actor context must be bounded plain data. | 110 |
| `INVALID_ACTOR_CONTEXT` | The actor context service must return a successful Result. | 112 |
| `ACTOR_SCOPE_MISMATCH` | The captured private material must belong to this actor and scene. | 117 |
| `ABORTED` | The request was stopped. | 121 |
| `REQUEST_MISSING` | Select a connected model for this Event operation. | 122 |
| `INPUT_LIMIT` | The scoped Event prompt exceeds 65,536 UTF-8 bytes. | 123 |
| `ABORTED` | Ignore the stopped Event response. | 125 |
| `STALE_INPUT` | Event evidence changed while the request was pending. | 126 |
| `INVALID_RESPONSE` | The Event model returned invalid plain data. | 127 |
| `INVALID_RESPONSE` | The Event model requires a nonempty bounded completed response. | 130 |
| `ROOT_ONLY` | Actor Context requires this run’s private root actor capability. | 138 |
| `CLOCK_MISMATCH` | The explicit event time conflicts with the wired story clock. | 147 |
| `WATCH_MISMATCH` | The source does not match the configured Watch. | 166 |
| `INVALID_EXTRACTION` | Candidate extraction must return plain JSON. | 172 |
| `INVALID_EXTRACTION` | Candidate extraction requires exactly a candidates collection. | 173 |
| `INVALID_EXTRACTION` | Candidates must target this item and retain uses or transfers. | 177 |
| `INVALID_CONFIRMATIONS` | Single Gate requires exactly one frozen candidate and a successful checked gate. | 184 |
| `INVALID_CONFIRMATIONS` | A gate cannot replace occurrence actor, item or event identities. | 186 |
| `ACTOR_MODEL_SCOPE` | Character Direction Data must be public or belong only to the selected actor. | 198 |
| `MEMORY_HOLDER_MISMATCH` | Prompted Memory requires the participating actor holding this item at this confirmed event. | 205 |
| `ACTOR_SCOPE_MISMATCH` | This actor cannot receive another actors private trigger evidence. | 206 |
| `MEMORY_CREATION_NOT_ALLOWED` | The workflow author must explicitly permit invented character history. | 207 |
| `STALE_INPUT` | Event evidence changed while the actor context was captured. | 210 |
| `INVALID_MEMORY_RESPONSE` | Prompted Memory must return checked JSON. | 224 |
| `INVALID_MEMORY_RESPONSE` | Prompted Memory requires a bounded recalled or invented proposal. | 228 |
| `INVALID_MEMORY_RESPONSE` | Recall must select an authorized existing memory without replacing its text. | 232 |
| `MEMORY_CREATION_NOT_ALLOWED` | This workflow does not permit invented history. | 235 |
| `INVALID_MEMORY_RESPONSE` | Invented memory text must be bounded; identity comes from the confirmed occurrence. | 236 |
| `INVALID_INPUT` | Event nodes require bounded own data inputs and settings. | 246 |
| `UNRESOLVED_EVENTS` | A probability or missing answer is not explicit gate acceptance. | 185 |
| `MEMORY_UNAVAILABLE` | No authorized existing memory is available for this recall. | 221 |

### src/workflow/operations/file-nodes.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | File operations require a workflow node. | 41 |
| `INVALID_SETTINGS` | File operation version must be 1. | 42 |
| `UNKNOWN_OPERATION` | Unknown file operation. | 44 |
| `INVALID_PHASE` | File operation requires its configured workflow phase. | 46 |
| `INVALID_SETTINGS` | File controls require bounded own JSON data. | 48 |
| `INVALID_SETTINGS` | File controls require their declared type and bound. | 53 |
| `UNSUPPORTED_SCHEMA` | Schema must be raw JSON in the supported subset. | 57 |
| `INVALID_SETTINGS` | Single-object shape applies only to JSON serialization. | 61 |
| `INVALID_SETTINGS` | Presence scope requires a configured actor; selected scope uses the native selection. | 62 |
| `INVALID_SETTINGS` | Select an authorized target identity. | 63 |
| `INVALID_SETTINGS` | Keyed updates require an identity field and selected unique fields. | 64 |
| `INVALID_SETTINGS` | File settings must be own plain data properties. | 72 |
| `INVALID_INPUT` | Unexpected input  | 80 |
| `INVALID_INPUT` | Input  | 82 |
| `FILE_REFERENCE_UNAUTHORIZED` | Use the exact live reference emitted by authorized Read File. | 85 |
| `INVALID_INPUT` | Input artifacts require their declared payload. | 91 |
| `MISSING_INPUT` | Connect every required file input. | 95 |
| `INVALID_INPUT` | File inputs require own plain artifact data. | 97 |
| `OUTPUT_LIMIT` | File output exceeds the downstream bounded artifact contract. | 103 |
| `INVALID_FILE_RESPONSE` | File capability failure requires a bounded own error envelope. | 156 |
| `FILE_CAPABILITY_FAILED` | The trusted file capability failed; no successful result was accepted. | 159 |
| `INVALID_FILE_RESPONSE` | File capability requires an own Result envelope. | 161 |
| `INVALID_FILE_RESPONSE` | File capability result requires own data properties. | 163 |
| `UNSUPPORTED_SCHEMA` | Plain document text has no implicit structured fields. | 168 |
| `INVALID_PORTS` | File execution requires own trusted capabilities. | 175 |
| `INVALID_PORTS` | Cancellation requires a genuine AbortSignal. | 176 |
| `ABORTED` | File operation cancelled. | 178 |
| `ROOT_ONLY` | Storage capabilities are reserved for a root workflow. | 181 |
| `ACTOR_FILE_SCOPE_MISMATCH` | Use the configured actor’s exact confirmed source presence. | 188 |
| `ABORTED` | Actor file operation cancelled. | 192 |
| `FILE_SCOPE_UNAVAILABLE` | Present-actor files require trusted live actor authority. | 193 |
| `ACTOR_FILE_SCOPE_MISMATCH` | Actor file inputs changed or the reference belongs to another actor. | 195 |
| `FILE_SCOPE_UNAVAILABLE` | The present actor’s file authority could not be checked. | 196 |
| `ABORTED` | Actor file operation cancelled during scope validation. | 197 |
| `ACTOR_FILE_SCOPE_MISMATCH` | The exact actor presence changed during scope validation. | 198 |
| `ACTOR_FILE_SCOPE_MISMATCH` | File authority must match the captured configured actor. | 200 |
| `INVALID_PORTS` | Read File requires the trusted files.read capability. | 221 |
| `ABORTED` | Ignore the cancelled file read. | 223 |
| `INVALID_FILE_RESPONSE` | Read File requires bounded document and live reference data. | 229 |
| `INVALID_FILE_RESPONSE` | The reference must match the exact target and observed revision. | 231 |
| `INVALID_FILE_RESPONSE` | Read File requires an own document/reference result. | 232 |
| `FILE_SCOPE_UNAVAILABLE` | The file visibility policy could not be checked. | 238 |
| `ABORTED` | File read cancelled during scope validation. | 239 |
| `PRIVATE_DESTINATION` | A file policy cannot declassify captured actor or record privacy. | 242 |
| `ACTOR_FILE_SCOPE_MISMATCH` | The private document belongs to a different actor. | 246 |
| `INVALID_PORTS` | Write to File requires trusted preparation, stable identity, scope authorization and staging capabilities. | 252 |
| `ACTOR_FILE_SCOPE_MISMATCH` | Write requires the same present actor that captured the live file reference. | 254 |
| `EVIDENCE_LIMIT` | At most 128 canonical evidence records can accompany one write. | 256 |
| `ABORTED` | File staging cancelled during scope validation. | 263 |
| `PRIVATE_DESTINATION` | Restricted records require a permitted destination preserving actor scope. | 267 |
| `ABORTED` | File staging cancelled during identity capture. | 269 |
| `INVALID_FILE_INTENT` | The host must derive a bounded stable canonical intent identity. | 272 |
| `ABORTED` | File staging cancelled during preparation. | 274 |
| `INVALID_FILE_RESPONSE` | Prepared intent must preserve the exact checked document projection. | 278 |
| `ABORTED` | File staging cancelled; retained intents must be rejected by host cancellation. | 282 |

### src/workflow/operations/format-records.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_FORMAT_SETTINGS` | Format settings must contain supported plain data. | 6 |
| `INVALID_RECORDS` | Records must be structured objects. | 22 |
| `CSV_RECORD_MISMATCH` | CSV records must match the columns and contain scalar cells. | 35 |
| `FORMAT_LIMIT` | Serialized output exceeds 262,144 UTF-8 bytes. | 45 |
| `FORMAT_LIMIT` | Serialized output exceeds bounded plain text data limits. | 46 |
| `FORMAT_LIMIT` | Serialized JSON exceeds the supported raw JSON reader limits. | 48 |
| `FORMAT_CARDINALITY` | Single-object JSON requires exactly one validated record. | 53 |
| `TEXT_RECORD_MISMATCH` | Text records must contain only a text string. | 66 |

### src/workflow/operations/input-nodes.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | Input node and options must be plain objects. | 36 |
| `UNKNOWN_OPERATION` | Unknown Input operation or version. | 40 |
| `INVALID_PHASE` | An effective matching pre or post phase is required. | 44 |
| `INVALID_SETTINGS` | Use supported Input controls and bounded values. | 48 |
| `INVALID_SETTINGS` | Prompt Source requires a nonblank stable prompt identifier. | 50 |
| `INVALID_SETTINGS` | Use plain Input settings with own data properties. | 56 |
| `HOST_SOURCE_REQUIRED` | Prompt Source requires an active host template snapshot. | 70 |
| `FILE_UNAVAILABLE` | Load a file snapshot before executing File Input. | 71 |

### src/workflow/operations/json-data.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_JSON_VALUE` | Input must contain only plain JSON data. | 49 |
| `INVALID_JSON_PATH` | Path must be an array of string keys or nonnegative integer indices. | 63 |

### src/workflow/operations/json-decode.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_JSON_OPTIONS` | Decode settings must contain only mode and schema data properties. | 83 |
| `INVALID_JSON_OPTIONS` | Mode must be parse or check. | 94 |
| `UNSUPPORTED_SCHEMA` | Schema must use only the supported bounded subset. | 96 |
| `INVALID_JSON` | Parse mode requires bounded raw JSON text. | 99 |
| `INVALID_JSON` | Input is not valid raw JSON text. | 101 |
| `SCHEMA_MISMATCH` | JSON does not match the schema. | 107 |

### src/workflow/operations/lifecycle-nodes.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | Lifecycle nodes require own plain controls. | 14 |
| `INVALID_SETTINGS` | Lifecycle controls require own data properties. | 16 |
| `UNKNOWN_OPERATION` | Unknown lifecycle operation. | 19 |
| `INVALID_PHASE` | Lifecycle operation conflicts with its generation stage. | 22 |
| `INVALID_SETTINGS` | Lifecycle operation version must be 1. | 23 |
| `INVALID_SETTINGS` | Use a guidance budget from 1 to 8,192 tokens. | 24 |
| `INVALID_PORTS` | Use a trusted AbortSignal. | 33 |
| `ABORTED` | Workflow was stopped. | 34 |
| `HOST_OPERATION_REQUIRED` | Native generation requires its owned host continuation. | 35 |
| `HOST_OPERATION_REQUIRED` | Review / Publish requires the unified root. | 36 |
| `INVALID_INPUT` | Review requires only the declared Draft input. | 37 |

### src/workflow/operations/model-nodes.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `OUTPUT_LIMIT` | Artifact exceeds the downstream bounded JSON contract. | 13 |
| `INVALID_SETTINGS` | Model operation version must be 1. | 53 |
| `UNKNOWN_OPERATION` | Unknown model/presentation operation. | 55 |
| `INVALID_SETTINGS` | Controls require bounded own JSON data. | 58 |
| `INVALID_SETTINGS` | Use bounded instructions, supported scope, protected literals and completion limit. | 60 |
| `INVALID_SETTINGS` | Use bounded instructions, completion limit and optional Data schema. | 61 |
| `INVALID_SETTINGS` | Extraction requires a supported source/mode and bounded unique literal patterns. | 62 |
| `INVALID_SETTINGS` | Use bounded enrichment instructions and completion limit. | 63 |
| `INVALID_SETTINGS` | Notes require a bounded title and supported presentation format. | 64 |
| `INVALID_SETTINGS` | Append requires a stable section identity and bounded separator. | 65 |
| `INVALID_SETTINGS` | Choose narrative body or assembled text. | 66 |
| `SCHEMA_LIMIT` | Schema exceeds its bounded size. | 69 |
| `INVALID_SCHEMA` | Schema requires raw JSON text. | 70 |
| `INVALID_PHASE` | Operation conflicts with its effective phase. | 75 |
| `INVALID_SETTINGS` | Node and controls require own plain data. | 78 |
| `UNSUPPORTED_INPUT` | Unsupported input:  | 90 |
| `INVALID_INPUT` | Input  | 92 |
| `MISSING_INPUT` | Missing input:  | 97 |
| `INVALID_INPUT` | Inputs require own plain artifact data. | 99 |
| `INVALID_RESPONSE` | Request failure requires a checked error envelope. | 106 |
| `INVALID_RESPONSE` | Request failure requires bounded public diagnostic fields. | 108 |
| `ABORTED` | Model operation cancelled. | 124 |
| `INVALID_PORTS` | A verified text request capability is required. | 125 |
| `PROMPT_LIMIT` | Model prompt exceeds its bounded size. | 126 |
| `ABORTED` | Ignore the cancelled late completion. | 130 |
| `INVALID_RESPONSE` | Request requires an own Result envelope. | 134 |
| `INVALID_RESPONSE` | Completion requires bounded nonblank text. | 136 |
| `TRUNCATED_OUTPUT` | Completion reached its output limit. | 138 |
| `COMPLETION_UNVERIFIED` | Completion requires verified successful finish evidence. | 139 |
| `INVALID_RESPONSE` | Usage requires bounded own JSON data. | 141 |
| `INVALID_RESPONSE` | Response requires own data properties. | 144 |
| `INVALID_RECORDS` | Use bounded identified extraction/enrichment records with source references. | 148 |
| `INVALID_PORTS` | Execution requires own capabilities. | 157 |
| `INVALID_PORTS` | Cancellation requires a trusted AbortSignal. | 158 |
| `ABORTED` | Model/presentation operation cancelled. | 159 |
| `PRIVATE_MATERIAL` | Public reply assembly cannot include private material. | 168 |
| `INVALID_INPUT` | Append requires bounded Text. | 169 |
| `PRIVATE_MATERIAL` | Public notes cannot disclose restricted records. | 174 |
| `VISIBILITY_REQUIRED` | Public notes require an explicit public disclosure label. | 175 |
| `OUTPUT_LIMIT` | Rendered notes exceed the bounded text limit. | 182 |
| `INVALID_ENRICHMENT` | Enrichment must provide one bounded detail for each existing record identity. | 197 |
| `ENRICHMENT_LIMIT` | Record additions are bounded; history is never truncated. | 198 |
| `INVALID_INPUT` | Extraction requires bounded source text. | 205 |
| `EXTRACTION_LIMIT` | At most 256 extracted records are permitted; nothing is truncated. | 208 |
| `INVALID_EXTRACTION` | Extraction requires bounded uniquely identified records of the specified shape. | 226 |
| `INVALID_EVIDENCE` | Each extraction requires exact bounded quoted source evidence. | 227 |
| `INVALID_INPUT` | Request requires bounded Text. | 231 |
| `PRIVATE_MATERIAL` | Private evidence requires a private destination; generic public revision cannot disclose it. | 243 |

### src/workflow/operations/nodes.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | Use supported primitive controls and bounded values. | 60 |
| `SCHEMA_LIMIT` | Schema JSON exceeds 262,144 UTF-8 bytes. | 83 |
| `INVALID_SCHEMA` | Schema must be raw JSON text. | 85 |
| `INVALID_SETTINGS` | Node and options must be plain objects. | 99 |
| `UNKNOWN_OPERATION` | Unknown primitive operation. | 101 |
| `INVALID_PHASE` | An effective pre or post phase is required. | 110 |
| `INVALID_PHASE` | The supplied phase conflicts with this node. | 111 |
| `INVALID_SETTINGS` | Draft rules only support replace mode. | 112 |
| `INVALID_SETTINGS` | Use plain settings with own data properties. | 122 |
| `UNSUPPORTED_INPUT` | Unsupported or stale input:  | 137 |
| `INVALID_INPUT` | Input  | 139 |
| `INVALID_INPUT` | Text input must contain at most 100,000 UTF-16 units. | 140 |
| `INVALID_INPUT` | Data input requires an own value. | 142 |
| `MISSING_INPUT` | Required input is missing:  | 149 |
| `INVALID_EXECUTION` | Use phase, AbortSignal, createWorker and an integer 100..2,000 ms timeout. | 158 |
| `UNKNOWN_OPERATION` | Primitive is not implemented. | 188 |
| `INVALID_INPUTS` | Use named inputs with own data properties. | 198 |

### src/workflow/operations/progression-nodes.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | Select a supported generic State mode. | 14 |
| `PROGRESSION_OUTPUT_LIMIT` | The proposed State outputs exceed portable data bounds. | 50 |
| `ABORTED` | State projection was stopped. | 57 |
| `INVALID_INPUT` | State modes require bounded named Data artifacts. | 58 |
| `INVALID_INPUT` | Use only declared State inputs. | 60 |
| `MISSING_INPUT` | Missing  | 62 |
| `INVALID_INPUT` | State projection inputs must be plain Data artifacts. | 64 |
| `INVALID_TIME_DECAY` | Use only declared authored time-decay rule fields. | 72 |
| `INVALID_STATE_INPUT` | State projection inputs could not be inspected. | 78 |

### src/workflow/operations/prose-cleanup.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_DATA` | Input requires bounded own plain data. | 53 |
| `INVALID_SETTINGS` | Cleanup settings require bounded own plain data. | 58 |
| `INVALID_SETTINGS` | Supply only supported cleanup controls. | 61 |
| `INVALID_SETTINGS` | Use supported cleanup controls, category IDs, protected literals and bounded instructions/token budget. | 68 |
| `SCAN_LIMIT` | Literal inspection exceeds 4,096 findings; narrow categories or source. | 92 |
| `INVALID_CONTEXT` | Context requires bounded own plain data. | 101 |
| `INVALID_CONTEXT` | Context requires dense own id/role/text messages with supported roles. | 104 |
| `INVALID_CONTEXT` | Context exceeds 100,000 serialized UTF-16 units. | 106 |
| `INVALID_PORTS` | Ports require own enumerable data properties. | 129 |
| `ABORTED` | Cleanup cancelled; no Patches were produced. | 131 |
| `INVALID_PORTS` | Cancellation signal could not be read safely. | 132 |
| `INVALID_DRAFT` | Draft findings require a dense own-data array. | 146 |
| `SCAN_LIMIT` | Combined inspection exceeds 4,096 findings; narrow upstream findings or categories. | 147 |
| `PROMPT_LIMIT` | Cleanup prompt exceeds 500,000 UTF-16 units; narrow the source or context. | 169 |
| `INVALID_PORTS` | A tokenizer, request port and opaque binding are required. | 172 |
| `TOKENIZATION_FAILED` | Prompt tokenization failed; no request was made. | 175 |
| `TOKENIZATION_FAILED` | Tokenizer must return an own finite nonnegative token count. | 177 |
| `REQUEST_FAILED` | Prose request failed; no retry was made. | 180 |
| `INVALID_RESPONSE` | Request failure requires an own error envelope. | 187 |
| `INVALID_RESPONSE` | Request requires an own Result envelope. | 189 |
| `INVALID_RESPONSE` | Response requires an own data envelope. | 191 |
| `INVALID_RESPONSE` | Completion requires nonblank raw prose. | 192 |
| `TRUNCATED_OUTPUT` | Completion was truncated; no Patches were produced. | 194 |
| `COMPLETION_UNVERIFIED` | Completion lacks recognized successful finish evidence. | 195 |

### src/workflow/operations/random-outcomes.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_EFFECT_LIBRARY` | Use data, JSON or plain text library settings. | 26 |
| `INVALID_EFFECT_LIBRARY` | Effect libraries require bounded plain JSON. | 29 |
| `INVALID_EFFECT_LIBRARY` | Effect source text must be bounded. | 31 |
| `INVALID_EFFECT_LIBRARY` | The effect source is not valid JSON. | 32 |
| `INVALID_EFFECT_LIBRARY` | Weighted text lines require a nonnegative numeric weight before \|. | 42 |
| `INVALID_EFFECT_LIBRARY` | Parsed effect source exceeds JSON limits. | 50 |
| `INVALID_EFFECT_LIBRARY` | Effect libraries require a known metadata and effects schema. | 52 |
| `LIBRARY_SCOPE_MISMATCH` | Configured effect library identity must match its source. | 53 |
| `INVALID_EFFECT_LIBRARY` | Validate every entry, unique ID, authored kind and weight before drawing. | 57 |
| `INVALID_EFFECT_LIBRARY` | This library requires explicit spell outcome, duration and consequence for every fixed effect. | 58 |
| `INVALID_EFFECT_LIBRARY` | The eligible library must contain positive finite total weight. | 61 |
| `INVALID_EFFECT_LIBRARY` | The effect library exceeds portable JSON limits. | 62 |
| `INVALID_SAVED_OUTCOME` | Saved random outcomes require checked identity and pending/accepted status. | 73 |
| `INVALID_SAVED_OUTCOME` | Saved outcomes require unchanged confirmed occurrences. | 74 |
| `INVALID_SAVED_OUTCOME` | Saved outcomes require their original frozen library. | 75 |
| `INVALID_SAVED_OUTCOME` | The saved occurrence, selected entry and library revision must remain consistent. | 81 |
| `INVALID_SAVED_OUTCOME` | The saved draw does not identify its selected entry. | 84 |
| `INVALID_SAVED_OUTCOME` | Fixed selections preserve their authored effect. | 87 |
| `INVALID_SAVED_OUTCOME` | Generated outcome state must retain a valid distinct invented effect. | 88 |
| `INVALID_SAVED_OUTCOME` | Generated effects require explicit accepted novelty before resolution. | 89 |
| `INVALID_RANDOM_EVENT` | Random effects require actual confirmed uses by the resolved holder of this exact item. | 103 |
| `REROLL_POLICY_REQUIRED` | A deliberate redraw requires its own reroll identity and explicit policy. | 105 |
| `INVALID_SAVED_OUTCOME` | Saved outcomes must be a bounded collection. | 106 |
| `INVALID_SAVED_OUTCOME` | Saved outcome identities must be unique. | 110 |
| `OUTCOME_CONFLICT` | One occurrence cannot have multiple outcomes for the same reroll identity. | 113 |
| `OUTCOME_CONFLICT` | The saved outcome belongs to different attributed evidence or library. | 115 |
| `LIBRARY_REVISION_CONFLICT` | Changing a library requires a new revision; a retry preserves its original snapshot. | 120 |
| `STALE_INPUT` | Random evidence or library changed during validation. | 121 |
| `ABORTED` | Random outcomes were stopped. | 122 |
| `RANDOM_MISSING` | Supply the trusted runtime randomness capability. | 123 |
| `OUTCOME_LIMIT` | The selected occurrence collection cannot safely retain every possible draw; reduce the collection or library. | 129 |
| `RANDOM_FAILED` | The runtime random source failed. | 134 |
| `INVALID_RANDOM_DRAW` | Runtime randomness must return a finite unit value in [0,1). | 135 |
| `OUTCOME_LIMIT` | The saved outcome collection exceeds portable bounds; no model request was made. | 142 |
| `INVALID_RANDOM_INPUT` | Random selection requires bounded data and trusted capabilities. | 144 |
| `INVALID_SETTINGS` | Use plain node metadata. | 164 |
| `INVALID_SETTINGS` | Routing metadata requires own data properties. | 167 |
| `INVALID_SETTINGS` | Use plain Random node settings. | 169 |
| `UNKNOWN_OPERATION` | Unknown Random operation. | 171 |
| `INVALID_PHASE` | Random node phase must match its effective phase. | 173 |
| `INVALID_PHASE` | Outcome Commit is a Post operation. | 174 |
| `INVALID_SETTINGS` | Controls require own data properties. | 177 |
| `INVALID_SETTINGS` | Use supported bounded Random controls. | 182 |
| `INVALID_SETTINGS` | Choose an authorized outcomes source. | 186 |
| `INVALID_SETTINGS` | Supply explicit library, revision and item identities. | 188 |
| `REROLL_POLICY_REQUIRED` | Explicit reroll mode requires an authored reroll identity; reuse leaves it empty. | 193 |
| `INVALID_INPUT` | Use declared named Random inputs. | 202 |
| `MISSING_INPUT` | Required input is missing:  | 204 |
| `INVALID_INPUT` | The Random input must match its declared artifact kind. | 208 |
| `ABORTED` | The Random operation was stopped. | 218 |
| `RANDOM_FAILED` | Native selection requires a trusted host capability. | 225 |
| `ABORTED` | Random selection was stopped. | 227 |
| `STALE_INPUT` | Random selection evidence changed during capture. | 227 |
| `ROOT_ONLY` | Outcome Commit requires a root workflow. | 231 |
| `HOST_OPERATION_REQUIRED` | Outcome Commit requires a trusted accepted-state host. | 232 |
| `ABORTED` | Outcome staging was stopped. | 233 |
| `OUTCOME_COMMIT_FAILED` | The resolved native outcomes could not be staged; verify their event sources and authorized outcome data. | 234 |
| `OUTCOME_COMMIT_FAILED` | Outcome staging requires a bounded descriptive receipt. | 235 |
| `INVALID_SAVED_OUTCOME` | Saved Outcome requires a bounded outcome collection. | 240 |
| `OUTCOME_CONFLICT` | Select an explicit reroll identity before resolving multiple outcomes. | 243 |
| `OUTCOME_CONFLICT` | The saved outcome attribution does not match this occurrence. | 244 |
| `OUTCOME_REUSE_FAILED` | Outcome reuse requires a trusted host capability. | 250 |
| `OUTCOME_REUSE_FAILED` | The retained draw source changed. | 250 |
| `STALE_INPUT` | Outcome material changed during validation. | 251 |
| `REQUEST_MISSING` | Select the separate effect-author model connection. | 259 |
| `INPUT_LIMIT` | The effect-author prompt exceeds 65,536 UTF-8 bytes. | 261 |
| `ABORTED` | Ignore the stopped effect-author response. | 263 |
| `STALE_INPUT` | The cast or saved draw changed during effect authoring. | 264 |
| `INVALID_RESPONSE` | The effect author returned malformed plain data. | 265 |
| `INVALID_RESPONSE` | The effect author requires bounded completed JSON text. | 267 |
| `INVALID_EFFECT_RESPONSE` | The effect author must return plain JSON. | 269 |
| `INVALID_EFFECT_RESPONSE` | The invented effect must satisfy the authored structure and exact novelty checks. | 270 |
| `OUTCOME_LIMIT` | The authored outcome exceeds portable bounds; retain the saved draw. | 272 |
| `INVALID_RANDOM_INPUT` | Random operations require bounded own data and trusted capabilities. | 274 |
| `OUTCOME_RETENTION_FAILED` | Outcome retention requires a trusted host capability. | 279 |
| `OUTCOME_RETENTION_FAILED` | The retained draw source changed during authoring. | 279 |
| `OUTCOME_RETENTION_FAILED` | The native outcome could not be retained. | 279 |

### src/workflow/operations/recall-nodes.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | Use plain Recall node metadata. | 23 |
| `INVALID_SETTINGS` | Recall routing metadata requires own data properties. | 24 |
| `UNKNOWN_OPERATION` | Use a supported Recall operation version. | 25 |
| `INVALID_PHASE` | Recall must match its effective workflow stage. | 26 |
| `INVALID_SETTINGS` | Recall controls require own data properties. | 27 |
| `INVALID_SETTINGS` | Recall controls require bounded plain data. | 27 |
| `INVALID_SETTINGS` | Use supported bounded Recall controls. | 28 |
| `INVALID_SETTINGS` | Select an actor and memory set explicitly. | 30 |
| `INVALID_SETTINGS` | An automatic trigger needs explicit keywords or event types. | 32 |
| `INVALID_INPUT` | Recall inputs require bounded own plain data. | 38 |
| `INVALID_INPUT` | Recall requires named Data inputs. | 38 |
| `UNSUPPORTED_INPUT` | Remove stale Recall input ports. | 38 |
| `INVALID_INPUT` | Recall inputs require checked Data envelopes and visibility. | 38 |
| `INVALID_RECALL_PRESENCE` | Recall needs checked participation of its authorized actor at this scene stage. | 39 |
| `MISSING_INPUT` | Automatic character recall requires scene presence. | 43 |
| `MISSING_INPUT` | Automatic keyword recall requires its bounded source. | 45 |
| `INVALID_RECALL_SOURCE` | Keyword recall requires explicit source and revision identity. | 46 |
| `RECALL_STAGE_MISMATCH` | A reply trigger can affect Post processing or a later generation, not the earlier prompt. | 47 |
| `MISSING_INPUT` | Automatic event recall requires confirmed occurrences. | 51 |
| `INVALID_RECALL_EVENTS` | Recall events must be a bounded collection. | 52 |
| `INVALID_RECALL_EVENTS` | Only distinct confirmed actual occurrences can activate recall. | 56 |
| `INVALID_RECALL_EVENTS` | Canonical occurrences require their checked identity and confirmation. | 57 |
| `INVALID_RECALL_EVENTS` | Group event recall by one explicit source revision. | 58 |
| `RECALL_STAGE_MISMATCH` | Reply occurrences cannot retroactively alter their generation prompt. | 59 |
| `RECALL_ACTOR_MISMATCH` | Recall records must be permitted material for this actor. | 64 |
| `INVALID_RECALL_RECORDS` | A record container must match the authorized scope and memory set. | 66 |
| `INVALID_RECALL_RECORDS` | Supply at most 512 checked records from Read File or Format. | 67 |
| `INVALID_RECALL_RECORDS` | Record identity, actor, text and optional filters must be checked bounded data. | 68 |
| `RECALL_ACTOR_MISMATCH` | A record cannot disclose another actor or hidden material. | 68 |
| `INVALID_RECALL_RECORDS` | Memory record identities must be distinct. | 69 |
| `RECALL_BUDGET_EXCEEDED` | No matching whole memory fits the authored retrieval budget. | 73 |
| `INVALID_RECALL_RESPONSE` | The trusted Recall capability returned invalid data. | 76 |
| `RECALL_CAPABILITY_FAILED` | The trusted Recall capability did not authorize this action. | 76 |
| `RECALL_ROOT_REQUIRED` | Recall queueing and activation require the trusted root host. | 79 |
| `RECALL_STATE_MISSING` | Bind the trusted scoped Recall state service. | 81 |
| `STALE_RECALL_SETTINGS` | Recall settings changed while the operation was pending. | 83 |
| `ABORTED` | Recall was cancelled. | 83 |
| `STALE_RECALL_INPUT` | Ignore changed Recall evidence. | 83 |
| `RECALL_SCOPE_UNAVAILABLE` | The trusted Recall scope is unavailable. | 84 |
| `RECALL_ACTOR_MISMATCH` | This Recall node does not match its authorized actor or workflow. | 84 |
| `RECALL_HOTKEY_UNAVAILABLE` | The trusted shortcut registration is unavailable. | 89 |
| `RECALL_HOTKEY_UNAVAILABLE` | The shortcut registration was not acknowledged. | 89 |
| `RECALL_ACTOR_MISMATCH` | Recall evidence must be permitted material for the selected actor. | 93 |
| `RECALL_ACTIVATION_FAILED` | The trusted Recall activation failed. | 96 |
| `RECALL_ACTIVATION_FAILED` | The trusted Recall activation did not authorize this generation. | 97 |
| `RECALL_STAGE_MISMATCH` | Recall activation must match the owned generation stage. | 100 |
| `MISSING_INPUT` | An activated recall requires actor presence at this scene stage. | 101 |
| `MISSING_INPUT` | An activated recall requires its explicit memory record input. | 102 |
| `RECALL_RECORD_AUTHORIZATION_MISSING` | The trusted host must authorize the exact supplied memory source. | 103 |
| `RECALL_RECORDS_UNAVAILABLE` | The authorized memory source is unavailable. | 104 |
| `RECALL_RECORD_SCOPE_MISMATCH` | The authorized source must match this user, chat, actor and memory set. | 105 |
| `RECALL_TOKENIZER_MISSING` | Bind the trusted tokenizer for the Recall retrieval budget. | 107 |
| `RECALL_TOKENIZER_FAILED` | The Recall tokenizer failed. | 108 |
| `RECALL_TOKENIZER_FAILED` | Recall requires a bounded exact token count. | 108 |
| `RECALL_BUDGET_EXCEEDED` | No matching whole memory fits the authored token budget. | 109 |
| `RECALL_SETTLEMENT_MISSING` | The host must retain the private consumption claim until successful or accepted settlement. | 110 |
| `RECALL_STAGING_FAILED` | The host could not retain this Recall claim. | 111 |
| `RECALL_STAGING_FAILED` | The private consumption claim was not retained. | 111 |

### src/workflow/operations/reference-draft.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_DRAFT` | Draft must contain bounded own plain data. | 85 |
| `INVALID_DRAFT` | Draft requires own original source text. | 86 |
| `INPUT_LIMIT` | Draft exceeds 100,000 UTF-16 units. | 87 |
| `INVALID_SETTINGS` | Settings require bounded own plain data. | 96 |
| `INVALID_SETTINGS` | Use a supported scope and bounded nonblank protected literals. | 97 |
| `INVALID_SETTINGS` | At most 128 unique protected literals are permitted. | 99 |
| `INVALID_SPANS` | Scoped Drafts require existing permissions. | 104 |
| `SCOPE_REQUIRED` | An unannotated Draft requires explicit scope. | 105 |
| `UNMATCHED_QUOTES` | Ambiguous or unmatched double quotes prevent deterministic scope. | 107 |
| `INVALID_SPANS` | Draft permissions require spans. | 110 |
| `SPAN_LIMIT` | At most 256 original spans are permitted. | 111 |
| `WINDOW_LIMIT` | At most 256 editable windows are permitted. | 129 |
| `INVALID_SPANS` | Editable boundaries cannot split surrogate pairs. | 130 |
| `INVALID_PREPARATION` | Use an authenticated reference Draft preparation. | 137 |
| `INVALID_PATCHES` | Replacements require a dense own-data array. | 139 |
| `INVALID_PATCHES` | Supply one string replacement per editable window. | 140 |
| `INVALID_METADATA` | Completion metadata requires bounded own plain data. | 142 |
| `INVALID_METADATA` | Supply only usage and completion metadata. | 143 |
| `COMPLETION_UNVERIFIED` | Completion metadata requires a recognized successful finish. | 144 |
| `OUTPUT_LIMIT` | Candidate exceeds 100,000 UTF-16 units. | 157 |
| `INVALID_CANDIDATE` | Candidate must be exact text. | 165 |
| `OUT_OF_SCOPE_CHANGE` | Candidate changed immutable original text. | 169 |
| `OUT_OF_SCOPE_CHANGE` | Candidate changed immutable original boundaries. | 171 |
| `OUT_OF_SCOPE_CHANGE` | Candidate changed an immutable original anchor. | 177 |
| `AMBIGUOUS_ALIGNMENT` | Immutable anchors admit multiple editable window alignments. | 185 |
| `OUT_OF_SCOPE_CHANGE` | Candidate cannot be reconstructed from its editable windows. | 197 |

### src/workflow/operations/reference-transfer.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_DATA` | Input requires bounded own plain data. | 48 |
| `ABORTED` | Transfer cancelled; no Patches were produced. | 54 |
| `INVALID_REFERENCE` | Reference requires bounded own JSON data. | 70 |
| `INVALID_REFERENCE` | Expected a Text or Data reference. | 72 |
| `INVALID_REFERENCE` | Text references require nonblank text up to 100,000 UTF-16 units. | 74 |
| `INVALID_REFERENCE` | Data references require a nonempty JSON object or array. | 77 |
| `INVALID_REFERENCE` | Data references require bounded plain JSON values. | 79 |
| `INVALID_REFERENCE` | Data references exceed JSON or text limits. | 81 |
| `INVALID_REFERENCE` | Template requiredContent must contain bounded nonblank literals. | 84 |
| `MISSING_TEMPLATE_CONTENT` | Original prose lacks required template content; no text can be invented. | 85 |
| `INVALID_CONTEXT` | Context requires bounded own data. | 91 |
| `INVALID_CONTEXT` | Context requires dense own id/role/text messages with supported roles. | 93 |
| `INVALID_CONTEXT` | Context exceeds 100,000 serialized UTF-16 units. | 95 |
| `INVALID_PORTS` | Ports require own data properties. | 105 |
| `INVALID_PORTS` | Cancellation signal could not be read safely. | 108 |
| `INVALID_SETTINGS` | Supply supported transfer controls and bounded instructions/token budget. | 113 |
| `PROMPT_LIMIT` | Transfer prompt exceeds 500,000 UTF-16 units; narrow the material. | 129 |
| `INVALID_PORTS` | A tokenizer, request port and opaque binding are required. | 132 |
| `TOKENIZATION_FAILED` | Prompt tokenization failed; no request was made. | 135 |
| `TOKENIZATION_FAILED` | Tokenizer must return an own finite nonnegative token count. | 137 |
| `REQUEST_FAILED` | Prose request failed; no retry was made. | 141 |
| `INVALID_RESPONSE` | Request failure requires an own error envelope. | 148 |
| `INVALID_RESPONSE` | Request requires an own Result envelope. | 150 |
| `INVALID_RESPONSE` | Response requires an own data envelope. | 152 |
| `INVALID_RESPONSE` | Completion requires nonblank raw prose. | 153 |
| `TRUNCATED_OUTPUT` | Completion was truncated; no Patches were produced. | 155 |
| `COMPLETION_UNVERIFIED` | Completion lacks recognized successful finish evidence. | 156 |

### src/workflow/operations/select-fields.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_FIELDS` | Fields must be at most 128 unique named path mappings. | 3 |
| `MISSING_FIELD` | Required field is missing. | 43 |

### src/workflow/operations/terminology-map.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | Use own plain matching and scope settings. | 46 |
| `INVALID_GLOSSARY` | Use at most 128 own-data entries with nonblank literals of at most 2,048 UTF-16 units. | 48 |
| `DUPLICATE_RULE` | Effective from literals must be unique. | 57 |
| `FINDING_LIMIT` | At most 4,096 terminology findings are permitted. | 69 |
| `OUTPUT_LIMIT` | Candidate exceeds 100,000 UTF-16 units. | 78 |

### src/workflow/operations/text-rules.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `ABORTED` | Text rules were stopped. | 14 |
| `WORKER_UNAVAILABLE` | A dedicated text rules Worker is unavailable. | 24 |
| `WORKER_UNAVAILABLE` | The text rules Worker failed. | 38 |
| `RULE_TIMEOUT` | Text rules exceeded their Worker deadline. | 44 |
| `INPUT_LIMIT` | Text must be a string of at most 100,000 UTF-16 units. | 51 |
| `INVALID_RULES` | Use supported modes and at most 64 bounded literal or regex rules with supported unique flags. | 53 |
| `INVALID_RULES` | Execution requires a 100..2,000 ms deadline and an optional AbortSignal and Worker factory. | 55 |
| `INVALID_RULES` | Use supported bounded text rules and execution options. | 111 |
| `INVALID_DRAFT` | Draft must contain cloneable original source and span data. | 119 |
| `INPUT_LIMIT` | Draft exceeds 100,000 UTF-16 units. | 120 |
| `SPAN_LIMIT` | Draft accepts at most 256 original editable spans. | 121 |

### src/workflow/operations/time-nodes.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | Time node settings require plain own data. | 53 |
| `UNKNOWN_OPERATION` | Unknown Time operation. | 56 |
| `INVALID_SETTINGS` | Time operation version must be 1. | 57 |
| `INVALID_PHASE` | Time operation must match its effective phase. | 59 |
| `INVALID_PHASE` | Clock Commit is a Post operation. | 60 |
| `INVALID_SETTINGS` | Time controls require bounded own JSON. | 64 |
| `INVALID_SETTINGS` | Use supported bounded Time controls. | 71 |
| `INVALID_SETTINGS` | Select an explicit clock and optional calendar identity. | 73 |
| `INVALID_SETTINGS` | Time Trigger requires an identity and noncontradictory bounded schedule metadata. | 74 |
| `INVALID_SETTINGS` | Consumed occurrence IDs require bounded nonempty strings. | 75 |
| `INVALID_SETTINGS` | Time controls and routing metadata require own data. | 88 |
| `INVALID_INPUT` | Time operations require bounded named Data artifacts. | 128 |
| `UNSUPPORTED_INPUT` | Unsupported Time input. | 131 |
| `MISSING_INPUT` | Required Time input is missing:  | 133 |
| `INVALID_INPUT` | Time input requires an explicit Data artifact. | 135 |
| `OUTPUT_LIMIT` | Time outputs exceed the bounded portable JSON budget. | 146 |
| `AMBIGUOUS_SCHEDULES` | Use either connected schedules or authored schedules, not both. | 149 |
| `INVALID_OPTIONS` | Settled occurrence IDs must be an explicit array. | 152 |
| `CLOCK_SCOPE_MISMATCH` | Previous and destination clocks must share the selected identity and calendar. | 168 |
| `INVALID_CLOCK` | Clock capture failure requires bounded diagnostic code and message. | 195 |
| `ABORTED` | Time projection was stopped. | 207 |
| `TIME_PROJECTION_FAILED` | Time retention requires a trusted host capability. | 212 |
| `TIME_PROJECTION_FAILED` | The trusted time projection could not be retained. | 213 |
| `ABORTED` | The time projection was stopped. | 214 |
| `TIME_PROJECTION_FAILED` | The captured clock changed while retaining its projection. | 215 |
| `ROOT_ONLY` | Accepted clock capture is reserved for a root workflow. | 219 |
| `HOST_OPERATION_REQUIRED` | Clock Commit requires a trusted accepted-state host. | 222 |
| `CLOCK_COMMIT_FAILED` | The clock projection could not be staged. | 223 |
| `ABORTED` | Clock staging was stopped. | 224 |
| `CLOCK_COMMIT_FAILED` | The captured time projection could not be staged; verify its clock and accepted occurrence history. | 225 |
| `CLOCK_COMMIT_FAILED` | Clock staging requires a bounded descriptive receipt. | 227 |
| `INVALID_INPUT` | The clock source identity must be bounded own data. | 232 |
| `STORY_CLOCK_MISSING` | The trusted host must supply the accepted story clock. | 234 |
| `ABORTED` | Ignore the stopped story clock capture. | 238 |
| `STALE_INPUT` | Story Clock source settings or inputs changed during capture. | 244 |
| `INVALID_CLOCK` | Story Clock requires a bounded successful Result. | 246 |
| `INVALID_CLOCK` | Story Clock requires a successful captured Result. | 249 |
| `INVALID_CLOCK` | Accepted clocks require schema 1 and a positive persisted revision. | 253 |
| `CLOCK_SCOPE_MISMATCH` | The captured clock must match the selected identity and calendar. | 254 |
| `INVALID_INPUT` | Time inputs and execution metadata require own data. | 256 |

### src/workflow/operations/transpose-nodes.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | Node must be a plain record. | 57 |
| `UNKNOWN_OPERATION` | Unknown Transpose operation. | 59 |
| `INVALID_VERSION` | Transpose requires operation version 1. | 60 |
| `INVALID_PHASE` | Draft Transpose requires post phase; Text requires a matching pre or post phase. | 66 |
| `INVALID_SETTINGS` | Declared node fields require own enumerable data. | 73 |
| `INVALID_SETTINGS` | Description options must be a plain record. | 78 |
| `INVALID_SETTINGS` | Description options require own enumerable data. | 80 |
| `INVALID_INPUTS` | Named inputs must be a plain record. | 88 |
| `UNSUPPORTED_INPUT` | Unsupported or stale named input. | 93 |
| `INVALID_INPUT` | Input  | 95 |
| `MISSING_INPUT` | Required input is missing:  | 98 |
| `INVALID_EXECUTION` | Inject request, countTokens and an AbortSignal. | 104 |
| `INVALID_EXECUTION` | Execution ports require own enumerable data. | 106 |
| `INVALID_INPUT` | Text requires only own kind and text fields. | 111 |
| `INVALID_INPUT` | Text requires at most 100,000 UTF-16 units. | 113 |
| `INVALID_EXECUTION` | Execution must be a plain record. | 126 |
| `INVALID_INPUTS` | Use named inputs and execution with own data properties. | 151 |

### src/workflow/packages.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `WRONG_PHASE` | Root workflow imports require a unified workflow. Retired originals are recovery data only. | 138 |
| `MALFORMED_WORKFLOW` | Workflow JSON must be at most 2,000,000 UTF-8 bytes. | 143 |
| `UNSUPPORTED_PACKAGE` | Expected a Lattice workflow package with schema 2 and minRuntime 2. | 147 |
| `MALFORMED_WORKFLOW` | Malformed workflow package containers. | 151 |
| `DEFINITION_DATA` | Expected a plain pinned snapshot table. | 165 |
| `DEFINITION_REF` | An instance or helper requires an exact pinned reference. | 177 |
| `MISSING_DEFINITION` | The exact pinned snapshot is not bundled. | 179 |
| `MALFORMED_WORKFLOW` | Subgraph JSON must be at most 2,000,000 UTF-8 bytes. | 207 |
| `INVALID_JSON` | That is not valid subgraph JSON. | 209 |
| `DEFINITION_DATA` | Invalid plain subgraph package data. | 210 |
| `UNSUPPORTED_PACKAGE` | Unsupported subgraph package/runtime pair. | 211 |
| `DEFINITION_DATA` | Malformed subgraph package containers. | 222 |
| `INVALID_JSON` | That is not valid workflow JSON. | 145 |
| `MALFORMED_WORKFLOW` | Invalid workflow package data. | 146 |

### src/workflow/ports.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_ENDPOINT` | Expected named output and input endpoints. | 61 |
| `CYCLE` | A block cannot connect to itself. | 66 |
| `AMBIGUOUS_INPUT` | This input is already connected. | 69 |
| `INVALID_WIRE` | Expected wire IDs. | 84 |
| `INVALID_SETTINGS` | Expected declared control changes and explicit incident wire IDs. | 101 |
| `UNSUPPORTED_VERSION` | Named control editing requires schema 3 and runtime 2. | 104 |
| `INVALID_SETTINGS` | Choose a supported Introspection mode. | 122 |
| `INVALID_SETTINGS` | Only declared operation controls may change. | 128 |
| `INVALID_WIRE` | Explicit removal must identify an existing incident wire. | 133 |

### src/workflow/progression.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_THRESHOLDS` | Use finite values and a strictly increasing authored threshold list. | 189 |
| `INVALID_THRESHOLDS` | Use bounded plain authored thresholds. | 194 |
| `INVALID_TIME_DECAY` | Use bounded authored values and an established nonnegative story minute. | 201 |
| `INVALID_TIME_DECAY` | Choose one explicit recovery rule per value. | 202 |
| `INVALID_TIME_DECAY` | Decay timestamps must be nonnegative integer story minutes. | 205 |
| `INVALID_TIME_DECAY` | Recovery requires explicit baseline, rate, bounds, revision and initial story time. | 208 |
| `INVALID_TIME_DECAY` | Recovery targets must exist inside their authored bounds. | 210 |
| `INVALID_TIME_DECAY` | Private recovery requires explicitly authored matching actor scope. | 211 |
| `INVALID_TIME_DECAY` | Directed recovery must match its stored target scope. | 212 |
| `BACKWARD_TIME` | Recovery cannot rewind established story time. | 214 |
| `TIME_DECAY_LIMIT` | Elapsed-time recovery exceeds safe finite arithmetic. | 216 |
| `EVENT_ID_CONFLICT` | The stored occurrence ID refers to incompatible facts. | 121 |
| `EVENT_ID_CONFLICT` | One occurrence ID cannot identify incompatible events. | 126 |
| `UNRESOLVED_TIME` | This progression needs the event\'s established story minute. | 132 |
| `EVENT_ORDER` | Timed progression occurrences must be supplied chronologically. | 133 |

### src/workflow/prompt-source.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `UNSUPPORTED_PROMPT_MACRO` | Resolved prompt capture supports pure name and formatting macros only. Use raw form for this template. | 20 |
| `PROMPT_RESOLUTION_UNAVAILABLE` | The host does not expose supported macro substitution. Use raw form. | 21 |
| `UNSUPPORTED_PROMPT_MACRO` | The configured original contains macros outside read-only resolution. Use raw form. | 38 |
| `PROMPT_RESOLUTION_FAILED` | The host could not resolve the configured original template. | 40 |
| `PROMPT_RESOLUTION_FAILED` | Host macro substitution did not return original text. | 42 |
| `INPUT_LIMIT` | The resolved original exceeds the 100,000-character snapshot limit. | 43 |
| `PROMPT_RESOLUTION_FAILED` | The host left unresolved macros in the configured original template. | 44 |
| `PROMPT_RESOLUTION_FAILED` | The host could not resolve this prompt template. | 47 |
| `PROMPT_RESOLUTION_FAILED` | Host macro substitution did not return text. | 49 |
| `PROMPT_RESOLUTION_FAILED` | The host left unresolved macros in this template. Use raw form. | 50 |
| `INPUT_LIMIT` | The prompt exceeds the 100,000-character snapshot limit. | 52 |
| `PROMPT_UNAVAILABLE` | The selected system override is not text. | 62 |
| `PROMPT_UNAVAILABLE` | Public prompt settings are unavailable or malformed. | 67 |
| `INPUT_LIMIT` | Public prompt settings exceed the bounded lookup limit. | 68 |
| `PROMPT_UNAVAILABLE` | The selected stable prompt identifier is missing or ambiguous. | 70 |
| `PROMPT_UNAVAILABLE` | Public prompt order data is malformed. | 72 |
| `UNSUPPORTED_PROMPT` | Prompt markers represent assembled material and cannot be captured as a configured text block. | 73 |
| `PROMPT_UNAVAILABLE` | The selected prompt entry is unavailable in this host context. | 74 |
| `PROMPT_UNAVAILABLE` | The active prompt order is malformed. | 78 |
| `INPUT_LIMIT` | The active prompt order exceeds the bounded lookup limit. | 79 |
| `PROMPT_UNAVAILABLE` | The selected prompt enabled state is unavailable or ambiguous. | 81 |
| `PROMPT_INACTIVE` | The selected prompt entry is absent from the active prompt order. | 83 |
| `PROMPT_UNAVAILABLE` | The active main prompt enabled state is not exposed by this host. | 84 |
| `PROMPT_DISABLED` | The selected prompt entry is disabled. | 86 |
| `INVALID_PROMPT_SOURCE` | Choose a supported prompt source, form, and bounded stable prompt identifier. | 98 |
| `PROMPT_UNAVAILABLE` | The configured system prompt is unavailable in this host context. | 101 |
| `PROMPT_DISABLED` | The configured system prompt is disabled. | 102 |
| `PROMPT_UNAVAILABLE` | The host prompt settings could not be read safely. | 114 |

### src/workflow/recall-state.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_RECALL_SCOPE` | Recall requires a checked user, chat, workflow and actor scope. | 12 |
| `INVALID_RECALL_QUEUE` | Use a bounded recall proposal with explicit target and consumption policy. | 15 |
| `INVALID_RECALL_HOTKEY` | Select a physical key with Control, Alt or Meta, or a function key. | 17 |
| `INVALID_RECALL_TRIGGER` | Recall activation needs bounded distinct source and event identities. | 20 |
| `INVALID_RECALL_AUTHORITY` | Return one bounded own-data scope and owned generation snapshot. | 23 |
| `INVALID_RECALL_GENERATION` | The coherent authority needs a checked generation envelope or no active generation. | 25 |
| `INVALID_RECALL_PORTS` | Bind one trusted coherent scope and owned generation authority callback. | 30 |
| `RECALL_STATE_RELEASED` | The scoped recall state has been released. | 32 |
| `RECALL_AUTHORITY_UNAVAILABLE` | The trusted coherent Recall authority is unavailable. | 33 |
| `STALE_RECALL_SCOPE` | The recall user, chat, workflow or actor changed. | 36 |
| `RECALL_CLAIM_CLOSED` | This activation was released without consumption. | 41 |
| `RECALL_CLAIM_CLOSED` | The exact queued allowance is no longer reserved for this activation. | 43 |
| `INVALID_RECALL_GENERATION` | No owned generation is available for this Recall claim. | 47 |
| `STALE_RECALL_GENERATION` | The owned generation changed while Recall was pending. | 48 |
| `INVALID_RECALL_QUEUE` | Use a bounded queue or cancellation batch. | 55 |
| `INVALID_RECALL_QUEUE` | Use at most 1000 selected nodes in a recall batch. | 57 |
| `INVALID_RECALL_QUEUE` | Select valid memory sets to cancel. | 60 |
| `RECALL_ACTOR_MISMATCH` | Queue only the actor authorized by this recall session. | 62 |
| `RECALL_QUEUE_CONFLICT` | Matching Recall Shortcuts use different policies. Make their target, repetition, and consumption settings match. | 63 |
| `RECALL_QUEUE_CONFLICT` | Cancel the existing request before changing its target or policy. | 67 |
| `RECALL_QUEUE_LIMIT` | This session reached its bounded request limit. Cancel unused requests before adding more. | 69 |
| `INVALID_RECALL_ACTIVATION` | Recall activation must match the authorized actor and memory set. | 82 |
| `INVALID_RECALL_GENERATION` | Recall activation requires an owned reply or generated-swipe operation. | 84 |
| `RECALL_HISTORY_LIMIT` | The scoped activation history reached its bound; start a fresh session explicitly. | 91 |
| `RECALL_CLAIM_UNAUTHORIZED` | Use the exact live activation claim. | 99 |
| `INVALID_RECALL_GENERATION` | Use a supported Recall stage. | 100 |
| `RECALL_CLAIM_UNAUTHORIZED` | Settle the exact live claim retained by the trusted host. | 105 |
| `INVALID_RECALL_SETTLEMENT` | Use an explicit successful, accepted, failed or cancelled outcome. | 106 |
| `RECALL_CLAIM_CLOSED` | This unsuccessful activation claim has closed. | 108 |
| `RECALL_CLAIM_UNAUTHORIZED` | Release the exact live claim retained by the trusted host. | 118 |

### src/workflow/repair.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_SETTINGS` | Use a supported scope/case policy and at most 128 nonblank literal preferences, each at most 2,048 UTF-16 units. | 58 |
| `INVALID_DRAFT` | Expected a draft with frozen original source text. | 59 |
| `INVALID_DRAFT` | Draft findings must be a dense array of plain inspection records. | 60 |
| `SCAN_LIMIT` | Scan accepts at most 4,096 total findings. Narrow the source or rules; no findings were truncated. | 61 |
| `INPUT_LIMIT` | Draft exceeds the 100,000 UTF-16-unit scan/repair limit. Narrow the source before running; no text was truncated. | 62 |
| `SPAN_LIMIT` | Scan accepts at most 256 original editable spans. | 67 |
| `INVALID_SPANS` | Existing permissions require a dense original span array. | 68 |
| `INVALID_SPANS` | Scoped Drafts require existing original permissions. | 69 |
| `SCOPE_REQUIRED` | An unannotated Draft requires explicit whole, narration or dialogue scope. | 70 |
| `INVALID_SPANS` | Existing editable spans must remain valid original permissions. | 71 |
| `INVALID_DRAFT` | Draft protections and exemptions must be bounded nonblank literal lists. | 75 |
| `INVALID_SETTINGS` | Combined protections and exemptions accept at most 128 unique literals. | 80 |
| `SCAN_LIMIT` | The unmatched-quote finding exceeds the 4,096 total finding limit. | 86 |
| `SCAN_LIMIT` | Scan exceeds 4,096 total findings. Narrow the rules or scope; no permissions were truncated. | 105 |
| `SPAN_LIMIT` | Scan exceeds 256 normalized editable spans. Narrow the rules or scope; no permissions were truncated. | 117 |
| `INVALID_SETTINGS` | Repair settings require repair/scan mode, bounded text preferences and a positive completion limit. | 188 |
| `INPUT_LIMIT` | Draft exceeds the 100,000 UTF-16-unit repair limit. Narrow the source before running; no text was transmitted. | 190 |
| `SPAN_LIMIT` | Repair accepts at most 256 normalized spans. Narrow the rules or scope before running; no text was transmitted. | 191 |
| `ABORTED` | Repair was stopped. | 192 |
| `INVALID_SPANS` | Editable spans must be ordered, normalized, nonoverlapping original ranges. | 196 |
| `INVALID_CONTEXT` | Nearby context must be bounded plain JSON with dense messages containing id, role and text; no request was sent. | 197 |
| `INPUT_LIMIT` | Repair prompt exceeds 500,000 UTF-16 units. Narrow the preferences; no request was sent. | 208 |
| `ABORTED` | Repair was stopped before transmission. | 212 |
| `ABORTED` | Repair was stopped; ignore its late completion. | 219 |
| `INVALID_PATCHES` | Expected patches attached to a frozen original draft. | 226 |
| `TRUNCATED_OUTPUT` | Repair output reached its completion limit; keep the original. | 232 |
| `OUTPUT_LIMIT` | Repair JSON exceeds 100,000 UTF-16 units; keep the original. | 233 |
| `INVALID_PATCHES` | Expected only a JSON patches array envelope. | 238 |
| `INVALID_PATCHES` | Repair must return valid JSON patches. | 242 |
| `INVALID_PATCHES` | Patches must use the supplied span indices. | 243 |
| `INVALID_PATCHES` | A span index may appear only once. | 244 |
| `INVALID_PATCHES` | Each replacement must be nonblank text. | 245 |
| `PROTECTED_LITERAL_REMOVED` | Repair removed protected literal wording. | 250 |
| `UNMATCHED_QUOTES` | Unmatched double quotes prevent deterministic narration/dialogue scanning. | 88 |
| `UNMATCHED_QUOTES` | Unmatched double quotes were found; whole-text scope remains explicit. | 119 |
| `NO_CHANGES` | No prose changes were proposed. | 252 |

### src/workflow/resolve.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_TARGET` | Expected an actual output or tagged terminal target. | 30 |
| `INVALID_TARGET` | The target is not a terminal operation. | 33 |
| `INVALID_TARGET` | Unknown target kind. | 36 |
| `INVALID_TARGET` | Select an existing output port explicitly. | 38 |
| `DISABLED_OPERATION` | The selected output passes through a disabled boundary. | 40 |
| `MISSING_INPUT` | The selected wrapper output has no connected source. | 42 |
| `INVALID_TARGET` | The selected output does not resolve to a primitive. | 44 |
| `MISSING_INPUT` | Connect the required instance input. | 55 |
| `DISABLED_OPERATION` | A selected dependency is disabled. | 57 |
| `MISSING_INPUT` | Connect the required input artifact. | 58 |
| `MULTIPLE_NATIVE_GENERATIONS` | A selected unified root supports one native generation boundary. | 64 |
| `NATIVE_ACTIVATION_REQUIRED` | A native root boundary requires one selected root On Send activation. | 67 |
| `CYCLE` | Native preparation and Post-stage dependencies contain a cycle. | 90 |
| `INVALID_TARGET` | Expected plain planning options. | 100 |
| `INVALID_PREPARED_PLANNER` | Use the prepared planner belonging to this exact workflow. | 130 |

### src/workflow/retired-workflows.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `RETIRED_WORKFLOW_DATA` | Expected a bounded plain recovery workflow. | 4 |

### src/workflow/runtime.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `WRONG_PHASE` | Only unified workflow roots can execute. | 42 |
| `WRONG_PHASE` | The workflow operation does not support this phase. | 43 |
| `HOST_OPERATION_REQUIRED` | This operation requires its owned root host adapter. | 49 |
| `DRAFT_EVIDENCE_RETENTION_FAILED` | The native owner could not retain final narrative evidence. | 58 |
| `DRAFT_EVIDENCE_RETENTION_FAILED` | The native owner did not acknowledge final narrative evidence. | 59 |
| `DRAFT_EVIDENCE_RETENTION_FAILED` | The native owner returned invalid narrative source metadata. | 60 |
| `INVALID_SNAPSHOT` | The host did not provide the expected frozen source. | 89 |
| `EMPTY_OUTPUT` | Planning returned no guidance. | 95 |
| `GUIDANCE_OVERFLOW` | Guidance exceeds its artifact token budget; nothing was published. | 98 |
| `UNKNOWN_OPERATION` | Unsupported workflow operation. | 111 |
| `INVALID_RUN_CLOCK` | Provide finite nonnegative run clocks. | 146 |
| `INVALID_RUN_PLAN` | The workflow execution inventory is invalid. | 157 |
| `ABORTED` | Workflow was stopped. | 161 |
| `BINDING_MISSING` | Resolve the activated model connection before running. | 178 |
| `ACTOR_SCOPE_FAILED` | The auxiliary model scope could not be authorized. | 211 |
| `ACTOR_SCOPE_FAILED` | The auxiliary model scope was not authorized. | 213 |
| `ACTOR_SCOPE_FAILED` | The private artifact scope could not be retained. | 217 |
| `ACTOR_SCOPE_FAILED` | The private artifact scope was not retained. | 219 |
| `REQUEST_IN_FLIGHT` | This operation already has an active request. | 228 |
| `REQUEST_CAPABILITY_MISMATCH` | This node authorizes text completion requests only. | 229 |
| `REQUEST_UNAVAILABLE` | A verified completion capability and tokenizer are required. | 238 |
| `TOKEN_COUNT_FAILED` | The tokenizer returned an invalid count. | 241 |
| `INVALID_RESPONSE` | Auxiliary request returned an invalid result. | 267 |
| `ABORTED` | Ignore the stopped request result. | 268 |
| `INVALID_RESPONSE` | Auxiliary completion returned no text. | 270 |
| `ITERATION_AUTHORITY` | Helpers cannot acquire root authority. | 281 |
| `REQUEST_SCOPE_CLOSED` | The helper request scope has closed. | 283 |
| `ITERATION_CALL_LIMIT` | The helper node request bound was reached. | 289 |
| `REQUEST_CAPABILITY_MISMATCH` | The helper authorizes text completion requests only. | 290 |
| `BINDING_MISSING` | Resolve the activated helper model connection. | 299 |
| `REQUEST_MISSING` | The helper requires its bounded per-iteration request capability. | 302 |
| `PENDING_REQUEST` | The operation returned before its active request settled. | 314 |
| `WORKFLOW_FAILED` | The operation returned no result. | 316 |
| `INVALID_OUTPUT` | The operation returned undeclared output ports. | 318 |
| `INVALID_OUTPUT` | Output state and artifact must match the declared port. | 323 |
| `RECALL_PROVENANCE_FAILED` | The private recall source could not be retained. | 330 |
| `UNRESOLVED_INPUT` | A selected workflow output is unresolved; dependent work is held. | 342 |
| `WORKFLOW_FAILED` | Workflow preparation failed; inspect the source, connection and tokenizer. | 125 |
| `OUTPUT_MISSING` | The upstream output has not resolved. | 192 |
| `NATIVE_BOUNDARY_UNRESOLVED` | The owned native boundary has not completed. | 198 |
| `INPUT_SKIPPED` | A required branch input was skipped. | 202 |
| `TRUNCATED_OUTPUT` | Auxiliary output reached its completion limit. | 271 |
| `COMPLETION_UNVERIFIED` | Auxiliary output has no verified completion evidence. | 272 |
| `OUTPUT_UNRESOLVED` | An operation output is unresolved. | 338 |
| `OUTPUT_SKIPPED` | The operation produced no active output. | 338 |

### src/workflow/staged-effects.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_EFFECT_RESULT` | The effect capability must return a bounded Result. | 8 |
| `INVALID_EFFECT_RESULT` | The effect failure is malformed. | 8 |
| `INVALID_EFFECT_RESULT` | The effect success contains an error. | 8 |
| `EFFECT_CAPABILITY_FAILED` | The staged capability failed. | 9 |
| `INVALID_EFFECT_CONFIG` | Staged settlement requires a captured scope, evidence and trusted lifecycle callbacks. | 26 |
| `EFFECTS_REJECTED` | The proposed effects were rejected. | 27 |
| `CANCELLED` | Staged settlement was cancelled. | 28 |
| `STALE_EFFECT_SCOPE` | The captured workflow or user/chat scope changed. | 28 |
| `STALE_EFFECT_SCOPE` | The captured effect authority could not be checked. | 28 |
| `PUBLICATION_UNKNOWN` | The prior publication outcome is unknown; reconcile it before retrying. | 29 |
| `EFFECTS_ALREADY_PUBLISHED` | Accepted effects cannot acquire new intents during persistence recovery. | 33 |
| `EFFECTS_SEALED` | Acceptance has sealed this effect set; validate a new bundle to change it. | 33 |
| `INVALID_STAGED_EFFECT` | Use own plain effect metadata and trusted callbacks. | 36 |
| `INVALID_STAGED_EFFECT` | Effect settings require known own data fields. | 38 |
| `INVALID_STAGED_EFFECT` | The effect could not be inspected. | 40 |
| `INVALID_STAGED_EFFECT` | An effect requires stable intent/target identities, proposed data and trusted persistence callbacks. | 42 |
| `EFFECT_ID_CONFLICT` | This intent identity refers to a different proposed update. | 44 |
| `DUPLICATE_EFFECT_TARGET` | Combine updates to one target into one prepared projection before staging. | 45 |
| `EFFECT_BUNDLE_LIMIT` | The bounded effect collection is full. | 46 |
| `EFFECT_BUNDLE_LIMIT` | The combined proposed effects exceed the review bound. | 48 |
| `EFFECT_ACCEPTANCE_REQUIRED` | Canonical effects require accepted root settlement. | 55 |
| `INVALID_FINAL_EVIDENCE` | Final selected narrative evidence is required. | 56 |
| `FINAL_EVIDENCE_CHANGED` | Persistence recovery must keep the accepted final narrative unchanged. | 58 |
| `INVALID_EFFECT_RESULT` | Final evidence validation must return Result<void>. | 60 |
| `INVALID_EFFECT_RESULT` | Preflight must explicitly report ready or confirmed. | 68 |
| `PUBLICATION_UNKNOWN` | Publication threw without a verified outcome; no effects were persisted. | 72 |
| `PUBLICATION_UNKNOWN` | Publication returned a malformed result; reconcile its application before retrying. | 73 |
| `PUBLICATION_UNKNOWN` | Publication did not verify local application; no effects were persisted. | 74 |
| `INVALID_EFFECT_CONTROLS` | Settlement requires known own lifecycle controls and final evidence. | 94 |
| `EFFECT_PREVIEW_LIMIT` | The complete effect preview exceeds its bounded data contract. | 98 |
| `EFFECT_WRITE_UNKNOWN` | The persistence callback threw without a verified outcome. | 82 |
| `INVALID_EFFECT_RESULT` | Persistence returned no verified status. | 85 |

### src/workflow/story-time.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_DESTINATION` | Destination must be a forward safe-integer minute. | 14 |
| `OCCURRENCE_LIMIT` | Occurrence limit exceeded; hold the entire time projection. | 25 |
| `TIME_RANGE` | Derived calendar day exceeds safe-integer arithmetic. | 30 |
| `OUTPUT_LIMIT` | Occurrence data exceeds the bounded DTO budget. | 33 |
| `INVALID_PROPOSAL` | Use a plain duration or destination proposal. | 57 |
| `UNRESOLVED_TIME` | An explicit duration or destination is required. | 60 |
| `INVALID_PROPOSAL` | Use one nonnegative safe-integer minute value. | 61 |
| `INVALID_PROPOSAL` | Proposal contains ambiguous or unsupported timing fields. | 63 |
| `EVIDENCE_LIMIT` | Estimate provenance exceeds 64 sources; hold the entire time projection. | 80 |
| `INVALID_CLOCK` | Clock must contain bounded own plain data. | 106 |
| `INVALID_CLOCK` | Clock requires identities and safe-integer minute/calendar values. | 109 |
| `INVALID_CLOCK` | Clock schema version must be 1. | 110 |
| `INVALID_CLOCK` | Clock revision must be a positive safe integer. | 111 |
| `INVALID_CLOCK` | Clock time evidence must retain accepted provenance. | 112 |
| `INVALID_CLOCK` | Settled occurrence IDs must be a bounded string array. | 113 |
| `INVALID_CALENDAR` | This calendar uses minute units with minute zero at Day 1. | 115 |
| `INVALID_OPTIONS` | Options must contain bounded own plain data. | 122 |
| `INVALID_OPTIONS` | Occurrence limit must be an integer from 1 to 10000. | 124 |
| `INVALID_OPTIONS` | Consumed occurrence IDs must be a bounded string array. | 125 |
| `INVALID_SCHEDULE` | Schedules must be a bounded dense plain-data array. | 131 |
| `INVALID_SCHEDULE` | Each schedule requires an own schedule identity. | 135 |
| `DUPLICATE_SCHEDULE` | Only one active definition is allowed for each schedule identity. | 136 |
| `SCHEDULE_SCOPE` | Schedule clock and calendar must match the input clock. | 138 |
| `INVALID_SCHEDULE` | Schedule revision and order must be safe integers. | 140 |
| `INVALID_SCHEDULE` | Daily time must be inside the authored day. | 143 |
| `INVALID_SCHEDULE` | Interval needs a nonnegative anchor and positive cadence. | 145 |
| `INVALID_SCHEDULE` | Delay needs one nonnegative due minute. | 147 |
| `INVALID_SCHEDULE` | Use daily, interval or delay schedules. | 148 |
| `INVALID_POLICY` | Select an explicit catch-up or interrupt policy. | 158 |
| `OUTPUT_LIMIT` | Projection exceeds the bounded plain-data DTO budget. | 195 |
| `INVALID_EVIDENCE` | Evidence must be a plain record. | 199 |
| `INVALID_EVIDENCE` | Use a supported time evidence kind. | 201 |
| `INVALID_EVIDENCE` | Evidence contains unsupported or contradictory fields. | 203 |
| `INVALID_EVIDENCE` | Evidence origin must be nonempty text. | 205 |
| `INVALID_EVIDENCE` | Estimate acceptance policy must be accept or unresolved. | 206 |
| `INVALID_EVIDENCE` | Estimate lineage must contain distinct nonempty text origins including the current origin. | 209 |
| `UNRESOLVED_TIME` | Estimated or vague time needs an explicit accepted authored rule. | 212 |
| `INVALID_EVIDENCE` | Rule and extraction evidence must identify their origin. | 213 |

### src/workflow/subgraph-authoring.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_COMMAND` | Expected a qualified node selection. | 54 |
| `INVALID_INSTANCE` | Expected an explicit bounded containing graph path. | 55 |
| `INVALID_SELECTION` | Select existing unique nodes or groups. | 56 |
| `UNSUPPORTED_VERSION` | Subgraph authoring requires schema 3 and runtime 2. | 59 |
| `INVALID_INSTANCE` | The containing graph path does not exist. | 61 |
| `STALE_DEFINITION` | Supply the current exact containing definition pin. | 63 |
| `READ_ONLY_DEFINITION` | Make a local copy before editing this subgraph. | 64 |
| `INVALID_SELECTION` | Select actual current nodes and groups. | 66 |
| `DEFINITION_METADATA` | Definition version limit reached. | 81 |

### src/workflow/transactions.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `INVALID_CONTEXT` | A stable root ID is required. | 31 |
| `INVALID_CONTEXT` | Provide the active session ID, instance path and read-only state. | 33 |
| `READ_ONLY_VIEW` | This graph view is read-only. | 34 |
| `UNSUPPORTED_VIEW` | The qualified graph view does not exist. | 36 |
| `READ_ONLY_DEFINITION` | Make a local copy before editing this definition. | 37 |
| `CONTEXT_UNAVAILABLE` | Could not capture the active graph context. | 43 |
| `INVALID_PREPARATION` | Expected a plain prepared graph edit. | 57 |
| `MALFORMED_WORKFLOW` | The destination must remain a bounded plain graph. | 58 |
| `STALE_ROOT` | The destination graph was replaced. Prepare the edit again. | 60 |
| `CONTEXT_UNAVAILABLE` | Could not read the active graph context. | 62 |
| `INVALID_CONTEXT` | The active graph context is unavailable or malformed. | 63 |
| `STALE_CONTEXT` | The active graph session or view changed. Prepare the edit again. | 65 |
| `READ_ONLY_DEFINITION` | The qualified graph view is no longer owned. | 66 |
| `STALE_CONTEXT` | A child edit must explicitly identify its captured graph view. | 67 |
| `STALE_CONTEXT` | The prepared edit targets a different graph view. | 68 |
| `STALE_DOCUMENT` | The graph changed after import began. Prepare the edit again. | 69 |
| `MODE_MISMATCH` | Import requires the same phase. Open this workflow separately. | 72 |
| `UNSUPPORTED_EDIT` | A prepared edit cannot replace root identity, runtime authority, or other noneditable metadata. | 74 |
| `COMMIT_FAILED` | Could not commit the prepared graph edit. | 81 |

### src/workflow/workflow-data-defaults.js

| Code | Exact source literal | Line |
| --- | --- | --- |
| `STALE_DOCUMENT_SCOPE` | Workflow Data defaults require the original active user and chat. | 62 |
| `DOCUMENT_CATALOG_UNAVAILABLE` | Workflow Data defaults require the active user and chat. | 64 |
| `WORKFLOW_DATA_DEFAULT_CONFLICT` | The reserved Workflow Data target  | 80 |
| `DOCUMENT_CATALOG_UNAVAILABLE` | The host cannot create automatic Workflow Data defaults. | 84 |
| `DOCUMENT_CATALOG_UNAVAILABLE` | Workflow Data defaults could not be prepared safely. | 99 |
