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
