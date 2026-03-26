"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Zap, Users, Target, TrendingUp, Sparkles, ArrowRight, Play, AlertCircle, CheckCircle2, Cpu, Ghost, TrendingDown, HelpCircle, Dumbbell, Shield, Timer } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { getJourneyContent } from '@/lib/journey/content';
import { getJourneyStage } from '@/lib/journey/stage';
import { AccountStatusControl } from '@/components/common/AccountStatusControl';

interface HeroSectionProps {
  onGetStarted?: () => void;
  onGuestStart?: () => void;
}

interface PlatformStats {
  totalPlayers: number;
  totalMatches: number;
  totalAgents: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onGuestStart }) => {
  const [stats, setStats] = useState<PlatformStats>({
    totalPlayers: 0,
    totalMatches: 0,
    totalAgents: 0,
  });
  const { address, chain, loginAsGuest, hasAccount, hasWallet, isGuest, authStatus } = useWallet();
  const [scrollY, setScrollY] = useState(0);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/platform/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {
        setStats({ totalPlayers: 0, totalMatches: 0, totalAgents: 0 });
      });

    // Use requestAnimationFrame + refs to avoid React re-renders on scroll
    let lastScrollY = 0;
    let rafId: number;
    
    const handleScroll = () => {
      lastScrollY = window.scrollY;
      rafId = requestAnimationFrame(() => {
        setScrollY(lastScrollY);
        
        // Directly update parallax elements via refs (bypasses React render)
        if (parallaxRef.current) {
          parallaxRef.current.style.transform = `translateY(${lastScrollY * 0.5}px)`;
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const parallaxOffset = scrollY * 0.5;
  const journeyStage = getJourneyStage({
    isGuest,
    hasAccount,
    hasWallet,
    authState: authStatus.state,
  });
  const journeyContent = getJourneyContent(journeyStage);
  const hasEmbeddedWalletAddress = Boolean(address && /^0x[a-fA-F0-9]{8,}$/.test(address));
  const heroSessionLine = isGuest
    ? 'Guest preview is active. Claim your season when you are ready for progress that sticks.'
    : hasWallet && address
      ? `Signed in with ${address.slice(0, 6)}…${address.slice(-4)} on ${chain || 'your wallet network'}.`
      : hasEmbeddedWalletAddress && address
        ? `Signed in with embedded wallet ${address.slice(0, 6)}…${address.slice(-4)}. Add a chain wallet later for protected actions.`
      : hasAccount
        ? 'Signed in successfully. Add a wallet later when you need protected actions.'
        : null;

  return (
    <div className="relative bg-gray-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-x-0 top-0 z-20">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
            <Link href={hasAccount || isGuest ? '/dashboard' : '/'} className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-sm">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-[0.22em] text-white/80">SportWarren</div>
                <div className="text-xs text-white/60">Rec football, with visible identity</div>
              </div>
            </Link>

            {hasAccount || isGuest ? (
              <AccountStatusControl variant="hero" />
            ) : (
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-black/25 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-black/35"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div
            ref={parallaxRef}
            className="absolute top-0 -left-4 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 will-change-transform"
            style={{ transform: `translateY(${parallaxOffset}px)` }}
          ></div>
          <div
            className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 will-change-transform"
            style={{ transform: `translateY(${parallaxOffset * 0.8}px)` }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Badge - removed until we have real users */}
          {/* <div className="inline-flex items-center space-x-2 bg-green-500/10 backdrop-blur-sm border border-green-500/20 text-green-400 px-6 py-3 rounded-full text-sm font-medium mb-8">
            <Users className="w-4 h-4" />
            <span>Used by 5-a-side players in 12 cities</span>
          </div> */}

          {/* Hero Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
            <span className="block text-white">Your Kickabout,</span>
            <span className="block bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
              Now Has Stats
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Log your match in 30 seconds. See your squad's stats evolve. Compete on leaderboards that actually mean something.
          </p>

          {/* CTA - Single primary action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={onGetStarted}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all duration-300 hover:scale-105"
            >
              <Zap className="w-5 h-5 mr-2" />
              {journeyContent.hero.primaryCtaLabel}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Subtle Telegram activation - not a primary CTA, just a secondary option */}
          <div className="mb-6">
            <a
              href="https://t.me/sportwarrenbot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span>Or open in Telegram for squad chat & match notifications</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          {journeyContent.hero.stageLine && (
            <p className="mb-6 text-sm font-bold uppercase tracking-[0.16em] text-green-300">
              {journeyContent.hero.stageLine}
            </p>
          )}

          {heroSessionLine && (
            <div className="mb-6 flex items-center justify-center">
              <div className="inline-flex max-w-2xl items-center gap-2 rounded-full border border-green-400/25 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-100 backdrop-blur-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{heroSessionLine}</span>
              </div>
            </div>
          )}

          <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
            {journeyContent.hero.highlights.map((highlight) => (
              <span
                key={highlight}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-gray-200 backdrop-blur-sm"
              >
                {highlight}
              </span>
            ))}
          </div>

          {!hasAccount && journeyContent.hero.previewLinkLabel && (
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
          {hasAccount && <div className="mb-16" />}

          {/* Stats — live from API */}
          {stats.totalPlayers > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-8 p-6 border border-white/5 rounded-2xl bg-white/2">
              <div className="flex items-center space-x-2 group">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">{stats.totalPlayers.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Players</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 group">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trophy className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">{stats.totalMatches.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Matches</div>
                </div>
              </div>
              {stats.totalAgents > 0 && (
                <div className="flex items-center space-x-2 group">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-white">{stats.totalAgents.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">AI Agents</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <Sparkles className="w-4 h-4 text-green-400" />
                <span>Be among the first to track your rec football stats</span>
              </div>
              {/* Early adopter incentive */}
              <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-300 font-medium">Early access — founding members get lifetime perks</span>
              </div>
            </div>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section ref={problemRef} className="relative py-32 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <AlertCircle className="w-4 h-4" />
              <span>The Problem</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Rec Players Are <span className="text-red-400">Invisible</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              You play every week. You score goals. You build chemistry with your squad. But none of it matters beyond the pitch.
            </p>
          </div>

          {/* Problem Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'No Recognition',
                description: 'Your goals, assists, and performances disappear after the final whistle. No permanent record, no reputation.',
                icon: Ghost,
                color: 'text-red-400',
                bg: 'bg-red-500/10',
              },
              {
                title: 'No Progression',
                description: 'Unlike video games, your real football skills don\'t translate into stats, levels, or achievements.',
                icon: TrendingDown,
                color: 'text-orange-400',
                bg: 'bg-orange-500/10',
              },
              {
                title: 'No Strategy',
                description: 'You play the same way every week. No tactical analysis, no opponent scouting, no squad optimization.',
                icon: HelpCircle,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
              },
            ].map((problem, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 hover:border-red-500/40 transition-all"
                style={{
                  transform: `translateY(${Math.max(0, (scrollY - 400) * 0.1 - i * 20)}px)`,
                  opacity: Math.min(1, (scrollY - 300) / 200),
                }}
              >
                <div className={`w-14 h-14 rounded-2xl ${problem.bg} flex items-center justify-center mb-4`}>
                  <problem.icon className={`w-7 h-7 ${problem.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{problem.title}</h3>
                <p className="text-gray-400">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section ref={solutionRef} className="relative py-32 bg-gradient-to-b from-gray-900 to-green-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <CheckCircle2 className="w-4 h-4" />
              <span>The Solution</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              A <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Parallel Season</span> That Matters
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              SportWarren creates a Championship Manager-style game layer on top of your real matches. Every match you play drives your in-game progression.
            </p>
          </div>

          {/* Solution Visual */}
          <div className="relative">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Real World */}
              <div
                className="space-y-6"
                style={{
                  transform: `translateX(${Math.max(-50, (scrollY - 1200) * 0.1 - 50)}px)`,
                  opacity: Math.min(1, (scrollY - 1100) / 200),
                }}
              >
                <h3 className="text-3xl font-bold text-white mb-6">Real World Match</h3>
                {[
                  { label: 'Play 90 minutes', Icon: Timer },
                  { label: 'Score 2 goals', Icon: Target },
                  { label: 'Win 3-2 vs rivals', Icon: Trophy },
                  { label: 'Team coordination', Icon: Users },
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <item.Icon className="w-5 h-5 text-gray-300" />
                    </div>
                    <span className="text-lg text-gray-300">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Arrow */}
              <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <ArrowRight className="w-12 h-12 text-green-400 animate-pulse" />
              </div>

              {/* Right: Game Layer */}
              <div
                className="space-y-6"
                style={{
                  transform: `translateX(${Math.min(50, -(scrollY - 1200) * 0.1 + 50)}px)`,
                  opacity: Math.min(1, (scrollY - 1100) / 200),
                }}
              >
                <h3 className="text-3xl font-bold text-white mb-6">SportWarren Layer</h3>
                {[
                  { label: 'Result verified on-chain', Icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
                  { label: 'Shooting XP +125', Icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
                  { label: 'Derby victory bonus', Icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
                  { label: 'Squad chemistry +10', Icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center space-x-4 ${item.bg} backdrop-blur-sm border ${item.border} rounded-xl p-4`}>
                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center`}>
                      <item.Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="text-lg text-white font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} id="how-it-works" className="relative py-32 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Cpu className="w-4 h-4" />
              <span>How It Works</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              From Pitch to <span className="text-blue-400">Progress</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Log your match. Watch your stats grow. Compete with your squad.
            </p>
          </div>

          {/* Feature Cards - 3 pillars */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div
              className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-green-500/50 transition-all duration-500 hover:scale-105"
              style={{
                transform: `translateY(${Math.max(0, (scrollY - 2000) * 0.05)}px)`,
                opacity: Math.min(1, (scrollY - 1900) / 200),
              }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Log Your Match</h3>
              <p className="text-gray-300">Takes 30 seconds. Score, assists, result — all tracked.</p>
            </div>

            <div
              className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:scale-105"
              style={{
                transform: `translateY(${Math.max(0, (scrollY - 2000) * 0.05 - 30)}px)`,
                opacity: Math.min(1, (scrollY - 1900) / 200),
              }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Watch Stats Grow</h3>
              <p className="text-gray-300">Shooting, passing, defending — all evolve with every game.</p>
            </div>

            <div
              className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-105"
              style={{
                transform: `translateY(${Math.max(0, (scrollY - 2000) * 0.05 - 60)}px)`,
                opacity: Math.min(1, (scrollY - 1900) / 200),
              }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Compete & Rise</h3>
              <p className="text-gray-300">Leaderboards, achievements, and squad rivalries that matter.</p>
            </div>
          </div>

          {/* Tech Stack - moved to footer for minimal hero clutter */}
          {/* Removed from hero - can be added to footer */}

        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 bg-gray-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo & Tagline */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-[0.2em] text-white/80">SportWarren</div>
                <div className="text-xs text-gray-500">Rec football, with stats that stick</div>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <a href="https://t.me/sportwarrenbot" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
                Telegram
              </a>
              <a href="https://x.com/sportwarren" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
                X / Twitter
              </a>
              <a href="mailto:hello@sportwarren.com" className="text-sm text-gray-400 hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} SportWarren. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>Built for 5-a-side warriors</span>
              <span className="w-1 h-1 rounded-full bg-gray-700" />
              <span className="text-green-500/60">Early Access</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
