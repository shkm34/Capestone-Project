// Stub for daily Pattern puzzle. Deterministic from date; same date → same puzzle.

export interface PatternPuzzle {
  answer: number;
  questionText: string;
}

function seedFromIsoDate(iso: string): number {
  let hash = 0;
  for (let i = 0; i < iso.length; i += 1) {
    hash = (hash * 31 + iso.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function generateDailyPatternPuzzle(dateIso: string): PatternPuzzle {
  const seed = seedFromIsoDate(dateIso);
  const answer = 2 + (seed % 8); // 2..9
  const questionText = 'What number completes the pattern? (Stub — enter a number to try.)';
  return { answer, questionText };
}

export function validatePatternAnswer(puzzle: PatternPuzzle, guess: number): boolean {
  return guess === puzzle.answer;
}

export function getPatternHint(_puzzle: PatternPuzzle): string {
  return 'Look for repeating or alternating elements in the pattern.';
}

export function getPatternDisplay(puzzle: PatternPuzzle): string {
  return puzzle.questionText;
}
