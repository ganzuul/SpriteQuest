# Roleplay example workflow review

All 30 catalog entries and their 37 Pre/Post packages were reviewed and exercised. Every phase now has a completed native execution. Model-backed stages used the authorized NanoGPT `z-ai/glm-5.2:thinking` connection in a separate regular SillyTavern account. The final example 30 Pre execution combines one exactly matched, previously accepted character appraisal with one new scene appraisal; it is explicitly recorded as a hybrid execution.

The review found real authoring, freshness, diagnostic, prompt-grounding and completion-budget defects. These were corrected and retested. Successful execution establishes the graph's behavior for the tested fixtures. It does not make model-written guidance a validator of story facts or player agency.

## Changes

- Replaced six literal-only Compose sources with editable Text nodes. Example 3 now teaches ordered Trim → Unwrap fence modifiers before strict JSON decoding. Corrected the inaccurate Curve example reference and the blend lesson's source description.
- Added 13 missing supplemental evidence connections so the memory lessons feed the same State, Episodes and Context evidence into Reflect and Express. Example 22 shares the root State reader rather than reconstructing unrelated evidence.
- Guarded publication against changed actors, avatars, selected cards and invalidated selected memory evidence, including evidence outside the recent-message window. Historical records remain available; unrelated invalidated records do not block valid recall.
- Preserved safe completion error codes through introspection. Truncated, empty, unverified and oversized completions now report their actual bounded failure rather than collapsing into a generic request error. Unknown provider messages remain untrusted.
- Added concise raw-JSON instructions to Reflect and Internalize, exact event/revision requirements, bounded reflection arrays and restrained memory proposals. Defaults, node details and subgraph overrides agree.
- Increased completion headroom where GLM's reasoning consumed the original caps. The four demanding prose examples 9, 13, 14 and 16 use 8192; model memory writers and example 30's voice pass use 4096. Most Plan/Reflect stages use 2048, with targeted 4096 caps for examples 8, 28, 26 Pre and example 30's scene child. Its character child remains 2048. Example 27's fictional prose cap is 1024. Call ceilings and Guidance budgets remain unchanged.
- Corrected unsupported staging in examples 5 and 6, historical-summary leakage and seal/location mistakes in 17, and invented inspection rules in 28. Both example 30 appraisals now distinguish departure/absence from arrival, progress, lateness and elapsed waiting. Example 15 specifies same-line `MIRA:` formatting; example 18 consistently requests at most two items per reflection array.
- Gave example 8 a final-plan target of 180 words within its unchanged 400-token publication budget. The final sample used 169 words and 238 native tokens.

All changes preserve the approved names, increasing curriculum complexity, customized nodes, comment groups, six embedded definitions and editable example-copy loading.

## Live scope and accounting

Account: `lattice-examples-soak-20261009`, a separate non-admin account. Existing accounts and chats were preserved. SillyTavern 1.19.0 ran locally with the selected NanoGPT connection and `Wandlight-1.8` preset. Native Lattice auxiliary calls use their node-owned prompts and inherit the selected preset's sampler settings: temperature 0.7, top-p 0.8 and medium reasoning. The ordinary UI Send used the full Wandlight prompt arrangement.

The user initially authorized 64 cumulative requests and explicitly increased the ceiling to 80. Exactly **80 requests** were used: **79 auxiliary provider requests plus one ordinary browser UI reply**. All 79 auxiliary transports were accepted by the backend; no authentication or transport failures occurred. Forty-eight auxiliary completions passed their operation's completion boundary; 31 failed, principally due to completion limits. Every original failure remains in the ledger. No reservation is unfinished and no automatic provider retry occurred.

| Revision | Phase checks | Completed | Failed | New auxiliary requests |
|---|---:|---:|---:|---:|
| Baseline | 37 | 11 | 26 | 30 |
| reasoning-caps-v2 | 26 | 21 | 5 | 29 |
| reasoning-caps-v3 | 4 | 4 | 0 | 4 |
| grounding-v4 | 8 | 5 | 3 | 10 |
| persisted-memory-v4 | 2 | 1 | 1 | 2 |
| reasoning-cap-v5 | 4 | 4 | 0 | 4 |

The final revision's four new calls cover ensemble planning, the context lens, the scene half of example 30 and example 26's saved-memory Pre run. Example 30's successful character response from attempt 72 was reused only after verifying the exact stage address, model, completion cap, messages and resulting transport payload. It passed through the native completion adapter with its recorded `stop` finish. Neither a failed nor a partial completion was reused.

Auxiliary provider-reported usage totals **55,825 prompt tokens, 99,298 completion tokens, including 85,368 reasoning tokens**. The ordinary UI reply did not expose usage. Reported cost fields were zero; they are retained as received and are not treated as a billing estimate. The final ledger enforces the exhausted 80-request ceiling.

## Per-example results

Revision abbreviations: **B** baseline, **C2/C3** reasoning-caps revisions, **G4** grounding-v4, **C5** reasoning-cap-v5, **M4** persisted-memory-v4. Every row has a completed execution; these notes distinguish runtime completion from observed model behavior.

| # | Example | Completed phases | Observed behavior |
|---|---|---|---|
| 1 | Make a scene brief | Pre B, zero calls | Deterministic scene guidance preserves the unopened letter and open player choice. |
| 2 | Replace a repeated phrase | Post B, zero calls | Configured literal repair produces a review candidate; explicit Apply retains the original swipe. |
| 3 | Build a brief from JSON | Pre B, zero auxiliary calls | Text modifiers feed strict JSON decoding and exact guidance. Separate ordinary browser Send completed all five stages and one main model reply. |
| 4 | Apply a names-and-terms glossary | Post B, zero calls | Configured terms are repaired while the protected painting title remains unchanged. |
| 5 | Plan an open-ended NPC response | Pre G4 | Repeated question leaves Rowan's answer open; unknown barrier state and positions remain unknown. |
| 6 | Suggest the next scene beat | Pre G4 | Map bargain is a proposed next beat, with no accepted deal, recovered map or revealed chest contents. |
| 7 | Plan a clear action sequence | Pre C2 | Supplied table, doorway and exit orient the scene without a resolved strike, defense or player movement. |
| 8 | Plan an ensemble scene | Pre C5 | Mira/Sol are the potential focal voices; others remain ambient and repayment/player response remain unresolved. Final guidance fits the native budget. |
| 9 | Draft a shorter reply | Post C3 | Shorter draft preserves slow handle-turning, waiting and the unresolved latch; original swipe retained. |
| 10 | Revise descriptive detail | Post B | Sample develops supplied physical details and preserves the original dialogue and positions. |
| 11 | Revise quoted dialogue | Post B | Quoted speech changes while surrounding narration/actions remain intact. |
| 12 | Use a dialogue voice reference | Post B | Dialogue follows the voice reference without importing its scene events or props. |
| 13 | Revise an emotional beat's pacing | Post C3 | Sentence rhythm changes; envelope stays unopened and the supplied spoken words remain. |
| 14 | Try a closer narration viewpoint | Post C3 | Cold latch moves into the foreground without new private knowledge or imported reference props. |
| 15 | Try screenplay formatting | Post G4 | Kitchen/night and closing-door action remain; `MIRA: They're here` uses the requested same-line format. Punctuation adapts when attribution is removed. |
| 16 | Combine two style references | Post C3 | Rhythm and a restrained wind image preserve the gate, waiting and absent courier. |
| 17 | Prepare a scene recap | Pre G4, two calls | Forced historical compaction uses its chunk alone; final guidance keeps the seal and treats Rin's departure as departure only. |
| 18 | Suggest a character reaction | Pre G4 | Arrays contain at most two items; inferred feelings/staging are interpretations and practical responses stay optional. |
| 19 | Explore competing motives | Pre C2 | Sol's presence does not become witnessed entry, guilt or exoneration; proposed witness response respects limited knowledge. |
| 20 | Record injuries and fatigue | Post C2; Pre M4 | Acknowledged injury state is read from the actual saved Post file. Published support options preserve injury and avoid assumed recovery. |
| 21 | Recall promises about a topic | Post C2; Pre B plus saved-file reload | Promise is stored as a commitment, not completed arrival. Zero-call Pre reload reads the actual acknowledged Post metadata without reseeding. |
| 22 | Suggest a memory from a cue | Pre C2 | Harbor-lamp episode remains a recollection distinct from the present cabin; no invented father/boarding episode. |
| 23 | Consider recovery after an apology | Post/Pre C2 | Accepted easing-anger proposal retains guarded trust and the letter boundary. Model Pre uses an independently seeded fixture; offline tests cover the paired memory behavior. |
| 24 | Record relationship patterns | Post/Pre C2 | Kept promise suggests possible reliability without erasing earlier disappointment or settling trust. Saved Post state was checked; model Pre uses an independently seeded fixture. |
| 25 | Count settled messages | Post/Pre B plus saved-file reload, zero calls | Two distinct eligible IDs are counted; actual persisted counter reload works without reseeding. Replay does not duplicate increments. |
| 26 | Recall an offscreen plan | Post C2; Pre C5 | Actual saved version-2 Post state reaches Reflect. Keeper's reported lack of knowledge does not establish the ferry's location; search/player response remain unresolved. |
| 27 | Draft a fictional inner voice | Pre C2, two calls | Fictional 49-word passage is separated from spoken dialogue, player thoughts and memory writes; it adds some fictional props. |
| 28 | Build a reusable context lens | Pre C5 | Reusable selection feeds grounded current facts; no Rin arrival or invented letter-inspection obligation. New actions are labelled optional. |
| 29 | Build a reusable reaction brief | Pre C2 | Embedded Reflect → Behavior definition keeps seal/promise and leaves permission with the player. |
| 30 | Combine memory with a voice pass | Pre C5 hybrid; Post B | Exact accepted character replay plus new scene appraisal preserve tentative trust, sealed letter and unresolved absence. Quote-only Post voice change retains narration and original swipe. |

All five live model-backed Post proposals (20, 21, 23, 24, 26) applied the exact proposed deltas with acknowledged version increments, matching actor/chat scope and valid event/revision references. Unrelated numeric maps and traits were preserved. Model-backed saved-file Pre checks for 20 and 26, and zero-call saved-file checks for 21 and 25, assert unchanged chat/state and zero extra writes. These are native fixture reloads from the real account's JSONL files; they are not a browser/server restart soak.

## Remaining model qualifications

The major incorrect location, seal and inspection-rule assumptions were corrected in the retested samples. Some optional or interpretive material still exceeds strict supplied facts: example 8 introduces a possible door sound and paper pause; 28 proposes gate hardware/water-watching details; 30's scene assessment says Mira holds the returned chart, although its current hand placement is unspecified. Example 20's raw assessment infers a cabin transition that is not rendered in its final guidance. Example 17 calls the expected history/recent split a “Summary/report conflict.” Example 27 intentionally generates fictional prose with additional props.

These are reasons to review model suggestions, and to keep the catalog's modest “plan,” “suggest,” “try” and “draft” names. The graphs preserve effect boundaries: guidance is advisory, prose changes require a review/apply step, and a completion with `length` is discarded rather than treated as complete. The finite fixtures do not establish reliable model compliance for every prompt or provider.

## Verification and evidence

- Full Node suite: **169/169 files passed**. Final focused run after all cap revisions: **12/12 files passed** covering example execution, authoring, freshness, memory, prose, reuse, catalog, live budget and completion diagnostics.
- Dedicated native behavioral suites cover all 30 IDs, all 37 phases and all six definitions, including protected prose, review/application, persistence, replay, actor override, invalidated evidence and forced compaction. Simulated model responses prove pipeline/effect behavior; they are not evidence of model semantics.
- Independent final source review: all 37 portable packages exactly match bundled example data; 33 resolved request stages and call ceilings remain intact. Targeted defects had failing regressions before their fixes.
- Focused browser examples suite: **8/8 tests passed**. All tiles load editable independent copies with companions, without model calls; reopening, keyboard use, error recovery and subgraph editing were exercised.
- Final `npm run check:types`: **0 errors, 0 warnings**. `npm run check:assets`: **307 versioned local imports verified**. Isolated Vite build: **158 modules**, successful. The isolated output preserves existing uncommitted `dist` work. `git diff --check` passed; Git emitted existing LF/CRLF conversion notices.
- The ordinary UI integration loaded example 3 through File → Open examples, ran it, armed its Pre phase and sent one synthetic message using the real connection. Lattice displayed **5/5 completed stages, 0/0 auxiliary requests**. The account was disarmed afterward and left available for inspection.

Artifacts:

- [Full live ledger, outputs, native recordings and saved-state evidence](2026-10-09-roleplay-example-live-soak.json)
- [Exact saved-output replay proving the example 8 token-counter correction](2026-10-09-roleplay-tokenizer-replay.json)
- [Actual saved Post → zero-call Pre reloads for 21 and 25](2026-10-09-roleplay-memory-reload.json)
- [Ordinary browser UI integration evidence](2026-10-09-roleplay-ui-integration.json)
- [Compact examples picker browser evidence](2026-10-09-roleplay-examples-picker.png)

Reusable test commands:

```text
node tools/test-all.mjs workflow-example soak-roleplay roleplay-soak introspection-completion ui-examples ui-example-catalog
npx playwright test tests/browser/examples.spec.mjs --output .tmp/roleplay-example-browser
npm run check:types
npm run check:assets
npx vite build --outDir .tmp/roleplay-review-build
```

The current live ledger is exhausted. Do not launch more provider calls against it without a new explicit allowance.
