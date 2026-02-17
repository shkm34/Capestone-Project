/** Client-side daily state: persistence only. Pure date/streak logic lives in utils. */

export interface DailyMeta {
  solved: boolean;
  usedHint: boolean;
}

const STORAGE_KEY = 'logicLooper:dailyMeta';

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
