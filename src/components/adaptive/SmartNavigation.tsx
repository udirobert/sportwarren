import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Target, BarChart3, Users, Trophy, MessageCircle, Menu, X, Plus, Activity } from 'lucide-react';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { ContextualHelp } from './ContextualHelp';

export const SmartNavigation: React.FC = () => {
  const location = useLocation();
  const { preferences, trackFeatureUsage } = useUserPreferences();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Define all navigation items with their unlock conditions
  const allNavItems = [
    { 
      path: '/', 
      icon: Home, 
      label: 'Dashboard', 
      priority: 100,
      unlockLevel: 'basic' as const,
    },
    { 
      path: '/match', 
      icon: Target, 
      label: 'Match', 
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
      unlockLevel: 'intermediate' as const,
      showCondition: () => preferences.primaryRole === 'organizer' || 
        preferences.preferredFeatures.social !== 'minimal',
    },
    { 
      path: '/community', 
      icon: MessageCircle, 
      label: 'Community', 
      priority: 60,
      unlockLevel: 'intermediate' as const,
      showCondition: () => preferences.preferredFeatures.social === 'active',
    },
    { 
      path: '/achievements', 
      icon: Trophy, 
      label: 'Achievements', 
      priority: 50,
      unlockLevel: 'intermediate' as const,
      showCondition: () => preferences.preferredFeatures.gamification !== 'none',
    },
  ];

  // Filter navigation items based on user preferences and unlock level
  const visibleNavItems = allNavItems.filter(item => {
    // Check unlock level
    const levelMatch = 
      item.unlockLevel === 'basic' ||
      (item.unlockLevel === 'intermediate' && preferences.uiComplexity !== 'simple') ||
      (item.unlockLevel === 'advanced' && preferences.uiComplexity === 'advanced');

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

  const isActive = (path: string) => location.pathname === path;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Track navigation usage
  const handleNavClick = (path: string) => {
    const feature = path.slice(1) || 'dashboard';
    trackFeatureUsage(feature);
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const helpTips = [
    {
      id: 'navigation-help',
      title: 'Navigation Tips',
      content: 'Use the navigation to explore different features. More options will unlock as you use the app!',
      trigger: 'auto' as const,
      position: 'bottom' as const,
      showCondition: () => preferences.featureDiscoveryLevel < 20,
    },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex items-center justify-between h-16 animate-fade-in-down">
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
              onClick={() => handleNavClick('/')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-green-500/50">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-green-700 bg-clip-text text-transparent">SportWarren</h1>
                <p className="text-xs text-gray-600 font-medium">Track your legend</p>
              </div>
            </Link>

            <ContextualHelp feature="navigation" tips={helpTips}>
              <div className="flex items-center space-x-1">
                {visibleNavItems.slice(1).map(({ path, icon: Icon, label }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => handleNavClick(path)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                      isActive(path)
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-600/30'
                        : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive(path) ? 'animate-pulse' : ''}`} />
                    <span className="font-semibold text-sm">{label}</span>
                  </Link>
                ))}
                
                {/* Quick Action Button for Organizers */}
                {preferences.primaryRole === 'organizer' && (
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/50">
                    <Plus className="w-4 h-4" />
                    <span className="font-semibold text-sm">Quick Log</span>
                  </button>
                )}
              </div>
            </ContextualHelp>
          </div>
        </div>
      </nav>

      {/* Mobile Top Navigation */}
      <nav className={`md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-white/90 backdrop-blur-md'
      } border-b border-gray-200`}>
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            <Link 
              to="/" 
              className="flex items-center space-x-2 touch-manipulation group"
              onClick={() => handleNavClick('/')}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-md group-active:scale-95 transition-transform">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-green-700 bg-clip-text text-transparent">SportWarren</h1>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-out Menu */}
        <div className={`absolute top-full left-0 right-0 bg-white border-b border-gray-200 transform transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'translate-y-0 opacity-100 visible' 
            : '-translate-y-full opacity-0 invisible'
        }`}>
          <div className="px-4 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="grid gap-2">
              {visibleNavItems.slice(1).map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => handleNavClick(path)}
                  className={`flex items-center space-x-3 p-4 rounded-xl transition-all touch-manipulation ${
                    isActive(path)
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Adaptive */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 safe-area-pb shadow-2xl">
        <div className={`grid gap-1 p-2 ${
          visibleNavItems.length <= 4 ? 'grid-cols-4' : 
          visibleNavItems.length <= 5 ? 'grid-cols-5' : 'grid-cols-6'
        }`}>
          {visibleNavItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              onClick={() => handleNavClick(path)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 touch-manipulation min-h-[3.5rem] ${
                isActive(path)
                  ? 'text-green-600 bg-gradient-to-br from-green-50 to-green-100 scale-105 shadow-lg shadow-green-500/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100 active:scale-95'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 transition-all duration-300 ${
                isActive(path) ? 'scale-125 animate-bounce-gentle' : ''
              }`} />
              <span className={`text-xs font-medium leading-tight text-center ${
                isActive(path) ? 'font-semibold' : ''
              }`}>{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Spacer for fixed navigation */}
      <div className="h-14 md:h-16"></div>
      <div className="h-20 md:h-0"></div>
    </>
  );
};