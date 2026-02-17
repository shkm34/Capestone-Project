import { createSlice } from '@reduxjs/toolkit';

export interface PendingScore {
  date: string;
  puzzleId: string;
  score: number;
  timeTakenMs?: number;
  streak: number;
}

export interface SyncState {
  pendingScores: PendingScore[];
  lastSyncAt: string | null;
}

const initialState: SyncState = {
  pendingScores: [],
  lastSyncAt: null,
};

export const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    enqueueScore: (state, action: { payload: PendingScore }) => {
      state.pendingScores.push(action.payload);
    },
    clearPendingScores: (state) => {
      state.pendingScores = [];
      state.lastSyncAt = new Date().toISOString();
    },
    removePendingAtIndex: (state, action: { payload: number }) => {
      state.pendingScores.splice(action.payload, 1);
    },
    rehydrateSync: (_, action: { payload: SyncState }) => action.payload,
  },
});

export const { enqueueScore, clearPendingScores, removePendingAtIndex, rehydrateSync } =
  syncSlice.actions;
