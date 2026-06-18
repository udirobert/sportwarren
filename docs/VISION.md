# SportWarren Vision

## The one-sentence thing

**SportWarren ensures that every grassroots football match leaves a permanent mark — because the game matters, and the people who play it deserve a record that outlasts any platform.**

---

## The problem

Professional football has Opta, Wyscout, and entire analytics departments. Every touch, every pass, every sprint is tracked, stored, and turned into insight.

Meanwhile, 265 million registered amateur footballers worldwide — and multiples of that playing informally — have a WhatsApp group and a fading memory of last week's scoreline. The lucky ones have a spreadsheet someone's dad/friend maintains.

That gap is what SportWarren closes.

---

## The insight

There's a group in Scotland that has been playing football together for thirty years. Multigenerational. Fathers and sons. Friendships that outlasted jobs, marriages, and injuries. Every week, same pitch, same natter about who's going in goal. And for thirty years, someone maintained a spreadsheet. Goals scored. Attendance. Form. Head-to-head records going back to the nineties. No prize for it. Never seen by anyone outside the group. But it keeps going — because the alternative (letting it all disappear) feels like a small betrayal of something that matters.

**The spreadsheet is a love letter to the group.**

The camera footage someone shoots from the sideline is a memory system.

What these people are doing, clumsily, with whatever tools are available, is the thing SportWarren does properly.

Nobody ever built the right home for it. SportWarren is that home.

---

## What we're building

**A living record for every grassroots footballer.** Not a gamified profile. Not a social network. A permanent career record that grows with every match, every rating, every moment.

The twin (the data model behind the record) is designed so that:

- **It's yours.** Stored onchain so it outlasts any platform. Not dependent on SportWarren surviving as a company or any service changing its rules. Non-transferable, soulbound to you. No wallet required — the complexity is abstracted away, but the ownership is real.
- **It reflects what your peers actually see.** Attributes evolve through peer consensus after every verified match. Not a self-assessment, not a coach's opinion — what your teammates genuinely think of your game. Consensus filters noise and rewards accurate raters.
- **It captures what professional stats miss.** How did you play with different teammates? What's your record against specific opponents? Which formation brings the best out of you? These are the stats Match of the Day reserves for Premier League players, made available to anyone who plays.
- **It connects the dots between matches.** A training session, a logged run, a recovery day — all of it feeds the record. And when your passing rating has plateaued, the record suggests what to work on. Less trophy cabinet, more personal coach.

The promise "every match leaves a mark" has a concrete artifact behind
it: a [shareable moment-card library](https://www.figma.com/design/xTaynEAGCjhhmcmQdPG0JZ)
bound to SportWarren's design tokens, with one archetype per kind of
moment (records broken, levels up, season ends, debuts). Cards are
rendered server-side and stored permanently alongside the moment row.
The build that produced this library — including its failures and
recovery — is documented in [`docs/makeathon/`](makeathon/) as a
Build-in-Public artifact, with the reusable workflow at
[`docs/makeathon/REPRODUCE.md`](makeathon/REPRODUCE.md).

---

## Who we build for

### Primary: The captain

The person who already maintains the spreadsheet. They already show the behavior. They already care. They have authority in the WhatsApp group and bring 10–15 players with them when they adopt.

**Captain-first means:**
- The onboarding flow starts with "import your existing spreadsheet"
- Squad management tools are designed for the person who organizes matches
- Multi-channel ingestion — log results from WhatsApp without anyone installing an app
- The captain's experience of "I've been maintaining this for years" is recognized and honored

### Secondary: The player who cares

The fifteen-year-old in São Paulo who just played his first competitive match and has no idea that by Saturday it will be as if it never happened. The player who wants to see their career as a real thing — not a fantasy team, but the actual record of games they played, goals they scored, teammates they shared a pitch with.

---

## What we're not building (phase 2 / not our bet)

| Not this | Because |
|----------|---------|
| Tournaments / championship ladder | Grassroots football doesn't need imposed competition. The spreadsheet exists without prizes. Don't bolt on a meta-game. |
| Coaching marketplace | Coaching is optimization. The product is about meaning and memory. Doesn't fit. |
| Agentic-commerce surface | The onchain layer is durability infrastructure, not a marketplace. Keep the rails dormant, stop building for it. |
| Social network | We're not trying to be Instagram for football. The squad already has a WhatsApp group. Meet them there. |

---

## The onchain decision

Every twin on SportWarren is owned by the player. Reputation stored permanently, non-transferably, not dependent on SportWarren surviving as a company. The complexity is abstracted away — no wallet required, no gas fees, no crypto jargon visible to the user.

**The narrative is: "Your record outlasts the platform."** That's the only sentence we need.

We use attestation infrastructure to anchor every match, rating, and moment onchain. But the protocol layer (x402, Kite, settlement contracts) is invisible to users. User-facing strings use plain language: "verified", "receipt confirmed", "permanent record". Nothing more.

This is the most expensive framing to maintain (we carry the infra cost without the UX upside of a visible crypto feature). But it's also the only honest one: the record genuinely is permanent. The alternative — building on a platform that could disappear, change its terms, or shut down — would break the core promise.

---

## How we win

1. **Spreadsheet import.** Let a captain paste in their existing spreadsheet and have decades of history materialize on day one. The single most powerful onboarding moment we can engineer. The "love letter" landing in the inbox.

2. **Captain-first acquisition.** The spreadsheet guy is the archetype. He doesn't need to be sold on the value — he's been living it for years. We just need to be a better home than Google Sheets.

3. **Multi-channel, zero-install.** The product becomes a layer under existing behavior, not a destination people have to drag their squad to. Quote-reply in WhatsApp to log a result. Auto-detect matches in group chat. The least friction wins.

4. **The Match-of-the-Day stat.** "When Dave and Sami start together, the win rate is 73%." That's the screenshotable insight. Shareable to the group chat as an image. The stat that makes a captain feel seen.

5. **The post-match card as keepsake.** Not a gamified XP screen. A memento — designed to be saved, screenshotted, looked at years later. This is where the product's emotional promise lands in pixels.

---

## How we measure success

**Primary signal (4-week cohort validation):**
- Does the captain stop maintaining their old spreadsheet? (Behavioral substitution — the strongest possible signal.)
- Does anyone in the squad screenshot a SportWarren stat into the group chat unprompted? (Meaning is being created.)

**Secondary signals (product health):**
- Match logging: >= 2 matches per squad per week
- Peer ratings: >= 60% of matches have ratings from >= 3 teammates
- Retention: squad active in week 4 after onboarding
- Share rate: stats or moments shared outside the app

Everything else (DAU curves, NPS, engagement time) is downstream noise compared to those two primary signals.

---

## Principles that guide the build

These complement the engineering principles (ENHANCEMENT FIRST, CONSOLIDATION, PREVENT BLOAT, DRY, CLEAN, MODULAR, PERFORMANT, ORGANIZED) with product-specific guidance.

- **Preserve first, optimize second.** Every feature should be justifiable against "does this help a squad remember its history?" Coaching, tournaments, and social features are optimization — they come after preservation is solid.
- **The captain is the unit of acquisition.** Build for the person who already maintains the spreadsheet. They bring the squad.
- **Jargon is a leak.** If the user-facing copy mentions a protocol, a token, a chain, or an internal codename, it's wrong. Plain language only.
- **The post-match card is the emotional surface.** Invest disproportionately in how it looks, feels, and shares. It's what players actually see and send.
- **If it doesn't help a squad remember, defer it.** Every new feature passes through this filter or it goes to phase 2.
