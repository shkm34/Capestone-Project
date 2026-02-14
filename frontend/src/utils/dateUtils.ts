/** Pure date helpers. No I/O, no side effects. */

/** Today's date as YYYY-MM-DD (local time via ISO string). */
export function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Previous calendar day from a YYYY-MM-DD string. */
export function previousIsoDate(dateIso: string): string {
  const [y, m, d] = dateIso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}
