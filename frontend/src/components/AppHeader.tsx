import React from 'react';

interface AppHeaderProps {
  streak: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ streak }) => {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#FFFFFF]">
          Logic Looper
        </h1>
        <p className="text-xs text-[#D9E2FF]">
          Daily Sequence Solver &mdash; Bluestock-inspired branding.
        </p>
      </div>
      <div className="text-right">
        <p className="text-[11px] uppercase tracking-wide text-[#BFCFE7]">
          Current streak
        </p>
        <p className="text-lg font-semibold text-[#F05537]">
          {streak} day{streak === 1 ? '' : 's'}
        </p>
      </div>
    </header>
  );
};

