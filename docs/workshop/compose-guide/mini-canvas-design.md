# Node guide previews

Workshop design, illustrated by Compose. Production integration is pending.

## Guide layout

Keep the help button in the selected node's Details header. Hover gives a short hint; click opens the guide. Show the actual Compose node, fixed in place, after the introduction and before **How to use it**. It reflects the selected node's current configuration and has no canvas chrome.

**Settings and options** starts expanded. **Example** follows it and starts collapsed. The example uses the full section width and current theme. Render it through the actual production graph canvas with the complete five-node workflow from [compose-example.lattice.json](compose-example.lattice.json): On Send → Generate Reply → Review / Publish, plus Text → Compose → Generate Reply's Guidance input.

Place **Add example to current tab** in the canvas footer. Omit zoom and Fit buttons, help and pan instructions, and zoom percentages. The workshop button demonstrates a merge into a local preview; it does not change an app tab.

## Rendering

Use the production graph canvas, node components, ports, and connection router. Load and prepare the complete example through the current operation catalog so its cards, wiring, and appearance match the app. Keep the top node preview fixed and separate from the example canvas.

Mount the example when its disclosure opens, update it for the current theme and section width, and release its resources when the guide closes or changes nodes.

## Adding the example

Capture the current editable tab and view when the button is clicked. Prepare and validate the whole addition before making one undoable commit. Reject a stale destination if the tab or view changes before commit. Adding the example does not execute it.

An empty root receives the complete five-node workflow. In an existing compatible root, preserve its On Send → Generate Reply → Review / Publish lifecycle. Insert the configured Text and Compose nodes with fresh IDs, preserve their internal connection, and connect Compose automatically to the existing Generate Reply's free Guidance input. Validate the resulting workflow before committing. Place and select the added nodes in clear space.

If Guidance is occupied, the target is incompatible, or the destination is read-only, disable the action and give a clear reason. Never overwrite an input or silently open another tab.

## Running and verification

The guide gives a complete route to a reply: import the full workflow into an empty root, enable Lattice, send an ordinary chat message, then inspect and apply the reviewed candidate in Preview. **Run to here** on Compose is an optional check of the assembled instruction. Its recorded output is:

```text
Describe the dark lighthouse and one sound from the water.

Leave the player's next action to them.
```

Verify the fixed top node, disclosure defaults, section order, full-width production canvas, current theme, footer action, and pin-attached wires. Check the empty-root addition, compatible guided merge, and disabled states. Confirm a single validated commit preserves the existing lifecycle and connects Guidance automatically.

Record mock host verification separately from live generation. The mock host check verifies execution, exact Guidance delivery to Generate Reply, and a Review / Publish candidate reaching settlement. It does not publish to a real chat. Confirm an actual generated reply in a live host before claiming live generation works.
