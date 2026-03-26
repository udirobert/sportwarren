"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useMySquads } from "@/hooks/squad/useSquad";
import { trpc } from "@/lib/trpc-client";

const STORAGE_KEY = "activeSquadId";

type Membership = ReturnType<typeof useMySquads>["memberships"][number];

interface ActiveSquadContextType {
  activeSquad: Membership | null;
  activeSquadId: string | undefined;
  memberships: Membership[];
  setActiveSquad: (squadId: string) => void;
  refresh: () => Promise<void>;
  loading: boolean;
}

const ActiveSquadContext = createContext<ActiveSquadContextType | undefined>(undefined);

export function useActiveSquad(): ActiveSquadContextType {
  const context = useContext(ActiveSquadContext);
  if (!context) {
    throw new Error("useActiveSquad must be used within an ActiveSquadProvider");
  }
  return context;
}

export function ActiveSquadProvider({ children }: { children: React.ReactNode }) {
  const { memberships, loading, refresh } = useMySquads();
  const [persistedSquadId, setPersistedSquadId] = useState<string | null>(null);
  const setActiveSquadMutation = trpc.communication.setActiveSquad.useMutation();

  // Read persisted selection on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPersistedSquadId(stored);
    } catch {
      // localStorage unavailable (SSR or restricted)
    }
  }, []);

  const setActiveSquad = useCallback((squadId: string) => {
    setPersistedSquadId(squadId);
    try {
      localStorage.setItem(STORAGE_KEY, squadId);
    } catch {
      // localStorage unavailable
    }
    // Persist to server (fire-and-forget — writes PlatformIdentity.activeSquadId for Telegram path)
    setActiveSquadMutation.mutate({ squadId });
  }, [setActiveSquadMutation]);

  // Resolve active squad: persisted preference → first membership
  const activeSquad = useMemo(() => {
    if (memberships.length === 0) return null;

    if (persistedSquadId) {
      const found = memberships.find((m) => m.squad.id === persistedSquadId);
      if (found) return found;
      // Persisted squad no longer in memberships — fall through to first
    }

    return memberships[0];
  }, [memberships, persistedSquadId]);

  // Clear stale persisted ID if memberships change and it no longer exists
  useEffect(() => {
    if (persistedSquadId && memberships.length > 0) {
      const exists = memberships.some((m) => m.squad.id === persistedSquadId);
      if (!exists) {
        setPersistedSquadId(null);
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
      }
    }
  }, [persistedSquadId, memberships]);

  const value = useMemo<ActiveSquadContextType>(() => ({
    activeSquad,
    activeSquadId: activeSquad?.squad.id ?? undefined,
    memberships,
    setActiveSquad,
    refresh,
    loading,
  }), [activeSquad, memberships, setActiveSquad, refresh, loading]);

  return (
    <ActiveSquadContext.Provider value={value}>
      {children}
    </ActiveSquadContext.Provider>
  );
}
