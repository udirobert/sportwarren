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
        bg-white rounded-xl border border-gray-200 shadow-md 
        hover:shadow-xl hover:-translate-y-1 active:shadow-2xl active:translate-y-0 
        transition-all duration-300 
        p-4 md:p-6 touch-manipulation
        relative overflow-hidden group
        ${onClick ? 'cursor-pointer select-none' : ''}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${
        color === 'green' ? 'from-green-400 to-green-600' :
        color === 'blue' ? 'from-blue-400 to-blue-600' :
        color === 'orange' ? 'from-orange-400 to-orange-600' :
        'from-purple-400 to-purple-600'
      }`}></div>

      <div className="relative flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-600 mb-2 truncate uppercase tracking-wide">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">{value}</p>
          {trend && (
            <div className={`flex items-center text-xs md:text-sm ${
              trend.positive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className="font-bold">
                {trend.positive ? '↑' : '↓'} {trend.value}%
              </span>
              <span className="ml-1 text-gray-500 hidden sm:inline">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${colorClasses[color]}`}>
          <Icon className="w-6 h-6 md:w-7 md:h-7" />
        </div>
      </div>
    </div>
  );
};