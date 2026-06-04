# Phase 4: 3D Broadcast Engine & Digital Twin

**Date:** 2026-05-19 (re-scoped 2026-06-04)
**Status:** Planning
**Based on:** Codebase audit of existing simulation, twin, and broadcast infrastructure

> **Re-scope (2026-06-04):** The 3D broadcast view is reframed as a **moment-render tier**, not a free-roam destination. The player identity story is unified: avatar = skin, twin = brain, one `PlayerIdentityCard` everywhere. See `AGENTS.md` (Personalization domain) for the canonical architecture. The 3D scene becomes one render mode behind `MomentRender`; the 2D share card is the default; entitled users (premium / streak_reward / partner) get the 3D tier. The `/broadcast` route is renamed to `/moments` and becomes the player's moment gallery.

---

## Current State

### What Works
| Component | Status | Notes |
|-----------|--------|-------|
| Player Twin Service | ✅ Complete | Kite Passport, attestations, coaching effects, simulations |
| Squad Digital Twin | ✅ Complete | XP sync, ghost matches, AI narratives |
| Match Simulation Engine | ✅ Complete | Role-based AI, ball physics, 90-min tick simulation |
| PitchCanvas (2D) | ✅ Complete | Drag-and-drop, formation viz, export as PNG |
| MatchEnginePreview (2D) | ✅ Complete | Real-time animated sim, tempo control, commentary |
| /api/twin/simulate | ✅ Complete | Round-robin tournaments, prize distribution |
| Access Control | ✅ Complete | 4-tier entitlement system, feature flags |
| Analytics | ✅ Complete | Full event tracking for broadcast funnel |

### What's Placeholder
| Component | Status | Gap |
|-----------|--------|-----|
| Scene.tsx (3D) | ❌ CSS dots | Static HTML, no WebGL/Three.js |
| CameraDirector | ❌ Text labels | No actual camera paths or angles |
| BroadcastHud | ⚠️ Partial | CSS-only overlays, no broadcast graphics package |
| Real-time Pipeline | ❌ Missing | No WebSocket/SSE for live sim data |
| Replay System | ❌ Missing | No goal replay or incident review |
| Audio/Commentary | ❌ Missing | Text-only, no broadcast audio |
| Multi-match View | ❌ Missing | Single squad only |

---

## Architecture: 3D Broadcast Engine

### Phase 4A: Foundation (Weeks 1-3)
**Goal:** Replace CSS placeholder with real 3D renderer

1. **Add Three.js + React Three Fiber**
   - `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
   - Set up canvas in `Scene.tsx` with proper SSR handling

2. **3D Pitch & Environment**
   - Procedural pitch mesh (68:105 ratio, FIFA standard)
   - Basic stadium environment (stands, lighting)
   - Day/night cycle matching match conditions

3. **Player Models**
   - Low-poly humanoid figures (position-colored)
   - Squad kit colors from team data
   - Basic animations (run, pass, shoot, tackle)

4. **Ball Physics**
   - Sphere with realistic trajectory
   - Pass arcs, shot curves, bounce
   - Shadow projection on pitch

### Phase 4B: Camera & Broadcast (Weeks 4-6)
**Goal:** Professional broadcast feel

5. **Camera Director System**
   - Broadcast camera angles (wide, midfield, goal-line, tracking)
   - Auto-switching based on ball position and game state
   - Smooth transitions (pan, zoom, cut)
   - Replay camera (slow-mo, orbit)

6. **Broadcast Graphics Package**
   - Score bug (top-left overlay)
   - Player name tags (on hover/focus)
   - Substitution graphics
   - Stat overlays (possession, shots, xG)
   - Sponsor boards (virtual pitch-side)
   - Lower thirds for events (goal, card, substitution)

7. **Replay System**
   - Record simulation state snapshots
   - Goal replay with slow-motion
   - Key incident markers (tackle, save, offside)
   - Timeline scrubber

### Phase 4C: Real-time & Scale (Weeks 7-9)
**Goal:** Live broadcast experience

8. **Real-time Data Pipeline**
   - WebSocket connection from `MatchEnginePreview` to `Scene.tsx`
   - Stream simulation ticks at 30fps
   - Backpressure handling for slow clients
   - Connection recovery

9. **Audio Engine**
   - Crowd ambience (volume scales with intensity)
   - Whistle sounds (kick-off, half-time, full-time)
   - Goal celebration audio
   - Optional text-to-speech commentary

10. **Multi-match Broadcast Center**
    - Matchday view showing all concurrent sims
    - Quick-switch between matches
    - "Featured match" auto-selection (closest score, highest intensity)

---

## Dependencies

| Dependency | Purpose | Version |
|------------|---------|---------|
| `three` | 3D rendering engine | ^0.164 |
| `@react-three/fiber` | React renderer for Three.js | ^8.16 |
| `@react-three/drei` | Useful helpers for R3F | ^9.105 |
| `@react-three/postprocessing` | Post-processing effects | ^2.16 |
| `zustand` (existing) | State management for broadcast | Already installed |

---

## Integration Points

```
MatchEnginePreview (2D sim) ──WebSocket──▶ Scene.tsx (3D renderer)
       │                                          │
       ▼                                          ▼
BroadcastHud (overlays) ◀── CameraDirector ──▶ ReplaySystem
       │
       ▼
Analytics (engagement tracking)
```

### Data Flow
1. `MatchEnginePreview` runs simulation tick at 60fps
2. State serialized to `MatchSimulationSnapshot`
3. WebSocket pushes snapshot to broadcast client
4. `Scene.tsx` interpolates between frames for smooth 3D animation
5. `CameraDirector` selects optimal camera angle
6. `BroadcastHud` renders overlays from snapshot data

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Frame rate | 60fps | With automatic fallback to 30fps |
| Initial load | <3s | Lazy-load 3D assets |
| Memory | <200MB | GC-friendly asset disposal |
| Mobile | Graceful degradation | 2D fallback on low-power devices |
| Bundle size | <500KB additional | Code-split 3D dependencies |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| 3D bundle too large | Code-split, lazy-load, tree-shake |
| Mobile performance | Auto-detect GPU, fallback to 2D |
| Browser compatibility | WebGL 2.0 requirement, graceful degradation |
| Development complexity | Start with basic shapes, iterate to models |
| Asset pipeline | Procedural generation first, import models later |

---

## Success Criteria

- [ ] 3D pitch renders with correct proportions
- [ ] Player models move in sync with simulation
- [ ] Ball physics match 2D simulation data
- [ ] Camera auto-switches based on game state
- [ ] Broadcast overlays display real-time stats
- [ ] Goal replay with slow-motion works
- [ ] WebSocket connection stable at 30fps
- [ ] Mobile fallback to 2D when GPU insufficient
- [ ] Feature flag `DIGITAL_TWIN_3D` enables full experience
- [ ] Analytics track broadcast engagement funnel
