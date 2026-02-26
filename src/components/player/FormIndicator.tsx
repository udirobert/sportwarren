"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { usePlayerForm, useFormHistory } from '@/hooks/player/usePlayerForm';
import type { PlayerAttributes } from '@/types';
import {
  FORM_ARROWS,
  FORM_LABELS,
  getFormColor,
  getFormBgColor,
  getFormBorderColor,
} from '@/lib/utils';

interface FormIndicatorProps {
  attributes: PlayerAttributes | null;
  showChart?: boolean;
}

export const FormIndicator: React.FC<FormIndicatorProps> = ({ 
  attributes, 
  showChart = false 
}) => {
  const { form, recentRatings, averageRating } = usePlayerForm(attributes);
  const formHistory = useFormHistory(attributes);

  const arrow = FORM_ARROWS[form.value] || '→';
  const label = FORM_LABELS[form.value] || 'Average';

  return (
    <Card className={`border-2 ${getFormBorderColor(form.value)}`}>
      <div className="space-y-4">
        {/* Main Form Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getFormBgColor(form.value)}`}>
              <span className="text-2xl font-bold">{arrow}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Form</h3>
              <p className="text-sm text-gray-600">{label}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {averageRating > 0 ? averageRating : '-'}
            </div>
            <div className="text-xs text-gray-500">Avg Rating</div>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center space-x-2">
          {form.trend === 'up' && (
            <>
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Improving</span>
            </>
          )}
          {form.trend === 'down' && (
            <>
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600 font-medium">Declining</span>
            </>
          )}
          {form.trend === 'stable' && (
            <>
              <Minus className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Stable</span>
            </>
          )}
        </div>

        {/* Recent Ratings */}
        {recentRatings.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Last {recentRatings.length} Matches:</p>
            <div className="flex items-center space-x-2">
              {recentRatings.map((rating, idx) => (
                <div
                  key={idx}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    rating >= 8 ? 'bg-green-100 text-green-700' :
                    rating >= 7 ? 'bg-blue-100 text-blue-700' :
                    rating >= 6 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}
                  title={`Match ${idx + 1}: ${rating}/10`}
                >
                  {rating}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form History Chart */}
        {showChart && formHistory.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Form Trend:</p>
            <div className="h-16 flex items-end space-x-1">
              {formHistory.map((entry, idx) => {
                const height = Math.max(10, (entry.rating / 10) * 100);
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className={`w-full rounded-t ${
                        entry.rating >= 8 ? 'bg-green-400' :
                        entry.rating >= 7 ? 'bg-blue-400' :
                        entry.rating >= 6 ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${entry.rating}/10`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Older</span>
              <span>Recent</span>
            </div>
          </div>
        )}

        {/* Form Legend */}
        <div className="pt-3 border-t border-gray-200">
          <div className="grid grid-cols-5 gap-1 text-center">
            {[-5, -2, 0, 2, 5].map((formValue) => (
              <div key={formValue} className="space-y-1">
                <div className={`text-lg ${getFormColor(formValue)}`}>
                  {FORM_ARROWS[formValue] || '→'}
                </div>
                <div className="text-xs text-gray-400">{formValue > 0 ? `+${formValue}` : formValue}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Compact form badge for lists
interface FormBadgeProps {
  form: number;
  size?: 'sm' | 'md' | 'lg';
}

export const FormBadge: React.FC<FormBadgeProps> = ({ form, size = 'md' }) => {
  const arrow = FORM_ARROWS[form] || '→';
  const label = FORM_LABELS[form] || 'Average';
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg flex items-center justify-center font-bold ${getFormBgColor(form)}`}
      title={label}
    >
      {arrow}
    </div>
  );
};

// Form comparison component
interface FormComparisonProps {
  playerForm: number;
  teamAverage: number;
}

export const FormComparison: React.FC<FormComparisonProps> = ({ playerForm, teamAverage }) => {
  const difference = playerForm - teamAverage;
  const isAbove = difference > 0;
  const isEqual = Math.abs(difference) < 0.5;

  return (
    <div className="flex items-center space-x-2 text-sm">
      <Activity className="w-4 h-4 text-gray-400" />
      <span className="text-gray-600">vs Team:</span>
      {isEqual ? (
        <span className="text-gray-600">Average</span>
      ) : (
        <span className={`font-medium ${isAbove ? 'text-green-600' : 'text-red-600'}`}>
          {isAbove ? '+' : ''}{difference.toFixed(1)}
        </span>
      )}
    </div>
  );
};
