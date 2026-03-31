# Telegram Command Refactoring Implementation Plan

## Architectural Decision: Hybrid + Grouped Commands

**Recommendation:** Keep both legacy and modular commands, with hierarchical grouping for better UX.

### Why Hybrid is Better Long-Term

| Factor | Full Legacy | Full Modular | Hybrid (Recommended) |
|--------|-------------|--------------|----------------------|
| **Developer Onboarding** | One place, but 2500+ line monolith | Clean but loses sophisticated workflows | Clear boundaries, incremental learning |
| **Sophisticated UX** | Preserved (drafts, confirmations) | Would need reimplementation | Preserved without duplication |
| **Testing** | Hard to test single command | Easy to test individual commands | Both paths available |
| **Adding New Commands** | Risk of breaking existing | Clean pattern | Clear: simple = modular, complex = legacy |
| **Bug Debugging** | One huge file | Isolated | Clear ownership |
| **Code Review** | Overwhelming | Focusable | Scoped reviews |

### Grouped Command Structure (FINAL)

Telegram's hierarchical commands provide better UX. Users see parent commands in menu, children appear when typing.

| Group | Commands | Handler Location |
|-------|----------|------------------|
| **Primary** | `/start`, `/help` | Legacy + Modular |
| **Squad** | `/squad log`, `/squad stats`, `/squad available`, `/squad roster`, `/squad fixtures` | Legacy (routed) |
| **Account** | `/account app`, `/account profile`, `/account myteams`, `/account link`, `/account unlink` | Legacy (routed) |
| **AI** | `/ask` | Legacy |
| **Treasury** | `/treasury view`, `/treasury fee` | Legacy (routed) |

### Command Classification (Legacy vs Modular)

| Command | Complexity | Location | Rationale |
|---------|------------|----------|-----------|
| `/squad log` | **High** - draft flow, confirm/cancel | Legacy | Sophisticated workflow |
| `/treasury fee` | **High** - callbacks | Legacy | Complex |
| `/stats` | **Low** | Modular (commands/) | Straightforward |
| `/available` | **Low** | Modular (commands/) | Simple CRUD |
| `/roster` | **Low** | Modular (commands/) | Simple query |
| `/help` | **Low** | Modular (commands/) | Simple display |
| `/account link` | **Medium** | Legacy (group handler) | Now under /account |
| `/account unlink` | **Medium** | Legacy (group handler) | Now under /account |
| `/fixtures` | **Low** | Legacy | Keep for now |
| `/myteams` | **Low** | Legacy | Keep for now |
| `/app`, `/profile` | **Low** | Legacy | Simple redirects |

---

## Current State (FINAL)

```
telegram.ts (grouped handlers)
    |
    +-- /squad group handler --> routes to legacy handlers
    +-- /account group handler --> routes to legacy + modular
    +-- /treasury group handler --> routes to legacy
    +-- Legacy flat: /start, /app, /profile, /fixtures, /myteams, /ask, /log, /fee
    |
    +-- registerCommands(this.bot) --> commands/registry.ts
                                              |
                                              +-- Modular: /stats, /available, /roster, /help
```

---

## Parallel Workflow: What We've Done

### Buffy (AI) Work - COMPLETED

| Task | Status | Notes |
|------|--------|-------|
| Fix stats.ts typo "NO_SQUADAD" | DONE | Changed to "NO_SQUAD" |
| Fix availability.ts property name | DONE | `available` -> `isAvailable` |
| Fix roster.ts argument error | DONE | Changed isSquadLeader usage |
| Fix log.ts runtime bug | DONE | Added opponent squad lookup by name |
| Fix registry.ts TypeScript errors | DONE | Added proper imports, typed parameters |
| Add commands to registry | DONE | /stats, /available, /roster, /help |
| Wire registerCommands() to TelegramService | DONE | Added in constructor |
| Add TelegramLinkCode model to schema | DONE | Added to prisma/schema.prisma |
| TypeScript verification | DONE | All command files compile |
| **Grouped Commands** | DONE | Added /squad, /account, /treasury handlers |
| **BotFather Menu Update** | DONE | 15 commands in hierarchical structure |
| **Help Text Update** | DONE | buildHelpText() shows grouped structure |
| **Dead Code Cleanup** | DONE | Deleted link.ts, unlink.ts files |
| **Test Fixes** | DONE | Updated telegram-commands.test.ts |

---

## Parallel Workflow: Remaining Work

### ALL COMPLETED ✅

All planned work has been completed:
- ✅ Hybrid architecture (legacy + modular)
- ✅ Grouped command structure (/squad, /account, /treasury)
- ✅ BotFather menu updated with 15 hierarchical commands
- ✅ Help text shows grouped structure
- ✅ Dead code cleaned up (removed link.ts, unlink.ts)
- ✅ Tests fixed and passing
- ✅ Prisma schema updated with TelegramLinkCode

---

## Integration Testing Checklist ✅

### Completed
- [x] Prisma db push - TelegramLinkCode table created
- [x] TELEGRAM_BOT_TOKEN set
- [x] Server starts without errors
- [x] TypeScript compiles cleanly
- [x] Tests pass (9/9)

### Verified Commands

| Command | Handler | Status |
|---------|---------|--------|
| `/help` | Modular | ✅ Shows grouped structure |
| `/squad` | Legacy (group) | ✅ Shows help text |
| `/account` | Legacy (group) | ✅ Shows help text |
| `/treasury` | Legacy (group) | ✅ Shows help text |
| `/stats` | Modular | ✅ Available via registry |
| `/available` | Modular | ✅ Available via registry |
| `/roster` | Modular | ✅ Available via registry |

---

## Success Criteria ✅

1. ✅ **TypeScript clean** - `npx tsc --noEmit` passes
2. ✅ **No duplicate handlers** - Legacy + modular cleanly separated
3. ✅ **Grouped commands** - /squad, /account, /treasury groups work
4. ✅ **Core commands work** - /stats, /available, /roster via modular
5. ✅ **Clear pattern** - Future developers know where to add commands

---

## Future Work (Post-Integration)

1. **Add integration tests** - Test each modular command end-to-end
2. **Migrate /fixtures, /myteams** - Simple commands to modular format
3. **Multi-squad support** - Add squad selection to /stats, /available
4. **Deprecation path** - Once modular versions are stable, deprecate legacy

---

**See Also:** [TELEGRAM.md](./TELEGRAM.md) | [CORE.md](./CORE.md)