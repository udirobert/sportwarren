import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  color?: 'green' | 'blue' | 'orange' | 'purple';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  color = 'green',
  onClick
}) => {
  const colorClasses = {
    green: 'bg-green-600 text-white',
    blue: 'bg-blue-600 text-white',
    orange: 'bg-orange-600 text-white',
    purple: 'bg-purple-600 text-white',
  };

  return (
    <div 
      className={`
        bg-white rounded-xl border border-gray-200 shadow-sm 
        hover:shadow-md active:shadow-lg transition-all duration-200 
        p-4 md:p-6 touch-manipulation
        ${onClick ? 'cursor-pointer select-none' : ''}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 mb-2 break-words">{value}</p>
          {trend && (
            <div className={`flex items-center text-xs md:text-sm ${
              trend.positive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className="font-medium">
                {trend.positive ? '+' : ''}{trend.value}%
              </span>
              <span className="ml-1 text-gray-500 hidden sm:inline">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 ${colorClasses[color]}`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      </div>
    </div>
  );
};