import React from 'react';
import { AppHeader } from './components/AppHeader';
import { HintBanner } from './components/HintBanner';
import { ResultBanner } from './components/ResultBanner';
import { useDailySequenceGame } from './hooks/useDailySequenceGame';

const App: React.FC = () => {
  const {
    isLoading,
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
  } = useDailySequenceGame();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-300">Loading today&apos;s puzzle…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222222] text-[#F6F5F5] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl space-y-6">
        <AppHeader streak={streak} />

        <section className="rounded-2xl border border-[#3D3B40] bg-[#190482] bg-opacity-40 p-6 space-y-4">
          <h2 className="text-sm font-medium text-[#DDF2FD]">
            Today&apos;s Sequence
          </h2>

          <p className="text-lg font-semibold tracking-wide text-[#FFFFFF]">
            {visibleSequence.join(', ')}
          </p>

          <p className="text-xs text-[#D9E2FF]">
            The numbers follow a consistent pattern. Fill in the missing value
            represented by{' '}
            <span className="font-semibold text-[#F05537]">?</span>.
          </p>

          <form className="space-y-3" onSubmit={handleSubmit}>
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

          <HintBanner hintText={hintText} />
          <ResultBanner
            isCorrect={isCorrect}
            score={score}
            usedHint={hasUsedHintToday}
          />
        </section>
      </div>
    </div>
  );
};

export default App;

