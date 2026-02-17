import { createSlice } from '@reduxjs/toolkit';
import type { UserProfile } from '../../services/api';

export interface UserProfileState {
  user: UserProfile | null;
  lastFetchedAt: string | null;
  fetchError: string | null;
}

const initialState: UserProfileState = {
  user: null,
  lastFetchedAt: null,
  fetchError: null,
};

export const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    setUserProfile: (state, action: { payload: UserProfile }) => {
      state.user = action.payload;
      state.lastFetchedAt = new Date().toISOString();
      state.fetchError = null;
    },
    setProfileFetchError: (state, action: { payload: string }) => {
      state.fetchError = action.payload;
    },
    clearUserProfile: () => initialState,
    rehydrateUserProfile: (state, action: { payload: Pick<UserProfileState, 'user' | 'lastFetchedAt'> }) => {
      const p = action.payload;
      state.user = p.user ?? null;
      state.lastFetchedAt = p.lastFetchedAt ?? null;
      state.fetchError = null;
    },
  },
});

export const { setUserProfile, setProfileFetchError, clearUserProfile, rehydrateUserProfile } = userProfileSlice.actions;
