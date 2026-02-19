/**
 * API client for Logic Looper backend. Auth uses Authorization: Bearer <token> only.
 */

import { getStoredToken, setStoredToken, clearStoredToken } from './authStorage';

export { getStoredToken, setStoredToken, clearStoredToken };

export const getBaseUrl = (): string => {
  const env = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
  const url = env && typeof env === 'object' && 'VITE_API_URL' in env ? (env as { VITE_API_URL?: string }).VITE_API_URL : undefined;
  if (url && typeof url === 'string') return url;
  return 'http://localhost:3000';
};

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) (h as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  return h;
}

/** GET /api/auth/session - current user if signed in (Authorization: Bearer). */
export interface SessionUser {
  id: string;
  email: string | null;
}

export async function getSession(): Promise<{ user: SessionUser } | null> {
  const res = await fetch(`${getBaseUrl()}/api/auth/session`, {
    headers: authHeaders(),
    credentials: 'include',
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`getSession failed: ${res.status}`);
  return res.json() as Promise<{ user: SessionUser }>;
}

/** Redirect to backend Google sign-in (full page redirect). */
export function getSignInWithGoogleUrl(): string {
  return `${getBaseUrl()}/api/auth/signin/google`;
}

/** POST /api/auth/signout - clear server session. Always clears local token (offline-safe). */
export async function signOut(): Promise<void> {
  try {
    await fetch(`${getBaseUrl()}/api/auth/signout`, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
    });
  } catch (e) {
    // Backend down or network error: still sign out locally
    console.warn('[api] signOut request failed, clearing local token', e);
  } finally {
    clearStoredToken();
  }
}

export interface CreateUserResponse {
  id: string;
  email: string | null;
  /** JWT for this user (Option A: store and send as Bearer so guest can call protected endpoints). */
  token?: string;
}

export async function createGuest(): Promise<CreateUserResponse> {
  const res = await fetch(`${getBaseUrl()}/api/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({}),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`createGuest failed: ${res.status}`);
  const data = (await res.json()) as CreateUserResponse;
  if (data.token) setStoredToken(data.token);
  return data;
}

/** Score payload: userId is inferred from auth (Bearer token), not sent in body. */
export interface SubmitScoreBody {
  date: string;
  puzzleId: string;
  score: number;
  timeTakenMs?: number;
  streak: number;
}

export async function submitScore(body: SubmitScoreBody): Promise<{ accepted: boolean; streak: number }> {
  const res = await fetch(`${getBaseUrl()}/api/score`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`submitScore failed: ${res.status}`);
  return res.json() as Promise<{ accepted: boolean; streak: number }>;
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

export interface LeaderboardEntry {
  id: string;
  email: string | null;
  totalPoints: number;
  streakCount: number;
  avgSolveTimeMs: number | null;
  rank: number;
}

export interface LeaderboardResponse {
  sortBy: string;
  top: LeaderboardEntry[];
  currentUser: LeaderboardEntry | null;
}

let lastLeaderboard: LeaderboardResponse | null = null;
let lastLeaderboardFetchedAt = 0;
const LEADERBOARD_TTL_MS = 2 * 60 * 1000;
const LEADERBOARD_BACKOFF_MS = 60 * 1000;
let leaderboardBackoffUntil = 0;

export async function fetchLeaderboard(params: {
  sortBy?: string;
  limit?: number;
  userId?: string | null;
} = {}): Promise<LeaderboardResponse> {
  const now = Date.now();

  // If we've recently seen the backend as unreachable, avoid spamming network errors.
  if (now < leaderboardBackoffUntil) {
    if (lastLeaderboard) {
      return lastLeaderboard;
    }
    // No cached data: fail fast without issuing a network request (no net::ERR_*).
    throw new Error('Leaderboard temporarily unavailable');
  }

  // Minimal client-side cache so leaderboard keeps showing if server is temporarily down.
  if (lastLeaderboard && now - lastLeaderboardFetchedAt < LEADERBOARD_TTL_MS) {
    try {
      const url = new URL(`${getBaseUrl()}/api/score/leaderboard`);
      if (params.sortBy) url.searchParams.set('sortBy', params.sortBy);
      if (params.limit) url.searchParams.set('limit', String(params.limit));
      if (params.userId) url.searchParams.set('userId', params.userId);

      const res = await fetch(url.toString(), {
        headers: authHeaders(),
        credentials: 'include',
      });

      if (res.ok) {
        const fresh = (await res.json()) as LeaderboardResponse;
        lastLeaderboard = fresh;
        lastLeaderboardFetchedAt = now;
        leaderboardBackoffUntil = 0;
        return fresh;
      }
      // Non-OK response: start backoff window.
      leaderboardBackoffUntil = now + LEADERBOARD_BACKOFF_MS;
    } catch {
      // Network error: start backoff window and fall through to cached value.
      leaderboardBackoffUntil = now + LEADERBOARD_BACKOFF_MS;
    }
    return lastLeaderboard;
  }

  const url = new URL(`${getBaseUrl()}/api/score/leaderboard`);
  if (params.sortBy) url.searchParams.set('sortBy', params.sortBy);
  if (params.limit) url.searchParams.set('limit', String(params.limit));
  if (params.userId) url.searchParams.set('userId', params.userId);

  try {
    const res = await fetch(url.toString(), {
      headers: authHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`fetchLeaderboard failed: ${res.status}`);
    const data = (await res.json()) as LeaderboardResponse;
    lastLeaderboard = data;
    lastLeaderboardFetchedAt = now;
    leaderboardBackoffUntil = 0;
    return data;
  } catch (e) {
    // Any failure here starts a backoff window to avoid repeated network errors.
    leaderboardBackoffUntil = now + LEADERBOARD_BACKOFF_MS;
    if (lastLeaderboard) {
      return lastLeaderboard;
    }
    throw e;
  }
}

/** User profile from GET /api/users/:id (with stats and recent daily scores). */
export interface UserProfile {
  id: string;
  email: string | null;
  streakCount: number;
  lastPlayed: string | null;
  totalPoints: number;
  stats: { puzzlesSolved: number; avgSolveTimeMs: number | null } | null;
  dailyScores: Array<{ date: string; puzzleId: string; score: number; timeTakenMs: number | null }>;
}

export async function fetchUser(userId: string): Promise<UserProfile> {
  const res = await fetch(`${getBaseUrl()}/api/users/${userId}`, {
    headers: authHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`fetchUser failed: ${res.status}`);
  return res.json() as Promise<UserProfile>;
}
