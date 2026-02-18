import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { store, initStorePersistence } from '../store';
import type { AppDispatch } from '../store';
import type { UserProfile } from '../services/api';
import { setUser, signOut as signOutAction, rehydrateAuth } from '../store/slices/authSlice';
import { rehydrateProgress } from '../store/slices/progressSlice';
import { rehydrateSync, type PendingScore } from '../store/slices/syncSlice';
import { rehydrateUserProfile } from '../store/slices/userProfileSlice';
import { fetchUserProfile, flushPendingScores } from '../store/thunks/syncThunks';
import { getSession, setStoredToken } from '../services/api';
import { computeStreak } from '../utils/streakUtils';

/** Build progress from API profile. Streak is derived from completedByDate (single source of truth). */
function progressFromProfile(user: UserProfile): {
  completedByDate: Record<string, { solved: boolean; usedHint: boolean }>;
  streak: number;
} {
  const completedByDate: Record<string, { solved: boolean; usedHint: boolean }> = {};
  for (const s of user.dailyScores) {
    if (!completedByDate[s.date]) {
      completedByDate[s.date] = { solved: true, usedHint: false };
    }
  }
  return { completedByDate, streak: computeStreak(completedByDate) };
}

/**
 * Bootstraps the app:
 * - Loads persisted Redux state from IndexedDB
 * - Restores guest sessions from persistence if no server session
 * - Hydrates progress and sync state from API profile or saved state
 * - Flushes any pending scores (initially and when coming back online)
 *
 * Returns a boolean flag indicating whether the initial session check is complete.
 */
export function useAppBootstrap(): boolean {
  const dispatch = useDispatch<AppDispatch>();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const saved = await initStorePersistence();
      if (cancelled) return;

      // Handle Google OAuth token in URL hash, if present.
      const hash = window.location.hash;
      if (hash.startsWith('#token=')) {
        setStoredToken(decodeURIComponent(hash.slice(7)));
        window.history.replaceState({}, '', window.location.pathname + window.location.search);
      }

      let data: { user: { id: string; email: string | null } } | null = null;
      try {
        data = await getSession();
      } catch (e) {
        // Backend unreachable or other network error – treat as "no server session"
        // so the app can still boot from local persistence (offline-first behavior).
        console.warn('[bootstrap] getSession failed, falling back to saved state', e);
        data = null;
      }
      if (cancelled) return;

      // No authenticated user from the server: try to restore guest from persistence.
      if (!data?.user) {
        if (saved?.auth?.userId && saved.auth.isGuest) {
          dispatch(rehydrateAuth(saved.auth));
          dispatch(rehydrateProgress(saved.progress ?? { completedByDate: {}, streak: 0 }));
          dispatch(
            rehydrateSync({
              pendingScores: (saved.sync?.pendingScores ?? []) as PendingScore[],
              lastSyncAt: saved.sync?.lastSyncAt ?? null,
            }),
          );
          if (saved?.userProfile?.user != null) {
            dispatch(rehydrateUserProfile({ user: saved.userProfile.user, lastFetchedAt: saved.userProfile.lastFetchedAt ?? null }));
          }

          await store.dispatch(fetchUserProfile());
          if (cancelled) return;

          const user = store.getState().userProfile.user;
          if (user) {
            dispatch(rehydrateProgress(progressFromProfile(user)));
          }

          store.dispatch(flushPendingScores());
        } else {
          dispatch(signOutAction());
        }

        setSessionChecked(true);
        return;
      }

      // Authenticated user from server: hydrate auth, profile, progress, and sync.
      dispatch(setUser({ userId: data.user.id, email: data.user.email }));
      await store.dispatch(fetchUserProfile());
      if (cancelled) return;

      const user = store.getState().userProfile.user;
      if (user) {
        dispatch(rehydrateProgress(progressFromProfile(user)));
      } else {
        dispatch(rehydrateProgress({ completedByDate: {}, streak: 0 }));
      }

      dispatch(rehydrateSync({ pendingScores: [], lastSyncAt: null }));
      store.dispatch(flushPendingScores());
      setSessionChecked(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  // When network comes back online, try to flush any pending scores.
  useEffect(() => {
    const onOnline = () => store.dispatch(flushPendingScores());
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  return sessionChecked;
}

