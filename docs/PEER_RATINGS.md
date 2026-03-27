# Peer Attribute Ratings

**Crowdsourced player progression — squadmates rate each other's real-world performance.**

> After every match, players rate their teammates' attributes. These peer ratings feed into attribute XP, creating a social proof layer that captures what the stat sheet misses.

---

## Why

The current XP system rewards countable events: goals, assists, clean sheets. This leaves a gap:

- The midfielder who controls the tempo but doesn't score gets barely rewarded.
- The defender who organises the line and wins every aerial duel gets the same XP as one who hides.
- "Pace" and "physical" have no stat-sheet proxy at all in amateur football.

Peer ratings fix these blind spots while generating engagement and data:

| Benefit | Detail |
|---------|--------|
| **Fairer progression** | Attributes grow based on how you actually play, not just goals/assists |
| **Post-match engagement** | Creates a natural reason to return to the app after the final whistle |
| **Social dynamics** | Recognition from teammates feels meaningful — drives retention |
| **Data density** | Every match generates 6× more attribute signal than stat-sheet alone |
| **Banter fuel** | "You rated my pace a 4?!" — organic conversation + group chat engagement |

---

## Core Flow

```
Match finalized
  → Normal match XP awarded (goals, assists, clean sheets, etc.)
  → Peer rating window opens (24h)
  → Players rate 2-3 teammates on standout attributes
  → Window closes
  → Calculate median scores per player per attribute
  → Apply peer XP bonus to attributes
  → Award/penalize Scout XP to raters based on consensus accuracy
```

### Integration Point

This runs as a **second XP pass** after the existing `applyMatchXP` in `match-xp.ts`. The peer XP is additive — it never replaces or reduces normal match XP.

---

## UX Design

### Rating Prompt — "Who Stood Out?"

Frame it as **recognition**, not judgment. After a match is verified:

1. Player opens the post-match screen
2. Shown 3 teammates (randomly assigned or position-based)
3. For each teammate, pick **1-2 standout attributes** and rate them 1-10
4. Optional: one free-text "moment of the match" comment
5. Submit — takes ~30 seconds total

**Why limit to 3 teammates × 2 attributes:**
- Avoids rating fatigue (nobody wants to rate 10 players × 6 attributes)
- Forces genuine reflection ("who *actually* stood out?")
- Ensures every player gets rated by enough teammates across matches

### Rating Window

- Opens when match is verified/finalized
- Stays open for **24 hours**
- Push notification / Telegram reminder at 12h if not completed
- Players who don't rate simply miss out on Scout XP — no penalty

---

## Honesty Mechanism — Consensus Scoring

The system incentivises honest ratings by rewarding raters whose scores align with the squad consensus.

### How It Works

After the rating window closes, calculate the **median** rating per player per attribute across all raters.

| Rater's deviation from median | Effect on **rater** |
|-------------------------------|---------------------|
| Within ±1 | **+5 Scout XP** — accurate judge |
| Within ±2 | Neutral — no bonus, no penalty |
| ±3 or more | **−3 Scout XP** — outlier rating |

### Why Median (Not Average)

One troll rating a teammate 1/10 on everything gets ignored. Median is naturally resistant to outliers and requires collusion from >50% of raters to manipulate.

### Anti-Collusion

- Two mates always rating each other 10/10 → if the rest of the squad rates that player a 6, the inflated ratings deviate from median → rater loses Scout XP.
- The more squad members participate, the harder collusion becomes.
- Sustained deviation flags the rater for reduced vote weight (see Scout Reputation below).

### Scout Reputation

Cumulative Scout XP unlocks tiers:

| Scout XP | Tier | Perk |
|----------|------|------|
| 0-49 | Rookie Scout | Ratings count at 1.0× weight |
| 50-149 | Trusted Scout | Ratings count at 1.15× weight |
| 150+ | Elite Scout | Ratings count at 1.25× weight, "Scout" badge on profile |

Raters with negative Scout XP have their votes weighted at 0.75×. This creates a soft reputation system — consistent accuracy is rewarded, consistent trolling is dampened.

---

## XP Impact

### For the Rated Player

```
peerAttributeXP = medianRating × PEER_XP_MULTIPLIER
```

Where `PEER_XP_MULTIPLIER` is tuned so peer XP contributes roughly **15-25%** of total match XP. This keeps it meaningful but secondary — real performance still dominates.

**Suggested constant:** `PEER_XP_MULTIPLIER = 3`

Example: A player whose squad rates their passing a median of 8/10 this match:
- Peer passing XP = 8 × 3 = **24 XP** added to their `passing` attribute
- Compared to ~80-120 total match XP from the existing system

### For the Rater

Scout XP is tracked separately on the rater's profile. It does **not** affect their attribute ratings — it's a meta-reputation for judging ability. But it unlocks the Scout badge (visible on profile/leaderboard) and increases vote influence.

### Minimum Quorum

Peer XP only applies when a player receives **≥3 ratings** for an attribute from that match. Below that threshold, the sample is too small — no peer XP is awarded, but the ratings are still recorded for future aggregation.

For small squads (5-a-side), peer XP contribution is automatically scaled down by `min(raterCount / 5, 1.0)` to account for lower sample sizes.

---

## Data Model

### New Schema

```prisma
model PeerRating {
  id        String   @id @default(cuid())

  matchId   String   @map("match_id")
  match     Match    @relation(fields: [matchId], references: [id])

  raterId   String   @map("rater_id")
  rater     PlayerProfile @relation("RatingGiven", fields: [raterId], references: [id])

  targetId  String   @map("target_id")
  target    PlayerProfile @relation("RatingReceived", fields: [targetId], references: [id])

  attribute String   // "pace", "shooting", "passing", "dribbling", "defending", "physical"
  score     Int      // 1-10

  // Consensus result (populated after window closes)
  deviation Int?     // How far this rating was from the median
  scoutXP   Int?     @map("scout_xp") // XP earned/lost for this rating

  createdAt DateTime @default(now()) @map("created_at")

  @@unique([matchId, raterId, targetId, attribute])
  @@map("peer_ratings")
}
```

### Schema Changes to Existing Models

```prisma
// Add to PlayerProfile:
  scoutXP         Int @default(0) @map("scout_xp")
  scoutTier       String @default("rookie") @map("scout_tier") // rookie, trusted, elite

  ratingsGiven    PeerRating[] @relation("RatingGiven")
  ratingsReceived PeerRating[] @relation("RatingReceived")

// Add to Match:
  peerRatings     PeerRating[]
  peerRatingsClosed Boolean @default(false) @map("peer_ratings_closed")
  peerRatingsCloseAt DateTime? @map("peer_ratings_close_at")
```

### XP Source

Peer XP gains are recorded in the existing `XPGain` model with:
- `source: "peer_rating"`
- `attributeBreakdown` containing the per-attribute peer XP

---

## Implementation Plan

### Phase 1 — Schema + Backend (Priority: High)

1. **Database migration**
   - Add `PeerRating` model
   - Add `scoutXP` and `scoutTier` fields to `PlayerProfile`
   - Add `peerRatingsClosed` and `peerRatingsCloseAt` to `Match`

2. **tRPC endpoints** (`src/server/routers/match.ts` or new `peer-rating.ts` router)
   - `peerRating.submit` — Submit ratings for a teammate (validates: rater is in the match squad, target is in the match squad, within rating window)
   - `peerRating.getMyAssignments` — Get which teammates to rate + which attributes (randomised assignment)
   - `peerRating.getResults` — Get aggregated peer ratings for a match (only after window closes)
   - `peerRating.getScoutProfile` — Get rater's Scout XP and tier

3. **Consensus engine** (`src/lib/match/peer-consensus.ts`)
   - `calculateConsensus(matchId)` — Triggered when rating window closes
   - Computes median per player per attribute
   - Calculates each rater's deviation → assigns Scout XP
   - Applies peer XP to `PlayerAttribute` records
   - Creates `XPGain` entries with `source: "peer_rating"`

4. **Rating window scheduler**
   - On match verification: set `peerRatingsCloseAt = now + 24h`
   - Cron job or serverless function to close expired windows and trigger consensus

### Phase 2 — Frontend (Priority: High)

5. **Post-match rating flow** (`src/app/(app)/match/[id]/rate/page.tsx`)
   - Teammate cards with attribute selector
   - Swipe or tap to rate 1-10 per attribute
   - Progress indicator ("2 of 3 teammates rated")
   - Confirmation with estimated Scout XP preview

6. **Match result integration**
   - Add "Rate Teammates" CTA to the post-match screen
   - Show peer rating status (pending / submitted / closed)
   - Display peer XP breakdown alongside normal match XP in results

7. **Profile integration**
   - Scout badge on player profile card
   - Scout XP progress bar in profile stats
   - "Peer perception" radar chart — how teammates see your attributes vs. self-rating

### Phase 3 — Polish + Notifications (Priority: Medium)

8. **Telegram notifications**
   - "Match verified! Rate your teammates" (immediate)
   - "12h left to rate — don't miss your Scout XP" (reminder)
   - "Your teammates rated your passing 8/10 this week 🔥" (results)

9. **Leaderboards**
   - "Top Scouts" leaderboard in squad
   - "Most improved by peer rating" weekly highlight

10. **Analytics dashboard**
    - Self-rating vs. peer-rating discrepancy tracking
    - Squad-level attribute trends from peer data

---

## Constants

```typescript
// src/lib/match/constants.ts

export const PEER_RATING = {
  WINDOW_HOURS: 24,
  MIN_QUORUM: 3,           // Minimum ratings needed per attribute
  TEAMMATES_TO_RATE: 3,    // How many teammates each player rates
  ATTRIBUTES_PER_TEAMMATE: 2, // Standout attributes to rate per teammate
  XP_MULTIPLIER: 3,        // peerXP = median × this
  MAX_PEER_XP_RATIO: 0.25, // Peer XP capped at 25% of total match XP

  SCOUT_XP: {
    ACCURATE: 5,            // Within ±1 of median
    NEUTRAL_RANGE: 2,       // Within ±2, no effect
    OUTLIER_PENALTY: -3,    // ±3 or more from median
  },

  SCOUT_TIERS: {
    ROOKIE:  { minXP: 0,   weight: 1.0,  label: 'Rookie Scout' },
    TRUSTED: { minXP: 50,  weight: 1.15, label: 'Trusted Scout' },
    ELITE:   { minXP: 150, weight: 1.25, label: 'Elite Scout' },
  },

  NEGATIVE_WEIGHT: 0.75,   // Vote weight for raters with negative Scout XP
} as const;
```

---

## Design Decisions

> Context: SportWarren targets amateur/recreational players — Sunday league, 5-a-side regulars, semi-competitive groups who play for fun and exercise. Every decision optimises for fun, simplicity, and not making the app feel like a job.

### Captain/vice-captain extra Scout weight — **No**

In amateur football, captains are often just whoever organised the WhatsApp group. Giving them extra authority over ratings adds politics to what should be lighthearted. Keep it democratic — everyone's vote matters equally, and Scout tiers handle credibility organically over time through consistent accuracy.

### Anonymous or visible — **Anonymous while open, visible after close**

Amateurs play with mates — visible real-time ratings would create awkward dressing room energy. But revealing them *after* the window closes is the fun part: *"who rated my dribbling a 3?!"* drives banter without influencing votes.

- **During window:** Rater sees only their own submitted ratings
- **After window closes:** Show aggregate medians immediately. Individual breakdowns available behind an optional "reveal" toggle
- This balances honesty (anonymous voting) with engagement (post-reveal banter)

### Player of the Match vote — **Yes, add it**

This is the easiest engagement win. One tap, no thinking required. Way more accessible than granular attribute ratings.

- Show MOTM vote **first** — *"Who was your Player of the Match?"*
- Then *optionally* offer the attribute ratings after
- MOTM winner gets a flat **+15 XP** spread evenly across all attributes
- For casuals who can't be bothered with attribute ratings, at least the MOTM vote gets captured — it's still valuable data and engagement

Add to the schema:
```prisma
// Add to PeerRating or as a separate lightweight model
model MotmVote {
  id        String   @id @default(cuid())
  matchId   String   @map("match_id")
  match     Match    @relation(fields: [matchId], references: [id])
  voterId   String   @map("voter_id")
  voter     PlayerProfile @relation("MotmVoteGiven", fields: [voterId], references: [id])
  targetId  String   @map("target_id")
  target    PlayerProfile @relation("MotmVoteReceived", fields: [targetId], references: [id])
  createdAt DateTime @default(now()) @map("created_at")

  @@unique([matchId, voterId])
  @@map("motm_votes")
}
```

Add to constants:
```typescript
export const MOTM = {
  XP_BONUS: 15, // Spread evenly across all 6 attributes
} as const;
```

### Late subs (< 20 mins) — **Still ratable, no cutoff**

Amateurs don't track minutes precisely. Someone who came on for the last 15 might have scored the winner. Let teammates rate them normally, but show a subtle "(sub)" tag so raters naturally calibrate expectations. Don't over-engineer a time cutoff — it'll feel bureaucratic for a Sunday league app.

### Peer ratings in match simulation — **Not yet**

The simulation engine is already speculative. Feeding peer-sourced data into it compounds uncertainty and is hard to explain to users. Keep simulation based on hard stats only for now. Revisit once there are 50+ matches of peer data per squad and we can validate that peer ratings correlate with real performance trends.
