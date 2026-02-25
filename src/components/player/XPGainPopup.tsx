"use client";

import React, { useEffect, useState } from 'react';
import { X, TrendingUp, Star } from 'lucide-react';
import type { AttributeType } from '@/types';

interface XPGainNotification {
  id: string;
  attribute: AttributeType;
  xpGained: number;
  newRating?: number;
  levelsGained: number;
}

// Mock notifications for demo
const MOCK_NOTIFICATIONS: XPGainNotification[] = [
  { id: '1', attribute: 'shooting', xpGained: 125, newRating: 88, levelsGained: 1 },
  { id: '2', attribute: 'passing', xpGained: 85, levelsGained: 0 },
  { id: '3', attribute: 'physical', xpGained: 95, levelsGained: 0 },
];

export const XPGainPopup: React.FC = () => {
  const [notifications, setNotifications] = useState<XPGainNotification[]>([]);
  const [showDemo, setShowDemo] = useState(false);

  // For demo purposes - show mock notifications
  useEffect(() => {
    // In production, this would come from a context or state management
    // setNotifications(MOCK_NOTIFICATIONS);
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0 && !showDemo) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDemo(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm hover:bg-blue-700 transition-colors"
        >
          Show XP Demo
        </button>
      </div>
    );
  }

  const displayNotifications = showDemo ? MOCK_NOTIFICATIONS : notifications;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {showDemo && (
        <button
          onClick={() => setShowDemo(false)}
          className="mb-2 text-xs text-gray-500 hover:text-gray-700"
        >
          Hide Demo
        </button>
      )}
      {displayNotifications.map((notification) => (
        <XPGainCard
          key={notification.id}
          notification={notification}
          onDismiss={() => dismissNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface XPGainCardProps {
  notification: XPGainNotification;
  onDismiss: () => void;
}

const XPGainCard: React.FC<XPGainCardProps> = ({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, [onDismiss]);

  const attributeNames: Record<AttributeType, string> = {
    pace: 'Pace',
    shooting: 'Shooting',
    passing: 'Passing',
    dribbling: 'Dribbling',
    defending: 'Defending',
    physical: 'Physical',
    gk_diving: 'GK Diving',
    gk_handling: 'GK Handling',
    gk_kicking: 'GK Kicking',
    gk_reflexes: 'GK Reflexes',
    gk_speed: 'GK Speed',
    gk_positioning: 'GK Positioning',
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-72 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            notification.levelsGained > 0 
              ? 'bg-purple-100 text-purple-600' 
              : 'bg-green-100 text-green-600'
          }`}>
            {notification.levelsGained > 0 ? (
              <Star className="w-5 h-5" />
            ) : (
              <TrendingUp className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              +{notification.xpGained} XP
            </p>
            <p className="text-sm text-gray-600">
              {attributeNames[notification.attribute]}
            </p>
            {notification.levelsGained > 0 && (
              <p className="text-sm text-purple-600 font-medium">
                Level up! Now {notification.newRating}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onDismiss, 300);
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar for next level */}
      {notification.levelsGained === 0 && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: '60%' }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Progress to next level</p>
        </div>
      )}
    </div>
  );
};

// XP Gain Summary component for match end screen
interface XPGainSummaryProps {
  totalXP: number;
  attributeGains: Array<{
    attribute: AttributeType;
    xp: number;
    oldRating: number;
    newRating: number;
  }>;
}

export const XPGainSummary: React.FC<XPGainSummaryProps> = ({ 
  totalXP, 
  attributeGains 
}) => {
  const attributeNames: Record<AttributeType, string> = {
    pace: 'Pace',
    shooting: 'Shooting',
    passing: 'Passing',
    dribbling: 'Dribbling',
    defending: 'Defending',
    physical: 'Physical',
    gk_diving: 'GK Diving',
    gk_handling: 'GK Handling',
    gk_kicking: 'GK Kicking',
    gk_reflexes: 'GK Reflexes',
    gk_speed: 'GK Speed',
    gk_positioning: 'GK Positioning',
  };

  const leveledUpAttributes = attributeGains.filter(g => g.newRating > g.oldRating);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">+{totalXP} XP Earned!</h3>
        <p className="text-gray-600">Match completed successfully</p>
      </div>

      {leveledUpAttributes.length > 0 && (
        <div className="mb-4 p-4 bg-white rounded-lg">
          <p className="font-semibold text-purple-900 mb-2">🎉 Level Ups!</p>
          <div className="space-y-2">
            {leveledUpAttributes.map((gain, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-gray-700">{attributeNames[gain.attribute]}</span>
                <span className="font-bold text-purple-600">
                  {gain.oldRating} → {gain.newRating}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="font-medium text-gray-700">Attribute Gains:</p>
        {attributeGains.map((gain, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg">
            <span className="text-gray-600">{attributeNames[gain.attribute]}</span>
            <div className="flex items-center space-x-2">
              <span className="text-green-600 font-medium">+{gain.xp} XP</span>
              {gain.newRating > gain.oldRating && (
                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                  LEVEL UP
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
