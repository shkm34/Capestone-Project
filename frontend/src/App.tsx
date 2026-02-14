import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { PlayPage } from './pages/PlayPage';
import { ProfilePage } from './pages/ProfilePage';
import { store, initStorePersistence } from './store';
import { flushPendingScores, ensureUserId } from './store/thunks/syncThunks';

const App: React.FC = () => {
  useEffect(() => {
    initStorePersistence().then(() => {
      store.dispatch(flushPendingScores());
      store.dispatch(ensureUserId());
    });
    const onOnline = () => {
      store.dispatch(flushPendingScores());
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#222222] text-[#F6F5F5] flex flex-col items-center px-4 py-6">
        <nav className="w-full max-w-xl flex items-center justify-between mb-6">
          <Link
            to="/"
            className="text-lg font-semibold text-[#FFFFFF] hover:text-[#DDF2FD] transition-colors"
          >
            Logic Looper
          </Link>
          <div className="flex gap-4">
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
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<PlayPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
