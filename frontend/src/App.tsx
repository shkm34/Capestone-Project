import React, { useEffect, useState } from 'react';
import {
  generateDailySequencePuzzle,
  validateSequenceAnswer,
  type SequencePuzzle,
  type PuzzleValidationResult,
} from './game/sequencePuzzle';

// This component already represents a full \"vertical slice\":
// - It generates today's puzzle purely on the client.
// - It renders the puzzle UI.
// - It validates the user's answer and shows feedback + score.
const App: React.FC = () => {
  const [puzzle, setPuzzle] = useState<SequencePuzzle | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<PuzzleValidationResult | null>(null);

  // Generate today's puzzle once when the component mounts.
  useEffect(() => {
    const today = new Date();
    const dailyPuzzle = generateDailySequencePuzzle(today);
    setPuzzle(dailyPuzzle);
  }, []);

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-300">Loading today&apos;s puzzle…</p>
      </div>
    );
  }

  const visibleSequence = puzzle.sequence.map((value, index) =>
    index === puzzle.missingIndex ? '?' : value,
  );

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const numericGuess = Number(input);
    if (Number.isNaN(numericGuess)) {
      setResult({
        isCorrect: false,
        score: 0,
      });
      return;
    }

    const validation = validateSequenceAnswer(puzzle, numericGuess);
    setResult(validation);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Logic Looper
          </h1>
          <p className="text-slate-300 text-sm">
            Daily Sequence Solver &mdash; a small but complete slice of the
            full game.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-lg font-medium text-slate-100">
            Today&apos;s Sequence
          </h2>

          <p className="text-slate-200 text-xl font-semibold tracking-wide">
            {visibleSequence.join(', ')}
          </p>

          <p className="text-slate-400 text-sm">
            The numbers follow a consistent pattern. Fill in the missing value
            represented by <span className="font-semibold text-sky-400">?</span>
            .
          </p>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-200">
              Your answer
              <input
                type="number"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="Enter the missing number"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-colors"
            >
              Check answer
            </button>
          </form>

          {result && (
            <div
              className={`mt-2 rounded-lg border px-3 py-2 text-sm ${
                result.isCorrect
                  ? 'border-emerald-500/70 bg-emerald-500/10 text-emerald-200'
                  : 'border-rose-500/70 bg-rose-500/10 text-rose-200'
              }`}
            >
              <p className="font-medium">
                {result.isCorrect ? 'Correct!' : 'Not quite.'}
              </p>
              <p className="mt-1">
                Score for this attempt:{' '}
                <span className="font-semibold">{result.score}</span>
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default App;

