# Clip Review — broadcast overlay on session footage (pilot)

> **Date:** 2026-10-03
> **Source:** learnings from `jonhpark7966/video-agents-hack` (Pitch Overlay + `pipeline/` generate→reason loop)
> **Thesis fit:** video is verified third-party proof. Stats stay non-self-editable; a phone-on-fence clip becomes evidence that feeds the existing verified window (`PlayerMatchStats` + `TwinService`), not a new progression loop.

## What we steal

1. **`<video>` + `<canvas>` synced to `detections.json`.** No re-encode. Nearest-`t` lookup per animation frame; ellipse at box bottom-centre. Cyan person / orange ball / white carrier / red + `PRESSURE` badge when carrier-to-nearest-opponent `< 3m` (est.). Side panel logs `mm:ss` events, click-to-seek (`video.currentTime = t`).
2. **Honest heuristics.** Carrier = nearest person to ball, hold last carrier when ball missed. Distance assumes ~50m visible width, labelled `est.` everywhere. Fixed-camera only (phone on fence — exactly the kickabout shape).
3. **Out list (day-1 no's):** team-colour classification, pitch calibration from lines, skeleton/speed/heatmaps, live streaming, multi-camera, player names on the overlay.
4. **`overlay.json` contract + style system** (`pipeline/prompt_guide.md`): `disc | ring | arrow | chip | banner`, one style per variant (`role-marker`, `telestrator`, `social-hook`, `broadcast-strap`, `data-chip`). Sanitise + thin to ~1 box/sec + hold-jumps + ball-spike rejection before render.
5. **Human-taste loop:** `ranks.json` from the review page biases the next draft; scores never auto-pick the parent without a human. Maps to our reciprocity/verification doctrine — pressure events are *candidates* until the group confirms.

## What we deliberately don't copy

VAST stack (VastDB, VSS search/videos API, k8s Ingress `/app`, Cosmos captions, W&B Weave). Replaced by: Next.js API routes + Prisma + existing `src/server/services/storage/` + Redis verification store.

## User flow (designed into existing loop)

```
record keeper films 60–90s on a fixed phone
  → session page: "Attach clip" (organizer token-gated, like /session/broadcast)
  → server extracts frames @5fps, runs YOLO, writes detections.json (storage adapter, moments/<session>/clip/)
  → analysis page: new "Clip review — pilot" section under payoff, above stats
      video + overlay + pressure event log (click event → seek)
      each event: Confirm / Not this (Redis-backed, mirrors group-verification)
  → confirmed events ride into submitMatchResult(playerGoals/…) → PlayerMatchStats
      inside the existing seed→XP verification window; nothing counts until verified
  → shareable: social-hook banner render (ffmpeg drawbox/drawtext, same as generate.py:render)
      via /api/og/payoff-style keepsake; preview tokens never leak into markup
```

Phase-0 (this spike): demo clip + synthetic detections on the analysis page behind no flag (clearly labelled pilot). Proves the UI + event-log interaction before any upload/YOLO work.

Phase-1: upload → frame extract → YOLO endpoint → real detections.json → confirm/dispute → verified stats.

Phase-2: style variants for shareables (broadcast-strap for public pages, data-chip for verified facts).

## Data contracts

```ts
// detections.json — one entry per sampled timestamp
interface ClipDetections { t: number; boxes: DetBox[] }
interface DetBox { cls: 'person' | 'sports ball'; x1: number; y1: number; x2: number; y2: number; conf: number }
// coordinates: normalized 0–1, top-left origin (same as hack pipeline scene.json)
interface PressureEvent { id: string; t: number; mmss: string; carrierIdx: number; closerIdx: number; distM: number }
```

- `src/lib/clip-review/detections.ts` — pure: `findCarrier`, `nearestOpponent`, `pixelDistToMetres` (50m assumption, explicit), `detectPressureEvents` (threshold 3m, edge-triggered, min-gap debounce). Table-tested.
- `src/components/session/ClipReview.tsx` — client: props `{ src, detections, widthM?: 50 }`, rAF loop, canvas overlay, event list, `onSeek`.
- Storage (phase-1): `moments/clip/<sessionId>/detections.json` via `saveBase64({ ownerType: 'session', … })` or storage adapter extension — record creation must succeed if this fails (enrichment retries async, per preservation-first invariants).

## Privacy / doctrine guardrails

- Phone numbers never on player-facing surfaces (existing rule) — overlay shows no names, only rings/indices.
- Preview token never in markup/sitemap — ClipReview takes no token prop; page passes only `src` + detections.
- Stats never self-editable — pressure events are evidence candidates; twin movement only via verified `PlayerMatchStats` → existing consensus path.
- Record-first invariant: clip upload/processing failure never blocks match logging or verification.

## Acceptance (phase-0)

- Analysis page renders ClipReview with demo clip; rings track for whole clip.
- ≥1 pressure event fires and appears in log; clicking seeks the video.
- `pnpm typecheck` + new vitest for `detectPressureEvents` pass.
- No new env vars, no migration, no route gating changes.

## Phase-1 — styles, hype, export, commentary (shipped 2026-10-03)

Deeper cuts from the hack repo, adapted to our stack:

- **Style system** (`src/lib/clip-review/styles.ts`, port of `prompt_guide.md`).
  Five styles, one per variant, never mixed; shared rules enforced in the
  builder (words ≥1.4s, banners ≤3 words, captions ≤6 words, only what the
  events support). Items reference *roles* (`carrier`/`closer`) resolved live
  per frame instead of persistent track ids — same kinds + timing semantics,
  ready for a future server burn-in without rework. Table-tested
  (`src/test/clip-review-styles.test.ts`): sanity per style, no stacked
  telestrator beats, deterministic, graceful with zero events (hype stays
  silent when there's nothing to hype).
- **Shared renderer** (`src/lib/clip-review/overlay-draw.ts`, mirrors
  `generate/render`). One draw path for live canvas + export capture, so the
  exported clip is exactly what the player saw. V3 palette for style items;
  broadcast cyan/orange kept for the base tracking layer (readable on grass).
- **Hype playback** (from `demo/hype/LOG.md`): slow-mo pulse to 0.35x for
  1.2s + white flash on squeeze entry (seek-guarded, export-guarded), plus
  per-event `Replay −3s`. Dutch-tilt/zoom-bumps deliberately skipped —
  canvas-transform complexity for little payoff at this fidelity.
- **Export** (`Export clip → share`): offscreen composite (video frame +
  overlay redraw at 12fps) → MediaRecorder WebM → auto-download + re-download
  link. Client-side by design: server ffmpeg burn-in works locally but not on
  Vercel serverless, and `html-to-image` can't capture `<video>` frames — so
  the capture canvas redraws via the shared renderer instead. Silent (no
  audio track); noted in code, not in UI.
- **Commentary** (`commentOnPressure` in analysis `_actions.ts`): the hack's
  stretch goal (Cosmos caption + W&B) becomes session facts (goals/assists/
  squad) + `generateInference` with the existing fallback chain. Explicit tap
  per event (controls spend), same attendance auth as commitments,
  deterministic fallback line when no provider is configured. 20-word cap,
  plain language, ASCII only.

## Still deferred (with reasons)
- **Server ffmpeg burn-in** — needs a worker with ffmpeg (Hetzner cron host
  pattern like moment-render, or a job queue). Client export covers sharing
  until volume demands it.
- **Real upload → YOLO detections** — the phase-1 pipeline from the User flow
  section above; demo detections stand in until then.
- **Multi-camera toggle** (their step 7.5) — kickabout is one phone on a
  fence; skip unless a cohort brings two.
- **Human-ranks loop** (`ranks.json` as taste) — revisit once captains rank
  clips; the confirm/dispute verification path is the nearer equivalent.

## Design alignment pass (2026-10-03, same day)

The pilot worked but spoke a different design language. Aligned to V3 +
the engagement doctrine:

- **`V3MiniButton` promoted** (`src/components/v3/primitives.tsx`, auto
  barrel-exported). Small inline actions — style pills, per-row replay/call —
  previously hand-rolled per surface. Full-width CTAs stay on `V3CTAButton`
  (export is now one: "Keep this clip →"); tertiary rows use the mini
  button with `light`/`dark` tones so active event rows stay legible.
  Focus outlines never removed.
- **Your-footage hollow card.** The unknown-slot doctrine: show the blank
  and how to fill it. Filming instructions for the record keeper (one fixed
  spot, phone on the fence, wide, 60–90s) + the own-clip picker, instead of
  a bare "Use own clip" button with no context.
- **No voting on demo data.** Confirm/dispute is deliberately absent: voting
  on synthetic squeezes would manufacture evidence, which the
  stat-immutability rule forbids. Events are labelled illustrative, and the
  copy states the future plainly — with your footage, squeezes become
  evidence the group verifies before any card moves.
- **Export honesty.** MIME picked by capability (`pickExportMime`, tested:
  vp9 → webm → mp4 → hide). No-MediaRecorder browsers get a hollow-card
  note pointing at desktop Chrome/Edge instead of a dead button. Subcopy
  states the clip is silent and exactly what was watched.
- **Small a11y:** style group has a label, active blurb is `aria-live`,
  commentary lines are `aria-live`, switcher uses `aria-pressed`.
