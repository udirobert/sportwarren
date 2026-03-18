# Growth Funnel (Activation -> Conversion -> Retention -> Viral)

## Objective
Configure the first user journey so every early action supports one of four outcomes:

1. Activation: submit first match and see XP impact.
2. Viral Trigger: share verification link with opponent.
3. Retention: connect one messaging channel for weekly operational reminders.
4. Conversion: connect identity/wallet to persist progression.

## Source Of Truth
- Checklist state and completion logic: `src/hooks/useOnboarding.ts`
- Core growth events and stage mapping: `src/lib/analytics.ts`
- Primary execution surface: `src/app/match/page.tsx`

## Core Growth Events
Tracked via `trackCoreGrowthEvent`:

- `first_match_submitted` -> `activation`
- `opponent_verification_invite_shared` -> `viral`
- `channel_connected` -> `retention`
- `identity_connected` -> `conversion`
- `verification_queue_reviewed` -> `retention`

## UI Strategy
- Dashboard checklist is sequenced in funnel order.
- Match Center shows a "Season Kickoff Path" card with next-step CTA.
- Invite sharing is anchored to real match IDs (`/match?mode=detail&matchId=...`).
- Wallet/channel prompts appear after value moments, not as first action.

## Success Metrics
- Time to first submitted match.
- Share rate of verification invites.
- Channel connection rate after first match.
- Identity connection rate after channel connection.
- 7-day return rate with at least one verification queue review.
