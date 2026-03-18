'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { trackOnboarding, trackCoreGrowthEvent, type CoreGrowthEvent } from '@/lib/analytics';

export const CHECKLIST_IDS = [
    'verify_match',
    'view_match_engine',
    'connect_channel',
    'claim_identity',
    'open_office',
    'use_draft',
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
        id: 'verify_match',
        label: 'Submit your first match result',
        description: 'Log one real game to unlock XP, reputation, and squad momentum',
        emoji: '✅',
        href: '/match?mode=capture',
        actionLabel: 'Submit match',
    },
    {
        id: 'view_match_engine',
        label: 'Send opponent verification link',
        description: 'Share a review link so the other captain can confirm the score',
        emoji: '🔗',
        href: '/match?mode=verify',
        actionLabel: 'Copy invite link',
    },
    {
        id: 'connect_channel',
        label: 'Connect a messaging channel',
        description: 'Link WhatsApp, Telegram, or XMTP for verification and match updates',
        emoji: '💬',
        href: '/settings?tab=connections',
        actionLabel: 'Connect now →',
    },
    {
        id: 'claim_identity',
        label: 'Connect your identity',
        description: 'Unlock live squad, treasury, and on-chain progression',
        emoji: '⚡',
        href: '/settings?tab=wallet',
        actionLabel: 'Open wallet settings',
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
];

const CHECKLIST_GROWTH_EVENTS: Partial<Record<ChecklistId, CoreGrowthEvent>> = {
    verify_match: 'first_match_submitted',
    view_match_engine: 'opponent_verification_invite_shared',
    connect_channel: 'channel_connected',
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
