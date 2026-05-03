import type { ChecklistItemConfig, ChecklistId, Platform } from './types';

export const CHECKLIST_IDS: readonly ChecklistId[] = [
    'join_squad',
    'set_formation',
    'log_match',
    'claim_identity',
] as const;

export const CHECKLIST_ITEMS: ChecklistItemConfig[] = [
    {
        id: 'join_squad',
        label: 'Create or join a squad',
        description: 'Squads are the core of SportWarren — form your team to start logging matches and earning XP',
        emoji: '👥',
        href: '/squad',
        actionLabel: 'Find a squad',
        xp: 100,
    },
    {
        id: 'set_formation',
        label: 'Set your formation',
        description: 'Pick a formation and play style to define how your squad lines up on match day',
        emoji: '📋',
        href: '/squad?tab=tactics',
        actionLabel: 'Set tactics',
        xp: 50,
    },
    {
        id: 'log_match',
        label: 'Log your first match',
        description: 'Submit a real match result to unlock XP, reputation, and peer ratings',
        emoji: '⚽',
        href: '/match?mode=capture',
        actionLabel: 'Log match',
        xp: 150,
    },
    {
        id: 'claim_identity',
        label: 'Save your progress',
        description: 'Create an account so your results, XP, and squad data persist across devices',
        emoji: '⚡',
        href: '/settings?tab=wallet',
        actionLabel: 'Save progress',
        xp: 100,
    },
];

export const PLATFORM_CHECKLIST_FILTERS: Record<Platform, string[]> = {
    web: [],
    mobile: [],
    telegram: [],
};

export function getChecklistForPlatform(platform: Platform): ChecklistItemConfig[] {
    const exclude = PLATFORM_CHECKLIST_FILTERS[platform];
    if (exclude.length === 0) return CHECKLIST_ITEMS;
    return CHECKLIST_ITEMS.filter(item => !exclude.includes(item.id));
}
