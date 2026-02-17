import React, { useMemo } from 'react';
import { AppHeader } from '../components/AppHeader';
import { HintBanner } from '../components/HintBanner';
import { ResultBanner } from '../components/ResultBanner';
import { useDailyGame } from '../hooks/useDailyGame';
import { usePlayAttempt } from '../hooks/usePlayAttempt';

const PUZZLE_TYPE_LABELS: Record<string, string> = {
  sequence: "Sequence",
  pattern: "Pattern",
  binary: "Binary Logic",
  deduction: "Deduction",
};

export const PlayPage: React.FC = () => {
  const {
    attemptStarted,
    timerFormatted,
    handleStartAttempt,
    createSubmitHandler,
  } = usePlayAttempt();

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

  

  const onSubmit = useMemo(
    () => createSubmitHandler(handleSubmit),
    [createSubmitHandler, handleSubmit],
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center px-4 py-4">
      <div className="w-full max-w-2xl space-y-4">
        <AppHeader streak={streak} />

        <section
          className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 shadow-xl space-y-4 transition-colors ${
            hasSolvedToday
              ? 'border-emerald-500/40 bg-linear-to-br from-emerald-950/30 via-slate-900 to-slate-950'
              : 'border-slate-800 bg-linear-to-br from-[#190482] via-slate-900 to-slate-950'
          }`}
        >
          {/* Already solved banner */}
          {hasSolvedToday && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/50 bg-emerald-500/15 px-4 py-3 sm:px-5 sm:py-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/30 border border-emerald-400/50">
                <svg
                  className="h-5 w-5 text-emerald-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-emerald-100">
                  Today&apos;s puzzle completed
                </p>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  You&apos;ve already solved this. Come back tomorrow for a new one.
                </p>
              </div>
            </div>
          )}

          {/* Header row: puzzle type + timer */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-slate-900/70 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-300 border border-slate-700/80">
                  Daily puzzle · {PUZZLE_TYPE_LABELS[puzzleType] ?? puzzleType}
                </span>
                {hasSolvedToday && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-medium text-emerald-300 border border-emerald-500/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Solved
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                Today&apos;s {PUZZLE_TYPE_LABELS[puzzleType] ?? puzzleType}
              </h2>
            </div>

            {(attemptStarted || hasSolvedToday) && (
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[11px] uppercase tracking-wide text-slate-400">
                  Time
                </span>
                <span
                  className="rounded-full bg-slate-900/70 px-3 py-1 text-sm font-mono text-[#DDF2FD] tabular-nums border border-slate-700/80"
                  aria-label="Time elapsed"
                >
                  {timerFormatted}
                </span>
              </div>
            )}
          </div>

          {/* Puzzle body */}
          <div
            className={
              showBlurOverlay ? 'select-none blur-xs pointer-events-none' : ''
            }
          >
            <div
              className={`rounded-2xl border px-3.5 py-3 sm:px-4 sm:py-3 space-y-1.5 ${
                hasSolvedToday
                  ? 'bg-emerald-950/30 border-emerald-800/40'
                  : 'bg-slate-900/60 border-slate-800/80'
              }`}
            >
              <p className="text-[11px] font-medium text-slate-300 uppercase tracking-wide">
                Puzzle
              </p>
              <p className="text-sm sm:text-base font-semibold tracking-wide text-white whitespace-pre-line">
                {displayText}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-300">
                {puzzleType === 'sequence'
                  ? (
                    <>
                      The numbers follow a consistent pattern. Fill in the missing value
                      represented by{' '}
                      <span className="font-semibold text-[#F05537]">?</span>.
                    </>
                    )
                  : 'Read the description carefully and enter your answer below.'}
              </p>
            </div>

            {/* Answer form */}
            <form className="mt-3 space-y-3" onSubmit={onSubmit}>
              <div className="space-y-1">
                <label className="block text-xs sm:text-[13px] font-medium text-slate-200">
                  Your answer
                </label>
                <input
                  type="number"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#525CEB] focus:ring-1 focus:ring-[#525CEB] placeholder:text-slate-500 transition-colors"
                  placeholder={
                    puzzleType === 'binary'
                      ? 'Enter 0 or 1'
                      : puzzleType === 'deduction'
                      ? 'Enter 1, 2, or 3'
                      : 'Enter the missing value'
                  }
                  disabled={hasSolvedToday}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="submit"
                  disabled={hasSolvedToday}
                  className={
                    hasSolvedToday
                      ? 'inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-xs sm:text-sm font-medium text-emerald-200 cursor-default'
                      : 'inline-flex items-center justify-center rounded-xl bg-[#414BEA] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#414BEA]/40 hover:bg-[#525CEB] disabled:opacity-60 disabled:cursor-not-allowed transition-colors'
                  }
                >
                  {hasSolvedToday ? (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    'Check answer'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShowHint}
                  disabled={hasUsedHintToday}
                  className="inline-flex items-center justify-center rounded-xl border border-[#F05537] px-3.5 py-2 text-[11px] sm:text-xs font-medium text-[#F05537] hover:bg-[#F05537] hover:text-slate-950 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {hasUsedHintToday ? 'Hint used' : 'Use daily hint'}
                </button>
              </div>
            </form>
          </div>

          {/* Blur overlay: Start attempt button */}
          {showBlurOverlay && (
            <div
              className="absolute inset-0 flex items-center justify-center rounded-3xl bg-slate-950/70 backdrop-blur-sm"
              aria-hidden
            >
              <button
                type="button"
                  onClick={handleStartAttempt}
                className="rounded-2xl bg-[#414BEA] px-6 py-2.5 text-sm sm:text-base font-semibold text-white hover:bg-[#525CEB] transition-colors shadow-xl"
              >
                Start today&apos;s attempt
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
            <HintBanner hintText={hintText} />
            <ResultBanner
              isCorrect={isCorrect}
              score={score}
              usedHint={hasUsedHintToday}
            />
          </div>
        </section>
      </div>
    </div>
  );
};
