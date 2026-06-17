# Concept — Designed-by-AI Moment Cards for SportWarren

## The problem (the "purpose" story)
265 million registered amateur footballers worldwide play in a context where
professional analytics infrastructure (Opta, Wyscout) doesn't reach. The
moments that matter — a last-minute winner, a comeback, a debut, a record
broken — vanish by the next Saturday. SportWarren's whole pitch is that those
moments should be preserved. The README says it plainly: *"every verified
match produces a moment — a shareable card designed to be saved, screenshotted,
looked at years later."*

The cards exist today. They are rendered by
`src/server/services/personalization/moment-render.ts` using satori + resvg.
Every card looks the same: hardcoded `linear-gradient(135deg, #0f172a, #1e293b)`,
Inter font, identical composition regardless of whether the moment is a
`season_end` or a `record_broken` or a `twin_created`. Tier color is the only
variable. The renderer ships PNGs, but it doesn't actually *honor* the
"designed to be saved" promise.

It also uses Inter — which `docs/DESIGN_TOKENS.md` explicitly rejects:
> *"Inter and system fonts are overused in AI-generated UIs. Space Grotesk
> gives a sport-tech character that aligns with the brand."*

The renderer is a generic AI-slop card factory inside a product whose design
philosophy explicitly rejects generic AI slop.

## The idea
Replace the templated renderer with an **AI design pipeline that produces a
uniquely-composed card per moment**, bound to SportWarren's actual design
tokens (Space Grotesk, semantic colors, team-home/away palette, anti-slop
guardrails), generated in Figma, then synced back into the satori renderer via
Code Connect.

Each moment kind gets its own visual archetype:
- `record_broken` — emphatic, oversized type, red accent break
- `season_end` — trophy-led, gold and emerald, retrospective layout
- `twin_created` — generative, violet, abstract, identity-forward
- `coaching_hired` — warm, indigo, welcoming
- `match_imported` — archival, monochrome, calendar-led
- `attestation_milestone` — civic, sky, badge-led

Inside each archetype, the agent composes a fresh layout per instance — varying
type weight, image vs. negative space, emphasis, ribbon vs. badge — so no two
cards in the same kind look identical either.

## Why it's a novel workflow (the "workflow" story)
A team building this manually would design one template per kind in Figma,
slice them, hardcode them in satori, and call it done. That's templating with
extra steps.

What we're doing instead:
1. **Read** the existing renderer + the design system docs + the component code
   via Figma MCP — the agent grounds itself in `moment-render.ts`, the kind
   taxonomy (10 kinds with tier metadata), and `DESIGN_TOKENS.md`.
2. **Generate** a Figma library of moment-card components — one variant set per
   kind, each visually distinct, each bound to the project's design system
   tokens. Generation respects the explicit "AI slop guardrails" from
   `DESIGN_TOKENS.md` (no uniform card grids, no Inter, no generic
   gradient-and-shadow defaults).
3. **Map** the Figma components to TS implementations via **Code Connect**.
4. **Replace** the satori template with a generative pipeline: agent reads a
   moment row → picks the archetype → composes a fresh layout within it →
   renders to PNG via satori using a component pulled from the Code Connect
   map.
5. **Build a Figma Make app** that's a live "moment card studio" — squad
   captains preview a moment, regenerate the card design with one click, push
   the chosen design back into the rendering pipeline.

Pipeline:
**Existing code (satori renderer) → MCP read → Figma generate library →
Code Connect map → Figma Make studio → satori renderer (new).**

That's a true round trip: code → design → code. The Figma agent's headline
pitch, instantiated on a real product surface.

## Demo (the video)
1. Open `moment-render.ts`. Show the hardcoded HTML template. Show a wall of
   identical-looking cards in the product. Quote the DESIGN_TOKENS.md
   anti-slop section.
2. Run `/sw-moments` skill in Claude Code. Show MCP reading the codebase and
   design tokens.
3. Cut to Figma: library of moment card components materializes, one archetype
   per kind, on the design system.
4. Show Code Connect mapping these to TS components.
5. Cut to the Figma Make app — captain previews "Sunday's win against
   Ballygally", agent regenerates the card three different ways, captain picks
   one.
6. Show the new card in the product, side by side with the old.
7. End: zoom out to the moment kinds taxonomy, all rendered fresh.

## Open design questions
- Do we ship the new renderer as a PR-ready change to `moment-render.ts`, or
  parallel it (e.g., `moment-render-v2.ts`) so the demo can A/B? **Default:
  parallel for demo; PR-ready noted as next step.**
- Do we extend the moment kind taxonomy with match-narrative kinds
  (`last_minute_winner`, `comeback`, `clean_sheet_streak`) or stay within the
  existing 10? **Default: stay within existing 10 for v1; new kinds noted
  as follow-up.**
- Make app deployment — is it submitted as the "community/working file link"
  in the submission, alongside the Figma library?

## Success criteria
- The new renderer produces visibly distinct cards per moment kind, on the
  design system, with no two identical even within a kind.
- The pipeline runs reproducibly: `/sw-moments` against a fresh clone
  regenerates the same library.
- The video shows the round trip in under 90 seconds, beginning to end.
- The Make app works on at least one demo squad's moments.

## What we are not doing (scope guard)
- Not redesigning the entire SportWarren UI.
- Not building a new moments taxonomy (extending kinds is follow-up).
- Not touching the WhatsApp/Telegram channels for this submission.
- Not migrating satori to a different renderer.
