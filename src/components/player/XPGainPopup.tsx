"use client";

import React, { useEffect, useState } from 'react';
import { X, TrendingUp, ChevronUp, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AttributeType } from '@/types';
import { ATTRIBUTE_NAMES, getAttributeTextColor } from '@/lib/utils';

interface XPGainNotification {
  id: string;
  attribute: AttributeType;
  xpGained: number;
  newRating?: number;
  levelsGained: number;
}

// Local mock data for XP notifications
const MOCK_XP_NOTIFICATIONS: XPGainNotification[] = [
  { id: '1', attribute: 'shooting', xpGained: 125, newRating: 88, levelsGained: 1 },
  { id: '2', attribute: 'passing', xpGained: 85, levelsGained: 0 },
  { id: '3', attribute: 'physical', xpGained: 95, levelsGained: 0 },
];

export { MOCK_XP_NOTIFICATIONS as MOCK_NOTIFICATIONS };

export const XPGainPopup: React.FC = () => {
  const [notifications, setNotifications] = useState<XPGainNotification[]>([]);
  const [showDemo, setShowDemo] = useState(false);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const activeNotifications = showDemo ? MOCK_XP_NOTIFICATIONS : notifications;

  return (
    <>
      <div className="fixed bottom-24 right-4 z-[100] flex flex-col items-end space-y-3 pointer-events-none">
        <AnimatePresence>
          {activeNotifications.map((notification) => (
            <XPGainCard
              key={notification.id}
              notification={notification}
              onDismiss={() => dismissNotification(notification.id)}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Demo Trigger - only in dev */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDemo(!showDemo)}
          className="bg-gray-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all border border-white/10"
        >
          {showDemo ? 'Hide XP Demo' : 'Test Level Up'}
        </button>
      </div>
    </>
  );
};

const XPGainCard: React.FC<{ notification: XPGainNotification; onDismiss: () => void }> = ({ 
  notification, 
  onDismiss 
}) => {
  const isLevelUp = notification.levelsGained > 0;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ x: 300, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 300, opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`pointer-events-auto relative overflow-hidden bg-white rounded-2xl shadow-2xl border-2 p-1 w-72 ${
        isLevelUp ? 'border-yellow-400 shadow-yellow-500/20' : 'border-blue-500/20 shadow-blue-500/10'
      }`}
    >
      {/* Level Up Glow Effect */}
      {isLevelUp && (
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-yellow-400 pointer-events-none"
        />
      )}

      <div className="relative bg-white rounded-[14px] p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center relative ${
              isLevelUp 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/30' 
                : 'bg-gradient-to-br from-blue-500 to-blue-600'
            }`}>
              {isLevelUp ? (
                <Zap className="w-6 h-6 text-white fill-white" />
              ) : (
                <TrendingUp className="w-6 h-6 text-white" />
              )}
              {isLevelUp && (
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 rounded-xl border-2 border-white"
                />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-xl font-black text-gray-900">+{notification.xpGained}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">XP</span>
              </div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">
                {ATTRIBUTE_NAMES[notification.attribute]}
              </p>
            </div>
          </div>
          <button onClick={onDismiss} className="text-gray-300 hover:text-gray-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLevelUp ? (
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 bg-yellow-50 rounded-xl p-3 border border-yellow-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">Attribute UP</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-400">{notification.newRating! - 1}</span>
                <ChevronUp className="w-4 h-4 text-green-500" />
                <span className={`text-lg font-black ${getAttributeTextColor(notification.newRating!)}`}>
                  {notification.newRating}
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="mt-4 space-y-1">
            <div className="flex justify-between items-end">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Progress to Level</span>
              <span className="text-[10px] font-bold text-blue-600">60%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
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
                <span className="text-gray-700">{ATTRIBUTE_NAMES[gain.attribute]}</span>
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
            <span className="text-gray-600">{ATTRIBUTE_NAMES[gain.attribute]}</span>
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
