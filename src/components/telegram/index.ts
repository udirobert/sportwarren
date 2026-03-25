/**
 * Telegram Mini App Components
 *
 * Championship Manager in Telegram, powered by TON
 */

// Main shell and providers
export { TelegramMiniAppShell } from "./TelegramMiniAppShell";
export { TelegramMiniAppProviders } from "./TelegramMiniAppProviders";

// Tab components
export { TelegramSquadDashboard } from "./TelegramSquadDashboard";
export { TelegramMatchCenter } from "./TelegramMatchCenter";
export { TelegramPlayerProfile } from "./TelegramPlayerProfile";
export { TelegramTreasuryTab } from "./TelegramTreasuryTab";
export { TelegramAIStaffChat } from "./TelegramAIStaffChat";

// Legacy treasury component (standalone version)
export { TelegramTreasuryMiniApp } from "./TelegramTreasuryMiniApp";

// Types
export type {
  MiniAppContext,
  PlayerContext,
  SquadContext,
  SquadMember,
  PendingMatch,
  RecentMatch,
  TreasuryContext,
  TreasuryTransaction,
  TonContext,
  TabId,
} from "./TelegramMiniAppShell";
