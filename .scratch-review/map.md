# The map

What the world map is made of, which of its parts get drawn at all, and what
was decided about it on 2026-10-09.

> **What this document is.** A record of decisions, each with its date and its
> scope, followed by the questions those decisions leave open. It is **not a
> policy**: nothing below is written to generalise past the map, and no
> decision here is stated with *always*, *never* or *must* outside a quotation.
>
> **Recording a decision does not promote it.** Writing one down here makes it
> a decision about the map; it does not make it a constraint on anything else,
> and it does not make it true of the next asset class. A decision meant to
> bind work outside the map would be a rule, and rules are earned separately —
> see `library/README.md`, "Hard rules and underdetermined findings", where a
> rule that persists is a milestone rather than a default.
>
> Companion to `docs/production.md` (the asset forge and its four
> conventions), `docs/prior-art.md` (where the hex came from) and
> `docs/design.md` (what the game is).

## The premise, as stated

> The map is not a satellite image. It is a game map. We do want the terrain
> to be coherent, yet the tiles for scenes do not need to be coherent with
> the terrain. The scene tiles get placed on a tile base and placed on the
> location of the terrain.

Recorded verbatim and dated **2026-10-09**, because it is the premise the
two decisions below were taken against, and a paraphrase of it would drift.
The third entry under *Decisions* is not a decision from this conversation and
says so.

## Two layers

The premise separates the map into two things that are drawn for different
reasons. The cells below say only what the premise itself says:

| Layer | Answers | What the premise requires of it |
|---|---|---|
| **terrain base** | *where* | coherent with itself — one continuous surface |
| **scene tile** | *what* | not required to be coherent with the terrain underneath |

The premise is silent in two directions, and both silences are recorded here
rather than filled in:

- **It does not require a scene tile to agree with other scene tiles.**
  Whether scene tiles share an eye line with each other is a separate question
  that the premise does not reach. It is listed under *Open*, not settled by
  this table.
- **It does not say the two layers will look unrelated.** Whether a scene tile
  reads as one picture with the ground it sits on, once placed, is untested —
  no map render exists (see *Not run*).

"What the premise requires" is therefore a narrower column than it looks. It
records an obligation only where one was stated.

## Decisions — 2026-10-09

**1. The map's camera is fixed, orthographic, and does not rock.**

Scope: renders belonging to the map.

This is a different setting from the scene look, which `docs/production.md`
states as "forced but not fixed perspective" — each plane painted to a fixed
eye line, with the camera rocking through a small arc so the layers shift.
Both are *forced*; the map drops the *not fixed* half. Whether the two
settings produce a picture that agrees is listed as open below rather than
assumed either way.

**2. A scene tile is a marker placed on the map.**

A small isometric vignette — a village, a ruin — sitting on a tile base at
the terrain's location, comparable to an improvement graphic in a
Civilization game. It is not the playable scene: nothing walks around inside
it while it is on the map.

Scope: what counts as a scene tile. It does not say anything about how a
scene is built when the player is in it, which `docs/production.md` owns.

**3. The hex outline is not prompted — recorded, not decided here.**

This one is inherited rather than taken. `docs/prior-art.md`, "The hex-game-map
ancestor — 2026-10-09", reached it from three implementations that agree the
hex is a mask, an overlay and a coordinate system rather than a feature of the
ground, and concluded there that a hex tile needs no description of its own
shape. The outline is applied in compositing, alongside the ground line.

Scope: what `prior-art.md` says it covers — prompts. Placement is a coordinate
rather than a drawing.

It is listed so the three entries under *Decisions* are visible together, but
the fact that it sits beside two decisions from this conversation does not make
it one of them, and does not widen its scope.

## Open

Listed as questions, not settled by the decisions above. Under the asymmetry
in `library/README.md`, none of these is a defect; they are shapes the design
has not taken yet.

| Question | Why it is open |
|---|---|
| Do scene tiles share an eye line with each other? | The premise does not reach this: it speaks to the relationship between a scene tile and the terrain, not between scene tiles. Nothing has stated an obligation in either direction, so the question is open rather than answered yes or no. |
| Do the map's and the scene's eye lines agree? | Convention 1 says "3/4 view from slightly above" and `REFERENCE_STYLE` says "three-quarter isometric"; the map now adds orthographic. Whether one pose satisfies all three, or whether the scene's camera arc pulls them apart, has not been compared. |
| What keeps neighbouring tiles in agreement? | A prompt clause held a prop batch together in appearance. Two tiles that share an edge are a harder case and have not been tried. Candidates: a camera clause in `style`, geometric conditioning (`docs/depthmap-experiment.md`), or fixing it in compositing. **No mechanism chosen.** |
| Do independently rendered tiles blend at a shared edge? | Flagged as unchecked in `docs/prior-art.md` — noted there as a recorded divergence from Unciv, which layers per tile type across the whole map rather than compositing separate renders. |
| What is a hex in world units? | Convention 3 (scale reference) is unset in `docs/production.md`; the map needs a tile size before anything placed on it can be scaled. |
| Where does a marker touch the ground? | Convention 4 (ground line) is unset. For a standee, contact is added in compositing; whether a marker is treated the same way is undecided. |
| Do markers use the existing cutout path? | They have to sit on terrain, which argues for the same isolation clause and alpha-matting route used for props — but that is reasoning about a render that has not happened, not a decision. |
| Does the map need its own style clause? | `STYLE_CHOICES` in `tools/render_props.py` holds `prop` and `reference`. A third would be a third deliverable, and nothing has needed one yet. |
| What facet, if any? | `tools/check_library.py` closes `FACETS` at four while `tools/add.py` offers a fifth (`cutout`). A map facet would be another addition to a vocabulary still being settled, so it is underdetermined rather than wrong. |

## Not run

**No map render exists.** Nothing on this page has been tested against an
image: no terrain base, no scene tile, no pair of adjacent tiles. The two
decisions above were taken against a stated premise, and the premise itself
has not been exercised.

The smallest check that could fail is two terrain tiles rendered separately and
placed edge to edge: it would speak to whether they agree at the seam and
whether they agree about the eye line, which are two of the open questions.
That is an observation about which experiment would be informative, not a
staged plan — no such render has been scheduled here.
