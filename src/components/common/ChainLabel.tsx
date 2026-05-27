"use client";

import React from "react";
import { Shield, Zap, Wallet, Globe, Hexagon, type LucideIcon } from "lucide-react";

export type ChainId = "algorand" | "goat" | "kite" | "ton" | "yellow" | "lens";

interface ChainInfo {
  label: string;
  icon: LucideIcon;
  description: string;
  color: string;
}

const CHAIN_REGISTRY: Record<ChainId, ChainInfo> = {
  algorand: {
    label: "Verification Network",
    icon: Shield,
    description: "Secure match result verification and reputation records",
    color: "text-sky-600 dark:text-sky-400",
  },
  goat: {
    label: "Governance Chain",
    icon: Hexagon,
    description: "Bitcoin-secured squad DAOs, asset escrow, and global reputation via BitVM2",
    color: "text-orange-600 dark:text-orange-400",
  },
  kite: {
    label: "Agent Network",
    icon: Zap,
    description: "Autonomous AI agent identity, commerce, and attestations",
    color: "text-purple-600 dark:text-purple-400",
  },
  ton: {
    label: "Treasury Network",
    icon: Wallet,
    description: "Telegram-native wallet and squad treasury operations",
    color: "text-blue-600 dark:text-blue-400",
  },
  yellow: {
    label: "Settlement Rail",
    icon: Zap,
    description: "Instant operational payments between squad members",
    color: "text-amber-600 dark:text-amber-400",
  },
  lens: {
    label: "Social Layer",
    icon: Globe,
    description: "Portable social identity and match highlights",
    color: "text-green-600 dark:text-green-400",
  },
};

interface ChainLabelProps {
  chain: ChainId;
  showTechnical?: boolean;
  variant?: "inline" | "badge" | "tooltip";
  className?: string;
}

const TECHNICAL_NAMES: Record<ChainId, string> = {
  algorand: "Algorand",
  goat: "GOAT Network",
  kite: "Kite AI",
  ton: "TON",
  yellow: "Yellow",
  lens: "Lens",
};

export function ChainLabel({ chain, showTechnical = false, variant = "inline", className = "" }: ChainLabelProps) {
  const info = CHAIN_REGISTRY[chain];
  if (!info) return null;

  const Icon = info.icon;
  const displayName = showTechnical ? TECHNICAL_NAMES[chain] : info.label;

  if (variant === "badge") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${info.color} bg-current/10 ${className}`}
        title={showTechnical ? info.description : `${TECHNICAL_NAMES[chain]} — ${info.description}`}
      >
        <Icon className="w-3 h-3" />
        {displayName}
      </span>
    );
  }

  if (variant === "tooltip") {
    return (
      <span
        className={`group relative inline-flex items-center gap-1.5 ${className}`}
      >
        <Icon className={`w-3.5 h-3.5 ${info.color}`} />
        <span className="text-xs font-semibold">{displayName}</span>
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap shadow-lg z-50">
          {showTechnical ? info.description : `${TECHNICAL_NAMES[chain]}: ${info.description}`}
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} title={showTechnical ? info.description : `${TECHNICAL_NAMES[chain]} — ${info.description}`}>
      <Icon className={`w-3.5 h-3.5 ${info.color}`} />
      <span className="text-xs font-semibold">{displayName}</span>
      {!showTechnical && (
        <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono">({TECHNICAL_NAMES[chain]})</span>
      )}
    </span>
  );
}

export function getChainLabel(chain: ChainId, showTechnical?: boolean): string {
  if (showTechnical) return TECHNICAL_NAMES[chain];
  return CHAIN_REGISTRY[chain]?.label || chain;
}
