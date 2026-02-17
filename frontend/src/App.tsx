import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';
import { PlayPage } from './pages/PlayPage';
import { ProfilePage } from './pages/ProfilePage';
import { SignInPage } from './pages/SignInPage';
import { signOut as apiSignOut } from './services/api';
import { signOut as signOutAction } from './store/slices/authSlice';
import { useAppBootstrap } from './hooks/useAppBootstrap';

function AppContent(): React.ReactElement {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useSelector((s: RootState) => s.auth.userId);
  const sessionChecked = useAppBootstrap();

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
