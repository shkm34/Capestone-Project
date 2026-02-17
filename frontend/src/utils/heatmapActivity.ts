import type { HeatmapActivity } from '../components/YearHeatmap';
import type { PersistedUserProfile } from '../store/persistence';
import type { PendingScore } from '../store/slices/syncSlice';

/**
 * Build heatmap activity for the last 365 days from:
 * - local progress (`completedByDate`)
 * - persisted user profile (`dailyScores`)
 * - pending offline scores (`pendingScores`)
 */
export function buildHeatmapActivity(
  completedByDate: Record<string, { solved: boolean; usedHint: boolean }>,
  user: PersistedUserProfile | null,
  pendingScores: PendingScore[],
): HeatmapActivity[] {
  const activityMap = new Map<string, HeatmapActivity>();

  // Base from completedByDate (solved flag only).
  for (const [date, meta] of Object.entries(completedByDate)) {
    if (!meta.solved) continue;
    activityMap.set(date, { date, level: 1, score: null, timeTakenMs: null });
  }

  // Enhance with best score/time from server profile.
  if (user) {
    for (const s of user.dailyScores) {
      const existing = activityMap.get(s.date);
      if (!existing) continue;

      const bestScore = s.score;
      let level: HeatmapActivity['level'] = existing.level;
      if (bestScore <= 0) {
        if (level < 1) level = 1;
      } else if (bestScore < 10) {
        if (level < 2) level = 2;
      } else if (s.timeTakenMs != null && s.timeTakenMs < 60000) {
        if (level < 4) level = 4;
      } else {
        if (level < 3) level = 3;
      }

      activityMap.set(s.date, {
        date: s.date,
        level,
        score: s.score,
        timeTakenMs: s.timeTakenMs,
      });
    }
  }

  // Include pending (offline) scores as well.
  for (const p of pendingScores) {
    const existing = activityMap.get(p.date);
    if (!existing) continue;

    const bestScore = p.score;
    let level: HeatmapActivity['level'] = existing.level;
    if (bestScore <= 0) {
      if (level < 1) level = 1;
    } else if (bestScore < 10) {
      if (level < 2) level = 2;
    } else if (p.timeTakenMs != null && p.timeTakenMs < 60000) {
      if (level < 4) level = 4;
    } else {
      if (level < 3) level = 3;
    }

    activityMap.set(p.date, {
      date: p.date,
      level,
      score: p.score,
      timeTakenMs: p.timeTakenMs ?? null,
    });
  }

  return Array.from(activityMap.values());
}

