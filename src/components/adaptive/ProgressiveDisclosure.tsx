import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Info, Sparkles } from 'lucide-react';
import { useUserPreferences } from '../../hooks/useUserPreferences';

interface ProgressiveDisclosureProps {
  children: React.ReactNode;
  level: 'basic' | 'intermediate' | 'advanced';
  feature: string;
  title?: string;
  description?: string;
  unlockCondition?: () => boolean;
  className?: string;
}

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  children,
  level,
  feature,
  title,
  description,
  unlockCondition,
  className = '',
}) => {
  const { preferences, unlockFeature, trackFeatureUsage } = useUserPreferences();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUnlockHint, setShowUnlockHint] = useState(false);

  const isUnlocked = preferences.unlockedFeatures.includes(feature);
  const shouldShow = level === 'basic' || 
    (level === 'intermediate' && preferences.uiComplexity !== 'simple') ||
    (level === 'advanced' && preferences.uiComplexity === 'advanced');

  // Check unlock conditions
  useEffect(() => {
    if (!isUnlocked && unlockCondition && unlockCondition()) {
      const wasUnlocked = unlockFeature(feature);
      if (wasUnlocked) {
        setShowUnlockHint(true);
        setTimeout(() => setShowUnlockHint(false), 3000);
      }
    }
  }, [isUnlocked, unlockCondition, unlockFeature, feature]);

  // Track usage when expanded
  useEffect(() => {
    if (isExpanded && isUnlocked) {
      trackFeatureUsage(feature);
    }
  }, [isExpanded, isUnlocked, feature, trackFeatureUsage]);

  if (!shouldShow && !isUnlocked) {
    return null;
  }

  if (!isUnlocked) {
    return (
      <div className={`relative border border-gray-200 rounded-lg p-4 bg-gray-50 ${className}`}>
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="w-6 h-6 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
          <span className="text-sm font-medium">Feature locked</span>
          {description && (
            <Info className="w-4 h-4 text-gray-400" title={description} />
          )}
        </div>
        {unlockCondition && (
          <p className="text-xs text-gray-400 mt-2">
            Complete more actions to unlock this feature
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {showUnlockHint && (
        <div className="absolute -top-2 -right-2 z-10 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 animate-bounce">
          <Sparkles className="w-3 h-3" />
          <span>New!</span>
        </div>
      )}
      
      {title && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{title}</span>
            {level === 'advanced' && (
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                Advanced
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>
      )}
      
      {(isExpanded || !title) && (
        <div className={title ? 'mt-2' : ''}>
          {children}
        </div>
      )}
    </div>
  );
};