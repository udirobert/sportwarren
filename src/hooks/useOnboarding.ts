'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { trackOnboarding, trackCoreGrowthEvent, type CoreGrowthEvent } from '@/lib/analytics';
import { CHECKLIST_ITEMS } from '@/lib/onboarding/checklist';
import type { ChecklistId } from '@/lib/onboarding/types';

export { CHECKLIST_IDS } from '@/lib/onboarding/checklist';
export type { ChecklistId } from '@/lib/onboarding/types';

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
