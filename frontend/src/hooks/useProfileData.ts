import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchUserProfile, flushPendingScores } from '../store/thunks/syncThunks';
import { setUserProfile } from '../store/slices/userProfileSlice';
import { buildSyntheticGuestProfile } from '../store/thunks/buildSyntheticGuestProfile';
import { isOnline } from '../services/api';

export function useProfileData() {
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector((s: RootState) => s.auth.userId);
  const { user, lastFetchedAt, fetchError } = useSelector((s: RootState) => s.userProfile);
  const streak = useSelector((s: RootState) => s.progress.streak);
  const completedByDate = useSelector((s: RootState) => s.progress.completedByDate);
  const pendingScores = useSelector((s: RootState) => s.sync.pendingScores);
  const progress = useSelector((s: RootState) => s.progress);
  const sync = useSelector((s: RootState) => s.sync);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, userId]);

  // When Profile is visited and we're online, try to flush pending scores (covers "server came back" without refresh).
  useEffect(() => {
    if (userId && isOnline()) {
      dispatch(flushPendingScores());
    }
  }, [dispatch, userId]);

  // For local guests, keep the synthetic profile in sync with local progress/sync.
  useEffect(() => {
    if (!userId || !userId.startsWith('guest-')) return;
    dispatch(setUserProfile(buildSyntheticGuestProfile(userId, progress, sync)));
  }, [dispatch, userId, progress, sync]);

  const loading = Boolean(userId && !user && !fetchError);
  const error = Boolean(fetchError);

  // When server has no scores but we have local progress/pending, show merged profile so stats aren't 0.
  const hasLocalActivity =
    user != null &&
    user.dailyScores.length === 0 &&
    (Object.keys(progress.completedByDate).length > 0 || sync.pendingScores.length > 0);
  const displayUser =
    hasLocalActivity
      ? { ...buildSyntheticGuestProfile(user.id, progress, sync), email: user.email }
      : user;

  return {
    userId,
    user: displayUser,
    lastFetchedAt,
    fetchError,
    loading,
    error,
    streak,
    completedByDate,
    pendingScores,
  };
}
