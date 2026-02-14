// Core types and logic for the \"Sequence Solver\" daily puzzle.
// This is intentionally self-contained and deterministic so that:
// - The same date always yields the same puzzle.
// - All validation happens purely on the client.

export interface SequencePuzzle {
  sequence: number[]; // full underlying sequence
  missingIndex: number; // which index is hidden from the user
  answer: number; // correct value at missingIndex
}

// Very small deterministic pseudo-random generator from a date string.
// In a later iteration we can swap this for Crypto-js based hashing,
// but for now this keeps the concept simple and dependency-free.
function seedFromDate(date: Date): number {
  const iso = date.toISOString().slice(0, 10); // YYYY-MM-DD
  let hash = 0;
  for (let i = 0; i < iso.length; i += 1) {
    hash = (hash * 31 + iso.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Generate a simple arithmetic progression puzzle like:
// 2, 5, 8, ?, 14
export function generateDailySequencePuzzle(date: Date): SequencePuzzle {
  const seed = seedFromDate(date);

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
  const isCorrect = guess === puzzle.answer;
  return isCorrect;
}

