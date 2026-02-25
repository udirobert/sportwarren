import React, { useState, useEffect } from 'react';
import { HelpCircle, X, Lightbulb, ArrowRight } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface HelpTip {
  id: string;
  title: string;
  content: string;
  trigger: 'hover' | 'click' | 'auto';
  position: 'top' | 'bottom' | 'left' | 'right';
  showCondition?: () => boolean;
  dismissible?: boolean;
}

interface ContextualHelpProps {
  feature: string;
  tips: HelpTip[];
  children: React.ReactNode;
  className?: string;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  feature,
  tips,
  children,
  className = '',
}) => {
  const { preferences, dismissTutorial } = useUserPreferences();
  const [activeTip, setActiveTip] = useState<HelpTip | null>(null);
  const [showAutoTips, setShowAutoTips] = useState(false);

  // Check if user needs help with this feature
  const needsHelp = !preferences.dismissedTutorials.includes(feature) &&
    preferences.uiComplexity === 'simple' &&
    !preferences.usagePatterns.mostUsedFeatures.includes(feature);

  // Show auto tips for new users
  useEffect(() => {
    if (needsHelp) {
      const autoTip = tips.find(tip => tip.trigger === 'auto' && 
        (!tip.showCondition || tip.showCondition()));
      
      if (autoTip) {
        const timer = setTimeout(() => {
          setActiveTip(autoTip);
          setShowAutoTips(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [needsHelp, tips]);

  const handleDismiss = () => {
    setActiveTip(null);
    setShowAutoTips(false);
    if (activeTip?.dismissible !== false) {
      dismissTutorial(feature);
    }
  };

  const handleTipClick = (tip: HelpTip) => {
    if (tip.trigger === 'click') {
      setActiveTip(activeTip?.id === tip.id ? null : tip);
    }
  };

  const handleTipHover = (tip: HelpTip, isHovering: boolean) => {
    if (tip.trigger === 'hover') {
      setActiveTip(isHovering ? tip : null);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {children}
      
      {/* Help trigger buttons */}
      {needsHelp && tips.some(tip => tip.trigger === 'click') && (
        <button
          onClick={() => {
            const clickTip = tips.find(tip => tip.trigger === 'click');
            if (clickTip) handleTipClick(clickTip);
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors z-10"
        >
          <HelpCircle className="w-3 h-3" />
        </button>
      )}

      {/* Hover areas for hover tips */}
      {tips
        .filter(tip => tip.trigger === 'hover')
        .map((tip) => (
          <div
            key={tip.id}
            className="absolute inset-0 z-5"
            onMouseEnter={() => handleTipHover(tip, true)}
            onMouseLeave={() => handleTipHover(tip, false)}
          />
        ))}

      {/* Active tip display */}
      {activeTip && (
        <div className={`absolute z-20 ${getPositionClasses(activeTip.position)}`}>
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <h4 className="font-medium text-gray-900 text-sm">{activeTip.title}</h4>
              </div>
              {activeTip.dismissible !== false && (
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{activeTip.content}</p>
            
            {showAutoTips && (
              <div className="flex items-center justify-between">
                <button
                  onClick={handleDismiss}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Don't show again
                </button>
                <button
                  onClick={() => setActiveTip(null)}
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  <span>Got it</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          
          {/* Arrow */}
          <div className={`absolute ${getArrowClasses(activeTip.position)}`}>
            <div className="w-2 h-2 bg-white border border-gray-200 transform rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
};

function getPositionClasses(position: string): string {
  switch (position) {
    case 'top':
      return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    case 'bottom':
      return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
    case 'left':
      return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
    case 'right':
      return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
    default:
      return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
  }
}

function getArrowClasses(position: string): string {
  switch (position) {
    case 'top':
      return 'top-full left-1/2 transform -translate-x-1/2 -mt-1';
    case 'bottom':
      return 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1';
    case 'left':
      return 'left-full top-1/2 transform -translate-y-1/2 -ml-1';
    case 'right':
      return 'right-full top-1/2 transform -translate-y-1/2 -mr-1';
    default:
      return 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1';
  }
}