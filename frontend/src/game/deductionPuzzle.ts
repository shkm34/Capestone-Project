// Deterministic Einstein-style deduction puzzle with 3 entities, 3 categories, 3 clues.

import { seedFromIsoDate, createPrng, type Puzzle } from './puzzleSeed';

export interface DeductionQuestion {
  entities: string[];
  categories: {
    color: string[];
    pet: string[];
    drink: string[];
  };
  clues: string[];
  ask: string;
}

export type DeductionAnswer = string;

export type DeductionPuzzle = Puzzle<DeductionQuestion>;

type Assignment = { entity: string; color: string; pet: string; drink: string };

function shuffleDeterministic<T>(items: T[], nextInt: (n: number) => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = nextInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildDeductionPuzzle(seed: number): DeductionPuzzle {
  const prng = createPrng(seed);

  const baseEntities = ['Alice', 'Bob', 'Charlie'];
  const baseColors = ['Red', 'Blue', 'Green'];
  const basePets = ['Cat', 'Dog', 'Fish'];
  const baseDrinks = ['Tea', 'Coffee', 'Juice'];

  const entities = shuffleDeterministic(baseEntities, prng.nextInt);
  const colors = shuffleDeterministic(baseColors, prng.nextInt);
  const pets = shuffleDeterministic(basePets, prng.nextInt);
  const drinks = shuffleDeterministic(baseDrinks, prng.nextInt);

  const assignments: Assignment[] = entities.map((e, i) => ({
    entity: e,
    color: colors[i],
    pet: pets[i],
    drink: drinks[i],
  }));

  const targetIndex = prng.nextInt(assignments.length);
  const target = assignments[targetIndex];

  const a0 = assignments[0];
  const a1 = assignments[1];

  const clues: string[] = [
    `${a0.entity} does not own the ${a1.pet}.`,
    `The person who likes ${a1.color} owns the ${a0.pet}.`,
    `${a1.entity} drinks ${a1.drink}.`,
  ];

  const question: DeductionQuestion = {
    entities,
    categories: {
      color: colors,
      pet: pets,
      drink: drinks,
    },
    clues,
    ask: `Who owns the ${target.pet}? (Enter 1 for ${entities[0]}, 2 for ${entities[1]}, 3 for ${entities[2]})`,
  };

  const explanationLines: string[] = [
    `Using the deterministic assignment fixed by seed ${seed}:`,
    ...assignments.map(
      (a) => `- ${a.entity} likes ${a.color}, owns the ${a.pet}, and drinks ${a.drink}.`,
    ),
    `From this mapping, the owner of the ${target.pet} is ${target.entity}.`,
  ];

  return {
    type: 'deduction',
    seed,
    question,
    answer: target.entity,
    explanation: explanationLines.join('\n'),
  };
}

export function generateDailyDeductionPuzzle(dateIso: string): DeductionPuzzle {
  const seed = seedFromIsoDate(dateIso);
  return buildDeductionPuzzle(seed);
}

export function validateDeductionAnswer(puzzle: DeductionPuzzle, guess: number): boolean {
  const n = Number(guess);
  if (!Number.isFinite(n)) return false;
  const idx = Math.floor(n) - 1; // user enters 1,2,3
  const entities = puzzle.question.entities;
  if (idx < 0 || idx >= entities.length) return false;
  const chosen = entities[idx];
  return chosen === puzzle.answer;
}

export function getDeductionHint(_puzzle: DeductionPuzzle): string {
  return 'Use each clue to eliminate impossible person–color–pet–drink combinations until only one mapping fits.';
}

export function getDeductionDisplay(puzzle: DeductionPuzzle): string {
  const q = puzzle.question;
  const lines: string[] = [];

  lines.push('Entities:');
  for (const entity of q.entities) {
    lines.push(`- ${entity}`);
  }

  lines.push('');
  lines.push('Clues:');
  q.clues.forEach((clue, index) => {
    lines.push(`${index + 1}. ${clue}`);
  });

  lines.push('');
  lines.push(`Question: ${q.ask}`);

  // PlayPage renders this inside a whitespace-pre-line block,
  // so newlines will appear as separate lines.
  return lines.join('\n');
}

