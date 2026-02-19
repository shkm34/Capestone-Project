import { createGuest, submitScore as apiSubmitScore, fetchUser, isOnline, fetchLeaderboard, ApiError, type LeaderboardResponse } from '../../services/api';
import type { AppDispatch, RootState } from '../index';
import { setGuest } from '../slices/authSlice';
import { setUserProfile, setProfileFetchError, rehydrateUserProfile } from '../slices/userProfileSlice';
import { enqueueScore, setPendingScores } from '../slices/syncSlice';
import { loadFromIndexedDB } from '../persistence';
import type { PendingScore } from '../slices/syncSlice';
import { buildSyntheticGuestProfile } from './buildSyntheticGuestProfile';
import { setLeaderboard, setLeaderboardLoading, setLeaderboardError } from '../slices/leaderboardSlice';
import { addToast } from '../slices/toastSlice';

type AppThunk = (dispatch: AppDispatch, getState: () => RootState) => Promise<void>;

/** Ensure we have a userId: create guest via API if null and online. */
export function ensureUserId(): AppThunk {
  return async (dispatch, getState) => {
    const { auth } = getState();
    if (auth.userId) return;
    if (!isOnline()) return;
    try {
      const user = await createGuest();
      dispatch(setGuest({ userId: user.id }));
    } catch (e) {
      console.warn('[sync] ensureUserId failed', e);
    }
  };
}

export interface SubmitOrEnqueuePayload {
  date: string;
  puzzleId: string;
  score: number;
  timeTakenMs?: number;
}

/** Submit score to API if online (and we have or create userId); otherwise enqueue for later. */
export function submitOrEnqueueScore(payload: SubmitOrEnqueuePayload): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    const { streak } = state.progress;

    const body: PendingScore = {
      ...payload,
      streak,
    };

    if (!isOnline()) {
      dispatch(enqueueScore(body));
      dispatch(
        addToast({
          message: 'Score saved offline – will sync when you are online.',
          kind: 'info',
        }),
      );
      return;
    }

    try {
      await dispatch(ensureUserId());
      let nextState = getState();
      let uid = nextState.auth.userId;
      if (!uid) {
        dispatch(enqueueScore(body));
        dispatch(
          addToast({
            message: 'Could not identify user – score queued for later.',
            kind: 'warning',
          }),
        );
        return;
      }
      // Local guest: backend has no user. Create a server guest so score is accepted (avoids 400).
      if (uid.startsWith('guest-')) {
        try {
          const user = await createGuest();
          dispatch(setGuest({ userId: user.id }));
          nextState = getState();
          uid = nextState.auth.userId!;
        } catch (e) {
          console.warn('[sync] createGuest for submit failed', e);
          dispatch(enqueueScore(body));
          dispatch(
            addToast({
              message: 'Server unreachable – score queued for later.',
              kind: 'warning',
            }),
          );
          return;
        }
      }
      await apiSubmitScore({
        date: payload.date,
        puzzleId: payload.puzzleId,
        score: payload.score,
        timeTakenMs: payload.timeTakenMs,
        streak,
      });
      dispatch(
        addToast({
          message: 'Score submitted to server.',
          kind: 'success',
        }),
      );
      await dispatch(fetchUserProfile());
    } catch (e) {
      const isClientError = e instanceof ApiError && e.status >= 400 && e.status < 500;
      if (isClientError) {
        dispatch(
          addToast({
            message: e.message || 'Score could not be saved.',
            kind: 'error',
          }),
        );
      } else {
        dispatch(enqueueScore(body));
        dispatch(
          addToast({
            message: 'Server unreachable – score queued for later.',
            kind: 'warning',
          }),
        );
      }
    }
  };
}

/** Send all pending scores to the API when online. Keeps failed items in the queue for retry. */
export function flushPendingScores(): AppThunk {
  return async (dispatch, getState) => {
    if (!isOnline()) return;
    let state = getState();
    if (state.sync.pendingScores.length === 0) return;

    try {
      await dispatch(ensureUserId());
      state = getState();
      let uid = state.auth.userId;
      if (!uid) return;

      // Local guest: backend has no user. Create a server guest so scores can be submitted.
      if (uid.startsWith('guest-')) {
        try {
          const user = await createGuest();
          dispatch(setGuest({ userId: user.id }));
          state = getState();
          uid = state.auth.userId!;
        } catch (e) {
          //console.warn('[sync] createGuest for flush failed', e);
          return;
        }
      }

      const pending = [...state.sync.pendingScores];
      const failed: PendingScore[] = [];
      let dropped = 0;
      for (const p of pending) {
        try {
          await apiSubmitScore({
            date: p.date,
            puzzleId: p.puzzleId,
            score: p.score,
            timeTakenMs: p.timeTakenMs,
            streak: p.streak,
          });
        } catch (e) {
          const isPermanentReject = e instanceof ApiError && e.status === 400;
          if (isPermanentReject) {
            dropped += 1;
          } else {
            failed.push(p);
          }
          if (!isPermanentReject) console.warn('[sync] flush item failed', e);
        }
      }
      dispatch(setPendingScores(failed));
      if (failed.length === 0 && dropped === 0) {
        dispatch(
          addToast({
            message: 'All pending scores synced to server.',
            kind: 'success',
          }),
        );
      } else if (failed.length === 0 && dropped > 0) {
        dispatch(
          addToast({
            message: dropped === 1 ? 'One score could not be synced (invalid date).' : `${dropped} scores could not be synced (invalid date).`,
            kind: 'warning',
          }),
        );
      } else if (failed.length < pending.length) {
        dispatch(
          addToast({
            message: 'Some scores synced; remaining will retry when online.',
            kind: 'warning',
          }),
        );
      } else if (failed.length > 0) {
        dispatch(
          addToast({
            message: 'Scores will sync when the server is available.',
            kind: 'info',
          }),
        );
      }
    } catch (e) {
      console.warn('[sync] flushPendingScores failed', e);
    }
  };
}

/** Fetch user profile from API and put in Redux (then persisted to IndexedDB). Call when we have userId. */
export function fetchUserProfile(): AppThunk {
  return async (dispatch, getState) => {
    const uid = getState().auth.userId;
    if (!uid) return;

    // Local guest: backend has no profile. Always build synthetic from current state (avoids stale IDB overwriting).
    if (uid.startsWith('guest-')) {
      const state = getState();
      dispatch(setUserProfile(buildSyntheticGuestProfile(uid, state.progress, state.sync)));
      return;
    }

    if (!isOnline()) return;
    try {
      const user = await fetchUser(uid);
      dispatch(setUserProfile(user));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Fetch failed';
      console.warn('[sync] fetchUserProfile failed', e);
      const saved = await loadFromIndexedDB();
      if (saved?.userProfile?.user) {
        dispatch(rehydrateUserProfile({ user: saved.userProfile.user, lastFetchedAt: saved.userProfile.lastFetchedAt ?? null }));
      } else {
        dispatch(setProfileFetchError(msg));
      }
    }
  };
}

/** Load leaderboard with offline-first behaviour: use cached Redux/IndexedDB data, refresh from network when possible. */
export function loadLeaderboard(): AppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    const cached = state.leaderboard.data;

    // If we already have data, don't block UI with a spinner.
    dispatch(setLeaderboardLoading(!cached));
    dispatch(setLeaderboardError(null));

    // Offline: use Redux cache or try IndexedDB; don't hit the network.
    if (!isOnline()) {
      if (cached) {
        dispatch(setLeaderboardLoading(false));
        return;
      }
      const saved = await loadFromIndexedDB();
      const idbLeaderboard = saved?.leaderboard?.data;
      if (idbLeaderboard && typeof idbLeaderboard === 'object' && idbLeaderboard !== null && 'top' in idbLeaderboard) {
        dispatch(setLeaderboard({
          data: idbLeaderboard as LeaderboardResponse,
          fetchedAt: saved?.leaderboard?.lastFetchedAt ?? new Date().toISOString(),
        }));
      } else {
        dispatch(setLeaderboardError('Leaderboard is available when you\'re online.'));
      }
      dispatch(setLeaderboardLoading(false));
      return;
    }

    try {
      const res = await fetchLeaderboard({
        sortBy: 'totalScore',
        limit: 5,
        userId: state.auth.userId ?? null,
      });
      dispatch(setLeaderboard({ data: res, fetchedAt: new Date().toISOString() }));
    } catch (e) {
      if (cached) {
        // Keep showing cached data; no error.
      } else {
        const saved = await loadFromIndexedDB();
        const idbLeaderboard = saved?.leaderboard?.data;
        if (idbLeaderboard && typeof idbLeaderboard === 'object' && idbLeaderboard !== null && 'top' in idbLeaderboard) {
          dispatch(setLeaderboard({
            data: idbLeaderboard as LeaderboardResponse,
            fetchedAt: saved?.leaderboard?.lastFetchedAt ?? new Date().toISOString(),
          }));
        } else {
          dispatch(setLeaderboardError('Unable to load leaderboard right now.'));
        }
      }
    } finally {
      dispatch(setLeaderboardLoading(false));
    }
  };
}
