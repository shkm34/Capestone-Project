import { getTodayIsoDate, previousIsoDate } from './dateUtils';

/** Meta shape needed for streak: at least { solved?: boolean } per date. */
export type MetaWithSolved = Record<string, { solved?: boolean }>;

/** Pure: compute consecutive days with solved ending at today. */
export function computeStreak(meta: MetaWithSolved): number {
  let streak = 0;
  let cursor = getTodayIsoDate();

  while (meta[cursor]?.solved) {
    streak += 1;
    cursor = previousIsoDate(cursor);
  }

  return streak;
}
