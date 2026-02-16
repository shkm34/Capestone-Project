/** Pure date helpers. No I/O, no side effects. */

/** Format a date as YYYY-MM-DD in local time (so "today" matches the user's calendar). */
export function getLocalIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Today's date as YYYY-MM-DD in local time. */
export function getTodayIsoDate(): string {
  return getLocalIsoDate(new Date());
}

/** Previous calendar day from a YYYY-MM-DD string (local date). */
export function previousIsoDate(dateIso: string): string {
  const [y, m, d] = dateIso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return getLocalIsoDate(date);
}

/**
 * Normalize a date string to YYYY-MM-DD (padded month/day).
 * Use when reading completedByDate from IDB or API so keys always match getTodayIsoDate().
 */
export function normalizeDateKey(key: string): string {
  const parts = key.trim().split('-').map((p) => parseInt(p, 10));
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return key;
  const [y, m, d] = parts;
  const month = Math.max(1, Math.min(12, m));
  const day = Math.max(1, Math.min(31, d));
  return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
