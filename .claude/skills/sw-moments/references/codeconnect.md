# Code Connect — Moment Card Mapping Pattern

Code Connect ties Figma components to TS implementations so the next time the
agent reads a Figma file it knows which code component renders each design.
For the moment card library, the TS side lives under `src/components/moments/`
and the rendering side lives in `src/server/services/personalization/`.

## Target structure
```
src/components/moments/
  cards/
    RecordBrokenCard.tsx       <- mapped to Figma "MomentCard / Record Broken"
    SeasonEndCard.tsx          <- mapped to Figma "MomentCard / Season End"
    TwinCreatedCard.tsx        <- mapped to Figma "MomentCard / Twin Created"
    LevelUpCard.tsx
    SimCompleteCard.tsx
    AchievementCard.tsx
    CoachingHiredCard.tsx
    CoachingExpiredCard.tsx
    AttestationMilestoneCard.tsx
    MatchImportedCard.tsx
    index.ts                   <- registry: kind -> Card component
  SquadMomentsGallery.tsx      <- existing, unchanged
```

The new satori renderer (`moment-render-v2.ts`, parallel to the existing one
during the demo) consumes the registry:

```ts
import { CARDS } from '@/components/moments/cards';

const Card = CARDS[moment.kind] ?? CARDS.default;
const html = renderToStaticMarkup(<Card moment={moment} />);
const svg = await satori(html, { width: 600, height: 400, fonts: [...] });
```

Each card component receives a typed `moment` prop matching the schema in
`SquadMomentsGallery.tsx`'s `MomentItem`.

## Code Connect mapping shape
For each Figma component, call `add_code_connect_map` with:
- `nodeId` — the Figma component's id (from `get_design_context` /
  `get_metadata`)
- `filepath` — the absolute path to the TS card component
- `componentName` — the exported component name (e.g. `RecordBrokenCard`)
- `props` — map any Figma component properties (e.g. `tier`) to TS prop
  paths (e.g. `moment.tier`)

`add_code_connect_map` is exempt from MCP rate limits — burn these freely.

## Verification
After mapping, call `get_code_connect_map` for the file and confirm every
moment kind has an entry. Mappings missing from the map indicate either an
un-named component on the Figma side or a typo in the `componentName`.

## Why this matters for the demo
The video benefits from showing the Code Connect map populating live — it
visually proves the design-to-code round trip. Save one component for the
last live mapping in the video.

## Font note
Space Grotesk needs to be loaded into satori the same way Inter currently is.
Update `loadFont()` in the new renderer to fetch the Space Grotesk variable
font from Google Fonts (or self-host under `public/fonts/`). The existing
Inter URL in `moment-render.ts` is the pattern to copy.
