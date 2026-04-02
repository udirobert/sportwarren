import React from 'react';
import { LucideIcon, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
  sampleLabel?: string;
  onSample?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  onSecondaryAction,
  sampleLabel,
  onSample,
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
      <div className="flex flex-wrap items-center justify-center gap-3">
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
        {secondaryActionLabel && (
          secondaryActionHref ? (
            <Link href={secondaryActionHref}>
              <Button variant="outline">
                {secondaryActionLabel}
              </Button>
            </Link>
          ) : (
            <Button 
              variant="outline"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )
        )}
        {sampleLabel && onSample && (
          <Button
            variant="ghost"
            onClick={onSample}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Eye className="w-4 h-4 mr-1.5" />
            {sampleLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
