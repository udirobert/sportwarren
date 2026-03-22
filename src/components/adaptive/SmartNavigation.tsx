'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, BarChart3, Users, MessageCircle, X, Plus, Activity, Settings, MoreHorizontal, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getJourneyNavigationSubtitle } from '@/lib/journey/content';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useJourneyState } from '@/hooks/useJourneyState';
import { ContextualHelp } from './ContextualHelp';
import { AccountStatusControl } from '@/components/common/AccountStatusControl';

const BOTTOM_NAV_MAX = 5;

// Keyboard navigation shortcuts (desktop only)
const NAV_SHORTCUTS: Record<string, string> = {
  'KeyD': '/dashboard',        // Dashboard
  'KeyM': '/match',   // Matches
  'KeyS': '/stats',   // Stats (Shift+S for Settings)
  'KeyQ': '/squad',   // Squad
  'KeyE': '/settings', // Settings (E for "Edit profile")
};

export const SmartNavigation: React.FC = () => {
  const pathname = usePathname();
  const { preferences, trackFeatureUsage } = useUserPreferences();
  const { journeyStage, nextAction } = useJourneyState();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasUnconnectedPlatforms, setHasUnconnectedPlatforms] = useState(false);
  const needsJourneySetup = journeyStage !== 'returning_manager';

  // Check for unconnected platforms to show badge on Settings
  useEffect(() => {
    const checkConnections = () => {
      try {
        const stored = localStorage.getItem('sw_preferences');
        if (stored) {
          const prefs = JSON.parse(stored);
          const connections = prefs.connections || {};
          const platforms = ['telegram', 'xmtp', 'whatsapp'];
          const unconnected = platforms.filter(p => !connections[p]?.connected);
          setHasUnconnectedPlatforms(unconnected.length > 0);
        } else {
          // No preferences stored yet = all platforms unconnected
          setHasUnconnectedPlatforms(true);
        }
      } catch {
        setHasUnconnectedPlatforms(true);
      }
    };
    checkConnections();
    // Re-check on storage changes (e.g., from settings page)
    window.addEventListener('storage', checkConnections);
    // Also listen for custom event from settings page updates
    const handlePrefsUpdate = () => checkConnections();
    window.addEventListener('preferences-updated', handlePrefsUpdate);
    return () => {
      window.removeEventListener('storage', checkConnections);
      window.removeEventListener('preferences-updated', handlePrefsUpdate);
    };
  }, []);

  // Define all navigation items with their unlock conditions
  const allNavItems = [
    { 
      path: '/dashboard', 
      icon: Home, 
      label: 'Dashboard', 
      priority: 100,
      unlockLevel: 'basic' as const,
    },
    { 
      path: '/match', 
      icon: Target, 
      label: 'Matches', 
      priority: 90,
      unlockLevel: 'basic' as const,
    },
    { 
      path: '/stats', 
      icon: BarChart3, 
      label: 'Stats', 
      priority: 80,
      unlockLevel: 'basic' as const,
    },
    { 
      path: '/analytics', 
      icon: Activity, 
      label: 'Analytics', 
      priority: 75,
      unlockLevel: 'intermediate' as const,
      showCondition: () => preferences.uiComplexity !== 'simple',
    },
    { 
      path: '/squad', 
      icon: Users, 
      label: 'Squad', 
      priority: 70,
      unlockLevel: 'basic' as const,
    },
    { 
      path: '/community', 
      icon: MessageCircle, 
      label: 'Community', 
      priority: 60,
      unlockLevel: 'intermediate' as const,
      showCondition: () => preferences.preferredFeatures.social === 'active',
    },
    // /achievements redirects to /reputation — not a standalone nav destination
    // /verification redirects to /match?mode=verify — not a standalone nav destination
    // /rivalries redirects to /match — not a standalone nav destination
    // /challenges redirects to /squad — not a standalone nav destination
    { 
      path: '/settings', 
      icon: Settings, 
      label: 'Settings', 
      priority: 65,
      unlockLevel: 'basic' as const,
      badge: 'connections' as const, // Shows indicator when platforms not connected
    },
  ];

  // Filter navigation items based on user preferences and unlock level
  const visibleNavItems = allNavItems.filter(item => {
    // Check unlock level
    const levelMatch = 
      item.unlockLevel === 'basic' ||
      (item.unlockLevel === 'intermediate' && preferences.uiComplexity !== 'simple');

    // Check show condition
    const conditionMatch = !item.showCondition || item.showCondition();

    // Check if feature is unlocked
    const featureKey = item.path.slice(1) || 'dashboard';
    const isUnlocked = preferences.unlockedFeatures.includes(featureKey);

    return levelMatch && conditionMatch && (isUnlocked || item.unlockLevel === 'basic');
  }).sort((a, b) => {
    // Prioritize recently used features
    const aRecentlyUsed = preferences.usagePatterns.lastActiveFeatures.includes(a.path.slice(1) || 'dashboard');
    const bRecentlyUsed = preferences.usagePatterns.lastActiveFeatures.includes(b.path.slice(1) || 'dashboard');
    
    if (aRecentlyUsed && !bRecentlyUsed) return -1;
    if (!aRecentlyUsed && bRecentlyUsed) return 1;
    
    return b.priority - a.priority;
  });

  // Split bottom nav: primary slots + overflow into More sheet
  const primaryItems = visibleNavItems.slice(0, BOTTOM_NAV_MAX - 1);
  const overflowItems = visibleNavItems.slice(BOTTOM_NAV_MAX - 1);
  const hasOverflow = overflowItems.length > 0;

  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => pathname === path;
  const activeLabel = visibleNavItems.find(i => isActive(i.path))?.label ?? 'SportWarren';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close More sheet on route change
  useEffect(() => { setIsMoreOpen(false); }, [pathname]);

  // Lock body scroll when More sheet open
  useEffect(() => {
    document.body.style.overflow = isMoreOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMoreOpen]);

  const handleNavClick = useCallback((path: string) => {
    trackFeatureUsage(path.slice(1) || 'dashboard');
  }, [trackFeatureUsage]);

  // Keyboard navigation for desktop (Cmd/Ctrl + key)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only on desktop, with modifier key, and not in input fields
    if (window.innerWidth < 768) return;
    if (!(e.metaKey || e.ctrlKey)) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    const path = NAV_SHORTCUTS[e.code];
    if (path) {
      e.preventDefault();
      // Find if this path is visible to the user
      const targetItem = visibleNavItems.find(item => item.path === path);
      if (targetItem) {
        handleNavClick(path);
        window.location.href = path;
      }
    }
  }, [handleNavClick, visibleNavItems]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const helpTips = [
    {
      id: 'navigation-help',
      title: 'Navigation Tips',
      content: `Next best action: ${nextAction.label}. The rest of the navigation becomes more useful once that step is done.`,
      trigger: 'auto' as const,
      position: 'bottom' as const,
      showCondition: () => preferences.featureDiscoveryLevel < 20 || needsJourneySetup,
    },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-3 group"
              onClick={() => handleNavClick('/dashboard')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">SportWarren</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">{getJourneyNavigationSubtitle(journeyStage)}</p>
              </div>
            </Link>

            <ContextualHelp feature="navigation" tips={helpTips}>
              <div className="flex items-center space-x-1">
                {visibleNavItems.slice(1).map(({ path, icon: Icon, label, badge }) => (
                  <Link
                    key={path}
                    href={path}
                    onClick={() => handleNavClick(path)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive(path)
                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="relative">
                      <Icon className="w-4 h-4" />
                      {path === '/dashboard' && needsJourneySetup && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
                      )}
                      {badge === 'connections' && hasUnconnectedPlatforms && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    <span className="font-medium text-sm">{label}</span>
                  </Link>
                ))}
                
                {/* Quick Action Button for Organizers */}
                {preferences.primaryRole === 'organizer' && (
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span className="font-medium text-sm">Quick Log</span>
                  </button>
                )}

                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle dark mode"
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <AccountStatusControl />
              </div>
            </ContextualHelp>
          </div>
        </div>
      </nav>

      {/* ── Mobile Top Bar — logo + active page title ─────────────── */}
      <nav className={`md:hidden fixed top-0 left-0 right-0 z-50 transition-shadow duration-200 ${
        isScrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-md' : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md'
      } border-b border-gray-200 dark:border-gray-700`}>
        <div className="flex items-center h-14 px-4 gap-3">
          <Link href="/dashboard" className="touch-manipulation shrink-0" onClick={() => handleNavClick('/dashboard')}>
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
          </Link>
          <span className="flex-1 text-base font-semibold text-gray-900 dark:text-white truncate">{activeLabel}</span>
          <div className="flex items-center gap-2 shrink-0">
            {preferences.primaryRole === 'organizer' ? (
              <Link
                href="/match?mode=capture"
                onClick={() => handleNavClick('/match')}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold touch-manipulation active:bg-green-700 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Log
              </Link>
            ) : (
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-manipulation shrink-0"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <AccountStatusControl compact />
          </div>
        </div>
      </nav>

      {/* ── Mobile Bottom Tab Bar ─────────────────────────────────── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className={`grid gap-0.5 px-1 pt-1 pb-1 ${
          (primaryItems.length + (hasOverflow ? 1 : 0)) <= 4 ? 'grid-cols-4' : 'grid-cols-5'
        }`}>
          {primaryItems.map(({ path, icon: Icon, label, badge }) => (
            <Link
              key={path}
              href={path}
              onClick={() => handleNavClick(path)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-colors touch-manipulation min-h-[3.25rem] ${
                isActive(path) ? 'text-green-600 bg-green-50 dark:bg-green-900/30' : 'text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive(path) ? 'scale-110' : ''}`} />
                {path === '/dashboard' && needsJourneySetup && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
                )}
                {badge === 'connections' && hasUnconnectedPlatforms && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                )}
              </div>
              <span className="text-[10px] font-medium leading-tight">{label}</span>
            </Link>
          ))}
          {hasOverflow && (
            <button
              onClick={() => setIsMoreOpen(true)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-colors touch-manipulation min-h-[3.25rem] ${
                overflowItems.some(i => isActive(i.path)) ? 'text-green-600 bg-green-50 dark:bg-green-900/30' : 'text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800'
              }`}
            >
              <MoreHorizontal className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium leading-tight">More</span>
            </button>
          )}
        </div>
      </div>

      {/* ── More Sheet ───────────────────────────────────────────── */}
      {isMoreOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setIsMoreOpen(false)} />
          <div
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">More</span>
              <button onClick={() => setIsMoreOpen(false)} className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800 touch-manipulation">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 p-4">
              {overflowItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  href={path}
                  onClick={() => handleNavClick(path)}
                  className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl touch-manipulation transition-colors ${
                    isActive(path) ? 'bg-green-50 dark:bg-green-900/30 text-green-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium text-center">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Spacer for fixed bars - skip link target */}
      <div id="main-content" className="nav-spacer-top" />
    </>
  );
};
