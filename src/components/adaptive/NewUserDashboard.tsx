"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Zap,
  ArrowRight,
  ExternalLink,
  Plus,
  CheckCircle2,
  Users,
  Trophy,
  Activity,
  Lock,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { getPendingPersona } from "@/lib/claims/persona";
import { buildTelegramDeepLink } from "@/lib/telegram/deep-links";
import type {
  DashboardEntryAction,
  DashboardEntryStateId,
} from "@/lib/dashboard/entry-state";
import type { ChecklistId } from "@/lib/onboarding/flow";
import dynamic from "next/dynamic";

const AgenticConcierge = dynamic(
  () =>
    import("@/components/adaptive/AgenticConcierge").then((m) => ({
      default: m.AgenticConcierge,
    })),
  { ssr: false },
);

interface NewUserDashboardProps {
  entryState: {
    id: DashboardEntryStateId;
    eyebrow: string;
    headline: string;
    description: string;
    primaryAction: DashboardEntryAction;
    secondaryAction?: DashboardEntryAction;
    steps: { number: number; label: string; completed: boolean }[];
  };
  isGuest: boolean;
  venue: string;
  isTourActive: boolean;
  setIsTourActive: (active: boolean) => void;
  setPersonalizationDone: (done: boolean) => void;
  completeChecklistItem: (id: ChecklistId) => void;
  renderEntryAction: (
    action: DashboardEntryAction | undefined,
    tone: "primary" | "secondary",
  ) => React.ReactNode;
}

export const NewUserDashboard: React.FC<NewUserDashboardProps> = ({
  entryState,
  isGuest,
  venue,
  isTourActive,
  setIsTourActive,
  setPersonalizationDone: _setPersonalizationDone,
  completeChecklistItem,
  renderEntryAction,
}) => {
  const entryAccountLabel = isGuest ? "Guest preview" : "Signed in";
  const platformStats = usePlatformStats();

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10 nav-spacer-top nav-spacer-bottom">
      <Card className="overflow-hidden border-gray-200/80 bg-gradient-to-br from-white via-white to-green-50/30 dark:border-gray-700 dark:from-gray-900 dark:via-gray-900 dark:to-green-950/20">
        <div className="text-center space-y-6 p-6">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-green-600 dark:text-green-400">
            {entryState.eyebrow}
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            {entryState.headline}
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
            {entryState.description}
          </p>

          {entryState.primaryAction.href ? (
            <Link
              href={entryState.primaryAction.href}
              onClick={() =>
                completeChecklistItem(
                  entryState.primaryAction.intent === "log_match"
                    ? "log_match"
                    : entryState.primaryAction.intent === "preview_match"
                      ? "set_formation"
                      : "complete_card",
                )
              }
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-200 hover:scale-[1.02]"
            >
              <Zap className="w-5 h-5 mr-2" />
              {entryState.primaryAction.label}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          ) : (
            renderEntryAction(entryState.primaryAction, "primary")
          )}

          {entryState.secondaryAction && (
            <div>
              {renderEntryAction(entryState.secondaryAction, "secondary")}
            </div>
          )}

          {entryState.steps.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-1 md:gap-2">
                {entryState.steps.map((step, i) => (
                  <React.Fragment key={step.number}>
                    {i > 0 && (
                      <div
                        className={`w-6 md:w-10 h-px ${step.completed ? "bg-green-400" : "bg-gray-300 dark:bg-gray-600"}`}
                      />
                    )}
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-black transition-colors ${
                          step.completed
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                        ) : (
                          step.number
                        )}
                      </div>
                      <span
                        className={`text-[10px] md:text-xs font-bold uppercase tracking-wide ${
                          step.completed
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
            {isGuest ? (
              <span>{venue} preview</span>
            ) : (
              <span>{entryAccountLabel}</span>
            )}
          </div>
        </div>
      </Card>

      {/* Social proof: live platform counters for new users */}
      {(platformStats.totalPlayers ||
        platformStats.matchesPlayedToday ||
        platformStats.newSquadsThisWeek) && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {platformStats.totalPlayers ? (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center">
              <Users className="mx-auto h-4 w-4 text-emerald-600 dark:text-emerald-400 mb-1" />
              <div className="text-lg font-black tabular-nums text-emerald-700 dark:text-emerald-300">
                {platformStats.totalPlayers.toLocaleString()}
              </div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Players
              </div>
            </div>
          ) : null}
          {platformStats.matchesPlayedToday ? (
            <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 p-3 text-center">
              <Trophy className="mx-auto h-4 w-4 text-sky-600 dark:text-sky-400 mb-1" />
              <div className="text-lg font-black tabular-nums text-sky-700 dark:text-sky-300">
                {platformStats.matchesPlayedToday.toLocaleString()}
              </div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Matches today
              </div>
            </div>
          ) : null}
          {platformStats.newSquadsThisWeek ? (
            <div className="rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 p-3 text-center">
              <Activity className="mx-auto h-4 w-4 text-violet-600 dark:text-violet-400 mb-1" />
              <div className="text-lg font-black tabular-nums text-violet-700 dark:text-violet-300">
                {platformStats.newSquadsThisWeek.toLocaleString()}
              </div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                New squads
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Soft auth nudge for guest users — deferred signup (progressive commitment) */}
      {isGuest && <GuestAuthNudge />}

      <div className="mt-4">
        <OnboardingChecklist
          journeyStage={entryState.id}
          onStepAction={() => {}}
        />
      </div>

      <div className="md:hidden mt-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📱</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
              Get the best mobile experience
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Open SportWarren in Telegram for faster access and instant
              notifications.
            </p>
            <a
              href={buildTelegramDeepLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700"
            >
              Open in Telegram
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <OnboardingFlow
        onVisibilityChange={setIsTourActive}
        journeyStage={entryState.id}
        completeChecklistItem={completeChecklistItem}
      />
      {!isTourActive && <AgenticConcierge journeyStage={entryState.id} />}

      <Link
        href={entryState.primaryAction.href || "/match?mode=capture"}
        className="fixed bottom-6 left-6 z-50 md:hidden bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl shadow-green-600/40 transition-all active:scale-95 animate-pulse"
        aria-label={entryState.primaryAction.label}
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
};

/** Soft, dismissible auth nudge for guest dashboard users.
 *  Reads the pending persona from localStorage to show what they built.
 *  Progressive commitment: they experience value before being asked to sign up. */
function GuestAuthNudge() {
  const [dismissed, setDismissed] = useState(false);
  const [persona, setPersona] = useState<ReturnType<typeof getPendingPersona>>(null);

  useEffect(() => {
    setPersona(getPendingPersona());
  }, []);

  if (dismissed || !persona) return null;

  const done = [
    !!persona.displayName,
    !!persona.position,
    !!persona.attributeDeltas && Object.keys(persona.attributeDeltas).length > 0,
    !!persona.avatarBase64,
    !!persona.formation,
  ].filter(Boolean).length;

  return (
    <div className="mt-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="flex items-start gap-3">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {persona.displayName
              ? `Hey ${persona.displayName}, you built ${done} parts of your card as a guest.`
              : `You built ${done} parts of your player card as a guest.`}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            Sign in once to lock it in permanently, verify matches, and start earning XP.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Link
              href="/?connect=1"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors"
            >
              <Lock className="w-3 h-3" />
              Lock it in
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
