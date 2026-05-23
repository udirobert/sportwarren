"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { MatchResult } from '@/types';

interface MatchHistoryViewProps {
  settledMatches: MatchResult[];
  onSelectMatch: (matchId: string) => void;
}

export const MatchHistoryView: React.FC<MatchHistoryViewProps> = ({
  settledMatches,
  onSelectMatch,
}) => (
  <div className="space-y-4">
    {settledMatches.length === 0 ? (
      <Card className="py-10 text-center text-gray-600">No settled matches yet.</Card>
    ) : (
      settledMatches.map((match) => (
        <Card key={match.id}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  match.status === "verified"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}>
                  {match.status.toUpperCase()}
                </span>
                {match.paymentRail?.enabled && (
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                    {match.paymentRail.assetSymbol} Fee Rail
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900">
                {match.homeTeam} {match.homeScore} - {match.awayScore} {match.awayTeam}
              </h3>
              <p className="text-sm text-gray-500">{match.timestamp.toLocaleString()}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => onSelectMatch(match.id)}
            >
              Open Details
            </Button>
          </div>
        </Card>
      ))
    )}
  </div>
);
