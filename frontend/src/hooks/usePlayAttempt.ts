import { useCallback, useState } from 'react';
import { useAttemptTimer } from '../utils/timerUtils';

interface UsePlayAttemptResult {
  attemptStarted: boolean;
  timerFormatted: string;
  handleStartAttempt: () => void;
  createSubmitHandler: (
    submit: (event: React.FormEvent<HTMLFormElement>, timeTakenMs?: number) => void,
  ) => (event: React.FormEvent<HTMLFormElement>) => void;
}

/**
 * Encapsulates attempt/timer lifecycle for the daily game:
 * - Marks attempt as started and begins timing when the player starts
 * - Wraps the submit handler to include elapsed time in milliseconds
 */
export function usePlayAttempt(): UsePlayAttemptResult {
  const [attemptStarted, setAttemptStarted] = useState(false);
  const timer = useAttemptTimer();

  const handleStartAttempt = useCallback(() => {
    setAttemptStarted(true);
    timer.start();
  }, [timer]);

  const createSubmitHandler: UsePlayAttemptResult['createSubmitHandler'] = useCallback(
    (submit) =>
      (event) => {
        submit(event, timer.elapsedSeconds * 1000);
        timer.stop();
      },
    [timer],
  );

  return {
    attemptStarted,
    timerFormatted: timer.formatted,
    handleStartAttempt,
    createSubmitHandler,
  };
}

