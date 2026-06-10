'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { trackOnboarding, trackCoreGrowthEvent, type CoreGrowthEvent } from '@/lib/analytics';
import { CHECKLIST_ITEMS } from '@/lib/onboarding/checklist';
import type { ChecklistId } from '@/lib/onboarding/flow';

export { CHECKLIST_IDS } from '@/lib/onboarding/checklist';
export type { ChecklistId } from '@/lib/onboarding/flow';

const CHECKLIST_GROWTH_EVENTS: Partial<Record<ChecklistId, CoreGrowthEvent>> = {
    complete_card: 'player_card_save_intent',
    set_formation: 'tactics_customized',
    log_match: 'first_match_submitted',
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
        complete_card: false,
        set_formation: false,
        connect_telegram: false,
        join_squad: false,
        log_match: false,
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


    const checklistItems: ChecklistItem[] = CHECKLIST_ITEMS.map((item) => ({
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
