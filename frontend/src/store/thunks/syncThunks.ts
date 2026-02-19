import { createGuest, submitScore as apiSubmitScore, fetchUser, isOnline } from '../../services/api';
import type { AppDispatch, RootState } from '../index';
import { setGuest } from '../slices/authSlice';
import { setUserProfile, setProfileFetchError, rehydrateUserProfile } from '../slices/userProfileSlice';
import { enqueueScore, setPendingScores } from '../slices/syncSlice';
import { loadFromIndexedDB } from '../persistence';
import type { PendingScore } from '../slices/syncSlice';
import { buildSyntheticGuestProfile } from './buildSyntheticGuestProfile';

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
      return;
    }

    try {
      await dispatch(ensureUserId());
      const nextState = getState();
      const uid = nextState.auth.userId;
      if (!uid) {
        dispatch(enqueueScore(body));
        return;
      }
      await apiSubmitScore({
        date: payload.date,
        puzzleId: payload.puzzleId,
        score: payload.score,
        timeTakenMs: payload.timeTakenMs,
        streak,
      });
    } catch (e) {
      console.warn('[sync] submitScore failed, enqueueing', e);
      dispatch(enqueueScore(body));
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
          console.warn('[sync] createGuest for flush failed', e);
          return;
        }
      }

      const pending = [...state.sync.pendingScores];
      const failed: PendingScore[] = [];
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
          console.warn('[sync] flush item failed', e);
          failed.push(p);
        }
      }
      dispatch(setPendingScores(failed));
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
