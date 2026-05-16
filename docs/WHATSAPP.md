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

The WhatsApp version features high-signal utility and agent-driven interactions.

### Top-Tier Features (Phase 1+)

- **Interactive Buttons:** Quick actions for match verification, RSVP, and vouching.
- **List Messages:** Structured selection for squads, fixtures, and tactical reports.
- **Media Support:** Tactical screenshots and match highlights sent via the "Marcus" AI.
- **Marcus AI Persona:** Every message is signed by Marcus, Academy Director, ensuring a consistent tactical brand.

### The Kite-WhatsApp Bridge

SportWarren uses WhatsApp as the primary human interface for the **Kite Agentic Economy**:

- **Automated Attestation Nudges:** When a player's Digital Twin records an on-chain event (XP gain, skill boost), Marcus pushes a real-time notification to WhatsApp.
- **Agentic Commerce Alerts:** Notifications for autonomous spending events (x402) and squad wage settlements.
- **Liveness Sync:** WhatsApp replies serve as "Proof of Liveness" signals for on-chain agent verification.

## Technical Implementation

- **Production SDK:** `@kapso/whatsapp-cloud-api`
- **Webhook Endpoint:** `src/app/api/platform/whatsapp/webhook` (Handles Meta verification and Kapso payload parsing).
- **Interactive Handlers:** `handleWebhook` in `WhatsAppService` processes button clicks and list selections.
- **Provider Boundary:** Extended `MessagingProvider` interface with `sendButtons`, `sendList`, and `sendImage`.
- **Primary env vars:** `KAPSO_API_KEY`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`.

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
