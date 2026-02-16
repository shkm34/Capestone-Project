/**
 * API client for Logic Looper backend. Auth uses Authorization: Bearer <token> only.
 */

const TOKEN_KEY = 'logic_looper_token';

export const getBaseUrl = (): string => {
  const env = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
  const url = env && typeof env === 'object' && 'VITE_API_URL' in env ? (env as { VITE_API_URL?: string }).VITE_API_URL : undefined;
  if (url && typeof url === 'string') return url;
  return 'http://localhost:3000';
};

export function getStoredToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

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

/** POST /api/auth/signout - client clears token. */
export async function signOut(): Promise<void> {
  await fetch(`${getBaseUrl()}/api/auth/signout`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
  });
  clearStoredToken();
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
