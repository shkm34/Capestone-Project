import React from 'react';

interface AppHeaderProps {
  streak: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ streak }) => {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-left">
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

