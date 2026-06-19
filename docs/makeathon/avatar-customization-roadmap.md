# Avatar customization roadmap

Post-makeathon plan to build the in-app avatar customization flow.
The V3 card system already renders parameterized SVG avatars
(`V3Avatar` + `V3SquadCrest` in `src/components/moments/cards/`).
This doc covers the UX, schema, rendering, and rollout for taking
avatars from "designer-customized" to "player-customized."

## Why this is the right v2 work

- **Compounds the captain wedge.** Captain creates squad → invites
  11 players → each customizes their avatar in ~30 seconds during
  onboarding → from then on, their face is on every moment card.
  The personal artifact strengthens identity-in-squad ownership.
- **Frictionless personalization, Duolingo-model.** Customization
  is fun (kit color, skin tone, hair, position-specific gestures),
  not laborious (no photo upload, no AI generation).
- **Captain-led adoption survives the photo problem.** Sunday League
  blokes don't necessarily want their face on a stats card. An
  illustrated avatar is dignified, accessible, and instant.
- **Reuses the existing pipeline.** `PlayerSkin.avatarKey` and the
  image variant pipeline (`image.ts` → square/thumb/wide) already
  exist for photo avatars. The customization model extends, not
  replaces, that pipeline.

## What's NOT in scope

- AI face-swap or generated portraits (uncanny risk, computational
  cost, doesn't fit the preservation register)
- Photo upload as the primary path (allowed as fallback, not default)
- Per-archetype avatar variation (a player has *one* avatar, used
  across all cards they appear in)
- Animation / motion (deferred to a separate motion-design pass)

## Scope phases

### Phase A — Schema + render path (1 day)

Extend `User` (or a sibling `UserAvatar`) row with:
```prisma
model UserAvatar {
  id          String   @id @default(cuid())
  userId      String   @unique
  kitColor    String   // hex — defaults to squad kit color
  accentColor String   // hex
  skinTone    String   // one of an 8-shade palette
  hairColor   String   // one of a 6-shade palette
  hairStyle   String   // "short" | "tall" | "shaved" | "cap" (extend later)
  number      String   // jersey number (1-99)
  position    String?  // CF | CM | CB | GK | etc.
  updatedAt   DateTime @updatedAt
}
```

Rendering:
- The existing satori card pipeline reads `userAvatar` alongside
  `playerSkin` and passes it to the V3 card components.
- For player-scoped archetypes (record_broken, level_up,
  achievement, twin_created, coaching_*), the renderer composes
  `<V3Avatar {...userAvatar} />`.
- For squad-scoped archetypes (season_end, attestation_milestone,
  sim_complete, match_imported), it composes `<V3SquadCrest />`
  derived from `squad.kitColor` + `squad.shortName` + `squad.founded`.

### Phase B — Onboarding customization UI (2 days)

A 5-step inline customization flow during squad join. Each step
shows the avatar preview rendered live as the player selects.

1. **Kit** — auto-defaulted to squad colors, with a confirm step
   (some players have a personal preference even within squad)
2. **Skin tone** — 8 swatches in the V3 skin palette
3. **Hair** — color (6 swatches) + style (4 presets)
4. **Number** — jersey number, free-text 1–99
5. **Position** — CF / CM / CB / GK etc., from the existing position
   enum on `PlayerSkin`

Persistence on each step (no "save" button — every change writes
immediately so the player can drop off and come back). Server
action: `setUserAvatar({ partial UserAvatar })`.

UI primitives:
- Use the existing onboarding shell (`OnboardingFlow.tsx`)
- New component: `AvatarCustomizationStep.tsx` per step
- Live preview: render `<V3Avatar size={120} {...currentAvatar} />`
  inline at the top of each step

### Phase C — Captain admin tools (0.5 day)

Captains often need to:
- Set defaults for the whole squad (kit color, accent color) so
  all players' avatars look unified
- Edit a player's number when squads renumber
- Set a player's position when they don't know what to pick

New tRPC endpoints:
- `squad.setAvatarDefaults({ kitColor, accentColor })` — applies
  to all current + future squad members
- `squad.setPlayerAvatar({ playerId, ...partialAvatar })` — captain
  override for one player

### Phase D — Backward compatibility for photo avatars (0.5 day)

The existing `User.avatar` field (a storage key for an uploaded
photo) stays in the schema. If `UserAvatar` exists, the V3 card
uses the illustrated avatar. If `UserAvatar` is null and `User.avatar`
is set, the card uses the uploaded photo as a fallback (rendered
into the avatar circle slot, halftone-treated for register
consistency). If both are null, a generic squad-colored silhouette
fills the slot.

### Phase E — Match-day stats overlay on the avatar (0.5 day, stretch)

The avatar number badge can show *match-day status* contextually:
- Goals scored this match (small superscript number)
- Yellow card / red card mark
- Captain's armband

This is a single SVG overlay on top of the base avatar — no
re-render needed, just an additional layer. Reuses `MatchStats`
on the twin.

## Effort summary

| Phase | Description | Effort |
|-------|-------------|--------|
| A | Schema + render path | 1 day |
| B | Onboarding customization UI | 2 days |
| C | Captain admin tools | 0.5 day |
| D | Photo avatar fallback | 0.5 day |
| E | Match-day overlay (stretch) | 0.5 day |
| **Total** | | **~4.5 days** |

## Open product questions

1. **Should the captain be able to mark a player's avatar as
   "locked" once approved**, to prevent mid-season changes that
   look weird in card history?
2. **Should the avatar's `skinTone` and `hairColor` be set by the
   player only**, or should we allow squad admins to set them too?
   Privacy-leaning: player-only.
3. **Do we want to support more hair styles** in V2 (afro, bun,
   bob, etc.), or keep the 4 presets?
4. **Is there value in a "captain's armband" badge** that surfaces
   automatically based on the player's role, or do we make it
   manual?
5. **Should we render an animated "in motion" version** of the
   avatar for the in-app gallery (kicked leg, hands raised), and
   the static version for share PNGs?

## Pre-requisites

- Phase A blocks all other phases.
- Phase B is the only player-facing piece; without it, avatars
  default to "squad colors + #9" for everyone.
- Phases C, D, E can be picked up independently after A + B.

## Naming

Avatar in the data model = `UserAvatar`.
Avatar in the V3 card scaffold = `V3Avatar` / `V3SquadCrest`.
Customization UI in onboarding = "Build your kit".
