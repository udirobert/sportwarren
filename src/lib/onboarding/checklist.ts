import type { ChecklistItemConfig, ChecklistId, Platform } from './types';

export const CHECKLIST_IDS: readonly ChecklistId[] = [
    'view_match_engine',
    'verify_match',
    'claim_identity',
    'connect_telegram',
] as const;

export const CHECKLIST_ITEMS: ChecklistItemConfig[] = [
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

export const PLATFORM_CHECKLIST_FILTERS: Record<Platform, string[]> = {
    web: [],
    mobile: [],
    telegram: ['connect_telegram'],
};

export function getChecklistForPlatform(platform: Platform): ChecklistItemConfig[] {
    const exclude = PLATFORM_CHECKLIST_FILTERS[platform];
    if (exclude.length === 0) return CHECKLIST_ITEMS;
    return CHECKLIST_ITEMS.filter(item => !exclude.includes(item.id));
}
