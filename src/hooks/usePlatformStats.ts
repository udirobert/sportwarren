"use client";

import { useEffect, useRef, useState } from "react";
import { trackDashboardSocialProofSeen } from "@/lib/analytics-funnel";

export interface PlatformStats {
  totalPlayers?: number;
  matchesPlayedToday?: number;
  newSquadsThisWeek?: number;
}

export function usePlatformStats() {
  const [platformStats, setPlatformStats] = useState<PlatformStats>({});
  const hasTrackedExposureRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/platform/stats")
      .then((response) => response.json() as Promise<PlatformStats>)
      .then((data) => {
        if (cancelled) return;
        setPlatformStats(data);

        if (hasTrackedExposureRef.current) return;

        const counters: string[] = [];
        if (data.matchesPlayedToday) counters.push("matches_played_today");
        if (data.newSquadsThisWeek) counters.push("new_squads_this_week");
        if (data.totalPlayers) counters.push("total_players");

        if (counters.length > 0) {
          trackDashboardSocialProofSeen(counters);
          hasTrackedExposureRef.current = true;
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPlatformStats({});
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return platformStats;
}
