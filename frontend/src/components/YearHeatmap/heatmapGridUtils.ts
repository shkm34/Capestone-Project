import { getLocalIsoDate, startOfDay } from '../../utils/dateUtils';
import { DAYS_IN_YEAR } from './constants';
import type { DayCell, HeatmapActivity, MonthRange, YearGridResult } from './types';

const MS_PER_DAY = 86400000;
const DAYS_PER_WEEK = 7;

/** Monday of the week containing d (local, Mon = start of week). */
function getMonday(d: Date): Date {
  const day = (d.getDay() + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - day);
  return startOfDay(monday);
}

const EMPTY_CELL: DayCell = {
  date: null,
  iso: null,
  level: 0,
  score: null,
  timeTakenMs: null,
};

/**
 * Build the year grid: 7 rows (Mon–Sun) × weekCount columns.
 * Only weeks up to and including today. Only days in [today-364, today] have data.
 */
export function buildYearGrid(
  today: Date,
  activityByDate: Map<string, HeatmapActivity>,
): YearGridResult {
  const end = startOfDay(today);
  const start = new Date(end);
  start.setDate(start.getDate() - (DAYS_IN_YEAR - 1));
  const startMonday = getMonday(start);
  const endMonday = getMonday(end);
  const weekCount =
    Math.floor((endMonday.getTime() - startMonday.getTime()) / (DAYS_PER_WEEK * MS_PER_DAY)) + 1;

  const grid: DayCell[][] = [];
  for (let dayOfWeek = 0; dayOfWeek < DAYS_PER_WEEK; dayOfWeek++) {
    const row: DayCell[] = [];
    for (let weekIdx = 0; weekIdx < weekCount; weekIdx++) {
      const cellDate = new Date(startMonday);
      cellDate.setDate(cellDate.getDate() + weekIdx * DAYS_PER_WEEK + dayOfWeek);
      const cellDateStart = startOfDay(cellDate);
      if (cellDateStart < start || cellDateStart > end) {
        row.push(EMPTY_CELL);
        continue;
      }
      const iso = getLocalIsoDate(cellDateStart);
      const activity = activityByDate.get(iso);
      row.push({
        date: cellDateStart,
        iso,
        level: activity?.level ?? 0,
        score: activity?.score ?? null,
        timeTakenMs: activity?.timeTakenMs ?? null,
      });
    }
    grid.push(row);
  }
  return { grid, weekCount, startMonday };
}

/** Compute month ranges for x-axis labels (startWeekIdx, endWeekIdx per month). */
export function getMonthRanges(
  weekCount: number,
  startMonday: Date,
): MonthRange[] {
  const ranges: MonthRange[] = [];
  let startIdx = 0;
  let lastMonth = startMonday.getMonth();
  const year = startMonday.getFullYear();

  for (let weekIdx = 1; weekIdx <= weekCount; weekIdx++) {
    const weekStart = new Date(startMonday);
    weekStart.setDate(weekStart.getDate() + weekIdx * DAYS_PER_WEEK);
    const month = weekStart.getMonth();
    if (month !== lastMonth) {
      ranges.push({
        label: new Date(year, lastMonth, 1).toLocaleString(undefined, { month: 'short' }),
        startWeekIdx: startIdx,
        endWeekIdx: weekIdx,
      });
      startIdx = weekIdx;
      lastMonth = month;
    }
  }
  ranges.push({
    label: new Date(year, lastMonth, 1).toLocaleString(undefined, { month: 'short' }),
    startWeekIdx: startIdx,
    endWeekIdx: weekCount,
  });
  return ranges;
}
