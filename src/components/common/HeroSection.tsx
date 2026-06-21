"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Zap, Users, Target, Sparkles, ArrowRight, CheckCircle2, Timer, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { getJourneyContent } from '@/lib/journey/content';
import { getJourneyStage } from '@/lib/journey/stage';
import { AccountStatusControl } from '@/components/common/AccountStatusControl';
import { FormationPlayground, type PlaygroundStateSnapshot } from '@/components/landing/FormationPlayground';
import { NaturalLanguageMatchSim } from '@/components/landing/NaturalLanguageMatchSim';
import { PlayerCardPreview } from '@/components/landing/PlayerCardPreview';
import { RivalPreviewCard } from '@/components/landing/RivalPreviewCard';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { AppPreviewSection } from '@/components/landing/AppPreviewSection';
import { InlineWaitlistSection } from '@/components/landing/InlineWaitlistSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ShareLinks } from '@/components/common/ShareLinks';
import { usePlatform } from '@/hooks/usePlatform';
import { buildTelegramDeepLink } from '@/lib/telegram/deep-links';
import SquadImportWizard from '@/components/import/SquadImportWizard';
import { PALETTE, V4PaperGrain, V4ChalkLine } from '@/components/v4';
import type { PlayerPosition } from '@/types';

interface HeroSectionProps {
  onGetStarted?: () => void;
  onGuestStart?: () => void;
  onSavePlayerCard?: () => void;
}

interface PlatformStats {
  totalPlayers: number;
  totalMatches: number;
  totalAgents: number;
  waitlistTotal?: number;
  recentCardsClaimed?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onGuestStart, onSavePlayerCard }) => {
  const [stats, setStats] = useState<PlatformStats>({ totalPlayers: 0, totalMatches: 0, totalAgents: 0, waitlistTotal: 0, recentCardsClaimed: 0 });
  const [cardName, setCardName] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const stored = localStorage.getItem('sw_partial_persona');
      return stored ? JSON.parse(stored).displayName || '' : '';
    } catch {
      return '';
    }
  });
  const [cardPosition, setCardPosition] = useState<PlayerPosition>(() => {
    if (typeof window === 'undefined') return 'MF';
    try {
      const stored = localStorage.getItem('sw_partial_persona');
      return stored ? JSON.parse(stored).position || 'MF' : 'MF';
    } catch {
      return 'MF';
    }
  });
  // Tracked separately from the playground's internal state so the persona
  // context (and therefore onboarding prefill) can carry the formation
  // through Path D: playground → save card → personalize.
  const [cardFormation, setCardFormation] = useState<string | null>(null);
  // Full playground state snapshot — piped into NL Match Sim and Rival Preview
  // so the user's accumulated investment (formation, style, color, names, size)
  // carries forward into the simulator surfaces.
  const [playgroundState, setPlaygroundState] = useState<PlaygroundStateSnapshot | null>(null);
  const { loginAsGuest, hasAccount, hasWallet, isGuest, authStatus } = useWallet();
  const { platform, isTelegram } = usePlatform();
  const parallaxRef = useRef<HTMLDivElement>(null);
  const parallaxRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (typeof window === 'undefined') return;
      const partial = { displayName: cardName, position: cardPosition };
      if (cardName.trim() || cardPosition !== 'MF') {
        localStorage.setItem('sw_partial_persona', JSON.stringify(partial));
      } else {
        localStorage.removeItem('sw_partial_persona');
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [cardName, cardPosition]);

  useEffect(() => {
    fetch('/api/platform/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {
        setStats({ totalPlayers: 0, totalMatches: 0, totalAgents: 0 });
      });

    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (parallaxRef.current) {
          parallaxRef.current.style.transform = `translateY(${scrollY * 0.5}px)`;
        }
        if (parallaxRef2.current) {
          parallaxRef2.current.style.transform = `translateY(${scrollY * 0.4}px)`;
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const journeyStage = getJourneyStage({
    isGuest,
    hasAccount,
    hasWallet,
    authState: authStatus.state,
  });
  const journeyContent = getJourneyContent(journeyStage);
  const isPublicVisitor = journeyStage === 'public_visitor';
  // New visitors lead with the low-friction persona path (build a card as a guest)
  // rather than a wallet gate. Returning users sign in via the secondary link/header.
  const handlePrimaryCta = () => {
    if (isTelegram) {
      // Telegram Mini App users already have a session — go straight in
      // via the deep link, no web auth modal in front of it.
      if (typeof window !== 'undefined') {
        window.location.assign(buildTelegramDeepLink({ tab: 'squad' }));
      }
      return;
    }
    if (isPublicVisitor) {
      // Public visitors: the section CTA drives the same persona-save
      // conversion as the card. Falls back to onGetStarted when no
      // onSavePlayerCard handler is wired (defensive — should not happen
      // in practice since page.tsx always passes both).
      if (onSavePlayerCard) {
        onSavePlayerCard();
      } else {
        onGetStarted?.();
      }
    } else {
      onGetStarted?.();
    }
  };


  return (
    <div
      className="relative overflow-hidden"
      style={{ background: PALETTE.dusk }}
    >
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          // Atmospheric verdant depth — mirrors the SHAPE of the old
          // gray-900 → green-900 → gray-900 gradient but in V4 tones.
          // Dusk (top) → pitch (middle) → dusk (bottom) gives a sense
          // of light and shadow: dawn canopy + grass + earth.
          background: `linear-gradient(180deg, ${PALETTE.dusk} 0%, #4a6428 25%, ${PALETTE.pitch} 50%, #4a6428 78%, ${PALETTE.dusk} 100%)`,
        }}
      >
        <div className="absolute inset-x-0 top-0 z-20">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
            <Link href={hasAccount || isGuest ? '/dashboard' : '/'} className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center"
                style={{
                  background: PALETTE.dusk,
                  color: PALETTE.cream,
                  border: `1px solid rgba(244,237,224,0.25)`,
                }}
              >
                <Target className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div
                  className="text-sm font-black uppercase"
                  style={{ letterSpacing: '0.22em', color: PALETTE.cream }}
                >
                  SportWarren
                </div>
                <div
                  className="text-xs"
                  style={{ color: PALETTE.chalk, opacity: 0.7 }}
                >
                  Stop playing ghost matches
                </div>
              </div>
            </Link>

            {hasAccount || isGuest ? (
              <AccountStatusControl variant="hero" />
            ) : (
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold transition-colors"
                style={{
                  background: 'transparent',
                  color: PALETTE.cream,
                  border: `1px solid ${PALETTE.chalk}`,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontSize: 12,
                }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* V4 atmospheric backdrop — verdant gradient (above) +
            ambient light orbs (here) + paper grain + chalk edges.
            Same atmospheric shape as the previous dark backdrop but
            entirely in V4 verdant tones: mustard for the warm-light
            blur (low sun / floodlight halo), sage for the cool-green
            blur (canopy / damp grass). */}
        <div
          ref={parallaxRef}
          className="absolute top-0 -left-4 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl opacity-25 will-change-transform"
          style={{ background: PALETTE.mustard }}
          aria-hidden="true"
        />
        <div
          ref={parallaxRef2}
          className="absolute bottom-0 -right-4 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl opacity-20 will-change-transform"
          style={{ background: PALETTE.sage }}
          aria-hidden="true"
        />
        <V4PaperGrain opacity={0.09} zIndex={1} />
        <div
          className="absolute top-0 left-0 right-0 z-[2]"
          aria-hidden="true"
        >
          <V4ChalkLine thickness={2} opacity={0.45} />
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 z-[2]"
          aria-hidden="true"
        >
          <V4ChalkLine thickness={2} opacity={0.45} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-20 text-center">
          <h1
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-3 sm:mb-4 leading-[0.95]"
            style={{
              fontFamily: 'Antonio, Impact, sans-serif',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: PALETTE.cream,
            }}
          >
            <span className="block">Claim Your Spot.</span>
            <span className="block" style={{ color: PALETTE.mustard }}>
              Build Your Player Card.
            </span>
          </h1>

          <p
            className="text-sm sm:text-base mb-6 sm:mb-8 max-w-2xl mx-auto"
            style={{
              color: PALETTE.chalk,
              opacity: 0.85,
              fontFamily: 'JetBrains Mono, monospace',
              lineHeight: 1.6,
            }}
          >
            Start with a 5s, 6s, or 7s setup. Put yourself in the team, share the card to the group, then turn matchdays into verified stats, XP, and squad history.
          </p>

          {/* Dual CTA — two wedges, one above-the-fold choice. V4
              register: mustard fill (primary, captain) + chalk-border
              outline (secondary, player). No gradients, no glow. */}
          {isPublicVisitor && (
            <div className="mx-auto mb-8 grid max-w-md gap-3 sm:grid-cols-2">
              <a
                href="#squad-import-wizard"
                className="group inline-flex items-center justify-between px-4 py-3 text-left transition-colors"
                style={{
                  background: PALETTE.mustard,
                  color: PALETTE.ink,
                  border: `2px solid ${PALETTE.red}`,
                }}
              >
                <span className="min-w-0">
                  <div
                    className="text-[10px] font-black uppercase"
                    style={{ letterSpacing: '0.18em', color: PALETTE.red }}
                  >
                    Captain / organiser
                  </div>
                  <div className="text-sm font-bold" style={{ color: PALETTE.ink }}>
                    Set up your group
                  </div>
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" style={{ color: PALETTE.ink }} aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={onGuestStart ?? onGetStarted}
                className="group inline-flex items-center justify-between px-4 py-3 text-left transition-colors"
                style={{
                  background: 'transparent',
                  color: PALETTE.cream,
                  border: `2px solid ${PALETTE.chalk}`,
                }}
              >
                <span className="min-w-0">
                  <div
                    className="text-[10px] font-black uppercase"
                    style={{ letterSpacing: '0.18em', color: PALETTE.chalk, opacity: 0.8 }}
                  >
                    Player
                  </div>
                  <div className="text-sm font-bold" style={{ color: PALETTE.cream }}>
                    Build your card
                  </div>
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" style={{ color: PALETTE.chalk }} aria-hidden="true" />
              </button>
            </div>
          )}

          <PlayerCardPreview
            authed={hasAccount && !isGuest}
            onSave={onSavePlayerCard ?? onGetStarted}
            onNameChange={setCardName}
            onPositionChange={setCardPosition}
            currentFormation={cardFormation}
          />

          <div className="mx-auto mb-6 grid max-w-sm gap-2 text-left sm:grid-cols-2">
            {[
              { icon: Target, label: "Pick a role", detail: "Small-sided shapes first, 11v11 when the squad grows." },
              { icon: Users, label: "Bring the squad", detail: "Every teammate gets a native spot to claim and share." },
            ].map(({ icon: Icon, label, detail }) => (
              <div
                key={label}
                className="p-3"
                style={{
                  background: PALETTE.dusk,
                  border: `1px solid rgba(244,237,224,0.18)`,
                  color: PALETTE.chalk,
                }}
              >
                <Icon className="h-4 w-4" style={{ color: PALETTE.mustard }} aria-hidden="true" />
                <div
                  className="mt-2 text-xs font-black uppercase"
                  style={{ letterSpacing: '0.14em', color: PALETTE.cream }}
                >
                  {label}
                </div>
                <p
                  className="mt-1 text-xs leading-5"
                  style={{ color: PALETTE.chalk, opacity: 0.8 }}
                >
                  {detail}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            {isPublicVisitor && !isTelegram && (
              // Telegram/WhatsApp are the fastest auth paths for rec players
              // who already coordinate in group chats. Show them as equal
              // co-primary CTAs above the gradient button so the user sees
              // the no-friction path before the wallet gate.
              <div className="flex flex-col items-center gap-1.5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                  {journeyContent.hero.altCtasLabel ?? 'Or open in'}
                </p>
                <ShareLinks
                  variant="primary"
                  layout="row"
                  channels={platform === 'mobile' ? ['whatsapp', 'telegram'] : ['telegram', 'whatsapp']}
                  payload={{
                    text: 'Join me on SportWarren — build a player card and log real matches with the squad.',
                    url: typeof window === 'undefined' ? undefined : `${window.location.origin}/?connect=1`,
                    telegramDeepLink: buildTelegramDeepLink({ tab: 'squad' }),
                  }}
                  trackEventName="hero_channel_cta_clicked"
                  trackProps={{ surface: 'hero_primary' }}
                />
              </div>
            )}
            <button
              onClick={handlePrimaryCta}
              className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold transition-colors"
              style={{
                background: PALETTE.mustard,
                color: PALETTE.ink,
                border: `2px solid ${PALETTE.red}`,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" aria-hidden="true" />
              {isTelegram ? 'Open in Telegram' : journeyContent.hero.primaryCtaLabel}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
            {isPublicVisitor && (
              // For public visitors, the playground is the natural secondary
              // destination after the card-save CTA. Low-emphasis text link
              // — visually subordinate to the gradient primary above.
              <button
                onClick={() => document.getElementById('formation-playground')?.scrollIntoView({ behavior: 'smooth' })}
                className="group inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                <span>Or scroll down to try the playground</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </button>
            )}

          {/* Captain import CTA — second entry path for squad leaders
              who already have a roster in a spreadsheet. Low-emphasis so
              the primary funnel (build card → personalize) stays dominant. */}
          <p className="mt-3 text-center">
            <button
              onClick={() => {
                // Scroll to the import wizard section or open modal
                const el = document.getElementById('squad-import-wizard');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="group inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 underline underline-offset-4 decoration-gray-700 hover:decoration-gray-400 transition-colors"
            >
              <FileSpreadsheet className="w-3 h-3" />
              Already have a squad?
              <span className="font-bold" style={{ color: PALETTE.mustard }}>Import your roster</span>
            </button>
          </p>
          </div>

          {journeyContent.hero.stageLine && (
            <p
              className="mb-4 text-sm font-bold uppercase"
              style={{ letterSpacing: '0.16em', color: PALETTE.mustard }}
            >
              {journeyContent.hero.stageLine}
            </p>
          )}

          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            {journeyContent.hero.highlights.map((highlight) => (
              <span
                key={highlight}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-gray-200 backdrop-blur-sm"
              >
                {highlight}
              </span>
            ))}
          </div>

          <div className="mb-6">
            {/* Inline "Or open in Telegram" link removed — superseded by
                the channel CTA row above the primary button, which offers
                both Telegram and WhatsApp as co-primary options. Keeping
                the section so the surrounding rhythm doesn't shift. */}
          </div>

          <div id="formation-playground" className="mb-6">
            <React.Suspense fallback={<div className="h-[400px] w-full animate-pulse rounded-2xl bg-white/5" />}>
              <FormationPlayground
                initialName={cardName}
                initialPosition={cardPosition}
                onFormationChange={setCardFormation}
                onStateChange={setPlaygroundState}
              />
            </React.Suspense>
          </div>

          {/* NL Match Simulator — pre-auth value hook (curiosity gap) */}
          <div className="mb-6">
            <NaturalLanguageMatchSim
              formation={playgroundState?.formation}
              style={playgroundState?.style}
              names={playgroundState?.names}
              color={playgroundState?.color}
            />
          </div>

          {/* Rival Preview — social proof + competition hook */}
          <div className="mb-6">
            <RivalPreviewCard
              formation={playgroundState?.formation ?? '4-4-2'}
              style={playgroundState?.style ?? 'balanced'}
              color={playgroundState?.color ?? '#10b981'}
              names={playgroundState?.names ?? []}
              size={playgroundState?.size ?? 5}
            />
          </div>

          {/* Start my season CTA — summarises accumulated investment */}
          {!hasAccount && isPublicVisitor && playgroundState && (
            <div
              className="mx-auto mb-8 max-w-md overflow-hidden p-5 text-center"
              style={{
                background: PALETTE.dusk,
                border: `2px solid ${PALETTE.mustard}`,
                borderLeft: `8px solid ${PALETTE.mustard}`,
              }}
            >
              <p
                className="mb-3 text-[10px] font-black uppercase"
                style={{ letterSpacing: '0.22em', color: PALETTE.mustard }}
              >
                Your squad is ready
              </p>
              <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5">
                {cardName && (
                  <span
                    className="px-2 py-1 text-[10px] font-bold"
                    style={{ background: 'rgba(244,237,224,0.08)', color: PALETTE.cream, border: `1px solid rgba(244,237,224,0.18)` }}
                  >
                    {cardName}
                  </span>
                )}
                {playgroundState.formation && (
                  <span
                    className="px-2 py-1 text-[10px] font-bold"
                    style={{ background: 'rgba(244,237,224,0.08)', color: PALETTE.mustard, border: `1px solid rgba(244,237,224,0.18)` }}
                  >
                    {playgroundState.formation}
                  </span>
                )}
                {playgroundState.style && (
                  <span
                    className="px-2 py-1 text-[10px] font-bold"
                    style={{ background: 'rgba(244,237,224,0.08)', color: PALETTE.mustard, border: `1px solid rgba(244,237,224,0.18)` }}
                  >
                    {playgroundState.style}
                  </span>
                )}
                {playgroundState.color && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold"
                    style={{ background: 'rgba(244,237,224,0.08)', color: PALETTE.mustard, border: `1px solid rgba(244,237,224,0.18)` }}
                  >
                    <span className="h-2 w-2" style={{ backgroundColor: playgroundState.color, border: `1px solid ${PALETTE.chalk}` }} />
                    Kit
                  </span>
                )}
                {playgroundState.names && playgroundState.names.length > 0 && (
                  <span
                    className="px-2 py-1 text-[10px] font-bold"
                    style={{ background: 'rgba(244,237,224,0.08)', color: PALETTE.chalk, opacity: 0.75, border: `1px solid rgba(244,237,224,0.18)` }}
                  >
                    {playgroundState.names.length} players named
                  </span>
                )}
              </div>
              <button
                onClick={handlePrimaryCta}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold transition-colors"
                style={{
                  background: PALETTE.mustard,
                  color: PALETTE.ink,
                  border: `2px solid ${PALETTE.red}`,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                <Zap className="h-4 w-4" />
                Start my season
                <ArrowRight className="h-4 w-4" />
              </button>
              <p
                className="mt-3 text-[10px]"
                style={{ color: PALETTE.chalk, opacity: 0.65 }}
              >
                No password required. We&apos;ll create a guest account and sync your setup.
              </p>
            </div>
          )}

          {!hasAccount && isPublicVisitor && (
            <p className="text-center mb-16">
              <button
                onClick={onGetStarted}
                className="text-sm text-gray-500 hover:text-gray-300 underline underline-offset-4 decoration-gray-600 hover:decoration-gray-400 transition-colors"
              >
                Already have an account? Sign in
              </button>
            </p>
          )}
          {!hasAccount && !isPublicVisitor && journeyContent.hero.previewLinkLabel && (
            <p className="text-center mb-16">
              <button
                onClick={() => {
                  loginAsGuest();
                  onGuestStart?.();
                }}
                className="text-sm text-gray-500 hover:text-gray-300 underline underline-offset-4 decoration-gray-600 hover:decoration-gray-400 transition-colors"
              >
                {journeyContent.hero.previewLinkLabel}
              </button>
            </p>
          )}
          {(hasAccount || (!isPublicVisitor && !journeyContent.hero.previewLinkLabel)) && <div className="mb-16" />}

          {stats.totalPlayers > 0 || (stats.waitlistTotal && stats.waitlistTotal > 0) ? (
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 p-4 sm:p-6 border border-white/5 rounded-2xl bg-white/2">
              <div className="flex items-center space-x-2 group">
                <div
                  className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ background: 'rgba(212,164,55,0.18)' }}
                >
                  <Users className="w-4 sm:w-5 h-4 sm:h-5" style={{ color: PALETTE.mustard }} aria-hidden="true" />
                </div>
                <div className="text-left">
                  <div className="text-lg sm:text-2xl font-bold" style={{ color: PALETTE.cream }}>{stats.totalPlayers.toLocaleString()}</div>
                  <div className="text-[10px] sm:text-xs" style={{ color: PALETTE.chalk, opacity: 0.7 }}>Players</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 group">
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trophy className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <div className="text-lg sm:text-2xl font-bold text-white">{stats.totalMatches.toLocaleString()}</div>
                  <div className="text-[10px] sm:text-xs text-gray-400">Matches</div>
                </div>
              </div>
              {stats.totalAgents > 10 && (
                <div className="flex items-center space-x-2 group">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400" aria-hidden="true" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg sm:text-2xl font-bold text-white">{stats.totalAgents.toLocaleString()}</div>
                    <div className="text-[10px] sm:text-xs text-gray-400">AI Agents</div>
                  </div>
                </div>
              )}
              {stats.waitlistTotal && stats.waitlistTotal > 50 && (
                <div className="flex items-center space-x-2 group">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Timer className="w-4 sm:w-5 h-4 sm:h-5 text-amber-300" aria-hidden="true" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg sm:text-2xl font-bold text-white">{stats.waitlistTotal.toLocaleString()}</div>
                    <div className="text-[10px] sm:text-xs text-gray-400">On Waitlist</div>
                  </div>
                </div>
              )}
              {stats.recentCardsClaimed && stats.recentCardsClaimed > 0 && (
                <div className="flex items-center space-x-2 group">
                  <div
                    className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center group-hover:scale-110 transition-transform relative"
                    style={{ background: 'rgba(212,164,55,0.18)' }}
                  >
                    <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5" style={{ color: PALETTE.mustard }} aria-hidden="true" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg sm:text-2xl font-bold" style={{ color: PALETTE.cream }}>{stats.recentCardsClaimed.toLocaleString()}</div>
                    <div className="text-[10px] sm:text-xs" style={{ color: PALETTE.chalk, opacity: 0.7 }}>Cards This Week</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-2 text-sm" style={{ color: PALETTE.chalk, opacity: 0.8 }}>
                <Sparkles className="w-4 h-4" style={{ color: PALETTE.mustard }} aria-hidden="true" />
                <span>Be among the first to track your rec football stats</span>
              </div>
              <div
                className="inline-flex items-center gap-2 px-4 py-2"
                style={{
                  background: PALETTE.dusk,
                  border: `1px solid ${PALETTE.mustard}`,
                }}
              >
                <span
                  className="w-2 h-2 animate-pulse"
                  style={{ background: PALETTE.mustard }}
                />
                <span
                  className="text-xs font-medium uppercase"
                  style={{
                    letterSpacing: '0.14em',
                    color: PALETTE.mustard,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  Early access — founding members get lifetime perks
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Captain import wizard — hidden section revealed by the "Import your roster" CTA */}
      <div id="squad-import-wizard" className="scroll-mt-20">
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-lg px-4">
            <SquadImportWizard />
          </div>
        </section>
      </div>

      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <AppPreviewSection />
      <InlineWaitlistSection />
      <LandingFooter />
    </div>
  );
};
