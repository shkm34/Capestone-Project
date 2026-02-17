// Core types and logic for the \"Sequence Solver\" daily puzzle.
// This is intentionally self-contained and deterministic so that:
// - The same date always yields the same puzzle.
// - All validation happens purely on the client.

export interface SequencePuzzle {
  sequence: number[]; // full underlying sequence
  missingIndex: number; // which index is hidden from the user
  answer: number; // correct value at missingIndex
}

function toLocalIso(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// Very small deterministic pseudo-random generator from a date string (YYYY-MM-DD).
// Uses the same date string as the app's "today" (local date) so puzzle and progress stay in sync.
function seedFromIsoDate(iso: string): number {
  let hash = 0;
  for (let i = 0; i < iso.length; i += 1) {
    hash = (hash * 31 + iso.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Generate a simple arithmetic progression puzzle like:
// 2, 5, 8, ?, 14
// dateIso: YYYY-MM-DD in local time (same as getTodayIsoDate() so the puzzle matches "today").
export function generateDailySequencePuzzle(dateOrIso: Date | string): SequencePuzzle {
  const iso = typeof dateOrIso === 'string' ? dateOrIso : toLocalIso(dateOrIso);
  const seed = seedFromIsoDate(iso);

  // Derive deterministic parameters from the seed.
  const base = 1 + (seed % 10); // 1..10
  const step = 1 + ((seed >> 3) % 7); // 1..7
  const length = 5; // keep it small and readable for MVP

  const sequence: number[] = [];
  for (let i = 0; i < length; i += 1) {
    sequence.push(base + i * step);
  }

  // Hide one position that is not the first or last to make it interesting.
  const missingIndex = 1 + ((seed >> 5) % (length - 2)); // 1..length-2

  return {
    sequence,
    missingIndex,
    answer: sequence[missingIndex],
  };
}

// Validate a user's guess.
// Scoring is handled at the UI layer so that it can
// also take hints, time taken, etc. into account.
export function validateSequenceAnswer(
  puzzle: SequencePuzzle,
  guess: number,
): boolean {
  return guess === puzzle.answer;
}

/** Hint text for the sequence puzzle (for registry API). */
export function getSequenceHint(puzzle: SequencePuzzle): string {
  if (puzzle.sequence.length >= 2) {
    const step = puzzle.sequence[1] - puzzle.sequence[0];
    return `Look at how much the sequence increases each time. The common difference here is ${step}.`;
  }
  return 'Look for a consistent numerical pattern between terms.';
}

/** Display string for UI: sequence with ? at missing index. */
export function getSequenceDisplay(puzzle: SequencePuzzle): string {
  return puzzle.sequence
    .map((value, index) => (index === puzzle.missingIndex ? '?' : String(value)))
    .join(', ');
}

