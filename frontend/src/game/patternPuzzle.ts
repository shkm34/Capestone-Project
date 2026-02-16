// Stub for daily Pattern puzzle. Deterministic from date; same date → same puzzle.

import { seedFromIsoDate } from './puzzleSeed';

export interface PatternPuzzle {
  answer: number;
  questionText: string;
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
