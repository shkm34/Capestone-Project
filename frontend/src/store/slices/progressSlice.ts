import { createSlice } from '@reduxjs/toolkit';
import { computeStreak } from '../../utils/streakUtils';

export interface DayMeta {
  solved: boolean;
  usedHint: boolean;
}

export interface ProgressState {
  completedByDate: Record<string, DayMeta>;
  streak: number;
}

const initialState: ProgressState = {
  completedByDate: {},
  streak: 0,
};

function nextStreak(completedByDate: Record<string, DayMeta>): number {
  return computeStreak(completedByDate);
}

export const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    markDaySolved: (
      state,
      action: { payload: { date: string; usedHint: boolean } }
    ) => {
      const { date, usedHint } = action.payload;
      state.completedByDate[date] = {
        solved: true,
        usedHint: state.completedByDate[date]?.usedHint ?? usedHint,
      };
      state.streak = nextStreak(state.completedByDate);
    },
    markHintUsed: (state, action: { payload: { date: string } }) => {
      const date = action.payload.date;
      const existing = state.completedByDate[date];
      state.completedByDate[date] = {
        solved: existing?.solved ?? false,
        usedHint: true,
      };
    },
    rehydrateProgress: (_, action: { payload: ProgressState }) => {
      const p = action.payload;
      return {
        completedByDate: p.completedByDate ?? {},
        streak: p.streak ?? nextStreak(p.completedByDate ?? {}),
      };
    },
  },
});

export const { markDaySolved, markHintUsed, rehydrateProgress } =
  progressSlice.actions;
