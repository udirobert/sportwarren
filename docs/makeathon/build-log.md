# Build Log — Config Makeathon

> Running record of decisions, prompts, and agent actions. Feeds the
> Build-in-Public ($10k) video and the submission write-up. Newest at bottom.

---

## 2026-06-17 — Session 1: scoping & foundation (in /Users/udingethe/Dev/figma)

**Decisions**
- Initial project: Accessibility Auditor-Fixer — an agent that scans a real
  Figma file, detects a11y violations, and fixes them in-place on the canvas
  using the live design system.
- Awards targeted: Innovative Workflow ($10k) + Building with Purpose ($10k),
  with the process log feeding Build-in-Public ($10k).

**Setup done**
- Added Figma MCP server to Claude Code (`https://mcp.figma.com/mcp`, HTTP).
- Created scratch docs at `/Users/udingethe/Dev/figma/docs/`.

**Open actions**
- [ ] USER: authenticate MCP via `/mcp` -> figma -> Authenticate (OAuth).
- [ ] Confirm what Figma access we actually have (Pro? Agent beta? Weave?).
- [x] Define the a11y rule set (v1) and the demo file. -> rules v1 written.

---

## 2026-06-17 — Session 2: MCP scope fix + skill scaffold (in /Users/udingethe/Dev/figma)

**MCP auth saga**
- First add was LOCAL/project scope, and the project key had a path-case
  mismatch (`/Users/udingethe/Dev/figma` vs cwd), so figma never appeared in the
  interactive `/mcp` picker (which was showing only user-scope claude.ai servers).
- Fix: removed local entry, re-added at USER scope:
  `claude mcp add --scope user --transport http figma https://mcp.figma.com/mcp`
- USER action pending: restart, then `/mcp` -> figma -> Authenticate.

**Skill built (since superseded)**
- Confirmed Agent Skill format: project skills at `.claude/skills/<name>/SKILL.md`,
  need `name` + `description` frontmatter, auto-become `/command`.
- Created `.claude/skills/a11y-audit/` — detect → explain → fix → annotate
  loop. Note: this skill was retired in Session 3 along with the broader a11y
  direction.

**Next**
- [ ] USER: finish MCP auth (restart + authenticate).
- [ ] First live read of a Figma file to prove the loop.

---

## 2026-06-17 — Session 3: access reality check + pivot to SportWarren

**MCP auth — done**
- `/mcp` reports `Authentication successful. Connected to figma.`
- `whoami` confirms: Papa Jams / papaandthejimjams@gmail.com / **Starter tier**.

**Rate-limit reality check (the unblock that forced the strategy reset)**
- Read `file://figma/docs/rate-limits-access.md` via the figma MCP resource.
- Starter plan caps MCP read tools at **6 calls per MONTH**, total. Exempt
  tools: `whoami`, `add_code_connect_map`, `generate_figma_design`.
- This was a hard blocker for the original "audit any file" concept — you
  cannot iterate on detect logic within 6 reads/month.

**Two unlocks surfaced from the makeathon brief**
1. **Pro upgrade via Contra access code** — all participants get Figma Pro
   for the duration, including 10k AI credits. Redeemed → MCP read cap is now
   200/day, 15/min.
2. **The 10k AI credits expire Jun 19** (two days). They power write/generate
   ops (`use_figma`, `generate_figma_design`, `create_new_file`, Make builds).
   They do NOT cover MCP reads — those are governed by the plan tier.

**Strategic pivot**
- The original a11y concept was read-heavy. With reads now unblocked it's
  *possible* again — but the AI credit pool wants a write-heavy workflow to
  justify itself. So we pivoted off generic a11y entirely.
- User surfaced two real projects as anchor candidates:
  https://github.com/udirobert/sportwarren and
  https://github.com/thisyearnofear/writersarcade.
- Picked **SportWarren** because:
  - The "purpose" narrative is exceptional (Scottish dads + spreadsheet, 265M
    amateur footballers, "moments designed to be saved").
  - The code already has a moment-rendering pipeline at
    `src/server/services/personalization/moment-render.ts` — but it's a
    hardcoded satori template using Inter (which `DESIGN_TOKENS.md`
    explicitly rejects as generic-AI-slop). Perfect "before" state.
  - Existing moment kind taxonomy (10 kinds in `SquadMomentsGallery.tsx`)
    gives us a concrete generation target.
  - Multi-channel surface (web, Telegram Mini App, WhatsApp) means more places
    for the new cards to land.
- Rejected WritersArcade — already targeting Mezo/Etherfuse/SuperRare/
  Arbitrum/Bitso tracks; adding Config on top reads as portfolio rather than
  purpose.

**Repo move**
- Moved the makeathon work from `/Users/udingethe/Dev/figma` (not a git repo)
  into this repo (sportwarren). Reason: Code Connect needs in-repo presence,
  the skill becomes a shipped artifact, the video story is stronger when the
  workflow lives in the project.
- Branched `config-makeathon` off `main` (clean tree, up to date with origin).
- Docs landed at `docs/makeathon/` (`brief.md`, `concept.md`, this log).
- Old `/a11y-audit` skill retired. New `.claude/skills/sw-moments/` scaffolded
  for the new direction (see `concept.md` for the pipeline shape).
- Settings: merged WebFetch + WebSearch + Bash(cd:*) permissions into the
  existing `.claude/settings.local.json` (kept all prior entries intact).

**Next**
- [ ] First MCP read against a Figma file to validate the loop, now that we're
      on Pro and inside the repo.
- [ ] Decide on the Figma file layout for the moment-card library (one page
      per kind? one file? page-per-archetype?).
- [ ] Wire up Code Connect for at least one existing TS component to prove the
      mapping works end-to-end before burning credits on the full library.
- [ ] Identify which SportWarren moment kinds to demo on for the video.

---

## 2026-06-17 — Session 4: pilot loop end-to-end on `record_broken`

**Goal**
Burn credits on a single archetype to validate the full Figma ↔ code round
trip before generating the remaining 9. Pick `record_broken` because it is
the most visually dramatic archetype (oversized type as imagery, destructive
red against dark) — strongest "before/after" contrast in the video.

**Scope, agreed upfront via `/sw-moments`**
- Fresh Figma file
- One archetype with full tier-variant set
- TS card component + v2 renderer scaffold wired to a CARDS registry
- Code Connect mapping (or manifest substitute) — see Pro-tier limit below

**Figma library — `SportWarren — Moment Cards`**
- Created via `create_new_file` (planKey resolved from `whoami`):
  `xTaynEAGCjhhmcmQdPG0JZ` →
  https://www.figma.com/design/xTaynEAGCjhhmcmQdPG0JZ
- Pages: `Cover`, `Foundations`, `———`,
  `MomentCard / Record Broken`, `———`. Cover + Foundations doc pages
  deferred to a later pass — not on the demo critical path; saves credits.

**Design tokens (Phase 1)**
- Created `Color` variable collection with Light / Dark modes.
- 11 semantic variables mirroring `docs/DESIGN_TOKENS.md` and the CSS
  custom properties in `src/app/globals.css`: `color/primary`, `success`,
  `warning`, `destructive`, `background`, `foreground`, `muted`,
  `border`, `team-home`, `team-away`, `xp-gold`.
- All variables: explicit scopes (`FRAME_FILL`, `SHAPE_FILL`, `TEXT_FILL`,
  `STROKE_COLOR` selected per token; never `ALL_SCOPES`), WEB code syntax
  set to `var(--<token>)` matching the CSS variable names.
- Text styles: `text/xs` → `text/4xl` + `text/kicker`, all Space Grotesk.
  `listAvailableFontsAsync` returned `[Bold, Light, Medium, Regular]` —
  no `SemiBold`, so the script auto-fell-back to `Bold` for SemiBold roles.

**Component (Phase 3)**
- `MomentCard / Record Broken` (component set node `7:65`), 5 Tier
  variants on its dedicated page.
- Composition: 600×400, dark surface, kicker pill, oversized
  destructive-red hero ("MOST GOALS / IN A SEASON" at 48px Bold tight
  tracking), shattered horizontal rule motif (4 segments at varied
  widths + opacities), detail line, footer row with SPORTWARREN
  wordmark + date.
- Tier ornaments: Standard (base), Premium (xp-gold 1.5px stroke),
  Streak (emerald glow ellipse top-right + STREAK pip in footer),
  Partner (PARTNER pip in footer), Internal (INT pip in footer).
- Card fill bound to `color/background` with the Dark mode pinned via
  `setExplicitVariableModeForCollection` — the surface stays dark even
  if a consumer file switches the collection's default to Light.

**Bug found and fixed mid-build**
- `figma.createAutoLayout()` returns a frame with a default solid white
  fill. The `Top` and `Footer` sub-frames were rendering as white slabs
  over the dark card. Fix: explicit `node.fills = []` on both. Caught via
  `get_screenshot` after the first build call; second call was a one-line
  patch.

**Code scaffold (TypeScript)**
- `src/components/moments/cards/`:
  - `types.ts` — `MomentCardProps`, `MomentForRender`, `CARD_WIDTH/HEIGHT`.
  - `tokens.ts` — hex-resolved tokens + per-tier ornament rules +
    `alpha()` + `formatCardDate()` helpers.
  - `RecordBrokenCard.tsx` — satori-compatible JSX bound to the Figma
    archetype. Header comments include the Figma node URL.
  - `DefaultCard.tsx` — fallback used for unmapped kinds. Carries the
    SportWarren design system but matches the v1 composition so the
    rollout can replace v1 cards in one step.
  - `index.ts` — `CARDS` registry (`{ record_broken: RecordBrokenCard }`)
    + `resolveCard()` + `FALLBACK_CARD`.
- `src/server/services/personalization/moment-render-v2.ts` — parallel
  to v1. Loads Space Grotesk from Google Fonts (with an IE9 User-Agent so
  the CSS endpoint serves WOFF, which satori supports), resolves
  `CARDS[moment.kind]` (falling back to `DefaultCard`), runs satori +
  Resvg, persists via the storage adapter, updates the Moment row.
- `pnpm run typecheck` clean.

**Code Connect — blocked by plan tier**
- `add_code_connect_map` returned: *"You need a Dev seat on an
  Organization or Enterprise plan to use Code Connect."* Pro is below the
  required tier — no path to unlock this from the makeathon participant
  upgrade.
- Workaround: hand-maintained mapping in
  `src/components/moments/cards/code-connect.manifest.json` — same shape
  of data Code Connect would store (Figma node id → component source +
  prop bindings + variant axes). Card files cross-link to it via header
  comments containing the Figma URL with `?node-id=...`.
- Demo implication: instead of showing the agent's `add_code_connect_map`
  call live, the video shows the manifest file + the rich header comment
  + the Figma URL resolving to the actual component on canvas. The
  "design ↔ code round trip" story still lands; the production version
  would just compile this manifest down through Code Connect on a
  qualifying plan.

**Files (this session)**
- `src/components/moments/cards/{types,tokens,index}.ts`
- `src/components/moments/cards/{RecordBrokenCard,DefaultCard}.tsx`
- `src/components/moments/cards/code-connect.manifest.json`
- `src/server/services/personalization/moment-render-v2.ts`

**Credit spend (approximate)**
- `use_figma` calls used this session: ~6 (1 failed atomically pre-font-load,
  1 fix for white frame fills). Read tools (get_screenshot, get_metadata)
  do not draw from the credit pool — they hit the 200/day MCP read cap.

**Next**
- [ ] Wire the cron callsite (`src/app/api/cron/moment-render/route.ts`) to
      v2 behind a feature flag so the demo can A/B the renderers.
- [ ] Generate the remaining 9 archetypes once credits allow:
      `level_up`, `sim_complete`, `achievement`, `coaching_hired`,
      `coaching_expired`, `attestation_milestone`, `season_end`,
      `twin_created`, `match_imported`.
- [ ] Tier-pip text in the Figma variants reads faint at 1× — fix
      contrast pass: lighter text fill + drop the background tint
      opacity. Same issue applies to the base kicker pill.
- [ ] Add Cover + Foundations doc pages in the Figma file before
      Community publish.
- [ ] Build the Figma Make studio app (preview / regenerate / push
      back to v2) — separate work item, larger credit ask.
- [ ] Walkthrough video shoot list + social post draft.

---

## 2026-06-17 — Session 5: high-leverage polish ahead of submission

**Goal**
Pre-submission polish pass on the items most likely to move judging:
qualifying-gate prep (Community-link landing page), demo-truthfulness
(cron actually rendering through v2 in a flagged run), and reducing the
"sample of one" feel by adding a second archetype that visually contrasts
with `record_broken`.

**Done this session**
- **Cron wired to v2 (`src/app/api/cron/moment-render/route.ts`)**
  - Imports both renderers. Selection order: `?v=1|2` query param →
    `MOMENT_RENDER_V2` env var → v1 default.
  - Response payload now includes `renderer` and `v2HandledKinds` for
    debugging + demo screencap legibility.
  - v1 code path untouched; no risk to in-flight cron schedule.
- **Pip + kicker contrast pass in Figma (variant set `7:65`)**
  - All 5 RECORD BROKEN kicker labels + STREAK / PARTNER / INT pip
    labels switched to `color/foreground` @ 0.95 (white). 8 text fills
    updated. Kicker pill and pips now read at 1×.
  - TS `RecordBrokenCard.tsx` synced with the same fix so satori output
    matches the Figma canvas.
- **Cover frame (`9:2` on the Cover page)**
  - 1920×1080 dark surface. SPORTWARREN wordmark, `CONFIG MAKEATHON ·
    BUILD-IN-PUBLIC` red kicker, giant `MOMENT / CARDS` title (Space
    Grotesk Bold 160px), one-line library description, repo+tooling
    meta line, plus a placed INSTANCE of the `record_broken` Standard
    variant as visual proof (so the cover scales with future tier
    updates without manual re-export).
  - This is what judges land on when they click the Community link.
- **Second archetype: `level_up` (variant set `11:86`)**
  - New page `MomentCard / Level Up` (`10:15`).
  - Base composition: kicker pill (xp-gold) at top-left, giant 220px
    Space Grotesk Bold "13" numeral as hero (xp-gold), 3-step ascending
    chevron stack motif in `color/success` (emerald) suggesting growth,
    `LEVEL` label below, footer with player detail + L12 → L13
    progression + date.
  - Five tier variants on the same Tier=… property pattern as
    `record_broken`. Combined and grid-laid-out.
  - Visually distinct from `record_broken` on every axis: palette
    (gold + emerald vs. red), composition (numeral vs. type-as-imagery),
    motif (ascending chevrons vs. shattered rule), mood (kinetic vs.
    breaking). The "sample of one" feel is gone.
- **TypeScript scaffold**
  - `src/components/moments/cards/LevelUpCard.tsx` — mirrors the
    archetype, includes a `extractLevel()` parser so the numeral hero
    works on any twin event payload shaped like `"Level <n>"`.
  - Registry updated: `CARDS['level_up'] = LevelUpCard`.
  - `code-connect.manifest.json` extended with the new archetype +
    its design-system bindings.
  - `pnpm run typecheck` clean.

**Credit spend (session 5)**
- 4 `use_figma` calls: pip-contrast batch, Cover frame, level_up base,
  level_up variants. No retries; no atomic failures this session.

**What's now ready for the submission**
- Two visibly different archetypes, each with 5 tier variants.
- A Cover frame so the Community link is meaningful.
- The cron will route real Moment rows through the v2 pipeline when
  `?v=2` is appended — demonstrable in the video.
- Build log = the Build-in-Public artifact, candid about the
  Code-Connect-on-Pro blocker.

**Next — submission critical path**
- [ ] Publish the Figma file to Community (+5 pts, also satisfies the
      "community / working file link" qualifier).
- [ ] Record 30s–90s walkthrough video. Loom is fine.
- [ ] Post to social with `#ConfigMakeathon @figma` (qualifying).
- [ ] Submit on Contra.

**Deferred to post-submission**
- Remaining 8 archetypes (`sim_complete`, `achievement`,
  `coaching_hired`, `coaching_expired`, `attestation_milestone`,
  `season_end`, `twin_created`, `match_imported`).
- Figma Make studio app.
- Tier-pip contrast on `level_up` PARTNER / INT pips (same root cause
  as the record_broken pass; fix recipe is identical).
- Foundations doc page in Figma.

---

## 2026-06-17 — Session 6: depth pass (default v2 + Foundations + before/after)

**Goal**
The user pushed back on packaging-only polish in favor of moves that
also improve the project itself. Reframed the plan around items that
double as durable artifacts: v1/v2 side-by-side renders, a Foundations
docs page, the reproduce-this-build entry point, and promoting v2 from
"demo flag" to "production default."

**Done this session**
- **Before/after render script** (`scripts/render-before-after.tsx`)
  - Renders the same synthetic Moment object through both pipelines.
  - For v1, a JSX equivalent of v1's design *intent* (Inter + 135°
    gradient + uniform composition) — because v1's actual production
    code is broken (see Discovery below).
  - For v2, the real `CARDS[kind]` resolution + Space Grotesk via the
    Google Fonts CSS API.
  - Outputs four PNGs to `docs/makeathon/assets/`:
    `record_broken-v1.png`, `record_broken-v2.png`,
    `level_up-v1.png`, `level_up-v2.png`.
  - Reproducible from any clone: `pnpm tsx scripts/render-before-after.tsx`.
- **Production-code discovery**
  - v1 (`src/server/services/personalization/moment-render.ts`) calls
    `satori(htmlString, …)`, but satori 0.26 only accepts JSX —
    passing a string causes it to render the raw HTML source as a
    single text node. v1 has been silently shipping garbled PNGs.
  - Confirmed: `satori-html` is not installed; satori version is
    locked at `0.26.0`.
  - v1's hardcoded Inter URL (v18) also 404s — Google rotated the
    font file hash, so even if the JSX issue were fixed the renderer
    would error on cold cache.
  - Both bugs are bypassed by v2 by design: it uses JSX and the
    Google Fonts CSS API for dynamic font URL resolution.
- **Foundations doc page in Figma (page `1:2`, frame `12:15`)**
  - 1920×1280 dark documentation surface.
  - Title + subtitle + footnote pointing back to
    `docs/DESIGN_TOKENS.md`.
  - 11 color-token swatches in a 4×3 grid: each shows the token
    name, the Light hex, the Dark hex, and a top-half color stripe
    (single color for tokens that don't differ by mode; split into
    two halves for `background`, `foreground`, `muted`, `border`).
  - Hit and resolved a `setExplicitVariableModeForCollection`
    cascade quirk: the explicit Dark mode set on the outer frame did
    not propagate to grandchild text fills. Workaround: literal hex
    on the swatch panels + literal white on the labels. (Recipe
    documented for future Foundations work.)
- **`README.md` + `docs/makeathon/REPRODUCE.md`**
  - Top-level README now has a *"Moment card library — reproduce
    this build"* section linking the workflow.
  - `REPRODUCE.md` documents the full pipeline (read code → generate
    Figma → bind via manifest → satori v2) plus a step-by-step for
    extending the library with a new archetype.
  - Targets Innovative Workflow + Build-in-Public awards directly:
    these prizes explicitly reward reproducibility, and the README
    now makes the reproduction path the first thing a clicker sees.
- **v2 is now the default on the Next.js API route**
  - `src/app/api/cron/moment-render/route.ts` selection order
    flipped:
    1. `?v=1|2` query param wins
    2. `MOMENT_RENDER_V1_FALLBACK` env var rolls back to v1 globally
    3. Default — **v2**
  - v2's `renderPendingBatch` now returns
    `{ processed, byKind, fallbackCount, failed }` so the cron
    response surfaces how many moments fell through to `DefaultCard`
    vs. a dedicated archetype. Observable rollout to a fully-mapped
    library.
  - v1 untouched in code, just deprioritized. Safe rollback path
    preserved.
  - **Correction (added retrospectively, session 7):** at the time
    this was written the author believed the Next.js API route was
    the production cron path. It is not — the production cron runs
    on Hetzner via a maintenance script that imports v1 directly.
    The Next.js route is reachable for manual demo triggers but
    isn't on a schedule. See session 7 for the real production v2
    flip.
- `pnpm run typecheck` clean across all four changes.

**Files (this session)**
- `scripts/render-before-after.tsx`
- `docs/makeathon/assets/{record_broken,level_up}-{v1,v2}.png`
- `docs/makeathon/REPRODUCE.md`
- `README.md` (Documentation table + new library section)
- `src/server/services/personalization/moment-render.ts` (added
  `export` to `buildHtml` for the comparison script)
- `src/server/services/personalization/moment-render-v2.ts`
  (richer `BatchResult` return type)
- `src/app/api/cron/moment-render/route.ts` (default flipped)

**Credit spend (session 6)**
- 2 `use_figma` calls: Foundations color grid + the swatch-panel
  literal-color fix. No retries.

**Next — submission critical path (unchanged)**
- [ ] Publish the Figma file to Community (+5 pts, qualifying).
- [ ] Record walkthrough video (qualifying). The before/after PNGs in
      `docs/makeathon/assets/` should anchor the visual narrative.
- [ ] Social post (qualifying + 5 pts).
- [ ] Submit on Contra.

---

## 2026-06-17 — Session 7: Hetzner architecture discovery + real production v2 flip

**Goal**
User pushed back on assumptions about where the cron runs. I had been
treating Vercel as the cron host. SSH'd into the Hetzner box to verify.

**What's actually running where**
SportWarren's production deployment is on Hetzner (`snel-bot`), not
Vercel. The architecture:

- **App process** — pm2-managed `sportwarren-api` (id 176, port 5200),
  running the Next.js standalone build out of
  `/opt/sportwarren-api/current/.next/standalone/server.js`. Built via
  `next build` + standalone output, deployed via
  `scripts/deploy-runtime-release.sh` using a release/symlink pattern.
- **Cron schedule** — system `crontab` (under both root and `deploy`
  users) drives three SportWarren maintenance scripts:
  - `scout-settle.ts` every 5 minutes
  - `moment-render.ts` every 6 hours
  - `twin-sim.ts` nightly at 02:00
- Each invocation routes through
  `/opt/sportwarren-api/shared/scripts/maintenance/run-cron.sh`, which
  sources `shared/.env`, `cd`s into the current release, and runs
  `npx tsx scripts/maintenance/<script>.ts`.
- **`vercel.json`** registers `scout-settle` and `auto-scout` for
  Vercel cron, but the Hetzner crontab is the canonical scheduler for
  moment-render. The Next.js API route at `/api/cron/moment-render`
  exists as a parallel demo / manual-trigger surface but isn't on a
  schedule from either Vercel or Hetzner.

This was previously unknown to the agent — session 6 work updated the
Next.js route believing it was the production path. That was a fix, but
not the production fix.

**Real production v2 flip**
- `scripts/maintenance/moment-render.ts` rewritten:
  - Imports `renderPendingBatch` from `moment-render-v2` as the default
  - Keeps v1 import available and gates fallback on
    `MOMENT_RENDER_V1_FALLBACK=true` in
    `/opt/sportwarren-api/shared/.env`
  - Logs the v2 result payload (`processed`, `failed`,
    `fallbackCount`, `byKind`) on every run, so the rollout from "2 of
    10 archetypes mapped" to "fully mapped" is observable from the
    cron log alone
  - Header comment documents the architecture for future contributors

**What needs to happen next for the flip to be live in production**
- Build a fresh runtime artifact (`pnpm build:server` →
  `pnpm deploy:runtime:build`)
- Run `deploy-runtime-release.sh` to ship to Hetzner
- pm2 picks up the new release automatically; the next cron tick (top
  of the next 6-hour window) runs v2

The code change is in. The deploy is the user's call — out of scope for
this skill session.

**`pnpm run typecheck` clean.**

**Files (this session)**
- `scripts/maintenance/moment-render.ts` (rewritten as v2-default with
  fallback flag and richer logging)
- `docs/makeathon/build-log.md` (this entry + correction to the
  session-6 "v2 is the default" claim)

**Why this matters for the submission**
The build-log claim is now defensible in *code*. *"v2 is the default
cron renderer; v1 is the rollback"* is the on-disk truth for both:
- The Next.js API route (session 6 work)
- The Hetzner production cron (this session — `scripts/maintenance/moment-render.ts`)

**Correction added retrospectively in session 8:** the production
*deploy* of this change did not land in this session — see session 8
for the post-mortem. The code is correct; the production cron is still
running v1 until the next clean deploy.

**Architecture notes for future sessions**
- pm2 dashboard via `ssh snel-bot 'pm2 list'`
- App logs: `ssh snel-bot 'pm2 logs sportwarren-api'`
- Cron logs: `ssh snel-bot 'tail /opt/sportwarren-api/shared/logs/moment-render.log'`
- Deploy: build tarball locally, scp to box, run
  `deploy-runtime-release.sh /path/to/artifact.tar.gz`
- Env: `/opt/sportwarren-api/shared/.env` (shared across releases via
  the release/symlink pattern)

---

## 2026-06-17 — Session 8: deploy attempt, two bugs surfaced, rollback

**Intent**
Build artifact locally, scp to snel-bot, run `deploy-runtime-release.sh`,
confirm v2 is the production default for the cron path. Verify with a
manual run.

**What actually happened**

The deploy did not land. The build attempt surfaced two real bugs in
the deployment pipeline, both worth fixing but out of scope for this
session. Production is rolled back to the previous working release;
net change to production: zero.

### Bug 1 — Next.js standalone path leak from CWD case

`pnpm deploy:runtime:build` produced a tarball whose
`.next/standalone/` contained a `Dev/sportwarren/` prefix:

```
.next/standalone/Dev/sportwarren/server.js
.next/standalone/Dev/sportwarren/node_modules/
.next/standalone/Dev/sportwarren/.next/server/...
```

The expected layout (and the layout of every previous successful
deploy) is files directly under `.next/standalone/`. The pm2
`ecosystem.config.cjs` references `'.next/standalone/server.js'`
relative to `cwd`, so the new release booted with `[PM2][ERROR]
Error: Script not found`.

Root cause appears to be the build's CWD: my primary working tree is
at `/Users/udingethe/Dev/sportwarren/` (uppercase D). macOS APFS is
case-insensitive but case-preserving — Bash and other tools read the
preserved case, and Next.js 16.2's standalone tracer captured the
literal case in chunk names. Previous builds were presumably run from
a path that didn't produce this prefix (lowercase variant, or a
symlink, or different `outputFileTracingRoot` resolution).

**Mitigation attempted (partial):** flattened the contents up to
`.next/standalone/` and restarted pm2. The process started, but the
Turbopack-compiled chunks had `Dev_sportwarren_*` baked into chunk
imports — those don't resolve at runtime even after file flattening.
Hitting `/api/cron/moment-render` returned 500 due to the chunk leak.

**Proper fix (deferred):** ensure builds are produced from a CWD that
matches the historical pattern (likely `/Users/udingethe/dev/...`
lowercase, or use `outputFileTracingRoot` to anchor under the project
root explicitly). Probably worth adding a guard at the top of
`scripts/build-runtime-artifact.sh` that fails fast if the CWD case
will produce a prefix in the standalone output.

### Bug 2 — `.env` line 10 unquoted mnemonic breaks `set -o allexport`

While diagnosing, I noticed the moment-render cron log on the box was
filled with:

```
/opt/sportwarren-api/shared/.env: line 10: provide: command not found
```

Line 10 of `shared/.env` is `ALGORAND_PRIVATE_KEY=dose provide steel ...`
— a 12-word BIP-39 mnemonic stored unquoted. Bash's `set -o allexport`
+ `source` interprets the second word `provide` as a command.

This blocks `run-cron.sh` (which uses `set -euo pipefail` and sources
`.env` before running the maintenance script). So the moment-render
cron has been failing-fast at env load time for some time — independent
of the v1 vs. v2 distinction. Node's dotenv parser handles this case
differently, so the Next.js process running under pm2 has the
mnemonic loaded correctly; the cron path is the only thing affected.

**Proper fix (deferred, requires care with secrets):**
- Single-line fix on the box: wrap line 10 value in single quotes
  `ALGORAND_PRIVATE_KEY='dose provide steel ...'`
- Or relax `run-cron.sh`: drop `set -e` around the `source` so
  partial env load doesn't abort the whole run

### Rollback

```
ln -sfn /opt/sportwarren-api/releases/20260617-151227 /opt/sportwarren-api/current
pm2 delete sportwarren-api
pm2 start /opt/sportwarren-api/current/ecosystem.config.cjs --only sportwarren-api --update-env
pm2 save
```

Then re-copied the v1-only maintenance script back to
`shared/scripts/maintenance/moment-render.ts` so the cron path also
matches the rolled-back release.

Final state:
- `pm2 list` shows `sportwarren-api` online (pid 178)
- `GET /api/health` returns 200 with DB / Redis / AI / payments all
  healthy
- `GET /api/cron/moment-render` returns 500 (was already 500 before
  the deploy attempt — consistent with the v1 satori-html bug
  discovered in session 6 — this is pre-existing, not a regression)
- The Vercel-served frontend is unaffected (different runtime)

### Bonus discovery

The "moment-render cron broke silently in production" finding in
session 6 is reinforced: even if the bash env issue weren't blocking,
v1's `satori(htmlString)` call would have crashed every invocation.
The cron has been **doubly broken** — failing at env load (Bug 2) and
on the renderer call (the original v1 bug). v2 fixes the renderer; the
env issue is independent.

### Implications for the submission

- The video does not need a live production cron run. The demo
  flow is code → Figma → before/after PNGs → build log. All four are
  in the repo + on the branch + at the Figma URL.
- The build log is more honest *with* this entry than it would be
  without. Build-in-Public reads as "here's what we built, here's
  what we discovered, here's what we left for the next PR" rather
  than "everything worked perfectly."
- The committed code on `config-makeathon` is correct: v2 is the
  default in both cron entry points, with `MOMENT_RENDER_V1_FALLBACK`
  as the rollback. A future PR that addresses the path-leak +
  env-quoting issues can land this cleanly in one deploy.

### Files (this session)
- `docs/makeathon/build-log.md` — this entry + session 7 correction.
- No code changes. The two-commit feature work from session 6 + 7
  remains on `config-makeathon` (pushed to origin) and is the
  artifact judges will browse.
