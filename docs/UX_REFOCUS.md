# UX Refocus: From Process to Experience

**Date:** 2026-03-27  
**Status:** In Progress  
**Based on:** User feedback

---

## Problem Statement

Current app focal point misunderstands what users will get excited about. We focus on logging matches (process) rather than the engaging interactive visuals, tactics, strategies and personalities (outcome).

The match preview and ability to personalise has been identified as a powerful primitive that should be more front and centre.

---

## Current State Analysis (Pre-changes)

### What's Prominent Now
- Dashboard leads with "Submit Match" / "Review" buttons
- Match page hero is "Match Operations"
- Onboarding: "log a match → share link → save progress"

### What's Under-utilized
- MatchEnginePreview exists but buried as widget
- TacticsBoard hidden in squad pages
- No "Next Match" or "Match Preview" experience

---

## Workstream A: Structural Changes ✅ COMPLETE

**Owner:** AI  
**Focus:** Reordering, priority changes, existing component repositioning  
**Effort:** Low-Medium

### Tasks Completed

#### 1. Reorder dashboard priority ✅
- Moved `match-engine` widget from priority 160 → 250
- Now shows above stats cards on dashboard
- **Files:** `src/components/adaptive/AdaptiveDashboard.tsx`

#### 2. Create "Next Match" hero card on dashboard ✅
- Elevated `upcoming-fixtures` from priority 80 → 240
- Added "Customize →" link to tactics page
- Styled with emerald border/background
- **Files:** `src/components/adaptive/AdaptiveDashboard.tsx`

#### 3. Add "Customize Lineup" CTA to dashboard ✅
- Added "Customize Lineup" button to Match Center section
- Now displays: Customize Lineup | Review | Log Result
- **Files:** `src/components/adaptive/AdaptiveDashboard.tsx`

#### 4. Move "Submit Match" from primary nav ✅
- Renamed "Submit Match" → "Log Result" (post-match action)
- Changed hero from "Match Operations" → "Match Day / Prepare for Match"
- Added "Set Tactics" button alongside primary actions
- Updated entry states to lead with tactics preview
- **Files:** 
  - `src/lib/dashboard/entry-state.ts`
  - `src/components/adaptive/AdaptiveDashboard.tsx`
  - `src/app/(app)/match/page.tsx`

### Summary of Changes
- Added `preview_match` intent to entry state system
- All onboarding flows now lead with "Set your formation" / "Preview your squad"
- Match page now emphasizes preparation over operations
- Updated Season Kickoff Path to: tactics → play → verify → save

---

## Workstream B: New Experience Creation 🔄 IN PROGRESS

**Owner:** User  
**Focus:** New pages, components, creative features  
**Effort:** Medium-High

### Tasks

#### 5. Build dedicated `/match-preview/[id]` page

New page at `src/app/(app)/match/preview/page.tsx`:
- Upcoming fixture with formation visualization
- Opponent scouting data
- Tactical preview with presets
- Shareable preview card
- Use existing `MatchEnginePreview` and `PitchCanvas` components

**Files to create:**
- `src/app/(app)/match/preview/page.tsx`
- `src/components/match/MatchPreviewCard.tsx`

#### 6. Add personalization entry point
- "Brand Your Squad" quick action (colors, crest, nickname)
- Surface early in onboarding
- Formation selection as first action

**Files:**
- `src/lib/journey/content.ts` - Update journey stages
- `src/components/onboarding/QuickPersonalization.tsx` - Add brand kit

#### 7. Match hype UI
- Pre-match countdown
- Rivalry indicators
- "Scouting report" narrative

#### 8. AI Staff pre-match integration
- Pre-match talking points
- Example: "Coach says we should play 4-3-3 against their weak left flank"

---

## Implementation Priority

| # | Task | Workstream | Status |
|---|------|-----------|--------|
| 1 | Reorder dashboard priority | A | ✅ Done |
| 2 | Create Next Match hero card | A | ✅ Done |
| 3 | Add Customize Lineup CTA | A | ✅ Done |
| 4 | Move Submit Match to post-match | A | ✅ Done |
| 5 | Build /match-preview/[id] page | B | 🔄 In Progress |
| 6 | Add personalization entry point | B | 🔄 In Progress |
| 7 | Match hype UI | B | Pending |
| 8 | AI Staff pre-match integration | B | Pending |

---

## Key Principle

Users should first see **"Who are we playing?"** and **"How do we set up?"** before they see **"Log your result."**

---

## Success Metrics

- Dashboard bounce rate reduction
- Time spent on match preview vs match operations
- Personalization completion rate during onboarding
- Daily active users on match days