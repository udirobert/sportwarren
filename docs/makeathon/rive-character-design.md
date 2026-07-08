# Rive Interactive Character — design spec

For the Rive "Interactive Character Challenge" (enter by Jul 2, 11:59pm PDT).
The character is the living embodiment of a SportWarren player's V3 card —
a risograph-printed footballer that reacts to real career data, not a
cartoon mascot. It is part of the product (the card), responding to real
data (match events, peer ratings, level-ups), not a sticker on top.

## Visual concept — the V3 risograph footballer

**Not a mascot. A printed player coming alive.**

The character lives in the V3 archival register (cream paper + ink +
mustard/red/navy/sage accents — see `src/components/v3/tokens.ts`).
Think: a risograph-printed footballer, flat ink shapes, 2-3 color layers,
that shifts pose and expression as the player's career data changes.
Restrained motion — the brand is preservation, not gamification. The
character feels like a stat card breathing, not a game character mugging.

**Artboard:** 400×400px canvas, cream background (`#F5EFE0`).
**Character:** a simplified footballer silhouette — head, torso, kit
(squad color), arms, legs. Flat shapes, no gradients, ink outlines
(`#1A1A1A`). 2 accent colors max per pose (kit + one V3 accent).

## State machine — `PlayerCharacter`

One state machine, 6 inputs, driven entirely by `AvatarPresentation`
(`src/lib/avatar/types.ts`). The React component maps presentation →
Rive inputs on every render.

### Inputs (Rive state machine)

| Input name | Type | Source field | Range | What it drives |
|---|---|---|---|---|
| `archetype` | number | `AvatarPresentation.archetype` | 0–5 | Base pose: 0=finisher, 1=creator, 2=engine, 3=anchor, 4=guardian, 5=leader |
| `formState` | number | `AvatarPresentation.formState` | 0–4 | Expression/mood intensity: 0=neutral, 1=hot, 2=trusted, 3=clutch, 4=locked_in |
| `frameTier` | number | `AvatarPresentation.frameTier` | 0–5 | Frame/border weight around character: 0=rookie (thin) → 5=legend (heavy + glow) |
| `overall` | number | `V3PlayerCardData.overall` | 0–99 | Subtle "energy" — idle sway speed, slight scale pulse on high values |
| `glow` | boolean | `AvatarPresentation.verifiedGlow` | true/false | Ink-glow halo behind character (first verified match onward) |
| `unlock` | trigger | `AvatarPresentation.recentUnlock` | fire | Celebration burst — confetti in squad accent color, 1.5s, then settles |

### States (Rive state machine graph)

```
                    ┌──────────────────────────────────┐
                    │           Idle (default)          │
                    │  archetype pose + formState mood  │
                    │  + frameTier border + glow halo   │
                    │  subtle sway driven by `overall`  │
                    └──────┬───────────┬────────────┬───┘
                           │           │            │
                    unlock │    hover  │   dataChange
                           │           │            │
                    ┌──────▼──┐  ┌─────▼────┐  ┌───▼──────────┐
                    │Celebrate│  │  React   │  │  Transition  │
                    │ 1.5s    │  │ (peek)   │  │ (blend to    │
                    │ confetti│  │          │  │  new pose)   │
                    └────┬────┘  └────┬─────┘  └───┬──────────┘
                         │            │            │
                         └────────────┴────────────┘
                                    back to Idle
```

- **Idle** — the resting state. Pose = archetype, mood = formState.
  A slow sway (speed scales with `overall`: 60 = barely moving, 90+
  = noticeable confidence). This is where the character "lives."
- **Celebrate** — triggered by `unlock` input. 1.5s confetti burst in
  the squad's accent color, character does a small leap. Returns to
  Idle. Maps to `recentUnlock` (frame unlock, badge unlock, archetype
  shift, prestige milestone).
- **React** — on hover/tap, character "peeks" at the viewer (slight
  head turn + eyebrow raise). Proves the character is alive and
  responsive to user input (challenge criterion: "responding to user
  input").
- **Transition** — when `archetype` or `formState` changes (data
  update), blend smoothly to the new pose/mood over 600ms. This is
  the "responding to data" leg — the character visibly shifts when a
  match result lands and the player's form flips from `neutral` to
  `hot`, or their archetype changes from `engine` to `finisher` after
  a goal spree.

### The 6 archetype poses

Each is a distinct silhouette, all in the same risograph style:

| # | Archetype | Pose | Key accent |
|---|---|---|---|
| 0 | Finisher | Mid-strike, arm back, leaning forward | Red |
| 1 | Creator | Arm extended pointing (assisting), head up | Navy |
| 2 | Engine | Balanced stance, slight crouch, ready to run | Sage |
| 3 | Anchor | Planted wide stance, arms out (defending) | Navy |
| 4 | Guardian | GK ready position, gloves up | Mustard |
| 5 | Leader | Chest out, arm across chest (captain's armband visible) | Red |

### The 5 formState moods (overlay on pose)

| # | FormState | Expression | Motion intensity |
|---|---|---|---|
| 0 | Neutral | Calm, neutral brow | Minimal sway |
| 1 | Hot | Slight grin, eyes focused | More sway, occasional fist pump |
| 2 | Trusted | Confident, chin up | Steady confident sway |
| 3 | Clutch | Intense focus, jaw set | Lean forward, faster sway |
| 4 | Locked_in | Zen-calm, slight smile, eyes closed briefly | Slow, powerful sway — "in the zone" |

### Frame tiers (border around character)

| # | Tier | Visual |
|---|---|---|
| 0 | Rookie | Thin 1px ink border, no fill |
| 1 | Starter | 2px ink border |
| 2 | Regular | 2px ink + thin accent inner border |
| 3 | Standout | 3px accent border + corner ticks |
| 4 | Captain class | 3px accent + dashed accent inner + small star corner marks |
| 5 | Legend | 4px accent + gold inner glow + 4 corner stars |

## Integration into V3PlayerCard

The `RiveCharacter` client component replaces the `MiniAvatar` SVG in
the Overall badge area of `V3PlayerCard` (the `full` and `showcase`
variants). The card remains a server component; `RiveCharacter` is a
client island receiving `AvatarPresentation` + `overall` as props.

```
V3PlayerCard (server)
  ├── Overall badge
  │   └── RiveCharacter (client) ← replaces MiniAvatar
  │       inputs: archetype, formState, frameTier, overall, glow, unlock
  └── 6 attribute bars (unchanged)
```

**Key constraint:** the `compact` variant (roster lists) keeps
`MiniAvatar` — Rive is too heavy for list rendering. The character
lives on the `full` card (player's own preview, public profile, post-
session analysis) and the `showcase` variant (homepage hero demo).

## The demo narrative (for the 30s+ walkthrough video)

The video shows one character responding to a real career arc:

1. **Start:** Player at L5, `rookie` frame, `neutral` form, `engine`
   archetype. Calm, minimal sway. (The "before" state.)
2. **Match happens:** Goals + peer ratings land. `formState` flips to
   `hot`, `overall` ticks up 2 points. Character visibly shifts —
   grin appears, sway intensifies. (Data reactivity.)
3. **More matches accumulate:** `formState` → `trusted`, `frameTier`
   → `regular`. Frame border thickens, accent appears. (Career
   progression.)
4. **Badge unlock:** `recentUnlock` fires. Confetti burst in squad
   color, character leaps. Settles back. (Event reactivity.)
5. **Hover:** character peeks at viewer. (User input reactivity.)

One character, one world (the card), responding to real data + user
input. That's the whole submission.

## Submission checklist

- [ ] Build `.riv` in Rive editor using this state machine spec
- [ ] Wire `RiveCharacter.tsx` to take `AvatarPresentation` props
- [ ] Integrate into `V3PlayerCard` full + showcase variants
- [ ] Demo route showing the career-arc narrative (data-driven)
- [ ] 30s+ walkthrough video (Loom or screen recording)
- [ ] 1-2 sentence concept description
- [ ] Post on social tagging @rive_app (X, LinkedIn, or Instagram)
- [ ] Submit Rive invite link or embedded URL
- [ ] Add social post links when submitting

## What's already done

- ✅ `@rive-app/react-canvas@4.28.6` installed, verified loading in
  Next 16.2.6 + React 18.3 (no `a.startsWith` runtime error, canvas
  renders, no webpack config changes needed)
- ✅ `RiveCharacter.tsx` scaffold created
  (`src/components/rive/RiveCharacter.tsx`)
- ✅ State machine spec mapped to existing `AvatarPresentation` types
