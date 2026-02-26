import { useState, useEffect, useCallback } from 'react';

export interface UserPreferences {
  // Core interests
  primaryRole: 'player' | 'organizer' | 'fan' | 'coach';
  sportsInterests: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  
  // Feature preferences
  preferredFeatures: {
    statistics: 'basic' | 'detailed' | 'advanced';
    social: 'minimal' | 'moderate' | 'active';
    gamification: 'none' | 'light' | 'full';
    notifications: 'essential' | 'moderate' | 'all';
  };
  
  // UI preferences
  uiComplexity: 'simple' | 'standard' | 'advanced';
  dashboardLayout: 'minimal' | 'balanced' | 'comprehensive';
  
  // Behavioral data
  usagePatterns: {
    mostUsedFeatures: string[];
    timeSpentInSections: Record<string, number>;
    lastActiveFeatures: string[];
    completedOnboarding: boolean;
    onboardingSkipped?: boolean;
    onboardingSkippedAt?: string;
  };
  
  // Progressive disclosure state
  unlockedFeatures: string[];
  dismissedTutorials: string[];
  featureDiscoveryLevel: number; // 0-100
}

const DEFAULT_PREFERENCES: UserPreferences = {
  primaryRole: 'player',
  sportsInterests: ['football'],
  experienceLevel: 'beginner',
  preferredFeatures: {
    statistics: 'basic',
    social: 'moderate',
    gamification: 'light',
    notifications: 'moderate',
  },
  uiComplexity: 'simple',
  dashboardLayout: 'minimal',
  usagePatterns: {
    mostUsedFeatures: [],
    timeSpentInSections: {},
    lastActiveFeatures: [],
    completedOnboarding: false,
  },
  unlockedFeatures: ['dashboard', 'match-tracker', 'basic-stats'],
  dismissedTutorials: [],
  featureDiscoveryLevel: 0,
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from storage
  useEffect(() => {
    const loadPreferences = async () => {
      if (typeof window === 'undefined') return;
      try {
        const stored = localStorage.getItem('sportwarren_preferences');
        if (stored) {
          const parsed = JSON.parse(stored);
          setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences to storage
  const savePreferences = useCallback((newPreferences: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sportwarren_preferences', JSON.stringify(updated));
    }
  }, [preferences]);

  // Track feature usage
  const trackFeatureUsage = useCallback((feature: string, timeSpent: number = 0) => {
    const updatedPatterns = {
      ...preferences.usagePatterns,
      mostUsedFeatures: [
        feature,
        ...preferences.usagePatterns.mostUsedFeatures.filter(f => f !== feature)
      ].slice(0, 10),
      timeSpentInSections: {
        ...preferences.usagePatterns.timeSpentInSections,
        [feature]: (preferences.usagePatterns.timeSpentInSections[feature] || 0) + timeSpent,
      },
      lastActiveFeatures: [
        feature,
        ...preferences.usagePatterns.lastActiveFeatures.filter(f => f !== feature)
      ].slice(0, 5),
    };

    savePreferences({ usagePatterns: updatedPatterns });
  }, [preferences, savePreferences]);

  // Unlock new features based on usage
  const unlockFeature = useCallback((feature: string) => {
    if (!preferences.unlockedFeatures.includes(feature)) {
      const newUnlocked = [...preferences.unlockedFeatures, feature];
      const newDiscoveryLevel = Math.min(100, preferences.featureDiscoveryLevel + 10);
      
      savePreferences({
        unlockedFeatures: newUnlocked,
        featureDiscoveryLevel: newDiscoveryLevel,
      });
      
      return true; // Feature was newly unlocked
    }
    return false; // Feature was already unlocked
  }, [preferences, savePreferences]);

  // Dismiss tutorial
  const dismissTutorial = useCallback((tutorialId: string) => {
    if (!preferences.dismissedTutorials.includes(tutorialId)) {
      savePreferences({
        dismissedTutorials: [...preferences.dismissedTutorials, tutorialId],
      });
    }
  }, [preferences, savePreferences]);

  // Update UI complexity based on usage
  const adaptUIComplexity = useCallback(() => {
    const totalUsage = Object.values(preferences.usagePatterns.timeSpentInSections).reduce((a, b) => a + b, 0);
    const uniqueFeaturesUsed = preferences.usagePatterns.mostUsedFeatures.length;
    
    let newComplexity: 'simple' | 'standard' | 'advanced' = 'simple';
    
    if (totalUsage > 3600000 && uniqueFeaturesUsed > 5) { // 1 hour+ and 5+ features
      newComplexity = 'advanced';
    } else if (totalUsage > 1800000 && uniqueFeaturesUsed > 3) { // 30 min+ and 3+ features
      newComplexity = 'standard';
    }
    
    if (newComplexity !== preferences.uiComplexity) {
      savePreferences({ uiComplexity: newComplexity });
    }
  }, [preferences, savePreferences]);

  return {
    preferences,
    isLoading,
    savePreferences,
    trackFeatureUsage,
    unlockFeature,
    dismissTutorial,
    adaptUIComplexity,
  };
}