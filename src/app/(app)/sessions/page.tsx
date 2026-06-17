"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc-client';
import { PageShell } from '@/components/common/PageShell';
import { Card } from '@/components/ui/Card';
import { useActiveSquad } from '@/contexts/ActiveSquadContext';
import { Calendar, Plus, ArrowRight, X } from 'lucide-react';

// ── Loading ────────────────────────────────────────────────────────────────

function SessionsListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      ))}
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    open: { label: 'Open', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
    balanced: { label: 'Balanced', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
    completed: { label: 'Completed', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  };
  const c = config[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.className}`}>
      {c.label}
    </span>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function SessionsPage() {
  const { activeSquadId } = useActiveSquad();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch sessions for the active squad
  const { data: sessions, isLoading, refetch } = trpc.session.listBySquad.useQuery(
    { squadId: activeSquadId ?? '' },
    { enabled: !!activeSquadId, staleTime: 15_000 },
  );

  // Create session mutation
  const createSession = trpc.session.create.useMutation({
    onSuccess: () => {
      setShowCreate(false);
      setNewName('');
      refetch();
    },
  });



  // Sort: active first (open → balanced), then by date desc
  const sortedSessions = [...(sessions ?? [])].sort((a, b) => {
    const order: Record<string, number> = { open: 0, balanced: 1, completed: 2 };
    const aOrder = order[a.status] ?? 3;
    const bOrder = order[b.status] ?? 3;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <PageShell maxWidth="2xl">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sessions</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your game sessions with rotating teams
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>

        {/* Create Session Modal */}
        {showCreate && activeSquadId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowCreate(false)}>
            <div className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">New Session</h3>
                <button onClick={() => setShowCreate(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider block mb-1">
                  Session Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Wednesday Night Football"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  maxLength={60}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <button
                onClick={() => {
                  if (!newName.trim() || !activeSquadId) return;
                  createSession.mutate({
                    squadId: activeSquadId,
                    name: newName.trim(),
                    date: new Date(newDate),
                  });
                }}
                disabled={!newName.trim() || createSession.isPending}
                className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm disabled:opacity-50 transition-colors"
              >
                {createSession.isPending ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </div>
        )}

        {/* Session list */}
        {isLoading ? (
          <SessionsListSkeleton />
        ) : !activeSquadId ? (
          <Card>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Select a squad to manage sessions.
            </p>
          </Card>
        ) : !sessions?.length ? (
          <Card className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">No sessions yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Create a session to start tracking games with rotating teams.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {sortedSessions.map((s) => (
              <Link key={s.id} href={`/sessions/${s.id}`}>
                <Card hover>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {s.name}
                        </p>
                        <StatusBadge status={s.status} />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {new Date(s.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
