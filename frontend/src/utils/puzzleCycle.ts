/** Deterministic puzzle type per calendar day. Same date → same type for everyone. */

export const PUZZLE_TYPE_CYCLE = [
  'sequence',
  'pattern',
  'binary',
  'deduction',
] as const;

export type PuzzleTypeId = (typeof PUZZLE_TYPE_CYCLE)[number];

const EPOCH_ISO = '2025-01-01';

function daysSinceEpoch(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const epoch = new Date(EPOCH_ISO);
  const ms = date.getTime() - epoch.getTime();
  return Math.floor(ms / 86400000);
}

/**
 * Returns the puzzle type for the given date (YYYY-MM-DD).
 * Deterministic: same date always returns the same type.
 */
export function getPuzzleTypeForDate(iso: string): PuzzleTypeId {
  const days = daysSinceEpoch(iso);
  const index = ((days % PUZZLE_TYPE_CYCLE.length) + PUZZLE_TYPE_CYCLE.length) % PUZZLE_TYPE_CYCLE.length;
  return PUZZLE_TYPE_CYCLE[index];
}
