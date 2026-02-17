import { getTodayIsoDate, normalizeDateKey, previousIsoDate } from './dateUtils';

/** Meta shape needed for streak: at least { solved?: boolean } per date. */
export type MetaWithSolved = Record<string, { solved?: boolean }>;

/** Build a map with normalized YYYY-MM-DD keys so lookups match getTodayIsoDate(). */
function metaWithNormalizedKeys(meta: MetaWithSolved): MetaWithSolved {
  const out: MetaWithSolved = {};
  for (const [key, value] of Object.entries(meta)) {
    out[normalizeDateKey(key)] = value;
  }
  return out;
}

/**
 * Consecutive solved days for display.
 * - If today is solved: count backwards from today (streak includes today).
 * - If today is not solved: count backwards from yesterday (show continuity till previous day).
 * So before attempting today the user sees their current streak (e.g. 2); after completing
 * today it increments (e.g. 3). Keys are normalized to YYYY-MM-DD.
 */
export function computeStreak(meta: MetaWithSolved): number {
  const normalized = metaWithNormalizedKeys(meta);
  const today = getTodayIsoDate();
  const endDate = normalized[today]?.solved ? today : previousIsoDate(today);

  let streak = 0;
  let cursor = endDate;

  while (normalized[cursor]?.solved) {
    streak += 1;
    cursor = previousIsoDate(cursor);
  }

  return streak;
}
