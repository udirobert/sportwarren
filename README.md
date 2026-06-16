# SportWarren

**The spreadsheet is a love letter. We built a better home for it.**

There's a group in Scotland that has been playing football together for thirty years. Fathers and sons. Friendships that outlasted jobs, marriages, injuries. Every week, same pitch, same natter about who's going in goal. And for thirty years, someone maintained a spreadsheet. Goals scored. Attendance. Form. Head-to-head records going back to the nineties. No prize for it. The spreadsheet will never be seen by anyone outside the group. But it keeps going — because the alternative (letting it all disappear) feels like a small betrayal of something that matters.

SportWarren is that spreadsheet, but it doesn't depend on anyone's dad still being alive to maintain it.

Professional football has Opta, Wyscout, and entire analytics departments. Meanwhile, 265 million registered amateur footballers worldwide — and multiples of that playing informally — have a WhatsApp group and a fading memory of last week's scoreline. That gap is what SportWarren closes.

**Every player gets a living record that grows with their career.** After every verified match, teammates rate each other's performance — pace, shooting, passing, defending — and those ratings feed into your record through a consensus system that filters noise and rewards accuracy. Over time, it becomes something real: a portrait of how you play, built by the people who know your game best.

No app install required. No complexity visible. Just play, and your record evolves.

---

## What SportWarren preserves

**Your career, not a gamified profile.** The record is yours. Built onchain so it outlasts any platform — not dependent on SportWarren surviving as a company or any service changing its rules. Every match, every rating, every moment is stored permanently. That's not a feature. It's the point.

**Your squad's history.** Grassroots football isn't professional football. The lineup is never fixed. Every week is a different configuration depending on who shows up. SportWarren tracks who played together, how often, what the result was — the kind of stat Match of the Day reserves for Premier League players ("when these two start together, the win rate is 73%") becomes something any Sunday league captain can pull up from WhatsApp.

**The moments that matter.** A last-minute winner. A midfielder who ran the whole game. A comeback nobody saw coming. These shouldn't vanish by Saturday. Every verified match produces a moment — a shareable card designed to be saved, screenshotted, looked at years later.

**The connections between matches.** A run logged on Strava, a training session completed, a recovery day tracked — all of it feeds in. And when your passing rating has plateaued, the system doesn't just record it. It suggests what to work on. Less trophy cabinet, more personal coach.

---

## How it works

| Layer | What it does |
|-------|-------------|
| **Match logging** | Log results via WhatsApp, Telegram, or web. Teammates verify and rate each other's performance. |
| **Living record** | Every match, every rating, every drill builds your permanent football career. Attributes evolve through peer consensus. |
| **Squad history** | Head-to-head records, combination stats, and season-by-season archives. The spreadsheet, made alive. |
| **Multi-channel access** | Full dashboard on web, Telegram Mini App for power users, WhatsApp for casual updates. Meet your squad where they already are. |
| **Onchain permanence** | Your record is soulbound to you — non-transferable, not dependent on any platform, stored permanently. No wallet required. |

---

## Access

**Web:** [sportwarren.com](https://www.sportwarren.com) — Full dashboard with your career record, squad history, and match logging.

**Telegram:** [@SportWarrenBot](https://t.me/SportWarrenBot) — Mini App for match coordination, ratings, and squad chat.

**WhatsApp:** Text **+1 (201) 534-5384** — Log results, get squad updates, stay connected without leaving your group chat.

---

## Documentation

| Document | Purpose |
|----------|---------|
| **[ARCHITECT.md](docs/ARCHITECT.md)** | Technical blueprint: match lifecycle, twin system, formations, multi-channel architecture. |
| **[PLATFORMS.md](docs/PLATFORMS.md)** | Channel guides for Telegram, WhatsApp, and web dashboard. |
| **[BUILD.md](docs/BUILD.md)** | Development setup, deployment, tRPC routers, cron endpoints, env vars. |
| **[FORMATIONS.md](docs/FORMATIONS.md)** | Formation playground — pre-auth viral loop for squad discovery. |
| **[ONBOARDING.md](docs/ONBOARDING.md)** | Captain-first onboarding flow and context management. |
| **[DESIGN_TOKENS.md](docs/DESIGN_TOKENS.md)** | Visual system: colors, typography, layout, animations. |

---

## Quick Start

```bash
git clone https://github.com/udirobert/sportwarren.git
cd sportwarren
pnpm install
cp .env.example .env.local
pnpm run dev
```

**Web Dashboard:** http://localhost:3000
**API:** http://localhost:3000/api/trpc

---

**Built for the guy with the spreadsheet, for the fifteen-year-old in São Paulo playing his first competitive match, and for every game that deserves to be remembered.**

⚽ **SportWarren** — Every match leaves a mark.
