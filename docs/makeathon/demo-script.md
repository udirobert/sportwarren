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

## Close · 1:25–1:30

**On screen:** End card. Centered text:

```
SportWarren — Every match leaves a mark.

github.com/udirobert/sportwarren
figma.com/design/xTaynEAGCjhhmcmQdPG0JZ

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
- **Captions:** Loom auto-captions. Review them — "satori" and "Hetzner" will mis-transcribe.

## Social post (companion)

The Tweet/LinkedIn/Instagram caption can be derived from the script's cold open + the close:

> "Built for the 265 million footballers nobody films.
>
> SportWarren shipped one card template for every match moment — generic gradient, generic font. So I built an AI design pipeline: Figma MCP reads the codebase, generates a per-archetype library, swaps it into the satori renderer. v2 is now the production cron.
>
> Full build log + reproducible skill in the repo.
>
> #ConfigMakeathon @figma"
