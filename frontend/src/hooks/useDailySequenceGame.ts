import { useEffect, useMemo, useState } from 'react';
import {
  generateDailySequencePuzzle,
  validateSequenceAnswer,
  type SequencePuzzle,
} from '../game/sequencePuzzle';
import { getTodayIsoDate } from '../utils/dateUtils';
import { computeStreak } from '../utils/streakUtils';
import { loadDailyMeta, saveDailyMeta, type DailyMeta } from '../state/dailyMeta';

export const useDailySequenceGame = () => {
  const [puzzle, setPuzzle] = useState<SequencePuzzle | null>(null);
  const [input, setInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [hasSolvedToday, setHasSolvedToday] = useState(false);
  const [hasUsedHintToday, setHasUsedHintToday] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const dailyPuzzle = generateDailySequencePuzzle(new Date());
    setPuzzle(dailyPuzzle);

    const storedMeta = loadDailyMeta();
    const todayIso = getTodayIsoDate();
    const todayMeta = storedMeta[todayIso];

    if (todayMeta) {
      setHasSolvedToday(todayMeta.solved);
      setHasUsedHintToday(todayMeta.usedHint);
    }

    setStreak(computeStreak(storedMeta));
  }, []);

  const visibleSequence = useMemo(
    () =>
      puzzle
        ? puzzle.sequence.map((value, index) =>
            index === puzzle.missingIndex ? '?' : value,
          )
        : [],
    [puzzle],
  );

  const todayIso = getTodayIsoDate();

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

    const meta = loadDailyMeta();
    const todayMeta: DailyMeta = {
      solved: correct ? true : meta[todayIso]?.solved ?? false,
      usedHint: hasUsedHintToday,
    };
    meta[todayIso] = todayMeta;
    saveDailyMeta(meta);

    setHasSolvedToday(todayMeta.solved);
    setStreak(computeStreak(meta));
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

    const meta = loadDailyMeta();
    const existing = meta[todayIso] ?? { solved: false, usedHint: false };
    const updated: DailyMeta = { ...existing, usedHint: true };
    meta[todayIso] = updated;
    saveDailyMeta(meta);

    setHasUsedHintToday(true);
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

