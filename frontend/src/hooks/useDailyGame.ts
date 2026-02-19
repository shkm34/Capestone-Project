import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTodayIsoDate } from '../utils/dateUtils';
import { getPuzzleTypeForDate } from '../utils/puzzleCycle';
import { getPuzzleModule, type DailyPuzzle } from '../game/puzzleRegistry';
import { markDaySolved, markHintUsed } from '../store/slices/progressSlice';
import { submitOrEnqueueScore } from '../store/thunks/syncThunks';
import { addToast } from '../store/slices/toastSlice';
import type { AppDispatch, RootState } from '../store';

export const useDailyGame = () => {
  const dispatch = useDispatch<AppDispatch>();
  const progress = useSelector((state: RootState) => state.progress);
  const todayIso = getTodayIsoDate();
  const puzzleType = getPuzzleTypeForDate(todayIso);
  const todayMeta = progress.completedByDate[todayIso];
  const module = getPuzzleModule(puzzleType);

  const [puzzle, setPuzzle] = useState<DailyPuzzle | null>(null);
  const [input, setInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [hintText, setHintText] = useState<string | null>(null);

  const hasSolvedToday = todayMeta?.solved ?? false;
  const hasUsedHintToday = todayMeta?.usedHint ?? false;
  const streak = progress.streak;

  useEffect(() => {
    setPuzzle(module.generate(todayIso) as DailyPuzzle);
    setInput('');
    setIsCorrect(null);
    setScore(null);
    setHintText(null);
  }, [todayIso, puzzleType, module]);

  const displayText = useMemo(
    () => (puzzle ? module.getDisplay(puzzle) : ''),
    [puzzle, module]
  );

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
    timeTakenMs?: number,
  ) => {
    event.preventDefault();
    if (!puzzle) return;

    const numericGuess = Number(input);
    if (Number.isNaN(numericGuess)) {
      setIsCorrect(false);
      setScore(0);
      return;
    }

    const correct = module.validate(puzzle, numericGuess);
    setIsCorrect(correct);

    const baseScore = 10;
    const finalScore = correct ? (hasUsedHintToday ? 6 : baseScore) : 0;
    setScore(finalScore);

    if (correct) {
      dispatch(
        addToast({
          message:
            finalScore === baseScore
              ? 'Correct! +10 points.'
              : 'Correct (with hint)! +6 points.',
          kind: 'success',
        }),
      );
      dispatch(markDaySolved({ date: todayIso, usedHint: hasUsedHintToday }));
      dispatch(
        submitOrEnqueueScore({
          date: todayIso,
          puzzleId: puzzleType,
          score: finalScore,
          timeTakenMs,
        }),
      );
    } else {
      dispatch(
        addToast({
          message: 'Not quite, try again!',
          kind: 'info',
        }),
      );
    }
  };

  const handleShowHint = () => {
    if (hasUsedHintToday || !puzzle) return;
    setHintText(module.getHint(puzzle));
    dispatch(markHintUsed({ date: todayIso }));
    dispatch(
      addToast({
        message: 'Hint used – fewer points available today.',
        kind: 'info',
      }),
    );
  };

  const isLoading = !puzzle;

  return {
    isLoading,
    puzzleType,
    puzzle,
    displayText,
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
