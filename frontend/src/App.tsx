import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';
import { PlayPage } from './pages/PlayPage';
import { ProfilePage } from './pages/ProfilePage';
import { SignInPage } from './pages/SignInPage';
import { signOut as apiSignOut } from './services/api';
import { signOut as signOutAction } from './store/slices/authSlice';
import { useAppBootstrap } from './hooks/useAppBootstrap';
import { MainHeader } from './components/MainHeader';

function AppContent(): React.ReactElement {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useSelector((s: RootState) => s.auth.userId);
  const sessionChecked = useAppBootstrap();

  const handleSignOut = async () => {
    try {
      await apiSignOut();
    } catch {
      // Offline or backend down: still sign out locally
    }
    dispatch(signOutAction());
    navigate('/');
  };

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-[#222222] text-[#F6F5F5] flex items-center justify-center px-4">
        <p className="text-[#D9E2FF] text-sm sm:text-base">Loading…</p>
      </div>
    );
  }

  if (!userId) {
    return <SignInPage />;
  }

  return (
    <div className="min-h-screen bg-[#222222] text-[#F6F5F5] flex flex-col px-4 py-4 sm:py-6">
      <MainHeader onSignOut={handleSignOut} />
      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-4xl">
          <Routes>
            <Route path="/" element={<PlayPage key={userId ?? undefined} />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

const App: React.FC = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
