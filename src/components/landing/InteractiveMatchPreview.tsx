"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCreateSquad } from '@/hooks/squad/useSquad';
import { PitchCanvas } from '@/components/squad/PitchCanvas';
import { FORMATIONS, PLAY_STYLE_LABELS, getFormationsBySquadSize, getDefaultFormationForSize } from '@/lib/formations';
import type { Formation, PlayStyle, Player, SquadSize } from '@/types';
import { useSearchParams } from 'next/navigation';
import { trackCoreGrowthEvent, trackFeatureUsed } from '@/lib/analytics';
import { 
  Shield, 
  Zap, 
  Share2, 
  Download,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  UserPlus,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportElementAsImage } from '@/lib/utils/export';
import { WaitlistForm } from '@/components/common/WaitlistForm';

const MOCK_PLAYERS: Player[] = [
  { id: '1', name: 'Tunde', position: 'ST', status: 'available', address: '0x1' },
  { id: '2', name: 'Kofi', position: 'MF', status: 'available', address: '0x2' },
  { id: '3', name: 'Diallo', position: 'MF', status: 'available', address: '0x3' },
  { id: '4', name: 'Eze', position: 'DF', status: 'available', address: '0x4' },
  { id: '5', name: 'Yusuf', position: 'DF', status: 'available', address: '0x5' },
  { id: '6', name: 'GK', position: 'GK', status: 'available', address: '0x6' },
];

export const InteractiveMatchPreview: React.FC = () => {
  const searchParams = useSearchParams();
  const [squadCount, setSquadCount] = useState<number | null>(null);

  // Fetch live stats for social proof
  useEffect(() => {
    fetch('/api/platform/stats')
      .then(res => res.json())
      .then(data => setSquadCount(data.waitlistTotal ?? 0))
      .catch(() => setSquadCount(null));
  }, []);

  // Initial state from URL or defaults
  const [squadSize, setSquadSize] = useState<SquadSize>(() => {
    const size = searchParams.get('size');
    if (size && ['5', '6', '7', '11'].includes(size)) {
      return parseInt(size) as SquadSize;
    }
    return 11;
  });
  const [formation, setFormation] = useState<Formation>((searchParams.get('formation') as Formation) || '4-4-2');
  const [playStyle, setPlayStyle] = useState<PlayStyle>((searchParams.get('style') as PlayStyle) || 'balanced');
  const [pitchTheme, setPitchTheme] = useState<string>('premier-league');
  const [primaryColor, setPrimaryColor] = useState(searchParams.get('color') || '#10b981');
  
  const [isExporting, setIsExporting] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const pitchRef = React.useRef<HTMLDivElement>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [names, setNames] = useState<string[]>([]);
  const [avatars, setAvatars] = useState<(string | null)[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | undefined>(undefined);

  // Initialize names/avatars based on squad size
  useEffect(() => {
    const defaultNames = ['Tunde', 'Kofi', 'Diallo', 'Eze', 'Yusuf', 'Baba', 'Zico', 'Chidi', 'Seydou', 'Moussa', 'GK'];
    setNames(defaultNames.slice(0, squadSize));
    setAvatars(new Array(squadSize).fill(null));
  }, [squadSize]);
  const [showNames, setShowNames] = useState(false);
  const [blurFaces, setBlurFaces] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const [fsOverlay, setFsOverlay] = useState(false);
  const supportsFs = typeof document !== 'undefined' && typeof (document as any).fullscreenEnabled !== 'undefined';
  const [blurLevel, setBlurLevel] = useState<'low'|'med'|'high'>('med');
  const [exportFormat, setExportFormat] = useState<'png'|'webp'>(() => {
    if (typeof window === 'undefined') return 'png';
    const v = window.localStorage.getItem('sw_pitch_export_format');
    return v === 'webp' ? 'webp' : 'png';
  });
  const [hdExport, setHdExport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('sw_pitch_hd') === '1';
  });
  const [exportScope, setExportScope] = useState<'card' | 'panel'>(() => {
    if (typeof window === 'undefined') return 'card';
    const v = window.localStorage.getItem('sw_pitch_export_scope');
    return v === 'panel' ? 'panel' : 'card';
  });
  const leftPanelRef = React.useRef<HTMLDivElement>(null);
  const [showSquadModal, setShowSquadModal] = useState(false);
  const [squadName, setSquadName] = useState('');
  const [squadCreated, setSquadCreated] = useState<string | null>(null);
  const [squadError, setSquadError] = useState<string | null>(null);
  const { createSquad: createSquadMutation, isCreating: isCreatingSquad } = useCreateSquad();

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('formation', formation);
    params.set('style', playStyle);
    params.set('color', primaryColor);
    params.set('size', squadSize.toString());
    
    // Use replace to avoid polluting history with every micro-change
    const newPathname = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newPathname);
  }, [formation, playStyle, primaryColor, squadSize]);

  // Get formations filtered by squad size
  const formationList = useMemo(() => getFormationsBySquadSize(squadSize), [squadSize]);
  const formationIndex = useMemo(() => formationList.indexOf(formation), [formationList, formation]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setUnlocked(window.localStorage.getItem('sw_pitch_personalize_unlocked') === '1');
    const onFs = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const nextFormation = () => {
    if (formationList.length === 0) return;
    const current = Math.max(0, formationIndex);
    const nextIdx = (current + 1) % formationList.length;
    setFormation(formationList[nextIdx]);
    trackFeatureUsed('tactics_preview_change', { type: 'formation', value: formationList[nextIdx] });
  };

  const prevFormation = () => {
    if (formationList.length === 0) return;
    const current = Math.max(0, formationIndex);
    const prevIdx = (current - 1 + formationList.length) % formationList.length;
    setFormation(formationList[prevIdx]);
    trackFeatureUsed('tactics_preview_change', { type: 'formation', value: formationList[prevIdx] });
  };

  // Handle squad size change - reset formation to default for that size
  const handleSquadSizeChange = (newSize: SquadSize) => {
    setSquadSize(newSize);
    const def = getDefaultFormationForSize(newSize);
    setFormation(def);
    trackFeatureUsed('tactics_preview_change', { type: 'squadSize', value: newSize.toString() });
  };

  const handleExport = async () => {
    if (!pitchRef.current) return;
    setIsExporting(true);
    try {
      const target = exportScope === 'panel' && leftPanelRef.current ? leftPanelRef.current : pitchRef.current;
      const devicePR = (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
      const dm = (typeof navigator !== 'undefined' && (navigator as any).deviceMemory) || 0;
      const isDesktop = typeof window !== 'undefined' ? (window.matchMedia && window.matchMedia('(min-width: 1024px)').matches) : false;
      const allowedMax = (isDesktop || dm >= 4) ? 3 : 2;
      const basePR = exportFormat === 'webp' ? Math.max(1.5, devicePR) : Math.max(1, devicePR);
      let pixelRatio = Math.min(allowedMax, hdExport ? Math.max(2, basePR * 1.5) : Math.min(2, basePR));

      let success = false;
      let finalFormat: 'png'|'webp' = exportFormat as any;
      try {
        success = await exportElementAsImage(target, `sportwarren-tactics-${formation}`, finalFormat, { pixelRatio, backgroundColor: '#0b1322' });
      } catch (e) {
        console.warn('Initial export attempt failed', e);
      }
      if (!success && finalFormat === 'webp') {
        finalFormat = 'png';
        try { success = await exportElementAsImage(target, `sportwarren-tactics-${formation}`, 'png', { pixelRatio, backgroundColor: '#0b1322' }); } catch (e) { console.warn('WebP fallback export failed', e); }
      }
      if (!success && pixelRatio > 2) {
        pixelRatio = 2;
        try { success = await exportElementAsImage(target, `sportwarren-tactics-${formation}`, 'png', { pixelRatio, backgroundColor: '#0b1322' }); } catch (e) { console.warn('High DPI fallback export failed', e); }
      }
      if (!success) {
        try { success = await exportElementAsImage(target, `sportwarren-tactics-${formation}`, 'png', { pixelRatio: 1, backgroundColor: '#0b1322' }); } catch (e) { console.warn('Final fallback export failed', e); }
      }

      // Analytics with export metadata
      trackFeatureUsed('tactics_preview_export', {
        formation,
        style: playStyle,
        format: finalFormat,
        pixelRatio,
        hd: hdExport,
        scope: exportScope,
        namesShown: showNames,
        blurred: blurFaces,
        success,
      });
      if (success) {
        const tip = document.createElement('div');
        tip.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[100] rounded-md border border-white/10 bg-black/80 px-3 py-1.5 text-xs text-white shadow-xl';
        tip.textContent = 'Saved';
        document.body.appendChild(tip);
        setTimeout(() => { try { document.body.removeChild(tip); } catch (e) { console.warn('Failed to remove tip', e); } }, 1200);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!pitchRef.current) return;
    
    trackFeatureUsed('tactics_preview_share_click', { formation, style: playStyle });
    try {
      const { toPng } = await import('html-to-image');
      const pxr = Math.min(2, (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1));
      const dataUrl = await toPng(pitchRef.current, { quality: 0.95, cacheBust: true, pixelRatio: pxr, backgroundColor: '#0b1322' });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'tactics.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `My SportWarren Tactics`,
          text: `Check out my ${formation} setup! Join me on SportWarren.`,
          files: [file],
        });
        trackCoreGrowthEvent('opponent_verification_invite_shared', { method: 'web_share_api', type: 'tactics_preview' });
      } else {
        // Fallback: Copy link and show success
        await navigator.clipboard.writeText(window.location.href);
        setShowShareSuccess(true);
        trackCoreGrowthEvent('opponent_verification_invite_shared', { method: 'clipboard_copy', type: 'tactics_preview' });
        setTimeout(() => setShowShareSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  // Share presets (clean vs with names)
  const shareWithNames = async (withNames: boolean) => {
    // Temporarily toggle showNames and wait for frame to render
    const prev = showNames;
    setShowNames(withNames);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await handleShare();
    setShowNames(prev);
    trackFeatureUsed('tactics_share_preset', {
      preset: withNames ? 'names' : 'clean',
      formation,
      style: playStyle,
      blurred: blurFaces,
    });
  };

  const shareWithNamesAndBlur = async () => {
    const prevNames = showNames;
    const prevBlur = blurFaces;
    setShowNames(true);
    setBlurFaces(true);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await handleShare();
    setShowNames(prevNames);
    setBlurFaces(prevBlur);
    trackFeatureUsed('tactics_share_preset', {
      preset: 'names_blur',
      formation,
      style: playStyle,
      blurred: true,
    });
  };

  // Reset helpers
  const resetCurrentFormation = () => {
    setNames(['Tunde','Kofi','Diallo','Eze','Yusuf','GK']);
    setAvatars([null,null,null,null,null,null]);
    setShowNames(false);
    setBlurFaces(false);
    try {
      if (typeof window !== 'undefined') {
        const key = (k:string) => `${k}_${formation}`;
        ['sw_pitch_names','sw_pitch_avatars','sw_pitch_show_names','sw_pitch_blur_faces','sw_pitch_blur_level']
          .forEach((k)=> window.localStorage.removeItem(key(k)));
      }
    } catch (e) {
      console.warn('LocalStorage cleanup failed', e);
    }
  };

  const resetAllFormations = () => {
    // Reset UI state
    setNames(['Tunde','Kofi','Diallo','Eze','Yusuf','GK']);
    setAvatars([null,null,null,null,null,null]);
    setShowNames(false);
    setBlurFaces(false);
    setBlurLevel('med');
    try {
      if (typeof window !== 'undefined') {
        const fmList = Object.keys(FORMATIONS) as Formation[];
        const keys = ['sw_pitch_names','sw_pitch_avatars','sw_pitch_show_names','sw_pitch_blur_faces','sw_pitch_blur_level'];
        fmList.forEach((fm) => keys.forEach((k) => window.localStorage.removeItem(`${k}_${fm}`)));
        // Also remove any legacy global keys just in case
        keys.forEach((k) => window.localStorage.removeItem(k));
      }
    } catch (e) {
      console.warn('LocalStorage batch cleanup failed', e);
    }
  };

  const lineup = useMemo(() => {
    // Just a mock lineup for the preview - match the formation length
    return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].slice(0, FORMATIONS[formation].length);
  }, [formation]);

  // Dynamic mock players based on squad size
  const mockPlayersForSize = useMemo(() => {
    const names = ['Tunde', 'Kofi', 'Diallo', 'Eze', 'Yusuf', 'Baba', 'Zico', 'Chidi', 'Seydou', 'Moussa', 'GK'];
    const positions = squadSize === 11 
      ? ['ST', 'ST', 'LW', 'RW', 'CM', 'CM', 'CM', 'CDM', 'CB', 'CB', 'GK']
      : squadSize === 7
      ? ['ST', 'CM', 'CM', 'CM', 'CB', 'CB', 'GK']
      : squadSize === 6
      ? ['ST', 'CM', 'CM', 'CB', 'CB', 'GK']
      : ['ST', 'CM', 'CM', 'CB', 'GK'];
    
    return names.slice(0, squadSize).map((name, i) => ({
      id: String(i + 1),
      name,
      position: positions[i],
      status: 'available' as const,
      address: `0x${i + 1}`,
    }));
  }, [squadSize]);

  // Persist personalization (local only). Use per-formation keys when available.
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const key = (k: string) => `${k}_${formation}`;
      window.localStorage.setItem(key('sw_pitch_names'), JSON.stringify(names));
      window.localStorage.setItem(key('sw_pitch_avatars'), JSON.stringify(avatars));
      window.localStorage.setItem(key('sw_pitch_show_names'), showNames ? '1' : '0');
      window.localStorage.setItem(key('sw_pitch_blur_faces'), blurFaces ? '1' : '0');
      window.localStorage.setItem(key('sw_pitch_blur_level'), blurLevel);
      window.localStorage.setItem('sw_pitch_export_format', exportFormat);
      window.localStorage.setItem('sw_pitch_hd', hdExport ? '1' : '0');
      window.localStorage.setItem('sw_pitch_export_scope', exportScope);
    } catch (e) {
      console.warn('Failed to save pitch settings to localStorage', e);
    }
  }, [names, avatars, showNames, blurFaces, blurLevel, exportFormat, hdExport, exportScope, formation]);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const key = (k: string) => `${k}_${formation}`;
      const n = window.localStorage.getItem(key('sw_pitch_names')) || window.localStorage.getItem('sw_pitch_names');
      const a = window.localStorage.getItem(key('sw_pitch_avatars')) || window.localStorage.getItem('sw_pitch_avatars');
      const s = window.localStorage.getItem(key('sw_pitch_show_names')) || window.localStorage.getItem('sw_pitch_show_names');
      const b = window.localStorage.getItem(key('sw_pitch_blur_faces')) || window.localStorage.getItem('sw_pitch_blur_faces');
      const bl = window.localStorage.getItem(key('sw_pitch_blur_level')) || window.localStorage.getItem('sw_pitch_blur_level');
      if (n) {
        try { const v = JSON.parse(n); if (Array.isArray(v) && v.length) setNames(v); } catch (e) { console.warn('Failed to parse names from localStorage', e); }
      }
      if (a) {
        try { const v = JSON.parse(a); if (Array.isArray(v) && v.length) setAvatars(v); } catch (e) { console.warn('Failed to parse avatars from localStorage', e); }
      }
      if (s) setShowNames(s === '1');
      if (b) setBlurFaces(b === '1');
      if (bl === 'low' || bl === 'med' || bl === 'high') setBlurLevel(bl as any);
    } catch (e) {
      console.warn('Failed to load settings from localStorage', e);
    }
  }, [formation]);

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-0">
      <Card className="bg-gray-900/40 border-white/10 backdrop-blur-md overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left: Pitch Preview */}
          <div ref={leftPanelRef} className="p-6 border-b md:border-b-0 md:border-r border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-green-400 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Tactical Setup
              </h3>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={prevFormation} className="h-8 w-8 p-0 text-white hover:bg-white/10">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs font-mono text-white w-12 text-center">{formation}</span>
                <Button variant="ghost" size="sm" onClick={nextFormation} className="h-8 w-8 p-0 text-white hover:bg-white/10">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Squad Size Selector */}
            <div className="flex items-center gap-2 mb-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Squad Size</label>
              <div className="flex gap-1">
                {([5, 6, 7, 11] as SquadSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSquadSizeChange(size)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                      squadSize === size
                        ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/30'
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
                players={mockPlayersForSize.map((p, i) => ({ ...p, name: names[i] || p.name, avatar: avatars[i] || (p as any).avatar, position: p.position as any }))}
                size="sm"
                readOnly={true}
                className="bg-transparent"
                primaryColor={primaryColor}
                playStyle={playStyle}
                theme="hero"
                showPlayerNames={showNames}
                blurAvatars={blurFaces}
                selectedSlotIndex={selectedSlotIndex}
                onPlayerSelect={(idx) => setSelectedSlotIndex(idx === selectedSlotIndex ? undefined : idx)}
              />
            </div>
            
            {selectedSlotIndex !== undefined && (
              <div className="mt-3 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Edit Player</span>
                  <button 
                    onClick={() => setSelectedSlotIndex(undefined)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
                      {avatars[selectedSlotIndex] ? (
                        <img src={avatars[selectedSlotIndex] as string} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-green-400">{FORMATIONS[formation]?.[selectedSlotIndex]?.role.slice(0, 2) || 'ST'}</span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = URL.createObjectURL(file);
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const max = 128;
                            const scale = Math.min(max / (img.width || max), max / (img.height || max));
                            canvas.width = Math.max(1, Math.round((img.width || max) * scale));
                            canvas.height = Math.max(1, Math.round((img.height || max) * scale));
                            const ctx = canvas.getContext('2d');
                            if (!ctx) return;
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            const dataUrl = canvas.toDataURL('image/webp', 0.8);
                            setAvatars((prev) => { const n = [...prev]; n[selectedSlotIndex] = dataUrl; return n; });
                            URL.revokeObjectURL(url);
                          };
                          img.src = url;
                        }}
                      />
                    </div>
                    <input
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      value={names[selectedSlotIndex] || ''}
                      onChange={(e) => setNames((prev) => { const n = [...prev]; n[selectedSlotIndex!] = e.target.value; return n; })}
                      placeholder="Name"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-gray-400">Position</span>
                    <span className="text-xs font-bold text-white bg-white/10 px-2 py-1 rounded">{FORMATIONS[formation][selectedSlotIndex]?.role || '?'}</span>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <button 
                    onClick={() => {
                      setNames((prev) => { const n = [...prev]; n[selectedSlotIndex!] = ''; return n; });
                      setAvatars((prev) => { const n = [...prev]; n[selectedSlotIndex!] = null; return n; });
                    }}
                    className="text-[10px] text-gray-400 hover:text-red-400"
                  >
                    Clear Player
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">AI Insight</span>
              </div>
              <p className="text-xs text-white/90 italic">
                {(playStyle as string) === 'attacking' ? "High defensive line will squeeze the pitch." :
                 (playStyle as string) === 'defensive' ? "Deep block makes you impossible to break down." :
                 playStyle === 'counter' ? "Sprinting into space on the transition is key." :
                 formation === '4-3-3' ? "Aggressive width will stretch their defense." : 
                 formation === '4-4-2' ? "Solid structure, perfect for balanced play." :
                 "Highly specialized setup for technical dominance."}
              </p>
            </div>
          </div>

          {/* Right: Personalization & Share */}
          <div className="p-5 md:p-6 flex flex-col justify-between bg-gray-900/20 md:bg-transparent">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2 mb-4 md:mb-6">
                <Zap className="w-4 h-4" />
                Personalize Tactics
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-300 block mb-2">Play Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['balanced', 'high_press', 'low_block', 'counter'] as PlayStyle[]).map((style) => (
                      <button
                        key={style}
                        onClick={() => {
                          setPlayStyle(style);
                          trackFeatureUsed('tactics_preview_change', { type: 'playStyle', value: style });
                        }}
                        className={`px-3 py-1.5 md:py-2 rounded-lg border text-left transition-all ${
                          playStyle === style 
                            ? 'bg-blue-500/20 border-blue-500/50 text-white' 
                            : 'bg-white/5 border-white/20 text-gray-200 hover:border-white/40'
                        }`}
                      >
                        <div className="text-xs font-bold capitalize">{style.replace('_', ' ')}</div>
                        <div className="text-[9px] opacity-60 truncate">{PLAY_STYLE_LABELS[style]?.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-300 block mb-2">Pitch Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'premier-league', label: 'Premier League', color: 'from-green-600 to-green-700' },
                      { value: 'sunday-league', label: 'Sunday League', color: 'from-amber-800 to-amber-950' },
                      { value: 'night-match', label: 'Night Match', color: 'from-slate-800 to-slate-900' },
                      { value: 'easy-on-eyes', label: 'Easy on Eyes', color: 'from-emerald-500 to-teal-700' },
                    ].map((pt) => (
                      <button
                        key={pt.value}
                        onClick={() => setPitchTheme(pt.value)}
                        className={`px-3 py-1.5 md:py-2 rounded-lg border text-left transition-all ${
                          pitchTheme === pt.value 
                            ? 'bg-blue-500/20 border-blue-500/50 text-white' 
                            : 'bg-white/5 border-white/20 text-gray-200 hover:border-white/40'
                        }`}
                      >
                        <div className="text-xs font-bold">{pt.label}</div>
                        <div className={`h-1.5 rounded-full bg-gradient-to-r ${pt.color} mt-1 opacity-70`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-300 block mb-2">Squad Identity</label>
                  <div className="flex gap-3">
                    {['#10b981', '#3b82f6', '#ef4444', '#f59e0b'].map((color) => (
                      <button 
                        key={color}
                        onClick={() => {
                          setPrimaryColor(color);
                          trackFeatureUsed('tactics_preview_change', { type: 'color', value: color });
                        }}
                        className={`w-8 h-8 md:w-6 md:h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                          primaryColor === color ? 'border-white' : 'border-white/20'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-8 space-y-3">
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 border-0 font-bold"
                  onClick={handleShare}
                >
                  <AnimatePresence mode="wait">
                    {showShareSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Link Copied
                      </motion.div>
                    ) : (
                      <motion.div
                        key="share"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Tactics
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-md bg-white/5 border border-white/10 text-white text-[11px] px-2 py-1"
                    value={exportFormat}
                    onChange={(e) => setExportFormat((e.target.value as any) || 'png')}
                    title="Export format (PNG: lossless, WebP: smaller)"
                  >
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                  </select>
                  <select
                    className="rounded-md bg-white/5 border border-white/10 text-white text-[11px] px-2 py-1"
                    value={exportScope}
                    onChange={(e) => setExportScope((e.target.value as any) || 'card')}
                    title="Export area"
                  >
                    <option value="card">Card only</option>
                    <option value="panel">Card + header</option>
                  </select>
                  <label className="flex items-center gap-1 text-[11px] text-white/80" title="Higher pixel ratio for crisper export (larger file)">
                    <input type="checkbox" checked={hdExport} onChange={(e) => setHdExport(e.target.checked)} /> HD
                  </label>
                  <Button 
                    variant="outline" 
                    className="border-white/10 text-white hover:bg-white/5"
                    onClick={handleExport}
                    disabled={isExporting}
                    title="Save card"
                  >
                    <Download className={`w-4 h-4 ${isExporting ? 'animate-pulse' : ''}`} />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-white/10 text-white hover:bg-white/5 text-[11px]"
                    onClick={async () => {
                      try { 
                        await navigator.clipboard.writeText(window.location.href); 
                        setShowShareSuccess(true); 
                        setTimeout(() => setShowShareSuccess(false), 1500); 
                      } catch (e) {
                        console.error('Failed to copy link', e);
                      }
                    }}
                    title="Copy link with current setup"
                  >
                    Copy Link
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="border-white/10 text-white hover:bg-white/5"
                  onClick={() => {
                    const enter = () => pitchRef.current?.requestFullscreen?.();
                    const exit = () => document.exitFullscreen?.();
                    if (supportsFs) { if (!document.fullscreenElement) enter(); else exit(); }
                    else setFsOverlay((v) => !v);
                  }}
                >
                  {isFs ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-center text-white/90">
                Share as image or link to your squad group chat
              </p>
              <div className="mt-1 flex items-center justify-center gap-3">
                <span className="text-[10px] text-white/80">Tip: PNG = lossless. WebP = smaller, widely supported.</span>
                {blurFaces && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                    <EyeOff className="h-3 w-3" /> Faces blurred
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  className="text-xs text-white hover:bg-white/10"
                  onClick={() => setShowEditor(true)}
                >
                  <UserPlus className="w-3 h-3 mr-1" /> Personalize: Names & Faces
                </Button>
                <Button
                  variant="ghost"
                  className="text-xs text-white/70 hover:bg-white/10"
                  onClick={resetAllFormations}
                  title="Clear personalization for all formations"
                >
                  Reset All
                </Button>
                {unlocked && (
                  <label className="flex items-center gap-2 text-[11px] text-gray-300">
                    <input type="checkbox" checked={showNames} onChange={(e) => setShowNames(e.target.checked)} /> Show names on card
                  </label>
                )}
              </div>
              {unlocked && (
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 text-[11px]" onClick={() => void shareWithNames(false)}>Share Clean</Button>
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 text-[11px]" onClick={() => void shareWithNames(true)}>Share + Names</Button>
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 text-[11px]" onClick={() => void shareWithNamesAndBlur()}>Share + Names + Blur</Button>
                  <Button variant="outline" className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-[11px]" onClick={() => setShowSquadModal(true)}>Create Squad</Button>
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
            {['JD', 'AM', 'SK'].map((initials, i) => (
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
        {[
          { icon: <Shield className="w-4 h-4 text-green-400" />, title: "Plan", text: "Design your formation and squad identity." },
          { icon: <Zap className="w-4 h-4 text-blue-400" />, title: "Simulate", text: "Our match engine tests your setup against the meta." },
          { icon: <Share2 className="w-4 h-4 text-purple-400" />, title: "Dominate", text: "Share with your squad and lead them to victory." }
        ].map((item, i) => (
          <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-start gap-3">
            <div className="mt-1">{item.icon}</div>
            <div>
              <div className="text-[11px] font-bold text-white uppercase tracking-wider">{item.title}</div>
              <div className="text-[10px] text-gray-400 leading-tight">{item.text}</div>
            </div>
          </div>
        ))}
      </div>

      {(showEditor || fsOverlay) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-gray-900 p-5">
            {!fsOverlay && (
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-bold uppercase tracking-widest text-white">{unlocked ? 'Personalize Lineup' : 'Unlock Personalization'}</div>
                <button className="text-gray-400 hover:text-white" onClick={() => setShowEditor(false)}>Close</button>
              </div>
            )}
            {!unlocked ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-300">Add names and faces to your sharable tactics card. Enter your email to unlock:</p>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <WaitlistForm variant="inline" source="hero_personalize" onDone={() => { setUnlocked(true); if (typeof window !== 'undefined') window.localStorage.setItem('sw_pitch_personalize_unlocked','1'); }} />
                </div>
                <div className="text-[11px] text-gray-400">We only use this to notify you about early access.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0,1,2,3,4,5].map((i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
                        {avatars[i] ? (
                          <img src={avatars[i] as string} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = URL.createObjectURL(file);
                            const img = new Image();
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              const max = 256;
                              const scale = Math.min(max / (img.width || max), max / (img.height || max));
                              canvas.width = Math.max(1, Math.round((img.width || max) * scale));
                              canvas.height = Math.max(1, Math.round((img.height || max) * scale));
                              const ctx = canvas.getContext('2d');
                              if (!ctx) return;
                              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                              const dataUrl = canvas.toDataURL('image/webp', 0.8);
                              setAvatars((prev) => { const n = [...prev]; n[i] = dataUrl; return n; });
                              URL.revokeObjectURL(url);
                            };
                            img.src = url;
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Name</label>
                        <input
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                          value={names[i]}
                          onChange={(e) => setNames((prev) => { const n = [...prev]; n[i] = e.target.value; return n; })}
                          placeholder="Enter name"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="md:col-span-2 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-[12px] text-gray-300">
                      <input type="checkbox" checked={showNames} onChange={(e) => setShowNames(e.target.checked)} /> Show names on card
                    </label>
                    <div className="flex items-center gap-2 text-[12px] text-gray-300">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={blurFaces} onChange={(e) => setBlurFaces(e.target.checked)} /> Blur faces
                      </label>
                      {blurFaces && (
                        <select
                          className="rounded-md bg-white/5 border border-white/10 text-white text-[12px] px-2 py-1"
                          value={blurLevel}
                          onChange={(e) => setBlurLevel((e.target.value as any) || 'med')}
                        >
                          <option value="low">Low</option>
                          <option value="med">Medium</option>
                          <option value="high">High</option>
                        </select>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="text-white hover:bg-white/10" onClick={resetCurrentFormation}>Reset</Button>
                    <Button variant="ghost" className="text-white hover:bg-white/10" onClick={resetAllFormations}>Reset All</Button>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-5">
            {!squadCreated ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm font-bold uppercase tracking-widest text-white">Create Squad from Pitch</div>
                  <button className="text-gray-400 hover:text-white" onClick={() => setShowSquadModal(false)}>Close</button>
                </div>
                <p className="text-xs text-gray-400 mb-4">Name your squad to turn these players into a real team. Each player will get an invite link.</p>
                <input
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 mb-4"
                  value={squadName}
                  onChange={(e) => { setSquadName(e.target.value); setSquadError(null); }}
                  placeholder="Squad name (e.g., Sunday FC)"
                />
                {squadError && <p className="text-xs text-red-400 mb-3">{squadError}</p>}
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
                  disabled={isCreatingSquad || !squadName.trim()}
                  onClick={async () => {
                    if (!squadName.trim()) { setSquadError('Please enter a squad name'); return; }
                    setSquadError(null);
                    try {
                      const shortName = squadName.trim().split(/\s+/).map(p => p[0]).join('').slice(0,5).toUpperCase() || squadName.trim().slice(0,5).toUpperCase();
                      const squad = await createSquadMutation({ name: squadName.trim(), shortName, homeGround: 'street' });
                      setSquadCreated(squad.id);
                      const members = names.filter(n => n).map((name, i) => ({ name, avatar: avatars[i], position: FORMATIONS[formation]?.[i]?.role || 'ST' }));
                      localStorage.setItem(`sw_pending_squad_members_${squad.id}`, JSON.stringify(members));
                    } catch (e) {
                      setSquadError(e instanceof Error ? e.message : 'Failed to create squad. Please try again.');
                    }
                  }}
                >
                  {isCreatingSquad ? 'Creating...' : 'Create Squad'}
                </Button>
              </>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm font-bold uppercase tracking-widest text-emerald-400">Squad Created!</div>
                  <button className="text-gray-400 hover:text-white" onClick={() => { setShowSquadModal(false); setSquadCreated(null); setSquadName(''); }}>Close</button>
                </div>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg mb-4">
                  <p className="text-xs text-emerald-200 mb-2">Share these invite links with your squad:</p>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                    {names.filter(n => n).map((name, i) => {
                      const avatar = avatars[i];
                      return (
                        <div key={i} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded text-xs">
                          <div className="flex items-center gap-2">
                            {avatar ? (
                              <img src={avatar as string} alt={name} className="w-6 h-6 rounded-full object-cover border border-white/20" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center border border-emerald-500/20">
                                <span className="text-[10px] font-bold text-emerald-300">{name[0]}</span>
                              </div>
                            )}
                            <span className="text-white">{name}</span>
                          </div>
                          <button 
                            className="text-emerald-400 hover:text-emerald-300"
                            onClick={async () => {
                              const url = `${window.location.origin}/join/${squadCreated}?player=${encodeURIComponent(name)}`;
                              await navigator.clipboard.writeText(url);
                              alert(`Invite link for ${name} copied!`);
                            }}
                          >
                            Copy Link
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-500"
                  onClick={() => {
                    window.location.href = `/dashboard/squads/${squadCreated}`;
                  }}
                >
                  Go to Squad Dashboard
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
