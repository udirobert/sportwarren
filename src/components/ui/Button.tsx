'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  animate?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      icon: Icon,
      iconPosition = 'left',
      loading = false,
      animate = true,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
      primary:
        'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:ring-green-500 shadow-sm hover:shadow-md active:shadow-lg',
      secondary:
        'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500 shadow-sm hover:shadow-md active:shadow-lg',
      outline:
        'bg-transparent border-2 border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600 hover:bg-green-50 active:bg-green-100 focus:ring-green-500',
      ghost:
        'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-400',
      danger:
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-sm hover:shadow-md active:shadow-lg',
      success:
        'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:ring-green-500 shadow-sm hover:shadow-md active:shadow-lg',
    };

    const sizeClasses = {
      xs: 'px-2.5 py-1.5 text-xs min-h-[32px]',
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-4 py-2.5 text-sm min-h-[40px]',
      lg: 'px-6 py-3 text-base min-h-[44px]',
      xl: 'px-8 py-4 text-lg min-h-[52px]',
    };

    const animateClasses = animate
      ? 'transform hover:scale-105 active:scale-95'
      : '';

    const widthClasses = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${animateClasses}
          ${widthClasses}
          ${className}
        `}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        
        {Icon && iconPosition === 'left' && !loading && (
          <Icon className={`${children ? 'mr-2' : ''} h-4 w-4`} />
        )}
        
        {children}
        
        {Icon && iconPosition === 'right' && !loading && (
          <Icon className={`${children ? 'ml-2' : ''} h-4 w-4`} />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
