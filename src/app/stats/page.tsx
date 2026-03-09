"use client";

import React from "react";
import Link from "next/link";
import { BarChart3, Target, Trophy, TrendingUp, Shield, Zap, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useWallet } from "@/contexts/WalletContext";
import { usePlayerAttributes } from "@/hooks/player/usePlayerAttributes";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-gray-600" />
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-black text-gray-900">{value}</div>
    </div>
  );
}

export default function StatsPage() {
  const { address } = useWallet();
  const { attributes, loading } = usePlayerAttributes(address ?? undefined);

  if (!address) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-gray-900 mb-2">Your Stats</h1>
        <p className="text-gray-500 mb-6">Connect your wallet to see your verified on-chain stats.</p>
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
        >
          Connect Wallet <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded-xl w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!attributes) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-gray-900 mb-2">No stats yet</h1>
        <p className="text-gray-500 mb-6">Submit your first match result to start building your verified record.</p>
        <Link
          href="/match?mode=capture"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
        >
          Submit a Match <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
    );
  }

  const pace = attributes.skills.find((s) => s.skill === "pace")?.rating ?? 0;
  const shooting = attributes.skills.find((s) => s.skill === "shooting")?.rating ?? 0;
  const passing = attributes.skills.find((s) => s.skill === "passing")?.rating ?? 0;
  const defending = attributes.skills.find((s) => s.skill === "defending")?.rating ?? 0;
  const dribbling = attributes.skills.find((s) => s.skill === "dribbling")?.rating ?? 0;
  const physical = attributes.skills.find((s) => s.skill === "physical")?.rating ?? 0;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{attributes.playerName}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {attributes.position} · Level {attributes.xp.level} · {attributes.xp.totalXP.toLocaleString()} XP
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/reputation"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5" /> Reputation
          </Link>
          <Link
            href="/match"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Target className="w-3.5 h-3.5" /> Matches
          </Link>
        </div>
      </div>

      {/* Career summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Matches" value={attributes.totalMatches} icon={Target} color="border-gray-200 bg-gray-50" />
        <StatCard label="Goals" value={attributes.totalGoals} icon={Zap} color="border-green-200 bg-green-50" />
        <StatCard label="Assists" value={attributes.totalAssists} icon={TrendingUp} color="border-blue-200 bg-blue-50" />
        <StatCard label="Reputation" value={attributes.reputationScore} icon={Trophy} color="border-amber-200 bg-amber-50" />
      </div>

      {/* Skill ratings */}
      <Card className="border-gray-200 bg-white">
        <h2 className="text-base font-black uppercase tracking-wide text-gray-700 mb-4">Skill Ratings</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Pace", value: pace, icon: Zap },
            { label: "Shooting", value: shooting, icon: Target },
            { label: "Passing", value: passing, icon: TrendingUp },
            { label: "Dribbling", value: dribbling, icon: BarChart3 },
            { label: "Defending", value: defending, icon: Shield },
            { label: "Physical", value: physical, icon: Shield },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-600">{label}</span>
                  <span className="text-xs font-black text-gray-900">{value}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${Math.min(value, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* XP progress */}
      <Card className="border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-black uppercase tracking-wide text-gray-700">XP Progress</h2>
          <span className="text-xs text-gray-500">Level {attributes.xp.level} → {attributes.xp.level + 1}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
            style={{ width: `${Math.min((attributes.xp.seasonXP / attributes.xp.nextLevelXP) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">
          {attributes.xp.seasonXP.toLocaleString()} / {attributes.xp.nextLevelXP.toLocaleString()} season XP
        </p>
      </Card>

      {/* Journey CTAs */}
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/match?mode=capture"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
        >
          <Target className="w-4 h-4" /> Submit a Match
        </Link>
        <Link
          href="/reputation"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Trophy className="w-4 h-4" /> View Reputation
        </Link>
        <Link
          href="/squad"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <ArrowRight className="w-4 h-4" /> Go to Squad
        </Link>
      </div>
    </main>
  );
}
