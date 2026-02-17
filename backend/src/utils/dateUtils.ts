/** Pure date helpers. No I/O, no side effects. */

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Today's date as YYYY-MM-DD (UTC). */
export function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** True if s is YYYY-MM-DD and a valid calendar date (e.g. rejects 2025-02-30). */
export function isValidIsoDateString(s: string): boolean {
  if (typeof s !== 'string' || !ISO_DATE_REGEX.test(s.trim())) return false;
  const [y, m, d] = s.trim().split('-').map(Number);
  if (m < 1 || m > 12 || d < 1) return false;
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

/** True if dateIso is not after today (UTC). Use after isValidIsoDateString. */
export function isDateNotInFuture(dateIso: string): boolean {
  return dateIso <= getTodayIso();
}

/** Previous calendar day from a YYYY-MM-DD string. */
export function previousDate(dateIso: string): string {
  const [y, m, d] = dateIso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}
