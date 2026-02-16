import type { PuzzleTypeId } from '../utils/puzzleCycle';
import {
  generateDailySequencePuzzle,
  validateSequenceAnswer,
  getSequenceHint,
  getSequenceDisplay,
  type SequencePuzzle,
} from './sequencePuzzle';
import {
  generateDailyPatternPuzzle,
  validatePatternAnswer,
  getPatternHint,
  getPatternDisplay,
  type PatternPuzzle,
} from './patternPuzzle';
import {
  generateDailyBinaryPuzzle,
  validateBinaryAnswer,
  getBinaryHint,
  getBinaryDisplay,
  type BinaryPuzzle,
} from './binaryPuzzle';
import {
  generateDailyDeductionPuzzle,
  validateDeductionAnswer,
  getDeductionHint,
  getDeductionDisplay,
  type DeductionPuzzle,
} from './deductionPuzzle';

export type DailyPuzzle =
  | SequencePuzzle
  | PatternPuzzle
  | BinaryPuzzle
  | DeductionPuzzle;

export interface PuzzleModule<P = DailyPuzzle> {
  generate: (dateIso: string) => P;
  validate: (puzzle: P, guess: number) => boolean;
  getHint: (puzzle: P) => string;
  getDisplay: (puzzle: P) => string;
}

const sequenceModule: PuzzleModule<SequencePuzzle> = {
  generate: generateDailySequencePuzzle,
  validate: validateSequenceAnswer,
  getHint: getSequenceHint,
  getDisplay: getSequenceDisplay,
};

const patternModule: PuzzleModule<PatternPuzzle> = {
  generate: generateDailyPatternPuzzle,
  validate: validatePatternAnswer,
  getHint: getPatternHint,
  getDisplay: getPatternDisplay,
};

const binaryModule: PuzzleModule<BinaryPuzzle> = {
  generate: generateDailyBinaryPuzzle,
  validate: validateBinaryAnswer,
  getHint: getBinaryHint,
  getDisplay: getBinaryDisplay,
};

const deductionModule: PuzzleModule<DeductionPuzzle> = {
  generate: generateDailyDeductionPuzzle,
  validate: validateDeductionAnswer,
  getHint: getDeductionHint,
  getDisplay: getDeductionDisplay,
};

export const PUZZLE_REGISTRY: Record<PuzzleTypeId, PuzzleModule<DailyPuzzle>> = {
  sequence: sequenceModule as PuzzleModule<DailyPuzzle>,
  pattern: patternModule as PuzzleModule<DailyPuzzle>,
  binary: binaryModule as PuzzleModule<DailyPuzzle>,
  deduction: deductionModule as PuzzleModule<DailyPuzzle>,
};

export function getPuzzleModule(type: PuzzleTypeId): PuzzleModule {
  return PUZZLE_REGISTRY[type];
}
