/** Activity intensity for heatmap cell (0 = none, 1–4 = increasing). */
export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

/** Per-day activity entry for the heatmap. */
export interface HeatmapActivity {
  date: string;
  level: ActivityLevel;
  score?: number | null;
  timeTakenMs?: number | null;
}

/** Internal cell data for one day in the grid. */
export interface DayCell {
  date: Date | null;
  iso: string | null;
  level: ActivityLevel;
  score: number | null;
  timeTakenMs: number | null;
}

/** Content shown in the hover tooltip. */
export interface TooltipContent {
  date: string;
  level: ActivityLevel;
  score: number | null;
  timeTakenMs: number | null;
}

export interface MonthRange {
  label: string;
  startWeekIdx: number;
  endWeekIdx: number;
}

export interface YearGridResult {
  grid: DayCell[][];
  weekCount: number;
  startMonday: Date;
}
