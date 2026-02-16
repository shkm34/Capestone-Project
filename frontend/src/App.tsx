import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';
import { PlayPage } from './pages/PlayPage';
import { ProfilePage } from './pages/ProfilePage';
import { SignInPage } from './pages/SignInPage';
import type { UserProfile } from './services/api';
import { store, initStorePersistence } from './store';
import { setUser, signOut as signOutAction } from './store/slices/authSlice';
import { rehydrateProgress } from './store/slices/progressSlice';
import { rehydrateSync } from './store/slices/syncSlice';
import { fetchUserProfile, flushPendingScores } from './store/thunks/syncThunks';
import { getSession, signOut as apiSignOut, setStoredToken } from './services/api';
import { computeStreak } from './utils/streakUtils';

/** Build progress from API profile. Streak is derived from completedByDate (single source of truth). */
function progressFromProfile(user: UserProfile): { completedByDate: Record<string, { solved: boolean; usedHint: boolean }>; streak: number } {
  const completedByDate: Record<string, { solved: boolean; usedHint: boolean }> = {};
  for (const s of user.dailyScores) {
    if (!completedByDate[s.date]) completedByDate[s.date] = { solved: true, usedHint: false };
  }
  return { completedByDate, streak: computeStreak(completedByDate) };
}

function AppContent(): React.ReactElement {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useSelector((s: RootState) => s.auth.userId);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await initStorePersistence();
      if (cancelled) return;

      const hash = window.location.hash;
      if (hash.startsWith('#token=')) {
        setStoredToken(decodeURIComponent(hash.slice(7)));
        window.history.replaceState({}, '', window.location.pathname + window.location.search);
      }

      const data = await getSession();
      if (cancelled) return;

      if (!data?.user) {
        dispatch(signOutAction());
        setSessionChecked(true);
        return;
      }

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

    return () => { cancelled = true; };
  }, [dispatch]);

  useEffect(() => {
    const onOnline = () => store.dispatch(flushPendingScores());
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  const handleSignOut = async () => {
    await apiSignOut();
    dispatch(signOutAction());
    navigate('/');
  };

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-[#222222] text-[#F6F5F5] flex items-center justify-center">
        <p className="text-[#D9E2FF]">Loading…</p>
      </div>
    );
  }

  if (!userId) {
    return <SignInPage />;
  }

  return (
    <div className="min-h-screen bg-[#222222] text-[#F6F5F5] flex flex-col items-center px-4 py-6">
      <nav className="w-full max-w-xl flex items-center justify-between mb-6">
        <Link
          to="/"
          className="text-lg font-semibold text-[#FFFFFF] hover:text-[#DDF2FD] transition-colors"
        >
          Logic Looper
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-sm font-medium text-[#D9E2FF] hover:text-[#FFFFFF] transition-colors"
          >
            Play
          </Link>
          <Link
            to="/profile"
            className="text-sm font-medium text-[#D9E2FF] hover:text-[#FFFFFF] transition-colors"
          >
            Profile
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm font-medium text-[#D9E2FF] hover:text-[#FFFFFF] transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<PlayPage key={userId ?? undefined} />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

const App: React.FC = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
