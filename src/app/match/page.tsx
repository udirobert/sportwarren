"use client";

import { useState } from "react";
import { MatchCapture } from "@/components/match/MatchCapture";
import { MatchVerification } from "@/components/match/MatchVerification";
import { MatchConsensusPanel } from "@/components/match/MatchConsensus";
import { MatchConfirmation } from "@/components/match/MatchConfirmation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useMatchVerification } from "@/hooks/match/useMatchVerification";
import { Trophy, Shield, Activity } from "lucide-react";

type ViewMode = "capture" | "verify" | "detail";

export default function MatchPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("capture");
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  
  const { 
    matches, 
    activeMatch, 
    submitMatchResult, 
    verifyMatch,
    getMatchById 
  } = useMatchVerification();

  const selectedMatch = selectedMatchId ? getMatchById(selectedMatchId) : null;

  const handleMatchSubmit = async (result: any) => {
    await submitMatchResult(result);
    setViewMode("verify");
  };

  const handleVerify = async (matchId: string, verified: boolean) => {
    await verifyMatch(matchId, verified);
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
    </div>
  );
}
