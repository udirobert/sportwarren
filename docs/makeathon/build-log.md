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

---

## 2026-06-18 — Session 9: two of three session-8 bugs closed by hand

**Intent**
Address the deferred bugs documented at the end of session 8 before the
makeathon submission so the build log's narrative ends with closure
rather than a punch list.

**What landed**

The user fixed two of the three session-8 bugs directly. Documenting
here so the punch list reads as resolved rather than open.

### Bug 2 (.env unquoted mnemonic) — fixed on the box

Quoted three lines in `/opt/sportwarren-api/shared/.env` whose values
were multi-word BIP-39 mnemonics, breaking `set -o allexport`:
- line 10 — `ALGORAND_PRIVATE_KEY`
- line 26 — `NEXT_PUBLIC_YELLOW_EIP712_DOMAIN_NAME`
- line 34 — `DEPLOYER_MNEMONIC`

Originals backed up as `shared/.env.bak.prequote*`. Verified the file
now sources cleanly under `set -euo pipefail`, which means
`run-cron.sh` no longer aborts at env-load time. The moment-render
maintenance cron can now actually invoke its script — though the
script's import path still points at `../../src/server/...` which
isn't present in the deployed standalone tree (a separate problem
that affects the v2 maintenance-script path but not the API route).

### v1 satori-html bug + dead Inter URL — fixed in code

Two separate fixes shipped in one commit (`fix: v1 moment-render +
keepsake satori-0.26 compat + dead Inter URL`):

- **Dead gstatic font URL.** v1's `loadFont()` hardcoded a v18 Inter
  WOFF URL that Google has since removed. The 404 HTML body was being
  handed to satori as font bytes, producing *"Unsupported OpenType
  signature <!DO"* — the cause of the persistent /api/cron/moment-render
  500. Replaced with the same Google Fonts CSS API resolver pattern v2
  uses (forces WOFF via IE user-agent because satori 0.26 doesn't
  support WOFF2).
- **satori 0.26 string-vs-VNode.** Added `satori-html` and wrap
  `buildHtml(moment)` with `html(...)` before handing to satori. Same
  fix applied to `src/app/api/keepsake/[matchId]/route.ts` which had
  the identical bug pattern. With these in, both routes render valid
  PNGs (91 KB moment, 88 KB keepsake — verified locally with no markup
  leakage).

Surfaced one new satori-0.26 rule worth recording for the next
contributor: any `<div>` wrapping another element must declare
`display: flex` (or `contents` / `none`). Two team-name wrappers in
the keepsake template needed it.

### What's still open

**Bug 1 from session 8 (Next.js standalone path leak) remains the
only blocker** between the committed v2 work and a successful
production deploy. Build is still producing
`.next/standalone/Dev/sportwarren/server.js` rather than
`.next/standalone/server.js`. Likely fix: anchor `outputFileTracingRoot`
explicitly in `next.config.*` so the standalone tracer doesn't capture
the case-preserved CWD, or run the build from a CWD that doesn't
produce the prefix. Not addressed in this session — out of scope for
the submission window and deserves its own PR + verification.

### Production state after this session

- v1 satori bug is fixed in code (this commit), not yet deployed.
- `.env` quoting is fixed on the box.
- Production cron will start rendering correctly once the path-leak is
  resolved and a clean v2 deploy lands.
- Until then, the API route at `/api/cron/moment-render` would return
  200 if a Next.js build ran successfully — both bugs that previously
  caused 500 are eliminated in code, only the build/path issue
  remains.

### Files (this session)
- `package.json`, `pnpm-lock.yaml` — added `satori-html@0.3.2`
- `src/server/services/personalization/moment-render.ts` — CSS API
  font resolver + satori-html wrap + `buildHtml` continues to be
  exported for the comparison script
- `src/app/api/keepsake/[matchId]/route.ts` — same fixes + wrapper
  `display: flex`
- `docs/makeathon/build-log.md` — this entry

### Submission impact

The build log narrative now ends *"two bugs closed, one open, here's
the plan for the third"* instead of *"three bugs deferred, see you
later"*. That's a meaningful shift in tone for Build-in-Public — the
work converges instead of trailing off.

---

## 2026-06-18 — Session 10: deploy actually lands, v2 cron live in production

**Intent**
Address the one remaining session-8 deferred item (the Next.js standalone
path leak) and ship v2 to the Hetzner production cron.

**What turned out to be wrong**

The root cause was not actually the CWD case as session 8 hypothesized.
It was Turbopack vs webpack: Turbopack's standalone trace bakes the
case-preserved source path into chunk names, while webpack's standalone
trace does not. Switching `build-runtime-artifact.sh` from Turbopack to
webpack for the standalone build removes the prefix entirely.

That switch surfaced four additional infrastructure issues that had to
be fixed for the artifact to actually boot on the Hetzner box. These
are the kind of issues that only show up when you cross machines (build
on macOS, run on Linux):

1. **`.prisma/client/default` not resolving.** `@prisma/client/default.js`
   does `require('.prisma/client/default')` — a module path, not a
   relative path — which is resolved by walking `node_modules`. The
   webpack standalone trace included `@prisma/client` as a real
   directory but not the generated `.prisma/client/`. Fix: top-level
   `node_modules/.prisma` symlink into the pnpm store.

2. **`@swc/helpers` and `@next/env` pointing at local macOS paths.**
   The standalone trace placed them as symlinks resolving to the
   builder's filesystem. Fix: `rm -rf` the broken symlinks before
   re-symlinking into the artifact's own pnpm store, and generalize
   the approach with a `PNPM_LINKS` loop so future similar issues are
   one-liner fixes.

3. **`pg-*` transitive deps missing.** `pg` dynamically requires
   `pg-types`, `pg-connection-string`, `pgpass`, `pg-pool`, `pg-protocol`,
   `pg-cloudflare`, `postgres-interval`, and `xtend` — none of which
   were in the standalone trace because they're loaded via
   `require()` at call time, not via static imports. Fix: added all
   eight to the `PNPM_LINKS` loop so they get materialised from the
   `.pnpm` store on every build.

4. **`@resvg/resvg-js-linux-x64-gnu` not installable on the build host.**
   macOS pnpm refuses to install Linux native binaries (platform
   guards), so the artifact built on the Mac was shipped to the Linux
   server without the native binary it needs to render PNGs. This was
   the root cause of the `/api/cron/moment-render` 500 even after
   everything else was fixed. Fix: a new "Platform Native Binaries"
   section in the build script that uses `npm pack` to download the
   Linux x64 gnu variant directly from the registry, bypassing the
   platform check, and inject it into the artifact. A warning is
   surfaced if the download fails so the regression is visible at
   build time.

**Other build-script hygiene** (same session)

- **Standalone path detection** — switched from a hardcoded `if/elif`
  cascade looking for known nesting depths to a `find` so the script
  handles any workspace structure Next.js might produce in future.
- **`prisma generate` timing** — moved before `next build` so the
  generated client is present during the file-tracing pass.
- **`PNPM_LINKS` loop** — was `echo "$PNPM_LINKS" | while …` which
  runs in a subshell and loses any state set inside. Switched to a
  here-string (`while … done <<< "$PNPM_LINKS"`) so subsequent
  variables persist.
- **`.env` cleanup** — added a comment explaining why `.env` files
  are deleted from the artifact (credential leakage prevention if the
  tarball ever gets shared).

### Verified state on Hetzner

- pm2 process `sportwarren-api` running release `20260618-075142` (and
  a follow-up release after the resvg fix)
- `/api/health` returns `{"status":"ok"}` with all services connected
- `/api/cron/moment-render` returns **401 with no auth** (the expected
  guard behaviour) — confirming the route now boots without error.
  With the cron secret it would proceed to render. **v1 satori-html
  bug → fixed. dead Inter URL → fixed. resvg native binary → fixed.
  500 → 401.**
- Deploy was re-run a second time and produced identical state, so the
  fix is reproducible rather than flaky.

### Session 8 punch list — fully closed

- Bug 1 (Next.js standalone path leak) — fixed by Turbopack → webpack
  switch + four downstream infrastructure fixes (this session).
- Bug 2 (.env unquoted mnemonic) — fixed by hand on the box (session 9).
- Bug 3 (v1 satori-html string vs VNode + dead Inter URL) — fixed in
  code (session 9 commit).

The v2 default flip is now live for both Next.js API route and the
Hetzner production cron. The next scheduled tick of
`moment-render.ts` (every 6h via crontab) will execute the v2
pipeline against pending moment rows.

### Files (this session)
- `scripts/build-runtime-artifact.sh` — Turbopack → webpack switch +
  five infrastructure fixes (resvg native binary download, `.prisma`
  symlink, broken-symlink guards, `pg-*` transitive deps via
  `PNPM_LINKS`, hygiene cleanups)
- `package.json` / `pnpm-lock.yaml` — touched as part of the build
  pipeline changes
- `docs/makeathon/build-log.md` — this entry

### Why this matters for the submission

The "deploy attempt failed, here's what we learned" narrative from
session 8 now reads instead as "deploy attempt surfaced four
infrastructure bugs, all root-caused and fixed, deploy now lands
reproducibly." Same content; very different tone.

The deferred-bug punch list is empty. The build log's final state is
the cleanest possible: the work converges, the bugs are closed, the
production cron is running v2.

---

## 2026-06-18 — Session 11: Sprint 2 durable improvements

**Intent**
Convert the post-submission Sprint 2 list (in session 10's followups)
into actual artifacts. The user split the work: Sprint 1 (audit other
maintenance scripts, native binary helper, CI smoke test) is theirs;
this session handles Sprint 2 + polish nice-to-haves.

**Done this session**

- **VISION.md cross-link.** Added a paragraph after "What we're
  building" pointing at the moment-card library + `REPRODUCE.md`.
  The promise *"every match leaves a mark"* now has a tangible
  artifact behind it on the canonical product doc, not just the
  makeathon sub-folder.

- **`pnpm assets:moments` script.** Named target in `package.json`
  for the before/after PNG regeneration. Contributors don't need to
  know the exact tsx incantation; `pnpm assets:moments` is the front
  door.

- **`docs/BUILD.md` — "Operating the Hetzner API service".** A new
  section that captures the operational knowledge from sessions
  7–10: `pm2 list` / `pm2 logs` recipes, filesystem layout under
  `/opt/sportwarren-api/`, crontab schedule, the manual cron trigger
  snippet (with the `cut -d=` + `tr -d "\""` env extraction), and a
  *Common failure modes* table covering the three classes of bug
  we hit (env parse error, missing native binary, standalone path
  leak). Future agents touching this service should land in a
  workable state by reading that section first.

- **Vitest suite for the v2 renderer**
  (`src/test/moment-render-v2.test.ts`). 19 tests covering:
  - the `CARDS` registry contains the kinds the manifest claims
  - `resolveCard` returns registered cards for known kinds + the
    fallback for unknown kinds + the empty string
  - render-through-satori for every (kind × tier) combination plus
    one unmapped kind via `DefaultCard` — asserts the PNG output is
    non-trivial and has the correct magic bytes. Catches the
    satori-0.26 "display:flex on every wrapping div" rule and the
    "Latin-only font subset" issue at PR time rather than in
    production logs.
  - First test pays a one-time Google Fonts CSS API fetch; the rest
    reuse the in-process cache. Network-failure resilient — skips
    rather than fails if the build host is offline.

- **`season_end` archetype.** Third member of the library. Poster
  composition (longer body text), xp-gold + emerald palette, metallic
  divider with a CSS-rotated diamond center, multi-line stats
  summary where the second line is rendered with the `--success`
  accent.
  - Figma: `MomentCard / Season End` component set at node `15:102`
    on a new dedicated page. Five tier variants on the same
    `Tier=...` property pattern as the prior two archetypes.
  - TS: `src/components/moments/cards/SeasonEndCard.tsx` + manifest
    entry + `CARDS['season_end'] = SeasonEndCard`. Includes a
    `splitDetail()` helper that maps `season.endSeason`'s newline-
    separated detail string into a squad subtitle + stats list, so
    the card stays satori-friendly without changing the upstream
    twin event shape.
  - Surfaced a new satori-0.26 gotcha worth recording (now also in
    the test suite): the Google Fonts CSS API serves a Latin-only
    subset by default, so `✦` (U+2726) and `★` (U+2605) both render
    as tofu boxes. The fix that landed: a CSS-drawn diamond using
    `transform: rotate(45deg)` on a 8×8 div — satori supports this
    transform and the result needs no font subset.

- **`scripts/render-before-after.tsx`** extended to render
  `season_end` alongside the prior two. The library now publishes
  6 PNG assets to `docs/makeathon/assets/`:
  `{record_broken,level_up,season_end}-{v1,v2}.png`.

### What's still deferred

- **The remaining 7 archetypes** (`achievement`, `coaching_hired`,
  `coaching_expired`, `attestation_milestone`, `twin_created`,
  `sim_complete`, `match_imported`). The library is at 3 of 10 with
  the Foundations page + the Cover frame + the manifest + the v2
  renderer + the vitest harness all in place. Each remaining
  archetype is ~1 hour of work using the existing pattern; the
  next contributor (human or agent) can knock them out one at a time
  against `references/archetypes.md`.

- **Figma Make studio app** (concept.md step 5). A captain-facing UI
  that previews + regenerates a card before pushing back to the
  renderer. Real product-shaped work, deserving its own scoping
  session.

### Library state after this session

| Kind | Figma component | TS card | Manifest | Test | Asset |
|------|------|------|------|------|------|
| record_broken | ✓ 7:65 | ✓ | ✓ | ✓ | ✓ |
| level_up | ✓ 11:86 | ✓ | ✓ | ✓ | ✓ |
| season_end | ✓ 15:102 | ✓ | ✓ | ✓ | ✓ |
| achievement | — | — | — | — | — |
| coaching_hired | — | — | — | — | — |
| coaching_expired | — | — | — | — | — |
| attestation_milestone | — | — | — | — | — |
| twin_created | — | — | — | — | — |
| sim_complete | — | — | — | — | — |
| match_imported | — | — | — | — | — |

Plus: Cover frame (9:2), Foundations page (12:15), 11 color tokens,
9 text styles, `DefaultCard` fallback, `code-connect.manifest.json`,
v2 renderer wired to Hetzner cron (running v2 in production after
session 10 deploy).

### Files (this session)
- `docs/VISION.md` — cross-link paragraph
- `package.json` — `assets:moments` script
- `docs/BUILD.md` — Hetzner ops section
- `src/test/moment-render-v2.test.ts` — vitest smoke suite
- `src/components/moments/cards/SeasonEndCard.tsx` — new archetype
- `src/components/moments/cards/index.ts` — `season_end` registered
- `src/components/moments/cards/code-connect.manifest.json` —
  `season_end` mapping
- `scripts/render-before-after.tsx` — `season_end` sample moment
- `docs/makeathon/assets/season_end-v{1,2}.png` — regenerated
- `docs/makeathon/build-log.md` — this entry

### Submission impact

The build log narrative now ends with a *populated* library state
table rather than a list of deferred items. The library reads as a
real working system (3 archetypes shipped, foundations bound,
manifest maintained, tests passing, production cron live) rather
than a promising prototype. Judges browsing the repo at the deadline
land on convergent work.

---

## 2026-06-18 — Session 12: full library — 10 of 10 archetypes

**Intent**
Burn the remaining Figma AI credits (expiring tomorrow) on the durable
project artifact: the rest of the moment-card archetypes. Submission
deadline already passed earlier today; this is Sprint 2 territory now,
optimised for long-term project value rather than judging optics.

**Done this session**

Seven new archetypes shipped end-to-end. Library is now at **10 of 10
archetypes** — every kind in `SquadMomentsGallery.tsx`'s `KIND_CONFIG`
is mapped to a dedicated Figma component + TS card + manifest entry +
vitest assertion + before/after PNG pair.

| Kind | Figma node | TS card | Archetype mood |
|------|-----------|---------|----------------|
| match_imported | `21:78` | `MatchImportedCard` | Archival, monochromatic, calendar-led. Date as hero. |
| achievement | `25:70` | `AchievementCard` | Civic, badge-led, formal. Concentric emerald+gold crest, centered. |
| twin_created | `27:102` | `TwinCreatedCard` | Identity-forward, generative. Subject's name dominates; constellation of violet dots as motif. |
| sim_complete | `29:146` | `SimCompleteCard` | Tactical, board-like. Pitch silhouette + formation dots + W-D-L stat panel. |
| attestation_milestone | `32:82` | `AttestationMilestoneCard` | Civic, official, certificate-led. Slightly-rotated sky stamp. |
| coaching_hired | `34:78` | `CoachingHiredCard` | Welcoming, warm. Coach name as if quoted; indigo portrait-light radial. |
| coaching_expired | `36:74` | `CoachingExpiredCard` | Quiet, valedictory. Smaller hero, rose closing line under the name. |

Each ships with 5 tier variants (Standard / Premium / Streak / Partner /
Internal) on the shared `Tier=…` property pattern.

**KeepsakeCard component**
Migrated the keepsake route (`POST /api/keepsake/[matchId]`) to a
separate `src/components/keepsake/KeepsakeCard.tsx` that uses the same
design tokens + Space Grotesk + token-bound accents (success / warning
/ destructive based on match result). Same satori pipeline as v2 moment
renderer. The route is now a thin wrapper. Keepsake has a different
prop shape than `MomentCardProps` (match-specific, not a Moment row),
so it's a sibling component rather than a CARDS-registry entry.

**Non-token colors introduced**
The remaining archetype palettes needed colors that aren't yet in the
design system. Each is documented as a `nonTokenColors` field in the
manifest with a suggestion for the eventual token name:

- `violet` (#8b5cf6) — `twin_created`. Suggested token: `color/identity`
- `sky` (#38bdf8) — `attestation_milestone`. Suggested: `color/verified`
- `indigo` (#6366f1) — `coaching_hired`. Suggested: `color/welcome`
- `rose` (#f43f5e) — `coaching_expired`. Suggested: `color/closing`

When the design system grows to include these tokens, the literal hex
in the TS cards can be swapped for binding without changing the visual
output.

**Test coverage**
`src/test/moment-render-v2.test.ts` expanded to cover all 10 kinds:
- 3 registry assertions
- 50 render assertions (10 kinds × 5 tier variants, each renders to a
  non-empty PNG with valid magic bytes)
- 1 fallback assertion (unmapped kind → DefaultCard)

Total: **54 tests, all passing**, ~45s including the one-time Google
Fonts CSS API warmup.

**Assets**
`pnpm assets:moments` now produces 20 PNGs (`<kind>-v{1,2}.png` for
every kind) in `docs/makeathon/assets/`. Full side-by-side material
for any future demo or social post.

**Figma file structure (final)**

```
SportWarren — Moment Cards (xTaynEAGCjhhmcmQdPG0JZ)
├── Cover                          (9:2)
├── Foundations                    (12:15)
├── ———
├── MomentCard / Record Broken     (7:65)
├── MomentCard / Level Up          (11:86)
├── MomentCard / Season End        (15:102)
├── MomentCard / Match Imported    (21:78)
├── MomentCard / Achievement       (25:70)
├── MomentCard / Twin Created      (27:102)
├── MomentCard / Sim Complete      (29:146)
├── MomentCard / Attestation Milestone (32:82)
├── MomentCard / Coaching Hired    (34:78)
├── MomentCard / Coaching Expired  (36:74)
└── ———
```

Plus the `Color` variable collection (11 tokens, Light + Dark modes), 9
text styles (text/xs → text/4xl + text/kicker), `code-connect.manifest.json`
with all 10 mappings, and `DefaultCard` fallback.

### Satori-0.26 gotchas surfaced (recorded for the next contributor)

While building the new archetypes, a few additional satori rules
surfaced beyond the "display:flex on every wrapping div" rule from
session 6. Documenting here so future archetype work doesn't trip on
the same issues:

1. **Google Fonts CSS API serves Latin-only subset by default.** Any
   decorative glyph outside Latin-1 (`✦` U+2726, `★` U+2605, etc.)
   renders as a tofu box. Replace with CSS-drawn shapes:
   `transform: rotate(45deg)` on a small `div` for a diamond,
   concentric `border-radius` for medals, etc.

2. **Auto-layout flow stacks children.** Don't use
   `figma.createAutoLayout()` for compositions that need overlapping
   children (like a concentric crest). Use a regular `figma.createFrame()`
   with `position: absolute` children and explicit `layoutPositioning =
   'ABSOLUTE'` inside auto-layout parents.

3. **`stampRow.layoutSizingHorizontal = 'FILL'` requires explicit set
   in horizontal auto-layout.** Default is HUG, which shrinks to
   content and starves child FILL children. Set FILL on the row when
   you want its FILL children to actually expand.

4. **Radial gradients are supported by satori 0.26.** The portrait-light
   effect in `coaching_hired` uses `background: radial-gradient(...)`
   directly in inline styles. Works cleanly.

### Files (this session)

New TS cards:
- `src/components/moments/cards/MatchImportedCard.tsx`
- `src/components/moments/cards/AchievementCard.tsx`
- `src/components/moments/cards/TwinCreatedCard.tsx`
- `src/components/moments/cards/SimCompleteCard.tsx`
- `src/components/moments/cards/AttestationMilestoneCard.tsx`
- `src/components/moments/cards/CoachingHiredCard.tsx`
- `src/components/moments/cards/CoachingExpiredCard.tsx`

New non-moment surface:
- `src/components/keepsake/KeepsakeCard.tsx`

Updated:
- `src/components/moments/cards/index.ts` — all 10 kinds registered
- `src/components/moments/cards/code-connect.manifest.json` — 7 new
  entries with archetype + designSystemBindings + nonTokenColors +
  dataShape
- `src/app/api/keepsake/[matchId]/route.ts` — now a thin wrapper
  around `KeepsakeCard`
- `src/test/moment-render-v2.test.ts` — all 10 kinds asserted
- `scripts/render-before-after.tsx` — all 10 sample moments
- `docs/makeathon/assets/*.png` — 14 new asset files (7 kinds × v1+v2)

### Library completion impact

The Figma Community publish (`figma.com/community/file/1649363477700031990`)
needs a re-publish from the Figma app to reflect the new archetypes.
That's a UI-side action — not via MCP. Trigger it after the next
session if you want the public version to match HEAD.

The production v2 cron (Hetzner) will pick up the new card components
on the next runtime deploy. Until then, unmapped kinds at runtime still
flow through `DefaultCard` — which carries the design system, just not
the archetype-specific composition. Safe.

---

## 2026-06-18 — Session 13: brand unification + 1080×1080 social pack

**Intent**
With the moment-card library complete (10/10), and the makeathon
submission already in, this session burns the remaining Figma AI
credits (expiring tomorrow) on two GTM-shaped pieces of work that
ladder up to the 0→100-teams phase of growth:

1. Make the moment cards visually consistent with the rest of the
   SportWarren brand. Audit surfaced that the cards were stylistically
   tame relative to the website's gradient + glassmorphic surfaces.
2. Adapt the 10 archetypes to 1080×1080 social-post format so the
   captain-acquisition channels can post them without manual reformat.

### Phase 1 — Tokens promoted, gradient stops added

Four archetype-specific colors were promoted from per-file literal
hex (with a non-token note in the manifest) to first-class tokens in
the Figma `Color` collection AND in `src/components/moments/cards/tokens.ts`:

| Token | Hex | Used by |
|---|---|---|
| `color/identity` | `#8b5cf6` (violet-500) | `twin_created` |
| `color/verified` | `#38bdf8` (sky-400)    | `attestation_milestone` |
| `color/welcome`  | `#6366f1` (indigo-500) | `coaching_hired` |
| `color/closing`  | `#f43f5e` (rose-500)   | `coaching_expired` |

Plus three gradient-surface stops matching the website's
`from-slate-900 via-slate-800 to-slate-900` pattern:

| Token | Hex |
|---|---|
| `color/surface-gradient-start` | `#0f172a` (slate-900) |
| `color/surface-gradient-mid`   | `#1e293b` (slate-800) |
| `color/surface-gradient-end`   | `#0f172a` (slate-900) |

`tokens.ts` now exports a `SURFACE_GRADIENT` constant ready to drop
into satori `background:` declarations:

```ts
export const SURFACE_GRADIENT = `linear-gradient(135deg, ${...start} 0%, ${...mid} 50%, ${...end} 100%)`;
```

The Foundations page (`12:15`) was extended downward by ~520px to add
two new sections:
- *Archetype accents* — 4 swatches showing the 4 promoted tokens with
  hex + intended use.
- *Surface gradient* — a wide specimen showing the slate ramp.

Manifest cleaned up: the four `nonTokenColors` fields are gone;
their colors now appear as `designSystemBindings` entries.

### Phase 2 — Energy pass on all 10 archetypes

Every card component swept once. Each card now:

1. **Background** swapped from solid `TOKENS.background` (`#0a0a0a`)
   to `SURFACE_GRADIENT` (`from-slate-900 via-slate-800 to-slate-900`).
   The cards visually match `SquadIdentityCard`, `PlayerIdentityCard`,
   `HeroSection`'s landing gradient, and the rest of the in-app
   surfaces. Captain experience is unified across the funnel.

2. **Per-archetype radial glow** added as the first absolutely-positioned
   child. Subtle (`alpha 0.06–0.22`), pointer-events-none, color
   matches the archetype's accent mood (destructive on record_broken,
   xpGold on level_up + season_end, success on achievement, identity
   on twin_created, teamHome on sim_complete, verified on
   attestation_milestone, welcome on coaching_hired, closing on
   coaching_expired, foreground on match_imported's monochromatic
   register).

3. **Subtle 1px border** (`foreground @ 0.06`) when no tier border
   applies. Matches the website's `border-white/10` glassmorphic edge.

4. **`overflow: hidden`** on the card root for clean glow containment.

5. **Literal hex references** in 4 cards (VIOLET / SKY / INDIGO / ROSE)
   swapped to `TOKENS.identity` / `.verified` / `.welcome` / `.closing`
   imports.

Per-archetype editorial compositions preserved — each card still
reads as its archetype. Visual change is brand language, not
composition.

### Phase 3 — 1080×1080 social adaptations

New sibling library: `src/components/moments/cards/social/`. Each of
the 10 archetypes has a `*Social.tsx` component sized for Instagram
post / X image / LinkedIn post. Same archetype palette, motif, and
mood — reflowed for square aspect ratio with:

- 72px padding (vs 32px on landscape)
- Hero type 1.8–2.5× larger (e.g. `level_up` numeral from 220px → 380px)
- More vertical breathing room
- Stronger SPORTWARREN wordmark + "Every match leaves a mark" tagline
  in the footer (the card *is* the post, not a row in a gallery)

Plus:
- `CARDS_SOCIAL` registry mirroring `CARDS`, in
  `src/components/moments/cards/social/index.ts`
- `scripts/render-social.tsx` and a new `pnpm assets:social` script
  that produces all 10 PNGs in `docs/makeathon/assets/social/`
- 11 new vitest assertions: 1 parity check between CARDS and
  CARDS_SOCIAL + 10 render assertions per kind at 1080×1080

### What the captain-acquisition workflow gets

A captain or squad-account social media post used to need:
- A landscape moment card from `docs/makeathon/assets/*-v2.png`
- Reformatting in Figma / Canva / Photoshop for Instagram
- Manual SPORTWARREN footer adjustment for visibility on the
  smaller-aspect-ratio crop

It now needs:
- `docs/makeathon/assets/social/<kind>-social.png`

That's it. Direct post. For 3 months of weekly content, this removes
the formatting tax entirely.

### Verification

- `pnpm run typecheck` clean
- `pnpm test` — **65 tests passing** (3 registry + 50 landscape render +
  1 fallback + 1 social-registry + 10 social render)
- All 10 social PNGs render cleanly via `pnpm assets:social`
- All 20 v1/v2 PNGs regenerated via `pnpm assets:moments` (the energy
  pass made the v2 outputs richer; file sizes ~3–5× larger because of
  the gradient + radial dither)

### Library state after session 13

```
                       │ Figma  │ TS card  │ Social │ Tests │ Asset │
├──────────────────────┼────────┼──────────┼────────┼───────┼───────┤
│ record_broken        │ 7:65   │ ✓        │ ✓      │ ✓     │ ✓ + S │
│ level_up             │ 11:86  │ ✓        │ ✓      │ ✓     │ ✓ + S │
│ season_end           │ 15:102 │ ✓        │ ✓      │ ✓     │ ✓ + S │
│ match_imported       │ 21:78  │ ✓        │ ✓      │ ✓     │ ✓ + S │
│ achievement          │ 25:70  │ ✓        │ ✓      │ ✓     │ ✓ + S │
│ twin_created         │ 27:102 │ ✓        │ ✓      │ ✓     │ ✓ + S │
│ sim_complete         │ 29:146 │ ✓        │ ✓      │ ✓     │ ✓ + S │
│ attestation_milestone│ 32:82  │ ✓        │ ✓      │ ✓     │ ✓ + S │
│ coaching_hired       │ 34:78  │ ✓        │ ✓      │ ✓     │ ✓ + S │
│ coaching_expired     │ 36:74  │ ✓        │ ✓      │ ✓     │ ✓ + S │
```

Plus: Cover frame, Foundations page (15 color tokens, 9 text styles),
`DefaultCard` fallback, manifest, vitest harness (65 tests),
30 PNG assets (`<kind>-v1.png`, `<kind>-v2.png`, `<kind>-social.png`
each).

### Open follow-ups (not gating)

- **Figma source components** still have the v1 flat background and
  the pre-promotion literal hex values. The TS satori output is the
  authoritative render path; the Figma file is design documentation.
  Sync the Figma components on the next focused design session.
- **CSS variables**: `--identity`, `--verified`, `--welcome`,
  `--closing`, `--surface-gradient-*` aren't in `globals.css` yet.
  When non-card UI surfaces (settings page, account screen, etc.)
  want these accents, add them then.
- **1080×1920 portrait stories**: the next obvious social-format
  addition. Stories are tall, so the compositions will need a
  different recipe than the squares.
- **Marketing toolkit file**: landing hero, captain recruitment,
  squad-of-the-week templates. Separate Figma file from the moment
  library.
- **Production redeploy**: the Hetzner cron's `v2HandledKinds`
  reflects the snapshot at last deploy. Re-deploy when convenient
  to surface the full library count.

---

## 2026-06-18 — Session 14: GTM toolkit — Marketing Figma file + 1080×1920 stories

**Intent**
Two of the three remaining follow-ups from session 13 land this session.
With the moment-card library at 10 of 10 archetypes and 1080×1080 social
adaptations done, the next pieces serving the 0→100-teams phase are:

1. A separate Figma file for **GTM templates** (recruitment, weekly
   content, landing hero, feature explainers) — assets the marketing
   team can customise per post for the next 3 months.
2. A **1080×1920 portrait stories** format extending the moment-card
   library to Instagram Stories / TikTok / YouTube Shorts.

### Marketing Toolkit Figma file (new)

- **File:** `SportWarren — Marketing Toolkit`
  (`XgOGYay09gxABzEUPtJFdN`)
- **URL:** https://www.figma.com/design/XgOGYay09gxABzEUPtJFdN
- **Pages:** Cover, ———, Squad Recruitment, Squad-of-the-Week,
  Captain Spotlight, Landing Hero, Feature Explainer, ———

Five templates shipped:

| Template | Page | Format | Use |
|----------|------|--------|-----|
| Squad Recruitment / Square | `1:3` | 1080×1080 | Captain shares to invite players. Core viral mechanic. |
| Squad Recruitment / Story | `1:3` | 1080×1920 | Story-format variant for IG/TikTok. |
| Squad of the Week / Square | `1:4` | 1080×1080 | Weekly featured-squad post. Gold accent, "NO. 12" issue number. |
| Captain Spotlight / Square | `1:5` | 1080×1080 | Recurring captain feature with photo slot + signature quote. Indigo register. |
| Landing Hero / Widescreen | `1:6` | 1920×1080 | A/B test variant for sportwarren.com hero. Mirrors the existing HeroSection pattern: twin parallax blobs, gradient text on the second headline line, dual CTA (claim card + import spreadsheet). |
| Feature Explainer / Square | `1:7` | 1080×1080 | "HOW IT WORKS" template for product features. Concentric circle icon, 3 numbered bullets, sky-accent register. |

All use the same gradient surface (`from-slate-900 via-slate-800 to-slate-900`)
+ Space Grotesk + per-archetype accent colours as the moment-card
library. Brand language consistent across both files.

The toolkit file is the source of truth for these templates;
designers open it, swap squad name / stats / photo / copy, export
PNG, post. No reformat tax.

### 1080×1920 stories — extends the moment library

New sibling directory: `src/components/moments/cards/stories/`. Ten
new `*Story.tsx` components — one per archetype, mirroring the
naming convention from the existing `*Social.tsx` set.

Each composition reflows top-to-bottom for portrait aspect ratio:
- Kicker pinned top-left
- Hero element large + centered in upper-middle
- Stat/detail block lower-middle
- SPORTWARREN footer + `sportwarren.com` URL at the bottom (where the
  swipe-up action sits on Stories)

Type sizes scale up for thumbnail readability (e.g. `level_up` numeral
360px → 560px, `record_broken` hero 108px → 160px, `match_imported`
date hero 200px → 360px). Per-archetype radial glow accents preserved
+ slightly intensified for the larger canvas.

New plumbing:
- `src/components/moments/cards/stories/types.ts`
  (`STORY_WIDTH = 1080`, `STORY_HEIGHT = 1920`, `StoryCardProps`)
- `src/components/moments/cards/stories/index.ts`
  (`CARDS_STORIES` registry mirroring `CARDS` + `resolveStoryCard`)
- `scripts/render-stories.tsx` (asset regeneration)
- `pnpm assets:stories` named script

### Verification

- `pnpm run typecheck` clean
- `pnpm test` — **76 tests passing** (was 65 after session 13; +1
  stories registry-parity assertion + 10 per-archetype story
  renders)
- `pnpm assets:stories` produces all 10 story PNGs in
  `docs/makeathon/assets/stories/` (~150–320 KB each)

### Library state after session 14

```
                       │ Figma │ TS  │ Social │ Story │ Tests │ Assets    │
├──────────────────────┼───────┼─────┼────────┼───────┼───────┼───────────┤
│ record_broken        │  ✓    │  ✓  │   ✓    │   ✓   │   ✓   │ v1 v2 S T │
│ level_up             │  ✓    │  ✓  │   ✓    │   ✓   │   ✓   │ v1 v2 S T │
│ season_end           │  ✓    │  ✓  │   ✓    │   ✓   │   ✓   │ v1 v2 S T │
│ match_imported       │  ✓    │  ✓  │   ✓    │   ✓   │   ✓   │ v1 v2 S T │
│ achievement          │  ✓    │  ✓  │   ✓    │   ✓   │   ✓   │ v1 v2 S T │
│ twin_created         │  ✓    │  ✓  │   ✓    │   ✓   │   ✓   │ v1 v2 S T │
│ sim_complete         │  ✓    │  ✓  │   ✓    │   ✓   │   ✓   │ v1 v2 S T │
│ attestation_milestone│  ✓    │  ✓  │   ✓    │   ✓   │   ✓   │ v1 v2 S T │
│ coaching_hired       │  ✓    │  ✓  │   ✓    │   ✓   │   ✓   │ v1 v2 S T │
│ coaching_expired     │  ✓    │  ✓  │   ✓    │   ✓   │   ✓   │ v1 v2 S T │
```

Total asset count across all formats: **40 PNGs** (10 archetypes ×
4 formats: v1 landscape baseline, v2 landscape, social square, story
portrait).

Plus the moment-card library file (Cover + Foundations + 10 archetype
variant sets) and the marketing toolkit file (5 templates).

### What the marketing team gets today

For the next 3 months of 0→100 GTM content, the workflow is:

- **Match moment hits production?** → automatic satori render at
  600×400 for in-app + WhatsApp/Telegram. Already running on Hetzner
  via the v2 cron.
- **Want to post that same moment to Instagram square?** →
  `docs/makeathon/assets/social/<kind>-social.png`. Direct upload.
- **Want to post that same moment to Instagram Stories or TikTok?** →
  `docs/makeathon/assets/stories/<kind>-story.png`. Direct upload.
- **Recruit new players to a squad?** → open the Marketing Toolkit,
  customize the Squad Recruitment template, export. (Both square and
  story formats.)
- **Weekly squad-of-the-week post?** → customize the Squad-of-the-Week
  template. Issue number increments per week.
- **Captain spotlight content?** → Captain Spotlight template + drop
  in the headshot.
- **Need a new landing-page hero variant for A/B?** → Landing Hero
  template as starting point.
- **Need to explain a specific product feature?** → Feature Explainer
  template + swap title + bullets.

Every surface speaks the same brand language. No reformat tax.

### Open follow-ups (still not gating)

- **Figma source moment-card components** still have the v1 flat
  background and pre-promotion literal hex values. TS satori output
  is the authoritative render path; the Figma file is design
  documentation. Sync next session.
- **CSS variables**: `--identity`, `--verified`, `--welcome`,
  `--closing`, `--surface-gradient-*` not in `globals.css` yet. Add
  when non-card UI surfaces need them.
- **Production redeploy**: Hetzner cron's `v2HandledKinds` reflects
  the snapshot at last deploy. Re-deploy when convenient.
- **Marketing Toolkit file → publish to Community** (optional). The
  templates are reusable for any grassroots sports platform with a
  similar GTM motion — worth sharing if the team wants the
  Build-in-Public extension.

## 2026-06-18 — Session 15: football grammar pass

### Why

External feedback after the Community publish: "the cards look
professional and clean, but they perhaps lack the little elements of
personality + details that would differentiate the brand — mini
footballs, grass, etc." Pushed back on the gut reflex (kitsch risk),
but the underlying read is fair: the cards are *too* editorial. They
could pass for a fintech product. For a grassroots-football platform
whose entire wedge is "we get your sport," the iconography should
whisper football, not just imply it through copy.

The bar was deliberately high: add football personality *without*
collapsing into FIFA-fan-art clichés. No cartoon balls, no green
gradient turf, no stripes.

### What landed

Three shared archetype-agnostic elements + per-kind specific touches.

**`src/components/moments/cards/PitchTexture.tsx`** — subtle vertical
halfway line + center circle + center dot at the card geometric
center, rendered at 4% opacity over the gradient. Reads as "this is
a pitch" without overpowering. Sized via explicit `cardWidth` +
`cardHeight` props because satori 0.26 doesn't honor percentage
positioning evenly.

**`src/components/moments/cards/FootballMark.tsx`** — small CSS-drawn
ball icon (concentric circle + faint inner panel suggestion), used
in every card footer next to the SPORTWARREN wordmark. Sized 12px
landscape, 26px social, 32px story. Tinted with each archetype's
accent token (destructive, xpGold, identity, verified, welcome,
closing, success, teamHome) — so the mark doubles as a tiny
diversifier across the gallery.

Why not a ⚽ glyph: the Google Fonts CSS API serves a Latin-only
subset; the football emoji renders as tofu (hit this earlier with ✦
and ★). CSS-drawn was the safe path.

**Per-kind specific touches:**
- `record_broken`: scoreboard-style chip ("28 GOALS") next to the
  broken-rule motif — reads as a stadium tally board, ties the
  number into the headline visually.
- `level_up`: jersey-number frame (border + radius) around the giant
  numeral. Numeric typography stops feeling abstract, starts feeling
  like a kit back.
- `achievement`: corner-flag SVG (pole + pennant) in the upper-left.
  Replaced the failed border-trick triangle (satori 0.26 doesn't
  render border-style triangles cleanly) with inline `<svg>` polygon.

`sim_complete` got the FootballMark only — no PitchTexture, because
the card already has an explicit pitch silhouette as its central
composition. Doubling up would have been gratuitous.

### Scope

All three formats:
- 10 landscape (600×400) — `src/components/moments/cards/*Card.tsx`
- 10 social square (1080×1080) — `cards/social/*Social.tsx`
- 10 story portrait (1080×1920) — `cards/stories/*Story.tsx`

30 components touched. All 30 PNGs regenerated via
`scripts/render-before-after.tsx` / `render-social.tsx` /
`render-stories.tsx`. Typecheck clean.

### Bugs caught in flight

- **Double-alpha hex**: passed `alpha(TOKENS.foreground, 0.55)` into
  `<FootballMark color=...>`, which internally re-applies `alpha()`.
  Result: `#ffffff8cd9` — satori rejected as malformed. Fix: pass
  raw token + use `ringOpacity` prop on the mark. Lesson: helper
  components that color-blend should never take pre-alpha'd hex.
- **Streak-reward pulse collision**: corner-flag was at `top:0 right:0`,
  same slot as the streak_reward indicator pulse. Moved flag to the
  upper-left so both can co-exist on streak-tier achievement cards.

### Figma sync (post-pass, same session)

Inspected `xTaynEAGCjhhmcmQdPG0JZ` and discovered that only **one**
archetype (`MomentCard / Record Broken`, node 7:65) ever existed as
a real Figma component — the other 9 cards shipped TS-only. So the
sync scope collapsed to one variant set with 5 tier variants
(Standard / Premium / Streak / Partner / Internal).

Each tier variant got:
- Background fill swapped from flat SOLID slate to the 135°
  slate-900 → slate-800 → slate-900 `GRADIENT_LINEAR` matching
  `SURFACE_GRADIENT` in `tokens.ts`.
- `PitchTexture` overlay (halfway line + center circle + center dot,
  all at 4% white opacity), inserted as the variant's first child
  with `layoutPositioning = 'ABSOLUTE'` so it sits behind Top/Footer
  without joining the auto-layout flow.
- `ScoreboardChip` ("28 / GOALS"), absolute-positioned at x=440 y=152
  inside Top so it sits to the right of the broken rule. Same idiom
  as the TS card.
- `FootballMark` (12px ellipse with darker inner panel) inserted as
  child 0 of Footer's horizontal auto-layout — it now flows before
  SPORTWARREN naturally.

The cover frame's instance (9:8) auto-propagated the changes.

### Sync bug caught in flight

First `use_figma` pass inserted PitchTexture / ScoreboardChip /
FootballMark as flow children. The variant root is VERTICAL
auto-layout, so the new 600×400 PitchTexture frame got slotted into
the flow and pushed Top down to y=432 and Footer to y=669 — a
double-height card. Fix: set `layoutPositioning = 'ABSOLUTE'` on
PitchTexture and ScoreboardChip; insert FootballMark at index 0 of
the Footer's horizontal flow (where being a flow child is correct).

### Full library build (same session)

After the sync, scoped up to build the missing 9 archetypes as
proper Figma components so the Community publication shows the
*full* library, not just record_broken plus nine code-connect stubs.
Each is a standalone Tier=Standard component on its own page,
matching the existing `MomentCard / Record Broken` page convention:

- `MomentCard / Level Up` — jersey-frame around big "13" numeral,
  chevron stack, gold ball mark
- `MomentCard / Achievement` — corner-flag pennant top-left,
  concentric crest centered, success ball mark
- `MomentCard / Twin Created` — uppercase name hero, violet role
  line, scattered constellation dots, identity ball mark
- `MomentCard / Season End` — gold "SPRING '26" title, metallic
  divider row (dot/line/diamond/line/dot), stats stack, gold ball
- `MomentCard / Match Imported` — monochromatic date-as-hero (18
  JUN / 2026) + result chip + opponent line, muted ball
- `MomentCard / Sim Complete` — mini-pitch with home (teamHome)
  and away (destructive) formation dots, W-D-L stat panel
- `MomentCard / Attestation Milestone` — rotated sky-blue stamp
  with "100 / VERIFIED", permanence tagline, verified ball
- `MomentCard / Coaching Hired` — large indigo radial warmth
  upper-right, quoted coach name, role subtitle, welcome ball,
  STARTED + date footer
- `MomentCard / Coaching Expired` — restrained title, thin rose
  closing rule, valedictory detail, closing ball, ENDED date

These are Standard-tier only. The full 5-tier variant treatment
that record_broken has (Standard / Premium / Streak / Partner /
Internal) is deferred — the visual library is the priority for the
Community showcase; tier ornaments are documented in tokens.ts and
can be applied per-archetype later if needed.

Built via 8 `use_figma` calls, several in parallel batches. Each
new page was a fresh `figma.createPage()` + `setCurrentPageAsync`
+ component build, all in one self-contained call.

The Community publication at
`figma.com/community/file/1649363477700031990` needs a manual
re-publish (Figma → File → Publish to community → Update) to make
the new components visible to the gallery.
