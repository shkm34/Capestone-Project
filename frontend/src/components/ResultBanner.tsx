import React from 'react';

interface ResultBannerProps {
  isCorrect: boolean | null;
  score: number | null;
  usedHint: boolean;
}

export const ResultBanner: React.FC<ResultBannerProps> = ({
  isCorrect,
  score,
  usedHint,
}) => {
  if (isCorrect === null || score === null) return null;

  const baseClasses =
    'mt-2 rounded-lg border px-3 py-2 text-xs flex flex-col gap-1';

  const variantClasses = isCorrect
    ? 'border-emerald-500/70 bg-emerald-500/10 text-emerald-200'
    : 'border-rose-500/70 bg-rose-500/10 text-rose-200';

  return (
    <div className={`${baseClasses} ${variantClasses}`}>
      <p className="font-medium">{isCorrect ? 'Correct!' : 'Not quite.'}</p>
      <p>
        Score for this attempt:{' '}
        <span className="font-semibold">{score}</span>
        {usedHint && isCorrect && (
          <span className="ml-1 opacity-80">(reduced for using a hint)</span>
        )}
      </p>
    </div>
  );
};

