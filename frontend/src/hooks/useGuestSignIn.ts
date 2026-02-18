import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch } from '../store';
import { createGuest} from '../services/api';
import { setGuest } from '../store/slices/authSlice';

interface UseGuestSignInResult {
  guestLoading: boolean;
  guestError: string | null;
  handlePlayAsGuest: () => Promise<void>;
}

/**
 * Encapsulates the “Play as guest” flow:
 * - Creates a guest user via the API
 * - Stores the guest in auth state
 * - Navigates to the main play page
 */
export function useGuestSignIn(): UseGuestSignInResult {
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handlePlayAsGuest = async () => {
    setGuestError(null);
    setGuestLoading(true);
    try {
      const user = await createGuest();
      dispatch(setGuest({ userId: user.id }));
      navigate('/');
    } catch {
      // Backend down or network error: fall back to local guest so the app still works (offline-first).
      const localId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      dispatch(setGuest({ userId: localId }));
      navigate('/');
    } finally {
      setGuestLoading(false);
    }
  };

  return { guestLoading, guestError, handlePlayAsGuest };
}

