import React, { useMemo } from 'react';

export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapActivity {
  date: string; // YYYY-MM-DD
  level: ActivityLevel;
  score?: number | null;
  timeTakenMs?: number | null;
}

interface DayCell {
  date: Date | null;
  iso: string | null;
  level: ActivityLevel;
  score: number | null;
  timeTakenMs: number | null;
}

interface WeekColumn {
  days: DayCell[]; // length 7 (Mon..Sun)
}

interface MonthBlock {
  label: string;
  weeks: WeekColumn[];
}

/** Format Date → YYYY-MM-DD in local time. */
function toLocalIso(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Zero out time; stick to local calendar. */
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** First day of month, n months ago (0 = this month, 1 = last, 2 = month before last). */
function firstDayOfMonthOffset(today: Date, monthsAgo: number): Date {
  const d = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 1);
  return startOfDay(d);
}

function buildThreeMonthBlocks(
  today: Date,
  activityByDate: Map<string, HeatmapActivity>,
): MonthBlock[] {
  const monthStarts = [
    firstDayOfMonthOffset(today, 2), // left: month before last
    firstDayOfMonthOffset(today, 1), // middle: last month
    firstDayOfMonthOffset(today, 0), // right: current month
  ];

  const blocks: MonthBlock[] = [];

  for (let i = 0; i < monthStarts.length; i += 1) {
    const start = monthStarts[i];
    const monthIndex = start.getMonth();
    const year = start.getFullYear();

    const end =
      i === 2
        ? today // current month → only up to today
        : new Date(year, monthIndex + 1, 0); // full month (last day)

    const label = start.toLocaleString(undefined, { month: 'short' });

    const days: Date[] = [];
    let cursor = startOfDay(start);
    while (cursor <= end) {
      days.push(cursor);
      cursor = startOfDay(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1));
    }

    // Align to Monday-start weeks; prepend empty cells if needed
    const firstDay = days[0];
    const weekday = (firstDay.getDay() + 6) % 7; // JS 0=Sun → 0=Mon
    const paddedDays: (Date | null)[] = [];
    for (let j = 0; j < weekday; j += 1) paddedDays.push(null);
    paddedDays.push(...days);

    const weeks: WeekColumn[] = [];
    for (let idx = 0; idx < paddedDays.length; idx += 7) {
      const slice = paddedDays.slice(idx, idx + 7);
      const daysInWeek: DayCell[] = [];
      for (let k = 0; k < 7; k += 1) {
        const date = slice[k] ?? null;
        const iso = date ? toLocalIso(date) : null;
        const activity = iso ? activityByDate.get(iso) : undefined;
        const level = activity?.level ?? 0;
        const score = activity?.score ?? null;
        const timeTakenMs = activity?.timeTakenMs ?? null;
        daysInWeek.push({ date, iso, level, score, timeTakenMs });
      }
      weeks.push({ days: daysInWeek });
    }

    blocks.push({ label, weeks });
  }

  return blocks;
}

const intensityClasses: Record<ActivityLevel, string> = {
  0: 'bg-slate-800', // not played
  1: 'bg-emerald-200',
  2: 'bg-emerald-400',
  3: 'bg-emerald-600',
  4: 'bg-emerald-800',
};

interface HeatmapCellProps {
  cell: DayCell;
}

const HeatmapCell: React.FC<HeatmapCellProps> = React.memo(({ cell }) => {
  if (!cell.date || !cell.iso) {
    return <div className="w-3 h-3 rounded-[3px] bg-transparent" />;
  }

  const cls = intensityClasses[cell.level];

  let title = cell.iso;
  if (cell.level === 0) {
    title = `${cell.iso} · no activity`;
  } else {
    const parts: string[] = [];
    parts.push(`level ${cell.level}`);
    if (typeof cell.score === 'number') {
      parts.push(`score ${cell.score}`);
    }
    if (typeof cell.timeTakenMs === 'number') {
      const seconds = Math.round(cell.timeTakenMs / 1000);
      parts.push(`${seconds}s`);
    }
    title = `${cell.iso} · ${parts.join(' · ')}`;
  }

  return (
    <div
      className={`w-3 h-3 rounded-[3px] ${cls} cursor-default`}
      title={title}
    />
  );
});

interface ThreeMonthHeatmapProps {
  /** Per-day activity; caller derives this from Redux (progress + scores). */
  activity: HeatmapActivity[];
}

/**
 * GitHub-style heatmap for the last 3 months:
 * - Left: month before last
 * - Middle: last month
 * - Right: current month (up to today)
 */
export const ThreeMonthHeatmap: React.FC<ThreeMonthHeatmapProps> = ({ activity }) => {
  const today = startOfDay(new Date());

  const activityByDate = useMemo(() => {
    const map = new Map<string, HeatmapActivity>();
    for (const a of activity) {
      map.set(a.date, a);
    }
    return map;
  }, [activity]);

  const blocks = useMemo(
    () => buildThreeMonthBlocks(today, activityByDate),
    [today, activityByDate],
  );

  return (
    <div className="flex gap-4">
      {blocks.map((block, blockIdx) => (
        <div key={blockIdx} className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-medium text-[#BFCFE7]">{block.label}</span>
          <div className="flex gap-[3px]">
            {block.weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[3px]">
                {week.days.map((day, dayIdx) => (
                  <HeatmapCell key={dayIdx} cell={day} />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

