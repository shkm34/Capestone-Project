import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { removeToast } from '../store/slices/toastSlice';

const AUTO_DISMISS_MS = 3000;

export const ToastContainer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const toasts = useSelector((s: RootState) => s.toast.items);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((t) =>
      setTimeout(() => {
        dispatch(removeToast(t.id));
      }, AUTO_DISMISS_MS),
    );

    return () => {
      timers.forEach((id) => clearTimeout(id));
    };
  }, [dispatch, toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs sm:max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-xl px-4 py-2 text-sm shadow-lg border ${
            t.kind === 'success'
              ? 'bg-emerald-900/90 border-emerald-500/70 text-emerald-50'
              : t.kind === 'warning'
              ? 'bg-amber-900/90 border-amber-500/70 text-amber-50'
              : t.kind === 'error'
              ? 'bg-red-900/90 border-red-500/70 text-red-50'
              : 'bg-slate-900/90 border-slate-600/70 text-slate-50'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
};

