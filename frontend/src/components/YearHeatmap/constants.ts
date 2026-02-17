import type { ActivityLevel } from './types';

export const DAYS_IN_YEAR = 365;
export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CELL_SIZE = 8;
export const CELL_GAP = 2;
export const WEEK_WIDTH = CELL_SIZE + CELL_GAP;

export const ACTIVITY_LEVEL_CLASSES: Record<ActivityLevel, string> = {
  0: 'bg-slate-800',
  1: 'bg-emerald-200',
  2: 'bg-emerald-400',
  3: 'bg-emerald-600',
  4: 'bg-emerald-800',
};
