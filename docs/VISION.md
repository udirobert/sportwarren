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
Build-in-Public artifact; the reusable workflow is at
[`docs/makeathon/REPRODUCE.md`](makeathon/REPRODUCE.md).

---

## Who we build for

The wedge persona has one shape: **the person who already does the work of remembering, for a recurring group of mates.** That person shows up in two flavors:

### Primary A: The fixed-squad captain

A Sunday League team plays as a unit. Same shirt, same name, same fixture list. The captain maintains a spreadsheet of goals, attendance, head-to-head records — going back years in some cases. They have authority in the WhatsApp group and bring 10–15 players with them when they adopt.

The unit of preservation is **the squad's season.** Imports an existing roster. Logs match-by-match. The captain's experience of "I've been maintaining this for years" is recognized and honored.

### Primary B: The kickabout organizer

A recurring 6/8-a-side group plays weekly with shifting teams — "Reds vs Blues" decided by bibs on the night, winner stays on, two-goal early finish, twenty short games over two hours. **There is no fixed squad** — the group is the people, not the team. The organizer holds the WhatsApp group, books the pitch, remembers who scored last week.

The unit of preservation is **the session.** Each Tuesday (or whenever the group meets) is one entry. Individual stats accumulate to the player across sessions regardless of which "team" they were on that night. The organizer's experience of "I've been keeping score in my head for years" is recognized and honored.

**Both are the same wedge** — someone who already does the unpaid work of memory, for a group that already cares. SportWarren is the home for that work. Both onboard the same way: import what you have (a spreadsheet, a season's results, a WhatsApp message thread, even a beer-mat tally for the kickabout), and the group's history materializes.

### Secondary: The player who cares

The fifteen-year-old in São Paulo who just played his first competitive match. The pub-league striker who scored a brace last week and wants to remember it. The player who wants to see their career as a real thing — not a fantasy team, but the actual record of games they played, goals they scored, teammates they shared a pitch with.

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

1. **Import what you have.** Whatever the organizer or captain already keeps — a spreadsheet, a season fixture sheet, a WhatsApp message thread of last week's scores — drop it in and the group's history materializes. The "love letter" landing in the inbox.

2. **Organizer-first acquisition.** Whether they're called captain (fixed squad) or organizer (kickabout), the person who already does the work doesn't need to be sold on the value — they've been living it for years. We just need to be a better home than Google Sheets, Notes, or memory.

3. **Pre-seeded onboarding for the rotating-team case.** The organizer of a kickabout group sets up the roster + last week's results in 10 minutes, sends each player a personal preview link. By the time the group meets on the next match night, the app already knows them. No 18 individual sign-ups; one organizer doing the work of 18.

4. **Multi-channel, zero-install.** The product becomes a layer under existing behavior, not a destination people have to drag their squad to. Quote-reply in WhatsApp to log a result. Auto-detect matches in group chat. The least friction wins.

5. **The Match-of-the-Day stat.** "When Dave and Sami are on the same team, the win rate is 73%." That's the screenshotable insight. Shareable to the group chat as an image. The stat that makes someone feel seen.

6. **The post-match card as keepsake.** Not a gamified XP screen. A memento — designed to be saved, screenshotted, looked at years later. This is where the product's emotional promise lands in pixels.

---

## How we measure success

**Primary signal (4-week cohort validation):**
- Does the organizer stop maintaining their old spreadsheet/memory system? (Behavioral substitution — the strongest possible signal.)
- Does anyone in the group screenshot a SportWarren stat into the WhatsApp chat unprompted? (Meaning is being created.)

**Secondary signals (product health):**
- Logging cadence: >= 1 session per week per group (kickabout) or >= 2 matches per week per squad (fixed)
- Peer ratings: >= 60% of matches have ratings from >= 3 teammates
- Retention: group active in week 4 after onboarding
- Share rate: stats or moments shared outside the app

Everything else (DAU curves, NPS, engagement time) is downstream noise compared to those two primary signals.

---

## Principles that guide the build

These complement the engineering principles (ENHANCEMENT FIRST, CONSOLIDATION, PREVENT BLOAT, DRY, CLEAN, MODULAR, PERFORMANT, ORGANIZED) with product-specific guidance.

- **Preserve first, optimize second.** Every feature should be justifiable against "does this help a group remember its history?" Coaching, tournaments, and social features are optimization — they come after preservation is solid.
- **The organizer is the unit of acquisition.** Whether that's a fixed-squad captain or a kickabout organizer, build for the person who already does the work of memory. They bring the group with them.
- **Sessions matter as much as squads.** Not every group plays as a fixed team. The 6-a-side group that rotates teams every game is just as worth preserving as the Sunday League side. The data model and surfaces support both shapes.
- **Jargon is a leak.** If the user-facing copy mentions a protocol, a token, a chain, or an internal codename, it's wrong. Plain language only.
- **The post-match card is the emotional surface.** Invest disproportionately in how it looks, feels, and shares. It's what players actually see and send.
- **If it doesn't help a group remember, defer it.** Every new feature passes through this filter or it goes to phase 2.
