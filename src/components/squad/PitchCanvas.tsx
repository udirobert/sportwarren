'use client';

import React, { useRef, useCallback, useMemo } from 'react';
import { Download, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { exportElementAsImage } from '@/lib/utils/export';
import { FORMATIONS, ROLE_LABELS } from '@/lib/formations';
import { PitchMarkingsSvg } from './PitchMarkingsSvg';
import type { Formation, Player, PlayerPosition } from '@/types';
import { POSITION_COLORS } from '@/lib/utils';

export interface PitchCanvasProps {
  /** Formation to display */
  formation: Formation;
  /** Player IDs assigned to each position slot */
  lineup: string[];
  /** Player data for resolving names/avatars */
  players: Player[];
  /** Squad name for export filename */
  squadName?: string;
  /** Disable drag-and-drop interactions */
  readOnly?: boolean;
  /** Show export button */
  showExport?: boolean;
  /** Callback when lineup changes via drag-drop */
  onLineupChange?: (lineup: string[]) => void;
  /** Custom callback when export is triggered */
  onExport?: (dataUrl: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** Visual size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional title displayed above pitch */
  title?: string;
  /** Show player names below dots */
  showPlayerNames?: boolean;
  /** Primary color for players (overrides default) */
  primaryColor?: string;
  /** Play style offset strategy */
  playStyle?: string;
  /** Optional pitch markings style overrides (landing hero, etc.) */
  markings?: Partial<{
    stroke: string;
    strokeOpacity: number;
    stripeA: string;
    stripeB: string;
    vignetteOpacity: number;
    lineWeight: number;
  }>;
  /** Optional theme preset for markings and presentation */
  theme?: 'default' | 'hero';
  /** Blur avatars (privacy-friendly export) */
  blurAvatars?: boolean;
  /** Blur radius in px when blurAvatars=true */
  blurRadius?: number;
}

interface PlayerSlotData {
  player?: Player;
  role: string;
  index: number;
}

// Position group styling for visual differentiation on the pitch
const ROLE_GROUPS: Record<string, { ring: string; border: string; label: string }> = {
  GK: { ring: 'ring-2 ring-amber-400/60', border: 'border-amber-400', label: 'GK' },
  CB: { ring: '', border: 'border-sky-400', label: 'DEF' },
  LB: { ring: '', border: 'border-sky-400', label: 'DEF' },
  RB: { ring: '', border: 'border-sky-400', label: 'DEF' },
  LWB: { ring: '', border: 'border-sky-400', label: 'DEF' },
  RWB: { ring: '', border: 'border-sky-400', label: 'DEF' },
  CDM: { ring: '', border: 'border-violet-400', label: 'MID' },
  CM: { ring: '', border: 'border-violet-400', label: 'MID' },
  CAM: { ring: '', border: 'border-violet-400', label: 'MID' },
  LM: { ring: '', border: 'border-violet-400', label: 'MID' },
  RM: { ring: '', border: 'border-violet-400', label: 'MID' },
  ST: { ring: '', border: 'border-rose-400', label: 'FWD' },
  LW: { ring: '', border: 'border-rose-400', label: 'FWD' },
  RW: { ring: '', border: 'border-rose-400', label: 'FWD' },
  CF: { ring: '', border: 'border-rose-400', label: 'FWD' },
};

const DEFAULT_ROLE_GROUP = { ring: '', border: 'border-white/50', label: '' };

// FIFA standard pitch ratio: 68m width × 105m length = 68:105
// Using aspect-ratio with max-height ensures proper scaling at all viewport sizes
const SIZE_CONFIG = {
  sm: { container: 'aspect-[68/105] max-h-[min(70vh,600px)]', dot: 'w-7 h-7', text: 'text-[8px]', nameText: 'text-[8px]' },
  md: { container: 'aspect-[68/105] max-h-[min(75vh,700px)]', dot: 'w-10 h-10', text: 'text-[10px]', nameText: 'text-xs' },
  lg: { container: 'aspect-[68/105] max-h-[min(80vh,800px)]', dot: 'w-12 h-12', text: 'text-xs', nameText: 'text-sm' },
};

/**
 * Strategy-based coordinate offsets for play styles
 */
const PLAY_STYLE_OFFSETS: Record<string, { x?: number; y?: number; roleFilter?: string[] }> = {
  attacking: { y: -10, roleFilter: ['ST', 'LW', 'RW', 'CAM', 'CM', 'LM', 'RM'] },
  defensive: { y: 10, roleFilter: ['CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM'] },
  counter: { y: 15, roleFilter: ['CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM'] },
  possession: { y: -5, roleFilter: ['CM', 'CAM', 'CDM', 'LM', 'RM'] },
  high_press: { y: -15, roleFilter: ['ST', 'LW', 'RW', 'CAM', 'CM', 'LM', 'RM'] },
  low_block: { y: 20, roleFilter: ['CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM'] },
};

/**
 * PitchCanvas - Reusable pitch visualization component
 * 
 * Renders a football pitch with player positions based on formation.
 * Supports avatars (with initials fallback), drag-and-drop, and image export.
 * 
 * Used by:
 * - TacticsBoard (formation editor)
 * - TelegramSquadDashboard (mini app preview)
 * - MatchEnginePreview (match visualization)
 */
export const PitchCanvas: React.FC<PitchCanvasProps> = ({
  formation,
  lineup,
  players,
  squadName = 'lineup',
  readOnly = false,
  showExport = false,
  onLineupChange,
  onExport,
  className = '',
  size = 'md',
  title,
  showPlayerNames = false,
  primaryColor,
  playStyle = 'balanced',
  markings,
  theme = 'default',
  blurAvatars = false,
  blurRadius = 3,
}) => {
  const pitchRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  const formationPositions = FORMATIONS[formation];
  const playerById = useMemo(() => {
    const map = new Map<string, Player>();
    players.forEach((p) => map.set(p.id, p));
    return map;
  }, [players]);

  const slots: PlayerSlotData[] = useMemo(() => {
    return formationPositions.map((pos, idx) => ({
      player: lineup[idx] ? playerById.get(lineup[idx]) : undefined,
      role: pos.role,
      index: idx,
    }));
  }, [formationPositions, lineup, playerById]);

  const sizeConfig = SIZE_CONFIG[size];

  /**
   * Get display content for a player slot
   * Priority: Avatar image → Initials → Role abbreviation
   * Uses position-group styling for visual differentiation
   */
  const getSlotDisplay = (slot: PlayerSlotData): { content: React.ReactNode; bgClass: string; borderClass: string; ringClass: string; style?: React.CSSProperties } => {
    const roleGroup = ROLE_GROUPS[slot.role] || DEFAULT_ROLE_GROUP;

    if (slot.player) {
      const initials = slot.player.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const hasAvatar = 'avatar' in slot.player && slot.player.avatar;

      return {
        content: hasAvatar ? (
          <img
            src={slot.player.avatar as string}
            alt={slot.player.name}
            className="w-full h-full rounded-full object-cover"
            style={blurAvatars ? { filter: `blur(${Math.max(1, Math.min(12, blurRadius))}px)` } : undefined}
          />
        ) : (
          <span className={`${sizeConfig.text} font-bold text-white`}>{initials}</span>
        ),
        bgClass: 'bg-gray-900',
        borderClass: roleGroup.border,
        ringClass: roleGroup.ring,
        style: primaryColor ? { backgroundColor: primaryColor } : undefined,
      };
    }

    return {
      content: <span className={`${sizeConfig.text} font-bold text-green-700`}>{slot.role}</span>,
      bgClass: 'bg-white',
      borderClass: 'border-green-500',
      ringClass: '',
    };
  };

  /**
   * Handle drag start from player list
   */
  const handlePlayerDragStart = (e: React.DragEvent, playerId: string) => {
    if (readOnly) return;
    e.dataTransfer.setData('application/sportwarren-player', JSON.stringify({ playerId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  /**
   * Handle drag start from an assigned slot (moving existing player)
   */
  const handleSlotDragStart = (e: React.DragEvent, slotIndex: number, playerId: string) => {
    if (readOnly) return;
    e.dataTransfer.setData(
      'application/sportwarren-player',
      JSON.stringify({ playerId, fromSlot: slotIndex })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  /**
   * Handle drop on a slot
   */
  const handleSlotDrop = useCallback(
    (e: React.DragEvent, slotIndex: number) => {
      if (readOnly || !onLineupChange) return;
      e.preventDefault();

      try {
        const raw = e.dataTransfer.getData('application/sportwarren-player');
        if (!raw) return;
        const payload = JSON.parse(raw) as { playerId?: string; fromSlot?: number };

        // Moving within slots - swap or clear source
        if (payload.fromSlot !== undefined && payload.fromSlot === slotIndex) {
          return; // Dropped on same slot
        }

        const newLineup = [...lineup];

        // If coming from another slot, clear that slot
        if (payload.fromSlot !== undefined) {
          newLineup[payload.fromSlot] = '';
        }

        // If target slot has a player and we're dragging from another slot, swap
        const targetPlayer = newLineup[slotIndex];
        if (targetPlayer && payload.fromSlot !== undefined) {
          newLineup[payload.fromSlot] = targetPlayer;
        }

        // Place player in new slot
        if (payload.playerId) {
          // Remove from any other slot (prevent duplicates)
          const existingIndex = newLineup.findIndex((id) => id === payload.playerId);
          if (existingIndex >= 0 && existingIndex !== slotIndex) {
            newLineup[existingIndex] = '';
          }
          newLineup[slotIndex] = payload.playerId;
        }

        onLineupChange(newLineup);
      } catch {
        // Invalid drop payload, ignore
      }
    },
    [lineup, onLineupChange, readOnly]
  );

  /**
   * Handle drag over (required for drop to work)
   */
  const handleDragOver = (e: React.DragEvent) => {
    if (!readOnly) {
      e.preventDefault();
    }
  };

  /**
   * Export pitch as image
   */
  const handleExport = async () => {
    if (!pitchRef.current) return;
    setIsExporting(true);

    try {
      const success = await exportElementAsImage(
        pitchRef.current,
        `${squadName.toLowerCase().replace(/\s+/g, '-')}-lineup`,
        'png'
      );

      // Note: exportElementAsImage triggers download automatically
      // onExport callback is for additional handling if needed
      if (success && onExport) {
        onExport(''); // Callback only - image already downloaded
      }
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Share via native share API if available
   */
  const handleShare = async () => {
    if (!pitchRef.current) return;

    try {
      // Use html-to-image directly for sharing (we need the data URL)
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(pitchRef.current, { quality: 0.95, cacheBust: true });

      // Convert data URL to blob for sharing
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'lineup.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${squadName} Lineup`,
          text: `Check out our ${formation} formation!`,
          files: [file],
        });
      } else {
        // Fallback: download the image
        const link = document.createElement('a');
        link.download = `${squadName.toLowerCase().replace(/\s+/g, '-')}-lineup.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch {
      // Share failed, ignore
    }
  };

  const assignedCount = lineup.filter(Boolean).length;
  const totalSlots = formationPositions.length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with title and export */}
      {(title || showExport) && (
        <div className="flex items-center justify-between">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          )}
          {showExport && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={isExporting}
                className="text-xs"
              >
                {isExporting ? (
                  <span className="animate-pulse">Exporting...</span>
                ) : (
                  <>
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="text-xs"
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Formation Badge */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{formation}</span>
        <span className="text-gray-500">
          {assignedCount}/{totalSlots - 1} outfield + GK
        </span>
      </div>

      {/* Pitch Container */}
      <div
        ref={pitchRef}
        className={`relative bg-gradient-to-b from-green-600 to-green-700 rounded-xl overflow-hidden ${sizeConfig.container}`}
      >
        {/* Pitch Markings (SVG, true-to-scale) */}
        {(() => {
          const heroPreset = theme === 'hero' ? {
            stroke: tintStroke(primaryColor ?? '#10b981'),
            strokeOpacity: 0.95,
            stripeA: 'rgba(255,255,255,0.07)',
            stripeB: 'rgba(0,0,0,0.11)',
            vignetteOpacity: 0.18,
            lineWeight: 2.0,
            // Keep vertical orientation to match player coordinates
            orientation: 'vertical' as const,
            desaturateOpacity: 0.06,
          } : {} as Partial<{
            stroke: string;
            strokeOpacity: number;
            stripeA: string;
            stripeB: string;
            vignetteOpacity: number;
            lineWeight: number;
            orientation: 'vertical' | 'horizontal';
            desaturateOpacity: number;
          }>;
          const eff = { ...heroPreset, ...markings } as Required<{
            stroke: string; strokeOpacity: number; stripeA: string; stripeB: string; vignetteOpacity: number; lineWeight: number; orientation: 'vertical'|'horizontal'; desaturateOpacity: number;
          }>;
          return (
            <PitchMarkingsSvg
              className="absolute inset-0"
              stroke={eff.stroke ?? 'rgba(255,255,255,0.6)'}
              strokeOpacity={eff.strokeOpacity ?? 0.9}
              stripeA={eff.stripeA ?? 'rgba(255,255,255,0.02)'}
              stripeB={eff.stripeB ?? 'rgba(0,0,0,0.03)'}
              vignetteOpacity={eff.vignetteOpacity ?? 0.14}
              lineWeight={eff.lineWeight ?? 1.6}
              orientation={eff.orientation ?? 'vertical'}
              desaturateOpacity={eff.desaturateOpacity ?? 0}
            />
          );
        })()}

        {/* Player Positions */}
        {slots.map((slot, idx) => {
          const pos = formationPositions[idx];
          const display = getSlotDisplay(slot);
          const player = slot.player;

          // Apply play style offsets
          let offsetX = 0;
          let offsetY = 0;
          const styleConfig = PLAY_STYLE_OFFSETS[playStyle];
          
          if (styleConfig && (!styleConfig.roleFilter || styleConfig.roleFilter.includes(pos.role))) {
            if (styleConfig.x) offsetX = styleConfig.x;
            if (styleConfig.y) offsetY = styleConfig.y;
          }

          return (
            <motion.div
              key={`${formation}-${idx}`}
              layout
              initial={{ left: `${pos.x}%`, top: `${pos.y}%`, opacity: 0 }}
              animate={{ 
                left: `${pos.x + offsetX}%`, 
                top: `${pos.y + offsetY}%`, 
                opacity: 1 
              }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 30,
                layout: { duration: 0.3 }
              }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              onDragOver={handleDragOver}
              onDrop={(e) => handleSlotDrop(e, idx)}
            >
              {/* Ground shadow beneath player dot */}
              <div
                className={`
                  absolute left-1/2 -translate-x-1/2 rounded-full bg-black/30 blur-sm
                  ${size === 'sm' ? 'w-8 h-2 top-[calc(100%+2px)]' : size === 'lg' ? 'w-14 h-3 top-[calc(100%+3px)]' : 'w-11 h-2.5 top-[calc(100%+2px)]'}
                `}
                aria-hidden="true"
              />
              {/* Player Dot */}
              <div
                draggable={!readOnly && !!player}
                onDragStart={(e) => player && handleSlotDragStart(e, idx, player.id)}
                className={`
                  ${sizeConfig.dot} rounded-full flex items-center justify-center 
                  shadow-lg border-2 cursor-pointer
                  transition-transform hover:scale-110
                  ${display.bgClass} ${display.borderClass} ${display.ringClass}
                  ${readOnly ? '' : 'cursor-grab active:cursor-grabbing'}
                `}
                style={{
                  ...display.style,
                  // Subtle hero glow for landing/hero theme
                  filter: theme === 'hero' ? `drop-shadow(0 0 12px ${primaryColor ? hexToRgba(primaryColor, 0.35) : 'rgba(16,185,129,0.35)'} )` : undefined,
                }}
                title={player ? player.name : ROLE_LABELS[slot.role]}
              >
                {display.content}
              </div>

              {/* Player Name (optional) */}
              {showPlayerNames && player && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                  <span className={`${sizeConfig.nameText} font-medium text-white bg-black/60 px-1.5 py-0.5 rounded`}>
                    {player.name.split(' ')[0]}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Unassigned Players Pool (for drag source) */}
      {!readOnly && players.length > 0 && (
        <div className="pt-2">
          <p className="text-xs text-gray-500 mb-2">Drag players to positions:</p>
          <div className="flex flex-wrap gap-2">
            {players.map((player) => {
              const isAssigned = lineup.includes(player.id);
              const positionColor = POSITION_COLORS[player.position as PlayerPosition] || 'bg-gray-100 text-gray-700';

              return (
                <div
                  key={player.id}
                  draggable={!isAssigned}
                  onDragStart={(e) => handlePlayerDragStart(e, player.id)}
                  className={`
                    flex items-center gap-2 px-2.5 py-1.5 rounded-full border text-xs
                    transition-opacity
                    ${isAssigned ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-200' : 'cursor-grab bg-white border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${positionColor}`}>
                    {player.position}
                  </span>
                  <span className="text-gray-700">{player.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PitchCanvas;

// Utilities
function hexToRgba(hex: string, alpha = 1): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return `rgba(16,185,129,${alpha})`;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function mixWithWhite(hex: string, amount = 0.12): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim()) || ['','#10','#b9','#81'];
  const r = parseInt(m[1] || '10', 16);
  const g = parseInt(m[2] || 'b9', 16);
  const b = parseInt(m[3] || '81', 16);
  const nr = Math.round(r + (255 - r) * amount);
  const ng = Math.round(g + (255 - g) * amount);
  const nb = Math.round(b + (255 - b) * amount);
  return `rgb(${nr},${ng},${nb})`;
}

function tintStroke(primary: string): string {
  // Slightly tint the stroke towards the team color, keep it bright
  try { return mixWithWhite(primary, 0.2); } catch { return 'rgb(240,240,240)'; }
}
