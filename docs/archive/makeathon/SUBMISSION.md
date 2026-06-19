# Submission Checklist

Single-page handoff for finishing the Config Makeathon submission.
Tonight's deadline: **2026-06-18, 11:59pm PDT.**

---

## 1. Record the walkthrough video

Target: **75–110 seconds**. Loom or QuickTime screen recording with voiceover.

Script lives in [`demo-script.md`](demo-script.md). Nine scenes, all
timed, with the live cron payload as the closer.

### Quick shoot list

1. **Cold open** — Editor with `src/server/services/personalization/moment-render.ts`. Highlight the `linear-gradient(135deg)` line. VO: *"SportWarren shipped one card template…"*
2. **The contradiction** — `docs/DESIGN_TOKENS.md`, scroll to *"Why not Inter"*. VO: *"…in a product whose own design system explicitly rejects it."*
3. **The skill** — `.claude/skills/sw-moments/SKILL.md` open; quick `/sw-moments` invocation in Claude Code. VO: *"I built a skill that grounds itself in the codebase…"*
4. **The library** — Figma Community page, pan across Cover → Foundations → Record Broken variants → Level Up variants → Season End variants. VO: *"Three archetypes shipped end-to-end…"*
5. **Before / after** — `docs/makeathon/assets/record_broken-{v1,v2}.png` side by side. Repeat for `level_up` and `season_end`. VO: *"Here's what shipped before. Here's what ships now."*
6. **The honest moment** — Comment block in `scripts/render-before-after.tsx`. VO: *"Building this surfaced a production bug…"*
7. **The bridge** — `code-connect.manifest.json` then `scripts/maintenance/moment-render.ts`. VO: *"Code Connect requires Org or Enterprise. On Pro tier I hand-rolled the manifest."*
8. **Live cron proof** — Terminal showing curl response from `docs/makeathon/assets/cron-payload.json`. VO: *"This isn't a mock. The production cron is running v2 right now."*
9. **Close** — End card with links + `#ConfigMakeathon @figma`.

### Recording tips

- Record screen actions first, voiceover after — easier to pace
- Pre-position the Figma canvas at correct zoom for each scene
- Hard-cut between files; don't show file-explorer clicks
- Loom auto-captions will mis-transcribe "satori" and "Hetzner" — review them
- Target ~150 words per minute conversational pace

---

## 2. Post to social

Three platform-appropriate variants are drafted in [`demo-script.md`](demo-script.md) under "Social post — three platform variants". Copy whichever fits where you're posting.

### Must-have hashtags / tags (qualifying)
- `#ConfigMakeathon`
- `@figma`

### Best platform pick by award strategy
- **X / Twitter (thread)** → Build-in-Public + Innovative Workflow visibility
- **LinkedIn (long-form)** → Building with Purpose + reach to design-tools audience
- **Instagram (carousel)** → Community Favorite scroll-stop

Post to **at least one** to qualify. Posting to all three covers all bases and the only marginal cost is the post-time.

### Attachments per platform
- **X**: thread with the v1-vs-v2 PNGs from `docs/makeathon/assets/` + a 30s video clip
- **LinkedIn**: long-form text + carousel (v1/v2 pairs for all three archetypes)
- **Instagram**: reel/carousel of v2 PNGs and the live cron payload

---

## 3. Submit on Contra

The Contra submission form asks for these fields. Pre-filled answers below.

| Field | Value |
|-------|-------|
| **Walkthrough video** | [your video URL from step 1] |
| **Live project link** | `https://sportwarren.com` |
| **Community / working file link** | `https://www.figma.com/community/file/1649363477700031990` |
| **Repo link** | `https://github.com/udirobert/sportwarren` |
| **Social post URL(s)** | [your post URL(s) from step 2] |
| **Description** | See "Submission description" below |

### Submission description (copy-paste ready)

```
SportWarren — Moment Cards

Built for the 265 million grassroots footballers professional analytics never reach. SportWarren preserves every Sunday-league match; the renderer that produced its shareable moment cards was generic AI slop — one Inter+gradient template for every kind of moment, in a product whose own design docs explicitly reject Inter.

For Config Makeathon I rebuilt the renderer through a Figma MCP ↔ code loop:

1. MCP reads the codebase + design tokens
2. Claude Code generates a Figma library — one archetype per moment kind
3. A hand-maintained manifest binds Figma nodes to TS components (Pro-tier substitute for first-party Code Connect, which requires Org/Enterprise)
4. A new satori renderer routes each moment kind through its dedicated archetype
5. Production cron flipped to v2 — v1 is the documented rollback

3 of 10 archetypes shipped end-to-end: record broken (type-as-imagery), level up (numeral-as-hero), season end (retrospective poster). Foundations page, Cover frame, vitest harness, CI smoke test, before/after PNG assets, and the reproducible Claude Code skill all in place.

The build log at docs/makeathon/build-log.md documents 11 working sessions and the production bugs surfaced along the way: a silently-broken Inter font URL, a satori-0.26 string-vs-VNode regression, a Turbopack chunk-name path leak. Honest about what landed and what was deferred.

The workflow is reusable. Any project with a shareable-card surface (achievement screens, social cards, certificate generators, OG images) can clone the skill and apply it. Recipe in docs/makeathon/REPRODUCE.md.

Built with Figma MCP, the Figma agent, and Claude Code. Production deploy: Hetzner under pm2.
```

---

## 4. After submission

### Tonight, optional
- Push a redeploy that includes the `season_end` archetype so the production cron's `v2HandledKinds` list shows 3, not 2. Cosmetic — only relevant if a judge re-checks the live cron after watching the video.

### Sprint 3 (post-deadline, no rush)
- Remaining 7 archetypes
- Visual energy pass on existing 3 (pitch-line backgrounds, per-archetype color washes — see prior conversation for options)
- Migrate `keepsake` route to use the CARDS pattern
- Figma Make studio app (concept.md step 5)

---

## Quick links

- Figma library (Community): `https://www.figma.com/community/file/1649363477700031990`
- Figma working file: `https://www.figma.com/design/xTaynEAGCjhhmcmQdPG0JZ`
- Repo: `https://github.com/udirobert/sportwarren`
- Live: `https://sportwarren.com`
- Demo script: `docs/makeathon/demo-script.md`
- Build log: `docs/makeathon/build-log.md`
- Reproduce guide: `docs/makeathon/REPRODUCE.md`
- Cron payload sample: `docs/makeathon/assets/cron-payload.json`
- v1/v2 PNG pairs: `docs/makeathon/assets/{record_broken,level_up,season_end}-{v1,v2}.png`
