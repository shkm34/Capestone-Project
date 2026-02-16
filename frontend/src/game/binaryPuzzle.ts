// Stub for daily Binary Logic puzzle. Deterministic from date; same date → same puzzle.

import { seedFromIsoDate } from './puzzleSeed';

export interface BinaryPuzzle {
  answer: number;
  questionText: string;
}

export function generateDailyBinaryPuzzle(dateIso: string): BinaryPuzzle {
  const seed = seedFromIsoDate(dateIso);
  const answer = (seed % 2) as 0 | 1; // 0 or 1
  const questionText = 'Binary logic: What is the result? Enter 0 or 1. (Stub puzzle.)';
  return { answer, questionText };
}

export function validateBinaryAnswer(puzzle: BinaryPuzzle, guess: number): boolean {
  return guess === puzzle.answer;
}

export function getBinaryHint(_puzzle: BinaryPuzzle): string {
  return 'Consider true/false or 0/1 outcomes from the given rules.';
}

export function getBinaryDisplay(puzzle: BinaryPuzzle): string {
  return puzzle.questionText;
}
