## Task C: One Svelte workspace/controller

**Owner:** UI/controller worker.
**Files:** `src/ui/{controller,workflow-surface,workspace-preparation,workbench,node-palette,native-search-catalog,native-wire-bridge}.js` as needed; `ui/{Workbench,Toolbar,WorkspaceMenus,NodeShelf,WorkflowSetup,GraphTabs,entry,types.ts,view-types.ts,detail-types.ts}.svelte/js/ts`; `style.css`. Remove domain-surfaces.js/graph-analysis.js and DomainSurface/StatusBar/CanvasControls/WorkflowSurface components. Canvas components belong to B.
**Interfaces:** Keep public UI open/close/toggle/isOpen/refreshIfOpen; remove token/legacy preview exports. Keep pure current prepareWorkflowProjection/projectPreparedWorkflow/createWorkflowSession. Consume ROOT state and TaskA document/current result APIs, TaskB prepared Canvas/clipboard; report any required new state API before implementation.

- [ ] Add RED current component checks: single renderer/shell, no legacy mode/rows/components, no old schema2 selector, consistent frame/tab geometry and actual Setup examples.
- [ ] Rewrite mixed controller into current activation/captured transactions/managers/history/import/clipboard/menu/context/keyboard/field-draft actions; remove compiler/library/ST seeding/legacy inspector and preview code rather than hiding it.
- [ ] Render approved shell unconditionally and remove its native-only style gates/fallback tabs; use default Lattice palette and explicit custom-theme settings, unchanged qualified node details/preview/meter.
- [ ] Keep root execution across view changes, independent cameras/tabs, read-only library/instances, pending native gestures and current reviewed terminal targeting.
- [ ] Run focused component/projection/session tests, type checks after shared interfaces settle; report/freeze exact owned files.
