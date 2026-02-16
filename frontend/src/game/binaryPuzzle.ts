// Deterministic binary logic puzzle using AND / OR / XOR / NOT.

import { seedFromIsoDate, createPrng, type Puzzle } from './puzzleSeed';

export interface BinaryQuestion {
  inputs: { A: boolean; B: boolean; C?: boolean };
  expression: string;
}

export type BinaryAnswer = boolean;

export type BinaryPuzzle = Puzzle<BinaryQuestion>;

function evalExpression(
  exprId: number,
  inputs: { A: boolean; B: boolean; C?: boolean },
): { expression: string; value: boolean; explanation: string } {
  const { A, B, C } = inputs;

  switch (exprId) {
    case 0: {
      // A AND (NOT B)
      const notB = !B;
      const val = A && notB;
      const explanation = [
        `Inputs: A = ${A}, B = ${B}.`,
        `NOT B = ${notB}.`,
        `A AND (NOT B) = ${A} AND ${notB} = ${val}.`,
      ].join('\n');
      return { expression: 'A AND (NOT B)', value: val, explanation };
    }
    case 1: {
      // (A OR B) XOR C
      const orAB = A || B;
      const xor = !!C ? orAB !== C : orAB;
      const explanation = [
        `Inputs: A = ${A}, B = ${B}, C = ${C}.`,
        `A OR B = ${orAB}.`,
        `(A OR B) XOR C = ${orAB} XOR ${C} = ${xor}.`,
      ].join('\n');
      return { expression: '(A OR B) XOR C', value: xor, explanation };
    }
    case 2: {
      // (NOT A) OR (B AND C)
      const notA = !A;
      const andBC = !!C && B && C;
      const val = notA || andBC;
      const explanation = [
        `Inputs: A = ${A}, B = ${B}, C = ${C}.`,
        `NOT A = ${notA}.`,
        `B AND C = ${B} AND ${C} = ${andBC}.`,
        `(NOT A) OR (B AND C) = ${notA} OR ${andBC} = ${val}.`,
      ].join('\n');
      return { expression: '(NOT A) OR (B AND C)', value: val, explanation };
    }
    default: {
      // Fallback: A XOR B
      const val = A !== B;
      const explanation = [
        `Inputs: A = ${A}, B = ${B}.`,
        'A XOR B is true when exactly one of A or B is true.',
        `So A XOR B = ${val}.`,
      ].join('\n');
      return { expression: 'A XOR B', value: val, explanation };
    }
  }
}

function buildBinaryPuzzle(seed: number): BinaryPuzzle {
  const prng = createPrng(seed);

  const useThreeInputs = prng.nextBool();
  const inputs = {
    A: prng.nextBool(),
    B: prng.nextBool(),
    C: useThreeInputs ? prng.nextBool() : undefined,
  };

  const exprId = useThreeInputs ? 1 + prng.nextInt(2) : 0; // 0 for 2-input, 1 or 2 for 3-input
  const { expression, value, explanation } = evalExpression(exprId, inputs);

  const question: BinaryQuestion = {
    inputs,
    expression,
  };

  return {
    type: 'binary',
    seed,
    question,
    answer: value,
    explanation,
  };
}

export function generateDailyBinaryPuzzle(dateIso: string): BinaryPuzzle {
  const seed = seedFromIsoDate(dateIso);
  return buildBinaryPuzzle(seed);
}

export function validateBinaryAnswer(puzzle: BinaryPuzzle, guess: number): boolean {
  const boolGuess = guess === 1;
  return boolGuess === puzzle.answer;
}

export function getBinaryHint(_puzzle: BinaryPuzzle): string {
  return 'Evaluate NOT first, then AND/OR, then XOR. Work from the inside of parentheses outward.';
}

export function getBinaryDisplay(puzzle: BinaryPuzzle): string {
  const { inputs, expression } = puzzle.question;
  const inputsStr = Object.entries(inputs)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k} = ${v}`)
    .join(', ');
  return `${inputsStr}; expression: ${expression}`;
}

