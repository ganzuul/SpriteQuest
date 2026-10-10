# Node connection profile controls

Approved reference: `C:/Users/Keptin/.codex/visualizations/2026/10/10/01a12424-520a-7b53-8e1e-37fc337c9487/connection-profile-search.html`.

Every node whose current operation makes a model request has a grey profile bar directly below its native card and small muted model-only text directly above. Non-model nodes have neither control. Preserve native node and pin geometry; decorations follow dragging, pan, zoom, compact presentation, nested navigation and collapsed groups.

The bar shows the effective profile name, truncates with a full-name tooltip, and opens a 330px opaque dark popup. Match the reference's spacing, typography, colours, selected checkmark, search field, and capped scrolling results (244px). No footer or helper paragraph. Adapt to available space without clipping the list. Search supports case-insensitive AND keywords across saved profile name, API label and model; rows wrap their full names and show provider/model subtitles.

The first option is always **Active SillyTavern model**, including during search. Its subtitle is **Follows SillyTavern’s current model**. Newly created model-capable nodes explicitly select this option. It follows the active SillyTavern connection and model at request time; existing fixed profiles, legacy role inheritance and explicit instance blocks retain their meanings. The text above a node shows only its resolved model, and hides when no model is detectable. Preserve a separate optional node model override.

Selecting a profile affects only that node/occurrence, persists, and supports Undo/Redo. Pinned nested instances write an override on the owning root wrapper rather than modifying shared definitions. Read-only library entries remain read-only. Missing profiles display an unavailable selection and never silently fall back.

Wheel input over results scrolls the list and never pans/zooms the canvas, including list boundaries. Clicking outside closes without changing the binding. Escape closes the list; arrow keys move the active result and Enter commits. During a keyword search, Enter chooses the first matching saved profile unless the query targets the active-model option. Controls cannot trigger dragging, wire creation, canvas context menus, deletion, or workbench dismissal. Changing views/documents invalidates stale popup actions.

Use current host profile metadata; do not hardcode personal default-user profiles in production. Refresh displayed profile/model metadata after relevant host settings changes. Active requests must preserve cancellation, bounded output, freshness authentication and completion evidence. Never activate a saved profile or mutate global host settings to make an auxiliary request.

Acceptance requires targeted behavioral tests, complete project checks, independent code review, and screenshots of the real running UI compared with the approved mock at normal and narrow widths and under a nonidentity camera.
