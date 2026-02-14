export interface DailyMeta {
  solved: boolean;
  usedHint: boolean;
}

const STORAGE_KEY = 'logicLooper:dailyMeta';

export function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export function loadDailyMeta(): Record<string, DailyMeta> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, DailyMeta>;
  } catch {
    return {};
  }
}

export function saveDailyMeta(meta: Record<string, DailyMeta>): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
}

function previousIsoDate(dateIso: string): string {
  const [y, m, d] = dateIso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function computeStreak(meta: Record<string, DailyMeta>): number {
  let streak = 0;
  let cursor = getTodayIsoDate();

  while (meta[cursor]?.solved) {
    streak += 1;
    cursor = previousIsoDate(cursor);
  }

  return streak;
}

