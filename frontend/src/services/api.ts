/**
 * API client for Logic Looper backend. Used for guest creation and score sync.
 */

const getBaseUrl = (): string => {
  const env = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
  const url = env && typeof env === 'object' && 'VITE_API_URL' in env ? (env as { VITE_API_URL?: string }).VITE_API_URL : undefined;
  if (url && typeof url === 'string') return url;
  return 'http://localhost:3000';
};

export interface CreateUserResponse {
  id: string;
  email: string | null;
}

export async function createGuest(): Promise<CreateUserResponse> {
  const res = await fetch(`${getBaseUrl()}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`createGuest failed: ${res.status}`);
  return res.json() as Promise<CreateUserResponse>;
}

export interface SubmitScoreBody {
  userId: string;
  date: string;
  puzzleId: string;
  score: number;
  timeTakenMs?: number;
  streak: number;
}

export async function submitScore(body: SubmitScoreBody): Promise<{ accepted: boolean; streak: number }> {
  const res = await fetch(`${getBaseUrl()}/api/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`submitScore failed: ${res.status}`);
  return res.json() as Promise<{ accepted: boolean; streak: number }>;
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}
