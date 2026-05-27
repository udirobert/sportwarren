"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { CheckCircle2 } from 'lucide-react';
import { ChainLabel } from '@/components/common/ChainLabel';
import { TelegramContextualTip } from '@/components/common/TelegramContextualTip';
import type { MatchResult } from '@/types';

interface MatchVerifyViewProps {
  pendingMatches: MatchResult[];
  onSelectMatch: (matchId: string) => void;
}

export const MatchVerifyView: React.FC<MatchVerifyViewProps> = ({
  pendingMatches,
  onSelectMatch,
}) => (
  <div className="space-y-4">
    <TelegramContextualTip context="verification" />
    {pendingMatches.length === 0 ? (
      <Card className="py-10 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
        <h2 className="text-lg font-semibold text-gray-900">No pending match reviews</h2>
        <p className="mt-1 text-gray-600">Your verification queue is clear. Submit the next result from here.</p>
      </Card>
    ) : (
      pendingMatches.map((match) => (
        <Card
          key={match.id}
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => onSelectMatch(match.id)}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                  PENDING
                </span>
                <span className="text-sm text-gray-500">
                  {match.verifications.filter((entry) => entry.verified).length}/{match.requiredVerifications} verified
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{match.homeTeam}</div>
                  <div className="text-2xl font-bold text-emerald-600">{match.homeScore}</div>
                </div>
                <div className="font-bold text-gray-400">VS</div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{match.awayTeam}</div>
                  <div className="text-2xl font-bold text-rose-600">{match.awayScore}</div>
                </div>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              {match.paymentRail?.enabled && (
                <div className="mb-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                  <ChainLabel chain="yellow" /> Fee Locked
                </div>
              )}
              Review
            </div>
          </div>
        </Card>
      ))
    )}
  </div>
);
