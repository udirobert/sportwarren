# Reproduce This Build

How to clone the moment-card library workflow into your own project.

## Why this exists

SportWarren's whole pitch is that grassroots football moments should be
preserved. The cards exist — rendered by `moment-render.ts` using satori +
resvg — but every card was identical: hardcoded gradient, Inter font, same
composition regardless of whether the moment was a `season_end` or a
`record_broken`. The renderer shipped PNGs but didn't honor the "designed
to be saved" promise.

It also used Inter — which `DESIGN_TOKENS.md` explicitly rejects: *"Inter
and system fonts are overused in AI-generated UIs. Space Grotesk gives a
sport-tech character that aligns with the brand."* The renderer was a
generic AI-slop card factory inside a product whose design philosophy
explicitly rejects generic AI slop.

The pipeline below replaces it with per-kind visual archetypes that respect
the design system — each moment kind gets its own composition, palette, and
typography, and no two cards look identical even within a kind.

## What was built

The makeathon work produced two visibly distinct moment-card archetypes
(`record_broken`, `level_up`) — each as a Figma component set with five
tier variants, bound to the SportWarren design system, and rendered through
a satori pipeline that swaps in per-kind React components from a registry.
Additional archetypes (`season_end`, `twin_created`, `coaching_hired`,
`match_imported`, `attestation_milestone`) have card components stubbed in
the registry and ready for the same pipeline.

The *workflow* is reusable: any project with a shareable-card surface
(open-graph images, social cards, achievement screens, certificate
generators) can apply the same pattern.

---

## Prerequisites

- A Figma plan with MCP-tool access. Pro tier is sufficient for the
  build itself; **Code Connect requires Org/Enterprise** — see the
  Pro-tier substitute below.
- Claude Code with the Figma MCP server installed.
  See [Figma's setup guide](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/#claude-code).
- An existing satori-based card renderer in your codebase. (If you
  don't have one, look at
  `src/server/services/personalization/moment-render.ts` for an
  example of the v1 pattern this work replaced.)
- A design tokens doc (we use `docs/DESIGN_TOKENS.md`) as the
  binding contract between Figma variables and TS theme tokens.

---

## The pipeline

```
            ┌─────────────────────────────────────────────┐
            │  src/server/services/personalization/       │
            │  moment-render.ts        (v1 — slop)        │
            │  moment-render-v2.ts     (v2 — design-sys)  │
            └─────────────────────┬───────────────────────┘
                                  │
                                  │ resolveCard(kind)
                                  ▼
            ┌─────────────────────────────────────────────┐
            │  src/components/moments/cards/              │
            │  ├── RecordBrokenCard.tsx                   │
            │  ├── LevelUpCard.tsx                        │
            │  ├── DefaultCard.tsx        (fallback)      │
            │  ├── index.ts               (CARDS map)     │
            │  └── code-connect.manifest.json             │
            └─────────────────────┬───────────────────────┘
                                  │
                                  │ Figma URL by node-id
                                  ▼
            ┌─────────────────────────────────────────────┐
            │  Figma file:                                │
            │    SportWarren — Moment Cards               │
            │    fileKey: xTaynEAGCjhhmcmQdPG0JZ          │
            │                                             │
            │    Pages:                                   │
            │     • Cover                                 │
            │     • Foundations  (token swatches)         │
            │     • MomentCard / Record Broken (variants) │
            │     • MomentCard / Level Up   (variants)    │
            └─────────────────────────────────────────────┘
```

Reads and writes flow both ways: agents read code via MCP to ground
themselves, then write Figma; designers edit Figma, the manifest gets
updated, and the satori render reflects the new component on next run.

---

## Step-by-step

### 1. Install the skill

The skill at `.claude/skills/sw-moments/` is a reusable Claude Code
agent skill — it can be cloned into any project with a similar
shareable-card surface. To use it as-is in this repo:

```bash
# from repo root, in Claude Code:
/sw-moments
```

The skill grounds itself in `docs/DESIGN_TOKENS.md` and the existing
card renderer before any write call, and follows the
`figma-generate-library` phase contract (Discovery → Foundations →
Components → Integration).

### 2. Read the build log

`docs/makeathon/build-log.md` is the candid, blow-by-blow record of how
this build went — the pivots, the credit spend, the Code-Connect-on-Pro
blocker, the satori-html bug discovery, the visual fixes. Read it before
running the skill on your own project; it will save you the same
mistakes.

### 3. Run the pipeline

For each moment kind you want to ship:

1. The skill creates a dedicated Figma page (e.g.,
   `MomentCard / Record Broken`).
2. It builds a base component bound to your color + text variables,
   following the archetype rules in
   `.claude/skills/sw-moments/references/archetypes.md`.
3. It clones the base into tier variants and combines them into a
   variant set with a `Tier=…` property.
4. You write the matching TS card under
   `src/components/moments/cards/<KindName>Card.tsx`.
5. You register it in `src/components/moments/cards/index.ts` under
   `CARDS[<kind>]`.
6. You add a manifest entry to
   `src/components/moments/cards/code-connect.manifest.json`
   recording the Figma node id and the TS source path.

### 4. Swap the renderer

The new `moment-render-v2.ts` consumes the CARDS registry. To run the
cron through v2 instead of v1, set `MOMENT_RENDER_V2=true` in your
env, or call the cron with `?v=2` for a single-run override:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://<host>/api/cron/moment-render?v=2
```

The response body lists the kinds v2 knows about
(`v2HandledKinds`) and the renderer it chose.

### 5. Verify the round trip

`scripts/render-before-after.tsx` renders the same synthetic moment
through both pipelines and saves both PNGs to `docs/makeathon/assets/`:

```bash
pnpm tsx scripts/render-before-after.tsx
```

The output is your A/B proof: v1's Inter+gradient slop vs. v2's
archetype-bound card.

---

## The Code Connect manifest (Pro-tier substitute)

Figma's first-party Code Connect requires an Organization or Enterprise
seat. The makeathon participant upgrade gives you Pro, which is enough
to build the library but not enough to call `add_code_connect_map`.

Workaround:
[`src/components/moments/cards/code-connect.manifest.json`](../../src/components/moments/cards/code-connect.manifest.json)
records the same shape of data Code Connect would persist — Figma node
id → TS component source, prop bindings, variant axes, design system
bindings. Each card file also carries the Figma URL (with `node-id`)
in its header comment, so the binding is discoverable from either side.

If you're on Org/Enterprise, run `add_code_connect_map` against each
node id in the manifest and the round trip becomes native; if not, the
manifest gives you the same lookup the agent uses.

---

## Add a new archetype

To extend the library with a new kind (e.g. `season_end`):

1. Find the archetype rules in
   `.claude/skills/sw-moments/references/archetypes.md`. If your kind
   isn't listed, draft a new entry there first — composition, palette,
   motif, mood.
2. Run `/sw-moments` and instruct the agent to build that archetype on
   a new page in the same Figma file.
3. Write the matching `<KindName>Card.tsx` next to the existing ones.
4. Add the kind to the `CARDS` registry in `cards/index.ts`.
5. Add a manifest entry pointing at the new Figma node id.
6. Run `pnpm run typecheck` and the before/after script to verify.

You can also extend the tier ornament rules in `cards/tokens.ts` if
you need a new tier-level visual (e.g. `seasonal_finale`).

---

## Archetype design notes

Each moment kind in the CARDS registry targets a distinct visual mood:

| Kind | Mood | Key visual signals |
|------|------|--------------------|
| `record_broken` | Emphatic | Oversized type as imagery, destructive red accent, shattered horizontal rule |
| `level_up` | Growth | Giant numeral as hero, gold and emerald, chevron stack suggesting progression |
| `season_end` | Retrospective | Trophy-led, gold and emerald, season-stat grid |
| `twin_created` | Generative | Violet, abstract, identity-forward composition |
| `coaching_hired` | Warm | Indigo, welcoming, soft curves |
| `match_imported` | Archival | Monochrome, calendar-led, restrained typography |
| `attestation_milestone` | Civic | Sky blue, badge-led, certificate feel |

The tier property (Common → Rare → Epic → Legendary → Mythic) applies
ornament variation within each kind via shared tier tokens in
`cards/tokens.ts`.

## What this skill does NOT do

- It does not auto-generate matching CSS for the cards on the web
  dashboard. Cards are satori-rendered server-side; the dashboard UI
  is a separate concern (see `SquadMomentsGallery.tsx`).
- It does not own the moment kind taxonomy. Adding a new kind means
  updating the twin event system upstream (see
  `src/server/services/personalization/twin-types.ts`).
- It does not yet replace the cron callsite for production. v1 remains
  the default until `MOMENT_RENDER_V2=true` is set in the deployment
  environment.

---

## Pointers

- Skill source: `.claude/skills/sw-moments/`
- Cards source: `src/components/moments/cards/`
- v2 renderer: `src/server/services/personalization/moment-render-v2.ts`
- Build log: `docs/archive/makeathon/build-log.md` (historical record)
- Sample renders: `docs/makeathon/assets/`
- Figma file: https://www.figma.com/design/xTaynEAGCjhhmcmQdPG0JZ
