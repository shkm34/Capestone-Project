import React, { useCallback } from 'react';
import { ACTIVITY_LEVEL_CLASSES } from './constants';
import type { DayCell, TooltipContent } from './types';

interface HeatmapCellProps {
  cell: DayCell;
  onHover: (content: TooltipContent | null, e?: React.MouseEvent) => void;
}

export const HeatmapCell: React.FC<HeatmapCellProps> = React.memo(({ cell, onHover }) => {
  const handleEnter = useCallback(
    (e: React.MouseEvent) => {
      if (!cell.iso) return;
      onHover(
        {
          date: cell.iso,
          level: cell.level,
          score: cell.score,
          timeTakenMs: cell.timeTakenMs,
        },
        e,
      );
    },
    [cell.iso, cell.level, cell.score, cell.timeTakenMs, onHover],
  );

  const handleLeave = useCallback(() => onHover(null), [onHover]);

  if (!cell.date || !cell.iso) {
    return (
      <div
        className="w-2 h-2 rounded-sm bg-slate-800/50 flex-shrink-0"
        onMouseEnter={() => onHover(null)}
      />
    );
  }

  const cls = ACTIVITY_LEVEL_CLASSES[cell.level];
  return (
    <div
      className={`w-2 h-2 rounded-sm ${cls} cursor-default flex-shrink-0 hover:ring-2 hover:ring-slate-400 hover:ring-offset-1 hover:ring-offset-slate-900`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    />
  );
});
