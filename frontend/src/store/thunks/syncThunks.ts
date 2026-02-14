import { createGuest, submitScore as apiSubmitScore, fetchUser, isOnline } from '../../services/api';
import type { AppDispatch, RootState } from '../index';
import { setGuest } from '../slices/authSlice';
import { setUserProfile, setProfileFetchError } from '../slices/userProfileSlice';
import { enqueueScore, clearPendingScores } from '../slices/syncSlice';
import type { PendingScore } from '../slices/syncSlice';

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
        userId: uid,
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

/** Send all pending scores to the API when online. */
export function flushPendingScores(): AppThunk {
  return async (dispatch, getState) => {
    if (!isOnline()) return;
    const { sync } = getState();
    if (sync.pendingScores.length === 0) return;

    try {
      await dispatch(ensureUserId());
      const nextState = getState();
      const uid = nextState.auth.userId;
      if (!uid) return;

      const pending = [...nextState.sync.pendingScores];
      for (const p of pending) {
        try {
          await apiSubmitScore({
            userId: uid,
            date: p.date,
            puzzleId: p.puzzleId,
            score: p.score,
            timeTakenMs: p.timeTakenMs,
            streak: p.streak,
          });
        } catch (e) {
          console.warn('[sync] flush item failed', e);
        }
      }
      dispatch(clearPendingScores());
    } catch (e) {
      console.warn('[sync] flushPendingScores failed', e);
    }
  };
}

/** Fetch user profile from API and put in Redux (then persisted to IndexedDB). Call when we have userId. */
export function fetchUserProfile(): AppThunk {
  return async (dispatch, getState) => {
    const uid = getState().auth.userId;
    if (!uid || !isOnline()) return;
    try {
      const user = await fetchUser(uid);
      dispatch(setUserProfile(user));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Fetch failed';
      dispatch(setProfileFetchError(msg));
      console.warn('[sync] fetchUserProfile failed', e);
    }
  };
}
