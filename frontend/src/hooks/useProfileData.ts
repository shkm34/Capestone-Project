import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchUserProfile } from '../store/thunks/syncThunks';

export function useProfileData() {
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector((s: RootState) => s.auth.userId);
  const { user, lastFetchedAt, fetchError } = useSelector((s: RootState) => s.userProfile);
  const streak = useSelector((s: RootState) => s.progress.streak);
  const completedByDate = useSelector((s: RootState) => s.progress.completedByDate);
  const pendingScores = useSelector((s: RootState) => s.sync.pendingScores);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, userId]);

  const loading = Boolean(userId && !user && !fetchError);
  const error = Boolean(fetchError);

  return {
    userId,
    user,
    lastFetchedAt,
    fetchError,
    loading,
    error,
    streak,
    completedByDate,
    pendingScores,
  };
}
