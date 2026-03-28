import React from 'react';

type SkeletonVariant =
  | 'default'
  | 'text'
  | 'text-sm'
  | 'card'
  | 'avatar'
  | 'avatar-sm'
  | 'stat';

interface SkeletonProps {
  className?: string;
  variant?: SkeletonVariant;
}

const variantClasses: Record<SkeletonVariant, string> = {
  default: 'skeleton',
  text: 'skeleton-text',
  'text-sm': 'skeleton-text-sm',
  card: 'skeleton-card',
  avatar: 'skeleton-avatar',
  'avatar-sm': 'skeleton-avatar-sm',
  stat: 'skeleton-stat',
};

export function Skeleton({ className, variant = 'default' }: SkeletonProps) {
  return <div className={`${variantClasses[variant]} ${className || ''}`} />;
}

interface SkeletonLinesProps {
  lines?: number;
  className?: string;
}

export function SkeletonLines({ lines = 3, className }: SkeletonLinesProps) {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          variant={i === lines - 1 ? 'text-sm' : 'text'}
        />
      ))}
    </div>
  );
}