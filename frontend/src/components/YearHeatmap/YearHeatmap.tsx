import React from 'react';
import { HeatmapCell } from './HeatmapCell';
import { HeatmapTooltip } from './HeatmapTooltip';
import { DAY_LABELS, WEEK_WIDTH } from './constants';
import { useHeatmapTooltip } from './useHeatmapTooltip';
import { useYearHeatmapData } from './useYearHeatmapData';
import type { DayCell, HeatmapActivity, MonthRange, TooltipContent } from './types';

const TOOLTIP_OFFSET = 14;
const TOOLTIP_MAX_LEFT = 220;
const TOOLTIP_MAX_TOP = 100;

function clampTooltipPosition(x: number, y: number) {
  if (typeof window === 'undefined') return { left: x + TOOLTIP_OFFSET, top: y + TOOLTIP_OFFSET };
  return {
    left: Math.min(x + TOOLTIP_OFFSET, window.innerWidth - TOOLTIP_MAX_LEFT),
    top: Math.min(y + TOOLTIP_OFFSET, window.innerHeight - TOOLTIP_MAX_TOP),
  };
}

interface YearHeatmapProps {
  activity: HeatmapActivity[];
}

/**
 * Activity heatmap for the last 365 days.
 * Month labels on x-axis (top), day labels on y-axis (left). No future weeks. Hover tooltip.
 */
export const YearHeatmap: React.FC<YearHeatmapProps> = ({ activity }) => {
  const { grid, monthRanges } = useYearHeatmapData(activity);
  const { tooltipContent, tooltipPosition, handleHover, clear } = useHeatmapTooltip();

  const tooltipStyle = tooltipContent
    ? clampTooltipPosition(tooltipPosition.x, tooltipPosition.y)
    : null;

  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <div
        className="relative inline-flex flex-col gap-[2px] py-1 max-w-full"
        onMouseLeave={clear}
      >
        <MonthLabelRow monthRanges={monthRanges} />
        <GridWithDayLabels grid={grid} onHover={handleHover} />
      </div>

      {tooltipContent && tooltipStyle && (
        <div className="fixed z-50" style={{ left: tooltipStyle.left, top: tooltipStyle.top }}>
          <HeatmapTooltip content={tooltipContent} />
        </div>
      )}

      <p className="text-[10px] text-slate-500 mt-2">Last 365 days</p>
    </div>
  );
};

function MonthLabelRow({ monthRanges }: { monthRanges: MonthRange[] }) {
  return (
    <div className="flex items-end gap-0 flex-nowrap w-fit mb-1">
      <div className="w-10 flex-shrink-0" aria-hidden />
      {monthRanges.map((range, i) => (
        <div
          key={`${range.label}-${i}`}
          className="flex-shrink-0 flex items-end justify-start pl-0.5"
          style={{ width: (range.endWeekIdx - range.startWeekIdx) * WEEK_WIDTH }}
        >
          <span className="text-[11px] font-medium text-slate-400 leading-none pb-0.5">
            {range.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function GridWithDayLabels({
  grid,
  onHover,
}: {
  grid: DayCell[][];
  onHover: (content: TooltipContent | null, e?: React.MouseEvent) => void;
}) {
  return (
    <>
      {grid.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className="flex gap-[2px] justify-start flex-nowrap w-fit items-center"
        >
          <div className="w-10 shrink-0 flex items-center justify-end pr-2">
            <span className="text-[10px] font-medium text-slate-400">{DAY_LABELS[rowIdx]}</span>
          </div>
          <div className="flex gap-[2px] flex-nowrap">
            {row.map((cell, colIdx) => (
              <HeatmapCell key={colIdx} cell={cell} onHover={onHover} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
