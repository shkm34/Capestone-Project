import { createSlice } from '@reduxjs/toolkit';

export type ToastKind = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  message: string;
  kind: ToastKind;
}

export interface ToastState {
  items: Toast[];
}

const initialState: ToastState = {
  items: [],
};

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (
      state,
      action: { payload: { message: string; kind?: ToastKind; id?: string } },
    ) => {
      const { message, kind = 'info', id } = action.payload;
      const toastId = id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      state.items.push({ id: toastId, message, kind });
    },
    removeToast: (state, action: { payload: string }) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    clearToasts: (state) => {
      state.items = [];
    },
  },
});

export const { addToast, removeToast, clearToasts } = toastSlice.actions;

