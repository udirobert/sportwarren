"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useJourneyState } from "@/hooks/useJourneyState";

interface PageHint {
  message: string;
  actionLabel?: string;
  actionHref?: string;
  dismissKey: string;
}

// Define contextual hints per route
const PAGE_HINTS: Record<string, (stage: string) => PageHint | null> = {
  "/stats": (stage) => {
    if (stage === "verified_no_squad" || stage === "wallet_unverified") {
      return {
        message: "Your stats will level up once you log your first verified match.",
        actionLabel: "Go to Match Center",
        actionHref: "/match",
        dismissKey: "stats_onboarding",
      };
    }
    return null;
  },
  "/match": (stage) => {
    if (stage === "verified_no_squad" || stage === "wallet_unverified") {
      return {
        message: "Log a match to create your first proof-backed result.",
        actionLabel: "Create Squad First",
        actionHref: "/squad",
        dismissKey: "match_squad_reminder",
      };
    }
    if (stage === "season_kickoff") {
      return {
        message: "Invite your team to the match center for faster result logging.",
        actionLabel: "Invite Teammates",
        actionHref: "/squad",
        dismissKey: "match_team_invite",
      };
    }
    return null;
  },
  "/squad": (stage) => {
    if (stage === "verified_no_squad") {
      return {
        message: "Create your squad to start organizing matches and building reputation.",
        dismissKey: "squad_create_reminder",
      };
    }
    if (stage === "season_kickoff") {
      return {
        message: "Send the briefing link to your teammates so they can verify their accounts.",
        actionLabel: "Send Invite",
        actionHref: "/squad",
        dismissKey: "squad_briefing_reminder",
      };
    }
    return null;
  },
  "/reputation": (stage) => {
    if (stage === "verified_no_squad") {
      return {
        message: "Reputation grows as you log verified matches with your squad.",
        actionLabel: "Create Squad",
        actionHref: "/squad",
        dismissKey: "reputation_squad_prompt",
      };
    }
    return null;
  },
  "/dashboard": (stage) => {
    if (stage === "verified_no_squad") {
      return {
        message: "Your dashboard fills up once you create a squad and start logging matches.",
        actionLabel: "Create Your Squad",
        actionHref: "/squad",
        dismissKey: "dashboard_squad_prompt",
      };
    }
    return null;
  },
};

// Generic onboarding hints for first-time users
const STAGE_HINTS: Record<string, PageHint> = {
  wallet_unverified: {
    message: "Verify your wallet once to unlock all protected features.",
    actionLabel: "Verify Now",
    actionHref: "/settings?tab=wallet",
    dismissKey: "stage_wallet_verify",
  },
  account_ready: {
    message: "Set up your tactical profile to get personalized match insights.",
    actionLabel: "Set Up Profile",
    actionHref: "/profile",
    dismissKey: "stage_profile_setup",
  },
};

function getHintForPath(pathname: string, stage: string): PageHint | null {
  // Check page-specific hints first
  for (const [route, hintFn] of Object.entries(PAGE_HINTS)) {
    if (pathname.startsWith(route)) {
      const hint = hintFn(stage);
      if (hint) return hint;
    }
  }

  // Fall back to stage-level hints for new users
  if (stage === "wallet_unverified" || stage === "account_ready") {
    return STAGE_HINTS[stage] || null;
  }

  return null;
}

const DISMISSED_HINTS_KEY = "sw_dismissed_hints";

function getDismissedHints(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(DISMISSED_HINTS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDismissedHint(key: string) {
  if (typeof window === "undefined") return;
  const dismissed = getDismissedHints();
  dismissed.add(key);
  localStorage.setItem(DISMISSED_HINTS_KEY, JSON.stringify(Array.from(dismissed)));
}

export function PageContextualHints() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isTokenAuth = searchParams.has('rt');
  const { journeyStage } = useJourneyState();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  // Load dismissed state after mount
  useEffect(() => {
    setDismissed(getDismissedHints());
    setMounted(true);
  }, []);

  if (!mounted) return null;
  // Suppress hints for token-auth (WhatsApp) users — they don't have wallets
  if (isTokenAuth) return null;

  const hint = getHintForPath(pathname, journeyStage);

  if (!hint) return null;
  if (dismissed.has(hint.dismissKey)) return null;

  const handleDismiss = () => {
    saveDismissedHint(hint.dismissKey);
    setDismissed(new Set([...dismissed, hint.dismissKey]));
  };

  return (
    <div className="mx-4 mb-4 mt-0 animate-in fade-in slide-in-from-top-2 duration-300 md:mx-6">
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="flex-1">
          <p className="text-sm text-blue-900 dark:text-blue-100">{hint.message}</p>
          {hint.actionLabel && hint.actionHref && (
            <Link href={hint.actionHref} className="mt-1.5 inline-block">
              <Button size="xs" variant="outline" className="border-blue-300 bg-white text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:bg-blue-900 dark:text-blue-300">
                {hint.actionLabel}
              </Button>
            </Link>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded-full p-2 text-blue-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-800"
          aria-label="Dismiss hint"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}