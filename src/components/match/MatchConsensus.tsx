"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Check, X, AlertCircle, Shield, Users, Cpu, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentRailNotice } from '@/components/payments/PaymentRailNotice';
import type { MatchResult, Verification } from '@/types';
import {
  checkConsensus,
  getTrustTierColor,
  getTrustTierIcon,
  TRUST_TIER_WEIGHTS
} from '@/lib/match/verification';
import { CREWorkflowDiagram } from './CREWorkflowDiagram';

interface MatchConsensusProps {
  match: MatchResult;
}

interface LogEntry {
  text: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'data';
  data?: any;
}

const TechnicalCommentary: React.FC<{ match: MatchResult }> = ({ match }) => {
  const [visibleLogs, setVisibleLogs] = React.useState<LogEntry[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [showRawData, setShowRawData] = React.useState(false);

  const logs = React.useMemo(() => {
    const creId = match.creResult?.workflowId || `cre_mw_${Math.random().toString(36).substring(7)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const baseLogs: LogEntry[] = [
      {
        text: `[${creId}] Initializing Phygital Verification Node...`,
        timestamp: timeStr,
        type: 'info' as const
      },
      {
        text: 'YELLOW: Opening off-chain match fee session...',
        timestamp: timeStr,
        type: 'info' as const
      },
      match.paymentRail?.sessionId ? {
        text: `YELLOW: Match fee session active: ${match.paymentRail.sessionId.slice(0, 12)}... [OFF-CHAIN LOCKED: ${(match.paymentRail.feeAmount ?? 0) * 2} ${match.paymentRail.assetSymbol}]`,
        timestamp: timeStr,
        type: 'success' as const
      } : {
        text: 'YELLOW: Falling back to manual fee settlement (eligible EVM identity missing).',
        timestamp: timeStr,
        type: 'warning' as const
      },
      {
        text: "FETCH: Orchestrating global weather and location oracles...",
        timestamp: timeStr,
        type: 'info' as const
      },
      {
        text: `WEATHER: Source: ${match.creResult?.weather.source || 'Open-Meteo (Sovereign)'}. Temp: ${match.creResult?.weather.temperature || 14}°C.`,
        timestamp: timeStr,
        type: match.creResult?.weather.verified ? 'success' : 'warning',
        data: match.creResult?.weather.verified ? {
          temperature: `${match.creResult?.weather.temperature}°C`,
          conditions: match.creResult?.weather.conditions,
          source: match.creResult?.weather.source
        } : undefined
      },
      {
        text: `GEO: Verifying Pitch ID benchmarks for ${match.creResult?.location.region || 'Unknown Location'}.`,
        timestamp: timeStr,
        type: 'info' as const
      },
      {
        text: `GEO: Place Type: ${match.creResult?.location.placeType || 'unknown'}. Pitch Status: ${match.creResult?.location.isPitch ? 'CONFIRMED' : 'RECREATIONAL'}.`,
        timestamp: timeStr,
        type: match.creResult?.location.isPitch ? 'success' : 'warning',
        data: match.creResult?.location.verified ? {
          region: match.creResult?.location.region?.split(',')[0],
          placeType: match.creResult?.location.placeType,
          isPitch: match.creResult?.location.isPitch
        } : undefined
      },
      {
        text: `COMPUTE: Trust Score: ${match.creResult?.confidence || match.trustScore || 0}/100 based on multi-source entropy.`,
        timestamp: timeStr,
        type: 'data' as const,
        data: {
          confidence: match.creResult?.confidence || match.trustScore || 0,
          weatherWeight: match.creResult?.weather.verified ? 40 : 0,
          locationWeight: match.creResult?.location.isPitch ? 60 : (match.creResult?.location.verified ? 30 : 0)
        }
      },
      match.status === 'verified'
        ? {
            text: "SETTLE: Consensus reached. Finalizing immutable record on Algorand...",
            timestamp: timeStr,
            type: 'success' as const
          }
        : {
            text: "WAIT: Awaiting multi-sig confirmation from away team captain...",
            timestamp: timeStr,
            type: 'warning' as const
          },
      match.status === 'verified' && match.paymentRail?.sessionId ? {
        text: 'YELLOW: Closing off-chain fee session after consensus...',
        timestamp: timeStr,
        type: 'info' as const
      } : null,
      match.status === 'verified' && match.paymentRail?.sessionId ? {
        text: `YELLOW: Session closeout signed. Winner receives 1.95 ${match.paymentRail.assetSymbol}; platform fee 0.05 ${match.paymentRail.assetSymbol}.`,
        timestamp: timeStr,
        type: 'success' as const
      } : null,
      match.status === 'verified' 
        ? {
            text: "SUCCESS: Match record secured. XP distributed to all verified players.",
            timestamp: timeStr,
            type: 'success' as const
          }
        : {
            text: "REP: Local reputation markers updated.",
            timestamp: timeStr,
            type: 'info' as const
          }
    ].filter(Boolean) as LogEntry[];
    return baseLogs;
  }, [match]);

  React.useEffect(() => {
    if (currentIndex < logs.length) {
      const timer = setTimeout(() => {
        setVisibleLogs(prev => [...prev, logs[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }, 600 + Math.random() * 800);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, logs]);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'data': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const [isLogCollapsed, setIsLogCollapsed] = React.useState(true);

  return (
    <div className="space-y-3">
      {/* Technical Commentary - Championship Manager Style */}
      <div className="bg-gray-900 dark:bg-gray-950 rounded-xl border border-blue-500/30 overflow-hidden">
        {/* Header - always visible, clickable to expand */}
        <button
          onClick={() => setIsLogCollapsed(!isLogCollapsed)}
          className="w-full flex items-center justify-between p-3 text-left"
        >
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="text-blue-400 font-bold uppercase tracking-widest text-xs">Verification Engine v1.02</span>
          </div>
          <div className="flex items-center gap-2">
            {match.creResult?.workflowId && (
              <a
                href={`https://functions.chain.link/${match.creResult.workflowId}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center space-x-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="hidden sm:inline">View Workflow</span>
              </a>
            )}
            {isLogCollapsed ? (
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
          </div>
        </button>

        {/* Collapsible log content - collapsed by default on mobile */}
        {!isLogCollapsed && (
          <div className="px-3 pb-3 font-mono text-readable-mono">
            <div className="border-t border-white/10 pt-2 space-y-1.5 min-h-[100px]">
          <AnimatePresence mode="popLayout">
            {visibleLogs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start space-x-2"
              >
                <span className="text-gray-600 flex-shrink-0">[{log.timestamp}]</span>
                <span className={getLogColor(log.type)}>
                  {log.text}
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
        )}
      </div>

      {/* Raw Data Toggle */}
      {match.creResult && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Cpu className="w-4 h-4" />
              <span>CRE Verification Data</span>
            </span>
            {showRawData ? (
              <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          <AnimatePresence>
            {showRawData && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-white space-y-3">
                  {/* Workflow ID */}
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-gray-600 dark:text-gray-300 font-semibold">Workflow ID:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-blue-600 font-mono">
                      {match.creResult.workflowId}
                    </code>
                  </div>

                  {/* Weather Data */}
                  <div className="grid grid-cols-3 gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Temperature</div>
                      <div className="text-lg font-bold text-blue-600">
                        {match.creResult.weather.temperature}°C
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Conditions</div>
                      <div className="text-sm font-semibold text-blue-600">
                        {match.creResult.weather.conditions}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Source</div>
                      <div className="text-xs font-semibold text-blue-600">
                        {match.creResult.weather.source}
                      </div>
                    </div>
                  </div>

                  {/* Location Data */}
                  <div className="grid grid-cols-3 gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="col-span-2 text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Location</div>
                      <div className="text-sm font-semibold text-green-600 truncate">
                        {match.creResult.location.region?.split(',').slice(0, 2).join(', ')}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Type</div>
                      <div className={`text-xs font-bold px-2 py-1 rounded inline-block ${
                        match.creResult.location.isPitch
                          ? 'bg-green-200 text-green-700'
                          : 'bg-yellow-200 text-yellow-700'
                      }`}>
                        {match.creResult.location.placeType?.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Confidence Score */}
                  <div className="p-3 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Confidence Score</span>
                      <span className="text-2xl font-black">
                        {match.creResult.confidence}/100
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${match.creResult.confidence}%` }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className={`h-full rounded-full ${
                          match.creResult.confidence >= 90
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : match.creResult.confidence >= 60
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                              : 'bg-gradient-to-r from-red-500 to-rose-500'
                        }`}
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Weather: {match.creResult.weather.verified ? '✓' : '✗'} ({match.creResult.weather.verified ? 40 : 0}%)
                      {' • '}
                      Location: {match.creResult.location.isPitch ? '✓ Stadium' : match.creResult.location.verified ? '✓ Verified' : '✗'} ({match.creResult.location.isPitch ? 60 : match.creResult.location.verified ? 30 : 0}%)
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* CRE Workflow Diagram */}
      {match.creResult && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
            <span className="text-sm font-bold text-gray-800 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>CRE Architecture Visualization</span>
            </span>
          </div>
          <div className="bg-white">
            <CREWorkflowDiagram creResult={match.creResult} />
          </div>
        </div>
      )}
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

        {/* Consensus Progress Bar - Parity with Telegram Mini App */}
        {!consensus.resolved && !consensus.discrepancy && (
          <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <div className="flex items-center gap-1.5">
                <Users className="w-3 h-3" />
                <span>PHX-CON NODE: {match.verifications.length}/4 CAPTAINS</span>
              </div>
              <span>{Math.round((match.verifications.length / 4) * 100)}% CONSENSUS</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(match.verifications.length / 4) * 100}%` }}
                 className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
               />
            </div>
          </div>
        )}

        {/* Yellow Rail Notice */}
        {match.paymentRail && (
          <PaymentRailNotice
            title="Match Fee Settlement"
            assetSymbol={match.paymentRail.assetSymbol}
            enabled={match.paymentRail.enabled}
            mode={match.paymentRail.enabled ? 'shared session' : undefined}
            body={match.paymentRail.enabled 
              ? `Both match fees are locked in Yellow session ${match.paymentRail.sessionId?.slice(0, 8)}. Consensus happens first, then the payout closes the session when the result is final.` 
              : 'This match is using the manual ledger because one or more participants do not have an eligible EVM wallet available for the Yellow off-chain flow.'
            }
          />
        )}

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

        {/* Agentic Analysis */}
        {match.agentInsights && (
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Agent Captain's Analysis: {match.agentInsights.agentName}
              </span>
            </div>
            <p className="text-sm text-gray-700 italic leading-relaxed">
              "{match.agentInsights.report}"
            </p>
            <div className="mt-2 text-[10px] font-mono text-blue-600 flex items-center space-x-2">
              <span className="bg-blue-100 px-1.5 py-0.5 rounded">
                INTENT: {match.agentInsights.decision}
              </span>
              <span>•</span>
              <span className="text-[10px] text-gray-600 dark:text-gray-300">Processed at {new Date(match.agentInsights.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        )}

        {/* Verification List */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Verifications</h4>
          <div className="space-y-2">
            {match.verifications.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-300 italic">No verifications yet</p>
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
                  <span className="text-xs text-gray-600 dark:text-gray-300 capitalize">{v.role}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Trust Score */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Overall Trust Score</span>
            <span className="text-lg font-bold text-blue-600">{match.trustScore || 0}/100</span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${match.trustScore || 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            {match.creResult?.verified
              ? `CRE Verified via ${match.creResult.weather.source} & Geofencing`
              : match.trustScore && match.trustScore >= 75
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
