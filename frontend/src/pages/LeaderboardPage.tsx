import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { Link } from 'react-router-dom';
import { loadLeaderboard } from '../store/thunks/syncThunks';

export const LeaderboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((s: RootState) => s.leaderboard);

  useEffect(() => {
    void dispatch(loadLeaderboard());
  }, [dispatch]);

  const hasData = data && data.top.length > 0;

  return (
    <div className="min-h-screen bg-[#222222] text-[#F6F5F5] flex flex-col px-4 py-4 sm:py-6">
      <header className="flex items-center justify-between max-w-4xl mx-auto mb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Leaderboard</h1>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <span>←</span> Play
        </Link>
      </header>

      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-3xl space-y-4">
          {loading && (
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
              <p className="text-sm text-slate-200">Loading leaderboard…</p>
            </section>
          )}

          {error && (
            <section className="rounded-2xl border border-amber-800/60 bg-amber-950/40 p-5 sm:p-6">
              <p className="text-sm text-amber-100">{error}</p>
            </section>
          )}

          {hasData && (
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Top Players (by total score)
              </h2>
              <div className="space-y-2">
                {data!.top.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-xl bg-slate-950/70 border border-slate-800 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-sm font-semibold text-slate-300">
                        #{entry.rank}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-100">
                          {entry.email ?? 'Guest player'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {entry.streakCount} day streak
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-[#DDF2FD]">
                        {entry.totalPoints} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data?.currentUser && (
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Your Position
              </h2>
              <div className="flex items-center justify-between rounded-xl bg-slate-950/70 border border-slate-800 px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-sm font-semibold text-emerald-300">
                    #{data.currentUser.rank}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-100">
                      {data.currentUser.email ?? 'You'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {data.currentUser.streakCount} day streak
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-[#DDF2FD]">
                    {data.currentUser.totalPoints} pts
                  </span>
                </div>
              </div>
            </section>
          )}

          {!loading && !hasData && !error && (
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
              <p className="text-sm text-slate-300">
                No leaderboard data is available yet. Play a few days to start building scores.
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

