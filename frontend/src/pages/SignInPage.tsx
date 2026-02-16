import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getSignInWithGoogleUrl, createGuest } from '../services/api';
import type { AppDispatch } from '../store';
import { setGuest } from '../store/slices/authSlice';

const ERROR_MESSAGES: Record<string, string> = {
  missing_code: 'Sign-in was cancelled or invalid.',
  server_config: 'Server is not configured for Google sign-in.',
  no_email: 'Google did not provide an email.',
  userinfo_failed: 'Could not load your Google profile.',
  callback_failed: 'Sign-in failed. Please try again.',
};

export const SignInPage: React.FC = () => {
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [guestError, setGuestError] = useState<string | null>(null);
  const [guestLoading, setGuestLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error) {
      setErrorCode(error);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSignIn = () => {
    window.location.href = getSignInWithGoogleUrl();
  };

  const handlePlayAsGuest = async () => {
    setGuestError(null);
    setGuestLoading(true);
    try {
      const user = await createGuest();
      dispatch(setGuest({ userId: user.id }));
      navigate('/');
    } catch {
      setGuestError('Could not start guest session. Please try again.');
    } finally {
      setGuestLoading(false);
    }
  };

  const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] ?? 'Something went wrong.' : null;

  return (
    <div className="min-h-screen bg-[#222222] text-[#F6F5F5] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-semibold text-[#FFFFFF]">Logic Looper</h1>
        <p className="text-sm text-[#D9E2FF]">
          Sign in with Google to play daily puzzles and track your streak.
        </p>
        {errorMessage && (
          <p className="text-sm text-[#F05537]" role="alert">
            {errorMessage}
          </p>
        )}
        <button
          type="button"
          onClick={handleSignIn}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#414BEA] px-4 py-3 text-sm font-semibold text-white hover:bg-[#525CEB] transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>
        <button
          type="button"
          onClick={handlePlayAsGuest}
          disabled={guestLoading}
          className="w-full rounded-lg border border-[#D9E2FF] px-4 py-3 text-sm font-medium text-[#D9E2FF] hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
        >
          {guestLoading ? 'Starting…' : 'Play as guest'}
        </button>
        {guestError && (
          <p className="text-sm text-[#F05537]" role="alert">
            {guestError}
          </p>
        )}
      </div>
    </div>
  );
};
