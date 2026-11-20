# Preservation-first implementation plan

## Outcome

Make the record-keeper loop the sole default product journey:

`bring existing group/history -> create session -> log result -> group verifies -> permanent record + keepsake -> share -> commit next session`

The player card remains an evidence-backed index of how the group remembers a player. It must no longer be the product's first promise. XP, levels, drills, simulations, tactics, coaching, tournaments, agents, and Web3 remain in the codebase but are not part of phase-one activation.

## Scope and principles

- Preserve rather than rebuild existing domain services and routes.
- Marketing retains the dark V4 stadium register; all record surfaces use V3.
- A verified match is authoritative. Twin state, cards, moments, renderings, and onchain attestations are projections or enrichment.
- Record creation must succeed when rendering, broadcast, AI, or onchain work fails; enrichment retries asynchronously.
- Product flags contain deferred features, but do not replace authorization checks.
- Preview tokens stay private. Public handles and session-reveal links remain read-only and separate from write authorization.

## Week 1 — Baseline and release guardrails

Define the activation outcome and instrument only the record loop.

Events:

1. `record_import_started` / `record_import_completed`
2. `history_import_completed`
3. `session_created`
4. `match_submitted`
5. `match_verified`
6. `moment_rendered`
7. `recap_opened`
8. `keepsake_shared`
9. `next_session_committed`

Implementation seams:

- `src/server/services/import/squad-import.ts`
- `src/server/services/match-submission.ts`
- `src/server/services/match-workflow.ts`
- recap/share actions and `src/lib/analytics.ts`

Success metrics:

- time from landing to first preserved match;
- share of imported groups verifying a match within seven days;
- week-four groups that log another match;
- recap sharing to a group channel;
- organizer evidence that SportWarren replaces their spreadsheet or memory system.

Do not use XP, drills, tactics, or simulation clicks as phase-one success metrics.

## Weeks 2–3 — Record-keeper acquisition and import

Reframe the public conversion path around bringing existing history into a permanent home. Keep the captain/player dual CTA, but make captain/record-keeper primary.

Likely files:

- `src/components/common/HeroSection.tsx`
- `src/components/landing/ProblemSection.tsx`
- `src/components/landing/SolutionSection.tsx`
- `src/components/landing/HowItWorksSection.tsx`
- `src/components/landing/AppPreviewSection.tsx`
- `src/components/import/SquadImportWizard.tsx`
- `src/components/onboarding/OnboardingFlow.tsx`

Changes:

- Lead with: “Keep the matches your group would otherwise forget.”
- Primary CTA: “Set up your group” / “Start your record.” Secondary CTA: “See my player card.”
- Replace progression language such as “Build. Verify. Grow.” and “Grow & Compete” with: “Bring the names you remember -> log the match -> let the group verify it -> keep the record.”
- Remove XP, tournament, agent, and tactical claims from the first conversion story.
- Reframe import as “Bring the record you’ve already been keeping.”
- Make historical match import the promoted post-roster continuation: “Add the games you don’t want to lose.”
- At completion, show a record-created summary (people, games preserved, one group-share action). Keep advanced mapping accessible but do not make it the dominant task when headers are confidently detected.
- Defer formation, brand, avatar, and identity personalization until after the first record exists.
- Add one sticky primary action per importer step and test at 320px and 375px.

Acceptance criterion: a first-time visitor can accurately explain the product without saying XP, tournament, tactics, wallet, or agent.

## Week 4 — First preserved match

After import, seed, or an empty squad state, the dominant action is “Preserve your first match.” No tactical, team-simulation, or player-card configuration step may block it.

Likely files:

- `src/app/(app)/dashboard/page.tsx`
- `src/components/adaptive/AdaptiveDashboard.tsx`
- `src/app/(app)/match/page.tsx`
- `src/app/(app)/sessions/page.tsx`
- `src/app/session/live/[token]/page.tsx`
- `src/server/services/match-submission.ts`
- `src/server/services/match-workflow.ts`
- `src/lib/ai/match-parser.ts`

Implementation:

- Default dashboard and empty states to import/history, quick match logging, latest session, pending verification, moments, card/share, and next-session commitment.
- Keep the existing tap-based live capture and natural-language result parser as the primary capture mechanisms.
- Keep Bibs Optimizer only after attendance is confirmed, labelled “Optional: suggest teams.” It helps the kickabout wedge but must not precede capture.
- For fixed squads, keep season/history context but make formations, scouting, rivalry, and simulations secondary.

Acceptance criterion: an organizer can go from imported roster to verified match without encountering an optional optimisation feature.

## Week 5 — Recap as an archive entry

Make the recap a keepsake before it is a rating screen.

Likely files:

- `src/app/session/recap/[sessionId]/[playerToken]/page.tsx`
- `src/app/session/[sessionId]/analysis/[playerToken]/page.tsx`
- `src/components/identity/V3PlayerCard.tsx`
- `src/app/preview/[token]/PreviewFirstContact.tsx`
- `src/app/preview/[token]/PreviewCardDashboard.tsx`

Required hierarchy:

1. Match identity: date, opponent/teams, result, attendees, verification state.
2. What happened: goals, assists, contribution, peer narrative.
3. Enduring record: card/attribute movement and career context.
4. “Save this match” / “Share the record.”
5. XP/progression details only if retained, below the primary story.

When a latest match exists, the preview dashboard leads with it. Keep peer ratings as verified group-memory evidence, but do not make the rating quiz the first task before a person has seen a preserved match. Collapse drills, simulation, tactics, and doctrine under a non-default secondary area.

Acceptance criterion: the recap remains emotionally useful if all XP language is removed.

## Week 6 — Navigation and route containment

The current `PHASE_1_HIDDEN_WIDGET_IDS` is a useful UI start, but it does not contain direct routes. Extend route-level product gating while retaining all existing authorization.

Likely files:

- `src/lib/feature-flags.ts`
- `src/test/feature-flags.test.ts`
- `src/components/adaptive/SmartNavigation.tsx`
- relevant app-layout navigation and guarded server pages

Add default-off flags such as `TOURNAMENTS`, `SIMULATION`, `TACTICS_ADVANCED`, `COACHING`, `AI_STAFF`, `SOCIAL`, `WEB3_SURFACES`, and `PROGRESSION_LOOPS`.

Remove from first-run navigation and guard the associated routes:

- `/tournament`
- `/preview/[token]/sim`, `/preview/[token]/drill`, `/preview/[token]/tactics`
- `/match/preview/*`
- `/coaching`, leaderboards, challenges, reputation
- governance, treasury, Lens, territory, staff, and market routes

Do not gate import, core match capture, `/preview/[token]`, public squad/player profiles, recap, broadcast, or player-record routes. A deferred deep link should render a clear product-state explanation with a relevant record-route CTA, rather than a raw 404.

## Week 7 — Core-record orchestration boundary

Do not split the large squad router yet. Introduce a narrow facade, for example `src/server/services/record/record-service.ts`, that calls existing domain services rather than duplicates them:

```text
import / roster seed
  -> session creation
  -> result submission
  -> verification
  -> PlayerMatchStats + TwinService event
  -> Moment projection
  -> recap/card bundle
  -> broadcast/share
```

Delegate to:

- `src/server/services/import/squad-import.ts`
- `src/server/services/match-submission.ts`
- `src/server/services/match-workflow.ts`
- `src/server/services/match-xp.ts`
- `src/server/services/personalization/twin-service.ts`
- `src/server/services/personalization/moments.ts`
- `src/server/services/communication/squad-broadcast.ts`

Invariants:

- verified match records are the source of truth;
- `TwinService.recordEvent` stays the only twin mutation funnel;
- idempotency, atomic verification/stat writes, privacy rules, and retryable enrichment are tested at this boundary;
- tactical and progression services stay independent and flag-gated.

## Week 8 — Mobile field test and resilience

Run one real kickabout and one fixed-squad cohort through the core loop.

Test scripts:

1. Spreadsheet/roster import to group link sent in under five minutes.
2. Kickabout: roster -> attendance -> optional bibs -> result -> verification -> recap.
3. WhatsApp natural-language result capture plus scorer-correction path.
4. Player opens their private preview and shares a recap without exposing a preview token.
5. Public squad/player visibility matrix.
6. Import, recap, and sharing at 320px and 375px.
7. Failure of rendering, broadcast, or onchain work still leaves the record created and retriable.

Add/extend integration or Playwright coverage for `import -> start session -> log goal -> verify/end -> recap -> broadcast`, plus the privacy matrix.

## Week 9 — Evidence-based release decision

Release the preservation-first default when both cohort shapes can complete the loop and at least one organizer says it could replace their current spreadsheet/memory practice.

Decision rules:

- Retain peer ratings only after a real match is archived.
- Retain Bibs Optimizer as an optional kickabout operation tool.
- Keep the chess-card surface but default-hide drills, simulations, levels, and ranks until they show a measured lift in repeat logging.
- Do not delete deferred code/models until two successful cohorts and a usage audit; flags make the shift reversible.
- If record reliability is good but sharing is weak, improve recap/moment cards before adding game mechanics.

## Delivery and rollback

Ship each milestone behind a dedicated product flag where practical. Preserve URLs and data contracts; navigation/copy, route gates, and the core-record facade can be rolled back independently. Run `pnpm run typecheck`, focused Vitest service tests, production build, and mobile end-to-end coverage at each milestone.
