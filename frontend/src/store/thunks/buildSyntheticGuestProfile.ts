import type { UserProfile } from '../../services/api';
import type { ProgressState } from '../slices/progressSlice';
import type { SyncState } from '../slices/syncSlice';

/**
 * Builds a synthetic UserProfile for a local guest from Redux progress and sync state.
 * Use when the backend has no profile (e.g. offline or local guest id).
 *
 * - Initially (no activity): all numeric fields 0, dailyScores [], lastPlayed null → UI shows "no activity".
 * - After solving: dailyScores from pendingScores (real score 0/6/10, timeTakenMs); totalPoints and stats derived.
 */
export function buildSyntheticGuestProfile(
  uid: string,
  progress: ProgressState,
  sync: SyncState
): UserProfile {
  const { completedByDate, streak } = progress;
  const { pendingScores } = sync;

  const datesWithScores = new Set(pendingScores.map((p) => p.date));
  const dailyScores = pendingScores.map((p) => ({
    date: p.date,
    puzzleId: p.puzzleId,
    score: p.score,
    timeTakenMs: (p.timeTakenMs ?? 0) as number | null,
  }));

  for (const date of Object.keys(completedByDate)) {
    if (!datesWithScores.has(date)) {
      dailyScores.push({
        date,
        puzzleId: 'daily',
        score: 0,
        timeTakenMs: 0,
      });
    }
  }

  dailyScores.sort((a, b) => a.date.localeCompare(b.date));

  const totalPoints = dailyScores.reduce((sum, s) => sum + s.score, 0);
  const count = dailyScores.length;
  const times = dailyScores.map((s) => s.timeTakenMs).filter((t): t is number => t != null && t > 0);
  const avgSolveTimeMs = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;
  const allDates = [...new Set([...Object.keys(completedByDate), ...dailyScores.map((s) => s.date)])];
  const lastPlayed = allDates.length > 0 ? allDates.sort().slice(-1)[0]! : null;

  return {
    id: uid,
    email: null,
    streakCount: streak,
    lastPlayed,
    totalPoints,
    stats: { puzzlesSolved: count, avgSolveTimeMs },
    dailyScores,
  };
}
