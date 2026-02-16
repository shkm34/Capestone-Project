import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchUserProfile } from '../store/thunks/syncThunks';
import { ThreeMonthHeatmap, type HeatmapActivity } from '../components/ThreeMonthHeatmap';
import type { PersistedUserProfile } from '../store/persistence';
import type { PendingScore } from '../store/slices/syncSlice';

function buildHeatmapActivity(
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

export const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector((s: RootState) => s.auth.userId);
  const { user, lastFetchedAt, fetchError } = useSelector((s: RootState) => s.userProfile);
  const streak = useSelector((s: RootState) => s.progress.streak);
  const completedByDate = useSelector((s: RootState) => s.progress.completedByDate);
  const pendingScores = useSelector((s: RootState) => s.sync.pendingScores);

  useEffect(() => {
    if (userId) dispatch(fetchUserProfile());
  }, [dispatch, userId]);

  const loading = userId && !user && !fetchError;
  const error = Boolean(fetchError);

  const heatmapActivity: HeatmapActivity[] = useMemo(
    () => buildHeatmapActivity(completedByDate, user, pendingScores),
    [completedByDate, user, pendingScores],
  );

  return (
    <div className="w-full max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-[#FFFFFF]">
          Your profile
        </h1>
        <Link
          to="/"
          className="text-sm font-medium text-[#DDF2FD] hover:text-[#FFFFFF]"
        >
          ← Play
        </Link>
      </div>

      {!userId && (
        <section className="rounded-2xl border border-[#3D3B40] bg-[#190482] bg-opacity-40 p-6">
          <p className="text-[#D9E2FF]">
            You&apos;re not signed in yet. Complete a puzzle or go online to get a
            guest account; your profile will appear here.
          </p>
        </section>
      )}

      {loading && (
        <section className="rounded-2xl border border-[#3D3B40] bg-[#190482] bg-opacity-40 p-6">
          <p className="text-[#D9E2FF]">Loading profile…</p>
        </section>
      )}

      {error && (
        <section className="rounded-2xl border border-[#3D3B40] bg-[#190482] bg-opacity-40 p-6">
          <p className="text-[#F05537]">{fetchError}</p>
          <p className="text-xs text-[#D9E2FF] mt-2">Try again when online.</p>
        </section>
      )}

      {user && (
        <section className="rounded-2xl border border-[#3D3B40] bg-[#190482] bg-opacity-40 p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#BFCFE7]">User ID</p>
            <p className="text-sm font-mono text-[#F6F5F5] break-all">{user.id}</p>
          </div>
          {user.email && (
            <div>
              <p className="text-xs uppercase tracking-wide text-[#BFCFE7]">Email</p>
              <p className="text-sm text-[#F6F5F5]">{user.email}</p>
            </div>
          )}
          <div className="flex gap-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#BFCFE7]">Streak</p>
              <p className="text-lg font-semibold text-[#F05537]">{streak} days</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#BFCFE7]">Total points</p>
              <p className="text-lg font-semibold text-[#DDF2FD]">{user.totalPoints}</p>
            </div>
          </div>
          {user.stats && (
            <div>
              <p className="text-xs uppercase tracking-wide text-[#BFCFE7]">Stats</p>
              <p className="text-sm text-[#D9E2FF]">
                Puzzles solved: {user.stats.puzzlesSolved}
                {user.stats.avgSolveTimeMs != null && (
                  <> · Avg time: {Math.round(user.stats.avgSolveTimeMs / 1000)}s</>
                )}
              </p>
            </div>
          )}
          {user.lastPlayed && (
            <div>
              <p className="text-xs uppercase tracking-wide text-[#BFCFE7]">Last played</p>
              <p className="text-sm text-[#D9E2FF]">
                {new Date(user.lastPlayed).toLocaleDateString()}
              </p>
            </div>
          )}
          {user.dailyScores.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-[#BFCFE7] mb-2">Recent scores</p>
              <ul className="space-y-1 text-sm text-[#D9E2FF]">
                {user.dailyScores.slice(0, 10).map((s) => (
                  <li key={`${s.date}-${s.puzzleId}`}>
                    {s.date} — {s.puzzleId}: {s.score} pts
                    {s.timeTakenMs != null && ` (${Math.round(s.timeTakenMs / 1000)}s)`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {lastFetchedAt && (
            <p className="text-[10px] text-[#BFCFE7]">
              Fetched {new Date(lastFetchedAt).toLocaleString()}
            </p>
          )}

          <div className="pt-4 border-t border-[#3D3B40]">
            <p className="text-xs uppercase tracking-wide text-[#BFCFE7] mb-2">
              Last 3 months activity
            </p>
            <ThreeMonthHeatmap activity={heatmapActivity} />
          </div>
        </section>
      )}
    </div>
  );
};

