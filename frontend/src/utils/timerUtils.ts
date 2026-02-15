import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Formats elapsed seconds as M:SS (e.g. 0:00, 1:05, 12:34).
 */
export function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export interface AttemptTimerResult {
  /** Elapsed seconds since start. */
  elapsedSeconds: number;
  /** Formatted string for display (e.g. "0:00"). */
  formatted: string;
  /** Start the timer (no-op if already running). */
  start: () => void;
  /** Stop the timer. */
  stop: () => void;
  /** True while the timer is running. */
  isRunning: boolean;
  /** Reset to 0 and stopped (e.g. for next question). */
  reset: () => void;
}

/**
 * Hook for a per-attempt timer: start when attempt begins, stop on submit.
 * Exposes elapsed time and start/stop/reset for the component to render.
 */
export function useAttemptTimer(): AttemptTimerResult {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (intervalRef.current != null) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setElapsedSeconds(0);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current != null) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    elapsedSeconds,
    formatted: formatElapsed(elapsedSeconds),
    start,
    stop,
    isRunning,
    reset,
  };
}
