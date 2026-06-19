# Post-submission roadmap

Two integrations that compound the work shipped during the
makeathon. Deliberately deferred — judging happens on what exists,
and these need real engineering scope.

## 1. Moment share URLs

Today every moment generates a PNG and lands in the in-app gallery,
WhatsApp delivery, and Telegram (per-kind opt-in). The PNG is the
artifact; nothing about it is shareable beyond the channel that
delivered it. Adding a public share page turns each moment into an
inbound funnel — captains and players who screenshot today would
share a link tomorrow.

### What to build

- `src/app/m/[momentId]/page.tsx` — public route, no auth, OG-image
  meta tags pointing at the moment's stored PNG, copy block built
  from the moment's `label` + `detail`, soft CTA into the squad's
  public page.
- `src/app/m/[momentId]/opengraph-image.tsx` — Next.js OG handler
  that 302s to the stored PNG (or rebuilds from cache if missing).
- Tweet / WhatsApp / Telegram share buttons on the page — `intent`
  URLs, no SDKs, no tracking pixels.
- New column on `Moment`: `shareSlug` (random 8-char base36) so the
  public URL isn't the raw DB id. Add an index, generate on insert.
- Update `SquadMomentsGallery` to surface a "Share" affordance per
  moment row, falling back to the existing copy-link if Web Share
  API isn't available.

### Out of scope

- Per-moment analytics (impressions, click-through). Add later if
  the feature gets traction.
- Authenticated edit / delete of share pages — moments are
  immutable in practice.
- Custom OG variants per recipient. The card PNG is the
  share-image; one canonical render per moment.

### Effort

About a day, including the migration and tests. Most of the work
is the share page; the OG path is a thin proxy.

---

## 2. Squad Recruitment auto-generation

The Marketing Toolkit ships a Squad Recruitment template (square +
story formats). Currently it's a Figma file the captain has to open,
customize, export, and post. Auto-generating it bakes the captain's
squad name + member count + invite link into the artifact and ships
it inside the onboarding flow — directly compounding the captain
wedge described in `VISION.md`.

### Why this is the right Marketing Toolkit template to integrate

- **Triggered by a real event.** Squad creation is a natural moment
  to surface a recruitment artifact. Other templates (Squad of the
  Week, Captain Spotlight) need weekly stats aggregation +
  scheduling infrastructure that doesn't exist yet.
- **Funnel-compounding.** Captain creates squad → ships recruitment
  post → 10–15 players join. This is the wedge motion from VISION.md
  expressed as a UI affordance.
- **Reuses the satori pipeline.** No new infrastructure — same
  renderer pattern as moment cards.

### What to build

- `src/components/moments/cards/SquadRecruitmentCard.tsx` (+ social
  + story siblings) — satori component matching the Figma template.
  Inputs: squad name, captain handle, current member count, invite
  URL/QR.
- `src/server/services/personalization/recruitment-render.ts` —
  mirrors `moment-render-v2.ts` minus the cron sweep; renders
  on-demand when the captain hits the share button.
- `src/app/api/squads/[squadId]/recruitment-post/route.ts` — returns
  the PNG (cached on storage adapter using
  `kind: 'recruitment-post'`).
- Onboarding flow: post-squad-creation success state in
  `OnboardingFlow.tsx` and `SquadImportWizard.tsx` (after
  `commitSquadImport`) gets a "Share recruitment post" button
  alongside the existing invite-link copy.

### Out of scope

- Captain Spotlight, Squad of the Week, Landing Hero, Feature
  Explainer auto-generation. These stay as Figma templates until
  there's product signal (or stats infrastructure) that justifies
  the engineering.
- A standalone "Make me a recruitment post" route for existing
  squads. The bigger win is the onboarding flow integration; the
  standalone route is trivial to add later if needed.

### Effort

Half a day for the satori component, half a day for the API +
storage + onboarding integration. Less if you reuse the existing
moment-render scaffolding aggressively.

---

## Order

If both are picked up in the same week, ship in this order:

1. **Moment share URLs** first — smaller scope, immediately
   accretive to *every existing moment in production*, and the OG
   path is the foundation for any future shareable artifact.
2. **Squad Recruitment** second — depends on having confidence in
   the share-route pattern (URL shape, OG handler, cache behavior).

## Explicit non-goals

- Adding analytics, A/B tests, or growth instrumentation around
  these surfaces before they have organic usage.
- Rebuilding the Figma Marketing Toolkit templates as code
  wholesale. Most of them are correctly *captain-self-service*
  artifacts — only Squad Recruitment has the event-trigger profile
  that justifies dynamic generation.
