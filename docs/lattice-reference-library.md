# Reference tools and reusable workflows

Transpose applies an example or convention to a completed reply. Every edit produces source-bound Patches and follows Validate Patches -> Review Gate -> explicit Apply Reply. Installing a workflow does not assign it to a phase or enable it.

## Transpose

| Operation | Inputs | Output | Calls |
| --- | --- | --- | --- |
| Style Transfer | Draft, reference Text or Data; optional Context | Patches | At most 1 Prose |
| Format Transfer | Draft, example Text or Data template; optional Context | Patches | At most 1 Prose |
| Terminology Map | Draft, Data glossary | Patches | 0 |

Style modes are narration, character voice, rhythm and register. Narration is the default editing scope. Character Voice's shelf preset explicitly selects dialogue; changing the mode afterwards keeps the current scope. Strength, instructions and protected wording are independent controls.

Format Transfer uses material already present. Data templates can include `requiredContent`, an array of exact strings that must occur in the original draft. Missing content fails before a request. References supply expression and structure, not additional story facts.

Terminology Map consumes Data such as `{"entries":[{"from":"Captain","to":"Commander"}]}`. Choose word/phrase matching and case sensitivity. Replacements are simultaneous: A-to-B does not cascade into B-to-C. Compose -> JSON Decode can supply Data; Compose Text can supply a prose reference. An occupied Text reference pin cannot silently become Data: explicitly disconnect or replace the incompatible wire.

## One cleanup operation, three modes

Repair retains repair/scan and adds:

Legacy repair/scan use the incoming Draft's existing permissions. Scope, policy categories, case matching and the optional Context pin appear for the three cleanup modes below.

| Mode | Behavior | Calls |
| --- | --- | --- |
| Inspect | Report source-offset literal matches; preserve the original | 0 |
| Contextual Cleanup | Revise formulaic uses while preserving meaningful events and deliberate voice | At most 1 Prose |
| Strict Avoidance | Request alternatives within permitted text and report remaining/uneditable literal matches | At most 1 Prose |

All use the complete policy: 14 categories, 273 source occurrences, 271 unique entries, 17 templates and 2 behavioral policies. Duplicate entries retain their category memberships. Empty categories selects all; categories and narration/dialogue/whole scope are independent of mode. `authorized` uses existing permissions without constructing raw snapshot permissions.

Literal inspection respects Unicode word boundaries, so `adequate` does not match inside `inadequate`. Straight/curly apostrophes and quotes retain original UTF-16 offsets. An occurrence is a match, not a semantic defect. Inspect reports that templates and behaviors need semantic assessment; it does not claim to diagnose them without a model.

The prose writer receives selected typed policies and optional Context. Preserving facts, actions, chronology, refusals, voice and user agency is a model instruction and review responsibility. Local checks enforce source identity, permission windows and protected wording; they do not certify meaning. Strict reports distinguish original uneditable wording from remaining candidate matches. No retry forces an edit. Empty permissions makes no request; failed, incomplete, ambiguous or cancelled output produces no authoritative proposal.

## Reusable packages

| Subgraph | Interface | Default bound |
| --- | --- | --- |
| Context Lens | Context -> Context | 0; compression adds 1 Analysis |
| Scene Compass | Context -> Guidance | 1 Analysis; compression adds 1 |
| Literal Cleanup | Draft -> Candidate | At most 1 Prose; no matches means 0 |
| Formatting Cleanup | Draft -> Candidate | 0 |
| Prose Cleanup | Draft and optional Context -> Candidate | 1 Prose; Inspect/empty permissions means 0 |

Import packages from [examples/library/subgraphs](../examples/library/subgraphs/) with the existing Subgraphs manager. Definitions have verified identities and pinned dependencies; model bindings remain unresolved until configured. Reusable bodies contain neither root sources nor Apply authority.

The workflow starter picker offers Scene Compass, Literal phrase cleanup, Formatting cleanup and Prose cleanup. Complete files are in [examples/library/workflows](../examples/library/workflows/). Context Lens is a utility without a standalone Guidance workflow. The existing Literal cleanup starter remains a separate deterministic Text Rules example.

Literal Cleanup defaults to `the words hung in the air`, `the tension was palpable`, and `something unreadable`, in narration. Formatting Cleanup defaults to CRLF -> LF with explicit whole scope; supplied permissions and protected wording still narrow it. Prose Cleanup defaults to contextual/narration. Inspect changes before accepting them.

Pattern Scan now narrows supplied permissions and retains upstream protections/exemptions. Draft Text Rules requires existing permissions or explicit scope construction and reconstructs original parent patches. Whole scope cannot expand permissions already present, including an empty span list.

## Categories and maintenance

The category editor accepts source category IDs, one per line. See [the canonical policy](../data/ai-slop-policy.json) for labels and entries. Source wording is data. The browser policy module is generated from the JSON and checked for equality by tests.

Introspection and actor memory/state are being implemented by their separate chat and are outside this branch.
