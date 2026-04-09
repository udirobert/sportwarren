import type { TourStepConfig, Platform } from './types';

export const TOUR_STEPS: TourStepConfig[] = [
    {
        id: 'welcome',
        targetId: 'dashboard-header',
        title: "Welcome to the Preview",
        content: "You're currently in Preview Mode. This quick walkthrough shows the core loop: log a game, share the link, start your season.",
        emoji: '🏟️',
        iconName: 'Sparkles',
        position: 'bottom',
    },
    {
        id: 'match-engine',
        targetId: 'match-engine',
        title: "Log Your First Game",
        content: "This is the match canvas — it visualizes your game in real time. When you're ready, submit a real result and share the link with your opponent.",
        emoji: '🎮',
        iconName: 'Cpu',
        position: 'left',
        checklistId: 'view_match_engine',
    },
    {
        id: 'claim-identity',
        targetId: 'connect-wallet-btn',
        title: "Start Your Season",
        content: "Ready to leave the preview? Create your account now. You can add a wallet later when you want protected actions.",
        emoji: '⚡',
        iconName: 'Zap',
        position: 'bottom',
        checklistId: 'claim_identity',
    },
];

export const PLATFORM_TOUR_FILTERS: Record<Platform, string[]> = {
    web: [],
    mobile: [],
    telegram: ['claim-identity'],
};

export function getTourStepsForPlatform(platform: Platform): TourStepConfig[] {
    const exclude = PLATFORM_TOUR_FILTERS[platform];
    if (exclude.length === 0) return TOUR_STEPS;
    return TOUR_STEPS.filter(step => !exclude.includes(step.id));
}

export const TOUR_STORAGE_KEY = 'sw_tour_current_step';
export const TOUR_COMPLETED_KEY = 'sw_guest_tour_seen';
