export type Platform = 'web' | 'mobile' | 'telegram';

export type ChecklistId = 
    | 'join_squad'
    | 'set_formation'
    | 'log_match'
    | 'claim_identity';

export interface ChecklistItemConfig {
    id: ChecklistId;
    label: string;
    description: string;
    emoji: string;
    href: string;
    actionLabel: string;
    xp: number;
}

export interface TourStepConfig {
    id: string;
    targetId: string;
    title: string;
    content: string;
    emoji: string;
    iconName?: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    checklistId?: ChecklistId;
    platforms?: Platform[];
}

export interface PlatformConfig {
    tourEnabled: boolean;
    checklistEnabled: boolean;
    quickActions: boolean;
    hapticFeedback: boolean;
}

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
    web: {
        tourEnabled: true,
        checklistEnabled: true,
        quickActions: true,
        hapticFeedback: false,
    },
    mobile: {
        tourEnabled: true,
        checklistEnabled: true,
        quickActions: true,
        hapticFeedback: true,
    },
    telegram: {
        tourEnabled: true,
        checklistEnabled: true,
        quickActions: true,
        hapticFeedback: false,
    },
};
