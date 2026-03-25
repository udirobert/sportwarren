import { Suspense } from "react";
import { TelegramMiniAppProviders } from "@/components/telegram/TelegramMiniAppProviders";
import { TelegramMiniAppShell } from "@/components/telegram/TelegramMiniAppShell";
import { TelegramSquadDashboard } from "@/components/telegram/TelegramSquadDashboard";
import { TelegramMatchCenter } from "@/components/telegram/TelegramMatchCenter";
import { TelegramPlayerProfile } from "@/components/telegram/TelegramPlayerProfile";
import { TelegramTreasuryTab } from "@/components/telegram/TelegramTreasuryTab";
import { TelegramAIStaffChat } from "@/components/telegram/TelegramAIStaffChat";
import type {
  MiniAppContext,
} from "@/components/telegram/TelegramMiniAppShell";
import { Loader2 } from "lucide-react";

// Loading fallback for Suspense
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

// Main Mini App content with tab rendering
function MiniAppContent() {
  // Tab navigation state handler (passed to Squad Dashboard for navigation)
  // The shell manages this internally, but we need to provide render functions

  return (
    <TelegramMiniAppShell
      renderSquad={(context: MiniAppContext, refresh: () => void) => (
        <TelegramSquadDashboard
          context={context}
          onRefresh={refresh}
          onNavigate={(tab) => {
            // Navigation is handled by updating URL params
            // The shell will pick this up on next render
            const url = new URL(window.location.href);
            url.searchParams.set("tab", tab);
            window.history.replaceState({}, "", url.toString());
            // Force re-render by triggering a state change
            window.dispatchEvent(
              new CustomEvent("miniapp:navigate", { detail: { tab } }),
            );
          }}
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
      renderAI={(context: MiniAppContext, refresh: () => void) => (
        <TelegramAIStaffChat context={context} onRefresh={refresh} />
      )}
    />
  );
}

// Page component with providers
export default function TelegramMiniAppPage() {
  return (
    <TelegramMiniAppProviders>
      <Suspense fallback={<MiniAppLoading />}>
        <MiniAppContent />
      </Suspense>
    </TelegramMiniAppProviders>
  );
}

// Metadata for the page
export const metadata = {
  title: "SportWarren | Telegram",
  description: "Championship Manager in Telegram, powered by TON",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: "#09111f",
};

// Force dynamic rendering (no static generation for Mini App)
export const dynamic = "force-dynamic";
