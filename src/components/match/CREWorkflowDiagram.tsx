"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, MapPin, Cpu, Database, CheckCircle, XCircle, Clock, Link as LinkIcon } from 'lucide-react';
import type { MatchVerificationResult } from '@/server/services/blockchain/cre/match-verification';

interface CREWorkflowDiagramProps {
  creResult?: MatchVerificationResult | null;
  isLoading?: boolean;
}

interface OracleNodeProps {
  icon: React.ReactNode;
  label: string;
  source: string;
  status: 'success' | 'pending' | 'error';
  data?: string;
  delay?: number;
}

const OracleNode: React.FC<OracleNodeProps> = ({ 
  icon, 
  label, 
  source, 
  status, 
  data,
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`relative p-4 rounded-xl border-2 transition-all ${
        status === 'success' 
          ? 'bg-green-50 border-green-500 shadow-lg shadow-green-500/20' 
          : status === 'pending'
            ? 'bg-yellow-50 border-yellow-500 animate-pulse'
            : 'bg-red-50 border-red-500'
      }`}
    >
      {/* Status indicator */}
      <div className="absolute -top-3 -right-3">
        {status === 'success' && (
          <CheckCircle className="w-6 h-6 text-green-600 fill-green-100" />
        )}
        {status === 'pending' && (
          <Clock className="w-6 h-6 text-yellow-600 animate-spin" />
        )}
        {status === 'error' && (
          <XCircle className="w-6 h-6 text-red-600 fill-red-100" />
        )}
      </div>

      {/* Icon */}
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
        status === 'success' 
          ? 'bg-green-500' 
          : status === 'pending'
            ? 'bg-yellow-500'
            : 'bg-red-500'
      }`}>
        {React.cloneElement(icon as React.ReactElement, {
          className: 'w-6 h-6 text-white'
        })}
      </div>

      {/* Label */}
      <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
        {label}
      </div>

      {/* Source */}
      <div className="text-xs text-gray-500 mb-2">{source}</div>

      {/* Data */}
      {data && (
        <div className="text-sm font-mono text-gray-800 bg-white/50 rounded p-2">
          {data}
        </div>
      )}

      {/* Connection line */}
      <div className="absolute -bottom-8 left-1/2 w-0.5 h-8 bg-gradient-to-b from-gray-400 to-transparent" />
    </motion.div>
  );
};

interface ConsensusNodeProps {
  confidence: number;
  weatherWeight: number;
  locationWeight: number;
  delay?: number;
}

const ConsensusNode: React.FC<ConsensusNodeProps> = ({ 
  confidence, 
  weatherWeight = 40,
  locationWeight = 60,
  delay = 0 
}) => {
  const getStatusColor = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-600';
  };

  const getStatusText = (score: number) => {
    if (score >= 90) return 'HIGH CONFIDENCE';
    if (score >= 60) return 'MODERATE';
    return 'LOW CONFIDENCE';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-2xl"
    >
      {/* Cpu Icon */}
      <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
        <Cpu className="w-5 h-5 text-white" />
      </div>

      {/* Title */}
      <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">
        CRE Consensus Engine
      </div>

      {/* Confidence Score */}
      <div className="text-center mb-4">
        <div className={`text-5xl font-black bg-gradient-to-r ${getStatusColor(confidence)} bg-clip-text text-transparent`}>
          {confidence}
        </div>
        <div className="text-xs text-gray-400 uppercase tracking-wider">/ 100 Trust Score</div>
      </div>

      {/* Weight breakdown */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Weather</span>
          <span className="font-mono">{weatherWeight}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${weatherWeight}%` }}
            transition={{ delay: delay + 0.3, duration: 0.5 }}
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
          />
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Location</span>
          <span className="font-mono">{locationWeight}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${locationWeight}%` }}
            transition={{ delay: delay + 0.5, duration: 0.5 }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>
      </div>

      {/* Status badge */}
      <div className={`text-center py-2 rounded-lg bg-gradient-to-r ${getStatusColor(confidence)} font-bold text-xs uppercase tracking-wider`}>
        {getStatusText(confidence)}
      </div>

      {/* Connection line to settlement */}
      <div className="absolute -bottom-8 left-1/2 w-0.5 h-8 bg-gradient-to-b from-gray-500 to-transparent" />
    </motion.div>
  );
};

interface SettlementNodeProps {
  workflowId?: string;
  txId?: string;
  status: 'pending' | 'settled';
  chain?: string;
  delay?: number;
}

const SettlementNode: React.FC<SettlementNodeProps> = ({
  workflowId,
  txId,
  status,
  chain = 'Algorand',
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`relative p-4 rounded-xl border-2 ${
        status === 'settled'
          ? 'bg-purple-50 border-purple-500 shadow-lg shadow-purple-500/20'
          : 'bg-gray-50 border-gray-400'
      }`}
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
        status === 'settled' ? 'bg-purple-500' : 'bg-gray-400'
      }`}>
        <Database className="w-6 h-6 text-white" />
      </div>

      {/* Label */}
      <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
        On-Chain Settlement
      </div>

      {/* Chain */}
      <div className="text-xs text-purple-600 font-semibold mb-2">{chain}</div>

      {/* Workflow ID */}
      {workflowId && (
        <div className="space-y-1">
          <div className="text-xs text-gray-500 flex items-center space-x-1">
            <LinkIcon className="w-3 h-3" />
            <span>Workflow ID:</span>
          </div>
          <div className="text-xs font-mono bg-white/50 rounded px-2 py-1 truncate">
            {workflowId}
          </div>
        </div>
      )}

      {/* Transaction ID */}
      {txId && (
        <div className="mt-2 text-xs text-gray-500 font-mono truncate">
          Tx: {txId.slice(0, 10)}...{txId.slice(-8)}
        </div>
      )}

      {/* Status */}
      {status === 'settled' && (
        <div className="mt-2 flex items-center justify-center space-x-1 text-green-600 text-xs font-bold uppercase">
          <CheckCircle className="w-3 h-3" />
          <span>Settled</span>
        </div>
      )}
    </motion.div>
  );
};

export const CREWorkflowDiagram: React.FC<CREWorkflowDiagramProps> = ({
  creResult,
  isLoading = false
}) => {
  // Determine oracle statuses
  const weatherStatus = creResult
    ? creResult.weather.verified ? 'success' : 'error'
    : isLoading ? 'pending' : 'error';
  
  const locationStatus = creResult
    ? creResult.location.verified ? 'success' : 'error'
    : isLoading ? 'pending' : 'error';

  const settlementStatus = creResult && creResult.verified ? 'settled' : 'pending';

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Title */}
      <div className="text-center mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Chainlink CRE Verification Workflow
        </h3>
        <p className="text-sm text-gray-500">
          Real-world data → Consensus → On-chain settlement
        </p>
      </div>

      {/* Workflow Diagram */}
      <div className="relative">
        {/* Oracle Layer */}
        <div className="grid grid-cols-2 gap-8 mb-16">
          <OracleNode
            icon={<Cloud />}
            label="Weather Oracle"
            source={creResult?.weather.source || 'Open-Meteo'}
            status={weatherStatus as any}
            data={creResult?.weather.verified 
              ? `${creResult.weather.temperature}°C, ${creResult.weather.conditions}`
              : undefined
            }
            delay={0.2}
          />

          <OracleNode
            icon={<MapPin />}
            label="Location Oracle"
            source="OpenStreetMap"
            status={locationStatus as any}
            data={creResult?.location.verified
              ? creResult.location.placeType
              : undefined
            }
            delay={0.4}
          />
        </div>

        {/* Connection lines */}
        <div className="absolute top-32 left-1/4 w-0.5 h-8 bg-gray-300" />
        <div className="absolute top-32 right-1/4 w-0.5 h-8 bg-gray-300" />
        <div className="absolute top-40 left-1/4 w-[50%] h-0.5 bg-gray-300" />
        <div className="absolute top-40 right-1/4 w-[50%] h-0.5 bg-gray-300" />
        <div className="absolute top-40 left-1/2 w-0.5 h-8 bg-gray-300 -translate-x-1/2" />

        {/* Consensus Layer */}
        <div className="flex justify-center mb-16">
          <ConsensusNode
            confidence={creResult?.confidence || 0}
            delay={0.6}
          />
        </div>

        {/* Connection line */}
        <div className="absolute top-[28rem] left-1/2 w-0.5 h-8 bg-gray-300 -translate-x-1/2" />

        {/* Settlement Layer */}
        <div className="flex justify-center">
          <SettlementNode
            workflowId={creResult?.workflowId}
            txId={undefined}
            status={settlementStatus}
            delay={0.8}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-12 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
          How It Works
        </h4>
        <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">1</span>
            </div>
            <div>
              <div className="font-semibold">Data Fetch</div>
              <div>Parallel oracle calls fetch weather & location</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 rounded bg-gray-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">2</span>
            </div>
            <div>
              <div className="font-semibold">Consensus</div>
              <div>Weighted scoring (40% weather / 60% location)</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 rounded bg-purple-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">3</span>
            </div>
            <div>
              <div className="font-semibold">Settlement</div>
              <div>Workflow ID recorded on-chain</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
