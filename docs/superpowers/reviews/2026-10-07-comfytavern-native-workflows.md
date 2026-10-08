# Native workflows implementation review

Status: delivered in [draft PR #2](https://github.com/MentallyQuill/ComfyTavern/pull/2); implementation, independent review and acceptance evidence are ready for review. Product source is committed through 9524740. Main remains the integrated Svelte migration f5b3b61.

## Delivered scope

ComfyTavern adds schema-2 native workflows alongside the schema-1 legacy prompt engine. SillyTavern continues to assemble its normal prompt, run lore and extension processing, and generate the main reply. Auxiliary operations use fixed per-node or role Connection Manager bindings and operation-owned messages without globally activating a profile.

Two independent portable examples provide first-use setup: Scene Context → Smart Compactor → Response Plan → additive Guidance, and Reply Snapshot → the editable Pattern Scan/Repair/Validate Patches formation → Review Gate → manual Apply Reply. The pre example has a maximum of two auxiliary requests; reviewed repair has a maximum of one. Installation, import, assignment, discovery and camera movement make no model calls. Arming is separate from setup, and post repair remains manual.

Discovery uses Input, Shaping, Surface, Transpose, Derive and Output in that order. Transpose is intentionally empty in this release. Native JSON export removes local profile IDs; imports require local role setup. Legacy saved graphs and internal saved-data identity remain supported.

The Svelte migration from UI Performance PR #1 is integrated at main f5b3b61937997470a0e69fe5ee467ec08d73be04. Svelte receives projections and callbacks; the domain controller owns execution. Native camera regressions retain zero analysis, binding, freshness, token, lore and request work.

## Independent review record

The consolidated specification received an independent READY review before implementation. Contracts, request/compactor, repair, runtime/host, UI, and live-harness reviews each received READY after their bounded fixes. Closed findings include malformed package/formation data, completion and preservation evidence, repair rule/context integrity, stale and stopped swipe identity, Apply integrity, structured rule editing, and the live request boundary and attempt ledger.

Whole-branch review found three further integration issues: automatic Send results were absent from the results panel, legacy prompt-order seeding could invalidate native graphs, and Send/arm controls described legacy behavior in native mode. Commit c1cba11 adds qualified automatic-result retention and UI adoption, native seed guards, and shared mode-aware Send/arm state. Independent scoped rereview: READY for specification and quality, all three findings closed with no new findings in scope.

Production preflight also revealed an unused NanoGPT proxy selection was rejected. Commit 70a358f restricts the named-proxy guard to installed host sources that can actually use reverse proxies. The installed public source/backend confirms NanoGPT uses its fixed provider endpoint. Independent scoped rereview: READY; proxy-using routes retain their guard.

The live repair first returned fenced JSON, which strict validation correctly rejected. Commit 9524740 strengthens only the operation-owned instruction to require one raw JSON object without Markdown or surrounding text. Parser, span protections, original preservation, request limits and no-retry behavior are unchanged. Independent one-line review: READY. The temporary repair-only acceptance wrapper separately received a READY paid-guard review and passed five offline checks; it reuses the reviewed request boundary and leaves the production harness unchanged.

## Validation

Fresh full validation of c1cba11 passed: npm run check, 52/52 Node test files, 48/48 Chromium cases (33.4 seconds), zero type errors/warnings, 116-module production build (101.23 kB, gzip 29.27 kB), and 89 versioned asset checks. Installation smoke passed with 46 asset requests, zero API requests, public host helpers available, and no errors or missing assets. The rebuilt distribution has no content difference from the committed bundle.

The later one-line, unbundled repair instruction change passed the existing meaningful repair suite (1/1 file), syntax and scoped diff checks, followed by the successful production repair below. It changes no executable validation or UI logic. Distribution and source cache versions remain 0.19.0. Dark/light and narrow/wide visual checks, keyboard/focus preservation and source freshness checks are covered by the accepted UI reports and browser suite.

## Live acceptance

See [sanitized evidence](2026-10-07-comfytavern-live-evidence.json). Functional acceptance is demonstrated across separately authorized sessions; no single all-in-one session is falsely labeled passed.

- Earlier plain and thinking model canaries succeeded. They are distinct from production workflow acceptance.
- The first production session stopped at the unused-proxy preflight before reserving or admitting a request.
- The corrected pre workflow passed using NanoGPT GLM 5.2 for compression and GLM 5.2 thinking for planning. A protected literal stayed intact; host-tokenizer counts were 80 against a 700-token compaction target and 153 against a 768-token guidance budget. Provider usage totals were 978 and 333 tokens, with stop completion. The accompanying repair returned fenced JSON and was rejected, retaining the unchanged draft.
- After the explicit format instruction, one deliberately authorized repair-only request passed with ordinary canonical starter instructions and strict production validation. It returned a raw indexed patch, producing “The lantern was a tribute to the keeper's patience. The gate stayed shut.” Original/source identity, unselected text and review-required constraints passed. Usage was 160 prompt/15 completion/175 total tokens, stop completion, about 3.8 seconds. Apply was never invoked.

The conservative ledger is 7 of 8 attempts, with one unused and all live work stopped. No implicit retry occurred. Provider cost fields are metadata, not a verified billing total. Existing default-user NanoGPT secret references were reused inside the host; no credential values were fetched or copied. No private chat, personal prompt, active profile, installed extension, native Send or Apply was changed by live acceptance.

## Deliberate limits

Repair targets the latest completed text-only assistant reply and requires explicit review and Apply. Original and unselected text are preserved. Apply adds a swipe and reports local success separately from the host's unverified persistence acknowledgment. Memory extensions may already have consumed the original reply and are not guaranteed to re-extract a revision.

Lossy host response wrappers, unisolatable proxy routes and unsupported text-completion conversions fail preflight. There are no implicit retries. A full prompt converter, the larger research node pool, richer Transpose operations and nested macros remain deferred.
