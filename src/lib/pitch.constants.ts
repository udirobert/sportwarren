import type { PlayStyle, SquadSize } from '@/types';

export const DEFAULT_PLAYER_NAMES = [
  'Tunde', 'Kofi', 'Diallo', 'Eze', 'Yusuf', 'Baba', 'Zico', 'Chidi', 'Seydou', 'Moussa', 'GK',
] as const;

export const SQUAD_SIZES: SquadSize[] = [5, 6, 7, 11];

export const PLAY_STYLES: PlayStyle[] = ['balanced', 'high_press', 'low_block', 'counter'];

export const POSITIONS_BY_SQUAD_SIZE: Record<SquadSize, string[]> = {
  11: ['ST', 'ST', 'LW', 'RW', 'CM', 'CM', 'CM', 'CDM', 'CB', 'CB', 'GK'],
  7: ['ST', 'CM', 'CM', 'CM', 'CB', 'CB', 'GK'],
  6: ['ST', 'CM', 'CM', 'CB', 'CB', 'GK'],
  5: ['ST', 'CM', 'CM', 'CB', 'GK'],
};

export const PITCH_THEMES = [
  { value: 'premier-league', label: 'Premier League', color: 'from-green-600 to-green-700' },
  { value: 'sunday-league', label: 'Sunday League', color: 'from-amber-800 to-amber-950' },
  { value: 'night-match', label: 'Night Match', color: 'from-slate-800 to-slate-900' },
  { value: 'easy-on-eyes', label: 'Easy on Eyes', color: 'from-emerald-500 to-teal-700' },
] as const;

export const SQUAD_COLORS = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b'] as const;

export const DEMO_INITIALS = ['JD', 'AM', 'SK'] as const;

export const QUICK_GUIDE_STEPS = [
  { title: 'Plan', text: 'Design your formation and squad identity.' },
  { title: 'Simulate', text: 'Our match engine tests your setup against the meta.' },
  { title: 'Dominate', text: 'Share with your squad and lead them to victory.' },
] as const;

export const EXPORT_FILENAME_PREFIX = 'sportwarren-tactics';

export const PITCH_BACKGROUND_COLOR = '#0b1322';

export const STORAGE_KEYS = {
  PERSONALIZE_UNLOCKED: 'sw_pitch_personalize_unlocked',
  EXPORT_FORMAT: 'sw_pitch_export_format',
  HD: 'sw_pitch_hd',
  EXPORT_SCOPE: 'sw_pitch_export_scope',
  NAMES: 'sw_pitch_names',
  AVATARS: 'sw_pitch_avatars',
  SHOW_NAMES: 'sw_pitch_show_names',
  BLUR_FACES: 'sw_pitch_blur_faces',
  BLUR_LEVEL: 'sw_pitch_blur_level',
} as const;

export const formationKey = (formation: string) => (k: string) => `${k}_${formation}`;
