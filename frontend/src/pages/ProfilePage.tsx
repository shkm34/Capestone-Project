import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { YearHeatmap, type HeatmapActivity } from '../components/YearHeatmap';
import { useProfileData } from '../hooks/useProfileData';
import { buildHeatmapActivity } from '../utils/heatmapActivity';

export const ProfilePage: React.FC = () => {
  const {
    userId,
    user,
    lastFetchedAt,
    fetchError,
    loading,
    error,
    streak,
    completedByDate,
    pendingScores,
  } = useProfileData();

  const heatmapActivity: HeatmapActivity[] = useMemo(
    () => buildHeatmapActivity(completedByDate, user, pendingScores),
    [completedByDate, user, pendingScores],
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center px-4 py-6">
      <div className="w-full max-w-3xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Your Profile
          </h1>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span>←</span> Play
          </Link>
        </div>

        {/* Not signed in */}
        {!userId && (
          <section className="rounded-2xl border border-slate-800 bg-linear-to-br from-slate-900 to-slate-950 p-6 sm:p-8">
            <p className="text-slate-300 leading-relaxed">
              You&apos;re not signed in yet. Complete a puzzle or go online to get a
              guest account; your profile will appear here.
            </p>
          </section>
        )}

        {/* Loading */}
        {loading && (
          <section className="rounded-2xl border border-slate-800 bg-linear-to-br from-slate-900 to-slate-950 p-6 sm:p-8">
            <p className="text-slate-300">Loading profile…</p>
          </section>
        )}

        {/* Error */}
        {error && (
          <section className="rounded-2xl border border-red-900/50 bg-linear-to-br from-red-950/30 to-slate-950 p-6 sm:p-8">
            <p className="text-red-400 font-medium">{fetchError}</p>
            <p className="text-sm text-slate-400 mt-2">Try again when online.</p>
          </section>
        )}

        {/* User profile content */}
        {user && (
          <div className="space-y-5">
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Streak card */}
              <div className="rounded-2xl border border-slate-800 bg-linear-to-br from-[#190482]/60 via-slate-900 to-slate-950 p-5 sm:p-6 shadow-lg">
                <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Current Streak
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-[#F05537]">
                  {streak}
                </p>
                <p className="text-sm text-slate-400 mt-1">days</p>
              </div>

              {/* Total points card */}
              <div className="rounded-2xl border border-slate-800 bg-linear-to-br from-[#190482]/60 via-slate-900 to-slate-950 p-5 sm:p-6 shadow-lg">
                <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Total Points
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-[#DDF2FD]">
                  {user.totalPoints}
                </p>
                <p className="text-sm text-slate-400 mt-1">all time</p>
              </div>
            </div>

            {/* Additional stats */}
            {user.stats && (
              <section className="rounded-2xl border border-slate-800 bg-linear-to-br from-slate-900 to-slate-950 p-5 sm:p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">
                  Statistics
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Puzzles Solved</p>
                    <p className="text-xl font-semibold text-white">
                      {user.stats.puzzlesSolved}
                    </p>
                  </div>
                  {user.stats.avgSolveTimeMs != null && (
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400">Average Time</p>
                      <p className="text-xl font-semibold text-white">
                        {Math.round(user.stats.avgSolveTimeMs / 1000)}s
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Account info */}
            <section className="rounded-2xl border border-slate-800 bg-linear-to-br from-slate-900 to-slate-950 p-5 sm:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">
                Account Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">User ID</p>
                  <p className="text-sm font-mono text-slate-200 break-all bg-slate-900/60 rounded-lg px-3 py-2 border border-slate-800">
                    {user.id}
                  </p>
                </div>
                {user.email && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Email</p>
                    <p className="text-sm text-slate-200">{user.email}</p>
                  </div>
                )}
                {user.lastPlayed && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Last Played</p>
                    <p className="text-sm text-slate-200">
                      {new Date(user.lastPlayed).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Recent scores */}
            {user.dailyScores.length > 0 && (
              <section className="rounded-2xl border border-slate-800 bg-linear-to-br from-slate-900 to-slate-950 p-5 sm:p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">
                  Recent Scores
                </h2>
                <div className="space-y-2">
                  {user.dailyScores.slice(0, 10).map((s) => (
                    <div
                      key={`${s.date}-${s.puzzleId}`}
                      className="flex items-center justify-between rounded-lg bg-slate-900/60 border border-slate-800 px-3 py-2 hover:bg-slate-900/80 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {s.date}
                        </p>
                        <p className="text-xs text-slate-400 capitalize">
                          {s.puzzleId}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {s.timeTakenMs != null && (
                          <span className="text-xs text-slate-400">
                            {Math.round(s.timeTakenMs / 1000)}s
                          </span>
                        )}
                        <span className="text-sm font-semibold text-[#DDF2FD]">
                          {s.score} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Heatmap — last 365 days */}
            <section className="rounded-2xl border border-slate-800 bg-linear-to-br from-slate-900 to-slate-950 p-5 sm:p-6 overflow-hidden">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">
                Activity (365 days)
              </h2>
              <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 min-w-0 max-w-full overflow-x-auto">
                <YearHeatmap activity={heatmapActivity} />
              </div>
            </section>

            {/* Footer metadata */}
            {lastFetchedAt && (
              <p className="text-[10px] text-slate-500 text-center">
                Last updated {new Date(lastFetchedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

