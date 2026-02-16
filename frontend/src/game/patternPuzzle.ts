// Deterministic 3x3 numeric pattern puzzle with one missing cell.

import { seedFromIsoDate, createPrng, type Puzzle } from './puzzleSeed';

export interface PatternQuestion {
  grid: (number | null)[][];
  ruleHint: string;
}

export type PatternAnswer = number;

export type PatternPuzzle = Puzzle<PatternQuestion>;

function buildPatternPuzzle(seed: number): PatternPuzzle {
  const prng = createPrng(seed);

  const base = 1 + prng.nextInt(5);     // 1..5
  const rowStep = 1 + prng.nextInt(4);  // 1..4
  const colStep = 1 + prng.nextInt(4);  // 1..4

  const grid: number[][] = [];
  for (let r = 0; r < 3; r += 1) {
    const row: number[] = [];
    for (let c = 0; c < 3; c += 1) {
      row.push(base + r * rowStep + c * colStep);
    }
    grid.push(row);
  }

  const missingRow = 2;
  const missingCol = 2;
  const answer = grid[missingRow][missingCol];

  const displayGrid: (number | null)[][] = grid.map((row, ri) =>
    row.map((value, ci) => (ri === missingRow && ci === missingCol ? null : value)),
  );

  const ruleHint =
    'Each step to the right adds a constant amount, and each step down adds another constant amount.';

  const question: PatternQuestion = {
    grid: displayGrid,
    ruleHint,
  };

  const explanationLines: string[] = [
    `Let the top-left cell be base = ${base}.`,
    `Moving right adds colStep = ${colStep}, moving down adds rowStep = ${rowStep}.`,
    'So value(row, col) = base + row * rowStep + col * colStep (0-indexed).',
    `For the missing cell (row 2, col 2):`,
    `value = ${base} + 2 * ${rowStep} + 2 * ${colStep} = ${answer}.`,
  ];

  return {
    type: 'pattern',
    seed,
    question,
    answer,
    explanation: explanationLines.join('\n'),
  };
}

export function generateDailyPatternPuzzle(dateIso: string): PatternPuzzle {
  const seed = seedFromIsoDate(dateIso);
  return buildPatternPuzzle(seed);
}

export function validatePatternAnswer(puzzle: PatternPuzzle, guess: number): boolean {
  return Number(guess) === puzzle.answer;
}

export function getPatternHint(puzzle: PatternPuzzle): string {
  return puzzle.question.ruleHint;
}

export function getPatternDisplay(puzzle: PatternPuzzle): string {
  return puzzle.question.grid
    .map((row) => row.map((v) => (v == null ? '?' : v)).join(' '))
    .join(' | ');
}

