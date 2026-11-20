# Market research — opportunity validation

> Researched 2026-11-20 (Tavily, sources linked inline). Feeds
> `docs/product-calibration.md` and `VISION.md` — this is the external
> evidence for the wedge those docs argue from internal reasoning.

## Market size — bigger than the spreadsheet crowd suggests

- **15.7M grassroots footballers in England alone**, ~125k teams across all
  levels, expected to reach ~140k by 2028. Over **1M people work or
  volunteer** in grassroots football — the organizer/record-keeper persona
  is a population, not a niche. ([GIS](https://gis.sport/news/grassroots-football-participation-impact-and-employabilit),
  [Kit Funder](https://kitfunder.ai/blog-posts/2026-world-cup-grassroots-football))

## Competition audit — the wedge is confirmed empty

Spond, Heja, Pitchero, SquadTracker, STATZO, Footy Genius, Prematch all
cover scheduling, stats, and chat. Audit findings:

- **Nobody leads with permanence.** Every competitor sells organization
  convenience; none sell "your record outlasts the platform." The
  preservation positioning is uncontested.
- **Nobody captures from WhatsApp.** All are app-first; casual chat
  capture ("we won 4-2, I got 2") into a verified record is unbuilt.
- **Nobody does verified peer attribution.** Stats in these apps are
  self-reported or organizer-entered; conservative name-resolution +
  peer-verified moments is differentiated. ([medalyst.io](https://medalyst.io/guides/best-sports-club-management-apps-europe),
  [CB Insights](https://www.cbinsights.com/company/spond/alternatives))

## WhatsApp-first is the right channel for emerging markets

- WhatsApp penetration: **93–95% in Kenya, South Africa, Nigeria**;
  487M users in India, 118M in Brazil. UBA's Leo chatbot reached **12M
  users across 20+ African countries** — chat-first products scale there.
  Adidas used WhatsApp specifically to reach under-served segments.
  ([Caleb Maru/LinkedIn](https://www.linkedin.com/posts/calebmaru_in-emerging-markets-whatsapp-isnt-just-),
  [BotsCrew](https://botscrew.com/cases/adidas-whatsapp-chatbot))
- **Concrete follow-up:** `notify-i18n.ts` shipped en/es/fr/pt/de. The
  next locale set should map to WhatsApp-dominant markets — **Swahili,
  Hausa, Yoruba, Zulu** — plus pt-BR coverage check.

## Personalization is validated, not speculative

- 85% of sports fans see value in AI-powered content; **64% want updates
  customized to their preferences**. The taste learner + quiet-gating
  (skip a kind and it stops spending your 3/day WhatsApp cap) is the
  direct answer to the notification-fatigue failure mode every
  team-management competitor suffers. ([IBM](https://newsroom.ibm.com/2025-08-18-ibm-study-sports-fans-demand-more-dynamic-di),
  [Capgemini via Sportzpower](https://sportzpower.com/50-sports-fans-turning-to-ai-for-personalized-content-st))

## Adjacent monetization signals

- **Payments appetite:** GoCardless partnered with 15 County FAs —
  grassroots subs/fees collection is a proven adjacency once the record
  habit is locked. ([GoCardless](https://gocardless.com/blog/gocardless-backs-the-beautiful-game-by-partnering-wi))
- **Regulatory tailwind (shared with Panna):** EU AI Act Article 50 +
  EAA mean AI-generated sports content needs disclosure + accessibility.
  SportWarren's taste-explanation surface ("why am I seeing this?") is
  already compliance-shaped for recommendation transparency.

## Ranked opportunity calls

1. **African-language notification set** — cheapest expansion into the
   WhatsApp-dominant markets; the i18n architecture already shipped.
2. **Double down the record-keeper wedge** — the competition audit
   confirms nobody owns permanence; every roadmap item should be judged
   against "does it strengthen the record" before anything else.
3. **County-FA / payments partnerships** — the GoCardless precedent shows
   FAs will sign deals; a "verified club record" offering for County FAs
   is a distribution wedge, not just revenue.
4. **Taste-explanation as a differentiator** — surface "why am I seeing
   this?" more prominently; recommendation transparency is both a
   retention feature and ahead of the Art-50 transparency curve.
