"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PitchCanvas } from '@/components/squad/PitchCanvas';
import { FORMATIONS, PLAY_STYLE_LABELS, getFormationsBySquadSize, getDefaultFormationForSize } from '@/lib/formations';
import type { Formation, PlayStyle, SquadSize } from '@/types';
import { useSearchParams } from 'next/navigation';
import { trackCoreGrowthEvent, trackFeatureUsed } from '@/lib/analytics';
import { 
  Shield, Zap, Share2, Sparkles, ChevronRight, ChevronLeft,
  Check, UserPlus, Maximize2, Minimize2, EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WaitlistForm } from '@/components/common/WaitlistForm';
import { usePitchPersonalization } from '@/hooks/pitch/usePitchPersonalization';
import { usePitchExport } from '@/hooks/pitch/usePitchExport';
import { useImageUploader } from '@/hooks/pitch/useImageUploader';
import {
  DEFAULT_PLAYER_NAMES, SQUAD_SIZES, PLAY_STYLES, POSITIONS_BY_SQUAD_SIZE,
  PITCH_THEMES, SQUAD_COLORS, DEMO_INITIALS, QUICK_GUIDE_STEPS,
} from '@/lib/pitch.constants';
import { PlayerEditor } from './pitch/PlayerEditor';
import { SquadCreationModal } from './pitch/SquadCreationModal';
import { ExportSettings } from './pitch/ExportSettings';

export const InteractiveMatchPreview: React.FC = () => {
  const searchParams = useSearchParams();
  const [squadCount, setSquadCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/platform/stats')
      .then(res => res.json())
      .then(data => setSquadCount(data.waitlistTotal ?? 0))
      .catch(() => setSquadCount(null));
  }, []);

  // Core tactic state
  const [squadSize, setSquadSize] = useState<SquadSize>(() => {
    const size = searchParams.get('size');
    if (size && ['5', '6', '7', '11'].includes(size)) return parseInt(size) as SquadSize;
    return 11;
  });
  const [formation, setFormation] = useState<Formation>((searchParams.get('formation') as Formation) || '4-4-2');
  const [playStyle, setPlayStyle] = useState<PlayStyle>((searchParams.get('style') as PlayStyle) || 'balanced');
  const [pitchTheme, setPitchTheme] = useState<string>('premier-league');
  const [primaryColor, setPrimaryColor] = useState(searchParams.get('color') || '#10b981');

  // UI state
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showSquadModal, setShowSquadModal] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const [fsOverlay, setFsOverlay] = useState(false);
  const supportsFs = typeof document !== 'undefined' && typeof (document as any).fullscreenEnabled !== 'undefined';

  // Refs
  const pitchRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);

  // Extracted hooks
  const personalization = usePitchPersonalization(formation);
  const exportHook = usePitchExport();
  const { handleFileInput: handleAvatarUpload } = useImageUploader(256);

  // Initialize names/avatars on squad size change
  useEffect(() => {
    personalization.initDefaults(squadSize);
  }, [squadSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // URL sync
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('formation', formation);
    params.set('style', playStyle);
    params.set('color', primaryColor);
    params.set('size', squadSize.toString());
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  }, [formation, playStyle, primaryColor, squadSize]);

  // Formations list
  const formationList = useMemo(() => getFormationsBySquadSize(squadSize), [squadSize]);
  const formationIndex = useMemo(() => formationList.indexOf(formation), [formationList, formation]);

  // Fullscreen listener
  useEffect(() => {
    const onFs = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // Formation navigation
  const nextFormation = useCallback(() => {
    if (!formationList.length) return;
    const next = formationList[(Math.max(0, formationIndex) + 1) % formationList.length];
    setFormation(next);
    trackFeatureUsed('tactics_preview_change', { type: 'formation', value: next });
  }, [formationList, formationIndex]);

  const prevFormation = useCallback(() => {
    if (!formationList.length) return;
    const prev = formationList[(Math.max(0, formationIndex) - 1 + formationList.length) % formationList.length];
    setFormation(prev);
    trackFeatureUsed('tactics_preview_change', { type: 'formation', value: prev });
  }, [formationList, formationIndex]);

  const handleSquadSizeChange = useCallback((newSize: SquadSize) => {
    setSquadSize(newSize);
    setFormation(getDefaultFormationForSize(newSize));
    trackFeatureUsed('tactics_preview_change', { type: 'squadSize', value: newSize.toString() });
  }, []);

  // Share logic
  const handleShare = useCallback(async () => {
    if (!pitchRef.current) return;
    trackFeatureUsed('tactics_preview_share_click', { formation, style: playStyle });
    try {
      const { toPng } = await import('html-to-image');
      const pxr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
      const dataUrl = await toPng(pitchRef.current, { quality: 0.95, cacheBust: true, pixelRatio: pxr, backgroundColor: '#0b1322' });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'tactics.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My SportWarren Tactics',
          text: `Check out my ${formation} setup! Join me on SportWarren.`,
          files: [file],
        });
        trackCoreGrowthEvent('opponent_verification_invite_shared', { method: 'web_share_api', type: 'tactics_preview' });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareSuccess(true);
        trackCoreGrowthEvent('opponent_verification_invite_shared', { method: 'clipboard_copy', type: 'tactics_preview' });
        setTimeout(() => setShowShareSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  }, [formation, playStyle]);

  // Share with temporary state toggle (DRY: replaces shareWithNames + shareWithNamesAndBlur)
  const shareWithTemporaryState = useCallback(async (
    overrides: Partial<{ showNames: boolean; blurFaces: boolean }>,
    preset: string,
  ) => {
    const prevShow = personalization.showNames;
    const prevBlur = personalization.blurFaces;
    if (overrides.showNames !== undefined) personalization.setShowNames(overrides.showNames);
    if (overrides.blurFaces !== undefined) personalization.setBlurFaces(overrides.blurFaces);
    await new Promise(r => requestAnimationFrame(() => r(null)));
    await new Promise(r => requestAnimationFrame(() => r(null)));
    await handleShare();
    personalization.setShowNames(prevShow);
    personalization.setBlurFaces(prevBlur);
    trackFeatureUsed('tactics_share_preset', { preset, formation, style: playStyle, blurred: overrides.blurFaces ?? prevBlur });
  }, [personalization, handleShare, formation, playStyle]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareSuccess(true);
      setTimeout(() => setShowShareSuccess(false), 1500);
    } catch (e) {
      console.error('Failed to copy link', e);
    }
  }, []);

  // Mock lineup
  const lineup = useMemo(
    () => ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].slice(0, FORMATIONS[formation].length),
    [formation],
  );

  const mockPlayersForSize = useMemo(() => {
    const positions = POSITIONS_BY_SQUAD_SIZE[squadSize];
    return [...DEFAULT_PLAYER_NAMES].slice(0, squadSize).map((name, i) => ({
      id: String(i + 1),
      name,
      position: positions[i],
      status: 'available' as const,
      address: `0x${i + 1}`,
    }));
  }, [squadSize]);

  const pitchPlayers = useMemo(
    () => mockPlayersForSize.map((p, i) => ({
      ...p,
      name: personalization.names[i] || p.name,
      avatar: personalization.avatars[i] || (p as any).avatar,
      position: p.position as any,
    })),
    [mockPlayersForSize, personalization.names, personalization.avatars],
  );

  const handlePlayerSelect = useCallback((idx: number) => {
    personalization.setSelectedSlotIndex(idx === personalization.selectedSlotIndex ? undefined : idx);
  }, [personalization]);

  const handleEditorNameChange = useCallback((index: number, name: string) => {
    personalization.setNames(prev => { const n = [...prev]; n[index] = name; return n; });
  }, [personalization]);

  const handleEditorAvatarChange = useCallback((index: number, dataUrl: string) => {
    personalization.setAvatars(prev => { const n = [...prev]; n[index] = dataUrl; return n; });
  }, [personalization]);

  const handleEditorClear = useCallback((index: number) => {
    personalization.setNames(prev => { const n = [...prev]; n[index] = ''; return n; });
    personalization.setAvatars(prev => { const n = [...prev]; n[index] = null; return n; });
  }, [personalization]);

  // AI insight text
  const aiInsight = useMemo(() => {
    if ((playStyle as string) === 'attacking') return "High defensive line will squeeze the pitch — force turnovers in their half.";
    if ((playStyle as string) === 'defensive') return "Deep block makes you impossible to break down — frustrate and counter.";
    if (playStyle === 'counter') return "Sprinting into space on the transition is key — exploit the gaps they leave.";
    if (formation === '4-3-3') return "Aggressive width will stretch their defense — create overloads on the flanks.";
    if (formation === '4-4-2') return "Solid structure, perfect for balanced play — control the middle third.";
    return "Highly specialized setup for technical dominance — own the ball, own the game.";
  }, [playStyle, formation]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (supportsFs) {
      if (!document.fullscreenElement) pitchRef.current?.requestFullscreen?.();
      else document.exitFullscreen?.();
    } else {
      setFsOverlay(v => !v);
    }
  }, [supportsFs]);

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-0">
      <Card className="relative bg-gray-950/80 border-white/[0.08] backdrop-blur-xl overflow-hidden shadow-2xl shadow-green-500/5">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/60 to-transparent" />
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left: Pitch Preview */}
          <div ref={leftPanelRef} className="p-5 sm:p-6 border-b md:border-b-0 md:border-r border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-green-400 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Tactical Setup
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              </h3>
              <div className="flex items-center gap-0.5 bg-white/[0.04] rounded-lg p-0.5">
                <Button variant="ghost" size="sm" onClick={prevFormation} className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-md">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <span className="text-xs font-mono font-bold text-white w-14 text-center tabular-nums">{formation}</span>
                <Button variant="ghost" size="sm" onClick={nextFormation} className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10 rounded-md">
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Squad Size — Segmented Pills */}
            <div className="mb-4">
              <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/50 mb-1.5 block">Squad Size</label>
              <div className="inline-flex bg-white/[0.04] rounded-lg p-0.5 gap-0.5">
                {SQUAD_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSquadSizeChange(size)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      squadSize === size
                        ? 'bg-green-500/25 text-green-300 shadow-sm shadow-green-500/20'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {size}v{size}
                  </button>
                ))}
              </div>
            </div>

            <div ref={pitchRef} className="rounded-xl overflow-hidden shadow-2xl">
              <PitchCanvas
                formation={formation}
                lineup={lineup}
                players={pitchPlayers}
                size="sm"
                readOnly={true}
                className="bg-transparent"
                primaryColor={primaryColor}
                playStyle={playStyle}
                theme="hero"
                showPlayerNames={personalization.showNames}
                blurAvatars={personalization.blurFaces}
                selectedSlotIndex={personalization.selectedSlotIndex}
                onPlayerSelect={handlePlayerSelect}
              />
            </div>
            
            {personalization.selectedSlotIndex !== undefined && (
              <PlayerEditor
                formation={formation}
                selectedSlotIndex={personalization.selectedSlotIndex}
                names={personalization.names}
                avatars={personalization.avatars}
                onNameChange={handleEditorNameChange}
                onAvatarChange={handleEditorAvatarChange}
                onClear={handleEditorClear}
                onClose={() => personalization.setSelectedSlotIndex(undefined)}
              />
            )}
            
            {/* AI Insight — Commentator Ticker */}
            <div className="mt-4 rounded-xl overflow-hidden border border-green-500/20 bg-gradient-to-r from-green-500/10 via-green-500/5 to-emerald-500/10">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border-b border-green-500/15">
                <Sparkles className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-green-400">AI Insight</span>
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              </div>
              <p className="px-3 py-2.5 text-sm text-green-100/90 font-medium leading-relaxed">{aiInsight}</p>
            </div>
          </div>

          {/* Right: Personalization & Share */}
          <div className="p-5 md:p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2 mb-5">
                <Zap className="w-4 h-4" />
                Personalize Tactics
              </h3>

              <div className="space-y-5">
                {/* Play Style */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/50 block mb-2">Play Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PLAY_STYLES.map((style) => (
                      <button
                        key={style}
                        onClick={() => {
                          setPlayStyle(style);
                          trackFeatureUsed('tactics_preview_change', { type: 'playStyle', value: style });
                        }}
                        className={`relative px-3 py-2.5 rounded-xl border text-left transition-all overflow-hidden ${
                          playStyle === style 
                            ? 'bg-blue-500/15 border-blue-400/40 text-white ring-1 ring-blue-400/30 shadow-lg shadow-blue-500/10' 
                            : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:border-white/20 hover:text-white/80 hover:bg-white/[0.06]'
                        }`}
                      >
                        {playStyle === style && (
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
                        )}
                        <div className="text-xs font-bold capitalize">{style.replace('_', ' ')}</div>
                        <div className="text-[11px] text-white/40 mt-0.5 truncate">{PLAY_STYLE_LABELS[style]?.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pitch Theme */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/50 block mb-2">Pitch Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PITCH_THEMES.map((pt) => (
                      <button
                        key={pt.value}
                        onClick={() => setPitchTheme(pt.value)}
                        className={`relative px-3 py-2.5 rounded-xl border text-left transition-all overflow-hidden ${
                          pitchTheme === pt.value 
                            ? 'border-blue-400/40 ring-1 ring-blue-400/30 shadow-lg shadow-blue-500/10' 
                            : 'bg-white/[0.04] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.06]'
                        }`}
                      >
                        {pitchTheme === pt.value && (
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
                        )}
                        <div className={`text-xs font-bold ${pitchTheme === pt.value ? 'text-white' : 'text-white/60'}`}>{pt.label}</div>
                        <div className={`h-3 rounded-md bg-gradient-to-r ${pt.color} mt-1.5 ${pitchTheme === pt.value ? 'opacity-100' : 'opacity-50'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Squad Identity */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/50 block mb-2">Squad Identity</label>
                  <div className="flex gap-3">
                    {SQUAD_COLORS.map((color) => (
                      <button 
                        key={color}
                        onClick={() => {
                          setPrimaryColor(color);
                          trackFeatureUsed('tactics_preview_change', { type: 'color', value: color });
                        }}
                        className={`relative w-9 h-9 md:w-7 md:h-7 rounded-full transition-all hover:scale-110 ${
                          primaryColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-950 scale-110' : 'ring-1 ring-white/20'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Share & Export */}
            <div className="mt-6 md:mt-8 space-y-3">
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 border-0 font-bold"
                  onClick={handleShare}
                >
                  <AnimatePresence mode="wait">
                    {showShareSuccess ? (
                      <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center">
                        <Check className="w-4 h-4 mr-2" /> Link Copied
                      </motion.div>
                    ) : (
                      <motion.div key="share" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center">
                        <Share2 className="w-4 h-4 mr-2" /> Share Tactics
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
                <ExportSettings
                  exportFormat={exportHook.exportFormat}
                  onFormatChange={exportHook.setExportFormat}
                  exportScope={exportHook.exportScope}
                  onScopeChange={exportHook.setExportScope}
                  hdExport={exportHook.hdExport}
                  onHdChange={exportHook.setHdExport}
                  isExporting={exportHook.isExporting}
                  onExport={() => exportHook.handleExport(pitchRef, leftPanelRef, formation, {
                    style: playStyle, showNames: personalization.showNames, blurFaces: personalization.blurFaces,
                  })}
                  onCopyLink={handleCopyLink}
                />
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5" onClick={toggleFullscreen}>
                  {isFs ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-center text-white/90">Share as image or link to your squad group chat</p>
              <div className="mt-1 flex items-center justify-center gap-3">
                <span className="text-[10px] text-white/80">Tip: PNG = lossless. WebP = smaller, widely supported.</span>
                {personalization.blurFaces && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                    <EyeOff className="h-3 w-3" /> Faces blurred
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button variant="ghost" className="text-xs text-white hover:bg-white/10" onClick={() => setShowEditor(true)}>
                  <UserPlus className="w-3 h-3 mr-1" /> Personalize: Names & Faces
                </Button>
                <Button variant="ghost" className="text-xs text-white/70 hover:bg-white/10" onClick={personalization.resetAllFormations}>
                  Reset All
                </Button>
                {personalization.unlocked && (
                  <label className="flex items-center gap-2 text-[11px] text-gray-300">
                    <input type="checkbox" checked={personalization.showNames} onChange={(e) => personalization.setShowNames(e.target.checked)} /> Show names on card
                  </label>
                )}
              </div>
              {personalization.unlocked && (
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 text-[11px]"
                    onClick={() => shareWithTemporaryState({ showNames: false }, 'clean')}>Share Clean</Button>
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 text-[11px]"
                    onClick={() => shareWithTemporaryState({ showNames: true }, 'names')}>Share + Names</Button>
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 text-[11px]"
                    onClick={() => shareWithTemporaryState({ showNames: true, blurFaces: true }, 'names_blur')}>Share + Names + Blur</Button>
                  <Button variant="outline" className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-[11px]"
                    onClick={() => setShowSquadModal(true)}>Create Squad</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Viral Loop Note */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {DEMO_INITIALS.map((initials, i) => (
              <div key={i} className="w-6 h-6 rounded-full border border-gray-900 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-[8px] font-bold text-white shadow-sm">
                {initials}
              </div>
            ))}
          </div>
          <span className="animate-pulse flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Recently built by Sunday League stars
          </span>
        </div>
        <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
        <span>{squadCount !== null ? `Join ${squadCount}+ squads using SportWarren` : 'Join squads using SportWarren'}</span>
      </div>

      {/* Quick Guide */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {QUICK_GUIDE_STEPS.map((item, i) => (
          <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-start gap-3">
            <div className="mt-1">
              {i === 0 && <Shield className="w-4 h-4 text-green-400" />}
              {i === 1 && <Zap className="w-4 h-4 text-blue-400" />}
              {i === 2 && <Share2 className="w-4 h-4 text-purple-400" />}
            </div>
            <div>
              <div className="text-[11px] font-bold text-white uppercase tracking-wider">{item.title}</div>
              <div className="text-[10px] text-gray-400 leading-tight">{item.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Personalize Editor Modal */}
      {(showEditor || fsOverlay) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-gray-900 p-5">
            {!fsOverlay && (
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-bold uppercase tracking-widest text-white">
                  {personalization.unlocked ? 'Personalize Lineup' : 'Unlock Personalization'}
                </div>
                <button className="text-gray-400 hover:text-white" onClick={() => setShowEditor(false)}>Close</button>
              </div>
            )}
            {!personalization.unlocked ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-300">Add names and faces to your sharable tactics card. Enter your email to unlock:</p>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <WaitlistForm variant="inline" source="hero_personalize" onDone={() => personalization.setUnlocked(true)} />
                </div>
                <div className="text-[11px] text-gray-400">We only use this to notify you about early access.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
                        {personalization.avatars[i] ? (
                          <img src={personalization.avatars[i] as string} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-400 text-lg">+</span>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => handleAvatarUpload(e, (dataUrl) => {
                            personalization.setAvatars(prev => { const n = [...prev]; n[i] = dataUrl; return n; });
                          })}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Name</label>
                        <input
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                          value={personalization.names[i] || ''}
                          onChange={(e) => handleEditorNameChange(i, e.target.value)}
                          placeholder="Enter name"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="md:col-span-2 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-[12px] text-gray-300">
                      <input type="checkbox" checked={personalization.showNames} onChange={(e) => personalization.setShowNames(e.target.checked)} /> Show names on card
                    </label>
                    <div className="flex items-center gap-2 text-[12px] text-gray-300">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={personalization.blurFaces} onChange={(e) => personalization.setBlurFaces(e.target.checked)} /> Blur faces
                      </label>
                      {personalization.blurFaces && (
                        <select
                          className="rounded-md bg-white/5 border border-white/10 text-white text-[12px] px-2 py-1"
                          value={personalization.blurLevel}
                          onChange={(e) => personalization.setBlurLevel((e.target.value as any) || 'med')}
                        >
                          <option value="low">Low</option>
                          <option value="med">Medium</option>
                          <option value="high">High</option>
                        </select>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="text-white hover:bg-white/10" onClick={personalization.resetCurrentFormation}>Reset</Button>
                    <Button variant="ghost" className="text-white hover:bg-white/10" onClick={personalization.resetAllFormations}>Reset All</Button>
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5" onClick={() => setShowEditor(false)}>Done</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Squad Modal */}
      {showSquadModal && (
        <SquadCreationModal
          formation={formation}
          names={personalization.names}
          avatars={personalization.avatars}
          onClose={() => setShowSquadModal(false)}
        />
      )}
    </div>
  );
};
