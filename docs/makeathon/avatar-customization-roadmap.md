# Avatar customization roadmap

Post-makeathon plan to build the in-app avatar customization flow.
The V3 card system already renders parameterized SVG avatars
(`V3Avatar` + `V3SquadCrest` in `src/components/moments/cards/`).
This doc covers the UX, schema, rendering, tRPC surface, captain
admin tools, photo fallback, and rollout sequence.

> **Status:** scoped as a separate PR. Total ~4.5 days across 5
> phases. Phase A unblocks everything else.

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
- **Ties directly to other roadmap items.** The recruitment-share
  card (`post-submission-roadmap.md` #2) wants the captain's avatar
  embedded. Captain Spotlight + Squad of the Week
  (`app-integration-triggers.md`) need the avatar to surface
  contextually.

## What's NOT in scope

- AI face-swap or generated portraits (uncanny risk, computational
  cost, doesn't fit the preservation register)
- Photo upload as the primary path (allowed as fallback, not default)
- Per-archetype avatar variation (a player has *one* avatar, used
  across all cards they appear in)
- Animation / motion (deferred to a separate motion-design pass)

---

## Phase A — Schema + render path (1 day)

Add a `UserAvatar` row alongside `User`:

```prisma
model UserAvatar {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  kitColor    String   // hex
  accentColor String   // hex
  skinTone    String   // hex (one of the 8-shade palette)
  hairColor   String   // hex (one of the 6-shade palette)
  hairStyle   HairStyle // short | tall | shaved | cap | bun | bob

  number      String   @db.VarChar(3)  // jersey number, 1-99
  position    String?                  // CF | CM | CB | GK ...

  // Captain override flag — when true, captain can lock this avatar
  // from player edits.
  locked      Boolean  @default(false)

  updatedAt   DateTime @updatedAt
  createdAt   DateTime @default(now())
}

enum HairStyle {
  SHORT
  TALL
  SHAVED
  CAP
  BUN
  BOB
}
```

The existing satori card pipeline reads `userAvatar` alongside
`playerSkin` and passes it to the V3 card components:

```ts
// In moment-render-v2.ts or per-card resolver
const playerData = await db.user.findUnique({
  where: { id: subjectId },
  include: { avatar: true, squadMemberships: { include: { squad: true } } },
});

const card = (
  <RecordBrokenCardV3
    moment={moment}
    avatar={playerData.avatar ?? defaultAvatar(playerData.squad)}
    squad={playerData.squadMemberships[0]?.squad}
  />
);
```

For **squad-scoped archetypes** (season_end, attestation_milestone,
sim_complete, match_imported), use `V3SquadCrest` derived from
`Squad.kitColor` + `Squad.shortName` + `Squad.founded`. If `Squad`
doesn't have these fields yet, extend it in the same migration:

```prisma
model Squad {
  // ... existing fields ...
  kitColor    String?  // hex, defaults to V3.RED if null
  accentColor String?  // hex
  founded     DateTime?
}
```

**Acceptance:** `pnpm test` passes; all 10 V3 card renderers
consume avatar data from the DB instead of hardcoded `MARCUS_AVATAR`
and `BROCKENHURST_CREST`.

---

## Phase B — Onboarding customization UI (2 days)

A 5-step inline customization flow during squad join.

### Flow structure

```
[Sign in / arrive at /join/[squadId]]
   ↓
Step 1: Welcome — show squad crest + captain name + "Customize your kit"
   ↓
Step 2: Kit — confirm or override squad-default kit color
   ↓
Step 3: Skin tone — 8 swatches
   ↓
Step 4: Hair — 6 colors × 6 styles
   ↓
Step 5: Number & position — text input 1-99, dropdown for position
   ↓
[Done — drop into the squad with a freshly customized avatar]
```

Each step persists immediately via tRPC mutation. No "Save" button.

### UI mockups (low-fi sketch)

```
┌───────────────────────────────────────────────────┐
│  ●  BROCKENHURST ROVERS · CAPTAIN MARCUS TATE     │
│                                                   │
│        BUILD YOUR KIT                             │
│        ──────────────                             │
│                                                   │
│   ┌─────────┐    Step 3 of 5: Skin tone           │
│   │ AVATAR  │                                     │
│   │ PREVIEW │    Pick the one that's closest.     │
│   │  120px  │                                     │
│   └─────────┘                                     │
│                                                   │
│   ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯                          │
│      ●                                            │
│                                                   │
│                                       [   NEXT   ] │
└───────────────────────────────────────────────────┘
```

### tRPC surface

```ts
// In src/server/routers/avatar.ts (new file)
export const avatarRouter = router({
  // Read your avatar (returns null if not yet customized)
  get: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.userAvatar.findUnique({
        where: { userId: ctx.session.user.id },
      });
    }),

  // Set partial avatar fields — called on every step
  patch: protectedProcedure
    .input(z.object({
      kitColor: z.string().regex(HEX_RE).optional(),
      accentColor: z.string().regex(HEX_RE).optional(),
      skinTone: z.string().regex(HEX_RE).optional(),
      hairColor: z.string().regex(HEX_RE).optional(),
      hairStyle: z.enum(['SHORT', 'TALL', 'SHAVED', 'CAP', 'BUN', 'BOB']).optional(),
      number: z.string().regex(/^\d{1,2}$/).optional(),
      position: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.locked) throw new TRPCError({ code: 'FORBIDDEN' });
      return ctx.db.userAvatar.upsert({
        where: { userId: ctx.session.user.id },
        update: input,
        create: {
          userId: ctx.session.user.id,
          // Apply squad defaults for any missing required fields
          kitColor: input.kitColor ?? await getSquadKitColor(ctx),
          accentColor: input.accentColor ?? V3.NAVY,
          skinTone: input.skinTone ?? V3.SKIN_MID,
          hairColor: input.hairColor ?? V3.HAIR_DARK,
          hairStyle: input.hairStyle ?? 'SHORT',
          number: input.number ?? '0',
          position: input.position ?? null,
        },
      });
    }),

  // Live SVG preview — returns a base64 data URI of a 256x256 avatar
  // rendered server-side for embedding in the customization UI.
  preview: protectedProcedure
    .input(z.object({ /* same partial fields */ }))
    .query(async ({ input }) => {
      const svg = renderAvatarToSvg({ ...input, size: 256 });
      return { svgDataUri: `data:image/svg+xml;base64,${btoa(svg)}` };
    }),
});
```

### State management

Use the existing `OnboardingFlow.tsx` step-state machine:

```ts
type AvatarCustomizationState = {
  step: 'welcome' | 'kit' | 'skin' | 'hair' | 'numbers';
  draft: Partial<UserAvatar>;
};

// Each step renders <V3Avatar size={120} {...draft} /> as live preview.
// onChange handler debounces tRPC patch by 200ms.
```

### Components to create

- `src/components/avatar/AvatarCustomizationWizard.tsx` — the
  5-step shell
- `src/components/avatar/AvatarSwatch.tsx` — single color picker
  swatch (used for kit / accent / skin / hair color)
- `src/components/avatar/AvatarHairStylePicker.tsx` — 6 silhouette
  thumbnails
- `src/components/avatar/AvatarPreview.tsx` — live preview wrapper

### Step list

| Step | Picker UI | Validation | Default if skipped |
|---|---|---|---|
| 1. Welcome | Read-only summary | — | — |
| 2. Kit | Squad kit + custom | Hex format | Squad's kit color |
| 3. Skin | 8 swatches | Required | `SKIN_MID` |
| 4. Hair | 6 colors × 6 styles grid | Required | `HAIR_DARK` + `SHORT` |
| 5. Number + Position | Text 1-99 + dropdown | Must not collide with squad teammates | `0` + null |

---

## Phase C — Captain admin tools (0.5 day)

Captains often need to:

- Set defaults for the whole squad (kit color, accent color) so all
  players' avatars look unified
- Edit a player's number when squads renumber mid-season
- Set a player's position when they don't know what to pick
- Lock a player's avatar from edits (rare but useful for the
  captain spotlight / SOTW use case)

### tRPC additions

```ts
captain: router({
  setSquadAvatarDefaults: captainProcedure
    .input(z.object({
      squadId: z.string(),
      kitColor: z.string().regex(HEX_RE),
      accentColor: z.string().regex(HEX_RE).optional(),
    }))
    .mutation(...),

  setPlayerAvatar: captainProcedure
    .input(z.object({
      playerId: z.string(),
      squadId: z.string(),
      // Captain can override any field
      // ...
    }))
    .mutation(...),

  lockPlayerAvatar: captainProcedure
    .input(z.object({ playerId: z.string(), squadId: z.string(), locked: z.boolean() }))
    .mutation(...),
}),
```

### UI surface

In `src/app/(app)/squad/[squadId]/manage/players/page.tsx` (or
similar), add an "Avatar" column to the player roster table.
Captain can click → opens an inline editor with the same wizard
steps.

---

## Phase D — Photo avatar fallback (0.5 day)

The existing `User.avatar` field (a storage key for an uploaded
photo) stays in the schema.

Resolution order at render time:

1. If `UserAvatar` row exists → render `<V3Avatar />` with those params.
2. If `User.avatar` is set (a photo URL) → render the photo inside
   the V3 avatar circle slot, *halftone-treated* for register
   consistency.
3. If neither → render a generic squad-colored silhouette with
   only the jersey number set (defaults to "0").

### Halftone-treatment for photo avatars

```ts
// In V3Avatar.tsx — new variant
export function V3AvatarFromPhoto({ photoUrl, ...props }: { photoUrl: string } & V3AvatarProps) {
  // Render a circular crop of the photo with halftone overlay applied
  // via CSS filter chain: grayscale + contrast bump + dot-pattern mask.
  // The output reads as "Risograph print of a photo" not "raw photo."
  // ...
}
```

Halftone filter implementation: use CSS `filter` chain (works in
satori 0.26): `grayscale(100%) contrast(1.2) brightness(0.95)` +
overlay an SVG `<pattern>` with dots at varying densities.

---

## Phase E — Match-day stats overlay on the avatar (0.5 day, stretch)

The avatar number badge can show *match-day status* contextually:

- Goals scored this match (small superscript number next to the kit number)
- Yellow card / red card mark (corner indicator)
- Captain's armband (small "C" badge on the shoulder)

Single SVG overlay on top of the base avatar — no re-render needed,
just an additional `<svg>` layer at render time. Reads from
`MatchStats` on the twin or a per-match `MatchAppearance` row.

```ts
<V3Avatar {...avatar}>
  <V3AvatarOverlay
    goals={matchAppearance.goals}
    card={matchAppearance.card}  // 'yellow' | 'red' | null
    captain={matchAppearance.isCaptain}
  />
</V3Avatar>
```

---

## Effort summary

| Phase | Description | Effort | Depends on |
|-------|-------------|--------|------------|
| A | Schema + render path | 1 day | — |
| B | Onboarding customization UI | 2 days | A |
| C | Captain admin tools | 0.5 day | A, B |
| D | Photo avatar fallback | 0.5 day | A |
| E | Match-day overlay (stretch) | 0.5 day | A |
| **Total** | | **~4.5 days** | |

---

## Migration plan

The 1,400+ existing players in production have no `UserAvatar`
row. Migration:

1. Run a backfill script that creates `UserAvatar` rows for every
   user, with:
   - Kit color: squad default (or `V3.RED` if squad doesn't have one)
   - Accent: `V3.NAVY`
   - Skin tone: `V3.SKIN_MID`
   - Hair: `V3.HAIR_DARK` short
   - Number: from `PlayerSkin.position`-derived guess (CF → "9",
     CM → "10", GK → "1") or empty string
2. On next login, surface a one-time prompt: "Customize your kit"
   → drops them into the same `AvatarCustomizationWizard`.
3. Existing photo avatars stay; the wizard offers "Switch to
   illustrated" with a preview comparison.

---

## Open product questions

1. **Should the captain be able to mark a player's avatar as
   "locked"** once approved, to prevent mid-season changes that
   look weird in card history? *Tentative yes — Phase C ships it.*
2. **Should the avatar's `skinTone` and `hairColor` be set by the
   player only**, or should we allow captains to set them too?
   *Player-only on identity, captain on kit/number/position. Phase
   B + C reflect this split.*
3. **Do we want to support more hair styles** (afro, bun, bob,
   long, etc.) in V2? *6 presets covers ~85% of presentation styles
   — expand based on player feedback.*
4. **Is there value in a "captain's armband" badge** that surfaces
   automatically based on role? *Yes — Phase E.*
5. **Should we render an animated "in motion" version** for the
   in-app gallery (kicked leg, hands raised), and the static
   version for share PNGs? *Defer to a separate motion-design pass.*
6. **What happens when a player leaves one squad and joins
   another?** *Their `UserAvatar` is portable. Kit color
   automatically updates to new squad's default (unless they've
   chosen a custom kit color, in which case we prompt: "Keep your
   colors or switch to [new squad name]'s?").*
7. **GDPR / privacy story for avatars in shared cards?** *Avatars
   are abstracted illustrations — no PII. Captain can set squad
   to "private" which suppresses sharing without disabling
   in-app gallery.*

---

## Naming convention

- Data model: `UserAvatar`
- V3 card scaffold: `V3Avatar` / `V3SquadCrest`
- Onboarding UI: "Build your kit"
- Captain admin: "Squad kit settings"
- Backfill script: `scripts/maintenance/backfill-user-avatars.ts`

---

## What this unlocks

Once shipped, the avatar system is the foundation for:

- Personal moment cards (every card on a player's profile features
  their face)
- Recruitment posts with captain's avatar embedded
- Captain Spotlight cards with the captain's avatar centered (see
  `V3Marketing.tsx` — already designed for this)
- Squad of the Week with top-scorer avatar embedded
- Match-day cards showing the lineup of avatars (future: in-game
  "team sheet" view)
- The Panini-sticker collectible feel that the V3 register has been
  building toward
