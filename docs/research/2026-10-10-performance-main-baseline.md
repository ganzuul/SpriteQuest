# Latest Main editor latency baseline

Date: 2026-10-10. Main: `143ec11cdd35c5478990198d51823f1076922bd7`. Branch: `codex/lattice-performance-overhaul`.

This is the baseline for the [performance overhaul design](../superpowers/specs/2026-10-10-lattice-performance-overhaul-design.md). No product source changes were made. Main was rebuilt for the measurements; generated distribution files were preserved locally in `.tmp/performance-main-baseline` and restored to their original Git contents afterward. Source/build fingerprints identify the measured inputs; the raw status records the build and newly prepared documentation.

## Verification

| Command | Result |
|---|---|
| `npm test` | 263/263 unit test files passed |
| `npm run check:types` | 0 errors, 0 warnings |
| `npm run build` | Passed, 180 modules transformed |
| `npm run check:assets` | Passed, 521 versioned local imports |
| Targeted local browser latency probe | 24 result groups; no browser errors, blocked requests or provider calls |

Logs and exact hashes are in the [baseline provenance](artifacts/editor-latency/main-143ec11/provenance.json). The latency probe exercises a mounted production controller/Svelte UI in an isolated disabled host; it is not the full browser acceptance suite.

## Plain action timings

Each value is milliseconds, measured at CPU rate 1 after one warmup. Three plain repetitions supply medians and observed maxima; a separate instrumented sample supplies work counts. This small baseline is preliminary, not a population tail estimate or final acceptance run.

| Nodes | Action | Sync median | Settle median | Settle observed max |
|---:|---|---:|---:|---:|
| 25 | Details Trim output toggle | 178 | 217 | 271 |
| 25 | Select another node | 5 | 25 | 35 |
| 25 | Centered shelf placement | 87 | 255 | 258 |
| 25 | Release accepted connection | 28 | 224 | 234 |
| 100 | Details Trim output toggle | 683 | 885 | 1106 |
| 100 | Select another node | 6 | 30 | 34 |
| 100 | Centered shelf placement | 312 | 952 | 990 |
| 100 | Release accepted connection | 96 | 809 | 900 |

Sync measures the dispatched handler/bridge call. Placement and connection commits continue asynchronously. Settle ends at the second requestAnimationFrame after dispatch: a paint-opportunity estimate, not a measured pixel change or INP. Synthetic events omit trusted-input queuing and some native hit testing/capture.

The fixture is the audit's short Compose Text chain (`E=N-2`), with no populated library, groups, model profiles or large output payloads. Chromium 151.0.7922.34, viewport 1440×1000, reduced motion, Windows 10, Node 24.16.0, Ryzen 7 5800X. Rendering uses SwiftShader software GPU. These measurements do not establish physical GPU smoothness or authenticated SillyTavern behavior.

## Instrumented work and gestures

The 100-node toggle still performs two full canvas renders, one graph replacement and 900 pin rectangle reads. Its instrumented sample counts 235,791 JSON calls and 121,369 clone calls, including recursive small operations; these are not counts of full-document copies. Instrumentation adds overhead, so its timings are separate from the plain table.

Two instrumented root-drag samples at 100 nodes each perform four renders, two graph replacements and 1500 pin reads. Release settles in 1100–1150ms. Frame P95 is 33.3–33.4ms with three intervals over 25ms per sample. Both 25-node releases settle in 232–250ms with four renders and two replacements.

Free wire preview performs 46 full wire-layer publications per sampled gesture at both sizes, despite no graph replacement or card geometry reads. This gives the first narrow renderer milestone a deterministic baseline. Pan and zoom have smooth frame P95 here, while 100-node pan release still settles near 99ms; recovery work remains part of gesture completion.

Gestures have 45 frame-paced batches of six events, two instrumented repetitions and a 220ms setup wait for the ordinary debounce. This wait does not guarantee quiescence; persistence/completion timers can run during long inter-frame gaps. Zoom has no mouse release, and its final post-sample completion/save is not measured separately. Raw frame intervals, threshold handlers, maxima, counts and retained-element checks remain in the result file.

## Reproduction

```powershell
npm ci --no-audit --no-fund
npm run build
node docs/research/artifacts/editor-latency/audit-editor-latency.mjs --sizes=25,100 --rates=1 --repeats=3 --modes=detail-toggle,selection,shelf-create,connect-release --output=.tmp/performance-main-baseline
```

The probe blocks external requests and provider calls. It records eight action groups (24 plain + 8 instrumented samples, plus warmups) and 16 instrumented gesture groups. For final acceptance, expand to the design's 20 plain action repetitions and plain gesture coverage.

Measured bundle SHA-256: `13034e7c7e7e3a1f0f609eb1ebae6c3f3d8389cfe72336c8f0af2424fc0132cd`.

- [Raw action and motion results](artifacts/editor-latency/main-143ec11/editor-latency-results.json)
- [Measured source/build manifest](artifacts/editor-latency/main-143ec11/editor-latency-source-manifest.json)
- [Probe and runtime provenance](artifacts/editor-latency/main-143ec11/provenance.json)
- [Original broader audit](2026-10-10-editor-latency-audit.md)
