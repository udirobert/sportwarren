# Moment Card Archetypes (v1)

One archetype per moment kind. Each archetype defines the visual character of
the card — emphasis, composition, color palette, motif. Inside the archetype,
the agent composes a fresh layout per instance (varying type weight, image vs.
negative space, badge vs. ribbon, etc.) so no two cards look identical even
within the same kind.

Kinds are sourced from `src/components/moments/SquadMomentsGallery.tsx`
`KIND_CONFIG`. Tier is orthogonal to kind — every card supports the tier set
(`standard`, `premium`, `streak_reward`, `partner`, `internal`) as a variant.

---

## `twin_created` — Identity-forward, generative
- **Mood:** mysterious, abstract, identity-as-birth
- **Palette:** violet primary, dark surface, hint of emerald
- **Motif:** abstract generative form (mesh, particles) framing the label
- **Type:** label set in Space Grotesk Bold; kicker pill in violet
- **Composition rule:** subject's name dominates; detail orbits

## `level_up` — Kinetic, ascending
- **Mood:** energetic, upward
- **Palette:** amber + emerald accent, dark surface
- **Motif:** ascending arrow / stair / chevron stack as background mark
- **Type:** giant numeral (the new level) as the hero element
- **Composition rule:** the *number* is the design — typography over imagery

## `sim_complete` — Tactical, board-like
- **Mood:** strategic, analytical
- **Palette:** cyan + slate, dark surface
- **Motif:** subtle pitch lines or formation dots as background
- **Type:** narrow, condensed; data-heavy
- **Composition rule:** treat as a stat panel, not a poster

## `achievement` — Civic, badge-led
- **Mood:** proud, formal
- **Palette:** emerald primary (matches `--success`), dark surface, gold accent
- **Motif:** circular crest or shield silhouette
- **Type:** centered, symmetric, serif feel via Space Grotesk weight contrast
- **Composition rule:** badge centered; detail underneath in a quieter row

## `coaching_hired` — Welcoming, warm
- **Mood:** introductory, optimistic
- **Palette:** indigo, warm white accent, dark surface
- **Motif:** soft radial gradient suggesting a portrait light
- **Type:** quoted style — the coach's name as if signed
- **Composition rule:** half negative space; date prominent

## `coaching_expired` — Quiet, valedictory
- **Mood:** archival, restrained
- **Palette:** rose accent on neutral, dark surface
- **Motif:** thin horizontal rule under the label, like a closing line
- **Type:** smaller hero; detail given equal weight
- **Composition rule:** muted; this is a closing card, not a celebration

## `attestation_milestone` — Civic, official
- **Mood:** institutional, verified
- **Palette:** sky + slate, dark surface, hint of `--success`
- **Motif:** stamp / shield / checkmark mark
- **Type:** uppercase kicker prominent; label set in measured caps
- **Composition rule:** treat as a certificate; symmetric, balanced

## `season_end` — Retrospective, trophied
- **Mood:** culminating, year-in-review
- **Palette:** `--xp-gold` + emerald + dark surface
- **Motif:** small trophy glyph or laurel; thin metallic divider
- **Type:** label set large; detail rendered as a multi-line summary
- **Composition rule:** longer format, more text room — this is a poster

## `record_broken` — Emphatic, dramatic
- **Mood:** loud, breaking
- **Palette:** `--destructive` red against dark surface; high contrast
- **Motif:** broken / shattered rule as a horizontal element
- **Type:** the *biggest* type of any archetype; tight tracking
- **Composition rule:** type as imagery; everything else recedes

## `match_imported` — Archival, calendar-led
- **Mood:** historical, monochromatic
- **Palette:** indigo + neutral, dark surface
- **Motif:** date as the dominant visual element; calendar grid hint
- **Type:** date in giant numerals; everything else small
- **Composition rule:** treat as a journal entry, not a moment

---

## Tier as variant (applies to every kind)
- `standard` — base palette, no extra ornament
- `premium` — adds an `--xp-gold` border and a foil-effect highlight
- `streak_reward` — adds a `--success` (emerald) pulse motif and "STREAK" pip
- `partner` — adds a partner-mark slot in the footer
- `internal` — adds a small "INT" pip and a slightly desaturated palette

---

## Anti-archetype guardrails (from `docs/DESIGN_TOKENS.md`)
Each generation must avoid:
- Uniform gradient-and-shadow backgrounds (the satori template *is* this — we
  are explicitly replacing it)
- Inter font (use Space Grotesk)
- Cards wrapping every element inside the card
- Stock "AI poster" tropes — centered title + subtitle + footer with no
  hierarchy variation

If an archetype generates something that matches the anti-patterns, regenerate.
