import React, { useCallback, useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { HintBanner } from '../components/HintBanner';
import { ResultBanner } from '../components/ResultBanner';
import { useDailyGame } from '../hooks/useDailyGame';
import { useAttemptTimer } from '../utils/timerUtils';

const PUZZLE_TYPE_LABELS: Record<string, string> = {
  sequence: "Sequence",
  pattern: "Pattern",
  binary: "Binary Logic",
  deduction: "Deduction",
};

export const PlayPage: React.FC = () => {
  const [attemptStarted, setAttemptStarted] = useState(false);
  const timer = useAttemptTimer();

  const {
    isLoading,
    puzzleType,
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
  } = useDailyGame();

  

  const onStartAttempt = useCallback(() => {
    setAttemptStarted(true);
    timer.start();
  }, [timer]);

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      handleSubmit(event, timer.elapsedSeconds * 1000);
      timer.stop();
    },
    [handleSubmit, timer]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-300">Loading today&apos;s puzzle…</p>
      </div>
    );
  }

  const showBlurOverlay = !hasSolvedToday && !attemptStarted;

  return (
    <div className="w-full max-w-xl space-y-6">
      <p className="text-xs text-amber-400">Debug: puzzleType = {puzzleType}</p>
      <AppHeader streak={streak} />

      <section className="rounded-2xl border border-[#3D3B40] bg-[#190482] bg-opacity-40 p-6 space-y-4 relative">
        {/* Timer: show once attempt started or after submit */}
        {(attemptStarted || hasSolvedToday) && (
          <div className="flex justify-end">
            <span
              className="text-sm font-mono text-[#DDF2FD] tabular-nums"
              aria-label="Time elapsed"
            >
              {timer.formatted}
            </span>
          </div>
        )}

        <h2 className="text-sm font-medium text-[#DDF2FD]">
          Today&apos;s {PUZZLE_TYPE_LABELS[puzzleType] ?? puzzleType}
        </h2>

        <div className={showBlurOverlay ? 'select-none blur-xs pointer-events-none' : ''}>
          <p className="text-lg font-semibold tracking-wide text-[#FFFFFF]">
            {displayText}
          </p>

          <p className="text-xs text-[#D9E2FF]">
            {puzzleType === 'sequence'
              ? <>The numbers follow a consistent pattern. Fill in the missing value represented by <span className="font-semibold text-[#F05537]">?</span>.</>
              : 'Enter your answer below.'}
          </p>

          <form className="space-y-3" onSubmit={onSubmit}>
            <label className="block text-xs font-medium text-[#D9E2FF]">
              Your answer
              <input
                type="number"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[#3D3B40] bg-[#222222] px-3 py-2 text-sm text-[#F6F5F5] outline-none focus:border-[#414BEA] focus:ring-1 focus:ring-[#414BEA]"
                placeholder="Enter the missing number"
                disabled={hasSolvedToday}
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={hasSolvedToday}
                className="inline-flex items-center justify-center rounded-lg bg-[#414BEA] px-4 py-2 text-xs font-semibold text-white hover:bg-[#525CEB] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {hasSolvedToday ? 'Already solved today' : 'Check answer'}
              </button>

              <button
                type="button"
                onClick={handleShowHint}
                disabled={hasUsedHintToday}
                className="inline-flex items-center justify-center rounded-lg border border-[#F05537] px-3 py-2 text-[11px] font-medium text-[#F05537] hover:bg-[#F05537] hover:text-[#222222] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {hasUsedHintToday ? 'Hint used' : 'Use daily hint'}
              </button>
            </div>
          </form>
        </div>

        {/* Blur overlay: Start attempt button */}
        {showBlurOverlay && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#190482]/60"
            aria-hidden
          >
            <button
              type="button"
              onClick={onStartAttempt}
              className="rounded-lg bg-[#414BEA] px-6 py-3 text-sm font-semibold text-white hover:bg-[#525CEB] transition-colors shadow-lg"
            >
              Start attempt
            </button>
          </div>
        )}

        <HintBanner hintText={hintText} />
        <ResultBanner
          isCorrect={isCorrect}
          score={score}
          usedHint={hasUsedHintToday}
        />
      </section>
    </div>
  );
};
