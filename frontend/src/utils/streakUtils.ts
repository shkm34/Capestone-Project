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
 * Consecutive solved days ending at today.
 * Logic: start at today; if today is solved, count 1 and go to yesterday; keep going back
 * until we hit a day that is not solved (or missing). Each solved day adds 1 to the streak.
 * Keys are normalized to YYYY-MM-DD so IDB/API keys (e.g. "2025-2-12") match getTodayIsoDate().
 */
export function computeStreak(meta: MetaWithSolved): number {
  const normalized = metaWithNormalizedKeys(meta);
  let streak = 0;
  let cursor = getTodayIsoDate();

  while (normalized[cursor]?.solved) {
    streak += 1;
    cursor = previousIsoDate(cursor);
  }

  return streak;
}
