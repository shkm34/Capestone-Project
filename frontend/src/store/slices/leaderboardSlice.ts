import { createSlice } from '@reduxjs/toolkit';
import type { LeaderboardResponse } from '../../services/api';

export interface LeaderboardState {
  data: LeaderboardResponse | null;
  lastFetchedAt: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: LeaderboardState = {
  data: null,
  lastFetchedAt: null,
  loading: false,
  error: null,
};

export const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    setLeaderboard: (
      state,
      action: { payload: { data: LeaderboardResponse; fetchedAt?: string | null } },
    ) => {
      state.data = action.payload.data;
      state.lastFetchedAt = action.payload.fetchedAt ?? new Date().toISOString();
      state.error = null;
    },
    setLeaderboardLoading: (state, action: { payload: boolean }) => {
      state.loading = action.payload;
    },
    setLeaderboardError: (state, action: { payload: string | null }) => {
      state.error = action.payload;
    },
    rehydrateLeaderboard: (state, action: { payload: LeaderboardState }) => {
      state.data = action.payload.data;
      state.lastFetchedAt = action.payload.lastFetchedAt;
      state.error = null;
      state.loading = false;
    },
    clearLeaderboard: () => initialState,
  },
});

export const {
  setLeaderboard,
  setLeaderboardLoading,
  setLeaderboardError,
  rehydrateLeaderboard,
  clearLeaderboard,
} = leaderboardSlice.actions;

