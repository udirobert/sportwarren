'use client';

import React from 'react';
import { User, Sparkles } from 'lucide-react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
  className?: string;
  isAi?: boolean;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const iconSizes: Record<AvatarSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  size = 'md', 
  className = '',
  isAi = false,
}) => {
  const [hasError, setHasError] = React.useState(false);

  const initials = React.useMemo(() => {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [name]);

  const renderContent = () => {
    if (src && !hasError) {
      return (
        <img 
          src={src} 
          alt={name || 'User avatar'} 
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      );
    }

    if (initials) {
      return (
        <div className="w-full h-full flex items-center justify-center font-black bg-gradient-to-br from-emerald-400 to-blue-500 text-white uppercase tracking-tighter">
          {initials}
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
        <User className={iconSizes[size]} />
      </div>
    );
  };

  return (
    <div className={`relative shrink-0 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-50 ${isAi ? 'ring-2 ring-blue-400 ring-offset-1' : ''} ${sizeClasses[size]} ${className}`}>
      {renderContent()}
      {isAi && (
        <div className="absolute top-0 right-0 p-0.5 bg-blue-500 rounded-bl-md border-b border-l border-white shadow-sm">
          <Sparkles className="w-2 h-2 text-white" />
        </div>
      )}
    </div>
  );
};
