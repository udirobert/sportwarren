'use client';

import { useState, useEffect, useCallback } from 'react';

export interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    action: string;    // button label
    emoji: string;
    featureKey: string; // matches a dashboard widget ID or action
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to SportWarren',
        description: 'Your Sunday League season just went Championship Manager. Real matches. Real stats. On-chain reputation.',
        action: "Let's Go",
        emoji: '⚽',
        featureKey: 'welcome',
    },
    {
        id: 'match-engine',
        title: 'Watch Your Squad Simulated Live',
        description: 'The Match Engine simulates your real pitch sessions using actual player stats and reputation tiers. See your squad move.',
        action: 'Got It',
        emoji: '🎮',
        featureKey: 'match-engine',
    },
    {
        id: 'draft-engine',
        title: 'Scout & Sign Prospects',
        description: 'Your AI Scout is watching local academies. Use the Draft Engine to find and contract talented players — it connects to your squad treasury.',
        action: 'Sounds Good',
        emoji: '🔭',
        featureKey: 'draft-engine',
    },
    {
        id: 'staff-room',
        title: 'Meet Your Backroom Staff',
        description: 'Click "Enter Office" to talk to your Agent, Scout, and Coach. Ask about your budget, tactics, or squad morale — they know your real data.',
        action: 'Nice',
        emoji: '🎩',
        featureKey: 'staff-room',
    },
    {
        id: 'match-verify',
        title: 'Log Your Real Matches',
        description: 'After your Sunday game, submit the result. Both teams confirm, Chainlink verifies the location — and your players earn XP on-chain.',
        action: 'Ready',
        emoji: '✅',
        featureKey: 'recent-matches',
    },
    {
        id: 'complete',
        title: "You're Ready to Play",
        description: "Build your legend. Every goal, every assist, every win — permanently recorded. This is your football career, on-chain.",
        action: 'Enter SportWarren',
        emoji: '🏆',
        featureKey: 'complete',
    },
];

export interface ChecklistItem {
    id: string;
    label: string;
    description: string;
    completed: boolean;
    emoji: string;
}

const STORAGE_KEY = 'sw_onboarding_v2';

interface OnboardingState {
    wizardDone: boolean;
    wizardStep: number;
    checklistItems: Record<string, boolean>;
}

const DEFAULT_STATE: OnboardingState = {
    wizardDone: false,
    wizardStep: 0,
    checklistItems: {
        view_match_engine: false,
        open_office: false,
        use_draft: false,
        verify_match: false,
    },
};

export function useOnboarding() {
    const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setState(JSON.parse(stored));
            }
        } catch {
            // ignore
        }
        setHydrated(true);
    }, []);

    const persist = useCallback((next: OnboardingState) => {
        setState(next);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch { /* ignore */ }
    }, []);

    const advanceWizard = useCallback(() => {
        setState(prev => {
            const next = { ...prev, wizardStep: prev.wizardStep + 1 };
            if (next.wizardStep >= ONBOARDING_STEPS.length) {
                next.wizardDone = true;
            }
            persist(next);
            return next;
        });
    }, [persist]);

    const completeWizard = useCallback(() => {
        persist({ ...state, wizardDone: true, wizardStep: ONBOARDING_STEPS.length });
    }, [state, persist]);

    const completeChecklistItem = useCallback((id: string) => {
        setState(prev => {
            const next = {
                ...prev,
                checklistItems: { ...prev.checklistItems, [id]: true },
            };
            persist(next);
            return next;
        });
    }, [persist]);

    const resetOnboarding = useCallback(() => {
        persist(DEFAULT_STATE);
    }, [persist]);

    const checklistItems: ChecklistItem[] = [
        {
            id: 'view_match_engine',
            label: 'Watch your first match simulation',
            description: 'Hit ▶ Play on the Match Engine',
            completed: state.checklistItems.view_match_engine ?? false,
            emoji: '🎮',
        },
        {
            id: 'open_office',
            label: 'Visit the Staff Room',
            description: 'Click "Enter Office" and chat to your Agent',
            completed: state.checklistItems.open_office ?? false,
            emoji: '🎩',
        },
        {
            id: 'use_draft',
            label: 'Draft your first prospect',
            description: 'Use the Draft Engine to scout and sign a player',
            completed: state.checklistItems.use_draft ?? false,
            emoji: '📋',
        },
        {
            id: 'verify_match',
            label: 'Submit a real match result',
            description: 'Log your Sunday game for XP and on-chain rep',
            completed: state.checklistItems.verify_match ?? false,
            emoji: '✅',
        },
    ];

    const allDone = checklistItems.every(i => i.completed);
    const completedCount = checklistItems.filter(i => i.completed).length;

    return {
        hydrated,
        wizardDone: state.wizardDone,
        wizardStep: state.wizardStep,
        currentStep: ONBOARDING_STEPS[state.wizardStep] ?? ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1],
        steps: ONBOARDING_STEPS,
        checklistItems,
        allChecklistDone: allDone,
        completedCount,
        totalCount: checklistItems.length,
        advanceWizard,
        completeWizard,
        completeChecklistItem,
        resetOnboarding,
    };
}
