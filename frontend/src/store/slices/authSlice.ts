import { createSlice } from '@reduxjs/toolkit';

export interface AuthState {
  userId: string | null;
  email: string | null;
  isGuest: boolean;
}

const initialState: AuthState = {
  userId: null,
  email: null,
  isGuest: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: { payload: { userId: string; email: string | null } }) => {
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.isGuest = false;
    },
    setGuest: (state, action: { payload: { userId: string } }) => {
      state.userId = action.payload.userId;
      state.email = null;
      state.isGuest = true;
    },
    signOut: () => initialState,
    rehydrateAuth: (_, action: { payload: AuthState }) => action.payload,
  },
});

export const { setUser, setGuest, signOut, rehydrateAuth } = authSlice.actions;
