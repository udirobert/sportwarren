"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Check, X, AlertCircle, Shield, Users, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MatchResult, Verification, TrustTier } from '@/types';
import {
  checkConsensus,
  getTrustTierColor,
  getTrustTierIcon,
  TRUST_TIER_WEIGHTS
} from '@/lib/match/verification';

interface MatchConsensusProps {
  match: MatchResult;
}

const TechnicalCommentary: React.FC<{ match: MatchResult }> = ({ match }) => {
  const [visibleLogs, setVisibleLogs] = React.useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const logs = React.useMemo(() => {
    const baseLogs = [
      "SYSTEM: Initializing Phygital Verification Node...",
      "ORACLE: Fetching Chainlink ultra-local weather data...",
      `ORACLE: Conditions confirmed: ${match.weatherVerified ? 'Match weather matches stadium logs.' : 'Weather verification skipped.'}`,
      "GPS: Cross-referencing player coordinates with Pitch IDs...",
      `GPS: ${match.locationVerified ? 'Location verified: Hackney Marshes Pitch 4.' : 'Coordinate sync in progress...'}`,
      "VISION: Analyzing match evidence (photos/voice)...",
      "VISION: Goal detected in match-evidence-01. Analyzing visual markers...",
      "AI: Match events confirmed. Verifying consensus with opposing squad...",
      match.status === 'verified'
        ? "ALGORAND: Consensus reached. Finalizing immutable record on-chain..."
        : "NETWORK: Awaiting multi-sig confirmation from away team captain...",
      match.status === 'verified' ? "SUCCESS: Match record secured. XP distributed to all verified players." : "OFFICE: Player reputations updated based on contribution."
    ];
    return baseLogs;
  }, [match]);

  React.useEffect(() => {
    if (currentIndex < logs.length) {
      const timer = setTimeout(() => {
        setVisibleLogs(prev => [...prev, logs[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }, 800 + Math.random() * 1000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, logs]);

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/30 font-mono text-[10px] overflow-hidden">
      <div className="flex items-center space-x-2 mb-3 border-b border-white/10 pb-2">
        <Cpu className="w-3 h-3 text-blue-400 animate-pulse" />
        <span className="text-blue-400 font-bold uppercase tracking-widest italic">Verification Engine v1.02</span>
      </div>

      <div className="space-y-1.5 min-h-[120px]">
        <AnimatePresence mode="popLayout">
          {visibleLogs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start space-x-2"
            >
              <span className="text-gray-600">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              <span className={
                log.startsWith('SUCCESS') ? 'text-green-400' :
                  log.startsWith('ALGORAND') ? 'text-purple-400' :
                    log.startsWith('ORACLE') ? 'text-blue-400' :
                      log.startsWith('VISION') ? 'text-orange-400' :
                        'text-gray-300'
              }>
                {log}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {currentIndex < logs.length && (
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-1.5 h-3 bg-blue-500 ml-1 inline-block"
          />
        )}
      </div>
    </div>
  );
};

export const MatchConsensusPanel: React.FC<MatchConsensusProps> = ({ match }) => {
  const consensus = match.consensus || checkConsensus(match);

  const homeVerifications = match.verifications.filter((v: Verification) => v.verified);
  const awayVerifications = match.verifications.filter((v: Verification) => v.verified);

  const homeTrustScore = homeVerifications.reduce(
    (sum: number, v: Verification) => sum + TRUST_TIER_WEIGHTS[v.trustTier],
    0
  );
  const awayTrustScore = awayVerifications.reduce(
    (sum: number, v: Verification) => sum + TRUST_TIER_WEIGHTS[v.trustTier],
    0
  );

  return (
    <Card className="border-l-4 border-l-blue-500">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Consensus Verification</h3>
          </div>
          {consensus.resolved ? (
            <span className="flex items-center space-x-1 text-green-600 text-sm font-medium">
              <Check className="w-4 h-4" />
              <span>Consensus Reached</span>
            </span>
          ) : consensus.discrepancy ? (
            <span className="flex items-center space-x-1 text-red-600 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>Discrepancy Detected</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-yellow-600 text-sm font-medium">
              <Users className="w-4 h-4" />
              <span>Awaiting Both Teams</span>
            </span>
          )}
        </div>

        {/* Technical Commentary - Championship Manager Style */}
        <TechnicalCommentary match={match} />

        {/* Team Submission Status */}
        <div className="grid grid-cols-2 gap-4">
          {/* Home Team */}
          <div className={`p-3 rounded-lg border-2 ${consensus.homeSubmitted
            ? 'border-green-200 bg-green-50'
            : 'border-gray-200 bg-gray-50'
            }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{match.homeTeam}</span>
              {consensus.homeSubmitted ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
              )}
            </div>
            {consensus.homeSubmitted && (
              <div className="text-sm text-gray-600">
                <div>Score: {consensus.homeScore}</div>
                <div className="flex items-center space-x-1 mt-1">
                  <span>Trust:</span>
                  <span className="font-medium text-blue-600">{homeTrustScore} pts</span>
                </div>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className={`p-3 rounded-lg border-2 ${consensus.awaySubmitted
            ? 'border-green-200 bg-green-50'
            : 'border-gray-200 bg-gray-50'
            }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{match.awayTeam}</span>
              {consensus.awaySubmitted ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
              )}
            </div>
            {consensus.awaySubmitted && (
              <div className="text-sm text-gray-600">
                <div>Score: {consensus.awayScore}</div>
                <div className="flex items-center space-x-1 mt-1">
                  <span>Trust:</span>
                  <span className="font-medium text-blue-600">{awayTrustScore} pts</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Discrepancy Warning */}
        {consensus.discrepancy && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Score Discrepancy</p>
                <p className="text-sm text-red-700 mt-1">
                  The submitted scores do not match between teams.
                  This match requires manual review by league administrators.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Verification List */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Verifications</h4>
          <div className="space-y-2">
            {match.verifications.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No verifications yet</p>
            ) : (
              match.verifications.map((v: Verification, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    {v.verified ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium text-gray-900">{v.verifier}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTrustTierColor(v.trustTier)}`}>
                      {getTrustTierIcon(v.trustTier)} {v.trustTier}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 capitalize">{v.role}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Trust Score */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Overall Trust Score</span>
            <span className="text-lg font-bold text-blue-600">{match.trustScore || 0}/100</span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${match.trustScore || 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {match.trustScore && match.trustScore >= 75
              ? 'High confidence - ready for verification'
              : match.trustScore && match.trustScore >= 30
                ? 'Moderate confidence - more verifications needed'
                : 'Low confidence - awaiting more evidence'}
          </p>
        </div>
      </div>
    </Card>
  );
};
