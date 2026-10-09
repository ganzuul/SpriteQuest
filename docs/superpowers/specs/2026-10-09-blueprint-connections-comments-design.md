# Blueprint connections and workflow comments

Approved by the user on October 9, 2026. This chat owns connection rendering and comments; coordinate shared integration files with Finish Lattice native-only cleanup. User authorized normal integration and push to main after verification.

## Connections

Use direct smooth Blueprint-style curves, with brief horizontal departure and arrival at named pins. Keep forward paths compact. Backward and equal-height connections use a compact smooth returning bow; never collapse into a doubled-back straight line. Do not add automatic perimeter lanes or global obstacle avoidance. Wires may pass behind cards after leaving the pin clearly.

Use cached graph geometry. A shared route result supplies the visible spline, drag preview, hit target, and route-aware label position. Hover/selection highlights the wire and both endpoint pins. Node backgrounds are approximately 92% opaque; text, pins, borders, selection and run indicators stay opaque. Preserve native connection validation, rewiring, portals, and reroutes.

## Comments

Select nodes and invoke Add comment around selection from their context menu, or press C outside text inputs. With no selection, add an empty comment at the graph cursor/view location. Frame the selected measured bounds with 24 graph pixels of padding and a header. Focus the editable title after creation.

Provide title, multiline notes, restrained color, resize handles, fit to contents, and a move-contents toggle. Header dragging moves fully contained ordinary nodes using a snapshot captured at drag start when enabled. Interior does not intercept node or wire interaction. Deleting a frame never deletes its contents. Comments do not change execution membership, graph validation, semantic identity or stale-run state.

Represent frames as existing nonexecuting note nodes with commentFrame: true and moveContents: true by default. Persist authored title/content/rectangle/color and frame settings through undo/redo, clipboard, workflow and subgraph export/import. Ordinary notes keep their existing presentation. Do not attach frames to execution groups. Comment editing obeys the existing qualified document/edit/read-only rules.

## Delivery and evidence

Use the native-only cleanup checkpoint as the implementation base and coordinate current interfaces before shared integration. Keep unrelated primary changes intact. Verify curve behavior for backward/equal-height/close/vertical/compact/multiport cases and zoom; verify comment selection, editing, movement, resizing, delete-only behavior, clipboard/export/undo, execution neutrality, and read-only/scoped documents. Run Node, type, build, asset and browser checks, visually inspect actual output, independently review, then integrate normally and verify remote main SHA. No force push.
