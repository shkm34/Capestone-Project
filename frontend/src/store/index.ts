import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice';
import { progressSlice } from './slices/progressSlice';
import { syncSlice } from './slices/syncSlice';
import { userProfileSlice } from './slices/userProfileSlice';
import { initPersistence } from './persistence';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    progress: progressSlice.reducer,
    sync: syncSlice.reducer,
    userProfile: userProfileSlice.reducer,
  },
});

/** Load persisted state from IndexedDB and subscribe to save changes. Call once after creating store. */
export function initStorePersistence(): Promise<void> {
  return initPersistence(store);
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { authSlice, progressSlice, syncSlice, userProfileSlice };
