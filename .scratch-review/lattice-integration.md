# SillyTavern + Lattice integration — status and runbook

*2026-10-15. Living note: what is wired, how to run the MVP (images we
created, inline in the chat), and what is still hands-on. The decisions
behind this are `docs/tooling-framework-report.md` §12–14.*

## The pieces

| Piece | Where | What it is |
|---|---|---|
| SillyTavern 1.19.0 | `/home/nos/SillyTavern`, `http://127.0.0.1:8000` | The host: cards, lorebooks, chat, extension registry (AGPL-3.0 — we write nothing into its source) |
| Lattice fork | GitHub `ganzuul/SpriteQuest`; local checkout `~/labware/lattice` | Fork of `MentallyQuill/Lattice` (MIT). `origin` = the fork, `upstream` = MentallyQuill. Pinned upstream revision `49197e3` (v0.27.3) |
| Service Call node | in the fork: `src/workflow/operations/service-nodes.js` + wiring | First contribution: one generic node that calls an HTTP service with an **injected transport** — no `fetch` in engines, no secrets in graph data, failures carry their reason |
| Artifact service | this repo: `tools/asset_service.py` | Read-only HTTP face of the artifact store: `GET /artifacts` (index + provenance), `GET /artifacts/<path>` (serves PNG/GLB), `GET /health`. Path-escapes refused; every error is JSON with its reason |

The fork lives in `~/labware` on purpose — **Nextcloud is the synced private
cloud; tooling checkouts with build artifacts do not belong there.** Only
the SpriteQuest repo itself is in Nextcloud.

## MVP: images we created, inline in the chat

1. **Start the service** (this repo):
   `python3 tools/asset_service.py --port 8787` — it indexes `scenes/**` and
   currently serves 101 sprites with their seed provenance.
2. **Install the fork into ST** — Extensions → Install extension →
   `https://github.com/ganzuul/SpriteQuest`, reload. (Until it is pushed,
   copy `~/labware/lattice` into `~/SillyTavern/public/scripts/extensions/third-party/Lattice`
   — replacing the installed one — and reload.)
3. **Open Lattice** (logo by the chat bar, or `/lattice`) and add nodes:
   - **Service Call** — URL `http://127.0.0.1:8787/artifacts`, Method GET,
     Response JSON. `Run to here` on its output first: the Preview should
     show the index JSON.
   - **Compose** (template mode, Text output) with a template that renders
     the image markdown, e.g.
     `![sprite](http://127.0.0.1:8787{{data:/artifacts/0/url}})` — or
     `Select Fields` first if you want a specific item's URL.
   - **Append / Combine** — Draft from `Generate Reply`, the Compose text as
     the section, a stable `sectionId` (e.g. `asset-note`).
   - **Review / Publish** — Draft from Append.
4. **Enable Lattice**, Send in a practice chat, and at **Review / Publish**
   choose Apply. The image markdown arrives as part of the reviewed reply —
   the picture is inline in the chat, and Reject leaves the original reply
   untouched.

The review loop is the point: the image enters the conversation through the
same accept/reject gate as the prose (C4's review test).

## The Service Call contract (for the upstream PR)

- One request per execution; `GET` or `POST` (POST sends the connected Data
  payload or the static body). Response is JSON (Data output) or Text
  (Text output pin).
- The **transport is injected** (`serviceRequest` in the runner ports; the
  host adapter in `src/workflow/host.js` supplies a `fetch` default with
  timeout and cancellation). Engines never reach for `fetch`; tests inject
  fakes; no credentials live in workflow data.
- Failures are evidence-carrying: request error text, HTTP status with a
  body snippet, or a JSON parse error — never silent, never partial output.

## Status of the C4 spike (report §13.6)

- [x] step 3 — service (done, 7/7 tests, smoke-checked on real data)
- [x] step 4 — glue: the Service Call node (done in the fork; test suite in
      `tests/workflow-service-call.test.mjs`); the Model Call shim detour is
      cancelled
- [ ] step 1 — preset import + connection to `127.0.0.1:8080`, model `gemma4-orion` (ST UI, hands-on)
- [ ] step 2 — the card + lorebook pair (ST UI, hands-on)
- [ ] step 5 — provenance embed in exported PNG/GLB (sidecar work)
- [ ] step 6 — the review-loop test with a deliberately failing run (ST UI)

## Notes for the operator (ST-unfamiliar)

- **Toolchain:** the fork wants Node ≥ 24 (its `engines` field). Node 22
  breaks a dozen of its engine tests in non-obvious ways; Node 24 lives at
  `~/labware/node24` — run npm with
  `PATH=~/labware/node24/bin:$PATH` first. (Verified 2026-10-15: upstream
  `49197e3` fails the same tests on Node 22 and passes on 24.)

- Presets import from the preset menu (top bar) — `~/scripts/sillytavern/Voyage-Universal-v5.1.json`.
- Lattice opens via its logo next to the chat bar or `/lattice`; workflows
  must be **enabled** ("Enable Lattice") to participate in Send.
- "Run to here" on a node tests just that part without publishing anything.
- ST renders `![alt](url)` markdown in messages — that is the inline-image
  mechanism; the service URL must stay reachable from the browser (it is, on
  localhost).
