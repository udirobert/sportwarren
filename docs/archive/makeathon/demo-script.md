# Walkthrough Video — Shoot Script

Target length: **75–90 seconds**. Loom screen recording with voiceover is enough.

Format every scene as: **[time] [what's on screen] — voiceover.** Hard cuts between scenes are fine; no transitions needed.

---

## Cold open · 0:00–0:08

**On screen:** Editor with `src/server/services/personalization/moment-render.ts` open. Cursor highlights the line:

```ts
background: linear-gradient(135deg, #0f172a, #1e293b);
... fontFamily: Inter ...
```

**VO:**
> "SportWarren shipped one card template for every moment a squad would want to remember. Same gradient. Same font. Inside a product whose own design system explicitly rejects both."

---

## The contradiction · 0:08–0:15

**On screen:** `docs/DESIGN_TOKENS.md`, scroll to the *"Why not Inter/Segoe/System?"* block.

**VO:**
> "From the project's own docs: Inter is the AI-slop font. Use Space Grotesk. The renderer ignored it."

---

## The skill · 0:15–0:25

**On screen:** `.claude/skills/sw-moments/SKILL.md` open, then a terminal showing `/sw-moments` being invoked in Claude Code, with the agent reading `moment-render.ts` and `DESIGN_TOKENS.md`.

**VO:**
> "I built a Claude Code skill that grounds itself in the codebase and the tokens, then generates a Figma library — one component per moment kind, each on the design system, each bound to the Figma variables that mirror the CSS custom properties in the app."

---

## The library · 0:25–0:42

**On screen:** Figma file. Land on the Cover frame. Pan to Foundations (11 token swatches). Pan to `MomentCard / Record Broken` variant set (5 tiers visible). Pan to `MomentCard / Level Up` variant set.

**VO:**
> "Two archetypes shipped end-to-end. Record-broken — oversized type as imagery, destructive red, a shattered horizontal rule. Level-up — a giant numeral as the hero, gold and emerald, a chevron stack suggesting growth. Same design tokens. Same Tier variant property. Completely different mood."

---

## Before / after · 0:42–0:55

**On screen:** Split layout — `docs/makeathon/assets/record_broken-v1.png` on the left, `record_broken-v2.png` on the right. Hold for ~5s. Switch to `level_up-v1.png` vs `level_up-v2.png`.

**VO:**
> "Here's what shipped before. Here's what ships now. Both rendered through the same satori pipeline, both seeded by the same Moment row — the only thing that changed is what's in the registry."

---

## The honest moment · 0:55–1:05

**On screen:** Editor showing the comment block in `scripts/render-before-after.tsx` that documents the discovery:

> *"v1 calls satori(htmlString, …), but satori 0.26 only accepts JSX … v1 has been silently broken in production."*

**VO:**
> "Building this also surfaced a production bug — v1 had been passing an HTML string to a renderer that only accepts JSX, so it rendered the raw source code as text. The old slop template wasn't even running as designed. v2 fixes both the design system and the bug."

---

## The bridge · 1:05–1:15

**On screen:** `src/components/moments/cards/code-connect.manifest.json` — the JSON manifest with the Figma node ids → TS source mapping. Then a quick cut to `scripts/maintenance/moment-render.ts` showing the import:

```ts
import { renderPendingBatch as renderV2 } from '...moment-render-v2.js';
```

**VO:**
> "Code Connect is Org-or-Enterprise only. On Pro tier I hand-rolled the manifest — same shape of data Code Connect would store. The production cron — Hetzner, pm2 — now defaults to v2. v1 stays available as the rollback."

---

## Reproducibility · 1:15–1:25

**On screen:** `README.md` scrolled to the *Moment card library — reproduce this build* section, then a quick scroll through `docs/makeathon/REPRODUCE.md`.

**VO:**
> "The skill is in the repo. The build log documents every pivot, including the blockers. The before/after script reproduces from any fresh clone. Anyone with a shareable-card surface can apply the same workflow."

---

## Live cron proof · 1:25–1:35

**On screen:** Terminal window showing the curl command and the live payload from `docs/makeathon/assets/cron-payload.json`:

```bash
$ curl -H "Authorization: Bearer $SECRET" \
    https://api.sportwarren.com/api/cron/moment-render?v=2
{
  "processed": 0,
  "renderer": "v2",
  "v2HandledKinds": ["record_broken", "level_up"],
  "byKind": {},
  "fallbackCount": 0,
  "failed": 0
}
HTTP 200
```

Highlight `"renderer": "v2"` and `"v2HandledKinds"`.

**VO:**
> "This isn't a mock. The production cron is running v2 right now. The response payload tells you which archetypes are routed through dedicated cards, which fall back to the default — observable rollout to a fully-mapped library."

---

## Close · 1:35–1:45

**On screen:** End card. Centered text:

```
SportWarren — Every match leaves a mark.

Live:        sportwarren.com
Repo:        github.com/udirobert/sportwarren
Library:     figma.com/community/file/1649363477700031990
Working:     figma.com/design/xTaynEAGCjhhmcmQdPG0JZ

#ConfigMakeathon  ·  @figma
```

**VO (optional):**
> "Built for the 265 million footballers nobody films."

---

## Shoot notes

- **Voice over after the fact** is easier than narrating live. Record screen movements first, then read the script over the top in a separate Loom session or in a video editor.
- **Pace:** Aim for ~150 words per minute. The script above is ~290 words → roughly 110 seconds at conversational pace, ~85 seconds if you clip pauses.
- **Cursor cuts:** When jumping between files, hard-cut. Don't show the file explorer click — judges don't care about your IDE.
- **Figma scene:** Best to pre-position the canvas at the right zoom for each component set before recording. Don't show yourself zooming around.
- **Asset paths used in the video:**
  - `docs/makeathon/assets/record_broken-v1.png`
  - `docs/makeathon/assets/record_broken-v2.png`
  - `docs/makeathon/assets/level_up-v1.png`
  - `docs/makeathon/assets/level_up-v2.png`
  - `docs/makeathon/assets/season_end-v1.png`
  - `docs/makeathon/assets/season_end-v2.png`
  - `docs/makeathon/assets/cron-payload.json` (for the live cron beat)
- **Captions:** Loom auto-captions. Review them — "satori" and "Hetzner" will mis-transcribe.

## Social post — three platform variants

### X / Twitter (single post, ≤280 chars)

```
Built for the 265M grassroots footballers Opta will never measure.

SportWarren shipped one shareable card per match. I rebuilt the renderer through a Figma MCP ↔ code loop — design-system-bound, per-archetype, now live in production.

🎬 [video link]
🧵 [thread link]

#ConfigMakeathon @figma
```

### X / Twitter (thread version, recommended)

```
1/ Built for the 265 million grassroots footballers Opta will never
   measure.

   SportWarren preserves every Sunday-league match. Their card
   renderer was generic AI slop. I rebuilt it through a Figma MCP
   workflow.

   [v1-vs-v2 image]

   #ConfigMakeathon @figma

2/ The old template:
   • One layout for every kind of moment
   • Inter — explicitly rejected by their own design tokens
   • 135° gradient — the AI slop default
   • Silently broken in prod (satori 0.26 doesn't parse HTML strings)

   [v1 PNG]

3/ The new pipeline:
   → MCP reads the codebase + design tokens
   → Agent generates a Figma library, one archetype per kind
   → A manifest binds Figma nodes to TS components (Pro-tier
     substitute for Code Connect)
   → satori renders the cards using the design system

   [v2 PNGs]

4/ 3 of 10 archetypes shipped. Each visually distinct:

   🔴 Record broken — type as imagery
   🟡 Level up — giant numeral hero
   🟢 Season end — retrospective poster

   Production cron is running v2 right now. v1 is the rollback.

   [variant set screenshot]

5/ Everything reproducible:

   Skill: github.com/udirobert/sportwarren/tree/main/.claude/skills/sw-moments
   Build log: github.com/udirobert/sportwarren/blob/main/docs/makeathon/build-log.md
   Figma library: figma.com/community/file/1649363477700031990

   Same workflow applies to any project with a shareable-card surface.
```

### LinkedIn (long-form)

```
Built for the 265 million grassroots footballers Opta will never measure.

SportWarren is a preservation product — every Sunday-league match logged, every moment shareable. Their card renderer was generic AI slop: one Inter+gradient template for every kind of moment, in a product whose own design docs explicitly reject Inter.

For Config Makeathon I rebuilt the renderer through a Figma MCP ↔ code workflow:

→ MCP reads the existing codebase + design tokens
→ Claude Code generates a Figma library, one archetype per moment kind
→ A hand-maintained manifest binds Figma nodes to TS components (Pro-tier substitute for Code Connect, which requires Org/Enterprise)
→ A new satori renderer pulls the right card per kind, falls back gracefully for unmapped ones
→ Webpack-standalone artifact, native binaries injected for Linux, CI smoke test, all of it

3 of 10 archetypes shipped end-to-end — record broken (type-as-imagery), level up (numeral-as-hero), season end (poster). Production cron is running v2 right now; v1 is the documented rollback.

The build log documents 11 working sessions, including the bugs we surfaced along the way: a silently-broken Inter font URL, a satori-0.26 string-vs-VNode regression, a Turbopack chunk-name path leak. Honest about what worked and what didn't.

Workflow is reusable — anyone with a shareable-card surface (achievement screens, social cards, certificate generators) can clone the skill and apply it. Recipe in the repo.

Figma library: lnkd.in/[community-link]
Repo: github.com/udirobert/sportwarren
Live: sportwarren.com

#ConfigMakeathon @Figma

Built with @Anthropic Claude Code, Figma MCP, and Figma's Design Agent.
```

### Instagram (caption — works for reel or carousel)

```
Every match leaves a mark. Even the Sunday-league ones nobody filmed.

🎯 Built for the 265 million grassroots footballers Opta will never measure.

SportWarren records every match, every rating, every moment — and turns them into shareable cards. The renderer used to be generic AI slop. I rebuilt it through a Figma ↔ code loop with the MCP server: code reads → library generates → manifest binds → cards ship.

3 of 10 archetypes shipped. Production cron is live with the new pipeline. Build log + reusable skill in the repo so anyone can copy the workflow.

Repo: github.com/udirobert/sportwarren
Figma library: link in bio
Live: sportwarren.com

Made for #ConfigMakeathon — @figma
.
.
.
#designsystems #figma #figmadesign #designtools #grassrootsfootball #amateurfootball #footballdesign #sportstech #buildinpublic #aiworkflow #anthropic #claudecode #generativedesign #shareablemoments #footballmoments #everymatchleavesamark
```

### Hashtag variants (pick per platform)

- **Always include (qualifying):** `#ConfigMakeathon` `@figma`
- **Discovery boosters (X, IG):** `#FigmaMCP` `#BuildInPublic` `#SportsTech` `#DesignSystems`
- **Audience-specific (LinkedIn):** `@Anthropic` `@Vercel` `#FigmaAgent`
