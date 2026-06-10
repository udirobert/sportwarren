import type { ChecklistItemConfig, ChecklistId, Platform } from './flow';
import { buildTelegramDeepLink } from '@/lib/telegram/deep-links';

export const CHECKLIST_IDS: readonly ChecklistId[] = [
    'complete_card',
    'set_formation',
    'connect_telegram',
    'join_squad',
    'log_match',
] as const;

export const CHECKLIST_ITEMS: ChecklistItemConfig[] = [
    {
        id: 'complete_card',
        label: 'Complete your player card',
        description: 'Set your name, position, and avatar — your card is your identity on the platform',
        emoji: '🪪',
        href: '/settings?tab=profile',
        actionLabel: 'Edit card',
        xp: 50,
    },
    {
        id: 'set_formation',
        label: 'Pick your formation',
        description: 'Choose your starting formation and play style — this shapes how your squad lines up on match day',
        emoji: '📋',
        href: '/squad?tab=tactics',
        actionLabel: 'Set formation',
        xp: 75,
    },
    {
        id: 'connect_telegram',
        label: 'Open SportWarren in Telegram',
        description: 'One-tap match log, instant verification, real-time squad chat — the fastest way to run a season',
        emoji: '✈️',
        href: buildTelegramDeepLink({ tab: 'squad' }),
        actionLabel: 'Open Telegram',
        xp: 25,
    },
    {
        id: 'join_squad',
        label: 'Create or join a squad',
        description: 'Squads verify your stats — teammates make your card real',
        emoji: '👥',
        href: '/squad',
        actionLabel: 'Find a squad',
        xp: 100,
    },
    {
        id: 'log_match',
        label: 'Log your first match',
        description: 'Real results turn provisional stats into a verified record',
        emoji: '⚽',
        href: '/match?mode=capture',
        actionLabel: 'Log match',
        xp: 150,
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
