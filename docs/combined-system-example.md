# Combined editable systems

[Unified workflows](unified-workflows.md#combine-editable-systems-in-one-main) · [Node reference](node-reference.md#compose)

This standalone example combines a broken wand, an agreed eight-hour rain crossing and Rowan's private relationship state toward Iris in one Main. It is separate from the thirty numbered lessons.

Open the [editable document](../examples/unified/unified-combined-systems.lattice-document.json) through **File → Open workflow…** to retain Main and all three body tabs. The [portable workflow](../examples/unified/unified-combined-systems.json) contains the same wiring and pinned definitions for sharing. Both use existing workflow file formats.

## Prepare a disposable story

Select the actual Rowan NPC whose avatar is `rowan.png` and load Iris with avatar `iris.png`, or consistently edit the demonstration actor IDs to your loaded actors. Configure the Item Use Trigger, Model Call and confirmation helper model connections. The native reply uses your ordinary SillyTavern connection.

In **Workflow → Configure → Workflow Data…**, create and authorize these named JSON targets. The linked files are initial demonstration content, not live authority.

| Logical target | Scope | Initial content |
| --- | --- | --- |
| `wand-holders` | Public | [Accepted holder](../examples/unified/fixtures/combined-systems/wand-holders.json) |
| `wand-effects` | Public | [Fixed effect library](../examples/unified/fixtures/combined-systems/wand-effects.json) |
| `wand-outcomes` | Public | [Empty outcome list](../examples/unified/fixtures/combined-systems/wand-outcomes.json) |
| `lattice-default-clock` | Public shared default Chat clock | [Minute-zero clock](../examples/unified/fixtures/combined-systems/lattice-default-clock.json) |
| `rowan-relationship` | Actor private for selected `character:rowan.png` | [Directed relationship state](../examples/unified/fixtures/combined-systems/rowan-relationship.json) |

The workflow obtains current document references from these authorized targets. Importing graph or resource bytes does not grant file or actor access. Seed a fresh disposable clock; changing initial content does not reset existing saved time.

## Use the three systems

The Wand body confirms an actual player item use, checks the accepted holder and makes one event-keyed Random Pick from the live authored effect library. The supplied one-effect library makes the demonstration deterministic. Add existing fixed-effect records and weights to author more possible outcomes. Keep this reduced library fixed-only; the numbered broken-wand lesson demonstrates the wild-effect resolver.

The Weather body represents a specifically agreed 480-minute story wait. Run this version when the player agreed to that duration, for example:

> Rowan uses the broken wand. Rowan helped Iris repair the lantern. We wait eight hours.

Edit its authored duration for a different agreed wait. It is not a wall-clock timer or automatic elapsed time for unrelated replies. One accepted shared clock feeds both Weather and Relationship. Weather is the only clock writer; its genuine crossing begins rain at the supplied due minute.

Relationship stages private trust, desire, tension and excitement with the existing directed rules, caps, cooldowns, diminishing returns and elapsed-time decay. Desire is the existing dimension for lust-related state, with the same authored relationship pacing. The action is stamped at the accepted source clock minute. The pending eight-hour advance is not treated as already accepted relationship time. This body supplies no prompt text.

Main combines Wand then Weather into one guidance contribution for the native reply. An inactive branch skips its body Guidance, and Main's optional sections omit it. **Token budget** can cap that exact composition; overflow holds without shortening instructions.

## Review and save

Keep the configured workflow open, select **Enable Lattice**, and Send normally. At **Review / Publish · Host result**, compare the native reply and staged consequences. Before Apply, the outcome, clock and relationship changes remain proposals.

Apply saves the eligible accepted outcome, clock crossing and selected-actor state through Main's reviewed result. These are three separate receipts, not an atomic transaction across stores. Repeated Apply adds no model requests, random draws or confirmed writes. Reject, Stop, Preview and Run to here settle none.

To skip one whole body, select its wrapper and turn **Details → Run this system** off. Closing its tab only hides the editor view; connected enabled systems still execute. Save/Open retains the complete root, definitions, overrides and open tabs. Portable export retains composition and pinned definitions.
