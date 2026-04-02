'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { trackOnboarding, trackCoreGrowthEvent, type CoreGrowthEvent } from '@/lib/analytics';

export const CHECKLIST_IDS = [
    'view_match_engine',
    'verify_match',
    'claim_identity',
    'connect_telegram',
] as const;

export type ChecklistId = (typeof CHECKLIST_IDS)[number];

interface ChecklistConfig {
    id: ChecklistId;
    label: string;
    description: string;
    emoji: string;
    href: string;
    actionLabel: string;
    xp?: number;
}

const CHECKLIST_CONFIG: ChecklistConfig[] = [
    {
        id: 'view_match_engine',
        label: 'Set your tactics',
        description: 'Choose your formation and play style to see your squad on the pitch',
        emoji: '📋',
        href: '/squad?tab=tactics',
        actionLabel: 'Set tactics',
        xp: 50,
    },
    {
        id: 'connect_telegram',
        label: 'Connect Telegram',
        description: 'Get match alerts and manage your squad from the group chat',
        emoji: '📱',
        href: '/settings?tab=connections',
        actionLabel: 'Connect',
        xp: 75,
    },
    {
        id: 'verify_match',
        label: 'Log your first game',
        description: 'Submit one real match result to unlock XP, reputation, and squad momentum',
        emoji: '✅',
        href: '/match?mode=capture',
        actionLabel: 'Log match',
        xp: 150,
    },
    {
        id: 'claim_identity',
        label: 'Save your progress',
        description: 'Create an account so your results, XP, and squad data persist',
        emoji: '⚡',
        href: '/settings?tab=wallet',
        actionLabel: 'Save progress',
        xp: 100,
    },
];

const CHECKLIST_GROWTH_EVENTS: Partial<Record<ChecklistId, CoreGrowthEvent>> = {
    view_match_engine: 'tactics_customized',
    verify_match: 'first_match_submitted',
    claim_identity: 'identity_connected',
};

export interface ChecklistItem {
    id: ChecklistId;
    label: string;
    description: string;
    completed: boolean;
    emoji: string;
    href: string;
    actionLabel: string;
    xp?: number;
}

const STORAGE_KEY = 'sw_onboarding_v2';

interface OnboardingState {
    checklistItems: Record<ChecklistId, boolean>;
}

const DEFAULT_STATE: OnboardingState = {
    checklistItems: {
        view_match_engine: false,
        verify_match: false,
        claim_identity: false,
        connect_telegram: false,
    },
};

export function useOnboarding() {
    const { hasAccount, isGuest } = useWallet();
    const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as Partial<OnboardingState>;
                setState({
                    checklistItems: {
                        ...DEFAULT_STATE.checklistItems,
                        ...(parsed.checklistItems ?? {}),
                    },
                });
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

    const completeChecklistItem = useCallback((id: ChecklistId) => {
        setState(prev => {
            if (prev.checklistItems[id]) {
                return prev;
            }
            const next = {
                ...prev,
                checklistItems: { ...prev.checklistItems, [id]: true },
            };
            persist(next);
            trackOnboarding(id, true);
            const growthEvent = CHECKLIST_GROWTH_EVENTS[id];
            if (growthEvent) {
                trackCoreGrowthEvent(growthEvent, { source: 'onboarding_checklist' });
            }
            return next;
        });
    }, [persist]);

    const resetOnboarding = useCallback(() => {
        persist(DEFAULT_STATE);
    }, [persist]);

    useEffect(() => {
        if (!hydrated || isGuest || !hasAccount || state.checklistItems.claim_identity) {
            return;
        }
        completeChecklistItem('claim_identity');
    }, [completeChecklistItem, hasAccount, hydrated, isGuest, state.checklistItems.claim_identity]);

    const checklistItems: ChecklistItem[] = CHECKLIST_CONFIG.map((item) => ({
        ...item,
        completed: state.checklistItems[item.id] ?? false,
    }));

    const allDone = checklistItems.every(i => i.completed);
    const completedCount = checklistItems.filter(i => i.completed).length;

    return {
        hydrated,
        checklistItems,
        allChecklistDone: allDone,
        completedCount,
        totalCount: checklistItems.length,
        completeChecklistItem,
        resetOnboarding,
    };
}
