# Connections and workflow comments

Connections follow direct, smooth curves between named pins, with short horizontal leads at each end. Backward connections form a compact returning curve. Wires can pass behind cards; hovering or selecting a wire highlights it and both endpoint pins. Ember's translucent charcoal cards let those wires show faintly through, while labels, icons and pins remain solid.

Select nodes, right-click a selected node, and choose **Add comment around selection**. You can also press **C** outside text inputs. With no nodes selected, C creates an empty comment at the canvas cursor or view location. The new comment's title is ready to edit.

Edit the title in the comment header, or select the comment to change its title, multiline notes, color and **Move contents** setting. Drag the header grip to move the comment and the lower-right handle to resize it. **Fit to contents** frames the ordinary nodes currently enclosed by the comment. Resizing and fitting change the frame without moving those nodes.

**Move contents** is on by default. A header drag moves the ordinary nodes fully enclosed below the header when the drag starts; that set stays fixed throughout the drag. Other comments stay in place. Turn Move contents off to move only the frame. The comment's interior lets you interact with nodes and connections through it.

To move a comment with a chosen set of nodes, select them together before dragging its header. A selected folded group moves with the set and stays folded. Undo restores the whole move in one step.

**Delete comment** removes the frame and leaves its nodes and connections in place. Undo and redo restore comment edits and moves. Copy/paste, saved workflows, and subgraph export/import preserve the title, notes, color, position, size and Move contents setting. To copy a comment with its nodes, select both.

Comments organize the canvas without changing workflow execution or grouping nodes for execution. Read-only comments can be viewed, but cannot be edited, moved, resized or deleted.
