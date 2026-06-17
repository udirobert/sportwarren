---
name: sw-moments
description: Generate designed-by-AI moment cards for SportWarren in Figma, bound to the project's actual design system. Use when the user wants to design, regenerate, or extend the moment card library, replace the satori template renderer with a generative pipeline, or build the Figma Make app for the moment card studio. Reads `src/server/services/personalization/moment-render.ts`, `docs/DESIGN_TOKENS.md`, and `src/components/moments/SquadMomentsGallery.tsx` to ground itself in the existing taxonomy and visual constraints.
---

# SportWarren Moment Cards — AI Design Pipeline

You are designing moment cards for SportWarren — the shareable 600×400 PNGs
that the satori renderer produces for each moment row. The existing renderer
at `src/server/services/personalization/moment-render.ts` produces a single
hardcoded template for every kind. Your job is to replace it with a Figma
library of unique-per-kind, design-system-bound components, then connect those
back to the codebase via Code Connect.

## Anchors — read these first

Before any generation, ground yourself by reading:

1. `src/server/services/personalization/moment-render.ts` — the current
   template. Note the WIDTH/HEIGHT (600×400), the tier color map, and the
   HTML structure (kicker row, label, detail, footer).
2. `src/components/moments/SquadMomentsGallery.tsx` — the moment kind
   taxonomy (`KIND_CONFIG`) and tier styles (`TIER_STYLES`). These define the
   universe of cards you generate.
3. `docs/DESIGN_TOKENS.md` — the design system. **Critical:** Inter is
   explicitly rejected. Use Space Grotesk. Honor the "AI slop guardrails"
   section literally — no uniform card grids, no default gradient-and-shadow,
   no Card-wrapping every element.
4. `references/archetypes.md` — the visual archetype per moment kind.
5. `references/design-system.md` — how to bind to SportWarren's tokens in
   Figma (which color goes where, type scale mapping, etc.).

## Workflow

### 1. Read the canvas (or the codebase)
Depending on what the user is asking:
- If extending an existing Figma library, read it via `get_design_context` /
  `get_metadata`.
- If starting from code, read the files above and stage the design intent
  before any Figma write.

Use `search_design_system` with the file's library keys to find existing
components/variables before creating new ones — never duplicate what's already
in the design system.

### 2. Generate the library (write-heavy)
Use `use_figma` (after invoking the `/figma-use` skill — mandatory per the
Figma MCP instructions) to create:
- One Figma component per moment kind in the taxonomy
- Each component composed within its archetype's visual rules
- Type bound to Space Grotesk; colors bound to the project's semantic tokens
  (`--primary`, `--success`, `--warning`, `--destructive`, `--team-home`,
  `--team-away`, `--xp-gold`)
- Tier as a variant property on every component
- 600×400 fixed frame size to match the renderer

Each generation call is a credit spend — make them count. Do not regenerate
the entire library on small edits; target the specific component.

### 3. Avoid the slop
Honor `DESIGN_TOKENS.md` anti-patterns verbatim:
- No uniform card grids
- No identical compositions across kinds — a `record_broken` must not look
  like a `coaching_hired`
- No Inter — Space Grotesk only
- No default gradient-and-shadow card — the existing satori template *is* the
  anti-example
- Dark mode must work — every fill choice has a `dark:` equivalent

### 4. Map to code (Code Connect)
For each Figma component, add a Code Connect mapping back to a TS component in
`src/components/moments/`. Use `get_code_connect_suggestions` first to see if
the file already has mappings. Use `add_code_connect_map` (exempt from rate
limits) to attach mappings.

The TS target is a per-kind renderer function consumed by the new satori
renderer. Names should mirror the kind: `RecordBrokenCard`, `SeasonEndCard`,
`TwinCreatedCard`, etc.

### 5. Annotate the work
After generating, leave a comment on each component stating: the moment kind
it serves, the design tokens it binds to, and which TS component it maps to
via Code Connect. This is the Build-in-Public artifact — when the user opens
Figma, the design intent is on the canvas, not buried in docs.

## Reusability promise
This skill targets THIS project's taxonomy and tokens, but the *workflow*
(read code → generate library → Code Connect → swap renderer) should be
generalizable. Keep the moment-kind-specific logic in
`references/archetypes.md` so the SKILL.md itself stays portable to other
projects with similar shareable-card surfaces.

## References
- `references/archetypes.md` — per-kind visual archetypes.
- `references/design-system.md` — token-binding cheatsheet.
- `references/codeconnect.md` — Code Connect mapping pattern for the moment
  card components.
