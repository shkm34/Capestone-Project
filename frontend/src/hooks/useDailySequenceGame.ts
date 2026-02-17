/**
 * Legacy hook: sequence-only daily game.
 * Play page now uses useDailyGame() which rotates puzzle type by date.
 * Kept for reference or direct use in sequence-only contexts.
 */
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  generateDailySequencePuzzle,
  validateSequenceAnswer,
  type SequencePuzzle,
} from '../game/sequencePuzzle';
import { getTodayIsoDate } from '../utils/dateUtils';
import { markDaySolved, markHintUsed } from '../store/slices/progressSlice';
import { submitOrEnqueueScore } from '../store/thunks/syncThunks';
import type { AppDispatch, RootState } from '../store';

export const useDailySequenceGame = () => {
  const dispatch = useDispatch<AppDispatch>();
  const progress = useSelector((state: RootState) => state.progress);
  const todayIso = getTodayIsoDate();
  const todayMeta = progress.completedByDate[todayIso];

  const [puzzle, setPuzzle] = useState<SequencePuzzle | null>(null);
  const [input, setInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [hintText, setHintText] = useState<string | null>(null);

  const hasSolvedToday = todayMeta?.solved ?? false;
  const hasUsedHintToday = todayMeta?.usedHint ?? false;
  const streak = progress.streak;

  // Regenerate puzzle when the calendar day changes; use todayIso so puzzle and progress use the same "today".
  useEffect(() => {
    setPuzzle(generateDailySequencePuzzle(todayIso));
    setInput('');
    setIsCorrect(null);
    setScore(null);
    setHintText(null);
  }, [todayIso]);

  const visibleSequence = useMemo(
    () =>
      puzzle
        ? puzzle.sequence.map((value, index) =>
            index === puzzle.missingIndex ? '?' : value,
          ) 
        : [],
    [puzzle],
  );

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (!puzzle) return;

    const numericGuess = Number(input);
    if (Number.isNaN(numericGuess)) {
      setIsCorrect(false);
      setScore(0);
      return;
    }

    const correct = validateSequenceAnswer(puzzle, numericGuess);
    setIsCorrect(correct);

    const baseScore = 10;
    const finalScore = correct ? (hasUsedHintToday ? 6 : baseScore) : 0;
    setScore(finalScore);

    if (correct) {
      dispatch(markDaySolved({ date: todayIso, usedHint: hasUsedHintToday }));
      dispatch(
        submitOrEnqueueScore({
          date: todayIso,
          puzzleId: 'sequence',
          score: finalScore,
        })
      );
    }
  };

  const handleShowHint = () => {
    if (hasUsedHintToday || !puzzle) return;

    if (puzzle.sequence.length >= 2) {
      const step = puzzle.sequence[1] - puzzle.sequence[0];
      setHintText(
        `Look at how much the sequence increases each time. The common difference here is ${step}.`,
      );
    } else {
      setHintText('Look for a consistent numerical pattern between terms.');
    }

    dispatch(markHintUsed({ date: todayIso }));
  };

  const isLoading = !puzzle;

  return {
    isLoading,
    puzzle,
    visibleSequence,
    input,
    setInput,
    isCorrect,
    score,
    hasSolvedToday,
    hasUsedHintToday,
    hintText,
    streak,
    handleSubmit,
    handleShowHint,
  };
};
