# SportWarren WhatsApp Integration

**Operational squad workflows on WhatsApp, shipped with Kapso and kept portable by adapter boundaries**

## Overview

WhatsApp complements the Telegram surface by serving the broadest, least technical squad members with narrow, high-frequency operational flows. SportWarren will use **Kapso** to ship the production WhatsApp transport quickly, while keeping all product logic in SportWarren-owned workflows so the channel layer remains replaceable.

This plan is intentionally dual-track:

1. **Production lane:** Kapso powers the real WhatsApp adapter and webhook handling.
2. **Exploration lane:** Photon/Spectrum is evaluated in a narrow pilot so we can pursue ecosystem support without forcing a platform rewrite.
3. **Permanent core:** SportWarren owns domain logic, identity, analytics, squad state, and workflow orchestration.

## Strategic Decision

### Why Kapso is the production choice

- `@kapso/whatsapp-cloud-api` mirrors Meta's WhatsApp Cloud API closely enough to keep migration risk low.
- Kapso removes early infrastructure drag around webhook normalization, templates, media, and message lifecycle handling.
- It is a better fit for immediate WhatsApp execution than building the transport ourselves at this stage.

### Why Spectrum remains in scope

- Photon support can still be strategically valuable for cash, credits, amplification, and network access.
- Spectrum should be treated as a **pilot lane**, not the dependency that production messaging relies on.
- The right use of Spectrum is proving a cross-channel agent slice, not rebuilding the product around early-preview abstractions.

## Architecture Principle

WhatsApp is not the product core. Kapso is not the product core. Spectrum is not the product core.

SportWarren keeps the following layers separate:

- **Domain Core:** squads, matches, attendance, AI staff, identity, permissions, analytics.
- **Workflow Layer:** `sendReminder`, `requestAvailability`, `routeInboundIntent`, `sendRecap`, `sendAnnouncement`.
- **Provider Layer:** Telegram provider, Kapso-backed WhatsApp provider, and a future Spectrum pilot provider.

The rest of the app should call SportWarren-owned interfaces, not vendor SDKs directly.

## Channel Roles

### Telegram

- Primary power-user surface
- Community coordination
- Richer bot-native behavior
- Mini App and TON-linked flows

### WhatsApp

- Mainstream squad distribution
- Operational nudges
- Attendance and availability checks
- Match reminders and lightweight confirmations
- Post-match recap delivery

### Spectrum pilot

- Support/funding eligibility lane
- Cross-channel agent experiment
- Demoable portability surface
- Not a prerequisite for WhatsApp beta

## WhatsApp Scope

The first WhatsApp version should stay narrow and utility-heavy.

### Phase 1 workflows

- Match reminders
- Availability confirmation
- Attendance check-ins
- Post-match recap
- Squad announcements

### Example prototype: Match Availability

- **Trigger:** Captain schedules a match.
- **Action:** WhatsApp template asks each player to confirm availability.
- **Response:** Quick reply payload maps back into SportWarren workflow handlers.
- **Result:** Match roster and attendance state update in SportWarren systems, not in Kapso as a source of truth.

## Identity and Data Ownership

- WhatsApp identities should be mapped into SportWarren platform records through a dedicated adapter layer.
- Kapso IDs, contacts, or conversations must not become the canonical user model.
- When available, Business-Scoped User IDs can strengthen identity mapping beyond raw phone numbers.
- SportWarren should persist its own canonical workflow and user state even when message history is queried through Kapso.

## Technical Notes

- **Production SDK:** `@kapso/whatsapp-cloud-api`
- **Webhook normalization:** `normalizeWebhook`
- **Kapso proxy base URL:** `https://app.kapso.ai/api/meta/`
- **Primary env vars:** `KAPSO_API_KEY`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`

## Delivery Plan

### Immediate implementation

1. Introduce a messaging provider boundary above Telegram and WhatsApp transports.
2. Wrap Kapso in a dedicated WhatsApp provider implementation.
3. Keep webhook parsing and provider-specific payload translation inside the WhatsApp adapter.
4. Route availability/reminder flows through shared SportWarren workflow methods.

### Parallel exploration

1. Create a narrow Spectrum pilot for one real messaging-native assistant flow.
2. Reuse the same backend workflow methods used by Telegram and WhatsApp.
3. Use that pilot for Photon outreach, demos, and support applications.

## Non-Goals

- Rebuilding SportWarren around Spectrum primitives
- Making Kapso the system of record
- Porting the full Telegram feature set into WhatsApp on day one
- Building WhatsApp transport infrastructure from scratch before beta validation
