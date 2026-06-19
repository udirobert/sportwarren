# SportWarren Behavioral Funnel Audit & Redesign Spec

**Date:** 2026-06-10  
**Scope:** Landing → Card → Auth → Onboarding → Dashboard → First Match → Return Visit  
**Behavioral Dynamics:** Sunk Cost, Loss Aversion, IKEA Effect, Progress Commitment, Social Proof/Scarcity, Goal Gradient, Curiosity Gap

---

## 1. Funnel Stage Map & Scoring

Each stage scored 1-5 on each of the 7 behavioral dynamics (1 = untapped, 5 = fully exploited).

### Stage 1: Landing Page (HeroSection)

| Dynamic | Before | After PR (Phase 1) | Score | Notes |
|---------|--------|-------------------|-------|-------|
| Sunk Cost | 1 | 3 | ⭐⭐⭐ | Attribute sliders now require effort. Could go deeper: formation drag-and-drop, squad roster builder. |
| Loss Aversion | 1 | 2 | ⭐⭐ | Exit-intent waitlist exists but no "you'll lose progress" messaging on landing. |
| IKEA Effect | 1 | 3 | ⭐⭐⭐ | Card customization is good. Could add: choose jersey number, badge/crest builder, pick celebration animation. |
| Progress Commitment | 1 | 2 | ⭐⭐ | No explicit "start building" commitment on landing. Greeting says "Start with a 5s setup" but no action lock-in. |
| Social Proof | 2 | 3 | ⭐⭐⭐ | Platform stats displayed (players, matches, agents). Could add: live ticker of recent signups, branch-style activity feed. |
| Goal Gradient | 1 | 2 | ⭐⭐ | No "you're almost there" on landing. Card completion meter appears only on save attempt. |
| Curiosity Gap | 2 | 3 | ⭐⭐⭐ | "See how stats become real" toggle is good. Could add: mystery attribute revealed after 3rd slider adjustment. |

**Quick-win implemented:** Attribute sliders ±15 on PlayerCardPreview, persisted to localStorage.  
**Deeper redesign:** Full card builder wizard (3 steps: Identity → Attributes → Style) with step-lock-in.

---

### Stage 2: Card Save / Auth Gate

| Dynamic | Before | After PR (Phase 1) | Score | Notes |
|---------|--------|-------------------|-------|-------|
| Sunk Cost | 1 | 4 | ⭐⭐⭐⭐ | Sliders + name + position + avatar = meaningful effort invested. |
| Loss Aversion | 1 | 4 | ⭐⭐⭐⭐ | Modal now shows amber "Your card and progression will be lost" panel with checklist of completed steps. |
| IKEA Effect | 2 | 4 | ⭐⭐⭐⭐ | User co-created their card. The card preview in the auth gate reinforces this. |
| Progress Commitment | 1 | 3 | ⭐⭐⭐ | 5-step checklist in auth gate shows what's done. Could add: "Lock in your progress" CTA copy. |
| Social Proof | 1 | 2 | ⭐⭐ | Modal doesn't show peer activity. Could add: "1,247 players claimed cards this week" below sign-in button. |
| Goal Gradient | 1 | 3 | ⭐⭐⭐ | Checklist shows X/5 steps. Near-complete when 4/5 done. |
| Curiosity Gap | 1 | 2 | ⭐⭐ | No variable reward on auth. Could add: "Claim your card to unlock a mystery coaching pack." |

**Quick-win implemented:** Loss-aversion panel in WalletConnectModal with card preview, step checklist, and urgency copy.  
**Deeper redesign:** Gamified auth gate — "Spin the wheel" for a free coaching boost, but only after account creation. Mystery reward teased pre-auth, revealed post-auth.

---

### Stage 3: Onboarding Flow (Tour → Personalize → Checklist → Complete)

| Dynamic | Before | After PR (Phase 1) | Score | Notes |
|---------|--------|-------------------|-------|-------|
| Sunk Cost | 2 | 3 | ⭐⭐⭐ | Tour + personalization + checklist = multi-step investment. |
| Loss Aversion | 1 | 2 | ⭐⭐ | If user drops off mid-personalization, no "your squad is incomplete" nudge. |
| IKEA Effect | 2 | 3 | ⭐⭐⭐ | User sets formation, picks color, names squad. Could add: custom crest/kit builder. |
| Progress Commitment | 2 | 3 | ⭐⭐⭐ | New progress bar shows 33%/66%/90%. OnboardingChecklist shows completion count. |
| Social Proof | 1 | 2 | ⭐⭐ | Match result picker with mini-pitch (social gravity) is good. Could add: "Your squad vs opponents" preview. |
| Goal Gradient | 2 | 4 | ⭐⭐⭐⭐ | "You're one step away from launching your season!" on brand step. Strong Zeigarnik. |
| Curiosity Gap | 2 | 3 | ⭐⭐⭐ | Teammate adder reveals squad size. Could add: mystery coach unlocked at 100% completion. |

**Quick-win implemented:** Persistent progress bar (33/66/90%), near-complete amber banner on brand step, milestone events.  
**Deeper redesign:** Streak-based onboarding — complete all steps within 24h for a "Founding Member" badge. Progressive reward reveal: each step unlocks a preview of the next feature.

---

### Stage 4: Dashboard Entry (NewUserDashboard)

| Dynamic | Before | After PR (Phase 1) | Score | Notes |
|---------|--------|-------------------|-------|-------|
| Sunk Cost | 2 | 2 | ⭐⭐ | Dashboard feels like a destination, not an investment surface. |
| Loss Aversion | 1 | 1 | ⭐ | No messaging about what would be lost if user churns. |
| IKEA Effect | 1 | 1 | ⭐ | Dashboard is mostly read-only for new users. |
| Progress Commitment | 2 | 3 | ⭐⭐⭐ | Step circles + checklist are visible. Progress bar in checklist. |
| Social Proof | 1 | 3 | ⭐⭐⭐ | Live counters (players, matches today, active squads) now shown. |
| Goal Gradient | 2 | 3 | ⭐⭐⭐ | Primary CTA is large and prominent. Could add: "Complete your first match to reach Level 2" with XP bar. |
| Curiosity Gap | 1 | 2 | ⭐⭐ | "Unlock more features" hints could be stronger. |

**Quick-win implemented:** Social-proof counter grid below main card.  
**Deeper redesign:** Personalized goal-gradient widget — "You're 1 match away from unlocking the Match Engine." Dynamic scarcity: "3 verification slots left today" for match logging.

---

### Stage 5: First Match Log

| Dynamic | Before | After PR (Phase 1) | Score | Notes |
|---------|--------|-------------------|-------|-------|
| Sunk Cost | 2 | 2 | ⭐⭐ | Match logging is already friction-light (quick log). Could add: pre-match squad lineup builder. |
| Loss Aversion | 1 | 1 | ⭐ | No explicit "your match history is building" messaging. |
| IKEA Effect | 1 | 1 | ⭐ | Match is logged by the user but feels transactional. |
| Progress Commitment | 2 | 2 | ⭐⭐ | Match verification creates social commitment (teammates must confirm). |
| Social Proof | 2 | 2 | ⭐⭐ | Verification invites are viral; could be stronger. |
| Goal Gradient | 2 | 3 | ⭐⭐⭐ | Post-match XP popup with animated bars is excellent (already existed). |
| Curiosity Gap | 2 | 2 | ⭐⭐ | Mystery attribute growth after verification is implied. Could be explicit. |

**Deeper redesign:** Pre-match ritual — "Build your lineup" → "Log result" → "Verify with squad" creates 3-step commitment. Post-match: "Your card is now 60% verified. 2 more matches for full verification."

---

### Stage 6: Return Visit / Retention

| Dynamic | Before | After PR (Phase 1) | Score | Notes |
|---------|--------|-------------------|-------|-------|
| Sunk Cost | 2 | 2 | ⭐⭐ | Season progress, XP, squad history create accumulated investment. |
| Loss Aversion | 1 | 2 | ⭐⭐ | Guest migration prompt now has urgency framing. Could extend to returning users: "Your streak ends in 6h." |
| IKEA Effect | 2 | 2 | ⭐⭐ | Squad is co-created with teammates. Could add: squad crest voted on by members. |
| Progress Commitment | 2 | 2 | ⭐⭐ | Season structure creates natural commitment loops. |
| Social Proof | 2 | 2 | ⭐⭐ | Telegram/WhatsApp channels push activity. Could add: "Your rival squad played 2 matches this week" push. |
| Goal Gradient | 2 | 2 | ⭐⭐ | XP to next level is shown. Could add: "Double XP weekend — 12h left" countdown. |
| Curiosity Gap | 2 | 2 | ⭐⭐ | Season moments are revealed at end. Could add: random mid-season "bonus moments." |

**Deeper redesign:** Reactivation flow for dormant users — "Your twin missed you. 3 matches were logged without your rating. Claim your Scout XP now."

---

## 2. Annotated Wireframes: Ideal Behavioral Application

### 2.1 Landing Page — "Progressive Commitment Gate"

```
┌─────────────────────────────────────────┐
│  [Hero: Your football journey, powered] │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ PLAYER CARD BUILDER   [2/3] ▓▓▓│    │ ← progress commitment (IKEA + sunk cost)
│  │                                 │    │
│  │  [Avatar]  Name: [________]    │    │
│  │            Position: [ST ▼]    │    │
│  │                                 │    │
│  │  Pace      [====●====] 72      │    │
│  │  Shooting  [====●====] 68      │    │ ← sliders = effort investment
│  │  ...                            │    │
│  │                                 │    │
│  │  [✓] Jersey #9 chosen          │    │ ← micro-commitment checkboxes
│  │  [ ] Celebration selected       │    │    (curiosity gap: unlocks after auth)
│  │                                 │    │
│  │  [💾 Save My Player Card →]     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  🔥 1,247 players built cards today     │ ← social proof
│                                         │
└─────────────────────────────────────────┘
```

**Behavioral mechanics:**
- **IKEA Effect:** User manually adjusts 6 sliders + picks avatar + jersey number → feels ownership.
- **Sunk Cost:** After 4+ adjustments, abandoning feels wasteful.
- **Curiosity Gap:** "Celebration selected" locked with 🔒 — "Create account to unlock your goal celebration."
- **Social Proof:** Live counter updates every 30s via polling.

---

### 2.2 Auth Gate — "Loss-Aversion Vault"

```
┌─────────────────────────────────────────┐
│  [✕]                                    │
│                                         │
│     ⚠️ YOUR PROGRESS WILL BE LOST       │ ← loss aversion (amber banner)
│                                         │
│  ┌──────────────┐                       │
│  │ [Avatar]     │  Marcus              │
│  │ ST · 76 OVR  │  5/7 steps complete  │ ← card preview + checklist
│  └──────────────┘                       │
│                                         │
│  ✓ Name set                             │
│  ✓ Position chosen                      │
│  ✓ Attributes customized                │
│  ✓ Avatar uploaded                      │
│  ✓ Formation picked                     │
│  ○ Jersey number                        │ ← incomplete = Zeigarnik
│  ○ Celebration                          │
│                                         │
│  🔐 Create account to lock it in        │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ [Continue with Google]          │    │
│  │ [Continue with Email]           │    │
│  │ ...                             │    │
│  └─────────────────────────────────┘    │
│                                         │
│  🏆 1,247 players claimed cards today   │ ← social proof at decision point
│                                         │
└─────────────────────────────────────────┘
```

**Behavioral mechanics:**
- **Loss Aversion:** Explicit "YOUR PROGRESS WILL BE LOST" header.
- **Goal Gradient:** 5/7 complete shows proximity to finish.
- **Social Proof:** Counter placed directly below CTA buttons (highest-attention zone).

---

### 2.3 Onboarding — "Momentum Tunnel"

```
┌─────────────────────────────────────────┐
│  Step 2 of 3 — Tactics        [66%] ▓▓▓│ ← persistent progress
│                                         │
│  ⚡ You're one step away from launching │ ← Zeigarnik framing
│     your season!                        │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  [Formation: 4-3-3 ▼]                   │
│  [Mini-pitch visualization]             │
│  [Teammate invites]                     │
│                                         │
│  [→ Continue to Brand]                  │
│                                         │
└─────────────────────────────────────────┘
```

**Behavioral mechanics:**
- **Goal Gradient:** 66% + "one step away" creates pull toward completion.
- **Social Proof:** Teammate invites leverage social gravity (squad = trust layer).
- **Curiosity Gap:** "Launch your season" is vague — what does launching mean? User must complete to find out.

---

### 2.4 Dashboard — "Social Arena"

```
┌─────────────────────────────────────────┐
│  Welcome, Marcus         [Guest Preview]│
│                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │ 1,247  │ │   42   │ │   18   │      │
│  │Players │ │Matches │ │Squads  │      │ ← social proof counters
│  │today   │ │today   │ │active  │      │
│  └────────┘ └────────┘ └────────┘      │
│                                         │
│  🏆 Your rivals played 3 matches        │ ← peer activity (scarcity/FOMO)
│     this week. Don't fall behind!       │
│                                         │
│  [Log Your First Match →]               │
│                                         │
│  Onboarding checklist:                  │
│  ✓ Card    ✓ Formation   ○ Squad   ○ Match│
│                                         │
└─────────────────────────────────────────┘
```

**Behavioral mechanics:**
- **Social Proof:** Live counters + peer activity cue.
- **Scarcity:** "Don't fall behind" implies time-limited competition.
- **Goal Gradient:** Incomplete checklist items (○) create open loops.

---

### 2.5 Guest Migration — "Rescue Mission"

```
┌─────────────────────────────────────────┐
│  ⚠️ GUEST DATA IS TEMPORARY              │
│                                         │
│  ┌────────┐ ┌────────┐                  │
│  │  1,250 │ │   3    │                  │
│  │   XP   │ │ Drafts │                  │ ← progress preview
│  │ at risk│ │ at risk│                  │
│  └────────┘ └────────┘                  │
│                                         │
│  You have 1,250 XP and 3 draft picks    │
│  at risk — claim them before your       │ ← loss aversion copy
│  guest session expires.                 │
│                                         │
│  [CLAIM NOW →]  [Discard]               │
│                                         │
└─────────────────────────────────────────┘
```

**Behavioral mechanics:**
- **Loss Aversion:** Explicit "at risk" messaging.
- **Progress Commitment:** Quantified progress makes loss tangible.

---

## 3. A/B Test Proposals

### Test 1: Auth Gate Social Proof
- **Control:** Current loss-aversion panel (card preview + checklist).
- **Variant A:** Add "1,247 players claimed cards today" below sign-in buttons.
- **Variant B:** Replace checklist with dynamic: "You're ahead of 73% of visitors — lock it in."
- **Metric:** auth_gate_converted rate.
- **Expected lift:** +8-12% (social proof at decision point is well-documented).
- **Event:** `auth_gate_converted` (already instrumented).

### Test 2: Onboarding Progress Visibility
- **Control:** Progress bar visible (33/66/90%).
- **Variant A:** Hide progress bar, show only step labels.
- **Variant B:** Show progress bar + "You're in the top 40% of completers" social proof.
- **Metric:** onboarding completion rate (onboarding_progress_milestone at 90%).
- **Expected lift:** +5-10% for Variant B (combines goal gradient + social proof).
- **Event:** `onboarding_progress_milestone` (already instrumented).

### Test 3: Landing Card Investment Depth
- **Control:** Attribute sliders only (Phase 1).
- **Variant A:** Full card builder wizard (3 steps: Identity → Attributes → Style).
- **Variant B:** Sliders + jersey number + mystery locked attribute.
- **Metric:** player_card_save_intent rate.
- **Expected lift:** +15-20% for Variant A (IKEA effect scales with effort).
- **Event:** `card_attribute_adjusted`, `card_builder_step_completed` (already instrumented).

### Test 4: Dashboard Peer Activity
- **Control:** Platform counters only.
- **Variant A:** Platform counters + "Your rival squad played X matches this week."
- **Variant B:** Counters + personalized leaderboard position.
- **Metric:** first_match_submitted rate within 24h of dashboard entry.
- **Expected lift:** +10-15% for Variant A (rivalry/FOMO is strong in sports).
- **Event:** `dashboard_social_proof_seen` + `first_match_submitted` (already instrumented).

### Test 5: Guest Migration Urgency
- **Control:** Current urgency panel (Phase 1).
- **Variant A:** Add countdown timer: "Guest session expires in 4h 12m."
- **Variant B:** Add variable reward: "Claim now to unlock a free coaching session."
- **Metric:** guest_migration_accepted rate.
- **Expected lift:** +12-18% for Variant A (time scarcity is highly effective).
- **Event:** `guest_migration_prompt_shown`, `guest_migration_accepted` (already instrumented).

---

## 4. Implementation Priority Matrix

| Priority | Change | Effort | Impact | Phase |
|----------|--------|--------|--------|-------|
| P0 | Auth gate social proof counter | Low | High | Quick-win |
| P0 | Onboarding "top completers" badge | Low | High | Quick-win |
| P1 | Landing card builder wizard | Medium | Very High | Spec |
| P1 | Dashboard rival squad activity | Medium | High | Spec |
| P1 | Guest session countdown | Low | High | Quick-win |
| P2 | Mystery locked attributes | Medium | Medium | Spec |
| P2 | Pre-match lineup builder | Medium | Medium | Spec |
| P2 | Reactivation "missed matches" flow | Medium | Medium | Spec |

---

## 5. Event Instrumentation Checklist

| Event | Location | Status |
|-------|----------|--------|
| `card_attribute_adjusted` | PlayerCardPreview.tsx | ✅ Implemented |
| `card_builder_step_completed` | PlayerCardPreview.tsx | ✅ Implemented |
| `auth_gate_shown` | WalletConnectModal.tsx | ✅ Implemented |
| `auth_gate_abandoned` | WalletConnectModal.tsx | ✅ Implemented |
| `auth_gate_converted` | WalletConnectModal.tsx | ✅ Implemented |
| `onboarding_progress_milestone` | OnboardingFlow.tsx | ✅ Implemented |
| `dashboard_social_proof_seen` | NewUserDashboard.tsx | ✅ Implemented |
| `guest_migration_prompt_shown` | GuestMigrationPrompt.tsx | ✅ Implemented |
| `guest_migration_accepted` | GuestMigrationPrompt.tsx | ✅ Implemented |

---

## 6. Recommended Next Steps

1. **Measure baseline:** Use existing PostHog funnels to establish card→auth and auth→onboarding conversion rates before running A/B tests.
2. **Run Test 1 (Auth Gate Social Proof)** — lowest effort, highest confidence lift.
3. **Run Test 5 (Guest Migration Countdown)** — single-component change, easy to implement.
4. **Spec Test 3 (Card Builder Wizard)** — biggest potential impact but requires design + multi-component work.
5. **Review in 2 weeks:** After tests have statistical significance (minimum 100 events per variant), review conversion deltas and iterate.
