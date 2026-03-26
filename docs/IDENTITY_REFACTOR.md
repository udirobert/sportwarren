# Identity & Multi-Squad Refactor

**Status:** Complete (Phases 1–3)
**Last Updated:** March 26, 2026
**Scope:** Support multi-squad users, per-squad context, and discovery
**Constraint:** Pre-launch — no data migration needed

---

## Summary

| Phase | Status | Description |
|-------|--------|-------------|
| 1. Identity Schema | ✅ Done | `PlatformIdentity` model + identity-based session resolution |
| 2. Squad Context | ✅ Done | `SquadPlayerContext` model + per-squad stats |
| 3. Squad Switcher | ✅ Done | `ActiveSquadContext` + TRPC mutation + server persistence |
| 4. Discovery | ❌ Post-launch | OpenGameSlot schema + discovery routes |

---

## Schema Changes

### PlatformIdentity
```prisma
model PlatformIdentity {
  id                    String       @id @default(cuid())
  userId                String
  platform              PlatformType
  platformUserId        String       // Telegram user ID (stable)
  chatId                String?      // Last group chat context
  username              String?
  miniAppToken          String?      @unique
  miniAppTokenExpiresAt DateTime?
  activeSquadId         String?
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt

  user           User         @relation(fields: [userId], references: [id])
  @@unique([platform, platformUserId])
}
```

### SquadPlayerContext
```prisma
model SquadPlayerContext {
  id            String         @id @default(cuid())
  userId        String
  squadId       String
  position      PlayerPosition?
  role          String         @default("player")
  squadXP       Int            @default(0)
  sharpness     Int            @default(50)
  form          String         @default("neutral")
  matchesPlayed Int            @default(0)
  goals         Int            @default(0)
  assists       Int            @default(0)
  joinedAt      DateTime       @default(now())

  user          User           @relation(fields: [userId], references: [id])
  squad         Squad          @relation(fields: [squadId], references: [id], onDelete: Cascade)
  @@unique([userId, squadId])
}
```

### SquadGroup (replaced PlatformConnection)
```prisma
model SquadGroup {
  id             String       @id @default(cuid())
  platform       String
  squadId        String
  chatId         String?      @unique
  platformUserId String?
  username       String?
  linkToken      String?      @unique
  linkedAt       DateTime?
  createdAt      DateTime     @default(now())

  squad          Squad        @relation(fields: [squadId], references: [id], onDelete: Cascade)
  @@unique([platform, chatId])
}
```

---

## Session Resolution Flow

```
Mini App token → findPlatformIdentityByMiniAppToken → identity
  → activeSquadId from identity OR first membership
  → return { ...identity, squadId, squad }

Bot DM command → findPlatformIdentityByUserId → identity
  → fall back to findPlatformIdentityByChatId (group context)

Bot group command → findSquadGroupByChatId → squadGroup.squadId
  → findPlatformIdentityByChatId → identity (for userId resolution)
```

---

## Files Changed

### Schema & Core
| File | Change |
|------|--------|
| `prisma/schema.prisma` | Deleted `PlatformConnection`, added `PlatformIdentity`, `SquadPlayerContext`, `SquadGroup` |

### Server Services
| File | Change |
|------|--------|
| `platform-connections.ts` | Full rewrite: `SquadGroup` functions (`getSquadGroupsForSquad`, `createTelegramLinkSession`, `connectTelegramChatByToken`, `disconnectSquadGroup`, `findSquadGroupByChatId`) + `PlatformIdentity` functions (`findPlatformIdentityByUserId`, `findPlatformIdentityByChatId`, `findPlatformIdentityByMiniAppToken`, `createIdentityMiniAppSession`, `updateActiveSquadContext`). Exported URL helpers. |
| `telegram.ts` | Migrated all handlers from `PlatformConnection` to `SquadGroup` + `PlatformIdentity`. `requireLinkedChat` → `findSquadGroupByChatId`. `requireLinkedCaptainActor` resolves userId via `PlatformIdentity`. `handleMatchLog` resolves submitter through identity. `handleMiniAppRequest` uses identity-based session. |
| `telegram-mini-app.ts` | Refactored `requireTelegramMiniAppConnection()` to use identity-based session |
| `ton-settlement-worker.ts` | `platformConnection.findMany` → `squadGroup.findMany` for notification routing |

### API Routes
| File | Change |
|------|--------|
| `api/telegram/mini-app/ask/route.ts` | `findTelegramMiniAppConnectionByToken` → `findPlatformIdentityByMiniAppToken`, resolves active squad from identity |

### TRPC Routers
| File | Change |
|------|--------|
| `communication.ts` | `getPlatformConnectionsForSquad` → `getSquadGroupsForSquad`, `disconnectPlatformConnection` → `disconnectSquadGroup` |
| `auth.ts` | Added `setActiveSquad` mutation for server-side persistence |

### Client
| File | Change |
|------|--------|
| `types/index.ts` | Added `SquadGroupConnection` (server shape), kept `PlatformConnection` as UI view model |
| `usePlatformConnections.ts` | Added `toPlatformConnections()` adapter: `SquadGroupConnections` → `PlatformConnections`. Components unchanged. |
| `ActiveSquadContext.tsx` | New context with `useActiveSquad()` hook |
| `AdaptiveDashboard.tsx` | Consumes `useActiveSquad()` for squad-scoped UI |
| `SmartNavigation.tsx` | Consumes `useActiveSquad()` for navigation state |
| `useJourneyState.ts` | Consumes `useActiveSquad()` for onboarding flow |

### Tests
| File | Change |
|------|--------|
| `telegram-integration.test.ts` | Updated `buildTelegramMiniAppUrl` call signature |

---

## Architecture Decisions

**Adapter pattern for client:** The hook (`usePlatformConnections`) transforms `SquadGroupConnections` (server shape) into `PlatformConnections` (UI view model). Components like `CommunicationHub`, `SmartNavigation`, and `MatchVerification` consume the same interface unchanged — zero component-level diffs needed for this migration.

**Two-layer resolution in Telegram:** Group commands resolve squad via `SquadGroup` (chatId → squadId), then resolve user via `PlatformIdentity` (chatId → userId). DM commands resolve directly via `PlatformIdentity` (platformUserId → identity). This cleanly separates "which squad" from "who is acting".

---

## Remaining Work

**Post-launch (Phase 4):**
- [ ] OpenGameSlot schema + discovery routes
- [ ] Nearby squads via Pitch lat/lng

---

## What We're NOT Doing

| Skip | Why |
|------|-----|
| `PlatformConnection` table | Deleted — replaced by `SquadGroup` + `PlatformIdentity` |
| Dual-read migration | No existing data to migrate |
| Backward compatibility | No existing users |
| Per-squad attributes | Global attributes + squad context covers 80% at 20% cost |
| ELO matching | Needs match history first |
