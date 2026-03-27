# UX Refocus: From Process to Experience

**Date:** 2026-03-28  
**Status:** In Progress (Phase 2)  
**Based on:** Holistic Review & Critique

---

## Problem Statement

Despite previous efforts, critical entry points (Landing Page, Onboarding, Match Center) still suffered from a "Process-First" bias, leading with "Log Your Match" instead of the immersive "Match Preview" and "Tactical Simulation" experience.

---

## Holistic Review Findings (March 28, 2026)

### 1. Landing Page (HeroSection.tsx)
- **Previous state:** "Log Your Match" was the first pillar of "How It Works". The primary value proposition focused on "Log result -> Watch stats grow".
- **Action taken:** Refactored to lead with "Tactical Simulation" and "Match Preview". Updated copy to focus on "Simulate Tactics -> Watch Stats Grow -> Confirm Results".

### 2. Onboarding & Journey (journey/content.ts)
- **Previous state:** Journey prompts and subtitles focused on "Log one result to make the account feel real".
- **Action taken:** Shifted language to tactical preparation: "Set up your tactical DNA", "Simulate your squad tactics". Updated next actions to point to `/match/preview` instead of match capture.

### 3. Match Center (match/page.tsx)
- **Previous state:** Defaulted to "Submit Result" or "Review" mode. Tactical preview was secondary.
- **Action taken:** Added `preview` as a primary ViewMode and made it the default for new/returning users without pending verifications. Integrated `MatchEnginePreview` directly into the Match Center landing experience.

---

## Workstream C: Holistic Alignment ✅ COMPLETE

**Owner:** Junie (AI)  
**Focus:** Eliminating process-first bias across all user touchpoints  
**Effort:** Medium

### Tasks Completed

#### 1. Landing Page Refactor ✅
- Swapped "Real World Match" vs "SportWarren Layer" visual for "Tactical Preview" vs "Real World Impact".
- Reordered "How It Works" pillars: Simulate Tactics (1st) -> Watch Stats Grow (2nd) -> Confirm Results (3rd).
- **Files:** `src/components/common/HeroSection.tsx`

#### 2. Onboarding Content Alignment ✅
- Updated `getJourneyNavigationSubtitle` to lead with tactical simulation.
- Changed `getJourneyNextAction` for `account_ready` and `season_kickoff` to point to Match Preview.
- **Files:** `src/lib/journey/content.ts`

#### 3. Match Center Default View ✅
- Introduced `preview` ViewMode in Match Page.
- Set `preview` as the default state (Priority: Review -> History -> Preview -> Capture).
- Added "Tactical Hub" and "Scouting Report" teaser cards to the Match Center.
- **Files:** `src/app/(app)/match/page.tsx`

---

## Key Principle (Updated)

**"Tactics before Tasks"**: Every user flow should answer "How do we win?" before asking "What happened?".

---

## Next Steps

1. **Verify Build**: Ensure no regressions in the unified match route.
2. **Monitor Engagement**: Track usage of the simulation engine vs. match capture.
3. **Personalization Depth**: Continue Workstream B tasks (Brand Your Squad, AI Staff integration).
