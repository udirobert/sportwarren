"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, X, AlertTriangle, Shield, Users } from 'lucide-react';
import type { MatchResult } from '@/types';
import { getMatchStatusDisplay, canVerifyMatch } from '@/lib/match/verification';

interface MatchConfirmationProps {
  match: MatchResult;
  userAddress: string;
  isCaptain: boolean;
  userTeam: 'home' | 'away' | null;
  onVerify: (verified: boolean) => void;
  onDispute: (reason: string) => void;
}

export const MatchConfirmation: React.FC<MatchConfirmationProps> = ({
  match,
  userAddress,
  isCaptain,
  userTeam,
  onVerify,
  onDispute,
}) => {
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [submittedScores, setSubmittedScores] = useState({
    home: match.homeScore,
    away: match.awayScore,
  });

  const verificationCheck = canVerifyMatch(match, userAddress, isCaptain);
  const statusDisplay = getMatchStatusDisplay(match.status);

  // Check if user already submitted
  const hasSubmitted = match.verifications.some(
    v => v.verifierAddress === userAddress
  );

  // Check if scores match what user expects
  const scoresMatch = submittedScores.home === match.homeScore && 
                      submittedScores.away === match.awayScore;

  const handleVerify = () => {
    if (scoresMatch) {
      onVerify(true);
    } else {
      // Scores don't match - this is effectively a dispute
      onDispute(`Submitted different score: ${submittedScores.home}-${submittedScores.away}`);
    }
  };

  const handleDisputeSubmit = () => {
    if (disputeReason.trim()) {
      onDispute(disputeReason);
      setShowDisputeForm(false);
    }
  };

  // If user is not captain or already verified
  if (!verificationCheck.canVerify) {
    return (
      <Card className="text-center py-6">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">Cannot Verify</h3>
        <p className="text-sm text-gray-600">{verificationCheck.reason}</p>
      </Card>
    );
  }

  // If user already submitted
  if (hasSubmitted) {
    return (
      <Card className="text-center py-6 bg-green-50 border-green-200">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Check className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="font-semibold text-green-900 mb-1">Verification Submitted</h3>
        <p className="text-sm text-green-700">
          You have already verified this match. Awaiting other team.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Confirm Match Result</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
            {statusDisplay.icon} {statusDisplay.label}
          </span>
        </div>

        {/* Current Score Display */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Submitted Result</p>
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{match.homeTeam}</div>
              <div className="text-3xl font-bold text-green-600">{match.homeScore}</div>
            </div>
            <div className="text-xl font-bold text-gray-400">-</div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{match.awayTeam}</div>
              <div className="text-3xl font-bold text-red-600">{match.awayScore}</div>
            </div>
          </div>
        </div>

        {/* Score Confirmation (if opposing team) */}
        {userTeam && userTeam !== match.submitterTeam && (
          <div className="p-4 border-2 border-blue-100 rounded-lg bg-blue-50">
            <p className="text-sm font-medium text-blue-900 mb-3">
              Confirm the score as {userTeam === 'home' ? 'home' : 'away'} team captain:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">{match.homeTeam}</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={submittedScores.home}
                  onChange={(e) => setSubmittedScores(s => ({ ...s, home: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">{match.awayTeam}</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={submittedScores.away}
                  onChange={(e) => setSubmittedScores(s => ({ ...s, away: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-bold"
                />
              </div>
            </div>
            {!scoresMatch && (
              <div className="mt-3 p-2 bg-yellow-100 rounded-lg flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Your score differs from the submitted result. This will be marked as a dispute.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {!showDisputeForm ? (
          <div className="space-y-2">
            <Button 
              onClick={handleVerify}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              {scoresMatch ? 'Confirm Result' : 'Submit My Score'}
            </Button>
            <Button 
              onClick={() => setShowDisputeForm(true)}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              Dispute Result
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <label className="block text-sm font-medium text-red-900 mb-2">
                Reason for Dispute
              </label>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Explain why you disagree with this result..."
                className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm"
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => setShowDisputeForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDisputeSubmit}
                disabled={!disputeReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Submit Dispute
              </Button>
            </div>
          </div>
        )}

        {/* Info */}
        <p className="text-xs text-gray-500 text-center">
          Both team captains must confirm for the result to be verified on-chain.
        </p>
      </div>
    </Card>
  );
};
