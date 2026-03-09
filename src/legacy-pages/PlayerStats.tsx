// @ts-nocheck — legacy file, no longer imported; suppressing deep type instantiation error
import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc-client';
import { useWallet } from '@/contexts/WalletContext';
import { useCurrentPlayerAttributes, usePlayerForm } from '@/hooks/player/usePlayerAttributes';
import { Target, Users, Trophy, Shield, Star, TrendingUp, Activity, ArrowRight } from 'lucide-react';

export const PlayerStats: React.FC = () => {
  const { connected } = useWallet();
  const { attributes, loading, error } = useCurrentPlayerAttributes(connected);
  const { form } = usePlayerForm(attributes?.address);
  const { data: memberships } = trpc.squad.getMySquads.useQuery(undefined, {
    retry: false,
  });

  const activeSquadId = memberships?.[0]?.squad.id;
  const activeSquadName = memberships?.[0]?.squad.name;
  const { data: matchData } = trpc.match.list.useQuery(
    { squadId: activeSquadId, limit: 20 },
    { enabled: !!activeSquadId, staleTime: 30 * 1000 },
  );

  const recentMatches = matchData?.matches || [];
  const verifiedMatches = recentMatches.filter((match) => match.status === 'verified' || match.status === 'finalized');
  const recentForm = useMemo(() => form.slice(0, 5), [form]);
  const topSkills = useMemo(
    () => [...(attributes?.skills || [])].sort((a, b) => b.rating - a.rating).slice(0, 4),
    [attributes?.skills],
  );
  const rivalryRecord = useMemo(() => {
    const byOpponent = new Map<string, { team: string; played: number; won: number; drawn: number; lost: number; goalsDiff: number }>();

    for (const match of verifiedMatches) {
      const isHome = match.homeSquadId === activeSquadId;
      const opponent = isHome ? match.awaySquad?.name : match.homeSquad?.name;
      if (!opponent) continue;

      const current = byOpponent.get(opponent) || { team: opponent, played: 0, won: 0, drawn: 0, lost: 0, goalsDiff: 0 };
      current.played += 1;

      const goalsFor = isHome ? (match.homeScore ?? 0) : (match.awayScore ?? 0);
      const goalsAgainst = isHome ? (match.awayScore ?? 0) : (match.homeScore ?? 0);
      current.goalsDiff += goalsFor - goalsAgainst;

      if (goalsFor > goalsAgainst) current.won += 1;
      else if (goalsFor < goalsAgainst) current.lost += 1;
      else current.drawn += 1;

      byOpponent.set(opponent, current);
    }

    return Array.from(byOpponent.values())
      .sort((a, b) => b.played - a.played)
      .slice(0, 4);
  }, [activeSquadId, verifiedMatches]);

  if (!connected) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <Card className="text-center py-12">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Player Stats</h1>
          <p className="text-gray-600 mb-6">Connect a wallet to load your live profile, form, and match record.</p>
          <Link href="/settings?tab=wallet">
            <Button>Open Wallet Settings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <Card className="text-center py-12 text-gray-600">Loading your live player stats...</Card>
      </div>
    );
  }

  if (error || !attributes) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <Card className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Player Stats</h1>
          <p className="text-gray-600 mb-6">{error || 'Your profile could not be loaded yet.'}</p>
          <Link href="/match?mode=capture">
            <Button>Submit a Match</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8">
      <Card className="bg-gradient-to-br from-white to-emerald-50/60">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Player Stats
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {attributes.playerName.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{attributes.playerName}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span>Position: {attributes.position}</span>
                  {activeSquadName && <span>Squad: {activeSquadName}</span>}
                  <span>Season: {new Date().getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link href="/match?mode=history">
              <Button fullWidth variant="outline" icon={Activity}>Match History</Button>
            </Link>
            <Link href="/reputation">
              <Button fullWidth variant="outline" icon={TrendingUp}>Reputation</Button>
            </Link>
            <Link href="/match?mode=capture">
              <Button fullWidth icon={ArrowRight}>Submit Match</Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Goals Scored" value={attributes.totalGoals} icon={Target} color="green" />
        <StatCard title="Assists" value={attributes.totalAssists} icon={Users} color="blue" />
        <StatCard title="Level" value={attributes.xp.level} icon={Star} color="orange" />
        <StatCard title="Matches" value={attributes.totalMatches} icon={Shield} color="purple" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Form</h2>
            <span className="text-sm text-gray-500">{recentForm.length} latest entries</span>
          </div>
          {recentForm.length > 0 ? (
            <div className="space-y-4">
              {recentForm.map((entry) => (
                <div key={`${entry.matchId}-${entry.date.toISOString()}`} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">Match {entry.matchId.slice(0, 8)}</span>
                    <span className="text-sm font-medium text-emerald-700">{entry.rating.toFixed(1)} rating</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Form value: {entry.formValue.toFixed(1)}</span>
                    <span>{entry.date.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
              No form entries yet. Verified matches will start shaping this trend.
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Attributes</h2>
          <div className="space-y-4">
            {topSkills.map((skill) => (
              <div key={skill.skill}>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="font-medium text-gray-700 capitalize">{skill.skill}</span>
                  <span className="font-semibold text-gray-900">{skill.rating}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-600"
                    style={{ width: `${Math.min(100, skill.rating)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">XP Progress</div>
                <div className="text-2xl font-bold text-gray-900">{attributes.xp.totalXP.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Next level</div>
                <div className="font-semibold text-gray-900">{attributes.xp.nextLevelXP.toLocaleString()} XP</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-8">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Match Outcomes</h2>
            <Link href="/match?mode=history" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
              Open full history
            </Link>
          </div>
          {recentMatches.length > 0 ? (
            <div className="space-y-3">
              {recentMatches.slice(0, 6).map((match) => (
                <div key={match.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {match.homeSquad?.name || 'Home'} {match.homeScore ?? 0} - {match.awayScore ?? 0} {match.awaySquad?.name || 'Away'}
                      </div>
                      <div className="text-sm text-gray-500">{new Date(match.createdAt).toLocaleString()}</div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      match.status === 'verified' || match.status === 'finalized'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {match.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
              No live match history yet. Start with your first submission to populate this page.
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Opponent Record</h2>
          {rivalryRecord.length > 0 ? (
            <div className="space-y-3">
              {rivalryRecord.map((record) => (
                <div key={record.team} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{record.team}</span>
                    <span className="text-sm text-gray-500">{record.played} played</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <div>
                      <div className="font-semibold text-emerald-700">{record.won}</div>
                      <div className="text-gray-500">W</div>
                    </div>
                    <div>
                      <div className="font-semibold text-amber-700">{record.drawn}</div>
                      <div className="text-gray-500">D</div>
                    </div>
                    <div>
                      <div className="font-semibold text-rose-700">{record.lost}</div>
                      <div className="text-gray-500">L</div>
                    </div>
                    <div>
                      <div className={`font-semibold ${record.goalsDiff >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {record.goalsDiff > 0 ? '+' : ''}{record.goalsDiff}
                      </div>
                      <div className="text-gray-500">GD</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
              Rival records will appear once verified matches build up.
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Next best move</h2>
            <p className="text-gray-600">
              Use this page as the bridge back into the live loop: play, verify, then review reputation and development.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/match?mode=capture">
              <Button>Submit next match</Button>
            </Link>
            <Link href="/squad">
              <Button variant="outline">Manage squad</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
