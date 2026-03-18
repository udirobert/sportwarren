'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';

export const CHECKLIST_IDS = [
    'connect_channel',
    'view_match_engine',
    'open_office',
    'use_draft',
    'verify_match',
    'claim_identity',
] as const;

export type ChecklistId = (typeof CHECKLIST_IDS)[number];

interface ChecklistConfig {
    id: ChecklistId;
    label: string;
    description: string;
    emoji: string;
    href: string;
    actionLabel: string;
}

const CHECKLIST_CONFIG: ChecklistConfig[] = [
    {
        id: 'connect_channel',
        label: 'Connect a messaging channel',
        description: 'Link WhatsApp, Telegram, or XMTP for match updates',
        emoji: '💬',
        href: '/settings?tab=connections',
        actionLabel: 'Connect now →',
    },
    {
        id: 'view_match_engine',
        label: 'Open the Match Center',
        description: 'Submit a result or review the current match queue',
        emoji: '🎮',
        href: '/match',
        actionLabel: 'Open matches',
    },
    {
        id: 'open_office',
        label: 'Visit the Staff Room',
        description: 'Open the dashboard staff tools and talk to your Agent',
        emoji: '🎩',
        href: '/dashboard',
        actionLabel: 'Open dashboard',
    },
    {
        id: 'use_draft',
        label: 'Open the transfer market',
        description: 'Scout prospects and make your first squad move',
        emoji: '📋',
        href: '/squad?tab=transfers',
        actionLabel: 'Open transfers',
    },
    {
        id: 'verify_match',
        label: 'Submit a real match result',
        description: 'Log your Sunday game for XP and on-chain rep',
        emoji: '✅',
        href: '/match?mode=capture',
        actionLabel: 'Submit match',
    },
    {
        id: 'claim_identity',
        label: 'Connect your wallet',
        description: 'Unlock live squad, treasury, and on-chain progression',
        emoji: '⚡',
        href: '/settings?tab=wallet',
        actionLabel: 'Open wallet settings',
    },
];

export interface ChecklistItem {
    id: string;
    label: string;
    description: string;
    completed: boolean;
    emoji: string;
    href: string;
    actionLabel: string;
}

const STORAGE_KEY = 'sw_onboarding_v2';

interface OnboardingState {
    checklistItems: Record<ChecklistId, boolean>;
}

const DEFAULT_STATE: OnboardingState = {
    checklistItems: {
        connect_channel: false,
        view_match_engine: false,
        open_office: false,
        use_draft: false,
        verify_match: false,
        claim_identity: false,
    },
};

export function useOnboarding() {
    const { connected, isGuest } = useWallet();
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
            return next;
        });
    }, [persist]);

    const resetOnboarding = useCallback(() => {
        persist(DEFAULT_STATE);
    }, [persist]);

    useEffect(() => {
        if (!hydrated || isGuest || !connected || state.checklistItems.claim_identity) {
            return;
        }
        completeChecklistItem('claim_identity');
    }, [completeChecklistItem, connected, hydrated, isGuest, state.checklistItems.claim_identity]);

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
