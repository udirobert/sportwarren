'use client';

import React from 'react';
import { usePlatform } from '@/hooks/usePlatform';
import { WebTour } from './platforms/WebTour';
import { MobileTour } from './platforms/MobileTour';
import { TelegramTour } from './platforms/TelegramTour';

interface OnboardingTourProps {
    onVisibilityChange?: (isVisible: boolean) => void;
    onComplete?: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onVisibilityChange, onComplete }) => {
    const { platform, isTelegram, isMobile, isWeb } = usePlatform();

    if (isTelegram) {
        return <TelegramTour onVisibilityChange={onVisibilityChange} onComplete={onComplete} />;
    }

    if (isMobile) {
        return <MobileTour onVisibilityChange={onVisibilityChange} />;
    }

    return <WebTour onVisibilityChange={onVisibilityChange} />;
};
