import { useMemo } from 'react';
import { startOfDay } from '../../utils/dateUtils';
import { buildYearGrid, getMonthRanges } from './heatmapGridUtils';
import type { HeatmapActivity } from './types';

export function useYearHeatmapData(activity: HeatmapActivity[]) {
  const today = useMemo(() => startOfDay(new Date()), []);

  const activityByDate = useMemo(() => {
    const map = new Map<string, HeatmapActivity>();
    for (const a of activity) map.set(a.date, a);
    return map;
  }, [activity]);

  const { grid, weekCount, startMonday } = useMemo(
    () => buildYearGrid(today, activityByDate),
    [today, activityByDate],
  );

  const monthRanges = useMemo(
    () => getMonthRanges(weekCount, startMonday),
    [weekCount, startMonday],
  );

  return { grid, weekCount, startMonday, monthRanges };
}
