"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { TelegramMiniAppProviders } from "@/components/telegram/TelegramMiniAppProviders";
import { TelegramMiniAppShell } from "@/components/telegram/TelegramMiniAppShell";
import { TelegramSquadDashboard } from "@/components/telegram/TelegramSquadDashboard";
import { TelegramMatchCenter } from "@/components/telegram/TelegramMatchCenter";
import { TelegramPlayerProfile } from "@/components/telegram/TelegramPlayerProfile";
import { TelegramTreasuryTab } from "@/components/telegram/TelegramTreasuryTab";
import { TelegramAIStaffChat } from "@/components/telegram/TelegramAIStaffChat";
import { TelegramMediaTab } from "@/components/telegram/TelegramMediaTab";
import type { MiniAppContext } from "@/components/telegram/TelegramMiniAppShell";

function MiniAppLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09111f]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        <p className="text-sm text-slate-400">Loading SportWarren...</p>
      </div>
    </div>
  );
}

function MiniAppContent() {
  return (
    <TelegramMiniAppShell
      renderSquad={(context: MiniAppContext, refresh: () => void, navigate) => (
        <TelegramSquadDashboard
          context={context}
          onRefresh={refresh}
          onNavigate={(tab) => navigate(tab)}
        />
      )}
      renderMatch={(context: MiniAppContext, refresh: () => void) => (
        <TelegramMatchCenter context={context} onRefresh={refresh} />
      )}
      renderProfile={(context: MiniAppContext, refresh: () => void) => (
        <TelegramPlayerProfile context={context} onRefresh={refresh} />
      )}
      renderTreasury={(context: MiniAppContext, refresh: () => void) => (
        <TelegramTreasuryTab context={context} onRefresh={refresh} />
      )}
      renderMedia={(context: MiniAppContext, refresh: () => void) => (
        <TelegramMediaTab context={context} onRefresh={refresh} />
      )}
      renderAI={(context: MiniAppContext, refresh: () => void) => (
        <TelegramAIStaffChat context={context} onRefresh={refresh} />
      )}
    />
  );
}

export function TelegramMiniAppPageClient() {
  return (
    <TelegramMiniAppProviders>
      <Suspense fallback={<MiniAppLoading />}>
        <MiniAppContent />
      </Suspense>
    </TelegramMiniAppProviders>
  );
}

export default TelegramMiniAppPageClient;
