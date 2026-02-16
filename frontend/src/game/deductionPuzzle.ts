// Stub for daily Deduction puzzle. Deterministic from date; same date → same puzzle.

import { seedFromIsoDate } from './puzzleSeed';

export interface DeductionPuzzle {
  answer: number;
  questionText: string;
}

export function generateDailyDeductionPuzzle(dateIso: string): DeductionPuzzle {
  const seed = seedFromIsoDate(dateIso);
  const answer = 1 + (seed % 10); // 1..10
  const questionText = 'Deduce the missing value from the clues. (Stub puzzle.)';
  return { answer, questionText };
}

export function validateDeductionAnswer(puzzle: DeductionPuzzle, guess: number): boolean {
  return guess === puzzle.answer;
}

export function getDeductionHint(_puzzle: DeductionPuzzle): string {
  return 'Eliminate possibilities that contradict the given clues.';
}

export function getDeductionDisplay(puzzle: DeductionPuzzle): string {
  return puzzle.questionText;
}
