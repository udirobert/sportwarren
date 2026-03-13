import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}) => {
  return (
    <div className={`text-center py-10 px-4 ${className}`}>
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 max-w-xs mx-auto">
        {description}
      </p>
      {actionLabel && (
        actionHref ? (
          <Link href={actionHref}>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              {actionLabel}
            </Button>
          </Link>
        ) : (
          <Button 
            onClick={onAction}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
};
