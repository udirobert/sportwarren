"use client";

import { useState } from "react";
import { MatchCapture } from "@/components/match/MatchCapture";
import { MatchConsensusPanel } from "@/components/match/MatchConsensus";
import { MatchConfirmation } from "@/components/match/MatchConfirmation";
import { XPGainSummary } from "@/components/player/XPGainPopup";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useMatchVerification } from "@/hooks/match/useMatchVerification";
import { useXPGain } from "@/hooks/player/useXPGain";
import { Trophy, Shield, Activity, Sparkles } from "lucide-react";
import type { AttributeType } from "@/types";

type ViewMode = "capture" | "verify" | "detail" | "xp-summary";

// Mock XP data for demo
const MOCK_XP_SUMMARY = {
  totalXP: 385,
  attributeGains: [
    { attribute: 'shooting' as AttributeType, xp: 125, oldRating: 87, newRating: 88 },
    { attribute: 'passing' as AttributeType, xp: 85, oldRating: 82, newRating: 82 },
    { attribute: 'physical' as AttributeType, xp: 95, oldRating: 84, newRating: 84 },
    { attribute: 'pace' as AttributeType, xp: 80, oldRating: 76, newRating: 76 },
  ],
};

export default function MatchPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("capture");
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showXPSummary, setShowXPSummary] = useState(false);
  
  const { 
    matches, 
    activeMatch, 
    submitMatchResult, 
    verifyMatch,
    getMatchById 
  } = useMatchVerification();

  const { calculateMatchXPGain } = useXPGain();

  const selectedMatch = selectedMatchId ? getMatchById(selectedMatchId) : null;

  const handleMatchSubmit = async (result: any) => {
    await submitMatchResult(result);
    // Show XP summary after match submission
    setShowXPSummary(true);
    setViewMode("xp-summary");
  };

  const handleVerify = async (matchId: string, verified: boolean) => {
    await verifyMatch(matchId, verified);
    if (verified) {
      // After verification, show XP gains
      setShowXPSummary(true);
      setViewMode("xp-summary");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Match Center</h1>
        <p className="text-gray-600">Track, verify, and earn from your matches</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setViewMode("capture")}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
            viewMode === "capture"
              ? "bg-white text-green-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span className="font-medium">Track Match</span>
        </button>
        <button
          onClick={() => setViewMode("verify")}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
            viewMode === "verify"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span className="font-medium">Verify ({matches.filter(m => m.status === "pending").length})</span>
        </button>
      </div>

      {/* Content */}
      {viewMode === "capture" && (
        <MatchCapture
          homeTeam="Northside United"
          awayTeam="Red Lions FC"
          onSubmit={handleMatchSubmit}
        />
      )}

      {viewMode === "verify" && (
        <div className="space-y-4">
          {matches.map((match) => (
            <Card 
              key={match.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setSelectedMatchId(match.id);
                setViewMode("detail");
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{match.homeTeam}</div>
                      <div className="text-2xl font-bold text-green-600">{match.homeScore}</div>
                    </div>
                    <div className="text-gray-400 font-bold">VS</div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{match.awayTeam}</div>
                      <div className="text-2xl font-bold text-red-600">{match.awayScore}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      match.status === "verified" ? "bg-green-100 text-green-800" :
                      match.status === "disputed" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {match.status.toUpperCase()}
                    </span>
                    <span className="text-gray-500">
                      {match.verifications.filter(v => v.verified).length}/{match.requiredVerifications} verified
                    </span>
                    {match.trustScore !== undefined && (
                      <span className="text-blue-600">
                        Trust: {Math.round(match.trustScore)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {viewMode === "detail" && selectedMatch && (
        <div className="space-y-4">
          <Button 
            onClick={() => setViewMode("verify")}
            variant="outline"
            className="mb-4"
          >
            ← Back to Matches
          </Button>
          
          <MatchConsensusPanel match={selectedMatch} />
          
          <MatchConfirmation
            match={selectedMatch}
            userAddress="CURRENT_USER_ADDR"
            isCaptain={true}
            userTeam={selectedMatch.submitterTeam === "home" ? "away" : "home"}
            onVerify={(verified) => handleVerify(selectedMatch.id, verified)}
            onDispute={(reason) => {
              console.log("Disputed:", reason);
              handleVerify(selectedMatch.id, false);
            }}
          />
        </div>
      )}

      {viewMode === "xp-summary" && showXPSummary && (
        <div className="space-y-4">
          <Button 
            onClick={() => {
              setShowXPSummary(false);
              setViewMode("verify");
            }}
            variant="outline"
            className="mb-4"
          >
            ← Back to Matches
          </Button>
          
          <XPGainSummary 
            totalXP={MOCK_XP_SUMMARY.totalXP}
            attributeGains={MOCK_XP_SUMMARY.attributeGains}
          />
          
          <Card className="text-center py-6">
            <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">XP Applied!</h3>
            <p className="text-gray-600 mb-4">
              Your attributes have been updated based on this match performance.
            </p>
            <Button 
              onClick={() => {
                setShowXPSummary(false);
                setViewMode("verify");
              }}
            >
              Continue
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
